import type { CharId } from "../film/types";

export interface Outfit {
  top: string;
  sleeves: "short" | "long" | "rolled";
  jacket?: string;
  bottom: string;
  dress?: string;
  shoe: string;
  tone?: number; // cloth texture strength
}

export interface CharSpec {
  id: CharId;
  key: string;
  scale: number;
  female: boolean;
  skin: string;
  hair: string;
  hairStyle: "ryan" | "anya" | "bun";
  iris: string;
  beard: number; // 0..1
  grey: number; // 0..1
  pallor: number; // 0..1
  tired: number;
  jaw: number;
  brow: number;
  lip: string;
  outfit: Outfit;
}

const RYAN: Omit<CharSpec, "outfit" | "key"> = {
  id: "ryan",
  scale: 1.03,
  female: false,
  skin: "#bf8863",
  hair: "#1d1511",
  hairStyle: "ryan",
  iris: "#5a3a22",
  beard: 0.55,
  grey: 0,
  pallor: 0,
  tired: 0,
  jaw: 0.8,
  brow: 1,
  lip: "#a0605a",
};
const ANYA: Omit<CharSpec, "outfit" | "key"> = {
  id: "anya",
  scale: 0.955,
  female: true,
  skin: "#cb9774",
  hair: "#2a1912",
  hairStyle: "anya",
  iris: "#4a2c1b",
  beard: 0,
  grey: 0,
  pallor: 0,
  tired: 0,
  jaw: 0.1,
  brow: 0.7,
  lip: "#b05560",
};
const DOC: Omit<CharSpec, "outfit" | "key"> = {
  id: "doctor",
  scale: 0.96,
  female: true,
  skin: "#b98660",
  hair: "#1a1411",
  hairStyle: "bun",
  iris: "#3d2616",
  beard: 0,
  grey: 0.25,
  pallor: 0,
  tired: 0.2,
  jaw: 0.3,
  brow: 0.8,
  lip: "#9a5a55",
};

type O = Partial<CharSpec> & { outfit: Outfit };
const R = (o: O): O => o;

const TABLE: Record<string, O> = {
  "ryan:station": R({ outfit: { top: "#8e99a6", sleeves: "long", jacket: "#23272e", bottom: "#2c3340", shoe: "#2a2420" } }),
  "ryan:work": R({ outfit: { top: "#b8a17c", sleeves: "rolled", bottom: "#394050", shoe: "#3a2d25" } }),
  "ryan:casual": R({ outfit: { top: "#e3ded2", sleeves: "short", bottom: "#82745f", shoe: "#d8d4cc" } }),
  "ryan:rain": R({ outfit: { top: "#6d7782", sleeves: "long", jacket: "#2a3947", bottom: "#2c3340", shoe: "#2a2420" } }),
  "ryan:navy": R({ outfit: { top: "#2e4263", sleeves: "long", bottom: "#242a33", shoe: "#2b2420" } }),
  "ryan:home": R({ outfit: { top: "#6c747f", sleeves: "short", bottom: "#3d424d", shoe: "#3a2d25" } }),
  "ryan:green": R({ outfit: { top: "#58704f", sleeves: "long", bottom: "#3a3f4a", shoe: "#3a2d25" } }),
  "ryan:grief": R({ beard: 0.95, tired: 0.9, outfit: { top: "#54575f", sleeves: "long", jacket: "#383a40", bottom: "#2b2f37", shoe: "#222" } }),
  "ryan:grief2": R({ beard: 0.8, tired: 0.7, outfit: { top: "#8b8f96", sleeves: "long", bottom: "#2b2f37", shoe: "#222" } }),
  "ryan:older": R({ beard: 0.6, grey: 0.65, tired: 0.15, outfit: { top: "#dcd9d2", sleeves: "long", jacket: "#2a2c33", bottom: "#23262d", shoe: "#222" } }),
  "anya:station": R({ outfit: { top: "#f1ece2", sleeves: "long", jacket: "#d6a233", bottom: "#2b3848", shoe: "#e8e3da" } }),
  "anya:cafe": R({ outfit: { top: "#e6d9c2", sleeves: "long", bottom: "#3a475a", shoe: "#c7b79e" } }),
  "anya:sea": R({ outfit: { top: "#e3edf0", sleeves: "short", dress: "#dfeaf0", bottom: "#dfeaf0", shoe: "#cdbba0" } }),
  "anya:denim": R({ outfit: { top: "#f4f0e8", sleeves: "long", jacket: "#5a7ba3", bottom: "#d7c8a6", shoe: "#e8e3da" } }),
  "anya:home": R({ outfit: { top: "#a8b79d", sleeves: "long", bottom: "#444955", shoe: "#bbb" } }),
  "anya:rust": R({ outfit: { top: "#b2523f", sleeves: "long", bottom: "#2a2f3a", shoe: "#2d2a28" } }),
  "anya:yellow": R({ outfit: { top: "#f0c04c", sleeves: "short", dress: "#efbf4a", bottom: "#efbf4a", shoe: "#cdbba0" } }),
  "anya:night": R({ outfit: { top: "#3d4a63", sleeves: "long", bottom: "#2a2f3a", shoe: "#222" } }),
  "anya:sick": R({ pallor: 0.45, tired: 0.7, outfit: { top: "#e8e4dd", sleeves: "long", jacket: "#8c8e9c", bottom: "#3a3f4b", shoe: "#bbb" } }),
  "anya:travel": R({ pallor: 0.3, tired: 0.5, outfit: { top: "#f2efe8", sleeves: "long", jacket: "#4c5b47", bottom: "#2b3848", shoe: "#ddd" } }),
  "anya:rec": R({ pallor: 0.4, tired: 0.6, outfit: { top: "#e6d9c2", sleeves: "long", bottom: "#3a475a", shoe: "#bbb" } }),
  "doctor:coat": R({ outfit: { top: "#4d6b84", sleeves: "long", jacket: "#f3f5f7", bottom: "#2d3138", shoe: "#ddd" } }),
};

export function getSpec(id: CharId, outfit: string): CharSpec {
  const base = id === "ryan" ? RYAN : id === "anya" ? ANYA : DOC;
  const key = `${id}:${outfit}`;
  const t = TABLE[key] || TABLE[`${id}:${id === "ryan" ? "casual" : id === "anya" ? "cafe" : "coat"}`];
  return { ...base, ...t, key };
}

export const DEFAULT_OUTFIT: Record<CharId, string> = { ryan: "casual", anya: "cafe", doctor: "coat" };
