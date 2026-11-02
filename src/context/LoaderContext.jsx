import React, { createContext, useContext, useState } from 'react';

const LoaderContext = createContext();

// Variables globales para permitir disparar el loader desde fuera de los componentes (ej. en Supabase)
export let globalShowLoader = () => {};
export let globalHideLoader = () => {};

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Cargando...");

  const showLoader = (msg = "Cargando...") => {
    setMessage(msg);
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
  };

  // Asignamos a las variables globales
  globalShowLoader = showLoader;
  globalHideLoader = hideLoader;

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo oscuro semitransparente
          backdropFilter: 'blur(4px)',          // Desenfoque elegante del fondo
          WebkitBackdropFilter: 'blur(4px)',    // Compatibilidad con Safari
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
          {/* GIF 3 veces más grande (de 60px a 180px) */}
          <img 
            src="/cargando.gif" 
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