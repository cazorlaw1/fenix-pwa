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
import { RefreshCw } from 'lucide-react';

// Páginas
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PendingApproval from './pages/PendingApproval';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import AdminModule from './pages/AdminModule';
import Vendedores from './pages/Vendedores';
import SalesModule from './pages/SalesModule';

// Componente Pull-to-Refresh para móviles
function PullToRefreshContainer({ children }) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 80;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (!startY) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance * 0.4, 120));
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!startY) return;

      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true);
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        setPullDistance(0);
      }
      setStartY(0);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, refreshing]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: `${pullDistance}px`,
          maxHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1c1917',
          color: '#D4AF37',
          overflow: 'hidden',
          transition: pullDistance === 0 ? 'height 0.3s ease' : 'none',
          zIndex: 99999,
          boxShadow: pullDistance > 0 ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            opacity: pullDistance > 30 ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <RefreshCw
            size={18}
            style={{
              transform: `rotate(${pullDistance * 3}deg)`,
              transition: pullDistance === 0 ? 'transform 0.3s' : 'none',
            }}
          />
          <span>
            {refreshing
              ? 'Actualizando Fenix...'
              : pullDistance >= threshold
              ? 'Suelta para actualizar'
              : 'Desliza hacia abajo'}
          </span>
        </div>
      </div>

      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Pantalla en negro para Acceso No Autorizado (Con botón)
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

// Pantalla en negro para Cuenta Suspendida (SIN BOTÓN)
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

// Componente interno para manejar el callback de Google y evitar pantalla blanca
function AuthCallback() {
  const navigate = useNavigate();
  const { fetchProfile } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.error('Error en callback de auth:', error);
          navigate('/login');
          return;
        }

        const userProfile = await fetchProfile(session.user.id);
        
        if (userProfile?.role === 'pendiente' || !userProfile?.role) {
          navigate('/pending');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Error procesando callback:', err);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, fetchProfile]);

  return (
    <div style={{ 
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <p>Verificando credenciales del sistema...</p>
    </div>
  );
}

// Componente protector de rutas
function RoleProtectedRoute({ allowedRoles }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    async function verifyUserExists() {
      if (!user) {
        setChecking(false);
        return;
      }

      if (profile && profile.role) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (error || !data) {
          await supabase.auth.signOut();
          setProfileMissing(true);
        }
      } catch (err) {
        console.error('Error verificando existencia de perfil:', err);
      } finally {
        setChecking(false);
      }
    }

    if (!authLoading) {
      verifyUserExists();
    }
  }, [user, profile, authLoading]);

  if (authLoading || checking) {
    return (
      <div style={{ backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        <p>Cargando sistema...</p>
      </div>
    );
  }

  if (!user || profileMissing) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = (profile?.role || user?.role || '').toLowerCase().trim();
  const isActive = profile?.is_active ?? user?.is_active ?? true;

  if (isActive === false || currentRole === 'suspendido') {
    return <SuspendedAccountView />;
  }

  if (currentRole === 'pendiente' || !currentRole) {
    return <Navigate to="/pending" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Unauthorized />;
  }

  return null;
}

function Layout({ children, activeTab, setActiveTab }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: '#f9fafb',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div className="desktop-sidebar-wrapper">
        <Sidebar />
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: '0',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={handleOpenMobileMenu}
        />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ width: '100%', flex: 1, paddingBottom: '24px' }}>
            {children}
          </div>
        </main>
      </div>
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
      />
      <style>{`
        * {
          box-sizing: border-box;
        }
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        @media (max-width: 768px) {
          .desktop-sidebar-wrapper { display: none !important; }
        }
        @media (min-width: 769px) {
          .desktop-sidebar-wrapper { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function DashboardWrapper() {
  const [activeTab, setActiveTab] = useState('administrador');
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Dashboard overrideRole={activeTab} />
    </Layout>
  );
}

function VendedoresWrapper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleSelectSellerHistory = (vendedor) => {
    navigate(`/ventas/historial?sellerId=${vendedor.id}`);
  };
  return (
    <Layout>
      <Vendedores
        currentUser={user || { id: '', role: 'vendedor' }}
        onSelectSellerHistory={handleSelectSellerHistory}
      />
    </Layout>
  );
}

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('Service Worker registrado con éxito:', reg.scope))
          .catch((err) => console.error('Error al registrar Service Worker:', err));
      });
    }
  }, []);

  return (
    <AuthProvider>
      <PullToRefreshContainer>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/pending" element={<PendingApproval />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route 
              path="/dashboard" 
              element={
                <>
                  <RoleProtectedRoute allowedRoles={['administrador', 'tecnico', 'gerente', 'supervisor', 'vendedor', 'stock']} />
                  <DashboardWrapper />
                </>
              } 
            />

            <Route
              path="/inventario"
              element={
                <>
                  <RoleProtectedRoute allowedRoles={['administrador', 'tecnico', 'gerente', 'supervisor', 'vendedor', 'stock']} />
                  <Layout><Inventory /></Layout>
                </>
              }
            />

            <Route
              path="/usuarios"
              element={
                <>
                  <RoleProtectedRoute allowedRoles={['administrador', 'tecnico']} />
                  <Layout><Users /></Layout>
                </>
              }
            />

            <Route
              path="/administrativo"
              element={
                <>
                  <RoleProtectedRoute allowedRoles={['administrador', 'tecnico']} />
                  <Layout><AdminModule /></Layout>
                </>
              }
            />

            <Route 
              path="/vendedores" 
              element={
                <>
                  <RoleProtectedRoute allowedRoles={['administrador', 'tecnico', 'gerente', 'supervisor']} />
                  <VendedoresWrapper />
                </>
              } 
            />

            <Route
              path="/ventas"
              element={
                <>
                  <RoleProtectedRoute allowedRoles={['administrador', 'tecnico', 'gerente', 'supervisor', 'vendedor']} />
                  <Layout><SalesModule /></Layout>
                </>
              }
            />

            <Route
              path="/profile"
              element={
                <>
                  <RoleProtectedRoute allowedRoles={['administrador', 'tecnico', 'gerente', 'supervisor', 'vendedor', 'stock']} />
                  <Layout><Profile /></Layout>
                </>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </PullToRefreshContainer>
    </AuthProvider>
  );
}