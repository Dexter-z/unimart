import React from "react";
import { DollarSign, Percent, ShoppingCart, Users } from "lucide-react";

export interface DashboardStats {
  totalRevenue: number;
  platformFees: number;
  totalOrders: number;
  totalUsers: number;
}

export default function DashboardCards({ stats }: { stats: DashboardStats }) {
  // Seller UI color classes
  const iconBg = [
    "bg-blue-600",    // Revenue
    "bg-green-600",   // Fees
    "bg-yellow-600",  // Orders
    "bg-purple-600",  // Users
    "bg-red-600"      // Pending Payouts
  ];
  const icons = [DollarSign, Percent, ShoppingCart, Users, Percent];
  const titles = [
    "Total Platform Revenue",
    "Generated Platform Fees",
    "Total Orders",
    "Total Users",
    "Pending Payouts"
  ];
  const values = [
    `₦${stats.totalRevenue.toLocaleString()}`,
    `₦${stats.platformFees.toLocaleString()}`,
    stats.totalOrders.toLocaleString(),
    stats.totalUsers.toLocaleString(),
    3 // static value for pending payouts
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {icons.map((Icon, i) => (
        <div key={i} className="bg-black border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium">{titles[i]}</div>
              <div className="text-2xl font-bold text-white mt-1">{values[i]}</div>
            </div>
            <div className={`${iconBg[i]} p-3 rounded-full`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
