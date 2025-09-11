"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"

const WebSocketContext = createContext<any>(null)

export const WebSocketProvider = ({
    children,
    user
}: {
    children: React.ReactNode,
    user: any
}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const messageListenersRef = useRef<((data: any) => void)[]>([]);

    const addMessageListener = (fn: (data: any) => void) => {
        messageListenersRef.current.push(fn);
        return () => {
            messageListenersRef.current = messageListenersRef.current.filter(l => l !== fn)
        }
    }

    useEffect(() => {
        if (!user?.id) return;

        const ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!);

        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(`user_${user.id}`);
            console.log("WebSocket connected");
        }

        ws.onmessage = (event) => {
            let data: any;
            try {
                data = JSON.parse(event.data);
            } catch {
                return; // ignore non-json
            }

            if(data.type === "UNSEEN_COUNT_UPDATE") {
                const {conversationId, count} = data.payload || {};
                if (conversationId) {
                    setUnreadCounts((prev) => ({ ...prev, [conversationId]: count}))
                }
            } else if (data.type === "NEW_MESSAGE") {
                // fan out to listeners
                messageListenersRef.current.forEach(fn => {
                    try { fn(data.payload) } catch { /* ignore listener error */ }
                })
            }
        }

        return () => {
            ws.close()
        }

    }, [user?.id]);


    return <WebSocketContext.Provider value={{ ws: wsRef.current, unreadCounts, addMessageListener }}>
        {children}
    </WebSocketContext.Provider>
}

export const useWebSocket = () => useContext(WebSocketContext)