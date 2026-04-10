/**
 * Babylon.js scene configuration constants
 * Based on arcade-cabinet patterns from sky-hats and other projects
 */

import { Vector3 } from '@babylonjs/core';

// Scene colors
export const SCENE_COLORS = {
  sky: '#87CEEB', // Light blue sky
  ground: '#228B22', // Forest green
  ambient: '#FFFFFF',
} as const;

// Camera configuration
export const CAMERA_CONFIG = {
  position: new Vector3(0, 10, -20),
  target: new Vector3(0, 0, 0),
  fov: Math.PI / 3, // 60 degrees
  minZ: 0.1,
  maxZ: 1000,
} as const;

// Lighting configuration
export const LIGHTING_CONFIG = {
  hemispheric: {
    direction: new Vector3(0, 1, 0),
    intensity: 0.6,
  },
  directional: {
    direction: new Vector3(-1, -2, -1),
    position: new Vector3(20, 40, 20),
    intensity: 0.8,
  },
  shadowMapSize: 2048,
} as const;

// Physics configuration
export const PHYSICS_CONFIG = {
  gravity: new Vector3(0, -9.81, 0),
} as const;

// Post-processing configuration
export const POST_PROCESSING_CONFIG = {
  bloom: {
    enabled: true,
    threshold: 0.8,
    weight: 0.3,
    kernel: 64,
  },
  chromaticAberration: {
    enabled: false,
    aberrationAmount: 5,
  },
  fxaa: {
    enabled: true,
  },
} as const;

// Performance configuration
export const PERFORMANCE_CONFIG = {
  targetFPS: 60,
  maxDeltaTime: 0.1, // Cap delta at 100ms to prevent physics issues
} as const;
