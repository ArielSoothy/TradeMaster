import { useState, useCallback } from 'react';
import { GameProvider } from './context/GameContext';
import { HomeScreen } from './components/screens/HomeScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';

type Screen = 'home' | 'game' | 'results';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const handleStartGame = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  const handleGameEnd = useCallback(() => {
    setCurrentScreen('results');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  const handleBackToHome = useCallback(() => {
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
        />
      );
    default:
      return <HomeScreen onStartGame={handleStartGame} />;
  }
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
