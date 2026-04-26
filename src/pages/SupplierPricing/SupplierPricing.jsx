import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Tag, TrendingUp, TrendingDown, 
    Filter, RefreshCw, Edit, Eye, 
    CheckCircle, XCircle, AlertCircle, 
    DollarSign, Percent, BarChart3,
    ChevronRight, MoreVertical, Download,
    Search, Calendar, Clock, IndianRupee,
    Zap
} from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';
import { useDispatch, useSelector } from 'react-redux';
import { get_my_catalogs, get_pricing_data } from '../../store/reducers/vendorReducer';
import { toast } from "sonner";
import { 
  StatsCard, 
  GradientCard, 
  DataCard,
  StatusBadge 
} from '../../components/supplier';

const SupplierPricing = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { myCatalogs, pricingData, loader } = useSelector(state => state.vendor);
    
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products'); // 'products', 'competition', 'analytics'
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        search: '',
        sortBy: 'price_high_low'
    });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [priceSuggestions, setPriceSuggestions] = useState({});

    useEffect(() => {
        fetchPricingData();
    }, []);

    const fetchPricingData = async () => {
        try {
            setLoading(true);
            // Fetch catalogs for pricing management
            dispatch(get_my_catalogs());
            
            // Fetch pricing data from API
            const pricingResponse = await dispatch(get_pricing_data());
            if (pricingResponse.payload?.success) {
                setPriceSuggestions(pricingResponse.payload.data?.priceRecommendations || {});
            }
            
        } catch (error) {
            console.error('Error fetching pricing data:', error);
            toast.error('Failed to load pricing data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateMargin = (costPrice, sellingPrice) => {
        if (!costPrice || !sellingPrice) return 0;
        return ((sellingPrice - costPrice) / costPrice * 100).toFixed(1);
    };

    const ProductCard = ({ product }) => {
        const margin = calculateMargin(product.costPrice, product.sellingPrice);
        const isSelected = selectedProducts.includes(product._id);
        
        return (
            <div className={`bg-white rounded-xl p-3 sm:p-4 mb-3 border ${isSelected ? 'border-[#7C3AED]' : 'border-gray-100'} shadow-sm`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-gray-800">{product.productName}</h4>
                                <p className="text-gray-500 text-xs sm:text-sm">{product.category}</p>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button 
                                    onClick={() => navigate(`/product/${product._id}`)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <Eye size={14} className="text-gray-500 sm:w-4 sm:h-4" />
                                </button>
                                <button 
                                    onClick={() => navigate(`/catalog-upload`, { state: { editCatalogId: product._id } })}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <Edit size={14} className="text-gray-500 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-gray-500 text-xxs sm:text-xs font-bold">Cost Price</p>
                                <p className="text-gray-900 text-sm font-black">{formatCurrency(product.costPrice || 0)}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-gray-500 text-xxs sm:text-xs font-bold">Selling Price</p>
                                <p className="text-gray-900 text-sm font-black">{formatCurrency(product.sellingPrice || 0)}</p>
                            </div>
                            <div className={`p-2 rounded-lg ${margin >= 20 ? 'bg-green-50' : margin >= 10 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                                <p className="text-gray-500 text-xxs sm:text-xs font-bold">Margin</p>
                                <p className={`text-sm font-black ${margin >= 20 ? 'text-green-600' : margin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {margin}%
                                </p>
                            </div>
                        </div>

                        {priceSuggestions[product._id] && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 sm:p-3 mb-2">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={12} className="text-blue-600 sm:w-4 sm:h-4" />
                                        <span className="text-blue-700 text-xs sm:text-sm font-bold">AI Price Recommendation</span>
                                    </div>
                                    <span className="text-blue-900 text-sm font-black">
                                        {formatCurrency(priceSuggestions[product._id].recommendedPrice)}
                                    </span>
                                </div>
                                <p className="text-blue-600 text-xxs sm:text-xs">
                                    {priceSuggestions[product._id].reason}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <StatusBadge 
                                    status={product.status === 'active' ? 'active' : 'inactive'}
                                    size="sm"
                                />
                                <span className="text-gray-400 text-xxs sm:text-xs">
                                    SKU: {product.sku?.slice(-6) || 'N/A'}
                                </span>
                            </div>
                            <button 
                                onClick={() => {
                                    if (isSelected) {
                                        setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                                    } else {
                                        setSelectedProducts([...selectedProducts, product._id]);
                                    }
                                }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg ${isSelected ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                {isSelected ? 'Selected' : 'Select'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const CompetitionCard = ({ competitor }) => (
        <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className="text-sm font-bold text-gray-800">{competitor.platform}</h4>
                            <p className="text-gray-500 text-xs">{competitor.productName}</p>
                        </div>
                        <div className={`text-sm font-black ${competitor.priceDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {competitor.priceDifference > 0 ? '+' : ''}{formatCurrency(competitor.priceDifference)}
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-gray-500 text-[10px]">Their Price</p>
                                <p className="text-gray-900 text-sm font-bold">{formatCurrency(competitor.price)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px]">Rating</p>
                                <div className="flex items-center">
                                    <span className="text-yellow-500 text-xs">★</span>
                                    <span className="text-gray-900 text-xs font-bold ml-1">{competitor.rating}</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-gray-400 text-xs">
                            {competitor.sales} sold
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
            {/* FIXED HEADER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                        <button 
                            onClick={() => navigate(-1)}
                            className="bg-[#7C3AED] flex items-center px-3 py-1.5 rounded-lg mr-3 shadow-sm"
                        >
                            <ArrowLeft size={16} className="text-white" />
                            <span className="text-white text-xs sm:text-sm font-black ml-1">Back</span>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">Pricing Management</h1>
                            <p className="text-gray-500 text-xs sm:text-sm">Optimize prices for maximum profit</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button 
                            onClick={fetchPricingData}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={loading}
                        >
                            <RefreshCw size={18} className={`text-gray-600 ${loading ? 'animate-spin' : ''} sm:w-5 sm:h-5`} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Filter size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-100">
                    {['products', 'competition', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-center ${activeTab === tab ? 'border-b-2 border-[#7C3AED]' : ''}`}
                        >
                            <span className={`text-xs sm:text-sm font-bold ${activeTab === tab ? 'text-[#7C3AED]' : 'text-gray-500'}`}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* SPACER */}
            <div className="pt-[100px] sm:pt-[120px]" />

            {/* BULK ACTIONS BAR */}
            {selectedProducts.length > 0 && (
                <div className="fixed top-[100px] sm:top-[120px] left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircle size={16} className="text-green-600 mr-2" />
                            <span className="text-gray-700 text-sm font-bold">
                                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                                Bulk Update
                            </button>
                            <button className="bg-[#7C3AED] text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                Apply AI Pricing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT */}
            <div className="p-4 sm:p-6 flex-1">
                {loader ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* PRODUCTS TAB */}
                        {activeTab === 'products' && (
                            <div className="space-y-4 sm:space-y-6">
                                {/* QUICK STATS */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <StatsCard
                                        title="Avg. Margin"
                                        value={`${pricingData?.stats?.avgMargin || 0}%`}
                                        icon={Percent}
                                        iconColor="text-green-500"
                                    />
                                    <StatsCard
                                        title="Price Changes"
                                        value={pricingData?.stats?.priceChanges || 0}
                                        icon={TrendingUp}
                                        iconColor="text-blue-500"
                                    />
                                    <StatsCard
                                        title="Competitive"
                                        value={pricingData?.stats?.competitiveProducts || 0}
                                        icon={CheckCircle}
                                        iconColor="text-purple-500"
                                    />
                                    <StatsCard
                                        title="AI Recommendations"
                                        value={pricingData?.stats?.priceRecommendations || 0}
                                        icon={Zap}
                                        iconColor="text-amber-500"
                                    />
                                </div>

                                {/* SEARCH & FILTERS */}
                                <DataCard title="Product Management">
                                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                        <div className="flex-1 relative">
                                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-5 sm:h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                value={filters.search}
                                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* PRODUCT LIST */}
                                    <div>
                                        <h3 className="text-gray-900 text-base sm:text-lg font-bold mb-3 sm:mb-4">Your Products</h3>
                                        {pricingData?.products && pricingData.products.length > 0 ? (
                                            pricingData.products
                                                .filter(p => !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()))
                                                .map((product, index) => (
                                                <ProductCard key={index} product={{
                                                    _id: product._id,
                                                    productName: product.name,
                                                    sellingPrice: product.currentPrice,
                                                    costPrice: Math.floor(product.currentPrice * 0.75), // Example calc
                                                    status: 'active',
                                                    sku: product.sku || 'N/A'
                                                }} />
                                            ))
                                        ) : (
                                            <div className="text-center py-10">
                                                <Tag size={48} className="text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 text-sm">No products found in pricing database</p>
                                            </div>
                                        )}
                                    </div>
                                </DataCard>
                            </div>
                        )}

                        {/* COMPETITION TAB */}
                        {activeTab === 'competition' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-900 text-sm font-bold mb-4">Market Competition</h3>
                                    {pricingData?.competition?.length > 0 ? (
                                        pricingData.competition.map((comp, i) => (
                                            <CompetitionCard key={i} competitor={comp} />
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <BarChart3 size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">Synchronizing competitor pricing from major platforms...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ANALYTICS TAB */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-900 text-sm font-bold mb-4">Pricing Analytics</h3>
                                    <div className="text-center py-10">
                                        <TrendingUp size={48} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Elasticity analytics and demand forecasting coming soon</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <SupplierFooter />
        </div>
    );
};

export default SupplierPricing;
