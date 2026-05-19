import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Package, Plus, Search, ChevronRight, Tag, ArrowUpRight, AlertTriangle, Clock, Archive } from 'lucide-react';
import { get_stock_list, get_inventory_alerts, request_listing, messageClear } from '../../store/reducers/supplierStockReducer';
import SupplierFooter from '../../components/layout/SupplierFooter';
import CommonHeader from '../../components/layout/CommonHeader';

const STATUS_LABEL = {
    private: 'Private',
    pending_approval: 'Under Review',
    active: 'Live',
    rejected: 'Rejected'
};

const STATUS_COLOR = {
    private: 'text-gray-500',
    pending_approval: 'text-amber-600',
    active: 'text-green-600',
    rejected: 'text-red-500'
};

const STATUS_BG = {
    private: 'bg-gray-100',
    pending_approval: 'bg-amber-50',
    active: 'bg-green-50',
    rejected: 'bg-red-50'
};

const SupplierStock = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { stocks, loader, successMessage, errorMessage, alerts, alertCount } = useSelector(s => s.supplierStock);

    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [requestingId, setRequestingId] = useState(null);

    useEffect(() => {
        dispatch(get_stock_list('all'));
        dispatch(get_inventory_alerts());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) { toast.success(successMessage); dispatch(messageClear()); }
        if (errorMessage) { toast.error(errorMessage); dispatch(messageClear()); }
    }, [successMessage, errorMessage, dispatch]);

    const filtered = stocks.filter(s => {
        const matchTab = tab === 'all' || s.status === tab;
        const matchSearch = !search || s.styleName.toLowerCase().includes(search.toLowerCase()) ||
            s.styleCode.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const handleRequestListing = async (id, e) => {
        e.stopPropagation();
        setRequestingId(id);
        await dispatch(request_listing({ id, supplierNote: '' }));
        setRequestingId(null);
    };

    const tabs = [
        { key: 'all', label: 'All', count: stocks.length },
        { key: 'private', label: 'Private', count: stocks.filter(s => s.status === 'private').length },
        { key: 'pending_approval', label: 'Review', count: stocks.filter(s => s.status === 'pending_approval').length },
        { key: 'active', label: 'Live', count: stocks.filter(s => s.status === 'active').length },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <CommonHeader title="My Stock" />

            {/* 🔹 Inventory Alert Banner */}
            {alertCount > 0 && (
                <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar sticky top-[52px] md:top-[90px] z-30">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    <div className="flex gap-3 text-[11px] whitespace-nowrap">
                        {alerts.filter(a => a.type === 'low_stock').length > 0 && (
                            <span className="text-amber-700 font-medium">
                                {alerts.filter(a => a.type === 'low_stock').length} Low Stock
                            </span>
                        )}
                        {alerts.filter(a => a.type === 'out_of_stock').length > 0 && (
                            <span className="text-red-600 font-medium">
                                {alerts.filter(a => a.type === 'out_of_stock').length} Out of Stock
                            </span>
                        )}
                        {alerts.filter(a => a.type === 'stockout_soon').length > 0 && (
                            <span className="text-orange-600 font-medium flex items-center gap-1">
                                <Clock size={12} />
                                {alerts.filter(a => a.type === 'stockout_soon').length} Stockout Soon
                            </span>
                        )}
                        {alerts.filter(a => a.type === 'dead_stock').length > 0 && (
                            <span className="text-purple-600 font-medium flex items-center gap-1">
                                <Archive size={12} />
                                {alerts.filter(a => a.type === 'dead_stock').length} Dead Stock
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="pt-[52px] md:pt-[90px]">
                {/* Search bar */}
                <div className="bg-white border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <Search size={15} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by style name or code..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-gray-700 flex-1 min-w-0"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-gray-100 flex overflow-x-auto no-scrollbar">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`shrink-0 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                                tab === t.key
                                    ? 'border-gray-800 text-gray-900'
                                    : 'border-transparent text-gray-400'
                            }`}
                        >
                            {t.label}
                            {t.count > 0 && (
                                <span className={`ml-1.5 text-[10px] ${tab === t.key ? 'text-gray-700' : 'text-gray-400'}`}>
                                    ({t.count})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white mx-0 mt-0">
                    {loader && (
                        <div className="flex justify-center py-12">
                            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
                        </div>
                    )}

                    {!loader && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <Package size={40} className="text-gray-200 mb-3" />
                            <p className="text-sm text-gray-400">No stock entries yet</p>
                            <button
                                onClick={() => navigate('/supplier-stock/add')}
                                className="mt-4 text-xs font-medium text-gray-700 underline"
                            >
                                Add your first product
                            </button>
                        </div>
                    )}

                    {!loader && filtered.length > 0 && (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-[10px] font-medium text-gray-400 px-4 py-2 uppercase tracking-wide">Product</th>
                                    <th className="text-left text-[10px] font-medium text-gray-400 px-2 py-2 uppercase tracking-wide hidden sm:table-cell">Sizes</th>
                                    <th className="text-right text-[10px] font-medium text-gray-400 px-2 py-2 uppercase tracking-wide">Stock</th>
                                    <th className="text-center text-[10px] font-medium text-gray-400 px-2 py-2 uppercase tracking-wide">Status</th>
                                    <th className="text-right text-[10px] font-medium text-gray-400 px-3 py-2 uppercase tracking-wide"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(stock => (
                                    <tr
                                        key={stock._id}
                                        onClick={() => navigate(`/supplier-stock/${stock._id}`)}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Product */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {stock.image ? (
                                                    <img
                                                        src={stock.image}
                                                        alt=""
                                                        className="w-9 h-10 rounded object-cover bg-gray-100 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                                        <Tag size={12} className="text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-medium text-gray-800 truncate max-w-[140px]">{stock.styleName}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{stock.styleCode}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Sizes */}
                                        <td className="px-2 py-3 hidden sm:table-cell">
                                            <p className="text-[11px] text-gray-500">{stock.sizes?.join(', ') || '—'}</p>
                                        </td>

                                        {/* Stock */}
                                        <td className="px-2 py-3 text-right">
                                            <span className={`text-[13px] font-medium ${stock.hasOutOfStock ? 'text-red-500' : stock.hasLowStock ? 'text-amber-600' : 'text-gray-700'}`}>
                                                {stock.totalStock}
                                            </span>
                                            <span className="text-[10px] text-gray-400 ml-1">pcs</span>
                                            {stock.hasLowStock && !stock.hasOutOfStock && (
                                                <p className="text-[9px] text-amber-500 mt-0.5">Low stock</p>
                                            )}
                                            {stock.hasOutOfStock && (
                                                <p className="text-[9px] text-red-400 mt-0.5">Some out</p>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-2 py-3">
                                            <div className="flex justify-center">
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${STATUS_BG[stock.status]} ${STATUS_COLOR[stock.status]}`}>
                                                    {STATUS_LABEL[stock.status]}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-3 py-3 text-right">
                                            {stock.status === 'private' ? (
                                                <button
                                                    onClick={e => handleRequestListing(stock._id, e)}
                                                    disabled={requestingId === stock._id}
                                                    className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 border border-indigo-200 rounded px-2 py-1 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                                                >
                                                    <ArrowUpRight size={11} />
                                                    List
                                                </button>
                                            ) : (
                                                <ChevronRight size={16} className="text-gray-300 ml-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => navigate('/supplier-stock/add')}
                className="fixed bottom-20 right-4 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg z-40 active:scale-95 transition-transform"
            >
                <Plus size={22} className="text-white" />
            </button>

            <SupplierFooter />
        </div>
    );
};

export default SupplierStock;
