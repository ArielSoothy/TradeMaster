import type { UTCTimestamp } from 'lightweight-charts';

// Candlestick data for charts
export interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Trading position
export interface Position {
  type: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  leverage: number;
  entryIndex: number;
  entryTime: UTCTimestamp;
}

// Completed trade record
export interface CompletedTrade {
  id: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  entryTime: UTCTimestamp;
  exitTime: UTCTimestamp;
}

// Leverage options
export type LeverageOption = 1 | 2 | 4 | 10;

// Playback speed options
export type SpeedOption = 1 | 2 | 4;

// Game state
export interface GameState {
  // Stock data
  symbol: string;
  allCandleData: CandleData[];
  currentCandleIndex: number;

  // Mystery mode - hides stock identity
  mysteryMode: boolean;
  basePrice: number; // Starting price for % calculation

  // Trading
  balance: number;
  startingBalance: number;
  position: Position | null;
  trades: CompletedTrade[];
  openPnL: number;

  // Game controls
  isPlaying: boolean;
  speed: SpeedOption;
  leverage: LeverageOption;
  gameStatus: 'idle' | 'playing' | 'paused' | 'ended';

  // Stats
  totalPnL: number;
  winCount: number;
  lossCount: number;
  currentStreak: number;
  maxStreak: number;
  maxDrawdown: number;
  peakBalance: number;

  // Scoring
  level: number;
  xp: number;
  sessionXP: number;
}

// Game actions
export type GameAction =
  | { type: 'LOAD_DATA'; payload: { symbol: string; data: CandleData[]; mysteryMode?: boolean } }
  | { type: 'START_GAME'; payload?: { startIndex?: number } }
  | { type: 'TICK' }
  | { type: 'BUY' }
  | { type: 'SELL' }
  | { type: 'CLOSE_POSITION' }
  | { type: 'SELL_HALF' }
  | { type: 'SET_LEVERAGE'; payload: LeverageOption }
  | { type: 'SET_SPEED'; payload: SpeedOption }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'END_GAME' }
  | { type: 'RESET' };

// Session result
export interface SessionResult {
  symbol: string;
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  pnlPercent: number;
  maxStreak: number;
  maxDrawdown: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  xpEarned: number;
  newLevel: number;
  levelTitle: string;
}

// Level unlock types
export interface LevelUnlock {
  type: 'leverage' | 'feature' | 'category';
  id: string;
  name: string;
  description?: string;
}

// Level configuration
export interface LevelConfig {
  level: number;
  xpRequired: number;
  title: string;
  unlocks?: LevelUnlock[];
}

// Stock option for search
export interface StockOption {
  symbol: string;
  name: string;
  exchange?: string;
}

// Yahoo Finance API response types
export interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        currency: string;
        regularMarketPrice: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
          volume: (number | null)[];
        }>;
      };
    }>;
    error: null | { code: string; description: string };
  };
}
