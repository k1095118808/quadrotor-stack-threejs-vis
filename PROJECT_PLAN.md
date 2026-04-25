# PROJECT_PLAN.md

The full roadmap, animation inventory, and per-animation specs. Living document — update as scope shifts.

> If you are Claude Code starting a new session, read this file and `CLAUDE.md` before anything else.

---

## 1. Vision

Produce a web-based presentation that introduces research newcomers to quadrotor autonomous flight, using animated Three.js visualizations to make each of the manual's eight chapters tangible. The visualizations are the teaching tool — the narrator (the presenter) provides context around them.

**Success looks like:** an undergraduate who has never seen this material can watch the deck end-to-end and come away with accurate mental models of (a) the autonomy stack, (b) how the drone's hardware produces thrust and attitude, (c) why control, estimation, planning, and perception are separate concerns that still must agree, and (d) where modern methods (VIO, MPC, learning-based methods) fit in.

**Non-goals:** this is *not* a tutorial that teaches a viewer to implement any of these algorithms. It is a map of the territory. Depth comes from the manual text and the follow-up reading list.

## 2. Audience and tone

- **Audience:** upper-year undergraduates and first-year graduate students in robotics/EE/CS, most with some programming background but little robotics-specific knowledge.
- **Tone:** confident, uncluttered, visually quiet. The animations should feel closer to a Bret Victor or Grant Sanderson explainer than a video game cinematic. Movement exists to convey information, not to impress.
- **Language:** all labels in Simplified Chinese. All technical terms should appear in both Chinese and English the first time they are shown (e.g. 最小 Snap 轨迹 / Minimum Snap Trajectory).

## 3. Priority tiers

- **P0 — must ship.** 12 animations. These are the headliners. If only these shipped, the deck would still be presentable. The flagship chapters (1, 2, 3, 5, 6) are over-represented here.
- **P1 — should ship.** 10 animations. Strong supporting content that deepens each chapter. Cut any of these before cutting a P0.
- **P2 — nice to have.** 6+ animations. Ship only if ahead of schedule. Mostly for Chapters 7 and 8 (the manual gives these lighter treatment, so the deck should too).

## 4. Phased roadmap

### Phase 0 — Kit and theme (Week 1)
**Blocking.** No chapter work starts before this is done.

- [x] Scaffold project: `npm create vite@latest`, bare vanilla setup
- [x] Install deps: `three`
- [x] Fonts in `index.html` (Noto Sans SC, JetBrains Mono)
- [x] Implement `src/kit/theme.js` (colors, fonts, HUD tokens)
- [x] Implement `src/kit/labels.js` (empty skeleton — fill per chapter as we go)
- [x] Implement `src/kit/Environment.js`
- [x] Implement `src/kit/Quadrotor.js`
- [x] Implement `src/kit/Trajectory.js`
- [x] Implement `src/kit/Sensors.js`
- [x] Implement `src/kit/CameraRig.js`
- [x] Implement `src/kit/Hud.js` + `hud.css`
- [x] Reference scene `src/kit-demo.html` exercising every kit module (this is the acceptance test)
- [x] Root `index.html` gallery page listing every animation
- [x] Bright theme (2026-04-24): light palette + toggle helpers in `theme.js`, white/watermarked floor + logo-sprite clouds in `Environment.js`, `[data-theme="light"]` overrides + CSS var chrome in `hud.css`. Retrofitted Ch1-1/2/3, `kit-demo.html`, and `index.html`. See CLAUDE.md "Optional bright theme" for the design notes and gotchas.

**Acceptance:** open `src/kit-demo.html` in the browser, see a drone on a grid flying a loop through obstacles with a LIDAR fan, a camera frustum, a trail, two HUD panels, and one altitude chart. Looks like the prototype from earlier in the conversation. Clicking the ☾/☀ chip in the bottom-right should flip to the bright variant with the watermarked floor and drifting logo clouds.

### Phase 1 — Headline chapters (Week 2)
- [x] Ch1 P0×2 + P1×1
- [x] Ch2 P0×2

### Phase 2 — Control and planning (Week 3)
- [x] Ch3 P0×2 + P1×1
- [x] Ch5 P0×2 + P1×1

### Phase 3 — Estimation and perception (Week 4)
- [ ] Ch4 P0×2 + P1×1
- [ ] Ch6 P0×2 + P1×1

### Phase 4 — Swarm, learning, polish (Week 5)
- [ ] Ch7 P1×2
- [ ] Ch8 P1×1
- [ ] Integration into reveal.js or Astro deck
- [ ] Chinese label QA pass with a fluent reviewer
- [ ] Cross-browser smoke test
- [ ] P2 animations if time permits

---

## 5. Full animation inventory

Summary count: **28 animations planned** (12 P0, 10 P1, 6 P2).

| Ch | # | Title (CN) | Title (EN) | Priority |
|---|---|---|---|---|
| 1 | 1 | 自主飞行技术栈 | Autonomy Stack | P0 |
| 1 | 2 | 频率金字塔 | Frequency Pyramid | P0 |
| 1 | 3 | 模块耦合图 | Module Coupling Graph | P1 |
| 2 | 1 | 四旋翼模块分解视图 | Quadrotor Exploded View | P0 |
| 2 | 2 | IMU 振动耦合 | IMU Vibration Coupling | P0 |
| 2 | 3 | 电机推力曲线 | Thrust–RPM Curve | P1 |
| 2 | 4 | 信号链 | Signal Chain | P1 |
| 3 | 1 | 欠驱动演示 | Underactuation Demo | P0 |
| 3 | 2 | PID 阶跃响应 | PID Step Response | P0 |
| 3 | 3 | SE(3) 几何控制 | Geometric Control on SE(3) | P1 |
| 3 | 4 | MPC 滚动时域 | MPC Receding Horizon | P2 |
| 4 | 1 | IMU 漂移 vs 融合 | IMU Drift vs Kalman Fusion | P0 |
| 4 | 2 | VIO 特征跟踪 | VIO Feature Tracking | P0 |
| 4 | 3 | SLAM 闭环校正 | SLAM Loop Closure | P1 |
| 5 | 1 | A*/RRT* 搜索 | Search Tree Expansion | P0 |
| 5 | 2 | 最小 Snap 轨迹 | Minimum Snap Trajectory | P0 |
| 5 | 3 | 安全飞行走廊 | Safe Flight Corridor | P1 |
| 5 | 4 | 微分平坦性 | Differential Flatness | P1 |
| 6 | 1 | 占据栅格 / ESDF | Occupancy Grid / ESDF | P0 |
| 6 | 2 | ORB 特征匹配 | ORB Feature Matching | P0 |
| 6 | 3 | YOLO 目标检测 | YOLO Detection Overlay | P1 |
| 6 | 4 | BEV 特征映射 | BEV Feature Projection | P2 |
| 6 | 5 | 3D Gaussian Splatting | 3D Gaussian Splatting | P2 |
| 7 | 1 | Reynolds 集群 | Reynolds Flocking | P1 |
| 7 | 2 | 编队飞行 | Formation Flight | P1 |
| 7 | 3 | 一致性收敛 | Consensus Convergence | P2 |
| 8 | 1 | 像素到动作 | Pixels to Action | P1 |
| 8 | 2 | Sim-to-Real 对比 | Sim-to-Real Comparison | P2 |

---

## 6. P0 animation specs (detailed)

Each spec follows the same template: **goal** (what the viewer walks away understanding), **scene** (what's in 3D), **motion** (what moves and how), **camera**, **HUD**, **duration**, **notes**.

### P0-1 · 自主飞行技术栈 (Ch1, flagship)

- **Goal.** The viewer understands the drone's software is organized as a layered stack from hardware up to decision-making, with each layer producing input for the next.
- **Scene.** Six translucent horizontal plates stacked vertically in 3D space, bottom to top: 硬件层, 控制层, 定位层, 规划层, 感知层, 协同层. Each plate ~4×4 units, separated by ~1.5 units vertically. A quadrotor hovers above the top plate. Thin vertical connectors between plates.
- **Motion.** Glowing particles (数据流) continuously travel upward from the hardware plate to the decision plate and back down — upward particles are sensor data (green), downward are control commands (amber). Each plate subtly pulses when a particle passes through it.
- **Camera.** Slow orbit around the stack at a low-ish angle, full revolution every 24s. Occasional dolly-in on whichever layer the presenter is discussing (expose a `focusLayer(index)` function for manual triggering).
- **HUD.** Left panel: layer name + frequency band (硬件层 1–10 kHz, 控制层 500–1000 Hz, …). Right panel: "active layer" indicator (cycles with the data flow, or locked by `focusLayer`).
- **Duration.** 24s base orbit; loops indefinitely.
- **Notes.** This is the first thing the audience sees. Do not rush it. Iterate on the particle aesthetics until they read as "data" and not "sparkles." Use `THREE.Points` with an additive material for the glow (the one exception to our "no bloom" rule — the glow is geometric, not post-process).

### P0-2 · 频率金字塔 (Ch1)

- **Goal.** The viewer internalizes that control runs at ~1 kHz while planning runs at ~10 Hz and perception at ~30 Hz — an order of magnitude per layer.
- **Scene.** Top-down view. Concentric rings centered on a hovering drone: innermost = control (1 kHz), middle = planning (10–100 Hz), outer = perception (10–60 Hz). Each ring is made of small tick marks. Ticks on the control ring are packed densely; perception ring has ~30 ticks.
- **Motion.** Rings rotate at speeds proportional to their frequencies. Visually the inner ring is a blur, the outer ring ticks along at a readable pace. This is the whole point: the frequency difference is *literally visible*.
- **Camera.** Slight tilt from straight-down, very slow orbit.
- **HUD.** One panel per ring showing `频率: 1000 Hz` etc. Small note: "实际转速按对数缩放" so the viewer isn't confused — a 100× ratio cannot be shown literally.
- **Duration.** 20s loop.
- **Notes.** Real ratios are too extreme to render at true scale. Use log scaling but label it. The honesty here matters.

### P0-3 · 四旋翼模块分解视图 (Ch2, flagship for hardware)

- **Goal.** The viewer sees and remembers the components that compose a quadrotor.
- **Scene.** A detailed quadrotor centered in frame. Start: fully assembled. Components tracked individually: 机架, ×4 电机, ×4 电调, 电池, 飞控, IMU, ×2 相机, GNSS 天线, 机载计算机.
- **Motion.** On trigger (or auto-loop), components translate outward radially in a staggered sequence over ~8s, each trailed by a labeled callout line drawn to a Chinese/English label. Hold exploded state for 4s. Reassemble in reverse over 5s. Loop.
- **Camera.** 3/4 view, slow orbit. Dolly in slightly during the exploded hold.
- **HUD.** No panels. Labels are 3D callouts (HTML elements positioned with `CSS2DRenderer` — this is the one case where we use `examples/jsm/renderers/CSS2DRenderer` so labels stay readable at any angle).
- **Duration.** ~30s cycle.
- **Notes.** The drone model needs to be noticeably more detailed than the kit default. Model in Blender or source a free CC0 GLTF; put it in `public/assets/quadrotor-detailed.glb`. If modeling is out of scope this week, use placeholder boxes with correct proportions and labels — the labels do most of the teaching work.

### P0-4 · IMU 振动耦合 (Ch2)

- **Goal.** The viewer sees that motor vibration directly contaminates the IMU signal, motivating mechanical damping and digital filters.
- **Scene.** Split screen. Left half: 3D view of a hovering drone, rotors spinning. Right half: two stacked 2D time-series plots — 原始 IMU 信号 (raw) on top, 滤波后 (filtered) on bottom.
- **Motion.** A slider (0–100%) controls rotor RPM. As RPM rises, rotor visual blur increases, raw signal amplitude on the top plot spikes dramatically, filtered signal stays clean (a low-pass cutoff visibly eats the high-frequency content).
- **Camera.** Both halves locked. No orbit.
- **HUD.** RPM slider, cutoff-frequency slider, "SNR: xx dB" readout.
- **Duration.** Interactive; no fixed loop.
- **Notes.** Raw signal is synthetic: `a(t) = g + A·sin(2π·f_rotor·t) + n(t)`. Filter is a simple IIR low-pass (biquad). Keep the math in a comment at the top of the file.

### P0-5 · 欠驱动演示 (Ch3)

- **Goal.** The viewer grasps that the quadrotor has 6 DoF in pose but only 4 independent control inputs, so translational motion always requires an attitude detour.
- **Scene.** Single drone centered, initially level. Six arrows around the drone showing the 6 DoF: ±x, ±y, ±z translations and ±roll, ±pitch, ±yaw rotations. Four "control" indicators above the drone labeled 总推力, M_roll, M_pitch, M_yaw.
- **Motion.** Two-stage demo. Stage 1 (5s): show that requesting pure lateral (x) motion is impossible without tilt — drone tries, fails. Stage 2 (8s): correct maneuver — drone tilts (pitch), thrust vector now has horizontal component, drone accelerates laterally, then levels off. Arrows light up as they're used.
- **Camera.** Fixed 3/4 view. A subtle slow-in/out on the tilt is fine.
- **HUD.** Left: "自由度: 6". Right: "控制输入: 4". Bottom: running log of which inputs are active.
- **Duration.** 13s loop.
- **Notes.** This is conceptually the hardest spec in Chapter 3 — resist the urge to overdo it. One clear two-stage demo beats three muddled ones.

### P0-6 · PID 阶跃响应 (Ch3)

- **Goal.** The viewer develops intuition for what each of P, I, D contributes and why all three are needed.
- **Scene.** Orthographic side-view of a drone below a dashed horizontal target line at altitude 5 m. To the right, a 2D plot: altitude vs. time, plus three smaller sub-plots showing P, I, D contributions to the control output.
- **Motion.** On each slider change, restart the simulation. Drone rises, oscillates or settles per current gains, stops at target. Plots update in real time.
- **Camera.** Orthographic, static.
- **HUD.** Three sliders (K_p, K_i, K_d), numerical readouts for overshoot %, settling time, steady-state error. Quick-preset buttons: "仅 P", "P + D", "PID".
- **Duration.** Interactive; each simulation ~10s.
- **Notes.** Keep the plant simple — second-order with gravity, no attitude dynamics. The lesson is PID, not drone dynamics. Comment the ODE clearly.

### P0-7 · IMU 漂移 vs 卡尔曼融合 (Ch4)

- **Goal.** The viewer sees that integrating IMU data alone drifts unboundedly, and that fusing with an absolute sensor (GPS-like) keeps error bounded.
- **Scene.** Three drones flying the same planned loop: 真值 (white), 纯 IMU 积分 (red, drifts), 融合估计 (green, stays with truth). All three leave colored trails.
- **Motion.** 30s trajectory. Over the duration, the red drone visibly peels off into a spiral of growing error. Green stays within ~0.2 m of white.
- **Camera.** Slow orbit from outside the loop.
- **HUD.** Per-drone error readout ("Δ位置: 0.8 m" for red climbing, "0.1 m" for green). Small time-series plot of error vs time for both.
- **Duration.** 30s loop (reset each cycle).
- **Notes.** Use a real simple Kalman filter — constant-velocity motion model, IMU as high-rate prediction, simulated "GPS" as 1 Hz correction with ~0.3 m noise. Document the state vector at the top of the file. Don't over-tune: the whole point is that even a basic filter beats pure integration.

### P0-8 · VIO 特征跟踪 (Ch4)

- **Goal.** The viewer sees that VIO matches image features across frames to recover motion.
- **Scene.** Two canvases side-by-side or stacked. Top: the drone's onboard camera view — a synthetic environment with ~50 visible features rendered as small colored squares. Bottom: external 3D view of the drone flying through the same scene with its estimated pose visualized as a trail.
- **Motion.** Drone flies a short loop. Features in the onboard view move as the drone moves, with short tracking lines showing optical flow between successive frames. A handful of features go out of view or "fail" (turn red, then drop) to show real VIO isn't perfect.
- **Camera.** Onboard view rendered from the drone's own camera (use a second `PerspectiveCamera` attached to the drone). External view orbits slowly.
- **HUD.** Onboard view: "特征点: 47 / 50 跟踪中". External view: "重投影误差: 0.82 px".
- **Duration.** 20s loop.
- **Notes.** The onboard "image" does not need to be photorealistic — synthetic dots on a textured ground plane are plenty. The teaching point is the correspondence, not the image quality.

### P0-9 · A*/RRT* 搜索扩展 (Ch5)

- **Goal.** The viewer understands that planners search a space of possible paths and find a good one through obstacles.
- **Scene.** Top-down view of a 2D-ish environment (rendered in 3D with very low camera angle for aesthetic, but functionally 2D). Start marker in green, goal marker in red, gray obstacle polygons scattered in between.
- **Motion.** Two sequential demos, toggle via button: **A***: grid cells fill in with color gradient by f-score, frontier expands outward; **RRT***: random samples drop in, tree branches extend toward them. In each, on completion, the found path highlights in bright magenta and a drone flies along it.
- **Camera.** Top-down, static, slight zoom when path is revealed.
- **HUD.** "节点探索: 842", "路径长度: 24.3 m", current algorithm name.
- **Duration.** 15s expansion + 5s path reveal, per algorithm. Loop between them.
- **Notes.** Full pathfinding impl is overkill. Animate pre-computed expansion step lists — compute once at load, replay in JS. The algorithm lives in a comment at the top; the visualization is what's on screen.

### P0-10 · 最小 Snap 轨迹 (Ch5)

- **Goal.** The viewer sees why polynomial trajectories beat straight lines for dynamic feasibility.
- **Scene.** Four waypoints in 3D. Two modes shown in sequence: **直线连接** (naive) — piecewise linear path, drone lurches through waypoints. **最小 Snap** — smooth polynomial, drone flows through. Side-by-side or back-to-back.
- **Motion.** Drone flies each path at matched average speed. In naive mode, at each waypoint the drone visibly decelerates and changes direction abruptly. In smooth mode, motion is continuous. Superimpose small plots of acceleration and jerk magnitude — naive spikes, smooth stays bounded.
- **Camera.** Cinematic: starts wide, follows the drone through the most interesting waypoint transition, then pulls back.
- **HUD.** "模式: 直线" / "模式: 最小 Snap". "加速度峰值 / 加加速度峰值" numerical comparison.
- **Duration.** 12s per mode, alternating, total 24s.
- **Notes.** Minimum snap is a real optimization. Use `mathjs` or hand-rolled closed form for a piecewise 7th-order polynomial minimizing ∫||d⁴r/dt⁴||². The code for the polynomial fit is a genuine learning artifact — keep it readable and reference `mav_trajectory_generation`-style conventions.

### P0-11 · 占据栅格 / ESDF 更新 (Ch6)

- **Goal.** The viewer sees how raw sensor returns become an occupancy map, and what ESDF adds.
- **Scene.** Drone flies a sweep over a scene containing a handful of obstacles. As it flies, voxels (small transparent cubes) appear where sensor rays hit — building up the occupancy grid. Halfway through, toggle ESDF view: voxels recolor by distance to nearest obstacle (red = close, blue = far).
- **Motion.** Drone's LIDAR fan visible. Voxels appear in sync with ray hits. Smooth color transition when ESDF toggle fires.
- **Camera.** Oblique view, follows drone loosely.
- **HUD.** "体素数: 12,483". "最小间隙: 0.8 m". Mode indicator (occupancy vs ESDF).
- **Duration.** 30s.
- **Notes.** Do not try for a real ESDF computation in real time — precompute for the static scene on load. The drone "reveals" ESDF by walking the grid, not by computing it.

### P0-12 · ORB 特征匹配 (Ch6)

- **Goal.** The viewer sees that visual features are sparse, distinctive points matched across images.
- **Scene.** Two image panels side-by-side. Both show synthetic scenes (textured planes with objects) from slightly different viewpoints. ORB-like keypoint dots overlaid on each. Lines draw between matched dots.
- **Motion.** On load, keypoints appear on both images (staggered, ~0.5s). Matches draw one at a time over ~2s. A few clearly-wrong matches (outliers) draw in red, then fade away when RANSAC filters them, leaving only inliers in green. Cycle through 3–4 scene pairs.
- **Camera.** Static.
- **HUD.** "总匹配: 234". "内点: 198". "外点剔除: RANSAC".
- **Duration.** 10s per scene pair, 40s total cycle.
- **Notes.** Don't run real ORB. The teaching point is correspondence + outlier rejection — pre-author the keypoint lists and match lists. Keep the outlier count honest (real ORB has 10–30% outliers typically).

---

## 7. P1 animation specs (brief)

Each of these gets 2–3 sentences. Flesh out into full specs when the animation is next in queue.

- **Ch1-3 · 模块耦合图** — Animated node-edge graph: 感知, 估计, 规划, 控制 as nodes. Data flows along edges as moving dots. Clicking a node highlights its inputs and outputs. Teaches that layers aren't isolated.

- **Ch2-3 · 电机推力曲线** — 2D plot of thrust vs RPM with a test-stand visualization on the left. Slider controls throttle; the RPM readout climbs, thrust arrow on the visual drone grows, plot point traces the curve. Shows thrust is quadratic in RPM.

- **Ch2-4 · 信号链** — Horizontal pipeline: 遥控器 → 飞控 MCU → 电调 → 电机 → 螺旋桨 → 推力. Signal packets flow through, transformation at each stage labeled (PPM → PWM → PWM → 电流 → 转速 → 推力). Illustrates latency chain.

- **Ch3-3 · SE(3) 几何控制** — A body-frame triad (R ∈ SO(3)) floats in space. Desired attitude as a second faded triad. Error vector on the Lie algebra so(3) rendered as a small arrow. Control drives current to desired, error shrinks to zero. Teaches that attitude lives on a manifold, not in Euler angles.

- **Ch4-3 · SLAM 闭环校正** — Drone traverses a loop through an environment, building a map. When it returns to start, detected loop closure triggers a snap — trajectory and map correct visibly to resolve accumulated drift.

- **Ch5-3 · 安全飞行走廊** — Obstacle field in 3D. Green convex polyhedra grow along the planned path, carving a safe corridor. Trajectory re-optimizes to stay inside corridor. Teaches SFC as a convex relaxation of nonconvex obstacle avoidance.

- **Ch5-4 · 微分平坦性** — Four flat outputs (x, y, z, yaw) shown as four time-series. Their derivatives up to snap computed live. Arrows then show how the full state (position, velocity, attitude, body rates, thrusts) is algebraically recovered from the flats. The mathematical magic of why minimum-snap works.

- **Ch6-3 · YOLO 目标检测** — Simulated drone camera feed with synthetic objects (cars, people, signs). Bounding boxes appear per frame with class labels and confidence scores in Chinese. Teaches that detection is per-frame and not always confident.

- **Ch7-1 · Reynolds 集群** — 50 small drones flocking per the classic boids rules: separation, alignment, cohesion. Sliders for each rule's weight show how the aggregate behavior changes. Foundation for swarm.

- **Ch7-2 · 编队飞行** — 8 drones in a formation (diamond, line, grid) with one designated leader. Formation morphs on trigger. Each follower's commanded position is drawn as a ghost ahead of them, their controller tracks to it. Teaches leader-follower coordination.

---

## 8. P2 animation list (deferred)

Only if schedule permits.

- **Ch3-4 · MPC 滚动时域** — Rolling prediction horizon visualized, re-optimized each control step.
- **Ch6-4 · BEV 特征映射** — Four camera views transformed to bird's-eye-view feature map.
- **Ch6-5 · 3D Gaussian Splatting** — Splat cloud scene reconstruction reveal.
- **Ch7-3 · 一致性收敛** — 10 agents with scalar states converging under a Laplacian dynamics.
- **Ch8-1 · 像素到动作** — Schematic of an end-to-end policy network, live inference on a synthetic observation → control output.
- **Ch8-2 · Sim-to-Real 对比** — Side-by-side: simulator and reality diverging, domain randomization closing the gap.

---

## 9. Completion tracker

| Animation | Phase | Status | Commit |
|---|---|---|---|
| Kit + theme + demo | 0 | ☑ | feat/phase-0-kit |
| Bright theme + logo clouds | 0 | ☑ | d8320a9 |
| Ch1-1 技术栈 | 1 | ☑ | abab3df |
| Ch1-2 频率金字塔 | 1 | ☑ | 7d5debf |
| Ch1-3 耦合图 | 1 | ☑ | 8d3ae82 |
| Ch2-1 模块分解视图 | 1 | ☑ | 1a93ff6 |
| Ch2-2 IMU 振动 | 1 | ☑ | 54eded9 |
| Ch3-1 欠驱动 | 2 | ☑ | c29d0d0 |
| Ch3-2 PID 阶跃 | 2 | ☑ | e9aa304 |
| Ch3-3 SE(3) | 2 | ☑ | d055ca6 |
| Ch5-1 搜索扩展 | 2 | ☑ | feat/ch05-planning |
| Ch5-2 最小 Snap | 2 | ☑ | feat/ch05-planning |
| Ch5-3 安全走廊 | 2 | ☑ | feat/ch05-planning |
| Ch4-1 IMU 漂移 | 3 | ☑ | feat/ch04-estimation |
| Ch4-2 VIO | 3 | ☑ | feat/ch04-estimation |
| Ch4-3 SLAM 闭环 | 3 | ☐ | |
| Ch6-1 占据栅格 | 3 | ☐ | |
| Ch6-2 ORB 匹配 | 3 | ☐ | |
| Ch6-3 YOLO | 3 | ☐ | |
| Ch7-1 Reynolds | 4 | ☐ | |
| Ch7-2 编队 | 4 | ☐ | |
| Ch8-1 像素到动作 | 4 | ☐ | |
| Integration (reveal.js) | 4 | ☐ | |
| Chinese label QA | 4 | ☐ | |
| Cross-browser test | 4 | ☐ | |

---

## 10. Chinese label reference (seed content for `src/kit/labels.js`)

Starter vocabulary. Expand as animations demand.

```js
export const labels = {
  common: {
    altitude: '高度',
    velocity: '速度',
    thrust: '推力',
    attitude: '姿态',
    position: '位置',
    error: '误差',
    mode: '模式',
    frequency: '频率',
    on: '开启',
    off: '关闭',
  },
  layers: {
    hardware: '硬件层',
    control: '控制层',
    localization: '定位层',
    planning: '规划层',
    perception: '感知层',
    coordination: '协同层',
  },
  ch01: {
    stackTitle: '自主飞行技术栈',
    pyramidTitle: '频率金字塔',
    couplingTitle: '模块耦合',
  },
  ch02: {
    explodedTitle: '四旋翼组件',
    imuVibrationTitle: 'IMU 振动耦合',
    frame: '机架', motor: '电机', esc: '电调',
    battery: '电池', fc: '飞控', imu: 'IMU',
    camera: '相机', gnss: 'GNSS 天线', companion: '机载计算机',
  },
  // ...fill per chapter as we build
};
```

---

## 11. Open questions (resolve before relevant phase)

- **Presentation shell:** reveal.js vs Astro vs custom iframe gallery. Decide at start of Phase 4 based on how embeddings are working.
- **Drone GLTF asset:** source a CC0 detailed model, or use the kit's default box-drone throughout. Affects Ch2-1 quality. Target: decide start of Phase 1.
- **Chinese label reviewer:** who does the QA pass on terminology? Ideal: the manual's original author. Target: identify by Phase 3.
- **Deployment target:** GitHub Pages vs Vercel vs course server. Decide at start of Phase 4.

---

## 12. Changelog

- 2026-04-23 · Initial plan.
- 2026-04-23 · Phase 0 complete. Kit modules, demo scene, gallery landed on `feat/phase-0-kit`.
- 2026-04-24 · Chapter 1 complete. Autonomy-stack, frequency-pyramid, and module-coupling animations merged to main (abab3df, 7d5debf, 8d3ae82). Next: Ch2 hardware pair (exploded view + IMU vibration).
- 2026-04-24 · Bright theme landed (d8320a9). Mode-aware `theme.js` with URL/localStorage resolution and `mountThemeToggle`; `Environment.js` gains a watermarked white floor + drifting logo-sprite clouds under `theme: 'light'`; `hud.css` carries `[data-theme="light"]` overrides and CSS var chrome. Ch1-1/2/3, `kit-demo.html`, and `index.html` retrofitted. Particle materials now fall back from `AdditiveBlending` to `NormalBlending` in light mode (additive vanishes on white).
- 2026-04-24 · **Ch2-1 Exploded View** landed (`01-exploded.html`). Nine labeled part groups (frame, motor ×4, esc ×4, battery, fc, imu, cameras ×2, gnss, companion) built from primitives; radial/vertical explode offsets with per-part stagger; four-phase state machine (assemble → explode → hold → reform) with click-to-pause; DOM callouts carry zh bold + en monospace, projected via rounded-px translate3d per the label-jitter memory. Camera is a 50° FOV orbit at radius 5.2, lookAt y=0.3 — first pass at radius 3.6 cropped small parts (IMU especially) behind the GNSS puck, so the hold phase now pulls *out* (×1.15) instead of in.
- 2026-04-24 · **Ch2-2 IMU Vibration** landed (`02-imu-vibration.html`). Split-screen layout (3D drone left, two oscilloscope canvases right, sliders below). Internal 600 Hz signal pipeline: raw `a(t) = g + A·sin(2π·f_rotor·t) + n(t)`, 1st-order IIR low-pass with `α = exp(-2π·fc/Fs)`, rendered on ±9 m/s² fixed axes so the raw spike dwarfs the filtered trace at high RPM. RPM + cutoff sliders, live SNR readout smoothed over 0.5 s. First draft coupled the raw sample straight into drone pose, but the 150 Hz vibration sampled at 60 fps aliased into jittery shimmer — replaced with a synthesized two-sine wobble (3.3 Hz + 6.1 Hz) scaled by RPM so the drone visibly "buzzes harder" without fighting the render rate. Phase 1 complete.
- 2026-04-24 · **Chapter 3 complete** (`feat/ch03-control`). All three animations landed together on one branch. (a) **Ch3-1 欠驱动演示** (c29d0d0) — 13 s two-stage loop: Stage 1 ramps only T upward and the drone can't translate in +X (body-axial thrust); a strike marks infeasible. Stage 2 applies M_pitch first to tilt the body ~12°, then raises T so the rotated thrust gets a horizontal component, drone reaches the ghost goal, levels off. Four-cell input bar strip with reverse-direction cyan tint during the level-off; HUD titles carry the 6-vs-4 totals; log ring buffer stamps cycle-relative timestamps. (b) **Ch3-2 PID 阶跃响应** (e9aa304) — split orthographic altitude demo with right-panel DOM charts. Plant m·z̈ = T − m·g, T ∈ [0, 40 N], ∫ hard-clamped at ±20 for wind-up. 240 Hz sub-step, 60 Hz render, 10 s window with 2 s post-hold auto-restart. K_p/K_i/K_d sliders (color-coded thumbs matching sub-plots), three presets (仅 P / P+D / PID), live overshoot / settling / SS-error. (c) **Ch3-3 SE(3) 几何控制** (d055ca6) — proportional attitude controller on SO(3) with ω̇ = 2·K_R·vec(q_err) − K_ω·ω, unit inertia, K_R = 4, K_ω = 2 (ζ ≈ 0.5), 4× sub-step. Solid RGB body triad + faded RGB desired triad + magenta axis-angle error arrow; q_err canonicalised to w ≥ 0 so the arrow always shows the minimum-angle path. Resamples R_d uniformly on SO(3) every 6 s. Left/right panels show XYZ Euler decomposition so the audience can see the chart on the manifold is not canonical. Standard RGB axis colors — the one place the project breaks the four-color semantic palette, because viewers read body axes as RGB faster than as our accents.
- 2026-04-24 · **`createEnvironment` gains a `logoClouds` toggle** (f9718b4). Ch3-2's orthographic side-view frames Y ≈ [−0.5, 8.5], which overlaps the cloud altitude band (y = 6–12) — the drifting sprites read as confetti over the altitude plot. The toggle defaults to `true` so every other chapter is unchanged; tight framings opt out with `logoClouds: false`. Documented in the kit API sketch in CLAUDE.md.
- 2026-04-24 · **Light-mode watermark rebranded to `NKU-ISAN-LAB`** (fb516fd). Both surfaces updated in lockstep: the baked `CanvasTexture` on the 3D floor (`Environment.js` `makeFloorWatermarkTexture`) and the inline-SVG body background mirror on `index.html`. CLAUDE.md's bright-theme design notes updated to match.
- 2026-04-25 · **Ch4-2 VIO feature tracking** landed (`02-vio.html`). Single scene, two viewports rendered with one `WebGLRenderer` + `setScissorTest` + `setViewport`: top half is the drone's onboard `PerspectiveCamera` (a child of `drone.group`, position `(0, 0.08, 0.20)`, `rotation.y = π` so its local −z aligns with the kit drone's local +z forward), bottom half is an external orbit. A central 1.4×2.8×1.4 m pillar at the origin is the "structure being inspected"; four smaller boxes give parallax depth. 50 features (small unlit `MeshBasicMaterial` spheres, HSL-randomised) populate the scene biased to box faces (55 %), then ground (30 %), then air (15 %). Drone orbits at radius 5, altitude 1.8, always yawing inward (`atan2((0 − pos).x, (0 − pos).z)`) so the onboard camera continuously frames the pillar — features sweep across as horizontal flow rather than radiating from the focus of expansion. Each feature projects to onboard NDC every frame; in-FOV samples are pushed into a rolling 8-entry track buffer at 24 Hz. The DOM canvas overlay (DPR-scaled, anchored to the top half) draws the polylines (oldest faint, newest bright), then the current dot — green for active, magenta with a halo pulse for failing. Failure is rolled at ~0.30 / s after a 1.5 s warm-up; failing features blink for 0.7 s in both the overlay AND the in-scene mesh (color lerped to magenta with the same 25 rad/s pulse), then drop. Reprojection-error readout is synthesized (0.62 + 0.30 sin 0.65t + small noise) — we don't run real bundle adjustment, but the value reads as live. `renderer.autoClear = false` and per-viewport `renderer.clear()` so the second pass doesn't wipe the first.
- 2026-04-25 · **Ch4-1 IMU drift vs Kalman fusion** landed (`01-imu-drift.html`). Three drones fly the same analytical ellipse (R=6 m, H=2.5 m, ω=2π/30 rad/s, slight 2ω vertical wobble): a truth drone tracks p(t) exactly, a pure-IMU drone semi-implicit-integrates a noisy + biased accelerometer (σ_a=0.04 m/s², bias re-rolled per loop in ±0.03–0.06 m/s² band), and a fused drone runs three independent 2-D Kalman filters (one per world axis) — the full 6-D KF collapses to per-axis 2×2s because accelerometer noise is treated as diagonal. IMU sub-step at 200 Hz, GPS-style position fix at 1 Hz with σ_g=0.30 m. Bias dominates the 30 s drift budget (0.04 × 30² / 2 ≈ 18 m worst case per axis), which is exactly what the ERR_MAX=18 m chart Y-range and the wide orbit (radius 22, height 16) are sized to show. Each GPS update spawns a 0.8 s expanding purple ring at the noisy measurement position so the audience can see the noisy data the filter actually ingests. Custom dual-line error chart on a DPR-aware canvas in the bottom-right (red = IMU error, green = fused error, magnitude grid every 5 m, time playhead) so the unbounded-vs-bounded contrast is quantitative. Chose semi-implicit (symplectic) Euler over the textbook `p += v dt + ½ a dt²` form: without it Euler visibly spirals the noiseless IMU drone outward over 30 s on the periodic motion, which would muddle the bias-vs-fusion teaching point. `logoClouds: false` because the cloud band (y=6–12) sits between the camera (y=16) and the action (y≈2.5) and would read as confetti over the trails.
- 2026-04-25 · **Chapter 5 complete** — Phase 2 ends. All three planned animations on `feat/ch05-planning`. (a) **Ch5-1 A*/RRT* 搜索扩展** — top-down 24×11 m planning view; A* runs on a 0.5 m grid (40×22 cells, 8-connected, Euclidean heuristic, 0.55 m obstacle inflation so the smoothed flight curve doesn't clip walls), then RRT* with step 1.5 m, rewire radius 1.8 m, 6 % goal bias, ~600-iter cap. Both algorithms precompute their full event list at load — A* records pop order with f-scores for the gradient ramp; RRT* records add/rewire events keyed to per-node edge slots so the LineSegments buffer can rewire in place. 24 s loop: 6 s expand → 0.6 s path reveal → 5 s drone-flight (Catmull-Rom through cell centres) → fade → repeat for RRT*. InstancedMesh of 880 cell tiles drives the A* fill; one InstancedBufferAttribute per channel via setColorAt — note the early bug where setting `cellMat.vertexColors = true` made every cell render black because the geometry has no per-vertex color attribute. Fix: don't touch vertexColors; Three.js auto-detects `instanceColor` and adds the matching shader define. (b) **Ch5-2 最小 Snap 轨迹** — same four 3D waypoints flown twice, once piecewise-linear ("naive") and once with a piecewise 7th-order spline whose 24 unknowns per axis are uniquely determined by C^6 continuity at interior knots plus zero v/a/j endpoint conditions (fixed segment times → mathematically equivalent to the snap-optimal QP). 24×24 system per axis, solved via Gaussian elimination with partial pivoting at load. Both commands feed a 2nd-order tracker (ω = 8, ζ = 0.7) so the rendered position has finite, comparable a/j; raw analytic differentiation would give Dirac spikes for naive, which can't share a y-axis with the smooth signal. The two DOM-canvas charts plot |a(t)| and |j(t)| with both signals overlaid — faded gray for the inactive mode, magenta for the active, cyan playhead — making the order-of-magnitude reduction (~50× on jerk) visible at a glance. (c) **Ch5-3 安全飞行走廊** — three slab obstacles in a row at z ≈ 0; ten-waypoint snake (≤ 1.6 m spacing) so adjacent corridor boxes overlap and the corridor is genuinely connected; per-waypoint axis-aligned box inflated face-by-face with randomised face order so no axis is starved (each face grows in 5 cm steps until the next step would overlap an obstacle or push the bottom under the floor; capped at 1.5 m offset per face). The original layout (six waypoints over a 14 m span) had wide gaps where neighbouring boxes never touched, so a vanilla Catmull-Rom through the same waypoints slipped back into the obstacles — fix was to (i) tighten the path, (ii) build the smooth curve through `WAYPOINTS ⊕ box-overlap-midpoints`, and (iii) project every sample onto the corridor union (`projectToCorridor`) as a hard safety net so the curve we hand the drone is provably inside the SFC. Drone advances along an arc-length parameterisation of the projected polyline so flight speed stays uniform regardless of how the projection redistributes samples. Four-stage 24 s loop reveals the SFC pipeline: initial polyline → boxes inflate sequentially → smooth trajectory draws in → drone flies. Boxes use the perception slot (semantic green) with 0.10 fill + 0.85 wireframe, depthWrite off so overlapping boxes blend without z-fighting.
