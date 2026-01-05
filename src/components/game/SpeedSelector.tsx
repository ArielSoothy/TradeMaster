import { motion } from 'framer-motion';
import type { SpeedOption } from '../../types/game';

interface SpeedSelectorProps {
  value: SpeedOption;
  onChange: (value: SpeedOption) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const SPEED_OPTIONS: SpeedOption[] = [1, 2, 4];

export function SpeedSelector({ value, onChange, isPlaying, onTogglePlay }: SpeedSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Play/Pause Button */}
      <motion.button
        onClick={onTogglePlay}
        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center
                   hover:bg-white/20 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </motion.button>

      {/* Speed Options */}
      <div className="flex gap-1">
        {SPEED_OPTIONS.map((option) => (
          <motion.button
            key={option}
            onClick={() => onChange(option)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${value === option
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {option}x
          </motion.button>
        ))}
      </div>

      {/* Keyboard hint */}
      <span className="text-xs text-gray-500 hidden sm:block">
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Space</kbd> to {isPlaying ? 'pause' : 'play'}
      </span>
    </div>
  );
}
