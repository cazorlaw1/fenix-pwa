import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const role = profile?.role?.toLowerCase() || 'vendedor';

  const isTechOrAdmin = role === 'tecnico' || role === 'administrador';
  const isManagerOrAbove =
    isTechOrAdmin || role === 'gerente' || role === 'supervisor';
  const isStock = role === 'stock';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#1c1917', // Dorado Oscuro / Carbón
        borderRight: '1px solid #292524',
        height: '100vh',
        padding: '24px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* 3.1 Dashboards */}
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

        {/* 3.2 Inventario */}
        <NavLink to="/inventario" style={linkStyle}>
  Inventario
</NavLink>
        )}

        {/* 3.3 Usuarios */}
        {isTechOrAdmin && (
          <NavLink to="/usuarios" style={linkStyle}>
            Usuarios
          </NavLink>
        )}

        {/* 3.4 Módulo Administrativo */}
        {isTechOrAdmin && (
          <NavLink to="/administrativo" style={linkStyle}>
            Administrativo
          </NavLink>
        )}

        {/* 3.5 Vendedores */}
        {isManagerOrAbove && (
          <NavLink to="/vendedores" style={linkStyle}>
            Vendedores
          </NavLink>
        )}

        {/* 3.6 Ventas */}
        {!isStock && (
          <NavLink to="/ventas" style={linkStyle}>
            Ventas
          </NavLink>
        )}

        <NavLink to="/profile" style={linkStyle}>
          Mi Perfil
        </NavLink>
      </nav>

      {/* Botón Salir */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#292524',
          color: '#f87171',
          border: '1px solid #44403c',
          borderRadius: '8px',
          fontWeight: '700',
          fontSize: '13px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        🚪 Cerrar Sesión
      </button>
    </aside>
  );
}

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: isActive ? '700' : '500',
  color: isActive ? '#1c1917' : '#d6d3d1',
  backgroundColor: isActive ? '#D4AF37' : 'transparent',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
});
