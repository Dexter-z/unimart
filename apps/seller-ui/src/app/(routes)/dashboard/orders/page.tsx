import axiosInstance from '@/utils/axiosInstance'
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'


const fetchOrders = async () => {
    const res = await axiosInstance.get("/order/api/get-seller-orders")
    return res.data.orders;
}

const OrdesTable = () => {
    const [globalFilter, setGlobalFilter] = useState("")

    const {data: orders = [], isLoading} = useQuery({
        queryKey: ["seller-orders"],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5,
    })
}

const Page = () => {
  return (
    <div>
      
    </div>
  )
}

export default Page
