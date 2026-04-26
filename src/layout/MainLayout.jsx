import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const { pathname } = useLocation();
  
  // Check if it's a supplier dashboard page or a full-screen mobile-like page
  const isSupplierAppPage = 
    pathname.startsWith('/supplier-') || 
    pathname === '/catalog-upload' || 
    pathname === '/offer-zone' ||
    pathname === '/become-supplier';

  if (isSupplierAppPage) {
    return (
      <div className="h-screen bg-white flex flex-col font-sans max-w-md mx-auto border-x border-gray-100 overflow-hidden relative">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow py-2 md:py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
