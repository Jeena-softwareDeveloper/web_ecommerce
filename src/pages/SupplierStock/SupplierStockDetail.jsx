import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ChevronLeft, Package, Tag, ArrowUpRight,
    Edit2, Check, X, AlertTriangle, Loader2,
    Clock, Archive, MapPin, BarChart3
} from 'lucide-react';
import {
    get_stock_detail, request_listing,
    update_variant_stock, update_warehouse_location,
    messageClear
} from '../../store/reducers/supplierStockReducer';
import SupplierFooter from '../../components/layout/SupplierFooter';

const STATUS_LABEL = {
    private: 'Private — Not Listed',
    pending_approval: 'Under Admin Review',
    active: 'Live on Jeenora',
    rejected: 'Rejected by Admin'
};
const STATUS_COLOR = {
    private: 'text-gray-600',
    pending_approval: 'text-amber-600',
    active: 'text-green-600',
    rejected: 'text-red-500'
};

const LOW_STOCK_THRESHOLD = 5;

const SupplierStockDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentStock: stock, loader, successMessage, errorMessage } = useSelector(s => s.supplierStock);

    // Inline stock edit state: { color_size: editingQty }
    const [editing, setEditing] = useState(null); // { color, size, qty }
    const [saving, setSaving] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [showWarehouseEdit, setShowWarehouseEdit] = useState(false);
    const [warehouseInput, setWarehouseInput] = useState('');

    useEffect(() => {
        dispatch(get_stock_detail(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (successMessage) { toast.success(successMessage); dispatch(messageClear()); dispatch(get_stock_detail(id)); }
        if (errorMessage) { toast.error(errorMessage); dispatch(messageClear()); }
    }, [successMessage, errorMessage, dispatch, id]);

    const handleSaveQty = async () => {
        if (!editing) return;
        setSaving(true);
        await dispatch(update_variant_stock({ id, color: editing.color, size: editing.size, newStock: editing.qty }));
        setEditing(null);
        setSaving(false);
    };

    const handleRequestListing = async () => {
        setRequesting(true);
        await dispatch(request_listing({ id, supplierNote: '' }));
        setRequesting(false);
    };

    if (loader && !stock) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!stock) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-3">
                <Package size={40} className="text-gray-200" />
                <p className="text-sm text-gray-400">Stock not found</p>
                <button onClick={() => navigate('/supplier-stock')} className="text-xs underline text-gray-500">Go back</button>
            </div>
        );
    }

    const totalStock = stock.variants.reduce((s, v) => s + v.stock, 0);
    const totalReserved = stock.variants.reduce((s, v) => s + (v.reservedStock || 0), 0);
    const availableStock = totalStock - totalReserved;
    const lowStockVariants = stock.variants.filter(v => {
        const avail = v.stock - (v.reservedStock || 0);
        return avail > 0 && avail <= (stock.reorderLevel || LOW_STOCK_THRESHOLD);
    });
    const outOfStock = stock.variants.filter(v => (v.stock - (v.reservedStock || 0)) <= 0);

    // Group variants by color
    const byColor = stock.variants.reduce((acc, v) => {
        if (!acc[v.color]) acc[v.color] = [];
        acc[v.color].push(v);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 pb-24">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
                <button onClick={() => navigate('/supplier-stock')} className="p-1.5 -ml-1 text-gray-500">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{stock.styleName}</p>
                    <p className="text-[10px] text-gray-400">{stock.styleCode}</p>
                </div>
                <button
                    onClick={() => navigate(`/supplier-stock/edit/${id}`)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                >
                    <Edit2 size={16} />
                </button>
            </div>

            {/* Status Banner */}
            <div className={`px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between`}>
                <span className={`text-xs font-medium ${STATUS_COLOR[stock.status]}`}>
                    {STATUS_LABEL[stock.status]}
                </span>
                {stock.status === 'rejected' && stock.adminNote && (
                    <span className="text-[10px] text-red-400 max-w-[200px] text-right leading-tight">{stock.adminNote}</span>
                )}
                {(stock.status === 'private' || stock.status === 'rejected') && (
                    <button
                        onClick={handleRequestListing}
                        disabled={requesting}
                        className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                    >
                        {requesting
                            ? <Loader2 size={11} className="animate-spin" />
                            : <ArrowUpRight size={11} />
                        }
                        Request to List
                    </button>
                )}
            </div>

            {/* Summary Cards — Updated with available/reserved */}
            <div className="px-4 pt-4 pb-2">
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                        <p className="text-xl font-medium text-gray-900">{totalStock}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
                    </div>
                    <div className="bg-white border border-green-100 rounded-xl p-3 text-center">
                        <p className="text-xl font-medium text-green-600">{availableStock}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Available</p>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-xl p-3 text-center">
                        <p className="text-xl font-medium text-blue-500">{totalReserved}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Reserved</p>
                    </div>
                    <div className={`bg-white border rounded-xl p-3 text-center ${lowStockVariants.length > 0 ? 'border-amber-200' : 'border-gray-100'}`}>
                        <p className={`text-xl font-medium ${lowStockVariants.length > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                            {lowStockVariants.length}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Low</p>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockVariants.length > 0 && (
                <div className="mx-4 mb-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-medium text-amber-700">Low Stock Alert</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">
                            {lowStockVariants.map(v => `${v.color}/${v.size} (${v.stock} left)`).join(' · ')}
                        </p>
                    </div>
                </div>
            )}

            {/* 🔹 AI Predictions Card */}
            <div className="mx-4 mb-3">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-indigo-100 flex items-center gap-2">
                        <BarChart3 size={14} className="text-indigo-500" />
                        <span className="text-xs font-medium text-indigo-700">AI Inventory Insights</span>
                    </div>
                    <div className="grid grid-cols-2 gap-0">
                        {stock.stockoutDate && (
                            <div className="px-4 py-3 border-r border-b border-indigo-100">
                                <p className="text-[10px] text-indigo-400 font-medium">Predicted Stockout</p>
                                <p className="text-sm font-medium text-indigo-600 mt-0.5">
                                    {new Date(stock.stockoutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </p>
                                <p className="text-[10px] text-indigo-400 mt-0.5">
                                    {Math.max(0, Math.ceil((new Date(stock.stockoutDate) - new Date()) / (1000*60*60*24)))} days left
                                </p>
                            </div>
                        )}
                        {stock.isDeadStock && (
                            <div className="px-4 py-3 border-b border-indigo-100">
                                <p className="text-[10px] text-purple-400 font-medium flex items-center gap-1">
                                    <Archive size={10} /> Dead Stock
                                </p>
                                <p className="text-[11px] text-purple-600 mt-0.5">No movement in 90+ days</p>
                                <p className="text-[10px] text-purple-400 mt-0.5">Consider discounting</p>
                            </div>
                        )}
                        <div className="px-4 py-3">
                            <p className="text-[10px] text-gray-400 font-medium">Reorder Level</p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">{stock.reorderLevel || 5} pcs</p>
                        </div>
                        {stock.lastMovementAt && (
                            <div className="px-4 py-3">
                                <p className="text-[10px] text-gray-400 font-medium">Last Activity</p>
                                <p className="text-sm font-medium text-gray-700 mt-0.5">
                                    {new Date(stock.lastMovementAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="mx-4 mb-3 bg-white border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                    <tbody>
                        <tr className="border-b border-gray-50">
                            <td className="px-4 py-2.5 text-gray-400">Category</td>
                            <td className="px-4 py-2.5 text-gray-700 text-right">{stock.category}</td>
                        </tr>
                        <tr className="border-b border-gray-50">
                            <td className="px-4 py-2.5 text-gray-400">HSN Code</td>
                            <td className="px-4 py-2.5 text-gray-700 text-right">{stock.hsnCode}</td>
                        </tr>
                        <tr className="border-b border-gray-50">
                            <td className="px-4 py-2.5 text-gray-400">GST</td>
                            <td className="px-4 py-2.5 text-gray-700 text-right">{stock.gstPercent}%</td>
                        </tr>
                        <tr className="border-b border-gray-50">
                            <td className="px-4 py-2.5 text-gray-400">Warehouse</td>
                            <td className="px-4 py-2.5 text-right">
                                {showWarehouseEdit ? (
                                    <div className="flex items-center gap-1 justify-end">
                                        <input
                                            type="text"
                                            value={warehouseInput}
                                            onChange={e => setWarehouseInput(e.target.value)}
                                            className="w-28 border border-gray-300 rounded px-2 py-1 text-xs outline-none"
                                            autoFocus
                                            placeholder="Rack / Shelf"
                                        />
                                        <button onClick={async () => {
                                            if (warehouseInput.trim()) {
                                                await dispatch(update_warehouse_location({ id: stock._id, warehouseLocation: warehouseInput }));
                                            }
                                            setShowWarehouseEdit(false);
                                        }} className="p-1 text-green-600"><Check size={12} /></button>
                                        <button onClick={() => setShowWarehouseEdit(false)} className="p-1 text-gray-400"><X size={12} /></button>
                                    </div>
                                ) : (
                                    <button onClick={() => { setWarehouseInput(stock.warehouseLocation || ''); setShowWarehouseEdit(true); }}
                                        className="flex items-center gap-1 justify-end text-gray-700 hover:text-indigo-600">
                                        <MapPin size={10} />
                                        <span className="text-xs">{stock.warehouseLocation || '— Add'}</span>
                                    </button>
                                )}
                            </td>
                        </tr>
                        {stock.fabricDetails && (
                            <tr className="border-b border-gray-50">
                                <td className="px-4 py-2.5 text-gray-400">Fabric</td>
                                <td className="px-4 py-2.5 text-gray-700 text-right">{stock.fabricDetails}</td>
                            </tr>
                        )}
                        {stock.washCare && (
                            <tr>
                                <td className="px-4 py-2.5 text-gray-400">Wash Care</td>
                                <td className="px-4 py-2.5 text-gray-700 text-right">{stock.washCare}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Variants by Color — with inline stock edit */}
            <p className="px-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">Variants & Stock</p>
            {Object.entries(byColor).map(([color, variants]) => (
                <div key={color} className="mx-4 mb-3 bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">{color}</span>
                        <span className="text-[10px] text-gray-400">({variants.length} sizes)</span>
                    </div>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left px-4 py-2 text-[10px] text-gray-400 font-medium">Size</th>
                                <th className="text-right px-2 py-2 text-[10px] text-gray-400 font-medium">Total</th>
                                <th className="text-right px-2 py-2 text-[10px] text-gray-400 font-medium">Reserved</th>
                                <th className="text-right px-2 py-2 text-[10px] text-gray-400 font-medium">Avail</th>
                                <th className="text-right px-2 py-2 text-[10px] text-gray-400 font-medium">List ₹</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {variants.map((v, i) => {
                                const isEditing = editing?.color === v.color && editing?.size === v.size;
                                const available = v.stock - (v.reservedStock || 0);
                                const isLow = available > 0 && available <= (stock.reorderLevel || LOW_STOCK_THRESHOLD);
                                const isOut = available <= 0;
                                return (
                                    <tr key={i} className={isOut ? 'opacity-50' : ''}>
                                        <td className="px-4 py-2.5 text-gray-700 font-medium">{v.size}</td>
                                        <td className="px-2 py-2.5 text-right">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editing.qty}
                                                    onChange={e => setEditing(prev => ({ ...prev, qty: e.target.value }))}
                                                    className="w-14 border border-gray-300 rounded px-1.5 py-1 text-right text-xs outline-none focus:border-gray-500"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-gray-700">{v.stock}</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2.5 text-right text-blue-500 font-medium">
                                            {v.reservedStock || 0}
                                        </td>
                                        <td className="px-2 py-2.5 text-right">
                                            <span className={`font-bold ${isLow ? 'text-amber-600' : isOut ? 'text-red-500' : 'text-green-600'}`}>
                                                {available}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 text-right text-gray-600">₹{v.listingPrice}</td>
                                        <td className="px-3 py-2.5 text-right">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={handleSaveQty}
                                                        disabled={saving}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                    </button>
                                                    <button onClick={() => setEditing(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setEditing({ color: v.color, size: v.size, qty: v.stock })}
                                                    className="p-1 text-gray-300 hover:text-gray-500"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* Images */}
            {stock.images?.length > 0 && (
                <>
                    <p className="px-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">Images</p>
                    <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
                        {stock.images.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt=""
                                className="w-20 h-24 rounded-xl object-cover bg-gray-100 border border-gray-100 shrink-0"
                            />
                        ))}
                    </div>
                </>
            )}

            <SupplierFooter />
        </div>
    );
};

export default SupplierStockDetail;
