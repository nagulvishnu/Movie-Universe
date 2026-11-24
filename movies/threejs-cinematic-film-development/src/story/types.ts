// Screenplay data model. Screenplay content (story/*.ts) is fully separate from rendering (engine/*.ts).
import type { Track } from './track';

export type V3 = [number, number, number];
export type ActorId = 'arin' | 'mira';
export type SpeakerId = 'arin' | 'mira' | 'narrator' | 'scientist' | 'radio' | 'mystery' | 'video';

export type Anim =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sitGround' | 'crouch' | 'handsUp' | 'aim' | 'point' | 'photo'
  | 'radio' | 'cry' | 'comfort' | 'reach' | 'hang' | 'prone' | 'sleep' | 'lookAround' | 'work' | 'brace'
  | 'shout' | 'pull' | 'crawl' | 'sitCry';

export type Emote =
  | 'neutral' | 'sad' | 'happy' | 'smile' | 'worried' | 'angry' | 'determined' | 'fear' | 'surprised'
  | 'cry' | 'tired' | 'sleep';

export type Prop = 'none' | 'photo' | 'radio' | 'gun' | 'flashlight' | 'drawing' | 'camcorder' | 'bracelet' | 'note' | 'mic';
export type LookTarget = ActorId | 'cam' | 'none' | V3;

export type EnvKey =
  | 'city' | 'highway' | 'supermarket' | 'hospital' | 'village' | 'bridge' | 'facility' | 'station' | 'monitor';

export type SpeechStyle = 'normal' | 'whisper' | 'shout' | 'distress' | 'radio' | 'narration';

export interface Line {
  id: string;
  at: number; // seconds from scene start
  speaker: SpeakerId;
  text: string;
  style?: SpeechStyle;
  dur?: number; // override estimated duration
  emote?: Emote;
  /** Optional recorded voice file. Otherwise public/audio/voice/manifest.json is consulted, then speech synthesis is used. */
  voiceFile?: string;
  /** Override speaker label */
  label?: string;
}

export interface SfxCue { at: number; name: string; vol?: number }

export interface Shot {
  at: number;
  mode: 'orbit' | 'two' | 'ots' | 'fixed' | 'track';
  subject?: ActorId;
  other?: ActorId;
  /** orbit: distance from subject head (to dist2). two: extra distance. ots: distance behind subject */
  dist?: number; dist2?: number;
  /** vertical offset */
  h?: number; h2?: number;
  /** azimuth side (rad) relative to subject's facing (or world if abs) */
  side?: number; side2?: number;
  abs?: boolean;
  /** fixed: world positions. track: offsets from subject */
  from?: V3; to?: V3;
  lookFrom?: V3; lookTo?: V3;
  lookAt?: ActorId;
  lookOff?: V3;
  fov?: number; fov2?: number;
  shake?: number;
  roll?: number;
}

export interface LightSpec { p: string; o?: Record<string, unknown>; to?: Record<string, unknown> }

export interface FxSpec {
  rain?: number; dust?: number; debris?: number; wind?: number; lightning?: number[];
  embers?: V3; fire?: V3; sparks?: V3;
}

export interface Card { at: number; dur: number; text: string; sub?: string; style?: 'title' | 'act' | 'place' | 'clock' | 'end' | 'terminal' }

export type Transition = 'cut' | 'dip' | 'fade' | 'slow' | 'flash' | 'black';

export interface SceneDef {
  id: string;
  name: string;
  act: number;
  env: EnvKey;
  mode?: string;
  params?: Record<string, number>;
  dur: number;
  actors?: Partial<Record<ActorId, Track>>;
  shots: Shot[];
  dialogue?: Line[];
  music: string;
  /** additional music changes during the scene */
  mus?: { at: number; name: string }[];
  sfx?: SfxCue[];
  ambience: Record<string, number>;
  light: LightSpec;
  fx?: FxSpec;
  cards?: Card[];
  surface?: 'concrete' | 'grass' | 'wood' | 'metal' | 'tile' | 'wet' | 'gravel';
  fadeIn?: Transition;
  fadeOut?: Transition;
  overlay?: 'credits';
  flashlight?: ActorId;
  /** hide letterbox (not used by default) */
  holdBlack?: number;
}
