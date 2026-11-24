import * as THREE from "three";
import type { ActorSpec, CharId, LookTarget, Pt, TimedBeat, Vec3 } from "../film/types";
import { headHeight, type ActorState } from "./human";
import { getSpec, DEFAULT_OUTFIT } from "./characters";

const SPK: Record<string, CharId> = { R: "ryan", A: "anya", D: "doctor" };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (u: number) => u * u * (3 - 2 * u);

export interface DirectorOut {
  actors: Partial<Record<CharId, ActorState>>;
  heads: Partial<Record<CharId, THREE.Vector3>>;
  camPos: THREE.Vector3;
  camTarget: THREE.Vector3;
  fov: number;
  u: number;
}

export function createDirectorOut(): DirectorOut {
  return { actors: {}, heads: {}, camPos: new THREE.Vector3(0, 1.6, 5), camTarget: new THREE.Vector3(0, 1.4, 0), fov: 35, u: 0 };
}

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();

function rot(o: Vec3, yaw: number, out: THREE.Vector3) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return out.set(o[0] * c + o[2] * s, o[1], -o[0] * s + o[2] * c);
}

function vowelOpen(ch: string) {
  switch (ch) {
    case "a": return [0.9, 0, 0.3];
    case "e": return [0.55, 0, 0.8];
    case "i": return [0.35, 0, 0.9];
    case "o": return [0.7, 0.6, 0];
    case "u": return [0.45, 0.8, 0];
    case "w": case "q": return [0.25, 0.7, 0];
    case "m": case "b": case "p": return [0, 0, 0];
    case "f": case "v": return [0.12, 0, 0.3];
    case " ": case ",": case ".": case "?": case "!": case "…": case "-": case "—": return [0, 0, 0];
    default: return [0.22, 0, 0.2];
  }
}

function speaking(tb: TimedBeat, id: CharId, t: number) {
  const out = { env: 0, open: 0, pucker: 0, wide: 0 };
  for (const l of tb.lines) {
    if (SPK[l.speaker] !== id) continue;
    const talkEnd = l.end - 0.3;
    if (t < l.at || t > talkEnd) continue;
    const p = (t - l.at) / Math.max(0.1, talkEnd - l.at);
    const txt = l.text.toLowerCase();
    const idx = p * txt.length;
    const i0 = Math.floor(idx);
    const f = idx - i0;
    const a = vowelOpen(txt[i0] ?? " ");
    const b = vowelOpen(txt[i0 + 1] ?? " ");
    const ch = txt[i0] ?? " ";
    const pause = ch === " " || ch === "," || ch === "." || ch === "…" || ch === "—";
    out.env = pause ? 0.45 : 1;
    const s = f * f * (3 - 2 * f);
    out.open = (a[0] * (1 - s) + b[0] * s) * (0.75 + 0.25 * Math.abs(Math.sin(t * 13)));
    out.pucker = a[1] * (1 - s) + b[1] * s;
    out.wide = (a[2] * (1 - s) + b[2] * s) * 0.5;
    break;
  }
  return out;
}

function exprAt(ex: ActorSpec["ex"], u: number) {
  if (!ex) return "neutral";
  if (typeof ex === "string") return ex;
  let cur = ex[0][1];
  for (const [f, name] of ex) if (u >= f) cur = name;
  return cur;
}

let lastIndex = -1;
let snapFrames = 0;

export function direct(tb: TimedBeat, t: number, out: DirectorOut) {
  const beat = tb.beat;
  const u = clamp01((t - tb.start) / Math.max(0.01, tb.end - tb.start));
  out.u = u;
  if (tb.index !== lastIndex) {
    lastIndex = tb.index;
    snapFrames = 3;
  }
  const snap = snapFrames > 0;
  if (snapFrames > 0) snapFrames--;

  // pass 1: positions & poses
  const ids = Object.keys(beat.actors) as CharId[];
  for (const k of Object.keys(out.actors)) if (!ids.includes(k as CharId)) { delete out.actors[k as CharId]; delete out.heads[k as CharId]; }
  const pos: Partial<Record<CharId, Vec3>> = {};
  for (const id of ids) {
    const a = beat.actors[id]!;
    const p1 = a.to ?? a.p;
    pos[id] = [a.p[0] + (p1[0] - a.p[0]) * u, a.p[1] + (p1[1] - a.p[1]) * u, a.p[2] + (p1[2] - a.p[2]) * u];
  }
  for (const id of ids) {
    const a = beat.actors[id]!;
    const moving = !!a.to && Math.hypot(a.to[0] - a.p[0], a.to[2] - a.p[2]) > 0.05;
    const pose = a.pose ?? (moving ? "walk" : "stand");
    const spec = getSpec(id, a.outfit ?? DEFAULT_OUTFIT[id]);
    let yaw = 0;
    const ry = a.ry;
    const faceTo = (x: number, z: number) => Math.atan2(x - pos[id]![0], z - pos[id]![2]);
    if (typeof ry === "number") yaw = ry;
    else if (typeof ry === "string") {
      const o = beat.actors[ry];
      yaw = o ? faceTo(o.p[0] + ((o.to ?? o.p)[0] - o.p[0]) * u, o.p[2] + ((o.to ?? o.p)[2] - o.p[2]) * u) : 0;
    } else if (Array.isArray(ry)) yaw = faceTo(ry[0], ry[2]);
    else if (moving) yaw = Math.atan2(a.to![0] - a.p[0], a.to![2] - a.p[2]);
    const dist = Math.hypot(pos[id]![0] - a.p[0], pos[id]![2] - a.p[2]);
    const stride = pose === "run" ? 2.2 : 1.45;
    const st: ActorState = out.actors[id] ?? ({} as ActorState);
    st.pos = pos[id]!;
    st.yaw = yaw;
    st.pose = pose;
    st.expr = exprAt(a.ex, u);
    st.r = a.r;
    st.l = a.l;
    st.wear = a.wear ?? [];
    st.phase = (dist / stride) * Math.PI * 2;
    st.speed = moving ? 1 : 0;
    st.snap = snap;
    st.speak = speaking(tb, id, t);
    st.look = st.look ?? new THREE.Vector3();
    out.actors[id] = st;
    const h = out.heads[id] ?? new THREE.Vector3();
    const hh = headHeight(pose, spec.scale);
    out.heads[id] = h.set(pos[id]![0], pos[id]![1] + hh, pos[id]![2]);
  }

  // camera
  const [c0, c1] = beat.cam;
  const cb = c1 ?? c0;
  const k = beat.lin || !c1 ? u : ease(u);
  const resolve = (pt: Pt, o: THREE.Vector3) => {
    if (Array.isArray(pt)) return o.set(pt[0], pt[1], pt[2]);
    if (pt.a === "mid") {
      const hs = ids.filter((i) => i === "ryan" || i === "anya").map((i) => out.heads[i]!);
      if (!hs.length) return o.set(...pt.o);
      o.set(0, 0, 0);
      hs.forEach((h) => o.add(h));
      o.multiplyScalar(1 / hs.length);
      return o.add(_v.set(...pt.o));
    }
    const h = out.heads[pt.a];
    if (!h) return o.set(...pt.o);
    const yaw = out.actors[pt.a]!.yaw;
    if (pt.w) return o.copy(h).add(_v.set(...pt.o));
    return o.copy(h).add(rot(pt.o, yaw, _v));
  };
  const pa = new THREE.Vector3(), pb = new THREE.Vector3(), ta = new THREE.Vector3(), tbv = new THREE.Vector3();
  resolve(c0.p, pa); resolve(cb.p, pb); resolve(c0.t, ta); resolve(cb.t, tbv);
  out.camPos.lerpVectors(pa, pb, k);
  out.camTarget.lerpVectors(ta, tbv, k);
  out.fov = (c0.fov ?? 35) + ((cb.fov ?? c0.fov ?? 35) - (c0.fov ?? 35)) * k;

  // pass 2: look targets
  for (const id of ids) {
    const a = beat.actors[id]!;
    const st = out.actors[id]!;
    const h = out.heads[id]!;
    let look: LookTarget | undefined = a.look;
    if (look === undefined) {
      const other = ids.find((i) => i !== id && (i === "ryan" || i === "anya" || i === "doctor"));
      look = other ?? undefined;
    }
    const L = st.look!;
    let has = true;
    if (look === undefined) has = false;
    else if (look === "camera") L.copy(out.camPos);
    else if (look === "ryan" || look === "anya" || look === "doctor") {
      const o = out.heads[look];
      if (o) L.copy(o); else has = false;
    } else if (Array.isArray(look)) L.set(look[0], look[1], look[2]);
    else {
      const m: Record<string, Vec3> = { down: [0, -0.55, 0.75], up: [0, 0.7, 1.0], left: [1.6, 0.0, 1.0], right: [-1.6, 0.0, 1.0], away: [0.0, 0.0, 4], sea: [0, 0, 0] };
      if (look === "sea") L.set(0, 2.0, -80);
      else L.copy(h).add(rot(m[look] ?? [0, 0, 3], st.yaw, _v2));
    }
    if (!has) (st as { look: THREE.Vector3 | null }).look = null;
    else st.look = L;
    if (!has) out.actors[id]!.look = null;
    else (out.actors[id] as ActorState).look = L;
  }
  return out;
}
