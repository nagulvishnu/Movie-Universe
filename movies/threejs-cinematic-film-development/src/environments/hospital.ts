// Abandoned hospital: lobby + corridor + patient rooms (origin) and an underground generator room (x offset +60).
import * as THREE from 'three';
import { Batch, glow, mat, rng, texMat } from '../engine/props';
import { tex } from '../engine/textures';
import { box3, signTexture, type EnvInstance } from './common';

export function buildHospital(): EnvInstance {
  const g = new THREE.Group(), b = new Batch(), R = rng(55);
  const colliders: THREE.Box3[] = [];
  const floor = texMat(tex.tile('#aab4ae'), 3, 0.5), wall = texMat(tex.concrete(), 4, 0.95, 0xbcd0c6), ceil = mat(0x7d8581, 0.95), metal = mat(0x8a9094, 0.45, 0.7);
  const sheet = mat(0xcfd2cc, 0.95), dark = mat(0x23282b, 0.6, 0.3), cloth = [mat(0x5a7a9a, 1), mat(0x9a6a5a, 1), mat(0x8a8a6a, 1)];
  const W = (x0: number, z0: number, x1: number, z1: number, h = 3.2, m: THREE.Material = wall) => { b.slab(m, x0, 0, z0, x1, h, z1); colliders.push(box3(x0, 0, z0, x1, h, z1)); };

  // ===== ground floor shell =====
  b.slab(floor, -9.4, -0.3, -33, 9.4, 0, 39); b.slab(ceil, -9.4, 3.2, -33, 9.4, 3.45, 21);
  b.slab(ceil, -9, 4.2, 20, 9, 4.45, 39);
  W(-9.6, -33, -9.2, 21, 3.3); W(9.2, -33, 9.6, 21, 3.3); W(-9.4, -33.4, 9.4, -33, 3.3); // outer
  W(-9.6, 21, -9.2, 39.4, 4.3); W(9.2, 21, 9.6, 39.4, 4.3);
  // front glass wall w/ entrance gap
  W(-9.4, 39, -2.2, 39.4, 4.3); W(2.2, 39, 9.4, 39.4, 4.3);
  b.box(mat(0x2a3a40, 0.1, 0.5), 0.1, 2.6, 0.2, -1.1, 1.3, 38.5, 0.3).box(mat(0x2a3a40, 0.1, 0.5), 0.1, 2.6, 0.2, 1.1, 1.3, 38.5, -0.3);
  // corridor walls with door openings at z = 12,4,-4,-12,-20
  const doors = [12, 4, -4, -12, -20];
  for (const s of [-1, 1]) {
    let z = 20;
    for (const d of doors) { const x0 = Math.min(s * 2.2, s * 2.6), x1 = Math.max(s * 2.2, s * 2.6); W(x0, d + 0.75, x1, z, 3.2); z = d - 0.75; b.box(mat(0x5a6a66, 0.8), 0.1, 0.12, 1.5, s * 2.4, 2.4, d); }
    W(Math.min(s * 2.2, s * 2.6), -33, Math.max(s * 2.2, s * 2.6), z, 3.2);
    // room partitions
    for (const pz of [16, 8, 0, -8, -16, -24]) W(Math.min(s * 2.6, s * 9.2), pz - 0.2, Math.max(s * 2.6, s * 9.2), pz + 0.2, 3.2);
  }
  // wall wainscot + handrails + signs
  for (const s of [-1, 1]) b.box(metal, 0.06, 0.06, 50, s * 2.14, 0.95, -6).box(mat(0x4a6a5e, 0.9), 0.04, 1.0, 50, s * 2.13, 0.5, -6);
  // fixtures (dead / powered later)
  const fixOff = mat(0xcfd4d0, 0.7), fixOn = new THREE.MeshStandardMaterial({ color: 0xdfe8e4, emissive: 0xcfe8ff, emissiveIntensity: 0 }); fixOn.userData.keep = true;
  for (let z = 17; z > -32; z -= 5) b.box(fixOff, 0.5, 0.06, 1.6, 0, 3.15, z);
  const fixLive: THREE.Mesh[] = [];
  for (let z = 14; z > -30; z -= 8) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 1.6), fixOn); f.position.set(0, 3.1, z); g.add(f); fixLive.push(f); }
  // rubble/ceiling tiles on floor, paper, fallen debris
  for (let i = 0; i < 26; i++) b.box(R() < 0.4 ? ceil : mat(0xdddddd, 1), 0.3 + R() * 0.5, 0.02, 0.3 + R() * 0.5, (R() - 0.5) * 3.6, 0.015, 20 - R() * 50, R() * 3);
  // stairwell door at corridor end
  b.box(mat(0x3a4a42, 0.7, 0.3), 2.0, 2.4, 0.1, 0, 1.2, -32.8);
  const dsign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshStandardMaterial({ map: signTexture('B1 · GENERATOR', '#d8d0a0', '#222', 512, 128, true), roughness: 0.8 })); dsign.position.set(0, 2.7, -32.7); dsign.userData.own = true; g.add(dsign);

  // patient rooms
  for (const s of [-1, 1]) for (let i = 0; i < doors.length; i++) {
    const zc = doors[i], cx = s * 6.2;
    // bed
    b.box(metal, 1.0, 0.08, 2.0, cx, 0.55, zc - 0.5).box(sheet, 0.95, 0.18, 1.9, cx, 0.68, zc - 0.5).box(mat(0xe6e6e0, 1), 0.7, 0.14, 0.4, cx, 0.8, zc - 1.25);
    for (const dx of [-0.45, 0.45]) for (const dz of [-1.4, 0.4]) b.cyl(metal, 0.03, 0.03, 0.55, cx + dx, 0.27, zc + dz, 5);
    if (i % 2 === 0) b.box(cloth[i % 3], 0.5, 0.05, 0.7, cx + 0.03, 0.8, zc - 0.5).box(cloth[(i + 1) % 3], 0.4, 0.05, 0.5, cx, 0.8, zc + 0.1); // empty pyjamas
    b.cyl(metal, 0.025, 0.025, 1.8, cx + s * -1.0, 0.9, zc + 0.9, 5).box(metal, 0.4, 0.03, 0.03, cx + s * -1.0, 1.8, zc + 0.9).box(mat(0xbfd8e8, 0.4), 0.1, 0.18, 0.04, cx + s * -1.0, 1.65, zc + 0.9);
    b.box(mat(0x6a5a40, 0.9), 0.5, 0.6, 0.5, cx + s * 1.2, 0.3, zc - 1.2).box(mat(0xaaaaaa, 0.6), 0.06, 0.4, 0.3, s * 9.0, 1.4, zc, 0.0);
    if (i === 1 || i === 3) b.box(mat(0x4a5a7a, 0.9), 1.0, 2.4, 0.04, cx + s * 1.8, 1.5, zc + 1.8, 0.2); // curtain
    if (i === 2) b.cyl(dark, 0.25, 0.25, 0.06, cx - 0.5 * s, 0.4, zc + 2, 10, Math.PI / 2, 0, 0.6).box(dark, 0.6, 0.7, 0.05, cx - 0.5 * s, 0.6, zc + 2.2, 0, 0, 0); // overturned wheelchair-ish
  }
  // lobby
  b.box(mat(0x6a6050, 0.7), 5, 1.1, 1, 0, 0.55, 29).box(mat(0x6a6050, 0.7), 1, 1.1, 4, -2.5, 0.55, 27.5).box(dark, 0.5, 0.35, 0.4, 0.8, 1.3, 29).box(mat(0xe8e0d0, 1), 0.3, 0.02, 0.4, -0.8, 1.12, 29, 0.4);
  for (let r2 = 0; r2 < 3; r2++) for (let k = 0; k < 4; k++) { const x = 4 + k * 1.2, z = 24 + r2 * 2.6; b.box(mat(0x3a4a6a, 0.9), 0.55, 0.08, 0.55, x, 0.45, z).box(mat(0x3a4a6a, 0.9), 0.55, 0.5, 0.08, x, 0.75, z - 0.24).cyl(metal, 0.03, 0.03, 0.45, x, 0.22, z, 5); }
  b.box(mat(0x2a2f30, 0.5, 0.4), 1.1, 2.0, 0.9, -7.6, 1.0, 36).box(glow(0xff5030, 0.8), 0.9, 1.1, 0.04, -7.6, 1.2, 35.52);
  b.box(metal, 1.0, 0.1, 2.2, 1.5, 0.85, 33, 0.3).box(sheet, 0.9, 0.12, 2.0, 1.5, 0.95, 33, 0.3); // abandoned gurney
  b.box(mat(0x3a6a4a, 0.9), 3, 1.4, 0.06, 7.0, 1.8, 29.5, -0.0).box(mat(0xe0e0e0), 2.6, 1.0, 0.02, 7.0, 1.8, 29.46);
  b.build(g);

  // ===== basement generator room (x offset 60) =====
  const bx = 60, bm = new Batch();
  const cmat = texMat(tex.concrete(true), 4, 0.95), pipe = mat(0x6a5a40, 0.5, 0.6), rustM = mat(0x6b4030, 0.8, 0.4);
  bm.slab(cmat, bx - 12, -0.3, -13, bx + 12, 0, 13).slab(cmat, bx - 12, 4.6, -13, bx + 12, 4.9, 13);
  const BW = (x0: number, z0: number, x1: number, z1: number) => { bm.slab(cmat, x0, 0, z0, x1, 4.8, z1); colliders.push(box3(x0, 0, z0, x1, 4.8, z1)); };
  BW(bx - 12.4, -13, bx - 12, 13); BW(bx + 12, -13, bx + 12.4, 13); BW(bx - 12, -13.4, bx + 12, -13); BW(bx - 12, 13, bx + 12, 13.4);
  // generator
  bm.box(mat(0x3a5a3a, 0.5, 0.5), 4.2, 1.9, 1.8, bx + 5, 1.15, -6).box(dark, 4.4, 0.3, 2.0, bx + 5, 0.15, -6).box(mat(0x2a2a2a, 0.5, 0.6), 1.2, 1.1, 1.4, bx + 8, 0.8, -6)
    .cyl(pipe, 0.2, 0.2, 3.5, bx + 6.5, 3.6, -6, 8).cyl(pipe, 0.12, 0.12, 6, bx + 5, 4.2, -6, 6, 0, 0, Math.PI / 2).box(mat(0xc0a020, 0.7), 1.2, 0.5, 0.05, bx + 5, 1.5, -5.08);
  // pipes + conduit overhead, puddle, barrels
  for (let i = 0; i < 4; i++) bm.cyl(pipe, 0.1, 0.1, 24, bx, 4.2 - i * 0.18, -9 + i * 6, 6, 0, 0, Math.PI / 2);
  bm.box(mat(0x1a2a30, 0.05, 0.8), 3.2, 0.02, 2.4, bx - 4, 0.012, 4);
  for (let i = 0; i < 4; i++) bm.cyl(rustM, 0.3, 0.3, 0.9, bx - 10 + (i % 2) * 0.7, 0.45, 8 + Math.floor(i / 2) * 0.7, 10);
  // control desk with old computer + tape recorder
  bm.box(mat(0x4a4338, 0.8), 3.2, 0.08, 1.2, bx - 4, 0.9, -9).box(metal, 0.08, 0.9, 1.1, bx - 5.5, 0.45, -9).box(metal, 0.08, 0.9, 1.1, bx - 2.5, 0.45, -9);
  bm.box(mat(0xb0a890, 0.7), 0.7, 0.55, 0.6, bx - 4.7, 1.2, -9.1).box(glow(0x55ff88, 0.7), 0.5, 0.36, 0.02, bx - 4.7, 1.22, -8.79).box(mat(0x2a2a2a, 0.5, 0.5), 0.9, 0.2, 0.55, bx - 3.4, 1.04, -8.9);
  bm.box(glow(0xff3020, 1.5), 0.04, 0.04, 0.02, bx - 3.0, 1.06, -8.62).cyl(metal, 0.12, 0.12, 0.03, bx - 3.6, 1.15, -8.62, 12, Math.PI / 2).cyl(metal, 0.12, 0.12, 0.03, bx - 3.2, 1.15, -8.62, 12, Math.PI / 2);
  bm.box(mat(0x3a4a42, 0.8), 3.2, 0.6, 0.2, bx - 4, 2.4, -12.9).box(metal, 1, 2.3, 0.1, bx - 1, 1.15, 12.8);
  // stairs up (wall side)
  for (let i = 0; i < 10; i++) bm.box(cmat, 2, 0.18 * (i + 1), 0.3, bx - 9, 0.09 * (i + 1), 6 + i * 0.3);
  bm.build(g);

  const red = new THREE.PointLight(0xff2a1a, 3.2, 14, 1.6); red.position.set(0, 2.9, 8);
  const red2 = new THREE.PointLight(0xff2a1a, 2.4, 12, 1.6); red2.position.set(0, 2.9, -16);
  const cool = new THREE.PointLight(0xcfe8ff, 0, 22, 1.4); cool.position.set(0, 2.8, 0);
  const amber = new THREE.PointLight(0xffa030, 0, 18, 1.5); amber.position.set(bx + 4, 2.5, -4);
  const desk = new THREE.PointLight(0x66ffaa, 2.4, 9, 1.8); desk.position.set(bx - 4.2, 1.7, -8);
  const bred = new THREE.PointLight(0xff3020, 2, 16, 1.6); bred.position.set(bx, 4.2, 6);
  g.add(red, red2, cool, amber, desk, bred);
  const genObj = g.children.find((o) => (o as THREE.Mesh).isMesh && false);
  void genObj;

  return {
    group: g, colliders,
    update(t, p) {
      const genAt = p.genAt ?? 1e9, on = t > genAt;
      const flick = on ? (t - genAt < 3 ? (Math.sin(t * 40) > -0.2 ? 1 : 0.1) * Math.min(1, (t - genAt) / 1.5) : 1) : 0;
      cool.intensity = 9 * flick; fixOn.emissiveIntensity = 2.2 * flick;
      fixLive.forEach((f, i) => { (f as THREE.Mesh).visible = true; void i; });
      red.intensity = (on ? 1.2 : 3.2) * (0.75 + 0.25 * Math.sin(t * 3.1)); red2.intensity = (on ? 1 : 2.4) * (0.75 + 0.25 * Math.sin(t * 2.3 + 1)); bred.intensity = 2 * (0.6 + 0.4 * Math.sin(t * 2.6));
      amber.intensity = on ? 7 + Math.sin(t * 30) * 0.8 : 0;
      desk.intensity = on ? 3 + Math.sin(t * 5) * 0.4 + (Math.sin(t * 13) > 0.9 ? 1.2 : 0) : 1.4;
    },
  };
}
