import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

const FilterBottomSheet = ({ isOpen, onClose, activeFilters, categories, onApply, mode = 'all' }) => {
    const [localFilters, setLocalFilters] = useState(activeFilters);

    useEffect(() => {
        if (isOpen) setLocalFilters(activeFilters);
    }, [isOpen, activeFilters]);

    const showSort = mode === 'all' || mode === 'sort';
    const showGender = mode === 'all' || mode === 'gender';
    const showCategory = mode === 'all' || mode === 'category';

    const sortOptions = [
        { label: 'Newest Arrivals', value: 'newest' },
        { label: 'Price: Low to High', value: 'low-to-high' },
        { label: 'Price: High to Low', value: 'high-to-low' },
        { label: 'Top Rated', value: 'top-rated' }
    ];

    const genderOptions = [
        { label: 'All', value: '' },
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' },
        { label: 'Unisex', value: 'unisex' }
    ];

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[999] backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white z-[1000] rounded-t-[32px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl h-auto"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight capitalize">{mode === 'all' ? 'Filters' : `${mode} Options`}</h3>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Refine your search</p>
                            </div>
                            <button onClick={onClose} className="p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-5 space-y-5 no-scrollbar">
                            
                            {/* Sort Section */}
                            {showSort && (
                                <section>
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Sort By</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sortOptions.map((opt) => (
                                            <button 
                                                key={opt.value}
                                                onClick={() => setLocalFilters(prev => ({ ...prev, sort: opt.value }))}
                                                className={`flex items-center justify-between px-3 py-3 rounded-xl border-2 transition-all font-bold text-[12px] 
                                                    ${localFilters.sort === opt.value 
                                                        ? 'shadow-sm' 
                                                        : 'border-gray-100 bg-gray-50/50 text-gray-500'}`}
                                                style={{ 
                                                    borderColor: localFilters.sort === opt.value ? '#D80032' : '',
                                                    backgroundColor: localFilters.sort === opt.value ? 'rgba(216, 0, 50, 0.05)' : '',
                                                    color: localFilters.sort === opt.value ? '#D80032' : ''
                                                }}
                                            >
                                                {opt.label}
                                                {localFilters.sort === opt.value && <Check size={12} style={{ color: '#D80032' }} className="ml-2" />}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Gender Section */}
                            {showGender && (
                                <section>
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Gender</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {genderOptions.map((opt) => (
                                            <button 
                                                key={opt.value}
                                                onClick={() => setLocalFilters(prev => ({ ...prev, gender: opt.value }))}
                                                className={`px-5 py-2 rounded-full border-2 transition-all font-bold text-[12px] 
                                                    ${localFilters.gender === opt.value 
                                                        ? 'shadow-sm' 
                                                        : 'border-gray-100 bg-gray-50/50 text-gray-500'}`}
                                                style={{ 
                                                    borderColor: localFilters.gender === opt.value ? '#D80032' : '',
                                                    backgroundColor: localFilters.gender === opt.value ? 'rgba(216, 0, 50, 0.05)' : '',
                                                    color: localFilters.gender === opt.value ? '#D80032' : ''
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                            
                            {/* Size Section */}
                            <section>
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Brand Size</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((sz) => {
                                        const isSelected = localFilters.size?.split(',').includes(sz);
                                        return (
                                            <button 
                                                key={sz}
                                                onClick={() => {
                                                    let newSizes = localFilters.size ? localFilters.size.split(',') : [];
                                                    if (isSelected) newSizes = newSizes.filter(s => s !== sz);
                                                    else newSizes.push(sz);
                                                    setLocalFilters(prev => ({ ...prev, size: newSizes.join(',') }));
                                                }}
                                                className={`px-4 py-2 rounded-xl border-2 transition-all font-bold text-[11px] 
                                                    ${isSelected ? 'bg-[#D80032] text-white border-[#D80032] shadow-md' : 'border-gray-100 bg-gray-50/50 text-gray-500'}`}
                                            >
                                                {sz}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Color Section */}
                            <section>
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Primary Colors</h4>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { name: 'Black', hex: '#000000' },
                                        { name: 'White', hex: '#FFFFFF', border: true },
                                        { name: 'Red', hex: '#D80032' },
                                        { name: 'Blue', hex: '#1E40AF' },
                                        { name: 'Green', hex: '#059669' },
                                        { name: 'Yellow', hex: '#F59E0B' },
                                        { name: 'Pink', hex: '#EC4899' }
                                    ].map((col) => {
                                        const isSelected = localFilters.color?.split(',').includes(col.name);
                                        return (
                                            <button 
                                                key={col.name}
                                                onClick={() => {
                                                    let newColors = localFilters.color ? localFilters.color.split(',') : [];
                                                    if (isSelected) newColors = newColors.filter(c => c !== col.name);
                                                    else newColors.push(col.name);
                                                    setLocalFilters(prev => ({ ...prev, color: newColors.join(',') }));
                                                }}
                                                className={`flex flex-col items-center gap-1.5 p-1 transition-all
                                                    ${isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                                            >
                                                <div 
                                                    className={`w-7 h-7 rounded-full shadow-sm relative flex items-center justify-center
                                                        ${col.border ? 'border border-gray-200' : ''}`}
                                                    style={{ backgroundColor: col.hex }}
                                                >
                                                    {isSelected && <Check size={14} className={col.name === 'White' ? 'text-black' : 'text-white'} />}
                                                </div>
                                                <span className={`text-[9px] font-bold ${isSelected ? 'text-[#D80032]' : 'text-gray-400'}`}>{col.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        {/* Footer - Apply Button */}
                        <div className="p-5 bg-white border-t border-gray-100 flex gap-4">
                            <button 
                                onClick={() => setLocalFilters({ sort: 'newest', category: '', gender: '', searchValue: '' })}
                                className="flex-1 py-3 text-[12px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                            >
                                Reset
                            </button>
                            <button 
                                onClick={handleApply}
                                className="flex-[2.5] text-white py-3.5 rounded-xl font-black text-[12px] transition-transform active:scale-95 shadow-xl shadow-pink-200 flex items-center justify-center gap-2 uppercase tracking-widest"
                                style={{ backgroundColor: '#D80032' }}
                            >
                                Apply Filters
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FilterBottomSheet;
