import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, SlidersHorizontal } from 'lucide-react';

const HomeSearchBar = ({ transparent = false, onFilter }) => {
    const navigate = useNavigate();
    const { totalItems } = useSelector(state => state.wearCart) || { totalItems: 0 };
    const { token, userInfo } = useSelector(state => state.auth);
    const { profileInfo } = useSelector(state => state.profile);
    const isLoggedIn = !!token;

    return (
        <div className={`flex items-center px-4 md:px-6 transition-all duration-300 md:bg-transparent md:shadow-none ${
            transparent ? 'bg-transparent py-2' : 'bg-white/80 backdrop-blur-md pb-4 pt-2 shadow-premium'
        }`}>
            {/* Search Box */}
            <div className="flex-1 flex items-center gap-3">
                <button
                    onClick={() => navigate('/search')}
                    className="flex-1 flex items-center bg-white border border-primary/15 h-11 px-5 rounded-xl text-left transition-all active:scale-[0.98] shadow-sm hover:border-primary/30 group"
                >
                    <Search size={18} className="text-slate-600 group-hover:text-primary transition-colors" />
                    <div className="ml-4 flex-1 overflow-hidden">
                        <p className="text-[14px] text-slate-700 font-bold truncate tracking-tight">
                            Fashion Search
                        </p>
                    </div>
                </button>
            </div>

            <div className="flex items-center space-x-3 ml-4">
                {/* Cart Button */}
                <button
                    onClick={() => navigate('/cart')}
                    className="h-11 w-11 flex items-center justify-center relative transition-all active:scale-90 hover:bg-primary/5 rounded-xl border border-primary/10 group"
                >
                    <ShoppingCart size={22} className="text-secondary group-hover:text-primary transition-colors" />
                    {totalItems > 0 && (
                        <div
                            className="absolute -top-1.5 -right-1.5 bg-primary min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-white shadow-lg shadow-primary/30 animate-in fade-in zoom-in duration-300"
                            style={{ zIndex: 10 }}
                        >
                            <span className="text-[10px] font-black text-white leading-none">{totalItems}</span>
                        </div>
                    )}
                </button>

                {/* Account/Login Button (Desktop Only) */}
                <button
                    onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
                    className="hidden md:flex items-center px-3 h-11 transition-all active:scale-95 hover:bg-primary/5 rounded-xl border border-primary/10 group"
                >
                    {isLoggedIn && (profileInfo?.image || userInfo?.image) ? (
                        <img src={profileInfo?.image || userInfo?.image} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all" />
                    ) : (
                        <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <User size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                    )}
                    <span className="ml-2.5 text-[14px] font-bold text-secondary group-hover:text-primary transition-colors tracking-tight">
                        {isLoggedIn ? (profileInfo?.name?.split(' ')[0] || userInfo?.name?.split(' ')[0] || 'Account') : 'Login'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default HomeSearchBar;
