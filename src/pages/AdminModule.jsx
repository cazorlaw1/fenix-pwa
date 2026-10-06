import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Calendar,
  AlertCircle,
  Check,
  X,
  Trash2,
  MapPin,
  Trash,
  Bell,
  Edit,
  Download,
  Search,
  Eye,
  RefreshCw,
  Plus,
  ArrowUpDown,
  Send,
  History,
  AlertTriangle,
  FileText,
  Sliders,
  Save,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

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

export default function AdminModule() {
  const [activeTab, setActiveTab] = useState('crear_ne');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingNotes, setPendingNotes] = useState([]);
  const [cobranzaNotes, setCobranzaNotes] = useState([]);
  const [paymentNotifications, setPaymentNotifications] = useState([]);
  const [vales, setVales] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [closedOrdersList, setClosedOrdersList] = useState([]);
  const [allOrdersList, setAllOrdersList] = useState([]);
  const [approvedValesList, setApprovedValesList] = useState([]);
  const [approvedPenaltiesList, setApprovedPenaltiesList] = useState([]);
  const [hierarchyConfigsMap, setHierarchyConfigsMap] = useState({});
  const [hierarchyAssignmentsList, setHierarchyAssignmentsList] = useState([]);
  const [userAssignedSubordinatesMap, setUserAssignedSubordinatesMap] =
    useState({});
  const [sellersList, setSellersList] = useState([]);
  const [allClientsList, setAllClientsList] = useState([]);
  const [allProductsList, setAllProductsList] = useState([]);
  const [quincenaSubView, setQuincenaSubView] = useState('liquidar');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [valesSubTab, setValesSubTab] = useState('vales_lista');
  const [cobranzaSortField, setCobranzaSortField] = useState('created_at');
  const [quincenaSortField, setQuincenaSortField] = useState('full_name');
  const [quincenaSortAsc, setQuincenaSortAsc] = useState(true);
  const [cobranzaSortAsc, setCobranzaSortAsc] = useState(false);
  const [neTargetUserId, setNeTargetUserId] = useState('');
  const [neClientId, setNeClientId] = useState('');
  const [neCategoria, setNeCategoria] = useState('bombillos');
  const [neTipoPago, setNeTipoPago] = useState('53.38');
  const [neSearchProduct, setNeSearchProduct] = useState('');
  const [neSelectedProdId, setNeSelectedProdId] = useState('');
  const [neQuantity, setNeQuantity] = useState(1);
  const [neCart, setNeCart] = useState([]);
  const [neObservacion, setNeObservacion] = useState('');
  const [estimatedNextFolio, setEstimatedNextFolio] = useState('');
  const [manualFolioMode, setManualFolioMode] = useState(false);
  const [specificFolioNum, setSpecificFolioNum] = useState('');
  const [sequenceResetTargetNum, setSequenceResetTargetNum] = useState('');
  const [assignTargetUserId, setAssignTargetUserId] = useState('');
  const [assignAmountUsd, setAssignAmountUsd] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignLinkedOrderId, setAssignLinkedOrderId] = useState('');
  const [settlementModalData, setSettlementModalData] = useState(null);
  const [sueldoFijoCurrency, setSueldoFijoCurrency] = useState('USD');
  const [penaltyChargeMethod, setPenaltyChargeMethod] = useState('53.38');
  const [historyInvoiceModalData, setHistoryInvoiceModalData] = useState(null);
  const [cobranzaSearch, setCobranzaSearch] = useState('');
  const [abonoModalNote, setAbonoModalNote] = useState(null);
  const [rejectModalNote, setRejectModalNote] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [modalGpsNote, setModalGpsNote] = useState(null);
  const [valeVistaNote, setValeVistaNote] = useState(null);
  const [valeVistaItems, setValeVistaItems] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteClientName, setEditNoteClientName] = useState('');
  const [editNoteCategory, setEditNoteCategory] = useState('bombillos');
  const [editNotePaymentDiscount, setEditNotePaymentDiscount] =
    useState('53.38');
  const [editNoteObservation, setEditNoteObservation] = useState('');
  const [editNoteItems, setEditNoteItems] = useState([]);
  const [editNoteProductsList, setEditNoteProductsList] = useState([]);
  const [editNoteSelectedProdId, setEditNoteSelectedProdId] = useState('');
  const [editNoteQuantity, setEditNoteQuantity] = useState(1);
  const [editNoteSearchProd, setEditNoteSearchProd] = useState('');
  const [isCobranzaNEModal, setIsCobranzaNEModal] = useState(false);
  const [neFecha, setNeFecha] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const [manualAbonoForm, setManualAbonoForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount_usd: '',
    payment_method: 'Pago Móvil',
    reference_number: '',
  });
  const [manualAbonoFile, setManualAbonoFile] = useState(null);
  const [abonoFecha, setAbonoFecha] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [abonoMonto, setAbonoMonto] = useState('');
  const [abonoMetodo, setAbonoMetodo] = useState('Pago Móvil');
  const [abonoReferencia, setAbonoReferencia] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCycle, setSelectedCycle] = useState('1');
  const [bcvRateUsd, setBcvRateUsd] = useState(849.56);
  const [bcvLastUpdated, setBcvLastUpdated] = useState('Sin sincronizar');
  const [bcvLoading, setBcvLoading] = useState(false);

  // --- A. CONFIGURACIÓN DINÁMICA DE DESCUENTOS ---
  const [globalDiscount53, setGlobalDiscount53] = useState(53.38);
  const [globalDiscount23, setGlobalDiscount23] = useState(23.08);
  const [globalDiscount10, setGlobalDiscount10] = useState(10);
  const [globalDiscount0, setGlobalDiscount0] = useState(0);
  const [globalTerms, setGlobalTerms] = useState(
    'LOS PAGOS O ABONOS DEBEN SER NOTIFICADOS AL 04140512684 / 04243759568. PREGUNTAR LOS DATOS DEL PAGO MÓVIL, BINANCE O ZELLE A LOS NÚMEROS ANTES MENCIONADOS. SOLO SE PROCESARÁN PAGOS A LAS CUENTAS SUMINISTRADAS POR LOS NÚMEROS OFICIALES.'
  );
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [cobranzaInternalTab, setCobranzaInternalTab] = useState('control_ne');
  const [paymentsHistoricalList, setPaymentsHistoricalList] = useState([]);
  const [paymentsHistorySearch, setPaymentsHistorySearch] = useState('');
  const [viewNotifModalData, setViewNotifModalData] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [editAbonoModalData, setEditAbonoModalData] = useState(null);
  const [editAbonoAmount, setEditAbonoAmount] = useState('');
  const [imagePreviewModal, setImagePreviewModal] = useState(null);
  const [bulkDeleteModal, setBulkDeleteModal] = useState({
    open: false,
    mode: 'all',
    startDate: '',
    endDate: '',
  });

  // --- EFECTO PARA PERSISTENCIA DE PESTAÑA (D) ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const tabFromStorage = localStorage.getItem('admin_active_tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
      localStorage.setItem('admin_active_tab', tabFromUrl);
    } else if (tabFromStorage) {
      setActiveTab(tabFromStorage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  // --- EFECTO PARA CERRAR MENÚ MÓVIL AL HACER CLIC FUERA (E) ---
  useEffect(() => {
    function handleClickOutsideMenu(event) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideMenu);
    return () =>
      document.removeEventListener('mousedown', handleClickOutsideMenu);
  }, []);

  // --- F. NOTIFICACIONES FLOTANTES (2 SEGUNDOS) ---
  const showToastSuccess = (msg) => {
    setSuccessMsg(msg);
  };

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 2000); // Duración exacta de 2 segundos
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    fetchTabData();
    fetchGlobalCreateNeAndCierreData();
    fetchEstimatedFolio();
    fetchGlobalSettings();
  }, [activeTab]);

  useEffect(() => {
    obtenerTasaBCV(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'cobranza' && cobranzaInternalTab === 'historico_pagos') {
      fetchIndependentPaymentsHistory();
    }
  }, [activeTab, cobranzaInternalTab]);

  useEffect(() => {
    if (activeTab === 'quincena') {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      setSelectedMonth(currentMonth);
      setSelectedYear(now.getFullYear());
      if (currentDay <= 15) {
        setSelectedCycle('1');
      } else {
        setSelectedCycle('2');
      }
    }
  }, [activeTab]);

  // --- A. FETCH GLOBAL SETTINGS (DINÁMICO) ---
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
      }
    } catch (err) {
      console.error('Error cargando configuración global:', err);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setConfigLoading(true);
    try {
      const settingsToSave = [
        {
          setting_key: 'ne_discount_53',
          setting_value: String(globalDiscount53),
        },
        {
          setting_key: 'ne_discount_23',
          setting_value: String(globalDiscount23),
        },
        {
          setting_key: 'ne_discount_10',
          setting_value: String(globalDiscount10),
        },
        {
          setting_key: 'ne_discount_0',
          setting_value: String(globalDiscount0),
        },
        { setting_key: 'ne_terms_conditions', setting_value: globalTerms },
      ];
      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('global_settings')
          .upsert(setting, { onConflict: 'setting_key' });
        if (error) throw error;
      }
      showToastSuccess('Configuración global guardada correctamente.');
    } catch (err) {
      setErrorMsg('Error al guardar configuración: ' + err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchGlobalCreateNeAndCierreData = async () => {
    try {
      const { data: sellers } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email, role, pct_bombillos, pct_fluidos, sueldo_fijo_usd'
        );
      if (sellers) setSellersList(sellers);

      // FILTRO DE CLIENTES OFICIALES (is_potential = false)
      const { data: allClients } = await supabase
        .from('clients')
        .select('*, profiles:assigned_seller_id(full_name)')
        .eq('is_potential', false)
        .order('name', { ascending: true });

      if (allClients) setAllClientsList(allClients);

      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .order('description', { ascending: true });
      if (prods) setAllProductsList(prods);

      const { data: ords } = await supabase
        .from('sales_orders')
        .select('*, client:client_id(name), seller:seller_id(full_name)')
        .order('transaction_number', { ascending: false });
      if (ords) setAllOrdersList(ords);
    } catch (err) {
      console.error('Error cargando data global extendida:', err);
    }
  };

  // --- E. GESTIÓN DE FOLIOS CORREGIDA ---
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

  const handleApplySequenceReset = async () => {
    const num = Number(sequenceResetTargetNum);
    if (isNaN(num) || num <= 0) {
      return alert('Ingrese un número de secuencia válido.');
    }
    if (
      !window.confirm(
        `¿Seguro que desea reconfigurar masivamente la secuencia de folios para que el próximo automático sea ${num}?`
      )
    )
      return;
    try {
      setLoading(true);
      const { error } = await supabase.rpc('set_sales_order_sequence', {
        start_num: num,
      });
      if (error) throw error;
      showToastSuccess(
        `Secuencia de folios actualizada. Siguiente automático será aprox. ${num}.`
      );
      setSequenceResetTargetNum('');
      await fetchEstimatedFolio();
    } catch (err) {
      setErrorMsg('Error al reconfigurar secuencia RPC: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper para obtener porcentaje dinámico
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

  const porcentajeDescuentoNe = getDiscountPercent(neTipoPago);

  const filteredCreateNeProducts = allProductsList.filter(
    (p) =>
      (!p.category || p.category.toLowerCase() === neCategoria.toLowerCase()) &&
      (p.description?.toLowerCase().includes(neSearchProduct.toLowerCase()) ||
        p.code?.toLowerCase().includes(neSearchProduct.toLowerCase()))
  );

  const handleAddToCartCreateNe = () => {
    if (!neSelectedProdId) return;
    const prod = allProductsList.find((p) => p.id === neSelectedProdId);
    if (!prod) return;
    const qty = Number(neQuantity);
    if (qty <= 0) return alert('Cantidad debe ser mayor a 0');
    const inCart = neCart.find((item) => item.product_id === prod.id);
    const vuConDescuento = prod.price_usd * (1 - porcentajeDescuentoNe / 100);
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
          unit_price_usd: prod.price_usd,
          discounted_unit_price_usd: vuConDescuento,
          total_line_usd: qty * vuConDescuento,
        },
      ]);
    }
    setNeSelectedProdId('');
    setNeQuantity(1);
  };

  const handleRemoveFromCartCreateNe = (id) => {
    setNeCart(neCart.filter((item) => item.product_id !== id));
  };

  const totalSinDescuentoNe = neCart.reduce(
    (acc, i) => acc + i.unit_price_usd * i.quantity,
    0
  );
  const precioFinalNe = neCart.reduce((acc, i) => acc + i.total_line_usd, 0);
  const montoAhorradoNe = totalSinDescuentoNe - precioFinalNe;

  const handleCreateDirectNE = async (e) => {
    e.preventDefault();
    if (!neClientId) return alert('Seleccione un cliente.');
    if (!neTargetUserId)
      return alert('Seleccione el usuario a quien se asignará la N.E.');
    if (neCart.length === 0) return alert('El carrito está vacío.');
    const today = new Date().toISOString().split('T')[0];
    if (neFecha > today) {
      return alert('No se puede asignar una fecha futura.');
    }
    setLoading(true);
    try {
      const payload = {
        client_id: neClientId,
        seller_id: neTargetUserId,
        category: neCategoria,
        payment_discount: neTipoPago,
        total_base_usd: totalSinDescuentoNe,
        discount_amount_usd: montoAhorradoNe,
        final_price_usd: precioFinalNe,
        total_paid_usd: 0.0,
        balance_due_usd: precioFinalNe,
        status: 'aprobada',
        payment_status: 'pendiente',
        observation: neObservacion,
        created_at: new Date(neFecha).toISOString(),
      };
      if (manualFolioMode && specificFolioNum) {
        payload.transaction_number = Number(specificFolioNum);
      }
      const { data: newNota, error: orderErr } = await supabase
        .from('sales_orders')
        .insert([payload])
        .select()
        .single();
      if (orderErr) throw orderErr;

      const detalles = neCart.map((item) => ({
        order_id: newNota.id,
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

      for (const item of neCart) {
        const { data: prodData } = await supabase
          .from('products')
          .select('stock_current')
          .eq('id', item.product_id)
          .single();
        if (prodData) {
          const newStock = Math.max(0, prodData.stock_current - item.quantity);
          await supabase
            .from('products')
            .update({ stock_current: newStock })
            .eq('id', item.product_id);
        }
      }
      showToastSuccess(
        `Nota de entrega #${newNota.transaction_number} creada, aprobada y asignada con éxito.`
      );
      setNeCart([]);
      setNeClientId('');
      setNeTargetUserId('');
      setNeObservacion('');
      setSpecificFolioNum('');
      setManualFolioMode(false);
      setNeFecha(new Date().toISOString().split('T')[0]);
      await fetchEstimatedFolio();
      fetchTabData();
      fetchGlobalCreateNeAndCierreData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedClientDataNe = allClientsList.find((c) => c.id === neClientId);

  const handleSortCobranza = (field) => {
    if (cobranzaSortField === field) {
      setCobranzaSortAsc(!cobranzaSortAsc);
    } else {
      setCobranzaSortField(field);
      setCobranzaSortAsc(true);
    }
  };

  const handleSortQuincena = (field) => {
    if (quincenaSortField === field) {
      setQuincenaSortAsc(!quincenaSortAsc);
    } else {
      setQuincenaSortField(field);
      setQuincenaSortAsc(true);
    }
  };

  const filteredCobranzaNotesBase = cobranzaNotes.filter((note) => {
    if (!cobranzaSearch.trim()) return true;
    const query = cobranzaSearch.toLowerCase();
    const trans = String(note.transaction_number || '').toLowerCase();
    const clientName = String(note.client?.name || '').toLowerCase();
    const sellerName = String(note.seller?.full_name || '').toLowerCase();
    return (
      trans.includes(query) ||
      clientName.includes(query) ||
      sellerName.includes(query)
    );
  });

  const sortedCobranzaNotes = [...filteredCobranzaNotesBase].sort((a, b) => {
    let valA = a[cobranzaSortField];
    let valB = b[cobranzaSortField];
    if (cobranzaSortField === 'client_name') {
      valA = a.client?.name || '';
      valB = b.client?.name || '';
    }
    if (valA < valB) return cobranzaSortAsc ? -1 : 1;
    if (valA > valB) return cobranzaSortAsc ? 1 : -1;
    return 0;
  });

  const calcDaysElapsed = (createdAt) => {
    return Math.floor(
      (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
    );
  };

  const agingNotes = cobranzaNotes
    .map((note) => ({
      ...note,
      days: calcDaysElapsed(note.created_at),
    }))
    .filter((n) => n.days >= 30 && n.payment_status !== 'cerrada')
    .sort((a, b) => b.days - a.days);

  const obtenerTasaBCV = async (showToast = false) => {
    try {
      setBcvLoading(true);
      const response = await fetch(
        'https://ve.dolarapi.com/v1/dolares/oficial'
      );
      if (response.ok) {
        const data = await response.json();
        const liveRate = Number(Number(data.promedio).toFixed(2));
        if (!isNaN(liveRate) && liveRate > 0) {
          setBcvRateUsd(liveRate);
          const fechaAct =
            data.fechaActualizacion || new Date().toLocaleString();
          setBcvLastUpdated(fechaAct);
          if (showToast) {
            showToastSuccess(
              `Tasa BCV actualizada: ${liveRate.toFixed(2)} Bs/$`
            );
          }
          return;
        }
      }
      throw new Error('Fallback local');
    } catch (e) {
      console.error(e);
      if (showToast) {
        showToastSuccess(
          `Tasa BCV manual/mantenida: ${Number(bcvRateUsd).toFixed(2)} Bs/$`
        );
      }
    } finally {
      setBcvLoading(false);
    }
  };

  const fetchPaymentHistoryFromDB = async () => {
    const { data, error } = await supabase
      .from('settlement_invoices')
      .select(
        '*, user:profiles!settlement_invoices_user_id_fkey(full_name, role, pct_bombillos, pct_fluidos)'
      )
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
      setPaymentHistory(formatted);
    }
  };

  const fetchIndependentPaymentsHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments_independent_history')
        .select('*')
        .order('payment_date', { ascending: false });
      if (!error && data) {
        setPaymentsHistoricalList(data);
      } else {
        setPaymentsHistoricalList([]);
      }
    } catch (err) {
      console.error('Error fetching independent payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryInvoice = async (dbId, invoiceCode) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar el registro de pago/historial ${invoiceCode}?`
      )
    )
      return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('settlement_invoices')
        .delete()
        .eq('id', dbId);
      if (error) throw error;
      showToastSuccess(`Historial ${invoiceCode} eliminado correctamente.`);
      await fetchPaymentHistoryFromDB();
    } catch (err) {
      setErrorMsg('Error al eliminar registro de historial: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteFileFromStorage = async (url) => {
    if (!url) return;
    try {
      const parts = url.split('/visits/');
      if (parts.length > 1) {
        const filePath = parts[1];
        const { error } = await supabase.storage
          .from('visits')
          .remove([filePath]);
        if (error) console.error('Error eliminando archivo de storage:', error);
      }
    } catch (err) {
      console.error('Error procesando eliminación de archivo:', err);
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payments_independent_history')
        .select('receipt_image_url');
      if (bulkDeleteModal.mode === 'range') {
        if (!bulkDeleteModal.startDate || !bulkDeleteModal.endDate) {
          alert('Seleccione fechas de inicio y fin.');
          setLoading(false);
          return;
        }
        query = query
          .gte('payment_date', bulkDeleteModal.startDate)
          .lte('payment_date', bulkDeleteModal.endDate);
      }
      const { data: recordsToDelete, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;
      if (recordsToDelete && recordsToDelete.length > 0) {
        for (const record of recordsToDelete) {
          await deleteFileFromStorage(record.receipt_image_url);
        }
      }
      let deleteQuery = supabase.from('payments_independent_history').delete();
      if (bulkDeleteModal.mode === 'range') {
        deleteQuery = deleteQuery
          .gte('payment_date', bulkDeleteModal.startDate)
          .lte('payment_date', bulkDeleteModal.endDate);
      } else {
        deleteQuery = deleteQuery.neq(
          'id',
          '00000000-0000-0000-0000-000000000000'
        );
      }
      const { error: deleteErr } = await deleteQuery;
      if (deleteErr) throw deleteErr;
      showToastSuccess(
        'Histórico de pagos y archivos adjuntos eliminados correctamente.'
      );
      setBulkDeleteModal({
        open: false,
        mode: 'all',
        startDate: '',
        endDate: '',
      });
      await fetchIndependentPaymentsHistory();
    } catch (err) {
      setErrorMsg('Error al vaciar histórico: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data: hConfig } = await supabase
        .from('hierarchy_config')
        .select('*');
      const { data: hAssign } = await supabase
        .from('hierarchy_assignments')
        .select('*');
      const configMap = {};
      (hConfig || []).forEach((c) => {
        configMap[c.parent_user_id] = c;
      });
      setHierarchyConfigsMap(configMap);
      setHierarchyAssignmentsList(hAssign || []);

      const subMap = {};
      (hAssign || []).forEach((row) => {
        if (!subMap[row.parent_user_id]) subMap[row.parent_user_id] = [];
        subMap[row.parent_user_id].push(row.target_seller_id);
      });
      setUserAssignedSubordinatesMap(subMap);

      if (activeTab === 'aprobaciones') {
        const { data, error } = await supabase
          .from('sales_orders')
          .select(
            '*, seller:seller_id(id, full_name, email, pct_bombillos, pct_fluidos, sueldo_fijo_usd), client:client_id(name)'
          )
          .eq('status', 'pendiente')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPendingNotes(data || []);
      } else if (activeTab === 'cobranza') {
        const { data, error } = await supabase
          .from('sales_orders')
          .select(
            '*, seller:seller_id(id, full_name, email, pct_bombillos, pct_fluidos, sueldo_fijo_usd), client:client_id(name)'
          )
          .in('payment_status', ['pendiente', 'abonada', 'cerrada'])
          .neq('status', 'pendiente')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setCobranzaNotes(data || []);
        if (data && data.length > 0) {
          await checkAndNotifyAgingNotes(data);
        }
        const { data: notifs, error: notifErr } = await supabase
          .from('seller_payment_notifications')
          .select(
            '*, order:order_id(transaction_number, final_price_usd, balance_due_usd, client:client_id(name)), seller:seller_id(id, full_name, email)'
          )
          .order('created_at', { ascending: false });
        if (!notifErr) {
          setPaymentNotifications(notifs || []);
        }
      } else if (activeTab === 'vales_penalizaciones') {
        // VALES INDEPENDIENTES: Sin join obligatorio a order_id
        const { data, error } = await supabase
          .from('vales')
          .select(
            '*, seller:seller_id(id, full_name, email, pct_bombillos, pct_fluidos, sueldo_fijo_usd)'
          )
          .order('created_at', { ascending: false });
        if (error) throw error;
        setVales(data || []);

        const { data: penData, error: penErr } = await supabase
          .from('penalties')
          .select(
            '*, seller:seller_id(id, full_name, email), linked_order:order_id(id, transaction_number, final_price_usd, balance_due_usd)'
          )
          .order('created_at', { ascending: false });
        if (penErr) {
          const { data: plainPen, error: plainErr } = await supabase
            .from('penalties')
            .select('*')
            .order('created_at', { ascending: false });
          if (!plainErr) setPenalties(plainPen || []);
        } else {
          setPenalties(penData || []);
        }

        const { data: ords } = await supabase
          .from('sales_orders')
          .select('*, client:client_id(name)')
          .order('transaction_number', { ascending: false });
        if (ords) setAllOrdersList(ords);
      } else if (activeTab === 'quincena') {
        const { data: profs, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['vendedor', 'supervisor', 'gerente', 'administrador']);
        if (profErr) throw profErr;

        // CANDADO UNIVERSAL: Obtener facturas existentes para el ciclo seleccionado
        const { data: existingInvoices, error: invErr } = await supabase
          .from('settlement_invoices')
          .select('user_id')
          .eq('month', selectedMonth)
          .eq('year', selectedYear)
          .eq('cycle', selectedCycle);

        const invoicedUserIds = new Set(
          (existingInvoices || []).map((i) => i.user_id)
        );

        // Filtrar perfiles que ya tienen factura
        const eligibleProfiles = (profs || []).filter(
          (p) => !invoicedUserIds.has(p.id)
        );
        setLiquidaciones(eligibleProfiles);

        const { data: closedOrd, error: closedErr } = await supabase
          .from('sales_orders')
          .select(
            '*, seller:seller_id(id, full_name, pct_bombillos, pct_fluidos, sueldo_fijo_usd, role), client:client_id(name)'
          )
          .eq('payment_status', 'cerrada')
          .order('updated_at', { ascending: false });
        if (!closedErr) {
          setClosedOrdersList(closedOrd || []);
        }

        // VALES INDEPENDIENTES: Obtener todos los vales aprobados sin filtrar por order_id
        const { data: appVales, error: valErr } = await supabase
          .from('vales')
          .select('*, seller:seller_id(id, full_name)')
          .eq('status', 'aprobada');
        if (!valErr) {
          setApprovedValesList(appVales || []);
        }

        const { data: appPen, error: penAppErr } = await supabase
          .from('penalties')
          .select(
            '*, seller:seller_id(id, full_name), linked_order:order_id(id, transaction_number, final_price_usd, balance_due_usd)'
          )
          .in('status', ['aprobada', 'approved', 'pendiente']);
        if (!penAppErr) {
          setApprovedPenaltiesList(appPen || []);
        } else {
          const { data: plainPen } = await supabase
            .from('penalties')
            .select('*')
            .in('status', ['aprobada', 'approved', 'pendiente']);
          setApprovedPenaltiesList(plainPen || []);
        }

        const { data: ords } = await supabase
          .from('sales_orders')
          .select('id, transaction_number, final_price_usd, balance_due_usd');
        if (ords) setAllOrdersList(ords);
        await fetchPaymentHistoryFromDB();
      }
    } catch (err) {
      console.error('Error en Supabase:', err);
      setErrorMsg('No se pudieron recuperar los datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const checkAndNotifyAgingNotes = async (notesList) => {
    try {
      const today = new Date();
      for (const note of notesList) {
        if (note.payment_status === 'cerrada') continue;
        const createdAt = new Date(note.created_at);
        const diffTime = Math.abs(today - createdAt);
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        let milestoneHit = null;
        let updateField = null;
        if (days >= 60 && !note.notified_60) {
          milestoneHit = '60';
          updateField = 'notified_60';
        } else if (days >= 45 && days < 60 && !note.notified_45) {
          milestoneHit = '45';
          updateField = 'notified_45';
        } else if (days >= 30 && days < 45 && !note.notified_30) {
          milestoneHit = '30';
          updateField = 'notified_30';
        }
        if (milestoneHit && updateField) {
          const { data: adminProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('role', 'administrador')
            .single();
          const vendedorEmail = note.seller?.email;
          const vendedorNombre = note.seller?.full_name || 'Vendedor';
          const clienteNombre = note.client?.name || 'Cliente';
          const nroTransaccion = note.transaction_number;
          const saldoPendiente = Number(note.balance_due_usd || 0).toFixed(2);
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'note_aging',
              payload: {
                vendedorEmail,
                adminEmail: adminProfile?.email,
                vendedorNombre,
                clienteNombre,
                nroTransaccion,
                diasAntiguedad: days,
                hito: milestoneHit,
                saldoPendiente,
              },
            },
          });
          await supabase
            .from('sales_orders')
            .update({ [updateField]: true })
            .eq('id', note.id);
        }
      }
    } catch (err) {
      console.error('Error procesando alertas de antigüedad:', err);
    }
  };

  const getClosedNotesForUserAndCycle = (userId) => {
    return closedOrdersList.filter((order) => {
      const orderSellerId = order.seller_id || order.seller?.id;
      return String(orderSellerId) === String(userId);
    });
  };

  // VALES INDEPENDIENTES: Filtrado solo por usuario, sin依赖 de order_id
  const getApprovedValesForUserAndCycle = (userId) => {
    return approvedValesList.filter((v) => {
      const valeSellerId = v.seller_id || v.seller?.id;
      return String(valeSellerId) === String(userId);
    });
  };

  const getApprovedPenaltiesForUserAndCycle = (userId) => {
    return approvedPenaltiesList.filter((p) => {
      const sellerId = p.seller_id || p.seller?.id;
      return String(sellerId) === String(userId);
    });
  };

  const calcOrderCommissionUSD = (order, sellerUser) => {
    if (!order) return 0;
    if (order.commission_zero_override || order.commission_override_zero)
      return 0;
    const finalPrice = Number(order.final_price_usd || 0);
    const cat = (order.category || 'bombillos').toLowerCase();
    const pctBombillos = Number(
      sellerUser?.pct_bombillos ?? order.seller?.pct_bombillos ?? 3
    );
    const pctFluidos = Number(
      sellerUser?.pct_fluidos ?? order.seller?.pct_fluidos ?? 2
    );
    const pct = cat === 'fluidos' ? pctFluidos : pctBombillos;
    return finalPrice * (pct / 100);
  };

  const evaluateHierarchyCommissionForOrder = (order, parentUserId) => {
    const paymentDiscount = String(order?.payment_discount || '53.38');
    if (!order)
      return {
        pctUsed: 0,
        commissionUsd: 0,
        ruleApplied: 'N/A',
        paymentDiscount,
      };
    if (order.commission_zero_override || order.commission_override_zero) {
      return {
        pctUsed: 0,
        commissionUsd: 0,
        ruleApplied: 'Comisión anulada (0%)',
        paymentDiscount,
      };
    }
    const targetSellerId = order.seller_id || order.seller?.id;
    const cat = (order.category || 'bombillos').toLowerCase();
    const finalPrice = Number(order.final_price_usd || 0);
    const specificAssign = hierarchyAssignmentsList.find(
      (a) =>
        String(a.parent_user_id) === String(parentUserId) &&
        String(a.target_seller_id) === String(targetSellerId) &&
        !a.is_exception
    );
    if (specificAssign) {
      const pctUsed =
        cat === 'fluidos'
          ? Number(specificAssign.pct_fluidos || 0)
          : Number(specificAssign.pct_bombillos || 0);
      return {
        pctUsed,
        commissionUsd: finalPrice * (pctUsed / 100),
        ruleApplied: 'Específico por vendedor',
        paymentDiscount,
      };
    }
    const config = hierarchyConfigsMap[parentUserId];
    if (config && config.is_global) {
      const exceptionAssign = hierarchyAssignmentsList.find(
        (a) =>
          String(a.parent_user_id) === String(parentUserId) &&
          String(a.target_seller_id) === String(targetSellerId) &&
          a.is_exception
      );
      if (exceptionAssign) {
        return {
          pctUsed: 0,
          commissionUsd: 0,
          ruleApplied: 'Excepción Global (0%)',
          paymentDiscount,
        };
      }
      const pctUsed =
        cat === 'fluidos'
          ? Number(config.pct_fluidos_global || 0)
          : Number(config.pct_bombillos_global || 0);
      return {
        pctUsed,
        commissionUsd: finalPrice * (pctUsed / 100),
        ruleApplied: 'Global',
        paymentDiscount,
      };
    }
    return {
      pctUsed: 0,
      commissionUsd: 0,
      ruleApplied: 'Sin regla jerárquica',
      paymentDiscount,
    };
  };

  const calculateHierarchyCommissionsForUser = (parentUser) => {
  const config = hierarchyConfigsMap[parentUser.id];
  const excIds = hierarchyAssignmentsList
    .filter((a) => String(a.parent_user_id) === String(parentUser.id) && a.is_exception)
    .map((a) => String(a.target_seller_id));
  
  const specificAssigns = hierarchyAssignmentsList.filter(
    (a) => String(a.parent_user_id) === String(parentUser.id) && !a.is_exception
  );

  const activeList = sellersList.length > 0 ? sellersList : liquidaciones;
  const eligibleSellers = activeList.filter(
    (s) => String(s.id) !== String(parentUser.id) && s.role?.toLowerCase() !== 'stock' && s.role !== 'pendiente'
  );

  let targetSellerIds = [];
  if (config && config.is_global) {
    targetSellerIds = eligibleSellers.filter((s) => !excIds.includes(String(s.id))).map((s) => String(s.id));
  } else {
    targetSellerIds = specificAssigns.map((a) => String(a.target_seller_id));
  }

  // Obtener órdenes cerradas activas
  const subordinateOrders = closedOrdersList.filter((o) => {
    const orderSellerId = o.seller_id || o.seller?.id;
    return targetSellerIds.includes(String(orderSellerId));
  });

  let hierarchyCommissionUsd53 = 0;
  let hierarchyCommissionUsd23 = 0;
  let hierarchyCommissionUsd10 = 0;
  let hierarchyCommissionUsd0 = 0;
  let hierarchyCommissionUsd = 0;

  const evaluatedOrders = subordinateOrders.map((o) => {
    const evalRes = evaluateHierarchyCommissionForOrder(o, parentUser.id);
    const pd = String(evalRes.paymentDiscount);
    if (pd === '53.38') hierarchyCommissionUsd53 += evalRes.commissionUsd;
    else if (pd === '23.08') hierarchyCommissionUsd23 += evalRes.commissionUsd;
    else if (pd === '10') hierarchyCommissionUsd10 += evalRes.commissionUsd;
    else if (pd === '0') hierarchyCommissionUsd0 += evalRes.commissionUsd;
    hierarchyCommissionUsd += evalRes.commissionUsd;
    return { order: o, ...evalRes };
  });

  const isGlobal = Boolean(config?.is_global);
  const hasExceptions = Boolean(config?.has_exceptions);
  let assignedLabelText = `${targetSellerIds.length} Vendedores`;
  if (isGlobal) {
    assignedLabelText = hasExceptions && excIds.length > 0 ? `Todos - ${excIds.length}` : 'Todos';
  }

  return {
    subordinateOrdersCount: subordinateOrders.length,
    evaluatedOrders,
    hierarchyCommissionUsd,
    hierarchyCommissionUsd53,
    hierarchyCommissionUsd23,
    hierarchyCommissionUsd10,
    hierarchyCommissionUsd0,
    assignedLabelText,
    isGlobal,
    hasExceptions,
  };
};

  // --- D. LÓGICA DE LIQUIDACIÓN CORREGIDA (SUELDO SEPARADO) ---
  const calculateUserSettlementDetails = (
    user,
    userNotes,
    userVales,
    userPenalties = [],
    sfCurr = sueldoFijoCurrency,
    rateVal = bcvRateUsd,
    penChargeMethod = penaltyChargeMethod
  ) => {
    let comm53GrossUsd = 0;
    let comm23GrossUsd = 0;
    let comm10GrossUsd = 0;
    let comm0GrossUsd = 0;

    // Inicializar deducciones por modalidad
    let valesDeduction53Usd = 0;
    let valesDeduction23Usd = 0;
    let valesDeduction10Usd = 0;
    let valesDeduction0Usd = 0;

    // Sumar comisiones propias por nota
    userNotes.forEach((n) => {
      const mode = String(n.payment_discount || '53.38');
      const commission = calcOrderCommissionUSD(n, user);
      if (mode === '53.38') comm53GrossUsd += commission;
      else if (mode === '23.08') comm23GrossUsd += commission;
      else if (mode === '10') comm10GrossUsd += commission;
      else if (mode === '0') comm0GrossUsd += commission;
    });

    // Distribuir vales independientes según la modalidad de la N.E. asociada o al 53.38% por defecto
    userVales.forEach((v) => {
      const mode = String(v.order?.payment_discount || '53.38');
      const valAmt = Number(v.requested_amount_usd || 0);
      if (mode === '53.38') valesDeduction53Usd += valAmt;
      else if (mode === '23.08') valesDeduction23Usd += valAmt;
      else if (mode === '10') valesDeduction10Usd += valAmt;
      else if (mode === '0') valesDeduction0Usd += valAmt;
    });

    const totalPenaltiesUsd = userPenalties.reduce(
      (acc, p) => acc + Number(p.amount || 0),
      0
    );

    const hierarchyData = calculateHierarchyCommissionsForUser(user);

    // Asignar penalizaciones a la modalidad seleccionada
    let penDeduction53 = penChargeMethod === '53.38' ? totalPenaltiesUsd : 0;
    let penDeduction23 = penChargeMethod === '23.08' ? totalPenaltiesUsd : 0;
    let penDeduction10 = penChargeMethod === '10' ? totalPenaltiesUsd : 0;
    let penDeduction0 = penChargeMethod === '0' ? totalPenaltiesUsd : 0;

    // Obtener comisiones jerárquicas desglosadas
    const hierarchyUsd53 = hierarchyData.hierarchyCommissionUsd53 || 0;
    const hierarchyUsd23 = hierarchyData.hierarchyCommissionUsd23 || 0;
    const hierarchyUsd10 = hierarchyData.hierarchyCommissionUsd10 || 0;
    const hierarchyUsd0 = hierarchyData.hierarchyCommissionUsd0 || 0;
    const hierarchyUsd = hierarchyData.hierarchyCommissionUsd || 0;

    // CÁLCULO NETO POR BLOQUE (SIN SUELDO INCLUIDO AÚN)
    const comm53NetUsd = Math.max(
      0,
      comm53GrossUsd + hierarchyUsd53 - valesDeduction53Usd - penDeduction53
    );

    const comm23NetUsd = Math.max(
      0,
      comm23GrossUsd + hierarchyUsd23 - valesDeduction23Usd - penDeduction23
    );

    const comm10NetUsd = Math.max(
      0,
      comm10GrossUsd + hierarchyUsd10 - valesDeduction10Usd - penDeduction10
    );

    const comm0NetUsd = Math.max(
      0,
      comm0GrossUsd + hierarchyUsd0 - valesDeduction0Usd - penDeduction0
    );

    // SUELDO FIJO (MITAD DEL CICLO)
    const rawSueldoFijo = Number(user.sueldo_fijo_usd || 0) / 2;
    const currentRate = Number(Number(rateVal || 1).toFixed(2));

    // TOTAL A PAGAR USD: Bloque 53.38% + Sueldo (si es USD)
    const totalEquivalentUsd =
      sfCurr === 'USD' ? comm53NetUsd + rawSueldoFijo : comm53NetUsd;

    // TOTAL A PAGAR BS: (Bloques 23 + 10 + 0) * Tasa + Sueldo (si es BS convertido)
    const baseToMultiplyByRateBs = comm23NetUsd + comm10NetUsd + comm0NetUsd;
    const totalNetoPagarBs =
      Math.max(
        0,
        baseToMultiplyByRateBs + (sfCurr === 'BS' ? rawSueldoFijo : 0)
      ) * currentRate;

    return {
      user,
      notes: userNotes,
      vales: userVales,
      penalties: userPenalties,
      totalPenaltiesUsd,
      sueldoFijoOriginal: rawSueldoFijo, // Este es el valor correcto ($50)
      sueldoFijoCurrency: sfCurr,
      penaltyChargeMethod: penChargeMethod,
      penDeduction53,
      penDeduction23,
      penDeduction10,
      penDeduction0,
      sueldoFijoEquivalentUsd: rawSueldoFijo,
      comm53GrossUsd,
      comm23GrossUsd,
      comm10GrossUsd,
      comm0GrossUsd,
      valesDeduction53Usd,
      valesDeduction23Usd,
      valesDeduction10Usd,
      valesDeduction0Usd,
      comm53NetUsd, // Neto SIN sueldo
      comm23NetUsd, // Neto SIN sueldo
      comm10NetUsd, // Neto SIN sueldo
      comm0NetUsd, // Neto SIN sueldo
      hierarchyUsd,
      hierarchyUsd53,
      hierarchyUsd23,
      hierarchyUsd10,
      hierarchyUsd0,
      totalEquivalentUsd,
      totalNetoPagarBs,
      hierarchyData,
    };
  };

  const handleOpenSettlementModal = (user) => {
    const userNotes = getClosedNotesForUserAndCycle(user.id);
    const userVales = getApprovedValesForUserAndCycle(user.id);
    const userPenalties = getApprovedPenaltiesForUserAndCycle(user.id);

    // Verificar si hay algo que cobrar
    const details = calculateUserSettlementDetails(
      user,
      userNotes,
      userVales,
      userPenalties,
      sueldoFijoCurrency,
      bcvRateUsd,
      penaltyChargeMethod
    );

    // Filtro de inactividad: Si no tiene notas, ni vales, ni jerarquía, ni sueldo, no abrir modal o mostrar alerta
    const hasActivity =
      userNotes.length > 0 ||
      userVales.length > 0 ||
      details.hierarchyData.subordinateOrdersCount > 0 ||
      details.sueldoFijoOriginal > 0;

    if (!hasActivity) {
      // Opcional: Podrías querer permitir abrirlo igual para ver ceros, pero el requerimiento dice ocultar en lista.
      // Si llega aquí, es porque estaba en la lista pero quizás cambió algo.
    }

    setSettlementModalData(details);
  };

  const handlePayAndLiquidate = async () => {
  if (!settlementModalData) return;
  
  const confirmMsg = `ALERTA CRÍTICA: Se deducirán $${settlementModalData.totalPenaltiesUsd.toFixed(2)} por penalizaciones, se borrarán las ${settlementModalData.notes.length} notas de entrega cerradas, los ${settlementModalData.vales.length} vales aprobados y se generará la factura. ¿Continuar?`;
  if (!window.confirm(confirmMsg)) return;

  try {
    setLoading(true);
    const invCode = 'LIQ-' + Date.now().toString().slice(-6);
    const { data: authData } = await supabase.auth.getUser();
    
    // Capturar HTML para la factura histórica
    const modalDOMEl = document.getElementById('settlement-invoice-modal-content');
    let capturedHTMLContent = '';
    if (modalDOMEl) {
      const clonedNode = modalDOMEl.cloneNode(true);
      clonedNode.querySelectorAll('div').forEach((d) => {
        if (d.textContent && d.textContent.includes('Método para reflejar / cobrar penalizaciones')) {
          d.remove();
        }
      });
      clonedNode.querySelectorAll('select').forEach((sel) => {
        const selectedText = sel.options[sel.selectedIndex]?.text || (sel.value === 'BS' ? 'Bolívares (B.s)' : 'USD ($)');
        const span = document.createElement('span');
        span.style.fontWeight = 'bold';
        span.style.fontSize = '12px';
        span.style.color = '#166534';
        span.textContent = selectedText;
        sel.parentNode.replaceChild(span, sel);
      });
      clonedNode.querySelectorAll('button, input').forEach((el) => el.remove());
      capturedHTMLContent = clonedNode.innerHTML;
    }

    // 1. PROCESAR PENALIZACIONES COMO ABONOS
    for (const pen of settlementModalData.penalties) {
      const penAmt = Number(pen.amount || 0);
      if (pen.order_id && penAmt > 0) {
        await supabase.from('order_payments').insert([{
          order_id: pen.order_id,
          payment_date: new Date().toISOString().split('T')[0],
          amount_usd: penAmt,
          payment_method: 'Deducción Penalización (Liquidación Ciclo)',
          reference_number: `LIQ-PEN-${Date.now().toString().slice(-5)}`,
          created_by: authData?.user?.id,
        }]);
        
        const { data: ordDat } = await supabase.from('sales_orders').select('*').eq('id', pen.order_id).single();
        if (ordDat) {
          const newPaid = Number(ordDat.total_paid_usd || 0) + penAmt;
          const newBal = Math.max(0, Number(ordDat.final_price_usd) - newPaid);
          await supabase.from('sales_orders').update({
            total_paid_usd: newPaid,
            balance_due_usd: newBal,
            payment_status: newBal === 0 ? 'cerrada' : 'abonada',
            closed_at: newBal === 0 ? new Date() : null,
            updated_at: new Date(),
          }).eq('id', pen.order_id);
        }
      }
      await supabase.from('penalties').update({ status: 'cobrada' }).eq('id', pen.id);
    }

    // 2. GUARDAR RESPALDO DE COMISIONES JERÁRQUICAS (CRÍTICO PARA PAGOS DIFERIDOS)
    try {
      const hierarchyBackups = settlementModalData.hierarchyData.evaluatedOrders.map((eo) => ({
        parent_user_id: settlementModalData.user.id,
        subordinate_order_id: eo.order.id,
        commission_amount: eo.commissionUsd,
        payment_discount: eo.paymentDiscount,
        settled_at: new Date().toISOString(),
        cycle: selectedCycle,
        month: selectedMonth,
        year: selectedYear,
      }));
      
      if (hierarchyBackups.length > 0) {
        const { error: backupErr } = await supabase.from('hierarchy_settlement_backups').insert(hierarchyBackups);
        if (backupErr) console.warn('Error guardando backup jerárquico:', backupErr.message);
      }
    } catch (backupErr) {
      console.warn('Tabla hierarchy_settlement_backups no disponible:', backupErr);
    }

    // 3. INSERTAR FACTURA DE LIQUIDACIÓN
    const { error: invErr } = await supabase.from('settlement_invoices').insert([{
      invoice_code: invCode,
      user_id: settlementModalData.user.id,
      month: selectedMonth,
      year: selectedYear,
      cycle: selectedCycle,
      bcv_rate: Number(bcvRateUsd).toFixed(2),
      sueldo_fijo_usd: settlementModalData.sueldoFijoOriginal,
      sueldo_fijo_currency: settlementModalData.sueldoFijoCurrency,
      comm_53_gross_usd: settlementModalData.comm53GrossUsd,
      comm_23_gross_usd: settlementModalData.comm23GrossUsd,
      vales_deduction_53_usd: settlementModalData.valesDeduction53Usd,
      vales_deduction_23_usd: settlementModalData.valesDeduction23Usd,
      comm_53_net_usd: settlementModalData.comm53NetUsd,
      comm_23_net_usd: settlementModalData.comm23NetUsd,
      total_neto_pagar_usd: settlementModalData.totalEquivalentUsd,
      total_neto_pagar_bs: settlementModalData.totalNetoPagarBs,
      captured_html: capturedHTMLContent,
      status: 'pagada',
      created_by: authData?.user?.id,
    }]);
    if (invErr) throw invErr;

    // 4. LIMPIEZA DE DATOS (SOLO DESPUÉS DE GUARDAR BACKUP Y FACTURA)
    const noteIdsToDelete = settlementModalData.notes.map((n) => n.id);
    if (noteIdsToDelete.length > 0) {
      await supabase.from('order_items').delete().in('order_id', noteIdsToDelete);
      await supabase.from('order_payments').delete().in('order_id', noteIdsToDelete);
      await supabase.from('seller_payment_notifications').delete().in('order_id', noteIdsToDelete);
      await supabase.from('sales_orders').delete().in('id', noteIdsToDelete);
      await supabase.from('penalties').delete().in('order_id', noteIdsToDelete);
    }
    
    const valeIdsToDelete = settlementModalData.vales.map((v) => v.id);
    if (valeIdsToDelete.length > 0) await supabase.from('vales').delete().in('id', valeIdsToDelete);
    
    const penIdsToDelete = settlementModalData.penalties.map((p) => p.id);
    if (penIdsToDelete.length > 0) await supabase.from('penalties').delete().in('id', penIdsToDelete);

    // Notificación al usuario
    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'settlement_processed',
          payload: {
            userEmail: settlementModalData.user.email,
            userName: settlementModalData.user.full_name,
            fechaInicio: `${selectedMonth}/${selectedYear}`,
            fechaFin: `${selectedMonth}/${selectedYear}`,
            montoDivisas: settlementModalData.totalEquivalentUsd.toFixed(2),
            montoBs: settlementModalData.totalNetoPagarBs.toFixed(2),
          },
        },
      });
    } catch (e) { console.warn('Error enviando notif de liquidación:', e); }

    showToastSuccess(`Factura ${invCode} generada y ciclo liquidado correctamente.`);
    setSettlementModalData(null);
    await fetchTabData();
    setQuincenaSubView('historial');
  } catch (err) {
    setErrorMsg('Error al guardar y liquidar: ' + err.message);
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
      container.innerHTML = `
<div style="font-family: Arial, sans-serif; color: #111; padding: 25px; background: #fff; width: 720px; box-sizing: border-box; margin: 0 auto;">
${histItem.capturedHTML || '<p>Factura sin HTML capturado.</p>'}
</div>
`;
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

  const handleOpenCapturedHistoryInvoiceModal = (histItem) => {
    setHistoryInvoiceModalData(histItem);
  };

  const handleOpenValeVistaNE = async (order) => {
    if (!order) return;
    try {
      setLoading(true);
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*, products(code, description)')
        .eq('order_id', order.id);
      if (error) throw error;
      setValeVistaItems(items || []);
      setValeVistaNote(order);
    } catch (err) {
      setErrorMsg('No se pudieron cargar los ítems de la nota de entrega.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (nota) => {
    try {
      setLoading(true);

      // 1. OBTENER PORCENTAJE DINÁMICO SEGÚN CONFIGURACIÓN GLOBAL
      const discountPct = getDiscountPercent(
        String(nota.payment_discount || '53.38')
      );

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

      // 2. CORRECCIÓN DE VARIABLES (Evita el error currentSellerName)
      const clientName = nota.client?.name || nota.clients?.name || 'Cliente';
      const transNo = nota.transaction_number || nota.id.substring(0, 8);
      const fecha = new Date(nota.created_at).toLocaleString();
      const vendedorName = nota.seller?.full_name || 'Vendedor';

      // Construcción de tabla de productos (Conservada igual)
      let itemsHtml = '';
      let subTotal = 0;
      if (items && items.length > 0) {
        items.forEach((item) => {
          const totalLine =
            item.total_line_usd ||
            item.quantity * item.discounted_unit_price_usd;
          subTotal += totalLine;
          itemsHtml += `
            <tr>
              <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; font-family: monospace;">${
                item.products?.code || 'S/C'
              }</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #ddd;">${
                item.products?.description || 'Producto'
              }</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: center;">${
                item.quantity
              }</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(
                item.unit_price_usd || 0
              ).toFixed(2)}</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right; color: #B45309;">$${Number(
                item.discounted_unit_price_usd || 0
              ).toFixed(2)}</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">$${Number(
                totalLine
              ).toFixed(2)}</td>
            </tr>`;
        });
      }

      // 3. DISEÑO SIMPLIFICADO CON PORCENTAJE INCLUIDO
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #111; padding: 25px; background: #fff; width: 700px; height: 1000px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; margin: 0 auto;">
          
          <!-- ENCABEZADO -->
          <div>
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px;">
              <div>
                <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">FENIX AUTO PART C.A</h2>
                <p style="margin: 2px 0; font-size: 12px;"><strong>RIF:</strong> J-50261925-2</p>
                <p style="margin: 8px 0 0 0; font-size: 12px;"><strong>Cliente:</strong> ${clientName}</p>
              </div>
              <div style="text-align: right; font-size: 12px;">
                <p style="margin: 2px 0;"><strong>N° Transacción:</strong> #${transNo}</p>
                <p style="margin: 2px 0;"><strong>Fecha/Hora:</strong> ${fecha}</p>
                <p style="margin: 2px 0;"><strong>Vendedor:</strong> ${vendedorName}</p>
                <p style="margin: 2px 0;"><strong>Categoría:</strong> ${
                  nota.category || 'General'
                }</p>
              </div>
            </div>

            <!-- TABLA DE PRODUCTOS -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Código</th>
                  <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Descripción</th>
                  <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Cantidad</th>
                  <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">V. Unitario</th>
                  <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">V. U. con Descuento</th>
                  <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Total Línea</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </div>

          <!-- RESUMEN SIMPLIFICADO CON PORCENTAJE -->
          <div>
            <div style="display: flex; justify-content: flex-end; font-size: 12px; margin-bottom: 15px;">
              <div style="width: 280px; background: #f9fafb; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px;">
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span>Total Base:</span>
                  <strong>$${Number(nota.total_base_usd || subTotal).toFixed(
                    2
                  )}</strong>
                </div>
                
                <!-- AQUÍ SE MUESTRA EL PORCENTAJE DINÁMICO -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #D97706;">
                  <span>Descuento Aplicado (${discountPct}%):</span>
                  <strong>-$${Number(nota.discount_amount_usd || 0).toFixed(
                    2
                  )}</strong>
                </div>
                
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 6px; font-weight: bold; font-size: 14px; color: #DC2626;">
                  <span>Precio Final:</span>
                  <span>$${Number(nota.final_price_usd || subTotal).toFixed(
                    2
                  )}</span>
                </div>                                
              </div>
            </div>

            ${
              nota.observation
                ? `
              <div style="font-size: 11px; color: #333; background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 4px; margin-bottom: 10px; text-align: justify;">
                <strong>Observación:</strong> ${nota.observation}
              </div>
            `
                : ''
            }

            <div style="font-size: 10px; color: #555; background: #f3f4f6; padding: 10px; border-radius: 4px; line-height: 1.4; text-align: justify;">
              <strong>Términos y condiciones:</strong> ${globalTerms}
            </div>
          </div>
        </div>
      `;

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

  const handleClearNoteGPS = async (note) => {
    if (
      !window.confirm(
        `¿Desea eliminar los datos GPS de la nota #${note.transaction_number}?`
      )
    )
      return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('sales_orders')
        .update({
          latitude: null,
          longitude: null,
          gps_captured_at: null,
          updated_at: new Date(),
        })
        .eq('id', note.id);
      if (error) throw error;
      showToastSuccess(
        `GPS eliminado para la nota #${note.transaction_number}.`
      );
      setModalGpsNote(null);
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Error al eliminar el GPS.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNoteComplete = async (note) => {
    const confirmText = `ATENCIÓN: ¿Está seguro de ELIMINAR COMPLETAMENTE la Nota de Entrega #${note.transaction_number}?`;
    if (!window.confirm(confirmText)) return;
    try {
      setLoading(true);
      if (note.status === 'aprobada') {
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', note.id);
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
      await supabase.from('order_items').delete().eq('order_id', note.id);
      await supabase.from('order_payments').delete().eq('order_id', note.id);
      await supabase
        .from('seller_payment_notifications')
        .delete()
        .eq('order_id', note.id);
      await supabase.from('vales').delete().eq('order_id', note.id);
      await supabase.from('penalties').delete().eq('order_id', note.id);
      const { error } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', note.id);
      if (error) throw error;
      showToastSuccess(
        `Nota #${note.transaction_number} y todo su contenido relacionado fueron eliminados.`
      );
      setEditingNoteId(null);
      fetchTabData();
      fetchGlobalCreateNeAndCierreData();
    } catch (err) {
      setErrorMsg(
        err.message || 'Error al eliminar la nota de entrega completa.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePaymentNotification = async (notif) => {
    try {
      setLoading(true);
      const montoNum = Number(notif.amount_usd) || 0;
      const refNum = String(notif.reference_number || '').trim();
      const duplicate = paymentsHistoricalList.find(
        (p) =>
          Math.abs(Number(p.amount_usd) - montoNum) < 0.01 &&
          String(p.reference_number || '')
            .trim()
            .toLowerCase() === refNum.toLowerCase()
      );
      if (duplicate) {
        const confirmDup = window.confirm(
          `⚠️ PAGO DUPLICADO DETECTADO Ya existe un pago con Monto: $${montoNum.toFixed(
            2
          )} y Referencia: "${refNum}" registrado el ${new Date(
            duplicate.payment_date
          ).toLocaleDateString()}. ¿Desea continuar aprobando este pago duplicado de todas formas?`
        );
        if (!confirmDup) {
          setLoading(false);
          return;
        }
      }
      const { data: userData } = await supabase.auth.getUser();
      const { error: histErr } = await supabase
        .from('payments_independent_history')
        .insert([
          {
            client_name: notif.order?.client?.name || 'N/A',
            payment_date:
              notif.payment_date || new Date().toISOString().split('T')[0],
            amount_usd: montoNum,
            payment_method: notif.payment_method || 'Pago Móvil',
            reference_number: refNum,
            transaction_folio: notif.order?.transaction_number || 'N/A',
            receipt_image_url: notif.receipt_image_url || null,
            original_notif_id: notif.id,
            approved_by: userData?.user?.id,
            approved_at: new Date().toISOString(),
          },
        ]);
      if (histErr) {
        console.warn(
          'Tabla payments_independent_history pendiente de crear:',
          histErr.message
        );
      }
      const { error: payErr } = await supabase.from('order_payments').insert([
        {
          order_id: notif.order_id,
          payment_date:
            notif.payment_date || new Date().toISOString().split('T')[0],
          amount_usd: montoNum,
          payment_method: notif.payment_method || 'Pago Móvil',
          reference_number: refNum || 'Aprobado de Notif.',
          created_by: userData?.user?.id,
        },
      ]);
      if (payErr) throw payErr;

      const { data: orderData, error: orderFetchErr } = await supabase
        .from('sales_orders')
        .select('*')
        .eq('id', notif.order_id)
        .single();
      if (orderFetchErr) throw orderFetchErr;
      const nuevoAbonado = Number(orderData.total_paid_usd || 0) + montoNum;
      const nuevoSaldo = Math.max(
        0,
        Number(orderData.final_price_usd) - nuevoAbonado
      );
      const nuevoEstadoPago = nuevoSaldo === 0 ? 'cerrada' : 'abonada';
      const { error: orderUpdateErr } = await supabase
        .from('sales_orders')
        .update({
          total_paid_usd: nuevoAbonado,
          balance_due_usd: nuevoSaldo,
          payment_status: nuevoEstadoPago,
          closed_at: nuevoSaldo === 0 ? new Date() : null,
          updated_at: new Date(),
        })
        .eq('id', notif.order_id);
      if (orderUpdateErr) throw orderUpdateErr;
      const { error: notifUpdateErr } = await supabase
        .from('seller_payment_notifications')
        .update({ status: 'approved' })
        .eq('id', notif.id);
      if (notifUpdateErr) throw notifUpdateErr;
      try {
        const vendedorEmail = notif.seller?.email;
        const vendedorNombre = notif.seller?.full_name;
        const clienteNombre = notif.order?.client?.name || 'Cliente';
        const nroTransaccion = notif.order?.transaction_number || 'N/A';
        if (vendedorEmail && vendedorNombre) {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'abono_approved',
              payload: {
                nroTransaccion: nroTransaccion,
                vendedorEmail: vendedorEmail,
                vendedorNombre: vendedorNombre,
                clienteNombre: clienteNombre,
                montoAbonado: montoNum.toFixed(2),
              },
            },
          });
          console.log(
            '✅ Correo de abono aprobado enviado al vendedor:',
            vendedorEmail
          );
        } else {
          console.warn(
            '⚠️ No se pudo enviar correo de abono: faltan datos del vendedor',
            { vendedorEmail, vendedorNombre }
          );
        }
      } catch (notifErr) {
        console.warn(
          'Error enviando correo de abono aprobado (no bloqueante):',
          notifErr
        );
      }
      showToastSuccess(
        `Notificación de abono de $${montoNum.toFixed(
          2
        )} aprobada, registrada en abonos y archivada en histórico.`
      );
      setViewNotifModalData(null);
      setDuplicateWarning(null);
      fetchTabData();
      if (cobranzaInternalTab === 'historico_pagos') {
        fetchIndependentPaymentsHistory();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al aprobar notificación de abono.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentNotification = async (notifId) => {
    if (
      !window.confirm(
        '¿Está seguro de eliminar esta notificación de abono pendiente?'
      )
    )
      return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('seller_payment_notifications')
        .delete()
        .eq('id', notifId);
      if (error) throw error;
      showToastSuccess('Notificación eliminada correctamente.');
      setViewNotifModalData(null);
      setDuplicateWarning(null);
      fetchTabData();
    } catch (err) {
      setErrorMsg('Error al eliminar notificación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewNotifModal = async (notif) => {
    setLoading(true);
    setViewNotifModalData(notif);
    setDuplicateWarning(null);
    try {
      const montoNum = Number(notif.amount_usd) || 0;
      const refNum = String(notif.reference_number || '').trim();
      const { data, error } = await supabase
        .from('payments_independent_history')
        .select('payment_date, amount_usd, reference_number')
        .eq('reference_number', refNum)
        .eq('amount_usd', montoNum)
        .limit(1);
      if (!error && data && data.length > 0) {
        const dup = data[0];
        setDuplicateWarning({
          date: new Date(dup.payment_date).toLocaleDateString(),
          amount: dup.amount_usd,
          ref: dup.reference_number,
        });
      }
    } catch (err) {
      console.error('Error verificando duplicados en DB:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditAbonoModal = (note) => {
    setEditAbonoModalData(note);
    setEditAbonoAmount(String(note.total_paid_usd || 0));
  };

  const handleSaveEditedAbono = async () => {
    if (!editAbonoModalData) return;
    const newAmount = parseFloat(editAbonoAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      return alert('Ingrese un monto válido mayor o igual a 0.');
    }
    try {
      setLoading(true);
      const finalPrice = Number(editAbonoModalData.final_price_usd || 0);
      const newBalance = Math.max(0, finalPrice - newAmount);
      const newStatus = newBalance === 0 ? 'cerrada' : 'abonada';
      const { error } = await supabase
        .from('sales_orders')
        .update({
          total_paid_usd: newAmount,
          balance_due_usd: newBalance,
          payment_status: newStatus,
          closed_at: newBalance === 0 ? new Date() : null,
          updated_at: new Date(),
        })
        .eq('id', editAbonoModalData.id);
      if (error) throw error;
      showToastSuccess(`Abono actualizado a $${newAmount.toFixed(2)}`);
      setEditAbonoModalData(null);
      fetchTabData();
    } catch (err) {
      setErrorMsg('Error al actualizar abono: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterManualAbono = async (e) => {
    e.preventDefault();
    if (!abonoModalNote) return;
    const fileToUpload = manualAbonoFile;
    const montoNum = parseFloat(manualAbonoForm.amount_usd);
    const refNum = String(manualAbonoForm.reference_number || '').trim();
    if (isNaN(montoNum) || montoNum <= 0) {
      return alert('Ingrese un monto válido.');
    }
    try {
      const { data: duplicates, error: dupErr } = await supabase
        .from('payments_independent_history')
        .select('payment_date')
        .eq('reference_number', refNum)
        .eq('amount_usd', montoNum)
        .limit(1);
      if (!dupErr && duplicates && duplicates.length > 0) {
        const dupDate = new Date(
          duplicates[0].payment_date
        ).toLocaleDateString();
        const continueAnyway = window.confirm(
          `⚠️ ATENCIÓN: Este pago parece estar duplicado. Ya existe un registro con Monto: $${montoNum.toFixed(
            2
          )} y Referencia: "${refNum}" fechado el ${dupDate}. ¿Desea continuar guardando este abono de todas formas?`
        );
        if (!continueAnyway) return;
      }
    } catch (err) {
      console.error('Error verificando duplicados:', err);
    }
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      let receiptUrl = null;
      if (fileToUpload) {
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `abonos/${fileName}`;
        const { error: uploadErr } = await supabase.storage
          .from('visits')
          .upload(filePath, fileToUpload);
        if (uploadErr) throw uploadErr;
        const { data: publicUrlData } = supabase.storage
          .from('visits')
          .getPublicUrl(filePath);
        receiptUrl = publicUrlData.publicUrl;
      }
      const { error: histErr } = await supabase
        .from('payments_independent_history')
        .insert([
          {
            client_name: abonoModalNote.client?.name || 'N/A',
            payment_date: manualAbonoForm.payment_date,
            amount_usd: montoNum,
            payment_method: manualAbonoForm.payment_method,
            reference_number: refNum,
            transaction_folio: abonoModalNote.transaction_number || 'N/A',
            receipt_image_url: receiptUrl,
            approved_by: userData?.user?.id,
            approved_at: new Date().toISOString(),
          },
        ]);
      if (histErr)
        console.warn(
          'Error guardando en histórico independiente:',
          histErr.message
        );
      const { error: payErr } = await supabase.from('order_payments').insert([
        {
          order_id: abonoModalNote.id,
          payment_date: manualAbonoForm.payment_date,
          amount_usd: montoNum,
          payment_method: manualAbonoForm.payment_method,
          reference_number: refNum,
          created_by: userData?.user?.id,
        },
      ]);
      if (payErr) throw payErr;
      const nuevoAbonado =
        Number(abonoModalNote.total_paid_usd || 0) + montoNum;
      const nuevoSaldo = Math.max(
        0,
        Number(abonoModalNote.final_price_usd) - nuevoAbonado
      );
      const nuevoEstadoPago = nuevoSaldo === 0 ? 'cerrada' : 'abonada';
      const { error: noteErr } = await supabase
        .from('sales_orders')
        .update({
          total_paid_usd: nuevoAbonado,
          balance_due_usd: nuevoSaldo,
          payment_status: nuevoEstadoPago,
          closed_at: nuevoSaldo === 0 ? new Date() : null,
          updated_at: new Date(),
        })
        .eq('id', abonoModalNote.id);
      if (noteErr) throw noteErr;
      const existingNotif = paymentNotifications.find(
        (n) => n.order_id === abonoModalNote.id && n.status === 'pending'
      );
      if (existingNotif) {
        await supabase
          .from('seller_payment_notifications')
          .delete()
          .eq('id', existingNotif.id);
      }
      showToastSuccess(
        `Abono manual registrado con éxito. Nuevo Saldo: $${nuevoSaldo.toFixed(
          2
        )}`
      );
      setAbonoModalNote(null);
      setManualAbonoForm({
        payment_date: new Date().toISOString().split('T')[0],
        amount_usd: '',
        payment_method: 'Pago Móvil',
        reference_number: '',
      });
      setManualAbonoFile(null);
      fetchTabData();
      if (cobranzaInternalTab === 'historico_pagos')
        fetchIndependentPaymentsHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar el abono manual.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveNote = async (note) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('sales_orders')
        .update({ status: 'aprobada', updated_at: new Date() })
        .eq('id', note.id);
      if (error) throw error;
      try {
        const vendedorEmail = note.seller?.email;
        const vendedorNombre = note.seller?.full_name;
        const clienteNombre = note.client?.name || 'Cliente';
        if (vendedorEmail && vendedorNombre) {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'note_approved',
              payload: {
                nroTransaccion: note.transaction_number,
                vendedorEmail: vendedorEmail,
                vendedorNombre: vendedorNombre,
                clienteNombre: clienteNombre,
              },
            },
          });
          console.log(
            '✅ Correo de aprobación enviado al vendedor:',
            vendedorEmail
          );
        } else {
          console.warn(
            '⚠️ No se pudo enviar correo: faltan datos del vendedor',
            { vendedorEmail, vendedorNombre }
          );
        }
      } catch (notifErr) {
        console.warn(
          'Error enviando correo de aprobación (no bloqueante):',
          notifErr
        );
      }
      showToastSuccess(
        `Nota de Entrega N° ${note.transaction_number} aprobada exitosamente.`
      );
      if (editingNoteId === note.id) {
        setEditingNoteId(null);
      }
      fetchTabData();
      fetchGlobalCreateNeAndCierreData();
    } catch (err) {
      setErrorMsg(err.message || 'Error al aprobar la nota.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectNote = async (e) => {
    e.preventDefault();
    if (!rejectModalNote) return;
    try {
      const { error } = await supabase
        .from('sales_orders')
        .update({
          status: 'rechazada',
          rejection_reason: rejectReason,
          updated_at: new Date(),
        })
        .eq('id', rejectModalNote.id);
      if (error) throw error;
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'note_rejected',
            payload: {
              nroTransaccion: rejectModalNote.transaction_number,
              vendedorEmail:
                rejectModalNote.seller?.email ||
                rejectModalNote.profiles?.email,
              vendedorNombre:
                rejectModalNote.seller?.full_name ||
                rejectModalNote.profiles?.full_name,
              clienteNombre:
                rejectModalNote.client?.name || rejectModalNote.clients?.name,
              observacion: rejectReason,
            },
          },
        });
      } catch (e) {
        console.warn('Error notif rechazo:', e);
      }
      showToastSuccess(
        `Nota N° ${rejectModalNote.transaction_number} rechazada.`
      );
      if (editingNoteId === rejectModalNote.id) {
        setEditingNoteId(null);
      }
      setRejectModalNote(null);
      setRejectReason('');
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Error al rechazar la nota.');
    }
  };

  const handleOpenEditNEPanel = async (note, isCobranza = false) => {
    try {
      setLoading(true);
      setErrorMsg('');
      setIsCobranzaNEModal(isCobranza);
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('description', { ascending: true });
      if (prodErr) throw prodErr;
      setEditNoteProductsList(prods || []);

      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('*, products(code, description)')
        .eq('order_id', note.id);
      if (itemsErr) throw itemsErr;
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
      setEditingNoteId(note.id);
      setEditNoteClientName(note.client?.name || 'Cliente');
      setEditNoteCategory(note.category || 'bombillos');
      setEditNotePaymentDiscount(String(note.payment_discount || '53.38'));
      setEditNoteObservation(note.observation || '');
      setEditNoteItems(mappedItems);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo cargar la nota de entrega para edición.');
    } finally {
      setLoading(false);
    }
  };

  // --- C. LÓGICA DINÁMICA DE EDICIÓN Y CREACIÓN ---
  const handleEditNoteRecalculatePrices = (newDiscountType) => {
    const newPct = getDiscountPercent(newDiscountType);
    const recalculated = editNoteItems.map((item) => {
      const newDiscPrice = item.unit_price_usd * (1 - newPct / 100);
      return {
        ...item,
        discounted_unit_price_usd: newDiscPrice,
        total_line_usd: item.quantity * newDiscPrice,
      };
    });
    setEditNoteItems(recalculated);
  };

  const handleEditNoteAddProduct = () => {
    if (!editNoteSelectedProdId) return;
    const prod = editNoteProductsList.find(
      (p) => p.id === editNoteSelectedProdId
    );
    if (!prod) return;
    const qty = Number(editNoteQuantity);
    if (qty <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    const descPct = getDiscountPercent(editNotePaymentDiscount);
    const vuConDesc = Number(prod.price_usd) * (1 - descPct / 100);
    const existingIdx = editNoteItems.findIndex(
      (i) => i.product_id === prod.id
    );
    if (existingIdx > -1) {
      const updated = [...editNoteItems];
      const newQty = updated[existingIdx].quantity + qty;
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: newQty,
        discounted_unit_price_usd: vuConDesc,
        total_line_usd: newQty * vuConDesc,
      };
      setEditNoteItems(updated);
    } else {
      setEditNoteItems([
        ...editNoteItems,
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
    setEditNoteSelectedProdId('');
    setEditNoteQuantity(1);
  };

  const handleEditNoteRemoveItem = (product_id) => {
    setEditNoteItems(editNoteItems.filter((i) => i.product_id !== product_id));
  };

  const handleSaveEditedNote = async (note) => {
    try {
      setLoading(true);
      const { data: oldItems, error: oldItemsErr } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', note.id);
      if (!oldItemsErr && oldItems && note.status === 'aprobada') {
        for (const oldItem of oldItems) {
          const { data: prodData } = await supabase
            .from('products')
            .select('stock_current')
            .eq('id', oldItem.product_id)
            .single();
          if (prodData) {
            const restoredStock = prodData.stock_current + oldItem.quantity;
            await supabase
              .from('products')
              .update({ stock_current: restoredStock })
              .eq('id', oldItem.product_id);
          }
        }
      }
      const totalBase = editNoteItems.reduce(
        (acc, item) => acc + item.unit_price_usd * item.quantity,
        0
      );
      const finalPrice = editNoteItems.reduce(
        (acc, item) => acc + item.total_line_usd,
        0
      );
      const discountAmount = Math.max(0, totalBase - finalPrice);
      const { error: updateErr } = await supabase
        .from('sales_orders')
        .update({
          category: editNoteCategory,
          payment_discount: editNotePaymentDiscount,
          total_base_usd: totalBase,
          discount_amount_usd: discountAmount,
          final_price_usd: finalPrice,
          balance_due_usd: finalPrice - Number(note.total_paid_usd || 0),
          observation: editNoteObservation,
          updated_at: new Date(),
        })
        .eq('id', note.id);
      if (updateErr) throw updateErr;

      const { error: delErr } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', note.id);
      if (delErr) throw delErr;
      if (editNoteItems.length > 0) {
        const rowsToInsert = editNoteItems.map((item) => ({
          order_id: note.id,
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
        if (note.status === 'aprobada') {
          for (const newItem of editNoteItems) {
            const { data: prodData } = await supabase
              .from('products')
              .select('stock_current')
              .eq('id', newItem.product_id)
              .single();
            if (prodData) {
              const newStock = Math.max(
                0,
                prodData.stock_current - newItem.quantity
              );
              await supabase
                .from('products')
                .update({ stock_current: newStock })
                .eq('id', newItem.product_id);
            }
          }
        }
      }
      showToastSuccess(
        `Nota N° ${note.transaction_number} actualizada correctamente.`
      );
      setEditingNoteId(null);
      fetchTabData();
      fetchGlobalCreateNeAndCierreData();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar los cambios de la nota.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAbono = async (e) => {
    e.preventDefault();
    if (!abonoModalNote) return;
    try {
      const montoNum = parseFloat(abonoMonto);
      if (isNaN(montoNum) || montoNum <= 0) {
        throw new Error('Ingrese un monto válido.');
      }
      const { data: userData } = await supabase.auth.getUser();
      const { error: abonoErr } = await supabase.from('order_payments').insert([
        {
          order_id: abonoModalNote.id,
          payment_date: abonoFecha,
          amount_usd: montoNum,
          payment_method: abonoMetodo,
          reference_number: abonoReferencia,
          created_by: userData?.user?.id,
        },
      ]);
      if (abonoErr) throw abonoErr;
      const nuevoAbonado =
        parseFloat(abonoModalNote.total_paid_usd || 0) + montoNum;
      const nuevoSaldo = Math.max(
        0,
        parseFloat(abonoModalNote.final_price_usd) - nuevoAbonado
      );
      const nuevoEstadoPago = nuevoSaldo === 0 ? 'cerrada' : 'abonada';
      const { error: noteErr } = await supabase
        .from('sales_orders')
        .update({
          total_paid_usd: nuevoAbonado,
          balance_due_usd: nuevoSaldo,
          payment_status: nuevoEstadoPago,
          closed_at: nuevoSaldo === 0 ? new Date() : null,
          updated_at: new Date(),
        })
        .eq('id', abonoModalNote.id);
      if (noteErr) throw noteErr;
      showToastSuccess(
        `Abono registrado con éxito. Nuevo Saldo: $${nuevoSaldo.toFixed(2)}`
      );
      setAbonoModalNote(null);
      setAbonoMonto('');
      setAbonoReferencia('');
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar el abono.');
    }
  };

  const handleValeAction = async (valeId, status) => {
    try {
      setLoading(true);
      const valeActual = vales.find((v) => v.id === valeId);
      const vendedorEmail = valeActual?.seller?.email;
      const vendedorNombre = valeActual?.seller?.full_name;
      // VALES INDEPENDIENTES: Sin N.E. asociada obligatoria
      const nroTransaccion = 'VALE-IND';
      const montoVale = Number(valeActual?.requested_amount_usd || 0).toFixed(
        2
      );
      const { error } = await supabase
        .from('vales')
        .update({ status: status.toLowerCase(), updated_at: new Date() })
        .eq('id', valeId);
      if (error) throw error;
      if (vendedorEmail && vendedorNombre) {
        try {
          const tipoNotif =
            status.toLowerCase() === 'aprobada'
              ? 'vale_approved'
              : 'vale_rejected';
          await supabase.functions.invoke('send-notification', {
            body: {
              type: tipoNotif,
              payload: {
                nroTransaccion: nroTransaccion,
                vendedorEmail: vendedorEmail,
                vendedorNombre: vendedorNombre,
                montoVale: montoVale,
                estadoVale: status.toLowerCase(),
              },
            },
          });
          console.log(
            `✅ Correo de vale ${status} enviado al vendedor:`,
            vendedorEmail
          );
        } catch (notifErr) {
          console.warn(
            'Error enviando correo de vale (no bloqueante):',
            notifErr
          );
        }
      } else {
        console.warn(
          '⚠️ No se pudo enviar correo de vale: faltan datos del vendedor',
          { vendedorEmail, vendedorNombre }
        );
      }
      showToastSuccess(`Vale actualizado a ${status}.`);
      fetchTabData();
    } catch (err) {
      setErrorMsg('Error al actualizar el estado del vale.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVale = async (valeId) => {
    if (!window.confirm('¿Está seguro de eliminar permanentemente este vale?'))
      return;
    try {
      setLoading(true);
      const { error } = await supabase.from('vales').delete().eq('id', valeId);
      if (error) throw error;
      showToastSuccess('Vale eliminado correctamente.');
      fetchTabData();
    } catch (err) {
      setErrorMsg('Error al eliminar el vale.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePenalty = async (penId) => {
    if (
      !window.confirm(
        '¿Está seguro de eliminar permanentemente esta penalización?'
      )
    )
      return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('penalties')
        .delete()
        .eq('id', penId);
      if (error) throw error;
      showToastSuccess('Penalización eliminada correctamente.');
      fetchTabData();
    } catch (err) {
      setErrorMsg('Error al eliminar penalización.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAssignPenaltyWithAbono = async () => {
    if (!assignTargetUserId) return alert('Seleccione un usuario.');
    if (!assignLinkedOrderId)
      return alert('Seleccione la nota de entrega de dicho usuario.');
    const selOrd = allOrdersList.find(
      (o) => String(o.id) === String(assignLinkedOrderId)
    );
    const saldoOrd = Number(selOrd?.balance_due_usd || 0);
    const amt = Number(assignAmountUsd);
    if (isNaN(amt) || amt <= 0)
      return alert('Ingrese un monto de penalización válido.');
    const finalAmt = Math.min(amt, saldoOrd);
    if (finalAmt <= 0)
      return alert(
        'La nota de entrega seleccionada no tiene saldo pendiente o es 0.'
      );
    const vendedorProfile = sellersList.find(
      (s) => String(s.id) === String(assignTargetUserId)
    );
    const vendedorEmail = vendedorProfile?.email;
    const vendedorNombre = vendedorProfile?.full_name || 'Vendedor';
    const nroTransaccion = selOrd?.transaction_number || 'N/A';
    const clienteNombre = selOrd?.client?.name || 'Cliente';
    const motivoPenalizacion =
      assignReason || `Cargo por incumplimiento N.E. #${nroTransaccion}`;
    setLoading(true);
    try {
      const penaltyPayload = {
        seller_id: assignTargetUserId,
        order_id: assignLinkedOrderId,
        amount: finalAmt,
        reason: motivoPenalizacion,
        status: 'pendiente',
      };
      const { error: penErr } = await supabase
        .from('penalties')
        .insert([penaltyPayload]);
      if (penErr) throw penErr;
      if (vendedorEmail) {
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'new_penalty',
              payload: {
                nroTransaccion: nroTransaccion,
                vendedorEmail: vendedorEmail,
                vendedorNombre: vendedorNombre,
                clienteNombre: clienteNombre,
                montoPenalizacion: finalAmt.toFixed(2),
                motivo: motivoPenalizacion,
              },
            },
          });
          console.log(
            '✅ Correo de penalización enviado al vendedor:',
            vendedorEmail
          );
        } catch (notifErr) {
          console.warn(
            'Error enviando correo de penalización (no bloqueante):',
            notifErr
          );
        }
      } else {
        console.warn(
          '⚠️ No se pudo enviar correo de penalización: faltan datos del vendedor',
          { vendedorEmail }
        );
      }
      let msg = `Penalización de $${finalAmt.toFixed(
        2
      )} registrada con Estado: PENDIENTE y vendedor notificado.`;
      if (finalAmt < amt) {
        msg += `(Ajustada al saldo máximo de $${saldoOrd.toFixed(2)})`;
      }
      showToastSuccess(msg);
      setAssignTargetUserId('');
      setAssignAmountUsd('');
      setAssignReason('');
      setAssignLinkedOrderId('');
      setValesSubTab('penalidades_lista');
      await fetchTabData();
    } catch (err) {
      setErrorMsg('Error al registrar penalización: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // VALES INDEPENDIENTES: Asignación sin order_id obligatorio
  const handleAdminAssignVale = async () => {
    if (!assignTargetUserId) return alert('Seleccione un usuario.');
    const amt = Number(assignAmountUsd);
    if (isNaN(amt) || amt <= 0) return alert('Monto inválido.');
    setLoading(true);
    try {
      const payload = {
        seller_id: assignTargetUserId,
        requested_amount_usd: amt,
        estimated_commission_usd: 0, // No depende de orden
        status: 'aprobada',
        order_id: null, // Independiente
      };
      const { error } = await supabase.from('vales').insert([payload]);
      if (error) throw error;
      showToastSuccess(
        `Adelanto/Vale de $${amt.toFixed(2)} asignado y aprobado.`
      );
      setAssignTargetUserId('');
      setAssignAmountUsd('');
      setAssignReason('');
      setAssignLinkedOrderId('');
      await fetchTabData();
    } catch (err) {
      setErrorMsg('Error al asignar vale: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const editingNote =
    cobranzaNotes.find((n) => n.id === editingNoteId) ||
    pendingNotes.find((n) => n.id === editingNoteId);

  const filteredProducts = editNoteProductsList.filter(
    (p) =>
      (!p.category ||
        p.category.toLowerCase() === editNoteCategory.toLowerCase()) &&
      (p.description
        ?.toLowerCase()
        .includes(editNoteSearchProd.toLowerCase()) ||
        p.code?.toLowerCase().includes(editNoteSearchProd.toLowerCase()))
  );

  const editTotalSinDesc = editNoteItems.reduce(
    (acc, item) => acc + item.unit_price_usd * item.quantity,
    0
  );
  const editPrecioFinal = editNoteItems.reduce(
    (acc, item) => acc + item.total_line_usd,
    0
  );
  const editMontoAhorrado = editTotalSinDesc - editPrecioFinal;

  const pendingNotifsCount = paymentNotifications.filter(
    (n) => n.status === 'pending'
  ).length;
  const totalPendingNotifsAmount = paymentNotifications
    .filter((n) => n.status === 'pending')
    .reduce((acc, n) => acc + Number(n.amount_usd || 0), 0);

  const filteredHistory = paymentHistory.filter((item) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.user?.full_name?.toLowerCase().includes(q)
    );
  });

  const filteredPaymentsHistory = paymentsHistoricalList.filter((item) => {
    if (!paymentsHistorySearch.trim()) return true;
    const q = paymentsHistorySearch.toLowerCase();
    return (
      String(item.client_name || '')
        .toLowerCase()
        .includes(q) ||
      String(item.reference_number || '')
        .toLowerCase()
        .includes(q) ||
      String(item.transaction_folio || '')
        .toLowerCase()
        .includes(q) ||
      String(item.payment_method || '')
        .toLowerCase()
        .includes(q)
    );
  });

  const selectedTargetUserOrders = allOrdersList.filter(
    (o) => String(o.seller_id || o.seller?.id) === String(assignTargetUserId)
  );

  // CÁLCULO DE TOTALES GLOBALES PARA RESUMEN
  const totalCycleValesDeduct = liquidaciones.reduce((sum, usr) => {
    const vList = getApprovedValesForUserAndCycle(usr.id);
    return (
      sum +
      vList.reduce((acc, v) => acc + Number(v.requested_amount_usd || 0), 0)
    );
  }, 0);

  const totalCyclePenaltiesDeduct = liquidaciones.reduce((sum, usr) => {
    const pList = getApprovedPenaltiesForUserAndCycle(usr.id);
    return sum + pList.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, 0);

  const formatBs = (num) => {
    const val = Number(num || 0);
    return val.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({}, '', url.toString());
  };

  const tabsData = [
    { id: 'crear_ne', label: 'Crear N.E.', icon: Plus },
    { id: 'aprobaciones', label: 'Pendientes por Aprobar', icon: Clock },
    { id: 'cobranza', label: 'Gestión de Cobranza', icon: DollarSign },
    {
      id: 'vales_penalizaciones',
      label: 'Vales y Penalización',
      icon: CreditCard,
    },
    {
      id: 'quincena',
      label: 'Cierre de Ciclo Quincenal',
      icon: Calendar,
    },
  ];

  const tabContentWrapperStyle = {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '600px',
  };

  const todayISO = new Date().toISOString().split('T')[0];

  // --- RENDER HELPERS FOR MOBILE CARDS (PRODUCTS) ---
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
      {/* --- ESTILOS RESPONSIVOS (E) --- */}
      <style>{`.admin-tabs-desktop { display: flex; gap: 8px; border-bottom: 2px solid #e5e7eb; margin-bottom: 24px; overflow-x: auto; } .admin-tabs-mobile { display: none; position: relative; margin-bottom: 24px; } .admin-mobile-trigger { width: 100%; padding: 12px 16px; background: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; color: #111827; font-size: 14px; } .admin-mobile-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 1000; overflow: hidden; } .admin-mobile-item { padding: 12px 16px; display: flex; alignItems: center; gap: 10px; cursor: pointer; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 14px; transition: background 0.15s; } .admin-mobile-item:last-child { border-bottom: none; } .admin-mobile-item:hover { background: #fef2f2; } .admin-mobile-item.active { background: #fef2f2; color: #dc2626; font-weight: 700; } .admin-aging-section { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; } .admin-aging-title { font-size: 13px; font-weight: 800; color: #78350f; margin-bottom: 10px; display: flex; alignItems: center; gap: 8px; } .admin-aging-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #ffffff; border: 1px solid #fde68a; border-radius: 6px; margin-bottom: 6px; font-size: 12px; } .admin-aging-item:last-child { margin-bottom: 0; } .admin-days-30 { text-decoration: underline; text-decoration-color: #eab308; text-decoration-thickness: 3px; text-underline-offset: 3px; } .admin-days-45 { text-decoration: underline; text-decoration-color: #f97316; text-decoration-thickness: 3px; text-underline-offset: 3px; } .admin-days-60 { text-decoration: underline; text-decoration-color: #dc2626; text-decoration-thickness: 3px; text-underline-offset: 3px; } .admin-table-desktop { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; } .admin-mobile-cards { display: none; } .admin-mobile-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; marginBottom: 10px; boxShadow: 0 1px 2px rgba(0,0,0,0.05); } .admin-mobile-card-header { font-size: 14px; font-weight: 800; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px; } .admin-mobile-card-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 12px; border-bottom: 1px dashed #f3f4f6; } .admin-mobile-card-row:last-child { border-bottom: none; } .admin-mobile-card-label { color: #6b7280; font-weight: 600; font-size: 11px; } .admin-mobile-card-value { color: #111827; font-weight: 600; text-align: right; max-width: 60%; word-break: break-word; } .admin-mobile-card-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; } @media (max-width: 768px) { .admin-tabs-desktop { display: none !important; } .admin-tabs-mobile { display: block !important; } .admin-table-desktop { display: none !important; } .admin-mobile-cards { display: block !important; } .admin-mobile-card-actions button { font-size: 10px !important; padding: 5px 8px !important; } .admin-tab-button-desktop { padding: 10px 12px !important; font-size: 12px !important; } .admin-action-btn-mobile { padding: 5px 8px !important; font-size: 10px !important; } } .floating-toast-success { position: fixed !important; top: 24px !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 9999 !important; width: 90% !important; max-width: 500px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; } .floating-toast-error { position: fixed !important; top: 24px !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 9999 !important; width: 90% !important; max-width: 500px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; }`}</style>

      {/* F. NOTIFICACIONES GLOBALES FLOTANTES */}
      {errorMsg && (
        <div
          className="floating-toast-error"
          style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: '600',
            border: '1px solid #fecaca',
          }}
        >
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div
          className="floating-toast-success"
          style={{
            padding: '16px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: '600',
            border: '1px solid #a7f3d0',
          }}
        >
          <Check size={20} /> {successMsg}
        </div>
      )}
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
            <ShieldCheck color="#dc2626" size={28} /> Módulo Administrativo
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Aprobación de operaciones, gestión de cobranza unificada y cierres
            financieros.
          </p>
        </div>
      </div>

      {/* --- MENÚ ESCRITORIO (E) --- */}
      <div className="admin-tabs-desktop">
        {tabsData.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="admin-tab-button-desktop"
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

      {/* --- MENÚ MÓVIL DROPDOWN (E) --- */}
      <div className="admin-tabs-mobile" ref={mobileMenuRef}>
        <div
          className="admin-mobile-trigger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(() => {
              const current = tabsData.find((t) => t.id === activeTab);
              const Icon = current?.icon || Plus;
              return (
                <>
                  <Icon size={18} color="#dc2626" />
                  {current?.label || 'Seleccionar módulo'}
                </>
              );
            })()}
          </span>
          <ChevronDown
            size={18}
            style={{
              transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>
        {isMobileMenuOpen && (
          <div className="admin-mobile-dropdown">
            {tabsData.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  className={`admin-mobile-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    handleTabChange(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon size={18} color={isActive ? '#dc2626' : '#4b5563'} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <Check
                      size={16}
                      color="#dc2626"
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PESTAÑA 1: CREAR N.E. */}
      {activeTab === 'crear_ne' && (
        <div style={tabContentWrapperStyle}>
          {/* SECCIÓN DESPLEGABLE: CONFIGURACIÓN GLOBAL DE N.E. */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#f9fafb',
                border: 'none',
                borderBottom: isConfigOpen ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#111827',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Sliders size={18} color="#111827" />
                <span>Configuración Global de Notas de Entrega</span>
              </div>
              {isConfigOpen ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
            {isConfigOpen && (
              <div style={{ padding: '16px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      % Descuento (Pago $ - 53.38)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={globalDiscount53}
                      onChange={(e) =>
                        setGlobalDiscount53(Number(e.target.value))
                      }
                      style={{
                        width: '100%',
                        padding: '6px',
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      % Descuento (Pago Bs - 23.08)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={globalDiscount23}
                      onChange={(e) =>
                        setGlobalDiscount23(Number(e.target.value))
                      }
                      style={{
                        width: '100%',
                        padding: '6px',
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      % Descuento (10)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={globalDiscount10}
                      onChange={(e) =>
                        setGlobalDiscount10(Number(e.target.value))
                      }
                      style={{
                        width: '100%',
                        padding: '6px',
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      % Descuento (0)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={globalDiscount0}
                      onChange={(e) =>
                        setGlobalDiscount0(Number(e.target.value))
                      }
                      style={{
                        width: '100%',
                        padding: '6px',
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                      }}
                    >
                      Términos y Condiciones (Plantilla)
                    </label>
                    <textarea
                      rows="3"
                      value={globalTerms}
                      onChange={(e) => setGlobalTerms(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleSaveGlobalSettings}
                    disabled={configLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Save size={14} />{' '}
                    {configLoading ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </div>
            )}
          </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                <input
                  type="checkbox"
                  checked={manualFolioMode}
                  onChange={(e) => setManualFolioMode(e.target.checked)}
                />
                Forzar Folio Específico en N.E. actual
              </label>
              {manualFolioMode && (
                <input
                  type="number"
                  placeholder="Ej. 1000"
                  value={specificFolioNum}
                  onChange={(e) => setSpecificFolioNum(e.target.value)}
                  style={{
                    width: '90px',
                    padding: '5px 8px',
                    fontSize: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                  }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderLeft: '1px solid #cbd5e1',
                  paddingLeft: '12px',
                }}
              >
                <Sliders size={14} color="#111827" />
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Reiniciar Secuencia Masiva:
                </span>
                <input
                  type="number"
                  placeholder="Nuevo arranque"
                  value={sequenceResetTargetNum}
                  onChange={(e) => setSequenceResetTargetNum(e.target.value)}
                  style={{
                    width: '95px',
                    padding: '5px 8px',
                    fontSize: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplySequenceReset}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Aplicar RPC
                </button>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                Fecha de Emisión
              </label>
              <input
                type="date"
                value={neFecha}
                max={todayISO}
                onChange={(e) => setNeFecha(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '10px', color: '#6b7280' }}>
                Predeterminada: hoy. Permitidas: hasta hoy.
              </span>
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
                Asignar N.E. a Usuario
              </label>
              <select
                value={neTargetUserId}
                onChange={(e) => setNeTargetUserId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  backgroundColor: '#FFFBEB',
                  fontWeight: '700',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Seleccionar usuario asignado...</option>
                {sellersList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.role})
                  </option>
                ))}
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
                Cliente
              </label>
              <SearchableDropdown
                options={allClientsList.map((c) => ({
                  value: c.id,
                  label: `${c.name} ${
                    c.profiles?.full_name
                      ? `[Asig. Orig: ${c.profiles.full_name}]`
                      : ''
                  }`,
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
                Categoría
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
                % Descuento (Pago Bs)
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
                <option value="53.38">{globalDiscount53}% Pagará en $</option>
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
              Agregar Productos (con Buscador en Tiempo Real)
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
                  options={filteredCreateNeProducts.map((p) => {
                    const desc =
                      p.price_usd * (1 - porcentajeDescuentoNe / 100);
                    return {
                      value: p.id,
                      label: `${p.description} | Stock: ${
                        p.stock_current
                      } | Base: $${Number(p.price_usd).toFixed(
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
                onClick={handleAddToCartCreateNe}
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
                <h2 style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}>
                  FENIX AUTO PART C.A (ADMIN DIRECTO)
                </h2>
                <p style={{ fontWeight: '700', margin: '2px 0' }}>
                  RIF: J-50261925-2
                </p>
                <p style={{ margin: '6px 0 0 0' }}>
                  <strong>Cliente: </strong>{' '}
                  {selectedClientDataNe?.name || '---'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0 }}>
                  <strong>Fecha Emisión: </strong>{' '}
                  {new Date(neFecha).toLocaleDateString()}
                </p>
                <p style={{ margin: '2px 0' }}>
                  <strong>Folio Proyectado: </strong> #{estimatedNextFolio}
                </p>
                <p style={{ margin: '2px 0' }}>
                  <strong>Asignado a: </strong>{' '}
                  {sellersList.find((s) => s.id === neTargetUserId)
                    ?.full_name || 'Sin Asignar'}
                </p>
              </div>
            </div>
            <div className="admin-table-desktop-wrapper">
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
                          No hay productos añadidos.
                        </td>
                      </tr>
                    ) : (
                      neCart.map((item) => (
                        <tr
                          key={item.product_id}
                          style={{ borderBottom: '1px solid #E5E7EB' }}
                        >
                          <td
                            style={{ padding: '8px', fontFamily: 'monospace' }}
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
                            ${Number(item.unit_price_usd).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: '8px',
                              textAlign: 'right',
                              color: '#B45309',
                            }}
                          >
                            ${Number(item.discounted_unit_price_usd).toFixed(2)}
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
                              onClick={() =>
                                handleRemoveFromCartCreateNe(item.product_id)
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
            </div>
            <div className="admin-mobile-cards">
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
                renderProductCards(neCart, true, handleRemoveFromCartCreateNe)
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
                  <strong>${totalSinDescuentoNe.toFixed(2)}</strong>
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
                    {getDiscountPercent(neTipoPago)}% de descuento aplicado:{' '}
                  </span>
                  <strong>-${montoAhorradoNe.toFixed(2)}</strong>
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
                    ${precioFinalNe.toFixed(2)}
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
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCreateDirectNE}
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
                <Send size={16} />{' '}
                {loading ? 'Creando...' : 'Crear y Asignar N.E. Directa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA APROBACIONES */}
      {activeTab === 'aprobaciones' && (
        <div style={tabContentWrapperStyle}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflowX: 'auto',
            }}
          >
            <table className="admin-table-desktop">
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <th style={{ padding: '12px 16px' }}>Ver N.E</th>
                  <th style={{ padding: '12px 16px' }}>Fecha</th>
                  <th style={{ padding: '12px 16px' }}>N° Transacción</th>
                  <th style={{ padding: '12px 16px' }}>Vendedor</th>
                  <th style={{ padding: '12px 16px' }}>Cliente</th>
                  <th style={{ padding: '12px 16px' }}>Modalidad</th>
                  <th style={{ padding: '12px 16px' }}>Categoría</th>
                  <th style={{ padding: '12px 16px' }}>Total ($)</th>
                  <th style={{ padding: '12px 16px' }}>GPS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && !editingNoteId ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{ textAlign: 'center', padding: '20px' }}
                    >
                      Cargando solicitudes...
                    </td>
                  </tr>
                ) : pendingNotes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#6b7280',
                      }}
                    >
                      No hay solicitudes de aprobación pendientes.
                    </td>
                  </tr>
                ) : (
                  pendingNotes.map((note) => {
                    const lat = note.latitude;
                    const lng = note.longitude;
                    const hasCoords =
                      lat !== null &&
                      lng !== null &&
                      lat !== undefined &&
                      lng !== undefined;
                    const mapsUrl = hasCoords
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${lat},${lng}`
                        )}`
                      : null;
                    return (
                      <tr
                        key={note.id}
                        style={{ borderBottom: '1px solid #e5e7eb' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => handleOpenEditNEPanel(note, false)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor:
                                editingNoteId === note.id
                                  ? '#111827'
                                  : '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Ver N.E
                          </button>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {new Date(note.created_at).toLocaleDateString()}
                        </td>
                        <td
                          style={{ padding: '12px 16px', fontWeight: 'bold' }}
                        >
                          #{note.transaction_number}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {note.seller?.full_name || 'Vendedor'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {note.client?.name || 'Cliente'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor:
                                String(note.payment_discount) === '53.38'
                                  ? '#fef3c7'
                                  : String(note.payment_discount) === '23.08'
                                  ? '#e0f2fe'
                                  : String(note.payment_discount) === '10'
                                  ? '#fff7ed'
                                  : '#f3f4f6',
                              color:
                                String(note.payment_discount) === '53.38'
                                  ? '#d97706'
                                  : String(note.payment_discount) === '23.08'
                                  ? '#0369a1'
                                  : String(note.payment_discount) === '10'
                                  ? '#c2410c'
                                  : '#374151',
                            }}
                          >
                            {String(note.payment_discount) === '53.38'
                              ? `${globalDiscount53}% ($)`
                              : String(note.payment_discount) === '23.08'
                              ? `${globalDiscount23}% (Bs)`
                              : String(note.payment_discount) === '10'
                              ? `${globalDiscount10}% (Esp)`
                              : `${globalDiscount0}% (0)`}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {note.category}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontWeight: 'bold',
                            color: '#059669',
                          }}
                        >
                          ${Number(note.final_price_usd).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {hasCoords ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 8px',
                                  backgroundColor: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <MapPin size={13} /> Ver mapa
                              </a>
                              <button
                                onClick={() => handleClearNoteGPS(note)}
                                title="Eliminar coordenadas GPS"
                                style={{
                                  padding: '5px',
                                  backgroundColor: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash size={13} />
                              </button>
                            </div>
                          ) : (
                            <span
                              style={{ fontSize: '12px', color: '#9ca3af' }}
                            >
                              Sin GPS
                            </span>
                          )}
                        </td>
                        <td
                          style={{ padding: '12px 16px', textAlign: 'center' }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '8px',
                            }}
                          >
                            <button
                              onClick={() => handleApproveNote(note)}
                              title="Aprobar"
                              style={{
                                padding: '6px',
                                backgroundColor: '#d1fae5',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              <CheckCircle size={16} color="#059669" />
                            </button>
                            <button
                              onClick={() => setRejectModalNote(note)}
                              title="Rechazar"
                              style={{
                                padding: '6px',
                                backgroundColor: '#fee2e2',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              <XCircle size={16} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="admin-mobile-cards">
              {loading && !editingNoteId ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6b7280',
                  }}
                >
                  Cargando solicitudes...
                </div>
              ) : pendingNotes.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6b7280',
                  }}
                >
                  No hay solicitudes de aprobación pendientes.
                </div>
              ) : (
                pendingNotes.map((note) => {
                  const lat = note.latitude;
                  const lng = note.longitude;
                  const hasCoords =
                    lat !== null &&
                    lng !== null &&
                    lat !== undefined &&
                    lng !== undefined;
                  const mapsUrl = hasCoords
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${lat},${lng}`
                      )}`
                    : null;
                  return (
                    <div key={note.id} className="admin-mobile-card">
                      <div className="admin-mobile-card-header">
                        N.E. #{note.transaction_number}
                      </div>
                      <div className="admin-mobile-card-row">
                        <span className="admin-mobile-card-label">Fecha</span>
                        <span className="admin-mobile-card-value">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="admin-mobile-card-row">
                        <span className="admin-mobile-card-label">
                          Vendedor
                        </span>
                        <span className="admin-mobile-card-value">
                          {note.seller?.full_name || 'Vendedor'}
                        </span>
                      </div>
                      <div className="admin-mobile-card-row">
                        <span className="admin-mobile-card-label">Cliente</span>
                        <span className="admin-mobile-card-value">
                          {note.client?.name || 'Cliente'}
                        </span>
                      </div>
                      <div className="admin-mobile-card-row">
                        <span className="admin-mobile-card-label">
                          Modalidad
                        </span>
                        <span className="admin-mobile-card-value">
                          {String(note.payment_discount) === '53.38'
                            ? `${globalDiscount53}% ($)`
                            : String(note.payment_discount) === '23.08'
                            ? `${globalDiscount23}% (Bs)`
                            : String(note.payment_discount) === '10'
                            ? `${globalDiscount10}% (Esp)`
                            : `${globalDiscount0}% (0)`}
                        </span>
                      </div>
                      <div className="admin-mobile-card-row">
                        <span className="admin-mobile-card-label">Total</span>
                        <span
                          className="admin-mobile-card-value"
                          style={{ color: '#059669', fontWeight: '700' }}
                        >
                          ${Number(note.final_price_usd).toFixed(2)}
                        </span>
                      </div>
                      <div className="admin-mobile-card-actions">
                        <button
                          onClick={() => handleOpenEditNEPanel(note, false)}
                          className="admin-action-btn-mobile"
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Ver N.E
                        </button>
                        {hasCoords && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-action-btn-mobile"
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f0fdf4',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              textDecoration: 'none',
                            }}
                          >
                            GPS
                          </a>
                        )}
                        <button
                          onClick={() => handleApproveNote(note)}
                          className="admin-action-btn-mobile"
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#d1fae5',
                            color: '#059669',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => setRejectModalNote(note)}
                          className="admin-action-btn-mobile"
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {editingNote && !isCobranzaNEModal && (
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
                    <h2
                      style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}
                    >
                      Panel Editable - Nota de Entrega #
                      {editingNote.transaction_number}
                    </h2>
                  </div>
                  <button
                    onClick={() => setEditingNoteId(null)}
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
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(240px, 1fr))',
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
                      <input
                        type="text"
                        disabled
                        value={editNoteClientName}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          backgroundColor: '#F3F4F6',
                          boxSizing: 'border-box',
                        }}
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
                        value={editNoteCategory}
                        onChange={(e) => setEditNoteCategory(e.target.value)}
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
                        value={editNotePaymentDiscount}
                        onChange={(e) => {
                          setEditNotePaymentDiscount(e.target.value);
                          handleEditNoteRecalculatePrices(e.target.value);
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
                        <option value="0">
                          {globalDiscount0}% Sin Descuento
                        </option>
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
                          options={filteredProducts.map((p) => {
                            const descPct = getDiscountPercent(
                              editNotePaymentDiscount
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
                          value={editNoteSelectedProdId}
                          onChange={setEditNoteSelectedProdId}
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
                          value={editNoteQuantity}
                          onChange={(e) => setEditNoteQuantity(e.target.value)}
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
                        onClick={handleEditNoteAddProduct}
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
                          <strong>Cliente: </strong> {editNoteClientName}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0 }}>
                          <strong>Fecha/Hora: </strong>{' '}
                          {new Date(editingNote.created_at).toLocaleString()}
                        </p>
                        <p style={{ margin: '2px 0' }}>
                          <strong>N° Transacción: </strong> #
                          {editingNote.transaction_number}
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
                          {editNoteItems.length === 0 ? (
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
                            editNoteItems.map((item) => (
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
                                <td
                                  style={{ padding: '8px', fontWeight: '600' }}
                                >
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
                                <td
                                  style={{ padding: '8px', textAlign: 'right' }}
                                >
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
                                  {Number(
                                    item.discounted_unit_price_usd
                                  ).toFixed(2)}
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
                                      handleEditNoteRemoveItem(item.product_id)
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
                      {editNoteItems.length === 0 ? (
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
                          editNoteItems,
                          true,
                          handleEditNoteRemoveItem
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
                          <strong>${editTotalSinDesc.toFixed(2)}</strong>
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
                            {getDiscountPercent(editNotePaymentDiscount)}% de
                            descuento aplicado:{' '}
                          </span>
                          <strong>-${editMontoAhorrado.toFixed(2)}</strong>
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
                            ${editPrecioFinal.toFixed(2)}
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
                        value={editNoteObservation}
                        onChange={(e) => setEditNoteObservation(e.target.value)}
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
                        onClick={() => handleSaveEditedNote(editingNote)}
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
                        Guardar Cambios N.E.
                      </button>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleApproveNote(editingNote)}
                          disabled={loading}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <CheckCircle size={16} /> Aprobar Nota
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectModalNote(editingNote)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <XCircle size={16} /> Rechazar Nota
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA COBRANZA */}
      {activeTab === 'cobranza' && (
        <div style={tabContentWrapperStyle}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            {[
              { id: 'control_ne', label: 'Control de N.E.' },
              { id: 'historico_pagos', label: 'Histórico de Pagos' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setCobranzaInternalTab(sub.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor:
                    cobranzaInternalTab === sub.id ? '#111827' : '#f3f4f6',
                  color: cobranzaInternalTab === sub.id ? '#fff' : '#4b5563',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
          {cobranzaInternalTab === 'control_ne' && (
            <>
              {agingNotes.length > 0 && (
                <div className="admin-aging-section">
                  <div className="admin-aging-title">
                    <AlertTriangle size={18} color="#d97706" />
                    Notas de Entrega con Antigüedad Crítica
                  </div>
                  {agingNotes.slice(0, 10).map((n) => {
                    let color = '#eab308';
                    let label = '30+ días';
                    if (n.days >= 60) {
                      color = '#dc2626';
                      label = '60+ días';
                    } else if (n.days >= 45) {
                      color = '#f97316';
                      label = '45+ días';
                    }
                    return (
                      <div key={n.id} className="admin-aging-item">
                        <div>
                          <strong>N.E. #{n.transaction_number}</strong> —{' '}
                          {n.client?.name || 'Cliente'}
                        </div>
                        <div
                          style={{
                            color: color,
                            fontWeight: '800',
                            fontSize: '12px',
                          }}
                        >
                          {n.days} días · {label}
                        </div>
                      </div>
                    );
                  })}
                  {agingNotes.length > 10 && (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#78350f',
                        marginTop: '8px',
                        fontStyle: 'italic',
                      }}
                    >
                      ...y {agingNotes.length - 10} notas más
                    </div>
                  )}
                </div>
              )}
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
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#374151',
                    }}
                  >
                    Total Abonos Pendientes en Notificaciones:
                  </span>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: '900',
                      color: '#059669',
                    }}
                  >
                    ${totalPendingNotifsAmount.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: '1 1 280px',
                    maxWidth: '380px',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%' }}>
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
                      value={cobranzaSearch}
                      onChange={(e) => setCobranzaSearch(e.target.value)}
                      placeholder="Filtrar N° N.E., cliente, vendedor..."
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
                <button
                  onClick={() => {
                    const notifModal =
                      document.getElementById('notif-modal-popup');
                    if (notifModal) notifModal.style.display = 'flex';
                  }}
                  style={{
                    position: 'relative',
                    padding: '8px 16px',
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Bell size={15} /> Notif. Abono
                  {pendingNotifsCount > 0 && (
                    <span
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        borderRadius: '50%',
                        padding: '1px 6px',
                        fontSize: '11px',
                        fontWeight: '900',
                      }}
                    >
                      {pendingNotifsCount}
                    </span>
                  )}
                </button>
              </div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflowX: 'auto',
                }}
              >
                <table className="admin-table-desktop">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      {[
                        { field: 'transaction_number', label: 'Transacción' },
                        { field: 'created_at', label: 'Días Trans.' },
                        { field: 'client_name', label: 'Cliente' },
                        { field: 'seller_id', label: 'Vendedor' },
                        { field: 'payment_discount', label: 'Modalidad' },
                        { field: 'final_price_usd', label: 'Total ($)' },
                        { field: 'total_paid_usd', label: 'Abonado ($)' },
                        { field: 'balance_due_usd', label: 'Saldo ($)' },
                        {
                          field: 'payment_status',
                          label: 'Indicador / Estado',
                        },
                      ].map((col) => (
                        <th
                          key={col.field}
                          onClick={() => handleSortCobranza(col.field)}
                          style={{
                            padding: '10px 14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            userSelect: 'none',
                            backgroundColor:
                              cobranzaSortField === col.field
                                ? '#E5E7EB'
                                : 'transparent',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {col.label}
                            <ArrowUpDown size={12} color="#6B7280" />
                          </div>
                        </th>
                      ))}
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCobranzaNotes.length === 0 ? (
                      <tr>
                        <td
                          colSpan="10"
                          style={{
                            textAlign: 'center',
                            padding: '24px',
                            color: '#6b7280',
                          }}
                        >
                          No se encontraron notas de cobranza con los filtros
                          aplicados.
                        </td>
                      </tr>
                    ) : (
                      sortedCobranzaNotes.map((note) => {
                        const rowNotif = paymentNotifications.find(
                          (n) =>
                            n.order_id === note.id && n.status === 'pending'
                        );
                        const daysElapsed = calcDaysElapsed(note.created_at);
                        let daysClass = '';
                        if (daysElapsed >= 60) daysClass = 'admin-days-60';
                        else if (daysElapsed >= 45) daysClass = 'admin-days-45';
                        else if (daysElapsed >= 30) daysClass = 'admin-days-30';
                        return (
                          <tr
                            key={note.id}
                            style={{ borderBottom: '1px solid #e5e7eb' }}
                          >
                            <td
                              style={{
                                padding: '10px 14px',
                                fontWeight: 'bold',
                              }}
                            >
                              #{note.transaction_number}
                            </td>
                            <td
                              className={daysClass}
                              style={{
                                padding: '10px 14px',
                                fontWeight: '700',
                                color: daysElapsed > 15 ? '#dc2626' : '#4b5563',
                              }}
                            >
                              {daysElapsed >= 0 ? `${daysElapsed} d` : '0 d'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {note.client?.name || 'Cliente'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {note.seller?.full_name || 'Vendedor'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {String(note.payment_discount) === '53.38'
                                ? `${globalDiscount53}% ($)`
                                : String(note.payment_discount) === '23.08'
                                ? `${globalDiscount23}% (Bs)`
                                : String(note.payment_discount) === '10'
                                ? `${globalDiscount10}% (Esp)`
                                : `${globalDiscount0}% (0)`}
                            </td>
                            <td
                              style={{
                                padding: '10px 14px',
                                fontWeight: '600',
                              }}
                            >
                              ${Number(note.final_price_usd).toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: '10px 14px',
                                color: '#059669',
                                cursor: 'pointer',
                                textDecoration: 'underline dotted',
                              }}
                              onClick={() => handleOpenEditAbonoModal(note)}
                              title="Clic para editar monto abonado"
                            >
                              ${Number(note.total_paid_usd || 0).toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: '10px 14px',
                                color: '#dc2626',
                                fontWeight: 'bold',
                              }}
                            >
                              ${Number(note.balance_due_usd).toFixed(2)}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '3px',
                                }}
                              >
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    backgroundColor:
                                      note.payment_status === 'cerrada'
                                        ? '#d1fae5'
                                        : '#fef3c7',
                                    color:
                                      note.payment_status === 'cerrada'
                                        ? '#065f46'
                                        : '#b45309',
                                    width: 'fit-content',
                                  }}
                                >
                                  {note.payment_status.toUpperCase()}
                                </span>
                                {rowNotif && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      color: '#b91c1c',
                                      fontWeight: '700',
                                      backgroundColor: '#fee2e2',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      width: 'fit-content',
                                    }}
                                  >
                                    Notif: $
                                    {Number(rowNotif.amount_usd).toFixed(2)}{' '}
                                    pend.
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: '10px 14px',
                                textAlign: 'center',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '6px',
                                  justifyContent: 'center',
                                  flexWrap: 'wrap',
                                }}
                              >
                                {rowNotif && (
                                  <button
                                    onClick={() =>
                                      handleOpenViewNotifModal(rowNotif)
                                    }
                                    style={{
                                      padding: '5px 8px',
                                      backgroundColor: '#1e40af',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: 'bold',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Ver Notif.
                                  </button>
                                )}
                                {note.payment_status !== 'cerrada' && (
                                  <button
                                    onClick={() => {
                                      setAbonoModalNote(note);
                                      setManualAbonoForm({
                                        payment_date: new Date()
                                          .toISOString()
                                          .split('T')[0],
                                        amount_usd: '',
                                        payment_method: 'Pago Móvil',
                                        reference_number: '',
                                      });
                                      setManualAbonoFile(null);
                                    }}
                                    style={{
                                      padding: '5px 8px',
                                      backgroundColor: '#059669',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: 'bold',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    + Abono
                                  </button>
                                )}
                                <button
                                  onClick={() => setModalGpsNote(note)}
                                  style={{
                                    padding: '5px 8px',
                                    backgroundColor: '#1e3a8a',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <MapPin size={12} /> GPS
                                </button>
                                <button
                                  onClick={() =>
                                    handleOpenEditNEPanel(note, true)
                                  }
                                  style={{
                                    padding: '5px 8px',
                                    backgroundColor: '#4f46e5',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Edit size={12} /> Ver N.E
                                </button>
                                <button
                                  onClick={() => handleDownloadPDF(note)}
                                  disabled={loading}
                                  style={{
                                    padding: '5px 8px',
                                    backgroundColor: '#881337',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Download size={12} /> PDF
                                </button>
                                <button
                                  onClick={() => handleDeleteNoteComplete(note)}
                                  style={{
                                    padding: '5px 8px',
                                    backgroundColor: '#dc2626',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Trash2 size={12} /> Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                <div className="admin-mobile-cards">
                  {sortedCobranzaNotes.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '24px',
                        color: '#6b7280',
                      }}
                    >
                      No se encontraron notas de cobranza.
                    </div>
                  ) : (
                    sortedCobranzaNotes.map((note) => {
                      const rowNotif = paymentNotifications.find(
                        (n) => n.order_id === note.id && n.status === 'pending'
                      );
                      const daysElapsed = calcDaysElapsed(note.created_at);
                      let daysClass = '';
                      if (daysElapsed >= 60) daysClass = 'admin-days-60';
                      else if (daysElapsed >= 45) daysClass = 'admin-days-45';
                      else if (daysElapsed >= 30) daysClass = 'admin-days-30';
                      return (
                        <div key={note.id} className="admin-mobile-card">
                          <div className="admin-mobile-card-header">
                            N.E. #{note.transaction_number}
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">
                              Días Transcurridos
                            </span>
                            <span
                              className={`admin-mobile-card-value ${daysClass}`}
                              style={{
                                color: daysElapsed > 15 ? '#dc2626' : '#4b5563',
                                fontWeight: '700',
                              }}
                            >
                              {daysElapsed >= 0
                                ? `${daysElapsed} días`
                                : '0 días'}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">
                              Cliente
                            </span>
                            <span className="admin-mobile-card-value">
                              {note.client?.name || 'Cliente'}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">
                              Vendedor
                            </span>
                            <span className="admin-mobile-card-value">
                              {note.seller?.full_name || 'Vendedor'}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">
                              Modalidad
                            </span>
                            <span className="admin-mobile-card-value">
                              {String(note.payment_discount) === '53.38'
                                ? `${globalDiscount53}% ($)`
                                : String(note.payment_discount) === '23.08'
                                ? `${globalDiscount23}% (Bs)`
                                : String(note.payment_discount) === '10'
                                ? `${globalDiscount10}% (Esp)`
                                : `${globalDiscount0}% (0)`}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">
                              Total
                            </span>
                            <span className="admin-mobile-card-value">
                              ${Number(note.final_price_usd).toFixed(2)}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">
                              Abonado
                            </span>
                            <span
                              className="admin-mobile-card-value"
                              style={{ color: '#059669' }}
                            >
                              ${Number(note.total_paid_usd || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">
                              Saldo
                            </span>
                            <span
                              className="admin-mobile-card-value"
                              style={{ color: '#dc2626', fontWeight: '700' }}
                            >
                              ${Number(note.balance_due_usd).toFixed(2)}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">
                              Estado
                            </span>
                            <span
                              className="admin-mobile-card-value"
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                backgroundColor:
                                  note.payment_status === 'cerrada'
                                    ? '#d1fae5'
                                    : '#fef3c7',
                                color:
                                  note.payment_status === 'cerrada'
                                    ? '#065f46'
                                    : '#b45309',
                              }}
                            >
                              {note.payment_status.toUpperCase()}
                            </span>
                          </div>
                          {rowNotif && (
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                Notificación
                              </span>
                              <span
                                className="admin-mobile-card-value"
                                style={{ color: '#b91c1c', fontWeight: '700' }}
                              >
                                ${Number(rowNotif.amount_usd).toFixed(2)} pend.
                              </span>
                            </div>
                          )}
                          <div className="admin-mobile-card-actions">
                            {rowNotif && (
                              <button
                                onClick={() =>
                                  handleOpenViewNotifModal(rowNotif)
                                }
                                className="admin-action-btn-mobile"
                                style={{
                                  padding: '5px 8px',
                                  backgroundColor: '#1e40af',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                }}
                              >
                                Ver Notif.
                              </button>
                            )}
                            {note.payment_status !== 'cerrada' && (
                              <button
                                onClick={() => {
                                  setAbonoModalNote(note);
                                  setManualAbonoForm({
                                    payment_date: new Date()
                                      .toISOString()
                                      .split('T')[0],
                                    amount_usd: '',
                                    payment_method: 'Pago Móvil',
                                    reference_number: '',
                                  });
                                  setManualAbonoFile(null);
                                }}
                                className="admin-action-btn-mobile"
                                style={{
                                  padding: '5px 8px',
                                  backgroundColor: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                }}
                              >
                                + Abono
                              </button>
                            )}
                            <button
                              onClick={() => setModalGpsNote(note)}
                              className="admin-action-btn-mobile"
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#1e3a8a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              GPS
                            </button>
                            <button
                              onClick={() => handleOpenEditNEPanel(note, true)}
                              className="admin-action-btn-mobile"
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#4f46e5',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Ver N.E
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(note)}
                              disabled={loading}
                              className="admin-action-btn-mobile"
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#881337',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              PDF
                            </button>
                            <button
                              onClick={() => handleDeleteNoteComplete(note)}
                              className="admin-action-btn-mobile"
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
          {cobranzaInternalTab === 'historico_pagos' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
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
                    position: 'relative',
                    width: '320px',
                    maxWidth: '100%',
                  }}
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
                    value={paymentsHistorySearch}
                    onChange={(e) => setPaymentsHistorySearch(e.target.value)}
                    placeholder="Buscar cliente, referencia, folio..."
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
                <button
                  onClick={() =>
                    setBulkDeleteModal({ ...bulkDeleteModal, open: true })
                  }
                  disabled={loading || filteredPaymentsHistory.length === 0}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: filteredPaymentsHistory.length === 0 ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={14} /> Borrar Historial
                </button>
              </div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflowX: 'auto',
                }}
              >
                <table className="admin-table-desktop">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      <th style={{ padding: '10px 14px' }}>Cliente</th>
                      <th style={{ padding: '10px 14px' }}>Fecha Pago</th>
                      <th style={{ padding: '10px 14px' }}>Monto ($)</th>
                      <th style={{ padding: '10px 14px' }}>Método</th>
                      <th style={{ padding: '10px 14px' }}>N° Referencia</th>
                      <th style={{ padding: '10px 14px' }}>
                        Transacción (Folio)
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>
                        Adjunto
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{ textAlign: 'center', padding: '20px' }}
                        >
                          Cargando histórico...
                        </td>
                      </tr>
                    ) : filteredPaymentsHistory.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{
                            textAlign: 'center',
                            padding: '24px',
                            color: '#6b7280',
                          }}
                        >
                          No hay registros en el histórico de pagos
                          independientes.
                        </td>
                      </tr>
                    ) : (
                      filteredPaymentsHistory.map((item) => (
                        <tr
                          key={item.id}
                          style={{ borderBottom: '1px solid #e5e7eb' }}
                        >
                          <td
                            style={{ padding: '10px 14px', fontWeight: '600' }}
                          >
                            {item.client_name}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {new Date(item.payment_date).toLocaleDateString()}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              fontWeight: 'bold',
                              color: '#059669',
                            }}
                          >
                            ${Number(item.amount_usd).toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {item.payment_method}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              fontFamily: 'monospace',
                            }}
                          >
                            {item.reference_number}
                          </td>
                          <td
                            style={{ padding: '10px 14px', fontWeight: '600' }}
                          >
                            #{item.transaction_folio}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'center',
                            }}
                          >
                            {item.receipt_image_url ? (
                              <button
                                onClick={() =>
                                  setImagePreviewModal(item.receipt_image_url)
                                }
                                style={{
                                  padding: '4px',
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                                title="Ver comprobante"
                              >
                                <ImageIcon size={16} color="#1d4ed8" />
                              </button>
                            ) : (
                              <span
                                style={{ color: '#9ca3af', fontSize: '11px' }}
                              >
                                Sin adjunto
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'center',
                            }}
                          >
                            <button
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    '¿Está seguro de eliminar este registro del histórico?'
                                  )
                                )
                                  return;
                                try {
                                  setLoading(true);
                                  if (item.receipt_image_url) {
                                    await deleteFileFromStorage(
                                      item.receipt_image_url
                                    );
                                  }
                                  const { error } = await supabase
                                    .from('payments_independent_history')
                                    .delete()
                                    .eq('id', item.id);
                                  if (error) throw error;
                                  showToastSuccess(
                                    'Registro y archivo adjunto eliminados del histórico.'
                                  );
                                  fetchIndependentPaymentsHistory();
                                } catch (err) {
                                  setErrorMsg(
                                    'Error al eliminar: ' + err.message
                                  );
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="admin-mobile-cards">
                  {loading ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#6b7280',
                      }}
                    >
                      Cargando histórico...
                    </div>
                  ) : filteredPaymentsHistory.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '24px',
                        color: '#6b7280',
                      }}
                    >
                      No hay registros en el histórico.
                    </div>
                  ) : (
                    filteredPaymentsHistory.map((item) => (
                      <div key={item.id} className="admin-mobile-card">
                        <div className="admin-mobile-card-header">
                          {item.client_name}
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">Fecha</span>
                          <span className="admin-mobile-card-value">
                            {new Date(item.payment_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">Monto</span>
                          <span
                            className="admin-mobile-card-value"
                            style={{ color: '#059669', fontWeight: '700' }}
                          >
                            ${Number(item.amount_usd).toFixed(2)}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Método
                          </span>
                          <span className="admin-mobile-card-value">
                            {item.payment_method}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Referencia
                          </span>
                          <span
                            className="admin-mobile-card-value"
                            style={{ fontFamily: 'monospace' }}
                          >
                            {item.reference_number}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">Folio</span>
                          <span className="admin-mobile-card-value">
                            #{item.transaction_folio}
                          </span>
                        </div>
                        <div className="admin-mobile-card-actions">
                          {item.receipt_image_url ? (
                            <button
                              onClick={() =>
                                setImagePreviewModal(item.receipt_image_url)
                              }
                              className="admin-action-btn-mobile"
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Ver Adjunto
                            </button>
                          ) : (
                            <span
                              style={{
                                color: '#9ca3af',
                                fontSize: '11px',
                                padding: '5px 8px',
                              }}
                            >
                              Sin adjunto
                            </span>
                          )}
                          <button
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  '¿Está seguro de eliminar este registro del histórico?'
                                )
                              )
                                return;
                              try {
                                setLoading(true);
                                if (item.receipt_image_url) {
                                  await deleteFileFromStorage(
                                    item.receipt_image_url
                                  );
                                }
                                const { error } = await supabase
                                  .from('payments_independent_history')
                                  .delete()
                                  .eq('id', item.id);
                                if (error) throw error;
                                showToastSuccess('Registro eliminado.');
                                fetchIndependentPaymentsHistory();
                              } catch (err) {
                                setErrorMsg('Error: ' + err.message);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="admin-action-btn-mobile"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {editingNote && isCobranzaNEModal && (
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
                    <h2
                      style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}
                    >
                      Panel Editable (Cobranza) - Nota de Entrega #
                      {editingNote.transaction_number}
                    </h2>
                  </div>
                  <button
                    onClick={() => setEditingNoteId(null)}
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
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(240px, 1fr))',
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
                      <input
                        type="text"
                        disabled
                        value={editNoteClientName}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          backgroundColor: '#F3F4F6',
                          boxSizing: 'border-box',
                        }}
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
                        value={editNoteCategory}
                        onChange={(e) => setEditNoteCategory(e.target.value)}
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
                        value={editNotePaymentDiscount}
                        onChange={(e) => {
                          setEditNotePaymentDiscount(e.target.value);
                          handleEditNoteRecalculatePrices(e.target.value);
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
                        <option value="0">
                          {globalDiscount0}% Sin Descuento
                        </option>
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
                          options={filteredProducts.map((p) => {
                            const descPct = getDiscountPercent(
                              editNotePaymentDiscount
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
                          value={editNoteSelectedProdId}
                          onChange={setEditNoteSelectedProdId}
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
                          value={editNoteQuantity}
                          onChange={(e) => setEditNoteQuantity(e.target.value)}
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
                        onClick={handleEditNoteAddProduct}
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
                          <strong>Cliente: </strong> {editNoteClientName}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0 }}>
                          <strong>Fecha/Hora: </strong>{' '}
                          {new Date(editingNote.created_at).toLocaleString()}
                        </p>
                        <p style={{ margin: '2px 0' }}>
                          <strong>N° Transacción: </strong> #
                          {editingNote.transaction_number}
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
                          {editNoteItems.length === 0 ? (
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
                            editNoteItems.map((item) => (
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
                                <td
                                  style={{ padding: '8px', fontWeight: '600' }}
                                >
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
                                <td
                                  style={{ padding: '8px', textAlign: 'right' }}
                                >
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
                                  {Number(
                                    item.discounted_unit_price_usd
                                  ).toFixed(2)}
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
                                      handleEditNoteRemoveItem(item.product_id)
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
                      {editNoteItems.length === 0 ? (
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
                          editNoteItems,
                          true,
                          handleEditNoteRemoveItem
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
                          <strong>${editTotalSinDesc.toFixed(2)}</strong>
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
                            {getDiscountPercent(editNotePaymentDiscount)}% de
                            descuento aplicado:{' '}
                          </span>
                          <strong>-${editMontoAhorrado.toFixed(2)}</strong>
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
                            ${editPrecioFinal.toFixed(2)}
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
                        value={editNoteObservation}
                        onChange={(e) => setEditNoteObservation(e.target.value)}
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
                        onClick={() => handleSaveEditedNote(editingNote)}
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
                        Guardar Cambios N.E.
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA VALES Y PENALIZACIÓN */}
      {activeTab === 'vales_penalizaciones' && (
        <div style={tabContentWrapperStyle}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'vales_lista', label: 'Lista de Vales' },
              { id: 'asignar_vale', label: '+ Asignar Vale' },
              { id: 'penalidades_lista', label: 'Lista de Penalizaciones' },
              { id: 'asignar_penalidad', label: '+ Asignar Penalización' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setValesSubTab(sub.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor:
                    valesSubTab === sub.id ? '#111827' : '#f3f4f6',
                  color: valesSubTab === sub.id ? '#fff' : '#4b5563',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
          {valesSubTab === 'vales_lista' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflowX: 'auto',
              }}
            >
              <table className="admin-table-desktop">
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <th style={{ padding: '12px 16px' }}>Fecha</th>
                    <th style={{ padding: '12px 16px' }}>Vendedor</th>
                    <th style={{ padding: '12px 16px' }}>
                      Monto Solicitado ($)
                    </th>
                    <th style={{ padding: '12px 16px' }}>Estado</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{ textAlign: 'center', padding: '20px' }}
                      >
                        Cargando vales...
                      </td>
                    </tr>
                  ) : vales.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#6b7280',
                        }}
                      >
                        No hay solicitudes de vales.
                      </td>
                    </tr>
                  ) : (
                    vales.map((v) => {
                      return (
                        <tr
                          key={v.id}
                          style={{ borderBottom: '1px solid #e5e7eb' }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            {new Date(v.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {v.seller?.full_name || 'Vendedor'}
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              color: '#dc2626',
                              fontWeight: 'bold',
                            }}
                          >
                            ${Number(v.requested_amount_usd).toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor:
                                  v.status === 'aprobada'
                                    ? '#d1fae5'
                                    : v.status === 'rechazada' ||
                                      v.status === 'rechazado'
                                    ? '#fee2e2'
                                    : '#fef3c7',
                                color:
                                  v.status === 'aprobada'
                                    ? '#065f46'
                                    : v.status === 'rechazada' ||
                                      v.status === 'rechazado'
                                    ? '#b91c1c'
                                    : '#b45309',
                              }}
                            >
                              {v.status.toUpperCase()}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '8px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              {v.status === 'pendiente' && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleValeAction(v.id, 'aprobada')
                                    }
                                    style={{
                                      padding: '6px 10px',
                                      backgroundColor: '#059669',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '12px',
                                    }}
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleValeAction(v.id, 'rechazada')
                                    }
                                    style={{
                                      padding: '6px 10px',
                                      backgroundColor: '#dc2626',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '12px',
                                    }}
                                  >
                                    Rechazar
                                  </button>
                                </>
                              )}
                              {v.status !== 'pendiente' && (
                                <button
                                  onClick={() => handleDeleteVale(v.id)}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: '#dc2626',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                  title="Eliminar vale"
                                >
                                  <Trash2 size={13} /> Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="admin-mobile-cards">
                {loading ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#6b7280',
                    }}
                  >
                    Cargando vales...
                  </div>
                ) : vales.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#6b7280',
                    }}
                  >
                    No hay solicitudes de vales.
                  </div>
                ) : (
                  vales.map((v) => {
                    return (
                      <div key={v.id} className="admin-mobile-card">
                        <div className="admin-mobile-card-header">
                          Vale #{v.id.substring(0, 8)}
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">Fecha</span>
                          <span className="admin-mobile-card-value">
                            {new Date(v.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Vendedor
                          </span>
                          <span className="admin-mobile-card-value">
                            {v.seller?.full_name || 'Vendedor'}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Solicitado
                          </span>
                          <span
                            className="admin-mobile-card-value"
                            style={{ color: '#dc2626', fontWeight: '700' }}
                          >
                            ${Number(v.requested_amount_usd).toFixed(2)}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Estado
                          </span>
                          <span
                            className="admin-mobile-card-value"
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              backgroundColor:
                                v.status === 'aprobada'
                                  ? '#d1fae5'
                                  : v.status === 'rechazada' ||
                                    v.status === 'rechazado'
                                  ? '#fee2e2'
                                  : '#fef3c7',
                              color:
                                v.status === 'aprobada'
                                  ? '#065f46'
                                  : v.status === 'rechazada' ||
                                    v.status === 'rechazado'
                                  ? '#b91c1c'
                                  : '#b45309',
                            }}
                          >
                            {v.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="admin-mobile-card-actions">
                          {v.status === 'pendiente' && (
                            <>
                              <button
                                onClick={() =>
                                  handleValeAction(v.id, 'aprobada')
                                }
                                className="admin-action-btn-mobile"
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() =>
                                  handleValeAction(v.id, 'rechazada')
                                }
                                className="admin-action-btn-mobile"
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#dc2626',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {v.status !== 'pendiente' && (
                            <button
                              onClick={() => handleDeleteVale(v.id)}
                              className="admin-action-btn-mobile"
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          {valesSubTab === 'asignar_vale' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>
                Asignar Adelanto / Vale a Usuario (Independiente)
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    Seleccionar Usuario / Vendedor (Buscador)
                  </label>
                  <SearchableDropdown
                    options={sellersList.map((s) => ({
                      value: s.id,
                      label: `${s.full_name} (${s.role})`,
                    }))}
                    value={assignTargetUserId}
                    onChange={setAssignTargetUserId}
                    placeholder="Seleccione vendedor..."
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    Monto ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={assignAmountUsd}
                    onChange={(e) => setAssignAmountUsd(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleAdminAssignVale}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Registrar y Aprobar Vale
                </button>
              </div>
            </div>
          )}
          {valesSubTab === 'penalidades_lista' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflowX: 'auto',
              }}
            >
              <table className="admin-table-desktop">
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <th style={{ padding: '12px 16px' }}>Fecha</th>
                    <th style={{ padding: '12px 16px' }}>Vendedor</th>
                    <th style={{ padding: '12px 16px' }}>N° N.E.</th>
                    <th style={{ padding: '12px 16px' }}>Monto ($)</th>
                    <th style={{ padding: '12px 16px' }}>Estado</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {penalties.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#6b7280',
                        }}
                      >
                        No hay penalizaciones registradas.
                      </td>
                    </tr>
                  ) : (
                    penalties.map((pen) => {
                      const isCobrada =
                        pen.status === 'cobrada' ||
                        pen.status === 'paid' ||
                        pen.status === 'aprobada_pagada';
                      const displayStatus = isCobrada ? 'COBRADA' : 'PENDIENTE';
                      const sellerName =
                        pen.seller?.full_name ||
                        sellersList.find(
                          (s) => String(s.id) === String(pen.seller_id)
                        )?.full_name ||
                        'Vendedor';
                      const matchedOrder = allOrdersList.find(
                        (o) => String(o.id) === String(pen.order_id)
                      );
                      const neNumberDisplay = matchedOrder?.transaction_number
                        ? `#${matchedOrder.transaction_number}`
                        : pen.linked_order?.transaction_number
                        ? `#${pen.linked_order.transaction_number}`
                        : pen.order?.transaction_number
                        ? `#${pen.order.transaction_number}`
                        : 'N/A';
                      return (
                        <tr
                          key={pen.id}
                          style={{ borderBottom: '1px solid #e5e7eb' }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            {new Date(pen.created_at).toLocaleDateString()}
                          </td>
                          <td
                            style={{ padding: '12px 16px', fontWeight: '500' }}
                          >
                            {sellerName}
                          </td>
                          <td
                            style={{ padding: '12px 16px', fontWeight: 'bold' }}
                          >
                            {neNumberDisplay}
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              fontWeight: 'bold',
                              color: '#b91c1c',
                            }}
                          >
                            -${Number(pen.amount || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: isCobrada
                                  ? '#d1fae5'
                                  : '#fef3c7',
                                color: isCobrada ? '#065f46' : '#b45309',
                              }}
                            >
                              {displayStatus}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              textAlign: 'center',
                            }}
                          >
                            <button
                              onClick={() => handleDeletePenalty(pen.id)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '11px',
                              }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="admin-mobile-cards">
                {penalties.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#6b7280',
                    }}
                  >
                    No hay penalizaciones registradas.
                  </div>
                ) : (
                  penalties.map((pen) => {
                    const isCobrada =
                      pen.status === 'cobrada' ||
                      pen.status === 'paid' ||
                      pen.status === 'aprobada_pagada';
                    const displayStatus = isCobrada ? 'COBRADA' : 'PENDIENTE';
                    const sellerName =
                      pen.seller?.full_name ||
                      sellersList.find(
                        (s) => String(s.id) === String(pen.seller_id)
                      )?.full_name ||
                      'Vendedor';
                    const matchedOrder = allOrdersList.find(
                      (o) => String(o.id) === String(pen.order_id)
                    );
                    const neNumberDisplay = matchedOrder?.transaction_number
                      ? `#${matchedOrder.transaction_number}`
                      : pen.linked_order?.transaction_number
                      ? `#${pen.linked_order.transaction_number}`
                      : pen.order?.transaction_number
                      ? `#${pen.order.transaction_number}`
                      : 'N/A';
                    return (
                      <div key={pen.id} className="admin-mobile-card">
                        <div className="admin-mobile-card-header">
                          Penalización {neNumberDisplay}
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">Fecha</span>
                          <span className="admin-mobile-card-value">
                            {new Date(pen.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Vendedor
                          </span>
                          <span className="admin-mobile-card-value">
                            {sellerName}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            N° N.E.
                          </span>
                          <span className="admin-mobile-card-value">
                            {neNumberDisplay}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">Monto</span>
                          <span
                            className="admin-mobile-card-value"
                            style={{ color: '#b91c1c', fontWeight: '700' }}
                          >
                            -${Number(pen.amount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Estado
                          </span>
                          <span
                            className="admin-mobile-card-value"
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              backgroundColor: isCobrada
                                ? '#d1fae5'
                                : '#fef3c7',
                              color: isCobrada ? '#065f46' : '#b45309',
                            }}
                          >
                            {displayStatus}
                          </span>
                        </div>
                        <div className="admin-mobile-card-actions">
                          <button
                            onClick={() => handleDeletePenalty(pen.id)}
                            className="admin-action-btn-mobile"
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          {valesSubTab === 'asignar_penalidad' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  Asignación de Penalización
                </h3>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '16px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    1. Seleccionar Usuario
                  </label>
                  <SearchableDropdown
                    options={sellersList.map((s) => ({
                      value: s.id,
                      label: `${s.full_name} (${s.role})`,
                    }))}
                    value={assignTargetUserId}
                    onChange={(val) => {
                      setAssignTargetUserId(val);
                      setAssignLinkedOrderId('');
                    }}
                    placeholder="Seleccione vendedor..."
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    2. Seleccionar Nota de Entrega
                  </label>
                  <SearchableDropdown
                    options={selectedTargetUserOrders.map((o) => ({
                      value: o.id,
                      label: `N.E. #${o.transaction_number} | Cliente: ${
                        o.client?.name || 'S/N'
                      } | Saldo Pendiente: $${Number(
                        o.balance_due_usd || 0
                      ).toFixed(2)}`,
                    }))}
                    value={assignLinkedOrderId}
                    onChange={setAssignLinkedOrderId}
                    placeholder={
                      !assignTargetUserId
                        ? '-- Primero seleccione usuario --'
                        : selectedTargetUserOrders.length === 0
                        ? 'Sin notas de entrega para este usuario'
                        : '-- Seleccionar nota de entrega --'
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    3. Monto de Penalización Deseada ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={assignAmountUsd}
                    onChange={(e) => setAssignAmountUsd(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      boxSizing: 'border-box',
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    4. Motivo / Cargo por Incumplimiento
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Incumplimiento o ajuste de cobro"
                    value={assignReason}
                    onChange={(e) => setAssignReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      boxSizing: 'border-box',
                      fontSize: '12px',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={handleAdminAssignPenaltyWithAbono}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {loading
                    ? 'Procesando...'
                    : 'Registrar Penalización (Estado: Pendiente)'}
                </button>
              </div>
            </div>
          )}
          {valeVistaNote && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1100,
                padding: '16px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  width: '100%',
                  maxWidth: '750px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '24px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  border: '2px solid #111827',
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
                    <h2
                      style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}
                    >
                      Nota de Entrega #{valeVistaNote.transaction_number} (Solo
                      Lectura)
                    </h2>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDownloadPDF(valeVistaNote)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#881337',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Download size={14} /> PDF
                    </button>
                    <button
                      onClick={() => setValeVistaNote(null)}
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
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    marginBottom: '16px',
                    background: '#f9fafb',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <p style={{ margin: '2px 0' }}>
                      <strong>Cliente: </strong>{' '}
                      {valeVistaNote.client?.name || 'Cliente'}
                    </p>
                    <p style={{ margin: '2px 0' }}>
                      <strong>Vendedor: </strong>{' '}
                      {valeVistaNote.seller?.full_name || 'Vendedor'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '2px 0' }}>
                      <strong>Fecha: </strong>{' '}
                      {new Date(valeVistaNote.created_at).toLocaleString()}
                    </p>
                    <p
                      style={{
                        margin: '2px 0',
                        fontWeight: 'bold',
                        color: '#dc2626',
                      }}
                    >
                      <strong>Total Final: </strong> $
                      {Number(valeVistaNote.final_price_usd).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '12px',
                      textAlign: 'left',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '1px solid #d1d5db',
                        }}
                      >
                        <th style={{ padding: '8px' }}>Código</th>
                        <th style={{ padding: '8px' }}>Descripción</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>
                          Cantidad
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Unitario ($)
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Desc. Unitario ($)
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Total Línea ($)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {valeVistaItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              color: '#6b7280',
                            }}
                          >
                            Sin ítems detallados.
                          </td>
                        </tr>
                      ) : (
                        valeVistaItems.map((item) => {
                          const totLine =
                            item.total_line_usd ||
                            item.quantity *
                              Number(item.discounted_unit_price_usd || 0);
                          return (
                            <tr
                              key={item.id}
                              style={{ borderBottom: '1px solid #e5e7eb' }}
                            >
                              <td
                                style={{
                                  padding: '8px',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {item.products?.code || 'S/C'}
                              </td>
                              <td style={{ padding: '8px' }}>
                                {item.products?.description || 'Producto'}
                              </td>
                              <td
                                style={{ padding: '8px', textAlign: 'center' }}
                              >
                                {item.quantity}
                              </td>
                              <td
                                style={{ padding: '8px', textAlign: 'right' }}
                              >
                                ${Number(item.unit_price_usd || 0).toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: '8px',
                                  textAlign: 'right',
                                  color: '#b45309',
                                }}
                              >
                                $
                                {Number(
                                  item.discounted_unit_price_usd || 0
                                ).toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: '8px',
                                  textAlign: 'right',
                                  fontWeight: 'bold',
                                }}
                              >
                                ${Number(totLine).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#555',
                    background: '#f3f4f6',
                    padding: '10px',
                    borderRadius: '4px',
                    lineHeight: '1.4',
                    textAlign: 'justify',
                  }}
                >
                  <strong>Términos y condiciones: </strong> {globalTerms}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA CIERRE DE CICLO QUINCENAL */}
      {activeTab === 'quincena' && (
        <div style={tabContentWrapperStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setQuincenaSubView('liquidar')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor:
                    quincenaSubView === 'liquidar' ? '#111827' : '#f3f4f6',
                  color: quincenaSubView === 'liquidar' ? '#fff' : '#4b5563',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cierre y Liquidación
              </button>
              <button
                onClick={() => setQuincenaSubView('historial')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor:
                    quincenaSubView === 'historial' ? '#111827' : '#f3f4f6',
                  color: quincenaSubView === 'historial' ? '#fff' : '#4b5563',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <History size={15} /> Historial de Ciclo / Facturación
              </button>
            </div>
            {quincenaSubView === 'liquidar' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 'bold' }}>
                  Tasa Ref. BCV (Bs/$):
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={bcvRateUsd}
                  onChange={(e) =>
                    setBcvRateUsd(
                      Number(Number(e.target.value || 1).toFixed(2))
                    )
                  }
                  style={{
                    width: '90px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <button
                  onClick={() => obtenerTasaBCV(true)}
                  disabled={bcvLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    backgroundColor: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw
                    size={13}
                    className={bcvLoading ? 'animate-spin' : ''}
                  />{' '}
                  {bcvLoading ? '⌛' : '🔄'}
                </button>
              </div>
            )}
          </div>
          {quincenaSubView === 'liquidar' ? (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    Mes
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i)
                          .toLocaleString('es', { month: 'long' })
                          .toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    Ciclo Quincenal
                  </label>
                  <select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                    }}
                  >
                    <option value="1">Ciclo 1: Día 1 al 15</option>
                    <option value="2">Ciclo 2: Día 16 al 31</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  color: '#78350F',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                  }}
                >
                  <AlertTriangle size={18} color="#d97706" />
                  <span>Resumen de Saldos a Deducir en el Ciclo:</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '24px',
                    flexWrap: 'wrap',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <span>Total Vales a Deducir: </span>
                    <strong style={{ color: '#b45309' }}>
                      -${totalCycleValesDeduct.toFixed(2)} USD
                    </strong>
                  </div>
                  <div>
                    <span>Total Penalizaciones a Deducir: </span>
                    <strong style={{ color: '#b91c1c' }}>
                      -${totalCyclePenaltiesDeduct.toFixed(2)} USD
                    </strong>
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflowX: 'auto',
                }}
              >
                <table className="admin-table-desktop">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      <th
                        onClick={() => handleSortQuincena('full_name')}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          Usuario <ArrowUpDown size={12} color="#6B7280" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortQuincena('role')}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          Rol <ArrowUpDown size={12} color="#6B7280" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortQuincena('assigned')}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          Vendedores Asignados{' '}
                          <ArrowUpDown size={12} color="#6B7280" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortQuincena('sueldo')}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          Sueldo Fijo Base{' '}
                          <ArrowUpDown size={12} color="#6B7280" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortQuincena('closed_count')}
                        style={{
                          padding: '12px 14px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          N.E Cerradas <ArrowUpDown size={12} color="#6B7280" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortQuincena('bombillos')}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          % Bombillos <ArrowUpDown size={12} color="#6B7280" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortQuincena('fluidos')}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          % Fluidos <ArrowUpDown size={12} color="#6B7280" />
                        </div>
                      </th>
                      <th style={{ padding: '12px 14px' }}>Neto 53.38% ($)</th>
                      <th style={{ padding: '12px 14px' }}>Neto 23.08% ($)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="10"
                          style={{ textAlign: 'center', padding: '20px' }}
                        >
                          Cargando datos quincenales...
                        </td>
                      </tr>
                    ) : liquidaciones.length === 0 ? (
                      <tr>
                        <td
                          colSpan="10"
                          style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#6b7280',
                          }}
                        >
                          No se encontraron perfiles activos para liquidar en
                          este ciclo.
                        </td>
                      </tr>
                    ) : (
                      [...liquidaciones]
                        .sort((a, b) => {
                          const notesA = getClosedNotesForUserAndCycle(
                            a.id
                          ).length;
                          const notesB = getClosedNotesForUserAndCycle(
                            b.id
                          ).length;
                          const detailsA = calculateUserSettlementDetails(
                            a,
                            getClosedNotesForUserAndCycle(a.id),
                            getApprovedValesForUserAndCycle(a.id),
                            getApprovedPenaltiesForUserAndCycle(a.id),
                            sueldoFijoCurrency,
                            bcvRateUsd,
                            penaltyChargeMethod
                          );
                          const detailsB = calculateUserSettlementDetails(
                            b,
                            getClosedNotesForUserAndCycle(b.id),
                            getApprovedValesForUserAndCycle(b.id),
                            getApprovedPenaltiesForUserAndCycle(b.id),
                            sueldoFijoCurrency,
                            bcvRateUsd,
                            penaltyChargeMethod
                          );
                          let valA, valB;
                          if (quincenaSortField === 'full_name') {
                            valA = a.full_name || '';
                            valB = b.full_name || '';
                          } else if (quincenaSortField === 'role') {
                            valA = a.role || '';
                            valB = b.role || '';
                          } else if (quincenaSortField === 'assigned') {
                            valA =
                              detailsA.hierarchyData.assignedLabelText || '';
                            valB =
                              detailsB.hierarchyData.assignedLabelText || '';
                          } else if (quincenaSortField === 'sueldo') {
                            valA = Number(a.sueldo_fijo_usd || 0);
                            valB = Number(b.sueldo_fijo_usd || 0);
                          } else if (quincenaSortField === 'closed_count') {
                            valA = notesA;
                            valB = notesB;
                          } else if (quincenaSortField === 'bombillos') {
                            valA = Number(a.pct_bombillos ?? 3);
                            valB = Number(b.pct_bombillos ?? 3);
                          } else if (quincenaSortField === 'fluidos') {
                            valA = Number(a.pct_fluidos ?? 2);
                            valB = Number(b.pct_fluidos ?? 2);
                          }
                          if (valA < valB) return quincenaSortAsc ? -1 : 1;
                          if (valA > valB) return quincenaSortAsc ? 1 : -1;
                          return 0;
                        })
                        .map((usr) => {
                          const userClosedNotes = getClosedNotesForUserAndCycle(
                            usr.id
                          );
                          const userVales = getApprovedValesForUserAndCycle(
                            usr.id
                          );
                          const userPenalties =
                            getApprovedPenaltiesForUserAndCycle(usr.id);

                          // FILTRO DE INACTIVIDAD: Solo mostrar si tiene actividad
                          const details = calculateUserSettlementDetails(
                            usr,
                            userClosedNotes,
                            userVales,
                            userPenalties,
                            sueldoFijoCurrency,
                            bcvRateUsd,
                            penaltyChargeMethod
                          );

                          const hasActivity =
                            userClosedNotes.length > 0 ||
                            userVales.length > 0 ||
                            details.hierarchyData.subordinateOrdersCount > 0 ||
                            details.sueldoFijoOriginal > 0;

                          if (!hasActivity) return null;

                          const assignedLabel =
                            details.hierarchyData.assignedLabelText;
                          return (
                            <tr
                              key={usr.id}
                              style={{ borderBottom: '1px solid #e5e7eb' }}
                            >
                              <td
                                style={{
                                  padding: '12px 14px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {usr.full_name}
                              </td>
                              <td
                                style={{
                                  padding: '12px 14px',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {usr.role}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span
                                  style={{
                                    fontWeight: '700',
                                    color: '#1e40af',
                                  }}
                                >
                                  {assignedLabel}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                ${Number(usr.sueldo_fijo_usd || 0).toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: '12px 14px',
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                                  color:
                                    userClosedNotes.length > 0
                                      ? '#059669'
                                      : '#6b7280',
                                }}
                              >
                                {userClosedNotes.length}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                {usr.pct_bombillos ?? 3}%
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                {usr.pct_fluidos ?? 2}%
                              </td>
                              <td
                                style={{
                                  padding: '12px 14px',
                                  fontWeight: '700',
                                  color: '#059669',
                                }}
                              >
                                ${details.comm53NetUsd.toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: '12px 14px',
                                  fontWeight: '700',
                                  color: '#0369a1',
                                }}
                              >
                                ${details.comm23NetUsd.toFixed(2)}
                              </td>
                              <td
                                style={{
                                  padding: '12px 14px',
                                  textAlign: 'center',
                                }}
                              >
                                <button
                                  onClick={() => handleOpenSettlementModal(usr)}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#111827',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Ver Detalle / Factura
                                </button>
                              </td>
                            </tr>
                          );
                        })
                        .filter(Boolean) // Remover nulls
                    )}
                  </tbody>
                </table>
                <div className="admin-mobile-cards">
                  {loading ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#6b7280',
                      }}
                    >
                      Cargando datos quincenales...
                    </div>
                  ) : liquidaciones.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#6b7280',
                      }}
                    >
                      No se encontraron perfiles activos para liquidar.
                    </div>
                  ) : (
                    liquidaciones
                      .map((usr) => {
                        const userClosedNotes = getClosedNotesForUserAndCycle(
                          usr.id
                        );
                        const userVales = getApprovedValesForUserAndCycle(
                          usr.id
                        );
                        const userPenalties =
                          getApprovedPenaltiesForUserAndCycle(usr.id);
                        const details = calculateUserSettlementDetails(
                          usr,
                          userClosedNotes,
                          userVales,
                          userPenalties,
                          sueldoFijoCurrency,
                          bcvRateUsd,
                          penaltyChargeMethod
                        );

                        const hasActivity =
                          userClosedNotes.length > 0 ||
                          userVales.length > 0 ||
                          details.hierarchyData.subordinateOrdersCount > 0 ||
                          details.sueldoFijoOriginal > 0;

                        if (!hasActivity) return null;

                        const assignedLabel =
                          details.hierarchyData.assignedLabelText;
                        return (
                          <div key={usr.id} className="admin-mobile-card">
                            <div className="admin-mobile-card-header">
                              {usr.full_name}
                            </div>
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                Rol
                              </span>
                              <span
                                className="admin-mobile-card-value"
                                style={{ textTransform: 'capitalize' }}
                              >
                                {usr.role}
                              </span>
                            </div>
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                Asignados
                              </span>
                              <span
                                className="admin-mobile-card-value"
                                style={{ color: '#1e40af', fontWeight: '700' }}
                              >
                                {assignedLabel}
                              </span>
                            </div>
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                Sueldo Fijo
                              </span>
                              <span className="admin-mobile-card-value">
                                ${Number(usr.sueldo_fijo_usd || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                N.E. Cerradas
                              </span>
                              <span
                                className="admin-mobile-card-value"
                                style={{
                                  color:
                                    userClosedNotes.length > 0
                                      ? '#059669'
                                      : '#6b7280',
                                  fontWeight: '700',
                                }}
                              >
                                {userClosedNotes.length}
                              </span>
                            </div>
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                % Bombillos
                              </span>
                              <span className="admin-mobile-card-value">
                                {usr.pct_bombillos ?? 3}%
                              </span>
                            </div>
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                % Fluidos
                              </span>
                              <span className="admin-mobile-card-value">
                                {usr.pct_fluidos ?? 2}%
                              </span>
                            </div>
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                Neto 53.38%
                              </span>
                              <span
                                className="admin-mobile-card-value"
                                style={{ color: '#059669', fontWeight: '700' }}
                              >
                                ${details.comm53NetUsd.toFixed(2)}
                              </span>
                            </div>
                            <div className="admin-mobile-card-row">
                              <span className="admin-mobile-card-label">
                                Neto 23.08%
                              </span>
                              <span
                                className="admin-mobile-card-value"
                                style={{ color: '#0369a1', fontWeight: '700' }}
                              >
                                ${details.comm23NetUsd.toFixed(2)}
                              </span>
                            </div>
                            <div className="admin-mobile-card-actions">
                              <button
                                onClick={() => handleOpenSettlementModal(usr)}
                                className="admin-action-btn-mobile"
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#111827',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                }}
                              >
                                Ver Detalle / Factura
                              </button>
                            </div>
                          </div>
                        );
                      })
                      .filter(Boolean)
                  )}
                </div>
              </div>
            </>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
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
                    position: 'relative',
                    width: '320px',
                    maxWidth: '100%',
                  }}
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
                    placeholder="Buscar por ID factura o vendedor..."
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
                  overflowX: 'auto',
                }}
              >
                <table className="admin-table-desktop">
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
                      <th style={{ padding: '12px 14px' }}>
                        Usuario / Vendedor
                      </th>
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
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#6b7280',
                          }}
                        >
                          No hay historial de pago registrado.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((item) => (
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
                            {item.user?.full_name}
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
                            style={{
                              padding: '12px 14px',
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: '6px',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              <button
                                onClick={() =>
                                  handleOpenCapturedHistoryInvoiceModal(item)
                                }
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
                              <button
                                onClick={() =>
                                  handleDeleteHistoryInvoice(item.dbId, item.id)
                                }
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#dc2626',
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
                                title="Eliminar registro de historial"
                              >
                                <Trash2 size={13} /> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="admin-mobile-cards">
                  {filteredHistory.length === 0 ? (
                    <div
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No hay historial de pago registrado.
                    </div>
                  ) : (
                    filteredHistory.map((item) => (
                      <div key={item.id} className="admin-mobile-card">
                        <div className="admin-mobile-card-header">
                          {item.id}
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Fecha Pago
                          </span>
                          <span className="admin-mobile-card-value">
                            {item.datePaid}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Usuario
                          </span>
                          <span className="admin-mobile-card-value">
                            {item.user?.full_name}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Tasa BCV
                          </span>
                          <span className="admin-mobile-card-value">
                            {Number(item.bcvRate).toFixed(2)}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Total N.E.
                          </span>
                          <span className="admin-mobile-card-value">
                            ${item.totalNeAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Neto 53.38%
                          </span>
                          <span
                            className="admin-mobile-card-value"
                            style={{ color: '#059669', fontWeight: '700' }}
                          >
                            ${item.comm53Net.toFixed(2)}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Neto 23.08%
                          </span>
                          <span
                            className="admin-mobile-card-value"
                            style={{ color: '#0369a1', fontWeight: '700' }}
                          >
                            ${item.comm23Net.toFixed(2)}
                          </span>
                        </div>
                        <div className="admin-mobile-card-row">
                          <span className="admin-mobile-card-label">
                            Total Eq.
                          </span>
                          <span
                            className="admin-mobile-card-value"
                            style={{ color: '#111827', fontWeight: '700' }}
                          >
                            ${item.totalEquivalentUsd.toFixed(2)}
                          </span>
                        </div>
                        <div className="admin-mobile-card-actions">
                          <button
                            onClick={() =>
                              handleOpenCapturedHistoryInvoiceModal(item)
                            }
                            className="admin-action-btn-mobile"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#1e40af',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            Ver Factura
                          </button>
                          <button
                            onClick={() => handlePrintCapturedInvoicePDF(item)}
                            className="admin-action-btn-mobile"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#881337',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            PDF
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteHistoryInvoice(item.dbId, item.id)
                            }
                            className="admin-action-btn-mobile"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE LIQUIDACIÓN QUINCENAL */}
      {settlementModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '16px',
          }}
        >
          <div
            id="settlement-invoice-modal-content"
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #111827',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* ENCABEZADO FACTURA */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #111827',
                paddingBottom: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
                  FACTURA DE LIQUIDACIÓN QUINCENAL
                </h2>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '2px 0 0 0',
                  }}
                >
                  FENIX AUTO PART C.A | RIF: J-50261925-2
                </p>
              </div>
              <button
                onClick={() => setSettlementModalData(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* DATOS GENERALES */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '12px',
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div>
                <p style={{ margin: '2px 0' }}>
                  <strong>Usuario: </strong>{' '}
                  {settlementModalData.user.full_name}
                </p>
                <p style={{ margin: '2px 0', textTransform: 'capitalize' }}>
                  <strong>Rol: </strong> {settlementModalData.user.role}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '2px 0' }}>
                  <strong>Ciclo: </strong> #{selectedCycle} ({selectedMonth}/
                  {selectedYear})
                </p>
                <p style={{ margin: '2px 0' }}>
                  <strong>Tasa BCV Ref: </strong>{' '}
                  {Number(bcvRateUsd).toFixed(2)} Bs/$
                </p>
              </div>
            </div>

            {/* CONFIGURACIÓN SUELDO FIJO */}
            {settlementModalData.sueldoFijoOriginal > 0 && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#166534',
                      fontWeight: 'bold',
                      display: 'block',
                    }}
                  >
                    Sueldo Fijo Base Configurado (mitad del ciclo)
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '900',
                      color: '#15803d',
                    }}
                  >
                    ${Number(settlementModalData.sueldoFijoOriginal).toFixed(2)}{' '}
                    USD Nominal
                  </span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#166534',
                    }}
                  >
                    Pagar en:
                  </label>
                  <select
                    value={sueldoFijoCurrency}
                    onChange={(e) => {
                      const newCurr = e.target.value;
                      setSueldoFijoCurrency(newCurr);
                      // Recalcular detalles al cambiar moneda
                      const updatedDetails = calculateUserSettlementDetails(
                        settlementModalData.user,
                        settlementModalData.notes,
                        settlementModalData.vales,
                        settlementModalData.penalties,
                        newCurr,
                        bcvRateUsd,
                        penaltyChargeMethod
                      );
                      setSettlementModalData(updatedDetails);
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #16a34a',
                      fontWeight: 'bold',
                      backgroundColor: '#fff',
                      fontSize: '12px',
                    }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="BS">Bolívares (B.s)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TABLAS DETALLADAS (Notas Propias y Jerarquía) - Se mantienen igual que antes */}
            <h3
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              Notas de Entrega Cerradas (Base Comisión Propia):
            </h3>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '1px solid #d1d5db',
                    }}
                  >
                    <th style={{ padding: '8px' }}>N° N.E.</th>
                    <th style={{ padding: '8px' }}>Cliente</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>
                      Categoría
                    </th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>
                      % Com. Aplicado
                    </th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>
                      Modalidad (%)
                    </th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>
                      Final ($)
                    </th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>
                      Comisión ($)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {settlementModalData.notes.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          color: '#6b7280',
                        }}
                      >
                        No hay notas cerradas propias para este usuario.
                      </td>
                    </tr>
                  ) : (
                    settlementModalData.notes.map((n) => {
                      const comm = calcOrderCommissionUSD(
                        n,
                        settlementModalData.user
                      );
                      const cat = (n.category || 'bombillos').toLowerCase();
                      const pctUsed =
                        cat === 'fluidos'
                          ? Number(settlementModalData.user?.pct_fluidos ?? 2)
                          : Number(
                              settlementModalData.user?.pct_bombillos ?? 3
                            );
                      return (
                        <tr
                          key={n.id}
                          style={{ borderBottom: '1px solid #e5e7eb' }}
                        >
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            #{n.transaction_number}
                          </td>
                          <td style={{ padding: '8px' }}>
                            {n.client?.name || 'Cliente'}
                          </td>
                          <td
                            style={{
                              padding: '8px',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                            }}
                          >
                            {cat}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {pctUsed}%
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {n.payment_discount}%
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            ${Number(n.final_price_usd).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: '8px',
                              textAlign: 'right',
                              fontWeight: 'bold',
                              color: '#059669',
                            }}
                          >
                            ${comm.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {settlementModalData.hierarchyData?.evaluatedOrders?.length > 0 && (
              <>
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#1e40af',
                  }}
                >
                  Comisiones de Jerarquía (
                  {settlementModalData.hierarchyData?.assignedLabelText ||
                    'Asignados'}
                  ):
                </h3>
                <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '12px',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#eff6ff',
                          borderBottom: '1px solid #bfdbfe',
                          color: '#1e40af',
                        }}
                      >
                        <th style={{ padding: '8px' }}>N° N.E. Subordinada</th>
                        <th style={{ padding: '8px' }}>Vendedor Asignado</th>
                        <th style={{ padding: '8px' }}>Cliente</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Venta Final ($)
                        </th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>
                          % Jerarquía
                        </th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>
                          Modalidad (%)
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Comisión Jerarquía ($)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlementModalData.hierarchyData.evaluatedOrders.map(
                        (item) => (
                          <tr
                            key={item.order.id}
                            style={{ borderBottom: '1px solid #e5e7eb' }}
                          >
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>
                              #{item.order.transaction_number}
                            </td>
                            <td style={{ padding: '8px' }}>
                              {item.order.seller?.full_name || 'Subordinado'}
                            </td>
                            <td style={{ padding: '8px' }}>
                              {item.order.client?.name || 'Cliente'}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              ${Number(item.order.final_price_usd).toFixed(2)}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              {item.pctUsed}%
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#1e40af',
                              }}
                            >
                              {item.paymentDiscount}%
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: '#1d4ed8',
                              }}
                            >
                              +${item.commissionUsd.toFixed(2)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* DEDUCCIONES (Vales y Penalizaciones) */}
            {(settlementModalData.vales.length > 0 ||
              settlementModalData.penalties?.length > 0) && (
              <>
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#dc2626',
                  }}
                >
                  Deducciones de Vales Aprobados y Penalizaciones por Modalidad:
                </h3>
                <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '12px',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#fee2e2',
                          borderBottom: '1px solid #fecaca',
                          color: '#b91c1c',
                        }}
                      >
                        <th style={{ padding: '8px' }}>Fecha</th>
                        <th style={{ padding: '8px' }}>Tipo / Ref N.E.</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>
                          Razón
                        </th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>
                          Monto Deducido ($)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlementModalData.vales.map((v) => (
                        <tr
                          key={`vale-${v.id}`}
                          style={{ borderBottom: '1px solid #e5e7eb' }}
                        >
                          <td style={{ padding: '8px' }}>
                            {new Date(v.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            Vale Independiente
                          </td>
                          <td
                            style={{
                              padding: '8px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                            }}
                          >
                            Asignación Directa
                          </td>
                          <td
                            style={{
                              padding: '8px',
                              textAlign: 'right',
                              fontWeight: 'bold',
                              color: '#dc2626',
                            }}
                          >
                            -${Number(v.requested_amount_usd).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {settlementModalData.penalties?.map((pen) => {
                        const matchedOrd = allOrdersList.find(
                          (o) => String(o.id) === String(pen.order_id)
                        );
                        const neNum = matchedOrd?.transaction_number
                          ? `#${matchedOrd.transaction_number}`
                          : 'N/A';
                        return (
                          <tr
                            key={`pen-${pen.id}`}
                            style={{ borderBottom: '1px solid #e5e7eb' }}
                          >
                            <td style={{ padding: '8px' }}>
                              {new Date(pen.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>
                              Penalización - N.E. {neNum}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              {pen.reason || 'Cargo por incumplimiento'}
                            </td>
                            <td
                              style={{
                                padding: '8px',
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: '#b91c1c',
                              }}
                            >
                              -${Number(pen.amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* D. 4 CUADROS INDEPENDIENTES CON OPERACIONES CORRECTAS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              {/* 1. BLOQUE 53.38% - PAGO $ */}
              {(Number(settlementModalData.comm53GrossUsd) > 0 ||
                Number(settlementModalData.hierarchyUsd53) > 0 ||
                Number(settlementModalData.valesDeduction53Usd) > 0 ||
                Number(settlementModalData.penDeduction53) > 0 ||
                (sueldoFijoCurrency === 'USD' &&
                  Number(settlementModalData.sueldoFijoOriginal) > 0)) && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#166534',
                      fontWeight: 'bold',
                    }}
                  >
                    N.E. con {globalDiscount53}% (Pago $)
                  </span>
                  <div
                    style={{
                      color: '#15803d',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Bruto Com. {globalDiscount53}%: </span>
                    <strong>
                      +${Number(settlementModalData.comm53GrossUsd).toFixed(2)}
                    </strong>
                  </div>
                  <div
                    style={{
                      color: '#1d4ed8',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Comisión Jerarquía ({globalDiscount53}%): </span>
                    <strong>
                      +$
                      {Number(settlementModalData.hierarchyUsd53 || 0).toFixed(
                        2
                      )}
                    </strong>
                  </div>

                  {/* SUELDO EN USD: Se suma aquí visualmente */}
                  {sueldoFijoCurrency === 'USD' &&
                    Number(settlementModalData.sueldoFijoOriginal) > 0 && (
                      <div
                        style={{
                          color: '#15803d',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Sueldo Fijo (USD): </span>
                        <strong>
                          +$
                          {Number(
                            settlementModalData.sueldoFijoOriginal
                          ).toFixed(2)}
                        </strong>
                      </div>
                    )}

                  <div
                    style={{
                      color: '#b91c1c',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Vales (Deducción Total): </span>
                    <strong>
                      -$
                      {Number(settlementModalData.valesDeduction53Usd).toFixed(
                        2
                      )}
                    </strong>
                  </div>
                  {Number(settlementModalData.penDeduction53) > 0 && (
                    <div
                      style={{
                        color: '#b91c1c',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Penalizaciones: </span>
                      <strong>
                        -$
                        {Number(settlementModalData.penDeduction53).toFixed(2)}
                      </strong>
                    </div>
                  )}

                  {/* NETO FINAL: comm53NetUsd (comisiones) + sueldoFijoOriginal (si aplica) */}
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '900',
                      color: '#15803d',
                      borderTop: '1px solid #bbf7d0',
                      marginTop: '4px',
                      paddingTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Neto Final ($): </span>
                    <span>
                      $
                      {(
                        Number(settlementModalData.comm53NetUsd) +
                        (sueldoFijoCurrency === 'USD'
                          ? Number(settlementModalData.sueldoFijoOriginal)
                          : 0)
                      ).toFixed(2)}{' '}
                      USD
                    </span>
                  </div>
                </div>
              )}

              {/* 2. BLOQUE 23.08% - REF BS BCV EQ $ */}
              {(Number(settlementModalData.comm23GrossUsd) > 0 ||
                Number(settlementModalData.hierarchyUsd23) > 0 ||
                Number(settlementModalData.valesDeduction23Usd) > 0 ||
                Number(settlementModalData.penDeduction23) > 0 ||
                (sueldoFijoCurrency === 'BS' &&
                  Number(settlementModalData.sueldoFijoOriginal) > 0)) && (
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#0369a1',
                      fontWeight: 'bold',
                    }}
                  >
                    N.E. con {globalDiscount23}% (Ref Bs BCV Eq $)
                  </span>
                  <div
                    style={{
                      color: '#0284c7',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Bruto Com. {globalDiscount23}%: </span>
                    <strong>
                      +${Number(settlementModalData.comm23GrossUsd).toFixed(2)}
                    </strong>
                  </div>
                  <div
                    style={{
                      color: '#1d4ed8',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Comisión Jerarquía ({globalDiscount23}%): </span>
                    <strong>
                      +$
                      {Number(settlementModalData.hierarchyUsd23 || 0).toFixed(
                        2
                      )}
                    </strong>
                  </div>

                  {/* SUELDO EN BS: Se suma aquí visualmente */}
                  {sueldoFijoCurrency === 'BS' &&
                    Number(settlementModalData.sueldoFijoOriginal) > 0 && (
                      <div
                        style={{
                          color: '#0369a1',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Sueldo Fijo Eq. (BS): </span>
                        <strong>
                          +$
                          {Number(
                            settlementModalData.sueldoFijoOriginal
                          ).toFixed(2)}{' '}
                          USD
                        </strong>
                      </div>
                    )}

                  <div
                    style={{
                      color: '#b91c1c',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Vales {globalDiscount23}%: </span>
                    <strong>
                      -$
                      {Number(settlementModalData.valesDeduction23Usd).toFixed(
                        2
                      )}
                    </strong>
                  </div>
                  {Number(settlementModalData.penDeduction23) > 0 && (
                    <div
                      style={{
                        color: '#b91c1c',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Penalizaciones: </span>
                      <strong>
                        -$
                        {Number(settlementModalData.penDeduction23).toFixed(2)}
                      </strong>
                    </div>
                  )}

                  {/* NETO EQ: comm23NetUsd (comisiones) + sueldoFijoOriginal (si aplica) */}
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '900',
                      color: '#0369a1',
                      borderTop: '1px solid #bae6fd',
                      marginTop: '4px',
                      paddingTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Neto Eq ($): </span>
                    <span>
                      $
                      {(
                        Number(settlementModalData.comm23NetUsd) +
                        (sueldoFijoCurrency === 'BS'
                          ? Number(settlementModalData.sueldoFijoOriginal)
                          : 0)
                      ).toFixed(2)}{' '}
                      USD
                    </span>
                  </div>

                  {/* EQUIVALENTE EN BS: Multiplica el Neto ya corregido por la tasa */}
                  <div
                    style={{
                      marginTop: '4px',
                      paddingTop: '4px',
                      borderTop: '1px dashed #bae6fd',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#0369a1',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      Equivalente en Bs (Tasa {Number(bcvRateUsd).toFixed(2)}):
                    </span>
                    <span>
                      {formatBs(
                        (Number(settlementModalData.comm23NetUsd) +
                          (sueldoFijoCurrency === 'BS'
                            ? Number(settlementModalData.sueldoFijoOriginal)
                            : 0)) *
                          Number(bcvRateUsd)
                      )}{' '}
                      Bs.
                    </span>
                  </div>
                </div>
              )}

              {/* 3. BLOQUE 10% - REF BS BCV EQ $ */}
              {(Number(settlementModalData.comm10GrossUsd) > 0 ||
                Number(settlementModalData.hierarchyUsd10) > 0 ||
                Number(settlementModalData.valesDeduction10Usd) > 0 ||
                Number(settlementModalData.penDeduction10) > 0) && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#92400e',
                      fontWeight: 'bold',
                    }}
                  >
                    N.E. con {globalDiscount10}% (Ref Bs BCV Eq $)
                  </span>
                  <div
                    style={{
                      color: '#d97706',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Bruto Com. {globalDiscount10}%: </span>
                    <strong>
                      +${Number(settlementModalData.comm10GrossUsd).toFixed(2)}
                    </strong>
                  </div>
                  <div
                    style={{
                      color: '#1d4ed8',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Comisión Jerarquía ({globalDiscount10}%): </span>
                    <strong>
                      +$
                      {Number(settlementModalData.hierarchyUsd10 || 0).toFixed(
                        2
                      )}
                    </strong>
                  </div>
                  <div
                    style={{
                      color: '#b91c1c',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Vales {globalDiscount10}%: </span>
                    <strong>
                      -$
                      {Number(settlementModalData.valesDeduction10Usd).toFixed(
                        2
                      )}
                    </strong>
                  </div>
                  {Number(settlementModalData.penDeduction10) > 0 && (
                    <div
                      style={{
                        color: '#b91c1c',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Penalizaciones: </span>
                      <strong>
                        -$
                        {Number(settlementModalData.penDeduction10).toFixed(2)}
                      </strong>
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '900',
                      color: '#92400e',
                      borderTop: '1px solid #fde68a',
                      marginTop: '4px',
                      paddingTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Neto Eq ($): </span>
                    <span>
                      ${Number(settlementModalData.comm10NetUsd).toFixed(2)} USD
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: '4px',
                      paddingTop: '4px',
                      borderTop: '1px dashed #fde68a',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#92400e',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      Equivalente en Bs (Tasa {Number(bcvRateUsd).toFixed(2)}):
                    </span>
                    <span>
                      {formatBs(
                        Number(settlementModalData.comm10NetUsd) *
                          Number(bcvRateUsd)
                      )}{' '}
                      Bs.
                    </span>
                  </div>
                </div>
              )}

              {/* 4. BLOQUE 0% - REF BS BCV EQ $ */}
              {(Number(settlementModalData.comm0GrossUsd) > 0 ||
                Number(settlementModalData.hierarchyUsd0) > 0 ||
                Number(settlementModalData.valesDeduction0Usd) > 0 ||
                Number(settlementModalData.penDeduction0) > 0) && (
                <div
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#374151',
                      fontWeight: 'bold',
                    }}
                  >
                    N.E. con {globalDiscount0}% (Ref Bs BCV Eq $)
                  </span>
                  <div
                    style={{
                      color: '#4b5563',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Bruto Com. {globalDiscount0}%: </span>
                    <strong>
                      +${Number(settlementModalData.comm0GrossUsd).toFixed(2)}
                    </strong>
                  </div>
                  <div
                    style={{
                      color: '#1d4ed8',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Comisión Jerarquía ({globalDiscount0}%): </span>
                    <strong>
                      +$
                      {Number(settlementModalData.hierarchyUsd0 || 0).toFixed(
                        2
                      )}
                    </strong>
                  </div>
                  <div
                    style={{
                      color: '#b91c1c',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Vales {globalDiscount0}%: </span>
                    <strong>
                      -$
                      {Number(settlementModalData.valesDeduction0Usd).toFixed(
                        2
                      )}
                    </strong>
                  </div>
                  {Number(settlementModalData.penDeduction0) > 0 && (
                    <div
                      style={{
                        color: '#b91c1c',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Penalizaciones: </span>
                      <strong>
                        -${Number(settlementModalData.penDeduction0).toFixed(2)}
                      </strong>
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '900',
                      color: '#374151',
                      borderTop: '1px solid #e5e7eb',
                      marginTop: '4px',
                      paddingTop: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Neto Eq ($): </span>
                    <span>
                      ${Number(settlementModalData.comm0NetUsd).toFixed(2)} USD
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: '4px',
                      paddingTop: '4px',
                      borderTop: '1px dashed #e5e7eb',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#374151',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      Equivalente en Bs (Tasa {Number(bcvRateUsd).toFixed(2)}):
                    </span>
                    <span>
                      {formatBs(
                        Number(settlementModalData.comm0NetUsd) *
                          Number(bcvRateUsd)
                      )}{' '}
                      Bs.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* TOTALES FINALES ESTRICTOS */}
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid #d1d5db',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #111827',
                  paddingTop: '8px',
                  fontSize: '15px',
                  fontWeight: '900',
                  color: '#059669',
                }}
              >
                <span>TOTAL A PAGAR ($): </span>
                <span>
                  ${Number(settlementModalData.totalEquivalentUsd).toFixed(2)}{' '}
                  USD
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#0369a1',
                }}
              >
                <span>TOTAL A PAGAR (Bs): </span>
                <span>
                  {formatBs(settlementModalData.totalNetoPagarBs)} Bs.
                </span>
              </div>
            </div>

            {/* SELECTOR DE MÉTODO DE PENALIZACIÓN */}
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#991b1b',
                    fontWeight: 'bold',
                    display: 'block',
                  }}
                >
                  Método para reflejar / cobrar penalizaciones
                </span>
                <span style={{ fontSize: '11px', color: '#b91c1c' }}>
                  Asignación del saldo para descuento:
                </span>
              </div>
              <select
                value={penaltyChargeMethod}
                onChange={(e) => {
                  const newMethod = e.target.value;
                  setPenaltyChargeMethod(newMethod);
                  const updatedDetails = calculateUserSettlementDetails(
                    settlementModalData.user,
                    settlementModalData.notes,
                    settlementModalData.vales,
                    settlementModalData.penalties,
                    sueldoFijoCurrency,
                    bcvRateUsd,
                    newMethod
                  );
                  setSettlementModalData(updatedDetails);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #dc2626',
                  fontWeight: 'bold',
                  backgroundColor: '#fff',
                  color: '#991b1b',
                  fontSize: '12px',
                }}
              >
                <option value="53.38">
                  N.E. con {globalDiscount53}% (Pago $)
                </option>
                <option value="23.08">
                  N.E. {globalDiscount23}% (Ref Bs BCV Eq $)
                </option>
                <option value="10">
                  N.E. {globalDiscount10}% (Ref Bs BCV Eq $)
                </option>
                <option value="0">
                  N.E. {globalDiscount0}% (Ref Bs BCV Eq $)
                </option>
              </select>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setSettlementModalData(null)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4b5563',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handlePayAndLiquidate}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle size={16} />{' '}
                {loading ? 'Procesando...' : 'Pagar y Liquidar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial: Ver Factura Capturada */}
      {historyInvoiceModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: '16px',
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
                Visualización Factura Histórica ({historyInvoiceModalData.id})
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() =>
                    handlePrintCapturedInvoicePDF(historyInvoiceModalData)
                  }
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#881337',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Download size={14} /> Descargar PDF
                </button>
                <button
                  onClick={() => setHistoryInvoiceModalData(null)}
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
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  historyInvoiceModalData.capturedHTML ||
                  '<p>Sin HTML guardado.</p>',
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL FLOTANTE DE NOTIFICACIONES DE ABONO */}
      <div
        id="notif-modal-popup"
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1400,
          padding: '16px',
        }}
        onClick={(e) => {
          if (e.target.id === 'notif-modal-popup') {
            e.currentTarget.style.display = 'none';
          }
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            padding: '20px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '10px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              Notificaciones de Abono Pendientes
            </h3>
            <button
              onClick={() => {
                const el = document.getElementById('notif-modal-popup');
                if (el) el.style.display = 'none';
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
          {paymentNotifications.filter((n) => n.status === 'pending').length ===
          0 ? (
            <p style={{ color: '#6b7280', fontSize: '13px' }}>
              No hay notificaciones de abono pendientes.
            </p>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {paymentNotifications
                .filter((n) => n.status === 'pending')
                .map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      padding: '10px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f9fafb',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '12px' }}>
                        N.E. #{notif.order?.transaction_number || 'S/N'}
                      </strong>
                      <p
                        style={{
                          margin: '2px 0',
                          fontSize: '11px',
                          color: '#4b5563',
                        }}
                      >
                        Vendedor: {notif.seller?.full_name || 'Vendedor'} |
                        Monto: ${Number(notif.amount_usd || 0).toFixed(2)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenViewNotifModal(notif)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#1e40af',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        Ver Notif.
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL VER DETALLE NOTIFICACIÓN */}
      {viewNotifModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
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
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>
                Detalle Notificación de Abono
              </h3>
              <button
                onClick={() => {
                  setViewNotifModalData(null);
                  setDuplicateWarning(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>
            {duplicateWarning && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <AlertTriangle
                  size={18}
                  color="#dc2626"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div style={{ fontSize: '12px', color: '#991b1b' }}>
                  <strong>⚠️ PAGO DUPLICADO DETECTADO</strong>
                  <p style={{ margin: '4px 0 0 0' }}>
                    Ya existe un pago con este monto y referencia registrado el{' '}
                    <strong>{duplicateWarning.date}</strong>.
                  </p>
                </div>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div>
                <span
                  style={{
                    color: '#6b7280',
                    fontSize: '11px',
                    display: 'block',
                  }}
                >
                  N.E. ASOCIADA
                </span>
                <strong>
                  #{viewNotifModalData.order?.transaction_number || 'N/A'}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: '#6b7280',
                    fontSize: '11px',
                    display: 'block',
                  }}
                >
                  CLIENTE
                </span>
                <strong>
                  {viewNotifModalData.order?.client?.name || 'N/A'}
                </strong>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <span
                    style={{
                      color: '#6b7280',
                      fontSize: '11px',
                      display: 'block',
                    }}
                  >
                    FECHA PAGO
                  </span>
                  <strong>{viewNotifModalData.payment_date || 'N/A'}</strong>
                </div>
                <div>
                  <span
                    style={{
                      color: '#6b7280',
                      fontSize: '11px',
                      display: 'block',
                    }}
                  >
                    MÉTODO
                  </span>
                  <strong>{viewNotifModalData.payment_method || 'N/A'}</strong>
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <span
                    style={{
                      color: '#6b7280',
                      fontSize: '11px',
                      display: 'block',
                    }}
                  >
                    MONTO ($)
                  </span>
                  <strong
                    style={{
                      fontSize: '16px',
                      color: duplicateWarning ? '#dc2626' : '#059669',
                      backgroundColor: duplicateWarning
                        ? '#fee2e2'
                        : 'transparent',
                      padding: duplicateWarning ? '2px 6px' : 0,
                      borderRadius: '4px',
                    }}
                  >
                    ${Number(viewNotifModalData.amount_usd || 0).toFixed(2)}
                  </strong>
                </div>
                <div>
                  <span
                    style={{
                      color: '#6b7280',
                      fontSize: '11px',
                      display: 'block',
                    }}
                  >
                    N° REFERENCIA
                  </span>
                  <strong
                    style={{
                      fontFamily: 'monospace',
                      color: duplicateWarning ? '#dc2626' : '#111827',
                      backgroundColor: duplicateWarning
                        ? '#fee2e2'
                        : 'transparent',
                      padding: duplicateWarning ? '2px 6px' : 0,
                      borderRadius: '4px',
                    }}
                  >
                    {viewNotifModalData.reference_number || 'S/R'}
                  </strong>
                </div>
              </div>
              {viewNotifModalData.user_note && (
                <div>
                  <span
                    style={{
                      color: '#6b7280',
                      fontSize: '11px',
                      display: 'block',
                    }}
                  >
                    NOTA DEL USUARIO
                  </span>
                  <p
                    style={{
                      margin: '4px 0 0 0',
                      fontStyle: 'italic',
                      color: '#4b5563',
                    }}
                  >
                    "{viewNotifModalData.user_note}"
                  </p>
                </div>
              )}
              {viewNotifModalData.receipt_image_url && (
                <div>
                  <span
                    style={{
                      color: '#6b7280',
                      fontSize: '11px',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    COMPROBANTE ADJUNTO
                  </span>
                  <button
                    onClick={() =>
                      setImagePreviewModal(viewNotifModalData.receipt_image_url)
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <ImageIcon size={14} /> Ver Comprobante
                  </button>
                </div>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() =>
                  handleDeletePaymentNotification(viewNotifModalData.id)
                }
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={14} /> Desaprobar / Eliminar
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setViewNotifModalData(null);
                    setDuplicateWarning(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() =>
                    handleApprovePaymentNotification(viewNotifModalData)
                  }
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle size={14} />
                  {loading ? 'Procesando...' : 'Aprobar y Archivar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR MONTO ABONADO */}
      {editAbonoModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '900',
              }}
            >
              Editar Monto Abonado
            </h3>
            <p
              style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '12px',
              }}
            >
              N.E. #{editAbonoModalData.transaction_number} | Cliente:{' '}
              {editAbonoModalData.client?.name}
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '4px',
                }}
              >
                Nuevo Monto Abonado ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editAbonoAmount}
                onChange={(e) => setEditAbonoAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
              <p
                style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}
              >
                Precio Final: $
                {Number(editAbonoModalData.final_price_usd).toFixed(2)}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                onClick={() => setEditAbonoModalData(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditedAbono}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {loading ? 'Guardando...' : 'Actualizar Abono'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ABONO MANUAL */}
      {abonoModalNote && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1600,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Registrar Abono Manual
              </h2>
              <button
                onClick={() => setAbonoModalNote(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '16px',
              }}
            >
              Cliente: <strong>{abonoModalNote.client?.name}</strong> <br />
              Saldo Pendiente Actual:{' '}
              <strong>
                ${Number(abonoModalNote.balance_due_usd).toFixed(2)}
              </strong>
            </p>
            <form
              onSubmit={handleRegisterManualAbono}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Fecha del Pago
                </label>
                <input
                  type="date"
                  required
                  value={manualAbonoForm.payment_date}
                  onChange={(e) =>
                    setManualAbonoForm({
                      ...manualAbonoForm,
                      payment_date: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Monto Recibido ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={manualAbonoForm.amount_usd}
                  onChange={(e) =>
                    setManualAbonoForm({
                      ...manualAbonoForm,
                      amount_usd: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Método de Recepción
                </label>
                <select
                  value={manualAbonoForm.payment_method}
                  onChange={(e) =>
                    setManualAbonoForm({
                      ...manualAbonoForm,
                      payment_method: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
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
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  N° Referencia / Comprobante
                </label>
                <input
                  type="text"
                  value={manualAbonoForm.reference_number}
                  onChange={(e) =>
                    setManualAbonoForm({
                      ...manualAbonoForm,
                      reference_number: e.target.value,
                    })
                  }
                  placeholder="Ej. Ref #123456"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Adjuntar Comprobante (Opcional)
                </label>
                <input
                  type="file"
                  id="manual_abono_file_input"
                  accept="image/*,.pdf"
                  onChange={(e) => setManualAbonoFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="manual_abono_file_input"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 14px',
                    backgroundColor: manualAbonoFile ? '#F0FDF4' : '#F9FAFB',
                    color: manualAbonoFile ? '#166534' : '#374151',
                    border: `1px solid ${
                      manualAbonoFile ? '#86EFAC' : '#D1D5DB'
                    }`,
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
                    size={14}
                    style={{ color: manualAbonoFile ? '#16A34A' : '#6B7280' }}
                  />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {manualAbonoFile
                      ? manualAbonoFile.name
                      : 'Seleccionar archivo'}
                  </span>
                </label>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setAbonoModalNote(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Guardar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE BORRADO MASIVO */}
      {bulkDeleteModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1600,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '900',
              }}
            >
              Borrar Histórico de Pagos
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="deleteMode"
                  checked={bulkDeleteModal.mode === 'all'}
                  onChange={() =>
                    setBulkDeleteModal({ ...bulkDeleteModal, mode: 'all' })
                  }
                />
                Borrar TODO el historial
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="deleteMode"
                  checked={bulkDeleteModal.mode === 'range'}
                  onChange={() =>
                    setBulkDeleteModal({ ...bulkDeleteModal, mode: 'range' })
                  }
                />
                Borrar por Rango de Fechas
              </label>
            </div>
            {bulkDeleteModal.mode === 'range' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '16px',
                  paddingLeft: '24px',
                }}
              >
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    Desde:
                  </label>
                  <input
                    type="date"
                    value={bulkDeleteModal.startDate}
                    onChange={(e) =>
                      setBulkDeleteModal({
                        ...bulkDeleteModal,
                        startDate: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    Hasta:
                  </label>
                  <input
                    type="date"
                    value={bulkDeleteModal.endDate}
                    onChange={(e) =>
                      setBulkDeleteModal({
                        ...bulkDeleteModal,
                        endDate: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                onClick={() =>
                  setBulkDeleteModal({
                    open: false,
                    mode: 'all',
                    startDate: '',
                    endDate: '',
                  })
                }
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {loading ? 'Borrando...' : 'Confirmar Borrado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVISUALIZACIÓN DE IMAGEN */}
      {imagePreviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
          }}
          onClick={() => setImagePreviewModal(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <button
                onClick={() => setImagePreviewModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={24} color="#111827" />
              </button>
            </div>
            <img
              src={imagePreviewModal}
              alt="Comprobante"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <a
              href={imagePreviewModal}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                padding: '8px 16px',
                backgroundColor: '#111827',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={14} /> Descargar Imagen
            </a>
          </div>
        </div>
      )}

      {/* MODAL RECHAZO */}
      {rejectModalNote && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
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
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 16px 0',
              }}
            >
              Rechazar Nota #{rejectModalNote.transaction_number}
            </h2>
            <form
              onSubmit={handleRejectNote}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Motivo de rechazo *
                </label>
                <textarea
                  required
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explique el motivo del rechazo..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    boxSizing: 'border-box',
                  }}
                ></textarea>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalNote(null);
                    setRejectReason('');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GPS */}
      {modalGpsNote && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
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
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '450px',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                Ubicación GPS N.E. #{modalGpsNote.transaction_number}
              </h3>
              <button
                onClick={() => setModalGpsNote(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
            {modalGpsNote.latitude && modalGpsNote.longitude ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <p style={{ margin: 0, fontSize: '13px' }}>
                  <strong>Latitud: </strong> {modalGpsNote.latitude}
                  <br />
                  <strong>Longitud: </strong> {modalGpsNote.longitude}
                  <br />
                  <strong>Capturado: </strong>{' '}
                  {modalGpsNote.gps_captured_at
                    ? new Date(modalGpsNote.gps_captured_at).toLocaleString()
                    : 'N/A'}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${modalGpsNote.latitude},${modalGpsNote.longitude}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px',
                    backgroundColor: '#1e40af',
                    color: '#fff',
                    textAlign: 'center',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '13px',
                  }}
                >
                  Abrir en Google Maps
                </a>
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '13px' }}>
                Esta nota no tiene coordenadas GPS registradas.
              </p>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '16px',
              }}
            >
              <button
                onClick={() => setModalGpsNote(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
