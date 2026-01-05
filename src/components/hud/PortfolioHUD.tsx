import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatPercent } from '../../utils/format';

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
  winCount: number;
  lossCount: number;
}

export function PortfolioHUD({
  balance,
  startingBalance,
  openPnL,
  position,
  streak,
  winCount,
  lossCount,
}: PortfolioHUDProps) {
  const totalPnL = balance - startingBalance + openPnL;
  const totalPnLPercent = (totalPnL / startingBalance) * 100;
  const effectiveBalance = balance + openPnL;
  const totalTrades = winCount + lossCount;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Balance */}
      <div>
        <div className="text-sm text-gray-400 mb-1">Portfolio Value</div>
        <motion.div
          key={effectiveBalance}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-3xl font-bold ${
            effectiveBalance >= startingBalance ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {formatCurrency(effectiveBalance)}
        </motion.div>
        <div className={`text-sm ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatCurrency(totalPnL, true)} ({formatPercent(totalPnLPercent, true)})
        </div>
      </div>

      {/* Open Position P&L */}
      <AnimatePresence>
        {position && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3 rounded-lg ${
              openPnL >= 0
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-red-500/20 border border-red-500/30'
            }`}
          >
            <div className="text-sm text-gray-300 mb-1">
              Open {position.type.toUpperCase()} @ {formatCurrency(position.entryPrice)}
            </div>
            <motion.div
              key={openPnL}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className={`text-xl font-bold ${openPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {formatCurrency(openPnL, true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-400">Win Rate</div>
          <div className="text-lg font-semibold">{winRate.toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Trades</div>
          <div className="text-lg font-semibold">
            <span className="text-green-400">{winCount}</span>
            <span className="text-gray-500">/</span>
            <span className="text-red-400">{lossCount}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Streak</div>
          <div className="text-lg font-semibold flex items-center justify-center gap-1">
            {streak > 0 && <span className="text-orange-400">🔥</span>}
            <span className={streak > 0 ? 'text-orange-400' : ''}>{streak}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
