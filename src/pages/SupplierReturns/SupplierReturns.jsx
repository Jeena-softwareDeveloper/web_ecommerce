import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Shield,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  ChevronDown,
  Inbox
} from 'lucide-react';
import { api } from '../../services/api';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import PageHeader from '../../components/common/PageHeader';

const SupplierReturns = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('returns'); // 'returns' or 'rtos'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [returns, setReturns] = useState([]);
  const [rtos, setRtos] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Status colors mapping
  const statusColors = {
    // Return status colors
    requested: 'bg-blue-50 border-blue-100 text-blue-600',
    approved: 'bg-purple-50 border-purple-100 text-purple-600',
    pickup_scheduled: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    picked_up: 'bg-cyan-50 border-cyan-100 text-cyan-600',
    qc_pending: 'bg-amber-50 border-amber-100 text-amber-600',
    qc_in_progress: 'bg-orange-50 border-orange-100 text-orange-600',
    qc_passed: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    qc_failed: 'bg-rose-50 border-rose-100 text-rose-600',
    refund_initiated: 'bg-sky-50 border-sky-100 text-sky-600',
    refund_completed: 'bg-green-50 border-green-100 text-green-600',
    exchange_initiated: 'bg-violet-50 border-violet-100 text-violet-600',
    exchange_completed: 'bg-teal-50 border-teal-100 text-teal-600',
    closed: 'bg-gray-50 border-gray-150 text-gray-600',
    
    // RTO status colors
    rto_initiated: 'bg-blue-50 border-blue-100 text-blue-600',
    rto_acknowledged: 'bg-purple-50 border-purple-100 text-purple-600',
    rto_in_transit: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    rto_received: 'bg-cyan-50 border-cyan-100 text-cyan-600',
    rto_qc_pending: 'bg-amber-50 border-amber-100 text-amber-600',
    rto_qc_completed: 'bg-orange-50 border-orange-100 text-orange-600',
    rto_restocked: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    rto_disposed: 'bg-rose-50 border-rose-100 text-rose-600',
    rto_lost: 'bg-red-50 border-red-100 text-red-600'
  };

  // Status icons mapping
  const statusIcons = {
    // Return status icons
    requested: <Clock size={12} />,
    approved: <CheckCircle size={12} />,
    pickup_scheduled: <Calendar size={12} />,
    picked_up: <Package size={12} />,
    qc_pending: <Shield size={12} />,
    qc_in_progress: <Shield size={12} />,
    qc_passed: <CheckCircle size={12} />,
    qc_failed: <XCircle size={12} />,
    refund_initiated: <DollarSign size={12} />,
    refund_completed: <CheckCircle size={12} />,
    exchange_initiated: <RefreshCw size={12} />,
    exchange_completed: <CheckCircle size={12} />,
    closed: <CheckCircle size={12} />,
    
    // RTO status icons
    rto_initiated: <Clock size={12} />,
    rto_acknowledged: <CheckCircle size={12} />,
    rto_in_transit: <Truck size={12} />,
    rto_received: <Package size={12} />,
    rto_qc_pending: <Shield size={12} />,
    rto_qc_completed: <Shield size={12} />,
    rto_restocked: <CheckCircle size={12} />,
    rto_disposed: <XCircle size={12} />,
    rto_lost: <AlertCircle size={12} />
  };

  const returnStatuses = [
    { value: 'all', label: 'All Returns' },
    { value: 'requested', label: 'Requested' },
    { value: 'approved', label: 'Approved' },
    { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'qc_pending', label: 'QC Pending' },
    { value: 'qc_in_progress', label: 'QC In Progress' },
    { value: 'qc_passed', label: 'QC Passed' },
    { value: 'qc_failed', label: 'QC Failed' },
    { value: 'refund_initiated', label: 'Refund Initiated' },
    { value: 'refund_completed', label: 'Refund Completed' },
    { value: 'closed', label: 'Closed' }
  ];

  const rtoStatuses = [
    { value: 'all', label: 'All RTOs' },
    { value: 'rto_initiated', label: 'Initiated' },
    { value: 'rto_acknowledged', label: 'Acknowledged' },
    { value: 'rto_in_transit', label: 'In Transit' },
    { value: 'rto_received', label: 'Received' },
    { value: 'rto_qc_pending', label: 'QC Pending' },
    { value: 'rto_qc_completed', label: 'QC Completed' },
    { value: 'rto_restocked', label: 'Restocked' },
    { value: 'rto_disposed', label: 'Disposed' },
    { value: 'rto_lost', label: 'Lost' }
  ];

  // Fetch combined dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/wear/supplier/returns-rtos/combined-stats');
      if (response.data.success) {
        setStats(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch returns
  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wear/supplier/returns/v2');
      if (response.data.success) {
        setReturns(response.data.returns || []);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch RTOs
  const fetchRtos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wear/supplier/rtos');
      if (response.data.success) {
        setRtos(response.data.rtos || []);
      }
    } catch (error) {
      console.error('Error fetching RTOs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get status display text
  const getStatusText = (status) => {
    const statusMap = {
      requested: 'Requested',
      approved: 'Approved',
      pickup_scheduled: 'Pickup Scheduled',
      picked_up: 'Picked Up',
      qc_pending: 'QC Pending',
      qc_in_progress: 'QC In Progress',
      qc_passed: 'QC Passed',
      qc_failed: 'QC Failed',
      refund_initiated: 'Refund Initiated',
      refund_completed: 'Refund Completed',
      exchange_initiated: 'Exchange Initiated',
      exchange_completed: 'Exchange Completed',
      closed: 'Closed',
      rto_initiated: 'Initiated',
      rto_acknowledged: 'Acknowledged',
      rto_in_transit: 'In Transit',
      rto_received: 'Received',
      rto_qc_pending: 'QC Pending',
      rto_qc_completed: 'QC Completed',
      rto_restocked: 'Restocked',
      rto_disposed: 'Disposed',
      rto_lost: 'Lost'
    };
    
    return statusMap[status] || status;
  };

  // Initialize
  useEffect(() => {
    fetchDashboardStats();
    fetchReturns();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, status: 'all', search: '' }));
    if (activeTab === 'returns') {
      fetchReturns();
    } else {
      fetchRtos();
    }
  }, [activeTab]);

  // Combined reactive search and filter lists
  const filteredReturnsList = useMemo(() => {
    let result = [...returns];
    if (filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(item => 
        item._id?.toLowerCase().includes(q) ||
        item.orderId?.orderNumber?.toLowerCase().includes(q) ||
        item.productId?.productName?.toLowerCase().includes(q) ||
        item.customerId?.name?.toLowerCase().includes(q) ||
        item.reason?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [returns, filters.status, filters.search]);

  const filteredRtosList = useMemo(() => {
    let result = [...rtos];
    if (filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(item => 
        item.rtoId?.toLowerCase().includes(q) ||
        item._id?.toLowerCase().includes(q) ||
        item.orderId?.orderNumber?.toLowerCase().includes(q) ||
        item.courierPartner?.toLowerCase().includes(q) ||
        item.trackingId?.toLowerCase().includes(q) ||
        item.reason?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rtos, filters.status, filters.search]);

  // Desktop columns definitions
  const returnColumns = [
    {
      label: 'Return ID',
      key: '_id',
      sortable: true,
      render: (row, val) => (
        <span className="font-mono text-xs font-black text-gray-900 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded-lg uppercase">
          #{val?.slice(-8)}
        </span>
      )
    },
    {
      label: 'Order Number',
      key: 'orderId',
      sortable: true,
      render: (row, val) => <span className="font-extrabold text-gray-800">{val?.orderNumber || 'N/A'}</span>
    },
    {
      label: 'Product Details',
      key: 'productId',
      sortable: true,
      render: (row, val) => (
        <div className="flex flex-col gap-0.5 max-w-[200px]">
          <span className="font-black text-gray-800 truncate" title={val?.productName}>
            {val?.productName || 'Unknown Product'}
          </span>
          {val?.category && (
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">
              {val.category}
            </span>
          )}
        </div>
      )
    },
    {
      label: 'Customer',
      key: 'customerId',
      sortable: true,
      render: (row, val) => <span className="text-gray-600 font-bold">{val?.name || 'Unknown User'}</span>
    },
    {
      label: 'Refund Value',
      key: 'refundAmount',
      sortable: true,
      render: (row, val) => <span className="font-black text-gray-900">{formatCurrency(val)}</span>
    },
    {
      label: 'Return Reason',
      key: 'reason',
      sortable: true,
      render: (row, val) => (
        <span className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded capitalize">
          {val?.replace(/_/g, ' ') || 'No reason'}
        </span>
      )
    },
    {
      label: 'Status',
      key: 'status',
      sortable: true,
      render: (row, val) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${statusColors[val] || 'bg-gray-50 border-gray-200 text-gray-600'}`}>
          {statusIcons[val]}
          {getStatusText(val)}
        </span>
      )
    },
    {
      label: 'Requested On',
      key: 'requestedAt',
      sortable: true,
      render: (row, val) => <span className="text-gray-500 font-extrabold text-xs">{formatDate(val)}</span>
    }
  ];

  const rtoColumns = [
    {
      label: 'RTO ID',
      key: 'rtoId',
      sortable: true,
      render: (row, val) => (
        <span className="font-mono text-xs font-black text-gray-900 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded-lg uppercase">
          #{val || row._id?.slice(-8)}
        </span>
      )
    },
    {
      label: 'Order Number',
      key: 'orderId',
      sortable: true,
      render: (row, val) => <span className="font-extrabold text-gray-800">{val?.orderNumber || 'N/A'}</span>
    },
    {
      label: 'Courier Details',
      key: 'courierPartner',
      sortable: true,
      render: (row, val) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-800">{val || 'Standard Courier'}</span>
          {row.trackingId && (
            <span className="text-[9px] text-gray-400 font-extrabold">
              Track ID: {row.trackingId}
            </span>
          )}
        </div>
      )
    },
    {
      label: 'Condition',
      key: 'productCondition',
      sortable: true,
      render: (row, val) => (
        <span className="text-[10px] font-black text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded capitalize">
          {val?.replace(/_/g, ' ') || 'Unknown'}
        </span>
      )
    },
    {
      label: 'Net Loss',
      key: 'netLoss',
      sortable: true,
      render: (row, val) => <span className="font-black text-rose-600">{formatCurrency(val)}</span>
    },
    {
      label: 'Reason',
      key: 'reason',
      sortable: true,
      render: (row, val) => (
        <span className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded capitalize">
          {val?.replace(/_/g, ' ') || 'No reason'}
        </span>
      )
    },
    {
      label: 'Status',
      key: 'status',
      sortable: true,
      render: (row, val) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${statusColors[val] || 'bg-gray-50 border-gray-200 text-gray-600'}`}>
          {statusIcons[val]}
          {getStatusText(val)}
        </span>
      )
    },
    {
      label: 'Initiated On',
      key: 'createdAt',
      sortable: true,
      render: (row, val) => <span className="text-gray-500 font-extrabold text-xs">{formatDate(val)}</span>
    }
  ];

  // Action definitions
  const returnActions = [
    {
      icon: <Eye size={13} />,
      label: 'View details',
      onClick: (row) => navigate(`/supplier/returns/${row._id}`),
      colorClass: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-100/50 hover:border-purple-200'
    },
    {
      icon: <Edit size={13} />,
      label: 'Update QC details',
      onClick: (row) => navigate(`/supplier/returns/${row._id}/qc`),
      colorClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100/50 hover:border-emerald-200',
      showCondition: (row) => ['qc_pending', 'qc_in_progress'].includes(row.status)
    }
  ];

  const rtoActions = [
    {
      icon: <Eye size={13} />,
      label: 'View details',
      onClick: (row) => navigate(`/supplier/rtos/${row._id}`),
      colorClass: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-100/50 hover:border-purple-200'
    },
    {
      icon: <CheckCircle size={13} />,
      label: 'Acknowledge item',
      onClick: (row) => navigate(`/supplier/rtos/${row._id}/acknowledge`),
      colorClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100/50 hover:border-emerald-200',
      showCondition: (row) => ['received', 'initiated', 'acknowledged'].includes(row.status)
    }
  ];

  return (
    <div className="lg:h-full h-auto w-full bg-transparent flex flex-col lg:overflow-hidden overflow-visible">
      
      {/* 1. MOBILE NATIVE STICKY HEADER & CONTROLS (lg:hidden) */}
      <div className="lg:hidden sticky top-0 z-45 flex flex-col w-full pb-3 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs shrink-0">
        {/* Mobile Top Bar */}
        <div className="px-5 pt-4 pb-1.5 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/supplier/dashboard')}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all"
            >
              <ArrowLeft size={14} className="text-white" />
              <span className="text-white text-xs font-black ml-1.5">Back</span>
            </button>
            <span className="text-lg font-black text-gray-900 ml-3.5 leading-none">Returns</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => activeTab === 'returns' ? fetchReturns() : fetchRtos()}
              className="flex items-center justify-center w-8 h-8 bg-white text-purple-600 rounded-xl border border-white shadow-xs active:scale-95 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Mobile Search & Filters Row */}
        <div className="px-5 flex gap-2.5">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder={activeTab === 'returns' ? "Search returns..." : "Search RTOs..."}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-white rounded-xl text-xs font-bold text-gray-700 shadow-xs focus:border-[#7C3AED] focus:bg-white outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="appearance-none bg-gray-50 border border-white text-xs font-black text-gray-700 px-3 pr-7 py-2 rounded-xl focus:border-[#7C3AED] focus:bg-white outline-none transition-all shadow-xs"
            >
              {(activeTab === 'returns' ? returnStatuses : rtoStatuses).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
              <ChevronDown size={12} />
            </span>
          </div>
        </div>

        {/* Mobile Tabs Pill Selectors */}
        <div className="px-5 mt-2 bg-white">
          <div className="flex p-0.5 bg-gray-50 border border-white rounded-xl">
            <button
              onClick={() => setActiveTab('returns')}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${activeTab === 'returns' 
                ? 'bg-white text-purple-700 shadow-xs border border-white' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Returns {stats?.summary?.pendingReturns > 0 && `(${stats.summary.pendingReturns})`}
            </button>
            <button
              onClick={() => setActiveTab('rtos')}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${activeTab === 'rtos' 
                ? 'bg-white text-purple-700 shadow-xs border border-white' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              RTOs {stats?.summary?.pendingRTOs > 0 && `(${stats.summary.pendingRTOs})`}
            </button>
          </div>
        </div>
      </div>

      <PageHeader
        title="Returns & RTO Manager"
        subtitle="Supplier Logistics Hub"
        buttons={[
          {
            label: '',
            icon: <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />,
            onClick: () => activeTab === 'returns' ? fetchReturns() : fetchRtos(),
            variant: 'ghost'
          }
        ]}
        actions={
          <>
            <div className="flex p-0.5 bg-gray-50 border border-gray-150 rounded-xl">
              <button
                onClick={() => setActiveTab('returns')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${activeTab === 'returns' 
                  ? 'bg-white text-purple-700 shadow-xs border border-gray-150' 
                  : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Returns
              </button>
              <button
                onClick={() => setActiveTab('rtos')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${activeTab === 'rtos' 
                  ? 'bg-white text-purple-700 shadow-xs border border-gray-150' 
                  : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                RTO Orders
              </button>
            </div>
            <div className="relative w-52">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder={activeTab === 'returns' ? "Search returns..." : "Search RTOs..."}
                className="w-full pl-8.5 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="appearance-none bg-white border border-gray-200 text-xs font-black text-gray-700 pl-3 pr-7 py-2 rounded-xl focus:border-[#7C3AED] outline-none transition-all shadow-xs"
              >
                {(activeTab === 'returns' ? returnStatuses : rtoStatuses).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
                <ChevronDown size={12} />
              </span>
            </div>
          </>
        }
      />


      {/* 3. NATURAL SCROLLABLE MAIN BODY */}
      <div className="flex-1 lg:overflow-y-auto no-scrollbar lg:px-2 pb-16 pt-3 lg:pt-0">
        
        {/* EXQUISITE STATS OVERVIEW CARDS (Soft Light Borders & White Backgrounds) */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4.5 mb-6 px-5 lg:px-0">
            {/* Stat Card 1 */}
            <div className="bg-white rounded-2xl p-4 border border-white shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Returns</span>
                <div className="p-1.5 bg-purple-50 text-[#7C3AED] rounded-lg">
                  <Package size={15} />
                </div>
              </div>
              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stats.summary.totalReturns}</span>
                <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full">
                  {stats.summary.pendingReturns} Pending
                </span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white rounded-2xl p-4 border border-white shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Total RTOs</span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Truck size={15} />
                </div>
              </div>
              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stats.summary.totalRTOs}</span>
                <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                  {stats.summary.pendingRTOs} Pending
                </span>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white rounded-2xl p-4 border border-white shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Needs Attention</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <AlertCircle size={15} />
                </div>
              </div>
              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stats.summary.totalPending}</span>
                <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Action Item
                </span>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white rounded-2xl p-4 border border-white shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Loss Impact</span>
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <DollarSign size={15} />
                </div>
              </div>
              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-black text-rose-600 leading-none">
                  {formatCurrency(stats.rtos?.financial?.totalCharges || 0)}
                </span>
                <span className="text-[10px] font-extrabold text-gray-400">
                  Avg: {stats.rtos?.financial?.avgTransitDays?.toFixed(0) || 0}d
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SINGLE DELEGATE DYNAMIC RESPONSIVE TABLE COMPONENT */}
        <div className="bg-transparent border-0 rounded-none shadow-none p-0 px-5 lg:px-0 pb-16">
          <ResponsiveTable 
            columns={activeTab === 'returns' ? returnColumns : rtoColumns}
            data={activeTab === 'returns' ? filteredReturnsList : filteredRtosList}
            isLoading={loading}
            emptyStateText={activeTab === 'returns' ? "No returns matching your search filters." : "No RTOs matching your search filters."}
            actions={activeTab === 'returns' ? returnActions : rtoActions}
            searchPlaceholder={activeTab === 'returns' ? "Search returns..." : "Search RTOs..."}
            hideSearch={true}
            maxHeight="calc(100vh - 290px)"
          />
        </div>

      </div>

    </div>
  );
};

export default SupplierReturns;
