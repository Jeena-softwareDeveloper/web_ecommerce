import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_quality_dashboard_data } from '../../store/reducers/vendorReducer';
import { 
    ArrowLeft, CheckCircle2, AlertTriangle, 
    XCircle, Info, Star, 
    UserCheck, MessageSquare, ShieldCheck,
    BarChart3, RefreshCw, ChevronRight,
    Search, Filter, ThumbsUp
} from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';

const SupplierQualityDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { qualityData, loader } = useSelector(state => state.vendor);

    useEffect(() => {
        dispatch(get_quality_dashboard_data());
    }, [dispatch]);

    const metrics = qualityData?.qualityMetrics || {};
    const feedback = qualityData?.customerFeedback || [];

    const qualityMetrics = [
        { label: 'Rating', value: metrics.rating || 'N/A', sub: 'Store Average', icon: <Star size={20} className="text-yellow-500" /> },
        { label: 'RTO %', value: metrics.rtoRate || '0%', sub: 'Return to Origin', icon: <AlertTriangle size={20} className="text-orange-500" /> },
        { label: 'QC Pass', value: metrics.qcPass || '98%', sub: 'Target 95%', icon: <ShieldCheck size={20} className="text-green-500" /> },
        { label: 'Level', value: metrics.level || 'Supplier', sub: 'Partnership', icon: <UserCheck size={20} className="text-blue-500" /> }
    ];

    const recentReviews = feedback.map(f => ({
        id: f.id,
        user: f.user,
        rating: f.rating,
        comment: f.comment,
        date: new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }));

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans pb-20">
            {/* ANDROID STYLE HEADER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#065F46] shadow-lg px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4">
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                    <div>
                        <h1 className="text-white text-[20px] font-black leading-none">Quality Score</h1>
                        <p className="text-green-200 text-[11px] font-bold mt-1 uppercase tracking-widest">Performance Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 bg-white/10 rounded-full text-white">
                        <Info size={20} />
                    </button>
                </div>
            </div>

            {/* SPACER */}
            <div className="pt-[80px]" />

            {/* OVERALL SCORE RING */}
            <div className="bg-[#065F46] p-6 text-center text-white">
                <div className="w-40 h-40 border-8 border-green-400 border-t-white/10 rounded-full flex flex-col items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-[42px] font-black leading-none">{metrics.rating && metrics.rating !== 'N/A' ? (parseFloat(metrics.rating) * 20).toFixed(0) : '0'}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-1 text-green-300">Quality Score</span>
                </div>
                <p className="text-green-100 text-sm font-medium px-10 leading-relaxed">
                    Your quality score is based on <span className="font-black text-white">{feedback.length}</span> recent customer interactions.
                </p>
            </div>

            {/* CONTENT */}
            <div className="p-4 flex-1">
                {loader ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* METRICS GRID */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {qualityMetrics.map((metric, idx) => (
                                <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 group hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="bg-gray-50 p-2 rounded-xl">{metric.icon}</div>
                                        <span className="text-gray-900 font-black text-[18px]">{metric.value}</span>
                                    </div>
                                    <h4 className="text-[11px] text-gray-500 font-black uppercase tracking-widest">{metric.label}</h4>
                                    <p className="text-[#059669] text-[10px] font-bold mt-1 uppercase tracking-tighter">{metric.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* CUSTOMER REVIEWS MINI */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden mb-10">
                            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-gray-900 text-[14px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={16} className="text-[#7C3AED]" />
                                    Buyer Feedback
                                </h3>
                                <button className="text-[#7C3AED] text-[10px] font-black uppercase">View All</button>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {recentReviews.length > 0 ? (
                                    recentReviews.map((review) => (
                                        <div key={review.id} className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h5 className="text-[14px] font-black text-gray-900">{review.user || 'Customer'}</h5>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        {[1,2,3,4,5].map(i => (
                                                            <Star key={i} size={10} className={`${i <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-gray-400 text-[10px] font-bold uppercase">{review.date}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm font-medium leading-relaxed italic">"{review.comment || 'No comment provided'}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <MessageSquare size={48} className="mx-auto text-gray-200 mb-2" />
                                        <p className="text-gray-400 text-sm">No recent feedback received.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AREA FOR TIPS */}
                        <div className="bg-blue-600 rounded-3xl p-6 shadow-xl shadow-blue-200 relative overflow-hidden mb-10">
                            <div className="relative z-10">
                                <h3 className="text-white font-black text-[18px]">Boost Your Score</h3>
                                <p className="text-blue-100 text-[12px] font-medium mt-1">Faster confirmation reduces cancellations by 40%.</p>
                                <button className="bg-white text-blue-600 px-4 py-2 rounded-xl mt-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                                    Learn How
                                </button>
                            </div>
                            <CheckCircle2 size={100} className="absolute -right-6 -bottom-6 text-white/10 -rotate-12" />
                        </div>
                    </>
                )}
            </div>

            <SupplierFooter />
        </div>
    );
};

export default SupplierQualityDashboard;
