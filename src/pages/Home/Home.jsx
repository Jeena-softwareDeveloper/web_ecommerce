import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_wear_categories } from '../../store/reducers/wearCategoryReducer';
import { get_wear_products, get_top_rated_products } from '../../store/reducers/wearProductReducer';
import { get_active_banners } from '../../store/reducers/configReducer';

// Components
import HomeHeader from '../../components/layout/HomeHeader';
import StickyFilterBar from '../../components/layout/StickyFilterBar';
import CategoryRow from '../../components/common/CategoryRow';
import BannerSection from '../../components/common/BannerSection';
import TopRatedSection from '../../components/common/TopRatedSection';
import OfferZone from '../../components/common/OfferZone';
import ProductCard from '../../components/common/ProductCard';
import RecentlyViewedSection from '../../components/common/RecentlyViewedSection';
import PersonalizedSection from '../../components/common/PersonalizedSection';
import FilterBottomSheet from '../../components/layout/FilterBottomSheet';
import { get_active_offers, get_global_offers } from '../../store/reducers/vendorOfferReducer';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categories, loader: catLoader } = useSelector(state => state.wearCategory);
    const { products, totalProducts, loader: prodLoader } = useSelector(state => state.wearProduct);

    const [filterState, setFilterState] = useState({
        sort: 'newest',
        category: '',
        gender: '',
        size: '',
        color: '',
        searchValue: '',
        page: 1
    });
    
    // Header & Filter Sticky Logic
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterMode, setFilterMode] = useState('all');
    const [loadError, setLoadError] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            
            // 1. Shadow logic
            setIsScrolled(scrollY > 10);

            // 2. Collapse logic
            // Threshold to prevent flickering
            const threshold = 10;
            const diff = scrollY - lastScrollY.current;

            if (scrollY < 50) {
                // Always show at the top
                setIsHeaderCollapsed(false);
            } else if (diff > threshold) {
                // Scrolling down - hide it
                setIsHeaderCollapsed(true);
            } else if (diff < -threshold) {
                // Scrolling up - show it
                setIsHeaderCollapsed(false);
            }

            lastScrollY.current = scrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    useEffect(() => {
        dispatch(get_wear_categories({ level: 0 }));
        dispatch(get_active_banners({ category: 'home' }));
        dispatch(get_top_rated_products());
        dispatch(get_active_offers());
        dispatch(get_global_offers());
    }, [dispatch]);

    useEffect(() => {
        setLoadError(false);
        setIsFetching(true);
        dispatch(get_wear_products({ 
            ...filterState,
            limit: 15,
            append: filterState.page > 1
        })).unwrap()
          .finally(() => setIsFetching(false))
          .catch(() => setLoadError(true));
    }, [dispatch, filterState]);

    // Infinite Scroll Logic
    useEffect(() => {
        const handleInfiniteScroll = () => {
            // Safety: If we've already loaded all products, don't even run the logic
            if (products.length >= totalProducts && totalProducts > 0) return;

            if (window.innerHeight + document.documentElement.scrollTop + 150 >= document.documentElement.offsetHeight) {
                if (!isFetching && !prodLoader && !loadError && products.length < totalProducts) {
                    setFilterState(prev => ({ ...prev, page: prev.page + 1 }));
                }
            }
        };

        if (products.length < totalProducts || totalProducts === 0) {
            window.addEventListener('scroll', handleInfiniteScroll);
        }
        
        return () => window.removeEventListener('scroll', handleInfiniteScroll);
    }, [isFetching, prodLoader, loadError, products.length, totalProducts]);

    const handleGenderCycle = () => {
        const genders = ['', 'men', 'women', 'unisex'];
        const currentIndex = genders.indexOf(filterState.gender);
        const nextIndex = (currentIndex + 1) % genders.length;
        setFilterState(prev => ({ ...prev, gender: genders[nextIndex] }));
    };

    const handleSortCycle = () => {
        const sorts = ['newest', 'low-to-high', 'high-to-low', 'top-rated'];
        const currentIndex = sorts.indexOf(filterState.sort);
        const nextIndex = (currentIndex + 1) % sorts.length;
        setFilterState(prev => ({ ...prev, sort: sorts[nextIndex] }));
    };

    const handleCategoryCycle = () => {
        if (categories.length === 0) return;
        const catIds = ['', ...categories.slice(0, 5).map(c => c.name.toLowerCase())];
        const currentIndex = catIds.indexOf(filterState.category);
        const nextIndex = (currentIndex + 1) % catIds.length;
        setFilterState(prev => ({ ...prev, category: catIds[nextIndex] }));
    };

    return (
        <div className="main-container pb-1 bg-gray-50/20 pt-[100px] md:pt-[90px] relative">
            <div>
                <HomeHeader 
                    isCollapsed={isHeaderCollapsed} 
                    isScrolled={isScrolled} 
                    onSearch={() => navigate('/search')}
                    onFilter={() => navigate('/products')}
                />

                <CategoryRow 
                    categories={categories} 
                    loading={catLoader} 
                    onCategoryClick={(cat) => navigate(`/products?category=${encodeURIComponent(cat.slug || cat.name)}`)}
                />

                <BannerSection category="home" type="mini" />

                <TopRatedSection />
                
                <RecentlyViewedSection />
                
                <PersonalizedSection />

                <OfferZone />
            </div>

            <div className="mt-4 px-1.5 md:px-0 pb-20">

                <FilterBottomSheet 
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    activeFilters={filterState}
                    categories={categories}
                    onApply={(newFilters) => setFilterState(newFilters)}
                    mode={filterMode}
                />

                <div className="flex items-center justify-between py-1 mt-6">
                    <h2 className="text-[14px] font-semibold text-secondary uppercase tracking-tight ml-1.5">
                        {filterState.category || filterState.gender ? 'Filtered Results' : 'Suggested for you'}
                    </h2>
                    <div className="h-[1px] flex-1 bg-gray-100 ml-4"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5 min-h-[400px]">
                    {/* Initial Loading */}
                    {prodLoader && filterState.page === 1 ? (
                        [1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="aspect-[3/4] bg-white animate-pulse rounded-xl border border-gray-100"></div>
                        ))
                    ) : (
                        products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    )}
                </div>

                {/* Infinite Scroll Loader */}
                {prodLoader && filterState.page > 1 && (
                    <div className="py-8 flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Load More Fallback if Error */}
                {loadError && (
                    <div className="py-8 flex flex-col items-center">
                        <p className="text-xs text-gray-500 mb-4">Something went wrong while loading more products.</p>
                        <button 
                            onClick={() => {
                                setLoadError(false);
                                setFilterState(prev => ({ ...prev, page: prev.page + 1 }));
                            }}
                            className="bg-white border border-gray-200 text-secondary text-xs font-bold px-6 py-2 rounded-full shadow-sm hover:bg-gray-50 uppercase tracking-wider"
                        >
                            Retry Load More
                        </button>
                    </div>
                )}

                {products.length === 0 && !prodLoader && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mb-4"></div>
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">No products found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
