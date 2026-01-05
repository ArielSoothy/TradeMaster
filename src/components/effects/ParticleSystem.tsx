import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Particle types for different effects.
 */
type ParticleType = 'confetti' | 'coin' | 'spark' | 'money' | 'star';

interface Particle {
  id: number;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  opacity: number;
  lifetime: number;
  age: number;
}

interface ParticleConfig {
  type: ParticleType;
  count: number;
  x?: number; // Default: center
  y?: number; // Default: center
  spread?: number; // Spread radius
  speed?: number; // Initial velocity
  gravity?: number;
  colors?: string[];
  size?: number;
  lifetime?: number; // ms
}

interface ParticleContextType {
  emit: (config: ParticleConfig) => void;
  emitProfit: (pnl: number, x?: number, y?: number) => void;
  emitLoss: (x?: number, y?: number) => void;
  emitStreak: (streak: number) => void;
  emitLevelUp: () => void;
  emitButtonSpark: (x: number, y: number) => void;
}

const ParticleContext = createContext<ParticleContextType | null>(null);

/**
 * Hook to access particle system from anywhere.
 */
export function useParticles() {
  const context = useContext(ParticleContext);
  if (!context) {
    throw new Error('useParticles must be used within a ParticleProvider');
  }
  return context;
}

/**
 * Color palettes for different effects.
 */
const COLORS = {
  confetti: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
  gold: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d'],
  profit: ['#22c55e', '#4ade80', '#86efac', '#fbbf24'],
  loss: ['#ef4444', '#dc2626', '#f87171'],
  fire: ['#f97316', '#fbbf24', '#ef4444', '#f59e0b'],
  star: ['#fbbf24', '#fcd34d', '#fef3c7'],
};

/**
 * Particle shapes as SVG/emoji.
 */
const PARTICLE_SHAPES: Record<ParticleType, string[]> = {
  confetti: ['■', '▲', '●', '◆', '★'],
  coin: ['$', '💰', '🪙'],
  spark: ['✦', '✧', '★'],
  money: ['💵', '💸', '$'],
  star: ['★', '✦', '⭐'],
};

let particleId = 0;

interface ParticleProviderProps {
  children: ReactNode;
  maxParticles?: number;
}

/**
 * Particle system provider - wrap your app with this.
 */
export function ParticleProvider({ children, maxParticles = 100 }: ParticleProviderProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3, // Gravity
            rotation: p.rotation + p.rotationSpeed,
            age: p.age + 16,
            opacity: Math.max(0, 1 - p.age / p.lifetime),
          }))
          .filter((p) => p.age < p.lifetime && p.opacity > 0)
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [particles.length]);

  /**
   * Create a single particle with physics.
   */
  const createParticle = useCallback(
    (type: ParticleType, x: number, y: number, config: Partial<ParticleConfig>): Particle => {
      const spread = config.spread ?? 100;
      const speed = config.speed ?? 8;
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.5 + 0.5) * speed;
      const colors = config.colors ?? COLORS.confetti;

      return {
        id: particleId++,
        type,
        x: x + (Math.random() - 0.5) * spread * 0.3,
        y: y + (Math.random() - 0.5) * spread * 0.3,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 5, // Initial upward burst
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        size: (config.size ?? 20) * (Math.random() * 0.5 + 0.75),
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        lifetime: config.lifetime ?? 1500,
        age: 0,
      };
    },
    []
  );

  /**
   * Emit particles of a given type.
   */
  const emit = useCallback(
    (config: ParticleConfig) => {
      const x = config.x ?? window.innerWidth / 2;
      const y = config.y ?? window.innerHeight / 2;

      const newParticles: Particle[] = [];
      for (let i = 0; i < Math.min(config.count, maxParticles); i++) {
        newParticles.push(createParticle(config.type, x, y, config));
      }

      setParticles((prev) => [...prev, ...newParticles].slice(-maxParticles));
    },
    [createParticle, maxParticles]
  );

  /**
   * Emit profit celebration particles scaled to P&L.
   */
  const emitProfit = useCallback(
    (pnl: number, x?: number, y?: number) => {
      const absPnL = Math.abs(pnl);
      const centerX = x ?? window.innerWidth / 2;
      const centerY = y ?? window.innerHeight / 2;

      if (absPnL >= 500) {
        // HUGE profit - massive celebration!
        emit({
          type: 'money',
          count: 20,
          x: centerX,
          y: centerY,
          spread: 200,
          speed: 12,
          colors: COLORS.gold,
          size: 30,
          lifetime: 2000,
        });
        emit({
          type: 'confetti',
          count: 40,
          x: centerX,
          y: centerY,
          spread: 300,
          speed: 15,
          lifetime: 2500,
        });
        emit({
          type: 'star',
          count: 15,
          x: centerX,
          y: centerY,
          spread: 150,
          speed: 10,
          colors: COLORS.star,
          size: 25,
          lifetime: 2000,
        });
      } else if (absPnL >= 200) {
        // Big profit
        emit({
          type: 'coin',
          count: 15,
          x: centerX,
          y: centerY,
          spread: 150,
          speed: 10,
          colors: COLORS.gold,
          size: 25,
          lifetime: 1800,
        });
        emit({
          type: 'confetti',
          count: 25,
          x: centerX,
          y: centerY,
          spread: 200,
          speed: 12,
          lifetime: 2000,
        });
      } else if (absPnL >= 50) {
        // Medium profit
        emit({
          type: 'coin',
          count: 8,
          x: centerX,
          y: centerY,
          spread: 100,
          speed: 8,
          colors: COLORS.profit,
          size: 22,
          lifetime: 1500,
        });
      } else {
        // Small profit - subtle sparkle
        emit({
          type: 'spark',
          count: 5,
          x: centerX,
          y: centerY,
          spread: 60,
          speed: 5,
          colors: COLORS.profit,
          size: 16,
          lifetime: 1000,
        });
      }
    },
    [emit]
  );

  /**
   * Emit subtle loss particles (not punishing).
   */
  const emitLoss = useCallback(
    (x?: number, y?: number) => {
      const centerX = x ?? window.innerWidth / 2;
      const centerY = y ?? window.innerHeight / 2;

      // Just a few subtle falling particles
      emit({
        type: 'spark',
        count: 3,
        x: centerX,
        y: centerY,
        spread: 40,
        speed: 2,
        colors: COLORS.loss,
        size: 12,
        lifetime: 800,
      });
    },
    [emit]
  );

  /**
   * Emit streak celebration.
   */
  const emitStreak = useCallback(
    (streak: number) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      if (streak >= 10) {
        // Legendary streak!
        emit({
          type: 'star',
          count: 30,
          x: centerX,
          y: centerY,
          spread: 300,
          speed: 15,
          colors: COLORS.fire,
          size: 28,
          lifetime: 2500,
        });
      } else if (streak >= 5) {
        emit({
          type: 'star',
          count: 15,
          x: centerX,
          y: centerY,
          spread: 200,
          speed: 10,
          colors: COLORS.fire,
          size: 24,
          lifetime: 2000,
        });
      } else if (streak >= 3) {
        emit({
          type: 'spark',
          count: 10,
          x: centerX,
          y: centerY,
          spread: 150,
          speed: 8,
          colors: COLORS.fire,
          size: 20,
          lifetime: 1500,
        });
      }
    },
    [emit]
  );

  /**
   * Full-screen level up celebration.
   */
  const emitLevelUp = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Multiple bursts from different positions
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        emit({
          type: 'confetti',
          count: 50,
          x: centerX + (Math.random() - 0.5) * 300,
          y: centerY + (Math.random() - 0.5) * 200,
          spread: 250,
          speed: 18,
          lifetime: 3000,
        });
        emit({
          type: 'star',
          count: 20,
          x: centerX,
          y: centerY,
          spread: 200,
          speed: 12,
          colors: COLORS.gold,
          size: 30,
          lifetime: 2500,
        });
      }, i * 200);
    }
  }, [emit]);

  /**
   * Small spark burst on button press.
   */
  const emitButtonSpark = useCallback(
    (x: number, y: number) => {
      emit({
        type: 'spark',
        count: 6,
        x,
        y,
        spread: 30,
        speed: 4,
        colors: ['#ffffff', '#a5b4fc', '#c4b5fd'],
        size: 10,
        lifetime: 400,
      });
    },
    [emit]
  );

  return (
    <ParticleContext.Provider
      value={{
        emit,
        emitProfit,
        emitLoss,
        emitStreak,
        emitLevelUp,
        emitButtonSpark,
      }}
    >
      {children}

      {/* Particle render layer */}
      <div
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0 }}
              animate={{
                opacity: p.opacity,
                scale: 1,
                x: p.x,
                y: p.y,
                rotate: p.rotation,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                fontSize: p.size,
                color: p.color,
                textShadow: p.type === 'star' ? `0 0 ${p.size / 2}px ${p.color}` : 'none',
                willChange: 'transform, opacity',
              }}
            >
              {PARTICLE_SHAPES[p.type][p.id % PARTICLE_SHAPES[p.type].length]}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ParticleContext.Provider>
  );
}

/**
 * Standalone confetti burst component.
 * Use for simpler cases without the full context.
 */
interface ConfettiBurstProps {
  trigger: boolean;
  x?: number;
  y?: number;
  colors?: string[];
  count?: number;
}

export function ConfettiBurst({
  trigger,
  x = window.innerWidth / 2,
  y = window.innerHeight / 2,
  colors = COLORS.confetti,
  count = 30,
}: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.5 + 0.5) * 10;

      newParticles.push({
        id: Date.now() + i,
        type: 'confetti',
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        size: 15 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        lifetime: 2000,
        age: 0,
      });
    }

    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.4,
            rotation: p.rotation + p.rotationSpeed,
            age: p.age + 16,
            opacity: Math.max(0, 1 - p.age / p.lifetime),
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [trigger, x, y, colors, count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            fontSize: p.size,
            color: p.color,
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {PARTICLE_SHAPES.confetti[p.id % PARTICLE_SHAPES.confetti.length]}
        </div>
      ))}
    </div>
  );
}
