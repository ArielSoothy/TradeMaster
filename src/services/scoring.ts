import type { CompletedTrade, LevelConfig, LevelUnlock, SessionResult, GameState } from '../types/game';

// Level system constants
const MAX_LEVEL = 100;

// Soft exponential XP formula: starts easy, gets harder but not too steep
// Level 2: 500, Level 10: ~4,000, Level 20: ~13,000, Level 50: ~53,000, Level 100: ~155,000
function generateLevelXP(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(500 * Math.pow(level - 1, 1.5));
}

// Titles grouped by tiers (every 10 levels)
const LEVEL_TITLES = [
  'Rookie Trader',      // 1-9
  'Day Trader',         // 10-19
  'Swing Trader',       // 20-29
  'Pro Trader',         // 30-39
  'Market Maker',       // 40-49
  'Hedge Fund Manager', // 50-59
  'Wall Street Legend', // 60-69
  'Market Wizard',      // 70-79
  'Trading Titan',      // 80-89
  'Trading God',        // 90-99
  'Legendary Trader',   // 100+
];

function getLevelTitle(level: number): string {
  const tierIndex = Math.min(Math.floor(level / 10), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[tierIndex];
}

// Per-level unlocks - features that unlock at specific levels
const LEVEL_UNLOCKS: Record<number, LevelUnlock[]> = {
  1: [{ type: 'leverage', id: '1x', name: '1x Leverage', description: 'Basic trading' }],
  5: [{ type: 'leverage', id: '2x', name: '2x Leverage', description: 'Double your risk/reward' }],
  10: [{ type: 'feature', id: 'mystery', name: 'Mystery Mode', description: 'Trade unknown stocks' }],
  15: [{ type: 'leverage', id: '4x', name: '4x Leverage', description: 'Quadruple exposure' }],
  20: [{ type: 'category', id: 'meme', name: 'Meme Stocks', description: 'High volatility meme plays' }],
  25: [{ type: 'leverage', id: '10x', name: '10x Leverage', description: 'Maximum risk mode' }],
  30: [{ type: 'feature', id: 'leaderboard', name: 'Leaderboard', description: 'Compete globally' }],
  40: [{ type: 'category', id: 'leveraged_etf', name: 'Leveraged ETFs', description: 'TQQQ, SOXL and more' }],
  50: [{ type: 'feature', id: 'daily_challenge', name: 'Daily Challenges', description: 'Special daily missions' }],
};

// Generate all levels dynamically
export const LEVELS: LevelConfig[] = Array.from(
  { length: MAX_LEVEL },
  (_, i) => ({
    level: i + 1,
    xpRequired: generateLevelXP(i + 1),
    title: getLevelTitle(i + 1),
    unlocks: LEVEL_UNLOCKS[i + 1] || [],
  })
);

// Export helper to get unlocks for a level
export function getUnlocksForLevel(level: number): LevelUnlock[] {
  return LEVEL_UNLOCKS[level] || [];
}

// Export helper to get all unlocks up to a level
export function getAllUnlocksUpToLevel(level: number): LevelUnlock[] {
  const allUnlocks: LevelUnlock[] = [];
  for (let l = 1; l <= level; l++) {
    if (LEVEL_UNLOCKS[l]) {
      allUnlocks.push(...LEVEL_UNLOCKS[l]);
    }
  }
  return allUnlocks;
}

// Export helper to check if a feature is unlocked
export function isFeatureUnlocked(level: number, featureId: string): boolean {
  const unlocks = getAllUnlocksUpToLevel(level);
  return unlocks.some(u => u.id === featureId);
}

// Export helper to get available leverage options for a level
export function getAvailableLeverages(level: number): number[] {
  const leverages: number[] = [1]; // 1x always available
  if (level >= 5) leverages.push(2);
  if (level >= 15) leverages.push(4);
  if (level >= 25) leverages.push(10);
  return leverages;
}

// Scoring constants
const SCORING = {
  TRADE_WIN_BASE_XP: 100,
  TRADE_LOSS_XP: 10,
  STREAK_BONUS_MULTIPLIER: 1.5,
  MAX_STREAK_MULTIPLIER: 5,
  PERFECT_TRADE_BONUS: 50, // >5% profit
  PERFECT_TRADE_THRESHOLD: 5, // 5% profit threshold
};

// Grade thresholds
const GRADES = {
  S: { minWinRate: 0.7, minPnL: 50 },
  A: { minWinRate: 0.6, minPnL: 30 },
  B: { minWinRate: 0.5, minPnL: 15 },
  C: { minWinRate: 0.4, minPnL: 0 },
  D: { minWinRate: 0.3, minPnL: -15 },
  F: { minWinRate: 0, minPnL: -100 },
};

/**
 * Calculate XP earned from a single trade
 */
export function calculateTradeXP(
  trade: CompletedTrade,
  currentStreak: number
): number {
  // Loss = small participation XP
  if (trade.pnl <= 0) {
    return SCORING.TRADE_LOSS_XP;
  }

  let xp = SCORING.TRADE_WIN_BASE_XP;

  // Streak multiplier (capped at MAX_STREAK_MULTIPLIER)
  const streakMultiplier = Math.min(
    Math.pow(SCORING.STREAK_BONUS_MULTIPLIER, currentStreak),
    SCORING.MAX_STREAK_MULTIPLIER
  );
  xp *= streakMultiplier;

  // Perfect trade bonus (>5% profit)
  if (trade.pnlPercent > SCORING.PERFECT_TRADE_THRESHOLD) {
    xp += SCORING.PERFECT_TRADE_BONUS;
  }

  // Leverage risk bonus (small bonus for using higher leverage successfully)
  if (trade.leverage > 1) {
    xp *= 1 + (trade.leverage - 1) * 0.1;
  }

  return Math.floor(xp);
}

/**
 * Get level for a given total XP
 */
export function getLevelForXP(totalXP: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

/**
 * Get level config for a level number
 */
export function getLevelConfig(level: number): LevelConfig {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)];
}

/**
 * Calculate XP progress within current level
 */
export function getLevelProgress(totalXP: number): {
  currentLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const currentLevel = getLevelForXP(totalXP);
  const currentLevelConfig = getLevelConfig(currentLevel);
  const nextLevelConfig = getLevelConfig(currentLevel + 1);

  const currentLevelXP = totalXP - currentLevelConfig.xpRequired;
  const nextLevelXP = nextLevelConfig.xpRequired - currentLevelConfig.xpRequired;
  const progress = currentLevel >= MAX_LEVEL ? 1 : currentLevelXP / nextLevelXP;

  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progress,
  };
}

/**
 * Determine grade based on win rate and P&L
 */
export function calculateGrade(
  winRate: number,
  pnlPercent: number
): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  for (const [grade, thresholds] of Object.entries(GRADES) as [keyof typeof GRADES, typeof GRADES['S']][]) {
    if (winRate >= thresholds.minWinRate && pnlPercent >= thresholds.minPnL) {
      return grade;
    }
  }
  return 'F';
}

/**
 * Calculate full session result
 */
export function calculateSessionResult(state: GameState): SessionResult {
  const totalTrades = state.trades.length;
  const winRate = totalTrades > 0 ? state.winCount / totalTrades : 0;
  const pnlPercent = ((state.balance - state.startingBalance) / state.startingBalance) * 100;

  const grade = calculateGrade(winRate, pnlPercent);
  const newLevel = getLevelForXP(state.xp);
  const levelConfig = getLevelConfig(newLevel);

  return {
    symbol: state.symbol,
    totalTrades,
    winRate,
    totalPnL: state.balance - state.startingBalance,
    pnlPercent,
    maxStreak: state.maxStreak,
    maxDrawdown: state.maxDrawdown * 100,
    grade,
    xpEarned: state.sessionXP,
    newLevel,
    levelTitle: levelConfig.title,
  };
}

/**
 * Get grade color for UI
 */
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'S': return '#ffd700'; // Gold
    case 'A': return '#22c55e'; // Green
    case 'B': return '#3b82f6'; // Blue
    case 'C': return '#f59e0b'; // Amber
    case 'D': return '#f97316'; // Orange
    case 'F': return '#ef4444'; // Red
    default: return '#6b7280'; // Gray
  }
}
