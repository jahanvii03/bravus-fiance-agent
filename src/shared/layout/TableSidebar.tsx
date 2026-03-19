import { motion, AnimatePresence } from "framer-motion"
import { X, Search, AlertTriangle, Download } from "lucide-react"
import { useState, useMemo } from "react"
import PowerAlarmTable from "../../features/chat/components/PowerAlarmTable"
// import  PowerAlarmData  from "../../features/chat/components/MessageBubble"
export interface PowerAlarmData {
    [key: string]: string | number;
}

export interface TableSidebarProps {
    isOpen: boolean
    onClose: () => void
    data: PowerAlarmData[]
}

export default function TableSidebar({ isOpen, onClose, data }: TableSidebarProps) {
    const [searchTerm] = useState("")

    // console.log("-data------", data)
    // console.log("TableSidebar: isOpen =", isOpen);
    // console.log("TableSidebar: data length =", data?.length);

    // Calculate dynamic modal size based on data
    const modalDimensions = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                width: "max-w-md",
                height: "h-96"
            }
        }

        const dataLength = data.length;
        const columnCount = data[0] ? Object.keys(data[0]).length : 0;

        // Calculate width based on number of columns
        let width = "max-w-md"; // Default for small tables
        if (columnCount >= 8) {
            width = "max-w-7xl";
        } else if (columnCount >= 6) {
            width = "max-w-6xl";
        } else if (columnCount >= 4) {
            width = "max-w-4xl";
        } else if (columnCount >= 3) {
            width = "max-w-2xl";
        } else if (columnCount >= 2) {
            width = "max-w-xl";
        }

        // Calculate height based on number of rows - INCREASED HEIGHTS
        let height = "h-auto max-h-[95vh]"; // Increased from 90vh
        if (dataLength <= 3) {
            height = "h-auto max-h-[80vh]"; // Increased from 96
        } else if (dataLength <= 10) {
            height = "h-auto max-h-[85vh]"; // Increased from 60vh
        } else if (dataLength <= 25) {
            height = "h-auto max-h-[90vh]"; // Increased from 75vh
        } else {
            height = "h-auto max-h-[95vh]"; // Increased from 90vh
        }

        return { width, height };
    }, [data]);

    // Calculate minimum height for very small datasets - INCREASED MINIMUMS
    const getMinHeight = useMemo(() => {
        if (!data || data.length === 0) return "min-h-80"; // Increased from 64
        if (data.length <= 3) return "min-h-[500px]"; // Increased from 80
        if (data.length <= 10) return "min-h-[600px]"; // Increased from 96
        return "min-h-[70vh]"; // Increased from 10vh
    }, [data]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`
                            bg-white rounded-xl shadow-2xl w-full flex flex-col overflow-auto 
                            ${modalDimensions.width} 
                            ${modalDimensions.height}
                            ${getMinHeight}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >


                        {/* Table Container */}
                        <div className="flex-1 overflow-x-auto overflow-y-auto">
                            <PowerAlarmTable
                                data={data}
                                searchTerm={searchTerm}
                            // className="h-full"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}