import * as THREE from 'three';
import { theme } from './theme.js';

// createEnvironment({ theme, grid, fog, floor, sceneSize })
// Builds a scene preset every animation starts from. Dark background and
// subtle fog by default; `theme: 'light'` switches to a true-white paper look
// with a repeating text watermark baked into the floor. Chapters that omit
// the `theme` argument pick up whichever mode theme.js resolved at load time,
// so the kit-level toggle flips the whole deck at once.
export function createEnvironment({
  theme: mode = theme.mode,   // 'dark' | 'light' | 'studio'
  grid = true,
  fog = true,
  floor = true,
  sceneSize = 60,
  logoClouds = true,          // light-mode only; set false for tight framings
                              // (e.g. orthographic side-views) where the
                              // drifting sprites would enter frame.
} = {}) {
  const scene = new THREE.Scene();
  const disposables = [];
  const isLight = mode === 'light';

  // bg is true white in light mode; studio is a slightly lifted charcoal.
  const bgHex = isLight
    ? 0xffffff
    : mode === 'studio'
      ? 0x101317
      : theme.colors.bg;
  scene.background = new THREE.Color(bgHex);
  if (fog) {
    // Match fog color to bg so objects fade into it; push the far plane back
    // in light mode — tinted fog on near-white reads as smog rather than air.
    scene.fog = new THREE.Fog(bgHex, isLight ? 30 : 25, isLight ? 95 : 70);
  }

  if (floor) {
    const floorGeo = new THREE.PlaneGeometry(sceneSize, sceneSize);
    let floorMat;
    if (isLight) {
      const tex = makeFloorWatermarkTexture();
      // Sampled straight across the whole floor — no repeat wrapping, because
      // the rotated text pattern inside the canvas is not seam-safe. The tile
      // is large (1024²) and dense enough that one copy covers a 30–60m floor
      // without visible pixelation at camera distance.
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      floorMat = new THREE.MeshBasicMaterial({ map: tex });
      disposables.push(tex);
    } else {
      floorMat = new THREE.MeshStandardMaterial({
        color: bgHex,
        roughness: 1,
        metalness: 0,
      });
    }
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
    // Light mode grid sits on top of the watermark, so a touch more opacity
    // keeps it readable without drowning the text.
    gridHelper.material.opacity = isLight ? 0.5 : 0.35;
    gridHelper.position.y = 0.001; // avoid z-fighting with the floor
    scene.add(gridHelper);
    disposables.push(gridHelper.geometry, gridHelper.material);
  }

  // Light-mode only: a handful of logo "clouds" drifting high above the scene.
  // Dark mode already has a strong mood from fog + particles; adding floating
  // branding there would fight the neon aesthetic.
  if (isLight && logoClouds) {
    const clouds = addLogoClouds(scene, sceneSize);
    disposables.push(clouds.texture, clouds.material);
  }

  function addLights() {
    if (isLight) {
      // Bright theme: flatter, brighter key/fill, no colored rim — the page
      // is meant to read as printed paper, not a lit stage.
      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      const key = new THREE.DirectionalLight(0xffffff, 0.7);
      key.position.set(8, 14, 10);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.4);
      fill.position.set(-10, 6, -4);
      scene.add(fill);
      return;
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
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
    for (const d of disposables) d.dispose?.();
    scene.traverse((obj) => {
      if (obj.isLight && obj.dispose) obj.dispose();
    });
  }

  return { scene, addLights, dispose };
}

// Drifting logo "clouds" for the bright theme. Sprites (billboards) stay
// facing the camera, so the logo reads whatever angle the orbit lands on.
// Animation is driven by onBeforeRender — no update() callback to plumb
// through chapters, and no requestAnimationFrame loop owned by Environment.js.
function addLogoClouds(scene, sceneSize) {
  const loader = new THREE.TextureLoader();
  const tex = loader.load('/src/assets/logo1.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const material = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0.55,        // cloud-like wash, not a hard logo
    depthWrite: false,
    depthTest: true,
  });

  const group = new THREE.Group();
  group.name = 'logoClouds';

  const COUNT      = 7;
  const LOGO_AR    = 900 / 275; // native aspect; corrected on image load
  const BASE_H     = 2.4;
  // Chapter cameras sit around y = 6–9 looking at y ≈ 0–3, so anything above
  // ~y=14 falls off the top of a 48–55° FOV frustum. Keep the clouds low
  // enough to stay in frame at default framing.
  const BASE_Y     = 6;
  const Y_SPREAD   = 6;
  const R_MIN      = sceneSize * 0.30;
  const R_SPREAD   = sceneSize * 0.22;

  const cloudMeta = [];
  for (let i = 0; i < COUNT; i++) {
    const sprite = new THREE.Sprite(material);
    const baseAngle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.4;
    const radius    = R_MIN + Math.random() * R_SPREAD;
    const y0        = BASE_Y + Math.random() * Y_SPREAD;
    const heightScale = BASE_H * (0.75 + Math.random() * 0.55);
    sprite.scale.set(heightScale * LOGO_AR, heightScale, 1);
    sprite.position.set(
      Math.cos(baseAngle) * radius,
      y0,
      Math.sin(baseAngle) * radius,
    );
    group.add(sprite);
    cloudMeta.push({
      sprite,
      baseAngle,
      radius,
      y0,
      driftSpeed: 0.010 + Math.random() * 0.012, // rad/s around the scene
      bobAmp:     0.6  + Math.random() * 0.9,
      bobSpeed:   0.25 + Math.random() * 0.35,
      bobPhase:   Math.random() * Math.PI * 2,
    });
  }

  // Correct horizontal scale once the real image dimensions are known (the
  // preset LOGO_AR is a best guess until the decode finishes).
  const img = tex.image;
  const applyAspect = () => {
    if (!tex.image) return;
    const ar = tex.image.width / tex.image.height;
    for (const c of cloudMeta) c.sprite.scale.x = c.sprite.scale.y * ar;
  };
  if (img && img.width) applyAspect();
  else tex.addEventListener?.('load', applyAspect);

  // Per-frame drift. onBeforeRender fires whenever the renderer visits the
  // group, regardless of which camera/scene hosts it.
  group.onBeforeRender = () => {
    const t = performance.now() * 0.001;
    for (const c of cloudMeta) {
      const a = c.baseAngle + t * c.driftSpeed;
      c.sprite.position.x = Math.cos(a) * c.radius;
      c.sprite.position.z = Math.sin(a) * c.radius;
      c.sprite.position.y = c.y0 + Math.sin(t * c.bobSpeed + c.bobPhase) * c.bobAmp;
    }
  };

  scene.add(group);
  return { group, texture: tex, material };
}

// Builds a 1024² canvas of faint, rotated "NKU-ISAN-LAB" copies and returns
// it as a CanvasTexture. Kept inside Environment.js since nothing else needs
// it; if more chapters want a watermark layer we can promote it to the kit.
function makeFloorWatermarkTexture() {
  const SIZE = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.save();
  // Rotate the whole pattern ~15° so the grid lines don't align with the
  // watermark baseline — makes both layers easier to read.
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.rotate(-Math.PI / 12);

  // Deeper purple-pink accent. Alpha tuned so the text reads from eye height
  // without overpowering the grid or the drone on top of it.
  ctx.fillStyle = 'rgba(135, 55, 175, 0.26)';
  ctx.font = '500 44px "JetBrains Mono", monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const TEXT     = 'NKU-ISAN-LAB';
  // Measure the text so adjacent copies don't abut — without the gap the
  // repeat reads as one run-on "...LABNKU..." string.
  const textWidth = ctx.measureText(TEXT).width;
  const GAP      = 110;
  const ROW_STEP = 96;
  const COL_STEP = textWidth + GAP;
  const EXTENT   = SIZE; // extend past the canvas so rotation doesn't leave gaps

  for (let y = -EXTENT; y <= EXTENT; y += ROW_STEP) {
    const rowIdx = Math.round((y + EXTENT) / ROW_STEP);
    const xOffset = (rowIdx % 2 === 0) ? 0 : COL_STEP / 2;
    for (let x = -EXTENT + xOffset; x <= EXTENT; x += COL_STEP) {
      ctx.fillText(TEXT, x, y);
    }
  }
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}
