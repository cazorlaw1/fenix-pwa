import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, profile, fetchProfile } = useAuth();

  // Estados de datos
  const [fullName, setFullName] = useState('');
  const [ci, setCi] = useState('');
  const [city, setCity] = useState(''); // Nuevo estado para Ciudad
  const [avatarUrl, setAvatarUrl] = useState('');
  const [ciUrl, setCiUrl] = useState('');

  // Estados de UI
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCi, setUploadingCi] = useState(false);
  const [showCiModal, setShowCiModal] = useState(false);
  const [imageError, setImageError] = useState(false); // Para manejar error de carga en modal

  const avatarInputRef = useRef(null);
  const ciInputRef = useRef(null);

  // Constantes de validación
  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  const ALLOWED_CI_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const AVATAR_BUCKET = 'avatars';
  const CI_BUCKET = 'documents';

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCi(profile.ci || '');
      setCity(profile.city || ''); // Cargar ciudad
      setAvatarUrl(profile.avatar_url || '');
      setCiUrl(profile.ci_url || '');
    }
  }, [profile]);

  // Validación completa: Avatar, CI, Texto CI y CIUDAD
  const isIncomplete = !avatarUrl || !ciUrl || !ci || !city;

  // Extrae el path relativo del archivo a partir de la URL pública de Supabase
  const extractPathFromUrl = (url, bucket) => {
    if (!url) return null;
    const pattern = `/${bucket}/`;
    const idx = url.indexOf(pattern);
    if (idx === -1) return null;
    return url.substring(idx + pattern.length);
  };

  // Elimina un archivo del storage si existe una URL previa
  const deleteOldFile = async (url, bucket) => {
    if (!url) return;
    const path = extractPathFromUrl(url, bucket);
    if (!path) return;
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error)
        console.warn('No se pudo eliminar archivo anterior:', error.message);
    } catch (err) {
      console.warn('Error eliminando archivo anterior:', err);
    }
  };

  // Valida el archivo (tipo y tamaño)
  const validateFile = (file, allowedTypes) => {
    if (!file) return 'No se seleccionó ningún archivo.';
    if (!allowedTypes.includes(file.type)) {
      return `Formato no permitido. Aceptados: ${allowedTypes
        .map((t) => t.split('/')[1])
        .join(', ')}.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo supera el tamaño máximo de 5MB.';
    }
    return null;
  };

  // Sube un archivo al bucket indicado
  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false, cacheControl: '3600' });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Handler para cambiar la foto de perfil
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file, ALLOWED_IMAGE_TYPES);
    if (validationError) {
      setMessage(`Error: ${validationError}`);
      return;
    }

    setUploadingAvatar(true);
    setMessage('');
    try {
      await deleteOldFile(avatarUrl, AVATAR_BUCKET);
      const newUrl = await uploadFile(file, AVATAR_BUCKET);
      setAvatarUrl(newUrl);
      setMessage('Foto de perfil actualizada. Recuerda guardar los cambios.');
    } catch (err) {
      setMessage(`Error al subir la foto: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Handler para adjuntar/cambiar la CI
  const handleCiChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file, ALLOWED_CI_TYPES);
    if (validationError) {
      setMessage(`Error: ${validationError}`);
      return;
    }

    setUploadingCi(true);
    setMessage('');
    setImageError(false); // Resetear error de imagen
    try {
      await deleteOldFile(ciUrl, CI_BUCKET);
      const newUrl = await uploadFile(file, CI_BUCKET);
      setCiUrl(newUrl);
      setMessage('Documento de CI actualizado. Recuerda guardar los cambios.');
    } catch (err) {
      setMessage(`Error al subir la CI: ${err.message}`);
    } finally {
      setUploadingCi(false);
      if (ciInputRef.current) ciInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          ci,
          city, // Guardar ciudad
          avatar_url: avatarUrl,
          ci_url: ciUrl,
        })
        .eq('id', user.id);
      if (error) throw error;
      await fetchProfile(user.id);
      setMessage('Perfil actualizado correctamente.');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="profile-container"
      style={{
        minHeight: 'calc(100vh - 65px)',
        backgroundColor: '#ffffff',
        color: '#111827',
        padding: '30px 20px',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        className="profile-card"
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          height: 'fit-content',
        }}
      >
        <h1
          className="profile-title"
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#000000',
            borderBottom: '1px solid #f3f4f6',
            paddingBottom: '16px',
            marginBottom: '24px',
          }}
        >
          Perfil de Usuario
        </h1>

        {/* ===== AVATAR REDONDO Y CENTRADO ===== */}
        <div
          className="profile-avatar-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <div
            className="profile-avatar-img-container"
            onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#f3f4f6',
              border: '3px solid #e5e7eb',
              cursor: uploadingAvatar ? 'wait' : 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = '#000000')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = '#e5e7eb')
            }
            title="Cambiar foto de perfil"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}

            {/* Overlay Hover */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: uploadingAvatar ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) =>
                avatarUrl && (e.currentTarget.style.opacity = '0')
              }
            >
              {uploadingAvatar ? (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '3px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            style={{
              marginTop: '12px',
              backgroundColor: 'transparent',
              color: '#000000',
              border: '1px solid #000000',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: uploadingAvatar ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploadingAvatar
              ? 'Subiendo...'
              : avatarUrl
              ? 'Cambiar foto'
              : 'Subir foto de perfil'}
          </button>
          <span
            style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}
          >
            JPG, PNG o WEBP · Máx. 5MB
          </span>
        </div>

        {/* ALERTA DE PERFIL INCOMPLETO (Incluye Ciudad) */}
        {isIncomplete && (
          <div
            className="profile-alert"
            style={{
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #dc2626',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '24px',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            ⚠️ Tienes el perfil incompleto. Por favor completa tu C.I., Ciudad y
            adjunta tus documentos.
          </div>
        )}

        {message && (
          <div
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              color: '#1f2937',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '13px',
            }}
          >
            {message}
          </div>
        )}

        <form
          className="profile-form"
          onSubmit={handleSave}
          style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Nombre Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* FILA: CI y CIUDAD */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Cédula de Identidad (C.I.)
              </label>
              <input
                type="text"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                placeholder="Ej: V-12345678"
                style={{
                  width: '100%',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Ciudad
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Caracas"
                style={{
                  width: '100%',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* ===== CAMPO PARA ADJUNTAR CI ===== */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Documento de Identidad (CI)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 14px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: ciUrl ? '#dcfce7' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={ciUrl ? '#16a34a' : '#9ca3af'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    color: ciUrl ? '#111827' : '#9ca3af',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {ciUrl ? 'Documento cargado ✓' : 'Sin documento adjunto'}
                </div>
                {ciUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageError(false);
                      setShowCiModal(true);
                    }}
                    style={{
                      fontSize: '11px',
                      color: '#2563eb',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Ver documento
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => ciInputRef.current?.click()}
                disabled={uploadingCi}
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: uploadingCi ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {uploadingCi ? 'Subiendo...' : ciUrl ? 'Cambiar' : 'Adjuntar'}
              </button>

              <input
                ref={ciInputRef}
                type="file"
                accept={ALLOWED_CI_TYPES.join(',')}
                onChange={handleCiChange}
                style={{ display: 'none' }}
              />
            </div>
            <span
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginTop: '6px',
                display: 'block',
              }}
            >
              PDF, JPG o PNG · Máx. 5MB
            </span>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Correo Electrónico
            </label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              style={{
                width: '100%',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                color: '#9ca3af',
                cursor: 'not-allowed',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Rol Asignado
            </label>
            <input
              type="text"
              value={profile?.role || 'Pendiente'}
              disabled
              style={{
                width: '100%',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                color: '#9ca3af',
                textTransform: 'capitalize',
                cursor: 'not-allowed',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              backgroundColor: '#000000',
              color: '#ffffff',
              fontWeight: '600',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
              fontSize: '14px',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>

      {/* ===== MODAL VISOR DE DOCUMENTO (IMAGEN) ===== */}
      {showCiModal && ciUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowCiModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
              }}
            >
              <span
                style={{
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#111827',
                }}
              >
                Documento de Identidad
              </span>
              <button
                onClick={() => setShowCiModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#6b7280',
                  padding: '0 4px',
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'auto',
                minHeight: '200px',
              }}
            >
              {imageError ? (
                <div style={{ textAlign: 'center', color: '#dc2626' }}>
                  <p>No se pudo cargar la imagen.</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    Verifica que el bucket 'documents' sea público en Supabase.
                  </p>
                  <a
                    href={ciUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#2563eb',
                      fontSize: '12px',
                      marginTop: '8px',
                      display: 'inline-block',
                    }}
                  >
                    Abrir enlace directo
                  </a>
                </div>
              ) : (
                <img
                  src={ciUrl}
                  alt="Documento CI"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ===== ESTILOS ADAPTATIVOS EXCLUSIVOS PARA MÓVIL (Sin Scroll y Elementos Reducidos) ===== */
        @media (max-width: 768px) {
          .profile-container {
            min-height: calc(100vh - 65px) !important;
            height: calc(100vh - 65px) !important;
            max-height: calc(100vh - 65px) !important;
            padding: 8px 12px !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            align-items: center !important;
          }

          .profile-card {
            padding: 14px 16px !important;
            border-radius: 12px !important;
            max-height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }

          .profile-title {
            font-size: 17px !important;
            padding-bottom: 6px !important;
            margin-bottom: 10px !important;
          }

          .profile-avatar-section {
            margin-bottom: 10px !important;
          }

          .profile-avatar-img-container {
            width: 80px !important;
            height: 80px !important;
          }

          .profile-avatar-section button {
            margin-top: 6px !important;
            padding: 4px 10px !important;
            font-size: 11px !important;
          }

          .profile-avatar-section span {
            display: none !important; /* Oculta texto secundario pequeño para ganar espacio */
          }

          .profile-alert {
            padding: 6px 10px !important;
            margin-bottom: 10px !important;
            font-size: 11px !important;
          }

          .profile-form {
            gap: 10px !important;
          }

          .profile-form input {
            padding: 6px 10px !important;
            font-size: 13px !important;
          }

          .profile-form label {
            margin-bottom: 2px !important;
            font-size: 10px !important;
          }

          .profile-form button[type="submit"] {
            margin-top: 4px !important;
            padding: 9px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}