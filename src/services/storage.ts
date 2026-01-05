/**
 * Local storage persistence service for TradeMaster.
 * Saves player progress, achievements, stats, and preferences.
 */

const STORAGE_KEY = 'trademaster_save';
const VERSION = 1;

/**
 * Player's saved progress and stats.
 */
export interface SavedProgress {
  version: number;

  // Lifetime stats
  totalProfit: number;
  totalTrades: number;
  totalSessions: number;
  totalWins: number;
  totalLosses: number;
  bestSessionPnL: number;
  worstSessionPnL: number;
  bestStreak: number;
  longestSession: number; // Trades in single session

  // Progression
  level: number;
  xp: number;

  // Achievements
  achievements: string[];
  achievementProgress: Record<string, number>;

  // Daily tracking
  dailyStreak: number;
  lastPlayDate: string; // YYYY-MM-DD format
  dailyChallengeId: string | null;
  dailyChallengeProgress: number;

  // Session history (last 10)
  recentSessions: SessionRecord[];

  // Preferences
  soundEnabled: boolean;
  hapticEnabled: boolean;
  volume: number;

  // First-time flags
  hasCompletedTutorial: boolean;
  tutorialStep: number;
}

/**
 * Record of a completed trading session.
 */
export interface SessionRecord {
  date: string;
  symbol: string;
  pnl: number;
  trades: number;
  winRate: number;
  maxStreak: number;
  grade: string;
  xpEarned: number;
  duration: number; // seconds
}

/**
 * Default values for new players.
 */
const DEFAULT_SAVE: SavedProgress = {
  version: VERSION,

  // Lifetime stats
  totalProfit: 0,
  totalTrades: 0,
  totalSessions: 0,
  totalWins: 0,
  totalLosses: 0,
  bestSessionPnL: 0,
  worstSessionPnL: 0,
  bestStreak: 0,
  longestSession: 0,

  // Progression
  level: 1,
  xp: 0,

  // Achievements
  achievements: [],
  achievementProgress: {},

  // Daily tracking
  dailyStreak: 0,
  lastPlayDate: '',
  dailyChallengeId: null,
  dailyChallengeProgress: 0,

  // Session history
  recentSessions: [],

  // Preferences
  soundEnabled: true,
  hapticEnabled: true,
  volume: 0.7,

  // First-time flags
  hasCompletedTutorial: false,
  tutorialStep: 0,
};

/**
 * Load saved progress from localStorage.
 */
export function loadProgress(): SavedProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...DEFAULT_SAVE };

    const parsed = JSON.parse(saved) as SavedProgress;

    // Handle version migrations
    if (parsed.version < VERSION) {
      return migrateProgress(parsed);
    }

    // Merge with defaults to handle any missing fields
    return { ...DEFAULT_SAVE, ...parsed };
  } catch (error) {
    console.error('Failed to load progress:', error);
    return { ...DEFAULT_SAVE };
  }
}

/**
 * Save progress to localStorage.
 */
export function saveProgress(progress: SavedProgress): void {
  try {
    progress.version = VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

/**
 * Update specific fields in saved progress.
 */
export function updateProgress(updates: Partial<SavedProgress>): SavedProgress {
  const current = loadProgress();
  const updated = { ...current, ...updates };
  saveProgress(updated);
  return updated;
}

/**
 * Migrate older save formats to current version.
 */
function migrateProgress(old: SavedProgress): SavedProgress {
  // Add migration logic here when version changes
  return { ...DEFAULT_SAVE, ...old, version: VERSION };
}

/**
 * Check and update daily streak.
 * Call this when the app loads to track daily play streak.
 */
export function checkDailyStreak(): { streak: number; isNewDay: boolean } {
  const progress = loadProgress();
  const today = new Date().toISOString().split('T')[0];
  const lastPlay = progress.lastPlayDate;

  if (lastPlay === today) {
    // Already played today
    return { streak: progress.dailyStreak, isNewDay: false };
  }

  // Check if it's consecutive day
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;
  if (lastPlay === yesterdayStr) {
    // Consecutive day! Increase streak
    newStreak = progress.dailyStreak + 1;
  } else if (lastPlay === '') {
    // First time playing
    newStreak = 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  updateProgress({
    dailyStreak: newStreak,
    lastPlayDate: today,
  });

  return { streak: newStreak, isNewDay: true };
}

/**
 * Record a completed trading session.
 */
export function recordSession(session: Omit<SessionRecord, 'date'>): void {
  const progress = loadProgress();
  const today = new Date().toISOString().split('T')[0];

  const record: SessionRecord = {
    ...session,
    date: today,
  };

  // Add to recent sessions (keep last 10)
  const recentSessions = [record, ...progress.recentSessions].slice(0, 10);

  // Update lifetime stats
  const updates: Partial<SavedProgress> = {
    recentSessions,
    totalSessions: progress.totalSessions + 1,
    totalProfit: progress.totalProfit + session.pnl,
    totalTrades: progress.totalTrades + session.trades,
    totalWins: progress.totalWins + Math.round(session.trades * (session.winRate / 100)),
    totalLosses: progress.totalLosses + Math.round(session.trades * (1 - session.winRate / 100)),
  };

  // Update best/worst
  if (session.pnl > progress.bestSessionPnL) {
    updates.bestSessionPnL = session.pnl;
  }
  if (session.pnl < progress.worstSessionPnL) {
    updates.worstSessionPnL = session.pnl;
  }
  if (session.maxStreak > progress.bestStreak) {
    updates.bestStreak = session.maxStreak;
  }
  if (session.trades > progress.longestSession) {
    updates.longestSession = session.trades;
  }

  updateProgress(updates);
}

/**
 * Unlock an achievement.
 * Returns true if it was newly unlocked, false if already had it.
 */
export function unlockAchievement(achievementId: string): boolean {
  const progress = loadProgress();

  if (progress.achievements.includes(achievementId)) {
    return false; // Already unlocked
  }

  updateProgress({
    achievements: [...progress.achievements, achievementId],
  });

  return true;
}

/**
 * Update progress toward an achievement.
 */
export function updateAchievementProgress(achievementId: string, value: number): void {
  const progress = loadProgress();
  updateProgress({
    achievementProgress: {
      ...progress.achievementProgress,
      [achievementId]: value,
    },
  });
}

/**
 * Add XP and handle level ups.
 * Returns new level if leveled up, null otherwise.
 */
export function addXP(amount: number): { newXP: number; newLevel: number; didLevelUp: boolean } {
  const progress = loadProgress();
  let xp = progress.xp + amount;
  let level = progress.level;
  let didLevelUp = false;

  // XP required per level (increases each level)
  const xpForLevel = (lvl: number) => Math.floor(1000 * Math.pow(1.2, lvl - 1));

  // Check for level ups
  while (xp >= xpForLevel(level) && level < 100) {
    xp -= xpForLevel(level);
    level++;
    didLevelUp = true;
  }

  updateProgress({ xp, level });

  return { newXP: xp, newLevel: level, didLevelUp };
}

/**
 * Get XP required for current level.
 */
export function getXPForCurrentLevel(): { current: number; required: number; percent: number } {
  const progress = loadProgress();
  const required = Math.floor(1000 * Math.pow(1.2, progress.level - 1));
  const percent = Math.min(100, (progress.xp / required) * 100);

  return { current: progress.xp, required, percent };
}

/**
 * Save user preferences.
 */
export function savePreferences(prefs: {
  soundEnabled?: boolean;
  hapticEnabled?: boolean;
  volume?: number;
}): void {
  updateProgress(prefs);
}

/**
 * Get user preferences.
 */
export function getPreferences(): {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  volume: number;
} {
  const progress = loadProgress();
  return {
    soundEnabled: progress.soundEnabled,
    hapticEnabled: progress.hapticEnabled,
    volume: progress.volume,
  };
}

/**
 * Mark tutorial as completed.
 */
export function completeTutorial(): void {
  updateProgress({
    hasCompletedTutorial: true,
    tutorialStep: -1,
  });
}

/**
 * Update tutorial progress.
 */
export function setTutorialStep(step: number): void {
  updateProgress({ tutorialStep: step });
}

/**
 * Check if this is the player's first session ever.
 */
export function isFirstSession(): boolean {
  const progress = loadProgress();
  return progress.totalSessions === 0;
}

/**
 * Reset all progress (for testing/debugging).
 */
export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export progress for sharing/backup.
 */
export function exportProgress(): string {
  const progress = loadProgress();
  return btoa(JSON.stringify(progress));
}

/**
 * Import progress from backup.
 */
export function importProgress(data: string): boolean {
  try {
    const progress = JSON.parse(atob(data)) as SavedProgress;
    if (typeof progress.version !== 'number') {
      return false;
    }
    saveProgress(progress);
    return true;
  } catch {
    return false;
  }
}
