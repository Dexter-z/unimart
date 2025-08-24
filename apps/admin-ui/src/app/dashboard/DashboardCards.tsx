import React from "react";
import { DollarSign, Percent, ShoppingCart, Users } from "lucide-react";

export interface DashboardStats {
  totalRevenue: number;
  platformFees: number;
  totalOrders: number;
  totalUsers: number;
}

export default function DashboardCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-[#232326] rounded-2xl p-6 flex items-center gap-4 shadow">
        <DollarSign className="w-8 h-8 text-[#ff8800]" />
        <div>
          <div className="text-lg font-semibold text-white">Total Platform Revenue</div>
          <div className="text-2xl font-bold text-[#ff8800]">₦{stats.totalRevenue.toLocaleString()}</div>
        </div>
      </div>
      <div className="bg-[#232326] rounded-2xl p-6 flex items-center gap-4 shadow">
        <Percent className="w-8 h-8 text-[#ff8800]" />
        <div>
          <div className="text-lg font-semibold text-white">Generated Platform Fees</div>
          <div className="text-2xl font-bold text-[#ff8800]">₦{stats.platformFees.toLocaleString()}</div>
        </div>
      </div>
      <div className="bg-[#232326] rounded-2xl p-6 flex items-center gap-4 shadow">
        <ShoppingCart className="w-8 h-8 text-[#ff8800]" />
        <div>
          <div className="text-lg font-semibold text-white">Total Orders</div>
          <div className="text-2xl font-bold text-[#ff8800]">{stats.totalOrders.toLocaleString()}</div>
        </div>
      </div>
      <div className="bg-[#232326] rounded-2xl p-6 flex items-center gap-4 shadow">
        <Users className="w-8 h-8 text-[#ff8800]" />
        <div>
          <div className="text-lg font-semibold text-white">Total Users</div>
          <div className="text-2xl font-bold text-[#ff8800]">{stats.totalUsers.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
