import { notificarAdminNuevaNota } from '../services/notificationService';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  MapPin,
  FileText,
  Upload,
  Edit,
  Download,
  AlertCircle,
  CheckCircle,
  Search,
  Trash2,
  Eye,
  Send,
  X,
  UserCheck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Bell,
  Plus,
  Clock,
  DollarSign,
  Calendar,
  Sliders,
  History,
  TrendingUp,
  Target,
  Banknote,
  ShoppingCart,
  Check,
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- COMPONENTE SEARCHABLE DROPDOWN (ESTILO ADMINMODULE - GRANDE) ---
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  labelKey = 'label',
  valueKey = 'value',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter((opt) => {
    const text = String(opt[labelKey] || '').toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const selectedOption = options.find(
    (o) => String(o[valueKey]) === String(value)
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          backgroundColor: '#FFFFFF',
          boxSizing: 'border-box',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '42px',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selectedOption ? selectedOption[labelKey] : placeholder}
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>▼</span>
      </div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 999,
            backgroundColor: '#fff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            marginTop: '4px',
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
            <input
              type="text"
              placeholder="🔍 Filtrar en tiempo real..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '14px',
                border: '1px solid #9ca3af',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '12px',
                  fontSize: '13px',
                  color: '#9ca3af',
                  textAlign: 'center',
                }}
              >
                No hay resultados
              </div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt[valueKey]}
                  onClick={() => {
                    onChange(opt[valueKey]);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#f3f4f6')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      String(value) === String(opt[valueKey])
                        ? '#eff6ff'
                        : 'transparent')
                  }
                  style={{
                    padding: '10px 12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor:
                      String(value) === String(opt[valueKey])
                        ? '#eff6ff'
                        : 'transparent',
                  }}
                >
                  {opt[labelKey]}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
export default function SalesModule() {
  const { user, role } = useAuth();
  // Referencias para el menú móvil
  const mobileMenuRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- A. PERSISTENCIA Y NAVEGACIÓN DE PESTAÑAS ---
  const getInitialSubMenu = () => {
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    if (urlTab) return urlTab;
    const savedTab = localStorage.getItem('salesModule_activeTab');
    if (savedTab) return savedTab;
    return 'clientes';
  };

  const [activeSubMenu, setActiveSubMenu] = useState(getInitialSubMenu());

  useEffect(() => {
    localStorage.setItem('salesModule_activeTab', activeSubMenu);
    const url = new URL(window.location);
    url.searchParams.set('tab', activeSubMenu);
    window.history.replaceState({}, '', url);
  }, [activeSubMenu]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [clienteTab, setClienteTab] = useState('registrar');
  const [visitasTab, setVisitasTab] = useState('potenciales');
  const [neTab, setNeTab] = useState('crear_ne');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Data Global
  const [sellersList, setSellersList] = useState([]);
  const [clients, setClients] = useState([]);
  const [potenciales, setPotenciales] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [comisionesData, setComisionesData] = useState({
    pendientes: 0.0,
    pendientesNe: 0.0,
    penalizaciones: 0.0,
    vales: 0.0,
  });
  const [paymentNotificationsMap, setPaymentNotificationsMap] = useState({});
  const [imageModal, setImageModal] = useState({
    open: false,
    url: '',
    title: '',
    clientId: null,
    fieldName: null,
  });

  // --- ESTADOS PARA CONFIGURACIÓN GLOBAL Y FOLIO (ACTUALIZADO PARA 4 MODALIDADES) ---
  const [globalDiscount53, setGlobalDiscount53] = useState(53.38);
  const [globalDiscount23, setGlobalDiscount23] = useState(23.08);
  const [globalDiscount10, setGlobalDiscount10] = useState(10); // Nueva modalidad
  const [globalDiscount0, setGlobalDiscount0] = useState(0); // Nueva modalidad
  const [globalTerms, setGlobalTerms] = useState('Cargando términos...');
  const [estimatedNextFolio, setEstimatedNextFolio] = useState('...');
  const [userSettlementHistory, setUserSettlementHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');

  // ---------------------------------------------------------------------------
  // 1. ESTADOS: SECCIÓN CLIENTES
  // ---------------------------------------------------------------------------
  const [clientForm, setClientForm] = useState({
    nombre: '',
    ci_numero: '',
    rif_numero: '',
    ciudad: '',
    estado: '',
    local: '',
    telefono: '',
    asignado_id: user?.id || '',
  });
  const [ciFile, setCiFile] = useState(null);
  const [rifFile, setRifFile] = useState(null);
  const [adicionalFile, setAdicionalFile] = useState(null);
  const [searchPotencialesQuery, setSearchPotencialesQuery] = useState('');
  const [editClientModal, setEditClientModal] = useState({
    open: false,
    clientData: null,
  });
  const [editClientForm, setEditClientForm] = useState({
    nombre: '',
    ci_numero: '',
    rif_numero: '',
    ciudad: '',
    estado: '',
    local: '',
    telefono: '',
    asignado_id: '',
  });
  const [editCiFile, setEditCiFile] = useState(null);
  const [editRifFile, setEditRifFile] = useState(null);
  const [editAdicionalFile, setEditAdicionalFile] = useState(null);

  // ---------------------------------------------------------------------------
  // 2. ESTADOS: SECCIÓN VISITAS & POTENCIALES
  // ---------------------------------------------------------------------------
  const [searchClientQuery, setSearchClientQuery] = useState('');
  const [visitasGps, setVisitasGps] = useState({});
  const [visitasFiles, setVisitasFiles] = useState({});
  const [potencialForm, setPotencialForm] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
  });
  const [potencialFile, setPotencialFile] = useState(null);
  const [potencialGps, setPotencialGps] = useState(null);
  const [convertModal, setConvertModal] = useState({
    open: false,
    potencialData: null,
  });
  const [convertForm, setConvertForm] = useState({
    nombre: '',
    ci_numero: '',
    rif_numero: '',
    ciudad: '',
    estado: '',
    local: '',
    telefono: '',
    asignado_id: user?.id || '',
  });
  const [convertCiFile, setConvertCiFile] = useState(null);
  const [convertRifFile, setConvertRifFile] = useState(null);
  const [convertAdicionalFile, setConvertAdicionalFile] = useState(null);

  // ---------------------------------------------------------------------------
  // 3. ESTADOS: SECCIÓN NOTA DE ENTREGA
  // ---------------------------------------------------------------------------
  const [editModeId, setEditModeId] = useState(null);
  // Estados para SearchableDropdowns en Crear N.E.
  const [neClientId, setNeClientId] = useState('');
  const [neSearchProduct, setNeSearchProduct] = useState('');
  const [neSelectedProdId, setNeSelectedProdId] = useState('');
  const [neCategoria, setNeCategoria] = useState('bombillos');
  // B. ACTUALIZACIÓN: Modalidad ahora soporta 4 valores
  const [neTipoPago, setNeTipoPago] = useState('53.38');
  const [neQuantity, setNeQuantity] = useState(1);
  const [neCart, setNeCart] = useState([]);

  // NUEVO: Efecto para recalcular precios del carrito al cambiar el tipo de pago/descuento
  useEffect(() => {
    if (neCart.length > 0) {
      const nuevoPct = getDiscountPercent(neTipoPago);
      const carritoActualizado = neCart.map((item) => {
        const vuConDescuento = item.unit_price_usd * (1 - nuevoPct / 100);
        return {
          ...item,
          discounted_unit_price_usd: vuConDescuento,
          total_line_usd: item.quantity * vuConDescuento,
        };
      });
      setNeCart(carritoActualizado);
    }
  }, [neTipoPago]);

  const [neObservacion, setNeObservacion] = useState('');
  const [neGpsLocation, setNeGpsLocation] = useState(null);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [showFullSellerCard, setShowFullSellerCard] = useState(true);
  const [valeModal, setValeModal] = useState({
    open: false,
    notaId: null,
    monto: '',
  });
  const [abonoNotifModal, setAbonoNotifModal] = useState({
    open: false,
    notaId: null,
  });
  const [abonoForm, setAbonoForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount_usd: '',
    payment_method: 'Pago Móvil',
    reference_number: '',
    user_note: '',
  });
  const [abonoFiles, setAbonoFiles] = useState({});
  // Nuevo estado para historial de vales independientes
  const [independentValesHistory, setIndependentValesHistory] = useState([]);

  // ---------------------------------------------------------------------------
  // NUEVOS ESTADOS PARA REQUERIMIENTOS
  // ---------------------------------------------------------------------------
  // B. Bloqueo Anti-Spam
  const [valesLocked, setValesLocked] = useState(false);
  const [notifLocked, setNotifLocked] = useState(false);

  // A. Modal de Edición de Nota de Entrega
  const [editNeModal, setEditNeModal] = useState({
    open: false,
    noteData: null,
  });
  const [editNeForm, setEditNeForm] = useState({
    client_id: '',
    category: 'bombillos',
    payment_discount: '53.38',
    observation: '',
  });
  const [editNeCart, setEditNeCart] = useState([]);
  const [editNeSearchProd, setEditNeSearchProd] = useState('');
  const [editNeSelectedProdId, setEditNeSelectedProdId] = useState('');
  const [editNeQuantity, setEditNeQuantity] = useState(1);

  // D. Estado para Vales Independientes
  const [independentValeForm, setIndependentValeForm] = useState({
    monto: '',
    motivo: '',
  });

  // ---------------------------------------------------------------------------
  // EFECTO PARA AUTO-OCULTAR NOTIFICACIONES
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ---------------------------------------------------------------------------
  // CARGA DE DATOS INICIALES
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    fetchGlobalSettings();
    fetchEstimatedFolio();
    fetchSellers();
    fetchClients();
    fetchPotenciales();
    fetchProducts();
    fetchSalesHistory();
    fetchComisionesYVales();
    fetchPaymentNotifications();
    fetchUserSettlementHistory();
    fetchIndependentValesHistory();
  }, [user, role]);

  const fetchGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*');
      if (!error && data) {
        const settingsMap = {};
        data.forEach((item) => {
          settingsMap[item.setting_key] = item.setting_value;
        });
        if (settingsMap['ne_discount_53'])
          setGlobalDiscount53(Number(settingsMap['ne_discount_53']));
        if (settingsMap['ne_discount_23'])
          setGlobalDiscount23(Number(settingsMap['ne_discount_23']));
        if (settingsMap['ne_discount_10'])
          setGlobalDiscount10(Number(settingsMap['ne_discount_10']));
        if (settingsMap['ne_discount_0'])
          setGlobalDiscount0(Number(settingsMap['ne_discount_0']));
        if (settingsMap['ne_terms_conditions'])
          setGlobalTerms(settingsMap['ne_terms_conditions']);
      } else if (error) {
        console.error('Error cargando configuración global: ', error);
      }
    } catch (err) {
      console.error('Error inesperado cargando configuración:', err);
    }
  };

  const fetchEstimatedFolio = async () => {
    try {
      // Intentamos consultar directamente el siguiente valor de la secuencia de PostgreSQL
      const { data, error } = await supabase.rpc('get_next_sales_order_folio');
      if (!error && data) {
        setEstimatedNextFolio(String(data));
      } else {
        // Fallback si la función RPC no existe aún
        const { data: ordData } = await supabase
          .from('sales_orders')
          .select('transaction_number');
        if (ordData && ordData.length > 0) {
          const numbers = ordData
            .map((item) => Number(item.transaction_number))
            .filter((n) => !isNaN(n));
          const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
          setEstimatedNextFolio(String(maxNum + 1));
        } else {
          setEstimatedNextFolio('1001');
        }
      }
    } catch {
      setEstimatedNextFolio('1001');
    }
  };

  const fetchPaymentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_payment_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        const map = {};
        data.forEach((item) => {
          if (
            !map[item.order_id] ||
            (item.status === 'pending' &&
              map[item.order_id].status !== 'pending')
          ) {
            map[item.order_id] = item;
          }
        });
        setPaymentNotificationsMap(map);
      }
    } catch (e) {
      console.error('Error cargando seller_payment_notifications:', e);
    }
  };

  const fetchSellers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select(
        'id, full_name, email, role, pct_bombillos, pct_fluidos, sales_goal_usd, sueldo_fijo_usd'
      );
    if (data) setSellersList(data);
  };

  const fetchClients = async () => {
    let query = supabase
      .from('clients')
      .select('*, profiles:assigned_seller_id(full_name, email, role)')
      .eq('is_potential', false)
      .eq('assigned_seller_id', user?.id);
    const { data } = await query.order('name', { ascending: true });
    if (data) setClients(data);
  };

  const fetchPotenciales = async () => {
    let query = supabase
      .from('clients')
      .select('*, profiles:assigned_seller_id(full_name)')
      .eq('is_potential', true)
      .eq('assigned_seller_id', user?.id);
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setPotenciales(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('description', { ascending: true });
    if (data) setProducts(data);
  };

  const fetchSalesHistory = async () => {
    let query = supabase
      .from('sales_orders')
      .select(
        '*, clients(name), profiles:seller_id(full_name, email, role, pct_bombillos, pct_fluidos, sales_goal_usd), vales(id, requested_amount_usd, status)'
      )
      .eq('seller_id', user?.id);
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setSalesHistory(data);
  };

  const fetchUserSettlementHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('settlement_invoices')
        .select(
          '*, user:profiles!settlement_invoices_user_id_fkey(full_name, role, pct_bombillos, pct_fluidos)'
        )
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        const formatted = data.map((inv) => {
          const c53g = Number(inv.comm_53_gross_usd || 0);
          const c23g = Number(inv.comm_23_gross_usd || 0);
          const pctB = Number(inv.user?.pct_bombillos || 3) / 100;
          const estTotalNe = pctB > 0 ? c53g / pctB + c23g / pctB : 0;
          return {
            id: inv.invoice_code,
            dbId: inv.id,
            user: inv.user,
            cycle: inv.cycle,
            month: inv.month,
            year: inv.year,
            bcvRate: Number(Number(inv.bcv_rate).toFixed(2)),
            sueldoFijo: Number(inv.sueldo_fijo_usd),
            sueldoFijoCurrency: inv.sueldo_fijo_currency || 'USD',
            comm53Gross: c53g,
            comm23Gross: c23g,
            vales53: Number(inv.vales_deduction_53_usd),
            vales23: Number(inv.vales_deduction_23_usd),
            comm53Net: Number(inv.comm_53_net_usd),
            comm23Net: Number(inv.comm_23_net_usd),
            totalEquivalentUsd: Number(inv.total_neto_pagar_usd),
            totalNetoPagarBs: Number(inv.total_neto_pagar_bs),
            totalNeAmount: estTotalNe,
            capturedHTML: inv.captured_html || '',
            datePaid: new Date(inv.created_at).toLocaleString(),
            rawInv: inv,
          };
        });
        setUserSettlementHistory(formatted);
      }
    } catch (err) {
      console.error('Error obteniendo historial de facturación:', err);
    }
  };

  const fetchComisionesYVales = async () => {
    try {
      let valesQuery = supabase
        .from('vales')
        .select('requested_amount_usd, status')
        .eq('seller_id', user?.id);
      const { data: valesData } = await valesQuery;
      const totalVales = valesData
        ? valesData
            .filter((v) => v.status === 'aprobada')
            .reduce((acc, v) => acc + (Number(v.requested_amount_usd) || 0), 0)
        : 0;

      let salesQuery = supabase
        .from('sales_orders')
        .select(
          'final_price_usd, payment_status, category, seller_id, profiles:seller_id(pct_bombillos, pct_fluidos)'
        )
        .eq('seller_id', user?.id);
      const { data: salesData } = await salesQuery;
      let totalCerradas = 0;
      let totalPendientesNe = 0;
      if (salesData) {
        salesData.forEach((s) => {
          const precio = Number(s.final_price_usd) || 0;
          const cat = s.category?.toLowerCase() || 'bombillos';
          const pctBombillos = Number(s.profiles?.pct_bombillos) || 0;
          const pctFluidos = Number(s.profiles?.pct_fluidos) || 0;
          const porcentajeAplicado =
            cat === 'fluidos' ? pctFluidos : pctBombillos;
          const comisionOrden = precio * (porcentajeAplicado / 100);
          if (s.payment_status === 'cerrada') {
            totalCerradas += comisionOrden;
          } else {
            totalPendientesNe += comisionOrden;
          }
        });
      }

      const { data: penaltiesData, error: penErr } = await supabase
        .from('penalties')
        .select('amount, status')
        .eq('seller_id', user?.id)
        .in('status', ['pendiente', 'aprobada', 'approved']);
      const totalPenalizaciones =
        !penErr && penaltiesData
          ? penaltiesData.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
          : 0;

      setComisionesData({
        pendientes: totalCerradas,
        pendientesNe: totalPendientesNe,
        penalizaciones: totalPenalizaciones,
        vales: totalVales,
      });
    } catch (err) {
      console.error('Error obteniendo comisiones/vales:', err);
    }
  };
  // Función para cargar historial de vales independientes
  const fetchIndependentValesHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('vales')
        .select('*')
        .eq('seller_id', user?.id)
        .is('order_id', null) // Solo vales sin N.E. asociada
        .order('created_at', { ascending: false });

      if (!error && data) {
        setIndependentValesHistory(data);
      }
    } catch (err) {
      console.error('Error cargando historial de vales:', err);
    }
  };
  const sellerProfile = sellersList.find((s) => s.id === user?.id);
  const currentSellerName =
    sellerProfile?.full_name ||
    user?.full_name ||
    user?.user_metadata?.full_name ||
    'Vendedor Registrado';
  const currentUserRole = sellerProfile?.role || role || 'vendedor';

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const totalNeFromHistory = salesHistory.reduce(
    (acc, n) => acc + (Number(n.final_price_usd) || 0),
    0
  );
  const totalNeFromSettlements = userSettlementHistory.reduce(
    (acc, h) => acc + (Number(h.totalNeAmount) || 0),
    0
  );
  const grandTotalNe = totalNeFromHistory + totalNeFromSettlements;
  const sellerSalesTotal = grandTotalNe;
  const sellerMetaGoal = Number(sellerProfile?.sales_goal_usd || 0);
  const remainingToGoal = Math.max(0, sellerMetaGoal - sellerSalesTotal);
  const totalCommissionsReceived = userSettlementHistory.reduce(
    (acc, h) => acc + (Number(h.totalEquivalentUsd) || 0),
    0
  );
  const fixedSalary = Number(sellerProfile?.sueldo_fijo_usd || 0);

  // ---------------------------------------------------------------------------
  // HELPER GPS & STORAGE
  // ---------------------------------------------------------------------------
  const getDeviceLocation = (callback) => {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada en este navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
        });
      },
      (error) => alert('Error GPS: ' + error.message)
    );
  };

  const uploadFile = async (file, bucketName, pathFolder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${pathFolder}/${fileName}`;
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getStoragePathFromUrl = (url, bucketName) => {
    if (!url) return null;
    try {
      const parts = url.split(`${bucketName}/`);
      return parts.length > 1 ? parts[1] : null;
    } catch (e) {
      return null;
    }
  };

  const validateImageFile = (file) => {
    if (!file) return true;
    return file.type.startsWith('image/');
  };

  // ---------------------------------------------------------------------------
  // MANEJADORES: CLIENTES OFICIALES
  // ---------------------------------------------------------------------------
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!ciFile || !rifFile) {
      alert('Es obligatorio adjuntar la C.I. y el RIF.');
      return;
    }
    if (!validateImageFile(ciFile) || !validateImageFile(rifFile)) {
      alert('Los archivos de C.I. y RIF deben ser imágenes (jpg, png, etc.).');
      return;
    }
    if (adicionalFile && !validateImageFile(adicionalFile)) {
      alert('El documento adicional debe ser una imagen.');
      return;
    }
    setLoading(true);
    try {
      const ciUrl = await uploadFile(ciFile, 'documents', 'ci');
      const rifUrl = await uploadFile(rifFile, 'documents', 'rif');
      const adicUrl = adicionalFile
        ? await uploadFile(adicionalFile, 'documents', 'adicional')
        : null;
      const { error } = await supabase.from('clients').insert([
        {
          name: clientForm.nombre,
          ci_number: clientForm.ci_numero,
          ci_photo_url: ciUrl,
          rif_number: clientForm.rif_numero,
          rif_photo_url: rifUrl,
          city: clientForm.ciudad,
          state: clientForm.estado,
          address_detail: clientForm.local,
          phone: clientForm.telefono,
          assigned_seller_id: user?.id,
          additional_doc_url: adicUrl,
          is_potential: false,
        },
      ]);
      if (error) throw error;
      setMessage({
        type: 'success',
        text: 'Cliente registrado correctamente.',
      });
      setClientForm({
        nombre: '',
        ci_numero: '',
        rif_numero: '',
        ciudad: '',
        estado: '',
        local: '',
        telefono: '',
        asignado_id: user?.id || '',
      });
      setCiFile(null);
      setRifFile(null);
      setAdicionalFile(null);
      fetchClients();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditClient = (client) => {
    setEditClientForm({
      nombre: client.name || '',
      ci_numero: client.ci_number || '',
      rif_numero: client.rif_number || '',
      ciudad: client.city || '',
      estado: client.state || '',
      local: client.address_detail || '',
      telefono: client.phone || '',
      asignado_id: client.assigned_seller_id || user?.id || '',
    });
    setEditCiFile(null);
    setEditRifFile(null);
    setEditAdicionalFile(null);
    setEditClientModal({ open: true, clientData: client });
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (editCiFile && !validateImageFile(editCiFile)) {
      alert('La nueva foto de C.I. debe ser una imagen.');
      return;
    }
    if (editRifFile && !validateImageFile(editRifFile)) {
      alert('La nueva foto de RIF debe ser una imagen.');
      return;
    }
    if (editAdicionalFile && !validateImageFile(editAdicionalFile)) {
      alert('El nuevo documento adicional debe ser una imagen.');
      return;
    }
    setLoading(true);
    try {
      let ciUrl = editClientModal.clientData.ci_photo_url;
      let rifUrl = editClientModal.clientData.rif_photo_url;
      let adicUrl = editClientModal.clientData.additional_doc_url;

      if (editCiFile) {
        if (ciUrl) {
          const oldPath = getStoragePathFromUrl(ciUrl, 'documents');
          if (oldPath)
            await supabase.storage.from('documents').remove([oldPath]);
        }
        ciUrl = await uploadFile(editCiFile, 'documents', 'ci');
      }
      if (editRifFile) {
        if (rifUrl) {
          const oldPath = getStoragePathFromUrl(rifUrl, 'documents');
          if (oldPath)
            await supabase.storage.from('documents').remove([oldPath]);
        }
        rifUrl = await uploadFile(editRifFile, 'documents', 'rif');
      }
      if (editAdicionalFile) {
        if (adicUrl) {
          const oldPath = getStoragePathFromUrl(adicUrl, 'documents');
          if (oldPath)
            await supabase.storage.from('documents').remove([oldPath]);
        }
        adicUrl = await uploadFile(editAdicionalFile, 'documents', 'adicional');
      }

      const { error } = await supabase
        .from('clients')
        .update({
          name: editClientForm.nombre,
          ci_number: editClientForm.ci_numero,
          ci_photo_url: ciUrl,
          rif_number: editClientForm.rif_numero,
          rif_photo_url: rifUrl,
          city: editClientForm.ciudad,
          state: editClientForm.estado,
          address_detail: editClientForm.local,
          phone: editClientForm.telefono,
          assigned_seller_id: user?.id,
          additional_doc_url: adicUrl,
        })
        .eq('id', editClientModal.clientData.id);
      if (error) throw error;
      setMessage({
        type: 'success',
        text: 'Datos y documentos del cliente actualizados correctamente.',
      });
      setEditClientModal({ open: false, clientData: null });
      fetchClients();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId, clientName) => {
    if (!window.confirm('¿Está seguro que desea eliminar este registro?')) {
      return;
    }
    setLoading(true);
    try {
      const { data: activeOrders, error: ordersErr } = await supabase
        .from('sales_orders')
        .select('id, status, transaction_number')
        .eq('client_id', clientId)
        .in('status', ['pendiente', 'aprobada']);
      if (ordersErr) throw ordersErr;
      if (activeOrders && activeOrders.length > 0) {
        const count = activeOrders.length;
        const firstTrans =
          activeOrders[0].transaction_number ||
          activeOrders[0].id.substring(0, 6);
        setMessage({
          type: 'error',
          text: `No se puede eliminar al cliente "${clientName}" porque tiene ${count} Nota(s) de Entrega activa(s) (Ej: #${firstTrans}). Finalice o elimine las notas primero.`,
        });
        setLoading(false);
        return;
      }

      const { data: client, error: fetchErr } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      if (fetchErr) throw fetchErr;

      const docPaths = [
        getStoragePathFromUrl(client.ci_photo_url, 'documents'),
        getStoragePathFromUrl(client.rif_photo_url, 'documents'),
        getStoragePathFromUrl(client.additional_doc_url, 'documents'),
      ].filter(Boolean);
      const visitPath = getStoragePathFromUrl(
        client.last_visit_photo_url,
        'visits'
      );

      if (docPaths.length > 0) {
        await supabase.storage.from('documents').remove(docPaths);
      }
      if (visitPath) {
        await supabase.storage.from('visits').remove([visitPath]);
      }

      const { error: deleteErr } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      if (deleteErr) throw deleteErr;
      setMessage({
        type: 'success',
        text: `El cliente "${clientName}" fue eliminado exitosamente.`,
      });
      fetchClients();
      fetchPotenciales();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error al eliminar cliente: ' + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // MANEJADORES: POTENCIALES CLIENTES
  // ---------------------------------------------------------------------------
  const handleSaveNuevoPotencial = async (e) => {
    e.preventDefault();
    if (!potencialGps) {
      alert(
        'REQUISITO OBLIGATORIO: Debe capturar la ubicación GPS antes de guardar el cliente potencial.'
      );
      return;
    }
    if (potencialFile && !validateImageFile(potencialFile)) {
      alert('La foto adjunta debe ser una imagen.');
      return;
    }
    setLoading(true);
    try {
      let adjuntoUrl = null;
      if (potencialFile) {
        adjuntoUrl = await uploadFile(potencialFile, 'visits', 'potenciales');
      }
      const { error } = await supabase.from('clients').insert([
        {
          name: potencialForm.nombre,
          city: 'N/A',
          state: 'N/A',
          address_detail: potencialForm.direccion,
          phone: potencialForm.telefono,
          assigned_seller_id: user?.id,
          last_visit_photo_url: adjuntoUrl,
          last_gps_location: { lat: potencialGps.lat, lng: potencialGps.lng },
          last_visit_at: new Date().toISOString(),
          is_potential: true,
        },
      ]);
      if (error) throw error;
      setMessage({
        type: 'success',
        text: 'Cliente Potencial guardado y registrado con GPS.',
      });
      setPotencialForm({ nombre: '', direccion: '', telefono: '' });
      setPotencialFile(null);
      setPotencialGps(null);
      fetchPotenciales();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureVisitaGps = async (id) => {
    getDeviceLocation(async (coords) => {
      setVisitasGps((prev) => ({ ...prev, [id]: coords }));
      try {
        await supabase
          .from('clients')
          .update({
            last_gps_location: { lat: coords.lat, lng: coords.lng },
          })
          .eq('id', id);
      } catch (err) {
        console.error('Error guardando GPS inmediato:', err);
      }
    });
  };

  const handleSaveVisita = async (id, isPotencial) => {
    const gps = visitasGps[id];
    if (!gps) {
      alert(
        'Debe presionar el botón GPS para extraer la ubicación antes de guardar la visita.'
      );
      return;
    }
    const file = visitasFiles[id];
    if (file && !validateImageFile(file)) {
      alert('La foto de la visita debe ser una imagen.');
      return;
    }
    setLoading(true);
    try {
      let adjuntoUrl = null;
      if (file) {
        adjuntoUrl = await uploadFile(file, 'visits', 'visitas');
      }
      const updateData = {
        last_visit_at: new Date().toISOString(),
        last_gps_location: { lat: gps.lat, lng: gps.lng },
      };
      if (adjuntoUrl) updateData.last_visit_photo_url = adjuntoUrl;

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;

      try {
        await supabase.from('client_visits').insert([
          {
            client_id: id,
            seller_id: user?.id,
            latitude: gps.lat,
            longitude: gps.lng,
            observation: 'Visita registrada desde módulo de ventas',
          },
        ]);
      } catch (visitErr) {
        console.warn(
          'No se pudo registrar en client_visits, pero la visita principal se guardó.',
          visitErr
        );
      }

      setMessage({
        type: 'success',
        text: 'Visita actualizada y coordenadas GPS guardadas con éxito.',
      });
      setVisitasGps((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      if (isPotencial) fetchPotenciales();
      else fetchClients();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConvertModal = (potencial) => {
    setConvertForm({
      nombre: potencial.name || '',
      ci_numero: '',
      rif_numero: '',
      ciudad: '',
      estado: '',
      local: potencial.address_detail || '',
      telefono: potencial.phone || '',
      asignado_id: user?.id || '',
    });
    setConvertCiFile(null);
    setConvertRifFile(null);
    setConvertAdicionalFile(null);
    setConvertModal({ open: true, potencialData: potencial });
  };

  const handleSaveConvertion = async (e) => {
    e.preventDefault();
    if (!convertCiFile || !convertRifFile) {
      alert(
        'Es obligatorio adjuntar la C.I. y el RIF para registrar como cliente oficial.'
      );
      return;
    }
    if (
      !validateImageFile(convertCiFile) ||
      !validateImageFile(convertRifFile)
    ) {
      alert('Los archivos de C.I. y RIF deben ser imágenes.');
      return;
    }
    if (convertAdicionalFile && !validateImageFile(convertAdicionalFile)) {
      alert('El documento adicional debe ser una imagen.');
      return;
    }
    setLoading(true);
    try {
      const ciUrl = await uploadFile(convertCiFile, 'documents', 'ci');
      const rifUrl = await uploadFile(convertRifFile, 'documents', 'rif');
      const adicUrl = convertAdicionalFile
        ? await uploadFile(convertAdicionalFile, 'documents', 'adicional')
        : null;
      const { error } = await supabase
        .from('clients')
        .update({
          name: convertForm.nombre,
          ci_number: convertForm.ci_numero,
          ci_photo_url: ciUrl,
          rif_number: convertForm.rif_numero,
          rif_photo_url: rifUrl,
          city: convertForm.ciudad,
          state: convertForm.estado,
          address_detail: convertForm.local,
          phone: convertForm.telefono,
          assigned_seller_id: user?.id,
          additional_doc_url: adicUrl,
          is_potential: false,
        })
        .eq('id', convertModal.potencialData.id);
      if (error) throw error;
      setMessage({
        type: 'success',
        text: `¡El cliente "${convertForm.nombre}" ha sido promovido a Cliente Oficial!`,
      });
      setConvertModal({ open: false, potencialData: null });
      fetchClients();
      fetchPotenciales();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // MANEJADORES: NOTA DE ENTREGA & DESCARGA/ENVÍO PDF
  // ---------------------------------------------------------------------------
  // B. FUNCIÓN AUXILIAR PARA OBTENER PORCENTAJE DINÁMICO
  const getDiscountPercent = (type) => {
    switch (String(type)) {
      case '53.38':
        return globalDiscount53;
      case '23.08':
        return globalDiscount23;
      case '10':
        return globalDiscount10;
      case '0':
        return globalDiscount0;
      default:
        return globalDiscount53;
    }
  };

  const porcentajeDescuento = getDiscountPercent(neTipoPago);
  const filteredProducts = products.filter(
    (p) =>
      (!p.category || p.category.toLowerCase() === neCategoria.toLowerCase()) &&
      (p.description?.toLowerCase().includes(neSearchProduct.toLowerCase()) ||
        p.code?.toLowerCase().includes(neSearchProduct.toLowerCase()))
  );

  const handleAddToCart = () => {
    if (!neSelectedProdId) return;
    const prod = products.find((p) => p.id === neSelectedProdId);
    if (!prod) return;

    const qty = Number(neQuantity);
    if (qty <= 0) return alert('Cantidad debe ser mayor a 0');

    // --- VALIDACIÓN DE STOCK ROBUSTA ---
    const currentStock = Number(prod.stock_current || 0);

    // 1. Verificar si hay stock disponible
    if (currentStock <= 0) {
      return alert(
        `El producto "${prod.description}" no tiene stock disponible.`
      );
    }

    // 2. Verificar stock considerando lo que YA está en el carrito
    const inCart = neCart.find((item) => item.product_id === prod.id);
    const currentInCart = inCart ? inCart.quantity : 0;

    if (currentInCart + qty > currentStock) {
      return alert(
        `Stock insuficiente.\nDisponible: ${currentStock}\nEn carrito: ${currentInCart}\nSolicitado: ${qty}`
      );
    }
    // ------------------------------------

    // B. RECÁLCULO DINÁMICO AL AGREGAR
    const valorUnitario = prod.price_usd;
    const vuConDescuento = valorUnitario * (1 - porcentajeDescuento / 100);

    if (inCart) {
      setNeCart(
        neCart.map((item) =>
          item.product_id === prod.id
            ? {
                ...item,
                quantity: item.quantity + qty,
                total_line_usd: (item.quantity + qty) * vuConDescuento,
              }
            : item
        )
      );
    } else {
      setNeCart([
        ...neCart,
        {
          product_id: prod.id,
          code: prod.code || 'S/C',
          description: prod.description,
          quantity: qty,
          unit_price_usd: valorUnitario,
          discounted_unit_price_usd: vuConDescuento,
          total_line_usd: qty * vuConDescuento,
        },
      ]);
    }
    setNeSelectedProdId('');
    setNeQuantity(1);
  };

  const handleRemoveFromCart = (id) => {
    setNeCart(neCart.filter((item) => item.product_id !== id));
  };

  const totalSinDescuento = neCart.reduce(
    (acc, i) => acc + i.unit_price_usd * i.quantity,
    0
  );
  const precioFinal = neCart.reduce((acc, i) => acc + i.total_line_usd, 0);
  const montoAhorrado = totalSinDescuento - precioFinal;

  const handleSendProposal = async () => {
    if (!neClientId) return alert('Seleccione un cliente.');
    if (neCart.length === 0) return alert('El carrito está vacío.');
    if (!neGpsLocation)
      return alert('Debe extraer la ubicación GPS para enviar la propuesta.');
    setLoading(true);
    try {
      const payload = {
        client_id: neClientId,
        seller_id: user?.id,
        category: neCategoria,
        payment_discount: neTipoPago,
        total_base_usd: totalSinDescuento,
        discount_amount_usd: montoAhorrado,
        final_price_usd: precioFinal,
        total_paid_usd: 0.0,
        balance_due_usd: precioFinal,
        status: 'pendiente',
        payment_status: 'pendiente',
        observation: neObservacion,
        latitude: neGpsLocation.lat,
        longitude: neGpsLocation.lng,
        gps_captured_at: neGpsLocation.timestamp || new Date().toISOString(),
      };

      let orderId = editModeId;
      let transactionNumber = null;

      if (editModeId) {
        const { data: updatedData, error } = await supabase
          .from('sales_orders')
          .update(payload)
          .eq('id', editModeId)
          .select()
          .single();
        if (error) throw error;
        transactionNumber = updatedData?.transaction_number;
        await supabase.from('order_items').delete().eq('order_id', editModeId);
      } else {
        const { data: newNota, error } = await supabase
          .from('sales_orders')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        orderId = newNota.id;
        transactionNumber = newNota.transaction_number;
      }

      const detalles = neCart.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_usd: item.unit_price_usd,
        discounted_unit_price_usd: item.discounted_unit_price_usd,
        total_line_usd: item.total_line_usd,
      }));
      await supabase.from('order_items').insert(detalles);

      try {
        await notificarAdminNuevaNota({
          transactionNumber: transactionNumber,
          sellerName: currentSellerName,
          clientName: selectedClientData?.name || 'Cliente',
          totalUsd: precioFinal,
        });
      } catch (notifErr) {
        console.warn(
          'La nota se creó/editó correctamente, pero hubo un error al enviar la notificación:',
          notifErr
        );
      }

      setMessage({
        type: 'success',
        text: editModeId
          ? 'Nota de Entrega editada correctamente.'
          : 'Nota de Entrega enviada a revisión con coordenadas GPS guardadas.',
      });
      setNeCart([]);
      setNeClientId('');
      setNeObservacion('');
      setNeGpsLocation(null);
      setEditModeId(null);
      fetchSalesHistory();
      fetchComisionesYVales();
      fetchEstimatedFolio();
      setNeTab('historial');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // A. LÓGICA DE EDICIÓN MEDIANTE MODAL
  // ---------------------------------------------------------------------------
  const handleOpenEditNeModal = async (nota) => {
    try {
      setLoading(true);
      // Cargar items de la orden
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*, products(code, description)')
        .eq('order_id', nota.id);

      if (error) throw error;

      const mappedItems = (items || []).map((item) => ({
        product_id: item.product_id,
        code: item.products?.code || 'S/C',
        description: item.products?.description || 'Producto',
        quantity: item.quantity,
        unit_price_usd: Number(item.unit_price_usd || 0),
        discounted_unit_price_usd: Number(item.discounted_unit_price_usd || 0),
        total_line_usd: Number(
          item.total_line_usd ||
            item.quantity * Number(item.discounted_unit_price_usd || 0)
        ),
      }));

      setEditNeForm({
        client_id: nota.client_id,
        category: nota.category || 'bombillos',
        payment_discount: String(nota.payment_discount || '53.38'),
        observation: nota.observation || '',
      });
      setEditNeCart(mappedItems);
      setEditNeModal({ open: true, noteData: nota });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'Error al cargar datos para edición.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditNeRecalculatePrices = (newDiscountType) => {
    const newPct = getDiscountPercent(newDiscountType);
    const recalculated = editNeCart.map((item) => {
      const newDiscPrice = item.unit_price_usd * (1 - newPct / 100);
      return {
        ...item,
        discounted_unit_price_usd: newDiscPrice,
        total_line_usd: item.quantity * newDiscPrice,
      };
    });
    setEditNeCart(recalculated);
  };

  const handleEditNeAddProduct = () => {
    if (!editNeSelectedProdId) return;
    const prod = products.find((p) => p.id === editNeSelectedProdId);
    if (!prod) return;
    const qty = Number(editNeQuantity);
    if (qty <= 0) return alert('La cantidad debe ser mayor a 0');

    const descPct = getDiscountPercent(editNeForm.payment_discount);
    const vuConDesc = Number(prod.price_usd) * (1 - descPct / 100);

    const existingIdx = editNeCart.findIndex((i) => i.product_id === prod.id);
    if (existingIdx > -1) {
      const updated = [...editNeCart];
      const newQty = updated[existingIdx].quantity + qty;
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: newQty,
        discounted_unit_price_usd: vuConDesc,
        total_line_usd: newQty * vuConDesc,
      };
      setEditNeCart(updated);
    } else {
      setEditNeCart([
        ...editNeCart,
        {
          product_id: prod.id,
          code: prod.code || 'S/C',
          description: prod.description,
          quantity: qty,
          unit_price_usd: Number(prod.price_usd),
          discounted_unit_price_usd: vuConDesc,
          total_line_usd: qty * vuConDesc,
        },
      ]);
    }
    setEditNeSelectedProdId('');
    setEditNeQuantity(1);
  };

  const handleEditNeRemoveItem = (product_id) => {
    setEditNeCart(editNeCart.filter((i) => i.product_id !== product_id));
  };

  const handleSaveEditedNe = async () => {
    if (!editNeModal.noteData) return;

    const totalBase = editNeCart.reduce(
      (acc, item) => acc + item.unit_price_usd * item.quantity,
      0
    );
    const finalPrice = editNeCart.reduce(
      (acc, item) => acc + item.total_line_usd,
      0
    );
    const discountAmount = Math.max(0, totalBase - finalPrice);

    try {
      setLoading(true);

      // Actualizar cabecera de la orden y CAMBIAR ESTADO A PENDIENTE
      const { error: updateErr } = await supabase
        .from('sales_orders')
        .update({
          client_id: editNeForm.client_id,
          category: editNeForm.category,
          payment_discount: editNeForm.payment_discount,
          total_base_usd: totalBase,
          discount_amount_usd: discountAmount,
          final_price_usd: finalPrice,
          balance_due_usd:
            finalPrice - Number(editNeModal.noteData.total_paid_usd || 0),
          observation: editNeForm.observation,
          status: 'pendiente', // Requisito A: Cambiar estado a pendiente
          updated_at: new Date(),
        })
        .eq('id', editNeModal.noteData.id);

      if (updateErr) throw updateErr;

      // Eliminar items antiguos
      const { error: delErr } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', editNeModal.noteData.id);

      if (delErr) throw delErr;

      // Insertar nuevos items
      if (editNeCart.length > 0) {
        const rowsToInsert = editNeCart.map((item) => ({
          order_id: editNeModal.noteData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price_usd: item.unit_price_usd,
          discounted_unit_price_usd: item.discounted_unit_price_usd,
          total_line_usd: item.total_line_usd,
        }));
        const { error: insErr } = await supabase
          .from('order_items')
          .insert(rowsToInsert);
        if (insErr) throw insErr;
      }

      setMessage({
        type: 'success',
        text: 'Nota de Entrega editada y enviada a aprobación.',
      });
      setEditNeModal({ open: false, noteData: null });
      fetchSalesHistory();
      fetchComisionesYVales();
      fetchIndependentValesHistory();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Error al guardar cambios.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditNE = async (nota) => {
    // Redirección antigua eliminada. Ahora abre modal.
    handleOpenEditNeModal(nota);
  };

  const handleDeleteNE = async (nota) => {
    if (!window.confirm('¿Está seguro que desea eliminar este registro?')) {
      return;
    }
    const totalAbonado = Number(nota.total_paid_usd) || 0;
    if (totalAbonado > 0) {
      alert(
        `No se puede eliminar la Nota de Entrega #${
          nota.transaction_number || nota.id.substring(0, 6)
        } porque ya registra abonos por un total de $${totalAbonado.toFixed(
          2
        )}.`
      );
      return;
    }
    setLoading(true);
    try {
      if (nota.status === 'aprobada') {
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', nota.id);
        if (!itemsErr && items) {
          for (const item of items) {
            const { data: prodData } = await supabase
              .from('products')
              .select('stock_current')
              .eq('id', item.product_id)
              .single();
            if (prodData) {
              const restoredStock = prodData.stock_current + item.quantity;
              await supabase
                .from('products')
                .update({ stock_current: restoredStock })
                .eq('id', item.product_id);
            }
          }
        }
      }
      const { error } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', nota.id);
      if (error) throw error;
      setMessage({
        type: 'success',
        text: 'Nota de Entrega eliminada correctamente.',
      });
      fetchSalesHistory();
      fetchComisionesYVales();
      fetchEstimatedFolio();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error al eliminar la Nota de Entrega: ' + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (nota) => {
    try {
      setLoading(true);
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*, products(code, description)')
        .eq('order_id', nota.id);
      if (error) throw error;
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const clientName = nota.clients?.name || 'Cliente';
      const transNo = nota.transaction_number || nota.id.substring(0, 8);
      const fecha = new Date(nota.created_at).toLocaleString();
      const vendedorName = currentSellerName;
      let itemsHtml = '';
      let subTotal = 0;
      if (items && items.length > 0) {
        items.forEach((item) => {
          const totalLine =
            item.total_line_usd ||
            item.quantity * item.discounted_unit_price_usd;
          subTotal += totalLine;
          itemsHtml += `<tr> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-family: monospace;">${
            item.products?.code || 'S/C'
          }</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd;">${
            item.products?.description || 'Producto'
          }</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: center;">${
            item.quantity
          }</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(
            item.unit_price_usd || 0
          ).toFixed(
            2
          )}</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right; color: #B45309;">$${Number(
            item.discounted_unit_price_usd || 0
          ).toFixed(
            2
          )}</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">$${Number(
            totalLine
          ).toFixed(2)}</td> </tr>`;
        });
      }
      const container = document.createElement('div');
      container.innerHTML = `<div style="font-family: Arial, sans-serif; color: #111; padding: 25px; background: #fff; width: 700px; height: 1000px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; margin: 0 auto;"> <div> <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px;"> <div> <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">FENIX AUTO PART C.A</h2> <p style="margin: 2px 0; font-size: 12px;"><strong>RIF:</strong> J-50261925-2</p> <p style="margin: 8px 0 0 0; font-size: 12px;"><strong>Cliente:</strong> ${clientName}</p> </div> <div style="text-align: right; font-size: 12px;"> <p style="margin: 2px 0;"><strong>N° Transacción:</strong> #${transNo}</p> <p style="margin: 2px 0;"><strong>Fecha/Hora:</strong> ${fecha}</p> <p style="margin: 2px 0;"><strong>Vendedor:</strong> ${vendedorName}</p> <p style="margin: 2px 0;"><strong>Categoría:</strong> ${
        nota.category || 'General'
      }</p> </div> </div> <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;"> <thead> <tr style="background-color: #f3f4f6;"> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Código</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Descripción</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Cantidad</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">V. Unitario</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">V. U. con Descuento</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Total Línea</th> </tr> </thead> <tbody> ${itemsHtml} </tbody> </table> </div> <div> <div style="display: flex; justify-content: flex-end; font-size: 12px; margin-bottom: 15px;"> <div style="width: 280px; background: #f9fafb; padding: 12px; border: 1px solid #ddd; border-radius: 6px;"> <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"> <span>Total Base:</span> <strong>$${Number(
        nota.total_base_usd || subTotal
      ).toFixed(
        2
      )}</strong> </div> <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #B45309;"> <span>Descuento Aplicado:</span> <strong>-$${Number(
        nota.discount_amount_usd || 0
      ).toFixed(
        2
      )}</strong> </div> <div style="display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 6px; font-weight: bold; font-size: 14px; color: #DC2626;"> <span>Precio Final:</span> <span>$${Number(
        nota.final_price_usd || subTotal
      ).toFixed(2)}</span> </div> </div> </div> ${
        nota.observation
          ? `<div style="font-size: 11px; color: #333; background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 4px; margin-bottom: 10px; text-align: justify;"><strong>Observación:</strong> ${nota.observation}</div>`
          : ''
      } <div style="font-size: 10px; color: #555; background: #f3f4f6; padding: 10px; border-radius: 4px; line-height: 1.4; text-align: justify;"><strong>Términos y condiciones:</strong> ${globalTerms}</div> </div> </div>`;
      const opciones = {
        margin: 0,
        filename: `nota-entrega-${transNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await window.html2pdf().from(container).set(opciones).save();
    } catch (err) {
      alert('Error al generar PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCapturedInvoicePDF = async (histItem) => {
    try {
      setLoading(true);
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const container = document.createElement('div');
      container.innerHTML = `<div style="font-family: Arial, sans-serif; color: #111; padding: 25px; background: #fff; width: 720px; box-sizing: border-box; margin: 0 auto;"> ${
        histItem.capturedHTML || '<p>Factura sin HTML capturado.</p>'
      } </div>`;
      const opciones = {
        margin: 0,
        filename: `factura-liquidacion-${histItem.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await window.html2pdf().from(container).set(opciones).save();
    } catch (err) {
      alert('Error al generar PDF de factura histórica: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPDF = async (nota) => {
    try {
      setLoading(true);
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*, products(code, description)')
        .eq('order_id', nota.id);
      if (error) throw error;
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const clientName = nota.clients?.name || 'Cliente';
      const transNo = nota.transaction_number || nota.id.substring(0, 8);
      const fecha = new Date(nota.created_at).toLocaleString();
      const vendedorName = currentSellerName;
      let itemsHtml = '';
      let subTotal = 0;
      if (items && items.length > 0) {
        items.forEach((item) => {
          const totalLine =
            item.total_line_usd ||
            item.quantity * item.discounted_unit_price_usd;
          subTotal += totalLine;
          itemsHtml += `<tr> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-family: monospace;">${
            item.products?.code || 'S/C'
          }</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd;">${
            item.products?.description || 'Producto'
          }</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: center;">${
            item.quantity
          }</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(
            item.unit_price_usd || 0
          ).toFixed(
            2
          )}</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right; color: #B45309;">$${Number(
            item.discounted_unit_price_usd || 0
          ).toFixed(
            2
          )}</td> <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">$${Number(
            totalLine
          ).toFixed(2)}</td> </tr>`;
        });
      }
      const container = document.createElement('div');
      container.innerHTML = `<div style="font-family: Arial, sans-serif; color: #111; padding: 25px; background: #fff; width: 700px; height: 1000px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; margin: 0 auto;"> <div> <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px;"> <div> <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">FENIX AUTO PART C.A</h2> <p style="margin: 2px 0; font-size: 12px;"><strong>RIF:</strong> J-50261925-2</p> <p style="margin: 8px 0 0 0; font-size: 12px;"><strong>Cliente:</strong> ${clientName}</p> </div> <div style="text-align: right; font-size: 12px;"> <p style="margin: 2px 0;"><strong>N° Transacción:</strong> #${transNo}</p> <p style="margin: 2px 0;"><strong>Fecha/Hora:</strong> ${fecha}</p> <p style="margin: 2px 0;"><strong>Vendedor:</strong> ${vendedorName}</p> <p style="margin: 2px 0;"><strong>Categoría:</strong> ${
        nota.category || 'General'
      }</p> </div> </div> <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;"> <thead> <tr style="background-color: #f3f4f6;"> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Código</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Descripción</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Cantidad</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">V. Unitario</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">V. U. con Descuento</th> <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Total Línea</th> </tr> </thead> <tbody> ${itemsHtml} </tbody> </table> </div> <div> <div style="display: flex; justify-content: flex-end; font-size: 12px; margin-bottom: 15px;"> <div style="width: 280px; background: #f9fafb; padding: 12px; border: 1px solid #ddd; border-radius: 6px;"> <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"> <span>Total Base:</span> <strong>$${Number(
        nota.total_base_usd || subTotal
      ).toFixed(
        2
      )}</strong> </div> <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #B45309;"> <span>Descuento Aplicado:</span> <strong>-$${Number(
        nota.discount_amount_usd || 0
      ).toFixed(
        2
      )}</strong> </div> <div style="display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 6px; font-weight: bold; font-size: 14px; color: #DC2626;"> <span>Precio Final:</span> <span>$${Number(
        nota.final_price_usd || subTotal
      ).toFixed(2)}</span> </div> </div> </div> ${
        nota.observation
          ? `<div style="font-size: 11px; color: #333; background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 4px; margin-bottom: 10px; text-align: justify;"><strong>Observación:</strong> ${nota.observation}</div>`
          : ''
      } <div style="font-size: 10px; color: #555; background: #f3f4f6; padding: 10px; border-radius: 4px; line-height: 1.4; text-align: justify;"><strong>Términos y condiciones:</strong> ${globalTerms}</div> </div> </div>`;
      const opt = {
        margin: 0,
        filename: `Nota-${transNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        output: 'blob',
      };
      const pdfBlob = await window
        .html2pdf()
        .from(container)
        .set(opt)
        .output('blob');
      const file = new File([pdfBlob], `Nota-Entrega-${transNo}.pdf`, {
        type: 'application/pdf',
      });
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Nota de Entrega #${transNo}`,
          text: `Hola, adjunto la Nota de Entrega #${transNo} para el cliente ${clientName}. Total: $${Number(
            nota.final_price_usd
          ).toFixed(2)}`,
          files: [file],
        });
      } else {
        await window
          .html2pdf()
          .from(container)
          .set({ ...opt, output: 'save' })
          .save();
        const mensaje = `Hola! Adjunto resumen de la Nota de Entrega Aprobada N° ${transNo} para el cliente *${clientName}*. Total Final: *$${Number(
          nota.final_price_usd
        ).toFixed(
          2
        )}*. (El PDF se descargó en tu dispositivo, por favor adjúntalo manualmente).`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(mensaje)}`,
          '_blank'
        );
      }
    } catch (err) {
      console.error(err);
      alert('Error al generar o compartir el PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // C. Lógica de Vale Independiente
  const handleSolicitarValeIndependiente = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!independentValeForm.monto || Number(independentValeForm.monto) <= 0) {
      return alert('Ingrese un monto válido');
    }

    // B. Bloqueo Anti-Spam (5 segundos)
    if (valesLocked) return;
    setValesLocked(true);
    setTimeout(() => setValesLocked(false), 5000);

    setLoading(true);
    try {
      const { error } = await supabase.from('vales').insert([
        {
          order_id: null,
          seller_id: user?.id,
          estimated_commission_usd: 0,
          requested_amount_usd: Number(independentValeForm.monto),
          status: 'pendiente',
        },
      ]);

      if (error) throw error;

      // Notificación opcional al admin
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'new_vale_request',
            payload: {
              nroTransaccion: 'VALE-IND',
              vendedorNombre: currentSellerName,
              clienteNombre: 'N/A',
              montoVale: Number(independentValeForm.monto).toFixed(2),
            },
          },
        });
      } catch (notifErr) {
        console.warn('Error enviando notificación de vale:', notifErr);
      }

      setMessage({
        type: 'success',
        text: 'Solicitud de vale independiente enviada correctamente.',
      });

      // Limpiar formulario, recargar comisiones y actualizar el historial al instante
      setIndependentValeForm({ monto: '', motivo: '' });
      fetchComisionesYVales();
      fetchIndependentValesHistory(); // <-- ESTA LÍNEA ACTUALIZA EL HISTORIAL AUTOMÁTICAMENTE
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarVale = async () => {
    // Mantenido por compatibilidad si se llama desde otro lado, pero redirige lógica
    if (!valeModal.monto || Number(valeModal.monto) <= 0)
      return alert('Ingrese un monto válido');

    // B. Bloqueo Anti-Spam
    if (valesLocked) return;
    setValesLocked(true);
    setTimeout(() => setValesLocked(false), 5000);

    setLoading(true);
    try {
      // C. Vale Independiente (ignoramos notaId si viene, o lo usamos solo para referencia textual si se desea, pero DB es null)
      const { error } = await supabase.from('vales').insert([
        {
          order_id: null, // Independiente
          seller_id: user?.id,
          estimated_commission_usd: 0,
          requested_amount_usd: Number(valeModal.monto),
          status: 'pendiente',
        },
      ]);
      if (error) throw error;
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'new_vale_request',
            payload: {
              nroTransaccion: 'VALE-IND',
              vendedorNombre: currentSellerName,
              clienteNombre: 'N/A',
              montoVale: Number(valeModal.monto).toFixed(2),
            },
          },
        });
        console.log('✅ Correo de solicitud de vale enviado al administrador');
      } catch (notifErr) {
        console.warn(
          'Error enviando correo de vale (no bloqueante):',
          notifErr
        );
      }
      setMessage({
        type: 'success',
        text: 'Solicitud de vale enviada y administrador notificado.',
      });
      setValeModal({ open: false, notaId: null, monto: '' });
      fetchSalesHistory();
      fetchComisionesYVales();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAbonoNotifModal = (notaId) => {
    const existing = paymentNotificationsMap[notaId];
    if (existing && existing.status === 'pending') {
      setAbonoForm({
        payment_date:
          existing.payment_date || new Date().toISOString().split('T')[0],
        amount_usd: existing.amount_usd || '',
        payment_method: existing.payment_method || 'Pago Móvil',
        reference_number: existing.reference_number || '',
        user_note: existing.user_note || '',
      });
    } else {
      setAbonoForm({
        payment_date: new Date().toISOString().split('T')[0],
        amount_usd: '',
        payment_method: 'Pago Móvil',
        reference_number: '',
        user_note: '',
      });
    }
    setAbonoFiles((prev) => ({ ...prev, [notaId]: null }));
    setAbonoNotifModal({ open: true, notaId });
  };

  const handleEnviarNotificacionAbono = async (e) => {
    e.preventDefault();
    if (!abonoNotifModal.notaId) return;

    // B. Bloqueo Anti-Spam
    if (notifLocked) return;
    setNotifLocked(true);
    setTimeout(() => setNotifLocked(false), 5000);

    const fileToUpload = abonoFiles[abonoNotifModal.notaId];
    if (!fileToUpload) {
      alert('Es obligatorio adjuntar una foto del billete o recibo.');
      return;
    }
    if (!validateImageFile(fileToUpload)) {
      alert('El comprobante debe ser una imagen.');
      return;
    }
    setLoading(true);
    try {
      const montoNum = parseFloat(abonoForm.amount_usd);
      if (isNaN(montoNum) || montoNum <= 0) {
        throw new Error('Ingrese un monto válido.');
      }
      const receiptUrl = await uploadFile(fileToUpload, 'visits', 'abonos');
      const { data: newNotif, error: notifErr } = await supabase
        .from('seller_payment_notifications')
        .insert([
          {
            order_id: abonoNotifModal.notaId,
            seller_id: user?.id,
            payment_date: abonoForm.payment_date,
            amount_usd: montoNum,
            payment_method: abonoForm.payment_method,
            reference_number: abonoForm.reference_number,
            user_note: abonoForm.user_note,
            receipt_image_url: receiptUrl,
            status: 'pending',
          },
        ])
        .select()
        .single();
      if (notifErr) throw notifErr;
      setPaymentNotificationsMap((prev) => ({
        ...prev,
        [abonoNotifModal.notaId]: newNotif,
      }));
      try {
        const notaActual = salesHistory.find(
          (n) => n.id === abonoNotifModal.notaId
        );
        const saldoPendiente =
          Number(notaActual?.balance_due_usd || 0) - montoNum;
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'abono_registered',
            payload: {
              nroTransaccion:
                notaActual?.transaction_number ||
                abonoNotifModal.notaId.substring(0, 6),
              vendedorEmail: user?.email,
              vendedorNombre: currentSellerName,
              clienteNombre: notaActual?.clients?.name || 'Cliente',
              montoAbonado: montoNum.toFixed(2),
              saldoPendiente: Math.max(0, saldoPendiente).toFixed(2),
            },
          },
        });
      } catch (mailErr) {
        console.warn('Error enviando correo de abono:', mailErr);
      }
      setMessage({
        type: 'success',
        text: 'Notificación de abono registrada y administrador notificado.',
      });
      setAbonoNotifModal({ open: false, notaId: null });
      setAbonoForm({
        payment_date: new Date().toISOString().split('T')[0],
        amount_usd: '',
        payment_method: 'Pago Móvil',
        reference_number: '',
        user_note: '',
      });
      setAbonoFiles((prev) => ({ ...prev, [abonoNotifModal.notaId]: null }));
      fetchPaymentNotifications();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Error al registrar la notificación de abono.',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedClientData = clients.find((c) => c.id === neClientId);

  const CustomFileInput = ({
    id,
    onChange,
    file,
    labelText = 'Adjuntar archivo',
  }) => (
    <div>
      <input
        type="file"
        id={id}
        accept="image/*"
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <label
        htmlFor={id}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 14px',
          backgroundColor: file ? '#F0FDF4' : '#F9FAFB',
          color: file ? '#166534' : '#374151',
          border: `1px solid ${file ? '#86EFAC' : '#D1D5DB'}`,
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <Upload
          style={{
            width: '14px',
            height: '14px',
            color: file ? '#16A34A' : '#6B7280',
          }}
        />
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '180px',
          }}
        >
          {file ? file.name : labelText}
        </span>
      </label>
    </div>
  );

  const filteredSalesHistory = salesHistory.filter((nota) => {
    const q = searchHistoryQuery.toLowerCase();
    const clientName = nota.clients?.name?.toLowerCase() || '';
    const transNo = (nota.transaction_number || nota.id)
      ?.toString()
      .toLowerCase();
    return clientName.includes(q) || transNo.includes(q);
  });

  const filteredSettlementHistory = userSettlementHistory.filter((item) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.user?.full_name?.toLowerCase().includes(q)
    );
  });

  const handleReplaceImageFromModal = async (newFile) => {
    if (!newFile) return;
    if (!validateImageFile(newFile)) {
      alert('El archivo debe ser una imagen.');
      return;
    }
    const { clientId, fieldName, url: oldUrl } = imageModal;
    if (!clientId || !fieldName) return;
    setLoading(true);
    try {
      let bucket = 'documents';
      let folder = 'adicional';
      if (fieldName === 'ci_photo_url') folder = 'ci';
      if (fieldName === 'rif_photo_url') folder = 'rif';
      if (fieldName === 'last_visit_photo_url') {
        bucket = 'visits';
        folder = 'visitas';
      }
      if (oldUrl) {
        const oldPath = getStoragePathFromUrl(oldUrl, bucket);
        if (oldPath) {
          await supabase.storage.from(bucket).remove([oldPath]);
        }
      }
      const newUrl = await uploadFile(newFile, bucket, folder);
      const { error } = await supabase
        .from('clients')
        .update({ [fieldName]: newUrl })
        .eq('id', clientId);
      if (error) throw error;
      setImageModal((prev) => ({ ...prev, url: newUrl }));
      fetchClients();
      fetchPotenciales();
      setMessage({ type: 'success', text: 'Imagen sustituida correctamente.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error al sustituir imagen: ' + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const menuTabs = [
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'visitas', label: 'Visitas', icon: MapPin },
    { id: 'nota_entrega', label: 'Nota de Entrega', icon: FileText },
    { id: 'historial_ventas', label: 'Historial de Ventas', icon: History },
  ];

  // E. FUNCIÓN AUXILIAR PARA RENDERIZAR TARJETAS DE PRODUCTOS EN MÓVIL
  const renderProductCards = (items, isEditable, onRemove) => {
    return items.map((item, idx) => (
      <div
        key={item.product_id || idx}
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '10px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px',
          }}
        >
          <div
            style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}
          >
            {item.description}
          </div>
          {isEditable && (
            <button
              onClick={() => onRemove(item.product_id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '12px',
          }}
        >
          <div>
            <span style={{ color: '#6b7280' }}>Código: </span>{' '}
            <strong>{item.code}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#6b7280' }}>Cant: </span>{' '}
            <strong>{item.quantity}</strong>
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>P. Unit: </span>{' '}
            <strong>${Number(item.unit_price_usd).toFixed(2)}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#b45309' }}>Desc: </span>{' '}
            <strong>
              ${Number(item.discounted_unit_price_usd).toFixed(2)}
            </strong>
          </div>
          <div
            style={{
              gridColumn: '1 / -1',
              borderTop: '1px dashed #e5e7eb',
              paddingTop: '6px',
              marginTop: '4px',
              textAlign: 'right',
              fontWeight: '800',
              fontSize: '14px',
              color: '#059669',
            }}
          >
            Total: ${Number(item.total_line_usd).toFixed(2)}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <style>{`@media (max-width: 768px) { .desktop-tabs { display: none !important; } .mobile-menu-container { display: block !important; } .desktop-table { display: none !important; } .desktop-cards-grid { display: none !important; } .mobile-cards-container { display: flex !important; flex-direction: column; gap: 12px; } .action-buttons-wrapper { display: flex !important; flex-wrap: nowrap !important; justify-content: stretch !important; align-items: stretch !important; gap: 4px !important; margin-top: 6px !important; padding-top: 8px !important; border-top: 1px solid #E5E7EB !important; } .action-buttons-wrapper button { display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 8px 4px !important; font-size: 9px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; border-radius: 6px !important; line-height: 1.2 !important; height: auto !important; box-sizing: border-box !important; min-height: 36px !important; width: auto !important; margin-top: 0 !important; } .action-buttons-wrapper button:not(:last-child) { flex: 1 !important; min-width: 0 !important; } .action-buttons-wrapper button:last-child { flex: 0 0 auto !important; width: 36px !important; min-width: 36px !important; max-width: 36px !important; padding: 8px 0 !important; } } @media (min-width: 769px) { .desktop-tabs { display: flex !important; } .mobile-menu-container { display: none !important; } .desktop-table { display: none !important; } .desktop-cards-grid { display: grid !important; } .mobile-cards-container { display: none !important; } }`}</style>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShoppingCart color="#dc2626" size={28} /> Módulo de Ventas
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Gestión de clientes, visitas, notas de entrega y comisiones.
          </p>
        </div>
      </div>

      {/* MENÚ HORIZONTAL (DESKTOP) */}
      <div
        className="desktop-tabs"
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #e5e7eb',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {menuTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubMenu === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubMenu(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                borderBottom: isActive
                  ? '3px solid #dc2626'
                  : '3px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? '#dc2626' : '#4b5563',
                fontWeight: isActive ? 'bold' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={18} color={isActive ? '#dc2626' : '#4b5563'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MENÚ DROPDOWN (MÓVIL) */}
      <div
        className="mobile-menu-container"
        ref={mobileMenuRef}
        style={{ display: 'none', marginBottom: '24px', position: 'relative' }}
      >
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(() => {
              const ActiveIcon =
                menuTabs.find((t) => t.id === activeSubMenu)?.icon || Users;
              return <ActiveIcon size={18} color="#dc2626" />;
            })()}
            {menuTabs.find((t) => t.id === activeSubMenu)?.label ||
              'Seleccionar'}
          </span>
          <ChevronDown size={18} color="#6b7280" />
        </button>
        {isMobileMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {menuTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubMenu === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubMenu(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: isActive ? '#fef2f2' : 'transparent',
                    color: isActive ? '#dc2626' : '#4b5563',
                    border: 'none',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={18} color={isActive ? '#dc2626' : '#9ca3af'} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <Check
                      size={16}
                      color="#dc2626"
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {message.text && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            color: message.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${
              message.type === 'success' ? '#BBF7D0' : '#FECACA'
            }`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle
              style={{ width: '20px', height: '20px', color: '#16A34A' }}
            />
          ) : (
            <AlertCircle
              style={{ width: '20px', height: '20px', color: '#DC2626' }}
            />
          )}
          <span style={{ fontSize: '13px', fontWeight: '700' }}>
            {message.text}
          </span>
        </div>
      )}

      {activeSubMenu === 'clientes' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setClienteTab('registrar')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor:
                  clienteTab === 'registrar' ? '#111827' : '#FFFFFF',
                color: clienteTab === 'registrar' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <UserPlus style={{ width: '14px', height: '14px' }} /> Registrar
            </button>
            <button
              onClick={() => setClienteTab('cartera')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor:
                  clienteTab === 'cartera' ? '#111827' : '#FFFFFF',
                color: clienteTab === 'cartera' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Users style={{ width: '14px', height: '14px' }} /> Mis Clientes
            </button>
          </div>

          {clienteTab === 'registrar' && (
            <div
              style={{
                maxWidth: '720px',
                margin: '0 auto',
                backgroundColor: '#FFFFFF',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <UserPlus style={{ color: '#DC2626' }} /> Registrar Nuevo
                Cliente Oficial
              </h2>
              <form
                onSubmit={handleSaveClient}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.nombre}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, nombre: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    alignItems: 'end',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Número de C.I. *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientForm.ci_numero}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          ci_numero: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Adjuntar Foto C.I. *
                    </label>
                    <CustomFileInput
                      id="ci_file"
                      onChange={(e) => setCiFile(e.target.files[0])}
                      file={ciFile}
                      labelText="Subir C.I."
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    alignItems: 'end',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Número de RIF *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientForm.rif_numero}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          rif_numero: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Adjuntar Foto RIF *
                    </label>
                    <CustomFileInput
                      id="rif_file"
                      onChange={(e) => setRifFile(e.target.files[0])}
                      file={rifFile}
                      labelText="Subir RIF"
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientForm.ciudad}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, ciudad: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Estado *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientForm.estado}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, estado: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Local *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientForm.local}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, local: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.telefono}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, telefono: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Registrado Por
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentSellerName}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      backgroundColor: '#F3F4F6',
                      boxSizing: 'border-box',
                      fontWeight: '700',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Documento Adicional (Opcional)
                  </label>
                  <CustomFileInput
                    id="adic_file"
                    onChange={(e) => setAdicionalFile(e.target.files[0])}
                    file={adicionalFile}
                    labelText="Adjuntar Adicional"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '8px',
                    padding: '10px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </form>
            </div>
          )}

          {clienteTab === 'cartera' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  Mis Clientes Registrados
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    width: '300px',
                    maxWidth: '100%',
                  }}
                >
                  <Search
                    style={{
                      color: '#9CA3AF',
                      width: '18px',
                      height: '18px',
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Filtrar clientes por nombre..."
                    value={searchClientQuery}
                    onChange={(e) => setSearchClientQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                </div>
              </div>

              {/* GRID DE TARJETAS ESCRITORIO */}
              <div
                className="desktop-cards-grid"
                style={{
                  display: 'none',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '16px',
                }}
              >
                {clients.filter((c) =>
                  c.name
                    ?.toLowerCase()
                    .includes(searchClientQuery.toLowerCase())
                ).length === 0 ? (
                  <div
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      color: '#6B7280',
                      gridColumn: '1/-1',
                    }}
                  >
                    No se encontraron clientes registrados por ti.
                  </div>
                ) : (
                  clients
                    .filter((c) =>
                      c.name
                        ?.toLowerCase()
                        .includes(searchClientQuery.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            borderBottom: '1px solid #F3F4F6',
                            paddingBottom: '8px',
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: '#6B7280',
                                textTransform: 'uppercase',
                              }}
                            >
                              Cliente
                            </span>
                            <div
                              style={{
                                fontSize: '16px',
                                fontWeight: '900',
                                color: '#111827',
                                marginTop: '2px',
                              }}
                            >
                              {c.name}
                            </div>
                          </div>
                          <span
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#F3F4F6',
                              borderRadius: '6px',
                              fontWeight: '700',
                              color: '#374151',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <UserCheck
                              style={{
                                width: '12px',
                                height: '12px',
                                color: '#16A34A',
                              }}
                            />
                            {currentSellerName}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            fontSize: '12px',
                          }}
                        >
                          <div>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              C.I.:
                            </span>{' '}
                            {c.ci_number || 'N/A'}
                          </div>
                          <div>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              RIF:
                            </span>{' '}
                            {c.rif_number || 'N/A'}
                          </div>
                          <div style={{ gridColumn: '1/-1' }}>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              Ubicación:
                            </span>{' '}
                            {c.city}, {c.state} - {c.address_detail}
                          </div>
                          <div style={{ gridColumn: '1/-1' }}>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              Teléfono:
                            </span>{' '}
                            {c.phone || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span
                            style={{
                              fontWeight: '700',
                              color: '#4B5563',
                              fontSize: '11px',
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            DATOS ADJUNTOS:
                          </span>
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}
                          >
                            {c.ci_photo_url ? (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: c.ci_photo_url,
                                    title: `C.I. de ${c.name}`,
                                    clientId: c.id,
                                    fieldName: 'ci_photo_url',
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Eye
                                  style={{ width: '12px', height: '12px' }}
                                />{' '}
                                C.I.
                              </button>
                            ) : (
                              <span
                                style={{ fontSize: '10px', color: '#9CA3AF' }}
                              >
                                Sin C.I.
                              </span>
                            )}
                            {c.rif_photo_url ? (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: c.rif_photo_url,
                                    title: `RIF de ${c.name}`,
                                    clientId: c.id,
                                    fieldName: 'rif_photo_url',
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Eye
                                  style={{ width: '12px', height: '12px' }}
                                />{' '}
                                RIF
                              </button>
                            ) : (
                              <span
                                style={{ fontSize: '10px', color: '#9CA3AF' }}
                              >
                                Sin RIF
                              </span>
                            )}
                            {c.additional_doc_url && (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: c.additional_doc_url,
                                    title: `Documento Adicional de ${c.name}`,
                                    clientId: c.id,
                                    fieldName: 'additional_doc_url',
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#F0FDF4',
                                  color: '#15803D',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Eye
                                  style={{ width: '12px', height: '12px' }}
                                />{' '}
                                Adicional
                              </button>
                            )}
                          </div>
                        </div>
                        <div
                          className="action-buttons-wrapper"
                          style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '8px',
                            borderTop: '1px solid #E5E7EB',
                            paddingTop: '12px',
                          }}
                        >
                          <button
                            onClick={() => handleOpenEditClient(c)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#F3F4F6',
                              color: '#1F2937',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit
                              style={{
                                width: '13px',
                                height: '13px',
                                color: '#4F46E5',
                              }}
                            />{' '}
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setSearchHistoryQuery(c.name);
                              setActiveSubMenu('nota_entrega');
                              setNeTab('historial');
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#E0E7FF',
                              color: '#3730A3',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <FileText
                              style={{ width: '13px', height: '13px' }}
                            />{' '}
                            N.E.
                          </button>
                          <button
                            onClick={() => handleDeleteClient(c.id, c.name)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* TABLA DESKTOP */}
              <div
                className="desktop-table"
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    minWidth: '750px',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '12px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F3F4F6',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: '700',
                      }}
                    >
                      <th style={{ padding: '8px 12px', minWidth: '150px' }}>
                        Cliente
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '120px' }}>
                        C.I. / RIF
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '180px' }}>
                        Ubicación
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '110px' }}>
                        Teléfono
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '140px' }}>
                        Datos Adjuntos
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '140px' }}>
                        Registrado Por
                      </th>
                      <th
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center',
                          minWidth: '180px',
                        }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.filter((c) =>
                      c.name
                        ?.toLowerCase()
                        .includes(searchClientQuery.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            padding: '16px',
                            textAlign: 'center',
                            color: '#6B7280',
                          }}
                        >
                          No se encontraron clientes registrados por ti.
                        </td>
                      </tr>
                    ) : (
                      clients
                        .filter((c) =>
                          c.name
                            ?.toLowerCase()
                            .includes(searchClientQuery.toLowerCase())
                        )
                        .map((c) => (
                          <tr
                            key={c.id}
                            style={{ borderBottom: '1px solid #E5E7EB' }}
                          >
                            <td
                              style={{ padding: '8px 12px', fontWeight: '700' }}
                            >
                              {c.name}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <div>CI: {c.ci_number || 'N/A'}</div>
                              <div
                                style={{ color: '#6B7280', fontSize: '11px' }}
                              >
                                RIF: {c.rif_number || 'N/A'}
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {c.city}, {c.state} - {c.address_detail}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {c.phone || 'N/A'}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '6px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                {c.ci_photo_url ? (
                                  <button
                                    onClick={() =>
                                      setImageModal({
                                        open: true,
                                        url: c.ci_photo_url,
                                        title: `C.I. de ${c.name}`,
                                        clientId: c.id,
                                        fieldName: 'ci_photo_url',
                                      })
                                    }
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#EFF6FF',
                                      color: '#1D4ED8',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '700',
                                      fontSize: '10px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <Eye
                                      style={{
                                        width: '12px',
                                        height: '12px',
                                      }}
                                    />{' '}
                                    C.I.
                                  </button>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      color: '#9CA3AF',
                                    }}
                                  >
                                    Sin C.I.
                                  </span>
                                )}
                                {c.rif_photo_url ? (
                                  <button
                                    onClick={() =>
                                      setImageModal({
                                        open: true,
                                        url: c.rif_photo_url,
                                        title: `RIF de ${c.name}`,
                                        clientId: c.id,
                                        fieldName: 'rif_photo_url',
                                      })
                                    }
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#EFF6FF',
                                      color: '#1D4ED8',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '700',
                                      fontSize: '10px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <Eye
                                      style={{
                                        width: '12px',
                                        height: '12px',
                                      }}
                                    />{' '}
                                    RIF
                                  </button>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      color: '#9CA3AF',
                                    }}
                                  >
                                    Sin RIF
                                  </span>
                                )}
                                {c.additional_doc_url && (
                                  <button
                                    onClick={() =>
                                      setImageModal({
                                        open: true,
                                        url: c.additional_doc_url,
                                        title: `Documento Adicional de ${c.name}`,
                                        clientId: c.id,
                                        fieldName: 'additional_doc_url',
                                      })
                                    }
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#F0FDF4',
                                      color: '#15803D',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '700',
                                      fontSize: '10px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <Eye
                                      style={{
                                        width: '12px',
                                        height: '12px',
                                      }}
                                    />{' '}
                                    Adicional
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#F3F4F6',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                  color: '#374151',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <UserCheck
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    color: '#16A34A',
                                  }}
                                />
                                {currentSellerName}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                textAlign: 'center',
                              }}
                            >
                              <div
                                className="action-buttons-wrapper"
                                style={{
                                  display: 'flex',
                                  gap: '6px',
                                  justifyContent: 'center',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <button
                                  onClick={() => handleOpenEditClient(c)}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#F3F4F6',
                                    color: '#1F2937',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                  title="Editar Cliente"
                                >
                                  <Edit
                                    style={{
                                      width: '13px',
                                      height: '13px',
                                      color: '#4F46E5',
                                    }}
                                  />
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    setSearchHistoryQuery(c.name);
                                    setActiveSubMenu('nota_entrega');
                                    setNeTab('historial');
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#E0E7FF',
                                    color: '#3730A3',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <FileText
                                    style={{ width: '13px', height: '13px' }}
                                  />
                                  Historial N.E.
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteClient(c.id, c.name)
                                  }
                                  style={{
                                    padding: '4px 6px',
                                    backgroundColor: '#FEF2F2',
                                    color: '#DC2626',
                                    border: '1px solid #FECACA',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                  }}
                                  title="Eliminar Cliente"
                                >
                                  <Trash2
                                    style={{ width: '14px', height: '14px' }}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* TARJETAS MÓVIL */}
              <div className="mobile-cards-container">
                {clients.filter((c) =>
                  c.name
                    ?.toLowerCase()
                    .includes(searchClientQuery.toLowerCase())
                ).length === 0 ? (
                  <div
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      color: '#6B7280',
                    }}
                  >
                    No se encontraron clientes registrados por ti.
                  </div>
                ) : (
                  clients
                    .filter((c) =>
                      c.name
                        ?.toLowerCase()
                        .includes(searchClientQuery.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        style={{
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            borderBottom: '1px solid #E5E7EB',
                            paddingBottom: '8px',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              color: '#6B7280',
                              textTransform: 'uppercase',
                              display: 'block',
                            }}
                          >
                            Cliente
                          </span>
                          <span
                            style={{
                              fontSize: '16px',
                              fontWeight: '900',
                              color: '#111827',
                            }}
                          >
                            {c.name}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            fontSize: '12px',
                          }}
                        >
                          <div>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              C.I.:
                            </span>{' '}
                            {c.ci_number || 'N/A'}
                          </div>
                          <div>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              RIF:
                            </span>{' '}
                            {c.rif_number || 'N/A'}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          <span style={{ fontWeight: '700', color: '#4B5563' }}>
                            Ubicación:
                          </span>{' '}
                          {c.city}, {c.state} - {c.address_detail}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          <span style={{ fontWeight: '700', color: '#4B5563' }}>
                            Teléfono:
                          </span>{' '}
                          {c.phone || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          <span
                            style={{
                              fontWeight: '700',
                              color: '#4B5563',
                              display: 'block',
                              marginBottom: '2px',
                            }}
                          >
                            Datos Adjuntos:
                          </span>
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}
                          >
                            {c.ci_photo_url ? (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: c.ci_photo_url,
                                    title: `C.I. de ${c.name}`,
                                    clientId: c.id,
                                    fieldName: 'ci_photo_url',
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Eye
                                  style={{ width: '12px', height: '12px' }}
                                />{' '}
                                C.I.
                              </button>
                            ) : (
                              <span
                                style={{ fontSize: '10px', color: '#9CA3AF' }}
                              >
                                Sin C.I.
                              </span>
                            )}
                            {c.rif_photo_url ? (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: c.rif_photo_url,
                                    title: `RIF de ${c.name}`,
                                    clientId: c.id,
                                    fieldName: 'rif_photo_url',
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Eye
                                  style={{ width: '12px', height: '12px' }}
                                />{' '}
                                RIF
                              </button>
                            ) : (
                              <span
                                style={{ fontSize: '10px', color: '#9CA3AF' }}
                              >
                                Sin RIF
                              </span>
                            )}
                            {c.additional_doc_url && (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: c.additional_doc_url,
                                    title: `Documento Adicional de ${c.name}`,
                                    clientId: c.id,
                                    fieldName: 'additional_doc_url',
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#F0FDF4',
                                  color: '#15803D',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  fontSize: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <Eye
                                  style={{ width: '12px', height: '12px' }}
                                />{' '}
                                Adicional
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          <span style={{ fontWeight: '700', color: '#4B5563' }}>
                            Registrado Por:
                          </span>{' '}
                          {currentSellerName}
                        </div>
                        <div
                          className="action-buttons-wrapper"
                          style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '6px',
                            flexWrap: 'wrap',
                            borderTop: '1px solid #E5E7EB',
                            paddingTop: '8px',
                          }}
                        >
                          <button
                            onClick={() => handleOpenEditClient(c)}
                            style={{
                              flex: 1,
                              padding: '6px',
                              backgroundColor: '#F3F4F6',
                              color: '#1F2937',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit
                              style={{
                                width: '13px',
                                height: '13px',
                                color: '#4F46E5',
                              }}
                            />{' '}
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setSearchHistoryQuery(c.name);
                              setActiveSubMenu('nota_entrega');
                              setNeTab('historial');
                            }}
                            style={{
                              flex: 1,
                              padding: '6px',
                              backgroundColor: '#E0E7FF',
                              color: '#3730A3',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <FileText
                              style={{ width: '13px', height: '13px' }}
                            />{' '}
                            N.E.
                          </button>
                          <button
                            onClick={() => handleDeleteClient(c.id, c.name)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL IMAGEN (Global) */}
      {imageModal.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              width: '650px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '6px',
              }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '900',
                  margin: 0,
                  color: '#111827',
                }}
              >
                {imageModal.title}
              </h3>
              <div
                style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
              >
                <a
                  href={imageModal.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#2563EB',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Download style={{ width: '14px', height: '14px' }} />{' '}
                  Descargar
                </a>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#16A34A',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#F0FDF4',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <Upload style={{ width: '14px', height: '14px' }} /> Sustituir
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleReplaceImageFromModal(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <button
                  onClick={() =>
                    setImageModal({
                      open: false,
                      url: '',
                      title: '',
                      clientId: null,
                      fieldName: null,
                    })
                  }
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                  }}
                >
                  <X style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            </div>
            <div
              style={{
                overflow: 'auto',
                textAlign: 'center',
                maxHeight: '75vh',
              }}
            >
              {imageModal.url.endsWith('.pdf') ? (
                <iframe
                  src={imageModal.url}
                  title="Documento PDF"
                  style={{ width: '100%', height: '500px', border: 'none' }}
                />
              ) : (
                <img
                  src={imageModal.url}
                  alt="Vista previa del documento"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CLIENTE */}
      {editClientModal.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              width: '540px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '900',
                  margin: 0,
                  textTransform: 'uppercase',
                  color: '#111827',
                }}
              >
                Editar Datos y Sustituir Adjuntos
              </h3>
              <button
                onClick={() =>
                  setEditClientModal({ open: false, clientData: null })
                }
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form
              onSubmit={handleUpdateClient}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '12px',
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: '700',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Nombre / Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={editClientForm.nombre}
                  onChange={(e) =>
                    setEditClientForm({
                      ...editClientForm,
                      nombre: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  alignItems: 'end',
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    C.I. Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientForm.ci_numero}
                    onChange={(e) =>
                      setEditClientForm({
                        ...editClientForm,
                        ci_numero: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Sustituir Foto C.I.
                  </label>
                  <CustomFileInput
                    id="edit_ci_file"
                    onChange={(e) => setEditCiFile(e.target.files[0])}
                    file={editCiFile}
                    labelText="Nueva C.I."
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  alignItems: 'end',
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    RIF Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientForm.rif_numero}
                    onChange={(e) =>
                      setEditClientForm({
                        ...editClientForm,
                        rif_numero: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Sustituir Foto RIF
                  </label>
                  <CustomFileInput
                    id="edit_rif_file"
                    onChange={(e) => setEditRifFile(e.target.files[0])}
                    file={editRifFile}
                    labelText="Nuevo RIF"
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientForm.ciudad}
                    onChange={(e) =>
                      setEditClientForm({
                        ...editClientForm,
                        ciudad: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Estado *
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientForm.estado}
                    onChange={(e) =>
                      setEditClientForm({
                        ...editClientForm,
                        estado: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Local/Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    value={editClientForm.local}
                    onChange={(e) =>
                      setEditClientForm({
                        ...editClientForm,
                        local: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontWeight: '700',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Teléfono *
                </label>
                <input
                  type="text"
                  required
                  value={editClientForm.telefono}
                  onChange={(e) =>
                    setEditClientForm({
                      ...editClientForm,
                      telefono: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontWeight: '700',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Sustituir Documento Adicional
                </label>
                <CustomFileInput
                  id="edit_adic_file"
                  onChange={(e) => setEditAdicionalFile(e.target.files[0])}
                  file={editAdicionalFile}
                  labelText="Nuevo Adicional"
                />
              </div>
              <div>
                <label
                  style={{
                    fontWeight: '700',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Registrado Por
                </label>
                <input
                  type="text"
                  disabled
                  value={currentSellerName}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    backgroundColor: '#F3F4F6',
                    boxSizing: 'border-box',
                    fontWeight: '700',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                  marginTop: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setEditClientModal({ open: false, clientData: null })
                  }
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#111827',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSubMenu === 'visitas' && (
        <div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setVisitasTab('potenciales')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor:
                  visitasTab === 'potenciales' ? '#111827' : '#FFFFFF',
                color: visitasTab === 'potenciales' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
              }}
            >
              Mis Potenciales Clientes
            </button>
            <button
              onClick={() => setVisitasTab('clientes')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor:
                  visitasTab === 'clientes' ? '#111827' : '#FFFFFF',
                color: visitasTab === 'clientes' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
              }}
            >
              Mis Clientes Registrados
            </button>
          </div>

          {visitasTab === 'potenciales' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    color: '#111827',
                  }}
                >
                  Nuevo Cliente Potencial (Requiere Visita/GPS Obligatorio)
                </h3>
                <form
                  onSubmit={handleSaveNuevoPotencial}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    fontSize: '12px',
                    alignItems: 'end',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Nombre / Establecimiento *
                    </label>
                    <input
                      type="text"
                      required
                      value={potencialForm.nombre}
                      onChange={(e) =>
                        setPotencialForm({
                          ...potencialForm,
                          nombre: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Dirección *
                    </label>
                    <input
                      type="text"
                      required
                      value={potencialForm.direccion}
                      onChange={(e) =>
                        setPotencialForm({
                          ...potencialForm,
                          direccion: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      required
                      value={potencialForm.telefono}
                      onChange={(e) =>
                        setPotencialForm({
                          ...potencialForm,
                          telefono: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Foto Fachada / Local
                    </label>
                    <CustomFileInput
                      id="potencial_file_input"
                      onChange={(e) => setPotencialFile(e.target.files[0])}
                      file={potencialFile}
                      labelText="Subir Foto"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      GPS Obligatorio *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        getDeviceLocation((coords) => setPotencialGps(coords))
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: potencialGps ? '#16A34A' : '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.3s',
                      }}
                    >
                      <MapPin style={{ width: '14px', height: '14px' }} />
                      {potencialGps
                        ? 'GPS Capturado OK (Click para recapturar)'
                        : 'Capturar GPS'}
                    </button>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#111827',
                        color: '#FFFFFF',
                        fontWeight: '700',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                      }}
                    >
                      {loading ? 'Guardando...' : 'Guardar y Registrar'}
                    </button>
                  </div>
                </form>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}
                  >
                    Mis Clientes Potenciales
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      width: '300px',
                      maxWidth: '100%',
                    }}
                  >
                    <Search
                      style={{
                        color: '#9CA3AF',
                        width: '18px',
                        height: '18px',
                        flexShrink: 0,
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Filtrar por nombre..."
                      value={searchPotencialesQuery}
                      onChange={(e) =>
                        setSearchPotencialesQuery(e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                </div>

                {/* GRID DE TARJETAS ESCRITORIO */}
                <div
                  className="desktop-cards-grid"
                  style={{
                    display: 'none',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {potenciales.filter((p) =>
                    p.name
                      ?.toLowerCase()
                      .includes(searchPotencialesQuery.toLowerCase())
                  ).length === 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: '#6B7280',
                        gridColumn: '1/-1',
                      }}
                    >
                      No hay clientes potenciales creados por ti.
                    </div>
                  ) : (
                    potenciales
                      .filter((p) =>
                        p.name
                          ?.toLowerCase()
                          .includes(searchPotencialesQuery.toLowerCase())
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start',
                              borderBottom: '1px solid #F3F4F6',
                              paddingBottom: '8px',
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#6B7280',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Cliente Potencial
                              </span>
                              <div
                                style={{
                                  fontSize: '16px',
                                  fontWeight: '900',
                                  color: '#111827',
                                  marginTop: '2px',
                                }}
                              >
                                {p.name}
                              </div>
                            </div>
                            <span
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#F3F4F6',
                                borderRadius: '6px',
                                fontWeight: '700',
                                color: '#374151',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <UserCheck
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  color: '#16A34A',
                                }}
                              />
                              {currentSellerName}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr',
                              gap: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Dirección:
                              </span>{' '}
                              {p.address_detail}
                            </div>
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Teléfono:
                              </span>{' '}
                              {p.phone || 'N/A'}
                            </div>
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Última Visita:
                              </span>{' '}
                              {p.last_visit_at
                                ? new Date(p.last_visit_at).toLocaleString()
                                : 'Sin registro'}
                            </div>
                          </div>
                          <div>
                            <span
                              style={{
                                fontWeight: '700',
                                color: '#4B5563',
                                fontSize: '11px',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              ADJUNTO:
                            </span>
                            {p.last_visit_photo_url ? (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: p.last_visit_photo_url,
                                    title: `Visita ${p.name}`,
                                    clientId: p.id,
                                    fieldName: 'last_visit_photo_url',
                                  })
                                }
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#2563EB',
                                  fontWeight: '700',
                                }}
                              >
                                <img
                                  src={p.last_visit_photo_url}
                                  alt="Miniatura"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid #D1D5DB',
                                  }}
                                />{' '}
                                Ver Foto
                              </button>
                            ) : (
                              <CustomFileInput
                                id={`desk_file_pot_${p.id}`}
                                onChange={(e) =>
                                  setVisitasFiles({
                                    ...visitasFiles,
                                    [p.id]: e.target.files[0],
                                  })
                                }
                                file={visitasFiles[p.id]}
                                labelText="Subir Foto"
                              />
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => handleCaptureVisitaGps(p.id)}
                              style={{
                                width: '100%',
                                padding: '6px',
                                backgroundColor: visitasGps[p.id]
                                  ? '#16A34A'
                                  : '#F59E0B',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.3s',
                              }}
                            >
                              <MapPin
                                style={{ width: '12px', height: '12px' }}
                              />{' '}
                              {visitasGps[p.id]
                                ? 'GPS Listo (Recapturar)'
                                : 'Extraer GPS'}
                            </button>
                          </div>
                          <div
                            className="action-buttons-wrapper"
                            style={{
                              display: 'flex',
                              gap: '8px',
                              marginTop: '8px',
                              borderTop: '1px solid #E5E7EB',
                              paddingTop: '12px',
                            }}
                          >
                            <button
                              onClick={() => handleSaveVisita(p.id, true)}
                              style={{
                                flex: 1,
                                padding: '6px',
                                backgroundColor: '#111827',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Registrar Visita
                            </button>
                            <button
                              onClick={() => handleOpenConvertModal(p)}
                              style={{
                                width: '100%',
                                padding: '6px',
                                backgroundColor: '#16A34A',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px',
                              }}
                            >
                              <UserPlus
                                style={{ width: '13px', height: '13px' }}
                              />{' '}
                              Reg. Cliente
                            </button>
                            <button
                              onClick={() => handleDeleteClient(p.id, p.name)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2
                                style={{ width: '14px', height: '14px' }}
                              />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* TABLA DESKTOP */}
                <div
                  className="desktop-table"
                  style={{
                    width: '100%',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      minWidth: '850px',
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                      fontSize: '12px',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#F3F4F6',
                          borderBottom: '1px solid #E5E7EB',
                          fontWeight: '700',
                        }}
                      >
                        <th style={{ padding: '8px 12px', minWidth: '150px' }}>
                          Cliente
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '150px' }}>
                          Dirección
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '110px' }}>
                          Teléfono
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '140px' }}>
                          Adjunto
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '130px' }}>
                          Registrado Por
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '130px' }}>
                          Última Visita
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '120px' }}>
                          GPS Visita
                        </th>
                        <th
                          style={{
                            padding: '8px 12px',
                            textAlign: 'center',
                            minWidth: '220px',
                          }}
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {potenciales.filter((p) =>
                        p.name
                          ?.toLowerCase()
                          .includes(searchPotencialesQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              color: '#6B7280',
                            }}
                          >
                            No hay clientes potenciales creados por ti.
                          </td>
                        </tr>
                      ) : (
                        potenciales
                          .filter((p) =>
                            p.name
                              ?.toLowerCase()
                              .includes(searchPotencialesQuery.toLowerCase())
                          )
                          .map((p) => (
                            <tr
                              key={p.id}
                              style={{ borderBottom: '1px solid #E5E7EB' }}
                            >
                              <td
                                style={{
                                  padding: '8px 12px',
                                  fontWeight: '700',
                                }}
                              >
                                {p.name}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                {p.address_detail}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                {p.phone || 'N/A'}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                {p.last_visit_photo_url ? (
                                  <button
                                    onClick={() =>
                                      setImageModal({
                                        open: true,
                                        url: p.last_visit_photo_url,
                                        title: `Visita ${p.name}`,
                                        clientId: p.id,
                                        fieldName: 'last_visit_photo_url',
                                      })
                                    }
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      color: '#2563EB',
                                      fontWeight: '700',
                                    }}
                                  >
                                    <img
                                      src={p.last_visit_photo_url}
                                      alt="Miniatura"
                                      style={{
                                        width: '28px',
                                        height: '28px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        border: '1px solid #D1D5DB',
                                      }}
                                    />
                                    <Eye
                                      style={{
                                        width: '14px',
                                        height: '14px',
                                      }}
                                    />
                                  </button>
                                ) : (
                                  <CustomFileInput
                                    id={`file_potencial_${p.id}`}
                                    onChange={(e) =>
                                      setVisitasFiles({
                                        ...visitasFiles,
                                        [p.id]: e.target.files[0],
                                      })
                                    }
                                    file={visitasFiles[p.id]}
                                    labelText="Subir Foto"
                                  />
                                )}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#F3F4F6',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    color: '#374151',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <UserCheck
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      color: '#16A34A',
                                    }}
                                  />
                                  {currentSellerName}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                {p.last_visit_at
                                  ? new Date(p.last_visit_at).toLocaleString()
                                  : 'Sin registro'}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <button
                                  onClick={() => handleCaptureVisitaGps(p.id)}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: visitasGps[p.id]
                                      ? '#16A34A'
                                      : '#F59E0B',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'background-color 0.3s',
                                  }}
                                >
                                  <MapPin
                                    style={{ width: '12px', height: '12px' }}
                                  />
                                  {visitasGps[p.id]
                                    ? 'GPS Listo (Recapturar)'
                                    : 'Extraer GPS'}
                                </button>
                              </td>
                              <td
                                style={{
                                  padding: '8px 12px',
                                  textAlign: 'center',
                                }}
                              >
                                <div
                                  className="action-buttons-wrapper"
                                  style={{
                                    display: 'flex',
                                    gap: '6px',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <button
                                    onClick={() => handleSaveVisita(p.id, true)}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#111827',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Registrar Visita
                                  </button>
                                  <button
                                    onClick={() => handleOpenConvertModal(p)}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#16A34A',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                    title="Agregar como Cliente Oficial"
                                  >
                                    <UserPlus
                                      style={{
                                        width: '13px',
                                        height: '13px',
                                      }}
                                    />
                                    Reg. Cliente
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteClient(p.id, p.name)
                                    }
                                    style={{
                                      padding: '4px 6px',
                                      backgroundColor: '#FEF2F2',
                                      color: '#DC2626',
                                      border: '1px solid #FECACA',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                    }}
                                    title="Eliminar Cliente Potencial"
                                  >
                                    <Trash2
                                      style={{
                                        width: '14px',
                                        height: '14px',
                                      }}
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TARJETAS MÓVIL */}
                <div className="mobile-cards-container">
                  {potenciales.filter((p) =>
                    p.name
                      ?.toLowerCase()
                      .includes(searchPotencialesQuery.toLowerCase())
                  ).length === 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: '#6B7280',
                      }}
                    >
                      No hay clientes potenciales creados por ti.
                    </div>
                  ) : (
                    potenciales
                      .filter((p) =>
                        p.name
                          ?.toLowerCase()
                          .includes(searchPotencialesQuery.toLowerCase())
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          style={{
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              borderBottom: '1px solid #E5E7EB',
                              paddingBottom: '8px',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: '#6B7280',
                                textTransform: 'uppercase',
                                display: 'block',
                              }}
                            >
                              Cliente
                            </span>
                            <span
                              style={{
                                fontSize: '16px',
                                fontWeight: '900',
                                color: '#111827',
                              }}
                            >
                              {p.name}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              Dirección:
                            </span>{' '}
                            {p.address_detail}
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              Teléfono:
                            </span>{' '}
                            {p.phone || 'N/A'}
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            <span
                              style={{
                                fontWeight: '700',
                                color: '#4B5563',
                                display: 'block',
                                marginBottom: '2px',
                              }}
                            >
                              Adjunto:
                            </span>
                            {p.last_visit_photo_url ? (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: p.last_visit_photo_url,
                                    title: `Visita ${p.name}`,
                                    clientId: p.id,
                                    fieldName: 'last_visit_photo_url',
                                  })
                                }
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#2563EB',
                                  fontWeight: '700',
                                }}
                              >
                                <img
                                  src={p.last_visit_photo_url}
                                  alt="Miniatura"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid #D1D5DB',
                                  }}
                                />{' '}
                                Ver Foto
                              </button>
                            ) : (
                              <CustomFileInput
                                id={`m_file_potencial_${p.id}`}
                                onChange={(e) =>
                                  setVisitasFiles({
                                    ...visitasFiles,
                                    [p.id]: e.target.files[0],
                                  })
                                }
                                file={visitasFiles[p.id]}
                                labelText="Subir Foto"
                              />
                            )}
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              Registrado Por:
                            </span>{' '}
                            {currentSellerName}
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              Última Visita:
                            </span>{' '}
                            {p.last_visit_at
                              ? new Date(p.last_visit_at).toLocaleString()
                              : 'Sin registro'}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'center',
                            }}
                          >
                            <button
                              onClick={() => handleCaptureVisitaGps(p.id)}
                              style={{
                                flex: 1,
                                padding: '6px',
                                backgroundColor: visitasGps[p.id]
                                  ? '#16A34A'
                                  : '#F59E0B',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.3s',
                              }}
                            >
                              <MapPin
                                style={{ width: '12px', height: '12px' }}
                              />{' '}
                              {visitasGps[p.id]
                                ? 'GPS Listo (Recapturar)'
                                : 'Extraer GPS'}
                            </button>
                          </div>
                          <div
                            className="action-buttons-wrapper"
                            style={{
                              display: 'flex',
                              gap: '8px',
                              marginTop: '6px',
                              flexWrap: 'wrap',
                              borderTop: '1px solid #E5E7EB',
                              paddingTop: '8px',
                            }}
                          >
                            <button
                              onClick={() => handleSaveVisita(p.id, true)}
                              style={{
                                flex: 1,
                                padding: '6px',
                                backgroundColor: '#111827',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Registrar Visita
                            </button>
                            <button
                              onClick={() => handleOpenConvertModal(p)}
                              style={{
                                width: '100%',
                                padding: '6px',
                                backgroundColor: '#16A34A',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px',
                              }}
                            >
                              <UserPlus
                                style={{ width: '13px', height: '13px' }}
                              />{' '}
                              Reg. Cliente
                            </button>
                            <button
                              onClick={() => handleDeleteClient(p.id, p.name)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2
                                style={{ width: '14px', height: '14px' }}
                              />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {visitasTab === 'clientes' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '12px',
                  alignItems: 'center',
                }}
              >
                <Search style={{ color: '#9CA3AF', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre..."
                  value={searchClientQuery}
                  onChange={(e) => setSearchClientQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
              </div>

              {/* GRID DE TARJETAS ESCRITORIO */}
              <div
                className="desktop-cards-grid"
                style={{
                  display: 'none',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '16px',
                }}
              >
                {clients
                  .filter((c) =>
                    c.name
                      ?.toLowerCase()
                      .includes(searchClientQuery.toLowerCase())
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          borderBottom: '1px solid #F3F4F6',
                          paddingBottom: '8px',
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              color: '#6B7280',
                              textTransform: 'uppercase',
                            }}
                          >
                            Cliente Oficial
                          </span>
                          <div
                            style={{
                              fontSize: '16px',
                              fontWeight: '900',
                              color: '#111827',
                              marginTop: '2px',
                            }}
                          >
                            {c.name}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#F3F4F6',
                            borderRadius: '6px',
                            fontWeight: '700',
                            color: '#374151',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <UserCheck
                            style={{
                              width: '12px',
                              height: '12px',
                              color: '#16A34A',
                            }}
                          />
                          {currentSellerName}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          gap: '8px',
                          fontSize: '12px',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '700', color: '#4B5563' }}>
                            Última Visita:
                          </span>{' '}
                          {c.last_visit_at
                            ? new Date(c.last_visit_at).toLocaleString()
                            : 'Sin registro'}
                        </div>
                        <div>
                          <span style={{ fontWeight: '700', color: '#4B5563' }}>
                            Historial N.E.:
                          </span>{' '}
                          <button
                            onClick={() => {
                              setSearchHistoryQuery(c.name);
                              setActiveSubMenu('nota_entrega');
                              setNeTab('historial');
                            }}
                            style={{
                              padding: '2px 6px',
                              backgroundColor: '#E0E7FF',
                              color: '#3730A3',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Ver Historial
                          </button>
                        </div>
                      </div>
                      <div>
                        <span
                          style={{
                            fontWeight: '700',
                            color: '#4B5563',
                            fontSize: '11px',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          FOTO VISITA:
                        </span>
                        {c.last_visit_photo_url ? (
                          <button
                            onClick={() =>
                              setImageModal({
                                open: true,
                                url: c.last_visit_photo_url,
                                title: `Visita ${c.name}`,
                                clientId: c.id,
                                fieldName: 'last_visit_photo_url',
                              })
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#2563EB',
                              fontWeight: '700',
                            }}
                          >
                            <img
                              src={c.last_visit_photo_url}
                              alt="Miniatura"
                              style={{
                                width: '28px',
                                height: '28px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #D1D5DB',
                              }}
                            />{' '}
                            Ver Foto
                          </button>
                        ) : (
                          <CustomFileInput
                            id={`desk_file_cli_${c.id}`}
                            onChange={(e) =>
                              setVisitasFiles({
                                ...visitasFiles,
                                [c.id]: e.target.files[0],
                              })
                            }
                            file={visitasFiles[c.id]}
                            labelText="Subir Foto"
                          />
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => handleCaptureVisitaGps(c.id)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            backgroundColor: visitasGps[c.id]
                              ? '#16A34A'
                              : '#F59E0B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background-color 0.3s',
                          }}
                        >
                          <MapPin style={{ width: '12px', height: '12px' }} />{' '}
                          {visitasGps[c.id]
                            ? 'GPS Listo (Recapturar)'
                            : 'Extraer GPS'}
                        </button>
                      </div>
                      <div
                        className="action-buttons-wrapper"
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '8px',
                          borderTop: '1px solid #E5E7EB',
                          paddingTop: '12px',
                        }}
                      >
                        <button
                          onClick={() => handleSaveVisita(c.id, false)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            backgroundColor: '#111827',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Registrar Visita
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c.id, c.name)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* TABLA DESKTOP */}
              <div
                className="desktop-table"
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    minWidth: '780px',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '12px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#F3F4F6',
                        borderBottom: '1px solid #E5E7EB',
                        fontWeight: '700',
                      }}
                    >
                      <th style={{ padding: '8px 12px', minWidth: '150px' }}>
                        Nombre
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '140px' }}>
                        Adjunto
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '130px' }}>
                        Registrado Por
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '130px' }}>
                        N.E. Historial
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '130px' }}>
                        Última Visita
                      </th>
                      <th style={{ padding: '8px 12px', minWidth: '110px' }}>
                        GPS
                      </th>
                      <th
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center',
                          minWidth: '160px',
                        }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients
                      .filter((c) =>
                        c.name
                          ?.toLowerCase()
                          .includes(searchClientQuery.toLowerCase())
                      )
                      .map((c) => (
                        <tr
                          key={c.id}
                          style={{ borderBottom: '1px solid #E5E7EB' }}
                        >
                          <td
                            style={{ padding: '8px 12px', fontWeight: '700' }}
                          >
                            {c.name}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {c.last_visit_photo_url ? (
                              <button
                                onClick={() =>
                                  setImageModal({
                                    open: true,
                                    url: c.last_visit_photo_url,
                                    title: `Visita ${c.name}`,
                                    clientId: c.id,
                                    fieldName: 'last_visit_photo_url',
                                  })
                                }
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#2563EB',
                                  fontWeight: '700',
                                }}
                              >
                                <img
                                  src={c.last_visit_photo_url}
                                  alt="Miniatura"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid #D1D5DB',
                                  }}
                                />
                                <Eye
                                  style={{ width: '14px', height: '14px' }}
                                />
                              </button>
                            ) : (
                              <CustomFileInput
                                id={`file_cliente_${c.id}`}
                                onChange={(e) =>
                                  setVisitasFiles({
                                    ...visitasFiles,
                                    [c.id]: e.target.files[0],
                                  })
                                }
                                file={visitasFiles[c.id]}
                                labelText="Subir Foto"
                              />
                            )}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#F3F4F6',
                                borderRadius: '6px',
                                fontWeight: '700',
                                color: '#374151',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <UserCheck
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  color: '#16A34A',
                                }}
                              />
                              {currentSellerName}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <button
                              onClick={() => {
                                setSearchHistoryQuery(c.name);
                                setActiveSubMenu('nota_entrega');
                                setNeTab('historial');
                              }}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#E0E7FF',
                                color: '#3730A3',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              Ver Historial N.E.
                            </button>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {c.last_visit_at
                              ? new Date(c.last_visit_at).toLocaleString()
                              : 'Sin registro'}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <button
                              onClick={() => handleCaptureVisitaGps(c.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: visitasGps[c.id]
                                  ? '#16A34A'
                                  : '#F59E0B',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.3s',
                              }}
                            >
                              <MapPin
                                style={{ width: '12px', height: '12px' }}
                              />
                              {visitasGps[c.id]
                                ? 'GPS Listo (Recapturar)'
                                : 'Extraer GPS'}
                            </button>
                          </td>
                          <td
                            style={{ padding: '8px 12px', textAlign: 'center' }}
                          >
                            <div
                              className="action-buttons-wrapper"
                              style={{
                                display: 'flex',
                                gap: '6px',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              <button
                                onClick={() => handleSaveVisita(c.id, false)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#111827',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                Registrar Visita
                              </button>
                              <button
                                onClick={() => handleDeleteClient(c.id, c.name)}
                                style={{
                                  padding: '4px 6px',
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FECACA',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                                title="Eliminar Cliente"
                              >
                                <Trash2
                                  style={{ width: '14px', height: '14px' }}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* TARJETAS MÓVIL */}
              <div className="mobile-cards-container">
                {clients
                  .filter((c) =>
                    c.name
                      ?.toLowerCase()
                      .includes(searchClientQuery.toLowerCase())
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          borderBottom: '1px solid #E5E7EB',
                          paddingBottom: '8px',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: '#6B7280',
                            textTransform: 'uppercase',
                            display: 'block',
                          }}
                        >
                          Cliente
                        </span>
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: '900',
                            color: '#111827',
                          }}
                        >
                          {c.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <span
                          style={{
                            fontWeight: '700',
                            color: '#4B5563',
                            display: 'block',
                            marginBottom: '2px',
                          }}
                        >
                          Adjunto:
                        </span>
                        {c.last_visit_photo_url ? (
                          <button
                            onClick={() =>
                              setImageModal({
                                open: true,
                                url: c.last_visit_photo_url,
                                title: `Visita ${c.name}`,
                                clientId: c.id,
                                fieldName: 'last_visit_photo_url',
                              })
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#2563EB',
                              fontWeight: '700',
                            }}
                          >
                            <img
                              src={c.last_visit_photo_url}
                              alt="Miniatura"
                              style={{
                                width: '28px',
                                height: '28px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #D1D5DB',
                              }}
                            />{' '}
                            Ver Foto
                          </button>
                        ) : (
                          <CustomFileInput
                            id={`m_file_cli_${c.id}`}
                            onChange={(e) =>
                              setVisitasFiles({
                                ...visitasFiles,
                                [c.id]: e.target.files[0],
                              })
                            }
                            file={visitasFiles[c.id]}
                            labelText="Subir Foto"
                          />
                        )}
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ fontWeight: '700', color: '#4B5563' }}>
                          Registrado Por:
                        </span>{' '}
                        {currentSellerName}
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ fontWeight: '700', color: '#4B5563' }}>
                          N.E. Historial:
                        </span>{' '}
                        <button
                          onClick={() => {
                            setSearchHistoryQuery(c.name);
                            setActiveSubMenu('nota_entrega');
                            setNeTab('historial');
                          }}
                          style={{
                            padding: '2px 6px',
                            backgroundColor: '#E0E7FF',
                            color: '#3730A3',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Ver Historial N.E.
                        </button>
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ fontWeight: '700', color: '#4B5563' }}>
                          Última Visita:
                        </span>{' '}
                        {c.last_visit_at
                          ? new Date(c.last_visit_at).toLocaleString()
                          : 'Sin registro'}
                      </div>
                      <div>
                        <button
                          onClick={() => handleCaptureVisitaGps(c.id)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            backgroundColor: visitasGps[c.id]
                              ? '#16A34A'
                              : '#F59E0B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background-color 0.3s',
                          }}
                        >
                          <MapPin style={{ width: '12px', height: '12px' }} />{' '}
                          {visitasGps[c.id]
                            ? 'GPS Listo (Recapturar)'
                            : 'Extraer GPS'}
                        </button>
                      </div>
                      <div
                        className="action-buttons-wrapper"
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '6px',
                          flexWrap: 'wrap',
                          borderTop: '1px solid #E5E7EB',
                          paddingTop: '8px',
                        }}
                      >
                        <button
                          onClick={() => handleSaveVisita(c.id, false)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            backgroundColor: '#111827',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Registrar Visita
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c.id, c.name)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL CONVERTIR POTENCIAL */}
      {convertModal.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              width: '540px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '900',
                  margin: 0,
                  textTransform: 'uppercase',
                  color: '#16A34A',
                }}
              >
                Promover a Cliente Oficial
              </h3>
              <button
                onClick={() =>
                  setConvertModal({ open: false, potencialData: null })
                }
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form
              onSubmit={handleSaveConvertion}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '12px',
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: '700',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Nombre / Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={convertForm.nombre}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, nombre: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  alignItems: 'end',
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    C.I. Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={convertForm.ci_numero}
                    onChange={(e) =>
                      setConvertForm({
                        ...convertForm,
                        ci_numero: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Foto C.I. *
                  </label>
                  <CustomFileInput
                    id="convert_ci"
                    onChange={(e) => setConvertCiFile(e.target.files[0])}
                    file={convertCiFile}
                    labelText="Subir C.I."
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  alignItems: 'end',
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    RIF Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={convertForm.rif_numero}
                    onChange={(e) =>
                      setConvertForm({
                        ...convertForm,
                        rif_numero: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Foto RIF *
                  </label>
                  <CustomFileInput
                    id="convert_rif"
                    onChange={(e) => setConvertRifFile(e.target.files[0])}
                    file={convertRifFile}
                    labelText="Subir RIF"
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={convertForm.ciudad}
                    onChange={(e) =>
                      setConvertForm({ ...convertForm, ciudad: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Estado *
                  </label>
                  <input
                    type="text"
                    required
                    value={convertForm.estado}
                    onChange={(e) =>
                      setConvertForm({ ...convertForm, estado: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Local/Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    value={convertForm.local}
                    onChange={(e) =>
                      setConvertForm({ ...convertForm, local: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontWeight: '700',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Teléfono *
                </label>
                <input
                  type="text"
                  required
                  value={convertForm.telefono}
                  onChange={(e) =>
                    setConvertForm({
                      ...convertForm,
                      telefono: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontWeight: '700',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Documento Adicional (Opcional)
                </label>
                <CustomFileInput
                  id="convert_adic"
                  onChange={(e) => setConvertAdicionalFile(e.target.files[0])}
                  file={convertAdicionalFile}
                  labelText="Adjuntar Adicional"
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                  marginTop: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setConvertModal({ open: false, potencialData: null })
                  }
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Guardando...' : 'Completar Registro Oficial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSubMenu === 'nota_entrega' && (
        <div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setNeTab('comisiones')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: neTab === 'comisiones' ? '#111827' : '#FFFFFF',
                color: neTab === 'comisiones' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
              }}
            >
              Comisiones
            </button>
            <button
              onClick={() => setNeTab('crear_ne')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: neTab === 'crear_ne' ? '#111827' : '#FFFFFF',
                color: neTab === 'crear_ne' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
              }}
            >
              {editModeId ? 'Editando N.E.' : 'Crear N.E.'}
            </button>

            {/* C. Nueva Pestaña Solicitar Vale */}
            <button
              onClick={() => setNeTab('solicitar_vale')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor:
                  neTab === 'solicitar_vale' ? '#111827' : '#FFFFFF',
                color: neTab === 'solicitar_vale' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
              }}
            >
              Solicitar Vale
            </button>

            <button
              onClick={() => setNeTab('historial')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: neTab === 'historial' ? '#111827' : '#FFFFFF',
                color: neTab === 'historial' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
              }}
            >
              Mis Notas de Entrega
            </button>
          </div>

          {neTab === 'comisiones' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                }}
              >
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#166534',
                    margin: 0,
                  }}
                >
                  Comisiones Pendientes por Cobrar
                </h3>
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: '900',
                    color: '#15803D',
                    margin: '6px 0 0 0',
                  }}
                >
                  ${comisionesData.pendientes.toFixed(2)}
                </p>
                <span style={{ fontSize: '10px', color: '#166534' }}>
                  Beneficio de órdenes cerradas
                </span>
              </div>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                }}
              >
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#1E40AF',
                    margin: 0,
                  }}
                >
                  Comisiones por N.E. Pendientes
                </h3>
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: '900',
                    color: '#1D4ED8',
                    margin: '6px 0 0 0',
                  }}
                >
                  ${comisionesData.pendientesNe.toFixed(2)}
                </p>
                <span style={{ fontSize: '10px', color: '#1E40AF' }}>
                  No se cobrarán en corte actual
                </span>
              </div>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                }}
              >
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#991B1B',
                    margin: 0,
                  }}
                >
                  Cargo por Incumplimiento de Cliente
                </h3>
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: '900',
                    color: '#DC2626',
                    margin: '6px 0 0 0',
                  }}
                >
                  -${comisionesData.penalizaciones.toFixed(2)}
                </p>
                <span style={{ fontSize: '10px', color: '#991B1B' }}>
                  Se descontará en el siguiente ciclo
                </span>
              </div>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FDE68A',
                }}
              >
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#92400E',
                    margin: 0,
                  }}
                >
                  Saldo en Vales Solicitados (Aprobados)
                </h3>
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: '900',
                    color: '#B45309',
                    margin: '6px 0 0 0',
                  }}
                >
                  -${comisionesData.vales.toFixed(2)}
                </p>
                <span style={{ fontSize: '10px', color: '#92400E' }}>
                  Suma de adelantos aprobados
                </span>
              </div>
            </div>
          )}

          {neTab === 'crear_ne' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FileText size={18} color="#0f172a" />
                  <div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: '#0f172a',
                        display: 'block',
                      }}
                    >
                      FOLIO ESTIMADO AUTOMÁTICO: #{estimatedNextFolio}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Si no se fija manual, se asigna el nextval de PostgreSQL.
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Cliente *
                  </label>
                  <SearchableDropdown
                    options={clients.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    value={neClientId}
                    onChange={setNeClientId}
                    placeholder="-- Buscar / Seleccionar cliente --"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Categoría *
                  </label>
                  <select
                    value={neCategoria}
                    onChange={(e) => {
                      setNeCategoria(e.target.value);
                      setNeCart([]);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="bombillos">Bombillos</option>
                    <option value="fluidos">Fluidos</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Condición de Pago *
                  </label>
                  <select
                    value={neTipoPago}
                    onChange={(e) => setNeTipoPago(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #F59E0B',
                      borderRadius: '6px',
                      backgroundColor: '#FEF3C7',
                      color: '#78350F',
                      fontWeight: '700',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="53.38">
                      {globalDiscount53}% Pagará en $
                    </option>
                    <option value="23.08">
                      {globalDiscount23}% Pagará en Bs BCV
                    </option>
                    <option value="10">
                      {globalDiscount10}% Descuento Especial
                    </option>
                    <option value="0">{globalDiscount0}% Sin Descuento</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Agregar Productos
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    alignItems: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      flex: '1 1 300px',
                      minWidth: '0',
                      maxWidth: '100%',
                    }}
                  >
                    <SearchableDropdown
                      options={filteredProducts.map((p) => {
                        const desc =
                          p.price_usd * (1 - porcentajeDescuento / 100);
                        return {
                          value: p.id,
                          label: `[${p.code}] ${p.description} | Stock: ${
                            p.stock_current
                          } | Base: $${p.price_usd.toFixed(
                            2
                          )} | Desc: $${desc.toFixed(2)}`,
                        };
                      })}
                      value={neSelectedProdId}
                      onChange={setNeSelectedProdId}
                      placeholder="-- Seleccionar producto --"
                    />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px',
                      }}
                    >
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={neQuantity}
                      onChange={(e) => setNeQuantity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                        height: '42px',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAddToCart}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      height: '42px',
                    }}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #111827',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #E5E7EB',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <h2
                      style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}
                    >
                      FENIX AUTO PART C.A
                    </h2>
                    <p style={{ fontWeight: '700', margin: '2px 0' }}>
                      RIF: J-50261925-2
                    </p>
                    <p style={{ margin: '6px 0 0 0' }}>
                      <strong>Cliente: </strong>{' '}
                      {selectedClientData?.name || '---'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0 }}>
                      <strong>Fecha/Hora: </strong>{' '}
                      {new Date().toLocaleString()}
                    </p>
                    <p style={{ margin: '2px 0' }}>
                      <strong>Registrado por: </strong> {currentSellerName}
                    </p>
                    <p style={{ margin: '2px 0' }}>
                      <strong>N° Transacción: </strong> #{estimatedNextFolio}{' '}
                      (Proyectado)
                    </p>
                  </div>
                </div>

                {/* Tabla de Productos para Escritorio (Oculta en Móvil) */}
                <div
                  className="desktop-table-container"
                  style={{
                    width: '100%',
                    overflowX: 'auto',
                    marginBottom: '12px',
                    display: 'block',
                  }}
                >
                  <style>{`
                    @media (max-width: 768px) {
                      .desktop-table-container {
                        display: none !important;
                      }
                    }
                  `}</style>
                  <table
                    style={{
                      width: '100%',
                      minWidth: '700px',
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                      fontSize: '12px',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#F3F4F6',
                          borderBottom: '1px solid #D1D5DB',
                          fontWeight: '700',
                        }}
                      >
                        <th style={{ padding: '8px' }}>Código</th>
                        <th style={{ padding: '8px' }}>Descripción</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>
                          Cantidad
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Valor Unitario
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          V. U. con descuento
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Valor Total
                        </th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>
                          Eliminar
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {neCart.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              color: '#9CA3AF',
                              fontStyle: 'italic',
                            }}
                          >
                            No hay productos añadidos a la nota de entrega.
                          </td>
                        </tr>
                      ) : (
                        neCart.map((item) => (
                          <tr
                            key={item.product_id}
                            style={{ borderBottom: '1px solid #E5E7EB' }}
                          >
                            <td
                              style={{
                                padding: '8px',
                                fontFamily: 'monospace',
                              }}
                            >
                              {item.code}
                            </td>
                            <td style={{ padding: '8px', fontWeight: '600' }}>
                              {item.description}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              {item.quantity}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              ${item.unit_price_usd.toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'right',
                                color: '#B45309',
                              }}
                            >
                              ${item.discounted_unit_price_usd.toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'right',
                                fontWeight: '700',
                              }}
                            >
                              ${item.total_line_usd.toFixed(2)}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <button
                                onClick={() =>
                                  handleRemoveFromCart(item.product_id)
                                }
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: '#DC2626',
                                }}
                              >
                                <Trash2
                                  style={{ width: '16px', height: '16px' }}
                                />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards for Cart */}
                <div className="mobile-cards-container">
                  {neCart.length === 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: '#9CA3AF',
                      }}
                    >
                      No hay productos añadidos.
                    </div>
                  ) : (
                    renderProductCards(neCart, true, handleRemoveFromCart)
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '12px',
                    fontSize: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '300px',
                      maxWidth: '100%',
                      backgroundColor: '#F9FAFB',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <span>Total sin Descuento:</span>
                      <strong>${totalSinDescuento.toFixed(2)}</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        color: '#B45309',
                      }}
                    >
                      <span>% de descuento aplicado:</span>
                      <strong>-${montoAhorrado.toFixed(2)}</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #D1D5DB',
                        paddingTop: '4px',
                        fontSize: '13px',
                        fontWeight: '900',
                        color: '#111827',
                      }}
                    >
                      <span>Precio Final:</span>
                      <span style={{ color: '#DC2626' }}>
                        ${precioFinal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Observación:
                  </label>
                  <textarea
                    rows="2"
                    value={neObservacion}
                    onChange={(e) => setNeObservacion(e.target.value)}
                    placeholder="Escriba aquí observaciones del pedido..."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      fontSize: '12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  ></textarea>
                </div>

                <div
                  style={{
                    backgroundColor: '#F3F4F6',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    color: '#4B5563',
                    lineHeight: '1.4',
                    marginBottom: '12px',
                    textAlign: 'justify',
                  }}
                >
                  <strong>Términos y condiciones:</strong> {globalTerms}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      getDeviceLocation((coords) => setNeGpsLocation(coords))
                    }
                    style={{
                      padding: '8px 14px',
                      backgroundColor: neGpsLocation ? '#16A34A' : '#F59E0B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.3s',
                    }}
                  >
                    <MapPin style={{ width: '16px', height: '16px' }} />
                    {neGpsLocation
                      ? `GPS Validado (${neGpsLocation.lat.toFixed(
                          4
                        )}, ${neGpsLocation.lng.toFixed(4)}) (Recapturar)`
                      : 'Extraer GPS Requerido'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendProposal}
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Send style={{ width: '16px', height: '16px' }} />
                    {loading ? 'Procesando...' : 'Enviar Propuesta'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* C. Pestaña Solicitar Vale Independiente */}
          {neTab === 'solicitar_vale' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '900',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CreditCard size={20} color="#DC2626" /> Solicitar Vale
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  marginBottom: '16px',
                }}
              >
                Esta solicitud será revisada por administración.
              </p>
              <form
                onSubmit={handleSolicitarValeIndependiente}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Monto Solicitado ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={independentValeForm.monto}
                    onChange={(e) =>
                      setIndependentValeForm({
                        ...independentValeForm,
                        monto: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || valesLocked}
                  style={{
                    padding: '10px',
                    backgroundColor: valesLocked ? '#9CA3AF' : '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: valesLocked ? 'not-allowed' : 'pointer',
                    marginTop: '8px',
                  }}
                >
                  {valesLocked
                    ? 'Espere 5 segundos...'
                    : 'Enviar Solicitud de Vale'}
                </button>
                {/* Historial Informativo de Vales Independientes */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '8px',
                      color: '#6B7280',
                    }}
                  >
                    📋 Historial de Solicitudes Anteriores
                  </label>

                  {independentValesHistory.length === 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        backgroundColor: '#F9FAFB',
                        border: '1px dashed #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#9CA3AF',
                      }}
                    >
                      No hay solicitudes de vales independientes anteriores.
                    </div>
                  ) : (
                    <div
                      style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {independentValesHistory.map((vale) => {
                        const statusColors = {
                          pendiente: {
                            bg: '#FEF3C7',
                            text: '#92400E',
                            label: 'Pendiente',
                          },
                          aprobada: {
                            bg: '#DCFCE7',
                            text: '#166534',
                            label: 'Aprobada',
                          },
                          rechazada: {
                            bg: '#FEE2E2',
                            text: '#991B1B',
                            label: 'Rechazada',
                          },
                        };
                        const style =
                          statusColors[vale.status] || statusColors.pendiente;

                        return (
                          <div
                            key={vale.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 12px',
                              borderBottom: '1px solid #F3F4F6',
                              fontSize: '12px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                              }}
                            >
                              <span
                                style={{ fontWeight: '700', color: '#111827' }}
                              >
                                ${Number(vale.requested_amount_usd).toFixed(2)}
                              </span>
                              <span
                                style={{ color: '#6B7280', fontSize: '11px' }}
                              >
                                {new Date(vale.created_at).toLocaleDateString(
                                  'es-VE',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </span>
                            </div>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '12px',
                                backgroundColor: style.bg,
                                color: style.text,
                                fontWeight: '700',
                                fontSize: '10px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {style.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}

          {neTab === 'historial' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#111827',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {currentSellerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: '900',
                          margin: 0,
                          color: '#111827',
                        }}
                      >
                        {currentSellerName}
                      </h3>
                      <p
                        style={{
                          fontSize: '11px',
                          color: '#6B7280',
                          margin: '2px 0 0 0',
                        }}
                      >
                        {user?.email || 'vendedor@fenix.com'} | Rol:{' '}
                        <strong style={{ textTransform: 'capitalize' }}>
                          {currentUserRole}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFullSellerCard(!showFullSellerCard)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#F3F4F6',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {showFullSellerCard ? 'Ocultar todo' : 'Ver todo'}
                    {showFullSellerCard ? (
                      <ChevronUp style={{ width: '16px', height: '16px' }} />
                    ) : (
                      <ChevronDown style={{ width: '16px', height: '16px' }} />
                    )}
                  </button>
                </div>
                {showFullSellerCard && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #E5E7EB',
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      fontSize: '12px',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#F9FAFB',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #F3F4F6',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                        }}
                      >
                        <Target
                          style={{
                            width: '14px',
                            height: '14px',
                            color: '#6B7280',
                          }}
                        />
                        <span style={{ color: '#6B7280', fontWeight: '600' }}>
                          Meta Mensual (Vendido / Meta):
                        </span>
                      </div>
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontWeight: '900',
                          color: '#111827',
                          fontSize: '13px',
                        }}
                      >
                        ${sellerSalesTotal.toFixed(2)} / $
                        {sellerMetaGoal.toFixed(2)}
                      </p>
                      {sellerMetaGoal > 0 && (
                        <p
                          style={{
                            margin: '2px 0 0 0',
                            fontSize: '11px',
                            color: remainingToGoal > 0 ? '#DC2626' : '#16A34A',
                            fontWeight: '700',
                          }}
                        >
                          {remainingToGoal > 0
                            ? `Faltan: $${remainingToGoal.toFixed(
                                2
                              )} para alcanzar la meta`
                            : '¡Meta alcanzada! '}
                        </p>
                      )}
                    </div>
                    {fixedSalary > 0 && (
                      <div
                        style={{
                          backgroundColor: '#F9FAFB',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #F3F4F6',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '4px',
                          }}
                        >
                          <Banknote
                            style={{
                              width: '14px',
                              height: '14px',
                              color: '#6B7280',
                            }}
                          />
                          <span style={{ color: '#6B7280', fontWeight: '600' }}>
                            Sueldo Fijo Base:
                          </span>
                        </div>
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            fontWeight: '900',
                            color: '#16A34A',
                            fontSize: '14px',
                          }}
                        >
                          ${fixedSalary.toFixed(2)} USD
                        </p>
                      </div>
                    )}
                    <div
                      style={{
                        backgroundColor: '#F9FAFB',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #F3F4F6',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                        }}
                      >
                        <DollarSign
                          style={{
                            width: '14px',
                            height: '14px',
                            color: '#6B7280',
                          }}
                        />
                        <span style={{ color: '#6B7280', fontWeight: '600' }}>
                          Comisiones Recibidas (Histórico):
                        </span>
                      </div>
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontWeight: '900',
                          color: '#16A34A',
                          fontSize: '14px',
                        }}
                      >
                        ${totalCommissionsReceived.toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <Search
                  style={{
                    color: '#9CA3AF',
                    width: '18px',
                    height: '18px',
                    flexShrink: 0,
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar en mis notas de entrega por cliente o N° de transacción..."
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                }}
              >
                {/* GRID DE TARJETAS ESCRITORIO */}
                <div
                  className="desktop-cards-grid"
                  style={{
                    display: 'none',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: '16px',
                    padding: '12px',
                  }}
                >
                  {filteredSalesHistory.length === 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: '#6B7280',
                        gridColumn: '1/-1',
                      }}
                    >
                      No se encontraron Notas de Entrega creadas por ti.
                    </div>
                  ) : (
                    filteredSalesHistory.map((nota) => {
                      const isAprobada = nota.status === 'aprobada';
                      const isCerrada = nota.payment_status === 'cerrada';
                      const totalAbonado = Number(nota.total_paid_usd) || 0;
                      const valeAsociado =
                        nota.vales && nota.vales.length > 0
                          ? nota.vales[0]
                          : null;
                      const valeEstado = valeAsociado
                        ? valeAsociado.status
                        : null;
                      const pendingNotif = paymentNotificationsMap[nota.id];
                      const hasPendingNotif =
                        pendingNotif && pendingNotif.status === 'pending';

                      // E. Obtener porcentaje dinámico para visualización
                      const discountPct = getDiscountPercent(
                        nota.payment_discount
                      );
                      const modeLabel =
                        String(nota.payment_discount) === '53.38'
                          ? `${discountPct}% ($)`
                          : String(nota.payment_discount) === '23.08'
                          ? `${discountPct}% (Bs)`
                          : String(nota.payment_discount) === '10'
                          ? `${discountPct}% (Esp)`
                          : `${discountPct}% (0)`;

                      return (
                        <div
                          key={nota.id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          {/* Header */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start',
                              borderBottom: '1px solid #F3F4F6',
                              paddingBottom: '8px',
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#6B7280',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Cliente
                              </span>
                              <div
                                style={{
                                  fontSize: '16px',
                                  fontWeight: '900',
                                  color: '#111827',
                                  marginTop: '2px',
                                }}
                              >
                                {nota.clients?.name || 'Cliente N/A'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#6B7280',
                                  display: 'block',
                                }}
                              >
                                Transacción
                              </span>
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontWeight: '700',
                                  color: '#111827',
                                }}
                              >
                                #
                                {nota.transaction_number ||
                                  nota.id.substring(0, 6)}
                              </span>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Fecha:
                              </span>{' '}
                              {new Date(nota.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Vendedor:
                              </span>{' '}
                              {currentSellerName}
                            </div>
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Estado:
                              </span>{' '}
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '900',
                                  backgroundColor: isAprobada
                                    ? '#DCFCE7'
                                    : '#FEF3C7',
                                  color: isAprobada ? '#15803D' : '#B45309',
                                }}
                              >
                                {nota.status}
                              </span>
                            </div>
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Pago:
                              </span>{' '}
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '900',
                                  backgroundColor: isCerrada
                                    ? '#DCFCE7'
                                    : '#FEF3C7',
                                  color: isCerrada ? '#15803D' : '#B45309',
                                }}
                              >
                                {isCerrada ? 'Cerrada' : 'Pendiente'}
                              </span>
                            </div>

                            {/* E. Visualización del Porcentaje */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Modalidad:
                              </span>{' '}
                              <span
                                style={{
                                  padding: '2px 6px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                }}
                              >
                                {modeLabel}
                              </span>
                            </div>
                          </div>

                          {/* Finanzas */}
                          <div
                            style={{
                              backgroundColor: '#F9FAFB',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #F3F4F6',
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontWeight: '700',
                                  color: '#4B5563',
                                  fontSize: '11px',
                                }}
                              >
                                Abonado:
                              </span>{' '}
                              <strong style={{ color: '#2563EB' }}>
                                ${totalAbonado.toFixed(2)}
                              </strong>
                            </div>
                            <div>
                              <span
                                style={{
                                  fontWeight: '700',
                                  color: '#4B5563',
                                  fontSize: '11px',
                                }}
                              >
                                Deuda:
                              </span>{' '}
                              {nota.balance_due_usd > 0 ? (
                                `$${Number(nota.balance_due_usd).toFixed(2)}`
                              ) : (
                                <span style={{ color: '#16A34A' }}>
                                  Cerrada
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Acciones Intermedias */}
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            {hasPendingNotif ? (
                              <button
                                onClick={() =>
                                  handleOpenAbonoNotifModal(nota.id)
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  border: '1px solid #FDE68A',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Bell size={11} /> $
                                {Number(pendingNotif.amount_usd).toFixed(2)}
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleOpenAbonoNotifModal(nota.id)
                                }
                                disabled={notifLocked}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: notifLocked
                                    ? '#9CA3AF'
                                    : '#0284C7',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  cursor: notifLocked
                                    ? 'not-allowed'
                                    : 'pointer',
                                  fontWeight: '700',
                                }}
                              >
                                {notifLocked ? 'Espere...' : 'Notif. Abono'}
                              </button>
                            )}
                          </div>

                          {/* Botones Principales */}
                          <div
                            className="action-buttons-wrapper"
                            style={{
                              display: 'flex',
                              gap: '8px',
                              marginTop: '8px',
                              borderTop: '1px solid #E5E7EB',
                              paddingTop: '12px',
                              justifyContent: 'space-between',
                            }}
                          >
                            <button
                              onClick={() => handleEditNE(nota)}
                              style={{
                                padding: '6px',
                                backgroundColor: '#F3F4F6',
                                color: '#4F46E5',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flex: 1,
                                justifyContent: 'center',
                              }}
                            >
                              <Edit style={{ width: '13px', height: '13px' }} />{' '}
                              Editar
                            </button>
                            <button
                              disabled={!isAprobada || loading}
                              onClick={() => handleDownloadPDF(nota)}
                              style={{
                                padding: '6px',
                                backgroundColor: isAprobada
                                  ? '#111827'
                                  : '#E5E7EB',
                                color: isAprobada ? '#FFFFFF' : '#9CA3AF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: isAprobada ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flex: 1,
                                justifyContent: 'center',
                              }}
                            >
                              <Download
                                style={{ width: '13px', height: '13px' }}
                              />{' '}
                              PDF
                            </button>
                            <button
                              disabled={!isAprobada}
                              onClick={() => handleSendPDF(nota)}
                              style={{
                                padding: '6px',
                                backgroundColor: isAprobada
                                  ? '#16A34A'
                                  : '#E5E7EB',
                                color: isAprobada ? '#FFFFFF' : '#9CA3AF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: isAprobada ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flex: 1,
                                justifyContent: 'center',
                              }}
                            >
                              <Send style={{ width: '13px', height: '13px' }} />{' '}
                              WhatsApp
                            </button>
                            <button
                              disabled={totalAbonado > 0}
                              onClick={() => handleDeleteNE(nota)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#FEF2F2',
                                color: totalAbonado > 0 ? '#9CA3AF' : '#DC2626',
                                border: '1px solid #FECACA',
                                borderRadius: '6px',
                                cursor:
                                  totalAbonado > 0 ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <Trash2
                                style={{ width: '14px', height: '14px' }}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* TABLA DESKTOP */}
                <div
                  className="desktop-table"
                  style={{
                    width: '100%',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      minWidth: '1150px',
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                      fontSize: '12px',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#F3F4F6',
                          borderBottom: '1px solid #E5E7EB',
                          fontWeight: '700',
                        }}
                      >
                        <th style={{ padding: '8px 12px', minWidth: '150px' }}>
                          Cliente
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '130px' }}>
                          N° Transacción
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '100px' }}>
                          Fecha
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '140px' }}>
                          Registrado Por
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '90px' }}>
                          Estado
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '100px' }}>
                          Pago N.E.
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '80px' }}>
                          Abono
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '80px' }}>
                          Deuda
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '120px' }}>
                          Notif. Abono
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '70px' }}>
                          Editar
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '80px' }}>
                          Eliminar
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '90px' }}>
                          Descargar
                        </th>
                        <th style={{ padding: '8px 12px', minWidth: '80px' }}>
                          Enviar
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSalesHistory.length === 0 ? (
                        <tr>
                          <td
                            colSpan="14"
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              color: '#6B7280',
                            }}
                          >
                            No se encontraron Notas de Entrega creadas por ti.
                          </td>
                        </tr>
                      ) : (
                        filteredSalesHistory.map((nota) => {
                          const isAprobada = nota.status === 'aprobada';
                          const isCerrada = nota.payment_status === 'cerrada';
                          const totalAbonado = Number(nota.total_paid_usd) || 0;
                          const valeAsociado =
                            nota.vales && nota.vales.length > 0
                              ? nota.vales[0]
                              : null;
                          const valeEstado = valeAsociado
                            ? valeAsociado.status
                            : null;
                          const pendingNotif = paymentNotificationsMap[nota.id];
                          const hasPendingNotif =
                            pendingNotif && pendingNotif.status === 'pending';

                          // E. Visualización Dinámica
                          const discountPct = getDiscountPercent(
                            nota.payment_discount
                          );
                          const modeLabel =
                            String(nota.payment_discount) === '53.38'
                              ? `${discountPct}% ($)`
                              : String(nota.payment_discount) === '23.08'
                              ? `${discountPct}% (Bs)`
                              : String(nota.payment_discount) === '10'
                              ? `${discountPct}% (Esp)`
                              : `${discountPct}% (0)`;

                          return (
                            <tr
                              key={nota.id}
                              style={{ borderBottom: '1px solid #E5E7EB' }}
                            >
                              <td
                                style={{
                                  padding: '8px 12px',
                                  fontWeight: '700',
                                }}
                              >
                                {nota.clients?.name || 'Cliente N/A'}
                              </td>
                              <td
                                style={{
                                  padding: '8px 12px',
                                  fontFamily: 'monospace',
                                }}
                              >
                                #
                                {nota.transaction_number ||
                                  nota.id.substring(0, 6)}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                {new Date(nota.created_at).toLocaleDateString()}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#F3F4F6',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    color: '#374151',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <UserCheck
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      color: '#16A34A',
                                    }}
                                  />
                                  {currentSellerName}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    backgroundColor: isAprobada
                                      ? '#DCFCE7'
                                      : '#FEF3C7',
                                    color: isAprobada ? '#15803D' : '#B45309',
                                  }}
                                >
                                  {nota.status}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    backgroundColor: isCerrada
                                      ? '#DCFCE7'
                                      : '#FEF3C7',
                                    color: isCerrada ? '#15803D' : '#B45309',
                                  }}
                                >
                                  {isCerrada ? 'Cerrada' : 'Pendiente'}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: '8px 12px',
                                  fontWeight: '700',
                                  color: '#2563EB',
                                }}
                              >
                                ${totalAbonado.toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: '8px 12px',
                                  fontWeight: '700',
                                }}
                              >
                                {nota.balance_due_usd > 0 ? (
                                  `$${Number(nota.balance_due_usd).toFixed(2)}`
                                ) : (
                                  <span style={{ color: '#16A34A' }}>
                                    Cerrada
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                {hasPendingNotif ? (
                                  <button
                                    onClick={() =>
                                      handleOpenAbonoNotifModal(nota.id)
                                    }
                                    disabled
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#FEF3C7',
                                      color: '#B45309',
                                      border: '1px solid #FDE68A',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      cursor: 'not-allowed',
                                      fontWeight: '700',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      opacity: 0.7,
                                    }}
                                    title="Ya existe una notificación pendiente"
                                  >
                                    <Bell size={11} /> $
                                    {Number(pendingNotif.amount_usd).toFixed(2)}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleOpenAbonoNotifModal(nota.id)
                                    }
                                    disabled={notifLocked}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: notifLocked
                                        ? '#9CA3AF'
                                        : '#0284C7',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      cursor: notifLocked
                                        ? 'not-allowed'
                                        : 'pointer',
                                      fontWeight: '700',
                                    }}
                                  >
                                    {notifLocked ? 'Espere...' : 'Notif. Abono'}
                                  </button>
                                )}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <button
                                  onClick={() => handleEditNE(nota)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#4F46E5',
                                  }}
                                >
                                  <Edit
                                    style={{ width: '16px', height: '16px' }}
                                  />
                                </button>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <button
                                  onClick={() => handleDeleteNE(nota)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor:
                                      totalAbonado > 0
                                        ? 'not-allowed'
                                        : 'pointer',
                                    color:
                                      totalAbonado > 0 ? '#9CA3AF' : '#DC2626',
                                  }}
                                  title={
                                    totalAbonado > 0
                                      ? 'No se puede eliminar porque ya registra abonos'
                                      : 'Eliminar Nota de Entrega'
                                  }
                                >
                                  <Trash2
                                    style={{ width: '16px', height: '16px' }}
                                  />
                                </button>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <button
                                  disabled={!isAprobada || loading}
                                  onClick={() => handleDownloadPDF(nota)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: isAprobada
                                      ? 'pointer'
                                      : 'not-allowed',
                                    color: isAprobada ? '#111827' : '#D1D5DB',
                                  }}
                                  title={
                                    isAprobada
                                      ? 'Descargar PDF directo'
                                      : 'Nota no aprobada'
                                  }
                                >
                                  <Download
                                    style={{ width: '16px', height: '16px' }}
                                  />
                                </button>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <button
                                  disabled={!isAprobada}
                                  onClick={() => handleSendPDF(nota)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: isAprobada
                                      ? 'pointer'
                                      : 'not-allowed',
                                    color: isAprobada ? '#16A34A' : '#D1D5DB',
                                  }}
                                  title={
                                    isAprobada
                                      ? 'Enviar resumen por WhatsApp'
                                      : 'Nota no aprobada'
                                  }
                                >
                                  <Send
                                    style={{ width: '16px', height: '16px' }}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TARJETAS MÓVIL */}
                <div
                  className="mobile-cards-container"
                  style={{ padding: '12px' }}
                >
                  {filteredSalesHistory.length === 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: '#6B7280',
                      }}
                    >
                      No se encontraron Notas de Entrega creadas por ti.
                    </div>
                  ) : (
                    filteredSalesHistory.map((nota) => {
                      const isAprobada = nota.status === 'aprobada';
                      const isCerrada = nota.payment_status === 'cerrada';
                      const totalAbonado = Number(nota.total_paid_usd) || 0;
                      const valeAsociado =
                        nota.vales && nota.vales.length > 0
                          ? nota.vales[0]
                          : null;
                      const valeEstado = valeAsociado
                        ? valeAsociado.status
                        : null;
                      const pendingNotif = paymentNotificationsMap[nota.id];
                      const hasPendingNotif =
                        pendingNotif && pendingNotif.status === 'pending';

                      // E. Visualización Dinámica
                      const discountPct = getDiscountPercent(
                        nota.payment_discount
                      );
                      const modeLabel =
                        String(nota.payment_discount) === '53.38'
                          ? `${discountPct}% ($)`
                          : String(nota.payment_discount) === '23.08'
                          ? `${discountPct}% (Bs)`
                          : String(nota.payment_discount) === '10'
                          ? `${discountPct}% (Esp)`
                          : `${discountPct}% (0)`;

                      return (
                        <div
                          key={nota.id}
                          style={{
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            marginBottom: '8px',
                          }}
                        >
                          <div
                            style={{
                              borderBottom: '1px solid #E5E7EB',
                              paddingBottom: '8px',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: '#6B7280',
                                textTransform: 'uppercase',
                                display: 'block',
                              }}
                            >
                              Cliente
                            </span>
                            <span
                              style={{
                                fontSize: '16px',
                                fontWeight: '900',
                                color: '#111827',
                              }}
                            >
                              {nota.clients?.name || 'Cliente N/A'}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Transacción:
                              </span>{' '}
                              #
                              {nota.transaction_number ||
                                nota.id.substring(0, 6)}
                            </div>
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Fecha:
                              </span>{' '}
                              {new Date(nota.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              Registrado Por:
                            </span>{' '}
                            {currentSellerName}
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Estado:
                              </span>{' '}
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '900',
                                  backgroundColor: isAprobada
                                    ? '#DCFCE7'
                                    : '#FEF3C7',
                                  color: isAprobada ? '#15803D' : '#B45309',
                                }}
                              >
                                {nota.status}
                              </span>
                            </div>
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Pago N.E.:
                              </span>{' '}
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '900',
                                  backgroundColor: isCerrada
                                    ? '#DCFCE7'
                                    : '#FEF3C7',
                                  color: isCerrada ? '#15803D' : '#B45309',
                                }}
                              >
                                {isCerrada ? 'Cerrada' : 'Pendiente'}
                              </span>
                            </div>
                          </div>

                          {/* E. Visualización del Porcentaje en Móvil */}
                          <div style={{ fontSize: '12px' }}>
                            <span
                              style={{ fontWeight: '700', color: '#4B5563' }}
                            >
                              Modalidad:
                            </span>{' '}
                            <span
                              style={{
                                padding: '2px 6px',
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                              }}
                            >
                              {modeLabel}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                              fontSize: '12px',
                            }}
                          >
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Abono:
                              </span>{' '}
                              <strong style={{ color: '#2563EB' }}>
                                ${totalAbonado.toFixed(2)}
                              </strong>
                            </div>
                            <div>
                              <span
                                style={{ fontWeight: '700', color: '#4B5563' }}
                              >
                                Deuda:
                              </span>{' '}
                              {nota.balance_due_usd > 0 ? (
                                `$${Number(nota.balance_due_usd).toFixed(2)}`
                              ) : (
                                <span
                                  style={{
                                    color: '#16A34A',
                                    fontWeight: '700',
                                  }}
                                >
                                  Cerrada
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              marginTop: '4px',
                            }}
                          >
                            {hasPendingNotif ? (
                              <button
                                onClick={() =>
                                  handleOpenAbonoNotifModal(nota.id)
                                }
                                disabled
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  border: '1px solid #FDE68A',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  cursor: 'not-allowed',
                                  fontWeight: '700',
                                  opacity: 0.7,
                                }}
                              >
                                ${Number(pendingNotif.amount_usd).toFixed(2)}{' '}
                                (Pend.)
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleOpenAbonoNotifModal(nota.id)
                                }
                                disabled={notifLocked}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: notifLocked
                                    ? '#9CA3AF'
                                    : '#0284C7',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  cursor: notifLocked
                                    ? 'not-allowed'
                                    : 'pointer',
                                  fontWeight: '700',
                                }}
                              >
                                {notifLocked ? 'Espere...' : 'Notif. Abono'}
                              </button>
                            )}
                          </div>

                          <div
                            className="action-buttons-wrapper"
                            style={{
                              display: 'flex',
                              gap: '8px',
                              marginTop: '6px',
                              flexWrap: 'wrap',
                              borderTop: '1px solid #E5E7EB',
                              paddingTop: '8px',
                              justifyContent: 'space-between',
                            }}
                          >
                            <button
                              onClick={() => handleEditNE(nota)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#F3F4F6',
                                color: '#4F46E5',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Edit style={{ width: '13px', height: '13px' }} />{' '}
                              Editar
                            </button>
                            <button
                              disabled={!isAprobada || loading}
                              onClick={() => handleDownloadPDF(nota)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: isAprobada
                                  ? '#111827'
                                  : '#E5E7EB',
                                color: isAprobada ? '#FFFFFF' : '#9CA3AF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: isAprobada ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Download
                                style={{ width: '13px', height: '13px' }}
                              />{' '}
                              PDF
                            </button>
                            <button
                              disabled={!isAprobada}
                              onClick={() => handleSendPDF(nota)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: isAprobada
                                  ? '#16A34A'
                                  : '#E5E7EB',
                                color: isAprobada ? '#FFFFFF' : '#9CA3AF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: isAprobada ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Send style={{ width: '13px', height: '13px' }} />{' '}
                              WhatsApp
                            </button>
                            <button
                              disabled={totalAbonado > 0}
                              onClick={() => handleDeleteNE(nota)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#FEF2F2',
                                color: totalAbonado > 0 ? '#9CA3AF' : '#DC2626',
                                border: '1px solid #FECACA',
                                borderRadius: '6px',
                                cursor:
                                  totalAbonado > 0 ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <Trash2
                                style={{ width: '14px', height: '14px' }}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubMenu === 'historial_ventas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Encabezado y Buscador */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              backgroundColor: '#f9fafb',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#111827',
              }}
            >
              <History size={18} color="#111827" />
              Historial de Facturación / Liquidaciones
            </div>
            <div
              style={{ position: 'relative', width: '320px', maxWidth: '100%' }}
            >
              <Search
                size={16}
                color="#6b7280"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar por ID factura o periodo..."
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Contenedor Principal de Datos */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* GRID DE TARJETAS ESCRITORIO */}
            <div
              className="desktop-cards-grid"
              style={{
                display: 'none',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '16px',
                padding: '12px',
              }}
            >
              {filteredSettlementHistory.length === 0 ? (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: '#6B7280',
                    gridColumn: '1/-1',
                  }}
                >
                  No hay historial de facturación registrado para ti.
                </div>
              ) : (
                filteredSettlementHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        borderBottom: '1px solid #E5E7EB',
                        paddingBottom: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          display: 'block',
                        }}
                      >
                        ID Liquidación
                      </span>
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: '900',
                          color: '#111827',
                        }}
                      >
                        {item.id}
                      </span>
                    </div>
                    {/* Info Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: '700', color: '#4B5563' }}>
                          Fecha Pago:
                        </span>{' '}
                        {item.datePaid}
                      </div>
                      <div>
                        <span style={{ fontWeight: '700', color: '#4B5563' }}>
                          Periodo:
                        </span>{' '}
                        Ciclo #{item.cycle} ({item.month}/{item.year})
                      </div>
                      <div>
                        <span style={{ fontWeight: '700', color: '#4B5563' }}>
                          Tasa BCV:
                        </span>{' '}
                        {Number(item.bcvRate).toFixed(2)}
                      </div>
                      <div>
                        <span style={{ fontWeight: '700', color: '#4B5563' }}>
                          Total N.E.:
                        </span>{' '}
                        ${item.totalNeAmount.toFixed(2)}
                      </div>
                    </div>
                    {/* Montos Destacados */}
                    <div
                      style={{
                        backgroundColor: '#F9FAFB',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #F3F4F6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ color: '#059669', fontWeight: '700' }}>
                          Neto 53.38%:
                        </span>
                        <span style={{ color: '#059669', fontWeight: '900' }}>
                          ${item.comm53Net.toFixed(2)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ color: '#0369a1', fontWeight: '700' }}>
                          Neto 23.08%:
                        </span>
                        <span style={{ color: '#0369a1', fontWeight: '900' }}>
                          ${item.comm23Net.toFixed(2)}
                        </span>
                      </div>
                      <div
                        style={{
                          borderTop: '1px solid #E5E7EB',
                          paddingTop: '6px',
                          marginTop: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                        }}
                      >
                        <span style={{ fontWeight: '900', color: '#111827' }}>
                          Total Equivalente:
                        </span>
                        <span style={{ fontWeight: '900', color: '#111827' }}>
                          ${item.totalEquivalentUsd.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {/* Acciones */}
                    <div
                      className="action-buttons-wrapper"
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '8px',
                        borderTop: '1px solid #E5E7EB',
                        paddingTop: '12px',
                        justifyContent: 'space-between',
                      }}
                    >
                      <button
                        onClick={() => {
                          const modal = document.getElementById(
                            'captured-history-modal'
                          );
                          if (modal) {
                            modal.querySelector(
                              '#captured-html-content'
                            ).innerHTML =
                              item.capturedHTML || '<p>Sin contenido.</p>';
                            modal.style.display = 'flex';
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#1e40af',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={13} /> Ver Factura
                      </button>
                      <button
                        onClick={() => handlePrintCapturedInvoicePDF(item)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#881337',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Download size={13} /> PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* --- TABLA DESKTOP --- */}
            <div
              className="desktop-table"
              style={{
                width: '100%',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <table
                style={{
                  width: '100%',
                  minWidth: '900px',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '13px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <th style={{ padding: '12px 14px' }}>ID Liquidación</th>
                    <th style={{ padding: '12px 14px' }}>Fecha Pago</th>
                    <th style={{ padding: '12px 14px' }}>Periodo</th>
                    <th style={{ padding: '12px 14px' }}>Tasa BCV</th>
                    <th style={{ padding: '12px 14px' }}>Total N.E. ($)</th>
                    <th style={{ padding: '12px 14px' }}>
                      Neto 53.38% Net ($)
                    </th>
                    <th style={{ padding: '12px 14px' }}>
                      Neto 23.08% Net ($)
                    </th>
                    <th style={{ padding: '12px 14px' }}>
                      Total Equivalente ($)
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSettlementHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        style={{
                          padding: '24px',
                          textAlign: 'center',
                          color: '#6b7280',
                        }}
                      >
                        No hay historial de facturación registrado para ti.
                      </td>
                    </tr>
                  ) : (
                    filteredSettlementHistory.map((item) => (
                      <tr
                        key={item.id}
                        style={{ borderBottom: '1px solid #e5e7eb' }}
                      >
                        <td
                          style={{ padding: '12px 14px', fontWeight: 'bold' }}
                        >
                          {item.id}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {item.datePaid}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          Ciclo #{item.cycle} ({item.month}/{item.year})
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {Number(item.bcvRate).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          ${item.totalNeAmount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            color: '#059669',
                            fontWeight: 'bold',
                          }}
                        >
                          ${item.comm53Net.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            color: '#0369a1',
                            fontWeight: 'bold',
                          }}
                        >
                          ${item.comm23Net.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            color: '#111827',
                            fontWeight: 'bold',
                          }}
                        >
                          ${item.totalEquivalentUsd.toFixed(2)}
                        </td>
                        <td
                          style={{ padding: '12px 14px', textAlign: 'center' }}
                        >
                          <div
                            className="action-buttons-wrapper"
                            style={{
                              display: 'flex',
                              gap: '6px',
                              justifyContent: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              onClick={() => {
                                const modal = document.getElementById(
                                  'captured-history-modal'
                                );
                                if (modal) {
                                  modal.querySelector(
                                    '#captured-html-content'
                                  ).innerHTML =
                                    item.capturedHTML ||
                                    '<p>Sin contenido.</p>';
                                  modal.style.display = 'flex';
                                }
                              }}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#1e40af',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Eye size={13} /> Ver Factura
                            </button>
                            <button
                              onClick={() =>
                                handlePrintCapturedInvoicePDF(item)
                              }
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#881337',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Download size={13} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* --- TARJETAS MÓVIL --- */}
            <div className="mobile-cards-container" style={{ padding: '12px' }}>
              {filteredSettlementHistory.length === 0 ? (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}
                >
                  No hay historial de facturación registrado para ti.
                </div>
              ) : (
                filteredSettlementHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    {/* Encabezado de la Tarjeta */}
                    <div
                      style={{
                        borderBottom: '1px solid #E5E7EB',
                        paddingBottom: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          display: 'block',
                        }}
                      >
                        ID Liquidación
                      </span>
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: '900',
                          color: '#111827',
                        }}
                      >
                        {item.id}
                      </span>
                    </div>
                    {/* Campos Verticales */}
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ fontWeight: '700', color: '#4B5563' }}>
                        Fecha de Pago:
                      </span>{' '}
                      {item.datePaid}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ fontWeight: '700', color: '#4B5563' }}>
                        Periodo:
                      </span>{' '}
                      Ciclo #{item.cycle} ({item.month}/{item.year})
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ fontWeight: '700', color: '#4B5563' }}>
                        Tasa BCV:
                      </span>{' '}
                      {Number(item.bcvRate).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ fontWeight: '700', color: '#4B5563' }}>
                        Total N.E.:
                      </span>{' '}
                      ${item.totalNeAmount.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#059669' }}>
                      <span style={{ fontWeight: '700', color: '#059669' }}>
                        Neto 53.38%:
                      </span>{' '}
                      ${item.comm53Net.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#0369a1' }}>
                      <span style={{ fontWeight: '700', color: '#0369a1' }}>
                        Neto 23.08%:
                      </span>{' '}
                      ${item.comm23Net.toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '900',
                        color: '#111827',
                        marginTop: '4px',
                      }}
                    >
                      Total Equivalente: ${item.totalEquivalentUsd.toFixed(2)}
                    </div>
                    {/* Botones de Acción */}
                    <div
                      className="action-buttons-wrapper"
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '6px',
                        flexWrap: 'wrap',
                        borderTop: '1px solid #E5E7EB',
                        paddingTop: '8px',
                        justifyContent: 'space-between',
                      }}
                    >
                      <button
                        onClick={() => {
                          const modal = document.getElementById(
                            'captured-history-modal'
                          );
                          if (modal) {
                            modal.querySelector(
                              '#captured-html-content'
                            ).innerHTML =
                              item.capturedHTML || '<p>Sin contenido.</p>';
                            modal.style.display = 'flex';
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#1e40af',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={13} /> Ver Factura
                      </button>
                      <button
                        onClick={() => handlePrintCapturedInvoicePDF(item)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#881337',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Download size={13} /> PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL VALE */}
      {valeModal.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              width: '320px',
              maxWidth: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              boxSizing: 'border-box',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '900',
                margin: '0 0 10px 0',
              }}
            >
              Solicitar Adelanto (Vale)
            </h3>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                marginBottom: '4px',
              }}
            >
              Monto a solicitar ($):
            </label>
            <input
              type="number"
              value={valeModal.monto}
              onChange={(e) =>
                setValeModal({ ...valeModal, monto: e.target.value })
              }
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() =>
                  setValeModal({ open: false, notaId: null, monto: '' })
                }
                style={{
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSolicitarVale}
                disabled={valesLocked}
                style={{
                  padding: '6px 10px',
                  backgroundColor: valesLocked ? '#9CA3AF' : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: valesLocked ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                }}
              >
                {valesLocked ? 'Espere...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A. MODAL DE EDICIÓN DE NOTA DE ENTREGA */}
      {editNeModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1250,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #111827',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '2px solid #111827',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
                  Panel Editable - Nota de Entrega #
                  {editNeModal.noteData?.transaction_number}
                </h2>
              </div>
              <button
                onClick={() => setEditNeModal({ open: false, noteData: null })}
                style={{
                  background: '#111827',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                Cerrar Panel
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Cliente
                  </label>
                  <SearchableDropdown
                    options={clients.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    value={editNeForm.client_id}
                    onChange={(val) =>
                      setEditNeForm({ ...editNeForm, client_id: val })
                    }
                    placeholder="Seleccionar cliente..."
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Categoría *
                  </label>
                  <select
                    value={editNeForm.category}
                    onChange={(e) =>
                      setEditNeForm({ ...editNeForm, category: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="bombillos">Bombillos</option>
                    <option value="fluidos">Fluidos</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    % Descuento (Pago Bs) *
                  </label>
                  <select
                    value={editNeForm.payment_discount}
                    onChange={(e) => {
                      setEditNeForm({
                        ...editNeForm,
                        payment_discount: e.target.value,
                      });
                      handleEditNeRecalculatePrices(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #F59E0B',
                      borderRadius: '6px',
                      backgroundColor: '#FEF3C7',
                      color: '#78350F',
                      fontWeight: '700',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="53.38">
                      {globalDiscount53}% Pagará en $
                    </option>
                    <option value="23.08">
                      {globalDiscount23}% Pagará en Bs BCV
                    </option>
                    <option value="10">
                      {globalDiscount10}% Descuento Especial
                    </option>
                    <option value="0">{globalDiscount0}% Sin Descuento</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Agregar Productos
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    alignItems: 'flex-end',
                  }}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <SearchableDropdown
                      options={products
                        .filter(
                          (p) =>
                            !p.category ||
                            p.category.toLowerCase() ===
                              editNeForm.category.toLowerCase()
                        )
                        .map((p) => {
                          const descPct = getDiscountPercent(
                            editNeForm.payment_discount
                          );
                          const desc =
                            Number(p.price_usd) * (1 - descPct / 100);
                          return {
                            value: p.id,
                            label: `${p.description} | Stock: ${
                              p.stock_current
                            } | Base: $${Number(p.price_usd).toFixed(
                              2
                            )} | Desc: $${desc.toFixed(2)}`,
                          };
                        })}
                      value={editNeSelectedProdId}
                      onChange={setEditNeSelectedProdId}
                      placeholder="Seleccionar del catálogo..."
                    />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px',
                      }}
                    >
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editNeQuantity}
                      onChange={(e) => setEditNeQuantity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                        height: '42px',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleEditNeAddProduct}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      height: '42px',
                    }}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #111827',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #E5E7EB',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: '15px',
                        fontWeight: '900',
                        margin: 0,
                      }}
                    >
                      FENIX AUTO PART C.A
                    </h2>
                    <p style={{ fontWeight: '700', margin: '2px 0' }}>
                      RIF: J-50261925-2
                    </p>
                    <p style={{ margin: '6px 0 0 0' }}>
                      <strong>Cliente: </strong>{' '}
                      {clients.find((c) => c.id === editNeForm.client_id)
                        ?.name || '...'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0 }}>
                      <strong>Fecha/Hora: </strong>{' '}
                      {new Date(
                        editNeModal.noteData?.created_at
                      ).toLocaleString()}
                    </p>
                    <p style={{ margin: '2px 0' }}>
                      <strong>N° Transacción: </strong> #
                      {editNeModal.noteData?.transaction_number}
                    </p>
                  </div>
                </div>

                <div
                  style={{ width: '100%', overflowX: 'auto' }}
                  className="admin-table-desktop"
                >
                  <table
                    style={{
                      width: '100%',
                      minWidth: '700px',
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                      fontSize: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#F3F4F6',
                          borderBottom: '1px solid #D1D5DB',
                          fontWeight: '700',
                        }}
                      >
                        <th style={{ padding: '8px' }}>Código</th>
                        <th style={{ padding: '8px' }}>Descripción</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>
                          Cantidad
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Valor Unitario
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          V. U. con descuento
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Valor Total
                        </th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>
                          Eliminar
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {editNeCart.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              color: '#9CA3AF',
                              fontStyle: 'italic',
                            }}
                          >
                            No hay productos añadidos a la nota de entrega.
                          </td>
                        </tr>
                      ) : (
                        editNeCart.map((item) => (
                          <tr
                            key={item.product_id}
                            style={{ borderBottom: '1px solid #E5E7EB' }}
                          >
                            <td
                              style={{
                                padding: '8px',
                                fontFamily: 'monospace',
                              }}
                            >
                              {item.code}
                            </td>
                            <td style={{ padding: '8px', fontWeight: '600' }}>
                              {item.description}
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'center',
                              }}
                            >
                              {item.quantity}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              ${Number(item.unit_price_usd).toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'right',
                                color: '#B45309',
                              }}
                            >
                              $
                              {Number(item.discounted_unit_price_usd).toFixed(
                                2
                              )}
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'right',
                                fontWeight: '700',
                              }}
                            >
                              ${Number(item.total_line_usd).toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'center',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditNeRemoveItem(item.product_id)
                                }
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: '#dc2626',
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="admin-mobile-cards">
                  {editNeCart.length === 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: '#9CA3AF',
                      }}
                    >
                      No hay productos.
                    </div>
                  ) : (
                    renderProductCards(editNeCart, true, handleEditNeRemoveItem)
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '12px',
                    fontSize: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '300px',
                      backgroundColor: '#F9FAFB',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <span>Total sin Descuento: </span>
                      <strong>
                        $
                        {editNeCart
                          .reduce(
                            (acc, i) => acc + i.unit_price_usd * i.quantity,
                            0
                          )
                          .toFixed(2)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        color: '#B45309',
                      }}
                    >
                      <span>
                        {getDiscountPercent(editNeForm.payment_discount)}% de
                        descuento aplicado:{' '}
                      </span>
                      <strong>
                        -$
                        {(
                          editNeCart.reduce(
                            (acc, i) => acc + i.unit_price_usd * i.quantity,
                            0
                          ) -
                          editNeCart.reduce(
                            (acc, i) => acc + i.total_line_usd,
                            0
                          )
                        ).toFixed(2)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #D1D5DB',
                        paddingTop: '4px',
                        fontSize: '13px',
                        fontWeight: '900',
                      }}
                    >
                      <span>Precio Final: </span>
                      <span style={{ color: '#059669' }}>
                        $
                        {editNeCart
                          .reduce((acc, i) => acc + i.total_line_usd, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '4px',
                    }}
                  >
                    Observación:
                  </label>
                  <textarea
                    rows="2"
                    value={editNeForm.observation}
                    onChange={(e) =>
                      setEditNeForm({
                        ...editNeForm,
                        observation: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      fontSize: '12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      boxSizing: 'border-box',
                    }}
                  ></textarea>
                </div>

                <div
                  style={{
                    backgroundColor: '#F3F4F6',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    color: '#4B5563',
                    lineHeight: '1.4',
                    marginBottom: '12px',
                    textAlign: 'justify',
                  }}
                >
                  <strong>Términos y condiciones: </strong> {globalTerms}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleSaveEditedNe}
                    disabled={loading}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Guardar y Enviar a Aprobación
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ABONO */}
      {abonoNotifModal.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              padding: '16px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}>
                Notificación de Abono
              </h3>
              <button
                onClick={() =>
                  setAbonoNotifModal({ open: false, notaId: null })
                }
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
            {(() => {
              const nota = salesHistory.find(
                (n) => n.id === abonoNotifModal.notaId
              );
              const clientName = nota?.clients?.name || 'Cliente no encontrado';
              return (
                <div
                  style={{
                    marginBottom: '12px',
                    backgroundColor: '#F3F4F6',
                    padding: '8px',
                    borderRadius: '6px',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#6B7280',
                      marginBottom: '2px',
                    }}
                  >
                    CLIENTE ASOCIADO
                  </label>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '900',
                      color: '#111827',
                    }}
                  >
                    {clientName}
                  </div>
                </div>
              );
            })()}
            <form
              onSubmit={handleEnviarNotificacionAbono}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '12px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: '700',
                    marginBottom: '4px',
                  }}
                >
                  Fecha del Pago
                </label>
                <input
                  type="date"
                  required
                  value={abonoForm.payment_date}
                  onChange={(e) =>
                    setAbonoForm({ ...abonoForm, payment_date: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: '700',
                    marginBottom: '4px',
                  }}
                >
                  Monto Recibido ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={abonoForm.amount_usd}
                  onChange={(e) =>
                    setAbonoForm({ ...abonoForm, amount_usd: e.target.value })
                  }
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: '700',
                    marginBottom: '4px',
                  }}
                >
                  Método de Recepción *
                </label>
                <select
                  value={abonoForm.payment_method}
                  onChange={(e) =>
                    setAbonoForm({
                      ...abonoForm,
                      payment_method: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Efectivo $">Efectivo ($)</option>
                  <option value="Binance">Binance</option>
                  <option value="Zelle">Zelle</option>
                  <option value="Pago Móvil">Pago Móvil (Bs)</option>
                  <option value="Transferencia Bs">Transferencia Bs</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: '700',
                    marginBottom: '4px',
                  }}
                >
                  N° Referencia / Comprobante
                </label>
                <input
                  type="text"
                  value={abonoForm.reference_number}
                  onChange={(e) =>
                    setAbonoForm({
                      ...abonoForm,
                      reference_number: e.target.value,
                    })
                  }
                  placeholder="Ej. Ref #123456"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: '700',
                    marginBottom: '4px',
                    color: '#DC2626',
                  }}
                >
                  Adjuntar Comprobante (Foto/Billete) *
                </label>
                <CustomFileInput
                  id={`abono_file_${abonoNotifModal.notaId}`}
                  onChange={(e) =>
                    setAbonoFiles((prev) => ({
                      ...prev,
                      [abonoNotifModal.notaId]: e.target.files[0],
                    }))
                  }
                  file={abonoFiles[abonoNotifModal.notaId]}
                  labelText="Subir foto del billete o recibo"
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: '700',
                    marginBottom: '4px',
                  }}
                >
                  Nota u Observación del Usuario
                </label>
                <textarea
                  rows="2"
                  value={abonoForm.user_note}
                  onChange={(e) =>
                    setAbonoForm({ ...abonoForm, user_note: e.target.value })
                  }
                  placeholder="Escriba alguna aclaratoria o nota para este abono..."
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    boxSizing: 'border-box',
                  }}
                ></textarea>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  marginTop: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setAbonoNotifModal({ open: false, notaId: null })
                  }
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#111827',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  Registrar Notificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL CAPTURADO */}
      <div
        id="captured-history-modal"
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          padding: '16px',
        }}
        onClick={(e) => {
          if (e.target.id === 'captured-history-modal') {
            e.currentTarget.style.display = 'none';
          }
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #111827',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '2px solid #111827',
              paddingBottom: '12px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
              Visualización de Factura Histórica
            </h2>
            <button
              onClick={() => {
                document.getElementById(
                  'captured-history-modal'
                ).style.display = 'none';
              }}
              style={{
                background: '#111827',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Cerrar
            </button>
          </div>
          <div id="captured-html-content" />
        </div>
      </div>
    </div>
  );
}
