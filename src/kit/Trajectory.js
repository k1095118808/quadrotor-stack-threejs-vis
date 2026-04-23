import * as THREE from 'three';
import { theme } from './theme.js';

// createPath(waypoints, { closed, tension })
// Builds a Catmull-Rom curve through waypoints plus a sampled Line for
// rendering and a Group of small spheres marking the waypoint positions.
// Callers typically add { line, markers } to the scene and use curve.getPointAt
// (t) / getTangentAt(t) to advance a drone along the path.
export function createPath(waypoints, { closed = true, tension = 0.5 } = {}) {
  const pts = waypoints.map((w) => (w.isVector3 ? w.clone() : new THREE.Vector3(w.x, w.y, w.z)));
  const curve = new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', tension);

  const samples = curve.getPoints(Math.max(64, waypoints.length * 32));
  const lineGeo = new THREE.BufferGeometry().setFromPoints(samples);
  const lineMat = new THREE.LineBasicMaterial({
    color: theme.colors.planning,
    transparent: true,
    opacity: 0.55,
  });
  const line = closed
    ? new THREE.LineLoop(lineGeo, lineMat)
    : new THREE.Line(lineGeo, lineMat);

  const markers = new THREE.Group();
  const markerGeo = new THREE.SphereGeometry(0.09, 12, 8);
  const markerMat = new THREE.MeshBasicMaterial({ color: theme.colors.waypoint });
  for (const p of pts) {
    const m = new THREE.Mesh(markerGeo, markerMat);
    m.position.copy(p);
    markers.add(m);
  }

  // Attach dispose hooks to each returned object so callers don't have to
  // remember which geometries/materials came from this factory.
  line.userData.dispose = () => { lineGeo.dispose(); lineMat.dispose(); };
  markers.userData.dispose = () => { markerGeo.dispose(); markerMat.dispose(); };

  return { curve, line, markers };
}

// createTrail({ maxPoints, color })
// Pre-allocated ring-buffer trail. BufferGeometry is created once with capacity
// for maxPoints vertices; push(vec3) writes into the next slot and bumps the
// draw range. Never calls setFromPoints every frame — that would be O(N) per
// push and crash the tab on a long flight.
export function createTrail({ maxPoints = 1500, color = theme.colors.executed } = {}) {
  const positions = new Float32Array(maxPoints * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);

  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const line = new THREE.Line(geo, mat);
  line.frustumCulled = false; // draw range makes bounding sphere unreliable

  let count = 0;

  function push(vec) {
    const i = (count % maxPoints) * 3;
    positions[i] = vec.x;
    positions[i + 1] = vec.y;
    positions[i + 2] = vec.z;
    count++;
    geo.setDrawRange(0, Math.min(count, maxPoints));
    geo.attributes.position.needsUpdate = true;
    // Once we've wrapped, the line is a ring, not a path — rare in practice
    // because maxPoints is sized generously, but flag it so callers can clear.
  }

  function clear() {
    count = 0;
    geo.setDrawRange(0, 0);
    geo.attributes.position.needsUpdate = true;
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
  }

  return { line, push, clear, dispose };
}
