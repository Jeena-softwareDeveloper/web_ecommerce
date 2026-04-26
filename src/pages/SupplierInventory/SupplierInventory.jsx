import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, RefreshCw, Package, 
    MoreVertical, Power, Box, 
    Tag, IndianRupee, Layers,
    ClipboardList, Plus, Check, Pencil
} from 'lucide-react';
import { toast } from "sonner";
import { get_my_catalogs, update_catalog_status, messageClear } from '../../store/reducers/vendorReducer';
import SupplierFooter from '../../components/layout/SupplierFooter';

const SupplierInventory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { myCatalogs, loader, successMessage, errorMessage } = useSelector(state => state.vendor);

    // FETCH CATALOGS ON MOUNT (Matching Android focus effect logic)
    useEffect(() => {
        dispatch(get_my_catalogs());
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

    const activeCount = myCatalogs?.filter(c => c.status === 'active').length || 0;

    const toggleStatus = (productId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        dispatch(update_catalog_status({ productId, status: newStatus }));
    };

    const StatusBadge = ({ status }) => {
        const configs = {
            active: { color: 'text-green-700', bg: 'bg-green-100', label: 'Accepted' },
            pending: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Pending' },
            rejected: { color: 'text-red-700', bg: 'bg-red-100', label: 'Rejected' },
            inactive: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Inactive' }
        };
        const config = configs[status] || configs.inactive;
        return (
            <div className={`px-2 py-0.5 rounded ${config.bg}`}>
                <span className={`text-[10px] font-bold uppercase ${config.color}`}>{config.label}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans max-w-md mx-auto border-x border-gray-100 pb-20">
            {/* EXACT ANDROID HEADER */}
            <div className="px-5 py-4 bg-white flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center">
                    <button onClick={() => navigate('/supplier-dashboard')} className="mr-4">
                        <ChevronLeft size={24} color="black" />
                    </button>
                    <span className="text-[20px] font-black text-gray-900">Inventory</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/catalog-upload')}
                        className="flex items-center gap-1 bg-[#4834d4] text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm"
                    >
                        <Plus size={14} className="font-bold" />
                        <span className="text-[11px] font-black uppercase tracking-tight">Add</span>
                    </button>
                    <button onClick={() => dispatch(get_my_catalogs())} className={`p-1 ${loader ? 'animate-spin' : ''}`}>
                        <RefreshCw size={18} className="text-[#4834d4]" />
                    </button>
                </div>
            </div>

            {/* STATS ROW */}
            <div className="px-5 py-4 bg-white flex gap-4">
                <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex-1 shadow-sm">
                    <p className="text-green-700 font-bold text-[10px] uppercase tracking-tighter">Active</p>
                    <p className="text-green-900 font-black text-[16px]">{activeCount}</p>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1 shadow-sm">
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter">Total</p>
                    <p className="text-gray-900 font-black text-[16px]">{myCatalogs?.length || 0}</p>
                </div>
            </div>

            <div className="flex-1 bg-gray-50 p-4 space-y-4">
                {loader && myCatalogs.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent animate-spin rounded-full" />
                    </div>
                ) : myCatalogs?.length > 0 ? (
                    myCatalogs.map((item) => (
                        <div 
                            key={item._id}
                            onClick={() => navigate(`/product/${item._id}?demo=true`)}
                            className="bg-white rounded-2xl p-3 flex shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer hover:shadow-md"
                        >
                            <div className="relative">
                                <img 
                                    src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                                    alt="" 
                                    className="w-24 h-32 rounded-xl bg-gray-100 object-cover shadow-inner" 
                                />
                                {item.similarProductsCount > 1 && (
                                    <div className="absolute bottom-1 left-1 right-1 bg-[#4834d4]/90 py-1 rounded-md text-center">
                                        <span className="text-white text-[8px] font-black uppercase tracking-widest">{item.similarProductsCount} Styles Grouped</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 ml-4 py-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-[14px] font-black text-gray-800 flex-1 mr-2 leading-tight line-clamp-2">
                                            {item.productName}
                                        </h3>
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <p className="text-[12px] text-gray-400 font-bold mt-1 uppercase tracking-[1px]">
                                        {item.category}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <span className="text-base font-black text-gray-900">₹{item.price}</span>
                                        <div className="mx-2 w-1 h-1 bg-gray-200 rounded-full" />
                                        <span className="text-[11px] text-gray-500 font-bold tracking-tight">{item.variants?.length || 0} Size Variant{item.variants?.length !== 1 ? 's' : ''}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-500 gap-1.5">
                                            <Box size={14} className="text-gray-400" />
                                            <span className="text-[11px] font-medium">
                                                Stock: <span className="text-gray-900 font-bold">{item.variants?.reduce((a, b) => a + (b.stock || 0), 0) || 0} pcs</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* EDIT BUTTON */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate('/catalog-upload', { state: { editCatalogId: item.catalogId || item._id } }); }}
                                                className="w-8 h-8 flex items-center justify-center bg-purple-50 text-[#7C3AED] rounded-lg active:scale-95 transition-all shadow-sm"
                                            >
                                                <Pencil size={13} />
                                            </button>

                                            {(item.status === 'active' || item.status === 'inactive') && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleStatus(item._id, item.status); }}
                                                    className={`px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm ${item.status === 'active' ? 'bg-rose-50' : 'bg-green-50'}`}
                                                >
                                                    <span className={`text-[10px] font-black uppercase tracking-tight ${item.status === 'active' ? 'text-red-600' : 'text-green-600'}`}>
                                                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center mt-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ClipboardList size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-[18px] font-bold text-gray-800 mb-2">Inventory Empty</h3>
                        <p className="text-gray-500 text-sm leading-relaxed px-4 font-medium">Once you upload your catalogs and they go live, you can manage your stock levels here.</p>
                        <button onClick={() => navigate('/catalog-upload')} className="mt-8 bg-[#4834d4] px-10 py-3 rounded-lg text-white font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all tracking-wide">
                            Add Products
                        </button>
                    </div>
                )}
            </div>

            <SupplierFooter />
        </div>
    );
};

export default SupplierInventory;
