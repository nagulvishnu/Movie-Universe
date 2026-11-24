import "./scriptA";
import "./scriptB";
import "./scriptC";
import { BEATS, SCENES, W, a, PI } from "./dsl";
import type { Beat, LineEvent, Speaker, TimedBeat } from "./types";

export const SPEAKER_LABEL: Record<Speaker, string> = { R: "RYAN", A: "ANYA", D: "DR. MEHRA", N: "", P: "", W: "ANYA (letter)" };

function lineDur(sp: Speaker, text: string) {
  const c = text.length;
  if (sp === "N") return Math.max(2, c / 11 + 0.9);
  if (sp === "W") return Math.max(1.8, c / 12 + 0.8);
  return Math.max(1.3, c / 12.5 + 0.6);
}

function build(): TimedBeat[] {
  const out: TimedBeat[] = [];
  let t = 0;
  BEATS.forEach((beat, index) => {
    const lines: LineEvent[] = [];
    let cur = beat.lead ?? 0.6;
    for (const l of beat.lines ?? []) {
      if (typeof l === "number") { cur += l; continue; }
      const [speaker, text, label] = l;
      const d = lineDur(speaker, text);
      lines.push({ at: t + cur, end: t + cur + d, speaker, text, label });
      cur += d + (speaker === "N" ? 0.5 : 0.35);
    }
    const dur = Math.max(beat.dur, lines.length ? cur + 0.7 : 0);
    out.push({ beat, start: t, end: t + dur, lines, index });
    t += dur;
  });
  return out;
}

export const TIMELINE: TimedBeat[] = build();
export const TOTAL = TIMELINE[TIMELINE.length - 1].end;

export function beatIndexAt(time: number) {
  let lo = 0, hi = TIMELINE.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (TIMELINE[mid].start <= time) lo = mid; else hi = mid - 1;
  }
  return lo;
}

export interface Chapter { name: string; act?: string; start: number }
export const CHAPTERS: Chapter[] = (() => {
  const res: Chapter[] = [];
  for (const tb of TIMELINE) {
    const sc = SCENES[tb.beat.scene];
    if (sc.name.startsWith("Act ")) continue;
    if (!res.length || res[res.length - 1].name !== sc.name) res.push({ name: sc.name, act: sc.act, start: tb.start });
  }
  return res;
})();

export const ACT_MARKS = TIMELINE.filter((tb) => tb.beat.card && /^ACT/.test(tb.beat.card.title)).map((tb) => ({ t: tb.start, name: tb.beat.card!.title + " — " + (tb.beat.card!.sub ?? "") }));
export const CREDITS_START = TIMELINE.find((tb) => tb.beat.credits)?.start ?? TOTAL;

// ---- poster / title-screen background (loops, not part of the film runtime) ----
const poster: Beat = {
  id: "poster", scene: 0, env: "lighthouse", v: "day", light: "sunset", dur: 40, lin: true, shake: 0.002,
  cam: [W([-3.4, 1.35, -2.6], [-1.2, 1.35, -6.5], 36), W([-2.6, 1.3, -2.9], [-1.2, 1.4, -6.5], 34)],
  actors: {
    ryan: a([-1.75, 0, -5.15], PI, "sit", "peace", { look: "sea", outfit: "casual" }),
    anya: a([-0.85, 0, -5.15], PI, "restL", "peace", { look: "sea", outfit: "denim" }),
  },
  amb: ["wind", "sea", "gulls"],
  music: { v: "piano", vol: 0.6 },
};
export const POSTER_TB: TimedBeat = { beat: poster, start: 0, end: 40, lines: [], index: -2 };
