import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Camera, Plus, Trash2, 
    ChevronRight, ChevronDown, Info, AlertCircle, 
    Check, ArrowRight, Settings, Image as ImageIcon,
    Sparkles, Layout, Database, Truck,
    X, CheckCircle2, Search, ArrowLeft
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "sonner";
import { get_wear_categories } from '../../store/reducers/wearCategoryReducer';
import { add_catalog, edit_catalog, get_catalog_for_edit, messageClear } from '../../store/reducers/vendorReducer';
import apiClient from '../../api/apiClient';

const SupplierCatalogUpload = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { categories } = useSelector(state => state.wearCategory);

    // EDIT MODE: detect if navigated with a catalogId to edit
    const editCatalogId = location.state?.editCatalogId || null;
    const isEditMode = !!editCatalogId;
    const [editCatalogData, setEditCatalogData] = useState(null);
    const [fetchLoading, setFetchLoading] = useState(false);
    const { supplierData, loader: submitLoading, successMessage, errorMessage } = useSelector(state => state.vendor);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [generatingAIFor, setGeneratingAIFor] = useState(null);
    const [advisingPrice, setAdvisingPrice] = useState({});
    const [generatingTags, setGeneratingTags] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // FORM STATE (Matching Android Deep Logic)
    const [catalogInfo, setCatalogInfo] = useState({
        productName: '',
        category: '',
        subCategory: '',
        leafCategory: '',
        description: '',
        tags: '',
        hsnCode: '',
        gstPercentage: '5',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        highlights: {} // To store category specs answers
    });
    const [errors, setErrors] = useState({});
    const [selectedSpecs, setSelectedSpecs] = useState([]);
    const [specModes, setSpecModes] = useState({}); // Tracking 'select' vs 'type' mode for each spec

    const initialProductId = Date.now();
    const [products, setProducts] = useState([
        {
            id: initialProductId,
            color: '',
            isPrimary: true,
            images: [],
            primaryImageIndex: 0,
            variants: [{ size: 'Free Size', listingPrice: '', mrp: '', stock: '', skuId: '', priceTiers: [] }],
            highlights: {},
            description: ''
        }
    ]);
    const [expandedVariantId, setExpandedVariantId] = useState(initialProductId);

    // CATEGORY MODAL STATES
    const [showCatModal, setShowCatModal] = useState(false);
    const [modalCategories, setModalCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(false);
    const [catLevel, setCatLevel] = useState(0); 
    const [selectedMain, setSelectedMain] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);

    useEffect(() => {
        const fetchPureCategories = async () => {
            if (showCatModal) {
                setCatLoading(true);
                try {
                    const params = {};
                    if (catLevel === 0) params.level = 0;
                    else if (catLevel === 1 && selectedMain) params.parentId = selectedMain._id;
                    else if (catLevel === 2 && selectedSub) params.parentId = selectedSub._id;
                    
                    const { data } = await apiClient.get('/wear/category/get-pure', { params });
                    setModalCategories(data.categories || []);
                } catch (error) {
                    console.error("Fetch Categories Error:", error);
                    toast.error("Failed to load categories");
                } finally {
                    setCatLoading(false);
                }
            }
        };
        fetchPureCategories();
    }, [catLevel, selectedMain, selectedSub, showCatModal]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/supplier-inventory');
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate]);

    // PRE-FILL FORM IN EDIT MODE — fetch fresh data from API
    useEffect(() => {
        if (!editCatalogId) return;
        const fetchAndPrefill = async () => {
            setFetchLoading(true);
            try {
                const result = await dispatch(get_catalog_for_edit(editCatalogId)).unwrap();
                const catalog = result.catalog;
                setEditCatalogData(catalog);

                // Map catalogInfo fields
                setCatalogInfo({
                    productName: catalog.productName || '',
                    category: catalog.category || '',
                    subCategory: catalog.subCategory || '',
                    leafCategory: catalog.leafCategory || '',
                    description: catalog.description || '',
                    tags: catalog.tags || '',
                    hsnCode: catalog.hsnCode || '',
                    gstPercentage: String(catalog.gstPercentage || '5'),
                    weight: String(catalog.weight || ''),
                    dimensions: catalog.dimensions || { length: '', width: '', height: '' },
                    highlights: {}
                });

                // Map each similarProduct → product variant card
                const allProds = catalog.similarProducts?.length > 0 ? catalog.similarProducts : [catalog];
                const editProducts = allProds.map((prod, i) => ({
                    id: prod._id || (Date.now() + i),
                    _id: prod._id,
                    color: prod.variants?.[0]?.color || '',
                    isPrimary: prod.isPrimary || i === 0,
                    images: prod.images || [],
                    primaryImageIndex: 0,
                    variants: (prod.variants || []).map(v => ({
                        size: v.size || '',
                        listingPrice: String(v.listingPrice || ''),
                        mrp: String(v.mrp || ''),
                        stock: String(v.stock || ''),
                        skuId: v.skuId || '',
                        priceTiers: (v.priceTiers || []).map(t => ({ minQty: String(t.minQty || ''), price: String(t.price || '') }))
                    })),
                    highlights: prod.additionalDetails || {},
                    description: prod.description || ''
                }));
                setProducts(editProducts);
                setExpandedVariantId(editProducts[0]?.id);
            } catch (err) {
                toast.error('Failed to load catalog for editing');
                navigate('/supplier-inventory');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchAndPrefill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // --- LOGIC FUNCTIONS ---

    const handleAIGenerate = async (pIdx) => {
        const prod = products[pIdx];
        if (!catalogInfo.productName || !catalogInfo.category) {
            return toast.error("Please enter Product Name and Category first");
        }
        setGeneratingAIFor(pIdx);
        try {
            // Build a specs context string from this variant's highlights
            const specsContext = Object.entries(prod.highlights || {})
                .filter(([, v]) => v)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
            const { data } = await apiClient.post('/wear/dashboard/supplier/ai-recommend', {
                productName: `${catalogInfo.productName}${prod.color ? ` (${prod.color})` : ''}`,
                category: catalogInfo.category,
                existingDescription: prod.description || '',
                specs: specsContext || 'Standard quality product features'
            });
            if (data.description) {
                const n = [...products];
                n[pIdx].description = data.description;
                setProducts(n);
                toast.success('AI wrote the description!');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'AI generation failed');
        }
        setGeneratingAIFor(null);
    };

    const handleAITagsGenerate = async () => {
        if (!catalogInfo.productName || catalogInfo.productName.length < 5) return;
        
        try {
            const { data } = await apiClient.post('/wear/dashboard/supplier/ai-seo-tags', {
                productName: catalogInfo.productName
            });
            if (data.tags) {
                setCatalogInfo(prev => ({...prev, tags: data.tags}));
            }
        } catch (error) {
            console.error("Silent tag generation failed");
        }
    };

    // Automatic SEO Tag Generation on Name Change (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (catalogInfo.productName) {
                handleAITagsGenerate();
            }
        }, 1200);
        return () => clearTimeout(timer);
    }, [catalogInfo.productName]);

    const handleAIPriceAdvice = async (pIdx, vIdx) => {
        if (!catalogInfo.productName || !catalogInfo.category) {
            return toast.error("Product Name & Category needed for accurate price advice");
        }
        setAdvisingPrice({ pIdx, vIdx });
        try {
            const variant = products[pIdx].variants[vIdx];
            const { data } = await apiClient.post('/wear/dashboard/supplier/ai-advise-price', {
                productName: catalogInfo.productName,
                category: catalogInfo.category,
                costPrice: variant.mrp // Assuming MRP acts as a baseline, or just send without it
            });
            if (data.suggestedPrice) {
                const n = [...products];
                n[pIdx].variants[vIdx].listingPrice = data.suggestedPrice;
                setProducts(n);
                toast.success(`AI suggested ₹${data.suggestedPrice}: ${data.reason}`, { duration: 4000 });
            }
        } catch (error) {
            toast.error("Failed to get price advice");
        }
        setAdvisingPrice(null);
    };

    const [observingAI, setObservingAI] = useState(null);

    const handleAIObserveImage = async (pIdx) => {
        const product = products[pIdx];
        if (product.images.length === 0) {
            return toast.error("Please upload at least one image first");
        }

        setObservingAI(pIdx);
        const toastId = toast.loading("AI is observing your product...");

        try {
            // We send the primary image for observation
            const primaryImg = product.images[product.primaryImageIndex || 0];
            const { data } = await apiClient.post('/wear/dashboard/supplier/ai-observe-image', {
                image: primaryImg,
                category: catalogInfo.category
            });

            if (data.analysis) {
                const n = [...products];
                const analysis = data.analysis;

                // Auto-fill color if found
                if (analysis.color && !n[pIdx].color) {
                    n[pIdx].color = analysis.color;
                }

                // Auto-fill specs (Fabric, Fit, etc)
                if (analysis.specs) {
                    n[pIdx].highlights = { ...n[pIdx].highlights, ...analysis.specs };
                }

                setProducts(n);
                toast.success("AI auto-filled product details from the image!", { id: toastId });
            }
        } catch (error) {
            console.error("AI Observation Error:", error);
            toast.error("AI couldn't analyze the image", { id: toastId });
        } finally {
            setObservingAI(null);
        }
    };

    const handleCategorySelect = (item) => {
        // If the item has no children, finalize immediately regardless of current level
        if (item.subCount === 0) {
            setCatalogInfo(prev => ({
                ...prev,
                category: catLevel === 0 ? item.name : (selectedMain?.name || ''),
                subCategory: catLevel === 0 ? '' : (catLevel === 1 ? item.name : (selectedSub?.name || '')),
                leafCategory: catLevel === 2 ? item.name : (catLevel === 1 ? item.name : '')
            }));
            
            // Smarter mapping for 3-level depth if they didn't go all the way
            if (catLevel === 0) {
                setCatalogInfo(prev => ({ ...prev, category: item.name, subCategory: item.name, leafCategory: item.name }));
            } else if (catLevel === 1) {
                setCatalogInfo(prev => ({ ...prev, subCategory: item.name, leafCategory: item.name }));
            }

            // Store specs from category (Handling Object-based specs)
            if (item.additionalDetails && Array.isArray(item.additionalDetails)) {
                setSelectedSpecs(item.additionalDetails);
                const initialHighlights = {};
                item.additionalDetails.forEach(spec => {
                    const specName = typeof spec === 'object' ? spec.name : spec;
                    initialHighlights[specName] = '';
                });
                
                // Also update all existing products to have these empty highlight fields
                setProducts(prevProds => prevProds.map(p => ({
                    ...p,
                    highlights: { ...initialHighlights, ...p.highlights } // Merge with existing if any
                })));
            }

            setShowCatModal(false);
            setCatLevel(0);
            return;
        }

        if (catLevel === 0) {
            setSelectedMain(item);
            setCatalogInfo(prev => ({
                ...prev,
                category: item.name,
                subCategory: '',
                leafCategory: ''
            }));
            setCatLevel(1);
        } else if (catLevel === 1) {
            setSelectedSub(item);
            setCatalogInfo(prev => ({
                ...prev,
                subCategory: item.name,
                leafCategory: ''
            }));
            setCatLevel(2);
        } else {
            setCatalogInfo(prev => ({
                ...prev,
                leafCategory: item.name
            }));
            setShowCatModal(false);
            setCatLevel(0);
        }
    };

    const addProductColor = () => {
        const primary = products[0];
        const newId = Date.now();
        setProducts([...products, {
            id: newId,
            color: '',
            isPrimary: false,
            images: [],
            primaryImageIndex: 0,
            variants: primary.variants.map(v => ({ ...v, stock: '', skuId: generateSKU(), priceTiers: [] })),
            highlights: { ...primary.highlights },
            description: ''
        }]);
        setExpandedVariantId(newId);
    };

    const generateSKU = () => {
        const shop = supplierData?.businessDetails?.shopName?.substring(0, 3).toUpperCase() || 'JEE';
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `JEEN-${shop}-${rand}`;
    };

    useEffect(() => {
        if (supplierData && products[0].variants[0].skuId === '') {
            const newProds = [...products];
            newProds[0].variants[0].skuId = generateSKU();
            setProducts(newProds);
        }
    }, [supplierData]);

    const handleImageUpload = (pIdx, e) => {
        const files = Array.from(e.target.files);
        if (files.length + products[pIdx].images.length > 12) {
            return toast.error("Max 12 images allowed");
        }
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newProds = [...products];
                newProds[pIdx].images.push(reader.result);
                setProducts(newProds);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = () => {
        if (!catalogInfo.productName || !catalogInfo.category) return toast.error("Catalog basic info required");
        
        const payload = products.map(prod => ({
            productName: products.length > 1 ? `${catalogInfo.productName} (${prod.color})` : catalogInfo.productName,
            description: (prod.description || catalogInfo.description) + (catalogInfo.tags ? `\n\nSearch Keywords: ${catalogInfo.tags}` : ''),
            category: catalogInfo.category,
            subCategory: catalogInfo.subCategory,
            images: prod.images,
            isPrimary: prod.isPrimary,
            hsnCode: catalogInfo.hsnCode,
            gstPercentage: parseInt(catalogInfo.gstPercentage),
            weight: parseInt(catalogInfo.weight) || 0,
            price: parseFloat(prod.variants[0].listingPrice) || 0,
            originalPrice: parseFloat(prod.variants[0].mrp) || 0,
            additionalDetails: prod.highlights, // Sending per-product specs
            variants: prod.variants.map(v => ({
                ...v,
                color: prod.color,
                listingPrice: parseFloat(v.listingPrice),
                mrp: parseFloat(v.mrp),
                stock: parseInt(v.stock),
                priceTiers: (v.priceTiers || []).map(t => ({
                    minQty: parseInt(t.minQty),
                    price: parseFloat(t.price)
                })).filter(t => !isNaN(t.minQty) && !isNaN(t.price))
            }))
        }));

        dispatch(add_catalog(payload));
    };

    // EDIT MODE SUBMIT
    const handleEditSubmit = () => {
        if (!catalogInfo.productName || !catalogInfo.category) return toast.error('Catalog basic info required');
        const payload = products.map(prod => ({
            _id: prod._id,
            color: prod.color,
            images: prod.images,
            isPrimary: prod.isPrimary,
            description: prod.description || '',
            highlights: prod.highlights,
            additionalDetails: prod.highlights,
            variants: prod.variants.map(v => ({
                ...v,
                color: prod.color,
                listingPrice: parseFloat(v.listingPrice),
                mrp: parseFloat(v.mrp),
                stock: parseInt(v.stock),
                priceTiers: (v.priceTiers || []).map(t => ({
                    minQty: parseInt(t.minQty),
                    price: parseFloat(t.price)
                })).filter(t => !isNaN(t.minQty) && !isNaN(t.price))
            }))
        }));
        dispatch(edit_catalog({
            catalogId: editCatalogId,
            products: payload,
            catalogInfo
        }));
        setShowConfirmModal(false);
    };

    const validateStep = () => {
        const newErrors = {};
        if (step === 1) {
            if (!catalogInfo.productName || catalogInfo.productName.trim().length < 3) {
                toast.error("Please enter a valid catalog name (min 3 chars)");
                newErrors.productName = true;
            }
            if (!catalogInfo.category) {
                toast.error("Please select a target category");
                newErrors.category = true;
            }
        }
        
        if (step === 2) {
            for (let i = 0; i < products.length; i++) {
                const p = products[i];
                const variantLabel = products.length > 1 ? (p.color || `Variant ${i+1}`) : "Product";
                
                if (p.images.length === 0) {
                    toast.error(`Please upload at least one image for ${variantLabel}`);
                    newErrors[`prod_images_${p.id}`] = true;
                    setExpandedVariantId(p.id);
                    setErrors(newErrors);
                    return false;
                }
                
                if (products.length > 1 && (!p.color || p.color.trim() === '')) {
                    toast.error(`Please enter color/variant name for variant ${i+1}`);
                    newErrors[`prod_color_${p.id}`] = true;
                    setExpandedVariantId(p.id);
                    setErrors(newErrors);
                    return false;
                }

                for (let j = 0; j < p.variants.length; j++) {
                    const v = p.variants[j];
                    const vKey = `${p.id}_${j}`;
                    if (!v.size || v.size.trim() === '') {
                        toast.error(`Please enter size for ${variantLabel}`);
                        newErrors[`v_size_${vKey}`] = true;
                        setExpandedVariantId(p.id);
                        setErrors(newErrors);
                        return false;
                    }
                    if (!v.mrp || isNaN(v.mrp) || parseFloat(v.mrp) <= 0) {
                        toast.error(`Invalid MRP for ${variantLabel} (Size: ${v.size})`);
                        newErrors[`v_mrp_${vKey}`] = true;
                        setExpandedVariantId(p.id);
                        setErrors(newErrors);
                        return false;
                    }
                    if (!v.listingPrice || isNaN(v.listingPrice) || parseFloat(v.listingPrice) <= 0) {
                        toast.error(`Invalid Selling Price for ${variantLabel} (Size: ${v.size})`);
                        newErrors[`v_listingPrice_${vKey}`] = true;
                        setExpandedVariantId(p.id);
                        setErrors(newErrors);
                        return false;
                    }
                    if (parseFloat(v.listingPrice) > parseFloat(v.mrp)) {
                        toast.error(`Selling price cannot be more than MRP for ${variantLabel}`);
                        newErrors[`v_listingPrice_${vKey}`] = true;
                        setExpandedVariantId(p.id);
                        setErrors(newErrors);
                        return false;
                    }
                    if (v.stock === '' || isNaN(v.stock) || parseInt(v.stock) < 0) {
                        toast.error(`Please enter valid stock for ${variantLabel} (Size: ${v.size})`);
                        newErrors[`v_stock_${vKey}`] = true;
                        setExpandedVariantId(p.id);
                        setErrors(newErrors);
                        return false;
                    }
                }
            }
        }

        if (step === 3) {
            if (!catalogInfo.weight || isNaN(catalogInfo.weight) || parseFloat(catalogInfo.weight) <= 0) {
                toast.error("Please enter valid product weight in grams");
                newErrors.weight = true;
            }
            if (!catalogInfo.gstPercentage) {
                toast.error("Please select GST percentage");
                newErrors.gstPercentage = true;
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // --- UI COMPONENTS ---

    const renderStepper = () => (
        <div className="flex bg-white border-b border-gray-100 sticky top-[60px] z-40 cursor-pointer">
            {[
                { id: 1, label: 'Catalog Info', icon: <Layout size={16} /> },
                { id: 2, label: 'Add Products', icon: <Database size={16} /> },
                { id: 3, label: 'Logistics', icon: <Truck size={16} /> }
            ].map((s) => (
                <div 
                    key={s.id} 
                    onClick={() => {
                        // Allow clicking back or clicking the next step only if current is valid
                        if (s.id < step) {
                            setStep(s.id);
                        } else if (s.id === step + 1) {
                            if (validateStep()) setStep(s.id);
                        }
                    }}
                    className="flex-1 flex flex-col items-center py-2 relative"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step === s.id ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : step > s.id ? 'bg-green-100 text-green-600' : 'bg-transparent text-gray-400'}`}>
                        {step > s.id ? <Check size={16} /> : s.icon}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-tight ${step === s.id ? 'text-[#7C3AED]' : step > s.id ? 'text-green-600' : 'text-gray-400'}`}>
                        {s.label}
                    </span>
                    {step === s.id && <div className="absolute bottom-0 w-full h-[2px] bg-[#7C3AED]" />}
                </div>
            ))}
        </div>
    );

    return (
        <>
        {/* FETCH LOADING SKELETON */}
        {fetchLoading && (
            <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-bold text-sm">Loading catalog data...</p>
            </div>
        )}
        <>
            {/* HEADER */}
            <div className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 max-w-md mx-auto border-x">
                <div className="flex items-center">
                    <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/supplier-inventory')} className="mr-4">
                        <ChevronLeft size={26} color="black" />
                    </button>
                    <span className="text-base font-black text-gray-800">{isEditMode ? 'Edit Catalog' : 'Add Catalog'}</span>
                </div>
                <button className="text-[#7C3AED] font-bold text-sm">Help?</button>
            </div>

            <div className="h-[60px] shrink-0 w-full" /> {/* Spacer for fixed header */}

            {renderStepper()}

            <div className="flex-1 pt-4 pb-24 overflow-y-auto overflow-x-hidden">
                <AnimatePresence mode="wait">
                    {/* STEP 1: CATALOG INFO */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 space-y-6">
                            <div className="flex items-center text-gray-900 font-black text-[16px] mb-2">
                                <ImageIcon size={20} className="text-[#7C3AED] mr-2" />
                                Basic Information
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">Catalog Name*</label>
                                    <div className="relative">
                                        <input 
                                            placeholder="e.g. Trendy Cotton Kurta Set"
                                            value={catalogInfo.productName}
                                            onChange={(e) => {
                                                setCatalogInfo({...catalogInfo, productName: e.target.value});
                                                if (errors.productName) setErrors({...errors, productName: false});
                                            }}
                                            className={`w-full bg-gray-50 border rounded-xl p-4 pr-24 font-bold text-gray-800 focus:bg-white focus:border-[#7C3AED] transition-all outline-none ${errors.productName ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-300 shadow-sm'}`}
                                        />
                                    </div>
                                    {catalogInfo.tags && (
                                        <p className="mt-2 text-[10px] font-bold text-gray-500 bg-gray-50 p-2 rounded-lg">
                                            Tags: <span className="text-[#7C3AED]">{catalogInfo.tags}</span>
                                        </p>
                                    )}
                                </div>

                                <div onClick={() => setShowCatModal(true)} className="cursor-pointer">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">Category Selection*</label>
                                    <div className={`bg-gray-50 border rounded-xl p-4 flex justify-between items-center group ${errors.category ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-300 shadow-sm'}`}>
                                        <span className={`font-bold ${catalogInfo.category ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                            {catalogInfo.category ? (
                                                <span className="flex items-center gap-1">
                                                    {[...new Set([catalogInfo.category, catalogInfo.subCategory, catalogInfo.leafCategory].filter(Boolean))].map((name, idx, arr) => (
                                                        <React.Fragment key={idx}>
                                                            <span className={idx === arr.length - 1 ? "text-[#7C3AED]" : ""}>{name}</span>
                                                            {idx < arr.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
                                                        </React.Fragment>
                                                    ))}
                                                </span>
                                            ) : 'Select target category'}
                                        </span>
                                        <ChevronRight size={18} className="text-[#7C3AED]" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-2xl flex gap-3 border border-purple-100/50">
                                <Sparkles size={18} className="text-[#7C3AED] shrink-0" />
                                <p className="text-[#7C3AED] text-[11px] font-medium leading-relaxed">
                                    Use a SEO friendly name to get 3x more orders. Avoid simple names like "My Product".
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: PRODUCTS & VARIATIONS */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            {products.map((prod, pIdx) => {
                                const isExpanded = expandedVariantId === prod.id;
                                const bgColors = ['bg-blue-50/50 border-blue-100', 'bg-rose-50/50 border-rose-100', 'bg-emerald-50/50 border-emerald-100', 'bg-amber-50/50 border-amber-100', 'bg-purple-50/50 border-purple-100', 'bg-sky-50/50 border-sky-100'];
                                const headerColors = ['text-blue-800', 'text-rose-800', 'text-emerald-800', 'text-amber-800', 'text-purple-800', 'text-sky-800'];
                                const badgeBg = ['bg-blue-200 text-blue-800', 'bg-rose-200 text-rose-800', 'bg-emerald-200 text-emerald-800', 'bg-amber-200 text-amber-800', 'bg-purple-200 text-purple-800', 'bg-sky-200 text-sky-800'];

                                const currentBg = bgColors[pIdx % bgColors.length];
                                const currentHeader = headerColors[pIdx % headerColors.length];
                                const currentBadge = badgeBg[pIdx % badgeBg.length];

                                return (
                                <div key={prod.id} className={`border-2 ${currentBg} rounded-2xl overflow-hidden shadow-sm transition-all duration-300`}>
                                    {/* ACCORDION HEADER */}
                                    <div 
                                        onClick={() => setExpandedVariantId(isExpanded ? null : prod.id)}
                                        className={`flex justify-between items-center p-4 cursor-pointer hover:bg-white/40 transition-colors ${isExpanded ? 'border-b border-black/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm ${currentBadge}`}>
                                                {pIdx + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-black text-[15px] ${currentHeader} leading-tight`}>
                                                    {prod.color ? prod.color : `Variant ${pIdx + 1}`}
                                                </span>
                                                {!isExpanded && (
                                                    <span className="text-[10px] font-bold text-gray-500 mt-1">
                                                        {prod.images.length} Image(s) • {prod.variants.length} Size(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {products.length > 1 && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const n = products.filter((_, i) => i !== pIdx);
                                                        setProducts(n);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <div className={`w-8 h-8 flex items-center justify-center text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACCORDION BODY */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-white/60 backdrop-blur-sm"
                                            >
                                                <div className="p-5 space-y-6">
                                                    {/* IMAGE GRID */}
                                    <div>
                                        <div className="mb-4">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">Variant Name / Color*</label>
                                            <input 
                                                placeholder="e.g. Royal Blue, Full Sleeve"
                                                value={prod.color}
                                                onChange={(e) => {
                                                    const n = [...products];
                                                    n[pIdx].color = e.target.value;
                                                    setProducts(n);
                                                    if (errors[`prod_color_${prod.id}`]) {
                                                        const newErrors = { ...errors };
                                                        delete newErrors[`prod_color_${prod.id}`];
                                                        setErrors(newErrors);
                                                    }
                                                }}
                                                className={`w-full bg-white border rounded-xl p-3 font-bold text-sm outline-none focus:border-[#7C3AED] ${errors[`prod_color_${prod.id}`] ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-300 shadow-sm'}`}
                                            />
                                        </div>

                                        <div className={`grid grid-cols-4 gap-3 p-2 rounded-2xl transition-all ${errors[`prod_images_${prod.id}`] ? 'bg-red-50 ring-2 ring-red-200' : ''}`}>
                                            {prod.images.map((img, iIdx) => (
                                                <div key={iIdx} className={`aspect-[3/4] rounded-xl bg-gray-50 relative group overflow-hidden border-2 transition-all ${prod.primaryImageIndex === iIdx ? 'border-[#7C3AED] shadow-lg shadow-[#7C3AED]/10' : 'border-transparent'}`}>
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    
                                                    {/* PRIMARY INDICATOR/SELECTOR */}
                                                    <button 
                                                        onClick={() => {
                                                            const n = [...products];
                                                            n[pIdx].primaryImageIndex = iIdx;
                                                            setProducts(n);
                                                        }}
                                                        className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter shadow-md transition-all ${prod.primaryImageIndex === iIdx ? 'bg-[#7C3AED] text-white' : 'bg-white/90 text-gray-500 hover:bg-white'}`}
                                                    >
                                                        {prod.primaryImageIndex === iIdx ? 'PRIMARY' : 'SET MAIN'}
                                                    </button>

                                                    {/* REMOVE BUTTON - ALWAYS ACCESSIBLE */}
                                                    <button 
                                                        onClick={() => {
                                                            const n = [...products];
                                                            n[pIdx].images.splice(iIdx, 1);
                                                            // Adjust primary index if needed
                                                            if (n[pIdx].primaryImageIndex === iIdx) n[pIdx].primaryImageIndex = 0;
                                                            else if (n[pIdx].primaryImageIndex > iIdx) n[pIdx].primaryImageIndex -= 1;
                                                            setProducts(n);
                                                        }}
                                                        className="absolute top-1.5 right-1.5 bg-rose-500/90 text-white p-1.5 rounded-lg shadow-lg hover:bg-rose-600 transition-colors"
                                                    >
                                                        <X size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ))}
                                            {prod.images.length < 12 && (
                                                <label className="aspect-[3/4] border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#7C3AED] hover:bg-purple-50 transition-all group">
                                                    <Camera size={24} className="text-gray-300 group-hover:text-[#7C3AED] transition-colors" />
                                                    <span className="text-[10px] font-black text-gray-400 mt-2 group-hover:text-[#7C3AED]">ADD PHOTO</span>
                                                    <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(pIdx, e)} className="hidden" />
                                                </label>
                                            )}
                                        </div>
                                    </div>


                                    {/* VARIANTS (SIZE & PRICE) */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Size Variations</span>
                                            <button 
                                                onClick={() => {
                                                    const n = [...products];
                                                    n[pIdx].variants.push({ size: '', listingPrice: '', mrp: '', stock: '', skuId: generateSKU(), priceTiers: [] });
                                                    setProducts(n);
                                                }}
                                                className="flex items-center text-[#7C3AED] font-black text-[10px] uppercase gap-1"
                                            >
                                                <Plus size={12} /> Add More
                                            </button>
                                        </div>

                                        {/* QUICK SIZE SELECTOR */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((sz) => {
                                                const exists = prod.variants.some(v => v.size.toUpperCase() === sz.toUpperCase());
                                                return (
                                                    <button 
                                                        key={sz}
                                                        onClick={() => {
                                                            if (exists) return;
                                                            const n = [...products];
                                                            // If first variant is empty/default and matches standard size logic...
                                                            if (n[pIdx].variants.length === 1 && !n[pIdx].variants[0].size) {
                                                                n[pIdx].variants[0].size = sz;
                                                            } else {
                                                                n[pIdx].variants.push({ 
                                                                    size: sz, 
                                                                    listingPrice: n[pIdx].variants[0].listingPrice, 
                                                                    mrp: n[pIdx].variants[0].mrp, 
                                                                    stock: '', 
                                                                    skuId: generateSKU(),
                                                                    priceTiers: [] 
                                                                });
                                                            }
                                                            setProducts(n);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${exists ? 'bg-[#7C3AED] text-white border-[#7C3AED]' : 'bg-white text-gray-400 border-gray-100 hover:border-[#7C3AED] hover:text-[#7C3AED]'}`}
                                                    >
                                                        {sz}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {prod.variants.map((v, vIdx) => (
                                            <div key={vIdx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="grid grid-cols-3 gap-3 mb-3">
                                                    <div className="col-span-1">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Size</label>
                                                        <input 
                                                            placeholder="S, M, L..."
                                                            value={v.size}
                                                            onChange={(e) => {
                                                                const n = [...products];
                                                                n[pIdx].variants[vIdx].size = e.target.value;
                                                                setProducts(n);
                                                            }}
                                                            className={`w-full bg-gray-50 border rounded-lg p-2 font-black text-center outline-none ${errors[`v_size_${prod.id}_${vIdx}`] ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-300'}`}
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">MRP (₹)</label>
                                                        <input 
                                                            type="number"
                                                            placeholder="999"
                                                            value={v.mrp}
                                                            onChange={(e) => {
                                                                const n = [...products];
                                                                n[pIdx].variants[vIdx].mrp = e.target.value;
                                                                setProducts(n);
                                                            }}
                                                            className={`w-full bg-gray-50 border rounded-lg p-2 font-black text-center outline-none ${errors[`v_mrp_${prod.id}_${vIdx}`] ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-300'}`}
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Selling (₹)</label>
                                                        <input 
                                                            type="number"
                                                            placeholder="499"
                                                            value={v.listingPrice}
                                                            onChange={(e) => {
                                                                const n = [...products];
                                                                n[pIdx].variants[vIdx].listingPrice = e.target.value;
                                                                setProducts(n);
                                                            }}
                                                            className={`w-full bg-green-50/30 border rounded-lg p-2 font-black text-center text-green-700 outline-none ${errors[`v_listingPrice_${prod.id}_${vIdx}`] ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-300'}`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* QUANTITY BASED PRICE TIERS */}
                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <Database size={12} className="text-[#7C3AED]" />
                                                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">Bulk Pricing (Optional)</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const n = [...products];
                                                                n[pIdx].variants[vIdx].priceTiers.push({ minQty: '', price: '' });
                                                                setProducts(n);
                                                            }}
                                                            className="text-[9px] font-black text-[#7C3AED] uppercase bg-[#7C3AED]/5 px-2 py-1 rounded-md"
                                                        >
                                                            + Add Tier
                                                        </button>
                                                    </div>

                                                    {v.priceTiers?.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {v.priceTiers.map((tier, tIdx) => (
                                                                <div key={tIdx} className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-xl border border-gray-50">
                                                                    <div className="flex-1 flex items-center gap-2">
                                                                        <span className="text-[9px] font-bold text-gray-400">If Qty ≥</span>
                                                                        <input 
                                                                            type="number"
                                                                            placeholder="5"
                                                                            value={tier.minQty}
                                                                            onChange={(e) => {
                                                                                const n = [...products];
                                                                                n[pIdx].variants[vIdx].priceTiers[tIdx].minQty = e.target.value;
                                                                                setProducts(n);
                                                                            }}
                                                                            className="w-12 bg-white border border-gray-200 rounded p-1 text-center font-black text-[10px] outline-none"
                                                                        />
                                                                        <span className="text-[9px] font-bold text-gray-400">Price: ₹</span>
                                                                        <input 
                                                                            type="number"
                                                                            placeholder="450"
                                                                            value={tier.price}
                                                                            onChange={(e) => {
                                                                                const n = [...products];
                                                                                n[pIdx].variants[vIdx].priceTiers[tIdx].price = e.target.value;
                                                                                setProducts(n);
                                                                            }}
                                                                            className="flex-1 bg-white border border-gray-200 rounded p-1 text-center font-black text-[10px] text-[#7C3AED] outline-none"
                                                                        />
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const n = [...products];
                                                                            n[pIdx].variants[vIdx].priceTiers.splice(tIdx, 1);
                                                                            setProducts(n);
                                                                        }}
                                                                        className="text-gray-300 hover:text-rose-400 p-1"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[9px] text-gray-400 italic">No bulk discounts added for this size.</p>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center bg-gray-50/50 p-2 mt-3 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase">Stock:</span>
                                                        <input 
                                                            type="number"
                                                            placeholder="0"
                                                            value={v.stock}
                                                            onChange={(e) => {
                                                                const n = [...products];
                                                                n[pIdx].variants[vIdx].stock = e.target.value;
                                                                setProducts(n);
                                                            }}
                                                            className={`w-16 bg-white border rounded p-1 text-center font-black text-xs outline-none ${errors[`v_stock_${prod.id}_${vIdx}`] ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-300'}`}
                                                        />
                                                    </div>
                                                    {prod.variants.length > 1 && (
                                                        <button 
                                                            onClick={() => {
                                                                const n = [...products];
                                                                n[pIdx].variants.splice(vIdx, 1);
                                                                setProducts(n);
                                                            }}
                                                            className="text-rose-400"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                        
                                        {/* PRODUCT SPECIFIC SPECS (Moved inside product div) */}
                                        {selectedSpecs.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1.5 h-3 bg-[#7C3AED]/50 rounded-full" />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Specifications</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {selectedSpecs.map((spec, sIdx) => {
                                                        const specName = typeof spec === 'object' ? spec.name : spec;
                                                        const options = spec.options || [];
                                                        const specType = spec.type || 'text';
                                                        const currentMode = specModes[specName] || (specType === 'select' && options.length > 0 ? 'select' : 'type');

                                                        return (
                                                            <div key={sIdx}>
                                                                <div className="flex justify-between items-center mb-1.5">
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">
                                                                        {specName} {spec.required ? '*' : ''}
                                                                    </label>
                                                                    {options.length > 0 && (
                                                                        <button 
                                                                            onClick={() => setSpecModes(prev => ({ ...prev, [specName]: currentMode === 'select' ? 'type' : 'select' }))}
                                                                            className="text-[9px] font-black text-[#7C3AED] hover:underline uppercase flex items-center gap-1"
                                                                        >
                                                                            {currentMode === 'select' ? <Plus size={10} /> : <Layout size={10} />}
                                                                            {currentMode === 'select' ? 'Custom' : 'List'}
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="relative">
                                                                    {currentMode === 'select' ? (
                                                                        <div className="relative">
                                                                            <select 
                                                                                value={prod.highlights[specName] || ''}
                                                                                onChange={(e) => {
                                                                                    const n = [...products];
                                                                                    n[pIdx].highlights[specName] = e.target.value;
                                                                                    setProducts(n);
                                                                                }}
                                                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pr-10 font-bold text-gray-800 appearance-none outline-none focus:border-[#7C3AED] transition-all"
                                                                            >
                                                                                <option value="">Select Option</option>
                                                                                {options.map((opt, oIdx) => (
                                                                                    <option key={oIdx} value={opt}>{opt}</option>
                                                                                ))}
                                                                            </select>
                                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                                                <ChevronDown size={16} />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <input 
                                                                            placeholder={`Enter ${specName}...`}
                                                                            value={prod.highlights[specName] || ''}
                                                                            onChange={(e) => {
                                                                                const n = [...products];
                                                                                n[pIdx].highlights[specName] = e.target.value;
                                                                                setProducts(n);
                                                                            }}
                                                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 font-bold text-gray-800 focus:bg-white focus:border-[#7C3AED] transition-all outline-none"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                                        {/* PER-VARIANT DESCRIPTION */}
                                                        <div className="pt-4 border-t border-gray-100/80">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Description</label>
                                                                <button
                                                                    onClick={() => handleAIGenerate(pIdx)}
                                                                    disabled={generatingAIFor === pIdx || !catalogInfo.productName || !catalogInfo.category}
                                                                    className="flex items-center gap-1.5 bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-colors"
                                                                >
                                                                    <Sparkles size={11} />
                                                                    {generatingAIFor === pIdx ? 'Writing...' : 'AI Write'}
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                placeholder="Describe fabric, work, occasion... or click AI Write to auto-generate from specs"
                                                                rows={4}
                                                                value={prod.description || ''}
                                                                onChange={(e) => {
                                                                    const n = [...products];
                                                                    n[pIdx].description = e.target.value;
                                                                    setProducts(n);
                                                                }}
                                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-medium text-gray-700 resize-none outline-none focus:border-[#7C3AED] transition-all text-sm leading-relaxed"
                                                            />
                                                        </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )})}

                            <div className="p-5">
                                <button 
                                    onClick={addProductColor}
                                    className="w-full border-2 border-dashed border-[#7C3AED]/30 rounded-2xl py-5 flex items-center justify-center gap-3 active:bg-[#7C3AED]/5 transition-all group"
                                >
                                    <div className="bg-[#7C3AED] text-white p-1 rounded-full">
                                        <Plus size={16} />
                                    </div>
                                    <span className="text-[#7C3AED] font-black text-sm uppercase tracking-wide">Add Another Color/Style</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: LOGISTICS */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 space-y-8">
                            <div className="flex items-center text-gray-900 font-black text-[16px] mb-2">
                                <Truck size={20} className="text-[#7C3AED] mr-2" />
                                Logistics & Compliance
                            </div>

                            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-3xl flex gap-3">
                                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-amber-800 text-[11px] leading-relaxed font-medium">
                                    HSN and weight are mandatory for generating shipping labels.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">Weight (Grams)*</label>
                                    <input 
                                        type="number"
                                        placeholder="500"
                                        value={catalogInfo.weight}
                                        onChange={(e) => setCatalogInfo({...catalogInfo, weight: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">GST Percentage*</label>
                                    <select 
                                        value={catalogInfo.gstPercentage}
                                        onChange={(e) => setCatalogInfo({...catalogInfo, gstPercentage: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold appearance-none outline-none"
                                    >
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">HSN Code*</label>
                                    <input 
                                        placeholder="e.g. 62044390"
                                        value={catalogInfo.hsnCode}
                                        onChange={(e) => setCatalogInfo({...catalogInfo, hsnCode: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold"
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase block">Product Dimensions (CM)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <input 
                                            placeholder="L"
                                            value={catalogInfo.dimensions.length}
                                            onChange={(e) => setCatalogInfo({...catalogInfo, dimensions: {...catalogInfo.dimensions, length: e.target.value}})}
                                            className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center font-bold" 
                                        />
                                        <input 
                                            placeholder="W"
                                            value={catalogInfo.dimensions.width}
                                            onChange={(e) => setCatalogInfo({...catalogInfo, dimensions: {...catalogInfo.dimensions, width: e.target.value}})}
                                            className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center font-bold" 
                                        />
                                        <input 
                                            placeholder="H"
                                            value={catalogInfo.dimensions.height}
                                            onChange={(e) => setCatalogInfo({...catalogInfo, dimensions: {...catalogInfo.dimensions, height: e.target.value}})}
                                            className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center font-bold" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CATEGORY SELECTOR MODAL (Bottom to Top with Images) */}
            <AnimatePresence>
                {showCatModal && (
                    <>
                        {/* Backdrop Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCatModal(false)}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        />
                        
                        {/* Bottom Sheet */}
                        <motion.div 
                            initial={{ y: '100%' }} 
                            animate={{ y: 0 }} 
                            exit={{ y: '100%' }} 
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-[32px] max-h-[85vh] flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden"
                        >
                            {/* Handle Bar */}
                            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3" />

                            <div className="px-5 pb-4 border-b border-gray-100 flex items-center justify-between bg-white pt-2">
                                <div className="flex items-center gap-3">
                                    {catLevel > 0 && (
                                        <button 
                                            onClick={() => setCatLevel(prev => prev - 1)}
                                            className="p-2 bg-gray-50 rounded-full text-gray-700 active:scale-90 transition-transform"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-gray-900 leading-tight">
                                            {catLevel === 0 ? 'Pick Category' 
                                             : catLevel === 1 ? `Choose Type` 
                                             : `Finalize Style`}
                                        </span>
                                        <p className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-[0.15em] mt-0.5 opacity-70">
                                            {catLevel === 0 ? 'Main Group' 
                                             : catLevel === 1 ? `Under ${selectedMain?.name}` 
                                             : `Under ${selectedSub?.name}`}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* Submit Current Selection Button - Only show if we actually pick something */}
                                    {catLevel > 0 && selectedMain && (
                                        <button 
                                            onClick={() => {
                                                setCatalogInfo(prev => ({
                                                    ...prev,
                                                    category: selectedMain?.name || '',
                                                    subCategory: selectedSub?.name || '',
                                                    leafCategory: catalogInfo.leafCategory || ''
                                                }));
                                                setShowCatModal(false);
                                                setCatLevel(0);
                                            }}
                                            className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-100 active:scale-95 transition-all"
                                        >
                                            <CheckCircle2 size={14} />
                                            Done
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowCatModal(false)}
                                        className="p-1.5 bg-gray-50 rounded-full text-gray-400"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="px-5 py-4 bg-white sticky top-0 z-10">
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3 px-4 py-3 group focus-within:border-[#7C3AED] transition-all">
                                    <Search size={16} className="text-gray-400 group-focus-within:text-[#7C3AED]" />
                                    <input placeholder="Search for anything..." className="bg-transparent border-none outline-none text-sm font-bold flex-1 text-gray-800" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-2 no-scrollbar">
                                {modalCategories.length === 0 && !catLoading && (
                                    <div className="py-10 text-center text-gray-400">No items found</div>
                                )}
                                
                                {catLoading ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    modalCategories.map((cat) => (
                                        <button 
                                            key={cat._id}
                                            onClick={() => handleCategorySelect(cat)}
                                            className="w-full h-auto p-3 mb-2 rounded-2xl border-2 border-gray-50 bg-white hover:border-purple-100 hover:bg-purple-50/20 transition-all flex items-center gap-4 group active:scale-[0.98]"
                                        >
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shadow-inner flex-shrink-0">
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <span className="font-black text-gray-800 text-[14px] block">{cat.name}</span>
                                                {catLevel > 0 && (
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                        {cat.subCount > 0 ? `${cat.subCount} types available` : 'Ready to select'}
                                                    </span>
                                                )}
                                                {catLevel === 0 && cat.subCount > 0 && (
                                                    <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-tight">
                                                        {cat.subCount} sub-categories
                                                    </span>
                                                )}
                                            </div>
                                            {/* Smart indicators based on subCount and level */}
                                            {catLevel > 0 && cat.subCount > 0 && (
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#7C3AED]">
                                                    <ChevronRight size={16} />
                                                </div>
                                            )}
                                            {(!(cat.subCount > 0) && catLevel > 0) && (
                                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                    <Check size={16} />
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* FIXED FOOTER ACTION */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 max-w-md mx-auto border-x shadow-2xl">
                <button 
                    onClick={() => {
                        if (!validateStep()) return;
                        if (step < 3) return setStep(step + 1);
                        if (isEditMode) return setShowConfirmModal(true);
                        handleSubmit();
                    }}
                    disabled={submitLoading}
                    className="w-full bg-[#7C3AED] py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
                >
                    {submitLoading ? 'SUBMITTING...' : step === 3 ? (isEditMode ? 'Re-submit for Review' : 'Live Catalog Now') : 'Save & Continue'}
                    {step < 3 && <ArrowRight size={18} />}
                </button>
            </div>

            {/* RE-SUBMIT CONFIRMATION MODAL */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-t-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} className="text-amber-600" />
                        </div>
                        <h3 className="text-[18px] font-black text-gray-900 text-center mb-2">Re-submit for Review?</h3>
                        <p className="text-gray-500 text-[13px] text-center leading-relaxed mb-6">
                            Submitting this will mark your catalog as <span className="font-black text-amber-600">Pending</span>. It won't be visible to customers until our team approves it again.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-black text-gray-600 text-sm"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                disabled={submitLoading}
                                className="flex-1 py-3 bg-[#7C3AED] rounded-xl font-black text-white text-sm shadow-lg"
                            >
                                {submitLoading ? 'Submitting...' : 'Yes, Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
        </>
    );
};

export default SupplierCatalogUpload;
