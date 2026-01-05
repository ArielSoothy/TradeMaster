import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Extended sound types for rich audio feedback.
 * Each sound is carefully designed for maximum satisfaction.
 */
export type SoundName =
  // Actions
  | 'buy'
  | 'sell'
  | 'buttonClick'
  | 'buttonHover'
  // Trade results
  | 'profitSmall'
  | 'profitMedium'
  | 'profitBig'
  | 'profitHuge'
  | 'loss'
  // Streaks
  | 'streak2'
  | 'streak3'
  | 'streak5'
  | 'streak10'
  | 'streakBreak'
  // Progression
  | 'xpTick'
  | 'xpChunk'
  | 'levelUp'
  | 'achievement'
  // UI
  | 'menuOpen'
  | 'menuClose'
  | 'countdown'
  | 'sessionStart'
  | 'sessionEnd'
  // Alerts
  | 'warning'
  | 'error';

interface SoundConfig {
  frequencies: number[];    // Multiple frequencies for complex sounds
  durations: number[];      // Duration for each frequency
  types: OscillatorType[];  // Oscillator type for each tone
  volumes: number[];        // Volume for each tone
  delays: number[];         // Delay before each tone starts
  fadeOut?: number;         // Fade out duration
}

/**
 * Sound configurations - synthesized for retro-game feel.
 * Each sound uses multiple layered tones for richness.
 */
const SOUNDS: Record<SoundName, SoundConfig> = {
  // === ACTIONS ===
  buy: {
    // Rising "pop" - feels like making a move
    frequencies: [440, 660, 880],
    durations: [0.05, 0.05, 0.08],
    types: ['sine', 'sine', 'triangle'],
    volumes: [0.2, 0.15, 0.1],
    delays: [0, 0.02, 0.04],
    fadeOut: 0.1,
  },
  sell: {
    // Falling "pop" - closing position feel
    frequencies: [660, 440, 330],
    durations: [0.05, 0.05, 0.08],
    types: ['sine', 'sine', 'triangle'],
    volumes: [0.2, 0.15, 0.1],
    delays: [0, 0.02, 0.04],
    fadeOut: 0.1,
  },
  buttonClick: {
    // Soft click
    frequencies: [600],
    durations: [0.03],
    types: ['sine'],
    volumes: [0.1],
    delays: [0],
  },
  buttonHover: {
    // Very subtle tick
    frequencies: [800],
    durations: [0.02],
    types: ['sine'],
    volumes: [0.05],
    delays: [0],
  },

  // === PROFIT SOUNDS (increasingly exciting) ===
  profitSmall: {
    // Single coin clink ($10-$50)
    frequencies: [1200, 1500],
    durations: [0.08, 0.12],
    types: ['sine', 'sine'],
    volumes: [0.15, 0.1],
    delays: [0, 0.02],
    fadeOut: 0.15,
  },
  profitMedium: {
    // Double coin clink ($50-$200)
    frequencies: [1000, 1300, 1500, 1800],
    durations: [0.08, 0.08, 0.1, 0.12],
    types: ['sine', 'sine', 'sine', 'triangle'],
    volumes: [0.15, 0.12, 0.15, 0.08],
    delays: [0, 0.05, 0.1, 0.12],
    fadeOut: 0.2,
  },
  profitBig: {
    // Cash register "cha-ching" ($200-$500)
    frequencies: [800, 1000, 1200, 1500, 1800, 2000],
    durations: [0.05, 0.05, 0.06, 0.08, 0.1, 0.15],
    types: ['sine', 'sine', 'sine', 'triangle', 'triangle', 'sine'],
    volumes: [0.2, 0.18, 0.2, 0.15, 0.12, 0.1],
    delays: [0, 0.03, 0.06, 0.1, 0.15, 0.18],
    fadeOut: 0.25,
  },
  profitHuge: {
    // Slot machine jackpot ($500+)
    frequencies: [600, 800, 1000, 1200, 1400, 1600, 1800, 2000],
    durations: [0.1, 0.1, 0.1, 0.1, 0.12, 0.12, 0.15, 0.2],
    types: ['sine', 'sine', 'triangle', 'sine', 'triangle', 'sine', 'triangle', 'sine'],
    volumes: [0.2, 0.2, 0.18, 0.2, 0.18, 0.2, 0.15, 0.12],
    delays: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
    fadeOut: 0.3,
  },
  loss: {
    // Soft thud (not punishing)
    frequencies: [200, 150],
    durations: [0.1, 0.15],
    types: ['sine', 'sine'],
    volumes: [0.12, 0.08],
    delays: [0, 0.02],
    fadeOut: 0.15,
  },

  // === STREAKS ===
  streak2: {
    // Double ding
    frequencies: [880, 1100],
    durations: [0.1, 0.15],
    types: ['sine', 'sine'],
    volumes: [0.2, 0.18],
    delays: [0, 0.1],
  },
  streak3: {
    // Triple ding with whoosh
    frequencies: [880, 1100, 1320],
    durations: [0.08, 0.1, 0.15],
    types: ['sine', 'sine', 'triangle'],
    volumes: [0.18, 0.2, 0.22],
    delays: [0, 0.08, 0.16],
  },
  streak5: {
    // Exciting fanfare
    frequencies: [660, 880, 1100, 1320, 1760],
    durations: [0.08, 0.08, 0.1, 0.12, 0.2],
    types: ['sine', 'sine', 'triangle', 'sine', 'triangle'],
    volumes: [0.15, 0.18, 0.2, 0.22, 0.25],
    delays: [0, 0.05, 0.1, 0.15, 0.22],
    fadeOut: 0.3,
  },
  streak10: {
    // Epic achievement fanfare
    frequencies: [440, 550, 660, 880, 1100, 1320, 1650, 2200],
    durations: [0.1, 0.1, 0.1, 0.12, 0.12, 0.15, 0.18, 0.25],
    types: ['sine', 'triangle', 'sine', 'triangle', 'sine', 'triangle', 'sine', 'triangle'],
    volumes: [0.2, 0.2, 0.22, 0.22, 0.25, 0.25, 0.2, 0.15],
    delays: [0, 0.06, 0.12, 0.18, 0.25, 0.32, 0.4, 0.5],
    fadeOut: 0.4,
  },
  streakBreak: {
    // Gentle deflate
    frequencies: [400, 300, 200],
    durations: [0.1, 0.12, 0.15],
    types: ['sine', 'sine', 'sine'],
    volumes: [0.1, 0.08, 0.05],
    delays: [0, 0.08, 0.16],
    fadeOut: 0.2,
  },

  // === PROGRESSION ===
  xpTick: {
    // Very soft blip (for each XP point)
    frequencies: [1400],
    durations: [0.02],
    types: ['sine'],
    volumes: [0.03],
    delays: [0],
  },
  xpChunk: {
    // Chunky XP gain
    frequencies: [800, 1000, 1200],
    durations: [0.04, 0.04, 0.06],
    types: ['sine', 'sine', 'triangle'],
    volumes: [0.08, 0.1, 0.08],
    delays: [0, 0.02, 0.04],
  },
  levelUp: {
    // Triumphant fanfare
    frequencies: [523, 659, 784, 1047, 1319, 1568],
    durations: [0.15, 0.15, 0.15, 0.2, 0.25, 0.4],
    types: ['triangle', 'triangle', 'triangle', 'sine', 'sine', 'sine'],
    volumes: [0.2, 0.22, 0.25, 0.28, 0.25, 0.2],
    delays: [0, 0.12, 0.24, 0.36, 0.5, 0.65],
    fadeOut: 0.5,
  },
  achievement: {
    // Badge unlock chime
    frequencies: [880, 1100, 1320, 1760],
    durations: [0.1, 0.1, 0.12, 0.2],
    types: ['sine', 'triangle', 'sine', 'triangle'],
    volumes: [0.18, 0.2, 0.22, 0.15],
    delays: [0, 0.1, 0.2, 0.35],
    fadeOut: 0.3,
  },

  // === UI SOUNDS ===
  menuOpen: {
    // Whoosh up
    frequencies: [300, 500, 700],
    durations: [0.05, 0.05, 0.08],
    types: ['sine', 'sine', 'sine'],
    volumes: [0.08, 0.1, 0.06],
    delays: [0, 0.02, 0.04],
  },
  menuClose: {
    // Whoosh down
    frequencies: [700, 500, 300],
    durations: [0.05, 0.05, 0.08],
    types: ['sine', 'sine', 'sine'],
    volumes: [0.08, 0.1, 0.06],
    delays: [0, 0.02, 0.04],
  },
  countdown: {
    // Tick for last candles
    frequencies: [600, 800],
    durations: [0.05, 0.05],
    types: ['sine', 'sine'],
    volumes: [0.1, 0.08],
    delays: [0, 0.02],
  },
  sessionStart: {
    // Game start sound
    frequencies: [440, 550, 660, 880],
    durations: [0.1, 0.1, 0.1, 0.2],
    types: ['sine', 'sine', 'triangle', 'sine'],
    volumes: [0.15, 0.18, 0.2, 0.15],
    delays: [0, 0.08, 0.16, 0.28],
  },
  sessionEnd: {
    // Game over sound (neutral)
    frequencies: [660, 550, 440, 330],
    durations: [0.12, 0.12, 0.15, 0.25],
    types: ['sine', 'sine', 'sine', 'triangle'],
    volumes: [0.15, 0.12, 0.1, 0.08],
    delays: [0, 0.1, 0.2, 0.32],
    fadeOut: 0.3,
  },

  // === ALERTS ===
  warning: {
    // Attention getter
    frequencies: [800, 600, 800],
    durations: [0.08, 0.08, 0.1],
    types: ['triangle', 'triangle', 'triangle'],
    volumes: [0.15, 0.12, 0.15],
    delays: [0, 0.1, 0.2],
  },
  error: {
    // Error/rejection
    frequencies: [300, 200],
    durations: [0.15, 0.2],
    types: ['sawtooth', 'sawtooth'],
    volumes: [0.1, 0.08],
    delays: [0, 0.12],
  },
};

/**
 * Rich sound hook with synthesized Web Audio.
 * Provides satisfying feedback for all game events.
 */
export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        // Create master gain for volume control
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.value = 0.7; // Master volume
        masterGainRef.current = masterGain;
      }
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    window.addEventListener('touchstart', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  /**
   * Play a single synthesized tone.
   */
  const playTone = useCallback((
    ctx: AudioContext,
    destination: AudioNode,
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay: number,
    fadeOut: number = 0.1
  ) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const startTime = ctx.currentTime + delay;
    const endTime = startTime + duration;

    // Attack
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);

    // Sustain and decay
    gainNode.gain.setValueAtTime(volume, endTime - fadeOut);
    gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

    oscillator.start(startTime);
    oscillator.stop(endTime + 0.01);
  }, []);

  /**
   * Play a named sound effect.
   */
  const playSound = useCallback((sound: SoundName) => {
    if (!enabled) return;

    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const config = SOUNDS[sound];
    const fadeOut = config.fadeOut ?? 0.1;

    // Play all tones in the sound
    config.frequencies.forEach((freq, i) => {
      playTone(
        ctx,
        masterGain,
        freq,
        config.durations[i],
        config.types[i],
        config.volumes[i],
        config.delays[i],
        fadeOut
      );
    });
  }, [enabled, playTone]);

  /**
   * Play profit sound scaled to P&L size.
   */
  const playProfit = useCallback((pnl: number) => {
    const absPnL = Math.abs(pnl);
    if (absPnL >= 500) {
      playSound('profitHuge');
    } else if (absPnL >= 200) {
      playSound('profitBig');
    } else if (absPnL >= 50) {
      playSound('profitMedium');
    } else {
      playSound('profitSmall');
    }
  }, [playSound]);

  /**
   * Play streak sound based on streak count.
   */
  const playStreak = useCallback((streak: number) => {
    if (streak >= 10) {
      playSound('streak10');
    } else if (streak >= 5) {
      playSound('streak5');
    } else if (streak >= 3) {
      playSound('streak3');
    } else if (streak >= 2) {
      playSound('streak2');
    }
  }, [playSound]);

  /**
   * Play loss sound (always the same - not punishing).
   */
  const playLoss = useCallback(() => {
    playSound('loss');
  }, [playSound]);

  /**
   * Set master volume (0-1).
   */
  const setVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    playSound,
    playProfit,
    playLoss,
    playStreak,
    setVolume,
    enabled,
    setEnabled,
  };
}
