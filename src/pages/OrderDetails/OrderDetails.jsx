import React, { useEffect } from 'react';
import { toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Package, MapPin, 
    CreditCard, Clock, CheckCircle2, 
    XCircle, Truck, Info, AlertTriangle,
    ShoppingBag, Phone, Share2
} from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import { get_order_details, cancel_order, messageClear } from '../../store/reducers/orderReducer';

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { orderDetails: order, loader, successMessage, errorMessage } = useSelector(state => state.order);

    useEffect(() => {
        dispatch(get_order_details(orderId));
    }, [dispatch, orderId]);

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

    const handleCancelOrder = () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            dispatch(cancel_order(orderId));
        }
    };

    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 size={24} />, step: 4 };
            case 'shipped':
                return { color: 'text-blue-600', bg: 'bg-blue-100', icon: <Truck size={24} />, step: 3 };
            case 'confirmed':
                return { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: <Package size={24} />, step: 2 };
            case 'cancelled':
                return { color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={24} />, step: 0 };
            default:
                return { color: 'text-amber-600', bg: 'bg-amber-100', icon: <Clock size={24} />, step: 1 };
        }
    };

    if (loader && !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col pt-[52px] md:pt-[90px]">
                <CommonHeader title="Order Details" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col pt-[52px] md:pt-[90px]">
                <CommonHeader title="Order Details" />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Info size={48} className="text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
                    <button onClick={() => navigate('/orders')} className="mt-4 text-primary font-bold">Back to Orders</button>
                </div>
            </div>
        );
    }

    const currentStatus = getStatusInfo(order.delivery_status);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-[52px] md:pt-[90px] pb-20">
            <CommonHeader title={`Order #${order._id.slice(-8).toUpperCase()}`} />

            <div className="max-w-3xl mx-auto w-full px-4 py-6">
                
                {/* Status Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`${currentStatus.bg} ${currentStatus.color} p-4 rounded-2xl`}>
                                {currentStatus.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-secondary tracking-tight uppercase">
                                    {order.delivery_status}
                                </h3>
                                <p className="text-xs font-medium text-gray-400">Order placed on {new Date(order.date || order.createdAt).toLocaleDateString()} at {new Date(order.date || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <button className="p-2 bg-gray-50 rounded-full text-gray-400">
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* Timeline */}
                    {order.delivery_status !== 'cancelled' ? (
                        <div className="relative flex justify-between items-center px-2">
                            <div className="absolute left-8 right-8 h-[2px] bg-gray-100 top-4 -z-0"></div>
                            <div className={`absolute left-8 h-[2px] bg-green-500 top-4 -z-0 transition-all duration-1000`} style={{ width: `${(currentStatus.step - 1) * 33.33}%` }}></div>
                            
                            {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((label, i) => (
                                <div key={label} className="flex flex-col items-center z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${currentStatus.step > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        {currentStatus.step > i ? <CheckCircle2 size={14} /> : (i + 1)}
                                    </div>
                                    <span className={`text-[10px] mt-2 font-bold uppercase tracking-tighter ${currentStatus.step > i ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-3 border border-red-100 mt-2">
                            <AlertTriangle size={20} className="text-red-500" />
                            <p className="text-red-700 text-xs font-bold">This order has been cancelled and a refund is being processed.</p>
                        </div>
                    )}
                </div>

                {/* Live Tracking Section */}
                {order.awb_number && (
                    <div className="mb-8 bg-white border border-blue-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600">
                                <Truck size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Shiprocket Tracking</span>
                                <h4 className="text-[14px] font-black text-gray-800 uppercase tracking-tight mt-0.5">Live Delivery Status</h4>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Tracking ID (AWB)</span>
                                <p className="text-lg font-black text-secondary tracking-widest mt-1">{order.awb_number}</p>
                            </div>
                            <a 
                                href={`https://shiprocket.co/tracking/${order.awb_number}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all text-center active:scale-95"
                            >
                                Track Package
                            </a>
                        </div>
                    </div>
                )}

                {/* Items Section */}
                <div className="mb-10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-gray-400" />
                        <span className="text-[12px] font-bold text-gray-800 uppercase tracking-widest">Order Items ({order.products.length})</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {order.products.map((item, idx) => (
                            <div key={idx} className="p-6 flex gap-4">
                                <img 
                                    src={item.images?.[0] || item.image || '/placeholder.jpg'} 
                                    className="w-20 h-24 rounded-2xl bg-gray-50 object-cover shadow-sm" 
                                    alt="prod" 
                                />
                                <div className="flex-1 py-1">
                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 mb-1">{item.name || item.productName || 'Product'}</h4>
                                    <div className="flex gap-2 mb-3">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500 uppercase tracking-widest">SIZE: {item.size || 'Free'}</span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500 uppercase tracking-widest">QTY: {item.quantity}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-secondary tracking-tighter">₹{item.price || order.price}</span>
                                        {item.mrp > item.price && (
                                            <span className="text-xs text-gray-400 line-through font-medium">₹{item.mrp}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping & Payment Card */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={18} className="text-primary" />
                            <span className="text-[12px] font-black text-gray-800 uppercase tracking-widest">Shipping Address</span>
                        </div>
                        <p className="text-sm font-bold text-secondary mb-1">{order.shippingInfo?.name}</p>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            {order.shippingInfo?.houseNo}, {order.shippingInfo?.area}<br />
                            {order.shippingInfo?.city}, {order.shippingInfo?.state} - {order.shippingInfo?.pincode}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-primary">
                            <Phone size={14} />
                            <span className="text-xs font-bold">{order.shippingInfo?.phone}</span>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard size={18} className="text-primary" />
                            <span className="text-[12px] font-black text-gray-800 uppercase tracking-widest">Payment Info</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-400">Method</span>
                            <span className="text-xs font-black text-secondary uppercase tracking-widest">{order.payment_status === 'paid' ? 'Online' : 'Cash on Delivery'}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-400">Status</span>
                            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {order.payment_status}
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                            <span className="text-xs font-medium text-gray-400">Total Charged</span>
                            <span className="text-sm font-bold text-secondary tracking-tight">₹{order.price}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    {['pending', 'confirmed', 'processing', 'placed'].includes(order.delivery_status?.toLowerCase()) && (
                        <button 
                            onClick={handleCancelOrder}
                            className="w-full bg-white border-2 border-red-100 py-4 rounded-2xl text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors"
                        >
                            Cancel Order
                        </button>
                    )}
                    <button 
                        onClick={() => navigate('/support')}
                        className="w-full bg-secondary py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"
                    >
                        Need Help? Chat with Us
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderDetails;
