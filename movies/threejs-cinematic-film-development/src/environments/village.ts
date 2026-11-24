// Forgotten village of empty homes at dusk. Hero house (left of road) is furnished with a table still set for dinner.
import * as THREE from 'three';
import { Batch, Fleet, grass, mat, rng, texMat, trees, rocks, instanced, compose } from '../engine/props';
import { tex } from '../engine/textures';
import { box3, birdFlock, type EnvInstance } from './common';

export function buildVillage(): EnvInstance {
  const g = new THREE.Group(), b = new Batch(), R = rng(42);
  const colliders: THREE.Box3[] = [];
  const grassM = texMat(tex.grass(), 8, 1), dirt = texMat(tex.dirt(), 6, 1), wood = texMat(tex.wood('#6a4a31'), 3, 0.85), plank = texMat(tex.wood('#8a7050'), 3, 0.9);
  const plaster = [mat(0xc9b99a, 0.95), mat(0xa8b4a0, 0.95), mat(0xc0a090, 0.95), mat(0xb0b8c0, 0.95), mat(0xd0c4a0, 0.95)];
  const roofs = [mat(0x7a3a2e, 0.9), mat(0x4a4a50, 0.9), mat(0x6a4a30, 0.9)];
  const dark = mat(0x1a1f22, 0.2, 0.4), glassM = mat(0x24343a, 0.1, 0.6), metal = mat(0x8a9094, 0.5, 0.6);

  b.box(grassM, 700, 0.2, 700, 0, -0.1, 0);
  b.box(dirt, 8, 0.08, 300, 0, -0.03, -20);
  const W = (x0: number, z0: number, x1: number, z1: number, y1 = 3.2, m: THREE.Material = plaster[0]) => { b.slab(m, x0, 0, z0, x1, y1, z1); colliders.push(box3(x0, 0, z0, x1, y1, z1)); };

  // ===== hero house (x -17..-9, z -4..4) =====
  b.slab(wood, -17, -0.2, -4, -9, 0.05, 4);
  const hm = plaster[0];
  W(-17.3, -4.3, -17, 4.3, 3.2, hm); W(-17, -4.3, -9, -4, 3.2, hm); W(-17, 4, -9, 4.3, 3.2, hm);
  // front wall with door + windows (wall at x -9.3..-9)
  const fw = (z0: number, z1: number, y0: number, y1: number) => { b.slab(hm, -9.3, y0, z0, -9, y1, z1); if (y0 === 0) colliders.push(box3(-9.3, 0, z0, -9, y1, z1)); };
  fw(-4, -3, 0, 3.2); fw(-3, -1.6, 0, 1); fw(-3, -1.6, 2.2, 3.2); fw(-1.6, -0.7, 0, 3.2); fw(-0.7, 0.7, 2.3, 3.2); fw(0.7, 1.6, 0, 3.2); fw(1.6, 3, 0, 1); fw(1.6, 3, 2.2, 3.2); fw(3, 4, 0, 3.2);
  b.box(dark, 0.04, 1.2, 1.4, -9.14, 1.6, -2.3).box(dark, 0.04, 1.2, 1.4, -9.14, 1.6, 2.3); // (dim glass behind)
  b.slab(plank, -17, 3.2, -4, -9, 3.4, 4);
  b.gable(roofs[0], 8.6, 8.6, 2.4, -13, 3.4, 0);
  b.box(mat(0x5a4a3a, 0.9), 0.1, 2.3, 0.7, -9.5, 1.15, -0.9, 0.0, 0, 0).box(mat(0x4a3a2a), 0.06, 2.2, 0.7, -9.1, 1.1, 1.7, 1.2); // open door
  // dinner table + chairs + plates
  b.box(wood, 2.2, 0.08, 1.2, -13.2, 0.78, 0).cyl(wood, 0.06, 0.06, 0.75, -14.1, 0.38, -0.45, 6).cyl(wood, 0.06, 0.06, 0.75, -12.3, 0.38, -0.45, 6).cyl(wood, 0.06, 0.06, 0.75, -14.1, 0.38, 0.45, 6).cyl(wood, 0.06, 0.06, 0.75, -12.3, 0.38, 0.45, 6);
  const plate = mat(0xe8e6de, 0.4), food = mat(0x8a5a2a, 0.9), glassC = mat(0xaac4d0, 0.1, 0.1);
  for (const [px, pz] of [[-13.9, -0.38], [-13.9, 0.38], [-12.5, -0.38], [-12.5, 0.38]]) { b.cyl(plate, 0.15, 0.15, 0.02, px, 0.83, pz, 12).sph(food, 0.07, px, 0.87, pz, 1, 0.5, 1); b.cyl(glassC, 0.035, 0.03, 0.12, px + 0.2, 0.9, pz, 8); }
  b.cyl(mat(0xb0762a, 0.8), 0.1, 0.1, 0.16, -13.2, 0.9, 0, 8).cyl(mat(0x7a3a2a, 0.6), 0.02, 0.02, 0.12, -13.2, 1.04, 0, 5);
  for (const [cx, cz, ry] of [[-13.9, -1.0, 0], [-12.5, -1.0, 0], [-13.9, 1.05, 3.14], [-12.5, 1.2, 2.7], [-14.9, 0, 1.57]]) b.box(wood, 0.45, 0.06, 0.45, cx, 0.48, cz, ry).box(wood, 0.45, 0.5, 0.05, cx, 0.78, cz + (cz < 0 ? -0.22 : 0.22), ry).cyl(wood, 0.03, 0.03, 0.46, cx, 0.23, cz, 5);
  // couch, shelf, TV, rug, toys, photos, lamp
  b.box(mat(0x7a4a4a, 0.95), 0.9, 0.5, 2.4, -16.4, 0.3, -2.6).box(mat(0x7a4a4a, 0.95), 0.25, 0.8, 2.4, -16.8, 0.55, -2.6).box(mat(0xaa8a3a, 0.95), 0.4, 0.4, 0.4, -16.1, 0.65, -3.3, 0.5);
  b.box(wood, 0.5, 2.1, 1.8, -16.7, 1.05, 2.8).box(dark, 0.06, 0.6, 1.0, -16.3, 1.2, 2.8);
  for (let i = 0; i < 7; i++) b.box(mat([0xc03030, 0x3050a0, 0xe0c030, 0x40a050][i % 4], 0.8), 0.25 + R() * 0.1, 0.14 + R() * 0.1, 0.25, -16.4 + R() * 0.4, 0.9 + (i % 3) * 0.45, 2.2 + R() * 1.2);
  b.box(mat(0x4a4e58, 0.7), 0.5, 0.45, 0.04, -9.4 - 0.0, 1.5, 3.6).box(mat(0x7a6a4a, 0.9), 3.2, 0.015, 2.4, -13.3, 0.07, -0.2);
  for (const [px, py, pz] of [[-17.0, 1.8, -1.2], [-17.0, 1.7, -0.5], [-17.0, 1.9, 0.3]]) b.box(mat(0x2a2218, 0.8), 0.04, 0.35, 0.28, px + 0.06, py, pz).box(mat(0xd8cfa8, 0.9), 0.02, 0.28, 0.2, px + 0.09, py, pz);
  // toys
  const toyC = [0xe04040, 0x4060e0, 0xe0c030, 0x40c060];
  for (let i = 0; i < 12; i++) { const x = -16 + R() * 5, z = -3 + R() * 5.5; b.box(mat(toyC[i % 4], 0.7), 0.16, 0.16, 0.16, x, 0.1, z, R() * 3); if (i % 3 === 0) b.sph(mat(toyC[(i + 1) % 4], 0.6), 0.1, x + 0.3, 0.1, z + 0.2); }
  b.cyl(metal, 0.2, 0.2, 0.05, -11, 0.2, 2.6, 10, Math.PI / 2).cyl(mat(0xe04040, 0.6), 0.04, 0.04, 0.35, -11, 0.3, 2.6, 5);
  // camcorder on couch arm (visible prop to pick up)
  b.box(mat(0x25272a, 0.5, 0.3), 0.14, 0.12, 0.22, -13.0, 0.87, -0.2, 0.4);

  // ===== other houses =====
  const houses: [number, number, number, number, number][] = [[-22, -34, 9, 8, 0], [-22, -18, 9, 7, 1], [-22, 14, 9, 9, 2], [-22, 30, 9, 8, 3], [14, -40, 9, 8, 4], [14, -22, 9, 7, 0], [14, -4, 10, 9, 1], [14, 14, 9, 8, 2], [14, 30, 9, 9, 3]];
  houses.forEach(([x0, z0, w, d, i], k) => {
    const h = 3 + (k % 2) * 0.4;
    b.slab(plaster[i % 5], x0, 0, z0, x0 + w, h, z0 + d); colliders.push(box3(x0, 0, z0, x0 + w, h, z0 + d));
    b.gable(roofs[k % 3], w + 0.4, d, 2.2, x0 + w / 2, h, z0 + d / 2);
    const fx = x0 < 0 ? x0 + w : x0;
    for (const dz of [1.5, d - 2.5]) b.box(glassM, 0.1, 1.2, 1.1, fx + (x0 < 0 ? 0.04 : -0.04), 1.7, z0 + dz + 0.4);
    b.box(dark, 0.14, 2.2, 1.0, fx + (x0 < 0 ? 0.05 : -0.05), 1.1, z0 + d / 2);
    b.box(mat(0x5a4a3a), 0.08, 2.2, 0.9, fx + (x0 < 0 ? 1.0 : -1.0), 1.1, z0 + d / 2 - 0.3, k % 2 ? 0.9 : -0.9); // open doors
    b.box(mat(0x6a6050), 1.6, 0.25, 2.2, fx + (x0 < 0 ? 0.8 : -0.8), 0.12, z0 + d / 2);
    b.box(mat(0x6a5a4a), 0.8, 0.8, 0.12, fx + (x0 < 0 ? 0.3 : -0.3), 0.4, z0 + d + 0.0 - 6);
    // fence
    for (let z = z0 - 1; z < z0 + d + 1; z += 1.2) b.box(plank, 0.08, 0.9, 0.08, x0 < 0 ? -6.5 : 6.5, 0.45, z);
    b.box(plank, 0.06, 0.08, d + 2, x0 < 0 ? -6.5 : 6.5, 0.8, z0 + d / 2).box(plank, 0.06, 0.08, d + 2, x0 < 0 ? -6.5 : 6.5, 0.45, z0 + d / 2);
  });
  // church at far end
  b.slab(plaster[4], -8, 0, -86, 8, 7, -66).gable(roofs[1], 16.6, 20, 4, 0, 7, -76).slab(plaster[4], -2.5, 0, -90, 2.5, 14, -86).box(roofs[1], 6, 2.5, 6, 0, 15.2, -88, Math.PI / 4).box(dark, 2, 3, 0.2, 0, 1.5, -65.9);
  colliders.push(box3(-8, 0, -86, 8, 7, -66));
  // well, laundry line, swing, tricycle, handcart
  b.cyl(mat(0x6a6a64, 1), 1, 1, 1, 7, 0.5, 6, 10).cyl(wood, 0.06, 0.06, 2.2, 6.2, 1.6, 6, 5).cyl(wood, 0.06, 0.06, 2.2, 7.8, 1.6, 6, 5).box(wood, 1.8, 0.08, 0.1, 7, 2.6, 6);
  b.cyl(wood, 0.05, 0.05, 3, -6.4, 1.5, -8, 5).cyl(wood, 0.05, 0.05, 3, -6.4, 1.5, -3.5, 5).box(mat(0xaaaaaa, 0.9), 0.02, 0.02, 4.6, -6.4, 2.9, -5.7);
  for (let i = 0; i < 5; i++) b.box(mat([0xd0d0c8, 0x4060a0, 0xc04040, 0xe0d070, 0x80a080][i], 0.95), 0.04, 0.7, 0.45, -6.4, 2.5, -7.4 + i * 0.9);
  b.cyl(mat(0xc03030, 0.6), 0.2, 0.2, 0.04, 2.6, 0.2, -12, 10, Math.PI / 2).cyl(mat(0xc03030, 0.6), 0.1, 0.1, 0.04, 2.45, 0.1, -11.5, 8, Math.PI / 2).box(mat(0x1a1a1a), 0.04, 0.5, 0.04, 2.6, 0.4, -12);
  b.box(wood, 1.6, 0.1, 0.9, 2.4, 0.5, 22, 0.5).cyl(wood, 0.3, 0.3, 0.06, 3.1, 0.3, 21.8, 10, Math.PI / 2);
  // porch lanterns
  for (const [lx, lz] of [[-9.6, 0.9], [8.7, 4.5]]) b.box(mat(0xffc060, 0.5, 0, 0xffa040, 1.8), 0.12, 0.2, 0.12, lx, 2.5, lz);
  // abandoned car with doors open
  const fleet = new Fleet([{ x: 3, z: 40, ry: 0.15, color: 0x6a5a48 }, { x: -3.5, z: -50, ry: 3.3, color: 0x4a5a6a }], true); g.add(fleet.group); fleet.commit();
  colliders.push(box3(2, 0, 37.7, 4, 1.8, 42.3));
  g.add(grass(1600, 0, -10, 80, 160, 3, 0.55, (x) => Math.abs(x) < 1.5));
  g.add(grass(300, -13, 0, 8, 8, 4, 0.2, () => true));
  const tl: { x: number; z: number; s: number }[] = [];
  for (let i = 0; i < 44; i++) { const s = i % 2 ? 1 : -1; tl.push({ x: s * (28 + R() * 60), z: -100 + R() * 200, s: 1 + R() * 1.2 }); }
  for (let i = 0; i < 10; i++) tl.push({ x: (i % 2 ? 1 : -1) * (7 + R() * 2), z: -60 + i * 12, s: 0.9 + R() * 0.5 });
  g.add(trees(tl, 8, 0x4a5a2c));
  g.add(rocks(30, 0, -10, 30, 150, 0.6, 5, 0x77746c));
  g.add(instanced(new THREE.IcosahedronGeometry(1, 2), mat(0x4a6a46, 1), 12, (i, mx, col) => { const s = i % 2 ? 1 : -1; compose(s * (150 + R() * 100), 0, -150 + i * 25, R() * 6, 80 + R() * 40, 30 + R() * 30, 80 + R() * 40, mx); col.setRGB(0.7 + R() * 0.3, 0.8, 0.6); }, false));
  b.build(g);
  const flock = birdFlock(10, 6, 0, 18, -20, 30); g.add(flock.group);
  const lamp = new THREE.PointLight(0xffb060, 9, 12, 1.6); lamp.position.set(-14.4, 1.8, 0.2); g.add(lamp);
  const win = new THREE.PointLight(0xff9a5a, 4, 10, 1.6); win.position.set(-9.8, 1.8, 0); g.add(win);
  return { group: g, colliders, update(t) { flock.update(t); lamp.intensity = 8.5 + Math.sin(t * 7) * 0.3 + Math.sin(t * 19) * 0.2; } };
}
