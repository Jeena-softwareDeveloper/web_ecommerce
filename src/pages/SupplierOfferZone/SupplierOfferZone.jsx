import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_offer_zone_data } from '../../store/reducers/vendorReducer';
import { 
    ArrowLeft, Megaphone, Zap, 
    Gift, Timer, Percent, 
    ChevronRight, Plus, RefreshCw,
    Search, Filter, ShoppingBag,
    TrendingUp, Star, AlertCircle
} from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';
import { toast } from "sonner";

const SupplierOfferZone = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { offerZoneData, loader } = useSelector(state => state.vendor);

    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        dispatch(get_offer_zone_data());
    }, [dispatch]);

    const offers = offerZoneData?.offers || [];
    const stats_data = offerZoneData?.analytics || {};

    const offerStats = [
        { label: 'Active Offers', value: '12', icon: <Zap size={16} className="text-yellow-500" /> },
        { label: 'Total Revenue', value: '₹45.2K', icon: <TrendingUp size={16} className="text-green-500" /> },
        { label: 'Conversion', value: '4.8%', icon: <Star size={16} className="text-purple-500" /> },
        { label: 'Pending', value: '2', icon: <Timer size={16} className="text-blue-500" /> }
    ];

    const mockOffers = [
        { 
            id: 1, 
            title: 'Flash Sale: Summer Collection', 
            discount: '25% OFF', 
            status: 'Active', 
            endDate: 'Ends in 4h 20m',
            items: 8,
            views: 450
        },
        { 
            id: 2, 
            title: 'Weekend Special: Traditional Wear', 
            discount: '₹200 Flat OFF', 
            status: 'Scheduled', 
            endDate: 'Starts on Sat',
            items: 15,
            views: 0
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
            {/* ANDROID STYLE HEADER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#7C3AED] shadow-lg px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4">
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                    <div>
                        <h1 className="text-white text-[20px] font-black leading-none">Offer Zone</h1>
                        <p className="text-white/70 text-[11px] font-bold mt-1 uppercase tracking-widest">Store Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 bg-white/10 rounded-full text-white">
                        <Search size={20} />
                    </button>
                    <button className="p-2 bg-white/10 rounded-full text-white">
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* SPACER */}
            <div className="pt-[80px]" />

            {/* STATS STRIP */}
            <div className="bg-white px-2 py-4 shadow-sm border-b border-gray-100 overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-2">
                    {[
                        { label: 'Active Offers', value: offers.filter(o => o.status === 'active').length, icon: <Zap size={16} className="text-yellow-500" /> },
                        { label: 'Total Revenue', value: stats_data.totalRevenue || '₹0', icon: <TrendingUp size={16} className="text-green-500" /> },
                        { label: 'Conversion', value: stats_data.convRate || '0%', icon: <Star size={16} className="text-purple-500" /> },
                        { label: 'Pending', value: stats_data.pending || '0', icon: <Timer size={16} className="text-blue-500" /> }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-gray-50 min-w-[120px] p-3 rounded-2xl border border-gray-100 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-tight">{stat.label}</span>
                                {stat.icon}
                            </div>
                            <span className="text-gray-900 text-[16px] font-black">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* QUICK BANNER */}
            <div className="p-4">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-5 relative overflow-hidden shadow-xl shadow-rose-200">
                    <div className="relative z-10">
                        <h2 className="text-white font-black text-[22px] leading-tight">Create High Conversion Offers</h2>
                        <p className="text-white/80 text-[13px] font-bold mt-2">Boost your store visibility by up to 300%</p>
                        <button className="bg-white text-rose-500 px-5 py-2.5 rounded-xl mt-4 font-black text-[12px] uppercase tracking-tighter shadow-lg shadow-rose-900/20 active:scale-95 transition-all">
                            Browse Templates
                        </button>
                    </div>
                    <Megaphone size={120} className="absolute -right-8 -bottom-8 text-white/10 rotate-[15deg]" />
                </div>
            </div>

            {/* TABS */}
            <div className="flex bg-white px-4 border-b border-gray-100 sticky top-[80px] z-40">
                {['active', 'scheduled', 'expired'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-[#7C3AED] border-b-4 border-[#7C3AED]' : 'text-gray-400'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="p-4 flex-1">
                {loader ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {offers.filter(o => o.status === activeTab).length > 0 ? (
                            offers.filter(o => o.status === activeTab).map((offer, idx) => (
                                <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-4 relative overflow-hidden group active:scale-[0.98] transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-yellow-100 p-2 rounded-xl">
                                                <Gift size={20} className="text-yellow-600" />
                                            </div>
                                            <h3 className="text-gray-900 font-black text-[16px] tracking-tight">{offer.name}</h3>
                                        </div>
                                        <button className="p-2 bg-gray-50 rounded-full text-gray-400">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Benefit</span>
                                            <span className="text-[#22C55E] font-black text-[22px] tracking-tighter">{offer.type === 'Bundled' ? 'B1G1' : (offer.type || 'OFF')}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Linked Products</span>
                                            <span className="text-gray-900 font-black text-[18px] block">{offer.products} Items</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${offer.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                                            <span className="text-[10px] font-black uppercase">{offer.status}</span>
                                        </div>
                                        <span className="text-gray-400 font-bold text-[12px]">{offer.type}</span>
                                    </div>

                                    <div className={`absolute top-0 right-0 w-2 h-full ${offer.status === 'active' ? 'bg-green-400' : 'bg-blue-400'}`} />
                                </div>
                            ))
                        ) : (
                            <div className="mt-10 mb-20 text-center px-10">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus size={24} className="text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-bold text-sm">No {activeTab} offers found. Create more offers to increase your shop ranking.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <SupplierFooter />
        </div>
    );
};

export default SupplierOfferZone;
