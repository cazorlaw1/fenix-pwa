import React, { createContext, useContext, useState } from 'react';
import cargandoGif from '../assets/cargando.gif'; // <-- Importas la imagen desde src/assets

const LoaderContext = createContext();

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
          {/* Usas la variable importada */}
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