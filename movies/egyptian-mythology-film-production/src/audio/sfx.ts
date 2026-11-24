import type { AmbId, SfxId } from '../film/types';
import { mixer } from './mixer';

// Synthesised sound effects and ambience beds (all generated in-browser, nothing downloaded).
type Stop = () => void;
interface Bed { gain: GainNode; stop: Stop }

const beds = new Map<AmbId, Bed>();

function noiseThrough(type: BiquadFilterType, freq: number, q = 1) {
  const ctx = mixer.ctx!, n = mixer.noiseSrc(), f = ctx.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q; n.connect(f); n.start();
  return { n, f };
}
function lfo(target: AudioParam, rate: number, depth: number) {
  const ctx = mixer.ctx!, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g); g.connect(target); o.start(); return o;
}
function tone(freq: number, t: number, dur: number, vol: number, type: OscillatorType = 'sine', dest?: AudioNode, bend?: number) {
  const ctx = mixer.ctx!, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (bend) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * bend), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  o.connect(g); g.connect(dest ?? mixer.sfx); const send = ctx.createGain(); send.gain.value = 0.3; g.connect(send); send.connect(mixer.reverbIn);
  o.start(t); o.stop(t + dur + 0.05);
}
function burst(type: BiquadFilterType, freq: number, t: number, dur: number, vol: number, q = 1, sweepTo?: number, attack = 0.005) {
  const ctx = mixer.ctx!, n = mixer.noiseSrc(false), f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type = type; f.frequency.setValueAtTime(freq, t); if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur); f.Q.value = q;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  n.connect(f); f.connect(g); g.connect(mixer.sfx); const send = ctx.createGain(); send.gain.value = 0.35; g.connect(send); send.connect(mixer.reverbIn);
  n.start(t, Math.random() * 2); n.stop(t + dur + 0.05);
}

export function playSfx(id: SfxId) {
  const ctx = mixer.ctx; if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  switch (id) {
    case 'thunder': burst('lowpass', 500, t, 3.2, 1.0, 0.7, 60, 0.04); burst('lowpass', 160, t + 0.1, 3.8, 0.9, 0.7, 40, 0.2); burst('highpass', 3000, t, 0.25, 0.5); break;
    case 'impact': tone(120, t, 0.7, 0.9, 'sine', undefined, 0.3); burst('lowpass', 900, t, 0.35, 0.7); break;
    case 'boom': tone(70, t, 2.2, 1.0, 'sine', undefined, 0.45); burst('lowpass', 300, t, 1.8, 0.8, 1, 50, 0.02); break;
    case 'whoosh': burst('bandpass', 400, t, 1.1, 0.5, 1.2, 3000, 0.4); break;
    case 'wing': burst('bandpass', 700, t, 0.7, 0.4, 2, 1600, 0.2); burst('bandpass', 900, t + 0.3, 0.6, 0.3, 2, 400, 0.1); break;
    case 'clash': [1800, 2650, 3900, 5300].forEach((f, i) => tone(f * (1 + i * 0.013), t, 0.9, 0.18, 'sine')); burst('highpass', 2500, t, 0.15, 0.6); tone(150, t, 0.3, 0.5, 'sine', undefined, 0.5); break;
    case 'roar': { const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(48, t + 2.2); lp.type = 'lowpass'; lp.frequency.setValueAtTime(220, t); lp.frequency.linearRampToValueAtTime(900, t + 0.6); lp.frequency.linearRampToValueAtTime(150, t + 2.4); const l = lfo(o.frequency, 22, 9); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.7, t + 0.2); g.gain.exponentialRampToValueAtTime(0.001, t + 2.5); o.connect(lp); lp.connect(g); g.connect(mixer.sfx); o.start(t); o.stop(t + 2.6); l.stop(t + 2.6); burst('bandpass', 400, t, 2.2, 0.4, 0.8, 120, 0.2); break; }
    case 'hiss': burst('highpass', 3500, t, 1.8, 0.55, 0.8, 7000, 0.5); burst('bandpass', 5000, t + 0.2, 1.2, 0.3, 3); break;
    case 'door': burst('lowpass', 250, t, 2.2, 0.8, 2, 90, 0.3); tone(55, t + 1.6, 1.0, 0.8, 'sine', undefined, 0.6); break;
    case 'shimmer': [1046, 1318, 1568, 2093, 2637].forEach((f, i) => tone(f, t + i * 0.09, 2.2, 0.08, 'sine')); break;
    case 'bell': tone(660, t, 3.5, 0.2, 'sine'); tone(990 * 1.003, t, 3, 0.1, 'sine'); tone(1480, t, 2.2, 0.06, 'sine'); break;
    case 'gong': tone(98, t, 6, 0.5, 'sine'); tone(147, t, 5, 0.3, 'sine'); tone(231, t, 4, 0.2, 'triangle'); burst('bandpass', 1500, t, 2, 0.2, 1); break;
    case 'transform': burst('bandpass', 300, t, 1.6, 0.5, 3, 4000, 0.8); [392, 587, 784].forEach((f, i) => tone(f, t + 0.6 + i * 0.1, 2, 0.1, 'sawtooth')); break;
    case 'solar': { [220, 330, 440, 554, 660].forEach((f) => tone(f, t, 3.6, 0.06, 'sawtooth')); burst('bandpass', 200, t, 3, 0.4, 1.5, 2500, 1.4); tone(55, t, 3, 0.5, 'sine'); break; }
    case 'splash': burst('bandpass', 1200, t, 0.9, 0.7, 0.8, 300, 0.01); burst('lowpass', 500, t, 1.2, 0.5, 0.7, 150, 0.03); break;
    case 'step': [0, 0.45, 0.9].forEach((d) => { tone(90, t + d, 0.15, 0.3, 'sine', undefined, 0.6); burst('lowpass', 800, t + d, 0.1, 0.3); }); break;
    case 'chant': [0, 7, 12].forEach((s, i) => { const f = 146.8 * Math.pow(2, s / 12), o = ctx.createOscillator(), g = ctx.createGain(), bp = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; bp.type = 'bandpass'; bp.frequency.value = 700 + i * 120; bp.Q.value = 5; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 1.2); g.gain.linearRampToValueAtTime(0, t + 3.2); o.connect(bp); bp.connect(g); g.connect(mixer.sfx); o.start(t); o.stop(t + 3.3); }); break;
  }
}

// ---- Ambience beds ----
function makeBed(id: AmbId): Bed {
  const ctx = mixer.ctx!, gain = ctx.createGain(); gain.gain.value = 0; gain.connect(mixer.sfx);
  const stops: Stop[] = [], timers: number[] = [];
  const add = (n: AudioScheduledSourceNode) => stops.push(() => { try { n.stop(); } catch { /* already stopped */ } });
  const rnd = (fn: () => void, min: number, max: number) => { const run = () => { fn(); timers.push(window.setTimeout(run, (min + Math.random() * (max - min)) * 1000)); }; timers.push(window.setTimeout(run, Math.random() * max * 1000)); };
  const chain = (type: BiquadFilterType, f: number, q: number, vol: number) => { const { n, f: fl } = noiseThrough(type, f, q); const g = ctx.createGain(); g.gain.value = vol; fl.connect(g); g.connect(gain); add(n); return { fl, g }; };
  switch (id) {
    case 'wind': { const a = chain('bandpass', 500, 0.8, 0.5); add(lfo(a.fl.frequency, 0.11, 220)); add(lfo(a.g.gain, 0.07, 0.25)); chain('highpass', 4000, 0.5, 0.05); break; }
    case 'water': { const a = chain('lowpass', 650, 0.7, 0.55); add(lfo(a.g.gain, 0.23, 0.2)); chain('bandpass', 1500, 1.2, 0.07); rnd(() => tone(600 + Math.random() * 900, ctx.currentTime, 0.2, 0.05, 'sine', gain, 1.6), 0.6, 2.2); break; }
    case 'nile': { const a = chain('lowpass', 500, 0.7, 0.35); add(lfo(a.g.gain, 0.2, 0.12)); rnd(() => { const f = 2400 + Math.random() * 1600, t = ctx.currentTime; [0, 0.12, 0.26].forEach((d) => tone(f * (1 + d), t + d, 0.1, 0.035, 'sine', gain, 1.3)); }, 1.5, 5); chain('bandpass', 700, 0.8, 0.12); break; }
    case 'temple': { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 55; g.gain.value = 0.2; o.connect(g); g.connect(gain); o.start(); add(o); chain('lowpass', 180, 0.7, 0.4); rnd(() => tone(1200 + Math.random() * 500, ctx.currentTime, 1.6, 0.03, 'sine', gain), 3, 8); break; }
    case 'underworld': { const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(); o1.frequency.value = 41; o2.frequency.value = 43.2; g.gain.value = 0.25; o1.connect(g); o2.connect(g); g.connect(gain); o1.start(); o2.start(); add(o1); add(o2); chain('lowpass', 120, 0.7, 0.8); rnd(() => { const { n, f } = noiseThrough('bandpass', 1200 + Math.random() * 1500, 6); const g2 = ctx.createGain(), t = ctx.currentTime; g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(0.07, t + 1.4); g2.gain.linearRampToValueAtTime(0, t + 3); f.connect(g2); g2.connect(gain); setTimeout(() => { try { n.stop(); } catch { /* */ } }, 3200); }, 2, 6); break; }
    case 'fire': { chain('lowpass', 300, 0.6, 0.35); rnd(() => burst('highpass', 2500 + Math.random() * 2000, ctx.currentTime, 0.04 + Math.random() * 0.04, 0.12, 1), 0.08, 0.5); break; }
    case 'storm': { const a = chain('bandpass', 400, 0.7, 0.7); add(lfo(a.fl.frequency, 0.15, 300)); chain('highpass', 2500, 0.5, 0.1); rnd(() => playSfx('thunder'), 6, 14); break; }
    case 'night': { chain('bandpass', 380, 0.8, 0.1); const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 4300; g.gain.value = 0; o.connect(g); g.connect(gain); o.start(); add(o); add(lfo(g.gain, 13, 0.012)); const o2 = ctx.createOscillator(), g3 = ctx.createGain(); o2.frequency.value = 5200; g3.gain.value = 0; o2.connect(g3); g3.connect(gain); o2.start(); add(o2); add(lfo(g3.gain, 9, 0.008)); break; }
    case 'cosmic': { [220, 329.6, 659.3].forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f * (1 + i * 0.002); g.gain.value = 0.015; o.connect(g); g.connect(gain); o.start(); add(o); add(lfo(g.gain, 0.05 + i * 0.03, 0.012)); }); chain('bandpass', 2400, 4, 0.02); break; }
    case 'battle': { chain('bandpass', 800, 0.6, 0.12); rnd(() => burst('highpass', 2000, ctx.currentTime, 0.2, 0.1, 1), 0.7, 2.5); break; }
  }
  return { gain, stop: () => { stops.forEach((s) => s()); timers.forEach(clearTimeout); gain.disconnect(); } };
}

const LEVEL: Record<AmbId, number> = { wind: 0.55, water: 0.7, nile: 0.7, temple: 0.8, underworld: 0.8, fire: 0.6, storm: 0.75, night: 0.7, cosmic: 0.9, battle: 0.7 };

export function setAmbience(ids: AmbId[]) {
  const ctx = mixer.ctx; if (!ctx) return;
  const want = new Set(ids);
  for (const [id, bed] of beds) {
    if (!want.has(id)) { bed.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.8); beds.delete(id); setTimeout(() => bed.stop(), 3500); }
  }
  for (const id of ids) {
    if (beds.has(id)) continue;
    const bed = makeBed(id); beds.set(id, bed); bed.gain.gain.setTargetAtTime(LEVEL[id], ctx.currentTime, 1.2);
  }
}
export const stopAmbience = () => setAmbience([]);
