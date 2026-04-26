import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_warehouse_data, get_my_catalogs } from '../../store/reducers/vendorReducer';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Warehouse, Package, MapPin, 
    Truck, Users, AlertCircle, CheckCircle,
    RefreshCw, Filter, Search, Plus,
    Edit, Eye, MoreVertical, Download,
    Calendar, Clock, BarChart3, TrendingUp,
    ChevronRight, IndianRupee, Box, Layers
} from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';
import { toast } from "sonner";

const SupplierWarehouse = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { warehouseData, myCatalogs, loader } = useSelector(state => state.vendor);
    
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'locations', 'staff', 'analytics'
    const [filters, setFilters] = useState({
        location: 'all',
        status: 'all',
        search: '',
        lowStock: false
    });

    useEffect(() => {
        dispatch(get_warehouse_data());
        dispatch(get_my_catalogs());
    }, [dispatch]);

    const stats = warehouseData?.stats || {
        totalProducts: 0,
        lowStockItems: 0,
        totalValue: 0,
        locations: 1
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const InventoryCard = ({ product }) => {
        const isLowStock = product.stockQuantity < 10;
        const stockPercentage = Math.min((product.stockQuantity / 100) * 100, 100);
        
        return (
            <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">{product.productName}</h4>
                                <p className="text-gray-500 text-xs">SKU: {product.sku?.slice(-6) || 'N/A'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => navigate(`/product/${product._id}`)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <Eye size={16} className="text-gray-500" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                    <MoreVertical size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Stock Level Indicator */}
                        <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-500 text-xs font-bold">Stock Level</span>
                                <span className={`text-xs font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                    {product.stockQuantity || 0} units
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${isLowStock ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${stockPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-gray-500 text-[10px] font-bold">Location</p>
                                <div className="flex items-center">
                                    <MapPin size={12} className="text-gray-400 mr-1" />
                                    <span className="text-gray-900 text-xs font-bold">WH-01</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-gray-500 text-[10px] font-bold">Value</p>
                                <p className="text-gray-900 text-xs font-bold">{formatCurrency((product.sellingPrice || 0) * (product.stockQuantity || 0))}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isLowStock && (
                                    <div className="flex items-center bg-red-50 px-2 py-1 rounded">
                                        <AlertCircle size={12} className="text-red-600 mr-1" />
                                        <span className="text-red-700 text-[10px] font-bold">Low Stock</span>
                                    </div>
                                )}
                                <span className="text-gray-400 text-xs">
                                    Last updated: Today
                                </span>
                            </div>
                            <button className="text-[#7C3AED] text-xs font-bold flex items-center">
                                <Edit size={12} className="mr-1" />
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const LocationCard = ({ location }) => (
        <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                                <Warehouse size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">{location.name}</h4>
                                <p className="text-gray-500 text-xs">{location.address}</p>
                            </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${location.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {location.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <p className="text-gray-500 text-[10px] font-bold">Products</p>
                            <p className="text-gray-900 text-sm font-black">{location.productCount}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 text-[10px] font-bold">Capacity</p>
                            <p className="text-gray-900 text-sm font-black">{location.capacity}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 text-[10px] font-bold">Staff</p>
                            <p className="text-gray-900 text-sm font-black">{location.staffCount}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
            {/* FIXED HEADER */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                        <button 
                            onClick={() => navigate(-1)}
                            className="bg-[#7C3AED] flex items-center px-3 py-1.5 rounded-lg mr-3 shadow-sm"
                        >
                            <ArrowLeft size={16} className="text-white" />
                            <span className="text-white text-[12px] font-black ml-1">Back</span>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-[18px] font-black text-gray-900 leading-tight">Warehouse Management</h1>
                            <p className="text-gray-500 text-[12px]">Manage inventory, locations & staff</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchWarehouseData}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={loading}
                        >
                            <RefreshCw size={20} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Filter size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-100">
                    {['inventory', 'locations', 'staff', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-center ${activeTab === tab ? 'border-b-2 border-[#7C3AED]' : ''}`}
                        >
                            <span className={`text-[12px] font-bold ${activeTab === tab ? 'text-[#7C3AED]' : 'text-gray-500'}`}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* SPACER */}
            <div className="pt-[120px]" />

            {/* CONTENT */}
            <div className="p-4 flex-1">
                {loader ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* INVENTORY TAB */}
                        {activeTab === 'inventory' && (
                            <div className="space-y-4">
                                {/* WAREHOUSE STATS */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-500 text-[11px] font-bold">Total Products</p>
                                            <Package size={16} className="text-blue-500" />
                                        </div>
                                        <p className="text-gray-900 text-[18px] font-black">{stats.totalProducts || 0}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-500 text-[11px] font-bold">Low Stock</p>
                                            <AlertCircle size={16} className="text-red-500" />
                                        </div>
                                        <p className="text-gray-900 text-[18px] font-black">{stats.lowStockItems || 0}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-500 text-[11px] font-bold">Total Value</p>
                                            <IndianRupee size={16} className="text-green-500" />
                                        </div>
                                        <p className="text-gray-900 text-[18px] font-black">{formatCurrency(stats.totalValue || 0)}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-500 text-[11px] font-bold">Locations</p>
                                            <MapPin size={16} className="text-purple-500" />
                                        </div>
                                        <p className="text-gray-900 text-[18px] font-black">{stats.locations || 0}</p>
                                    </div>
                                </div>

                                {/* QUICK ACTIONS */}
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-900 text-sm font-bold mb-3">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="bg-gray-50 p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
                                            <Plus size={20} className="text-[#7C3AED] mb-2" />
                                            <span className="text-gray-700 text-xs font-bold">Add Stock</span>
                                        </button>
                                        <button className="bg-gray-50 p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
                                            <Download size={20} className="text-[#7C3AED] mb-2" />
                                            <span className="text-gray-700 text-xs font-bold">Export</span>
                                        </button>
                                        <button className="bg-gray-50 p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
                                            <Truck size={20} className="text-[#7C3AED] mb-2" />
                                            <span className="text-gray-700 text-xs font-bold">Dispatch</span>
                                        </button>
                                        <button className="bg-gray-50 p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
                                            <BarChart3 size={20} className="text-[#7C3AED] mb-2" />
                                            <span className="text-gray-700 text-xs font-bold">Reports</span>
                                        </button>
                                    </div>
                                </div>

                                {/* INVENTORY LIST */}
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-900 text-sm font-bold">Inventory</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search inventory..."
                                                    className="w-40 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                    value={filters.search}
                                                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => navigate('/catalog-upload')}
                                                className="bg-[#7C3AED] text-white px-3 py-2 rounded-lg text-xs font-bold">
                                                Add Product
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {warehouseData?.inventory && warehouseData.inventory.length > 0 ? (
                                        warehouseData.inventory
                                            .filter(p => p.productName.toLowerCase().includes(filters.search.toLowerCase()))
                                            .map((product, index) => (
                                                <InventoryCard key={index} product={product} />
                                            ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <Package size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No inventory found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* LOCATIONS TAB */}
                        {activeTab === 'locations' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-900 text-sm font-bold">Warehouse Locations</h3>
                                        <button className="bg-[#7C3AED] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center">
                                            <Plus size={14} className="mr-1" />
                                            Add Location
                                        </button>
                                    </div>
                                    
                                    {warehouseData?.locations?.length > 0 ? (
                                        warehouseData.locations.map((loc, i) => (
                                            <LocationCard key={i} location={loc} />
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <MapPin size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No locations configured</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STAFF TAB */}
                        {activeTab === 'staff' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-900 text-sm font-bold">Warehouse Staff</h3>
                                        <button className="bg-[#7C3AED] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center">
                                            <Plus size={14} className="mr-1" />
                                            Add Staff
                                        </button>
                                    </div>
                                    
                                    {warehouseData?.staff?.length > 0 ? (
                                        <div className="space-y-2">
                                            {warehouseData.staff.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                                            <Users size={16} className="text-purple-600" />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-800">{s.name}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{s.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <Users size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">Staff list is currently empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ANALYTICS TAB */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-900 text-sm font-bold mb-4">Warehouse Analytics</h3>
                                    <div className="space-y-3">
                                        <div className="text-center py-10">
                                            <BarChart3 size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">Projected stock levels and movement analytics</p>
                                            <p className="text-gray-400 text-xs mt-1">Live data synchronizing...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <SupplierFooter />
        </div>
    );
};

export default SupplierWarehouse;
