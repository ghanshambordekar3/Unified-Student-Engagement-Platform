import { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Activity, Award, Flame, Bot, BarChart3, ChevronRight, Sparkles } from 'lucide-react';
import { getAllBadgesWithStatus, getRewardsState, getLevelInfo, syncStreakBadges } from '../utils/rewards';
import { getStreak } from '../utils/streaks';
import ProgressBar from '../components/ProgressBar';
import { trackPageView } from '../utils/personalization';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

export default function Rewards() {
  const [badges, setBadges] = useState([]);
  const [rewardsState, setRewardsState] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    trackPageView('/rewards');
    const streak = getStreak();
    syncStreakBadges(streak);
    const state = getRewardsState();
    const all = getAllBadgesWithStatus();
    setBadges(all);
    setRewardsState(state);
    if (state) setLevelInfo(getLevelInfo(state.xp));
  }, []);

  if (!rewardsState || !levelInfo) return null;

  const categories = ['All', ...new Set(badges.map((b) => b.category))];
  const filteredBadges = activeCategory === 'All' ? badges : badges.filter((b) => b.category === activeCategory);
  const earnedCount = badges.filter((b) => b.earned).length;
  const xpToNext = levelInfo.next ? levelInfo.next.maxXP - rewardsState.xp : 0;

  const stats = [
    { label: 'Total XP', value: rewardsState.xp, icon: <Zap size={20} className="text-yellow-500" />, sub: 'Network Power' },
    { label: 'Artifacts', value: `${earnedCount}/${badges.length}`, icon: <Award size={20} className="text-blue-500" />, sub: 'Badges Unlocked' },
    { label: 'Neural Queries', value: rewardsState.stats.chatbot_queries, icon: <Bot size={20} className="text-purple-500" />, sub: 'AI Interactions' },
    { label: 'Chronos Streak', value: `${getStreak()} Days`, icon: <Flame size={20} className="text-orange-500" />, sub: 'Continuous Sync' },
  ];

  const earnOptions = [
    { action: 'Consult Neural Chatbot', xp: '+75 XP', icon: '🤖' },
    { action: 'Execute ROI Projection', xp: '+100 XP', icon: '📈' },
    { action: 'Generate Academic SOP', xp: '+200 XP', icon: '✍️' },
    { action: 'Initialize Loan Protocol', xp: '+300 XP', icon: '🏦' },
    { action: 'Admission Vector Analysis', xp: '+100 XP', icon: '🎯' },
    { action: '7-Cycle Synchronization', xp: '+250 XP', icon: '🔥' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full w-fit"
          >
            <Sparkles size={14} className="text-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700">Gamification Engine 2.1</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">System <span className="text-gradient">Advancement</span></h1>
          <p className="text-gray-500 font-medium text-sm">Quantifying your academic evolution through mission achievements.</p>
        </div>
      </section>

      {/* Level Card - High Spec */}
      <GlassCard className="p-10 md:p-14 relative overflow-hidden group border-yellow-200" hoverable={false}>
         {/* Animated Background Elements */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-100 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-200 transition-colors duration-1000" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-200 transition-colors duration-1000" />

         <div className="relative flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative shrink-0"
            >
               <div className="w-40 h-40 rounded-[40px] bg-gradient-to-br from-yellow-100 to-orange-200 border border-yellow-300 flex items-center justify-center relative group-hover:rotate-6 transition-transform duration-700">
                  <div className="absolute inset-0 bg-yellow-200 blur-2xl rounded-full" />
                  <span className="text-7xl relative z-10">🏅</span>
               </div>
               <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center font-black text-2xl text-gray-900 shadow-lg">
                 {levelInfo.level}
               </div>
            </motion.div>

            <div className="flex-1 space-y-6 text-center lg:text-left">
               <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-600 mb-2">Evolutionary Status</p>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight leading-none">
                    {levelInfo.name} <span className="text-gray-500 block md:inline md:ml-3 text-xl lowercase font-medium">Stage {levelInfo.level}</span>
                  </h2>
               </div>

               <div className="space-y-3 max-w-xl mx-auto lg:mx-0">
                  <div className="flex justify-between items-end px-1">
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{rewardsState.xp} / {levelInfo.next?.maxXP || 'MAX'} XP</span>
                     <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{xpToNext > 0 ? `${xpToNext} XP to next synchronization` : 'Peak Level Reached'}</span>
                  </div>
                  <ProgressBar
                    percentage={levelInfo.progress}
                    color="from-yellow-500 via-orange-500 to-yellow-600"
                    showLabel={false}
                    height="h-4"
                  />
               </div>

               <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Global Rank</p>
                     <p className="text-sm font-black text-gray-900">#1,284</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Percentile</p>
                     <p className="text-sm font-black text-teal-500">Top 8%</p>
                  </div>
               </div>
            </div>
         </div>
      </GlassCard>

      {/* Stats Cluster */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {stats.map((s, i) => (
           <motion.div
             key={s.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
           >
              <GlassCard className="p-6 h-full flex flex-col items-center text-center group border-gray-200 hover:border-gray-300">
                 <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    {s.icon}
                 </div>
                 <p className="text-2xl font-black text-gray-900 tracking-tight">{s.value}</p>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{s.label}</p>
                 <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight mt-1">{s.sub}</p>
              </GlassCard>
           </motion.div>
         ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Badge System */}
         <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Achievement Matrix</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Proof of academic accomplishment</p>
               </div>
               <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 overflow-x-auto no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        activeCategory === cat ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg" : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
               <AnimatePresence mode="popLayout">
                 {filteredBadges.map((badge, i) => (
                   <motion.div
                     layout
                     key={badge.id}
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ delay: i * 0.05 }}
                   >
                     <GlassCard 
                       className={cn(
                         "p-6 h-full text-center relative flex flex-col items-center group transition-all duration-500",
                         badge.earned ? "border-yellow-200 bg-yellow-50" : "opacity-50 grayscale"
                       )}
                     >
                        {badge.earned && (
                          <div className="absolute top-3 right-3">
                             <Sparkles size={12} className="text-yellow-500" />
                          </div>
                        )}
                        <div className={cn(
                          "w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4 transition-transform duration-700",
                          badge.earned ? "bg-yellow-100" : "bg-gray-100"
                        )}>
                           {badge.icon}
                        </div>
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-tight mb-2 group-hover:text-yellow-600 transition-colors">{badge.name}</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed mb-4 flex-1">{badge.description}</p>
                        
                        <div className={cn(
                          "px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-colors",
                          badge.earned ? "bg-yellow-100 border-yellow-200 text-yellow-600" : "bg-gray-100 border-gray-200 text-gray-500"
                        )}>
                           +{badge.xp} XP Vector
                        </div>
                        {badge.earned && (
                           <div className="mt-3 flex items-center gap-1.5 ring-1 ring-teal-200 px-2 py-0.5 rounded-full bg-teal-50">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                              <span className="text-[7px] font-black text-teal-600 uppercase tracking-widest">Synchronized</span>
                           </div>
                        )}
                     </GlassCard>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
         </div>

         {/* Acquisition Missions */}
         <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-8 space-y-6 flex flex-col h-full border-gray-200" hoverable={false}>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">XP Acquisition Protocol</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Operational directives for power growth</p>
               </div>

               <div className="space-y-3 flex-1">
                  {earnOptions.map((opt, i) => (
                    <motion.div 
                      key={opt.action}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-teal-300 transition-all cursor-pointer"
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                             {opt.icon}
                          </div>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-gray-900 transition-colors">{opt.action}</span>
                       </div>
                       <span className="text-[10px] font-black text-yellow-500 tracking-widest">{opt.xp}</span>
                    </motion.div>
                  ))}
               </div>

               <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                     <Trophy size={20} className="text-primary shrink-0" />
                     <p className="text-[9px] text-gray-600 font-bold uppercase leading-relaxed">
                       <span className="text-gray-900">Elite Achievement unlocked:</span> "Full Checklist synchronization" provides an <span className="text-primary font-bold">+500 XP</span> payload.
                     </p>
                  </div>
               </div>
            </GlassCard>
         </div>
      </div>
    </div>
  );
}
