import type { Card, Line, SceneDef } from './types';
import { lineDur } from './types';
import { act1 } from './act1';
import { act2 } from './act2';
import { act3 } from './act3';
import { act4 } from './act4';

export const TITLE = 'THE SKINWALKER';
export const TAGLINE = 'If you hear someone calling your name in the forest, make sure it\u2019s really them.';

const scenes: SceneDef[] = [...act1, ...act2, ...act3, ...act4];
let t = 0;
export const allLines: (Line & { abs: number; scene: string })[] = [];
export const allCards: (Card & { abs: number })[] = [];
scenes.forEach((s, si) => {
  s.start = t;
  s.cues.sort((a, b) => a.t - b.t);
  s.shots.sort((a, b) => a.t - b.t);
  s.lines.sort((a, b) => a.t - b.t);
  s.lines.forEach((l, i) => { l.id = `s${String(si + 1).padStart(2, '0')}_${String(i + 1).padStart(2, '0')}`; allLines.push({ ...l, abs: t + l.t, scene: s.id }); });
  (s.cards ?? []).forEach((c) => allCards.push({ ...c, abs: t + c.t }));
  t += s.dur;
});

export const MOVIE = { scenes, total: t };
export const CREDITS_START = scenes.find((s) => s.id === 'credits')!.start!;
export const POST_START = scenes.find((s) => s.id === 'post')!.start!;

export function sceneAt(time: number) {
  for (let i = scenes.length - 1; i >= 0; i--) if (time >= scenes[i].start!) return scenes[i];
  return scenes[0];
}

export function subtitleAt(time: number): Line | null {
  let hit: Line | null = null;
  for (const l of allLines) {
    if (time >= l.abs && time < l.abs + lineDur(l) - 0.15) hit = l;
    if (l.abs > time) break;
  }
  return hit;
}

export function cardsAt(time: number) {
  return allCards.filter((c) => time >= c.abs && time < c.abs + c.d);
}

export function dialogueSheet(): string {
  const rows = allLines.map((l) => `${l.id}\t${l.voice}\t${l.fx ?? '-'}\t${l.text}`);
  return 'ID\tVOICE\tEFFECT\tLINE\n' + rows.join('\n');
}

export const fmt = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(ss).padStart(2, '0')}`;
};
