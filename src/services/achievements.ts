import { loadProgress, unlockAchievement, updateAchievementProgress } from './storage';

/**
 * Achievement categories for organization.
 */
export type AchievementCategory =
  | 'first_steps'   // Getting started
  | 'trader'        // Trading milestones
  | 'streak'        // Win streak achievements
  | 'profit'        // Profit milestones
  | 'skill'         // Skill-based achievements
  | 'dedication'    // Play time and consistency
  | 'risk'          // Risk-related achievements
  | 'special';      // Hidden/special achievements

/**
 * Achievement rarity levels.
 */
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Achievement definition.
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xpReward: number;
  requirement: number; // For progress-based achievements
  hidden?: boolean; // Don't show until unlocked
}

/**
 * Achievement unlock result.
 */
export interface AchievementUnlock {
  achievement: Achievement;
  isNew: boolean;
}

/**
 * All achievements in the game (50+).
 */
export const ACHIEVEMENTS: Achievement[] = [
  // ==================== FIRST STEPS ====================
  {
    id: 'first_trade',
    name: 'First Steps',
    description: 'Execute your first trade',
    category: 'first_steps',
    rarity: 'common',
    icon: '👶',
    xpReward: 50,
    requirement: 1,
  },
  {
    id: 'first_profit',
    name: 'In the Green',
    description: 'Close your first profitable trade',
    category: 'first_steps',
    rarity: 'common',
    icon: '💚',
    xpReward: 75,
    requirement: 1,
  },
  {
    id: 'first_session',
    name: 'Session Complete',
    description: 'Complete your first trading session',
    category: 'first_steps',
    rarity: 'common',
    icon: '✅',
    xpReward: 100,
    requirement: 1,
  },
  {
    id: 'leverage_user',
    name: 'Leverage Curious',
    description: 'Use 2x leverage or higher',
    category: 'first_steps',
    rarity: 'common',
    icon: '📈',
    xpReward: 50,
    requirement: 1,
  },
  {
    id: 'short_seller',
    name: 'Short Seller',
    description: 'Open your first short position',
    category: 'first_steps',
    rarity: 'common',
    icon: '📉',
    xpReward: 75,
    requirement: 1,
  },

  // ==================== TRADER MILESTONES ====================
  {
    id: 'trades_10',
    name: 'Getting Started',
    description: 'Complete 10 trades',
    category: 'trader',
    rarity: 'common',
    icon: '🔟',
    xpReward: 100,
    requirement: 10,
  },
  {
    id: 'trades_50',
    name: 'Active Trader',
    description: 'Complete 50 trades',
    category: 'trader',
    rarity: 'uncommon',
    icon: '📊',
    xpReward: 250,
    requirement: 50,
  },
  {
    id: 'trades_100',
    name: 'Experienced',
    description: 'Complete 100 trades',
    category: 'trader',
    rarity: 'rare',
    icon: '💼',
    xpReward: 500,
    requirement: 100,
  },
  {
    id: 'trades_500',
    name: 'Veteran Trader',
    description: 'Complete 500 trades',
    category: 'trader',
    rarity: 'epic',
    icon: '🎖️',
    xpReward: 1000,
    requirement: 500,
  },
  {
    id: 'trades_1000',
    name: 'Trading Legend',
    description: 'Complete 1,000 trades',
    category: 'trader',
    rarity: 'legendary',
    icon: '👑',
    xpReward: 2500,
    requirement: 1000,
  },
  {
    id: 'sessions_5',
    name: 'Regular',
    description: 'Complete 5 trading sessions',
    category: 'trader',
    rarity: 'common',
    icon: '📅',
    xpReward: 150,
    requirement: 5,
  },
  {
    id: 'sessions_25',
    name: 'Dedicated',
    description: 'Complete 25 trading sessions',
    category: 'trader',
    rarity: 'uncommon',
    icon: '🗓️',
    xpReward: 400,
    requirement: 25,
  },
  {
    id: 'sessions_100',
    name: 'Trading Addict',
    description: 'Complete 100 trading sessions',
    category: 'trader',
    rarity: 'rare',
    icon: '📆',
    xpReward: 1000,
    requirement: 100,
  },

  // ==================== STREAK ACHIEVEMENTS ====================
  {
    id: 'streak_2',
    name: 'Double Tap',
    description: 'Win 2 trades in a row',
    category: 'streak',
    rarity: 'common',
    icon: '✌️',
    xpReward: 50,
    requirement: 2,
  },
  {
    id: 'streak_3',
    name: 'Hat Trick',
    description: 'Win 3 trades in a row',
    category: 'streak',
    rarity: 'common',
    icon: '🎩',
    xpReward: 100,
    requirement: 3,
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    description: 'Win 5 trades in a row',
    category: 'streak',
    rarity: 'uncommon',
    icon: '🔥',
    xpReward: 250,
    requirement: 5,
  },
  {
    id: 'streak_7',
    name: 'Hot Streak',
    description: 'Win 7 trades in a row',
    category: 'streak',
    rarity: 'rare',
    icon: '🌟',
    xpReward: 500,
    requirement: 7,
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Win 10 trades in a row',
    category: 'streak',
    rarity: 'epic',
    icon: '💫',
    xpReward: 1000,
    requirement: 10,
  },
  {
    id: 'streak_15',
    name: 'Dominating',
    description: 'Win 15 trades in a row',
    category: 'streak',
    rarity: 'epic',
    icon: '⚡',
    xpReward: 1500,
    requirement: 15,
  },
  {
    id: 'streak_20',
    name: 'Legendary Streak',
    description: 'Win 20 trades in a row',
    category: 'streak',
    rarity: 'legendary',
    icon: '🏆',
    xpReward: 3000,
    requirement: 20,
  },

  // ==================== PROFIT MILESTONES ====================
  {
    id: 'profit_100',
    name: 'First Hundred',
    description: 'Make $100 profit in a single session',
    category: 'profit',
    rarity: 'common',
    icon: '💵',
    xpReward: 100,
    requirement: 100,
  },
  {
    id: 'profit_500',
    name: 'Five Hundred Club',
    description: 'Make $500 profit in a single session',
    category: 'profit',
    rarity: 'uncommon',
    icon: '💰',
    xpReward: 300,
    requirement: 500,
  },
  {
    id: 'profit_1000',
    name: 'Thousand Dollar Day',
    description: 'Make $1,000 profit in a single session',
    category: 'profit',
    rarity: 'rare',
    icon: '🤑',
    xpReward: 750,
    requirement: 1000,
  },
  {
    id: 'profit_5000',
    name: 'Big Earner',
    description: 'Make $5,000 profit in a single session',
    category: 'profit',
    rarity: 'epic',
    icon: '💎',
    xpReward: 2000,
    requirement: 5000,
  },
  {
    id: 'profit_10000',
    name: 'Whale',
    description: 'Make $10,000 profit in a single session',
    category: 'profit',
    rarity: 'legendary',
    icon: '🐋',
    xpReward: 5000,
    requirement: 10000,
  },
  {
    id: 'total_profit_1000',
    name: 'Paper Trader',
    description: 'Earn $1,000 total profit',
    category: 'profit',
    rarity: 'common',
    icon: '📝',
    xpReward: 200,
    requirement: 1000,
  },
  {
    id: 'total_profit_10000',
    name: 'Retail Investor',
    description: 'Earn $10,000 total profit',
    category: 'profit',
    rarity: 'uncommon',
    icon: '🛒',
    xpReward: 500,
    requirement: 10000,
  },
  {
    id: 'total_profit_50000',
    name: 'Day Trader',
    description: 'Earn $50,000 total profit',
    category: 'profit',
    rarity: 'rare',
    icon: '📈',
    xpReward: 1500,
    requirement: 50000,
  },
  {
    id: 'total_profit_100000',
    name: 'Hedge Fund Manager',
    description: 'Earn $100,000 total profit',
    category: 'profit',
    rarity: 'epic',
    icon: '🏦',
    xpReward: 3000,
    requirement: 100000,
  },
  {
    id: 'total_profit_1000000',
    name: 'Warren Buffet',
    description: 'Earn $1,000,000 total profit',
    category: 'profit',
    rarity: 'legendary',
    icon: '🎰',
    xpReward: 10000,
    requirement: 1000000,
  },

  // ==================== SKILL ACHIEVEMENTS ====================
  {
    id: 'no_loss_session',
    name: 'Perfect Session',
    description: 'Complete a session without any losses',
    category: 'skill',
    rarity: 'rare',
    icon: '✨',
    xpReward: 1000,
    requirement: 1,
  },
  {
    id: 'win_rate_90',
    name: 'Sharpshooter',
    description: 'Achieve 90%+ win rate in a session (5+ trades)',
    category: 'skill',
    rarity: 'epic',
    icon: '🎯',
    xpReward: 1500,
    requirement: 90,
  },
  {
    id: 'comeback_50',
    name: 'Comeback Kid',
    description: 'Recover from -50% to finish positive',
    category: 'skill',
    rarity: 'rare',
    icon: '🔄',
    xpReward: 1000,
    requirement: 1,
  },
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    description: 'Hold a position for 30+ candles',
    category: 'skill',
    rarity: 'uncommon',
    icon: '💎',
    xpReward: 300,
    requirement: 30,
  },
  {
    id: 'quick_draw',
    name: 'Quick Draw',
    description: 'Close a profitable trade in under 3 candles',
    category: 'skill',
    rarity: 'uncommon',
    icon: '⚡',
    xpReward: 200,
    requirement: 3,
  },
  {
    id: 'scalper',
    name: 'Scalper',
    description: 'Complete 10 trades in one session',
    category: 'skill',
    rarity: 'uncommon',
    icon: '🔪',
    xpReward: 300,
    requirement: 10,
  },
  {
    id: 'mega_scalper',
    name: 'Mega Scalper',
    description: 'Complete 25 trades in one session',
    category: 'skill',
    rarity: 'rare',
    icon: '⚔️',
    xpReward: 750,
    requirement: 25,
  },
  {
    id: 'leverage_master',
    name: 'Leverage Master',
    description: 'Profit $500+ with 10x leverage',
    category: 'skill',
    rarity: 'epic',
    icon: '🚀',
    xpReward: 1000,
    requirement: 500,
  },

  // ==================== DEDICATION ====================
  {
    id: 'daily_streak_3',
    name: 'Three Day Streak',
    description: 'Play 3 days in a row',
    category: 'dedication',
    rarity: 'common',
    icon: '📅',
    xpReward: 150,
    requirement: 3,
  },
  {
    id: 'daily_streak_7',
    name: 'Week Warrior',
    description: 'Play 7 days in a row',
    category: 'dedication',
    rarity: 'uncommon',
    icon: '🗓️',
    xpReward: 500,
    requirement: 7,
  },
  {
    id: 'daily_streak_30',
    name: 'Monthly Master',
    description: 'Play 30 days in a row',
    category: 'dedication',
    rarity: 'epic',
    icon: '📆',
    xpReward: 2000,
    requirement: 30,
  },
  {
    id: 'daily_streak_100',
    name: 'Century Club',
    description: 'Play 100 days in a row',
    category: 'dedication',
    rarity: 'legendary',
    icon: '💯',
    xpReward: 10000,
    requirement: 100,
  },

  // ==================== RISK ====================
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Recover from -30% drawdown',
    category: 'risk',
    rarity: 'uncommon',
    icon: '🛡️',
    xpReward: 300,
    requirement: 30,
  },
  {
    id: 'risk_taker',
    name: 'Risk Taker',
    description: 'Use 10x leverage on a trade',
    category: 'risk',
    rarity: 'uncommon',
    icon: '🎲',
    xpReward: 200,
    requirement: 1,
  },
  {
    id: 'low_risk',
    name: 'Conservative',
    description: 'Complete a session with max 10% drawdown',
    category: 'risk',
    rarity: 'uncommon',
    icon: '🏛️',
    xpReward: 400,
    requirement: 10,
  },

  // ==================== SPECIAL/HIDDEN ====================
  {
    id: 'mystery_master',
    name: 'Mystery Master',
    description: 'Profit $1,000+ in Mystery Mode',
    category: 'special',
    rarity: 'epic',
    icon: '🎲',
    xpReward: 1500,
    requirement: 1000,
    hidden: true,
  },
  {
    id: 'single_trade_500',
    name: 'Home Run',
    description: 'Make $500+ on a single trade',
    category: 'special',
    rarity: 'rare',
    icon: '⚾',
    xpReward: 750,
    requirement: 500,
  },
  {
    id: 'single_trade_1000',
    name: 'Grand Slam',
    description: 'Make $1,000+ on a single trade',
    category: 'special',
    rarity: 'epic',
    icon: '🎆',
    xpReward: 2000,
    requirement: 1000,
  },
  {
    id: 'meme_trader',
    name: 'Meme Trader',
    description: 'Trade 5 different meme stocks',
    category: 'special',
    rarity: 'uncommon',
    icon: '🐸',
    xpReward: 300,
    requirement: 5,
    hidden: true,
  },
  {
    id: 'crypto_explorer',
    name: 'Crypto Explorer',
    description: 'Trade 5 different crypto assets',
    category: 'special',
    rarity: 'uncommon',
    icon: '🪙',
    xpReward: 300,
    requirement: 5,
    hidden: true,
  },
];

/**
 * Get achievement by ID.
 */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get all achievements in a category.
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Get all unlocked achievements.
 */
export function getUnlockedAchievements(): Achievement[] {
  const progress = loadProgress();
  return ACHIEVEMENTS.filter((a) => progress.achievements.includes(a.id));
}

/**
 * Get all locked achievements (excluding hidden ones).
 */
export function getLockedAchievements(): Achievement[] {
  const progress = loadProgress();
  return ACHIEVEMENTS.filter(
    (a) => !progress.achievements.includes(a.id) && !a.hidden
  );
}

/**
 * Check if an achievement is unlocked.
 */
export function isAchievementUnlocked(id: string): boolean {
  const progress = loadProgress();
  return progress.achievements.includes(id);
}

/**
 * Get progress toward an achievement.
 */
export function getAchievementProgressValue(id: string): number {
  const progress = loadProgress();
  return progress.achievementProgress[id] ?? 0;
}

/**
 * Check and unlock achievements based on game state.
 * Returns array of newly unlocked achievements.
 */
export function checkAchievements(gameState: {
  totalTrades?: number;
  totalSessions?: number;
  sessionTrades?: number;
  sessionPnL?: number;
  currentStreak?: number;
  maxStreak?: number;
  winRate?: number;
  maxDrawdown?: number;
  totalProfit?: number;
  dailyStreak?: number;
  leverage?: number;
  positionDuration?: number;
  tradePnL?: number;
  isShort?: boolean;
  isMysteryMode?: boolean;
}): AchievementUnlock[] {
  const unlocked: AchievementUnlock[] = [];

  // Helper to check and unlock
  const check = (id: string, condition: boolean) => {
    if (condition) {
      const isNew = unlockAchievement(id);
      const achievement = getAchievement(id);
      if (achievement) {
        unlocked.push({ achievement, isNew });
      }
    }
  };

  // === FIRST STEPS ===
  check('first_trade', (gameState.totalTrades ?? 0) >= 1);
  check('first_profit', (gameState.sessionPnL ?? 0) > 0);
  check('first_session', (gameState.totalSessions ?? 0) >= 1);
  check('leverage_user', (gameState.leverage ?? 1) >= 2);
  check('short_seller', gameState.isShort === true);

  // === TRADER MILESTONES ===
  const totalTrades = gameState.totalTrades ?? 0;
  check('trades_10', totalTrades >= 10);
  check('trades_50', totalTrades >= 50);
  check('trades_100', totalTrades >= 100);
  check('trades_500', totalTrades >= 500);
  check('trades_1000', totalTrades >= 1000);

  const totalSessions = gameState.totalSessions ?? 0;
  check('sessions_5', totalSessions >= 5);
  check('sessions_25', totalSessions >= 25);
  check('sessions_100', totalSessions >= 100);

  // === STREAK ===
  const maxStreak = gameState.maxStreak ?? 0;
  check('streak_2', maxStreak >= 2);
  check('streak_3', maxStreak >= 3);
  check('streak_5', maxStreak >= 5);
  check('streak_7', maxStreak >= 7);
  check('streak_10', maxStreak >= 10);
  check('streak_15', maxStreak >= 15);
  check('streak_20', maxStreak >= 20);

  // === PROFIT ===
  const sessionPnL = gameState.sessionPnL ?? 0;
  check('profit_100', sessionPnL >= 100);
  check('profit_500', sessionPnL >= 500);
  check('profit_1000', sessionPnL >= 1000);
  check('profit_5000', sessionPnL >= 5000);
  check('profit_10000', sessionPnL >= 10000);

  const totalProfit = gameState.totalProfit ?? 0;
  check('total_profit_1000', totalProfit >= 1000);
  check('total_profit_10000', totalProfit >= 10000);
  check('total_profit_50000', totalProfit >= 50000);
  check('total_profit_100000', totalProfit >= 100000);
  check('total_profit_1000000', totalProfit >= 1000000);

  // === SKILL ===
  const sessionTrades = gameState.sessionTrades ?? 0;
  const winRate = gameState.winRate ?? 0;
  check('no_loss_session', sessionTrades >= 3 && winRate === 100);
  check('win_rate_90', sessionTrades >= 5 && winRate >= 90);
  check('scalper', sessionTrades >= 10);
  check('mega_scalper', sessionTrades >= 25);

  const positionDuration = gameState.positionDuration ?? 0;
  check('diamond_hands', positionDuration >= 30);
  check('quick_draw', positionDuration <= 3 && (gameState.tradePnL ?? 0) > 0);

  const leverage = gameState.leverage ?? 1;
  check('leverage_master', leverage === 10 && (gameState.tradePnL ?? 0) >= 500);
  check('risk_taker', leverage === 10);

  // === DEDICATION ===
  const dailyStreak = gameState.dailyStreak ?? 0;
  check('daily_streak_3', dailyStreak >= 3);
  check('daily_streak_7', dailyStreak >= 7);
  check('daily_streak_30', dailyStreak >= 30);
  check('daily_streak_100', dailyStreak >= 100);

  // === RISK ===
  const maxDrawdown = gameState.maxDrawdown ?? 0;
  check('survivor', maxDrawdown >= 30 && sessionPnL > 0);
  check('comeback_50', maxDrawdown >= 50 && sessionPnL > 0);
  check('low_risk', sessionTrades >= 5 && maxDrawdown <= 10 && sessionPnL > 0);

  // === SPECIAL ===
  const tradePnL = gameState.tradePnL ?? 0;
  check('single_trade_500', tradePnL >= 500);
  check('single_trade_1000', tradePnL >= 1000);
  check('mystery_master', gameState.isMysteryMode === true && sessionPnL >= 1000);

  // Update progress for non-binary achievements
  updateAchievementProgress('trades_10', totalTrades);
  updateAchievementProgress('trades_50', totalTrades);
  updateAchievementProgress('trades_100', totalTrades);

  return unlocked.filter((u) => u.isNew);
}

/**
 * Get rarity color for display.
 */
export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return '#9ca3af'; // Gray
    case 'uncommon':
      return '#22c55e'; // Green
    case 'rare':
      return '#3b82f6'; // Blue
    case 'epic':
      return '#a855f7'; // Purple
    case 'legendary':
      return '#f59e0b'; // Gold
    default:
      return '#9ca3af';
  }
}

/**
 * Get rarity label for display.
 */
export function getRarityLabel(rarity: AchievementRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/**
 * Calculate total achievements completion percentage.
 */
export function getCompletionPercentage(): number {
  const progress = loadProgress();
  const total = ACHIEVEMENTS.filter((a) => !a.hidden).length;
  const unlocked = progress.achievements.length;
  return Math.round((unlocked / total) * 100);
}

/**
 * Get total XP from achievements.
 */
export function getTotalAchievementXP(): number {
  const progress = loadProgress();
  return ACHIEVEMENTS
    .filter((a) => progress.achievements.includes(a.id))
    .reduce((sum, a) => sum + a.xpReward, 0);
}
