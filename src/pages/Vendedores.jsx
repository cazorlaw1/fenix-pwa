import React, { useState, useEffect, useMemo } from 'react';
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
  Download,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from 'lucide-react';

export default function Vendedores({ currentUser }) {
  const [activeTab, setActiveTab] = useState('visitas');
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamClients, setTeamClients] = useState([]);
  const [teamPotentials, setTeamPotentials] = useState([]);
  const [historyModal, setHistoryModal] = useState({
    open: false,
    seller: null,
    orders: [],
  });
  const [imageModal, setImageModal] = useState({
    open: false,
    url: '',
    title: '',
  });

  // ===== Estados de ordenamiento por tabla =====
  const [sortConfig, setSortConfig] = useState({
    visitas: { key: null, direction: null },
    resumen: { key: null, direction: null },
    comisiones: { key: null, direction: null },
    historial: { key: null, direction: null },
  });

  // ===== Filtros de visitas (Oficiales / Potenciales) =====
  const [visitFilters, setVisitFilters] = useState({
    official: true,
    potential: true,
  });

  useEffect(() => {
    fetchVendedoresData();
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'visitas' && vendedores.length > 0) {
      fetchTeamVisits();
    }
  }, [activeTab, vendedores]);

  // ===== Handler de ordenamiento =====
  const handleSort = (tabla, key) => {
    setSortConfig((prev) => {
      const current = prev[tabla];
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

  const getResumenValue = (row, key) => {
    switch (key) {
      case 'full_name':
        return row.full_name || '';
      case 'sales_goal_usd':
        return Number(row.sales_goal_usd) || 0;
      case 'totalNE':
        return row.totalNE || 0;
      case 'neCerradas':
        return row.neCerradas || 0;
      case 'nePendientes':
        return row.nePendientes || 0;
      case 'alcanzado':
        return (row.bombillosBruto || 0) + (row.fluidosBruto || 0);
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

  const getHistorialValue = (row, key) => {
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
      default:
        return row[key];
    }
  };

  // ===== Datos ordenados memorizados =====
  const allVisits = useMemo(
    () => [...teamClients, ...teamPotentials],
    [teamClients, teamPotentials]
  );

  const filteredVisits = useMemo(() => {
    return allVisits.filter((c) => {
      if (c.is_potential && !visitFilters.potential) return false;
      if (!c.is_potential && !visitFilters.official) return false;
      return true;
    });
  }, [allVisits, visitFilters]);

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

  const sortedVendedoresResumen = useMemo(
    () =>
      sortData(
        vendedores,
        sortConfig.resumen.key,
        sortConfig.resumen.direction,
        getResumenValue
      ),
    [vendedores, sortConfig.resumen]
  );

  const sortedVendedoresComisiones = useMemo(
    () =>
      sortData(
        vendedores,
        sortConfig.comisiones.key,
        sortConfig.comisiones.direction,
        getComisionesValue
      ),
    [vendedores, sortConfig.comisiones]
  );

  const sortedHistoryOrders = useMemo(
    () =>
      sortData(
        historyModal.orders,
        sortConfig.historial.key,
        sortConfig.historial.direction,
        getHistorialValue
      ),
    [historyModal.orders, sortConfig.historial]
  );

  const filteredVendedores = useMemo(() => {
    return vendedores.filter((v) => {
      return (
        v.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [vendedores, searchTerm]);

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
          'id, seller_id, balance_due_usd, closed_at, payment_status, final_price_usd, category'
        );
      if (ordersError)
        console.warn('Error cargando ordenes:', ordersError.message);

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
          const totalNE = userOrders.length;
          const neCerradas = userOrders.filter(
            (o) => o.payment_status === 'cerrada'
          ).length;
          const nePendientes = userOrders.filter(
            (o) =>
              Number(o.balance_due_usd) > 0 || o.payment_status !== 'cerrada'
          ).length;
          const pctAsignado = `${pctBombillos}% B / ${pctFluidos}% F`;

          let comisionTotalUSD = 0;
          let ventasAcumuladas = 0;
          let bombillosCount = 0;
          let fluidosCount = 0;
          let bombillosBruto = 0;
          let fluidosBruto = 0;

          userOrders.forEach((o) => {
            if (o.payment_status === 'cerrada') {
              const price = Number(o.final_price_usd || 0);
              ventasAcumuladas += price;
              const cat = (o.category || 'bombillos').toLowerCase();
              if (cat === 'fluidos') {
                fluidosCount++;
                fluidosBruto += price;
                comisionTotalUSD += price * (pctFluidos / 100);
              } else {
                bombillosCount++;
                bombillosBruto += price;
                comisionTotalUSD += price * (pctBombillos / 100);
              }
            }
          });

          return {
            ...profile,
            sales_goal_usd: profile.sales_goal_usd || 0,
            totalNE,
            neCerradas,
            nePendientes,
            pctAsignado,
            pctBombillos,
            pctFluidos,
            comisionTotalUSD,
            ventasAcumuladas,
            bombillosCount,
            fluidosCount,
            bombillosBruto,
            fluidosBruto,
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

  const openHistoryModal = async (seller) => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('sales_orders')
        .select('*, clients(name)')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });
      setHistoryModal({ open: true, seller, orders: data || [] });
    } catch (err) {
      alert('Error cargando historial: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: filteredVendedores.length,
    meta: filteredVendedores.reduce(
      (acc, c) => acc + (Number(c.sales_goal_usd) || 0),
      0
    ),
    ventas: filteredVendedores.reduce(
      (acc, c) => acc + (c.ventasAcumuladas || 0),
      0
    ),
    cerradas: filteredVendedores.reduce((acc, c) => acc + c.neCerradas, 0),
    pendientes: filteredVendedores.reduce((acc, c) => acc + c.nePendientes, 0),
    comisiones: filteredVendedores.reduce(
      (acc, c) => acc + c.comisionTotalUSD,
      0
    ),
  };

  if (loading && activeTab !== 'visitas' && !historyModal.open) {
    return <div style={{ padding: '24px' }}>Cargando módulo...</div>;
  }

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        fontFamily: 'system-ui',
      }}
    >
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
          <TrendingUp size={24} color="#DC2626" strokeWidth={2.5} />
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
            placeholder="Buscar vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 10px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              width: '260px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <KpiCard
          title="Vendedores Activos"
          value={stats.total}
          sub="En estructura"
          color="#111827"
        />
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '10px',
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
            Meta vs Alcanzado
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#111827',
              marginTop: '2px',
            }}
          >
            ${stats.ventas.toLocaleString()}{' '}
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>
              / ${stats.meta.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#10B981',
              marginTop: '2px',
              fontWeight: '600',
            }}
          >
            {stats.meta > 0 ? Math.round((stats.ventas / stats.meta) * 100) : 0}
            % Completado
          </div>
        </div>
        <KpiCard
          title="N.E. Cerradas"
          value={stats.cerradas}
          sub="Esta quincena"
          color="#10B981"
          border="#10B981"
        />
        <KpiCard
          title="N.E. Pendientes"
          value={stats.pendientes}
          sub="Por cobrar/cerrar"
          color="#DC2626"
          border="#DC2626"
        />
        {activeTab === 'comisiones' && (
          <KpiCard
            title="Total Comisiones ($)"
            value={`$${stats.comisiones.toFixed(2)}`}
            sub="De órdenes cerradas"
            color="#D4AF37"
            border="#D4AF37"
          />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px',
        }}
      >
        {[
          {
            key: 'visitas',
            label: 'Visitas del Equipo',
            icon: <MapPin size={14} />,
          },
          {
            key: 'resumen',
            label: 'Resumen del Equipo',
            icon: <Target size={14} />,
          },
          {
            key: 'comisiones',
            label: 'Resumen de Comisiones',
            icon: <DollarSign size={14} />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px',
          overflowX: 'auto',
        }}
      >
        {/* ============ TAB VISITAS ============ */}
        {activeTab === 'visitas' && (
          <>
            {/* Filtros de tipo de cliente - DISEÑO DISCRETO Y COMPACTO */}
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
                  color: '#6b7280',
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
                  color: visitFilters.official ? '#15803D' : '#9ca3af',
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
                <span style={{ fontSize: '9px', color: '#9ca3af' }}>
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
                  color: visitFilters.potential ? '#B45309' : '#9ca3af',
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
                <span style={{ fontSize: '9px', color: '#9ca3af' }}>
                  ({teamPotentials.length})
                </span>
              </label>
              <span
                style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  marginLeft: 'auto',
                }}
              >
                {sortedVisits.length} de {allVisits.length}
              </span>
            </div>

            <table
              className="custom-responsive-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                textAlign: 'left',
              }}
            >
              <thead>
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
                    label="Registrado Por"
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
                        color: '#6b7280',
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
                        style={{ borderBottom: '1px solid #f3f4f6' }}
                      >
                        <td style={{ padding: '10px' }}>
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
                        <td style={{ padding: '10px' }}>
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
                        <td style={{ padding: '10px', fontSize: '12px' }}>
                          {client.profiles?.full_name || 'N/A'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
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
                              style={{ fontSize: '11px', color: '#9CA3AF' }}
                            >
                              Sin GPS
                            </span>
                          )}
                        </td>
                        <td
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
                          style={{
                            padding: '10px',
                            textAlign: 'center',
                            color: '#10B981',
                            fontWeight: 'bold',
                          }}
                        >
                          {neCerradas}
                        </td>
                        <td style={{ padding: '10px', fontSize: '12px' }}>
                          {client.last_visit_at
                            ? new Date(
                                client.last_visit_at
                              ).toLocaleDateString()
                            : 'Sin registro'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ============ TAB RESUMEN ============ */}
        {activeTab === 'resumen' && (
          <table
            className="custom-responsive-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
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
                  tabla="resumen"
                  sortConfig={sortConfig.resumen}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Meta vs Acumulado"
                  sortKey="sales_goal_usd"
                  tabla="resumen"
                  sortConfig={sortConfig.resumen}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="N.E. Totales"
                  sortKey="totalNE"
                  tabla="resumen"
                  sortConfig={sortConfig.resumen}
                  onSort={handleSort}
                  align="center"
                />
                <SortableHeader
                  label="Cerradas"
                  sortKey="neCerradas"
                  tabla="resumen"
                  sortConfig={sortConfig.resumen}
                  onSort={handleSort}
                  align="center"
                />
                <SortableHeader
                  label="Pendientes"
                  sortKey="nePendientes"
                  tabla="resumen"
                  sortConfig={sortConfig.resumen}
                  onSort={handleSort}
                  align="center"
                />
                <th style={{ padding: '10px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendedores.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: '#6b7280',
                    }}
                  >
                    No hay vendedores asignados en la estructura.
                  </td>
                </tr>
              ) : (
                sortData(
                  filteredVendedores,
                  sortConfig.resumen.key,
                  sortConfig.resumen.direction,
                  getResumenValue
                ).map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px', fontWeight: '600' }}>
                      {v.full_name || 'Sin Nombre'}
                    </td>
                    <td style={{ padding: '10px' }}>
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
                            width: '80px',
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
                            backgroundColor: '#000',
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
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#10B981',
                          marginTop: '2px',
                          fontWeight: '600',
                        }}
                      >
                        Alcanzado: $
                        {(v.bombillosBruto + v.fluidosBruto).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {v.totalNE}
                    </td>
                    <td
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        color: '#10B981',
                        fontWeight: 'bold',
                      }}
                    >
                      {v.neCerradas}
                    </td>
                    <td
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        color: '#DC2626',
                        fontWeight: 'bold',
                      }}
                    >
                      {v.nePendientes}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => openHistoryModal(v)}
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
                        <Eye size={12} /> Ver Historial
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ============ TAB COMISIONES ============ */}
        {activeTab === 'comisiones' && (
          <table
            className="custom-responsive-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
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
              {filteredVendedores.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: '#6b7280',
                    }}
                  >
                    No hay vendedores asignados en la estructura.
                  </td>
                </tr>
              ) : (
                sortData(
                  filteredVendedores,
                  sortConfig.comisiones.key,
                  sortConfig.comisiones.direction,
                  getComisionesValue
                ).map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px', fontWeight: '600' }}>
                      {v.full_name || 'Sin Nombre'}
                    </td>
                    <td style={{ padding: '10px', fontSize: '12px' }}>
                      {v.pctAsignado}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '700' }}>
                        {v.bombillosCount} un.
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        ${v.bombillosBruto.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '700' }}>
                        {v.fluidosCount} un.
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        ${v.fluidosBruto.toLocaleString()}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '10px',
                        textAlign: 'right',
                        fontWeight: '800',
                        color: '#111827',
                      }}
                    >
                      ${v.comisionTotalUSD.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ============ MODAL HISTORIAL ============ */}
      {historyModal.open && (
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
              maxWidth: '900px',
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
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#111827',
                  }}
                >
                  Historial de N.E. - {historyModal.seller?.full_name}
                </h3>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}
                >
                  Notas de entrega registradas por este vendedor
                </p>
              </div>
              <button
                onClick={() =>
                  setHistoryModal({ ...historyModal, open: false })
                }
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
            <div style={{ overflowX: 'auto' }}>
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
                      backgroundColor: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <SortableHeader
                      label="Cliente"
                      sortKey="clientName"
                      tabla="historial"
                      sortConfig={sortConfig.historial}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Transacción"
                      sortKey="transaction"
                      tabla="historial"
                      sortConfig={sortConfig.historial}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Fecha"
                      sortKey="created_at"
                      tabla="historial"
                      sortConfig={sortConfig.historial}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Estado"
                      sortKey="payment_status"
                      tabla="historial"
                      sortConfig={sortConfig.historial}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Total ($)"
                      sortKey="final_price_usd"
                      tabla="historial"
                      sortConfig={sortConfig.historial}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortableHeader
                      label="Saldo ($)"
                      sortKey="balance_due_usd"
                      tabla="historial"
                      sortConfig={sortConfig.historial}
                      onSort={handleSort}
                      align="right"
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedHistoryOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          padding: '16px',
                          textAlign: 'center',
                          color: '#6b7280',
                        }}
                      >
                        Este vendedor no tiene notas de entrega registradas.
                      </td>
                    </tr>
                  ) : (
                    sortedHistoryOrders.map((nota) => (
                      <tr
                        key={nota.id}
                        style={{ borderBottom: '1px solid #f3f4f6' }}
                      >
                        <td style={{ padding: '8px', fontWeight: '600' }}>
                          {nota.clients?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>
                          #{nota.transaction_number || nota.id.substring(0, 6)}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {new Date(nota.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '8px' }}>
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
                          style={{
                            padding: '8px',
                            textAlign: 'right',
                            fontWeight: '700',
                          }}
                        >
                          ${Number(nota.final_price_usd).toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            textAlign: 'right',
                            color: '#DC2626',
                          }}
                        >
                          ${Number(nota.balance_due_usd).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                color: '#6b7280',
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
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <a
                href={imageModal.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#111827',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={14} /> Descargar Original
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .users-table-container { width: 100%; overflow-x: auto; }
        .custom-responsive-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
        .mobile-thead { display: none; }
        .mobile-cell-stacked { display: none; }
        .desktop-cell-normal { display: table-cell; }
        .sortable-header { cursor: pointer; user-select: none; transition: background-color 0.15s; }
        .sortable-header:hover { background-color: #f3f4f6 !important; }
        @media (max-width: 768px) {
          .users-table-container { overflow-x: hidden !important; }
          .desktop-thead { display: none !important; }
          .mobile-thead { display: table-header-group !important; }
          .desktop-cell-normal { display: none !important; }
          .mobile-cell-stacked { display: flex !important; flex-direction: column; gap: 6px; padding: 10px !important; }
        }
      `}</style>
    </div>
  );
}

/* ============ COMPONENTE: Encabezado ordenable ============ */
function SortableHeader({
  label,
  sortKey,
  tabla,
  sortConfig,
  onSort,
  align = 'left',
}) {
  const isActive = sortConfig.key === sortKey;
  const direction = isActive ? sortConfig.direction : null;

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
          color: '#6b7280',
          textTransform: 'uppercase',
        }}
      >
        {title}{' '}
      </div>
      <div
        style={{
          fontSize: '20px',
          fontWeight: '800',
          color: color,
          marginTop: '2px',
        }}
      >
        {value}{' '}
      </div>
      <div style={{ fontSize: '10px', color: color, marginTop: '2px' }}>
        {sub}{' '}
      </div>
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
