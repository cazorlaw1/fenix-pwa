// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas de tu aplicación
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PendingApproval from './pages/PendingApproval';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import AdminModule from './pages/AdminModule';
import Vendedores from './pages/Vendedores';
import SalesModule from './pages/SalesModule';

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

// Guardián de Rutas Robusto (detecta rol plano o anidado en profile)
function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        <p>Cargando sistema...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Extraer el rol y el estado considerando posibles estructuras (user o profile)
  const userRole = (user?.role || profile?.role || '').toLowerCase().trim();
  const isActive = user?.is_active ?? profile?.is_active ?? true;

  // 1. Verificación de cuenta suspendida o inactiva (Bloqueo total sin botones)
  if (isActive === false || userRole === 'suspendido') {
    return <SuspendedAccountView />;
  }

  // 2. Verificación de cuenta pendiente
  if (userRole === 'pendiente' || !userRole) {
    return <Navigate to="/pending" replace />;
  }

  // 3. Validación estricta de roles permitidos para el módulo
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Unauthorized />;
  }

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