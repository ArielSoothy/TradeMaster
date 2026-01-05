import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StreakFlameProps {
  streak: number;
  /** Position: 'inline' next to number, 'badge' as larger standalone */
  variant?: 'inline' | 'badge' | 'large';
  /** Show even when streak is 0 */
  showWhenZero?: boolean;
  className?: string;
}

/**
 * Animated fire effect for win streaks.
 * Intensity increases with streak count.
 */
export function StreakFlame({
  streak,
  variant = 'inline',
  showWhenZero = false,
  className = '',
}: StreakFlameProps) {
  const shouldShow = streak > 0 || showWhenZero;

  if (!shouldShow) return null;

  // Intensity based on streak
  const intensity = Math.min(streak / 10, 1); // 0-1 scale, maxes at 10 streak
  const flameCount = Math.min(streak, 5); // Up to 5 flame layers

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={`relative inline-flex items-center justify-center ${className}`}
        >
          {variant === 'inline' && (
            <InlineFlame streak={streak} intensity={intensity} flameCount={flameCount} />
          )}
          {variant === 'badge' && (
            <BadgeFlame streak={streak} intensity={intensity} flameCount={flameCount} />
          )}
          {variant === 'large' && (
            <LargeFlame streak={streak} intensity={intensity} flameCount={flameCount} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Small inline flame next to streak number.
 */
function InlineFlame({
  streak,
  intensity,
}: {
  streak: number;
  intensity: number;
  flameCount: number;
}) {
  return (
    <motion.span
      className="text-lg relative"
      animate={{
        scale: [1, 1.1, 1],
        filter: [
          `brightness(${1 + intensity * 0.3})`,
          `brightness(${1 + intensity * 0.5})`,
          `brightness(${1 + intensity * 0.3})`,
        ],
      }}
      transition={{
        duration: 0.5 + (1 - intensity) * 0.3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {streak >= 10 ? '🔥' : streak >= 5 ? '🔥' : '🔥'}
      {/* Extra flames for high streaks */}
      {streak >= 5 && (
        <motion.span
          className="absolute -top-1 -right-1 text-xs"
          animate={{ y: [0, -2, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          🔥
        </motion.span>
      )}
    </motion.span>
  );
}

/**
 * Badge-style flame with count.
 */
function BadgeFlame({
  streak,
  intensity,
}: {
  streak: number;
  intensity: number;
  flameCount: number;
}) {
  return (
    <motion.div
      className="relative px-3 py-1 rounded-full flex items-center gap-1.5"
      style={{
        background: `linear-gradient(135deg,
          rgba(251, 191, 36, ${0.2 + intensity * 0.3}),
          rgba(249, 115, 22, ${0.2 + intensity * 0.3}),
          rgba(239, 68, 68, ${0.15 + intensity * 0.2}))`,
        boxShadow: `0 0 ${10 + intensity * 20}px rgba(249, 115, 22, ${0.3 + intensity * 0.4})`,
      }}
      animate={{
        boxShadow: [
          `0 0 ${10 + intensity * 20}px rgba(249, 115, 22, ${0.3 + intensity * 0.3})`,
          `0 0 ${15 + intensity * 25}px rgba(249, 115, 22, ${0.4 + intensity * 0.4})`,
          `0 0 ${10 + intensity * 20}px rgba(249, 115, 22, ${0.3 + intensity * 0.3})`,
        ],
      }}
      transition={{ duration: 0.8, repeat: Infinity }}
    >
      <FlameIcon size={18} intensity={intensity} />
      <span
        className="font-bold text-sm"
        style={{
          color: `rgb(${255}, ${200 - intensity * 50}, ${100 - intensity * 50})`,
          textShadow: `0 0 ${5 + intensity * 10}px rgba(251, 191, 36, 0.8)`,
        }}
      >
        {streak}x
      </span>
    </motion.div>
  );
}

/**
 * Large celebration flame for big streaks.
 */
function LargeFlame({
  streak,
  intensity,
  flameCount,
}: {
  streak: number;
  intensity: number;
  flameCount: number;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Multiple layered flames */}
      <div className="relative h-24 w-20 flex items-end justify-center">
        {Array.from({ length: flameCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{
              zIndex: flameCount - i,
              transformOrigin: 'bottom center',
            }}
            animate={{
              scaleY: [0.9, 1.1, 0.9],
              scaleX: [1, 0.95, 1],
              rotate: [(i - 2) * 5, (i - 2) * -5, (i - 2) * 5],
            }}
            transition={{
              duration: 0.3 + i * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.05,
            }}
          >
            <FlameIcon
              size={60 - i * 8}
              intensity={intensity}
              hue={i * 10} // Slight color variation
            />
          </motion.div>
        ))}
      </div>

      {/* Streak count */}
      <motion.div
        className="mt-2 px-4 py-1 rounded-full bg-orange-500/20 backdrop-blur-sm"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <span
          className="font-black text-2xl"
          style={{
            background: 'linear-gradient(180deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
          }}
        >
          {streak}x STREAK!
        </span>
      </motion.div>
    </div>
  );
}

/**
 * SVG flame icon with animated gradient.
 */
function FlameIcon({
  size = 24,
  intensity = 0.5,
  hue = 0,
}: {
  size?: number;
  intensity?: number;
  hue?: number;
}) {
  const [gradientId] = useState(() => `flame-gradient-${Math.random().toString(36).slice(2)}`);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      animate={{
        filter: [
          `drop-shadow(0 0 ${3 + intensity * 5}px rgba(251, 191, 36, 0.8))`,
          `drop-shadow(0 0 ${5 + intensity * 8}px rgba(249, 115, 22, 0.9))`,
          `drop-shadow(0 0 ${3 + intensity * 5}px rgba(251, 191, 36, 0.8))`,
        ],
      }}
      transition={{ duration: 0.4, repeat: Infinity }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={`hsl(${20 + hue}, 90%, 50%)`} />
          <stop offset="30%" stopColor={`hsl(${30 + hue}, 95%, 55%)`} />
          <stop offset="60%" stopColor={`hsl(${40 + hue}, 100%, 60%)`} />
          <stop offset="100%" stopColor={`hsl(${50 + hue}, 100%, 70%)`} />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 9 6 9 10C9 12 10.5 13.5 12 14C13.5 13.5 15 12 15 10C15 6 12 2 12 2Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M8 12C8 12 6 14 6 17C6 19.5 8.5 21 12 21C15.5 21 18 19.5 18 17C18 14 16 12 16 12C16 14 14 16 12 16C10 16 8 14 8 12Z"
        fill={`url(#${gradientId})`}
        opacity={0.8}
      />
    </motion.svg>
  );
}

/**
 * Streak announcement overlay for milestone streaks.
 */
interface StreakAnnouncementProps {
  streak: number;
  isVisible: boolean;
  onComplete?: () => void;
}

export function StreakAnnouncement({ streak, isVisible, onComplete }: StreakAnnouncementProps) {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const getMessage = () => {
    if (streak >= 20) return "UNSTOPPABLE!";
    if (streak >= 10) return "LEGENDARY!";
    if (streak >= 5) return "ON FIRE!";
    if (streak >= 3) return "HOT STREAK!";
    return "NICE!";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <StreakFlame streak={streak} variant="large" />

            {/* Announcement text */}
            <motion.div
              className="text-center mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span
                className="font-black text-4xl tracking-wider"
                style={{
                  background: 'linear-gradient(180deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(249, 115, 22, 0.6)',
                }}
              >
                {getMessage()}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
