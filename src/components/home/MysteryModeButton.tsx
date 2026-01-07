import { motion } from 'framer-motion';

interface MysteryModeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  unlocked?: boolean;
}

export function MysteryModeButton({ onClick, disabled, unlocked = true }: MysteryModeButtonProps) {
  if (!unlocked) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gray-800/50 p-6 opacity-60">
        <div className="text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h3 className="text-xl font-bold text-gray-400">Mystery Mode</h3>
          <p className="text-sm text-gray-500 mt-1">Unlock at Level 10</p>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full overflow-hidden rounded-3xl p-6
        bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400
        shadow-2xl shadow-pink-500/25
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-pink-500/40'}
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
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              bottom: '10%',
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <motion.div
          className="text-5xl mb-3"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          🎲
        </motion.div>

        <h2 className="text-2xl font-black text-white mb-1 drop-shadow-lg">
          MYSTERY MODE
        </h2>

        <p className="text-white/80 text-sm font-medium">
          Pure skill • Hidden stock identity
        </p>

        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-white/30"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>
    </motion.button>
  );
}
