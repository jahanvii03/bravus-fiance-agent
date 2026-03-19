import { motion, AnimatePresence } from "framer-motion"
import { File, TrendingUp, CircleCheckBig, Home, LogOut, MessageSquareText, Info } from "lucide-react"
import SuggestionCard from "./SuggestionCard"
import MessageBubble from "./MessageBubble"
import { useNavigate, useLocation } from "react-router-dom"
import { useRef, useEffect, useState } from "react"
import Logo from "../../../assets/logo.png"
import { useAuth } from "../../../contexts/authContext"
import GuidanceModal from "./GuidanceModal"
import type { Message } from "../types"


export interface PowerAlarmData {
    [key: string]: string | number;
}

interface ChatAreaProps {
    messages: Message[]
    onOpenModal: (type: "table" | "chart") => void
    chatType: string
    setDataBarData: React.Dispatch<React.SetStateAction<PowerAlarmData[]>>
}

export default function ChatArea({ messages, onOpenModal, chatType, setDataBarData }: ChatAreaProps) {
    const auth = useAuth()
    const [guidanceOpen, setGuidanceOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { user, logout } = useAuth();
    const [showGuidanceTooltip, setShowGuidanceTooltip] = useState(false)
    const adminEmails = ["BitScape.Admin@adani.com.au", "Nitesh.Barot@bravus.com.au", "Deven.Vayada@nqxt.com.au"]
    const isAdminUser = adminEmails.includes(user?.email || "")

    const allSuggestions = [
        {
            icon: File,
            title: "Finance",
            subTitle: "",
            path: "/commercial-ai"
        },

    ]

    // Filter suggestions based on admin status
    const suggestions = allSuggestions.filter(s => !s.adminOnly || isAdminUser)
    // console.log("-----------", suggestions);



    const navigate = useNavigate()
    const location = useLocation()
    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) {
            return 'Good Morning';
        } else if (hours >= 12 && hours < 18) {
            return 'Good Afternoon';
        } else {
            return 'Good Evening';
        }
    };

    // Check if current path is home
    const isHomePage = location.pathname === '/' || location.pathname === '/home'

    const handleLogout = async () => { logout(); };
    useEffect(() => {
        const hasSeenGuidance = localStorage.getItem('hasSeenGuidanceTooltip');
        if (!hasSeenGuidance && user?.email) {
            setShowGuidanceTooltip(true);
            // Hide tooltip after 5 seconds
            const timer = setTimeout(() => {
                setShowGuidanceTooltip(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCardClick = (path: string, title: string) => {
        console.log('Navigating to:', path); // Debug log
        try {
            navigate(path);
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const name = auth.user?.name || "User";

    const handleHomeClick = () => {
        console.log('Navigating to home'); // Debug log
        try {
            navigate('/');
        } catch (error) {
            console.error('Home navigation error:', error);
        }
    };

    const getFilteredSuggestions = () => {
        if (chatType === "commercial-ai") {
            return suggestions.filter(s => s.path === "/commercial-ai");
        } else if (chatType === "sap-data") {
            return suggestions.filter(s => s.path === "/sap-data");
        } else if (chatType === "doa") {
            return suggestions.filter(s => s.path === "/doa");
        }
        return suggestions; // Show all for general chat
    };

    const filteredSuggestions = getFilteredSuggestions();
    const getGridClass = (count: number) => {
         console.log('count',count)

        if (count === 1) {
            return "w-full max-w-sm mx-auto shadow-lg"
        } else if (count === 3) {
            return "grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl"
        } else if (count === 4) {
            return "grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-3xl"
        }
        else if (count === 5) {
            return "grid grid-cols-1 md:grid-cols-5 gap-4 w-full max-w-4xl"
        }
        return "grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl"
    }


    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleGuidanceClick = () => {
        setGuidanceOpen(true);
        // Mark as seen
        localStorage.setItem('hasSeenGuidanceTooltip', 'true');
        setShowGuidanceTooltip(false);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
            {isHomePage && (
                <div className="flex items-center justify-between px-5 pt-4">
                    <img alt="" src={Logo} className="w-40 h-7" />
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="text-2xl font-bold text-gray-600 pb-2 hover:text-gray-800 transition-colors cursor-pointer"
                        >
                            {getGreeting()}! {name}
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                                >
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
            {/* Home Button - Only show when not on home page */}
            {!isHomePage && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleHomeClick}
                    className="fixed top-6 right-84 z-50 bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-3 shadow-lg transition-all duration-200 group"
                    aria-label="Go to Home"
                >
                    <Home className="w-5 h-5 text-gray-600 group-hover:text-[#273658] transition-colors" />
                </motion.button>
            )}

            {messages.length === 0 ? (
                <div className="mt-40 ">
                    {isHomePage ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto"
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-center mb-12"
                            >
                                <h1 className="text-3xl lg:text-4xl font-medium text-gray-800 mb-4">
                                    Welcome to <b>Bravus {chatType === "commercial-ai" ? "Commercial AI" : chatType === "sap-data" ? "Commercial Agentic AI" : "Commercial Agentic AI"}</b>
                                </h1>

                                <h2 className="text-2xl lg:text-3xl font-medium text-gray-700 mb-6">Can I help you with anything?</h2>
                                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                                    Ready to assist you with anything you need, from answering questions to providing recommendations. Let's
                                    get started!
                                </p>
                            </motion.div>
                            {filteredSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className={getGridClass(filteredSuggestions.length)}
                                >
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <SuggestionCard
                                            subtitle=""
                                            key={index}
                                            {...suggestion}
                                            delay={0.8 + index * 0.1}
                                            onClick={() => handleCardClick(suggestion.path, suggestion.title)}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto"
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-center mb-12"
                            >
                                <h1 className="text-3xl lg:text-4xl font-medium text-gray-800 mb-4">
                                    Welcome to <b>Bravus {chatType === "commercial-ai" ? "Commercial AI" : chatType === "sap-data" ? "Commercial Agentic AI" : "Commercial Agentic AI"}</b>
                                </h1>
                                <h2 className="text-2xl lg:text-3xl font-medium text-gray-700 mb-6">Can I help you with anything?</h2>
                                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                                    Ready to assist you with anything you need, from answering questions to providing recommendations. Let's
                                    get started!
                                </p>
                            </motion.div>
                            {filteredSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className={getGridClass(filteredSuggestions.length)}
                                >
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <SuggestionCard
                                            subtitle=""
                                            key={index}
                                            {...suggestion}
                                            delay={0.8 + index * 0.1}
                                            onClick={() => handleCardClick(suggestion.path, suggestion.title)}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} onOpenModal={onOpenModal} setDataBarData={setDataBarData} />
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            )}
            <div className="fixed bottom-8 right-8 z-40">
                {/* Tooltip */}
                {isHomePage && (
                    <AnimatePresence>
                        {showGuidanceTooltip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-20 right-0 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg"
                            >
                                <p>Please click the button for guidance</p>
                                <div className="absolute bottom-0 right-4 w-2 h-2 bg-gray-800 transform rotate-45 translate-y-1"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* Info Button */}
                {isHomePage &&
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGuidanceClick}
                        className="w-14 h-14 bg-[#273658] hover:bg-[#3d4f7a] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group"
                        aria-label="Show guidance"
                        title="Application Guidance"
                    >
                        <Info className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </motion.button>
                }
            </div>
            {/* Guidance Modal */}
            <GuidanceModal isOpen={guidanceOpen} onClose={() => setGuidanceOpen(false)} />
        </div>
    )
}