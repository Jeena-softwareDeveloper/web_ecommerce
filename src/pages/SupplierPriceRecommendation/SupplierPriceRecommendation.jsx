import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_price_recommendations } from '../../store/reducers/vendorReducer';
import { 
    ArrowLeft, TrendingUp, TrendingDown, 
    Zap, AlertCircle, ChevronRight,
    RefreshCw, Filter, Search,
    BarChart3, Target, CheckCircle2,
    ArrowRightCircle, DollarSign
} from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';

const SupplierPriceRecommendation = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { priceRecommendations, loader } = useSelector(state => state.vendor);

    useEffect(() => {
        dispatch(get_price_recommendations());
    }, [dispatch]);

    const items = priceRecommendations?.recommendations || [];
    const insights = priceRecommendations?.aiInsights || {};

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
            {/* ANDROID STYLE HEADER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#111827] shadow-lg px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4">
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                    <div>
                        <h1 className="text-white text-[20px] font-black leading-none">Price Tracker</h1>
                        <p className="text-gray-400 text-[11px] font-bold mt-1 uppercase tracking-widest">AI Recommendations</p>
                    </div>
                </div>
                <button className="p-2 bg-white/5 rounded-full text-white">
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* SPACER */}
            <div className="pt-[80px]" />

            {/* AI INSIGHT BANNER */}
            <div className="p-4">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl relative overflow-hidden">
                    <div className="flex items-start justify-between mb-6">
                        <div className="bg-indigo-50 p-3 rounded-2xl">
                            <BarChart3 size={28} className="text-[#7C3AED]" />
                        </div>
                        <div className="bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} className="text-green-600" />
                            <span className="text-green-700 text-[10px] font-black uppercase">Live Market Data</span>
                        </div>
                    </div>
                    <h2 className="text-gray-900 font-black text-[22px] leading-tight">AI Optimised Pricing</h2>
                    <p className="text-gray-500 text-[14px] font-medium mt-2 leading-relaxed">
                        Our AI models analyzed <span className="text-gray-900 font-bold">12,450+ market data points</span>. Adjusting your prices could boost your revenue by up to <span className="text-[#7C3AED] font-black">22%</span> this week.
                    </p>
                    
                    <div className="mt-8 flex gap-3">
                        <button className="flex-1 bg-[#7C3AED] text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                            Accept All
                        </button>
                        <button className="flex-1 bg-gray-50 text-gray-700 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest border border-gray-100 active:scale-95 transition-all">
                            Review Later
                        </button>
                    </div>

                    {/* DECORATIVE DOTS */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <div className="grid grid-cols-4 gap-2">
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                                <div key={i} className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* PRODUCT LIST */}
            <div className="px-4 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 text-sm font-black uppercase tracking-tight">System Suggestions</h3>
                    <span className="text-[#7C3AED] text-xs font-bold">{items.length} Pending</span>
                </div>

                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm mb-4">
                        <div className="flex gap-4">
                            <div className="w-20 h-28 bg-gray-50 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                                <img src={item.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col pt-1">
                                <h4 className="text-[14px] font-black text-gray-900 line-clamp-1">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">Current</span>
                                        <span className="text-gray-400 font-bold text-[14px] line-through">{item.currentPrice}</span>
                                    </div>
                                    <div className="w-6 flex justify-center">
                                        <ArrowRightCircle size={16} className="text-gray-200" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-[#22C55E] font-bold uppercase">Target</span>
                                        <span className="text-[#22C55E] font-black text-[18px] tracking-tight">{item.recommendedPrice}</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-[#7C3AED] bg-indigo-50 px-2 py-1.5 rounded-xl w-fit">
                                    <TrendingUp size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{item.impact}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <p className="text-[11px] text-gray-500 font-medium">
                                <AlertCircle size={12} className="inline mr-1 text-orange-400" />
                                {item.reason}
                            </p>
                            <button className="bg-indigo-50 text-[#7C3AED] px-4 py-2 rounded-xl text-[11px] font-black uppercase active:bg-[#7C3AED] active:text-white transition-colors">
                                Apply
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <SupplierFooter />
        </div>
    );
};

export default SupplierPriceRecommendation;
