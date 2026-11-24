import { NARRATION } from '../narration';
import { prologueScenes } from '../scenes/prologue';
import { chapter1Scenes } from '../scenes/chapter1';
import { chapter2Scenes } from '../scenes/chapter2';
import { chapter3Scenes } from '../scenes/chapter3';
import { chapter4Scenes, chapter5Scenes } from '../scenes/chapter4';
import { chapter6Scenes } from '../scenes/chapter6';
import { chapter7Scenes } from '../scenes/chapter7';
import { chapter8Scenes, chapter9Scenes, finaleScenes } from '../scenes/chapter8';
import { CHAPTERS, chapterIndexOf } from './chapters';
import type { SceneDef, TLine, TScene } from './types';

/** Nominal narration pace used to lay out the timeline (words per second) and pause after each line. */
export const WORDS_PER_SECOND = 2.25;
export const LINE_PAUSE = 0.8;
const DEFAULT_LEAD = 1.6;
const DEFAULT_TAIL = 1.2;

export const SCENES: SceneDef[] = [
  ...prologueScenes, ...chapter1Scenes, ...chapter2Scenes, ...chapter3Scenes, ...chapter4Scenes,
  ...chapter5Scenes, ...chapter6Scenes, ...chapter7Scenes, ...chapter8Scenes, ...chapter9Scenes, ...finaleScenes,
];

const parseLine = (raw: string): { text: string; tone: TLine['tone'] } => {
  if (raw.startsWith('!')) return { text: raw.slice(1), tone: 'dramatic' };
  if (raw.startsWith('~')) return { text: raw.slice(1), tone: 'soft' };
  return { text: raw, tone: 'normal' };
};

export const lineDuration = (text: string) => text.split(/\s+/).filter(Boolean).length / WORDS_PER_SECOND + LINE_PAUSE;

function build() {
  const scenes: TScene[] = [];
  const lines: TLine[] = [];
  let t = 0;
  SCENES.forEach((def, sceneIdx) => {
    const raws = NARRATION[def.id] ?? [];
    const lead = def.lead ?? DEFAULT_LEAD;
    const tail = def.tail ?? DEFAULT_TAIL;
    let cursor = t + lead;
    const sceneLines: TLine[] = raws.map((raw) => {
      const { text, tone } = parseLine(raw);
      const dur = lineDuration(text);
      const line: TLine = { text, tone, start: cursor, dur, sceneIdx };
      cursor += dur;
      return line;
    });
    const narrated = cursor - t + tail;
    const dur = def.hold !== undefined ? Math.max(def.hold, 0) : narrated;
    scenes.push({ def, start: t, dur, chapter: chapterIndexOf(def.id), lines: sceneLines });
    lines.push(...sceneLines);
    t += dur;
  });
  return { scenes, lines, total: t };
}

const built = build();
export const TSCENES = built.scenes;
export const TLINES = built.lines;
export const TOTAL_DURATION = built.total;

export const chapterStarts: number[] = CHAPTERS.map((c) => TSCENES.find((s) => s.def.id.split('-')[0] === c.key)?.start ?? 0);

export function sceneIndexAt(t: number): number {
  let lo = 0, hi = TSCENES.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (TSCENES[mid].start <= t) lo = mid; else hi = mid - 1;
  }
  return lo;
}

/** Index of the line active at time t (or -1 when in a gap before the first line of a scene). */
export function lineIndexAt(t: number): number {
  let lo = 0, hi = TLINES.length - 1, res = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (TLINES[mid].start <= t) { res = mid; lo = mid + 1; } else hi = mid - 1;
  }
  if (res >= 0 && t >= TLINES[res].start + TLINES[res].dur) return -1;
  return res;
}

export const formatTime = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? h + ':' : ''}${mm}:${String(sec).padStart(2, '0')}`;
};

if (import.meta.env?.DEV) {
  const words = TLINES.reduce((n, l) => n + l.text.split(/\s+/).length, 0);
  console.info(`[film] ${TSCENES.length} scenes, ${TLINES.length} narration lines, ${words} words, runtime ${formatTime(TOTAL_DURATION)}`);
}
