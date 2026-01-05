import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';

// Base tick interval (ms) - 500ms per candle at 1x speed for fast-paced day trading
const BASE_TICK_INTERVAL = 500;

/**
 * Core game loop hook
 * Handles animation frame timing and chart progression
 */
export function useGameEngine() {
  const { state, dispatch } = useGame();
  const animationRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef<number>(0);

  // Game loop
  useEffect(() => {
    if (!state.isPlaying || state.gameStatus !== 'playing') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const tick = (timestamp: number) => {
      const elapsed = timestamp - lastTickRef.current;
      const interval = BASE_TICK_INTERVAL / state.speed;

      if (elapsed >= interval) {
        dispatch({ type: 'TICK' });
        lastTickRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isPlaying, state.speed, state.gameStatus, dispatch]);

  // Actions
  const buy = useCallback(() => {
    dispatch({ type: 'BUY' });
  }, [dispatch]);

  const sell = useCallback(() => {
    dispatch({ type: 'SELL' });
  }, [dispatch]);

  const togglePlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAY' });
  }, [dispatch]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, [dispatch]);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, [dispatch]);

  const endGame = useCallback(() => {
    dispatch({ type: 'END_GAME' });
  }, [dispatch]);

  const setSpeed = useCallback((speed: 1 | 2 | 4) => {
    dispatch({ type: 'SET_SPEED', payload: speed });
  }, [dispatch]);

  const setLeverage = useCallback((leverage: 1 | 2 | 5 | 10) => {
    dispatch({ type: 'SET_LEVERAGE', payload: leverage });
  }, [dispatch]);

  return {
    state,
    dispatch,
    buy,
    sell,
    togglePlay,
    pause,
    resume,
    endGame,
    setSpeed,
    setLeverage,
  };
}
