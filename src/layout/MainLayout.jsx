import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SupplierSidebar from './SupplierSidebar';
import SupplierHeader from './SupplierHeader';

const MainLayout = () => {
  const { pathname } = useLocation();

  // Check if it's a supplier dashboard page or a full-screen mobile-like page
  const isSupplierAppPage = 
    pathname.startsWith('/supplier-') || 
    pathname === '/catalog-upload' || 
    pathname === '/offer-zone' ||
    pathname === '/become-supplier';

  if (!isSupplierAppPage) {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex flex-col">
        <div className="max-w-[1280px] w-full mx-auto bg-white min-h-screen relative shadow-xl flex flex-col overflow-x-hidden">
          <main className="flex-grow flex flex-col w-full">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-gray-50 font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR OVERRIDES CSS */}
      <style>{`
        @media (min-width: 1024px) {
          /* Hide mobile top headers and bottom footer navigation bar */
          .fixed.top-0.max-w-md,
          .fixed.top-0.h-14,
          .fixed.top-0.left-0.right-0.z-50,
          .fixed.bottom-0.max-w-md,
          .fixed.bottom-0.h-16 {
            display: none !important;
          }

          /* Remove custom mobile top & bottom paddings */
          .pt-\\[110px\\],
          .pt-\\[120px\\],
          .pt-14,
          .pt-16,
          .pb-20,
          .pb-24 {
            padding-top: 0px !important;
            padding-bottom: 0px !important;
          }

          /* Remove narrow mobile card borders and max widths */
          .max-w-md {
            max-width: 100% !important;
          }

          /* Allow grid elements to expand beautifully */
          .grid {
            width: 100% !important;
          }

          /* General supplier content adjustments */
          .h-screen.h-\\[100dvh\\] {
            height: auto !important;
            overflow: visible !important;
            background-color: transparent !important;
          }
        }
      `}</style>

      {/* DESKTOP LEFT SIDEBAR */}
      <SupplierSidebar />

      {/* CONTENT AREA WRAPPER */}
      <div className="flex-grow h-screen overflow-y-auto bg-gray-50 flex flex-col relative w-full lg:overflow-x-hidden">
        
        {/* DESKTOP HEADER */}
        <SupplierHeader />

        {/* CONTAINER CONTENT */}
        <div className="w-full flex-grow lg:p-4 lg:h-auto h-auto bg-gray-200 lg:bg-transparent max-w-md mx-auto border-x border-gray-100 lg:max-w-none lg:border-0 flex flex-col lg:overflow-visible overflow-visible relative">
            <Outlet />
          </div>
      
      </div>

    </div>
  );
};

export default MainLayout;
