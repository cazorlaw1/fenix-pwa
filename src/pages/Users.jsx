import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  Eye,
  X,
  Save,
  Download,
  MapPin,
  ChevronLeft,
  Upload,
  Trash2,
  ChevronDown,
  Check,
} from 'lucide-react';

export default function Users() {
  const [activeTab, setActiveTab] = useState('admitir'); // 'admitir' | 'comisiones' | 'estructura' | 'perfiles' | 'clientes'
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [assignmentsCountMap, setAssignmentsCountMap] = useState({});
  const [exceptionsCountMap, setExceptionsCountMap] = useState({});
  const [hierarchyConfigMap, setHierarchyConfigMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para el menú desplegable móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Estados para sub-sección de Estructura
  const [selectedParentUser, setSelectedParentUser] = useState(null);
  const [globalData, setGlobalData] = useState({
    isGlobal: false,
    hasExceptions: false,
    pctBombillos: 0,
    pctFluidos: 0,
    exceptionSellerIds: [],
    specificTargets: {},
  });
  const [savingStructure, setSavingStructure] = useState(false);

  // Estados para Pestaña Perfiles (Edición Inline)
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [profileFormData, setProfileFormData] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Refs para inputs de archivos en Perfiles
  const avatarInputRefs = useRef({});
  const ciInputRefs = useRef({});

  // Estados para Pestaña Clientes
  const [clientsList, setClientsList] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Modal Edición Cliente
  const [clientEditModal, setClientEditModal] = useState({
    open: false,
    client: null,
    formData: {},
  });
  const [savingClient, setSavingClient] = useState(false);
  const [uploadingClientFile, setUploadingClientFile] = useState(false);

  // Refs para inputs de archivos en Modal Cliente
  const clientCiInputRef = useRef(null);
  const clientRifInputRef = useRef(null);
  const clientDocInputRef = useRef(null);

  useEffect(() => {
    fetchUsersAndAssignments();
  }, []);

  // Cargar clientes cuando se activa la pestaña
  useEffect(() => {
    if (activeTab === 'clientes') {
      fetchAllClients();
    }
  }, [activeTab]);

  // useEffect para cerrar el dropdown móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUsersAndAssignments = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      if (usersError) throw usersError;
      setAllUsers(usersData || []);

      const { data: cfgData } = await supabase
        .from('hierarchy_config')
        .select('parent_user_id, is_global, has_exceptions');
      const cfgMap = {};
      cfgData?.forEach((c) => {
        cfgMap[c.parent_user_id] = c;
      });
      setHierarchyConfigMap(cfgMap);

      const { data: assignData, error: assignError } = await supabase
        .from('hierarchy_assignments')
        .select('parent_user_id, target_seller_id, is_exception');
      if (!assignError && assignData) {
        const counts = {};
        const excCounts = {};
        assignData.forEach((row) => {
          counts[row.parent_user_id] = (counts[row.parent_user_id] || 0) + 1;
          if (row.is_exception) {
            excCounts[row.parent_user_id] =
              (excCounts[row.parent_user_id] || 0) + 1;
          }
        });
        setAssignmentsCountMap(counts);
        setExceptionsCountMap(excCounts);
      }
    } catch (err) {
      console.error('Error cargando usuarios/asignaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClients = async () => {
    setLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(
          `
          *,
          profiles:assigned_seller_id(full_name, email, role),
          sales_orders(id, payment_status, balance_due_usd, seller_id)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientsList(data || []);
    } catch (err) {
      console.error('Error cargando clientes:', err.message);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadParentAssignmentConfig = async (parentUser) => {
    try {
      const { data } = await supabase
        .from('hierarchy_config')
        .select('*')
        .eq('parent_user_id', parentUser.id)
        .maybeSingle();

      const { data: targetRows } = await supabase
        .from('hierarchy_assignments')
        .select('*')
        .eq('parent_user_id', parentUser.id);

      const specificTargets = {};
      const activeSellersList = allUsers.filter(
        (u) =>
          u.id !== parentUser.id &&
          u.role?.toLowerCase() !== 'stock' &&
          u.role !== 'pendiente'
      );
      activeSellersList.forEach((seller) => {
        const found = targetRows?.find((r) => r.target_seller_id === seller.id);
        specificTargets[seller.id] = {
          selected: !!found,
          pctBombillos: found?.pct_bombillos || 0,
          pctFluidos: found?.pct_fluidos || 0,
        };
      });

      const excRows = targetRows?.filter((r) => r.is_exception) || [];
      setGlobalData({
        isGlobal: data ? data.is_global : false,
        hasExceptions: data ? data.has_exceptions : false,
        pctBombillos: data?.pct_bombillos_global || 0,
        pctFluidos: data?.pct_fluidos_global || 0,
        exceptionSellerIds: excRows.map((r) => r.target_seller_id),
        specificTargets,
      });
    } catch (err) {
      console.error('Error cargando config de estructura:', err);
    }
  };

  const handleSelectParentUser = async (user) => {
    setSelectedParentUser(user);
    await loadParentAssignmentConfig(user);
  };

  const handleSaveStructureConfiguration = async () => {
    if (!selectedParentUser) return;
    setSavingStructure(true);
    try {
      const { error: cfgErr } = await supabase.from('hierarchy_config').upsert(
        {
          parent_user_id: selectedParentUser.id,
          is_global: globalData.isGlobal,
          has_exceptions: globalData.hasExceptions,
          pct_bombillos_global: Number(globalData.pctBombillos),
          pct_fluidos_global: Number(globalData.pctFluidos),
          updated_at: new Date(),
        },
        { onConflict: 'parent_user_id' }
      );
      if (cfgErr) throw cfgErr;

      const { error: delErr } = await supabase
        .from('hierarchy_assignments')
        .delete()
        .eq('parent_user_id', selectedParentUser.id);
      if (delErr) throw delErr;

      const rowsToInsert = [];
      if (globalData.isGlobal && globalData.hasExceptions) {
        globalData.exceptionSellerIds.forEach((excId) => {
          rowsToInsert.push({
            parent_user_id: selectedParentUser.id,
            target_seller_id: excId,
            is_exception: true,
            pct_bombillos: 0,
            pct_fluidos: 0,
          });
        });
      } else if (!globalData.isGlobal) {
        Object.entries(globalData.specificTargets).forEach(
          ([sellerId, val]) => {
            if (val.selected) {
              rowsToInsert.push({
                parent_user_id: selectedParentUser.id,
                target_seller_id: sellerId,
                is_exception: false,
                pct_bombillos: Number(val.pctBombillos),
                pct_fluidos: Number(val.pctFluidos),
              });
            }
          }
        );
      }

      if (rowsToInsert.length > 0) {
        const { error: insErr } = await supabase
          .from('hierarchy_assignments')
          .insert(rowsToInsert);
        if (insErr) throw insErr;
      }

      alert('Estructura de comisiones guardada exitosamente.');
      setSelectedParentUser(null);
      fetchUsersAndAssignments();
    } catch (err) {
      alert('Error guardando estructura: ' + err.message);
    } finally {
      setSavingStructure(false);
    }
  };

  // Filtrados según especificaciones
  const pendingUsers = allUsers.filter(
    (u) => u.role === 'pendiente' || !u.role
  );
  const activeUsers = allUsers.filter(
    (u) => u.role && u.role !== 'pendiente' && u.role !== 'tecnico'
  );
  const structureUsers = activeUsers.filter((u) =>
    ['administrador', 'gerente', 'supervisor'].includes(u.role?.toLowerCase())
  );

  // Contadores
  const totalUsuarios = activeUsers.length + pendingUsers.length;
  const sinRolAsignado = pendingUsers.length;
  const asignadosCount = activeUsers.length;

  const handleUpdateUser = async (userId, updateData) => {
    if (!updateData.role || updateData.role === '') {
      alert('Por favor selecciona un rol válido antes de guardar.');
      return;
    }
    if (updateData.role === 'stock') {
      updateData.pct_bombillos = 0;
      updateData.pct_fluidos = 0;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      if (error) throw error;
      alert('Datos actualizados correctamente');
      fetchUsersAndAssignments();
    } catch (err) {
      alert('Error actualizando usuario: ' + err.message);
    }
  };

  // --- Lógica para Pestaña PERFILES ---

  const startEditingProfile = (user) => {
    setEditingProfileId(user.id);
    setProfileFormData({
      full_name: user.full_name || '',
      ci: user.ci || '',
      city: user.city || '',
      avatar_url: user.avatar_url || '',
      ci_url: user.ci_url || '',
      _old_avatar_url: user.avatar_url || '',
      _old_ci_url: user.ci_url || '',
    });
  };

  const cancelEditingProfile = () => {
    setEditingProfileId(null);
    setProfileFormData({});
  };

  const handleProfileFieldChange = (field, value) => {
    setProfileFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileFileChange = async (e, field, bucket, allowedTypes) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      alert(`Formato no permitido. Aceptados: ${allowedTypes.join(', ')}`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo supera el tamaño máximo de 5MB.');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`;
      const filePath = `${editingProfileId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const newUrl = data.publicUrl;

      setProfileFormData((prev) => ({ ...prev, [field]: newUrl }));
    } catch (err) {
      alert('Error subiendo archivo: ' + err.message);
    }
  };

  const saveProfileChanges = async (userId) => {
    setSavingProfile(true);
    try {
      const { _old_avatar_url, _old_ci_url, ...updates } = profileFormData;

      // Eliminar archivos antiguos si cambiaron
      if (_old_avatar_url && _old_avatar_url !== updates.avatar_url) {
        await deleteOldFile(_old_avatar_url, 'avatars');
      }
      if (_old_ci_url && _old_ci_url !== updates.ci_url) {
        await deleteOldFile(_old_ci_url, 'documents');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      alert('Perfil actualizado correctamente.');
      setEditingProfileId(null);
      fetchUsersAndAssignments(); // Recargar lista
    } catch (err) {
      alert('Error guardando perfil: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Lógica para Pestaña CLIENTES ---

  const openClientEditModal = (client) => {
    setClientEditModal({
      open: true,
      client: client,
      formData: {
        name: client.name || '',
        ci_number: client.ci_number || '',
        rif_number: client.rif_number || '',
        ci_photo_url: client.ci_photo_url || '',
        rif_photo_url: client.rif_photo_url || '',
        additional_doc_url: client.additional_doc_url || '',
        _old_ci_photo: client.ci_photo_url || '',
        _old_rif_photo: client.rif_photo_url || '',
        _old_additional_doc: client.additional_doc_url || '',
      },
    });
  };

  const closeClientEditModal = () => {
    setClientEditModal({ open: false, client: null, formData: {} });
  };

  const handleClientFieldChange = (field, value) => {
    setClientEditModal((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  };

  const handleClientFileUpload = async (e, field, bucket) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingClientFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`;
      const filePath = `${clientEditModal.client.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setClientEditModal((prev) => ({
        ...prev,
        formData: { ...prev.formData, [field]: data.publicUrl },
      }));
    } catch (err) {
      alert('Error subiendo archivo: ' + err.message);
    } finally {
      setUploadingClientFile(false);
    }
  };

  const saveClientChanges = async () => {
    if (!clientEditModal.client) return;
    setSavingClient(true);
    try {
      const { _old_ci_photo, _old_rif_photo, _old_additional_doc, ...updates } =
        clientEditModal.formData;

      // Eliminar archivos antiguos si cambiaron
      if (_old_ci_photo && _old_ci_photo !== updates.ci_photo_url) {
        await deleteOldFile(_old_ci_photo, 'documents');
      }
      if (_old_rif_photo && _old_rif_photo !== updates.rif_photo_url) {
        await deleteOldFile(_old_rif_photo, 'documents');
      }
      if (
        _old_additional_doc &&
        _old_additional_doc !== updates.additional_doc_url
      ) {
        await deleteOldFile(_old_additional_doc, 'documents');
      }

      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientEditModal.client.id);

      if (error) throw error;

      alert('Cliente actualizado correctamente.');
      closeClientEditModal();
      fetchAllClients(); // Recargar lista
    } catch (err) {
      alert('Error guardando cliente: ' + err.message);
    } finally {
      setSavingClient(false);
    }
  };

  // Helper para eliminar archivos
  const deleteOldFile = async (url, bucket) => {
    if (!url) return;
    const pattern = `/${bucket}/`;
    const idx = url.indexOf(pattern);
    if (idx === -1) return;
    const path = url.substring(idx + pattern.length);

    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error)
        console.warn('No se pudo eliminar archivo anterior:', error.message);
    } catch (err) {
      console.warn('Error eliminando archivo anterior:', err);
    }
  };

  if (loading && activeTab !== 'clientes' && activeTab !== 'perfiles') {
    return (
      <div style={{ padding: '24px', fontFamily: 'system-ui' }}>
        Cargando módulo de usuarios...
      </div>
    );
  }

  const tabsList = [
    { key: 'admitir', label: 'Admitir Pendientes' },
    { key: 'comisiones', label: 'Comisiones por N.E. Cerrada' },
    { key: 'estructura', label: 'Estructura de Comisiones' },
    { key: 'perfiles', label: 'Perfiles' },
    { key: 'clientes', label: 'Clientes' },
  ];

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '16px',
        }}
      >
        Gestión de Usuarios
      </h2>

      {/* Indicadores / Tarjetas de Resumen */}
      <div className="summary-cards-grid" style={{ marginBottom: '24px' }}>
        <div
          className="summary-card-item"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
            }}
          >
            Total Registrados
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#111827',
              marginTop: '4px',
            }}
          >
            {totalUsuarios}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
            Usuarios en sistema
          </div>
        </div>
        <div
          className="summary-card-item"
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #dc2626',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#dc2626',
              textTransform: 'uppercase',
            }}
          >
            Faltan por Asignar
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#dc2626',
              marginTop: '4px',
            }}
          >
            {sinRolAsignado}
          </div>
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
            Estado: Pendiente
          </div>
        </div>
        <div
          className="summary-card-item"
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #D4AF37',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#B45309',
              textTransform: 'uppercase',
            }}
          >
            Con Rol Asignado
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#111827',
              marginTop: '4px',
            }}
          >
            {asignadosCount}
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
            Listos para operar
          </div>
        </div>
      </div>

      {/* Navegación Pestañas (Escritorio / Móvil) */}
      <div
        style={{
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px',
        }}
      >
        {/* Pestañas de Escritorio */}
        <div className="desktop-tabs-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabsList.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedParentUser(null);
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderBottom:
                  activeTab === tab.key
                    ? '2px solid #000'
                    : '2px solid transparent',
                backgroundColor: 'transparent',
                fontWeight: activeTab === tab.key ? '700' : '500',
                color: activeTab === tab.key ? '#000' : '#6b7280',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Menú Dropdown Elegante para Móvil */}
        <div
          className="mobile-dropdown-container"
          ref={mobileMenuRef}
          style={{ position: 'relative', display: 'none' }}
        >
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#111827',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <span>
              {tabsList.find((t) => t.key === activeTab)?.label || 'Seleccionar...'}
            </span>
            <ChevronDown
              size={18}
              style={{
                transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {isMobileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              {tabsList.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSelectedParentUser(null);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: isActive ? '#fef2f2' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? '#dc2626' : '#4b5563',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{tab.label}</span>
                    {isActive && <Check size={18} style={{ color: '#dc2626' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 1: ADMITIR */}
      {activeTab === 'admitir' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '12px',
            }}
          >
            Usuarios Esperando Asignación de Rol
          </h3>
          {pendingUsers.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              No hay usuarios pendientes por asignación.
            </div>
          ) : (
            <div className="users-table-container mobile-cards">
              <table className="custom-responsive-table">
                <thead className="desktop-thead">
                  <tr
                    style={{
                      backgroundColor: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#4b5563',
                    }}
                  >
                    <th style={{ padding: '10px' }}>Nombre</th>
                    <th style={{ padding: '10px' }}>Correo</th>
                    <th style={{ padding: '10px' }}>Rol</th>
                    <th style={{ padding: '10px' }}>% Bombillos</th>
                    <th style={{ padding: '10px' }}>% Fluidos</th>
                    <th style={{ padding: '10px' }}>Sueldo F. ($)</th>
                    <th style={{ padding: '10px' }}>Acción</th>
                  </tr>
                </thead>
                <thead className="mobile-thead">
                  <tr
                    style={{
                      backgroundColor: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#4b5563',
                    }}
                  >
                    <th colSpan="2" style={{ padding: '10px' }}>
                      Nombre
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => (
                    <UserRow key={u.id} user={u} onSave={handleUpdateUser} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 2: COMISIONES POR N.E. CERRADA */}
      {activeTab === 'comisiones' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
              }}
            >
              Comisiones y Sueldos Fijos de Usuarios Activos
            </h3>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '12px',
                width: '100%',
                maxWidth: '240px',
              }}
            />
          </div>
          <div className="users-table-container mobile-cards">
            <table className="custom-responsive-table">
              <thead className="desktop-thead">
                <tr
                  style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                  }}
                >
                  <th style={{ padding: '10px' }}>Nombre</th>
                  <th style={{ padding: '10px' }}>Correo</th>
                  <th style={{ padding: '10px' }}>Rol</th>
                  <th style={{ padding: '10px' }}>% Bombillos</th>
                  <th style={{ padding: '10px' }}>% Fluidos</th>
                  <th style={{ padding: '10px' }}>Sueldo F. ($)</th>
                  <th style={{ padding: '10px' }}>Acción</th>
                </tr>
              </thead>
              <thead className="mobile-thead">
                <tr
                  style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                  }}
                >
                  <th colSpan="2" style={{ padding: '10px' }}>
                    Nombre
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeUsers
                  .filter(
                    (u) =>
                      u.full_name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((u) => (
                    <UserRow key={u.id} user={u} onSave={handleUpdateUser} />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: ESTRUCTURA DE COMISIONES */}
      {activeTab === 'estructura' && !selectedParentUser && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px',
            }}
          >
            Estructura Jerárquica de Comisiones (Admin, Gerentes, Supervisores)
          </h3>
          <div className="users-table-container mobile-cards">
            <table className="custom-responsive-table">
              <thead className="desktop-thead">
                <tr
                  style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                  }}
                >
                  <th style={{ padding: '10px' }}>Nombre</th>
                  <th style={{ padding: '10px' }}>Correo</th>
                  <th style={{ padding: '10px' }}>Rol</th>
                  <th style={{ padding: '10px' }}>Vendedores Asignados</th>
                  <th style={{ padding: '10px' }}>Acción</th>
                </tr>
              </thead>
              <thead className="mobile-thead">
                <tr
                  style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                  }}
                >
                  <th colSpan="2" style={{ padding: '10px' }}>
                    Nombre
                  </th>
                </tr>
              </thead>
              <tbody>
                {structureUsers.map((u) => {
                  const cfg = hierarchyConfigMap[u.id];
                  const enrichedUser = {
                    ...u,
                    is_global: cfg?.is_global || false,
                    has_exceptions: cfg?.has_exceptions || false,
                    assigned_count: assignmentsCountMap[u.id] || 0,
                    exception_count: exceptionsCountMap[u.id] || 0,
                  };
                  return (
                    <StructureUserRow
                      key={u.id}
                      user={enrichedUser}
                      onSelect={() => handleSelectParentUser(u)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORMULARIO ASIGNACIÓN EN ESTRUCTURA */}
      {activeTab === 'estructura' && selectedParentUser && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <button
            onClick={() => setSelectedParentUser(null)}
            style={{
              marginBottom: '16px',
              border: 'none',
              background: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ← Volver a Estructura de Comisiones
          </button>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '8px',
            }}
          >
            Configurar Asignación para: {selectedParentUser.full_name} (
            {selectedParentUser.role})
          </h3>
          <div
            style={{
              margin: '16px 0',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            <label
              style={{
                fontSize: '13px',
                fontWeight: '600',
                marginRight: '12px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              ¿Es Global (is_global)?
            </label>
            <select
              value={globalData.isGlobal ? 'Si' : 'No'}
              onChange={(e) =>
                setGlobalData({
                  ...globalData,
                  isGlobal: e.target.value === 'Si',
                })
              }
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                width: '100%',
                maxWidth: '150px',
              }}
            >
              <option value="No">No (Específico / Por Vendedor)</option>
              <option value="Si">Sí (Global)</option>
            </select>
          </div>
          {globalData.isGlobal ? (
            <div style={{ marginTop: '16px' }}>
              <div
                style={{
                  margin: '12px 0',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }}
              >
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  ¿Hay Excepciones (has_exceptions)?
                </label>
                <select
                  value={globalData.hasExceptions ? 'Si' : 'No'}
                  onChange={(e) =>
                    setGlobalData({
                      ...globalData,
                      hasExceptions: e.target.value === 'Si',
                    })
                  }
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    maxWidth: '150px',
                  }}
                >
                  <option value="No">No</option>
                  <option value="Si">Sí</option>
                </select>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    % Bombillos Global:
                  </label>
                  <input
                    type="number"
                    value={globalData.pctBombillos}
                    onChange={(e) =>
                      setGlobalData({
                        ...globalData,
                        pctBombillos: e.target.value,
                      })
                    }
                    style={{
                      width: '90px',
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    % Fluidos Global:
                  </label>
                  <input
                    type="number"
                    value={globalData.pctFluidos}
                    onChange={(e) =>
                      setGlobalData({
                        ...globalData,
                        pctFluidos: e.target.value,
                      })
                    }
                    style={{
                      width: '90px',
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                    }}
                  />
                </div>
              </div>
              {globalData.hasExceptions && (
                <div style={{ margin: '16px 0' }}>
                  <h4
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      marginBottom: '8px',
                    }}
                  >
                    Seleccionar Vendedores EXCEPTO (excluir o listar excepción):
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {activeUsers
                      .filter(
                        (u) =>
                          u.id !== selectedParentUser.id &&
                          u.role?.toLowerCase() !== 'stock'
                      )
                      .map((u) => {
                        const isChecked =
                          globalData.exceptionSellerIds.includes(u.id);
                        return (
                          <label
                            key={u.id}
                            style={{
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const list = [...globalData.exceptionSellerIds];
                                if (e.target.checked) {
                                  list.push(u.id);
                                } else {
                                  const idx = list.indexOf(u.id);
                                  if (idx > -1) list.splice(idx, 1);
                                }
                                setGlobalData({
                                  ...globalData,
                                  exceptionSellerIds: list,
                                });
                              }}
                            />
                            {u.full_name || u.email} ({u.role})
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}
              <button
                disabled={savingStructure}
                onClick={handleSaveStructureConfiguration}
                style={{
                  backgroundColor: '#000',
                  color: '#D4AF37',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  opacity: savingStructure ? 0.7 : 1,
                }}
              >
                {savingStructure
                  ? 'Guardando...'
                  : 'Guardar Configuración Global'}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}
              >
                Seleccionar Vendedores Específicos (`target_seller_id`)
              </h4>
              <div className="users-table-container mobile-cards">
                <table
                  className="custom-responsive-table"
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                >
                  <thead className="desktop-thead">
                    <tr
                      style={{
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      <th style={{ padding: '10px' }}>Asignar</th>
                      <th style={{ padding: '10px' }}>Usuario</th>
                      <th style={{ padding: '10px' }}>Rol</th>
                      <th style={{ padding: '10px' }}>% Bombillos</th>
                      <th style={{ padding: '10px' }}>% Fluidos</th>
                    </tr>
                  </thead>
                  <thead className="mobile-thead">
                    <tr
                      style={{
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        color: '#4b5563',
                      }}
                    >
                      <th colSpan="2" style={{ padding: '10px' }}>
                        Usuario
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeUsers
                      .filter(
                        (u) =>
                          u.id !== selectedParentUser.id &&
                          u.role?.toLowerCase() !== 'stock'
                      )
                      .map((targetUser) => {
                        const targetState = globalData.specificTargets[
                          targetUser.id
                        ] || {
                          selected: false,
                          pctBombillos: 0,
                          pctFluidos: 0,
                        };
                        return (
                          <tr
                            key={targetUser.id}
                            style={{ borderBottom: '1px solid #f3f4f6' }}
                          >
                            <td
                              className="desktop-cell-normal"
                              style={{ padding: '10px' }}
                            >
                              <input
                                type="checkbox"
                                checked={targetState.selected}
                                onChange={(e) => {
                                  setGlobalData({
                                    ...globalData,
                                    specificTargets: {
                                      ...globalData.specificTargets,
                                      [targetUser.id]: {
                                        ...targetState,
                                        selected: e.target.checked,
                                      },
                                    },
                                  });
                                }}
                              />
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{ padding: '10px', fontWeight: '600' }}
                            >
                              {targetUser.full_name}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{ padding: '10px' }}
                            >
                              {targetUser.role}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{ padding: '10px' }}
                            >
                              <input
                                type="number"
                                disabled={!targetState.selected}
                                value={targetState.pctBombillos}
                                onChange={(e) => {
                                  setGlobalData({
                                    ...globalData,
                                    specificTargets: {
                                      ...globalData.specificTargets,
                                      [targetUser.id]: {
                                        ...targetState,
                                        pctBombillos: e.target.value,
                                      },
                                    },
                                  });
                                }}
                                style={{
                                  width: '60px',
                                  padding: '4px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                }}
                              />{' '}
                              %
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{ padding: '10px' }}
                            >
                              <input
                                type="number"
                                disabled={!targetState.selected}
                                value={targetState.pctFluidos}
                                onChange={(e) => {
                                  setGlobalData({
                                    ...globalData,
                                    specificTargets: {
                                      ...globalData.specificTargets,
                                      [targetUser.id]: {
                                        ...targetState,
                                        pctFluidos: e.target.value,
                                      },
                                    },
                                  });
                                }}
                                style={{
                                  width: '60px',
                                  padding: '4px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                }}
                              />{' '}
                              %
                            </td>

                            {/* Mobile Card View for Specific Targets */}
                            <td colSpan="2" className="mobile-cell-stacked">
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                  width: '100%',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <span style={{ fontWeight: '600' }}>
                                    {targetUser.full_name} ({targetUser.role})
                                  </span>
                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '12px',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={targetState.selected}
                                      onChange={(e) => {
                                        setGlobalData({
                                          ...globalData,
                                          specificTargets: {
                                            ...globalData.specificTargets,
                                            [targetUser.id]: {
                                              ...targetState,
                                              selected: e.target.checked,
                                            },
                                          },
                                        });
                                      }}
                                    />
                                    Asignar
                                  </label>
                                </div>
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '6px',
                                  }}
                                >
                                  <div>
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        color: '#6b7280',
                                        display: 'block',
                                        fontWeight: '700',
                                      }}
                                    >
                                      % Bombillos
                                    </span>
                                    <input
                                      type="number"
                                      disabled={!targetState.selected}
                                      value={targetState.pctBombillos}
                                      onChange={(e) => {
                                        setGlobalData({
                                          ...globalData,
                                          specificTargets: {
                                            ...globalData.specificTargets,
                                            [targetUser.id]: {
                                              ...targetState,
                                              pctBombillos: e.target.value,
                                            },
                                          },
                                        });
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '4px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        color: '#6b7280',
                                        display: 'block',
                                        fontWeight: '700',
                                      }}
                                    >
                                      % Fluidos
                                    </span>
                                    <input
                                      type="number"
                                      disabled={!targetState.selected}
                                      value={targetState.pctFluidos}
                                      onChange={(e) => {
                                        setGlobalData({
                                          ...globalData,
                                          specificTargets: {
                                            ...globalData.specificTargets,
                                            [targetUser.id]: {
                                              ...targetState,
                                              pctFluidos: e.target.value,
                                            },
                                          },
                                        });
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '4px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <button
                disabled={savingStructure}
                onClick={handleSaveStructureConfiguration}
                style={{
                  marginTop: '16px',
                  backgroundColor: '#000',
                  color: '#D4AF37',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  opacity: savingStructure ? 0.7 : 1,
                }}
              >
                {savingStructure ? 'Guardando...' : 'Guardar Estructura'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= NUEVA SECCIÓN: PERFILES ================= */}
      {activeTab === 'perfiles' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '12px',
            }}
          >
            Gestión de Perfiles de Usuario
          </h3>
          <div className="users-table-container mobile-cards">
            <table className="custom-responsive-table">
              <thead className="desktop-thead">
                <tr
                  style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                  }}
                >
                  <th style={{ padding: '10px' }}>Foto</th>
                  <th style={{ padding: '10px' }}>Nombre</th>
                  <th style={{ padding: '10px' }}>C.I.</th>
                  <th style={{ padding: '10px' }}>Ciudad</th>
                  <th style={{ padding: '10px' }}>Documento CI</th>
                  <th style={{ padding: '10px' }}>Acción</th>
                </tr>
              </thead>
              <thead className="mobile-thead">
                <tr
                  style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                  }}
                >
                  <th colSpan="2" style={{ padding: '10px' }}>
                    Perfil
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => {
                  const isEditing = editingProfileId === user.id;

                  if (isEditing) {
                    return (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          backgroundColor: '#fffbeb',
                        }}
                      >
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '10px' }}
                        >
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '1px solid #ddd',
                            }}
                          >
                            {profileFormData.avatar_url ? (
                              <img
                                src={profileFormData.avatar_url}
                                alt="Avatar"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: '#eee',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                ?
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={(el) =>
                              (avatarInputRefs.current[user.id] = el)
                            }
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={(e) =>
                              handleProfileFileChange(
                                e,
                                'avatar_url',
                                'avatars',
                                ['image/jpeg', 'image/png', 'image/webp']
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              avatarInputRefs.current[user.id]?.click()
                            }
                            style={{
                              fontSize: '10px',
                              marginTop: '4px',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              border: 'none',
                              background: 'none',
                              color: '#2563eb',
                            }}
                          >
                            Cambiar
                          </button>
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '10px' }}
                        >
                          <input
                            type="text"
                            value={profileFormData.full_name}
                            onChange={(e) =>
                              handleProfileFieldChange(
                                'full_name',
                                e.target.value
                              )
                            }
                            style={{
                              width: '100%',
                              padding: '4px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '10px' }}
                        >
                          <input
                            type="text"
                            value={profileFormData.ci}
                            onChange={(e) =>
                              handleProfileFieldChange('ci', e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '4px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '10px' }}
                        >
                          <input
                            type="text"
                            value={profileFormData.city}
                            onChange={(e) =>
                              handleProfileFieldChange('city', e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '4px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '10px' }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            {profileFormData.ci_url ? (
                              <span
                                style={{ fontSize: '11px', color: 'green' }}
                              >
                                ✓ Cargado
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#999' }}>
                                Sin doc
                              </span>
                            )}
                            <input
                              type="file"
                              ref={(el) => (ciInputRefs.current[user.id] = el)}
                              style={{ display: 'none' }}
                              accept=".pdf,image/*"
                              onChange={(e) =>
                                handleProfileFileChange(
                                  e,
                                  'ci_url',
                                  'documents',
                                  ['application/pdf', 'image/jpeg', 'image/png']
                                )
                              }
                            />
                            <button
                              onClick={() =>
                                ciInputRefs.current[user.id]?.click()
                              }
                              style={{
                                fontSize: '10px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                border: 'none',
                                background: 'none',
                                color: '#2563eb',
                              }}
                            >
                              {profileFormData.ci_url
                                ? 'Cambiar Doc'
                                : 'Subir Doc'}
                            </button>
                          </div>
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{
                            padding: '10px',
                            display: 'flex',
                            gap: '8px',
                          }}
                        >
                          <button
                            onClick={() => saveProfileChanges(user.id)}
                            disabled={savingProfile}
                            style={{
                              backgroundColor: '#000',
                              color: '#D4AF37',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            {savingProfile ? '...' : <Save size={12} />}
                          </button>
                          <button
                            onClick={cancelEditingProfile}
                            style={{
                              backgroundColor: '#eee',
                              color: '#333',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={12} />
                          </button>
                        </td>

                        {/* Mobile View for Editing Profile */}
                        <td colSpan="2" className="mobile-cell-stacked">
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              width: '100%',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                              }}
                            >
                              <div
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  border: '1px solid #ddd',
                                }}
                              >
                                {profileFormData.avatar_url ? (
                                  <img
                                    src={profileFormData.avatar_url}
                                    alt="Avatar"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      backgroundColor: '#eee',
                                    }}
                                  ></div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  avatarInputRefs.current[user.id]?.click()
                                }
                                style={{
                                  fontSize: '11px',
                                  color: '#2563eb',
                                  background: 'none',
                                  border: 'none',
                                  textDecoration: 'underline',
                                }}
                              >
                                Cambiar Foto
                              </button>
                              <input
                                type="file"
                                ref={(el) =>
                                  (avatarInputRefs.current[user.id] = el)
                                }
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(e) =>
                                  handleProfileFileChange(
                                    e,
                                    'avatar_url',
                                    'avatars',
                                    ['image/jpeg', 'image/png', 'image/webp']
                                  )
                                }
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Nombre"
                              value={profileFormData.full_name}
                              onChange={(e) =>
                                handleProfileFieldChange(
                                  'full_name',
                                  e.target.value
                                )
                              }
                              style={{
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                              }}
                            />
                            <input
                              type="text"
                              placeholder="C.I."
                              value={profileFormData.ci}
                              onChange={(e) =>
                                handleProfileFieldChange('ci', e.target.value)
                              }
                              style={{
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Ciudad"
                              value={profileFormData.city}
                              onChange={(e) =>
                                handleProfileFieldChange('city', e.target.value)
                              }
                              style={{
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                              }}
                            />
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span style={{ fontSize: '12px' }}>
                                Doc. CI: {profileFormData.ci_url ? 'Sí' : 'No'}
                              </span>
                              <button
                                onClick={() =>
                                  ciInputRefs.current[user.id]?.click()
                                }
                                style={{
                                  fontSize: '11px',
                                  color: '#2563eb',
                                  background: 'none',
                                  border: 'none',
                                  textDecoration: 'underline',
                                }}
                              >
                                Subir/Cambiar
                              </button>
                              <input
                                type="file"
                                ref={(el) =>
                                  (ciInputRefs.current[user.id] = el)
                                }
                                style={{ display: 'none' }}
                                accept=".pdf,image/*"
                                onChange={(e) =>
                                  handleProfileFileChange(
                                    e,
                                    'ci_url',
                                    'documents',
                                    [
                                      'application/pdf',
                                      'image/jpeg',
                                      'image/png',
                                    ]
                                  )
                                }
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => saveProfileChanges(user.id)}
                                disabled={savingProfile}
                                style={{
                                  flex: 1,
                                  backgroundColor: '#000',
                                  color: '#D4AF37',
                                  border: 'none',
                                  padding: '8px',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                }}
                              >
                                Guardar
                              </button>
                              <button
                                onClick={cancelEditingProfile}
                                style={{
                                  flex: 1,
                                  backgroundColor: '#eee',
                                  border: 'none',
                                  padding: '8px',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={user.id}
                      style={{ borderBottom: '1px solid #f3f4f6' }}
                    >
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '10px' }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: '#f3f4f6',
                          }}
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt="Avatar"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9ca3af',
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '10px', fontWeight: '600' }}
                      >
                        {user.full_name || 'Sin Nombre'}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '10px' }}
                      >
                        {user.ci || '-'}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '10px' }}
                      >
                        {user.city || '-'}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '10px' }}
                      >
                        {user.ci_url ? (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#10B981',
                              fontWeight: '600',
                            }}
                          >
                            Adjunto ✓
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                            N/A
                          </span>
                        )}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '10px' }}
                      >
                        <button
                          onClick={() => startEditingProfile(user)}
                          style={{
                            backgroundColor: '#000',
                            color: '#D4AF37',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          Editar
                        </button>
                      </td>

                      {/* Mobile View for Normal Row */}
                      <td colSpan="2" className="mobile-cell-stacked">
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            width: '100%',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                          >
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: '#f3f4f6',
                              }}
                            >
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt="Avatar"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#9ca3af"
                                    strokeWidth="2"
                                  >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>
                                {user.full_name || 'Sin Nombre'}
                              </div>
                              <div
                                style={{ fontSize: '11px', color: '#6b7280' }}
                              >
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <div>CI: {user.ci || '-'}</div>
                            <div>Ciudad: {user.city || '-'}</div>
                            <div>Doc: {user.ci_url ? 'Sí' : 'No'}</div>
                          </div>
                          <button
                            onClick={() => startEditingProfile(user)}
                            style={{
                              backgroundColor: '#000',
                              color: '#D4AF37',
                              border: 'none',
                              padding: '8px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontSize: '11px',
                              cursor: 'pointer',
                              width: '100%',
                            }}
                          >
                            Editar Perfil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= NUEVA SECCIÓN: CLIENTES ================= */}
      {activeTab === 'clientes' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '12px',
            }}
          >
            Base de Datos de Clientes (Oficiales y Potenciales)
          </h3>

          {loadingClients ? (
            <div
              style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}
            >
              Cargando clientes...
            </div>
          ) : (
            <div className="users-table-container mobile-cards">
              <table className="custom-responsive-table">
                <thead className="desktop-thead">
                  <tr
                    style={{
                      backgroundColor: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#4b5563',
                    }}
                  >
                    <th style={{ padding: '10px' }}>Nombre / CI / RIF</th>
                    <th style={{ padding: '10px' }}>Datos Adjuntos</th>
                    <th style={{ padding: '10px' }}>Registrado Por</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>
                      N.E. Pendientes
                    </th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>
                      N.E. Cerradas
                    </th>
                    <th style={{ padding: '10px' }}>Última Visita</th>
                    <th style={{ padding: '10px' }}>Acción</th>
                  </tr>
                </thead>
                <thead className="mobile-thead">
                  <tr
                    style={{
                      backgroundColor: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#4b5563',
                    }}
                  >
                    <th colSpan="2" style={{ padding: '10px' }}>
                      Cliente
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          padding: '24px',
                          textAlign: 'center',
                          color: '#6b7280',
                        }}
                      >
                        No hay clientes registrados.
                      </td>
                    </tr>
                  ) : (
                    clientsList.map((client) => {
                      const isPotential = client.is_potential;
                      const nePendientes = (client.sales_orders || []).filter(
                        (o) => o.payment_status !== 'cerrada'
                      ).length;
                      const neCerradas = (client.sales_orders || []).filter(
                        (o) => o.payment_status === 'cerrada'
                      ).length;

                      return (
                        <tr
                          key={client.id}
                          style={{ borderBottom: '1px solid #f3f4f6' }}
                        >
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginBottom: '4px',
                              }}
                            >
                              <span style={{ fontWeight: '600' }}>
                                {client.name}
                              </span>
                              {isPotential ? (
                                <span
                                  style={{
                                    fontSize: '9px',
                                    backgroundColor: '#FEF3C7',
                                    color: '#B45309',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '700',
                                  }}
                                >
                                  POTENCIAL
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '9px',
                                    backgroundColor: '#DCFCE7',
                                    color: '#15803D',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '700',
                                  }}
                                >
                                  OFICIAL
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              CI: {client.ci_number || 'N/A'} | RIF:{' '}
                              {client.rif_number || 'N/A'}
                            </div>
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: '6px',
                                flexWrap: 'wrap',
                              }}
                            >
                              {!isPotential && client.ci_photo_url && (
                                <DocBadge
                                  label="CI"
                                  url={client.ci_photo_url}
                                  title={`C.I. de ${client.name}`}
                                />
                              )}
                              {!isPotential && client.rif_photo_url && (
                                <DocBadge
                                  label="RIF"
                                  url={client.rif_photo_url}
                                  title={`RIF de ${client.name}`}
                                />
                              )}
                              {client.additional_doc_url && (
                                <DocBadge
                                  label="Adic."
                                  url={client.additional_doc_url}
                                  title={`Doc. Adic. de ${client.name}`}
                                />
                              )}
                              {client.last_visit_photo_url && (
                                <DocBadge
                                  label="Foto"
                                  url={client.last_visit_photo_url}
                                  title={`Visita a ${client.name}`}
                                />
                              )}
                            </div>
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px', fontSize: '12px' }}
                          >
                            {client.profiles?.full_name || 'N/A'}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{
                              padding: '10px',
                              textAlign: 'center',
                              color: '#DC2626',
                              fontWeight: 'bold',
                            }}
                          >
                            {nePendientes}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{
                              padding: '10px',
                              textAlign: 'center',
                              color: '#10B981',
                              fontWeight: 'bold',
                            }}
                          >
                            {neCerradas}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px', fontSize: '12px' }}
                          >
                            {client.last_visit_at
                              ? new Date(
                                  client.last_visit_at
                                ).toLocaleDateString()
                              : 'Sin registro'}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px' }}
                          >
                            <button
                              onClick={() => openClientEditModal(client)}
                              style={{
                                backgroundColor: '#000',
                                color: '#D4AF37',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              Editar
                            </button>
                          </td>

                          {/* Mobile View for Client Row */}
                          <td colSpan="2" className="mobile-cell-stacked">
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                width: '100%',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span style={{ fontWeight: '600' }}>
                                  {client.name}
                                </span>
                                {isPotential ? (
                                  <span
                                    style={{
                                      fontSize: '9px',
                                      backgroundColor: '#FEF3C7',
                                      color: '#B45309',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: '700',
                                    }}
                                  >
                                    POTENCIAL
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '9px',
                                      backgroundColor: '#DCFCE7',
                                      color: '#15803D',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: '700',
                                    }}
                                  >
                                    OFICIAL
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                CI: {client.ci_number || 'N/A'} | RIF:{' '}
                                {client.rif_number || 'N/A'}
                              </div>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '4px',
                                  fontSize: '11px',
                                }}
                              >
                                <div>
                                  Reg: {client.profiles?.full_name || 'N/A'}
                                </div>
                                <div>N.E. Pend: {nePendientes}</div>
                                <div>N.E. Cerr: {neCerradas}</div>
                                <div>
                                  Visita:{' '}
                                  {client.last_visit_at
                                    ? new Date(
                                        client.last_visit_at
                                      ).toLocaleDateString()
                                    : 'Sin reg'}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '6px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                {!isPotential && client.ci_photo_url && (
                                  <DocBadge
                                    label="CI"
                                    url={client.ci_photo_url}
                                    title={`C.I. de ${client.name}`}
                                  />
                                )}
                                {!isPotential && client.rif_photo_url && (
                                  <DocBadge
                                    label="RIF"
                                    url={client.rif_photo_url}
                                    title={`RIF de ${client.name}`}
                                  />
                                )}
                                {client.additional_doc_url && (
                                  <DocBadge
                                    label="Adic."
                                    url={client.additional_doc_url}
                                    title={`Doc. Adic. de ${client.name}`}
                                  />
                                )}
                                {client.last_visit_photo_url && (
                                  <DocBadge
                                    label="Foto"
                                    url={client.last_visit_photo_url}
                                    title={`Visita a ${client.name}`}
                                  />
                                )}
                              </div>
                              <button
                                onClick={() => openClientEditModal(client)}
                                style={{
                                  backgroundColor: '#000',
                                  color: '#D4AF37',
                                  border: 'none',
                                  padding: '8px',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  width: '100%',
                                }}
                              >
                                Editar Cliente
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL EDICIÓN CLIENTE */}
      {clientEditModal.open && clientEditModal.client && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '12px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#111827',
                }}
              >
                Editar Cliente: {clientEditModal.client.name}
              </h3>
              <button
                onClick={closeClientEditModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Nombre */}
              <div>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={clientEditModal.formData.name}
                  onChange={(e) =>
                    handleClientFieldChange('name', e.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                />
              </div>

              {/* CI y RIF Textos */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    C.I. Número
                  </label>
                  <input
                    type="text"
                    value={clientEditModal.formData.ci_number}
                    onChange={(e) =>
                      handleClientFieldChange('ci_number', e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    RIF Número
                  </label>
                  <input
                    type="text"
                    value={clientEditModal.formData.rif_number}
                    onChange={(e) =>
                      handleClientFieldChange('rif_number', e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>

              {/* Archivos Adjuntos */}
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#111827',
                  }}
                >
                  Documentos Adjuntos
                </h4>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* CI Photo */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>
                        Foto C.I.
                      </span>
                      {clientEditModal.formData.ci_photo_url && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'green',
                            marginLeft: '8px',
                          }}
                        >
                          ✓ Cargado
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {clientEditModal.formData.ci_photo_url && (
                        <a
                          href={clientEditModal.formData.ci_photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '11px',
                            color: '#2563eb',
                            textDecoration: 'none',
                          }}
                        >
                          Ver
                        </a>
                      )}
                      <button
                        onClick={() => clientCiInputRef.current?.click()}
                        disabled={uploadingClientFile}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          backgroundColor: '#000',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {uploadingClientFile ? '...' : 'Subir/Cambiar'}
                      </button>
                      <input
                        ref={clientCiInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleClientFileUpload(e, 'ci_photo_url', 'documents')
                        }
                      />
                    </div>
                  </div>

                  {/* RIF Photo */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>
                        Foto RIF
                      </span>
                      {clientEditModal.formData.rif_photo_url && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'green',
                            marginLeft: '8px',
                          }}
                        >
                          ✓ Cargado
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {clientEditModal.formData.rif_photo_url && (
                        <a
                          href={clientEditModal.formData.rif_photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '11px',
                            color: '#2563eb',
                            textDecoration: 'none',
                          }}
                        >
                          Ver
                        </a>
                      )}
                      <button
                        onClick={() => clientRifInputRef.current?.click()}
                        disabled={uploadingClientFile}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          backgroundColor: '#000',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {uploadingClientFile ? '...' : 'Subir/Cambiar'}
                      </button>
                      <input
                        ref={clientRifInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleClientFileUpload(
                            e,
                            'rif_photo_url',
                            'documents'
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Additional Doc */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>
                        Doc. Adicional
                      </span>
                      {clientEditModal.formData.additional_doc_url && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'green',
                            marginLeft: '8px',
                          }}
                        >
                          ✓ Cargado
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {clientEditModal.formData.additional_doc_url && (
                        <a
                          href={clientEditModal.formData.additional_doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '11px',
                            color: '#2563eb',
                            textDecoration: 'none',
                          }}
                        >
                          Ver
                        </a>
                      )}
                      <button
                        onClick={() => clientDocInputRef.current?.click()}
                        disabled={uploadingClientFile}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          backgroundColor: '#000',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {uploadingClientFile ? '...' : 'Subir/Cambiar'}
                      </button>
                      <input
                        ref={clientDocInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleClientFileUpload(
                            e,
                            'additional_doc_url',
                            'documents'
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '16px',
                }}
              >
                <button
                  onClick={closeClientEditModal}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveClientChanges}
                  disabled={savingClient}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#000',
                    color: '#D4AF37',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {savingClient ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS para diseño responsivo, tarjetas móviles y campos informativos */}
      <style>{`
        .summary-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .users-table-container {
          width: 100%;
          overflow-x: auto;
        }
        .custom-responsive-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          text-align: left;
        }
        .mobile-thead {
          display: none;
        }
        .mobile-cell-stacked {
          display: none;
        }
        .desktop-cell-normal {
          display: table-cell;
        }

        @media (max-width: 768px) {
          .desktop-tabs-container {
            display: none !important;
          }
          .mobile-dropdown-container {
            display: block !important;
          }
          .summary-cards-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
          .summary-card-item {
            padding: 10px 6px !important;
            text-align: center !important;
          }
          .summary-card-item div:nth-child(1) {
            font-size: 9px !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .summary-card-item div:nth-child(2) {
            font-size: 18px !important;
            margin-top: 2px !important;
          }
          .summary-card-item div:nth-child(3) {
            font-size: 9px !important;
            margin-top: 1px !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .users-table-container.mobile-cards {
            overflow-x: hidden !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
          }
          .custom-responsive-table {
            display: block !important;
          }
          .desktop-thead {
            display: none !important;
          }
          .mobile-thead {
            display: none !important;
          }
          .custom-responsive-table tbody {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
          .custom-responsive-table tr {
            display: flex !important;
            flex-direction: column !important;
            background-color: #ffffff !important;
            border: 1px solid #d1d5db !important;
            border-radius: 8px !important;
            padding: 14px !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .desktop-cell-normal {
            display: none !important;
          }
          .mobile-cell-stacked {
            display: flex !important;
            flex-direction: column;
            gap: 8px;
            padding: 0 !important;
          }
        }

        @media (min-width: 769px) {
          .desktop-tabs-container {
            display: flex !important;
          }
          .mobile-dropdown-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function StructureUserRow({ user, onSelect }) {
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
      {/* VISTA ESCRITORIO: Nombre */}
      <td
        className="desktop-cell-normal"
        style={{ padding: '10px', fontWeight: '600' }}
      >
        {user.full_name || 'Sin Nombre'}
      </td>
      {/* VISTA ESCRITORIO: Correo */}
      <td
        className="desktop-cell-normal"
        style={{ padding: '10px', color: '#6b7280' }}
      >
        {user.email}
      </td>
      {/* VISTA ESCRITORIO: Rol */}
      <td className="desktop-cell-normal" style={{ padding: '10px' }}>
        <span
          style={{
            backgroundColor: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          {user.role}
        </span>
      </td>
      {/* VISTA ESCRITORIO: Vendedores Asignados */}
      <td className="desktop-cell-normal" style={{ padding: '10px' }}>
        {user.is_global ? (
          <span style={{ color: '#10b981', fontWeight: '600' }}>
            Global {user.has_exceptions ? `(Con Excepciones)` : ''}
          </span>
        ) : (
          <span style={{ color: '#2563eb', fontWeight: '600' }}>
            {user.assigned_count} vendedores asignados
          </span>
        )}
      </td>
      {/* VISTA ESCRITORIO: Acción */}
      <td className="desktop-cell-normal" style={{ padding: '10px' }}>
        <button
          onClick={onSelect}
          style={{
            backgroundColor: '#000000',
            color: '#D4AF37',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Configurar
        </button>
      </td>

      {/* VISTA MÓVIL: Tarjeta Apilada */}
      <td
        colSpan="2"
        className="mobile-cell-stacked"
        style={{ verticalAlign: 'top', width: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
          }}
        >
          <div>
            <span
              style={{
                fontWeight: '600',
                color: '#111827',
                fontSize: '13px',
                display: 'block',
              }}
            >
              {user.full_name || 'Sin Nombre'}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#6b7280',
                wordBreak: 'break-all',
                display: 'block',
              }}
            >
              {user.email}
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              fontSize: '12px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  display: 'block',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Rol
              </span>
              <span>{user.role}</span>
            </div>
            <div>
              <span
                style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  display: 'block',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Asignación
              </span>
              <span>
                {user.is_global
                  ? `Global${user.has_exceptions ? ' (Exc)' : ''}`
                  : `${user.assigned_count} asig.`}
              </span>
            </div>
          </div>
          <button
            onClick={onSelect}
            style={{
              backgroundColor: '#000000',
              color: '#D4AF37',
              border: 'none',
              padding: '8px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '11px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Configurar Estructura
          </button>
        </div>
      </td>
    </tr>
  );
}

function UserRow({ user, onSave }) {
  const [role, setRole] = useState(
    user.role === 'pendiente' ? '' : user.role || ''
  );
  const [pctBombillos, setPctBombillos] = useState(user.pct_bombillos || 0);
  const [pctFluidos, setPctFluidos] = useState(user.pct_fluidos || 0);
  const [sueldoFijo, setSueldoFijo] = useState(user.sueldo_fijo_usd || 0);
  const isStockRole = role === 'stock';
  const handleSave = () => {
    onSave(user.id, {
      role,
      pct_bombillos: isStockRole ? 0 : Number(pctBombillos),
      pct_fluidos: isStockRole ? 0 : Number(pctFluidos),
      sueldo_fijo_usd: Number(sueldoFijo),
    });
  };
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
      {/* VISTA ESCRITORIO: Nombre */}
      <td
        className="desktop-cell-normal"
        style={{ padding: '10px', fontWeight: '600' }}
      >
        {user.full_name || 'Sin Nombre'}
      </td>
      {/* VISTA ESCRITORIO: Correo */}
      <td
        className="desktop-cell-normal"
        style={{ padding: '10px', color: '#6b7280' }}
      >
        {user.email}
      </td>
      {/* VISTA ESCRITORIO: Rol */}
      <td className="desktop-cell-normal" style={{ padding: '10px' }}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            border: role ? '1px solid #d1d5db' : '1px solid #dc2626',
            backgroundColor: role ? '#ffffff' : '#fef2f2',
          }}
        >
          <option value="" disabled>
            -- Seleccionar Rol --
          </option>
          <option value="vendedor">Vendedor</option>
          <option value="supervisor">Supervisor</option>
          <option value="gerente">Gerente</option>
          <option value="stock">Stock</option>
          <option value="administrador">Administrador</option>
          <option value="suspendido">Suspendido</option>
        </select>
      </td>
      {/* VISTA ESCRITORIO: % Bombillos */}
      <td className="desktop-cell-normal" style={{ padding: '10px' }}>
        <input
          type="number"
          disabled={isStockRole}
          value={isStockRole ? 0 : pctBombillos}
          onChange={(e) => setPctBombillos(e.target.value)}
          style={{
            width: '60px',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: isStockRole ? '#f3f4f6' : '#ffffff',
            cursor: isStockRole ? 'not-allowed' : 'text',
          }}
        />{' '}
        %
      </td>
      {/* VISTA ESCRITORIO: % Fluidos */}
      <td className="desktop-cell-normal" style={{ padding: '10px' }}>
        <input
          type="number"
          disabled={isStockRole}
          value={isStockRole ? 0 : pctFluidos}
          onChange={(e) => setPctFluidos(e.target.value)}
          style={{
            width: '60px',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: isStockRole ? '#f3f4f6' : '#ffffff',
            cursor: isStockRole ? 'not-allowed' : 'text',
          }}
        />{' '}
        %
      </td>
      {/* VISTA ESCRITORIO: Sueldo F. */}
      <td className="desktop-cell-normal" style={{ padding: '10px' }}>
        $
        <input
          type="number"
          value={sueldoFijo}
          onChange={(e) => setSueldoFijo(e.target.value)}
          style={{
            width: '70px',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
          }}
        />
      </td>
      {/* VISTA ESCRITORIO: Acción */}
      <td className="desktop-cell-normal" style={{ padding: '10px' }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#000000',
            color: '#D4AF37',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Guardar
        </button>
      </td>
      {/* VISTA MÓVIL: Fila única combinada (colSpan=2) que abarca todo el ancho */}
      <td
        colSpan="2"
        className="mobile-cell-stacked"
        style={{ verticalAlign: 'top', width: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
          }}
        >
          <div>
            <span
              style={{
                fontWeight: '600',
                color: '#111827',
                fontSize: '13px',
                display: 'block',
              }}
            >
              {user.full_name || 'Sin Nombre'}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#6b7280',
                wordBreak: 'break-all',
                display: 'block',
              }}
            >
              {user.email}
            </span>
          </div>
          <div>
            <span
              style={{
                fontSize: '10px',
                color: '#6b7280',
                display: 'block',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              Rol
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: role ? '1px solid #d1d5db' : '1px solid #dc2626',
                backgroundColor: role ? '#ffffff' : '#fef2f2',
                width: '100%',
                fontSize: '12px',
              }}
            >
              <option value="" disabled>
                -- Rol --
              </option>
              <option value="vendedor">Vendedor</option>
              <option value="supervisor">Supervisor</option>
              <option value="gerente">Gerente</option>
              <option value="stock">Stock</option>
              <option value="administrador">Administrador</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  display: 'block',
                  fontWeight: '700',
                }}
              >
                % Bombillos
              </span>
              <input
                type="number"
                disabled={isStockRole}
                value={isStockRole ? 0 : pctBombillos}
                onChange={(e) => setPctBombillos(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: isStockRole ? '#f3f4f6' : '#ffffff',
                  fontSize: '12px',
                }}
              />
            </div>
            <div>
              <span
                style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  display: 'block',
                  fontWeight: '700',
                }}
              >
                % Fluidos
              </span>
              <input
                type="number"
                disabled={isStockRole}
                value={isStockRole ? 0 : pctFluidos}
                onChange={(e) => setPctFluidos(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: isStockRole ? '#f3f4f6' : '#ffffff',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
          <div>
            <span
              style={{
                fontSize: '10px',
                color: '#6b7280',
                display: 'block',
                fontWeight: '700',
              }}
            >
              Sueldo Fijo ($)
            </span>
            <input
              type="number"
              value={sueldoFijo}
              onChange={(e) => setSueldoFijo(e.target.value)}
              style={{
                width: '100%',
                padding: '4px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '12px',
              }}
            />
          </div>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#000000',
              color: '#D4AF37',
              border: 'none',
              padding: '8px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '11px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Guardar
          </button>
        </div>
      </td>
    </tr>
  );
}

function DocBadge({ label, url, title }) {
  const [modalOpen, setModalOpen] = useState(false);
  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        style={{
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '10px',
          fontWeight: '700',
          color: '#374151',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
        }}
        title={`Ver ${title}`}
      >
        <Eye size={10} /> {label}
      </button>

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                {title}
              </h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Download size={12} /> Descargar
                </a>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div
              style={{
                padding: '16px',
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isPdf ? (
                <iframe
                  src={url}
                  title={title}
                  style={{ width: '80vw', height: '70vh', border: 'none' }}
                />
              ) : (
                <img
                  src={url}
                  alt={title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '4px',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}