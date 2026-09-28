// src/components/Header.jsx
import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ onOpenMobileMenu }) {
  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '10px 24px',
        width: '100%',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {/* Logotipo real (logo.png) y Nombre de la App: Fenix WebSite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#000000',
              padding: '5px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #d4af37', // Marco dorado en el borde exterior
            }}
          >
            <img
              src="/logo.png"
              alt="Fenix Logo"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain', // Cambiado a contain para evitar recortes
                borderRadius: '6px',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.3px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Fenix WebSite
          </span>
        </div>

        {/* Botón hamburguesa visible exclusivamente en móviles */}
        <button
          type="button"
          className="mobile-menu-trigger-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenMobileMenu) {
              onOpenMobileMenu();
            }
          }}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#374151',
            padding: '8px',
            borderRadius: '6px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Abrir Menú"
        >
          <Menu size={24} />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-trigger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
