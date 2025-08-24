import React from "react";
import { DollarSign, Percent, ShoppingCart, Users } from "lucide-react";

export interface DashboardStats {
  totalRevenue: number | string | null;
  platformFees: number | string | null;
  totalOrders: number | string | null;
  totalUsers: number | string | null;
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
  // Accept isLoading and error props
  // @ts-ignore
  const { isLoading, error } = arguments[0];
  const values = [
    stats.totalRevenue === null ? <span className="animate-pulse bg-gray-700 rounded h-7 w-24 inline-block" />
      : stats.totalRevenue === "error" ? <span className="text-red-500">Error</span>
      : `₦${Number(stats.totalRevenue).toLocaleString()}`,
    stats.platformFees === null ? <span className="animate-pulse bg-gray-700 rounded h-7 w-24 inline-block" />
      : stats.platformFees === "error" ? <span className="text-red-500">Error</span>
      : `₦${Number(stats.platformFees).toLocaleString()}`,
    stats.totalOrders === null ? <span className="animate-pulse bg-gray-700 rounded h-7 w-16 inline-block" />
      : stats.totalOrders === "error" ? <span className="text-red-500">Error</span>
      : Number(stats.totalOrders).toLocaleString(),
    stats.totalUsers === null ? <span className="animate-pulse bg-gray-700 rounded h-7 w-16 inline-block" />
      : stats.totalUsers === "error" ? <span className="text-red-500">Error</span>
      : Number(stats.totalUsers).toLocaleString(),
    3 // static value for pending payouts
  ];
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {icons.map((Icon, i) => (
          <div key={i} className="bg-black border border-gray-800 rounded-lg p-4 md:p-6 hover:border-gray-700 transition-colors duration-200">
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
    </div>
  );
}
