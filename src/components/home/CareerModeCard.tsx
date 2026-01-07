import { motion } from 'framer-motion';
import { getCareerStats, type CareerStats } from '../../services/career';
import { useEffect, useState } from 'react';

interface CareerModeCardProps {
  onClick: () => void;
  disabled?: boolean;
}

export function CareerModeCard({ onClick, disabled }: CareerModeCardProps) {
  const [stats, setStats] = useState<CareerStats | null>(null);

  useEffect(() => {
    setStats(getCareerStats());
  }, []);

  const isNewPlayer = !stats || stats.totalMissionsCompleted === 0;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full overflow-hidden rounded-3xl p-6
        bg-gradient-to-br from-amber-500 via-orange-500 to-red-500
        shadow-2xl shadow-orange-500/25
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-orange-500/40'}
      `}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Animated background shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 1.5,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-4xl"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              {isNewPlayer ? '🚀' : '🎮'}
            </motion.div>
            <div className="text-left">
              <h2 className="text-xl font-black text-white drop-shadow-lg">
                {isNewPlayer ? 'START YOUR JOURNEY' : 'CAREER MODE'}
              </h2>
              <p className="text-white/80 text-sm font-medium">
                {isNewPlayer
                  ? 'Learn to trade with real market data'
                  : `Chapter ${stats?.currentChapter}: ${stats?.currentChapterTitle}`}
              </p>
            </div>
          </div>

          {/* Chapter badge */}
          {!isNewPlayer && stats && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-bold">
                {stats.totalMissionsCompleted}/{stats.totalMissions}
              </span>
            </div>
          )}
        </div>

        {/* Progress section */}
        {!isNewPlayer && stats && (
          <div className="mb-4">
            {/* Progress bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionPercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <p className="text-white/70 text-xs">
              {stats.completionPercent}% Complete • Next: {stats.currentMissionTitle}
            </p>
          </div>
        )}

        {/* New player pitch */}
        {isNewPlayer && (
          <div className="mb-4 text-left">
            <div className="flex flex-wrap gap-2">
              {['Real Data', '15 Missions', 'Famous Events'].map((tag) => (
                <span
                  key={tag}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl py-3 px-4">
          <span className="text-white font-bold text-lg">
            {isNewPlayer ? 'BEGIN CAREER' : 'CONTINUE'}
          </span>
          <motion.span
            animate={{
              x: [0, 5, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            ▶️
          </motion.span>
        </div>
      </div>

      {/* Pulsing border */}
      <motion.div
        className="absolute inset-0 rounded-3xl border-2 border-white/30"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </motion.button>
  );
}

// Compact version for smaller displays
export function CareerModeCardCompact({ onClick, disabled }: CareerModeCardProps) {
  const [stats, setStats] = useState<CareerStats | null>(null);

  useEffect(() => {
    setStats(getCareerStats());
  }, []);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-2xl p-4
        bg-gradient-to-br from-amber-500 to-orange-600
        transition-all duration-300
        ${disabled ? 'opacity-50' : ''}
      `}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <div className="relative z-10 flex items-center gap-3">
        <span className="text-3xl">🎮</span>
        <div className="text-left flex-1">
          <h3 className="font-bold text-white">Career Mode</h3>
          {stats && (
            <p className="text-white/70 text-xs">
              {stats.completionPercent}% • {stats.currentMissionTitle}
            </p>
          )}
        </div>
        <span className="text-white/80">▶</span>
      </div>
    </motion.button>
  );
}
