import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const MenuComponents = ({ categories, navMenu }) => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-y-6 gap-x-4 p-5">
                {categories.map((category) => (
                    <div 
                        key={category._id}
                        onClick={() => navigate(`/products?category=${category.slug}`)}
                        className="flex flex-col items-center group active:scale-95 transition-all"
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-50 overflow-hidden mb-2 border border-gray-100 flex items-center justify-center p-2 group-hover:border-primary transition-colors shadow-sm">
                            <img 
                                src={category.image || 'https://via.placeholder.com/150'} 
                                alt={category.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 text-center leading-tight group-hover:text-primary">
                            {category.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* DYNAMIC SECTIONS FROM API */}
            {navMenu?.customerSections?.map((section, sIdx) => (
                <div key={sIdx} className="px-5 mt-6 mb-8">
                    <h3 className="text-[10px] font-black text-gray-900 mb-4 px-1 uppercase tracking-[0.2em] opacity-30">{section.title}</h3>
                    <div className="space-y-3">
                        {section.items?.map((item, iIdx) => (
                            <div 
                                key={iIdx}
                                onClick={() => navigate(item.path)}
                                className="flex items-center justify-between p-4 bg-white rounded-3xl border border-gray-100 group active:scale-[0.98] transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <ChevronRight size={20} className="opacity-20" />
                                    </div>
                                    <span className="text-sm font-black text-gray-800 tracking-tight">{item.name}</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};


export default MenuComponents;
