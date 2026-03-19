import InputArea from "../components/InputArea"

import React, { useState, useEffect, useRef } from "react"
import { Menu } from "lucide-react"
import PromptLibrary from "../components/PromptLibrary"
import { useNavigate, useParams } from "react-router-dom"
import TableSidebar from "../../../shared/layout/TableSidebar"
import { useLocation } from "react-router-dom"
import Logo from "../../../assets/logo.png"
import ChatArea from "../components/ChatArea"
import Sidebar from "../../../shared/layout/Sidebar"
import { useChatAPI } from "../hooks/useChatApi"


export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    sql_query?: string
    sql_query_response?: string
    sap_data?: any[]
    rephrased_query?: string
    chat_type?: string
    sources?: Array<{
        title: string
        source: string
        score: number
        snippet: string
    }>
}

export interface PowerAlarmData {
    [key: string]: string | number;
}

const POWER_ALARM_DATA: PowerAlarmData[] = [
    { "District": "Bagerhat", "ActivePowerAlarms": "11" },
    { "District": "Bandarban", "ActivePowerAlarms": "1" }
];

export interface ChatThread {
    id: string
    thread_id: string
    title: string
    type: string
    created_at: string
    updated_at: string
    message_count: number
}

export interface ChatProps {
    chatType?: string;
}

function getSidebarPreference(): boolean {
    const saved = localStorage.getItem("sidebar_open")
    return saved !== null ? JSON.parse(saved) : true
}

function setSidebarPreference(isOpen: boolean) {
    localStorage.setItem("sidebar_open", JSON.stringify(isOpen))
}

export default function Chat({ chatType = "general" }: ChatProps) {
    const { threadId } = useParams<{ threadId?: string }>()
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [currentThreadId, setCurrentThreadIdState] = useState<string | null>(null)
    const [sideBarData, setDataBarData] = useState(POWER_ALARM_DATA)
    const [chatThreads, setChatThreads] = useState<ChatThread[]>([])
    const [sidebarOpen, setSidebarOpen] = useState(getSidebarPreference())
    const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(true)
    const [tableSidebarOpen, setTableSidebarOpen] = useState(false)
    const [loadingThreads, setLoadingThreads] = useState(true)
    const [tableData, settableData] = useState([])
    const [sapData, setSapData] = useState([])
    const navigate = useNavigate()
    const location = useLocation()
    const inputAreaRef = useRef<any>(null)
    const isSapPage = location.pathname.startsWith("/sap-data")
    const isDoaPage = location.pathname.startsWith("/doa")
    const { createChat, getChats, sendMessage, getMessages, loading: apiLoading, userId } = useChatAPI()

    // Load chat threads on mount and when chatType changes
    useEffect(() => {
        loadChatThreads()
    }, [chatType, userId])

    useEffect(() => {
        if (threadId) {
            console.log("ThreadId from URL:", threadId)
            setCurrentThreadIdState(threadId)
            loadMessages(threadId)
        } else {
            console.log("No threadId in URL, clearing messages")
            setCurrentThreadIdState(null)
            setMessages([])
        }
    }, [threadId])

    // Save sidebar preference when it changes
    useEffect(() => {
        setSidebarPreference(sidebarOpen)
    }, [sidebarOpen])

    const loadChatThreads = async () => {
        setLoadingThreads(true)
        try {
            console.log("Fetching chats for type:", chatType)
            const data = await getChats(chatType)
            console.log("Fetched threads:", data.threads)
            setChatThreads(data.threads || [])
        } catch (error) {
            console.error("Error loading chat threads:", error)
            setChatThreads([])
        } finally {
            setLoadingThreads(false)
        }
    }

    const handlePopulateInput = (prompt: string) => {
        if (inputAreaRef.current) {
            inputAreaRef.current.setInputValue(prompt)
            inputAreaRef.current.focusInput()
        }
    }

    const loadMessages = async (threadId: string) => {
        try {
            console.log("Loading messages for thread:", threadId)
            const data = await getMessages(threadId)
            console.log("Loaded messages:", data.messages)
            setMessages(data.messages || [])
        } catch (error) {
            console.error("Error loading messages:", error)
            setMessages([])
        }
    }

    const querySapData = async (query: string) => {
        try {
            const response = await fetch('/api/sap-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    include_sql: true
                }),
            })

            if (!response.ok) {
                throw new Error(`SAP API error! status: ${response.status}`)
            }

            const sapResponse = await response.json()
            return {
                response: sapResponse.response,
                sql_query: sapResponse.sql_query,
                data: sapResponse.data
            }
        } catch (error) {
            console.error("Error querying SAP data:", error)
            throw error
        }
    }

    const createNewChat = async (firstMessage: string) => {
        try {
            const data = await createChat(firstMessage, undefined, chatType)

            // Navigate based on chat type - this will trigger the threadId useEffect
            if (chatType === "commercial-ai") {
                navigate(`/commercial-ai/${data.thread_id}`)
            } else if (chatType === "sap-data") {
                navigate(`/sap-data/${data.thread_id}`)
            } else if (chatType === "doa") {
                navigate(`/doa/${data.thread_id}`)
            } else {
                navigate(`/chat/${data.thread_id}`)
            }

            setMessages(data.messages)

            // Update chatThreads optimistically with the new thread
            const newThread: ChatThread = {
                id: data.thread_id,
                thread_id: data.thread_id,
                title: data.title,
                type: chatType,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                message_count: 0
            }
            setChatThreads((prev) => [newThread, ...prev])

            return data.thread_id
        } catch (error) {
            console.error("Error creating new chat:", error)
            throw error
        }
    }


    const sendMessageToExistingThread = async (threadId: string, message: string) => {
        try {
            const data = await sendMessage(threadId, message, chatType)
            setMessages(data.messages)

            // Update sidebar data if SAP data is returned
            if (chatType === "sap-data" && data.messages) {
                const lastMessage = data.messages[data.messages.length - 1]
                if (lastMessage && lastMessage.sap_data) {
                    setDataBarData(lastMessage.sap_data)
                }
            }

            // Update thread's updated_at timestamp in the list optimistically
            setChatThreads((prev) =>
                prev.map((thread) =>
                    thread.thread_id === threadId
                        ? { ...thread, updated_at: new Date().toISOString() }
                        : thread
                )
            )
        } catch (error) {
            console.error("Error sending message:", error)
            throw error
        }
    }

    const onSendMessage = async (text: string) => {
        const userMsg = {
            id: crypto.randomUUID(),
            role: "user" as const,
            content: text,
        }
        setMessages((prev) => [...prev, userMsg])
        setLoading(true)

        try {
            if (chatType === "sap-data") {
                if (currentThreadId) {
                    await sendMessageToExistingThread(currentThreadId, text)
                } else {
                    const sapResult = await querySapData(text)
                    const assistantMsg: Message = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: sapResult.response,
                        sql_query: sapResult.sql_query,
                        data: sapResult.data
                    }
                    setMessages((prev) => [...prev, assistantMsg])
                    if (sapResult.data && Array.isArray(sapResult.data)) {
                        setSapData(sapResult?.data)
                    }
                    await createNewChat(text)
                }
            } else if (chatType === "doa") {
                // DOA chat handling - same flow as other chat types
                if (currentThreadId) {
                    await sendMessageToExistingThread(currentThreadId, text)
                } else {
                    await createNewChat(text)
                }
            } else {
                // Regular chat flow for general and commercial-ai
                if (currentThreadId) {
                    await sendMessageToExistingThread(currentThreadId, text)
                } else {
                    await createNewChat(text)
                }
            }
        } catch (error) {
            setMessages((prev) => prev.filter(msg => msg.id !== userMsg.id))
            console.error("Error sending message:", error)

            const errorMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `Sorry, I encountered an error while processing your request. Please try again.`
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    const onNewChat = () => {
        // Navigate to base path for new chat based on chat type
        if (chatType === "commercial-ai") {
            navigate('/commercial-ai')
        } else if (chatType === "sap-data") {
            navigate('/sap-data')
        } else if (chatType === "doa") {
            navigate('/doa')
        } else {
            navigate('/chat')
        }
    }

    const newHead = () => navigate("/head")

    const onSelectThread = (threadId: string) => {
        // Navigate based on chat type
        if (chatType === "commercial-ai") {
            navigate(`/commercial-ai/${threadId}`)
        } else if (chatType === "sap-data") {
            navigate(`/sap-data/${threadId}`)
        } else if (chatType === "doa") {
            navigate(`/doa/${threadId}`)
        } else {
            navigate(`/chat/${threadId}`)
        }
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleSettingsClick = () => {
        setSettingsSidebarOpen(true)
    }

    const handlePromptSelect = (prompt: string) => {
        // This will be handled by InputArea internally
    }

    const onOpenModal = (type: "table" | "chart") => {
        if (type === "table") {
            setTableSidebarOpen(true)
        }
    }

    return (
        <div className="flex h-screen bg-[#E5EBF1]">
            {/* Prompt Sidebar - Hide for SAP and DOA pages */}
            {!isSapPage && !isDoaPage ? (
                <PromptLibrary
                    isOpen={settingsSidebarOpen}
                    onClose={() => setSettingsSidebarOpen(false)}
                    onSendMessage={onSendMessage}
                    onSelectPrompt={handlePromptSelect}
                    onPopulateInput={handlePopulateInput}
                    loadingData={loading}
                    disabled={loading}
                />
            ) : (
                <div className="p-3 border-b rounded-xl border-gray-200 rounded-t-lg">
                    <img alt="" src={Logo} className="w-40 h-7 ml-3 mt-3" />
                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Chat Area and Input */}
                <div className="flex flex-col flex-1 overflow-y-auto">
                    <ChatArea
                        messages={messages}
                        onOpenModal={onOpenModal}
                        chatType={chatType}
                        setDataBarData={setDataBarData}
                    />
                    <InputArea
                        ref={inputAreaRef}
                        onSendMessage={onSendMessage}
                        loading={loading}
                        onSettingsClick={handleSettingsClick}
                    />
                </div>
            </div>

            {/* Left Sidebar - Desktop Only */}
            <div className={`hidden lg:block ${sidebarOpen ? 'w-80' : 'w-0'} 
                           transition-all duration-300 ease-in-out overflow-hidden`}>
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onNewChat={onNewChat}
                    onHead={newHead}
                    chatThreads={chatThreads}
                    currentThreadId={currentThreadId}
                    onSelectThread={onSelectThread}
                    loading={loadingThreads}
                    chatType={chatType}
                />
            </div>

            <TableSidebar
                isOpen={tableSidebarOpen}
                onClose={() => {
                    console.log("Chat: Closing table sidebar")
                    setTableSidebarOpen(false)
                }}
                data={sideBarData}
            />
        </div>
    )
}