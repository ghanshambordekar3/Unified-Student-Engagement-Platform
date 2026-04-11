import { useState, useEffect } from 'react';
import { CheckSquare, Award, Target, Zap, Waves, Sparkles, GraduationCap, ChevronRight } from 'lucide-react';
import storage from '../utils/storage';
import { getLoanReadinessScore, getProgressPercentage } from '../utils/scoring';
import ChecklistItem from '../components/ChecklistItem';
import ProgressBar from '../components/ProgressBar';
import ReferralButton from '../components/ReferralButton';
import checklistData from '../data/checklist.json';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const COMPLETED_KEY = 'edupath_checklist_completed';

const grouped = checklistData.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {});

const categoryIcons = {
  Documents: '📄',
  Finance: '💰',
  Academic: '📚',
  Visa: '🛂',
  Travel: '✈️',
};

function CircularProgress({ percentage }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center w-48 h-48">
      {/* Glow effect */}
      <div className="absolute inset-4 bg-teal-100 blur-[40px] rounded-full animate-pulse-slow" />
      
      <svg className="progress-ring w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black text-gray-900 tracking-tighter"
        >
          {percentage}<span className="text-xl text-teal-500">%</span>
        </motion.span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Readiness</span>
      </div>
    </div>
  );
}

export default function Progress() {
  const [completedIds, setCompletedIds] = useState(() => storage.get(COMPLETED_KEY, []));
  const [showConfetti, setShowConfetti] = useState(false);

  const progress = getProgressPercentage(completedIds, checklistData.length);
  const loanScore = getLoanReadinessScore(completedIds);

  useEffect(() => {
    storage.set(COMPLETED_KEY, completedIds);
    if (progress === 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [completedIds]);

  const toggleItem = (id) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const completedCount = completedIds.length;
  const totalCount = checklistData.length;

  return (
    <PageTransition transitionKey="progress">
      <div className="space-y-10 pb-20">
        <AnimatePresence>
          {showConfetti && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: -20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: -20 }}
               className="relative"
            >
              <GlassCard className="border-teal-300 bg-teal-50 text-center py-10 overflow-hidden" hoverable={false}>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-100 via-transparent to-blue-100 animate-pulse-slow" />
                <Sparkles className="mx-auto text-teal-500 mb-4" size={48} />
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Mission Accomplished</h2>
                <p className="text-gray-500 font-medium mt-2 max-w-md mx-auto">Standard operating procedures complete. Your academic profile is now fully verified for global deployment.</p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full w-fit"
            >
              <Target size={14} className="text-teal-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Operational Readiness Tracker</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Deployment <span className="text-gradient">Status</span></h1>
            <p className="text-gray-500 font-medium text-sm">Real-time telemetry of your document verification and financial readiness.</p>
          </div>
        </section>

        {/* System Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Progress Ring */}
          <GlassCard className="lg:col-span-5 flex flex-col items-center justify-center py-12" hoverable={false}>
            <CircularProgress percentage={progress} />
            <div className="mt-8 flex items-center gap-4">
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">{completedCount}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Completed</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">{totalCount}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Total Nodes</p>
              </div>
            </div>
          </GlassCard>

          {/* Sub-Systems */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Loan Readiness */}
            <GlassCard className="p-8 flex flex-col justify-between" hoverable={false}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-500">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Financial Readiness</h3>
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">Asset verification coefficient</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">{loanScore}<span className="text-xs text-teal-500">%</span></p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-100">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${loanScore}%` }}
                     className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
                  />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">
                   {loanScore < 100 ? "Optimization required in documentation sub-layer" : "Credit facility integration operational"}
                </p>
              </div>
            </GlassCard>

            {/* Achievements/Milestones */}
            <GlassCard className="p-8" hoverable={false}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-500">
                  <Award size={24} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Milestone Matrix</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Initial Core', done: completedIds.length >= 1, icon: '🎯' },
                  { label: 'Half-Life', done: progress >= 50, icon: '⚡' },
                  { label: 'Credit Ready', done: loanScore === 100, icon: '🏦' },
                  { label: 'Zero-Origin', done: progress === 100, icon: '💎' },
                ].map((m) => (
                  <div key={m.label} className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                    m.done ? "bg-gray-100 border-teal-300 text-gray-900" : "bg-transparent border-gray-100 text-gray-500 opacity-40 grayscale"
                  )}>
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                    {m.done && <CheckSquare size={12} className="ml-auto text-teal-500" />}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Global Progress Bar */}
        <GlassCard className="p-8 border-gray-200 shadow-lg" hoverable={false}>
           <div className="flex justify-between items-end mb-4">
             <div className="space-y-1">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Aggregated System Health</h4>
               <p className="text-[8px] text-gray-500 font-bold tracking-widest uppercase">Verified across all subsystems</p>
             </div>
             <p className="text-2xl font-black text-gray-900">{progress}%</p>
           </div>
           <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-100">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-400"
             />
           </div>
        </GlassCard>

        {/* Document Clusters */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-gray-100 text-gray-500">
               <CheckSquare size={20} />
             </div>
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">System Checklist Nodes</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {Object.entries(grouped).map(([category, items]) => {
              const catCompleted = items.filter((i) => completedIds.includes(i.id)).length;
              return (
                <GlassCard key={category} className="p-8 border-gray-100" hoverable={false}>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xl">
                        {categoryIcons[category]}
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">{category} Cluster</h4>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">Verification Sub-Module</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">{catCompleted} / {items.length} COMPLETE</span>
                      <div className="w-32 bg-gray-100 rounded-full h-1 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(catCompleted / items.length) * 100}%` }}
                          className="h-full bg-teal-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={item}
                        checked={completedIds.includes(item.id)}
                        onToggle={toggleItem}
                      />
                    ))}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Referal / Actions */}
        <section className="pt-10 border-t border-gray-100">
           <ReferralButton />
        </section>
      </div>
    </PageTransition>
  );
}