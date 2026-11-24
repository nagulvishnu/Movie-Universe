import { bellBurst, distortionCurve, hit, makeImpulse, makeNoise, noiseNode, tone, type Bus } from "./dsp";
import { playSfx } from "./sfx";
import { startMusic, type MusicHandle } from "./music";
import { getBuffer, hasEntry, loadManifest, preloadBuffer, report } from "./assets";
import { cancelSpeech, pauseSpeech, resumeSpeech, speak, speechAvailable } from "./voice";
import type { AmbId, CLine, MusicId, RingKind } from "../movie/types";

type Stopper = { stop: (fade?: number) => void };

/** Dedicated audio system: music, ambience, effects, ring motif, dialogue (recorded or speech-synth fallback). */
class AudioEngine {
  ctx: AudioContext | null = null;
  private bus!: Bus;
  private master!: GainNode;
  private voiceBus!: GainNode;
  private volume = 0.8;
  private muted = false;
  private music: MusicHandle | null = null;
  private musicId: MusicId | null = null;
  private amb = new Map<AmbId, Stopper>();
  private lineSources = new Set<AudioBufferSourceNode>();
  private ring: Stopper | null = null;
  private ringKind: RingKind = "none";
  private paused = false;
  lastVoiceMode: "recorded" | "synth" | "none" = "none";

  async init() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master.connect(comp);
      comp.connect(ctx.destination);
      const verb = ctx.createGain();
      verb.gain.value = 1;
      const conv = ctx.createConvolver();
      conv.buffer = makeImpulse(ctx, 3);
      const verbOut = ctx.createGain();
      verbOut.gain.value = 0.55;
      verb.connect(conv);
      conv.connect(verbOut);
      verbOut.connect(this.master);
      const sfx = ctx.createGain();
      sfx.connect(this.master);
      const music = ctx.createGain();
      music.gain.value = 0.85;
      music.connect(this.master);
      const amb = ctx.createGain();
      amb.gain.value = 0.9;
      amb.connect(this.master);
      this.voiceBus = ctx.createGain();
      this.voiceBus.gain.value = 1.3;
      this.voiceBus.connect(this.master);
      this.bus = { ctx, sfx, music, amb, verb, noise: makeNoise(ctx, 4) };
      await loadManifest();
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master) this.master.gain.value = this.muted ? 0 : v;
  }
  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : this.volume;
    if (m) cancelSpeech();
  }

  pause() {
    this.paused = true;
    pauseSpeech();
    this.ctx?.suspend();
  }
  async resume() {
    this.paused = false;
    resumeSpeech();
    await this.ctx?.resume();
  }

  // ---------- music ----------
  setMusic(id: MusicId | null) {
    if (!this.ctx || id === this.musicId) return;
    this.music?.stop(id ? 2.2 : 3);
    this.music = null;
    this.musicId = id;
    if (!id) return;
    if (hasEntry("music", id)) {
      const buf = getBuffer("music", id);
      if (buf) {
        this.music = this.playBuffer(buf, this.bus.music, true);
        return;
      }
      void preloadBuffer(this.ctx, "music", id);
    }
    this.music = startMusic(this.bus, id);
  }

  sting() {
    if (!this.ctx) return;
    startMusic(this.bus, "sting");
  }

  private playBuffer(buf: AudioBuffer, out: AudioNode, loop: boolean): MusicHandle {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = loop;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
    s.connect(g);
    g.connect(out);
    s.start();
    return {
      stop: (fade = 2) => {
        g.gain.cancelScheduledValues(ctx.currentTime);
        g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + fade);
        s.stop(ctx.currentTime + fade + 0.1);
      },
    };
  }

  // ---------- ambience ----------
  setAmb(ids: AmbId[]) {
    if (!this.ctx) return;
    for (const [k, s] of this.amb) {
      if (!ids.includes(k)) {
        s.stop(1.8);
        this.amb.delete(k);
      }
    }
    for (const id of ids) if (!this.amb.has(id)) this.amb.set(id, this.buildAmb(id));
  }

  private buildAmb(id: AmbId): Stopper {
    const b = this.bus;
    const ctx = b.ctx;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
    out.connect(b.amb);
    const nodes: (AudioScheduledSourceNode | { stop: () => void })[] = [];
    const t = ctx.currentTime;
    const filt = (type: BiquadFilterType, f: number, q: number, gain: number) => {
      const n = noiseNode(b, t, 0, true);
      const bq = ctx.createBiquadFilter();
      bq.type = type;
      bq.frequency.value = f;
      bq.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gain;
      n.connect(bq);
      bq.connect(g);
      g.connect(out);
      nodes.push(n);
      return bq;
    };
    const osc = (type: OscillatorType, f: number, gain: number, lp = 0) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = gain;
      let node: AudioNode = o;
      if (lp) {
        const l = ctx.createBiquadFilter();
        l.frequency.value = lp;
        o.connect(l);
        node = l;
      }
      node.connect(g);
      g.connect(out);
      o.start();
      nodes.push(o);
      return o;
    };
    const lfo = (target: AudioParam, rate: number, depth: number) => {
      const l = ctx.createOscillator();
      l.frequency.value = rate;
      const g = ctx.createGain();
      g.gain.value = depth;
      l.connect(g);
      g.connect(target);
      l.start();
      nodes.push(l);
    };
    let timer = 0;
    switch (id) {
      case "rain":
        filt("bandpass", 4200, 0.35, 0.34);
        filt("highpass", 7000, 0.5, 0.07);
        filt("lowpass", 600, 0.7, 0.16);
        break;
      case "car":
        osc("sawtooth", 46, 0.07, 180);
        osc("sine", 38, 0.15);
        filt("lowpass", 350, 0.7, 0.2);
        filt("bandpass", 2500, 0.5, 0.05);
        break;
      case "hum": {
        osc("sine", 60, 0.07);
        osc("sine", 120, 0.04);
        const o = osc("sawtooth", 180, 0.012, 600);
        lfo(o.detune, 0.3, 14);
        break;
      }
      case "roomtone":
        filt("lowpass", 220, 0.7, 0.35);
        osc("sine", 50, 0.03);
        break;
      case "wind": {
        const f = filt("bandpass", 500, 2.2, 0.17);
        lfo(f.frequency, 0.11, 280);
        break;
      }
      case "machinery": {
        osc("sawtooth", 41, 0.06, 150);
        osc("sine", 82, 0.07);
        const f = filt("lowpass", 280, 0.9, 0.3);
        lfo(f.frequency, 0.4, 120);
        timer = window.setInterval(() => {
          if (!this.paused) hit(b, { out, t: ctx.currentTime + 0.05, d: 0.7, f: 70, type: "lowpass", g: 0.45, a: 0.05 });
        }, 2600);
        break;
      }
      case "city":
        filt("lowpass", 500, 0.5, 0.22);
        filt("bandpass", 1200, 0.4, 0.04);
        break;
      case "birds":
        filt("lowpass", 900, 0.5, 0.06);
        timer = window.setInterval(() => {
          if (this.paused) return;
          const tt = ctx.currentTime + 0.05;
          const f = 2400 + Math.random() * 2000;
          for (let i = 0; i < 3; i++) tone(b, { out, t: tt + i * 0.11, f, f2: f * 1.3, d: 0.08, g: 0.04, verb: 0.3 });
        }, 1800);
        break;
      case "night":
        filt("lowpass", 300, 0.5, 0.15);
        timer = window.setInterval(() => {
          if (!this.paused && Math.random() > 0.6) hit(b, { out, t: ctx.currentTime + 0.05, d: 3, f: 700, f2: 300, q: 3, g: 0.03, a: 1.2, verb: 0.5 });
        }, 3000);
        break;
      case "exchange":
        osc("sine", 55, 0.06);
        osc("sine", 57.2, 0.05);
        osc("sawtooth", 120, 0.01, 400);
        filt("lowpass", 180, 0.7, 0.2);
        timer = window.setInterval(() => {
          if (this.paused) return;
          if (Math.random() > 0.5) hit(b, { out, t: ctx.currentTime + 0.05, d: 0.03, f: 3000, q: 5, g: 0.12 });
          if (Math.random() > 0.85) bellBurst(b, out, ctx.currentTime + 0.05, 0.4, 1180, 0.012, 0.6);
        }, 1500);
        break;
    }
    return {
      stop: (fade = 1.5) => {
        window.clearInterval(timer);
        const tn = ctx.currentTime;
        out.gain.cancelScheduledValues(tn);
        out.gain.setValueAtTime(out.gain.value, tn);
        out.gain.linearRampToValueAtTime(0.0001, tn + fade);
        window.setTimeout(() => {
          nodes.forEach((n) => {
            try {
              (n as AudioScheduledSourceNode).stop();
            } catch {
              /* already stopped */
            }
          });
          out.disconnect();
        }, (fade + 0.2) * 1000);
      },
    };
  }

  // ---------- telephone ring motif ----------
  setRing(kind: RingKind) {
    if (!this.ctx || kind === this.ringKind) return;
    this.ring?.stop(0.05);
    this.ring = null;
    this.ringKind = kind;
    if (kind === "none") return;
    const b = this.bus;
    const ctx = b.ctx;
    const out = ctx.createGain();
    out.gain.value = 1;
    out.connect(b.sfx);
    let next = ctx.currentTime + 0.05;
    let i = 0;
    const sched = () => {
      while (next < ctx.currentTime + 1.2) {
        if (kind === "old") {
          // distinctive double ring, the film's recurring 2:17 motif
          bellBurst(b, out, next, 0.85, 1180, 0.42);
          bellBurst(b, out, next + 1.05, 0.85, 1180, 0.42);
          next += 4.2;
        } else if (kind === "red") {
          bellBurst(b, out, next, 0.9, 940, 0.4, 0.55);
          bellBurst(b, out, next + 1.1, 0.9, 940, 0.4, 0.55);
          next += 4.4;
        } else if (kind === "mobile") {
          for (let k = 0; k < 2; k++) {
            const tt = next + k * 0.62;
            tone(b, { out, t: tt, f: 135, type: "sawtooth", a: 0.01, d: 0.4, g: 0.26, lp: 500 });
            hit(b, { out, t: tt, d: 0.4, f: 1300, q: 1.5, g: 0.12 });
          }
          [880, 1175, 1480].forEach((f, k) => tone(b, { out, t: next + 1.3 + k * 0.13, f, d: 0.35, g: 0.05, verb: 0.3 }));
          next += 3.4;
        } else {
          // every telephone at once
          for (let k = 0; k < 3; k++) bellBurst(b, out, next + Math.random() * 0.25, 0.6 + Math.random() * 0.3, 1000 + Math.random() * 450, 0.2, 0.5);
          next += 0.45 + Math.random() * 0.25;
        }
        i++;
      }
    };
    sched();
    const timer = window.setInterval(sched, 250);
    void i;
    this.ring = {
      stop: (fade = 0.05) => {
        window.clearInterval(timer);
        out.gain.cancelScheduledValues(ctx.currentTime);
        out.gain.setValueAtTime(out.gain.value, ctx.currentTime);
        out.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
        window.setTimeout(() => out.disconnect(), 500);
      },
    };
  }

  // ---------- one-shots ----------
  cue(name: string, o: Record<string, number | string> = {}) {
    if (!this.ctx) return;
    if (name === "sting") return this.sting();
    if (hasEntry("sfx", name)) {
      const buf = getBuffer("sfx", name);
      if (buf) {
        this.playBuffer(buf, this.bus.sfx, false);
        return;
      }
      void preloadBuffer(this.ctx, "sfx", name);
    }
    playSfx(this.bus, name, o);
  }

  // ---------- dialogue ----------
  preload(lines: CLine[]) {
    if (!this.ctx) return;
    for (const l of lines) if (hasEntry("dialogue", l.id)) void preloadBuffer(this.ctx, "dialogue", l.id);
  }

  line(l: CLine) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const b = this.bus;
    const rec = getBuffer("dialogue", l.id);
    const dur = l.end - l.start;
    if (l.fx === "phone" || l.fx === "record") {
      hit(b, { t: ctx.currentTime + 0.02, d: dur, f: 1800, q: 0.6, g: 0.05, a: 0.1 });
    } else if (l.fx === "distort") {
      hit(b, { t: ctx.currentTime + 0.02, d: dur, f: 350, type: "lowpass", g: 0.09, a: 0.2, verb: 0.5 });
    } else if (l.fx === "echo") {
      tone(b, { t: ctx.currentTime + 0.02, f: 55, a: dur * 0.4, d: dur * 0.6, g: 0.06, verb: 0.6 });
    }
    if (rec) {
      this.lastVoiceMode = "recorded";
      this.stopLineSources();
      const s = ctx.createBufferSource();
      s.buffer = rec;
      this.lineSources.add(s);
      s.onended = () => this.lineSources.delete(s);
      let node: AudioNode = s;
      if (l.fx === "phone" || l.fx === "record") {
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 1500;
        bp.Q.value = 0.7;
        const ws = ctx.createWaveShaper();
        ws.curve = distortionCurve(8);
        s.connect(bp);
        bp.connect(ws);
        node = ws;
      } else if (l.fx === "distort") {
        const ws = ctx.createWaveShaper();
        ws.curve = distortionCurve(30);
        s.connect(ws);
        node = ws;
      }
      const g = ctx.createGain();
      g.gain.value = l.fx === "whisper" ? 0.5 : 1;
      node.connect(g);
      g.connect(this.voiceBus);
      if (l.fx === "echo" || l.fx === "distort" || l.fx === "whisper") {
        const v = ctx.createGain();
        v.gain.value = 0.5;
        g.connect(v);
        v.connect(b.verb);
      }
      s.start();
      return;
    }
    if (speechAvailable()) {
      this.lastVoiceMode = "synth";
      speak(l, this.muted ? 0 : Math.min(1, this.volume * 1.15));
    } else this.lastVoiceMode = "none";
  }

  private stopLineSources() {
    for (const s of this.lineSources) { try { s.stop(); } catch { /* already stopped */ } }
    this.lineSources.clear();
  }

  /** Reset every transient sound (used on seek / restart / exit). */
  stopTransient() {
    cancelSpeech();
    this.stopLineSources();
    if (!this.ctx) return;
    const old = this.bus.sfx;
    old.gain.cancelScheduledValues(this.ctx.currentTime);
    old.gain.setValueAtTime(0, this.ctx.currentTime);
    window.setTimeout(() => old.disconnect(), 100);
    const sfx = this.ctx.createGain();
    sfx.connect(this.master);
    this.bus.sfx = sfx;
    this.ring?.stop(0.02);
    this.ring = null;
    this.ringKind = "none";
  }

  stopAll() {
    this.stopTransient();
    this.music?.stop(0.5);
    this.music = null;
    this.musicId = null;
    for (const s of this.amb.values()) s.stop(0.5);
    this.amb.clear();
  }

  /** Release Web Audio resources when the player unmounts. */
  dispose() {
    this.stopAll();
    cancelSpeech();
    void this.ctx?.close();
    this.ctx = null;
  }

  assetReport() {
    return report();
  }
}

export const audio = new AudioEngine();
