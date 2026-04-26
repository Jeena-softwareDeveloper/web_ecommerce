import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2, Star } from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import ProductCard from '../../components/common/ProductCard';
import { get_wishlist, remove_from_wishlist } from '../../store/reducers/wishlistReducer';
import { toast } from "sonner";

const Wishlist = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo, token } = useSelector(state => state.auth);
    const { wishlistItems, loader } = useSelector(state => state.wishlist);

    useEffect(() => {
        if (token) {
            dispatch(get_wishlist());
        } else {
            navigate('/login');
        }
    }, [dispatch, token, navigate]);

    const handleRemoveFromWishlist = (productId) => {
        dispatch(remove_from_wishlist(productId)).then((res) => {
            if (res.payload?.message) {
                toast.success('Removed from wishlist');
            }
        });
    };

    const handleMoveToCart = (product) => {
        // This would require add_to_cart functionality
        // For now, navigate to product page
        navigate(`/product/${product._id}`);
    };

    if (!token) {
        return null; // Redirect handled by useEffect
    }

    if (loader) {
        return (
            <div className="min-h-screen bg-gray-50">
                <CommonHeader title="My Wishlist" />
                <div className="container mx-auto px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <CommonHeader title="My Wishlist" />

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
                        <p className="text-gray-600 mt-1">
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                    {wishlistItems.length > 0 && (
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </Link>
                    )}
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                            <Heart size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Save items you like to your wishlist. Review them anytime and easily move them to your cart.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <ArrowRight size={18} />
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => {
                            const product = item.productId;
                            if (!product) return null;
                            return (
                                <div key={item._id || product._id} className="relative group">
                                    <ProductCard product={product} />
                                    <button
                                        onClick={() => handleRemoveFromWishlist(product._id)}
                                        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 z-20"
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleMoveToCart(product)}
                                        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-dark z-20 whitespace-nowrap"
                                    >
                                        Move to Cart
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Wishlist Tips */}
                {wishlistItems.length > 0 && (
                    <div className="mt-12 bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Wishlist Tips</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Heart size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Save for later</h4>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Items in your wishlist are saved until you remove them.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                    <ShoppingBag size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Get notified</h4>
                                    <p className="text-gray-600 text-sm mt-1">
                                        We'll alert you if items in your wishlist go on sale or come back in stock.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Star size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Share with friends</h4>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Coming soon: Share your wishlist via link or social media.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
