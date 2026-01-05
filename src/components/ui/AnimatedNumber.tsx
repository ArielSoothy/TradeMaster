import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  /** Format as currency with $ prefix */
  currency?: boolean;
  /** Show +/- prefix for changes */
  showSign?: boolean;
  /** Number of decimal places (default 2) */
  decimals?: number;
  /** Animation duration in seconds (default 0.5) */
  duration?: number;
  /** CSS className */
  className?: string;
  /** Color based on value (positive=green, negative=red) */
  colorCode?: boolean;
  /** Compact format for large numbers (1.2K, 1.5M) */
  compact?: boolean;
  /** Callback when value changes (for triggering effects) */
  onChange?: (newValue: number, oldValue: number) => void;
}

/**
 * Animated number component with slot-machine style rolling effect.
 * Uses spring physics for smooth, satisfying animations.
 */
export function AnimatedNumber({
  value,
  currency = false,
  showSign = false,
  decimals = 2,
  duration = 0.5,
  className = '',
  colorCode = false,
  compact = false,
  onChange,
}: AnimatedNumberProps) {
  const prevValue = useRef(value);

  // Spring animation for smooth number changes
  // Adjust stiffness based on duration (shorter duration = stiffer spring)
  const spring = useSpring(value, {
    stiffness: Math.max(50, 200 / duration),
    damping: 30,
    mass: 1,
  });

  // Update spring when value changes
  useEffect(() => {
    const oldVal = prevValue.current;
    spring.set(value);

    if (onChange && value !== oldVal) {
      onChange(value, oldVal);
    }
    prevValue.current = value;
  }, [value, spring, onChange]);

  // Format the animated value
  const displayValue = useTransform(spring, (latest) => {
    let formatted: string;

    if (compact && Math.abs(latest) >= 1000) {
      if (Math.abs(latest) >= 1000000) {
        formatted = (latest / 1000000).toFixed(1) + 'M';
      } else {
        formatted = (latest / 1000).toFixed(1) + 'K';
      }
    } else {
      formatted = latest.toFixed(decimals);
    }

    // Add currency prefix
    if (currency) {
      formatted = '$' + formatted.replace('-$', '-$').replace('$-', '-$');
      // Fix double negative issue
      if (latest < 0 && !formatted.startsWith('-')) {
        formatted = '-' + formatted;
      }
      if (latest < 0) {
        formatted = '-$' + Math.abs(latest).toFixed(decimals);
        if (compact && Math.abs(latest) >= 1000) {
          if (Math.abs(latest) >= 1000000) {
            formatted = '-$' + (Math.abs(latest) / 1000000).toFixed(1) + 'M';
          } else {
            formatted = '-$' + (Math.abs(latest) / 1000).toFixed(1) + 'K';
          }
        }
      }
    }

    // Add + prefix for positive values
    if (showSign && latest > 0) {
      formatted = '+' + formatted;
    }

    return formatted;
  });

  // Determine color class
  const getColorClass = () => {
    if (!colorCode) return '';
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <motion.span
      className={`tabular-nums ${getColorClass()} ${className}`}
      animate={{
        scale: [1, value !== prevValue.current ? 1.05 : 1, 1],
      }}
      transition={{ duration: 0.2 }}
    >
      <motion.span>{displayValue}</motion.span>
    </motion.span>
  );
}

/**
 * Specialized animated currency display with enhanced effects.
 * Shows flash animation on big changes.
 */
export function AnimatedCurrency({
  value,
  showSign = false,
  className = '',
  colorCode = true,
  threshold = 100, // Flash if change is >= this amount
}: AnimatedNumberProps & { threshold?: number }) {
  const prevValue = useRef(value);
  const [flash, setFlash] = useState<'profit' | 'loss' | null>(null);

  useEffect(() => {
    const diff = value - prevValue.current;
    if (Math.abs(diff) >= threshold) {
      setFlash(diff > 0 ? 'profit' : 'loss');
      setTimeout(() => setFlash(null), 300);
    }
    prevValue.current = value;
  }, [value, threshold]);

  return (
    <motion.div
      className={`relative inline-flex ${className}`}
      animate={flash ? {
        scale: [1, 1.1, 1],
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Flash glow effect */}
      {flash && (
        <motion.div
          className={`absolute inset-0 rounded-lg ${
            flash === 'profit' ? 'bg-green-500/30' : 'bg-red-500/30'
          }`}
          initial={{ opacity: 1, scale: 1.2 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <AnimatedNumber
        value={value}
        currency
        showSign={showSign}
        colorCode={colorCode}
        decimals={2}
      />
    </motion.div>
  );
}

/**
 * Animated counter that counts up from 0 to target.
 * Perfect for results screens.
 */
export function CountUpNumber({
  value,
  duration = 1,
  currency = false,
  className = '',
  decimals = 0,
  delay = 0,
}: AnimatedNumberProps & { delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) {
        startTime.current = timestamp + delay * 1000;
      }

      const elapsed = timestamp - startTime.current;
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(value * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startTime.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration, delay]);

  const formatted = currency
    ? `$${displayValue.toFixed(decimals)}`
    : displayValue.toFixed(decimals);

  return (
    <span className={`tabular-nums ${className}`}>
      {formatted}
    </span>
  );
}
