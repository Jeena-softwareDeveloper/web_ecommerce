import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Package, 
  RefreshCw, 
  Wallet, 
  Tag, 
  Warehouse, 
  Megaphone, 
  TrendingUp, 
  BarChart2, 
  CheckCircle, 
  Store, 
  Star, 
  HelpCircle,
  ShoppingBag,
  Layers
} from 'lucide-react';

const SupplierSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  // Get supplier details from Redux vendor state
  const { supplierData } = useSelector(state => state.vendor || {});

  // Sidebar Menu configuration
  const menuGroups = [
    {
      title: "Manage Business",
      items: [
        { name: "Inventory", icon: Package, color: "text-red-400", path: "/supplier-inventory" },
        { name: "ERP Stock", icon: Layers, color: "text-blue-400", path: "/supplier-stock" },
        { name: "Orders", icon: ShoppingBag, color: "text-purple-400", path: "/supplier-orders" },
        { name: "Returns", icon: RefreshCw, color: "text-pink-400", path: "/supplier-returns" },
        { name: "Payments", icon: Wallet, color: "text-green-400", path: "/supplier-payments" },
        { name: "Pricing", icon: Tag, color: "text-orange-400", path: "/supplier-pricing" }
      ]
    },
    {
      title: "Performance",
      items: [
        { name: "Business Dashboard", icon: BarChart2, color: "text-green-500", path: "/supplier-dashboard" },
        { name: "Quality Dashboard", icon: CheckCircle, color: "text-cyan-500", path: "/supplier-quality-dashboard" }
      ]
    }
  ];

  return (
    <div className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 h-screen sticky top-0 shrink-0">
      
      {/* Branding Logo */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/25 text-white font-black text-xl">
            W
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight text-base leading-none block">Jeenora</span>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none mt-1 block">Supplier</span>
          </div>
        </div>
      </div>

      {/* Shop Info Card */}
      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 m-3 rounded-2xl border border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-[#7C3AED] shrink-0 border border-purple-200/50">
          <Store size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-black text-gray-900 truncate">
            {supplierData?.shopName || "Seller Store"}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-extrabold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              4.2 <Star size={8} className="fill-purple-700 stroke-purple-700" />
            </span>
            <span className="text-[9px] text-gray-400 font-bold">Gold Seller</span>
          </div>
        </div>
      </div>

      {/* Navigation Group Items */}
      <div className="flex-grow overflow-y-auto px-3 py-2 space-y-6 no-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[9px] font-extrabold text-gray-400 uppercase tracking-[2px] mb-2">{group.title}</h4>
            {group.items.map((item, i) => {
              const isActive = pathname === item.path;
              const IconComponent = item.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left font-bold text-sm ${
                    isActive
                      ? "bg-purple-50 text-[#7C3AED] shadow-sm border border-purple-100/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className={`shrink-0 ${isActive ? "text-[#7C3AED]" : item.color}`}>
                    <IconComponent size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="flex-grow truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left font-bold text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <HelpCircle size={18} className="text-gray-400" />
          <span>Go to Storefront</span>
        </button>
      </div>
    </div>
  );
};

export default SupplierSidebar;
