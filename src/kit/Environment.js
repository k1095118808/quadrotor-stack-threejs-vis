import * as THREE from 'three';
import { theme } from './theme.js';

// createEnvironment({ theme, grid, fog, floor, sceneSize })
// Builds a scene preset every animation starts from. Dark background, subtle
// fog, grid floor — the visual anchor that tells viewers "this is a 3D scene."
// Call addLights() to attach the standard three-point-ish lighting rig.
export function createEnvironment({
  theme: mode = 'dark',
  grid = true,
  fog = true,
  floor = true,
  sceneSize = 60,
} = {}) {
  const scene = new THREE.Scene();
  const disposables = [];

  const bgHex = mode === 'studio' ? 0x101317 : theme.colors.bg;
  scene.background = new THREE.Color(bgHex);
  if (fog) scene.fog = new THREE.Fog(bgHex, 25, 70);

  if (floor) {
    const floorGeo = new THREE.PlaneGeometry(sceneSize, sceneSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: bgHex,
      roughness: 1,
      metalness: 0,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = false;
    scene.add(floorMesh);
    disposables.push(floorGeo, floorMat);
  }

  if (grid) {
    const divisions = Math.round(sceneSize);
    const gridHelper = new THREE.GridHelper(
      sceneSize,
      divisions,
      theme.colors.grid,
      theme.colors.grid,
    );
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    gridHelper.position.y = 0.001; // avoid z-fighting with the floor
    scene.add(gridHelper);
    disposables.push(gridHelper.geometry, gridHelper.material);
  }

  function addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(8, 14, 10);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x88aaff, 0.25);
    fill.position.set(-10, 6, -4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xff88aa, 0.18);
    rim.position.set(0, 4, -12);
    scene.add(rim);
  }

  function dispose() {
    for (const d of disposables) d.dispose();
    scene.traverse((obj) => {
      if (obj.isLight && obj.dispose) obj.dispose();
    });
  }

  return { scene, addLights, dispose };
}
