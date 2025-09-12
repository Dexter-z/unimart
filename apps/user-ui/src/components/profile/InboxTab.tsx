"use client"

import React, { useEffect, useState } from 'react'
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
import { useRouter, useSearchParams } from 'next/navigation'
import useRequiredAuth from '@/hooks/useRequiredAuth'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'
import { isProtected } from '@/utils/protected'
import ChatModal from './ChatModal'
import { useWebSocket } from '@/context/web-socket-context'

const InboxTab = () => {
  const searchParams = useSearchParams()
  // Ensure the page is protected; the hook handles redirects/side-effects
  useRequiredAuth()
  const router = useRouter()


  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const conversationId = searchParams.get("conversationId")
  const tab = searchParams.get("tab") || 'inbox'

  const {data: conversations} = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chatting/api/get-user-conversations", isProtected)
      return res.data.conversations;
    }
  })

  useEffect(() => {
    if(conversations){
      setChats(conversations);
    }
  }, [conversations])

  // Realtime conversation list updates
  const { addMessageListener } = useWebSocket();
  useEffect(() => {
    const unsub = addMessageListener((incoming: any) => {
      if(!incoming || !incoming.conversationId) return;
      setChats(prev => {
        let found = false;
        const updated = prev.map(c => {
          if(c.conversationId === incoming.conversationId){
            found = true;
            const isActive = conversationId === incoming.conversationId; // modal open
            return {
              ...c,
              lastMessage: incoming.content,
              updatedAt: incoming.createdAt,
              // simple unread flag logic
              isRead: isActive ? true : false
            }
          }
          return c;
        });
        if(!found){
            // Append new conversation skeleton
            return [...updated, {
              conversationId: incoming.conversationId,
              lastMessage: incoming.content,
              updatedAt: incoming.createdAt,
              isRead: conversationId === incoming.conversationId,
              seller: incoming.senderType === 'seller' ? { id: incoming.senderId } : undefined
            }];
        }
        return updated;
      });
    });
    return () => unsub();
  }, [addMessageListener, conversationId]);

  useEffect(() => {
    if(conversationId && chats.length > 0){
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats])

  // Use chats from API as messages
  const messages = chats;
  console.log(messages)
  const unreadCount = messages.filter(msg => !msg?.isRead).length;

  // Pagination
  const paginatedMessages = messages.slice(0, page * 10);

  // Select chat handler
  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    {console.log(chat)}
    if (chat?.conversationId) {
      const params = new URLSearchParams(searchParams as any);
      params.set('tab', tab);
      params.set('conversationId', chat.conversationId);
      router.push(`?${params.toString()}`);
    }
  };


  // Load more handler
  const handleLoadMore = () => {
    setPage(page + 1);
    if (paginatedMessages.length >= messages.length) {
      setHasMore(false);
    }
  };

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
        {paginatedMessages.length === 0 && (
          <div className="text-center text-gray-400 py-12">No messages found.</div>
        )}
        {paginatedMessages.map((message: any) => (
          <div
            key={message.conversationId || message.id}
            className={`bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 cursor-pointer hover:border-[#ff8800] transition-all duration-200 ${
              !message.isRead ? 'border-l-4 border-l-[#ff8800]' : ''
            } ${selectedChat?.conversationId === message.conversationId ? 'ring-2 ring-[#ff8800]' : ''}`}
            onClick={() => handleSelectChat(message)}
          >
            <div className="flex items-start space-x-4">
              {/* Seller Avatar */}
              <div className="w-12 h-12 bg-[#ff8800] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {message.seller?.avatar ? (
                  <img src={message.seller.avatar} alt="Seller Avatar" className="w-12 h-12 object-cover rounded-full" />
                ) : (
                  <span className="text-[#18181b] font-bold text-sm">
                    {message.seller?.name ? message.seller.name[0] : '?'}
                  </span>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${!message.isRead ? 'text-white' : 'text-gray-300'}`}>
                        {message.seller?.name}
                      </h3>
                      {message.isImportant && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      )}
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-[#ff8800] rounded-full"></div>
                      )}
                    </div>
                    <h4 className={`mb-2 ${!message.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {message.subject || message.title || 'No Subject'}
                    </h4>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {message.preview || message.lastMessage || message.body || ''}
                    </p>
                  </div>
                  {/* Time and Actions */}
                  <div className="flex items-start space-x-2 ml-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{message.time || message.updatedAt || message.createdAt || ''}</span>
                    </div>
                    <button className="p-1 hover:bg-[#232326] rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4">
                  <button
                    className="px-3 py-1 bg-[#ff8800] text-[#18181b] rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center space-x-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChat(message);
                    }}
                  >
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
      {hasMore && (
        <div className="text-center mt-8">
          <button
            className="px-6 py-3 bg-[#232326] text-white rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors"
            onClick={handleLoadMore}
          >
            Load More Messages
          </button>
        </div>
      )}
      {/* Chat modal opened when conversationId is present */}
      {conversationId && (
        <ChatModal
          conversationId={conversationId}
          onClose={() => {
            const params = new URLSearchParams(searchParams as any);
            params.delete('conversationId');
            params.set('tab', tab);
            router.push(`?${params.toString()}`);
          }}
        />
      )}
  </div>
  )
}

export default InboxTab
