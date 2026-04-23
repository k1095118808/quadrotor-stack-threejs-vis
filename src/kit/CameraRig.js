import * as THREE from 'three';

// All three helpers follow the same usage pattern: call each tick inside the
// render loop with the current camera; they mutate camera.position and call
// camera.lookAt() in place. Phase is read from performance.now() internally so
// callers don't have to track elapsed time themselves. Calls are idempotent per
// frame — it is safe to swap between rigs on the fly.

const _tmpV = new THREE.Vector3();
const _tmpT = new THREE.Vector3();

// orbitCamera(camera, { target, radius, height, speed })
// Smooth circular orbit at constant radius and height above target.
// speed is in radians per second; a full revolution every 2π/speed seconds.
export function orbitCamera(camera, { target, radius = 10, height = 6, speed = 0.3 } = {}) {
  const t = performance.now() * 0.001;
  const c = resolveTarget(target, _tmpT);
  const a = t * speed;
  camera.position.set(
    c.x + Math.cos(a) * radius,
    c.y + height,
    c.z + Math.sin(a) * radius,
  );
  camera.lookAt(c);
}

// followCamera(camera, target, { offset, lerp })
// Trails a moving target with exponential smoothing. offset is in the target's
// local frame if target is an Object3D with a quaternion, otherwise world-space.
// lerp ∈ (0,1] controls responsiveness — 1 snaps instantly, ~0.08 feels cinematic.
export function followCamera(camera, target, { offset, lerp = 0.08 } = {}) {
  const c = resolveTarget(target, _tmpT);
  const off = offset ? _tmpV.copy(offset) : _tmpV.set(-6, 3, 6);

  // If target is an Object3D, transform offset into world space by its rotation.
  if (target && target.isObject3D && target.quaternion) {
    off.applyQuaternion(target.quaternion);
  }

  const desiredX = c.x + off.x;
  const desiredY = c.y + off.y;
  const desiredZ = c.z + off.z;

  camera.position.x += (desiredX - camera.position.x) * lerp;
  camera.position.y += (desiredY - camera.position.y) * lerp;
  camera.position.z += (desiredZ - camera.position.z) * lerp;
  camera.lookAt(c);
}

// cinematic(camera, keyframes)
// Interpolates camera.position and camera.lookAt through a sorted array of
// { time, position, lookAt, easing } keyframes. Time is seconds from the first
// call — a WeakMap keyed on the keyframes array remembers the start time so the
// API stays symmetric with orbit/follow (no external clock needed).
const _cinematicStart = new WeakMap();
const _lookFrom = new THREE.Vector3();
const _lookTo   = new THREE.Vector3();

export function cinematic(camera, keyframes) {
  if (!keyframes || keyframes.length === 0) return;

  let start = _cinematicStart.get(keyframes);
  if (start === undefined) {
    start = performance.now();
    _cinematicStart.set(keyframes, start);
  }
  const t = (performance.now() - start) / 1000;

  const total = keyframes[keyframes.length - 1].time;
  const tt = keyframes.length > 1 ? (t % total) : 0;

  // Locate the active segment.
  let i = 0;
  for (; i < keyframes.length - 1; i++) {
    if (tt >= keyframes[i].time && tt < keyframes[i + 1].time) break;
  }
  const a = keyframes[i];
  const b = keyframes[Math.min(i + 1, keyframes.length - 1)];
  const span = Math.max(1e-6, b.time - a.time);
  const u = clamp((tt - a.time) / span, 0, 1);
  const e = (b.easing || easeInOutCubic)(u);

  _lookFrom.fromArray(toArray(a.position));
  _lookTo.fromArray(toArray(b.position));
  camera.position.copy(_lookFrom).lerp(_lookTo, e);

  const la1 = toArray(a.lookAt);
  const la2 = toArray(b.lookAt);
  camera.lookAt(
    la1[0] + (la2[0] - la1[0]) * e,
    la1[1] + (la2[1] - la1[1]) * e,
    la1[2] + (la2[2] - la1[2]) * e,
  );
}

// Internal helpers --------------------------------------------------------

function resolveTarget(t, out) {
  if (!t) return out.set(0, 0, 0);
  if (t.isVector3) return out.copy(t);
  if (t.isObject3D) return out.copy(t.position);
  if ('x' in t && 'y' in t && 'z' in t) return out.set(t.x, t.y, t.z);
  return out.set(0, 0, 0);
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v && v.isVector3) return [v.x, v.y, v.z];
  if (v && 'x' in v) return [v.x, v.y ?? 0, v.z ?? 0];
  return [0, 0, 0];
}

function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }

function easeInOutCubic(u) {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}
