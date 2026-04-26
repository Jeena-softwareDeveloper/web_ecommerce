import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow py-2 md:py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
