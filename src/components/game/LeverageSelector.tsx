import { motion } from 'framer-motion';
import type { LeverageOption } from '../../types/game';

interface LeverageSelectorProps {
  value: LeverageOption;
  onChange: (value: LeverageOption) => void;
  disabled: boolean;
}

const LEVERAGE_OPTIONS: LeverageOption[] = [1, 2, 4, 10];

export function LeverageSelector({ value, onChange, disabled }: LeverageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 mr-2">Leverage:</span>
      <div className="flex gap-1">
        {LEVERAGE_OPTIONS.map((option) => (
          <motion.button
            key={option}
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${value === option
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }
            `}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
          >
            {option}x
          </motion.button>
        ))}
      </div>
      {value > 1 && (
        <span className="text-xs text-amber-400 ml-2">
          ⚠️ {value}x risk
        </span>
      )}
    </div>
  );
}
