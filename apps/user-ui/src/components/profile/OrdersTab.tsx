import React from 'react'
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck,
  Calendar,
  Eye,
  Search,
  Filter
} from 'lucide-react'

const OrdersTab = () => {
  // Mock order data
  const orders = [
    {
      id: 'ORD-2024-001',
      items: 3,
      total: 89.99,
      status: 'delivered',
      date: '2024-01-15',
      estimatedDelivery: '2024-01-18',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-2024-002',
      items: 1,
      total: 45.50,
      status: 'processing',
      date: '2024-01-20',
      estimatedDelivery: '2024-01-25',
      trackingNumber: 'TRK987654321'
    },
    {
      id: 'ORD-2024-003',
      items: 2,
      total: 129.99,
      status: 'shipped',
      date: '2024-01-22',
      estimatedDelivery: '2024-01-26',
      trackingNumber: 'TRK456789123'
    },
    {
      id: 'ORD-2024-004',
      items: 4,
      total: 199.99,
      status: 'pending',
      date: '2024-01-24',
      estimatedDelivery: '2024-01-29',
      trackingNumber: null
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
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
    switch (status) {
      case 'delivered':
        return 'text-green-400 bg-green-400/20'
      case 'shipped':
        return 'text-blue-400 bg-blue-400/20'
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div>
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
              className="bg-[#232326] border border-[#232326] rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
            />
          </div>
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
              <p className="text-2xl font-bold text-white">24</p>
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
              <p className="text-2xl font-bold text-white">3</p>
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
              <p className="text-2xl font-bold text-white">5</p>
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
              <p className="text-2xl font-bold text-white">16</p>
              <p className="text-gray-400 text-sm">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(order.status)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4" />
                        <span>{order.items} items</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Ordered {order.date}</span>
                      </div>
                    </div>
                    {order.trackingNumber && (
                      <p>Tracking: <span className="text-[#ff8800]">{order.trackingNumber}</span></p>
                    )}
                    <p>Expected delivery: {order.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between lg:justify-end lg:space-x-4 mt-4 lg:mt-0">
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${order.total}</p>
                </div>
                <button className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-[#232326] text-white rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors">
          Load More Orders
        </button>
      </div>
    </div>
  )
}

export default OrdersTab
