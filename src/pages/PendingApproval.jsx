import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PendingApproval() {
  const { signOut, fetchProfile, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#111827',
        margin: 0,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: '420px',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '12px',
          }}
        >
          Cuenta en Espera
        </h2>
        <p
          style={{
            color: '#4b5563',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '24px',
          }}
        >
          Hola. Tu cuenta fue registrada exitosamente y está pendiente de
          aprobación por el administrador para asignarte un rol.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => user && fetchProfile(user.id)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#D4AF37',
              color: '#111827',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
            }}
          >
            Comprobar Aprobación
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 16px',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
