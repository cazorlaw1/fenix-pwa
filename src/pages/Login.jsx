import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, profile, fetchProfile } = useAuth();

  // Estados de datos
  const [fullName, setFullName] = useState('');
  const [ci, setCi] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [ciUrl, setCiUrl] = useState('');

  // Estados de UI
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCi, setUploadingCi] = useState(false);
  const [showCiModal, setShowCiModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const avatarInputRef = useRef(null);
  const ciInputRef = useRef(null);

  // Constantes de validación
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_CI_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const AVATAR_BUCKET = 'avatars';
  const CI_BUCKET = 'documents';

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCi(profile.ci || '');
      setCity(profile.city || '');
      setAvatarUrl(profile.avatar_url || '');
      setCiUrl(profile.ci_url || '');
    }
  }, [profile]);

  const isIncomplete = !avatarUrl || !ciUrl || !ci || !city;

  const extractPathFromUrl = (url, bucket) => {
    if (!url) return null;
    const pattern = `/${bucket}/`;
    const idx = url.indexOf(pattern);
    if (idx === -1) return null;
    return url.substring(idx + pattern.length);
  };

  const deleteOldFile = async (url, bucket) => {
    if (!url) return;
    const path = extractPathFromUrl(url, bucket);
    if (!path) return;
    try {
      await supabase.storage.from(bucket).remove([path]);
    } catch (err) {
      console.warn('Error eliminando archivo anterior:', err);
    }
  };

  const validateFile = (file, allowedTypes) => {
    if (!file) return 'No se seleccionó ningún archivo.';
    if (!allowedTypes.includes(file.type)) return 'Formato no permitido.';
    if (file.size > MAX_FILE_SIZE) return 'El archivo supera los 5MB.';
    return null;
  };

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateFile(file, ALLOWED_IMAGE_TYPES);
    if (validationError) { setMessage(`Error: ${validationError}`); return; }

    setUploadingAvatar(true);
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

  const handleCiChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateFile(file, ALLOWED_CI_TYPES);
    if (validationError) { setMessage(`Error: ${validationError}`); return; }

    setUploadingCi(true);
    setImageError(false);
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
        .update({ full_name: fullName, ci, city, avatar_url: avatarUrl, ci_url: ciUrl })
        .eq('id', user.id);
      if (error) throw error;
      await fetchProfile(user.id);
      setMessage('Perfil actualizado correctamente.');
      setIsEditing(false);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const showFenixCard = !isIncomplete && !isEditing;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '390px',
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #d4af37',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 0 12px rgba(212, 175, 55, 0.15)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          {showFenixCard ? (
            /* ===== CREDENCIAL FENIX AUTO PART ===== */
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* 1. Cabecera Oscura con Logo y Texto Centrado, Mismo Alto */}
              <div
                style={{
                  backgroundColor: '#0a0a0a',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  borderBottom: '3px solid #d4af37',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <img 
                  src="https://hxlwrlzucnpdqofxjelg.supabase.co/storage/v1/object/public/assets/LOGOF.png" 
                  alt="Fenix auto Part" 
                  style={{ height: '32px', objectFit: 'contain' }} 
                />
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#d4af37', letterSpacing: '0.5px', lineHeight: '32px' }}>
                  Fenix auto Part
                </span>
              </div>

              {/* 2. Cuerpo Central con Marca de Agua y Datos Más Grandes */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '22px 16px 18px 16px',
                  position: 'relative',
                  minHeight: '210px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}
              >
                {/* Marca de agua del fénix al fondo */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '10px',
                    width: '140px',
                    height: '140px',
                    backgroundImage: 'url(https://hxlwrlzucnpdqofxjelg.supabase.co/storage/v1/object/public/assets/LOGOF.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 0.08,
                    pointerEvents: 'none',
                  }} 
                />

                {/* Fotografía de perfil */}
                <div
                  style={{
                    width: '110px',
                    height: '135px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid #d4af37',
                    backgroundColor: '#f3f4f6',
                    flexShrink: 0,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '11px' }}>Sin foto</div>
                  )}
                </div>

                {/* Datos del usuario con fuente considerablemente más grande */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, zIndex: 1 }}>
                  <div>
                    <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#111827', margin: 0, lineHeight: '1.15' }}>
                      {fullName.toUpperCase()}
                    </h2>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', display: 'block' }}>
                      {profile?.role || 'DIRECTOR DE OPERACIONES'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                    <div>
                      <span style={{ color: '#6b7280', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: '700' }}>C.I. / Identificación</span>
                      <span style={{ color: '#111827', fontWeight: '900', fontSize: '14px' }}>{ci}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: '700' }}>Gestión / Ubicación</span>
                      <span style={{ color: '#111827', fontWeight: '900', fontSize: '14px' }}>{city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Correo Electrónico Destacado */}
              <div style={{ padding: '0 16px 12px 16px', backgroundColor: '#ffffff', zIndex: 1 }}>
                <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px', fontWeight: '700' }}>Correo Electrónico</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', wordBreak: 'break-all' }}>{user?.email}</span>
                </div>
              </div>

              {/* Enlace para Ver Documento */}
              {ciUrl && (
                <div style={{ textAlign: 'center', paddingBottom: '12px', backgroundColor: '#ffffff', zIndex: 1 }}>
                  <button
                    type="button"
                    onClick={() => { setImageError(false); setShowCiModal(true); }}
                    style={{ background: 'none', border: 'none', color: '#b45309', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', fontWeight: '700' }}
                  >
                    Ver Documento de Identidad adjunto
                  </button>
                </div>
              )}

              {/* 3. Sección Inferior Negra con Botón de Editar */}
              <div 
                style={{ 
                  backgroundColor: '#0a0a0a', 
                  padding: '14px 16px', 
                  borderTop: '2px solid #d4af37',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '10px', color: '#d4af37', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  FENIXAUTO.COM | {city.toUpperCase()}
                </span>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    width: '100%',
                    backgroundColor: '#d4af37',
                    color: '#000000',
                    fontWeight: 'bold',
                    padding: '9px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5c158')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d4af37')}
                >
                  Editar Perfil
                </button>
              </div>

            </div>
          ) : (
            /* ===== VISTA DE FORMULARIO DE EDICIÓN ===== */
            <div style={{ padding: '16px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px', marginBottom: '12px' }}>
                <h1 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', margin: 0 }}>
                  Configurar Perfil
                </h1>
                {!isIncomplete && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '3px 6px', fontSize: '10px', cursor: 'pointer', color: '#374151' }}
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* Avatar para edición */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
                <div
                  onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                  style={{
                    width: '75px',
                    height: '90px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6',
                    border: '2px solid #d4af37',
                    cursor: uploadingAvatar ? 'wait' : 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>Sin foto</span>
                  )}
                </div>
                <input ref={avatarInputRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleAvatarChange} style={{ display: 'none' }} />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{ marginTop: '5px', backgroundColor: 'transparent', color: '#b45309', border: '1px solid #d4af37', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
                </button>
              </div>

              {isIncomplete && (
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '3px solid #dc2626', color: '#991b1b', padding: '6px 10px', borderRadius: '0 6px 6px 0', marginBottom: '10px', fontSize: '10px', fontWeight: '500' }}>
                  ⚠️ Completa tu C.I., Ciudad y documentos para activar tu credencial.
                </div>
              )}

              {message && (
                <div style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#1f2937', padding: '6px', borderRadius: '6px', marginBottom: '10px', fontSize: '10px' }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>Nombre Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>Cédula (C.I.)</label>
                    <input
                      type="text"
                      value={ci}
                      onChange={(e) => setCi(e.target.value)}
                      placeholder="V-12345678"
                      style={{ width: '100%', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>Ciudad</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Caracas"
                      style={{ width: '100%', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>Documento de Identidad (CI)</label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', padding: '5px 8px', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: ciUrl ? '#16a34a' : '#9ca3af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ciUrl ? 'Documento cargado ✓' : 'Sin documento'}
                    </span>
                    <button
                      type="button"
                      onClick={() => ciInputRef.current?.click()}
                      disabled={uploadingCi}
                      style={{ backgroundColor: '#0a0a0a', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '9px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {uploadingCi ? 'Subiendo...' : ciUrl ? 'Cambiar' : 'Adjuntar'}
                    </button>
                    <input ref={ciInputRef} type="file" accept={ALLOWED_CI_TYPES.join(',')} onChange={handleCiChange} style={{ display: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>Correo Electrónico</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    style={{ width: '100%', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', color: '#9ca3af', cursor: 'not-allowed', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{ width: '100%', backgroundColor: '#0a0a0a', color: '#ffffff', fontWeight: '600', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '4px', fontSize: '11px' }}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL VISOR DE DOCUMENTO ===== */}
      {showCiModal && ciUrl && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setShowCiModal(false)}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '10px', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', fontSize: '13px' }}>Documento de Identidad</span>
              <button onClick={() => setShowCiModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {imageError ? (
                <p style={{ color: '#dc2626', fontSize: '12px' }}>No se pudo cargar la imagen.</p>
              ) : (
                <img src={ciUrl} alt="Documento CI" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} onError={() => setImageError(true)} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}