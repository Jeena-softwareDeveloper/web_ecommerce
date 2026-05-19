import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Shirt } from 'lucide-react';
import apiClient from '../../api/apiClient';

const resolveImageUrl = (url) => {
    if (!url) return '/placeholder.jpg';
    if (typeof url === 'object' && url.url) url = url.url;
    if (typeof url !== 'string') return url;
    if (url.startsWith('http')) return url.replace('http://', 'https://');
    const baseUrl = (import.meta.env.VITE_API_URL || '').split('/api')[0];
    if (baseUrl) {
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanPath}`;
    }
    return url;
};

const CategoryHorizontalList = ({ 
    selectedCategory, 
    categories, 
    selectedSubCategory, 
    setSelectedSubCategory, 
    setSearchParams, 
    isShrunk, 
    catLoading, 
    categoryQuery,
    handleSubCategoryClick,
    handleCategoryClick,
    setSelectedCategory,
    onSubCategoriesChange
}) => {
    const [subCategories, setSubCategories] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const lastFetchedCategoryId = useRef(null);

    // Fetch subcategories
    useEffect(() => {
        if (selectedCategory?._id) {
            if (lastFetchedCategoryId.current === selectedCategory._id) return;
            lastFetchedCategoryId.current = selectedCategory._id;

            setSubCategories([]);
            setSubLoading(true);
            const fetchSub = async () => {
                try {
                    const response = await apiClient.get('/wear/category/get', { params: { parentId: selectedCategory._id } });
                    const fetchedSubs = response.data.categories || [];
                    setSubCategories(fetchedSubs);
                    if (onSubCategoriesChange) onSubCategoriesChange(fetchedSubs);
                } catch (error) {
                    console.error("Subcategory fetch error", error);
                } finally {
                    setSubLoading(false);
                }
            };
            fetchSub();
        } else {
            setSubCategories([]);
            lastFetchedCategoryId.current = null;
            if (onSubCategoriesChange) onSubCategoriesChange([]);
        }
    }, [selectedCategory?._id, onSubCategoriesChange]);

    // Sync selected sub category silently if URL changes
    const subCategoryQuery = new URLSearchParams(window.location.search).get('subCategory') || '';
    useEffect(() => {
        if (subCategoryQuery && subCategories.length > 0) {
            const foundSub = subCategories.find(c => 
                c._id === subCategoryQuery ||
                (c.slug?.toLowerCase() === subCategoryQuery.toLowerCase()) || 
                (c.name?.toLowerCase() === subCategoryQuery.toLowerCase())
            );
            if (foundSub && (!selectedSubCategory || selectedSubCategory._id !== foundSub._id)) {
                setSelectedSubCategory(foundSub);
            }
        }
    }, [subCategoryQuery, subCategories, selectedSubCategory, setSelectedSubCategory]);

    const displayList = selectedCategory ? (subCategories || []) : (categories || []);
    const validCategories = Array.isArray(displayList) ? displayList : [];
    
    if (validCategories.length === 0 && !catLoading) {
         return null; 
    }

    const isAllSelected = (selectedCategory && !selectedSubCategory && subCategories.length > 0) || (!selectedCategory);

    return (
        <div className={`fixed top-[52px] md:top-[60px] left-0 right-0 bg-white border-b border-gray-100 z-[45] transition-all duration-300 ${isShrunk ? 'h-[50px] shadow-sm' : 'h-[105px]'}`}>
            <div className="flex items-center h-full overflow-x-auto no-scrollbar relative">
                
                <div 
                    onClick={() => { 
                        if (selectedCategory && subCategories.length > 0) {
                            setSelectedSubCategory(null);
                            setSearchParams(p => { 
                                if (categoryQuery) p.set('category', categoryQuery);
                                // Ensure catId is preserved if we have selectedCategory
                                if (selectedCategory._id) p.set('catId', selectedCategory._id);
                                p.delete('subCategory'); 
                                return p; 
                            });
                        } else {
                            setSelectedCategory(null);
                            setSelectedSubCategory(null);
                            setSearchParams(p => { p.delete('category'); p.delete('subCategory'); return p; });
                        }
                    }} 
                    className={`sticky left-0 z-[50] flex shrink-0 transition-all duration-300 cursor-pointer ${isShrunk ? 'px-4 py-2 bg-white' : 'flex-col items-center w-24 px-4 bg-white'}`}
                    style={{ 
                        backgroundColor: 'white',
                        borderColor: isAllSelected ? '#e11955' : 'transparent',
                        boxShadow: '15px 0 15px -10px rgba(0,0,0,0.08)'
                    }}
                >
                    <div className={`flex flex-col items-center w-full h-full ${isAllSelected ? 'bg-rose-50/50' : ''} rounded-xl py-1 transition-all`}>
                        {!isShrunk && (
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1.5 transition-all ${isAllSelected ? 'bg-rose-50 border-2 border-[#e11955]' : 'bg-gray-50 border border-gray-100'}`}>
                                <LayoutGrid size={22} className={isAllSelected ? 'text-[#e11955]' : 'text-gray-400'} />
                            </div>
                        )}
                        <span className={`text-[10px] font-semibold uppercase tracking-tight self-center ${isAllSelected ? 'text-[#e11955]' : 'text-gray-400'}`}>
                            All
                        </span>
                    </div>
                </div>

                {!isShrunk && <div className="w-[1.5px] h-12 bg-gray-50 shrink-0 self-center rounded-full mr-3" />}
                
                <div className={`flex items-center space-x-6 pr-6 transition-all duration-300 ${isShrunk ? 'items-center h-full' : 'items-start pt-3'}`}>

                {validCategories.map((cat) => {
                    const isSelected = selectedSubCategory?._id === cat._id || (selectedCategory?._id === cat._id && !selectedSubCategory);
                    
                    return (
                        <div 
                            key={cat._id} 
                            onClick={() => {
                                if (selectedCategory && subCategories.length > 0) {
                                    handleSubCategoryClick(cat);
                                } else {
                                    handleCategoryClick(cat);
                                }
                            }} 
                            className={`flex shrink-0 transition-all duration-500 cursor-pointer relative group ${isShrunk ? 'px-5 py-2 rounded-xl border' : 'flex-col items-center w-20'}`}
                            style={{ 
                                borderColor: isSelected && isShrunk ? '#e11955' : 'transparent',
                                backgroundColor: isSelected && isShrunk ? 'rgba(225, 25, 85, 0.05)' : ''
                            }}
                        >
                            {!isShrunk && (
                                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div 
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1.1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                className="absolute inset-0 bg-rose-100/60 rounded-2xl blur-md z-0"
                                            />
                                        )}
                                    </AnimatePresence>

                                    <div className={`relative z-10 w-14 h-14 rounded-xl overflow-hidden transition-all duration-500 ${isSelected ? 'scale-105 shadow-lg shadow-primary/20' : 'group-hover:scale-105'}`}>
                                        {cat.image ? (
                                            <img 
                                                src={resolveImageUrl(cat.image)} 
                                                className="w-full h-full object-cover" 
                                                alt={cat.name}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-50 flex items-center justify-center border border-gray-100 rounded-xl">
                                                <Shirt size={20} className={isSelected ? 'text-[#e11955]' : 'text-gray-300'} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-tight truncate transition-all relative z-10 ${isShrunk ? 'max-w-none' : 'w-full text-center'} ${isSelected ? 'text-[#e11955]' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                {cat.name}
                            </span>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
};

export default CategoryHorizontalList;
