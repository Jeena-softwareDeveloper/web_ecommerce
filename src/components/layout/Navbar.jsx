import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo192.png';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, User, Search,
    Menu, X, Smartphone,
    MapPin, Plane, ChevronDown
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { get_profile } from '../../store/reducers/profileReducer';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('For You');
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    
    const { token } = useSelector(state => state.auth);
    const { totalItems } = useSelector(state => state.wearCart || { totalItems: 0 });

    const placeholders = [
        "Search for Fashion, Brands and More",
        "Search for 'Premium Sneakers'",
        "Deals on 'Mobiles & Tablets'",
        "Explore 'Home Decor'",
        "Find 'Jeenora Special' Labels"
    ];

    const categories = [
        "For You", "Fashion", "Mobiles", "Beauty", "Electronics", "Home", "Appliances", "Toys"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > lastScrollY && latest > 150) {
            setShowHeader(false);
        } else {
            setShowHeader(true);
        }
        setLastScrollY(latest);
    });

    return (
        <>
            {/* Header Placeholder to prevent layout jumping */}
            <div className="h-[95px] md:h-[110px] w-full bg-fk-gray"></div>

            <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col w-screen shadow-md select-none">
                {/* Top Row: Logo & Menu (Right) */}
                <motion.div 
                    animate={{ height: showHeader ? 'auto' : 0, opacity: showHeader ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white overflow-hidden"
                >
                    <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link to="/" className="flex items-center">
                            <img src={logo} alt="Jeenora" className="w-8 h-8 rounded-md mr-1.5 object-contain" />
                            <span className="text-secondary font-bold text-lg tracking-tight">Jeenora</span>
                            <span className="text-green-600 font-black text-lg tracking-tight ml-1">organics</span>
                        </Link>
                        <div className="hidden md:flex items-center bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-all ml-4">
                            <Plane size={14} className="text-white mr-2" />
                            <span className="text-white text-[10px] font-medium tracking-widest leading-none">Travel</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-secondary/70 space-x-1 cursor-pointer hover:text-secondary transition-all">
                            <MapPin size={14} className="text-green-600" />
                            <span className="text-[10px] font-medium hidden sm:inline">Location</span>
                            <ChevronDown size={14} />
                        </div>
                        <button onClick={() => setIsMenuOpen(true)} className="text-secondary group bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                            <Menu size={22} className="group-active:scale-90 transition-transform" />
                        </button>
                    </div>
                    </div>
                </motion.div>

                {/* Middle Row: Search & Actions (White Theme) */}
                <div className="bg-white border-b border-gray-50">
                    <div className="max-w-7xl mx-auto px-4 pb-4 flex items-center justify-between gap-4">
                    <div 
                        className="flex-1 max-w-2xl mx-auto relative flex items-center bg-gray-50 border border-green-50 rounded-lg px-4 py-2.5 cursor-pointer shadow-sm"
                        onClick={() => navigate('/search')}
                    >
                        <Search className="text-gray-400 mr-2" size={18} />
                        <div className="h-4 overflow-hidden flex-1 relative">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={placeholderIndex}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 text-xs text-gray-400 font-medium whitespace-nowrap"
                                >
                                    {placeholders[placeholderIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-secondary">
                        <Link to="/cart" className="relative p-2 group bg-gray-50 border border-gray-100 rounded-lg">
                            <ShoppingCart size={22} className="text-green-600 group-active:scale-110 transition-transform" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        <Link to={token ? "/profile" : "/login"} className="hidden md:flex items-center p-2 text-secondary">
                            <User size={22} />
                        </Link>
                    </div>
                    </div>
                </div>


                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <div className="fixed inset-0 z-[60] md:hidden">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                className="absolute inset-y-0 right-0 w-4/5 bg-white shadow-2xl flex flex-col"
                            >
                                <div className="bg-white border-b border-gray-100 p-8 flex items-center justify-between text-secondary">
                                    <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                                        <span className="font-bold text-xl tracking-tight text-secondary">Jeenora</span>
                                        <span className="text-green-600 font-black text-xl tracking-tight ml-1">organics</span>
                                    </Link>
                                    <button onClick={() => setIsMenuOpen(false)} className="bg-gray-50 p-2 rounded-full text-gray-400"><X size={24} /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    <SidebarSection title="Account">
                                        <SidebarLink to={token ? "/profile" : "/login"} label={token ? "My Profile" : "Login / Signup"} icon={<User size={18}/>} onClick={() => {
                                            setIsMenuOpen(false);
                                            if (token) dispatch(get_profile());
                                        }} />
                                        <SidebarLink to="/cart" label="My Cart" icon={<ShoppingCart size={18}/>} onClick={() => setIsMenuOpen(false)} />
                                    </SidebarSection>
                                    
                                    <SidebarSection title="Experience">
                                        <SidebarLink to="/products" label="Fresh Organics" icon={<Smartphone size={18} className="text-green-500"/>} onClick={() => setIsMenuOpen(false)} />
                                        <SidebarLink to="/products" label="Best Sellers" icon={<Star size={18}/>} onClick={() => setIsMenuOpen(false)} />
                                    </SidebarSection>
                                </div>

                                <div className="p-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-medium text-gray-400 tracking-widest">
                                    <span>v1.0.0</span>
                                    <span className="italic text-green-600">organics</span>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

const Star = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const SidebarSection = ({ title, children }) => (
    <div className="space-y-4">
        <h4 className="text-[10px] font-medium text-primary uppercase tracking-[4px] px-2">{title}</h4>
        <div className="space-y-1">{children}</div>
    </div>
);

const SidebarLink = ({ to, label, icon, onClick }) => (
    <Link to={to} onClick={onClick} className="flex items-center space-x-3 px-4 py-4 text-sm font-medium text-secondary hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
        <div className="text-gray-400">{icon}</div>
        <span>{label}</span>
    </Link>
);

export default Navbar;
