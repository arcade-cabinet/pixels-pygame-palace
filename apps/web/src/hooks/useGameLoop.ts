/**
 * Game loop hook for frame-based updates
 * Based on sky-hats pattern with requestAnimationFrame
 */

import { useEffect, useRef } from 'react';
import { PERFORMANCE_CONFIG } from '@/lib/babylon/constants';

export interface GameLoopCallbacks {
  /**
   * Called every frame with delta time in seconds
   */
  onUpdate?: (deltaTime: number) => void;
  /**
   * Called at fixed physics timestep (optional)
   */
  onFixedUpdate?: (deltaTime: number) => void;
}

export interface UseGameLoopOptions extends GameLoopCallbacks {
  /**
   * Whether the game loop is active
   */
  enabled?: boolean;
  /**
   * Fixed timestep for physics updates (in seconds)
   * If not provided, onFixedUpdate won't be called
   */
  fixedDeltaTime?: number;
}

/**
 * Custom hook for managing the game loop with delta time
 * Provides both variable frame updates and optional fixed timestep physics
 */
export function useGameLoop(options: UseGameLoopOptions = {}) {
  const { enabled = true, onUpdate, onFixedUpdate, fixedDeltaTime } = options;

  const lastTimeRef = useRef<number>(performance.now());
  const accumulatorRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const gameLoop = () => {
      const now = performance.now();
      let delta = (now - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = now;

      // Cap delta time to prevent spiral of death
      delta = Math.min(delta, PERFORMANCE_CONFIG.maxDeltaTime);

      // Variable timestep update
      if (onUpdate) {
        onUpdate(delta);
      }

      // Fixed timestep update (for physics)
      if (onFixedUpdate && fixedDeltaTime) {
        accumulatorRef.current += delta;

        while (accumulatorRef.current >= fixedDeltaTime) {
          onFixedUpdate(fixedDeltaTime);
          accumulatorRef.current -= fixedDeltaTime;
        }
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the loop
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, onUpdate, onFixedUpdate, fixedDeltaTime]);

  /**
   * Manually stop the game loop
   */
  const stop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  /**
   * Manually restart the game loop
   */
  const start = () => {
    if (rafRef.current === null && enabled) {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(() => {
        /* loop will continue */
      });
    }
  };

  return { stop, start };
}
