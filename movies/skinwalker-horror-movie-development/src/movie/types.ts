// Shared types + tiny authoring helpers for the film script.

export type V3 = [number, number, number];
export type CharId =
  | 'adam' | 'lena' | 'noah' | 'emily' | 'shop' | 'hunter' | 'creature'
  | 'father' | 'mother' | 'sister' | 'boy' | 'car';

export type Anim =
  | 'idle' | 'walk' | 'run' | 'sit' | 'drive' | 'sleep' | 'fear' | 'crouch' | 'cover'
  | 'hold' | 'aim' | 'point' | 'reach' | 'stand' | 'stalk' | 'sprint' | 'limp'
  | 'slump' | 'lie' | 'laugh' | 'cry' | 'wake' | 'lean' | 'peer' | 'wakePhone';

export type Expr = 'neutral' | 'fear' | 'sad' | 'angry' | 'smile' | 'shock' | 'creepy' | 'tired' | 'worry' | 'sleep';

/** Look target: world point, or an actor id ("adam" = head, "adam:1.0" = at height 1.0m) */
export type Look = V3 | string | null;

export type VoiceId =
  | 'adam' | 'lena' | 'noah' | 'emily' | 'shop' | 'hunter' | 'brother' | 'mom' | 'adamMom'
  | 'lenaBro' | 'emilyDad' | 'radio' | 'creature' | 'father' | 'boy' | 'mother' | 'sister';

export interface Key {
  t: number;
  p?: [number, number]; // ground x,z   (interpolated)
  y?: number;           // height offset (interpolated)
  r?: number;           // yaw radians   (interpolated, shortest arc)
  u?: number;           // uncanny amount 0..2 (interpolated)
  a?: Anim;             // step
  e?: Expr;             // step
  l?: Look;             // step
  v?: 0 | 1;            // visibility (step)
  sp?: number;          // gait speed multiplier (step)
}

export interface ActorDef {
  char: CharId;
  keys: Key[];
  scale?: number;
  rideOn?: string; // actor id (e.g. the car): p/r are local to that actor
}

export interface Shot {
  t: number;
  d: number;
  p0: V3;
  p1?: V3;
  l0: Look;
  l1?: Look;
  fov?: number;
  shake?: number;
  roll?: number;
}

export type FxName = 'radio' | 'phone' | 'recording' | 'whisper' | 'mimic' | 'far' | 'inner';

export interface Line {
  t: number;
  who: string; // actor id whose mouth moves ('' = nobody on screen)
  voice: VoiceId;
  text: string;
  fx?: FxName;
  dur?: number;
  rate?: number;
  pan?: number;
  id?: string; // assigned automatically
}

export interface Cue {
  t: number;
  sfx?: string;
  vol?: number;
  pan?: number;
  lp?: number;
  amb?: Partial<Record<'wind' | 'rain' | 'crickets' | 'drone' | 'room' | 'engine' | 'fire' | 'cave', number>>;
  ramp?: number;
  music?: MusicMode;
  mvol?: number;
  light?: 'on' | 'off' | 'flicker';
  d?: number;
  then?: 'on' | 'off';
  bolt?: boolean;
  shake?: number;
}

export type MusicMode = 'none' | 'calm' | 'dread' | 'tension' | 'chase' | 'sad' | 'drone';

export interface Card {
  t: number;
  d: number;
  text: string;
  sub?: string;
  style: 'title' | 'time' | 'end' | 'credits' | 'small';
}

export type EnvKind = 'forest' | 'road' | 'gas' | 'cabin' | 'hunt' | 'cave' | 'ranger' | 'home' | 'black';
export type TimeOfDay = 'day' | 'overcast' | 'dusk' | 'night' | 'dawn' | 'storm';

export interface EnvOpts {
  time?: TimeOfDay;
  fog?: number;
  rain?: number;
  interior?: boolean;       // interior lights start on
  footprints?: boolean;
  caveEntrance?: boolean;
  photos?: 'discover' | 'five';
  glassBroken?: boolean;
  barricade?: boolean;
  grade?: 'flashback' | 'normal';
  exposure?: number;
  clock?: string;
  windowBroken?: boolean;
  tallGrass?: boolean;
  noCar?: boolean;
  doorOpen?: number;
  boards?: boolean;
}

export interface ObjAnim {
  obj: string;                 // key in env.objs
  rot?: 'x' | 'y' | 'z';
  keys?: [number, number][];   // time, value (linear)
  vis?: [number, boolean][];   // time, visible (step)
}

export interface SceneDef {
  id: string;
  title: string;
  env: EnvKind;
  opts?: EnvOpts;
  dur: number;
  fin?: number;
  fout?: number;
  actors: Record<string, ActorDef>;
  shots: Shot[];
  lines: Line[];
  cues: Cue[];
  cards?: Card[];
  amb?: Cue['amb'];
  music?: MusicMode;
  mvol?: number;
  flashlights?: { actor: string; from?: number; to?: number; power?: number }[];
  anims?: ObjAnim[];
  burn?: { actor: string; from: number; to: number };
  start?: number; // computed
}

// ---------- authoring helpers ----------
export const K = (t: number, x?: number, z?: number, r?: number, a?: Anim, extra: Partial<Key> = {}): Key => {
  const k: Key = { t, ...extra };
  if (x !== undefined && z !== undefined) k.p = [x, z];
  if (r !== undefined) k.r = r;
  if (a) k.a = a;
  return k;
};
/** keyframe without moving */
export const Ka = (t: number, a: Anim, extra: Partial<Key> = {}): Key => ({ t, a, ...extra });

export const S = (
  t: number, d: number, p0: V3, l0: Look,
  o: { to?: V3; lto?: Look; fov?: number; shake?: number; roll?: number } = {},
): Shot => ({ t, d, p0, l0, p1: o.to, l1: o.lto, fov: o.fov, shake: o.shake, roll: o.roll });

export const L = (
  t: number, who: string, voice: VoiceId, text: string,
  o: { fx?: FxName; dur?: number; rate?: number; pan?: number } = {},
): Line => ({ t, who, voice, text, ...o });

export const PI = Math.PI;
export const face = (fx: number, fz: number, tx: number, tz: number) => Math.atan2(tx - fx, tz - fz);

export const wordCount = (s: string) => s.trim().split(/\s+/).length;
export const lineDur = (l: Line) => l.dur ?? Math.max(1.6, 0.7 + wordCount(l.text) * 0.42);
export const talkTime = (l: Line) => Math.min(lineDur(l), 0.45 + (wordCount(l.text) * 0.36) / (l.rate ?? 1));
