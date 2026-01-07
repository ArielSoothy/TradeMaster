import { motion } from 'framer-motion';
import type { LeverageOption } from '../../types/game';

interface IntegratedTradePanelProps {
  onTrade: (type: 'long' | 'short', leverage: LeverageOption) => void;
  onSellHalf: () => void;
  onCloseAll: () => void;
  hasPosition: boolean;
  positionType: 'long' | 'short' | null;
  disabled: boolean;
  availableLeverages: LeverageOption[];
}

const LEVERAGE_OPTIONS: LeverageOption[] = [1, 2, 4, 10];

export function IntegratedTradePanel({
  onTrade,
  onSellHalf,
  onCloseAll,
  hasPosition,
  positionType,
  disabled,
  availableLeverages,
}: IntegratedTradePanelProps) {
  // When in position, show position management buttons
  if (hasPosition && positionType) {
    return (
      <div className="space-y-3">
        {/* Position management buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={onSellHalf}
            disabled={disabled}
            className={`
              flex-1 py-4 rounded-2xl font-bold text-lg
              flex items-center justify-center gap-2
              transition-all duration-200
              ${disabled
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
              }
            `}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
          >
            <span>Sell Half</span>
          </motion.button>

          <motion.button
            onClick={onCloseAll}
            disabled={disabled}
            className={`
              flex-1 py-4 rounded-2xl font-bold text-lg
              flex items-center justify-center gap-2
              transition-all duration-200
              ${disabled
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : positionType === 'long'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
              }
            `}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
          >
            <span>Close {positionType === 'long' ? 'Long' : 'Short'}</span>
          </motion.button>
        </div>

        {/* Hint text */}
        <div className="text-center text-xs text-gray-500">
          {positionType === 'long' ? 'Press S to close' : 'Press B to close'}
        </div>
      </div>
    );
  }

  // When no position, show trade buttons with integrated leverage
  return (
    <div className="space-y-3">
      {/* Long buttons row */}
      <div className="flex gap-2">
        {LEVERAGE_OPTIONS.map((leverage) => {
          const isLocked = !availableLeverages.includes(leverage);
          const isDisabled = disabled || isLocked;

          return (
            <motion.button
              key={`long-${leverage}`}
              onClick={() => !isDisabled && onTrade('long', leverage)}
              disabled={isDisabled}
              className={`
                flex-1 py-4 rounded-xl font-bold text-sm sm:text-base
                flex flex-col items-center justify-center gap-0.5
                transition-all duration-200 min-h-[60px]
                ${isDisabled
                  ? 'bg-gray-700/30 text-gray-600 cursor-not-allowed'
                  : 'btn-buy text-white shadow-lg hover:shadow-green-500/30'
                }
              `}
              whileHover={isDisabled ? {} : { scale: 1.03 }}
              whileTap={isDisabled ? {} : { scale: 0.97 }}
            >
              <span className="text-xs opacity-70">Long</span>
              <span className="text-lg">{leverage}x</span>
              {isLocked && (
                <span className="text-[10px] opacity-50">Locked</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Short buttons row */}
      <div className="flex gap-2">
        {LEVERAGE_OPTIONS.map((leverage) => {
          const isLocked = !availableLeverages.includes(leverage);
          const isDisabled = disabled || isLocked;

          return (
            <motion.button
              key={`short-${leverage}`}
              onClick={() => !isDisabled && onTrade('short', leverage)}
              disabled={isDisabled}
              className={`
                flex-1 py-4 rounded-xl font-bold text-sm sm:text-base
                flex flex-col items-center justify-center gap-0.5
                transition-all duration-200 min-h-[60px]
                ${isDisabled
                  ? 'bg-gray-700/30 text-gray-600 cursor-not-allowed'
                  : 'btn-sell text-white shadow-lg hover:shadow-red-500/30'
                }
              `}
              whileHover={isDisabled ? {} : { scale: 1.03 }}
              whileTap={isDisabled ? {} : { scale: 0.97 }}
            >
              <span className="text-xs opacity-70">Short</span>
              <span className="text-lg">{leverage}x</span>
              {isLocked && (
                <span className="text-[10px] opacity-50">Locked</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Keyboard hints */}
      <div className="hidden sm:flex justify-center gap-6 text-xs text-gray-500">
        <span>
          <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">B</kbd> Long
        </span>
        <span>
          <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">S</kbd> Short
        </span>
      </div>
    </div>
  );
}
