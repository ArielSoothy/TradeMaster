import { motion, useAnimation } from 'framer-motion';
import { type ReactNode, createContext, useContext, useCallback, useState } from 'react';

interface ShakeConfig {
  intensity: number;  // Pixels of shake
  duration: number;   // Seconds
  type: 'profit' | 'loss' | 'neutral';
}

interface ScreenShakeContextType {
  shake: (config?: Partial<ShakeConfig>) => void;
  shakeOnProfit: (pnl: number) => void;
  shakeOnLoss: (pnl: number) => void;
}

const ScreenShakeContext = createContext<ScreenShakeContextType | null>(null);

/**
 * Hook to trigger screen shake effects from anywhere in the app.
 */
export function useScreenShake() {
  const context = useContext(ScreenShakeContext);
  if (!context) {
    throw new Error('useScreenShake must be used within a ScreenShakeProvider');
  }
  return context;
}

interface ScreenShakeProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app and enables screen shake effects.
 * Shake intensity scales with P&L size for satisfying feedback.
 */
export function ScreenShakeProvider({ children }: ScreenShakeProviderProps) {
  const controls = useAnimation();
  const [isShaking, setIsShaking] = useState(false);

  const shake = useCallback(async ({
    intensity = 5,
    duration = 0.3,
    type = 'neutral',
  }: Partial<ShakeConfig> = {}) => {
    if (isShaking) return;
    setIsShaking(true);

    // Different shake patterns for different events
    const shakeVariants = {
      profit: {
        // Bouncy, celebratory shake (mainly vertical)
        x: [0, 2, -2, 2, -1, 1, 0],
        y: [0, -intensity, intensity * 0.5, -intensity * 0.3, intensity * 0.2, 0],
        rotate: [0, 1, -1, 0.5, 0],
      },
      loss: {
        // Quick horizontal shake (feels like "no")
        x: [0, -intensity, intensity, -intensity * 0.6, intensity * 0.4, 0],
        y: [0, 1, -1, 0],
        rotate: [0, -0.5, 0.5, 0],
      },
      neutral: {
        // Generic shake
        x: [0, intensity, -intensity, intensity * 0.5, 0],
        y: [0, intensity * 0.5, -intensity * 0.5, 0],
        rotate: [0, 0.5, -0.5, 0],
      },
    };

    await controls.start({
      ...shakeVariants[type],
      transition: {
        duration,
        ease: 'easeOut',
      },
    });

    // Reset position
    await controls.start({
      x: 0,
      y: 0,
      rotate: 0,
      transition: { duration: 0.1 },
    });

    setIsShaking(false);
  }, [controls, isShaking]);

  // Calculate shake intensity based on P&L
  const getIntensityFromPnL = useCallback((pnl: number): number => {
    const absPnL = Math.abs(pnl);
    if (absPnL < 10) return 2;      // Tiny change
    if (absPnL < 50) return 4;      // Small change
    if (absPnL < 200) return 6;     // Medium change
    if (absPnL < 500) return 10;    // Big change
    return 15;                       // Huge change!
  }, []);

  const shakeOnProfit = useCallback((pnl: number) => {
    shake({
      intensity: getIntensityFromPnL(pnl),
      duration: 0.3,
      type: 'profit',
    });
  }, [shake, getIntensityFromPnL]);

  const shakeOnLoss = useCallback((pnl: number) => {
    shake({
      intensity: getIntensityFromPnL(pnl) * 0.7, // Losses shake less (less punishing)
      duration: 0.2,
      type: 'loss',
    });
  }, [shake, getIntensityFromPnL]);

  return (
    <ScreenShakeContext.Provider value={{ shake, shakeOnProfit, shakeOnLoss }}>
      <motion.div
        animate={controls}
        style={{
          width: '100%',
          height: '100%',
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </ScreenShakeContext.Provider>
  );
}

/**
 * Simple shake wrapper for individual components.
 * Use this for localized shakes (e.g., buttons, cards).
 */
interface ShakeWrapperProps {
  children: ReactNode;
  trigger: boolean;
  intensity?: number;
  className?: string;
}

export function ShakeWrapper({
  children,
  trigger,
  intensity = 3,
  className = '',
}: ShakeWrapperProps) {
  return (
    <motion.div
      className={className}
      animate={trigger ? {
        x: [0, -intensity, intensity, -intensity * 0.5, intensity * 0.5, 0],
        transition: { duration: 0.3 },
      } : {}}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pulse effect for attention-grabbing elements.
 */
interface PulseWrapperProps {
  children: ReactNode;
  active: boolean;
  color?: string;
  className?: string;
}

export function PulseWrapper({
  children,
  active,
  color = 'rgba(34, 197, 94, 0.5)',
  className = '',
}: PulseWrapperProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={active ? {
        scale: [1, 1.02, 1],
      } : {}}
      transition={{
        duration: 0.5,
        repeat: active ? Infinity : 0,
        repeatType: 'reverse',
      }}
    >
      {/* Pulse ring effect */}
      {active && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{ backgroundColor: color }}
          animate={{
            opacity: [0.5, 0],
            scale: [1, 1.1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
