import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star } from 'lucide-react';
import ProductCard from './ProductCard';
import { get_top_rated_products } from '../../store/reducers/wearProductReducer';

const TopRatedSection = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { topRatedProducts: products, loader: loading } = useSelector(state => state.wearProduct);



    if (loading) {
        return (
            <div className="py-6 px-3 bg-gray-50/50">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="flex space-x-2.5 overflow-hidden">
                    {[1, 2].map(i => (
                        <div key={i} className="w-[170px] h-[310px] bg-white animate-pulse rounded-xl border border-gray-100 flex-shrink-0 shadow-sm"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="py-4 bg-gradient-to-b from-orange-100/60 via-amber-50/30 to-transparent border-y border-orange-100/20">
            {/* Section Header */}
            <div className="px-3 flex items-center justify-between mb-3">
                <div>
                    <h2 className="text-[14px] font-semibold text-gray-900 tracking-tight uppercase leading-none">Top Rated Selections</h2>
                    <p className="text-[9px] text-gray-500 font-medium mt-1">Premium picks based on reviews</p>
                </div>
                <button 
                    onClick={() => navigate('/products')}
                    className="text-[11px] font-semibold text-secondary hover:text-secondary/80 border-b border-secondary/30 pb-0.5 tracking-wider uppercase transition-all active:translate-x-1"
                >
                    View All
                </button>
            </div>

            {/* Horizontal Scroll Area - Limit to 4 for Home Page */}
            <div className="flex overflow-x-auto no-scrollbar px-3 space-x-2 md:space-x-5 pb-6 -mb-4 items-stretch snap-x snap-mandatory">
                {products.slice(0, 4).map((product) => (
                    <div key={product._id} className="w-[calc(50%-4px)] md:w-[220px] lg:w-[240px] flex-shrink-0 snap-start">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopRatedSection;
