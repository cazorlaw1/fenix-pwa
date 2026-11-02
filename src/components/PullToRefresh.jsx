// src/components/PullToRefresh.jsx
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

export default function PullToRefresh({ children, scrollableRef }) {
  const [startY, setStartY] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 80; // Píxeles necesarios para disparar la recarga

  useEffect(() => {
    const scrollContainer = scrollableRef?.current;
    if (!scrollContainer) return;

    const handleTouchStart = (e) => {
      // Verificamos estrictamente que estemos en el tope superior absoluto (scrollTop === 0)
      if (scrollContainer.scrollTop === 0) {
        setStartY(e.touches[0].clientY);
      } else {
        setStartY(null); // Si no estamos arriba, ignoramos el gesto
      }
    };

    const handleTouchMove = (e) => {
      // Si no se inició arriba del todo, no hacemos nada
      if (startY === null) return;

      // Doble comprobación por si el usuario hizo scroll durante el toque
      if (scrollContainer.scrollTop > 0) {
        setPullDistance(0);
        setStartY(null);
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Solo permitimos el gesto si se desliza hacia abajo (distance > 0) y estamos arriba
      if (distance > 0) {
        // Aplicamos resistencia para que el movimiento sea suave
        setPullDistance(Math.min(distance * 0.4, 120));
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (startY === null) return;

      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true);
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        setPullDistance(0);
      }
      setStartY(null);
    };

    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    scrollContainer.addEventListener('touchend', handleTouchEnd);

    return () => {
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, refreshing, scrollableRef]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* Indicador visual superior */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${pullDistance}px`,
          maxHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1c1917',
          color: '#D4AF37',
          overflow: 'hidden',
          transition: pullDistance === 0 ? 'height 0.3s ease' : 'none',
          zIndex: 99,
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
          <Settings
            size={20}
            className={refreshing ? 'animate-spin' : ''}
            style={{
              color: '#D4AF37',
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

      {/* Contenido principal */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}