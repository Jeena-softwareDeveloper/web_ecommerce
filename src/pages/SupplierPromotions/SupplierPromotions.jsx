import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_promotions_data, get_my_catalogs } from '../../store/reducers/vendorReducer';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Tag, Megaphone, Calendar, 
    Users, TrendingUp, Percent, Clock,
    Filter, RefreshCw, Plus, Edit,
    Eye, MoreVertical, Download, CheckCircle,
    XCircle, AlertCircle, BarChart3, ChevronRight,
    IndianRupee, Search, Target, Zap
} from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';
import { toast } from "sonner";

const SupplierPromotions = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { promotionsData, myCatalogs, loader } = useSelector(state => state.vendor);
    
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'upcoming', 'past', 'analytics'
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        search: '',
        dateRange: 'this_month'
    });

    useEffect(() => {
        fetchPromotionsData();
    }, [dispatch]);

    const fetchPromotionsData = () => {
        dispatch(get_promotions_data());
        dispatch(get_my_catalogs());
    };

    const promoStats = promotionsData?.stats || {
        activeCount: 0,
        avgDiscount: 0,
        salesUplift: 0,
        totalReach: 0
    };

    const promotionsList = promotionsData?.promotions || [];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const PromotionCard = ({ promotion }) => {
        const isActive = promotion.status === 'active';
        const isUpcoming = promotion.status === 'upcoming';
        const isPast = promotion.status === 'past';
        
        return (
            <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">{promotion.name}</h4>
                                <p className="text-gray-500 text-xs">{promotion.type}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-700' : isUpcoming ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {promotion.status}
                                </span>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                    <MoreVertical size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-gray-500 text-[10px] font-bold">Discount</p>
                                <p className="text-gray-900 text-sm font-black">{promotion.discount}%</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-gray-500 text-[10px] font-bold">Sales Uplift</p>
                                <p className="text-gray-900 text-sm font-black">+{promotion.salesUplift}%</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-gray-400" />
                                <span className="text-gray-500 text-xs">
                                    {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={12} className="text-gray-400" />
                                <span className="text-gray-500 text-xs">{promotion.reach} reached</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">
                                    {promotion.products} products
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="text-[#7C3AED] text-xs font-bold flex items-center">
                                    <Eye size={12} className="mr-1" />
                                    View
                                </button>
                                {isActive && (
                                    <button className="text-red-600 text-xs font-bold flex items-center">
                                        <XCircle size={12} className="mr-1" />
                                        End
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                            <h1 className="text-[18px] font-black text-gray-900 leading-tight">Promotions</h1>
                            <p className="text-gray-500 text-[12px]">Boost sales with campaigns & offers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchPromotionsData}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={loading}
                        >
                            <RefreshCw size={20} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Filter size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-100">
                    {['active', 'upcoming', 'past', 'analytics'].map((tab) => (
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

            {/* QUICK STATS */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-500 text-[11px] font-bold">Active Promos</p>
                            <Zap size={16} className="text-yellow-500" />
                        </div>
                        <p className="text-gray-900 text-[18px] font-black">{promoStats.activeCount}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-500 text-[11px] font-bold">Avg. Discount</p>
                            <Percent size={16} className="text-green-500" />
                        </div>
                        <p className="text-gray-900 text-[18px] font-black">{promoStats.avgDiscount}%</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-500 text-[11px] font-bold">Sales Uplift</p>
                            <TrendingUp size={16} className="text-blue-500" />
                        </div>
                        <p className="text-gray-900 text-[18px] font-black">+{promoStats.salesUplift}%</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-500 text-[11px] font-bold">Total Reach</p>
                            <Users size={16} className="text-purple-500" />
                        </div>
                        <p className="text-gray-900 text-[18px] font-black">{promoStats.totalReach >= 1000 ? `${(promoStats.totalReach/1000).toFixed(1)}K` : promoStats.totalReach}</p>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 flex-1">
                {loader ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* ACTIVE/UPCOMING/PAST TABS */}
                        {['active', 'upcoming', 'past'].includes(activeTab) && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-900 text-sm font-bold">
                                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Promotions
                                        </h3>
                                        <button className="bg-[#7C3AED] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center">
                                            <Plus size={14} className="mr-1" />
                                            Create Promotion
                                        </button>
                                    </div>
                                    
                                    {promotionsList.length > 0 ? (
                                        promotionsList
                                            .filter(p => p.status === activeTab || (activeTab === 'past' && p.status === 'expired'))
                                            .map((promo, index) => (
                                                <PromotionCard key={index} promotion={promo} />
                                            ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <Megaphone size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No {activeTab} promotions found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ANALYTICS TAB */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-900 text-sm font-bold mb-4">Promotion Analytics</h3>
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                            <BarChart3 size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">Detailed analytics will be available after your first successful campaign.</p>
                                        </div>
                                    </div>
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

export default SupplierPromotions;
