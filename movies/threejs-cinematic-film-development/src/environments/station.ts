// Station 17: mountain-top radio station, terrain with a ruined valley, interior control room (x offset +212) and tape archive.
import * as THREE from 'three';
import { Batch, glow, grass, instanced, compose, mat, rng, rocks, texMat, trees } from '../engine/props';
import { tex } from '../engine/textures';
import { box3, signTexture, type EnvInstance } from './common';

const hsh = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const sm = (a: number, b: number, v: number) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
function vnoise(x: number, z: number) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  return (hsh(ix, iz) * (1 - ux) + hsh(ix + 1, iz) * ux) * (1 - uz) + (hsh(ix, iz + 1) * (1 - ux) + hsh(ix + 1, iz + 1) * ux) * uz;
}
const fbm = (x: number, z: number) => vnoise(x, z) * 0.55 + vnoise(x * 2.1, z * 2.1) * 0.28 + vnoise(x * 4.3, z * 4.3) * 0.13;
export function terrainH(x: number, z: number) {
  const d1 = Math.hypot(x, z), d2 = Math.hypot(x - 212, z);
  const plateau = Math.max(1 - sm(34, 60, d1), 1 - sm(46, 76, d2));
  const dist = Math.min(d1, d2 + 30);
  const mount = fbm(x / 120 + 3, z / 120 + 9) * 190 * sm(55, 230, dist) - 8 * sm(55, 120, dist);
  const valleyMask = (1 - sm(40, 170, Math.abs(x))) * sm(30, 90, z);
  const valley = -sm(40, 220, z) * 86;
  const h = mount * (1 - valleyMask) + (valley + fbm(x / 60, z / 60) * 14) * valleyMask;
  return h * (1 - plateau);
}

export function buildStation(): EnvInstance {
  const g = new THREE.Group(), b = new Batch(), R = rng(17);
  const colliders: THREE.Box3[] = [];
  const conc = texMat(tex.concrete(), 4, 0.95), concD = texMat(tex.concrete(true), 4, 0.95), metal = mat(0x8a9094, 0.45, 0.7), dark = mat(0x14181a, 0.4, 0.5), glassM = mat(0x1d3a3a, 0.1, 0.6);

  // terrain
  const N = 128, size = 1000;
  const tg = new THREE.PlaneGeometry(size, size, N, N); tg.rotateX(-Math.PI / 2);
  const pos = tg.getAttribute('position'), col = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = terrainH(x, z); pos.setY(i, h);
    const n = vnoise(x * 0.2, z * 0.2);
    if (h > 95) c.setRGB(0.86, 0.88, 0.92); else if (h > 60) c.setRGB(0.42 + n * 0.1, 0.4 + n * 0.1, 0.38 + n * 0.1); else if (h > 20) c.setRGB(0.3 + n * 0.1, 0.34 + n * 0.1, 0.24); else if (h > -30) c.setRGB(0.24 + n * 0.1, 0.32 + n * 0.12, 0.15 + n * 0.05); else c.setRGB(0.28, 0.33, 0.2);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  tg.setAttribute('color', new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); terrain.receiveShadow = true; terrain.userData.own = true; g.add(terrain);
  // plateau ground details
  b.box(texMat(tex.dirt(), 4, 1), 10, 0.06, 24, 0, 0.07, 18);
  b.box(texMat(tex.asphalt(true), 8, 0.95), 7, 0.06, 90, 0, 0.06, 55);

  // main building
  b.slab(conc, -9, 0, -8, 9, 5, 8).slab(concD, -9.3, 5, -8.3, 9.3, 5.4, 8.3).slab(concD, -9, 5.4, -8, 9, 6.2, -7.6);
  colliders.push(box3(-9.3, 0, -8.3, 9.3, 6.2, 8.3));
  b.box(dark, 2.4, 3.2, 0.3, 0, 1.6, 8.02).box(metal, 0.2, 3.4, 0.4, -1.3, 1.7, 8.05).box(metal, 0.2, 3.4, 0.4, 1.3, 1.7, 8.05).box(metal, 2.8, 0.2, 0.4, 0, 3.4, 8.05);
  for (const x of [-6.5, -3.5, 3.5, 6.5]) b.box(glassM, 1.6, 1.1, 0.12, x, 2.4, 8.03);
  for (const x of [-6.5, 6.5]) b.box(glow(0x40ff90, 0.6), 1.2, 0.5, 0.06, x, 2.4, 8.1);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.7), new THREE.MeshStandardMaterial({ map: signTexture('STATION 17', '#1b3a28', '#e8e8d8', 512, 110, true), roughness: 0.7 })); sg.position.set(0, 4.3, 8.05); sg.userData.own = true; g.add(sg);
  // dish
  b.cyl(metal, 0.2, 0.3, 2.4, -5, 7.4, -2, 8).sph(mat(0xcfd2d4, 0.4, 0.6), 2.6, -5, 9.4, -2, 1, 0.28, 1, 16).box(metal, 0.12, 2.4, 0.12, -5, 10.6, -2.4, 0, 0.4, 0).sph(dark, 0.25, -5, 11.7, -3.0);
  // tower
  const tx = 15, tz = -6;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.cyl(metal, 0.1, 0.18, 46, tx + dx * 1.4, 23, tz + dz * 1.4, 5);
  for (let y = 2; y < 44; y += 3) { const s = 1.4 - y * 0.012; b.box(metal, s * 2, 0.07, 0.07, tx, y, tz - s).box(metal, s * 2, 0.07, 0.07, tx, y, tz + s).box(metal, 0.07, 0.07, s * 2, tx - s, y, tz).box(metal, 0.07, 0.07, s * 2, tx + s, y, tz); }
  b.box(glow(0xff2a1a, 3), 0.4, 0.4, 0.4, tx, 46.3, tz);
  // solar, shed, fuel drums, crates
  for (let i = 0; i < 5; i++) b.box(mat(0x1a2540, 0.3, 0.6), 3.2, 0.08, 1.9, -16 + i * 3.6, 1.3, -14, 0, -0.6, 0).box(metal, 0.1, 1.3, 0.1, -16 + i * 3.6, 0.65, -13.5);
  b.slab(concD, 11, 0, 2, 17, 3, 8).box(mat(0x3a3e40), 6.2, 0.3, 6.2, 14, 3.1, 5);
  colliders.push(box3(11, 0, 2, 17, 3.3, 8));
  for (let i = 0; i < 5; i++) b.cyl(mat(0x7a3a2a, 0.6, 0.4), 0.3, 0.3, 0.9, -13 + (i % 3) * 0.7, 0.45, 5 + Math.floor(i / 3) * 0.7, 10);
  // camp: fire ring, seating blocks
  const stone = mat(0x6a6a66, 1);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283; b.sph(stone, 0.13, Math.cos(a) * 0.55, 0.08, 13 + Math.sin(a) * 0.55, 1.2, 0.8, 1); }
  b.cyl(mat(0x4a3220, 1), 0.07, 0.07, 0.8, 0, 0.1, 13, 6, 0, 0.6, Math.PI / 2).cyl(mat(0x4a3220, 1), 0.07, 0.07, 0.8, 0, 0.1, 13, 6, 0, -0.6, Math.PI / 2);
  b.box(concD, 0.9, 0.45, 0.5, -1.7, 0.225, 13.8, Math.PI / 2).box(concD, 0.9, 0.45, 0.5, 1.7, 0.225, 13.6, Math.PI / 2);
  b.box(mat(0x4a5a3a), 2.2, 0.06, 1.6, -4, 0.05, 15, 0.3);
  // valley city (ruined silhouette)
  const cityN = 70;
  const cityG = new THREE.BoxGeometry(1, 1, 1);
  const cityM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  const cityI = instanced(cityG, cityM, cityN, (_i, mx, col) => { const x = (R() - 0.5) * 120, z = 330 + R() * 90, h = 14 + R() * 60, y = terrainH(x, z); compose(x, y + h / 2, z, 0, 12 + R() * 14, h, 12 + R() * 14, mx); const v = 0.45 + R() * 0.2; col.setRGB(v, v * 1.02, v * 1.05); }, false);
  g.add(cityI);

  // ===== interior (x offset 212) =====
  const ix = 200, F = texMat(tex.concrete(true), 4, 0.9, 0xb0b4ae);
  const W = (x0: number, z0: number, x1: number, z1: number, h = 4.2) => { b.slab(concD, x0, 0, z0, x1, h, z1); colliders.push(box3(x0, 0, z0, x1, h, z1)); };
  b.slab(F, ix - 11, -0.3, -10, ix + 38, 0, 10).slab(mat(0x5a5f5d, 0.95), ix - 11, 4.2, -10, ix + 11, 4.5, 10).slab(mat(0x5a5f5d, 0.95), ix + 11, 4.7, -10, ix + 38, 5.0, 10);
  W(ix - 11.4, -10, ix - 11, 10); W(ix - 11, -10.4, ix + 38, -10); W(ix + 38, -10, ix + 38.4, 10);
  W(ix - 11, 10, ix - 7, 10.4); W(ix + 7, 10, ix + 11, 10.4);  // south wall with a wide window gap (x -7..7 relative)
  b.slab(concD, ix - 7, 0, 10, ix + 7, 1.0, 10.4).slab(concD, ix - 7, 3.0, 10, ix + 7, 4.2, 10.4);
  for (const x of [-4, 0, 4]) b.box(metal, 0.12, 2.0, 0.12, ix + x, 2, 10.2);
  colliders.push(box3(ix - 7, 0, 10, ix + 7, 1.0, 10.4));
  W(ix + 11, 1.6, ix + 11.4, 10, 5); W(ix + 11, -10, ix + 11.4, -1.6, 5); b.slab(concD, ix + 11, 3.2, -1.6, ix + 11.4, 5, 1.6);
  W(ix + 11, 10, ix + 38, 10.4, 5);
  // console / transmitter
  const cons = mat(0x30363a, 0.5, 0.5), consTop = mat(0x1d2124, 0.4, 0.5);
  b.box(cons, 14, 0.9, 1.4, ix, 0.45, -7.5).box(consTop, 14, 0.06, 1.5, ix, 0.93, -7.5).box(cons, 14, 1.4, 0.5, ix, 1.7, -8.9);
  for (let i = 0; i < 24; i++) b.box(glow([0x40ff90, 0xffb030, 0x40a0ff][i % 3], 1.4), 0.12, 0.05, 0.12, ix - 6.5 + i * 0.56, 1.0, -7.2 + (i % 2) * 0.3);
  for (let i = 0; i < 6; i++) b.box(glow(0x2aff7a, 0.7), 1.6, 0.8, 0.04, ix - 5.5 + i * 2.2, 1.9, -8.62);
  b.box(mat(0x23282b, 0.5, 0.5), 1.4, 0.5, 0.9, ix + 3, 1.2, -7.4).box(mat(0x23282b, 0.5, 0.5), 1.0, 0.5, 0.9, ix - 3, 1.2, -7.4);
  for (let i = 0; i < 5; i++) b.cyl(mat(0x999999, 0.3, 0.8), 0.06, 0.06, 0.06, ix + 2.5 + i * 0.25, 1.48, -6.9, 8, Math.PI / 2);
  b.cyl(metal, 0.02, 0.02, 0.35, ix, 1.1, -6.3, 5).cyl(dark, 0.05, 0.04, 0.12, ix, 1.34, -6.3, 8);                   // microphone stand + mic
  b.box(mat(0x23282b, 0.4, 0.4), 0.5, 0.35, 0.3, ix - 1.4, 1.1, -6.5).box(dark, 0.3, 0.2, 0.02, ix - 1.4, 1.1, -6.34); // speaker
  b.box(mat(0x2a2e30, 0.5, 0.5), 0.55, 0.08, 0.5, ix + 7, 0.5, -6.5).box(chairM(), 0.5, 0.08, 0.5, ix + 0.0, 0.5, -5.2);
  // racks along west wall + chairs, cot, papers
  for (let i = 0; i < 4; i++) { b.box(mat(0x23282b, 0.5, 0.5), 1.0, 2.6, 1.2, ix - 10.4, 1.3, -7 + i * 1.5); for (let k = 0; k < 6; k++) b.box(glow(k % 2 ? 0x40ff90 : 0xffb030, 1.2), 0.04, 0.04, 0.4, ix - 9.88, 0.5 + k * 0.35, -7 + i * 1.5); }
  b.box(chairM(), 0.5, 0.08, 0.5, ix + 5, 0.5, -3, 0.6).box(chairM(), 0.5, 0.5, 0.08, ix + 5.15, 0.8, -2.8, 0.6);
  for (let i = 0; i < 20; i++) b.box(mat(0xe8e4d0, 1), 0.3, 0.01, 0.4, ix + (R() - 0.5) * 18, 0.012, -6 + R() * 12, R() * 3);
  // archive door frame + shelving
  b.box(dark, 0.1, 0.1, 0.1, ix + 11, 3.3, 0);
  const tapeG = new THREE.BoxGeometry(0.1, 0.22, 0.18), tapeN = 3200, tapeM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  const rows = [-6.4, -2.4, 2.4, 6.4];
  const tapes: [number, number, number][] = [];
  for (const rz of rows) for (let lv = 0; lv < 7; lv++) for (let x = 0; x < 62; x++) for (const s of [-1, 1]) if (tapes.length < tapeN && R() < 0.96) tapes.push([ix + 13 + x * 0.4, 0.3 + lv * 0.32, rz + s * 0.2]);
  g.add(instanced(tapeG, tapeM, tapes.length, (i, mx, col) => { const t = tapes[i]; compose(t[0], t[1], t[2], 0, 1, 0.9 + R() * 0.15, 1, mx); const v = R(); col.set(v < 0.5 ? 0x1c1c1e : v < 0.8 ? 0x8a7a5a : v < 0.93 ? 0x5a6a7a : 0xa04a3a); }, false));
  for (const rz of rows) { b.box(metal, 26, 0.08, 1.0, ix + 26, 0.04, rz); for (let lv = 0; lv < 8; lv++) b.box(metal, 26, 0.04, 0.9, ix + 26, 0.15 + lv * 0.32, rz); for (let x = 0; x <= 26; x += 3.25) b.box(metal, 0.06, 2.6, 0.06, ix + 13 + x, 1.3, rz - 0.45).box(metal, 0.06, 2.6, 0.06, ix + 13 + x, 1.3, rz + 0.45); }
  for (let i = 0; i < 30; i++) b.box(glow(R() < 0.5 ? 0x40ff90 : 0xffb030, 1.2), 0.04, 0.04, 0.04, ix + 14 + R() * 24, 0.5 + R() * 1.8, rows[Math.floor(R() * 4)] + (R() < 0.5 ? -0.5 : 0.5));
  // playback table at the far end of the archive
  b.box(mat(0x5a4a38, 0.8), 1.6, 0.06, 0.8, ix + 36, 0.9, 0).box(metal, 0.06, 0.9, 0.7, ix + 35.3, 0.45, 0).box(metal, 0.06, 0.9, 0.7, ix + 36.7, 0.45, 0).box(mat(0x2a2e30, 0.5, 0.4), 0.7, 0.2, 0.5, ix + 36, 1.03, 0).box(glow(0x40ff90, 1.4), 0.2, 0.05, 0.02, ix + 36, 1.06, 0.26);
  // fallen tapes
  for (let i = 0; i < 16; i++) b.box(mat(0x1c1c1e, 0.7), 0.1, 0.18, 0.2, ix + 14 + R() * 20, 0.09, (R() - 0.5) * 3, R() * 3);
  b.build(g);

  g.add(grass(2200, 0, 0, 80, 80, 7, 0.55, (x, z) => Math.abs(x) < 9.5 && Math.abs(z) < 8.5), rocks(70, 0, 0, 130, 130, 1.3, 9, 0x77746c));
  g.add(trees(Array.from({ length: 36 }, (_, i) => { const a = R() * 6.283, r = 38 + R() * 30; return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.9 + R() * 0.8 + (i % 7 === 0 ? 0.6 : 0) }; }), 3, 0x2f4a28));

  const lamp = new THREE.PointLight(0xffb870, 6, 16, 1.5); lamp.position.set(ix, 2.9, -3);
  const csl = new THREE.PointLight(0x40ff90, 4, 12, 1.6); csl.position.set(ix, 1.9, -6.8);
  const a1 = new THREE.PointLight(0xc8e0ff, 5, 16, 1.5); a1.position.set(ix + 22, 3.6, -3);
  const a2 = new THREE.PointLight(0xc8e0ff, 5, 16, 1.5); a2.position.set(ix + 31, 3.6, 3);
  g.add(lamp, csl, a1, a2);
  return {
    group: g, colliders,
    update(t) {
      lamp.intensity = 5.6 + Math.sin(t * 8) * 0.25 + Math.sin(t * 21) * 0.2;
      a1.intensity = 4.4 + (Math.sin(t * 12.3) > 0.94 ? -2.4 : 0); a2.intensity = 4.4 + (Math.sin(t * 9.1 + 2) > 0.95 ? -2.4 : 0);
      csl.intensity = 3.6 + Math.sin(t * 4) * 0.4;
    },
  };
}
function chairM() { return mat(0x2a3040, 0.8); }
