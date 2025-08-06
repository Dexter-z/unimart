"use client"
import React, { useState } from 'react'
import { 
  User, 
  ShoppingBag, 
  Mail, 
  Bell, 
  MapPin, 
  Lock, 
  LogOut,
  Menu,
  X,
  Phone,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  Edit
} from 'lucide-react'
import useUser from '@/hooks/useUser'

const Page = () => {
  const { user, isLoading } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User, active: true },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'inbox', label: 'Inbox', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'address', label: 'Shipping Address', icon: MapPin },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ]

  // Hardcoded order statistics for now
  const orderStats = {
    total: 24,
    processing: 3,
    completed: 21
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ff8800] mx-auto"></div>
          <p className="text-white mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[180vh] bg-[#18181b]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#232326] to-[#18181b] border-r border-[#232326] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-[#232326]">
          <h2 className="text-xl font-bold text-[#ff8800]">Account</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-[#232326] transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <nav className="p-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      item.active
                        ? 'bg-[#ff8800] text-[#18181b] font-semibold'
                        : 'text-gray-300 hover:bg-[#232326] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-[130vh]">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-[#232326] to-[#18181b] border-b border-[#232326] p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#232326] transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-400" />
            </button>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-[#232326] transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div className="p-6">
          {/* Profile header */}
          <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-[#ff8800] rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-[#18181b]" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#ff8800] rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                    <Edit className="w-4 h-4 text-[#18181b]" />
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user?.name || 'User Name'}</h2>
                  <p className="text-[#ff8800] font-medium">{user?.email || 'user@example.com'}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined Dec 2023</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>+234 xxx xxx xxxx</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="mt-4 lg:mt-0 px-6 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Order statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{orderStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">+12%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Processing</p>
                  <p className="text-3xl font-bold text-white">{orderStats.processing}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-yellow-400">In Progress</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-white">{orderStats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-400">Successfully delivered</span>
              </div>
            </div>
          </div>

          {/* Profile details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Full Name</label>
                  <p className="text-white font-medium">{user?.name || 'John Doe'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email Address</label>
                  <p className="text-white font-medium">{user?.email || 'john.doe@example.com'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone Number</label>
                  <p className="text-white font-medium">+234 xxx xxx xxxx</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Date of Birth</label>
                  <p className="text-white font-medium">January 15, 1990</p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#18181b] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-[#ff8800]" />
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-gray-400 text-sm">Receive order updates via email</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-[#ff8800] rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#18181b] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-[#ff8800]" />
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-gray-400 text-sm">Add extra security to your account</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2">
                  <LogOut className="w-5 h-5" />
                  <span>Logout from Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
