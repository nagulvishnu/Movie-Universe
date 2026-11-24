// Screenplay authoring helpers: dialogue sequencer + shot constructors.
import type { ActorId, Line, SceneDef, Shot, SpeakerId, SpeechStyle, V3, Emote } from './types';

export const estimateDur = (l: { text: string; style?: SpeechStyle; dur?: number }) =>
  l.dur ?? Math.max(1.3, l.text.length / (l.style === 'whisper' ? 11 : 13.5) + 0.7);

type Row = [SpeakerId, string, ({ style?: SpeechStyle; gap?: number; emote?: Emote; dur?: number; label?: string }) | undefined];
export interface Seq { lines: Line[]; at: number[]; end: number }

/** Sequence dialogue lines automatically: each starts after the previous ends (+gap). */
export function seq(id: string, start: number, rows: (Row | [SpeakerId, string] | [SpeakerId, string, { style?: SpeechStyle; gap?: number; emote?: Emote; dur?: number; label?: string }])[]): Seq {
  const lines: Line[] = [], at: number[] = [];
  let t = start;
  rows.forEach((r, i) => {
    const o = (r[2] ?? {}) as { style?: SpeechStyle; gap?: number; emote?: Emote; dur?: number; label?: string };
    const line: Line = { id: `${id}_${String(i + 1).padStart(2, '0')}`, at: t, speaker: r[0], text: r[1], style: o.style, emote: o.emote, dur: o.dur, label: o.label };
    if (r[0] === 'narrator') line.style = o.style ?? 'narration';
    lines.push(line); at.push(t);
    t += estimateDur(line) + (o.gap ?? 0.55);
  });
  return { lines, at, end: t };
}

export const merge = (...s: Seq[]) => s.flatMap((x) => x.lines);

// ----- shots -----
export const fixed = (at: number, from: V3, to: V3 | null, look: V3, lookTo?: V3, o: Partial<Shot> = {}): Shot => ({ at, mode: 'fixed', from, to: to ?? from, lookFrom: look, lookTo: lookTo ?? look, fov: 45, ...o });
export const fixedOn = (at: number, from: V3, to: V3 | null, lookAt: ActorId, o: Partial<Shot> = {}): Shot => ({ at, mode: 'fixed', from, to: to ?? from, lookAt, fov: 38, ...o });
export const orbit = (at: number, subject: ActorId, dist: number, h = 0.05, side = 0, o: Partial<Shot> = {}): Shot => ({ at, mode: 'orbit', subject, dist, h, side, fov: 32, ...o });
export const close = (at: number, subject: ActorId, side = 0.35, o: Partial<Shot> = {}): Shot => orbit(at, subject, 1.15, 0.02, side, { dist2: 0.95, fov: 28, ...o });
export const ecu = (at: number, subject: ActorId, side = 0.2, o: Partial<Shot> = {}): Shot => orbit(at, subject, 0.62, 0.02, side, { dist2: 0.55, fov: 24, lookOff: [0, -0.005, 0], ...o });
export const medium = (at: number, subject: ActorId, side = 0.5, o: Partial<Shot> = {}): Shot => orbit(at, subject, 2.7, -0.15, side, { dist2: 2.4, fov: 36, lookOff: [0, -0.2, 0], ...o });
export const two = (at: number, dist = 2.4, side = 1, o: Partial<Shot> = {}): Shot => ({ at, mode: 'two', subject: 'arin', other: 'mira', dist, dist2: o.dist2, side, fov: 38, h: 0.1, ...o });
export const ots = (at: number, subject: ActorId, other: ActorId, side = 1, o: Partial<Shot> = {}): Shot => ({ at, mode: 'ots', subject, other, side, dist: 0.85, dist2: 0.75, h: 0.1, fov: 34, ...o });
export const follow = (at: number, subject: ActorId, from: V3, to: V3, o: Partial<Shot> = {}): Shot => ({ at, mode: 'track', subject, from, to, fov: 38, ...o });

export const sc = (s: SceneDef): SceneDef => s;
/** Make sure the scene is at least `min` seconds and long enough for its dialogue. */
export const dur = (min: number, ...s: Seq[]) => Math.max(min, ...s.map((x) => x.end + 1.6));

export const light = (p: string, o?: Record<string, unknown>, to?: Record<string, unknown>) => ({ p, o, to });

/** Automatic shot coverage: cut to the speaker's shot when the speaker changes (min spacing 2.2 s). */
export function cover(d: Seq, f: (speaker: SpeakerId, at: number, i: number) => Shot | null, leadIn = 0.1): Shot[] {
  const out: Shot[] = [];
  let last: SpeakerId | null = null, lastAt = -99;
  d.lines.forEach((l, i) => {
    const at = Math.max(0, d.at[i] - leadIn);
    if (l.speaker === last || at - lastAt < 2.2) return;
    const s = f(l.speaker, at, i);
    if (s) { out.push(s); last = l.speaker; lastAt = at; }
  });
  return out;
}
export const sortShots = (s: Shot[]) => s.sort((a, b) => a.at - b.at);
