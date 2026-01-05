import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { GameState, GameAction, Position, CompletedTrade } from '../types/game';
import { calculatePnL, calculatePositionSize, calculateDrawdown, generateTradeId, getRandomStartIndex } from '../utils/calculations';
import { calculateTradeXP, getLevelForXP } from '../services/scoring';

// Initial state
const STARTING_BALANCE = 10000;

const initialState: GameState = {
  symbol: '',
  allCandleData: [],
  currentCandleIndex: 0,
  balance: STARTING_BALANCE,
  startingBalance: STARTING_BALANCE,
  position: null,
  trades: [],
  openPnL: 0,
  isPlaying: false,
  speed: 1,
  leverage: 1,
  gameStatus: 'idle',
  totalPnL: 0,
  winCount: 0,
  lossCount: 0,
  currentStreak: 0,
  maxStreak: 0,
  maxDrawdown: 0,
  peakBalance: STARTING_BALANCE,
  level: 1,
  xp: 0,
  sessionXP: 0,
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_DATA': {
      return {
        ...initialState,
        symbol: action.payload.symbol,
        allCandleData: action.payload.data,
        gameStatus: 'idle',
        // Preserve XP and level from previous sessions
        xp: state.xp,
        level: state.level,
      };
    }

    case 'START_GAME': {
      const startIndex = action.payload?.startIndex ?? getRandomStartIndex(state.allCandleData.length);
      return {
        ...state,
        currentCandleIndex: startIndex,
        balance: STARTING_BALANCE,
        startingBalance: STARTING_BALANCE,
        position: null,
        trades: [],
        openPnL: 0,
        isPlaying: true,
        gameStatus: 'playing',
        totalPnL: 0,
        winCount: 0,
        lossCount: 0,
        currentStreak: 0,
        maxStreak: 0,
        maxDrawdown: 0,
        peakBalance: STARTING_BALANCE,
        sessionXP: 0,
      };
    }

    case 'TICK': {
      if (state.gameStatus !== 'playing' || !state.isPlaying) {
        return state;
      }

      const nextIndex = state.currentCandleIndex + 1;

      // Check if game is over (ran out of candles)
      if (nextIndex >= state.allCandleData.length) {
        return {
          ...state,
          isPlaying: false,
          gameStatus: 'ended',
        };
      }

      const currentCandle = state.allCandleData[nextIndex];
      let openPnL = 0;

      // Calculate open P&L if position exists
      if (state.position) {
        const pnlResult = calculatePnL(state.position, currentCandle.close);
        openPnL = pnlResult.pnl;

        // Check for liquidation (balance + openPnL <= 0)
        if (state.balance + openPnL <= 0) {
          // Force close position at loss
          const closedTrade = closePositionAtPrice(state, currentCandle.close, currentCandle.time);
          return {
            ...state,
            currentCandleIndex: nextIndex,
            position: null,
            balance: 0,
            openPnL: 0,
            trades: [...state.trades, closedTrade],
            lossCount: state.lossCount + 1,
            currentStreak: 0,
            isPlaying: false,
            gameStatus: 'ended',
          };
        }
      }

      // Update drawdown tracking
      const effectiveBalance = state.balance + openPnL;
      const newPeakBalance = Math.max(state.peakBalance, effectiveBalance);
      const drawdown = calculateDrawdown(effectiveBalance, newPeakBalance);
      const maxDrawdown = Math.max(state.maxDrawdown, drawdown);

      return {
        ...state,
        currentCandleIndex: nextIndex,
        openPnL,
        peakBalance: newPeakBalance,
        maxDrawdown,
      };
    }

    case 'BUY': {
      if (state.gameStatus !== 'playing') return state;

      const currentCandle = state.allCandleData[state.currentCandleIndex];
      const currentPrice = currentCandle.close;

      // If we have a short position, close it
      if (state.position?.type === 'short') {
        return closePosition(state, currentPrice, currentCandle.time);
      }

      // If we already have a long position, do nothing
      if (state.position?.type === 'long') {
        return state;
      }

      // Open new long position
      const quantity = calculatePositionSize(state.balance, currentPrice, state.leverage);
      const newPosition: Position = {
        type: 'long',
        entryPrice: currentPrice,
        quantity,
        leverage: state.leverage,
        entryIndex: state.currentCandleIndex,
        entryTime: currentCandle.time,
      };

      return {
        ...state,
        position: newPosition,
      };
    }

    case 'SELL': {
      if (state.gameStatus !== 'playing') return state;

      const currentCandle = state.allCandleData[state.currentCandleIndex];
      const currentPrice = currentCandle.close;

      // If we have a long position, close it
      if (state.position?.type === 'long') {
        return closePosition(state, currentPrice, currentCandle.time);
      }

      // If we already have a short position, do nothing
      if (state.position?.type === 'short') {
        return state;
      }

      // Open new short position
      const quantity = calculatePositionSize(state.balance, currentPrice, state.leverage);
      const newPosition: Position = {
        type: 'short',
        entryPrice: currentPrice,
        quantity,
        leverage: state.leverage,
        entryIndex: state.currentCandleIndex,
        entryTime: currentCandle.time,
      };

      return {
        ...state,
        position: newPosition,
      };
    }

    case 'CLOSE_POSITION': {
      if (!state.position || state.gameStatus !== 'playing') return state;

      const currentCandle = state.allCandleData[state.currentCandleIndex];
      return closePosition(state, currentCandle.close, currentCandle.time);
    }

    case 'SET_LEVERAGE': {
      // Can only change leverage when not in a position
      if (state.position) return state;
      return {
        ...state,
        leverage: action.payload,
      };
    }

    case 'SET_SPEED': {
      return {
        ...state,
        speed: action.payload,
      };
    }

    case 'TOGGLE_PLAY': {
      if (state.gameStatus === 'ended') return state;
      return {
        ...state,
        isPlaying: !state.isPlaying,
        gameStatus: state.isPlaying ? 'paused' : 'playing',
      };
    }

    case 'PAUSE': {
      return {
        ...state,
        isPlaying: false,
        gameStatus: state.gameStatus === 'playing' ? 'paused' : state.gameStatus,
      };
    }

    case 'RESUME': {
      if (state.gameStatus === 'ended') return state;
      return {
        ...state,
        isPlaying: true,
        gameStatus: 'playing',
      };
    }

    case 'END_GAME': {
      // If there's an open position, close it first
      if (state.position) {
        const currentCandle = state.allCandleData[state.currentCandleIndex];
        const closedState = closePosition(state, currentCandle.close, currentCandle.time);
        return {
          ...closedState,
          isPlaying: false,
          gameStatus: 'ended',
        };
      }

      return {
        ...state,
        isPlaying: false,
        gameStatus: 'ended',
      };
    }

    case 'RESET': {
      return {
        ...initialState,
        xp: state.xp,
        level: state.level,
      };
    }

    default:
      return state;
  }
}

// Helper function to close position
function closePosition(state: GameState, exitPrice: number, exitTime: number): GameState {
  if (!state.position) return state;

  const { pnl, pnlPercent } = calculatePnL(state.position, exitPrice);

  const closedTrade: CompletedTrade = {
    id: generateTradeId(),
    type: state.position.type,
    entryPrice: state.position.entryPrice,
    exitPrice,
    quantity: state.position.quantity,
    leverage: state.position.leverage,
    pnl,
    pnlPercent,
    entryTime: state.position.entryTime,
    exitTime: exitTime as any,
  };

  const isWin = pnl > 0;
  const newStreak = isWin ? state.currentStreak + 1 : 0;
  const xpEarned = calculateTradeXP(closedTrade, newStreak);
  const newTotalXP = state.xp + xpEarned;

  return {
    ...state,
    position: null,
    balance: state.balance + pnl,
    openPnL: 0,
    trades: [...state.trades, closedTrade],
    totalPnL: state.totalPnL + pnl,
    winCount: isWin ? state.winCount + 1 : state.winCount,
    lossCount: isWin ? state.lossCount : state.lossCount + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(state.maxStreak, newStreak),
    xp: newTotalXP,
    sessionXP: state.sessionXP + xpEarned,
    level: getLevelForXP(newTotalXP),
  };
}

function closePositionAtPrice(state: GameState, exitPrice: number, exitTime: number): CompletedTrade {
  const position = state.position!;
  const { pnl, pnlPercent } = calculatePnL(position, exitPrice);

  return {
    id: generateTradeId(),
    type: position.type,
    entryPrice: position.entryPrice,
    exitPrice,
    quantity: position.quantity,
    leverage: position.leverage,
    pnl,
    pnlPercent,
    entryTime: position.entryTime,
    exitTime: exitTime as any,
  };
}

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);

// Provider
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
