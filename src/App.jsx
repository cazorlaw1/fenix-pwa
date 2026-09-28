// src/App.jsx
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNavigation from './components/MobileNavigation';

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
      {/* Sidebar de Escritorio */}
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
          }}
        >
          {children}
        </main>
      </div>

      {/* Menú Lateral Desplegable en Móvil */}
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
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pending" element={<PendingApproval />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardWrapper />} />
            <Route
              path="/inventario"
              element={
                <Layout>
                  <Inventory />
                </Layout>
              }
            />
            <Route
              path="/usuarios"
              element={
                <Layout>
                  <Users />
                </Layout>
              }
            />
            <Route
              path="/administrativo"
              element={
                <Layout>
                  <AdminModule />
                </Layout>
              }
            />
            <Route path="/vendedores" element={<VendedoresWrapper />} />
            <Route
              path="/ventas"
              element={
                <Layout>
                  <SalesModule />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
