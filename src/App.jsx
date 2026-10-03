// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNavigation from './components/MobileNavigation';
import { supabase } from './lib/supabase';

// Páginas (Asegúrate de que las rutas de importación coincidan con tu estructura)
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PendingApproval from './pages/PendingApproval';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import AdminModule from './pages/AdminModule';
import Vendedores from './pages/Vendedores';
import SalesModule from './pages/SalesModule';

// Componente para pantalla de suspensión total (Fondo negro, sin botones)
function SuspendedScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
      zIndex: 9999
    }}>
      <div style={{ fontSize: '56px', marginBottom: '20px' }}>🚫</div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px', color: '#f87171' }}>
        Cuenta Suspendida
      </h1>
      <p style={{ fontSize: '16px', color: '#9ca3af', maxWidth: '450px', lineHeight: '1.5' }}>
        Lo sentimos, tu cuenta ha sido suspendida. No tienes acceso a ningún módulo del sistema. Por favor, comunícate con un administrador para más información.
      </p>
    </div>
  );
}

// Componente para acceso denegado por rol (Pantalla en negro con alerta y botón de redirección)
function UnauthorizedScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>
        Acceso No Autorizado
      </h2>
      <p style={{ fontSize: '15px', color: '#9ca3af', maxWidth: '400px', marginBottom: '24px', lineHeight: '1.5' }}>
        No tienes los permisos necesarios para acceder a este módulo del sistema.
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
          transition: 'background-color 0.2s',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
        }}
      >
        Volver al Inicio
      </a>
    </div>
  );
}

// Layout principal para pantallas protegidas con barra lateral y cabecera
function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-950">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}

// Componente de Ruta Protegida con validación exhaustiva de Estados y Roles
function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
        <p>Cargando información de sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 1. Validar si el usuario está suspendido (Bloqueo total sin botón)
  if (user.role === 'suspendido' || user.status === 'suspendido') {
    return <SuspendedScreen />;
  }

  // 2. Si el usuario está pendiente de aprobación
  if (user.role === 'pendiente' || !user.role) {
    return <Navigate to="/pending" replace />;
  }

  // 3. Validar si el rol actual está dentro de los permitidos para la ruta
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <UnauthorizedScreen />;
  }

  return children;
}

// Callbacks y Wrappers auxiliares si los utilizas en tu app
function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
      else navigate('/login');
    });
  }, [navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <p>Autenticando...</p>
    </div>
  );
}

function DashboardWrapper() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

function VendedoresWrapper() {
  return (
    <Layout>
      <Vendedores />
    </Layout>
  );
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
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard (Acceso general para roles activos) */}
          <Route 
            path="/dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'supervisor', 'vendedor', 'stock']}>
                <DashboardWrapper />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Módulo de Inventario */}
          <Route
            path="/inventario"
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'stock']}>
                <Layout><Inventory /></Layout>
              </RoleProtectedRoute>
            }
          />
          
          {/* Módulo de Usuarios */}
          <Route
            path="/usuarios"
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente']}>
                <Layout><Users /></Layout>
              </RoleProtectedRoute>
            }
          />
          
          {/* Módulo Administrativo */}
          <Route
            path="/administrativo"
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente']}>
                <Layout><AdminModule /></Layout>
              </RoleProtectedRoute>
            }
          />
          
          {/* Módulo de Vendedores */}
          <Route 
            path="/vendedores" 
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'supervisor']}>
                <VendedoresWrapper />
              </RoleProtectedRoute>
            } 
          />
          
          {/* Módulo de Ventas */}
          <Route
            path="/ventas"
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'supervisor', 'vendedor']}>
                <Layout><SalesModule /></Layout>
              </RoleProtectedRoute>
            }
          />
          
          {/* Perfil de Usuario */}
          <Route
            path="/profile"
            element={
              <RoleProtectedRoute allowedRoles={['administrador', 'gerente', 'supervisor', 'vendedor', 'stock']}>
                <Layout><Profile /></Layout>
              </RoleProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}