import React from 'react';
import { SlidersHorizontal, ChevronDown, Repeat, UserCircle2, LayoutGrid } from 'lucide-react';

const StickyFilterBar = ({ onOpenFilter, activeFilters, isHeaderCollapsed }) => {
    
    // Using the Brand Pink color #D80032
    const brandPink = '#D80032';
    const isAnyFilterActive = activeFilters?.sort !== 'newest' || activeFilters?.category || activeFilters?.gender;

    return (
        <div 
            style={{ top: isHeaderCollapsed ? '60px' : '112px' }}
            className={`sticky z-[50] transition-all duration-300 ease-in-out ${
                isHeaderCollapsed 
                ? 'bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]' 
                : 'bg-white border-b border-gray-50/50'
            }`}
        >
            <div className={`max-w-7xl mx-auto flex items-center overflow-x-auto no-scrollbar px-4 transition-all duration-300 ${isHeaderCollapsed ? 'py-1.5' : 'py-2.5'}`}>
                
                <div className="flex w-full items-center gap-1.5">
                    
                    {/* Sort Button */}
                    <button 
                        onClick={() => onOpenFilter('sort')}
                        className={`flex-1 min-w-[90px] py-2 flex justify-center items-center rounded-xl transition-all active:scale-95 border
                            ${activeFilters?.sort !== 'newest' ? 'text-white' : 'bg-gray-50 text-gray-600 border-gray-50'}`}
                        style={{ backgroundColor: activeFilters?.sort !== 'newest' ? brandPink : '', borderColor: activeFilters?.sort !== 'newest' ? brandPink : '' }}
                    >
                        <Repeat size={13} className="mr-1.5 opacity-80" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                            {activeFilters?.sort === 'newest' ? 'Sort' : 'Sorted'}
                        </span>
                        <ChevronDown size={12} className="ml-1 opacity-40" />
                    </button>

                    {/* Category Button */}
                    <button 
                        onClick={() => onOpenFilter('category')}
                        className={`flex-1 min-w-[100px] py-2 flex justify-center items-center rounded-xl transition-all active:scale-95 border
                            ${activeFilters?.category ? 'text-white' : 'bg-gray-50 text-gray-600 border-gray-50'}`}
                        style={{ backgroundColor: activeFilters?.category ? brandPink : '', borderColor: activeFilters?.category ? brandPink : '' }}
                    >
                        <LayoutGrid size={13} className="mr-1.5 opacity-80" />
                        <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[70px]">
                            {activeFilters?.category || 'Category'}
                        </span>
                        <ChevronDown size={12} className="ml-1 opacity-40" />
                    </button>

                    {/* Gender Button */}
                    <button 
                        onClick={() => onOpenFilter('gender')}
                        className={`flex-1 min-w-[95px] py-2 flex justify-center items-center rounded-xl transition-all active:scale-95 border
                            ${activeFilters?.gender ? 'text-white' : 'bg-gray-50 text-gray-600 border-gray-50'}`}
                        style={{ backgroundColor: activeFilters?.gender ? brandPink : '', borderColor: activeFilters?.gender ? brandPink : '' }}
                    >
                        <UserCircle2 size={13} className="mr-1.5 opacity-80" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                            {activeFilters?.gender || 'Gender'}
                        </span>
                        <ChevronDown size={12} className="ml-1 opacity-40" />
                    </button>
                    
                </div>
            </div>
        </div>
    );
};

export default StickyFilterBar;
