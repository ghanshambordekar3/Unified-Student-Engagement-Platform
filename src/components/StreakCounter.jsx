import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Zap, Calendar } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { cn } from '../utils/cn';

export default function StreakCounter({ streak }) {
  const isHot = streak >= 3;
  const isOnFire = streak >= 7;

  return (
    <GlassCard 
      hoverable={false} 
      className={cn(
        "flex items-center gap-5 p-6 border-gray-200 shadow-lg relative overflow-hidden",
        isOnFire && "border-orange-200"
      )}
    >
      {/* Decorative background glow for Fire state */}
      <AnimatePresence>
        {isOnFire && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 blur-3xl rounded-full"
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <motion.div
          animate={isOnFire ? {
            scale: [1, 1.2, 1],
            filter: ["drop-shadow(0 0 2px #f97316)", "drop-shadow(0 0 10px #f97316)", "drop-shadow(0 0 2px #f97316)"]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
            isOnFire ? "bg-orange-100 border-orange-200 text-orange-500" :
            isHot ? "bg-teal-100 border-teal-200 text-teal-500" :
            "bg-gray-100 border-gray-200 text-gray-500"
          )}
        >
          {isOnFire ? <Flame size={28} /> : isHot ? <Zap size={28} /> : <Calendar size={28} />}
        </motion.div>
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-baseline gap-1.5">
          <motion.span 
            key={streak}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-black text-gray-900 tracking-tighter"
          >
            {streak}
          </motion.span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Day Evolution</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-tight">
          {isOnFire
            ? "Critical Momentum Maintained"
            : isHot
            ? "Active Engagement Detected"
            : "Login Sequence Initialized"}
        </p>
      </div>

      {streak > 0 && (
        <div className="hidden sm:flex flex-col items-end gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i < (streak % 8 || 7) ? 1 : 0.8,
                  opacity: i < (streak % 8 || 7) ? 1 : 0.2
                }}
                className={cn(
                  "w-1.5 h-4 rounded-full transition-all duration-500",
                  i < (streak % 8 || 7)
                    ? isOnFire ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                    : "bg-gray-200"
                )}
              />
            ))}
          </div>
          {streak > 7 && (
            <div className="px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Extended Surge +{streak - 7}</span>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
