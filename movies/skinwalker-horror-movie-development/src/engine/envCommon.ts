import * as THREE from 'three';
import type { TimeOfDay } from '../movie/types';
import { fogTex, glowTex, groundTex, moonTex, rng } from './textures';

export interface Env {
  group: THREE.Group;
  objs: Record<string, THREE.Object3D>;
  key: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  interior: THREE.PointLight[];
  interiorBase: number[];
  bulbs: { mat: THREE.MeshBasicMaterial; base: THREE.Color }[];
  fire?: THREE.PointLight;
  update(t: number, dt: number, cam: THREE.Camera): void;
  dispose(): void;
  doors?: Record<string, THREE.Group>;
  pal: Pal;
  fogDensity: number;
}

export interface Pal {
  bg: number; fog: number; density: number; hemiSky: number; hemiGround: number; hemiI: number;
  keyColor: number; keyI: number; keyPos: [number, number, number]; exposure: number; stars: boolean; moon: boolean; mount: number;
}
export const PAL: Record<TimeOfDay, Pal> = {
  day: { bg: 0xaab8be, fog: 0xaab8be, density: 0.011, hemiSky: 0xc5d4dc, hemiGround: 0x4a4a38, hemiI: 1.1, keyColor: 0xfff0d6, keyI: 2.4, keyPos: [20, 30, 12], exposure: 1.0, stars: false, moon: false, mount: 0x5f7280 },
  overcast: { bg: 0x8d989c, fog: 0x8d989c, density: 0.02, hemiSky: 0xaab6bb, hemiGround: 0x3a3a2c, hemiI: 1.0, keyColor: 0xdfe6ea, keyI: 0.9, keyPos: [10, 30, 10], exposure: 0.95, stars: false, moon: false, mount: 0x55636c },
  dusk: { bg: 0x8e6a62, fog: 0x7d5e5c, density: 0.017, hemiSky: 0xd1987a, hemiGround: 0x2a2a30, hemiI: 0.85, keyColor: 0xff9650, keyI: 2.4, keyPos: [-30, 9, 8], exposure: 1.0, stars: false, moon: false, mount: 0x3f3040 },
  night: { bg: 0x060a12, fog: 0x0a111b, density: 0.034, hemiSky: 0x3a4c76, hemiGround: 0x0a0c10, hemiI: 0.62, keyColor: 0x8fa8e8, keyI: 1.2, keyPos: [-14, 30, -22], exposure: 1.15, stars: true, moon: true, mount: 0x090d16 },
  dawn: { bg: 0xcb9c88, fog: 0xc09a8a, density: 0.016, hemiSky: 0xe8bb9c, hemiGround: 0x3a3430, hemiI: 0.9, keyColor: 0xffb878, keyI: 2.2, keyPos: [30, 8, 20], exposure: 1.0, stars: false, moon: false, mount: 0x6a5a62 },
  storm: { bg: 0x080c12, fog: 0x0c1218, density: 0.045, hemiSky: 0x33425c, hemiGround: 0x07090c, hemiI: 0.5, keyColor: 0x6a80ac, keyI: 0.6, keyPos: [-14, 30, -22], exposure: 1.1, stars: false, moon: false, mount: 0x07090e },
};

// ---------- geometry helpers ----------
export function worldUV(g: THREE.BufferGeometry, scale = 1) {
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (nx > 0.5) uv.setXY(i, z * scale, y * scale); else if (ny > 0.5) uv.setXY(i, x * scale, z * scale); else uv.setXY(i, x * scale, y * scale);
  }
  uv.needsUpdate = true;
}

export class Builder {
  group = new THREE.Group();
  geos: THREE.BufferGeometry[] = [];
  mats: THREE.Material[] = [];
  lights: THREE.Light[] = [];
  keep: THREE.Texture[] = [];
  box(w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, uv = 1, parent: THREE.Object3D = this.group, shadow = true) {
    const g = new THREE.BoxGeometry(w, h, d); worldUV(g, uv); this.geos.push(g);
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o;
  }
  mesh(g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = this.group) {
    this.geos.push(g); const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
  }
  std(color: number, rough = 0.9, map?: THREE.Texture | null, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, map: map ?? null, ...extra }); this.mats.push(m); return m;
  }
  basic(color: number, extra: Partial<THREE.MeshBasicMaterialParameters> = {}) {
    const m = new THREE.MeshBasicMaterial({ color, ...extra }); this.mats.push(m); return m;
  }
  /** wall along an axis-aligned line with openings (c = centre offset from start, w, y0,y1) */
  wall(x0: number, z0: number, x1: number, z1: number, h: number, th: number, m: THREE.Material, openings: { c: number; w: number; y0: number; y1: number }[] = [], uv = 0.8) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
    const g = new THREE.Group(); g.position.set(x0, 0, z0); g.rotation.y = Math.atan2(-dz, dx); this.group.add(g);
    const ops = [...openings].sort((a, b) => a.c - b.c);
    let cur = 0;
    const piece = (a: number, b: number, y0: number, y1: number) => { if (b - a < 0.01 || y1 - y0 < 0.01) return; this.box(b - a, y1 - y0, th, m, (a + b) / 2, (y0 + y1) / 2, 0, uv, g); };
    for (const o of ops) {
      const a = o.c - o.w / 2, b = o.c + o.w / 2;
      piece(cur, a, 0, h); piece(a, b, 0, o.y0); piece(a, b, o.y1, h); cur = b;
    }
    piece(cur, L, 0, h);
    return g;
  }
  dispose() {
    this.geos.forEach((g) => g.dispose());
    this.mats.forEach((m) => m.dispose());
    this.lights.forEach((l) => l.dispose?.());
  }
}

// ---------- trees ----------
export interface TreeOpts {
  count: number; seed: number; x: [number, number]; z: [number, number];
  keepOut?: (x: number, z: number) => boolean; sMin?: number; sMax?: number; leaf?: number; dead?: number;
}
export function scatterTrees(b: Builder, o: TreeOpts) {
  const r = rng(o.seed);
  const trunkG = new THREE.CylinderGeometry(0.14, 0.26, 1, 6).translate(0, 0.5, 0);
  const coneG = new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0);
  b.geos.push(trunkG, coneG);
  const trunkM = b.std(0x2a1d14, 1), leafM = b.std(o.leaf ?? 0xffffff, 1);
  const trunk = new THREE.InstancedMesh(trunkG, trunkM, o.count);
  const cones = [0, 1, 2].map(() => new THREE.InstancedMesh(coneG, leafM, o.count));
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  let n = 0;
  for (let i = 0; i < o.count * 3 && n < o.count; i++) {
    const x = o.x[0] + r() * (o.x[1] - o.x[0]), z = o.z[0] + r() * (o.z[1] - o.z[0]);
    if (o.keepOut && o.keepOut(x, z)) continue;
    const sc = (o.sMin ?? 0.8) + r() * ((o.sMax ?? 1.5) - (o.sMin ?? 0.8));
    const H = 9 * sc, dead = r() < (o.dead ?? 0.12);
    dummy.rotation.set((r() - 0.5) * 0.06, r() * 6, (r() - 0.5) * 0.06);
    dummy.position.set(x, 0, z); dummy.scale.set(sc, H, sc); dummy.updateMatrix(); trunk.setMatrixAt(n, dummy.matrix);
    const defs: [number, number, number][] = [[0.26, 1.75, 5.2], [0.46, 1.45, 4.6], [0.66, 1.05, 4.0]];
    cones.forEach((cm, k) => {
      const [yy, rr, hh] = defs[k];
      dummy.position.set(x, H * yy, z); dummy.rotation.y = r() * 6;
      const s0 = dead ? 0.0001 : 1;
      dummy.scale.set(rr * sc * s0, hh * sc * s0, rr * sc * s0); dummy.updateMatrix(); cm.setMatrixAt(n, dummy.matrix);
      col.setHSL(0.3 + r() * 0.06, 0.28 + r() * 0.15, 0.08 + r() * 0.05); cm.setColorAt(n, col);
    });
    n++;
  }
  trunk.count = n; cones.forEach((c) => (c.count = n));
  trunk.castShadow = true; trunk.frustumCulled = false; cones.forEach((c) => (c.frustumCulled = false));
  const g = new THREE.Group(); g.add(trunk, ...cones);
  b.group.add(g);
  return g;
}

export function addGround(b: Builder, size = 400, base = '#2a261f', rep = 90) {
  const tex = groundTex(base).clone(); tex.needsUpdate = true; tex.repeat.set(rep, rep); b.keep.push(tex);
  const m = b.std(0xffffff, 1, tex);
  const g = new THREE.PlaneGeometry(size, size); b.geos.push(g);
  const o = new THREE.Mesh(g, m); o.rotation.x = -Math.PI / 2; o.receiveShadow = true; b.group.add(o);
  return o;
}

export function addSky(b: Builder, pal: Pal, moonDir: THREE.Vector3) {
  if (pal.stars) {
    const n = 500, pos = new Float32Array(n * 3), r = rng(5);
    for (let i = 0; i < n; i++) { const th = r() * 6.28, ph = r() * 1.3 + 0.1, R = 300; pos[i * 3] = Math.cos(th) * Math.sin(ph) * R; pos[i * 3 + 1] = Math.cos(ph) * R; pos[i * 3 + 2] = Math.sin(th) * Math.sin(ph) * R; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); b.geos.push(g);
    const m = new THREE.PointsMaterial({ color: 0xbfd0ff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.7 }); b.mats.push(m);
    b.group.add(new THREE.Points(g, m));
  }
  if (pal.moon) {
    const m = new THREE.SpriteMaterial({ map: moonTex(), fog: false, transparent: true, depthWrite: false }); b.mats.push(m);
    const s = new THREE.Sprite(m); s.scale.setScalar(55); s.position.copy(moonDir).multiplyScalar(260); b.group.add(s);
  }
}

export function addMountains(b: Builder, color: number, radius = 170) {
  const m = b.basic(color, { fog: false });
  const r = rng(77);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + r() * 0.2, h = 40 + r() * 60, w = 50 + r() * 50;
    const g = new THREE.ConeGeometry(w, h, 5 + Math.floor(r() * 3)); b.geos.push(g);
    const o = new THREE.Mesh(g, m); o.position.set(Math.cos(a) * radius, h / 2 - 2, Math.sin(a) * radius); o.rotation.y = r() * 3; b.group.add(o);
  }
}

export function fogLayer(b: Builder, color: number, count: number, spread: number, opacity: number) {
  const r = rng(31), sprites: THREE.Sprite[] = [];
  const tex = fogTex();
  for (let i = 0; i < count; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: opacity * (0.6 + r() * 0.6), depthWrite: false }); b.mats.push(m);
    const s = new THREE.Sprite(m); s.scale.setScalar(10 + r() * 14);
    s.position.set((r() - 0.5) * spread, 0.8 + r() * 2.4, (r() - 0.5) * spread); s.userData.v = (r() - 0.5) * 0.5; s.userData.ph = r() * 6;
    b.group.add(s); sprites.push(s);
  }
  return (t: number) => sprites.forEach((s) => { s.position.x += s.userData.v * 0.012; s.position.y = 1.2 + Math.sin(t * 0.2 + s.userData.ph) * 0.4; if (Math.abs(s.position.x) > spread / 2) s.userData.v *= -1; });
}

export function makeRain(b: Builder, intensity: number) {
  const n = Math.floor(2400 * Math.min(1, intensity)), H = 22, W = 26;
  const r = rng(8), pos = new Float32Array(n * 6);
  for (let i = 0; i < n; i++) {
    const x = (r() - 0.5) * W, y = r() * H, z = (r() - 0.5) * W;
    pos.set([x, y, z, x + 0.12, y - 0.7, z + 0.03], i * 6);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); b.geos.push(g);
  const m = new THREE.LineBasicMaterial({ color: 0xaab8c8, transparent: true, opacity: 0.32 }); b.mats.push(m);
  const a = new THREE.LineSegments(g, m), c = new THREE.LineSegments(g, m);
  a.frustumCulled = false; c.frustumCulled = false;
  const grp = new THREE.Group(); grp.add(a, c); b.group.add(grp);
  return (t: number, _dt: number, cam: THREE.Camera) => {
    const off = (t * 20) % H;
    grp.position.set(cam.position.x, 0, cam.position.z);
    a.position.y = -off; c.position.y = H - off;
  };
}

export function makeDust(b: Builder, count: number, area: [number, number, number], center: [number, number, number], color = 0xffe8c0) {
  const r = rng(12), pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) pos.set([(r() - 0.5) * area[0], r() * area[1], (r() - 0.5) * area[2]], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); b.geos.push(g);
  const m = new THREE.PointsMaterial({ color, size: 0.03, transparent: true, opacity: 0.5, depthWrite: false, map: glowTex(), blending: THREE.AdditiveBlending }); b.mats.push(m);
  const p = new THREE.Points(g, m); p.position.set(...center); p.frustumCulled = false; b.group.add(p);
  return (t: number) => { p.rotation.y = t * 0.02; p.position.y = center[1] + Math.sin(t * 0.3) * 0.08; };
}

export function baseLights(b: Builder, pal: Pal, interior = false) {
  const hemi = new THREE.HemisphereLight(pal.hemiSky, pal.hemiGround, pal.hemiI * (interior ? 0.7 : 1));
  const key = new THREE.DirectionalLight(pal.keyColor, pal.keyI);
  key.position.set(...pal.keyPos);
  key.castShadow = true; key.shadow.mapSize.set(1536, 1536);
  const sc = key.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 90;
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.04;
  b.group.add(hemi, key, key.target);
  return { hemi, key };
}

export function pointLight(b: Builder, color: number, intensity: number, dist: number, x: number, y: number, z: number) {
  const l = new THREE.PointLight(color, intensity, dist, 2); l.position.set(x, y, z); b.group.add(l); b.lights.push(l); return l;
}

export function bulb(b: Builder, color: number, x: number, y: number, z: number, r = 0.07, env?: { bulbs: Env['bulbs'] }) {
  const m = b.basic(color); const g = new THREE.SphereGeometry(r, 8, 6); b.geos.push(g);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); b.group.add(o);
  env?.bulbs.push({ mat: m, base: new THREE.Color(color) });
  return o;
}

/** glass pane (transparent, faint specular) */
export function glassPane(b: Builder, w: number, h: number, x: number, y: number, z: number, ry = 0) {
  const m = b.std(0xaec4d4, 0.1, null, { transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const g = new THREE.PlaneGeometry(w, h); b.geos.push(g);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.rotation.y = ry; b.group.add(o); return o;
}

/** a hinged door (pivot at hinge edge). Returns group; rotate .rotation.y to open */
export function hingedDoor(b: Builder, w: number, h: number, m: THREE.Material, hx: number, hz: number, ry: number, open = 0) {
  const pivot = new THREE.Group(); pivot.position.set(hx, 0, hz); pivot.rotation.y = ry; b.group.add(pivot);
  const inner = new THREE.Group(); inner.rotation.y = open; pivot.add(inner);
  b.box(w, h, 0.06, m, w / 2, h / 2, 0, 1, inner);
  const knob = b.mesh(new THREE.SphereGeometry(0.04, 6, 6), b.std(0xb0a070, 0.4), w - 0.12, h * 0.46, 0.06, inner); knob.castShadow = false;
  return { pivot, inner };
}

export function photoPlane(b: Builder, tex: THREE.Texture, w: number, h: number, x: number, y: number, z: number, ry = 0, rz = 0, glow = 0) {
  const m = b.std(0xffffff, 0.8, tex, glow ? { emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: glow } : {});
  const g = new THREE.PlaneGeometry(w, h); b.geos.push(g);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.rotation.set(0, ry, rz, 'YXZ'); o.receiveShadow = true; b.group.add(o); return o;
}

export function assemble(b: Builder, pal: Pal, hl: { hemi: THREE.HemisphereLight; key: THREE.DirectionalLight }, fogDensity: number,
  ups: ((t: number, dt: number, cam: THREE.Camera) => void)[], extra: Partial<Env> = {}): Env {
  const env: Env = {
    group: b.group, objs: {}, key: hl.key, hemi: hl.hemi, interior: [], interiorBase: [], bulbs: [], pal, fogDensity,
    update: (t, dt, cam) => ups.forEach((u) => u(t, dt, cam)),
    dispose: () => { b.group.removeFromParent(); b.dispose(); b.keep.forEach((t) => t.dispose()); },
    ...extra,
  };
  return env;
}
export function setInterior(env: Env, lights: THREE.PointLight[]) {
  env.interior = lights; env.interiorBase = lights.map((l) => l.intensity);
}
