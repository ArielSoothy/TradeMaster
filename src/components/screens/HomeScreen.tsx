import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  searchStocks,
  fetchStockDataWithCache,
  getStocksByCategory,
  getRandomStock,
  fetchLowFloatRunners,
  CATEGORY_INFO,
  type StockCategory,
  type StockInfo,
} from '../../services/yahoo-finance';
import { useGame } from '../../context/GameContext';
import { loadProgress, getXPForCurrentLevel } from '../../services/storage';
import { getLevelConfig, isFeatureUnlocked } from '../../services/scoring';
import { ProfileCard } from '../auth/ProfileCard';
import {
  MysteryModeButton,
  DailyChallenge,
  QuickPlaySection,
  LeaderboardTeaser,
  LevelProgressBar,
} from '../home';

interface HomeScreenProps {
  onStartGame: () => void;
  onOpenLeaderboard?: () => void;
}

// Categories for quick access
const QUICK_CATEGORIES: StockCategory[] = ['meme', 'crypto', 'tech', 'leveraged'];

export function HomeScreen({ onStartGame, onOpenLeaderboard }: HomeScreenProps) {
  const { dispatch } = useGame();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyGainers, setDailyGainers] = useState<StockInfo[]>([]);
  const [gainersLoading, setGainersLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory] = useState<StockCategory>('all');

  // Level and XP state
  const [levelInfo, setLevelInfo] = useState({
    level: 1,
    xp: 0,
    currentXP: 0,
    requiredXP: 500,
    title: 'Rookie Trader',
  });

  // Load progress on mount
  useEffect(() => {
    const progress = loadProgress();
    const xpInfo = getXPForCurrentLevel();
    const config = getLevelConfig(progress.level);
    setLevelInfo({
      level: progress.level,
      xp: progress.xp,
      currentXP: xpInfo.current,
      requiredXP: xpInfo.required,
      title: config.title,
    });
  }, []);

  // Feature unlocks based on level
  const mysteryUnlocked = isFeatureUnlocked(levelInfo.level, 'mystery') || levelInfo.level >= 10;
  const leaderboardUnlocked = isFeatureUnlocked(levelInfo.level, 'leaderboard') || levelInfo.level >= 30;
  const dailyChallengeUnlocked = isFeatureUnlocked(levelInfo.level, 'daily_challenge') || levelInfo.level >= 50;

  // Fetch small cap gainers on mount
  useEffect(() => {
    const loadGainers = async () => {
      setGainersLoading(true);
      try {
        const gainers = await fetchLowFloatRunners({ limit: 8 });
        setDailyGainers(gainers);
      } catch (err) {
        console.error('Failed to load gainers:', err);
      } finally {
        setGainersLoading(false);
      }
    };
    loadGainers();
  }, []);

  // Filter stocks by search
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return getStocksByCategory(selectedCategory);
    return searchStocks(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Convert to QuickPlaySection format
  const gainersForQuickPlay = useMemo(() =>
    dailyGainers.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      changePercent: stock.changePercent ?? 0,
    })),
    [dailyGainers]
  );

  const handleSelectStock = useCallback(async (symbol: string, mysteryMode = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchStockDataWithCache({
        symbol: symbol.toUpperCase(),
        interval: '1m',
      });

      if (data.length < 50) {
        throw new Error(`Not enough data for ${symbol.toUpperCase()}.`);
      }

      dispatch({ type: 'LOAD_DATA', payload: { symbol: symbol.toUpperCase(), data, mysteryMode } });
      dispatch({ type: 'START_GAME' });
      onStartGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock data.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, onStartGame]);

  // Mystery mode - random stock
  const handleMysteryMode = useCallback(async () => {
    const randomStock = getRandomStock('all');
    await handleSelectStock(randomStock.symbol, true);
  }, [handleSelectStock]);

  // Random gainer
  const handleRandomGainer = useCallback(async () => {
    if (dailyGainers.length === 0) return;
    const randomGainer = dailyGainers[Math.floor(Math.random() * dailyGainers.length)];
    await handleSelectStock(randomGainer.symbol, true);
  }, [dailyGainers, handleSelectStock]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSelectStock(searchQuery.trim());
    }
    if (e.key === 'Escape') {
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] safe-area-pb">
      {/* Top Bar */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <LevelProgressBar
          level={levelInfo.level}
          currentXP={levelInfo.currentXP}
          requiredXP={levelInfo.requiredXP}
          title={levelInfo.title}
        />
        <div className="ml-3">
          <ProfileCard compact />
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Logo */}
        <motion.div
          className="text-center py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            TradeMaster
          </h1>
        </motion.div>

        {/* Mystery Mode - Hero CTA */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <MysteryModeButton
            onClick={handleMysteryMode}
            disabled={isLoading}
            unlocked={mysteryUnlocked}
          />
        </motion.div>

        {/* Daily Challenge */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <DailyChallenge
            title="Daily Challenge"
            description="Win 3 trades today"
            progress={0.66}
            current={2}
            target={3}
            streakDays={3}
            reward="+200 XP"
            unlocked={dailyChallengeUnlocked}
          />
        </motion.div>

        {/* Today's Movers */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickPlaySection
            title="Today's Movers"
            icon="🚀"
            stocks={gainersForQuickPlay}
            onSelectStock={(symbol) => handleSelectStock(symbol)}
            isLoading={gainersLoading}
          />
        </motion.div>

        {/* Leaderboard Teaser */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <LeaderboardTeaser
            topPlayer={{
              rank: 1,
              username: 'trader_pro',
              pnlPercent: 45.2,
            }}
            userRank={12}
            totalPlayers={1247}
            unlocked={leaderboardUnlocked}
            onClick={onOpenLeaderboard}
          />
        </motion.div>

        {/* Category Quick Access */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Play</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_CATEGORIES.map((cat) => {
              const info = CATEGORY_INFO[cat];
              return (
                <motion.button
                  key={cat}
                  onClick={async () => {
                    const randomStock = getRandomStock(cat);
                    await handleSelectStock(randomStock.symbol, true);
                  }}
                  disabled={isLoading}
                  className="glass-card p-4 text-left hover:bg-white/10 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl mb-1 block">{info.emoji}</span>
                  <span className="font-bold text-white">{info.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">Random {info.label.toLowerCase()}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm"
            >
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-300 hover:text-white"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white font-medium">Loading market data...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation / Search Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/95 backdrop-blur-lg border-t border-white/10 safe-area-pb">
        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter ticker (AAPL, TSLA, BTC-USD...)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                             text-white placeholder-gray-500 uppercase
                             focus:outline-none focus:border-indigo-500/50"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  {searchQuery && (
                    <motion.button
                      onClick={() => handleSelectStock(searchQuery)}
                      className="px-3 py-1.5 bg-indigo-500 rounded-lg text-white text-sm font-medium"
                      whileTap={{ scale: 0.95 }}
                    >
                      Go
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 bg-white/10 rounded-lg text-gray-400 text-sm"
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>

              {/* Search Results */}
              {searchQuery && filteredStocks.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                  {filteredStocks.slice(0, 6).map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock.symbol)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-left flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white">{stock.symbol}</span>
                        <span className="text-gray-500 text-sm ml-2">{stock.name}</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-around py-3 px-4"
            >
              <motion.button
                onClick={() => setShowSearch(true)}
                className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl hover:bg-white/5"
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">🔍</span>
                <span className="text-xs text-gray-400">Search</span>
              </motion.button>

              <motion.button
                onClick={onOpenLeaderboard}
                className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl hover:bg-white/5"
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">🏆</span>
                <span className="text-xs text-gray-400">Ranks</span>
              </motion.button>

              <motion.button
                onClick={handleRandomGainer}
                disabled={isLoading || dailyGainers.length === 0}
                className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl bg-green-500/20 disabled:opacity-50"
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">▶️</span>
                <span className="text-xs text-green-400 font-semibold">Play Now</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
