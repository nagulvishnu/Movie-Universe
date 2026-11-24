// The complete screenplay timeline, in story order.
import { act1 } from './act1';
import { act2 } from './act2';
import { act3 } from './act3';
import { act4 } from './act4';
import { act5 } from './act5';
import type { SceneDef } from './types';

export const SCENES: SceneDef[] = [...act1, ...act2, ...act3, ...act4, ...act5];

export const SCENE_STARTS: number[] = (() => {
  const out: number[] = []; let t = 0;
  for (const s of SCENES) { out.push(t); t += s.dur; }
  return out;
})();
export const TOTAL_DURATION = SCENES.reduce((a, s) => a + s.dur, 0);
export const INTRO_END_INDEX = SCENES.findIndex((s) => s.id === 'a1_ruins');
export const MAIN_END_INDEX = SCENES.findIndex((s) => s.id === 'a5_pullaway');
export const CREDITS_INDEX = SCENES.findIndex((s) => s.id === 'a_credits');

export function locate(globalT: number) {
  let i = SCENES.length - 1;
  for (let k = 0; k < SCENES.length; k++) if (globalT < SCENE_STARTS[k] + SCENES[k].dur) { i = k; break; }
  return { index: i, t: Math.max(0, Math.min(SCENES[i].dur, globalT - SCENE_STARTS[i])) };
}
