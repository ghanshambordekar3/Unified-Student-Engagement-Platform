import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, DollarSign, TrendingUp, Calendar, CheckSquare, ArrowRight, Landmark, FileText, Trophy, Newspaper, Sparkles, Zap, Target } from 'lucide-react';
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
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const navCards = [
  { path: '/explore', title: 'Career Chatbot', description: 'AI-powered study abroad advisor', icon: Compass, emoji: '🤖', color: 'teal' },
  { path: '/finance', title: 'ROI & Finance', description: 'ROI calculator & loan eligibility', icon: DollarSign, emoji: '💰', color: 'blue' },
  { path: '/loans', title: 'Loan Hub', description: 'Personalized loan offers', icon: Landmark, emoji: '🏦', color: 'indigo' },
  { path: '/sop', title: 'SOP Generator', description: 'AI-written statement of purpose', icon: FileText, emoji: '✍️', color: 'amber' },
  { path: '/predictor', title: 'Admission Score', description: 'Admission probability analysis', icon: TrendingUp, emoji: '📊', color: 'purple' },
  { path: '/timeline', title: 'Timeline', description: 'Application roadmap tracker', icon: Calendar, emoji: '📅', color: 'rose' },
  { path: '/progress', title: 'Progress', description: 'Document checklist tracker', icon: CheckSquare, emoji: '✅', color: 'green' },
  { path: '/rewards', title: 'Rewards', description: 'XP points, badges & levels', icon: Trophy, emoji: '🏆', color: 'orange' },
  { path: '/content', title: 'AI Insights', description: 'Guides, articles & newsletters', icon: Newspaper, emoji: '📰', color: 'pink' },
];

export default function Dashboard() {
  const profile = storage.get('edupath_profile', {});
  const [streak, setStreak] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [levelInfo, setLevelInfo] = useState(null);
  const completedIds = storage.get('edupath_checklist_completed', []);
  const progress = getProgressPercentage(completedIds, checklistData.length);
  const loanScore = getLoanReadinessScore(completedIds);

  useEffect(() => {
    trackPageView('/dashboard');
    const streakData = updateStreak();
    setStreak(streakData.streak);
    updateActivity();
    syncStreakBadges(streakData.streak);

    const personalSuggs = getPersonalizedSuggestions(profile);
    setSuggestions(personalSuggs);

    const state = getRewardsState();
    const info = getLevelInfo(state.xp);
    setLevelInfo(info);

    if (isInactive(2)) {
      setTimeout(() => setShowNudge(true), 4000);
    }
  }, []);

  const firstName = profile.name ? profile.name.split(' ')[0] : 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  return (
    <PageTransition transitionKey="dashboard">
      <div className="space-y-10 pb-12">
        {/* Welcome Hero */}
        <section>
          <GlassCard className="p-8 md:p-12 relative overflow-hidden group border-gray-200" hoverable={false}>
            {/* Ambient Background elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full w-fit"
                >
                  <Sparkles size={14} className="text-teal-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">{greeting}, Commander</span>
                </motion.div>

                <div className="space-y-2">
                  <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                    Welcome back, <span className="text-gradient">{firstName}!</span>
                  </h1>
                  <p className="text-gray-600 font-medium text-lg leading-relaxed max-w-lg">
                    Your mission to <span className="text-gray-900 font-semibold">{profile.targetCourse || 'Success'}</span> in <span className="text-gray-900 font-semibold">{profile.preferredCountries?.[0] || 'Global Campus'}</span> is tracking well.
                  </p>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Mission Completion</span>
                    <span className="text-teal-500 font-black">{progress}%</span>
                  </div>
                  <ProgressBar percentage={progress} className="h-3" />
                </div>
              </div>

              <div className="hidden lg:flex justify-center">
                <div className="relative w-48 h-48">
                  {/* Outer Ring */}
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                    <motion.circle 
                      cx="96" cy="96" r="88" 
                      stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={552.9}
                      initial={{ strokeDashoffset: 552.9 }}
                      animate={{ strokeDashoffset: 552.9 - (552.9 * progress / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-teal-500" 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-gray-900">{progress}%</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Overall</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Intelligence Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <Target size={14} className="text-teal-500" /> Key Metrics
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: TrendingUp, value: `${progress}%`, label: 'Progress', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Landmark, value: `${loanScore}%`, label: 'Readiness', color: 'text-teal-500', bg: 'bg-teal-50' },
              { icon: Zap, value: `${streak}`, label: 'Day Streak', color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: Trophy, value: levelInfo ? `Lvl ${levelInfo.level}` : '–', label: levelInfo?.name || 'Level', color: 'text-yellow-500', bg: 'bg-yellow-50' },
            ].map((stat, idx) => (
              <GlassCard key={idx} className="p-6 group">
                <div className="flex flex-col gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900">{stat.value}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Personalized Actions */}
        {suggestions.length > 0 && (
           <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
              <Sparkles size={14} className="text-teal-500" /> AI Insights For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((s, idx) => (
                <Link key={idx} to={s.path}>
                  <GlassCard className="p-6 group relative overflow-hidden h-full">
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500", 
                      s.color === 'blue' ? 'from-blue-500' : 'from-teal-500')} />
                    
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="text-3xl filter saturate-[1.5] group-hover:scale-110 transition-transform duration-500">{s.icon}</div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-black text-gray-900 text-sm group-hover:text-teal-500 transition-colors uppercase tracking-tight">{s.title}</h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{s.desc}</p>
                      </div>
                      <ArrowRight size={14} className="text-gray-400 group-hover:text-teal-500 transition-all transform group-hover:translate-x-1" />
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Capabilities Explorer */}
        <section className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">OS Capabilities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {navCards.map((card, idx) => (
              <Link key={idx} to={card.path} className="group">
                <GlassCard className="p-8 h-full relative overflow-hidden border-gray-100 hover:border-teal-300">
                  <div className="relative z-10 space-y-4">
                    <div className="text-4xl filter group-hover:drop-shadow-[0_0_15px_rgba(20,184,166,0.3)] duration-500 transition-all">{card.emoji}</div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-teal-500 transition-colors leading-tight">{card.title}</h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{card.description}</p>
                    </div>
                    <div className="pt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      Explore Module <ArrowRight size={10} />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Engagement Footers */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
          <StreakCounter streak={streak} />
          <DailyTip />
        </section>

        {showNudge && (
          <SmartNudge
            message="System Alert: Your document pipeline is currently idle. Several critical nodes require your intervention."
            cta="Resolve Progress"
            ctaPath="/progress"
            onDismiss={() => setShowNudge(false)}
          />
        )}
      </div>
    </PageTransition>
  );
}
