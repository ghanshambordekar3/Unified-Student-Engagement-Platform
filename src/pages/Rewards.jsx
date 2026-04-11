import { useEffect, useState } from 'react';
import { Trophy, Star, Zap } from 'lucide-react';
import { getAllBadgesWithStatus, getRewardsState, getLevelInfo, syncStreakBadges } from '../utils/rewards';
import { getStreak } from '../utils/streaks';
import ProgressBar from '../components/ProgressBar';
import { trackPageView } from '../utils/personalization';

const categoryColors = {
  Engagement: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  Exploration: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  Finance: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
  Application: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  Progress: 'bg-green-500/10 border-green-500/20 text-green-400',
  Social: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
};

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
    setLevelInfo(getLevelInfo(state.xp));
  }, []);

  if (!rewardsState || !levelInfo) return null;

  const categories = ['All', ...new Set(badges.map((b) => b.category))];
  const filteredBadges = activeCategory === 'All' ? badges : badges.filter((b) => b.category === activeCategory);
  const earnedCount = badges.filter((b) => b.earned).length;
  const nextLevelXP = levelInfo.next?.maxXP === 99999 ? 'MAX' : levelInfo.next?.maxXP;
  const xpToNext = typeof nextLevelXP === 'number' ? nextLevelXP - rewardsState.xp : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Trophy className="text-yellow-400" size={26} />
          Rewards & Achievements
        </h1>
        <p className="text-muted text-sm mt-1">Earn XP, unlock badges, and level up your study abroad journey</p>
      </div>

      {/* Level Card */}
      <div className="card bg-gradient-to-br from-yellow-500/20 via-surface-card to-primary/20 border-yellow-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-6 flex-wrap">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-orange-500/30 flex-shrink-0">
            🏅
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted mb-1">Current Level</p>
            <h2 className="text-2xl font-black text-white mb-1">
              Level {levelInfo.level} — <span className={levelInfo.color}>{levelInfo.name}</span>
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold">
                ⚡ {rewardsState.xp} XP
              </span>
              {xpToNext > 0 && (
                <span className="text-xs text-muted">{xpToNext} XP to Level {levelInfo.level + 1}</span>
              )}
            </div>
            <div className="mt-3 max-w-xs">
              <ProgressBar
                percentage={levelInfo.progress}
                color="from-yellow-500 to-orange-400"
                showLabel={false}
                height="h-2.5"
              />
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-3xl font-black text-white">{earnedCount}</p>
            <p className="text-sm text-muted">Badges Earned</p>
            <p className="text-xs text-muted">of {badges.length}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total XP', value: rewardsState.xp, icon: '⚡', color: 'text-yellow-400' },
          { label: 'Badges', value: `${earnedCount}/${badges.length}`, icon: '🏅', color: 'text-blue-400' },
          { label: 'Chatbot Queries', value: rewardsState.stats.chatbot_queries, icon: '🤖', color: 'text-purple-400' },
          { label: 'Login Streak', value: `${getStreak()} days`, icon: '🔥', color: 'text-orange-400' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* How to Earn */}
      <div className="card border-l-4 border-l-primary">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Zap size={16} className="text-yellow-400" /> How to Earn XP</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            ['Use Career Chatbot', '+75 XP', '🤖'],
            ['Calculate ROI', '+100 XP', '📈'],
            ['Generate SOP', '+200 XP', '✍️'],
            ['Complete Loan Application', '+300 XP', '🏦'],
            ['Check Admission Predictor', '+100 XP', '🎯'],
            ['7-Day Streak', '+250 XP', '🔥'],
            ['Complete Checklist 100%', '+500 XP', '🏆'],
            ['Share Referral Link', '+150 XP', '🤝'],
          ].map(([action, xp, icon]) => (
            <div key={action} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface">
              <span className="text-sm text-white flex items-center gap-2"><span>{icon}</span> {action}</span>
              <span className="text-xs font-bold text-yellow-400">{xp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-bold text-white">All Badges</h2>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat ? 'bg-primary text-white' : 'bg-surface border border-surface-border text-muted hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`card text-center relative transition-all duration-200 ${
                badge.earned
                  ? 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50'
                  : 'opacity-50 grayscale'
              }`}
            >
              {badge.earned && (
                <div className="absolute top-2 right-2">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                </div>
              )}
              <div className="text-4xl mb-2">{badge.icon}</div>
              <h3 className="text-xs font-bold text-white mb-1">{badge.name}</h3>
              <p className="text-xs text-muted mb-2 leading-tight">{badge.description}</p>
              <span className={`badge border text-xs ${
                badge.earned ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 'bg-surface border-surface-border text-muted'
              }`}>
                +{badge.xp} XP
              </span>
              {badge.earned && (
                <p className="text-xs text-green-400 mt-2 font-semibold">✓ Earned!</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
