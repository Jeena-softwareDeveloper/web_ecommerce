import React from 'react';

/**
 * VariantSubTable — Reusable expanded row table for catalog variant styles.
 *
 * Props:
 * - subProducts: array of variant/style product objects
 * - isLoading: boolean — shows skeleton while fetching
 * - actions: array of { icon, title, onClick, colorClass } — action buttons per row
 */
const VariantSubTable = ({ subProducts = [], isLoading = false, actions = [] }) => {

    if (isLoading) {
        return (
            <div className="w-full space-y-2">
                {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-xl p-4 flex gap-4 border border-gray-100 animate-pulse">
                        <div className="w-9 h-12 bg-gray-100 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-3.5 bg-gray-100 rounded w-2/3"></div>
                            <div className="h-3 bg-gray-50 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (subProducts.length === 0) {
        return (
            <div className="text-center py-6 text-gray-400 text-[11px] bg-white border border-gray-100 rounded-xl">
                No styles uploaded for this catalog.
            </div>
        );
    }

    return (
        <div className="overflow-hidden border border-gray-200/70 rounded-xl bg-white shadow-xs">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="bg-[#e8f5f2]/70 border-b border-gray-200/70 text-gray-600 uppercase text-[9px] tracking-wider font-bold">
                        <th className="px-4 py-3">Style Swatch</th>
                        <th className="px-4 py-3">Variant / Color</th>
                        <th className="px-4 py-3">Price Details</th>
                        <th className="px-4 py-3">SKU ID</th>
                        <th className="px-4 py-3 text-center">Available</th>
                        <th className="px-4 py-3 text-center">Reserved</th>
                        <th className="px-4 py-3 text-center">Reorder Lvl</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        {actions.length > 0 && (
                            <th className="px-4 py-3 text-right">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {subProducts.map((subProduct) => {
                        const total    = subProduct.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                        const reserved = subProduct.variants?.reduce((acc, v) => acc + (v.reservedStock || 0), 0) || 0;
                        const available = Math.max(0, total - reserved);
                        const sizesCount = subProduct.variants?.length || 0;
                        const reorder  = subProduct.variants?.[0]?.reorderLevel || 5;

                        return (
                            <tr key={subProduct._id} className="hover:bg-gray-50/70 transition-colors">

                                {/* Swatch image */}
                                <td className="px-4 py-2.5">
                                    <img
                                        src={subProduct.images?.[0] || ''}
                                        alt=""
                                        className="w-9 h-12 rounded-lg bg-gray-50 object-cover border border-gray-100 shadow-sm"
                                    />
                                </td>

                                {/* Variant / Color */}
                                <td className="px-4 py-2.5">
                                    <span className="text-[11px] text-gray-900 block">
                                        {subProduct.variants?.[0]?.color || subProduct.productName}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">{sizesCount} Sizes</span>
                                </td>

                                {/* Price */}
                                <td className="px-4 py-2.5">
                                    <span className="text-[11px] text-gray-900 block">
                                        ₹{subProduct.variants?.[0]?.listingPrice || subProduct.price || '—'}
                                    </span>
                                    {subProduct.variants?.[0]?.mrp > subProduct.variants?.[0]?.listingPrice && (
                                        <span className="text-[10px] text-gray-400 line-through">
                                            MRP ₹{subProduct.variants[0].mrp}
                                        </span>
                                    )}
                                </td>

                                {/* SKU ID */}
                                <td className="px-4 py-2.5 font-mono text-[10px] text-gray-600">
                                    {subProduct.variants?.[0]?.skuId || subProduct._id.slice(-8).toUpperCase()}
                                </td>

                                {/* Available stock */}
                                <td className="px-4 py-2.5 text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                        available > 10
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : available > 0
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-rose-50 text-rose-700'
                                    }`}>
                                        {available} pcs
                                    </span>
                                </td>

                                {/* Reserved stock */}
                                <td className="px-4 py-2.5 text-center">
                                    <span className="text-[10px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                        {reserved} pcs
                                    </span>
                                </td>

                                {/* Reorder level */}
                                <td className="px-4 py-2.5 text-center">
                                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                                        {reorder}
                                    </span>
                                </td>

                                {/* Status badge */}
                                <td className="px-4 py-2.5 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                        subProduct.status === 'active'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-rose-50 text-rose-700 border-rose-100'
                                    }`}>
                                        <span className={`w-1 h-1 rounded-full ${subProduct.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <span className="capitalize">{subProduct.status}</span>
                                    </span>
                                </td>

                                {/* Actions */}
                                {actions.length > 0 && (
                                    <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            {actions.map((act, idx) => {
                                                if (act.isToggle) {
                                                    const status = act.getStatus(subProduct);
                                                    const label = act.renderLabel(subProduct);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => act.onClick(subProduct)}
                                                            title={act.title}
                                                            className={`px-2.5 py-1 rounded-lg text-[9px] uppercase border active:scale-95 transition-all cursor-pointer ${
                                                                status === 'active'
                                                                    ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                                                                    : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            {label}
                                                        </button>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => act.onClick(subProduct)}
                                                        title={act.title}
                                                        className={act.colorClass || 'p-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg hover:text-purple-600 hover:border-purple-200 transition-colors shadow-xs cursor-pointer'}
                                                    >
                                                        {act.icon}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                )}

                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default VariantSubTable;
