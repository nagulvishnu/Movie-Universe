// Enormous highway: alive (traffic, moment of the Silence) and ruined (jammed, overgrown wreckage).
import * as THREE from 'three';
import { Batch, Fleet, grass, instanced, compose, mat, rng, texMat, trees, rocks, type CarDef } from '../engine/props';
import { tex } from '../engine/textures';
import { box3, signTexture, stopTime, wrap, birdFlock, type EnvInstance } from './common';

export function buildHighway(mode: string): EnvInstance {
  const ruined = mode === 'ruined';
  const g = new THREE.Group(), b = new Batch(), R = rng(ruined ? 77 : 12);
  const colliders: THREE.Box3[] = [];
  const asph = texMat(tex.asphalt(ruined), 8, 0.92), grassM = texMat(tex.grass(), 8, 1), conc = texMat(tex.concrete(), 4, 0.95);
  const paint = mat(ruined ? 0x9a9a82 : 0xf0ecd0, 0.9), steel = mat(0x8a9094, 0.5, 0.7);

  b.box(grassM, 900, 0.2, 900, 0, -0.12, 0);
  b.box(asph, 12.5, 0.1, 440, -9.5, -0.05, 0).box(asph, 12.5, 0.1, 440, 9.5, -0.05, 0);   // carriageways x∈[-15.75,-3.25] / [3.25,15.75]
  b.box(texMat(tex.dirt(), 6, 1), 6, 0.06, 440, 0, -0.03, 0); // median (dirt/grass strip)
  for (const s of [-1, 1]) b.box(asph, 3, 0.1, 440, s * 17.5, -0.05, 0);
  for (let z = -210; z < 210; z += 9) for (const x of [-12.5, -9, -5.4, 5.4, 9, 12.5]) { if (x === -9 || x === 9 || x === -12.5 || x === 12.5 || x === -5.4 || x === 5.4) b.box(paint, 0.15, 0.02, 3.5, x < 0 ? x - 1.8 : x + 1.8, 0.01, z); }
  for (const s of [-1, 1]) b.box(paint, 0.2, 0.02, 440, s * 16, 0.012, 0).box(paint, 0.2, 0.02, 440, s * 3.4, 0.012, 0);
  // crash barriers (with a gap at z -6..7)
  const bar = mat(0xa8adb0, 0.5, 0.7);
  for (const s of [-1, 1]) for (let z = -210; z < 210; z += 4) { if (z > -7 && z < 7) continue; b.box(bar, 0.12, 0.6, 3.9, s * 3, 0.55, z + 2, 0, 0, ruined && R() < 0.1 ? 0.3 : 0).box(steel, 0.12, 0.8, 0.12, s * 3, 0.4, z); }
  // overpass
  b.box(conc, 48, 1.1, 8, 0, 7.5, -62).box(conc, 1.5, 7, 6, -18, 3.5, -62).box(conc, 1.5, 7, 6, 18, 3.5, -62).box(bar, 48, 0.9, 0.2, 0, 8.5, -58.1).box(bar, 48, 0.9, 0.2, 0, 8.5, -65.9);
  colliders.push(box3(-24, 6.9, -66, 24, 8.1, -58));
  // sign gantry
  b.cyl(steel, 0.25, 0.25, 7, -17.5, 3.5, 40, 8).cyl(steel, 0.25, 0.25, 7, 17.5, 3.5, 40, 8).box(steel, 36, 0.5, 0.5, 0, 6.8, 40);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(14, 3), new THREE.MeshStandardMaterial({ map: signTexture('STATION 17  ▲  412 km', '#14582e', '#f2f2f2', 768, 160, ruined), roughness: 0.6 }));
  sg.position.set(-5, 5.2, 39.7); sg.rotation.y = Math.PI; sg.userData.own = true; g.add(sg);
  const sg2 = sg.clone(); sg2.position.set(-5, 5.2, 40.3); sg2.rotation.y = 0; g.add(sg2);

  // cars
  const palette = ruined ? [0x6b4a38, 0x4e5a60, 0x5c4a4a, 0x68675a, 0x3f4a42, 0x7a6a50, 0x8a7a6a, 0x5a4a60] : [0xc03030, 0x2f5fb0, 0xe8e8e8, 0x202428, 0xd9b030, 0x3a8a58, 0xbfc4c8];
  const lanes = [-12.5, -9, -5.4, 5.4, 9, 12.5];
  const defs: CarDef[] = [];
  const free = (x: number, z: number) => !(x > 3 && x < 8 && z > -3 && z < 8); // keep hero car area clear
  if (ruined) {
    for (let i = 0; i < 150; i++) {
      const lane = lanes[Math.floor(R() * 6)], x = lane + (R() - 0.5) * 0.9, z = -200 + R() * 400;
      if (!free(x, z) || Math.abs(z + 62) < 3) continue;
      if (defs.some((d) => Math.abs(d.x - x) < 2.2 && Math.abs(d.z - z) < 5.2)) continue;
      const big = R() < 0.12;
      defs.push({ x, z, ry: (lane < 0 ? Math.PI : 0) + (R() - 0.5) * 0.25, color: palette[Math.floor(R() * palette.length)], scale: big ? [1.3, 2.1, 2.3] : undefined, tilt: R() < 0.04 ? 0.35 : 0 });
    }
  } else {
    for (let i = 0; i < 44; i++) { const lane = lanes[i % 6]; defs.push({ x: lane, z: -200 + ((i * 23.7) % 400), ry: lane < 0 ? Math.PI : 0, color: palette[i % palette.length], scale: i % 9 === 0 ? [1.3, 2.1, 2.3] : undefined }); }
  }
  const fleet = new Fleet(defs, ruined); g.add(fleet.group); fleet.commit();
  const moving = ruined ? 0 : defs.length;
  defs.forEach((d) => { if (ruined) { const s = d.scale ?? [1, 1, 1]; colliders.push(box3(d.x - 1 * s[0], 0, d.z - 2.3 * s[2], d.x + 1 * s[0], 1.8 * s[1], d.z + 2.3 * s[2])); } });

  if (ruined) {
    // vines/moss over car roofs
    const leaf = mat(0x3b5a28, 1);
    defs.forEach((d, i) => { if (i % 2 === 0) { const s = d.scale ?? [1, 1, 1]; b.box(leaf, 1.3 * s[0], 0.12, 1.8 * s[2], d.x, 1.75 * s[1] + (s[1] > 1.5 ? 0.9 : 0), d.z - 0.2, d.ry); } });
    // hero car: family station wagon, door open
    const hx = 6.4, hz = 2.5, body = mat(0x4a6a8a, 0.55, 0.3), dark = mat(0x1a232b, 0.2, 0.5), tyre = mat(0x151515, 1);
    b.box(body, 2.0, 0.8, 4.7, hx, 0.75, hz, 0.12).box(dark, 1.8, 0.65, 3.3, hx, 1.45, hz - 0.3, 0.12).box(steel, 1.5, 0.06, 2.6, hx, 1.82, hz - 0.3, 0.12);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(tyre, 0.38, 0.38, 0.28, hx + sx * 1.0 + sz * 0.17, 0.38, hz + sz * 1.5, 10, 0, 0, Math.PI / 2);
    b.box(body, 0.08, 0.8, 1.3, hx - 2.0, 1.1, hz + 1.1, 1.4).box(mat(0xaa3a3a, 0.9), 0.5, 0.5, 0.5, hx + 0.1, 1.15, hz - 1.4, 0.12).box(mat(0xd0b030, 0.9), 0.3, 0.3, 0.3, hx - 0.5, 0.95, hz - 0.9);
    colliders.push(box3(hx - 1.1, 0, hz - 2.4, hx + 1.1, 1.9, hz + 2.4));
    // vegetation
    g.add(grass(4200, 0, 0, 36, 420, 6, 0.8, (x) => Math.abs(x) < 0.0));
    g.add(grass(900, 0, 0, 5.5, 60, 14, 1.1));
    const tl: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 70; i++) { const s = i % 2 ? 1 : -1; tl.push({ x: s * (20 + R() * 40), z: -200 + R() * 400, s: 1 + R() * 1.4 }); }
    for (let i = 0; i < 12; i++) tl.push({ x: (R() - 0.5) * 6, z: -150 + R() * 300, s: 0.7 + R() * 0.5 });
    g.add(trees(tl.filter((t) => !(Math.abs(t.x) < 1.5 && Math.abs(t.z) < 14)), 4, 0x44602e));
    // bushes in lanes
    g.add(instanced(new THREE.IcosahedronGeometry(1, 1), mat(0x3a5a2a, 1), 90, (_i, mx, col) => { compose((R() - 0.5) * 30, 0.4, -200 + R() * 400, R() * 6, 0.6 + R() * 0.8, 0.5 + R() * 0.5, 0.6 + R() * 0.8, mx); col.setRGB(0.7 + R() * 0.4, 0.8 + R() * 0.3, 0.6); }, false));
    g.add(rocks(40, 0, 0, 40, 400, 0.5, 8, 0x6a6a64));
  } else {
    g.add(trees(Array.from({ length: 50 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * (21 + R() * 20), z: -200 + i * 8, s: 1 + R() * 0.5 })), 5, 0x4f7a34));
    g.add(grass(300, 0, 0, 5, 380, 3, 0.4));
  }
  // hills
  const hills = instanced(new THREE.IcosahedronGeometry(1, 2), mat(0x58704a, 1), 14, (i, mx, col) => { const s = i % 2 ? 1 : -1; compose(s * (150 + R() * 90), 0, -200 + (i / 14) * 450 + R() * 20, R() * 6, 70 + R() * 50, 28 + R() * 30, 70 + R() * 40, mx); col.setRGB(0.7 + R() * 0.3, 0.8 + R() * 0.2, 0.6 + R() * 0.2); }, false);
  g.add(hills);
  // city silhouette at the far end
  const sil = mat(0x3a4048, 1);
  for (let i = 0; i < 18; i++) b.box(sil, 12 + R() * 14, 30 + R() * 70, 14, -110 + i * 12 + R() * 6, 25, 300 + R() * 20);
  b.build(g);
  const flock = ruined ? birdFlock(12, 8, 0, 22, 20, 50) : null; if (flock) g.add(flock.group);

  return {
    group: g, colliders,
    update(t, p) {
      if (!ruined) {
        const stopAt = p.stopAt ?? 1e9, f = stopTime(t, stopAt);
        for (let i = 0; i < moving; i++) { const d = defs[i], dir = Math.cos(d.ry) > 0 ? 1 : -1; fleet.set(i, d.x, wrap(d.z + dir * 24 * f, -200, 200), d.ry); }
        fleet.commit();
      } else flock?.update(t);
    },
  };
}
