import React, { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import Logo from "../../../assets/logo.png"
import { X } from "lucide-react"
import ChatArea, { type PowerAlarmData } from "../../chat/components/ChatArea"

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

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

// Static user ID as GUID - matches the backend
const STATIC_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

// Helper function to get sidebar preference from localStorage (desktop only)
function getSidebarPreference(): boolean {
    const saved = localStorage.getItem("sidebar_open")
    return saved !== null ? JSON.parse(saved) : true // Default to true (open)
}

function setSidebarPreference(isOpen: boolean) {
    localStorage.setItem("sidebar_open", JSON.stringify(isOpen))
}

export default function Home({ chatType = "general" }: ChatProps) {
    const { threadId } = useParams<{ threadId?: string }>()
    const [messages, setMessages] = useState<Message[]>([])
    const [currentThreadId, setCurrentThreadIdState] = useState<string | null>(null)
    const [chatThreads, setChatThreads] = useState<ChatThread[]>([])
    const [sidebarOpen, setSidebarOpen] = useState(getSidebarPreference())
    const [tableSidebarOpen, setTableSidebarOpen] = useState(false)
    const [loadingThreads, setLoadingThreads] = useState(true)

    // Load chat threads on mount and when chatType changes
    // useEffect(() => {
    //     console.log('Chat: Loading threads for chatType:', chatType);
    //     loadChatThreads()
    // }, [chatType])

    // Handle URL thread parameter changes
    // useEffect(() => {
    //     console.log('Chat: URL threadId changed:', threadId);
    //     console.log('Chat: Current threadId state:', currentThreadId);

    //     if (threadId && threadId !== currentThreadId) {
    //         console.log('Chat: Setting new thread and loading messages');
    //         setCurrentThreadIdState(threadId)
    //         loadMessages(threadId)
    //     } else if (!threadId && currentThreadId) {
    //         console.log('Chat: Clearing thread state');
    //         setCurrentThreadIdState(null)
    //         setMessages([])
    //     }
    // }, [threadId, currentThreadId])

    // Save sidebar preference when it changes
    useEffect(() => {
        setSidebarPreference(sidebarOpen)
    }, [sidebarOpen])

    // const loadChatThreads = async () => {
    //     setLoadingThreads(true);
    //     try {
    //         // Always pass chat_type parameter for proper filtering
    //         const typeParam = `?chat_type=${chatType}`;
    //         console.log("Chat: Loading threads with param:", typeParam);
    //         console.log("Chat: Current chatType:", chatType);

    //         const response = await fetch(`/api/users/${STATIC_USER_ID}/chats${typeParam}`);
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const data = await response.json();
    //         console.log("Chat: Loaded threads:", data.threads);
    //         console.log("Chat: Thread types:", data.threads.map((t: { thread_id: any; type: any }) => ({ id: t.thread_id, type: t.type })));

    //         setChatThreads(data.threads || []);
    //     } catch (error) {
    //         console.error("Error loading chat threads:", error);
    //         setChatThreads([]);
    //     } finally {
    //         setLoadingThreads(false);
    //     }
    // };


    // const loadMessages = async (threadId: string) => {
    //     try {
    //         console.log('Chat: Loading messages for thread:', threadId);
    //         const response = await fetch(`/api/users/${STATIC_USER_ID}/chats/${threadId}`)
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const data = await response.json()
    //         console.log("Chat: Loaded messages:", data.messages);
    //         setMessages(data.messages || [])
    //     } catch (error) {
    //         console.error("Error loading messages:", error)
    //         setMessages([])
    //     }
    // }

    const onOpenModal = (type: "table" | "chart") => {
        console.log("Chat: onOpenModal called with type:", type); // Debug log
        if (type === "table") {
            console.log("Chat: Opening table sidebar"); // Debug log
            setTableSidebarOpen(true)
        }
        // Handle chart modal if needed in the future
    }

    return (
        // <div className="flex h-screen bg-gradient-to-br from-[#E5EBF1] via-[#d2dee9] to-[#bccad8]">
        <div className="flex h-screen bg-[#E5EBF1]">
            {/* <img alt="" src={Logo} className="w-40 h-7 ml-5 mt-8" /> */}
            {/* Left Sidebar - Desktop Only */}
            <div className="transition-all duration-300 ease-in-out overflow-hidden">
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Chat Area and Input */}
                <div className="flex flex-col flex-1 overflow-y-auto">
                    <ChatArea messages={messages} onOpenModal={onOpenModal} chatType={chatType} setDataBarData={function (value: React.SetStateAction<PowerAlarmData[]>): void {
                        throw new Error("Function not implemented.")
                    } } />
                </div>
            </div>
        </div>
    )
}