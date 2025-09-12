"use client"

import React, { useEffect, useState } from 'react'
import { useWebSocket } from '@/context/web-socket-context'
import useSeller from '@/hooks/useSeller'
import { useRouter, useSearchParams } from 'next/navigation'
import axiosInstance from '@/utils/axiosInstance'
import { Mail, Search, Star, Archive, Reply, Trash2, Clock, MoreVertical } from 'lucide-react'

// Lightweight inline modal for seller side (mirrors user ChatModal but with seller role and user info in header)
const SellerChatModal = ({ conversationId, onClose }: { conversationId: string, onClose: () => void }) => {
  const { addMessageListener, sendChat } = useWebSocket();
  const { seller } = useSeller();
  const [messages, setMessages] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const lastUpdateTypeRef = React.useRef<'init' | 'append' | 'prepend'>('init');

  const fetchMessages = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      // assuming a seller specific endpoint analogous to get-messages
  const res = await axiosInstance.get(`/chatting/api/get-seller-messages/${conversationId}?page=${pageToFetch}`);
      const data = res.data as { messages: any[]; user: any; hasMore: boolean; currentPage: number };
      const normalized = [...data.messages].reverse();
      if (pageToFetch === 1) {
        setMessages(normalized);
        lastUpdateTypeRef.current = 'init';
      } else {
        setMessages(prev => { lastUpdateTypeRef.current = 'prepend'; return [...normalized, ...prev]; });
      }
      setUserInfo(data.user);
      setHasMore(data.hasMore);
    } finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); setHasMore(true); fetchMessages(1); }, [conversationId]);
  useEffect(() => { const unsub = addMessageListener((incoming: any) => {
      if (!incoming || incoming.conversationId !== conversationId) return;
      setMessages(prev => {
        const exists = prev.some(m => m.id === incoming.id || (m.content === incoming.content && Math.abs(new Date(m.createdAt).getTime() - new Date(incoming.createdAt).getTime()) < 1500));
        if (exists) return prev;
        lastUpdateTypeRef.current = 'append';
        return [...prev, incoming];
      });
    }); return () => unsub(); }, [conversationId, addMessageListener]);

  // Auto-scroll logic
  useEffect(() => {
    if (lastUpdateTypeRef.current === 'prepend') return;
    const el = scrollRef.current;
    if (!el) return;
    const behavior: ScrollBehavior = lastUpdateTypeRef.current === 'append' ? 'smooth' : 'auto';
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, [messages.length]);

  const loadOlder = async () => { if (!hasMore || loading) return; const next = page + 1; setPage(next); await fetchMessages(next); };

  const handleSend = () => {
    if (!input.trim() || !seller?.id || !userInfo?.id) return;
    const content = input.trim();
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, conversationId, senderId: seller.id, senderType: 'seller', content, createdAt: new Date().toISOString() };
  setMessages(prev => { lastUpdateTypeRef.current = 'append'; return [...prev, optimistic]; });
    setInput("");
  // WebSocket server expects fromUserId irrespective of role; senderType disambiguates
  sendChat({ fromUserId: seller.id, toUserId: userInfo.id, conversationId, messageBody: content, senderType: 'seller' });
  };

  const headerTitle = userInfo?.name || userInfo?.firstName || 'User';
  const headerAvatar = userInfo?.avatar || null;
  const initial = headerTitle?.[0] || '?';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl h-[80vh] bg-[#18181b] border border-[#232326] rounded-2xl flex flex-col">
        <div className="px-4 py-3 border-b border-[#232326] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff8800] overflow-hidden flex items-center justify-center">
              {headerAvatar ? <img src={headerAvatar} alt={headerTitle} className="w-full h-full object-cover" /> : <span className="text-[#18181b] font-bold">{initial}</span>}
            </div>
            <div>
              <div className="text-white font-semibold leading-tight">{headerTitle}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#232326] text-gray-300">✕</button>
        </div>
  <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {hasMore && <div className="flex justify-center"><button onClick={loadOlder} disabled={loading} className="text-sm px-3 py-1 bg-[#232326] rounded-lg text-white disabled:opacity-50">{loading? 'Loading...' : 'Load older messages'}</button></div>}
          {messages.map(m => <div key={m.id} className={`flex ${m.senderType === 'seller' ? 'justify-end' : 'justify-start'}`}><div className={`${m.senderType === 'seller' ? 'bg-[#ff8800] text-[#18181b]' : 'bg-[#232326] text-white'} px-3 py-2 rounded-2xl max-w-[75%]`}>
            {m.content}
            <div className="mt-1 text-[10px] opacity-60 text-right">{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
          </div></div>)}
          {!loading && messages.length === 0 && <div className="text-center text-gray-400 mt-10">No messages yet.</div>}
        </div>
        <div className="px-4 py-3 border-t border-[#232326] flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter') handleSend(); }} placeholder="Type a message..." className="flex-1 bg-[#232326] text-white rounded-lg px-3 py-2 focus:outline-none" />
          <button onClick={handleSend} disabled={!input.trim()} className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-lg font-semibold disabled:opacity-60">Send</button>
        </div>
      </div>
    </div>
  )
};

const SellerInboxPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { seller } = useSeller();
  const { unreadCounts } = useWebSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const conversationId = searchParams.get('conversationId');

  const fetchConversations = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      // assuming analogous endpoint to user: get-seller-conversations
  const res = await axiosInstance.get(`/chatting/api/get-seller-conversations?page=${pageToFetch}`);
      const data = res.data as { conversations: any[]; hasMore?: boolean };
      if (pageToFetch === 1) setConversations(data.conversations); else setConversations(prev => [...prev, ...data.conversations]);
      if (data.hasMore === false || !data.conversations.length) setHasMore(false);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (seller?.id) fetchConversations(1); }, [seller?.id]);

  const paginated = conversations.slice(0, page * 10);
  const unreadTotal = Object.values(unreadCounts).reduce<number>((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);

  const handleSelect = (c: any) => {
    if (!c?.conversationId) return;
    const params = new URLSearchParams(searchParams as any);
    params.set('conversationId', c.conversationId);
    router.push(`?${params.toString()}`);
  };

  const loadMore = () => {
    setPage(p => p + 1);
    if (paginated.length >= conversations.length) {
      if (hasMore) fetchConversations(page + 1); else setHasMore(false);
    }
  };

  return (
    <div className="min-h-[120vh]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Inbox</h2>
          <p className="text-gray-400 mt-1">You have {unreadTotal} unread messages</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input className="bg-[#232326] border border-[#232326] rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff8800]" placeholder="Search messages..." />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 mb-6">
        <button className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-medium flex items-center space-x-2"><Mail className="w-4 h-4" /><span>All Messages</span></button>
        <button className="px-4 py-2 bg-[#232326] text-gray-300 rounded-xl flex items-center space-x-2"><Star className="w-4 h-4" /><span>Important</span></button>
        <button className="px-4 py-2 bg-[#232326] text-gray-300 rounded-xl flex items-center space-x-2"><Archive className="w-4 h-4" /><span>Archived</span></button>
      </div>
      <div className="space-y-2">
        {paginated.length === 0 && !loading && <div className="text-center text-gray-400 py-12">No conversations yet.</div>}
        {paginated.map(c => (
          <div key={c.conversationId} onClick={() => handleSelect(c)} className={`bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 cursor-pointer hover:border-[#ff8800] transition-all duration-200`}>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#ff8800] rounded-full flex items-center justify-center overflow-hidden">
                {c.user?.avatar ? <img src={c.user.avatar} alt={c.user.name} className="w-12 h-12 object-cover rounded-full" /> : <span className="text-[#18181b] font-bold text-sm">{c.user?.name ? c.user.name[0] : '?'}</span>}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white">{c.user?.name || 'User'}</h3>
                      {unreadCounts[c.conversationId] > 0 && <div className="w-2 h-2 bg-[#ff8800] rounded-full"></div>}
                    </div>
                    <h4 className="mb-2 text-gray-400">{c.subject || 'Conversation'}</h4>
                    <p className="text-gray-400 text-sm line-clamp-2">{c.lastMessage || ''}</p>
                  </div>
                  <div className="flex items-start space-x-2 ml-4">
                    <div className="flex items-center text-gray-400 text-sm"><Clock className="w-4 h-4 mr-1" /><span>{c.updatedAt || c.createdAt || ''}</span></div>
                    <button className="p-1 hover:bg-[#232326] rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <button onClick={(e) => { e.stopPropagation(); handleSelect(c); }} className="px-3 py-1 bg-[#ff8800] text-[#18181b] rounded-lg text-sm flex items-center space-x-1"><Reply className="w-3 h-3" /><span>Reply</span></button>
                  <button className="px-3 py-1 bg-[#232326] text-gray-300 rounded-lg text-sm flex items-center space-x-1"><Trash2 className="w-3 h-3" /><span>Delete</span></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMore && <div className="text-center mt-8"><button onClick={loadMore} className="px-6 py-3 bg-[#232326] text-white rounded-xl hover:bg-[#ff8800] hover:text-[#18181b] transition-colors">{loading ? 'Loading...' : 'Load More'}</button></div>}
      {conversationId && <SellerChatModal conversationId={conversationId} onClose={() => { const params = new URLSearchParams(searchParams as any); params.delete('conversationId'); router.push(`?${params.toString()}`); }} />}
    </div>
  )
};

export default SellerInboxPage
