import * as THREE from 'three';
import { theme } from './theme.js';

// createLidar({ numRays, range, fov })
// Returns { group, cast(origin, quaternion, obstacles), dispose() }.
// The group contains pre-allocated line segments (ray + hit markers). Each call
// to cast() raycasts every ray against obstacles (array of THREE.Object3D) and
// updates the geometries in place. Uses a single Raycaster with .far = range.
export function createLidar({ numRays = 36, range = 4, fov = 360 } = {}) {
  const group = new THREE.Group();

  // Two LineSegments buffers, one for rays (2 verts/ray), one for hit ticks.
  const rayPositions = new Float32Array(numRays * 2 * 3);
  const rayGeo = new THREE.BufferGeometry();
  rayGeo.setAttribute('position', new THREE.BufferAttribute(rayPositions, 3));
  const rayMat = new THREE.LineBasicMaterial({
    color: theme.colors.perception,
    transparent: true,
    opacity: 0.45,
  });
  const rays = new THREE.LineSegments(rayGeo, rayMat);
  rays.frustumCulled = false;
  group.add(rays);

  const hitPositions = new Float32Array(numRays * 2 * 3); // small cross per hit
  const hitGeo = new THREE.BufferGeometry();
  hitGeo.setAttribute('position', new THREE.BufferAttribute(hitPositions, 3));
  const hitMat = new THREE.LineBasicMaterial({
    color: theme.colors.perception,
    transparent: true,
    opacity: 0.9,
  });
  const hits = new THREE.LineSegments(hitGeo, hitMat);
  hits.frustumCulled = false;
  group.add(hits);

  const raycaster = new THREE.Raycaster();
  raycaster.far = range;
  const fovRad = (fov * Math.PI) / 180;

  const tmpOrigin = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();

  function cast(origin, quaternion, obstacles = []) {
    let hitCount = 0;

    for (let i = 0; i < numRays; i++) {
      // Distribute rays across the FOV centered on the device's forward axis.
      // For a 360° LIDAR, this wraps neatly; for a sector it spans −fov/2..+fov/2.
      const a = fov >= 360
        ? (i / numRays) * Math.PI * 2
        : -fovRad / 2 + (i / (numRays - 1)) * fovRad;

      // Ray direction in local xz plane, then rotated into world space by the
      // carrier's orientation (so the fan rotates with the drone).
      tmpDir.set(Math.cos(a), 0, Math.sin(a)).applyQuaternion(quaternion);
      tmpOrigin.copy(origin);

      raycaster.set(tmpOrigin, tmpDir);
      const intersections = raycaster.intersectObjects(obstacles, true);
      const hit = intersections[0];
      const dist = hit ? hit.distance : range;

      const ox = tmpOrigin.x;
      const oy = tmpOrigin.y;
      const oz = tmpOrigin.z;
      const ex = ox + tmpDir.x * dist;
      const ey = oy + tmpDir.y * dist;
      const ez = oz + tmpDir.z * dist;

      const base = i * 6;
      rayPositions[base]     = ox;
      rayPositions[base + 1] = oy;
      rayPositions[base + 2] = oz;
      rayPositions[base + 3] = ex;
      rayPositions[base + 4] = ey;
      rayPositions[base + 5] = ez;

      if (hit) {
        // Short perpendicular tick at the hit point so hits read as marks.
        const tickLen = 0.08;
        // Perpendicular in xz plane
        const px = -tmpDir.z, pz = tmpDir.x;
        const hBase = hitCount * 6;
        hitPositions[hBase]     = ex - px * tickLen;
        hitPositions[hBase + 1] = ey;
        hitPositions[hBase + 2] = ez - pz * tickLen;
        hitPositions[hBase + 3] = ex + px * tickLen;
        hitPositions[hBase + 4] = ey;
        hitPositions[hBase + 5] = ez + pz * tickLen;
        hitCount++;
      }
    }

    rayGeo.setDrawRange(0, numRays * 2);
    rayGeo.attributes.position.needsUpdate = true;
    hitGeo.setDrawRange(0, hitCount * 2);
    hitGeo.attributes.position.needsUpdate = true;

    return hitCount;
  }

  function dispose() {
    rayGeo.dispose();
    rayMat.dispose();
    hitGeo.dispose();
    hitMat.dispose();
  }

  return { group, cast, dispose };
}

// createFrustum({ fov, aspect, near, far })
// Returns a THREE.LineSegments wireframe pyramid representing a camera's view
// volume. The pyramid apex sits at the carrier's origin and the far plane is
// drawn as a rectangle. Intended to be attached to a drone group so it follows
// the camera's local orientation.
export function createFrustum({ fov = 60, aspect = 1.5, near = 0.1, far = 2.5 } = {}) {
  const vFov = (fov * Math.PI) / 180;
  const hNear = Math.tan(vFov / 2) * near;
  const wNear = hNear * aspect;
  const hFar = Math.tan(vFov / 2) * far;
  const wFar = hFar * aspect;

  // Camera convention: looking down -Z, up is +Y, right is +X.
  const n = -near;
  const f = -far;
  const nearQuad = [
    new THREE.Vector3(-wNear, -hNear, n),
    new THREE.Vector3( wNear, -hNear, n),
    new THREE.Vector3( wNear,  hNear, n),
    new THREE.Vector3(-wNear,  hNear, n),
  ];
  const farQuad = [
    new THREE.Vector3(-wFar, -hFar, f),
    new THREE.Vector3( wFar, -hFar, f),
    new THREE.Vector3( wFar,  hFar, f),
    new THREE.Vector3(-wFar,  hFar, f),
  ];

  const pts = [];
  // near rectangle
  for (let i = 0; i < 4; i++) { pts.push(nearQuad[i], nearQuad[(i + 1) % 4]); }
  // far rectangle
  for (let i = 0; i < 4; i++) { pts.push(farQuad[i], farQuad[(i + 1) % 4]); }
  // connecting edges
  for (let i = 0; i < 4; i++) { pts.push(nearQuad[i], farQuad[i]); }

  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color: theme.colors.perception,
    transparent: true,
    opacity: 0.7,
  });
  const frustum = new THREE.LineSegments(geo, mat);
  frustum.frustumCulled = false;
  return frustum;
}
