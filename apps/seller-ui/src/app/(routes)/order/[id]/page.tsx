"use client"

import axiosInstance from '@/utils/axiosInstance'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const statuses = [
    "Ordered",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
]

const Page = () => {
    const params = useParams()
    const orderId = params.id as string

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const router = useRouter()

    const fetchOrder = async () => {
        try {
            const res = await axiosInstance.get(`/order/api/get-order-details/${orderId}`)
            setOrder(res.data.order)
        } catch (error) {
            setLoading(false)
            console.log("Failed to fetch order details ", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async(
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const newStatus = e.target.value
        setUpdating(true)
        try {
            await axiosInstance.put(`/order/api/update-status/${order.id}`, {
                deliveryStatus: newStatus
            })
            setOrder((prev: any) => ({...prev, deliveryStatus: newStatus}))
        } catch (error) {
            console.log("Failed to update order status ", error)
        } finally {
            setUpdating(false)
        }
    }

    useEffect(() => {
        if(orderId) {
            fetchOrder()
        }
    }, [orderId])

    if(loading) {

    }

    if(!order) {
        
    }

  return (
    <div>
      
    </div>
  )
}

export default Page
