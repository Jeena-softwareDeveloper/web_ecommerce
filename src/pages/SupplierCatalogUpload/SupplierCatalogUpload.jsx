import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Camera, Plus, Trash2,
    ChevronRight, ChevronDown, AlertCircle,
    Check, ArrowRight, Database,
    Sparkles, X, CheckCircle2, Search, ArrowLeft,
    Package, Tag, IndianRupee, Layers, Image as ImageIcon
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { add_catalog, edit_catalog, get_catalog_for_edit, messageClear } from '../../store/reducers/vendorReducer';
import apiClient from '../../api/apiClient';

/* ─────────────────────────────────────────────
   DESIGN TOKENS  (edit once, applies everywhere)
───────────────────────────────────────────── */
const C = {
    primary: '#5B21B6',
    primaryLight: '#EDE9FE',
    primaryMid: '#7C3AED',
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    gray900: '#111827',
    gray700: '#374151',
    gray500: '#6B7280',
    gray300: '#D1D5DB',
    gray100: '#F3F4F6',
    gray50: '#F9FAFB',
    white: '#FFFFFF',
};

/* ─────────────────────────────────────────────
   SMALL REUSABLE ATOMS
───────────────────────────────────────────── */
const Label = ({ children, required }) => (
    <p className="text-sm font-semibold text-gray-600 mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </p>
);

const FieldBox = ({ error, children, className = '' }) => (
    <div className={`w-full bg-white border-2 rounded-xl transition-all ${error ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-200 focus-within:border-violet-500'} ${className}`}>
        {children}
    </div>
);

const Badge = ({ color = 'violet', children }) => {
    const map = {
        violet: 'bg-violet-100 text-violet-700',
        green: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        red: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color]}`}>
            {children}
        </span>
    );
};

const Pill = ({ active, children, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
            active
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-violet-400 hover:text-violet-600'
        }`}
    >
        {children}
    </button>
);

/* ─────────────────────────────────────────────
   PRICING BREAKDOWN CARD
───────────────────────────────────────────── */
const PricingBreakdown = ({ basePrice, gstPct, mrp, isBulkOnly }) => {
    if (!basePrice || isNaN(basePrice)) return null;
    const base = parseFloat(basePrice);
    const gst = parseFloat(gstPct || 5);
    const gstAmt = +(base * (gst / 100)).toFixed(2);
    const youEarn = +(base + gstAmt).toFixed(2);
    const mrpVal = parseFloat(mrp || 0);
    const isLoss = !isBulkOnly && mrpVal > 0 && youEarn > mrpVal;

    return (
        <div className={`mt-3 rounded-xl border-2 ${isLoss ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'} overflow-hidden`}>
            {isLoss && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border-b border-red-200">
                    <AlertCircle size={14} className="text-red-600 shrink-0" />
                    <p className="text-red-700 text-xs font-semibold">
                        ⚠️ Total price (₹{youEarn}) exceeds MRP (₹{mrpVal}). Please fix before listing.
                    </p>
                </div>
            )}
            <div className="flex divide-x divide-gray-200">
                <div className="flex-1 px-3 py-2.5 text-center">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Base Price</p>
                    <p className="text-base font-bold text-gray-800">₹{base.toFixed(2)}</p>
                </div>
                <div className="flex-1 px-3 py-2.5 text-center">
                    <p className="text-xs text-amber-600 font-medium mb-0.5">GST ({gst}%)</p>
                    <p className="text-base font-bold text-amber-700">+₹{gstAmt}</p>
                </div>
                <div className="flex-1 px-3 py-2.5 text-center">
                    <p className="text-xs text-emerald-600 font-medium mb-0.5">You Earn</p>
                    <p className={`text-base font-bold ${isLoss ? 'text-red-600' : 'text-emerald-700'}`}>₹{youEarn}</p>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const SupplierCatalogUpload = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const editCatalogId = location.state?.editCatalogId || null;
    const isEditMode = !!editCatalogId;

    const { supplierData, loader: submitLoading, successMessage, errorMessage } = useSelector(s => s.vendor);

    const [step, setStep] = useState(1);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [generatingAIFor, setGeneratingAIFor] = useState(null);
    const [advisingPrice, setAdvisingPrice] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedSpecs, setSelectedSpecs] = useState([]);
    const [specModes, setSpecModes] = useState({});

    // CATEGORY MODAL STATE
    const [showCatModal, setShowCatModal] = useState(false);
    const [modalCategories, setModalCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(false);
    const [catLevel, setCatLevel] = useState(0);
    const [selectedMain, setSelectedMain] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [catSearch, setCatSearch] = useState('');

    const [catalogInfo, setCatalogInfo] = useState({
        catalogName: '',
        category: '',
        subCategory: '',
        leafCategory: '',
        description: '',
        tags: '',
        hsnCode: '',
        gstPercentage: '5',
        isBulkOnly: false,
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        highlights: {},
        status: '',
    });

    const initId = Date.now();
    const [products, setProducts] = useState([{
        id: initId,
        variantName: '',
        isPrimary: true,
        images: [],
        primaryImageIndex: 0,
        variants: [{ size: 'Free Size', listingPrice: '', mrp: '', stock: '', skuId: '', priceTiers: [] }],
        highlights: {},
        description: '',
    }]);
    const [expandedVariantId, setExpandedVariantId] = useState(initId);

    /* ── effects ── */
    useEffect(() => {
        if (successMessage) { toast.success(successMessage); dispatch(messageClear()); navigate('/supplier-inventory'); }
        if (errorMessage) { toast.error(errorMessage); dispatch(messageClear()); }
    }, [successMessage, errorMessage]);

    useEffect(() => {
        if (!editCatalogId) return;
        const load = async () => {
            setFetchLoading(true);
            try {
                const result = await dispatch(get_catalog_for_edit(editCatalogId)).unwrap();
                const catalog = result.catalog;
                let gst = String(catalog.gstPercentage || '5');
                const gstRate = 1 + parseInt(gst) / 100;
                setCatalogInfo({
                    catalogName: catalog.productName || '',
                    category: catalog.category || '',
                    subCategory: catalog.subCategory || '',
                    leafCategory: catalog.leafCategory || '',
                    description: catalog.description || '',
                    tags: catalog.tags || '',
                    hsnCode: catalog.hsnCode || '',
                    gstPercentage: gst,
                    isBulkOnly: catalog.isBulkOnly || false,
                    weight: String(catalog.weight || ''),
                    dimensions: catalog.dimensions || { length: '', width: '', height: '' },
                    highlights: {},
                    status: catalog.status || '',
                });
                const allProds = catalog.similarProducts?.length > 0 ? catalog.similarProducts : [catalog];
                setProducts(allProds.map((p, i) => ({
                    id: p._id || Date.now() + i,
                    _id: p._id,
                    variantName: p.productName || p.variants?.[0]?.variantName || '',
                    isPrimary: p.isPrimary || i === 0,
                    images: p.images || [],
                    primaryImageIndex: 0,
                    description: p.description || '',
                    highlights: p.additionalDetails || {},
                    variants: (p.variants || []).map(v => ({
                        ...v,
                        listingPrice: (parseFloat(v.listingPrice) / gstRate).toFixed(2),
                        mrp: parseFloat(v.mrp).toFixed(2),
                        stock: v.stock || 0,
                        priceTiers: (v.priceTiers || []).map(t => ({ ...t, price: (parseFloat(t.price) / gstRate).toFixed(2) })),
                    })),
                })));
            } catch { toast.error('Failed to load catalog'); navigate('/supplier-inventory'); }
            finally { setFetchLoading(false); }
        };
        load();
    }, []);

    // Auto-SKU on mount
    useEffect(() => {
        if (supplierData && !products[0].variants[0].skuId) {
            const n = [...products];
            n[0].variants[0].skuId = generateSKU();
            setProducts(n);
        }
    }, [supplierData]);

    // Category fetch
    useEffect(() => {
        if (!showCatModal) return;
        const fetch = async () => {
            setCatLoading(true);
            try {
                const params = {};
                if (catLevel === 0) params.level = 0;
                else if (catLevel === 1 && selectedMain) params.parentId = selectedMain._id;
                else if (catLevel === 2 && selectedSub) params.parentId = selectedSub._id;
                const { data } = await apiClient.get('/wear/category/get-pure', { params });
                setModalCategories(data.categories || []);
            } catch { toast.error('Failed to load categories'); }
            finally { setCatLoading(false); }
        };
        fetch();
    }, [catLevel, selectedMain, selectedSub, showCatModal]);

    // Auto tags
    useEffect(() => {
        const t = setTimeout(() => {
            const existing = Array.isArray(catalogInfo.tags) ? catalogInfo.tags.join('') : (catalogInfo.tags || '');
            if (catalogInfo.catalogName && !existing.trim()) handleAITagsGenerate();
        }, 1200);
        return () => clearTimeout(t);
    }, [catalogInfo.catalogName]);

    /* ── helpers ── */
    const generateSKU = () => {
        const shop = supplierData?.businessDetails?.shopName?.substring(0, 3).toUpperCase() || 'SUP';
        return `JEEN-${shop}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    };

    const updateProduct = (pIdx, updater) => {
        setProducts(prev => prev.map((p, idx) => {
            if (idx !== pIdx) return p;
            const newP = {
                ...p,
                images: [...p.images],
                variants: p.variants.map(v => ({ ...v, priceTiers: [...(v.priceTiers || []).map(t => ({ ...t }))] })),
                highlights: { ...p.highlights }
            };
            updater(newP);
            return newP;
        }));
    };

    const updateVariant = (pIdx, vIdx, updater) => {
        setProducts(prev => prev.map((p, idx) => {
            if (idx !== pIdx) return p;
            const newVariants = p.variants.map((v, vidx) => {
                if (vidx !== vIdx) return v;
                const newV = { ...v, priceTiers: [...(v.priceTiers || []).map(t => ({ ...t }))] };
                updater(newV);
                return newV;
            });
            return { ...p, variants: newVariants };
        }));
    };

    /* ── AI handlers ── */
    const handleAITagsGenerate = async () => {
        if (!catalogInfo.catalogName || catalogInfo.catalogName.length < 5) return;
        try {
            const { data } = await apiClient.post('/wear/dashboard/supplier/ai-seo-tags', { productName: catalogInfo.catalogName });
            if (data.tags) setCatalogInfo(prev => ({ ...prev, tags: data.tags }));
        } catch { /* silent */ }
    };

    const handleAIGenerate = async (pIdx) => {
        const prod = products[pIdx];
        if (!catalogInfo.catalogName || !catalogInfo.category) return toast.error('Enter catalog name and category first');
        setGeneratingAIFor(pIdx);
        const tid = toast.loading(prod.images.length > 0 ? 'AI is reading your image…' : 'AI is writing description…');
        try {
            const specsContext = Object.entries(prod.highlights || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ');
            let data;
            if (prod.images.length > 0) {
                const r = await apiClient.post('/wear/dashboard/supplier/ai-write-from-image', { images: prod.images.slice(0, 3), productName: catalogInfo.catalogName, category: catalogInfo.category, specs: specsContext || null });
                data = r.data;
                if (data.geminiAnalysis) {
                    const g = data.geminiAnalysis;
                    updateProduct(pIdx, p => {
                        if (g.fabric && !p.highlights['Fabric']) p.highlights['Fabric'] = g.fabric;
                        if (g.pattern && !p.highlights['Pattern']) p.highlights['Pattern'] = g.pattern;
                        if (g.fit && !p.highlights['Fit']) p.highlights['Fit'] = g.fit;
                    });
                }
            } else {
                const r = await apiClient.post('/wear/dashboard/supplier/ai-recommend', { productName: catalogInfo.catalogName, category: catalogInfo.category, existingDescription: prod.description || '', specs: specsContext || 'Standard quality' });
                data = r.data;
            }
            if (data.description) {
                updateProduct(pIdx, p => { p.description = data.description; });
                toast.success('AI wrote the description!', { id: tid });
            }
        } catch (e) { toast.error(e.response?.data?.error || 'AI generation failed', { id: tid }); }
        setGeneratingAIFor(null);
    };

    const handleAIPriceAdvice = async (pIdx, vIdx) => {
        if (!catalogInfo.catalogName || !catalogInfo.category) return toast.error('Product name & category needed');
        setAdvisingPrice({ pIdx, vIdx });
        try {
            const { data } = await apiClient.post('/wear/dashboard/supplier/ai-advise-price', { productName: catalogInfo.catalogName, category: catalogInfo.category });
            if (data.suggestedPrice) {
                updateVariant(pIdx, vIdx, v => { v.listingPrice = data.suggestedPrice; });
                toast.success(`AI suggests ₹${data.suggestedPrice}: ${data.reason}`, { duration: 4000 });
            }
        } catch { toast.error('Price advice failed'); }
        setAdvisingPrice(null);
    };

    /* ── category selection ── */
    const handleCategorySelect = async (item) => {
        const finalise = async (cat, sub, leaf) => {
            setCatalogInfo(prev => ({ ...prev, category: cat, subCategory: sub, leafCategory: leaf }));
            try {
                const { data } = await apiClient.post('/wear/dashboard/supplier/ai-suggest-gst', { productName: catalogInfo.catalogName, category: cat, subCategory: sub });
                if (data.success) setCatalogInfo(prev => ({ ...prev, gstPercentage: String(data.gst), hsnCode: data.hsn || data.hsnCode || prev.hsnCode }));
            } catch { /* use default */ }
            if (item.additionalDetails && Array.isArray(item.additionalDetails)) {
                setSelectedSpecs(item.additionalDetails);
                setProducts(prev => prev.map(p => ({ ...p, highlights: { ...Object.fromEntries(item.additionalDetails.map(s => [typeof s === 'object' ? s.name : s, ''])), ...p.highlights } })));
            }
            setShowCatModal(false); setCatLevel(0); setCatSearch('');
        };

        if (item.subCount === 0) {
            if (catLevel === 0) await finalise(item.name, item.name, item.name);
            else if (catLevel === 1) await finalise(selectedMain?.name || '', item.name, item.name);
            else await finalise(selectedMain?.name || '', selectedSub?.name || '', item.name);
            return;
        }
        if (catLevel === 0) { setSelectedMain(item); setCatalogInfo(prev => ({ ...prev, category: item.name, subCategory: '', leafCategory: '' })); setCatLevel(1); }
        else if (catLevel === 1) { setSelectedSub(item); setCatalogInfo(prev => ({ ...prev, subCategory: item.name, leafCategory: '' })); setCatLevel(2); }
        else { await finalise(selectedMain?.name || '', selectedSub?.name || '', item.name); }
    };

    /* ── products ── */
    const addProductVariant = () => {
        const primary = products[0];
        const newId = Date.now();
        setProducts(prev => [...prev, {
            id: newId, variantName: '', isPrimary: false, images: [], primaryImageIndex: 0,
            variants: primary.variants.map(v => ({ ...v, stock: '', skuId: generateSKU(), priceTiers: [] })),
            highlights: { ...primary.highlights }, description: '',
        }]);
        setExpandedVariantId(newId);
    };

    const handleImageUpload = (pIdx, e) => {
        const files = Array.from(e.target.files);
        if (files.length + products[pIdx].images.length > 12) return toast.error('Max 12 images allowed');
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => updateProduct(pIdx, p => { p.images.push(reader.result); });
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    /* ── validation ── */
    const validateStep = () => {
        const e = {};
        if (step === 1) {
            if (!catalogInfo.catalogName || catalogInfo.catalogName.trim().length < 3) { toast.error('Enter a valid catalog name (min 3 chars)'); e.catalogName = true; }
            if (!catalogInfo.category) { toast.error('Select a category'); e.category = true; }
        }
        if (step === 2) {
            for (let i = 0; i < products.length; i++) {
                const p = products[i];
                const label = products.length > 1 ? (p.variantName || `Variant ${i + 1}`) : 'Product';
                if (p.images.length === 0) { toast.error(`Upload at least one image for ${label}`); e[`img_${p.id}`] = true; setExpandedVariantId(p.id); setErrors(e); return false; }
                if (products.length > 1 && !p.variantName?.trim()) { toast.error(`Enter color/variant name for Variant ${i + 1}`); e[`color_${p.id}`] = true; setExpandedVariantId(p.id); setErrors(e); return false; }
                for (let j = 0; j < p.variants.length; j++) {
                    const v = p.variants[j];
                    const key = `${p.id}_${j}`;
                    if (!v.size?.trim()) { toast.error(`Enter size for ${label}`); e[`size_${key}`] = true; setExpandedVariantId(p.id); setErrors(e); return false; }
                    if (!catalogInfo.isBulkOnly) {
                        if (!v.mrp || isNaN(v.mrp) || parseFloat(v.mrp) <= 0) { toast.error(`Enter valid MRP for ${label} (${v.size})`); e[`mrp_${key}`] = true; setExpandedVariantId(p.id); setErrors(e); return false; }
                        if (!v.listingPrice || isNaN(v.listingPrice) || parseFloat(v.listingPrice) <= 0) { toast.error(`Enter valid base price for ${label} (${v.size})`); e[`price_${key}`] = true; setExpandedVariantId(p.id); setErrors(e); return false; }
                        const total = parseFloat(v.listingPrice) * (1 + parseFloat(catalogInfo.gstPercentage || 5) / 100);
                        if (total > parseFloat(v.mrp)) { toast.error(`Total price ₹${total.toFixed(2)} exceeds MRP for ${label} (${v.size})`); e[`price_${key}`] = true; setExpandedVariantId(p.id); setErrors(e); return false; }
                    }
                    if (v.stock === '' || isNaN(v.stock) || parseInt(v.stock) < 0) { toast.error(`Enter valid stock for ${label} (${v.size})`); e[`stock_${key}`] = true; setExpandedVariantId(p.id); setErrors(e); return false; }
                }
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ── submit ── */
    const buildPayload = () => {
        const gstM = 1 + parseInt(catalogInfo.gstPercentage || 5) / 100;
        return products.map(prod => ({
            catalogName: catalogInfo.catalogName,
            productName: prod.variantName || catalogInfo.catalogName,
            description: (prod.description || catalogInfo.description) + (catalogInfo.tags ? `\n\nKeywords: ${catalogInfo.tags}` : ''),
            category: catalogInfo.category,
            subCategory: catalogInfo.subCategory,
            images: prod.images,
            isPrimary: prod.isPrimary,
            hsnCode: catalogInfo.hsnCode,
            gstPercentage: parseInt(catalogInfo.gstPercentage),
            weight: parseInt(catalogInfo.weight) || 0,
            tags: catalogInfo.tags || '',
            price: +(parseFloat(prod.variants[0].listingPrice || 0) * gstM).toFixed(2),
            originalPrice: parseFloat(prod.variants[0].mrp) || 0,
            additionalDetails: prod.highlights,
            isBulkOnly: catalogInfo.isBulkOnly,
            variants: prod.variants.map(v => ({
                ...v,
                variantName: prod.variantName,
                listingPrice: +(parseFloat(v.listingPrice || 0) * gstM).toFixed(2),
                mrp: parseFloat(v.mrp),
                stock: parseInt(v.stock),
                priceTiers: (v.priceTiers || []).map(t => ({ minQty: parseInt(t.minQty), price: +(parseFloat(t.price) * gstM).toFixed(2) })).filter(t => !isNaN(t.minQty) && !isNaN(t.price)),
            })),
        }));
    };

    const handleSubmit = () => { if (!catalogInfo.catalogName || !catalogInfo.category) return toast.error('Fill catalog info first'); dispatch(add_catalog(buildPayload())); };

    const handleEditSubmit = () => {
        if (!catalogInfo.catalogName || !catalogInfo.category) return toast.error('Fill catalog info first');
        const gstM = 1 + parseInt(catalogInfo.gstPercentage || 5) / 100;
        dispatch(edit_catalog({
            catalogId: editCatalogId,
            catalogInfo,
            products: products.map(prod => ({
                _id: prod._id,
                catalogName: catalogInfo.catalogName,
                productName: prod.variantName || catalogInfo.catalogName,
                variantName: prod.variantName,
                images: prod.images,
                isPrimary: prod.isPrimary,
                description: prod.description || '',
                additionalDetails: prod.highlights,
                isBulkOnly: catalogInfo.isBulkOnly,
                variants: prod.variants.map(v => ({
                    ...v,
                    variantName: prod.variantName,
                    listingPrice: +(parseFloat(v.listingPrice || 0) * gstM).toFixed(2),
                    mrp: parseFloat(v.mrp),
                    stock: parseInt(v.stock),
                    priceTiers: (v.priceTiers || []).map(t => ({ minQty: parseInt(t.minQty), price: +(parseFloat(t.price) * gstM).toFixed(2) })).filter(t => !isNaN(t.minQty) && !isNaN(t.price)),
                })),
            })),
        }));
        setShowConfirmModal(false);
    };

    /* ── filtered cats ── */
    const filteredCats = catSearch.trim()
        ? modalCategories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
        : modalCategories;

    /* ═══════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════ */
    return (
        <>
            {/* FETCH LOADING */}
            {fetchLoading && (
                <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 font-semibold text-sm">Loading catalog…</p>
                </div>
            )}

            {/* ── HEADER ── */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                    <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/supplier-inventory')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={22} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 leading-tight">{isEditMode ? 'Edit Catalog' : 'Add Catalog'}</h1>
                        {isEditMode && catalogInfo.status && (
                            <Badge color={catalogInfo.status === 'active' ? 'green' : catalogInfo.status === 'pending' ? 'amber' : 'red'}>
                                {catalogInfo.status === 'active' ? 'Live' : catalogInfo.status}
                            </Badge>
                        )}
                    </div>
                </div>
                <button className="text-violet-600 font-semibold text-sm">Help</button>
            </div>
            <div className="h-14 w-full" />

            {/* ── STEPPER ── */}
            <div className="sticky top-14 lg:top-0 z-40 bg-white border-b border-gray-100">
                <div className="flex max-w-md lg:!max-w-[1000px] mx-auto">
                    {[
                        { id: 1, label: 'Catalog Info', icon: <Package size={15} /> },
                        { id: 2, label: 'Add Products', icon: <Layers size={15} /> },
                    ].map(s => (
                        <button
                            key={s.id}
                            onClick={() => {
                                if (s.id < step) setStep(s.id);
                                else if (s.id === step + 1 && validateStep()) setStep(s.id);
                            }}
                            className="flex-1 flex flex-col items-center py-2.5 relative"
                        >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-colors ${step === s.id ? 'bg-violet-100 text-violet-700' : step > s.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                {step > s.id ? <Check size={14} /> : s.icon}
                            </div>
                            <span className={`text-xs font-semibold transition-colors ${step === s.id ? 'text-violet-700' : step > s.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                            {step === s.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 pb-24 overflow-y-auto max-w-md lg:!max-w-[1000px] mx-auto w-full lg:bg-white lg:shadow-sm lg:rounded-2xl lg:p-6 lg:my-6">
                <AnimatePresence mode="wait">

                    {/* ══ STEP 1 ══ */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-4 space-y-5">

                            {/* Catalog Name */}
                            <div>
                                <Label required>Catalog Name</Label>
                                <FieldBox error={errors.catalogName}>
                                    <input
                                        placeholder="e.g. Summer Cotton Kurti Set"
                                        value={catalogInfo.catalogName}
                                        onChange={e => { setCatalogInfo(p => ({ ...p, catalogName: e.target.value })); setErrors(p => ({ ...p, catalogName: false })); }}
                                        className="w-full px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 bg-transparent outline-none rounded-xl"
                                    />
                                </FieldBox>
                                <p className="text-xs text-gray-400 mt-1.5">Use a descriptive name — it helps customers find your product.</p>

                                {/* SEO Tags */}
                                {catalogInfo.tags && (
                                    <div className="mt-3 bg-violet-50 border border-violet-100 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Tag size={13} className="text-violet-600" />
                                                <span className="text-xs font-semibold text-violet-700">SEO Tags</span>
                                            </div>
                                            <button onClick={handleAITagsGenerate} className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                                                <Sparkles size={11} /> Refresh
                                            </button>
                                        </div>
                                        <p className="text-xs text-violet-700 leading-relaxed">
                                            {Array.isArray(catalogInfo.tags) ? catalogInfo.tags.join(', ') : catalogInfo.tags}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <Label required>Category</Label>
                                <button onClick={() => setShowCatModal(true)} className={`w-full flex items-center justify-between bg-white border-2 rounded-xl px-4 py-3 transition-all ${errors.category ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-200 hover:border-violet-400'}`}>
                                    <span className={`text-sm font-medium ${catalogInfo.category ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {catalogInfo.category
                                            ? [...new Set([catalogInfo.category, catalogInfo.subCategory, catalogInfo.leafCategory].filter(Boolean))].join(' › ')
                                            : 'Select category'}
                                    </span>
                                    <ChevronRight size={16} className="text-violet-600 shrink-0" />
                                </button>
                            </div>

                            {/* HSN + GST row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>HSN Code</Label>
                                    <FieldBox>
                                        <input
                                            placeholder="e.g. 6204"
                                            value={catalogInfo.hsnCode}
                                            onChange={e => setCatalogInfo(p => ({ ...p, hsnCode: e.target.value }))}
                                            className="w-full px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 bg-transparent outline-none rounded-xl"
                                        />
                                    </FieldBox>
                                </div>
                                <div>
                                    <Label>GST Rate</Label>
                                    <div className="relative">
                                        <select
                                            value={catalogInfo.gstPercentage || '5'}
                                            onChange={e => setCatalogInfo(p => ({ ...p, gstPercentage: e.target.value }))}
                                            className="w-full px-4 py-3 pr-16 text-sm font-bold text-violet-700 bg-violet-50 border-2 border-violet-100 rounded-xl outline-none appearance-none cursor-pointer focus:border-violet-400 focus:bg-white transition-all"
                                        >
                                            <option value="0">0%</option>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                                            <span className="text-[10px] font-semibold text-violet-500 bg-violet-100 px-1.5 py-0.5 rounded-full shrink-0">AI Auto</span>
                                            <ChevronDown size={14} className="text-violet-600 shrink-0" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Change to override AI suggestion</p>
                                </div>
                            </div>

                            {/* Bulk Only toggle */}
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-0.5">Bulk Orders Only</p>
                                    <p className="text-xs text-gray-500">Enable if you only accept wholesale/bulk orders for this catalog.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCatalogInfo(p => ({ ...p, isBulkOnly: !p.isBulkOnly }))}
                                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ml-4 ${catalogInfo.isBulkOnly ? 'bg-violet-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${catalogInfo.isBulkOnly ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Tip */}
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                                <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    <strong>Tip:</strong> Descriptive catalog names get 3× more visibility. Avoid generic names like "My Product".
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ══ STEP 2 ══ */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-3 pt-3">

                            {products.map((prod, pIdx) => {
                                const isExpanded = expandedVariantId === prod.id;
                                const accentColors = [
                                    { border: 'border-blue-200', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', header: 'text-blue-800' },
                                    { border: 'border-rose-200', bg: 'bg-rose-50', badge: 'bg-rose-100 text-rose-700', header: 'text-rose-800' },
                                    { border: 'border-emerald-200', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', header: 'text-emerald-800' },
                                    { border: 'border-amber-200', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', header: 'text-amber-800' },
                                ];
                                const ac = accentColors[pIdx % accentColors.length];

                                return (
                                    <div key={prod.id} className={`border-2 ${ac.border} ${ac.bg} rounded-2xl overflow-hidden mx-3`}>
                                        {/* Accordion Header */}
                                        <div
                                            onClick={() => setExpandedVariantId(isExpanded ? null : prod.id)}
                                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${ac.badge}`}>
                                                    {pIdx + 1}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold text-sm ${ac.header}`}>
                                                        {prod.variantName || `Variant ${pIdx + 1}`}
                                                    </p>
                                                    {!isExpanded && (
                                                        <p className="text-xs text-gray-500">{prod.images.length} photo{prod.images.length !== 1 ? 's' : ''} · {prod.variants.length} size{prod.variants.length !== 1 ? 's' : ''}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {products.length > 1 && (
                                                    <button
                                                        onClick={e => { e.stopPropagation(); setProducts(prev => prev.filter((_, i) => i !== pIdx)); }}
                                                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>

                                        {/* Accordion Body */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="bg-white/70 backdrop-blur-sm"
                                                >
                                                    <div className="p-4 space-y-5 max-h-[580px] overflow-y-auto variant-scrollbar">

                                                        {/* Variant Name */}
                                                        <div>
                                                            <Label required={products.length > 1}>Variant Name / Color</Label>
                                                            <FieldBox error={errors[`color_${prod.id}`]}>
                                                                <input
                                                                    placeholder="e.g. Royal Blue, Full Sleeve"
                                                                    value={prod.variantName}
                                                                    onChange={e => updateProduct(pIdx, p => { p.variantName = e.target.value; })}
                                                                    className="w-full px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 bg-transparent outline-none rounded-xl"
                                                                />
                                                            </FieldBox>
                                                        </div>

                                                        {/* Images */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Label required>Product Photos</Label>
                                                                <span className="text-xs text-gray-400">{prod.images.length}/12</span>
                                                            </div>
                                                            <div className={`grid grid-cols-4 gap-2 p-2 rounded-xl transition-all ${errors[`img_${prod.id}`] ? 'bg-red-50 ring-2 ring-red-200' : ''}`}>
                                                                {prod.images.map((img, iIdx) => (
                                                                    <div key={iIdx} className={`aspect-[3/4] rounded-xl overflow-hidden relative border-2 transition-all ${prod.primaryImageIndex === iIdx ? 'border-violet-500 shadow-md' : 'border-transparent'}`}>
                                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                                        <button
                                                                            onClick={() => updateProduct(pIdx, p => { p.primaryImageIndex = iIdx; })}
                                                                            className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shadow ${prod.primaryImageIndex === iIdx ? 'bg-violet-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'}`}
                                                                        >
                                                                            {prod.primaryImageIndex === iIdx ? 'Main' : 'Set'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => updateProduct(pIdx, p => {
                                                                                p.images.splice(iIdx, 1);
                                                                                if (p.primaryImageIndex === iIdx) p.primaryImageIndex = 0;
                                                                                else if (p.primaryImageIndex > iIdx) p.primaryImageIndex -= 1;
                                                                            })}
                                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md shadow"
                                                                        >
                                                                            <X size={10} strokeWidth={3} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {prod.images.length < 12 && (
                                                                    <label className="aspect-[3/4] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all">
                                                                        <ImageIcon size={20} className="text-gray-300" />
                                                                        <span className="text-[10px] font-semibold text-gray-400 mt-1">Add Photo</span>
                                                                        <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(pIdx, e)} className="hidden" />
                                                                    </label>
                                                                )}
                                                            </div>
                                                            {errors[`img_${prod.id}`] && <p className="text-xs text-red-500 mt-1 font-medium">Please add at least one photo.</p>}
                                                        </div>

                                                        {/* Size Variations */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Label required>Sizes & Pricing</Label>
                                                                <button
                                                                    onClick={() => updateProduct(pIdx, p => { p.variants.push({ size: '', listingPrice: '', mrp: '', stock: '', skuId: generateSKU(), priceTiers: [] }); })}
                                                                    className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
                                                                >
                                                                    <Plus size={13} /> Add Size
                                                                </button>
                                                            </div>

                                                            {/* Quick size pills */}
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(sz => {
                                                                    const exists = prod.variants.some(v => v.size?.toUpperCase() === sz.toUpperCase());
                                                                    return (
                                                                        <Pill key={sz} active={exists} onClick={() => {
                                                                            if (exists) return;
                                                                            updateProduct(pIdx, p => {
                                                                                if (p.variants.length === 1 && !p.variants[0].size) p.variants[0].size = sz;
                                                                                else p.variants.push({ size: sz, listingPrice: p.variants[0].listingPrice, mrp: p.variants[0].mrp, stock: '', skuId: generateSKU(), priceTiers: [] });
                                                                            });
                                                                        }}>{sz}</Pill>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="space-y-3">
                                                                {prod.variants.map((v, vIdx) => {
                                                                    const key = `${prod.id}_${vIdx}`;
                                                                    return (
                                                                        <div key={vIdx} className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-sm">
                                                                            {/* Size / Prices */}
                                                                            <div className={`grid gap-3 mb-3 ${catalogInfo.isBulkOnly ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                                                                <div>
                                                                                    <Label>Size</Label>
                                                                                    <input
                                                                                        placeholder="S / M / L…"
                                                                                        value={v.size}
                                                                                        onChange={e => updateVariant(pIdx, vIdx, va => { va.size = e.target.value; })}
                                                                                        className={`w-full border-2 rounded-lg px-3 py-2 text-sm font-semibold text-center outline-none transition-all ${errors[`size_${key}`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-violet-500 focus:bg-white'}`}
                                                                                    />
                                                                                </div>
                                                                                {!catalogInfo.isBulkOnly && (
                                                                                    <>
                                                                                        <div>
                                                                                            <Label>Base Price (₹)</Label>
                                                                                            <p className="text-[10px] text-gray-400 -mt-1 mb-1">Your selling price before GST</p>
                                                                                            <div className="relative">
                                                                                                <IndianRupee size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                                                <input
                                                                                                    type="number"
                                                                                                    placeholder="440"
                                                                                                    value={v.listingPrice}
                                                                                                    onChange={e => updateVariant(pIdx, vIdx, va => { va.listingPrice = e.target.value; })}
                                                                                                    className={`w-full border-2 rounded-lg pl-7 pr-3 py-2 text-sm font-semibold text-center outline-none transition-all ${errors[`price_${key}`] ? 'border-red-400 bg-red-50' : 'border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 focus:bg-white text-emerald-800'}`}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <Label>MRP (₹)</Label>
                                                                                            <p className="text-[10px] text-gray-400 -mt-1 mb-1">Customer pays this amount</p>
                                                                                            <div className="relative">
                                                                                                <IndianRupee size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                                                <input
                                                                                                    type="number"
                                                                                                    placeholder="599"
                                                                                                    value={v.mrp}
                                                                                                    onChange={e => updateVariant(pIdx, vIdx, va => { va.mrp = e.target.value; })}
                                                                                                    className={`w-full border-2 rounded-lg pl-7 pr-3 py-2 text-sm font-semibold text-center outline-none transition-all ${errors[`mrp_${key}`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-violet-500 focus:bg-white'}`}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>

                                                                            {/* Pricing Breakdown */}
                                                                            {!catalogInfo.isBulkOnly && (
                                                                                <PricingBreakdown
                                                                                    basePrice={v.listingPrice}
                                                                                    gstPct={catalogInfo.gstPercentage}
                                                                                    mrp={v.mrp}
                                                                                    isBulkOnly={catalogInfo.isBulkOnly}
                                                                                />
                                                                            )}



                                                                            {/* SKU */}
                                                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                                                                <span className="text-xs text-gray-400 font-medium">SKU:</span>
                                                                                <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                                    {v.skuId || 'Auto-generated on save'}
                                                                                </span>
                                                                            </div>

                                                                            {/* Bulk Pricing */}
                                                                            <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                                                                                <div className="flex items-center justify-between mb-2.5">
                                                                                    <div>
                                                                                        <p className="text-sm font-semibold text-gray-700">
                                                                                            Bulk Pricing {catalogInfo.isBulkOnly ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-xs">(optional)</span>}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-400">Discount for large quantity orders</p>
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={() => updateVariant(pIdx, vIdx, va => { va.priceTiers.push({ minQty: '', price: '' }); })}
                                                                                        className="flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors"
                                                                                    >
                                                                                        <Plus size={12} /> Add Tier
                                                                                    </button>
                                                                                </div>

                                                                                {v.priceTiers?.length > 0 ? (
                                                                                    <div className="space-y-2">
                                                                                        {v.priceTiers.map((tier, tIdx) => (
                                                                                            <div key={tIdx} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                                                                                                <div className="flex items-center gap-1.5 flex-1">
                                                                                                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Min Qty</span>
                                                                                                    <input
                                                                                                        type="number"
                                                                                                        placeholder="10"
                                                                                                        value={tier.minQty}
                                                                                                        onChange={e => updateVariant(pIdx, vIdx, va => { va.priceTiers[tIdx].minQty = e.target.value; })}
                                                                                                        className="w-14 border border-gray-200 rounded-lg p-1.5 text-center text-sm font-semibold bg-white outline-none"
                                                                                                    />
                                                                                                    <span className="text-xs text-gray-500 font-medium">Price ₹</span>
                                                                                                    <input
                                                                                                        type="number"
                                                                                                        placeholder="390"
                                                                                                        value={tier.price}
                                                                                                        onChange={e => {
                                                                                                            updateVariant(pIdx, vIdx, va => {
                                                                                                                va.priceTiers[tIdx].price = e.target.value;
                                                                                                                if (catalogInfo.isBulkOnly && tIdx === 0) va.listingPrice = e.target.value;
                                                                                                            });
                                                                                                        }}
                                                                                                        className="flex-1 border border-gray-200 rounded-lg p-1.5 text-center text-sm font-semibold text-violet-700 bg-white outline-none"
                                                                                                    />
                                                                                                </div>
                                                                                                {tier.price && (() => {
                                                                                                    const p2 = parseFloat(tier.price) || 0;
                                                                                                    const g = parseFloat(catalogInfo.gstPercentage || 5);
                                                                                                    const payout = (p2 * (1 + g / 100)).toFixed(2);
                                                                                                    return (
                                                                                                        <div className="text-right shrink-0">
                                                                                                            <p className="text-[10px] text-amber-600 font-semibold">+{g}% GST</p>
                                                                                                            <p className="text-[10px] text-emerald-700 font-bold">₹{payout} payout</p>
                                                                                                        </div>
                                                                                                    );
                                                                                                })()}
                                                                                                <button
                                                                                                    onClick={() => updateVariant(pIdx, vIdx, va => { va.priceTiers.splice(tIdx, 1); })}
                                                                                                    className="text-gray-300 hover:text-red-400 p-1 transition-colors"
                                                                                                >
                                                                                                    <X size={14} />
                                                                                                </button>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-xs text-gray-400 italic">No bulk tiers added yet.</p>
                                                                                )}
                                                                            </div>

                                                                            {/* Stock */}
                                                                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-sm font-semibold text-gray-700">Stock:</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        placeholder="0"
                                                                                        value={v.stock}
                                                                                        onChange={e => updateVariant(pIdx, vIdx, va => { va.stock = e.target.value; })}
                                                                                        className={`w-20 border-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-center outline-none transition-all ${errors[`stock_${key}`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-violet-500 focus:bg-white'}`}
                                                                                    />
                                                                                    <span className="text-xs text-gray-400">units</span>
                                                                                </div>
                                                                                {prod.variants.length > 1 && (
                                                                                    <button onClick={() => updateProduct(pIdx, p => { p.variants.splice(vIdx, 1); })} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                                                                                        <Trash2 size={15} />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Specifications */}
                                                        {selectedSpecs.length > 0 && (
                                                            <div>
                                                                <Label>Specifications</Label>
                                                                <div className="space-y-3">
                                                                    {selectedSpecs.map((spec, sIdx) => {
                                                                        const specName = typeof spec === 'object' ? spec.name : spec;
                                                                        const options = spec.options || [];
                                                                        const currentMode = specModes[specName] || (options.length > 0 ? 'select' : 'type');
                                                                        return (
                                                                            <div key={sIdx}>
                                                                                <div className="flex items-center justify-between mb-1.5">
                                                                                    <p className="text-xs font-semibold text-gray-600">{specName}{spec.required ? ' *' : ''}</p>
                                                                                    {options.length > 0 && (
                                                                                        <button onClick={() => setSpecModes(p => ({ ...p, [specName]: currentMode === 'select' ? 'type' : 'select' }))} className="text-xs text-violet-600 font-semibold">
                                                                                            {currentMode === 'select' ? '+ Custom' : '☰ List'}
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                                {currentMode === 'select' ? (
                                                                                    <select
                                                                                        value={prod.highlights[specName] || ''}
                                                                                        onChange={e => updateProduct(pIdx, p => { p.highlights[specName] = e.target.value; })}
                                                                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 bg-white outline-none focus:border-violet-500"
                                                                                    >
                                                                                        <option value="">Select…</option>
                                                                                        {options.map((o, oi) => <option key={oi} value={o}>{o}</option>)}
                                                                                    </select>
                                                                                ) : (
                                                                                    <input
                                                                                        placeholder={`Enter ${specName}…`}
                                                                                        value={prod.highlights[specName] || ''}
                                                                                        onChange={e => updateProduct(pIdx, p => { p.highlights[specName] = e.target.value; })}
                                                                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 bg-white outline-none focus:border-violet-500"
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Description */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <Label>Product Description</Label>
                                                                <button
                                                                    onClick={() => handleAIGenerate(pIdx)}
                                                                    disabled={generatingAIFor === pIdx || !catalogInfo.catalogName || !catalogInfo.category}
                                                                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors disabled:opacity-50"
                                                                >
                                                                    <Sparkles size={12} />
                                                                    {generatingAIFor === pIdx ? 'Writing…' : 'AI Write'}
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                placeholder="Describe fabric, occasion, wash care… or use AI Write to auto-generate."
                                                                rows={4}
                                                                value={prod.description || ''}
                                                                onChange={e => updateProduct(pIdx, p => { p.description = e.target.value; })}
                                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-violet-500 resize-none leading-relaxed"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}

                            {/* Add Variant */}
                            <div className="px-3 pb-2">
                                <button
                                    onClick={addProductVariant}
                                    className="w-full border-2 border-dashed border-violet-200 rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-violet-50 transition-all"
                                >
                                    <div className="bg-violet-600 text-white p-1 rounded-full">
                                        <Plus size={14} />
                                    </div>
                                    <span className="text-sm font-semibold text-violet-700">Add Another Color / Style</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── FOOTER CTA ── */}
            <div className="fixed lg:static bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 max-w-md lg:!max-w-[1000px] mx-auto shadow-lg lg:p-0 lg:bg-transparent lg:border-0 lg:shadow-none lg:mt-6 lg:mb-12 lg:z-auto">
                <button
                    onClick={() => {
                        if (!validateStep()) return;
                        if (step < 2) return setStep(s => s + 1);
                        if (isEditMode) return setShowConfirmModal(true);
                        handleSubmit();
                    }}
                    disabled={!!submitLoading}
                    className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-100 transition-all"
                >
                    {submitLoading
                        ? 'Submitting…'
                        : step === 2
                            ? (isEditMode ? 'Re-submit for Review' : '🚀 Go Live Now')
                            : 'Save & Continue'}
                    {!submitLoading && step < 2 && <ArrowRight size={16} />}
                </button>
            </div>

            {/* ── CATEGORY MODAL ── */}
            <AnimatePresence>
                {showCatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCatModal(false)}
                        className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-t-3xl lg:rounded-3xl max-h-[85vh] lg:max-h-[75vh] flex flex-col w-full max-w-md lg:!max-w-[600px] shadow-2xl overflow-hidden"
                        >
                            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto my-3 lg:hidden" />

                            {/* Modal Header */}
                            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                                {catLevel > 0 && (
                                    <button onClick={() => { setCatLevel(l => l - 1); setCatSearch(''); }} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                                        <ArrowLeft size={16} className="text-gray-700" />
                                    </button>
                                )}
                                <div className="flex-1">
                                    <h2 className="text-base font-bold text-gray-900">
                                        {catLevel === 0 ? 'Select Category' : catLevel === 1 ? `Types under ${selectedMain?.name}` : `Styles under ${selectedSub?.name}`}
                                    </h2>
                                    {catLevel > 0 && <p className="text-xs text-gray-400">{catLevel === 1 ? selectedMain?.name : selectedSub?.name}</p>}
                                </div>
                                {catLevel > 0 && selectedMain && (
                                    <button onClick={() => { setCatalogInfo(p => ({ ...p, category: selectedMain?.name || '', subCategory: selectedSub?.name || '' })); setShowCatModal(false); setCatLevel(0); setCatSearch(''); }}
                                        className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                                        <CheckCircle2 size={13} /> Done
                                    </button>
                                )}
                                <button onClick={() => setShowCatModal(false)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="px-4 py-3">
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                                    <Search size={15} className="text-gray-400" />
                                    <input
                                        value={catSearch}
                                        onChange={e => setCatSearch(e.target.value)}
                                        placeholder="Search category…"
                                        className="bg-transparent text-sm font-medium text-gray-800 outline-none flex-1 placeholder-gray-400"
                                    />
                                    {catSearch && <button onClick={() => setCatSearch('')}><X size={14} className="text-gray-400" /></button>}
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
                                {catLoading ? (
                                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>
                                ) : filteredCats.length === 0 ? (
                                    <div className="py-10 text-center text-gray-400 text-sm">No categories found</div>
                                ) : filteredCats.map(cat => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategorySelect(cat)}
                                        className="w-full flex items-center gap-4 bg-white border-2 border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 rounded-2xl p-3 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                                            <p className="text-xs text-gray-400">{cat.subCount > 0 ? `${cat.subCount} sub-categories` : 'Tap to select'}</p>
                                        </div>
                                        {cat.subCount > 0 ? <ChevronRight size={16} className="text-violet-500 shrink-0" /> : <Check size={16} className="text-emerald-500 shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── EDIT CONFIRM MODAL ── */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="bg-white rounded-t-3xl lg:rounded-3xl w-full max-w-md lg:!max-w-[500px] p-6 shadow-2xl">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={22} className="text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Re-submit for Review?</h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
                                Your catalog will be marked as <span className="font-bold text-amber-600">Pending</span> and hidden from customers until our team approves it again.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 text-sm hover:bg-gray-50 transition-colors">
                                    Go Back
                                </button>
                                <button onClick={handleEditSubmit} disabled={!!submitLoading} className="flex-1 py-3 bg-violet-600 rounded-xl font-bold text-white text-sm shadow-md disabled:opacity-60 hover:bg-violet-700 transition-colors">
                                    {submitLoading ? 'Submitting…' : 'Yes, Submit'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupplierCatalogUpload;