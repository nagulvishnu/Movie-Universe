import type { ActorSpec, Beat, Cam, CharId, EnvName, LightName, MusicCue, Pt, SceneInfo, Vec3 } from "./types";

export const SCENES: SceneInfo[] = [];
export const BEATS: Beat[] = [];

export const PI = Math.PI;
export const H = Math.PI / 2;

// ---- camera helpers (relative to character heads where possible) ----
export const rel = (a: CharId | "mid", o: Vec3, w = false): Pt => ({ a, o, w });
export const C = (p: Pt, t: Pt, fov = 35): Cam => ({ p, t, fov });
/** close-up on a face */
export const cu = (id: CharId, d = 0.75, side = 0.1, h = 0, fov = 30): Cam => C(rel(id, [side, h, d]), rel(id, [0, -0.01, 0]), fov);
/** medium shot */
export const ms = (id: CharId, d = 1.7, side = 0.25, h = -0.05, fov = 34): Cam => C(rel(id, [side, h, d]), rel(id, [0, -0.3, 0]), fov);
/** over-the-shoulder: camera behind `f`, looking at `t` */
export const ots = (f: CharId, t: CharId, d = 0.7, side = 0.3, h = 0.08, fov = 30): Cam => C(rel(f, [side, h, -d]), rel(t, [0, -0.02, 0]), fov);
/** profile view of a character */
export const prof = (id: CharId, d = 1.0, fwd = 0, h = 0, fov = 30): Cam => C(rel(id, [d, h, fwd]), rel(id, [0, -0.02, fwd * 0.3]), fov);
/** two shot, world-aligned offsets around the midpoint */
export const two = (o: Vec3, t: Vec3 = [0, -0.2, 0], fov = 34): Cam => C(rel("mid", o, true), rel("mid", t, true), fov);
/** free camera in world space */
export const W = (p: Vec3, t: Vec3, fov = 36): Cam => C(p, t, fov);

export const a = (p: Vec3, ry: ActorSpec["ry"], pose: string, ex: ActorSpec["ex"], more: Partial<ActorSpec> = {}): ActorSpec => ({ p, ry, pose, ex, ...more });

type Defaults = Partial<Beat> & { outfit?: Partial<Record<CharId, string>> };

/** Declare a scene; returns a beat adder that merges scene defaults. */
export function scene(name: string, act: string | undefined, d: Defaults) {
  const id = SCENES.length;
  SCENES.push({ id, name, act });
  let n = 0;
  return (o: Partial<Beat> & { cam: Beat["cam"]; actors?: Beat["actors"] }) => {
    const { outfit, ...def } = d;
    const actors: Beat["actors"] = {};
    for (const k of Object.keys(o.actors ?? {}) as CharId[]) {
      const spec = o.actors![k]!;
      actors[k] = { ...spec, outfit: spec.outfit ?? outfit?.[k] };
    }
    const beat = { id: `${id}.${n++}`, scene: id, env: "void" as EnvName, light: "night" as LightName, dur: 5, ...def, ...o, actors } as Beat;
    BEATS.push(beat);
    return beat;
  };
}

export const M = (v: MusicCue["v"], vol = 0.8): MusicCue => ({ v, vol });
export const chime = (t: number): [number, string] => [t, "chime"];
