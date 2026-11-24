// Shared type definitions for the film timeline, scenes and direction.
export type V3 = [number, number, number];

export type GodId =
  | 'atum' | 'ra' | 'shu' | 'tefnut' | 'geb' | 'nut' | 'osiris' | 'isis' | 'set' | 'nephthys'
  | 'horus' | 'horusChild' | 'anubis' | 'thoth' | 'maat' | 'amun' | 'ptah' | 'khepri' | 'hathor'
  | 'sekhmet' | 'bastet' | 'mut' | 'khonsu' | 'neith' | 'sobek' | 'khnum' | 'min' | 'taweret'
  | 'bes' | 'seshat' | 'serqet' | 'renenutet' | 'nefertum' | 'wepwawet' | 'sokar' | 'nun'
  | 'frogGod' | 'snakeGoddess' | 'deceased' | 'ramRa' | 'amunRa';

export type EnvId =
  | 'void' | 'nun' | 'mound' | 'lotus' | 'cosmos' | 'heavens' | 'nile' | 'heliopolis' | 'marsh'
  | 'battlefield' | 'temple' | 'palace' | 'judgement' | 'duat' | 'fields';

export type Anim =
  | 'idle' | 'walk' | 'raise' | 'point' | 'fight' | 'mourn' | 'sit' | 'pray' | 'float' | 'bow'
  | 'kneel' | 'cast' | 'carry' | 'strike' | 'cheer' | 'rest' | 'present' | 'stride' | 'crouch';

export type Emote = 'calm' | 'angry' | 'sad' | 'joy' | 'stern';

export interface CastDef {
  id: GodId;
  at: V3;
  to?: V3;
  face?: number;
  anim?: Anim;
  s?: number;
  emote?: Emote;
  aura?: string;
  tint?: string;
  enter?: number; // fraction of scene when the character appears
  exit?: number;
}

export type PropKind =
  | 'barque' | 'apep' | 'ammit' | 'scale' | 'chest' | 'sarcophagus' | 'sun' | 'wingdisk' | 'ankh'
  | 'feather' | 'heart' | 'eyeofra' | 'scarab' | 'benben' | 'obelisk' | 'throne' | 'jars' | 'wheel'
  | 'nutarch' | 'cow' | 'hippo' | 'stoneship' | 'lotus' | 'canopic' | 'senet' | 'altar' | 'stela'
  | 'bier' | 'djed' | 'shrine' | 'boat' | 'egg' | 'moon' | 'tree' | 'flame' | 'table' | 'gate' | 'sandbank';

export interface PropDef {
  kind: PropKind;
  at: V3;
  to?: V3;
  s?: number;
  ry?: number;
  a?: number; // kind-specific parameter (start value)
  a2?: number; // end value, interpolated over [t0,t1] of the scene
  t0?: number;
  t1?: number;
  color?: string;
  enter?: number;
  exit?: number;
}

export type FxKind = 'motes' | 'sparks' | 'embers' | 'sand' | 'stars' | 'burst' | 'rain' | 'beam' | 'rings' | 'lightning' | 'rays' | 'mist';

export interface FxDef {
  k: FxKind;
  at?: V3;
  to?: V3;
  color?: string;
  n?: number;
  area?: V3;
  size?: number;
  speed?: number;
  enter?: number;
  exit?: number;
}

export type CamKind = 'push' | 'pull' | 'orbit' | 'rise' | 'fall' | 'pan' | 'still' | 'low' | 'track';

export interface CamSpec {
  k: CamKind;
  d?: number;
  h?: number;
  az?: number;
  spin?: number;
  fov?: number;
  w?: number;
  focus?: V3;
  pan?: number;
}

export type CueId =
  | 'dark' | 'nun' | 'creation' | 'heliopolis' | 'solar' | 'divine' | 'pantheon' | 'thebes' | 'tragedy'
  | 'marsh' | 'war' | 'tribunal' | 'duat' | 'judgement' | 'apep' | 'dawn' | 'finale' | 'credits' | 'title';

export type AmbId = 'wind' | 'water' | 'nile' | 'temple' | 'underworld' | 'fire' | 'storm' | 'night' | 'cosmic' | 'battle';

export type SfxId =
  | 'thunder' | 'impact' | 'whoosh' | 'clash' | 'roar' | 'hiss' | 'door' | 'shimmer' | 'transform'
  | 'solar' | 'step' | 'splash' | 'bell' | 'gong' | 'wing' | 'boom' | 'chant';

export interface SceneDef {
  id: string;
  env: EnvId;
  variant?: string;
  music: CueId;
  amb?: AmbId[];
  focus?: V3;
  cam: CamSpec[];
  cast?: CastDef[];
  props?: PropDef[];
  fx?: FxDef[];
  hits?: [number, SfxId][];
  flash?: number[];
  card?: { kicker: string; title: string; sub?: string };
  title?: boolean;
  credits?: boolean;
  hold?: number; // fixed duration (scenes without narration)
  lead?: number;
  tail?: number;
}

export interface ChapterMeta {
  key: string;
  num: string;
  title: string;
  subtitle: string;
}

export interface TLine {
  text: string;
  tone: 'normal' | 'dramatic' | 'soft';
  start: number;
  dur: number;
  sceneIdx: number;
}

export interface TScene {
  def: SceneDef;
  start: number;
  dur: number;
  chapter: number;
  lines: TLine[];
}
