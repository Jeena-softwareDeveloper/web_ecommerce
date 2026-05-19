import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Plus, Trash2, Info, Check } from 'lucide-react';
import { add_stock, messageClear } from '../../store/reducers/supplierStockReducer';
import CommonHeader from '../../components/layout/CommonHeader';
import apiClient from '../../api/apiClient';

// Garment categories
const CATEGORIES = [
    'Kurti', 'Saree', 'Lehenga', 'Salwar Suit', 'Dupatta',
    'T-Shirt', 'Shirt', 'Jeans', 'Trouser', 'Shorts',
    'Jacket', 'Sweater', 'Hoodie', 'Ethnic Wear', 'Other'
];

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

const COMMON_COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Navy'];

// Section wrapper — no colored bg per user rule
const Section = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100">
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
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-colors bg-white"
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

const AddSupplierStock = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loader, successMessage, errorMessage } = useSelector(s => s.supplierStock);

    // Form state
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
    const [gstLoading, setGstLoading] = useState(false);

    // Variants: array of { color, size, stock, costPrice, listingPrice, mrp, lotNumber }
    const [variants, setVariants] = useState([]);
    const [newVariant, setNewVariant] = useState({
        color: '', size: '', stock: '', costPrice: '', listingPrice: '', mrp: '', lotNumber: ''
    });

    // Images (URLs from upload — for now text input as placeholder)
    const [images, setImages] = useState(['']);

    // HSN → GST auto-fill
    useEffect(() => {
        if (form.hsnCode.length >= 4) {
            setGstLoading(true);
            apiClient.get(`/wear/supplier/stock/hsn-gst?hsn=${form.hsnCode}`, { skipToast: true })
                .then(res => {
                    if (res.data.found) setGstPercent(res.data.gst);
                    else setGstPercent(null);
                })
                .catch(() => setGstPercent(null))
                .finally(() => setGstLoading(false));
        } else {
            setGstPercent(null);
        }
    }, [form.hsnCode]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/supplier-stock');
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate]);

    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const addVariant = () => {
        const { color, size, stock, costPrice, listingPrice, mrp } = newVariant;
        if (!color || !size || !stock || !costPrice || !listingPrice || !mrp) {
            toast.error('Fill all variant fields');
            return;
        }
        // Check duplicate
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
        if (!form.styleName || !form.styleCode || !form.hsnCode || !form.category) {
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
        dispatch(add_stock(payload));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <CommonHeader title="Add Stock" />
            <div className="pt-[52px] md:pt-[90px]">
                <form onSubmit={handleSubmit} className="bg-white">

                    {/* ── Section 1: Identity ─────────────────────────────── */}
                    <Section title="Product Details">
                        <Field label="Style Name" required>
                            <Input value={form.styleName} onChange={e => setField('styleName', e.target.value)} placeholder="e.g. Anarkali Kurti Vol-3" required />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Style Code" required>
                                <Input value={form.styleCode} onChange={e => setField('styleCode', e.target.value.toUpperCase())} placeholder="e.g. AK-003" required />
                            </Field>
                            <Field label="Category" required>
                                <Select value={form.category} onChange={e => setField('category', e.target.value)} required>
                                    <option value="">Select</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="HSN Code" required hint="4-8 digit code from your invoice">
                                <Input
                                    value={form.hsnCode}
                                    onChange={e => setField('hsnCode', e.target.value)}
                                    placeholder="e.g. 6206"
                                    required
                                />
                            </Field>
                            <Field label="GST %" hint="Auto-filled from HSN">
                                <div className={`border rounded-lg px-3 py-2.5 text-sm flex items-center gap-2 ${gstPercent !== null ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    {gstLoading ? (
                                        <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                    ) : gstPercent !== null ? (
                                        <>
                                            <Check size={13} className="text-green-600" />
                                            <span className="text-green-700 font-medium">{gstPercent}%</span>
                                            <span className="text-[10px] text-green-500 ml-auto">Locked</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">Enter HSN above</span>
                                    )}
                                </div>
                            </Field>
                        </div>

                        <Field label="Fabric Details">
                            <Input value={form.fabricDetails} onChange={e => setField('fabricDetails', e.target.value)} placeholder="e.g. 180 GSM Cotton" />
                        </Field>
                        <Field label="Wash Care">
                            <Input value={form.washCare} onChange={e => setField('washCare', e.target.value)} placeholder="e.g. Cold wash only" />
                        </Field>
                    </Section>

                    {/* ── Section 2: Variants ─────────────────────────────── */}
                    <Section title="Variants & Stock">

                        {/* Add variant form */}
                        <div className="border border-gray-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500 mb-3 font-medium">Add Color + Size combination</p>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                    <p className="text-[10px] text-gray-400 mb-1">Color</p>
                                    <Select value={newVariant.color} onChange={e => setNewVariant(v => ({ ...v, color: e.target.value }))}>
                                        <option value="">Select</option>
                                        {COMMON_COLORS.map(c => <option key={c}>{c}</option>)}
                                    </Select>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 mb-1">Size</p>
                                    <Select value={newVariant.size} onChange={e => setNewVariant(v => ({ ...v, size: e.target.value }))}>
                                        <option value="">Select</option>
                                        {COMMON_SIZES.map(s => <option key={s}>{s}</option>)}
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                    <p className="text-[10px] text-gray-400 mb-1">Stock Qty</p>
                                    <Input type="number" min="0" value={newVariant.stock} onChange={e => setNewVariant(v => ({ ...v, stock: e.target.value }))} placeholder="0" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 mb-1">Lot Number</p>
                                    <Input value={newVariant.lotNumber} onChange={e => setNewVariant(v => ({ ...v, lotNumber: e.target.value }))} placeholder="Optional" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div>
                                    <p className="text-[10px] text-gray-400 mb-1">Cost ₹ <span className="text-[8px]">(Private)</span></p>
                                    <Input type="number" min="0" value={newVariant.costPrice} onChange={e => setNewVariant(v => ({ ...v, costPrice: e.target.value }))} placeholder="0" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 mb-1">Listing ₹</p>
                                    <Input type="number" min="0" value={newVariant.listingPrice} onChange={e => setNewVariant(v => ({ ...v, listingPrice: e.target.value }))} placeholder="0" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 mb-1">MRP ₹</p>
                                    <Input type="number" min="0" value={newVariant.mrp} onChange={e => setNewVariant(v => ({ ...v, mrp: e.target.value }))} placeholder="0" />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
                            >
                                <Plus size={13} />
                                Add Variant
                            </button>
                        </div>

                        {/* Variants table */}
                        {variants.length > 0 && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left text-[10px] text-gray-400 font-medium px-3 py-2">Color / Size</th>
                                            <th className="text-right text-[10px] text-gray-400 font-medium px-2 py-2">Qty</th>
                                            <th className="text-right text-[10px] text-gray-400 font-medium px-2 py-2">List ₹</th>
                                            <th className="text-right text-[10px] text-gray-400 font-medium px-2 py-2">MRP ₹</th>
                                            <th className="px-2 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {variants.map((v, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 text-gray-700">{v.color} / {v.size}</td>
                                                <td className="px-2 py-2 text-right text-gray-700">{v.stock}</td>
                                                <td className="px-2 py-2 text-right text-gray-700">₹{v.listingPrice}</td>
                                                <td className="px-2 py-2 text-right text-gray-400 line-through">₹{v.mrp}</td>
                                                <td className="px-2 py-2">
                                                    <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {variants.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-3">No variants added yet</p>
                        )}
                    </Section>

                    {/* ── Section 3: Inventory Settings ─────────────────── */}
                    <Section title="Inventory Settings" defaultOpen={false}>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Reorder Level" hint="Alert when stock drops below this">
                                <Input type="number" min="1" value={form.reorderLevel} onChange={e => setField('reorderLevel', e.target.value)} placeholder="5" />
                            </Field>
                            <Field label="Warehouse Location" hint="Rack/Shelf/Zone">
                                <Input value={form.warehouseLocation} onChange={e => setField('warehouseLocation', e.target.value)} placeholder="e.g. Rack A3 / Shelf 2" />
                            </Field>
                        </div>
                    </Section>

                    {/* ── Section 4: Physical ─────────────────────────────── */}
                    <Section title="Physical Details" defaultOpen={false}>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Weight (grams)">
                                <Input type="number" min="0" value={form.weightGrams} onChange={e => setField('weightGrams', e.target.value)} placeholder="350" />
                            </Field>
                            <Field label="Min Order Qty">
                                <Input type="number" min="1" value={form.minOrderQty} onChange={e => setField('minOrderQty', e.target.value)} placeholder="1" />
                            </Field>
                            <Field label="Length (cm)">
                                <Input type="number" min="0" value={form.lengthCm} onChange={e => setField('lengthCm', e.target.value)} placeholder="30" />
                            </Field>
                            <Field label="Width (cm)">
                                <Input type="number" min="0" value={form.widthCm} onChange={e => setField('widthCm', e.target.value)} placeholder="25" />
                            </Field>
                            <Field label="Height (cm)">
                                <Input type="number" min="0" value={form.heightCm} onChange={e => setField('heightCm', e.target.value)} placeholder="5" />
                            </Field>
                            <Field label="Pieces per Carton">
                                <Input type="number" min="1" value={form.piecesPerCarton} onChange={e => setField('piecesPerCarton', e.target.value)} placeholder="24" />
                            </Field>
                        </div>
                    </Section>

                    {/* ── Section 5: Images ───────────────────────────────── */}
                    <Section title="Product Images" defaultOpen={false}>
                        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                            <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-blue-600">Add at least 1 image before requesting to list on Jeenora. Paste image URLs below.</p>
                        </div>
                        {images.map((img, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input
                                    value={img}
                                    onChange={e => setImages(prev => {
                                        const arr = [...prev];
                                        arr[i] = e.target.value;
                                        return arr;
                                    })}
                                    placeholder={`Image ${i + 1} URL`}
                                />
                                {images.length > 1 && (
                                    <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="text-red-400 px-2">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setImages(prev => [...prev, ''])}
                            className="text-xs text-gray-500 underline mt-1"
                        >
                            + Add another image
                        </button>
                    </Section>

                    {/* ── Submit ──────────────────────────────────────────── */}
                    <div className="p-4">
                        <p className="text-[10px] text-gray-400 mb-3 text-center">
                            Stock will be saved as <strong>Private</strong>. You can request to list on Jeenora after adding images.
                        </p>
                        <button
                            type="submit"
                            disabled={loader}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 transition-all"
                        >
                            {loader ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Save to My Stock'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddSupplierStock;
