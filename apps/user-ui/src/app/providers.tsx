"use client"
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {Toaster} from "sonner"

const Providers = ({children}: {children:React.ReactNode}) => {
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
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}

export default Providers
