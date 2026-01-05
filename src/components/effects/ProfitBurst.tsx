import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/format';

interface ProfitBurstProps {
  pnl: number;
  isVisible: boolean;
}

export function ProfitBurst({ pnl, isVisible }: ProfitBurstProps) {
  const isProfit = pnl > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Background flash */}
          <motion.div
            className={`fixed inset-0 pointer-events-none z-40 ${
              isProfit ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* P&L Display */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, y: -50 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div
              className={`text-6xl md:text-8xl font-black ${
                isProfit ? 'text-green-400' : 'text-red-400'
              }`}
              style={{
                textShadow: isProfit
                  ? '0 0 60px rgba(34, 197, 94, 0.8)'
                  : '0 0 60px rgba(239, 68, 68, 0.8)',
              }}
            >
              {formatCurrency(pnl, true)}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
