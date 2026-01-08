import { useState, useCallback, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HomeScreen } from './components/screens/HomeScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { CareerScreen } from './components/screens/CareerScreen';
import { MissionBriefingScreen } from './components/screens/MissionBriefingScreen';
import { ScreenShakeProvider } from './components/effects/ScreenShake';
import { ParticleProvider } from './components/effects/ParticleSystem';
import { WelcomeModal } from './components/tutorial';
import { checkDailyStreak, loadProgress, recordSession, addXP } from './services/storage';
import { submitSession, calculateBaselineMove, syncAchievement } from './services/sync';
import { checkAchievements, type AchievementUnlock } from './services/achievements';
import { initCandleCache } from './services/candle-cache';
import { useGame } from './context/GameContext';
import { fetchHistoricalData } from './services/yahoo-finance';
import {
  isTutorialCompleted,
  markTutorialCompleted,
  TUTORIAL_CONFIG,
} from './data/tutorial-scenarios';
import type { Mission } from './types/career';

type Screen = 'home' | 'game' | 'results' | 'leaderboard' | 'tutorial' | 'career' | 'mission-briefing';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [newAchievements, setNewAchievements] = useState<AchievementUnlock[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionLoading, setMissionLoading] = useState(false);
  const { state, dispatch } = useGame();
  const { user, isAnonymous, refreshProfile } = useAuth();

  // Initialize app on load
  useEffect(() => {
    // Initialize IndexedDB cache for candle data
    initCandleCache()
      .then(() => console.log('📊 Candle cache ready'))
      .catch((err) => console.warn('Failed to init candle cache:', err));

    // Check daily streak
    const { streak, isNewDay } = checkDailyStreak();
    if (isNewDay && streak > 1) {
      console.log(`🔥 Daily streak: ${streak} days!`);
    }

    // Check if first-time user
    if (!isTutorialCompleted()) {
      setShowWelcome(true);
    }
  }, []);

  // Start tutorial with pre-baked data
  const handleStartTutorial = useCallback(() => {
    setShowWelcome(false);
    setIsTutorialMode(true);

    // Load tutorial candle data
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        symbol: TUTORIAL_CONFIG.displaySymbol,
        data: TUTORIAL_CONFIG.candles,
        mysteryMode: false,
        gameMode: 'arcade',
      },
    });

    dispatch({
      type: 'START_GAME',
      payload: { startIndex: TUTORIAL_CONFIG.startIndex },
    });

    setCurrentScreen('tutorial');
  }, [dispatch]);

  // Skip tutorial
  const handleSkipTutorial = useCallback(() => {
    setShowWelcome(false);
    markTutorialCompleted();
    setCurrentScreen('home');
  }, []);

  // Tutorial completed
  const handleTutorialComplete = useCallback(() => {
    setIsTutorialMode(false);
    markTutorialCompleted();
    setCurrentScreen('home');
  }, []);

  const handleStartGame = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  // Career mode handlers
  const handleOpenCareer = useCallback(() => {
    setCurrentScreen('career');
  }, []);

  const handleSelectMission = useCallback((mission: Mission) => {
    setSelectedMission(mission);
    setCurrentScreen('mission-briefing');
  }, []);

  const handleStartMission = useCallback(async () => {
    if (!selectedMission) return;

    setMissionLoading(true);
    try {
      // Fetch historical data for the mission's date range
      const data = await fetchHistoricalData({
        symbol: selectedMission.stockSymbol,
        startDate: selectedMission.startDate,
        endDate: selectedMission.endDate,
        interval: '5m',
      });

      if (data.length < 20) {
        console.error('Not enough historical data');
        return;
      }

      // Load mission data into game context
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          symbol: selectedMission.stockSymbol,
          data,
          mysteryMode: false,
          gameMode: 'career',
          missionId: selectedMission.id,
        },
      });

      dispatch({ type: 'START_GAME', payload: { startIndex: 0 } });
      setCurrentScreen('game');
    } catch (err) {
      console.error('Failed to load mission data:', err);
    } finally {
      setMissionLoading(false);
    }
  }, [selectedMission, dispatch]);

  const handleGameEnd = useCallback(async () => {
    // Record session to localStorage
    const totalPnL = state.balance - state.startingBalance;
    const totalTrades = state.winCount + state.lossCount;
    const winRate = totalTrades > 0 ? (state.winCount / totalTrades) * 100 : 0;
    const grade = getGrade(totalPnL, winRate, state.maxStreak);

    if (totalTrades > 0) {
      recordSession({
        symbol: state.mysteryMode ? 'MYSTERY' : state.symbol,
        pnl: totalPnL,
        trades: totalTrades,
        winRate,
        maxStreak: state.maxStreak,
        grade,
        xpEarned: state.sessionXP || 0,
        duration: 0, // Would need to track session time
      });

      // Add session XP
      if (state.sessionXP) {
        addXP(state.sessionXP);
      }

      // Submit session to cloud if user is authenticated
      if (user && !isAnonymous) {
        // Calculate stock baseline move (buy & hold return)
        const startPrice = state.allCandleData[0]?.close || state.basePrice;
        const endPrice = state.allCandleData[state.currentCandleIndex]?.close || startPrice;
        const baselineMove = calculateBaselineMove(startPrice, endPrice);
        const pnlPercent = (totalPnL / state.startingBalance) * 100;
        const beatMarketDelta = pnlPercent - baselineMove;

        await submitSession(user.id, {
          symbol: state.mysteryMode ? 'MYSTERY' : state.symbol,
          starting_balance: state.startingBalance,
          final_balance: state.balance,
          total_trades: totalTrades,
          wins: state.winCount,
          losses: state.lossCount,
          max_streak: state.maxStreak,
          max_drawdown: state.maxDrawdown,
          grade: grade as 'S' | 'A' | 'B' | 'C' | 'D' | 'F',
          xp_earned: state.sessionXP || 0,
          pnl_percent: pnlPercent,
          stock_baseline_move: baselineMove,
          beat_market_delta: beatMarketDelta,
          mystery_mode: state.mysteryMode,
          leverage_used: state.leverage,
          duration_seconds: 0, // Would need to track session time
        });

        // Refresh profile to get updated stats
        await refreshProfile();
      }

      // Check for new achievements
      const progress = loadProgress();
      const unlocked = checkAchievements({
        totalTrades: progress.totalTrades,
        totalSessions: progress.totalSessions,
        sessionTrades: totalTrades,
        sessionPnL: totalPnL,
        currentStreak: state.currentStreak,
        maxStreak: state.maxStreak,
        winRate,
        maxDrawdown: state.maxDrawdown,
        totalProfit: progress.totalProfit,
        dailyStreak: progress.dailyStreak,
        leverage: state.leverage,
        isMysteryMode: state.mysteryMode,
      });

      if (unlocked.length > 0) {
        setNewAchievements(unlocked);

        // Sync new achievements to cloud
        if (user && !isAnonymous) {
          for (const unlock of unlocked) {
            await syncAchievement(user.id, unlock.achievement.id);
          }
        }
      }
    }

    setCurrentScreen('results');
  }, [state, user, isAnonymous, refreshProfile]);

  const handlePlayAgain = useCallback(() => {
    setNewAchievements([]);
    // Dispatch START_GAME to reset game state with same data
    dispatch({ type: 'START_GAME' });
    setCurrentScreen('game');
  }, [dispatch]);

  const handleBackToHome = useCallback(() => {
    setNewAchievements([]);
    setCurrentScreen('home');
  }, []);

  const handleOpenLeaderboard = useCallback(() => {
    setCurrentScreen('leaderboard');
  }, []);

  // Render welcome modal for first-time users
  if (showWelcome) {
    return (
      <WelcomeModal
        onStartTutorial={handleStartTutorial}
        onSkipTutorial={handleSkipTutorial}
      />
    );
  }

  switch (currentScreen) {
    case 'home':
      return (
        <HomeScreen
          onStartGame={handleStartGame}
          onOpenLeaderboard={handleOpenLeaderboard}
          onOpenCareer={handleOpenCareer}
        />
      );
    case 'leaderboard':
      return <LeaderboardScreen onBack={handleBackToHome} />;
    case 'career':
      return (
        <CareerScreen
          onSelectMission={handleSelectMission}
          onBack={handleBackToHome}
        />
      );
    case 'mission-briefing':
      return selectedMission ? (
        <MissionBriefingScreen
          mission={selectedMission}
          onStart={handleStartMission}
          onBack={() => setCurrentScreen('career')}
          isLoading={missionLoading}
        />
      ) : (
        <CareerScreen
          onSelectMission={handleSelectMission}
          onBack={handleBackToHome}
        />
      );
    case 'game':
      return (
        <GameScreen
          onGameEnd={handleGameEnd}
          onBackToHome={handleBackToHome}
        />
      );
    case 'tutorial':
      return (
        <GameScreen
          onGameEnd={handleTutorialComplete}
          onBackToHome={handleTutorialComplete}
          isTutorial={true}
        />
      );
    case 'results':
      return (
        <ResultsScreen
          onPlayAgain={handlePlayAgain}
          onBackToHome={handleBackToHome}
          newAchievements={newAchievements}
        />
      );
    default:
      return <HomeScreen onStartGame={handleStartGame} />;
  }
}

/**
 * Calculate session grade based on performance.
 */
function getGrade(pnl: number, winRate: number, maxStreak: number): string {
  let score = 0;

  // PnL scoring
  if (pnl >= 5000) score += 40;
  else if (pnl >= 2000) score += 35;
  else if (pnl >= 1000) score += 30;
  else if (pnl >= 500) score += 25;
  else if (pnl >= 100) score += 20;
  else if (pnl >= 0) score += 10;
  else if (pnl >= -500) score += 5;
  else score += 0;

  // Win rate scoring
  if (winRate >= 80) score += 30;
  else if (winRate >= 60) score += 25;
  else if (winRate >= 50) score += 20;
  else if (winRate >= 40) score += 15;
  else score += 10;

  // Streak scoring
  if (maxStreak >= 10) score += 30;
  else if (maxStreak >= 7) score += 25;
  else if (maxStreak >= 5) score += 20;
  else if (maxStreak >= 3) score += 15;
  else score += 10;

  // Convert to grade
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 45) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <ScreenShakeProvider>
          <ParticleProvider maxParticles={100}>
            <AppContent />
          </ParticleProvider>
        </ScreenShakeProvider>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
