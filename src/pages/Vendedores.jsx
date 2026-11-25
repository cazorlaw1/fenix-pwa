import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  Search,
  TrendingUp,
  Target,
  DollarSign,
  MapPin,
  Eye,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Check,
  Calendar,
  Users,
  FileText,
  ArrowLeft,
  Receipt,
  Clock,
  BarChart2,
} from 'lucide-react';

const ESTADOS_VENEZUELA = [
  'Amazonas',
  'Anzoátegui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Distrito Capital',
  'Falcón',
  'Guárico',
  'La Guaira',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'Yaracuy',
  'Zulia',
];

export default function Vendedores({ currentUser }) {
  // Inicialización de pestaña con prioridad: URL (?tab=...) > localStorage > predeterminada ('equipo')
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
      const savedTab = localStorage.getItem('vendedores_active_tab');
      if (savedTab) return savedTab;
    }
    return 'equipo';
  });

  const [vendedores, setVendedores] = useState([]);
  const [rawOrders, setRawOrders] = useState([]);
  const [rawSettlements, setRawSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamClients, setTeamClients] = useState([]);
  const [teamPotentials, setTeamPotentials] = useState([]);

  // Filtros de visitas (Oficiales / Potenciales)
  const [visitFilters, setVisitFilters] = useState({
    official: true,
    potential: true,
  });

  // Estados para Filtros de Zona / Estado, Mes Estricto y Ciclo Quincenal
  const [selectedZone, setSelectedZone] = useState('TODAS');

  const getCurrentYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  const currentRealMonth = getCurrentYearMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentRealMonth);
  const [selectedCycle, setSelectedCycle] = useState('TODOS');

  // Estado para liquidaciones de la tabla settlement_invoices del equipo
  const [teamSettlements, setTeamSettlements] = useState([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);

  // Modal de Factura de Liquidación (Solo Lectura)
  const [liquidationInvoiceModal, setLiquidationInvoiceModal] = useState({
    open: false,
    liquidation: null,
  });

  // Estado para el Menú Dropdown en Móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Panel completo de Historial Detallado del Vendedor
  const [detailedHistoryView, setDetailedHistoryView] = useState({
    active: false,
    seller: null,
    orders: [],
  });

  // Panel completo de Notas de Entrega con Antigüedad Crítica (Global / Equipo)
  const [criticalAgingView, setCriticalAgingView] = useState(false);

  // Modal de Estadísticas Mensuales (por Zona o por Vendedor)
  const [statsModal, setStatsModal] = useState({
    open: false,
    type: null,
    title: '',
    subtitle: '',
    data: [],
    goalUsd: 0,
  });

  // Estado desplegable de Notas de Entrega con Antigüedad Crítica en "Ver Notas"
  const [isAgingOpen, setIsAgingOpen] = useState(false);

  // Buscador interno para la vista de "Ver Notas" / Historial Detallado
  const [detailedSearchTerm, setDetailedSearchTerm] = useState('');

  // Modal de visualización de detalles de N.E. (Solo Lectura)
  const [neDetailModal, setNeDetailModal] = useState({
    open: false,
    order: null,
    items: [],
  });

  const [imageModal, setImageModal] = useState({
    open: false,
    url: '',
    title: '',
  });

  // Estados para edición inline de "Asignado a" en Supervisar Visitas (mismo patrón que Users.jsx)
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [tempAssignmentUserId, setTempAssignmentUserId] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Estados para edición inline de "Zona" (city en profiles) en Historial de Equipo
  const [editingZoneSellerId, setEditingZoneSellerId] = useState(null);
  const [tempSellerZone, setTempSellerZone] = useState('');
  const [savingSellerZone, setSavingSellerZone] = useState(false);

  // ===== Estados de ordenamiento por tabla =====
  const [sortConfig, setSortConfig] = useState({
    equipoZona: { key: null, direction: null },
    visitas: { key: null, direction: null },
    metas: { key: null, direction: null },
    historialEquipo: { key: null, direction: null },
    comisiones: { key: null, direction: null },
    historialDetallado: { key: null, direction: null },
    antiguedadCritica: { key: 'days', direction: 'desc' },
  });

  // Cálculo de días transcurridos desde la creación de la N.E.
  const calcDaysElapsed = (createdAt) => {
    if (!createdAt) return 0;
    return Math.floor(
      (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
    );
  };

  // Efecto para guardar en localStorage y actualizar la URL sin recargar
  useEffect(() => {
    localStorage.setItem('vendedores_active_tab', activeTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url);
    }
  }, [activeTab]);

  // Efecto para cerrar el menú desplegable móvil al hacer clic fuera
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchVendedoresData();
  }, [currentUser, selectedMonth, selectedCycle]);

  useEffect(() => {
    if (
      (activeTab === 'equipo' || activeTab === 'supervisar') &&
      vendedores.length > 0
    ) {
      fetchTeamVisits();
    }
    if (activeTab === 'historialEquipo' && vendedores.length > 0) {
      fetchTeamSettlements();
    }
  }, [activeTab, vendedores, selectedMonth, selectedCycle]);

  // Extraer el monto total facturado de las notas incluidas en una liquidación
  const extractFacturadoFromSettlement = (settlement) => {
    let totalFacturadoLiq = 0;
    if (
      Array.isArray(settlement.breakdown_notes) &&
      settlement.breakdown_notes.length > 0
    ) {
      settlement.breakdown_notes.forEach((n) => {
        totalFacturadoLiq += Number(
          n.final_price_usd || n.total || n.amount || 0
        );
      });
      if (totalFacturadoLiq > 0) return totalFacturadoLiq;
    }

    if (
      settlement.captured_html &&
      typeof settlement.captured_html === 'string'
    ) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(
          settlement.captured_html,
          'text/html'
        );
        const tables = doc.querySelectorAll('table');
        tables.forEach((table) => {
          const headers = Array.from(table.querySelectorAll('th')).map((th) =>
            th.textContent.trim().toLowerCase()
          );
          const finalIdx = headers.findIndex((h) => h.includes('final'));
          if (finalIdx !== -1) {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((tr) => {
              const cells = tr.querySelectorAll('td');
              if (cells[finalIdx]) {
                const rawText = cells[finalIdx].textContent.replace(
                  /[^0-9.-]+/g,
                  ''
                );
                const val = parseFloat(rawText);
                if (!isNaN(val)) {
                  totalFacturadoLiq += val;
                }
              }
            });
          }
        });
      } catch (e) {
        console.warn('No se pudo parsear captured_html para facturado:', e);
      }
    }
    return totalFacturadoLiq;
  };

  // ===== Handler de ordenamiento =====
  const handleSort = (tabla, key) => {
    setSortConfig((prev) => {
      const current = prev[tabla] || { key: null, direction: null };
      let newDirection = 'asc';
      if (current.key === key) {
        if (current.direction === 'asc') newDirection = 'desc';
        else if (current.direction === 'desc') newDirection = null;
      }
      return {
        ...prev,
        [tabla]: { key: newDirection ? key : null, direction: newDirection },
      };
    });
  };

  // ===== Función genérica de ordenamiento =====
  const sortData = (data, key, direction, valueExtractor) => {
    if (!direction || !key) return data;
    const sorted = [...data].sort((a, b) => {
      const valA = valueExtractor ? valueExtractor(a, key) : a[key];
      const valB = valueExtractor ? valueExtractor(b, key) : b[key];

      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(valA)) {
        const diff = new Date(valA).getTime() - new Date(valB).getTime();
        return direction === 'asc' ? diff : -diff;
      }

      if (
        typeof valA === 'number' ||
        (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB)))
      ) {
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        return direction === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const cmp = strA.localeCompare(strB, 'es', { numeric: true });
      return direction === 'asc' ? cmp : -cmp;
    });
    return sorted;
  };

  // ===== Extractores de valor por tabla =====
  const getEquipoZonaValue = (row, key) => {
    switch (key) {
      case 'zone':
        return row.zone || '';
      case 'vendedoresCount':
        return row.vendedoresCount || 0;
      case 'facturado':
        return row.facturado || 0;
      case 'porCobrar':
        return typeof row.porCobrar === 'number' ? row.porCobrar : 0;
      default:
        return row[key];
    }
  };

  const getVisitasValue = (row, key) => {
    const nePendientes = (row.sales_orders || []).filter(
      (o) => o.payment_status !== 'cerrada'
    ).length;
    const neCerradas = (row.sales_orders || []).filter(
      (o) => o.payment_status === 'cerrada'
    ).length;

    switch (key) {
      case 'name':
        return row.name || '';
      case 'registeredBy':
        return row.profiles?.full_name || '';
      case 'nePendientes':
        return nePendientes;
      case 'neCerradas':
        return neCerradas;
      case 'lastVisit':
        return row.last_visit_at || '';
      default:
        return row[key];
    }
  };

  const getMetasValue = (row, key) => {
    switch (key) {
      case 'full_name':
        return row.full_name || '';
      case 'city':
        return row.city || '';
      case 'sales_goal_usd':
        return Number(row.sales_goal_usd) || 0;
      case 'facturado':
        return row.facturado || 0;
      case 'porcentajeCumplimiento':
        return row.porcentajeCumplimiento || 0;
      case 'neCerradas':
        return row.neCerradas || 0;
      case 'nePendientes':
        return row.nePendientes || 0;
      default:
        return row[key];
    }
  };

  const getHistorialEquipoValue = (row, key) => {
    switch (key) {
      case 'full_name':
        return row.full_name || '';
      case 'city':
        return row.city || '';
      case 'totalNE':
        return row.totalNE || 0;
      case 'neCerradas':
        return row.neCerradas || 0;
      case 'totalNeCerradas':
        return row.totalNeCerradas || 0;
      case 'antiguedadCriticaCount':
        return row.antiguedadCriticaCount || 0;
      case 'nePendientes':
        return row.nePendientes || 0;
      case 'facturado':
        return row.displayFacturado || 0;
      case 'porCobrar':
        return typeof row.displayPorCobrar === 'number'
          ? row.displayPorCobrar
          : 0;
      case 'liquidadoGanancias':
        return row.liquidadoGanancias || 0;
      default:
        return row[key];
    }
  };

  const getComisionesValue = (row, key) => {
    switch (key) {
      case 'full_name':
        return row.full_name || '';
      case 'pctBombillos':
        return Number(row.pctBombillos) || 0;
      case 'pctFluidos':
        return Number(row.pctFluidos) || 0;
      case 'bombillosCount':
        return row.bombillosCount || 0;
      case 'bombillosBruto':
        return row.bombillosBruto || 0;
      case 'fluidosCount':
        return row.fluidosCount || 0;
      case 'fluidosBruto':
        return row.fluidosBruto || 0;
      case 'comisionTotalUSD':
        return row.comisionTotalUSD || 0;
      default:
        return row[key];
    }
  };

  const getHistorialDetalladoValue = (row, key) => {
    switch (key) {
      case 'clientName':
        return row.clients?.name || '';
      case 'transaction':
        return row.transaction_number || row.id || '';
      case 'created_at':
        return row.created_at || '';
      case 'payment_status':
        return row.payment_status || '';
      case 'final_price_usd':
        return Number(row.final_price_usd) || 0;
      case 'balance_due_usd':
        return Number(row.balance_due_usd) || 0;
      case 'discount_percent':
        return row.discount_percent || 0;
      default:
        return row[key];
    }
  };

  const getAntiguedadCriticaValue = (row, key) => {
    switch (key) {
      case 'sellerName':
        return row.sellerName || '';
      case 'zone':
        return row.sellerCity || '';
      case 'clientName':
        return row.clients?.name || '';
      case 'transaction':
        return row.transaction_number || row.id || '';
      case 'created_at':
        return row.created_at || '';
      case 'days':
        return row.days || 0;
      case 'final_price_usd':
        return Number(row.final_price_usd) || 0;
      case 'balance_due_usd':
        return Number(row.balance_due_usd) || 0;
      default:
        return row[key];
    }
  };

  // ===== Listas filtradas por zona y búsqueda global =====
  const filteredVendedores = useMemo(() => {
    return vendedores.filter((v) => {
      const zoneName = (v.city || 'N/A').toUpperCase();
      if (selectedZone !== 'TODAS' && zoneName !== selectedZone.toUpperCase()) {
        return false;
      }
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;

      const sellerIdStr = String(v.id).trim();
      const matchesOrderOrClient = rawOrders.some((o) => {
        if (String(o.seller_id).trim() !== sellerIdStr) return false;
        const tx = String(o.transaction_number || o.id || '').toLowerCase();
        const cName = (o.clients?.name || '').toLowerCase();
        const cat = (o.category || '').toLowerCase();
        const st = (o.payment_status || '').toLowerCase();
        return (
          tx.includes(term) ||
          cName.includes(term) ||
          cat.includes(term) ||
          st.includes(term)
        );
      });

      const matchesSettlement = rawSettlements.some((s) => {
        if (String(s.user_id).trim() !== sellerIdStr) return false;
        const invCode = String(s.invoice_code || s.id || '').toLowerCase();
        return invCode.includes(term);
      });

      return (
        v.full_name?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term) ||
        v.city?.toLowerCase().includes(term) ||
        v.pctAsignado?.toLowerCase().includes(term) ||
        matchesOrderOrClient ||
        matchesSettlement
      );
    });
  }, [vendedores, selectedZone, searchTerm, rawOrders, rawSettlements]);

  // Agrupación por Zonas/Estados para la primera pestaña ("Equipo")
  const equiposPorZona = useMemo(() => {
    const map = {};
    vendedores.forEach((v) => {
      const zona = (v.city || 'N/A').trim().toUpperCase();
      if (!map[zona]) {
        map[zona] = {
          zone: zona,
          vendedoresCount: 0,
          facturado: 0,
          porCobrar: 0,
          vendedoresList: [],
        };
      }
      map[zona].vendedoresCount += 1;
      map[zona].facturado += v.facturado || 0;
      if (
        selectedMonth === currentRealMonth &&
        typeof v.porCobrar === 'number'
      ) {
        map[zona].porCobrar += v.porCobrar;
      }
      map[zona].vendedoresList.push(v);
    });
    let list = Object.values(map);
    if (selectedZone !== 'TODAS') {
      list = list.filter((item) => item.zone === selectedZone.toUpperCase());
    }
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((item) => {
        if (item.zone.toLowerCase().includes(term)) return true;
        return item.vendedoresList.some(
          (v) =>
            v.full_name?.toLowerCase().includes(term) ||
            v.email?.toLowerCase().includes(term) ||
            v.city?.toLowerCase().includes(term)
        );
      });
    }
    return list;
  }, [vendedores, selectedZone, selectedMonth, currentRealMonth, searchTerm]);

  const sortedEquiposPorZona = useMemo(
    () =>
      sortData(
        equiposPorZona,
        sortConfig.equipoZona.key,
        sortConfig.equipoZona.direction,
        getEquipoZonaValue
      ),
    [equiposPorZona, sortConfig.equipoZona]
  );

  // ===== Visitas del Equipo =====
  const allVisits = useMemo(
    () => [...teamClients, ...teamPotentials],
    [teamClients, teamPotentials]
  );

  const filteredVisits = useMemo(() => {
    return allVisits.filter((c) => {
      if (c.is_potential && !visitFilters.potential) return false;
      if (!c.is_potential && !visitFilters.official) return false;

      if (selectedZone !== 'TODAS') {
        const sellerObj = vendedores.find(
          (v) => String(v.id).trim() === String(c.assigned_seller_id).trim()
        );
        const sellerZone = (sellerObj?.city || 'N/A').toUpperCase();
        if (sellerZone !== selectedZone.toUpperCase()) return false;
      }

      if (searchTerm) {
        const term = searchTerm.trim().toLowerCase();
        const clientName = c.name?.toLowerCase() || '';
        const ciNumber = c.ci_number?.toLowerCase() || '';
        const rifNumber = c.rif_number?.toLowerCase() || '';
        const sellerName = c.profiles?.full_name?.toLowerCase() || '';
        const clientCity = c.city?.toLowerCase() || '';
        const typeLabel = c.is_potential ? 'potencial' : 'oficial';

        let visitDateStr = '';
        if (c.last_visit_at) {
          try {
            visitDateStr = new Date(c.last_visit_at)
              .toLocaleDateString()
              .toLowerCase();
          } catch (e) {
            visitDateStr = '';
          }
        }

        if (
          !clientName.includes(term) &&
          !ciNumber.includes(term) &&
          !rifNumber.includes(term) &&
          !sellerName.includes(term) &&
          !clientCity.includes(term) &&
          !typeLabel.includes(term) &&
          !visitDateStr.includes(term)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allVisits, visitFilters, searchTerm, selectedZone, vendedores]);

  const sortedVisits = useMemo(
    () =>
      sortData(
        filteredVisits,
        sortConfig.visitas.key,
        sortConfig.visitas.direction,
        getVisitasValue
      ),
    [filteredVisits, sortConfig.visitas]
  );

  const sortedMetas = useMemo(
    () =>
      sortData(
        filteredVendedores,
        sortConfig.metas.key,
        sortConfig.metas.direction,
        getMetasValue
      ),
    [filteredVendedores, sortConfig.metas]
  );

  const sortedHistorialEquipo = useMemo(
    () =>
      sortData(
        filteredVendedores,
        sortConfig.historialEquipo.key,
        sortConfig.historialEquipo.direction,
        getHistorialEquipoValue
      ),
    [filteredVendedores, sortConfig.historialEquipo]
  );

  const sortedVendedoresComisiones = useMemo(
    () =>
      sortData(
        filteredVendedores,
        sortConfig.comisiones.key,
        sortConfig.comisiones.direction,
        getComisionesValue
      ),
    [filteredVendedores, sortConfig.comisiones]
  );

  // Notas con antigüedad crítica (>= 30 días y no cerradas) del vendedor seleccionado en "Ver Notas"
  const sellerAgingNotes = useMemo(() => {
    return (detailedHistoryView.orders || [])
      .map((note) => ({
        ...note,
        days: calcDaysElapsed(note.created_at),
      }))
      .filter((n) => n.days >= 30 && n.payment_status !== 'cerrada')
      .sort((a, b) => b.days - a.days);
  }, [detailedHistoryView.orders]);

  // Filtrado de notas en detalle por el buscador interno o buscador global
  const filteredDetailedHistoryOrders = useMemo(() => {
    const orders = detailedHistoryView.orders;
    const term = (detailedSearchTerm || searchTerm).trim().toLowerCase();
    const filtered = orders.filter((o) => {
      if (!term) return true;
      const clientName = o.clients?.name?.toLowerCase() || '';
      const txNum = String(o.transaction_number || o.id).toLowerCase();
      const status = o.payment_status?.toLowerCase() || '';
      return (
        clientName.includes(term) ||
        txNum.includes(term) ||
        status.includes(term)
      );
    });
    return sortData(
      filtered,
      sortConfig.historialDetallado.key,
      sortConfig.historialDetallado.direction,
      getHistorialDetalladoValue
    );
  }, [
    detailedHistoryView.orders,
    detailedSearchTerm,
    searchTerm,
    sortConfig.historialDetallado,
  ]);

  // Todas las notas con antigüedad crítica (>= 30 días y no cerradas) de los vendedores filtrados
  const allCriticalAgingNotes = useMemo(() => {
    const sellerMap = {};
    filteredVendedores.forEach((v) => {
      sellerMap[String(v.id).trim()] = v;
    });

    const list = rawOrders
      .filter((o) => {
        const seller = sellerMap[String(o.seller_id).trim()];
        if (!seller) return false;
        if (o.payment_status === 'cerrada' || !o.created_at) return false;
        return calcDaysElapsed(o.created_at) >= 30;
      })
      .map((o) => {
        const seller = sellerMap[String(o.seller_id).trim()];
        return {
          ...o,
          days: calcDaysElapsed(o.created_at),
          sellerName: seller?.full_name || 'N/A',
          sellerCity: seller?.city || 'N/A',
        };
      });

    const term = searchTerm.trim().toLowerCase();
    const searched = !term
      ? list
      : list.filter((n) => {
          const clientName = n.clients?.name?.toLowerCase() || '';
          const txNum = String(n.transaction_number || n.id).toLowerCase();
          const sellerName = n.sellerName.toLowerCase();
          const zone = n.sellerCity.toLowerCase();
          return (
            clientName.includes(term) ||
            txNum.includes(term) ||
            sellerName.includes(term) ||
            zone.includes(term)
          );
        });

    return sortData(
      searched,
      sortConfig.antiguedadCritica.key,
      sortConfig.antiguedadCritica.direction,
      getAntiguedadCriticaValue
    );
  }, [rawOrders, filteredVendedores, searchTerm, sortConfig.antiguedadCritica]);

  // Zonas únicas disponibles para el selector de zona
  const availableZones = useMemo(() => {
    const set = new Set();
    vendedores.forEach((v) => {
      if (v.city) set.add(v.city.trim().toUpperCase());
    });
    return Array.from(set);
  }, [vendedores]);

  // Construcción de estadísticas mensuales usando la misma lógica que Historial de Equipo
  const computeMonthlyBillingHistory = (sellerIds) => {
    const idSet = new Set(sellerIds.map((id) => String(id).trim()));
    const monthTotals = {};

    rawOrders.forEach((o) => {
      if (!idSet.has(String(o.seller_id).trim()) || !o.created_at) return;
      const ym = o.created_at.slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(ym)) return;
      if (!monthTotals[ym]) {
        monthTotals[ym] = {
          month: ym,
          notas: 0,
          liquidado: 0,
          total: 0,
          count: 0,
        };
      }
      const price = Number(o.final_price_usd || 0);
      monthTotals[ym].notas += price;
      monthTotals[ym].total += price;
      monthTotals[ym].count += 1;
    });

    rawSettlements.forEach((s) => {
      if (!idSet.has(String(s.user_id).trim())) return;
      let ym = null;
      if (s.year && s.month) {
        ym = `${s.year}-${String(s.month).padStart(2, '0')}`;
      } else if (s.created_at) {
        ym = s.created_at.slice(0, 7);
      }
      if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return;
      if (!monthTotals[ym]) {
        monthTotals[ym] = {
          month: ym,
          notas: 0,
          liquidado: 0,
          total: 0,
          count: 0,
        };
      }
      const liqFacturado = extractFacturadoFromSettlement(s);
      monthTotals[ym].liquidado += liqFacturado;
      monthTotals[ym].total += liqFacturado;
    });

    return Object.values(monthTotals).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  };

  const openZoneStatsModal = (zoneItem) => {
    const sellerIds = zoneItem.vendedoresList.map((v) => v.id);
    const monthlyData = computeMonthlyBillingHistory(sellerIds);
    const totalZoneGoal = zoneItem.vendedoresList.reduce(
      (acc, v) => acc + (Number(v.sales_goal_usd) || 0),
      0
    );
    setStatsModal({
      open: true,
      type: 'zone',
      title: `Estadística Mensual — Zona ${zoneItem.zone}`,
      subtitle: `${zoneItem.vendedoresCount} vendedor(es) • Facturado histórico por mes según N.E.`,
      data: monthlyData,
      goalUsd: totalZoneGoal,
    });
  };

  const openSellerStatsModal = (seller) => {
    const monthlyData = computeMonthlyBillingHistory([seller.id]);
    setStatsModal({
      open: true,
      type: 'seller',
      title: `Estadística Mensual — ${seller.full_name || 'Vendedor'}`,
      subtitle: `Zona: ${
        seller.city || 'N/A'
      } • Facturado histórico por mes según N.E.`,
      data: monthlyData,
      goalUsd: Number(seller.sales_goal_usd) || 0,
    });
  };

  const fetchVendedoresData = async () => {
    try {
      setLoading(true);
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('role', 'is', null)
        .neq('role', 'pendiente')
        .neq('role', 'stock');

      if (profilesError) throw profilesError;

      let globalConfig = null;
      let assignments = [];

      if (currentUser?.id) {
        const { data: cfg } = await supabase
          .from('hierarchy_config')
          .select('*')
          .eq('parent_user_id', currentUser.id)
          .maybeSingle();
        globalConfig = cfg;

        const { data: assignRows } = await supabase
          .from('hierarchy_assignments')
          .select('*')
          .eq('parent_user_id', currentUser.id);
        assignments = assignRows || [];
      }

      const { data: orders, error: ordersError } = await supabase
        .from('sales_orders')
        .select(
          'id, seller_id, balance_due_usd, closed_at, payment_status, final_price_usd, category, created_at, total_base_usd, transaction_number, payment_discount, clients(name)'
        );

      if (ordersError)
        console.warn('Error cargando ordenes:', ordersError.message);

      const { data: settlementsData } = await supabase
        .from('settlement_invoices')
        .select('*');

      setRawOrders(orders || []);
      setRawSettlements(settlementsData || []);

      const [yearStr, monthStr] = selectedMonth.split('-');
      const yearNum = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      const processed = (allProfiles || [])
        .map((profile) => {
          if (profile.id === currentUser?.id) return null;

          let pctBombillos = 0;
          let pctFluidos = 0;
          let included = false;

          const profileIdStr = String(profile.id).trim();
          const specificRule = assignments.find(
            (c) => String(c.target_seller_id).trim() === profileIdStr
          );
          const isException = specificRule ? specificRule.is_exception : false;

          if (globalConfig && globalConfig.is_global) {
            if (!isException) {
              included = true;
              pctBombillos = Number(globalConfig.pct_bombillos_global || 0);
              pctFluidos = Number(globalConfig.pct_fluidos_global || 0);
            }
          } else {
            if (specificRule && !specificRule.is_exception) {
              included = true;
              pctBombillos = Number(specificRule.pct_bombillos || 0);
              pctFluidos = Number(specificRule.pct_fluidos || 0);
            }
          }

          if (!included) return null;

          const userOrders = (orders || []).filter(
            (o) => String(o.seller_id).trim() === profileIdStr
          );

          // Totales históricos independientes del filtro de mes y ciclo
          const totalNeCerradas = userOrders.filter(
            (o) => o.payment_status === 'cerrada'
          ).length;

          const antiguedadCriticaCount = userOrders.filter((o) => {
            if (o.payment_status === 'cerrada' || !o.created_at) return false;
            return calcDaysElapsed(o.created_at) >= 30;
          }).length;

          // Notas creadas estrictamente en el mes seleccionado (ej. Octubre se queda en Octubre)
          const monthlyOrders = userOrders.filter((o) => {
            if (!o.created_at) return false;
            return o.created_at.startsWith(selectedMonth);
          });

          // Filtrado por ciclo quincenal ('1', '2' o 'TODOS') sobre las notas del mes
          const cycleFilteredOrders = monthlyOrders.filter((o) => {
            if (selectedCycle === 'TODOS') return true;
            const day = new Date(o.created_at).getUTCDate();
            if (selectedCycle === '1') return day >= 1 && day <= 15;
            if (selectedCycle === '2') return day >= 16;
            return true;
          });

          const totalNE = cycleFilteredOrders.length;
          const neCerradas = cycleFilteredOrders.filter(
            (o) => o.payment_status === 'cerrada'
          ).length;
          const nePendientes = cycleFilteredOrders.filter(
            (o) =>
              Number(o.balance_due_usd) > 0 || o.payment_status !== 'cerrada'
          ).length;

          // Restante por cobrar y cobrado exclusivamente de las notas creadas en el mes seleccionado
          const restantePorCobrarMes = monthlyOrders.reduce((acc, o) => {
            if (o.payment_status === 'cerrada') return acc;
            const due = Number(o.balance_due_usd ?? o.final_price_usd ?? 0);
            return acc + (due > 0 ? due : 0);
          }, 0);

          const cobradoMes = monthlyOrders.reduce((acc, o) => {
            const totalNota = Number(o.final_price_usd || 0);
            if (o.payment_status === 'cerrada') return acc + totalNota;
            const due = Number(o.balance_due_usd ?? totalNota);
            const pagado = Math.max(0, totalNota - Math.max(0, due));
            return acc + pagado;
          }, 0);

          const pctAsignado = `${pctBombillos}% B / ${pctFluidos}% F`;

          let facturadoNotasMes = 0;
          let bombillosCount = 0;
          let fluidosCount = 0;
          let bombillosBruto = 0;
          let fluidosBruto = 0;

          monthlyOrders.forEach((o) => {
            const price = Number(o.final_price_usd || 0);
            facturadoNotasMes += price;
          });

          // ===== "POR COBRAR" Y RESUMEN DE COMISIONES (Todas las notas cerradas hasta el momento, sin filtro de mes) =====
          let totalComisionesHistoricasCerradas = 0;
          userOrders.forEach((o) => {
            if (o.payment_status === 'cerrada') {
              const price = Number(o.final_price_usd || 0);
              const cat = (o.category || 'bombillos').toLowerCase();
              if (cat === 'fluidos') {
                fluidosCount++;
                fluidosBruto += price;
                totalComisionesHistoricasCerradas += price * (pctFluidos / 100);
              } else {
                bombillosCount++;
                bombillosBruto += price;
                totalComisionesHistoricasCerradas +=
                  price * (pctBombillos / 100);
              }
            }
          });

          let facturadoNotasCiclo = 0;
          cycleFilteredOrders.forEach((o) => {
            const price = Number(o.final_price_usd || 0);
            facturadoNotasCiclo += price;
          });

          // Liquidaciones del vendedor en ese mes (y ciclo si aplica)
          const userSettlementsMes = (settlementsData || []).filter((s) => {
            if (String(s.user_id).trim() !== profileIdStr) return false;
            if (s.month && s.year) {
              return Number(s.month) === monthNum && Number(s.year) === yearNum;
            }
            return s.created_at
              ? s.created_at.startsWith(selectedMonth)
              : false;
          });

          const userSettlementsCiclo = userSettlementsMes.filter((s) => {
            if (selectedCycle === 'TODOS') return true;
            return String(s.cycle) === String(selectedCycle);
          });

          let facturadoLiquidadoMes = 0;
          userSettlementsMes.forEach((s) => {
            facturadoLiquidadoMes += extractFacturadoFromSettlement(s);
          });

          let facturadoLiquidadoCiclo = 0;
          let liquidadoGanancias = 0;

          userSettlementsCiclo.forEach((s) => {
            facturadoLiquidadoCiclo += extractFacturadoFromSettlement(s);
            const netComms =
              Number(s.comm_53_net_usd || 0) + Number(s.comm_23_net_usd || 0);
            liquidadoGanancias += Number(s.sueldo_fijo_usd || 0) + netComms;
          });

          const facturado = facturadoNotasMes + facturadoLiquidadoMes;
          const displayFacturado =
            facturadoNotasCiclo + facturadoLiquidadoCiclo;

          const porCobrar =
            selectedMonth === currentRealMonth
              ? totalComisionesHistoricasCerradas
              : 'N/A';
          const displayPorCobrar =
            selectedMonth === currentRealMonth
              ? totalComisionesHistoricasCerradas
              : 'N/A';

          const salesGoal = Number(profile.sales_goal_usd || 0);
          const porcentajeCumplimiento =
            salesGoal > 0 ? Math.round((facturado / salesGoal) * 100) : 0;

          return {
            ...profile,
            sales_goal_usd: salesGoal,
            city: profile.city || 'N/A',
            totalNE,
            neCerradas,
            totalNeCerradas,
            antiguedadCriticaCount,
            nePendientes,
            restantePorCobrarMes,
            cobradoMes,
            pctAsignado,
            pctBombillos,
            pctFluidos,
            facturado,
            porCobrar,
            displayFacturado,
            displayPorCobrar,
            liquidadoGanancias,
            comisionTotalUSD: totalComisionesHistoricasCerradas,
            bombillosCount,
            fluidosCount,
            bombillosBruto,
            fluidosBruto,
            porcentajeCumplimiento,
            hasRule: true,
          };
        })
        .filter(Boolean);

      setVendedores(processed);
    } catch (err) {
      console.error('Error cargando vendedores:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamSettlements = async () => {
    try {
      setLoadingSettlements(true);
      const sellerIds = vendedores.map((v) => v.id);
      if (sellerIds.length === 0) {
        setTeamSettlements([]);
        return;
      }

      const [yearStr, monthStr] = selectedMonth.split('-');
      const yearNum = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      const { data, error } = await supabase
        .from('settlement_invoices')
        .select('*')
        .in('user_id', sellerIds);

      if (error) {
        console.warn('Error consultando settlement_invoices:', error.message);
        setTeamSettlements([]);
        return;
      }

      const filtered = (data || []).filter((inv) => {
        let matchMonthYear = false;
        if (inv.month && inv.year) {
          matchMonthYear =
            Number(inv.month) === monthNum && Number(inv.year) === yearNum;
        } else if (inv.created_at) {
          matchMonthYear = inv.created_at.startsWith(selectedMonth);
        }

        if (!matchMonthYear) return false;

        if (selectedCycle !== 'TODOS' && inv.cycle) {
          if (String(inv.cycle) !== String(selectedCycle)) return false;
        }

        return true;
      });

      setTeamSettlements(filtered);
    } catch (err) {
      console.error('Error cargando settlement_invoices:', err.message);
      setTeamSettlements([]);
    } finally {
      setLoadingSettlements(false);
    }
  };

  const fetchTeamVisits = async () => {
    try {
      const sellerIds = vendedores.map((v) => v.id);
      if (sellerIds.length === 0) {
        setTeamClients([]);
        setTeamPotentials([]);
        return;
      }

      const { data: clients } = await supabase
        .from('clients')
        .select(
          `*, profiles:assigned_seller_id(full_name, email, role), sales_orders(id, payment_status, balance_due_usd, seller_id)`
        )
        .in('assigned_seller_id', sellerIds)
        .eq('is_potential', false)
        .order('name', { ascending: true });

      const { data: potentials } = await supabase
        .from('clients')
        .select(`*, profiles:assigned_seller_id(full_name, email, role)`)
        .in('assigned_seller_id', sellerIds)
        .eq('is_potential', true)
        .order('created_at', { ascending: false });

      setTeamClients(clients || []);
      setTeamPotentials(potentials || []);
    } catch (err) {
      console.error('Error cargando visitas del equipo:', err.message);
    }
  };

  const handleGoalChange = (id, newGoal) => {
    setVendedores((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, sales_goal_usd: newGoal } : item
      )
    );
  };

  const handleSaveSeller = async (vendedor) => {
    try {
      setSavingId(vendedor.id);
      const { error } = await supabase
        .from('profiles')
        .update({ sales_goal_usd: parseFloat(vendedor.sales_goal_usd) || 0 })
        .eq('id', vendedor.id);

      if (error) throw error;
      alert(`Meta actualizada para ${vendedor.full_name}`);
      fetchVendedoresData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  // Handlers de edición inline para "Asignado a" en Supervisar Visitas
  const startEditingAssignment = (clientId, currentSellerId) => {
    setEditingAssignmentId(clientId);
    setTempAssignmentUserId(currentSellerId || '');
  };

  const saveAssignmentChange = async (clientId) => {
    setSavingAssignment(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ assigned_seller_id: tempAssignmentUserId || null })
        .eq('id', clientId);

      if (error) throw error;
      alert('Asignación actualizada correctamente.');
      setEditingAssignmentId(null);
      fetchTeamVisits();
    } catch (err) {
      alert('Error actualizando asignación: ' + err.message);
    } finally {
      setSavingAssignment(false);
    }
  };

  // Handlers de edición inline para "Zona" (city en profiles) en Historial de Equipo
  const startEditingSellerZone = (sellerId, currentCity) => {
    setEditingZoneSellerId(sellerId);
    setTempSellerZone(!currentCity || currentCity === 'N/A' ? '' : currentCity);
  };

  const saveSellerZoneChange = async (sellerId) => {
    setSavingSellerZone(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ city: tempSellerZone || null })
        .eq('id', sellerId);

      if (error) throw error;
      alert('Zona actualizada correctamente.');
      setEditingZoneSellerId(null);
      fetchVendedoresData();
    } catch (err) {
      alert('Error actualizando zona: ' + err.message);
    } finally {
      setSavingSellerZone(false);
    }
  };

  const getDiscountPercentFromType = (type) => {
    switch (String(type)) {
      case '53.38':
        return 53.38;
      case '23.08':
        return 23.08;
      case '10':
        return 10;
      case '0':
        return 0;
      default:
        return 53.38;
    }
  };

  // "Ver Notas" carga TODAS las notas históricas del vendedor sin ningún tipo de filtro de mes/ciclo
  const openDetailedHistoryPanel = async (seller) => {
    try {
      setLoading(true);
      setDetailedSearchTerm('');
      setIsAgingOpen(false);
      setCriticalAgingView(false);
      const { data } = await supabase
        .from('sales_orders')
        .select('*, clients(name)')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      const processedOrders = (data || []).map((order) => {
        const discountPct = getDiscountPercentFromType(order.payment_discount);
        return {
          ...order,
          discount_percent: discountPct,
        };
      });

      setDetailedHistoryView({
        active: true,
        seller,
        orders: processedOrders,
      });
    } catch (err) {
      alert('Error cargando historial detallado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openViewNeModal = async (order) => {
    try {
      setLoading(true);
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*, products(code, description)')
        .eq('order_id', order.id);

      if (error) throw error;
      setNeDetailModal({
        open: true,
        order: order,
        items: items || [],
      });
    } catch (err) {
      console.error(err);
      alert('Error cargando detalles de la N.E.');
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas globales
  const stats = {
    total: filteredVendedores.length,
    meta: filteredVendedores.reduce(
      (acc, c) => acc + (Number(c.sales_goal_usd) || 0),
      0
    ),
    facturado: filteredVendedores.reduce(
      (acc, c) => acc + (c.facturado || 0),
      0
    ),
    cobradoMes: filteredVendedores.reduce(
      (acc, c) => acc + (c.cobradoMes || 0),
      0
    ),
    restantePorCobrarMes: filteredVendedores.reduce(
      (acc, c) => acc + (c.restantePorCobrarMes || 0),
      0
    ),
    porCobrar:
      selectedMonth === currentRealMonth
        ? filteredVendedores.reduce(
            (acc, c) =>
              acc + (typeof c.porCobrar === 'number' ? c.porCobrar : 0),
            0
          )
        : 'N/A',
    cerradas: filteredVendedores.reduce((acc, c) => acc + c.neCerradas, 0),
    pendientes: filteredVendedores.reduce((acc, c) => acc + c.nePendientes, 0),
    antiguedadCritica: filteredVendedores.reduce(
      (acc, c) => acc + (c.antiguedadCriticaCount || 0),
      0
    ),
    comisiones: filteredVendedores.reduce(
      (acc, c) => acc + c.comisionTotalUSD,
      0
    ),
  };

  const tabsList = [
    { key: 'equipo', label: 'Equipo', icon: <Users size={18} /> },
    {
      key: 'supervisar',
      label: 'Supervisar Visitas',
      icon: <MapPin size={18} />,
    },
    { key: 'metas', label: 'Metas', icon: <Target size={18} /> },
    {
      key: 'historialEquipo',
      label: 'Historial de Equipo',
      icon: <FileText size={18} />,
    },
    {
      key: 'comisiones',
      label: 'Resumen de Comisiones',
      icon: <DollarSign size={18} />,
    },
  ];

  const actionButtonStyle = {
    backgroundColor: '#111827',
    color: '#D4AF37',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  };

  if (
    loading &&
    activeTab !== 'equipo' &&
    activeTab !== 'supervisar' &&
    !detailedHistoryView.active &&
    !criticalAgingView &&
    !neDetailModal.open
  ) {
    return <div style={{ padding: '24px' }}>Cargando módulo...</div>;
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        fontFamily: 'system-ui',
      }}
    >
      {/* Cabecera y Filtros Globales */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingUp size={24} color="#dc2626" strokeWidth={2.5} />
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#111827',
              margin: 0,
            }}
          >
            Gestión de Vendedores
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Selector de Mes Calendario Estricto */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fff',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
            }}
          >
            <Calendar size={16} color="#dc2626" />
            <span
              style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563' }}
            >
              Mes:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setDetailedHistoryView({
                  active: false,
                  seller: null,
                  orders: [],
                });
                setCriticalAgingView(false);
              }}
              style={{
                border: 'none',
                fontSize: '12px',
                outline: 'none',
                fontWeight: '700',
                color: '#111827',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Selector de Zona / Estado */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fff',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
            }}
          >
            <MapPin size={16} color="#dc2626" />
            <span
              style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563' }}
            >
              Zona:
            </span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              style={{
                border: 'none',
                fontSize: '12px',
                outline: 'none',
                fontWeight: '700',
                color: '#111827',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              <option value="TODAS">Todas las Zonas</option>
              {availableZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Buscador Global */}
          <div style={{ position: 'relative' }}>
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
              placeholder="Buscar en todas las pestañas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 28px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                width: '230px',
                outline: 'none',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                title="Limpiar búsqueda"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Superiores */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <KpiCard
          title="Vendedores Activos"
          value={stats.total}
          sub={`Mes: ${selectedMonth}`}
          color="#111827"
        />
        <div
          className="kpi-card-responsive"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
            }}
          >
            Facturado vs Por Cobrar del mes
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#111827',
                lineHeight: '1.25',
                wordBreak: 'break-word',
              }}
              title="Total facturado en el mes seleccionado"
            >
              Facturado: $
              {stats.facturado.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#10B981',
                lineHeight: '1.25',
                wordBreak: 'break-word',
              }}
              title="Total cobrado y abonado de las notas de este mes"
            >
              Cobrado: $
              {stats.cobradoMes.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#dc2626',
                lineHeight: '1.25',
                wordBreak: 'break-word',
              }}
              title="Restante por cobrar de las notas de este mes tras restar todos sus abonos"
            >
              Por cobrar: $
              {stats.restantePorCobrarMes.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#6b7280',
              marginTop: '3px',
              fontWeight: '600',
            }}
          >
            Meta Total: ${stats.meta.toLocaleString()}
          </div>
        </div>
        <KpiCard
          title="N.E. Cerradas"
          value={stats.cerradas}
          sub="Mes / Ciclo"
          color="#10B981"
          border="#10B981"
        />
        <KpiCard
          title="N.E. Pendientes"
          value={stats.pendientes}
          sub="Por cerrar"
          color="#dc2626"
          border="#dc2626"
        />
        <div
          onClick={() => {
            setDetailedHistoryView({
              active: false,
              seller: null,
              orders: [],
            });
            setCriticalAgingView(true);
          }}
          className="kpi-card"
          title="Clic para ver todas las notas con antigüedad crítica"
          style={{
            backgroundColor: criticalAgingView ? '#fffbeb' : '#ffffff',
            border: `1px solid ${criticalAgingView ? '#d97706' : '#f59e0b'}`,
            borderRadius: '8px',
            padding: '10px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            boxShadow: criticalAgingView
              ? '0 0 0 2px rgba(217, 119, 6, 0.25)'
              : 'none',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#b45309',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertTriangle size={11} color="#d97706" /> N.E. Ant. Crít.
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#d97706',
              marginTop: '2px',
            }}
          >
            {stats.antiguedadCritica}
          </div>
          <div style={{ fontSize: '10px', color: '#b45309', marginTop: '2px' }}>
            30+ días (Ver todas)
          </div>
        </div>
        {activeTab === 'comisiones' && (
          <KpiCard
            title="Total Comisiones ($)"
            value={
              selectedMonth === currentRealMonth
                ? `$${stats.comisiones.toFixed(2)}`
                : 'N/A'
            }
            sub={
              selectedMonth === currentRealMonth
                ? 'Todas las órdenes cerradas'
                : 'Ir al mes actual'
            }
            color="#D4AF37"
            border="#D4AF37"
          />
        )}
      </div>

      {/* Menú de Pestañas */}
      <div style={{ marginBottom: '24px' }}>
        <div
          className="desktop-tabs"
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #e5e7eb',
            flexWrap: 'wrap',
          }}
        >
          {tabsList.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setDetailedHistoryView({
                  active: false,
                  seller: null,
                  orders: [],
                });
                setCriticalAgingView(false);
              }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderBottom:
                  activeTab === tab.key && !criticalAgingView
                    ? '2px solid #dc2626'
                    : '2px solid transparent',
                backgroundColor: 'transparent',
                fontWeight:
                  activeTab === tab.key && !criticalAgingView ? '700' : '500',
                color:
                  activeTab === tab.key && !criticalAgingView
                    ? '#111827'
                    : '#4b5563',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  color:
                    activeTab === tab.key && !criticalAgingView
                      ? '#dc2626'
                      : '#4b5563',
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className="mobile-dropdown-menu"
          ref={mobileMenuRef}
          style={{ position: 'relative', display: 'none' }}
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
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#dc2626' }}>
                {criticalAgingView ? (
                  <AlertTriangle size={18} />
                ) : (
                  tabsList.find((t) => t.key === activeTab)?.icon
                )}
              </span>
              <span>
                {criticalAgingView
                  ? 'N.E. Antigüedad Crítica'
                  : tabsList.find((t) => t.key === activeTab)?.label}
              </span>
            </div>
            <ChevronDown
              size={18}
              color="#4b5563"
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
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              {tabsList.map((tab) => {
                const isActive = activeTab === tab.key && !criticalAgingView;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setDetailedHistoryView({
                        active: false,
                        seller: null,
                        orders: [],
                      });
                      setCriticalAgingView(false);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: isActive ? '#fef2f2' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? '#dc2626' : '#4b5563',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ color: isActive ? '#dc2626' : '#4b5563' }}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </div>
                    {isActive && <Check size={18} color="#dc2626" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL / VISTAS */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px',
          overflowX: 'auto',
        }}
      >
        {/* ============ VISTA DE TODAS LAS N.E. CON ANTIGÜEDAD CRÍTICA ============ */}
        {criticalAgingView ? (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <button
                  onClick={() => setCriticalAgingView(false)}
                  style={{
                    backgroundColor: '#111827',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  <ArrowLeft size={14} /> Volver al Módulo
                </button>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={18} color="#d97706" />
                  Todas las N.E. con Antigüedad Crítica (
                  {allCriticalAgingNotes.length})
                </h3>
              </div>
            </div>

            <MobileSortBar
              tabla="antiguedadCritica"
              sortConfig={sortConfig.antiguedadCritica}
              onSort={handleSort}
              options={[
                { key: 'days', label: 'Días de Antigüedad' },
                { key: 'sellerName', label: 'Vendedor' },
                { key: 'zone', label: 'Zona' },
                { key: 'clientName', label: 'Cliente' },
                { key: 'transaction', label: 'Transacción' },
                { key: 'created_at', label: 'Fecha' },
                { key: 'final_price_usd', label: 'Total ($)' },
                { key: 'balance_due_usd', label: 'Saldo ($)' },
              ]}
            />

            <table
              className="custom-responsive-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
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
                  <SortableHeader
                    label="Vendedor"
                    sortKey="sellerName"
                    tabla="antiguedadCritica"
                    sortConfig={sortConfig.antiguedadCritica}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Zona"
                    sortKey="zone"
                    tabla="antiguedadCritica"
                    sortConfig={sortConfig.antiguedadCritica}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Cliente"
                    sortKey="clientName"
                    tabla="antiguedadCritica"
                    sortConfig={sortConfig.antiguedadCritica}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Transacción"
                    sortKey="transaction"
                    tabla="antiguedadCritica"
                    sortConfig={sortConfig.antiguedadCritica}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Fecha"
                    sortKey="created_at"
                    tabla="antiguedadCritica"
                    sortConfig={sortConfig.antiguedadCritica}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Antigüedad"
                    sortKey="days"
                    tabla="antiguedadCritica"
                    sortConfig={sortConfig.antiguedadCritica}
                    onSort={handleSort}
                    align="center"
                  />
                  <SortableHeader
                    label="Total ($)"
                    sortKey="final_price_usd"
                    tabla="antiguedadCritica"
                    sortConfig={sortConfig.antiguedadCritica}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortableHeader
                    label="Saldo ($)"
                    sortKey="balance_due_usd"
                    tabla="antiguedadCritica"
                    sortConfig={sortConfig.antiguedadCritica}
                    onSort={handleSort}
                    align="right"
                  />
                  <th style={{ padding: '10px', textAlign: 'center' }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {allCriticalAgingNotes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: '#4b5563',
                      }}
                    >
                      No se encontraron notas de entrega con antigüedad crítica.
                    </td>
                  </tr>
                ) : (
                  allCriticalAgingNotes.map((nota) => {
                    let badgeBg = '#fef9c3';
                    let badgeColor = '#a16207';
                    let badgeLabel = '30+ días';
                    if (nota.days >= 60) {
                      badgeBg = '#fee2e2';
                      badgeColor = '#dc2626';
                      badgeLabel = '60+ días';
                    } else if (nota.days >= 45) {
                      badgeBg = '#ffedd5';
                      badgeColor = '#ea580c';
                      badgeLabel = '45+ días';
                    }

                    return (
                      <tr
                        key={nota.id}
                        className="responsive-table-row"
                        style={{ borderBottom: '1px solid #e5e7eb' }}
                      >
                        <td
                          className="desktop-cell-normal"
                          style={{
                            padding: '8px',
                            fontWeight: '600',
                            color: '#111827',
                          }}
                        >
                          {nota.sellerName}
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '8px', color: '#4b5563' }}
                        >
                          {nota.sellerCity}
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{
                            padding: '8px',
                            fontWeight: '600',
                            color: '#111827',
                          }}
                        >
                          {nota.clients?.name || 'N/A'}
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{
                            padding: '8px',
                            fontFamily: 'monospace',
                            color: '#111827',
                          }}
                        >
                          #{nota.transaction_number || nota.id.substring(0, 6)}
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '8px', color: '#111827' }}
                        >
                          {new Date(nota.created_at).toLocaleDateString()}
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '8px', textAlign: 'center' }}
                        >
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '800',
                              backgroundColor: badgeBg,
                              color: badgeColor,
                            }}
                          >
                            {nota.days} días ({badgeLabel})
                          </span>
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{
                            padding: '8px',
                            textAlign: 'right',
                            fontWeight: '700',
                            color: '#111827',
                          }}
                        >
                          ${Number(nota.final_price_usd || 0).toFixed(2)}
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{
                            padding: '8px',
                            textAlign: 'right',
                            fontWeight: '700',
                            color: '#dc2626',
                          }}
                        >
                          ${Number(nota.balance_due_usd || 0).toFixed(2)}
                        </td>
                        <td
                          className="desktop-cell-normal"
                          style={{ padding: '8px', textAlign: 'center' }}
                        >
                          <button
                            onClick={() => openViewNeModal(nota)}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontWeight: '700',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={10} /> Ver Detalle
                          </button>
                        </td>

                        {/* Vista Móvil Apilada */}
                        <td
                          className="mobile-cell-stacked"
                          style={{ display: 'none' }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderBottom: '1px solid #e5e7eb',
                              paddingBottom: '6px',
                            }}
                          >
                            <span
                              style={{
                                fontWeight: '800',
                                fontSize: '13px',
                                color: '#111827',
                              }}
                            >
                              {nota.clients?.name || 'N/A'}
                            </span>
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '800',
                                backgroundColor: badgeBg,
                                color: badgeColor,
                              }}
                            >
                              {nota.days} días · {badgeLabel}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                            }}
                          >
                            <span
                              style={{ color: '#4b5563', fontWeight: '600' }}
                            >
                              Vendedor / Zona:
                            </span>
                            <span
                              style={{ color: '#111827', fontWeight: '600' }}
                            >
                              {nota.sellerName} ({nota.sellerCity})
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                            }}
                          >
                            <span
                              style={{ color: '#4b5563', fontWeight: '600' }}
                            >
                              Transacción / Fecha:
                            </span>
                            <span style={{ color: '#111827' }}>
                              #
                              {nota.transaction_number ||
                                nota.id.substring(0, 6)}{' '}
                              · {new Date(nota.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                            }}
                          >
                            <span
                              style={{ color: '#4b5563', fontWeight: '600' }}
                            >
                              Total ($):
                            </span>
                            <span
                              style={{ fontWeight: '700', color: '#111827' }}
                            >
                              ${Number(nota.final_price_usd || 0).toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                            }}
                          >
                            <span
                              style={{ color: '#4b5563', fontWeight: '600' }}
                            >
                              Saldo ($):
                            </span>
                            <span
                              style={{ color: '#dc2626', fontWeight: '700' }}
                            >
                              ${Number(nota.balance_due_usd || 0).toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              marginTop: '6px',
                            }}
                          >
                            <button
                              onClick={() => openViewNeModal(nota)}
                              style={{
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Eye size={12} /> Ver Detalle
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
        ) : detailedHistoryView.active ? (
          /* ============ VISTA DE HISTORIAL DETALLADO / VER TODAS LAS NOTAS ============ */
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <button
                  onClick={() =>
                    setDetailedHistoryView({
                      active: false,
                      seller: null,
                      orders: [],
                    })
                  }
                  style={{
                    backgroundColor: '#111827',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  <ArrowLeft size={14} /> Volver al Módulo
                </button>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#111827',
                  }}
                >
                  Todas las Notas Históricas -{' '}
                  {detailedHistoryView.seller?.full_name} (
                  {detailedHistoryView.seller?.city})
                </h3>
              </div>

              {/* Buscador exclusivo para la sección de notas */}
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
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
                  placeholder="Buscar nota, cliente o estado..."
                  value={detailedSearchTerm}
                  onChange={(e) => setDetailedSearchTerm(e.target.value)}
                  style={{
                    padding: '6px 10px 6px 32px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '12px',
                    width: '220px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Ventana desplegable de Notas de Entrega con Antigüedad Crítica del vendedor */}
            {sellerAgingNotes.length > 0 && (
              <div className="admin-aging-section">
                <button
                  type="button"
                  onClick={() => setIsAgingOpen(!isAgingOpen)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div className="admin-aging-title" style={{ margin: 0 }}>
                    <AlertTriangle size={18} color="#d97706" />
                    Notas de Entrega con Antigüedad Crítica (
                    {sellerAgingNotes.length})
                  </div>
                  {isAgingOpen ? (
                    <ChevronUp size={18} color="#78350f" />
                  ) : (
                    <ChevronDown size={18} color="#78350f" />
                  )}
                </button>
                {isAgingOpen && (
                  <div
                    style={{
                      marginTop: '10px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {sellerAgingNotes.map((n) => {
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
                        <div
                          key={n.id}
                          className="admin-aging-item"
                          style={{ marginBottom: 0 }}
                        >
                          <div>
                            <strong>
                              N.E. #
                              {n.transaction_number || n.id.substring(0, 6)}
                            </strong>{' '}
                            — {n.clients?.name || 'Cliente'}
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
                  </div>
                )}
              </div>
            )}

            <MobileSortBar
              tabla="historialDetallado"
              sortConfig={sortConfig.historialDetallado}
              onSort={handleSort}
              options={[
                { key: 'clientName', label: 'Cliente' },
                { key: 'transaction', label: 'Transacción' },
                { key: 'created_at', label: 'Fecha' },
                { key: 'payment_status', label: 'Estado' },
                { key: 'final_price_usd', label: 'Total ($)' },
                { key: 'balance_due_usd', label: 'Saldo ($)' },
                { key: 'discount_percent', label: 'Desc. %' },
              ]}
            />

            <table
              className="custom-responsive-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
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
                  <SortableHeader
                    label="Cliente"
                    sortKey="clientName"
                    tabla="historialDetallado"
                    sortConfig={sortConfig.historialDetallado}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Transacción"
                    sortKey="transaction"
                    tabla="historialDetallado"
                    sortConfig={sortConfig.historialDetallado}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Fecha"
                    sortKey="created_at"
                    tabla="historialDetallado"
                    sortConfig={sortConfig.historialDetallado}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Estado"
                    sortKey="payment_status"
                    tabla="historialDetallado"
                    sortConfig={sortConfig.historialDetallado}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Total ($)"
                    sortKey="final_price_usd"
                    tabla="historialDetallado"
                    sortConfig={sortConfig.historialDetallado}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortableHeader
                    label="Saldo ($)"
                    sortKey="balance_due_usd"
                    tabla="historialDetallado"
                    sortConfig={sortConfig.historialDetallado}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortableHeader
                    label="Desc. %"
                    sortKey="discount_percent"
                    tabla="historialDetallado"
                    sortConfig={sortConfig.historialDetallado}
                    onSort={handleSort}
                    align="center"
                  />
                  <th style={{ padding: '10px', textAlign: 'center' }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDetailedHistoryOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: '#4b5563',
                      }}
                    >
                      No se encontraron notas registradas para este vendedor.
                    </td>
                  </tr>
                ) : (
                  filteredDetailedHistoryOrders.map((nota) => (
                    <tr
                      key={nota.id}
                      className="responsive-table-row"
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                    >
                      <td
                        className="desktop-cell-normal"
                        style={{
                          padding: '8px',
                          fontWeight: '600',
                          color: '#111827',
                        }}
                      >
                        {nota.clients?.name || 'N/A'}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{
                          padding: '8px',
                          fontFamily: 'monospace',
                          color: '#111827',
                        }}
                      >
                        #{nota.transaction_number || nota.id.substring(0, 6)}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '8px', color: '#111827' }}
                      >
                        {new Date(nota.created_at).toLocaleDateString()}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '8px' }}
                      >
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            backgroundColor:
                              nota.payment_status === 'cerrada'
                                ? '#DCFCE7'
                                : '#FEF3C7',
                            color:
                              nota.payment_status === 'cerrada'
                                ? '#15803D'
                                : '#B45309',
                          }}
                        >
                          {nota.payment_status.toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{
                          padding: '8px',
                          textAlign: 'right',
                          fontWeight: '700',
                          color: '#111827',
                        }}
                      >
                        ${Number(nota.final_price_usd).toFixed(2)}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{
                          padding: '8px',
                          textAlign: 'right',
                          color: '#dc2626',
                        }}
                      >
                        ${Number(nota.balance_due_usd).toFixed(2)}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{
                          padding: '8px',
                          textAlign: 'center',
                          color: '#4b5563',
                        }}
                      >
                        {nota.discount_percent
                          ? `${nota.discount_percent}%`
                          : '-'}
                      </td>
                      <td
                        className="desktop-cell-normal"
                        style={{ padding: '8px', textAlign: 'center' }}
                      >
                        <button
                          onClick={() => openViewNeModal(nota)}
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: '700',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={10} /> Ver Detalle
                        </button>
                      </td>
                      <td
                        className="mobile-cell-stacked"
                        style={{ display: 'none' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid #e5e7eb',
                            paddingBottom: '6px',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: '800',
                              fontSize: '13px',
                              color: '#111827',
                            }}
                          >
                            {nota.clients?.name || 'N/A'}
                          </span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '700',
                              backgroundColor:
                                nota.payment_status === 'cerrada'
                                  ? '#DCFCE7'
                                  : '#FEF3C7',
                              color:
                                nota.payment_status === 'cerrada'
                                  ? '#15803D'
                                  : '#B45309',
                            }}
                          >
                            {nota.payment_status.toUpperCase()}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ color: '#4b5563', fontWeight: '600' }}>
                            Transacción:
                          </span>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              color: '#111827',
                            }}
                          >
                            #
                            {nota.transaction_number || nota.id.substring(0, 6)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ color: '#4b5563', fontWeight: '600' }}>
                            Fecha:
                          </span>
                          <span style={{ color: '#111827' }}>
                            {new Date(nota.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ color: '#4b5563', fontWeight: '600' }}>
                            Total ($):
                          </span>
                          <span style={{ fontWeight: '700', color: '#111827' }}>
                            ${Number(nota.final_price_usd).toFixed(2)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ color: '#4b5563', fontWeight: '600' }}>
                            Saldo ($):
                          </span>
                          <span style={{ color: '#dc2626', fontWeight: '700' }}>
                            ${Number(nota.balance_due_usd).toFixed(2)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ color: '#4b5563', fontWeight: '600' }}>
                            Desc. %:
                          </span>
                          <span style={{ color: '#4b5563', fontWeight: '600' }}>
                            {nota.discount_percent
                              ? `${nota.discount_percent}%`
                              : '-'}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '8px',
                          }}
                        >
                          <button
                            onClick={() => openViewNeModal(nota)}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={12} /> Ver Detalle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {/* ============ PESTAÑA 1: EQUIPO ============ */}
            {activeTab === 'equipo' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '800',
                      color: '#111827',
                    }}
                  >
                    Resumen del Equipo por Zona / Estado ({selectedMonth})
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4b5563' }}>
                    Visualización consolidada de facturación y por cobrar
                    agrupada por zona.
                  </p>
                </div>

                <MobileSortBar
                  tabla="equipoZona"
                  sortConfig={sortConfig.equipoZona}
                  onSort={handleSort}
                  options={[
                    { key: 'zone', label: 'Zona / Estado' },
                    { key: 'vendedoresCount', label: 'Cant. Vendedores' },
                    { key: 'facturado', label: 'Total Facturado ($)' },
                    { key: 'porCobrar', label: 'Por Cobrar ($)' },
                  ]}
                />

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
                        color: '#4b5563',
                      }}
                    >
                      <SortableHeader
                        label="Zona / Estado"
                        sortKey="zone"
                        tabla="equipoZona"
                        sortConfig={sortConfig.equipoZona}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Cant. Vendedores"
                        sortKey="vendedoresCount"
                        tabla="equipoZona"
                        sortConfig={sortConfig.equipoZona}
                        onSort={handleSort}
                        align="center"
                      />
                      <SortableHeader
                        label="Total Facturado ($)"
                        sortKey="facturado"
                        tabla="equipoZona"
                        sortConfig={sortConfig.equipoZona}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortableHeader
                        label="Por Cobrar ($)"
                        sortKey="porCobrar"
                        tabla="equipoZona"
                        sortConfig={sortConfig.equipoZona}
                        onSort={handleSort}
                        align="right"
                      />
                      <th style={{ padding: '10px', textAlign: 'center' }}>
                        Estadística
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEquiposPorZona.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#4b5563',
                          }}
                        >
                          No hay datos de equipo para el mes y zona
                          seleccionados.
                        </td>
                      </tr>
                    ) : (
                      sortedEquiposPorZona.map((item) => (
                        <tr
                          key={item.zone}
                          className="responsive-table-row"
                          style={{ borderBottom: '1px solid #e5e7eb' }}
                        >
                          <td
                            className="desktop-cell-normal"
                            style={{
                              padding: '12px',
                              fontWeight: '700',
                              color: '#111827',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <MapPin size={14} color="#dc2626" /> {item.zone}
                            </div>
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{
                              padding: '12px',
                              textAlign: 'center',
                              fontWeight: '600',
                              color: '#4b5563',
                            }}
                          >
                            {item.vendedoresCount}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{
                              padding: '12px',
                              textAlign: 'right',
                              fontWeight: '700',
                              color: '#111827',
                            }}
                          >
                            $
                            {item.facturado.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{
                              padding: '12px',
                              textAlign: 'right',
                              fontWeight: '700',
                              color: '#dc2626',
                            }}
                          >
                            {selectedMonth === currentRealMonth
                              ? `$${item.porCobrar.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : 'N/A'}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '12px', textAlign: 'center' }}
                          >
                            <button
                              onClick={() => openZoneStatsModal(item)}
                              style={{
                                ...actionButtonStyle,
                                padding: '6px 10px',
                              }}
                            >
                              <BarChart2 size={13} /> Estadística
                            </button>
                          </td>
                          <td
                            className="mobile-cell-stacked"
                            style={{ display: 'none' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #e5e7eb',
                                paddingBottom: '6px',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: '800',
                                  fontSize: '14px',
                                  color: '#111827',
                                }}
                              >
                                Zona: {item.zone}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '700',
                                }}
                              >
                                {item.vendedoresCount} Vendedores
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '12px',
                              }}
                            >
                              <span
                                style={{ color: '#4b5563', fontWeight: '600' }}
                              >
                                Total Facturado:
                              </span>
                              <span
                                style={{ fontWeight: '700', color: '#111827' }}
                              >
                                $
                                {item.facturado.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '12px',
                              }}
                            >
                              <span
                                style={{ color: '#4b5563', fontWeight: '600' }}
                              >
                                Por Cobrar (Comisión):
                              </span>
                              <span
                                style={{ fontWeight: '700', color: '#dc2626' }}
                              >
                                {selectedMonth === currentRealMonth
                                  ? `$${item.porCobrar.toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginTop: '6px',
                                paddingTop: '6px',
                                borderTop: '1px dashed #e5e7eb',
                              }}
                            >
                              <button
                                onClick={() => openZoneStatsModal(item)}
                                style={{
                                  ...actionButtonStyle,
                                  width: '100%',
                                  padding: '7px 12px',
                                }}
                              >
                                <BarChart2 size={13} /> Estadística Mensual
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ============ PESTAÑA 2: SUPERVISAR VISITAS ============ */}
            {activeTab === 'supervisar' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '10px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#4b5563',
                      fontWeight: '500',
                    }}
                  >
                    Filtrar:
                  </span>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: visitFilters.official ? '#15803D' : '#4b5563',
                      fontWeight: visitFilters.official ? '600' : '400',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={visitFilters.official}
                      onChange={(e) =>
                        setVisitFilters((prev) => ({
                          ...prev,
                          official: e.target.checked,
                        }))
                      }
                      style={{
                        accentColor: '#10B981',
                        cursor: 'pointer',
                        width: '12px',
                        height: '12px',
                        margin: 0,
                      }}
                    />
                    <span>Oficiales</span>
                    <span style={{ fontSize: '9px', color: '#4b5563' }}>
                      ({teamClients.length})
                    </span>
                  </label>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: visitFilters.potential ? '#B45309' : '#4b5563',
                      fontWeight: visitFilters.potential ? '600' : '400',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={visitFilters.potential}
                      onChange={(e) =>
                        setVisitFilters((prev) => ({
                          ...prev,
                          potential: e.target.checked,
                        }))
                      }
                      style={{
                        accentColor: '#F59E0B',
                        cursor: 'pointer',
                        width: '12px',
                        height: '12px',
                        margin: 0,
                      }}
                    />
                    <span>Potenciales</span>
                    <span style={{ fontSize: '9px', color: '#4b5563' }}>
                      ({teamPotentials.length})
                    </span>
                  </label>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#4b5563',
                      marginLeft: 'auto',
                    }}
                  >
                    {sortedVisits.length} de {allVisits.length}
                  </span>
                </div>

                <MobileSortBar
                  tabla="visitas"
                  sortConfig={sortConfig.visitas}
                  onSort={handleSort}
                  options={[
                    { key: 'name', label: 'Nombre / CI / RIF' },
                    { key: 'registeredBy', label: 'Asignado a' },
                    { key: 'nePendientes', label: 'N.E. Pendientes' },
                    { key: 'neCerradas', label: 'N.E. Cerradas' },
                    { key: 'lastVisit', label: 'Última Visita' },
                  ]}
                />

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
                        color: '#4b5563',
                      }}
                    >
                      <SortableHeader
                        label="Nombre / CI / RIF"
                        sortKey="name"
                        tabla="visitas"
                        sortConfig={sortConfig.visitas}
                        onSort={handleSort}
                      />
                      <th style={{ padding: '10px' }}>Datos Adjuntos</th>
                      <SortableHeader
                        label="Asignado a"
                        sortKey="registeredBy"
                        tabla="visitas"
                        sortConfig={sortConfig.visitas}
                        onSort={handleSort}
                      />
                      <th style={{ padding: '10px', textAlign: 'center' }}>
                        GPS Visita
                      </th>
                      <SortableHeader
                        label="N.E. Pendientes"
                        sortKey="nePendientes"
                        tabla="visitas"
                        sortConfig={sortConfig.visitas}
                        onSort={handleSort}
                        align="center"
                      />
                      <SortableHeader
                        label="N.E. Cerradas"
                        sortKey="neCerradas"
                        tabla="visitas"
                        sortConfig={sortConfig.visitas}
                        onSort={handleSort}
                        align="center"
                      />
                      <SortableHeader
                        label="Última Visita"
                        sortKey="lastVisit"
                        tabla="visitas"
                        sortConfig={sortConfig.visitas}
                        onSort={handleSort}
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVisits.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#4b5563',
                          }}
                        >
                          No hay clientes o potenciales en el equipo asignado.
                        </td>
                      </tr>
                    ) : (
                      sortedVisits.map((client) => {
                        const isPotential = client.is_potential;
                        const nePendientes = (client.sales_orders || []).filter(
                          (o) => o.payment_status !== 'cerrada'
                        ).length;
                        const neCerradas = (client.sales_orders || []).filter(
                          (o) => o.payment_status === 'cerrada'
                        ).length;
                        const mapsUrl = client.last_gps_location
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${client.last_gps_location.lat},${client.last_gps_location.lng}`
                            )}`
                          : null;
                        return (
                          <tr
                            key={client.id}
                            className="responsive-table-row"
                            style={{ borderBottom: '1px solid #e5e7eb' }}
                          >
                            {/* Escritorio */}
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
                                <span
                                  style={{
                                    fontWeight: '600',
                                    color: '#111827',
                                  }}
                                >
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
                              <div
                                style={{ fontSize: '11px', color: '#4b5563' }}
                              >
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
                                    onClick={() =>
                                      setImageModal({
                                        open: true,
                                        url: client.ci_photo_url,
                                        title: `C.I. de ${client.name}`,
                                      })
                                    }
                                  />
                                )}
                                {!isPotential && client.rif_photo_url && (
                                  <DocBadge
                                    label="RIF"
                                    onClick={() =>
                                      setImageModal({
                                        open: true,
                                        url: client.rif_photo_url,
                                        title: `RIF de ${client.name}`,
                                      })
                                    }
                                  />
                                )}
                                {client.additional_doc_url && (
                                  <DocBadge
                                    label="Adic."
                                    onClick={() =>
                                      setImageModal({
                                        open: true,
                                        url: client.additional_doc_url,
                                        title: `Doc. Adic. de ${client.name}`,
                                      })
                                    }
                                  />
                                )}
                                {client.last_visit_photo_url && (
                                  <DocBadge
                                    label="Foto"
                                    onClick={() =>
                                      setImageModal({
                                        open: true,
                                        url: client.last_visit_photo_url,
                                        title: `Visita a ${client.name}`,
                                      })
                                    }
                                  />
                                )}
                              </div>
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                fontSize: '12px',
                                color: '#111827',
                              }}
                            >
                              {editingAssignmentId === client.id ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: '4px',
                                    alignItems: 'center',
                                  }}
                                >
                                  <select
                                    value={tempAssignmentUserId}
                                    onChange={(e) =>
                                      setTempAssignmentUserId(e.target.value)
                                    }
                                    style={{
                                      padding: '4px',
                                      borderRadius: '4px',
                                      border: '1px solid #d1d5db',
                                      fontSize: '11px',
                                      maxWidth: '150px',
                                      backgroundColor: '#ffffff',
                                    }}
                                  >
                                    <option value="">Sin Asignar</option>
                                    {vendedores.map((v) => (
                                      <option key={v.id} value={v.id}>
                                        {v.full_name || 'Sin Nombre'} ({v.role})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() =>
                                      saveAssignmentChange(client.id)
                                    }
                                    disabled={savingAssignment}
                                    style={{
                                      backgroundColor: '#10B981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '4px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    title="Guardar Asignación"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingAssignmentId(null)}
                                    style={{
                                      backgroundColor: '#EF4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '4px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    title="Cancelar"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    startEditingAssignment(
                                      client.id,
                                      client.assigned_seller_id
                                    )
                                  }
                                  style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                  title="Click para editar asignación"
                                >
                                  <span>
                                    {client.profiles?.full_name ||
                                      'Sin Asignar'}
                                  </span>
                                  <ChevronDown size={12} color="#9CA3AF" />
                                </div>
                              )}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{ padding: '10px', textAlign: 'center' }}
                            >
                              {mapsUrl ? (
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    backgroundColor: '#EFF6FF',
                                    color: '#1D4ED8',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                  }}
                                >
                                  <MapPin size={12} /> Ver Mapa
                                </a>
                              ) : (
                                <span
                                  style={{ fontSize: '11px', color: '#4b5563' }}
                                >
                                  Sin GPS
                                </span>
                              )}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                textAlign: 'center',
                                color: '#dc2626',
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
                              style={{
                                padding: '10px',
                                fontSize: '12px',
                                color: '#111827',
                              }}
                            >
                              {client.last_visit_at
                                ? new Date(
                                    client.last_visit_at
                                  ).toLocaleDateString()
                                : 'Sin registro'}
                            </td>
                            {/* Móvil: Tarjeta Apilada */}
                            <td
                              className="mobile-cell-stacked"
                              style={{ display: 'none' }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  borderBottom: '1px solid #e5e7eb',
                                  paddingBottom: '6px',
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: '800',
                                    fontSize: '14px',
                                    color: '#111827',
                                  }}
                                >
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
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  Asignado a:
                                </span>
                                {editingAssignmentId === client.id ? (
                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: '4px',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <select
                                      value={tempAssignmentUserId}
                                      onChange={(e) =>
                                        setTempAssignmentUserId(e.target.value)
                                      }
                                      style={{
                                        padding: '4px',
                                        borderRadius: '4px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '11px',
                                        maxWidth: '140px',
                                        backgroundColor: '#ffffff',
                                      }}
                                    >
                                      <option value="">Sin Asignar</option>
                                      {vendedores.map((v) => (
                                        <option key={v.id} value={v.id}>
                                          {v.full_name || 'Sin Nombre'}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() =>
                                        saveAssignmentChange(client.id)
                                      }
                                      disabled={savingAssignment}
                                      style={{
                                        backgroundColor: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Check size={12} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setEditingAssignmentId(null)
                                      }
                                      style={{
                                        backgroundColor: '#EF4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() =>
                                      startEditingAssignment(
                                        client.id,
                                        client.assigned_seller_id
                                      )
                                    }
                                    style={{
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      color: '#111827',
                                      fontWeight: '600',
                                    }}
                                  >
                                    <span>
                                      {client.profiles?.full_name ||
                                        'Sin Asignar'}
                                    </span>
                                    <ChevronDown size={12} color="#9CA3AF" />
                                  </div>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  GPS Visita:
                                </span>
                                <span>
                                  {mapsUrl ? (
                                    <a
                                      href={mapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: '#1D4ED8',
                                        textDecoration: 'none',
                                        fontWeight: '700',
                                      }}
                                    >
                                      Ver Mapa
                                    </a>
                                  ) : (
                                    <span style={{ color: '#4b5563' }}>
                                      Sin GPS
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  N.E. Pendientes:
                                </span>
                                <span
                                  style={{
                                    color: '#dc2626',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {nePendientes}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  N.E. Cerradas:
                                </span>
                                <span
                                  style={{
                                    color: '#10B981',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {neCerradas}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  Última Visita:
                                </span>
                                <span style={{ color: '#111827' }}>
                                  {client.last_visit_at
                                    ? new Date(
                                        client.last_visit_at
                                      ).toLocaleDateString()
                                    : 'Sin registro'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </>
            )}

            {/* ============ PESTAÑA 3: METAS ============ */}
            {activeTab === 'metas' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '800',
                      color: '#111827',
                    }}
                  >
                    Gestión y Cumplimiento de Metas ({selectedMonth})
                  </h3>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '12px',
                      color: '#4b5563',
                    }}
                  >
                    Comparativa directa entre la meta asignada y el monto total
                    facturado en el mes calendario.
                  </p>
                </div>

                <MobileSortBar
                  tabla="metas"
                  sortConfig={sortConfig.metas}
                  onSort={handleSort}
                  options={[
                    { key: 'full_name', label: 'Vendedor' },
                    { key: 'city', label: 'Zona' },
                    { key: 'sales_goal_usd', label: 'Meta Asignada ($)' },
                    { key: 'facturado', label: 'Facturado Mes ($)' },
                    { key: 'porcentajeCumplimiento', label: '% Cumplimiento' },
                  ]}
                />

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
                        color: '#4b5563',
                      }}
                    >
                      <SortableHeader
                        label="Vendedor"
                        sortKey="full_name"
                        tabla="metas"
                        sortConfig={sortConfig.metas}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Zona"
                        sortKey="city"
                        tabla="metas"
                        sortConfig={sortConfig.metas}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Meta Asignada ($)"
                        sortKey="sales_goal_usd"
                        tabla="metas"
                        sortConfig={sortConfig.metas}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Facturado Mes ($)"
                        sortKey="facturado"
                        tabla="metas"
                        sortConfig={sortConfig.metas}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="% Cumplimiento"
                        sortKey="porcentajeCumplimiento"
                        tabla="metas"
                        sortConfig={sortConfig.metas}
                        onSort={handleSort}
                      />
                      <th style={{ padding: '10px', textAlign: 'center' }}>
                        Estadística
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMetas.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#4b5563',
                          }}
                        >
                          No hay vendedores asignados en la estructura.
                        </td>
                      </tr>
                    ) : (
                      sortedMetas.map((v) => (
                        <tr
                          key={v.id}
                          className="responsive-table-row"
                          style={{ borderBottom: '1px solid #e5e7eb' }}
                        >
                          <td
                            className="desktop-cell-normal"
                            style={{
                              padding: '10px',
                              fontWeight: '600',
                              color: '#111827',
                            }}
                          >
                            {v.full_name || 'Sin Nombre'}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px', color: '#4b5563' }}
                          >
                            {v.city || 'N/A'}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <input
                                type="number"
                                value={v.sales_goal_usd}
                                onChange={(e) =>
                                  handleGoalChange(v.id, e.target.value)
                                }
                                style={{
                                  width: '90px',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  border: '1px solid #d1d5db',
                                  fontSize: '12px',
                                }}
                              />
                              <button
                                onClick={() => handleSaveSeller(v)}
                                disabled={savingId === v.id}
                                style={{
                                  backgroundColor: '#111827',
                                  color: '#D4AF37',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontWeight: '700',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Save size={10} />{' '}
                                {savingId === v.id ? '...' : 'Guardar'}
                              </button>
                            </div>
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{
                              padding: '10px',
                              fontWeight: '700',
                              color: '#111827',
                            }}
                          >
                            $
                            {(v.facturado || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  backgroundColor: '#e5e7eb',
                                  borderRadius: '4px',
                                  height: '8px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      v.porcentajeCumplimiento
                                    )}%`,
                                    backgroundColor:
                                      v.porcentajeCumplimiento >= 100
                                        ? '#10B981'
                                        : '#dc2626',
                                    height: '100%',
                                  }}
                                ></div>
                              </div>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  color:
                                    v.porcentajeCumplimiento >= 100
                                      ? '#10B981'
                                      : '#dc2626',
                                }}
                              >
                                {v.porcentajeCumplimiento}%
                              </span>
                            </div>
                          </td>
                          <td
                            className="desktop-cell-normal"
                            style={{ padding: '10px', textAlign: 'center' }}
                          >
                            <button
                              onClick={() => openSellerStatsModal(v)}
                              style={{
                                ...actionButtonStyle,
                                padding: '5px 10px',
                              }}
                            >
                              <BarChart2 size={12} /> Estadística
                            </button>
                          </td>
                          <td
                            className="mobile-cell-stacked"
                            style={{ display: 'none' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #e5e7eb',
                                paddingBottom: '6px',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: '800',
                                  fontSize: '14px',
                                  color: '#111827',
                                }}
                              >
                                {v.full_name || 'Sin Nombre'}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  backgroundColor: '#f3f4f6',
                                  color: '#4b5563',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '600',
                                }}
                              >
                                {v.city || 'N/A'}
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                fontSize: '12px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  Meta Asignada ($):
                                </span>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <input
                                    type="number"
                                    value={v.sales_goal_usd}
                                    onChange={(e) =>
                                      handleGoalChange(v.id, e.target.value)
                                    }
                                    style={{
                                      width: '85px',
                                      padding: '4px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid #d1d5db',
                                      fontSize: '12px',
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveSeller(v)}
                                    disabled={savingId === v.id}
                                    style={{
                                      backgroundColor: '#111827',
                                      color: '#D4AF37',
                                      border: 'none',
                                      padding: '5px 8px',
                                      borderRadius: '4px',
                                      fontWeight: '700',
                                      fontSize: '10px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <Save size={10} />{' '}
                                    {savingId === v.id ? '...' : 'Guardar'}
                                  </button>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  Facturado Mes ($):
                                </span>
                                <span
                                  style={{
                                    color: '#111827',
                                    fontWeight: '700',
                                  }}
                                >
                                  $
                                  {(v.facturado || 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '11px',
                                  }}
                                >
                                  <span
                                    style={{
                                      color: '#4b5563',
                                      fontWeight: '600',
                                    }}
                                  >
                                    % Cumplimiento:
                                  </span>
                                  <span
                                    style={{
                                      fontWeight: '800',
                                      color:
                                        v.porcentajeCumplimiento >= 100
                                          ? '#10B981'
                                          : '#dc2626',
                                    }}
                                  >
                                    {v.porcentajeCumplimiento}%
                                  </span>
                                </div>
                                <div
                                  style={{
                                    width: '100%',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '6px',
                                    height: '10px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        v.porcentajeCumplimiento
                                      )}%`,
                                      backgroundColor:
                                        v.porcentajeCumplimiento >= 100
                                          ? '#10B981'
                                          : '#dc2626',
                                      height: '100%',
                                      transition: 'width 0.3s ease',
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div
                                style={{
                                  marginTop: '4px',
                                  paddingTop: '6px',
                                  borderTop: '1px dashed #e5e7eb',
                                }}
                              >
                                <button
                                  onClick={() => openSellerStatsModal(v)}
                                  style={{
                                    ...actionButtonStyle,
                                    width: '100%',
                                    padding: '7px 12px',
                                  }}
                                >
                                  <BarChart2 size={13} /> Estadística Mensual
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ============ PESTAÑA 4: HISTORIAL DE EQUIPO ============ */}
            {activeTab === 'historialEquipo' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {/* Barra de filtro por Ciclo Quincenal */}
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
                  <div>
                    <h3
                      style={{
                        margin: '0 0 2px 0',
                        fontSize: '16px',
                        fontWeight: '800',
                        color: '#111827',
                      }}
                    >
                      Historial Operativo y Liquidaciones ({selectedMonth})
                    </h3>
                    <p
                      style={{ margin: 0, fontSize: '12px', color: '#4b5563' }}
                    >
                      Facturado, Por Cobrar (comisiones históricas cerradas) y
                      Ganancias Liquidadas.
                    </p>
                  </div>

                  {/* Selector de Ciclo Quincenal */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Clock size={16} color="#dc2626" />
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#374151',
                      }}
                    >
                      Ciclo Quincenal:
                    </span>
                    <div
                      style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}
                    >
                      {[
                        { id: 'TODOS', label: 'Mes Completo' },
                        { id: '1', label: 'Ciclo 1 (1ra Q)' },
                        { id: '2', label: 'Ciclo 2 (2da Q)' },
                      ].map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCycle(c.id)}
                          style={{
                            padding: '6px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            borderRadius: '6px',
                            border:
                              selectedCycle === c.id
                                ? '1px solid #dc2626'
                                : '1px solid #d1d5db',
                            backgroundColor:
                              selectedCycle === c.id ? '#dc2626' : '#ffffff',
                            color:
                              selectedCycle === c.id ? '#ffffff' : '#374151',
                            cursor: 'pointer',
                          }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <MobileSortBar
                  tabla="historialEquipo"
                  sortConfig={sortConfig.historialEquipo}
                  onSort={handleSort}
                  options={[
                    { key: 'full_name', label: 'Vendedor' },
                    { key: 'city', label: 'Zona' },
                    { key: 'totalNE', label: 'N.E.' },
                    { key: 'facturado', label: 'Facturado ($)' },
                    { key: 'totalNeCerradas', label: 'N.E. Cerradas' },
                    {
                      key: 'antiguedadCriticaCount',
                      label: 'Antigüedad Crítica',
                    },
                    { key: 'porCobrar', label: 'Por Cobrar ($)' },
                    { key: 'liquidadoGanancias', label: 'Liquidado ($)' },
                  ]}
                />

                {/* TABLA UNIFICADA DE HISTORIAL Y ACCIONES POR VENDEDOR */}
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
                        color: '#4b5563',
                      }}
                    >
                      <SortableHeader
                        label="Vendedor"
                        sortKey="full_name"
                        tabla="historialEquipo"
                        sortConfig={sortConfig.historialEquipo}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Zona"
                        sortKey="city"
                        tabla="historialEquipo"
                        sortConfig={sortConfig.historialEquipo}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="N.E."
                        sortKey="totalNE"
                        tabla="historialEquipo"
                        sortConfig={sortConfig.historialEquipo}
                        onSort={handleSort}
                        align="center"
                      />
                      <SortableHeader
                        label="Facturado ($)"
                        sortKey="facturado"
                        tabla="historialEquipo"
                        sortConfig={sortConfig.historialEquipo}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortableHeader
                        label="N.E. Cerradas"
                        sortKey="totalNeCerradas"
                        tabla="historialEquipo"
                        sortConfig={sortConfig.historialEquipo}
                        onSort={handleSort}
                        align="center"
                      />
                      <SortableHeader
                        label="Antigüedad Crítica"
                        sortKey="antiguedadCriticaCount"
                        tabla="historialEquipo"
                        sortConfig={sortConfig.historialEquipo}
                        onSort={handleSort}
                        align="center"
                      />
                      <SortableHeader
                        label="Por Cobrar ($)"
                        sortKey="porCobrar"
                        tabla="historialEquipo"
                        sortConfig={sortConfig.historialEquipo}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortableHeader
                        label="Liquidado ($)"
                        sortKey="liquidadoGanancias"
                        tabla="historialEquipo"
                        sortConfig={sortConfig.historialEquipo}
                        onSort={handleSort}
                        align="right"
                      />
                      <th style={{ padding: '10px', textAlign: 'center' }}>
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistorialEquipo.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#4b5563',
                          }}
                        >
                          No hay registros en este período.
                        </td>
                      </tr>
                    ) : (
                      sortedHistorialEquipo.map((v) => {
                        const sellerLiqs = teamSettlements.filter(
                          (s) =>
                            String(s.user_id).trim() === String(v.id).trim()
                        );

                        const liqCiclo1 = sellerLiqs.find(
                          (s) => String(s.cycle) === '1'
                        );
                        const liqCiclo2 = sellerLiqs.find(
                          (s) => String(s.cycle) === '2'
                        );

                        return (
                          <tr
                            key={v.id}
                            className="responsive-table-row"
                            style={{ borderBottom: '1px solid #e5e7eb' }}
                          >
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                fontWeight: '600',
                                color: '#111827',
                              }}
                            >
                              {v.full_name || 'Sin Nombre'}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{ padding: '10px', color: '#4b5563' }}
                            >
                              {editingZoneSellerId === v.id ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: '4px',
                                    alignItems: 'center',
                                  }}
                                >
                                  <select
                                    value={tempSellerZone}
                                    onChange={(e) =>
                                      setTempSellerZone(e.target.value)
                                    }
                                    style={{
                                      padding: '4px',
                                      borderRadius: '4px',
                                      border: '1px solid #d1d5db',
                                      fontSize: '11px',
                                      maxWidth: '140px',
                                      backgroundColor: '#ffffff',
                                    }}
                                  >
                                    <option value="">Sin Zona</option>
                                    {ESTADOS_VENEZUELA.map((estado) => (
                                      <option key={estado} value={estado}>
                                        {estado}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => saveSellerZoneChange(v.id)}
                                    disabled={savingSellerZone}
                                    style={{
                                      backgroundColor: '#10B981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '4px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    title="Guardar Zona"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingZoneSellerId(null)}
                                    style={{
                                      backgroundColor: '#EF4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '4px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    title="Cancelar"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    startEditingSellerZone(v.id, v.city)
                                  }
                                  style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                  title="Click para editar zona (Estado)"
                                >
                                  <span>{v.city || 'N/A'}</span>
                                  <ChevronDown size={12} color="#9CA3AF" />
                                </div>
                              )}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                textAlign: 'center',
                                fontWeight: '700',
                                color: '#111827',
                              }}
                            >
                              {v.totalNE}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                textAlign: 'right',
                                fontWeight: '700',
                                color: '#111827',
                              }}
                            >
                              $
                              {(v.displayFacturado || 0).toLocaleString(
                                'en-US',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                textAlign: 'center',
                                fontWeight: '700',
                                color: '#10B981',
                              }}
                            >
                              {v.totalNeCerradas || 0}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                textAlign: 'center',
                                fontWeight: '800',
                                color:
                                  (v.antiguedadCriticaCount || 0) > 0
                                    ? '#d97706'
                                    : '#6b7280',
                              }}
                            >
                              {v.antiguedadCriticaCount || 0}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                textAlign: 'right',
                                fontWeight: '700',
                                color: '#dc2626',
                              }}
                            >
                              {selectedMonth === currentRealMonth
                                ? `$${(v.displayPorCobrar || 0).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}`
                                : 'N/A'}
                            </td>
                            <td
                              className="desktop-cell-normal"
                              style={{
                                padding: '10px',
                                textAlign: 'right',
                                fontWeight: '700',
                                color: '#10B981',
                              }}
                            >
                              $
                              {(v.liquidadoGanancias || 0).toLocaleString(
                                'en-US',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </td>

                            {/* COLUMNA UNIFICADA DE ACCIÓN (3 BOTONES) */}
                            <td
                              className="desktop-cell-normal"
                              style={{ padding: '10px', textAlign: 'center' }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <button
                                  onClick={() => openDetailedHistoryPanel(v)}
                                  style={{
                                    ...actionButtonStyle,
                                    width: '156px',
                                  }}
                                >
                                  <Eye size={12} /> Ver Notas
                                </button>
                                {(selectedCycle === 'TODOS' ||
                                  selectedCycle === '1') && (
                                  <button
                                    onClick={() =>
                                      liqCiclo1 &&
                                      setLiquidationInvoiceModal({
                                        open: true,
                                        liquidation: liqCiclo1,
                                      })
                                    }
                                    disabled={!liqCiclo1}
                                    title={
                                      liqCiclo1
                                        ? 'Ver Liquidación 1 Ciclo'
                                        : 'Sin liquidación en 1 Ciclo'
                                    }
                                    style={{
                                      ...actionButtonStyle,
                                      width: '156px',
                                      opacity: liqCiclo1 ? 1 : 0.45,
                                      cursor: liqCiclo1
                                        ? 'pointer'
                                        : 'not-allowed',
                                    }}
                                  >
                                    <Receipt size={12} /> Ver Liquidación 1
                                    Ciclo
                                  </button>
                                )}
                                {(selectedCycle === 'TODOS' ||
                                  selectedCycle === '2') && (
                                  <button
                                    onClick={() =>
                                      liqCiclo2 &&
                                      setLiquidationInvoiceModal({
                                        open: true,
                                        liquidation: liqCiclo2,
                                      })
                                    }
                                    disabled={!liqCiclo2}
                                    title={
                                      liqCiclo2
                                        ? 'Ver Liquidación 2 Ciclo'
                                        : 'Sin liquidación en 2 Ciclo'
                                    }
                                    style={{
                                      ...actionButtonStyle,
                                      width: '156px',
                                      opacity: liqCiclo2 ? 1 : 0.45,
                                      cursor: liqCiclo2
                                        ? 'pointer'
                                        : 'not-allowed',
                                    }}
                                  >
                                    <Receipt size={12} /> Ver Liquidación 2
                                    Ciclo
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Vista Móvil Apilada */}
                            <td
                              className="mobile-cell-stacked"
                              style={{ display: 'none' }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  borderBottom: '1px solid #e5e7eb',
                                  paddingBottom: '6px',
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: '800',
                                    fontSize: '14px',
                                    color: '#111827',
                                  }}
                                >
                                  {v.full_name || 'Sin Nombre'}
                                </span>
                                {editingZoneSellerId !== v.id && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditingSellerZone(v.id, v.city)
                                    }
                                    style={{
                                      fontSize: '11px',
                                      backgroundColor: '#f3f4f6',
                                      color: '#4b5563',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      fontWeight: '600',
                                      border: '1px dashed #d1d5db',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span>{v.city || 'N/A'}</span>
                                    <ChevronDown size={12} color="#9CA3AF" />
                                  </button>
                                )}
                              </div>
                              {editingZoneSellerId === v.id && (
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '6px 0',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      color: '#4b5563',
                                    }}
                                  >
                                    Zona (Estado):
                                  </span>
                                  <select
                                    value={tempSellerZone}
                                    onChange={(e) =>
                                      setTempSellerZone(e.target.value)
                                    }
                                    style={{
                                      padding: '10px',
                                      borderRadius: '6px',
                                      border: '1px solid #d1d5db',
                                      fontSize: '13px',
                                      width: '100%',
                                      minHeight: '42px',
                                      backgroundColor: '#ffffff',
                                    }}
                                  >
                                    <option value="">Sin Zona</option>
                                    {ESTADOS_VENEZUELA.map((estado) => (
                                      <option key={estado} value={estado}>
                                        {estado}
                                      </option>
                                    ))}
                                  </select>
                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: '8px',
                                      width: '100%',
                                    }}
                                  >
                                    <button
                                      onClick={() => saveSellerZoneChange(v.id)}
                                      disabled={savingSellerZone}
                                      style={{
                                        flex: 1,
                                        backgroundColor: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontWeight: '700',
                                        fontSize: '13px',
                                      }}
                                    >
                                      <Check size={16} />
                                      <span>Guardar</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        setEditingZoneSellerId(null)
                                      }
                                      style={{
                                        flex: 1,
                                        backgroundColor: '#EF4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontWeight: '700',
                                        fontSize: '13px',
                                      }}
                                    >
                                      <X size={16} />
                                      <span>Cancelar</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  N.E. (Mes / Ciclo):
                                </span>
                                <span
                                  style={{
                                    fontWeight: '700',
                                    color: '#111827',
                                  }}
                                >
                                  {v.totalNE}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  Facturado:
                                </span>
                                <span
                                  style={{
                                    fontWeight: '700',
                                    color: '#111827',
                                  }}
                                >
                                  $
                                  {(v.displayFacturado || 0).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  N.E. Cerradas (Total):
                                </span>
                                <span
                                  style={{
                                    fontWeight: '700',
                                    color: '#10B981',
                                  }}
                                >
                                  {v.totalNeCerradas || 0}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  Antigüedad Crítica:
                                </span>
                                <span
                                  style={{
                                    fontWeight: '800',
                                    color:
                                      (v.antiguedadCriticaCount || 0) > 0
                                        ? '#d97706'
                                        : '#6b7280',
                                  }}
                                >
                                  {v.antiguedadCriticaCount || 0}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  Por Cobrar:
                                </span>
                                <span
                                  style={{
                                    fontWeight: '700',
                                    color: '#dc2626',
                                  }}
                                >
                                  {selectedMonth === currentRealMonth
                                    ? `$${(
                                        v.displayPorCobrar || 0
                                      ).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}`
                                    : 'N/A'}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#4b5563',
                                    fontWeight: '600',
                                  }}
                                >
                                  Liquidado:
                                </span>
                                <span
                                  style={{
                                    fontWeight: '700',
                                    color: '#10B981',
                                  }}
                                >
                                  $
                                  {(v.liquidadoGanancias || 0).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  fontSize: '12px',
                                  marginTop: '6px',
                                  paddingTop: '6px',
                                  borderTop: '1px dashed #e5e7eb',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#111827',
                                    fontWeight: '700',
                                  }}
                                >
                                  Acción:
                                </span>
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: '6px',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <button
                                    onClick={() => openDetailedHistoryPanel(v)}
                                    style={{
                                      ...actionButtonStyle,
                                      padding: '5px 8px',
                                      fontSize: '10px',
                                    }}
                                  >
                                    <Eye size={11} /> Ver Notas
                                  </button>
                                  {(selectedCycle === 'TODOS' ||
                                    selectedCycle === '1') && (
                                    <button
                                      onClick={() =>
                                        liqCiclo1 &&
                                        setLiquidationInvoiceModal({
                                          open: true,
                                          liquidation: liqCiclo1,
                                        })
                                      }
                                      disabled={!liqCiclo1}
                                      style={{
                                        ...actionButtonStyle,
                                        padding: '5px 8px',
                                        fontSize: '10px',
                                        opacity: liqCiclo1 ? 1 : 0.45,
                                        cursor: liqCiclo1
                                          ? 'pointer'
                                          : 'not-allowed',
                                      }}
                                    >
                                      <Receipt size={11} /> Ver Liquidación 1
                                      Ciclo
                                    </button>
                                  )}
                                  {(selectedCycle === 'TODOS' ||
                                    selectedCycle === '2') && (
                                    <button
                                      onClick={() =>
                                        liqCiclo2 &&
                                        setLiquidationInvoiceModal({
                                          open: true,
                                          liquidation: liqCiclo2,
                                        })
                                      }
                                      disabled={!liqCiclo2}
                                      style={{
                                        ...actionButtonStyle,
                                        padding: '5px 8px',
                                        fontSize: '10px',
                                        opacity: liqCiclo2 ? 1 : 0.45,
                                        cursor: liqCiclo2
                                          ? 'pointer'
                                          : 'not-allowed',
                                      }}
                                    >
                                      <Receipt size={11} /> Ver Liquidación 2
                                      Ciclo
                                    </button>
                                  )}
                                </div>
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

            {/* ============ PESTAÑA 5: RESUMEN DE COMISIONES ============ */}
            {activeTab === 'comisiones' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '800',
                      color: '#111827',
                    }}
                  >
                    Resumen de Comisiones por Vendedor
                  </h3>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '12px',
                      color: '#4b5563',
                    }}
                  >
                    Cálculo detallado individual basado en todas las notas de
                    entrega cerradas hasta el momento (sin filtro de mes).
                  </p>
                </div>

                {selectedMonth !== currentRealMonth ? (
                  <div
                    style={{
                      padding: '32px 20px',
                      textAlign: 'center',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '10px',
                      color: '#78350f',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <AlertTriangle size={28} color="#d97706" />
                    <div style={{ fontSize: '14px', fontWeight: '800' }}>
                      Para consultar el Resumen de Comisiones debes ir al mes
                      actual ({currentRealMonth}).
                    </div>
                    <div style={{ fontSize: '12px', color: '#92400e' }}>
                      Esta sección muestra el acumulado vigente de todas las
                      notas cerradas hasta el momento.
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMonth(currentRealMonth)}
                      style={{
                        backgroundColor: '#111827',
                        color: '#D4AF37',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Ir al Mes Actual ({currentRealMonth})
                    </button>
                  </div>
                ) : (
                  <>
                    <MobileSortBar
                      tabla="comisiones"
                      sortConfig={sortConfig.comisiones}
                      onSort={handleSort}
                      options={[
                        { key: 'full_name', label: 'Nombre' },
                        { key: 'pctBombillos', label: '% Asignado' },
                        { key: 'bombillosBruto', label: 'Bombillos ($)' },
                        { key: 'fluidosBruto', label: 'Fluidos ($)' },
                        {
                          key: 'comisionTotalUSD',
                          label: 'Comisión Total ($)',
                        },
                      ]}
                    />

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
                            color: '#4b5563',
                          }}
                        >
                          <SortableHeader
                            label="Nombre"
                            sortKey="full_name"
                            tabla="comisiones"
                            sortConfig={sortConfig.comisiones}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="% Asignado"
                            sortKey="pctBombillos"
                            tabla="comisiones"
                            sortConfig={sortConfig.comisiones}
                            onSort={handleSort}
                          />
                          <th style={{ padding: '10px', textAlign: 'center' }}>
                            Bombillos (Cnt / $)
                          </th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>
                            Fluidos (Cnt / $)
                          </th>
                          <SortableHeader
                            label="Comisión Total ($)"
                            sortKey="comisionTotalUSD"
                            tabla="comisiones"
                            sortConfig={sortConfig.comisiones}
                            onSort={handleSort}
                            align="right"
                          />
                        </tr>
                      </thead>
                      <tbody>
                        {sortedVendedoresComisiones.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              style={{
                                padding: '24px',
                                textAlign: 'center',
                                color: '#4b5563',
                              }}
                            >
                              No hay comisiones registradas hasta el momento.
                            </td>
                          </tr>
                        ) : (
                          sortedVendedoresComisiones.map((v) => (
                            <tr
                              key={v.id}
                              className="responsive-table-row"
                              style={{ borderBottom: '1px solid #e5e7eb' }}
                            >
                              <td
                                className="desktop-cell-normal"
                                style={{
                                  padding: '10px',
                                  fontWeight: '600',
                                  color: '#111827',
                                }}
                              >
                                {v.full_name || 'Sin Nombre'}
                              </td>
                              <td
                                className="desktop-cell-normal"
                                style={{
                                  padding: '10px',
                                  fontSize: '12px',
                                  color: '#111827',
                                }}
                              >
                                {v.pctAsignado}
                              </td>
                              <td
                                className="desktop-cell-normal"
                                style={{ padding: '10px', textAlign: 'center' }}
                              >
                                <div
                                  style={{
                                    fontWeight: '700',
                                    color: '#111827',
                                  }}
                                >
                                  {v.bombillosCount} un.
                                </div>
                                <div
                                  style={{ fontSize: '11px', color: '#4b5563' }}
                                >
                                  ${v.bombillosBruto.toLocaleString()}
                                </div>
                              </td>
                              <td
                                className="desktop-cell-normal"
                                style={{ padding: '10px', textAlign: 'center' }}
                              >
                                <div
                                  style={{
                                    fontWeight: '700',
                                    color: '#111827',
                                  }}
                                >
                                  {v.fluidosCount} un.
                                </div>
                                <div
                                  style={{ fontSize: '11px', color: '#4b5563' }}
                                >
                                  ${v.fluidosBruto.toLocaleString()}
                                </div>
                              </td>
                              <td
                                className="desktop-cell-normal"
                                style={{
                                  padding: '10px',
                                  textAlign: 'right',
                                  fontWeight: '800',
                                  color: '#111827',
                                }}
                              >
                                ${v.comisionTotalUSD.toFixed(2)}
                              </td>
                              <td
                                className="mobile-cell-stacked"
                                style={{ display: 'none' }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #e5e7eb',
                                    paddingBottom: '6px',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: '800',
                                      fontSize: '14px',
                                      color: '#111827',
                                    }}
                                  >
                                    {v.full_name || 'Sin Nombre'}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      backgroundColor: '#f3f4f6',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: '600',
                                      color: '#4b5563',
                                    }}
                                  >
                                    {v.pctAsignado}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                  }}
                                >
                                  <span
                                    style={{
                                      color: '#4b5563',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Bombillos (Cnt / $):
                                  </span>
                                  <span style={{ color: '#111827' }}>
                                    {v.bombillosCount} un. / $
                                    {v.bombillosBruto.toLocaleString()}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                  }}
                                >
                                  <span
                                    style={{
                                      color: '#4b5563',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Fluidos (Cnt / $):
                                  </span>
                                  <span style={{ color: '#111827' }}>
                                    {v.fluidosCount} un. / $
                                    {v.fluidosBruto.toLocaleString()}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '13px',
                                    borderTop: '1px solid #e5e7eb',
                                    paddingTop: '6px',
                                    marginTop: '4px',
                                  }}
                                >
                                  <span
                                    style={{
                                      color: '#111827',
                                      fontWeight: '700',
                                    }}
                                  >
                                    Comisión Total ($):
                                  </span>
                                  <span
                                    style={{
                                      color: '#dc2626',
                                      fontWeight: '800',
                                    }}
                                  >
                                    ${v.comisionTotalUSD.toFixed(2)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ============ MODAL ESTADÍSTICA MENSUAL (ZONA / VENDEDOR) ============ */}
      {statsModal.open && (
        <MonthlyStatsModal
          statsModal={statsModal}
          onClose={() =>
            setStatsModal({
              open: false,
              type: null,
              title: '',
              subtitle: '',
              data: [],
              goalUsd: 0,
            })
          }
        />
      )}

      {/* ============ MODAL FACTURA DE LIQUIDACIÓN ============ */}
      {liquidationInvoiceModal.open && liquidationInvoiceModal.liquidation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3500,
            padding: '16px',
          }}
          onClick={() =>
            setLiquidationInvoiceModal({ open: false, liquidation: null })
          }
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '2px solid #111827',
                paddingBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: '900',
                    margin: 0,
                    color: '#111827',
                  }}
                >
                  Factura de Liquidación:{' '}
                  {liquidationInvoiceModal.liquidation.invoice_code ||
                    liquidationInvoiceModal.liquidation.id}
                </h2>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '12px',
                    color: '#4b5563',
                  }}
                >
                  Documento Histórico • Cierre de Ciclo Quincenal #
                  {liquidationInvoiceModal.liquidation.cycle}
                </p>
              </div>
              <div>
                <button
                  onClick={() =>
                    setLiquidationInvoiceModal({
                      open: false,
                      liquidation: null,
                    })
                  }
                  style={{
                    backgroundColor: '#111827',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Datos de Auditoría */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                backgroundColor: '#f9fafb',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginBottom: '16px',
                fontSize: '12px',
              }}
            >
              <div>
                <span
                  style={{
                    color: '#6b7280',
                    fontWeight: '600',
                    display: 'block',
                  }}
                >
                  Período y Ciclo:
                </span>
                <strong style={{ color: '#111827' }}>
                  Mes {liquidationInvoiceModal.liquidation.month || 'N/A'}/
                  {liquidationInvoiceModal.liquidation.year || 'N/A'} • Ciclo{' '}
                  {liquidationInvoiceModal.liquidation.cycle || 'N/A'}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: '#6b7280',
                    fontWeight: '600',
                    display: 'block',
                  }}
                >
                  Tasa BCV:
                </span>
                <strong style={{ color: '#111827' }}>
                  Bs.{' '}
                  {Number(
                    liquidationInvoiceModal.liquidation.bcv_rate || 0
                  ).toFixed(2)}
                </strong>
              </div>
              <div>
                <span
                  style={{
                    color: '#6b7280',
                    fontWeight: '600',
                    display: 'block',
                  }}
                >
                  Estado:
                </span>
                <strong
                  style={{ color: '#15803D', textTransform: 'uppercase' }}
                >
                  {liquidationInvoiceModal.liquidation.status || 'PAGADA'}
                </strong>
              </div>
            </div>

            {liquidationInvoiceModal.liquidation.captured_html ? (
              <div
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  overflowX: 'auto',
                }}
                dangerouslySetInnerHTML={{
                  __html: liquidationInvoiceModal.liquidation.captured_html,
                }}
              />
            ) : (
              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#111827', color: '#fff' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>
                        Concepto
                      </th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}>Sueldo Fijo Quincenal</td>
                      <td
                        style={{
                          padding: '10px',
                          textAlign: 'right',
                          fontWeight: '600',
                        }}
                      >
                        $
                        {Number(
                          liquidationInvoiceModal.liquidation.sueldo_fijo_usd ||
                            0
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}>
                        Comisiones Netas (53.38% / 23.08%)
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        $
                        {(
                          Number(
                            liquidationInvoiceModal.liquidation
                              .comm_53_net_usd || 0
                          ) +
                          Number(
                            liquidationInvoiceModal.liquidation
                              .comm_23_net_usd || 0
                          )
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr
                      style={{
                        backgroundColor: '#f0fdf4',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      <td
                        style={{
                          padding: '12px',
                          fontWeight: '800',
                          color: '#111827',
                        }}
                      >
                        Total Neto a Pagar (USD)
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          textAlign: 'right',
                          fontWeight: '900',
                          fontSize: '15px',
                          color: '#15803D',
                        }}
                      >
                        $
                        {Number(
                          liquidationInvoiceModal.liquidation
                            .total_neto_pagar_usd || 0
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: '#fefce8' }}>
                      <td
                        style={{
                          padding: '12px',
                          fontWeight: '800',
                          color: '#111827',
                        }}
                      >
                        Total Neto a Pagar (Bs)
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          textAlign: 'right',
                          fontWeight: '900',
                          fontSize: '15px',
                          color: '#B45309',
                        }}
                      >
                        Bs.{' '}
                        {Number(
                          liquidationInvoiceModal.liquidation
                            .total_neto_pagar_bs || 0
                        ).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ MODAL DETALLE N.E. (Solo Lectura) ============ */}
      {neDetailModal.open && neDetailModal.order && (
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
          onClick={() =>
            setNeDetailModal({ open: false, order: null, items: [] })
          }
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() =>
                setNeDetailModal({ open: false, order: null, items: [] })
              }
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
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
                  Visualización - Nota de Entrega #
                  {neDetailModal.order.transaction_number ||
                    neDetailModal.order.id.substring(0, 6)}
                </h2>
              </div>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
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
                  <div
                    style={{
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      backgroundColor: '#F9FAFB',
                    }}
                  >
                    {neDetailModal.order.clients?.name || 'N/A'}
                  </div>
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
                  <div
                    style={{
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      backgroundColor: '#F9FAFB',
                    }}
                  >
                    {neDetailModal.order.category || 'General'}
                  </div>
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
                    Modalidad de Pago
                  </label>
                  <div
                    style={{
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #F59E0B',
                      borderRadius: '6px',
                      backgroundColor: '#FEF3C7',
                      color: '#78350F',
                      fontWeight: '700',
                    }}
                  >
                    {getDiscountPercentFromType(
                      neDetailModal.order.payment_discount
                    )}
                    %
                  </div>
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
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0 }}>
                      <strong>Fecha/Hora: </strong>{' '}
                      {new Date(
                        neDetailModal.order.created_at
                      ).toLocaleString()}
                    </p>
                    <p style={{ margin: '2px 0' }}>
                      <strong>N° Transacción: </strong> #
                      {neDetailModal.order.transaction_number ||
                        neDetailModal.order.id.substring(0, 6)}
                    </p>
                  </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
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
                      </tr>
                    </thead>
                    <tbody>
                      {neDetailModal.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              color: '#9CA3AF',
                              fontStyle: 'italic',
                            }}
                          >
                            No hay productos registrados en esta nota.
                          </td>
                        </tr>
                      ) : (
                        neDetailModal.items.map((item) => (
                          <tr
                            key={item.id}
                            style={{ borderBottom: '1px solid #E5E7EB' }}
                          >
                            <td
                              style={{
                                padding: '8px',
                                fontFamily: 'monospace',
                              }}
                            >
                              {item.products?.code || 'S/C'}
                            </td>
                            <td style={{ padding: '8px', fontWeight: '600' }}>
                              {item.products?.description || 'Producto'}
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
                      <span>Total sin Descuento:</span>
                      <strong>
                        $
                        {Number(
                          neDetailModal.order.total_base_usd || 0
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
                      <span>Precio Final:</span>
                      <span style={{ color: '#059669' }}>
                        $
                        {Number(
                          neDetailModal.order.final_price_usd || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Imagen */}
      {imageModal.open && (
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
          onClick={() => setImageModal({ ...imageModal, open: false })}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              padding: '16px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImageModal({ ...imageModal, open: false })}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4b5563',
              }}
            >
              <X size={24} />
            </button>
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#111827',
              }}
            >
              {imageModal.title}
            </h3>
            <img
              src={imageModal.url}
              alt="Documento"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        .users-table-container { width: 100%; overflow-x: auto; }
        .custom-responsive-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
        .mobile-thead { display: none; }
        .mobile-cell-stacked { display: none; }
        .desktop-cell-normal { display: table-cell; }
        .mobile-sort-bar { display: none; }
        .sortable-header { cursor: pointer; user-select: none; transition: background-color 0.15s; }
        .sortable-header:hover { background-color: #f3f4f6 !important; }
        .admin-aging-section { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; }
        .admin-aging-title { font-size: 13px; font-weight: 800; color: #78350f; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .admin-aging-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #ffffff; border: 1px solid #fde68a; border-radius: 6px; margin-bottom: 6px; font-size: 12px; }
        .admin-aging-item:last-child { margin-bottom: 0; }
        @media (max-width: 768px) {
          body { max-height: 100vh; overflow-y: auto !important; }
          .desktop-tabs { display: none !important; }
          .mobile-dropdown-menu { display: block !important; }
          .mobile-sort-bar { display: flex !important; }
          .users-table-container { overflow-x: hidden !important; }
          .desktop-thead { display: none !important; }
          .mobile-thead { display: table-header-group !important; }
          .desktop-cell-normal { display: none !important; }
          .mobile-cell-stacked { display: flex !important; flex-direction: column; gap: 6px; padding: 12px !important; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 10px; background-color: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
          .responsive-table-row { display: block; border-bottom: none !important; }
          .kpi-card, .kpi-card-responsive {
            height: auto !important;
            max-height: 24vh !important;
            padding: 8px !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            overflow: hidden !important;
          }
          .kpi-card div, .kpi-card-responsive div { text-align: center !important; }
        }
      `}</style>
    </div>
  );
}

function MobileSortBar({ tabla, sortConfig, onSort, options }) {
  const current = sortConfig || { key: null, direction: null };

  const handleSelectChange = (e) => {
    const newKey = e.target.value;
    if (!newKey) {
      if (current.key) {
        onSort(tabla, current.key);
      }
      return;
    }
    onSort(tabla, newKey);
  };

  return (
    <div
      className="mobile-sort-bar"
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        marginBottom: '12px',
        padding: '8px 10px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
      >
        <ChevronsUpDown size={14} color="#dc2626" />
        <span
          style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#4b5563',
            whiteSpace: 'nowrap',
          }}
        >
          Ordenar por:
        </span>
        <select
          value={current.key || ''}
          onChange={handleSelectChange}
          style={{
            flex: 1,
            padding: '5px 8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#111827',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            outline: 'none',
          }}
        >
          <option value="">Predeterminado</option>
          {options.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {current.key && (
        <button
          type="button"
          onClick={() => onSort(tabla, current.key)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            backgroundColor: '#111827',
            color: '#D4AF37',
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {current.direction === 'asc' ? (
            <>
              <ArrowUp size={12} /> Asc
            </>
          ) : (
            <>
              <ArrowDown size={12} /> Desc
            </>
          )}
        </button>
      )}
    </div>
  );
}

function MonthlyStatsModal({ statsModal, onClose }) {
  const data = statsModal.data || [];
  const maxVal = Math.max(
    ...data.map((d) => d.total),
    statsModal.goalUsd || 0,
    1
  );
  const totalHistorical = data.reduce((acc, d) => acc + d.total, 0);
  const avgMonthly = data.length > 0 ? totalHistorical / data.length : 0;

  const formatMonthLabel = (ym) => {
    const [y, m] = ym.split('-');
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const idx = parseInt(m, 10) - 1;
    return `${months[idx] || m} ${y.slice(-2)}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3600,
        padding: '10px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '14px',
          boxSizing: 'border-box',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #111827',
            paddingBottom: '10px',
            marginBottom: '12px',
            gap: '8px',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: '900',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                wordBreak: 'break-word',
              }}
            >
              <BarChart2 size={17} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{statsModal.title}</span>
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '11px',
                color: '#4b5563',
                wordBreak: 'break-word',
              }}
            >
              {statsModal.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#111827',
              color: '#fff',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '700',
              flexShrink: 0,
            }}
          >
            Cerrar
          </button>
        </div>

        {/* Resumen rápido */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '8px',
            marginBottom: '14px',
            width: '100%',
          }}
        >
          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px',
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
              }}
            >
              Total Histórico
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '800',
                color: '#111827',
                marginTop: '2px',
                wordBreak: 'break-word',
              }}
            >
              $
              {totalHistorical.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px',
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
              }}
            >
              Promedio Mensual
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '800',
                color: '#10B981',
                marginTop: '2px',
                wordBreak: 'break-word',
              }}
            >
              $
              {avgMonthly.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          {statsModal.goalUsd > 0 && (
            <div
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}
              >
                Meta Actual
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#dc2626',
                  marginTop: '2px',
                  wordBreak: 'break-word',
                }}
              >
                $
                {statsModal.goalUsd.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          )}
        </div>

        {/* Gráfica y Desglose ajustados 100% al ancho de pantalla */}
        {data.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px dashed #d1d5db',
              fontSize: '12px',
            }}
          >
            No hay notas de entrega registradas para generar la gráfica.
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '10px',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Gráfica de barras fluida sin desbordamiento */}
            <div
              style={{
                width: '100%',
                overflowX: data.length > 6 ? 'auto' : 'hidden',
                paddingBottom: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  gap: '4px',
                  width: '100%',
                  minWidth: data.length > 6 ? `${data.length * 46}px` : '0',
                  height: '185px',
                  paddingTop: '24px',
                  paddingBottom: '4px',
                  borderBottom: '2px solid #d1d5db',
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
              >
                {statsModal.goalUsd > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${
                        Math.min(100, (statsModal.goalUsd / maxVal) * 100) *
                          1.45 +
                        4
                      }px`,
                      borderTop: '2px dashed #10B981',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        right: '2px',
                        top: '-15px',
                        fontSize: '9px',
                        fontWeight: '700',
                        color: '#059669',
                        backgroundColor: '#ecfdf5',
                        padding: '1px 4px',
                        borderRadius: '4px',
                      }}
                    >
                      Meta: ${statsModal.goalUsd.toLocaleString()}
                    </span>
                  </div>
                )}

                {data.map((d) => {
                  const heightPct = Math.max(4, (d.total / maxVal) * 100);
                  const meetsGoal =
                    statsModal.goalUsd > 0 && d.total >= statsModal.goalUsd;

                  return (
                    <div
                      key={d.month}
                      style={{
                        flex: '1 1 0',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '9px',
                          fontWeight: '800',
                          color: '#111827',
                          marginBottom: '3px',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        $
                        {d.total >= 1000
                          ? `${(d.total / 1000).toFixed(1)}k`
                          : d.total.toFixed(0)}
                      </div>
                      <div
                        title={`${formatMonthLabel(
                          d.month
                        )}: $${d.total.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} (${d.count} N.E.)`}
                        style={{
                          width: '60%',
                          maxWidth: '30px',
                          minWidth: '12px',
                          height: `${heightPct * 0.78}%`,
                          minHeight: '8px',
                          backgroundColor: meetsGoal ? '#10B981' : '#dc2626',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  gap: '4px',
                  width: '100%',
                  minWidth: data.length > 6 ? `${data.length * 46}px` : '0',
                  marginTop: '4px',
                }}
              >
                {data.map((d) => (
                  <div
                    key={d.month}
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      textAlign: 'center',
                      fontSize: '9px',
                      fontWeight: '700',
                      color: '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {formatMonthLabel(d.month)}
                  </div>
                ))}
              </div>
            </div>

            {/* Desglose responsivo: Tabla compacta en escritorio + Tarjetas apiladas en móvil */}
            <div style={{ marginTop: '12px', width: '100%' }}>
              <table
                className="stats-desktop-table"
                style={{
                  width: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse',
                  fontSize: '11px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#111827', color: '#ffffff' }}>
                    <th
                      style={{
                        padding: '7px 6px',
                        textAlign: 'left',
                        width: '22%',
                      }}
                    >
                      Mes
                    </th>
                    <th
                      style={{
                        padding: '7px 4px',
                        textAlign: 'center',
                        width: '12%',
                      }}
                    >
                      N.E.
                    </th>
                    <th
                      style={{
                        padding: '7px 6px',
                        textAlign: 'right',
                        width: '22%',
                      }}
                    >
                      Fact. N.E.
                    </th>
                    <th
                      style={{
                        padding: '7px 6px',
                        textAlign: 'right',
                        width: '22%',
                      }}
                    >
                      Liquidado
                    </th>
                    <th
                      style={{
                        padding: '7px 6px',
                        textAlign: 'right',
                        width: '22%',
                      }}
                    >
                      Total ($)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d) => (
                    <tr
                      key={d.month}
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                    >
                      <td
                        style={{
                          padding: '7px 6px',
                          fontWeight: '700',
                          color: '#111827',
                          wordBreak: 'break-word',
                        }}
                      >
                        {formatMonthLabel(d.month)}
                      </td>
                      <td
                        style={{
                          padding: '7px 4px',
                          textAlign: 'center',
                          color: '#4b5563',
                        }}
                      >
                        {d.count}
                      </td>
                      <td
                        style={{
                          padding: '7px 6px',
                          textAlign: 'right',
                          color: '#111827',
                          wordBreak: 'break-word',
                        }}
                      >
                        $
                        {d.notas.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        style={{
                          padding: '7px 6px',
                          textAlign: 'right',
                          color: '#4b5563',
                          wordBreak: 'break-word',
                        }}
                      >
                        $
                        {d.liquidado.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        style={{
                          padding: '7px 6px',
                          textAlign: 'right',
                          fontWeight: '800',
                          color: '#dc2626',
                          wordBreak: 'break-word',
                        }}
                      >
                        $
                        {d.total.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tarjetas apiladas en móvil para que nunca se desborde la tabla */}
              <div
                className="stats-mobile-cards"
                style={{
                  display: 'none',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%',
                }}
              >
                {data.map((d) => (
                  <div
                    key={d.month}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '12px',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #f3f4f6',
                        paddingBottom: '4px',
                      }}
                    >
                      <span style={{ fontWeight: '800', color: '#111827' }}>
                        {formatMonthLabel(d.month)}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#4b5563',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {d.count} N.E.
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ color: '#6b7280' }}>Facturado N.E.:</span>
                      <span style={{ fontWeight: '600', color: '#111827' }}>
                        $
                        {d.notas.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ color: '#6b7280' }}>Liquidado:</span>
                      <span style={{ fontWeight: '600', color: '#4b5563' }}>
                        $
                        {d.liquidado.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px dashed #e5e7eb',
                        paddingTop: '4px',
                        marginTop: '2px',
                      }}
                    >
                      <span style={{ fontWeight: '700', color: '#111827' }}>
                        Total Facturado:
                      </span>
                      <span style={{ fontWeight: '800', color: '#dc2626' }}>
                        $
                        {d.total.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .stats-desktop-table { display: none !important; }
          .stats-mobile-cards { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function DocBadge({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '3px 6px',
        backgroundColor: '#F0FDF4',
        color: '#15803D',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: '700',
      }}
    >
      <Eye size={10} /> {label}
    </button>
  );
}

function SortableHeader({
  label,
  sortKey,
  tabla,
  sortConfig,
  onSort,
  align = 'left',
}) {
  const current = sortConfig || { key: null, direction: null };
  const isActive = current.key === sortKey;
  const direction = isActive ? current.direction : null;
  let Icon = ChevronsUpDown;
  let iconColor = '#9ca3af';

  if (direction === 'asc') {
    Icon = ArrowUp;
    iconColor = '#111827';
  } else if (direction === 'desc') {
    Icon = ArrowDown;
    iconColor = '#111827';
  }

  return (
    <th
      onClick={() => onSort(tabla, sortKey)}
      className="sortable-header"
      style={{
        padding: '10px',
        textAlign: align,
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        color: '#4b5563',
        fontWeight: isActive ? '700' : '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      >
        {label}
        <Icon
          size={12}
          color={iconColor}
          strokeWidth={2.5}
          style={{ verticalAlign: 'middle' }}
        />
      </span>
    </th>
  );
}

function KpiCard({ title, value, sub, color, border }) {
  return (
    <div
      className="kpi-card"
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${border || '#e5e7eb'}`,
        borderRadius: '8px',
        padding: '10px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: '700',
          color: '#4b5563',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '18px',
          fontWeight: '800',
          color: color,
          marginTop: '2px',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '10px', color: color, marginTop: '2px' }}>
        {sub}
      </div>
    </div>
  );
}
