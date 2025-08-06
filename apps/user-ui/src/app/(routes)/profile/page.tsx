"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  User, 
  ShoppingBag, 
  Mail, 
  Bell, 
  MapPin, 
  Lock, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import useUser from '@/hooks/useUser'
import ProfileTab from '@/components/profile/ProfileTab'
import OrdersTab from '@/components/profile/OrdersTab'
import InboxTab from '@/components/profile/InboxTab'
import NotificationsTab from '@/components/profile/NotificationsTab'
import AddressTab from '@/components/profile/AddressTab'
import PasswordTab from '@/components/profile/PasswordTab'

const ProfileContent = () => {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Valid tab names
  const validTabs = ['profile', 'orders', 'inbox', 'notifications', 'address', 'password']

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'inbox', label: 'Inbox', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'address', label: 'Shipping Address', icon: MapPin },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ]

  // Initialize active tab from URL parameter on component mount
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam)
    } else {
      // If no valid tab in URL, default to profile and update URL
      setActiveTab('profile')
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'profile')
      router.replace(`/profile?${params.toString()}`, { scroll: false })
    }
  }, [searchParams, router])

  const handleNavClick = (itemId: string) => {
    if (itemId === 'logout') {
      // Handle logout logic here
      console.log('Logout clicked')
      return
    }
    
    // Update active tab state
    setActiveTab(itemId)
    
    // Update URL with new tab parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', itemId)
    router.push(`/profile?${params.toString()}`, { scroll: false })
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'profile':
        return 'My Profile'
      case 'orders':
        return 'My Orders'
      case 'inbox':
        return 'Inbox'
      case 'notifications':
        return 'Notifications'
      case 'address':
        return 'Shipping Address'
      case 'password':
        return 'Change Password'
      default:
        return 'My Profile'
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} />
      case 'orders':
        return <OrdersTab />
      case 'inbox':
        return <InboxTab />
      case 'notifications':
        return <NotificationsTab />
      case 'address':
        return <AddressTab />
      case 'password':
        return <PasswordTab />
      default:
        return <ProfileTab user={user} />
    }
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
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === item.id
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
            <h1 className="text-2xl font-bold text-white">{getTabTitle()}</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-[#232326] transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

const Page = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ff8800] mx-auto"></div>
          <p className="text-white mt-4">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}

export default Page
