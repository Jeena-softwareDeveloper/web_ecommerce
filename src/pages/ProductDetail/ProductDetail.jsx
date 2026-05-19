import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ShoppingCart, ShieldCheck, Star,
    ArrowRight, Truck, Plus, Minus, Heart, Award,
    CheckCircle2, User, ThumbsUp, Copy, Check,
    Zap, Gift, MapPin, ChevronDown, ChevronUp, X,
    Share2, AlertCircle, RefreshCcw, Package,
    ZoomIn, ZoomOut
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
import { cleanProductName } from '../../utils/productUtils';


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
        productDetails: rawProduct,
        loader: loading,
        relatedProducts: relatedProductsFromStore,
        similarProducts,
        socialStats
    } = useSelector(state => state.wearProduct);
    const { token, userInfo } = useSelector(state => state.auth);
    const { reviews, stats: reviewStats } = useSelector(state => state.review);
    const { globalOffers: systemOffers } = useSelector(state => state.vendorOffer);
    const { profileInfo } = useSelector(state => state.profile);

    const product = React.useMemo(() => {
        if (!rawProduct) return null;
        return {
            ...rawProduct,
            variants: (rawProduct.variants || []).map(v => {
                if (v && v._doc) {
                    return {
                        ...v._doc,
                        ...v,
                        listingPrice: v.listingPrice ?? v._doc.listingPrice,
                        mrp: v.mrp ?? v._doc.mrp,
                        stock: v.stock ?? v._doc.stock ?? v.availableStock ?? v._doc.availableStock ?? v.totalStock ?? v._doc.totalStock ?? 0
                    };
                }
                return {
                    ...v,
                    stock: v?.stock ?? v?.availableStock ?? v?.totalStock ?? 0
                };
            })
        };
    }, [rawProduct]);

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedQty, setSelectedQty] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [trustModalContent, setTrustModalContent] = useState(null);
    const [sizeUnit, setSizeUnit] = useState('inch');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [selectedImageToView, setSelectedImageToView] = useState(null);
    const [zoomScale, setZoomScale] = useState(1);
    const [showQtyEditModal, setShowQtyEditModal] = useState(false);
    const [modalMinQty, setModalMinQty] = useState(1);

    // Reset zoom when viewer opens
    useEffect(() => {
        if (showImageViewer) setZoomScale(1);
    }, [showImageViewer]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [isCopied, setIsCopied] = useState(false);
    const [fetchingEDD, setFetchingEDD] = useState(false);
    const [estimatedDate, setEstimatedDate] = useState(null);
    const [City, setCity] = useState('');
    const [localPincode, setLocalPincode] = useState('');
    const imageScrollRef = useRef(null);

    const handleImageScroll = (e) => {
        const scrollPosition = e.target.scrollLeft;
        const width = e.target.clientWidth;
        const index = Math.round(scrollPosition / width);
        if (index !== activeImageIndex) {
            setActiveImageIndex(index);
        }
    };

    const scrollToImage = (index) => {
        if (imageScrollRef.current) {
            imageScrollRef.current.scrollTo({
                left: index * imageScrollRef.current.clientWidth,
                behavior: 'smooth'
            });
        }
    };

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
                        setCity(response.data.City || '');
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
            dispatch(get_product_details({ slug: id, demo: isDemo }));
            dispatch(get_active_offers());
            dispatch(get_global_offers());
        }
    }, [id, dispatch, isDemo]);

    // Initialize Bulk Qty
    useEffect(() => {
        if (product?.isBulkOnly && product.variants?.[0]?.priceTiers?.length > 0) {
            const minBulkQty = product.variants[0].priceTiers[0].minQty;
            setSelectedQty(minBulkQty);
        }
    }, [product?._id]);

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
            const getDeviceId = () => {
                let deviceId = localStorage.getItem('jeenora_device_id');
                if (!deviceId) {
                    deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    localStorage.setItem('jeenora_device_id', deviceId);
                }
                return deviceId;
            };

            apiClient.post('/wear/home/customer/ai/track-behavior', {
                productId: product._id,
                category: product.category,
                referrer: referrer,
                viewDuration: 0,
                deviceId: getDeviceId()
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
                _id: prod._id,
                productName: prod.name || prod.productName || prod.title,
                images: prod.images,
                price: prod.price,
                variants: prod.variants,
                category: prod.category
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

        // Strict Bulk Enforcement
        const minBulk = product.isBulkOnly ? (product.variants?.[0]?.priceTiers?.[0]?.minQty || 1) : 1;
        if (selectedQty < minBulk) {
            toast.error(`This is a Bulk Only product. Minimum order is ${minBulk} items.`);
            setShowQtyEditModal(true); // Help them fix it immediately
            return;
        }

        const variant = product.variants?.find(v => v.size === selectedSize);
        let finalPrice = variant?.listingPrice || product.variants?.[0]?.listingPrice || product.price || 0;
        if (variant?.priceTiers?.length > 0) {
            const tier = [...variant.priceTiers].sort((a, b) => b.minQty - a.minQty).find(t => selectedQty >= t.minQty);
            if (tier) finalPrice = tier.finalPrice || tier.unitPrice || tier.price || finalPrice;
        }

        const bItem = {
            productId: product,
            quantity: selectedQty,
            size: selectedSize,
            _id: `buynow-${Date.now()}`,
            price: parseInt(String(finalPrice).replace(/[^0-9]/g, '')) || 0
        };

        if (buyNow) {
            setIsBuyingNow(true);
            setTimeout(() => {
                navigate('/checkout', { state: { buyNowItem: bItem } });
            }, 100); // Tiny delay to allow state update/spinner to show
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

    // Calculate the active price (including tiers)
    const basePrice = currentVariant?.listingPrice || product.variants?.[0]?.listingPrice || product.price;
    const price = Math.ceil((() => {
        if (product.isBulkOnly || selectedQty > 1) {
            const tiers = currentVariant?.priceTiers || product.variants?.[0]?.priceTiers || [];
            const tier = [...tiers].sort((a, b) => b.minQty - a.minQty).find(t => selectedQty >= t.minQty);
            return tier ? (tier.finalPrice || tier.unitPrice || tier.price) : basePrice;
        }
        return basePrice;
    })());

    const mrp = Math.ceil(currentVariant?.mrp || product.variants?.[0]?.mrp || product.mrp || product.originalPrice);
    const pureMrp = parseFloat(String(mrp || 0).replace(/[^0-9.]/g, '')) || 0;
    const purePrice = parseFloat(String(price || 0).replace(/[^0-9.]/g, '')) || 0;
    const discount = pureMrp > purePrice ? Math.round(((pureMrp - purePrice) / pureMrp) * 100) : 0;
    const savings = pureMrp - purePrice;
    const avgRating = reviewStats?.avgRating || 0;
    const totalReviews = reviewStats?.totalReviews || 0;
    const ratingDist = reviewStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const variants = product.variants || [];
    const firstVariantSize = variants.length > 0 ? (variants[0]?.size || '').toLowerCase() : '';
    const isNoSize = variants.length === 0 || firstVariantSize === 'no size' || firstVariantSize === 'nosize' || firstVariantSize === '';

    const fullName = product.name || product.productName || '';
    const displayName = fullName;

    const totalStock = product.variants?.reduce((acc, v) => {
        const variantStock = v.stock ?? v.availableStock ?? v.totalStock ?? 0;
        return acc + variantStock;
    }, 0) || 0;
    const currentStock = (isNoSize || !selectedSize) ? totalStock : (currentVariant?.stock ?? currentVariant?.availableStock ?? currentVariant?.totalStock ?? 0);
    const relatedProducts = (relatedProductsFromStore || []).filter(p => p._id !== product._id);

    return (
        <div className="min-h-screen bg-white md:bg-gray-50 pb-[60px] md:pb-0">
            <CommonHeader title=" " />

            {/* Offset for fixed header */}
            <div className="pt-[52px] md:pt-[60px]">

                {/* ===== DESKTOP: 2-col grid wrapper ===== */}
                <div className="">
                    <div className="md:grid md:grid-cols-[400px_1fr] md:gap-10 md:items-start">

                        {/* ===== LEFT COL: IMAGE GALLERY ===== */}
                        <div className="md:sticky md:top-[70px]">

                            {/* ===== 1. IMAGE CAROUSEL ===== */}
                            <div className="bg-white relative md:rounded-2xl md:overflow-hidden md:border md:border-gray-100 md:shadow-sm">
                                <div className="relative" style={{ aspectRatio: '1/1' }}>
                                    <div
                                        ref={imageScrollRef}
                                        onScroll={handleImageScroll}
                                        className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
                                        style={{ scrollBehavior: 'smooth' }}
                                    >
                                        {images.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="flex-none w-full h-full snap-center flex items-center justify-center bg-white cursor-zoom-in relative group overflow-hidden"
                                                onClick={() => { setSelectedImageToView(img); setShowImageViewer(true); }}
                                            >
                                                <motion.img
                                                    src={img}
                                                    alt={displayName}
                                                    className="w-full h-full object-contain transition-transform duration-500 md:group-hover:scale-150 origin-center"
                                                    whileHover={{ scale: window.innerWidth > 768 ? 1.5 : 1 }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                />
                                                {/* Zoom Hint (Desktop Only) */}
                                                <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/5 transition-colors pointer-events-none hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                                            onClick={() => scrollToImage(i)}
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
                                            onClick={() => scrollToImage(i)}
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
                                <div className="bg-white px-4 py-2 border-b border-gray-100 md:border md:rounded-xl md:mb-2">
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
                                                            const fromPath = location.state?.from || '/';
                                                            navigate(`/product/${p.slug || p._id}`, { replace: true, state: { from: fromPath } });
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
                            <div className="bg-white px-4 pt-2 pb-3 md:px-0 md:pt-0">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 pr-4">
                                        {/* Product name */}
                                        <h1 className="text-[14px] font-bold text-gray-800 leading-tight tracking-tight">
                                            {displayName}
                                        </h1>

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
                                                SAVE ₹{Math.ceil(savings)} INSTANTLY
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* ===== TRUST TAGS (Single Scrollable Row) ===== */}
                                <div className="flex items-center gap-3 mb-3 overflow-x-auto no-scrollbar pb-1">
                                    <div className="bg-green-50 px-3 py-1 rounded-full flex items-center border border-green-100 gap-1.5 shrink-0">
                                        <CheckCircle2 size={14} className="text-green-600" />
                                        <span className="text-[10px] md:text-[11px] font-bold text-green-700 whitespace-nowrap">In Stock</span>
                                    </div>
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

                                {/* Social proof & Stock Status */}
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    {socialStats[product._id] > 0 && (
                                        <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 gap-3">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-5 h-5 rounded-full bg-gray-300 border border-white flex items-center justify-center">
                                                        <User size={10} className="text-white" />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[11px] font-medium text-gray-600">
                                                <span className="font-bold text-gray-900">{socialStats[product._id]} people</span> visited this product recently
                                            </p>
                                        </div>
                                    )}

                                    {/* Stock Alert */}
                                    {currentStock <= 0 ? (
                                        <div className="bg-red-50 px-3 py-1.5 rounded-lg flex items-center border border-red-100 gap-1.5">
                                            <AlertCircle size={14} className="text-red-500" />
                                            <span className="text-[11px] font-bold text-red-600 uppercase">Out of Stock</span>
                                        </div>
                                    ) : currentStock <= 50 ? (
                                        <div className="bg-amber-50 px-3 py-1.5 rounded-lg flex items-center border border-amber-100 gap-1.5">
                                            <AlertCircle size={14} className="text-amber-500" />
                                            <span className="text-[11px] font-bold text-amber-600 uppercase">Only {currentStock} Items Left in Stock</span>
                                        </div>
                                    ) : selectedQty > currentStock && (product.isBulkOnly || product.variants?.some(v => v.priceTiers?.length > 0)) ? (
                                        <div className="bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center border border-indigo-100 gap-1.5">
                                            <Package size={14} className="text-indigo-600" />
                                            <span className="text-[11px] font-bold text-indigo-600 uppercase">Available for Bulk Order (Extended Delivery)</span>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center border border-emerald-100 gap-1.5">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            <span className="text-[11px] font-bold text-emerald-600 uppercase">In Stock (Ready to Ship)</span>
                                        </div>
                                    )}
                                </div>

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
                            </div>

                            {/* Desktop action buttons — shown only on md+ IN the right column */}
                            <div className="hidden md:flex gap-3 mt-4 mb-2">
                                <button
                                    onClick={() => handleAddToCart(false)}
                                    disabled={isAddingToCart || currentStock <= 0}
                                    className={`flex-1 h-12 border-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${currentStock <= 0 ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' : 'border-[#e11955] hover:bg-red-50'}`}
                                >
                                    <ShoppingCart size={16} className={currentStock <= 0 ? 'text-gray-400' : 'text-[#e11955]'} />
                                    <span className={`font-bold text-[11px] uppercase tracking-wider ${currentStock <= 0 ? 'text-gray-400' : 'text-[#e11955]'}`}>
                                        {currentStock <= 0 ? 'Sold Out' : isAddingToCart ? 'Adding...' : `Add ${selectedQty} to Cart`}
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleAddToCart(true)}
                                    disabled={isBuyingNow || currentStock <= 0}
                                    className="flex-[1.2] h-12 bg-[#e11955] rounded-xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
                                >
                                    {isBuyingNow ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Zap size={18} className="text-white" />
                                            <span className="text-white font-bold text-[11px] uppercase tracking-widest">
                                                {currentStock <= 0 ? 'Out of Stock' : `Buy ${selectedQty} Now`}
                                            </span>
                                        </>
                                    )}
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

                            {/* ===== 5.  SECTION ===== */}
                            <div className="h-[6px] bg-gray-100/80 md:hidden" />
                            <div className="bg-white px-4 py-2.5 pb-3 flex items-center justify-between md:px-0 md:border-t md:border-gray-100 md:pt-4">
                                <div className="flex items-center flex-1">
                                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                        <Package size={20} className="text-gray-300" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block">Sold By</span>
                                        <span className="text-[13px] font-semibold text-gray-700 mt-0.5 block">
                                            {product.partnerId?.businessDetails?.shopName || product.Id?.businessDetails?.shopName || product.partnerId?.shopInfo?.shopName || product.Id?.shopInfo?.shopName || product.shopName || <span className="text-red-500"> Name Missing</span>}
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
                                            {product.partnerId?.businessDetails?.businessType || product.Id?.businessDetails?.businessType || <span className="text-red-400">Type Missing</span>}
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
                            <div className="bg-white px-4 pb-4 pt-4 md:px-0 border-t border-gray-200">
                                <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                                    <button onClick={() => setTrustModalContent('quality')} className="flex-1 flex flex-col items-center">
                                        <div className="bg-green-100 p-1.5 rounded-full mb-1">
                                            <ShieldCheck size={16} className="text-[#059669]" />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-600 uppercase">Premium Quality</span>
                                    </button>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <button onClick={() => setTrustModalContent('delivery')} className="flex-1 flex flex-col items-center">
                                        <div className="bg-blue-100 p-1.5 rounded-full mb-1">
                                            <Truck size={16} className="text-[#2563EB]" />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-600 uppercase">Fast Delivery</span>
                                    </button>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <button onClick={() => setTrustModalContent('price')} className="flex-1 flex flex-col items-center">
                                        <div className="bg-orange-100 p-1.5 rounded-full mb-1">
                                            <Award size={16} className="text-[#D97706]" />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-600 uppercase">Lowest Price</span>
                                    </button>
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
                                        {City ? `Ships from ${City} to ` : 'Delivering to '}
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
                {/* Bulk pricing strip */}
                {(() => {
                    const tiers = currentVariant?.priceTiers || [];
                    if (tiers.length === 0) return null;
                    return (
                        <div className="bg-indigo-50/40 px-4 py-2 border-b border-indigo-50">
                            <div className="flex items-center mb-1 gap-1">
                                <Zap size={12} className="text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Volume Discounts (Tap to Apply)</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {tiers.map((tier, tIdx) => {
                                    const isActive = selectedQty >= tier.minQty && !tiers.some(t => t.minQty > tier.minQty && selectedQty >= t.minQty);
                                    return (
                                        <button
                                            key={tIdx}
                                            onClick={() => {
                                                setSelectedQty(tier.minQty);
                                                setModalMinQty(tier.minQty);
                                                setShowQtyEditModal(true);
                                            }}
                                            className={`border rounded-lg px-3 py-1.5 flex-shrink-0 flex items-center gap-2 shadow-sm ${isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-indigo-100'}`}
                                        >
                                            <div className={`rounded px-1.5 py-0.5 ${isActive ? 'bg-white' : 'bg-indigo-600'}`}>
                                                <span className={`text-[10px] font-black ${isActive ? 'text-indigo-600' : 'text-white'}`}>
                                                    {isActive ? `${selectedQty} Qty` : `${tier.minQty}+ Qty`}
                                                </span>
                                            </div>
                                            <span className={`text-[13px] font-black ${isActive ? 'text-white' : 'text-gray-900'}`}>₹{tier.finalPrice || tier.unitPrice || tier.price}</span>
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
                            disabled={isAddingToCart || currentStock <= 0}
                            className={`flex-1 h-11 border-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${currentStock <= 0 ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-[#e11955]'}`}
                        >
                            <ShoppingCart size={16} className={currentStock <= 0 ? 'text-gray-400' : 'text-[#e11955]'} />
                            <span className={`font-black text-[11px] uppercase tracking-wider ${currentStock <= 0 ? 'text-gray-400' : 'text-[#e11955]'}`}>
                                {currentStock <= 0 ? 'SOLD' : isAddingToCart ? '...' : `Add ${selectedQty} to Cart`}
                            </span>
                        </button>
                        <button
                            onClick={() => handleAddToCart(true)}
                            disabled={isBuyingNow || currentStock <= 0}
                            className="flex-[1.2] h-11 bg-[#e11955] rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
                        >
                            {isBuyingNow ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Zap size={18} className="text-white" />
                                    <span className="text-white font-black text-[11px] uppercase tracking-widest">
                                        {currentStock <= 0 ? 'Out of Stock' : `Buy ${selectedQty} Now`}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== QUANTITY EDIT MODAL ===== */}
            <AnimatePresence>
                {showQtyEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
                        onClick={() => setShowQtyEditModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 pb-10 shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter leading-none">Quantity Selector</h3>
                                    {(() => {
                                        const isBulkProd = product.isBulkOnly || product.isBulk || (product.variants || []).some(v => v.priceTiers?.length > 0);
                                        if (isBulkProd) {
                                            return <span className="text-[10px] font-bold text-[#e11955] uppercase tracking-widest mt-1 inline-block">Min for this Price: {modalMinQty} Items</span>;
                                        }
                                        return null;
                                    })()}
                                </div>
                                <button onClick={() => setShowQtyEditModal(false)} className="p-2 bg-gray-50 rounded-full">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="bg-indigo-50/50 rounded-2xl p-5 mb-6 border border-indigo-100/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-indigo-600 uppercase">Unit Price</span>
                                    <span className="text-lg font-black text-indigo-900">₹{(() => {
                                        const tier = [...(currentVariant?.priceTiers || [])].sort((a, b) => b.minQty - a.minQty).find(t => selectedQty >= t.minQty);
                                        return tier ? (tier.finalPrice || tier.unitPrice || tier.price) : price;
                                    })()}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center bg-white border border-indigo-100 rounded-xl p-1 shadow-sm">
                                        <button
                                            onClick={() => {
                                                setSelectedQty(prev => Math.max(modalMinQty, prev - 1));
                                            }}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${selectedQty <= modalMinQty ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                        >
                                            <Minus size={20} strokeWidth={3} />
                                        </button>
                                        <input
                                            type="number"
                                            value={selectedQty}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                const isBulk = product.isBulkOnly || product.variants?.some(v => v.priceTiers?.length > 0);
                                                if (!isBulk && val > currentStock) {
                                                    setSelectedQty(currentStock);
                                                    toast.error(`Only ${currentStock} items available in stock`);
                                                } else {
                                                    setSelectedQty(val);
                                                }
                                            }}
                                            onBlur={() => {
                                                if (selectedQty < modalMinQty) {
                                                    setSelectedQty(modalMinQty);
                                                    toast.error(`Minimum for this price is ${modalMinQty} items`);
                                                }
                                            }}
                                            className="w-16 text-center font-black text-xl text-indigo-900 outline-none bg-transparent"
                                        />
                                        <button
                                            onClick={() => {
                                                const isBulk = product.isBulkOnly || product.variants?.some(v => v.priceTiers?.length > 0);
                                                if (!isBulk && selectedQty >= currentStock) {
                                                    toast.error(`Max stock limit reached (${currentStock} items)`);
                                                    return;
                                                }
                                                setSelectedQty(prev => prev + 1);
                                            }}
                                            className="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Plus size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        {selectedQty > currentStock && (product.isBulkOnly || product.variants?.some(v => v.priceTiers?.length > 0)) && (
                                            <p className="text-[9px] font-bold text-[#e11955] uppercase mb-1">
                                                {selectedQty - currentStock} items to be manufactured
                                            </p>
                                        )}
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimated Total</p>
                                        <p className="text-xl font-black text-[#e11955]">₹{(selectedQty * (() => {
                                            const tier = [...(currentVariant?.priceTiers || [])].sort((a, b) => b.minQty - a.minQty).find(t => selectedQty >= t.minQty);
                                            return tier ? (tier.finalPrice || tier.unitPrice || tier.price) : price;
                                        })()).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (selectedQty < modalMinQty) {
                                        toast.error(`Minimum for this price is ${modalMinQty} items`);
                                        return;
                                    }
                                    setShowQtyEditModal(false);
                                    toast.success(`${selectedQty} items selected!`);
                                }}
                                className="w-full py-4 bg-[#e11955] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-100 active:scale-[0.98] transition-all"
                            >
                                Confirm Quantity
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== VERIFY MODAL ===== */}
            <AnimatePresence>
                {showVerifyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/40 flex items-end md:items-center justify-center md:px-6"
                        onClick={() => setShowVerifyModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 pb-10 md:pb-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center mb-6">
                                <div className="bg-green-100 p-3 rounded-full mb-3">
                                    <ShieldCheck size={36} className="text-[#059669]" />
                                </div>
                                <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">Verified Supplier</h3>
                                <p className="text-[12px] text-gray-500 font-medium mt-1">100% Authentic & Secure</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-2 border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-green-100 p-1 rounded-full shrink-0"><Check size={12} className="text-green-700 font-bold" /></div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">Identity & Location</p>
                                        <p className="text-[11.5px] text-gray-500 font-medium leading-snug mt-0.5">We personally visit the shop to verify the address and legal identity.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-green-100 p-1 rounded-full shrink-0"><Check size={12} className="text-green-700 font-bold" /></div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">Quality Assurance</p>
                                        <p className="text-[11.5px] text-gray-500 font-medium leading-snug mt-0.5">Random quality checks are performed on products.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-green-100 p-1 rounded-full shrink-0"><Check size={12} className="text-green-700 font-bold" /></div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">Secure Payments</p>
                                        <p className="text-[11.5px] text-gray-500 font-medium leading-snug mt-0.5"> bank details and PAN are authenticated by our team.</p>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== TRUST MODAL (Quality, Delivery, Price) ===== */}
            <AnimatePresence>
                {trustModalContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/40 flex items-end md:items-center justify-center md:px-6"
                        onClick={() => setTrustModalContent(null)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 pb-10 md:pb-6 shadow-2xl mt-auto md:mt-0 relative"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Drag handle for mobile */}
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

                            {trustModalContent === 'quality' && (
                                <>
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="bg-green-100 p-4 rounded-full mb-4">
                                            <ShieldCheck size={40} className="text-[#059669]" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Premium Quality</h3>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-4">
                                        <p className="text-gray-700 text-[14px] font-medium leading-relaxed">
                                            At Jeenora, we are deeply committed to providing you with the highest quality products.
                                            Every item undergoes a rigorous multi-step quality assurance check before it is packaged and shipped to you.
                                            <br /><br />
                                            Our dedicated team inspects the materials, stitching, and finishing to ensure you receive exactly what you see. We only partner with verified, top-tier manufacturers.
                                        </p>
                                    </div>
                                </>
                            )}

                            {trustModalContent === 'delivery' && (
                                <>
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="bg-blue-100 p-4 rounded-full mb-4">
                                            <Truck size={40} className="text-[#2563EB]" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Fast Delivery</h3>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-4">
                                        <p className="text-gray-700 text-[14px] font-medium leading-relaxed">
                                            We understand how excited you are to receive your orders. That's why we have optimized our entire supply chain to ensure lightning-fast processing and delivery.
                                            <br /><br />
                                            Most orders are dispatched within 24 hours. We partner with India's fastest and most reliable courier services to ensure your package reaches you safely and ahead of schedule.
                                        </p>
                                    </div>
                                </>
                            )}

                            {trustModalContent === 'price' && (
                                <>
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="bg-orange-100 p-4 rounded-full mb-4">
                                            <Award size={40} className="text-[#D97706]" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Lowest Price</h3>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-4">
                                        <p className="text-gray-700 text-[14px] font-medium leading-relaxed">
                                            Jeenora guarantees the lowest prices in the market without ever compromising on quality.
                                            We achieve this by directly sourcing from manufacturers and eliminating the middlemen.
                                            <br /><br />
                                            The savings we make by optimizing our operations are passed directly to you. Shop with complete confidence knowing you are getting the absolute best deal.
                                        </p>
                                    </div>
                                </>
                            )}
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
                        className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex items-center justify-center overflow-hidden"
                    >
                        {/* Close button - top right */}
                        <button
                            onClick={() => setShowImageViewer(false)}
                            className="absolute top-10 right-6 z-[2005] bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all border border-white/10"
                        >
                            <X size={28} className="text-white" />
                        </button>

                        {/* Zoom Controls - top left */}
                        <div className="absolute top-10 left-6 z-[2005] flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setZoomScale(prev => Math.max(1, prev - 0.5)); }}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all border border-white/10"
                            >
                                <ZoomOut size={24} className="text-white" />
                            </button>
                            <div className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                                <span className="text-white font-bold text-[13px]">{Math.round(zoomScale * 100)}%</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setZoomScale(prev => Math.min(4, prev + 0.5)); }}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all border border-white/10"
                            >
                                <ZoomIn size={24} className="text-white" />
                            </button>
                        </div>

                        {/* Image Container with Panning & Zoom Logic */}
                        <div
                            className="w-full h-full flex items-center justify-center overflow-hidden"
                            onClick={() => setShowImageViewer(false)}
                        >
                            {selectedImageToView && (
                                <motion.div
                                    drag={zoomScale > 1}
                                    dragConstraints={{ left: -100 * zoomScale, right: 100 * zoomScale, top: -100 * zoomScale, bottom: 100 * zoomScale }}
                                    dragElastic={0.05}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setZoomScale(prev => prev > 1 ? 1 : 2.5);
                                    }}
                                    className="relative flex items-center justify-center"
                                    onClick={e => e.stopPropagation()}
                                    animate={{ scale: zoomScale }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                >
                                    <img
                                        src={selectedImageToView}
                                        className={`max-w-[95vw] max-h-[85vh] object-contain transition-all duration-300 ${zoomScale > 1 ? 'cursor-move' : 'cursor-zoom-in'}`}
                                        alt="Zoomed Product"
                                        draggable="false"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Zoom Instructions Strip */}
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
                            <div className="bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/10">
                                <p className="text-white/40 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"></span>
                                    Double Tap to Zoom • Drag to Pan • Press X to Close
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
