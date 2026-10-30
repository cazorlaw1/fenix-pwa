import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Archive,
  Award,
  Package,
  Trash2,
  Plus,
  Calendar,
  Search,
  FileText,
  PieChart,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Check,
  Wallet,
  RefreshCw,
  Users,
  ShoppingBag,
  History,
  ArrowUpDown,
  Box,
  Truck,
  Target,
  Receipt,
  Coins,
  CreditCard,
  UserCheck,
  AlertTriangle,
  Eye,
  Banknote,
  Briefcase,
  Layers,
  Percent,
  BookOpen,
  Lock,
  X,
} from 'lucide-react';

export default function FinancialReports() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [loading, setLoading] = useState(true);

  const [records, setRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [capitalBreakdown, setCapitalBreakdown] = useState({
    totalInvested: 0,
    inStock: 0,
    inTransit: 0,
    byCategory: {
      bombillos: { total: 0, stock: 0, transit: 0 },
      fluidos: { total: 0, stock: 0, transit: 0 },
    },
  });

  const [payrollLiabilities, setPayrollLiabilities] = useState({
    totalSalaries: 0,
    paidSalaries: 0,
    reservedSalaries: 0,
    totalCommissions: 0,
    paidCommissions: 0,
    reservedCommissions: 0,
    totalPending: 0,
  });

  const [liquidationData, setLiquidationData] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [hierarchyConfigsMap, setHierarchyConfigsMap] = useState({});
  const [hierarchyAssignmentsList, setHierarchyAssignmentsList] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [closedOrdersList, setClosedOrdersList] = useState([]);
  const [liquidatedNotesList, setLiquidatedNotesList] = useState([]);
  const [approvedValesList, setApprovedValesList] = useState([]);
  const [approvedPenaltiesList, setApprovedPenaltiesList] = useState([]);

  const [liquidationSummary, setLiquidationSummary] = useState({
    totalNomina: 0,
    totalComisiones: 0,
    totalToPay: 0,
    totalPaid: 0,
    totalPending: 0,
  });

  const [categoryCommissions, setCategoryCommissions] = useState({
    bombillos: 0,
    fluidos: 0,
    total: 0,
  });

  const [rankingSubTab, setRankingSubTab] = useState('vendedores');
  const [kpi, setKpi] = useState({
    billed: 0,
    paid: 0,
    cogs: 0,
    grossProfit: 0,
    grossProfitPct: 0,
    netProfit: 0,
    netProfitPct: 0,
    cashAvailable: 0,
    totalExpenses: 0,
  });
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Operativo',
    line: 'General',
    amount: '',
    reference: '',
    expense_date: new Date().toISOString().split('T')[0],
  });
  const [searchHistory, setSearchHistory] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase.from('financial_records').select('*');
      if (dateRange.start && dateRange.end) {
        query = query
          .gte('closed_at', dateRange.start)
          .lte('closed_at', dateRange.end + 'T23:59:59');
      }
      const { data: recData } = await query.order('closed_at', {
        ascending: false,
      });
      setRecords(recData || []);

      let expQuery = supabase.from('company_expenses').select('*');
      if (dateRange.start && dateRange.end) {
        expQuery = expQuery
          .gte('expense_date', dateRange.start)
          .lte('expense_date', dateRange.end);
      }
      const { data: expData } = await expQuery.order('expense_date', {
        ascending: false,
      });
      setExpenses(expData || []);

      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['vendedor', 'supervisor', 'gerente', 'administrador']);
      setSellersList(profs || []);

      const { data: hConfig } = await supabase
        .from('hierarchy_config')
        .select('*');
      const configMap = {};
      (hConfig || []).forEach((c) => {
        configMap[c.parent_user_id] = c;
      });
      setHierarchyConfigsMap(configMap);

      const { data: hAssign } = await supabase
        .from('hierarchy_assignments')
        .select('*');
      setHierarchyAssignmentsList(hAssign || []);

      const { data: closedOrd } = await supabase
        .from('sales_orders')
        .select(
          '*, seller:seller_id(id, full_name, pct_bombillos, pct_fluidos, sueldo_fijo_usd, role), client:client_id(name)'
        )
        .eq('payment_status', 'cerrada')
        .eq('status', 'aprobada')
        .order('updated_at', { ascending: false });
      setClosedOrdersList(closedOrd || []);

      const { data: liqOrd } = await supabase
        .from('sales_orders')
        .select(
          '*, seller:seller_id(id, full_name, pct_bombillos, pct_fluidos, sueldo_fijo_usd, role), client:client_id(name)'
        )
        .eq('status', 'liquidada')
        .order('updated_at', { ascending: false });
      setLiquidatedNotesList(liqOrd || []);

      const { data: appVales } = await supabase
        .from('vales')
        .select('*, seller:seller_id(id, full_name)')
        .eq('status', 'aprobada');
      setApprovedValesList(appVales || []);

      const { data: appPen } = await supabase
        .from('penalties')
        .select(
          '*, seller:seller_id(id, full_name), linked_order:order_id(id, transaction_number, final_price_usd, balance_due_usd)'
        )
        .in('status', ['aprobada', 'approved', 'pendiente']);
      setApprovedPenaltiesList(appPen || []);

      const { data: settlements } = await supabase
        .from('settlement_invoices')
        .select('*')
        .order('created_at', { ascending: false });
      const enrichedSettlements = (settlements || []).map((inv) => {
        const foundUser = (profs || []).find(
          (p) => String(p.id) === String(inv.user_id)
        );
        return {
          ...inv,
          user: foundUser || { full_name: 'Usuario Desconocido', role: '-' },
        };
      });
      setSettlementHistory(enrichedSettlements);

      const commByCat = calculateCategoryCommissions(
        closedOrd || [],
        liqOrd || [],
        profs || [],
        configMap,
        hAssign || []
      );
      setCategoryCommissions(commByCat);

      calculateLiquidationsForPeriod(
        new Date().getMonth() + 1,
        new Date().getFullYear(),
        profs || [],
        closedOrd || [],
        liqOrd || [],
        appVales || [],
        appPen || [],
        configMap,
        hAssign || [],
        settlements || [],
        setLiquidationData,
        setLiquidationSummary
      );

      buildMonthlyComparison(recData || []);
      const realMetrics = await fetchRealTimeMetrics();
      await fetchPayrollLiabilities(
        profs || [],
        settlements || [],
        commByCat.total
      );

      calculateKPIs(recData || [], expData || [], commByCat.total);
      buildLedgerEntries(
        recData || [],
        closedOrd || [],
        liqOrd || [],
        settlements || [],
        expData || [],
        realMetrics
      );
    } catch (err) {
      console.error('Error cargando finanzas:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLiquidationsForPeriod = (
    targetMonth,
    targetYear,
    profs,
    closedOrd,
    liqOrd,
    appVales,
    appPen,
    configMap,
    hAssign,
    existingInvoices,
    setterData,
    setterSummary
  ) => {
    const paidPerUserMap = {};
    (existingInvoices || []).forEach((inv) => {
      if (!inv.user_id) return;
      const invDate = new Date(inv.created_at || inv.date || Date.now());
      const invMonth = Number(inv.month || invDate.getMonth() + 1);
      const invYear = Number(inv.year || invDate.getFullYear());

      if (invMonth !== Number(targetMonth) || invYear !== Number(targetYear))
        return;

      const uId = String(inv.user_id);
      if (!paidPerUserMap[uId]) {
        paidPerUserMap[uId] = {
          totalPaid: 0,
          sueldoPaid: 0,
          commPaid: 0,
          invoices: [],
        };
      }
      const totalInvPaid = Number(
        inv.total_neto_pagar_usd || inv.paid_amount || inv.total || 0
      );
      const invSueldo = Number(
        inv.sueldo_fijo_usd || inv.sueldo_pagado_usd || 0
      );
      const invComm = Number(
        inv.comision_pagada_usd ||
          inv.commission_amount ||
          totalInvPaid - invSueldo
      );

      paidPerUserMap[uId].totalPaid += totalInvPaid;
      paidPerUserMap[uId].sueldoPaid +=
        invSueldo > 0
          ? invSueldo
          : inv.tipo_pago === 'sueldo'
          ? totalInvPaid
          : 0;
      paidPerUserMap[uId].commPaid +=
        invComm > 0
          ? invComm
          : inv.tipo_pago === 'comision'
          ? totalInvPaid
          : invSueldo === 0
          ? totalInvPaid
          : 0;
      paidPerUserMap[uId].invoices.push(inv);
    });

    const rows = (profs || [])
      .map((user) => {
        const uId = String(user.id);
        const userNotes = getClosedNotesForUserAndCycle(
          user.id,
          closedOrd,
          liqOrd
        );
        const userVales = getApprovedValesForUserAndCycle(user.id, appVales);
        const userPenalties = getApprovedPenaltiesForUserAndCycle(
          user.id,
          appPen
        );

        const details = calculateUserSettlementDetails(
          user,
          userNotes,
          userVales,
          userPenalties,
          configMap,
          hAssign,
          profs,
          closedOrd,
          liqOrd
        );
        const paidData = paidPerUserMap[uId] || {
          totalPaid: 0,
          sueldoPaid: 0,
          commPaid: 0,
          invoices: [],
        };

        const sueldoTotalMes = Number(user.sueldo_fijo_usd || 0);
        const sueldoPaid = Math.min(
          sueldoTotalMes,
          paidData.sueldoPaid > 0
            ? paidData.sueldoPaid
            : paidData.totalPaid > 0
            ? Math.min(paidData.totalPaid, sueldoTotalMes)
            : 0
        );
        const sueldoRemaining = Math.max(0, sueldoTotalMes - sueldoPaid);
        const isSueldoPaidCompletely =
          sueldoRemaining <= 0.01 && sueldoTotalMes > 0;

        const commTotal = details.commNetUsd + details.hierarchyUsd;
        const commPaid = Math.min(
          commTotal,
          paidData.commPaid > 0
            ? paidData.commPaid
            : Math.max(0, paidData.totalPaid - sueldoPaid)
        );
        const commRemaining = Math.max(0, commTotal - commPaid);

        const alreadyPaidUser = sueldoPaid + commPaid;
        const totalToPayUser = sueldoTotalMes + commTotal;
        const remainingToPay = Math.max(0, totalToPayUser - alreadyPaidUser);
        const isPaidCompletely = remainingToPay <= 0.01 && totalToPayUser > 0;

        return {
          user,
          details,
          hasActivity: details.hasActivity,
          sueldoTotalMes,
          sueldoPaid,
          sueldoRemaining,
          isSueldoPaidCompletely,
          commTotal,
          commPaid,
          commRemaining,
          totalToPay: totalToPayUser,
          alreadyPaid: alreadyPaidUser,
          remainingToPay,
          isPaidCompletely,
          invoices: paidData.invoices,
        };
      })
      .filter(
        (r) =>
          r.hasActivity &&
          (r.sueldoTotalMes > 0 || r.commTotal > 0 || r.alreadyPaid > 0)
      );

    setterData(rows);

    const totalNomina = rows.reduce((sum, r) => sum + r.sueldoTotalMes, 0);
    const totalComisiones = rows.reduce((sum, r) => sum + r.commTotal, 0);
    const totalToPay = totalNomina + totalComisiones;
    const totalPaid = rows.reduce((sum, r) => sum + r.alreadyPaid, 0);
    const totalPending = Math.max(0, totalToPay - totalPaid);

    setterSummary({
      totalNomina,
      totalComisiones,
      totalToPay,
      totalPaid,
      totalPending,
    });
  };

  const calculateCategoryCommissions = (
    closedOrd,
    liqOrd,
    profs,
    configMap,
    hAssign
  ) => {
    const allOrders = [...(closedOrd || []), ...(liqOrd || [])];
    let bombillosComm = 0,
      fluidosComm = 0;

    allOrders.forEach((order) => {
      if (order.commission_zero_override || order.commission_override_zero)
        return;
      const cat = (order.category || 'bombillos').toLowerCase();
      const seller = (profs || []).find(
        (p) => String(p.id) === String(order.seller_id || order.seller?.id)
      );
      const ownComm = calcOrderCommissionUSD(order, seller);

      let hierarchyCommForOrder = 0;
      (profs || []).forEach((parentUser) => {
        if (
          ['supervisor', 'gerente', 'administrador'].includes(
            parentUser.role?.toLowerCase()
          )
        ) {
          const evalRes = evaluateHierarchyCommissionForOrder(
            order,
            parentUser.id,
            configMap,
            hAssign
          );
          hierarchyCommForOrder += Number(evalRes.commissionUsd || 0);
        }
      });

      const totalOrderCommission = ownComm + hierarchyCommForOrder;
      if (cat === 'fluidos') fluidosComm += totalOrderCommission;
      else bombillosComm += totalOrderCommission;
    });

    return {
      bombillos: bombillosComm,
      fluidos: fluidosComm,
      total: bombillosComm + fluidosComm,
    };
  };

  const getClosedNotesForUserAndCycle = (userId, closedOrd, liqOrd) => {
    const activeNotes = (closedOrd || []).filter(
      (o) => String(o.seller_id || o.seller?.id) === String(userId)
    );
    const liquidatedNotes = (liqOrd || []).filter(
      (o) => String(o.seller_id || o.seller?.id) === String(userId)
    );
    return [...activeNotes, ...liquidatedNotes];
  };

  const getApprovedValesForUserAndCycle = (userId, appVales) =>
    (appVales || []).filter(
      (v) => String(v.seller_id || v.seller?.id) === String(userId)
    );
  const getApprovedPenaltiesForUserAndCycle = (userId, appPen) =>
    (appPen || []).filter(
      (p) => String(p.seller_id || p.seller?.id) === String(userId)
    );

  const calcOrderCommissionUSD = (order, sellerUser) => {
    if (
      !order ||
      order.commission_zero_override ||
      order.commission_override_zero
    )
      return 0;
    const finalPrice = Number(order.final_price_usd || 0);
    const cat = (order.category || 'bombillos').toLowerCase();
    const pct =
      cat === 'fluidos'
        ? Number(sellerUser?.pct_fluidos ?? order.seller?.pct_fluidos ?? 2)
        : Number(sellerUser?.pct_bombillos ?? order.seller?.pct_bombillos ?? 3);
    return finalPrice * (pct / 100);
  };

  const evaluateHierarchyCommissionForOrder = (
    order,
    parentUserId,
    configMap,
    hAssign
  ) => {
    const paymentDiscount = String(order?.payment_discount || '53.38');
    if (!order)
      return {
        pctUsed: 0,
        commissionUsd: 0,
        ruleApplied: 'N/A',
        paymentDiscount,
      };
    if (order.commission_zero_override || order.commission_override_zero)
      return {
        pctUsed: 0,
        commissionUsd: 0,
        ruleApplied: 'Comisión anulada (0%)',
        paymentDiscount,
      };

    const targetSellerId = order.seller_id || order.seller?.id;
    const cat = (order.category || 'bombillos').toLowerCase();
    const finalPrice = Number(order.final_price_usd || 0);
    const specificAssign = (hAssign || []).find(
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
    const config = configMap[parentUserId];
    if (config && config.is_global) {
      const exceptionAssign = (hAssign || []).find(
        (a) =>
          String(a.parent_user_id) === String(parentUserId) &&
          String(a.target_seller_id) === String(targetSellerId) &&
          a.is_exception
      );
      if (exceptionAssign)
        return {
          pctUsed: 0,
          commissionUsd: 0,
          ruleApplied: 'Excepción Global (0%)',
          paymentDiscount,
        };
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

  const calculateHierarchyCommissionsForUser = (
    parentUser,
    closedOrd,
    liqOrd,
    configMap,
    hAssign,
    sellersList
  ) => {
    const config = configMap[parentUser.id];
    const excIds = (hAssign || [])
      .filter(
        (a) =>
          String(a.parent_user_id) === String(parentUser.id) && a.is_exception
      )
      .map((a) => String(a.target_seller_id));
    const specificAssigns = (hAssign || []).filter(
      (a) =>
        String(a.parent_user_id) === String(parentUser.id) && !a.is_exception
    );

    const eligibleSellers = (sellersList || []).filter(
      (s) =>
        String(s.id) !== String(parentUser.id) &&
        s.role?.toLowerCase() !== 'stock' &&
        s.role !== 'pendiente'
    );
    let targetSellerIds =
      config && config.is_global
        ? eligibleSellers
            .filter((s) => !excIds.includes(String(s.id)))
            .map((s) => String(s.id))
        : specificAssigns.map((a) => String(a.target_seller_id));

    const allSubordinateOrders = [
      ...(closedOrd || []),
      ...(liqOrd || []),
    ].filter((o) =>
      targetSellerIds.includes(String(o.seller_id || o.seller?.id))
    );
    let hierarchyCommissionUsd = 0;
    const evaluatedOrders = allSubordinateOrders.map((o) => {
      const evalRes = evaluateHierarchyCommissionForOrder(
        o,
        parentUser.id,
        configMap,
        hAssign
      );
      hierarchyCommissionUsd += evalRes.commissionUsd;
      return { order: o, ...evalRes };
    });

    return {
      subordinateOrdersCount: allSubordinateOrders.length,
      evaluatedOrders,
      hierarchyCommissionUsd,
    };
  };

  const calculateUserSettlementDetails = (
    user,
    userNotes,
    userVales,
    userPenalties,
    configMap,
    hAssign,
    sellersList,
    closedOrd,
    liqOrd
  ) => {
    let commGrossUsd = 0,
      valesDeductionUsd = 0;
    userNotes.forEach((n) => {
      commGrossUsd += calcOrderCommissionUSD(n, user);
    });
    userVales.forEach((v) => {
      valesDeductionUsd += Number(v.requested_amount_usd || 0);
    });

    const totalPenaltiesUsd = userPenalties.reduce(
      (acc, p) => acc + Number(p.amount || 0),
      0
    );
    const hierarchyData = calculateHierarchyCommissionsForUser(
      user,
      closedOrd,
      liqOrd,
      configMap,
      hAssign,
      sellersList
    );
    const hierarchyUsd = hierarchyData.hierarchyCommissionUsd || 0;
    const commNetUsd = Math.max(0, commGrossUsd - valesDeductionUsd);
    const rawSueldoFijo = Number(user.sueldo_fijo_usd || 0);
    const totalEquivalentUsd = commNetUsd + hierarchyUsd + rawSueldoFijo;

    const hasActivity =
      userNotes.length > 0 ||
      userVales.length > 0 ||
      hierarchyData.subordinateOrdersCount > 0 ||
      rawSueldoFijo > 0 ||
      hierarchyUsd > 0;

    return {
      user,
      notes: userNotes,
      vales: userVales,
      penalties: userPenalties,
      totalPenaltiesUsd,
      sueldoFijoOriginal: rawSueldoFijo,
      commGrossUsd,
      commNetUsd,
      hierarchyUsd,
      valesDeductionUsd,
      totalEquivalentUsd,
      hierarchyData,
      hasActivity,
    };
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('stock_current, base_price, category');
      let stockTotal = 0;
      const stockByCat = { bombillos: 0, fluidos: 0 };
      (products || []).forEach((p) => {
        const val =
          (Number(p.stock_current) || 0) * (Number(p.base_price) || 0);
        stockTotal += val;
        const cat = (p.category || '').toLowerCase();
        if (cat === 'bombillos') stockByCat.bombillos += val;
        else if (cat === 'fluidos') stockByCat.fluidos += val;
      });

      const { data: openOrders } = await supabase
        .from('sales_orders')
        .select(
          'id, category, final_price_usd, order_items(quantity, product_id, products(base_price))'
        )
        .in('payment_status', ['pendiente', 'abonada']);
      let transitTotal = 0,
        billedTotal = 0;
      const transitByCat = { bombillos: 0, fluidos: 0 };
      const billedByCat = { bombillos: 0, fluidos: 0 };
      (openOrders || []).forEach((order) => {
        const cat = (order.category || '').toLowerCase();
        const price = Number(order.final_price_usd || 0);
        billedTotal += price;
        if (cat === 'fluidos') billedByCat.fluidos += price;
        else billedByCat.bombillos += price;

        (order.order_items || []).forEach((item) => {
          const basePrice = Number(item.products?.base_price) || 0;
          const itemVal = (Number(item.quantity) || 0) * basePrice;
          transitTotal += itemVal;
          if (cat === 'fluidos') transitByCat.fluidos += itemVal;
          else transitByCat.bombillos += itemVal;
        });
      });

      const breakdown = {
        totalInvested: stockTotal + transitTotal,
        inStock: stockTotal,
        inTransit: transitTotal,
        byCategory: {
          bombillos: {
            total: stockByCat.bombillos + transitByCat.bombillos,
            stock: stockByCat.bombillos,
            transit: transitByCat.bombillos,
            billed: billedByCat.bombillos,
          },
          fluidos: {
            total: stockByCat.fluidos + transitByCat.fluidos,
            stock: stockByCat.fluidos,
            transit: transitByCat.fluidos,
            billed: billedByCat.fluidos,
          },
        },
      };
      setCapitalBreakdown(breakdown);
      setKpi((prev) => ({ ...prev, billed: billedTotal }));
      return breakdown;
    } catch (err) {
      console.error('Error calculando métricas reales:', err);
      return null;
    }
  };

  const fetchPayrollLiabilities = async (
    profs,
    settlements,
    totalCommissionsUsd
  ) => {
    try {
      let totalSalaries = 0;
      let paidSalaries = 0;
      (profs || []).forEach((p) => {
        if (
          ['vendedor', 'supervisor', 'gerente', 'administrador'].includes(
            p.role
          )
        ) {
          totalSalaries += Number(p.sueldo_fijo_usd || 0);
        }
      });

      (settlements || []).forEach((inv) => {
        paidSalaries += Number(
          inv.sueldo_fijo_usd || inv.sueldo_pagado_usd || 0
        );
      });

      const reservedSalaries = Math.max(0, totalSalaries - paidSalaries);

      let paidCommissions = 0;
      (settlements || []).forEach((inv) => {
        const totalInvPaid = Number(
          inv.total_neto_pagar_usd || inv.paid_amount || inv.total || 0
        );
        const invSueldo = Number(
          inv.sueldo_fijo_usd || inv.sueldo_pagado_usd || 0
        );
        paidCommissions += Math.max(0, totalInvPaid - invSueldo);
      });

      const reservedCommissions = Math.max(
        0,
        totalCommissionsUsd - paidCommissions
      );
      const totalPending = reservedSalaries + reservedCommissions;

      setPayrollLiabilities({
        totalSalaries,
        paidSalaries,
        reservedSalaries,
        totalCommissions: totalCommissionsUsd,
        paidCommissions,
        reservedCommissions,
        totalPending,
      });
    } catch (err) {
      console.error('Error calculando obligaciones de nómina:', err);
    }
  };

  const calculateKPIs = (recs, exps, totalCommissionsUsd = 0) => {
    let paid = 0,
      cogs = 0;
    recs.forEach((r) => {
      paid += Number(r.total_sale_usd || 0);
      cogs += Number(r.total_cost_usd || 0);
    });
    const totalExp = exps.reduce(
      (acc, curr) => acc + Number(curr.amount_usd || 0),
      0
    );

    const grossProfit = paid - cogs - totalCommissionsUsd;
    const grossProfitPct =
      cogs > 0
        ? (grossProfit / cogs) * 100
        : paid > 0
        ? (grossProfit / paid) * 100
        : 0;
    const netProfit = grossProfit - totalExp - payrollLiabilities.totalPending;
    const netProfitPct =
      cogs > 0
        ? (netProfit / cogs) * 100
        : paid > 0
        ? (netProfit / paid) * 100
        : 0;
    const cashAvailable = paid - totalExp;

    setKpi((prev) => ({
      ...prev,
      paid,
      cogs,
      grossProfit,
      grossProfitPct,
      totalExpenses: totalExp,
      netProfit,
      netProfitPct,
      cashAvailable,
    }));
  };

  const buildMonthlyComparison = (recs) => {
    const monthsMap = {};
    recs.forEach((r) => {
      if (!r.closed_at) return;
      const date = new Date(r.closed_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}`;
      if (!monthsMap[key]) monthsMap[key] = 0;
      monthsMap[key] += Number(r.total_sale_usd || 0);
    });
    const sortedMonths = Object.entries(monthsMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-4);
    setMonthlyComparison(sortedMonths);
  };

  const buildLedgerEntries = (
    recs,
    closedOrd,
    liqOrd,
    settlements,
    exps,
    realMetrics
  ) => {
    const entries = [];
    (recs || []).forEach((r) => {
      const saleTotal = Number(r.total_sale_usd || 0);
      const costTotal = Number(r.total_cost_usd || 0);
      const netProfit = Number(r.net_profit_usd || 0);
      const estComm = saleTotal * 0.03;

      entries.push({
        date: r.closed_at || r.created_at || new Date().toISOString(),
        tipo: 'ENTRADA',
        categoria: 'Cobro Nota de Entrega',
        ref: `N.E. #${r.transaction_number || 'S/N'}`,
        entrada: saleTotal,
        salida: 0,
        beneficiario: r.client_name || 'Cliente Genérico',
        destino: `Inyección a Capital ($${costTotal.toFixed(
          2
        )}) / Reserva Comisión ($${estComm.toFixed(
          2
        )}) / Caja ($${netProfit.toFixed(2)})`,
      });
    });

    (settlements || []).forEach((inv) => {
      const paidAmount = Number(
        inv.total_neto_pagar_usd || inv.paid_amount || inv.total || 0
      );
      const invSueldo = Number(
        inv.sueldo_fijo_usd || inv.sueldo_pagado_usd || 0
      );
      const isSueldo = invSueldo > 0 || inv.tipo_pago === 'sueldo';

      entries.push({
        date: inv.created_at || new Date().toISOString(),
        tipo: 'SALIDA',
        categoria: isSueldo ? 'Pago de Sueldo Fijo' : 'Pago de Comisión',
        ref: `Recibo #${inv.invoice_code || 'S/C'}`,
        entrada: 0,
        salida: paidAmount,
        beneficiario: inv.user?.full_name || 'Trabajador',
        destino: isSueldo
          ? 'Deduce Sueldo Fijo Pendiente'
          : 'Deduce Comisión Pendiente',
      });
    });

    (exps || []).forEach((exp) => {
      entries.push({
        date: exp.expense_date || exp.created_at || new Date().toISOString(),
        tipo: 'SALIDA',
        categoria: `Egreso (${exp.category || 'Operativo'})`,
        ref: exp.reference_no ? `Ref. ${exp.reference_no}` : 'Gasto General',
        entrada: 0,
        salida: Number(exp.amount_usd || 0),
        beneficiario: exp.description || 'Proveedor / Operación',
        destino: 'Caja Operativa',
      });
    });

    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLedgerEntries(entries);
  };

  const getCategoryMetrics = (cat) => {
    const catLower = cat.toLowerCase();
    const filteredRecs = records.filter(
      (r) => (r.category || '').toLowerCase() === catLower
    );
    const filteredExps = expenses.filter(
      (e) => (e.line_assignment || '').toLowerCase() === catLower
    );
    let paid = 0,
      cogs = 0;
    filteredRecs.forEach((r) => {
      paid += Number(r.total_sale_usd || 0);
      cogs += Number(r.total_cost_usd || 0);
    });
    const totalExpenses = filteredExps.reduce(
      (acc, curr) => acc + Number(curr.amount_usd || 0),
      0
    );
    const catCap = capitalBreakdown.byCategory[catLower] || {
      total: 0,
      stock: 0,
      transit: 0,
      billed: 0,
    };

    const catComm = categoryCommissions[catLower] || 0;
    const grossProfit = paid - cogs - catComm;
    const grossProfitPct =
      cogs > 0
        ? (grossProfit / cogs) * 100
        : paid > 0
        ? (grossProfit / paid) * 100
        : 0;
    const netProfit = grossProfit - totalExpenses;
    const netProfitPct =
      cogs > 0
        ? (netProfit / cogs) * 100
        : paid > 0
        ? (netProfit / paid) * 100
        : 0;

    return {
      billed: catCap.billed,
      paid,
      cogs,
      reservedCommission: catComm,
      grossProfit,
      grossProfitPct,
      totalExpenses,
      netProfit,
      netProfitPct,
      cashAvailable: paid - totalExpenses,
      recs: filteredRecs,
      inventoryCapital: catCap.total,
      stockCapital: catCap.stock,
      transitCapital: catCap.transit,
    };
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;
    try {
      const { error } = await supabase.from('company_expenses').insert([
        {
          description: newExpense.description,
          category: newExpense.category,
          line_assignment: newExpense.line,
          amount_usd: parseFloat(newExpense.amount),
          reference_no: newExpense.reference,
          expense_date: newExpense.expense_date,
          created_by: profile?.id,
        },
      ]);
      if (error) throw error;
      setNewExpense({
        description: '',
        category: 'Operativo',
        line: 'General',
        amount: '',
        reference: '',
        expense_date: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (err) {
      alert('Error guardando gasto: ' + err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este egreso del historial?'))
      return;
    try {
      const { error } = await supabase
        .from('company_expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('Error eliminando egreso: ' + err.message);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (
      !window.confirm(
        '¿Está seguro de eliminar esta copia/registro del historial? Se eliminarán también sus productos asociados.'
      )
    )
      return;
    try {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('Error eliminando registro: ' + err.message);
    }
  };

  const formatMoney = (val) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  const formatPct = (val) => `${Number(val || 0).toFixed(2)}%`;

  const tabsData = [
    { id: 'history', label: 'Histórico de Registros', icon: History },
    { id: 'ledger', label: 'Libro Contable', icon: BookOpen },
    { id: 'general', label: 'Consolidado General', icon: PieChart },
    { id: 'bombillos', label: 'Bombillos', icon: Package },
    { id: 'fluidos', label: 'Fluidos', icon: Archive },
    { id: 'liquidation', label: 'Liquidación y Nómina', icon: CreditCard },
    { id: 'rankings', label: 'Rankings / Tops', icon: Award },
    { id: 'audit', label: 'Gastos y Auditoría', icon: FileText },
  ];

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
        .fin-tabs-desktop { display: flex; gap: 8px; border-bottom: 2px solid #e5e7eb; margin-bottom: 24px; overflow-x: auto; }
        .fin-tabs-mobile { display: none; position: relative; margin-bottom: 24px; }
        .fin-grid-kpi { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .fin-input { width: 100%; padding: 8px 12px; font-size: 13px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; background-color: #ffffff; color: #111827; }
        .fin-input:focus { border-color: #dc2626; outline: none; }
        .fin-btn { padding: 8px 16px; background-color: #dc2626; color: #ffffff; border: none; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background-color 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .fin-btn:hover { background-color: #b91c1c; }
        .fin-table-desktop { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
        .fin-table-desktop th { background-color: #f3f4f6; color: #374151; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 700; cursor: pointer; user-select: none; }
        .fin-table-desktop th:hover { background-color: #e5e7eb; }
        .fin-table-desktop td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827; }
        .fin-mobile-cards { display: none; }
        .fin-mobile-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .charts-double-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .chart-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; width: 100%; max-width: 550px; margin: 0 auto; box-sizing: border-box; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .column-chart-wrapper { display: flex; align-items: flex-end; justify-content: space-around; gap: 12px; height: 200px; padding-top: 30px; border-bottom: 2px solid #e5e7eb; }
        .column-item { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; }
        .column-bar { width: 100%; max-width: 42px; border-radius: 6px 6px 0 0; transition: height 0.4s ease; display: flex; justify-content: center; position: relative; }
        .column-value { position: absolute; top: -22px; font-size: 10px; font-weight: 800; color: #374151; white-space: nowrap; }
        .column-label { margin-top: 8px; font-size: 11px; font-weight: 700; color: #4b5563; text-align: center; }
        .podium-container { display: flex; justify-content: center; align-items: flex-end; gap: 16px; margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; }
        .podium-step { display: flex; flex-direction: column; align-items: center; width: 110px; text-align: center; }
        .podium-box { width: 100%; border-radius: 8px 8px 0 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 900; color: #ffffff; padding: 12px 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .podium-first { height: 110px; background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%); }
        .podium-second { height: 90px; background: linear-gradient(180deg, #9ca3af 0%, #6b7280 100%); }
        .podium-third { height: 75px; background: linear-gradient(180deg, #b45309 0%, #78350f 100%); }
        @media (max-width: 768px) {
          .fin-tabs-desktop { display: none !important; }
          .fin-tabs-mobile { display: block !important; }
          .fin-table-desktop { display: none !important; }
          .fin-mobile-cards { display: block !important; }
          .podium-step { width: 85px; }
          .podium-box { padding: 6px 2px; }
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
              margin: 0,
            }}
          >
            <BarChart3 color="#dc2626" size={28} /> Informes y Estadísticas
            Financieras
          </h1>
          <p
            style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}
          >
            Consolidado contable, flujo de caja real y control de capital.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Calendar size={16} color="#dc2626" />
            <input
              type="date"
              className="fin-input"
              style={{ border: 'none', padding: 0, fontSize: '12px' }}
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
            <span style={{ color: '#6b7280', fontSize: '12px' }}>a</span>
            <input
              type="date"
              className="fin-input"
              style={{ border: 'none', padding: 0, fontSize: '12px' }}
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
          <button className="fin-btn" onClick={fetchData}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      <div className="fin-tabs-desktop">
        {tabsData.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'liquidation') fetchData();
              }}
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
              <Icon size={18} color={isActive ? '#dc2626' : '#4b5563'} />{' '}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="fin-tabs-mobile">
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
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#111827',
            fontSize: '14px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(() => {
              const ActiveIcon =
                tabsData.find((t) => t.id === activeTab)?.icon || BookOpen;
              return <ActiveIcon size={18} color="#dc2626" />;
            })()}
            {tabsData.find((t) => t.id === activeTab)?.label}
          </span>
          <ChevronDown size={18} color="#6b7280" />
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
              zIndex: 1000,
              overflow: 'hidden',
            }}
          >
            {tabsData.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                    if (tab.id === 'liquidation') fetchData();
                  }}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: isActive ? '#dc2626' : '#4b5563',
                    backgroundColor: isActive ? '#fef2f2' : 'transparent',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Icon size={18} /> {tab.label}
                  </span>
                  {isActive && <Check size={16} color="#dc2626" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 0',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          Cargando Libro Contable Automatizado...
        </div>
      ) : (
        <>
          {activeTab === 'ledger' && (
            <LedgerView
              ledgerEntries={ledgerEntries}
              capitalBreakdown={capitalBreakdown}
              records={records}
              expenses={expenses}
              categoryCommissionsTotal={categoryCommissions.total}
              formatMoney={formatMoney}
              formatPct={formatPct}
              sellersList={sellersList}
              settlementHistory={settlementHistory}
              closedOrdersList={closedOrdersList}
              approvedValesList={approvedValesList}
              approvedPenaltiesList={approvedPenaltiesList}
              hierarchyConfigsMap={hierarchyConfigsMap}
              hierarchyAssignmentsList={hierarchyAssignmentsList}
              kpiBilled={kpi.billed}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'history' && (
            <HistoryMainView
              records={records}
              formatMoney={formatMoney}
              formatPct={formatPct}
              searchHistory={searchHistory}
              setSearchHistory={setSearchHistory}
              handleDeleteRecord={handleDeleteRecord}
            />
          )}

          {activeTab === 'general' && (
            <ConsolidatedMetricsView
              kpiData={{
                ...kpi,
                reservedCommission: categoryCommissions.total,
              }}
              monthlyData={monthlyComparison}
              formatMoney={formatMoney}
              formatPct={formatPct}
              capitalData={capitalBreakdown}
            />
          )}

          {(activeTab === 'bombillos' || activeTab === 'fluidos') && (
            <ConsolidatedMetricsView
              kpiData={getCategoryMetrics(activeTab)}
              monthlyData={monthlyComparison}
              formatMoney={formatMoney}
              formatPct={formatPct}
              titleCategory={activeTab.toUpperCase()}
              capitalData={capitalBreakdown.byCategory[activeTab.toLowerCase()]}
            />
          )}

          {activeTab === 'liquidation' && (
            <LiquidationView
              liquidationData={liquidationData}
              settlementHistory={settlementHistory}
              liquidationSummary={liquidationSummary}
              formatMoney={formatMoney}
              sellersList={sellersList}
              closedOrdersList={closedOrdersList}
              approvedValesList={approvedValesList}
              approvedPenaltiesList={approvedPenaltiesList}
              hierarchyConfigsMap={hierarchyConfigsMap}
              hierarchyAssignmentsList={hierarchyAssignmentsList}
            />
          )}

          {activeTab === 'rankings' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
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
                  { id: 'vendedores', label: 'Top Vendedores', icon: Users },
                  { id: 'clientes', label: 'Top Clientes', icon: Award },
                  {
                    id: 'productos',
                    label: 'Top Productos',
                    icon: ShoppingBag,
                  },
                ].map((sub) => {
                  const Icon = sub.icon;
                  const isSubActive = rankingSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setRankingSubTab(sub.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isSubActive ? '#111827' : '#f3f4f6',
                        color: isSubActive ? '#ffffff' : '#4b5563',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icon size={16} /> {sub.label}
                    </button>
                  );
                })}
              </div>
              {rankingSubTab === 'vendedores' && (
                <RankingsSellersSection
                  records={records}
                  formatMoney={formatMoney}
                />
              )}
              {rankingSubTab === 'clientes' && (
                <RankingsClientsSection
                  records={records}
                  formatMoney={formatMoney}
                />
              )}
              {rankingSubTab === 'productos' && (
                <RankingsProductsSection formatMoney={formatMoney} />
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#111827',
                  }}
                >
                  <Plus size={18} color="#dc2626" /> Registrar Egreso
                </h3>
                <form
                  onSubmit={handleAddExpense}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#374151',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Fecha
                    </label>
                    <input
                      type="date"
                      required
                      className="fin-input"
                      value={newExpense.expense_date}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          expense_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#374151',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Categoría
                    </label>
                    <select
                      className="fin-input"
                      value={newExpense.category}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="Operativo">Operativo</option>
                      <option value="Capital">Inyección / Capital</option>
                      <option value="Nomina">Nómina / Vales</option>
                      <option value="Otros">Otros Egresos</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#374151',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Monto USD
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="fin-input"
                      style={{ color: '#dc2626', fontWeight: 'bold' }}
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, amount: e.target.value })
                      }
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#374151',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Descripción
                    </label>
                    <input
                      type="text"
                      required
                      className="fin-input"
                      placeholder="Ej. Pago de flete..."
                      value={newExpense.description}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button type="submit" className="fin-btn">
                      Guardar Egreso
                    </button>
                  </div>
                </form>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: 'bold',
                      color: '#111827',
                    }}
                  >
                    Historial de Egresos Registrados
                  </h3>
                  <p
                    style={{
                      margin: '2px 0 0 0',
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    Lista general de egresos almacenados con opción de
                    eliminación.
                  </p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="fin-table-desktop">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Categoría</th>
                        <th>Descripción</th>
                        <th>Referencia</th>
                        <th style={{ textAlign: 'right' }}>Monto USD</th>
                        <th style={{ textAlign: 'center' }}>Eliminar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              textAlign: 'center',
                              padding: '24px',
                              color: '#6b7280',
                            }}
                          >
                            No hay egresos registrados.
                          </td>
                        </tr>
                      ) : (
                        expenses.map((exp) => (
                          <tr key={exp.id}>
                            <td style={{ color: '#6b7280', fontSize: '12px' }}>
                              {exp.expense_date}
                            </td>
                            <td>
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                  fontSize: '11px',
                                }}
                              >
                                {exp.category}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600' }}>
                              {exp.description}
                            </td>
                            <td
                              style={{
                                fontFamily: 'monospace',
                                color: '#dc2626',
                              }}
                            >
                              {exp.reference_no || 'S/R'}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: '#dc2626',
                              }}
                            >
                              {formatMoney(exp.amount_usd)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                title="Eliminar Egreso"
                                style={{
                                  background: '#fee2e2',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  fontWeight: 'bold',
                                  fontSize: '11px',
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="fin-mobile-cards" style={{ padding: '12px' }}>
                  {expenses.map((exp) => (
                    <div key={exp.id} className="fin-mobile-card">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontWeight: 'bold',
                          borderBottom: '1px solid #e5e7eb',
                          paddingBottom: '6px',
                          marginBottom: '6px',
                        }}
                      >
                        <span style={{ color: '#dc2626' }}>{exp.category}</span>
                        <span style={{ color: '#dc2626' }}>
                          {formatMoney(exp.amount_usd)}
                        </span>
                      </div>
                      <div
                        style={{
                          color: '#111827',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}
                      >
                        {exp.description}
                      </div>
                      <div
                        style={{
                          color: '#6b7280',
                          fontSize: '12px',
                          margin: '4px 0',
                        }}
                      >
                        Fecha: {exp.expense_date} | Ref:{' '}
                        {exp.reference_no || 'S/R'}
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="fin-btn"
                        style={{
                          width: '100%',
                          marginTop: '8px',
                          justifyContent: 'center',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                        }}
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// VISTA HISTÓRICO CON GRÁFICA DE GANANCIAS EN MESES CERRADOS Y MODAL DE PRODUCTOS
// ============================================================================
const HistoryMainView = ({
  records,
  formatMoney,
  formatPct,
  searchHistory,
  setSearchHistory,
  handleDeleteRecord,
}) => {
  const [subView, setSubView] = useState('triggers');
  const [closedMonthsList, setClosedMonthsList] = useState([]);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState(null);

  // Estados para el Modal de Productos de la Nota
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalRecordInfo, setModalRecordInfo] = useState(null);
  const [modalItems, setModalItems] = useState([]);

  useEffect(() => {
    if (subView === 'closed_months') {
      fetchClosedMonths();
    }
  }, [subView]);

  const fetchClosedMonths = async () => {
    try {
      const { data, error } = await supabase
        .from('closed_months_history')
        .select('*')
        .order('month_key', { ascending: true });
      if (!error) {
        setClosedMonthsList(data || []);
      }
    } catch (err) {
      console.error('Error cargando meses cerrados:', err);
    }
  };

  const handleDeleteClosedMonth = async (e, id, name) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `⚠️ ADVERTENCIA: ¿Está seguro de eliminar por completo el registro cerrado del mes de ${name}? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      const { error } = await supabase
        .from('closed_months_history')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchClosedMonths();
      if (selectedMonthDetail?.id === id) setSelectedMonthDetail(null);
    } catch (err) {
      alert('Error eliminando mes cerrado: ' + err.message);
    }
  };

  const handleOpenProductsModal = async (rec) => {
    setModalRecordInfo(rec);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_record_items')
        .select('*')
        .eq('financial_record_id', rec.id);

      if (error) throw error;
      setModalItems(data || []);
    } catch (err) {
      console.error('Error cargando ítems de la nota:', err);
      setModalItems([]);
    } finally {
      setModalLoading(false);
    }
  };

  const getUnifiedClosedMonthEntries = (m) => {
    if (!m) return [];
    const entries = [];

    (m.snapshot_data || []).forEach((r) => {
      const saleTotal = Number(r.total_sale_usd || 0);
      const costTotal = Number(r.total_cost_usd || 0);
      const netProfit = Number(r.net_profit_usd || 0);
      const estComm = saleTotal * 0.03;

      entries.push({
        date: r.closed_at || r.created_at || new Date().toISOString(),
        tipo: 'ENTRADA',
        categoria: 'Cobro Nota de Entrega',
        ref: `N.E. #${r.transaction_number || 'S/N'}`,
        entrada: saleTotal,
        salida: 0,
        beneficiario: r.client_name || 'Cliente Genérico',
        destino: `Inyección a Capital ($${costTotal.toFixed(
          2
        )}) / Reserva Comisión ($${estComm.toFixed(
          2
        )}) / Caja ($${netProfit.toFixed(2)})`,
      });
    });

    (m.snapshot_expenses || []).forEach((exp) => {
      entries.push({
        date: exp.expense_date || exp.created_at || new Date().toISOString(),
        tipo: 'SALIDA',
        categoria: `Egreso (${exp.category || 'Operativo'})`,
        ref: exp.reference_no ? `Ref. ${exp.reference_no}` : 'Gasto General',
        entrada: 0,
        salida: Number(exp.amount_usd || 0),
        beneficiario: exp.description || 'Proveedor / Operación',
        destino: 'Caja Operativa',
      });
    });

    (m.snapshot_settlements || []).forEach((inv) => {
      const paidAmount = Number(
        inv.total_neto_pagar_usd || inv.paid_amount || inv.total || 0
      );
      const invSueldo = Number(
        inv.sueldo_fijo_usd || inv.sueldo_pagado_usd || 0
      );
      const isSueldo = invSueldo > 0 || inv.tipo_pago === 'sueldo';

      entries.push({
        date: inv.created_at || inv.date || new Date().toISOString(),
        tipo: 'SALIDA',
        categoria: isSueldo ? 'Pago de Sueldo Fijo' : 'Pago de Comisión',
        ref: `Recibo #${inv.invoice_code || 'S/C'}`,
        entrada: 0,
        salida: paidAmount,
        beneficiario: inv.user?.full_name || 'Trabajador',
        destino: isSueldo
          ? 'Deduce Sueldo Fijo Pendiente'
          : 'Deduce Comisión Pendiente',
      });
    });

    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const maxClosedProfit = Math.max(
    ...closedMonthsList.map((m) => Number(m.net_profit_real || 0)),
    1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '12px',
        }}
      >
        <button
          onClick={() => {
            setSubView('triggers');
            setSelectedMonthDetail(null);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: subView === 'triggers' ? '#111827' : '#f3f4f6',
            color: subView === 'triggers' ? '#ffffff' : '#4b5563',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <History size={16} /> Copias Automáticas (Triggers)
        </button>
        <button
          onClick={() => {
            setSubView('closed_months');
            setSelectedMonthDetail(null);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor:
              subView === 'closed_months' ? '#111827' : '#f3f4f6',
            color: subView === 'closed_months' ? '#ffffff' : '#4b5563',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Lock size={16} /> Historial de Meses Cerrados
        </button>
      </div>

      {subView === 'triggers' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                Historial de Copias de Registros (Trigger)
              </h3>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                Gestione las copias automáticas del consolidado.
              </p>
            </div>
            <div style={{ position: 'relative', width: '240px' }}>
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
                className="fin-input"
                placeholder="Buscar por N.E., cliente..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>
          <table className="fin-table-desktop">
            <thead>
              <tr>
                <th>Fecha Cierre</th>
                <th>N.E. #</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Venta Total ($)</th>
                <th style={{ textAlign: 'right' }}>Costo Base ($)</th>
                <th style={{ textAlign: 'right' }}>Ganancia ($)</th>
                <th style={{ textAlign: 'center' }}>Productos</th>
                <th style={{ textAlign: 'center' }}>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {records.filter((r) => {
                if (!searchHistory.trim()) return true;
                const q = searchHistory.toLowerCase();
                return (
                  (r.transaction_number || '').toLowerCase().includes(q) ||
                  (r.client_name || '').toLowerCase().includes(q) ||
                  (r.seller_name || '').toLowerCase().includes(q)
                );
              }).length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: '#6b7280',
                    }}
                  >
                    No existen copias registradas en el historial.
                  </td>
                </tr>
              ) : (
                records
                  .filter((r) => {
                    if (!searchHistory.trim()) return true;
                    const q = searchHistory.toLowerCase();
                    return (
                      (r.transaction_number || '').toLowerCase().includes(q) ||
                      (r.client_name || '').toLowerCase().includes(q) ||
                      (r.seller_name || '').toLowerCase().includes(q)
                    );
                  })
                  .map((rec) => (
                    <tr key={rec.id}>
                      <td style={{ fontSize: '12px', color: '#6b7280' }}>
                        {new Date(
                          rec.closed_at || rec.created_at
                        ).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          fontFamily: 'monospace',
                          color: '#dc2626',
                          fontWeight: 'bold',
                        }}
                      >
                        #{rec.transaction_number}
                      </td>
                      <td style={{ fontWeight: '600' }}>{rec.client_name}</td>
                      <td style={{ color: '#4b5563' }}>{rec.seller_name}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {rec.category}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {formatMoney(rec.total_sale_usd)}
                      </td>
                      <td style={{ textAlign: 'right', color: '#6b7280' }}>
                        {formatMoney(rec.total_cost_usd)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: '#059669',
                        }}
                      >
                        {formatMoney(rec.net_profit_usd)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenProductsModal(rec)}
                          className="fin-btn"
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            backgroundColor: '#2563eb',
                          }}
                        >
                          <ShoppingBag size={13} /> Productos
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '11px',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          <div className="fin-mobile-cards" style={{ padding: '12px' }}>
            {records.map((rec) => (
              <div key={rec.id} className="fin-mobile-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '6px',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ color: '#dc2626' }}>
                    N.E. #{rec.transaction_number}
                  </span>
                  <span style={{ color: '#059669' }}>
                    {formatMoney(rec.net_profit_usd)}
                  </span>
                </div>
                <div
                  style={{
                    color: '#111827',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Cliente: {rec.client_name}
                </div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    margin: '4px 0',
                  }}
                >
                  <span>Vendedor: {rec.seller_name}</span>
                  <span>Costo: {formatMoney(rec.total_cost_usd)}</span>
                </div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    margin: '4px 0',
                  }}
                >
                  <span>Venta: {formatMoney(rec.total_sale_usd)}</span>
                  <span>Ganancia: {formatMoney(rec.net_profit_usd)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => handleOpenProductsModal(rec)}
                    className="fin-btn"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      backgroundColor: '#2563eb',
                      padding: '6px',
                    }}
                  >
                    <ShoppingBag size={13} /> Productos
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="fin-btn"
                    style={{
                      width: '40px',
                      justifyContent: 'center',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subView === 'closed_months' && !selectedMonthDetail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <BarChart3 size={18} color="#dc2626" /> Gráfica de Ganancias de
              Meses Cerrados
            </h3>
            {closedMonthsList.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: '#9ca3af',
                  fontSize: '13px',
                }}
              >
                No hay datos suficientes para mostrar la gráfica de meses
                cerrados.
              </div>
            ) : (
              <div className="column-chart-wrapper" style={{ height: '220px' }}>
                {closedMonthsList.map((m) => {
                  const val = Number(m.net_profit_real || 0);
                  const hPct = Math.max(
                    12,
                    Math.min(100, (val / maxClosedProfit) * 100)
                  );
                  return (
                    <div
                      key={m.id}
                      className="column-item"
                      onClick={() => setSelectedMonthDetail(m)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div
                        className="column-bar"
                        style={{
                          height: `${hPct}%`,
                          backgroundColor: '#059669',
                        }}
                      >
                        <span className="column-value">{formatMoney(val)}</span>
                      </div>
                      <span
                        className="column-label"
                        style={{ fontSize: '10px' }}
                      >
                        {m.month_name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                Meses Cerrados Automáticamente o Manual
              </h3>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                Haga clic en cualquier mes para ver su informe detallado
                completo o elimínelo si es necesario.
              </p>
            </div>
            <table className="fin-table-desktop">
              <thead>
                <tr>
                  <th>Mes y Año</th>
                  <th style={{ textAlign: 'right' }}>Ventas Totales ($)</th>
                  <th style={{ textAlign: 'right' }}>COGS (Inversión) ($)</th>
                  <th style={{ textAlign: 'right' }}>Egresos ($)</th>
                  <th style={{ textAlign: 'right' }}>Ganancia Neta Real ($)</th>
                  <th>Fecha de Cierre</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {closedMonthsList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: '24px',
                        color: '#6b7280',
                      }}
                    >
                      No hay meses cerrados registrados todavía. Puede ejecutar
                      un cierre manual desde el Libro Contable.
                    </td>
                  </tr>
                ) : (
                  closedMonthsList.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMonthDetail(m)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 'bold', color: '#dc2626' }}>
                        {m.month_name}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {formatMoney(m.total_paid)}
                      </td>
                      <td style={{ textAlign: 'right', color: '#6b7280' }}>
                        {formatMoney(m.total_cogs)}
                      </td>
                      <td style={{ textAlign: 'right', color: '#b45309' }}>
                        {formatMoney(m.total_expenses)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: '#059669',
                        }}
                      >
                        {formatMoney(m.net_profit_real)}
                      </td>
                      <td style={{ fontSize: '12px', color: '#6b7280' }}>
                        {new Date(m.closed_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={(e) =>
                            handleDeleteClosedMonth(e, m.id, m.month_name)
                          }
                          title="Eliminar mes cerrado"
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '11px',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="fin-mobile-cards" style={{ padding: '12px' }}>
              {closedMonthsList.map((m) => (
                <div
                  key={m.id}
                  className="fin-mobile-card"
                  onClick={() => setSelectedMonthDetail(m)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '6px',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ color: '#dc2626' }}>{m.month_name}</span>
                    <span style={{ color: '#059669' }}>
                      {formatMoney(m.net_profit_real)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '4px 0',
                    }}
                  >
                    <span>Ventas: {formatMoney(m.total_paid)}</span>
                    <span>Egresos: {formatMoney(m.total_expenses)}</span>
                  </div>
                  <button
                    onClick={(e) =>
                      handleDeleteClosedMonth(e, m.id, m.month_name)
                    }
                    className="fin-btn"
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      justifyContent: 'center',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                    }}
                  >
                    <Trash2 size={14} /> Eliminar Cierre
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMonthDetail && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '12px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                Detalle del Mes Cerrado: {selectedMonthDetail.month_name}
              </h3>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Cerrado el{' '}
                {new Date(selectedMonthDetail.closed_at).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setSelectedMonthDetail(null)}
              className="fin-btn"
              style={{ backgroundColor: '#4b5563' }}
            >
              Volver a la Lista
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#6b7280',
                marginBottom: '10px',
              }}
            >
              CAPITAL INVERTIDO (STOCK + TRÁNSITO)
            </h4>
            <div className="fin-grid-kpi">
              <LightKpiCard
                title="Capital Total Invertido"
                value={selectedMonthDetail.capital_in_stock ?? 0}
                color="#f8fafc"
                border="#e2e8f0"
                textColor="#475569"
                icon={Archive}
                highlight
              />
              <LightKpiCard
                title="En Stock (Bodega)"
                value={selectedMonthDetail.capital_in_stock ?? 0}
                color="#f1f5f9"
                border="#cbd5e1"
                textColor="#64748b"
                icon={Package}
              />
              <LightKpiCard
                title="En Tránsito (N.E. Abiertas)"
                value={selectedMonthDetail.capital_in_transit ?? 0}
                color="#fff7ed"
                border="#ffedd5"
                textColor="#c2410c"
                icon={Truck}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#6b7280',
                marginBottom: '10px',
              }}
            >
              FACTURACIÓN Y CAJA
            </h4>
            <div className="fin-grid-kpi">
              <LightKpiCard
                title="Facturado (Pendiente/Abonado)"
                value={selectedMonthDetail.kpi_billed ?? 0}
                color="#eff6ff"
                border="#bfdbfe"
                textColor="#1e40af"
                icon={Target}
              />
              <LightKpiCard
                title="N.E. Pagadas (Del mes)"
                value={selectedMonthDetail.total_paid}
                color="#f0fdf4"
                border="#bbf7d0"
                textColor="#166534"
                icon={Wallet}
              />
              <LightKpiCard
                title="Caja Disponible"
                value={
                  selectedMonthDetail.kpi_cash_available ??
                  selectedMonthDetail.total_paid -
                    selectedMonthDetail.total_expenses
                }
                color="#fff7ed"
                border="#ffedd5"
                textColor="#c2410c"
                icon={Coins}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#6b7280',
                marginBottom: '10px',
              }}
            >
              GANANCIAS OPERATIVAS
            </h4>
            <div className="fin-grid-kpi">
              <LightKpiCard
                title="Capital a Reinvertir (COGS)"
                value={
                  selectedMonthDetail.kpi_cogs ?? selectedMonthDetail.total_cogs
                }
                color="#f8fafc"
                border="#e2e8f0"
                textColor="#475569"
                icon={Archive}
              />
              <LightKpiCard
                title="Reservado para Comisión"
                value={selectedMonthDetail.kpi_reserved_commission ?? 0}
                color="#eef2ff"
                border="#c7d2fe"
                textColor="#3730a3"
                icon={Coins}
              />
              <LightKpiCard
                title="Ganancia Bruta"
                value={
                  selectedMonthDetail.kpi_gross_profit ??
                  selectedMonthDetail.gross_profit
                }
                color="#faf5ff"
                border="#e9d5ff"
                textColor="#6b21a8"
                icon={TrendingUp}
              />
              <LightKpiCard
                title="% de Ganancia Bruta"
                value={formatPct(selectedMonthDetail.kpi_gross_profit_pct ?? 0)}
                color="#f3e8ff"
                border="#d8b4fe"
                textColor="#7e22ce"
                icon={Percent}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#6b7280',
                marginBottom: '10px',
              }}
            >
              CONSOLIDADO DE LIBRO Y GANANCIA NETA REAL
            </h4>
            <div className="fin-grid-kpi">
              <LightKpiCard
                title="Total de Pago (Salidas)"
                value={
                  selectedMonthDetail.kpi_total_payments_out ??
                  selectedMonthDetail.total_expenses
                }
                color="#fef2f2"
                border="#fecaca"
                textColor="#991b1b"
                icon={CreditCard}
              />
              <LightKpiCard
                title="Pagos Pendientes"
                value={selectedMonthDetail.kpi_pending_payments ?? 0}
                color="#fffbeb"
                border="#fde68a"
                textColor="#b45309"
                icon={AlertCircle}
              />
              <LightKpiCard
                title="Ganancia del Mes (Neta Real)"
                value={selectedMonthDetail.net_profit_real}
                color="#ecfdf5"
                border="#a7f3d0"
                textColor="#065f46"
                icon={Award}
                highlight
              />
              <LightKpiCard
                title="% Neto Real s/ Reinversión"
                value={formatPct(selectedMonthDetail.kpi_roi_investment ?? 0)}
                color="#d1fae5"
                border="#6ee7b7"
                textColor="#047857"
                icon={Percent}
                highlight
              />
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                Registro Unificado del Mes Cerrado
              </h3>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                Cobros, egresos operativos y pagos respaldados en este cierre.
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="fin-table-desktop" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Fecha Movimiento</th>
                    <th>Tipo de Flujo</th>
                    <th>Categoría / Evento</th>
                    <th>Ref. / Documento</th>
                    <th style={{ textAlign: 'right' }}>Entrada ($)</th>
                    <th style={{ textAlign: 'right' }}>Salida ($)</th>
                    <th>Beneficiario / Origen</th>
                    <th>Destino / Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {getUnifiedClosedMonthEntries(selectedMonthDetail).length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: 'center',
                          padding: '24px',
                          color: '#6b7280',
                        }}
                      >
                        No existen movimientos registrados en este cierre.
                      </td>
                    </tr>
                  ) : (
                    getUnifiedClosedMonthEntries(selectedMonthDetail).map(
                      (item, idx) => {
                        let badgeColor = '#6b7280';
                        let badgeBg = '#f3f4f6';
                        if (item.tipo === 'ENTRADA') {
                          badgeColor = '#065f46';
                          badgeBg = '#d1fae5';
                        } else if (item.tipo === 'SALIDA') {
                          badgeColor = '#991b1b';
                          badgeBg = '#fee2e2';
                        }

                        return (
                          <tr key={idx}>
                            <td
                              style={{ color: '#4b5563', whiteSpace: 'nowrap' }}
                            >
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  backgroundColor: badgeBg,
                                  color: badgeColor,
                                }}
                              >
                                {item.tipo}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600', color: '#111827' }}>
                              {item.categoria}
                            </td>
                            <td
                              style={{
                                fontFamily: 'monospace',
                                color: '#dc2626',
                                fontWeight: 'bold',
                              }}
                            >
                              {item.ref}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: item.entrada > 0 ? '#059669' : '#9ca3af',
                              }}
                            >
                              {item.entrada > 0
                                ? formatMoney(item.entrada)
                                : '-'}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: item.salida > 0 ? '#dc2626' : '#9ca3af',
                              }}
                            >
                              {item.salida > 0 ? formatMoney(item.salida) : '-'}
                            </td>
                            <td style={{ color: '#374151' }}>
                              {item.beneficiario}
                            </td>
                            <td style={{ color: '#4b5563', fontSize: '11px' }}>
                              {item.destino}
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VENTANA EMERGENTE (MODAL) PARA VER PRODUCTOS DE LA NOTA */}
      {modalOpen && (
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
            zIndex: 1100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '700px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#111827',
                  }}
                >
                  Productos de N.E. #{modalRecordInfo?.transaction_number}
                </h3>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}
                >
                  Cliente:{' '}
                  <strong style={{ color: '#111827' }}>
                    {modalRecordInfo?.client_name}
                  </strong>{' '}
                  | Vendedor:{' '}
                  <strong style={{ color: '#111827' }}>
                    {modalRecordInfo?.seller_name}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {modalLoading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '30px',
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  Cargando productos de la nota...
                </div>
              ) : modalItems.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '30px',
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  No hay productos registrados para esta nota de entrega.
                </div>
              ) : (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        textAlign: 'left',
                      }}
                    >
                      <th
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        Código
                      </th>
                      <th
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        Producto
                      </th>
                      <th
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        Categoría
                      </th>
                      <th
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'center',
                        }}
                      >
                        Cantidad
                      </th>
                      <th
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right',
                        }}
                      >
                        Precio U. ($)
                      </th>
                      <th
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right',
                        }}
                      >
                        Total ($)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalItems.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        style={{ borderBottom: '1px solid #e5e7eb' }}
                      >
                        <td
                          style={{
                            padding: '10px 12px',
                            fontFamily: 'monospace',
                            color: '#dc2626',
                            fontWeight: 'bold',
                          }}
                        >
                          {item.product_code || 'S/C'}
                        </td>
                        <td
                          style={{
                            padding: '10px 12px',
                            fontWeight: '600',
                            color: '#111827',
                          }}
                        >
                          {item.product_name}
                        </td>
                        <td
                          style={{
                            padding: '10px 12px',
                            textTransform: 'capitalize',
                          }}
                        >
                          <span
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.category || 'bombillos'}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '10px 12px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                          }}
                        >
                          {item.quantity} u.
                        </td>
                        <td
                          style={{
                            padding: '10px 12px',
                            textAlign: 'right',
                            color: '#4b5563',
                          }}
                        >
                          {formatMoney(item.unit_price_usd)}
                        </td>
                        <td
                          style={{
                            padding: '10px 12px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#059669',
                          }}
                        >
                          {formatMoney(item.line_total_usd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'flex-end',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
              }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="fin-btn"
                style={{ backgroundColor: '#4b5563' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// LIBRO CONTABLE
// ============================================================================
const LedgerView = ({
  ledgerEntries,
  capitalBreakdown,
  records,
  expenses,
  categoryCommissionsTotal,
  formatMoney,
  formatPct,
  sellersList,
  settlementHistory,
  closedOrdersList,
  approvedValesList,
  approvedPenaltiesList,
  hierarchyConfigsMap,
  hierarchyAssignmentsList,
  kpiBilled,
  onRefresh,
}) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [searchLedger, setSearchLedger] = useState('');
  const [filterType, setFilterType] = useState('TODOS');
  const [closingMonthLoading, setClosingMonthLoading] = useState(false);

  const monthNamesEs = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
  ];
  const currentMonthDisplay = `${
    monthNamesEs[selectedMonth - 1]
  } ${selectedYear}`;
  const targetMonthIndex = selectedMonth - 1;

  const targetMonthRecords = (records || []).filter((r) => {
    if (!r.closed_at) return false;
    const d = new Date(r.closed_at);
    return (
      d.getMonth() === targetMonthIndex && d.getFullYear() === selectedYear
    );
  });

  const targetMonthExpensesList = (expenses || []).filter((e) => {
    if (!e.expense_date) return false;
    const d = new Date(e.expense_date);
    return (
      d.getMonth() === targetMonthIndex && d.getFullYear() === selectedYear
    );
  });

  const monthPaid = targetMonthRecords.reduce(
    (acc, r) => acc + Number(r.total_sale_usd || 0),
    0
  );
  const monthCogs = targetMonthRecords.reduce(
    (acc, r) => acc + Number(r.total_cost_usd || 0),
    0
  );
  const monthTotalExpenses = targetMonthExpensesList.reduce(
    (acc, e) => acc + Number(e.amount_usd || 0),
    0
  );
  const monthReservedCommission = categoryCommissionsTotal || 0;

  const monthGrossProfit = monthPaid - monthCogs - monthReservedCommission;
  const monthGrossProfitPct =
    monthCogs > 0
      ? (monthGrossProfit / monthCogs) * 100
      : monthPaid > 0
      ? (monthGrossProfit / monthPaid) * 100
      : 0;

  const realLedgerEntries = ledgerEntries.filter((item) => {
    const d = new Date(item.date);
    return (
      d.getMonth() === targetMonthIndex && d.getFullYear() === selectedYear
    );
  });

  const totalPagadoMes = realLedgerEntries
    .filter((item) => item.tipo === 'SALIDA')
    .reduce((acc, curr) => acc + Number(curr.salida || 0), 0);

  let sueldosPendientesMes = 0;
  const paidSueldoMap = {};
  (settlementHistory || []).forEach((inv) => {
    if (!inv.user_id) return;
    const invDate = new Date(inv.created_at || inv.date || Date.now());
    if (
      invDate.getMonth() === targetMonthIndex &&
      invDate.getFullYear() === selectedYear
    ) {
      const uId = String(inv.user_id);
      paidSueldoMap[uId] =
        (paidSueldoMap[uId] || 0) +
        Number(
          inv.sueldo_fijo_usd ||
            inv.sueldo_pagado_usd ||
            (inv.tipo_pago === 'sueldo' ? inv.total_neto_pagar_usd : 0)
        );
    }
  });

  (sellersList || []).forEach((user) => {
    const sueldoTotal = Number(user.sueldo_fijo_usd || 0);
    const sueldoPaid = Math.min(
      sueldoTotal,
      paidSueldoMap[String(user.id)] || 0
    );
    sueldosPendientesMes += Math.max(0, sueldoTotal - sueldoPaid);
  });

  let totalCommissionsGen = categoryCommissionsTotal || 0;
  let paidCommissionsTotal = 0;
  (settlementHistory || []).forEach((inv) => {
    const invDate = new Date(inv.created_at || inv.date || Date.now());
    if (
      invDate.getMonth() === targetMonthIndex &&
      invDate.getFullYear() === selectedYear
    ) {
      const totalInvPaid = Number(
        inv.total_neto_pagar_usd || inv.paid_amount || inv.total || 0
      );
      const invSueldo = Number(
        inv.sueldo_fijo_usd || inv.sueldo_pagado_usd || 0
      );
      paidCommissionsTotal += Math.max(0, totalInvPaid - invSueldo);
    }
  });
  const comisionesPendientesMes = Math.max(
    0,
    totalCommissionsGen - paidCommissionsTotal
  );

  const totalPagosPendientes = sueldosPendientesMes + comisionesPendientesMes;
  const gananciaNetaReal =
    monthPaid - monthCogs - totalPagadoMes - totalPagosPendientes;
  const roiInversion =
    monthCogs > 0
      ? (gananciaNetaReal / monthCogs) * 100
      : monthPaid > 0
      ? (gananciaNetaReal / monthPaid) * 100
      : 0;

  const handleManualCloseMonth = async () => {
    if (
      !window.confirm(
        `¿Desea ejecutar el cierre contable manual para el mes de ${currentMonthDisplay}? Esto guardará exactamente el consolidado mostrado en pantalla.`
      )
    )
      return;
    setClosingMonthLoading(true);
    try {
      const { error } = await supabase.rpc('close_financial_month', {
        target_year: selectedYear,
        target_month: selectedMonth,
        p_reserved_commission: monthReservedCommission,
        p_pending_payments: totalPagosPendientes,
        p_billed: kpiBilled || 0,
      });
      if (error) throw error;
      alert(`¡Cierre del mes ${currentMonthDisplay} ejecutado con éxito!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error ejecutando el cierre mensual: ' + err.message);
    } finally {
      setClosingMonthLoading(false);
    }
  };

  const filteredEntries = realLedgerEntries.filter((item) => {
    if (filterType !== 'TODOS' && item.tipo !== filterType) return false;
    if (!searchLedger.trim()) return true;
    const q = searchLedger.toLowerCase();
    return (
      item.categoria.toLowerCase().includes(q) ||
      item.ref.toLowerCase().includes(q) ||
      item.beneficiario.toLowerCase().includes(q) ||
      item.destino.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          backgroundColor: '#111827',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
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
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calendar size={18} color="#dc2626" /> AUDITAR MES:
          </span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #4b5563',
              fontWeight: 'bold',
            }}
          >
            {monthNamesEs.map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {mName}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #4b5563',
              fontWeight: 'bold',
            }}
          >
            {[2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          className="fin-btn"
          onClick={handleManualCloseMonth}
          disabled={closingMonthLoading}
          style={{ backgroundColor: '#059669' }}
        >
          <Lock size={15} />{' '}
          {closingMonthLoading
            ? 'Cerrando mes...'
            : `Cierre Manual (${currentMonthDisplay})`}
        </button>
      </div>

      <div>
        <h3
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#6b7280',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Box size={15} /> CAPITAL INVERTIDO (STOCK + TRÁNSITO)
        </h3>
        <div className="fin-grid-kpi" style={{ marginBottom: '12px' }}>
          <LightKpiCard
            title="Capital Total Invertido"
            value={capitalBreakdown.totalInvested || 0}
            color="#f8fafc"
            border="#e2e8f0"
            textColor="#475569"
            icon={Archive}
            highlight
          />
          <LightKpiCard
            title="En Stock (Bodega)"
            value={capitalBreakdown.inStock || 0}
            color="#f1f5f9"
            border="#cbd5e1"
            textColor="#64748b"
            icon={Package}
          />
          <LightKpiCard
            title="En Tránsito (N.E. Abiertas)"
            value={capitalBreakdown.inTransit || 0}
            color="#fff7ed"
            border="#ffedd5"
            textColor="#c2410c"
            icon={Truck}
          />
        </div>
      </div>

      <div>
        <h3
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#6b7280',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Receipt size={15} /> FACTURACIÓN Y CAJA ({currentMonthDisplay})
        </h3>
        <div className="fin-grid-kpi" style={{ marginBottom: '12px' }}>
          <LightKpiCard
            title="Facturado (Pendiente/Abonado)"
            value={kpiBilled || 0}
            color="#eff6ff"
            border="#bfdbfe"
            textColor="#1e40af"
            icon={Target}
          />
          <LightKpiCard
            title="N.E. Pagadas (Del mes)"
            value={monthPaid}
            color="#f0fdf4"
            border="#bbf7d0"
            textColor="#166534"
            icon={Wallet}
          />
          <LightKpiCard
            title="Caja Disponible"
            value={monthPaid - monthTotalExpenses}
            color="#fff7ed"
            border="#ffedd5"
            textColor="#c2410c"
            icon={Coins}
          />
        </div>
      </div>

      <div>
        <h3
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#6b7280',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <TrendingUp size={15} /> GANANCIAS OPERATIVAS ({currentMonthDisplay})
        </h3>
        <div className="fin-grid-kpi" style={{ marginBottom: '16px' }}>
          <LightKpiCard
            title="Capital a Reinvertir (COGS)"
            value={monthCogs}
            color="#f8fafc"
            border="#e2e8f0"
            textColor="#475569"
            icon={Archive}
          />
          <LightKpiCard
            title="Reservado para Comisión"
            value={monthReservedCommission}
            color="#eef2ff"
            border="#c7d2fe"
            textColor="#3730a3"
            icon={Coins}
          />
          <LightKpiCard
            title="Ganancia Bruta"
            value={monthGrossProfit}
            color="#faf5ff"
            border="#e9d5ff"
            textColor="#6b21a8"
            icon={TrendingUp}
          />
          <LightKpiCard
            title="% de Ganancia Bruta"
            value={formatPct(monthGrossProfitPct)}
            color="#f3e8ff"
            border="#d8b4fe"
            textColor="#7e22ce"
            icon={Percent}
          />
        </div>
      </div>

      <div>
        <h3
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#6b7280',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Award size={15} /> CONSOLIDADO DE LIBRO Y GANANCIA NETA REAL (
          {currentMonthDisplay})
        </h3>
        <div className="fin-grid-kpi" style={{ marginBottom: '20px' }}>
          <LightKpiCard
            title="Total de Pago (Salidas)"
            value={totalPagadoMes}
            color="#fef2f2"
            border="#fecaca"
            textColor="#991b1b"
            icon={CreditCard}
          />
          <LightKpiCard
            title="Pagos Pendientes"
            value={totalPagosPendientes}
            color="#fffbeb"
            border="#fde68a"
            textColor="#b45309"
            icon={AlertCircle}
          />
          <LightKpiCard
            title="Ganancia del Mes (Neta Real)"
            value={gananciaNetaReal}
            color="#ecfdf5"
            border="#a7f3d0"
            textColor="#065f46"
            icon={Award}
            highlight
          />
          <LightKpiCard
            title="% Neto Real s/ Reinversión"
            value={formatPct(roiInversion)}
            color="#d1fae5"
            border="#6ee7b7"
            textColor="#047857"
            icon={Percent}
            highlight
          />
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#111827',
              }}
            >
              Registro Automatizado de Entradas y Salidas ({currentMonthDisplay}
              )
            </h3>
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: '#6b7280',
              }}
            >
              Control detallado de cobros, pagos de comisiones, nómina y gastos
              operativos.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                background: '#fff',
              }}
            >
              <option value="TODOS">Todos los Flujos</option>
              <option value="ENTRADA">Entradas Reales</option>
              <option value="SALIDA">Salidas Reales</option>
            </select>
            <div style={{ position: 'relative', width: '220px' }}>
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
                className="fin-input"
                placeholder="Buscar evento, ref..."
                value={searchLedger}
                onChange={(e) => setSearchLedger(e.target.value)}
                style={{ paddingLeft: '30px' }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="fin-table-desktop" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Fecha Movimiento</th>
                <th>Tipo de Flujo</th>
                <th>Categoría / Evento</th>
                <th>Ref. / Documento</th>
                <th style={{ textAlign: 'right' }}>Entrada ($)</th>
                <th style={{ textAlign: 'right' }}>Salida ($)</th>
                <th>Beneficiario / Origen</th>
                <th>Destino / Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: '#6b7280',
                    }}
                  >
                    No se encontraron registros en el libro contable para este
                    mes.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item, idx) => {
                  let badgeColor = '#6b7280';
                  let badgeBg = '#f3f4f6';
                  if (item.tipo === 'ENTRADA') {
                    badgeColor = '#065f46';
                    badgeBg = '#d1fae5';
                  } else if (item.tipo === 'SALIDA') {
                    badgeColor = '#991b1b';
                    badgeBg = '#fee2e2';
                  }

                  return (
                    <tr key={idx}>
                      <td style={{ color: '#4b5563', whiteSpace: 'nowrap' }}>
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                          }}
                        >
                          {item.tipo}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#111827' }}>
                        {item.categoria}
                      </td>
                      <td
                        style={{
                          fontFamily: 'monospace',
                          color: '#dc2626',
                          fontWeight: 'bold',
                        }}
                      >
                        {item.ref}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: item.entrada > 0 ? '#059669' : '#9ca3af',
                        }}
                      >
                        {item.entrada > 0 ? formatMoney(item.entrada) : '-'}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: item.salida > 0 ? '#dc2626' : '#9ca3af',
                        }}
                      >
                        {item.salida > 0 ? formatMoney(item.salida) : '-'}
                      </td>
                      <td style={{ color: '#374151' }}>{item.beneficiario}</td>
                      <td style={{ color: '#4b5563', fontSize: '11px' }}>
                        {item.destino}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="fin-mobile-cards" style={{ padding: '12px' }}>
          {filteredEntries.length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '16px', color: '#6b7280' }}
            >
              No hay registros.
            </div>
          ) : (
            filteredEntries.map((item, idx) => (
              <div key={idx} className="fin-mobile-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '6px',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      color: item.tipo === 'ENTRADA' ? '#059669' : '#dc2626',
                    }}
                  >
                    {item.categoria}
                  </span>
                  <span>
                    {item.entrada > 0
                      ? formatMoney(item.entrada)
                      : formatMoney(item.salida)}
                  </span>
                </div>
                <div
                  style={{
                    color: '#111827',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Ref: {item.ref} | {new Date(item.date).toLocaleDateString()}
                </div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '12px',
                    margin: '4px 0',
                  }}
                >
                  Beneficiario: {item.beneficiario}
                </div>
                <div style={{ color: '#4b5563', fontSize: '11px' }}>
                  Destino: {item.destino}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const LiquidationView = ({
  liquidationData,
  settlementHistory,
  liquidationSummary,
  formatMoney,
  sellersList,
  closedOrdersList,
  approvedValesList,
  approvedPenaltiesList,
  hierarchyConfigsMap,
  hierarchyAssignmentsList,
}) => {
  const [table1Month, setTable1Month] = useState(new Date().getMonth() + 1);
  const [table1Year, setTable1Year] = useState(new Date().getFullYear());
  const [table1Rows, setTable1Rows] = useState([]);

  const [isNominaOpen, setIsNominaOpen] = useState(true);
  const [isCommissionsOpen, setIsCommissionsOpen] = useState(true);
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(true);

  const [searchNomina, setSearchNomina] = useState('');
  const [searchCommissions, setSearchCommissions] = useState('');
  const [searchInvoices, setSearchInvoices] = useState('');

  useEffect(() => {
    if (sellersList.length > 0) {
      calculateTable1Data(table1Month, table1Year);
    }
  }, [
    table1Month,
    table1Year,
    sellersList,
    closedOrdersList,
    approvedValesList,
    approvedPenaltiesList,
    settlementHistory,
  ]);

  const calculateTable1Data = (targetMonth, targetYear) => {
    const paidPerUserMap = {};
    (settlementHistory || []).forEach((inv) => {
      if (!inv.user_id) return;
      const invDate = new Date(inv.created_at || inv.date || Date.now());
      const invMonth = Number(inv.month || invDate.getMonth() + 1);
      const invYear = Number(inv.year || invDate.getFullYear());

      if (invMonth !== Number(targetMonth) || invYear !== Number(targetYear))
        return;

      const uId = String(inv.user_id);
      if (!paidPerUserMap[uId]) {
        paidPerUserMap[uId] = { sueldoPaid: 0 };
      }
      const invSueldo = Number(
        inv.sueldo_fijo_usd ||
          inv.sueldo_pagado_usd ||
          (inv.tipo_pago === 'sueldo'
            ? inv.total_neto_pagar_usd || inv.paid_amount || 0
            : 0)
      );
      paidPerUserMap[uId].sueldoPaid += invSueldo;
    });

    const rows = (sellersList || [])
      .map((user) => {
        const uId = String(user.id);
        const paidData = paidPerUserMap[uId] || { sueldoPaid: 0 };
        const sueldoTotalMes = Number(user.sueldo_fijo_usd || 0);
        const sueldoPaid = Math.min(sueldoTotalMes, paidData.sueldoPaid);
        const sueldoRemaining = Math.max(0, sueldoTotalMes - sueldoPaid);
        const isSueldoPaidCompletely =
          sueldoRemaining <= 0.01 && sueldoTotalMes > 0;

        return {
          user,
          sueldoTotalMes,
          sueldoPaid,
          sueldoRemaining,
          isSueldoPaidCompletely,
          hasActivity: sueldoTotalMes > 0 || sueldoPaid > 0,
        };
      })
      .filter(
        (r) => r.hasActivity && (r.sueldoTotalMes > 0 || r.sueldoPaid > 0)
      );

    setTable1Rows(rows);
  };

  const filteredNominaRows = table1Rows.filter((row) => {
    if (
      row.sueldoTotalMes === 0 &&
      row.sueldoPaid === 0 &&
      row.sueldoRemaining === 0
    )
      return false;
    if (!searchNomina.trim()) return true;
    const q = searchNomina.toLowerCase();
    return (
      row.user.full_name.toLowerCase().includes(q) ||
      (row.user.role || '').toLowerCase().includes(q)
    );
  });

  const filteredCommissionsRows = liquidationData.filter((row) => {
    if (row.commTotal === 0 && row.commPaid === 0 && row.commRemaining === 0)
      return false;
    if (!searchCommissions.trim()) return true;
    const q = searchCommissions.toLowerCase();
    return (
      row.user.full_name.toLowerCase().includes(q) ||
      (row.user.role || '').toLowerCase().includes(q)
    );
  });

  const filteredInvoicesRows = settlementHistory.filter((inv) => {
    const paidVal = Number(
      inv.total_neto_pagar_usd || inv.paid_amount || inv.total || 0
    );
    if (paidVal === 0) return false;
    if (!searchInvoices.trim()) return true;
    const q = searchInvoices.toLowerCase();
    return (
      (inv.invoice_code || '').toLowerCase().includes(q) ||
      (inv.user?.full_name || '').toLowerCase().includes(q) ||
      (inv.user?.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#111827',
          }}
        >
          <PieChart size={20} color="#dc2626" /> Resumen General de Liquidación
          y Nómina
        </h3>
        <div className="fin-grid-kpi">
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              padding: '16px',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#92400e',
                  textTransform: 'uppercase',
                }}
              >
                Total Sueldo Fijo (Nómina)
              </span>
              <Banknote size={16} color="#92400e" />
            </div>
            <div
              style={{ fontSize: '22px', fontWeight: '900', color: '#92400e' }}
            >
              {formatMoney(liquidationSummary.totalNomina)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#dbeafe',
              border: '2px solid #3b82f6',
              padding: '16px',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  textTransform: 'uppercase',
                }}
              >
                Total Comisiones
              </span>
              <TrendingUp size={16} color="#1e40af" />
            </div>
            <div
              style={{ fontSize: '22px', fontWeight: '900', color: '#1e40af' }}
            >
              {formatMoney(liquidationSummary.totalComisiones)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#d1fae5',
              border: '2px solid #10b981',
              padding: '16px',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#065f46',
                  textTransform: 'uppercase',
                }}
              >
                Total Ya Pagado
              </span>
              <Check size={16} color="#065f46" />
            </div>
            <div
              style={{ fontSize: '22px', fontWeight: '900', color: '#065f46' }}
            >
              {formatMoney(liquidationSummary.totalPaid)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '2px solid #ef4444',
              padding: '16px',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#991b1b',
                  textTransform: 'uppercase',
                }}
              >
                Total Pendiente
              </span>
              <AlertCircle size={16} color="#991b1b" />
            </div>
            <div
              style={{ fontSize: '22px', fontWeight: '900', color: '#991b1b' }}
            >
              {formatMoney(liquidationSummary.totalPending)}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            cursor: 'pointer',
          }}
          onClick={() => setIsNominaOpen(!isNominaOpen)}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#92400e',
            }}
          >
            <Banknote size={20} color="#f59e0b" /> Control de Nómina (Sueldos
            Fijos)
          </h3>
          <div>
            {isNominaOpen ? (
              <ChevronUp size={20} color="#6b7280" />
            ) : (
              <ChevronDown size={20} color="#6b7280" />
            )}
          </div>
        </div>

        {isNominaOpen && (
          <div
            style={{
              marginTop: '16px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  background: '#f9fafb',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Calendar size={15} color="#dc2626" />
                <select
                  value={table1Month}
                  onChange={(e) => setTable1Month(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '12px',
                    background: '#fff',
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
                <select
                  value={table1Year}
                  onChange={(e) => setTable1Year(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '12px',
                    background: '#fff',
                  }}
                >
                  {[2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ position: 'relative', width: '220px' }}>
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
                  className="fin-input"
                  placeholder="Buscar trabajador..."
                  value={searchNomina}
                  onChange={(e) => setSearchNomina(e.target.value)}
                  style={{ paddingLeft: '30px' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="fin-table-desktop">
                <thead>
                  <tr>
                    <th>Trabajador</th>
                    <th>Rol</th>
                    <th style={{ textAlign: 'right' }}>
                      Sueldo Fijo Total (Mes)
                    </th>
                    <th style={{ textAlign: 'right' }}>Sueldo Ya Pagado</th>
                    <th style={{ textAlign: 'right' }}>
                      Sueldo Falta Por Pagar
                    </th>
                    <th style={{ textAlign: 'center' }}>Estado Nómina</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNominaRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#6b7280',
                        }}
                      >
                        No se encontraron registros de nómina con saldos a
                        pagar.
                      </td>
                    </tr>
                  ) : (
                    filteredNominaRows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>
                          {row.user.full_name}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {row.user.role}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#92400e',
                          }}
                        >
                          {formatMoney(row.sueldoTotalMes)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: '#059669',
                            fontWeight: '600',
                          }}
                        >
                          {formatMoney(row.sueldoPaid)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: '#dc2626',
                            fontWeight: 'bold',
                          }}
                        >
                          {formatMoney(row.sueldoRemaining)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {row.isSueldoPaidCompletely ? (
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: '#d1fae5',
                                color: '#065f46',
                              }}
                            >
                              Pagado
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                              }}
                            >
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="fin-mobile-cards" style={{ padding: '12px' }}>
              {filteredNominaRows.map((row, idx) => (
                <div key={idx} className="fin-mobile-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '6px',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ color: '#111827' }}>
                      {row.user.full_name}
                    </span>
                    <span
                      style={{
                        color: row.isSueldoPaidCompletely
                          ? '#059669'
                          : '#dc2626',
                      }}
                    >
                      {row.isSueldoPaidCompletely ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: '4px 0',
                    }}
                  >
                    Rol: {row.user.role}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Sueldo: {formatMoney(row.sueldoTotalMes)}</span>
                    <span>Falta: {formatMoney(row.sueldoRemaining)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            cursor: 'pointer',
          }}
          onClick={() => setIsCommissionsOpen(!isCommissionsOpen)}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1e40af',
            }}
          >
            <TrendingUp size={20} color="#3b82f6" /> Desglose de Comisiones
          </h3>
          <div>
            {isCommissionsOpen ? (
              <ChevronUp size={20} color="#6b7280" />
            ) : (
              <ChevronDown size={20} color="#6b7280" />
            )}
          </div>
        </div>

        {isCommissionsOpen && (
          <div
            style={{
              marginTop: '16px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px',
              }}
            >
              <div style={{ position: 'relative', width: '220px' }}>
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
                  className="fin-input"
                  placeholder="Buscar trabajador..."
                  value={searchCommissions}
                  onChange={(e) => setSearchCommissions(e.target.value)}
                  style={{ paddingLeft: '30px' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="fin-table-desktop">
                <thead>
                  <tr>
                    <th>Trabajador</th>
                    <th>Rol</th>
                    <th style={{ textAlign: 'right' }}>
                      Comisión Propia Bruta
                    </th>
                    <th style={{ textAlign: 'right' }}>Vales / Deducc.</th>
                    <th style={{ textAlign: 'right' }}>Comisión Jerárquica</th>
                    <th style={{ textAlign: 'right' }}>Total Comisiones</th>
                    <th style={{ textAlign: 'right', color: '#059669' }}>
                      Comisiones Pagadas
                    </th>
                    <th style={{ textAlign: 'right', color: '#dc2626' }}>
                      Comisiones Pendientes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissionsRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#6b7280',
                        }}
                      >
                        Sin comisiones registradas con montos mayores a 0.
                      </td>
                    </tr>
                  ) : (
                    filteredCommissionsRows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>
                          {row.user.full_name}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {row.user.role}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          {formatMoney(row.details.commGrossUsd)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#dc2626' }}>
                          -{formatMoney(row.details.valesDeductionUsd)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: '#7c3aed',
                            fontWeight: '600',
                          }}
                        >
                          {formatMoney(row.details.hierarchyUsd)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#1e40af',
                          }}
                        >
                          {formatMoney(row.commTotal)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: '#059669',
                            fontWeight: '600',
                          }}
                        >
                          {formatMoney(row.commPaid)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: '#dc2626',
                            fontWeight: '600',
                          }}
                        >
                          {formatMoney(row.commRemaining)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="fin-mobile-cards" style={{ padding: '12px' }}>
              {filteredCommissionsRows.map((row, idx) => (
                <div key={idx} className="fin-mobile-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '6px',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ color: '#111827' }}>
                      {row.user.full_name}
                    </span>
                    <span
                      style={{
                        textTransform: 'capitalize',
                        fontSize: '11px',
                        color: '#6b7280',
                      }}
                    >
                      {row.user.role}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '4px 0',
                    }}
                  >
                    <span>Total Comisiones:</span>
                    <span style={{ fontWeight: 'bold', color: '#1e40af' }}>
                      {formatMoney(row.commTotal)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '4px 0',
                    }}
                  >
                    <span>Pagadas:</span>
                    <span style={{ color: '#059669', fontWeight: '600' }}>
                      {formatMoney(row.commPaid)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '4px 0',
                    }}
                  >
                    <span>Pendientes:</span>
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                      {formatMoney(row.commRemaining)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            cursor: 'pointer',
          }}
          onClick={() => setIsInvoicesOpen(!isInvoicesOpen)}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#374151',
            }}
          >
            <FileText size={20} color="#4b5563" /> Historial de Facturas
            Emitidas (settlement_invoices)
          </h3>
          <div>
            {isInvoicesOpen ? (
              <ChevronUp size={20} color="#6b7280" />
            ) : (
              <ChevronDown size={20} color="#6b7280" />
            )}
          </div>
        </div>

        {isInvoicesOpen && (
          <div
            style={{
              marginTop: '16px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px',
              }}
            >
              <div style={{ position: 'relative', width: '220px' }}>
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
                  className="fin-input"
                  placeholder="Buscar factura / usuario..."
                  value={searchInvoices}
                  onChange={(e) => setSearchInvoices(e.target.value)}
                  style={{ paddingLeft: '30px' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="fin-table-desktop" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Código Factura</th>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th style={{ textAlign: 'right' }}>Monto Pagado ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoicesRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: 'center',
                          padding: '16px',
                          color: '#6b7280',
                        }}
                      >
                        No hay facturas registradas mayores a $0.00.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoicesRows.map((inv, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            color: '#dc2626',
                          }}
                        >
                          {inv.invoice_code || 'S/C'}
                        </td>
                        <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: '600' }}>
                          {inv.user?.full_name || 'Usuario'}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {inv.user?.role || '-'}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#059669',
                          }}
                        >
                          {formatMoney(
                            inv.total_neto_pagar_usd ||
                              inv.paid_amount ||
                              inv.total ||
                              0
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="fin-mobile-cards" style={{ padding: '12px' }}>
              {filteredInvoicesRows.map((inv, idx) => (
                <div key={idx} className="fin-mobile-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '6px',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ color: '#dc2626', fontFamily: 'monospace' }}>
                      #{inv.invoice_code || 'S/C'}
                    </span>
                    <span style={{ color: '#059669' }}>
                      {formatMoney(
                        inv.total_neto_pagar_usd ||
                          inv.paid_amount ||
                          inv.total ||
                          0
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      color: '#111827',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    {inv.user?.full_name || 'Usuario'}
                  </div>
                  <div
                    style={{
                      color: '#6b7280',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '4px 0',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>
                      Rol: {inv.user?.role || '-'}
                    </span>
                    <span>
                      Fecha: {new Date(inv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ConsolidatedMetricsView = ({
  kpiData,
  monthlyData,
  formatMoney,
  formatPct,
  titleCategory,
  capitalData,
}) => {
  const maxVal = Math.max(
    kpiData.paid,
    kpiData.grossProfit,
    kpiData.netProfit,
    1
  );
  const getBarHeight = (val) =>
    Math.max(10, Math.min(100, (val / maxVal) * 100));
  const maxMonthly = Math.max(...monthlyData.map((m) => m[1]), 1);
  const isGlobal = !titleCategory;
  const capTotal = isGlobal
    ? capitalData.totalInvested
    : capitalData.total || 0;
  const capStock = isGlobal ? capitalData.inStock : capitalData.stock || 0;
  const capTransit = isGlobal
    ? capitalData.inTransit
    : capitalData.transit || 0;
  const billedVal = isGlobal ? kpiData.billed : capitalData.billed || 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#6b7280',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Box size={16} /> CAPITAL INVERTIDO (STOCK + TRÁNSITO)
        </h3>
        <div className="fin-grid-kpi">
          <LightKpiCard
            title={`Capital Total Invertido ${
              titleCategory ? `(${titleCategory})` : ''
            }`}
            value={capTotal}
            color="#f8fafc"
            border="#e2e8f0"
            textColor="#475569"
            icon={Archive}
            highlight
          />
          <LightKpiCard
            title="En Stock (Bodega)"
            value={capStock}
            color="#f1f5f9"
            border="#cbd5e1"
            textColor="#64748b"
            icon={Package}
          />
          <LightKpiCard
            title="En Tránsito (N.E. Abiertas)"
            value={capTransit}
            color="#fff7ed"
            border="#ffedd5"
            textColor="#c2410c"
            icon={Truck}
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#6b7280',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Receipt size={16} /> FACTURACIÓN Y CAJA
        </h3>
        <div className="fin-grid-kpi">
          <LightKpiCard
            title={`Facturado (Pendiente/Abonado) ${
              titleCategory ? `(${titleCategory})` : ''
            }`}
            value={billedVal}
            color="#eff6ff"
            border="#bfdbfe"
            textColor="#1e40af"
            icon={Target}
          />
          <LightKpiCard
            title={`N.E. Pagadas (Histórico) ${
              titleCategory ? `(${titleCategory})` : ''
            }`}
            value={kpiData.paid}
            color="#f0fdf4"
            border="#bbf7d0"
            textColor="#166534"
            icon={Wallet}
          />
          <LightKpiCard
            title="Caja Disponible"
            value={kpiData.cashAvailable}
            color="#fff7ed"
            border="#ffedd5"
            textColor="#c2410c"
            icon={Coins}
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#6b7280',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <TrendingUp size={16} /> GANANCIAS OPERATIVAS
        </h3>
        <div className="fin-grid-kpi">
          <LightKpiCard
            title="Capital a Reinvertir (COGS)"
            value={kpiData.cogs}
            color="#f8fafc"
            border="#e2e8f0"
            textColor="#475569"
            icon={Archive}
          />
          <LightKpiCard
            title={`Reservado para Comisión ${
              titleCategory ? `(${titleCategory})` : ''
            }`}
            value={kpiData.reservedCommission || 0}
            color="#eef2ff"
            border="#c7d2fe"
            textColor="#3730a3"
            icon={Coins}
          />
          <LightKpiCard
            title="Ganancia Bruta"
            value={kpiData.grossProfit}
            color="#faf5ff"
            border="#e9d5ff"
            textColor="#6b21a8"
            icon={TrendingUp}
          />
          <LightKpiCard
            title="% de Ganancia Bruta"
            value={formatPct(kpiData.grossProfitPct)}
            color="#f3e8ff"
            border="#d8b4fe"
            textColor="#7e22ce"
            icon={Percent}
          />
        </div>
      </div>

      <div className="charts-double-container">
        <div className="chart-card">
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <BarChart3 size={16} color="#dc2626" /> Rendimiento Período Actual{' '}
            {titleCategory ? `(${titleCategory})` : ''}
          </h3>
          <div className="column-chart-wrapper">
            <ColumnItem
              label="N.E. Pagadas"
              val={kpiData.paid}
              color="#16a34a"
              heightPct={getBarHeight(kpiData.paid)}
            />
            <ColumnItem
              label="G. Bruta"
              val={kpiData.grossProfit}
              color="#9333ea"
              heightPct={getBarHeight(kpiData.grossProfit)}
            />
            <ColumnItem
              label="Egresos"
              val={kpiData.totalExpenses}
              color="#dc2626"
              heightPct={getBarHeight(kpiData.totalExpenses)}
            />
            <ColumnItem
              label="G. Neta"
              val={kpiData.netProfit}
              color="#059669"
              heightPct={getBarHeight(kpiData.netProfit)}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <TrendingUp size={16} color="#059669" /> Comparativa de Ventas vs
            Meses Anteriores
          </h3>
          <div className="column-chart-wrapper">
            {monthlyData.length === 0 ? (
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '12px',
                  alignSelf: 'center',
                }}
              >
                Sin suficientes meses para comparar
              </div>
            ) : (
              monthlyData.map(([month, amount]) => (
                <ColumnItem
                  key={month}
                  label={month}
                  val={amount}
                  color="#d97706"
                  heightPct={Math.max(12, (amount / maxMonthly) * 100)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ColumnItem = ({ label, val, color, heightPct }) => (
  <div className="column-item">
    <div
      className="column-bar"
      style={{ height: `${heightPct}%`, backgroundColor: color }}
    >
      <span className="column-value">
        $
        {Number(val || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </span>
    </div>
    <span className="column-label">{label}</span>
  </div>
);

const LightKpiCard = ({
  title,
  value,
  color,
  border,
  textColor,
  icon: Icon,
  highlight,
}) => (
  <div
    style={{
      backgroundColor: color,
      border: highlight ? '2px solid #059669' : `1px solid ${border}`,
      padding: '16px',
      borderRadius: '12px',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: textColor,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </span>
      {Icon && <Icon size={16} color={textColor} />}
    </div>
    <div style={{ fontSize: '20px', fontWeight: '900', color: textColor }}>
      {typeof value === 'number'
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value || 0)
        : value}
    </div>
  </div>
);

const RankingsSellersSection = ({ records, formatMoney }) => {
  const [sortCol, setSortCol] = useState('sales');
  const [sortAsc, setSortAsc] = useState(false);
  const sellerMap = {};

  records.forEach((r) => {
    const name = r.seller_name || 'Sin Asignar';
    if (!sellerMap[name]) sellerMap[name] = { sales: 0, profit: 0, count: 0 };
    sellerMap[name].sales += Number(r.total_sale_usd || 0);
    sellerMap[name].profit += Number(r.net_profit_usd || 0);
    sellerMap[name].count += 1;
  });

  const sortedSellers = Object.entries(sellerMap).sort((a, b) => {
    const valA = a[1][sortCol];
    const valB = b[1][sortCol];
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  const top3 = sortedSellers.slice(0, 3);

  return (
    <div>
      {top3.length >= 3 && (
        <div className="podium-container">
          <div className="podium-step">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#4b5563',
                marginBottom: '4px',
              }}
            >
              {top3[1][0]}
            </span>
            <div className="podium-box podium-second">
              <span>2.º</span>
              <span style={{ fontSize: '10px' }}>
                {formatMoney(top3[1][1].sales)}
              </span>
            </div>
          </div>
          <div className="podium-step">
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#d97706',
                marginBottom: '4px',
              }}
            >
              👑 {top3[0][0]}
            </span>
            <div className="podium-box podium-first">
              <span>1.º</span>
              <span style={{ fontSize: '11px' }}>
                {formatMoney(top3[0][1].sales)}
              </span>
            </div>
          </div>
          <div className="podium-step">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#4b5563',
                marginBottom: '4px',
              }}
            >
              {top3[2][0]}
            </span>
            <div className="podium-box podium-third">
              <span>3.º</span>
              <span style={{ fontSize: '10px' }}>
                {formatMoney(top3[2][1].sales)}
              </span>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <table className="fin-table-desktop">
          <thead>
            <tr>
              <th>#</th>
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer' }}
              >
                Vendedor <ArrowUpDown size={12} />
              </th>
              <th
                onClick={() => handleSort('count')}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                Notas Cerradas <ArrowUpDown size={12} />
              </th>
              <th
                onClick={() => handleSort('sales')}
                style={{ textAlign: 'right', cursor: 'pointer' }}
              >
                Venta Total <ArrowUpDown size={12} />
              </th>
              <th
                onClick={() => handleSort('profit')}
                style={{ textAlign: 'right', cursor: 'pointer' }}
              >
                Ganancia Generada <ArrowUpDown size={12} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSellers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: '#6b7280',
                  }}
                >
                  No hay datos de vendedores en el histórico de notas cerradas.
                </td>
              </tr>
            ) : (
              sortedSellers.map(([name, data], idx) => (
                <tr key={name}>
                  <td style={{ fontWeight: 'bold', color: '#9ca3af' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#111827' }}>
                    {name}
                  </td>
                  <td style={{ textAlign: 'center' }}>{data.count}</td>
                  <td style={{ textAlign: 'right' }}>
                    {formatMoney(data.sales)}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#059669',
                    }}
                  >
                    {formatMoney(data.profit)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="fin-mobile-cards" style={{ padding: '12px' }}>
          {sortedSellers.map(([name, data], idx) => (
            <div key={name} className="fin-mobile-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '6px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#dc2626' }}>
                  #{idx + 1} {name}
                </span>
                <span style={{ color: '#059669' }}>
                  {formatMoney(data.sales)}
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Notas: {data.count}</span>
                <span>Ganancia: {formatMoney(data.profit)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RankingsClientsSection = ({ records, formatMoney }) => {
  const [sortCol, setSortCol] = useState('sales');
  const [sortAsc, setSortAsc] = useState(false);
  const clientMap = {};

  records.forEach((r) => {
    const name = r.client_name || 'Cliente Genérico';
    if (!clientMap[name]) clientMap[name] = { sales: 0, count: 0 };
    clientMap[name].sales += Number(r.total_sale_usd || 0);
    clientMap[name].count += 1;
  });

  const sortedClients = Object.entries(clientMap).sort((a, b) => {
    const valA = a[1][sortCol];
    const valB = b[1][sortCol];
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  const top3 = sortedClients.slice(0, 3);

  return (
    <div>
      {top3.length >= 3 && (
        <div className="podium-container">
          <div className="podium-step">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#4b5563',
                marginBottom: '4px',
              }}
            >
              {top3[1][0]}
            </span>
            <div className="podium-box podium-second">
              <span>2.º</span>
              <span style={{ fontSize: '10px' }}>
                {formatMoney(top3[1][1].sales)}
              </span>
            </div>
          </div>
          <div className="podium-step">
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#d97706',
                marginBottom: '4px',
              }}
            >
              👑 {top3[0][0]}
            </span>
            <div className="podium-box podium-first">
              <span>1.º</span>
              <span style={{ fontSize: '11px' }}>
                {formatMoney(top3[0][1].sales)}
              </span>
            </div>
          </div>
          <div className="podium-step">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#4b5563',
                marginBottom: '4px',
              }}
            >
              {top3[2][0]}
            </span>
            <div className="podium-box podium-third">
              <span>3.º</span>
              <span style={{ fontSize: '10px' }}>
                {formatMoney(top3[2][1].sales)}
              </span>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <table className="fin-table-desktop">
          <thead>
            <tr>
              <th>#</th>
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer' }}
              >
                Cliente <ArrowUpDown size={12} />
              </th>
              <th
                onClick={() => handleSort('count')}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                Transacciones <ArrowUpDown size={12} />
              </th>
              <th
                onClick={() => handleSort('sales')}
                style={{ textAlign: 'right', cursor: 'pointer' }}
              >
                Facturación Acumulada <ArrowUpDown size={12} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: '#6b7280',
                  }}
                >
                  No hay datos de clientes en el histórico de notas cerradas.
                </td>
              </tr>
            ) : (
              sortedClients.map(([name, data], idx) => (
                <tr key={name}>
                  <td style={{ fontWeight: 'bold', color: '#9ca3af' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#111827' }}>
                    {name}
                  </td>
                  <td style={{ textAlign: 'center' }}>{data.count}</td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#1d4ed8',
                    }}
                  >
                    {formatMoney(data.sales)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="fin-mobile-cards" style={{ padding: '12px' }}>
          {sortedClients.map(([name, data], idx) => (
            <div key={name} className="fin-mobile-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '6px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#1d4ed8' }}>
                  #{idx + 1} {name}
                </span>
                <span style={{ color: '#059669' }}>
                  {formatMoney(data.sales)}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Transacciones: {data.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RankingsProductsSection = ({ formatMoney }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [sortCol, setSortCol] = useState('total');
  const [sortAsc, setSortAsc] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('todos');

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const prodMap = {};

      const { data: recordItems, error: itemsError } = await supabase
        .from('financial_record_items')
        .select('*');

      if (!itemsError && recordItems && recordItems.length > 0) {
        recordItems.forEach((item) => {
          const name = item.product_name || 'Producto S/D';
          const code = item.product_code || 'S/C';
          const cat = (item.category || 'bombillos').toLowerCase();
          const key = `${code} - ${name}`;
          if (!prodMap[key]) prodMap[key] = { qty: 0, total: 0, category: cat };
          prodMap[key].qty += Number(item.quantity || 0);
          prodMap[key].total += Number(item.line_total_usd || 0);
        });
      } else {
        const { data: closedData } = await supabase
          .from('closed_months_history')
          .select('snapshot_products_ranking');
        (closedData || []).forEach((row) => {
          const items = row.snapshot_products_ranking || [];
          items.forEach((item) => {
            const name =
              item.description || item.product_name || 'Producto S/D';
            const code = item.code || item.product_code || 'S/C';
            const cat = (
              item.category ||
              item.product_category ||
              'bombillos'
            ).toLowerCase();
            const key = `${code} - ${name}`;
            if (!prodMap[key])
              prodMap[key] = { qty: 0, total: 0, category: cat };
            prodMap[key].qty += Number(
              item.total_units_sold || item.quantity || 0
            );
            prodMap[key].total += Number(
              item.total_revenue_usd || item.line_total_usd || 0
            );
          });
        });
      }

      const list = Object.entries(prodMap).map(([name, d]) => ({ name, ...d }));
      setTopProducts(list);
    } catch (err) {
      console.error('Error cargando top productos:', err);
    } finally {
      setLoadingProds(false);
    }
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  const filteredProducts = topProducts.filter((prod) => {
    if (categoryFilter === 'todos') return true;
    return prod.category === categoryFilter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const valA = a[sortCol];
    const valB = b[sortCol];
    return sortAsc ? valA - valB : valB - valA;
  });

  const top3 = sortedProducts.slice(0, 3);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          alignItems: 'center',
          background: '#f9fafb',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151' }}
        >
          Filtrar Categoría de Productos:
        </span>
        <button
          onClick={() => setCategoryFilter('todos')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: categoryFilter === 'todos' ? '#dc2626' : '#e5e7eb',
            color: categoryFilter === 'todos' ? '#fff' : '#374151',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Todos
        </button>
        <button
          onClick={() => setCategoryFilter('bombillos')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: categoryFilter === 'bombillos' ? '#dc2626' : '#e5e7eb',
            color: categoryFilter === 'bombillos' ? '#fff' : '#374151',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Solo Bombillos
        </button>
        <button
          onClick={() => setCategoryFilter('fluidos')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: categoryFilter === 'fluidos' ? '#dc2626' : '#e5e7eb',
            color: categoryFilter === 'fluidos' ? '#fff' : '#374151',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Solo Fluidos
        </button>
      </div>

      {top3.length >= 3 && (
        <div className="podium-container">
          <div className="podium-step">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#4b5563',
                marginBottom: '4px',
              }}
            >
              {top3[1].name}
            </span>
            <div className="podium-box podium-second">
              <span>2.º</span>
              <span style={{ fontSize: '10px' }}>{top3[1].qty} u.</span>
            </div>
          </div>
          <div className="podium-step">
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#d97706',
                marginBottom: '4px',
              }}
            >
              ⭐ {top3[0].name}
            </span>
            <div className="podium-box podium-first">
              <span>1.º</span>
              <span style={{ fontSize: '11px' }}>{top3[0].qty} u.</span>
            </div>
          </div>
          <div className="podium-step">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#4b5563',
                marginBottom: '4px',
              }}
            >
              {top3[2].name}
            </span>
            <div className="podium-box podium-third">
              <span>3.º</span>
              <span style={{ fontSize: '10px' }}>{top3[2].qty} u.</span>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <table className="fin-table-desktop">
          <thead>
            <tr>
              <th>#</th>
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer' }}
              >
                Código / Producto <ArrowUpDown size={12} />
              </th>
              <th
                onClick={() => handleSort('qty')}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                Unidades Vendidas <ArrowUpDown size={12} />
              </th>
              <th
                onClick={() => handleSort('total')}
                style={{ textAlign: 'right', cursor: 'pointer' }}
              >
                Total Generado ($) <ArrowUpDown size={12} />
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingProds ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6b7280',
                  }}
                >
                  Calculando top productos del histórico...
                </td>
              </tr>
            ) : sortedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6b7280',
                  }}
                >
                  No hay registros de ítems vendidos con el filtro seleccionado.
                </td>
              </tr>
            ) : (
              sortedProducts.map((prod, idx) => (
                <tr key={prod.name}>
                  <td style={{ fontWeight: 'bold', color: '#9ca3af' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#111827' }}>
                    {prod.name}
                  </td>
                  <td style={{ textAlign: 'center' }}>{prod.qty} u.</td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#059669',
                    }}
                  >
                    {formatMoney(prod.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="fin-mobile-cards" style={{ padding: '12px' }}>
          {sortedProducts.map((prod, idx) => (
            <div key={prod.name} className="fin-mobile-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '6px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#059669' }}>
                  #{idx + 1} {prod.name}
                </span>
                <span>{prod.qty} u.</span>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Total: {formatMoney(prod.total)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
