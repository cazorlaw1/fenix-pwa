import React, { createContext, useContext, useState, useRef } from 'react';
import cargandoGif from '../assets/cargando.gif';

const LoaderContext = createContext();

export let globalShowLoader = () => {};
export let globalHideLoader = () => {};

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Cargando...");
  
  // Referencias para controlar el tiempo en pantalla y evitar parpadeos
  const showTimestamp = useRef(0);
  const hideTimeoutRef = useRef(null);

  const showLoader = (msg = "Cargando...") => {
    // Si había un cierre pendiente, lo cancelamos
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setMessage(msg);
    showTimestamp.current = Date.now();
    setLoading(true);
  };

  const hideLoader = () => {
    const elapsed = Date.now() - showTimestamp.current;
    const minDisplayTime = 500; // Mantiene el loader visible al menos 500ms para evitar parpadeos

    if (elapsed < minDisplayTime) {
      // Si la petición fue demasiado rápida, esperamos lo que falta para cumplir los 500ms
      hideTimeoutRef.current = setTimeout(() => {
        setLoading(false);
      }, minDisplayTime - elapsed);
    } else {
      setLoading(false);
    }
  };

  globalShowLoader = showLoader;
  globalHideLoader = hideLoader;

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          color: '#ffffff',
          fontFamily: 'sans-serif',
          gap: '16px',
          userSelect: 'none'
        }}>
          <img 
            src={cargandoGif} 
            alt="Cargando" 
            style={{ width: '180px', height: '180px', objectFit: 'contain' }} 
          />
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
          }}>
            {message}
          </span>
        </div>
      )}
    </LoaderContext.Provider>
  );
}

export const useLoader = () => useContext(LoaderContext);