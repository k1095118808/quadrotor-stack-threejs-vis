import * as THREE from 'three';

// createDrone({ scale, bodyColor, accentColor, armLength, showThrustVector })
// Returns { group, update(dt), setThrust(0..1), dispose() }.
//
// Geometry layout: a central body with four arms in an X configuration. Rotors
// at the arm tips counter-rotate in diagonal pairs (front-right + back-left CW,
// front-left + back-right CCW) — the same convention used in the manual.
export function createDrone({
  scale = 1,
  bodyColor = 0x2a2f38,
  accentColor = 0xff3366,
  armLength = 0.55,
  showThrustVector = false,
} = {}) {
  const group = new THREE.Group();
  const disposables = [];
  const rotors = [];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor, metalness: 0.3, roughness: 0.55,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor, metalness: 0.2, roughness: 0.4,
  });
  const armMat = new THREE.MeshStandardMaterial({
    color: 0x1b1e24, metalness: 0.4, roughness: 0.6,
  });
  const rotorMat = new THREE.MeshStandardMaterial({
    color: 0x8a97ab, metalness: 0.2, roughness: 0.8,
    transparent: true, opacity: 0.55, side: THREE.DoubleSide,
  });
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0x111418, metalness: 0.6, roughness: 0.4,
  });
  disposables.push(bodyMat, accentMat, armMat, rotorMat, hubMat);

  // Body — a flattened box with a small accent strip on top.
  const bodyGeo = new THREE.BoxGeometry(0.32, 0.10, 0.40);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);
  disposables.push(bodyGeo);

  const stripeGeo = new THREE.BoxGeometry(0.08, 0.02, 0.36);
  const stripe = new THREE.Mesh(stripeGeo, accentMat);
  stripe.position.y = 0.06;
  group.add(stripe);
  disposables.push(stripeGeo);

  // Four arms in an X. Arm direction signs: (+x +z), (+x -z), (-x -z), (-x +z).
  // Rotor spin signs alternate to keep diagonally-opposite pairs co-rotating.
  const armDirs = [
    { x:  1, z:  1, spin: +1 }, // front-right
    { x:  1, z: -1, spin: -1 }, // back-right
    { x: -1, z: -1, spin: +1 }, // back-left
    { x: -1, z:  1, spin: -1 }, // front-left
  ];

  const armGeo = new THREE.CylinderGeometry(0.022, 0.022, armLength, 8);
  disposables.push(armGeo);

  const rotorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.012, 24);
  const hubGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.05, 12);
  const bladeGeo = new THREE.BoxGeometry(0.34, 0.005, 0.022);
  disposables.push(rotorGeo, hubGeo, bladeGeo);

  for (const dir of armDirs) {
    const arm = new THREE.Mesh(armGeo, armMat);
    const d = armLength / 2;
    arm.position.set(dir.x * d * Math.SQRT1_2, 0, dir.z * d * Math.SQRT1_2);
    // rotate the cylinder so it lies in the xz plane along its direction
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = Math.atan2(dir.z, dir.x);
    group.add(arm);

    const rotor = new THREE.Group();
    rotor.position.set(
      dir.x * armLength * Math.SQRT1_2,
      0.055,
      dir.z * armLength * Math.SQRT1_2,
    );

    const disc = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.add(disc);

    const blade1 = new THREE.Mesh(bladeGeo, accentMat);
    const blade2 = new THREE.Mesh(bladeGeo, accentMat);
    blade2.rotation.y = Math.PI / 2;
    rotor.add(blade1);
    rotor.add(blade2);

    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.y = 0.02;
    rotor.add(hub);

    group.add(rotor);
    rotors.push({ group: rotor, spin: dir.spin });
  }

  // Optional thrust vector (used in Ch3 underactuation / Ch2 thrust demos).
  let thrustArrow = null;
  let thrustScale = 1;
  if (showThrustVector) {
    thrustArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0.08, 0),
      0.9,
      accentColor,
      0.18,
      0.10,
    );
    group.add(thrustArrow);
  }

  group.scale.setScalar(scale);

  // Runtime.
  let baseRpm = 45; // rad/s baseline; update(dt) scales this by thrustScale
  function update(dt) {
    const w = baseRpm * thrustScale * dt;
    for (const r of rotors) r.group.rotation.y += w * r.spin;
  }

  function setThrust(t) {
    thrustScale = Math.max(0, Math.min(1, t));
    if (thrustArrow) thrustArrow.setLength(0.3 + 0.9 * thrustScale, 0.18, 0.10);
  }
  setThrust(0.6); // sensible default so a standalone hover looks alive

  function dispose() {
    for (const d of disposables) d.dispose();
    if (thrustArrow) {
      thrustArrow.line.geometry.dispose();
      thrustArrow.line.material.dispose();
      thrustArrow.cone.geometry.dispose();
      thrustArrow.cone.material.dispose();
    }
  }

  return { group, update, setThrust, dispose };
}
