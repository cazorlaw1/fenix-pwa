// src/components/PullToRefresh.jsx
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

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
          maxHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1c1917',
          color: '#D4AF37', // Color dorado acorde al diseño de Fenix
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
            className={refreshing ? 'animate-spin' : ''}
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