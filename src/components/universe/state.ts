import type { MovieTheme } from "@/lib/movies";

// Mutable, non-reactive state shared between DOM code and the single render loop.
// (Reading this from useFrame avoids React re-renders for per-frame data.)

export type WorldMode = "portal" | "world" | "calm";

export const BRAND_THEME: MovieTheme = {
  primary: "#3d7bff",
  secondary: "#6a2cff",
  accent: "#f5c46b",
  atmosphere: "cosmic",
  particles: "motes",
};

export const rig = {
  mode: "calm" as WorldMode,
  time: 20,
  /** Intro activation clock. */
  activationStart: null as number | null,
  activationDuration: 0.9,
  activation: 0,
  portalBlend: 0,
  worldBlend: 0,
  scroll: 0,
  vh: 800,
  pointerX: 0,
  pointerY: 0,
  reduced: false,
  quality: "high" as "low" | "high",
  mobile: false,
  degraded: false,
};

export function beginActivation(durationSeconds: number) {
  rig.activationStart = typeof performance !== "undefined" ? performance.now() : 0;
  rig.activationDuration = durationSeconds;
}

export function targetFps(): number {
  if (rig.reduced) return 0;
  let f = rig.quality === "low" || rig.degraded ? 30 : 60;
  if (rig.mode === "portal") {
    if (rig.scroll > rig.vh * 1.2) f = Math.min(f, 24);
  } else f = Math.min(f, 40);
  return f;
}

/** Finish the activation quickly from wherever it currently is (used by Skip Intro). */
export function fastForwardActivation() {
  const now = performance.now();
  rig.activationDuration = 0.8;
  rig.activationStart = now - rig.activation * 800;
}
