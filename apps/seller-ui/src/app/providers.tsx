"use client"
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useSeller from '@/hooks/useSeller';
import { WebSocketProvider } from '@/context/web-socket-context';

// Simple boundary to prevent entire blank screen if a child throws
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: any}> {
  constructor(props: any){
    super(props); this.state = { error: null };
  }
  static getDerivedStateFromError(error: any){
    return { error };
  }
  override componentDidCatch(error: any, info: any){
    // eslint-disable-next-line no-console
    console.error('Seller UI Provider ErrorBoundary caught:', error, info);
  }
  override render(){
    if(this.state.error){
      return <div className="p-6 text-sm text-red-400">Something went wrong loading the seller UI. Check console/logs.</div>;
    }
    return this.props.children;
  }
}

const Providers = ({children}: {children:React.ReactNode}) => {
    const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ProvidersWithWebSocket>
          {children}
        </ProvidersWithWebSocket>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {seller, isLoading, isError, refetch} = useSeller()
  // Mark optional values as intentionally observed (avoids unused warnings in some build pipelines)
  void isError; void refetch;

  const content = seller ? (
    <WebSocketProvider seller={seller}>{children}</WebSocketProvider>
  ) : children;

  // If loading, we now just render content immediately without overlay.
  if(isLoading) {
    // Minimal console trace (can be removed later)
    // eslint-disable-next-line no-console
    console.debug('[seller-ui] Loading seller session...');
  }
  return content;
}

export default Providers
