import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, SlidersHorizontal, ChevronDown, Sparkles } from 'lucide-react';

const EnhancedFilterBottomSheet = ({ 
  isOpen, 
  onClose, 
  activeFilters, 
  categories = [],
  onApply,
  mode = 'all',
  availableFilters = {} // Dynamic filter options from API
}) => {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const [priceRange, setPriceRange] = useState({
    min: activeFilters.minPrice || '',
    max: activeFilters.maxPrice || ''
  });

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(activeFilters);
      setPriceRange({
        min: activeFilters.minPrice || '',
        max: activeFilters.maxPrice || ''
      });
    }
  }, [isOpen, activeFilters]);

  const showSort = mode === 'all' || mode === 'sort';
  const showGender = mode === 'all' || mode === 'gender';
  const showCategory = mode === 'all' || mode === 'category';
  const showFilters = mode === 'all' || mode === 'filters';

  const sortOptions = [
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'low-to-high' },
    { label: 'Price: High to Low', value: 'high-to-low' },
    { label: 'Top Rated', value: 'top-rated' },
    { label: 'Best Selling', value: 'best-selling' }
  ];

  const genderOptions = [
    { label: 'All', value: '' },
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Unisex', value: 'unisex' },
    { label: 'Kids', value: 'kids' }
  ];

  // Dynamic size options from available filters or default
  const sizeOptions = availableFilters.sizes || ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  
  // Dynamic color options from available filters or default
  const colorOptions = availableFilters.colors || [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF', border: true },
    { name: 'Red', hex: '#D80032' },
    { name: 'Blue', hex: '#1E40AF' },
    { name: 'Green', hex: '#059669' },
    { name: 'Yellow', hex: '#F59E0B' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Gray', hex: '#6B7280' },
    { name: 'Brown', hex: '#92400E' }
  ];

  const handleApply = () => {
    const finalFilters = {
      ...localFilters,
      minPrice: priceRange.min || undefined,
      maxPrice: priceRange.max || undefined
    };
    onApply(finalFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({ sort: 'newest', category: '', gender: '', searchValue: '' });
    setPriceRange({ min: '', max: '' });
  };

  const handleSizeToggle = (size) => {
    const currentSizes = localFilters.size ? localFilters.size.split(',') : [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    
    setLocalFilters(prev => ({
      ...prev,
      size: newSizes.length > 0 ? newSizes.join(',') : undefined
    }));
  };

  const handleColorToggle = (colorName) => {
    const currentColors = localFilters.color ? localFilters.color.split(',') : [];
    const newColors = currentColors.includes(colorName)
      ? currentColors.filter(c => c !== colorName)
      : [...currentColors, colorName];
    
    setLocalFilters(prev => ({
      ...prev,
      color: newColors.length > 0 ? newColors.join(',') : undefined
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    const currentCategories = localFilters.categories ? localFilters.categories.split(',') : [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(c => c !== categoryId)
      : [...currentCategories, categoryId];
    
    setLocalFilters(prev => ({
      ...prev,
      categories: newCategories.length > 0 ? newCategories.join(',') : undefined
    }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.sort && localFilters.sort !== 'newest') count++;
    if (localFilters.gender) count++;
    if (localFilters.category) count++;
    if (localFilters.size) count += localFilters.size.split(',').filter(s => s.trim()).length;
    if (localFilters.color) count += localFilters.color.split(',').filter(c => c.trim()).length;
    if (priceRange.min || priceRange.max) count++;
    if (localFilters.categories) count += localFilters.categories.split(',').filter(c => c.trim()).length;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

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
            className="fixed bottom-0 left-0 right-0 bg-white z-[1000] rounded-t-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D80032]/10 flex items-center justify-center">
                  <SlidersHorizontal size={20} className="text-[#D80032]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight capitalize">
                    {mode === 'all' ? 'All Filters' : `${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      Refine your search
                    </p>
                    {activeFilterCount > 0 && (
                      <span className="text-[8px] font-black bg-[#D80032] text-white px-1.5 py-0.5 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button 
                    onClick={handleReset}
                    className="text-[10px] font-black text-gray-400 hover:text-[#D80032] uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5 space-y-6 no-scrollbar">
              {/* Sort Section */}
              {showSort && (
                <section className="bg-gray-50/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles size={12} />
                      Sort By
                    </h4>
                    {localFilters.sort && localFilters.sort !== 'newest' && (
                      <span className="text-[8px] font-black bg-[#D80032] text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map((opt) => (
                      <button 
                        key={opt.value}
                        onClick={() => setLocalFilters(prev => ({ ...prev, sort: opt.value }))}
                        className={`flex items-center justify-between px-3 py-3 rounded-xl border-2 transition-all font-bold text-[12px] 
                          ${localFilters.sort === opt.value 
                            ? 'shadow-sm border-[#D80032] bg-[#D80032]/5 text-[#D80032]' 
                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        {opt.label}
                        {localFilters.sort === opt.value && <Check size={12} className="text-[#D80032]" />}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Gender Section */}
              {showGender && (
                <section className="bg-gray-50/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gender</h4>
                    {localFilters.gender && (
                      <span className="text-[8px] font-black bg-[#D80032] text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genderOptions.map((opt) => (
                      <button 
                        key={opt.value}
                        onClick={() => setLocalFilters(prev => ({ ...prev, gender: opt.value }))}
                        className={`px-4 py-2.5 rounded-full border-2 transition-all font-bold text-[11px] 
                          ${localFilters.gender === opt.value 
                            ? 'border-[#D80032] bg-[#D80032]/5 text-[#D80032] shadow-sm' 
                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Price Range Section */}
              {showFilters && (
                <section className="bg-gray-50/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price Range</h4>
                    {(priceRange.min || priceRange.max) && (
                      <span className="text-[8px] font-black bg-[#D80032] text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Min Price (₹)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full text-sm font-bold border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D80032] focus:border-transparent"
                        />
                      </div>
                      <div className="pt-5 text-gray-400">-</div>
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Max Price (₹)</label>
                        <input
                          type="number"
                          placeholder="10000"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="w-full text-sm font-bold border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D80032] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium text-center">
                      Popular: 
                      <button 
                        onClick={() => setPriceRange({ min: '0', max: '500' })}
                        className="ml-2 text-[#D80032] hover:underline font-bold"
                      >
                        Under ₹500
                      </button>
                      <button 
                        onClick={() => setPriceRange({ min: '500', max: '1000' })}
                        className="ml-2 text-[#D80032] hover:underline font-bold"
                      >
                        ₹500-1000
                      </button>
                      <button 
                        onClick={() => setPriceRange({ min: '1000', max: '2000' })}
                        className="ml-2 text-[#D80032] hover:underline font-bold"
                      >
                        ₹1000-2000
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Size Section */}
              {showFilters && (
                <section className="bg-gray-50/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Size</h4>
                    {localFilters.size && (
                      <span className="text-[8px] font-black bg-[#D80032] text-white px-2 py-0.5 rounded-full">
                        {localFilters.size.split(',').filter(s => s.trim()).length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => {
                      const isSelected = localFilters.size ? localFilters.size.split(',').includes(size) : false;
                      return (
                        <button 
                          key={size}
                          onClick={() => handleSizeToggle(size)}
                          className={`px-4 py-2.5 rounded-xl border-2 transition-all font-bold text-[11px] 
                            ${isSelected 
                              ? 'bg-[#D80032] text-white border-[#D80032] shadow-md' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Color Section */}
              {showFilters && (
                <section className="bg-gray-50/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Color</h4>
                    {localFilters.color && (
                      <span className="text-[8px] font-black bg-[#D80032] text-white px-2 py-0.5 rounded-full">
                        {localFilters.color.split(',').filter(c => c.trim()).length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((col) => {
                      const isSelected = localFilters.color ? localFilters.color.split(',').includes(col.name) : false;
                      return (
                        <button 
                          key={col.name}
                          onClick={() => handleColorToggle(col.name)}
                          className={`flex flex-col items-center gap-2 p-2 transition-all rounded-xl
                            ${isSelected ? 'scale-110 bg-gray-50' : 'opacity-80 hover:opacity-100'}`}
                        >
                          <div 
                            className={`w-10 h-10 rounded-full shadow-sm relative flex items-center justify-center border-2
                              ${isSelected ? 'border-[#D80032]' : col.border ? 'border-gray-200' : 'border-transparent'}`}
                            style={{ backgroundColor: col.hex }}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={16} className={col.name === 'White' ? 'text-black' : 'text-white'} />
                              </div>
                            )}
                          </div>
                          <span className={`text-[9px] font-bold ${isSelected ? 'text-[#D80032]' : 'text-gray-400'}`}>
                            {col.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Category Multi-select */}
              {showCategory && categories.length > 0 && (
                <section className="bg-gray-50/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Categories</h4>
                    {localFilters.categories && (
                      <span className="text-[8px] font-black bg-[#D80032] text-white px-2 py-0.5 rounded-full">
                        {localFilters.categories.split(',').filter(c => c.trim()).length} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 8).map((cat) => {
                      const isSelected = localFilters.categories ? localFilters.categories.split(',').includes(cat._id) : false;
                      return (
                        <button 
                          key={cat._id}
                          onClick={() => handleCategoryToggle(cat._id)}
                          className={`flex items-center justify-between px-3 py-3 rounded-xl border-2 transition-all font-bold text-[12px] 
                            ${isSelected 
                              ? 'shadow-sm border-[#D80032] bg-[#D80032]/5 text-[#D80032]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          <span>{cat.name}</span>
                          {isSelected && <Check size={12} className="text-[#D80032]" />}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5">
              <button 
                onClick={handleApply}
                className="w-full bg-[#D80032] py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-red-100 flex items-center justify-center gap-3 hover:bg-[#C0002A] transition-colors"
              >
                Apply Filters
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EnhancedFilterBottomSheet;
