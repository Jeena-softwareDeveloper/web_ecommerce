import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white flex flex-col">
      <main className="flex-grow py-2 md:py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
