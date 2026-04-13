import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, DollarSign, TrendingUp, Calendar, CheckSquare,
  ArrowRight, Landmark, FileText, Trophy, Newspaper,
  Sparkles, Zap, Target, Flame, ChevronRight, Star,
  BarChart2, Brain, BookOpen, Activity, Crown
} from 'lucide-react';
import storage from '../utils/storage';
import { updateStreak, getStreak, isInactive, updateActivity } from '../utils/streaks';
import { getLoanReadinessScore, getProgressPercentage } from '../utils/scoring';
import { getPersonalizedSuggestions, trackPageView } from '../utils/personalization';
import { syncStreakBadges, getRewardsState, getLevelInfo } from '../utils/rewards';
import DailyTip from '../components/DailyTip';
import SmartNudge from '../components/SmartNudge';
import StreakCounter from '../components/StreakCounter';
import ProgressBar from '../components/ProgressBar';
import checklistData from '../data/checklist.json';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

/* ─── Module cards config ─────────────────────────────────────────────── */
const navCards = [
  {
    path: '/explore', title: 'Career Chatbot', description: 'AI-powered study abroad advisor',
    icon: Brain, emoji: '🤖',
    gradient: 'from-teal-500 to-cyan-400', lightBg: 'bg-teal-50', border: 'border-teal-200',
    glow: 'shadow-teal-200', tag: 'AI',
  },
  {
    path: '/finance', title: 'ROI & Finance', description: 'Investment calculator & loan eligibility',
    icon: DollarSign, emoji: '💰',
    gradient: 'from-blue-500 to-indigo-400', lightBg: 'bg-blue-50', border: 'border-blue-200',
    glow: 'shadow-blue-200', tag: 'Finance',
  },
  {
    path: '/loans', title: 'Loan Hub', description: 'Personalized loan offers & comparisons',
    icon: Landmark, emoji: '🏦',
    gradient: 'from-indigo-500 to-purple-400', lightBg: 'bg-indigo-50', border: 'border-indigo-200',
    glow: 'shadow-indigo-200', tag: 'Finance',
  },
  {
    path: '/sop', title: 'SOP Generator', description: 'AI-written statement of purpose',
    icon: FileText, emoji: '✍️',
    gradient: 'from-amber-500 to-orange-400', lightBg: 'bg-amber-50', border: 'border-amber-200',
    glow: 'shadow-amber-200', tag: 'Apply',
  },
  {
    path: '/predictor', title: 'Admission Score', description: 'Admission probability analysis',
    icon: TrendingUp, emoji: '📊',
    gradient: 'from-purple-500 to-pink-400', lightBg: 'bg-purple-50', border: 'border-purple-200',
    glow: 'shadow-purple-200', tag: 'Predict',
  },
  {
    path: '/timeline', title: 'Timeline', description: 'Application roadmap tracker',
    icon: Calendar, emoji: '📅',
    gradient: 'from-rose-500 to-pink-400', lightBg: 'bg-rose-50', border: 'border-rose-200',
    glow: 'shadow-rose-200', tag: 'Plan',
  },
  {
    path: '/progress', title: 'Progress', description: 'Document checklist tracker',
    icon: CheckSquare, emoji: '✅',
    gradient: 'from-green-500 to-emerald-400', lightBg: 'bg-green-50', border: 'border-green-200',
    glow: 'shadow-green-200', tag: 'Track',
  },
  {
    path: '/rewards', title: 'Rewards', description: 'XP points, badges & levels',
    icon: Trophy, emoji: '🏆',
    gradient: 'from-yellow-500 to-orange-400', lightBg: 'bg-yellow-50', border: 'border-yellow-200',
    glow: 'shadow-yellow-200', tag: 'Earn',
  },
  {
    path: '/content', title: 'AI Insights', description: 'Guides, articles & newsletters',
    icon: Newspaper, emoji: '📰',
    gradient: 'from-pink-500 to-rose-400', lightBg: 'bg-pink-50', border: 'border-pink-200',
    glow: 'shadow-pink-200', tag: 'Learn',
  },
];

/* ─── Animated counter ────────────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) return;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

/* ─── Module card ─────────────────────────────────────────────────────── */
function ModuleCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, type: 'spring', stiffness: 240, damping: 22 }}
    >
      <Link to={card.path} className="block group h-full">
        <div className={cn(
          'relative h-full rounded-3xl border p-6 bg-white transition-all duration-300 overflow-hidden',
          'hover:shadow-xl hover:-translate-y-1',
          card.border, card.glow,
          'hover:shadow-lg'
        )}>
          {/* Gradient sweep on hover */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500',
            card.gradient
          )} />

          {/* Tag pill */}
          <div className={cn(
            'absolute top-4 right-4 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest',
            card.lightBg, 'text-gray-500 border', card.border
          )}>
            {card.tag}
          </div>

          {/* Icon */}
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 relative',
            `bg-gradient-to-br ${card.gradient}`,
            'shadow-md group-hover:scale-110 transition-transform duration-500'
          )}>
            <div className={cn('absolute inset-0 rounded-2xl blur-md opacity-50', `bg-gradient-to-br ${card.gradient}`)} />
            <span className="relative z-10">{card.emoji}</span>
          </div>

          <h3 className="text-base font-black text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300 leading-tight mb-1">
            {card.title}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-4">{card.description}</p>

          <div className={cn(
            'flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest',
            'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300',
            `text-transparent bg-clip-text bg-gradient-to-r ${card.gradient}`
          )}>
            Open Module <ArrowRight size={10} className={cn(`text-current`)} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Stat chip ───────────────────────────────────────────────────────── */
function StatChip({ icon: Icon, value, label, suffix, accent, bg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <GlassCard className={cn('p-5 relative overflow-hidden group border-gray-100 hover:border-gray-200')} hoverable={false}>
        <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', accent)} />
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
          <Icon className={cn('w-5 h-5', accent.replace('from-', 'text-').split(' ')[0])} />
        </div>
        <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
          <AnimatedNumber value={value} suffix={suffix} />
        </p>
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">{label}</p>
      </GlassCard>
    </motion.div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const profile = storage.get('edupath_profile', {});
  const [streak, setStreak] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [levelInfo, setLevelInfo] = useState(null);
  const [rewardsState, setRewardsState] = useState(null);
  const completedIds = storage.get('edupath_checklist_completed', []);
  const progress = getProgressPercentage(completedIds, checklistData.length);
  const loanScore = getLoanReadinessScore(completedIds);

  useEffect(() => {
    trackPageView('/dashboard');
    const streakData = updateStreak();
    setStreak(streakData.streak);
    updateActivity();
    syncStreakBadges(streakData.streak);

    setSuggestions(getPersonalizedSuggestions(profile));

    const state = getRewardsState();
    setRewardsState(state);
    setLevelInfo(getLevelInfo(state.xp));

    if (isInactive(2)) setTimeout(() => setShowNudge(true), 4000);
  }, []);

  const firstName = profile.name ? profile.name.split(' ')[0] : 'Scholar';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetIcon = hour < 12 ? '🌤️' : hour < 17 ? '☀️' : '🌙';

  const xpToNext = levelInfo?.next ? levelInfo.next.minXP - (rewardsState?.xp || 0) : 0;
  const xpProgress = levelInfo?.progress || 0;

  return (
    <PageTransition transitionKey="dashboard">
      <div className="space-y-10 pb-16">

        {/* ── Hero Banner ─────────────────────────────────────────────── */}
        <section>
          <GlassCard
            className="relative overflow-hidden border-gray-100 p-0"
            hoverable={false}
          >
            {/* Ambient blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-purple-400/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-yellow-400/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                {/* Left: Greeting + progress */}
                <div className="space-y-7">
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-full w-fit"
                  >
                    <span>{greetIcon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{greeting}, Commander</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                  >
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                      Welcome back,{' '}
                      <span className="text-gradient">{firstName}!</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-base leading-relaxed max-w-md">
                      Your path to{' '}
                      <span className="text-gray-900 font-bold">{profile.targetCourse || 'your dream program'}</span>
                      {' '}in{' '}
                      <span className="text-gray-900 font-bold">{profile.preferredCountries?.[0] || 'your chosen country'}</span>
                      {' '}is on track.
                    </p>
                  </motion.div>

                  {/* Mission progress bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mission Completion</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">{progress}% done</span>
                    </div>
                    <ProgressBar percentage={progress} className="h-2.5" />
                  </motion.div>

                  {/* Level XP bar */}
                  {levelInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shrink-0 shadow-md">
                        <Crown size={18} className="text-white" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700">
                            Stage {levelInfo.level} — {levelInfo.name}
                          </span>
                          <span className="text-[9px] font-black text-yellow-600">
                            {xpToNext > 0 ? `${xpToNext} XP to next` : '⭐ Max Level'}
                          </span>
                        </div>
                        <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                          />
                        </div>
                        <p className="text-[8px] text-yellow-600 font-bold">
                          {rewardsState?.xp || 0} XP accumulated
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right: Circular progress + quick actions */}
                <div className="flex flex-col items-center gap-8">
                  {/* Big circular ring */}
                  <div className="relative w-52 h-52">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="88" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                      <motion.circle
                        cx="100" cy="100" r="88"
                        stroke="url(#dash-grad)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 88}
                        initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress / 100) }}
                        transition={{ duration: 1.6, ease: 'easeOut', delay: 0.4 }}
                      />
                      <defs>
                        <linearGradient id="dash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-5xl font-black text-gray-900 leading-none">{progress}%</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Overall</span>
                      <span className="text-[8px] font-medium text-gray-400 mt-0.5">Checklist</span>
                    </div>
                  </div>

                  {/* Mini quick-action chips */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { path: '/sop', label: 'Generate SOP', icon: '✍️' },
                      { path: '/predictor', label: 'Predict Odds', icon: '🎯' },
                      { path: '/rewards', label: 'View Rewards', icon: '🏆' },
                    ].map((q) => (
                      <Link key={q.path} to={q.path}>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-teal-300 hover:shadow-sm transition-all text-[10px] font-black text-gray-600 hover:text-teal-600 uppercase tracking-widest">
                          <span>{q.icon}</span> {q.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </GlassCard>
        </section>

        {/* ── Key Metrics ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-teal-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Live Metrics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatChip icon={BarChart2}  value={progress}     suffix="%"    label="Mission Progress"   accent="from-teal-400 to-cyan-400"     bg="bg-teal-50"   delay={0.05} />
            <StatChip icon={Landmark}   value={loanScore}    suffix="%"    label="Loan Readiness"     accent="from-blue-400 to-indigo-400"   bg="bg-blue-50"   delay={0.10} />
            <StatChip icon={Flame}      value={streak}       suffix=" d"   label="Day Streak"         accent="from-orange-400 to-red-400"    bg="bg-orange-50" delay={0.15} />
            <StatChip icon={Trophy}     value={rewardsState?.xp || 0} suffix=" XP" label={levelInfo ? `Stage ${levelInfo.level} · ${levelInfo.name}` : 'XP Power'} accent="from-yellow-400 to-orange-400" bg="bg-yellow-50" delay={0.20} />
          </div>
        </section>

        {/* ── AI Suggestions ──────────────────────────────────────────── */}
        {suggestions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-teal-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">AI Recommendations For You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((s, idx) => (
                <Link key={idx} to={s.path}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="group relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-5 h-full
                               hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 to-indigo-400/0 group-hover:from-teal-400/5 group-hover:to-indigo-400/5 transition-all duration-500 rounded-3xl" />
                    <div className="relative z-10 flex gap-4 items-start">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-500 shrink-0">{s.icon}</div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-black text-gray-900 text-sm group-hover:text-teal-600 transition-colors uppercase tracking-tight truncate">{s.title}</h3>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                      </div>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── OS Module Grid ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-teal-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Platform Modules</h2>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{navCards.length} tools</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {navCards.map((card, idx) => (
              <ModuleCard key={card.path} card={card} index={idx} />
            ))}
          </div>
        </section>

        {/* ── Engagement Footer ────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
          <StreakCounter streak={streak} />
          <DailyTip />
        </section>

        {/* ── Smart Nudge ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {showNudge && (
            <SmartNudge
              message="System Alert: Your document pipeline is currently idle. Several critical nodes require your intervention."
              cta="Resolve Progress"
              ctaPath="/progress"
              onDismiss={() => setShowNudge(false)}
            />
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
  );
}
