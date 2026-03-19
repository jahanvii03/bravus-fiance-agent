import { AnimatePresence, motion } from "framer-motion"
import { X, MessageSquare, Settings, History, Plus, Clock, LogOut } from "lucide-react"
import Logo from "../../assets/logo.png"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/authContext"
import Typewriter from "../components/ui/Typewritter"
import LoadingSpinner from "../components/ui/LoadingSpinner"

interface ChatThread {
    id: string
    thread_id: string
    title: string
    type: string
    created_at: string
    updated_at: string
    message_count: number
}

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    onHead: () => void
    onNewChat: () => void
    chatThreads: ChatThread[]
    currentThreadId: string | null
    onSelectThread: (threadId: string) => void
    loading: boolean
    chatType?: string
}

export default function Sidebar({
    isOpen,
    onClose,
    onNewChat,
    onHead,
    chatThreads,
    currentThreadId,
    onSelectThread,
    loading,
    chatType = "general"
}: SidebarProps) {
    // Track which thread titles are currently animating
    const [animatingTitles, setAnimatingTitles] = useState<Record<string, boolean>>({});
    const [seenThreads, setSeenThreads] = useState<Record<string, boolean>>({});
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);


    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out of your account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, logout!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    logout();
                    navigate('/login');
                } catch (error) {
                    console.error('Error logging out:', error);
                }
            }
        });
    };
    const userName = user?.name || "Guest User";


    // Initialize animating state for new threads
    const filteredThreads = chatThreads.filter(thread => {
        const threadType = thread.type || "general";
        return threadType === chatType;
    });

    useEffect(() => {
        const newAnimatingTitles = { ...animatingTitles };
        const newSeenThreads = { ...seenThreads };
        let updated = false;

        filteredThreads.forEach(thread => {
            if (!seenThreads[thread.thread_id]) {
                newAnimatingTitles[thread.thread_id] = true;
                newSeenThreads[thread.thread_id] = true;
                updated = true;
            }
        });

        if (updated) {
            setAnimatingTitles(newAnimatingTitles);
            setSeenThreads(newSeenThreads);
        }
    }, [filteredThreads]);

    const handleAnimationComplete = (threadId: string) => {
        setAnimatingTitles(prev => ({
            ...prev,
            [threadId]: false
        }));
    };

    function getInitials(name: string | undefined): string {
        if (!name) {
            return "";
        }
        const nameParts = name.split(" ");
        const initials = nameParts
            .map((part) => part.charAt(0).toUpperCase())
            .join("");
        return initials;
    }

    const handleThreadClick = (threadId: string) => {
        console.log('Sidebar: Thread clicked:', threadId);
        console.log('Current thread ID:', currentThreadId);
        onSelectThread(threadId);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return "Today"
        if (diffDays === 2) return "Yesterday"
        if (diffDays <= 7) return `${diffDays - 1} days ago`
        return date.toLocaleDateString()
    }

    const getChatTypeDisplayName = () => {
        switch (chatType) {
            case "commercial-ai":
                return "Commercial AI";
            case "sap-data":
                return "SAP Data";
            default:
                return "General";
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="h-full bg-white border-r border-gray-200 flex flex-col shadow-lg rounded-r-xl">
            {/* New Chat Button */}
            <div className="p-4 mt-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNewChat}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-[#273658] text-white rounded-lg hover:bg-[#273658] transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">New Chat</span>
                </motion.button>
            </div>

            {/* Chat Threads */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Loading State - Show spinner while loading */}
                {loading ? (
                    <div className="flex flex-1 items-center justify-center px-4">
                        <LoadingSpinner
                            variant="sidebar"
                            size="md"
                            message={`Loading ${getChatTypeDisplayName()} chats...`}
                        />
                    </div>
                ) : (
                    <>
                        {/* Header - Only show if threads exist */}
                        {filteredThreads.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-4 pb-2"
                            >
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    {getChatTypeDisplayName()} Chats ({filteredThreads.length})
                                </h3>
                            </motion.div>
                        )}

                        {/* Threads List or Empty State */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4">
                            {filteredThreads.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center h-32 text-center"
                                >
                                    <div>
                                        <div className="mb-4">
                                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            No {getChatTypeDisplayName().toLowerCase()} conversations yet
                                        </p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Start a new {getChatTypeDisplayName().toLowerCase()} chat to begin!
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-2"
                                >
                                    {filteredThreads.map((thread, index) => (
                                        <motion.button
                                            key={thread.thread_id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleThreadClick(thread.thread_id)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 shadow-lg group ${currentThreadId === thread.thread_id
                                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                                : "bg-gray-50 border-gray-100 hover:bg-blue-50 hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentThreadId === thread.thread_id ? "text-[#273658]" : "text-gray-400"
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium text-sm truncate ${currentThreadId === thread.thread_id ? "text-[#273658]" : "text-gray-900"
                                                        }`}>
                                                        {animatingTitles[thread.thread_id] ? (
                                                            <Typewriter
                                                                text={thread.title}
                                                                delay={30}
                                                                onComplete={() => handleAnimationComplete(thread.thread_id)}
                                                            />
                                                        ) : (
                                                            thread.title
                                                        )}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(thread.updated_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* User Profile Section */}
                        <div className="p-4 border-t border-gray-200" ref={userMenuRef}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 px-1 py-2 w-full hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                    {getInitials(userName)}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </motion.button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute bottom-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                                    >
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setUserMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Log out</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}