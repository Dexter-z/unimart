"use client"

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Eye, 
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Upload,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

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

interface Shop {
  id: string;
  name: string;
  bio?: string;
  category: string;
  avatar?: string;
  address: string;
  openingHours?: string;
  website?: string;
  coverBanner?: string;
}

interface ShopFormData {
  name: string;
  bio: string;
  category: string;
  address: string;
  openingHours: string;
  website: string;
  avatar: string;
  coverBanner: string;
}

const fetchDashboardData = async () => {
  const [ordersRes, paymentsRes, sellerRes] = await Promise.all([
    axiosInstance.get("/order/api/get-seller-orders"),
    axiosInstance.get("/order/api/get-seller-payments"),
    axiosInstance.get("/api/logged-in-seller")
  ]);
  
  return {
    orders: ordersRes.data.orders,
    payments: paymentsRes.data.payments,
    shop: sellerRes.data.seller.shop
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
  const [editModalOpen, setEditModalOpen] = useState(false);

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

// Helper function to convert file to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Edit Shop Modal Component
const EditShopModal = ({ isOpen, onClose, shop, onUpdate }: {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
  onUpdate: () => void;
}) => {
  const [formData, setFormData] = useState<ShopFormData>({
    name: shop?.name || '',
    bio: shop?.bio || '',
    category: shop?.category || '',
    address: shop?.address || '',
    openingHours: shop?.openingHours || '',
    website: shop?.website || '',
    avatar: shop?.avatar || '',
    coverBanner: shop?.coverBanner || ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const updateShopMutation = useMutation({
    mutationFn: async (data: ShopFormData) => {
      const response = await axiosInstance.put('/api/update-shop', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Shop updated successfully');
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      onUpdate();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update shop');
    }
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file format. Please use JPEG, PNG, WebP, or GIF');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size too large. Maximum size is 5MB');
        return;
      }

      // Create preview URL immediately
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      const fileBase64 = await convertFileToBase64(file);
      const response = await axiosInstance.post("/api/upload-shop-image", { 
        fileName: fileBase64 
      });
      
      setFormData(prev => ({ ...prev, avatar: response.data.file_url }));
      setPreviewImage(response.data.file_url);
      toast.success('Image uploaded successfully');
      
      // Clean up the temporary preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error: any) {
      console.error('Image upload error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to upload image';
      toast.error(errorMessage);
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Edit Shop Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shop Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shop Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {previewImage || formData.avatar ? (
                  <Image
                    src={previewImage || formData.avatar}
                    alt="Shop"
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center w-fit">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Supports JPEG, PNG, WebP, GIF • Max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shop Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Opening Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Opening Hours
            </label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
              placeholder="e.g., Mon-Fri 9AM-6PM"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateShopMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {updateShopMutation.isPending ? 'Updating...' : 'Update Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};  const formatCurrency = (amount: number) => {
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
  const shop = data?.shop;

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6">
      {/* Shop Header */}
      {shop && (
        <div className="mb-6 sm:mb-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              {shop.avatar ? (
                <Image
                  src={shop.avatar}
                  alt={shop.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{shop.name}</h1>
                <p className="text-gray-400">{shop.category}</p>
                {shop.bio && (
                  <p className="text-gray-300 text-sm mt-1">{shop.bio}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Shop Details
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Dashboard</h2>
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

      {/* Edit Shop Modal */}
      {shop && (
        <EditShopModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          shop={shop}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
};

export default Page;
