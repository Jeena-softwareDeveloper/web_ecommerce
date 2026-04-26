import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_nav_menu } from '../../store/reducers/configReducer';
import * as LucideIcons from 'lucide-react';
import SupplierFooter from '../../components/layout/SupplierFooter';

// Dynamic Icon Component
const DynamicIcon = ({ name, ...props }) => {
    const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
    return <Icon {...props} />;
};

const SupplierMenu = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { navMenu } = useSelector(state => state.config);
    const { supplierData } = useSelector(state => state.vendor);

    useEffect(() => {
        dispatch(get_nav_menu('supplier'));
    }, [dispatch]);

    const sections = navMenu.supplier || [];

    return (
        <>
            {/* ANDROID MENU HEADER */}
            <div className="px-5 py-4 bg-white border-b border-gray-50 flex items-center h-[60px] sticky top-0 z-50">
                <span className="text-[20px] font-black text-gray-900 leading-none">Menu</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* PROFILE HEADER - EXACT ANDROID UI */}
                <div className="bg-white px-5 py-6 flex items-center mb-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mr-4 border border-blue-100 text-[#5B21B6]">
                        <DynamicIcon name="Store" size={32} />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-black text-gray-900 leading-tight">
                            {supplierData?.shopName || 'Fashion Store'}
                        </h2>
                        <div className="flex items-center mt-1">
                            <div className="bg-purple-100 px-2 py-0.5 rounded flex items-center mr-3">
                                <span className="text-purple-700 font-bold text-[12px] mr-1">4.2</span>
                                <DynamicIcon name="Star" size={12} className="text-[#5B21B6] fill-[#5B21B6]" />
                            </div>
                            <span className="text-gray-400 text-[12px] font-bold">Gold Supplier</span>
                        </div>
                    </div>
                </div>

                {/* MENU SECTIONS */}
                {sections.length > 0 ? (
                    sections.map((section, idx) => (
                        <div key={idx} className="bg-white mt-4 first:mt-0">
                            <div className="px-5 py-3 border-b border-gray-50">
                                <span className="text-gray-400 text-[11px] font-black uppercase tracking-[2px]">{section.title}</span>
                            </div>
                            {section.items.map((item, i) => (
                                <button 
                                    key={i}
                                    onClick={() => item.path && navigate(item.path)}
                                    className="w-full flex items-center px-5 py-4 border-b border-gray-50 last:border-0 active:bg-gray-50 transition-colors"
                                >
                                    <div className={`w-8 flex justify-center mr-3 ${item.color || 'text-gray-600'}`}>
                                        <DynamicIcon name={item.icon} size={20} />
                                    </div>
                                    <span className="flex-1 text-left text-[14px] text-gray-700 font-bold">{item.name}</span>
                                    <div className="flex items-center">
                                        {item.locked && (
                                            <span className="text-[8px] text-purple-600 font-black mr-2 uppercase bg-purple-50 px-1.5 py-0.5 rounded tracking-widest">Locked</span>
                                        )}
                                        <LucideIcons.ChevronRight size={18} className="text-gray-300" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <DynamicIcon name="Loader2" className="animate-spin mb-4" />
                        <p className="text-sm font-bold">Loading Menu...</p>
                    </div>
                )}
            </div>

            <SupplierFooter />
        </>
    );
};

export default SupplierMenu;
