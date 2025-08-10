"use client"

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Eye, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

const fetchDashboardData = async () => {
  const [ordersRes, paymentsRes] = await Promise.all([
    axiosInstance.get("/order/api/get-seller-orders"),
    axiosInstance.get("/order/api/get-seller-payments")
  ]);
  
  return {
    orders: ordersRes.data.orders,
    payments: paymentsRes.data.payments
  };
}

const StatsCard = ({ title, value, icon: Icon, trend, color = "blue" }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color?: "blue" | "green" | "yellow" | "purple" | "red";
}) => {
  const colorClasses: Record<"blue" | "green" | "yellow" | "purple" | "red", string> = {
    blue: "bg-blue-600",
    green: "bg-green-600", 
    yellow: "bg-yellow-600",
    purple: "bg-purple-600",
    red: "bg-red-600"
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className="text-green-400 text-sm mt-1 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const RecentOrdersCard = ({ orders, onViewOrder }: { orders: Order[], onViewOrder: (id: string) => void }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      case 'shipped':
        return 'bg-blue-600 text-white';
      case 'delivered':
        return 'bg-purple-600 text-white';
      case 'cancelled':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Orders
        </h3>
      </div>
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No recent orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">#{order.id.slice(-6)}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{order.user.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-green-400 font-semibold">{formatCurrency(order.total)}</span>
                    <span className="text-gray-500 text-xs">{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="ml-4 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentStatusCard = ({ payments }: { payments: Order[] }) => {
  const pendingReceipt = payments.filter(p => p.paymentStatus === 'pending receipt').length;
  const transferring = payments.filter(p => p.paymentStatus === 'transferring').length;
  const paidOut = payments.filter(p => p.paymentStatus === 'paid out').length;

  const statusItems = [
    { label: 'Pending Receipt', count: pendingReceipt, color: 'bg-yellow-600' },
    { label: 'Transferring', count: transferring, color: 'bg-blue-600' },
    { label: 'Paid Out', count: paidOut, color: 'bg-green-600' },
  ];

  return (
    <div className="bg-black border border-gray-800 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Payment Status
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                <span className="text-gray-300">{item.label}</span>
              </div>
              <span className="text-white font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5,
  });

  const handleViewOrder = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  const calculateStats = (): DashboardStats => {
    if (!data?.orders) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0
      };
    }

    const orders = data.orders;
    const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.total, 0);
    const pendingOrders = orders.filter((order: Order) => order.status === 'pending').length;
    const completedOrders = orders.filter((order: Order) => order.status === 'delivered').length;

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      completedOrders
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Error loading dashboard data</div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={AlertCircle}
          color="yellow"
        />
        <StatsCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Orders - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentOrdersCard orders={data?.orders || []} onViewOrder={handleViewOrder} />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Payment Status */}
          <PaymentStatusCard payments={data?.payments || []} />

          {/* Quick Actions */}
          <div className="bg-black border border-gray-800 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="w-full text-left p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors duration-200 text-white"
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-3" />
                  View All Orders
                </div>
              </button>
              <button
                onClick={() => router.push('/dashboard/payments')}
                className="w-full text-left p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors duration-200 text-white"
              >
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-3" />
                  View Payments
                </div>
              </button>
              <button
                onClick={() => router.push('/dashboard/products')}
                className="w-full text-left p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors duration-200 text-white"
              >
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Manage Products
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
