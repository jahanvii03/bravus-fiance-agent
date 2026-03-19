import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle } from "lucide-react"

interface GuidanceModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function GuidanceModal({ isOpen, onClose }: GuidanceModalProps) {
    const guidelines = [
        {
            title: "Data Queries",
            description: "Be specific when querying data. Include filters like vendor name, status, or date range for better results."
        },
        {
            title: "Table Display",
            description: "Columns ending with 'Value' are right-aligned for better readability of numerical data. Other columns are left-aligned."
        },
        {
            title: "Invoice Downloads",
            description: "You can download single or bulk invoices. Select documents and use the download button for batch operations."
        },
        {
            title: "Verticals",
            description: "Please mention the relevant vertical like Mine, BRC, Port or Renewables to get a filtered data by vertical if required."
        },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Fixed */}
                        <div className="sticky top-0 bg-gradient-to-r from-[#273658] to-[#3d4f7a] text-white p-6 flex items-center justify-between rounded-t-3xl flex-shrink-0">
                            <h2 className="text-2xl font-bold">Application Guidance</h2>
                            <button
                                onClick={onClose}
                                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="p-8 overflow-y-auto flex-1">
                            <div className="space-y-6">
                                {guidelines.map((guideline, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-2">{guideline.title}</h3>
                                            <p className="text-gray-600 text-sm">{guideline.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="bg-gray-50 p-6 border-t border-gray-200 rounded-b-3xl flex justify-end flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-[#273658] text-white rounded-lg hover:bg-[#3d4f7a] transition-colors font-medium"
                            >
                                Got it!
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}