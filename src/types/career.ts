// Career Mode Types

export type GameMode = 'career' | 'arcade' | 'trader';

export type WinConditionType =
  | 'profit_target'      // Make X amount of profit
  | 'profit_percent'     // Make X% return
  | 'survive'            // Don't get liquidated
  | 'win_streak'         // Win X trades in a row
  | 'win_rate'           // Maintain X% win rate
  | 'max_drawdown'       // Don't exceed X% drawdown
  | 'beat_market'        // Outperform buy-and-hold
  | 'trades_count';      // Complete X number of trades

export interface WinCondition {
  type: WinConditionType;
  value: number;
  description: string;
}

export interface MissionReward {
  type: 'xp' | 'unlock_leverage' | 'unlock_category' | 'unlock_feature' | 'title';
  value: number | string;
  label: string;
}

export interface Mission {
  id: string;
  chapter: number;
  order: number;           // Order within chapter
  title: string;
  subtitle: string;        // Short tagline
  description: string;     // Full description
  learningObjective: string;
  historicalContext: string;
  historicalDate: string;  // Display date like "March 16, 2020"
  stockSymbol: string;
  startDate: string;       // YYYY-MM-DD for data fetching
  endDate: string;
  winConditions: WinCondition[];
  rewards: MissionReward[];
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  estimatedTime: string;   // "2-3 min"
  tips?: string[];         // Optional hints
  isBoss?: boolean;
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  missions: Mission[];
  unlockLevel: number;     // Level required to unlock
  theme: {
    gradient: string;      // CSS gradient
    icon: string;          // Emoji
  };
}

export interface MissionProgress {
  missionId: string;
  completed: boolean;
  bestScore?: number;
  bestPnL?: number;
  bestGrade?: string;
  attempts: number;
  completedAt?: string;
}

export interface ChapterProgress {
  chapterId: number;
  missionsCompleted: number;
  totalMissions: number;
  unlocked: boolean;
}

export interface CareerProgress {
  currentChapter: number;
  currentMissionId: string;
  chapters: Record<number, ChapterProgress>;
  missionScores: Record<string, MissionProgress>;
  completedMissions: string[];
  totalMissionsCompleted: number;
  careerStartedAt: string;
  lastPlayedAt: string;
}

// Game mode specific settings
export interface ArcadeModeSettings {
  defaultSpeed: number;        // 2x or 4x
  chartType: 'area';
  showParticles: boolean;
  scoreMultiplier: number;
  forgivingMode: boolean;      // Wider stop-losses, etc.
}

export interface TraderModeSettings {
  defaultSpeed: number;        // 1x
  chartType: 'candlestick';
  showParticles: boolean;
  realisticSpreads: boolean;
  showAdvancedMetrics: boolean; // Sharpe ratio, etc.
}

export interface CareerModeSettings {
  chartType: 'candlestick' | 'area';
  speedLocked: boolean;        // Some missions lock speed
  leverageLocked: boolean;     // Some missions lock leverage
}

// Theme colors for modes
export const MODE_THEMES = {
  arcade: {
    primary: '#10b981',        // Green
    secondary: '#06b6d4',      // Cyan
    gradient: 'from-green-500 via-cyan-500 to-blue-500',
    bgGlow: 'bg-green-500/20',
  },
  trader: {
    primary: '#6366f1',        // Indigo
    secondary: '#8b5cf6',      // Purple
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    bgGlow: 'bg-indigo-500/20',
  },
  career: {
    primary: '#f59e0b',        // Amber
    secondary: '#ef4444',      // Red
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bgGlow: 'bg-amber-500/20',
  },
} as const;
