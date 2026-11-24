// Old steel truss bridge over a gorge, in a storm. Deck segments z∈[-6,6] collapse at params.collapseAt.
import * as THREE from 'three';
import { Batch, Fleet, mat, rng, texMat, rocks, trees, grass, TIME } from '../engine/props';
import { tex } from '../engine/textures';
import { box3, type EnvInstance } from './common';

export function buildBridge(): EnvInstance {
  const g = new THREE.Group(), R = rng(88);
  const colliders: THREE.Box3[] = [];
  const _unused = 0; void _unused;
  const deckM = texMat(tex.concrete(true), 3, 0.7), steel = mat(0x6a5448, 0.55, 0.65), steelD = mat(0x3a3a3e, 0.5, 0.7);
  const rockM = texMat(tex.concrete(true), 5, 1, 0x8a8a84);

  const segBatch = (z0: number, b: Batch) => {
    const zc = z0 + 2;
    b.box(deckM, 9.2, 0.6, 3.96, 0, -0.3, zc).box(mat(0x2b2c2e, 0.8), 8.6, 0.04, 3.9, 0, 0.02, zc);
    for (const s of [-1, 1]) {
      b.box(deckM, 0.5, 0.35, 4, s * 4.4, 0.18, zc);
      b.box(steel, 0.18, 5, 0.18, s * 4.6, 2.5, z0).box(steel, 0.12, 0.12, 4, s * 4.6, 5, zc).box(steel, 0.1, 1, 0.1, s * 4.6, 1.0, zc).box(steel, 0.08, 0.08, 4, s * 4.6, 1.1, zc);
      const L = Math.hypot(4, 5), a = Math.atan2(4, 5);
      b.box(steelD, 0.09, 0.09, L, s * 4.6, 2.5, zc, 0, -a * (z0 % 8 === 0 ? 1 : -1), 0);
    }
    b.box(steel, 9.2, 0.18, 0.18, 0, 5, z0);
    b.box(steelD, 0.22, 0.3, 3.9, -2.2, -0.75, zc).box(steelD, 0.22, 0.3, 3.9, 2.2, -0.75, zc);
  };

  // static parts
  const sb = new Batch();
  const FALL = [-6, -2, 2];
  for (let z0 = -48; z0 < 48; z0 += 4) { if (FALL.includes(z0)) continue; segBatch(z0, sb); }
  // abutments / gorge walls
  const cliff = (zs: number) => {
    sb.slab(rockM, -250, -22, zs * 46, 250, 0, zs * 120);
    for (let i = 0; i < 6; i++) sb.box(rockM, 500, 3.5, 3, 0, -3 - i * 3.2, zs * (45 - i * 2.2), 0, -zs * 0.2, 0);
    for (let i = 0; i < 10; i++) sb.box(rockM, 8 + R() * 14, 2 + R() * 6, 4 + R() * 5, -120 + i * 26 + R() * 8, -4 - R() * 14, zs * (42 + R() * 6), R(), 0, 0);
  };
  cliff(1); cliff(-1);
  sb.slab(mat(0x2b2c2e, 0.9), -5, 0.0, 46, 5, 0.04, 90).slab(mat(0x2b2c2e, 0.9), -5, 0.0, -90, 5, 0.04, -46);
  sb.build(g);
  colliders.push(box3(-5, -2, -48, 5, 0.1, -6.2), box3(-5, -2, 6.2, 5, 0.1, 48));
  g.add(rocks(60, 0, 70, 120, 40, 2, 3, 0x6e6e68), rocks(60, 0, -70, 120, 40, 2, 4, 0x6e6e68));
  g.add(trees(Array.from({ length: 30 }, (_, i) => ({ x: -100 + i * 7 + R() * 4, z: (i % 2 ? 1 : -1) * (58 + R() * 40), s: 1.2 + R() })), 7, 0x34482a));
  g.add(grass(900, 0, 70, 160, 40, 5, 0.6), grass(900, 0, -70, 160, 40, 6, 0.6));
  // water
  const wt = tex.water(); wt.repeat.set(30, 30);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ map: wt, color: 0x9ab4c0, roughness: 0.15, metalness: 0.4 }));
  water.rotation.x = -Math.PI / 2; water.position.y = -20; water.receiveShadow = true; water.userData.own = true; g.add(water);

  // cars on bridge (outside the collapse zone, off the walking line)
  const fleet = new Fleet([{ x: 3, z: -30, ry: 0.1, color: 0x5a4a4a }, { x: -2.9, z: -16, ry: Math.PI - 0.15, color: 0x4a5a60 }, { x: 3, z: 20, ry: 0.05, color: 0x6a6a52, scale: [1.2, 1.6, 1.8] }, { x: -3, z: 34, ry: 3.1, color: 0x4a4a52 }], true);
  g.add(fleet.group); fleet.commit();
  colliders.push(box3(1.9, 0, -32.4, 4.1, 1.8, -27.6), box3(-4, 0, -18.4, -1.8, 1.8, -13.6), box3(1.5, 0, 16, 4.5, 3, 24), box3(-4.1, 0, 31.7, -1.9, 1.8, 36.3));

  // falling segments
  const falls = FALL.map((z0, k) => { const grp = new THREE.Group(), fb = new Batch(); segBatch(z0, fb); fb.build(grp); grp.position.set(0, 0, z0 + 2); grp.children.forEach((c) => c.position.z -= z0 + 2); g.add(grp); return { grp, z0, k }; });
  // debris chunks
  const chunkG = new THREE.BoxGeometry(0.35, 0.25, 0.3), cm = mat(0x6a6a64, 1);
  const chunks = Array.from({ length: 36 }, () => { const m = new THREE.Mesh(chunkG, cm); m.castShadow = true; g.add(m); return { m, x: (R() - 0.5) * 7, z: -6 + R() * 12, vx: (R() - 0.5) * 2, vz: (R() - 0.5) * 2, d: R() * 1.8, r: R() * 6 }; });

  return {
    group: g, colliders,
    update(t, p) {
      const ca = p.collapseAt ?? 1e9;
      wt.offset.set(TIME.value * 0.01, TIME.value * 0.02);
      for (const f of falls) {
        const ts = ca + (f.z0 === 2 ? 0 : f.z0 === -2 ? 0.6 : 1.2), dt = t - ts;
        const zc = f.z0 + 2;
        if (dt < 0) { const tremor = t > ca - 1.5 && f.z0 === 2 ? Math.sin(t * 40) * 0.006 * Math.min(1, (t - ca + 1.5)) : 0; f.grp.position.set(0, tremor, zc); f.grp.rotation.set(0, 0, 0); f.grp.visible = true; continue; }
        const y = -0.5 * 11 * dt * dt;
        f.grp.visible = y > -40;
        f.grp.position.set((f.k - 1) * 0.1 * dt, y, zc);
        f.grp.rotation.set(-dt * (0.45 + f.k * 0.12), 0, (f.k % 2 ? 1 : -1) * dt * 0.3);
        // keep hinge at the far edge for the first segment: lift slightly so it appears to tear away
        if (f.z0 === 2) f.grp.rotation.x = dt * 0.55;
      }
      for (const c of chunks) {
        const dt = t - ca - c.d;
        c.m.visible = dt > 0 && dt < 3.5;
        if (dt > 0) { c.m.position.set(c.x + c.vx * dt, 0.3 - 0.5 * 12 * dt * dt + 1.2 * dt, c.z + c.vz * dt); c.m.rotation.set(dt * 3 + c.r, dt * 2, c.r); }
      }
    },
  };
}
