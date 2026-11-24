import * as THREE from "three";
import { EKEYS, EXPR, NEUTRAL, POSES, HIP_STAND, type Expr, type Pose } from "./anim";
import type { CharSpec } from "./characters";
import type { PropName, Vec3 } from "../film/types";
import { makeProp, disposeObject, type PropRig } from "./props";
import { T } from "./textures";

export interface ActorState {
  pos: Vec3;
  yaw: number;
  pose: string;
  expr: string;
  look: THREE.Vector3 | null;
  r?: PropName;
  l?: PropName;
  wear: string[];
  speak: { env: number; open: number; pucker: number; wide: number };
  phase: number;
  speed: number;
  snap: boolean;
}

const D2R = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const damp = (cur: number, tgt: number, k: number, dt: number) => cur + (tgt - cur) * (1 - Math.exp(-k * dt));

// ---------- skull ----------
const RX = 0.084;
const RY = 0.108;
const RZ = 0.096;

function skullFns(jaw: number) {
  const tx = (Y: number) => (Y < 0 ? 1 - (0.24 + 0.08 * jaw) * Math.pow(-Y, 1.5) : 1 - 0.07 * Y * Y);
  const tz = (Y: number) => (Y < 0 ? 1 - 0.17 * Math.pow(-Y, 1.6) : 1);
  const shift = (Y: number) => (Y < 0 ? 0.012 * Math.pow(-Y, 1.5) : 0);
  const surf = (x: number, y: number) => {
    const Y = y / RY;
    const X = x / (RX * tx(Y));
    const Z = Math.sqrt(Math.max(0.0001, 1 - X * X - Y * Y));
    return RZ * tz(Y) * Z + shift(Y);
  };
  return { tx, tz, shift, surf };
}

function skullGeo(jaw: number, grow = 1) {
  const f = skullFns(jaw);
  const g = new THREE.SphereGeometry(1, 44, 34);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const X = pos.getX(i);
    const Y = pos.getY(i);
    const Z = pos.getZ(i);
    pos.setXYZ(i, X * RX * f.tx(Y) * grow, Y * RY * grow, (Z * RZ * f.tz(Y) * (Z < 0 ? 1.06 : 1) + f.shift(Y)) * grow);
  }
  g.computeVertexNormals();
  return g;
}

function beardGeo(jaw: number, amount: number) {
  const g = skullGeo(jaw, 1.028 + amount * 0.02);
  const pos = g.attributes.position;
  const idx = g.index!;
  const keep: number[] = [];
  for (let t = 0; t < idx.count; t += 3) {
    const a = idx.getX(t), b = idx.getX(t + 1), c = idx.getX(t + 2);
    const cx = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3;
    const cy = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
    const cz = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3;
    if (cy > -0.03 - amount * 0.004 || cy < -0.12) continue;
    if (cz < -0.012) continue;
    if (Math.abs(cx) > 0.058 && cy > -0.052) continue;
    if (Math.abs(cx) < 0.031 && cy > -0.071 && cy < -0.041 && cz > 0.03) continue;
    keep.push(a, b, c);
  }
  g.setIndex(keep);
  return g;
}

const softTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();

const NC = 23;
function makeMouthGeo() {
  const rows = 5;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(rows * NC * 3), 3));
  const nr = new Float32Array(rows * NC * 3);
  for (let r = 0; r < rows; r++)
    for (let j = 0; j < NC; j++) {
      const u = -1 + (2 * j) / (NC - 1);
      const n = new THREE.Vector3(u * 0.35, 0, 1).normalize();
      nr.set([n.x, n.y, n.z], (r * NC + j) * 3);
    }
  g.setAttribute("normal", new THREE.BufferAttribute(nr, 3));
  const ind: number[] = [];
  for (let b = 0; b < 4; b++) {
    const start = ind.length;
    for (let j = 0; j < NC - 1; j++) {
      const a = b * NC + j, c = (b + 1) * NC + j;
      ind.push(a, c, a + 1, a + 1, c, c + 1);
    }
    g.addGroup(start, ind.length - start, b);
  }
  g.setIndex(ind);
  return g;
}

interface MouthP {
  smile: number;
  open: number;
  width: number;
  pucker: number;
  smirk: number;
  jit: number;
}

function updateMouth(g: THREE.BufferGeometry, z0: number, p: MouthP, female: boolean) {
  const pos = g.attributes.position as THREE.BufferAttribute;
  const W = 0.0215 * (1 + 0.13 * p.smile + 0.35 * p.width - 0.32 * p.pucker);
  const op = p.open * 0.027 + p.pucker * 0.004;
  const lipU = female ? 0.0046 : 0.0038;
  const lipL = female ? 0.0062 : 0.0052;
  for (let j = 0; j < NC; j++) {
    const u = -1 + (2 * j) / (NC - 1);
    const a = Math.abs(u);
    const x = u * W;
    const yc = p.smile * 0.0078 * Math.pow(a, 2.2) + p.smirk * 0.0055 * u;
    const bell = Math.pow(Math.max(0, 1 - u * u), 0.7);
    const cupid = a < 0.35 ? 0.0006 * (1 - a / 0.35) : 0;
    const jit = p.jit * Math.sin(j * 1.7 + performance.now() * 0.045) * 0.0007;
    const UI = yc + 0.0012 * bell;
    const LI = yc - op * bell - 0.0008 * bell + jit;
    const UO = UI + (lipU + 0.0008 * p.pucker + cupid) * Math.pow(bell, 0.8);
    const LO = LI - (lipL + 0.0008 * p.pucker) * Math.pow(Math.max(0, 1 - u * u * u * u), 0.6);
    const TE = UI - Math.min(op * 0.8, 0.0075) * bell;
    const zb = z0 - 10 * x * x + p.pucker * 0.004;
    const ys = [UO, UI, TE, LI, LO];
    const zs = [zb + 0.0018 * bell, zb + 0.0008, zb - 0.002, zb - 0.0035, zb + 0.0012 * bell];
    for (let r = 0; r < 5; r++) pos.setXYZ(r * NC + j, x, ys[r], zs[r]);
  }
  pos.needsUpdate = true;
}

const mat = (color: string, rough = 0.6, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });

function mesh(g: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number] = [0, 0, 0], parent?: THREE.Object3D, shadow = true) {
  const o = new THREE.Mesh(g, m);
  o.position.set(...p);
  o.castShadow = shadow;
  if (parent) parent.add(o);
  return o;
}
const ell = (rx: number, ry: number, rz: number, ws = 16, hs = 12) => {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(rx, ry, rz);
  return g;
};
const limb = (r0: number, r1: number, len: number, seg = 12) => {
  const g = new THREE.CylinderGeometry(r0, r1, len, seg, 1);
  g.translate(0, -len / 2, 0);
  return g;
};
function rngf(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// pose vector layout
const NP = 22;
function poseVec(p: Pose, out: Float32Array) {
  out[0] = p.hipY ?? HIP_STAND;
  out[1] = p.lean ?? 0;
  out[2] = p.tw ?? 0;
  out[3] = p.hx ?? 0;
  out[4] = p.hy ?? 0;
  out[5] = p.hz ?? 0;
  const al = p.al ?? [0.04, 0.1, 0.18];
  const ar = p.ar ?? [0.04, 0.1, 0.18];
  for (let i = 0; i < 5; i++) {
    out[6 + i] = al[i] ?? 0;
    out[11 + i] = ar[i] ?? 0;
  }
  out[16] = p.ll?.[0] ?? 0;
  out[17] = p.ll?.[1] ?? 0;
  out[18] = p.lr?.[0] ?? 0;
  out[19] = p.lr?.[1] ?? 0;
  out[20] = p.cl ?? 0.35;
  out[21] = p.cr ?? 0.35;
}

export interface HumanRig {
  root: THREE.Group;
  update: (s: ActorState, dt: number, t: number) => void;
  dispose: () => void;
  spec: CharSpec;
}

export function createHuman(spec: CharSpec): HumanRig {
  const root = new THREE.Group();
  root.scale.setScalar(spec.scale);
  const F = spec.female;
  const O = spec.outfit;
  const fns = skullFns(spec.jaw);

  // ----- materials -----
  const skinCol = new THREE.Color(spec.skin).lerp(new THREE.Color("#d8b8a4"), spec.pallor * 0.55);
  const skin = new THREE.MeshStandardMaterial({ color: skinCol, roughness: 0.55, emissive: skinCol.clone().multiplyScalar(0.1) });
  const hairCol = new THREE.Color(spec.hair).lerp(new THREE.Color("#8b8a8c"), spec.grey * 0.5);
  const hairM = new THREE.MeshStandardMaterial({ color: hairCol, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide });
  const greyM = new THREE.MeshStandardMaterial({ color: "#a9a8aa", roughness: 0.5 });
  const cloth = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, map: T.cloth(), side: THREE.DoubleSide });
  const sleeveCol = O.jacket ?? O.top;
  const topM = cloth(O.top);
  const sleeveM = cloth(sleeveCol);
  const botM = cloth(O.bottom);
  const shoeM = mat(O.shoe, 0.55);

  const hips = new THREE.Group();
  root.add(hips);
  const spine = new THREE.Group();
  hips.add(spine);

  // ----- torso -----
  const prof = F
    ? [[0, -0.09], [0.12, -0.08], [0.15, 0.0], [0.135, 0.16], [0.12, 0.25], [0.14, 0.36], [0.153, 0.45], [0.158, 0.5], [0.13, 0.56], [0.07, 0.585], [0, 0.59]]
    : [[0, -0.09], [0.12, -0.08], [0.155, 0.0], [0.157, 0.14], [0.152, 0.28], [0.167, 0.42], [0.18, 0.5], [0.14, 0.56], [0.07, 0.585], [0, 0.59]];
  const pts = new THREE.SplineCurve(prof.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(40).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  const torsoG = new THREE.LatheGeometry(pts, 32);
  torsoG.scale(1, 1, F ? 0.6 : 0.64);
  mesh(torsoG, topM, [0, 0, 0], spine);
  if (O.jacket && !O.dress) {
    const jg = new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p.x * 1.08, p.y - 0.01 + (p.y < 0.1 ? -0.04 : 0))), 32, 0.32, Math.PI * 2 - 0.64);
    jg.scale(1, 1, F ? 0.64 : 0.68);
    mesh(jg, sleeveM, [0, 0, 0], spine);
    // lapels
    for (const s of [-1, 1]) {
      const lap = mesh(new THREE.BoxGeometry(0.035, 0.2, 0.012), sleeveM, [s * 0.05, 0.47, 0.125], spine);
      lap.rotation.z = s * 0.28;
    }
  }
  if (O.dress) {
    const sk = new THREE.LatheGeometry(
      new THREE.SplineCurve([[0.13, 0.2], [0.15, 0.08], [0.19, -0.1], [0.235, -0.36], [0.24, -0.4]].map(([r, y]) => new THREE.Vector2(r, y))).getPoints(14),
      32
    );
    sk.scale(1, 1, 0.8);
    const skm = mesh(sk, cloth(O.dress), [0, 0, 0], spine);
    skm.name = "skirt";
  }
  // pelvis
  mesh(ell(F ? 0.155 : 0.16, 0.11, 0.11), O.dress ? topM : botM, [0, -0.03, 0], spine);
  // neck
  const neckMesh = mesh(new THREE.CylinderGeometry(0.036, 0.042, 0.13, 14), skin, [0, 0.58, 0.004], spine);
  neckMesh.castShadow = false;
  const collar = mesh(new THREE.TorusGeometry(0.047, 0.012, 8, 20), O.jacket && !O.dress ? topM : topM, [0, 0.572, 0.004], spine);
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1, 1.0, 1.0);

  // ----- head -----
  const neck = new THREE.Group();
  neck.position.set(0, 0.585, 0.005);
  spine.add(neck);
  const head = new THREE.Group();
  head.position.set(0, 0.105, 0);
  neck.add(head);
  mesh(skullGeo(spec.jaw), skin, [0, 0, 0], head);

  // ears
  for (const s of [-1, 1]) mesh(ell(0.008, 0.022, 0.014, 10, 8), skin, [s * RX * 0.985, -0.01, -0.006], head);

  // nose
  const noseS = F ? 0.92 : 1.05;
  mesh(ell(0.0085 * noseS, 0.028 * noseS, 0.011 * noseS, 12, 10), skin, [0, 0.008, fns.surf(0, 0.008) + 0.001], head).rotation.x = 0.25;
  mesh(ell(0.0098 * noseS, 0.0085 * noseS, 0.0098 * noseS, 12, 10), skin, [0, -0.019, fns.surf(0, -0.019) + 0.0075], head);
  for (const s of [-1, 1]) mesh(ell(0.0055, 0.0062, 0.006, 10, 8), skin, [s * 0.0105, -0.022, fns.surf(s * 0.0105, -0.022) + 0.0028], head);

  // eyes
  const eyeX = 0.0345;
  const eyeY = 0.014;
  const eyeR = 0.0168;
  const eyes: { socket: THREE.Group; ball: THREE.Group; up: THREE.Group; low: THREE.Group; wet: THREE.Mesh }[] = [];
  const scleraM = mat("#f0eae4", 0.25);
  const irisCol = new THREE.Color(spec.iris);
  const limbalM = mat("#1f130c", 0.3);
  const irisM = new THREE.MeshStandardMaterial({ color: irisCol, roughness: 0.25, emissive: irisCol.clone().multiplyScalar(0.35) });
  const pupilM = mat("#050404", 0.2);
  const lashM = mat("#120c0a", 0.7);
  const wetM = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.02, transparent: true, opacity: 0.1, depthWrite: false });
  const capG = (ang: number, r: number) => {
    const g = new THREE.SphereGeometry(r, 22, 10, 0, Math.PI * 2, 0, ang);
    g.rotateX(Math.PI / 2);
    return g;
  };
  const lidR = eyeR * 1.1;
  const upG = new THREE.SphereGeometry(lidR, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const loG = new THREE.SphereGeometry(lidR, 22, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const lashG = new THREE.TorusGeometry(lidR * 0.995, F ? 0.0011 : 0.0008, 5, 20, Math.PI);
  lashG.rotateX(Math.PI / 2);
  const wetOwn = wetM.clone();
  for (const s of [1, -1]) {
    const socket = new THREE.Group();
    socket.position.set(s * eyeX, eyeY, fns.surf(s * eyeX, eyeY) - 0.0145);
    head.add(socket);
    const ball = new THREE.Group();
    socket.add(ball);
    mesh(new THREE.SphereGeometry(eyeR, 22, 16), scleraM, [0, 0, 0], ball, false);
    mesh(capG(0.6, eyeR * 1.002), limbalM, [0, 0, 0], ball, false);
    mesh(capG(0.52, eyeR * 1.003), irisM, [0, 0, 0], ball, false);
    mesh(capG(0.24, eyeR * 1.005), pupilM, [0, 0, 0], ball, false);
    const wet = mesh(new THREE.SphereGeometry(eyeR * 1.045, 20, 14), wetOwn, [0, 0, 0], socket, false);
    const hl = mesh(new THREE.SphereGeometry(0.0024, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffffff" }), [0.0045, 0.0045, eyeR * 1.02], socket, false);
    hl.renderOrder = 3;
    const up = new THREE.Group();
    socket.add(up);
    mesh(upG, skin, [0, 0, 0], up, false);
    mesh(lashG, lashM, [0, 0, 0], up, false);
    const low = new THREE.Group();
    socket.add(low);
    mesh(loG, skin, [0, 0, 0], low, false);
    eyes.push({ socket, ball, up, low, wet });
  }

  // brows
  const browG = (() => {
    const pts3 = [];
    for (let i = 0; i <= 8; i++) {
      const x = -0.023 + (i / 8) * 0.046;
      pts3.push(new THREE.Vector3(x, 0.0055 * (1 - Math.pow(x / 0.023, 2)) - Math.abs(x) * 0.02 * (x > 0 ? 0.15 : 0), 0));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts3), 12, 0.0036 * (0.7 + spec.brow * 0.5), 6, false);
  })();
  const browM = mat(F ? "#1f130e" : "#1b110d", 0.7);
  const brows: THREE.Group[] = [];
  const BY = 0.053;
  for (const s of [1, -1]) {
    const g = new THREE.Group();
    g.position.set(s * 0.034, BY, fns.surf(s * 0.034, BY) + 0.0008);
    mesh(browG, browM, [0, 0, 0], g, false);
    head.add(g);
    brows.push(g);
  }

  // under-eye bags + blush
  const bagM = new THREE.MeshBasicMaterial({ color: "#5a3a3a", transparent: true, opacity: 0, depthWrite: false });
  const blushM = new THREE.MeshBasicMaterial({ color: "#d4585a", map: softTex(), transparent: true, opacity: 0, depthWrite: false });
  for (const s of [1, -1]) {
    const bag = mesh(ell(0.017, 0.006, 0.001, 10, 6), bagM, [s * eyeX, -0.012, fns.surf(s * eyeX, -0.012) + 0.0003], head, false);
    bag.rotation.y = s * 0.4;
    const bl = mesh(new THREE.CircleGeometry(0.022, 16), blushM, [s * 0.047, -0.03, fns.surf(s * 0.047, -0.03) + 0.0012], head, false);
    bl.rotation.y = s * 0.6;
  }

  // mouth
  const mouthG = makeMouthGeo();
  const lipM = mat(spec.lip, 0.4);
  const mouth = new THREE.Mesh(mouthG, [lipM, mat("#f2ede3", 0.35), mat("#3b1414", 0.9), lipM]);
  const mouthY = -0.056;
  mouth.position.set(0, mouthY, 0);
  head.add(mouth);
  const mouthZ = fns.surf(0, mouthY) + 0.0006;

  // tear drops
  const dropM = new THREE.MeshPhysicalMaterial({ color: "#e8f4ff", roughness: 0.02, transmission: 0.0, transparent: true, opacity: 0.8, clearcoat: 1 });
  const drops: { m: THREE.Mesh; s: number; off: number }[] = [];
  for (const s of [1, -1])
    for (let k = 0; k < 2; k++) {
      const m = mesh(new THREE.SphereGeometry(0.0034, 8, 6), dropM, [0, 0, 0], head, false);
      m.visible = false;
      drops.push({ m, s, off: k * 0.5 + (s > 0 ? 0 : 0.23) });
    }

  // ----- hair -----
  const hairGrp = new THREE.Group();
  head.add(hairGrp);
  const R2 = rngf(spec.id === "ryan" ? 7 : 19);
  const capGeo = (grow: number, theta: number) => {
    const g = new THREE.SphereGeometry(1, 36, 24, 0, Math.PI * 2, 0, theta);
    g.scale(RX * grow, RY * grow * 0.99, RZ * grow * 1.04);
    return g;
  };
  if (spec.hairStyle === "ryan") {
    const cap = mesh(capGeo(1.075, 77 * D2R), hairM, [0, 0.004, -0.004], hairGrp);
    cap.rotation.x = -0.54;
    // wavy tufts
    for (let i = 0; i < 12; i++) {
      const a = R2() * Math.PI * 2;
      const el = 0.25 + R2() * 0.9;
      const x = Math.sin(a) * Math.cos(el) * RX * 1.08;
      const z = Math.cos(a) * Math.cos(el) * RZ * 1.0 - 0.01;
      const y = Math.sin(el) * RY * 1.04;
      if (z > 0.06 && y < 0.07) continue;
      const t = mesh(ell(0.03, 0.018, 0.036, 12, 8), hairM, [x * 0.9, y, z * 0.9], hairGrp);
      t.rotation.set((R2() - 0.5) * 0.9, (R2() - 0.5) * 2, (R2() - 0.5) * 0.9);
    }
    // swept fringe
    for (let i = 0; i < 5; i++) {
      const x = -0.05 + i * 0.026;
      const f = mesh(ell(0.026, 0.012, 0.03, 12, 8), hairM, [x, 0.088 - Math.abs(x) * 0.16, 0.074 - Math.abs(x) * 0.25], hairGrp);
      f.rotation.set(0.5, 0, -0.5 + i * 0.05);
    }
    // sideburns
    for (const s of [-1, 1]) mesh(ell(0.009, 0.03, 0.02, 8, 8), hairM, [s * (RX * 1.0), 0.02, 0.0], hairGrp);
    // back/nape
    mesh(ell(0.08, 0.05, 0.05, 14, 10), hairM, [0, -0.04, -0.07], hairGrp);
    if (spec.grey > 0.1)
      for (const s of [-1, 1]) {
        mesh(ell(0.012, 0.03, 0.026, 8, 8), greyM, [s * (RX * 1.04), 0.04, 0.012], hairGrp);
        mesh(ell(0.016, 0.01, 0.03, 8, 8), greyM, [s * 0.04, 0.095, 0.05], hairGrp);
      }
    if (spec.beard > 0.05) {
      const bm = new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.hair).lerp(new THREE.Color("#8b8a8c"), spec.grey * 0.45), roughness: 0.95 });
      const bd = mesh(beardGeo(spec.jaw, spec.beard), bm, [0, 0, 0], head, false);
      bd.scale.setScalar(1);
      // mustache
      for (const s of [-1, 1]) {
        const m = mesh(ell(0.0125, 0.0042, 0.006, 8, 6), bm, [s * 0.0125, -0.0415, fns.surf(s * 0.0125, -0.0415) + 0.0035], head, false);
        m.rotation.z = s * 0.25;
      }
      if (spec.beard > 0.8) {
        const ch = mesh(ell(0.026, 0.02, 0.016, 10, 8), bm, [0, -0.1, fns.surf(0, -0.1) - 0.003], head, false);
        ch.rotation.x = 0.4;
      }
    }
  } else if (spec.hairStyle === "anya") {
    const cap = mesh(capGeo(1.1, 80 * D2R), hairM, [0, 0.004, -0.006], hairGrp);
    cap.rotation.x = -0.5;
    // back hair mass to shoulders
    const back = mesh(ell(0.098, 0.165, 0.085, 22, 16), hairM, [0, -0.095, -0.042], hairGrp);
    back.rotation.x = 0.06;
    mesh(ell(0.08, 0.06, 0.06, 14, 10), hairM, [0, -0.2, -0.04], hairGrp);
    // side curtains that frame the face
    for (const s of [-1, 1]) {
      const side = mesh(ell(0.024, 0.115, 0.06, 12, 12), hairM, [s * (RX * 1.04), -0.045, 0.002], hairGrp);
      side.rotation.z = s * 0.05;
      const bang = mesh(ell(0.032, 0.012, 0.034, 12, 8), hairM, [s * 0.04, 0.085, 0.066], hairGrp);
      bang.rotation.set(0.55, -s * 0.2, -s * 0.6);
      const lock = mesh(ell(0.014, 0.05, 0.02, 10, 10), hairM, [s * 0.075, 0.03, 0.045], hairGrp);
      lock.rotation.set(0.1, 0, s * 0.18);
      mesh(ell(0.026, 0.07, 0.04, 10, 10), hairM, [s * 0.088, -0.17, 0.0], hairGrp);
    }
  } else {
    const cap = mesh(capGeo(1.08, 78 * D2R), hairM, [0, 0.004, -0.004], hairGrp);
    cap.rotation.x = -0.5;
    mesh(new THREE.SphereGeometry(0.045, 14, 12), hairM, [0, 0.055, -0.1], hairGrp);
    for (const s of [-1, 1]) mesh(ell(0.012, 0.03, 0.022, 8, 8), spec.grey > 0.1 ? greyM : hairM, [s * RX * 1.02, 0.045, 0.0], hairGrp);
  }

  // accessories
  const wearMap: Record<string, THREE.Object3D> = {};
  {
    const hp = new THREE.Group();
    const arch = new THREE.TorusGeometry(0.103, 0.0065, 8, 32, Math.PI);
    mesh(arch, mat("#222", 0.4, { metalness: 0.3 }), [0, 0.0, 0], hp);
    for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.026, 18).rotateZ(Math.PI / 2), mat("#16161a", 0.35), [s * 0.1, 0.0, 0.0], hp);
    hp.visible = false;
    head.add(hp);
    wearMap.headphones = hp;
    const bag = new THREE.Group();
    mesh(new THREE.BoxGeometry(0.3, 0.2, 0.1), mat("#3d3a36", 0.8), [-0.22, -0.02, -0.04], bag);
    mesh(new THREE.BoxGeometry(0.3, 0.04, 0.105), mat("#2a2825", 0.8), [-0.22, 0.07, -0.04], bag);
    const strap = mesh(new THREE.BoxGeometry(0.035, 0.7, 0.012), mat("#2a2825", 0.8), [-0.02, 0.28, 0.0], bag);
    strap.rotation.z = -0.55;
    bag.visible = false;
    spine.add(bag);
    wearMap.bag = bag;
  }

  // ----- arms -----
  const sw = F ? 0.168 : 0.19;
  const armS = F ? 0.9 : 1;
  const skinMat = skin;
  interface Hand { finger: THREE.Group[][]; thumb: THREE.Group[]; }
  const arms: { sh: THREE.Group; el: THREE.Group; wr: THREE.Group; hand: Hand; side: number }[] = [];
  const sleeveLenUp = O.sleeves === "short" ? 0.14 : 0.29;
  for (const s of [1, -1]) {
    const sh = new THREE.Group();
    sh.position.set(s * sw, 0.5, 0);
    spine.add(sh);
    mesh(new THREE.SphereGeometry(0.055 * armS, 14, 10), O.sleeves === "short" && !O.jacket ? topM : sleeveM, [0, 0, 0], sh);
    mesh(limb(0.043 * armS, 0.037 * armS, 0.29), skinMat, [0, 0, 0], sh);
    const slv = mesh(limb(0.049 * armS, 0.042 * armS, sleeveLenUp), O.jacket ? sleeveM : topM, [0, 0, 0], sh);
    slv.scale.set(1, 1, 1);
    const el = new THREE.Group();
    el.position.y = -0.29;
    sh.add(el);
    mesh(new THREE.SphereGeometry(0.038 * armS, 12, 8), O.sleeves === "short" ? skinMat : sleeveM, [0, 0, 0], el);
    mesh(limb(0.037 * armS, 0.03 * armS, 0.26), skinMat, [0, 0, 0], el);
    if (O.sleeves === "long") mesh(limb(0.042 * armS, 0.035 * armS, 0.235), O.jacket ? sleeveM : topM, [0, 0, 0], el);
    if (O.sleeves === "rolled") mesh(limb(0.042 * armS, 0.038 * armS, 0.06), topM, [0, 0, 0], el);
    const wr = new THREE.Group();
    wr.position.y = -0.26;
    el.add(wr);
    mesh(new THREE.SphereGeometry(0.03 * armS, 10, 8), skinMat, [0, 0, 0], wr);
    // hand
    const palm = mesh(ell(0.014 * armS, 0.043 * armS, 0.036 * armS, 12, 10), skinMat, [0, -0.04, 0], wr);
    palm.castShadow = false;
    const hand: Hand = { finger: [], thumb: [] };
    const lens = [0.037, 0.04, 0.037, 0.03];
    const zs = [0.026, 0.009, -0.008, -0.024];
    for (let f = 0; f < 4; f++) {
      const j1 = new THREE.Group();
      j1.position.set(0, -0.082, zs[f] * armS);
      wr.add(j1);
      mesh(limb(0.0078 * armS, 0.0072 * armS, lens[f] * armS, 8), skinMat, [0, 0, 0], j1, false);
      const j2 = new THREE.Group();
      j2.position.y = -lens[f] * armS;
      j1.add(j2);
      mesh(new THREE.SphereGeometry(0.0072 * armS, 6, 5), skinMat, [0, 0, 0], j2, false);
      mesh(limb(0.0072 * armS, 0.0062 * armS, lens[f] * 0.78 * armS, 8), skinMat, [0, 0, 0], j2, false);
      hand.finger.push([j1, j2]);
    }
    const t1 = new THREE.Group();
    t1.position.set(-s * 0.012 * armS, -0.02, 0.03 * armS);
    t1.rotation.set(-0.55, 0, s * 0.15);
    wr.add(t1);
    mesh(limb(0.0095 * armS, 0.0085 * armS, 0.032 * armS, 8), skinMat, [0, 0, 0], t1, false);
    const t2 = new THREE.Group();
    t2.position.y = -0.032 * armS;
    t1.add(t2);
    mesh(limb(0.0085 * armS, 0.007 * armS, 0.027 * armS, 8), skinMat, [0, 0, 0], t2, false);
    hand.thumb = [t1, t2];
    arms.push({ sh, el, wr, hand, side: s });
  }

  // ----- legs -----
  const legs: { hp: THREE.Group; kn: THREE.Group }[] = [];
  const lw = F ? 0.088 : 0.093;
  const ls = F ? 0.9 : 1;
  for (const s of [1, -1]) {
    const hp = new THREE.Group();
    hp.position.set(s * lw, -0.03, 0);
    hips.add(hp);
    mesh(new THREE.SphereGeometry(0.077 * ls, 12, 10), O.dress ? skinMat : botM, [0, 0, 0], hp);
    mesh(limb(0.077 * ls, 0.058 * ls, 0.43), O.dress ? skinMat : botM, [0, 0, 0], hp);
    const kn = new THREE.Group();
    kn.position.y = -0.43;
    hp.add(kn);
    mesh(new THREE.SphereGeometry(0.058 * ls, 12, 8), O.dress ? skinMat : botM, [0, 0, 0], kn);
    mesh(limb(0.057 * ls, 0.04 * ls, 0.43), O.dress ? skinMat : botM, [0, 0, 0], kn);
    const an = new THREE.Group();
    an.position.y = -0.43;
    kn.add(an);
    const foot = mesh(ell(0.045, 0.036, 0.115, 14, 10), shoeM, [0, -0.034, 0.04], an);
    foot.scale.set(1, 1, 1);
    mesh(ell(0.04, 0.022, 0.09, 10, 8), mat("#f2f2f2", 0.8), [0, -0.058, 0.045], an, false);
    legs.push({ hp, kn });
  }

  // ----- hold props -----
  const propHolders: { name: PropName | null; rig: PropRig | null }[] = [{ name: null, rig: null }, { name: null, rig: null }];
  const tmpV = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion();
  const tmpQ2 = new THREE.Quaternion();
  const tmpM = new THREE.Matrix4();

  // ----- animation state -----
  const cur = new Float32Array(NP);
  const tgt = new Float32Array(NP);
  poseVec(POSES.stand, cur);
  const ex: Expr = { ...NEUTRAL };
  const seed = spec.id === "ryan" ? 1.3 : spec.id === "anya" ? 4.1 : 7.7;
  let blinkT = 1.5 + seed;
  let blinkP = -1;
  let hYaw = 0, hPit = 0, eYaw = 0, ePit = 0;
  let sacT = 0;
  let sacX = 0, sacY = 0, sacTX = 0, sacTY = 0;
  let speakEnv = 0;
  let breath = 0;
  let first = true;
  let lastPose = "";

  const mp: MouthP = { smile: 0, open: 0, width: 0, pucker: 0, smirk: 0, jit: 0 };

  function setProp(i: number, name: PropName | undefined) {
    const h = propHolders[i];
    const n = name ?? null;
    if (h.name === n) return;
    if (h.rig) {
      root.remove(h.rig.obj);
      disposeObject(h.rig.obj);
    }
    h.name = n;
    h.rig = n ? makeProp(n) : null;
    if (h.rig) root.add(h.rig.obj);
  }

  const handFor = (i: number) => (i === 0 ? arms[1] : arms[0]); // 0 = right hand (index1 = s=-1), 1 = left

  function update(s: ActorState, dt: number, t: number) {
    dt = Math.min(dt, 0.1);
    const snap = s.snap || first;
    root.position.set(s.pos[0], s.pos[1], s.pos[2]);
    root.rotation.y = s.yaw;
    root.updateMatrixWorld(true);

    // ---- pose smoothing
    const pose = POSES[s.pose] ?? POSES.stand;
    poseVec(pose, tgt);
    const k = snap ? 100 : 5.5;
    for (let i = 0; i < NP; i++) cur[i] = damp(cur[i], tgt[i], k, dt);
    lastPose = s.pose;

    // ---- expression smoothing
    const e = EXPR[s.expr] ?? EXPR.neutral;
    const ek = snap ? 100 : 5;
    for (const key of EKEYS) ex[key] = damp(ex[key], e[key], key === "tear" ? 1.6 : ek, dt);
    if (spec.tired > 0) ex.bags = Math.max(ex.bags, spec.tired);

    // ---- speech envelope
    speakEnv = damp(speakEnv, s.speak.env, 14, dt);
    breath += dt * (1.3 + ex.tremble * 2.2 + (pose.anim === "run" ? 2 : 0));
    const bs = Math.sin(breath);

    // ---- locals from pose
    let hipY = cur[0], lean = cur[1], tw = cur[2], hx = cur[3], hy = cur[4], hz = cur[5];
    const al = Array.from(cur.slice(6, 11));
    const ar = Array.from(cur.slice(11, 16));
    let ll0 = cur[16], ll1 = cur[17], lr0 = cur[18], lr1 = cur[19];
    let cl = cur[20], cr = cur[21];
    const anim = pose.anim;
    const ph = s.phase;
    if (anim === "walk" || anim === "run") {
      const run = anim === "run";
      const sa = run ? 0.85 : 0.5;
      const sn = Math.sin(ph);
      const sn2 = Math.sin(ph + Math.PI);
      ll0 += sn * sa;
      lr0 += sn2 * sa;
      ll1 += (run ? 0.3 : 0.08) + Math.max(0, Math.cos(ph)) * (run ? 1.5 : 0.75);
      lr1 += (run ? 0.3 : 0.08) + Math.max(0, Math.cos(ph + Math.PI)) * (run ? 1.5 : 0.75);
      const aw = run ? 0.7 : 0.32;
      if (al[0] < 0.4) { al[0] += sn2 * aw; if (run) al[2] += 0.9 + Math.max(0, sn2) * 0.5; }
      else al[0] += sn * 0.03;
      if (ar[0] < 0.4) { ar[0] += sn * aw; if (run) ar[2] += 0.9 + Math.max(0, sn) * 0.5; }
      else ar[0] += sn * 0.03;
      hipY += Math.abs(Math.cos(ph)) * (run ? 0.05 : 0.025) - 0.015;
      tw += sn * (run ? 0.22 : 0.1);
      lean += run ? 0.05 : 0.025;
    } else if (anim === "piano") {
      const m = Math.sin(t * 2.1);
      al[0] += Math.sin(t * 1.3) * 0.05;
      ar[0] += Math.sin(t * 1.1 + 1) * 0.05;
      al[1] += m * 0.06;
      ar[1] -= m * 0.06;
      cl = 0.25 + Math.max(0, Math.sin(t * 6.3)) * 0.3;
      cr = 0.25 + Math.max(0, Math.sin(t * 5.1 + 2)) * 0.3;
      lean += Math.sin(t * 0.9) * 0.03;
      hz += Math.sin(t * 0.8) * 0.05;
      hx += Math.sin(t * 1.2) * 0.03;
    } else if (anim === "write") {
      ar[0] += Math.sin(t * 3.1) * 0.025;
      ar[2] += Math.sin(t * 2.3) * 0.05;
      hy += Math.sin(t * 0.5) * 0.04;
    } else if (anim === "stir") {
      ar[0] += Math.sin(t * 4) * 0.06;
      ar[1] += Math.cos(t * 4) * 0.06;
      ar[2] += Math.sin(t * 4 + 1) * 0.08;
    } else if (anim === "wave") {
      ar[2] += Math.sin(t * 7) * 0.4;
      ar[1] += Math.sin(t * 7) * 0.12;
    } else if (anim === "pedal") {
      const pp = ph * 0.6;
      ll0 += Math.sin(pp) * 0.4;
      lr0 += Math.sin(pp + Math.PI) * 0.4;
      ll1 += Math.max(0, Math.cos(pp)) * 0.5;
      lr1 += Math.max(0, Math.cos(pp + Math.PI)) * 0.5;
      lean += Math.sin(ph) * 0.01;
    } else if (anim === "rock") {
      lean += Math.sin(t * 4.5) * 0.03;
    }

    // idle sway + talking gestures
    const idle = Math.sin(t * 0.55 + seed) * 0.012;
    const g = (pose.gest ?? 0.3) * speakEnv;
    if (g > 0.01 && !anim) {
      const n1 = Math.sin(t * 2.3 + seed) * Math.sin(t * 0.9);
      const n2 = Math.sin(t * 1.9 + 2 + seed) * Math.sin(t * 1.1 + 1);
      const freeR = ar[0] < 0.7;
      const freeL = al[0] < 0.7;
      if (freeR) { ar[0] += (0.5 + n1 * 0.4) * g * 0.6; ar[2] += (0.9 + n2 * 0.5) * g * 0.7; ar[1] += n1 * 0.1 * g; }
      if (freeL && (pose.gest ?? 0) > 0.6) { al[0] += (0.35 + n2 * 0.3) * g * 0.5; al[2] += (0.7 + n1 * 0.4) * g * 0.6; }
      hx += Math.sin(t * 2.6) * 0.035 * g;
      hy += Math.sin(t * 1.7 + 1) * 0.05 * g;
    }
    // crying shake
    const shake = ex.tremble * Math.sin(t * 17) * 0.006;
    lean += bs * 0.004 * (1 + ex.tremble * 3) + shake;
    hz += idle * 0.8;

    // ---- gaze
    if (s.look) {
      const L = root.worldToLocal(tmpV.copy(s.look));
      const hdY = hipY + lean * 0.3 + 0.69;
      const dx = L.x, dy = L.y - hdY, dz = L.z;
      let yawT = Math.atan2(dx, dz);
      if (Math.abs(yawT) > 2.4) yawT = clamp(yawT, -1.2, 1.2);
      const pitT = Math.atan2(dy, Math.hypot(dx, dz));
      const twT = clamp(yawT * 0.18, -0.3, 0.3);
      const hyT = clamp(yawT - twT, -1.1, 1.1) * 0.7;
      const hpT = clamp(pitT, -0.6, 0.6) * 0.55;
      tw += twT;
      hYaw = damp(hYaw, hyT, snap ? 100 : 3.2, dt);
      hPit = damp(hPit, hpT, snap ? 100 : 3.2, dt);
      eYaw = damp(eYaw, clamp(yawT - twT - hYaw, -0.55, 0.55), snap ? 100 : 12, dt);
      ePit = damp(ePit, clamp(pitT - hPit, -0.4, 0.35), snap ? 100 : 12, dt);
    } else {
      hYaw = damp(hYaw, Math.sin(t * 0.3 + seed) * 0.08, 1.5, dt);
      hPit = damp(hPit, Math.sin(t * 0.37) * 0.03, 1.5, dt);
      eYaw = damp(eYaw, 0, 6, dt);
      ePit = damp(ePit, 0, 6, dt);
    }
    sacT -= dt;
    if (sacT < 0) {
      sacT = 0.7 + Math.random() * 2.2;
      sacTX = (Math.random() - 0.5) * 0.07;
      sacTY = (Math.random() - 0.5) * 0.04;
    }
    sacX = damp(sacX, sacTX, 18, dt);
    sacY = damp(sacY, sacTY, 18, dt);

    // ---- apply body
    hips.position.y = hipY;
    hips.rotation.z = idle;
    hips.rotation.y = 0;
    spine.rotation.set(lean, tw, -idle * 0.6);
    spine.scale.set(1 + bs * 0.003, 1 + bs * 0.006, 1 + bs * 0.005);
    neck.rotation.set(hx - hPit + 0.02 * bs * 0, hy + hYaw, hz);
    const sk = spine.children.find((c) => c.name === "skirt");
    if (sk) sk.rotation.x = -Math.max(0, hipY < 0.8 ? 0 : 0);

    for (let i = 0; i < 2; i++) {
      const A = i === 0 ? al : ar;
      const side = i === 0 ? 1 : -1;
      const a = arms[i];
      a.sh.rotation.set(-A[0], 0, side * A[1]);
      a.el.rotation.set(-A[2], -side * (A[3] ?? 0) * 1.4, 0);
      a.wr.rotation.set(-(A[4] ?? 0) + 0.05, 0, 0);
      const c = i === 0 ? cl : cr;
      for (let f = 0; f < 4; f++) {
        const amt = c * (1 + f * 0.06);
        a.hand.finger[f][0].rotation.z = -side * amt * 1.25;
        a.hand.finger[f][1].rotation.z = -side * amt * 1.45;
      }
      a.hand.thumb[0].rotation.set(-0.55 + c * 0.2, 0, side * (0.15 + c * 0.4) * -1 * -1);
    }
    legs[0].hp.rotation.set(-ll0, 0, 0.02);
    legs[0].kn.rotation.x = ll1;
    legs[1].hp.rotation.set(-lr0, 0, -0.02);
    legs[1].kn.rotation.x = lr1;

    // ---- eyes
    blinkT -= dt;
    if (blinkT < 0 && blinkP < 0) {
      blinkP = 0;
      blinkT = 2 + Math.random() * 3.5;
    }
    let blink = 0;
    if (blinkP >= 0) {
      blinkP += dt / 0.17;
      blink = blinkP < 0.4 ? blinkP / 0.4 : 1 - (blinkP - 0.4) / 0.6;
      if (blinkP >= 1) {
        blinkP = -1;
        blink = 0;
      }
    }
    const beta = 38 - ex.squint * 18 - ex.smile * 3;
    const lidBase = ex.lid + ex.tremble * Math.sin(t * 20) * 0.01;
    const alphaOpen = -beta + lidBase * 112 + ePit * 22 * (ePit < 0 ? 1.1 : 0.5);
    const alpha = Math.max(-beta, alphaOpen - (alphaOpen + beta) * blink);
    for (let i = 0; i < 2; i++) {
      const E = eyes[i];
      E.ball.rotation.set(-(ePit + sacY), eYaw + sacX, 0);
      E.up.rotation.x = -alpha * D2R;
      E.low.rotation.x = beta * D2R;
      (E.wet.material as THREE.MeshStandardMaterial).opacity = 0.1 + ex.tear * 0.35;
    }
    bagM.opacity = clamp(ex.bags * 0.22, 0, 0.3);
    blushM.opacity = clamp(ex.blush * 0.35, 0, 0.4);

    // brows
    const raise = ex.browUp * 0.0085 - ex.squint * 0.002;
    for (let i = 0; i < 2; i++) {
      const sd = i === 0 ? 1 : -1;
      const b = brows[i];
      const sm = (i === 0 ? ex.smirk : -ex.smirk) * 0.006;
      b.position.y = BY + raise + sm + ex.tremble * Math.sin(t * 18 + i) * 0.0004 + (alpha - 25) * 0.00006;
      b.rotation.z = -sd * ex.browTilt * 0.34 + sd * 0.04;
      b.rotation.y = sd * 0.42;
      b.position.z = fns.surf(sd * 0.034, b.position.y) + 0.0008;
    }

    // mouth
    mp.smile = ex.smile;
    mp.smirk = ex.smirk;
    mp.width = ex.width + s.speak.wide * speakEnv;
    mp.open = clamp(ex.open + s.speak.open * 0.85, 0, 1);
    mp.pucker = clamp(ex.pucker + s.speak.pucker, 0, 1);
    mp.jit = ex.tremble;
    updateMouth(mouthG, mouthZ, mp, F);

    // tears
    for (const d of drops) {
      const on = ex.tear > 0.55;
      d.m.visible = on;
      if (!on) continue;
      const v = (t * 0.1 + d.off) % 1;
      const y = eyeY - 0.018 - v * 0.052;
      const x = d.s * (eyeX + 0.004 + v * 0.007);
      d.m.position.set(x, y, fns.surf(x, y) + 0.002);
      const sc = (1 - Math.pow(v, 3)) * (0.7 + 0.5 * v) * clamp((ex.tear - 0.5) * 3, 0, 1);
      d.m.scale.set(sc, sc * 1.25, sc);
    }

    // wear
    for (const key of Object.keys(wearMap)) wearMap[key].visible = s.wear.includes(key);

    // ---- props
    setProp(0, s.r);
    setProp(1, s.l);
    for (let i = 0; i < 2; i++) {
      const h = propHolders[i];
      if (!h.rig) continue;
      h.rig.update?.(s.phase);
      if (h.rig.mode === "root") {
        h.rig.obj.position.copy(h.rig.offset);
        continue;
      }
      const hand = handFor(i);
      hand.wr.updateWorldMatrix(true, false);
      const wp = tmpV.set(0, -0.07, 0.0);
      hand.wr.localToWorld(wp);
      root.worldToLocal(wp);
      h.rig.obj.position.copy(wp).add(h.rig.offset);
      if (h.rig.mode === "hand") {
        hand.wr.getWorldQuaternion(tmpQ);
        root.getWorldQuaternion(tmpQ2);
        tmpQ.premultiply(tmpQ2.invert());
        h.rig.obj.quaternion.copy(tmpQ);
        void tmpM;
      }
    }
    void lastPose;
    first = false;
  }

  return {
    root,
    update,
    spec,
    dispose: () => {
      disposeObject(root);
    },
  };
}

export function headHeight(pose: string, scale: number) {
  const p = POSES[pose] ?? POSES.stand;
  return ((p.hipY ?? HIP_STAND) + 0.69 + (p.lean ?? 0) * 0.2) * scale;
}
