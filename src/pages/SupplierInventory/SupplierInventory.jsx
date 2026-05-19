import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, 
    Plus, 
    Pencil,
    Barcode as BarcodeIcon, 
    X, 
    Printer,
    Scan, 
    Trash2, 
    ArrowLeft,
    Layers,
    Eye,
    Store,
    ChevronDown,
    Search,
    ChevronUp
} from 'lucide-react';
import ReactBarcode from 'react-barcode';
import { toast } from "sonner";
import { 
    get_my_catalogs, 
    update_catalog_status, 
    scan_product_by_sku, 
    get_catalog_details, 
    messageClear, 
    delete_catalog 
} from '../../store/reducers/vendorReducer';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import VariantSubTable from '../../components/common/VariantSubTable';
import PageHeader from '../../components/common/PageHeader';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import InventoryHeader from './InventoryHeader';

// Compact Mobile-Only Status Badge
const MobileStatusBadge = ({ status }) => {
    const configs = {
        active: { color: 'text-green-700 bg-green-50 border-green-100', label: 'Active' },
        pending: { color: 'text-amber-700 bg-amber-50 border-amber-100', label: 'Pending' },
        rejected: { color: 'text-red-700 bg-red-50 border-red-100', label: 'Rejected' },
        inactive: { color: 'text-gray-600 bg-gray-50 border-gray-100', label: 'Inactive' }
    };
    const config = configs[status] || configs.inactive;
    return (
        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${config.color}`}>
            {config.label}
        </span>
    );
};

const SupplierInventory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { myCatalogs, loader, successMessage, errorMessage } = useSelector(state => state.vendor);

    // Unified Search Term State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'low_stock', 'dead_stock'
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Fetch Catalogs on mount
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

    // Listen for Scan SKU Barcode triggers from main layout header
    useEffect(() => {
        const handleOpenScan = () => setIsScanModalOpen(true);
        window.addEventListener('open-scan-barcode-modal', handleOpenScan);
        return () => window.removeEventListener('open-scan-barcode-modal', handleOpenScan);
    }, []);

    const activeCount = myCatalogs?.filter(c => c.status === 'active').length || 0;

    const toggleStatus = (productId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        dispatch(update_catalog_status({ productId, status: newStatus }));
    };

    const handleDelete = (productId) => {
        setDeleteConfirmId(productId);
    };

    const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState(null);
    const [selectedCatalogStyles, setSelectedCatalogStyles] = useState(null);
    const [expandedCatalogs, setExpandedCatalogs] = useState({});
    
    // Scan Feature State
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [scanInput, setScanInput] = useState('');
    const [scannedProduct, setScannedProduct] = useState(null);
    const [fetchingIds, setFetchingIds] = useState({});
    const [selectedProductVariants, setSelectedProductVariants] = useState(null);

    // Mobile Expand/Collapse Logic
    const toggleExpandMobile = async (item) => {
        const id = item._id;
        const catalogId = item.catalogId || id;
        
        if (!expandedCatalogs[id] && (!item.similarProducts || item.similarProducts.length === 0)) {
            setFetchingIds(prev => ({ ...prev, [id]: true }));
            await dispatch(get_catalog_details(catalogId));
            setFetchingIds(prev => ({ ...prev, [id]: false }));
        }
        
        setExpandedCatalogs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Desktop Styles Modal
    const handleOpenStyles = async (item) => {
        const id = item._id;
        const catalogId = item.catalogId || id;
        
        if (!item.similarProducts || item.similarProducts.length === 0) {
            setFetchingIds(prev => ({ ...prev, [id]: true }));
            await dispatch(get_catalog_details(catalogId));
            setFetchingIds(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleOpenBarcode = async (item) => {
        const id = item._id;
        const catalogId = item.catalogId || id;
        
        if (!item.variants || item.variants.length === 0) {
            setFetchingIds(prev => ({ ...prev, [id]: true }));
            await dispatch(get_catalog_details(catalogId));
            setFetchingIds(prev => ({ ...prev, [id]: false }));
        }
        setSelectedBarcodeProduct(item);
    };

    const handleScanSearch = async (e) => {
        e.preventDefault();
        if (!scanInput.trim()) return;

        const query = scanInput.trim().toUpperCase();
        try {
            const result = await dispatch(scan_product_by_sku(query)).unwrap();
            if (result.success && result.product) {
                setScannedProduct(result.product);
                toast.success('Product found!');
            }
        } catch (error) {
            setScannedProduct(null);
            toast.error(error.error || 'Product not found for this SKU');
        }
        setScanInput('');
    };

    // Helper to calculate stock parameters for a product/catalog
    const getStockStats = (item) => {
        const total = item.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
        const reserved = item.variants?.reduce((acc, v) => acc + (v.reservedStock || 0), 0) || 0;
        const available = Math.max(0, total - reserved);
        const reorder = item.variants?.[0]?.reorderLevel || 5;
        return { total, reserved, available, reorder };
    };

    // Dynamic Counts for stock categories
    const lowStockCount = myCatalogs?.filter(item => {
        const { available, reorder } = getStockStats(item);
        return available > 0 && available <= reorder;
    }).length || 0;

    const deadStockCount = myCatalogs?.filter(item => {
        const { available } = getStockStats(item);
        return available === 0;
    }).length || 0;

    // Filter catalogs locally for search & active stock tabs (both mobile and desktop)
    const filteredCatalogs = myCatalogs?.filter(item => {
        // 1. Filter by Stock Tab
        const { available, reorder } = getStockStats(item);
        if (activeTab === 'low_stock') {
            if (!(available > 0 && available <= reorder)) return false;
        } else if (activeTab === 'dead_stock') {
            if (available !== 0) return false;
        }

        // 2. Filter by Search Term
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            item.productName?.toLowerCase().includes(searchLower) ||
            item.category?.toLowerCase().includes(searchLower) ||
            item.hsnCode?.toLowerCase().includes(searchLower)
        );
    }) || [];

    // Desktop Columns mapping
    const columns = [
        {
            key: 'catalog_id',
            label: 'Catalog ID',
            render: (row) => (
                <span className="font-mono bg-gray-100 border border-gray-200/60 px-2.5 py-1 rounded-lg shadow-xs">
                    {row._id.slice(-8).toUpperCase()}
                </span>
            )
        },
        {
            key: 'product_name',
            label: 'Product Name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 bg-gray-50 rounded-lg border border-gray-200/50 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        <img 
                            src={row.images?.[0] || ''} 
                            alt="" 
                            className="w-full h-full object-cover" 
                        />
                        {row.similarProductsCount > 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-purple-600 w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
                                <Layers size={8} color="white" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate max-w-[150px]" title={row.productName}>
                            {row.productName.includes('(') ? row.productName.split('(')[0].trim() : row.productName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 opacity-70">
                            {row.similarProductsCount > 1 && (
                                <span className="bg-purple-50 text-purple-700 px-1 rounded">
                                    {row.similarProductsCount} Styles
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'category',
            label: 'Category',
            render: (row) => (
                <span className="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60 shadow-xs uppercase">
                    {row.category}
                </span>
            )
        },
    ];

    // Reusable actions array mapping
    const tableActions = [
        {
            icon: <BarcodeIcon size={14} />,
            label: 'Barcode',
            onClick: (row) => handleOpenBarcode(row)
        },
        {
            icon: <Pencil size={13} />,
            label: 'Edit',
            onClick: (row) => navigate('/catalog-upload', { state: { editCatalogId: row.catalogId || row._id } })
        },
        {
            icon: <Trash2 size={13} />,
            label: 'Delete',
            onClick: (row) => handleDelete(row._id),
            colorClass: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
        },
        {
            icon: <Eye size={13} />,
            label: 'Details',
            onClick: (row) => {
                if (row.similarProductsCount > 1) {
                    handleOpenStyles(row);
                } else {
                    navigate(`/product/${row._id}?demo=true`, { state: { from: location.pathname } });
                }
            }
        }
    ];

    const renderDesktopSubTable = (item) => {
        const catalogId = item._id;
        const currentStyles = myCatalogs?.find(c => c._id === catalogId) || item;
        const subProducts = currentStyles.similarProducts || [];

        const subActions = [
            {
                icon: <BarcodeIcon size={12} />,
                title: 'Barcode Label',
                onClick: (sub) => handleOpenBarcode(sub),
            },
            {
                icon: <Pencil size={12} />,
                title: 'Edit Variant',
                onClick: (sub) => navigate('/catalog-upload', { state: { editCatalogId: sub.catalogId || sub._id } }),
            },
            {
                icon: <Trash2 size={12} />,
                title: 'Delete Style',
                onClick: (sub) => handleDelete(sub._id),
                colorClass: 'p-1.5 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 hover:text-rose-700 rounded-lg shadow-xs cursor-pointer',
            },
            {
                icon: null,
                title: 'Toggle Status',
                onClick: (sub) => toggleStatus(sub._id, sub.status),
                // Render label dynamically in component — passed as renderLabel
                renderLabel: (sub) => sub.status === 'active' ? 'Off' : 'On',
                colorClass: null, // handled via renderLabel path
                isToggle: true,
                getStatus: (sub) => sub.status,
            },
        ];

        return (
            <VariantSubTable
                subProducts={subProducts}
                isLoading={fetchingIds[catalogId]}
                actions={subActions}
                onRowClick={(sub) => setSelectedProductVariants(sub)}
            />
        );
    };

    // Resolve current catalog listing based on style model
    const currentStylesCatalog = myCatalogs?.find(c => c._id === selectedCatalogStyles?._id) || selectedCatalogStyles;

    return (
        <div className="lg:h-full h-auto w-full bg-transparent flex flex-col lg:overflow-hidden overflow-visible">
            
            {/* INVENTORY FILTER TOOLBAR */}
            <InventoryHeader 
                activeCount={activeCount}
                totalStylesCount={myCatalogs?.length || 0}
                lowStockCount={lowStockCount}
                deadStockCount={deadStockCount}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onScanClick={() => setIsScanModalOpen(true)}
                onAddClick={() => navigate('/catalog-upload')}
                onRefreshClick={() => dispatch(get_my_catalogs())}
                loader={loader}
            />

            {/* DESKTOP FLAT TABLE LAYOUT (lg:block hidden) */}
            <div className="hidden lg:block bg-transparent border-0 rounded-none shadow-none p-0 lg:p-0">
                <ResponsiveTable 
                    maxHeight="calc(100vh - 200px)"
                    columns={columns}
                    data={filteredCatalogs || []}
                    isLoading={loader && (!myCatalogs || myCatalogs.length === 0)}
                    emptyStateText="Your inventory catalog is empty. Upload your products and they will display in a beautiful, structured grid here."
                    actions={tableActions}
                    searchPlaceholder="Search product names, categories, or HSN keys..."
                    hideSearch={true}
                    isRowExpandable={ (row) => row.similarProductsCount > 1 }
                    onRowExpand={ (row) => handleOpenStyles(row) }
                    expandableRowRenderer={ (row) => renderDesktopSubTable(row) }
                    onRowClick={ (row) => navigate(`/product/${row._id}?demo=true`, { state: { from: location.pathname } }) }
                />
            </div>

            {/* MOBILE NATIVE EXPANDABLE LIST LAYOUT (lg:hidden block) */}
            <div className="lg:hidden flex flex-col gap-4 pt-4 px-5 pb-32">

                {/* Mobile Listings List */}
                {loader && (!myCatalogs || myCatalogs.length === 0) ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-lg p-4 flex gap-4 border border-gray-100 animate-pulse">
                                <div className="w-16 h-20 bg-gray-100 rounded-xl" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                                    <div className="h-3 bg-gray-50 rounded w-1/3" />
                                    <div className="h-7 bg-gray-50 rounded w-1/2 mt-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCatalogs.length > 0 ? (
                    filteredCatalogs.map((item) => {
                        const isExpanded = expandedCatalogs[item._id];
                        const hasMultiple = item.similarProductsCount > 1;

                        return (
                            <div key={item._id} className="bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300">
                                
                                {/* Mobile Header Card View */}
                                <div 
                                    onClick={() => hasMultiple ? toggleExpandMobile(item) : navigate(`/product/${item._id}?demo=true`, { state: { from: location.pathname } })}
                                    className="p-3.5 flex items-start justify-between cursor-pointer active:bg-gray-50 transition-colors"
                                >
                                    <div className="flex gap-3.5 min-w-0">
                                        <div className="relative shrink-0">
                                            <img 
                                                src={item.images?.[0] || ''} 
                                                alt="" 
                                                className="w-14 h-18 rounded-xl bg-gray-50 object-cover border border-gray-100 shadow-sm" 
                                            />
                                            {hasMultiple && (
                                                <div className="absolute -bottom-1 -right-1 bg-purple-600 w-5 h-5 rounded-full flex items-center justify-center border border-white shadow">
                                                    <Layers size={9} color="white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex flex-col justify-between py-0.5">
                                            <div>
                                                <h3 className="text-xs font-black text-gray-800 leading-tight line-clamp-2">
                                                    {item.productName.includes('(') ? item.productName.split('(')[0].trim() : item.productName}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                    <span className="text-[8.5px] text-gray-400 font-extrabold uppercase">{item.category}</span>
                                                    {hasMultiple && (
                                                        <span className="bg-purple-100 text-purple-700 text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase">
                                                            {item.similarProductsCount} Styles
                                                        </span>
                                                    )}
                                                    {item.hsnCode && (
                                                        <span className="bg-amber-50 text-amber-700 text-[8.5px] px-1.5 py-0.5 rounded font-bold border border-amber-100 uppercase">
                                                            HSN: {item.hsnCode}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-gray-900 mt-1.5 block">
                                                {hasMultiple ? 'From ' : ''}₹{item.variants?.[0]?.listingPrice || item.price || '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action button triggers / Expand icon right side */}
                                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                                        <MobileStatusBadge status={item.status} />
                                        {hasMultiple && (
                                            <div className={`p-1.5 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-gray-100 text-purple-600' : 'bg-purple-50 text-purple-600'}`}>
                                                <ChevronDown size={14} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Compact inline actions for single style mobile item */}
                                {!hasMultiple && (
                                    <div className="px-3.5 pb-3 flex items-center justify-between border-t border-gray-50 pt-2.5 gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenBarcode(item); }}
                                                className="w-7 h-7 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 rounded-lg active:scale-90 transition-all"
                                                title="SKU Barcode"
                                            >
                                                {fetchingIds[item._id] ? (
                                                    <div className="w-3 h-3 border border-purple-600 border-t-transparent animate-spin rounded-full" />
                                                ) : (
                                                    <BarcodeIcon size={12} />
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate('/catalog-upload', { state: { editCatalogId: item.catalogId || item._id } }); }}
                                                className="w-7 h-7 flex items-center justify-center bg-purple-50 border border-purple-100 text-purple-600 rounded-lg active:scale-90 transition-all"
                                                title="Edit product"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                                                className="w-7 h-7 flex items-center justify-center bg-rose-50 border border-rose-100 text-rose-600 rounded-lg active:scale-90 transition-all"
                                                title="Delete catalog"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                        {(item.status === 'active' || item.status === 'inactive') && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleStatus(item._id, item.status); }}
                                                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border active:scale-95 transition-all ${
                                                    item.status === 'active' 
                                                        ? 'bg-rose-50 border-rose-100 text-rose-600' 
                                                        : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                }`}
                                            >
                                                {item.status === 'active' ? 'Disable' : 'Enable'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* MOBILE EXPANDABLE ACCORDION FOR MULTIPLE STYLES */}
                                <AnimatePresence>
                                    {hasMultiple && isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-gray-50/50"
                                        >
                                            <div className="p-3 space-y-2.5">
                                                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest pl-1 leading-none">Styles of this Catalog</p>
                                                {fetchingIds[item._id] ? (
                                                    <div className="space-y-2">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="bg-white rounded-lg p-3 flex animate-pulse">
                                                                <div className="w-10 h-14 bg-gray-150 rounded-lg" />
                                                                <div className="flex-1 ml-3 space-y-1.5 py-1">
                                                                    <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                                                                    <div className="h-3 bg-gray-50 rounded w-1/3" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : item.similarProducts?.map((subProduct) => (
                                                    <div 
                                                        key={subProduct._id}
                                                        className="bg-white rounded-lg p-3 flex flex-col shadow-xs"
                                                    >
                                                        <div 
                                                            onClick={() => setSelectedProductVariants(subProduct)}
                                                            className="flex items-center gap-3 cursor-pointer hover:opacity-85 active:opacity-75 transition-all"
                                                        >
                                                            <img 
                                                                src={subProduct.images?.[0] || ''} 
                                                                alt="" 
                                                                className="w-10 h-14 rounded-lg bg-gray-50 object-cover border" 
                                                            />
                                                            <div className="flex-1 min-w-0 py-0.5">
                                                                <div className="flex justify-between items-start">
                                                                    <h4 className="text-xs font-black text-gray-700 truncate pr-2">
                                                                        {subProduct.variants?.[0]?.color || subProduct.productName}
                                                                    </h4>
                                                                    <span className="text-[11px] font-black text-gray-900 shrink-0">
                                                                        ₹{subProduct.variants?.[0]?.listingPrice || subProduct.price || '—'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center mt-1">
                                                                    <div className="flex gap-2 text-[9px] text-gray-400 font-bold">
                                                                        <span>{subProduct.variants?.length || 0} Sizes</span>
                                                                        <span>•</span>
                                                                        <span className="text-purple-700 font-extrabold">Stock: {subProduct.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0}</span>
                                                                    </div>
                                                                    <MobileStatusBadge status={subProduct.status} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Sub-product Action Buttons Row */}
                                                        <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-2 gap-2">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedProductVariants(subProduct); }}
                                                                    className="w-6.5 h-6.5 flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                                    title="View Sizes & Prices"
                                                                >
                                                                    <Eye size={11} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleOpenBarcode(subProduct); }}
                                                                    className="w-6.5 h-6.5 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-500 rounded-md"
                                                                >
                                                                    <BarcodeIcon size={11} />
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate('/catalog-upload', { state: { editCatalogId: subProduct.catalogId || subProduct._id } })}
                                                                    className="w-6.5 h-6.5 flex items-center justify-center bg-purple-50 border border-purple-100 text-purple-600 rounded-md"
                                                                >
                                                                    <Pencil size={10} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(subProduct._id)}
                                                                    className="w-6.5 h-6.5 flex items-center justify-center bg-rose-50 border border-rose-100 text-rose-600 rounded-md"
                                                                >
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            </div>
                                                            <button 
                                                                onClick={() => toggleStatus(subProduct._id, subProduct.status)}
                                                                className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${
                                                                    subProduct.status === 'active' 
                                                                        ? 'bg-rose-50 border-rose-100 text-rose-600' 
                                                                        : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                                }`}
                                                            >
                                                                {subProduct.status === 'active' ? 'Off' : 'On'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center px-4 bg-white border rounded-2xl shadow-sm">
                        <span className="text-gray-400 font-bold block mb-2 text-xs">No matching catalogs found</span>
                        <p className="text-[11px] text-gray-400">Try searching for other keywords.</p>
                    </div>
                )}
            </div>

            {/* MULTI-STYLE DESKTOP DRAWER / VIEW MODAL */}
            <AnimatePresence>
                {selectedCatalogStyles && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                                        <Layers size={18} className="text-purple-600" />
                                        <span>Product Catalog Styles</span>
                                    </h3>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                                        {currentStylesCatalog?.productName}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedCatalogStyles(null)} 
                                    className="p-2 bg-white rounded-xl hover:bg-gray-100 border border-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Styles List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {fetchingIds[selectedCatalogStyles._id] ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 animate-pulse">
                                                <div className="w-16 h-20 bg-gray-100 rounded-xl"></div>
                                                <div className="flex-grow space-y-2 py-1">
                                                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                                                    <div className="h-3 bg-gray-50 rounded w-1/3"></div>
                                                    <div className="h-3.5 bg-gray-50 rounded w-1/4"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : currentStylesCatalog?.similarProducts?.length > 0 ? (
                                    currentStylesCatalog.similarProducts.map((subProduct) => (
                                        <div 
                                            key={subProduct._id}
                                            className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200/60 shadow-sm gap-4 hover:border-purple-100 hover:bg-purple-50/5 transition-all"
                                        >
                                            <div 
                                                onClick={() => setSelectedProductVariants(subProduct)}
                                                className="flex items-center gap-4 min-w-0 cursor-pointer hover:opacity-85 transition-all"
                                            >
                                                <img 
                                                    src={subProduct.images?.[0] || ''} 
                                                    alt="" 
                                                    className="w-16 h-20 rounded-xl bg-gray-50 object-cover border border-gray-100 animate-fade-in" 
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-black text-gray-800 truncate max-w-[180px]">
                                                            {subProduct.variants?.[0]?.color || subProduct.productName}
                                                        </h4>
                                                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                                                            {subProduct.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                                                        <span className="text-xs text-purple-700 font-extrabold">
                                                            Stock: {subProduct.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0}
                                                        </span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="text-[10px] text-gray-400 font-bold">
                                                            {subProduct.variants?.length || 0} Sizes
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        {subProduct.variants?.[0]?.skuId && (
                                                            <span className="text-[9px] font-mono font-bold bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded text-gray-500">
                                                                SKU: {subProduct.variants[0].skuId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50 gap-2">
                                                <div className="text-right">
                                                    <span className="text-base font-black text-gray-900">
                                                        ₹{subProduct.variants?.[0]?.listingPrice || subProduct.price || '—'}
                                                    </span>
                                                    {subProduct.variants?.[0]?.mrp > subProduct.variants?.[0]?.listingPrice && (
                                                        <span className="block text-[10px] text-gray-400 line-through">
                                                            MRP ₹{subProduct.variants[0].mrp}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedProductVariants(subProduct)}
                                                        className="w-8 h-8 flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 rounded-lg hover:text-blue-700 hover:border-blue-200 transition-colors"
                                                        title="View Sizes & Prices"
                                                    >
                                                        <Eye size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenBarcode(subProduct)}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-purple-600 hover:border-purple-200 transition-colors"
                                                        title="Barcode label"
                                                    >
                                                        <BarcodeIcon size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedCatalogStyles(null); navigate('/catalog-upload', { state: { editCatalogId: subProduct.catalogId || subProduct._id } }); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-purple-50 border border-purple-100 text-purple-600 rounded-lg"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subProduct._id)}
                                                        className="w-8 h-8 flex items-center justify-center bg-rose-50 border border-rose-100 text-rose-600 rounded-lg"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleStatus(subProduct._id, subProduct.status)}
                                                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase border active:scale-95 transition-all ${
                                                            subProduct.status === 'active' 
                                                                ? 'bg-rose-50 border-rose-100 text-rose-600' 
                                                                : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                        }`}
                                                    >
                                                        {subProduct.status === 'active' ? 'Off' : 'On'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 font-bold">No style products uploaded yet.</div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETE CONFIRMATION MODAL / BOTTOM SHEET */}
            <DeleteConfirmModal 
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={() => {
                    dispatch(delete_catalog(deleteConfirmId));
                    setDeleteConfirmId(null);
                }}
            />

            {/* BARCODE MODAL */}
            <AnimatePresence>
                {selectedBarcodeProduct && (() => {
                    const currentProduct = myCatalogs?.find(c => c._id === selectedBarcodeProduct._id) || selectedBarcodeProduct;
                    return (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }} 
                                animate={{ scale: 1, opacity: 1 }} 
                                exit={{ scale: 0.95, opacity: 0 }} 
                                className="bg-white rounded-3xl p-6 shadow-2xl relative w-full max-w-md border border-gray-100"
                            >
                                <button 
                                    onClick={() => setSelectedBarcodeProduct(null)} 
                                    className="absolute top-6 right-6 p-2 bg-gray-50 border border-gray-200/50 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                                
                                <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
                                    <BarcodeIcon className="text-purple-600" /> Product Barcode
                                </h3>
                                <p className="text-xs text-gray-400 font-medium mb-6">Scan or print this SKU barcode for inventory tracking.</p>
                                
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center shadow-inner">
                                    <ReactBarcode 
                                        value={currentProduct.variants?.[0]?.skuId || currentProduct._id.slice(-8).toUpperCase()} 
                                        format="CODE128"
                                        width={2}
                                        height={80}
                                        displayValue={true}
                                        background="#ffffff"
                                        lineColor="#000000"
                                    />
                                    <div className="mt-4 text-center px-4 w-full">
                                        <p className="text-xs font-black text-gray-800 truncate">{currentProduct.productName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                            Variants: {currentProduct.variants?.length || 0} • Stock: {currentProduct.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0}
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => window.print()}
                                    className="w-full bg-purple-600 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-purple-600/15 hover:bg-purple-700 active:scale-[0.98] transition-transform flex justify-center items-center gap-2"
                                >
                                    <Printer size={18} /> 
                                    <span>Print SKU Label</span>
                                </button>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* SCANNER BARCODE MODAL */}
            <AnimatePresence>
                {isScanModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }} 
                            className="bg-white rounded-3xl p-6 shadow-2xl relative w-full max-w-lg border border-gray-100"
                        >
                            <button 
                                onClick={() => { setIsScanModalOpen(false); setScannedProduct(null); setScanInput(''); }} 
                                className="absolute top-6 right-6 p-2 bg-gray-50 border border-gray-200/50 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                            
                            <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
                                <Scan className="text-purple-600" /> Scan SKU Product
                            </h3>
                            <p className="text-xs text-gray-400 font-medium mb-6">Use barcode scanners or input the SKU manually below.</p>
                            
                            <form onSubmit={handleScanSearch} className="mb-6 relative">
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    placeholder="Scan or enter SKU..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 font-mono text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all uppercase"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 shadow-sm active:scale-95 transition-all">
                                    <Scan size={14} />
                                </button>
                            </form>

                            {scannedProduct && (
                                <div className="bg-white border border-gray-200/60 rounded-2xl p-4 flex gap-4 shadow-sm">
                                    <img 
                                        src={scannedProduct.images?.[0] || ''} 
                                        alt="" 
                                        className="w-16 h-20 rounded-xl bg-gray-50 object-cover border border-gray-100" 
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-gray-800 truncate mb-1">
                                            {scannedProduct.productName}
                                        </h4>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 py-0.5 rounded">
                                                {scannedProduct.status}
                                            </span>
                                            <span className="text-xs font-black text-gray-900">
                                                ₹{scannedProduct.variants?.[0]?.listingPrice || scannedProduct.price || '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                            <span className="text-[9px] font-mono font-bold bg-gray-50 px-2 py-0.5 rounded border text-gray-500">
                                                {scannedProduct.variants?.[0]?.skuId || scannedProduct._id.slice(-8).toUpperCase()}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setIsScanModalOpen(false);
                                                    navigate('/catalog-upload', { state: { editCatalogId: scannedProduct.catalogId || scannedProduct._id } });
                                                }}
                                                className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors"
                                            >
                                                Edit Style
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SIZES, STOCK & PRICES RIGHT SIDEBAR DRAWER */}
            <AnimatePresence>
                {selectedProductVariants && (
                    <div className="fixed inset-0 z-[150] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                        <div className="absolute inset-0 overflow-hidden">
                            {/* Backdrop overlay */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer" 
                                onClick={() => setSelectedProductVariants(null)}
                            />

                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <motion.div 
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                    className="pointer-events-auto w-screen max-w-md"
                                >
                                    <div className="flex h-full flex-col bg-white shadow-2xl border-l border-gray-150/50">
                                        
                                        {/* Drawer Header */}
                                        <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50 relative shrink-0">
                                            <button 
                                                onClick={() => setSelectedProductVariants(null)} 
                                                className="absolute top-6 right-6 p-2 bg-white border border-gray-200/50 rounded-xl text-gray-400 hover:text-gray-600 hover:scale-105 active:scale-95 transition-all shadow-xs"
                                            >
                                                <X size={18} />
                                            </button>

                                            <div className="flex items-start gap-4 pr-10">
                                                <img 
                                                    src={selectedProductVariants.images?.[0] || ''} 
                                                    alt="" 
                                                    className="w-16 h-20 rounded-xl object-cover border border-gray-100 bg-gray-50 shadow-sm"
                                                />
                                                <div className="min-w-0">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-purple-100 bg-purple-50 text-purple-700 mb-2">
                                                        <Layers size={9} />
                                                        {selectedProductVariants.variants?.[0]?.color || selectedProductVariants.productName}
                                                    </span>
                                                    <h3 className="text-sm font-black text-gray-900 leading-tight line-clamp-2">
                                                        {selectedProductVariants.productName}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-400 font-extrabold uppercase mt-1">
                                                        {selectedProductVariants.category} • {selectedProductVariants.subCategory}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Drawer Content */}
                                        <div className="flex-1 overflow-y-auto px-6 py-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest pl-1">Size Breakdown & Stock</p>
                                                <span className="bg-purple-100/50 text-purple-700 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase">
                                                    Total Stock: {selectedProductVariants.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0}
                                                </span>
                                            </div>

                                            <div className="space-y-3.5">
                                                {selectedProductVariants.variants?.length > 0 ? (
                                                    selectedProductVariants.variants.map((v, i) => {
                                                        const total = v.stock || 0;
                                                        const reserved = v.reservedStock || 0;
                                                        const available = Math.max(0, total - reserved);
                                                        const isAvailable = available > 0;
                                                        
                                                        return (
                                                            <div 
                                                                key={v._id || i}
                                                                className="bg-white border border-gray-200/70 hover:border-purple-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xs transition-all"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 font-extrabold text-xs">
                                                                            {v.size}
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                                    isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                                                }`}>
                                                                                    {isAvailable ? 'In Stock' : 'Out of Stock'}
                                                                                </span>
                                                                            </div>
                                                                            {v.skuId && (
                                                                                <p className="text-[9px] font-mono text-gray-400 mt-1">
                                                                                    SKU: {v.skuId}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-right">
                                                                        <div className="text-sm font-black text-gray-900">
                                                                            ₹{v.listingPrice}
                                                                        </div>
                                                                        {v.mrp > v.listingPrice && (
                                                                            <div className="text-[10px] text-gray-400 line-through">
                                                                                MRP ₹{v.mrp}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Stock Breakdown Progress Bar */}
                                                                <div className="pt-2 border-t border-gray-100/60 mt-1">
                                                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5">
                                                                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available: {available} pcs</span>
                                                                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Reserved: {reserved} pcs</span>
                                                                    </div>
                                                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                                                        {total > 0 ? (
                                                                            <>
                                                                                <div 
                                                                                    style={{ width: `${(available / total) * 100}%` }} 
                                                                                    className="h-full bg-emerald-500 transition-all"
                                                                                />
                                                                                <div 
                                                                                    style={{ width: `${(reserved / total) * 100}%` }} 
                                                                                    className="h-full bg-amber-500 transition-all"
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <div className="w-full h-full bg-gray-200" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-center py-10 text-xs text-gray-400 font-bold">
                                                        No variants/sizes found for this style.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Drawer Footer Actions */}
                                        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-6 space-y-3 shrink-0">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProductVariants(null);
                                                        handleOpenBarcode(selectedProductVariants);
                                                    }}
                                                    className="flex-1 bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 font-black text-xs uppercase py-3.5 rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <BarcodeIcon size={14} />
                                                    <span>View Barcode</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProductVariants(null);
                                                        navigate('/catalog-upload', { state: { editCatalogId: selectedProductVariants.catalogId || selectedProductVariants._id } });
                                                    }}
                                                    className="flex-1 bg-purple-600 text-white font-black text-xs uppercase py-3.5 rounded-xl shadow-md shadow-purple-600/10 hover:bg-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Pencil size={12} />
                                                    <span>Edit Style</span>
                                                </button>
                                            </div>
                                            
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => {
                                                        toggleStatus(selectedProductVariants._id, selectedProductVariants.status);
                                                        setSelectedProductVariants(prev => ({
                                                            ...prev,
                                                            status: prev.status === 'active' ? 'inactive' : 'active'
                                                        }));
                                                    }}
                                                    className={`w-full py-3 rounded-xl text-xs font-black uppercase border active:scale-95 transition-all cursor-pointer ${
                                                        selectedProductVariants.status === 'active' 
                                                            ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100' 
                                                            : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                                    }`}
                                                >
                                                    {selectedProductVariants.status === 'active' ? 'Disable Style (Go Offline)' : 'Enable Style (Go Live)'}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default SupplierInventory;
