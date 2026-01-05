import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  searchStocks,
  fetchStockData,
  getStocksByCategory,
  getRandomStock,
  fetchDailyGainers,
  CATEGORY_INFO,
  VOLATILITY_INFO,
  type TimeRange,
  type Interval,
  type StockCategory,
  type StockInfo,
} from '../../services/yahoo-finance';
import { useGame } from '../../context/GameContext';

interface HomeScreenProps {
  onStartGame: () => void;
}

const TIME_RANGES: { value: TimeRange; label: string; description: string }[] = [
  { value: '1d', label: '1 Day', description: '~78 candles' },
  { value: '5d', label: '5 Days', description: '~390 candles' },
  { value: '1mo', label: '1 Month', description: '~1500 candles' },
];

const INTERVALS: { value: Interval; label: string }[] = [
  { value: '1m', label: '1min' },
  { value: '5m', label: '5min' },
  { value: '15m', label: '15min' },
];

// Category tabs order
const CATEGORIES: StockCategory[] = ['all', 'meme', 'crypto', 'tech', 'leveraged', 'bluechip'];

export function HomeScreen({ onStartGame }: HomeScreenProps) {
  const { dispatch } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('5d');
  const [selectedInterval, setSelectedInterval] = useState<Interval>('5m');
  const [selectedCategory, setSelectedCategory] = useState<StockCategory>('all');
  const [dailyGainers, setDailyGainers] = useState<StockInfo[]>([]);
  const [gainersLoading, setGainersLoading] = useState(false);

  // Fetch daily gainers on mount
  useEffect(() => {
    const loadGainers = async () => {
      setGainersLoading(true);
      try {
        const gainers = await fetchDailyGainers(5);
        setDailyGainers(gainers);
      } catch (err) {
        console.error('Failed to load gainers:', err);
      } finally {
        setGainersLoading(false);
      }
    };
    loadGainers();
  }, []);

  const filteredStocks = searchQuery
    ? searchStocks(searchQuery, selectedCategory)
    : getStocksByCategory(selectedCategory);

  // Check if search query looks like a custom ticker
  const isCustomTicker = searchQuery.length >= 1 &&
    searchQuery.length <= 5 &&
    /^[A-Za-z]+$/.test(searchQuery) &&
    filteredStocks.length === 0;

  const handleSelectStock = useCallback(async (symbol: string, mysteryMode = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchStockData({
        symbol: symbol.toUpperCase(),
        range: selectedRange,
        interval: selectedInterval
      });

      if (data.length < 50) {
        throw new Error(`Not enough data for ${symbol.toUpperCase()}. Try a different range or stock.`);
      }

      dispatch({ type: 'LOAD_DATA', payload: { symbol: symbol.toUpperCase(), data, mysteryMode } });
      dispatch({ type: 'START_GAME' });
      onStartGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock data. Check the ticker symbol.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, onStartGame, selectedRange, selectedInterval]);

  // Handle mystery mode - random stock from category
  const handleMysteryMode = useCallback(async (category: StockCategory) => {
    const randomStock = getRandomStock(category);
    await handleSelectStock(randomStock.symbol, true);
  }, [handleSelectStock]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSelectStock(searchQuery.trim());
    }
  };

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

      {/* Search Box + Custom Symbol */}
      <motion.div
        className="w-full max-w-md mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter any ticker (AAPL, TSLA, BTC-USD...)"
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl
                       text-white placeholder-gray-500 text-lg uppercase
                       focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20
                       transition-all"
          />
          {searchQuery && (
            <motion.button
              onClick={() => handleSelectStock(searchQuery)}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2
                         bg-indigo-500 hover:bg-indigo-400 rounded-xl text-white font-medium
                         disabled:opacity-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go
            </motion.button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter or click Go to load any Yahoo Finance ticker
        </p>
      </motion.div>

      {/* Time Range & Interval Selectors */}
      <motion.div
        className="flex flex-wrap gap-4 mb-6 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Time Range */}
        <div className="glass-card p-3">
          <div className="text-xs text-gray-400 mb-2">Time Range</div>
          <div className="flex gap-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${selectedRange === range.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interval */}
        <div className="glass-card p-3">
          <div className="text-xs text-gray-400 mb-2">Candle Interval</div>
          <div className="flex gap-1">
            {INTERVALS.map((interval) => (
              <button
                key={interval.value}
                onClick={() => setSelectedInterval(interval.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${selectedInterval === interval.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
              >
                {interval.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 max-w-md text-center"
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
          Loading {searchQuery || 'stock'} data...
        </motion.div>
      )}

      {/* Custom Ticker Prompt */}
      {isCustomTicker && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <button
            onClick={() => handleSelectStock(searchQuery)}
            className="glass-card p-4 hover:bg-white/10 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <span className="text-indigo-400 font-bold">{searchQuery.charAt(0)}</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-lg">{searchQuery}</div>
              <div className="text-xs text-gray-400">Load custom ticker from Yahoo Finance</div>
            </div>
            <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Category Tabs */}
      <motion.div
        className="w-full max-w-3xl mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const info = CATEGORY_INFO[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                  ${isSelected
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <span>{info.emoji}</span>
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Mystery Mode + Daily Gainers Row */}
      <motion.div
        className="w-full max-w-3xl mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-wrap justify-center gap-3">
          {/* Mystery Mode Button */}
          <button
            onClick={() => handleMysteryMode(selectedCategory)}
            disabled={isLoading}
            className="px-5 py-3 rounded-xl font-bold text-white
                       bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
                       hover:from-pink-600 hover:via-red-600 hover:to-yellow-600
                       shadow-lg shadow-red-500/25 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            <span className="text-lg">🎲</span>
            <span>Mystery</span>
          </button>

          {/* Daily Gainers - Mystery Mode */}
          {dailyGainers.length > 0 && (
            <button
              onClick={async () => {
                const randomGainer = dailyGainers[Math.floor(Math.random() * dailyGainers.length)];
                await handleSelectStock(randomGainer.symbol, true);
              }}
              disabled={isLoading || gainersLoading}
              className="px-5 py-3 rounded-xl font-bold text-white
                         bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500
                         hover:from-green-600 hover:via-emerald-600 hover:to-teal-600
                         shadow-lg shadow-green-500/25 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
            >
              <span className="text-lg">📈</span>
              <span>Today's Gainer</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500 w-full text-center mt-2">
          Random stock • Hidden identity • Pure skill test
        </div>
      </motion.div>

      {/* Today's Hot Stocks */}
      {dailyGainers.length > 0 && (
        <motion.div
          className="w-full max-w-3xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🔥</span> Today's Top Movers
            {gainersLoading && <span className="text-xs">(loading...)</span>}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dailyGainers.map((stock, index) => (
              <motion.button
                key={stock.symbol}
                onClick={() => handleSelectStock(stock.symbol)}
                disabled={isLoading}
                className="flex-shrink-0 glass-card px-4 py-3 hover:bg-white/10 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">#{index + 1}</span>
                  <div>
                    <div className="font-bold">{stock.symbol}</div>
                    <div className="text-xs text-gray-400 max-w-[100px] truncate">{stock.name}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stock Grid */}
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">
          {searchQuery && filteredStocks.length > 0
            ? 'Matching Stocks'
            : `${CATEGORY_INFO[selectedCategory].emoji} ${CATEGORY_INFO[selectedCategory].label} Stocks`}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredStocks.slice(0, 16).map((stock, index) => {
            const volInfo = VOLATILITY_INFO[stock.volatility];
            return (
              <motion.button
                key={stock.symbol}
                onClick={() => handleSelectStock(stock.symbol)}
                disabled={isLoading}
                className="glass-card p-4 text-left hover:bg-white/10 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Volatility Badge */}
                <div className={`absolute top-2 right-2 text-xs font-bold ${volInfo.color}`}>
                  {volInfo.emoji}
                </div>
                <div className="font-bold text-lg">{stock.symbol}</div>
                <div className="text-xs text-gray-400 truncate mb-1">{stock.name}</div>
                <div className={`text-[10px] font-semibold ${volInfo.color} opacity-75`}>
                  {volInfo.label}
                </div>
              </motion.button>
            );
          })}
        </div>

        {filteredStocks.length === 0 && !isCustomTicker && (
          <div className="text-center text-gray-500 py-8">
            No matching stocks. Type a valid ticker and press Enter.
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
          🎮 <strong>Controls:</strong> <kbd className="px-1.5 py-0.5 bg-white/10 rounded">B</kbd> Buy,{' '}
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">S</kbd> Sell,{' '}
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Space</kbd> Pause
        </p>
        <p>
          Start with $10,000 • Use leverage for higher risk/reward
        </p>
      </motion.div>
    </div>
  );
}
