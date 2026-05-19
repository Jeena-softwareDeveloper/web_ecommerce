import React from 'react';
import logo from '../../assets/logo192.png';

const InvoiceTemplate = ({ order, supplier }) => {
    if (!order) return null;

    // Default to 5% GST for apparel/clothing
    const GST_RATE = 5;

    const calculateTotals = () => {
        let grandTotal = 0;
        let totalQty = 0;
        
        order.products.forEach(p => {
            const price = p.price || p.sellingPrice || p.selling_price || Math.round(order.price / order.products.length) || 0;
            const qty = p.quantity || 1;
            grandTotal += (price * qty);
            totalQty += qty;
        });

        const taxableValue = grandTotal * (100 / (100 + GST_RATE));
        const totalGst = grandTotal - taxableValue;

        return {
            grandTotal,
            taxableValue: taxableValue.toFixed(2),
            totalGst: totalGst.toFixed(2),
            totalQty
        };
    };

    const totals = calculateTotals();

    return (
        <div id={`invoice-${order._id}`} className="bg-white p-10 max-w-[800px] mx-auto font-sans text-gray-800">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                <div className="flex items-center">
                    <img src={logo} alt="Jeenora Premium Fashion Marketplace" className="h-14 object-contain" />
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Tax Invoice</h2>
                    <p className="text-sm text-gray-500 mt-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-3">Sold By</h3>
                    <p className="font-bold text-gray-900 text-lg">{supplier?.businessDetails?.shopName || supplier?.shopName || <span className="text-red-500 font-bold uppercase text-[10px]">Partner Name Missing</span>}</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {supplier?.addressDetails?.address || <span className="text-red-400 text-[10px]">Address Missing</span>}<br />
                        {supplier?.addressDetails?.city || <span className="text-red-400 text-[10px]">City</span>}, {supplier?.addressDetails?.state || <span className="text-red-400 text-[10px]">State</span>} - {supplier?.addressDetails?.pincode || <span className="text-red-400 text-[10px]">Pincode Missing</span>}
                    </p>
                </div>
                <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-3">Ship To</h3>
                    <p className="font-bold text-gray-900 text-lg">{order.shippingInfo?.name}</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {order.shippingInfo?.houseNo ? `${order.shippingInfo.houseNo}, ` : ''}{order.shippingInfo?.area}<br />
                        {order.shippingInfo?.city}, {order.shippingInfo?.state} - {order.shippingInfo?.pincode}<br />
                        <span className="font-bold">Phone:</span> {order.shippingInfo?.phone}
                    </p>
                </div>
            </div>

            {/* Order Details Table */}
            <table className="w-full mb-12 table-fixed">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="w-1/2 text-left py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">Product Details</th>
                        <th className="w-1/6 text-center py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">Qty</th>
                        <th className="w-1/6 text-right py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">Price (Incl. Tax)</th>
                        <th className="w-1/6 text-right py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {order.products.map((item, idx) => {
                        const price = item.price || item.sellingPrice || item.selling_price || Math.round(order.price / order.products.length) || 0;
                        const qty = item.quantity || 1;
                        return (
                            <tr key={idx}>
                                <td className="py-6 pr-4">
                                    <p className="font-bold text-gray-900">{item.name || item.productName || <span className="text-red-500 text-[10px]">Product Name Missing</span>}</p>
                                    <p className="text-xs text-gray-500 mt-1">Size: {item.size || 'N/A'} | Color: {item.color || <span className="text-red-400 text-[10px]">Missing</span>}</p>
                                </td>
                                <td className="text-center py-6 font-medium text-gray-900">{qty}</td>
                                <td className="text-right py-6 font-medium text-gray-900">₹{price}</td>
                                <td className="text-right py-6 font-bold text-gray-900">₹{price * qty}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-between items-end">
                <div className="text-[10px] text-gray-400 font-medium">
                    * Price is inclusive of {GST_RATE}% GST.
                </div>
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Taxable Value</span>
                        <span>₹{totals.taxableValue}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>IGST / SGST+CGST ({GST_RATE}%)</span>
                        <span>₹{totals.totalGst}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Shipping</span>
                        <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                        <span className="font-black text-gray-900 uppercase tracking-tighter">Grand Total</span>
                        <span className="font-black text-2xl text-[#e11955]">₹{totals.grandTotal}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2">Thank you for shipping with Jeenora</p>
                <p className="text-[9px] text-gray-300">This is a computer generated tax invoice and does not require a physical signature.</p>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
