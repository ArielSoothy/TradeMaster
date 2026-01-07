import { motion } from 'framer-motion';

interface DailyChallengeProps {
  title: string;
  description: string;
  progress: number; // 0-1
  current: number;
  target: number;
  streakDays: number;
  reward: string;
  unlocked?: boolean;
  onClick?: () => void;
}

export function DailyChallenge({
  title,
  description,
  progress,
  current,
  target,
  streakDays,
  reward,
  unlocked = true,
  onClick,
}: DailyChallengeProps) {
  if (!unlocked) {
    return (
      <div className="glass-card p-4 opacity-50">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🔒</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-400">Daily Challenges</h3>
            <p className="text-xs text-gray-500">Unlock at Level 50</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className="glass-card p-4 w-full text-left hover:bg-white/10 transition-colors"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Challenge info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔥</span>
            <h3 className="font-bold text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-400 mb-3">{description}</p>

          {/* Progress bar */}
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Shimmer effect on progress bar */}
            {progress > 0 && progress < 1 && (
              <motion.div
                className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              <span className="text-white font-semibold">{current}</span>/{target}
            </span>
            <span className="text-yellow-400">{reward}</span>
          </div>
        </div>

        {/* Right: Streak counter */}
        {streakDays > 0 && (
          <div className="flex flex-col items-center justify-center px-3 py-2 bg-orange-500/20 rounded-xl">
            <span className="text-xl font-black text-orange-400">{streakDays}</span>
            <span className="text-[10px] text-orange-400/80 uppercase tracking-wider">day streak</span>
          </div>
        )}
      </div>

      {/* Completion celebration */}
      {progress >= 1 && (
        <motion.div
          className="mt-3 p-2 bg-green-500/20 rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-green-400 font-semibold text-sm">
            ✓ Challenge Complete! +{reward}
          </span>
        </motion.div>
      )}
    </motion.button>
  );
}

// Default challenge for demo/placeholder
export function DefaultDailyChallenge({ onClick }: { onClick?: () => void }) {
  return (
    <DailyChallenge
      title="Daily Challenge"
      description="Win 3 trades today"
      progress={2 / 3}
      current={2}
      target={3}
      streakDays={3}
      reward="+200 XP"
      onClick={onClick}
    />
  );
}
