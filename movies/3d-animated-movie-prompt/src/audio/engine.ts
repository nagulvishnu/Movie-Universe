import type { MusicVariant, Speaker } from "../film/types";

// ======================================================================
//  Audio architecture
//  - Music: fully procedural score (Web Audio) built around the theme "Tomorrow"
//  - Ambience + SFX: procedural Web Audio synthesis
//  - Dialogue/Narration: browser SpeechSynthesis FALLBACK (no recorded voice assets exist).
//    Any recorded file can be dropped in later by replacing Speech.speak().
// ======================================================================

export interface Volumes { master: number; music: number; sfx: number; voice: number }
const VKEY = "btlg.volumes";
const loadVol = (): Volumes => {
  try { return { master: 0.9, music: 0.8, sfx: 0.8, voice: 1, ...JSON.parse(localStorage.getItem(VKEY) || "{}") }; } catch { return { master: 0.9, music: 0.8, sfx: 0.8, voice: 1 }; }
};

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const MINOR: Record<number, number> = { 6: 5, 11: 10, 1: 0 };
const toMinor = (m: number) => m + (MINOR[((m % 12) + 12) % 12] !== undefined ? MINOR[((m % 12) + 12) % 12] - (((m % 12) + 12) % 12) : 0);

// ---- theme "Tomorrow" (D major, 8 bars) ----
const CHORDS: { b: number; t: number[] }[] = [
  { b: 38, t: [57, 62, 66] }, { b: 47, t: [54, 59, 62] }, { b: 43, t: [55, 59, 62] }, { b: 45, t: [57, 61, 64] },
  { b: 38, t: [57, 62, 66] }, { b: 42, t: [57, 61, 66] }, { b: 40, t: [55, 59, 64] }, { b: 45, t: [57, 61, 64] },
];
const MELODY: [number, number, number][][] = [
  [[0, 66, 1.5], [1.5, 69, 0.5], [2, 74, 2]],
  [[0, 73, 1], [1, 71, 1], [2, 69, 2]],
  [[0, 71, 1.5], [1.5, 67, 0.5], [2, 71, 1], [3, 74, 1]],
  [[0, 73, 2], [2, 69, 1], [3, 71, 1]],
  [[0, 66, 1], [1, 69, 1], [2, 74, 1.5], [3.5, 76, 0.5]],
  [[0, 78, 1.5], [1.5, 76, 0.5], [2, 73, 2]],
  [[0, 71, 1], [1, 74, 1], [2, 76, 1], [3, 74, 1]],
  [[0, 73, 1], [1, 71, 1], [2, 69, 2]],
];

interface VariantDef { bpm: number; minor?: boolean; mel?: "piano" | "strings" | "pluck" | "bell" | "none"; melOct?: number; melBars?: number; lh?: "arp" | "whole" | "none" | "strum" | "pluckArp"; pad?: "strings" | "soft" | "none"; bass?: boolean; timp?: boolean; dbl?: boolean; shaker?: boolean; drone?: boolean; vel: number }
const VARIANTS: Record<string, VariantDef> = {
  piano: { bpm: 70, mel: "piano", lh: "arp", pad: "none", vel: 1 },
  pianoSparse: { bpm: 64, mel: "piano", melBars: 4, lh: "whole", pad: "none", vel: 0.8 },
  guitar: { bpm: 76, mel: "pluck", lh: "strum", pad: "none", vel: 1 },
  strings: { bpm: 68, mel: "strings", lh: "arp", pad: "strings", bass: true, vel: 1 },
  full: { bpm: 72, mel: "strings", lh: "arp", pad: "strings", bass: true, timp: false, vel: 1.05 },
  peak: { bpm: 74, mel: "strings", lh: "arp", pad: "strings", bass: true, timp: true, dbl: true, vel: 1.25 },
  ambient: { bpm: 52, mel: "none", lh: "none", pad: "soft", vel: 0.9 },
  sad: { bpm: 58, minor: true, mel: "piano", melOct: -12, melBars: 4, lh: "whole", pad: "soft", vel: 0.85 },
  sadStrings: { bpm: 60, minor: true, mel: "strings", melOct: 0, lh: "arp", pad: "strings", bass: true, vel: 1 },
  tension: { bpm: 50, mel: "none", lh: "none", pad: "none", drone: true, vel: 1 },
  light: { bpm: 100, mel: "piano", melOct: 0, lh: "pluckArp", pad: "none", shaker: true, vel: 0.9 },
  box: { bpm: 66, mel: "bell", melOct: 12, lh: "none", pad: "soft", vel: 0.9 },
};

// ---- speech ----
const FEMALE_RE = /(female|zira|heera|neerja|aria|jenny|samantha|susan|hazel|libby|sonia|natasha|catherine|veena|aditi|swara|kalpana|karen|moira|tessa|fiona|google us english)/i;
const MALE_RE = /(\bmale\b|david|mark|ravi|prabhat|george|guy|james|daniel|rishi|hemant|alex|fred|oliver|thomas|google uk english male)/i;

class Speech {
  voices: SpeechSynthesisVoice[] = [];
  vol = 1;
  available = typeof window !== "undefined" && "speechSynthesis" in window;
  constructor() {
    if (this.available) {
      const load = () => (this.voices = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)));
      load();
      speechSynthesis.addEventListener?.("voiceschanged", load);
    }
  }
  pick(sp: Speaker): SpeechSynthesisVoice | undefined {
    const v = this.voices;
    if (!v.length) return undefined;
    const rank = (x: SpeechSynthesisVoice) => (/en-IN/i.test(x.lang) ? 0 : /en-GB/i.test(x.lang) ? 1 : /en-US/i.test(x.lang) ? 2 : 3) + (/natural|online/i.test(x.name) ? -0.5 : 0);
    const fem = v.filter((x) => FEMALE_RE.test(x.name)).sort((a, b) => rank(a) - rank(b));
    const mal = v.filter((x) => MALE_RE.test(x.name) && !FEMALE_RE.test(x.name)).sort((a, b) => rank(a) - rank(b));
    if (sp === "R") return mal[0] ?? v[0];
    if (sp === "N") return mal[1] ?? mal[0] ?? v[0];
    if (sp === "A" || sp === "W") return fem[0] ?? v[0];
    if (sp === "D") return fem[1] ?? fem[0] ?? v[0];
    return fem[2] ?? fem[0] ?? v[0];
  }
  speak(text: string, sp: Speaker, dur: number) {
    if (!this.available) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voice = this.pick(sp);
      if (voice) u.voice = voice;
      const prof: Record<Speaker, [number, number]> = { R: [0.86, 0.95], A: [1.12, 1.0], N: [0.78, 0.84], D: [0.98, 0.96], P: [1.05, 0.9], W: [1.08, 0.88] };
      u.pitch = prof[sp][0];
      const nat = text.length / 14;
      u.rate = Math.max(0.7, Math.min(1.25, prof[sp][1] * Math.max(0.85, Math.min(1.25, nat / Math.max(0.8, dur - 0.5)))));
      u.volume = this.vol * (sp === "N" || sp === "W" ? 0.85 : 1);
      u.lang = voice?.lang || "en-IN";
      speechSynthesis.speak(u);
    } catch { /* ignore */ }
  }
  cancel() { if (this.available) try { speechSynthesis.cancel(); } catch { /* */ } }
  pause() { if (this.available) try { speechSynthesis.pause(); } catch { /* */ } }
  resume() { if (this.available) try { speechSynthesis.resume(); } catch { /* */ } }
}

// ======================================================================
class AudioEngine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  musicBus!: GainNode;
  sfxBus!: GainNode;
  reverb!: ConvolverNode;
  revSend!: GainNode;
  noiseBuf!: AudioBuffer;
  vol: Volumes = loadVol();
  speech = new Speech();
  muted = false;
  private amb = new Map<string, { g: GainNode; stop: () => void }>();
  private cue: { v: string; bus: GainNode; timer: number; stop: () => void } | null = null;

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new C();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3;
    this.musicBus = ctx.createGain();
    this.sfxBus = ctx.createGain();
    this.musicBus.connect(comp);
    this.sfxBus.connect(comp);
    comp.connect(this.master);
    // reverb
    const len = ctx.sampleRate * 3.2;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = ir;
    this.revSend = ctx.createGain();
    this.revSend.gain.value = 0.38;
    this.revSend.connect(this.reverb);
    this.reverb.connect(this.musicBus);
    // noise
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const nd = this.noiseBuf.getChannelData(0);
    let b0 = 0;
    for (let i = 0; i < nd.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.97 * b0 + 0.03 * w; nd[i] = w * 0.6 + b0 * 4; }
    this.applyVolumes();
  }

  setVolumes(v: Partial<Volumes>) {
    this.vol = { ...this.vol, ...v };
    try { localStorage.setItem(VKEY, JSON.stringify(this.vol)); } catch { /* */ }
    this.applyVolumes();
  }
  setMuted(m: boolean) { this.muted = m; this.applyVolumes(); }
  private applyVolumes() {
    const m = this.muted ? 0 : this.vol.master;
    this.speech.vol = m * this.vol.voice;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(m, t, 0.05);
    this.musicBus.gain.setTargetAtTime(this.vol.music, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(this.vol.sfx, t, 0.05);
  }
  pause() { void this.ctx?.suspend(); this.speech.pause(); }
  resume() { void this.ctx?.resume(); this.speech.resume(); }

  // ---------------- helpers ----------------
  private noiseSrc(out: AudioNode, filt?: { type: BiquadFilterType; f: number; q?: number }[], gain = 1) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf; s.loop = true;
    s.loopStart = Math.random() * 1.5;
    let node: AudioNode = s;
    for (const f of filt ?? []) {
      const b = ctx.createBiquadFilter();
      b.type = f.type; b.frequency.value = f.f; b.Q.value = f.q ?? 0.7;
      node.connect(b); node = b;
    }
    const g = ctx.createGain(); g.gain.value = gain;
    node.connect(g); g.connect(out);
    s.start();
    return { src: s, gain: g };
  }
  private burst(t: number, dur: number, f: number, q: number, gain: number, type: BiquadFilterType = "bandpass", out?: AudioNode) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(b); b.connect(g); g.connect(out ?? this.sfxBus);
    s.start(t, Math.random() * 2, dur + 0.05);
  }
  private tone(t: number, f: number, dur: number, gain: number, type: OscillatorType = "sine", slideTo?: number, out?: AudioNode, attack = 0.005) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out ?? this.sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // ---------------- SFX ----------------
  fx(name: string) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime + 0.02;
    const step = (at: number, wet: boolean, hard = 1, sand = false) => {
      if (sand) { this.burst(at, 0.16, 1400, 0.5, 0.1 * hard, "bandpass"); return; }
      this.burst(at, 0.07, wet ? 700 : 400, 0.8, 0.22 * hard, "lowpass");
      this.tone(at, 95, 0.09, 0.2 * hard, "sine", 55);
      if (wet) this.burst(at + 0.02, 0.12, 3500, 0.6, 0.05, "highpass");
    };
    switch (name) {
      case "shutter":
        this.burst(t, 0.03, 4200, 1.2, 0.5); this.burst(t + 0.07, 0.05, 2400, 1.0, 0.45); this.tone(t, 150, 0.08, 0.2, "square", 70);
        break;
      case "door":
        this.tone(t, 130, 0.25, 0.5, "sine", 45); this.burst(t, 0.2, 500, 0.7, 0.3, "lowpass"); this.burst(t + 0.05, 0.03, 2500, 2, 0.15);
        break;
      case "doorbell":
        this.tone(t, 1568, 1.3, 0.12, "sine"); this.tone(t + 0.18, 2093, 1.5, 0.1, "sine"); this.tone(t, 3136, 0.5, 0.03, "sine");
        break;
      case "paper": this.burst(t, 0.4, 3200, 0.5, 0.12); this.burst(t + 0.3, 0.3, 2400, 0.5, 0.08); break;
      case "steps": for (let i = 0; i < 8; i++) step(t + i * 0.52, false, 0.8); break;
      case "stepsWet": for (let i = 0; i < 9; i++) step(t + i * 0.45, true, 0.9); break;
      case "stepsRun": for (let i = 0; i < 12; i++) step(t + i * 0.27, true, 1.1); break;
      case "stepsSand": for (let i = 0; i < 8; i++) step(t + i * 0.55, false, 0.8, true); break;
      case "horn":
        this.tone(t, 311, 2.2, 0.16, "sawtooth", 305, undefined, 0.3); this.tone(t, 392, 2.2, 0.13, "sawtooth", 385, undefined, 0.3);
        break;
      case "chime": [659, 523, 392].forEach((f, i) => this.tone(t + i * 0.45, f, 1.4, 0.13, "sine")); break;
      case "ring": for (let i = 0; i < 4; i++) { this.tone(t + i * 0.9, 440, 0.4, 0.06, "sine"); this.tone(t + i * 0.9, 480, 0.4, 0.06, "sine"); } break;
      case "clink": this.tone(t, 3100, 0.25, 0.06, "sine"); this.tone(t + 0.03, 4200, 0.2, 0.03, "sine"); break;
      case "beep": this.tone(t, 1760, 0.12, 0.05, "square"); break;
      case "thud": this.tone(t, 90, 0.2, 0.3, "sine", 40); break;
      case "thunder": this.burst(t, 3.5, 90, 0.5, 0.5, "lowpass"); break;
      case "knock": for (let i = 0; i < 3; i++) { this.tone(t + i * 0.22, 180, 0.1, 0.4, "sine", 110); this.burst(t + i * 0.22, 0.06, 900, 1, 0.15); } break;
      case "rec": this.tone(t, 1200, 0.18, 0.05, "sine"); this.tone(t + 0.25, 1800, 0.22, 0.05, "sine"); break;
      case "tick": this.tone(t, 2400, 0.03, 0.06, "square"); break;
      case "sigh": this.burst(t, 1.2, 1200, 0.3, 0.05, "bandpass"); break;
      case "wind": this.burst(t, 3, 500, 0.3, 0.12, "bandpass"); break;
    }
  }

  // ---------------- ambience ----------------
  setAmbience(names: string[]) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    for (const [n, a] of this.amb) {
      if (!names.includes(n)) {
        a.g.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
        const stop = a.stop;
        setTimeout(stop, 2500);
        this.amb.delete(n);
      }
    }
    for (const n of names) {
      if (this.amb.has(n)) continue;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(this.sfxBus);
      const cleanup: (() => void)[] = [];
      this.buildAmb(n, g, cleanup);
      g.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
      this.amb.set(n, { g, stop: () => { cleanup.forEach((f) => f()); g.disconnect(); } });
    }
  }
  private lfo(target: AudioParam, f: number, depth: number, cleanup: (() => void)[]) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(); o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = depth;
    o.connect(g); g.connect(target); o.start();
    cleanup.push(() => { try { o.stop(); } catch { /* */ } });
  }
  private every(ms: number, fn: () => void, cleanup: (() => void)[]) {
    const id = window.setInterval(() => { if (this.ctx && this.ctx.state === "running") fn(); }, ms);
    cleanup.push(() => clearInterval(id));
  }
  private buildAmb(n: string, out: GainNode, cl: (() => void)[]) {
    const ctx = this.ctx!;
    const track = (r: { src: AudioBufferSourceNode }) => cl.push(() => { try { r.src.stop(); } catch { /* */ } });
    switch (n) {
      case "rain": {
        track(this.noiseSrc(out, [{ type: "highpass", f: 900 }, { type: "lowpass", f: 8000 }], 0.22));
        track(this.noiseSrc(out, [{ type: "lowpass", f: 500 }], 0.18));
        break;
      }
      case "rainSoft": track(this.noiseSrc(out, [{ type: "highpass", f: 1500 }, { type: "lowpass", f: 7000 }], 0.1)); break;
      case "station": {
        const r = this.noiseSrc(out, [{ type: "bandpass", f: 600, q: 0.5 }], 0.05); track(r);
        const o = ctx.createOscillator(); o.frequency.value = 60; const g = ctx.createGain(); g.gain.value = 0.03; o.connect(g); g.connect(out); o.start(); cl.push(() => o.stop());
        this.every(14000, () => this.fx("chime"), cl);
        this.every(23000, () => this.fx("horn"), cl);
        break;
      }
      case "train": {
        const r = this.noiseSrc(out, [{ type: "lowpass", f: 180 }], 0.5); track(r);
        this.lfo(r.gain.gain, 0.12, 0.25, cl);
        this.every(170, () => this.burst(ctx.currentTime + 0.01, 0.04, 1800, 2, 0.04), cl);
        break;
      }
      case "wind": {
        const r = this.noiseSrc(out, [{ type: "bandpass", f: 420, q: 0.5 }], 0.12); track(r);
        this.lfo(r.gain.gain, 0.09, 0.08, cl);
        break;
      }
      case "sea": {
        const r = this.noiseSrc(out, [{ type: "lowpass", f: 900 }], 0.32); track(r);
        this.lfo(r.gain.gain, 0.11, 0.25, cl);
        const r2 = this.noiseSrc(out, [{ type: "bandpass", f: 1800, q: 0.4 }], 0.04); track(r2);
        this.lfo(r2.gain.gain, 0.13, 0.04, cl);
        break;
      }
      case "cafe": {
        const r = this.noiseSrc(out, [{ type: "bandpass", f: 850, q: 0.6 }], 0.035); track(r);
        this.lfo(r.gain.gain, 0.3, 0.015, cl);
        this.every(4200, () => { if (Math.random() < 0.7) this.fx("clink"); }, cl);
        break;
      }
      case "room": { track(this.noiseSrc(out, [{ type: "lowpass", f: 220 }], 0.05)); break; }
      case "hospital": {
        track(this.noiseSrc(out, [{ type: "lowpass", f: 300 }], 0.06));
        const o = ctx.createOscillator(); o.frequency.value = 100; const g = ctx.createGain(); g.gain.value = 0.015; o.connect(g); g.connect(out); o.start(); cl.push(() => o.stop());
        this.every(3700, () => this.fx("beep"), cl);
        break;
      }
      case "street": {
        const r = this.noiseSrc(out, [{ type: "bandpass", f: 700, q: 0.4 }], 0.04); track(r);
        const r2 = this.noiseSrc(out, [{ type: "lowpass", f: 260 }], 0.1); track(r2);
        this.lfo(r2.gain.gain, 0.07, 0.07, cl);
        break;
      }
      case "crowd": { const r = this.noiseSrc(out, [{ type: "bandpass", f: 520, q: 0.4 }], 0.09); track(r); this.lfo(r.gain.gain, 0.4, 0.03, cl); break; }
      case "birds": {
        this.every(900, () => {
          if (Math.random() < 0.55) return;
          const t = ctx.currentTime + 0.02, f = 2600 + Math.random() * 1800;
          for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) this.tone(t + i * 0.11, f, 0.09, 0.02, "sine", f * (1.2 + Math.random() * 0.5), out);
        }, cl);
        break;
      }
      case "gulls": {
        this.every(5200, () => {
          if (Math.random() < 0.4) return;
          const t = ctx.currentTime + 0.05;
          this.tone(t, 1500, 0.35, 0.025, "sawtooth", 900, out); this.tone(t + 0.4, 1300, 0.4, 0.02, "sawtooth", 800, out);
        }, cl);
        break;
      }
      case "night": {
        const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = 4300;
        const g = ctx.createGain(); g.gain.value = 0.0;
        o.connect(g); g.connect(out); o.start(); cl.push(() => o.stop());
        const m = ctx.createOscillator(); m.type = "square"; m.frequency.value = 28; const mg = ctx.createGain(); mg.gain.value = 0.005; m.connect(mg); mg.connect(g.gain); m.start(); cl.push(() => m.stop());
        break;
      }
      case "sizzle": track(this.noiseSrc(out, [{ type: "highpass", f: 3500 }], 0.05)); break;
      case "market": {
        const r = this.noiseSrc(out, [{ type: "bandpass", f: 650, q: 0.4 }], 0.08); track(r);
        this.lfo(r.gain.gain, 0.5, 0.03, cl);
        this.every(3500, () => this.fx("clink"), cl);
        break;
      }
      case "tape": { track(this.noiseSrc(out, [{ type: "highpass", f: 4000 }], 0.015)); break; }
    }
  }

  // ---------------- music ----------------
  setMusic(v: MusicVariant, vol = 1) {
    if (!this.ctx) return;
    if (this.cue && this.cue.v === v) {
      this.cue.bus.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.4);
      return;
    }
    const ctx = this.ctx;
    if (this.cue) {
      const old = this.cue;
      old.bus.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
      clearInterval(old.timer);
      setTimeout(() => { old.stop(); }, 5000);
      this.cue = null;
    }
    if (v === "off") return;
    const def = VARIANTS[v];
    if (!def) return;
    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.gain.setTargetAtTime(vol, ctx.currentTime, 0.6);
    bus.connect(this.musicBus);
    const send = ctx.createGain(); send.gain.value = 0.9; bus.connect(send); send.connect(this.revSend);
    let step = 0;
    let next = ctx.currentTime + 0.2;
    const stepDur = 60 / def.bpm / 2;
    const tick = () => {
      if (ctx.state !== "running") return;
      while (next < ctx.currentTime + 0.4) { this.musicStep(def, step, next, stepDur, bus); step++; next += stepDur; }
    };
    const timer = window.setInterval(tick, 80);
    tick();
    this.cue = { v, bus, timer, stop: () => { try { bus.disconnect(); send.disconnect(); } catch { /* */ } } };
  }

  private musicStep(def: VariantDef, step: number, t: number, sd: number, bus: GainNode) {
    const s = step % 8;
    const bar = Math.floor(step / 8) % 8;
    const ch = CHORDS[bar];
    const mm = (n: number) => (def.minor ? toMinor(n) : n);
    const v = def.vel;
    const barDur = sd * 8;
    // left hand / accompaniment
    if (def.lh === "arp") {
      const seq = [ch.b, ch.t[0], ch.t[1], ch.t[2], ch.t[1], ch.t[0], ch.t[1], ch.t[0]];
      this.piano(t, mm(seq[s]), sd * (s === 0 ? 3 : 1.8), (s === 0 ? 0.2 : 0.1 + (s % 2 ? 0 : 0.03)) * v, bus);
    } else if (def.lh === "whole") {
      if (s === 0) { this.piano(t, mm(ch.b), barDur, 0.17 * v, bus); this.piano(t + 0.02, mm(ch.t[1]), barDur * 0.8, 0.08 * v, bus); }
    } else if (def.lh === "strum") {
      if ([0, 3, 4, 7].includes(s)) {
        if (s === 0) this.pluck(t, mm(ch.b), sd * 3, 0.16 * v, bus);
        ch.t.forEach((n, i) => this.pluck(t + i * 0.03 + 0.01, mm(n), sd * 2, 0.08 * v, bus));
      }
    } else if (def.lh === "pluckArp") {
      const seq = [ch.b, ch.t[0], ch.t[1], ch.t[2], ch.t[1], ch.t[2], ch.t[1], ch.t[0]];
      this.pluck(t, mm(seq[s]), sd * 1.6, (s === 0 ? 0.16 : 0.09) * v, bus);
    }
    if (def.bass && s === 0) this.bass(t, mm(ch.b), barDur * 0.95, 0.16 * v, bus);
    if (def.pad && def.pad !== "none" && s === 0) {
      const strings = def.pad === "strings";
      ch.t.forEach((n, i) => (strings ? this.strings(t + i * 0.04, mm(n), barDur * 1.05, 0.05 * v, bus) : this.soft(t, mm(n) - (i === 2 ? 12 : 0), barDur * 1.15, 0.045 * v, bus)));
    }
    if (def.timp && s === 0 && bar % 2 === 0) this.timp(t, 0.2, bus);
    if (def.shaker && s % 2 === 1) this.burst(t, 0.05, 7000, 1, 0.025, "highpass", bus);
    // melody
    const melBars = def.melBars ?? 8;
    if (def.mel && def.mel !== "none" && (step / 8) % 8 < 8 && Math.floor(step / 8) % (melBars === 8 ? 8 : 8) < melBars) {
      for (const [bo, m, d] of MELODY[bar]) {
        if (Math.abs(bo - s / 2) > 0.01) continue;
        const note = mm(m + (def.melOct ?? 0));
        const dur = d * sd * 2;
        if (def.mel === "piano") this.piano(t, note, dur, 0.26 * v, bus);
        else if (def.mel === "strings") { this.strings(t, note, dur * 1.1, 0.085 * v, bus); if (def.dbl) this.piano(t, note + 12, dur, 0.14 * v, bus); else this.piano(t, note, dur, 0.1 * v, bus); }
        else if (def.mel === "pluck") this.pluck(t, note + 12, dur, 0.15 * v, bus);
        else if (def.mel === "bell") this.bell(t, note, dur + 0.8, 0.12 * v, bus);
      }
    }
    if (def.drone && s === 0 && bar % 2 === 0) {
      this.soft(t, 26, barDur * 2.2, 0.12, bus); this.soft(t, 33, barDur * 2.2, 0.08, bus);
      if (bar % 4 === 2) this.soft(t + 0.5, 90, barDur, 0.015, bus);
      this.soft(t + barDur, 91, barDur * 1.5, 0.012, bus);
    }
    if (def.drone && s === 0) this.tone(t, 55, 0.5, 0.12, "sine", 45, bus);
  }

  // instruments
  private piano(t: number, m: number, dur: number, vel: number, out: AudioNode) {
    const ctx = this.ctx!, f = mtof(m);
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = Math.min(9000, f * 7 + 600);
    const rel = Math.max(1.0, dur * 1.2) + (m < 50 ? 1.2 : 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + rel);
    g.connect(lp); lp.connect(out);
    [[1, 1], [2, 0.42], [3, 0.2], [4, 0.1], [5, 0.05]].forEach(([k, a], i) => {
      const o = ctx.createOscillator(); o.type = i === 0 ? "triangle" : "sine"; o.frequency.value = f * k * (1 + (Math.random() - 0.5) * 0.0008);
      const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(g);
      o.start(t); o.stop(t + rel + 0.1);
    });
    this.burst(t, 0.03, Math.min(5000, f * 3), 1, vel * 0.1, "bandpass", out);
  }
  private strings(t: number, m: number, dur: number, vel: number, out: AudioNode) {
    const ctx = this.ctx!, f = mtof(m);
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500 + f * 1.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + Math.min(0.7, dur * 0.4));
    g.gain.setValueAtTime(vel, t + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
    g.connect(lp); lp.connect(out);
    [-7, 0, 7].forEach((c) => {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = c;
      const v = ctx.createOscillator(); v.frequency.value = 5.2; const vg = ctx.createGain(); vg.gain.value = 3; v.connect(vg); vg.connect(o.detune);
      o.connect(g); o.start(t); v.start(t); o.stop(t + dur + 1); v.stop(t + dur + 1);
    });
  }
  private soft(t: number, m: number, dur: number, vel: number, out: AudioNode) {
    const ctx = this.ctx!, f = mtof(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.8);
    g.connect(out);
    ["sine", "triangle"].forEach((ty, i) => {
      const o = ctx.createOscillator(); o.type = ty as OscillatorType; o.frequency.value = f * (i ? 1.002 : 1);
      const og = ctx.createGain(); og.gain.value = i ? 0.35 : 1; o.connect(og); og.connect(g);
      o.start(t); o.stop(t + dur + 1);
    });
  }
  private pluck(t: number, m: number, dur: number, vel: number, out: AudioNode) {
    const ctx = this.ctx!, f = mtof(m);
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(Math.min(6000, f * 8), t); lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 1.5), t + 0.5);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.8, dur * 1.3));
    g.connect(lp); lp.connect(out);
    ["triangle", "sawtooth"].forEach((ty, i) => {
      const o = ctx.createOscillator(); o.type = ty as OscillatorType; o.frequency.value = f;
      const og = ctx.createGain(); og.gain.value = i ? 0.2 : 0.8; o.connect(og); og.connect(g);
      o.start(t); o.stop(t + Math.max(0.9, dur * 1.3) + 0.1);
    });
  }
  private bell(t: number, m: number, dur: number, vel: number, out: AudioNode) {
    const ctx = this.ctx!, f = mtof(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1);
    g.connect(out);
    [[1, 1], [2.76, 0.3], [5.4, 0.12]].forEach(([k, a]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * k;
      const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 1.1);
    });
  }
  private bass(t: number, m: number, dur: number, vel: number, out: AudioNode) {
    const ctx = this.ctx!, f = mtof(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(out);
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + dur + 0.1);
    const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = f * 2; const g2 = ctx.createGain(); g2.gain.value = 0.2; o2.connect(g2); g2.connect(g); o2.start(t); o2.stop(t + dur + 0.1);
  }
  private timp(t: number, vel: number, out: AudioNode) {
    this.tone(t, 90, 0.9, vel, "sine", 48, out, 0.01);
    this.burst(t, 0.12, 200, 0.8, vel * 0.4, "lowpass", out);
  }

  stopAll() {
    this.speech.cancel();
    this.setMusic("off");
    this.setAmbience([]);
  }
}

export const audio = new AudioEngine();
