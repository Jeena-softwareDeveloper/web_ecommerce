import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Shield,
  BarChart3,
  ChevronRight,
  Eye,
  Edit,
  MoreVertical,
  Calendar,
  Tag,
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { api } from '../../services/api';

const SupplierReturns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    requested: 'bg-blue-100 text-blue-800',
    approved: 'bg-purple-100 text-purple-800',
    pickup_scheduled: 'bg-indigo-100 text-indigo-800',
    picked_up: 'bg-cyan-100 text-cyan-800',
    qc_pending: 'bg-amber-100 text-amber-800',
    qc_in_progress: 'bg-orange-100 text-orange-800',
    qc_passed: 'bg-emerald-100 text-emerald-800',
    qc_failed: 'bg-rose-100 text-rose-800',
    refund_initiated: 'bg-sky-100 text-sky-800',
    refund_completed: 'bg-green-100 text-green-800',
    exchange_initiated: 'bg-violet-100 text-violet-800',
    exchange_completed: 'bg-teal-100 text-teal-800',
    closed: 'bg-gray-100 text-gray-800',
    
    // RTO status colors
    rto_initiated: 'bg-blue-100 text-blue-800',
    rto_acknowledged: 'bg-purple-100 text-purple-800',
    rto_in_transit: 'bg-indigo-100 text-indigo-800',
    rto_received: 'bg-cyan-100 text-cyan-800',
    rto_qc_pending: 'bg-amber-100 text-amber-800',
    rto_qc_completed: 'bg-orange-100 text-orange-800',
    rto_restocked: 'bg-emerald-100 text-emerald-800',
    rto_disposed: 'bg-rose-100 text-rose-800',
    rto_lost: 'bg-red-100 text-red-800'
  };

  // Status icons mapping
  const statusIcons = {
    // Return status icons
    requested: <Clock size={14} />,
    approved: <CheckCircle size={14} />,
    pickup_scheduled: <Calendar size={14} />,
    picked_up: <Package size={14} />,
    qc_pending: <Shield size={14} />,
    qc_in_progress: <Shield size={14} />,
    qc_passed: <CheckCircle size={14} />,
    qc_failed: <XCircle size={14} />,
    refund_initiated: <DollarSign size={14} />,
    refund_completed: <CheckCircle size={14} />,
    exchange_initiated: <RefreshCw size={14} />,
    exchange_completed: <CheckCircle size={14} />,
    closed: <CheckCircle size={14} />,
    
    // RTO status icons
    rto_initiated: <Clock size={14} />,
    rto_acknowledged: <CheckCircle size={14} />,
    rto_in_transit: <Truck size={14} />,
    rto_received: <Package size={14} />,
    rto_qc_pending: <Shield size={14} />,
    rto_qc_completed: <Shield size={14} />,
    rto_restocked: <CheckCircle size={14} />,
    rto_disposed: <XCircle size={14} />,
    rto_lost: <AlertCircle size={14} />
  };

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
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/wear/supplier/returns/v2?${params.toString()}`);
      if (response.data.success) {
        setReturns(response.data.returns);
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
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/wear/supplier/rtos?${params.toString()}`);
      if (response.data.success) {
        setRtos(response.data.rtos);
      }
    } catch (error) {
      console.error('Error fetching RTOs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    if (activeTab === 'returns') {
      fetchReturns();
    } else {
      fetchRtos();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      startDate: '',
      endDate: ''
    });
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
    if (!amount) return '₹0';
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
      // Return status texts
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
      
      // RTO status texts
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
    if (activeTab === 'returns') {
      fetchReturns();
    } else {
      fetchRtos();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full">
      <CommonHeader 
        title="Returns & RTO Management"
        showBackButton={true}
        onBackClick={() => navigate('/supplier/dashboard')}
        actions={[
          {
            icon: <RefreshCw size={20} />,
            onClick: () => activeTab === 'returns' ? fetchReturns() : fetchRtos(),
            tooltip: 'Refresh'
          },
          {
            icon: <Download size={20} />,
            onClick: () => {},
            tooltip: 'Export'
          }
        ]}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="text-blue-600" size={20} />
                </div>
                <span className="text-[11px] md:text-sm font-medium text-gray-500 line-clamp-1">Total Returns</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stats.summary.totalReturns}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-[10px] md:text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                  {stats.summary.pendingReturns} pending
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Truck className="text-purple-600" size={20} />
                </div>
                <span className="text-[11px] md:text-sm font-medium text-gray-500 line-clamp-1">Total RTOs</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stats.summary.totalRTOs}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-[10px] md:text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                  {stats.summary.pendingRTOs} pending
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <AlertCircle className="text-rose-600" size={20} />
                </div>
                <span className="text-[11px] md:text-sm font-medium text-gray-500 line-clamp-1">Total Pending</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stats.summary.totalPending}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-[10px] md:text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                  Needs attention
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <DollarSign className="text-emerald-600" size={20} />
                </div>
                <span className="text-[11px] md:text-sm font-medium text-gray-500 line-clamp-1">Financial Impact</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-gray-900 leading-none">
                {formatCurrency(stats.rtos.financial.totalCharges)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-[10px] md:text-xs font-medium text-gray-600 bg-gray-50 px-2 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                  Avg: {stats.rtos.financial.avgTransitDays?.toFixed(1) || 0} days
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'returns' 
              ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-100' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package size={16} />
              Returns
              {stats?.summary?.pendingReturns > 0 && (
                <span className="bg-white text-[#7C3AED] text-xs font-black px-2 py-0.5 rounded-full">
                  {stats.summary.pendingReturns}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('rtos')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'rtos' 
              ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-100' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Truck size={16} />
              RTOs
              {stats?.summary?.pendingRTOs > 0 && (
                <span className="bg-white text-[#7C3AED] text-xs font-black px-2 py-0.5 rounded-full">
                  {stats.summary.pendingRTOs}
                </span>
              )}
            </div>
          </button>
        </div>


        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Returns List */}
            {activeTab === 'returns' && (
              <div className="space-y-4">
                {returns.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No Returns Found</h3>
                    <p className="text-gray-500">No return requests match your current filters.</p>
                  </div>
                ) : (
                  returns.map((returnItem) => (
                    <motion.div
                      key={returnItem._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-gray-900">#{returnItem._id.slice(-8)}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColors[returnItem.status]}`}>
                              {statusIcons[returnItem.status]}
                              {getStatusText(returnItem.status)}
                            </span>
                            {returnItem.isRTO && (
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                                RTO
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Order: <span className="font-bold">{returnItem.orderId?.orderNumber || 'N/A'}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/supplier/returns/${returnItem._id}`)}
                            className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {['qc_pending', 'qc_in_progress'].includes(returnItem.status) && (
                            <button
                              onClick={() => navigate(`/supplier/returns/${returnItem._id}/qc`)}
                              className="p-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors"
                              title="Update QC"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Product</p>
                          <p className="text-sm font-medium text-gray-900">
                            {returnItem.productId?.productName || 'Unknown Product'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer</p>
                          <p className="text-sm font-medium text-gray-900">
                            {returnItem.customerId?.name || 'Unknown Customer'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Refund Amount</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(returnItem.refundAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Requested: {formatDate(returnItem.requestedAt)}</span>
                          {returnItem.qcDate && (
                            <span>QC: {formatDate(returnItem.qcDate)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                            {returnItem.reason?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* RTOs List */}
            {activeTab === 'rtos' && (
              <div className="space-y-4">
                {rtos.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center">
                    <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No RTOs Found</h3>
                    <p className="text-gray-500">No RTO orders match your current filters.</p>
                  </div>
                ) : (
                  rtos.map((rto) => (
                    <motion.div
                      key={rto._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-gray-900">{rto.rtoId}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColors[rto.status]}`}>
                              {statusIcons[rto.status]}
                              {getStatusText(rto.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Order: <span className="font-bold">{rto.orderId?.orderNumber || 'N/A'}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/supplier/rtos/${rto._id}`)}
                            className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {['received', 'initiated', 'acknowledged'].includes(rto.status) && (
                            <button
                              onClick={() => navigate(`/supplier/rtos/${rto._id}/acknowledge`)}
                              className="p-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors"
                              title="Acknowledge Receipt"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Courier</p>
                          <p className="text-sm font-medium text-gray-900">{rto.courierPartner}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tracking ID</p>
                          <p className="text-sm font-medium text-gray-900">{rto.trackingId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Product Condition</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {rto.productCondition?.replace('_', ' ') || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Financial Impact</p>
                          <p className="text-sm font-bold text-rose-600">
                            {formatCurrency(rto.netLoss)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Initiated: {formatDate(rto.createdAt)}</span>
                          {rto.estimatedDelivery && (
                            <span>Est. Delivery: {formatDate(rto.estimatedDelivery)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                            {rto.reason?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierReturns;
