import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface SuggestionCardProps {
    icon: LucideIcon
    title: string
    subtitle: string
    path: string
    delay?: number
    onClick?: () => void
}

export default function SuggestionCard({
    icon: Icon,
    title,
    subtitle,
    delay = 0,
    onClick
}: SuggestionCardProps) {
    const handleClick = () => {
        console.log('SuggestionCard clicked:', title); // Debug log
        if (onClick) {
            onClick();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
            <div className="w-12 h-12 bg-[#273658] rounded-xl flex items-center justify-center mb-4">
                {typeof Icon === "function" ? <Icon /> : <Icon className="w-6 h-6 text-white" />}
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">{title}</h3>
            <p className="text-gray-500 text-xs lg:text-sm">{subtitle}</p>
        </motion.div>
    )
}
