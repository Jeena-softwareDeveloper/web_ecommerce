import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { add_to_cart, get_cart, messageClear } from '../../store/reducers/wearCartReducer';
import { toast } from "sonner";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);

    // Safe data extraction
    const price = product.variants?.[0]?.listingPrice || product.price || 0;
    const mrp = product.variants?.[0]?.mrp || product.mrp || price + 100;
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const name = product.productName || product.name || 'Product';
    const rawImageUrl = product.images?.[0] || product.image;
    const imageUrl = (rawImageUrl && !rawImageUrl.startsWith('file://')) ? rawImageUrl : '/placeholder.jpg';
    const rating = product.avgRating || product.rating || 0;
    const ratingCount = product.reviewCount || 0;

    const handleClick = () => {
        navigate(`/product/${product._id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (userInfo) {
            dispatch(add_to_cart({
                productId: product._id,
                quantity: 1,
                size: product.variants?.[0]?.size || 'Free',
                price: price
            })).then((res) => {
                if (res.payload?.message) {
                    toast.dismiss();
                    toast.success(res.payload.message);
                    dispatch(get_cart());
                }
            });
        } else {
            navigate('/login');
        }
    };



    return (
        <div
            onClick={handleClick}
            className="group bg-white rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100/50 flex flex-col h-full hover:-translate-y-1.5"
        >
            {/* Image Container */}
            <div className="relative aspect-square md:aspect-[4/3] bg-slate-50/50 overflow-hidden min-h-0 flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-primary text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-lg z-10 shadow-lg shadow-primary/20 uppercase tracking-wider">
                        {discount}% OFF
                    </div>
                )}
            </div>

            {/* Details Container */}
            <div className="p-3 md:p-4 flex flex-col flex-grow bg-slate-50/50 border-t border-gray-300/50">
                {/* Product Title */}
                <h3 className="font-semibold text-secondary text-[11px] md:text-[13px] line-clamp-2 h-8 md:h-10 leading-tight mb-1 group-hover:text-primary transition-colors">
                    {name}
                </h3>

                {/* Rating & Payment Badges */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5">
                        {rating > 0 ? (
                            <div className="flex items-center bg-emerald-500 text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-md shadow-sm shadow-emerald-200">
                                <span className="font-bold">{rating.toFixed(1)}</span>
                                <Star size={8} className="fill-white ml-0.5 md:w-[10px] md:h-[10px]" />
                            </div>
                        ) : (
                            <div className="flex items-center bg-slate-100 text-slate-400 text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-md">
                                <span className="font-bold uppercase tracking-tighter">New</span>
                            </div>
                        )}
                        <span className="text-slate-400 text-[8px] md:text-[10px] font-medium">({ratingCount})</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-slate-100 py-1 px-2.5 rounded-full shadow-sm">
                        <span className="text-secondary/70 text-[8px] md:text-[9px] font-bold tracking-tighter uppercase whitespace-nowrap">UPI</span>
                        <div className="w-[1px] h-2.5 bg-slate-200" />
                        <span className="text-secondary/70 text-[8px] md:text-[9px] font-bold tracking-tighter uppercase whitespace-nowrap text-gradient">COD</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                    <span className="text-[13px] md:text-[16px] font-bold text-secondary">₹{price}</span>
                    {mrp > price && (
                        <span className="text-[9px] md:text-[11px] text-slate-400 line-through decoration-primary/30">₹{mrp}</span>
                    )}
                </div>

                <button
                    onClick={handleAddToCart}
                    className="mt-3 w-full bg-primary/5 text-primary text-[11px] md:text-[13px] font-bold py-2.5 md:py-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 border border-primary/10 shadow-sm"
                >
                    <ShoppingCart size={14} className="md:w-[16px] md:h-[16px]" />
                    <span className="inline uppercase tracking-widest">Add to Cart</span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
