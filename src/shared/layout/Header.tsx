import { User, Menu } from "lucide-react"
import { motion } from "framer-motion"

interface HeaderProps {
    onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="px-4 py-3 flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                    {/* <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center"
                    >
                        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                        </div>
                    </motion.div> */}
                    <span className="text-lg font-bold text-gray-800">AI- Enabled Commercial System</span>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex flex-row items-center gap-2"
            >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-bold text-gray-800">Guest User</span>
            </motion.button>
        </motion.header>
    )
}
