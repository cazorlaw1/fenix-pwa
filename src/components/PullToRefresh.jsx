// src/components/PullToRefresh.jsx
import React, { useState, useEffect } from 'react';

export default function PullToRefresh({ children }) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 80; // Píxeles necesarios para disparar la recarga

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Solo activamos si estamos en el tope de la página (scrollTop === 0)
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (!startY) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Si desliza hacia abajo desde el tope
      if (distance > 0 && window.scrollY === 0) {
        // Aplicamos una pequeña resistencia matemática para que no sea tan brusco
        setPullDistance(Math.min(distance * 0.4, 120));
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!startY) return;

      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true);
        // Recargamos la página completa o ejecutamos un refetch global
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
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Indicador visual superior que aparece al arrastrar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: `${pullDistance}px`,
          maxHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1c1917',
          color: '#D4AF37', // Color dorado acorde al diseño
          overflow: 'hidden',
          transition: pullDistance === 0 ? 'height 0.3s ease' : 'none',
          zIndex: 99999,
          boxShadow: pullDistance > 0 ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 'bold',
            opacity: pullDistance > 30 ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          {/* Tu SVG de engranaje integrado */}
          <svg
            id="gearSvg"
            width="36"
            height="36"
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
            className={refreshing ? 'animate-spin' : ''}
            style={{
              transform: `rotate(${pullDistance * 3}deg)`,
              transition: pullDistance === 0 ? 'transform 0.3s' : 'none',
            }}
          >
            <defs>
              <linearGradient id="fireGrad" x1="0" y1="0" x2="70.71067811865476%" y2="70.71067811865474%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="65%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path
              d="M 236.77 135.32 L 259.27 137.36 L 259.27 162.64 L 236.77 164.68 L 232.48 180.67 L 250.95 193.69 L 238.31 215.58 L 217.81 206.09 L 206.09 217.81 L 215.58 238.31 L 193.69 250.95 L 180.67 232.48 L 164.68 236.77 L 162.64 259.27 L 137.36 259.27 L 135.32 236.77 L 119.33 232.48 L 106.31 250.95 L 84.42 238.31 L 93.91 217.81 L 82.19 206.09 L 61.69 215.58 L 49.05 193.69 L 67.52 180.67 L 63.23 164.68 L 40.73 162.64 L 40.73 137.36 L 63.23 135.32 L 67.52 119.33 L 49.05 106.31 L 61.69 84.42 L 82.19 93.91 L 93.91 82.19 L 84.42 61.69 L 106.31 49.05 L 119.33 67.52 L 135.32 63.23 L 137.36 40.73 L 162.64 40.73 L 164.68 63.23 L 180.67 67.52 L 193.69 49.05 L 215.58 61.69 L 206.09 82.19 L 217.81 93.91 L 238.31 84.42 L 250.95 106.31 L 232.48 119.33 L 236.77 135.32 M 205 150 A 55 55 0 1 0 95 150 A 55 55 0 1 0 205 150"
              fill="url(#fireGrad)"
              fillRule="evenodd"
              stroke="#000000"
              strokeWidth="2.5"
              filter="url(#glow)"
            />
          </svg>
          <span>
            {refreshing
              ? 'Actualizando Fenix...'
              : pullDistance >= threshold
              ? 'Suelta para actualizar'
              : 'Desliza hacia abajo'}
          </span>
        </div>
      </div>

      {/* Contenido principal de la aplicación */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}