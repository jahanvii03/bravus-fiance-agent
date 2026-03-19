import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, ScrollText, X } from "lucide-react"
import { useLocation } from "react-router-dom"

interface PromptItem {
    id: string
    prompt: string
}

interface PromptCategory {
    id: string
    name: string
    icon?: string
    prompts: PromptItem[]
}

interface InputAreaProps {
    onSendMessage: (message: string) => void
    loading?: boolean
    onSettingsClick: () => void
}

const InputArea = forwardRef<any, InputAreaProps>(
    ({ onSendMessage, loading = false, onSettingsClick }, ref) => {
        const [message, setMessage] = useState("")
        const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([])
        const [suggestions, setSuggestions] = useState<PromptItem[]>([])
        const [showSuggestions, setShowSuggestions] = useState(false)
        const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
        const inputRef = useRef<HTMLInputElement>(null)
        const suggestionsRef = useRef<HTMLDivElement>(null)
        const location = useLocation();
        const isDOAPage = location.pathname.startsWith("/doa")

        // Fetch prompts on component mount
        useEffect(() => {
            fetchPrompts()
        }, [])

        const fetchPrompts = async () => {
            try {
                const response = await fetch("/api/get-prompts")
                if (response.ok) {
                    const data = await response.json()
                    const transformedCategories = data.prompt_categories?.map((category) => ({
                        id: category.id,
                        name: category.name || 'Unnamed Category',
                        icon: category.icon,
                        prompts: category.prompts || []
                    })) || []
                    setPromptCategories(transformedCategories)
                }
            } catch (err) {
                console.error("Failed to fetch prompts:", err)
            }
        }

        const filterSuggestions = (inputValue: string) => {
            if (!inputValue.trim()) {
                setSuggestions([])
                setShowSuggestions(false)
                return
            }

            const lowerInput = inputValue.toLowerCase()
            const allPrompts: PromptItem[] = []

            // Flatten all prompts from all categories
            promptCategories.forEach(category => {
                category.prompts.forEach(prompt => {
                    allPrompts.push(prompt)
                })
            })

            // Filter prompts that match the input
            const filtered = allPrompts.filter(prompt =>
                prompt.prompt.toLowerCase().includes(lowerInput)
            ).slice(0, 5) // Limit to 5 suggestions

            setSuggestions(filtered)
            setShowSuggestions(filtered.length > 0)
            setSelectedSuggestionIndex(-1)
        }

        const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setMessage(value)
            filterSuggestions(value)
        }

        const handleSuggestionClick = (suggestionPrompt: string) => {
            setMessage(suggestionPrompt)
            setSuggestions([])
            setShowSuggestions(false)
            setSelectedSuggestionIndex(-1)

            // Focus input for user to review before sending
            inputRef.current?.focus()
        }

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!showSuggestions || suggestions.length === 0) {
                if (e.key === "Enter") {
                    e.preventDefault()
                    handleSubmit(e as any)
                }
                return
            }

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setSelectedSuggestionIndex(prev =>
                        prev < suggestions.length - 1 ? prev + 1 : 0
                    )
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setSelectedSuggestionIndex(prev =>
                        prev > 0 ? prev - 1 : suggestions.length - 1
                    )
                    break
                case "Enter":
                    e.preventDefault()
                    if (selectedSuggestionIndex >= 0) {
                        handleSuggestionClick(suggestions[selectedSuggestionIndex].prompt)
                    } else {
                        handleSubmit(e as any)
                    }
                    break
                case "Escape":
                    e.preventDefault()
                    setSuggestions([])
                    setShowSuggestions(false)
                    break
                default:
                    break
            }
        }

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            if (message.trim() && !loading) {
                onSendMessage(message.trim())
                setMessage("")
                setSuggestions([])
                setShowSuggestions(false)
            }
        }

        const closeSuggestions = () => {
            setSuggestions([])
            setShowSuggestions(false)
            setSelectedSuggestionIndex(-1)
        }

        useImperativeHandle(ref, () => ({
            setInputValue: (value: string) => {
                setMessage(value);
            },
            focusInput: () => {
                inputRef.current?.focus();
            },
            clearInput: () => {
                setMessage("");
                closeSuggestions();
            }
        }));

        return (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 lg:p-8 mb-4">
                <div className="max-w-4xl mx-auto">
                    {/* Suggestions Container */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && !isDOAPage && (
                            <motion.div
                                ref={suggestionsRef}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="mb-3 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Suggestions from Prompt Library
                                    </div>
                                    {suggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={suggestion.id}
                                            onClick={() => handleSuggestionClick(suggestion.prompt)}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`w-full text-left px-3 py-2 rounded transition-all duration-150 ${selectedSuggestionIndex === index
                                                ? "bg-[#273658] text-white"
                                                : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                                                }`}
                                        >
                                            <p className="text-sm truncate">
                                                {suggestion.prompt}
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>
                                <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                                    Use ↑↓ to navigate, Enter to select, Esc to close
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={message}
                                onChange={handleMessageChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Agent anything..."
                                className="w-full px-4 py-3 bg-white shadow-md border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#273658] focus:border-transparent transition-all"
                                disabled={loading}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <button
                                    type="button"
                                    onClick={closeSuggestions}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Close suggestions"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className={`p-3 bg-[#273658] text-white rounded-full hover:bg-[#3d4f7a] transition-colors flex items-center justify-center ${loading ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            disabled={loading || !message.trim()}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        )
    }
)

InputArea.displayName = "InputArea"

export default InputArea