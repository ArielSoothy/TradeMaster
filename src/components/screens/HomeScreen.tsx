import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { POPULAR_STOCKS, searchStocks, fetchStockData } from '../../services/yahoo-finance';
import { useGame } from '../../context/GameContext';

interface HomeScreenProps {
  onStartGame: () => void;
}

export function HomeScreen({ onStartGame }: HomeScreenProps) {
  const { dispatch } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredStocks = searchQuery
    ? searchStocks(searchQuery)
    : POPULAR_STOCKS;

  const handleSelectStock = useCallback(async (symbol: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch 5-minute candles for day trading simulation
      const data = await fetchStockData({ symbol, range: '1mo', interval: '5m' });

      if (data.length < 100) {
        throw new Error('Not enough intraday data for this stock');
      }

      dispatch({ type: 'LOAD_DATA', payload: { symbol, data } });
      dispatch({ type: 'START_GAME' });
      onStartGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, onStartGame]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo & Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl md:text-7xl font-black mb-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          TradeMaster
        </h1>
        <p className="text-gray-400 text-lg">
          Master the art of day trading with real historical data
        </p>
      </motion.div>

      {/* Search Box */}
      <motion.div
        className="w-full max-w-md mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks (e.g., AAPL, Tesla)..."
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl
                       text-white placeholder-gray-500 text-lg
                       focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20
                       transition-all"
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-3 text-gray-400"
        >
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading stock data...
        </motion.div>
      )}

      {/* Stock Grid */}
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">
          {searchQuery ? 'Search Results' : 'Popular Stocks'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredStocks.map((stock, index) => (
            <motion.button
              key={stock.symbol}
              onClick={() => handleSelectStock(stock.symbol)}
              disabled={isLoading}
              className="glass-card p-4 text-left hover:bg-white/10 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-bold text-lg">{stock.symbol}</div>
              <div className="text-xs text-gray-400 truncate">{stock.name}</div>
            </motion.button>
          ))}
        </div>

        {filteredStocks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No stocks found. Try a different search.
          </div>
        )}
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="mt-8 text-center text-gray-500 text-sm max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="mb-2">
          🎮 <strong>How to play:</strong> Watch the chart, press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">B</kbd> to buy,{' '}
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">S</kbd> to sell
        </p>
        <p>
          Start with $10,000 and try to maximize your profit!
        </p>
      </motion.div>
    </div>
  );
}
