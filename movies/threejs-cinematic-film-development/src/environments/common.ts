import * as THREE from 'three';
import { mat, rng } from '../engine/props';

export interface EnvInstance {
  group: THREE.Group;
  update(t: number, params: Record<string, number>, dt: number): void;
  colliders: THREE.Box3[];
}
export type EnvBuilder = (mode: string) => EnvInstance;

export const box3 = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));

/** smooth stop curve: constant speed until stopAt-1, then decelerates to rest */
export function stopTime(t: number, stopAt: number) {
  const s0 = stopAt - 1;
  if (t < s0) return t;
  const q = Math.min(1, t - s0);
  return s0 + q - (q * q) / 2;
}
export const wrap = (v: number, lo: number, hi: number) => { const r = hi - lo; return ((((v - lo) % r) + r) % r) + lo; };

export function signTexture(text: string, bg: string, fg: string, w = 512, h = 96, worn = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d')!;
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.strokeStyle = fg; x.lineWidth = 4; x.strokeRect(6, 6, w - 12, h - 12);
  x.fillStyle = fg; x.font = `bold ${Math.floor(h * 0.6)}px Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, w / 2, h / 2 + 3);
  if (worn) { const r = rng(5); for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(30,25,20,${r() * 0.35})`; x.fillRect(r() * w, r() * h, 2 + r() * 14, 2 + r() * 6); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// ---------- lightweight pedestrians (background extras) ----------
const pg = {
  body: new THREE.CapsuleGeometry(0.17, 0.5, 3, 7), head: new THREE.SphereGeometry(0.115, 8, 6), leg: new THREE.CapsuleGeometry(0.075, 0.62, 3, 6), arm: new THREE.CapsuleGeometry(0.05, 0.5, 3, 6),
};
export interface Ped extends THREE.Group { legs: THREE.Object3D[]; arms: THREE.Object3D[] }
export function makePed(color: number, skin: number, pants: number, scale = 1): Ped {
  const g = new THREE.Group() as Ped;
  const sm = mat(skin, 0.7), cm = mat(color, 0.9), pm = mat(pants, 0.9);
  const body = new THREE.Mesh(pg.body, cm); body.position.y = 1.18; const head = new THREE.Mesh(pg.head, sm); head.position.y = 1.72;
  const hair = new THREE.Mesh(pg.head, mat([0x1a120d, 0x3a2a1a, 0x6a4a2a, 0x151515, 0xb89a5a][Math.floor((color * 7) % 5)], 0.6)); hair.position.set(0, 1.76, -0.02); hair.scale.set(1.05, 0.9, 1.05);
  g.add(body, head, hair);
  g.legs = []; g.arms = [];
  for (const s of [-1, 1]) {
    const lp = new THREE.Group(); lp.position.set(s * 0.09, 0.9, 0); const l = new THREE.Mesh(pg.leg, pm); l.position.y = -0.4; lp.add(l); g.add(lp); g.legs.push(lp);
    const ap = new THREE.Group(); ap.position.set(s * 0.24, 1.48, 0); const a = new THREE.Mesh(pg.arm, cm); a.position.y = -0.3; ap.add(a); g.add(ap); g.arms.push(ap);
  }
  g.scale.setScalar(scale);
  g.traverse((o) => { o.castShadow = true; });
  return g;
}
export function animatePed(p: Ped, phase: number, amp: number) {
  const s = Math.sin(phase) * amp * 0.7;
  p.legs[0].rotation.x = s; p.legs[1].rotation.x = -s; p.arms[0].rotation.x = -s * 0.8; p.arms[1].rotation.x = s * 0.8;
}

// ---------- bird flock ----------
export function birdFlock(n: number, seed: number, cx: number, cy: number, cz: number, radius: number) {
  const r = rng(seed), g = new THREE.Group(), bm = mat(0x16181a, 1);
  const bodyG = new THREE.BoxGeometry(0.12, 0.1, 0.3), wingG = new THREE.BoxGeometry(0.5, 0.02, 0.16).translate(0.25, 0, 0);
  const birds = Array.from({ length: n }, () => {
    const b = new THREE.Group(); b.add(new THREE.Mesh(bodyG, bm));
    const w1 = new THREE.Mesh(wingG, bm), w2 = new THREE.Mesh(wingG, bm); w2.scale.x = -1; b.add(w1, w2);
    g.add(b); return { b, w1, w2, ph: r() * 6, off: r() * 6.28, rr: radius * (0.7 + r() * 0.5), hh: (r() - 0.5) * 6, sp: 0.12 + r() * 0.05 };
  });
  return {
    group: g,
    update(t: number) {
      for (const k of birds) {
        const a = k.off + t * k.sp, x = cx + Math.cos(a) * k.rr, z = cz + Math.sin(a * 1.3) * k.rr * 0.5;
        const nx = cx + Math.cos(a + 0.05) * k.rr, nz = cz + Math.sin((a + 0.05) * 1.3) * k.rr * 0.5;
        k.b.position.set(x, cy + k.hh + Math.sin(t * 0.7 + k.ph) * 1.2, z);
        k.b.rotation.y = Math.atan2(nx - x, nz - z); k.b.rotation.z = Math.cos(a) * 0.2;
        const f = Math.sin(t * 9 + k.ph) * 0.6; k.w1.rotation.z = f; k.w2.rotation.z = -f;
      }
    },
  };
}
