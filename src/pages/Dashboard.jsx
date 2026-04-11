import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, DollarSign, TrendingUp, Calendar, CheckSquare, ArrowRight, Landmark, FileText, Trophy, Newspaper } from 'lucide-react';
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

const navCards = [
  { path: '/explore', title: 'Career Chatbot', description: 'AI-powered study abroad advisor', icon: Compass, emoji: '🤖', gradient: 'from-blue-600 to-indigo-700' },
  { path: '/finance', title: 'ROI & Finance', description: 'ROI calculator & loan eligibility', icon: DollarSign, emoji: '💰', gradient: 'from-teal-600 to-teal-800' },
  { path: '/loans', title: 'Loan Hub', description: 'Personalized loan offers & apply', icon: Landmark, emoji: '🏦', gradient: 'from-orange-600 to-orange-800' },
  { path: '/sop', title: 'SOP Generator', description: 'AI-written Statement of Purpose', icon: FileText, emoji: '✍️', gradient: 'from-yellow-600 to-amber-700' },
  { path: '/predictor', title: 'Admission Score', description: 'Know your admission probability', icon: TrendingUp, emoji: '📊', gradient: 'from-purple-600 to-purple-800' },
  { path: '/timeline', title: 'Timeline', description: 'Your application road map', icon: Calendar, emoji: '📅', gradient: 'from-pink-600 to-rose-800' },
  { path: '/progress', title: 'Progress', description: 'Document checklist tracker', icon: CheckSquare, emoji: '✅', gradient: 'from-green-600 to-green-800' },
  { path: '/rewards', title: 'Rewards', description: 'XP points, badges & levels', icon: Trophy, emoji: '🏆', gradient: 'from-yellow-500 to-orange-600' },
  { path: '/content', title: 'AI Insights', description: 'Guides, articles & newsletters', icon: Newspaper, emoji: '📰', gradient: 'from-pink-500 to-pink-700' },
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
    setLevelInfo(getLevelInfo(state.xp));

    if (isInactive(2)) {
      setTimeout(() => setShowNudge(true), 4000);
    }
  }, []);

  const firstName = profile.name ? profile.name.split(' ')[0] : 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden card bg-gradient-to-br from-primary/30 via-surface-card to-teal/20 border-primary/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-muted text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl font-black text-white mb-2">
            {firstName}! <span className="text-gradient">Ready to shine?</span>
          </h1>
          <p className="text-muted text-sm max-w-md mb-4">
            Targeting <span className="text-white font-medium">{profile.targetCourse || 'a great course'}</span> in{' '}
            <span className="text-white font-medium">{profile.preferredCountries?.join(', ') || 'amazing countries'}</span>.
          </p>
          <ProgressBar percentage={progress} label="Overall Application Progress" />
          {levelInfo && (
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="badge bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                ⚡ {levelInfo.xp} XP • Level {levelInfo.level} {levelInfo.name}
              </span>
              <span className="text-xs text-muted">{progress}% complete • {loanScore}% loan ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '📈', value: `${progress}%`, label: 'App. Progress', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: '🏦', value: `${loanScore}%`, label: 'Loan Readiness', color: 'text-teal-400', bg: 'bg-teal/10' },
          { icon: streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '📅', value: `${streak}`, label: 'Day Streak', color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: '🏅', value: levelInfo ? `Lvl ${levelInfo.level}` : '–', label: levelInfo?.name || 'Level', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map(({ icon, value, label, color, bg }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center text-xl flex-shrink-0`}>{icon}</div>
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Personalized Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">🎯 Personalized For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {suggestions.map((s) => (
              <Link key={s.id} to={s.path} className={`card-hover border-l-4 ${s.color} group`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">{s.title}</h3>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                  <ArrowRight size={14} className="ml-auto text-muted group-hover:text-white transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">All Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {navCards.map(({ path, title, description, gradient, emoji }) => (
            <Link key={path} to={path} id={`nav-card-${title.toLowerCase().replace(/\s/g,'-')}`}
              className="card-hover group relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative">
                <div className="text-2xl mb-2">{emoji}</div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mb-1">{title}</h3>
                <p className="text-xs text-muted">{description}</p>
                <div className="mt-3 flex items-center gap-1 text-primary text-xs font-medium group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Streak + Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StreakCounter streak={streak} />
        <DailyTip />
      </div>

      {showNudge && (
        <SmartNudge
          message="You haven't checked your progress in a while. Several documents may still be pending!"
          cta="View Progress"
          ctaPath="/progress"
          onDismiss={() => setShowNudge(false)}
        />
      )}
    </div>
  );
}
