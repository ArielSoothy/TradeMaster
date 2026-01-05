import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Swipe direction for trade actions.
 */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Swipe detection configuration.
 */
interface SwipeConfig {
  /** Minimum distance in pixels to trigger swipe (default: 50) */
  threshold?: number;
  /** Maximum time in ms for swipe gesture (default: 500) */
  maxTime?: number;
  /** Callback when swipe up is detected (BUY) */
  onSwipeUp?: () => void;
  /** Callback when swipe down is detected (SELL) */
  onSwipeDown?: () => void;
  /** Callback for any swipe direction */
  onSwipe?: (direction: SwipeDirection) => void;
  /** Enable/disable swipe detection */
  enabled?: boolean;
  /** Element ref to attach listeners to (default: window) */
  elementRef?: React.RefObject<HTMLElement>;
}

/**
 * Swipe state for visual feedback.
 */
interface SwipeState {
  isSwipping: boolean;
  direction: SwipeDirection | null;
  progress: number; // 0-1 scale of swipe completion
  startY: number;
  currentY: number;
  deltaY: number;
}

/**
 * Hook for swipe gesture detection.
 * Optimized for trading game: swipe up = buy, swipe down = sell.
 */
export function useSwipeControls({
  threshold = 50,
  maxTime = 500,
  onSwipeUp,
  onSwipeDown,
  onSwipe,
  enabled = true,
  elementRef,
}: SwipeConfig = {}) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwipping: false,
    direction: null,
    progress: 0,
    startY: 0,
    currentY: 0,
    deltaY: 0,
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  /**
   * Handle touch start.
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setSwipeState((prev) => ({
      ...prev,
      isSwipping: true,
      startY: touch.clientY,
      currentY: touch.clientY,
      deltaY: 0,
      direction: null,
      progress: 0,
    }));
  }, [enabled]);

  /**
   * Handle touch move for visual feedback.
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaY = touchStartRef.current.y - touch.clientY;
    const progress = Math.min(Math.abs(deltaY) / threshold, 1);

    // Determine direction during swipe
    let direction: SwipeDirection | null = null;
    if (Math.abs(deltaY) > 10) {
      direction = deltaY > 0 ? 'up' : 'down';
    }

    setSwipeState((prev) => ({
      ...prev,
      currentY: touch.clientY,
      deltaY,
      direction,
      progress,
    }));
  }, [enabled, threshold]);

  /**
   * Handle touch end - detect and trigger swipe.
   */
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touchStartRef.current.y - touch.clientY; // Inverted for natural feel
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Reset state
    setSwipeState({
      isSwipping: false,
      direction: null,
      progress: 0,
      startY: 0,
      currentY: 0,
      deltaY: 0,
    });

    // Check if swipe is valid
    if (deltaTime > maxTime) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine swipe direction (prioritize vertical for trading)
    if (absY > absX && absY > threshold) {
      // Vertical swipe
      const direction: SwipeDirection = deltaY > 0 ? 'up' : 'down';
      onSwipe?.(direction);

      if (direction === 'up') {
        onSwipeUp?.();
      } else if (direction === 'down') {
        onSwipeDown?.();
      }
    } else if (absX > absY && absX > threshold) {
      // Horizontal swipe (for potential future features)
      const direction: SwipeDirection = deltaX > 0 ? 'right' : 'left';
      onSwipe?.(direction);
    }

    touchStartRef.current = null;
  }, [enabled, threshold, maxTime, onSwipe, onSwipeUp, onSwipeDown]);

  /**
   * Handle touch cancel.
   */
  const handleTouchCancel = useCallback(() => {
    touchStartRef.current = null;
    setSwipeState({
      isSwipping: false,
      direction: null,
      progress: 0,
      startY: 0,
      currentY: 0,
      deltaY: 0,
    });
  }, []);

  // Attach event listeners
  useEffect(() => {
    const element = elementRef?.current ?? window;

    if (enabled) {
      element.addEventListener('touchstart', handleTouchStart as EventListener);
      element.addEventListener('touchmove', handleTouchMove as EventListener);
      element.addEventListener('touchend', handleTouchEnd as EventListener);
      element.addEventListener('touchcancel', handleTouchCancel as EventListener);
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as EventListener);
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
      element.removeEventListener('touchend', handleTouchEnd as EventListener);
      element.removeEventListener('touchcancel', handleTouchCancel as EventListener);
    };
  }, [enabled, elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return {
    /** Current swipe state for visual feedback */
    swipeState,
    /** Whether a swipe is in progress */
    isSwipping: swipeState.isSwipping,
    /** Current swipe direction (null if not swipping) */
    direction: swipeState.direction,
    /** Progress toward threshold (0-1) */
    progress: swipeState.progress,
    /** Y-axis delta during swipe */
    deltaY: swipeState.deltaY,
  };
}

/**
 * Visual swipe indicator component props.
 */
export interface SwipeIndicatorProps {
  direction: SwipeDirection | null;
  progress: number;
  isSwipping: boolean;
}

/**
 * Check if device supports touch.
 */
export function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - msMaxTouchPoints is IE-specific
      navigator.msMaxTouchPoints > 0)
  );
}

/**
 * Hook to detect if running on mobile device.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'mobile'];
      const isMobileUA = mobileKeywords.some((keyword) => userAgent.includes(keyword));
      const isTouchScreen = isTouchDevice();
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isMobileUA || (isTouchScreen && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Double-tap detection hook.
 */
export function useDoubleTap(
  callback: () => void,
  delay: number = 300
): { handleTap: () => void } {
  const lastTapRef = useRef<number>(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < delay) {
      callback();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [callback, delay]);

  return { handleTap };
}

/**
 * Long press detection hook.
 */
export function useLongPress(
  callback: () => void,
  duration: number = 500
): {
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
} {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    timerRef.current = setTimeout(callback, duration);
  }, [callback, duration]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: clear,
  };
}
