import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    get_financial_dashboard, 
    get_settlement_history,
    request_payout,
    messageClear
} from '../../store/reducers/vendorReducer';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Wallet, CreditCard, Building, 
    TrendingUp, TrendingDown, Calendar, 
    Download, Filter, RefreshCw, CheckCircle,
    Clock, AlertCircle, DollarSign, IndianRupee,
    ChevronRight, MoreVertical, Eye, Receipt,
    X, ShieldCheck
} from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';
import { toast } from "sonner";

const SupplierPayments = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { financialDashboard, settlementHistory, successMessage, errorMessage, loader } = useSelector(state => state.vendor);
    
    const initialTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(initialTab);
    
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'settlements', 'payouts'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const [filters, setFilters] = useState({
        period: 'this_month',
        status: 'all',
        search: ''
    });

    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [bankForm, setBankForm] = useState({
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountHolderName: ''
    });

    useEffect(() => {
        if (financialDashboard?.bankDetails) {
            setBankForm({
                accountNumber: financialDashboard.bankDetails.accountNumber || '',
                confirmAccountNumber: financialDashboard.bankDetails.accountNumber || '',
                ifscCode: financialDashboard.bankDetails.ifsc || '',
                bankName: financialDashboard.bankDetails.bankName || '',
                branchName: financialDashboard.bankDetails.branchName || '',
                accountHolderName: financialDashboard.bankDetails.accountHolderName || ''
            });
        }
    }, [financialDashboard]);

    useEffect(() => {
        fetchPaymentData();
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

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
        <>
            {/* FIXED HEADER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm max-w-md mx-auto border-x lg:hidden">
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
                            onClick={() => {
                                setActiveTab(tab);
                                setSearchParams({ tab });
                            }}
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
            <div className="pt-[132px] lg:pt-0" />

            {/* CONTENT */}
            <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
                {/* DESKTOP CONTENT HEADER WITH BACK BUTTON */}
                <div className="hidden lg:flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="bg-white hover:bg-gray-50 border border-gray-200/80 shadow-sm flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-700 font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
                        >
                            <ArrowLeft size={14} className="text-[#7C3AED]" />
                            <span>Back</span>
                        </button>
                        <div className="h-5 w-px bg-gray-300" />
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-bold text-xs">Supplier Portal</span>
                            <span className="text-gray-300 text-xs">/</span>
                            <span className="text-gray-800 font-extrabold text-xs">Payments & Settlements</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={fetchPaymentData}
                        className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200/80 shadow-sm px-4 py-2 rounded-xl text-gray-700 font-extrabold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                        <RefreshCw size={12} className={`text-[#7C3AED] ${loader ? 'animate-spin' : ''}`} />
                        <span>Refresh Data</span>
                    </button>
                </div>

                {loader ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                {/* BALANCE & STATS CARDS GRID */}
                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                                    {/* BALANCE CARD */}
                                    <div className="col-span-2 lg:hidden bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm min-h-[140px] lg:min-h-[160px]">
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
                                                className="bg-white text-[#7C3AED] px-4 py-2 rounded-lg font-bold text-sm active:scale-95 transition-all shadow-sm"
                                            >
                                                Request
                                            </button>
                                        </div>
                                    </div>

                                    {/* MONTH REVENUE CARD */}
                                    <div className="col-span-1 bg-emerald-50/80 rounded-xl p-4 lg:p-5 border border-emerald-100 shadow-sm flex flex-col justify-between min-h-[100px] lg:min-h-[160px]">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-emerald-800 text-[11px] lg:text-[12px] font-bold">Month Revenue</p>
                                            <TrendingUp size={16} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-emerald-900 text-[18px] lg:text-[26px] font-black leading-tight">{formatCurrency(stats.currentMonthRevenue)}</p>
                                            <p className="text-emerald-600/70 text-[9px] lg:text-[10px] font-bold mt-1 uppercase tracking-wider hidden lg:block">Accumulated this month</p>
                                        </div>
                                    </div>

                                    {/* LAST PAYOUT CARD */}
                                    <div className="col-span-1 bg-blue-50/80 rounded-xl p-4 lg:p-5 border border-blue-100 shadow-sm flex flex-col justify-between min-h-[100px] lg:min-h-[160px]">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-blue-800 text-[11px] lg:text-[12px] font-bold">Last Payout</p>
                                            <CheckCircle size={16} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-blue-900 text-[18px] lg:text-[26px] font-black leading-tight">{formatCurrency(stats.lastMonthNet || 0)}</p>
                                            <p className="text-blue-600/70 text-[9px] lg:text-[10px] font-bold mt-1 uppercase tracking-wider hidden lg:block">Successfully settled</p>
                                        </div>
                                    </div>
                                </div>

                                {/* QUICK ACTIONS */}
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-900 text-sm font-bold mb-3">Financial Actions</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setIsBankModalOpen(true)}
                                            className="bg-gray-50 p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 cursor-pointer"
                                        >
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
                                            onClick={() => {
                                                setActiveTab('payouts');
                                                setSearchParams({ tab: 'payouts' });
                                            }}
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

            {/* BANK DETAILS MODAL */}
            {isBankModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="bg-[#7C3AED] px-6 py-5 text-white flex justify-between items-center relative">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-xl">
                                    <Building size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base tracking-tight">Bank Details & Verification</h3>
                                    <p className="text-white/80 text-[10px] font-medium leading-none mt-0.5">Required for registered supplier settlements</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsBankModalOpen(false)}
                                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
                            
                            {/* Alert Box */}
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5 flex gap-2.5">
                                <ShieldCheck size={16} className="text-[#7C3AED] shrink-0 mt-0.5" />
                                <p className="text-[#7C3AED] text-[11px] font-semibold leading-relaxed">
                                    Your payouts are disbursed directly to this validated bank account. To update this information, please contact our support team.
                                </p>
                            </div>
                            
                            {/* Bank details card graphic */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden border border-gray-700/50">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">Registered Bank Account</p>
                                        <h4 className="text-sm font-black mt-1.5 text-gray-150 truncate max-w-[200px]">
                                            {financialDashboard?.bankDetails?.bankName || "State Bank of India"}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-extrabold text-green-400 bg-green-950/80 px-2 py-0.5 rounded border border-green-800/30 uppercase tracking-wider">
                                            VERIFIED
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">Account Number</p>
                                        <h3 className="text-lg font-mono font-bold tracking-widest mt-1">
                                            {financialDashboard?.bankDetails?.accountNumber || "•••• •••• •••• 5678"}
                                        </h3>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                                        <div>
                                            <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">IFSC Code</p>
                                            <p className="text-xs font-mono font-bold mt-1 text-gray-200">
                                                {financialDashboard?.bankDetails?.ifsc || "SBIN0001234"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">Branch</p>
                                            <p className="text-xs font-bold mt-1 text-gray-200">
                                                {financialDashboard?.bankDetails?.branchName || "Main Branch"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Read-Only Details Grid */}
                            <div className="space-y-3">
                                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-500 text-xs font-bold">Account Holder</span>
                                    <span className="text-gray-900 text-xs font-black">
                                        {financialDashboard?.bankDetails?.accountHolderName || "Jeenora Partner Store"}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-500 text-xs font-bold">Bank Name</span>
                                    <span className="text-gray-900 text-xs font-black">
                                        {financialDashboard?.bankDetails?.bankName || "State Bank of India"}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-500 text-xs font-bold">IFSC Code</span>
                                    <span className="text-gray-900 text-xs font-mono font-black">
                                        {financialDashboard?.bankDetails?.ifsc || "SBIN0001234"}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-500 text-xs font-bold">Branch Name</span>
                                    <span className="text-gray-900 text-xs font-black">
                                        {financialDashboard?.bankDetails?.branchName || "Main Branch"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex-none">
                            <button 
                                onClick={() => setIsBankModalOpen(false)}
                                className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/10 transition-all active:scale-95 cursor-pointer text-center"
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <SupplierFooter />
        </>
    );
};

export default SupplierPayments;
