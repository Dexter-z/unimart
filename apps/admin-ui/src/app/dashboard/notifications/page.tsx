"use client"

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import React, { useState } from "react";


export default function NotificationsPage() {

  const {data, isLoading} = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/api/get-all-notifications');
      return res.data.notifications;
    }
  })

  return (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-3xl font-bold text-[#ff8800]">Notifications</h1>
    </div>
  );
}
