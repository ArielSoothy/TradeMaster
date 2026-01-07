import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  username: string;
  pnlPercent: number;
  avatar?: string;
}

interface LeaderboardTeaserProps {
  topPlayer?: LeaderboardEntry;
  userRank?: number;
  totalPlayers?: number;
  unlocked?: boolean;
  onClick?: () => void;
}

export function LeaderboardTeaser({
  topPlayer,
  userRank,
  totalPlayers = 0,
  unlocked = true,
  onClick,
}: LeaderboardTeaserProps) {
  if (!unlocked) {
    return (
      <div className="glass-card p-4 opacity-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <h3 className="font-semibold text-gray-400">Leaderboard</h3>
            <p className="text-xs text-gray-500">Unlock at Level 30</p>
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
      <div className="flex items-center justify-between">
        {/* Left: Top player info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Trophy with glow */}
            <motion.span
              className="text-3xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              🏆
            </motion.span>
            <motion.div
              className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-md -z-10"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </div>

          <div>
            {topPlayer ? (
              <>
                <div className="text-xs text-gray-400 mb-0.5">Today's Leader</div>
                <div className="font-bold text-white">
                  @{topPlayer.username}
                </div>
                <div className="text-sm text-green-400 font-semibold">
                  +{topPlayer.pnlPercent.toFixed(1)}%
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-gray-400 mb-0.5">Leaderboard</div>
                <div className="font-bold text-white">
                  {totalPlayers} traders
                </div>
                <div className="text-sm text-gray-500">
                  Compete globally
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: User rank or CTA */}
        <div className="text-right">
          {userRank ? (
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <div className="text-xs text-gray-400">Your rank</div>
              <div className="text-lg font-black text-white">#{userRank}</div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>View</span>
              <span>→</span>
            </div>
          )}
        </div>
      </div>

      {/* Top 3 mini-preview */}
      {totalPlayers > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1">
              <span>🥇</span>
              <span className="text-gray-400">@{topPlayer?.username || 'trader1'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🥈</span>
              <span className="text-gray-500">@trader2</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🥉</span>
              <span className="text-gray-500">@trader3</span>
            </div>
          </div>
        </div>
      )}
    </motion.button>
  );
}

// Compact inline version for tight spaces
export function LeaderboardBadge({
  rank,
  onClick,
}: {
  rank?: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span>🏆</span>
      {rank ? (
        <span className="font-bold">#{rank}</span>
      ) : (
        <span>Leaderboard</span>
      )}
    </motion.button>
  );
}
