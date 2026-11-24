// Screenplay-driven cinematic camera: orbit/close-up, two-shot, over-the-shoulder, fixed dolly/crane, tracking, handheld shake,
// plus a collision push-out so the lens never ends up inside walls.
import * as THREE from 'three';
import type { Shot, V3, ActorId } from '../story/types';

export interface ActorRef { head: THREE.Vector3; pos: THREE.Vector3; yaw: number; scale: number }

const ease = (u: number) => u * u * (3 - 2 * u);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerp3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

export class CinematicCamera {
  camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 1500);
  private pos = new THREE.Vector3(); private look = new THREE.Vector3();
  private tmp = new THREE.Vector3(); private tmp2 = new THREE.Vector3(); private up = new THREE.Vector3(0, 1, 0);
  colliders: THREE.Box3[] = [];
  private lastShot = -1;

  /** @param t seconds into the scene. returns the shot index in use */
  update(shots: Shot[], t: number, get: (id: ActorId) => ActorRef | null, time: number) {
    let idx = 0;
    for (let i = 0; i < shots.length; i++) if (shots[i].at <= t + 1e-6) idx = i;
    const s = shots[idx];
    const end = idx + 1 < shots.length ? shots[idx + 1].at : Math.max(s.at + 6, t + 0.01);
    const u = ease(Math.max(0, Math.min(1, (t - s.at) / Math.max(0.01, end - s.at))));
    this.lastShot = idx;
    const P = this.pos, Lk = this.look;
    const A = s.subject ? get(s.subject) : null;
    const B = s.other ? get(s.other) : null;
    let fov = lerp(s.fov ?? 40, s.fov2 ?? s.fov ?? 40, u);
    let ok = true;
    switch (s.mode) {
      case 'orbit': {
        if (!A) { ok = false; break; }
        const dist = lerp(s.dist ?? 2, s.dist2 ?? s.dist ?? 2, u), h = lerp(s.h ?? 0.05, s.h2 ?? s.h ?? 0.05, u);
        const side = lerp(s.side ?? 0, s.side2 ?? s.side ?? 0, u);
        const az = (s.abs ? 0 : A.yaw) + side;
        P.set(A.head.x + Math.sin(az) * dist, A.head.y + h, A.head.z + Math.cos(az) * dist);
        Lk.copy(A.head); if (s.lookOff) Lk.add(this.tmp.set(...s.lookOff));
        break;
      }
      case 'two': {
        if (!A || !B) { ok = false; break; }
        const mid = this.tmp.copy(A.pos).add(B.pos).multiplyScalar(0.5);
        const dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z, sep = Math.hypot(dx, dz) || 1;
        const sd = (s.side ?? 1) >= 0 ? 1 : -1;
        const dist = lerp(s.dist ?? 3, s.dist2 ?? s.dist ?? 3, u) + sep * 0.9;
        const nx = (-dz / sep) * sd, nz = (dx / sep) * sd;
        const rot = (Math.abs(s.side ?? 1) > 1 ? (s.side ?? 1) - sd : 0);
        const ca = Math.cos(rot), sa = Math.sin(rot);
        P.set(mid.x + (nx * ca - nz * sa) * dist, mid.y + 1.5 + lerp(s.h ?? 0.2, s.h2 ?? s.h ?? 0.2, u), mid.z + (nx * sa + nz * ca) * dist);
        Lk.set(mid.x, mid.y + 1.25, mid.z); if (s.lookOff) Lk.add(this.tmp2.set(...s.lookOff));
        break;
      }
      case 'ots': {
        if (!A || !B) { ok = false; break; }
        const dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z, sep = Math.hypot(dx, dz) || 1;
        const ux = dx / sep, uz = dz / sep, back = lerp(s.dist ?? 0.9, s.dist2 ?? s.dist ?? 0.9, u);
        const sd = (s.side ?? 1) >= 0 ? 1 : -1;
        P.set(A.head.x - ux * back - uz * 0.4 * sd, A.head.y + (s.h ?? 0.12), A.head.z - uz * back + ux * 0.4 * sd);
        Lk.copy(B.head); Lk.y -= 0.03; if (s.lookOff) Lk.add(this.tmp2.set(...s.lookOff));
        break;
      }
      case 'track': {
        if (!A) { ok = false; break; }
        const o = lerp3(s.from ?? [3, 1.5, 3], s.to ?? s.from ?? [3, 1.5, 3], u);
        P.set(A.pos.x + o[0], A.pos.y + o[1], A.pos.z + o[2]);
        Lk.copy(A.head); if (s.lookOff) Lk.add(this.tmp2.set(...s.lookOff));
        break;
      }
      case 'fixed': {
        const f = lerp3(s.from ?? [0, 2, 10], s.to ?? s.from ?? [0, 2, 10], u);
        P.set(f[0], f[1], f[2]);
        if (s.lookAt) {
          const L2 = get(s.lookAt);
          if (L2) { Lk.copy(L2.head); if (s.lookOff) Lk.add(this.tmp2.set(...s.lookOff)); } else ok = false;
        } else { const l = lerp3(s.lookFrom ?? [0, 1.5, 0], s.lookTo ?? s.lookFrom ?? [0, 1.5, 0], u); Lk.set(l[0], l[1], l[2]); }
        break;
      }
    }
    if (!ok) { P.set(0, 2, 8); Lk.set(0, 1.4, 0); }
    // handheld
    const sh = (s.shake ?? 0.0) + 0.0015;
    P.x += (Math.sin(time * 1.7) + Math.sin(time * 3.9 + 1.3) * 0.5) * sh * 1.2;
    P.y += (Math.sin(time * 2.1 + 0.4) + Math.sin(time * 5.3) * 0.4) * sh;
    P.z += (Math.sin(time * 1.3 + 2.0) + Math.sin(time * 4.4) * 0.5) * sh * 1.2;
    Lk.x += Math.sin(time * 2.3) * sh * 0.8; Lk.y += Math.sin(time * 2.9 + 1) * sh * 0.8;
    // collision
    for (const b of this.colliders) {
      const e = 0.3;
      if (P.x > b.min.x - e && P.x < b.max.x + e && P.y > b.min.y - e && P.y < b.max.y + e && P.z > b.min.z - e && P.z < b.max.z + e) {
        const dxm = P.x - (b.min.x - e), dxM = b.max.x + e - P.x, dzm = P.z - (b.min.z - e), dzM = b.max.z + e - P.z, dym = P.y - (b.min.y - e), dyM = b.max.y + e - P.y;
        const m = Math.min(dxm, dxM, dzm, dzM, dym, dyM);
        if (m === dxm) P.x = b.min.x - e; else if (m === dxM) P.x = b.max.x + e; else if (m === dzm) P.z = b.min.z - e; else if (m === dzM) P.z = b.max.z + e; else if (m === dym) P.y = b.min.y - e; else P.y = b.max.y + e;
      }
    }
    if (s.mode !== 'fixed' && (A?.pos.y ?? 0) > -0.5) P.y = Math.max(P.y, 0.25);
    this.camera.position.copy(P);
    this.camera.up.copy(this.up);
    this.camera.lookAt(Lk);
    if (s.roll) this.camera.rotateZ(s.roll * lerp(1, 1, u));
    if (Math.abs(this.camera.fov - fov) > 0.01) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
    return idx;
  }
  get shotIndex() { return this.lastShot; }
}
