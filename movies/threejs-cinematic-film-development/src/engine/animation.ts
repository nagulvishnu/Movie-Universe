// Procedural pose library. Poses are sets of joint angles (radians); the Character blends toward them every frame.
import type { Anim, Prop } from '../story/types';

export const KEYS = [
  'pelvisY', 'bodyPitch', 'bodyY', 'pelvisYaw', 'spineX', 'spineY', 'spineZ', 'chestX',
  'headX', 'headY', 'headZ',
  'lShX', 'lShZ', 'lElX', 'rShX', 'rShZ', 'rElX',
  'lHipX', 'lHipZ', 'rHipX', 'rHipZ', 'lKnX', 'rKnX', 'lAnkX', 'rAnkX',
] as const;
export type PoseKey = (typeof KEYS)[number];
export type Pose = Record<PoseKey, number>;

export const basePose = (): Pose => {
  const p = {} as Pose;
  KEYS.forEach((k) => (p[k] = 0));
  p.pelvisY = 0.93;
  return p;
};

export interface PoseCtx { t: number; phase: number; speed: number; moving: boolean; speak: number; prop: Prop; seed: number }

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const GESTURE_OK: Anim[] = ['idle', 'lookAround', 'sit', 'sitGround'];

const PROP_ARMS: Partial<Record<Prop, Partial<Pose>>> = {
  photo: { lShX: -0.95, lShZ: -0.05, lElX: -1.5, rShX: -0.95, rShZ: 0, rElX: -1.5, headX: 0.5, spineX: 0.12 },
  drawing: { lShX: -0.95, lShZ: -0.05, lElX: -1.5, rShX: -0.95, rShZ: 0, rElX: -1.5, headX: 0.45, spineX: 0.1 },
  note: { lShX: -0.95, lShZ: -0.05, lElX: -1.5, rShX: -0.95, rShZ: 0, rElX: -1.5, headX: 0.5, spineX: 0.12 },
  camcorder: { lShX: -0.9, lElX: -1.6, rShX: -0.9, rElX: -1.6, headX: 0.3, spineX: 0.08 },
  radio: { rShX: -0.8, rElX: -1.5, lShX: -0.7, lElX: -1.2, headX: 0.12 },
  mic: { rShX: -0.9, rElX: -1.8, headX: 0.05 },
  bracelet: { rShX: -0.8, rElX: -1.6, lShX: -0.3, lElX: -0.5, headX: 0.5, spineX: 0.1 },
  gun: { rShX: -0.5, rElX: -0.9 },
  flashlight: { rShX: -0.9, rElX: -0.8 },
};
const PROP_WALK: Partial<Record<Prop, Partial<Pose>>> = {
  gun: { rShX: -0.7, rElX: -1.0 }, flashlight: { rShX: -0.9, rElX: -0.8 }, radio: { rShX: -0.7, rElX: -1.4 },
  camcorder: { rShX: -0.8, rElX: -1.4 }, drawing: { rShX: -0.7, rElX: -1.4 }, photo: { rShX: -0.7, rElX: -1.4 }, note: { rShX: -0.7, rElX: -1.4 },
  bracelet: { rShX: -0.7, rElX: -1.4 }, mic: { rShX: -0.9, rElX: -1.6 },
};

export function computePose(anim: Anim, c: PoseCtx): Pose {
  const p = basePose();
  const { t, seed } = c;
  const b = Math.sin(t * 1.6 + seed) * 0.012;
  const sway = Math.sin(t * 0.45 + seed * 2) * 0.02;
  // idle layer
  p.spineX = 0.03 + b; p.chestX = b * 0.6; p.lShZ = 0.1; p.rShZ = 0.1; p.lElX = -0.12; p.rElX = -0.15;
  p.pelvisYaw = sway; p.lHipZ = sway * 0.6; p.rHipZ = -sway * 0.6; p.spineZ = -sway * 0.5;
  p.headX = Math.sin(t * 0.6 + seed) * 0.015;
  p.headY = Math.sin(t * 0.37 + seed) * 0.03;

  const gait = c.moving && (anim === 'walk' || anim === 'run');
  let kind: Anim = anim;
  if ((anim === 'walk' || anim === 'run') && !gait) kind = 'idle';

  switch (kind) {
    case 'walk': {
      const s = clamp(c.speed / 1.35, 0.35, 1.3), f = c.phase, A = 0.5 * s;
      const sn = Math.sin(f), cs = Math.cos(f);
      p.lHipX = -A * sn; p.rHipX = A * sn;
      p.lKnX = 0.09 + 0.95 * s * Math.max(0, cs); p.rKnX = 0.09 + 0.95 * s * Math.max(0, -cs);
      p.lAnkX = -0.3 * Math.max(0, cs) * s + 0.2 * Math.max(0, -sn) * s; p.rAnkX = -0.3 * Math.max(0, -cs) * s + 0.2 * Math.max(0, sn) * s;
      p.lShX = 0.42 * s * sn; p.rShX = -0.42 * s * sn;
      p.lElX = -0.25 - 0.25 * Math.max(0, -sn); p.rElX = -0.25 - 0.25 * Math.max(0, sn);
      p.pelvisY = 0.93 + 0.022 * s * Math.cos(2 * f) - 0.01;
      p.pelvisYaw = 0.1 * s * sn; p.spineY = -0.12 * s * sn; p.spineZ = 0.025 * s * cs; p.spineX = 0.06;
      p.headY = -0.05 * s * sn + p.headY * 0.4; p.lHipZ = 0.02; p.rHipZ = -0.02;
      break;
    }
    case 'run': {
      const f = c.phase, A = 0.85, sn = Math.sin(f), cs = Math.cos(f);
      p.lHipX = -A * sn - 0.1; p.rHipX = A * sn - 0.1;
      p.lKnX = 0.3 + 1.6 * Math.max(0, cs); p.rKnX = 0.3 + 1.6 * Math.max(0, -cs);
      p.lShX = 0.9 * sn; p.rShX = -0.9 * sn; p.lElX = -1.35; p.rElX = -1.35;
      p.pelvisY = 0.9 + 0.045 * Math.cos(2 * f); p.spineX = 0.22; p.spineY = -0.18 * sn; p.pelvisYaw = 0.15 * sn; p.headX = -0.08;
      p.lShZ = 0.05; p.rShZ = 0.05;
      break;
    }
    case 'sit':
      p.pelvisY = 0.5; p.lHipX = -1.5; p.rHipX = -1.5; p.lKnX = 1.5; p.rKnX = 1.5; p.lAnkX = 0.1; p.rAnkX = 0.1;
      p.lHipZ = 0.06; p.rHipZ = -0.06; p.spineX = 0.08 + b; p.lShX = -0.45; p.rShX = -0.45; p.lElX = -0.9; p.rElX = -0.9; p.lShZ = 0.05; p.rShZ = 0.05;
      break;
    case 'sitCry': {
      const sob = Math.sin(t * 7.5) * 0.5 + Math.sin(t * 3.1) * 0.5;
      p.pelvisY = 0.5; p.lHipX = -1.5; p.rHipX = -1.5; p.lKnX = 1.5; p.rKnX = 1.5; p.lHipZ = 0.06; p.rHipZ = -0.06;
      p.lShX = -1.15; p.rShX = -1.15; p.lShZ = -0.12; p.rShZ = -0.12; p.lElX = -2.35; p.rElX = -2.35;
      p.headX = 0.5; p.spineX = 0.3 + sob * 0.02; p.chestX = 0.08 + sob * 0.03; p.spineZ = sob * 0.012; p.headZ = sob * 0.02;
      break;
    }
    case 'sitGround':
      p.pelvisY = 0.1; p.lHipX = -1.1; p.rHipX = -1.25; p.lHipZ = 0.55; p.rHipZ = -0.5; p.lKnX = 2.2; p.rKnX = 2.1;
      p.spineX = 0.15 + b; p.lShX = -0.7; p.rShX = -0.7; p.lElX = -0.9; p.rElX = -0.9; p.headX = 0.08;
      break;
    case 'crouch':
      p.pelvisY = 0.52; p.lHipX = -1.55; p.rHipX = -1.45; p.lKnX = 2.25; p.rKnX = 2.15; p.lAnkX = 0.55; p.rAnkX = 0.5; p.lHipZ = 0.12; p.rHipZ = -0.12;
      p.spineX = 0.4 + b; p.lShX = -0.8; p.rShX = -1.0; p.lElX = -0.8; p.rElX = -0.6; p.headX = -0.15;
      break;
    case 'handsUp':
      p.lShX = -0.85; p.rShX = -0.85; p.lShZ = 0.5; p.rShZ = 0.5; p.lElX = -1.95; p.rElX = -1.95; p.headX = 0.05; p.spineX = -0.02;
      p.lHipZ = 0.05; p.rHipZ = -0.05;
      break;
    case 'aim':
      p.rShX = -1.5; p.rElX = -0.08; p.lShX = -1.25; p.lShZ = -0.28; p.lElX = -0.85; p.spineX = 0.04; p.headX = 0.02; p.lHipX = -0.25; p.rHipX = 0.15; p.lKnX = 0.15; p.pelvisYaw = -0.2; p.spineY = 0.2;
      break;
    case 'point':
      p.rShX = -1.45; p.rShZ = 0.12; p.rElX = -0.06; p.spineY = 0.1;
      break;
    case 'photo': Object.assign(p, PROP_ARMS.photo); break;
    case 'radio': Object.assign(p, PROP_ARMS.radio); break;
    case 'work':
      p.lShX = -0.7; p.rShX = -0.7; p.lElX = -1.0; p.rElX = -1.0; p.lShZ = 0.12; p.rShZ = 0.12; p.headX = 0.35; p.spineX = 0.16;
      p.rShX += Math.sin(t * 2.6) * 0.12; p.lElX += Math.sin(t * 1.9) * 0.1;
      break;
    case 'cry': {
      const sob = Math.sin(t * 7.5) * 0.5 + Math.sin(t * 3.1) * 0.5;
      p.lShX = -1.15; p.rShX = -1.15; p.lShZ = -0.12; p.rShZ = -0.12; p.lElX = -2.35; p.rElX = -2.35;
      p.headX = 0.5; p.spineX = 0.28 + sob * 0.02; p.chestX = 0.08 + sob * 0.03; p.spineZ = sob * 0.012; p.headZ = sob * 0.02;
      break;
    }
    case 'comfort':
      p.rShX = -1.15; p.rShZ = 0.15; p.rElX = -0.35; p.spineX = 0.1; p.spineY = 0.15; p.headY = 0.1; p.headX = 0.1; p.lShX = -0.1; p.lElX = -0.3;
      break;
    case 'reach':
      p.rShX = -1.9; p.rElX = -0.1; p.lShX = -0.3; p.lElX = -0.2; p.spineX = 0.35; p.lHipX = -0.55; p.rHipX = 0.35; p.lKnX = 0.7; p.pelvisY = 0.85;
      break;
    case 'hang':
      p.lShX = -2.7; p.rShX = -2.7; p.lShZ = 0.12; p.rShZ = 0.12; p.lElX = 0; p.rElX = 0; p.headX = -0.45;
      p.lHipX = 0.12 + Math.sin(t * 5) * 0.08; p.rHipX = -0.1 + Math.sin(t * 5.7) * 0.08; p.lKnX = 0.35; p.rKnX = 0.5; p.spineX = -0.05;
      break;
    case 'prone': case 'pull': case 'crawl': {
      const pull = kind === 'pull' ? Math.sin(t * 5) * 0.12 : 0;
      p.bodyPitch = Math.PI / 2; p.bodyY = 0.17; p.lShX = -2.7 + pull; p.rShX = -2.75 - pull; p.lShZ = 0.06; p.rShZ = 0.06;
      p.lElX = -0.1; p.rElX = -0.1; p.headX = -0.7; p.lKnX = 0.05; p.rKnX = 0.05; p.spineX = -0.05;
      if (kind === 'crawl') { p.lKnX = 0.5 + Math.sin(t * 4) * 0.4; p.rKnX = 0.5 - Math.sin(t * 4) * 0.4; }
      break;
    }
    case 'sleep':
      p.bodyPitch = -Math.PI / 2; p.bodyY = 0.17; p.lShX = -0.55; p.rShX = -0.55; p.lElX = -1.8; p.rElX = -1.8; p.lShZ = 0.05; p.rShZ = 0.05;
      p.headX = 0.1 + Math.sin(t * 0.9) * 0.01; p.lKnX = 0.15; p.rKnX = 0.2; p.lHipZ = 0.1; p.rHipZ = -0.1; p.spineX = Math.sin(t * 1.1) * 0.02; p.lHipX = -0.15;
      break;
    case 'lookAround':
      p.headY = Math.sin(t * 0.8 + seed) * 0.85; p.headX = Math.sin(t * 0.5) * 0.08; p.spineY = Math.sin(t * 0.8 + seed - 0.5) * 0.18;
      break;
    case 'brace':
      p.pelvisY = 0.76; p.lHipX = -0.7; p.rHipX = -0.5; p.lKnX = 1.0; p.rKnX = 0.85; p.spineX = 0.3; p.lShX = -0.4; p.rShX = -0.4; p.lShZ = 0.9; p.rShZ = 0.9;
      p.lElX = -0.5; p.rElX = -0.5; p.headX = -0.1;
      p.spineZ = Math.sin(t * 9) * 0.03; p.pelvisYaw = Math.sin(t * 11) * 0.05;
      break;
    case 'shout':
      p.lShX = -0.4; p.rShX = -0.9 + Math.sin(t * 5) * 0.2; p.lElX = -0.7; p.rElX = -0.7; p.spineX = 0.15; p.headX = -0.05;
      break;
    default: break;
  }

  // held props pose the arms when the actor is otherwise idle/walking
  if (GESTURE_OK.includes(kind) || kind === 'crouch') {
    const arms = PROP_ARMS[c.prop];
    if (arms && kind !== 'crouch') Object.assign(p, arms);
  } else if (gait) {
    const w = PROP_WALK[c.prop];
    if (w) Object.assign(p, w);
  }

  // conversational gestures
  if (c.speak > 0.02 && GESTURE_OK.includes(kind) && c.prop !== 'camcorder') {
    const s = c.speak;
    p.headX += Math.sin(t * 2.9) * 0.05 * s; p.headY += Math.sin(t * 1.3 + 1) * 0.07 * s; p.headZ += Math.sin(t * 1.1) * 0.03 * s;
    if (c.prop === 'none' || c.prop === 'flashlight') {
      p.rShX -= (0.35 + 0.3 * Math.sin(t * 2.2 + seed)) * s;
      p.rElX -= (0.5 + 0.4 * Math.sin(t * 2.7)) * s;
      p.lShX -= Math.max(0, Math.sin(t * 1.4 + 2)) * 0.35 * s;
      p.lElX -= Math.max(0, Math.sin(t * 1.4 + 2)) * 0.4 * s;
    }
    p.chestX += Math.sin(t * 2.9) * 0.02 * s;
  }
  return p;
}

export interface Face { bh: number; ba: number; lid: number; smile: number; open: number; tears: number }
export const EMOTES: Record<string, Face> = {
  neutral: { bh: 0, ba: 0, lid: 0.1, smile: 0.08, open: 0, tears: 0 },
  sad: { bh: -0.1, ba: 0.8, lid: 0.35, smile: -0.55, open: 0, tears: 0 },
  happy: { bh: 0.2, ba: 0.1, lid: 0.25, smile: 0.9, open: 0.08, tears: 0 },
  smile: { bh: 0.15, ba: 0.1, lid: 0.22, smile: 0.65, open: 0, tears: 0 },
  worried: { bh: 0.45, ba: 0.75, lid: 0.05, smile: -0.25, open: 0.02, tears: 0 },
  angry: { bh: -0.35, ba: -0.8, lid: 0.3, smile: -0.35, open: 0.05, tears: 0 },
  determined: { bh: -0.25, ba: -0.45, lid: 0.22, smile: -0.05, open: 0, tears: 0 },
  fear: { bh: 0.85, ba: 0.6, lid: -0.3, smile: -0.2, open: 0.35, tears: 0 },
  surprised: { bh: 1, ba: 0.2, lid: -0.35, smile: 0, open: 0.3, tears: 0 },
  cry: { bh: 0, ba: 1, lid: 0.55, smile: -0.85, open: 0.12, tears: 1 },
  tired: { bh: -0.2, ba: 0.25, lid: 0.45, smile: -0.1, open: 0, tears: 0 },
  sleep: { bh: -0.1, ba: 0.1, lid: 1, smile: 0.05, open: 0, tears: 0 },
};
