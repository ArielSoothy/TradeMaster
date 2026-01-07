import type { CandleData } from '../types/game';
import type { UTCTimestamp } from 'lightweight-charts';

// Tutorial step definitions
export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  action?: 'buy' | 'sell' | 'wait' | 'close';
  highlightElement?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'center';
  delay?: number; // ms before showing
  autoAdvance?: boolean; // Auto-advance after action is taken
}

// Pre-baked candle data for tutorial (designed for easy first win)
// This simulates a gentle uptrend for the first tutorial
function generateTutorialCandles(): CandleData[] {
  const baseTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

  // Designed uptrend: starts at $100, dips to $99.50, then rises to $102.50
  const priceSequence = [
    // Initial dip to create buying opportunity
    { o: 100.00, h: 100.20, l: 99.80, c: 99.90 },
    { o: 99.90, h: 100.00, l: 99.50, c: 99.60 }, // Dip - good buy point
    { o: 99.60, h: 99.80, l: 99.50, c: 99.70 },
    // Recovery begins
    { o: 99.70, h: 100.10, l: 99.65, c: 100.00 },
    { o: 100.00, h: 100.30, l: 99.90, c: 100.20 },
    { o: 100.20, h: 100.50, l: 100.10, c: 100.40 },
    // Strong uptrend - hold for profits
    { o: 100.40, h: 100.80, l: 100.35, c: 100.70 },
    { o: 100.70, h: 101.00, l: 100.60, c: 100.90 },
    { o: 100.90, h: 101.30, l: 100.85, c: 101.20 },
    { o: 101.20, h: 101.60, l: 101.10, c: 101.50 },
    // Peak and slight pullback - good sell point
    { o: 101.50, h: 102.00, l: 101.40, c: 101.90 },
    { o: 101.90, h: 102.30, l: 101.80, c: 102.20 },
    { o: 102.20, h: 102.50, l: 102.10, c: 102.40 }, // Peak
    { o: 102.40, h: 102.45, l: 102.00, c: 102.10 }, // Start of pullback
    { o: 102.10, h: 102.20, l: 101.80, c: 101.90 },
    // Continue for some time after
    { o: 101.90, h: 102.00, l: 101.70, c: 101.80 },
    { o: 101.80, h: 101.90, l: 101.60, c: 101.70 },
    { o: 101.70, h: 101.80, l: 101.50, c: 101.60 },
    { o: 101.60, h: 101.70, l: 101.40, c: 101.50 },
    { o: 101.50, h: 101.60, l: 101.30, c: 101.40 },
  ];

  return priceSequence.map((p, i) => ({
    time: (baseTime + i * 60) as UTCTimestamp,
    open: p.o,
    high: p.h,
    low: p.l,
    close: p.c,
    volume: Math.floor(10000 + Math.random() * 5000),
  }));
}

// Tutorial steps for first-time users
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to TradeMaster!',
    message: 'Learn to trade with real market data. Let\'s make your first trade!',
    position: 'center',
    delay: 500,
  },
  {
    id: 'buy-prompt',
    title: 'Time to Buy!',
    message: 'The price dipped - a perfect buying opportunity. Tap the BUY button!',
    action: 'buy',
    highlightElement: '[data-tutorial="buy-button"]',
    position: 'bottom',
    autoAdvance: true,
  },
  {
    id: 'watching',
    title: 'Great!',
    message: 'You\'re now in a LONG position. Watch the price go up...',
    action: 'wait',
    position: 'top',
    delay: 3000, // Wait 3 seconds to show price appreciation
  },
  {
    id: 'sell-prompt',
    title: 'Lock in Your Profits!',
    message: 'You\'re up! Tap SELL to close your position and secure the profit.',
    action: 'sell',
    highlightElement: '[data-tutorial="sell-button"]',
    position: 'bottom',
    autoAdvance: true,
  },
  {
    id: 'success',
    title: 'Congratulations!',
    message: 'You just completed your first trade based on REAL market patterns! Ready to learn more?',
    position: 'center',
  },
];

// Tutorial configuration
export const TUTORIAL_CONFIG = {
  // Symbol shown during tutorial
  symbol: 'TUTORIAL',
  displaySymbol: 'Practice Stock',

  // Starting balance for tutorial
  startingBalance: 10000,

  // Starting candle index (after the dip for easy buy opportunity)
  startIndex: 2,

  // Auto-play speed during tutorial (slower for learning)
  speed: 1,

  // Candle data
  candles: generateTutorialCandles(),

  // Steps
  steps: TUTORIAL_STEPS,

  // Skip button delay (ms) - show skip after this time
  skipButtonDelay: 2000,
};

// Check if user has completed tutorial
const TUTORIAL_COMPLETED_KEY = 'trademaster_tutorial_completed';

export function isTutorialCompleted(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markTutorialCompleted(): void {
  try {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
  } catch {
    console.error('Failed to save tutorial completion');
  }
}

export function resetTutorial(): void {
  try {
    localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
  } catch {
    console.error('Failed to reset tutorial');
  }
}

// Get current tutorial step based on game state
export function getTutorialStepForGameState(
  currentStep: number,
  hasPosition: boolean,
  pnl: number
): TutorialStep | null {
  if (currentStep >= TUTORIAL_STEPS.length) return null;

  const step = TUTORIAL_STEPS[currentStep];

  // Auto-advance logic
  if (step.action === 'buy' && hasPosition) {
    return TUTORIAL_STEPS[currentStep + 1] || null;
  }

  if (step.action === 'sell' && !hasPosition && pnl > 0) {
    return TUTORIAL_STEPS[currentStep + 1] || null;
  }

  return step;
}
