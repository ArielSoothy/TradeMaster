import { motion } from 'framer-motion';

interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  title: string;
  onClick?: () => void;
}

export function LevelProgressBar({
  level,
  currentXP,
  requiredXP,
  title,
  onClick,
}: LevelProgressBarProps) {
  const progress = Math.min(currentXP / requiredXP, 1);
  const isMaxLevel = level >= 100;

  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
      whileTap={{ scale: 0.98 }}
    >
      {/* Level badge */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-lg">
          {level}
        </div>
        {/* Glow effect for high levels */}
        {level >= 50 && (
          <motion.div
            className="absolute -inset-1 rounded-full bg-purple-500/30 blur-sm -z-10"
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}
      </div>

      {/* Progress info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-white truncate">
            {title}
          </span>
          <span className="text-xs text-gray-400">
            {isMaxLevel ? (
              'MAX'
            ) : (
              <>
                {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
              </>
            )}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: isMaxLevel ? '100%' : `${progress * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* Shine effect */}
          {!isMaxLevel && (
            <motion.div
              className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '500%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          )}
        </div>
      </div>

      {/* Arrow indicator */}
      <span className="text-gray-500 text-sm">→</span>
    </motion.button>
  );
}

// Compact inline version
export function LevelBadge({
  level,
  onClick,
}: {
  level: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="font-bold text-sm">Lv.{level}</span>
    </motion.button>
  );
}
