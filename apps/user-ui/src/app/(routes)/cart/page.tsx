"use client"

import useDeviceTracking from '@/hooks/useDeviceTracking'
import useLocationTracking from '@/hooks/useLocationTracking'
import useUser from '@/hooks/useUser'
import { useStore } from '@/store'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const CartPage = () => {
    const router = useRouter()
    const {user} = useUser()
    const {loading, setLoading} = useState(false)
    const {discountedProductId, setDiscountedProductId} = useState("")
    const {discountedPercent, setDiscountedPercent} = useState(0)
    const {discountedPrice, setDiscountedPrice} = useState(0)
    const {discountAmount, setDiscountAmount} = useState(0)

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
