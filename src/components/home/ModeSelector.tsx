import { motion } from 'framer-motion';
import { getArcadeHighScore, getTraderBestPnL } from '../../services/career';
import { useEffect, useState } from 'react';
import { MODE_THEMES } from '../../types/career';

interface ModeSelectorProps {
  onSelectArcade: () => void;
  onSelectTrader: () => void;
  disabled?: boolean;
}

export function ModeSelector({ onSelectArcade, onSelectTrader, disabled }: ModeSelectorProps) {
  const [arcadeHighScore, setArcadeHighScore] = useState(0);
  const [traderBestPnL, setTraderBestPnL] = useState(0);

  useEffect(() => {
    setArcadeHighScore(getArcadeHighScore());
    setTraderBestPnL(getTraderBestPnL());
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Arcade Mode */}
      <motion.button
        onClick={onSelectArcade}
        disabled={disabled}
        className={`
          relative overflow-hidden rounded-2xl p-4
          bg-gradient-to-br ${MODE_THEMES.arcade.gradient}
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        whileHover={disabled ? {} : { scale: 1.03 }}
        whileTap={disabled ? {} : { scale: 0.97 }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />

        <div className="relative z-10 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🎰</span>
            {arcadeHighScore > 0 && (
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs text-white font-medium">
                Best
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg">ARCADE</h3>
          <p className="text-white/70 text-xs mb-2">Fast & Fun</p>

          {arcadeHighScore > 0 ? (
            <div className="bg-white/20 rounded-lg px-2 py-1">
              <p className="text-white text-xs font-medium">
                High Score: {arcadeHighScore.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="bg-white/20 rounded-lg px-2 py-1">
              <p className="text-white/70 text-xs">No scores yet</p>
            </div>
          )}
        </div>
      </motion.button>

      {/* Trader Mode */}
      <motion.button
        onClick={onSelectTrader}
        disabled={disabled}
        className={`
          relative overflow-hidden rounded-2xl p-4
          bg-gradient-to-br ${MODE_THEMES.trader.gradient}
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        whileHover={disabled ? {} : { scale: 1.03 }}
        whileTap={disabled ? {} : { scale: 0.97 }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: 0.5 }}
        />

        <div className="relative z-10 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            {traderBestPnL > 0 && (
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs text-white font-medium">
                Best
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg">TRADER</h3>
          <p className="text-white/70 text-xs mb-2">Realistic Practice</p>

          {traderBestPnL !== 0 ? (
            <div className="bg-white/20 rounded-lg px-2 py-1">
              <p className={`text-xs font-medium ${traderBestPnL > 0 ? 'text-green-300' : 'text-red-300'}`}>
                Best P&L: {traderBestPnL > 0 ? '+' : ''}${traderBestPnL.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="bg-white/20 rounded-lg px-2 py-1">
              <p className="text-white/70 text-xs">No sessions yet</p>
            </div>
          )}
        </div>
      </motion.button>
    </div>
  );
}

// Mode description tooltips
export function ModeInfo({ mode }: { mode: 'arcade' | 'trader' }) {
  const info = {
    arcade: {
      title: 'Arcade Mode',
      description: 'Fast-paced trading with simplified charts and score-based gameplay.',
      features: ['Line charts', '2x-4x speed', 'Score combos', 'Leaderboards'],
      icon: '🎰',
    },
    trader: {
      title: 'Trader Mode',
      description: 'Realistic trading simulation for serious practice.',
      features: ['Candlestick charts', 'Real-time speed', 'P&L tracking', 'Advanced metrics'],
      icon: '📊',
    },
  };

  const data = info[mode];
  const theme = MODE_THEMES[mode];

  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${theme.gradient} bg-opacity-20`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <h4 className="font-bold text-white">{data.title}</h4>
      </div>
      <p className="text-white/80 text-sm mb-3">{data.description}</p>
      <div className="flex flex-wrap gap-2">
        {data.features.map((feature) => (
          <span
            key={feature}
            className="bg-white/20 rounded-full px-2 py-0.5 text-xs text-white"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}

// Quick play section header
export function QuickPlayHeader() {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-sm font-semibold text-gray-400">Quick Play</h3>
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  );
}
