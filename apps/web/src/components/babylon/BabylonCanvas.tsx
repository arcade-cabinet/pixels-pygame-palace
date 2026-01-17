/**
 * Babylon.js canvas component using Reactylon
 * Provides the rendering context for 3D scenes
 */

import { useEffect, type ReactNode } from 'react';
import { Engine } from 'reactylon/web';
import { Scene } from 'reactylon';
import {
  Color3,
  Vector3,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  DefaultRenderingPipeline,
  type Scene as BabylonScene,
} from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';
import { HavokPlugin } from '@babylonjs/core';
import {
  SCENE_COLORS,
  CAMERA_CONFIG,
  LIGHTING_CONFIG,
  PHYSICS_CONFIG,
  POST_PROCESSING_CONFIG,
} from '@/lib/babylon/constants';

export interface BabylonCanvasProps {
  children?: ReactNode;
  enablePhysics?: boolean;
  enablePostProcessing?: boolean;
  onSceneReady?: (scene: BabylonScene) => void;
}

export function BabylonCanvas({
  children,
  enablePhysics = false,
  enablePostProcessing = false,
  onSceneReady,
}: BabylonCanvasProps) {
  const handleSceneReady = async (scene: BabylonScene) => {
    // 1. Scene background
    scene.clearColor = Color3.FromHexString(SCENE_COLORS.sky).toColor4(1);

    // 2. Camera setup
    const camera = new ArcRotateCamera('camera', 0, 0, 10, Vector3.Zero(), scene);
    camera.position = CAMERA_CONFIG.position.clone();
    camera.setTarget(CAMERA_CONFIG.target);
    camera.fov = CAMERA_CONFIG.fov;
    camera.minZ = CAMERA_CONFIG.minZ;
    camera.maxZ = CAMERA_CONFIG.maxZ;
    scene.activeCamera = camera;

    // Attach camera controls to canvas
    const canvas = scene.getEngine().getRenderingCanvas();
    if (canvas) {
      camera.attachControl(canvas, true);
    }

    // 3. Lighting
    const hemisphericLight = new HemisphericLight(
      'hemisphericLight',
      LIGHTING_CONFIG.hemispheric.direction,
      scene,
    );
    hemisphericLight.intensity = LIGHTING_CONFIG.hemispheric.intensity;

    const directionalLight = new DirectionalLight(
      'directionalLight',
      LIGHTING_CONFIG.directional.direction,
      scene,
    );
    directionalLight.position = LIGHTING_CONFIG.directional.position;
    directionalLight.intensity = LIGHTING_CONFIG.directional.intensity;

    // 4. Shadows
    const shadowGenerator = new ShadowGenerator(
      LIGHTING_CONFIG.shadowMapSize,
      directionalLight,
    );
    shadowGenerator.useContactHardeningShadow = true;

    // Store shadow generator for runtime access
    (scene as any).__shadowGenerator = shadowGenerator;

    // 5. Physics (optional)
    if (enablePhysics) {
      try {
        const havokInstance = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);
        scene.enablePhysics(PHYSICS_CONFIG.gravity, havokPlugin);
      } catch (error) {
        console.error('Failed to initialize physics:', error);
      }
    }

    // 6. Post-processing (optional)
    if (enablePostProcessing) {
      const pipeline = new DefaultRenderingPipeline('defaultPipeline', true, scene, [
        camera,
      ]);

      // Bloom
      if (POST_PROCESSING_CONFIG.bloom.enabled) {
        pipeline.bloomEnabled = true;
        pipeline.bloomThreshold = POST_PROCESSING_CONFIG.bloom.threshold;
        pipeline.bloomWeight = POST_PROCESSING_CONFIG.bloom.weight;
        pipeline.bloomKernel = POST_PROCESSING_CONFIG.bloom.kernel;
      }

      // Chromatic aberration
      if (POST_PROCESSING_CONFIG.chromaticAberration.enabled) {
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount =
          POST_PROCESSING_CONFIG.chromaticAberration.aberrationAmount;
      }

      // FXAA anti-aliasing
      if (POST_PROCESSING_CONFIG.fxaa.enabled) {
        pipeline.fxaaEnabled = true;
      }

      // Store pipeline for runtime access
      (scene as any).__renderPipeline = pipeline;
    }

    // 7. Call user callback
    onSceneReady?.(scene);
  };

  return (
    <Engine>
      <Scene onSceneReady={handleSceneReady}>{children}</Scene>
    </Engine>
  );
}
