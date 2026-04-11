import { useState } from 'react';
import { X, Bell, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateActivity } from '../utils/streaks';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';

export default function SmartNudge({ message, cta, ctaPath, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  const handleDismiss = () => {
    setVisible(false);
    updateActivity();
    onDismiss?.();
  };

  const handleCta = () => {
    updateActivity();
    setVisible(false);
    if (ctaPath) navigate(ctaPath);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-8 right-8 z-[100] max-w-sm w-full"
        >
          <GlassCard className="p-6 border-gray-200 shadow-xl relative overflow-hidden group" hoverable={false}>
            {/* Animated background pulse */}
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full animate-pulse-slow" />
            
            <div className="flex items-start gap-5 relative">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Bell size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white animate-pulse" />
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-1 flex items-center gap-1.5">
                    <Sparkles size={10} /> Smart Intelligence
                  </h4>
                  <p className="text-sm font-bold text-gray-900 tracking-tight leading-relaxed">
                    {message}
                  </p>
                </div>

                {cta && (
                  <Button 
                    size="sm" 
                    glow 
                    onClick={handleCta}
                    className="h-8 px-4 text-[10px] uppercase font-black tracking-widest"
                  >
                    {cta}
                  </Button>
                )}
              </div>

              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
              >
                <X size={16} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
