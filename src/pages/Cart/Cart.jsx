import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Trash2, Plus, Minus, 
    ChevronRight, ArrowRight, ShieldCheck, 
    Truck, Award, AlertCircle, ShoppingCart as CartIcon,
    Package, Gift, X, ChevronDown
} from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import { 
    get_cart, 
    remove_from_cart, 
    update_cart_quantity 
} from '../../store/reducers/wearCartReducer';
import { get_config } from '../../store/reducers/configReducer';

// --- HELPERS ---
const resolveImageUrl = (url) => {
    if (!url) return '/placeholder.jpg';
    if (typeof url === 'object' && url.url) url = url.url;
    if (typeof url !== 'string') return url;
    if (url.startsWith('http')) return url.replace('http://', 'https://');
    const baseUrl = (import.meta.env.VITE_API_URL || '').split('/api')[0];
    if (baseUrl) {
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanPath}`;
    }
    return url;
};

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // State
    const { cartItems, loader: loading } = useSelector(state => state.wearCart);
    const { token } = useSelector(state => state.auth);
    const { wearConfig } = useSelector(state => state.config);

    // Edit Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [tempQty, setTempQty] = useState(1);
    const [updatingCartId, setUpdatingCartId] = useState(null);

    useEffect(() => {
        if (token) {
            dispatch(get_cart());
            dispatch(get_config());
        }
    }, [dispatch, token]);

    // Tiered Pricing Logic (Exact match to mobile)
    const getTieredPrice = (product, qty) => {
        if (!product) return 0;
        const variants = product.variants || [];
        const basePrice = variants[0]?.listingPrice || product.price || 0;

        const allTiers = [];
        variants.forEach(v => {
            if (v.priceTiers) allTiers.push(...v.priceTiers);
        });

        const sortedTiers = allTiers.sort((a, b) => b.minQty - a.minQty);
        const matchingTier = sortedTiers.find(t => qty >= t.minQty);
        return matchingTier ? matchingTier.price : basePrice;
    };

    // Calculate totals based on tiers (match mobile)
    const { calculateTotal, calculateOriginalTotal, savings, isAnyOutOfStock } = useMemo(() => {
        let total = 0;
        let originalTotal = 0;
        let anyOutOfStock = false;

        cartItems.forEach(item => {
            const product = item.productId || {};
            const variant = (product.variants || []).find(v => v.size === item.size) || product.variants?.[0];
            
            // Check stock
            if (variant && variant.stock < item.quantity) {
                anyOutOfStock = true;
            }

            const tieredPrice = getTieredPrice(product, item.quantity);
            const basePrice = variant?.mrp || variant?.listingPrice || product.price || 0;

            total += (tieredPrice * item.quantity);
            originalTotal += (basePrice * item.quantity);
        });

        return {
            calculateTotal: total,
            calculateOriginalTotal: originalTotal,
            savings: originalTotal - total,
            isAnyOutOfStock: anyOutOfStock
        };
    }, [cartItems]);

    // Derived flags & configs
    const deliveryChargeThreshold = wearConfig?.free_delivery_above || 500;
    const deliveryChargeAmt = wearConfig?.delivery_charge || 40;
    const isFreeDelivery = calculateTotal >= deliveryChargeThreshold;
    const appliedDeliveryCharge = isFreeDelivery ? 0 : deliveryChargeAmt;
    const orderTotal = calculateTotal + appliedDeliveryCharge;

    const handleRemove = (cartId) => {
        dispatch(remove_from_cart(cartId)).then((res) => {
            if (res.payload?.message) {
                toast.success('Item removed from cart');
            }
        });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setTempQty(item.quantity);
        setIsEditModalVisible(true);
    };

    const handleUpdateCart = async () => {
        if (editingItem && tempQty !== editingItem.quantity) {
            setUpdatingCartId(editingItem._id);
            try {
                await dispatch(update_cart_quantity({ cartId: editingItem._id, quantity: tempQty })).unwrap();
                toast.success('Quantity updated');
                dispatch(get_cart());
            } catch (err) {
                toast.error(err.message || 'Update failed');
                console.error("Update qty failed", err);
            } finally {
                setUpdatingCartId(null);
            }
        }
        setIsEditModalVisible(false);
    };

    // Progress Stepper Component (match mobile layout)
    const ProgressStepper = () => (
        <div className="bg-transparent py-4 border-b border-gray-100/50 mb-2">
            <div className="flex px-8 relative items-center justify-between max-w-lg mx-auto">
                {/* Background Line */}
                <div className="absolute top-[17px] left-16 right-16 h-[2px] bg-gray-100" />
                {/* Active Line (Cart step is active) */}
                <div className="absolute top-[17px] left-16 w-1/4 h-[3px] bg-[#e11955]" />

                {/* Step 1: Cart */}
                <div className="flex flex-col items-center z-10 w-16">
                    <div className="bg-white p-0.5 rounded-full shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-[#e11955] flex items-center justify-center border-2 border-red-100">
                            <CartIcon size={14} className="text-white" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#e11955] mt-2 uppercase tracking-widest text-center">Cart</span>
                </div>

                {/* Step 2: Address */}
                <div className="flex flex-col items-center z-10 w-16">
                    <div className="bg-white p-0.5 rounded-full">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest text-center">Address</span>
                </div>

                {/* Step 3: Payment */}
                <div className="flex flex-col items-center z-10 w-16">
                    <div className="bg-white p-0.5 rounded-full">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest text-center">Payment</span>
                </div>
            </div>
        </div>
    );

    // GUEST VIEW
    if (!token) {
        return (
            <div className="h-screen flex flex-col bg-white overflow-hidden font-sans overscroll-none touch-none">
                <CommonHeader title="My Cart" />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
                    <div className="bg-[#e11955]/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10">
                        <ShieldCheck size={48} className="text-[#e11955]" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Login to view Cart</h2>
                    <p className="text-gray-400 font-bold mb-12 leading-relaxed uppercase text-[10px] tracking-widest max-w-[280px]">Secure your account and sync your favorite items across devices</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full bg-[#e11955] text-white font-black py-4.5 rounded-2xl shadow-xl shadow-rose-100 uppercase tracking-widest text-[13px] active:scale-95 transition-all"
                    >
                        LOGIN NOW
                    </button>
                </div>
            </div>
        );
    }

    // EMPTY VIEW
    if (cartItems.length === 0 && !loading) {
        return (
            <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans overscroll-none touch-none">
                <CommonHeader title="My Cart" />
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full flex flex-col items-center">
                        <div className="bg-white/50 p-10 rounded-[40px]  mb-8 relative flex items-center justify-center border border-gray-100">
                             {/* Web adaptation of the lottie empty bag */}
                            <div className="relative">
                                <ShoppingBag size={100} strokeWidth={1} className="text-gray-200" />
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }} 
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                    className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-sm border border-gray-50"
                                >
                                    <AlertCircle size={28} className="text-rose-400" />
                                </motion.div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Your bag is empty</h2>
                        <p className="text-gray-400 text-center font-medium mb-10 leading-relaxed text-[13px]">
                            Looks like you haven't added anything to your bag yet. Start shopping to find your favorites!
                        </p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-tr from-[#e11955] to-[#f03a6a] px-12 py-4 rounded-lg shadow-xl shadow-rose-200 active:scale-95 transition-all"
                        >
                            <span className="text-white font-black uppercase tracking-[0.2em] text-[12px]">Start Shopping</span>
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans overscroll-none touch-none">
            {/* FIXED TOP SECTION */}
            <div className="flex-none pt-[52px] bg-white z-10">
                <CommonHeader title="My Cart" />
                <ProgressStepper />
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-2 md:px-0">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#e11955]/20 border-t-[#e11955] rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-black mt-4 uppercase tracking-widest text-[10px]">Preparing your bag...</p>
                    </div>
                ) : (
                    <div className="md:grid md:grid-cols-3 md:gap-8 md:items-start">
                        
                        {/* LEFT COL: CART ITEMS */}
                        <div className="md:col-span-2 space-y-2 md:space-y-4">
                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item) => {
                                    const product = item.productId || {};
                                    const variant = (product.variants || []).find(v => v.size === item.size) || product.variants?.[0];
                                    const isOutOfStock = variant && variant.stock < item.quantity;
                                    const tieredPrice = getTieredPrice(product, item.quantity);
                                    const mrp = variant?.mrp || variant?.listingPrice || product.price || 0;
                                    const itemSavings = (mrp - tieredPrice) * item.quantity;
                                    const isUpdatingThis = updatingCartId === item._id;

                                    return (
                                        <motion.div 
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={item._id} 
                                            className={`bg-white md:rounded-2xl md:border md:border-gray-100 md:shadow-sm ${isOutOfStock ? 'opacity-80' : ''} ${isUpdatingThis ? 'pointer-events-none opacity-50 relative' : ''}`}
                                        >
                                            <div
                                                className="w-full text-left p-4 flex cursor-pointer"
                                                onClick={() => openEditModal(item)}
                                            >
                                                {/* Left Image */}
                                                <div className="relative flex-shrink-0">
                                                    <img 
                                                        src={resolveImageUrl(product.images?.[0] || product.image)} 
                                                        className="w-20 h-24 rounded bg-gray-50 object-cover" 
                                                        alt="" 
                                                    />
                                                    {isOutOfStock && (
                                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded">
                                                            <div className="bg-red-600 px-1 py-0.5 rounded">
                                                                <span className="text-[8px] text-white font-black italic">OUT OF STOCK</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Right Details */}
                                                <div className="flex-1 ml-4 pr-6 flex flex-col justify-between relative">
                                                    {/* Remove Button (Top Right Red Circle) */}
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            handleRemove(item._id); 
                                                        }}
                                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-75 transition-transform z-10"
                                                    >
                                                        <X size={14} strokeWidth={3} />
                                                    </button>

                                                    <div>
                                                        <p className={`font-medium text-[11px] uppercase leading-tight mb-1 line-clamp-2 ${isOutOfStock ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {product.productName}
                                                        </p>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center">
                                                                <span className={`font-semibold text-[15px] ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>₹{tieredPrice}</span>
                                                                <span className="text-[11px] text-gray-400 line-through ml-2">₹{mrp}</span>
                                                            </div>
                                                            {itemSavings > 0 && !isOutOfStock && (
                                                                <div className="bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                                    <span className="text-[9px] text-[#e11955] font-semibold uppercase tracking-tighter">Save ₹{itemSavings}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center mt-2 gap-2">
                                                        <div className="flex items-center bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                                                            <span className="text-[10px] text-gray-700 font-medium">Size: {item.size || 'Free'}</span>
                                                            <ChevronRight size={12} className="text-gray-400 ml-1" />
                                                        </div>
                                                        <div className="flex items-center bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                                                            <span className="text-[10px] text-gray-700 font-medium">Qty: {item.quantity}</span>
                                                            <ChevronRight size={12} className="text-gray-400 ml-1" />
                                                        </div>
                                                        {isOutOfStock ? (
                                                            <div className="flex items-center bg-red-100 px-2.5 py-1 rounded-lg">
                                                                <AlertCircle size={10} className="text-red-600" />
                                                                <span className="text-[9px] text-red-600 font-black uppercase ml-1">Sold Out / Low</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center bg-rose-50/50 border border-red-100/50 px-2.5 py-1 rounded-lg">
                                                                <ShieldCheck size={10} className="text-[#e11955]" />
                                                                <span className="text-[9px] text-[#e11955] font-black ml-1 uppercase">Direct from Supplier</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Trust Info */}
                                            <div className="px-4 pb-3 flex items-center">
                                                <Truck size={14} className="text-slate-500" />
                                                <span className="text-[10px] text-gray-400 font-bold ml-1.5">Delivery in 5-7 Days • Free Returns if damaged</span>
                                            </div>
                                        </motion.div>

                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* RIGHT COL: SUMMARY COMPONENT */}
                        {cartItems.length > 0 && (
                            <div className="mt-4 md:mt-0 md:sticky md:top-[90px]">
                                <div className="bg-white p-5 md:rounded-3xl md:border md:border-gray-100 md:shadow-lg">
                                    <p className="text-[14px] font-bold text-gray-800 mb-6">Price Details ({cartItems.length} Items)</p>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-xs font-medium">Total Product Price</span>
                                            <span className="text-gray-900 font-medium text-xs">+ ₹{calculateOriginalTotal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-green-600 text-xs font-medium">Total Discounts</span>
                                            <span className="text-green-600 font-bold text-xs">- ₹{savings}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-xs font-medium">Delivery Charge</span>
                                            <span className={`font-bold text-xs ${isFreeDelivery ? 'text-green-600' : 'text-gray-900'}`}>
                                                {isFreeDelivery ? 'FREE' : `+ ₹${deliveryChargeAmt}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-[1px] bg-gray-100 mb-5" />

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-sm font-bold text-gray-800 uppercase tracking-tighter">Order Total</span>
                                        <span className="text-lg font-bold text-gray-900">₹{orderTotal}</span>
                                    </div>

                                    <div className="bg-rose-50 p-3 rounded-xl flex items-center justify-center border border-rose-100/50 mb-4 md:mb-6">
                                        <Gift size={16} className="text-[#e11955]" />
                                        <span className="text-[#e11955] font-bold text-xs ml-2">Yay! Your total discount is ₹{savings}</span>
                                    </div>

                                    {/* Desktop visible checkout button */}
                                    <button
                                        disabled={isAnyOutOfStock}
                                        onClick={() => navigate('/checkout')}
                                        className={`hidden md:flex w-full py-4 rounded-lg items-center justify-center shadow-lg transition-all ${isAnyOutOfStock ? 'bg-gray-300' : 'bg-[#e11955] hover:opacity-90 shadow-rose-100'}`}
                                    >
                                        <span className="text-white font-black text-[13px] uppercase tracking-widest">{isAnyOutOfStock ? 'Out of Stock' : 'Continue'}</span>
                                        <ArrowRight size={16} className="text-white ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                    </div>
                )}
            </div>

            {/* STICKY BOTTOM BAR (MOBILE) */}
            {(cartItems.length > 0 && !loading) && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex flex-row items-center justify-between px-5 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
                    <div>
                        <span className="text-[18px] font-bold text-gray-900 leading-tight block">
                            ₹{orderTotal}
                        </span>
                        <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                            <span className="text-[#e11955] text-[10px] font-bold uppercase tracking-widest mt-0.5">View Breakdown</span>
                        </button>
                    </div>
                    <button
                        disabled={isAnyOutOfStock}
                        onClick={() => navigate('/checkout')}
                        className={`px-8 h-12 rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition-all ${isAnyOutOfStock ? 'bg-gray-300' : 'bg-[#e11955] shadow-rose-100'}`}
                    >
                        <span className="text-white font-bold text-[14px] uppercase tracking-widest">{isAnyOutOfStock ? 'Out of Stock' : 'Continue'}</span>
                        <ArrowRight size={16} className="text-white ml-2" />
                    </button>
                </div>
            )}

            {/* EDIT MODAL OVERLAY */}
            <AnimatePresence>
                {isEditModalVisible && editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center md:items-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditModalVisible(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                                <span className="text-base font-bold text-gray-800 tracking-widest uppercase">Select Size & Qty</span>
                                <button onClick={() => setIsEditModalVisible(false)} className="bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                                    <X size={20} className="text-gray-700" />
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Preview Row */}
                                <div className="flex mb-6">
                                    <img 
                                        src={resolveImageUrl(editingItem.productId?.images?.[0] || editingItem.productId?.image)} 
                                        className="w-16 h-20 rounded bg-gray-50 object-cover border border-gray-100" 
                                        alt="" 
                                    />
                                    <div className="flex-1 ml-4 flex flex-col justify-center">
                                        <span className="text-[12px] font-bold text-gray-800 mb-1 line-clamp-2">
                                            {editingItem.productId?.productName}
                                        </span>
                                        <div className="flex items-center">
                                            <span className="text-[15px] font-black text-gray-900">₹{getTieredPrice(editingItem.productId, tempQty)}</span>
                                            <span className="text-[11px] text-gray-400 line-through ml-2">₹{editingItem.productId?.variants?.[0]?.mrp || editingItem.productId?.variants?.[0]?.listingPrice}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls Row */}
                                <div className="flex gap-4 mb-8">
                                    <div className="flex-1">
                                        <span className="block text-gray-400 text-[10px] font-bold mb-2 uppercase tracking-wide">Size</span>
                                        <button className="w-full flex items-center justify-between border border-gray-100 px-3 py-2.5 rounded-lg bg-gray-50/50">
                                            <span className="text-xs font-bold text-gray-800">{editingItem.size || 'Free Size'}</span>
                                            <ChevronDown size={14} className="text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-gray-400 text-[10px] font-bold mb-2 uppercase tracking-wide">Qty</span>
                                        <div className="flex items-center justify-between border border-gray-100 p-1 rounded-lg bg-gray-50/50">
                                            <button 
                                                onClick={() => setTempQty(Math.max(1, tempQty - 1))}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100"
                                            >
                                                <Minus size={14} className="text-gray-600" />
                                            </button>
                                            <span className="text-[14px] font-bold text-gray-800">{tempQty}</span>
                                            <button 
                                                onClick={() => setTempQty(tempQty + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100"
                                            >
                                                <Plus size={14} className="text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-8 border-t border-gray-50 pt-4">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Price</span>
                                    <span className="text-[20px] font-black text-gray-900">₹{getTieredPrice(editingItem.productId, tempQty) * tempQty}</span>
                                </div>

                                <button
                                    onClick={handleUpdateCart}
                                    className="w-full bg-[#e11955] py-4 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 active:opacity-90"
                                >
                                    <span className="text-white font-black text-[13px] uppercase tracking-widest">Update Cart</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Cart;
