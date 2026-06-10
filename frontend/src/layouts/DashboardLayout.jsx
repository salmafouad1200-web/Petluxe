import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sidebar Navigation - Hidden on Mobile completely (since BottomNav is used) */}
      <div className="hidden lg:block">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main viewport area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Navbar */}
        <Navbar onMenuOpen={() => setSidebarOpen(true)} pageTitle={title} />

        {/* Inner Content Area - added pb-20 for mobile bottom nav */}
        <main className="flex-1 p-6 md:p-8 pb-24 lg:pb-8 animate-in fade-in duration-300">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
