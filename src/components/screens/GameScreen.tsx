import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TradingChart, type ChartMode } from '../game/TradingChart';
import { IntegratedTradePanel } from '../game/IntegratedTradePanel';
import { SpeedSelector } from '../game/SpeedSelector';
import { getAvailableLeverages } from '../../services/scoring';
import type { LeverageOption } from '../../types/game';
import { PortfolioHUD, PortfolioHUDCompact } from '../hud/PortfolioHUD';
import { ProfitBurst } from '../effects/ProfitBurst';
import { StreakAnnouncement } from '../effects/StreakFlame';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useSound } from '../../hooks/useSound';
import { useHaptics } from '../../hooks/useHaptics';
import { useSwipeControls, useIsMobile } from '../../hooks/useSwipeControls';
import { useScreenShake } from '../effects/ScreenShake';
import { useParticles } from '../effects/ParticleSystem';
import { loadProgress, getXPForCurrentLevel } from '../../services/storage';

// Format timestamp to readable time
function formatCandleTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface GameScreenProps {
  onGameEnd: () => void;
  onBackToHome: () => void;
}

export function GameScreen({ onGameEnd, onBackToHome }: GameScreenProps) {
  const {
    state,
    buy,
    sell,
    sellHalf,
    closePosition,
    togglePlay,
    setSpeed,
    setLeverage,
    endGame,
  } = useGameEngine();

  const { playSound, playProfit, playLoss, playStreak } = useSound();
  const { impact, profitFeedback, streakFeedback } = useHaptics();
  const isMobile = useIsMobile();

  // Try to get shake/particle contexts (may not be available)
  let shake: ReturnType<typeof useScreenShake> | null = null;
  let particles: ReturnType<typeof useParticles> | null = null;

  try {
    shake = useScreenShake();
  } catch {
    // ScreenShakeProvider not available
  }

  try {
    particles = useParticles();
  } catch {
    // ParticleProvider not available
  }

  // Chart mode state
  const [chartMode, setChartMode] = useState<ChartMode>('candles');

  // Track last trade for profit burst effect
  const [showProfitBurst, setShowProfitBurst] = useState(false);
  const [lastPnL, setLastPnL] = useState(0);
  const [prevTradesLength, setPrevTradesLength] = useState(0);

  // Streak announcement
  const [showStreakAnnouncement, setShowStreakAnnouncement] = useState(false);
  const [announceStreak, setAnnounceStreak] = useState(0);
  const prevStreakRef = useRef(0);

  // Level and XP
  const [levelInfo, setLevelInfo] = useState({ level: 1, xp: 0, required: 1000 });

  // Load saved progress on mount
  useEffect(() => {
    const progress = loadProgress();
    const xpInfo = getXPForCurrentLevel();
    setLevelInfo({
      level: progress.level,
      xp: xpInfo.current,
      required: xpInfo.required,
    });
  }, []);

  // Detect new trade completion
  useEffect(() => {
    if (state.trades.length > prevTradesLength) {
      const lastTrade = state.trades[state.trades.length - 1];
      setLastPnL(lastTrade.pnl);
      setShowProfitBurst(true);

      // Sound & haptic feedback scaled to P&L
      if (lastTrade.pnl > 0) {
        playProfit(lastTrade.pnl);
        profitFeedback(lastTrade.pnl);
        shake?.shakeOnProfit(lastTrade.pnl);
        particles?.emitProfit(lastTrade.pnl);
      } else {
        playLoss();
        profitFeedback(lastTrade.pnl);
        shake?.shakeOnLoss(Math.abs(lastTrade.pnl));
        particles?.emitLoss();
      }

      // Hide after animation
      setTimeout(() => setShowProfitBurst(false), 1500);
    }
    setPrevTradesLength(state.trades.length);
  }, [state.trades.length, prevTradesLength, playProfit, playLoss, profitFeedback, shake, particles]);

  // Streak milestone announcement
  useEffect(() => {
    const currentStreak = state.currentStreak;
    const prevStreak = prevStreakRef.current;

    // Check for milestone streaks
    if (currentStreak > prevStreak && [3, 5, 7, 10, 15, 20].includes(currentStreak)) {
      setAnnounceStreak(currentStreak);
      setShowStreakAnnouncement(true);
      playStreak(currentStreak);
      streakFeedback(currentStreak);
      particles?.emitStreak(currentStreak);
    }

    prevStreakRef.current = currentStreak;
  }, [state.currentStreak, playStreak, streakFeedback, particles]);

  // Handle game end
  useEffect(() => {
    if (state.gameStatus === 'ended') {
      playSound('sessionEnd');
      onGameEnd();
    }
  }, [state.gameStatus, onGameEnd, playSound]);

  // Handle buy with sound and effects
  const handleBuy = useCallback(() => {
    playSound('buy');
    impact();
    buy();
  }, [buy, playSound, impact]);

  // Handle sell with sound and effects
  const handleSell = useCallback(() => {
    playSound('sell');
    impact();
    sell();
  }, [sell, playSound, impact]);

  // Handle integrated trade (sets leverage, then executes buy/sell)
  const handleTrade = useCallback((type: 'long' | 'short', leverage: LeverageOption) => {
    // Set leverage first (only works when no position)
    setLeverage(leverage);
    // Then execute trade
    if (type === 'long') {
      handleBuy();
    } else {
      handleSell();
    }
  }, [setLeverage, handleBuy, handleSell]);

  // Handle sell half with sound
  const handleSellHalf = useCallback(() => {
    playSound('sell');
    impact();
    sellHalf();
  }, [sellHalf, playSound, impact]);

  // Handle close all with sound
  const handleCloseAll = useCallback(() => {
    playSound('sell');
    impact();
    closePosition();
  }, [closePosition, playSound, impact]);

  // Get available leverages based on level
  const availableLeverages = useMemo(() => {
    return getAvailableLeverages(levelInfo.level) as LeverageOption[];
  }, [levelInfo.level]);

  // Keyboard controls
  useKeyboardControls({
    onBuy: handleBuy,
    onSell: handleSell,
    onTogglePlay: togglePlay,
    enabled: state.gameStatus === 'playing' || state.gameStatus === 'paused',
  });

  // Swipe controls for mobile
  const { swipeState, direction: swipeDirection, progress: swipeProgress } = useSwipeControls({
    onSwipeUp: handleBuy,
    onSwipeDown: handleSell,
    enabled: isMobile && (state.gameStatus === 'playing' || state.gameStatus === 'paused'),
    threshold: 60,
  });

  // Progress indicator
  const progressPercent = (state.currentCandleIndex / state.allCandleData.length) * 100;

  // Current candle time
  const currentTime = useMemo(() => {
    const candle = state.allCandleData[state.currentCandleIndex];
    return candle ? formatCandleTime(candle.time as number) : '';
  }, [state.allCandleData, state.currentCandleIndex]);

  // Countdown warning (last 10 candles)
  const remainingCandles = state.allCandleData.length - state.currentCandleIndex;
  const showCountdown = remainingCandles <= 10 && state.gameStatus === 'playing';

  useEffect(() => {
    if (showCountdown) {
      playSound('countdown');
    }
  }, [remainingCandles, showCountdown, playSound]);

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] relative overflow-hidden">
      {/* Mobile Swipe Indicator */}
      {isMobile && swipeState.isSwipping && (
        <motion.div
          className={`absolute left-1/2 -translate-x-1/2 z-40 px-6 py-2 rounded-full font-bold text-lg ${
            swipeDirection === 'up'
              ? 'top-20 bg-green-500/80 text-white'
              : swipeDirection === 'down'
              ? 'bottom-20 bg-red-500/80 text-white'
              : 'top-1/2 bg-white/20 text-white'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: swipeProgress,
            scale: 0.8 + swipeProgress * 0.2,
          }}
        >
          {swipeDirection === 'up' ? '↑ BUY' : swipeDirection === 'down' ? '↓ SELL' : 'Swipe'}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div>
            {state.mysteryMode ? (
              <>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                  🎲 MYSTERY
                </span>
                <span className="text-gray-600 ml-2 text-xs">
                  ({state.currentCandleIndex + 1}/{state.allCandleData.length})
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold">{state.symbol}</span>
                <span className="text-gray-500 ml-2 text-sm">
                  {currentTime}
                </span>
                <span className="text-gray-600 ml-2 text-xs">
                  ({state.currentCandleIndex + 1}/{state.allCandleData.length})
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown Warning */}
          {showCountdown && (
            <motion.div
              className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {remainingCandles} left
            </motion.div>
          )}

          {/* Chart Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setChartMode('candles')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                chartMode === 'candles'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Candlestick Chart"
            >
              📊
            </button>
            <button
              onClick={() => setChartMode('line')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                chartMode === 'line'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Smooth Line Chart"
            >
              〰️
            </button>
          </div>

          <SpeedSelector
            value={state.speed}
            onChange={setSpeed}
            isPlaying={state.isPlaying}
            onTogglePlay={togglePlay}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-white/5 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
        {/* Countdown pulse */}
        {showCountdown && (
          <motion.div
            className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-yellow-500/50 to-transparent"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Main Content - Responsive */}
      <div className={`flex-1 flex ${isMobile ? 'flex-col' : 'gap-4'} p-4 overflow-hidden`}>
        {/* Mobile: Compact HUD at top */}
        {isMobile && (
          <div className="mb-3">
            <PortfolioHUDCompact
              balance={state.balance}
              startingBalance={state.startingBalance}
              openPnL={state.openPnL}
              streak={state.currentStreak}
              winCount={state.winCount}
              lossCount={state.lossCount}
            />
          </div>
        )}

        {/* Chart Area */}
        <div className={`${isMobile ? 'flex-1' : 'flex-1'} glass-card overflow-hidden`}>
          <TradingChart
            data={state.allCandleData}
            currentIndex={state.currentCandleIndex}
            position={state.position}
            isPlaying={state.isPlaying}
            chartMode={chartMode}
            mysteryMode={state.mysteryMode}
            basePrice={state.basePrice}
          />
        </div>

        {/* Side Panel - Desktop */}
        {!isMobile && (
          <div className="w-80 flex flex-col gap-4">
            <PortfolioHUD
              balance={state.balance}
              startingBalance={state.startingBalance}
              openPnL={state.openPnL}
              position={state.position}
              streak={state.currentStreak}
              maxStreak={state.maxStreak}
              winCount={state.winCount}
              lossCount={state.lossCount}
              level={levelInfo.level}
              xp={levelInfo.xp}
              xpToNextLevel={levelInfo.required}
            />

            {/* Integrated Trade Panel */}
            <div className="glass-card p-4">
              <IntegratedTradePanel
                onTrade={handleTrade}
                onSellHalf={handleSellHalf}
                onCloseAll={handleCloseAll}
                hasPosition={state.position !== null}
                positionType={state.position?.type ?? null}
                disabled={state.gameStatus !== 'playing'}
                availableLeverages={availableLeverages}
              />
            </div>

            {/* End Game Button */}
            <motion.button
              onClick={endGame}
              className="w-full py-3 rounded-xl bg-white/5 text-gray-400
                         hover:bg-white/10 hover:text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              End Session
            </motion.button>
          </div>
        )}

        {/* Mobile: Bottom Controls */}
        {isMobile && (
          <div className="mt-3 space-y-3">
            {/* Integrated Trade Panel */}
            <div className="glass-card p-3">
              <IntegratedTradePanel
                onTrade={handleTrade}
                onSellHalf={handleSellHalf}
                onCloseAll={handleCloseAll}
                hasPosition={state.position !== null}
                positionType={state.position?.type ?? null}
                disabled={state.gameStatus !== 'playing'}
                availableLeverages={availableLeverages}
              />
            </div>

            {/* End Session + Swipe hint */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Swipe ↑ BUY • Swipe ↓ SELL
              </div>
              <motion.button
                onClick={endGame}
                className="px-4 py-2 rounded-lg bg-white/10 text-gray-400 text-sm"
                whileTap={{ scale: 0.95 }}
              >
                End Session
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Profit Burst Effect */}
      <ProfitBurst pnl={lastPnL} isVisible={showProfitBurst} />

      {/* Streak Announcement */}
      <StreakAnnouncement
        streak={announceStreak}
        isVisible={showStreakAnnouncement}
        onComplete={() => setShowStreakAnnouncement(false)}
      />

      {/* Paused Overlay */}
      <AnimatePresence>
        {state.gameStatus === 'paused' && (
          <motion.div
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-4xl font-bold mb-4">⏸️ PAUSED</div>
              <button
                onClick={togglePlay}
                className="px-6 py-3 bg-indigo-500 rounded-xl font-semibold
                           hover:bg-indigo-400 transition-colors"
              >
                Resume (Space)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
