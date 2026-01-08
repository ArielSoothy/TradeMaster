import { motion } from 'framer-motion';
import type { Mission } from '../../types/career';

interface MissionBriefingScreenProps {
  mission: Mission;
  onStart: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function MissionBriefingScreen({
  mission,
  onStart,
  onBack,
  isLoading = false,
}: MissionBriefingScreenProps) {
  // Difficulty color mapping
  const difficultyColors = {
    easy: 'text-green-400 bg-green-500/20 border-green-500/30',
    medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    hard: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    boss: 'text-red-400 bg-red-500/20 border-red-500/30',
  };

  const difficultyLabels = {
    easy: 'EASY',
    medium: 'MEDIUM',
    hard: 'HARD',
    boss: 'BOSS BATTLE',
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header with back button */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div>
          <span className="text-sm text-gray-500">Chapter {mission.chapter}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {/* Mission Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Boss badge */}
          {mission.isBoss && (
            <motion.div
              className="inline-block px-3 py-1 mb-3 rounded-full bg-red-500/20 border border-red-500/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-red-400 font-bold text-sm">BOSS BATTLE</span>
            </motion.div>
          )}

          <h1 className="text-3xl font-bold text-white mb-2">{mission.title}</h1>
          <p className="text-gray-400 text-lg">{mission.subtitle}</p>
        </motion.div>

        {/* Difficulty and Time */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[mission.difficulty]}`}>
            {difficultyLabels[mission.difficulty]}
          </span>
          <span className="text-gray-500">
            ~{mission.estimatedTime}
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 font-mono">
            {mission.stockSymbol}
          </span>
        </motion.div>

        {/* Historical Context Card */}
        <motion.div
          className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="font-semibold text-white mb-1">{mission.historicalDate}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {mission.historicalContext}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission Description */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white mb-2">Mission Brief</h2>
          <p className="text-gray-400 leading-relaxed">{mission.description}</p>
        </motion.div>

        {/* Learning Objective */}
        <motion.div
          className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">🎯</span>
            <div>
              <h3 className="font-semibold text-amber-400 mb-1">Learning Objective</h3>
              <p className="text-gray-300 text-sm">{mission.learningObjective}</p>
            </div>
          </div>
        </motion.div>

        {/* Win Conditions */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-white mb-3">Win Conditions</h2>
          <div className="space-y-2">
            {mission.winConditions.map((condition, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <span className="text-gray-300">{condition.description}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Rewards */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-lg font-semibold text-white mb-3">Rewards</h2>
          <div className="flex flex-wrap gap-2">
            {mission.rewards.map((reward, index) => (
              <div
                key={index}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
              >
                <span className="text-amber-400 font-medium">{reward.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        {mission.tips && mission.tips.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-white mb-3">Pro Tips</h2>
            <div className="space-y-2">
              {mission.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
                >
                  <span className="text-blue-400">💡</span>
                  <span className="text-gray-300 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent safe-area-pb">
        <motion.button
          onClick={onStart}
          disabled={isLoading}
          className={`
            w-full py-4 rounded-2xl font-bold text-lg
            ${isLoading
              ? 'bg-gray-700 text-gray-400 cursor-wait'
              : mission.isBoss
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
            }
          `}
          whileHover={isLoading ? {} : { scale: 1.02 }}
          whileTap={isLoading ? {} : { scale: 0.98 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading Market Data...
            </div>
          ) : (
            <>
              {mission.isBoss ? '⚔️ Begin Boss Battle' : '▶️ Start Mission'}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
