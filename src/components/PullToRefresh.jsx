// src/components/PullToRefresh.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';

export default function PullToRefresh({ children }) {
  const [startY, setStartY] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 80;
  const rootRef = useRef(null);

  useEffect(() => {
    // Detecta automáticamente el contenedor padre que tiene scroll vertical (el <main>)
    const findScrollParent = (node) => {
      let curr = node?.parentElement;
      while (curr) {
        const style = window.getComputedStyle(curr);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return curr;
        }
        curr = curr.parentElement;
      }
      return window;
    };

    const scrollContainer = findScrollParent(rootRef.current);
    if (!scrollContainer) return;

    const getScrollTop = () => {
      return scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
    };

    const handleTouchStart = (e) => {
      // Solo se activa si estamos estrictamente en el tope superior (scrollTop === 0)
      if (getScrollTop() === 0) {
        setStartY(e.touches[0].clientY);
      } else {
        setStartY(null);
      }
    };

    const handleTouchMove = (e) => {
      if (startY === null) return;

      // Si el usuario hizo scroll hacia abajo mientras arrastraba, cancelamos
      if (getScrollTop() > 0) {
        setPullDistance(0);
        setStartY(null);
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Solo responde si se desliza hacia abajo y estamos arriba
      if (distance > 0) {
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

    const target = scrollContainer === window ? window : scrollContainer;
    target.addEventListener('touchstart', handleTouchStart, { passive: true });
    target.addEventListener('touchmove', handleTouchMove, { passive: true });
    target.addEventListener('touchend', handleTouchEnd);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, refreshing]);

  return (
    <div ref={rootRef} style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
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