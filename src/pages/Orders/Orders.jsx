import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Package, ChevronRight, Truck, 
    CheckCircle2, XCircle, Clock, 
    Search, Filter, ArrowLeft
} from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import { get_orders, messageClear } from '../../store/reducers/orderReducer';

const Orders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, loader } = useSelector(state => state.order);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        const userId = userInfo?.id || userInfo?._id;
        if (userId) {
            dispatch(get_orders({ userId, status: 'all' }));
        }
    }, [dispatch, userInfo]);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return { 
                    bg: 'bg-green-50', 
                    text: 'text-green-700', 
                    icon: <CheckCircle2 size={12} />,
                    label: 'Delivered'
                };
            case 'cancelled':
                return { 
                    bg: 'bg-red-50', 
                    text: 'text-red-700', 
                    icon: <XCircle size={12} />,
                    label: 'Cancelled'
                };
            case 'shipped':
                return { 
                    bg: 'bg-blue-50', 
                    text: 'text-blue-700', 
                    icon: <Truck size={12} />,
                    label: 'In Transit'
                };
            default:
                return { 
                    bg: 'bg-amber-50', 
                    text: 'text-amber-700', 
                    icon: <Clock size={12} />,
                    label: status || 'Processing'
                };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-[52px] md:pt-[90px]">
            <CommonHeader title="My Orders" />

            <div className="px-4 py-6 max-w-2xl mx-auto w-full">
                {loader ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Fetching your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={48} className="text-gray-200" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
                        <p className="text-gray-400 text-sm font-normal mb-10">Looks like you haven't placed any orders yet.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-[#e11955] text-white font-medium px-10 py-4 rounded-lg shadow-lg shadow-rose-100 uppercase tracking-widest text-xs hover:scale-105 transition-transform active:scale-95"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {orders.map((order, idx) => {
                            const status = getStatusStyle(order.delivery_status);
                            const orderDate = new Date(order.date || order.createdAt);
                            const totalQty = order.products.reduce((acc, p) => acc + (p.quantity || 1), 0);
                            const firstProductName = order.products[0]?.name || order.products[0]?.productName || 'Product';
                            
                            return (
                                <motion.div 
                                    key={order._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/order-details/${order._id}`)}
                                    className="bg-white px-3 py-4 cursor-pointer border-b border-gray-300 hover:bg-gray-50/50 transition-all active:scale-[0.99] group first:rounded-t-2xl last:rounded-b-2xl last:border-b-0"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="w-14 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                            <img 
                                                src={order.products[0]?.images?.[0] || order.products[0]?.image || '/placeholder.jpg'} 
                                                alt="prod" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Order ID</span>
                                                    <h4 className="text-xs font-bold text-secondary tracking-tight">#{order._id.slice(-8).toUpperCase()}</h4>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${status.bg}`}>
                                                    <span className={status.text}>{status.icon}</span>
                                                    <span className={`text-[8px] font-bold uppercase tracking-wider ${status.text}`}>{status.label}</span>
                                                </div>
                                            </div>

                                            <h5 className="text-sm font-bold text-gray-900 truncate mb-1">
                                                {firstProductName}
                                                {order.products.length > 1 && <span className="text-gray-400 font-medium text-xs"> + {order.products.length - 1} more</span>}
                                            </h5>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                        Qty: {totalQty}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                        {orderDate.toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-black text-primary tracking-tight">₹{order.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
