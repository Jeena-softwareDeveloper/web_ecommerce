import React from 'react';

const CategoryRow = ({ categories = [], loading, onCategoryClick }) => {
    // Process categories: Single row if <= 6, two distinct rows if > 6
    const validCategories = Array.isArray(categories) ? categories : [];
    const hasTwoRows = validCategories.length > 6;
    
    let firstRow = [];
    let secondRow = [];
    
    if (hasTwoRows) {
        // Max 6 in first row as requested, or balanced split? 
        // User said "max 6 athuku mela pochina second row"
        firstRow = validCategories.slice(0, 6);
        secondRow = validCategories.slice(6);
    } else {
        firstRow = validCategories;
    }

    const renderCategoryItem = (cat) => {
        // Optimize Cloudinary image URL if applicable (requesting 200px width for 112px display)
        const optimizedImage = cat.image?.includes('cloudinary.com') 
            ? cat.image.replace('/upload/', '/upload/w_200,c_fill,g_face,q_auto,f_auto/') 
            : (cat.image || '');

        return (
            <div 
                key={cat._id} 
                onClick={() => onCategoryClick && onCategoryClick(cat)}
                className="flex flex-col items-center group cursor-pointer active:scale-95 transition-all w-[70px] md:w-[84px] shrink-0"
            >
                <div className="relative w-full aspect-[70/76] md:aspect-[84/92] flex items-center justify-center transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EFEEFF] to-[#F5F4FF] rounded-t-[35px] rounded-b-[14px] shadow-sm border border-white/60 group-hover:shadow-md transition-all" />
                    <div className="absolute w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-inner opacity-60 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative w-[62px] h-[68px] md:w-[74px] md:h-[82px] rounded-t-[31px] rounded-b-[12px] overflow-hidden bg-transparent p-0.5 flex items-center justify-center">
                        <img
                            src={optimizedImage}
                            alt={cat.name}
                            loading="lazy"
                            width="74"
                            height="82"
                            className="w-full h-full object-cover rounded-t-[30px] rounded-b-[10px] transition-transform duration-500 group-hover:scale-110 relative z-10"
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center mt-1.5 w-full px-0.5 min-h-[1.5rem]">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors line-clamp-1 text-center">
                        {cat.name}
                    </span>
                    <div className="h-0.5 w-0 bg-primary rounded-full mt-0.5 group-hover:w-3 transition-all duration-300 opacity-60" />
                </div>
            </div>
        );
    };

    return (
        <div className="pt-3 pb-5 md:pt-6 overflow-hidden border-b border-transparent bg-[#FCFCFF]">
            <div className="overflow-x-auto no-scrollbar px-4">
                {/* First Row */}
                <div className="flex flex-row items-center justify-start space-x-5 md:space-x-8 min-w-max">
                    {loading && validCategories.length === 0 ? (
                        [1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col items-center space-y-2 shrink-0">
                                <div className="w-[66px] h-[66px] md:w-[78px] md:h-[78px] bg-gray-50 rounded-t-[33px] rounded-b-[10px] animate-pulse"></div>
                                <div className="w-10 h-2 bg-gray-50 rounded animate-pulse"></div>
                            </div>
                        ))
                    ) : (
                        firstRow.map((cat) => renderCategoryItem(cat))
                    )}
                </div>

                {/* Second Row (Only if > 6) */}
                {(hasTwoRows || (loading && validCategories.length === 0)) && (
                    <div className="flex flex-row items-center justify-start space-x-5 md:space-x-8 mt-5 min-w-max">
                        {loading && validCategories.length === 0 ? (
                            [1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex flex-col items-center space-y-2 shrink-0">
                                    <div className="w-[66px] h-[66px] md:w-[78px] md:h-[78px] bg-gray-50 rounded-t-[33px] rounded-b-[10px] animate-pulse"></div>
                                    <div className="w-10 h-2 bg-gray-50 rounded animate-pulse"></div>
                                </div>
                            ))
                        ) : (
                            secondRow.map((cat) => renderCategoryItem(cat))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryRow;
