import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TUTORIAL_STEPS,
  markTutorialCompleted,
  type TutorialStep,
} from '../../data/tutorial-scenarios';

interface TutorialOverlayProps {
  currentStepIndex: number;
  onAdvance: () => void;
  onSkip: () => void;
  onComplete: () => void;
  hasPosition: boolean;
  pnl: number;
}

export function TutorialOverlay({
  currentStepIndex,
  onAdvance,
  onSkip,
  onComplete,
  hasPosition,
  pnl,
}: TutorialOverlayProps) {
  const [showSkip, setShowSkip] = useState(false);
  const [step, setStep] = useState<TutorialStep | null>(null);

  useEffect(() => {
    if (currentStepIndex < TUTORIAL_STEPS.length) {
      setStep(TUTORIAL_STEPS[currentStepIndex]);
    } else {
      setStep(null);
      markTutorialCompleted();
      onComplete();
    }
  }, [currentStepIndex, onComplete]);

  // Show skip button after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance for certain steps
  useEffect(() => {
    if (!step) return;

    // If step requires 'buy' and user has position, advance
    if (step.action === 'buy' && hasPosition) {
      const timer = setTimeout(onAdvance, 500);
      return () => clearTimeout(timer);
    }

    // If step requires 'sell' and user closed position with profit, advance
    if (step.action === 'sell' && !hasPosition && pnl > 0) {
      const timer = setTimeout(onAdvance, 500);
      return () => clearTimeout(timer);
    }

    // If step has wait action, auto advance after delay
    if (step.action === 'wait' && step.delay) {
      const timer = setTimeout(onAdvance, step.delay);
      return () => clearTimeout(timer);
    }
  }, [step, hasPosition, pnl, onAdvance]);

  const handleSkip = useCallback(() => {
    markTutorialCompleted();
    onSkip();
  }, [onSkip]);

  if (!step) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Semi-transparent overlay - only for center positioned steps */}
        {step.position === 'center' && (
          <div className="absolute inset-0 bg-black/70 pointer-events-auto" />
        )}

        {/* Tutorial card */}
        <motion.div
          initial={{ opacity: 0, y: step.position === 'bottom' ? 50 : -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: (step.delay || 0) / 1000 }}
          className={`
            absolute left-4 right-4 pointer-events-auto
            ${step.position === 'top' ? 'top-24' : ''}
            ${step.position === 'bottom' ? 'bottom-32' : ''}
            ${step.position === 'center' ? 'top-1/2 -translate-y-1/2' : ''}
          `}
        >
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 shadow-2xl">
            {/* Hand pointer for action steps */}
            {step.action && step.action !== 'wait' && (
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl"
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                👆
              </motion.div>
            )}

            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-white/90 text-sm leading-relaxed">{step.message}</p>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4">
              {/* Skip button */}
              <AnimatePresence>
                {showSkip && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleSkip}
                    className="text-white/60 text-sm hover:text-white"
                  >
                    Skip Tutorial
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Continue/Action button */}
              {!step.action || step.action === 'wait' ? (
                <motion.button
                  onClick={onAdvance}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-xl ml-auto"
                  whileTap={{ scale: 0.95 }}
                >
                  Continue
                </motion.button>
              ) : (
                <div className="text-white/60 text-sm ml-auto">
                  {step.action === 'buy' && 'Tap BUY below'}
                  {step.action === 'sell' && 'Tap SELL below'}
                </div>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-4">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStepIndex
                      ? 'bg-white'
                      : i < currentStepIndex
                      ? 'bg-white/60'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Highlight pulse effect for buttons */}
        {step.highlightElement && (
          <style>{`
            ${step.highlightElement} {
              animation: tutorial-pulse 1.5s ease-in-out infinite;
              position: relative;
              z-index: 60;
            }
            @keyframes tutorial-pulse {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
              }
              50% {
                box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
              }
            }
          `}</style>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Simple hand pointer component for highlighting
export function HandPointer({ direction = 'down' }: { direction?: 'up' | 'down' | 'left' | 'right' }) {
  const emoji = {
    up: '👆',
    down: '👇',
    left: '👈',
    right: '👉',
  };

  return (
    <motion.span
      animate={{
        x: direction === 'left' ? [-5, 5, -5] : direction === 'right' ? [5, -5, 5] : 0,
        y: direction === 'up' ? [-5, 5, -5] : direction === 'down' ? [5, -5, 5] : 0,
      }}
      transition={{ duration: 1, repeat: Infinity }}
      className="text-3xl"
    >
      {emoji[direction]}
    </motion.span>
  );
}

// Welcome modal for first-time users
export function WelcomeModal({
  onStartTutorial,
  onSkipTutorial,
}: {
  onStartTutorial: () => void;
  onSkipTutorial: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/10"
      >
        <div className="text-center mb-6">
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📈
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to TradeMaster!
          </h2>
          <p className="text-gray-400">
            Learn to trade with real market data. No risk, all skill.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-white/80">
            <span className="text-green-400">✓</span>
            <span>Based on real historical data</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <span className="text-green-400">✓</span>
            <span>Practice without real money</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <span className="text-green-400">✓</span>
            <span>Track your progress & improve</span>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            onClick={onStartTutorial}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Tutorial (30 sec)
          </motion.button>
          <button
            onClick={onSkipTutorial}
            className="w-full py-3 text-gray-400 hover:text-white text-sm"
          >
            I know how to trade, skip →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
