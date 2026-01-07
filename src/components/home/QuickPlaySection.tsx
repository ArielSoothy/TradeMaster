import { motion } from 'framer-motion';

interface StockCard {
  symbol: string;
  name: string;
  changePercent: number;
  category?: string;
}

interface QuickPlaySectionProps {
  title: string;
  icon: string;
  stocks: StockCard[];
  onSelectStock: (symbol: string) => void;
  isLoading?: boolean;
}

export function QuickPlaySection({
  title,
  icon,
  stocks,
  onSelectStock,
  isLoading,
}: QuickPlaySectionProps) {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
        <span className="text-xs text-gray-500">{stocks.length} available</span>
      </div>

      {/* Horizontal scroll container */}
      <div className="relative -mx-4">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0f0f0f] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0f0f0f] to-transparent z-10 pointer-events-none" />

        {/* Scrollable content */}
        <div
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {isLoading ? (
            // Loading skeletons
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-28 h-24 rounded-2xl bg-white/5 animate-pulse"
                style={{ scrollSnapAlign: 'start' }}
              />
            ))
          ) : stocks.length > 0 ? (
            // Stock cards
            stocks.map((stock, index) => (
              <motion.button
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex-shrink-0 w-28 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                style={{ scrollSnapAlign: 'start' }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Symbol */}
                <div className="font-bold text-white text-sm truncate">
                  {stock.symbol}
                </div>

                {/* Company name truncated */}
                <div className="text-[10px] text-gray-500 truncate mb-2">
                  {stock.name}
                </div>

                {/* Change percent */}
                <div
                  className={`text-lg font-black ${
                    stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(1)}%
                </div>
              </motion.button>
            ))
          ) : (
            // Empty state
            <div className="flex-1 text-center text-gray-500 text-sm py-6">
              No stocks available
            </div>
          )}

          {/* "See more" card */}
          {stocks.length > 3 && (
            <motion.button
              className="flex-shrink-0 w-20 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center"
              style={{ scrollSnapAlign: 'start' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl mb-1">→</span>
              <span className="text-xs text-gray-400">More</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact single-row version for smaller spaces
export function QuickPlayRow({
  stocks,
  onSelectStock,
}: {
  stocks: StockCard[];
  onSelectStock: (symbol: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {stocks.slice(0, 6).map((stock) => (
        <motion.button
          key={stock.symbol}
          onClick={() => onSelectStock(stock.symbol)}
          className={`
            flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium
            ${stock.changePercent >= 0
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="font-bold">{stock.symbol}</span>
          <span className="ml-1 opacity-70">
            {stock.changePercent >= 0 ? '+' : ''}
            {stock.changePercent.toFixed(0)}%
          </span>
        </motion.button>
      ))}
    </div>
  );
}
