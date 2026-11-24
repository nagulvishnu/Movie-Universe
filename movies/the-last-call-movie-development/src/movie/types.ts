export type Vec3 = [number, number, number];
export type ActorId = "daniel" | "sarah" | "emily" | "victor" | "olivia" | "boy";
export type SpeakerId =
  | ActorId
  | "narrator"
  | "caller"
  | "youngman"
  | "father"
  | "mother"
  | "girl"
  | "researcher"
  | "self";
export type Pose = "stand" | "walk" | "run" | "sit" | "drive" | "lie" | "crouch";
export type ArmPose =
  | "rest"
  | "lap"
  | "ear"
  | "steer"
  | "desk"
  | "cover"
  | "hold"
  | "point"
  | "think"
  | "cross"
  | "brace"
  | "run";
export type Emotion =
  | "neutral"
  | "tired"
  | "sad"
  | "worry"
  | "fear"
  | "shock"
  | "suspicion"
  | "angry"
  | "cry"
  | "smile";
export type HandItem = "none" | "phone" | "photo" | "handset" | "torch" | "folder";
export type VoiceFx = "none" | "phone" | "whisper" | "distort" | "echo" | "record";
export type EnvId =
  | "void"
  | "road"
  | "apartment"
  | "police"
  | "park"
  | "exchangeExt"
  | "exchangeInt"
  | "victor"
  | "archive"
  | "facility"
  | "control"
  | "bedroom";
export type MusicId =
  | "mystery"
  | "daniel"
  | "investigation"
  | "tension"
  | "underground"
  | "revelation"
  | "ending"
  | "credits"
  | "sting";
export type AmbId =
  | "rain"
  | "roomtone"
  | "hum"
  | "wind"
  | "machinery"
  | "car"
  | "city"
  | "birds"
  | "night"
  | "exchange";
export type RingKind = "none" | "old" | "mobile" | "red" | "many";

export interface ActorSpec {
  p: Vec3;
  to?: Vec3;
  ry: number;
  ryTo?: number;
  pose: Pose;
  em: Emotion;
  arms?: ArmPose;
  hand?: HandItem;
  look?: ActorId | Vec3 | null;
}

export interface CamSpec {
  p: Vec3;
  p2?: Vec3;
  /** absolute look point */
  look?: Vec3;
  look2?: Vec3;
  /** track an actor's head */
  at?: ActorId;
  /** offset added to tracked head */
  atOff?: Vec3;
  /** positions are in this actor's local frame (x left, z forward) */
  on?: ActorId;
  fov?: number;
  fov2?: number;
  shake?: number;
  roll?: number;
}

export interface LineDef {
  w: SpeakerId;
  t: string;
  em?: Emotion;
  fx?: VoiceFx;
  gap?: number;
  /** actor whose mouth moves */
  f?: ActorId | null;
  /** subtitle prefix, e.g. (ON PHONE) */
  tag?: string;
}

export type Cue = [number, string, Record<string, number | string>?];

export interface Card {
  kind: "studio" | "title" | "act" | "loc" | "text" | "credits" | "end" | "tag";
  text: string;
  sub?: string;
}

export interface ShotDef {
  d?: number;
  cam: CamSpec;
  a?: Partial<Record<ActorId, Partial<ActorSpec> | null>>;
  l?: LineDef[];
  cues?: Cue[];
  st?: Record<string, string | number | boolean>;
  ring?: RingKind;
  card?: Card;
  music?: MusicId | "stop";
  amb?: AmbId[];
  lead?: number;
  tail?: number;
  fi?: number;
  fo?: number;
  black?: boolean;
}

export interface SceneDef {
  id: string;
  title: string;
  env: EnvId;
  music?: MusicId | "stop";
  amb?: AmbId[];
  fadeIn?: number;
  fadeOut?: number;
  shots: ShotDef[];
}

export interface CLine {
  id: string;
  w: SpeakerId;
  text: string;
  start: number;
  end: number;
  fx: VoiceFx;
  em: Emotion;
  face: ActorId | null;
  tag?: string;
  sceneIdx: number;
}
export interface CCue {
  t: number;
  n: string;
  o: Record<string, number | string>;
}
export interface CShot {
  idx: number;
  sceneIdx: number;
  start: number;
  end: number;
  dur: number;
  cam: CamSpec;
  actors: Partial<Record<ActorId, ActorSpec>>;
  st: Record<string, string | number | boolean>;
  ring: RingKind;
  card?: Card;
  music: MusicId | null;
  amb: AmbId[];
  lines: CLine[];
  fi: number;
  fo: number;
  black: boolean;
}
export interface CScene {
  id: string;
  title: string;
  env: EnvId;
  start: number;
  end: number;
  fadeIn: number;
  fadeOut: number;
}
export interface CMovie {
  duration: number;
  scenes: CScene[];
  shots: CShot[];
  lines: CLine[];
  cues: CCue[];
}
