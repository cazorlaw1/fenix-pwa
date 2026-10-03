// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { supabase } from './supabaseClient';

// Importación de componentes
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import PendingApproval from './components/PendingApproval';
import Profile from './components/Profile';
import Users from './components/Users';
import Inventory from './components/Inventory';
import AdminModule from './components/AdminModule';
import Vendedores from './components/Vendedores';
import SalesModule from './components/SalesModule';

// Pantalla en negro para Acceso No Autorizado (Con botón de redirección)
function Unauthorized() {
  return (
    <div style={{
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ fontSize: '56px', marginBottom: '20px' }}>🚫</div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#f87171' }}>
        Acceso Restringido
      </h1>
      <p style={{ color: '#9ca3af', maxWidth: '420px', marginBottom: '24px', fontSize: '15px', lineHeight: '1.5' }}>
        No cuentas con los permisos necesarios para visualizar este módulo dentro del sistema.
      </p>
      <a 
        href="/dashboard" 
        style={{
          backgroundColor: '#dc2626',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
        }}
      >
        Volver al Panel Principal
      </a>
    </div>
  );
}

// Pantalla en negro para Cuenta Suspendida (SIN BOTÓN, exige hablar con Admin)
function SuspendedAccountView() {
  return (
    <div style={{
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ fontSize: '56px', marginBottom: '20px' }}>⚠️</div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#ef4444' }}>
        Cuenta Suspendida o Inactiva
      </h1>
      <p style={{ color: '#9ca3af', maxWidth: '440px', fontSize: '15px', lineHeight: '1.6' }}>
        Tu cuenta se encuentra actualmente suspendida o inactiva en el sistema. No posees acceso a ninguna sección ni funcionalidad. Debes hablar directamente con un <strong style={{ color: '#ffffff' }}>administrador</strong> para solucionar tu estatus.
      </p>
    </div>
  );
}

// Componente protector de rutas consultando directamente la base de datos
function RoleProtectedRoute({ allowedRoles, children }) {
  const [loading, setLoading] = useState(true);
  const [statusType, setStatusType] = useState('ok'); // 'ok' | 'unauthorized' | 'suspended' | 'pending' | 'login'

  useEffect(() => {
    async function checkUserAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setStatusType('login');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !data) {
          setStatusType('pending');
          setLoading(false);
          return;
        }

        const currentRole = data.role ? data.role.toLowerCase().trim() : '';
        const isMaestro = currentRole === 'maestro';

        // 1. Validar si está inactivo o suspendido
        if ((data.is_active === false || currentRole === 'suspendido') && !isMaestro) {
          setStatusType('suspended');
          setLoading(false);
          return;
        }

        // 2. Validar si está pendiente de aprobación
        if ((!data.is_active || !data.role || currentRole === 'pendiente') && !isMaestro) {
          setStatusType('pending');
          setLoading(false);
          return;
        }

        // 3. Validar si el rol actual tiene permiso para el módulo
        if (isMaestro || allowedRoles.includes(currentRole)) {
          setStatusType('ok');
        } else {
          setStatusType('unauthorized');
        }

      } catch (err) {
        console.error('Error validando permisos:', err);
        setStatusType('login');
      } finally {
        setLoading(false);
      }
    }

    checkUserAccess();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        <p>Cargando permisos del sistema...</p>
      </div>
    );
  }

  if (statusType === 'login') return <Navigate to="/login" replace />;
  if (statusType === 'pending') return <Navigate to="/pending" replace />;
  if (statusType === 'suspended') return <SuspendedAccountView />;
  if (statusType === 'unauthorized') return <Unauthorized />;

  return children;
}

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => console.error(err));
      });
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pending" element={<PendingApproval />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard: Todos los roles activos */}
          <Route 
            path="/dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'supervisor', 'vendedor', 'stock']}>
                <Dashboard />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Inventario: Solo Administrador y Stock */}
          <Route
            path="/inventario"
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'stock']}>
                <Inventory />
              </RoleProtectedRoute>
            }
          />
          
          {/* Usuarios: Solo Administrador */}
          <Route
            path="/usuarios"
            element={
              <RoleProtectedRoute allowedRoles={['administrador']}>
                <Users />
              </RoleProtectedRoute>
            }
          />
          
          {/* Módulo Administrativo: Solo Administrador */}
          <Route
            path="/administrativo"
            element={
              <RoleProtectedRoute allowedRoles={['administrador']}>
                <AdminModule />
              </RoleProtectedRoute>
            }
          />
          
          {/* Vendedores / Comisiones: Admin, Gerente, Supervisor */}
          <Route 
            path="/vendedores" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'supervisor']}>
                <Vendedores />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Ventas: Admin, Gerente, Supervisor, Vendedor */}
          <Route
            path="/ventas"
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'supervisor', 'vendedor']}>
                <SalesModule />
              </RoleProtectedRoute>
            }
          />
          
          {/* Perfil: Todos los roles activos */}
          <Route
            path="/profile"
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'supervisor', 'vendedor', 'stock']}>
                <Profile />
              </RoleProtectedRoute>
            }
          />

          {/* Ruta Comodín */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}