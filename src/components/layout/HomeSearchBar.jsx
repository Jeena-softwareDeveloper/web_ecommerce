import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, ChevronDown, HelpCircle, Download, TrendingUp, Bell } from 'lucide-react';

const HomeSearchBar = ({ transparent = false, onFilter }) => {
    const navigate = useNavigate();
    const { totalItems } = useSelector(state => state.wearCart) || { totalItems: 0 };
    const { token, userInfo } = useSelector(state => state.auth);
    const { profileInfo } = useSelector(state => state.profile);
    const isLoggedIn = !!token;

    const [showMoreMenu, setShowMoreMenu] = useState(false);

    return (
        <div className={`flex items-center px-4 md:px-6 transition-all duration-300 md:bg-transparent md:shadow-none ${
            transparent ? 'bg-transparent py-2.5 md:py-3.5' : 'bg-white/80 backdrop-blur-md pb-4 pt-2 md:py-3 shadow-premium'
        }`}>
            {/* 1. Large Search Bar */}
            <div className="flex-1 flex items-center max-w-4xl">
                <button
                    onClick={() => navigate('/search')}
                    className="w-full flex items-center bg-white border border-primary/20 md:border-2 md:border-primary/30 h-11 md:h-12 px-5 rounded-xl text-left transition-all active:scale-[0.99] shadow-sm hover:border-primary/60 group cursor-pointer"
                >
                    <Search size={20} className="text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                    <div className="ml-4 flex-1 overflow-hidden">
                        <span className="text-[14px] md:text-[15px] text-slate-500 font-medium truncate tracking-tight block">
                            Search for Products, Brands and More
                        </span>
                    </div>
                </button>
            </div>

            {/* 2. Flipkart Style Right Actions Row (Desktop & Mobile Adaptive) */}
            <div className="flex items-center space-x-2 md:space-x-8 ml-4 md:ml-8 shrink-0">
                {/* Account / Login Action (Desktop Only) */}
                <button
                    onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
                    className="hidden md:flex items-center px-3 h-12 transition-all active:scale-95 hover:bg-primary/5 rounded-xl group cursor-pointer"
                >
                    {isLoggedIn && (profileInfo?.image || userInfo?.image) ? (
                        <img src={profileInfo?.image || userInfo?.image} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all" />
                    ) : (
                        <User size={20} className="text-slate-700 group-hover:text-primary transition-colors" />
                    )}
                    <span className="ml-2 text-[14px] md:text-[15px] font-bold text-slate-800 group-hover:text-primary transition-colors tracking-tight hidden md:inline">
                        {isLoggedIn ? (profileInfo?.name?.split(' ')[0] || userInfo?.name?.split(' ')[0] || 'Account') : 'Login'}
                    </span>
                    <ChevronDown size={14} className="ml-1 text-slate-500 group-hover:text-primary transition-transform group-hover:translate-y-0.5 hidden md:inline" />
                </button>

                {/* More Menu Dropdown */}
                <div className="relative hidden md:block">
                    <button
                        onMouseEnter={() => setShowMoreMenu(true)}
                        onMouseLeave={() => setShowMoreMenu(false)}
                        className="flex items-center px-3 h-12 transition-all active:scale-95 hover:bg-primary/5 rounded-xl group cursor-pointer font-bold text-[15px] text-slate-800 hover:text-primary"
                    >
                        <span>More</span>
                        <ChevronDown size={14} className="ml-1 text-slate-500 group-hover:text-primary transition-transform group-hover:translate-y-0.5" />
                    </button>

                    {showMoreMenu && (
                        <div
                            onMouseEnter={() => setShowMoreMenu(true)}
                            onMouseLeave={() => setShowMoreMenu(false)}
                            className="absolute top-12 right-0 w-52 bg-white rounded-2xl shadow-premium border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            <a onClick={() => navigate('/products')} className="flex items-center px-4 py-3 hover:bg-slate-50 text-[14px] font-bold text-slate-700 cursor-pointer transition-colors">
                                <Bell size={16} className="text-secondary mr-3" /> Notification Preferences
                            </a>
                            <a onClick={() => navigate('/support')} className="flex items-center px-4 py-3 hover:bg-slate-50 text-[14px] font-bold text-slate-700 cursor-pointer transition-colors">
                                <HelpCircle size={16} className="text-secondary mr-3" /> 24x7 Customer Care
                            </a>
                            <a onClick={() => navigate('/search')} className="flex items-center px-4 py-3 hover:bg-slate-50 text-[14px] font-bold text-slate-700 cursor-pointer transition-colors">
                                <TrendingUp size={16} className="text-secondary mr-3" /> Trending Campaigns
                            </a>
                            <a onClick={() => navigate('/app')} className="flex items-center px-4 py-3 hover:bg-slate-50 text-[14px] font-bold text-slate-700 cursor-pointer transition-colors border-t border-gray-100">
                                <Download size={16} className="text-primary mr-3" /> Download App
                            </a>
                        </div>
                    )}
                </div>

                {/* Cart Action */}
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center px-2 md:px-3 h-11 md:h-12 relative transition-all active:scale-95 hover:bg-primary/5 rounded-xl group cursor-pointer"
                >
                    <div className="relative">
                        <ShoppingCart size={22} className="text-slate-700 group-hover:text-primary transition-colors shrink-0" />
                        {totalItems > 0 && (
                            <div
                                className="absolute -top-2 -right-2 bg-primary min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-in fade-in zoom-in duration-300"
                                style={{ zIndex: 10 }}
                            >
                                <span className="text-[10px] font-black text-white leading-none">{totalItems}</span>
                            </div>
                        )}
                    </div>
                    <span className="ml-2.5 text-[14px] md:text-[15px] font-bold text-slate-800 group-hover:text-primary transition-colors tracking-tight hidden md:inline">
                        Cart
                    </span>
                </button>
            </div>
        </div>
    );
};

export default HomeSearchBar;
