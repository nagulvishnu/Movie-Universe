import * as THREE from 'three';
import type { ReactNode } from 'react';
import type { V3 } from '../film/types';

// ---- Shared unit geometries (reused by every character, prop and environment) ----
const beak = (len: number, bend: number, r0: number, r1: number) => {
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, len * 0.55), new THREE.Vector3(0, -bend, len));
  const segs = 14, rad = 8;
  const geo = new THREE.TubeGeometry(curve, segs, 1, rad, false);
  const pos = geo.attributes.position;
  for (let i = 0; i <= segs; i++) {
    const c = curve.getPoint(i / segs);
    const r = r0 + (r1 - r0) * (i / segs);
    for (let j = 0; j <= rad; j++) {
      const idx = i * (rad + 1) + j;
      pos.setXYZ(idx, c.x + (pos.getX(idx) - c.x) * r, c.y + (pos.getY(idx) - c.y) * r, c.z + (pos.getZ(idx) - c.z) * r);
    }
  }
  geo.computeVertexNormals();
  return geo;
};
const pyramid = new THREE.ConeGeometry(Math.SQRT2, 1, 4, 1);
pyramid.rotateY(Math.PI / 4);

export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 18, 14),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
  tcone: new THREE.CylinderGeometry(0.7, 1, 1, 16),
  cone: new THREE.ConeGeometry(1, 1, 16),
  torus: new THREE.TorusGeometry(1, 0.12, 8, 28),
  arc: new THREE.TorusGeometry(1, 0.1, 8, 20, Math.PI),
  hemi: new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  plane: new THREE.PlaneGeometry(1, 1),
  pyr: pyramid,
  beak: beak(1, 0.35, 0.14, 0.03),
  snout: beak(1, 0.45, 0.2, 0.09),
} as const;
export type GeoKey = keyof typeof GEO;

// ---- Shared materials ----
export interface MatOpts { rough?: number; metal?: number; e?: number; o?: number; flat?: boolean; map?: THREE.Texture; side?: THREE.Side; emissive?: string }
const mats = new Map<string, THREE.MeshStandardMaterial>();
export function mat(c: string, o: MatOpts = {}) {
  const key = [c, o.rough, o.metal, o.e, o.o, o.flat, o.map?.uuid, o.side, o.emissive].join('|');
  let m = mats.get(key);
  if (!m) {
    const params: THREE.MeshStandardMaterialParameters = {
      color: c, roughness: o.rough ?? 0.72, metalness: o.metal ?? 0,
      emissive: o.e ? (o.emissive ?? c) : '#000000', emissiveIntensity: o.e ?? 0,
      transparent: o.o !== undefined, opacity: o.o ?? 1, depthWrite: o.o === undefined,
    };
    if (o.flat) params.flatShading = true;
    if (o.map) params.map = o.map;
    if (o.side !== undefined) params.side = o.side;
    m = new THREE.MeshStandardMaterial(params);
    mats.set(key, m);
  }
  return m;
}
const glows = new Map<string, THREE.MeshBasicMaterial>();
export function glow(c: string, o = 1, side: THREE.Side = THREE.FrontSide) {
  const key = `${c}|${o}|${side}`;
  let m = glows.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side, fog: false });
    glows.set(key, m);
  }
  return m;
}

export interface PP extends MatOpts {
  g: GeoKey;
  c?: string;
  p?: V3;
  s?: V3 | number;
  r?: V3;
  add?: boolean; // additive glow material
  mt?: THREE.Material;
  cast?: boolean;
  children?: ReactNode;
}

/** Generic primitive: a shared unit geometry + cached material, positioned by props. */
export function P({ g, c = '#ffffff', p, s, r, add, mt, cast, children, ...o }: PP) {
  const material = mt ?? (add ? glow(c, o.o ?? 1, o.side) : mat(c, o));
  const scale: V3 | undefined = typeof s === 'number' ? [s, s, s] : s;
  return (
    <mesh geometry={GEO[g]} material={material} position={p} rotation={r} scale={scale} castShadow={cast} frustumCulled>
      {children}
    </mesh>
  );
}
