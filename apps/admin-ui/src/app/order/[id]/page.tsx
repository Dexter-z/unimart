"use client"

import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, Package, User, MapPin, Calendar, DollarSign, Loader2, ShoppingBag } from 'lucide-react'
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance'

const statuses = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
]

interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    selectedOptions?: any;
    product?: {
        id: string;
        title: string;
        images: any[];
    };
}

interface Order {
    id: string;
    userId: string;
    sellerId: string;
    shopId: string;
    total: number;
    status: string;
    shippingAddressId?: string;
    couponCode?: string;
    discountAmount?: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    shippingAdress?: {
        id: string;
        name: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        landmark: string;
        addressType: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
    };
}

const Page = () => {
    const params = useParams()
    const orderId = params.id as string

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const router = useRouter()

    const fetchOrder = async () => {
        try {
            const res = await axiosInstance.get(`/order/api/get-admin-order-details/${orderId}`)
            setOrder(res.data.order)
        } catch (error) {
            setLoading(false)
            console.log("Failed to fetch order details ", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const newStatus = e.target.value
        setUpdating(true)
        try {
            await axiosInstance.put(`/order/api/update-status/${order?.id}`, {
                status: newStatus
            })
            setOrder((prev: any) => ({ ...prev, status: newStatus }))
        } catch (error) {
            console.log("Failed to update order status ", error)
        } finally {
            setUpdating(false)
        }
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const getStatusColor = (status: string) => {
        return 'bg-green-600 text-white';
    }

    const truncateOrderId = (id: string) => {
        return id.slice(-8);
    }

    useEffect(() => {
        if (orderId) {
            fetchOrder()
        }
    }, [orderId])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <span className="text-white text-lg">Loading order details...</span>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Order Not Found</h2>
                    <p className="text-gray-400 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Orders
                </button>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            Order #{truncateOrderId(order.id)}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Created on {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-2xl font-bold text-white">
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-black border border-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <ShoppingBag className="h-5 w-5 mr-2" />
                                Order Items ({order.items.length})
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-800 last:border-b-0">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                                                <Package className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium">
                                                    {item.product?.title || `Product #${item.productId.slice(-6)}`}
                                                </h3>
                                                <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                                                {item.selectedOptions && (
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        Options: {JSON.stringify(item.selectedOptions)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-semibold">{formatCurrency(item.price)}</p>
                                            <p className="text-gray-400 text-sm">per item</p>
                                            <p className="text-green-400 font-medium">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-black border border-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                Order Summary
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                                </div>
                                {order.discountAmount && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                        <span>-{formatCurrency(order.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-800 pt-3">
                                    <div className="flex justify-between text-white font-semibold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Update */}
                    <div className="bg-black border border-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-semibold text-white">Update Status</h2>
                        </div>
                        <div className="p-6">
                            <select
                                value={order.status}
                                onChange={handleStatusChange}
                                disabled={updating}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {updating && (
                                <div className="flex items-center mt-2 text-blue-400">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm">Updating status...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-black border border-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Customer
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-400 text-sm">Name</p>
                                    <p className="text-white font-medium">{order.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Email</p>
                                    <p className="text-white">{order.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Customer ID</p>
                                    <p className="text-white font-mono text-sm">#{order.user.id.slice(-8)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAdress && (
                        <div className="bg-black border border-gray-800 rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-800">
                                <h2 className="text-xl font-semibold text-white flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Shipping Address
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-400 text-sm">Name</p>
                                        <p className="text-white font-medium">{order.shippingAdress.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Phone</p>
                                        <p className="text-white">{order.shippingAdress.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Address</p>
                                        <p className="text-white">{order.shippingAdress.address}</p>
                                        {order.shippingAdress.landmark && (
                                            <p className="text-gray-400 text-sm">Near {order.shippingAdress.landmark}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">City & State</p>
                                        <p className="text-white">{order.shippingAdress.city}, {order.shippingAdress.state}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Address Type</p>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                                            {order.shippingAdress.addressType.charAt(0).toUpperCase() + order.shippingAdress.addressType.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Timeline */}
                    <div className="bg-black border border-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Timeline
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-white font-medium">Order Created</p>
                                        <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
                                    </div>
                                </div>
                                {order.updatedAt !== order.createdAt && (
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="text-white font-medium">Last Updated</p>
                                            <p className="text-gray-400 text-sm">{formatDate(order.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page
