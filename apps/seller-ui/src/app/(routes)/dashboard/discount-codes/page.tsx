"use client"

import axiosInstance from '@/utils/axiosInstance'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

const Page = () => {
    const { data: discountCodes = [], isLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-discount-codes")
            return res?.data?.discount_codes || []
        }
    })
    return (
        <div>

        </div>
    )
}

export default Page
