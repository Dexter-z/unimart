"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  CreditCard,
  Package,
  Calendar,
  Users,
  UserCheck,
  ListChecks,
  Settings,
  Bell,
  Palette,
  LogOut,
} from "lucide-react";

const sidebarGroups = [
  {
    label: "Main Menu",
    items: [
      { name: "Dashboard", icon: Home, path: "/dashboard" },
      { name: "Orders", icon: ShoppingCart, path: "/dashboard/orders" },
      { name: "Payments", icon: CreditCard, path: "/dashboard/payments" },
      { name: "Products", icon: Package, path: "/dashboard/products" },
      { name: "Events", icon: Calendar, path: "/dashboard/events" },
      { name: "Users", icon: Users, path: "/dashboard/users" },
      { name: "Sellers", icon: UserCheck, path: "/dashboard/sellers" },
    ],
  },
  {
    label: "Controllers",
    items: [
      { name: "Loggers", icon: ListChecks, path: "/dashboard/loggers" },
      { name: "Management", icon: Settings, path: "/dashboard/management" },
      { name: "Notifications", icon: Bell, path: "/dashboard/notifications" },
    ],
  },
  {
    label: "Customizations",
    items: [
      { name: "All Customization", icon: Palette, path: "/dashboard/customizations" },
    ],
  },
  {
    label: "Extras",
    items: [
      { name: "Log Out", icon: LogOut, path: "/dashboard/logout" },
    ],
  },
];

export default function AdminSidebar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNav = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`
          fixed md:static z-50 h-screen w-64 bg-[#18181b] border-r border-[#232326] flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:w-64 md:min-w-64
        `}
        style={{ top: 0, left: 0 }}
      >
        <div className="flex items-center justify-between px-6 py-4 md:hidden">
          <span className="text-xl font-bold text-white">Admin</span>
          <button onClick={() => setOpen(false)} className="text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <div className="px-6 py-2 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                {group.label}
              </div>
              <ul>
                {group.items.map((item) => (
                  <li key={item.name}>
                    <button
                      className={`w-full flex items-center gap-3 px-6 py-3 text-left rounded-lg transition-colors font-medium text-gray-300 hover:bg-[#232326] hover:text-white ${pathname === item.path ? "bg-[#232326] text-[#ff8800]" : ""}`}
                      onClick={() => handleNav(item.path)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
