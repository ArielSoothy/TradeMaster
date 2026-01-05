import type { CompletedTrade, LevelConfig, SessionResult, GameState } from '../types/game';

// Level configurations
export const LEVELS: LevelConfig[] = [
  { level: 1, xpRequired: 0, title: 'Rookie Trader' },
  { level: 2, xpRequired: 500, title: 'Apprentice' },
  { level: 3, xpRequired: 1500, title: 'Day Trader' },
  { level: 4, xpRequired: 3500, title: 'Swing Trader' },
  { level: 5, xpRequired: 7000, title: 'Pro Trader' },
  { level: 6, xpRequired: 12000, title: 'Market Maker' },
  { level: 7, xpRequired: 20000, title: 'Hedge Fund' },
  { level: 8, xpRequired: 35000, title: 'Wall Street Legend' },
  { level: 9, xpRequired: 55000, title: 'Market Wizard' },
  { level: 10, xpRequired: 80000, title: 'Trading God' },
];

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
  const progress = currentLevel >= 10 ? 1 : currentLevelXP / nextLevelXP;

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
