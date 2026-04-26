import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List, X, Search, Shirt } from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import ProductCard from '../../components/common/ProductCard';
import { get_wear_products } from '../../store/reducers/wearProductReducer';
import { get_wear_categories } from '../../store/reducers/wearCategoryReducer';

import apiClient from '../../api/apiClient';

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

// Sub-component moved outside to preserve scroll position on render
const CategoryHorizontalList = ({ 
    selectedCategory, 
    subCategories, 
    categories, 
    selectedSubCategory, 
    setSelectedSubCategory, 
    setSearchParams, 
    isShrunk, 
    catLoading, 
    categoryQuery,
    handleSubCategoryClick,
    handleCategoryClick,
    setSelectedCategory
}) => {
    // If a category is selected, we ONLY show subcategories. If none exist, we hide the bar.
    const displayList = selectedCategory ? (subCategories || []) : (categories || []);
    const validCategories = Array.isArray(displayList) ? displayList : [];
    
    // If still no categories loaded, show a loader or placeholder so the bar exists
    if (validCategories.length === 0 && !catLoading) {
         return null; 
    }

    // Contextual "All" logic
    const isAllSelected = (selectedCategory && !selectedSubCategory && subCategories.length > 0) || (!selectedCategory);

    return (
        <div className={`fixed top-[52px] md:top-[60px] left-0 right-0 bg-white border-b border-gray-100 z-[45] transition-all duration-300 ${isShrunk ? 'h-[50px] shadow-sm' : 'h-[105px]'}`}>
            <div className="flex items-center h-full overflow-x-auto no-scrollbar relative">
                
                {/* Sticky "ALL" Button */}
                <div 
                    onClick={() => { 
                        if (selectedCategory && subCategories.length > 0) {
                            setSelectedSubCategory(null);
                            setSearchParams(p => { 
                                p.set('category', categoryQuery);
                                p.set('subCategory', ''); 
                                p.delete('subCategory'); 
                                return p; 
                            });
                        } else {
                            setSelectedCategory(null);
                            setSelectedSubCategory(null);
                            setSearchParams(p => { p.delete('category'); p.delete('subCategory'); return p; });
                        }
                    }} 
                    className={`sticky left-0 z-[50] flex shrink-0 transition-all duration-300 cursor-pointer ${isShrunk ? 'px-4 py-2 bg-white' : 'flex-col items-center w-24 px-4 bg-white'}`}
                    style={{ 
                        backgroundColor: 'white',
                        borderColor: isAllSelected ? '#e11955' : 'transparent',
                        boxShadow: '15px 0 15px -10px rgba(0,0,0,0.08)' // Stronger shadow to hide transition
                    }}
                >
                    <div className={`flex flex-col items-center w-full h-full ${isAllSelected ? 'bg-rose-50/50' : ''} rounded-xl py-1 transition-all`}>
                        {!isShrunk && (
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1.5 transition-all ${isAllSelected ? 'bg-rose-50 border-2 border-[#e11955]' : 'bg-gray-50 border border-gray-100'}`}>
                                <LayoutGrid size={22} className={isAllSelected ? 'text-[#e11955]' : 'text-gray-400'} />
                            </div>
                        )}
                        <span className={`text-[10px] font-semibold uppercase tracking-tight self-center ${isAllSelected ? 'text-[#e11955]' : 'text-gray-400'}`}>
                            All
                        </span>
                    </div>
                </div>

                {!isShrunk && <div className="w-[1.5px] h-12 bg-gray-50 shrink-0 self-center rounded-full mr-3" />}
                
                <div className={`flex items-center space-x-6 pr-6 transition-all duration-300 ${isShrunk ? 'items-center h-full' : 'items-start pt-3'}`}>

                {/* Dynamic List (Mains or Subs) */}
                {validCategories.map((cat) => {
                    const isSelected = selectedSubCategory?._id === cat._id || (selectedCategory?._id === cat._id && !selectedSubCategory);
                    
                    return (
                        <div 
                            key={cat._id} 
                            onClick={() => {
                                if (selectedCategory && subCategories.length > 0) {
                                    handleSubCategoryClick(cat);
                                } else {
                                    handleCategoryClick(cat);
                                }
                            }} 
                            className={`flex shrink-0 transition-all duration-500 cursor-pointer relative group ${isShrunk ? 'px-5 py-2 rounded-xl border' : 'flex-col items-center w-20'}`}
                            style={{ 
                                borderColor: isSelected && isShrunk ? '#e11955' : 'transparent',
                                backgroundColor: isSelected && isShrunk ? 'rgba(225, 25, 85, 0.05)' : ''
                            }}
                        >
                            {!isShrunk && (
                                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                    {/* SOFT GLOW/LIGHT BACKGROUND FOR ACTIVE STATE */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div 
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1.1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                className="absolute inset-0 bg-rose-100/60 rounded-2xl blur-md z-0"
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Image Container - Clean fit with soft indicator */}
                                    <div className={`relative z-10 w-14 h-14 rounded-xl overflow-hidden transition-all duration-500 ${isSelected ? 'scale-105 shadow-lg shadow-primary/20' : 'group-hover:scale-105'}`}>
                                        {cat.image ? (
                                            <img 
                                                src={resolveImageUrl(cat.image)} 
                                                className="w-full h-full object-cover" 
                                                alt={cat.name}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-50 flex items-center justify-center border border-gray-100 rounded-xl">
                                                <Shirt size={20} className={isSelected ? 'text-[#e11955]' : 'text-gray-300'} />
                                            </div>
                                        )}
                                        {/* Small Glowing Dot for active state */}
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 w-2 h-2 bg-[#e11955] rounded-full shadow-[0_0_8px_rgba(225,25,85,0.8)] z-20" />
                                        )}
                                    </div>
                                </div>
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-tight truncate transition-all relative z-10 ${isShrunk ? 'max-w-none' : 'w-full text-center'} ${isSelected ? 'text-[#e11955]' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                {cat.name}
                            </span>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
};

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Selectors
    const { products, loader: loading } = useSelector(state => state.wearProduct);
    const { categories, loader: catLoading } = useSelector(state => state.wearCategory);

    // Extract Params from URL (Single Source of Truth)
    const searchTerm = searchParams.get('search') || '';
    const categoryQuery = searchParams.get('category') || '';
    const subCategoryQuery = searchParams.get('subCategory') || '';
    const minPriceQuery = searchParams.get('minPrice') || '';
    const maxPriceQuery = searchParams.get('maxPrice') || '';
    const categoriesQuery = searchParams.get('categories') || '';
    const selectedCategories = categoriesQuery ? categoriesQuery.split(',') : [];
    const sizeQueryParam = searchParams.get('size') || '';
    const colorQueryParam = searchParams.get('color') || '';

    // Local State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid'); 
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const [isShrunk, setIsShrunk] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: minPriceQuery, max: maxPriceQuery });
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(selectedCategories);

    // Scroll Listener for Shrinking Header
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsShrunk(true);
            } else {
                setIsShrunk(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initial fetch for top-level categories (Only on Mount)
    useEffect(() => {
        dispatch(get_wear_categories({ level: 0 }));
    }, [dispatch]);

    // Consolidated Product Fetch - ONLY triggered by URL or Sort changes
    useEffect(() => {
        const finalCategory = subCategoryQuery || categoryQuery;

        // Skip if everything is empty (unless we are resetting)
        if (!finalCategory && !searchTerm && !categoriesQuery && products.length === 0) return;

        const params = {
            search: searchTerm,
            sort: sortBy
        };

        if (categoriesQuery) {
            params.categories = categoriesQuery;
        } else if (finalCategory) {
            params.category = finalCategory;
        }

        if (minPriceQuery) params.lowPrice = minPriceQuery;
        if (maxPriceQuery) params.highPrice = maxPriceQuery;
        if (sizeQueryParam) params.size = sizeQueryParam;
        if (colorQueryParam) params.color = colorQueryParam;

        dispatch(get_wear_products(params));
    }, [dispatch, searchTerm, categoryQuery, subCategoryQuery, sortBy, minPriceQuery, maxPriceQuery, categoriesQuery]);

    // Sync local state with URL changes
    useEffect(() => {
        setSelectedCategoryIds(categoriesQuery ? categoriesQuery.split(',') : []);
    }, [categoriesQuery]);

    useEffect(() => {
        setPriceRange({ min: minPriceQuery, max: maxPriceQuery });
    }, [minPriceQuery, maxPriceQuery]);

    // Fetch subcategories and auto-select logic
    useEffect(() => {
        if (selectedCategory?._id) {
            setSubLoading(true);
            const fetchSub = async () => {
                try {
                    const response = await apiClient.get('/wear/category/get', { params: { parentId: selectedCategory._id } });
                    const fetchedSubs = response.data.categories || [];
                    setSubCategories(fetchedSubs);
                    
                    // Load subcategories, but DON'T auto-select index 0 anymore as per new request
                    // Default view will now be "ALL" for the parent category
                } catch (error) {
                    console.error("Subcategory fetch error", error);
                } finally {
                    setSubLoading(false);
                }
            };
            fetchSub();
        } else {
            setSubCategories([]);
        }
    }, [selectedCategory?._id]);

    // Sync state icons/ui with URL (Silent Sync)
    useEffect(() => {
        if (categories.length > 0) {
            const foundParent = categories.find(c => 
                (c.slug?.toLowerCase() === categoryQuery.toLowerCase()) || 
                (c.name?.toLowerCase() === categoryQuery.toLowerCase())
            );
            if (foundParent) {
                setSelectedCategory(foundParent);
                
                if (subCategoryQuery && subCategories.length > 0) {
                    const foundSub = subCategories.find(c => 
                        (c.slug?.toLowerCase() === subCategoryQuery.toLowerCase()) || 
                        (c.name?.toLowerCase() === subCategoryQuery.toLowerCase())
                    );
                    if (foundSub) setSelectedSubCategory(foundSub);
                } else if (!subCategoryQuery) {
                    setSelectedSubCategory(null);
                }
            } else {
                setSelectedCategory(null);
                setSelectedSubCategory(null);
                setSubCategories([]);
            }
        }
    }, [categoryQuery, subCategoryQuery, categories.length, subCategories.length]);

    const sortOptions = [
        { value: 'newest', label: 'Relevance (Newest First)' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Customer Rating' },
    ];

    const handleCategoryClick = (cat) => {
        if (selectedCategory?._id === cat._id) {
            setSelectedCategory(null);
            setSelectedSubCategory(null);
            setSearchParams(p => { p.delete('category'); p.delete('subCategory'); return p; });
        } else {
            setSelectedCategory(cat);
            setSelectedSubCategory(null);
            setSearchParams({ category: cat.slug || cat.name });
        }
    };

    const handleSubCategoryClick = (sub) => {
        if (selectedSubCategory?._id === sub._id) {
            setSelectedSubCategory(null);
            setSearchParams(p => { p.delete('subCategory'); return p; });
        } else {
            setSelectedSubCategory(sub);
            setSearchParams(p => { 
                p.set('category', selectedCategory.slug || selectedCategory.name);
                p.set('subCategory', sub.slug || sub.name); 
                return p; 
            });
        }
    };



    const handleCategoryToggle = (cat) => {
        const slug = cat.slug || cat.name;
        const newIds = selectedCategoryIds.includes(slug)
            ? selectedCategoryIds.filter(id => id !== slug)
            : [...selectedCategoryIds, slug];
        setSelectedCategoryIds(newIds);
        setSearchParams(prev => {
            if (newIds.length > 0) prev.set('categories', newIds.join(','));
            else prev.delete('categories');
            return prev;
        });
    };

    const showCategoryBar = !(selectedCategory && subCategories.length === 0);

    return (
        <div className={`min-h-screen bg-gray-50 flex flex-col ${showCategoryBar ? (isShrunk ? 'pt-[102px] md:pt-[110px]' : 'pt-[157px] md:pt-[165px]') : 'pt-[52px] md:pt-[60px]'} transition-all duration-300`}>
            <CommonHeader 
                onFilter={() => setIsFilterOpen(true)}
            />

            <CategoryHorizontalList 
                selectedCategory={selectedCategory}
                subCategories={subCategories}
                categories={categories}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubCategory={setSelectedSubCategory}
                setSearchParams={setSearchParams}
                isShrunk={isShrunk}
                catLoading={catLoading}
                categoryQuery={categoryQuery}
                handleSubCategoryClick={handleSubCategoryClick}
                handleCategoryClick={handleCategoryClick}
                setSelectedCategory={setSelectedCategory}
            />

            <div className="flex-1 w-full bg-gray-50/10">
                <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-2 py-4 gap-6">
                
                {/* Desktop Filter Drawer - Left */}
                <aside className="hidden md:block w-64 flex-shrink-0 h-full overflow-y-auto no-scrollbar">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center space-x-2 text-[#e11955]">
                                <SlidersHorizontal size={18} strokeWidth={3} />
                                <h2 className="font-black uppercase text-xs tracking-widest">Filters</h2>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                    Sort By
                                </h3>
                                <div className="space-y-2">
                                    {sortOptions.map(opt => (
                                        <button 
                                            key={opt.value} 
                                            onClick={() => setSortBy(opt.value)}
                                            className={`w-full text-left py-2 px-3 rounded-lg text-[11px] font-bold transition-all ${sortBy === opt.value ? 'bg-rose-50 text-[#e11955]' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                    Price Range
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full text-sm font-bold border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#e11955] focus:border-transparent"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full text-sm font-bold border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#e11955] focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSearchParams(prev => {
                                                if (priceRange.min) prev.set('minPrice', priceRange.min);
                                                else prev.delete('minPrice');
                                                if (priceRange.max) prev.set('maxPrice', priceRange.max);
                                                else prev.delete('maxPrice');
                                                return prev;
                                            });
                                        }}
                                        className="w-full bg-[#e11955] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-opacity-90 transition-colors"
                                    >
                                        Apply Price Range
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                    Categories
                                </h3>
                                <div className="space-y-3">
                                    {categories.map(cat => (
                                        <label key={cat._id} className="flex items-center group cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategoryIds.includes(cat.slug || cat.name)}
                                                onChange={() => handleCategoryToggle(cat)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#e11955] focus:ring-[#e11955]"
                                            />
                                            <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-[#e11955] transition-colors">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 min-h-[600px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full px-1"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (<div key={i} className="bg-white border text-gray-100 h-80 w-full animate-pulse rounded-xl"></div>))}
                            </motion.div>
                        ) : products.length > 0 ? (
                            <motion.div 
                                key="products"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 w-full pb-10"
                            >
                                {products.map(product => (<ProductCard key={product._id} product={product} />))}
                            </motion.div>
                        ) : (
                            /* Empty State blending with background */
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center py-20 px-4 w-full"
                            >
                                <div className="bg-gray-200/50 p-8 rounded-full mb-6 flex items-center justify-center">
                                    <Shirt size={64} strokeWidth={1} className="text-gray-400" />
                                </div>
                                <span className="text-gray-600 font-black uppercase text-[13px] tracking-widest text-center">No products found</span>
                                <span className="text-gray-400 text-[10px] font-bold mt-2 text-center uppercase tracking-tighter">Try adjusting your filters or category</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm md:hidden">
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                                <span className="text-lg font-black text-gray-900 tracking-tight uppercase tracking-widest">Filters</span>
                                <button onClick={() => setIsFilterOpen(false)} className="bg-gray-100 p-2 rounded-full"><X size={20} className="text-gray-700" /></button>
                            </div>
                             <div className="space-y-8">
                                 <div>
                                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Sort By</h3>
                                     <div className="flex flex-col space-y-2">
                                         {sortOptions.map(opt => (
                                             <button 
                                                 key={opt.value} 
                                                 onClick={() => setSortBy(opt.value)}
                                                 className={`flex items-center justify-between py-3 px-4 rounded-xl border text-[11px] font-bold uppercase tracking-wide transition-all ${sortBy === opt.value ? 'border-[#e11955] bg-rose-50 text-[#e11955]' : 'border-gray-50 text-gray-600'}`}
                                             >
                                                 {opt.label}
                                                 {sortBy === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-[#e11955]" />}
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 <div>
                                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">By Category</h3>
                                     <div className="grid grid-cols-2 gap-3">
                                         {categories.map(cat => (
                                             <button 
                                                 key={cat._id} 
                                                 onClick={() => handleCategoryClick(cat)}
                                                 className={`py-3 px-2 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wide transition-all ${selectedCategory?._id === cat._id ? 'border-[#e11955] bg-rose-50 text-[#e11955]' : 'border-gray-100 text-gray-600'}`}
                                             >
                                                 {cat.name}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                                 <button className="w-full bg-[#e11955] text-white font-black py-4 rounded-xl shadow-lg shadow-rose-100 uppercase tracking-widest text-xs" onClick={() => setIsFilterOpen(false)}>Apply Everything</button>
                             </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductList;
