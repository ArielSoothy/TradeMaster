import { motion } from 'framer-motion';

interface TradeButtonsProps {
  onBuy: () => void;
  onSell: () => void;
  hasPosition: boolean;
  positionType: 'long' | 'short' | null;
  disabled: boolean;
}

export function TradeButtons({
  onBuy,
  onSell,
  hasPosition,
  positionType,
  disabled,
}: TradeButtonsProps) {
  const buyText = hasPosition && positionType === 'short' ? 'CLOSE SHORT' : 'BUY LONG';
  const sellText = hasPosition && positionType === 'long' ? 'CLOSE LONG' : 'SELL SHORT';

  return (
    <div className="flex gap-4 w-full">
      <motion.button
        onClick={onBuy}
        disabled={disabled || (hasPosition && positionType === 'long')}
        className={`
          flex-1 py-5 rounded-2xl font-bold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${disabled || (hasPosition && positionType === 'long')
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            : 'btn-buy text-white shadow-lg hover:shadow-green-500/30'
          }
        `}
        whileHover={disabled || (hasPosition && positionType === 'long') ? {} : { scale: 1.02 }}
        whileTap={disabled || (hasPosition && positionType === 'long') ? {} : { scale: 0.98 }}
      >
        <span className="text-xl">📈</span>
        <span>{buyText}</span>
        <kbd className="hidden sm:inline-block px-2 py-1 bg-white/20 rounded text-xs font-mono">
          B
        </kbd>
      </motion.button>

      <motion.button
        onClick={onSell}
        disabled={disabled || (hasPosition && positionType === 'short')}
        className={`
          flex-1 py-5 rounded-2xl font-bold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${disabled || (hasPosition && positionType === 'short')
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            : 'btn-sell text-white shadow-lg hover:shadow-red-500/30'
          }
        `}
        whileHover={disabled || (hasPosition && positionType === 'short') ? {} : { scale: 1.02 }}
        whileTap={disabled || (hasPosition && positionType === 'short') ? {} : { scale: 0.98 }}
      >
        <span className="text-xl">📉</span>
        <span>{sellText}</span>
        <kbd className="hidden sm:inline-block px-2 py-1 bg-white/20 rounded text-xs font-mono">
          S
        </kbd>
      </motion.button>
    </div>
  );
}
