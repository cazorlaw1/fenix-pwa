// src/components/MobileNavigation.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  X,
  LayoutDashboard,
  Package,
  Users as UsersIcon,
  FileText,
  TrendingUp,
  ShoppingCart,
  User,
  LogOut,
} from 'lucide-react';

export default function MobileNavigation({ isOpen, onClose }) {
  const { profile, signOut } = useAuth() || {};
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    if (signOut) {
      await signOut();
    }
    navigate('/login');
  };

  if (!isOpen) return null;

  // Todos los ítems del menú con el rol 'tecnico' incluido en todos ellos
  const allNavItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['administrador', 'gerente', 'supervisor', 'vendedor', 'tecnico'],
    },
    {
      to: '/inventario',
      label: 'Inventario',
      icon: Package,
      roles: ['administrador', 'stock', 'tecnico'],
    },
    {
      to: '/usuarios',
      label: 'Usuarios',
      icon: UsersIcon,
      roles: ['administrador', 'gerente', 'tecnico'],
    },
    {
      to: '/administrativo',
      label: 'Administrativo',
      icon: FileText,
      roles: ['administrador', 'gerente', 'tecnico'],
    },
    {
      to: '/vendedores',
      label: 'Vendedores',
      icon: TrendingUp,
      roles: ['administrador', 'gerente', 'supervisor', 'tecnico'],
    },
    {
      to: '/ventas',
      label: 'Ventas',
      icon: ShoppingCart,
      roles: ['administrador', 'gerente', 'supervisor', 'vendedor', 'tecnico'],
    },
    {
      to: '/profile',
      label: 'Mi Perfil',
      icon: User,
      roles: ['administrador', 'gerente', 'supervisor', 'vendedor', 'stock', 'tecnico'],
    },
  ];

  // Obtener el rol del usuario, normalizar a minúsculas y sin espacios
  const userRole = (profile?.role || 'Administrador')
    .toString()
    .toLowerCase()
    .trim();

  // Filtrar ítems según el rol del usuario
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div
      className="mobile-drawer-container"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Fondo translúcido */}
      <div
        className="mobile-drawer-overlay"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel lateral derecho */}
      <aside
        className="mobile-drawer-content"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '80vw',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100000,
        }}
      >
        {/* Encabezado del menú móvil */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <span
            style={{ fontWeight: 600, fontSize: '1.125rem', color: '#111827' }}
          >
            Menú
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navegación filtrada por rol */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
            gap: '4px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: isActive ? '#111827' : '#4b5563',
                  backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '500',
                })}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #f3f4f6',
            backgroundColor: '#f9fafb',
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
}