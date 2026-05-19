import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_wear_categories } from '../../store/reducers/wearCategoryReducer';
import { get_nav_menu } from '../../store/reducers/configReducer';
import MenuComponents from './components/MenuComponents';
import { Search, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuNameScreenPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categories, loader } = useSelector(state => state.wearCategory);
    const { navMenu } = useSelector(state => state.config);

    useEffect(() => {
        dispatch(get_wear_categories());
        dispatch(get_nav_menu('customer'));
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* HEADER */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Browse Categories</h1>
                <div className="flex items-center gap-4">
                    <Search className="text-gray-400" size={22} />
                    <ShoppingBag className="text-gray-400" size={22} />
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex flex-col">
                {loader ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <MenuComponents categories={categories} navMenu={navMenu} />
                )}
            </div>
        </div>
    );
};

export default MenuNameScreenPage;
