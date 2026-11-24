// Abandoned supermarket (sales floor) + staff storage room where Mira has her makeshift radio workshop.
import * as THREE from 'three';
import { Batch, glow, instanced, compose, lightShaft, mat, rng, texMat } from '../engine/props';
import { tex } from '../engine/textures';
import { box3, signTexture, type EnvInstance } from './common';

function mapTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 192; const x = c.getContext('2d')!;
  x.fillStyle = '#cdbf98'; x.fillRect(0, 0, 256, 192);
  x.strokeStyle = '#6a5a3a'; x.lineWidth = 1.2;
  const r = rng(9);
  for (let i = 0; i < 9; i++) { x.beginPath(); let px = r() * 256, py = r() * 192; x.moveTo(px, py); for (let k = 0; k < 7; k++) { px += (r() - 0.5) * 70; py += (r() - 0.5) * 50; x.lineTo(px, py); } x.stroke(); }
  x.strokeStyle = '#b02020'; x.lineWidth = 2.5; x.beginPath(); x.arc(196, 52, 14, 0, 7); x.stroke();
  x.beginPath(); x.moveTo(40, 150); x.lineTo(90, 110); x.lineTo(150, 100); x.lineTo(196, 52); x.stroke();
  x.fillStyle = '#b02020'; x.beginPath(); x.arc(40, 150, 4, 0, 7); x.fill();
  x.fillStyle = '#20202a'; x.font = 'bold 16px monospace'; x.fillText('17', 188, 58);
  x.font = '10px monospace'; x.fillText('HERE', 28, 168);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildSupermarket(): EnvInstance {
  const g = new THREE.Group(), b = new Batch(), R = rng(31);
  const colliders: THREE.Box3[] = [];
  const floor = texMat(tex.tile('#b9bcb4'), 4, 0.6), wall = texMat(tex.concrete(), 4, 0.95), wallDark = texMat(tex.concrete(true), 4, 0.95);
  const ceil = mat(0x6b6e6b, 0.95), metal = mat(0x7a8084, 0.5, 0.6), rust = mat(0x6b4030, 0.9, 0.3), glassM = mat(0x2a3a40, 0.1, 0.6);
  const W = (x0: number, z0: number, x1: number, z1: number, h: number, m = wall) => { b.slab(m, x0, 0, z0, x1, h, z1); colliders.push(box3(x0, 0, z0, x1, h, z1)); };

  // sales floor shell
  b.slab(floor, -20, -0.3, -15, 20, 0, 15);
  W(-20.4, -15, -20, 15, 5); W(20, -15, 20.4, 15, 5);                     // side walls
  W(-20, -15.4, -1.3, -15, 5); W(1.3, -15.4, 20, -15, 5); b.slab(wall, -1.3, 3.2, -15.4, 1.3, 5, -15); // back wall with staff door
  W(-20, 15, -2.6, 15.4, 5); W(2.6, 15, 20, 15.4, 5); b.slab(wall, -2.6, 3.4, 15, 2.6, 5, 15.4);       // front wall with entrance
  for (const x of [-16, -11, -7.5, 7.5, 11, 16]) b.box(glassM, 2.6, 2.2, 0.08, x, 1.6, 15.1);
  // ceiling with holes + a fallen panel
  for (let cx = 0; cx < 4; cx++) for (let cz = 0; cz < 4; cz++) {
    if ((cx === 1 && cz === 1) || (cx === 2 && cz === 2)) continue;
    const x0 = -20 + cx * 10, z0 = -15 + cz * 7.5;
    b.slab(ceil, x0, 5, z0, x0 + 10, 5.25, z0 + 7.5);
  }
  b.box(ceil, 9, 0.25, 6, 5, 3.4, -2, 0, 0.5, 0.1);
  for (let x = -18; x <= 18; x += 6) b.box(metal, 0.3, 0.3, 30, x, 4.85, 0); // beams
  for (let x = -16; x <= 16; x += 8) for (let z = -10; z <= 10; z += 10) b.box(mat(0xdadada, 0.6), 1.2, 0.08, 0.3, x, 4.7, z); // dead light fixtures

  // shelving
  const prodG = new THREE.BoxGeometry(0.28, 0.26, 0.2);
  const shelfLines = [-14, -9, -3.8, 3.8, 9, 14];
  let pc = 0;
  const prods: { x: number; y: number; z: number; r: number }[] = [];
  for (const sx of shelfLines) {
    b.box(metal, 0.7, 0.1, 19, sx, 0.05, -1.5);
    for (let z = -11; z <= 8; z += 3.2) {
      b.box(metal, 0.06, 2.2, 0.06, sx - 0.33, 1.1, z).box(metal, 0.06, 2.2, 0.06, sx + 0.33, 1.1, z);
      b.box(metal, 0.06, 2.2, 0.06, sx - 0.33, 1.1, z + 3.2).box(metal, 0.06, 2.2, 0.06, sx + 0.33, 1.1, z + 3.2);
    }
    for (let lv = 0; lv < 5; lv++) b.box(metal, 0.7, 0.04, 19, sx, 0.25 + lv * 0.5, -1.5);
    b.box(mat(0x3a3a3c, 0.9), 0.05, 2.3, 19, sx, 1.15, -1.5);
    for (let lv = 0; lv < 4; lv++) for (let z = -11; z < 8; z += 0.42) if (R() < 0.45) for (const s of [-1, 1]) { prods.push({ x: sx + s * 0.18, y: 0.4 + lv * 0.5, z: z + R() * 0.1, r: R() }); pc++; }
  }
  const pcols = [0xc0392b, 0x2e86c1, 0xf1c40f, 0x27ae60, 0xe67e22, 0xecf0f1, 0x8e44ad];
  g.add(instanced(prodG, mat(0xffffff, 0.8), pc, (i, mx, col) => { const p = prods[i]; compose(p.x, p.y, p.z, p.r * 0.4, 1, 0.8 + p.r * 0.6, 1, mx); col.set(pcols[Math.floor(p.r * 7) % 7]).multiplyScalar(0.55); }, false));
  // items strewn on floor
  g.add(instanced(prodG, mat(0xffffff, 0.8), 90, (_i, mx, col) => { compose((R() - 0.5) * 34, 0.1, (R() - 0.5) * 26, R() * 6, 1, 0.8, 1, mx, (R() - 0.5) * 0.4); col.set(pcols[Math.floor(R() * 7)]).multiplyScalar(0.5); }, false));
  // checkout counters + carts
  for (const x of [-12, -6, 6, 12]) { b.box(mat(0x4a4c50, 0.6), 1.1, 0.95, 3.2, x, 0.48, 12); b.box(mat(0x111111, 0.9), 0.8, 0.05, 3, x, 1.0, 12); b.box(mat(0x2a2c30, 0.5), 0.5, 0.4, 0.4, x + 0.8, 1.15, 12.5); }
  for (let i = 0; i < 7; i++) { const x = (R() - 0.5) * 30, z = (R() - 0.5) * 12 + 9, ry = R() * 3; b.box(metal, 0.6, 0.04, 0.9, x, 0.25, z, ry).box(metal, 0.6, 0.5, 0.04, x, 0.6, z + 0.45, ry).box(metal, 0.04, 0.5, 0.9, x + 0.3, 0.6, z, ry).box(metal, 0.04, 0.5, 0.9, x - 0.3, 0.6, z, ry); }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1), new THREE.MeshStandardMaterial({ map: signTexture('FRESH  •  DAILY', '#1f4f2f', '#e8e8d8', 512, 90, true) })); sign.position.set(-9, 3.4, -14.9); sign.userData.own = true; g.add(sign);

  // ===== storage / workshop =====
  b.slab(wallDark, -9, -0.3, -32, 9, 0, -15); b.slab(ceil, -9, 3.6, -32, 9, 3.85, -15);
  W(-9.4, -32, -9, -15, 3.7, wallDark); W(9, -32, 9.4, -15, 3.7, wallDark); W(-9, -32.4, 9, -32, 3.7, wallDark);
  // metal shelves with crates
  const crate = mat(0x6a5a3a, 0.9);
  for (const sx of [-8, 8]) { for (let z = -31; z < -18; z += 3.2) { for (let lv = 0; lv < 4; lv++) { b.box(metal, 0.9, 0.05, 3, sx, 0.4 + lv * 0.7, z + 1.6); if (R() < 0.8) b.box(R() < 0.5 ? crate : mat(0x3a5a6a, 0.9), 0.7, 0.4, 0.6 + R() * 1.4, sx, 0.65 + lv * 0.7, z + 1 + R()); } b.box(metal, 0.06, 2.4, 0.06, sx - 0.4, 1.2, z).box(metal, 0.06, 2.4, 0.06, sx + 0.4, 1.2, z); } }
  // workbench with transmitter
  b.box(mat(0x5a4a38, 0.8), 3.4, 0.08, 1.2, 3.5, 0.95, -29).box(metal, 0.08, 0.95, 1.1, 1.9, 0.48, -29).box(metal, 0.08, 0.95, 1.1, 5.1, 0.48, -29);
  b.box(mat(0x23282b, 0.5, 0.4), 1.1, 0.4, 0.6, 3.2, 1.2, -29.1).box(mat(0x23282b, 0.5, 0.4), 0.6, 0.3, 0.45, 4.3, 1.15, -29.1);
  b.box(glow(0x55ff99, 1.4), 0.5, 0.12, 0.02, 3.2, 1.28, -28.79).box(glow(0xff4030, 2), 0.05, 0.05, 0.02, 3.6, 1.1, -28.79);
  for (let i = 0; i < 4; i++) b.cyl(mat(0x999999, 0.3, 0.8), 0.04, 0.04, 0.05, 2.8 + i * 0.15, 1.06, -28.8, 8, Math.PI / 2);
  b.cyl(mat(0x999999, 0.3, 0.8), 0.015, 0.015, 3, 3.9, 2.5, -29.2, 5).box(mat(0x2b2b2b), 1.2, 0.04, 0.04, 3.9, 4.0, -29.2);
  b.box(mat(0x22222a, 0.4, 0.5), 0.7, 0.04, 0.5, 5.8, 0.8, -26, 0.4, -0.4).box(mat(0x3a4a2a, 0.8), 0.3, 0.2, 0.2, 5.3, 0.1, -27); // solar panel + battery
  b.cyl(mat(0x111111), 0.02, 0.02, 4, 4.9, 0.9, -28.2, 4, 0, 0, Math.PI / 2 - 0.4);
  // lamp, cot, map, cans
  b.cyl(metal, 0.02, 0.02, 0.4, 1.9, 1.2, -29.5, 5).sph(glow(0xffd699, 1.5), 0.1, 1.9, 1.45, -29.5);
  b.box(mat(0x4a5a3a, 1), 1, 0.12, 2.1, -6.2, 0.2, -27.5).box(mat(0x7a4a38, 1), 0.7, 0.18, 0.4, -6.2, 0.35, -26.6).box(metal, 0.06, 0.2, 2.1, -6.7, 0.1, -27.5).box(metal, 0.06, 0.2, 2.1, -5.7, 0.1, -27.5);
  for (let i = 0; i < 12; i++) b.cyl(rust, 0.05, 0.05, 0.12, -4 + (i % 4) * 0.12, 0.06 + Math.floor(i / 4) * 0.12, -30.5 + (i % 3) * 0.1, 7);
  const mp = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.65), new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.9 })); mp.position.set(-0.5, 1.9, -31.95); mp.userData.own = true; g.add(mp);
  // staff door (swung open)
  b.box(mat(0x6b6f72, 0.6, 0.3), 1.2, 2.9, 0.08, -1.6, 1.45, -14.0, -1.15).slab(mat(0x2a2c2e), -1.4, 0, -15.4, -1.3, 3.2, -15);
  b.build(g);

  // light shafts through ceiling holes
  g.add(lightShaft(-5, 2.6, -4.2, 5.2, 2.3, 3.2, 0xffecc0, 0.07));
  g.add(lightShaft(5, 2.6, 3.2, 5.2, 2.3, 3.2, 0xffecc0, 0.07));

  const lamp = new THREE.PointLight(0xffc880, 7, 14, 1.7); lamp.position.set(1.9, 1.7, -29.2);
  const led = new THREE.PointLight(0x66ffaa, 1.6, 6, 1.8); led.position.set(3.2, 1.4, -28.4);
  const cold = new THREE.PointLight(0xaec8d8, 2.2, 22, 1.5); cold.position.set(0, 4, -18);
  g.add(lamp, led, cold);
  return {
    group: g, colliders,
    update(t) {
      lamp.intensity = 6.5 + Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.2;
      led.intensity = 1.4 + Math.sin(t * 3) * 0.3 + (Math.sin(t * 17) > 0.8 ? 0.8 : 0);
    },
  };
}
