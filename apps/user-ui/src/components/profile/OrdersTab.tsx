import React, { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck,
  Calendar,
  Eye,
  Search,
  Filter,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  userId: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderDetailsResponse {
  success: boolean;
  order: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    userId: string;
    couponCode?: string;
    discountAmount?: number;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      productTitle?: string;
      productId?: string;
    }>;
  };
}

const fetchUserOrders = async (): Promise<Order[]> => {
  const res = await axiosInstance.get("/order/api/get-user-orders")
  return res.data.orders;
}

const fetchOrderDetails = async (orderId: string): Promise<OrderDetailsResponse> => {
  const res = await axiosInstance.get(`/order/api/get-order-details/${orderId}`)
  return res.data;
}

const OrdersTab = () => {
  const [globalFilter, setGlobalFilter] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ["user-orders"],
    queryFn: fetchUserOrders,
    staleTime: 1000 * 60 * 5,
  })

  // Mutation for fetching order details
  const orderDetailsMutation = useMutation({
    mutationFn: fetchOrderDetails,
    onSuccess: (data) => {
      console.log("Order details:", data);
      setOrderDetails(data);
      setShowDetailsModal(true);
    },
    onError: (error) => {
      console.error("Error fetching order details:", error);
      alert("Failed to fetch order details. Please try again.");
    }
  })

  const handleRefresh = () => {
    refetch();
  }

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    orderDetailsMutation.mutate(orderId);
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setOrderDetails(null);
    setSelectedOrderId(null);
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDetailsModal) {
        closeDetailsModal();
      }
    };

    if (showDetailsModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showDetailsModal]);

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
    });
  }

  const truncateOrderId = (id: string) => {
    return id.slice(-8);
  }

  // Filter orders based on search
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(globalFilter.toLowerCase()) ||
    order.status.toLowerCase().includes(globalFilter.toLowerCase())
  );

  // Calculate statistics from real data
  const orderStats = {
    total: orders.length,
    paid: orders.filter(order => order.status.toLowerCase() === 'paid').length, // Payment confirmed, ready for processing
    processing: orders.filter(order => order.status.toLowerCase() === 'processing').length, // Being prepared/packaged
    shipped: orders.filter(order => order.status.toLowerCase() === 'shipped').length, // In transit to customer
    delivered: orders.filter(order => order.status.toLowerCase() === 'delivered').length, // Successfully delivered
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-blue-400" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-400" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <Package className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-400 bg-green-400/20'
      case 'paid':
        return 'text-blue-400 bg-blue-400/20'
      case 'shipped':
        return 'text-purple-400 bg-purple-400/20'
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff8800]" />
        <span className="ml-2 text-white">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-400 text-center">
          <p className="text-lg font-semibold">Error loading orders</p>
          <p className="text-sm text-gray-400 mt-1">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[200vh]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">My Orders</h2>
          <p className="text-gray-400 mt-1">Track and manage your orders</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search orders..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="bg-[#232326] border border-[#232326] rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
            />
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 bg-[#232326] rounded-xl hover:bg-[#ff8800] transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 bg-[#232326] rounded-xl hover:bg-[#ff8800] transition-colors">
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{orderStats.total}</p>
              <p className="text-gray-400 text-sm">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{orderStats.paid}</p>
              <p className="text-gray-400 text-sm">Paid</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{orderStats.processing}</p>
              <p className="text-gray-400 text-sm">Processing</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{orderStats.shipped}</p>
              <p className="text-gray-400 text-sm">Shipped</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{orderStats.delivered}</p>
              <p className="text-gray-400 text-sm">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
            <p className="text-gray-400">
              {globalFilter ? 'Try adjusting your search terms' : 'You haven\'t placed any orders yet'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-white">#{truncateOrderId(order.id)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4" />
                          <span>{order.items?.length || 0} items</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Ordered {formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between lg:justify-end lg:space-x-4 mt-4 lg:mt-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{formatCurrency(order.total)}</p>
                  </div>
                  <button 
                    onClick={() => handleViewDetails(order.id)}
                    disabled={orderDetailsMutation.isPending && selectedOrderId === order.id}
                    className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {orderDetailsMutation.isPending && selectedOrderId === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span>
                      {orderDetailsMutation.isPending && selectedOrderId === order.id ? 'Loading...' : 'View Details'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More - Hide if no orders or showing filtered results */}
      {filteredOrders.length > 0 && !globalFilter && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-[#232326] text-white rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors">
            Load More Orders
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && orderDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDetailsModal}
        >
          <div 
            className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Order Details</h3>
                <button 
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order ID</p>
                    <p className="text-white font-medium">#{truncateOrderId(orderDetails.order?.id || '')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.order?.status || '')}`}>
                      {orderDetails.order?.status?.charAt(0).toUpperCase() + orderDetails.order?.status?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Order Date</p>
                    <p className="text-white font-medium">{formatDate(orderDetails.order?.createdAt || '')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Amount</p>
                    <p className="text-white font-medium text-xl">{formatCurrency(orderDetails.order?.total || 0)}</p>
                  </div>
                </div>

                {/* Order Items */}
                {orderDetails.order?.items && orderDetails.order.items.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {orderDetails.order.items.map((item: any, index: number) => (
                        <div key={index} className="bg-[#1a1a1d] rounded-lg p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.productTitle || `Item ${index + 1}`}</p>
                            <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">{formatCurrency(item.price || 0)}</p>
                            <p className="text-gray-400 text-sm">each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {orderDetails.order?.couponCode && (
                  <div>
                    <p className="text-gray-400 text-sm">Coupon Applied</p>
                    <p className="text-green-400 font-medium">{orderDetails.order.couponCode}</p>
                    {orderDetails.order.discountAmount && (
                      <p className="text-green-400 text-sm">Discount: {formatCurrency(orderDetails.order.discountAmount)}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={closeDetailsModal}
                  className="px-6 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersTab
