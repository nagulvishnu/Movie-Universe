// Fully procedural Web Audio: adaptive music (piano / pads / drones / pulses), ambience beds and one-shot SFX.
// No copyrighted audio. Replaceable later by supplying audio files (see voice.ts for dialogue files).
type Surface = 'concrete' | 'grass' | 'wood' | 'metal' | 'tile' | 'wet' | 'gravel';

interface Mood {
  bpm: number; chords: number[][]; bpc: number;
  pad?: { vol: number; lp: number; attack: number; wave?: OscillatorType };
  piano?: { mode: 'arp' | 'sparse'; vol: number; oct: number; pattern?: number[]; p?: number };
  drone?: { note: number; vol: number };
  pulse?: { vol: number; double?: boolean };
  action?: boolean; ping?: number; glitch?: number;
}

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const MOODS: Record<string, Mood> = {
  silence: { bpm: 60, chords: [[0]], bpc: 8 },
  peace: { bpm: 82, bpc: 8, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], pad: { vol: 0.05, lp: 1400, attack: 1.8, wave: 'triangle' }, piano: { mode: 'arp', vol: 0.11, oct: 1, pattern: [0, 1, 2, 3, 2, 1, 2, 1] } },
  haunting: { bpm: 50, bpc: 8, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [40, 47, 52, 55]], pad: { vol: 0.055, lp: 700, attack: 3, wave: 'sawtooth' }, piano: { mode: 'sparse', vol: 0.1, oct: 1, p: 0.42 }, drone: { note: 33, vol: 0.05 } },
  suspense: { bpm: 58, bpc: 8, chords: [[38, 39, 45, 50], [37, 38, 44, 49]], pad: { vol: 0.05, lp: 520, attack: 3.5, wave: 'sawtooth' }, drone: { note: 29, vol: 0.09 }, pulse: { vol: 0.16, double: true }, ping: 0.07 },
  tension: { bpm: 96, bpc: 8, chords: [[40, 41, 47, 52], [39, 40, 46, 51]], pad: { vol: 0.055, lp: 650, attack: 2.2, wave: 'sawtooth' }, drone: { note: 28, vol: 0.1 }, pulse: { vol: 0.22 }, ping: 0.1 },
  action: { bpm: 148, bpc: 8, chords: [[38, 45, 50, 53], [36, 43, 48, 51], [34, 41, 46, 50], [36, 43, 48, 51]], pad: { vol: 0.06, lp: 900, attack: 0.8, wave: 'sawtooth' }, piano: { mode: 'arp', vol: 0.1, oct: 0, pattern: [0, 2, 1, 3, 0, 2, 3, 1] }, drone: { note: 26, vol: 0.1 }, pulse: { vol: 0.3 }, action: true },
  emotional: { bpm: 56, bpc: 8, chords: [[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]], pad: { vol: 0.05, lp: 1300, attack: 3, wave: 'sawtooth' }, piano: { mode: 'arp', vol: 0.12, oct: 1, pattern: [0, 2, 3, 1, 2, 3, 1, 2] } },
  sorrow: { bpm: 48, bpc: 8, chords: [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 60]], pad: { vol: 0.028, lp: 800, attack: 4, wave: 'triangle' }, piano: { mode: 'sparse', vol: 0.12, oct: 1, p: 0.3 } },
  hope: { bpm: 72, bpc: 8, chords: [[50, 57, 62, 66], [45, 52, 57, 61], [47, 54, 59, 62], [43, 50, 55, 59]], pad: { vol: 0.07, lp: 1800, attack: 2.4, wave: 'sawtooth' }, piano: { mode: 'arp', vol: 0.14, oct: 1, pattern: [0, 1, 2, 3, 2, 3, 1, 2] } },
  mystery: { bpm: 70, bpc: 8, chords: [[36, 43, 48], [35, 42, 47]], pad: { vol: 0.04, lp: 500, attack: 3, wave: 'sawtooth' }, drone: { note: 24, vol: 0.1 }, glitch: 0.12, ping: 0.05 },
  credits: { bpm: 64, bpc: 8, chords: [[50, 57, 62, 66], [46, 53, 58, 62], [43, 50, 55, 59], [45, 52, 57, 61]], pad: { vol: 0.06, lp: 1500, attack: 3, wave: 'sawtooth' }, piano: { mode: 'arp', vol: 0.12, oct: 1, pattern: [0, 2, 1, 3, 2, 1, 3, 2] } },
};

export interface Volumes { music: number; dialogue: number; sfx: number; muteMusic: boolean; muteDialogue: boolean; muteSfx: boolean }

export class AudioManager {
  ctx: AudioContext | null = null;
  master!: GainNode; musicBus!: GainNode; sfxBus!: GainNode; dialogBus!: GainNode;
  private rev!: ConvolverNode; private revGain!: GainNode;
  private noiseBuf!: AudioBuffer;
  private mood: Mood | null = null; private moodName = 'silence';
  private nextT = 0; private step = 0; private timer = 0;
  private droneNodes: { g: GainNode; stop: () => void } | null = null;
  private layers = new Map<string, { g: GainNode; target: number; extra?: () => void }>();
  private ambLevels: Record<string, number> = {};
  private vol: Volumes = { music: 0.7, dialogue: 1, sfx: 0.8, muteMusic: false, muteDialogue: false, muteSfx: false };
  private tick2 = 0;

  init() {
    if (this.ctx) { void this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = (this.ctx = new AC());
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    this.master = ctx.createGain(); this.master.connect(comp); comp.connect(ctx.destination);
    this.musicBus = ctx.createGain(); this.sfxBus = ctx.createGain(); this.dialogBus = ctx.createGain();
    this.musicBus.connect(this.master); this.sfxBus.connect(this.master); this.dialogBus.connect(this.master);
    // reverb
    const len = ctx.sampleRate * 2.8, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.rev = ctx.createConvolver(); this.rev.buffer = ir; this.revGain = ctx.createGain(); this.revGain.gain.value = 0.55;
    this.musicBus.connect(this.rev); this.sfxBus.connect(this.rev); this.rev.connect(this.revGain); this.revGain.connect(this.master);
    // noise
    const nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.noiseBuf = nb;
    this.applyVolumes();
    this.timer = window.setInterval(() => this.tick(), 110);
  }

  setVolumes(v: Partial<Volumes>) { this.vol = { ...this.vol, ...v }; this.applyVolumes(); }
  get volumes() { return this.vol; }
  private applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, v = this.vol;
    this.musicBus.gain.setTargetAtTime(v.muteMusic ? 0 : v.music, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(v.muteSfx ? 0 : v.sfx, t, 0.05);
    this.dialogBus.gain.setTargetAtTime(v.muteDialogue ? 0 : v.dialogue, t, 0.05);
  }
  pause() { void this.ctx?.suspend(); }
  resume() { void this.ctx?.resume(); }
  get now() { return this.ctx?.currentTime ?? 0; }

  // ---------- primitives ----------
  private N(t0: number, dur: number, o: { ft?: BiquadFilterType; f0?: number; f1?: number; q?: number; g?: number; a?: number; bus?: AudioNode } = {}) {
    const ctx = this.ctx!, src = ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = o.ft ?? 'lowpass'; f.frequency.setValueAtTime(o.f0 ?? 1000, t0); if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur); f.Q.value = o.q ?? 0.7;
    const g = ctx.createGain(), a = o.a ?? 0.005, pk = o.g ?? 0.3;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(pk, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(o.bus ?? this.sfxBus);
    src.start(t0, Math.random() * 2); src.stop(t0 + dur + 0.05);
  }
  private T(t0: number, dur: number, o: { type?: OscillatorType; f0: number; f1?: number; g?: number; a?: number; lp?: number; bus?: AudioNode }) {
    const ctx = this.ctx!, os = ctx.createOscillator(); os.type = o.type ?? 'sine';
    os.frequency.setValueAtTime(o.f0, t0); if (o.f1) os.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t0 + dur);
    const g = ctx.createGain(), a = o.a ?? 0.005;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(o.g ?? 0.2, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let out: AudioNode = os;
    if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; os.connect(f); out = f; }
    out.connect(g); g.connect(o.bus ?? this.sfxBus);
    os.start(t0); os.stop(t0 + dur + 0.05);
  }

  // ---------- music ----------
  setMusic(name: string) {
    if (!this.ctx || name === this.moodName) return;
    this.moodName = name; this.mood = MOODS[name] ?? MOODS.silence; this.step = 0; this.nextT = this.ctx.currentTime + 0.3;
    // drone
    const old = this.droneNodes; if (old) { old.g.gain.setTargetAtTime(0, this.ctx.currentTime, 1.2); setTimeout(() => old.stop(), 6000); this.droneNodes = null; }
    const d = this.mood.drone;
    if (d) {
      const ctx = this.ctx, g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(d.vol, ctx.currentTime, 2);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08; const lg = ctx.createGain(); lg.gain.value = 90; lfo.connect(lg); lg.connect(lp.frequency);
      const oscs = [0, 0.7, 12].map((dt, i) => { const o = ctx.createOscillator(); o.type = i === 2 ? 'sine' : 'sawtooth'; o.frequency.value = mtof(d.note) + dt * (i === 2 ? 0 : 1); if (i === 2) o.frequency.value = mtof(d.note + 12) + 0.3; o.connect(lp); o.start(); return o; });
      lp.connect(g); g.connect(this.musicBus); lfo.start();
      this.droneNodes = { g, stop: () => { oscs.forEach((o) => { try { o.stop(); } catch { /* */ } }); try { lfo.stop(); } catch { /* */ } g.disconnect(); } };
    }
  }

  private pad(t: number, chord: number[], m: Mood, dur: number) {
    const ctx = this.ctx!, p = m.pad!;
    for (const n of chord) for (const dt of [-6, 6]) {
      const o = ctx.createOscillator(); o.type = p.wave ?? 'sawtooth'; o.frequency.value = mtof(n); o.detune.value = dt;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = p.lp; f.Q.value = 0.3;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(p.vol / chord.length * 1.6, t + p.attack); g.gain.linearRampToValueAtTime(0.0001, t + dur + 2.5);
      o.connect(f); f.connect(g); g.connect(this.musicBus); o.start(t); o.stop(t + dur + 2.7);
    }
  }
  private piano(t: number, midi: number, vel: number, dur = 3) {
    const f0 = mtof(midi), ctx = this.ctx!;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.006); g.gain.exponentialRampToValueAtTime(vel * 0.3, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200 + vel * 9000, t); lp.frequency.exponentialRampToValueAtTime(700, t + dur * 0.7);
    [[1, 'sine', 1], [2, 'triangle', 0.35], [3, 'sine', 0.12], [4, 'sine', 0.05]].forEach(([mul, type, amp]) => {
      const o = ctx.createOscillator(); o.type = type as OscillatorType; o.frequency.value = f0 * (mul as number) * (1 + (Math.random() - 0.5) * 0.0006);
      const og = ctx.createGain(); og.gain.value = amp as number; o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    });
    lp.connect(g); g.connect(this.musicBus);
  }
  private kick(t: number, v: number) { this.T(t, 0.4, { f0: 95, f1: 38, g: v, a: 0.004, bus: this.musicBus }); this.N(t, 0.08, { ft: 'lowpass', f0: 400, g: v * 0.3, bus: this.musicBus }); }

  private musicStep(t: number, m: Mood, step: number) {
    const spc = m.bpc * 2, chord = m.chords[Math.floor(step / spc) % m.chords.length];
    if (m.pad && step % spc === 0) this.pad(t, chord, m, (60 / m.bpm) * m.bpc);
    const pn = m.piano;
    if (pn) {
      if (pn.mode === 'arp') {
        const pat = pn.pattern ?? [0, 1, 2, 3];
        const idx = pat[step % pat.length];
        const base = chord[idx % chord.length] + 12 * pn.oct + (idx >= chord.length ? 12 : 0);
        if (step % spc === 0) this.piano(t, chord[0] - 12 + 12 * (pn.oct ? 0 : 0), pn.vol * 0.9, 4.5);
        if (step % 2 === 0 || m.action) this.piano(t, base, pn.vol * (0.7 + Math.random() * 0.35), 3);
      } else if (step % 2 === 0 && Math.random() < (pn.p ?? 0.4)) {
        const n = chord[Math.floor(Math.random() * chord.length)] + 12 * (pn.oct + (Math.random() < 0.4 ? 1 : 0));
        this.piano(t, n, pn.vol * (0.6 + Math.random() * 0.5), 4.5);
      }
      if (step % spc === 0 && pn.mode === 'sparse') this.piano(t + 0.1, chord[0], pn.vol * 0.7, 6);
    }
    if (m.pulse) {
      if (step % 2 === 0) { this.kick(t, m.pulse.vol); if (m.pulse.double) this.kick(t + 0.26, m.pulse.vol * 0.55); }
      if (m.action && step % 2 === 1) this.N(t, 0.05, { ft: 'highpass', f0: 6000, g: 0.05, bus: this.musicBus });
    }
    if (m.ping && Math.random() < m.ping * 0.5) this.T(t, 3, { f0: mtof(chord[Math.floor(Math.random() * chord.length)] + 36 + (Math.random() < 0.5 ? 1 : 0)), g: 0.03, a: 0.01, bus: this.musicBus });
    if (m.glitch && Math.random() < m.glitch) this.T(t, 0.06, { type: 'square', f0: 1200 + Math.random() * 2400, g: 0.018, bus: this.musicBus });
  }

  private tick() {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const m = this.mood;
    if (m && this.moodName !== 'silence') {
      if (this.nextT < now) this.nextT = now + 0.05;
      const e = 60 / m.bpm / 2;
      while (this.nextT < now + 0.5) { this.musicStep(this.nextT, m, this.step); this.nextT += e; this.step++; }
    }
    // random ambience events
    this.tick2++;
    const L = this.ambLevels;
    if ((L.birds ?? 0) > 0.02 && Math.random() < 0.18 * L.birds * 3) { const f = 2400 + Math.random() * 2400; for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) this.T(now + 0.05 + i * 0.11, 0.1, { f0: f, f1: f * (0.8 + Math.random() * 0.6), g: 0.05 * L.birds, bus: this.sfxBus }); }
    if ((L.fire ?? 0) > 0.02 && Math.random() < 0.5) this.N(now + Math.random() * 0.1, 0.03 + Math.random() * 0.03, { ft: 'highpass', f0: 1800 + Math.random() * 3000, g: 0.09 * L.fire, bus: this.sfxBus });
    if ((L.drip ?? 0) > 0.02 && Math.random() < 0.06) this.T(now, 0.18, { f0: 1800 + Math.random() * 600, f1: 700, g: 0.06 * L.drip });
    if ((L.creaks ?? 0) > 0.02 && Math.random() < 0.025) this.T(now, 1.4, { type: 'sawtooth', f0: 90 + Math.random() * 60, f1: 60, g: 0.04 * L.creaks, lp: 300, a: 0.3 });
  }

  // ---------- ambience ----------
  setAmbience(levels: Record<string, number>) {
    if (!this.ctx) return;
    this.ambLevels = { ...levels };
    const ctx = this.ctx, t = ctx.currentTime;
    const names = new Set([...Object.keys(levels), ...this.layers.keys()]);
    names.forEach((n) => {
      const lv = levels[n] ?? 0;
      let L = this.layers.get(n);
      if (!L && lv > 0) L = this.makeLayer(n);
      if (L) L.g.gain.setTargetAtTime(lv, t, 1.2);
    });
  }
  private makeLayer(name: string) {
    const ctx = this.ctx!, g = ctx.createGain(); g.gain.value = 0; g.connect(this.sfxBus);
    const noise = (ft: BiquadFilterType, f: number, q = 0.7) => {
      const s = ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = ft; fl.frequency.value = f; fl.Q.value = q; s.connect(fl); s.start(0, Math.random() * 2); return { s, fl };
    };
    const lfo = (rate: number, depth: number, target: AudioParam) => { const o = ctx.createOscillator(); o.frequency.value = rate; const lg = ctx.createGain(); lg.gain.value = depth; o.connect(lg); lg.connect(target); o.start(); };
    switch (name) {
      case 'wind': { const a = noise('bandpass', 420, 0.6); const w = ctx.createGain(); w.gain.value = 0.35; a.fl.connect(w); w.connect(g); lfo(0.11, 0.18, w.gain); lfo(0.07, 220, a.fl.frequency); break; }
      case 'rain': { const a = noise('highpass', 1400, 0.5); const b = noise('lowpass', 260, 0.5); const c1 = ctx.createGain(); c1.gain.value = 0.28; const c2 = ctx.createGain(); c2.gain.value = 0.35; a.fl.connect(c1); c1.connect(g); b.fl.connect(c2); c2.connect(g); break; }
      case 'city': { const a = noise('lowpass', 200, 0.5); const c1 = ctx.createGain(); c1.gain.value = 0.5; a.fl.connect(c1); c1.connect(g); const b = noise('bandpass', 900, 0.4); const c2 = ctx.createGain(); c2.gain.value = 0.05; b.fl.connect(c2); c2.connect(g); lfo(0.2, 0.02, c2.gain); break; }
      case 'room': { const a = noise('lowpass', 140, 0.5); const c1 = ctx.createGain(); c1.gain.value = 0.35; a.fl.connect(c1); c1.connect(g); break; }
      case 'drone': { [55, 55.6, 82.4].forEach((f) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; o.connect(lp); const gg = ctx.createGain(); gg.gain.value = 0.12; lp.connect(gg); gg.connect(g); o.start(); }); break; }
      case 'static': { const a = noise('bandpass', 2400, 0.4); const c1 = ctx.createGain(); c1.gain.value = 0.25; a.fl.connect(c1); c1.connect(g); lfo(7, 0.12, c1.gain); break; }
      case 'generator': { [48, 96.5].forEach((f, i) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; const gg = ctx.createGain(); gg.gain.value = i ? 0.1 : 0.22; o.connect(lp); lp.connect(gg); gg.connect(g); lfo(11, 0.08, gg.gain); o.start(); }); const a = noise('lowpass', 300); const c = ctx.createGain(); c.gain.value = 0.3; a.fl.connect(c); c.connect(g); break; }
      case 'electric': { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 120; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 3; const gg = ctx.createGain(); gg.gain.value = 0.05; o.connect(bp); bp.connect(gg); gg.connect(g); lfo(0.3, 0.02, gg.gain); o.start(); const o2 = ctx.createOscillator(); o2.frequency.value = 6200; const g2 = ctx.createGain(); g2.gain.value = 0.004; o2.connect(g2); g2.connect(g); o2.start(); break; }
      case 'crickets': { const o = ctx.createOscillator(); o.frequency.value = 4300; const am = ctx.createGain(); am.gain.value = 0; const lf = ctx.createOscillator(); lf.type = 'square'; lf.frequency.value = 22; const lg = ctx.createGain(); lg.gain.value = 0.03; lf.connect(lg); lg.connect(am.gain); lf.start(); const lf2 = ctx.createOscillator(); lf2.frequency.value = 0.35; const lg2 = ctx.createGain(); lg2.gain.value = 0.03; lf2.connect(lg2); lg2.connect(am.gain); lf2.start(); o.connect(am); am.connect(g); o.start(); break; }
      case 'river': { const a = noise('bandpass', 650, 0.5); const c1 = ctx.createGain(); c1.gain.value = 0.3; a.fl.connect(c1); c1.connect(g); lfo(0.2, 0.08, c1.gain); break; }
      case 'hum': { [60, 120, 180].forEach((f, i) => { const o = ctx.createOscillator(); o.frequency.value = f; const gg = ctx.createGain(); gg.gain.value = 0.04 / (i + 1); o.connect(gg); gg.connect(g); o.start(); }); break; }
      default: break; // event-driven layers (birds, fire, drip, creaks) are handled in tick()
    }
    const L = { g, target: 0 }; this.layers.set(name, L); return L;
  }

  // ---------- sfx ----------
  footstep(surface: Surface, vol = 1) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime, v = vol * (0.7 + Math.random() * 0.3), j = 1 + (Math.random() - 0.5) * 0.3;
    switch (surface) {
      case 'grass': this.N(t, 0.12, { ft: 'lowpass', f0: 700 * j, g: 0.18 * v, a: 0.02 }); break;
      case 'wood': this.T(t, 0.12, { f0: 170 * j, f1: 90, g: 0.25 * v }); this.N(t, 0.04, { ft: 'bandpass', f0: 1200, g: 0.1 * v }); break;
      case 'metal': this.N(t, 0.12, { ft: 'bandpass', f0: 2300 * j, q: 4, g: 0.12 * v }); this.T(t, 0.1, { f0: 140, f1: 80, g: 0.15 * v }); break;
      case 'tile': this.N(t, 0.05, { ft: 'bandpass', f0: 1800 * j, q: 1.5, g: 0.2 * v }); this.T(t, 0.08, { f0: 120, f1: 70, g: 0.12 * v }); break;
      case 'wet': this.N(t, 0.16, { ft: 'lowpass', f0: 1700 * j, f1: 400, g: 0.22 * v }); break;
      case 'gravel': for (let i = 0; i < 4; i++) this.N(t + i * 0.025, 0.04, { ft: 'highpass', f0: 2500 * j, g: 0.1 * v }); break;
      default: this.N(t, 0.07, { ft: 'bandpass', f0: 900 * j, q: 0.8, g: 0.2 * v }); this.T(t, 0.09, { f0: 110 * j, f1: 60, g: 0.14 * v });
    }
  }

  sfx(name: string, vol = 1, delay = 0) {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + delay, v = vol;
    switch (name) {
      case 'thunder': this.N(t, 5.5, { ft: 'lowpass', f0: 900, f1: 60, g: 0.9 * v, a: 0.12 }); this.N(t + 0.4, 4, { ft: 'lowpass', f0: 300, f1: 40, g: 0.8 * v, a: 0.5 }); this.T(t, 3, { f0: 50, f1: 28, g: 0.5 * v, a: 0.3 }); break;
      case 'doorOpen': this.T(t, 1.3, { type: 'sawtooth', f0: 220, f1: 110, g: 0.07 * v, lp: 700, a: 0.2 }); this.T(t + 0.1, 1.1, { type: 'sawtooth', f0: 330, f1: 150, g: 0.04 * v, lp: 900, a: 0.2 }); this.N(t + 1.3, 0.12, { ft: 'lowpass', f0: 400, g: 0.2 * v }); break;
      case 'doorSlam': this.T(t, 0.4, { f0: 80, f1: 30, g: 0.6 * v }); this.N(t, 0.25, { ft: 'lowpass', f0: 1200, g: 0.4 * v }); break;
      case 'static': this.N(t, 0.5, { ft: 'bandpass', f0: 2200, q: 0.4, g: 0.2 * v, a: 0.02 }); break;
      case 'radioOn': this.N(t, 0.9, { ft: 'bandpass', f0: 1800, q: 0.5, g: 0.18 * v, a: 0.02 }); this.T(t, 0.15, { f0: 1500, g: 0.06 * v }); break;
      case 'radioTune': this.N(t, 2.4, { ft: 'bandpass', f0: 500, f1: 3600, q: 3, g: 0.25 * v, a: 0.2 }); this.T(t, 2.2, { f0: 400, f1: 2200, g: 0.04 * v, a: 0.3 }); break;
      case 'radioTone': this.T(t, 0.5, { f0: 880, g: 0.07 * v, a: 0.02 }); break;
      case 'beep': this.T(t, 0.14, { f0: 1000, g: 0.12 * v, a: 0.005 }); break;
      case 'blip': this.T(t, 0.07, { type: 'square', f0: 1800, g: 0.04 * v }); break;
      case 'powerDown': this.T(t, 1.6, { f0: 420, f1: 28, g: 0.3 * v, a: 0.01 }); this.N(t, 1.2, { ft: 'lowpass', f0: 2000, f1: 80, g: 0.15 * v }); break;
      case 'powerUp': this.T(t, 2.4, { type: 'sawtooth', f0: 38, f1: 200, g: 0.2 * v, lp: 600, a: 1.2 }); this.N(t + 1.8, 0.3, { ft: 'highpass', f0: 3000, g: 0.2 * v }); break;
      case 'generator': this.T(t, 3.5, { type: 'sawtooth', f0: 25, f1: 50, g: 0.45 * v, lp: 350, a: 1.4 }); this.N(t, 3, { ft: 'lowpass', f0: 200, f1: 500, g: 0.3 * v, a: 1.2 }); for (let i = 0; i < 3; i++) this.T(t + i * 0.4, 0.2, { type: 'square', f0: 60 + i * 10, f1: 30, g: 0.2 * v, lp: 300 }); break;
      case 'impact': this.T(t, 1.2, { f0: 100, f1: 30, g: 0.8 * v }); this.N(t, 0.8, { ft: 'lowpass', f0: 1800, f1: 100, g: 0.5 * v }); break;
      case 'sting': this.T(t, 3, { f0: 55, f1: 40, g: 0.5 * v, a: 0.02 }); this.T(t, 3, { type: 'sawtooth', f0: 110, f1: 100, g: 0.1 * v, lp: 500, a: 0.1 }); this.N(t, 1.6, { ft: 'bandpass', f0: 3000, f1: 800, q: 2, g: 0.2 * v }); break;
      case 'whoosh': this.N(t, 1.1, { ft: 'bandpass', f0: 300, f1: 2400, q: 1.2, g: 0.35 * v, a: 0.4 }); break;
      case 'creak': this.T(t, 3, { type: 'sawtooth', f0: 75, f1: 58, g: 0.1 * v, lp: 260, a: 0.8 }); this.T(t + 0.3, 2.5, { type: 'sawtooth', f0: 410, f1: 300, g: 0.02 * v, lp: 900, a: 1 }); break;
      case 'debris': for (let i = 0; i < 8; i++) this.N(t + Math.random() * 1.6, 0.1 + Math.random() * 0.15, { ft: 'bandpass', f0: 300 + Math.random() * 2000, q: 1.5, g: 0.3 * v }); break;
      case 'collapse':
        this.N(t, 6, { ft: 'lowpass', f0: 1400, f1: 60, g: 0.8 * v, a: 0.3 }); this.T(t, 4, { f0: 55, f1: 24, g: 0.7 * v, a: 0.1 });
        for (let i = 0; i < 12; i++) { const tt = t + Math.random() * 3.5; this.N(tt, 0.2, { ft: 'bandpass', f0: 400 + Math.random() * 1800, q: 2, g: 0.3 * v }); this.T(tt, 0.5, { f0: 300 + Math.random() * 900, f1: 180, g: 0.05 * v, lp: 2000 }); }
        break;
      case 'metalHit': this.T(t, 1.5, { f0: 520 + Math.random() * 200, g: 0.1 * v, a: 0.002 }); this.N(t, 0.15, { ft: 'bandpass', f0: 2200, q: 3, g: 0.2 * v }); break;
      case 'glass': for (let i = 0; i < 7; i++) this.N(t + i * 0.03, 0.12, { ft: 'highpass', f0: 4000 + Math.random() * 3000, g: 0.2 * v }); break;
      case 'heartbeat': this.T(t, 0.3, { f0: 70, f1: 40, g: 0.5 * v }); this.T(t + 0.26, 0.3, { f0: 60, f1: 35, g: 0.35 * v }); break;
      case 'click': this.N(t, 0.02, { ft: 'highpass', f0: 3000, g: 0.15 * v }); break;
      case 'paper': this.N(t, 0.25, { ft: 'bandpass', f0: 3000, q: 0.6, g: 0.1 * v, a: 0.05 }); break;
      case 'zap': this.N(t, 0.35, { ft: 'highpass', f0: 2000, g: 0.4 * v }); this.T(t, 0.35, { type: 'sawtooth', f0: 100, f1: 50, g: 0.15 * v, lp: 800 }); break;
      case 'vanish': this.N(t, 2.8, { ft: 'bandpass', f0: 200, f1: 3500, q: 1.5, g: 0.3 * v, a: 1.8 }); this.T(t, 2.8, { f0: 300, f1: 2400, g: 0.07 * v, a: 1.9 }); this.T(t + 2.7, 2.5, { f0: 40, f1: 30, g: 0.5 * v, a: 0.05 }); break;
      case 'stall': this.T(t, 1.4, { type: 'sawtooth', f0: 130, f1: 22, g: 0.2 * v, lp: 500, a: 0.01 }); break;
      case 'horn': this.T(t, 0.7, { type: 'sawtooth', f0: 440, g: 0.07 * v, lp: 1400, a: 0.02 }); this.T(t, 0.7, { type: 'sawtooth', f0: 554, g: 0.06 * v, lp: 1400, a: 0.02 }); break;
      case 'plane': this.N(t, 9, { ft: 'bandpass', f0: 500, f1: 300, q: 0.8, g: 0.22 * v, a: 4 }); break;
      case 'train': this.N(t, 6, { ft: 'lowpass', f0: 500, f1: 300, g: 0.3 * v, a: 2.5 }); break;
      case 'bird': { const f = 2600 + Math.random() * 1500; for (let i = 0; i < 3; i++) this.T(t + i * 0.12, 0.1, { f0: f, f1: f * 1.3, g: 0.08 * v }); break; }
      case 'gust': this.N(t, 4, { ft: 'bandpass', f0: 300, f1: 900, q: 0.7, g: 0.4 * v, a: 1.5 }); break;
      case 'birthday': { const notes = [67, 67, 69, 67, 72, 71, 0, 67, 67, 69, 67, 74, 72]; notes.forEach((n, i) => { if (n) this.T(t + i * 0.42, 0.9, { f0: mtof(n), g: 0.12 * v, a: 0.003 }); }); break; }
      case 'tvStatic': this.N(t, 1.5, { ft: 'bandpass', f0: 3000, q: 0.3, g: 0.12 * v }); break;
      case 'tapeStop': this.T(t, 0.9, { f0: 1200, f1: 60, g: 0.1 * v, type: 'sawtooth', lp: 1500 }); break;
      case 'riser': this.T(t, 5, { type: 'sawtooth', f0: 80, f1: 700, g: 0.12 * v, lp: 900, a: 4 }); this.N(t, 5, { ft: 'bandpass', f0: 400, f1: 4000, q: 1, g: 0.18 * v, a: 4 }); break;
      case 'ping': this.T(t, 3, { f0: 1760, g: 0.06 * v, a: 0.005 }); break;
      case 'whisperBreath': this.N(t, 1.6, { ft: 'bandpass', f0: 3500, q: 0.8, g: 0.06 * v, a: 0.8 }); break;
      case 'dishes': for (let i = 0; i < 3; i++) this.T(t + i * 0.09, 0.4, { f0: 2400 + i * 300, g: 0.04 * v, a: 0.002 }); break;
      case 'splash': this.N(t, 1.2, { ft: 'lowpass', f0: 2500, f1: 300, g: 0.6 * v, a: 0.02 }); break;
      default: break;
    }
  }

  stopAll() {
    if (!this.ctx) return;
    this.setAmbience({});
    this.setMusic('silence');
  }
  dispose() { clearInterval(this.timer); void this.ctx?.close(); this.ctx = null; }
}

export const audio = new AudioManager();
