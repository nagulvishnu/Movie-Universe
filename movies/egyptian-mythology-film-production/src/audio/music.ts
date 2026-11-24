import type { CueId } from '../film/types';
import { mixer } from './mixer';

// Original procedural score: drones, frame drums, strings, ney-like flute, brass and vocal-like pads.
// Modes lean on Phrygian-dominant ("hijaz") and related scales for an ancient, Near-Eastern colour; nothing is sampled or borrowed.
const MODES: Record<string, number[]> = {
  hijaz: [0, 1, 4, 5, 7, 8, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], harm: [0, 2, 3, 5, 7, 8, 11],
};
type Pat = 'none' | 'heart' | 'march' | 'dance' | 'battle' | 'slow';
interface Cue { root: number; mode: keyof typeof MODES; bpm: number; drone: number; perc: number; strings: number; flute: number; brass: number; choir: number; pat: Pat; chords: number[][]; seed: number }
const C = (root: number, mode: keyof typeof MODES, bpm: number, drone: number, perc: number, strings: number, flute: number, brass: number, choir: number, pat: Pat, seed: number, chords: number[][] = [[0, 2, 4], [0, 2, 4], [5, 0, 2], [4, 6, 1]]): Cue =>
  ({ root, mode, bpm, drone, perc, strings, flute, brass, choir, pat, chords, seed });
export const CUES: Record<CueId, Cue> = {
  title: C(38, 'hijaz', 56, 0.9, 0.5, 0.5, 0.35, 0.3, 0.6, 'slow', 1),
  dark: C(36, 'phrygian', 40, 0.8, 0, 0, 0, 0, 0.18, 'none', 2),
  nun: C(38, 'phrygian', 44, 0.7, 0.18, 0.1, 0.28, 0, 0.35, 'heart', 3),
  creation: C(40, 'hijaz', 58, 0.7, 0.4, 0.55, 0.45, 0.2, 0.5, 'slow', 4),
  heliopolis: C(41, 'hijaz', 66, 0.6, 0.45, 0.6, 0.5, 0.3, 0.3, 'march', 5),
  solar: C(45, 'hijaz', 72, 0.6, 0.6, 0.7, 0.4, 0.6, 0.5, 'march', 6),
  divine: C(40, 'lydian', 54, 0.5, 0, 0.6, 0.3, 0.1, 0.65, 'none', 7),
  pantheon: C(43, 'hijaz', 84, 0.5, 0.5, 0.5, 0.6, 0.15, 0.2, 'dance', 8),
  thebes: C(38, 'hijaz', 70, 0.6, 0.55, 0.6, 0.35, 0.5, 0.3, 'march', 9),
  tragedy: C(38, 'minor', 48, 0.6, 0.25, 0.65, 0.5, 0, 0.35, 'heart', 10, [[0, 2, 4], [5, 0, 2], [3, 5, 0], [4, 6, 1]]),
  marsh: C(43, 'dorian', 56, 0.4, 0, 0.35, 0.55, 0, 0.2, 'none', 11),
  war: C(38, 'phrygian', 108, 0.6, 0.85, 0.6, 0, 0.6, 0.4, 'battle', 12, [[0, 2, 4], [0, 2, 4], [1, 3, 5], [0, 2, 4]]),
  tribunal: C(38, 'harm', 62, 0.6, 0.35, 0.55, 0.15, 0.35, 0.3, 'march', 13),
  duat: C(36, 'phrygian', 46, 0.9, 0.35, 0.35, 0.2, 0, 0.35, 'heart', 14),
  judgement: C(38, 'hijaz', 52, 0.7, 0.55, 0.6, 0, 0.4, 0.7, 'slow', 15),
  apep: C(36, 'phrygian', 124, 0.8, 1, 0.8, 0, 0.8, 0.5, 'battle', 16, [[0, 2, 4], [1, 3, 5], [0, 2, 4], [4, 6, 1]]),
  dawn: C(45, 'lydian', 70, 0.5, 0.5, 0.75, 0.5, 0.55, 0.65, 'march', 17),
  finale: C(40, 'hijaz', 52, 0.45, 0.2, 0.6, 0.5, 0.15, 0.5, 'slow', 18),
  credits: C(40, 'dorian', 56, 0.4, 0, 0.5, 0.45, 0, 0.3, 'none', 19),
};

const PATS: Record<Pat, string> = {
  none: '................', heart: 'D.....D.........', slow: 'B...............',
  march: 'D...t.D.t...D.t.', dance: 'D..t..t.D.D.t...', battle: 'B..tD.tDB..tD.tt',
};

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const rngSeed = (s: number) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

class Music {
  private cue: Cue = CUES.dark;
  private cueId: CueId = 'dark';
  private timer = 0;
  private next = 0;
  private step = 0;
  private bar = 0;
  private running = false;
  private buses: Record<string, GainNode> = {};
  private drone: { oscs: OscillatorNode[]; gain: GainNode; lp: BiquadFilterNode } | null = null;
  private melody: { at: number; len: number; deg: number }[] = [];

  private ensure() {
    const ctx = mixer.ctx!;
    if (this.buses.strings) return;
    for (const k of ['strings', 'flute', 'brass', 'choir', 'perc', 'drone']) {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(mixer.music);
      const send = ctx.createGain(); send.gain.value = k === 'perc' ? 0.25 : k === 'drone' ? 0.1 : 0.45; g.connect(send); send.connect(mixer.reverbIn);
      this.buses[k] = g;
    }
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
    const gain = ctx.createGain(); gain.gain.value = 0.25;
    const oscs = [0, 7, 12].map((_, i) => { const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sawtooth'; o.detune.value = (i - 1) * 6; o.connect(lp); o.start(); return o; });
    lp.connect(gain); gain.connect(this.buses.drone);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 90; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    this.drone = { oscs, gain, lp };
  }

  start() {
    if (this.running || !mixer.ctx) return;
    this.ensure(); this.running = true; this.next = mixer.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.tick(), 40);
    this.setCue(this.cueId, true);
  }
  stop() { this.running = false; clearInterval(this.timer); this.buses.strings && Object.values(this.buses).forEach((g) => g.gain.setTargetAtTime(0, mixer.ctx!.currentTime, 0.3)); }

  setCue(id: CueId, force = false) {
    if (id === this.cueId && !force) return;
    this.cueId = id; this.cue = CUES[id];
    if (!mixer.ctx || !this.running) return;
    const t = mixer.ctx.currentTime, c = this.cue;
    const lv: Record<string, number> = { strings: c.strings * 0.5, flute: c.flute * 0.7, brass: c.brass * 0.45, choir: c.choir * 0.5, perc: c.perc * 0.95, drone: c.drone * 0.8 };
    for (const k of Object.keys(lv)) this.buses[k].gain.setTargetAtTime(lv[k], t, 1.6);
    const f = mtof(c.root - 12);
    this.drone!.oscs.forEach((o, i) => o.frequency.setTargetAtTime(i === 1 ? f * 1.5 : i === 2 ? f * 2 : f, t, 1.5));
    this.melody = [];
    this.bar = 0; this.step = 0;
  }

  private scale(deg: number, oct = 0) {
    const m = MODES[this.cue.mode as string], n = m.length, o = Math.floor(deg / n), d = ((deg % n) + n) % n;
    return this.cue.root + m[d] + (o + oct) * 12;
  }

  private tick() {
    const ctx = mixer.ctx!;
    if (ctx.state !== 'running') { this.next = ctx.currentTime + 0.1; return; }
    const sp = 60 / this.cue.bpm / 4;
    while (this.next < ctx.currentTime + 0.25) { this.play(this.step, this.next, sp); this.next += sp; this.step++; }
  }

  private play(step: number, t: number, sp: number) {
    const c = this.cue, s16 = step % 16;
    if (s16 === 0) { this.barStart(t, sp * 16); this.bar++; }
    // percussion
    if (c.perc > 0.05) { const ch = PATS[c.pat][s16]; if (ch === 'D') this.drum(t, 'doum', 0.9); else if (ch === 'B') this.drum(t, 'taiko', 1); else if (ch === 't') this.drum(t, 'tek', 0.55); }
    // ostinato strings in driving cues
    if ((c.pat === 'battle' || c.pat === 'march') && c.strings > 0.3 && s16 % 2 === 0) {
      const deg = [0, 0, 1, 0, 2, 0, 1, 0][(s16 / 2) % 8] + (c.pat === 'battle' ? 0 : 0);
      this.pluck(this.scale(deg, 0), t, sp * 1.6, c.pat === 'battle' ? 0.5 : 0.3);
    }
    // flute melody
    if (c.flute > 0.05) {
      if (step % 32 === 0) this.makePhrase(step);
      this.melody = this.melody.filter((n) => { if (n.at <= step) { if (n.at === step) this.flute(this.scale(n.deg, 1), t, n.len * sp); return n.at > step; } return true; });
    }
  }

  private makePhrase(step: number) {
    const r = rngSeed(this.cue.seed * 977 + this.bar * 31 + 7);
    let deg = [0, 2, 4, 3][Math.floor(r() * 4)], at = step + (r() < 0.5 ? 2 : 0);
    const out: { at: number; len: number; deg: number }[] = [];
    while (at < step + 30) {
      const len = [2, 3, 4, 4, 6, 8][Math.floor(r() * 6)];
      if (r() > 0.18) out.push({ at, len, deg });
      at += len + (r() < 0.3 ? 2 : 0);
      deg += [-2, -1, -1, 0, 1, 1, 2, 3][Math.floor(r() * 8)];
      deg = Math.max(-2, Math.min(9, deg));
    }
    this.melody = out;
  }

  private barStart(t: number, dur: number) {
    const c = this.cue, ctx = mixer.ctx!, chord = c.chords[this.bar % c.chords.length];
    if (c.strings > 0.05) chord.forEach((d, i) => { [this.scale(d - (i === 0 ? 7 : 0), 0), this.scale(d, 1)].forEach((m, k) => this.pad(m, t, dur * 1.05, 'strings', 'sawtooth', 1700, k ? 0.05 : 0.07)); });
    if (c.choir > 0.05 && this.bar % 2 === 0) chord.slice(0, 3).forEach((d) => this.choir(this.scale(d, 1), t, dur * 2));
    if (c.brass > 0.05 && this.bar % 2 === 0) { this.brass(this.scale(chord[0], -1), t, dur * 1.6); this.brass(this.scale(chord[0] + 4, -1), t, dur * 1.6); }
    // sub bass pulse
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = mtof(this.scale(chord[0], -2));
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35 * c.drone, t + 0.3); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.buses.drone); o.start(t); o.stop(t + dur + 0.1);
  }

  // ---- voices ----
  private pad(m: number, t: number, dur: number, bus: string, type: OscillatorType, lpHz: number, vol: number) {
    const ctx = mixer.ctx!, g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = lpHz;
    [-9, 9].forEach((d) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = mtof(m); o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 1.5); });
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(1.0, dur * 0.4)); g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.linearRampToValueAtTime(0, t + dur + 1.3);
    lp.connect(g); g.connect(this.buses[bus]);
  }
  private pluck(m: number, t: number, dur: number, vol: number) {
    const ctx = mixer.ctx!, o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = mtof(m); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2400, t); lp.frequency.exponentialRampToValueAtTime(400, t + dur);
    g.gain.setValueAtTime(vol * 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(this.buses.strings); o.start(t); o.stop(t + dur + 0.05);
  }
  private brass(m: number, t: number, dur: number) {
    const ctx = mixer.ctx!, g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
    lp.frequency.setValueAtTime(250, t); lp.frequency.linearRampToValueAtTime(1500, t + dur * 0.45); lp.frequency.linearRampToValueAtTime(400, t + dur);
    [-5, 5].forEach((d) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 0.3); });
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.14, t + 0.5); g.gain.setValueAtTime(0.14, t + dur * 0.6); g.gain.linearRampToValueAtTime(0, t + dur);
    lp.connect(g); g.connect(this.buses.brass);
  }
  private choir(m: number, t: number, dur: number) {
    const ctx = mixer.ctx!, g = ctx.createGain(), o = ctx.createOscillator(), o2 = ctx.createOscillator();
    o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = mtof(m); o2.frequency.value = mtof(m); o2.detune.value = 12;
    const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.frequency.value = 650; f2.frequency.value = 1100; f1.Q.value = f2.Q.value = 5;
    const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.3; vg.gain.value = 9; vib.connect(vg); vg.connect(o.detune); vib.start(t); vib.stop(t + dur + 2);
    o.connect(f1); o2.connect(f2); const mix = ctx.createGain(); mix.gain.value = 0.9; f1.connect(mix); f2.connect(mix);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + dur * 0.4); g.gain.linearRampToValueAtTime(0, t + dur + 1.4);
    mix.connect(g); g.connect(this.buses.choir); o.start(t); o2.start(t); o.stop(t + dur + 1.6); o2.stop(t + dur + 1.6);
  }
  private flute(m: number, t: number, dur: number) {
    const ctx = mixer.ctx!, f = mtof(m + 12), g = ctx.createGain();
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.2; lg.gain.value = 9; lfo.connect(lg); lg.connect(o.detune); lg.connect(o2.detune);
    const og = ctx.createGain(); og.gain.value = 0.15; o2.connect(og);
    const br = mixer.noiseSrc(), bp = ctx.createBiquadFilter(), bg = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 4; bg.gain.value = 0.05;
    br.connect(bp); bp.connect(bg);
    const a = 0.09, d = Math.max(0.2, dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + a); g.gain.setValueAtTime(0.17, t + d - 0.1); g.gain.linearRampToValueAtTime(0, t + d + 0.15);
    o.connect(g); og.connect(g); bg.connect(g); g.connect(this.buses.flute);
    [o, o2, lfo, br].forEach((n) => { n.start(t); n.stop(t + d + 0.2); });
  }
  private drum(t: number, kind: 'doum' | 'tek' | 'taiko', vel: number) {
    const ctx = mixer.ctx!, g = ctx.createGain();
    if (kind === 'tek') {
      const n = mixer.noiseSrc(), hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 2600; hp.Q.value = 1.5;
      g.gain.setValueAtTime(0.35 * vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09); n.connect(hp); hp.connect(g); g.connect(this.buses.perc); n.start(t); n.stop(t + 0.12); return;
    }
    const o = ctx.createOscillator(); o.type = 'sine'; const big = kind === 'taiko';
    o.frequency.setValueAtTime(big ? 110 : 150, t); o.frequency.exponentialRampToValueAtTime(big ? 38 : 58, t + (big ? 0.35 : 0.18));
    g.gain.setValueAtTime((big ? 1.0 : 0.8) * vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + (big ? 1.3 : 0.5));
    const n = mixer.noiseSrc(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = big ? 900 : 600; const ng = ctx.createGain(); ng.gain.setValueAtTime(0.35 * vel, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    n.connect(lp); lp.connect(ng); ng.connect(this.buses.perc); n.start(t); n.stop(t + 0.15);
    o.connect(g); g.connect(this.buses.perc); o.start(t); o.stop(t + (big ? 1.4 : 0.6));
  }
}
export const music = new Music();
