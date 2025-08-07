"use client"

import React, { useEffect } from 'react'
import {CheckCircle, Truck} from "lucide-react"
import { useSearchParams, useRouter } from 'next/navigation'
import { useStore } from '@/store'
import confetti from 'canvas-confetti'


const PaymentSuccessPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const sessionId = searchParams.get("sessionId")

    //Clear Cart and trigger confetti
    useEffect(() => {
        useStore.setState({cart: []})

        //Confetti
        confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
        })
    }, [])

  return (
    <div>
      
    </div>
  )
}

export default PaymentSuccessPage
