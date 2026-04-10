/**
 * Input handling hook for keyboard and pointer events
 * Based on sky-hats keyboard/pointer control patterns
 */

import { useEffect, useRef, useCallback } from 'react';
import { useScene } from 'reactylon';
import type { Vector3, PickingInfo } from '@babylonjs/core';

export interface KeyboardState {
  /**
   * Set of currently pressed key codes
   */
  keys: Set<string>;
  /**
   * Check if a specific key is pressed
   */
  isPressed: (keyCode: string) => boolean;
}

export interface PointerState {
  /**
   * Current pointer position in screen coordinates
   */
  position: { x: number; y: number } | null;
  /**
   * Whether pointer is currently down
   */
  isDown: boolean;
  /**
   * Get world position from pointer ray
   */
  getWorldPosition: () => Vector3 | null;
  /**
   * Get pick info at pointer position
   */
  pick: () => PickingInfo | null;
}

export interface UseInputOptions {
  /**
   * Whether to enable keyboard input
   */
  enableKeyboard?: boolean;
  /**
   * Whether to enable pointer input
   */
  enablePointer?: boolean;
  /**
   * Callback when pointer clicks on scene
   */
  onPointerClick?: (pickInfo: PickingInfo) => void;
  /**
   * Callback when pointer moves
   */
  onPointerMove?: (pickInfo: PickingInfo) => void;
}

/**
 * Hook for managing keyboard and pointer input
 * Returns state objects for querying input in game loop
 */
export function useInput(options: UseInputOptions = {}) {
  const {
    enableKeyboard = true,
    enablePointer = true,
    onPointerClick,
    onPointerMove,
  } = options;

  const scene = useScene();
  const keysRef = useRef<Set<string>>(new Set());
  const pointerRef = useRef<{
    position: { x: number; y: number } | null;
    isDown: boolean;
  }>({ position: null, isDown: false });

  // Keyboard handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysRef.current.add(event.code);
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysRef.current.delete(event.code);
  }, []);

  // Pointer handlers
  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!scene) return;

      pointerRef.current.isDown = true;
      pointerRef.current.position = { x: event.clientX, y: event.clientY };

      if (onPointerClick) {
        const pickInfo = scene.pick(event.clientX, event.clientY);
        if (pickInfo) {
          onPointerClick(pickInfo);
        }
      }
    },
    [scene, onPointerClick],
  );

  const handlePointerUp = useCallback(() => {
    pointerRef.current.isDown = false;
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!scene) return;

      pointerRef.current.position = { x: event.clientX, y: event.clientY };

      if (onPointerMove) {
        const pickInfo = scene.pick(event.clientX, event.clientY);
        if (pickInfo) {
          onPointerMove(pickInfo);
        }
      }
    },
    [scene, onPointerMove],
  );

  // Setup keyboard listeners
  useEffect(() => {
    if (!enableKeyboard) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysRef.current.clear();
    };
  }, [enableKeyboard, handleKeyDown, handleKeyUp]);

  // Setup pointer listeners
  useEffect(() => {
    if (!enablePointer || !scene) return;

    const canvas = scene.getEngine().getRenderingCanvas();
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown as EventListener);
    canvas.addEventListener('pointerup', handlePointerUp as EventListener);
    canvas.addEventListener('pointermove', handlePointerMove as EventListener);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown as EventListener);
      canvas.removeEventListener('pointerup', handlePointerUp as EventListener);
      canvas.removeEventListener('pointermove', handlePointerMove as EventListener);
    };
  }, [
    enablePointer,
    scene,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
  ]);

  // Keyboard state API
  const keyboardState: KeyboardState = {
    keys: keysRef.current,
    isPressed: (keyCode: string) => keysRef.current.has(keyCode),
  };

  // Pointer state API
  const pointerState: PointerState = {
    position: pointerRef.current.position,
    isDown: pointerRef.current.isDown,
    getWorldPosition: () => {
      if (!scene || !pointerRef.current.position) return null;

      const pickInfo = scene.pick(
        pointerRef.current.position.x,
        pointerRef.current.position.y,
      );
      return pickInfo?.hit ? pickInfo.pickedPoint : null;
    },
    pick: () => {
      if (!scene || !pointerRef.current.position) return null;

      return scene.pick(
        pointerRef.current.position.x,
        pointerRef.current.position.y,
      );
    },
  };

  return {
    keyboard: keyboardState,
    pointer: pointerState,
  };
}
