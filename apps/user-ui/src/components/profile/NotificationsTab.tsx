import React from 'react'
import { 
  Bell, 
  Mail, 
  Package, 
  ShoppingBag, 
  Star, 
  TrendingUp,
  Heart,
  MessageSquare,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'

const NotificationsTab = () => {
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order ORD-2024-001 has been shipped and will arrive by Jan 25th',
      time: '2 hours ago',
      isRead: false,
      icon: Package,
      color: 'text-blue-400'
    },
    {
      id: 2,
      type: 'promotion',
      title: 'Flash Sale Alert',
      message: 'Up to 70% off on electronics! Limited time offer ending in 6 hours',
      time: '4 hours ago',
      isRead: false,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      id: 3,
      type: 'wishlist',
      title: 'Wishlist Item on Sale',
      message: 'The wireless headphones in your wishlist are now 30% off',
      time: '1 day ago',
      isRead: true,
      icon: Heart,
      color: 'text-red-400'
    },
    {
      id: 4,
      type: 'review',
      title: 'Review Request',
      message: 'How was your recent purchase? Share your experience with other buyers',
      time: '2 days ago',
      isRead: true,
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      id: 5,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from TechWorld Store about your recent purchase',
      time: '3 days ago',
      isRead: true,
      icon: MessageSquare,
      color: 'text-purple-400'
    },
    {
      id: 6,
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order ORD-2023-045 has been successfully delivered',
      time: '1 week ago',
      isRead: true,
      icon: Package,
      color: 'text-blue-400'
    }
  ]

  const unreadCount = notifications.filter(notif => !notif.isRead).length

  const notificationSettings = [
    {
      id: 'order_updates',
      label: 'Order Updates',
      description: 'Get notified about order status changes',
      enabled: true,
      icon: ShoppingBag
    },
    {
      id: 'promotions',
      label: 'Promotions & Deals',
      description: 'Receive alerts about sales and special offers',
      enabled: true,
      icon: TrendingUp
    },
    {
      id: 'wishlist',
      label: 'Wishlist Alerts',
      description: 'Know when wishlist items go on sale',
      enabled: false,
      icon: Heart
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'New messages from sellers and support',
      enabled: true,
      icon: Mail
    },
    {
      id: 'reviews',
      label: 'Review Requests',
      description: 'Reminders to review your purchases',
      enabled: false,
      icon: Star
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-gray-400 mt-1">
            You have {unreadCount} unread notifications
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-medium hover:bg-orange-600 transition-colors">
            Mark All as Read
          </button>
          <button className="p-2 bg-[#232326] rounded-xl hover:bg-[#ff8800] transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {notificationSettings.map((setting) => {
            const Icon = setting.icon
            return (
              <div key={setting.id} className="flex items-center justify-between p-4 bg-[#18181b] rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#ff8800]/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#ff8800]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{setting.label}</p>
                    <p className="text-gray-400 text-sm">{setting.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {setting.enabled ? (
                    <Volume2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                    setting.enabled ? 'bg-[#ff8800]' : 'bg-gray-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      setting.enabled ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white mb-4">Recent Notifications</h3>
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <div
              key={notification.id}
              className={`bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 cursor-pointer hover:border-[#ff8800] transition-all duration-200 ${
                !notification.isRead ? 'border-l-4 border-l-[#ff8800]' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`w-12 h-12 bg-[#232326] rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${notification.color}`} />
                </div>

                {/* Notification Content */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#ff8800] rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Bell className="w-3 h-3 mr-1" />
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Unread */}
                  {!notification.isRead && (
                    <div className="flex items-center space-x-2 mt-3">
                      <button className="px-3 py-1 bg-[#ff8800] text-[#18181b] rounded-lg text-sm hover:bg-orange-600 transition-colors">
                        Mark as Read
                      </button>
                      <button className="px-3 py-1 bg-[#232326] text-gray-300 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors">
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-[#232326] text-white rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors">
          Load More Notifications
        </button>
      </div>
    </div>
  )
}

export default NotificationsTab
