import React from 'react';

const CategoryRow = ({ categories = [], loading, onCategoryClick }) => {
    // Process categories into pairs for the stacked layout
    const categoryPairs = [];
    const validCategories = Array.isArray(categories) ? categories : [];
    for (let i = 0; i < validCategories.length; i += 2) {
        categoryPairs.push(validCategories.slice(i, i + 2));
    }

    return (
        <div className="pt-3 pb-5 md:pt-6 overflow-hidden border-b border-transparent bg-[#FCFCFF]">
            <div className="flex items-center justify-start overflow-x-auto no-scrollbar px-5 space-x-5 md:space-x-10">
                {loading && validCategories.length === 0 ? (
                    // Skeleton Loading
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col space-y-4 shrink-0">
                            {[1, 2].map(j => (
                                <div key={j} className="flex flex-col items-center space-y-2">
                                    <div className="w-[66px] h-[66px] md:w-[78px] md:h-[78px] bg-gray-50 rounded-t-[33px] rounded-b-[10px] animate-pulse"></div>
                                    <div className="w-10 h-2 bg-gray-50 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    categoryPairs.map((pair, pairIdx) => (
                        <div key={pairIdx} className="flex flex-col space-y-5 shrink-0 pb-1">
                            {pair.map((cat) => (
                                <div 
                                    key={cat._id} 
                                    onClick={() => onCategoryClick && onCategoryClick(cat)}
                                    className="flex flex-col items-center group cursor-pointer active:scale-95 transition-all"
                                >
                                    {/* STATIC ARCH / DOME UI */}
                                    <div className="relative w-[70px] h-[76px] md:w-[84px] md:h-[92px] flex items-center justify-center transition-all duration-300">
                                        {/* Background Arch Shape */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#EFEEFF] to-[#F5F4FF] rounded-t-[35px] rounded-b-[14px] shadow-sm border border-white/60 group-hover:shadow-md transition-all" />
                                        
                                        {/* THE BACKGROUND CIRCLE ACCENT (Behind image) */}
                                        <div className="absolute w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-inner opacity-60 group-hover:scale-110 transition-transform duration-500" />

                                        {/* Image Container */}
                                        <div className="relative w-[62px] h-[68px] md:w-[74px] md:h-[82px] rounded-t-[31px] rounded-b-[12px] overflow-hidden bg-transparent p-0.5 flex items-center justify-center">
                                            <img
                                                src={cat.image || 'https://via.placeholder.com/100'}
                                                alt={cat.name}
                                                className="w-full h-full object-cover rounded-t-[30px] rounded-b-[10px] transition-transform duration-500 group-hover:scale-110 relative z-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Label Section */}
                                    <div className="flex flex-col items-center mt-2.5 w-full px-1">
                                        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors line-clamp-1 text-center">
                                            {cat.name}
                                        </span>
                                        <div className="h-0.5 w-0 bg-primary rounded-full mt-0.5 group-hover:w-3 transition-all duration-300 opacity-60" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoryRow;
