import React from 'react';
import { X, Filter } from 'lucide-react';

const FilterChips = ({ activeFilters, onRemoveFilter, onClearAll }) => {
  // Convert active filters to chip format
  const getFilterChips = () => {
    const chips = [];
    
    // Sort filter
    if (activeFilters.sort && activeFilters.sort !== 'newest') {
      const sortLabels = {
        'price_low': 'Price: Low to High',
        'price_high': 'Price: High to Low',
        'rating': 'Top Rated',
        'newest': 'Newest'
      };
      chips.push({
        key: 'sort',
        label: `Sort: ${sortLabels[activeFilters.sort] || activeFilters.sort}`,
        value: activeFilters.sort
      });
    }

    // Category filter
    if (activeFilters.category) {
      chips.push({
        key: 'category',
        label: `Category: ${activeFilters.category}`,
        value: activeFilters.category
      });
    }

    // Subcategory filter
    if (activeFilters.subCategory) {
      chips.push({
        key: 'subCategory',
        label: `Type: ${activeFilters.subCategory}`,
        value: activeFilters.subCategory
      });
    }

    // Gender filter
    if (activeFilters.gender && activeFilters.gender !== 'all') {
      chips.push({
        key: 'gender',
        label: `Gender: ${activeFilters.gender.charAt(0).toUpperCase() + activeFilters.gender.slice(1)}`,
        value: activeFilters.gender
      });
    }

    // Size filter (multi-select)
    if (activeFilters.size) {
      const sizes = Array.isArray(activeFilters.size) ? activeFilters.size : activeFilters.size.split(',');
      sizes.forEach(size => {
        if (size.trim()) {
          chips.push({
            key: `size-${size}`,
            label: `Size: ${size}`,
            value: size,
            group: 'size'
          });
        }
      });
    }

    // Color filter (multi-select)
    if (activeFilters.color) {
      const colors = Array.isArray(activeFilters.color) ? activeFilters.color : activeFilters.color.split(',');
      colors.forEach(color => {
        if (color.trim()) {
          chips.push({
            key: `color-${color}`,
            label: `Color: ${color}`,
            value: color,
            group: 'color'
          });
        }
      });
    }

    // Price range filter
    if (activeFilters.minPrice || activeFilters.maxPrice) {
      let priceLabel = 'Price: ';
      if (activeFilters.minPrice && activeFilters.maxPrice) {
        priceLabel += `₹${activeFilters.minPrice} - ₹${activeFilters.maxPrice}`;
      } else if (activeFilters.minPrice) {
        priceLabel += `From ₹${activeFilters.minPrice}`;
      } else if (activeFilters.maxPrice) {
        priceLabel += `Up to ₹${activeFilters.maxPrice}`;
      }
      chips.push({
        key: 'price',
        label: priceLabel,
        value: `${activeFilters.minPrice || ''}-${activeFilters.maxPrice || ''}`
      });
    }

    // Search filter
    if (activeFilters.search) {
      chips.push({
        key: 'search',
        label: `Search: "${activeFilters.search}"`,
        value: activeFilters.search
      });
    }

    return chips;
  };

  const filterChips = getFilterChips();

  if (filterChips.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white border-b border-gray-100 px-4 py-3 sticky top-[112px] md:top-[120px] z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#D80032]" />
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Active Filters ({filterChips.length})
            </span>
          </div>
          {filterChips.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-black text-gray-400 hover:text-[#D80032] uppercase tracking-widest transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filterChips.map(chip => (
            <div
              key={chip.key}
              className="inline-flex items-center gap-1.5 bg-[#D80032]/5 border border-[#D80032]/20 rounded-full px-3 py-1.5 group hover:bg-[#D80032]/10 transition-all"
            >
              <span className="text-[10px] font-black text-[#D80032] uppercase tracking-wide">
                {chip.label}
              </span>
              <button
                onClick={() => onRemoveFilter(chip.key, chip.group, chip.value)}
                className="text-[#D80032] hover:bg-[#D80032] hover:text-white p-0.5 rounded-full transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterChips;
