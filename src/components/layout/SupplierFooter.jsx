import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingBag, Menu, BarChart2 } from 'lucide-react';

const SupplierFooter = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Home', path: '/supplier-dashboard', icon: <Home size={22} /> },
        { name: 'Inventory', path: '/supplier-inventory', icon: <Package size={22} /> },
        { name: 'Orders', path: '/supplier-orders', icon: <ShoppingBag size={22} /> },
        { name: 'Menu', path: '/supplier-menu', icon: <Menu size={22} /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50 max-w-md mx-auto border-x shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                    <button 
                        key={tab.name}
                        onClick={() => navigate(tab.path)}
                        className="flex flex-col items-center justify-center flex-1"
                    >
                        <div className={`transition-all duration-300 ${isActive ? 'text-[#7C3AED] -translate-y-0.5' : 'text-gray-400'}`}>
                            {React.cloneElement(tab.icon, { 
                                size: 22, 
                                strokeWidth: isActive ? 2.5 : 2 
                            })}
                        </div>
                        <span className={`text-[10px] mt-1 font-bold tracking-tight ${isActive ? 'text-[#7C3AED]' : 'text-gray-400'}`}>
                            {tab.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default SupplierFooter;
