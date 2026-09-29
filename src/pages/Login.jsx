// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { fetchProfile } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // <--- Estado para la vista de recuperación
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // LÓGICA DE AUTENTICACIÓN MANUAL (EMAIL/PASSWORD)
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data?.user) {
          setMessage(
            'Su cuenta fue registrada exitosamente. Espere la aprobación del administrador.'
          );
          setEmail('');
          setPassword('');
          setFullName('');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data?.user) {
          setEmail('');
          setPassword('');
          // REDIRIGIR SEGÚN EL ROL AL INICIAR SESIÓN
          const userProfile = await fetchProfile(data.user.id);
          if (userProfile?.role === 'pendiente' || !userProfile?.role) {
            window.location.href = '/pending';
            return;
          }
          window.location.href = '/';
        }
      }
    } catch (err) {
      setMessage(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // LÓGICA PARA GOOGLE OAUTH
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://hxlwrlzucnpdqofxjelg.supabase.co/auth/v1/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      setMessage(err.message || 'Error al conectar con Google');
      setLoading(false);
    }
  };

  // LÓGICA DE RECUPERACIÓN DE CONTRASEÑA
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Por favor, escribe tu correo electrónico para recuperar la contraseña.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setMessage('¡Listo! Revisa tu correo electrónico. Te hemos enviado un enlace para restablecer tu contraseña.');
    } catch (err) {
      setMessage(err.message || 'Error al enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ESTILOS GLOBALES PARA BLOQUEAR SCROLL Y AJUSTAR ALTURA DINÁMICA EN MÓVIL */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden !important;
          position: fixed;
        }
        
        @media (max-width: 768px) {
          .login-main-container {
            height: 100dvh !important;
            min-height: 100dvh !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .login-card-wrapper {
            height: 100% !important;
            min-height: 100% !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          .login-left-panel {
            flex: 0 0 45% !important; 
            padding: 25px 20px !important;
            border-right: none !important;
            border-bottom: 4px solid #D4AF37 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          .login-left-panel h1 {
            font-size: 22px !important;
            margin-bottom: 8px !important;
            text-align: center !important;
          }
          .login-left-panel p {
            font-size: 12px !important;
            text-align: center !important;
          }
          .login-logo-container {
            margin: 15px 0 !important;
          }
          .login-logo-img {
            max-width: 110px !important;
            max-height: 110px !important;
          }
          .login-right-panel {
            flex: 1 1 auto !important;
            padding: 20px 15px !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          .login-form-wrapper {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div
        className="login-main-container"
        style={{
          minHeight: '100vh',
          height: '100vh',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          className="login-card-wrapper"
          style={{
            width: '100%',
            maxWidth: '850px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            minHeight: '520px',
            height: 'auto',
          }}
        >
          {/* PANEL IZQUIERDO NEGRO Y DORADO */}
          <div
            className="login-left-panel"
            style={{
              flex: '1 1 320px',
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRight: '4px solid #D4AF37',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  margin: '0 0 10px 0',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  textAlign: 'left',
                }}
              >
                {isForgotPassword ? 'RECUPERAR' : isRegistering ? 'REGISTRO' : 'INICIAR SESIÓN'}
              </h1>
              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  margin: 0,
                  textAlign: 'left',
                }}
              >
                Bienvenido a{' '}
                <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                  FENIX AUTO PART
                </span>
                . Gestión de repuestos automotrices.
              </p>
            </div>
            
            <div
              className="login-logo-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '30px 0',
              }}
            >
              <img
                className="login-logo-img"
                src="/logo.png"
                alt="Logo Fenix Auto Part"
                style={{
                  maxWidth: '160px',
                  maxHeight: '160px',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                style={{
                  display: 'none',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundImage:
                    'linear-gradient(45deg, #AA771C, #D4AF37, #F3E5AB)',
                  padding: '3px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000000',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    color: '#dc2626',
                    fontSize: '24px',
                  }}
                >
                  F
                </div>
              </div>
            </div>
            
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#D4AF37',
                  letterSpacing: '2px',
                  margin: 0,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                FENIX WEBSITE
              </p>
              <p
                style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  margin: '2px 0 0 0',
                  textAlign: 'center',
                }}
              >
                Repuestos & Autopartes
              </p>
            </div>
          </div>

          {/* PANEL DERECHO - FORMULARIO */}
          <div
            className="login-right-panel"
            style={{
              flex: '1 1 380px',
              backgroundColor: '#ffffff',
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            {!isForgotPassword ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    marginBottom: '30px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      color: isRegistering ? '#D4AF37' : '#9ca3af',
                      borderBottom: isRegistering ? '2px solid #D4AF37' : 'none',
                      paddingBottom: '4px',
                    }}
                  >
                    Registrarse
                  </button>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundImage:
                        'linear-gradient(45deg, #AA771C, #D4AF37, #F3E5AB)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000000',
                        borderRadius: '50%',
                      }}
                    ></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      color: !isRegistering ? '#D4AF37' : '#9ca3af',
                      borderBottom: !isRegistering ? '2px solid #D4AF37' : 'none',
                      paddingBottom: '4px',
                    }}
                  >
                    Iniciar Sesión
                  </button>
                </div>

                {message && (
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '10px',
                      fontSize: '12px',
                      textAlign: 'center',
                      borderRadius: '10px',
                      backgroundColor: message.includes('¡Listo!') ? '#f0fdf4' : '#fef2f2',
                      color: message.includes('¡Listo!') ? '#166534' : '#b91c1c',
                      border: `1px solid ${message.includes('¡Listo!') ? '#bbf7d0' : '#fecaca'}`,
                    }}
                  >
                    {message}
                  </div>
                )}

                <form
                  onSubmit={handleAuth}
                  className="login-form-wrapper"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    maxWidth: '320px',
                    margin: '0 auto',
                    width: '100%',
                  }}
                >
                  {isRegistering && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '2px solid #e5e7eb',
                        borderRadius: '50px',
                        overflow: 'hidden',
                        backgroundColor: '#f9fafb',
                      }}
                    >
                      <span
                        style={{
                          padding: '8px 14px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          minWidth: '85px',
                          borderRight: '1px solid #e5e7eb',
                          backgroundColor: '#f3f4f6',
                        }}
                      >
                        Nombre
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '12px',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          color: '#000000',
                        }}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '2px solid #e5e7eb',
                      borderRadius: '50px',
                      overflow: 'hidden',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <span
                      style={{
                        padding: '8px 14px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        minWidth: '85px',
                        borderRight: '1px solid #e5e7eb',
                        backgroundColor: '#f3f4f6',
                      }}
                    >
                      Correo
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '12px',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        color: '#000000',
                      }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* CONTRASEÑA CON OJITO */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '2px solid #e5e7eb',
                      borderRadius: '50px',
                      overflow: 'hidden',
                      backgroundColor: '#f9fafb',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        padding: '8px 14px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        minWidth: '85px',
                        borderRight: '1px solid #e5e7eb',
                        backgroundColor: '#f3f4f6',
                      }}
                    >
                      Contraseña
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '8px 40px 8px 12px',
                        fontSize: '12px',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        color: '#000000',
                      }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#6b7280',
                      }}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z" />
                          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                          <path d="M3.35 5.47q-.27.242-.534.509C1.372 7.373 0 8 0 8s3 5.5 8 5.5c1.605 0 3.033-.467 4.237-1.192l.942.942a.5.5 0 0 0 .708-.708l-13-13a.5.5 0 1 0-.708.708z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {!isRegistering && (
                    <div style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setMessage('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '11px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontWeight: '600',
                          padding: 0,
                        }}
                      >
                        ¿Olvidó su contraseña?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px 20px',
                      borderRadius: '50px',
                      backgroundImage:
                        'linear-gradient(to right, #AA771C, #D4AF37, #AA771C)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      marginTop: '6px',
                    }}
                  >
                    {loading
                      ? 'Procesando...'
                      : isRegistering
                      ? 'Registrarse'
                      : 'Iniciar Sesión'}
                  </button>
                </form>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: '320px',
                    margin: '16px auto',
                    width: '100%',
                  }}
                >
                  <span
                    style={{ height: '1px', backgroundColor: '#e5e7eb', flex: 1 }}
                  ></span>
                  <span
                    style={{
                      padding: '0 12px',
                      fontSize: '10px',
                      color: '#9ca3af',
                      fontWeight: 'bold',
                    }}
                  >
                    O
                  </span>
                  <span
                    style={{ height: '1px', backgroundColor: '#e5e7eb', flex: 1 }}
                  ></span>
                </div>

                <div
                  className="login-form-wrapper"
                  style={{
                    maxWidth: '320px',
                    margin: '0 auto',
                    width: '100%',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '50px',
                      fontWeight: '600',
                      fontSize: '12px',
                      color: '#374151',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      style={{ width: '18px', height: '18px', display: 'block' }}
                    />
                    <span>
                      {isRegistering
                        ? 'Registrarse con Google'
                        : 'Continuar con Google'}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              // SECCIÓN DEDICADA PARA ENVIAR EL CORREO DE RECUPERACIÓN (SIN PEDIR CONTRASEÑA)
              <div
                className="login-form-wrapper"
                style={{
                  maxWidth: '320px',
                  margin: '0 auto',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '15px', color: '#000000', margin: '0 0 6px 0' }}>
                    Restablecer acceso
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                    Ingresa tu correo y te enviaremos un enlace seguro para crear una nueva contraseña.
                  </p>
                </div>

                {message && (
                  <div
                    style={{
                      padding: '10px',
                      fontSize: '12px',
                      textAlign: 'center',
                      borderRadius: '10px',
                      backgroundColor: message.includes('¡Listo!') ? '#f0fdf4' : '#fef2f2',
                      color: message.includes('¡Listo!') ? '#166534' : '#b91c1c',
                      border: `1px solid ${message.includes('¡Listo!') ? '#bbf7d0' : '#fecaca'}`,
                    }}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '2px solid #e5e7eb',
                      borderRadius: '50px',
                      overflow: 'hidden',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <span
                      style={{
                        padding: '8px 14px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        minWidth: '85px',
                        borderRight: '1px solid #e5e7eb',
                        backgroundColor: '#f3f4f6',
                      }}
                    >
                      Correo
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '12px',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        color: '#000000',
                      }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '11px 20px',
                      borderRadius: '50px',
                      backgroundImage:
                        'linear-gradient(to right, #AA771C, #D4AF37, #AA771C)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setMessage('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      color: '#D4AF37',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: 0,
                    }}
                  >
                    ← Volver a Iniciar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}