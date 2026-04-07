import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface SuggestionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  path: string;
  delay?: number;
  onClick?: () => void;
}

export default function SuggestionCard({
  icon: Icon,
  title,
  subtitle,
  delay = 0,
  onClick,
}: SuggestionCardProps) {
  const handleClick = () => {
    console.log("SuggestionCard clicked:", title); // Debug log
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
      className="bg-white rounded-xl shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow "
    >
      {/* <div className="w-12 h-12 bg-[#273658] rounded-xl flex items-center justify-center mb-4">
                {typeof Icon === "function" ? <Icon /> : <Icon className="w-6 h-6 text-white" />}
            </div> */}
      <div className="w-12 h-12 bg-[#273658] rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">
        {title}
      </h3>
      <p className="text-gray-500 text-xs lg:text-sm">{subtitle}</p>
    </motion.div>
  );
}

// export default function SuggestionCard({
//     icon: Icon,
//     title,
//     subtitle,
//     delay = 0,
//     onClick
// }: SuggestionCardProps) {
//     const handleClick = () => {
//         console.log('SuggestionCard clicked:', title);
//         if (onClick) onClick();
//     };

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay, duration: 0.4 }}
//             whileHover={{ scale: 1.04 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={handleClick}
//             className="
//                 group
//                 flex flex-col items-center justify-center text-center
//                 bg-white/80 backdrop-blur-md
//                 rounded-2xl shadow-md
//                 p-6 md:p-8
//                 border border-gray-200
//                 cursor-pointer
//                 transition-all duration-300
//                 hover:shadow-xl hover:-translate-y-1
//             "
//         >
//             {/* Icon */}
//             <div className="
//                 w-14 h-14
//                 bg-gradient-to-br from-[#273658] to-[#3b4f7a]
//                 rounded-2xl
//                 flex items-center justify-center
//                 mb-4
//                 transition-transform duration-300
//                 group-hover:scale-110
//             ">
//                 {typeof Icon === "function"
//                     ? <Icon />
//                     : <Icon className="w-6 h-6 text-white" />
//                 }
//             </div>

//             {/* Title */}
//             <h3 className="
//                 font-semibold text-gray-800
//                 text-sm lg:text-base
//                 mb-1
//             ">
//                 {title}
//             </h3>

//             {/* Subtitle */}
//             <p className="
//                 text-gray-500
//                 text-xs lg:text-sm
//                 max-w-[220px]
//             ">
//                 {subtitle}
//             </p>
//         </motion.div>
//     );
// }
