import { useEffect, useCallback } from 'react';

interface KeyboardControlsOptions {
  onBuy: () => void;
  onSell: () => void;
  onTogglePlay: () => void;
  enabled?: boolean;
}

/**
 * Keyboard controls for trading
 * B = Buy, S = Sell, Space = Pause/Play
 */
export function useKeyboardControls({
  onBuy,
  onSell,
  onTogglePlay,
  enabled = true,
}: KeyboardControlsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          onBuy();
          break;
        case 's':
          event.preventDefault();
          onSell();
          break;
        case ' ':
          event.preventDefault();
          onTogglePlay();
          break;
      }
    },
    [onBuy, onSell, onTogglePlay, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
