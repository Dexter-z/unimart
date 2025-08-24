"use client"

import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardCards, { DashboardStats } from "./DashboardCards";
import axiosInstance from "../../utils/axiosInstance";

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await axiosInstance.get("/order/api/platform-order-stats");
  return res.data;
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

  return <DashboardCards stats={stats} />;
}
