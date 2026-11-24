"use client";

// Procedural portal audio (WebAudio, zero audio files). Only ever starts after a user gesture,
// is capped at a modest master level, and is fully silenced while a movie is being watched.

type Sfx = "hover" | "click" | "portal" | "transition";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: GainNode | null = null;
let started = false;
let enabled = false;
let volume = 0.35;
let suspended = false; // true on /watch pages
let lastHover = 0;

const MAX_LEVEL = 0.55; // hard ceiling so nothing can be unexpectedly loud

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  return ctx;
}

function startAmbient() {
  if (!ctx || !master || started) return;
  started = true;
  ambient = ctx.createGain();
  ambient.gain.value = 0.0;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 380;
  filter.Q.value = 4;
  ambient.connect(filter).connect(master);

  const freqs = [55, 55.4, 82.4, 110.3];
  for (const f of freqs) {
    const o = ctx.createOscillator();
    o.type = f > 100 ? "sine" : "sawtooth";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = f > 100 ? 0.05 : 0.07;
    o.connect(g).connect(ambient);
    o.start();
  }
  // slow breathing LFO on the filter
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lg = ctx.createGain();
  lg.gain.value = 140;
  lfo.connect(lg).connect(filter.frequency);
  lfo.start();
  ambient.gain.setTargetAtTime(0.5, ctx.currentTime, 2.5);
}

function apply() {
  if (!ctx || !master) return;
  const target = enabled && !suspended ? Math.min(MAX_LEVEL, volume * MAX_LEVEL * 1.6) : 0;
  master.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
}

/** Call from a user gesture (click/keydown/pointerdown). Safe to call repeatedly. */
export function unlockAudio() {
  const c = ensure();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  startAmbient();
  apply();
}

export function configureAudio(opts: { enabled: boolean; volume: number; suspended: boolean }) {
  enabled = opts.enabled;
  volume = opts.volume;
  suspended = opts.suspended;
  if (enabled && ctx) {
    if (ctx.state === "suspended" && !suspended) void ctx.resume();
    startAmbient();
  }
  apply();
}

function tone(freq: number, dur: number, type: OscillatorType, peak: number, slideTo?: number, delay = 0) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function sweep(dur: number, from: number, to: number, peak: number) {
  if (!ctx || !master) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 2;
  const t = ctx.currentTime;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

export function sfx(kind: Sfx) {
  if (!enabled || suspended || !ctx || ctx.state !== "running") return;
  switch (kind) {
    case "hover": {
      const now = performance.now();
      if (now - lastHover < 90) return;
      lastHover = now;
      tone(880, 0.09, "sine", 0.05, 1320);
      break;
    }
    case "click":
      tone(440, 0.14, "triangle", 0.12, 660);
      tone(1320, 0.2, "sine", 0.05, undefined, 0.04);
      break;
    case "portal":
      sweep(1.6, 200, 3200, 0.25);
      tone(110, 1.6, "sawtooth", 0.08, 330);
      tone(220, 1.8, "sine", 0.1, 660, 0.1);
      break;
    case "transition":
      sweep(0.9, 1800, 240, 0.18);
      tone(165, 0.9, "sine", 0.1, 82);
      break;
  }
}
