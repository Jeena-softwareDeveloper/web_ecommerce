import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    RefreshCw, 
    Plus, 
    Scan, 
    ArrowLeft,
    Layers,
    Store,
    Search
} from 'lucide-react';

const InventoryHeader = ({
    activeCount = 0,
    totalStylesCount = 0,
    lowStockCount = 0,
    deadStockCount = 0,
    activeTab = 'all',
    setActiveTab,
    searchTerm = '',
    setSearchTerm,
    onScanClick,
    onAddClick,
    onRefreshClick,
    loader = false
}) => {
    const navigate = useNavigate();

    return (
        <div className="w-full flex flex-col shrink-0">
            
            {/* 1. MOBILE NATIVE HEADER & CONTROLS (Visible on lg:hidden) */}
            <div className="lg:hidden sticky top-0 z-40 flex flex-col w-full gap-3 pb-3 bg-white/95 backdrop-blur-md shrink-0">
                {/* Mobile Top Bar */}
                <div className="px-5 pt-4 pb-2 bg-transparent flex items-center justify-between z-30 shrink-0">
                    <div className="flex items-center">
                        <button 
                            onClick={() => {
                                if (window.history.state && window.history.state.idx > 0) {
                                    navigate(-1);
                                } else {
                                    navigate('/supplier-dashboard');
                                }
                            }}
                            className="bg-purple-600 flex items-center px-3 py-1.5 rounded-lg mr-3 shadow-sm active:scale-95 transition-all"
                        >
                            <ArrowLeft size={16} className="text-white" />
                            <span className="text-white text-[12px] font-black ml-1">Back</span>
                        </button>
                        <span className="text-[20px] font-black text-gray-900 leading-none">Inventory</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onScanClick}
                            className="flex items-center justify-center w-8 h-8 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 shadow-sm"
                        >
                            <Scan size={16} />
                        </button>
                        <button 
                            onClick={onAddClick}
                            className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg shadow-sm"
                        >
                            <Plus size={14} />
                            <span className="text-[11px] font-black uppercase tracking-tight">Add</span>
                        </button>
                        <button onClick={onRefreshClick} className="p-1">
                            <RefreshCw size={18} className={`text-purple-600 ${loader ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="relative w-full px-5">
                    <span className="absolute inset-y-0 left-0 pl-9 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search catalogs, styles, categories..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm outline-none focus:border-purple-500 transition-all placeholder:text-gray-400"
                    />
                </div>

                {/* Mobile Filter Tabs */}
                <div className="flex items-center gap-2 px-5 py-1 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`shrink-0 px-4.5 py-2 rounded-full text-[11px] font-semibold transition-all border ${
                            activeTab === 'all'
                                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        All Products ({totalStylesCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('low_stock')}
                        className={`shrink-0 px-4.5 py-2 rounded-full text-[11px] font-semibold transition-all border ${
                            activeTab === 'low_stock'
                                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Low Stock ({lowStockCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('dead_stock')}
                        className={`shrink-0 px-4.5 py-2 rounded-full text-[11px] font-semibold transition-all border ${
                            activeTab === 'dead_stock'
                                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Dead Stock ({deadStockCount})
                    </button>
                </div>
            </div>

            {/* 2. PREMIUM UNIFIED DESKTOP HEADER (Visible on lg:flex) */}
            <div className="hidden lg:flex flex-row items-center justify-between px-2 pb-4 mb-4 border-b border-gray-100/80 gap-4 w-full shrink-0">
                
                {/* Left Side: Filter Tabs (Pills) as requested by user */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all border ${
                            activeTab === 'all'
                                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        All Products ({totalStylesCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('low_stock')}
                        className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all border ${
                            activeTab === 'low_stock'
                                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Low Stock ({lowStockCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('dead_stock')}
                        className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all border ${
                            activeTab === 'dead_stock'
                                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Dead Stock ({deadStockCount})
                    </button>
                </div>

                {/* Right Side: Same-Row Stats, Search, and Action Buttons! */}
                <div className="flex flex-row items-center gap-3.5 ml-auto flex-nowrap">
                    
                    {/* Compact Stats Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Active Stats Badge */}
                        <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 px-3 py-2 rounded-xl shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Active:</span>
                            <span className="text-xs font-black text-emerald-900">{loader ? '...' : activeCount}</span>
                        </div>

                        {/* Styles Stats Badge */}
                        <div className="flex items-center gap-2 bg-purple-50/60 border border-purple-100 px-3 py-2 rounded-xl shadow-xs">
                            <Layers size={11} className="text-purple-600" />
                            <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider">Styles:</span>
                            <span className="text-xs font-black text-purple-900">{loader ? '...' : totalStylesCount}</span>
                        </div>
                    </div>

                    {/* Integrated Search Input Box */}
                    <div className="relative w-56 shrink-0">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search catalog..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                        />
                    </div>

                    {/* Add New Catalog Button */}
                    <button 
                        onClick={onAddClick}
                        className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-purple-700 shadow-md shadow-purple-600/10 active:scale-95 transition-all shrink-0"
                    >
                        <Plus size={14} />
                        <span>Add New Catalog</span>
                    </button>

                    {/* Refresh Button */}
                    <button 
                        onClick={onRefreshClick}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-purple-600 transition-colors shadow-sm shrink-0"
                        title="Refresh list"
                    >
                        <RefreshCw size={14} className={loader ? 'animate-spin' : ''} />
                    </button>
                </div>

            </div>

        </div>
    );
};

export default InventoryHeader;
