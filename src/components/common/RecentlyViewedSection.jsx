import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { History, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { get_recent_products } from '../../store/reducers/wearProductReducer';

const RecentlyViewedSection = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);
    const { recentProducts, loader } = useSelector(state => state.wearProduct);

    useEffect(() => {
        if (userInfo?._id && recentProducts.length === 0) {
            dispatch(get_recent_products(userInfo._id));
        }
    }, [dispatch, userInfo?._id, recentProducts.length]);

    if (!userInfo || recentProducts.length === 0) return null;

    return (
        <div className="py-5 bg-gradient-to-r from-sky-50/30 via-indigo-50/20 to-transparent border-y border-gray-100 mt-2">
            {/* Section Header */}
            <div className="px-3 flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <History size={18} className="text-secondary mr-2" />
                    <div>
                        <h2 className="text-[14px] font-black text-gray-900 tracking-tight uppercase leading-none">Recently Viewed</h2>
                        <p className="text-[9px] text-gray-500 font-bold mt-1">Pick up where you left off</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/profile')}
                    className="text-[11px] font-black text-secondary hover:text-secondary/80 flex items-center tracking-wider uppercase transition-all"
                >
                    User History
                    <ChevronRight size={14} className="ml-1" />
                </button>
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex overflow-x-auto no-scrollbar px-3 space-x-2 md:space-x-5 pb-2 -mb-2 items-stretch">
                {recentProducts.slice(0, 10).map((product) => (
                    <div key={product._id} className="w-[calc(50%-4px)] md:w-[200px] flex-shrink-0">
                        <ProductCard product={{
                            ...product,
                            name: product.name || product.productName,
                            price: product.price || product.variants?.[0]?.listingPrice,
                            rating: product.rating || 5,
                            discount: product.discount || 0
                        }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewedSection;
