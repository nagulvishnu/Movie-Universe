export type Vec3 = [number, number, number];
export type CharId = "ryan" | "anya" | "doctor";
export type Speaker = "R" | "A" | "D" | "N" | "P" | "W"; // Ryan, Anya, Doctor, Narrator, PA/phone, Written (read in Anya's voice)

export type Pt = Vec3 | { a: CharId | "mid"; o: Vec3; w?: boolean };
export interface Cam {
  p: Pt;
  t: Pt;
  fov?: number;
}

export type EnvName =
  | "station"
  | "bookstore"
  | "street"
  | "beach"
  | "lighthouse"
  | "ryanHome"
  | "anyaHome"
  | "studio"
  | "hospital"
  | "void";

export type LightName =
  | "stationRain"
  | "bookWarm"
  | "dayCoast"
  | "golden"
  | "sunset"
  | "dusk"
  | "night"
  | "sunrise"
  | "hospital"
  | "roomDay"
  | "roomWarm"
  | "roomNight"
  | "rainDay"
  | "overcast";

export type LookTarget = "camera" | CharId | "down" | "up" | "left" | "right" | "away" | "sea" | Vec3;

export type PropName = string;

export interface ActorSpec {
  p: Vec3;
  to?: Vec3;
  ry?: number | CharId | Vec3; // yaw radians, or face target
  pose?: string;
  ex?: string | [number, string][];
  look?: LookTarget;
  r?: PropName;
  l?: PropName;
  outfit?: string;
  wear?: string[];
}

export type MusicVariant =
  | "off"
  | "piano"
  | "pianoSparse"
  | "guitar"
  | "strings"
  | "full"
  | "peak"
  | "ambient"
  | "sad"
  | "sadStrings"
  | "tension"
  | "light"
  | "box";

export interface MusicCue {
  v: MusicVariant;
  vol?: number;
}

export interface Beat {
  id: string;
  scene: number;
  env: EnvName;
  v?: string;
  light: LightName;
  dur: number;
  cam: [Cam, Cam?];
  dof?: number;
  shake?: number;
  lin?: boolean;
  actors: Partial<Record<CharId, ActorSpec>>;
  lines?: ([Speaker, string] | [Speaker, string, string] | number)[];
  doc?: string[];
  doc2?: string;
  lead?: number;
  music?: MusicCue;
  amb?: string[];
  fx?: [number, string][];
  fade?: "in" | "out" | "both" | "none";
  card?: { title: string; sub?: string; big?: boolean };
  look?: "flash" | "rec" | "normal";
  caption?: string;
  rain?: number;
  credits?: boolean;
  fin?: string; // final text card
  tc?: string; // rec timecode label
}

export interface SceneInfo {
  id: number;
  name: string;
  act?: string;
}

export interface LineEvent {
  at: number; // absolute film time
  end: number;
  speaker: Speaker;
  text: string;
  label?: string;
}

export interface TimedBeat {
  beat: Beat;
  start: number;
  end: number;
  lines: LineEvent[];
  index: number;
}
