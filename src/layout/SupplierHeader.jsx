import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Bell,
  Scan,
  Upload,
  Wallet
} from 'lucide-react';

const SupplierHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  // Get supplier details from Redux vendor state
  const { supplierData, financialDashboard } = useSelector(state => state.vendor || {});

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
  };

  // Resolve Header title
  const getHeaderTitle = () => {
    if (pathname === '/supplier-dashboard') return 'Business Overview';
    if (pathname === '/supplier-inventory') return 'Inventory Manager';
    if (pathname === '/supplier-orders') return 'Orders Platform';
    if (pathname === '/supplier-returns') return 'Returns Management';
    if (pathname === '/supplier-payments') return 'Payments & Settlements';
    if (pathname === '/supplier-pricing') return 'Pricing Dashboard';
    if (pathname === '/supplier-warehouse') return 'Warehouse Operations';
    if (pathname === '/offer-zone') return 'Offer Zone';
    if (pathname === '/supplier-promotions') return 'Marketing Promotions';
    if (pathname === '/supplier-price-recommendation') return 'AI Price Recommendations';
    if (pathname === '/supplier-quality-dashboard') return 'Quality & Feedback Dashboard';
    if (pathname === '/supplier-stock') return 'AI Stock Velocity';
    return 'Supplier Portal';
  };

  return (
    <div className="hidden lg:flex items-center justify-between bg-white px-8 py-3 border-b border-gray-200 sticky top-0 z-30 shrink-0">
      <div>
        <h2 className="text-xl font-black text-gray-900">{getHeaderTitle()}</h2>
        <p className="text-xs text-gray-400 font-medium">Jeenora supplier platform operations dashboard</p>
      </div>
      <div className="flex items-center gap-4">
        {pathname === '/supplier-dashboard' && (
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-xl px-4 py-2 text-white flex items-center gap-3 shadow-md shadow-purple-600/10 mr-2">
            <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center shrink-0">
              <Upload size={14} className="text-white" />
            </div>
            <div className="text-left hidden xl:block">
              <h3 className="text-xs font-black leading-tight">Start Selling</h3>
              <p className="text-[10px] text-white/80 leading-none mt-0.5">Add products and start selling</p>
            </div>
            <button 
              onClick={() => navigate('/supplier-inventory')}
              className="bg-white text-[#7C3AED] hover:bg-purple-50 px-3 py-1.5 rounded-lg font-black text-xs transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-95"
            >
              Upload Now
            </button>
          </div>
        )}
        {pathname.startsWith('/supplier-payments') && (
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-xl px-4 py-2 text-white flex items-center gap-3 shadow-md shadow-purple-600/10 mr-2">
            <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center shrink-0">
              <Wallet size={14} className="text-white" />
            </div>
            <div className="text-left hidden xl:block">
              <h3 className="text-xs font-black leading-tight">Available Balance</h3>
              <p className="text-[10px] text-white/80 leading-none mt-0.5">
                Next Payout: {formatDate(financialDashboard?.upcomingPayout?.estimatedDate)}
              </p>
            </div>
            <div className="text-right flex items-center gap-2.5">
              <span className="text-sm font-black whitespace-nowrap">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(financialDashboard?.summary?.availableBalance || 0)}
              </span>
              <button 
                onClick={() => navigate('/supplier-payments?tab=payouts')}
                className="bg-white text-[#7C3AED] hover:bg-purple-50 px-3 py-1.5 rounded-lg font-black text-xs transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-95"
              >
                Request
              </button>
            </div>
          </div>
        )}
        {pathname === '/supplier-inventory' && (
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-scan-barcode-modal'))}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all mr-1 cursor-pointer"
            title="Scan SKU Barcode"
          >
            <Scan size={14} className="text-[#7C3AED]" />
            <span>Scan SKU Barcode</span>
          </button>
        )}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl transition-all border border-gray-100">
          <Bell size={20} />
        </button>
        <div className="h-8 w-px bg-gray-200"></div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-50 text-[#7C3AED] rounded-xl flex items-center justify-center font-bold text-sm border border-purple-100">
            S
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800 leading-none">{supplierData?.shopName || "Seller Store"}</p>
            <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">Supplier ID: {supplierData?._id ? supplierData._id.substring(0, 8) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierHeader;
