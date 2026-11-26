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

// --- COMPONENTE SEARCHABLE DROPDOWN (ACTUALIZADO CON MULTILÍNEA Y LIMPIAR) ---
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  labelKey = 'label',
  valueKey = 'value',
  imageKey = 'image_url',
  onClear, // Prop para limpiar la selección
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
    const searchTerms = search.toLowerCase().trim().split(/\s+/);
    return searchTerms.every((term) => text.includes(term));
  });

  const selectedOption = options.find(
    (o) => String(o[valueKey]) === String(value)
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '14px',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          backgroundColor: '#FFFFFF',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '42px',
          gap: '8px',
        }}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {selectedOption && selectedOption[imageKey] ? (
            <img
              src={selectedOption[imageKey]}
              alt="Miniatura"
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'cover',
                borderRadius: '4px',
                flexShrink: 0,
              }}
            />
          ) : null}
          {/* Soporte multilínea habilitado con whiteSpace: normal */}
          <span
            style={{
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: '1.2',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {selectedOption ? selectedOption[labelKey] : placeholder}
          </span>
        </div>

        {/* Botones de acción derecha: Limpiar y Flecha */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {value && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              title="Limpiar selección"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
          <span
            onClick={() => setIsOpen(!isOpen)}
            style={{ fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}
          >
            ▼
          </span>
        </div>
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
                    padding: '8px 12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor:
                      String(value) === String(opt[valueKey])
                        ? '#eff6ff'
                        : 'transparent',
                  }}
                >
                  {opt[imageKey] ? (
                    <img
                      src={opt[imageKey]}
                      alt=""
                      style={{
                        width: '32px',
                        height: '32px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        flexShrink: 0,
                        border: '1px solid #e5e7eb',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      lineHeight: '1.3',
                    }}
                  >
                    {opt[labelKey]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesModule() {
  const { user, role } = useAuth();
  // Referencias para el menú móvil
  const mobileMenuRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- PERSISTENCIA Y NAVEGACIÓN DE PESTAÑAS ---
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
  const [pendingPaymentNotifications, setPendingPaymentNotifications] =
    useState([]);
  const [imageModal, setImageModal] = useState({
    open: false,
    url: '',
    title: '',
    clientId: null,
    fieldName: null,
  });

  // --- ESTADOS PARA CONFIGURACIÓN GLOBAL Y FOLIO ---
  const [globalDiscount53, setGlobalDiscount53] = useState(53.38);
  const [globalDiscount23, setGlobalDiscount23] = useState(23.08);
  const [globalDiscount10, setGlobalDiscount10] = useState(10);
  const [globalDiscount0, setGlobalDiscount0] = useState(0);
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
  const [neClientId, setNeClientId] = useState(() => {
    return localStorage.getItem('sales_ne_client_cache') || '';
  });
  const [neSearchProduct, setNeSearchProduct] = useState('');
  const [neSelectedProdId, setNeSelectedProdId] = useState('');
  const [neCategoria, setNeCategoria] = useState(() => {
    return localStorage.getItem('sales_ne_category_cache') || 'bombillos';
  });
  const [neTipoPago, setNeTipoPago] = useState(() => {
    return localStorage.getItem('sales_ne_payment_cache') || '0';
  });
  const [neQuantity, setNeQuantity] = useState(1);
  const [neCart, setNeCart] = useState(() => {
    const cachedCart = localStorage.getItem('sales_ne_cart_cache');
    return cachedCart ? JSON.parse(cachedCart) : [];
  });

  // Guardar automáticamente en caché cada cambio en los campos de la nota
  useEffect(() => {
    localStorage.setItem('sales_ne_client_cache', neClientId);
  }, [neClientId]);

  useEffect(() => {
    localStorage.setItem('sales_ne_category_cache', neCategoria);
  }, [neCategoria]);

  useEffect(() => {
    localStorage.setItem('sales_ne_payment_cache', neTipoPago);
  }, [neTipoPago]);

  useEffect(() => {
    localStorage.setItem('sales_ne_cart_cache', JSON.stringify(neCart));
  }, [neCart]);

  // Recalcular precios del carrito al cambiar el tipo de pago/descuento
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
  const [abonoClientSearch, setAbonoClientSearch] = useState('');
  const [abonoSelectedClient, setAbonoSelectedClient] = useState(null);
  const [abonoStep, setAbonoStep] = useState(1);
  const [abonoHighAmountModal, setAbonoHighAmountModal] = useState(false);
  const getLocalTodayDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const VENEZUELAN_BANKS = [
    '0102 Venezuela',
    '0104 Venezolano de Crédito',
    '0105 Mercantil',
    '0108 Provincial',
    '0114 Bancaribe',
    '0115 Exterior',
    '0128 Caroní',
    '0134 Banesco',
    '0137 Sofitasa',
    '0138 Plaza',
    '0146 Bangente',
    '0151 BFC Fondo Común',
    '0156 100% Banco',
    '0157 DelSur',
    '0163 Tesoro',
    '0166 Agrícola de Venezuela',
    '0168 Bancrecer',
    '0169 Mi Banco',
    '0171 Activo',
    '0172 Bancamiga',
    '0173 Internacional de Desarrollo',
    '0174 Banplus',
    '0175 Bicentenario',
    '0177 Banfanb',
    '0178 N58 Banco Digital',
    '0191 BNC Nacional de Crédito',
  ];

  const [abonoForm, setAbonoForm] = useState({
    payment_date: '',
    amount_usd: '',
    exchange_rate: '',
    amount_bs: '',
    origin_bank: '',
    destination_bank: '',
    payment_method: '',
    reference_number: '',
    user_note: '',
  });
  const [sellerAbonosHistory, setSellerAbonosHistory] = useState([]);
  const [sellerAbonosSearch, setSellerAbonosSearch] = useState('');
  const [sellerHistoryDetailModal, setSellerHistoryDetailModal] =
    useState(null);
  const [abonoFile, setAbonoFile] = useState(null);
  const [abonoNoteSelections, setAbonoNoteSelections] = useState({});
  const [independentValesHistory, setIndependentValesHistory] = useState([]);

  // Bloqueo Anti-Spam
  const [valesLocked, setValesLocked] = useState(false);
  const [notifLocked, setNotifLocked] = useState(false);
  const abonoSubmittingRef = useRef(false);

  // Modal de Edición de Nota de Entrega
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
  const [editNeOriginalQuantities, setEditNeOriginalQuantities] = useState({});

  // Estado para Vales Independientes
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
      }, 2500);
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
    fetchSellerAbonosHistory();
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
      const { data, error } = await supabase.rpc('get_next_sales_order_folio');
      if (!error && data) {
        setEstimatedNextFolio(String(data));
      } else {
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
        setPendingPaymentNotifications(
          data.filter((item) => item.status === 'pending')
        );
      }
    } catch (e) {
      console.error('Error cargando seller_payment_notifications:', e);
    }
  };

  const fetchSellerAbonosHistory = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('payments_independent_history')
        .select('*')
        .eq('seller_id', user.id)
        .order('payment_date', { ascending: false });
      if (!error && data) {
        setSellerAbonosHistory(data);
      }
    } catch (e) {
      console.error('Error cargando historial de abonos del vendedor:', e);
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
        .is('order_id', null)
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
  // HELPER GPS & STORAGE (CON SOPORTE NATIVO IPHONE / IOS / SAFARI)
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
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${pathFolder}/${fileName}`;

    // Compatibilidad iOS / Safari: leer bytes reales en memoria para evitar "No content provided"
    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error(
        'No se pudo leer la imagen seleccionada en el dispositivo. Intente seleccionarla nuevamente.'
      );
    }
    const contentType =
      file.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
    const fileBlob = new Blob([arrayBuffer], { type: contentType });

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBlob, {
        contentType,
        upsert: false,
      });
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
    if (file.type && file.type.startsWith('image/')) return true;
    // En iOS/Safari file.type a veces viene vacío; validar también por extensión
    return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name || '');
  };

  // ---------------------------------------------------------------------------
  // MANEJADORES: CLIENTES OFICIALES
  // ---------------------------------------------------------------------------
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (ciFile && !validateImageFile(ciFile)) {
      alert('El archivo de C.I. debe ser una imagen (jpg, png, etc.).');
      return;
    }
    if (rifFile && !validateImageFile(rifFile)) {
      alert('El archivo de RIF debe ser una imagen (jpg, png, etc.).');
      return;
    }
    if (adicionalFile && !validateImageFile(adicionalFile)) {
      alert('El documento adicional debe ser una imagen.');
      return;
    }
    setLoading(true);
    try {
      const normalizeDoc = (val) =>
        String(val || '')
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '');
      const inputCi = normalizeDoc(clientForm.ci_numero);
      const inputRif = normalizeDoc(clientForm.rif_numero);

      if (inputCi || inputRif) {
        const { data: allClients, error: cliCheckErr } = await supabase
          .from('clients')
          .select(
            'id, name, ci_number, rif_number, assigned_seller_id, profiles:assigned_seller_id(full_name)'
          )
          .eq('is_potential', false);
        if (cliCheckErr) throw cliCheckErr;
        const dupClient = (allClients || []).find((c) => {
          const existingCi = normalizeDoc(c.ci_number);
          const existingRif = normalizeDoc(c.rif_number);
          return (
            (inputCi && existingCi && inputCi === existingCi) ||
            (inputRif && existingRif && inputRif === existingRif)
          );
        });
        if (dupClient) {
          const sellerName =
            dupClient.profiles?.full_name || 'Sin vendedor asignado';
          alert(
            `❌ Este cliente ya existe en el sistema.\n\nNombre: ${
              dupClient.name
            }\nC.I.: ${dupClient.ci_number || 'N/A'} | RIF: ${
              dupClient.rif_number || 'N/A'
            }\nAsignado a: ${sellerName}`
          );
          setLoading(false);
          return;
        }
      }

      const ciUrl = ciFile ? await uploadFile(ciFile, 'documents', 'ci') : null;
      const rifUrl = rifFile
        ? await uploadFile(rifFile, 'documents', 'rif')
        : null;
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

    // Validación de stock
    const currentStock = Number(prod.stock_current || 0);
    if (currentStock <= 0) {
      return alert(
        `El producto "${prod.description}" no tiene stock disponible.`
      );
    }

    const inCart = neCart.find((item) => item.product_id === prod.id);
    const currentInCart = inCart ? inCart.quantity : 0;

    if (currentInCart + qty > currentStock) {
      return alert(
        `Stock insuficiente.\nDisponible: ${currentStock}\nEn carrito: ${currentInCart}\nSolicitado: ${qty}`
      );
    }

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
      // Verificar stock actual antes de crear la nota
      const cartProdIds = neCart.map((i) => i.product_id).filter(Boolean);
      if (cartProdIds.length > 0) {
        const { data: liveProds, error: liveProdErr } = await supabase
          .from('products')
          .select('id, description, stock_current')
          .in('id', cartProdIds);
        if (liveProdErr) throw liveProdErr;
        const liveMap = {};
        (liveProds || []).forEach((p) => {
          liveMap[p.id] = p;
        });
        const insufficient = [];
        for (const item of neCart) {
          const liveP = liveMap[item.product_id];
          const avail = Number(liveP?.stock_current || 0);
          const req = Number(item.quantity || 0);
          if (!liveP || avail < req) {
            insufficient.push(
              `• ${
                item.description || liveP?.description || 'Producto'
              }: Disponible ${avail}, Solicitado ${req}`
            );
          }
        }
        if (insufficient.length > 0) {
          await fetchProducts();
          alert(
            `⚠️ Inventario insuficiente en base de datos:\n\n${insufficient.join(
              '\n'
            )}\n\nPor favor modifique la cantidad o elimine el/los producto(s) del carrito.`
          );
          setLoading(false);
          return;
        }
      }

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
      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(detalles);
      if (itemsErr) throw itemsErr;

      // Descontar inmediatamente del inventario al crear la nota en estado pendiente
      if (!editModeId) {
        for (const item of neCart) {
          const { data: prodData } = await supabase
            .from('products')
            .select('stock_current')
            .eq('id', item.product_id)
            .single();
          if (prodData) {
            const newStock = Math.max(
              0,
              Number(prodData.stock_current || 0) - Number(item.quantity || 0)
            );
            await supabase
              .from('products')
              .update({ stock_current: newStock })
              .eq('id', item.product_id);
          }
        }
      }

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
          : 'Nota de Entrega enviada a revisión y artículos descontados del inventario.',
      });
      setNeCart([]);
      setNeClientId('');
      setNeCategoria('bombillos');
      setNeTipoPago('0');
      setNeObservacion('');
      setNeGpsLocation(null);
      setEditModeId(null);

      localStorage.removeItem('sales_ne_cart_cache');
      localStorage.removeItem('sales_ne_client_cache');
      localStorage.removeItem('sales_ne_category_cache');
      localStorage.removeItem('sales_ne_payment_cache');

      fetchSalesHistory();
      fetchComisionesYVales();
      fetchEstimatedFolio();
      fetchProducts();
      setNeTab('historial');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // LÓGICA DE EDICIÓN MEDIANTE MODAL CON AJUSTE DE INVENTARIO POR DIFERENCIA
  // ---------------------------------------------------------------------------
  const handleOpenEditNeModal = async (nota) => {
    try {
      setLoading(true);
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
      const origMap = {};
      mappedItems.forEach((it) => {
        origMap[it.product_id] = Number(it.quantity || 0);
      });
      setEditNeOriginalQuantities(origMap);
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

  const handleUpdateEditNeQuantity = (product_id, newQty) => {
    const qty = Number(newQty);
    if (isNaN(qty) || qty <= 0) return;
    const prod = products.find((p) => p.id === product_id);
    if (prod) {
      const origQty = Number(editNeOriginalQuantities[product_id] || 0);
      const maxAvailable = Number(prod.stock_current || 0) + origQty;
      if (qty > maxAvailable) {
        alert(
          `Stock insuficiente para "${prod.description}".\nDisponible en inventario: ${prod.stock_current}\nMáximo permitido en esta nota: ${maxAvailable}`
        );
        return;
      }
    }
    setEditNeCart(
      editNeCart.map((item) => {
        if (item.product_id === product_id) {
          return {
            ...item,
            quantity: qty,
            total_line_usd: qty * Number(item.discounted_unit_price_usd),
          };
        }
        return item;
      })
    );
  };

  const handleEditNeAddProduct = () => {
    if (!editNeSelectedProdId) return;
    const prod = products.find((p) => p.id === editNeSelectedProdId);
    if (!prod) return;
    const qty = Number(editNeQuantity);
    if (qty <= 0) return alert('La cantidad debe ser mayor a 0');

    const existingIdx = editNeCart.findIndex((i) => i.product_id === prod.id);
    const currentInCart =
      existingIdx > -1 ? Number(editNeCart[existingIdx].quantity || 0) : 0;
    const origQty = Number(editNeOriginalQuantities[prod.id] || 0);
    const maxAvailable = Number(prod.stock_current || 0) + origQty;
    if (currentInCart + qty > maxAvailable) {
      return alert(
        `Stock insuficiente para "${prod.description}".\nDisponible en inventario: ${prod.stock_current}\nEn nota actual: ${currentInCart}\nMáximo permitido: ${maxAvailable}`
      );
    }

    const descPct = getDiscountPercent(editNeForm.payment_discount);
    const vuConDesc = Number(prod.price_usd) * (1 - descPct / 100);
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

      // 1. Obtener cantidades anteriores en BD y calcular deltas de inventario
      const { data: oldItems, error: oldItemsErr } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', editNeModal.noteData.id);
      if (oldItemsErr) throw oldItemsErr;

      const oldQtyMap = {};
      (oldItems || []).forEach((it) => {
        oldQtyMap[it.product_id] =
          (oldQtyMap[it.product_id] || 0) + Number(it.quantity || 0);
      });
      const newQtyMap = {};
      editNeCart.forEach((it) => {
        newQtyMap[it.product_id] =
          (newQtyMap[it.product_id] || 0) + Number(it.quantity || 0);
      });
      const allProdIds = Array.from(
        new Set([...Object.keys(oldQtyMap), ...Object.keys(newQtyMap)])
      );

      // Validar stock disponible antes de aplicar cambios cuando aumenta la cantidad
      const stockUpdates = [];
      for (const pid of allProdIds) {
        const oldQ = oldQtyMap[pid] || 0;
        const newQ = newQtyMap[pid] || 0;
        const delta = newQ - oldQ; // > 0 si se requieren más unidades del stock
        if (delta !== 0) {
          const { data: prodData, error: prodErr } = await supabase
            .from('products')
            .select('description, stock_current')
            .eq('id', pid)
            .single();
          if (prodErr) throw prodErr;
          const currentStock = Number(prodData.stock_current || 0);
          if (delta > 0 && currentStock < delta) {
            alert(
              `Stock insuficiente para "${prodData.description}".\nDisponible en inventario: ${currentStock}\nAdicional requerido: ${delta}`
            );
            setLoading(false);
            return;
          }
          stockUpdates.push({
            product_id: pid,
            newStock: Math.max(0, currentStock - delta),
          });
        }
      }

      // 2. Actualizar cabecera de la orden y cambiar estado a pendiente
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
          status: 'pendiente',
          updated_at: new Date(),
        })
        .eq('id', editNeModal.noteData.id);

      if (updateErr) throw updateErr;

      // 3. Eliminar items antiguos e insertar nuevos
      const { error: delErr } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', editNeModal.noteData.id);

      if (delErr) throw delErr;

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

      // 4. Aplicar deltas de inventario en products
      for (const upd of stockUpdates) {
        await supabase
          .from('products')
          .update({ stock_current: upd.newStock })
          .eq('id', upd.product_id);
      }

      setMessage({
        type: 'success',
        text: 'Nota de Entrega editada, inventario actualizado y enviada a aprobación.',
      });
      setEditNeModal({ open: false, noteData: null });
      fetchSalesHistory();
      fetchComisionesYVales();
      fetchIndependentValesHistory();
      fetchProducts();
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
      // Revertir inventario al eliminar manualmente cualquier nota (pendiente, rechazada, aprobada, etc.)
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
            const restoredStock =
              Number(prodData.stock_current || 0) + Number(item.quantity || 0);
            await supabase
              .from('products')
              .update({ stock_current: restoredStock })
              .eq('id', item.product_id);
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
        text: 'Nota de Entrega eliminada y stock restaurado correctamente.',
      });
      fetchSalesHistory();
      fetchComisionesYVales();
      fetchEstimatedFolio();
      fetchProducts();
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

      const discountPct = getDiscountPercent(
        String(nota.payment_discount || '53.38')
      );

      const { data: items, error } = await supabase
        .from('order_items')
        .select('*, products(code, description)')
        .eq('order_id', nota.id);
      if (error) throw error;

      let clientAddress = 'Sin dirección';
      const clientId = nota.client_id || nota.clients_id;
      if (clientId) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('address_detail')
          .eq('id', clientId)
          .single();
        if (clientData && clientData.address_detail) {
          clientAddress = clientData.address_detail;
        }
      } else if (nota.client?.address_detail) {
        clientAddress = nota.client.address_detail;
      } else if (nota.clients?.address_detail) {
        clientAddress = nota.clients.address_detail;
      }

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

      const clientName = nota.client?.name || nota.clients?.name || 'Cliente';
      const transNo = nota.transaction_number || nota.id.substring(0, 8);
      const fecha = new Date(nota.created_at).toLocaleString();
      const vendedorName = currentSellerName;

      let subTotal = 0;
      (items || []).forEach((item) => {
        subTotal +=
          item.total_line_usd || item.quantity * item.discounted_unit_price_usd;
      });

      let rowsHtml = '';
      (items || []).forEach((item) => {
        const totalLine =
          item.total_line_usd || item.quantity * item.discounted_unit_price_usd;
        rowsHtml += `
          <tr>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; font-family: monospace; font-weight: bold; font-size: 13px;">${
              item.products?.code || 'S/C'
            }</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; font-weight: bold; font-size: 13px;">${
              item.products?.description || 'Producto'
            }</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; text-align: center; font-size: 13px;">${
              item.quantity
            }</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; text-align: right; font-size: 13px;">$${Number(
              item.unit_price_usd || 0
            ).toFixed(2)}</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; text-align: right; color: #B45309; font-size: 13px;">$${Number(
              item.discounted_unit_price_usd || 0
            ).toFixed(2)}</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 13px;">$${Number(
              totalLine
            ).toFixed(2)}</td>
          </tr>`;
      });

      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #111; padding: 0; background: #fff; width: 100%; box-sizing: border-box; margin: 0 auto;">
          
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
              <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">FENIX AUTO PART C.A</h2>
              <p style="margin: 3px 0; font-size: 13px;"><strong>RIF:</strong> J-50261925-2</p>
              <p style="margin: 6px 0 0 0; font-size: 13px;"><strong>Cliente:</strong> ${clientName}</p>
              <p style="margin: 3px 0 0 0; font-size: 13px;"><strong>Dirección:</strong> ${clientAddress}</p>
            </div>
            <div style="text-align: right; font-size: 13px;">
              <p style="margin: 3px 0;"><strong>N° Transacción:</strong> #${transNo}</p>
              <p style="margin: 3px 0;"><strong>Fecha/Hora:</strong> ${fecha}</p>
              <p style="margin: 3px 0;"><strong>Vendedor:</strong> ${vendedorName}</p>
              <p style="margin: 3px 0;"><strong>Categoría:</strong> ${
                nota.category || 'General'
              }</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: left;">Código</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: left;">Descripción</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: center;">Cantidad</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: right;">V. Unitario</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: right;">V. U. con Desc.</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: right;">Total Línea</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                '<tr><td colspan="6" style="padding: 10px; text-align: center; color: #888;">Sin artículos...</td></tr>'
              }
            </tbody>
          </table>

          <div style="width: 270px; background: #f9fafb; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; margin-left: auto; font-size: 13px; margin-bottom: 15px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Total Base:</span>
              <strong>$${Number(nota.total_base_usd || subTotal).toFixed(
                2
              )}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #D97706;">
              <span>Descuento Aplicado (${discountPct}%):</span>
              <strong>-$${Number(nota.discount_amount_usd || 0).toFixed(
                2
              )}</strong>
            </div>
            ${
              Number(nota.special_discount_usd || 0) > 0
                ? `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #B45309;">
                    <span>Descuento Especial:</span>
                    <strong>-$${Number(nota.special_discount_usd).toFixed(
                      2
                    )}</strong>
                  </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 4px; font-weight: bold; font-size: 15px; color: #DC2626;">
              <span>Precio Final:</span>
              <span>$${Number(nota.final_price_usd || subTotal).toFixed(
                2
              )}</span>
            </div>                                
          </div>

          ${
            nota.observation
              ? `
            <div style="font-size: 15px; color: #333; background: #fffbeb; border: 1px solid #fde68a; padding: 8px; border-radius: 4px; margin-bottom: 10px; text-align: justify; page-break-inside: avoid;">
              <strong>Observación:</strong> ${nota.observation}
            </div>
          `
              : ''
          }

          <div style="font-size: 17px; color: #555; background: #f3f4f6; padding: 8px; border-radius: 4px; line-height: 1.4; text-align: justify; page-break-inside: avoid;">
            <strong>Términos y condiciones:</strong> ${globalTerms}
          </div>

        </div>
      `;

      const opciones = {
        margin: [18, 10, 15, 10],
        filename: `nota-entrega-${transNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      };

      await window
        .html2pdf()
        .from(container)
        .set(opciones)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            if (i > 1) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(8.5);
              pdf.setTextColor(51, 51, 51);

              pdf.text(
                `N° Transacción: #${transNo} | Cliente: ${clientName}`,
                10,
                11
              );

              pdf.text(
                `Vendedor: ${vendedorName}`,
                pdf.internal.pageSize.getWidth() - 10,
                11,
                { align: 'right' }
              );
            }

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(102, 102, 102);
            pdf.text(
              `Página ${i} de ${totalPages}`,
              pdf.internal.pageSize.getWidth() - 10,
              pdf.internal.pageSize.getHeight() - 6,
              { align: 'right' }
            );
          }
        })
        .save();
    } catch (err) {
      alert('Error al generar PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPDF = async (nota) => {
    try {
      setLoading(true);

      const discountPct = getDiscountPercent(
        String(nota.payment_discount || '53.38')
      );

      const { data: items, error } = await supabase
        .from('order_items')
        .select('*, products(code, description)')
        .eq('order_id', nota.id);
      if (error) throw error;

      let clientAddress = 'Sin dirección';
      const clientId = nota.client_id || nota.clients_id;
      if (clientId) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('address_detail')
          .eq('id', clientId)
          .single();
        if (clientData && clientData.address_detail) {
          clientAddress = clientData.address_detail;
        }
      } else if (nota.client?.address_detail) {
        clientAddress = nota.client.address_detail;
      } else if (nota.clients?.address_detail) {
        clientAddress = nota.clients.address_detail;
      }

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

      const clientName = nota.client?.name || nota.clients?.name || 'Cliente';
      const transNo = nota.transaction_number || nota.id.substring(0, 8);
      const fecha = new Date(nota.created_at).toLocaleString();
      const vendedorName = currentSellerName;

      let subTotal = 0;
      (items || []).forEach((item) => {
        subTotal +=
          item.total_line_usd || item.quantity * item.discounted_unit_price_usd;
      });

      let rowsHtml = '';
      (items || []).forEach((item) => {
        const totalLine =
          item.total_line_usd || item.quantity * item.discounted_unit_price_usd;
        rowsHtml += `
          <tr>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; font-family: monospace; font-weight: bold; font-size: 13px;">${
              item.products?.code || 'S/C'
            }</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; font-weight: bold; font-size: 13px;">${
              item.products?.description || 'Producto'
            }</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; text-align: center; font-size: 13px;">${
              item.quantity
            }</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; text-align: right; font-size: 13px;">$${Number(
              item.unit_price_usd || 0
            ).toFixed(2)}</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; text-align: right; color: #B45309; font-size: 13px;">$${Number(
              item.discounted_unit_price_usd || 0
            ).toFixed(2)}</td>
            <td style="padding: 7px 9px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 13px;">$${Number(
              totalLine
            ).toFixed(2)}</td>
          </tr>`;
      });

      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #111; padding: 0; background: #fff; width: 100%; box-sizing: border-box; margin: 0 auto;">
          
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
              <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">FENIX AUTO PART C.A</h2>
              <p style="margin: 3px 0; font-size: 13px;"><strong>RIF:</strong> J-50261925-2</p>
              <p style="margin: 6px 0 0 0; font-size: 13px;"><strong>Cliente:</strong> ${clientName}</p>
              <p style="margin: 3px 0 0 0; font-size: 13px;"><strong>Dirección:</strong> ${clientAddress}</p>
            </div>
            <div style="text-align: right; font-size: 13px;">
              <p style="margin: 3px 0;"><strong>N° Transacción:</strong> #${transNo}</p>
              <p style="margin: 3px 0;"><strong>Fecha/Hora:</strong> ${fecha}</p>
              <p style="margin: 3px 0;"><strong>Vendedor:</strong> ${vendedorName}</p>
              <p style="margin: 3px 0;"><strong>Categoría:</strong> ${
                nota.category || 'General'
              }</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: left;">Código</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: left;">Descripción</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: center;">Cantidad</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: right;">V. Unitario</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: right;">V. U. con Desc.</th>
                <th style="padding: 7px 9px; border-bottom: 2px solid #ddd; text-align: right;">Total Línea</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                '<tr><td colspan="6" style="padding: 10px; text-align: center; color: #888;">Sin artículos...</td></tr>'
              }
            </tbody>
          </table>

          <div style="width: 270px; background: #f9fafb; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; margin-left: auto; font-size: 13px; margin-bottom: 15px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Total Base:</span>
              <strong>$${Number(nota.total_base_usd || subTotal).toFixed(
                2
              )}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #D97706;">
              <span>Descuento Aplicado (${discountPct}%):</span>
              <strong>-$${Number(nota.discount_amount_usd || 0).toFixed(
                2
              )}</strong>
            </div>
            ${
              Number(nota.special_discount_usd || 0) > 0
                ? `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #B45309;">
                    <span>Descuento Especial:</span>
                    <strong>-$${Number(nota.special_discount_usd).toFixed(
                      2
                    )}</strong>
                  </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 4px; font-weight: bold; font-size: 15px; color: #DC2626;">
              <span>Precio Final:</span>
              <span>$${Number(nota.final_price_usd || subTotal).toFixed(
                2
              )}</span>
            </div>                                
          </div>

          ${
            nota.observation
              ? `
            <div style="font-size: 15px; color: #333; background: #fffbeb; border: 1px solid #fde68a; padding: 8px; border-radius: 4px; margin-bottom: 10px; text-align: justify; page-break-inside: avoid;">
              <strong>Observación:</strong> ${nota.observation}
            </div>
          `
              : ''
          }

          <div style="font-size: 17px; color: #555; background: #f3f4f6; padding: 8px; border-radius: 4px; line-height: 1.4; text-align: justify; page-break-inside: avoid;">
            <strong>Términos y condiciones:</strong> ${globalTerms}
          </div>

        </div>
      `;

      const opciones = {
        margin: [18, 10, 15, 10],
        filename: `Nota-${transNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      };

      const pdfBlob = await window
        .html2pdf()
        .from(container)
        .set(opciones)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            if (i > 1) {
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(8.5);
              pdf.setTextColor(51, 51, 51);

              pdf.text(
                `N° Transacción: #${transNo} | Cliente: ${clientName}`,
                10,
                11
              );

              pdf.text(
                `Vendedor: ${vendedorName}`,
                pdf.internal.pageSize.getWidth() - 10,
                11,
                { align: 'right' }
              );
            }

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(102, 102, 102);
            pdf.text(
              `Página ${i} de ${totalPages}`,
              pdf.internal.pageSize.getWidth() - 10,
              pdf.internal.pageSize.getHeight() - 6,
              { align: 'right' }
            );
          }
        })
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
          .set({ ...opciones, output: 'save' })
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

  // Lógica de Vale Independiente
  const handleSolicitarValeIndependiente = async (e) => {
    e.preventDefault();

    if (!independentValeForm.monto || Number(independentValeForm.monto) <= 0) {
      return alert('Ingrese un monto válido');
    }

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

      setIndependentValeForm({ monto: '', motivo: '' });
      fetchComisionesYVales();
      fetchIndependentValesHistory();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarVale = async () => {
    if (!valeModal.monto || Number(valeModal.monto) <= 0)
      return alert('Ingrese un monto válido');

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

  const computeAbonoNotePreview = (nota, discountKey) => {
    const pct = getDiscountPercent(discountKey);
    const baseTotal = Number(nota?.total_base_usd || 0);
    const specialDisc = Number(nota?.special_discount_usd || 0);
    const newFinal =
      baseTotal > 0
        ? Math.max(
            0,
            Number((baseTotal * (1 - pct / 100) - specialDisc).toFixed(2))
          )
        : Number(nota?.final_price_usd || 0);
    const paid = Number(nota?.total_paid_usd || 0);
    const newDebt = Math.max(0, Number((newFinal - paid).toFixed(2)));
    return { pct, baseTotal, specialDisc, newFinal, paid, newDebt };
  };

  const getPendingOrderIdsSet = () => {
    const ids = new Set();
    pendingPaymentNotifications.forEach((notif) => {
      if (notif.order_id) ids.add(notif.order_id);
      if (Array.isArray(notif.notes_breakdown)) {
        notif.notes_breakdown.forEach((item) => {
          if (item?.order_id) ids.add(item.order_id);
        });
      }
    });
    return ids;
  };

  const clientHasPendingAbono = (clientId) => {
    if (!clientId) return false;
    const clientOrderIds = new Set(
      salesHistory.filter((n) => n.client_id === clientId).map((n) => n.id)
    );
    return pendingPaymentNotifications.some((notif) => {
      if (notif.client_id === clientId) return true;
      if (notif.order_id && clientOrderIds.has(notif.order_id)) return true;
      if (Array.isArray(notif.notes_breakdown)) {
        return notif.notes_breakdown.some(
          (item) => item?.order_id && clientOrderIds.has(item.order_id)
        );
      }
      return false;
    });
  };

  const getAvailableClientCredit = (client) => {
    if (!client) return 0;
    if (clientHasPendingAbono(client.id)) return 0;
    return Number(Number(client.credit_balance_usd || 0).toFixed(2));
  };

  const getClientOpenNotes = (clientId) => {
    if (!clientId) return [];
    const pendingIds = getPendingOrderIdsSet();
    return salesHistory.filter(
      (n) =>
        n.client_id === clientId &&
        n.payment_status !== 'cerrada' &&
        n.status !== 'rechazada' &&
        Number(n.balance_due_usd || 0) > 0.009 &&
        !pendingIds.has(n.id)
    );
  };

  const handleSelectAbonoClient = (client) => {
    setAbonoSelectedClient(client);
    setAbonoStep(1);
    setAbonoHighAmountModal(false);
    const openNotes = getClientOpenNotes(client.id);
    const initialSelections = {};
    openNotes.forEach((n) => {
      initialSelections[n.id] = {
        selected: false,
        proposed_payment_discount: String(n.payment_discount || '53.38'),
        pay_full_debt: false,
        applied_amount_usd: '',
        use_commission_discount: false,
        commission_discount_usd: '',
      };
    });
    setAbonoNoteSelections(initialSelections);
  };

  const handleResetAbonoFlow = () => {
    setAbonoSelectedClient(null);
    setAbonoStep(1);
    setAbonoHighAmountModal(false);
    setAbonoForm({
      payment_date: '',
      amount_usd: '',
      exchange_rate: '',
      amount_bs: '',
      origin_bank: '',
      destination_bank: '',
      payment_method: '',
      reference_number: '',
      user_note: '',
    });
    setAbonoFile(null);
    setAbonoNoteSelections({});
  };

  const validateAbonoStep1 = () => {
    const metodo = String(abonoForm.payment_method || '').trim();
    const isEfectivo = metodo === 'Efectivo $';
    const isZelle = metodo === 'Zelle';
    const refNum = String(abonoForm.reference_number || '').trim();
    const montoCheck = parseFloat(abonoForm.amount_usd);

    if (!abonoSelectedClient) {
      alert('Debe seleccionar un cliente.');
      return false;
    }
    if (!abonoForm.payment_date) {
      alert('La fecha del pago es obligatoria.');
      return false;
    }
    if (!metodo) {
      alert('Debe seleccionar un método de recepción.');
      return false;
    }
    const isBsMethod = metodo === 'Pago Móvil' || metodo === 'Transferencia Bs';
    if (isBsMethod) {
      const tasaCheck = parseFloat(abonoForm.exchange_rate);
      const bsCheck = parseFloat(abonoForm.amount_bs);
      if (isNaN(tasaCheck) || tasaCheck <= 0) {
        alert('Debe ingresar una tasa válida mayor a 0.');
        return false;
      }
      if (isNaN(bsCheck) || bsCheck <= 0) {
        alert('Debe ingresar el monto en bolívares (Bs) mayor a 0.');
        return false;
      }
      if (!abonoForm.origin_bank) {
        alert('Debe seleccionar la Cuenta Origen (Banco).');
        return false;
      }
      if (!abonoForm.destination_bank) {
        alert('Debe seleccionar la Cuenta Destino (Banco).');
        return false;
      }
    }
    if (isNaN(montoCheck) || montoCheck <= 0) {
      alert('Ingrese un monto válido en dólares.');
      return false;
    }
    if (!isEfectivo) {
      if (isZelle) {
        if (!/^[a-zA-Z0-9]{4}$/.test(refNum)) {
          alert(
            'Para Zelle debe ingresar exactamente los últimos 4 caracteres alfanuméricos del número de confirmación.'
          );
          return false;
        }
      } else if (!/^\d{4}$/.test(refNum)) {
        alert(
          'Debe ingresar exactamente los últimos 4 dígitos numéricos de la referencia.'
        );
        return false;
      }
    }
    if (!abonoFile) {
      alert(
        isEfectivo
          ? 'Es obligatorio adjuntar una foto de los billetes.'
          : 'Es obligatorio adjuntar el comprobante de pago.'
      );
      return false;
    }
    if (!validateImageFile(abonoFile)) {
      alert('El comprobante debe ser una imagen.');
      return false;
    }
    return true;
  };

  const handleAbonoNextStep = (e) => {
    e.preventDefault();
    if (!validateAbonoStep1()) return;
    const montoNum = parseFloat(abonoForm.amount_usd);
    if (montoNum > 1000) {
      setAbonoHighAmountModal(true);
      return;
    }
    setAbonoStep(2);
  };

  const getAbonoTotalsSummary = () => {
    const saldoAnterior = getAvailableClientCredit(abonoSelectedClient);
    const abonoActual = Number(
      (parseFloat(abonoForm.amount_usd) || 0).toFixed(2)
    );
    const totalDisponible = Number((saldoAnterior + abonoActual).toFixed(2));
    const openNotes = getClientOpenNotes(abonoSelectedClient?.id);
    let totalAsignado = 0;
    openNotes.forEach((n) => {
      const sel = abonoNoteSelections[n.id];
      if (sel?.selected) {
        totalAsignado += Number(parseFloat(sel.applied_amount_usd) || 0);
      }
    });
    totalAsignado = Number(totalAsignado.toFixed(2));
    const saldoDisponible = Math.max(
      0,
      Number((totalDisponible - totalAsignado).toFixed(2))
    );
    return {
      saldoAnterior,
      abonoActual,
      totalAbono: abonoActual,
      totalDisponible,
      totalAsignado,
      saldoDisponible,
    };
  };

  const handleToggleAbonoNote = (nota) => {
    setAbonoNoteSelections((prev) => {
      const current = prev[nota.id] || {
        selected: false,
        proposed_payment_discount: String(nota.payment_discount || '53.38'),
        pay_full_debt: false,
        applied_amount_usd: '',
      };
      const nextSelected = !current.selected;
      return {
        ...prev,
        [nota.id]: {
          ...current,
          selected: nextSelected,
          pay_full_debt: nextSelected ? current.pay_full_debt : false,
          applied_amount_usd: nextSelected ? current.applied_amount_usd : '',
        },
      };
    });
  };

  const handleChangeAbonoNoteDiscount = (nota, newDiscountKey) => {
    setAbonoNoteSelections((prev) => {
      const current = prev[nota.id] || {
        selected: true,
        proposed_payment_discount: String(nota.payment_discount || '53.38'),
        pay_full_debt: false,
        applied_amount_usd: '',
      };
      const { newDebt } = computeAbonoNotePreview(nota, newDiscountKey);
      const totalAbono = Number(
        (
          getAvailableClientCredit(abonoSelectedClient) +
          (parseFloat(abonoForm.amount_usd) || 0)
        ).toFixed(2)
      );
      let otherAssigned = 0;
      Object.entries(prev).forEach(([id, item]) => {
        if (id !== nota.id && item?.selected) {
          otherAssigned += Number(parseFloat(item.applied_amount_usd) || 0);
        }
      });
      const maxAvailable = Math.max(
        0,
        Number((totalAbono - otherAssigned).toFixed(2))
      );
      let nextApplied = current.applied_amount_usd;
      if (current.selected && current.pay_full_debt) {
        const capped = Math.min(newDebt, maxAvailable);
        nextApplied = capped > 0 ? capped.toFixed(2) : '';
      } else if (current.selected && nextApplied !== '') {
        const numVal = parseFloat(nextApplied) || 0;
        const capped = Math.min(numVal, newDebt, maxAvailable);
        nextApplied = capped > 0 ? capped.toFixed(2) : '';
      }
      const nextCash = Number(parseFloat(nextApplied) || 0);
      const nextComm = current.use_commission_discount
        ? Math.max(0, Number((newDebt - nextCash).toFixed(2))).toFixed(2)
        : current.commission_discount_usd;
      return {
        ...prev,
        [nota.id]: {
          ...current,
          proposed_payment_discount: newDiscountKey,
          applied_amount_usd: nextApplied,
          commission_discount_usd: nextComm,
        },
      };
    });
  };

  const handleTogglePayFullDebt = (nota) => {
    setAbonoNoteSelections((prev) => {
      const current = prev[nota.id] || {
        selected: true,
        proposed_payment_discount: String(nota.payment_discount || '53.38'),
        pay_full_debt: false,
        applied_amount_usd: '',
      };
      const nextFull = !current.pay_full_debt;
      if (!nextFull) {
        return {
          ...prev,
          [nota.id]: {
            ...current,
            selected: true,
            pay_full_debt: false,
            applied_amount_usd: '',
          },
        };
      }
      const { newDebt } = computeAbonoNotePreview(
        nota,
        current.proposed_payment_discount
      );
      const totalAbono = Number(
        (
          getAvailableClientCredit(abonoSelectedClient) +
          (parseFloat(abonoForm.amount_usd) || 0)
        ).toFixed(2)
      );
      let otherAssigned = 0;
      Object.entries(prev).forEach(([id, item]) => {
        if (id !== nota.id && item?.selected) {
          otherAssigned += Number(parseFloat(item.applied_amount_usd) || 0);
        }
      });
      const maxAvailable = Math.max(
        0,
        Number((totalAbono - otherAssigned).toFixed(2))
      );
      if (maxAvailable <= 0) {
        alert('No queda saldo disponible del abono para asignar a esta nota.');
        return prev;
      }
      const amountToAssign = Math.min(newDebt, maxAvailable);
      const nextComm = current.use_commission_discount
        ? Math.max(0, Number((newDebt - amountToAssign).toFixed(2))).toFixed(2)
        : current.commission_discount_usd;
      return {
        ...prev,
        [nota.id]: {
          ...current,
          selected: true,
          pay_full_debt: amountToAssign >= newDebt - 0.009,
          applied_amount_usd: amountToAssign.toFixed(2),
          commission_discount_usd: nextComm,
        },
      };
    });
  };

  const handleChangeAbonoNoteAmount = (nota, rawVal) => {
    setAbonoNoteSelections((prev) => {
      const current = prev[nota.id] || {
        selected: true,
        proposed_payment_discount: String(nota.payment_discount || '53.38'),
        pay_full_debt: false,
        applied_amount_usd: '',
      };
      if (rawVal === '') {
        const { newDebt: emptyDebt } = computeAbonoNotePreview(
          nota,
          current.proposed_payment_discount
        );
        return {
          ...prev,
          [nota.id]: {
            ...current,
            selected: true,
            pay_full_debt: false,
            applied_amount_usd: '',
            commission_discount_usd: current.use_commission_discount
              ? emptyDebt.toFixed(2)
              : current.commission_discount_usd,
          },
        };
      }
      const numVal = parseFloat(rawVal);
      if (isNaN(numVal) || numVal < 0) return prev;
      const { newDebt } = computeAbonoNotePreview(
        nota,
        current.proposed_payment_discount
      );
      const totalAbono = Number(
        (
          getAvailableClientCredit(abonoSelectedClient) +
          (parseFloat(abonoForm.amount_usd) || 0)
        ).toFixed(2)
      );
      let otherAssigned = 0;
      Object.entries(prev).forEach(([id, item]) => {
        if (id !== nota.id && item?.selected) {
          otherAssigned += Number(parseFloat(item.applied_amount_usd) || 0);
        }
      });
      const maxAvailable = Math.max(
        0,
        Number((totalAbono - otherAssigned).toFixed(2))
      );
      const maxAllowed = Math.min(newDebt, maxAvailable);
      const finalVal = numVal > maxAllowed ? maxAllowed.toFixed(2) : rawVal;
      const numericFinal = parseFloat(finalVal) || 0;
      const nextComm = current.use_commission_discount
        ? Math.max(0, Number((newDebt - numericFinal).toFixed(2))).toFixed(2)
        : current.commission_discount_usd;
      return {
        ...prev,
        [nota.id]: {
          ...current,
          selected: true,
          pay_full_debt: numericFinal >= newDebt - 0.009 && newDebt > 0,
          applied_amount_usd: finalVal,
          commission_discount_usd: nextComm,
        },
      };
    });
  };

  const handleToggleCommissionDiscount = (nota) => {
    setAbonoNoteSelections((prev) => {
      const current = prev[nota.id] || {
        selected: true,
        proposed_payment_discount: String(nota.payment_discount || '53.38'),
        pay_full_debt: false,
        applied_amount_usd: '',
        use_commission_discount: false,
        commission_discount_usd: '',
      };
      const nextUse = !current.use_commission_discount;
      if (!nextUse) {
        return {
          ...prev,
          [nota.id]: {
            ...current,
            use_commission_discount: false,
            commission_discount_usd: '',
          },
        };
      }
      const preview = computeAbonoNotePreview(
        nota,
        current.proposed_payment_discount
      );
      const appliedCash = Number(parseFloat(current.applied_amount_usd) || 0);
      const missing = Math.max(
        0,
        Number((preview.newDebt - appliedCash).toFixed(2))
      );
      return {
        ...prev,
        [nota.id]: {
          ...current,
          selected: true,
          use_commission_discount: true,
          commission_discount_usd: missing > 0 ? missing.toFixed(2) : '0.00',
        },
      };
    });
  };

  const handleChangeCommissionDiscountAmount = (nota, rawVal) => {
    setAbonoNoteSelections((prev) => {
      const current = prev[nota.id] || {
        selected: true,
        proposed_payment_discount: String(nota.payment_discount || '53.38'),
        pay_full_debt: false,
        applied_amount_usd: '',
        use_commission_discount: true,
        commission_discount_usd: '',
      };
      if (rawVal === '') {
        return {
          ...prev,
          [nota.id]: {
            ...current,
            selected: true,
            use_commission_discount: true,
            commission_discount_usd: '',
          },
        };
      }
      const numVal = parseFloat(rawVal);
      if (isNaN(numVal) || numVal < 0) return prev;
      const preview = computeAbonoNotePreview(
        nota,
        current.proposed_payment_discount
      );
      const appliedCash = Number(parseFloat(current.applied_amount_usd) || 0);
      const maxMissing = Math.max(
        0,
        Number((preview.newDebt - appliedCash).toFixed(2))
      );
      const finalVal = numVal > maxMissing ? maxMissing.toFixed(2) : rawVal;
      return {
        ...prev,
        [nota.id]: {
          ...current,
          selected: true,
          use_commission_discount: true,
          commission_discount_usd: finalVal,
        },
      };
    });
  };

  const handleEnviarNotificacionAbono = async (e) => {
    e.preventDefault();
    if (abonoSubmittingRef.current || notifLocked) return;
    if (!validateAbonoStep1()) return;

    const openNotes = getClientOpenNotes(abonoSelectedClient?.id);
    const {
      saldoAnterior,
      abonoActual,
      totalDisponible,
      totalAsignado,
      saldoDisponible,
    } = getAbonoTotalsSummary();

    const selectedBreakdown = [];
    for (const nota of openNotes) {
      const sel = abonoNoteSelections[nota.id];
      if (!sel?.selected) continue;
      const applied = Number(
        (parseFloat(sel.applied_amount_usd) || 0).toFixed(2)
      );
      const commDiscount = sel.use_commission_discount
        ? Number((parseFloat(sel.commission_discount_usd) || 0).toFixed(2))
        : 0;
      if (applied + commDiscount <= 0) {
        alert(
          `La N.E. #${nota.transaction_number} está seleccionada pero tiene monto $0.00. Ingrese un monto o deselecciónela.`
        );
        return;
      }
      const preview = computeAbonoNotePreview(
        nota,
        sel.proposed_payment_discount
      );
      if (applied + commDiscount > preview.newDebt + 0.01) {
        alert(
          `La suma de abono + descuento de comisión para la N.E. #${
            nota.transaction_number
          } ($${(applied + commDiscount).toFixed(
            2
          )}) supera su deuda actual ($${preview.newDebt.toFixed(2)}).`
        );
        return;
      }
      selectedBreakdown.push({
        order_id: nota.id,
        transaction_number: nota.transaction_number,
        total_base_usd: preview.baseTotal,
        original_payment_discount: String(nota.payment_discount || '53.38'),
        proposed_payment_discount: String(
          sel.proposed_payment_discount || nota.payment_discount || '53.38'
        ),
        previous_special_discount_usd: preview.specialDisc,
        previous_final_price_usd: Number(nota.final_price_usd || 0),
        proposed_final_price_usd: preview.newFinal,
        previous_total_paid_usd: preview.paid,
        previous_balance_due_usd: Number(nota.balance_due_usd || 0),
        applied_amount_usd: applied,
        use_commission_discount: Boolean(
          sel.use_commission_discount && commDiscount > 0
        ),
        commission_discount_usd: commDiscount,
        pay_full_debt: Boolean(sel.pay_full_debt),
        projected_balance_due_usd: Math.max(
          0,
          Number((preview.newDebt - applied - commDiscount).toFixed(2))
        ),
      });
    }

    if (selectedBreakdown.length === 0) {
      alert(
        'Debe seleccionar al menos una Nota de Entrega y asignar un monto a abonar.'
      );
      return;
    }
    if (totalAsignado > totalDisponible + 0.01) {
      alert(
        'El total asignado a las notas no puede superar el saldo disponible (saldo anterior + abono actual).'
      );
      return;
    }

    const hasUnpaidOpenNotes = openNotes.some((nota) => {
      const sel = abonoNoteSelections[nota.id];
      const preview = computeAbonoNotePreview(
        nota,
        sel?.proposed_payment_discount || nota.payment_discount || '53.38'
      );
      const applied = sel?.selected
        ? Number(parseFloat(sel.applied_amount_usd) || 0)
        : 0;
      const comm =
        sel?.selected && sel?.use_commission_discount
          ? Number(parseFloat(sel.commission_discount_usd) || 0)
          : 0;
      return preview.newDebt - applied - comm > 0.009;
    });

    if (saldoDisponible > 0.009 && hasUnpaidOpenNotes) {
      alert(
        `Aún queda un saldo disponible de $${saldoDisponible.toFixed(
          2
        )} por asignar y quedan notas pendientes con deuda. Por favor asigne ese saldo a las notas que faltan antes de enviar.`
      );
      return;
    }

    abonoSubmittingRef.current = true;
    setNotifLocked(true);
    setLoading(true);
    try {
      const receiptUrl = await uploadFile(abonoFile, 'visits', 'abonos');
      const { error: notifErr } = await supabase
        .from('seller_payment_notifications')
        .insert([
          {
            order_id:
              selectedBreakdown.length === 1
                ? selectedBreakdown[0].order_id
                : null,
            client_id: abonoSelectedClient.id,
            client_name: abonoSelectedClient.name,
            seller_id: user?.id,
            payment_date: abonoForm.payment_date,
            amount_usd: abonoActual,
            exchange_rate:
              abonoForm.payment_method === 'Pago Móvil' ||
              abonoForm.payment_method === 'Transferencia Bs'
                ? Number(parseFloat(abonoForm.exchange_rate) || 0)
                : null,
            amount_bs:
              abonoForm.payment_method === 'Pago Móvil' ||
              abonoForm.payment_method === 'Transferencia Bs'
                ? Number(parseFloat(abonoForm.amount_bs) || 0)
                : null,
            origin_bank:
              abonoForm.payment_method === 'Pago Móvil' ||
              abonoForm.payment_method === 'Transferencia Bs'
                ? abonoForm.origin_bank || null
                : null,
            destination_bank:
              abonoForm.payment_method === 'Pago Móvil' ||
              abonoForm.payment_method === 'Transferencia Bs'
                ? abonoForm.destination_bank || null
                : null,
            previous_client_credit_usd: saldoAnterior,
            total_assigned_usd: totalAsignado,
            remaining_credit_to_store_usd: saldoDisponible,
            payment_method: abonoForm.payment_method,
            reference_number: abonoForm.reference_number,
            user_note: abonoForm.user_note,
            receipt_image_url: receiptUrl,
            notes_breakdown: selectedBreakdown,
            status: 'pending',
          },
        ]);
      if (notifErr) throw notifErr;

      try {
        const foliosText = selectedBreakdown
          .map((b) => b.transaction_number || b.order_id.substring(0, 6))
          .join(', ');
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'abono_registered',
            payload: {
              nroTransaccion: foliosText,
              vendedorEmail: user?.email,
              vendedorNombre: currentSellerName,
              clienteNombre: abonoSelectedClient.name || 'Cliente',
              montoAbonado: abonoActual.toFixed(2),
              saldoAnterior: saldoAnterior.toFixed(2),
              saldoRestanteAlmacenado: saldoDisponible.toFixed(2),
              notasDetalle: selectedBreakdown,
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
      handleResetAbonoFlow();
      setAbonoClientSearch('');
      fetchPaymentNotifications();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Error al registrar la notificación de abono.',
      });
    } finally {
      abonoSubmittingRef.current = false;
      setNotifLocked(false);
      setLoading(false);
    }
  };

  const selectedClientData = clients.find((c) => c.id === neClientId);

  const CustomFileInput = ({
    id,
    onChange,
    file,
    labelText = 'Adjuntar archivo',
  }) => {
    const handleSafeFileSelect = async (e) => {
      const selected = e.target.files && e.target.files[0];
      if (!selected) {
        onChange(e);
        return;
      }
      try {
        // Leer los bytes inmediatamente al seleccionar para evitar pérdida de permisos en Android/iOS
        const buffer = await selected.arrayBuffer();
        const ext = (selected.name.split('.').pop() || 'jpg').toLowerCase();
        const mime = selected.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        const safeFile = new File([buffer], selected.name, {
          type: mime,
          lastModified: selected.lastModified || Date.now(),
        });
        onChange({ target: { files: [safeFile] } });
      } catch (readErr) {
        console.warn('Error leyendo archivo en selección:', readErr);
        alert(
          'No se pudo leer la imagen desde el dispositivo. Por favor intente seleccionarla nuevamente.'
        );
      }
    };

    return (
      <div>
        <input
          type="file"
          id={id}
          accept="image/*"
          onChange={handleSafeFileSelect}
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
  };

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

  // FUNCIÓN AUXILIAR PARA RENDERIZAR TARJETAS DE PRODUCTOS EN MÓVIL
  const renderProductCards = (items, isEditable, onRemove, onQtyChange) => {
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
            <span style={{ color: '#6b7280' }}>Cant: </span>
            {isEditable && onQtyChange ? (
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onQtyChange(item.product_id, e.target.value)}
                style={{
                  width: '55px',
                  padding: '2px 4px',
                  textAlign: 'center',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontWeight: '700',
                }}
              />
            ) : (
              <strong>{item.quantity}</strong>
            )}
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
      <style>{`
  /* --- CORRECCIÓN DE VISIBILIDAD RESPONSIVA ESTRICTA --- */
  @media (max-width: 768px) {
    .desktop-tabs { display: none !important; }
    .mobile-menu-container { display: block !important; }
    .desktop-table-container { display: none !important; }
    .desktop-table { display: none !important; }
    .desktop-cards-grid { display: none !important; }
    .mobile-cards-container { display: flex !important; flex-direction: column; gap: 12px !important; }
    .action-buttons-wrapper { display: flex !important; flex-wrap: nowrap !important; justify-content: stretch !important; align-items: stretch !important; gap: 4px !important; margin-top: 6px !important; padding-top: 8px !important; border-top: 1px solid #E5E7EB !important; }
    .action-buttons-wrapper button { display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 8px 4px !important; font-size: 9px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; border-radius: 6px !important; line-height: 1.2 !important; height: auto !important; box-sizing: border-box !important; min-height: 36px !important; width: auto !important; margin-top: 0 !important; }
    .action-buttons-wrapper button:not(:last-child) { flex: 1 !important; min-width: 0 !important; }
  }
  @media (min-width: 769px) {
    .desktop-tabs { display: flex !important; }
    .mobile-menu-container { display: none !important; }
    .desktop-table-container { display: block !important; }
    .desktop-table { display: block !important; }
    .desktop-cards-grid { display: grid !important; }
    .mobile-cards-container { display: none !important; } 
  }
`}</style>
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
                      Número de C.I.
                    </label>
                    <input
                      type="text"
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
                      Adjuntar Foto C.I.
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
                      Número de RIF
                    </label>
                    <input
                      type="text"
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
                      Adjuntar Foto RIF
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
                    Teléfono
                  </label>
                  <input
                    type="text"
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
                              minWidth: '0',
                              width: '100%',
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
                              minWidth: '0',
                              width: '100%',
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
                        </div>
                      </div>
                    ))
                )}
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
                              minWidth: '0',
                              width: '100%',
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
                              minWidth: '0',
                              width: '100%',
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
                  download
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#2563EB',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#EFF6FF',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #BFDBFE',
                  }}
                >
                  <Download style={{ width: '14px', height: '14px' }} />{' '}
                  Descargar
                </a>

                {!imageModal.isReadOnlyProduct && (
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
                    <Upload style={{ width: '14px', height: '14px' }} />{' '}
                    Sustituir
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
                )}

                <button
                  onClick={() =>
                    setImageModal({
                      open: false,
                      url: '',
                      title: '',
                      clientId: null,
                      fieldName: null,
                      isReadOnlyProduct: false,
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
                    C.I. Número
                  </label>
                  <input
                    type="text"
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
                    RIF Número
                  </label>
                  <input
                    type="text"
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
                  Teléfono
                </label>
                <input
                  type="text"
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
                      Teléfono
                    </label>
                    <input
                      type="text"
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
                            minWidth: '0',
                            width: '100%',
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
                      </div>
                    </div>
                  ))}
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
                            minWidth: '0',
                            width: '100%',
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
                    C.I. Número
                  </label>
                  <input
                    type="text"
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
                    Foto C.I.
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
                    RIF Número
                  </label>
                  <input
                    type="text"
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
                    Foto RIF
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
                  Teléfono
                </label>
                <input
                  type="text"
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

            <button
              onClick={() => setNeTab('abonos')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: neTab === 'abonos' ? '#0284C7' : '#FFFFFF',
                color: neTab === 'abonos' ? '#FFFFFF' : '#0284C7',
                cursor: 'pointer',
              }}
            >
              Abonos
            </button>

            <button
              onClick={() => {
                setNeTab('historial_abonos');
                fetchSellerAbonosHistory();
                fetchPaymentNotifications();
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor:
                  neTab === 'historial_abonos' ? '#0F766E' : '#FFFFFF',
                color: neTab === 'historial_abonos' ? '#FFFFFF' : '#0F766E',
                cursor: 'pointer',
              }}
            >
              Historial de Abonos
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

              {/* Sección de Selección de Producto con Imagen Arriba y Descripción */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  Agregar Productos
                </h3>

                {/* Selector desplegable arriba */}
                <div style={{ width: '100%' }}>
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
                        image_url: p.image_url,
                      };
                    })}
                    value={neSelectedProdId}
                    onChange={setNeSelectedProdId}
                    placeholder="-- Seleccionar producto --"
                    imageKey="image_url"
                    onClear={() => setNeSelectedProdId('')}
                  />
                </div>

                {/* Visualización de la imagen y breve descripción debajo del selector */}
                {neSelectedProdId &&
                  (() => {
                    const selectedProd = products.find(
                      (p) => p.id === neSelectedProdId
                    );
                    if (!selectedProd) return null;
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {selectedProd.image_url ? (
                          <img
                            src={selectedProd.image_url}
                            alt="Producto"
                            title="Haz clic para ver imagen en grande"
                            onClick={() =>
                              setImageModal({
                                open: true,
                                url: selectedProd.image_url,
                                title: `Imagen de ${selectedProd.description}`,
                                clientId: null,
                                fieldName: null,
                                isReadOnlyProduct: true,
                              })
                            }
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '60px',
                              height: '60px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: '#64748b',
                              flexShrink: 0,
                            }}
                          >
                            Sin Foto
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: '0' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#1e293b',
                              marginBottom: '2px',
                            }}
                          >
                            {selectedProd.code} - {selectedProd.description}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Stock disponible:{' '}
                            <strong style={{ color: '#0f172a' }}>
                              {selectedProd.stock_current} un.
                            </strong>{' '}
                            | Precio Base:{' '}
                            <strong style={{ color: '#059669' }}>
                              ${Number(selectedProd.price_usd).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* Controles de cantidad y botón de agregar */}
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ width: '120px' }}>
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
                    Agregar al Carrito
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

                {/* Tabla de Productos para Escritorio */}
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
                      <span>{porcentajeDescuento}% de descuento aplicado:</span>
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

          {/* Pestaña Solicitar Vale Independiente */}
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
                      const pendingNotif = paymentNotificationsMap[nota.id];
                      const hasPendingNotif =
                        pendingNotif && pendingNotif.status === 'pending';

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
                                    : nota.status === 'rechazada'
                                    ? '#FEE2E2'
                                    : '#FEF3C7',
                                  color: isAprobada
                                    ? '#15803D'
                                    : nota.status === 'rechazada'
                                    ? '#DC2626'
                                    : '#B45309',
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
                            {!isAprobada && (
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
                                <Edit
                                  style={{ width: '13px', height: '13px' }}
                                />{' '}
                                Editar
                              </button>
                            )}
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
                            {!isAprobada && (
                              <button
                                disabled={totalAbonado > 0}
                                onClick={() => handleDeleteNE(nota)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#FEF2F2',
                                  color:
                                    totalAbonado > 0 ? '#9CA3AF' : '#DC2626',
                                  border: '1px solid #FECACA',
                                  borderRadius: '6px',
                                  cursor:
                                    totalAbonado > 0
                                      ? 'not-allowed'
                                      : 'pointer',
                                }}
                              >
                                <Trash2
                                  style={{ width: '14px', height: '14px' }}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
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
                      const pendingNotif = paymentNotificationsMap[nota.id];
                      const hasPendingNotif =
                        pendingNotif && pendingNotif.status === 'pending';

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
                                    : nota.status === 'rechazada'
                                    ? '#FEE2E2'
                                    : '#FEF3C7',
                                  color: isAprobada
                                    ? '#15803D'
                                    : nota.status === 'rechazada'
                                    ? '#DC2626'
                                    : '#B45309',
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
                            {!isAprobada && (
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
                                <Edit
                                  style={{ width: '13px', height: '13px' }}
                                />{' '}
                                Editar
                              </button>
                            )}
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
                            {!isAprobada && (
                              <button
                                disabled={totalAbonado > 0}
                                onClick={() => handleDeleteNE(nota)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#FEF2F2',
                                  color:
                                    totalAbonado > 0 ? '#9CA3AF' : '#DC2626',
                                  border: '1px solid #FECACA',
                                  borderRadius: '6px',
                                  cursor:
                                    totalAbonado > 0
                                      ? 'not-allowed'
                                      : 'pointer',
                                }}
                              >
                                <Trash2
                                  style={{ width: '14px', height: '14px' }}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {neTab === 'abonos' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  borderBottom: '1px solid #E5E7EB',
                  paddingBottom: '10px',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '900',
                      color: '#111827',
                      margin: 0,
                    }}
                  >
                    Registro de Abonos por Cliente
                  </h3>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Busque al cliente, registre el pago en dólares ($) y
                    distribúyalo entre sus Notas de Entrega abiertas.
                  </p>
                </div>
                {abonoSelectedClient && (
                  <button
                    type="button"
                    onClick={handleResetAbonoFlow}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Cambiar Cliente
                  </button>
                )}
              </div>

              {!abonoSelectedClient ? (
                <div
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
                        color: '#374151',
                        marginBottom: '6px',
                      }}
                    >
                      Buscar Cliente (por nombre, RIF, teléfono, ciudad o
                      dirección)
                    </label>
                    <input
                      type="text"
                      value={abonoClientSearch}
                      onChange={(e) => setAbonoClientSearch(e.target.value)}
                      placeholder="Escriba cualquier coincidencia para buscar..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {(() => {
                    const tokens = abonoClientSearch
                      .trim()
                      .toLowerCase()
                      .split(/\s+/)
                      .filter(Boolean);
                    const matchedClients = clients.filter((c) => {
                      if (tokens.length === 0) return true;
                      const haystack = [
                        c.name,
                        c.rif,
                        c.phone,
                        c.city,
                        c.address,
                        c.email,
                      ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();
                      return tokens.every((t) => haystack.includes(t));
                    });

                    if (matchedClients.length === 0) {
                      return (
                        <div
                          style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#6B7280',
                            fontSize: '13px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '8px',
                            border: '1px dashed #D1D5DB',
                          }}
                        >
                          No se encontraron clientes que coincidan con "
                          {abonoClientSearch}".
                        </div>
                      );
                    }

                    return (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fill, minmax(260px, 1fr))',
                          gap: '10px',
                          maxHeight: '420px',
                          overflowY: 'auto',
                          paddingRight: '2px',
                        }}
                      >
                        {matchedClients.map((client) => {
                          const openNotes = getClientOpenNotes(client.id);
                          const totalDebt = openNotes.reduce(
                            (acc, n) => acc + Number(n.balance_due_usd || 0),
                            0
                          );
                          return (
                            <div
                              key={client.id}
                              onClick={() => handleSelectAbonoClient(client)}
                              style={{
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '12px',
                                backgroundColor: '#F9FAFB',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: '800',
                                  color: '#111827',
                                }}
                              >
                                {client.name}
                              </div>
                              <div
                                style={{ fontSize: '11px', color: '#6B7280' }}
                              >
                                RIF/C.I.: {client.rif || 'N/A'} | Telf:{' '}
                                {client.phone || 'N/A'}
                              </div>
                              {client.city && (
                                <div
                                  style={{ fontSize: '11px', color: '#6B7280' }}
                                >
                                  {client.city}
                                </div>
                              )}
                              <div
                                style={{
                                  marginTop: '6px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                }}
                              >
                                <span
                                  style={{
                                    color:
                                      openNotes.length > 0
                                        ? '#0284C7'
                                        : '#6B7280',
                                  }}
                                >
                                  {openNotes.length} N.E. abierta(s)
                                </span>
                                <span
                                  style={{
                                    color:
                                      totalDebt > 0 ? '#DC2626' : '#16A34A',
                                  }}
                                >
                                  Deuda: ${totalDebt.toFixed(2)}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: clientHasPendingAbono(client.id)
                                    ? '#B45309'
                                    : Number(client.credit_balance_usd || 0) > 0
                                    ? '#059669'
                                    : '#6B7280',
                                }}
                              >
                                {clientHasPendingAbono(client.id)
                                  ? `Saldo Anterior: $${Number(
                                      client.credit_balance_usd || 0
                                    ).toFixed(
                                      2
                                    )} (Bloqueado por abono pendiente)`
                                  : `Saldo Anterior (A Favor): $${Number(
                                      client.credit_balance_usd || 0
                                    ).toFixed(2)}`}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#F3F4F6',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '10px',
                          fontWeight: '700',
                          color: '#6B7280',
                          textTransform: 'uppercase',
                        }}
                      >
                        Cliente Seleccionado
                      </span>
                      <strong style={{ fontSize: '15px', color: '#111827' }}>
                        {abonoSelectedClient.name}
                      </strong>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: clientHasPendingAbono(abonoSelectedClient.id)
                            ? '#B45309'
                            : Number(
                                abonoSelectedClient.credit_balance_usd || 0
                              ) > 0
                            ? '#059669'
                            : '#6B7280',
                          marginTop: '2px',
                        }}
                      >
                        {clientHasPendingAbono(abonoSelectedClient.id)
                          ? `Saldo Anterior Bloqueado ($${Number(
                              abonoSelectedClient.credit_balance_usd || 0
                            ).toFixed(
                              2
                            )}) — Abono previo en espera de aprobación`
                          : `Saldo Anterior Almacenado: $${Number(
                              abonoSelectedClient.credit_balance_usd || 0
                            ).toFixed(2)}`}
                      </div>
                    </div>
                    <div
                      style={{ display: 'flex', gap: '8px', fontSize: '11px' }}
                    >
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '999px',
                          fontWeight: '700',
                          backgroundColor:
                            abonoStep === 1 ? '#111827' : '#E5E7EB',
                          color: abonoStep === 1 ? '#FFFFFF' : '#374151',
                        }}
                      >
                        1. Datos del Pago
                      </span>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '999px',
                          fontWeight: '700',
                          backgroundColor:
                            abonoStep === 2 ? '#111827' : '#E5E7EB',
                          color: abonoStep === 2 ? '#FFFFFF' : '#374151',
                        }}
                      >
                        2. Seleccionar Notas
                      </span>
                    </div>
                  </div>

                  {abonoStep === 1 &&
                    (() => {
                      const isBsMethod =
                        abonoForm.payment_method === 'Pago Móvil' ||
                        abonoForm.payment_method === 'Transferencia Bs';
                      const hasMethod = Boolean(abonoForm.payment_method);

                      return (
                        <form
                          onSubmit={handleAbonoNextStep}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            fontSize: '12px',
                            maxWidth: '520px',
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
                              Fecha del Pago *
                            </label>
                            <input
                              type="date"
                              required
                              max={getLocalTodayDate()}
                              value={abonoForm.payment_date}
                              onChange={(e) =>
                                setAbonoForm({
                                  ...abonoForm,
                                  payment_date: e.target.value,
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '8px 10px',
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
                              required
                              value={abonoForm.payment_method}
                              onChange={(e) => {
                                const val = e.target.value;
                                let nextRef = abonoForm.reference_number;
                                if (val === 'Efectivo $') {
                                  nextRef = '';
                                } else if (val !== 'Zelle') {
                                  nextRef = String(nextRef || '')
                                    .replace(/\D/g, '')
                                    .slice(0, 4);
                                }
                                const nextIsBs =
                                  val === 'Pago Móvil' ||
                                  val === 'Transferencia Bs';
                                setAbonoForm({
                                  ...abonoForm,
                                  payment_method: val,
                                  reference_number: nextRef,
                                  exchange_rate: nextIsBs
                                    ? abonoForm.exchange_rate
                                    : '',
                                  amount_bs: nextIsBs
                                    ? abonoForm.amount_bs
                                    : '',
                                  origin_bank: nextIsBs
                                    ? abonoForm.origin_bank
                                    : '',
                                  destination_bank: nextIsBs
                                    ? abonoForm.destination_bank
                                    : '',
                                  amount_usd: nextIsBs
                                    ? ''
                                    : abonoForm.amount_usd,
                                });
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #D1D5DB',
                                backgroundColor: '#FFFFFF',
                              }}
                            >
                              <option value="">-- Seleccionar método --</option>
                              <option value="Efectivo $">Efectivo ($)</option>
                              <option value="Binance">Binance</option>
                              <option value="Zelle">Zelle</option>
                              <option value="Pago Móvil">
                                Pago Móvil (Bs)
                              </option>
                              <option value="Transferencia Bs">
                                Transferencia Bs
                              </option>
                            </select>
                          </div>

                          <div
                            style={{
                              backgroundColor: isBsMethod
                                ? '#FEF3C7'
                                : '#EFF6FF',
                              border: isBsMethod
                                ? '1px solid #FDE68A'
                                : '1px solid #BFDBFE',
                              color: isBsMethod ? '#92400E' : '#1E40AF',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}
                          >
                            {!hasMethod
                              ? 'Seleccione primero el método de recepción para ingresar el monto del pago.'
                              : isBsMethod
                              ? 'Pago en Bolívares: Ingrese la tasa del día y el monto en Bs; el sistema calculará automáticamente el equivalente en dólares ($).'
                              : 'Importante: Para este método, el monto recibido debe ingresarse directamente en dólares ($).'}
                          </div>

                          {hasMethod && isBsMethod && (
                            <>
                              <div>
                                <label
                                  style={{
                                    display: 'block',
                                    fontWeight: '700',
                                    marginBottom: '4px',
                                  }}
                                >
                                  Tasa (Bs / $) *
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  required
                                  value={abonoForm.exchange_rate}
                                  onChange={(e) => {
                                    const tasaRaw = e.target.value;
                                    const tasaNum = parseFloat(tasaRaw);
                                    const bsNum = parseFloat(
                                      abonoForm.amount_bs
                                    );
                                    const calcUsd =
                                      tasaNum > 0 && bsNum > 0
                                        ? (bsNum / tasaNum).toFixed(2)
                                        : '';
                                    setAbonoForm({
                                      ...abonoForm,
                                      exchange_rate: tasaRaw,
                                      amount_usd: calcUsd,
                                    });
                                  }}
                                  placeholder="Ej: 50.00"
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
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
                                  Monto en Bs *
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  required
                                  value={abonoForm.amount_bs}
                                  onChange={(e) => {
                                    const bsRaw = e.target.value;
                                    const bsNum = parseFloat(bsRaw);
                                    const tasaNum = parseFloat(
                                      abonoForm.exchange_rate
                                    );
                                    const calcUsd =
                                      tasaNum > 0 && bsNum > 0
                                        ? (bsNum / tasaNum).toFixed(2)
                                        : '';
                                    setAbonoForm({
                                      ...abonoForm,
                                      amount_bs: bsRaw,
                                      amount_usd: calcUsd,
                                    });
                                  }}
                                  placeholder="0.00"
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
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
                                  Monto Recibido ($) — Calculado automáticamente
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  readOnly
                                  value={abonoForm.amount_usd}
                                  placeholder="0.00"
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #D1D5DB',
                                    backgroundColor: '#F3F4F6',
                                    color: '#111827',
                                    fontWeight: '800',
                                    boxSizing: 'border-box',
                                    cursor: 'not-allowed',
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
                                  Cuenta Origen (Banco) *
                                </label>
                                <select
                                  required
                                  value={abonoForm.origin_bank}
                                  onChange={(e) =>
                                    setAbonoForm({
                                      ...abonoForm,
                                      origin_bank: e.target.value,
                                    })
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #D1D5DB',
                                    backgroundColor: '#FFFFFF',
                                  }}
                                >
                                  <option value="">
                                    -- Seleccionar banco origen --
                                  </option>
                                  {VENEZUELAN_BANKS.map((b) => (
                                    <option key={`orig-${b}`} value={b}>
                                      {b}
                                    </option>
                                  ))}
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
                                  Cuenta Destino (Banco) *
                                </label>
                                <select
                                  required
                                  value={abonoForm.destination_bank}
                                  onChange={(e) =>
                                    setAbonoForm({
                                      ...abonoForm,
                                      destination_bank: e.target.value,
                                    })
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #D1D5DB',
                                    backgroundColor: '#FFFFFF',
                                  }}
                                >
                                  <option value="">
                                    -- Seleccionar banco destino --
                                  </option>
                                  {VENEZUELAN_BANKS.map((b) => (
                                    <option key={`dest-${b}`} value={b}>
                                      {b}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}

                          {hasMethod && !isBsMethod && (
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
                                  setAbonoForm({
                                    ...abonoForm,
                                    amount_usd: e.target.value,
                                  })
                                }
                                placeholder="0.00"
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #D1D5DB',
                                  boxSizing: 'border-box',
                                }}
                              />
                            </div>
                          )}

                          {hasMethod && (
                            <div>
                              <label
                                style={{
                                  display: 'block',
                                  fontWeight: '700',
                                  marginBottom: '4px',
                                }}
                              >
                                {abonoForm.payment_method === 'Efectivo $'
                                  ? 'N° Referencia (Opcional en Efectivo)'
                                  : abonoForm.payment_method === 'Zelle'
                                  ? 'N° Confirmación Zelle (Últimos 4 caracteres) *'
                                  : 'N° Referencia (Últimos 4 dígitos) *'}
                              </label>
                              <input
                                type="text"
                                inputMode={
                                  abonoForm.payment_method === 'Zelle'
                                    ? 'text'
                                    : 'numeric'
                                }
                                maxLength={4}
                                required={
                                  abonoForm.payment_method !== 'Efectivo $'
                                }
                                value={abonoForm.reference_number}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const formatted =
                                    abonoForm.payment_method === 'Zelle'
                                      ? raw
                                          .replace(/[^a-zA-Z0-9]/g, '')
                                          .toUpperCase()
                                          .slice(0, 4)
                                      : raw.replace(/\D/g, '').slice(0, 4);
                                  setAbonoForm({
                                    ...abonoForm,
                                    reference_number: formatted,
                                  });
                                }}
                                placeholder={
                                  abonoForm.payment_method === 'Efectivo $'
                                    ? 'Opcional en efectivo'
                                    : abonoForm.payment_method === 'Zelle'
                                    ? 'Últimos 4 caracteres de confirmación (Ej: A1B2)'
                                    : 'Últimos 4 dígitos (Ej: 1234)'
                                }
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #D1D5DB',
                                  boxSizing: 'border-box',
                                }}
                              />
                            </div>
                          )}

                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontWeight: '700',
                                marginBottom: '4px',
                                color: '#DC2626',
                              }}
                            >
                              {abonoForm.payment_method === 'Efectivo $'
                                ? 'Adjuntar Foto de los Billetes *'
                                : 'Adjuntar Comprobante *'}
                            </label>
                            <CustomFileInput
                              id={`abono_file_client_${abonoSelectedClient.id}`}
                              onChange={(e) => setAbonoFile(e.target.files[0])}
                              file={abonoFile}
                              labelText={
                                abonoForm.payment_method === 'Efectivo $'
                                  ? 'Subir foto de los billetes'
                                  : 'Subir foto del comprobante'
                              }
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
                                setAbonoForm({
                                  ...abonoForm,
                                  user_note: e.target.value,
                                })
                              }
                              placeholder="Escriba alguna aclaratoria o nota para este abono..."
                              style={{
                                width: '100%',
                                padding: '8px 10px',
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
                              marginTop: '4px',
                            }}
                          >
                            <button
                              type="submit"
                              disabled={notifLocked || loading}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#111827',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '700',
                              }}
                            >
                              Siguiente →
                            </button>
                          </div>
                        </form>
                      );
                    })()}

                  {abonoStep === 2 &&
                    (() => {
                      const openNotes = getClientOpenNotes(
                        abonoSelectedClient.id
                      );
                      const {
                        saldoAnterior,
                        abonoActual,
                        totalDisponible,
                        totalAsignado,
                        saldoDisponible,
                      } = getAbonoTotalsSummary();

                      return (
                        <form
                          onSubmit={handleEnviarNotificacionAbono}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(auto-fit, minmax(140px, 1fr))',
                              gap: '10px',
                              padding: '12px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              borderRadius: '8px',
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#64748B',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Saldo Anterior
                              </div>
                              <div
                                style={{
                                  fontSize: '17px',
                                  fontWeight: '900',
                                  color: '#059669',
                                }}
                              >
                                ${saldoAnterior.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#64748B',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Abono Actual
                              </div>
                              <div
                                style={{
                                  fontSize: '17px',
                                  fontWeight: '900',
                                  color: '#0F172A',
                                }}
                              >
                                ${abonoActual.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#64748B',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Total Disponible
                              </div>
                              <div
                                style={{
                                  fontSize: '17px',
                                  fontWeight: '900',
                                  color: '#1E40AF',
                                }}
                              >
                                ${totalDisponible.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#64748B',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Asignado a Notas
                              </div>
                              <div
                                style={{
                                  fontSize: '17px',
                                  fontWeight: '900',
                                  color: '#2563EB',
                                }}
                              >
                                ${totalAsignado.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#64748B',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Restante a Saldo A Favor
                              </div>
                              <div
                                style={{
                                  fontSize: '17px',
                                  fontWeight: '900',
                                  color:
                                    saldoDisponible > 0 ? '#16A34A' : '#64748B',
                                }}
                              >
                                ${saldoDisponible.toFixed(2)}
                              </div>
                              <div
                                style={{ fontSize: '10px', color: '#64748B' }}
                              >
                                Se almacenará al aprobar Admin
                              </div>
                            </div>
                          </div>

                          {openNotes.length === 0 ? (
                            <div
                              style={{
                                padding: '20px',
                                textAlign: 'center',
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '8px',
                                color: '#991B1B',
                                fontSize: '13px',
                              }}
                            >
                              Este cliente no tiene Notas de Entrega abiertas o
                              con deuda pendiente.
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                              }}
                            >
                              {openNotes.map((nota) => {
                                const sel = abonoNoteSelections[nota.id] || {
                                  selected: false,
                                  proposed_payment_discount: String(
                                    nota.payment_discount || '53.38'
                                  ),
                                  pay_full_debt: false,
                                  applied_amount_usd: '',
                                };
                                const preview = computeAbonoNotePreview(
                                  nota,
                                  sel.proposed_payment_discount
                                );
                                const appliedNum = Number(
                                  parseFloat(sel.applied_amount_usd) || 0
                                );
                                const commNum = sel.use_commission_discount
                                  ? Number(
                                      parseFloat(sel.commission_discount_usd) ||
                                        0
                                    )
                                  : 0;
                                const remainingAfter = Math.max(
                                  0,
                                  Number(
                                    (
                                      preview.newDebt -
                                      appliedNum -
                                      commNum
                                    ).toFixed(2)
                                  )
                                );
                                const willClose =
                                  sel.selected &&
                                  appliedNum + commNum > 0 &&
                                  remainingAfter <= 0.009;

                                return (
                                  <div
                                    key={nota.id}
                                    style={{
                                      border: sel.selected
                                        ? '2px solid #0284C7'
                                        : '1px solid #E5E7EB',
                                      borderRadius: '10px',
                                      padding: '12px',
                                      backgroundColor: sel.selected
                                        ? '#F0F9FF'
                                        : '#FFFFFF',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '10px',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                      }}
                                    >
                                      <label
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          cursor: 'pointer',
                                          fontWeight: '900',
                                          fontSize: '14px',
                                          color: '#111827',
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={Boolean(sel.selected)}
                                          onChange={() =>
                                            handleToggleAbonoNote(nota)
                                          }
                                        />
                                        N.E. #{nota.transaction_number || 'S/N'}
                                      </label>
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          color: '#6B7280',
                                          fontWeight: '600',
                                        }}
                                      >
                                        {new Date(
                                          nota.created_at
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <div
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                          'repeat(auto-fit, minmax(130px, 1fr))',
                                        gap: '8px',
                                        fontSize: '12px',
                                        backgroundColor: '#FFFFFF',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #E5E7EB',
                                      }}
                                    >
                                      <div>
                                        <span style={{ color: '#6B7280' }}>
                                          Total Base:
                                        </span>{' '}
                                        <strong>
                                          ${preview.baseTotal.toFixed(2)}
                                        </strong>
                                      </div>
                                      <div>
                                        <span style={{ color: '#6B7280' }}>
                                          Total c/ Desc.:
                                        </span>{' '}
                                        <strong>
                                          ${preview.newFinal.toFixed(2)}
                                        </strong>
                                      </div>
                                      <div>
                                        <span style={{ color: '#6B7280' }}>
                                          Ya Abonado:
                                        </span>{' '}
                                        <strong style={{ color: '#2563EB' }}>
                                          ${preview.paid.toFixed(2)}
                                        </strong>
                                      </div>
                                      <div>
                                        <span style={{ color: '#6B7280' }}>
                                          Deuda Actual:
                                        </span>{' '}
                                        <strong style={{ color: '#DC2626' }}>
                                          ${preview.newDebt.toFixed(2)}
                                        </strong>
                                      </div>
                                    </div>

                                    <div
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                          'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: '10px',
                                        alignItems: 'end',
                                      }}
                                    >
                                      <div>
                                        <label
                                          style={{
                                            display: 'block',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            marginBottom: '4px',
                                          }}
                                        >
                                          % Descuento de la Nota
                                        </label>
                                        <select
                                          value={sel.proposed_payment_discount}
                                          onChange={(e) =>
                                            handleChangeAbonoNoteDiscount(
                                              nota,
                                              e.target.value
                                            )
                                          }
                                          style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            fontSize: '12px',
                                            border: '1px solid #F59E0B',
                                            borderRadius: '6px',
                                            backgroundColor: '#FEF3C7',
                                            color: '#78350F',
                                            fontWeight: '700',
                                          }}
                                        >
                                          <option value="53.38">
                                            {globalDiscount53}% Pagará en $
                                          </option>
                                          <option value="23.08">
                                            {globalDiscount23}% Pagará en Bs BCV
                                          </option>
                                          <option value="10">
                                            {globalDiscount10}% Descuento
                                            Especial
                                          </option>
                                          <option value="0">
                                            {globalDiscount0}% Sin Descuento
                                          </option>
                                        </select>
                                      </div>

                                      <div>
                                        <label
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            marginBottom: '4px',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={Boolean(sel.pay_full_debt)}
                                            onChange={() =>
                                              handleTogglePayFullDebt(nota)
                                            }
                                          />
                                          Abonar toda la deuda
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          disabled={!sel.selected}
                                          value={sel.applied_amount_usd}
                                          onChange={(e) =>
                                            handleChangeAbonoNoteAmount(
                                              nota,
                                              e.target.value
                                            )
                                          }
                                          placeholder="Monto a abonar ($)"
                                          style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid #D1D5DB',
                                            fontSize: '12px',
                                            boxSizing: 'border-box',
                                            backgroundColor: sel.selected
                                              ? '#FFFFFF'
                                              : '#F3F4F6',
                                          }}
                                        />
                                      </div>

                                      {sel.selected && (
                                        <div
                                          style={{
                                            fontSize: '12px',
                                            fontWeight: '700',
                                          }}
                                        >
                                          <div>
                                            Faltaría:{' '}
                                            <span
                                              style={{
                                                color: willClose
                                                  ? '#16A34A'
                                                  : '#B45309',
                                              }}
                                            >
                                              ${remainingAfter.toFixed(2)}
                                            </span>
                                          </div>
                                          <div
                                            style={{
                                              fontSize: '11px',
                                              color: willClose
                                                ? '#16A34A'
                                                : '#0284C7',
                                            }}
                                          >
                                            {willClose
                                              ? '✓ Se cerrará con este abono'
                                              : 'Quedará abonada'}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {sel.selected && (
                                      <div
                                        style={{
                                          backgroundColor: '#FEF3C7',
                                          border: '1px solid #FDE68A',
                                          borderRadius: '6px',
                                          padding: '8px 10px',
                                          display: 'flex',
                                          flexWrap: 'wrap',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: '8px',
                                        }}
                                      >
                                        <label
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: '#92400E',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={Boolean(
                                              sel.use_commission_discount
                                            )}
                                            onChange={() =>
                                              handleToggleCommissionDiscount(
                                                nota
                                              )
                                            }
                                          />
                                          Completar / descontar de comisiones
                                          del vendedor (próximo ciclo)
                                        </label>
                                        {sel.use_commission_discount && (
                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#92400E',
                                              }}
                                            >
                                              Monto ($):
                                            </span>
                                            <input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              value={
                                                sel.commission_discount_usd ||
                                                ''
                                              }
                                              onChange={(e) =>
                                                handleChangeCommissionDiscountAmount(
                                                  nota,
                                                  e.target.value
                                                )
                                              }
                                              style={{
                                                width: '100px',
                                                padding: '4px 6px',
                                                borderRadius: '4px',
                                                border: '1px solid #F59E0B',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                backgroundColor: '#FFFFFF',
                                              }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px',
                              marginTop: '8px',
                            }}
                          >
                            <button
                              type="button"
                              disabled={notifLocked || loading}
                              onClick={() => setAbonoStep(1)}
                              style={{
                                padding: '8px 14px',
                                backgroundColor: '#F3F4F6',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '12px',
                              }}
                            >
                              ← Atrás
                            </button>
                            <button
                              type="submit"
                              disabled={
                                notifLocked || loading || openNotes.length === 0
                              }
                              style={{
                                padding: '8px 16px',
                                backgroundColor:
                                  notifLocked || loading
                                    ? '#9CA3AF'
                                    : '#0284C7',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                cursor:
                                  notifLocked || loading
                                    ? 'not-allowed'
                                    : 'pointer',
                                fontWeight: '700',
                                fontSize: '12px',
                              }}
                            >
                              {notifLocked || loading
                                ? 'Enviando...'
                                : 'Enviar Notificación de Abono'}
                            </button>
                          </div>
                        </form>
                      );
                    })()}
                </div>
              )}
            </div>
          )}

          {neTab === 'historial_abonos' &&
            (() => {
              const q = sellerAbonosSearch.trim().toLowerCase();
              const filteredHist = sellerAbonosHistory.filter((item) => {
                if (!q) return true;
                return (
                  (item.client_name || '').toLowerCase().includes(q) ||
                  (item.reference_number || '').toLowerCase().includes(q) ||
                  (item.transaction_folio || '').toLowerCase().includes(q) ||
                  (item.payment_method || '').toLowerCase().includes(q)
                );
              });
              const myPending = pendingPaymentNotifications.filter(
                (n) => n.seller_id === user?.id
              );

              return (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                      borderBottom: '1px solid #E5E7EB',
                      paddingBottom: '10px',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: '900',
                          color: '#111827',
                          margin: 0,
                        }}
                      >
                        Mi Historial de Abonos
                      </h3>
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          margin: '2px 0 0 0',
                        }}
                      >
                        Pagos aprobados y notificaciones pendientes filtradas a
                        tu perfil.
                      </p>
                    </div>
                    <input
                      type="text"
                      value={sellerAbonosSearch}
                      onChange={(e) => setSellerAbonosSearch(e.target.value)}
                      placeholder="Buscar por cliente, folio o ref..."
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #D1D5DB',
                        fontSize: '12px',
                        minWidth: '220px',
                      }}
                    />
                  </div>

                  {myPending.length > 0 && (
                    <div
                      style={{
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '12px',
                      }}
                    >
                      <strong
                        style={{
                          color: '#92400E',
                          display: 'block',
                          marginBottom: '6px',
                        }}
                      >
                        ⏳ Abonos en Espera de Aprobación ({myPending.length})
                      </strong>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        {myPending.map((pn) => (
                          <div
                            key={pn.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '6px',
                              color: '#78350F',
                            }}
                          >
                            <span>
                              <strong>{pn.client_name || 'Cliente'}</strong> —{' '}
                              {pn.payment_method} (Ref:{' '}
                              {pn.reference_number || 'S/R'})
                            </span>
                            <strong>
                              ${Number(pn.amount_usd || 0).toFixed(2)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredHist.length === 0 ? (
                    <div
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: '#6B7280',
                        fontSize: '13px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '8px',
                      }}
                    >
                      No tienes abonos aprobados registrados en el histórico.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {filteredHist.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '12px',
                            backgroundColor: '#F9FAFB',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                          }}
                        >
                          <div style={{ fontSize: '12px' }}>
                            <div
                              style={{
                                fontWeight: '900',
                                fontSize: '14px',
                                color: '#111827',
                              }}
                            >
                              {item.client_name} —{' '}
                              <span style={{ color: '#059669' }}>
                                ${Number(item.amount_usd || 0).toFixed(2)}
                              </span>
                            </div>
                            <div style={{ color: '#4B5563', marginTop: '2px' }}>
                              Fecha: <strong>{item.payment_date}</strong> |
                              Método: <strong>{item.payment_method}</strong> |
                              Ref:{' '}
                              <strong>{item.reference_number || 'S/R'}</strong>
                            </div>
                            {(Number(item.amount_bs || 0) > 0 ||
                              Number(item.exchange_rate || 0) > 0) && (
                              <div
                                style={{
                                  color: '#1E40AF',
                                  marginTop: '2px',
                                  fontWeight: '600',
                                }}
                              >
                                Tasa:{' '}
                                {Number(item.exchange_rate || 0).toFixed(2)}{' '}
                                Bs/$ | Monto Bs:{' '}
                                {Number(item.amount_bs || 0).toFixed(2)} Bs
                                {(item.origin_bank || item.destination_bank) &&
                                  ` | ${item.origin_bank || 'N/A'} → ${
                                    item.destination_bank || 'N/A'
                                  }`}
                              </div>
                            )}
                            <div style={{ color: '#6B7280', marginTop: '2px' }}>
                              Notas: #{item.transaction_folio || 'N/A'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSellerHistoryDetailModal(item)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Ver Detalle
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      )}

      {activeSubMenu === 'historial_ventas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
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
              <>
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
                        <th style={{ padding: '10px 12px' }}>ID Liquidación</th>
                        <th style={{ padding: '10px 12px' }}>Fecha Pago</th>
                        <th style={{ padding: '10px 12px' }}>Periodo</th>
                        <th style={{ padding: '10px 12px' }}>Tasa BCV</th>
                        <th style={{ padding: '10px 12px' }}>Neto 53.38%</th>
                        <th style={{ padding: '10px 12px' }}>Neto 23.08%</th>
                        <th style={{ padding: '10px 12px' }}>
                          Total Equiv. ($)
                        </th>
                        <th
                          style={{ padding: '10px 12px', textAlign: 'center' }}
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSettlementHistory.map((item) => (
                        <tr
                          key={item.id}
                          style={{ borderBottom: '1px solid #E5E7EB' }}
                        >
                          <td
                            style={{ padding: '10px 12px', fontWeight: '800' }}
                          >
                            {item.id}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            {item.datePaid}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            Ciclo #{item.cycle} ({item.month}/{item.year})
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            {Number(item.bcvRate).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: '10px 12px',
                              color: '#059669',
                              fontWeight: '700',
                            }}
                          >
                            ${item.comm53Net.toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: '10px 12px',
                              color: '#0369a1',
                              fontWeight: '700',
                            }}
                          >
                            ${item.comm23Net.toFixed(2)}
                          </td>
                          <td
                            style={{ padding: '10px 12px', fontWeight: '900' }}
                          >
                            ${item.totalEquivalentUsd.toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: '10px 12px',
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: '6px',
                                justifyContent: 'center',
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
                                  padding: '5px 10px',
                                  backgroundColor: '#1e40af',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'flex',
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
                                  padding: '5px 10px',
                                  backgroundColor: '#111827',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Download size={13} /> PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  className="mobile-cards-container"
                  style={{ padding: '12px' }}
                >
                  {filteredSettlementHistory.map((item) => (
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
                            backgroundColor: '#111827',
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
                  ))}
                </div>
              </>
            )}
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

      {/* MODAL DE EDICIÓN DE NOTA DE ENTREGA */}
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

              {/* Sección de Selección de Producto */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  Agregar Productos
                </h3>

                <div style={{ width: '100%' }}>
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
                        const desc = p.price_usd * (1 - descPct / 100);
                        return {
                          value: p.id,
                          label: `[${p.code}] ${p.description} | Stock: ${
                            p.stock_current
                          } | Base: $${p.price_usd.toFixed(
                            2
                          )} | Desc: $${desc.toFixed(2)}`,
                          image_url: p.image_url,
                        };
                      })}
                    value={editNeSelectedProdId}
                    onChange={setEditNeSelectedProdId}
                    placeholder="-- Seleccionar producto --"
                    imageKey="image_url"
                    onClear={() => setEditNeSelectedProdId('')}
                  />
                </div>

                {editNeSelectedProdId &&
                  (() => {
                    const selectedProd = products.find(
                      (p) => p.id === editNeSelectedProdId
                    );
                    if (!selectedProd) return null;
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {selectedProd.image_url ? (
                          <img
                            src={selectedProd.image_url}
                            alt="Producto"
                            title="Haz clic para ver imagen en grande"
                            onClick={() =>
                              setImageModal({
                                open: true,
                                url: selectedProd.image_url,
                                title: `Imagen de ${selectedProd.description}`,
                                clientId: null,
                                fieldName: null,
                                isReadOnlyProduct: true,
                              })
                            }
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '60px',
                              height: '60px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: '#64748b',
                              flexShrink: 0,
                            }}
                          >
                            Sin Foto
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: '0' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#1e293b',
                              marginBottom: '2px',
                            }}
                          >
                            {selectedProd.code} - {selectedProd.description}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Stock disponible:{' '}
                            <strong style={{ color: '#0f172a' }}>
                              {selectedProd.stock_current} un.
                            </strong>{' '}
                            | Precio Base:{' '}
                            <strong style={{ color: '#059669' }}>
                              ${Number(selectedProd.price_usd).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ width: '120px' }}>
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
                    onClick={handleEditNeAddProduct}
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
                      style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}
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

                {/* TABLA DE ESCRITORIO */}
                <div
                  className="desktop-table-container"
                  style={{
                    width: '100%',
                    overflowX: 'auto',
                    marginBottom: '12px',
                  }}
                >
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
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateEditNeQuantity(
                                    item.product_id,
                                    e.target.value
                                  )
                                }
                                style={{
                                  width: '65px',
                                  padding: '4px',
                                  textAlign: 'center',
                                  border: '1px solid #D1D5DB',
                                  borderRadius: '4px',
                                  fontWeight: '600',
                                }}
                              />
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
                            <td style={{ padding: '8px', textAlign: 'center' }}>
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

                {/* TARJETAS MÓVIL */}
                <div className="mobile-cards-container">
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
                    renderProductCards(
                      editNeCart,
                      true,
                      handleEditNeRemoveItem,
                      handleUpdateEditNeQuantity
                    )
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
                      width: '320px',
                      backgroundColor: '#F9FAFB',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
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
                        marginBottom: '6px',
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

                    {Number(editNeModal.noteData?.special_discount_usd || 0) >
                      0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '6px',
                          color: '#B45309',
                          borderTop: '1px dashed #D1D5DB',
                          paddingTop: '6px',
                        }}
                      >
                        <span>Descuento Especial:</span>
                        <strong>
                          -$
                          {Number(
                            editNeModal.noteData.special_discount_usd
                          ).toFixed(2)}
                        </strong>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #D1D5DB',
                        paddingTop: '6px',
                        fontSize: '13px',
                        fontWeight: '900',
                      }}
                    >
                      <span>Precio Final: </span>
                      <span style={{ color: '#059669' }}>
                        $
                        {Math.max(
                          0,
                          editNeCart.reduce(
                            (acc, i) => acc + i.total_line_usd,
                            0
                          ) -
                            Number(
                              editNeModal.noteData?.special_discount_usd || 0
                            )
                        ).toFixed(2)}
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

      {/* MODAL ALERTA MONTO > $1,000 (VERIFICACIÓN EN DÓLARES) */}
      {abonoHighAmountModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              padding: '20px',
              boxSizing: 'border-box',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '900',
                color: '#B45309',
                margin: '0 0 10px 0',
              }}
            >
              ⚠️ Verifique el Monto en Dólares ($)
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#374151',
                lineHeight: 1.5,
                margin: '0 0 14px 0',
              }}
            >
              Ingresó un monto de{' '}
              <strong>
                ${Number(parseFloat(abonoForm.amount_usd) || 0).toFixed(2)}
              </strong>
              . Recuerde que todos los montos deben expresarse en{' '}
              <strong>dólares ($)</strong> y{' '}
              <strong>no en bolívares (Bs)</strong>, incluso si el pago fue por
              Pago Móvil.
            </p>
            <p
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 16px 0',
              }}
            >
              ¿Es correcta la cantidad de dólares que está abonando el cliente?
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setAbonoHighAmountModal(false)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                No, modificar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbonoHighAmountModal(false);
                  setAbonoStep(2);
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE HISTORIAL DE ABONO VENDEDOR */}
      {sellerHistoryDetailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1350,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '580px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '10px',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>
                Detalle del Abono Aprobado
              </h3>
              <button
                onClick={() => setSellerHistoryDetailModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '8px',
                fontSize: '12px',
                backgroundColor: '#F9FAFB',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '12px',
              }}
            >
              <div>
                <strong>Cliente:</strong> {sellerHistoryDetailModal.client_name}
              </div>
              <div>
                <strong>Fecha:</strong> {sellerHistoryDetailModal.payment_date}
              </div>
              <div>
                <strong>Método:</strong>{' '}
                {sellerHistoryDetailModal.payment_method}
              </div>
              <div>
                <strong>Referencia:</strong>{' '}
                {sellerHistoryDetailModal.reference_number || 'S/R'}
              </div>
              <div>
                <strong>Monto ($):</strong> $
                {Number(sellerHistoryDetailModal.amount_usd || 0).toFixed(2)}
              </div>
              {(Number(sellerHistoryDetailModal.amount_bs || 0) > 0 ||
                Number(sellerHistoryDetailModal.exchange_rate || 0) > 0) && (
                <>
                  <div>
                    <strong>Tasa:</strong>{' '}
                    {Number(
                      sellerHistoryDetailModal.exchange_rate || 0
                    ).toFixed(2)}{' '}
                    Bs/$
                  </div>
                  <div>
                    <strong>Monto Bs:</strong>{' '}
                    {Number(sellerHistoryDetailModal.amount_bs || 0).toFixed(2)}{' '}
                    Bs
                  </div>
                  {sellerHistoryDetailModal.origin_bank && (
                    <div>
                      <strong>Cuenta Origen:</strong>{' '}
                      {sellerHistoryDetailModal.origin_bank}
                    </div>
                  )}
                  {sellerHistoryDetailModal.destination_bank && (
                    <div>
                      <strong>Cuenta Destino:</strong>{' '}
                      {sellerHistoryDetailModal.destination_bank}
                    </div>
                  )}
                </>
              )}
              <div>
                <strong>Saldo Ant. Cliente:</strong> $
                {Number(
                  sellerHistoryDetailModal.previous_client_credit_usd || 0
                ).toFixed(2)}
              </div>
              <div>
                <strong>Saldo Nuevo Cliente:</strong> $
                {Number(
                  sellerHistoryDetailModal.new_client_credit_usd || 0
                ).toFixed(2)}
              </div>
            </div>
            {sellerHistoryDetailModal.user_note && (
              <p
                style={{
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: '#4B5563',
                }}
              >
                Observación: "{sellerHistoryDetailModal.user_note}"
              </p>
            )}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <strong style={{ fontSize: '13px' }}>Notas Afectadas:</strong>
              {Array.isArray(sellerHistoryDetailModal.notes_breakdown) &&
              sellerHistoryDetailModal.notes_breakdown.length > 0 ? (
                sellerHistoryDetailModal.notes_breakdown.map((b, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ fontWeight: '900' }}>
                      N.E. #{b.transaction_number} — Abonado: $
                      {Number(b.applied_amount_usd || 0).toFixed(2)}
                      {Number(b.commission_discount_usd || 0) > 0
                        ? ` (+ $${Number(b.commission_discount_usd).toFixed(
                            2
                          )} desc. comisión)`
                        : ''}{' '}
                      ({b.closed_by_this_payment ? 'Cerrada' : 'Abonada'})
                    </div>
                    <div style={{ color: '#4B5563', marginTop: '2px' }}>
                      Final: ${Number(b.new_final_price_usd || 0).toFixed(2)} |
                      Saldo Restante: $
                      {Number(b.new_balance_due_usd || 0).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Folio: #{sellerHistoryDetailModal.transaction_folio}
                </div>
              )}
            </div>
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
