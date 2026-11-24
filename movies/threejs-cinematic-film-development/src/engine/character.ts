// Fully rigged stylized-realistic human built from low-poly primitives with a joint hierarchy, face rig,
// eye tracking, blinking, lip movement and animation blending.
import * as THREE from 'three';
import type { CharacterSpec } from '../story/characters';
import type { Sample } from '../story/track';
import type { Prop } from '../story/types';
import { KEYS, EMOTES, basePose, computePose, type Face, type Pose } from './animation';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const angDiff = (a: number, b: number) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

function photoTexture(kind: 'photo' | 'drawing' | 'note') {
  const c = document.createElement('canvas'); c.width = 128; c.height = 160;
  const x = c.getContext('2d')!;
  if (kind === 'photo') {
    x.fillStyle = '#e8dcc2'; x.fillRect(0, 0, 128, 160);
    const g = x.createLinearGradient(0, 8, 0, 120); g.addColorStop(0, '#8fb0c4'); g.addColorStop(1, '#6d8a52'); x.fillStyle = g; x.fillRect(8, 8, 112, 112);
    x.fillStyle = '#3a2a22'; x.beginPath(); x.arc(44, 56, 12, 0, 7); x.fill(); x.fillRect(32, 68, 24, 44);
    x.fillStyle = '#d9a35a'; x.beginPath(); x.arc(84, 74, 9, 0, 7); x.fill(); x.fillRect(76, 84, 16, 30);
    x.fillStyle = '#4b3f35'; x.fillRect(60, 92, 14, 20);
  } else if (kind === 'drawing') {
    x.fillStyle = '#f4efe2'; x.fillRect(0, 0, 128, 160);
    x.fillStyle = '#f2c230'; x.beginPath(); x.arc(104, 22, 12, 0, 7); x.fill();
    x.fillStyle = '#58a04a'; x.fillRect(0, 128, 128, 32);
    x.strokeStyle = '#d0453a'; x.lineWidth = 3; x.strokeRect(34, 84, 60, 44); x.beginPath(); x.moveTo(30, 84); x.lineTo(64, 56); x.lineTo(98, 84); x.stroke();
    x.strokeStyle = '#2a4aa8'; x.lineWidth = 3;
    for (const [px, h] of [[14, 40], [44, 30], [72, 26], [104, 36]] as const) { x.beginPath(); x.arc(px + 5, 138 - h, 5, 0, 7); x.moveTo(px + 5, 143 - h); x.lineTo(px + 5, 150); x.moveTo(px - 3, 146 - h + 4); x.lineTo(px + 13, 146 - h + 4); x.stroke(); }
  } else {
    x.fillStyle = '#e2d7a6'; x.fillRect(0, 0, 128, 160);
    x.strokeStyle = '#2a2a3a'; x.lineWidth = 1.6;
    for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(10, 20 + i * 15); for (let k = 0; k < 8; k++) x.lineTo(10 + k * 14, 20 + i * 15 + (k % 2 ? 3 : -3)); x.stroke(); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export interface CharUpdate {
  dt: number; time: number; sample: Sample; snap: boolean;
  faceYaw: number | null; lookWorld: THREE.Vector3 | null;
  speak: { text: string; u: number; style: string } | null;
}

export class Character {
  root = new THREE.Group();
  body = new THREE.Group();
  j: Record<string, THREE.Object3D> = {};
  head!: THREE.Object3D;
  rHand!: THREE.Object3D;
  headSmooth = new THREE.Vector3();
  scaleK: number;
  private pose: Pose = basePose();
  private face: Face = { ...EMOTES.neutral };
  private yaw = 0;
  private lastPhase = 0;
  private speakLevel = 0; private mouthOpen = 0;
  private spdSmooth = 0;
  private eyes: { grp: THREE.Object3D; lid: THREE.Object3D }[] = [];
  private brows: THREE.Object3D[] = [];
  private mouthLine!: THREE.Mesh; private mouthIn!: THREE.Mesh;
  private tears: THREE.Mesh[] = [];
  private props: Partial<Record<Prop, THREE.Object3D>> = {};
  private first = true;
  private tmpV = new THREE.Vector3(); private tmpV2 = new THREE.Vector3();
  private owned: THREE.Material[] = [];
  private textures: THREE.Texture[] = [];

  constructor(public spec: CharacterSpec) {
    this.scaleK = spec.height / 1.75;
    this.build();
    this.root.scale.setScalar(this.scaleK);
    this.root.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  }

  private m(color: number, rough = 0.85, metal = 0) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    this.owned.push(m); return m;
  }
  private mesh(geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.scale.set(sx, sy, sz); parent.add(me); return me;
  }
  private grp(parent: THREE.Object3D, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }

  private build() {
    const s = this.spec, b = s.build;
    const skin = this.m(s.skin, 0.62), jacket = this.m(s.jacket, 0.92), trim = this.m(s.jacketTrim, 0.8), pants = this.m(s.pants, 0.95), boots = this.m(s.boots, 0.8), pack = this.m(s.pack, 0.95);
    const hairM = this.m(s.hair, 0.55), dark = this.m(0x111111, 0.7), glove = this.m(s.gloves ?? s.skin, s.gloves ? 0.85 : 0.62);
    const cap = (r: number, l: number) => new THREE.CapsuleGeometry(r, l, 4, 8);
    this.root.add(this.body);
    const pelvis = this.grp(this.body, 0, 0.93, 0); this.j.pelvis = pelvis;
    this.mesh(new THREE.SphereGeometry(0.15, 10, 8), pants, pelvis, 0, 0, 0, 1.15 * b, 0.72, 0.85);

    for (const side of [1, -1]) {
      const n = side > 0 ? 'l' : 'r';
      const hip = this.grp(pelvis, side * 0.09 * b, -0.02, 0); this.j[n + 'Hip'] = hip;
      this.mesh(cap(0.078, 0.3), pants, hip, 0, -0.225);
      const knee = this.grp(hip, 0, -0.45, 0); this.j[n + 'Kn'] = knee;
      this.mesh(cap(0.06, 0.33), pants, knee, 0, -0.225);
      const ank = this.grp(knee, 0, -0.45, 0); this.j[n + 'Ank'] = ank;
      this.mesh(new THREE.BoxGeometry(0.115, 0.11, 0.29), boots, ank, 0, -0.04, 0.06);
      this.mesh(new THREE.CylinderGeometry(0.066, 0.07, 0.13, 8), boots, ank, 0, 0.02, 0);
    }

    const spine = this.grp(pelvis, 0, 0.05, 0); this.j.spine = spine;
    this.mesh(cap(0.15, 0.3), jacket, spine, 0, 0.27, 0, 1.2 * b, 1, 0.82);
    this.mesh(new THREE.CylinderGeometry(0.17 * b, 0.2 * b, 0.2, 10), jacket, spine, 0, 0.02, 0, 1, 1, 0.82);
    this.mesh(new THREE.CylinderGeometry(0.16 * b, 0.16 * b, 0.05, 10), dark, spine, 0, 0.1, 0, 1.08, 1, 0.84);
    // jacket zip / trim
    this.mesh(new THREE.BoxGeometry(0.018, 0.5, 0.01), trim, spine, 0, 0.3, 0.125);
    if (s.id === 'arin') {
      this.mesh(new THREE.BoxGeometry(0.09, 0.08, 0.06), this.m(0x8a2a24), spine, 0.15, 0.06, 0.1); // medical pouch
    } else {
      this.mesh(new THREE.BoxGeometry(0.1, 0.07, 0.05), this.m(0x2a2f2a), spine, -0.15, 0.06, 0.1); // holster pouch
    }
    const chest = this.grp(spine, 0, 0.35, 0); this.j.chest = chest;
    // backpack
    const bpW = s.id === 'arin' ? 0.34 : 0.28, bpH = s.id === 'arin' ? 0.46 : 0.38;
    this.mesh(new THREE.BoxGeometry(bpW, bpH, 0.17), pack, chest, 0, -0.06, -0.16);
    this.mesh(new THREE.CylinderGeometry(0.07, 0.07, bpW, 8).rotateZ(Math.PI / 2), pack, chest, 0, 0.19, -0.16);
    this.mesh(new THREE.BoxGeometry(bpW * 0.7, 0.18, 0.06), pack, chest, 0, -0.1, -0.27);
    for (const sd of [1, -1]) this.mesh(new THREE.BoxGeometry(0.045, 0.34, 0.025), dark, chest, sd * 0.1 * b, 0.0, 0.0 + 0.12, 1, 1, 1);
    if (s.id === 'arin') {
      this.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 8).rotateZ(Math.PI / 2), this.m(0x6a5a3a), chest, 0, -0.34, -0.17); // bedroll
      const cross = this.m(0xdddddd); this.mesh(new THREE.BoxGeometry(0.12, 0.12, 0.012), cross, chest, 0, -0.04, -0.255);
      this.mesh(new THREE.BoxGeometry(0.1, 0.03, 0.014), trim, chest, 0, -0.04, -0.26); this.mesh(new THREE.BoxGeometry(0.03, 0.1, 0.014), trim, chest, 0, -0.04, -0.26);
    } else {
      const ant = this.m(0x888c90, 0.4, 0.7);
      this.mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.6, 5), ant, chest, 0.1, 0.35, -0.2);
      this.mesh(new THREE.TorusGeometry(0.05, 0.012, 5, 10), this.m(0x23282b), chest, -0.08, -0.12, -0.27);
      this.mesh(new THREE.BoxGeometry(0.1, 0.07, 0.04), this.m(0x2d3a2a), chest, 0.0, 0.0, -0.265);
    }
    if (s.scarf) {
      const sc = this.m(s.scarf, 0.95);
      const t = this.mesh(new THREE.TorusGeometry(0.095, 0.036, 6, 12), sc, chest, 0, 0.19, 0.0, 1, 1, 1); t.rotation.x = Math.PI / 2;
      this.mesh(new THREE.BoxGeometry(0.07, 0.2, 0.025), sc, chest, 0.04, 0.06, 0.095);
    }

    for (const side of [1, -1]) {
      const n = side > 0 ? 'l' : 'r';
      const sh = this.grp(chest, side * 0.2 * b, 0.13, 0); this.j[n + 'Sh'] = sh;
      this.mesh(new THREE.SphereGeometry(0.066, 8, 6), jacket, sh);
      this.mesh(cap(0.052, 0.22), jacket, sh, 0, -0.16);
      const el = this.grp(sh, 0, -0.31, 0); this.j[n + 'El'] = el;
      this.mesh(cap(0.044, 0.2), jacket, el, 0, -0.14);
      this.mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.04, 8), trim, el, 0, -0.04);
      const hand = this.grp(el, 0, -0.29, 0); this.j[n + 'Hand'] = hand;
      this.mesh(new THREE.SphereGeometry(0.045, 8, 6), glove, hand, 0, -0.01, 0.0, 0.9, 1.1, 0.9);
      if (n === 'r') this.rHand = hand;
    }

    const neck = this.grp(spine, 0, 0.53, 0); this.j.neck = neck;
    this.mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.12, 8), skin, neck, 0, 0.02);
    const head = this.grp(neck, 0, 0.14, 0); this.j.head = head; this.head = head;
    this.mesh(new THREE.SphereGeometry(1, 20, 16), skin, head, 0, 0, 0, 0.0966, 0.1134, 0.105);
    this.mesh(new THREE.SphereGeometry(0.032, 8, 6), skin, head, 0, -0.092, 0.058, 1.35, 0.85, 1); // chin
    this.mesh(new THREE.SphereGeometry(0.015, 8, 6), skin, head, 0, -0.018, 0.1, 1, 1.3, 1.1); // nose
    this.mesh(new THREE.SphereGeometry(0.009, 6, 5), skin, head, 0, -0.03, 0.109, 1.3, 0.8, 0.9); // nose tip
    for (const sd of [1, -1]) this.mesh(new THREE.SphereGeometry(0.026, 8, 6), skin, head, sd * 0.096, -0.005, -0.004, 0.42, 1, 0.75);
    // cheek / brow-ridge volume

    // eyes
    const white = this.m(0xf1ede6, 0.3), iris = this.m(s.eye, 0.35), pupil = this.m(0x050505, 0.2);
    const hl = new THREE.MeshBasicMaterial({ color: 0xffffff }); this.owned.push(hl);
    const lidGeo = new THREE.SphereGeometry(0.0188, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    const faceZ = s.beard ? 0.0065 : 0;
    for (const sd of [1, -1]) {
      const eg = this.grp(head, sd * 0.041, 0.018, 0.087);
      this.mesh(new THREE.SphereGeometry(0.0165, 10, 8), white, eg);
      this.mesh(new THREE.SphereGeometry(0.0098, 10, 8), iris, eg, 0, 0, 0.0108, 1, 1, 0.35);
      this.mesh(new THREE.SphereGeometry(0.0048, 8, 6), pupil, eg, 0, 0, 0.0136, 1, 1, 0.3);
      this.mesh(new THREE.SphereGeometry(0.0026, 5, 4), hl, eg, 0.004, 0.004, 0.0152);
      const lidPivot = this.grp(eg, 0, 0, 0);
      const lid = this.mesh(lidGeo, skin, lidPivot); lid.castShadow = false;
      this.eyes.push({ grp: eg, lid: lidPivot });
      const brow = this.mesh(new THREE.BoxGeometry(0.05, 0.0095, 0.012), this.m(s.brow, 0.8), head, sd * 0.043, 0.062, 0.083);
      brow.rotation.x = -0.3; brow.userData.side = sd; this.brows.push(brow);
    }

    // mouth
    const lipM = this.m(s.id === 'mira' ? 0x9a4a48 : 0x8a4a42, 0.5);
    const mg = new THREE.TorusGeometry(0.021, 0.0033, 5, 14, Math.PI);
    this.mouthLine = this.mesh(mg, lipM, head, 0, -0.056, 0.087 + faceZ);
    this.mouthIn = this.mesh(new THREE.SphereGeometry(0.017, 10, 6), this.m(0x2a0c0c, 0.6), head, 0, -0.06, 0.085 + faceZ, 1.1, 0.05, 0.3);
    // tears
    const tearM = new THREE.MeshStandardMaterial({ color: 0x9fd3ff, roughness: 0.1, transparent: true, opacity: 0.75 }); this.owned.push(tearM);
    for (const sd of [1, -1]) { const t = this.mesh(new THREE.SphereGeometry(0.0055, 6, 5), tearM, head, sd * 0.045, -0.01, 0.088, 1, 1.5, 1); t.visible = false; t.castShadow = false; this.tears.push(t); }

    // hair
    const r = ((a: number) => () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296))(s.seed);
    const hairCap = this.mesh(new THREE.SphereGeometry(1, 18, 12, 0, Math.PI * 2, 0, 1.78), hairM, head, 0, 0.004, -0.006, 0.1, 0.121, 0.113);
    hairCap.rotation.x = -0.52;
    if (s.hairStyle === 'rugged') {
      for (let i = 0; i < 8; i++) {
        const a = r() * Math.PI * 2, el = 0.5 + r() * 0.8;
        const tuft = this.mesh(new THREE.ConeGeometry(0.014 + r() * 0.01, 0.05 + r() * 0.03, 4), hairM, head, Math.cos(a) * 0.085 * Math.cos(el), 0.06 + Math.sin(el) * 0.06, -0.015 + Math.sin(a) * 0.085 * Math.cos(el));
        tuft.rotation.set((r() - 0.5) * 1.2 - 0.5, 0, (r() - 0.5) * 1.5);
      }
      this.mesh(new THREE.BoxGeometry(0.014, 0.05, 0.05), hairM, head, 0.093, 0.01, -0.01);
      this.mesh(new THREE.BoxGeometry(0.014, 0.05, 0.05), hairM, head, -0.093, 0.01, -0.01);
    } else {
      this.mesh(new THREE.SphereGeometry(1, 12, 10), hairM, head, 0, -0.085, -0.06, 0.108, 0.2, 0.095);
      for (const sd of [1, -1]) {
        this.mesh(new THREE.CapsuleGeometry(0.021, 0.14, 3, 6), hairM, head, sd * 0.093, -0.085, 0.012).rotation.z = sd * 0.06;
        this.mesh(new THREE.BoxGeometry(0.03, 0.05, 0.02), hairM, head, sd * 0.07, 0.07, 0.085).rotation.z = sd * -0.5;
      }
      this.mesh(new THREE.BoxGeometry(0.08, 0.026, 0.02), hairM, head, -0.03, 0.085, 0.088).rotation.z = 0.35;
    }
    if (s.beard) {
      const bm = this.m(0x1d1612, 0.95);
      const beard = this.mesh(new THREE.SphereGeometry(1, 16, 10, Math.PI / 2 - 1.05, 2.1, 2.0, 0.95), bm, head, 0, 0, 0.002, 0.1005, 0.118, 0.1095);
      beard.rotation.x = 0.0;
      this.mesh(new THREE.SphereGeometry(0.034, 8, 6), bm, head, 0, -0.098, 0.062, 1.3, 0.9, 1);
      this.mesh(new THREE.BoxGeometry(0.04, 0.008, 0.01), bm, head, 0, -0.04, 0.104).rotation.x = 0.1; // moustache
    }

    // props (attached to right hand)
    const add = (k: Prop, o: THREE.Object3D) => { o.visible = false; this.rHand.add(o); this.props[k] = o; };
    const mkPlane = (kind: 'photo' | 'drawing' | 'note', w: number, h: number) => {
      const t = photoTexture(kind); this.textures.push(t);
      const pm = new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: 0.9 }); this.owned.push(pm);
      const g = new THREE.Group(); const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pm); pl.position.set(-0.01, -0.05, 0.03); pl.rotation.x = 0.1; g.add(pl); return g;
    };
    add('photo', mkPlane('photo', 0.1, 0.125)); add('drawing', mkPlane('drawing', 0.17, 0.22)); add('note', mkPlane('note', 0.13, 0.17));
    const cam = new THREE.Group();
    this.mesh(new THREE.BoxGeometry(0.1, 0.09, 0.17), this.m(0x25272a, 0.5, 0.3), cam, 0, -0.04, 0.05);
    this.mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.06, 8).rotateX(Math.PI / 2), dark, cam, 0, -0.04, 0.16);
    this.mesh(new THREE.BoxGeometry(0.07, 0.005, 0.07), new THREE.MeshBasicMaterial({ color: 0x6fd0ff }), cam, 0, -0.095, 0.02);
    add('camcorder', cam);
    const radio = new THREE.Group();
    this.mesh(new THREE.BoxGeometry(0.07, 0.17, 0.045), this.m(0x2a2e2f, 0.5, 0.3), radio, 0, -0.09, 0.03);
    this.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 4), this.m(0x999999, 0.3, 0.8), radio, 0.025, -0.24, 0.03);
    this.mesh(new THREE.BoxGeometry(0.04, 0.025, 0.005), new THREE.MeshBasicMaterial({ color: 0x66ff88 }), radio, 0, -0.06, 0.055);
    add('radio', radio);
    const gun = new THREE.Group();
    this.mesh(new THREE.BoxGeometry(0.035, 0.18, 0.05), this.m(0x1a1b1c, 0.4, 0.6), gun, 0, -0.1, 0.0);
    this.mesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), this.m(0x1a1b1c, 0.6, 0.3), gun, 0, -0.01, 0.0).rotation.x = -0.3;
    add('gun', gun);
    const fl = new THREE.Group();
    this.mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.17, 8), this.m(0x222628, 0.4, 0.6), fl, 0, -0.07, 0);
    this.mesh(new THREE.CylinderGeometry(0.036, 0.026, 0.05, 8), this.m(0x888888, 0.3, 0.8), fl, 0, -0.17, 0);
    this.mesh(new THREE.CircleGeometry(0.03, 8).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff4c8 }), fl, 0, -0.196, 0);
    add('flashlight', fl);
    const mic = new THREE.Group();
    this.mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.13, 6), this.m(0x1a1a1a, 0.5, 0.5), mic, 0, -0.06, 0);
    this.mesh(new THREE.SphereGeometry(0.03, 8, 6), this.m(0x333333, 0.8, 0.3), mic, 0, -0.14, 0);
    add('mic', mic);
    const br = new THREE.Group();
    const bt = this.mesh(new THREE.TorusGeometry(0.03, 0.007, 5, 12), this.m(0xc62a2a, 0.5), br, 0, -0.08, 0.02); bt.rotation.y = 1.0;
    add('bracelet', br);
  }

  setProp(p: Prop) {
    (Object.keys(this.props) as Prop[]).forEach((k) => { this.props[k]!.visible = k === p; });
  }

  /** advance animation. returns number of footsteps triggered this frame (0..1) */
  update(u: CharUpdate): number {
    const { dt, time, sample: sp } = u;
    const snap = u.snap || this.first;
    // root transform
    this.root.visible = sp.vis;
    this.root.position.set(sp.x, sp.y, sp.z);
    let target = sp.yaw;
    if (!sp.moving && u.faceYaw !== null) target = u.faceYaw;
    if (snap) this.yaw = target; else this.yaw += angDiff(this.yaw, target) * (1 - Math.exp(-dt * (sp.moving ? 9 : 3.5)));
    this.root.rotation.y = this.yaw;
    this.setProp(sp.prop);

    // gait
    const stride = (sp.anim === 'run' ? 2.9 : 1.75) * this.scaleK;
    const phase = (sp.dist / stride) * Math.PI * 2;
    this.spdSmooth = snap ? sp.speed : this.spdSmooth + (sp.speed - this.spdSmooth) * (1 - Math.exp(-dt * 8));
    let steps = 0;
    if (sp.moving && !snap && (sp.anim === 'walk' || sp.anim === 'run')) {
      if (Math.floor(phase / Math.PI) !== Math.floor(this.lastPhase / Math.PI)) steps = 1;
    }
    this.lastPhase = phase;

    // speech
    const speaking = !!u.speak;
    this.speakLevel += ((speaking ? 1 : 0) - this.speakLevel) * (1 - Math.exp(-dt * 6));
    let openT = 0;
    if (u.speak) {
      const tx = u.speak.text, i = Math.min(tx.length - 1, Math.floor(u.speak.u * tx.length));
      const ch = tx[i].toLowerCase();
      const sc = u.speak.style === 'shout' ? 1.5 : u.speak.style === 'whisper' ? 0.5 : u.speak.style === 'distress' ? 1.2 : 1;
      openT = ('aeiou'.includes(ch) ? 0.75 : 'mbp. ,!?—'.includes(ch) ? 0 : 0.32) * sc;
      openT *= 0.8 + 0.2 * Math.sin(time * 18 + this.spec.seed);
    }
    this.mouthOpen += (openT - this.mouthOpen) * (1 - Math.exp(-dt * 22));

    const tgt = computePose(sp.anim, { t: time, phase, speed: this.spdSmooth, moving: sp.moving, speak: this.speakLevel, prop: sp.prop, seed: this.spec.seed });
    const gait = sp.moving && (sp.anim === 'walk' || sp.anim === 'run');
    const k = snap ? 1 : 1 - Math.exp(-dt * (gait ? 14 : 6));
    for (const key of KEYS) this.pose[key] += (tgt[key] - this.pose[key]) * k;
    const P = this.pose, J = this.j;
    this.body.rotation.x = P.bodyPitch; this.body.position.y = P.bodyY;
    J.pelvis.position.y = P.pelvisY; J.pelvis.rotation.y = P.pelvisYaw;
    J.spine.rotation.set(P.spineX, P.spineY, P.spineZ); J.chest.rotation.x = P.chestX;
    J.lSh.rotation.set(P.lShX, 0, P.lShZ); J.rSh.rotation.set(P.rShX, 0, -P.rShZ);
    J.lEl.rotation.set(P.lElX, 0, 0); J.rEl.rotation.set(P.rElX, 0, 0);
    J.lHip.rotation.set(P.lHipX, 0, P.lHipZ); J.rHip.rotation.set(P.rHipX, 0, -P.rHipZ);
    J.lKn.rotation.x = P.lKnX; J.rKn.rotation.x = P.rKnX; J.lAnk.rotation.x = P.lAnkX; J.rAnk.rotation.x = P.rAnkX;

    // head look
    const look = u.lookWorld;
    let hy = 0, hx = 0;
    this.root.updateMatrixWorld(true);
    if (look) {
      const l = this.root.worldToLocal(this.tmpV.copy(look));
      const eyeY = (J.head.getWorldPosition(this.tmpV2).y - this.root.position.y) / this.scaleK;
      const flat = Math.hypot(l.x, l.z);
      hy = clamp(Math.atan2(l.x, l.z) * 0.7, -1, 1);
      hx = -clamp(Math.atan2(l.y - eyeY, Math.max(0.3, flat)) * 0.5, -0.4, 0.4);
      if (sp.anim === 'sleep' || sp.anim === 'prone' || sp.anim === 'hang' || sp.anim === 'cry') { hy *= 0.3; hx = 0; }
    }
    this.hlook = this.hlook ?? { y: 0, x: 0 };
    this.hlook.y += (hy - this.hlook.y) * (snap ? 1 : 1 - Math.exp(-dt * 4)); this.hlook.x += (hx - this.hlook.x) * (snap ? 1 : 1 - Math.exp(-dt * 4));
    J.neck.rotation.set(P.headX * 0.4, P.headY * 0.4 + this.hlook.y * 0.4, P.headZ * 0.5);
    J.head.rotation.set(P.headX * 0.6 + this.hlook.x, P.headY * 0.6 + this.hlook.y * 0.6, P.headZ * 0.5);

    // face
    const em = EMOTES[sp.emote] ?? EMOTES.neutral, F = this.face, fk = snap ? 1 : 1 - Math.exp(-dt * 6);
    (Object.keys(F) as (keyof Face)[]).forEach((key) => { F[key] += (em[key] - F[key]) * fk; });
    const bp = (time + this.spec.seed * 1.7) % (3.2 + (this.spec.seed % 3) * 0.5);
    const blink = bp < 0.15 ? Math.sin((bp / 0.15) * Math.PI) : 0;
    const closure = Math.max(F.lid, blink);
    const lidAng = closure < 0 ? -1.25 + closure * 0.3 : -1.25 + clamp(closure, 0, 1) * 2.65;
    J.head.updateMatrixWorld(true);
    for (const e of this.eyes) {
      e.lid.rotation.x = lidAng;
      if (look) {
        const l = e.grp.parent!.worldToLocal(this.tmpV.copy(look)).sub(e.grp.position);
        e.grp.rotation.set(-clamp(Math.atan2(l.y, Math.hypot(l.x, l.z)), -0.3, 0.3), clamp(Math.atan2(l.x, l.z), -0.5, 0.5) * (l.length() < 0.5 ? 0 : 1), 0);
      } else e.grp.rotation.set(0, 0, 0);
    }
    for (const br of this.brows) {
      const sd = br.userData.side as number;
      br.position.y = 0.062 + F.bh * 0.013 + this.speakLevel * 0.002 * Math.sin(time * 3);
      br.rotation.z = -sd * F.ba * 0.36;
    }
    const open = Math.max(F.open, this.mouthOpen);
    const sy = -F.smile * 0.62;
    this.mouthLine.scale.set(1 + F.smile * 0.16 - open * 0.25, Math.abs(sy) < 0.05 ? 0.05 : sy, 1);
    this.mouthLine.position.y = -0.056 + (sy < 0 ? -sy * 0.021 * 0.9 : -sy * 0.021 * 0.9) * 0.5 - 0.002;
    this.mouthIn.visible = open > 0.05;
    this.mouthIn.scale.set(1.1 - open * 0.25, 0.05 + open * 1.1, 0.3);
    this.mouthIn.position.y = -0.06 - open * 0.006;
    const showTears = F.tears > 0.5;
    this.tears.forEach((t, i) => {
      t.visible = showTears;
      if (showTears) { const ph = (time * 0.25 + i * 0.5) % 1; t.position.y = 0.0 - ph * 0.07; t.position.z = 0.092 - ph * 0.01; (t.material as THREE.MeshStandardMaterial).opacity = 0.8 * (1 - ph * ph); }
    });

    // smoothed head position for camera targeting
    J.head.getWorldPosition(this.tmpV);
    if (snap) this.headSmooth.copy(this.tmpV); else this.headSmooth.lerp(this.tmpV, 1 - Math.exp(-dt * 6));
    this.first = false;
    return steps;
  }
  private hlook?: { y: number; x: number };

  headWorld(out: THREE.Vector3) { return this.head.getWorldPosition(out); }
  /** world position + direction of the right hand's pointing axis (for flashlight) */
  handBeam(pos: THREE.Vector3, dir: THREE.Vector3) {
    this.rHand.getWorldPosition(pos);
    const q = this.rHand.getWorldQuaternion(new THREE.Quaternion());
    dir.set(0, -1, 0).applyQuaternion(q).normalize();
  }

  dispose() {
    this.root.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
    this.owned.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
  }
}
