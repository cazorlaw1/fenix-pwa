import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Users,
  Bell,
  FileText,
  MapPin,
  DollarSign,
  AlertCircle,
  Package,
  ShoppingCart,
  UserCheck,
  Clock,
} from 'lucide-react';

// Hook para detectar el tamaño de ventana
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export default function Dashboard({ overrideRole }) {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  // Determinar rol efectivo
  const userRole =
    profile?.role?.toString().toLowerCase().trim() || 'pendiente';
  const effectiveRole =
    userRole === 'tecnico' ? overrideRole || 'administrador' : userRole;

  // Estados Generales
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    pendingCobranza: 0,
    pendingBalance: 0,
    myClients: 0,
    myPotentials: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    bombillos: 0,
    fluidos: 0,
    total: 0,
  });
  const [adminAlerts, setAdminAlerts] = useState({
    pendingUsers: 0,
    pendingNE: 0,
    pendingPayments: 0,
  });
  // Métricas de Equipo (Gerente / Supervisor inspiradas en Vendedores.jsx)
  const [teamStats, setTeamStats] = useState({
    activeSellers: 0,
    totalGoal: 0,
    achievedSales: 0,
    goalProgress: 0,
    closedNECount: 0,
    pendingNECount: 0,
    visits: 0,
    potentials: 0,
  });
  // Estado para Gráfica Simple (Ventas Diarias últimos 7 días)
  const [dailySalesData, setDailySalesData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [effectiveRole, profile?.id]);

  // --- FUNCIÓN AUXILIAR PARA FECHAS EN UTC-4 (AMERICA/CARACAS) ---
  // Evita discrepancias por zona horaria del navegador/servidor
  const getLocalDateStr = (dateObj) => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Caracas',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Datos Comunes: Inventario (Conectado a DB real)
      const { data: products } = await supabase
        .from('products')
        .select('category, stock_current');

      if (products) {
        const bombillos = products
          .filter((p) => p.category?.toLowerCase() === 'bombillos')
          .reduce((acc, curr) => acc + (curr.stock_current || 0), 0);
        const fluidos = products
          .filter((p) => p.category?.toLowerCase() === 'fluidos')
          .reduce((acc, curr) => acc + (curr.stock_current || 0), 0);
        setInventoryStats({ bombillos, fluidos, total: bombillos + fluidos });
      }

      // 2. Datos Específicos por Rol
      if (effectiveRole === 'administrador' || effectiveRole === 'admin') {
        await fetchAdminData();
      } else if (
        effectiveRole === 'gerente' ||
        effectiveRole === 'supervisor'
      ) {
        await fetchManagerData();
      } else if (effectiveRole === 'vendedor') {
        await fetchSellerData();
      } else if (effectiveRole === 'stock') {
        // Rol stock no requiere fetch adicional de ventas
        setRecentActivities([]);
        setDailySalesData([]);
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA ADMINISTRADOR (INTACTA) ---
  const fetchAdminData = async () => {
    const { count: pendingUsersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'pendiente');

    const { count: pendingNECount } = await supabase
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendiente');

    const { count: pendingPaymentsCount } = await supabase
      .from('seller_payment_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    setAdminAlerts({
      pendingUsers: pendingUsersCount || 0,
      pendingNE: pendingNECount || 0,
      pendingPayments: pendingPaymentsCount || 0,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sales } = await supabase
      .from('sales_orders')
      .select('final_price_usd, created_at, payment_status, balance_due_usd')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const totalSales =
      sales
        ?.filter(
          (s) =>
            s.payment_status === 'cerrada' || s.payment_status === 'abonada'
        )
        .reduce((acc, curr) => acc + Number(curr.final_price_usd || 0), 0) || 0;

    const pendingCobranza =
      sales
        ?.filter((s) => s.payment_status !== 'cerrada')
        .reduce(
          (acc, curr) =>
            acc + Number(curr.balance_due_usd || curr.final_price_usd || 0),
          0
        ) || 0;

    setMetrics({
      totalSales,
      pendingCobranza,
      totalClients: 0,
    });

    const { data: recentNotes } = await supabase
      .from('sales_orders')
      .select('*, client:client_id(name), seller:seller_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentActivities(recentNotes || []);

    // Generar datos para la gráfica basados en las ventas recuperadas
    const last7Days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return getLocalDateStr(d);
});

const dailyData = last7Days.map((dateStr) => {
  // Filtramos sobre teamSales completo para contar órdenes de cada día
  const count = (teamSales || []).filter((s) => {
    if (!s.created_at) return false;
    const orderDateStr = getLocalDateStr(new Date(s.created_at));
    return orderDateStr === dateStr;
  }).length;
  
  return { date: dateStr, amount: count };
});

setDailySalesData(dailyData);

  // --- LÓGICA GERENTE/SUPERVISOR (FILTROS IDÉNTICOS A VENDEDORES.JSX) ---
  const fetchManagerData = async () => {
    let subordinateIds = [];

    const { data: cfg } = await supabase
      .from('hierarchy_config')
      .select('*')
      .eq('parent_user_id', profile?.id)
      .maybeSingle();

    const { data: assignRows } = await supabase
      .from('hierarchy_assignments')
      .select('*')
      .eq('parent_user_id', profile?.id);

    const assignments = assignRows || [];
    const globalConfig = cfg;

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, role, sales_goal_usd')
      .not('role', 'is', null)
      .neq('role', 'pendiente')
      .neq('role', 'stock');

    if (!allProfiles) {
      setTeamStats({
        activeSellers: 0,
        totalGoal: 0,
        achievedSales: 0,
        goalProgress: 0,
        closedNECount: 0,
        pendingNECount: 0,
        visits: 0,
        potentials: 0,
      });
      return;
    }

    const eligibleSellers = allProfiles.filter(
      (p) => String(p.id).trim() !== String(profile?.id).trim()
    );

    let filteredProfiles = [];

    if (globalConfig && globalConfig.is_global) {
      const exceptionIds = assignments
        .filter((a) => a.is_exception)
        .map((a) => String(a.target_seller_id).trim());
      filteredProfiles = eligibleSellers.filter(
        (p) => !exceptionIds.includes(String(p.id).trim())
      );
    } else {
      const specificAssigns = assignments.filter((a) => !a.is_exception);
      const assignedIds = specificAssigns.map((a) =>
        String(a.target_seller_id).trim()
      );
      filteredProfiles = eligibleSellers.filter((p) =>
        assignedIds.includes(String(p.id).trim())
      );
    }

    subordinateIds = filteredProfiles.map((p) => p.id);

    if (subordinateIds.length === 0) {
      setTeamStats({
        activeSellers: 0,
        totalGoal: 0,
        achievedSales: 0,
        goalProgress: 0,
        closedNECount: 0,
        pendingNECount: 0,
        visits: 0,
        potentials: 0,
      });
      setRecentActivities([]);
      setDailySalesData([]);
      return;
    }

    const totalGoal = filteredProfiles.reduce(
      (acc, curr) => acc + Number(curr.sales_goal_usd || 2000),
      0
    );

    const { count: potentialCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .in('assigned_seller_id', subordinateIds)
      .eq('is_potential', true);

    const { count: officialCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .in('assigned_seller_id', subordinateIds)
      .eq('is_potential', false);

    const now = new Date();
    const startOfFortnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() <= 15 ? 1 : 16
    );

    const { data: teamSales } = await supabase
      .from('sales_orders')
      .select(
        'id, final_price_usd, payment_status, created_at, transaction_number, client:client_id(name), seller:seller_id(full_name)'
      )
      .in('seller_id', subordinateIds)
      .order('created_at', { ascending: false });

    const fortnightSales =
      teamSales?.filter((s) => new Date(s.created_at) >= startOfFortnight) ||
      [];

    const achievedSales = fortnightSales
      .filter(
        (s) => s.payment_status === 'cerrada' || s.payment_status === 'abonada'
      )
      .reduce((acc, curr) => acc + Number(curr.final_price_usd || 0), 0);

    const closedNECount = fortnightSales.filter(
      (s) => s.payment_status === 'cerrada'
    ).length;

    const pendingNECount =
      teamSales?.filter((s) => s.payment_status !== 'cerrada').length || 0;

    const progress =
      totalGoal > 0 ? Math.min(100, (achievedSales / totalGoal) * 100) : 0;

    setTeamStats({
      activeSellers: subordinateIds.length,
      totalGoal,
      achievedSales,
      goalProgress: progress,
      closedNECount,
      pendingNECount,
      visits: (officialCount || 0) + (potentialCount || 0),
      potentials: potentialCount || 0,
    });

    setRecentActivities(teamSales?.slice(0, 5) || []);

    // Generar datos para la gráfica basados en teamSales
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return getLocalDateStr(d);
    });

    const dailyData = last7Days.map((dateStr) => {
      // Contar órdenes creadas en este día específico
      const count =
        teamSales?.filter((s) => {
          if (!s.created_at) return false;
          const orderDateStr = getLocalDateStr(new Date(s.created_at));
          return orderDateStr === dateStr;
        }).length || 0;
      return { date: dateStr, amount: count };
    });

    setDailySalesData(dailyData);
  };

  // --- LÓGICA VENDEDOR ---
  const fetchSellerData = async () => {
    const sellerId = profile?.id;
    if (!sellerId) return;

    const { data: mySales } = await supabase
      .from('sales_orders')
      .select(
        'id, final_price_usd, payment_status, balance_due_usd, created_at, transaction_number, client:client_id(name)'
      )
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    const totalSales =
      mySales?.reduce(
        (acc, curr) => acc + Number(curr.final_price_usd || 0),
        0
      ) || 0;

    const pendingBalance =
      mySales
        ?.filter((s) => s.payment_status !== 'cerrada')
        .reduce(
          (acc, curr) =>
            acc + Number(curr.balance_due_usd || curr.final_price_usd || 0),
          0
        ) || 0;

    const { count: myClientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_seller_id', sellerId)
      .eq('is_potential', false);

    const { count: myPotentialsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_seller_id', sellerId)
      .eq('is_potential', true);

    setMetrics({
      totalSales,
      pendingBalance,
      myClients: myClientsCount || 0,
      myPotentials: myPotentialsCount || 0,
    });

    setRecentActivities(mySales?.slice(0, 5) || []);

    // Generar datos para la gráfica basados en mySales
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return getLocalDateStr(d);
    });

    const dailyData = last7Days.map((dateStr) => {
      // Contar órdenes creadas en este día específico
      const count =
        mySales?.filter((s) => {
          if (!s.created_at) return false;
          const orderDateStr = getLocalDateStr(new Date(s.created_at));
          return orderDateStr === dateStr;
        }).length || 0;
      return { date: dateStr, amount: count };
    });

    setDailySalesData(dailyData);
  };

  const handleCreateNE = () => {
    window.location.href = '/ventas';
  };

  const handleGoToPendingUsers = () => {
    window.location.href = '/usuarios?tab=admitir'; // Ajusta la ruta según tu estructura real
  };

  const handleGoToPendingApprovals = () => {
    window.location.href = '/administrativo?tab=aprobaciones';
  };

  const handleGoToCobranza = () => {
    window.location.href = '/administrativo?tab=cobranza';
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: '#6b7280',
          fontFamily: 'system-ui',
        }}
      >
        Cargando datos reales de Fenix WebSite...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: isMobile ? '12px' : '16px',
        backgroundColor: '#f9fafb',
        minHeight: 'calc(100vh - 120px)',
        paddingBottom: '80px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* --- ENCABEZADO: Saludo + Botones en la misma fila --- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '10px' : '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '800',
              color: '#111827',
              margin: 0,
            }}
          >
            Hola, {profile?.full_name || 'Usuario'}
          </h1>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              color: '#6b7280',
              letterSpacing: '1px',
            }}
          >
            {effectiveRole}
          </span>
        </div>

        {/* En escritorio: solo el botón de Nueva NE */}
        {!isMobile && effectiveRole !== 'stock' && (
          <button
            onClick={handleCreateNE}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#DC2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={16} /> Nueva Nota de Entrega
          </button>
        )}
      </div>

      {/* --- FILA MÓVIL: Accesos rápidos + Botón Nueva NE juntos --- */}
      {isMobile && effectiveRole !== 'stock' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            marginBottom: '14px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none', // Oculta barra de scroll en Firefox
            msOverflowStyle: 'none', // Oculta barra de scroll en IE/Edge
    
          }}
        >
          {/* Botón Nueva NE con mismo estilo que los accesos */}
          <button
            onClick={handleCreateNE}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 8px',
              backgroundColor: '#DC2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
            }}
          >
            <Plus size={13} /> Nueva NE
          </button>

          {effectiveRole === 'administrador' && (
            <>
              <QuickLinkMobile
                label="Cobranza"
                icon={<DollarSign size={13} />}
                color="#059669"
                onClick={() => (window.location.href = '/administrativo')}
              />
              <QuickLinkMobile
                label="Usuarios"
                icon={<Users size={13} />}
                color="#2563EB"
                onClick={() => (window.location.href = '/usuarios')}
              />
              <QuickLinkMobile
                label="Inventario"
                icon={<Package size={13} />}
                color="#7c3aed"
                onClick={() => (window.location.href = '/inventario')}
              />
            </>
          )}
          {(effectiveRole === 'gerente' || effectiveRole === 'supervisor') && (
            <>
              <QuickLinkMobile
                label="Visitas"
                icon={<MapPin size={13} />}
                color="#2563EB"
                onClick={() => (window.location.href = '/vendedores?tab=visitas')}
              />
              <QuickLinkMobile
                label="Equipo"
                icon={<Users size={13} />}
                color="#7c3aed"
                onClick={() => (window.location.href = '/vendedores?tab=resumen')}
              />
              <QuickLinkMobile
                label="Comisiones"
                icon={<DollarSign size={13} />}
                color="#059669"
                onClick={() => (window.location.href = '/vendedores?tab=comisiones')}
              />
            </>
          )}
          {effectiveRole === 'vendedor' && (
            <>
              {/* NUEVO BOTÓN VISITAS */}
              <QuickLinkMobile
                label="Visitas"
                icon={<MapPin size={13} />}
                color="#059669" // Verde consistente con acciones de visita/equipo
                onClick={() => (window.location.href = '/ventas?tab=visitas')}
              />

              {/* CLIENTES (EXISTENTE) */}
              <QuickLinkMobile
                label="Clientes"
                icon={<Users size={13} />}
                color="#2563EB"
                onClick={() => (window.location.href = '/ventas?tab=clientes')}
              />

              {/* N.E. (EXISTENTE) */}
              <QuickLinkMobile
                label="N.E."
                icon={<FileText size={13} />}
                color="#7c3aed"
                onClick={() => (window.location.href = 'ventas?tab=nota_entrega')}
              />

              {/* POTENCIALES (EXISTENTE) */}
              <QuickLinkMobile
                label="Historial"
                icon={<Clock size={13} />}
                color="#16A34A"
                onClick={() => (window.location.href = '/ventas?tab=historial_ventas')}
              />
            </>
          )}
        </div>
      )}

      {/* --- TARJETAS DE MÉTRICAS --- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(3, 1fr)'
            : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '8px' : '12px',
          marginBottom: '20px',
        }}
      >
        {/* ALERTAS DE ADMINISTRADOR - Diseño original en escritorio, cuadrado en móvil */}
        {effectiveRole === 'administrador' && (
          <div
            onClick={handleGoToPendingUsers}
            style={{
              backgroundColor:
                adminAlerts.pendingUsers > 0 ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${
                adminAlerts.pendingUsers > 0 ? '#FECACA' : '#BBF7D0'
              }`,
              borderRadius: isMobile ? '10px' : '12px',
              padding: isMobile ? '8px' : '14px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '4px' : '12px',
              cursor: 'pointer', // ← Hace que el mouse cambie a manito
              transition: 'transform 0.2s, background-color 0.2s',
              aspectRatio: isMobile ? '1' : 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor =
                adminAlerts.pendingUsers > 0 ? '#FEE2E2' : '#DCFCE7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor =
                adminAlerts.pendingUsers > 0 ? '#FEF2F2' : '#F0FDF4';
            }}
          >
            <div
              style={{
                backgroundColor:
                  adminAlerts.pendingUsers > 0 ? '#FEE2E2' : '#DCFCE7',
                padding: isMobile ? '4px' : '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <UserCheck
                size={isMobile ? 13 : 20}
                color={adminAlerts.pendingUsers > 0 ? '#DC2626' : '#16A34A'}
              />
            </div>
            {isMobile ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '8px',
                      color: '#6b7280',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Pend.
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: adminAlerts.pendingUsers > 0 ? '#DC2626' : '#166534',
                  }}
                >
                  {adminAlerts.pendingUsers}
                </div>
              </>
            ) : (
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontWeight: '600',
                  }}
                >
                  Usuarios Pendientes
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: adminAlerts.pendingUsers > 0 ? '#DC2626' : '#166534',
                  }}
                >
                  {adminAlerts.pendingUsers}
                </div>
              </div>
            )}
            {/* Indicador visual opcional en escritorio */}
            {adminAlerts.pendingUsers > 0 && !isMobile && (
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#DC2626',
                  textDecoration: 'underline',
                }}
              >
                Ver Ahora
              </div>
            )}
          </div>
        )}

        {effectiveRole === 'administrador' && (
          <div
            onClick={handleGoToPendingApprovals}
            style={{
              backgroundColor:
                adminAlerts.pendingNE > 0 ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${
                adminAlerts.pendingNE > 0 ? '#FECACA' : '#BBF7D0'
              }`,
              borderRadius: isMobile ? '10px' : '12px',
              padding: isMobile ? '8px' : '14px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '4px' : '12px',
              cursor: 'pointer', // ← Siempre pointer para consistencia visual
              transition: 'transform 0.2s, background-color 0.2s',
              aspectRatio: isMobile ? '1' : 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor =
                adminAlerts.pendingNE > 0 ? '#FEE2E2' : '#DCFCE7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor =
                adminAlerts.pendingNE > 0 ? '#FEF2F2' : '#F0FDF4';
            }}
          >
            {/* ... contenido interno se mantiene igual ... */}
            <div
              style={{
                backgroundColor:
                  adminAlerts.pendingNE > 0 ? '#FEE2E2' : '#DCFCE7',
                padding: isMobile ? '4px' : '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Clock
                size={isMobile ? 13 : 20}
                color={adminAlerts.pendingNE > 0 ? '#DC2626' : '#16A34A'}
              />
            </div>
            {isMobile ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '8px',
                      color: '#6b7280',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    N.E. Pend.
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: adminAlerts.pendingNE > 0 ? '#DC2626' : '#166534',
                  }}
                >
                  {adminAlerts.pendingNE}
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      fontWeight: '600',
                    }}
                  >
                    N.E. por Aprobar
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: adminAlerts.pendingNE > 0 ? '#DC2626' : '#166534',
                    }}
                  >
                    {adminAlerts.pendingNE}
                  </div>
                </div>
                {adminAlerts.pendingNE > 0 && (
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#DC2626',
                      textDecoration: 'underline',
                    }}
                  >
                    Ver Ahora
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {effectiveRole === 'administrador' && (
          <div
            onClick={handleGoToCobranza}
            style={{
              backgroundColor:
                adminAlerts.pendingPayments > 0 ? '#FFFBEB' : '#F0FDF4',
              border: `1px solid ${
                adminAlerts.pendingPayments > 0 ? '#FDE68A' : '#BBF7D0'
              }`,
              borderRadius: isMobile ? '10px' : '12px',
              padding: isMobile ? '8px' : '14px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '4px' : '12px',
              cursor: 'pointer', // ← Siempre pointer
              transition: 'transform 0.2s, background-color 0.2s',
              aspectRatio: isMobile ? '1' : 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor =
                adminAlerts.pendingPayments > 0 ? '#FEF3C7' : '#DCFCE7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor =
                adminAlerts.pendingPayments > 0 ? '#FFFBEB' : '#F0FDF4';
            }}
          >
            {/* ... contenido interno se mantiene igual ... */}
            <div
              style={{
                backgroundColor:
                  adminAlerts.pendingPayments > 0 ? '#FEF3C7' : '#DCFCE7',
                padding: isMobile ? '4px' : '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Bell
                size={isMobile ? 13 : 20}
                color={adminAlerts.pendingPayments > 0 ? '#B45309' : '#16A34A'}
              />
            </div>
            {isMobile ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '8px',
                      color: '#6b7280',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Abonos
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color:
                      adminAlerts.pendingPayments > 0 ? '#B45309' : '#166534',
                  }}
                >
                  {adminAlerts.pendingPayments}
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      fontWeight: '600',
                    }}
                  >
                    Notif. Abono Pend.
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color:
                        adminAlerts.pendingPayments > 0 ? '#B45309' : '#166534',
                    }}
                  >
                    {adminAlerts.pendingPayments}
                  </div>
                </div>
                {adminAlerts.pendingPayments > 0 && (
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#B45309',
                      textDecoration: 'underline',
                    }}
                  >
                    Ver Ahora
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {effectiveRole === 'administrador' && (
          <>
            <MetricCard
              title={isMobile ? 'Ventas (30d)' : 'Ventas Totales (30d)'}
              value={`$${metrics.totalSales?.toFixed(2) || 0}`}
              icon={<DollarSign size={isMobile ? 13 : 18} />}
              color="#111827"
              isMobile={isMobile}
            />
            <MetricCard
              title={isMobile ? 'Por Cobrar' : 'Por Cobrar Global'}
              value={`$${metrics.pendingCobranza?.toFixed(2) || 0}`}
              icon={<AlertCircle size={isMobile ? 13 : 18} />}
              color="#DC2626"
              isMobile={isMobile}
            />
          </>
        )}

        {/* TARJETAS DE EQUIPO PARA GERENTE / SUPERVISOR */}
        {(effectiveRole === 'gerente' || effectiveRole === 'supervisor') && (
          <>
            {isMobile ? (
              <>
                <TeamCardMobile
                  icon={<Users size={13} color="#6b7280" />}
                  title="Vend."
                  value={teamStats.activeSellers}
                  subtitle="Activos"
                  borderColor="#e5e7eb"
                  titleColor="#6b7280"
                  valueColor="#111827"
                />
                <TeamCardMobile
                  icon={<DollarSign size={13} color="#6b7280" />}
                  title="Meta"
                  value={`$${teamStats.achievedSales?.toFixed(0) || 0}`}
                  subtitle={`${teamStats.goalProgress?.toFixed(0) || 0}%`}
                  subtitleColor="#16a34a"
                  borderColor="#e5e7eb"
                  titleColor="#6b7280"
                  valueColor="#111827"
                  valueSize="13px"
                  extra={`/${teamStats.totalGoal}`}
                />
                <TeamCardMobile
                  icon={<FileText size={13} color="#16a34a" />}
                  title="Cerradas"
                  value={teamStats.closedNECount}
                  subtitle="Quincena"
                  borderColor="#16a34a"
                  titleColor="#16a34a"
                  valueColor="#16a34a"
                />
                <TeamCardMobile
                  icon={<Clock size={13} color="#dc2626" />}
                  title="Pendientes"
                  value={teamStats.pendingNECount}
                  subtitle="Por cobrar"
                  borderColor="#dc2626"
                  titleColor="#dc2626"
                  valueColor="#dc2626"
                />
              </>
            ) : (
              <>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    Vendedores Activos
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#111827',
                    }}
                  >
                    {teamStats.activeSellers}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      marginTop: '2px',
                    }}
                  >
                    En estructura
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    Meta vs Alcanzado
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: '#111827',
                    }}
                  >
                    ${teamStats.achievedSales?.toFixed(2) || 0}{' '}
                    <span
                      style={{
                        color: '#9ca3af',
                        fontWeight: '400',
                        fontSize: '14px',
                      }}
                    >
                      / ${teamStats.totalGoal}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#16a34a',
                      fontWeight: '600',
                      marginTop: '2px',
                    }}
                  >
                    {teamStats.goalProgress?.toFixed(0) || 0}% Completado
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #16a34a',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#16a34a',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    N.E. Cerradas
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#16a34a',
                    }}
                  >
                    {teamStats.closedNECount}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      marginTop: '2px',
                    }}
                  >
                    Esta quincena
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #dc2626',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#dc2626',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    N.E. Pendientes
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#dc2626',
                    }}
                  >
                    {teamStats.pendingNECount}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      marginTop: '2px',
                    }}
                  >
                    Por cobrar/cerrar
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* TARJETAS PARA VENDEDOR */}
        {effectiveRole === 'vendedor' && (
          <>
            <MetricCard
              title={isMobile ? 'Mis Ventas' : 'Mis Ventas'}
              value={`$${metrics.totalSales?.toFixed(2) || 0}`}
              icon={<ShoppingCart size={isMobile ? 13 : 18} />}
              color="#111827"
              isMobile={isMobile}
            />
            <MetricCard
              title={isMobile ? 'Saldo Pend.' : 'Saldo Pendiente'}
              value={`$${metrics.pendingBalance?.toFixed(2) || 0}`}
              icon={<Clock size={isMobile ? 13 : 18} />}
              color="#DC2626"
              isMobile={isMobile}
            />
            <MetricCard
              title={isMobile ? 'Clientes' : 'Mis Clientes'}
              value={metrics.myClients || 0}
              icon={<Users size={isMobile ? 13 : 18} />}
              color="#2563EB"
              isMobile={isMobile}
            />
            <MetricCard
              title="Potenciales"
              value={metrics.myPotentials || 0}
              icon={<UserCheck size={isMobile ? 13 : 18} />}
              color="#16A34A"
              isMobile={isMobile}
            />
          </>
        )}

        {/* Tarjeta de Inventario (todos los roles) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: isMobile ? '10px' : '12px',
            padding: isMobile ? '8px' : '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            aspectRatio: isMobile ? '1' : 'auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'column',
            justifyContent: 'center',
            alignItems: isMobile ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            <Package size={isMobile ? 13 : 18} color="#6b7280" />
            <span
              style={{
                fontSize: isMobile ? '8px' : '10px',
                color: '#6b7280',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              {isMobile ? 'Inventario' : 'Inventario Total'}
            </span>
          </div>
          <div
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '800',
              color: '#111827',
              textAlign: isMobile ? 'center' : 'left',
              width: '100%',
            }}
          >
            {inventoryStats.total}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'space-between',
              gap: isMobile ? '8px' : '0',
              marginTop: '8px',
              fontSize: isMobile ? '8px' : '11px',
              width: '100%',
            }}
          >
            <span style={{ color: '#6b7280', textAlign: 'center' }}>
              {isMobile ? 'Bomb' : 'Bombillos'}:{' '}
              <strong>{inventoryStats.bombillos}</strong>
            </span>
            <span style={{ color: '#6b7280', textAlign: 'center' }}>
              {isMobile ? 'Flui' : 'Fluidos'}:{' '}
              <strong>{inventoryStats.fluidos}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE GRÁFICAS Y TRANSACCIONES (Oculta para rol stock) --- */}
      {effectiveRole !== 'stock' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px',
            marginBottom: '20px',
            alignItems: 'stretch',
            maxWidth: isMobile ? '100%' : '1200px',
            margin: isMobile ? '0 0 20px 0' : '0 auto 20px auto',
          }}
        >
          {/* Gráfico de Ventas Diarias */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: isMobile ? '12px' : '16px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: isMobile ? '200px' : 'auto',
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '800',
                color: '#111827',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
              }}
            >
              Ventas Diarias (Últimos 7 Días)
            </h3>
            {/* CONTENEDOR DE GRÁFICA ADAPTATIVO */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                flex: 1,
                gap: isMobile ? '6px' : '8px',
                paddingBottom: '10px',
                position: 'relative',
              }}
            >
              {dailySalesData.map((day, idx) => {
                // Calcular el máximo real de los datos
                const maxValRaw = Math.max(
                  ...dailySalesData.map((d) => d.amount),
                  1
                );
                // Definir el valor de escala: si el máximo es bajo (<5), usamos 5 como base visual
                const scaleBase = maxValRaw < 5 ? 5 : maxValRaw;
                // Altura porcentual basada en la escala base
                const heightPct = (day.amount / scaleBase) * 100;
                // Formatear fecha para mostrar (ej: 27/09)
                const dateObj = new Date(day.date + 'T12:00:00');
                const dayLabel = `${dateObj.getDate()}/${
                  dateObj.getMonth() + 1
                }`;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {/* Valor numérico sobre la barra */}
                    <div
                      style={{
                        fontSize: isMobile ? '9px' : '10px',
                        fontWeight: 'bold',
                        color: '#3b82f6',
                        marginBottom: '2px',
                        opacity: day.amount > 0 ? 1 : 0,
                      }}
                    >
                      {day.amount}
                    </div>
                    {/* Barra visual */}
                    <div
                      style={{
                        width: '100%',
                        backgroundColor: '#eff6ff',
                        borderRadius: '4px',
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          backgroundColor: '#3b82f6',
                          height: `${heightPct}%`,
                          borderRadius: '4px',
                          transition: 'height 0.5s ease',
                          minHeight: day.amount > 0 ? '4px' : '0',
                        }}
                      ></div>
                    </div>
                    {/* Etiqueta de fecha */}
                    <span
                      style={{
                        fontSize: isMobile ? '8px' : '9px',
                        color: '#6b7280',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Últimas Transacciones */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: isMobile ? '12px' : '16px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: isMobile ? '200px' : 'auto',
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: '800',
                color: '#111827',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
              }}
            >
              Últimas Transacciones
            </h3>
            {recentActivities.length === 0 ? (
              <div
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  textAlign: 'center',
                  padding: '16px 0',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                No hay actividad reciente registrada.
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  overflowY: 'auto',
                  maxHeight: '100%',
                }}
              >
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      paddingBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: '700',
                        color: '#111827',
                      }}
                    >
                      <span>
                        N.E. #
                        {act.transaction_number || act.id?.substring(0, 6)}
                      </span>
                      <span style={{ color: '#dc2626' }}>
                        ${Number(act.final_price_usd || 0).toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: isMobile ? '9px' : '10px',
                        color: '#6b7280',
                        marginTop: '2px',
                        flexWrap: 'wrap',
                        gap: '4px',
                      }}
                    >
                      <span>
                        {act.client?.name || 'Cliente'} •{' '}
                        {act.seller?.full_name || ''}
                      </span>
                      <span>
                        {act.created_at
                          ? new Date(act.created_at).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ACCESOS RÁPIDOS (Solo escritorio, en móvil ya están arriba) --- */}
      {!isMobile && (
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '800',
              color: '#111827',
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
            }}
          >
            Accesos Rápidos
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
            }}
          >
            {effectiveRole === 'administrador' && (
              <>
                <QuickLink
                  label="Gestión Cobranza"
                  icon={<DollarSign size={16} />}
                  color="#059669"
                  onClick={() => (window.location.href = '/administrativo')}
                />
                <QuickLink
                  label="Usuarios"
                  icon={<Users size={16} />}
                  color="#2563EB"
                  onClick={() => (window.location.href = '/usuarios')}
                />
                <QuickLink
                  label="Inventario"
                  icon={<Package size={16} />}
                  color="#7c3aed"
                  onClick={() => (window.location.href = '/inventario')}
                />
              </>
            )}
            {(effectiveRole === 'gerente' ||
              effectiveRole === 'supervisor') && (
              <>
                <QuickLink
                  label="Visitas Equipo"
                  icon={<MapPin size={16} />}
                  color="#2563EB"
                  onClick={() => (window.location.href = '/vendedores?tab=visitas')}
                />
                <QuickLink
                  label="Equipo"
                  icon={<Users size={16} />}
                  color="#7c3aed"
                  onClick={() => (window.location.href = '/vendedores?tab=resumen')}
                />
                <QuickLink
                  label="Comisiones"
                  icon={<DollarSign size={16} />}
                  color="#059669"
                  onClick={() => (window.location.href = '/vendedores?tab=comisiones')}
                />
              </>
            )}
            {effectiveRole === 'vendedor' && (
              <>
                <QuickLink
                  label="Mis Clientes"
                  icon={<Users size={16} />}
                  color="#2563EB"
                  onClick={() => (window.location.href = '/ventas')}
                />
                <QuickLink
                  label="Mis N.E."
                  icon={<FileText size={16} />}
                  color="#7c3aed"
                  onClick={() => (window.location.href = '/ventas')}
                />
                <QuickLink
                  label="Potenciales"
                  icon={<UserCheck size={16} />}
                  color="#16A34A"
                  onClick={() => (window.location.href = '/ventas')}
                />
              </>
            )}
            {effectiveRole === 'stock' && (
              <>
                <QuickLink
                  label="Inventario General"
                  icon={<Package size={16} />}
                  color="#7c3aed"
                  onClick={() => (window.location.href = '/inventario')}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color, isMobile }) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: isMobile ? '10px' : '12px',
        padding: isMobile ? '8px' : '14px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        aspectRatio: isMobile ? '1' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Icono + Título en la misma línea, centrados */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          marginBottom: '4px',
        }}
      >
        <div style={{ color: color, display: 'flex', alignItems: 'center' }}>
          {icon}
        </div>
        <span
          style={{
            fontSize: isMobile ? '8px' : '10px',
            color: '#6b7280',
            fontWeight: '700',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontSize: isMobile ? '16px' : '20px',
          fontWeight: '800',
          color: '#111827',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TeamCardMobile({
  icon,
  title,
  value,
  subtitle,
  subtitleColor = '#6b7280',
  borderColor,
  titleColor,
  valueColor,
  valueSize = '18px',
  extra = '',
}) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          marginBottom: '4px',
        }}
      >
        {icon}
        <span
          style={{
            fontSize: '8px',
            color: titleColor,
            fontWeight: '700',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontSize: valueSize,
          fontWeight: '800',
          color: valueColor,
          textAlign: 'center',
        }}
      >
        {value}
        {extra && (
          <span
            style={{
              color: '#9ca3af',
              fontWeight: '400',
              fontSize: '10px',
              marginLeft: '2px',
            }}
          >
            {extra}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: '8px',
          color: subtitleColor,
          marginTop: '2px',
          textAlign: 'center',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function QuickLink({ label, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151',
        width: '100%',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
    >
      <div style={{ color: color }}>{icon}</div>
      {label}
    </button>
  );
}

function QuickLinkMobile({ label, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: '7px 10px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '10px',
        fontWeight: '600',
        color: '#374151',
        whiteSpace: 'nowrap',
        flex: '0 0 auto',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
    >
      <div style={{ color: color, display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: '10px' }}>{label}</span>
    </button>
  );
}
