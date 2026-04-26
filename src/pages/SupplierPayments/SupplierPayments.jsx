import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    get_financial_dashboard, 
    get_settlement_history,
    request_payout 
} from '../../store/reducers/vendorReducer';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Wallet, CreditCard, Building, 
    TrendingUp, TrendingDown, Calendar, 
    Download, Filter, RefreshCw, CheckCircle,
    Clock, AlertCircle, DollarSign, IndianRupee,
    ChevronRight, MoreVertical, Eye, Receipt
} from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';
import { toast } from "sonner";

const SupplierPayments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { financialDashboard, settlementHistory, loader } = useSelector(state => state.vendor);
    
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'settlements', 'payouts'
    const [filters, setFilters] = useState({
        period: 'this_month',
        status: 'all',
        search: ''
    });

    useEffect(() => {
        fetchPaymentData();
    }, [dispatch]);

    const fetchPaymentData = () => {
        dispatch(get_financial_dashboard());
        dispatch(get_settlement_history());
    };

    const dashboard = financialDashboard || {};
    const stats = dashboard.summary || {
        availableBalance: 0,
        currentMonthRevenue: 0,
        currentMonthDeductions: 0,
        lastMonthNet: 0
    };

    const recentPayouts = dashboard.recentPayouts || [];
    const history = settlementHistory || [];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const StatusBadge = ({ status }) => {
        const configs = {
            completed: { color: 'text-green-700', bg: 'bg-green-100', label: 'Completed' },
            processed: { color: 'text-green-700', bg: 'bg-green-100', label: 'Processed' },
            pending: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Pending' },
            failed: { color: 'text-red-700', bg: 'bg-red-100', label: 'Failed' },
            processing: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Processing' }
        };
        const config = configs[status] || configs.pending;
        
        return (
            <div className={`px-2 py-1 rounded-full ${config.bg} flex items-center`}>
                <span className={`text-[10px] font-bold ${config.color} uppercase tracking-wider`}>
                    {config.label}
                </span>
            </div>
        );
    };

    const SettlementCard = ({ settlement }) => (
        <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-800">{settlement.period}</h4>
                        <span className="text-sm font-black text-green-600">
                            {formatCurrency(settlement.netAmount || 0)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-gray-400" />
                                <span className="text-gray-500 text-xs">{formatDate(settlement.paymentDate)}</span>
                            </div>
                            <StatusBadge status={settlement.status} />
                        </div>
                        <span className="text-gray-400 text-xs font-medium">
                            ID: {settlement.settlementId?.slice(-8)}
                        </span>
                    </div>
                </div>
                <button className="ml-2 p-2 hover:bg-gray-50 rounded-lg">
                    <Download size={18} className="text-[#7C3AED]" />
                </button>
            </div>
        </div>
    );

    const PayoutCard = ({ payout }) => (
        <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className="text-sm font-bold text-gray-800">Payout to Bank</h4>
                            <p className="text-gray-500 text-[10px]">ID: {payout.transactionId}</p>
                        </div>
                        <span className="text-sm font-black text-green-600">
                            {formatCurrency(payout.amount)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-gray-400" />
                                <span className="text-gray-500 text-xs">{formatDate(payout.date)}</span>
                            </div>
                            <StatusBadge status={payout.status} />
                        </div>
                        <button className="text-primary text-xs font-bold flex items-center gap-1">
                            <Eye size={12} />
                            Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
            {/* FIXED HEADER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                        <button 
                            onClick={() => navigate(-1)}
                            className="bg-[#7C3AED] flex items-center px-3 py-1.5 rounded-lg mr-3 shadow-sm"
                        >
                            <ArrowLeft size={16} className="text-white" />
                            <span className="text-white text-[12px] font-black ml-1">Back</span>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-[18px] font-black text-gray-900 leading-tight">Payments & Payouts</h1>
                            <p className="text-gray-500 text-[12px]">Manage your earnings and withdrawals</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchPaymentData}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={loader}
                        >
                            <RefreshCw size={20} className={`text-gray-600 ${loader ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Filter size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-100">
                    {['overview', 'settlements', 'payouts'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-center ${activeTab === tab ? 'border-b-2 border-[#7C3AED]' : ''}`}
                        >
                            <span className={`text-[12px] font-bold ${activeTab === tab ? 'text-[#7C3AED]' : 'text-gray-500'}`}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* SPACER */}
            <div className="pt-[120px]" />

            {/* CONTENT */}
            <div className="p-4 flex-1">
                {loader ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                {/* BALANCE CARD */}
                                <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-2xl p-5 text-white">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-white/80 text-[12px] font-bold uppercase tracking-wider">Available Balance</p>
                                            <h2 className="text-[32px] font-black mt-1">{formatCurrency(stats.availableBalance)}</h2>
                                        </div>
                                        <Wallet size={32} className="text-white/80" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white/80 text-[11px]">Next Payout</p>
                                            <p className="text-white text-[14px] font-bold">{formatDate(dashboard.upcomingPayout?.estimatedDate)}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/supplier-payments?tab=payouts')}
                                            className="bg-white text-[#7C3AED] px-4 py-2 rounded-lg font-bold text-sm"
                                        >
                                            Request
                                        </button>
                                    </div>
                                </div>

                                {/* STATS CARDS */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-500 text-[11px] font-bold">Month Revenue</p>
                                            <TrendingUp size={16} className="text-green-500" />
                                        </div>
                                        <p className="text-gray-900 text-[18px] font-black">{formatCurrency(stats.currentMonthRevenue)}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-500 text-[11px] font-bold">Last Payout</p>
                                            <CheckCircle size={16} className="text-blue-500" />
                                        </div>
                                        <p className="text-gray-900 text-[18px] font-black">{formatCurrency(stats.lastMonthNet || 0)}</p>
                                    </div>
                                </div>

                                {/* QUICK ACTIONS */}
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-900 text-sm font-bold mb-3">Financial Actions</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="bg-gray-50 p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
                                            <CreditCard size={20} className="text-[#7C3AED] mb-2" />
                                            <span className="text-gray-700 text-xs font-bold">Bank Info</span>
                                        </button>
                                        <button className="bg-gray-50 p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
                                            <Download size={20} className="text-[#7C3AED] mb-2" />
                                            <span className="text-gray-700 text-xs font-bold">Reports</span>
                                        </button>
                                    </div>
                                </div>

                                {/* RECENT PAYOUTS */}
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-900 text-sm font-bold">Recent Payouts</h3>
                                        <button 
                                            onClick={() => setActiveTab('payouts')}
                                            className="text-[#7C3AED] text-xs font-bold"
                                        >
                                            History
                                        </button>
                                    </div>
                                    {recentPayouts.slice(0, 3).map((payout, index) => (
                                        <PayoutCard key={index} payout={payout} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SETTLEMENTS TAB */}
                        {activeTab === 'settlements' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-900 text-sm font-bold mb-4">Settlement History</h3>
                                    {history.length > 0 ? (
                                        history.map((settlement, index) => (
                                            <SettlementCard key={index} settlement={settlement} />
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <Clock size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No settlement history found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PAYOUTS TAB */}
                        {activeTab === 'payouts' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-900 text-sm font-bold">Payout Requests</h3>
                                        <button 
                                            onClick={() => dispatch(request_payout({ amount: stats.availableBalance }))}
                                            className="bg-[#7C3AED] text-white px-4 py-2 rounded-lg text-xs font-bold"
                                        >
                                            Request All
                                        </button>
                                    </div>
                                    {recentPayouts.length > 0 ? (
                                        recentPayouts.map((payout, index) => (
                                            <PayoutCard key={index} payout={payout} />
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <Building size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No payout history found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <SupplierFooter />
        </div>
    );
};

export default SupplierPayments;
