import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Package, Clock, 
    CheckCircle2, Truck, Box, 
    AlertCircle, Search, RefreshCw,
    X, ShoppingBag, MapPin, ChevronRight
} from 'lucide-react';
import { toast } from "sonner";
import { get_supplier_orders, update_order_status, messageClear } from '../../store/reducers/vendorReducer';
import SupplierFooter from '../../components/layout/SupplierFooter';

const SupplierOrders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { supplierOrders: orders, loader, successMessage, errorMessage } = useSelector(state => state.vendor);

    const [activeStatus, setActiveStatus] = useState('all');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const statusTabs = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
    ];

    useEffect(() => {
        dispatch(get_supplier_orders());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            setUpdatingOrderId(null);
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
            setUpdatingOrderId(null);
        }
    }, [successMessage, errorMessage, dispatch]);

    const handleUpdateStatus = (orderId, currentStatus) => {
        let nextStatus = '';
        if (currentStatus === 'pending') nextStatus = 'confirmed';
        else if (currentStatus === 'confirmed') nextStatus = 'processing';
        else if (currentStatus === 'processing') nextStatus = 'shipped';
        else if (currentStatus === 'shipped') nextStatus = 'delivered';
        else return;

        if (window.confirm(`Move order to ${nextStatus.toUpperCase()}?`)) {
            setUpdatingOrderId(orderId);
            dispatch(update_order_status({ orderId, status: nextStatus }));
        }
    };

    const filteredOrders = activeStatus === 'all'
        ? orders
        : orders.filter(o => o.delivery_status === activeStatus);

    const StatusBadge = ({ status }) => {
        const colors = {
            pending: 'bg-orange-100 text-orange-700',
            confirmed: 'bg-purple-100 text-purple-700',
            shipped: 'bg-blue-100 text-blue-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        const colorClass = colors[status] || 'bg-gray-100 text-gray-700';
        return (
            <div className={`px-2 py-0.5 rounded ${colorClass.split(' ')[0]}`}>
                <span className={`text-[10px] font-bold uppercase ${colorClass.split(' ')[1]}`}>{status}</span>
            </div>
        );
    };

    return (
        <>
            {/* HEADER */}
            <div className="px-5 py-4 bg-white flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center">
                    <button onClick={() => navigate('/supplier-dashboard')} className="mr-4">
                        <ChevronLeft size={24} color="black" />
                    </button>
                    <span className="text-[20px] font-black text-gray-900 leading-tight">Orders Management</span>
                </div>
                <button onClick={() => dispatch(get_supplier_orders())} className={`p-1 ${loader ? 'animate-spin' : ''}`}>
                    <RefreshCw size={18} className="text-[#7C3AED]" />
                </button>
            </div>

            {/* STATUS TABS */}
            <div className="bg-white border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex px-4 py-3 gap-3">
                    {statusTabs.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveStatus(tab.value)}
                            className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all ${activeStatus === tab.value ? 'bg-[#7C3AED] text-white shadow-md shadow-indigo-100 scale-105' : 'bg-gray-100 text-gray-500'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-gray-50/50 pt-4 px-4 space-y-4 overflow-y-auto">
                {loader && orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent animate-spin rounded-full mb-4" />
                        <span className="text-gray-400 font-bold text-sm">Loading orders...</span>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(item => (
                        <motion.div 
                            layout
                            key={item._id}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden active:scale-[0.99] transition-transform"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order ID</p>
                                    <p className="text-[14px] font-black text-gray-900">#{item._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.label_url && (
                                        <a 
                                            href={item.label_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1 border border-blue-100"
                                        >
                                            <Package size={12} />
                                            <span className="text-[9px] font-black uppercase">Label</span>
                                        </a>
                                    )}
                                    <StatusBadge status={item.delivery_status} />
                                </div>
                            </div>

                            {item.is_high_risk && (
                                <div className="bg-red-50 border border-red-100 p-2 rounded-xl flex items-center gap-2">
                                    <AlertCircle size={14} className="text-red-500" />
                                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-tight">Warning: High RTO Risk Detected ({item.risk_score}%)</span>
                                </div>
                            )}

                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                                    <img src={item.products?.[0]?.images?.[0]} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[14px] font-black text-gray-800 line-clamp-1">{item.products?.[0]?.name || 'Multiple Items'}</h3>
                                    <p className="text-[12px] text-gray-500 font-medium mt-1">
                                        {item.products?.length} items • <span className="text-gray-900 font-black">₹{item.price}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                            <MapPin size={10} className="text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{item.shippingInfo?.city || 'Local'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button 
                                        onClick={() => handleUpdateStatus(item._id, item.delivery_status)}
                                        disabled={['delivered', 'cancelled'].includes(item.delivery_status) || updatingOrderId === item._id}
                                        className={`px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-tighter transition-all ${['delivered', 'cancelled'].includes(item.delivery_status) ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-[#7C3AED] border border-indigo-100 shadow-sm active:bg-[#7C3AED] active:text-white'}`}
                                    >
                                        {updatingOrderId === item._id ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            item.delivery_status === 'pending' ? 'Confirm' :
                                            item.delivery_status === 'confirmed' ? 'Start' :
                                            item.delivery_status === 'processing' ? 'Ship' :
                                            item.delivery_status === 'shipped' ? 'Deliver' : 'Done'
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                <span className="text-[10px] text-gray-400 font-bold">
                                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <button className="flex items-center gap-1 group">
                                    <span className="text-[11px] text-gray-400 font-black uppercase group-hover:text-[#7C3AED] transition-colors">Details</span>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-[#7C3AED]" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center mt-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-[18px] font-black text-gray-800 mb-2">No {activeStatus} Orders</h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">Incoming orders will appear here automatically.</p>
                    </div>
                )}
                <div className="h-24" />
            </div>

            <SupplierFooter />
        </>
    );
};

export default SupplierOrders;
