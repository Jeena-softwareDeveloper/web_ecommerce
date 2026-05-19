import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Package, Clock, 
    CheckCircle2, Truck, Box, 
    AlertCircle, Search, RefreshCw,
    X, ShoppingBag, MapPin, ChevronRight,
    Printer, FileText, User, Timer,
    ThumbsUp, ThumbsDown, AlertTriangle
} from 'lucide-react';
import { toast } from "sonner";
import { 
    get_supplier_orders, update_order_status, 
    get_b2b_orders, accept_b2b_order, reject_b2b_order, 
    update_b2b_status, get_rejection_reasons, messageClear 
} from '../../store/reducers/vendorReducer';
import SupplierFooter from '../../components/layout/SupplierFooter';
import ConfirmModal from '../../components/supplier/ConfirmModal';
import InvoiceTemplate from '../../components/supplier/InvoiceTemplate';
import ReactDOMServer from 'react-dom/server';
import ResponsiveTable from '../../components/common/ResponsiveTable';

// ── 48hr Countdown Timer Component ──────────────────────────────────────────
const CountdownTimer = ({ deadline }) => {
    const calcTimeLeft = useCallback(() => {
        if (!deadline) return { hours: 0, minutes: 0, seconds: 0, total: 0 };
        const total = Math.max(0, new Date(deadline).getTime() - Date.now());
        const hours = Math.floor(total / (1000 * 60 * 60));
        const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((total % (1000 * 60)) / 1000);
        return { hours, minutes, seconds, total };
    }, [deadline]);

    const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [calcTimeLeft]);

    if (timeLeft.total <= 0) {
        return (
            <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                <Timer size={14} />
                <span className="text-[11px] font-black uppercase">Expired</span>
            </div>
        );
    }

    // Color based on urgency
    const totalHours = timeLeft.hours + timeLeft.minutes / 60;
    const colorClass = totalHours > 24 ? 'text-green-600 bg-green-50 border-green-200' : 
                       totalHours > 12 ? 'text-amber-600 bg-amber-50 border-amber-200' : 
                       'text-red-600 bg-red-50 border-red-200';

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${colorClass}`}>
            <Timer size={14} />
            <span className="text-[11px] font-black font-mono tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
        </div>
    );
};

// ── Rejection Reason Modal ──────────────────────────────────────────────────
const REJECT_REASONS = [
    { code: 'OUT_OF_STOCK', label: 'Out of Stock' },
    { code: 'PRICING_ERROR', label: 'Pricing Error' },
    { code: 'UNABLE_TO_FULFILL', label: 'Cannot Fulfill' },
    { code: 'LOGISTICS_ISSUE', label: 'Logistics Issue' },
    { code: 'OTHER', label: 'Other' }
];

const SupplierOrders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { 
        supplierOrders: orders, supplierData, loader, successMessage, errorMessage,
        b2bOrders, b2bLoader, rejectionReasons
    } = useSelector(state => state.vendor);

    // Tab: 'b2c' or 'b2b'
    const [orderType, setOrderType] = useState('b2c');
    const [activeStatus, setActiveStatus] = useState('all');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    // Modals
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    // B2B Reject Modal
    const [rejectOrderId, setRejectOrderId] = useState(null);
    const [rejectReasonCode, setRejectReasonCode] = useState('');
    const [rejectReasonText, setRejectReasonText] = useState('');

    const b2bStatusTabs = [
        { label: 'All', value: 'all' },
        { label: 'New', value: 'paid' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
    ];

    const b2cStatusTabs = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
    ];

    const b2cColumns = [
        {
            key: '_id',
            label: 'Order ID',
            render: (row) => (
                <div>
                    <span className="text-[13px] font-black text-gray-900">#{row._id.slice(-8).toUpperCase()}</span>
                    {row.is_high_risk && (
                        <span className="block text-[9px] font-bold text-red-500 uppercase mt-0.5 animate-pulse">High RTO Risk</span>
                    )}
                </div>
            )
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (row) => (
                <span className="text-xs text-gray-500 font-bold">
                    {new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (row) => (
                <div>
                    <p className="text-xs font-bold text-gray-800">{row.shippingInfo?.name || 'Customer'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{row.shippingInfo?.city || 'Local'}</p>
                </div>
            )
        },
        {
            key: 'products',
            label: 'Product Info',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.products?.[0]?.images?.[0] && (
                        <img src={row.products[0].images[0]} className="w-8 h-8 rounded object-cover bg-gray-100 shrink-0" />
                    )}
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate max-w-[150px]">{row.products?.[0]?.name || 'Item'}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{row.products?.length || 1} items</p>
                    </div>
                </div>
            )
        },
        {
            key: 'price',
            label: 'Amount',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-900">₹{row.partnerAmount || row.price}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{row.payment_status === 'paid' ? 'PREPAID' : 'COD'}</span>
                </div>
            )
        },
        {
            key: 'delivery_status',
            label: 'Status',
            render: (row) => {
                const colors = { pending: 'bg-orange-100 text-orange-700', confirmed: 'bg-purple-100 text-purple-700', shipped: 'bg-blue-100 text-blue-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
                const colorClass = colors[row.delivery_status] || 'bg-gray-100 text-gray-700';
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${colorClass}`}>
                        {row.delivery_status}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Action',
            render: (row) => {
                const isUpdating = updatingOrderId === row._id;
                return (
                    <div className="flex items-center gap-2">
                        {row.delivery_status === 'pending' ? (
                            <>
                                <button 
                                    onClick={() => handleUpdateStatus(row._id, 'pending')} 
                                    disabled={isUpdating} 
                                    className="px-3 py-1.5 rounded-lg font-black text-[10px] uppercase bg-indigo-50 text-[#7C3AED] border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                >
                                    {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : 'Confirm'}
                                </button>
                                <button 
                                    onClick={() => setCancelOrderId(row._id)} 
                                    disabled={isUpdating} 
                                    className="px-3 py-1.5 rounded-lg font-black text-[10px] uppercase bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => handleUpdateStatus(row._id, row.delivery_status)} 
                                disabled={['delivered', 'cancelled'].includes(row.delivery_status) || isUpdating} 
                                className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase transition-colors ${
                                    ['delivered', 'cancelled'].includes(row.delivery_status) 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-indigo-50 text-[#7C3AED] border border-indigo-100 hover:bg-indigo-100'
                                }`}
                            >
                                {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : 
                                 row.delivery_status === 'confirmed' || row.delivery_status === 'processing' ? 'Ship' : 
                                 row.delivery_status === 'shipped' ? 'Deliver' : 'Done'}
                            </button>
                        )}
                        <button 
                            onClick={() => handlePrintInvoice(row)} 
                            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-150 text-gray-500 transition-colors"
                            title="Print Invoice"
                        >
                            <Printer size={14} />
                        </button>
                    </div>
                );
            }
        }
    ];

    const b2bColumns = [
        {
            key: '_id',
            label: 'Order ID',
            render: (row) => (
                <div>
                    <span className="text-[13px] font-black text-gray-900">#{row._id.slice(-8).toUpperCase()}</span>
                    {row.autoCancelled && (
                        <span className="block text-[9px] font-bold text-red-500 uppercase mt-0.5">Auto-Cancelled</span>
                    )}
                </div>
            )
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (row) => (
                <span className="text-xs text-gray-500 font-bold">
                    {new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        {
            key: 'customer',
            label: 'Buyer',
            render: (row) => (
                <div>
                    <p className="text-xs font-bold text-gray-800">{row.shippingInfo?.name || 'Buyer'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{row.shippingInfo?.city || 'Local'}</p>
                </div>
            )
        },
        {
            key: 'products',
            label: 'Product Info',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    {row.products?.slice(0, 2).map((p, idx) => (
                        <span key={idx} className="text-xs font-bold text-gray-700 block truncate max-w-[160px]">
                            {p.productName || p.name} x{p.quantity}
                        </span>
                    ))}
                    {(row.products?.length || 0) > 2 && (
                        <span className="text-[9px] text-gray-400 font-bold">+{row.products.length - 2} more items</span>
                    )}
                </div>
            )
        },
        {
            key: 'price',
            label: 'Amount',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-900">₹{row.price}</span>
                    {row.gst_amount > 0 && <span className="text-[9px] font-bold text-gray-400">incl. GST ₹{row.gst_amount}</span>}
                </div>
            )
        },
        {
            key: 'b2b_status',
            label: 'Status',
            render: (row) => {
                const colors = { paid: 'bg-blue-100 text-blue-700', accepted: 'bg-purple-100 text-purple-700', packed: 'bg-purple-100 text-purple-700', shipped: 'bg-indigo-100 text-indigo-700', delivered: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', cancelled: 'bg-red-100 text-red-700' };
                const colorClass = colors[row.b2b_status] || 'bg-gray-100 text-gray-700';
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${colorClass}`}>
                        {row.b2b_status}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Action',
            render: (row) => {
                const isUpdating = updatingOrderId === row._id;
                
                if (row.b2b_status === 'paid' && !row.isExpired && !row.autoCancelled) {
                    return (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAcceptB2B(row._id)}
                                disabled={isUpdating}
                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-[10px] font-black uppercase hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : 'Accept'}
                            </button>
                            <button
                                onClick={() => setRejectOrderId(row._id)}
                                disabled={isUpdating}
                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>
                    );
                }

                if (['accepted', 'packed', 'shipped'].includes(row.b2b_status)) {
                    return (
                        <button
                            onClick={() => handleB2BNextStatus(row)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : 
                             row.b2b_status === 'accepted' ? 'Pack' :
                             row.b2b_status === 'packed' ? 'Ship' : 'Deliver'}
                        </button>
                    );
                }

                return (
                    <div className="flex items-center gap-2">
                        {row.b2b_status === 'delivered' && (
                            <button 
                                onClick={() => handlePrintInvoice(row)} 
                                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-150 text-gray-500 transition-colors"
                                title="Print Invoice"
                            >
                                <Printer size={14} />
                            </button>
                        )}
                        {row.b2b_status === 'rejected' && (
                            <span className="text-[10px] font-bold text-gray-400">Rejected</span>
                        )}
                        {row.autoCancelled && (
                            <span className="text-[10px] font-bold text-red-400">Auto-Cancelled</span>
                        )}
                    </div>
                );
            }
        }
    ];

    useEffect(() => {
        if (orderType === 'b2c') {
            dispatch(get_supplier_orders());
        } else {
            dispatch(get_b2b_orders(activeStatus));
            dispatch(get_rejection_reasons());
        }
    }, [dispatch, orderType, activeStatus]);

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

    // ── B2C Handlers ──
    const handleUpdateStatus = (orderId, targetStatus) => {
        if (targetStatus === 'cancelled') {
            if (!cancelReason.trim()) return toast.error('Please provide a reason for cancellation');
            setUpdatingOrderId(orderId);
            dispatch(update_order_status({ orderId, status: 'cancelled', reason: cancelReason }));
            setCancelOrderId(null);
            setCancelReason('');
            return;
        }

        let nextStatus = '';
        if (targetStatus === 'pending') nextStatus = 'confirmed';
        else if (targetStatus === 'confirmed') nextStatus = 'shipped';
        else if (targetStatus === 'processing') nextStatus = 'shipped';
        else if (targetStatus === 'shipped') nextStatus = 'delivered';
        else return;

        setConfirmAction({ orderId, nextStatus });
    };

    const proceedUpdateStatus = () => {
        if (confirmAction) {
            setUpdatingOrderId(confirmAction.orderId);
            dispatch(update_order_status({ orderId: confirmAction.orderId, status: confirmAction.nextStatus }));
            setConfirmAction(null);
        }
    };

    // ── B2B Handlers ──
    const handleAcceptB2B = (orderId) => {
        setUpdatingOrderId(orderId);
        dispatch(accept_b2b_order(orderId));
    };

    const handleRejectB2B = () => {
        if (!rejectOrderId || !rejectReasonCode) return toast.error('Select a rejection reason');
        setUpdatingOrderId(rejectOrderId);
        dispatch(reject_b2b_order({ 
            orderId: rejectOrderId, 
            reasonCode: rejectReasonCode,
            reasonText: rejectReasonText || REJECT_REASONS.find(r => r.code === rejectReasonCode)?.label
        }));
        setRejectOrderId(null);
        setRejectReasonCode('');
        setRejectReasonText('');
    };

    const handleB2BNextStatus = (order) => {
        let nextStatus = '';
        if (order.b2b_status === 'accepted') nextStatus = 'packed';
        else if (order.b2b_status === 'packed') nextStatus = 'shipped';
        else if (order.b2b_status === 'shipped') nextStatus = 'delivered';
        else return;

        setUpdatingOrderId(order._id);
        dispatch(update_b2b_status({ orderId: order._id, status: nextStatus }));
    };

    // ── Invoice Print ──
    const handlePrintInvoice = (order) => {
        const invoiceHtml = ReactDOMServer.renderToString(
            <InvoiceTemplate order={order} supplier={supplierData} />
        );
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(node => node.outerHTML)
            .join('');

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice - ${order._id}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                        @page { size: A4; margin: 15mm; }
                        body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    </style>
                    ${styles}
                </head>
                <body>${invoiceHtml}</body>
            </html>
        `);
        doc.close();
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 1000);
    };

    // ── Filter data ──
    const currentOrders = orderType === 'b2c' ? orders : b2bOrders;
    const isLoading = orderType === 'b2c' ? loader : b2bLoader;

    const filteredOrders = orderType === 'b2c'
        ? (activeStatus === 'all' ? currentOrders : currentOrders.filter(o => o.delivery_status === activeStatus))
        : currentOrders; // Already filtered by API

    // ── B2B first-fold card ──
    const B2BCard = ({ item }) => {
        const isNew = item.b2b_status === 'paid';
        const isAccepted = item.b2b_status === 'accepted' || item.b2b_status === 'packed';
        const isDeliveredOrCancelled = ['delivered', 'cancelled', 'rejected'].includes(item.b2b_status);

        return (
            <motion.div layout className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* ── FIRST FOLD: Essential info visible without scroll ── */}
                <div className="p-4 space-y-3">
                    {/* Header: Order ID + Timer */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">B2B Order</p>
                            <p className="text-[14px] font-black text-gray-900">#{item._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* 48hr Countdown Timer — only show for 'paid' (new) orders */}
                            {item.b2b_status === 'paid' && !item.isExpired && (
                                <CountdownTimer deadline={item.acceptDeadline} />
                            )}
                            {item.autoCancelled && (
                                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                                    <AlertTriangle size={14} />
                                    <span className="text-[10px] font-black uppercase">Auto-Cancelled</span>
                                </div>
                            )}
                            {item.b2b_status === 'rejected' && (
                                <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                                    <ThumbsDown size={14} />
                                    <span className="text-[10px] font-black uppercase">Rejected</span>
                                </div>
                            )}
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                isNew ? 'bg-blue-100 text-blue-700' : 
                                isAccepted ? 'bg-purple-100 text-purple-700' :
                                item.b2b_status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                                item.b2b_status === 'delivered' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {item.b2b_status}
                            </span>
                        </div>
                    </div>

                    {/* Items List + Total Amount */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        {item.products?.slice(0, 3).map((prod, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                    {prod.images?.[0] && (
                                        <img src={prod.images[0]} className="w-8 h-8 rounded object-cover bg-gray-200 shrink-0" />
                                    )}
                                    <span className="truncate font-medium text-gray-700">
                                        {prod.productName || prod.name || 'Item'}
                                        <span className="text-gray-400 ml-1">x{prod.quantity || 1}</span>
                                    </span>
                                </div>
                                <span className="font-black text-gray-800 ml-2">₹{prod.discountPrice || prod.price || 0}</span>
                            </div>
                        ))}
                        {(item.products?.length || 0) > 3 && (
                            <p className="text-[10px] text-gray-400 font-medium text-center">
                                +{item.products.length - 3} more items
                            </p>
                        )}
                    </div>

                    {/* Total + GST */}
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            {item.gst_amount > 0 && (
                                <span className="text-[10px]">(incl. GST ₹{item.gst_amount})</span>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-medium">Total</span>
                            <p className="text-lg font-black text-gray-900">₹{item.price}</p>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex items-start gap-2 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                        <MapPin size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-gray-700">
                                {item.shippingInfo?.name || 'Buyer'}
                            </p>
                            <p className="text-[10px] text-gray-500 leading-tight">
                                {item.shippingInfo?.address}, {item.shippingInfo?.city}, {item.shippingInfo?.state} - {item.shippingInfo?.pincode}
                            </p>
                            {item.shippingInfo?.phone && (
                                <p className="text-[10px] text-indigo-600 font-medium mt-0.5">📞 {item.shippingInfo.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* ── ACCEPT / REJECT BUTTONS — for 'paid' status ── */}
                    {item.b2b_status === 'paid' && !item.isExpired && !item.autoCancelled && (
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => handleAcceptB2B(item._id)}
                                disabled={updatingOrderId === item._id}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-200 disabled:opacity-50"
                            >
                                {updatingOrderId === item._id ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <><ThumbsUp size={16} /> Accept Order</>
                                )}
                            </button>
                            <button
                                onClick={() => setRejectOrderId(item._id)}
                                disabled={updatingOrderId === item._id}
                                className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
                            >
                                <ThumbsDown size={16} /> Reject
                            </button>
                        </div>
                    )}

                    {/* Expired / Auto-cancelled banner */}
                    {item.autoCancelled && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <div>
                                <p className="text-[11px] font-black text-red-700">Order Auto-Cancelled</p>
                                <p className="text-[10px] text-red-500">Partner did not respond within 48 hours. Buyer has been refunded.</p>
                            </div>
                        </div>
                    )}

                    {/* Next status button for accepted/packed/shipped */}
                    {['accepted', 'packed', 'shipped'].includes(item.b2b_status) && (
                        <button
                            onClick={() => handleB2BNextStatus(item)}
                            disabled={updatingOrderId === item._id}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            {updatingOrderId === item._id ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : item.b2b_status === 'accepted' ? 'Mark as Packed' :
                               item.b2b_status === 'packed' ? 'Mark as Shipped' : 'Mark as Delivered'}
                        </button>
                    )}

                    {/* Rejected info */}
                    {item.b2b_status === 'rejected' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                            <p className="text-[11px] font-medium text-orange-700">
                                Reason: {item.rejection_reason_code} — {item.rejection_reason_text}
                            </p>
                            {item.refund_amount > 0 && (
                                <p className="text-[10px] text-orange-500 mt-1">Refund initiated: ₹{item.refund_amount}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer: Date + Actions */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2">
                        {item.b2b_status === 'delivered' && (
                            <button onClick={() => handlePrintInvoice(item)} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100">
                                <FileText size={10} />
                                <span className="text-[9px] font-black uppercase">Invoice</span>
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    const B2CCard = ({ item }) => (
        <motion.div layout className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden active:scale-[0.99] transition-transform">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order ID</p>
                    <p className="text-[14px] font-black text-gray-900">#{item._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                    {item.label_url && (
                        <a href={item.label_url} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1 border border-blue-100">
                            <Package size={12} /><span className="text-[9px] font-black uppercase">Label</span>
                        </a>
                    )}
                    <PaymentBadge paymentStatus={item.payment_status} />
                    <StatusBadge status={item.delivery_status} />
                </div>
            </div>
            {item.is_high_risk && (
                <div className="bg-red-50 border border-red-100 p-2 rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-[10px] font-bold text-red-700 uppercase">Warning: High RTO Risk ({item.risk_score}%)</span>
                </div>
            )}
            <div className="flex gap-4 items-center">
                <div className="w-16 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                    <img src={item.products?.[0]?.images?.[0]} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <h3 className="text-[13px] font-black text-gray-800 line-clamp-1">{item.products?.[0]?.name || 'Multiple Items'}</h3>
                    <p className="text-[11px] text-gray-500 font-bold mt-0.5">{item.products?.length} items • <span className="text-green-600 font-black">₹{item.partnerAmount || item.price}</span></p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin size={10} className="text-gray-400" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase">{item.shippingInfo?.city || 'Local'}</span>
                    </div>
                </div>
                <div>
                    {item.delivery_status === 'pending' ? (
                        <div className="flex gap-2">
                            <button onClick={() => handleUpdateStatus(item._id, 'pending')} disabled={updatingOrderId === item._id} className="px-3 py-1.5 rounded-lg font-black text-[10px] uppercase bg-indigo-50 text-[#7C3AED] border border-indigo-100">
                                {updatingOrderId === item._id ? <RefreshCw size={12} className="animate-spin" /> : 'Confirm'}
                            </button>
                            <button onClick={() => setCancelOrderId(item._id)} disabled={updatingOrderId === item._id} className="px-3 py-1.5 rounded-lg font-black text-[10px] uppercase bg-red-50 text-red-600 border border-red-100">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => handleUpdateStatus(item._id, item.delivery_status)} disabled={['delivered', 'cancelled'].includes(item.delivery_status) || updatingOrderId === item._id} className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase ${['delivered', 'cancelled'].includes(item.delivery_status) ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-[#7C3AED] border border-indigo-100'}`}>
                            {updatingOrderId === item._id ? <RefreshCw size={12} className="animate-spin" /> : item.delivery_status === 'confirmed' || item.delivery_status === 'processing' ? 'Ship' : item.delivery_status === 'shipped' ? 'Deliver' : 'Done'}
                        </button>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <span className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <button onClick={() => handlePrintInvoice(item)} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100">
                    <FileText size={10} /><span className="text-[9px] font-black uppercase">Invoice</span>
                </button>
            </div>
        </motion.div>
    );

    const StatusBadge = ({ status }) => {
        const colors = { pending: 'bg-orange-100 text-orange-700', confirmed: 'bg-purple-100 text-purple-700', shipped: 'bg-blue-100 text-blue-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
        const colorClass = colors[status] || 'bg-gray-100 text-gray-700';
        return <div className={`px-2 py-0.5 rounded ${colorClass.split(' ')[0]}`}><span className={`text-[10px] font-bold uppercase ${colorClass.split(' ')[1]}`}>{status}</span></div>;
    };

    const PaymentBadge = ({ paymentStatus }) => {
        const isPrepaid = paymentStatus === 'paid';
        return <div className={`px-2 py-0.5 rounded ${isPrepaid ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}><span className={`text-[9px] font-bold uppercase`}>{isPrepaid ? 'PREPAID' : 'COD'}</span></div>;
    };

    return (
        <>
            {/* HEADER */}
            <div className="px-5 py-4 bg-white flex items-center justify-between border-b border-gray-100 sticky top-0 z-50 lg:hidden">
                <div className="flex items-center">
                    <button onClick={() => navigate('/supplier-dashboard')} className="mr-4">
                        <ChevronLeft size={24} color="black" />
                    </button>
                    <span className="text-[20px] font-black text-gray-900 leading-tight">Orders Management</span>
                </div>
                <button onClick={() => orderType === 'b2c' ? dispatch(get_supplier_orders()) : dispatch(get_b2b_orders(activeStatus))} className={`p-1 ${isLoading ? 'animate-spin' : ''}`}>
                    <RefreshCw size={18} className="text-[#7C3AED]" />
                </button>
            </div>

            {/* TABS CONTAINER */}
            <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
                {/* ORDER TYPE TABS: B2C | B2B */}
                <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setOrderType('b2c'); setActiveStatus('all'); }} 
                        className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all ${orderType === 'b2c' ? 'bg-gray-900 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-500'}`}>
                        B2C Orders
                    </button>
                    <button onClick={() => { setOrderType('b2b'); setActiveStatus('all'); }} 
                        className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all ${orderType === 'b2b' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-500'}`}>
                        ⚡ B2B Orders
                    </button>
                </div>

                {/* STATUS TABS */}
                <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="flex gap-2">
                        {(orderType === 'b2c' ? b2cStatusTabs : b2bStatusTabs).map(tab => (
                            <button key={tab.value} onClick={() => setActiveStatus(tab.value)}
                                className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all ${activeStatus === tab.value ? (orderType === 'b2b' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-[#7C3AED] text-white shadow-md scale-105') : 'bg-gray-100 text-gray-500'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ORDERS LIST */}
            <div className="flex-1 bg-gray-50/50 pt-4 px-4 space-y-4 overflow-y-auto">
                {isLoading && filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full mb-4" />
                        <span className="text-gray-400 font-bold text-sm">Loading orders...</span>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <>
                        {/* DESKTOP VIEW (Responsive Table) */}
                        <div className="hidden lg:block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <ResponsiveTable 
                                columns={orderType === 'b2c' ? b2cColumns : b2bColumns}
                                data={filteredOrders}
                                isLoading={isLoading}
                                hideSearch={true}
                                emptyStateText={`No ${activeStatus} orders found`}
                            />
                        </div>

                        {/* MOBILE VIEW (Original Card View) */}
                        <div className="lg:hidden space-y-4">
                            {orderType === 'b2b' ? (
                                filteredOrders.map(item => <B2BCard key={item._id} item={item} />)
                            ) : (
                                filteredOrders.map(item => <B2CCard key={item._id} item={item} />)
                            )}
                        </div>
                    </>
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

            {/* ── B2C Confirm Modal ── */}
            <ConfirmModal isOpen={!!confirmAction} status={confirmAction?.nextStatus} onClose={() => setConfirmAction(null)} onConfirm={proceedUpdateStatus} isLoading={confirmAction && updatingOrderId === confirmAction.orderId} />

            {/* ── B2C Cancel Reason Modal ── */}
            <AnimatePresence>
                {cancelOrderId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex flex-col justify-end">
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-white rounded-t-[30px] p-6 shadow-2xl relative">
                            <button onClick={() => { setCancelOrderId(null); setCancelReason(''); }} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Cancel Order</h3>
                            <p className="text-sm text-gray-500 font-medium mb-6">Please provide a reason for cancelling this order.</p>
                            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="E.g. Out of stock, pricing error..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 min-h-[120px] mb-6 font-medium text-gray-800 outline-none focus:border-red-300" />
                            <button onClick={() => handleUpdateStatus(cancelOrderId, 'cancelled')} disabled={updatingOrderId === cancelOrderId || !cancelReason.trim()} className="w-full bg-red-600 text-white font-black text-[15px] p-4 rounded-2xl shadow-lg shadow-red-200 active:scale-[0.98] transition-transform disabled:bg-gray-300 flex justify-center">
                                {updatingOrderId === cancelOrderId ? <RefreshCw size={20} className="animate-spin" /> : 'Confirm Cancellation'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── B2B Reject Reason Modal ── */}
            <AnimatePresence>
                {rejectOrderId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex flex-col justify-end">
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-white rounded-t-[30px] p-6 shadow-2xl relative">
                            <button onClick={() => { setRejectOrderId(null); setRejectReasonCode(''); setRejectReasonText(''); }} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Reject Order</h3>
                            <p className="text-sm text-gray-500 font-medium mb-6">Select a reason for rejection. Buyer will be notified and refunded.</p>
                            
                            <div className="space-y-3 mb-6">
                                {REJECT_REASONS.map(r => (
                                    <label key={r.code} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${rejectReasonCode === r.code ? 'border-red-400 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                                        <input type="radio" name="rejectReason" value={r.code} checked={rejectReasonCode === r.code} onChange={e => setRejectReasonCode(e.target.value)} className="w-4 h-4 text-red-600" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{r.label}</p>
                                            <p className="text-[11px] text-gray-500">{r.code === 'OUT_OF_STOCK' ? 'Requested items are not available' : r.code === 'PRICING_ERROR' ? 'Product pricing needs to be updated' : r.code === 'UNABLE_TO_FULFILL' ? 'Cannot fulfill this order at this time' : r.code === 'LOGISTICS_ISSUE' ? 'Cannot ship to the given pincode' : 'Other reason'}</p>
                                        </div>
                                    </label>
                                ))}
                                {rejectReasonCode === 'OTHER' && (
                                    <textarea value={rejectReasonText} onChange={e => setRejectReasonText(e.target.value)} placeholder="Describe the reason..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[80px] text-sm font-medium text-gray-800 outline-none focus:border-red-300" />
                                )}
                            </div>

                            <button onClick={handleRejectB2B} disabled={updatingOrderId === rejectOrderId || !rejectReasonCode} className="w-full bg-red-600 text-white font-black text-[15px] p-4 rounded-2xl shadow-lg shadow-red-200 active:scale-[0.98] transition-transform disabled:bg-gray-300 flex justify-center">
                                {updatingOrderId === rejectOrderId ? <RefreshCw size={20} className="animate-spin" /> : 'Confirm Rejection & Refund'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SupplierFooter />
        </>
    );
};

export default SupplierOrders;