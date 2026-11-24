// Reusable facial expression presets and body pose presets (no per-emotion models).

export const EKEYS = [
  "browUp",
  "browTilt",
  "lid",
  "squint",
  "smile",
  "open",
  "width",
  "smirk",
  "blush",
  "tear",
  "tremble",
  "pucker",
  "bags",
] as const;
export type EKey = (typeof EKEYS)[number];
export type Expr = Record<EKey, number>;

export const NEUTRAL: Expr = {
  browUp: 0,
  browTilt: 0,
  lid: 0.62,
  squint: 0,
  smile: 0.05,
  open: 0,
  width: 0,
  smirk: 0,
  blush: 0,
  tear: 0,
  tremble: 0,
  pucker: 0,
  bags: 0,
};

const P = (o: Partial<Expr>): Expr => ({ ...NEUTRAL, ...o });

export const EXPR: Record<string, Expr> = {
  neutral: P({}),
  listen: P({ smile: 0.12, lid: 0.62, browUp: 0.1 }),
  gentle: P({ smile: 0.38, lid: 0.58, squint: 0.15, browUp: 0.1 }),
  smile: P({ smile: 0.78, lid: 0.55, squint: 0.35, browUp: 0.15, blush: 0.1, open: 0.05 }),
  laugh: P({ smile: 1, open: 0.55, lid: 0.36, squint: 0.75, browUp: 0.25, width: 0.25, blush: 0.25 }),
  shy: P({ smile: 0.3, lid: 0.5, browUp: 0.2, browTilt: 0.3, blush: 0.55, smirk: 0.2 }),
  surprise: P({ browUp: 1, lid: 1, open: 0.35, smile: 0, pucker: 0.25 }),
  affection: P({ smile: 0.55, lid: 0.5, squint: 0.2, browUp: 0.1, browTilt: 0.3, blush: 0.35 }),
  confusion: P({ browUp: 0.3, browTilt: -0.35, smile: -0.1, smirk: -0.4, lid: 0.7 }),
  concern: P({ browTilt: 0.75, browUp: 0.3, smile: -0.2, lid: 0.7 }),
  fear: P({ browUp: 0.85, browTilt: 0.8, lid: 0.96, open: 0.22, smile: -0.4, tremble: 0.25 }),
  disbelief: P({ browUp: 0.5, browTilt: 0.45, lid: 0.86, open: 0.12, smile: -0.2, tremble: 0.15, tear: 0.2 }),
  sad: P({ browTilt: 1, browUp: 0.1, lid: 0.45, smile: -0.5, tear: 0.35, bags: 0.3 }),
  cry: P({ browTilt: 1, lid: 0.34, smile: -0.7, open: 0.15, tear: 0.85, tremble: 0.55, blush: 0.35, squint: 0.3, bags: 0.4 }),
  sob: P({ browTilt: 1, lid: 0.24, smile: -0.85, open: 0.45, tear: 1, tremble: 1, blush: 0.55, squint: 0.55, bags: 0.5 }),
  accept: P({ smile: 0.3, lid: 0.45, browTilt: 0.5, tear: 0.5, bags: 0.2 }),
  hope: P({ smile: 0.48, lid: 0.6, browUp: 0.2, tear: 0.25, browTilt: 0.3 }),
  playful: P({ smile: 0.68, smirk: 0.6, lid: 0.5, browUp: 0.3, squint: 0.2 }),
  nervous: P({ smile: 0.15, browUp: 0.3, browTilt: 0.5, lid: 0.7, smirk: 0.2, blush: 0.15 }),
  curiosity: P({ browUp: 0.5, lid: 0.78, smile: 0.2, smirk: 0.25 }),
  hidden: P({ smile: 0.55, browTilt: 0.65, lid: 0.5, tear: 0.35, squint: 0.2, bags: 0.2 }),
  tearySmile: P({ smile: 0.72, tear: 0.85, browTilt: 0.6, lid: 0.4, squint: 0.4, blush: 0.3, bags: 0.2 }),
  tired: P({ lid: 0.4, smile: 0.12, browTilt: 0.3, bags: 0.8 }),
  think: P({ browUp: 0.25, lid: 0.55, smirk: 0.3, smile: 0.05 }),
  sleep: P({ lid: 0, smile: 0.22, blush: 0.1 }),
  lonely: P({ lid: 0.5, smile: 0.0, browTilt: 0.25, bags: 0.15 }),
  peace: P({ lid: 0.46, smile: 0.2, browTilt: 0.1 }),
  blank: P({ lid: 0.55, smile: -0.1, browTilt: 0.35, bags: 0.6, tear: 0.1 }),
};

// ---------- Poses ----------
export type Arm = [number, number, number, number?, number?]; // fwd, abduct, elbow, pronation, wrist
export interface Pose {
  hipY?: number;
  lean?: number;
  tw?: number;
  hx?: number;
  hy?: number;
  hz?: number;
  al?: Arm;
  ar?: Arm;
  ll?: [number, number];
  lr?: [number, number];
  cl?: number;
  cr?: number;
  anim?: "walk" | "run" | "piano" | "write" | "stir" | "wave" | "rock" | "pedal";
  gest?: number;
}

const rest: Arm = [0.04, 0.1, 0.18, 0, 0];
const sitLegs: [number, number] = [1.52, 1.5];

export const POSES: Record<string, Pose> = {
  stand: { al: rest, ar: rest, cl: 0.35, cr: 0.35, gest: 1 },
  handsFront: { al: [0.55, 0.12, 1.15, 0.4], ar: [0.55, 0.12, 1.15, 0.4], cl: 0.4, cr: 0.4, gest: 0.4 },
  walk: { anim: "walk", al: rest, ar: rest },
  run: { anim: "run", al: rest, ar: rest, lean: 0.22 },
  sit: { hipY: 0.5, ll: sitLegs, lr: sitLegs, al: [0.45, 0.1, 1.2, 0.3], ar: [0.45, 0.1, 1.2, 0.3], cl: 0.4, cr: 0.4, gest: 0.5 },
  sitBack: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: -0.12, al: [0.3, 0.12, 0.9, 0.2], ar: [0.3, 0.12, 0.9, 0.2], gest: 0.7 },
  sitLean: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.18, al: [0.7, 0.1, 1.4, 0.5], ar: [0.7, 0.1, 1.4, 0.5], gest: 0.4 },
  sitCup: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.05, al: [0.45, 0.1, 1.2, 0.3], ar: [0.85, 0.15, 1.6, 0.2], gest: 0.2 },
  rest: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.04, hz: 0.34, hy: -0.15, al: [0.4, 0.1, 1.1, 0.3], ar: [0.4, 0.1, 1.1, 0.3] },
  phone: { al: rest, ar: [0.95, 0.3, 2.2, 0, 0], cl: 0.4, cr: 0.5, hz: 0.1 },
  camera: { al: [0.98, 0.14, 2.05, 0.2], ar: [1.02, 0.14, 2.05, 0.2], hx: -0.04, cl: 0.5, cr: 0.5, gest: 0 },
  cameraLow: { al: [0.62, 0.12, 1.7, 0.2], ar: [0.62, 0.12, 1.7, 0.2], hx: 0.12, cl: 0.5, cr: 0.5, gest: 0 },
  umbrella: { al: rest, ar: [0.55, 0.22, 1.5, 0.2], cl: 0.35, cr: 0.6, gest: 0.3 },
  hug: { al: [1.25, -0.35, 0.95, 0.2], ar: [1.25, -0.35, 0.95, 0.2], cl: 0.4, cr: 0.4, lean: 0.05, hz: 0.12 },
  holdL: { al: [0.14, 0.24, 0.32], ar: rest, cl: 0.7, gest: 0.5 },
  holdR: { al: rest, ar: [0.14, 0.24, 0.32], cr: 0.7, gest: 0.5 },
  walkHoldL: { anim: "walk", al: [0.14, 0.24, 0.32], ar: rest },
  walkHoldR: { anim: "walk", al: rest, ar: [0.14, 0.24, 0.32] },
  piano: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.12, hx: 0.12, al: [0.72, 0.16, 1.3, 0.75], ar: [0.72, 0.16, 1.3, 0.75], anim: "piano", cl: 0.35, cr: 0.35 },
  write: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.22, hx: 0.4, al: [0.7, 0.1, 1.25, 0.6], ar: [0.85, 0.05, 1.45, 0.7], anim: "write", cr: 0.8 },
  cover: { al: [1.35, 0.05, 2.5], ar: [1.35, 0.05, 2.5], hx: 0.45, lean: 0.12, cl: 0.4, cr: 0.4, gest: 0 },
  sitCover: { hipY: 0.5, ll: sitLegs, lr: sitLegs, al: [1.35, 0.05, 2.5], ar: [1.35, 0.05, 2.5], hx: 0.45, lean: 0.3, cl: 0.4, cr: 0.4, anim: "rock" },
  read: { al: [0.88, 0.15, 1.78, 0.3], ar: [0.88, 0.15, 1.78, 0.3], hx: 0.42, cl: 0.45, cr: 0.45, gest: 0 },
  sitRead: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.1, al: [0.88, 0.15, 1.78, 0.3], ar: [0.88, 0.15, 1.78, 0.3], hx: 0.42, cl: 0.45, cr: 0.45, gest: 0 },
  sitSlump: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.3, hx: 0.3, al: [0.3, 0.1, 1.0, 0.3], ar: [0.3, 0.1, 1.0, 0.3], gest: 0 },
  cook: { lean: 0.12, hx: 0.2, al: [0.7, 0.2, 1.3, 0.4], ar: [0.8, 0.15, 1.45, 0.4], anim: "stir", cr: 0.7 },
  chest: { al: rest, ar: [0.72, 0.1, 2.35, 0.2], cr: 0.5, hx: 0.1 },
  wave: { al: rest, ar: [2.3, 0.4, 0.5], anim: "wave", cr: 0.2 },
  point: { al: rest, ar: [1.45, 0.2, 0.2], cr: 0.3, gest: 0.3 },
  kneel: { hipY: 0.5, ll: [1.52, 1.5], lr: [0.12, 1.55], lean: 0.02, al: [0.4, 0.15, 1.3, 0.3], ar: [0.7, 0.1, 1.5, 0.4], gest: 0.2 },
  hold: { al: [0.7, 0.15, 1.4, 0.4], ar: [0.7, 0.15, 1.4, 0.4], cl: 0.5, cr: 0.5, gest: 0.2 },
  handsPocket: { al: [-0.1, 0.18, 0.55], ar: [-0.1, 0.18, 0.55], gest: 0.3 },
  bike: { hipY: 0.9, lean: 0.28, hx: -0.2, al: [0.95, 0.16, 0.35], ar: [0.95, 0.16, 0.35], ll: [1.0, 1.4], lr: [1.0, 1.4], anim: "pedal", cl: 0.6, cr: 0.6 },
  bikeBack: { hipY: 0.86, lean: 0.08, hz: 0.12, al: [1.0, -0.28, 1.0], ar: [1.0, -0.28, 1.0], ll: [0.5, 0.6], lr: [0.5, 0.6], cl: 0.5, cr: 0.5 },
  restL: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.04, hz: -0.34, hy: 0.15, al: [0.4, 0.1, 1.1, 0.3], ar: [0.4, 0.1, 1.1, 0.3] },
  kiss: { lean: 0.12, hz: 0.14, al: [1.2, -0.3, 1.0, 0.2], ar: [1.2, -0.3, 1.0, 0.2], cl: 0.4, cr: 0.4 },
  kissB: { lean: 0.12, hz: -0.14, al: [1.2, -0.3, 1.0, 0.2], ar: [1.2, -0.3, 1.0, 0.2], cl: 0.4, cr: 0.4 },
  sitPhone: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.04, hz: 0.12, al: [0.45, 0.1, 1.2, 0.3], ar: [0.95, 0.3, 2.2, 0, 0], cl: 0.4, cr: 0.5 },
  sitArm: { hipY: 0.5, ll: sitLegs, lr: sitLegs, lean: 0.06, hz: 0.1, al: [0.45, 0.1, 1.2, 0.3], ar: [0.5, 0.45, 0.9, 0.2] },
  bow: { lean: 0.35, hx: 0.3, al: rest, ar: rest, gest: 0 },
};

export const HIP_STAND = 0.93;
