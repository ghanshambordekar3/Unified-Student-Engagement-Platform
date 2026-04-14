import { useEffect, useState, useRef } from 'react';
import {
  Trophy, Star, Zap, Activity, Award, Flame, Bot,
  BarChart3, ChevronRight, Sparkles, Lock, CheckCircle2,
  TrendingUp, Crown, Shield, Gem
} from 'lucide-react';
import { getAllBadgesWithStatus, getRewardsState, getLevelInfo, syncStreakBadges } from '../utils/rewards';
import { getStreak } from '../utils/streaks';
import ProgressBar from '../components/ProgressBar';
import { trackPageView } from '../utils/personalization';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '../utils/cn';

/* ─── Rarity config ───────────────────────────────────────────────────── */
const getRarity = (xp) => {
  if (xp >= 400) return { label: 'Legendary', color: 'from-yellow-400 via-orange-400 to-red-400', ring: 'ring-yellow-400', glow: 'shadow-yellow-300', text: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-300' };
  if (xp >= 200) return { label: 'Epic',      color: 'from-purple-400 via-pink-400 to-indigo-400', ring: 'ring-purple-400', glow: 'shadow-purple-300', text: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-300' };
  if (xp >= 100) return { label: 'Rare',      color: 'from-blue-400 via-teal-400 to-cyan-400',     ring: 'ring-blue-400',   glow: 'shadow-blue-300',   text: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-300' };
  return              { label: 'Common',    color: 'from-gray-400 via-slate-400 to-gray-500',     ring: 'ring-gray-300',   glow: 'shadow-gray-200',   text: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200' };
};

const rarityOrder = { Legendary: 4, Epic: 3, Rare: 2, Common: 1 };

/* ─── Floating particle ───────────────────────────────────────────────── */
function Particle({ x, y, color }) {
  return (
    <motion.div
      className={`absolute w-1.5 h-1.5 rounded-full ${color} pointer-events-none`}
      style={{ left: x, top: y }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 0, y: -40 + Math.random() * -20, x: (Math.random() - 0.5) * 60 }}
      transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
    />
  );
}

/* ─── 3-D tilt badge card ─────────────────────────────────────────────── */
function BadgeCard({ badge, index }) {
  const ref = useRef(null);
  const [particles, setParticles] = useState([]);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-60, 60], [12, -12]);
  const rotateY = useTransform(mouseX, [-60, 60], [-12, 12]);
  const rarity = getRarity(badge.xp);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };
  const handleMouseEnter = () => {
    setHovered(true);
    if (badge.earned) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: 40 + Math.random() * 60,
        y: 40 + Math.random() * 40,
        color: rarity.label === 'Legendary' ? 'bg-yellow-400' :
               rarity.label === 'Epic'      ? 'bg-purple-400' :
               rarity.label === 'Rare'      ? 'bg-blue-400'   : 'bg-gray-400',
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 1200);
    }
  };

  return (
    <motion.div
      layout
      key={badge.id}
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 20 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
      style={{ perspective: 800 }}
      className="cursor-pointer"
    >
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative h-full"
      >
        {/* Glow halo — earned only */}
        {badge.earned && (
          <div className={cn(
            'absolute inset-0 rounded-3xl blur-xl opacity-0 transition-opacity duration-500 -z-10',
            hovered ? 'opacity-60' : 'opacity-20',
            `bg-gradient-to-br ${rarity.color}`
          )} />
        )}

        {/* Card body */}
        <div className={cn(
          'relative flex flex-col items-center text-center p-5 rounded-3xl border transition-all duration-300 h-full overflow-hidden',
          badge.earned
            ? `${rarity.bg} ${rarity.border} shadow-lg ${rarity.glow}`
            : 'bg-gray-50 border-gray-200 opacity-55 grayscale',
          hovered && badge.earned ? 'shadow-2xl -translate-y-1' : ''
        )}>
          {/* Shimmer sweep on earned */}
          {badge.earned && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={hovered ? { x: '200%' } : { x: '-100%' }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
            </div>
          )}

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <AnimatePresence>
              {particles.map((p) => <Particle key={p.id} {...p} />)}
            </AnimatePresence>
          </div>

          {/* Rarity badge top-left */}
          <div className={cn(
            'absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest',
            badge.earned
              ? `bg-gradient-to-r ${rarity.color} text-white shadow`
              : 'bg-gray-200 text-gray-400'
          )}>
            {rarity.label}
          </div>

          {/* Earned checkmark / lock top-right */}
          <div className="absolute top-2.5 right-2.5">
            {badge.earned
              ? <CheckCircle2 size={14} className={rarity.text} />
              : <Lock size={12} className="text-gray-400" />
            }
          </div>

          {/* Icon */}
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 mt-4 transition-transform duration-500 relative',
            badge.earned
              ? `bg-gradient-to-br ${rarity.color} shadow-md`
              : 'bg-gray-200'
          )}>
            {badge.earned && (
              <div className={cn('absolute inset-0 rounded-2xl blur-md opacity-60', `bg-gradient-to-br ${rarity.color}`)} />
            )}
            <span className="relative z-10">{badge.icon}</span>
          </div>

          {/* Name */}
          <h4 className={cn(
            'text-[10px] font-black uppercase tracking-widest leading-tight mb-1 transition-colors duration-300',
            badge.earned ? (hovered ? rarity.text : 'text-gray-900') : 'text-gray-500'
          )}>
            {badge.name}
          </h4>

          {/* Description */}
          <p className="text-[8px] text-gray-500 font-semibold leading-relaxed mb-3 flex-1 px-1">
            {badge.description}
          </p>

          {/* XP pill */}
          <div className={cn(
            'px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border',
            badge.earned
              ? `bg-gradient-to-r ${rarity.color} text-white border-transparent shadow`
              : 'bg-gray-100 border-gray-200 text-gray-400'
          )}>
            +{badge.xp} XP
          </div>

          {/* Synchronized pulse */}
          {badge.earned && (
            <div className="mt-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/70 border border-white/80">
              <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', rarity.text.replace('text-', 'bg-'))} />
              <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Unlocked</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Category pill ───────────────────────────────────────────────────── */
function CategoryPill({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2',
        active
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-200'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      {label}
      <span className={cn(
        'w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black',
        active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
      )}>{count}</span>
    </button>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────── */
export default function Rewards() {
  const [badges, setBadges] = useState([]);
  const [rewardsState, setRewardsState] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rarity'); // 'rarity' | 'earned' | 'xp'

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
  const categoryCount = (cat) =>
    cat === 'All' ? badges.length : badges.filter((b) => b.category === cat).length;

  const filtered = (activeCategory === 'All' ? badges : badges.filter((b) => b.category === activeCategory))
    .slice()
    .sort((a, b) => {
      if (sortBy === 'rarity') return rarityOrder[getRarity(b.xp).label] - rarityOrder[getRarity(a.xp).label];
      if (sortBy === 'earned') return Number(b.earned) - Number(a.earned);
      if (sortBy === 'xp')   return b.xp - a.xp;
      return 0;
    });

  const earnedCount   = badges.filter((b) => b.earned).length;
  const totalXP       = badges.filter((b) => b.earned).reduce((s, b) => s + b.xp, 0);
  const xpToNext = levelInfo.nextLevel ? levelInfo.nextLevel.minXP - rewardsState.xp : 0;
  const earnedPct     = Math.round((earnedCount / badges.length) * 100);

  const stats = [
    { label: 'Total XP',      value: rewardsState.xp,                       icon: <Zap size={20} className="text-yellow-500" />,  sub: 'Network Power',     accent: 'from-yellow-400 to-orange-400' },
    { label: 'Artifacts',     value: `${earnedCount}/${badges.length}`,      icon: <Award size={20} className="text-blue-500" />,  sub: 'Badges Unlocked',   accent: 'from-blue-400 to-cyan-400' },
    { label: 'Neural Queries',value: rewardsState.stats.chatbot_queries,     icon: <Bot size={20} className="text-purple-500" />, sub: 'AI Interactions',   accent: 'from-purple-400 to-pink-400' },
    { label: 'Chronos Streak',value: `${getStreak()} Days`,                  icon: <Flame size={20} className="text-orange-500" />,sub: 'Continuous Sync',   accent: 'from-orange-400 to-red-400' },
  ];

  const earnOptions = [
    { action: 'Consult Neural Chatbot',   xp: '+75 XP',  icon: '🤖', path: '/chat' },
    { action: 'Execute ROI Projection',   xp: '+100 XP', icon: '📈', path: '/finance' },
    { action: 'Generate Academic SOP',    xp: '+200 XP', icon: '✍️', path: '/sop' },
    { action: 'Initialize Loan Protocol', xp: '+300 XP', icon: '🏦', path: '/loans' },
    { action: 'Admission Vector Analysis',xp: '+100 XP', icon: '🎯', path: '/predictor' },
    { action: '7-Cycle Synchronization',  xp: '+250 XP', icon: '🔥', path: '/timeline' },
  ];

  return (
    <div className="space-y-10 pb-24">

      {/* ── Header ──────────────────────────────────────────────────── */}
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
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            System <span className="text-gradient">Advancement</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm">Quantifying your academic evolution through mission achievements.</p>
        </div>
      </section>

      {/* ── Level Card ──────────────────────────────────────────────── */}
      <GlassCard className="p-10 md:p-14 relative overflow-hidden group border-yellow-200" hoverable={false}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-100 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-200 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-200 transition-colors duration-1000" />

        <div className="relative flex flex-col lg:flex-row items-center gap-12">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative shrink-0">
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
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{rewardsState.xp} / {levelInfo.nextLevel?.minXP || 'MAX'} XP</span>
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                  {xpToNext > 0 ? `${xpToNext} XP to next` : 'Peak Level Reached'}
                </span>
              </div>
              <ProgressBar percentage={levelInfo.progress} color="from-yellow-500 via-orange-500 to-yellow-600" showLabel={false} height="h-4" />
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
              <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">Completion</p>
                <p className="text-sm font-black text-yellow-700">{earnedPct}%</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Stats Cluster ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="p-6 h-full flex flex-col items-center text-center group border-gray-200 hover:border-gray-300 overflow-hidden relative">
              <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', s.accent)} />
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

      {/* ── Main Content Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Badge System */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Achievement Matrix</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">
                  {earnedCount} of {badges.length} badges unlocked · {earnedPct}% complete
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                {[['rarity', 'Rarity'], ['earned', 'Earned'], ['xp', 'XP']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSortBy(val)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all',
                      sortBy === val ? 'bg-white text-gray-900 shadow border border-gray-200' : 'text-gray-500 hover:text-gray-800'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 flex-wrap">
              {categories.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  count={categoryCount(cat)}
                  active={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>

            {/* Rarity legend */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Legendary', color: 'from-yellow-400 to-orange-400', icon: <Crown size={10} /> },
                { label: 'Epic',      color: 'from-purple-400 to-pink-400',   icon: <Gem size={10} /> },
                { label: 'Rare',      color: 'from-blue-400 to-cyan-400',     icon: <Shield size={10} /> },
                { label: 'Common',    color: 'from-gray-400 to-slate-400',    icon: <Star size={10} /> },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
                  <div className={cn('w-3 h-3 rounded-full bg-gradient-to-br flex items-center justify-center text-white', r.color)}>
                    <span className="opacity-0 text-[6px]">&bull;</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badge grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No badges in this category</p>
            </motion.div>
          )}
        </div>

        {/* XP Acquisition Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Circular progress ring */}
          <GlassCard className="p-8 text-center relative overflow-hidden border-gray-200" hoverable={false}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-5">Badge Completion</p>
            <div className="relative w-32 h-32 mx-auto mb-5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" strokeWidth="10" stroke="#f3f4f6" fill="none" />
                <motion.circle
                  cx="60" cy="60" r="50"
                  strokeWidth="10"
                  fill="none"
                  stroke="url(#ring-grad)"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - earnedPct / 100) }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                />
                <defs>
                  <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">{earnedPct}%</span>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Earned</span>
              </div>
            </div>
            <div className="flex justify-center gap-6 text-center">
              <div>
                <p className="text-lg font-black text-gray-900">{earnedCount}</p>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Unlocked</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-lg font-black text-gray-400">{badges.length - earnedCount}</p>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Locked</p>
              </div>
            </div>
          </GlassCard>

          {/* XP Acquisition Protocol */}
          <GlassCard className="p-8 space-y-6 flex flex-col border-gray-200" hoverable={false}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-t-2xl" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">XP Acquisition Protocol</h3>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Operational directives for power growth</p>
            </div>

            <div className="space-y-2.5 flex-1">
              {earnOptions.map((opt, i) => (
                <motion.div
                  key={opt.action}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center text-sm group-hover:scale-110 transition-all duration-300">
                      {opt.icon}
                    </div>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover:text-gray-900 transition-colors">{opt.action}</span>
                  </div>
                  <span className="text-[10px] font-black text-yellow-500 tracking-widest">{opt.xp}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
                <Trophy size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[8px] text-gray-600 font-bold uppercase leading-relaxed">
                  <span className="text-gray-900">Elite unlock:</span> "Full Checklist Synchronization" awards a{' '}
                  <span className="text-yellow-600 font-black">+500 XP</span> bonus payload.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
