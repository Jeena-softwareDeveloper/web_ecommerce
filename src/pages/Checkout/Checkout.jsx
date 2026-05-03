import React, { useState, useEffect, useMemo } from 'react';
import { toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, MapPin, CreditCard, 
    ShieldCheck, Plus, CheckCircle2, 
    Truck, Wallet, Smartphone, Landmark,
    ShoppingBag, ArrowRight, Check, X, Gift
} from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import { get_cart } from '../../store/reducers/wearCartReducer';
import { 
    place_order, 
    messageClear, 
    orderReset, 
    create_cashfree_order,
    verify_cashfree_payment,
    order_fail 
} from '../../store/reducers/orderReducer';
import { get_config } from '../../store/reducers/configReducer';
import { get_addresses, add_address, delete_address, update_address, clear_message } from '../../store/reducers/addressReducer';



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

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const buyNowItem = location.state?.buyNowItem;

    // Redux State
    const { cartItems, loader: cartLoading } = useSelector(state => state.wearCart);
    const { token, userInfo } = useSelector(state => state.auth);
    const { wearConfig, paymentKeys } = useSelector(state => state.config);
    const { orderInitiated, successMessage, errorMessage, loader: orderLoading } = useSelector(state => state.order || {}); 
    const { addresses, loader: addressLoading, successMessage: addressSuccess, errorMessage: addressError } = useSelector(state => state.address);

    const [step, setStep] = useState(1); // 1: Address, 2: Payment
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [editAddressId, setEditAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [selectedSubMethod, setSelectedSubMethod] = useState('upi'); // Default to UPI
    
    // Add Address Form State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: userInfo?.name || '',
        phone: userInfo?.phone || '',
        houseNo: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        type: 'Home'
    });

    const [isPincodeLoading, setIsPincodeLoading] = useState(false);

    // Auto-fetch City/State from Pincode
    useEffect(() => {
        const fetchLocation = async () => {
            if (newAddress.pincode?.length === 6) {
                setIsPincodeLoading(true);
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${newAddress.pincode}`);
                    const data = await res.json();
                    if (data[0]?.Status === "Success") {
                        const postOffice = data[0].PostOffice[0];
                        setNewAddress(prev => ({
                            ...prev,
                            city: postOffice.District,
                            state: postOffice.State,
                            area: prev.area || postOffice.Name
                        }));
                    }
                } catch (err) {
                    console.error("Pincode fetch error:", err);
                } finally {
                    setIsPincodeLoading(false);
                }
            }
        };
        fetchLocation();
    }, [newAddress.pincode]);

    useEffect(() => {
        if (addressSuccess) {
            toast.success(addressSuccess);
            dispatch(clear_message());
            closeAddressModal();
        }
        if (addressError) {
            toast.error(addressError);
            dispatch(clear_message());
        }
    }, [addressSuccess, addressError, dispatch]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(addresses.find(a => a.isDefault) || addresses[0]);
        }
    }, [addresses, selectedAddress]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        dispatch(get_cart());
        dispatch(get_config());
        dispatch(get_addresses());
    }, [dispatch, token, navigate]);

    // Same exactly logic as Cart for pricing
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

    const { calculateTotal, calculateOriginalTotal, savings, isAnyOutOfStock, checkoutItems } = useMemo(() => {
        let total = 0;
        let originalTotal = 0;
        let anyOutOfStock = false;

        const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;
        
        checkoutItems.forEach(item => {
            const product = item.productId || {};
            const variant = (product.variants || []).find(v => v.size === item.size) || product.variants?.[0];
            if (variant && variant.stock < item.quantity) anyOutOfStock = true;
            
            const tieredPrice = getTieredPrice(product, item.quantity);
            const basePrice = variant?.mrp || variant?.listingPrice || product.price || 0;

            total += (tieredPrice * item.quantity);
            originalTotal += (basePrice * item.quantity);
        });

        return {
            calculateTotal: total,
            calculateOriginalTotal: originalTotal,
            savings: originalTotal - total,
            isAnyOutOfStock: anyOutOfStock,
            checkoutItems
        };
    }, [cartItems, buyNowItem]);

    const deliveryChargeThreshold = wearConfig?.free_delivery_above || 1000; // Android used 1000 default
    const deliveryChargeAmt = wearConfig?.delivery_charge || 50;
    const isFreeDelivery = calculateTotal >= deliveryChargeThreshold;
    const appliedDeliveryCharge = isFreeDelivery ? 0 : deliveryChargeAmt;
    const finalTotal = calculateTotal + appliedDeliveryCharge;

    const canCod = wearConfig?.is_cod_enabled !== false && 
                   finalTotal >= (wearConfig?.cod_min_amount || 0) && 
                   finalTotal <= (wearConfig?.cod_max_amount || 10000);

    // Place Order Logic similar to Android
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        const groupedItems = checkoutItems.reduce((acc, item) => {
            const sellerId = item.productId?.sellerId || item.productId?._id;
            if (!acc[sellerId]) acc[sellerId] = [];
            acc[sellerId].push({
                productInfo: item.productId,
                quantity: item.quantity,
                size: item.size
            });
            return acc;
        }, {});

        const formattedProducts = Object.keys(groupedItems).map(sellerId => ({
            sellerId,
            products: groupedItems[sellerId],
            price: groupedItems[sellerId].reduce((sum, i) => sum + (getTieredPrice(i.productInfo, i.quantity) * i.quantity), 0)
        }));

        const orderData = {
            price: calculateTotal,
            products: formattedProducts,
            shipping_fee: appliedDeliveryCharge,
            shippingInfo: selectedAddress,
            userId: userInfo?.id || userInfo?._id,
            payment_method: paymentMethod
        };

        // ─── STEP 1: Create the order record (unpaid) ───────────────────────────
        let placedOrderId;
        try {
            const placeRes = await dispatch(place_order(orderData)).unwrap();
            placedOrderId = placeRes.orderId;
        } catch (err) {
            toast.error(err?.error || 'Failed to place order. Please try again.');
            return;
        }

        // ─── COD PATH: done ─────────────────────────────────────────────────────
        if (paymentMethod === 'COD') {
            navigate('/order-success', { state: { orderId: placedOrderId } });
            return;
        }

        // ─── ONLINE PATH: Cashfree ────────────────────────
        try {
            const { cashfreeAppId, cashfreeEnvironment } = paymentKeys;
            
            if (cashfreeAppId) {
                // --- CASHFREE PATH ---
                const cfRes = await dispatch(create_cashfree_order(placedOrderId)).unwrap();
                const { payment_session_id, order_id: cfOrderId } = cfRes.cashfreeOrder;

                // Dynamically load Cashfree script
                if (!window.Cashfree) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                }

                const cashfree = window.Cashfree({
                    mode: cashfreeEnvironment === 'PRODUCTION' ? "production" : "sandbox"
                });

                // DIRECT PAYMENT INITIATION - Bypass the Cashfree Selection Screen
                let checkoutOptions = {
                    paymentSessionId: payment_session_id,
                    redirectTarget: "_modal", 
                };

                // If user selected a specific sub-method in our UI, we pass it directly
                if (selectedSubMethod === 'upi') {
                    checkoutOptions.paymentMethod = {
                        upi: {
                            channel: window.innerWidth < 768 ? 'intent' : 'qrcode'
                        }
                    };
                } else if (selectedSubMethod === 'card') {
                    checkoutOptions.paymentMethod = {
                        card: {
                            channel: 'link'
                        }
                    };
                } else if (selectedSubMethod === 'nb') {
                    checkoutOptions.paymentMethod = {
                        netbanking: {
                            channel: 'link'
                        }
                    };
                } else if (selectedSubMethod === 'wallet') {
                    checkoutOptions.paymentMethod = {
                        app: {
                            channel: 'link'
                        }
                    };
                }

                cashfree.checkout(checkoutOptions).then(async (result) => {
                    if (result.error) {
                        toast.error(result.error.message);
                    }
                    if (result.paymentDetails) {
                        const loadingToast = toast.loading('Verifying payment...');
                        try {
                            await dispatch(verify_cashfree_payment({
                                cashfree_order_id: cfOrderId,
                                orderId: placedOrderId
                            })).unwrap();
                            toast.dismiss(loadingToast);
                            toast.success('Payment successful!');
                            navigate('/order-success', { state: { orderId: placedOrderId } });
                        } catch (verifyErr) {
                            toast.dismiss(loadingToast);
                            toast.error(verifyErr?.message || 'Verification failed. Contact support.');
                        }
                    }
                });

            } else {
                toast.error('Online payment gateway not configured. Please use COD.');
            }



        } catch (err) {
            toast.error(err?.message || 'Could not initiate payment. Please try again.');
        }
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        if (editAddressId) {
            dispatch(update_address({ id: editAddressId, info: newAddress }));
        } else {
            dispatch(add_address(newAddress));
        }
    };

    const handleEditAddress = (addr) => {
        setNewAddress({
            name: addr.name,
            phone: addr.phone,
            houseNo: addr.houseNo,
            area: addr.area,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            type: addr.type
        });
        setEditAddressId(addr._id);
        setShowAddressModal(true);
    };

    const closeAddressModal = () => {
        setShowAddressModal(false);
        setEditAddressId(null);
        setNewAddress({
            name: userInfo?.name || '',
            phone: userInfo?.phone || '',
            houseNo: '',
            area: '',
            city: '',
            state: '',
            pincode: '',
            type: 'Home'
        });
    };

    const handleDeleteAddress = (id) => {
        dispatch(delete_address(id));
        toast.success('Address deleted successfully');
    };

    // Progress Stepper Component (Refined with proper centering & animations)
    const ProgressStepper = () => {
        const steps = [
            { id: 0, label: 'Cart', icon: <ShoppingBag size={14} /> },
            { id: 1, label: 'Address', icon: <MapPin size={14} /> },
            { id: 2, label: 'Payment', icon: <CreditCard size={14} /> }
        ];

        // Current sub-step logic: 
        // step 1 (Address) means step 1 is active, step 0 is done.
        // step 2 (Payment) means step 2 is active, step 1 is done, step 0 is done.
        const currentActiveStep = step; // step is 1 or 2

        return (
            <div className="bg-white py-6 border-b border-gray-100 relative z-20">
                <div className="max-w-md mx-auto px-6">
                    <div className="flex items-center justify-between relative">
                        {/* THE BACKGROUND LINE */}
                        <div className="absolute top-[16px] left-4 right-4 h-[2px] bg-gray-100 z-0" />
                        
                        {/* THE ANIMATED PROGRESS LINE */}
                        <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ 
                                width: step === 1 ? '50%' : '100%',
                                transition: { duration: 0.8, ease: "circOut" }
                            }}
                            className="absolute top-[16px] left-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-[#e11955] to-[#e11955] z-0 origin-left"
                            style={{ 
                                left: '16px', 
                                width: 'calc(100% - 32px)',
                                transformOrigin: 'left'
                            }}
                        />

                        {steps.map((s, idx) => {
                            const isCompleted = (idx === 0) || (idx === 1 && step === 2);
                            const isActive = (idx === 1 && step === 1) || (idx === 2 && step === 2);
                            const isPending = !isCompleted && !isActive;

                            return (
                                <div key={s.id} className="flex flex-col items-center z-10 relative">
                                    <motion.div 
                                        initial={false}
                                        animate={{ 
                                            scale: isActive ? 1.1 : 1,
                                            backgroundColor: isCompleted ? '#10b981' : (isActive ? '#e11955' : '#f9fafb'),
                                            borderColor: isCompleted ? '#d1fae5' : (isActive ? '#ffe4e6' : '#f3f4f6')
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors duration-300`}
                                        onClick={() => {
                                            if (idx === 0) navigate('/cart');
                                            if (idx === 1 && step === 2) setStep(1);
                                        }}
                                    >
                                        {isCompleted ? (
                                            <Check size={14} className="text-white" strokeWidth={4} />
                                        ) : (
                                            <div className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                                                {isActive ? s.icon : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                            </div>
                                        )}
                                        
                                        {/* Pulse effect for active step */}
                                        {isActive && (
                                            <motion.div 
                                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-[#e11955] rounded-full -z-10"
                                            />
                                        )}
                                    </motion.div>
                                    <span className={`text-[10px] mt-2 font-black uppercase tracking-widest ${isActive ? 'text-[#e11955]' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderPaymentMethod = (id, label, icon, extraContent, disable = false) => (
        <button 
            disabled={disable}
            onClick={() => setPaymentMethod(id)} 
            className={`w-full flex items-center justify-between p-4 border-b border-gray-50 bg-white transition-all ${disable ? 'opacity-50 cursor-not-allowed' : ''} ${paymentMethod === id ? 'bg-rose-50/20' : ''}`}
        >
            <div className="flex-1 text-left">
                <div className="flex items-center">
                    <span className={`text-[15px] font-bold ${paymentMethod === id ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
                    {extraContent && <div className="ml-2">{extraContent}</div>}
                </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === id ? 'border-[#e11955]' : 'border-gray-300'}`}>
                {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-[#e11955]" />}
            </div>
        </button>
    );

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans overscroll-none touch-none">
            {/* FIXED TOP SECTION */}
            <div className="flex-none pt-[52px] bg-white z-10">
                <CommonHeader title={step === 1 ? "Preview Order" : "Payment Method"} />
                <ProgressStepper />
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 w-full">

                <div className="grid md:grid-cols-3 gap-0 md:gap-8 items-start">
                    
                    <div className="md:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                /* STEP 1: ADDRESS SELECTION */
                                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    
                                    {/* Selected Delivery Address Card */}
                                    <div className="bg-white px-4 py-5 mb-2 border-b border-gray-300 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:mb-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className="bg-rose-50 p-2 rounded-lg text-[#9F1239] shadow-sm border border-rose-100">
                                                    <MapPin size={18} />
                                                </div>
                                                <span className="text-gray-900 font-bold text-[14px] ml-3 uppercase tracking-tight">Delivery Address</span>
                                            </div>
                                            <button 
                                                onClick={() => setShowAddressModal(true)}
                                                className="bg-rose-50 px-4 py-1.5 rounded-full border border-red-100 shadow-sm"
                                            >
                                                <span className="text-[#e11955] font-black text-[10px] uppercase tracking-widest">+ Add New</span>
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {addresses.length === 0 && !addressLoading && (
                                                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No addresses found</p>
                                                    <button onClick={() => setShowAddressModal(true)} className="text-[#e11955] text-[10px] font-black underline mt-2">Add your first address</button>
                                                </div>
                                            )}
                                            {addresses.map(addr => (
                                                <div 
                                                    key={addr._id} 
                                                    onClick={() => setSelectedAddress(addr)}
                                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative group ${selectedAddress?._id === addr._id ? 'border-[#e11955] bg-rose-50/20' : 'border-gray-100 hover:border-red-100'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[13px] font-normal text-gray-800">
                                                            {addr.name} • {addr.phone}
                                                        </span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-normal uppercase text-gray-500">{addr.type}</span>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                                            >
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Edit</span>
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-4 pr-6">
                                                        {addr.houseNo}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Items Summary */}
                                    <div className="bg-white mb-2 pb-2 border-b border-gray-300 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
                                        <div className="px-5 py-4 border-b border-gray-100">
                                            <span className="text-[12px] font-bold uppercase text-gray-900 tracking-tighter">Items in Order</span>
                                        </div>
                                        {checkoutItems.map((item, idx) => {
                                            const product = item.productId || {};
                                            const displayPrice = getTieredPrice(product, item.quantity);
                                            const originalPrice = product.variants?.[0]?.mrp || product.variants?.[0]?.listingPrice || 0;

                                            return (
                                                <div key={item._id} className={`p-3 flex flex-row ${idx !== checkoutItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                                    <img src={resolveImageUrl(product.images?.[0])} className="w-16 h-20 rounded-lg bg-gray-50 object-cover border border-gray-100 shadow-sm" alt="" />
                                                    <div className="flex-1 ml-4 flex flex-col justify-between py-0.5">
                                                        <div>
                                                            <p className="text-gray-700 font-bold text-[11px] uppercase leading-tight mb-1 line-clamp-2">{product.productName}</p>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-[15px] text-gray-900">₹{displayPrice}</span>
                                                                <span className="text-[11px] text-gray-400 line-through font-medium">₹{originalPrice}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg text-[9px] text-gray-700 font-bold uppercase">Size: {item.size}</div>
                                                            <div className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg text-[9px] text-gray-700 font-bold uppercase">Qty: {item.quantity}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="hidden md:block">
                                        <button disabled={!selectedAddress} onClick={() => setStep(2)} className="w-full mt-6 py-4 bg-[#e11955] text-white rounded-lg font-bold uppercase tracking-widest shadow-lg shadow-rose-100 flex items-center justify-center disabled:opacity-50">
                                            <span>Continue to Payment</span><ArrowRight size={16} className="ml-2" />
                                        </button>
                                    </div>

                                </motion.div>
                            ) : (
                                /* STEP 2: PAYMENT METHOD */
                                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    
                                    <div className="px-4 py-4 bg-white border-b border-gray-100">
                                        <p className="text-gray-900 font-bold text-sm uppercase tracking-tight">Select Payment Method</p>
                                    </div>

                                    {/* Hand-coded Options tracking accurately mobile design */}
                                    
                                    {/* COD Option */}
                                    <div className={`bg-white mb-2 border-t border-b border-gray-100 md:rounded-2xl md:border md:shadow-sm md:overflow-hidden ${!canCod ? 'opacity-50' : ''}`}>
                                        {renderPaymentMethod(
                                            'COD',
                                            'Cash on Delivery',
                                            null,
                                            !canCod 
                                                ? <span className="text-[10px] text-red-500 font-bold">
                                                    {calculateTotal < wearConfig?.cod_min_amount ? `Min ₹${wearConfig.cod_min_amount} for COD` :
                                                     calculateTotal > wearConfig?.cod_max_amount ? `Max ₹${wearConfig.cod_max_amount} for COD` : 'Disabled'}
                                                  </span>
                                                : <div className="flex items-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Pay on receiving</span>
                                                  </div>,
                                            !canCod
                                        )}
                                    </div>

                                    {/* Online Option Header (Visual only, selection happens in sub-methods) */}
                                    <div 
                                        onClick={() => setPaymentMethod('ONLINE')}
                                        className={`bg-white mb-4 border-t border-b border-gray-100 md:rounded-2xl md:border md:shadow-sm md:overflow-hidden cursor-pointer ${paymentMethod === 'ONLINE' ? 'bg-rose-50/10 border-rose-100' : ''}`}
                                    >
                                        <div className="w-full flex items-center justify-between p-4 bg-transparent">
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center">
                                                    <span className={`text-[15px] font-bold ${paymentMethod === 'ONLINE' ? 'text-gray-900' : 'text-gray-600'}`}>Pay Online</span>
                                                    <div className="ml-2">
                                                        <div className="flex items-center">
                                                            <span className="text-[#e11955] font-black text-base mr-2">₹{finalTotal}</span>
                                                            <span className="bg-rose-50 text-[#e11955] text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-100">Safe Secure</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* No radio button here, handled by sub-methods */}
                                        </div>
                                        {/* Bank Offers Banner */}
                                        <div className="px-4 py-3 flex items-center border-t border-gray-50 bg-green-50/30">
                                            <div className="bg-green-600 p-0.5 rounded-sm text-white"><Landmark size={12} strokeWidth={3} /></div>
                                            <span className="text-gray-600 text-[11px] font-bold ml-2 flex-1">Extra discount with bank offers</span>
                                            <span className="text-green-700 text-[11px] font-bold cursor-pointer hover:underline">View Offers</span>
                                        </div>
                                    </div>



                                    {/* Sub-Payment Method Selection (Custom UI) */}
                                    <div className="bg-white border-t border-b border-gray-100 md:rounded-2xl md:border md:shadow-sm md:overflow-hidden">
                                        {[
                                            { id: 'upi', label: 'Pay by any UPI App', icon: <Smartphone size={18} /> },
                                            { id: 'wallet', label: 'Wallet', icon: <Wallet size={18} /> },
                                            { id: 'card', label: 'Debit/Credit Cards', icon: <CreditCard size={18} /> },
                                            { id: 'nb', label: 'Net Banking', icon: <Landmark size={18} /> }
                                        ].map((item) => (
                                            <button 
                                                key={item.id} 
                                                onClick={() => {
                                                    setPaymentMethod('ONLINE');
                                                    setSelectedSubMethod(item.id);
                                                }}
                                                className={`w-full px-4 py-4 flex items-center justify-between border-b border-gray-50 transition-colors ${selectedSubMethod === item.id ? 'bg-rose-50/10' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-lg mr-3 transition-colors ${selectedSubMethod === item.id ? 'bg-rose-100 text-[#e11955]' : 'bg-gray-50 text-gray-400'}`}>
                                                        {item.icon}
                                                    </div>
                                                    <span className={`text-[14px] font-bold ${selectedSubMethod === item.id ? 'text-[#e11955]' : 'text-gray-700'}`}>{item.label}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    {item.id === 'upi' && <span className="text-green-700 text-[10px] font-black uppercase tracking-widest mr-2 bg-green-50 px-2 py-0.5 rounded">Offers</span>}
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedSubMethod === item.id ? 'border-[#e11955]' : 'border-gray-300'}`}>
                                                        {selectedSubMethod === item.id && <div className="w-2.5 h-2.5 rounded-full bg-[#e11955]" />}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="hidden md:block">
                                        <button disabled={orderLoading || isAnyOutOfStock} onClick={handlePlaceOrder} className="w-full mt-6 py-4 bg-[#e11955] text-white rounded-lg font-black uppercase tracking-widest shadow-lg shadow-rose-100 flex items-center justify-center disabled:opacity-50 hover:opacity-90">
                                            {orderLoading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><span>Pay ₹{finalTotal} & Place Order</span><ArrowRight size={16} className="ml-2" /></>
                                            )}
                                        </button>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT COL: SUMMARY COMPONENT */}
                    <div className={`${step === 1 ? 'block' : 'hidden md:block'} mt-4 md:mt-0 md:sticky md:top-[90px]`}>
                        <div className="bg-white p-5 md:rounded-3xl md:border md:border-gray-100 md:shadow-lg">
                             <p className="text-[13px] font-black text-gray-900 mb-6 uppercase tracking-widest">Price Details ({checkoutItems.length} Items)</p>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-xs font-medium">Total Product Price</span>
                                    <span className="text-gray-900 font-medium text-xs">+ ₹{calculateOriginalTotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-600 text-xs font-normal">Total Discounts</span>
                                    <span className="text-green-600 font-medium text-xs">- ₹{savings}</span>
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
                                <span className="text-lg font-bold text-gray-900">₹{finalTotal}</span>
                            </div>

                            <div className="bg-rose-50 p-3 rounded-xl flex items-center justify-center border border-rose-100/50">
                                <Gift size={16} className="text-[#e11955]" />
                                <span className="text-[#e11955] font-bold text-xs ml-2">Yay! Your total discount is ₹{savings}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* STICKY BOTTOM BAR (MOBILE ONLY) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex flex-row items-center justify-between p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] z-40">
                <div className="ml-2">
                    <span className="text-[18px] font-bold text-secondary leading-tight block">₹{finalTotal}</span>
                    <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                        <span className="text-[#e11955] text-[10px] font-bold uppercase tracking-widest block mt-0.5">Price Details</span>
                    </button>
                </div>
                
                {step === 1 ? (
                    <button
                        onClick={() => {
                            if (!selectedAddress) {
                                toast.dismiss();
                                toast.error("Please select a delivery address");
                            } else {
                                setStep(2);
                            }
                        }}
                        disabled={isAnyOutOfStock}
                        className={`px-10 h-12 rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition-all ${isAnyOutOfStock ? 'bg-gray-300' : 'bg-[#e11955] shadow-rose-100'}`}
                    >
                        <span className="text-white font-bold text-[14px] uppercase tracking-widest">{isAnyOutOfStock ? 'Fix Cart' : 'Continue'}</span>
                    </button>
                ) : (
                    <button
                        disabled={isAnyOutOfStock || orderLoading}
                        onClick={handlePlaceOrder}
                        className={`px-8 h-12 rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition-all ${isAnyOutOfStock ? 'bg-gray-300' : 'bg-[#e11955] shadow-rose-100'}`}
                    >
                        {orderLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="text-white font-bold text-[14px] uppercase tracking-widest">Place Order</span>
                                <ArrowRight size={16} className="text-white ml-2" />
                            </>
                        )}
                    </button>
                )}
            </div>
            
            {/* ADDRESS MODAL */}
            <AnimatePresence>
                {showAddressModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4"
                        onClick={() => setShowAddressModal(false)}
                    >
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tighter uppercase">{editAddressId ? 'Update Address' : 'Add New Address'}</h2>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">{editAddressId ? 'Update your delivery details' : 'Where should we deliver?'}</p>
                                </div>
                                <button onClick={closeAddressModal} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddAddress} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-8 overflow-y-auto no-scrollbar space-y-6 flex-1">
                                    {/* IDENTITY FIELDS */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input required value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-gray-800 outline-none focus:border-rose-300 transition-colors" placeholder="Recipient Name" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-gray-800 outline-none focus:border-rose-300 transition-colors" placeholder="Contact No." />
                                        </div>
                                    </div>

                                    {/* SMART PINCODE FIELD */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                                        <div className="relative">
                                            <input required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} type="tel" maxLength={6} className="w-full bg-rose-50/10 border border-rose-100 rounded-lg p-4 font-medium text-gray-800 outline-none focus:border-rose-300 transition-colors" placeholder="6-Digit Pincode" />
                                            {isPincodeLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">House No / Flat / Building</label>
                                        <input required value={newAddress.houseNo} onChange={e => setNewAddress({...newAddress, houseNo: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-gray-800 outline-none focus:border-rose-300 transition-colors" placeholder="e.g. 402, Royal Residency" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Area / Landmark</label>
                                        <input required value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-gray-800 outline-none focus:border-rose-300 transition-colors" placeholder="e.g. Near City Mall" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City / Town</label>
                                            <input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-gray-800 outline-none focus:border-rose-300 transition-colors" placeholder="City" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">State</label>
                                            <input required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-gray-800 outline-none focus:border-rose-300 transition-colors" placeholder="State" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pb-4">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Address Type</label>
                                        <div className="flex gap-3">
                                            {['Home', 'Office', 'Other'].map(type => (
                                                <button 
                                                    key={type} type="button" 
                                                    onClick={() => setNewAddress({...newAddress, type})}
                                                    className={`flex-1 py-3.5 rounded-lg border-2 font-bold text-xs uppercase tracking-widest transition-all ${newAddress.type === type ? 'bg-[#e11955] border-[#e11955] text-white shadow-lg shadow-rose-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* FIXED FOOTER SECTION */}
                                <div className="p-6 border-t border-gray-50 bg-white">
                                    <button 
                                        className="w-full bg-[#e11955] py-5 rounded-lg text-white font-semibold text-xs uppercase tracking-widest shadow-xl shadow-rose-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                        type="submit"
                                        disabled={addressLoading}
                                    >
                                        {addressLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{editAddressId ? 'Update Address' : 'Save & Continue'} <Check size={16} /></>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Checkout;
