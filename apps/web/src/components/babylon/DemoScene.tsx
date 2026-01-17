/**
 * Demo scene component for testing Babylon.js setup
 * Creates a simple ground plane and cube
 */

import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  type Mesh,
  type Scene as BabylonScene,
} from '@babylonjs/core';

/**
 * Creates a simple demo scene with ground and a cube
 */
export function DemoScene() {
  const scene = useScene();
  const groundRef = useRef<Mesh | null>(null);
  const cubeRef = useRef<Mesh | null>(null);

  useEffect(() => {
    if (!scene) return;

    // Create ground
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 20, height: 20 },
      scene,
    );
    const groundMaterial = new StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = Color3.FromHexString('#228B22'); // Forest green
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    groundRef.current = ground;

    // Create cube
    const cube = MeshBuilder.CreateBox('cube', { size: 2 }, scene);
    cube.position.y = 1; // Hover above ground
    const cubeMaterial = new StandardMaterial('cubeMaterial', scene);
    cubeMaterial.diffuseColor = Color3.FromHexString('#FF6347'); // Tomato red
    cube.material = cubeMaterial;
    cubeRef.current = cube;

    // Add cube to shadow casters
    const shadowGenerator = (scene as any).__shadowGenerator;
    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(cube);
    }

    // Cleanup
    return () => {
      groundMaterial.dispose();
      ground.dispose();
      cubeMaterial.dispose();
      cube.dispose();
      groundRef.current = null;
      cubeRef.current = null;
    };
  }, [scene]);

  // Animate cube rotation
  useEffect(() => {
    if (!scene || !cubeRef.current) return;

    const cube = cubeRef.current;
    let animationFrame: number;

    const animate = () => {
      cube.rotation.y += 0.01;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [scene]);

  return null; // Reactylon components don't render JSX
}
