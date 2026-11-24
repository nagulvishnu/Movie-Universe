// Declarative actor choreography. Authors describe stand / walk / run steps; times are derived from distance and speed,
// so characters never slide (gait phase is driven by travelled distance).
import type { Anim, ActorId, Emote, LookTarget, Prop } from './types';

export interface Opts {
  anim?: Anim; emote?: Emote; look?: LookTarget; prop?: Prop;
  yaw?: number; faceTo?: ActorId | null; y?: number; vis?: boolean; speed?: number;
}

export interface Seg {
  t0: number; t1: number;
  from: [number, number]; to: [number, number];
  y0: number; y1: number;
  yaw: number;
  moving: boolean;
  faceTo: ActorId | null;
  anim: Anim; emote: Emote; look: LookTarget; prop: Prop; vis: boolean;
  d0: number; len: number;
}

export interface Sample {
  x: number; z: number; y: number; yaw: number; faceTo: ActorId | null; moving: boolean; speed: number; dist: number;
  anim: Anim; emote: Emote; look: LookTarget; prop: Prop; vis: boolean;
}

export class Track {
  segs: Seg[] = [];
  private p: [number, number];
  private y = 0;
  private yaw: number;
  private emote: Emote = 'neutral';
  private look: LookTarget = 'none';
  private prop: Prop = 'none';
  private vis = true;
  private faceTo: ActorId | null = null;
  private t = 0;
  private d = 0;

  constructor(p: [number, number], yaw = 0, o: Opts = {}) {
    this.p = p; this.yaw = yaw;
    if (o.emote) this.emote = o.emote;
    if (o.look) this.look = o.look;
    if (o.prop) this.prop = o.prop;
    if (o.y !== undefined) this.y = o.y;
    if (o.vis !== undefined) this.vis = o.vis;
  }

  private sticky(o: Opts) {
    if (o.emote) this.emote = o.emote;
    if (o.look) this.look = o.look;
    if (o.prop) this.prop = o.prop;
    if (o.vis !== undefined) this.vis = o.vis;
  }

  /** Stand (or hold any stationary animation) for `dur` seconds. */
  stand(dur: number, o: Opts = {}) {
    this.sticky(o);
    if (o.yaw !== undefined) this.yaw = o.yaw;
    this.faceTo = o.faceTo === undefined ? this.faceTo : o.faceTo;
    const y1 = o.y ?? this.y;
    this.segs.push({
      t0: this.t, t1: this.t + dur, from: this.p, to: this.p, y0: this.y, y1, yaw: this.yaw, moving: false,
      faceTo: this.faceTo, anim: o.anim ?? 'idle', emote: this.emote, look: this.look, prop: this.prop, vis: this.vis,
      d0: this.d, len: 0,
    });
    this.t += dur; this.y = y1;
    return this;
  }

  private travel(to: [number, number], dur: number, anim: Anim, o: Opts) {
    this.sticky(o);
    const dx = to[0] - this.p[0], dz = to[1] - this.p[1];
    const len = Math.hypot(dx, dz);
    if (len > 0.001 && o.yaw === undefined) this.yaw = Math.atan2(dx, dz);
    if (o.yaw !== undefined) this.yaw = o.yaw;
    this.faceTo = o.faceTo === undefined ? null : o.faceTo;
    const y1 = o.y ?? this.y;
    this.segs.push({
      t0: this.t, t1: this.t + dur, from: this.p, to, y0: this.y, y1, yaw: this.yaw, moving: len > 0.001, faceTo: this.faceTo,
      anim, emote: this.emote, look: this.look, prop: this.prop, vis: this.vis, d0: this.d, len,
    });
    this.t += dur; this.d += len; this.p = to; this.y = y1;
    return this;
  }

  walk(to: [number, number], o: Opts = {}) {
    const len = Math.hypot(to[0] - this.p[0], to[1] - this.p[1]);
    return this.travel(to, Math.max(0.05, len / (o.speed ?? 1.35)), o.anim ?? 'walk', o);
  }
  run(to: [number, number], o: Opts = {}) {
    const len = Math.hypot(to[0] - this.p[0], to[1] - this.p[1]);
    return this.travel(to, Math.max(0.05, len / (o.speed ?? 3.6)), o.anim ?? 'run', o);
  }
  /** Move over an explicit duration with a given animation (crawl, pull, slide...). */
  go(to: [number, number], dur: number, o: Opts = {}) {
    return this.travel(to, dur, o.anim ?? 'idle', o);
  }
  /** pad until absolute time t using the last pose */
  until(t: number, o: Opts = {}) {
    if (t > this.t) this.stand(t - this.t, { anim: this.segs.length ? this.segs[this.segs.length - 1].anim === 'walk' || this.segs[this.segs.length - 1].anim === 'run' ? 'idle' : this.segs[this.segs.length - 1].anim : 'idle', ...o });
    return this;
  }
  get duration() { return this.t; }

  at(t: number): Sample {
    const s = this.segs;
    let seg = s[s.length - 1];
    if (!seg) return { x: 0, z: 0, y: 0, yaw: 0, faceTo: null, moving: false, speed: 0, dist: 0, anim: 'idle', emote: 'neutral', look: 'none', prop: 'none', vis: true };
    if (t < s[0].t0) seg = s[0];
    else for (let i = 0; i < s.length; i++) if (t >= s[i].t0 && t < s[i].t1) { seg = s[i]; break; }
    const span = Math.max(0.0001, seg.t1 - seg.t0);
    const f = t >= seg.t1 ? 1 : t <= seg.t0 ? 0 : (t - seg.t0) / span;
    const x = seg.from[0] + (seg.to[0] - seg.from[0]) * f;
    const z = seg.from[1] + (seg.to[1] - seg.from[1]) * f;
    const k = f * f * (3 - 2 * f);
    const y = seg.y0 + (seg.y1 - seg.y0) * (seg.moving ? f : k);
    return {
      x, z, y, yaw: seg.yaw, faceTo: seg.faceTo, moving: seg.moving && t < seg.t1, speed: seg.moving ? seg.len / span : 0,
      dist: seg.d0 + seg.len * f, anim: seg.anim, emote: seg.emote, look: seg.look, prop: seg.prop, vis: seg.vis,
    };
  }
}

export const track = (p: [number, number], yaw = 0, o: Opts = {}) => new Track(p, yaw, o);
