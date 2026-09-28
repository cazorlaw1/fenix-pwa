import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, signOut } = useAuth() || {};
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsMenuOpen(false);
    if (signOut) {
      await signOut();
    }
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  // Estilos de pestañas para Escritorio
  const desktopLinkStyle = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
      isActive
        ? 'bg-red-600 text-white shadow'
        : 'text-zinc-700 hover:bg-zinc-100 hover:text-red-600'
    }`;

  // Estilos de elementos para el Menú Móvil Desplegable
  const mobileLinkStyle = ({ isActive }) =>
    `px-4 py-3 rounded-xl text-sm font-bold transition-all uppercase tracking-wide flex items-center justify-between w-full ${
      isActive
        ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
        : 'text-zinc-800 hover:bg-zinc-100 hover:text-red-600'
    }`;

  return (
    <>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* LOGO FÉNIX */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-amber-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                F
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg text-zinc-900 leading-tight">
                  FENIX{' '}
                  <span className="text-red-600 font-extrabold text-xs">
                    WEBSITE
                  </span>
                </span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                  Sistema de Gestión
                </span>
              </div>
            </div>

            {/* MENÚ ESCRITORIO (Visible únicamente en md:) */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/dashboard" className={desktopLinkStyle}>
                Inicio
              </NavLink>
              <NavLink to="/inventario" className={desktopLinkStyle}>
                Inventario
              </NavLink>
              <NavLink to="/usuarios" className={desktopLinkStyle}>
                Usuarios
              </NavLink>
              <NavLink to="/administrativo" className={desktopLinkStyle}>
                Admin
              </NavLink>
              <NavLink to="/vendedores" className={desktopLinkStyle}>
                Vendedores
              </NavLink>
              <NavLink to="/ventas" className={desktopLinkStyle}>
                Ventas
              </NavLink>
              <NavLink to="/perfil" className={desktopLinkStyle}>
                Perfil
              </NavLink>
            </nav>

            {/* ZONA DERECHA: USUARIO & ICONO MENÚ MÓVIL */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-900 leading-tight">
                  {profile?.full_name || 'Wilmer cazorla'}
                </p>
                <span className="text-[10px] font-semibold text-amber-600 capitalize">
                  {profile?.role || 'Administrador'}
                </span>
              </div>

              {/* Botón Cerrar Sesión (Escritorio) */}
              <button
                onClick={handleLogout}
                className="hidden md:block px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Cerrar Sesión
              </button>

              {/* BOTÓN DE MENÚ (Solo en Móvil - Parte Superior Derecha) */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="md:hidden p-2 rounded-xl text-zinc-800 hover:text-red-600 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              >
                {isMenuOpen ? (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* OVERLAY CORRESPONDIENTE */}
      {isMenuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 md:hidden"
        />
      )}

      {/* PANLE LATERAL MÓVIL (DESPLIEGUE DESDE LA DERECHA) */}
      <aside
        className={`fixed top-0 right-0 w-72 h-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
            <span className="font-extrabold text-zinc-900 tracking-wide text-xs uppercase">
              Menú Principal
            </span>
            <button
              onClick={closeMenu}
              className="p-1 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-zinc-200/50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="p-4 space-y-2">
            <NavLink
              to="/dashboard"
              onClick={closeMenu}
              className={mobileLinkStyle}
            >
              <span>Inicio</span>
              <span className="text-xs text-zinc-400">➔</span>
            </NavLink>
            <NavLink
              to="/inventario"
              onClick={closeMenu}
              className={mobileLinkStyle}
            >
              <span>Inventario</span>
              <span className="text-xs text-zinc-400">➔</span>
            </NavLink>
            <NavLink
              to="/usuarios"
              onClick={closeMenu}
              className={mobileLinkStyle}
            >
              <span>Usuarios</span>
              <span className="text-xs text-zinc-400">➔</span>
            </NavLink>
            <NavLink
              to="/administrativo"
              onClick={closeMenu}
              className={mobileLinkStyle}
            >
              <span>Administrativo</span>
              <span className="text-xs text-zinc-400">➔</span>
            </NavLink>
            <NavLink
              to="/vendedores"
              onClick={closeMenu}
              className={mobileLinkStyle}
            >
              <span>Vendedores</span>
              <span className="text-xs text-zinc-400">➔</span>
            </NavLink>
            <NavLink
              to="/ventas"
              onClick={closeMenu}
              className={mobileLinkStyle}
            >
              <span>Ventas</span>
              <span className="text-xs text-zinc-400">➔</span>
            </NavLink>
            <NavLink
              to="/perfil"
              onClick={closeMenu}
              className={mobileLinkStyle}
            >
              <span>Mi Perfil</span>
              <span className="text-xs text-zinc-400">➔</span>
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50">
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-600/20"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
