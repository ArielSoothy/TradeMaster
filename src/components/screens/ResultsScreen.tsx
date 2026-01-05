import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { calculateSessionResult, getGradeColor, getLevelProgress, getLevelConfig } from '../../services/scoring';
import { formatCurrency, formatPercent } from '../../utils/format';

interface ResultsScreenProps {
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export function ResultsScreen({ onPlayAgain, onBackToHome }: ResultsScreenProps) {
  const { state } = useGame();

  const result = useMemo(() => calculateSessionResult(state), [state]);
  const levelProgress = useMemo(() => getLevelProgress(state.xp), [state.xp]);
  const levelConfig = useMemo(() => getLevelConfig(result.newLevel), [result.newLevel]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {result.totalPnL >= 0 ? '🏆' : '📉'}
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Session Complete</h1>
          <p className="text-gray-400">{result.symbol}</p>
        </div>

        {/* Grade */}
        <motion.div
          className="glass-card p-6 mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm text-gray-400 mb-2">Your Grade</div>
          <div
            className="text-8xl font-black"
            style={{ color: getGradeColor(result.grade) }}
          >
            {result.grade}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-card p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${result.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(result.totalPnL, true)}
            </div>
            <div className={`text-sm ${result.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(result.pnlPercent, true)}
            </div>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Win Rate</div>
            <div className="text-2xl font-bold">
              {(result.winRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">
              {result.totalTrades} trades
            </div>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Max Streak</div>
            <div className="text-2xl font-bold text-orange-400">
              🔥 {result.maxStreak}
            </div>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-400">
              {result.maxDrawdown.toFixed(1)}%
            </div>
          </div>
        </motion.div>

        {/* XP & Level */}
        <motion.div
          className="glass-card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400">Level {result.newLevel}</div>
              <div className="text-xl font-bold">{levelConfig.title}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">XP Earned</div>
              <div className="text-xl font-bold text-indigo-400">+{result.xpEarned}</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.progress * 100}%` }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{levelProgress.currentLevelXP.toFixed(0)} XP</span>
            <span>{levelProgress.nextLevelXP.toFixed(0)} XP</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={onPlayAgain}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500
                       text-white font-bold text-lg shadow-lg shadow-indigo-500/30
                       hover:shadow-indigo-500/50 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Play Again
          </motion.button>

          <motion.button
            onClick={onBackToHome}
            className="flex-1 py-4 rounded-xl bg-white/10 text-white font-bold text-lg
                       hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Choose Stock
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
