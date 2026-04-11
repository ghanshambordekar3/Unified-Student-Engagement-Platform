import storage from './storage';
import badgesData from '../data/badges.json';
import checklistData from '../data/checklist.json';
import { getProgressPercentage } from './scoring';

const REWARDS_KEY = 'edupath_rewards';

// Get all rewards state
export function getRewardsState() {
  return storage.get(REWARDS_KEY, {
    xp: 0,
    earnedBadgeIds: [],
    stats: {
      login_count: 0,
      chatbot_queries: 0,
      roi_calculated: 0,
      loan_checked: 0,
      sop_generated: 0,
      predictor_used: 0,
      timeline_viewed: 0,
      referrals: 0,
      loan_applied: 0,
    },
  });
}

// Save rewards state
function saveRewardsState(state) {
  storage.set(REWARDS_KEY, state);
}

// Track an event and award XP/badges
export function trackEvent(eventName, delta = 1) {
  const state = getRewardsState();
  const completedIds = storage.get('edupath_checklist_completed', []);
  const checklistPct = getProgressPercentage(completedIds, checklistData.length);

  // Update stat
  if (state.stats[eventName] !== undefined) {
    state.stats[eventName] += delta;
  }

  // Evaluate badges
  const newBadges = [];
  const statsWithChecklist = { ...state.stats, checklist_pct: checklistPct };

  badgesData.forEach((badge) => {
    if (state.earnedBadgeIds.includes(badge.id)) return;

    const conditionMet = evalCondition(badge.condition, statsWithChecklist);
    if (conditionMet) {
      state.earnedBadgeIds.push(badge.id);
      state.xp += badge.xp;
      newBadges.push(badge);
    }
  });

  saveRewardsState(state);
  return { newBadges, xp: state.xp };
}

// Simple condition evaluator for badge conditions like "streak >= 3"
function evalCondition(condition, stats) {
  try {
    const [stat, op, value] = condition.split(' ');
    const statVal = stats[stat] ?? 0;
    const numVal = parseFloat(value);
    if (op === '>=') return statVal >= numVal;
    if (op === '>') return statVal > numVal;
    if (op === '===') return statVal === numVal;
    if (op === '<=') return statVal <= numVal;
    return false;
  } catch {
    return false;
  }
}

// Get XP level info
export function getLevelInfo(xp) {
  const levels = [
    { level: 1, name: 'Explorer', minXP: 0, maxXP: 200, color: 'text-slate-400' },
    { level: 2, name: 'Aspirant', minXP: 200, maxXP: 500, color: 'text-blue-400' },
    { level: 3, name: 'Applicant', minXP: 500, maxXP: 1000, color: 'text-teal-400' },
    { level: 4, name: 'Scholar', minXP: 1000, maxXP: 2000, color: 'text-purple-400' },
    { level: 5, name: 'Champion', minXP: 2000, maxXP: 99999, color: 'text-yellow-400' },
  ];

  const current = levels.findLast((l) => xp >= l.minXP) || levels[0];
  const next = levels[Math.min(current.level, levels.length - 1)];
  const progress = next
    ? Math.round(((xp - current.minXP) / (next.maxXP - current.minXP)) * 100)
    : 100;

  return { ...current, next, progress, xp };
}

// Get earned badges
export function getEarnedBadges() {
  const state = getRewardsState();
  return badgesData.filter((b) => state.earnedBadgeIds.includes(b.id));
}

// Get all badges with earned status
export function getAllBadgesWithStatus() {
  const state = getRewardsState();
  return badgesData.map((b) => ({
    ...b,
    earned: state.earnedBadgeIds.includes(b.id),
  }));
}

// Check and award streak-based badges
export function syncStreakBadges(streak) {
  const state = getRewardsState();
  state.stats.streak = streak;
  storage.set(REWARDS_KEY, state);
  trackEvent('login_count');
}
