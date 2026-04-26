# 四旋翼自主飞行 · 可视化图谱

**Quadrotor Autonomous Flight — A Visual Atlas.** A web deck of ~30 short
Three.js animations illustrating the eight chapters of the *四旋翼无人机自主
飞行知识手册* (Quadrotor Autonomous Flight Knowledge Manual). Built for
research newcomers — every scene prioritizes clarity over cleverness.

The project is a teaching tool, not a tutorial: the animations make the
manual's concepts tangible while the presenter narrates around them. See
[PROJECT_PLAN.md](./PROJECT_PLAN.md) for the full vision, audience notes,
and per-animation specs.

## Quick start

```bash
npm install
npm run dev          # gallery at http://localhost:5173
```

Open the gallery and click any card. Each animation is a standalone HTML
file under `src/chapters/` — they all run in any modern Chromium-based
browser (Chrome, Edge). Spot-check Safari/Firefox before shipping.

```bash
npm run build        # static bundle in dist/
npm run preview      # serve the production build
npm run record       # capture every animation to MP4 (see below)
```

## Stack

- **[Three.js](https://threejs.org/)** (latest) for the scenes.
- **[Vite](https://vitejs.dev/)** for dev/build.
- **Vanilla JS** — no React, no TypeScript, low barrier for collaborators.
- **Google Fonts** — Noto Sans SC for Chinese labels, JetBrains Mono for
  HUD telemetry. Loaded from CDN in each page's `<head>`.

No 3D libraries beyond `three` and its `examples/jsm/*` utilities.

## The deck

19 animations live across 8 chapters. All scenes share a single visual
language: dark scene with a grid floor, four semantic colors (green =
perception, cyan = planning, amber = control, magenta = executed/actual
path), neon-on-black HUD overlays.

| Chapter | Animation | File |
|---|---|---|
| **Ch1 · 自主飞行导论** | 自主飞行技术栈 | `src/chapters/ch01-overview/01-stack.html` |
|  | 频率金字塔 | `src/chapters/ch01-overview/02-frequency.html` |
|  | 模块耦合图 | `src/chapters/ch01-overview/03-coupling.html` |
| **Ch2 · 硬件与信号** | 四旋翼模块分解视图 | `src/chapters/ch02-hardware/01-exploded.html` |
|  | IMU 振动耦合 | `src/chapters/ch02-hardware/02-imu-vibration.html` |
| **Ch3 · 控制** | 欠驱动演示 | `src/chapters/ch03-control/01-underactuation.html` |
|  | PID 阶跃响应 | `src/chapters/ch03-control/02-pid-step.html` |
|  | SE(3) 几何控制 | `src/chapters/ch03-control/03-se3.html` |
| **Ch4 · 状态估计** | IMU 漂移 vs 卡尔曼融合 | `src/chapters/ch04-estimation/01-imu-drift.html` |
|  | VIO 特征跟踪 | `src/chapters/ch04-estimation/02-vio.html` |
| **Ch5 · 规划** | A\*/RRT\* 搜索扩展 | `src/chapters/ch05-planning/01-search.html` |
|  | 最小 Snap 轨迹 | `src/chapters/ch05-planning/02-min-snap.html` |
|  | 安全飞行走廊 | `src/chapters/ch05-planning/03-corridor.html` |
| **Ch6 · 感知** | 占据栅格 / ESDF | `src/chapters/ch06-perception/01-occupancy.html` |
|  | ORB 特征匹配 | `src/chapters/ch06-perception/02-orb.html` |
|  | YOLO 目标检测 | `src/chapters/ch06-perception/03-yolo.html` |
| **Ch7 · 集群** | Reynolds 集群 | `src/chapters/ch07-swarm/01-reynolds.html` |
|  | 编队飞行 | `src/chapters/ch07-swarm/02-formation.html` |
| **Ch8 · 学习式方法** | 像素到动作 | `src/chapters/ch08-learning/01-pixels-to-action.html` |

Four animations have interactive button presets:

| File | Buttons |
|---|---|
| `ch02-hardware/01-exploded` | Click anywhere on stage to toggle assembled / exploded |
| `ch03-control/02-pid-step` | `#presetP`, `#presetPD`, `#presetPID` |
| `ch07-swarm/01-reynolds` | `[data-preset]` × 4 (balanced / sep / ali / coh) |
| `ch07-swarm/02-formation` | `[data-shape]` × 3 (diamond / line / grid) |

## Repository layout

```
threejs_vis/
├── CLAUDE.md                  # session context for Claude Code
├── PROJECT_PLAN.md            # full roadmap, priorities, animation specs
├── README.md                  # this file
├── index.html                 # gallery — links to every animation
├── package.json
├── vite.config.js
├── src/
│   ├── kit/                   # shared building blocks (see CLAUDE.md for API)
│   │   ├── Quadrotor.js
│   │   ├── Environment.js
│   │   ├── Trajectory.js
│   │   ├── Sensors.js
│   │   ├── Hud.js
│   │   ├── hud.css
│   │   ├── CameraRig.js
│   │   ├── labels.js
│   │   └── theme.js
│   ├── kit-demo.html          # acceptance test — exercises every kit module
│   ├── assets/                # logo1.png used by light-theme cloud sprites
│   └── chapters/
│       ├── ch01-overview/
│       ├── ch02-hardware/
│       ├── ch03-control/
│       ├── ch04-estimation/
│       ├── ch05-planning/
│       ├── ch06-perception/
│       ├── ch07-swarm/
│       └── ch08-learning/
├── public/
│   └── assets/                # static assets (models, textures)
├── tools/
│   └── record/                # video export pipeline (see below)
└── out/
    └── videos/                # generated MP4s (gitignored)
```

## Shared kit

Every animation composes the modules in `src/kit/` rather than reinventing
them. The full API is documented in [CLAUDE.md](./CLAUDE.md#shared-kit-api-authoritative);
a one-line summary:

| Module | Exports |
|---|---|
| `Quadrotor.js` | `createDrone({ scale, bodyColor, accentColor, armLength, showThrustVector })` |
| `Environment.js` | `createEnvironment({ theme, grid, fog, floor, sceneSize, logoClouds })` |
| `Trajectory.js` | `createPath(waypoints, opts)`, `createTrail(opts)` |
| `Sensors.js` | `createLidar(opts)`, `createFrustum(opts)` |
| `Hud.js` + `hud.css` | `createPanel({ title, corner, color, items })`, `createChart(opts)` |
| `CameraRig.js` | `orbitCamera`, `followCamera`, `cinematic` |
| `labels.js` | `labels` — single source of truth for Chinese strings |
| `theme.js` | `theme`, `hudAccents`, `mountThemeToggle()`, `getThemeMode()`, `setThemeMode(mode)` |

If you find yourself re-implementing a quadrotor, trajectory, HUD, or
camera rig inside a chapter file, stop and extend the kit instead.

## Themes

Two visual modes ship side by side:

- **Dark** (default) — `#07090d` background, neon HUD, fog from 25 to 70.
- **Light / paper** — true-white background with a deep purple/pink
  "NKU-ISAN-LAB" watermark baked into the floor and mirrored as an SVG
  body-background tile. Seven `THREE.Sprite` copies of `src/assets/logo1.png`
  drift overhead at y ≈ 6–12 in a slow circle. HUD panels flip to dark
  text on translucent white.

Theme resolution at page load (in priority order): `?theme=light|dark` query
param → `localStorage['vis-theme']` → `'dark'`. Every page calls
`mountThemeToggle()` to mount the floating ☾/☀ chip in the bottom-right.
`setThemeMode()` persists and reloads — materials are baked at scene
construction, so a hot swap would require every chapter to walk its object
tree.

Two gotchas to remember when authoring new scenes:

- **Additive blending vanishes on white.** Particles using
  `THREE.AdditiveBlending` disappear in light mode. Gate on
  `theme.mode === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending`.
- **Per-chapter inline `<style>` must key off CSS vars** (`var(--stage-bg)`,
  `var(--label-fg/bg/border)`, `var(--c-perception/planning/control/executed)`),
  not literal hexes — the vars flip with the theme.

## Recording videos

`npm run record` captures every animation to MP4 (H.264, 1080p, 30 fps,
both themes by default). Output lands in `out/videos/`. The pipeline:

1. Spawns Vite on port 5173.
2. Launches GPU-accelerated headless Chromium (Playwright).
3. Injects a clock shim that overrides `performance.now`, `Date.now`, and
   `requestAnimationFrame` so each frame advances by exactly `1/fps`
   seconds — output is reproducible and unaffected by host CPU load.
4. Screenshots `#stage` per frame (capturing canvas **and** HUD overlays)
   and pipes PNG bytes straight into `ffmpeg-static`.

Common flags (all CLI args go after `--`):

```bash
npm run record -- --only=ch03         # one chapter
npm run record -- --theme=dark        # one theme
npm run record -- --workers=4         # more parallelism (~3× faster)
npm run record -- --fps=60            # smoother, ~2× wall time
npm run record -- --duration=8        # shorter clips
npm run record -- --no-vite           # use a dev server you've already started
```

Defaults: 30 fps, 12 s, 1920×1080, both themes, 2 workers. Full run is
about 20–25 minutes per theme. See [tools/record/README.md](./tools/record/README.md)
for architecture details and the manifest format.

## Conventions

### Language policy

- All user-visible labels, tooltips, captions: **Simplified Chinese**.
- All code, comments, filenames, commit messages, variable names: **English**.
- Single source of truth for Chinese strings: `src/kit/labels.js`. Never
  hard-code Chinese inside animation files.

### Animation file template

Every chapter HTML file is one self-contained module under 400 lines. The
canonical skeleton (scene → camera/renderer → animation content → HUD →
loop → resize handler) is in
[CLAUDE.md](./CLAUDE.md#animation-file-template). If a file is creeping
past 400 lines, the animation is trying to show too much — split it or
push reusable logic into the kit.

### Workflow

- One branch per chapter (`feat/ch01-overview`, `feat/ch02-hardware`, …).
- One animation per commit (`ch03: add PID step response animation`).
- Screenshot for feedback. When iterating on look, run the page, take a
  screenshot, paste it into the chat with the change request — far faster
  than text-only descriptions.

### Files to never touch without explicit permission

- `src/kit/theme.js` — palette changes cascade to every animation.
- `src/kit/labels.js` — Chinese copy reviewed together, not piecemeal.
- `src/assets/logo1.png` — used by the light-theme logo clouds; the sprite
  scaling auto-corrects from the decoded image, so a non-3:1 replacement
  changes the visible cloud footprint.

## Documents

- [`CLAUDE.md`](./CLAUDE.md) — session context, full kit API, Three.js
  conventions and gotchas, aesthetic rules. Read first if onboarding.
- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — vision, priority tiers, phased
  roadmap, per-animation specs, completion tracker, changelog.
- [`tools/record/README.md`](./tools/record/README.md) — video export
  details, manifest format, performance notes.
