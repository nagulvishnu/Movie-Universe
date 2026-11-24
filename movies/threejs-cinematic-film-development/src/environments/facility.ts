// Hidden underground research facility: surface bunker entrance (x offset -80) + lab hall & corridor (origin).
import * as THREE from 'three';
import { Batch, glow, grass, instanced, compose, mat, rng, rocks, texMat, trees } from '../engine/props';
import { tex } from '../engine/textures';
import { box3, signTexture, type EnvInstance } from './common';

const LAND: [number, number, number, number][] = [[0.2, 0.3, 0.12, 0.18], [0.29, 0.66, 0.06, 0.2], [0.5, 0.27, 0.05, 0.07], [0.51, 0.56, 0.07, 0.19], [0.7, 0.3, 0.17, 0.15], [0.68, 0.52, 0.025, 0.07], [0.84, 0.74, 0.06, 0.07], [0.33, 0.1, 0.03, 0.05], [0.17, 0.5, 0.03, 0.06]];
const isLand = (u: number, v: number) => LAND.some(([cx, cy, rx, ry]) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 < 1);
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

export function drawWorldMap(c: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, lit: number, bright: number, color = '#39ff7a') {
  const cols = 96, rows = 44, dx = w / cols, dy = h / rows;
  let idx = 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (!isLand(i / cols, j / rows)) continue;
    idx++;
    const on = idx < lit;
    c.fillStyle = on ? color : 'rgba(40,120,70,0.25)';
    c.globalAlpha = on ? bright * (0.75 + 0.25 * Math.sin(idx)) : 0.5;
    c.fillRect(x0 + i * dx, y0 + j * dy, dx * 0.55, dy * 0.55);
  }
  c.globalAlpha = 1;
}

export function screenCanvas(w: number, h: number) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  return { cv, c: cv.getContext('2d')!, tx };
}

function noteTexture() {
  const { cv, c, tx } = screenCanvas(512, 384);
  c.fillStyle = '#e6dcb6'; c.fillRect(0, 0, 512, 384);
  c.fillStyle = 'rgba(120,90,50,.15)'; for (let i = 0; i < 30; i++) c.fillRect(Math.random() * 512, Math.random() * 384, 40, 3);
  c.fillStyle = '#1c1c3a'; c.font = 'italic 34px "Segoe Script","Bradley Hand","Comic Sans MS",cursive';
  ['If anyone survives,', "don't wait for the signal.", 'Find the others.'].forEach((l, i) => c.fillText(l, 40, 120 + i * 62));
  c.font = 'italic 20px cursive'; c.fillText('— Dr. H.', 330, 340);
  tx.needsUpdate = true; void cv; return tx;
}

export function buildFacility(): EnvInstance {
  const g = new THREE.Group(), b = new Batch(), R = rng(63);
  const colliders: THREE.Box3[] = [];
  const conc = texMat(tex.concrete(true), 4, 0.95, 0xaab8b4), floor = texMat(tex.tile('#7c8682'), 3, 0.45), metal = mat(0x7a8286, 0.45, 0.7), dark = mat(0x16191b, 0.5, 0.4);
  const W = (x0: number, z0: number, x1: number, z1: number, h = 5, m: THREE.Material = conc) => { b.slab(m, x0, 0, z0, x1, h, z1); colliders.push(box3(x0, 0, z0, x1, h, z1)); };

  // ----- interior -----
  b.slab(floor, -12.4, -0.3, -30.4, 12.4, 0, 34).slab(mat(0x4a5250, 0.9), -12.4, 5, -30.4, 12.4, 5.3, 0).slab(mat(0x4a5250, 0.9), -2.4, 3.4, 0, 2.4, 3.6, 34);
  W(-12.8, -30.4, -12.4, 0, 5); W(12.4, -30.4, 12.8, 0, 5); W(-12.8, -30.8, 12.8, -30.4, 5);
  W(-12.4, -0.4, -2.4, 0, 5); W(2.4, -0.4, 12.4, 0, 5);       // hall front wall with corridor opening
  W(-2.8, 0, -2.4, 34, 3.5); W(2.4, 0, 2.8, 34, 3.5); W(-2.8, 34, 2.8, 34.4, 3.5);
  b.box(mat(0x2a3a36, 0.6, 0.4), 2.2, 2.6, 0.12, 0, 1.3, 33.8);
  // pipes and cable trays
  for (let z = 1; z < 34; z += 1) if (z % 3 === 0) b.box(metal, 4.6, 0.1, 0.1, 0, 3.3, z);
  b.cyl(mat(0x5a5a40, 0.5, 0.6), 0.12, 0.12, 34, -2, 3.2, 17, 6, Math.PI / 2).cyl(mat(0x3a4a5a, 0.5, 0.6), 0.1, 0.1, 34, 2, 3.2, 17, 6, Math.PI / 2);
  for (let i = 0; i < 8; i++) b.cyl(mat(0x2a2a2a), 0.05, 0.05, 11, -10.5 + i * 3, 4.8, -14, 5, 0, 0, Math.PI / 2 * 0);
  for (let z = 3; z < 33; z += 6) b.box(glow(0x40ff90, 1.6), 0.05, 0.4, 0.02, -2.74, 1.4, z).box(glow(0x40ff90, 1.6), 0.05, 0.4, 0.02, 2.74, 1.4, z + 3);

  // desks + chairs + lab coats
  const desk = mat(0x6a6e6c, 0.6, 0.3), coat = mat(0xd8d8d0, 0.95), chair = mat(0x2a3040, 0.8);
  const screens: { m: THREE.Mesh; tx: THREE.CanvasTexture; cv: HTMLCanvasElement; c: CanvasRenderingContext2D; kind: number }[] = [];
  const spots: [number, number, number][] = [[-8, -8, 0.3], [-3.5, -8, -0.1], [3.5, -8, 0.1], [8, -8, -0.3], [-8.5, -17, 0.0], [8.5, -17, 0.0]];
  spots.forEach(([x, z, ry], i) => {
    b.box(desk, 3, 0.08, 1.3, x, 0.78, z, ry).box(metal, 0.08, 0.78, 1.2, x - 1.4, 0.39, z, ry).box(metal, 0.08, 0.78, 1.2, x + 1.4, 0.39, z, ry);
    b.box(dark, 0.6, 0.06, 0.25, x, 0.84, z + 0.3, ry).box(dark, 0.3, 0.3, 0.3, x + 1.0, 0.99, z - 0.1, ry);
    const cz = z + 1.2;
    if (i !== 1) b.box(chair, 0.5, 0.08, 0.5, x, 0.5, cz, ry + (i % 2 ? 0.5 : 0)).box(chair, 0.5, 0.55, 0.08, x, 0.8, cz + 0.25, ry + (i % 2 ? 0.5 : 0)).cyl(metal, 0.03, 0.03, 0.45, x, 0.25, cz, 5);
    if (i % 2 === 0) b.box(coat, 0.46, 0.7, 0.1, x, 0.85, cz + 0.28, ry).box(coat, 0.1, 0.5, 0.1, x + 0.28, 0.6, cz + 0.2, ry); // lab coat left on chair
    b.box(mat(0xe8e4d0, 1), 0.3, 0.01, 0.4, x - 0.8, 0.83, z, R() * 3).cyl(mat(0xeeeeee, 0.5), 0.05, 0.04, 0.09, x - 1.0, 0.87, z + 0.2, 8);
    const s = screenCanvas(256, 192);
    const mon = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.38), new THREE.MeshBasicMaterial({ map: s.tx, toneMapped: false }));
    mon.position.set(x + Math.sin(ry) * 0.0, 1.02, z - 0.08); mon.rotation.y = ry; mon.userData.own = true; g.add(mon);
    screens.push({ m: mon, tx: s.tx, cv: s.cv, c: s.c, kind: i });
    b.box(mat(0xa8a496, 0.7), 0.6, 0.5, 0.45, x, 1.05, z - 0.28, ry);
  });
  // the handwritten note on the central desk
  const nt = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32), new THREE.MeshStandardMaterial({ map: noteTexture(), roughness: 0.9 })); nt.position.set(-3.5, 0.835, -8.0); nt.rotation.set(-Math.PI / 2, 0, 0.15); nt.userData.own = true; g.add(nt);
  // central map table + whiteboard + wall screen
  b.cyl(mat(0x3a4040, 0.5, 0.4), 2.4, 2.4, 0.9, 0, 0.45, -14, 20).cyl(dark, 2.5, 2.5, 0.06, 0, 0.95, -14, 20);
  const table = screenCanvas(512, 512);
  const tm = new THREE.Mesh(new THREE.CircleGeometry(2.2, 28), new THREE.MeshBasicMaterial({ map: table.tx, toneMapped: false, fog: false })); tm.rotation.x = -Math.PI / 2; tm.position.set(0, 0.99, -14); tm.userData.own = true; g.add(tm);
  const wall = screenCanvas(1024, 400);
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.9), new THREE.MeshBasicMaterial({ map: wall.tx, toneMapped: false, fog: false })); ws.position.set(0, 2.9, -30.3); ws.userData.own = true; g.add(ws);
  const wb = screenCanvas(512, 320); wb.c.fillStyle = '#e8e8e0'; wb.c.fillRect(0, 0, 512, 320);
  wb.c.fillStyle = '#243a8a'; wb.c.font = '22px "Segoe Script",cursive'; ['ONSET 11:47:00 UTC', 'ALL SITES — SIMULTANEOUS', 'NOT A WEAPON.', 'NOT DEAD?  →  WHERE?'].forEach((l, i) => wb.c.fillText(l, 24, 60 + i * 56)); wb.c.strokeStyle = '#a02020'; wb.c.lineWidth = 3; wb.c.strokeRect(14, 200, 480, 56); wb.tx.needsUpdate = true;
  const wbm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshStandardMaterial({ map: wb.tx, roughness: 0.6 })); wbm.position.set(-12.3, 2.0, -20); wbm.rotation.y = Math.PI / 2; wbm.userData.own = true; g.add(wbm);
  // server racks with LEDs
  const ledN = 150; const ledMesh = instanced(new THREE.BoxGeometry(0.05, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), ledN, (i, mx, col) => { const rk = Math.floor(i / 30), k = i % 30; compose(11.6, 0.4 + (k % 15) * 0.14, -4 - rk * 2.2 + (k < 15 ? 0.3 : -0.3) * 0.8 - 0.4, 0, 1, 1, 1, mx); col.set(0x40ff70); }, false);
  g.add(ledMesh);
  for (let rk = 0; rk < 5; rk++) { b.box(mat(0x23282b, 0.5, 0.5), 1.0, 2.5, 1.9, 12.0, 1.25, -4.3 - rk * 2.2 - 0.2); b.box(dark, 0.02, 2.3, 1.7, 11.49, 1.25, -4.5 - rk * 2.2); }
  // security cameras
  const cams: THREE.Group[] = [];
  for (const [cx, cy, cz, ry] of [[-11.8, 4.5, -2, 0.9], [11.8, 4.5, -2, -0.9], [-11.8, 4.5, -28, 2.3], [11.8, 4.5, -28, -2.3]]) {
    const cg = new THREE.Group(); cg.position.set(cx, cy, cz); cg.rotation.y = ry;
    const bd = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.5), mat(0x8a8e90, 0.5, 0.5)); bd.position.z = 0.25; const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8).rotateX(Math.PI / 2), dark); lens.position.z = 0.55;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), new THREE.MeshBasicMaterial({ color: 0xff2020 })); led.position.set(0.07, 0.1, 0.5); led.userData.led = true;
    cg.add(bd, lens, led); g.add(cg); cams.push(cg);
  }
  b.box(metal, 0.5, 0.05, 0.05, 11.9, 4.7, -2).box(metal, 0.5, 0.05, 0.05, -11.9, 4.7, -2);
  // clutter
  for (let i = 0; i < 40; i++) b.box(mat(0xe8e4d0, 1), 0.3, 0.01, 0.4, (R() - 0.5) * 20, 0.012, -2 - R() * 26, R() * 3);
  b.box(chair, 0.5, 0.08, 0.5, 2, 0.15, -11, 0, 1.4, 0).cyl(mat(0xeeeeee, 0.5), 0.05, 0.04, 0.09, 1, 0.05, -10, 8, Math.PI / 2);
  // ----- surface bunker entrance (x offset -80) -----
  const sx = -80;
  b.slab(texMat(tex.grass(), 8, 1), sx - 200, -0.3, -150, sx + 200, 0, 150);
  b.slab(conc, sx - 6, 0, -14, sx + 6, 5.5, -4).slab(conc, sx - 1.6, 0, -4.4, sx - 1.1, 3, -3.9).slab(conc, sx + 1.1, 0, -4.4, sx + 1.6, 3, -3.9).slab(conc, sx - 1.6, 2.9, -4.4, sx + 1.6, 3.4, -3.9);
  b.slab(mat(0x151a1a, 1), sx - 1.1, 0, -4.05, sx + 1.1, 2.9, -3.95);
  b.box(mat(0x5a4a3a, 0.7, 0.6), 1.2, 2.8, 0.1, sx - 1.6, 1.4, -2.9, 1.1);
  colliders.push(box3(sx - 6, 0, -14, sx + 6, 5.5, -4));
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), new THREE.MeshStandardMaterial({ map: signTexture('RESTRICTED · ANNEX 4', '#a8a070', '#2a2a22', 512, 180, true), roughness: 0.8 })); sg.position.set(sx + 3.8, 1.8, -3.8); sg.userData.own = true; g.add(sg);
  b.cyl(metal, 0.05, 0.05, 2.2, sx + 3.8, 1.1, -3.9, 5);
  b.build(g);
  g.add(grass(1800, sx, 6, 60, 60, 9, 0.9), rocks(30, sx, 4, 40, 30, 0.9, 3, 0x6a6a62), trees(Array.from({ length: 36 }, (_, i) => ({ x: sx - 60 + R() * 120, z: -20 + R() * 40 - (i % 2 ? 0 : 30) , s: 1.2 + R() * 1.2 })).filter((t) => !(Math.abs(t.x - sx) < 9 && t.z > -14)), 3, 0x2f4528));
  g.add(instanced(new THREE.IcosahedronGeometry(1, 2), mat(0x3a4a3a, 1), 8, (i, mx, col) => { compose(sx + (i - 4) * 55, -2, -70 - R() * 30, R() * 6, 50 + R() * 30, 25 + R() * 20, 45, mx); col.setRGB(0.7, 0.8, 0.7); }, false));

  // lights
  const g1 = new THREE.PointLight(0x40ff90, 4, 16, 1.6); g1.position.set(0, 2.8, 20);
  const g2 = new THREE.PointLight(0x40ff90, 3, 16, 1.6); g2.position.set(0, 2.8, 8);
  const scr = new THREE.PointLight(0x5ad0ff, 4, 14, 1.5); scr.position.set(0, 2, -12);
  const wl = new THREE.PointLight(0x7fb8ff, 3, 16, 1.5); wl.position.set(0, 3, -26);
  const rk = new THREE.PointLight(0x40ff70, 2, 8, 1.6); rk.position.set(10.5, 1.8, -8);
  g.add(g1, g2, scr, wl, rk);

  const ledCol = new THREE.Color();
  let lastDraw = -1;
  return {
    group: g, colliders,
    update(t, p) {
      const dead = (p.deadAt ?? 1e9) < t, dt = t - (p.deadAt ?? 1e9);
      cams.forEach((c, i) => { c.rotation.y += Math.sin(t * 0.35 + i) * 0.0025; const l = c.children.find((o) => o.userData.led) as THREE.Mesh; (l.material as THREE.MeshBasicMaterial).color.set(Math.floor(t * 1.2 + i) % 2 && !dead ? 0xff2020 : 0x300808); });
      const k = Math.floor(t * 8);
      if (k === lastDraw && !(dead && dt < 0.3)) return; lastDraw = k;
      const flick = dead ? Math.max(0, 1 - dt * 3) * (Math.sin(t * 60) > 0 ? 1 : 0.2) : 1;
      screens.forEach((s, i) => {
        const c = s.c; c.fillStyle = dead && flick < 0.02 ? '#000' : '#041208'; c.fillRect(0, 0, 256, 192);
        if (!(dead && flick < 0.02)) {
          c.fillStyle = '#39ff7a'; c.font = '13px monospace'; c.globalAlpha = flick;
          for (let l = 0; l < 11; l++) { const w = 4 + Math.floor(hash(i * 31 + l + (k >> 3)) * 24); c.fillText(((l + i * 7 + (k >> 2)) % 97 + ' ' + 'ABCDEF0123456789'.repeat(3)).slice(0, w + 8), 8, 18 + l * 16); }
          if (s.kind === 1) { c.strokeStyle = '#39ff7a'; c.beginPath(); for (let x = 0; x < 256; x += 4) c.lineTo(x, 100 + Math.sin(x * 0.2 + k) * 30 * hash(x + k)); c.stroke(); }
          c.globalAlpha = 1;
        }
        s.tx.needsUpdate = true;
      });
      const tc = table.c; tc.fillStyle = '#021008'; tc.fillRect(0, 0, 512, 512);
      if (!(dead && flick < 0.02)) { tc.globalAlpha = flick; drawWorldMap(tc, 20, 140, 472, 230, 99999, 0.8 * flick); tc.globalAlpha = 1; }
      table.tx.needsUpdate = true;
      const wc = wall.c; wc.fillStyle = '#020c07'; wc.fillRect(0, 0, 1024, 400);
      if (!(dead && flick < 0.02)) {
        drawWorldMap(wc, 60, 40, 904, 320, 99999, flick * 0.9);
        wc.fillStyle = `rgba(255,70,60,${flick})`; wc.font = '22px monospace'; wc.fillText('SYNCHRONOUS EVENT — 214 SITES — 11:47:00', 70, 380);
        const n = 40; for (let i = 0; i < n; i++) { const u = hash(i * 7.1), v = hash(i * 3.3); wc.fillStyle = `rgba(255,80,70,${flick * (0.5 + 0.5 * Math.sin(t * 3 + i))})`; wc.fillRect(60 + u * 900, 60 + v * 280, 6, 6); }
      }
      wall.tx.needsUpdate = true;
      for (let i = 0; i < ledN; i++) { const on = !dead && hash(i + (k >> 1) * 1.7) > 0.4; ledMesh.setColorAt(i, ledCol.set(on ? (hash(i * 3) > 0.85 ? 0xffb030 : 0x40ff70) : 0x061008)); }
      if (ledMesh.instanceColor) ledMesh.instanceColor.needsUpdate = true;
      const f = dead ? flick : 1;
      scr.intensity = 4 * f; wl.intensity = 3 * f; rk.intensity = 2 * f; g1.intensity = 4 * (dead ? 0.35 : 1); g2.intensity = 3 * (dead ? 0.35 : 1);
    },
  };
}
