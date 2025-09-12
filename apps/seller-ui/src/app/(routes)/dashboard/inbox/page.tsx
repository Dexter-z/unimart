"use client"

import { useWebSocket } from '@/context/web-socket-context'
import useSeller from '@/hooks/useSeller'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const InboxPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter();
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const {seller, isLoading: userLoading} = useSeller()
    const conversationID = searchParams.get("conversationId")
    const {ws} = useWebSocket()

    const [chats, setChats] = useState<any[]>([])
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [message, setMessage] = useState("")

    
  return (
    <div>
      hiii
    </div>
  )
}

export default InboxPage
