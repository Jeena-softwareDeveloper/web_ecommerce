import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Plus, Trash2, Info, Check, Loader2, Save } from 'lucide-react';
import { get_stock_detail, update_stock, messageClear } from '../../store/reducers/supplierStockReducer';
import CommonHeader from '../../components/layout/CommonHeader';
import apiClient from '../../api/apiClient';

const CATEGORIES = [
    'Kurti', 'Saree', 'Lehenga', 'Salwar Suit', 'Dupatta',
    'T-Shirt', 'Shirt', 'Jeans', 'Trouser', 'Shorts',
    'Jacket', 'Sweater', 'Hoodie', 'Ethnic Wear', 'Other'
];

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const COMMON_COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Navy'];

const Section = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 bg-white">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3"
            >
                <span className="text-sm font-medium text-gray-800">{title}</span>
                {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {open && <div className="px-4 pb-5">{children}</div>}
        </div>
    );
};

const Field = ({ label, required, children, hint }) => (
    <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
        {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
);

const Input = ({ ...props }) => (
    <input
        {...props}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400"
    />
);

const Select = ({ children, ...props }) => (
    <select
        {...props}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 bg-white"
    >
        {children}
    </select>
);

const SupplierStockEdit = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentStock, loader, successMessage, errorMessage } = useSelector(s => s.supplierStock);

    const [form, setForm] = useState({
        styleName: '',
        styleCode: '',
        category: '',
        subCategory: '',
        hsnCode: '',
        washCare: '',
        fabricDetails: '',
        weightGrams: '',
        lengthCm: '',
        widthCm: '',
        heightCm: '',
        piecesPerCarton: '',
        minOrderQty: '1',
        reorderLevel: '5',
        warehouseLocation: '',
    });

    const [gstPercent, setGstPercent] = useState(null);
    const [variants, setVariants] = useState([]);
    const [newVariant, setNewVariant] = useState({
        color: '', size: '', stock: '', costPrice: '', listingPrice: '', mrp: '', lotNumber: ''
    });
    const [images, setImages] = useState(['']);

    useEffect(() => {
        dispatch(get_stock_detail(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (currentStock) {
            setForm({
                styleName: currentStock.styleName || '',
                styleCode: currentStock.styleCode || '',
                category: currentStock.category || '',
                subCategory: currentStock.subCategory || '',
                hsnCode: currentStock.hsnCode || '',
                washCare: currentStock.washCare || '',
                fabricDetails: currentStock.fabricDetails || '',
                weightGrams: currentStock.weightGrams || '',
                lengthCm: currentStock.lengthCm || '',
                widthCm: currentStock.widthCm || '',
                heightCm: currentStock.heightCm || '',
                piecesPerCarton: currentStock.piecesPerCarton || '',
                minOrderQty: currentStock.minOrderQty || '1',
                reorderLevel: currentStock.reorderLevel || '5',
                warehouseLocation: currentStock.warehouseLocation || '',
            });
            setGstPercent(currentStock.gstPercent);
            setVariants(currentStock.variants || []);
            setImages(currentStock.images?.length > 0 ? currentStock.images : ['']);
        }
    }, [currentStock]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate(`/supplier-stock/${id}`);
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate, id]);

    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const addVariant = () => {
        const { color, size, stock, costPrice, listingPrice, mrp } = newVariant;
        if (!color || !size || !stock || !costPrice || !listingPrice || !mrp) {
            toast.error('Fill all variant fields');
            return;
        }
        if (variants.find(v => v.color === color && v.size === size)) {
            toast.error(`${color} / ${size} already added`);
            return;
        }
        setVariants(prev => [...prev, {
            ...newVariant,
            stock: Number(newVariant.stock),
            costPrice: Number(newVariant.costPrice),
            listingPrice: Number(newVariant.listingPrice),
            mrp: Number(newVariant.mrp),
        }]);
        setNewVariant({ color: '', size: '', stock: '', costPrice: '', listingPrice: '', mrp: '', lotNumber: '' });
    };

    const removeVariant = (idx) => setVariants(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.styleName || !form.category) {
            toast.error('Fill all required fields');
            return;
        }
        if (variants.length === 0) {
            toast.error('Add at least one variant');
            return;
        }
        const payload = {
            ...form,
            weightGrams: Number(form.weightGrams) || 0,
            lengthCm: Number(form.lengthCm) || 0,
            widthCm: Number(form.widthCm) || 0,
            heightCm: Number(form.heightCm) || 0,
            piecesPerCarton: Number(form.piecesPerCarton) || 1,
            minOrderQty: Number(form.minOrderQty) || 1,
            variants,
            images: images.filter(Boolean)
        };
        dispatch(update_stock({ id, data: payload }));
    };

    if (loader && !currentStock) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    const isLive = currentStock?.status === 'active' || currentStock?.status === 'pending_approval';

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <CommonHeader title="Edit Stock" />
            <div className="pt-[52px] md:pt-[90px]">
                <form onSubmit={handleSubmit}>

                    {isLive && (
                        <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-start gap-2 mb-2">
                            <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-amber-700">
                                This product is <strong>{currentStock.status}</strong>. Some fields (Style Code, HSN) are locked to maintain listing integrity.
                            </p>
                        </div>
                    )}

                    <Section title="Product Details">
                        <Field label="Style Name" required>
                            <Input value={form.styleName} onChange={e => setField('styleName', e.target.value)} placeholder="e.g. Anarkali Kurti Vol-3" required />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Style Code" required>
                                <Input value={form.styleCode} disabled placeholder="AK-003" />
                            </Field>
                            <Field label="Category" required>
                                <Select value={form.category} onChange={e => setField('category', e.target.value)} required>
                                    <option value="">Select</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="HSN Code" required>
                                <Input value={form.hsnCode} disabled placeholder="e.g. 6206" />
                            </Field>
                            <Field label="GST %">
                                <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500 font-medium">
                                    {gstPercent}%
                                </div>
                            </Field>
                        </div>

                        <Field label="Fabric Details">
                            <Input value={form.fabricDetails} onChange={e => setField('fabricDetails', e.target.value)} placeholder="e.g. 180 GSM Cotton" />
                        </Field>
                    </Section>

                    <Section title="Variants & Stock">
                        <div className="border border-gray-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500 mb-3 font-medium">Add New Color + Size</p>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <Select value={newVariant.color} onChange={e => setNewVariant(v => ({ ...v, color: e.target.value }))}>
                                    <option value="">Color</option>
                                    {COMMON_COLORS.map(c => <option key={c}>{c}</option>)}
                                </Select>
                                <Select value={newVariant.size} onChange={e => setNewVariant(v => ({ ...v, size: e.target.value }))}>
                                    <option value="">Size</option>
                                    {COMMON_SIZES.map(s => <option key={s}>{s}</option>)}
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <Input type="number" value={newVariant.stock} onChange={e => setNewVariant(v => ({ ...v, stock: e.target.value }))} placeholder="Qty" />
                                <Input type="number" value={newVariant.listingPrice} onChange={e => setNewVariant(v => ({ ...v, listingPrice: e.target.value }))} placeholder="List ₹" />
                                <Input type="number" value={newVariant.mrp} onChange={e => setNewVariant(v => ({ ...v, mrp: e.target.value }))} placeholder="MRP ₹" />
                            </div>
                            <Input type="number" value={newVariant.costPrice} onChange={e => setNewVariant(v => ({ ...v, costPrice: e.target.value }))} placeholder="Cost Price (Private)" className="mb-3 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
                            
                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 flex items-center justify-center gap-1.5 hover:bg-gray-50"
                            >
                                <Plus size={13} /> Add Variant
                            </button>
                        </div>

                        {variants.length > 0 && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 font-medium text-gray-500">Variant</th>
                                            <th className="px-2 py-2 font-medium text-gray-500 text-right">Stock</th>
                                            <th className="px-2 py-2 font-medium text-gray-500 text-right">Price</th>
                                            <th className="px-2 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {variants.map((v, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2.5 text-gray-700">{v.color} / {v.size}</td>
                                                <td className="px-2 py-2.5 text-right font-medium text-gray-800">{v.stock}</td>
                                                <td className="px-2 py-2.5 text-right text-gray-600">₹{v.listingPrice}</td>
                                                <td className="px-2 py-2.5 text-right">
                                                    <button type="button" onClick={() => removeVariant(i)} className="text-red-400 p-1">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Section>

                    <Section title="Inventory & Warehouse" defaultOpen={false}>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Reorder Level">
                                <Input type="number" value={form.reorderLevel} onChange={e => setField('reorderLevel', e.target.value)} />
                            </Field>
                            <Field label="Warehouse Location">
                                <Input value={form.warehouseLocation} onChange={e => setField('warehouseLocation', e.target.value)} placeholder="Rack/Shelf" />
                            </Field>
                        </div>
                    </Section>

                    <Section title="Product Images" defaultOpen={false}>
                        {images.map((img, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input
                                    value={img}
                                    onChange={e => setImages(prev => {
                                        const arr = [...prev];
                                        arr[i] = e.target.value;
                                        return arr;
                                    })}
                                    placeholder="Image URL"
                                />
                                <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="text-red-400 px-1">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setImages(prev => [...prev, ''])} className="text-xs text-indigo-600 font-medium underline mt-1">+ Add Image URL</button>
                    </Section>

                    <div className="p-4 bg-white mt-2 border-t border-gray-100 sticky bottom-0">
                        <button
                            type="submit"
                            disabled={loader}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                        >
                            {loader ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Update Stock Entry
                        </button>
                    </div>

                </form>
            </div>
            <SupplierFooter />
        </div>
    );
};

export default SupplierStockEdit;
