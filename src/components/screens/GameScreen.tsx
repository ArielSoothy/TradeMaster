import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TradingChart, type ChartMode } from '../game/TradingChart';
import { TradeButtons } from '../game/TradeButtons';
import { LeverageSelector } from '../game/LeverageSelector';
import { SpeedSelector } from '../game/SpeedSelector';
import { PortfolioHUD } from '../hud/PortfolioHUD';
import { ProfitBurst } from '../effects/ProfitBurst';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useSound } from '../../hooks/useSound';

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
    togglePlay,
    setSpeed,
    setLeverage,
    endGame,
  } = useGameEngine();

  const { playSound } = useSound();

  // Chart mode state
  const [chartMode, setChartMode] = useState<ChartMode>('candles');

  // Track last trade for profit burst effect
  const [showProfitBurst, setShowProfitBurst] = useState(false);
  const [lastPnL, setLastPnL] = useState(0);
  const [prevTradesLength, setPrevTradesLength] = useState(0);

  // Detect new trade completion
  useEffect(() => {
    if (state.trades.length > prevTradesLength) {
      const lastTrade = state.trades[state.trades.length - 1];
      setLastPnL(lastTrade.pnl);
      setShowProfitBurst(true);

      // Play sound
      if (lastTrade.pnl > 0) {
        playSound('profit');
      } else {
        playSound('loss');
      }

      // Hide after animation
      setTimeout(() => setShowProfitBurst(false), 1500);
    }
    setPrevTradesLength(state.trades.length);
  }, [state.trades.length, prevTradesLength, playSound]);

  // Handle game end
  useEffect(() => {
    if (state.gameStatus === 'ended') {
      onGameEnd();
    }
  }, [state.gameStatus, onGameEnd]);

  // Handle buy with sound
  const handleBuy = useCallback(() => {
    playSound('buy');
    buy();
  }, [buy, playSound]);

  // Handle sell with sound
  const handleSell = useCallback(() => {
    playSound('sell');
    sell();
  }, [sell, playSound]);

  // Keyboard controls
  useKeyboardControls({
    onBuy: handleBuy,
    onSell: handleSell,
    onTogglePlay: togglePlay,
    enabled: state.gameStatus === 'playing' || state.gameStatus === 'paused',
  });

  // Progress indicator
  const progressPercent = (state.currentCandleIndex / state.allCandleData.length) * 100;

  // Current candle time
  const currentTime = useMemo(() => {
    const candle = state.allCandleData[state.currentCandleIndex];
    return candle ? formatCandleTime(candle.time as number) : '';
  }, [state.allCandleData, state.currentCandleIndex]);

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f]">
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
            <span className="text-xl font-bold">{state.symbol}</span>
            <span className="text-gray-500 ml-2 text-sm">
              {currentTime}
            </span>
            <span className="text-gray-600 ml-2 text-xs">
              ({state.currentCandleIndex + 1}/{state.allCandleData.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
      <div className="h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 glass-card overflow-hidden">
          <TradingChart
            data={state.allCandleData}
            currentIndex={state.currentCandleIndex}
            position={state.position}
            isPlaying={state.isPlaying}
            chartMode={chartMode}
          />
        </div>

        {/* Side Panel */}
        <div className="w-80 flex flex-col gap-4">
          <PortfolioHUD
            balance={state.balance}
            startingBalance={state.startingBalance}
            openPnL={state.openPnL}
            position={state.position}
            streak={state.currentStreak}
            winCount={state.winCount}
            lossCount={state.lossCount}
          />

          {/* Leverage */}
          <div className="glass-card p-4">
            <LeverageSelector
              value={state.leverage}
              onChange={setLeverage}
              disabled={state.position !== null}
            />
          </div>

          {/* Trade Buttons */}
          <div className="glass-card p-4">
            <TradeButtons
              onBuy={handleBuy}
              onSell={handleSell}
              hasPosition={state.position !== null}
              positionType={state.position?.type ?? null}
              disabled={state.gameStatus !== 'playing'}
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
      </div>

      {/* Profit Burst Effect */}
      <ProfitBurst pnl={lastPnL} isVisible={showProfitBurst} />
    </div>
  );
}
