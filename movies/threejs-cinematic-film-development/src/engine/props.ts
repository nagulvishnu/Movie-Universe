// Shared prop helpers: material cache, merged static batching, instanced fleets, vegetation.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const TIME = { value: 0 };
export const WIND = { value: 0.5 };

const mats = new Map<string, THREE.MeshStandardMaterial>();
export function mat(color: number, rough = 0.85, metal = 0, emissive = 0, ei = 0): THREE.MeshStandardMaterial {
  const k = `${color}|${rough}|${metal}|${emissive}|${ei}`;
  let m = mats.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity: ei });
    mats.set(k, m);
  }
  return m;
}
export function texMat(map: THREE.Texture, tile: number, rough = 0.9, color = 0xffffff, metal = 0): THREE.MeshStandardMaterial {
  const k = `t|${map.uuid}|${tile}|${rough}|${color}|${metal}`;
  let m = mats.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ map, roughness: rough, metalness: metal, color });
    m.userData.tile = tile;
    mats.set(k, m);
  }
  return m;
}
export const glow = (color: number, i = 1.5) => mat(color, 0.4, 0, color, i);

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

/** Accumulates transformed primitives per material, then merges into one mesh per material (few draw calls). */
export class Batch {
  private map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private add(m: THREE.Material, g: THREE.BufferGeometry, x: number, y: number, z: number, rx: number, ry: number, rz: number, sx = 1, sy = 1, sz = 1) {
    _e.set(rx, ry, rz); _q.setFromEuler(_e); _p.set(x, y, z); _s.set(sx, sy, sz);
    _m.compose(_p, _q, _s);
    g.applyMatrix4(_m);
    const tile = (m.userData as { tile?: number }).tile;
    if (tile) {
      const pos = g.getAttribute('position'), nor = g.getAttribute('normal'), uv = g.getAttribute('uv');
      for (let i = 0; i < pos.count; i++) {
        const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
        if (ay >= ax && ay >= az) uv.setXY(i, pos.getX(i) / tile, pos.getZ(i) / tile);
        else if (ax >= az) uv.setXY(i, pos.getZ(i) / tile, pos.getY(i) / tile);
        else uv.setXY(i, pos.getX(i) / tile, pos.getY(i) / tile);
      }
    }
    const ng = g.index ? g.toNonIndexed() : g;
    if (ng !== g) g.dispose();
    let l = this.map.get(m);
    if (!l) { l = []; this.map.set(m, l); }
    l.push(ng);
  }
  box(m: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0) {
    this.add(m, new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz); return this;
  }
  /** box from min corner to max corner */
  slab(m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
    return this.box(m, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  }
  cyl(m: THREE.Material, rt: number, rb: number, h: number, x: number, y: number, z: number, seg = 10, rx = 0, ry = 0, rz = 0) {
    this.add(m, new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z, rx, ry, rz); return this;
  }
  sph(m: THREE.Material, r: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, seg = 10) {
    this.add(m, new THREE.SphereGeometry(r, seg, Math.max(5, seg - 3)), x, y, z, 0, 0, 0, sx, sy, sz); return this;
  }
  /** Gable roof, ridge along z (or x if alongX). */
  gable(m: THREE.Material, w: number, d: number, rise: number, x: number, y: number, z: number, alongX = false) {
    const half = w / 2, len = Math.hypot(half, rise) + 0.3, a = Math.atan2(rise, half);
    const dd = d + 0.5;
    if (!alongX) {
      this.box(m, len, 0.14, dd, x - half / 2, y + rise / 2, z, 0, 0, a);
      this.box(m, len, 0.14, dd, x + half / 2, y + rise / 2, z, 0, 0, -a);
    } else {
      this.box(m, len, 0.14, d + 0.5, x, y + rise / 2, z - half / 2, Math.PI / 2, 0, -a);
      this.box(m, len, 0.14, d + 0.5, x, y + rise / 2, z + half / 2, Math.PI / 2, 0, a);
    }
    return this;
  }
  build(parent: THREE.Object3D, cast = true, receive = true) {
    this.map.forEach((list, m) => {
      const g = mergeGeometries(list, false);
      list.forEach((x) => x.dispose());
      if (!g) return;
      const mesh = new THREE.Mesh(g, m);
      mesh.castShadow = cast; mesh.receiveShadow = receive;
      parent.add(mesh);
    });
    this.map.clear();
    return parent;
  }
}

export function instanced(geo: THREE.BufferGeometry, m: THREE.Material, count: number, fn: (i: number, mx: THREE.Matrix4, col: THREE.Color) => void, cast = true) {
  const im = new THREE.InstancedMesh(geo, m, count);
  const mx = new THREE.Matrix4(), col = new THREE.Color();
  for (let i = 0; i < count; i++) { col.set(0xffffff); fn(i, mx, col); im.setMatrixAt(i, mx); im.setColorAt(i, col); }
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.castShadow = cast; im.receiveShadow = true; im.frustumCulled = false;
  return im;
}

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function compose(x: number, y: number, z: number, ry = 0, sx = 1, sy = 1, sz = 1, mx = new THREE.Matrix4(), rx = 0, rz = 0) {
  _e.set(rx, ry, rz); _q.setFromEuler(_e); _p.set(x, y, z); _s.set(sx, sy, sz);
  return mx.compose(_p, _q, _s);
}

// ---------- vegetation ----------
let grassMat: THREE.MeshStandardMaterial | null = null;
export function grass(count: number, cx: number, cz: number, w: number, d: number, seed = 1, h = 0.6, avoid?: (x: number, z: number) => boolean) {
  if (!grassMat) {
    grassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, side: THREE.DoubleSide });
    grassMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = TIME; sh.uniforms.uWind = WIND;
      sh.vertexShader = 'uniform float uTime; uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
        float ph = instanceMatrix[3][0]*0.7 + instanceMatrix[3][2]*0.5;
        float sw = sin(uTime*(1.5+uWind*2.0) + ph) * (0.04 + uWind*0.12) * position.y;
        transformed.x += sw; transformed.z += sw*0.6;
        #endif`);
    };
  }
  const r = rng(seed);
  const g = new THREE.ConeGeometry(0.07, 1, 3); g.translate(0, 0.5, 0);
  const im = instanced(g, grassMat, count, (_i, mx, col) => {
    let x = cx + (r() - 0.5) * w, z = cz + (r() - 0.5) * d, tries = 0;
    while (avoid && avoid(x, z) && tries++ < 5) { x = cx + (r() - 0.5) * w; z = cz + (r() - 0.5) * d; }
    const s = h * (0.5 + r());
    compose(x, 0, z, r() * 6.28, 0.35 + r() * 0.35, s, 0.35 + r() * 0.35, mx, (r() - 0.5) * 0.3, (r() - 0.5) * 0.3);
    col.setRGB(0.22 + r() * 0.2, 0.32 + r() * 0.22, 0.1 + r() * 0.1);
  }, false);
  return im;
}

export function trees(list: { x: number; z: number; s: number }[], seed = 5, leaf = 0x3f5a2c) {
  const g = new THREE.Group();
  const r = rng(seed);
  const trunk = instanced(new THREE.CylinderGeometry(0.18, 0.28, 1, 6), mat(0x4a3a2c, 1), list.length, (i, mx) => { const t = list[i]; compose(t.x, t.s * 1.6, t.z, 0, t.s, t.s * 3.2, t.s, mx); });
  g.add(trunk);
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const c1 = instanced(geo, mat(leaf, 1), list.length, (i, mx, col) => { const t = list[i]; compose(t.x, t.s * 4.2, t.z, r() * 6, t.s * 2.2, t.s * 1.8, t.s * 2.2, mx); col.setRGB(0.7 + r() * 0.5, 0.85 + r() * 0.3, 0.6 + r() * 0.3); });
  const c2 = instanced(geo, mat(leaf, 1), list.length, (i, mx, col) => { const t = list[i]; compose(t.x + (r() - 0.5) * t.s, t.s * 5.6, t.z + (r() - 0.5) * t.s, r() * 6, t.s * 1.5, t.s * 1.3, t.s * 1.5, mx); col.setRGB(0.8 + r() * 0.4, 0.9 + r() * 0.3, 0.6 + r() * 0.3); });
  g.add(c1, c2);
  return g;
}

export function rocks(count: number, cx: number, cz: number, w: number, d: number, size: number, seed = 2, color = 0x6a6a65, y = 0) {
  const r = rng(seed);
  return instanced(new THREE.IcosahedronGeometry(1, 0), mat(color, 1), count, (_i, mx, col) => {
    const s = size * (0.3 + r() * r() * 1.4);
    compose(cx + (r() - 0.5) * w, y + s * 0.3, cz + (r() - 0.5) * d, r() * 6, s * (0.8 + r() * 0.8), s * (0.5 + r() * 0.5), s * (0.8 + r() * 0.8), mx);
    const v = 0.7 + r() * 0.5; col.setRGB(v, v, v);
  });
}

export function lightShaft(x: number, y: number, z: number, h: number, r0: number, r1: number, color = 0xffe7b0, op = 0.09) {
  const g = new THREE.CylinderGeometry(r0, r1, h, 12, 1, true);
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.userData.own = true;
  return mesh;
}

// ---------- cars ----------
export interface CarDef { x: number; z: number; ry: number; color: number; scale?: [number, number, number]; tilt?: number }
export class Fleet {
  body: THREE.InstancedMesh; cabin: THREE.InstancedMesh; wheels: THREE.InstancedMesh;
  group = new THREE.Group();
  constructor(public defs: CarDef[], ruined: boolean) {
    const n = defs.length;
    this.body = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 0.62, 4.3), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: ruined ? 0.9 : 0.35, metalness: ruined ? 0.2 : 0.5 }), n);
    this.cabin = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 0.52, 2.3), new THREE.MeshStandardMaterial({ color: ruined ? 0x3a4440 : 0x1a232b, roughness: 0.25, metalness: 0.4 }), n);
    this.wheels = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.34, 0.34, 0.26, 10).rotateZ(Math.PI / 2), mat(0x151515, 1), n * 4);
    const c = new THREE.Color();
    defs.forEach((d, i) => {
      c.set(d.color);
      this.body.setColorAt(i, c);
      this.set(i, d.x, d.z, d.ry);
    });
    this.body.userData.own = true; this.cabin.userData.own = true;
    [this.body, this.cabin, this.wheels].forEach((m) => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; this.group.add(m); });
  }
  private tmp = new THREE.Matrix4(); private tmp2 = new THREE.Matrix4(); private tq = new THREE.Quaternion(); private te = new THREE.Euler();
  set(i: number, x: number, z: number, ry: number) {
    const d = this.defs[i], s = d.scale ?? [1, 1, 1];
    this.te.set(0, ry, d.tilt ?? 0); this.tq.setFromEuler(this.te);
    const base = this.tmp.compose(_p.set(x, 0, z), this.tq, _s.set(1, 1, 1));
    this.body.setMatrixAt(i, this.tmp2.multiplyMatrices(base, compose(0, 0.62 * s[1], 0, 0, s[0], s[1], s[2], new THREE.Matrix4())));
    this.cabin.setMatrixAt(i, this.tmp2.multiplyMatrices(base, compose(0, 0.62 * s[1] + 0.55 * s[1] * 0.9, -0.2 * s[2], 0, s[0], s[1] * (s[1] > 1.5 ? 1.2 : 1), s[2] > 1.4 ? s[2] * 0.7 : s[2], new THREE.Matrix4())));
    let k = i * 4;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) this.wheels.setMatrixAt(k++, this.tmp2.multiplyMatrices(base, compose(sx * 0.9 * s[0], 0.34, sz * 1.4 * s[2], 0, 1, 1, 1, new THREE.Matrix4())));
  }
  commit() {
    this.body.instanceMatrix.needsUpdate = true; this.cabin.instanceMatrix.needsUpdate = true; this.wheels.instanceMatrix.needsUpdate = true;
    if (this.body.instanceColor) this.body.instanceColor.needsUpdate = true;
  }
}

export function disposeTree(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    if ((c as THREE.InstancedMesh).isInstancedMesh) (c as THREE.InstancedMesh).dispose();
    if (m.userData?.own && m.material) (m.material as THREE.Material).dispose();
  });
}
