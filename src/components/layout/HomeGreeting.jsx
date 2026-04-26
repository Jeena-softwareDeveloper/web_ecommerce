import React, { useEffect } from 'react';
import logo from '../../assets/logo192.png';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, MapPin, ChevronRight } from 'lucide-react';
import { get_cart } from '../../store/reducers/wearCartReducer';
import { get_supplier_status } from '../../store/reducers/vendorReducer';
import { get_addresses } from '../../store/reducers/addressReducer';
import { toast } from "sonner";

import confetti from 'canvas-confetti';

const HomeGreeting = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, userInfo } = useSelector(state => state.auth);
    const { profileInfo } = useSelector(state => state.profile);
    const { supplierStatus } = useSelector(state => state.vendor);
    const { addresses } = useSelector(state => state.address);
    const isLoggedIn = !!token;

    const handleOrganicsClick = () => {
        // Dismiss any existing toasts to prevent stacking
        toast.dismiss();

        // Fire confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#16a34a', '#4ade80', '#ffffff']
        });

        toast("Organics Store Coming Soon!", {
            icon: '🌱',
            duration: 1500,
            position: 'top-center',
            style: {
                borderRadius: '12px',
                background: '#16a34a',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                border: '1px solid #4ade80',
                boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.4)'
            },
        });
    };

    useEffect(() => {
        if (isLoggedIn) {
            // Only fetch cart if not already loaded (cheaper than addresses)
            dispatch(get_cart());
        }
    }, [dispatch, isLoggedIn]);

    const defaultAddress = addresses?.find(a => a.isDefault) || addresses?.[0];
    const displayAddress = defaultAddress 
        ? `${defaultAddress.pincode} - ${defaultAddress.city}, ${defaultAddress.state}`
        : 'Select delivery address';

    return (
        <div className="bg-gradient-to-b from-primary/5 via-white to-white pt-3 pb-2 relative overflow-hidden md:py-0 border-b border-gray-100/10">
            <div className="px-3 md:px-4 flex flex-col space-y-3 md:space-y-0">
                {/* Row 1: Brand Cards & Location (Flipkart Style) */}
                <div className="flex items-center justify-between">
                    {/* Left: Brand Cards */}
                    <div className="flex items-center space-x-2.5">
                        {/* Brand Logo Card */}
                        <div className="bg-gradient-to-r from-rose-50 to-orange-50 px-3 py-1.5 rounded-lg shadow-sm border border-rose-100/50 flex items-center group active:scale-95 transition-all">
                            <img src={logo} alt="Jeenora" className="h-5 w-auto mr-2 drop-shadow-sm" />
                            <span className="text-rose-950 font-bold text-[14px] tracking-tight">
                                Jeenora
                            </span>
                        </div>

                        {/* Organics Card */}
                        <button 
                            onClick={handleOrganicsClick}
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 flex items-center group active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow-premium"
                        >
                            <Briefcase size={13} className="text-emerald-600 mr-2 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-emerald-900 font-bold text-[12px] group-hover:text-emerald-700 transition-colors">Organics</span>
                        </button>
                    </div>

                    {/* Right: Streamlined Location (Desktop Only) or Login (Mobile Only) */}
                    <div className="flex items-center space-x-2">
                        {/* Desktop Location */}
                        <button 
                            onClick={() => navigate('/addresses')}
                            className="hidden md:flex items-center text-right group max-w-[200px] hover:opacity-80 transition-opacity"
                        >
                            <MapPin size={13} className="text-secondary mr-2 shrink-0 group-hover:animate-bounce" />
                            <div className="flex flex-col items-end overflow-hidden">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Delivery to</span>
                                <div className="flex items-center text-primary font-bold text-[12px] tracking-tight">
                                    <span className="truncate">{displayAddress.split('-')[0]}</span>
                                    <ChevronRight size={13} className="ml-1" />
                                </div>
                            </div>
                        </button>

                        {/* Mobile Login Button */}
                        <button
                            onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
                            className="md:hidden flex items-center px-4 py-1.5 rounded-lg border border-blue-100/50 shadow-sm transition-all active:scale-95 bg-gradient-to-r from-blue-50 to-indigo-50 group hover:border-blue-200"
                        >
                            {isLoggedIn && (profileInfo?.image || userInfo?.image) ? (
                                <img src={profileInfo?.image || userInfo?.image} className="w-5.5 h-5.5 rounded-full object-cover border-2 border-white shadow-sm" />
                            ) : (
                                <User size={15} className="text-blue-500 group-hover:text-blue-600 transition-colors" />
                            )}
                            <span className="ml-2 text-[12px] font-bold text-blue-900 uppercase tracking-tight">
                                {isLoggedIn ? 'Account' : 'Login'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeGreeting;
