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
  const {seller, isLoading, isError} = useSeller()

  const content = seller ? (
    <WebSocketProvider seller={seller}>{children}</WebSocketProvider>
  ) : children;

  return (
    <div className="relative">
      {content}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm z-50">
          <div className="text-gray-300 text-sm">Loading seller session...</div>
        </div>
      )}
      {isError && !isLoading && (
        <div className="absolute top-2 right-2 bg-red-500/10 text-red-300 text-xs px-3 py-1 rounded-md border border-red-600/30">
          Seller data failed to load
        </div>
      )}
    </div>
  )
}

export default Providers
