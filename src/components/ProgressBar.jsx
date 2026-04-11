import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export default function ProgressBar({ percentage, color = 'from-teal-500 to-blue-500', label, showLabel = true, height = 'h-3' }) {
  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
          <span className="text-xs font-black text-gray-900">{percentage}%</span>
        </div>
      )}
      <div className={cn("w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200", height)}>
        <motion.div
           initial={{ width: 0 }}
           animate={{ width: `${Math.min(percentage, 100)}%` }}
           transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
           className={cn(
             "h-full rounded-full bg-gradient-to-r relative",
             color
           )}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shimmer" />
          
          {/* Inner Glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
        </motion.div>
      </div>
    </div>
  );
}
