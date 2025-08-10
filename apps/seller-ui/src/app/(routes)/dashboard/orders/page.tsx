"use client"

import axiosInstance from '@/utils/axiosInstance'
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'
import { Eye, Loader2 } from 'lucide-react';

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    }
}

const fetchOrders = async (): Promise<Order[]> => {
    const res = await axiosInstance.get("/order/api/get-seller-orders")
    return res.data.orders;
}

const OrdersTable = () => {
    const [globalFilter, setGlobalFilter] = useState("")

    const { data: orders = [], isLoading, error } = useQuery({
        queryKey: ["seller-orders"],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5,
    })

    const handleViewOrder = (orderId: string) => {
        console.log("Order details button clicked for order:", orderId);
    }

    const truncateOrderId = (id: string) => {
        return id.slice(-5);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(globalFilter.toLowerCase()) ||
        order.user.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        order.status.toLowerCase().includes(globalFilter.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="ml-2 text-white">Loading orders...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 bg-black">
                <div className="text-red-400">Error loading orders. Please try again.</div>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-lg shadow border border-gray-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Orders</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-4 pr-4 py-2 bg-gray-900 border border-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Total Paid
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Date Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-800">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-blue-900 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        #{truncateOrderId(order.id)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {order.user.name}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {order.user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {formatCurrency(order.total)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewOrder(order.id)}
                                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                            title="View Order Details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {filteredOrders.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-800 bg-gray-900">
                    <div className="text-sm text-gray-300">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                </div>
            )}
        </div>
    );
}

const Page = () => {
    return (
        <div className="p-6 bg-black min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Orders Management</h1>
                <p className="text-gray-400 mt-1">Manage and track all your orders</p>
            </div>
            <OrdersTable />
        </div>
    )
}

export default Page
