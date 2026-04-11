import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

export default function ChecklistItem({ item, checked, onToggle }) {
  const { label } = item;

  return (
    <motion.div
      layout
      onClick={() => onToggle(item.id)}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border",
        checked 
          ? "bg-teal-50 border-teal-200 shadow-sm shadow-teal-500/5" 
          : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
      )}
    >
      {/* Premium Checkbox */}
      <div className="relative">
        <div 
          className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
            checked 
              ? "bg-teal-500 border-teal-500 shadow-lg shadow-teal-500/30" 
              : "border-gray-300 group-hover:border-teal-500"
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check size={14} className="text-white" strokeWidth={4} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!checked && (
          <div className="absolute inset-0 rounded-lg bg-teal-400 opacity-0 group-hover:opacity-10 blur-md transition-opacity" />
        )}
      </div>

      {/* Label Content */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-sm font-bold tracking-tight transition-all duration-300 truncate",
            checked ? "text-gray-400 line-through decoration-teal-500/50" : "text-gray-900"
          )}
        >
          {label}
        </span>
      </div>

      {/* Status Badge */}
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Verified</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
