import * as THREE from "three";
import type { ActorId, CMovie, CShot } from "./types";

/** Runtime world info published by actors so the camera can track them. */
export interface ActorRuntime {
  head: THREE.Vector3;
  root: THREE.Vector3;
  yaw: number;
  hand: THREE.Vector3;
}

export type Quality = "low" | "medium" | "high";

/** Shared mutable playback state. Everything that animates reads stage.t, so pause/seek are exact. */
export const stage = {
  t: 0,
  movie: null as CMovie | null,
  shot: null as CShot | null,
  shotIdx: -1,
  sceneIdx: -1,
  st: {} as Record<string, string | number | boolean>,
  ring: "none" as string,
  actors: {} as Partial<Record<ActorId, ActorRuntime>>,
  vis: {} as Record<string, number>,
  quality: "medium" as Quality,
  fade: 0,
  playing: false,
};

export function getActor(id: ActorId): ActorRuntime {
  let a = stage.actors[id];
  if (!a) {
    a = { head: new THREE.Vector3(0, 1.6, 0), root: new THREE.Vector3(), yaw: 0, hand: new THREE.Vector3() };
    stage.actors[id] = a;
  }
  return a;
}

/** 1 → 0 decay of a one-shot visual cue (flash, glitch, thunder). */
export function vis(name: string, dur: number): number {
  const t0 = stage.vis[name];
  if (t0 === undefined) return 0;
  const v = 1 - (stage.t - t0) / dur;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export const num = (k: string, d = 0): number => {
  const v = stage.st[k];
  return typeof v === "number" ? v : d;
};
export const str = (k: string, d = ""): string => {
  const v = stage.st[k];
  return typeof v === "string" ? v : d;
};
export const flag = (k: string): boolean => !!stage.st[k];
