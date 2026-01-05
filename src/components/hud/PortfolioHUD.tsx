import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber, AnimatedCurrency } from '../ui/AnimatedNumber';
import { StreakFlame } from '../effects/StreakFlame';
import { formatCurrency } from '../../utils/format';

interface PortfolioHUDProps {
  balance: number;
  startingBalance: number;
  openPnL: number;
  position: {
    type: 'long' | 'short';
    entryPrice: number;
    leverage: number;
  } | null;
  streak: number;
  maxStreak: number;
  winCount: number;
  lossCount: number;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
}

export function PortfolioHUD({
  balance,
  startingBalance,
  openPnL,
  position,
  streak,
  maxStreak,
  winCount,
  lossCount,
  level = 1,
  xp = 0,
  xpToNextLevel = 1000,
}: PortfolioHUDProps) {
  const totalPnL = balance - startingBalance + openPnL;
  const totalPnLPercent = (totalPnL / startingBalance) * 100;
  const effectiveBalance = balance + openPnL;
  const totalTrades = winCount + lossCount;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const xpPercent = (xp / xpToNextLevel) * 100;

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Level Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                       flex items-center justify-center font-bold text-sm shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {level}
          </motion.div>
          <div className="text-xs text-gray-400">
            Level {level}
          </div>
        </div>

        {/* Streak Display (moved to top right) */}
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            className="flex items-center gap-1"
          >
            <StreakFlame streak={streak} variant="badge" />
          </motion.div>
        )}
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>XP</span>
          <span>{xp} / {xpToNextLevel}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Balance */}
      <div>
        <div className="text-sm text-gray-400 mb-1">Portfolio Value</div>
        <div className="flex items-baseline gap-2">
          <AnimatedCurrency
            value={effectiveBalance}
            className={`text-3xl font-bold ${
              effectiveBalance >= startingBalance ? 'text-green-400' : 'text-red-400'
            }`}
            threshold={50}
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <AnimatedNumber
            value={totalPnL}
            currency
            showSign
            colorCode
            decimals={2}
            className="text-sm font-medium"
          />
          <span className="text-gray-600">|</span>
          <AnimatedNumber
            value={totalPnLPercent}
            showSign
            colorCode
            decimals={1}
            className="text-sm"
          />
          <span className={`text-sm ${totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>%</span>
        </div>
      </div>

      {/* Open Position P&L */}
      <AnimatePresence>
        {position && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`p-3 rounded-lg ${
              openPnL >= 0
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-red-500/20 border border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-gray-300">
                {position.type.toUpperCase()}
                <span className="text-gray-500 ml-1">
                  @ {formatCurrency(position.entryPrice)}
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${
                position.type === 'long'
                  ? 'bg-green-500/30 text-green-300'
                  : 'bg-red-500/30 text-red-300'
              }`}>
                {position.leverage}x
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <AnimatedCurrency
                value={openPnL}
                showSign
                className={`text-xl font-bold ${openPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}
                threshold={20}
              />
              <motion.div
                className={`text-sm ${openPnL >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                LIVE
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 text-center pt-2 border-t border-white/10">
        <div>
          <div className="text-xs text-gray-500 mb-1">Win Rate</div>
          <div className="flex items-center justify-center">
            <AnimatedNumber
              value={winRate}
              decimals={0}
              className={`text-lg font-semibold ${
                winRate >= 50 ? 'text-green-400' : winRate > 0 ? 'text-yellow-400' : 'text-gray-400'
              }`}
            />
            <span className={`text-sm ml-0.5 ${
              winRate >= 50 ? 'text-green-400' : winRate > 0 ? 'text-yellow-400' : 'text-gray-400'
            }`}>%</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Trades</div>
          <div className="text-lg font-semibold">
            <span className="text-green-400">{winCount}</span>
            <span className="text-gray-600 mx-1">/</span>
            <span className="text-red-400">{lossCount}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Best</div>
          <div className="flex items-center justify-center gap-1">
            {maxStreak > 0 && (
              <motion.span
                className="text-orange-400 text-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🔥
              </motion.span>
            )}
            <span className={`text-lg font-semibold ${maxStreak > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
              {maxStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Current Streak Indicator (when not at top) */}
      {streak === 0 && maxStreak > 0 && (
        <div className="text-center text-xs text-gray-500 pt-2">
          Build your streak! Best: {maxStreak} 🔥
        </div>
      )}
    </div>
  );
}

/**
 * Compact HUD for mobile view.
 */
export function PortfolioHUDCompact({
  balance,
  startingBalance,
  openPnL,
  streak,
  winCount,
  lossCount,
}: Pick<PortfolioHUDProps, 'balance' | 'startingBalance' | 'openPnL' | 'streak' | 'winCount' | 'lossCount'>) {
  const effectiveBalance = balance + openPnL;
  const totalPnL = balance - startingBalance + openPnL;
  const totalTrades = winCount + lossCount;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

  return (
    <div className="glass-card px-4 py-2 flex items-center justify-between">
      {/* Balance */}
      <div>
        <AnimatedCurrency
          value={effectiveBalance}
          className={`text-xl font-bold ${
            effectiveBalance >= startingBalance ? 'text-green-400' : 'text-red-400'
          }`}
          threshold={50}
        />
        <div className="flex items-center gap-1 text-xs">
          <AnimatedNumber
            value={totalPnL}
            currency
            showSign
            colorCode
            decimals={0}
          />
        </div>
      </div>

      {/* Middle stats */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-xs text-gray-500">W/L</div>
          <div className="text-sm font-medium">
            <span className="text-green-400">{winCount}</span>
            <span className="text-gray-600">/</span>
            <span className="text-red-400">{lossCount}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Rate</div>
          <div className={`text-sm font-medium ${winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
            {winRate.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <StreakFlame streak={streak} variant="inline" />
      )}
    </div>
  );
}
