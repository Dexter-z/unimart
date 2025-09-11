"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useWebSocket } from "@/context/web-socket-context";
import useRequiredAuth from "@/hooks/useRequiredAuth";

type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "user" | "seller" | string;
  content?: string | null;
  createdAt: string;
};

type SellerInfo = {
  id: string | null;
  name: string;
  avatar: string | null;
  isOnline: boolean;
};

interface ChatModalProps {
  conversationId: string;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ conversationId, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const {ws, addMessageListener, sendChat} = useWebSocket()
  //const {user} = useUser()
  const {user} = useRequiredAuth()

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/chatting/api/get-messages/${conversationId}?page=${pageToFetch}`,
        isProtected
      );

      const data = res.data as {
        messages: ChatMessage[];
        seller: SellerInfo;
        currentPage: number;
        hasMore: boolean;
      };

      // API returns newest first; build ascending list for UI.
      const normalized = [...data.messages].reverse();

      if (pageToFetch === 1) {
        setMessages(normalized);
      } else {
        // Prepend older messages to the beginning of the ascending list
        setMessages((prev) => [...normalized, ...prev]);
      }
      setSeller(data.seller);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load or when conversation changes
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom on new messages for this conversation
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Listen for realtime incoming messages
  useEffect(() => {
    if(!conversationId) return;
    const unsubscribe = addMessageListener((incoming: any) => {
      if(!incoming) return;
      if(incoming.conversationId !== conversationId) return;
      // prevent duplicate temp + server copy by checking id+content+timestamp
      setMessages(prev => {
        const exists = prev.some(m => m.id === incoming.id || (m.content === incoming.content && Math.abs(new Date(m.createdAt).getTime() - new Date(incoming.createdAt).getTime()) < 1500));
        if (exists) return prev;
        return [...prev, incoming];
      })
    })
    return () => unsubscribe();
  }, [conversationId, addMessageListener]);

  // Mark as seen when modal opens / messages change
  useEffect(() => {
    if(!ws || ws.readyState !== WebSocket.OPEN) return;
    if(!conversationId) return;
    ws.send(JSON.stringify({ type: "MARK_AS_SEEN", conversationId }));
  }, [conversationId, ws, messages.length]);

  const handleLoadOlder = async () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    await fetchMessages(next);
  };

  const handleSend = () => {
    if (!input.trim() || sending) return;
    if(!user?.id || !seller?.id) return;
    setSending(true);
    const content = input.trim();
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      conversationId,
      senderId: user.id,
      senderType: 'user',
      content,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimistic]);
    setInput("");
    const payload = {
      fromUserId: user.id,
      toUserId: seller.id,
      conversationId,
      messageBody: content,
      senderType: 'user'
    };
    try {
      sendChat(payload);
    } finally {
      // We rely on server echo to replace/duplicate-check; leaving optimistic message.
      setSending(false);
    }
  };

  const headerTitle = seller?.name || "Chat";
  const headerAvatar = seller?.avatar || null;
  const headerInitial = useMemo(() => headerTitle?.[0] ?? "?", [headerTitle]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-2xl h-[80vh] bg-[#18181b] border border-[#232326] rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#232326] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#ff8800] flex items-center justify-center">
              {headerAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={headerAvatar} alt={headerTitle} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#18181b] font-bold">{headerInitial}</span>
              )}
            </div>
            <div>
              <div className="text-white font-semibold leading-tight">{headerTitle}</div>
              <div className="text-xs text-gray-400">{seller?.isOnline ? "Online" : "Offline"}</div>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} className="p-2 rounded-lg hover:bg-[#232326] text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {hasMore && (
            <div className="flex justify-center my-2">
              <button
                onClick={handleLoadOlder}
                disabled={loading}
                className="text-sm px-3 py-1 rounded-lg bg-[#232326] text-white hover:bg-[#2c2c31] disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</span>
                ) : (
                  "Load older messages"
                )}
              </button>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderType === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`${m.senderType === "user" ? "bg-[#ff8800] text-[#18181b]" : "bg-[#232326] text-white"} px-3 py-2 rounded-2xl max-w-[75%] whitespace-pre-wrap`}>
                {m.content || ""}
                <div className="mt-1 text-[10px] opacity-60 text-right">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          {!loading && messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">No messages yet. Say hi!</div>
          )}
        </div>

        {/* Composer */}
        <div className="px-4 py-3 border-t border-[#232326] flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="Type a message…"
            className="flex-1 bg-[#232326] text-white rounded-lg px-3 py-2 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
