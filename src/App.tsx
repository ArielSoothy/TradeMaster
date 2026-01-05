import { useState, useCallback, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { HomeScreen } from './components/screens/HomeScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { ScreenShakeProvider } from './components/effects/ScreenShake';
import { ParticleProvider } from './components/effects/ParticleSystem';
import { checkDailyStreak, loadProgress, recordSession, addXP } from './services/storage';
import { checkAchievements, type AchievementUnlock } from './services/achievements';
import { useGame } from './context/GameContext';

type Screen = 'home' | 'game' | 'results';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [newAchievements, setNewAchievements] = useState<AchievementUnlock[]>([]);
  const { state } = useGame();

  // Check daily streak on app load
  useEffect(() => {
    const { streak, isNewDay } = checkDailyStreak();
    if (isNewDay && streak > 1) {
      console.log(`🔥 Daily streak: ${streak} days!`);
    }
  }, []);

  const handleStartGame = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  const handleGameEnd = useCallback(() => {
    // Record session to localStorage
    const totalPnL = state.balance - state.startingBalance;
    const totalTrades = state.winCount + state.lossCount;
    const winRate = totalTrades > 0 ? (state.winCount / totalTrades) * 100 : 0;

    if (totalTrades > 0) {
      recordSession({
        symbol: state.mysteryMode ? 'MYSTERY' : state.symbol,
        pnl: totalPnL,
        trades: totalTrades,
        winRate,
        maxStreak: state.maxStreak,
        grade: getGrade(totalPnL, winRate, state.maxStreak),
        xpEarned: state.sessionXP || 0,
        duration: 0, // Would need to track session time
      });

      // Add session XP
      if (state.sessionXP) {
        addXP(state.sessionXP);
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
      }
    }

    setCurrentScreen('results');
  }, [state]);

  const handlePlayAgain = useCallback(() => {
    setNewAchievements([]);
    setCurrentScreen('game');
  }, []);

  const handleBackToHome = useCallback(() => {
    setNewAchievements([]);
    setCurrentScreen('home');
  }, []);

  switch (currentScreen) {
    case 'home':
      return <HomeScreen onStartGame={handleStartGame} />;
    case 'game':
      return (
        <GameScreen
          onGameEnd={handleGameEnd}
          onBackToHome={handleBackToHome}
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
    <GameProvider>
      <ScreenShakeProvider>
        <ParticleProvider maxParticles={100}>
          <AppContent />
        </ParticleProvider>
      </ScreenShakeProvider>
    </GameProvider>
  );
}

export default App;
