// City: 'alive' (opening, 11:47 AM) and 'ruined' (five years later). Same street layout in both.
import * as THREE from 'three';
import { Batch, Fleet, grass, mat, rng, rocks, texMat, trees, type CarDef } from '../engine/props';
import { tex } from '../engine/textures';
import { animatePed, box3, makePed, signTexture, stopTime, wrap, birdFlock, type EnvInstance, type Ped } from './common';

export function buildCity(mode: string): EnvInstance {
  const ruined = mode === 'ruined';
  const g = new THREE.Group(), b = new Batch(), R = rng(ruined ? 21 : 11);
  const colliders: THREE.Box3[] = [];
  const asph = texMat(tex.asphalt(ruined), 8, 0.95), conc = texMat(tex.concrete(), 4, 0.95);
  const groundM = ruined ? texMat(tex.grass(), 6, 1) : texMat(tex.concrete(true), 6, 1);

  // ground, roads, sidewalks
  b.box(groundM, 760, 0.2, 760, 0, -0.1, 0);
  b.box(asph, 14, 0.1, 340, 0, -0.05, 0).box(asph, 340, 0.1, 14, 0, -0.04, 0).box(asph, 340, 0.1, 14, 0, -0.045, -70);
  for (const s of [-1, 1]) { b.box(conc, 3.2, 0.08, 340, s * 8.6, 0.0, 0); }
  // markings
  const paint = mat(ruined ? 0x8a8a78 : 0xe8e2c0, 0.9);
  for (let z = -160; z < 160; z += 6) if (Math.abs(z) > 9 && Math.abs(z + 70) > 9) b.box(paint, 0.18, 0.02, 3, 0, 0.012, z);
  for (let i = -3; i <= 3; i++) for (const zz of [-8.5, 8.5]) b.box(paint, 0.6, 0.02, 3, i * 1.8, 0.015, zz);
  for (const s of [-1, 1]) b.box(paint, 0.12, 0.02, 340, s * 6.6, 0.012, 0);

  // buildings
  const bm = [0, 1, 2, 3].map((i) => texMat(tex.facade(ruined, i), 8, 0.85));
  const roofM = mat(0x4a4c4e, 0.95), acM = mat(0x6a6d6e, 0.8, 0.3);
  const vine = mat(0x3b5a28, 1);
  const bands = [[-9, 9], [-79, -61], [37, 53], [-34, -7]];
  const building = (x0: number, z0: number, w: number, d: number, h: number, i: number, side: number) => {
    b.slab(bm[i % 4], x0, 0, z0, x0 + w, h, z0 + d);
    b.box(roofM, w + 0.4, 0.4, d + 0.4, x0 + w / 2, h + 0.2, z0 + d / 2);
    for (let k = 0; k < 2; k++) b.box(acM, 2 + R() * 2, 1.2, 2 + R() * 2, x0 + 2 + R() * (w - 5), h + 1, z0 + 2 + R() * (d - 5));
    colliders.push(box3(x0, 0, z0, x0 + w, h, z0 + d));
    if (ruined && side !== 0 && Math.abs(x0) < 40) {
      const face = side * 10.88;
      for (let k = 0; k < 3; k++) b.box(vine, 0.35, 3 + R() * 9, 1.2 + R() * 3.5, face, 1.5 + R() * 4, z0 + 1 + R() * (d - 2));
    }
  };
  for (const side of [-1, 1]) {
    let z = -150;
    while (z < 145) {
      const d = 14 + R() * 10, z1 = z + d;
      const hit = bands.find((bd) => z1 > bd[0] && z < bd[1]);
      if (hit) { z = hit[1] + 0.5; continue; }
      const w = 14 + R() * 12, h = ruined ? 14 + R() * 46 : 16 + R() * 50;
      building(side < 0 ? -(11 + w) : 11, z, w, d, h, Math.floor(R() * 4), side);
      z = z1 + 1.2 + R() * 2.5;
    }
  }
  // distant skyline
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, z = -190 + i * 15 + R() * 8, w = 18 + R() * 14, h = 45 + R() * 80;
    b.slab(bm[i % 4], side * (46 + R() * 40), 0, z, side * (46 + R() * 40) + w, h, z + 22);
  }
  for (let i = 0; i < 10; i++) { const x = -90 + i * 20 + R() * 8; b.slab(bm[i % 4], x, 0, 175 + R() * 30, x + 22, 40 + R() * 70, 200 + R() * 30); b.slab(bm[(i + 1) % 4], x, 0, -215 - R() * 20, x + 22, 40 + R() * 70, -195 - R() * 20); }

  // supermarket (left lot)
  const shell = mat(0x9a948a, 0.9), glass = mat(0x172329, 0.08, 0.7), darkM = mat(0x050505, 1), rustM = mat(0x7b3a2a, 0.9);
  b.slab(shell, -32, 0, -33, -11, 6.6, -8);
  b.box(mat(0x3a3d3f), 21.4, 0.5, 25.4, -21.5, 6.85, -20.5);
  b.box(glass, 0.12, 3.2, 5.2, -10.92, 2.2, -26).box(glass, 0.12, 3.2, 5.2, -10.92, 2.2, -14.2).box(darkM, 0.2, 3.1, 3.4, -10.9, 1.55, -20.1);
  b.box(rustM, 0.3, 0.4, 14, -10.8, 4.2, -20.1);
  colliders.push(box3(-32, 0, -33, -11, 6.6, -8));
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(11, 1.9), new THREE.MeshStandardMaterial({ map: signTexture(ruined ? 'SUPERMARKET' : 'SUPERMARKET', ruined ? '#6e1f1a' : '#c0282a', '#f1ead8', 512, 90, ruined), roughness: 0.8 })));
  const sign = g.children[g.children.length - 1]; sign.position.set(-10.7, 5.4, -20.1); sign.rotation.y = Math.PI / 2; sign.userData.own = true;

  // playground (right lot)
  const metal = mat(ruined ? 0x7a4a30 : 0xd04040, 0.6, 0.4), yellow = mat(0xe0b020, 0.7);
  b.cyl(metal, 0.06, 0.06, 3, 16, 1.5, -26, 6).cyl(metal, 0.06, 0.06, 3, 20, 1.5, -26, 6).box(metal, 4.4, 0.08, 0.08, 18, 3, -26);
  b.box(yellow, 0.5, 0.05, 0.3, 17.2, 0.9, -26).box(yellow, 0.5, 0.05, 0.3, 18.8, 0.9, -26);
  b.box(mat(0x3050a0, 0.7), 1.2, 0.1, 5, 14.2, 1.4, -17, 0, 0.5).box(metal, 1.4, 1.4, 1.4, 14.2, 2.4, -14.5);
  if (!ruined) b.slab(mat(0x4f8a3a, 1), 12, 0.0, -33, 30, 0.03, -8);

  // street lamps
  const pole = mat(0x45494a, 0.5, 0.6);
  for (let z = -140; z <= 140; z += 24) for (const s of [-1, 1]) {
    if (Math.abs(z) < 10 || Math.abs(z + 70) < 10) continue;
    b.cyl(pole, 0.08, 0.1, 8, s * 7.4, 4, z, 6).box(pole, 1.6, 0.1, 0.1, s * 6.6, 7.9, z).box(mat(0xdddddd, 0.5), 0.5, 0.12, 0.25, s * 5.9, 7.85, z);
  }
  // traffic lights at main intersection
  const lampMats = [new THREE.MeshBasicMaterial({ color: 0xff2a1a }), new THREE.MeshBasicMaterial({ color: 0x22ff66 }), new THREE.MeshBasicMaterial({ color: 0xffb020 })];
  for (const [px, pz] of [[7.2, 7.5], [-7.2, 7.5], [7.2, -7.5], [-7.2, -7.5]]) {
    b.cyl(pole, 0.07, 0.07, 5, px, 2.5, pz, 6).box(mat(0x1a1c1d), 0.4, 1.2, 0.35, px, 5.4, pz);
    lampMats.forEach((lm, i) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), lm); l.position.set(px - Math.sign(px) * 0.0, 5.8 - i * 0.35, pz + 0.19); g.add(l); });
  }

  // viaduct + train
  const vi = mat(0x77797a, 0.9);
  b.box(vi, 340, 1.1, 7, 0, 9.5, 45).box(mat(0x404243, 0.7), 340, 0.2, 0.3, 0, 10.2, 43.4).box(mat(0x404243, 0.7), 340, 0.2, 0.3, 0, 10.2, 46.6);
  for (let x = -140; x <= 140; x += 28) b.box(vi, 1.6, 9, 4, x, 4.5, 45);
  const trainM = mat(ruined ? 0x6a5a48 : 0xc8ccd0, ruined ? 0.9 : 0.4, ruined ? 0.3 : 0.6);
  const train = new THREE.Group();
  for (let i = 0; i < 4; i++) { const car = new THREE.Mesh(new THREE.BoxGeometry(13, 3.2, 3), trainM); car.position.set(i * 14, 12.3, 45); car.castShadow = true; train.add(car); const st = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.7, 3.04), glass); st.position.set(i * 14, 12.7, 45); train.add(st); }
  g.add(train);

  // cars
  const palette = ruined ? [0x6b4a38, 0x4e5a60, 0x5c4a4a, 0x68675a, 0x3f4a42, 0x7a6a50] : [0xc03030, 0x2f5fb0, 0xe8e8e8, 0x202428, 0xd9b030, 0x3a8a58, 0xbfc4c8];
  const defs: CarDef[] = [];
  if (ruined) {
    for (let i = 0; i < 46; i++) {
      const x = (R() < 0.5 ? -1 : 1) * (3.4 + R() * 2.6), z = -150 + R() * 300;
      if (z > 6 && z < 34 && x < 0) continue;
      if (Math.abs(z) < 9 || Math.abs(z + 70) < 9) continue;
      defs.push({ x, z, ry: (R() < 0.5 ? 0 : Math.PI) + (R() - 0.5) * 0.5, color: palette[Math.floor(R() * palette.length)], tilt: R() < 0.07 ? 0.5 : 0 });
    }
    // bus blocking cross street
    defs.push({ x: 27, z: 3, ry: 1.2, color: 0x6a6a52, scale: [1.35, 1.9, 2.4] });
    defs.push({ x: -22, z: -3.5, ry: 1.6, color: 0x4a5a6a }, { x: -14, z: 3, ry: 1.5, color: 0x6b4a38 });
  } else {
    for (let i = 0; i < 20; i++) { const dir = i % 2 ? 1 : -1; defs.push({ x: dir * (2.6 + (i % 4 === 0 ? 3.4 : 0)), z: -140 + (i * 15.3) % 280, ry: dir > 0 ? 0 : Math.PI, color: palette[i % palette.length] }); }
    for (let i = 0; i < 10; i++) defs.push({ x: (i % 2 ? 1 : -1) * 5.4, z: -130 + i * 26 + (i % 3) * 3, ry: i % 2 ? 0 : Math.PI, color: palette[(i + 3) % palette.length] });
    defs.push({ x: 6, z: 32, ry: Math.PI, color: 0xe8e8e8, scale: [1.3, 1.8, 2.2] });
  }
  const fleet = new Fleet(defs, ruined); g.add(fleet.group);
  const moving = ruined ? 0 : 20;
  fleet.commit();

  // overgrowth / props
  if (ruined) {
    g.add(grass(2600, 0, 0, 30, 300, 4, 0.7));
    g.add(grass(500, 18, -20, 24, 26, 5, 0.9));
    const tl: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 20; i++) { const s = (i % 3) - 1; tl.push({ x: s * (9 + R() * 3) + (R() < 0.3 ? s * -6 : 0), z: -140 + R() * 280, s: 0.9 + R() * 0.8 }); }
    tl.push({ x: 5, z: 3, s: 1.4 }, { x: -4, z: -4, s: 1.1 }, { x: 18, z: -22, s: 1.6 });
    g.add(trees(tl.filter((t) => !(Math.abs(t.x) < 3.5)), 9, 0x40582b));
    g.add(rocks(70, 15, -52, 10, 22, 1.5, 4, 0x77746c));
    g.add(rocks(60, 0, 0, 12, 280, 0.35, 7, 0x5a5850));
    // leaning tower
    b.box(bm[1], 16, 30, 16, -24, 15, -52, 0, 0, -0.07);
    // camp (campfire ring, bedroll, crate, tarp)
    const stone = mat(0x6a6a66, 1), wood = mat(0x4a3220, 1);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283; b.sph(stone, 0.13, -4 + Math.cos(a) * 0.5, 0.08, 22 + Math.sin(a) * 0.5, 1.2, 0.8, 1); }
    b.cyl(wood, 0.07, 0.07, 0.8, -4, 0.1, 22, 6, 0, 0.5, Math.PI / 2).cyl(wood, 0.07, 0.07, 0.8, -4, 0.1, 22, 6, 0, -0.5, Math.PI / 2);
    b.cyl(mat(0x55603f, 1), 0.28, 0.28, 0.9, -5.7, 0.12, 22.7, 8, 0, 0.3, Math.PI / 2); // bedroll
    b.box(mat(0x4a5a3a, 1), 3.2, 0.06, 2.2, -5.7, 1.6, 23.9, 0, 0.6, 0).cyl(wood, 0.04, 0.04, 1.9, -7.2, 0.95, 24.8, 5).cyl(wood, 0.04, 0.04, 1.9, -4.2, 0.95, 24.8, 5);
    b.box(mat(0x6a5a3a, 0.9), 0.7, 0.45, 0.5, -2.6, 0.22, 20.2, 0.4);
    // fallen pole + barricade
    b.cyl(pole, 0.1, 0.12, 8, 5, 0.3, 14, 6, 0, 0.6, Math.PI / 2 + 0.1);
  } else {
    g.add(trees(Array.from({ length: 22 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * 9.4, z: -135 + i * 12.5, s: 0.9 + R() * 0.4 })).filter((t) => Math.abs(t.z) > 10 && Math.abs(t.z + 70) > 10), 3, 0x4f7a34));
    g.add(grass(260, 21, -20, 16, 20, 2, 0.35));
  }
  b.build(g);

  // pedestrians + kids (alive) / birds (ruined)
  interface P { m: Ped; x: number; z0: number; dir: number; sp: number; kid: boolean; cx?: number; cz?: number; rad?: number; w?: number }
  const peds: P[] = [];
  const left = new THREE.Group(); g.add(left);
  const bag = new THREE.BoxGeometry(0.4, 0.25, 0.25), coat = new THREE.BoxGeometry(0.55, 0.06, 0.4);
  const leftMats = [0x3a5f9a, 0x9a3a3a, 0x3a7a5a, 0x7a6a3a].map((c) => mat(c, 0.95));
  if (!ruined) {
    const clothes = [0xc0504a, 0x4a78c0, 0x6aa05a, 0xe0c060, 0x8a5aa0, 0xdddddd, 0x303840, 0xd88a50];
    const skins = [0xc79273, 0xdba784, 0x8a5a3c, 0xf0c8a8, 0x6b4430];
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1, kid = false;
      const m = makePed(clothes[i % 8], skins[i % 5], [0x333b4a, 0x4a3a2a, 0x2a2a2a][i % 3], 0.95 + R() * 0.12);
      peds.push({ m, x: side * (8.3 + R() * 1.2), z0: -60 + R() * 120, dir: R() < 0.5 ? 1 : -1, sp: 1.0 + R() * 0.5, kid });
      g.add(m);
    }
    for (let i = 0; i < 8; i++) { const m = makePed(clothes[(i + 3) % 8], skins[i % 5], 0x333b4a, 0.97); peds.push({ m, x: -5 + i * 1.4, z0: 8.8 + (i % 2) * 0.4, dir: 0, sp: 0, kid: false, w: i }); g.add(m); }
    for (let i = 0; i < 6; i++) {
      const m = makePed(clothes[(i * 3) % 8], skins[i % 5], 0x2f4f8a, 0.6 + R() * 0.08);
      peds.push({ m, x: 0, z0: 0, dir: 1, sp: 1.6 + R(), kid: true, cx: 20 + (i % 3) * 2, cz: -21 + (i % 2) * 3, rad: 2 + R() * 3.4 });
      g.add(m);
    }
  }
  const flock = ruined ? birdFlock(16, 3, 0, 24, -10, 34) : null; if (flock) g.add(flock.group);
  const pedPos = (p: P, t: number, stopAt: number, out: THREE.Vector3) => {
    if (p.kid) { const a = (p.rad ?? 3) * 0 + (t < stopAt + 1 ? stopTime(t, stopAt) : stopTime(stopAt + 1, stopAt)) * p.sp * 0.7 + p.m.id; return out.set((p.cx ?? 0) + Math.cos(a) * (p.rad ?? 3), 0, (p.cz ?? 0) + Math.sin(a) * (p.rad ?? 3)); }
    if (p.w !== undefined) { const f = stopTime(t, stopAt + 0.8); return out.set(wrap(p.x + (p.w % 2 ? 1 : -1) * 1.3 * f, -12, 12), 0, p.z0); }
    const f = stopTime(t, stopAt + 0.8);
    return out.set(p.x, 0, wrap(p.z0 + p.dir * p.sp * f, -90, 90));
  };
  // plane
  const plane = new THREE.Group();
  if (!ruined) {
    const pm = mat(0xe8eaec, 0.4, 0.3); const fus = new THREE.Mesh(new THREE.CylinderGeometry(2, 1.6, 36, 8).rotateZ(Math.PI / 2), pm); const wing = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 36), pm); const tail = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.4), pm); tail.position.set(-16, 3, 0);
    const tailw = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 12), pm); tailw.position.set(-16, 1, 0);
    plane.add(fus, wing, tail, tailw);
    const trail = new THREE.Mesh(new THREE.BoxGeometry(260, 0.8, 0.8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, fog: false })); trail.position.set(-146, 0, 0); plane.add(trail);
    g.add(plane);
  }

  let leftBuilt = false; let lastVanish = -1;
  const tmp = new THREE.Vector3();
  return {
    group: g, colliders,
    update(t, p) {
      const stopAt = p.stopAt ?? 1e9, vanishAt = p.vanishAt ?? 1e9;
      if (!ruined) {
        const f = stopTime(t, stopAt);
        for (let i = 0; i < moving; i++) { const d = defs[i], dir = Math.cos(d.ry) > 0 ? 1 : -1; fleet.set(i, d.x, wrap(d.z + dir * 11 * f, -150, 150), d.ry); }
        fleet.commit();
        train.position.x = wrap(-120 + f * 16, -200, 140);
        plane.position.set(-380 + t * 38, 135, 20); plane.rotation.z = t > stopAt ? -0.06 * Math.min(1, t - stopAt) : 0;
        const phase = (t * 0.5) % 12, state = t > stopAt ? 3 : phase < 6 ? 1 : phase < 8 ? 2 : 0;
        lampMats.forEach((m, i) => m.color.set(state === 3 ? 0x080808 : i === state ? [0xff2a1a, 0x22ff66, 0xffb020][i] : 0x1a1a1a));
        for (const pd of peds) {
          pedPos(pd, t, stopAt, tmp);
          const gone = t >= vanishAt, k = gone ? Math.max(0, 1 - (t - vanishAt) * 3.5) : 1;
          pd.m.visible = k > 0.02 && !(gone && Math.floor((t - vanishAt) * 30) % 2 === 0);
          pd.m.position.copy(tmp); pd.m.scale.setScalar((pd.kid ? 0.62 : 0.97) * (gone ? k : 1));
          const f2 = stopTime(t, stopAt + 0.8);
          const moving2 = pd.w === undefined ? t < stopAt + 1.2 : t < stopAt + 4.5;
          pd.m.rotation.y = pd.kid ? Math.atan2(-Math.sin(pd.sp * f2 * 0.7 + pd.m.id), Math.cos(pd.sp * f2 * 0.7 + pd.m.id)) : pd.w !== undefined ? (pd.w % 2 ? Math.PI / 2 : -Math.PI / 2) : pd.dir > 0 ? 0 : Math.PI;
          animatePed(pd.m, (pd.kid ? f2 * pd.sp * 4 : f2 * pd.sp * 3.6) + pd.m.id, moving2 ? 1 : 0.0);
        }
        if (t >= vanishAt && lastVanish !== vanishAt) {
          lastVanish = vanishAt; while (left.children.length) left.remove(left.children[0]);
          for (const pd of peds) { pedPos(pd, vanishAt, stopAt, tmp); const it = new THREE.Mesh(R() < 0.5 ? bag : coat, leftMats[Math.floor(R() * 4)]); it.position.set(tmp.x, 0.1, tmp.z); it.rotation.y = R() * 3; left.add(it); }
          leftBuilt = true;
        }
        left.visible = leftBuilt && t >= vanishAt;
      } else flock?.update(t);
    },
  };
}

