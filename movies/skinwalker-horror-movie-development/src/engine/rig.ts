import * as THREE from 'three';
import type { Anim, CharId, Expr } from '../movie/types';

// ---------------------------------------------------------------------------
// Shared unit geometries + cached materials (asset reuse -> few allocations)
// ---------------------------------------------------------------------------
const G = {
  cyl: new THREE.CylinderGeometry(1, 1, 1, 10, 1).translate(0, -0.5, 0),
  cylT: new THREE.CylinderGeometry(1, 0.74, 1, 10, 1).translate(0, -0.5, 0),
  torso: new THREE.CylinderGeometry(1, 0.8, 1, 12, 1).translate(0, 0.5, 0),
  sph: new THREE.SphereGeometry(1, 14, 10),
  hemi: new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.56),
  band: new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, Math.PI * 0.34, Math.PI * 0.3),
  box: new THREE.BoxGeometry(1, 1, 1),
  boxD: new THREE.BoxGeometry(1, 1, 1).translate(0, -0.5, 0),
  arc: new THREE.TorusGeometry(1, 0.07, 5, 16, Math.PI),
  ring: new THREE.TorusGeometry(1, 0.06, 5, 16),
};
const mats = new Map<string, THREE.MeshStandardMaterial>();
export function mat(color: number, rough = 0.85, emissive = 0, ei = 0) {
  const k = `${color}-${rough}-${emissive}-${ei}`;
  let m = mats.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, emissive, emissiveIntensity: ei }); mats.set(k, m); }
  return m;
}

type Hair = 'short' | 'bob' | 'long' | 'bald' | 'cap' | 'ponytail' | 'bun' | 'sparse' | 'old';
export interface Spec {
  scale: number; skin: number; shirt: number; pants: number; shoes: number; hair: number; hairStyle: Hair;
  beard?: number; mustache?: number; cap?: number; vest?: number; scarf?: number; glasses?: boolean; stoop?: number;
  thigh: number; shin: number; torso: number; upper: number; lower: number; neck: number;
  hw: number; hh: number; hd: number; shoulderW: number; torsoW: number; torsoD: number; limb: number;
  creature?: boolean; seed: number;
}
const H = { thigh: 0.45, shin: 0.46, torso: 0.54, upper: 0.3, lower: 0.28, neck: 0.07, hw: 0.105, hh: 0.125, hd: 0.115, shoulderW: 0.4, torsoW: 0.36, torsoD: 0.21, limb: 0.05 };

export const SPECS: Record<string, Spec> = {
  adam: { ...H, seed: 1, scale: 1.04, skin: 0xc99a7a, shirt: 0x4d5a36, pants: 0x2b2f3a, shoes: 0x1b1b1b, hair: 0x14100d, hairStyle: 'short', beard: 0x1b1613, torsoW: 0.4, shoulderW: 0.44 },
  lena: { ...H, seed: 2, scale: 0.945, skin: 0xe0b194, shirt: 0x8a2a36, pants: 0x1d1d24, shoes: 0x3a2a22, hair: 0x1c1411, hairStyle: 'bob', torsoW: 0.33, shoulderW: 0.35, limb: 0.045, hw: 0.098 },
  noah: { ...H, seed: 3, scale: 1.0, skin: 0xd2a07f, shirt: 0x3f6aa0, pants: 0x2f4058, shoes: 0x7a5a3a, hair: 0x18120e, hairStyle: 'short' },
  emily: { ...H, seed: 4, scale: 0.95, skin: 0xe6bfa5, shirt: 0xded5b8, pants: 0x3a3f4a, shoes: 0x5b4a3a, hair: 0x5e3b24, hairStyle: 'long', scarf: 0x2f7f78, torsoW: 0.33, shoulderW: 0.35, limb: 0.045, hw: 0.098 },
  shop: { ...H, seed: 5, scale: 0.97, skin: 0xbf9478, shirt: 0x7a2f2a, vest: 0x8d8a7c, pants: 0x3a3a34, shoes: 0x2a2520, hair: 0xbdbdb8, hairStyle: 'old', mustache: 0xcfcfca, glasses: true, stoop: 0.14 },
  hunter: { ...H, seed: 6, scale: 1.02, skin: 0xb58565, shirt: 0x4a3b28, vest: 0xd0601c, pants: 0x3b3a2a, shoes: 0x241c14, hair: 0x2a1e14, hairStyle: 'cap', cap: 0xd0601c, beard: 0x35261a },
  father: { ...H, seed: 7, scale: 1.04, skin: 0xc79a7b, shirt: 0x7a3a2a, pants: 0x2e3640, shoes: 0x2a2018, hair: 0x3a2a1c, hairStyle: 'short', torsoW: 0.4 },
  mother: { ...H, seed: 8, scale: 0.945, skin: 0xe0b194, shirt: 0x4a6a6b, pants: 0x3a3a3a, shoes: 0x3a2a22, hair: 0x3b2a1c, hairStyle: 'bun', torsoW: 0.33, shoulderW: 0.35 },
  sister: { ...H, seed: 9, scale: 0.62, skin: 0xe6bfa5, shirt: 0xc09a3a, pants: 0x5a4a6a, shoes: 0x6a2a2a, hair: 0x6a4a2a, hairStyle: 'ponytail', hw: 0.12, hh: 0.14, hd: 0.13 },
  boy: { ...H, seed: 10, scale: 0.72, skin: 0xd2a07f, shirt: 0x8a5a3a, pants: 0x3a4a5a, shoes: 0x2a2018, hair: 0x4a3320, hairStyle: 'short', hw: 0.115, hh: 0.135, hd: 0.125 },
  creature: { seed: 11, scale: 1, skin: 0xb9b2a4, shirt: 0x2a2826, pants: 0x242220, shoes: 0xb0a99b, hair: 0x2a2622, hairStyle: 'sparse', thigh: 0.72, shin: 0.72, torso: 0.8, upper: 0.68, lower: 0.7, neck: 0.22, hw: 0.105, hh: 0.19, hd: 0.115, shoulderW: 0.42, torsoW: 0.27, torsoD: 0.17, limb: 0.032, creature: true },
};

interface Pose {
  hipsY: number; pitch: number; lean: number; twist: number; headX: number; headY: number; headZ: number;
  lShX: number; lShZ: number; lElX: number; rShX: number; rShZ: number; rElX: number;
  lHipX: number; lHipZ: number; lKnee: number; rHipX: number; rHipZ: number; rKnee: number; open: number; rootY: number;
}
const POSE_KEYS = ['hipsY', 'pitch', 'lean', 'twist', 'headX', 'headY', 'headZ', 'lShX', 'lShZ', 'lElX', 'rShX', 'rShZ', 'rElX', 'lHipX', 'lHipZ', 'lKnee', 'rHipX', 'rHipZ', 'rKnee', 'open', 'rootY'] as (keyof Pose)[];
const P0 = (): Pose => ({ hipsY: 0, pitch: 0, lean: 0, twist: 0, headX: 0, headY: 0, headZ: 0, lShX: 0, lShZ: 0.07, lElX: -0.1, rShX: 0, rShZ: -0.07, rElX: -0.1, lHipX: 0, lHipZ: 0.02, lKnee: 0, rHipX: 0, rHipZ: -0.02, rKnee: 0, open: 0, rootY: 0 });

const EXPR: Record<Expr, { b: number; raise: number; smile: number; open: number; wide: number; lid: number }> = {
  neutral: { b: 0, raise: 0, smile: 0.12, open: 0, wide: 1, lid: 1 },
  fear: { b: -0.9, raise: 0.9, smile: -0.4, open: 0.45, wide: 1.35, lid: 1 },
  sad: { b: -0.8, raise: 0.1, smile: -0.7, open: 0, wide: 1, lid: 0.7 },
  angry: { b: 0.9, raise: -0.3, smile: -0.5, open: 0.12, wide: 1.05, lid: 0.8 },
  smile: { b: -0.1, raise: 0.1, smile: 0.9, open: 0.05, wide: 1, lid: 1 },
  shock: { b: -0.3, raise: 1, smile: -0.1, open: 0.7, wide: 1.45, lid: 1 },
  creepy: { b: 0, raise: 0.2, smile: 1.6, open: 0.1, wide: 1.3, lid: 1 },
  tired: { b: -0.2, raise: 0, smile: -0.1, open: 0, wide: 1, lid: 0.45 },
  worry: { b: -0.6, raise: 0.4, smile: -0.25, open: 0.02, wide: 1.1, lid: 1 },
  sleep: { b: 0, raise: 0, smile: 0.05, open: 0, wide: 1, lid: 0.05 },
};

export interface RigState {
  anim: Anim; expr: Expr; speak: number; look: THREE.Vector3 | null; u: number; t: number; phase: number; snap: boolean; dt: number;
}

function computePose(anim: Anim, ph: number, t: number, sp: Spec, speak: number, creature: boolean): Pose {
  const p = P0();
  const s = Math.sin(ph), c = Math.cos(ph);
  const br = Math.sin(t * 1.6 + sp.seed) * 0.02;
  const gest = speak > 0 ? speak : 0;
  const sitBase = () => {
    p.hipsY = -sp.thigh + 0.05; p.lHipX = -1.5; p.rHipX = -1.5; p.lKnee = 1.5; p.rKnee = 1.5; p.lHipZ = 0.1; p.rHipZ = -0.1;
    p.lean = 0.05 + br; p.lShX = -0.45; p.rShX = -0.45; p.lElX = -1.0; p.rElX = -1.0;
  };
  switch (anim) {
    case 'idle': case 'stand':
      p.lean = br; p.lShX = Math.sin(t * 0.9 + sp.seed) * 0.03; p.rShX = Math.sin(t * 0.8) * 0.03; p.headY = Math.sin(t * 0.5 + sp.seed) * 0.05;
      if (creature) { p.lShX = 0.05; p.rShX = -0.02; p.lElX = -0.2; p.rElX = -0.25; p.lean = 0.05; p.headX = 0.05; }
      break;
    case 'laugh':
      p.lean = br + Math.sin(t * 14) * 0.03; p.headX = -0.2; p.open = 0.5 + 0.3 * Math.sin(t * 15); p.lElX = -0.4;
      break;
    case 'walk': case 'limp': {
      const amp = anim === 'limp' ? 0.45 : 0.52;
      p.lHipX = -s * amp; p.rHipX = s * amp * (anim === 'limp' ? 0.5 : 1);
      p.lKnee = Math.max(0, c) * 0.9; p.rKnee = Math.max(0, -c) * 0.9;
      p.lShX = s * 0.42; p.rShX = -s * 0.42; p.lElX = -0.2 - Math.max(0, -s) * 0.4; p.rElX = -0.2 - Math.max(0, s) * 0.4;
      p.hipsY = Math.cos(ph * 2) * 0.018; p.lean = 0.05 + (anim === 'limp' ? 0.2 : 0); p.twist = s * 0.08;
      if (anim === 'limp') { p.rShX = -0.5; p.rElX = -1.5; p.headX = 0.15; }
      break;
    }
    case 'run': {
      p.lHipX = -s * 0.95 - 0.1; p.rHipX = s * 0.95 - 0.1;
      p.lKnee = 0.3 + Math.max(0, c) * 1.5; p.rKnee = 0.3 + Math.max(0, -c) * 1.5;
      p.lShX = s * 0.95; p.rShX = -s * 0.95; p.lElX = -1.35; p.rElX = -1.35;
      p.hipsY = -0.05 + Math.abs(Math.cos(ph)) * 0.05; p.lean = 0.28; p.twist = s * 0.15; p.headX = -0.1;
      break;
    }
    case 'stalk': { // creature: slow, stuttering, wrong
      const q = ph + Math.sin(ph * 2) * 0.7;
      const ss = Math.sin(q), cc = Math.cos(q);
      p.lHipX = -ss * 0.42; p.rHipX = ss * 0.42; p.lKnee = Math.max(0, cc) * 1.1; p.rKnee = Math.max(0, -cc) * 1.1;
      p.lShX = ss * 0.12 + 0.05; p.rShX = -ss * 0.12 + 0.05; p.lElX = -0.2; p.rElX = -0.25;
      p.lean = 0.1; p.headX = 0.15; p.twist = ss * 0.1; p.hipsY = Math.cos(q * 2) * 0.02;
      break;
    }
    case 'sprint': {
      p.lHipX = -s * 1.0 - 0.2; p.rHipX = s * 1.0 - 0.2; p.lKnee = 0.4 + Math.max(0, c) * 1.6; p.rKnee = 0.4 + Math.max(0, -c) * 1.6;
      p.lShX = -1.0 + s * 0.8; p.rShX = -1.0 - s * 0.8; p.lElX = -0.3; p.rElX = -0.3;
      p.lean = 0.85; p.hipsY = -0.2; p.headX = -0.7; p.twist = s * 0.2;
      break;
    }
    case 'sit': sitBase();
      if (gest) { p.rShX = -0.7 + Math.sin(t * 2.2) * 0.25 * gest; p.rElX = -1.2 + Math.sin(t * 3) * 0.3 * gest; }
      break;
    case 'drive': sitBase(); p.lShX = -1.05; p.rShX = -1.05; p.lElX = -0.45; p.rElX = -0.45; p.lShZ = -0.05; p.rShZ = 0.05; break;
    case 'slump': sitBase(); p.lean = 0.5; p.headX = 0.5; p.lShX = -0.1; p.rShX = -0.1; p.lElX = -0.5; p.rElX = -0.5; break;
    case 'wake': case 'wakePhone':
      p.hipsY = -(sp.thigh + sp.shin) + 0.11; p.lHipX = -1.5; p.rHipX = -1.5; p.lKnee = 0.08; p.rKnee = 0.08; p.lean = 0.05 + br; p.lShX = -0.2; p.rShX = -0.2; p.lElX = -0.4; p.rElX = -0.4;
      if (anim === 'wakePhone') { p.rShX = -0.5; p.rElX = -2.4; p.rShZ = 0.1; p.headZ = 0.12; }
      break;
    case 'sleep': case 'lie':
      p.pitch = -Math.PI / 2; p.rootY = 0.17; p.lShZ = 0.12; p.rShZ = -0.12; p.lElX = -0.3; p.rElX = -0.3; p.lean = br * 2; p.headX = 0.1;
      if (anim === 'lie') { p.lShZ = 0.7; p.rShZ = -0.5; p.lHipZ = 0.2; p.headY = 0.5; }
      break;
    case 'fear':
      p.hipsY = -0.07; p.lean = 0.16; p.lHipX = -0.3; p.rHipX = -0.15; p.lKnee = 0.5; p.rKnee = 0.4;
      p.lShX = -0.95; p.rShX = -1.0; p.lElX = -1.9; p.rElX = -1.9; p.lShZ = 0.15; p.rShZ = -0.15; p.headX = 0.1;
      p.twist = Math.sin(t * 38) * 0.02; p.headY = Math.sin(t * 31) * 0.03;
      break;
    case 'crouch':
      p.hipsY = -sp.thigh * 0.72; p.lHipX = -1.35; p.rHipX = -1.35; p.lKnee = 2.0; p.rKnee = 2.0; p.lean = 0.5; p.lShX = -0.6; p.rShX = -0.6; p.lElX = -0.8; p.rElX = -0.8; p.headX = -0.2;
      break;
    case 'cover': case 'cry':
      p.lean = 0.25 + Math.sin(t * 9) * (anim === 'cry' ? 0.03 : 0); p.headX = 0.35; p.lShX = -1.25; p.rShX = -1.25; p.lElX = -2.35; p.rElX = -2.35; p.lShZ = -0.1; p.rShZ = 0.1;
      p.hipsY = -0.03; p.lKnee = 0.2; p.rKnee = 0.2; p.lHipX = -0.12; p.rHipX = -0.12;
      break;
    case 'hold':
      p.lShX = -0.85; p.rShX = -0.85; p.lElX = -1.4; p.rElX = -1.4; p.lShZ = -0.1; p.rShZ = 0.1; p.headX = 0.2; p.lean = 0.04;
      break;
    case 'aim':
      p.lShX = -1.5; p.rShX = -1.5; p.lElX = -0.12; p.rElX = -0.12; p.lShZ = -0.13; p.rShZ = 0.13; p.lean = 0.08; p.lHipX = -0.15; p.lKnee = 0.2; p.rHipX = 0.15;
      break;
    case 'point':
      p.rShX = -1.5; p.rElX = -0.1; p.lShX = 0.05; p.lean = 0.04;
      break;
    case 'reach':
      p.rShX = -1.45; p.rElX = -0.15; p.lShX = 0.1; p.lean = 0.35; p.headX = 0.1;
      p.lHipX = -0.4; p.lKnee = 0.4;
      break;
    case 'peer':
      p.hipsY = -0.55; p.lHipX = -1.0; p.rHipX = -0.8; p.lKnee = 1.5; p.rKnee = 1.3; p.lean = 0.8; p.headX = -0.55; p.rShX = -2.0; p.rElX = -0.15; p.lShX = -0.3; p.lElX = -0.5;
      break;
    case 'lean':
      p.lean = 0.28; p.lShX = -0.7; p.rShX = -0.7; p.lElX = -1.3; p.rElX = -1.3; p.headX = -0.1;
      break;
  }
  if (anim === 'idle' && gest) { // speaking gestures while standing
    p.rShX = -0.45 + Math.sin(t * 2.1 + sp.seed) * 0.3 * gest; p.rElX = -0.95 + Math.sin(t * 3.1) * 0.3 * gest;
    p.lShX = -0.25 + Math.sin(t * 1.7) * 0.2 * gest; p.lElX = -0.7 + Math.sin(t * 2.6) * 0.2 * gest;
    p.headX += Math.sin(t * 2.7) * 0.05 * gest;
  }
  p.open += speak * (0.25 + 0.55 * Math.abs(Math.sin(t * 13.1) * Math.sin(t * 7.7 + 1)));
  return p;
}

// ---------------------------------------------------------------------------
export class Rig {
  root = new THREE.Group();
  spec: Spec;
  private hips = new THREE.Group(); private torso = new THREE.Group(); private neck = new THREE.Group(); private head = new THREE.Group();
  private lSh = new THREE.Group(); private rSh = new THREE.Group(); private lEl = new THREE.Group(); private rEl = new THREE.Group();
  private lHip = new THREE.Group(); private rHip = new THREE.Group(); private lKn = new THREE.Group(); private rKn = new THREE.Group();
  private eyes: THREE.Group[] = []; private brows: THREE.Mesh[] = []; private mouth = new THREE.Group();
  private lip!: THREE.Mesh; private curve!: THREE.Mesh; private teeth!: THREE.Mesh;
  private sclera: THREE.MeshStandardMaterial; private pupil: THREE.MeshStandardMaterial;
  private cur = P0();
  private ex = { b: 0, raise: 0, smile: 0.12, open: 0, wide: 1, lid: 1 };
  private baseHip: number;
  private mw: number;
  private tmp = new THREE.Vector3();
  private owned: THREE.Material[] = [];
  hairBack?: THREE.Object3D;

  constructor(public id: string, spec: Spec) {
    this.spec = spec;
    const s = spec, cr = !!s.creature;
    this.root.scale.setScalar(s.scale);
    this.root.rotation.order = 'YXZ';
    this.baseHip = s.thigh + s.shin + 0.04;
    this.hips.position.y = this.baseHip;
    this.root.add(this.hips);
    const skin = mat(s.skin, cr ? 0.55 : 0.65, cr ? 0x201c18 : 0, cr ? 0.5 : 0);
    const shirt = mat(s.shirt, cr ? 0.95 : 0.9), pants = mat(s.pants, 0.9), shoes = mat(s.shoes, 0.8);
    const m = (g: THREE.BufferGeometry, mt: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
      const o = new THREE.Mesh(g, mt); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; parent.add(o); return o;
    };
    // pelvis + torso
    m(G.sph, pants, this.hips, 0, 0, 0, s.torsoW * 0.5, 0.11, s.torsoD * 0.6);
    this.hips.add(this.torso);
    m(G.torso, shirt, this.torso, 0, 0, 0, s.torsoW * 0.5, s.torso, s.torsoD * 0.5);
    m(G.sph, shirt, this.torso, 0, s.torso - 0.02, 0, s.shoulderW * 0.52, 0.06, s.torsoD * 0.55);
    if (s.vest) m(G.torso, mat(s.vest, 0.9), this.torso, 0, s.torso * 0.12, 0, s.torsoW * 0.53, s.torso * 0.72, s.torsoD * 0.55);
    if (s.scarf) m(G.ring, mat(s.scarf), this.torso, 0, s.torso + 0.01, 0, 0.1, 0.1, 0.1).rotation.x = Math.PI / 2;
    if (cr) { // ribs + torn rags + damaged skin patches
      const rib = mat(0x6d665a, 0.9);
      for (let i = 0; i < 5; i++) m(G.box, rib, this.torso, 0, s.torso * (0.4 + i * 0.1), s.torsoD * 0.46, s.torsoW * 0.8, 0.012, 0.01);
      for (let i = 0; i < 6; i++) m(G.boxD, shirt, this.hips, (i - 2.5) * 0.06, -0.02, (i % 2 ? 0.07 : -0.07), 0.05, 0.5 + (i % 3) * 0.12, 0.012);
      const dm = mat(0x4a2f2c, 0.9);
      [[-0.06, 0.5, 0.07], [0.07, 0.25, 0.07], [0.04, 0.7, -0.06]].forEach(([x, y, z], i) => m(G.sph, dm, this.torso, x, s.torso * y, z, 0.04 + i * 0.01, 0.05, 0.015));
    }
    // neck + head
    this.torso.add(this.neck); this.neck.position.y = s.torso;
    m(G.cyl, skin, this.neck, 0, 0.03, 0, cr ? 0.04 : 0.045, s.neck + 0.03, cr ? 0.04 : 0.045);
    this.neck.add(this.head); this.head.position.y = s.neck + s.hh * 0.9;
    const skull = m(G.sph, skin, this.head, 0, 0, 0, s.hw, s.hh, s.hd);
    skull.castShadow = false;
    // face
    this.sclera = new THREE.MeshStandardMaterial({ color: cr ? 0x0a0908 : 0xe8e4dc, roughness: 0.3, emissive: 0, emissiveIntensity: 0 });
    this.pupil = new THREE.MeshStandardMaterial({ color: cr ? 0x000000 : 0x1a1410, roughness: 0.2 });
    this.owned.push(this.sclera, this.pupil);
    const er = s.hw * (cr ? 0.27 : 0.2);
    for (const sx of [1, -1]) {
      const eg = new THREE.Group(); eg.position.set(sx * s.hw * (cr ? 0.46 : 0.4), s.hh * (cr ? 0.08 : 0.1) + (cr && sx < 0 ? -0.012 : 0), s.hd * 0.8);
      this.head.add(eg); this.eyes.push(eg);
      const e = m(G.sph, this.sclera, eg, 0, 0, 0, er, er * (cr ? 1.5 : 1), er * 0.6); e.castShadow = false;
      const pu = m(G.sph, this.pupil, eg, 0, 0, er * 0.4, er * 0.55, er * 0.55, er * 0.3); pu.castShadow = false;
      const b = m(G.box, mat(cr ? 0x6e675c : s.hair), this.head, sx * s.hw * 0.42, s.hh * 0.3, s.hd * 0.86, s.hw * 0.42, 0.011, 0.012);
      b.castShadow = false; this.brows.push(b);
      m(G.sph, skin, this.head, sx * s.hw * 0.98, 0, -s.hd * 0.05, 0.012, 0.03, 0.02).castShadow = false; // ear
    }
    m(G.sph, skin, this.head, 0, -s.hh * 0.05, s.hd * 0.98, cr ? 0.009 : 0.014, cr ? 0.03 : 0.025, cr ? 0.012 : 0.02).castShadow = false; // nose
    this.mw = s.hw * (cr ? 0.62 : 0.38);
    this.head.add(this.mouth); this.mouth.position.set(0, -s.hh * 0.42, s.hd * 0.9);
    this.lip = m(G.box, mat(0x1a0808, 0.5), this.mouth, 0, 0, 0, this.mw * 1.0, 0.004, 0.01); this.lip.castShadow = false;
    this.teeth = m(G.box, mat(0xd8d2c0, 0.4), this.mouth, 0, 0.003, 0.004, this.mw * 1.3, 0.012, 0.008); this.teeth.castShadow = false;
    const curveMat = mat(cr ? 0x3a2220 : 0x7a3a34, 0.6); curveMat.side = THREE.DoubleSide;
    this.curve = m(G.arc, curveMat, this.mouth, 0, 0, 0, this.mw, this.mw * 0.4, 0.5); this.curve.castShadow = false;
    // hair & facial hair
    const hm = mat(s.hair, 0.95);
    const hr = s.hairStyle;
    if (hr !== 'bald' && hr !== 'sparse' && hr !== 'old') {
      const cap = m(G.hemi, hr === 'cap' ? mat(s.cap!, 0.9) : hm, this.head, 0, s.hh * 0.04, -s.hd * 0.06, s.hw * 1.07, s.hh * 1.08, s.hd * 1.07);
      cap.rotation.x = -0.28; cap.castShadow = false;
      if (hr === 'cap') m(G.box, mat(s.cap!, 0.9), this.head, 0, s.hh * 0.5, s.hd * 1.0, s.hw * 1.5, 0.01, s.hd * 0.55).rotation.x = 0.12;
    }
    if (hr === 'bob' || hr === 'long') {
      const len = hr === 'bob' ? 0.2 : 0.42;
      const back = m(G.cylT, hm, this.head, 0, -s.hh * 0.1, -s.hd * 0.35, s.hw * 1.05, len + s.hh, s.hd * 0.7);
      this.hairBack = back;
      for (const sx of [1, -1]) m(G.cyl, hm, this.head, sx * s.hw * 0.96, s.hh * 0.35, s.hd * 0.1, 0.02, s.hh * 1.4 + len * 0.8, s.hd * 0.55).castShadow = false;
    }
    if (hr === 'ponytail') { m(G.cylT, hm, this.head, 0, s.hh * 0.2, -s.hd * 1.05, 0.025, 0.2, 0.025).rotation.x = 0.25; }
    if (hr === 'bun') m(G.sph, hm, this.head, 0, s.hh * 0.75, -s.hd * 0.7, 0.05, 0.05, 0.05);
    if (hr === 'old') {
      m(G.band, hm, this.head, 0, 0, -s.hd * 0.04, s.hw * 1.06, s.hh * 1.05, s.hd * 1.05).castShadow = false;
      m(G.sph, hm, this.head, 0, -s.hh * 0.2, -s.hd * 0.7, s.hw * 0.85, s.hh * 0.4, s.hd * 0.4).castShadow = false;
    }
    if (hr === 'sparse') {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const st = m(G.cyl, hm, this.head, Math.sin(a) * s.hw * 0.7, s.hh * (0.5 + (i % 3) * 0.12), Math.cos(a) * s.hd * 0.7 - s.hd * 0.3, 0.004, 0.25 + (i % 4) * 0.08, 0.004);
        st.rotation.set(Math.cos(a) * 0.2 - 0.1, 0, -Math.sin(a) * 0.25); st.castShadow = false;
      }
    }
    if (s.beard) m(G.sph, mat(s.beard, 0.95), this.head, 0, -s.hh * 0.62, s.hd * 0.28, s.hw * 0.88, s.hh * 0.38, s.hd * 0.74).castShadow = false;
    if (s.mustache) m(G.box, mat(s.mustache, 0.95), this.head, 0, -s.hh * 0.28, s.hd * 0.96, s.hw * 0.48, 0.016, 0.012).castShadow = false;
    if (s.glasses) {
      for (const sx of [1, -1]) m(G.ring, mat(0x222222, 0.4), this.head, sx * s.hw * 0.4, s.hh * 0.1, s.hd * 0.93, 0.03, 0.03, 0.03).castShadow = false;
      m(G.box, mat(0x222222), this.head, 0, s.hh * 0.12, s.hd * 0.94, 0.02, 0.004, 0.004).castShadow = false;
    }
    // arms
    const sleeve = s.vest && !cr ? mat(s.shirt) : shirt;
    const arm = (sh: THREE.Group, el: THREE.Group, sx: number) => {
      sh.position.set(sx * s.shoulderW * 0.5, s.torso - 0.05, 0); this.torso.add(sh);
      m(G.sph, sleeve, sh, 0, 0, 0, s.limb * 1.5, s.limb * 1.5, s.limb * 1.5);
      m(G.cylT, sleeve, sh, 0, 0, 0, s.limb * 1.35, s.upper, s.limb * 1.35);
      el.position.y = -s.upper; sh.add(el);
      m(G.sph, sleeve, el, 0, 0, 0, s.limb * 1.1, s.limb * 1.1, s.limb * 1.1);
      m(G.cylT, cr ? skin : sleeve, el, 0, 0, 0, s.limb * 1.15, s.lower, s.limb * 1.15);
      const hand = new THREE.Group(); hand.position.y = -s.lower; el.add(hand);
      if (cr) {
        for (let i = 0; i < 4; i++) {
          const f = m(G.cylT, skin, hand, (i - 1.5) * 0.017, 0, 0, 0.007, 0.26 - (i === 0 || i === 3 ? 0.06 : 0), 0.007);
          f.rotation.z = (i - 1.5) * 0.08; f.rotation.x = -0.06;
        }
        m(G.sph, skin, hand, 0, 0.0, 0, 0.034, 0.045, 0.02);
      } else m(G.sph, skin, hand, 0, -0.04, 0, s.limb * 1.1, s.limb * 1.5, s.limb * 0.8);
    };
    arm(this.lSh, this.lEl, 1); arm(this.rSh, this.rEl, -1);
    // legs
    const leg = (hp: THREE.Group, kn: THREE.Group, sx: number) => {
      hp.position.set(sx * s.torsoW * 0.26, 0, 0); this.hips.add(hp);
      m(G.cylT, pants, hp, 0, 0, 0, s.limb * 1.7, s.thigh, s.limb * 1.7);
      kn.position.y = -s.thigh; hp.add(kn);
      m(G.sph, pants, kn, 0, 0, 0, s.limb * 1.3, s.limb * 1.3, s.limb * 1.3);
      m(G.cylT, cr ? skin : pants, kn, 0, 0, 0, s.limb * 1.3, s.shin, s.limb * 1.3);
      m(G.box, cr ? skin : shoes, kn, 0, -s.shin - 0.01, cr ? 0.1 : 0.06, s.limb * 1.9, 0.07, cr ? 0.3 : 0.26);
    };
    leg(this.lHip, this.lKn, 1); leg(this.rHip, this.rKn, -1);
  }

  /** world-space head position */
  headWorld(out: THREE.Vector3) { return this.head.getWorldPosition(out); }

  update(st: RigState) {
    const s = this.spec, cr = !!s.creature;
    const speak = st.speak;
    const tgt = computePose(st.anim, st.phase, st.t, s, speak, cr);
    // look-at (head + a share of torso)
    let ly = 0, lx = 0;
    if (st.look && st.anim !== 'sleep' && st.anim !== 'lie') {
      this.root.updateWorldMatrix(true, false);
      const hp = this.headWorld(this.tmp);
      const dx = st.look.x - hp.x, dz = st.look.z - hp.z, dy = st.look.y - hp.y;
      let rel = Math.atan2(dx, dz) - this.root.rotation.y;
      rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      rel = Math.max(-1.7, Math.min(1.7, rel));
      tgt.twist += rel * 0.3; ly = rel * 0.7;
      lx = -Math.atan2(dy, Math.hypot(dx, dz)) * 0.8;
    }
    tgt.headY += ly; tgt.headX += lx;
    // uncanny wrongness: tilt, snap, stillness
    const u = st.u;
    if (u > 0) {
      const snap = Math.floor(st.t * 0.7 + s.seed) % 3;
      tgt.headZ += u * (0.28 + snap * 0.1) * (cr ? 1 : 1);
      tgt.headY += u * (snap - 1) * 0.12 + (Math.sin(st.t * 0.4) > 0.8 ? u * 0.5 : 0);
      if (!cr) { tgt.lean *= 0.3; tgt.lShX *= 0.5; tgt.rShX *= 0.5; }
    }
    tgt.lean += s.stoop ?? 0;
    const k = st.snap ? 1 : 1 - Math.exp(-st.dt * 9);
    const c = this.cur as unknown as Record<string, number>, tg = tgt as unknown as Record<string, number>;
    for (const key of POSE_KEYS) c[key] += (tg[key] - c[key]) * k;
    const p = this.cur;
    this.hips.position.y = this.baseHip + p.hipsY;
    this.root.rotation.x = p.pitch;
    this.torso.rotation.set(p.lean, p.twist, 0);
    this.head.rotation.set(p.headX, p.headY, p.headZ);
    this.lSh.rotation.set(p.lShX, 0, p.lShZ); this.rSh.rotation.set(p.rShX, 0, p.rShZ);
    this.lEl.rotation.x = p.lElX; this.rEl.rotation.x = p.rElX;
    this.lHip.rotation.set(p.lHipX, 0, p.lHipZ); this.rHip.rotation.set(p.rHipX, 0, p.rHipZ);
    this.lKn.rotation.x = p.lKnee; this.rKn.rotation.x = p.rKnee;
    this.root.userData.rootY = p.rootY * s.scale;

    // face
    const ex = EXPR[st.expr] ?? EXPR.neutral;
    const ek = st.snap ? 1 : 1 - Math.exp(-st.dt * 8);
    const e = this.ex as unknown as Record<string, number>, et = ex as unknown as Record<string, number>;
    for (const key in e) e[key] += (et[key] - e[key]) * ek;
    const stretch = Math.max(0, u - 1);
    const blinkT = (st.t + s.seed * 1.7) % 4.1;
    const sleeping = st.anim === 'sleep';
    let lid = sleeping ? 0.05 : this.ex.lid;
    if (blinkT < 0.13 && !cr) lid *= 0.1;
    this.eyes.forEach((eg, i) => {
      const w = this.ex.wide + (cr ? 0.15 : 0) + u * 0.12;
      eg.scale.set(w, lid * w * (cr && i === 1 ? 1.12 : 1), 1);
    });
    this.brows.forEach((b, i) => {
      const sgn = i === 0 ? 1 : -1;
      b.rotation.z = sgn * this.ex.b * 0.45; b.position.y = s.hh * (0.3 + this.ex.raise * 0.1 + (this.ex.lid < 0.6 ? -0.05 : 0));
    });
    const sm = this.ex.smile + u * (cr ? 0.5 : 0.7) * (st.expr === 'neutral' ? 1 : 0.3) + stretch * 0.8;
    const open = Math.max(0, this.ex.open + p.open + stretch * 0.7 * (1 + 0.1 * Math.sin(st.t * 30)));
    const wide = 1 + stretch * 0.9;
    this.curve.visible = Math.abs(sm) > 0.08;
    this.curve.scale.set(this.mw * wide * (1 + Math.max(0, sm) * 0.2), -this.mw * 0.45 * sm, 0.5);
    this.curve.position.y = sm > 0 ? this.mw * 0.34 * Math.min(sm, 1.6) : -this.mw * 0.2 * Math.abs(sm);
    this.lip.scale.set(this.mw * (0.7 + Math.min(open, 1) * 0.3) * wide, 0.003 + Math.min(open, 1.2) * 0.028, 0.01);
    this.teeth.visible = cr ? (u > 0.5 && (sm > 0.5 || open > 0.2)) : stretch > 0.2;
    this.teeth.scale.set(this.mw * 1.3 * wide, 0.012 + open * 0.02, 0.008);
    this.head.scale.set(1, 1 + stretch * 0.5, 1);
    // eye shine (animal-like reflection) for uncanny/creature
    const shine = Math.min(1, u * (cr ? 1.2 : 0.8));
    this.sclera.emissive.setHex(0xffe29a); this.sclera.emissiveIntensity = shine > 0.3 ? shine * 2.2 : 0;
    this.sclera.color.setHex(shine > 0.3 ? 0xffe9b0 : cr ? 0x0a0908 : 0xe8e4dc);
    this.pupil.color.setHex(shine > 0.3 && cr ? 0x201808 : 0x1a1410);
  }

  dispose() {
    this.owned.forEach((m) => m.dispose());
    this.root.removeFromParent();
  }
}

// ---------------------------------------------------------------------------
export class CarRig {
  root = new THREE.Group();
  private wheels: THREE.Mesh[] = [];
  head: THREE.SpotLight;
  private lamps: THREE.Mesh[] = [];
  private owned: (THREE.Material | THREE.BufferGeometry)[] = [];
  constructor(lightsOn: boolean) {
    const body = mat(0x3a4a5e, 0.45), dark = mat(0x111214, 0.8), seat = mat(0x2a2622, 0.9);
    const glass = new THREE.MeshStandardMaterial({ color: 0x9fb4c0, transparent: true, opacity: 0.16, roughness: 0.1, side: THREE.DoubleSide });
    this.owned.push(glass);
    const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
      const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; this.root.add(o); return o;
    };
    add(G.box, body, 0, 0.55, 0, 1.82, 0.5, 4.4);
    add(G.box, body, 0, 0.88, 1.5, 1.74, 0.16, 1.25);
    add(G.box, body, 0, 0.9, -1.75, 1.74, 0.16, 0.9);
    add(G.box, dark, 0, 0.2, 0, 1.6, 0.06, 3.6);
    add(G.box, body, 0, 1.8, -0.1, 1.74, 0.08, 2.3);
    for (const sx of [1, -1]) for (const sz of [0.95, -1.15]) add(G.box, body, sx * 0.84, 1.3, sz, 0.07, 1.0, 0.09);
    const ws = add(G.box, glass, 0, 1.33, 1.0, 1.7, 0.95, 0.02); ws.rotation.x = -0.45;
    const rw = add(G.box, glass, 0, 1.33, -1.25, 1.7, 0.95, 0.02); rw.rotation.x = 0.4;
    for (const sx of [0.45, -0.45]) {
      add(G.box, seat, sx, 0.46, 0.35, 0.5, 0.22, 0.5); add(G.box, seat, sx, 0.88, 0.1, 0.5, 0.65, 0.12);
    }
    add(G.box, seat, 0, 0.46, -0.7, 1.6, 0.22, 0.5); add(G.box, seat, 0, 0.88, -0.98, 1.6, 0.65, 0.12);
    add(G.box, dark, 0.45, 0.9, 0.9, 0.5, 0.06, 0.3);
    const wg = new THREE.CylinderGeometry(0.36, 0.36, 0.26, 16); wg.rotateZ(Math.PI / 2); this.owned.push(wg);
    for (const sx of [1, -1]) for (const sz of [1.4, -1.4]) { this.wheels.push(add(wg, dark, sx * 0.92, 0.36, sz, 1, 1, 1)); }
    const lampM = new THREE.MeshBasicMaterial({ color: lightsOn ? 0xfff2c8 : 0x888070 }); this.owned.push(lampM);
    for (const sx of [0.62, -0.62]) this.lamps.push(add(G.sph, lampM, sx, 0.72, 2.2, 0.14, 0.1, 0.06));
    const tail = new THREE.MeshBasicMaterial({ color: 0x8a1010 }); this.owned.push(tail);
    for (const sx of [0.66, -0.66]) add(G.sph, tail, sx, 0.78, -2.2, 0.12, 0.07, 0.04);
    this.head = new THREE.SpotLight(0xfff0d0, lightsOn ? 60 : 0, 40, 0.5, 0.6, 1.2);
    this.head.position.set(0, 0.8, 2.1); this.head.target.position.set(0, 0, 12);
    this.root.add(this.head, this.head.target);
  }
  roll(dist: number) { this.wheels.forEach((w) => (w.rotation.x += dist / 0.36)); }
  dispose() { this.owned.forEach((o) => o.dispose()); this.root.removeFromParent(); }
}

export function specFor(c: CharId): Spec { return SPECS[c]; }
