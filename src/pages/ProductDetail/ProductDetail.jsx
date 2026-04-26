import React, { useState, useEffect, useMemo } from 'react';
import { toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ShoppingCart, ShieldCheck, Star,
    ArrowRight, Truck, Plus, Minus, Heart, Award,
    CheckCircle2, User, ThumbsUp, Copy, Check,
    Zap, Gift, MapPin, ChevronDown, ChevronUp, X,
    Share2, AlertCircle, RefreshCcw, Package
} from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import ProductCard from '../../components/common/ProductCard';
import DeliveryEstimator from '../../components/product/DeliveryEstimator';
import apiClient from '../../api/apiClient';
import {
    get_product_details,
    get_related_products,
    get_similar_products,
    get_product_social_stats,
    get_delivery_estimate
} from '../../store/reducers/wearProductReducer';
import { get_reviews } from '../../store/reducers/reviewReducer';
import { add_to_cart, get_cart } from '../../store/reducers/wearCartReducer';
import { get_active_offers, get_global_offers } from '../../store/reducers/vendorOfferReducer';


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

// Trusted Badge - exact match to mobile
const TrustedBadge = () => (
    <div className="flex flex-row items-center bg-[#f5eefc] px-2 py-0.5 rounded">
        <div className="bg-[#5c2d91] rounded-sm px-1 flex items-center justify-center mr-1">
            <span className="text-white text-[8px] font-black">M</span>
        </div>
        <span className="text-[#5c2d91] font-black text-[10px]">Trusted</span>
    </div>
);

const ProductDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isDemo = new URLSearchParams(location.search).get('demo') === 'true';

    const { 
        productDetails: product, 
        loader: loading, 
        relatedProducts: relatedProductsFromStore,
        similarProducts,
        socialStats
    } = useSelector(state => state.wearProduct);
    const { token, userInfo } = useSelector(state => state.auth);
    const { reviews, stats: reviewStats } = useSelector(state => state.review);
    const { globalOffers: systemOffers } = useSelector(state => state.vendorOffer);
    const { profileInfo } = useSelector(state => state.profile);

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedQty, setSelectedQty] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [sizeUnit, setSizeUnit] = useState('inch');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [selectedImageToView, setSelectedImageToView] = useState(null);
    const [recentProducts, setRecentProducts] = useState([]);
    const [isCopied, setIsCopied] = useState(false);
    const [fetchingEDD, setFetchingEDD] = useState(false);
    const [estimatedDate, setEstimatedDate] = useState(null);
    const [sellerCity, setSellerCity] = useState('');
    const [localPincode, setLocalPincode] = useState('');

    // 1. Automatic Location Detection (if no pincode)
    useEffect(() => {
        if (!profileInfo?.pincode && !localPincode && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await apiClient.get(`/wear/delivery/pincode`, {
                        params: { lat: latitude, lng: longitude }
                    });
                    if (res.data?.success && res.data.pincode) {
                        setLocalPincode(res.data.pincode);
                    }
                } catch (err) {
                    // Fail silently in production
                }
            });
        }
    }, [profileInfo?.pincode]);

    // 2. Fetch delivery estimate (depends on saved or local pincode)
    useEffect(() => {
        const fetchEDD = async () => {
            const activePincode = profileInfo?.pincode || localPincode;
            if (product?._id && activePincode) {
                setFetchingEDD(true);
                try {
                    const response = await apiClient.get(`/wear/delivery/edd`, {
                        params: { productId: product._id, deliveryPincode: activePincode }
                    });
                    if (response.data?.success) {
                        setEstimatedDate(new Date(response.data.edd));
                        setSellerCity(response.data.sellerCity || '');
                    }
                } catch (error) {
                    // Fail silently in production
                } finally {
                    setFetchingEDD(false);
                }
            }
        };
        fetchEDD();
    }, [product?._id, profileInfo?.pincode, localPincode]);

    // Fetch all data
    useEffect(() => {
        if (id) {
            dispatch(get_product_details(id));
            dispatch(get_active_offers());
            dispatch(get_global_offers());
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (product) {
            // Social stats for all variants
            const allIds = [product._id];
            if (product.catalogId) {
                dispatch(get_similar_products({ catalogId: product.catalogId, productId: product._id }));
                dispatch(get_reviews(product.catalogId));
            }
            
            // Related / Category products
            if (product.category) {
                dispatch(get_related_products({ category: product.category, productId: product._id }));
            }

            dispatch(get_product_social_stats(allIds));

            // AI Personalization Tracking
            const referrer = document.referrer || 'direct';
            apiClient.post('/wear/home/customer/ai/track-behavior', {
                productId: product._id,
                category: product.category,
                referrer: referrer,
                viewDuration: 0
            }).catch(e => console.error("Tracking Error", e));

            if (product.variants?.length > 0 && !selectedSize) {
                const firstVariantSize = product.variants[0].size?.toLowerCase();
                const isNoSize = !firstVariantSize || firstVariantSize === 'no size' || firstVariantSize === 'nosize';
                if (!isNoSize) setSelectedSize(product.variants[0].size);
            }
            addToRecent(product);
        }
    }, [product, dispatch]);

    // Handle social stats for similar products once they arrive
    useEffect(() => {
        if (similarProducts.length > 0) {
            const allIds = [product?._id, ...similarProducts.map(p => p._id)].filter(Boolean);
            dispatch(get_product_social_stats(allIds));
        }
    }, [similarProducts, dispatch, product?._id]);

    // Recently Viewed
    const addToRecent = (prod) => {
        try {
            const sanitized = {
                _id: prod._id, productName: prod.productName, images: prod.images,
                price: prod.price, variants: prod.variants, category: prod.category
            };
            const local = JSON.parse(localStorage.getItem('recentProducts') || '[]');
            const filtered = local.filter(p => p._id !== sanitized._id);
            const updated = [sanitized, ...filtered].slice(0, 20);
            localStorage.setItem('recentProducts', JSON.stringify(updated));
            setRecentProducts(updated);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const local = JSON.parse(localStorage.getItem('recentProducts') || '[]');
        setRecentProducts(local);
    }, []);


    // Offers deduplicated
    const availableOffers = useMemo(() => {
        const prodOffers = (product?.offers || []).map(o => ({ ...o, isSystem: false }));
        const sysOffers = (systemOffers || []).map(o => ({ ...o, isSystem: true }));
        const combined = [...prodOffers, ...sysOffers];
        const seen = new Set();
        return combined.filter(offer => {
            const key = offer._id || `${offer.title}-${offer.subtitle || offer.description}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [product?.offers, systemOffers]);
    
    // Stable order for styles
    const allStyles = useMemo(() => {
        if (!product) return [];
        const combined = [product, ...similarProducts];
        // Deduplicate by ID
        const unique = combined.reduce((acc, curr) => {
            if (!acc.find(p => p._id === curr._id)) acc.push(curr);
            return acc;
        }, []);
        // Sort by ID to keep order absolutely stable across navigation
        return unique.sort((a, b) => a._id.localeCompare(b._id));
    }, [product, similarProducts]);

    // Cart
    const handleAddToCart = async (buyNow = false) => {
        if (isDemo) {
            toast('This is a demo view of your product. Purchasing is disabled.', { icon: 'ℹ️' });
            return;
        }
        
        if (!token) { navigate('/login'); return; }
        
        if (!isNoSize && !selectedSize) {
            toast.error('Please select a size first');
            return;
        }
        
        const variant = product.variants?.find(v => v.size === selectedSize);
        let finalPrice = variant?.listingPrice || product.variants?.[0]?.listingPrice || product.price || 0;
        if (variant?.priceTiers?.length > 0) {
            const tier = [...variant.priceTiers].sort((a, b) => b.minQty - a.minQty).find(t => selectedQty >= t.minQty);
            if (tier) finalPrice = tier.price;
        }

        const bItem = {
            productId: product,
            quantity: selectedQty,
            size: selectedSize,
            _id: `buynow-${Date.now()}`,
            price: parseInt(String(finalPrice).replace(/[^0-9]/g, '')) || 0
        };

        if (buyNow) {
            navigate('/checkout', { state: { buyNowItem: bItem } });
            return;
        }

        setIsAddingToCart(true);
        try {
            await dispatch(add_to_cart({
                productId: product._id,
                quantity: selectedQty,
                size: selectedSize,
                price: bItem.price
            })).unwrap();
            toast.dismiss();
            toast.success('Added to cart!');
            dispatch(get_cart());
        } catch (err) {
            toast.error(err.message || 'Failed to add to cart');
            console.error(err);
        }
        finally { setIsAddingToCart(false); }
    };

    const copyHighlights = () => {
        const text = [
            `Product: ${product.productName}`,
            `Category: ${product.category}`,
            `Link: ${window.location.href}`
        ].join('\n');
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Loading state
    if (loading || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <CommonHeader title="Loading..." />
                <div className="flex flex-col items-center justify-center space-y-3 pt-20">
                    <div className="w-10 h-10 border-4 border-[#e11955]/20 border-t-[#e11955] rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading Premium Fashion...</p>
                </div>
            </div>
        );
    }

    const images = (product.images || [product.image]).filter(Boolean).map(resolveImageUrl);
    const currentVariant = product.variants?.find(v => v.size === selectedSize);
    const price = currentVariant?.listingPrice || product.variants?.[0]?.listingPrice || product.price;
    const mrp = currentVariant?.mrp || product.variants?.[0]?.mrp || product.mrp || product.originalPrice;
    const pureMrp = parseFloat(String(mrp || 0).replace(/[^0-9.]/g, '')) || 0;
    const purePrice = parseFloat(String(price || 0).replace(/[^0-9.]/g, '')) || 0;
    const discount = pureMrp > purePrice ? Math.round(((pureMrp - purePrice) / pureMrp) * 100) : 0;
    const savings = pureMrp - purePrice;
    const avgRating = reviewStats?.avgRating || 0;
    const totalReviews = reviewStats?.totalReviews || 0;
    const ratingDist = reviewStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
    const relatedProducts = (relatedProductsFromStore || []).filter(p => p._id !== product._id);

    // Variation name extraction (matches mobile)
    const fullName = product.productName || product.name || '';
    const variationMatch = fullName.match(/\(([^)]+)\)/);
    const variationName = variationMatch ? variationMatch[1] : null;
    const displayName = variationName || fullName;

    // Size variants: hide if "no size"
    const variants = product.variants || [];
    const firstVariantSize = variants.length > 0 ? (variants[0]?.size || '').toLowerCase() : '';
    const isNoSize = variants.length === 0 || firstVariantSize === 'no size' || firstVariantSize === 'nosize' || firstVariantSize === '';

    return (
        <div className="min-h-screen bg-white md:bg-gray-50 pb-[60px] md:pb-0">
            <CommonHeader title=" " backPath="/" />

            {/* Offset for fixed header */}
            <div className="pt-[52px] md:pt-[60px]">

                {/* ===== DESKTOP: 2-col grid wrapper ===== */}
                <div className="">
                <div className="md:grid md:grid-cols-[400px_1fr] md:gap-10 md:items-start">

                {/* ===== LEFT COL: IMAGE GALLERY ===== */}
                <div className="md:sticky md:top-[70px]">

                {/* ===== 1. IMAGE CAROUSEL ===== */}
                <div className="bg-white relative md:rounded-2xl md:overflow-hidden md:border md:border-gray-100 md:shadow-sm">
                    <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                        <div
                            className="flex h-full transition-transform duration-300 ease-out"
                            style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                        >
                            {images.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex-none w-full h-full flex items-center justify-center bg-white cursor-zoom-in relative group overflow-hidden" 
                                    onClick={() => { setSelectedImageToView(img); setShowImageViewer(true); }}
                                >
                                    <motion.img 
                                        src={img} 
                                        alt={displayName} 
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-150 origin-center" 
                                        whileHover={{ scale: 1.5 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    />
                                    {/* Zoom Hint */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                                            <Zap size={20} className="text-[#e11955]" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Floating product code */}
                        <div className="absolute bottom-14 left-4 bg-black/20 px-2 py-0.5 rounded">
                            <span className="text-white/60 text-[10px] font-medium uppercase tracking-tighter">
                                s-{product._id?.substring(0, 10)}
                            </span>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/40 backdrop-blur-sm p-1.5 rounded-full border border-white/20 pointer-events-none">
                            <Plus size={16} className="text-black/40" />
                        </div>
                    </div>

                    {/* Pagination dots */}
                    <div className="flex justify-center gap-1 py-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImageIndex(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === i ? 'w-6 bg-[#e11955]' : 'w-4 bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop thumbnail strip */}
                {images.length > 1 && (
                    <div className="hidden md:flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImageIndex(i)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === i ? 'border-[#e11955]' : 'border-gray-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                )}

                </div>
                <div className="md:bg-white md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:p-6 md:space-y-0">

                {similarProducts && similarProducts.length > 1 && (
                    <div className="bg-white px-4 py-2.5 border-b border-gray-100 md:border md:rounded-xl md:mb-3">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-bold text-gray-800">Available Styles</span>
                            {similarProducts.length > 0 && (
                                <div className="bg-green-50 px-2 py-0.5 rounded">
                                    <span className="text-[9px] font-bold text-green-700 uppercase">
                                        {similarProducts.length} Styles Available
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                            {allStyles.map((p, i) => {
                                const isCurrent = p._id === product._id;
                                const img = isCurrent ? images[0] : resolveImageUrl(p.images?.[0] || p.image);
                                return (
                                    <button
                                        key={p._id || i}
                                        onClick={() => { 
                                            if (!isCurrent) {
                                                navigate(`/product/${p.slug || p._id}`, { replace: true });
                                            }
                                        }}
                                        className={`relative flex-shrink-0 w-[60px] h-[75px] rounded-xl border-2 overflow-hidden bg-white transition-all
                                            ${isCurrent ? 'border-[#e11955]' : 'border-gray-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ===== 3. PRICE & TITLE ===== */}
                <div className="bg-white px-4 pt-3 pb-3 md:px-0 md:pt-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                            {/* Product name */}
                            {variationName ? (
                                <h1 className="text-[11.5px] text-gray-800 font-medium uppercase tracking-tight leading-5">{variationName}</h1>
                            ) : (
                                <h1 className="text-[11.5px] font-medium text-gray-800 leading-tight">{fullName}</h1>
                            )}

                            {/* Price Section Redesign */}
                            <div className="flex flex-col mt-2.5">
                                <div className="flex items-baseline gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Special Price</span>
                                        <div className="flex items-center">
                                            <span className="text-[28px] font-bold text-gray-900 tracking-tight">₹{price}</span>
                                            <CheckCircle2 size={16} className="text-[#23BB75] ml-1.5 fill-[#23BB75] text-white" />
                                        </div>
                                    </div>
                                    {mrp && (
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">MRP</span>
                                            <span className="text-[18px] text-gray-400 line-through font-normal">₹{mrp}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Share button */}
                        <div className="flex flex-col items-center pt-1">
                            <button
                                onClick={() => navigator.share?.({ title: product.productName, url: window.location.href }).catch(() => navigator.clipboard.writeText(window.location.href))}
                                className="p-2.5 rounded-full bg-gray-50 border border-gray-100"
                            >
                                <Share2 size={20} className="text-gray-600" />
                            </button>
                            <span className="text-[10px] mt-1 font-bold text-gray-500 uppercase tracking-tighter">Share</span>
                        </div>
                    </div>

                    {/* ULTRA-SLIM MICRO-RIBBON - TRUE FULL WIDTH */}
                    {discount > 0 && (
                        <div className="mb-3 -mx-4 md:-mx-0 bg-[#038d63] py-0.5 flex items-center justify-center border-y border-[#02704f]">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-black text-[10px] uppercase tracking-wider bg-white/10 px-1.5 rounded">
                                    {discount}% OFF
                                </span>
                                <span className="text-white font-bold text-[10px] uppercase tracking-wide">
                                    SAVE ₹{Math.round(savings)} INSTANTLY
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ===== STOCK & TRUST TAGS (Single Scrollable Row) ===== */}
                    <div className="flex items-center gap-3 mb-3 overflow-x-auto no-scrollbar pb-1">
                        {/* Stock status */}
                        {totalStock <= 0 ? (
                            <div className="bg-red-50 px-3 py-1 rounded-full flex items-center border border-red-200 gap-1.5 shrink-0">
                                <AlertCircle size={14} className="text-red-500" />
                                <span className="text-[10px] md:text-[11px] font-bold text-red-600">Out of Stock</span>
                            </div>
                        ) : totalStock < 10 ? (
                            <div className="bg-orange-50 px-3 py-1 rounded-full flex items-center border border-orange-200 gap-1.5 shrink-0">
                                <span className="text-[10px] md:text-[11px] font-bold text-orange-600 uppercase tracking-tighter italic">Only {totalStock} Left!</span>
                            </div>
                        ) : (
                            <div className="bg-green-50 px-3 py-1 rounded-full flex items-center border border-green-200 gap-1.5 shrink-0">
                                <CheckCircle2 size={14} className="text-green-600" />
                                <span className="text-[10px] md:text-[11px] font-bold text-green-700">In Stock</span>
                            </div>
                        )}
                        <div className="bg-indigo-50 px-3 py-1 rounded-full flex items-center border border-indigo-100 gap-1.5 shrink-0">
                            <ShieldCheck size={14} className="text-indigo-600" />
                            <span className="text-[10px] md:text-[11px] font-bold text-indigo-700">Safe Payments</span>
                        </div>
                        <div className="bg-teal-50 px-3 py-1 rounded-full flex items-center border border-teal-100 gap-1.5 shrink-0">
                            <RefreshCcw size={14} className="text-teal-600" />
                            <span className="text-[10px] md:text-[11px] font-bold text-teal-700 whitespace-nowrap">Easy 7-Day Return</span>
                        </div>
                    </div>

                    {/* ===== OFFERS ===== */}
                    {availableOffers.length > 0 && (
                        <div className="mb-3">
                            <div className="flex items-center mb-3 gap-2">
                                <Zap size={18} className="text-[#e11955]" />
                                <span className="text-[13px] font-bold text-gray-800">Available Offers</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {availableOffers.map((offer, oIdx) => (
                                    <div
                                        key={`offer-${offer._id || oIdx}`}
                                        className={`flex-shrink-0 w-[240px] p-3 rounded-2xl border ${offer.isSystem ? 'bg-blue-50 border-blue-100' : 'bg-pink-50 border-pink-100'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            {offer.isSystem
                                                ? <Gift size={24} className="text-blue-700" />
                                                : <Zap size={24} className="text-pink-700" />}
                                            <div className="bg-white/60 px-2 py-0.5 rounded">
                                                <span className={`text-[10px] font-bold ${offer.isSystem ? 'text-blue-800' : 'text-pink-800'}`}>{offer.tag || 'OFFER'}</span>
                                            </div>
                                        </div>
                                        <p className="text-[13px] font-black text-gray-800 tracking-tight">{offer.title}</p>
                                        <p className="text-[11px] text-gray-600 mt-0.5 leading-4 font-medium line-clamp-2">{offer.subtitle || offer.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social proof */}
                    {socialStats[product._id] > 0 && (
                        <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg mb-3 border border-gray-100 gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-5 h-5 rounded-full bg-gray-300 border border-white flex items-center justify-center">
                                        <User size={10} className="text-white" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] font-medium text-gray-600">
                                <span className="font-bold text-gray-900">{socialStats[product._id]} people</span> bought this in the last month
                            </p>
                        </div>
                    )}

                    {/* Rating + Trusted badge row (matches mobile) */}
                    <div className="flex items-center mt-2 mb-0.5 gap-2">
                        <div className="bg-teal-600 px-2 py-0.5 rounded flex items-center gap-0.5">
                            <span className="text-white text-[11px] font-bold">
                                {avgRating > 0 ? avgRating : 'New'}
                            </span>
                            <Star size={10} className="fill-white text-white" />
                        </div>
                        <span className="text-gray-500 text-[11px]">({totalReviews} ratings)</span>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <TrustedBadge />
                    </div>

                    {/* Volume Discounts (Desktop) */}
                    {(() => {
                        const tiers = currentVariant?.priceTiers || [];
                        if (tiers.length === 0) return null;
                        return (
                            <div className="hidden md:block mt-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-indigo-100 p-1 rounded-lg">
                                        <Zap size={16} className="text-indigo-600" />
                                    </div>
                                    <span className="text-[13px] font-bold text-gray-800 uppercase tracking-tight">Bulk Purchase Discounts</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {tiers.map((tier, tIdx) => {
                                        const isActive = selectedQty >= tier.minQty && !tiers.some(t => t.minQty > tier.minQty && selectedQty >= t.minQty);
                                        return (
                                            <button
                                                key={tIdx}
                                                onClick={() => setSelectedQty(isActive ? 1 : tier.minQty)}
                                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all shadow-sm ${isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-indigo-50 hover:border-indigo-200'}`}
                                            >
                                                <div className="flex flex-col items-start">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white/70' : 'text-gray-400'}`}>Order</span>
                                                    <span className={`text-[14px] font-black ${isActive ? 'text-white' : 'text-gray-900'}`}>{tier.minQty}+ Qty</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white/70' : 'text-gray-400'}`}>Price</span>
                                                    <span className={`text-[16px] font-black ${isActive ? 'text-white' : 'text-[#e11955]'}`}>₹{tier.price}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium mt-3 text-center uppercase tracking-widest italic">
                                    Select a quantity to apply the discounted price automatically
                                </p>
                            </div>
                        );
                    })()}
                </div>

                {/* Desktop action buttons — shown only on md+ IN the right column */}
                <div className="hidden md:flex gap-3 mt-4 mb-2">
                    <button
                        onClick={() => handleAddToCart(false)}
                        disabled={isAddingToCart}
                        className="flex-1 h-12 border-2 border-[#e11955] rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                    >
                        <ShoppingCart size={16} className="text-[#e11955]" />
                        <span className="text-[#e11955] font-bold text-[11px] uppercase tracking-wider">
                            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                        </span>
                    </button>
                    <button
                        onClick={() => handleAddToCart(true)}
                        className="flex-[1.2] h-12 bg-[#e11955] rounded-xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
                    >
                        <Zap size={18} className="text-white" />
                        <span className="text-white font-bold text-[11px] uppercase tracking-widest">Buy Now</span>
                    </button>
                </div>

                {/* ===== 4. SIZE SELECTION (hidden if no size) ===== */}
                {!isNoSize && (
                    <>
                        <div className="h-[6px] bg-gray-100/80 md:hidden" />
                        <div className="bg-white px-4 pt-3 pb-1 md:px-0">
                            <p className="text-[14px] font-bold text-gray-800 mb-3">Select Size</p>
                            <div className="flex flex-wrap gap-3">
                                {variants.map((v) => {
                                    const size = typeof v === 'string' ? v : v.size;
                                    const isAvailable = typeof v === 'string' ? true : (v.stock > 0);
                                    const varPrice = typeof v === 'string' ? price : (v.listingPrice || price);
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => isAvailable && setSelectedSize(size)}
                                            disabled={!isAvailable}
                                            className={`min-w-[62px] h-11 px-3 border-2 rounded-lg flex flex-col items-center justify-center transition-all shrink-0
                                                ${selectedSize === size ? 'border-[#e11955] bg-rose-50' : isAvailable ? 'border-gray-100 bg-white' : 'border-gray-50 opacity-30 bg-gray-50'}`}
                                        >
                                            <span className={`font-black text-[12px] uppercase tracking-tighter ${selectedSize === size ? 'text-[#e11955]' : 'text-gray-800'}`}>{size}</span>
                                            <span className={`text-[8px] font-bold uppercase mt-0.5 ${selectedSize === size ? 'text-[#e11955]' : 'text-gray-400'}`}>₹{varPrice}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Size Chart accordion */}
                            <button
                                className="flex items-center justify-between w-full py-4 border-t border-gray-100 mt-3"
                                onClick={() => setShowSizeChart(!showSizeChart)}
                            >
                                <span className="text-[14px] font-bold text-gray-800">Size Chart</span>
                                {showSizeChart ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                            </button>

                            {showSizeChart && (
                                <div className="pb-4">
                                    <div className="flex bg-gray-50 p-1 rounded-lg w-fit mb-4">
                                        <button
                                            onClick={() => setSizeUnit('inch')}
                                            className={`px-5 py-1.5 rounded-md text-[11px] font-black transition-all ${sizeUnit === 'inch' ? 'bg-white text-[#e11955] shadow-sm' : 'text-gray-500'}`}
                                        >INCH</button>
                                        <button
                                            onClick={() => setSizeUnit('cm')}
                                            className={`px-5 py-1.5 rounded-md text-[11px] font-black transition-all ${sizeUnit === 'cm' ? 'bg-white text-[#e11955] shadow-sm' : 'text-gray-500'}`}
                                        >CM</button>
                                    </div>
                                    <div className="flex bg-gray-50 py-2 px-2 rounded mb-1">
                                        <span className="w-1/4 text-[11px] font-bold text-gray-700">Size</span>
                                        <span className="w-1/4 text-[11px] font-bold text-gray-700">Chest</span>
                                        <span className="w-1/4 text-[11px] font-bold text-gray-700">Length</span>
                                        <span className="w-1/4 text-[11px] font-bold text-gray-700">Sleeve</span>
                                    </div>
                                    {['M', 'L', 'XL', 'XXL'].map((s, idx) => (
                                        <div key={s} className="flex py-2 px-2 border-b border-gray-50">
                                            <span className="w-1/4 text-[12px] text-gray-800 font-medium">{s}</span>
                                            <span className="w-1/4 text-[12px] text-gray-600">{sizeUnit === 'inch' ? 38 + idx * 2 : 96 + idx * 5}</span>
                                            <span className="w-1/4 text-[12px] text-gray-600">{sizeUnit === 'inch' ? 27 + idx : 69 + idx * 2}</span>
                                            <span className="w-1/4 text-[12px] text-gray-600">{sizeUnit === 'inch' ? 24 + idx : 61 + idx * 2}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ===== 5. SELLER SECTION ===== */}
                <div className="h-[6px] bg-gray-100/80 md:hidden" />
                <div className="bg-white px-4 py-2.5 pb-3 flex items-center justify-between md:px-0 md:border-t md:border-gray-100 md:pt-4">
                    <div className="flex items-center flex-1">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <Package size={20} className="text-gray-300" />
                        </div>
                        <div>
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block">Sold By</span>
                            <span className="text-[13px] font-semibold text-gray-700 mt-0.5 block">
                                {product.sellerId?.businessDetails?.shopName || product.shopName || 'Jeenora Official'}
                            </span>
                            <div className="flex items-center mt-1 gap-1.5">
                                {avgRating > 0 && (
                                    <div className="bg-green-100 flex items-center px-1.5 py-0.5 rounded gap-0.5">
                                        <span className="text-green-700 font-bold text-[10px]">{avgRating}</span>
                                        <Star size={8} className="text-green-700 fill-green-700" />
                                    </div>
                                )}
                                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                <TrustedBadge />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="bg-rose-50 px-2 py-1 rounded border border-rose-100 flex items-center gap-1">
                            <span className="text-rose-700 font-black text-[10px] uppercase">
                                {product.sellerId?.businessDetails?.businessType || 'Retailer'}
                            </span>
                            <button onClick={() => setShowVerifyModal(true)} className="bg-rose-200/50 rounded-full p-0.5">
                                <AlertCircle size={14} className="text-[#e11955]" />
                            </button>
                        </div>
                        <button onClick={() => setShowVerifyModal(true)}>
                            <span className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter block">How to Verify?</span>
                        </button>
                    </div>
                </div>

                {/* ===== TRUST MICRO-BANNERS ===== */}
                <div className="bg-white px-4 pb-4 md:px-0">
                    <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                        <div className="flex-1 flex flex-col items-center">
                            <div className="bg-green-100 p-1.5 rounded-full mb-1">
                                <ShieldCheck size={16} className="text-[#059669]" />
                            </div>
                            <span className="text-[9px] font-black text-gray-600 uppercase">Premium Qualtiy</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex-1 flex flex-col items-center">
                            <div className="bg-blue-100 p-1.5 rounded-full mb-1">
                                <Truck size={16} className="text-[#2563EB]" />
                            </div>
                            <span className="text-[9px] font-black text-gray-600 uppercase">Fast Delivery</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex-1 flex flex-col items-center">
                            <div className="bg-orange-100 p-1.5 rounded-full mb-1">
                                <Award size={16} className="text-[#D97706]" />
                            </div>
                            <span className="text-[9px] font-black text-gray-600 uppercase">Lowest Price</span>
                        </div>
                    </div>
                </div>

                </div>{/* end right col */}
                </div>{/* end md:grid */}
                </div>{/* end desktop wrapper */}

                {/* ===== BELOW FOLD: Full-width sections ===== */}
                <div className="md:px-6">

                {/* ===== 6. PRODUCT HIGHLIGHTS ===== */}
                <div className="h-[6px] bg-gray-100/80 md:hidden" />
                <div className="bg-white p-4 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[14px] font-bold text-gray-800 uppercase">Product Highlights</span>
                        <button onClick={copyHighlights} className="flex items-center gap-1">
                            {isCopied ? <Check size={14} className="text-[#e11955]" /> : <Copy size={14} className="text-[#e11955]" />}
                            <span className="text-[#e11955] font-bold text-[11px] uppercase">{isCopied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 mb-1">
                        {(() => {
                            const highlights = [
                                { label: 'Category', val: product.category },
                                { label: 'Sub Category', val: product.subCategory },
                                { label: 'Weight', val: product.weight ? `${product.weight}g` : '400g' }
                            ];
                            if (Array.isArray(product.attributes)) {
                                product.attributes.slice(0, 4).forEach(attr => highlights.push({ label: attr.name, val: attr.value }));
                            } else {
                                const attrMap = product.attributes || {};
                                if (attrMap.material) highlights.push({ label: 'Material', val: attrMap.material });
                                if (attrMap.pattern) highlights.push({ label: 'Pattern', val: attrMap.pattern });
                            }
                            return highlights.map((item, i) => (
                                <div key={i}>
                                    <p className="text-[11px] font-medium text-gray-400 uppercase mb-1">{item.label}</p>
                                    <p className="text-[14px] font-medium text-gray-800 capitalize leading-5">{item.val || 'N/A'}</p>
                                </div>
                            ));
                        })()}
                    </div>

                    {/* Additional Details accordion */}
                    <button
                        className="flex items-center justify-between w-full py-4 border-t border-gray-100 mt-2"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <span className="text-[14px] font-bold text-gray-800">Additional Details</span>
                        {showDetails ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                    </button>

                    {showDetails && (
                        <div className="pb-4">
                            {Array.isArray(product.attributes) ? (
                                product.attributes.map((attr, i) => (
                                    <div key={i} className="flex mb-3 items-center">
                                        <span className="w-[140px] text-[13px] text-gray-500 font-medium capitalize">{attr.name}</span>
                                        <span className="flex-1 text-[13px] text-gray-800 font-medium">{attr.value || 'N/A'}</span>
                                    </div>
                                ))
                            ) : (
                                Object.keys(product.attributes || {}).map((key, i) => (
                                    <div key={i} className="flex mb-3">
                                        <span className="w-[140px] text-[13px] text-gray-500 font-medium capitalize">{key}</span>
                                        <span className="flex-1 text-[13px] text-gray-800 font-medium">{product.attributes[key]}</span>
                                    </div>
                                ))
                            )}
                            <div className="flex mb-3">
                                <span className="w-[140px] text-[13px] text-gray-500 font-medium">Net Quantity (N)</span>
                                <span className="flex-1 text-[13px] text-gray-800 font-medium">1</span>
                            </div>
                            <div className="flex mb-3">
                                <span className="w-[140px] text-[13px] text-gray-500 font-medium">Country of Origin</span>
                                <span className="flex-1 text-[13px] text-gray-800 font-medium">India</span>
                            </div>
                            <button className="mt-4">
                                <span className="text-[#e11955] font-black text-[13px] tracking-wider">MORE INFORMATION</span>
                            </button>
                            {product.description && (
                                <div className="mt-5 border-t border-gray-50 pt-4">
                                    <p className="text-[13px] font-bold text-gray-800 uppercase mb-3 tracking-wider">Full Description</p>
                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-gray-600 leading-6 text-[13px] font-medium whitespace-pre-line">{product.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ===== 7. DELIVERY SECTION ===== */}
                <div className="h-[6px] bg-gray-100/80 md:hidden" />
                <div className="md:px-0">
                    <DeliveryEstimator productId={product._id} />
                </div>

                {/* ===== 8. CUSTOMER RATINGS & REVIEWS ===== */}
                <div className="h-[6px] bg-gray-100/80 md:hidden" />
                <div className="bg-white p-4 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:mt-4">
                    <p className="text-[14px] font-bold text-gray-800 uppercase mb-4">Customer Ratings & Reviews</p>

                    {/* Summary Block */}
                    <div className="flex mb-4">
                        {/* Left: Rating box */}
                        <div className="flex flex-col items-center justify-center mr-6 border border-gray-100 rounded-xl p-3 w-[100px]">
                            <div className="flex items-center justify-center mb-1">
                                <span className="text-[#038d63] text-[28px] font-bold mr-1">{avgRating || '0'}</span>
                                <Star size={24} className="text-[#038d63] fill-[#038d63]" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium text-center leading-3">
                                {totalReviews || '0'} ratings<br />
                                {totalReviews ? Math.round(totalReviews * 0.6) : '0'} reviews
                            </p>
                        </div>

                        {/* Right: Progress bars */}
                        <div className="flex-1 flex flex-col justify-center gap-1.5">
                            {[
                                { label: 'Very Good', star: 5, color: '#22c55e' },
                                { label: 'Good', star: 4, color: '#22c55e' },
                                { label: 'Ok-Ok', star: 3, color: '#eab308' },
                                { label: 'Bad', star: 2, color: '#f97316' },
                                { label: 'Very Bad', star: 1, color: '#ef4444' }
                            ].map((item) => {
                                const count = ratingDist[item.star] || 0;
                                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                return (
                                    <div key={item.star} className="flex items-center gap-2">
                                        <span className="w-[56px] text-[11px] text-gray-500 font-medium">{item.label}</span>
                                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                                        </div>
                                        <span className="w-7 text-[11px] text-gray-400 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Review highlights tags */}
                    {reviewStats?.highlights?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
                            {reviewStats.highlights.map((tag, i) => (
                                <div key={i} className="bg-green-50 rounded-full px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
                                    <div className="bg-[#038d63] rounded-full p-0.5">
                                        <Check size={10} className="text-white" />
                                    </div>
                                    <span className="text-[12px] font-medium text-gray-800">{tag}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Real Photos section */}
                    {(() => {
                        const allImages = reviews.reduce((acc, r) => [...acc, ...(r.images || [])], []);
                        if (allImages.length === 0) return null;
                        return (
                            <div className="mb-5">
                                <p className="text-[13px] font-bold text-gray-800 mb-3">Real Photos ({allImages.length})</p>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setSelectedImageToView(img); setShowImageViewer(true); }}
                                            className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100"
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Individual reviews (first 2) */}
                    <div>
                        {reviews.length > 0 ? reviews.slice(0, 2).map((review, idx) => (
                            <div key={idx} className="mb-5">
                                <div className="flex items-center mb-1 gap-2">
                                    <div className="bg-[#038d63] px-1.5 py-0.5 rounded flex items-center">
                                        <span className="text-white text-[11px] font-bold">{review.rating} ★</span>
                                    </div>
                                    <span className="text-[13px] font-black text-gray-900">
                                        {review.rating >= 4 ? 'Very Good' : review.rating === 3 ? 'Good' : 'Average'}
                                    </span>
                                    <span className="text-[11px] text-gray-400">
                                        • Posted on {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center mb-1 gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User size={12} className="text-gray-400" />
                                    </div>
                                    <span className="text-[12px] text-gray-800 font-bold">{review.userName || 'Anonymous'}</span>
                                    <div className="ml-1 bg-green-50 px-1 py-0.5 rounded border border-green-100">
                                        <span className="text-[8px] text-green-700 font-bold uppercase">Verified Buyer</span>
                                    </div>
                                </div>
                                {review.reviewText && (
                                    <p className="text-[13px] text-gray-800 leading-5 mb-2">{review.reviewText}</p>
                                )}
                                <div className="flex items-start justify-between">
                                    <button className="flex items-center gap-1 mt-1">
                                        <ThumbsUp size={16} className="text-gray-500" />
                                        <span className="text-[12px] text-gray-600 font-medium">Helpful</span>
                                    </button>
                                    {review.images?.[0] && (
                                        <button onClick={() => { setSelectedImageToView(review.images[0]); setShowImageViewer(true); }}>
                                            <img src={review.images[0]} className="w-14 h-14 rounded-lg object-cover" alt="" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center italic py-4 text-[12px]">No reviews yet.</p>
                        )}
                    </div>

                    {/* View All Reviews button */}
                    <button
                        onClick={() => setShowAllReviews(true)}
                        className="flex items-center gap-1 mt-2 bg-red-50/50 px-4 py-2 rounded-full"
                    >
                        <span className="text-[#e11955] font-black text-[11px] uppercase tracking-wide">
                            View All {totalReviews} Reviews
                        </span>
                        <ArrowRight size={12} className="text-[#e11955]" />
                    </button>
                </div>

                {/* ===== 9. FREE DELIVERY STRIP ===== */}
                <div className="bg-white px-4 py-3 border-t border-gray-100 flex items-center justify-between md:rounded-b-2xl">
                    <div className="flex-1">
                        {fetchingEDD ? (
                            <p className="text-[13px] text-gray-400">Calculating delivery...</p>
                        ) : (
                            <div>
                                <p className="text-[13px] text-gray-600">
                                    Free Delivery by{' '}
                                    <span className="font-bold text-gray-900">
                                        {(estimatedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {sellerCity ? `Ships from ${sellerCity} to ` : 'Delivering to '}
                                    <span className="text-[#e11955] font-medium">{profileInfo?.pincode || localPincode || 'your location'}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="border border-[#e11955] rounded px-3 py-1"
                    >
                        <span className="text-[#e11955] text-[11px] font-bold">Change</span>
                    </button>
                </div>

                {/* ===== 10. RECENTLY VIEWED ===== */}
                {recentProducts.filter(p => p._id !== product._id).length > 0 && (
                    <>
                        <div className="h-[6px] bg-gray-100/80 md:hidden" />
                        <div className="bg-white p-4 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[15px] font-bold text-gray-800">Recently Viewed</span>
                                <div className="bg-gray-50 px-2 py-0.5 rounded-sm">
                                    <span className="text-gray-400 text-[9px] font-bold uppercase">History</span>
                                </div>
                            </div>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                {recentProducts.filter(p => p._id !== product._id).map((p, i) => {
                                    const img = resolveImageUrl(p.images?.[0] || p.image);
                                    const name = p.productName || p.name || 'Product';
                                    const rPrice = p.variants?.[0]?.listingPrice || p.price || 0;
                                    const rOriginal = p.variants?.[0]?.mrp || p.originalPrice || rPrice;
                                    const rDiscount = rOriginal > rPrice ? Math.round(((rOriginal - rPrice) / rOriginal) * 100) : 0;
                                    return (
                                        <Link
                                            key={p._id || i}
                                            to={`/product/${p._id}`}
                                            className="flex-shrink-0 w-44 border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                                        >
                                            <div className="h-44 bg-gray-50">
                                                <img src={img} className="w-full h-full object-cover" alt={name} />
                                            </div>
                                            <div className="p-3">
                                                <p className="text-[12px] font-medium text-gray-700 truncate mb-1">{name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[14px] font-bold text-gray-900">₹{rPrice}</span>
                                                    <span className="text-[10px] text-gray-400 line-through">₹{rOriginal}</span>
                                                    {rDiscount > 0 && <span className="text-[10px] text-green-700 font-bold">{rDiscount}% off</span>}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* ===== 11. TRUSTED SUPPLIER FOOTER ===== */}
                <div className="bg-white py-3 px-4 flex items-center justify-center gap-3 mb-1">
                    <TrustedBadge />
                    <span className="text-[11px] text-gray-400 font-medium">Best quality products from trusted suppliers.</span>
                </div>

                {/* ===== 12. PEOPLE ALSO LOOKED FOR ===== */}
                <div className="h-2 bg-gray-100 md:hidden" />
                <div className="bg-white p-4 pb-6 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:mt-4 md:mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[16px] font-black text-gray-800 uppercase tracking-tighter">People also looked for</p>
                        <Link to={`/products?category=${product.category}`} className="text-[#e11955] text-[11px] font-bold uppercase tracking-widest flex items-center">
                            View All <ArrowRight size={14} className="ml-1" />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedProducts.length > 0 ? (
                            relatedProducts.map((p, i) => (
                                <ProductCard key={p._id || i} product={p} />
                            ))
                        ) : (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse bg-gray-50 h-64 rounded-2xl border border-gray-100" />
                            ))
                        )}
                    </div>
                </div>

                </div>{/* end below fold wrapper */}

            </div>{/* end pt-[52px] */}

            {/* ===== STICKY BOTTOM BAR (mobile only) ===== */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl">
                {/* Bulk pricing strip (Mobile) */}
                {(() => {
                    const tiers = currentVariant?.priceTiers || [];
                    if (tiers.length === 0) return null;
                    return (
                        <div className="bg-indigo-50/30 px-4 py-2 border-b border-indigo-100/50">
                            <div className="flex items-center mb-1 gap-1">
                                <Zap size={11} className="text-indigo-600" />
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">Volume Discounts</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                                {tiers.map((tier, tIdx) => {
                                    const isActive = selectedQty >= tier.minQty && !tiers.some(t => t.minQty > tier.minQty && selectedQty >= t.minQty);
                                    return (
                                        <button
                                            key={tIdx}
                                            onClick={() => setSelectedQty(isActive ? 1 : tier.minQty)}
                                            className={`border rounded-lg px-2 py-1 flex-shrink-0 flex items-center gap-1.5 shadow-sm transition-all ${isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-indigo-100'}`}
                                        >
                                            <div className={`rounded px-1 py-0.5 ${isActive ? 'bg-white' : 'bg-indigo-600'}`}>
                                                <span className={`text-[9px] font-black ${isActive ? 'text-indigo-600' : 'text-white'}`}>{tier.minQty}+</span>
                                            </div>
                                            <span className={`text-[12px] font-black ${isActive ? 'text-white' : 'text-gray-900'}`}>₹{tier.price}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {/* MOBILE: FLOATING ACTION BAR */}
                <div className="p-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAddToCart(false)}
                            disabled={isAddingToCart}
                            className="flex-1 h-11 border-2 border-[#e11955] rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                        >
                            <ShoppingCart size={16} className="text-[#e11955]" />
                            <span className="text-[#e11955] font-black text-[11px] uppercase tracking-wider">
                                {isAddingToCart ? '...' : 'Add to Cart'}
                            </span>
                        </button>
                        <button
                            onClick={() => handleAddToCart(true)}
                            className="flex-[1.2] h-11 bg-[#e11955] rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                        >
                            <Zap size={18} className="text-white" />
                            <span className="text-white font-black text-[11px] uppercase tracking-widest">Buy Now</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== VERIFY MODAL ===== */}
            <AnimatePresence>
                {showVerifyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center px-6"
                        onClick={() => setShowVerifyModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center mb-4">
                                <div className="bg-green-100 p-3 rounded-full mb-3">
                                    <ShieldCheck size={32} className="text-[#059669]" />
                                </div>
                                <p className="text-lg font-black text-gray-900 uppercase tracking-tighter">Verified Supplier</p>
                            </div>
                            <p className="text-gray-600 text-center font-bold text-[13px] leading-5 mb-6">
                                "We are going to the seller shop to visit all to verifie to confirm"
                            </p>
                            <button
                                className="w-full bg-[#e11955] py-3 rounded-xl flex items-center justify-center shadow-lg"
                                onClick={() => setShowVerifyModal(false)}
                            >
                                <span className="text-white font-black uppercase text-[12px] tracking-widest">Clear & Confirmed</span>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== ALL REVIEWS BOTTOM SHEET ===== */}
            <AnimatePresence>
                {showAllReviews && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-end"
                    >
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowAllReviews(false)} />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30 }}
                            className="relative bg-white w-full rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden z-10"
                        >
                            <button
                                onClick={() => setShowAllReviews(false)}
                                className="flex justify-between items-center px-5 py-4 border-b border-gray-100 w-full"
                            >
                                <span className="text-[15px] font-black text-gray-800 uppercase tracking-tight">View All {totalReviews} Reviews</span>
                                <ChevronDown size={22} className="text-gray-500" />
                            </button>
                            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                {reviews.length > 0 ? reviews.map((review, idx) => (
                                    <div key={idx} className="border-b border-gray-50 pb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="bg-[#038d63] px-1.5 py-0.5 rounded">
                                                <span className="text-white text-[11px] font-bold">{review.rating} ★</span>
                                            </div>
                                            <span className="text-[13px] font-black text-gray-900">
                                                {review.rating >= 4 ? 'Very Good' : review.rating === 3 ? 'Good' : 'Average'}
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                • {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User size={12} className="text-gray-400" />
                                            </div>
                                            <span className="text-[12px] font-bold text-gray-800">{review.userName || 'Anonymous'}</span>
                                            <div className="bg-green-50 px-1 py-0.5 rounded border border-green-100">
                                                <span className="text-[8px] text-green-700 font-bold uppercase">Verified Buyer</span>
                                            </div>
                                        </div>
                                        {review.reviewText && <p className="text-[13px] text-gray-700 leading-5 mb-2">{review.reviewText}</p>}
                                        {review.images?.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                                {review.images.map((img, iIdx) => (
                                                    <button key={iIdx} onClick={() => { setSelectedImageToView(img); setShowImageViewer(true); }}>
                                                        <img src={img} className="w-[72px] h-[72px] rounded-lg object-cover" alt="" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-gray-400 text-center italic py-10 text-[12px]">No reviews yet.</p>
                                )}
                                <div className="h-10" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== FULL SCREEN IMAGE VIEWER WITH ENHANCED ZOOM ===== */}
            <AnimatePresence>
                {showImageViewer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-black/98 flex items-center justify-center overflow-hidden"
                    >
                        {/* Close button - always visible */}
                        <button
                            onClick={() => setShowImageViewer(false)}
                            className="absolute top-12 right-6 z-[2001] bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all"
                        >
                            <X size={28} className="text-white" />
                        </button>

                        {/* Image Container with Zoom Logic */}
                        <motion.div 
                            className="w-full h-full flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0.1}
                        >
                            {selectedImageToView && (
                                <motion.img 
                                    src={selectedImageToView} 
                                    initial={{ scale: 0.8, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                                    alt="Zoomed Product" 
                                    style={{ touchAction: 'none' }}
                                />
                            )}
                        </motion.div>

                        {/* Zoom Instructions Strip */}
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                                    Click outside or press X to close • Use 2 fingers to zoom
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ProductDetail;
