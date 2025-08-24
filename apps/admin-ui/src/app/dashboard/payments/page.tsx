"use client"

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'
import { Eye, Loader2, DollarSign } from 'lucide-react';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';

interface Payment {
    id: string;
    total: number;
    paymentStatus: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    }
}

const fetchPayments = async (): Promise<Payment[]> => {
    const res = await axiosInstance.get("/order/api/get-seller-payments")
    return res.data.payments;
}

const PaymentsTable = () => {
    const [globalFilter, setGlobalFilter] = useState("")

    const { data: payments = [], isLoading, error } = useQuery({
        queryKey: ["seller-payments"],
        queryFn: fetchPayments,
        staleTime: 1000 * 60 * 5,
    })

    const handleViewPayment = (paymentId: string) => {
        console.log("Payment details button clicked for payment:", paymentId);
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

    const calculatePlatformFee = (total: number) => {
        return total * 0.05; // 5% platform fee
    }

    const calculateSellerCut = (total: number) => {
        return total - calculatePlatformFee(total);
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

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending receipt':
                return 'bg-yellow-600 text-white';
            case 'transferring':
                return 'bg-blue-600 text-white';
            case 'paid out':
                return 'bg-green-600 text-white';
            case 'cancelled':
                return 'bg-red-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    }

    const filteredPayments = payments.filter(payment =>
        payment.id.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (payment.user?.name && payment.user.name.toLowerCase().includes(globalFilter.toLowerCase())) ||
        payment.paymentStatus.toLowerCase().includes(globalFilter.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="ml-2 text-white">Loading payments...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 bg-black">
                <div className="text-red-400">Error loading payments. Please try again.</div>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-lg shadow border border-gray-800">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Payments
                    </h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full sm:w-auto pl-4 pr-4 py-2 bg-gray-900 border border-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden">
                {filteredPayments.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400">
                        No payments found
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {filteredPayments.map((payment) => (
                            <div key={payment.id} className="px-4 py-4 hover:bg-blue-900 transition-colors duration-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">
                                            Order #{truncateOrderId(payment.id)}
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            {payment.user?.name || 'Unknown Customer'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Total: {formatCurrency(payment.total)}
                                        </div>
                                        <div className="text-xs text-red-400">
                                            Platform Fee: -{formatCurrency(calculatePlatformFee(payment.total))}
                                        </div>
                                        <div className="text-xs text-green-400">
                                            Your Cut: {formatCurrency(calculateSellerCut(payment.total))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewPayment(payment.id)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200 ml-2"
                                        title="View Payment Details"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.paymentStatus)}`}>
                                        {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {formatDate(payment.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Buyer Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Order Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Platform Fee (5%)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Your Cut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-800">
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                                    No payments found
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-blue-900 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        #{truncateOrderId(payment.id)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {payment.user?.name || 'Unknown Customer'}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {payment.user?.email || 'No email provided'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {formatCurrency(payment.total)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-400">
                                        -{formatCurrency(calculatePlatformFee(payment.total))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                                        {formatCurrency(calculateSellerCut(payment.total))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.paymentStatus)}`}>
                                            {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {formatDate(payment.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewPayment(payment.id)}
                                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                            title="View Payment Details"
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
            {filteredPayments.length > 0 && (
                <div className="px-4 sm:px-6 py-3 border-t border-gray-800 bg-gray-900">
                    <div className="text-sm text-gray-300">
                        Showing {filteredPayments.length} of {payments.length} payments
                    </div>
                </div>
            )}
        </div>
    );
}

const Page = () => {
    return (
        <div className="p-4 sm:p-6 bg-black min-h-screen">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Payment Management</h1>
                <p className="text-gray-400 mt-1 text-sm sm:text-base">Track and manage your payment receipts</p>
            </div>
            <PaymentsTable />
        </div>
    )
}

export default Page