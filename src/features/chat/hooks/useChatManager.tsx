import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useChatAPI } from "./useChatApi"
import type { ChatThread, Message } from "../types"

export function useChatManager(chatType: string) {
    const { threadId } = useParams<{ threadId?: string }>()
    const navigate = useNavigate()

    const [messages, setMessages] = useState<Message[]>([])
    const [chatThreads, setChatThreads] = useState<ChatThread[]>([])
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingThreads, setLoadingThreads] = useState(true)

    const { createChat, sendMessage, getMessages, userId } = useChatAPI()

    useEffect(() => {
        loadThreads()
    }, [chatType, userId])

    useEffect(() => {
        if (threadId) {
            setCurrentThreadId(threadId)
            loadMessages(threadId)
        } else {
            setCurrentThreadId(null)
            setMessages([])
        }
    }, [threadId])

    const loadThreads = async () => {
        setLoadingThreads(true)
        try {
            const data = await getChats(chatType)
            setChatThreads(data.threads || [])
        } catch {
            setChatThreads([])
        } finally {
            setLoadingThreads(false)
        }
    }

    const loadMessages = async (id: string) => {
        try {
            const data = await getMessages(id)
            setMessages(data.messages || [])
        } catch {
            setMessages([])
        }
    }

    const navigateToThread = (id: string) => {
        navigate(`/${chatType === "general" ? "chat" : chatType}/${id}`)
    }

    const createNewChat = async (text: string) => {
        const data = await createChat(text, undefined, chatType)

        navigateToThread(data.thread_id)

        setMessages(data.messages)

        setChatThreads(prev => [{
            id: data.thread_id,
            thread_id: data.thread_id,
            title: data.title,
            type: chatType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            message_count: 0
        }, ...prev])

        return data.thread_id
    }

    const sendToThread = async (id: string, text: string) => {
        const data = await sendMessage(id, text, chatType)
        setMessages(data.messages)
    }

    const sendMessageHandler = async (text: string) => {
        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
        }

        setMessages(prev => [...prev, userMsg])
        setLoading(true)

        try {
            if (currentThreadId) {
                await sendToThread(currentThreadId, text)
            } else {
                await createNewChat(text)
            }
        } catch {
            setMessages(prev => prev.filter(m => m.id !== userMsg.id))
        } finally {
            setLoading(false)
        }
    }

    return {
        messages,
        chatThreads,
        currentThreadId,
        loading,
        loadingThreads,
        sendMessageHandler,
        navigateToThread,
        createNewChat
    }
}