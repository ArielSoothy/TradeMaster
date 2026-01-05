import type { Position, LeverageOption } from '../types/game';

/**
 * Calculate position size based on balance and leverage
 * Uses 100% of balance with leverage applied
 */
export function calculatePositionSize(
  balance: number,
  price: number,
  leverage: LeverageOption
): number {
  // Notional value = balance * leverage
  // Quantity = notional / price
  return (balance * leverage) / price;
}

/**
 * Calculate P&L for a position at current price
 */
export function calculatePnL(
  position: Position,
  currentPrice: number
): { pnl: number; pnlPercent: number } {
  const priceDiff = position.type === 'long'
    ? currentPrice - position.entryPrice
    : position.entryPrice - currentPrice;

  // Raw P&L = price difference * quantity
  const pnl = priceDiff * position.quantity;

  // P&L percent relative to initial investment (balance before leverage)
  const initialInvestment = (position.quantity * position.entryPrice) / position.leverage;
  const pnlPercent = (pnl / initialInvestment) * 100;

  return { pnl, pnlPercent };
}

/**
 * Calculate drawdown from peak
 */
export function calculateDrawdown(currentBalance: number, peakBalance: number): number {
  if (peakBalance <= 0) return 0;
  return Math.max(0, (peakBalance - currentBalance) / peakBalance);
}

/**
 * Check if position should be liquidated (balance goes negative)
 */
export function isLiquidated(balance: number, openPnL: number): boolean {
  return balance + openPnL <= 0;
}

/**
 * Generate unique trade ID
 */
export function generateTradeId(): string {
  return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get random starting index for game replayability
 */
export function getRandomStartIndex(
  totalCandles: number,
  minPlayableCandles: number = 60
): number {
  const maxStart = Math.max(0, totalCandles - minPlayableCandles);
  return Math.floor(Math.random() * maxStart);
}
