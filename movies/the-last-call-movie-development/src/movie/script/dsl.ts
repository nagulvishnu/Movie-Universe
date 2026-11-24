import { CAST } from "../../characters/cast";
import type { ActorId, ActorSpec, CamSpec, Emotion, LineDef, Pose, ShotDef, Vec3 } from "../types";

export const PI = Math.PI;

export const A = (p: Vec3, ry: number, pose: Pose = "stand", em: Emotion = "neutral", o: Partial<ActorSpec> = {}): ActorSpec => ({ p, ry, pose, em, ...o });

/** spoken line */
export const L = (w: LineDef["w"], t: string, o: Partial<LineDef> = {}): LineDef => ({ w, t, ...o });
/** voice heard over a telephone line (speaker not on screen) */
export const V = (w: LineDef["w"], t: string, o: Partial<LineDef> = {}): LineDef => ({ w, t, fx: "phone", f: null, tag: "ON PHONE", ...o });
/** recording / off-screen voice */
export const R = (w: LineDef["w"], t: string, o: Partial<LineDef> = {}): LineDef => ({ w, t, fx: "record", f: null, tag: "RECORDING", ...o });

const headY = (who: ActorId, sit: boolean) => (sit ? 1.26 : 1.68) * CAST[who].scale;

interface CamO {
  d?: number;
  x?: number;
  y?: number;
  push?: number;
  fov?: number;
  shake?: number;
  sit?: boolean;
  roll?: number;
  fov2?: number;
}

/** Close-up of an actor's face (actor-relative, follows them). */
export const cu = (who: ActorId, o: CamO = {}): CamSpec => {
  const y = o.y ?? headY(who, !!o.sit);
  const d = o.d ?? 0.85;
  const x = o.x ?? 0.12;
  return { on: who, at: who, p: [x, y, d], p2: o.push ? [x, y, d - o.push] : undefined, fov: o.fov ?? 26, fov2: o.fov2, shake: o.shake, roll: o.roll };
};

/** Medium shot */
export const ms = (who: ActorId, o: CamO = {}): CamSpec => {
  const y = o.y ?? headY(who, !!o.sit) - 0.05;
  const d = o.d ?? 2.1;
  const x = o.x ?? 0.5;
  return { on: who, at: who, atOff: [0, -0.2, 0], p: [x, y, d], p2: o.push ? [x, y, d - o.push] : undefined, fov: o.fov ?? 32, shake: o.shake, roll: o.roll, fov2: o.fov2 };
};

/** Over-the-shoulder: camera behind `from`, looking at `to`. */
export const ots = (from: ActorId, to: ActorId, o: CamO = {}): CamSpec => {
  const y = o.y ?? headY(from, !!o.sit) + 0.04;
  const d = o.d ?? 0.8;
  const x = o.x ?? 0.3;
  return { on: from, at: to, p: [x, y, -d], p2: o.push ? [x, y, -d + o.push] : undefined, fov: o.fov ?? 30, shake: o.shake, roll: o.roll };
};

/** Static camera from absolute points. */
export const cam = (p: Vec3, look: Vec3, o: Partial<CamSpec> = {}): CamSpec => ({ p, look, ...o });

export const S = (c: CamSpec, o: Omit<ShotDef, "cam"> = {}): ShotDef => ({ cam: c, ...o });

export const VOID: CamSpec = { p: [0, 1, 5], look: [0, 1, 0], fov: 35 };
export const blackShot = (d: number, o: Omit<ShotDef, "cam" | "d" | "black"> = {}): ShotDef => ({ cam: VOID, d, black: true, ...o });
