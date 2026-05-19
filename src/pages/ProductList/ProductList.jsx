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

import CategoryHorizontalList from './CategoryHorizontalList';

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Selectors
    const { products, loader: loading } = useSelector(state => state.wearProduct);
    const { categories, loader: catLoading } = useSelector(state => state.wearCategory);

    // Extract Params from URL (Single Source of Truth)
    // Extract Params from URL (Single Source of Truth)
    const searchTerm = searchParams.get('search') || '';
    const categoryQuery = searchParams.get('category') === 'undefined' ? '' : (searchParams.get('category') || '');
    const subCategoryQuery = searchParams.get('subCategory') || '';
    const minPriceQuery = searchParams.get('minPrice') || '';
    const maxPriceQuery = searchParams.get('maxPrice') || '';
    const categoriesQuery = searchParams.get('categories') || '';
    const selectedCategories = categoriesQuery ? categoriesQuery.split(',') : [];
    const catIdParam = searchParams.get('catId') || '';
    const sizeQueryParam = searchParams.get('size') || '';
    const colorQueryParam = searchParams.get('color') || '';

    // Local State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid'); 
    const [selectedCategory, setSelectedCategory] = useState(catIdParam ? { _id: catIdParam } : null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [hasSubCategories, setHasSubCategories] = useState(false);
    const [isShrunk, setIsShrunk] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: minPriceQuery, max: maxPriceQuery });
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(selectedCategories);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const hasFetchedTopLevel = React.useRef(false);
    const observer = React.useRef();

    const lastProductRef = React.useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPageNumber(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

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

    // Initial fetch for top-level categories only if not already loaded in Redux AND we are not viewing a specific category
    useEffect(() => {
        if (categories.length === 0 && !hasFetchedTopLevel.current && !categoryQuery) {
            hasFetchedTopLevel.current = true;
            dispatch(get_wear_categories({ level: 0 }));
        }
    }, [dispatch, categories.length, categoryQuery]);

    // Reset page only when filters (excluding pageNumber) actually change
    const filterKey = `${searchTerm}-${categoryQuery}-${subCategoryQuery}-${sortBy}-${minPriceQuery}-${maxPriceQuery}-${categoriesQuery}-${catIdParam}-${sizeQueryParam}-${colorQueryParam}`;
    const lastFilterKey = React.useRef(filterKey);

    useEffect(() => {
        if (lastFilterKey.current !== filterKey) {
            setPageNumber(1);
            setHasMore(true);
            lastFilterKey.current = filterKey;
        }
    }, [filterKey]);

    // Consolidated Product Fetch
    useEffect(() => {
        if (window.location.pathname !== '/products') return;

        const params = {
            search: searchTerm,
            sort: sortBy,
            pageNumber: pageNumber,
            limit: 15
        };

        // Correctly assign category ID or name for the API
        if (categoriesQuery) {
            params.categories = categoriesQuery;
        } else if (subCategoryQuery) {
            params.category = subCategoryQuery;
        } else if (catIdParam) {
            params.category = catIdParam;
        } else if (categoryQuery) {
            params.category = categoryQuery;
        }

        // Important: If we have a catId but params.category is still empty, force it
        if (catIdParam && !params.category) {
            params.category = catIdParam;
        }

        // Skip if everything is truly empty
        if (!params.category && !searchTerm && !categoriesQuery && products.length === 0) return;

        if (minPriceQuery) params.lowPrice = minPriceQuery;
        if (maxPriceQuery) params.highPrice = maxPriceQuery;
        if (sizeQueryParam) params.size = sizeQueryParam;
        if (colorQueryParam) params.color = colorQueryParam;

        const isAppend = pageNumber > 1;

        if (!isAppend) {
            dispatch({ type: 'wearProduct/reset_wear_products' });
        }

        dispatch(get_wear_products({ ...params, append: isAppend })).then((res) => {
            if (res.payload && res.payload.products) {
                if (res.payload.products.length < 15) {
                    setHasMore(false);
                }
            }
        });
    }, [dispatch, searchTerm, categoryQuery, subCategoryQuery, sortBy, minPriceQuery, maxPriceQuery, categoriesQuery, catIdParam, sizeQueryParam, colorQueryParam, pageNumber]);

    // Sync local state with URL changes
    useEffect(() => {
        setSelectedCategoryIds(categoriesQuery ? categoriesQuery.split(',') : []);
    }, [categoriesQuery]);

    useEffect(() => {
        setPriceRange({ min: minPriceQuery, max: maxPriceQuery });
    }, [minPriceQuery, maxPriceQuery]);

    // Sync state icons/ui with URL (Silent Sync)
    useEffect(() => {
        if (categories.length > 0) {
            // Find parent by name/slug OR by catIdParam (ID)
            const foundParent = categories.find(c => 
                (catIdParam && c._id === catIdParam) ||
                (categoryQuery && (
                    (c.slug?.toLowerCase() === categoryQuery.toLowerCase()) || 
                    (c.name?.toLowerCase() === categoryQuery.toLowerCase())
                ))
            );
            if (foundParent) {
                if (!selectedCategory || selectedCategory._id !== foundParent._id || !selectedCategory.name) {
                    setSelectedCategory(foundParent);
                }
                if (!subCategoryQuery) {
                    setSelectedSubCategory(null);
                }
            } else if (!catIdParam) {
                // Only reset if we don't have a catId holding the state
                setSelectedCategory(null);
                setSelectedSubCategory(null);
            }
        }
    }, [categoryQuery, subCategoryQuery, categories.length, catIdParam]);

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
            setSearchParams(p => { p.delete('category'); p.delete('catId'); p.delete('subCategory'); return p; });
        } else {
            setSelectedCategory(cat);
            setSelectedSubCategory(null);
            setSearchParams({ category: cat.slug || cat.name, catId: cat._id });
        }
    };

    const handleSubCategoryClick = (sub) => {
        if (selectedSubCategory?._id === sub._id) {
            setSelectedSubCategory(null);
            setSearchParams(p => { p.delete('subCategory'); return p; });
        } else {
            setSelectedSubCategory(sub);
            // Guard: selectedCategory may not have slug/name if it was initialized from catIdParam only
            const catName = selectedCategory?.slug || selectedCategory?.name || categoryQuery || '';
            setSearchParams(p => { 
                if (catName) p.set('category', catName);
                if (selectedCategory?._id) p.set('catId', selectedCategory._id);
                p.set('subCategory', sub._id);
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

    const showCategoryBar = !(selectedCategory && !hasSubCategories);

    return (
        <div className={`min-h-screen bg-gray-50 flex flex-col ${showCategoryBar ? (isShrunk ? 'pt-[102px] md:pt-[110px]' : 'pt-[157px] md:pt-[165px]') : 'pt-[52px] md:pt-[60px]'} transition-all duration-300`}>
            <CommonHeader 
                onFilter={() => setIsFilterOpen(true)}
            />

            <CategoryHorizontalList 
                selectedCategory={selectedCategory}
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
                onSubCategoriesChange={(subs) => setHasSubCategories(subs.length > 0)}
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


                        </div>
                    </div>
                </aside>

                <main className="flex-1 min-h-[600px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {loading && pageNumber === 1 ? (
                            <motion.div 
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 w-full px-1"
                            >
                                {[1,2,3,4,5,6,7,8].map(i => (
                                    <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100/60 shadow-sm">
                                        <div className="aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                                        </div>
                                        <div className="p-3 space-y-2.5">
                                            <div className="h-3 bg-gray-100 rounded-full w-4/5 animate-pulse" />
                                            <div className="h-3 bg-gray-100 rounded-full w-3/5 animate-pulse" />
                                            <div className="flex gap-1.5 pt-1">
                                                {[1,2,3].map(j => <div key={j} className="w-3 h-3 rounded-full bg-gray-100 animate-pulse" />)}
                                            </div>
                                            <div className="h-4 bg-gray-100 rounded-full w-1/3 animate-pulse mt-1" />
                                            <div className="h-9 bg-gray-50 rounded-xl w-full animate-pulse mt-2" />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : products.length > 0 ? (
                            <motion.div 
                                key="products"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 w-full pb-10 px-1"
                            >
                                {products.map((product, index) => (
                                    <motion.div
                                        key={product._id}
                                        ref={products.length === index + 1 ? lastProductRef : null}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.25, 0.1, 0.25, 1] }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="flex-1 flex flex-col items-center justify-center py-24 px-4 w-full"
                            >
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-rose-100/30 rounded-full blur-2xl scale-150 animate-pulse" />
                                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-full border border-gray-200/50 shadow-inner">
                                        <Shirt size={56} strokeWidth={1} className="text-gray-300" />
                                    </div>
                                </div>
                                <span className="text-gray-700 font-black uppercase text-sm tracking-[0.2em] text-center">No products found</span>
                                <span className="text-gray-400 text-xs font-medium mt-2 text-center">Try adjusting your filters or browse another category</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Infinite Scroll Loader */}
                    {loading && pageNumber > 1 && (
                        <div className="py-8 flex justify-center">
                            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                                <div className="w-4 h-4 border-2 border-rose-200 border-t-[#e11955] rounded-full animate-spin" />
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Loading more</span>
                            </div>
                        </div>
                    )}
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
