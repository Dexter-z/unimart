import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

const NotificationsPage = () => {
    const { data, isLoading, isPlaceholderData } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: async (): Promise<any[]> => {
      const res = await axiosInstance.get('/seller/api/seller-notifications');
      console.log('[Notifications] API response:', res?.status, res?.data);
      const payload = res?.data;
      // Handle various shapes: {notifications: [...]}, {data: [...]}, [...], or paginated .docs
      let list: any = undefined;
      if (Array.isArray(payload?.notifications)) list = payload.notifications;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload)) list = payload;
      else if (payload?.notifications?.docs && Array.isArray(payload.notifications.docs)) list = payload.notifications.docs;
      else if (payload?.data?.docs && Array.isArray(payload.data.docs)) list = payload.data.docs;

      if (Array.isArray(list)) {
        console.log('[Notifications] Normalized list length:', list.length);
        return list;
      }
      console.warn('[Notifications] Unexpected response shape, defaulting to []');
      return [] as any[];
    },
    placeholderData: [] as any[],
  })

  return (
    <div>
      
    </div>
  )
}

export default NotificationsPage
