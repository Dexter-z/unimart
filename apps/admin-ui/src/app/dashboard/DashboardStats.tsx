"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardCards, { DashboardStats } from "./DashboardCards";
import axiosInstance from "../../utils/axiosInstance";

async function fetchRecentOrders() {
  const res = await axiosInstance.get("/order/api/recent-orders");
  return res.data;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await axiosInstance.get("/order/api/platform-order-stats");
  return res.data;
}

function getStatusColor(status: string) {
  switch (status) {
    case "Paid":
      return "bg-green-600 text-white";
    case "Pending":
      return "bg-yellow-600 text-white";
    case "Cancelled":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
}


function RecentOrdersTable({ orders, isLoading, error }: { orders?: any[]; isLoading: boolean; error: any }) {
  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
      <div className="bg-black border border-gray-800 rounded-lg overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-3 text-gray-400">Order ID</th>
              <th className="px-6 py-3 text-gray-400">Customer Name</th>
              <th className="px-6 py-3 text-gray-400">Total Amount</th>
              <th className="px-6 py-3 text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <span className="animate-pulse bg-gray-700 rounded h-6 w-32 inline-block" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-red-500">Error loading orders</td>
              </tr>
            ) : orders && orders.length > 0 ? (
              orders.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-800">
                  <td className="px-6 py-4 text-white font-mono">#{order.id.slice(-6)}</td>
                  <td className="px-6 py-4 text-gray-300">{order.customerName}</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">₦{order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">No recent orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardStatsSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  // Prepare values for each card
  const stats = {
    totalRevenue: isLoading ? null : error ? "error" : (data?.totalRevenue ?? null),
    platformFees: isLoading ? null : error ? "error" : (data?.platformFees ?? null),
    totalOrders: isLoading ? null : error ? "error" : (data?.totalOrders ?? null),
    totalUsers: isLoading ? null : error ? "error" : (data?.totalUsers ?? null),
    // pending payouts is always static
  };

  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: fetchRecentOrders,
  });

  return (
    <>
      <DashboardCards stats={stats} />
      <RecentOrdersTable
        orders={orders as any[]}
        isLoading={ordersLoading}
        error={ordersError}
      />
    </>
  );
}
