import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
const { 
    ChevronLeft, Bell, Settings, 
    RefreshCw, Clock, Package, 
    ChevronRight, Play, Headphones,
    Percent, Truck, PlusCircle, X, Check,
    Upload, TrendingUp, DollarSign, ShoppingBag
} = LucideIcons;
import { toast } from "sonner";
import { get_supplier_dashboard_stats, get_notifications, messageClear } from '../../store/reducers/vendorReducer';
import { get_nav_menu } from '../../store/reducers/configReducer';
import SupplierFooter from '../../components/layout/SupplierFooter';
import { 
  StatsCard, 
  GradientCard, 
  ActionGrid,
  DataCard 
} from '../../components/supplier';

const SupplierDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { stats, loader, successMessage, errorMessage, supplierStatus, supplierData, notificationSummary } = useSelector(state => state.vendor);

    useEffect(() => {
        dispatch(get_supplier_dashboard_stats());
        dispatch(get_notifications({ read: false, limit: 1 })); // Just to get the unread count/summary
        dispatch(get_nav_menu('supplier'));
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    // Dynamic Action Extraction
    const { navMenu } = useSelector(state => state.config);
    const navSections = navMenu.supplier || [];
    
    // Flatten Manage Business items for the action grid
    const businessItems = navSections.find(s => s.title === 'Manage Business')?.items || [];
    const dashboardActions = businessItems.map(item => ({
        icon: React.createElement(LucideIcons[item.icon] || LucideIcons.HelpCircle),
        label: item.name,
        subtitle: `Manage ${item.name.toLowerCase()}`,
        onClick: () => navigate(item.path)
    })).slice(0, 4);

    // FALLBACK STATS IF BACKEND IS EMPTY
    const displayStats = {
        pendingConfirmation: stats?.pendingConfirmation || 0,
        pendingShipments: stats?.pendingShipments || 0,
        returnsCount: stats?.returnsCount || 0,
        totalSales: stats?.totalSales || '0',
        totalOrders: stats?.totalOrders || 0
    };

    const renderStatusBanner = () => (
        <div className="bg-orange-50 px-4 sm:px-6 lg:px-8 py-3 flex items-center border-b border-gray-100">
            <LucideIcons.Clock size={16} className="text-orange-500" />
            <p className="text-orange-700 text-xs sm:text-sm font-bold ml-2 sm:ml-3 flex-1">
                Verification Pending: We are reviewing your documents.
            </p>
            <button className="text-orange-700 text-xs font-black underline tracking-tight">HELP</button>
        </div>
    );

    const LinkItem = ({ icon, label, subtitle, badge, colorClass = "text-gray-800", iconBg = "bg-gray-50", iconColor = "text-gray-600", onPress }) => (
        <button onClick={onPress} className="w-full flex items-center py-3 sm:py-4 border-b border-gray-50 active:bg-gray-50 transition-colors px-1 sm:px-2">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconBg} rounded-full flex items-center justify-center mr-3 sm:mr-4`}>
                {React.cloneElement(icon, { size: 18, className: `${iconColor} sm:w-5 sm:h-5` })}
            </div>
            <div className="flex-1 text-left">
                <div className="flex items-center">
                    <span className={`text-sm sm:text-base font-bold ${colorClass} mr-2`}>{label}</span>
                    {badge && (
                        <div className="bg-green-100 px-1.5 py-0.5 rounded">
                            <span className="text-xxs sm:text-xs text-green-700 font-bold uppercase">{badge}</span>
                        </div>
                    )}
                </div>
                {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <LucideIcons.ChevronRight size={20} className="text-gray-400 hidden sm:block" />
        </button>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans pb-20">
            {/* FIXED TOP CONTAINER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                {/* EXACT ANDROID HEADER */}
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-[#7C3AED] flex items-center px-3 py-1.5 rounded-lg mr-3 shadow-sm"
                        >
                            <LucideIcons.ChevronLeft size={16} className="text-white" />
                            <span className="text-white text-xs font-black ml-1">Wear</span>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg font-black text-gray-900 leading-tight">
                                {supplierData?.shopName || 'Welcome Supplier'}
                            </h1>
                            <p className="text-gray-500 text-xs">Let's get your business started</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative" onClick={() => navigate('/supplier-menu')}>
                            <LucideIcons.Bell size={20} className="text-gray-600" />
                            {notificationSummary?.unread > 0 && (
                                <div className="absolute -top-1 -right-1 bg-rose-500 w-3 h-3 rounded-full flex items-center justify-center border-2 border-white">
                                    <span className="text-white text-[8px] font-black">
                                        {notificationSummary.unread > 9 ? '9+' : notificationSummary.unread}
                                    </span>
                                </div>
                            )}
                        </button>
                        <button>
                            <LucideIcons.Settings size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* STEPPER - DYNAMIC UI */}
                <div className="flex justify-between px-4 pb-2">
                    {/* Step 1: Upload Catalogs (Checked if total > 0) */}
                    <div className={`items-center relative pb-2 min-w-[60px] flex flex-col ${stats?.catalogs?.total > 0 ? '' : 'opacity-40'}`}>
                        <span className={`text-xs font-bold ${stats?.catalogs?.total > 0 ? 'text-green-600' : 'text-gray-400'} mb-1 flex items-center gap-1`}>
                            {stats?.catalogs?.total > 0 ? <LucideIcons.Check size={12} /> : '1'}
                        </span>
                        <span className={`text-[9px] font-bold ${stats?.catalogs?.total > 0 ? 'text-green-600' : 'text-gray-400'} uppercase tracking-tighter text-center`}>Upload catalogs</span>
                        {stats?.catalogs?.total > 0 && <div className="absolute -bottom-0.5 w-[120%] h-[2px] bg-green-600" />}
                    </div>

                    {/* Step 2: Catalogs Live (Checked if active > 0) */}
                    <div className={`items-center relative pb-2 min-w-[60px] flex flex-col ${stats?.catalogs?.active > 0 ? '' : 'opacity-40'}`}>
                        <span className={`text-xs font-bold ${stats?.catalogs?.active > 0 ? 'text-green-600' : 'text-gray-400'} mb-1 flex items-center gap-1`}>
                            {stats?.catalogs?.active > 0 ? <LucideIcons.Check size={12} /> : '2'}
                        </span>
                        <span className={`text-[9px] font-bold ${stats?.catalogs?.active > 0 ? 'text-green-600' : 'text-gray-400'} uppercase tracking-tighter text-center`}>Catalogs live</span>
                        {stats?.catalogs?.active > 0 && (
                            <div className="absolute -bottom-0.5 w-[120%] h-[2px] bg-green-600" />
                        )}
                    </div>

                    {/* Step 3: First Order (Checked if totalOrders > 0) */}
                    <div className={`items-center relative pb-2 min-w-[60px] flex flex-col ${stats?.totalOrders > 0 ? '' : 'opacity-40'}`}>
                        <span className={`text-xs font-bold ${stats?.totalOrders > 0 ? 'text-green-600' : 'text-gray-400'} mb-1 flex items-center gap-1`}>
                            {stats?.totalOrders > 0 ? <LucideIcons.Check size={12} /> : '3'}
                        </span>
                        <span className={`text-[9px] font-bold ${stats?.totalOrders > 0 ? 'text-green-600' : 'text-gray-400'} uppercase tracking-tighter text-center`}>First order</span>
                        {stats?.totalOrders > 0 && (
                            <div className="absolute -bottom-0.5 w-[120%] h-[2px] bg-green-600" />
                        )}
                    </div>
                </div>
            </div>

            {/* SPACER for fixed header height */}
            <div className="pt-[100px]" />

            {supplierStatus === 'pending' && renderStatusBanner()}

            <div className="p-4 bg-white flex-1">
                {/* GRADIENT UPLOAD CARD */}
                <GradientCard
                    title="Start Selling"
                    subtitle={{
                        label: "Add products and start selling",
                        value: "On Jeenora"
                    }}
                    icon={LucideIcons.Upload}
                    buttonText="Upload Now"
                    onButtonClick={() => navigate('/supplier-inventory')}
                    className="mb-6"
                />

                <div className="mb-4 flex items-center justify-between px-1">
                    <span className="font-black text-gray-800 text-base">Action Required</span>
                    <LucideIcons.RefreshCw 
                        size={16} 
                        className={`text-gray-400 cursor-pointer ${loader ? 'animate-spin' : ''}`}
                        onClick={() => dispatch(get_supplier_dashboard_stats())}
                    />
                </div>

                {/* PERFORMANCE STATS */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <StatsCard
                        title="To Confirm"
                        value={displayStats.pendingConfirmation}
                        icon={LucideIcons.Clock}
                        iconColor="text-amber-500"
                        onClick={() => navigate('/supplier-orders')}
                        className="cursor-pointer active:bg-gray-50"
                    />
                    <StatsCard
                        title="To Ship"
                        value={displayStats.pendingShipments}
                        icon={LucideIcons.Package}
                        iconColor="text-blue-500"
                        onClick={() => navigate('/supplier-orders')}
                        className="cursor-pointer active:bg-gray-50"
                    />
                    <StatsCard
                        title="Returns"
                        value={displayStats.returnsCount}
                        icon={() => <span className="text-rose-500 font-black text-sm">R</span>}
                        iconColor="text-rose-500"
                        onClick={() => navigate('/supplier-returns')}
                        className="cursor-pointer active:bg-gray-50"
                    />
                </div>

                {/* SALES SUMMARY */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <StatsCard
                        title="Total Sales"
                        value={`₹${displayStats.totalSales}`}
                        icon={LucideIcons.DollarSign}
                        iconColor="text-green-500"
                        bgColor="bg-gray-50"
                        borderColor="border-gray-100"
                    />
                    <StatsCard
                        title="Total Orders"
                        value={displayStats.totalOrders}
                        icon={LucideIcons.ShoppingBag}
                        iconColor="text-primary"
                        bgColor="bg-gray-50"
                        borderColor="border-gray-100"
                    />
                </div>

                {/* DYNAMIC ACTION GRID */}
                <ActionGrid
                    actions={dashboardActions.length > 0 ? dashboardActions : [
                        {
                            icon: <LucideIcons.Headphones />,
                            label: "Live Training",
                            subtitle: "Expert led sessions",
                            onClick: () => {}
                        },
                        {
                            icon: <LucideIcons.Play />,
                            label: "Catalog Prep",
                            subtitle: "Guidelines & templates",
                            onClick: () => {}
                        },
                        {
                            icon: <LucideIcons.Percent />,
                            label: "Pricing Guide",
                            subtitle: "Commission & fees",
                            onClick: () => {}
                        },
                        {
                            icon: <LucideIcons.Truck />,
                            label: "Delivery & Returns",
                            subtitle: "Policy & process",
                            onClick: () => {}
                        }
                    ]}
                    className="mb-6"
                />

                {/* LEARNING RESOURCES */}
                <DataCard
                    title="Learn & Grow On Jeenora"
                    className="mb-6"
                >
                    <div className="space-y-3">
                        <LinkItem 
                            label="Book free live training" 
                            subtitle="Learn to operate and grow your business on Jeenora."
                            icon={<LucideIcons.Headphones />} 
                            iconBg="bg-purple-50" 
                            iconColor="text-purple-700" 
                            badge="Expert Led"
                        />
                        <LinkItem 
                            label="Prepare catalogs for Jeenora"
                            subtitle="Step-by-step guide with templates"
                            icon={<LucideIcons.Play />} 
                            iconBg="bg-rose-50" 
                            iconColor="text-rose-600"
                        />
                        <LinkItem 
                            label="Pricing & commission"
                            subtitle="Understand fees and maximize profit"
                            icon={<LucideIcons.Percent />} 
                            iconBg="bg-blue-50" 
                            iconColor="text-blue-600"
                        />
                        <LinkItem 
                            label="Delivery & Returns"
                            subtitle="Policy, process and best practices"
                            icon={<LucideIcons.Truck />} 
                            iconBg="bg-orange-50" 
                            iconColor="text-orange-600"
                        />
                    </div>
                </DataCard>
            </div>
            <SupplierFooter />
        </div>
    );
};

export default SupplierDashboard;
