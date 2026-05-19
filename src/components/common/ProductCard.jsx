import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShoppingCart } from 'lucide-react';
import { add_to_cart, get_cart } from '../../store/reducers/wearCartReducer';
import { toast } from "sonner";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);

    const rating = product.avgRating || product.rating || 0;
    const ratingCount = product.reviewCount || 0;

    const price = product.price || product.variants?.[0]?.listingPrice || 0;
    const mrp = product.mrp || product.variants?.[0]?.mrp || price + 100;
    const isBulk = product.isBulkOnly;
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const name = product.name || product.productName || "Premium Product";
    const rawImageUrl = product.images?.[0] || product.image;
    const imageUrl = (rawImageUrl && !rawImageUrl.startsWith('file://')) ? rawImageUrl : '';

    const handleClick = () => {
        const fromPath = location.state?.from || location.pathname;
        const isCurrentlyOnProductPage = location.pathname.startsWith('/product/');
        navigate(`/product/${product._id}`, {
            state: { from: fromPath },
            replace: isCurrentlyOnProductPage
        });
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
            className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100/60 flex flex-col h-full hover:-translate-y-1"
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-50/50 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={name}
                    loading="lazy"
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                />

                {discount > 0 && (
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-[#e11955] to-[#ff3d6f] text-white text-[10px] md:text-[11px] font-black px-3 py-1.5 rounded-br-xl z-10 shadow-md shadow-rose-300/30 tracking-wide">
                        {discount}% OFF
                    </div>
                )}
                {/* Subtle bottom fade */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>

            {/* Details Container */}
            <div className="p-3 md:p-3.5 flex flex-col flex-grow bg-gray-50 relative">
                {/* Centered Divider */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gray-200" />

                {/* Product Title */}
                <h3 className="font-bold text-gray-900 text-[11.5px] md:text-[13px] line-clamp-2 leading-[16px] md:leading-[18px] mb-2 group-hover:text-[#e11955] transition-colors duration-300 min-h-[32px] md:min-h-[36px]">
                    {name}
                </h3>

                {/* Variant Info & Stock Status */}
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Variants:
                        </span>
                        <span className="text-[10.5px] md:text-[11.5px] font-black text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/50 shadow-sm">
                            {product.variants?.length || 1}
                        </span>
                    </div>

                    {(() => {
                        const totalStock = product.variants?.reduce((sum, v) => {
                            const variantStock = v.stock ?? v.availableStock ?? v.totalStock ?? 0;
                            return sum + variantStock;
                        }, 0) || 0;
                        
                        if (totalStock > 0 && totalStock <= 10) {
                            return (
                                <div className="bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 flex items-center gap-1 animate-pulse shrink-0">
                                    <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                                    <span className="text-orange-700 text-[8px] md:text-[9px] font-black italic">{totalStock} Left</span>
                                </div>
                            );
                        }
                        if (totalStock === 0) {
                            return (
                                <div className="bg-red-50 px-2 py-1 rounded-md border border-red-100 shrink-0 flex items-center justify-center leading-none">
                                    <span className="text-red-600 text-[8.5px] md:text-[9.5px] font-black uppercase tracking-tighter">Sold Out</span>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* Rating & Payment Badges */}
                <div className="flex items-center justify-between mt-auto mb-1.5">
                    <div className="flex items-center gap-1.5">
                        {rating > 0 ? (
                            <div className="flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] md:text-[10px] px-2 py-1 rounded-lg shadow-sm shadow-emerald-200/50">
                                <span className="font-extrabold">{rating.toFixed(1)}</span>
                                <Star size={9} className="fill-white ml-0.5" />
                            </div>
                        ) : (
                            <div className="flex items-center bg-amber-50 text-amber-600 text-[9px] md:text-[10px] px-2 py-1 rounded-lg border border-amber-100">
                                <span className="font-bold">✦ New</span>
                            </div>
                        )}
                        <span className="text-gray-400 text-[9px] md:text-[10px] font-medium">({ratingCount})</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 text-[8px] md:text-[9px] font-bold">UPI</span>
                        <div className="w-px h-2.5 bg-emerald-200" />
                        <span className="text-emerald-700 text-[8px] md:text-[9px] font-bold">COD</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-1.5 flex flex-col">
                    <div className="flex items-baseline gap-2">
                        {isBulk ? (
                            <>
                                <span className="text-[10px] font-bold text-[#e11955] uppercase tracking-tighter">Starting</span>
                                <span className="text-[15px] md:text-[17px] font-black text-gray-900">
                                    ₹{(() => {
                                        const allTiers = (product.variants || []).flatMap(v => v.priceTiers || []);
                                        if (allTiers.length > 0) {
                                            const prices = allTiers.map(t => parseFloat(String(t.finalPrice || t.unitPrice || t.price || 0).replace(/[^0-9.]/g, ''))).filter(p => p > 0);
                                            return prices.length > 0 ? Math.ceil(Math.min(...prices)).toLocaleString() : Math.ceil(price).toLocaleString();
                                        }
                                        return Math.ceil(price).toLocaleString();
                                    })()}
                                </span>
                            </>
                        ) : (
                            <span className="text-[15px] md:text-[17px] font-black text-gray-900">₹{Math.ceil(price)}</span>
                        )}
                        {mrp > price && (
                            <span className="text-[10px] md:text-[11px] text-gray-400 line-through font-medium">₹{Math.ceil(mrp)}</span>
                        )}
                        {discount > 0 && !isBulk && (
                            <span className="text-[9px] md:text-[10px] text-emerald-600 font-bold">Save ₹{Math.ceil(mrp - price)}</span>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default ProductCard;
