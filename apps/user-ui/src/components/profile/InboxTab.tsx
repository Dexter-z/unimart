import React from 'react'
import { 
  Mail, 
  Search, 
  Star, 
  Clock, 
  Archive,
  Reply,
  Trash2,
  MoreVertical
} from 'lucide-react'

const InboxTab = () => {
  // Mock inbox data
  const messages = [
    {
      id: 1,
      sender: 'UniMart Support',
      subject: 'Your order has been shipped!',
      preview: 'Great news! Your order ORD-2024-001 has been shipped and is on its way...',
      time: '2 hours ago',
      isRead: false,
      isImportant: true,
      avatar: 'US'
    },
    {
      id: 2,
      sender: 'TechWorld Store',
      subject: 'Thank you for your purchase',
      preview: 'We appreciate your business! Your recent purchase of the wireless headphones...',
      time: '1 day ago',
      isRead: true,
      isImportant: false,
      avatar: 'TW'
    },
    {
      id: 3,
      sender: 'UniMart Notifications',
      subject: 'New deals available in your favorite categories',
      preview: 'Don\'t miss out on these amazing deals! Up to 50% off on electronics...',
      time: '2 days ago',
      isRead: true,
      isImportant: false,
      avatar: 'UN'
    },
    {
      id: 4,
      sender: 'Fashion Hub',
      subject: 'Your wishlist item is on sale!',
      preview: 'The jacket you added to your wishlist is now 30% off. Limited time offer...',
      time: '3 days ago',
      isRead: false,
      isImportant: false,
      avatar: 'FH'
    },
    {
      id: 5,
      sender: 'UniMart Security',
      subject: 'Login from new device detected',
      preview: 'We detected a login to your account from a new device. If this wasn\'t you...',
      time: '1 week ago',
      isRead: true,
      isImportant: true,
      avatar: 'US'
    }
  ]

  const unreadCount = messages.filter(msg => !msg.isRead).length

  return (
    <div className="min-h-[130vh]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Inbox</h2>
          <p className="text-gray-400 mt-1">
            You have {unreadCount} unread messages
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search messages..."
              className="bg-[#232326] border border-[#232326] rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]"
            />
          </div>
        </div>
      </div>

      {/* Message Categories */}
      <div className="flex items-center space-x-4 mb-6">
        <button className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-medium flex items-center space-x-2">
          <Mail className="w-4 h-4" />
          <span>All Messages</span>
        </button>
        <button className="px-4 py-2 bg-[#232326] text-gray-300 rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors flex items-center space-x-2">
          <Star className="w-4 h-4" />
          <span>Important</span>
        </button>
        <button className="px-4 py-2 bg-[#232326] text-gray-300 rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors flex items-center space-x-2">
          <Archive className="w-4 h-4" />
          <span>Archived</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 cursor-pointer hover:border-[#ff8800] transition-all duration-200 ${
              !message.isRead ? 'border-l-4 border-l-[#ff8800]' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-[#ff8800] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#18181b] font-bold text-sm">{message.avatar}</span>
              </div>

              {/* Message Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${!message.isRead ? 'text-white' : 'text-gray-300'}`}>
                        {message.sender}
                      </h3>
                      {message.isImportant && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      )}
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-[#ff8800] rounded-full"></div>
                      )}
                    </div>
                    <h4 className={`mb-2 ${!message.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {message.subject}
                    </h4>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {message.preview}
                    </p>
                  </div>
                  
                  {/* Time and Actions */}
                  <div className="flex items-start space-x-2 ml-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{message.time}</span>
                    </div>
                    <button className="p-1 hover:bg-[#232326] rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4">
                  <button className="px-3 py-1 bg-[#ff8800] text-[#18181b] rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center space-x-1">
                    <Reply className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                  <button className="px-3 py-1 bg-[#232326] text-gray-300 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors flex items-center space-x-1">
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                  {!message.isRead && (
                    <button className="px-3 py-1 bg-[#232326] text-gray-300 rounded-lg text-sm hover:bg-green-500 hover:text-white transition-colors">
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-[#232326] text-white rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors">
          Load More Messages
        </button>
      </div>
    </div>
  )
}

export default InboxTab
