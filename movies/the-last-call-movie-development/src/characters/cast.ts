import type { ActorId, Emotion } from "../movie/types";

export type HairStyle = "messy" | "tied" | "long" | "mid" | "grey" | "short";

export interface CastDef {
  name: string;
  age: number;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  beard?: string;
  top: string;
  top2: string;
  pants: string;
  shoes: string;
  eye: string;
  lip: string;
  scale: number;
  headScale: number;
  shoulder: number;
  hip: number;
  bags: number;
  wrinkles: number;
  stoop: number;
}

/** One definition per character: every scene uses the same model, so faces/clothes/proportions never drift. */
export const CAST: Record<ActorId, CastDef> = {
  daniel: {
    name: "Daniel Reed", age: 30, skin: "#c4977a", hair: "#1b1612", hairStyle: "messy", beard: "#251d18",
    top: "#20242e", top2: "#30343f", pants: "#191b21", shoes: "#0f0f12", eye: "#3b2a20", lip: "#9a6a5c",
    scale: 1, headScale: 1, shoulder: 0.215, hip: 0.09, bags: 0.8, wrinkles: 0, stoop: 0.03,
  },
  sarah: {
    name: "Sarah Collins", age: 32, skin: "#d3a88c", hair: "#1a1311", hairStyle: "tied", 
    top: "#2b3140", top2: "#ececf0", pants: "#1f2229", shoes: "#141416", eye: "#2f2018", lip: "#a8574f",
    scale: 0.95, headScale: 0.98, shoulder: 0.185, hip: 0.095, bags: 0.25, wrinkles: 0, stoop: 0,
  },
  emily: {
    name: "Emily Reed", age: 25, skin: "#d9ae92", hair: "#5b3a27", hairStyle: "mid",
    top: "#4f6d4b", top2: "#6f8a68", pants: "#39404c", shoes: "#2a2320", eye: "#4a3322", lip: "#b0675c",
    scale: 0.93, headScale: 1, shoulder: 0.18, hip: 0.092, bags: 0, wrinkles: 0, stoop: 0,
  },
  victor: {
    name: "Victor Hale", age: 61, skin: "#b48f78", hair: "#a4a3a0", hairStyle: "grey", beard: "#8b8a87",
    top: "#5a4938", top2: "#c9c2b0", pants: "#38332e", shoes: "#1c1815", eye: "#41372e", lip: "#8a6455",
    scale: 0.97, headScale: 1, shoulder: 0.2, hip: 0.09, bags: 1, wrinkles: 1, stoop: 0.14,
  },
  olivia: {
    name: "Olivia Marsh", age: 29, skin: "#dca98f", hair: "#2a1a13", hairStyle: "long",
    top: "#8a2b32", top2: "#d8d2cc", pants: "#202228", shoes: "#18181a", eye: "#3a2619", lip: "#b24f55",
    scale: 0.94, headScale: 1, shoulder: 0.185, hip: 0.092, bags: 0.15, wrinkles: 0, stoop: 0,
  },
  boy: {
    name: "Little boy", age: 7, skin: "#e2b698", hair: "#4a3220", hairStyle: "short",
    top: "#3d5b8c", top2: "#3d5b8c", pants: "#3d5b8c", shoes: "#c9c2b6", eye: "#3a281c", lip: "#c47a70",
    scale: 0.52, headScale: 1.4, shoulder: 0.19, hip: 0.08, bags: 0, wrinkles: 0, stoop: 0,
  },
};

export interface Face {
  tilt: number; // brow inner angle (+ sad/fear, - angry)
  browY: number;
  lid: number; // 0 normal, + closed, - wide
  smile: number;
  open: number;
  pitch: number; // head pitch (+ down)
  roll: number;
  lean: number; // body lean
  tremble: number;
  tears: number;
  asym: number; // one brow raised (suspicion)
}

export const FACES: Record<Emotion, Face> = {
  neutral: { tilt: 0, browY: 0, lid: 0.1, smile: 0, open: 0, pitch: 0, roll: 0, lean: 0, tremble: 0, tears: 0, asym: 0 },
  tired: { tilt: 0.25, browY: -0.2, lid: 0.42, smile: -0.15, open: 0, pitch: 0.06, roll: 0.03, lean: 0.04, tremble: 0, tears: 0, asym: 0 },
  sad: { tilt: 0.75, browY: 0.1, lid: 0.35, smile: -0.6, open: 0, pitch: 0.18, roll: 0.05, lean: 0.07, tremble: 0.1, tears: 0, asym: 0 },
  worry: { tilt: 0.65, browY: 0.35, lid: 0.0, smile: -0.35, open: 0.02, pitch: 0.04, roll: 0.04, lean: 0.02, tremble: 0.1, tears: 0, asym: 0 },
  fear: { tilt: 0.7, browY: 0.95, lid: -0.55, smile: -0.5, open: 0.28, pitch: -0.04, roll: 0.02, lean: -0.08, tremble: 0.6, tears: 0, asym: 0 },
  shock: { tilt: 0.2, browY: 1, lid: -0.8, smile: 0, open: 0.5, pitch: -0.08, roll: 0, lean: -0.1, tremble: 0.2, tears: 0, asym: 0 },
  suspicion: { tilt: -0.5, browY: -0.1, lid: 0.32, smile: -0.12, open: 0, pitch: 0.02, roll: -0.05, lean: 0, tremble: 0, tears: 0, asym: 0.7 },
  angry: { tilt: -0.95, browY: -0.35, lid: 0.25, smile: -0.6, open: 0.04, pitch: 0.06, roll: 0, lean: 0.05, tremble: 0.1, tears: 0, asym: 0 },
  cry: { tilt: 0.95, browY: 0.1, lid: 0.55, smile: -0.85, open: 0.14, pitch: 0.2, roll: 0.06, lean: 0.1, tremble: 0.7, tears: 1, asym: 0 },
  smile: { tilt: -0.05, browY: 0.15, lid: 0.28, smile: 0.85, open: 0.04, pitch: -0.02, roll: 0.04, lean: 0, tremble: 0, tears: 0, asym: 0 },
};
