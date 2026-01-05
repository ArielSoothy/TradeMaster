import { useCallback, useRef, useState, useEffect } from 'react';

type SoundName = 'buy' | 'sell' | 'profit' | 'loss' | 'levelup';

// Sound URLs - using simple tones generated with Web Audio API
const SOUNDS: Record<SoundName, { frequency: number; duration: number; type: OscillatorType }> = {
  buy: { frequency: 800, duration: 0.1, type: 'sine' },
  sell: { frequency: 600, duration: 0.1, type: 'sine' },
  profit: { frequency: 1000, duration: 0.15, type: 'sine' },
  loss: { frequency: 300, duration: 0.2, type: 'sine' },
  levelup: { frequency: 880, duration: 0.3, type: 'triangle' },
};

/**
 * Simple sound hook using Web Audio API
 */
export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playSound = useCallback((sound: SoundName) => {
    if (!enabled) return;

    const ctx = audioContextRef.current;
    if (!ctx) return;

    const config = SOUNDS[sound];
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = config.type;
    oscillator.frequency.value = config.frequency;

    // Fade out for smoother sound
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  }, [enabled]);

  const playProfit = useCallback(() => {
    playSound('profit');
  }, [playSound]);

  const playLoss = useCallback(() => {
    playSound('loss');
  }, [playSound]);

  return {
    playSound,
    playProfit,
    playLoss,
    enabled,
    setEnabled,
  };
}
