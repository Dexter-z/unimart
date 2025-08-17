import React, { useState } from 'react'
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
import { useQuery } from '@tanstack/react-query'
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

const fetchUserOrders = async (): Promise<Order[]> => {
  const res = await axiosInstance.get("/order/api/get-user-orders")
  return res.data.orders;
}

const OrdersTab = () => {
  const [globalFilter, setGlobalFilter] = useState("")

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ["user-orders"],
    queryFn: fetchUserOrders,
    staleTime: 1000 * 60 * 5,
  })

  const handleRefresh = () => {
    refetch();
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
    processing: orders.filter(order => order.status.toLowerCase() === 'processing').length,
    shipped: orders.filter(order => order.status.toLowerCase() === 'shipped').length,
    delivered: orders.filter(order => order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'paid').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-400" />
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
      case 'paid':
        return 'text-green-400 bg-green-400/20'
      case 'shipped':
        return 'text-blue-400 bg-blue-400/20'
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-400" />
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
                  <button className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
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
    </div>
  )
}

export default OrdersTab
