// src/components/MobileNavigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Package,
  Users as UsersIcon,
  FileText,
  TrendingUp,
  ShoppingCart,
  User,
} from 'lucide-react';

export default function MobileNavigation({ isOpen, onClose }) {
  if (!isOpen) return null;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventario', label: 'Inventario', icon: Package },
    { to: '/usuarios', label: 'Usuarios', icon: UsersIcon },
    { to: '/administrativo', label: 'Administrativo', icon: FileText },
    { to: '/vendedores', label: 'Vendedores', icon: TrendingUp },
    { to: '/ventas', label: 'Ventas', icon: ShoppingCart },
    { to: '/profile', label: 'Mi Perfil', icon: User },
  ];

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
      </aside>
    </div>
  );
}
