# CLAUDE.md

Persistent context for this repo. Claude Code reads this every session. Keep it lean — the full roadmap lives in `PROJECT_PLAN.md`.

## What this project is

A collection of ~25–35 short Three.js animations illustrating the eight chapters of the *四旋翼无人机自主飞行知识手册* (Quadrotor Autonomous Flight Knowledge Manual). Output is a web presentation for **beginners** — research newcomers seeing this material for the first time. Every animation must prioritize clarity over cleverness.

The complete animation inventory, priorities, and per-animation specs live in `PROJECT_PLAN.md`. Read it before starting work on any chapter.

## Language policy

- All user-visible labels, tooltips, captions: **Simplified Chinese**.
- All code, comments, filenames, commit messages, variable names: **English**.
- Single source of truth for Chinese strings: `src/kit/labels.js`. Never hard-code Chinese inside animation files.

## Stack

- **Three.js** — latest (install via `npm i three`). Use ES modules.
- **Vite** — dev server and build.
- **Vanilla JS** — no React, no TypeScript (lower barrier for collaborators who only know basic JS).
- **No external 3D libraries** beyond Three.js and its `examples/jsm/*` utilities (OrbitControls, GLTFLoader, etc.).
- **Fonts**: `Noto Sans SC` for Chinese labels, `JetBrains Mono` for HUD monospace, both loaded from Google Fonts in the HTML head.

## Repo layout

```
drone-autonomy-viz/
├── CLAUDE.md                  ← you are here
├── PROJECT_PLAN.md            ← full roadmap, specs, priorities
├── package.json
├── vite.config.js
├── index.html                 ← dev gallery: links to every animation
├── src/
│   ├── kit/                   ← shared building blocks (see API below)
│   │   ├── Quadrotor.js
│   │   ├── Environment.js
│   │   ├── Trajectory.js
│   │   ├── Sensors.js
│   │   ├── Hud.js
│   │   ├── CameraRig.js
│   │   ├── labels.js
│   │   └── theme.js
│   └── chapters/
│       ├── ch01-overview/
│       │   ├── 01-stack.html
│       │   ├── 02-frequency.html
│       │   └── 03-coupling.html
│       ├── ch02-hardware/
│       └── … ch03–ch08
└── public/
    └── assets/                ← models, textures, (optional) icons
```

One animation = one HTML file with an inline `<script type="module">`. Each file opens standalone in the browser via the Vite dev server.

## Shared kit API (authoritative)

Every animation MUST compose these. Do not re-implement a quadrotor, trajectory, HUD, or camera rig inside a chapter file.

### `src/kit/Quadrotor.js`
```js
export function createDrone({
  scale = 1,
  bodyColor = 0x2a2f38,
  accentColor = 0xff3366,
  armLength = 0.55,
  showThrustVector = false,
} = {}) {
  // returns { group: THREE.Group, update(dt), setThrust(0..1), dispose() }
}
```
The returned `update(dt)` spins rotors counter-rotating in pairs. `setThrust` scales the thrust arrow if `showThrustVector` is true.

### `src/kit/Environment.js`
```js
export function createEnvironment({
  theme = 'dark',        // 'dark' | 'studio'
  grid = true,
  fog = true,
  floor = true,
  sceneSize = 60,
} = {}) {
  // returns { scene: THREE.Scene, addLights(), dispose() }
}
```

### `src/kit/Trajectory.js`
```js
export function createPath(waypoints, { closed = true, tension = 0.5 } = {}) {
  // returns { curve: THREE.CatmullRomCurve3, line: THREE.Line, markers: THREE.Group }
}
export function createTrail({ maxPoints = 1500, color = 0xff3366 } = {}) {
  // returns { line: THREE.Line, push(vec3), clear(), dispose() }
}
```

### `src/kit/Sensors.js`
```js
export function createLidar({ numRays = 36, range = 4, fov = 360 } = {}) {
  // returns { group: THREE.Group, cast(origin, quaternion, obstacles), dispose() }
}
export function createFrustum({ fov = 60, aspect = 1.5, near = 0.1, far = 2.5 } = {}) {
  // returns THREE.LineSegments wireframe pyramid
}
```

### `src/kit/Hud.js`
```js
export function createPanel({
  title,                 // Chinese label, from labels.js
  corner,                // 'tl' | 'tr' | 'bl' | 'br'
  color = 'cyan',        // 'green' | 'cyan' | 'amber' | 'magenta' | 'white'
  items = [],            // [{ label, value, unit }]
}) {
  // returns { el: HTMLElement, setValue(key, value), dispose() }
}
export function createChart({ corner, title, yRange, color }) {
  // returns { el, push(value), dispose() }
}
```
HUD panels are DOM elements overlaid on a positioned container — not Three.js objects.

### `src/kit/CameraRig.js`
```js
export function orbitCamera(camera, { target, radius, height, speed }) { }
export function followCamera(camera, target, { offset, lerp }) { }
export function cinematic(camera, keyframes) { }  // array of { time, position, lookAt, easing }
```

### `src/kit/theme.js`
Single export object. Everything visual must pull from here.
```js
export const theme = {
  colors: {
    bg:        0x07090d,
    grid:      0x1a3350,
    perception:0x5dffb1,  // green
    planning:  0x5dd3ff,  // cyan
    control:   0xffb454,  // amber
    executed:  0xff3366,  // magenta
    obstacle:  0x3a4354,
    waypoint:  0x5dd3ff,
  },
  fonts: {
    sans: '"Noto Sans SC", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  hud: {
    bg:     'rgba(7,9,13,0.75)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    radius: '6px',
    pad:    '8px 12px',
  },
};
```

## Animation file template

Every chapter HTML file follows this shape:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>Ch1 · 自主飞行技术栈</title>
  <link rel="stylesheet" href="/src/kit/hud.css">
  <style>html,body{margin:0;background:#07090d;overflow:hidden}</style>
</head>
<body>
  <div id="stage" style="position:relative;width:100vw;height:100vh"></div>
  <script type="module">
    import * as THREE from 'three';
    import { createDrone }       from '/src/kit/Quadrotor.js';
    import { createEnvironment } from '/src/kit/Environment.js';
    import { createPanel }       from '/src/kit/Hud.js';
    import { orbitCamera }       from '/src/kit/CameraRig.js';
    import { labels }            from '/src/kit/labels.js';
    import { theme }             from '/src/kit/theme.js';

    // 1. scene
    const { scene, addLights } = createEnvironment({ theme: 'dark' });
    addLights();

    // 2. camera + renderer
    const stage = document.getElementById('stage');
    const camera = new THREE.PerspectiveCamera(55, stage.clientWidth/stage.clientHeight, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    stage.appendChild(renderer.domElement);

    // 3. animation-specific content
    // ...

    // 4. HUD overlays (DOM, not Three.js)
    const panel = createPanel({
      title: labels.ch01.stackTitle,
      corner: 'tl', color: 'cyan',
      items: [{ label: labels.common.altitude, value: '0.0', unit: 'm' }]
    });
    stage.appendChild(panel.el);

    // 5. loop
    const clock = new THREE.Clock();
    (function tick() {
      const dt = clock.getDelta();
      orbitCamera(camera, { target: new THREE.Vector3(0,3,0), radius: 20, height: 13, speed: 0.3 });
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    })();

    // 6. resize handler
    addEventListener('resize', () => {
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight);
    });
  </script>
</body>
</html>
```

Target size per animation file: **under 400 lines**. If it's creeping past that, the animation is trying to show too much — split it or push reusable logic into the kit.

## Aesthetic rules

- **Dark scene** is the default (#07090d background, subtle fog starting at 25, ending at 70).
- **Four semantic colors**, always consistent across the whole deck: green = perception, cyan = planning, amber = control, magenta = executed/actual path.
- **Neon on black HUD** for telemetry readouts. Monospace, 11px.
- **No gradients, no bloom, no depth-of-field.** Clean flat look. It renders fast and reads well even when compressed to a slide.
- **Grid floor** everywhere — it's the visual anchor that tells viewers "this is a 3D scene."
- **Labels in Chinese** appear as DOM overlays, never as 3D text (3D Chinese text rendering is a rabbit hole).

## Three.js conventions and gotchas

- Pre-allocate `BufferGeometry` for trails: create once with a fixed capacity, use `setDrawRange` + `attributes.position.needsUpdate = true`. Calling `setFromPoints` every frame will crash on a long trail.
- Raycasting for sensor sims: use `THREE.Raycaster` with a `.far` limit — don't iterate obstacles manually.
- Always `dispose()` geometries, materials, and renderers when leaving a scene (matters when animations are embedded in a slide deck that switches scenes).
- Camera `updateProjectionMatrix()` after any aspect change. Easy to forget.
- `THREE.CapsuleGeometry` is fine in modern Three but **does not exist in r128** — irrelevant now that we're on latest, but worth knowing if you ever look at the earlier CDN-based prototype.
- **Projected DOM labels must be pixel-quantized.** When you compute an overlay's screen position from `vec.project(camera)` and update it per frame, use `Math.round()` on both px coords and write the transform as `translate3d(x, y, 0)` — not `translate(x, y)`. Fractional 2D translates keep the glyphs in the main compositing pass and they re-rasterize at slightly different sub-positions every frame, which reads as jitter. Also set `will-change: transform` on the label class. Applies to plate/node/callout labels in Ch1-1, Ch1-3, and any future CSS2DRenderer-style Ch2 exploded-view callouts.

## Workflow

- **One branch per chapter**: `feat/ch01-overview`, `feat/ch02-hardware`, …
- **One animation per commit**, with a commit message like `ch03: add PID step response animation`.
- **Build the kit before any chapter work.** `PROJECT_PLAN.md` phase 1 is blocking.
- **Screenshot for feedback.** When iterating on an animation's look, run it, take a screenshot, paste it into the chat with a natural-language change request. This is far faster than text-only description.
- **Test in Chrome first**, then spot-check in Safari/Firefox before shipping.

## When in doubt

- Prefer clarity to cleverness. The audience is beginners.
- If the animation needs more than three HUD panels to explain, it is doing too much. Split it.
- If you find yourself re-implementing something that exists in `src/kit/`, stop and extend the kit instead.
- If you spend more than a day on one animation, pause and re-read the spec in `PROJECT_PLAN.md`. Scope is probably wrong.

## Files to never touch without explicit permission

- `src/kit/theme.js` — changing colors here cascades to every animation. Treat as frozen after Phase 1 unless the user requests a palette overhaul.
- `src/kit/labels.js` — same logic. Chinese copy should be reviewed together, not changed mid-stream.
