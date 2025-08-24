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

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (error || !data) return <div className="text-red-500">Error loading stats</div>;

  return <DashboardCards stats={data} />;
}
