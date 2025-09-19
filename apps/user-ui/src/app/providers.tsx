"use client"
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "sonner"
import useUser from '@/hooks/useUser';
import { WebSocketProvider } from '@/context/web-socket-context';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({
    // If issues arise, delete this whole object
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    }
  }))
  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>{children}</ProvidersWithWebSocket>
      <Toaster />
    </QueryClientProvider>
  )
}

const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {user, isLoading, isError} = useUser()

  // Mark optional values as intentionally observed (avoids unused warnings in some build pipelines)
  void isError;

  const content = user ? (
    <WebSocketProvider user={user}>{children}</WebSocketProvider>
  ) : children;

  // If loading, we now just render content immediately without overlay.
  if(isLoading) {
    // Minimal console trace (can be removed later)
    // eslint-disable-next-line no-console
    console.debug('[user-ui] Loading user session...');
  }
  return content;
}

export default Providers
