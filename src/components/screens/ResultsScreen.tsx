import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { calculateSessionResult, getGradeColor, getLevelConfig } from '../../services/scoring';
import { formatCurrency, formatPercent } from '../../utils/format';
import { CountUpNumber } from '../ui/AnimatedNumber';
import { ConfettiBurst } from '../effects/ParticleSystem';
import { useSound } from '../../hooks/useSound';
import { type AchievementUnlock, getRarityColor, getRarityLabel } from '../../services/achievements';
import { loadProgress, getXPForCurrentLevel } from '../../services/storage';
import { ShareCard } from '../social/ShareCard';

interface ResultsScreenProps {
  onPlayAgain: () => void;
  onBackToHome: () => void;
  newAchievements?: AchievementUnlock[];
}

export function ResultsScreen({
  onPlayAgain,
  onBackToHome,
  newAchievements = [],
}: ResultsScreenProps) {
  const { state } = useGame();
  const { playSound } = useSound();
  const { profile } = useAuth();

  const result = useMemo(() => calculateSessionResult(state), [state]);
  const levelConfig = useMemo(() => getLevelConfig(result.newLevel), [result.newLevel]);

  // Calculate beat market delta
  const beatMarketDelta = useMemo(() => {
    if (state.allCandleData.length === 0) return 0;
    const startPrice = state.allCandleData[0]?.close || state.basePrice;
    const endPrice = state.allCandleData[state.currentCandleIndex]?.close || startPrice;
    const baseline = ((endPrice - startPrice) / startPrice) * 100;
    return result.pnlPercent - baseline;
  }, [state, result.pnlPercent]);

  // Confetti trigger
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  // Trigger celebration for good results
  useEffect(() => {
    if (result.totalPnL > 0 || result.grade === 'S' || result.grade === 'A') {
      setShowConfetti(true);
      playSound('sessionEnd');
    }

    // Show achievement modal if there are new achievements
    if (newAchievements.length > 0) {
      setTimeout(() => {
        setShowAchievementModal(true);
        playSound('achievement');
      }, 1500);
    }
  }, [result, newAchievements, playSound]);

  // Get saved stats for comparison
  const savedProgress = loadProgress();
  const xpInfo = getXPForCurrentLevel();

  // Share functionality
  const handleShare = async () => {
    // Get date info for mystery mode reveal
    let dateInfo = '';
    if (state.allCandleData.length > 0) {
      const firstCandle = state.allCandleData[0];
      const lastCandle = state.allCandleData[state.allCandleData.length - 1];
      const startDate = new Date(firstCandle.time * 1000);
      const endDate = new Date(lastCandle.time * 1000);
      const formatDate = (d: Date) => d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      dateInfo = `${formatDate(startDate)} — ${formatDate(endDate)}`;
    }

    const mysteryReveal = state.mysteryMode
      ? `🎭 Mystery Revealed: ${state.symbol}\n📅 ${dateInfo}\n\n`
      : '';

    const shareText = `🎮 TradeMaster Results!\n\n` +
      `📊 ${state.mysteryMode ? 'MYSTERY MODE' : state.symbol}\n` +
      mysteryReveal +
      `💰 P&L: ${formatCurrency(result.totalPnL, true)}\n` +
      `🎯 Win Rate: ${(result.winRate * 100).toFixed(0)}%\n` +
      `🔥 Max Streak: ${result.maxStreak}\n` +
      `📈 Grade: ${result.grade}\n\n` +
      `Can you beat my score? 🚀`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TradeMaster Results',
          text: shareText,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Confetti for good results */}
      <ConfettiBurst trigger={showConfetti} count={50} />

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
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {result.grade === 'S' ? '👑' :
             result.grade === 'A' ? '🏆' :
             result.totalPnL >= 0 ? '📈' : '📉'}
          </motion.div>
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {result.grade === 'S' ? 'LEGENDARY!' :
             result.grade === 'A' ? 'Excellent!' :
             result.totalPnL >= 0 ? 'Session Complete' : 'Better Luck Next Time'}
          </motion.h1>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {state.mysteryMode ? '🎲 MYSTERY MODE' : result.symbol}
          </motion.p>
        </div>

        {/* Mystery Stock Reveal */}
        {state.mysteryMode && (
          <motion.div
            className="glass-card p-5 mb-6 text-center border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <motion.div
              className="text-sm text-purple-400 mb-2 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              🎭 MYSTERY REVEALED
            </motion.div>
            <motion.div
              className="text-3xl font-black text-white mb-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
            >
              {state.symbol}
            </motion.div>
            <motion.div
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              {(() => {
                // Get date range from candle data
                if (state.allCandleData.length > 0) {
                  const firstCandle = state.allCandleData[0];
                  const lastCandle = state.allCandleData[state.allCandleData.length - 1];
                  const startDate = new Date(firstCandle.time * 1000);
                  const endDate = new Date(lastCandle.time * 1000);
                  const formatDate = (d: Date) => d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  return `${formatDate(startDate)} — ${formatDate(endDate)}`;
                }
                return '';
              })()}
            </motion.div>
          </motion.div>
        )}

        {/* Grade */}
        <motion.div
          className="glass-card p-6 mb-6 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Glow effect for S grade */}
          {result.grade === 'S' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-orange-500/20"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <div className="text-sm text-gray-400 mb-2 relative z-10">Your Grade</div>
          <motion.div
            className="text-8xl font-black relative z-10"
            style={{ color: getGradeColor(result.grade) }}
            animate={result.grade === 'S' ? {
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 20px rgba(251, 191, 36, 0.5)',
                '0 0 40px rgba(251, 191, 36, 0.8)',
                '0 0 20px rgba(251, 191, 36, 0.5)',
              ],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {result.grade}
          </motion.div>
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
              <CountUpNumber
                value={result.totalPnL}
                currency
                duration={1.5}
                delay={0.5}
                decimals={2}
              />
            </div>
            <div className={`text-sm ${result.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(result.pnlPercent, true)}
            </div>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Win Rate</div>
            <div className="text-2xl font-bold">
              <CountUpNumber
                value={result.winRate * 100}
                duration={1.2}
                delay={0.6}
                decimals={0}
              />%
            </div>
            <div className="text-sm text-gray-400">
              {result.totalTrades} trades
            </div>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Max Streak</div>
            <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🔥
              </motion.span>
              <CountUpNumber value={result.maxStreak} duration={1} delay={0.7} />
            </div>
            {result.maxStreak > savedProgress.bestStreak && (
              <div className="text-xs text-yellow-400">NEW BEST!</div>
            )}
          </div>

          <div className="glass-card p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-400">
              <CountUpNumber value={result.maxDrawdown} duration={1} delay={0.8} decimals={1} />%
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
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                           flex items-center justify-center font-bold text-lg shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {savedProgress.level}
              </motion.div>
              <div>
                <div className="text-sm text-gray-400">Level {savedProgress.level}</div>
                <div className="text-lg font-bold">{levelConfig.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">XP Earned</div>
              <motion.div
                className="text-xl font-bold text-indigo-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
              >
                +<CountUpNumber value={result.xpEarned} duration={1.5} delay={1} />
              </motion.div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.percent}%` }}
              transition={{ delay: 1.2, duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{xpInfo.current} XP</span>
            <span>{xpInfo.required} XP</span>
          </div>
        </motion.div>

        {/* New Achievements */}
        {newAchievements.length > 0 && (
          <motion.div
            className="glass-card p-4 mb-6 border border-yellow-500/30"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="text-center mb-3">
              <span className="text-sm text-yellow-400 font-semibold">
                🎉 {newAchievements.length} New Achievement{newAchievements.length > 1 ? 's' : ''}!
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {newAchievements.slice(0, 3).map((unlock) => (
                <motion.div
                  key={unlock.achievement.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.7 }}
                  style={{
                    borderLeft: `3px solid ${getRarityColor(unlock.achievement.rarity)}`,
                  }}
                >
                  <span className="text-2xl">{unlock.achievement.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{unlock.achievement.name}</div>
                    <div className="text-xs text-gray-400">
                      {getRarityLabel(unlock.achievement.rarity)} • +{unlock.achievement.xpReward} XP
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {newAchievements.length > 3 && (
              <div className="text-center mt-2 text-xs text-gray-400">
                +{newAchievements.length - 3} more achievements
              </div>
            )}
          </motion.div>
        )}

        {/* Lifetime Stats (collapsed) */}
        <motion.div
          className="text-center text-sm text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Lifetime: {savedProgress.totalSessions} sessions • ${savedProgress.totalProfit.toFixed(0)} profit
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex gap-4">
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
          </div>

          {/* Share Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold
                         hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>📤</span>
              Share Text
            </motion.button>
            <motion.button
              onClick={() => setShowShareCard(true)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#1DA1F2] to-[#0077B5]
                         text-white font-semibold shadow-lg
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>🖼️</span>
              Share Image
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Share Card Modal */}
      <AnimatePresence>
        {showShareCard && (
          <ShareCard
            data={{
              username: profile?.username || 'Trader',
              symbol: state.mysteryMode ? 'MYSTERY' : state.symbol,
              pnlPercent: result.pnlPercent,
              pnlAmount: result.totalPnL,
              beatMarketDelta: beatMarketDelta,
              grade: result.grade,
              streak: result.maxStreak,
            }}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>

      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchievementModal && newAchievements.length > 0 && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAchievementModal(false)}
          >
            <motion.div
              className="glass-card p-6 max-w-sm w-full text-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                🏅
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">Achievement Unlocked!</h2>

              {newAchievements.map((unlock, i) => (
                <motion.div
                  key={unlock.achievement.id}
                  className="p-4 rounded-lg bg-white/5 mb-3 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  style={{
                    borderLeft: `4px solid ${getRarityColor(unlock.achievement.rarity)}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{unlock.achievement.icon}</span>
                    <div>
                      <div className="font-bold">{unlock.achievement.name}</div>
                      <div className="text-sm text-gray-400">{unlock.achievement.description}</div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: getRarityColor(unlock.achievement.rarity) }}
                      >
                        {getRarityLabel(unlock.achievement.rarity)} • +{unlock.achievement.xpReward} XP
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.button
                onClick={() => setShowAchievementModal(false)}
                className="mt-4 px-6 py-2 rounded-lg bg-indigo-500 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
