"use client"

import useDeviceTracking from '@/hooks/useDeviceTracking'
import useLocationTracking from '@/hooks/useLocationTracking'
import useUser from '@/hooks/useUser'
import { useStore } from '@/store'
import { useRouter } from 'next/navigation'
import React from 'react'

const CartPage = () => {
    const router = useRouter()
    const {user} = useUser()

    const location = useLocationTracking()
    const deviceInfo = useDeviceTracking()
    const cart = useStore((state: any) => state.cart);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
  return (
    <div>
      
    </div>
  )
}

export default CartPage
