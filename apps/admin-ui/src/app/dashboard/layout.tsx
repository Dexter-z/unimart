"use client"

import React, { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
  <div className="min-h-screen flex flex-col bg-black">
      {/* Top bar for all screens */}
  <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800">
        {/* Menu button only on mobile */}
        <button onClick={() => setSidebarOpen(true)} className="text-gray-400 md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-xl font-bold text-white">Admin Dashboard</span>
        <div style={{ width: 24 }} /> {/* Spacer for alignment */}
      </div>
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="z-50">
          <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        </div>
        {/* Main content */}
  <main className="flex-1 min-h-screen bg-black p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
