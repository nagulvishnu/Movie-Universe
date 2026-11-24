// Post-credit scene: a dark forgotten room deep underground; one monitor wakes up.
import * as THREE from 'three';
import { Batch, mat, rng, texMat } from '../engine/props';
import { tex } from '../engine/textures';
import { box3, type EnvInstance } from './common';
import { drawWorldMap, screenCanvas } from './facility';

export function buildMonitor(): EnvInstance {
  const g = new THREE.Group(), b = new Batch(), R = rng(99);
  const colliders: THREE.Box3[] = [];
  const conc = texMat(tex.concrete(true), 4, 0.95, 0x888f8c), metal = mat(0x4a5256, 0.5, 0.6), dark = mat(0x0c0e0f, 0.6, 0.4);
  b.slab(conc, -9, -0.3, -9, 9, 0, 6).slab(conc, -9, 4.5, -9, 9, 4.8, 6).slab(conc, -9.4, 0, -9.4, -9, 4.6, 6.4).slab(conc, 9, 0, -9.4, 9.4, 4.6, 6.4).slab(conc, -9, 0, -9.4, 9, 4.6, -9).slab(conc, -9, 0, 6, 9, 4.6, 6.4);
  colliders.push(box3(-9.4, 0, -9.4, 9.4, 4.6, -9), box3(-9.4, 0, 6, 9.4, 4.6, 6.4), box3(-9.4, 0, -9.4, -9, 4.6, 6.4), box3(9, 0, -9.4, 9.4, 4.6, 6.4));
  // monitor wall unit + desk + chair + cables + dust-covered cases
  b.box(dark, 6.4, 3.6, 0.5, 0, 2.4, -8.6).box(metal, 6.8, 0.2, 1.4, 0, 0.9, -7.4).box(metal, 0.2, 0.9, 1.3, -3.2, 0.45, -7.4).box(metal, 0.2, 0.9, 1.3, 3.2, 0.45, -7.4);
  b.box(mat(0x1a1d20, 0.7), 0.6, 0.08, 0.6, 0.4, 0.55, -5.8, 0.4).box(mat(0x1a1d20, 0.7), 0.6, 0.6, 0.08, 0.5, 0.9, -5.55, 0.4).box(mat(0x23282b, 0.6, 0.4), 1.2, 0.05, 0.5, 0, 1.03, -7.2);
  for (let i = 0; i < 18; i++) b.box(mat(0x20262a, 0.9), 0.04, 0.04, 3 + R() * 5, -8 + R() * 16, 0.03, -6 + R() * 5, R() * 3);
  for (let i = 0; i < 6; i++) b.box(mat(0x2a2e30, 0.8), 1 + R(), 0.8 + R() * 0.8, 1, -8 + i * 3, 0.5, 4.5 + R() * 0.3);
  b.build(g);
  const sc = screenCanvas(1024, 512);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ map: sc.tx, toneMapped: false })); scr.position.set(0, 2.4, -8.33); scr.userData.own = true; g.add(scr);
  const glowL = new THREE.PointLight(0x40ff90, 0, 16, 1.4); glowL.position.set(0, 2.2, -5); g.add(glowL);
  const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  let last = -1;
  const total = 380;
  return {
    group: g, colliders,
    update(t) {
      const k = Math.floor(t * 12); if (k === last) return; last = k;
      const c = sc.c; c.fillStyle = '#000'; c.fillRect(0, 0, 1024, 512);
      const on = t > 2.2; let br = 0;
      if (on) {
        const tt = t - 2.2, flick = tt < 1 ? (hash(k) > 0.4 ? 1 : 0.25) : 1;
        let fade = 1; if (t > 26) fade = Math.max(0, 1 - (t - 26) * 3);
        br = flick * fade;
        if (br > 0.01) {
          c.globalAlpha = br; c.fillStyle = '#050f08'; c.fillRect(0, 0, 1024, 512);
          c.fillStyle = '#39ff7a'; c.font = 'bold 34px monospace'; c.textAlign = 'center';
          const title = 'GLOBAL SURVIVOR MONITORING SYSTEM'; c.fillText(title.slice(0, Math.floor(Math.max(0, tt * 2.4 * 30) / 1)), 512, 56); c.textAlign = 'left';
          if (t > 6) {
            const lit = t < 7 ? 0 : Math.min(total, Math.floor((t - 7) * 38));
            drawWorldMap(c, 70, 90, 884, 330, lit, br);
            c.font = '16px monospace'; c.fillStyle = '#39ff7a'; c.fillText(`LOCATIONS INDEXED: ${String(Math.min(9341, Math.floor((t - 6) * 780))).padStart(5, '0')}`, 70, 456);
            c.fillText(`ACTIVE SIGNALS: ${String(Math.max(0, Math.floor((t - 9) * 2.3))).padStart(3, '0')}`, 560, 456);
          }
          if (t > 17 && t < 22.4) { c.fillStyle = 'rgba(0,12,4,0.82)'; c.fillRect(40, 190, 944, 130); c.strokeStyle = '#39ff7a'; c.lineWidth = 2; c.strokeRect(40, 190, 944, 130); c.fillStyle = '#7dffa8'; c.font = 'bold 34px monospace'; c.textAlign = 'center'; c.fillText('SUBJECTS 001 AND 002', 512, 250); c.fillText('CONTACT ESTABLISHED', 512, 296); c.textAlign = 'left'; }
          if (t >= 22.4) { c.fillStyle = 'rgba(0,12,4,0.88)'; c.fillRect(40, 200, 944, 100); c.strokeStyle = '#39ff7a'; c.lineWidth = 2; c.strokeRect(40, 200, 944, 100); c.fillStyle = '#7dffa8'; c.font = 'bold 36px monospace'; c.textAlign = 'center'; c.fillText('OBSERVATION PHASE: COMPLETE', 512, 262); c.textAlign = 'left'; }
          c.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < 512; y += 4) c.fillRect(0, y, 1024, 1);
          c.globalAlpha = 1;
        }
      }
      sc.tx.needsUpdate = true;
      glowL.intensity = 7 * br;
    },
  };
}
