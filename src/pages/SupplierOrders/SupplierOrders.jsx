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
    ThumbsUp, ThumbsDown, AlertTriangle,
    Weight, Ruler, Send, Eye, ExternalLink,
    Banknote, CreditCard, Navigation, QrCode, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import {
    get_supplier_orders, update_order_status,
    get_b2b_orders, accept_b2b_order, reject_b2b_order,
    update_b2b_status, get_rejection_reasons, messageClear,
    confirm_order, ship_now
} from '../../store/reducers/vendorReducer';
import SupplierFooter from '../../components/layout/SupplierFooter';
import ConfirmModal from '../../components/supplier/ConfirmModal';
import InvoiceTemplate from '../../components/supplier/InvoiceTemplate';
import ReactDOMServer from 'react-dom/server';
import ResponsiveTable from '../../components/common/ResponsiveTable';

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending:         { label: 'Order Received',     color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500',  step: 1 },
    confirmed:       { label: 'Ready to Ship',       color: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500', step: 2 },
    shipped:         { label: 'Shipped',             color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',   step: 3 },
    delivered:       { label: 'Delivered',           color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', step: 4 },
    cancelled:       { label: 'Cancelled',           color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',    step: 0 },
    pending_payment: { label: 'Awaiting Payment',    color: 'bg-gray-100 text-gray-600 border-gray-200',       dot: 'bg-gray-400',   step: 0 },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

// ─── Flow progress stepper ───────────────────────────────────────────────────
const FlowStepper = ({ status }) => {
    const steps = [
        { key: 'pending',   label: 'Received',   icon: '📥' },
        { key: 'confirmed', label: 'Confirmed',  icon: '✅' },
        { key: 'shipped',   label: 'Shipped',    icon: '🚚' },
        { key: 'delivered', label: 'Delivered',  icon: '🎉' },
    ];
    const currentStep = STATUS_CONFIG[status]?.step || 0;

    return (
        <div className="flex items-center gap-0 w-full mt-3">
            {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const done = stepNum < currentStep;
                const active = stepNum === currentStep;
                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all ${
                                done    ? 'bg-emerald-500 border-emerald-500 text-white' :
                                active  ? 'bg-violet-600 border-violet-600 text-white scale-110 shadow-lg shadow-violet-200' :
                                          'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                                {done ? '✓' : step.icon}
                            </div>
                            <span className={`text-[9px] font-black mt-1 uppercase tracking-wide ${
                                active ? 'text-violet-600' : done ? 'text-emerald-600' : 'text-gray-400'
                            }`}>{step.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`h-0.5 flex-1 mb-4 transition-all ${done || active ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ─── Countdown Timer ────────────────────────────────────────────────────────
const CountdownTimer = ({ deadline }) => {
    const calc = useCallback(() => {
        if (!deadline) return { h: 0, m: 0, s: 0, total: 0 };
        const total = Math.max(0, new Date(deadline).getTime() - Date.now());
        return {
            h: Math.floor(total / 3600000),
            m: Math.floor((total % 3600000) / 60000),
            s: Math.floor((total % 60000) / 1000),
            total
        };
    }, [deadline]);

    const [t, setT] = useState(calc);
    useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [calc]);

    if (t.total <= 0) return (
        <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200 text-[10px] font-black">
            <Timer size={12} /> Expired
        </div>
    );
    const isUrgent = (t.h + t.m / 60) < 6;
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-black font-mono ${isUrgent ? 'text-red-600 bg-red-50 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
            <Timer size={12} />
            {String(t.h).padStart(2, '0')}h {String(t.m).padStart(2, '0')}m {String(t.s).padStart(2, '0')}s
        </div>
    );
};

// ─── Package Dimensions Modal ────────────────────────────────────────────────
const DimensionsModal = ({ order, onConfirm, onClose, loading }) => {
    const [dims, setDims] = useState({
        weight: order?.packageDimensions?.weight || '',
        length: order?.packageDimensions?.length || '',
        width:  order?.packageDimensions?.width  || '',
        height: order?.packageDimensions?.height || ''
    });

    const isValid = dims.weight > 0 && dims.length > 0 && dims.width > 0 && dims.height > 0;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-200 text-[10px] font-black uppercase tracking-widest">Step 1 of 2</p>
                            <h2 className="text-white text-lg font-black mt-0.5">Confirm & Package Details</h2>
                            <p className="text-violet-200 text-[11px] font-medium mt-1">Required by Shiprocket to assign courier</p>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white p-1">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Order summary */}
                <div className="px-6 py-3 bg-violet-50 border-b border-violet-100">
                    <p className="text-[10px] font-black text-violet-600 uppercase tracking-wide">Order #{order?._id?.slice(-8).toUpperCase()}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        {order?.products?.slice(0, 3).map((p, i) => (
                            <span key={i} className="text-[11px] font-bold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded-lg">
                                {p.productName || p.name}
                                {(p.size || p.variants?.[0]?.size) && <span className="ml-1 text-violet-600">[{p.size || p.variants?.[0]?.size}]</span>}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Dimensions form */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-[11px] font-bold text-gray-500">Enter the packed box dimensions. Auto-filled from product if available.</p>

                    {/* Weight */}
                    <div>
                        <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                            <Weight size={12} className="text-violet-500" /> Package Weight (kg)
                        </label>
                        <input
                            type="number" step="0.1" min="0.1"
                            value={dims.weight}
                            onChange={e => setDims(d => ({ ...d, weight: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none text-sm font-bold transition-colors"
                            placeholder="e.g. 0.7"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Typical: T-Shirt = 0.3kg, Saree = 0.6kg, Hoodie = 0.9kg</p>
                    </div>

                    {/* L x W x H */}
                    <div>
                        <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                            <Ruler size={12} className="text-violet-500" /> Box Dimensions (cm)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { key: 'length', label: 'Length' },
                                { key: 'width',  label: 'Width'  },
                                { key: 'height', label: 'Height' }
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <p className="text-[9px] font-black text-gray-500 uppercase mb-1">{label}</p>
                                    <input
                                        type="number" step="1" min="1"
                                        value={dims[key]}
                                        onChange={e => setDims(d => ({ ...d, [key]: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none text-sm font-bold text-center transition-colors"
                                        placeholder="cm"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Standard poly-bag: 30 × 25 × 4 cm</p>
                    </div>

                    {/* Preview */}
                    {isValid && (
                        <div className="bg-violet-50 rounded-xl p-3 border border-violet-100 flex items-center gap-3">
                            <Package size={18} className="text-violet-500 shrink-0" />
                            <div className="text-[11px] font-bold text-violet-700">
                                <span className="font-black">{dims.weight}kg</span> · {dims.length}×{dims.width}×{dims.height} cm · Shiprocket will auto-assign the best courier
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => isValid && onConfirm(dims)}
                        disabled={!isValid || loading}
                        className="flex-1 py-3 rounded-2xl bg-violet-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-200 hover:bg-violet-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Confirm & Send to Shiprocket</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Ship Now Confirmation Modal ─────────────────────────────────────────────
const ShipNowModal = ({ order, onShip, onClose, loading }) => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Step 2 of 2</p>
                        <h2 className="text-white text-lg font-black mt-0.5">Hand to Courier</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
                </div>
            </div>

            <div className="px-6 py-5 space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <QrCode size={20} className="text-blue-600 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase">AWB Number</p>
                            <p className="text-sm font-black text-gray-900 font-mono">{order?.awb_number || '—'}</p>
                        </div>
                    </div>
                    {order?.trackingUrl && (
                        <a href={order.trackingUrl} target="_blank" rel="noreferrer"
                            className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                            <ExternalLink size={10} /> View on Shiprocket
                        </a>
                    )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] font-bold text-amber-700">
                        Click "Ship Now" only after physically handing the packed parcel to the courier pickup person.
                        This action triggers Shiprocket pickup scheduling.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-50">
                        Not Yet
                    </button>
                    <button
                        onClick={onShip}
                        disabled={loading}
                        className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <><Truck size={16} /> Ship Now</>}
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
);

// ─── REJECT REASONS ──────────────────────────────────────────────────────────
const REJECT_REASONS = [
    { code: 'OUT_OF_STOCK',       label: 'Out of Stock' },
    { code: 'PRICING_ERROR',      label: 'Pricing Error' },
    { code: 'UNABLE_TO_FULFILL',  label: 'Cannot Fulfill' },
    { code: 'LOGISTICS_ISSUE',    label: 'Logistics Issue' },
    { code: 'OTHER',              label: 'Other' }
];

// ════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const SupplierOrders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        supplierOrders: orders, supplierData, loader, successMessage, errorMessage,
        b2bOrders, b2bLoader, rejectionReasons
    } = useSelector(s => s.vendor);

    const [orderType, setOrderType]       = useState('b2c');
    const [activeStatus, setActiveStatus] = useState('all');
    const [actionOrderId, setActionOrderId] = useState(null);

    // Modals
    const [confirmOrderModal, setConfirmOrderModal] = useState(null); // order object
    const [shipNowModal, setShipNowModal]           = useState(null); // order object
    const [cancelOrderId, setCancelOrderId]         = useState(null);
    const [cancelReason, setCancelReason]           = useState('');
    const [rejectOrderId, setRejectOrderId]         = useState(null);
    const [rejectReasonCode, setRejectReasonCode]   = useState('');
    const [rejectReasonText, setRejectReasonText]   = useState('');
    const [expandedId, setExpandedId]               = useState(null);

    const b2cStatusTabs = [
        { label: 'All',        value: 'all' },
        { label: '📥 Pending', value: 'pending' },
        { label: '✅ Confirmed', value: 'confirmed' },
        { label: '🚚 Shipped', value: 'shipped' },
        { label: '🎉 Delivered', value: 'delivered' },
        { label: '❌ Cancelled', value: 'cancelled' },
    ];
    const b2bStatusTabs = [
        { label: 'All', value: 'all' },
        { label: 'New', value: 'paid' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
    ];

    useEffect(() => {
        if (orderType === 'b2c') dispatch(get_supplier_orders());
        else { dispatch(get_b2b_orders(activeStatus)); dispatch(get_rejection_reasons()); }
    }, [dispatch, orderType, activeStatus]);

    useEffect(() => {
        if (successMessage) { toast.success(successMessage); dispatch(messageClear()); setActionOrderId(null); }
        if (errorMessage)   { toast.error(errorMessage);    dispatch(messageClear()); setActionOrderId(null); }
    }, [successMessage, errorMessage, dispatch]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleConfirmOrder = async (dims) => {
        if (!confirmOrderModal) return;
        setActionOrderId(confirmOrderModal._id);
        await dispatch(confirm_order({
            orderId: confirmOrderModal._id,
            weight: parseFloat(dims.weight),
            length: parseFloat(dims.length),
            width:  parseFloat(dims.width),
            height: parseFloat(dims.height)
        }));
        setConfirmOrderModal(null);
    };

    const handleShipNow = async () => {
        if (!shipNowModal) return;
        setActionOrderId(shipNowModal._id);
        await dispatch(ship_now(shipNowModal._id));
        setShipNowModal(null);
    };

    const handleCancel = () => {
        if (!cancelReason.trim()) return toast.error('Please enter a cancellation reason');
        setActionOrderId(cancelOrderId);
        dispatch(update_order_status({ orderId: cancelOrderId, status: 'cancelled', reason: cancelReason }));
        setCancelOrderId(null); setCancelReason('');
    };

    const handleAcceptB2B = id => { setActionOrderId(id); dispatch(accept_b2b_order(id)); };
    const handleRejectB2B = () => {
        if (!rejectReasonCode) return toast.error('Select a rejection reason');
        setActionOrderId(rejectOrderId);
        dispatch(reject_b2b_order({ orderId: rejectOrderId, reasonCode: rejectReasonCode, reasonText: rejectReasonText || REJECT_REASONS.find(r => r.code === rejectReasonCode)?.label }));
        setRejectOrderId(null); setRejectReasonCode(''); setRejectReasonText('');
    };
    const handleB2BNext = order => {
        const map = { accepted: 'packed', packed: 'shipped', shipped: 'delivered' };
        if (!map[order.b2b_status]) return;
        setActionOrderId(order._id);
        dispatch(update_b2b_status({ orderId: order._id, status: map[order.b2b_status] }));
    };

    const handlePrintInvoice = order => {
        const html = ReactDOMServer.renderToString(<InvoiceTemplate order={order} supplier={supplierData} />);
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, { position: 'fixed', right: 0, bottom: 0, width: 0, height: 0, border: 'none' });
        document.body.appendChild(iframe);
        const styles = Array.from(document.querySelectorAll('style,link[rel="stylesheet"]')).map(n => n.outerHTML).join('');
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`<!DOCTYPE html><html><head><title>Invoice</title>${styles}</head><body>${html}</body></html>`);
        doc.close();
        setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => document.body.removeChild(iframe), 2000); }, 1000);
    };

    // ── Filtered list ──────────────────────────────────────────────────────
    const filteredOrders = orderType === 'b2c'
        ? (activeStatus === 'all' ? orders : orders.filter(o => o.delivery_status === activeStatus))
        : b2bOrders;
    const isLoading = orderType === 'b2c' ? loader : b2bLoader;

    // ════════════════════════════════════════════════════════════════════════
    //  B2C ORDER CARD
    // ════════════════════════════════════════════════════════════════════════
    const B2CCard = ({ item }) => {
        const isExpanded = expandedId === item._id;
        const isActing   = actionOrderId === item._id;
        const status     = item.delivery_status;
        const isCOD      = item.payment_method === 'COD' || item.paymentLabel?.includes('Cash');

        return (
            <motion.div layout className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* ── HEADER BAR ── */}
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-black text-gray-900 font-mono">#{item._id.slice(-8).toUpperCase()}</p>
                            <StatusBadge status={status} />
                            {isCOD ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-100 text-orange-700 border border-orange-200">
                                    <Banknote size={9} /> COD
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-100 text-green-700 border border-green-200">
                                    <CreditCard size={9} /> Prepaid
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {item.label_url && (
                            <a href={item.label_url} target="_blank" rel="noreferrer"
                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 text-[9px] font-black uppercase flex items-center gap-1">
                                <FileText size={10} /> Label
                            </a>
                        )}
                        <button onClick={() => setExpandedId(isExpanded ? null : item._id)}
                            className={`p-2 rounded-xl border transition-colors ${isExpanded ? 'bg-violet-50 border-violet-200 text-violet-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                            <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ── PRODUCTS PREVIEW ── */}
                <div className="px-4 py-3 border-t border-gray-50">
                    <div className="flex gap-3 items-center">
                        {item.products?.[0]?.images?.[0] && (
                            <div className="w-14 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                <img src={item.products[0].images[0]} className="w-full h-full object-cover" alt="" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-gray-800 line-clamp-1">
                                {item.products?.[0]?.productName || item.products?.[0]?.name || 'Product'}
                            </p>
                            {/* Size / Color / Variant badges */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {item.products?.map((p, i) => {
                                    const size  = p.size || p.variants?.[0]?.size;
                                    const color = p.variants?.[0]?.variantName || p.variants?.[0]?.color;
                                    if (!size && !color) return null;
                                    return (
                                        <span key={i} className="text-[10px] font-black bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                            <Layers size={9} />
                                            {size && `Size: ${size}`}{size && color && ' · '}{color && `${color}`}
                                        </span>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-gray-500 font-bold mt-1">
                                {item.products?.length} item{item.products?.length > 1 ? 's' : ''} ·
                                <span className="text-emerald-600 font-black"> ₹{item.partnerAmount || item.price}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── EXPANDED DETAILS ── */}
                <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">

                            {/* Flow Stepper */}
                            <FlowStepper status={status} />

                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><User size={10} /> Customer Details</p>
                                <p className="text-[12px] font-black text-gray-800">{item.customerName || item.shippingInfo?.name}</p>
                                {item.customerPhone && (
                                    <a href={`tel:${item.customerPhone}`} className="text-[11px] font-bold text-blue-600 flex items-center gap-1 mt-0.5">
                                        📞 {item.customerPhone}
                                    </a>
                                )}
                                <div className="flex items-start gap-1.5 mt-1.5">
                                    <MapPin size={11} className="text-gray-400 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-gray-600 font-medium leading-snug">
                                        {item.deliveryAddress || [
                                            item.shippingInfo?.address || item.shippingInfo?.houseNo,
                                            item.shippingInfo?.area,
                                            item.shippingInfo?.city,
                                            item.shippingInfo?.state,
                                            item.shippingInfo?.pincode
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </div>

                            {/* All Products */}
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><Box size={10} /> Order Items</p>
                                <div className="space-y-2">
                                {item.products?.map((p, i) => {
                                    const size  = p.size  || p.variants?.[0]?.size;
                                    const color = p.variants?.[0]?.variantName || p.variants?.[0]?.color;
                                    return (
                                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                                            <div>
                                                <p className="text-[12px] font-black text-gray-800">{p.productName || p.name}</p>
                                                <div className="flex gap-1.5 mt-0.5 flex-wrap">
                                                    {size  && <span className="text-[9px] font-black bg-white border border-violet-200 text-violet-700 px-1.5 py-0.5 rounded">Size: {size}</span>}
                                                    {color && <span className="text-[9px] font-black bg-white border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded">Color: {color}</span>}
                                                    <span className="text-[9px] font-black bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Qty: {p.quantity || 1}</span>
                                                </div>
                                            </div>
                                            <p className="text-[12px] font-black text-gray-900">₹{p.price || 0}</p>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>

                            {/* Payment info */}
                            <div className={`rounded-xl px-3 py-2 border flex items-center gap-2 ${isCOD ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                                {isCOD ? <Banknote size={16} className="text-orange-500 shrink-0" /> : <CreditCard size={16} className="text-green-500 shrink-0" />}
                                <div>
                                    <p className={`text-[11px] font-black uppercase ${isCOD ? 'text-orange-700' : 'text-green-700'}`}>
                                        {isCOD ? 'Cash on Delivery — Collect ₹' + (item.partnerAmount || item.price) + ' at delivery' : 'Prepaid — Payment already received'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-medium">Your earning: ₹{item.partnerAmount || item.price}</p>
                                </div>
                            </div>

                            {/* Pickup Address */}
                            {item.pickupAddress && (
                                <div className="bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                                    <p className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 mb-1"><Navigation size={10} /> Your Pickup Address</p>
                                    <p className="text-[11px] font-bold text-gray-700">{item.pickupAddress}</p>
                                </div>
                            )}

                            {/* AWB / Tracking (after confirmed) */}
                            {item.awb_number && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                    <p className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 mb-1.5"><QrCode size={10} /> Shipment Info</p>
                                    <p className="text-[12px] font-black text-gray-900 font-mono">{item.awb_number}</p>
                                    {item.trackingUrl && (
                                        <a href={item.trackingUrl} target="_blank" rel="noreferrer"
                                            className="text-[10px] font-bold text-blue-600 flex items-center gap-1 mt-1 hover:underline">
                                            <ExternalLink size={10} /> Track on Shiprocket
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Package Dimensions (after confirmed) */}
                            {item.packageDimensions?.weight && (
                                <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 flex items-center gap-3">
                                    <Weight size={14} className="text-gray-400 shrink-0" />
                                    <p className="text-[11px] font-bold text-gray-600">
                                        <span className="font-black text-gray-800">{item.packageDimensions.weight}kg</span>
                                        {' · '}{item.packageDimensions.length}×{item.packageDimensions.width}×{item.packageDimensions.height} cm
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* ── ACTION BUTTONS ── */}
                <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex gap-2 flex-wrap">

                    {/* PENDING → "Confirm Order" */}
                    {status === 'pending' && (
                        <>
                            <button
                                onClick={() => setConfirmOrderModal(item)}
                                disabled={isActing}
                                className="flex-1 py-3 rounded-2xl bg-violet-600 text-white font-black text-[12px] flex items-center justify-center gap-2 shadow-lg shadow-violet-100 hover:bg-violet-700 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isActing
                                    ? <RefreshCw size={14} className="animate-spin" />
                                    : <><CheckCircle2 size={14} /> Confirm Order</>
                                }
                            </button>
                            <button
                                onClick={() => setCancelOrderId(item._id)}
                                disabled={isActing}
                                className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-black text-[12px] border border-red-200 hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </>
                    )}

                    {/* CONFIRMED → "Ship Now" */}
                    {status === 'confirmed' && (
                        <button
                            onClick={() => setShipNowModal(item)}
                            disabled={isActing}
                            className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-black text-[12px] flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isActing
                                ? <RefreshCw size={14} className="animate-spin" />
                                : <><Truck size={14} /> Ship Now — Hand to Courier</>
                            }
                        </button>
                    )}

                    {/* SHIPPED → Track button */}
                    {status === 'shipped' && item.trackingUrl && (
                        <a href={item.trackingUrl} target="_blank" rel="noreferrer"
                            className="flex-1 py-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-black text-[12px] flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                            <Navigation size={14} /> Track Shipment
                        </a>
                    )}

                    {/* DELIVERED → Invoice */}
                    {status === 'delivered' && (
                        <button
                            onClick={() => handlePrintInvoice(item)}
                            className="flex-1 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[12px] flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
                            <Printer size={14} /> Print Invoice
                        </button>
                    )}

                    {/* Invoice always available */}
                    {['confirmed', 'shipped'].includes(status) && (
                        <button onClick={() => handlePrintInvoice(item)}
                            className="p-3 rounded-2xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                            <Printer size={14} />
                        </button>
                    )}
                </div>
            </motion.div>
        );
    };

    // ── B2B Card (unchanged logic, cosmetically upgraded) ──────────────────
    const B2BCard = ({ item }) => {
        const isActing = actionOrderId === item._id;
        return (
            <motion.div layout className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">B2B Order</p>
                            <p className="text-[14px] font-black text-gray-900">#{item._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.b2b_status === 'paid' && !item.isExpired && <CountdownTimer deadline={item.acceptDeadline} />}
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                item.b2b_status === 'paid'      ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                item.b2b_status === 'accepted'  ? 'bg-violet-100 text-violet-700 border-violet-200' :
                                item.b2b_status === 'shipped'   ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                item.b2b_status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>{item.b2b_status}</span>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                        {item.products?.slice(0, 3).map((p, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-700 truncate max-w-[180px]">{p.productName || p.name} <span className="text-gray-400">×{p.quantity}</span></span>
                                <span className="font-black text-gray-800">₹{p.price || 0}</span>
                            </div>
                        ))}
                        {item.products?.length > 3 && <p className="text-[10px] text-gray-400 text-center">+{item.products.length - 3} more</p>}
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-start gap-1.5">
                            <MapPin size={11} className="text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-gray-500">{item.shippingInfo?.city}, {item.shippingInfo?.state}</p>
                        </div>
                        <p className="text-base font-black text-gray-900">₹{item.price}</p>
                    </div>

                    {item.b2b_status === 'paid' && !item.isExpired && !item.autoCancelled && (
                        <div className="flex gap-2 pt-1">
                            <button onClick={() => handleAcceptB2B(item._id)} disabled={isActing}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-[0.98] disabled:opacity-50">
                                {isActing ? <RefreshCw size={14} className="animate-spin" /> : <><ThumbsUp size={14} /> Accept</>}
                            </button>
                            <button onClick={() => setRejectOrderId(item._id)} disabled={isActing}
                                className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
                                <ThumbsDown size={14} /> Reject
                            </button>
                        </div>
                    )}

                    {['accepted', 'packed', 'shipped'].includes(item.b2b_status) && (
                        <button onClick={() => handleB2BNext(item)} disabled={isActing}
                            className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-50">
                            {isActing ? <RefreshCw size={14} className="animate-spin" /> :
                             item.b2b_status === 'accepted' ? 'Mark as Packed' :
                             item.b2b_status === 'packed'   ? 'Mark as Shipped' : 'Mark as Delivered'}
                        </button>
                    )}

                    {item.autoCancelled && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start">
                            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[11px] font-black text-red-700">Auto-Cancelled</p>
                                <p className="text-[10px] text-red-500">No response within 48 hours.</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-bold">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {item.b2b_status === 'delivered' && (
                        <button onClick={() => handlePrintInvoice(item)} className="flex items-center gap-1 text-gray-600 text-[10px] font-black bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100">
                            <FileText size={10} /> Invoice
                        </button>
                    )}
                </div>
            </motion.div>
        );
    };

    // ────────────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── HEADER ── */}
            <div className="px-5 py-4 bg-white flex items-center justify-between border-b border-gray-100 sticky top-0 z-40 lg:hidden shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/supplier-dashboard')} className="p-1">
                        <ChevronLeft size={24} color="black" />
                    </button>
                    <div>
                        <p className="text-[18px] font-black text-gray-900 leading-tight">Orders</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                            {activeStatus !== 'all' && ` · ${activeStatus}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => orderType === 'b2c' ? dispatch(get_supplier_orders()) : dispatch(get_b2b_orders(activeStatus))}
                    className={`p-2 rounded-xl bg-gray-50 border border-gray-200 ${isLoading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={16} className="text-violet-600" />
                </button>
            </div>

            {/* ── ORDER TYPE TABS ── */}
            <div className="bg-white border-b border-gray-100 px-4 py-2.5 shadow-xs sticky top-[69px] z-30 lg:top-0">
                <div className="flex flex-col gap-2.5">
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setOrderType('b2c'); setActiveStatus('all'); setExpandedId(null); }}
                            className={`px-5 py-2 rounded-full text-[12px] font-black transition-all ${orderType === 'b2c' ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'bg-gray-100 text-gray-500'}`}
                        >
                            🛍️ B2C Orders
                        </button>
                        <button
                            onClick={() => { setOrderType('b2b'); setActiveStatus('all'); setExpandedId(null); }}
                            className={`px-5 py-2 rounded-full text-[12px] font-black transition-all ${orderType === 'b2b' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-100 text-gray-500'}`}
                        >
                            ⚡ B2B Orders
                        </button>
                    </div>
                    <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <div className="flex gap-1.5">
                            {(orderType === 'b2c' ? b2cStatusTabs : b2bStatusTabs).map(tab => (
                                <button key={tab.value} onClick={() => setActiveStatus(tab.value)}
                                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all ${
                                        activeStatus === tab.value
                                            ? orderType === 'b2b' ? 'bg-indigo-600 text-white' : 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ORDER LIST ── */}
            <div className="flex-1 bg-gray-50/50 px-4 pt-4 pb-32 space-y-4 overflow-y-auto min-h-0">
                {isLoading && filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4 animate-pulse">
                            <ShoppingBag size={24} className="text-violet-500" />
                        </div>
                        <p className="text-gray-400 font-bold text-sm">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                            <Package size={28} className="text-gray-300" />
                        </div>
                        <p className="text-gray-800 font-black text-base">No Orders Yet</p>
                        <p className="text-gray-400 font-medium text-sm mt-1">
                            {activeStatus === 'all' ? "You haven't received any orders." : `No ${activeStatus} orders right now.`}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredOrders.map(item => (
                            orderType === 'b2c'
                                ? <B2CCard key={item._id} item={item} />
                                : <B2BCard key={item._id} item={item} />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* ── MODALS ── */}
            <AnimatePresence>
                {confirmOrderModal && (
                    <DimensionsModal
                        order={confirmOrderModal}
                        loading={actionOrderId === confirmOrderModal._id}
                        onConfirm={handleConfirmOrder}
                        onClose={() => setConfirmOrderModal(null)}
                    />
                )}
                {shipNowModal && (
                    <ShipNowModal
                        order={shipNowModal}
                        loading={actionOrderId === shipNowModal._id}
                        onShip={handleShipNow}
                        onClose={() => setShipNowModal(null)}
                    />
                )}
            </AnimatePresence>

            {/* ── CANCEL ORDER MODAL ── */}
            <AnimatePresence>
            {cancelOrderId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <motion.div initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:60 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <h3 className="text-base font-black text-gray-900">Cancel Order</h3>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 outline-none text-sm font-medium resize-none transition-colors"
                            placeholder="Reason for cancellation (required)..."
                        />
                        <div className="flex gap-3">
                            <button onClick={() => { setCancelOrderId(null); setCancelReason(''); }}
                                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-black text-sm text-gray-600 hover:bg-gray-50">
                                Back
                            </button>
                            <button onClick={handleCancel}
                                className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black text-sm shadow-lg shadow-red-100 hover:bg-red-700 active:scale-[0.98]">
                                Confirm Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>

            {/* ── B2B REJECT MODAL ── */}
            <AnimatePresence>
            {rejectOrderId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <motion.div initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:60 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <h3 className="text-base font-black text-gray-900">Reject B2B Order</h3>
                        <div className="space-y-2">
                            {REJECT_REASONS.map(r => (
                                <button key={r.code} onClick={() => setRejectReasonCode(r.code)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                                        rejectReasonCode === r.code ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                    }`}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        {rejectReasonCode === 'OTHER' && (
                            <textarea value={rejectReasonText} onChange={e => setRejectReasonText(e.target.value)} rows={2}
                                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 outline-none text-sm resize-none" placeholder="Explain..." />
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => { setRejectOrderId(null); setRejectReasonCode(''); setRejectReasonText(''); }}
                                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-black text-sm text-gray-600">Back</button>
                            <button onClick={handleRejectB2B}
                                className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black text-sm shadow-lg shadow-red-100 hover:bg-red-700">
                                Confirm Reject
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>

            <SupplierFooter />
        </>
    );
};

export default SupplierOrders;