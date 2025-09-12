"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"

const WebSocketContext = createContext<any>(null)

export const WebSocketProvider = ({
    children,
    seller
}: {
    children: React.ReactNode,
    seller: any
}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const messageListenersRef = useRef<((data: any) => void)[]>([]);
    const pendingQueueRef = useRef<any[]>([]); // queue of outbound chat payloads awaiting socket open
    const reconnectAttemptsRef = useRef(0);
    const manualCloseRef = useRef(false);

    const addMessageListener = (fn: (data: any) => void) => {
        messageListenersRef.current.push(fn);
        return () => {
            messageListenersRef.current = messageListenersRef.current.filter(l => l !== fn)
        }
    }

    // Core connect logic with basic retry + queue flush
    const connect = () => {
        if (!seller?.id) return;
        manualCloseRef.current = false;
        const ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!);
        wsRef.current = ws;

        ws.onopen = () => {
            reconnectAttemptsRef.current = 0;
            ws.send(`seller_${seller.id}`);
            console.log("WebSocket connected");
            // Flush queued messages
            if (pendingQueueRef.current.length) {
                pendingQueueRef.current.forEach(p => {
                    try { ws.send(JSON.stringify(p)); } catch {/* ignore */}
                });
                pendingQueueRef.current = [];
            }
        };

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
        };

        ws.onclose = () => {
            if (manualCloseRef.current) return; // intentional close (unmount/logout)
            const attempt = reconnectAttemptsRef.current++;
            const delay = Math.min(10000, 500 * Math.pow(2, attempt)); // exponential backoff capped at 10s
            setTimeout(() => connect(), delay);
        };

        ws.onerror = () => {
            // Let onclose handle retry
        };
    };

    useEffect(() => {
        if (!seller?.id) return;
        connect();
        return () => {
            manualCloseRef.current = true;
            wsRef.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seller?.id]);

    // Public send that queues if socket not open
    const sendChat = (payload: any) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            try { ws.send(JSON.stringify(payload)); } catch { pendingQueueRef.current.push(payload); }
        } else {
            pendingQueueRef.current.push(payload);
        }
    };


    return <WebSocketContext.Provider value={{ ws: wsRef.current, unreadCounts, addMessageListener, sendChat }}>
        {children}
    </WebSocketContext.Provider>
}

export const useWebSocket = () => useContext(WebSocketContext)