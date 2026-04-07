import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { useState, useEffect } from "react"
import Logo from "../../../assets/logo.png"

// 🔽 import all icons
import KMIcon from "../../../assets/DocumentSearch.png"
import NFAIcon from "../../../assets/NFA.svg"
import POInvoiceIcon from "../../../assets/PO Invoice.svg"
import POIcon from "../../../assets/PO.svg"
import SesIcon from "../../../assets/Ses.png"
import DefaultIcon from "../../../assets/logo.png" // fallback
import Contracts from "../../../assets/contract.png"

// map backend icon names → assets
const iconMap: Record<string, string> = {
  KM: KMIcon,
  NFA: NFAIcon,
  "PO Invoice": POInvoiceIcon,
  PO: POIcon,
  SES: SesIcon,
  Contracts: Contracts
}

interface PromptItem {
  id: string
  prompt: string
}

interface PromptCategory {
  id: string
  name: string
  icon?: string   // backend sends this
  prompts: PromptItem[]
}

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onSelectPrompt: (prompt: string) => void;
  onPopulateInput?: (text: string) => void;
  loadingData?: boolean;
  disabled?: boolean;
}

export default function PromptLibrary({
  isOpen,
  onClose,
  onSelectPrompt,
  onSendMessage,
  onPopulateInput,
  loadingData = false,
  disabled = false
}: PromptLibraryProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  // useEffect(() => {
  //   if (isOpen) fetchPrompts()
  // }, [isOpen])

  // const fetchPrompts = async () => {
  //   setLoading(true)
  //   setError(null)
  //   const priorityOrder = [
  //     "NFA - Note for Approval",
  //     "PO Invoice",
  //     "SES - Service Entry Sheet",
  //     "KM",
  //     "PO - Purchase Order"
  //   ];
  //   try {
  //     const response = await fetch("/api/get-prompts")
  //     if (response.ok) {
  //       const data = await response.json()
  //       const transformedCategories = data.prompt_categories?.map((category) => ({
  //         id: category.id,
  //         name: category.name || 'Unnamed Category',
  //         icon: category.icon,
  //         prompts: category.prompts || []
  //       })).sort((a, b) => {
  //         const indexA = priorityOrder.indexOf(a.name);
  //         const indexB = priorityOrder.indexOf(b.name);

  //         if (indexA !== -1 && indexB !== -1) {
  //           return indexA - indexB;
  //         }

  //         if (indexA !== -1 && indexB === -1) {
  //           return -1;
  //         }

  //         if (indexA === -1 && indexB !== -1) {
  //           return 1;
  //         }

  //         return 0;
  //       }) || [];
  //       setPromptCategories(transformedCategories)
  //       if (transformedCategories?.length > 0) {
  //         setExpandedCategories([transformedCategories[0].id])
  //       }
  //     } else {
  //       setError(`Failed to fetch prompts: ${response.statusText}`)
  //     }
  //   } catch (err) {
  //     setError("Failed to connect to server")
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const hasPlaceholders = (prompt: string): boolean => {
    return /\[.*?\]/.test(prompt);
  }

  const toggleCategory = (id: string) => {
    if (disabled) {
      return;
    }

    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handlePromptSelect = (prompt: string) => {
    if (disabled || loadingData) {
      return;
    }

    if (hasPlaceholders(prompt)) {
      if (onPopulateInput) {
        onPopulateInput(prompt);
      }
    } else {
      onSelectPrompt(prompt);
      onSendMessage(prompt);
    }
  };

  if (!isOpen) return null

  return (
    <div
      className={`h-full bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-80"
        }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
        {!collapsed && <img alt="" src={Logo} className="w-40 h-7" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronsRight className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronsLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {(disabled || loadingData) && !collapsed && (
          <div className="">
            <div className="flex items-center justify-center space-x-2">
              <div className=""></div>
              <span className="text-sm text-blue-700 font-medium">

              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : promptCategories.length === 0 ? (
          <div className="text-center text-gray-400 text-sm">
            No categories found
          </div>
        ) : (
          promptCategories.map((cat) => {
            const expanded = expandedCategories.includes(cat.id)
            const iconSrc = cat.icon ? iconMap[cat.icon] || DefaultIcon : DefaultIcon
            const isDisabled = disabled || loadingData

            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  disabled={isDisabled}
                  className={`w-full flex justify-between items-center px-3 py-2 bg-gray-50 text-[#273658] font-semibold transition-all duration-200 ${isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100 cursor-pointer'
                    }`}
                  title={collapsed ? cat.name : ""}
                  style={{
                    pointerEvents: isDisabled ? 'none' : 'auto'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <img
                      src={iconSrc}
                      alt={cat.icon || "icon"}
                      className="w-5 h-5 object-contain"
                    />
                    {!collapsed && cat.name}
                  </span>
                  {!collapsed &&
                    (expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    ))}
                </button>

                {!collapsed && expanded && (
                  <div className="p-2 space-y-1">
                    {cat.prompts.length > 0 ? (
                      cat.prompts.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handlePromptSelect(p.prompt)}
                          disabled={isDisabled}
                          className={`w-full text-left px-2 py-1 rounded text-sm transition-all duration-200 ${isDisabled
                            ? 'opacity-50 cursor-not-allowed bg-gray-100'
                            : 'hover:bg-gray-100 cursor-pointer'
                            }`}
                          style={{
                            pointerEvents: isDisabled ? 'none' : 'auto'
                          }}
                          title={hasPlaceholders(p.prompt) ? "Contains placeholders - fill them in the input box" : ""}
                        >
                          <div className="flex items-center justify-between">
                            <span>{p.prompt}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 text-center">
                        No prompts
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-2 border-t text-xs text-gray-500 text-center">
          {(disabled || loadingData)
            ? "Please wait for the current response to complete"
            : "Click any prompt to use it"
          }
        </div>
      )}
    </div>
  )
}