import { env, hit, mf, tone, type Bus } from "./dsp";
import type { MusicId } from "../movie/types";

/** Original generative score. Each cue is a small step-sequencer built from synthesized instruments. */
interface M {
  b: Bus;
  out: GainNode;
  elapsed: () => number;
}

function pad(m: M, t: number, notes: number[], dur: number, g = 0.05, lp = 900) {
  const { ctx } = m.b;
  const gn = ctx.createGain();
  gn.gain.setValueAtTime(0.0001, t);
  gn.gain.linearRampToValueAtTime(g, t + dur * 0.4);
  gn.gain.linearRampToValueAtTime(0.0001, t + dur);
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lp;
  f.connect(gn);
  gn.connect(m.out);
  const v = ctx.createGain();
  v.gain.value = 0.5;
  gn.connect(v);
  v.connect(m.b.verb);
  notes.forEach((nt) => {
    [-7, 6].forEach((det) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = mf(nt);
      o.detune.value = det;
      o.connect(f);
      o.start(t);
      o.stop(t + dur + 0.1);
    });
  });
}

function pluck(m: M, t: number, nt: number, g = 0.12, d = 2.2) {
  const f = mf(nt);
  tone(m.b, { out: m.out, t, f, type: "triangle", a: 0.006, d, g, verb: 0.45, lp: 3200 });
  tone(m.b, { out: m.out, t, f: f * 2, type: "sine", a: 0.004, d: d * 0.5, g: g * 0.35 });
  tone(m.b, { out: m.out, t, f: f * 3.01, type: "sine", a: 0.003, d: d * 0.2, g: g * 0.12 });
}

function bass(m: M, t: number, nt: number, d = 0.4, g = 0.3) {
  tone(m.b, { out: m.out, t, f: mf(nt), type: "sawtooth", a: 0.01, d, g, lp: 220 });
  tone(m.b, { out: m.out, t, f: mf(nt), type: "sine", a: 0.01, d, g: g * 0.8 });
}

const boom = (m: M, t: number, g = 0.5) => {
  tone(m.b, { out: m.out, t, f: 70, f2: 28, d: 1.4, g, verb: 0.4 });
};
const tick = (m: M, t: number, g = 0.05) => hit(m.b, { out: m.out, t, d: 0.03, f: 7000, type: "highpass", g });
const glass = (m: M, t: number, nt: number, g = 0.06) => {
  const f = mf(nt);
  [1, 2.76, 5.4].forEach((r, i) => tone(m.b, { out: m.out, t, f: f * r, d: 4 - i, a: 0.01, g: g / (i + 1), verb: 0.8 }));
};
const stab = (m: M, t: number, notes: number[], g = 0.07, d = 1.2) =>
  notes.forEach((nt) => tone(m.b, { out: m.out, t, f: mf(nt), type: "sawtooth", a: 0.02, d, g, lp: 1400, verb: 0.5 }));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

type Gen = { bpm: number; step: (i: number, t: number, m: M) => void };

const CH_MYST = [
  [45, 57, 60, 64],
  [41, 53, 57, 60, 64],
  [38, 50, 57, 62],
  [40, 52, 56, 59],
];

const GENS: Record<Exclude<MusicId, "sting">, Gen> = {
  mystery: {
    bpm: 60,
    step: (i, t, m) => {
      const bar = Math.floor(i / 16) % 4;
      if (i % 16 === 0) {
        pad(m, t, CH_MYST[bar], 6, 0.045, 700);
        if (bar === 0) tone(m.b, { out: m.out, t, f: 55, a: 2, d: 14, g: 0.12, type: "sine" });
      }
      const mot = [76, 72, 69, 72, 74, 71, 67, 71];
      if (i % 32 === 2) pluck(m, t, mot[(Math.floor(i / 32) * 2) % 8], 0.1);
      if (i % 32 === 8) pluck(m, t, mot[(Math.floor(i / 32) * 2 + 1) % 8], 0.08);
      if (i % 32 === 14) pluck(m, t, 64 + (bar % 2) * 5, 0.07);
      if (i % 8 === 0) tone(m.b, { out: m.out, t, f: 60, f2: 38, d: 0.3, g: 0.08 });
      if (i % 64 === 40) glass(m, t, 93, 0.03);
    },
  },
  daniel: {
    bpm: 66,
    step: (i, t, m) => {
      const ch = [
        [50, 57, 62, 65],
        [46, 53, 58, 62],
        [41, 57, 60, 65],
        [48, 55, 60, 64],
      ][Math.floor(i / 16) % 4];
      if (i % 16 === 0) pad(m, t, ch.slice(0, 3), 4.6, 0.025, 600);
      if (i % 2 === 0) {
        const k = (i / 2) % 8;
        const seq = [0, 1, 2, 3, 2, 1, 2, 1];
        if (k !== 7 || Math.random() > 0.5) pluck(m, t, ch[seq[k]] + 12, 0.07 + (k === 0 ? 0.03 : 0), 2.4);
      }
      if (i % 16 === 0) pluck(m, t, ch[0] - 12, 0.12, 3);
      if (i % 32 === 24) pluck(m, t, ch[2] + 24, 0.05, 3);
    },
  },
  investigation: {
    bpm: 96,
    step: (i, t, m) => {
      const bar = Math.floor(i / 16) % 4;
      const root = [28, 28, 31, 26][bar];
      if (i % 2 === 0) bass(m, t, root, 0.16, 0.2);
      if (i % 4 === 2) tick(m, t, 0.05);
      if (i % 16 === 0) pad(m, t, [40, 47, 55], 5, 0.025, 500);
      if (i % 32 === 0) stab(m, t, [59, 65, 71], 0.03, 2.2);
      if (i % 16 === 12) tone(m.b, { out: m.out, t, f: mf(76), d: 0.12, g: 0.03, verb: 0.5 });
      if (i % 8 === 0) hit(m.b, { out: m.out, t, d: 0.1, f: 90, type: "lowpass", g: 0.2 });
    },
  },
  tension: {
    bpm: 72,
    step: (i, t, m) => {
      if (i % 32 === 0) {
        pad(m, t, [33, 39, 45], 9, 0.035, 450);
        tone(m.b, { out: m.out, t, f: 1760, a: 3, d: 5, g: 0.012, verb: 0.9 });
      }
      if (i % 4 === 0 && Math.random() > 0.4) glass(m, t, pick([86, 87, 90, 93, 98]), 0.035);
      if (i % 8 === 0) {
        tone(m.b, { out: m.out, t, f: 56, f2: 36, d: 0.25, g: 0.2 });
        tone(m.b, { out: m.out, t: t + 0.22, f: 52, f2: 34, d: 0.22, g: 0.13 });
      }
      if (i % 2 === 1) tick(m, t, 0.025);
    },
  },
  underground: {
    bpm: 52,
    step: (i, t, m) => {
      if (i % 32 === 0) {
        pad(m, t, [26, 27, 38], 12, 0.05, 320);
        tone(m.b, { out: m.out, t, f: mf(26), type: "sine", a: 4, d: 10, g: 0.15 });
      }
      if (i % 16 === 8 && Math.random() > 0.4) hit(m.b, { out: m.out, t, d: 2.5, f: pick([180, 240, 330]), q: 12, g: 0.07, verb: 0.9 });
      if (i % 16 === 0) boom(m, t, 0.22);
      if (i % 64 === 30) glass(m, t, 80, 0.03);
      if (i % 4 === 0) tone(m.b, { out: m.out, t, f: 48, f2: 44, d: 0.5, g: 0.06, type: "sine" });
    },
  },
  revelation: {
    bpm: 84,
    step: (i, t, m) => {
      const k = Math.min(1, m.elapsed() / 70);
      const ch = [
        [45, 52, 57, 60],
        [41, 48, 53, 57],
        [48, 55, 60, 64],
        [43, 50, 55, 59],
      ][Math.floor(i / 16) % 4];
      if (i % 16 === 0) {
        pad(m, t, ch, 5.5, 0.04 + k * 0.03, 1100);
        boom(m, t, 0.3 + k * 0.3);
      }
      const arp = [0, 2, 1, 3, 2, 1, 3, 2];
      tone(m.b, { out: m.out, t, f: mf(ch[arp[i % 8]] + 24), type: "sawtooth", a: 0.005, d: 0.18, g: 0.018 + k * 0.025, lp: 1800, verb: 0.3 });
      if (i % 4 === 0) bass(m, t, ch[0] - 12, 0.3, 0.18 + k * 0.1);
      if (i % 8 === 6) hit(m.b, { out: m.out, t, d: 0.2, f: 120, type: "lowpass", g: 0.3 });
      if (i % 32 === 0) glass(m, t, 81, 0.04);
    },
  },
  ending: {
    bpm: 58,
    step: (i, t, m) => {
      const ch = [
        [41, 57, 60, 64],
        [38, 53, 57, 62],
        [46, 58, 62, 65],
        [36, 55, 60, 64],
      ][Math.floor(i / 16) % 4];
      if (i % 16 === 0) pad(m, t, ch.slice(1), 6, 0.03, 700);
      if (i % 4 === 0) pluck(m, t, ch[(i / 4) % 4] + 12, 0.07, 3.2);
      if (i % 16 === 0) pluck(m, t, ch[0], 0.12, 4);
      if (i % 64 === 48) glass(m, t, 88, 0.03);
    },
  },
  credits: {
    bpm: 62,
    step: (i, t, m) => {
      const bar = Math.floor(i / 16) % 4;
      if (i % 16 === 0) {
        pad(m, t, CH_MYST[bar], 5.5, 0.05, 1000);
        bass(m, t, CH_MYST[bar][0] - 12, 3, 0.18);
      }
      const arp = CH_MYST[bar];
      if (i % 2 === 0) pluck(m, t, arp[(i / 2) % arp.length] + 12, 0.08, 2.4);
      if (i % 8 === 0) boom(m, t, 0.14);
      if (i % 32 === 4) pluck(m, t, [81, 79, 76, 74][bar], 0.1, 3);
    },
  },
};

export interface MusicHandle {
  stop: (fade?: number) => void;
}

export function startMusic(b: Bus, id: MusicId): MusicHandle {
  const { ctx } = b;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.linearRampToValueAtTime(1, ctx.currentTime + (id === "sting" ? 0.01 : 2.5));
  out.connect(b.music);
  const t0 = ctx.currentTime;
  const m: M = { b, out, elapsed: () => ctx.currentTime - t0 };

  if (id === "sting") {
    const t = ctx.currentTime + 0.03;
    stab(m, t, [49, 50, 56, 62, 63], 0.14, 3.2);
    boom(m, t, 0.9);
    glass(m, t, 97, 0.08);
    hit(b, { out, t, d: 2.5, f: 9000, f2: 600, type: "bandpass", g: 0.25, verb: 0.8, a: 0.01 });
    return { stop: () => undefined };
  }

  const gen = GENS[id];
  const stepDur = 60 / gen.bpm / 4;
  let next = ctx.currentTime + 0.1;
  let i = 0;
  const timer = window.setInterval(() => {
    while (next < ctx.currentTime + 0.5) {
      gen.step(i++, next, m);
      next += stepDur;
    }
  }, 120);
  return {
    stop: (fade = 2) => {
      window.clearInterval(timer);
      const tn = ctx.currentTime;
      out.gain.cancelScheduledValues(tn);
      out.gain.setValueAtTime(out.gain.value, tn);
      out.gain.linearRampToValueAtTime(0.0001, tn + fade);
      window.setTimeout(() => out.disconnect(), (fade + 0.3) * 1000);
    },
  };
}

export { env };
