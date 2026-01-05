import { useCallback, useState, useEffect } from 'react';

/**
 * Haptic feedback patterns for different game events.
 */
export type HapticPattern =
  | 'light'       // Subtle tap
  | 'medium'      // Standard click
  | 'heavy'       // Strong feedback
  | 'success'     // Short-long-short (profit)
  | 'error'       // Short-short (loss)
  | 'warning'     // Long-short
  | 'selection'   // Quick double tap
  | 'impact'      // Single strong pulse
  | 'notification' // Attention getter
  | 'levelUp';    // Celebratory pattern

/**
 * Vibration durations in milliseconds.
 */
const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [20, 50, 50, 50, 20],    // Short-pause-long-pause-short
  error: [30, 30, 30],               // Short-short-short
  warning: [50, 30, 20],             // Long-short
  selection: [10, 20, 10],           // Quick double
  impact: 50,                        // Single strong
  notification: [30, 50, 30, 50, 30], // Attention pattern
  levelUp: [20, 30, 40, 50, 60, 70, 80, 40, 20], // Escalating celebration
};

/**
 * Check if haptic feedback is supported.
 */
function isHapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Hook for haptic feedback on mobile devices.
 * Provides satisfying tactile responses to game events.
 */
export function useHaptics() {
  const [enabled, setEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  // Check support on mount
  useEffect(() => {
    setIsSupported(isHapticsSupported());
  }, []);

  /**
   * Trigger a haptic pattern.
   */
  const vibrate = useCallback((pattern: HapticPattern) => {
    if (!enabled || !isSupported) return false;

    try {
      const vibrationPattern = PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
      return true;
    } catch {
      return false;
    }
  }, [enabled, isSupported]);

  /**
   * Cancel any ongoing vibration.
   */
  const cancel = useCallback(() => {
    if (!isSupported) return;
    navigator.vibrate(0);
  }, [isSupported]);

  /**
   * Light tap for button hover/focus.
   */
  const tapLight = useCallback(() => vibrate('light'), [vibrate]);

  /**
   * Medium tap for button press.
   */
  const tapMedium = useCallback(() => vibrate('medium'), [vibrate]);

  /**
   * Heavy tap for important actions.
   */
  const tapHeavy = useCallback(() => vibrate('heavy'), [vibrate]);

  /**
   * Success pattern for profitable trades.
   */
  const success = useCallback(() => vibrate('success'), [vibrate]);

  /**
   * Error pattern for losing trades.
   */
  const error = useCallback(() => vibrate('error'), [vibrate]);

  /**
   * Impact for buy/sell execution.
   */
  const impact = useCallback(() => vibrate('impact'), [vibrate]);

  /**
   * Selection feedback for toggles/options.
   */
  const selection = useCallback(() => vibrate('selection'), [vibrate]);

  /**
   * Level up celebration.
   */
  const levelUp = useCallback(() => vibrate('levelUp'), [vibrate]);

  /**
   * Haptic feedback scaled to P&L size.
   */
  const profitFeedback = useCallback((pnl: number) => {
    const absPnL = Math.abs(pnl);

    if (pnl > 0) {
      // Profit - success pattern, intensity based on amount
      if (absPnL >= 500) {
        vibrate('levelUp'); // Big celebration for huge profit
      } else if (absPnL >= 200) {
        vibrate('success');
      } else if (absPnL >= 50) {
        vibrate('medium');
      } else {
        vibrate('light');
      }
    } else {
      // Loss - gentle error feedback (not punishing)
      if (absPnL >= 200) {
        vibrate('error');
      } else {
        vibrate('light');
      }
    }
  }, [vibrate]);

  /**
   * Streak milestone haptic.
   */
  const streakFeedback = useCallback((streak: number) => {
    if (streak >= 10) {
      vibrate('levelUp');
    } else if (streak >= 5) {
      vibrate('success');
    } else if (streak >= 3) {
      vibrate('medium');
    } else if (streak >= 2) {
      vibrate('selection');
    }
  }, [vibrate]);

  return {
    // State
    enabled,
    setEnabled,
    isSupported,

    // Raw vibrate
    vibrate,
    cancel,

    // Convenience methods
    tapLight,
    tapMedium,
    tapHeavy,
    success,
    error,
    impact,
    selection,
    levelUp,

    // Game-specific
    profitFeedback,
    streakFeedback,
  };
}

/**
 * Higher-order component props for haptic feedback.
 */
export interface WithHapticsProps {
  hapticOnPress?: HapticPattern;
  hapticOnHover?: HapticPattern;
  hapticEnabled?: boolean;
}

/**
 * Custom vibration pattern builder.
 * Use for complex custom patterns.
 */
export function buildPattern(
  segments: Array<{ vibrate: number; pause: number }>
): number[] {
  const pattern: number[] = [];

  segments.forEach((segment, i) => {
    pattern.push(segment.vibrate);
    if (i < segments.length - 1) {
      pattern.push(segment.pause);
    }
  });

  return pattern;
}

/**
 * Utility to add haptic to any element via data attributes.
 * Add data-haptic="pattern" to enable.
 */
export function setupGlobalHaptics(): () => void {
  if (!isHapticsSupported()) return () => {};

  const handler = (e: Event) => {
    const target = e.target as HTMLElement;
    const pattern = target.dataset?.haptic as HapticPattern | undefined;

    if (pattern && PATTERNS[pattern]) {
      navigator.vibrate(PATTERNS[pattern]);
    }
  };

  document.addEventListener('touchstart', handler);
  document.addEventListener('click', handler);

  return () => {
    document.removeEventListener('touchstart', handler);
    document.removeEventListener('click', handler);
  };
}
