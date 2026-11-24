import type { Line, MusicMode, VoiceId } from '../movie/types';
import { lineDur, wordCount } from '../movie/types';

export interface VoiceCfg { uri: string; pitch: number; rate: number }
export interface AudioSettings {
  master: number; music: number; sfx: number; voice: number; ambience: number; muted: boolean; subtitles: boolean;
  quality: 'low' | 'medium' | 'high'; voices: Record<string, VoiceCfg>;
}
export const DEFAULT_VOICE_CFG: Record<VoiceId, { g: 'm' | 'f'; alt: number; pitch: number; rate: number }> = {
  adam: { g: 'm', alt: 0, pitch: 0.95, rate: 1.0 }, noah: { g: 'm', alt: 1, pitch: 1.12, rate: 1.08 },
  lena: { g: 'f', alt: 0, pitch: 1.0, rate: 1.0 }, emily: { g: 'f', alt: 1, pitch: 1.18, rate: 1.04 },
  shop: { g: 'm', alt: 2, pitch: 0.55, rate: 0.82 }, hunter: { g: 'm', alt: 1, pitch: 0.7, rate: 0.95 },
  brother: { g: 'm', alt: 3, pitch: 0.9, rate: 1.0 }, mom: { g: 'f', alt: 2, pitch: 0.9, rate: 0.92 },
  adamMom: { g: 'f', alt: 2, pitch: 0.95, rate: 0.95 }, lenaBro: { g: 'm', alt: 3, pitch: 1.25, rate: 1.05 },
  emilyDad: { g: 'm', alt: 2, pitch: 0.7, rate: 0.9 }, radio: { g: 'm', alt: 0, pitch: 0.8, rate: 0.9 },
  creature: { g: 'm', alt: 0, pitch: 0.1, rate: 0.7 }, father: { g: 'm', alt: 2, pitch: 0.85, rate: 0.95 },
  boy: { g: 'm', alt: 3, pitch: 1.7, rate: 1.1 }, mother: { g: 'f', alt: 1, pitch: 0.95, rate: 0.95 }, sister: { g: 'f', alt: 0, pitch: 1.8, rate: 1.1 },
};
export const CAST_SETTINGS: { id: VoiceId; label: string }[] = [
  { id: 'adam', label: 'Adam' }, { id: 'lena', label: 'Lena' }, { id: 'noah', label: 'Noah' }, { id: 'emily', label: 'Emily' }, { id: 'shop', label: 'Shopkeeper' }, { id: 'creature', label: 'The Thing (whisper)' },
];
const FEMALE = /zira|samantha|susan|hazel|aria|jenny|libby|sonia|female|karen|moira|tessa|victoria|linda|catherine|eva|heather|michelle|emma|amy|ava|allison|joanna|kendra|kimberly|salli|ivy|nicole|raveena|fiona|serena|zoe|google us english|google uk english female/i;
const MALE = /david|mark|guy|daniel|george|alex|fred|ryan|male|james|richard|ralph|eric|tom|christopher|brian|roger|davis|thomas|oliver|arthur|aaron|joey|matthew|justin|kevin|russell|gordon|lee/i;

type SfxOpts = { vol?: number; pan?: number; lp?: number };

export class AudioEngine {
  ctx: AudioContext | null = null;
  settings: AudioSettings;
  assets = new Map<string, AudioBuffer>();
  assetNames = new Set<string>();
  private master!: GainNode; private musicBus!: GainNode; private sfxBus!: GainNode; private ambBus!: GainNode; private voiceBus!: GainNode; private duck!: GainNode;
  private reverb!: ConvolverNode; private wet!: GainNode;
  private white!: AudioBuffer; private brown!: AudioBuffer;
  private ambG: Record<string, GainNode> = {};
  private ambScale: Record<string, number> = { wind: 0.5, rain: 0.45, crickets: 0.035, drone: 0.35, room: 0.5, engine: 0.35, fire: 0.3, cave: 0.0 };
  private mus: { mode: MusicMode; bus: GainNode; next: number; step: number } | null = null;
  private timer: number | null = null;
  private speechTimer: number | null = null;
  private bufferSource: AudioBufferSourceNode | null = null;
  private voicesHandler: (() => void) | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private paused = false;
  private caveLevel = 0;
  private nextDrip = 0;

  constructor(settings: AudioSettings) {
    this.settings = settings;
    if ('speechSynthesis' in window) {
      const load = () => { this.voices = window.speechSynthesis.getVoices(); this.onVoices?.(this.voices); };
      load(); this.voicesHandler = load; window.speechSynthesis.addEventListener?.('voiceschanged', load);
    }
  }
  onVoices?: (v: SpeechSynthesisVoice[]) => void;
  get ttsVoices() { return this.voices; }

  // ------------------------------------------------------------ setup
  init() {
    if (!this.voicesHandler && 'speechSynthesis' in window) {
      const load = () => { this.voices = window.speechSynthesis.getVoices(); this.onVoices?.(this.voices); };
      this.voicesHandler = load; window.speechSynthesis.addEventListener?.('voiceschanged', load); load();
    }
    if (this.ctx) { if (this.ctx.state === 'suspended' && !this.paused) void this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const c = (this.ctx = new AC());
    this.master = c.createGain(); this.duck = c.createGain();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.01; comp.release.value = 0.25;
    this.master.connect(comp); comp.connect(c.destination);
    const mk = () => { const g = c.createGain(); g.connect(this.duck); return g; };
    this.duck.connect(this.master);
    this.musicBus = mk(); this.sfxBus = mk(); this.ambBus = mk(); this.voiceBus = mk();
    // reverb
    this.reverb = c.createConvolver(); this.reverb.buffer = this.impulse(2.6, 3.2);
    this.wet = c.createGain(); this.wet.gain.value = 0.16; this.reverb.connect(this.wet); this.wet.connect(this.master);
    const send = c.createGain(); send.gain.value = 1; this.sfxBus.connect(send); this.voiceBus.connect(send); this.musicBus.connect(send); send.connect(this.reverb);
    // noise buffers
    const n = c.sampleRate * 3;
    this.white = c.createBuffer(1, n, c.sampleRate); this.brown = c.createBuffer(1, n, c.sampleRate);
    const w = this.white.getChannelData(0), b = this.brown.getChannelData(0); let last = 0;
    for (let i = 0; i < n; i++) { const r = Math.random() * 2 - 1; w[i] = r; last = (last + 0.02 * r) / 1.02; b[i] = last * 3.5; }
    this.buildAmb();
    this.applyVolumes();
    this.timer = window.setInterval(() => this.tick(), 100);
    void this.loadManifest();
  }

  private impulse(sec: number, decay: number) {
    const c = this.ctx!, n = Math.floor(c.sampleRate * sec), buf = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return buf;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const s = this.settings, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted ? 0 : s.master, t, 0.05);
    this.musicBus.gain.setTargetAtTime(s.music, t, 0.05); this.sfxBus.gain.setTargetAtTime(s.sfx, t, 0.05);
    this.ambBus.gain.setTargetAtTime(s.ambience, t, 0.05); this.voiceBus.gain.setTargetAtTime(s.voice, t, 0.05);
  }

  dispose() {
    if (this.timer) clearInterval(this.timer); this.timer = null;
    this.stopSpeech(); void this.ctx?.close(); this.ctx = null;
    if (this.voicesHandler && 'speechSynthesis' in window) window.speechSynthesis.removeEventListener?.('voiceschanged', this.voicesHandler);
    this.voicesHandler = null;
  }
  unduck() { if (this.ctx) { this.duck.gain.cancelScheduledValues(this.ctx.currentTime); this.duck.gain.value = 1; } }
  suspend() { this.paused = true; void this.ctx?.suspend(); try { window.speechSynthesis?.pause(); } catch { /* */ } }
  resume() { this.paused = false; void this.ctx?.resume(); try { window.speechSynthesis?.resume(); } catch { /* */ } }
  stopSpeech() {
    if (this.speechTimer !== null) { window.clearTimeout(this.speechTimer); this.speechTimer = null; }
    if (this.bufferSource) { try { this.bufferSource.stop(); } catch { /* */ } this.bufferSource = null; }
    try { window.speechSynthesis?.cancel(); } catch { /* */ }
  }
  reset() { this.stopSpeech(); this.setAmb({}, 0.1, true); this.setMusic('none', 1); this.unduck(); }

  // ------------------------------------------------------------ ambience
  private src(buf: AudioBuffer, loop = true) { const s = this.ctx!.createBufferSource(); s.buffer = buf; s.loop = loop; s.loopStart = 0; s.start(0, Math.random() * 2); return s; }
  private lfo(freq: number, depth: number, target: AudioParam, type: OscillatorType = 'sine') {
    const c = this.ctx!, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(target); o.start();
  }
  private buildAmb() {
    const c = this.ctx!;
    const master = (name: string) => { const g = c.createGain(); g.gain.value = 0; g.connect(this.ambBus); this.ambG[name] = g; return g; };
    const filt = (type: BiquadFilterType, f: number, q = 0.7) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    // wind
    { const m = master('wind'), bp = filt('bandpass', 420, 0.7), mod = c.createGain(); mod.gain.value = 0.5;
      this.src(this.white).connect(bp); bp.connect(mod); mod.connect(m);
      this.lfo(0.11, 0.35, mod.gain); this.lfo(0.13, 260, bp.frequency);
      const lo = filt('lowpass', 140, 0.5); this.src(this.brown).connect(lo); const lg = c.createGain(); lg.gain.value = 0.9; lo.connect(lg); lg.connect(m); this.lfo(0.07, 0.4, lg.gain); }
    // rain
    { const m = master('rain'), hp = filt('highpass', 900), lp = filt('lowpass', 9000);
      this.src(this.white).connect(hp); hp.connect(lp); lp.connect(m);
      const lo = filt('lowpass', 500); this.src(this.brown).connect(lo); lo.connect(m); }
    // crickets
    { const m = master('crickets'), gate = c.createGain(); gate.gain.value = 0.5; gate.connect(m); this.lfo(0.35, 0.5, gate.gain);
      [4200, 4620, 3900].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.value = 0.5; o.connect(g); g.connect(gate); o.start(); this.lfo(18 + i * 3.1, 0.5, g.gain); }); }
    // drone
    { const m = master('drone'); const lp = filt('lowpass', 150);
      [[38, 'sine'], [55, 'sawtooth'], [82.9, 'triangle'], [58.3, 'sawtooth']].forEach(([f, t], i) => { const o = c.createOscillator(); o.type = t as OscillatorType; o.frequency.value = f as number; const g = c.createGain(); g.gain.value = i === 0 ? 0.9 : 0.25; o.connect(g); g.connect(lp); o.start(); this.lfo(0.05 + i * 0.03, 0.6, o.frequency); });
      lp.connect(m); }
    // room tone
    { const m = master('room'), lp = filt('lowpass', 240); this.src(this.brown).connect(lp); lp.connect(m); }
    // car engine
    { const m = master('engine'), lp = filt('lowpass', 260);
      [48, 49.5, 96].forEach((f) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const g = c.createGain(); g.gain.value = 0.3; o.connect(g); g.connect(lp); o.start(); this.lfo(7, 1.5, o.frequency); });
      const nz = filt('lowpass', 500); this.src(this.brown).connect(nz); nz.connect(m); lp.connect(m); }
    // fire crackle
    { const m = master('fire'), hp = filt('highpass', 1800), g = c.createGain(); g.gain.value = 0.2; this.src(this.white).connect(hp); hp.connect(g); g.connect(m);
      this.lfo(9, 0.2, g.gain, 'square'); this.lfo(3.3, 0.15, g.gain, 'square');
      const lo = filt('lowpass', 380); this.src(this.brown).connect(lo); lo.connect(m); }
    master('cave');
  }

  setAmb(levels: Partial<Record<string, number>>, ramp = 1.5, reset = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const k in this.ambG) {
      let v = levels[k];
      if (v === undefined) { if (!reset) continue; v = 0; }
      if (k === 'cave') { this.caveLevel = v; this.wet.gain.setTargetAtTime(0.16 + v * 0.45, t, 0.5); continue; }
      const g = this.ambG[k].gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(v * this.ambScale[k], t + Math.max(0.02, ramp));
    }
  }

  // ------------------------------------------------------------ music
  setMusic(mode: MusicMode, vol = 1) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    if (this.mus && this.mus.mode === mode) { this.mus.bus.gain.setTargetAtTime(vol, t, 0.5); return; }
    if (this.mus) { const old = this.mus.bus; old.gain.cancelScheduledValues(t); old.gain.setValueAtTime(old.gain.value, t); old.gain.linearRampToValueAtTime(0, t + 2.2); setTimeout(() => old.disconnect(), 4500); }
    if (mode === 'none') { this.mus = null; return; }
    const bus = c.createGain(); bus.gain.value = 0; bus.gain.linearRampToValueAtTime(vol, t + 2.2); bus.connect(this.musicBus);
    this.mus = { mode, bus, next: t + 0.1, step: 0 };
  }

  private tick() {
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const m = this.mus;
    if (m) { let guard = 0; while (m.next < c.currentTime + 0.35 && guard++ < 8) this.musicStep(m); }
    if (this.caveLevel > 0 && c.currentTime > this.nextDrip) {
      this.nextDrip = c.currentTime + 1.2 + Math.random() * 3.5;
      this.tone(c.currentTime + 0.02, { f: 1500 + Math.random() * 900, f2: 700, dur: 0.18, gain: 0.07 * this.caveLevel, type: 'sine' }, this.sfxBus, (Math.random() - 0.5) * 1.2);
    }
  }

  private mnote(f: number) { return 440 * Math.pow(2, (f - 69) / 12); }
  private pad(t: number, midi: number[], dur: number, gain: number, bus: GainNode, type: OscillatorType = 'sawtooth', cut = 380) {
    const c = this.ctx!; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lp.connect(g); g.connect(bus);
    midi.forEach((n, i) => { const o = c.createOscillator(); o.type = type; o.frequency.value = this.mnote(n); o.detune.value = (i - 1) * 7; o.connect(lp); o.start(t); o.stop(t + dur + 0.1); });
  }
  private pluck(t: number, midi: number, gain: number, bus: GainNode, dur = 1.1, type: OscillatorType = 'triangle', cut = 2200) {
    const c = this.ctx!; const o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
    o.type = type; o.frequency.value = this.mnote(midi); lp.type = 'lowpass'; lp.frequency.setValueAtTime(cut, t); lp.frequency.exponentialRampToValueAtTime(300, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  private thump(t: number, gain: number, bus: GainNode, f = 58) {
    const c = this.ctx!; const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.2);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.3);
  }

  private musicStep(m: { mode: MusicMode; bus: GainNode; next: number; step: number }) {
    const t = m.next, bus = m.bus, s = m.step++;
    switch (m.mode) {
      case 'calm': {
        const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
        const ch = chords[Math.floor(s / 8) % 4], arp = [0, 1, 2, 1, 2, 1, 0, 1];
        this.pluck(t, ch[arp[s % 8]] + 12, 0.1, bus, 1.3);
        if (s % 8 === 0) { this.pad(t, [ch[0] - 12, ch[1] - 12], 4.4, 0.05, bus, 'sine', 600); this.pluck(t, ch[0] - 12, 0.14, bus, 1.8, 'sine', 700); }
        m.next += 0.42; break;
      }
      case 'sad': {
        const seq = [57, 64, 60, 59, 57, 64, 62, 60];
        this.pluck(t, seq[s % 8] + (s % 3 === 0 ? 0 : 12), 0.13, bus, 3.2, 'sine', 3000);
        if (s % 4 === 0) this.pad(t, [45, 52], 6.5, 0.07, bus, 'sine', 500);
        m.next += 1.7; break;
      }
      case 'dread': case 'drone': {
        const roots = [33, 34, 31, 36];
        const r = roots[s % 4];
        this.pad(t, [r, r + 7, r + 13], 7, 0.09, bus, 'sawtooth', 220);
        if (m.mode === 'dread' && Math.random() < 0.55) { const o = this.ctx!.createOscillator(), g = this.ctx!.createGain(); const f = 1400 + Math.random() * 900; o.frequency.setValueAtTime(f, t + 1.5); o.frequency.exponentialRampToValueAtTime(f * 0.93, t + 5); g.gain.setValueAtTime(0.0001, t + 1.5); g.gain.exponentialRampToValueAtTime(0.012, t + 3); g.gain.exponentialRampToValueAtTime(0.0001, t + 5.5); o.connect(g); g.connect(bus); o.start(t + 1.5); o.stop(t + 6); }
        if (m.mode === 'dread' && s % 3 === 1) this.pluck(t + 2, 70 + (s % 5), 0.04, bus, 5, 'sine', 5000);
        m.next += m.mode === 'drone' ? 6.5 : 4.5 + Math.random() * 2; break;
      }
      case 'tension': {
        const beat = 0.95;
        this.thump(t, 0.34, bus); this.thump(t + 0.24, 0.2, bus, 50);
        if (s % 8 === 0) { this.pad(t, [34, 35, 41], 8, 0.08, bus, 'sawtooth', 260); this.pad(t + 1, [70, 71, 77], 6, 0.018, bus, 'sawtooth', 2400); }
        if (s % 5 === 3) this.pluck(t + 0.5, 82 + (s % 4), 0.03, bus, 3, 'sine', 6000);
        m.next += beat; break;
      }
      case 'chase': {
        const bassN = [33, 33, 36, 33, 33, 34, 33, 31];
        const pat = s % 8;
        this.pluck(t, bassN[pat], 0.2, bus, 0.22, 'sawtooth', 700);
        if (pat % 2 === 0) this.thump(t, 0.3, bus, 62);
        if (pat === 4 || pat === 0) this.burst(t, { dur: 0.12, type: 'bandpass', f: 1800, q: 0.8, gain: 0.16 }, bus);
        if (s % 16 === 6) { this.pluck(t, 81, 0.1, bus, 0.6, 'sawtooth', 3500); this.pluck(t, 82, 0.1, bus, 0.6, 'sawtooth', 3500); }
        if (s % 32 === 0) this.pad(t, [45, 46, 52], 6, 0.1, bus, 'sawtooth', 500);
        m.next += 0.2; break;
      }
      default: m.next += 1;
    }
  }

  // ------------------------------------------------------------ sfx primitives
  private route(vol: number, pan = 0, lp?: number, bus: GainNode = this.sfxBus) {
    const c = this.ctx!; const g = c.createGain(); g.gain.value = vol; let last: AudioNode = g;
    if (lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; last.connect(f); last = f; }
    if (pan) { const p = c.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); last.connect(p); last = p; }
    last.connect(bus); return g;
  }
  private burst(t: number, o: { dur: number; type?: BiquadFilterType; f?: number; f2?: number; q?: number; gain?: number; a?: number; brown?: boolean }, dest: AudioNode, pan = 0) {
    const c = this.ctx!; const s = c.createBufferSource(); s.buffer = o.brown ? this.brown : this.white; s.loop = true;
    const f = c.createBiquadFilter(); f.type = o.type ?? 'bandpass'; f.frequency.setValueAtTime(o.f ?? 1000, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur); f.Q.value = o.q ?? 1;
    const g = c.createGain(); const a = o.a ?? 0.004; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain ?? 0.5), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    s.connect(f); f.connect(g); let last: AudioNode = g; if (pan) { const p = c.createStereoPanner(); p.pan.value = pan; g.connect(p); last = p; } last.connect(dest);
    s.start(t, Math.random() * 2); s.stop(t + o.dur + 0.05);
  }
  private tone(t: number, o: { f: number; f2?: number; dur: number; gain: number; type?: OscillatorType; a?: number; lp?: number }, dest: AudioNode, pan = 0) {
    const c = this.ctx!; const os = c.createOscillator(), g = c.createGain(); os.type = o.type ?? 'sine';
    os.frequency.setValueAtTime(o.f, t); if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    const a = o.a ?? 0.01; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    let last: AudioNode = os; if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; os.connect(f); last = f; }
    last.connect(g); let out: AudioNode = g; if (pan) { const p = c.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; } out.connect(dest);
    os.start(t); os.stop(t + o.dur + 0.05);
  }
  /** voice-like formant burst (used for laughter / scream layers) */
  private vowel(t: number, f0: number, f0b: number, dur: number, gain: number, dest: AudioNode, formants: [number, number][] = [[800, 5], [1700, 6]], vib = 0) {
    const c = this.ctx!; const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0b, t + dur);
    if (vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 6 + Math.random() * 2; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.1); }
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.08, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    formants.forEach(([f, q]) => { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; o.connect(bp); bp.connect(g); });
    g.connect(dest); o.start(t); o.stop(t + dur + 0.1);
  }
  private dist(amount = 30) {
    const c = this.ctx!, ws = c.createWaveShaper(), n = 256, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x)); }
    ws.curve = curve; return ws;
  }

  // ------------------------------------------------------------ sfx
  sfx(name: string, o: SfxOpts = {}) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + 0.01, v = o.vol ?? 1, p = o.pan ?? 0;
    const d = this.route(v, p, o.lp);
    const B = (dt: number, op: Parameters<AudioEngine['burst']>[1]) => this.burst(t + dt, op, d);
    const T = (dt: number, op: Parameters<AudioEngine['tone']>[1]) => this.tone(t + dt, op, d);
    const step = (dt: number, g = 0.5, f = 320) => { B(dt, { dur: 0.13, type: 'lowpass', f, gain: g, a: 0.006 }); T(dt, { f: 70, f2: 45, dur: 0.12, gain: g * 0.6 }); };
    switch (name) {
      case 'steps': for (let i = 0; i < 6; i++) step(i * 0.56 + Math.random() * 0.04, 0.3, 380); break;
      case 'stepsSlow': for (let i = 0; i < 4; i++) step(i * (0.9 + (i % 2) * 0.35), 0.45, 260); break;
      case 'run': for (let i = 0; i < 12; i++) step(i * 0.27 + Math.random() * 0.03, 0.42, 520); break;
      case 'sprint': for (let i = 0; i < 14; i++) step(i * 0.17, 0.6, 340); break;
      case 'stepsWood': for (let i = 0; i < 5; i++) { step(i * 0.6, 0.35, 700); T(i * 0.6 + 0.02, { f: 120, f2: 90, dur: 0.15, gain: 0.05, type: 'triangle' }); } break;
      case 'door_creak': { const os = c.createOscillator(), g = c.createGain(), bp = c.createBiquadFilter(); os.type = 'sawtooth'; os.frequency.setValueAtTime(160, t); os.frequency.linearRampToValueAtTime(300, t + 0.7); os.frequency.linearRampToValueAtTime(140, t + 1.7);
        bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 9; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 0.3); g.gain.linearRampToValueAtTime(0.0001, t + 1.75);
        os.connect(bp); bp.connect(g); g.connect(d); os.start(t); os.stop(t + 1.8); B(0, { dur: 1.6, f: 900, q: 3, gain: 0.04, a: 0.4 }); break; }
      case 'creak': { const os = c.createOscillator(), g = c.createGain(), bp = c.createBiquadFilter(); os.type = 'sawtooth'; os.frequency.setValueAtTime(95, t); os.frequency.linearRampToValueAtTime(70, t + 0.8);
        bp.type = 'bandpass'; bp.frequency.value = 340; bp.Q.value = 14; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.12, t + 0.2); g.gain.linearRampToValueAtTime(0.0001, t + 0.9);
        os.connect(bp); bp.connect(g); g.connect(d); os.start(t); os.stop(t + 1); break; }
      case 'door_slam': B(0, { dur: 0.5, type: 'lowpass', f: 500, gain: 1, a: 0.002 }); T(0, { f: 80, f2: 30, dur: 0.6, gain: 0.9 }); B(0.02, { dur: 0.2, f: 2000, gain: 0.2 }); break;
      case 'knock': for (let i = 0; i < 3; i++) { T(i * 0.24, { f: 150, f2: 70, dur: 0.12, gain: 0.7 }); B(i * 0.24, { dur: 0.06, f: 900, q: 2, gain: 0.5 }); } break;
      case 'bang': B(0, { dur: 0.7, type: 'lowpass', f: 1000, f2: 120, gain: 1, a: 0.002 }); T(0, { f: 90, f2: 28, dur: 0.8, gain: 1 }); B(0.01, { dur: 0.15, f: 3000, gain: 0.3 }); break;
      case 'thud': T(0, { f: 75, f2: 38, dur: 0.35, gain: 0.8 }); B(0, { dur: 0.18, type: 'lowpass', f: 260, gain: 0.7 }); break;
      case 'crash': for (let i = 0; i < 6; i++) { B(i * 0.07, { dur: 0.25, type: 'bandpass', f: 400 + Math.random() * 1800, q: 1.5, gain: 0.5 }); T(i * 0.07, { f: 120 - i * 10, f2: 40, dur: 0.3, gain: 0.5 }); } break;
      case 'wood_break': B(0, { dur: 0.35, f: 1400, q: 1, gain: 0.8, a: 0.001 }); T(0, { f: 220, f2: 60, dur: 0.3, gain: 0.5, type: 'sawtooth', lp: 900 }); B(0.12, { dur: 0.2, f: 800, gain: 0.5 }); break;
      case 'glass': for (let i = 0; i < 7; i++) { B(i * 0.04, { dur: 0.45, type: 'highpass', f: 3500, gain: 0.5 }); T(i * 0.05, { f: 3000 + Math.random() * 3500, dur: 0.6 + Math.random() * 0.4, gain: 0.08 }); } B(0, { dur: 0.15, type: 'lowpass', f: 600, gain: 0.7 }); break;
      case 'thunder': B(0, { dur: 0.25, type: 'highpass', f: 1800, gain: 0.9, a: 0.001 }); B(0.15, { dur: 5, type: 'lowpass', f: 220, f2: 60, gain: 1, a: 0.5, brown: true }); T(0.2, { f: 48, f2: 28, dur: 3.5, gain: 0.5, a: 0.4 }); break;
      case 'rumble': B(0, { dur: 4, type: 'lowpass', f: 160, gain: 0.8, a: 1.2, brown: true }); T(0, { f: 40, f2: 30, dur: 4, gain: 0.4, a: 1.5 }); break;
      case 'static': { const n = 14; for (let i = 0; i < n; i++) B(i * 0.1, { dur: 0.12, f: 1500 + Math.random() * 3000, q: 0.4, gain: 0.1 + Math.random() * 0.25, a: 0.01 }); break; }
      case 'staticLong': { for (let i = 0; i < 40; i++) B(i * 0.12, { dur: 0.13, f: 1200 + Math.random() * 3500, q: 0.4, gain: 0.05 + Math.random() * 0.12, a: 0.01 }); break; }
      case 'tune': { T(0, { f: 300, f2: 1900, dur: 1.4, gain: 0.07, type: 'sine' }); T(1.4, { f: 1900, f2: 500, dur: 1.2, gain: 0.07 }); for (let i = 0; i < 22; i++) B(i * 0.12, { dur: 0.14, f: 2000, q: 0.3, gain: 0.13, a: 0.01 }); break; }
      case 'scream': { const dd = this.dist(40); dd.connect(d); const dest2 = dd;
        [380, 470, 560, 690, 820, 300].forEach((f, i) => { this.vowel(t + i * 0.05, f, f * (1.6 + i * 0.1), 3.0, 0.18, dest2, [[900 + i * 80, 5], [2200, 6]], 14 + i * 3); });
        this.vowel(t, 140, 260, 2.8, 0.2, dest2, [[500, 4], [1500, 5]], 8); B(0, { dur: 3, f: 3000, q: 0.6, gain: 0.25, a: 0.2 });
        T(0, { f: 50, f2: 32, dur: 3, gain: 0.5 }); break; }
      case 'screech': { const dd = this.dist(25); dd.connect(d); [900, 1250, 1600].forEach((f, i) => this.vowel(t + i * 0.03, f, f * 1.4, 1.1, 0.14, dd, [[1800, 6], [3200, 7]], 30)); B(0, { dur: 1, f: 4000, q: 0.5, gain: 0.2 }); break; }
      case 'breath': B(0, { dur: 1.0, f: 800, q: 0.9, gain: 0.22, a: 0.45 }); B(1.1, { dur: 1.3, f: 650, q: 0.9, gain: 0.18, a: 0.3 }); break;
      case 'breathHeavy': for (let i = 0; i < 4; i++) { B(i * 1.5, { dur: 0.7, f: 1100, q: 1.2, gain: 0.35, a: 0.3 }); B(i * 1.5 + 0.75, { dur: 0.7, f: 800, q: 1.2, gain: 0.3, a: 0.2 }); } break;
      case 'whisper': for (let i = 0; i < 9; i++) B(i * 0.2 + Math.random() * 0.06, { dur: 0.16, f: 2800 + Math.random() * 2500, q: 3, gain: 0.2 + Math.random() * 0.18, a: 0.04 }); break;
      case 'whisperLong': for (let i = 0; i < 22; i++) B(i * 0.21 + Math.random() * 0.08, { dur: 0.17, f: 2400 + Math.random() * 3000, q: 3, gain: 0.12 + Math.random() * 0.12, a: 0.04 }); break;
      case 'stinger': [233, 247, 349, 370, 117].forEach((f) => T(0, { f, f2: f * 0.97, dur: 2.4, gain: 0.12, type: 'sawtooth', lp: 1400, a: 0.02 })); T(0, { f: 52, f2: 30, dur: 2.2, gain: 0.8 }); B(0, { dur: 0.3, f: 1500, gain: 0.3 }); break;
      case 'sub': T(0, { f: 46, f2: 28, dur: 2.2, gain: 0.9, a: 0.05 }); break;
      case 'riser': T(0, { f: 80, f2: 900, dur: 4, gain: 0.1, type: 'sawtooth', lp: 1800, a: 3.2 }); B(0, { dur: 4, type: 'bandpass', f: 300, f2: 5000, q: 1, gain: 0.25, a: 3.5 }); break;
      case 'carDoor': B(0, { dur: 0.3, type: 'lowpass', f: 900, gain: 0.8 }); T(0, { f: 110, f2: 60, dur: 0.25, gain: 0.5 }); T(0.12, { f: 2500, dur: 0.05, gain: 0.1, type: 'square' }); break;
      case 'bell': T(0, { f: 2400, dur: 1.6, gain: 0.12 }); T(0.05, { f: 3200, dur: 1.2, gain: 0.08 }); T(0.4, { f: 2400, dur: 1.3, gain: 0.08 }); break;
      case 'flare': B(0, { dur: 0.8, type: 'lowpass', f: 1500, f2: 100, gain: 1, a: 0.001 }); T(0, { f: 100, f2: 30, dur: 0.6, gain: 0.8 }); B(0.15, { dur: 3.5, type: 'highpass', f: 1400, gain: 0.35, a: 0.1 }); B(0.15, { dur: 2.5, type: 'bandpass', f: 600, f2: 200, gain: 0.3 }); break;
      case 'click': B(0, { dur: 0.03, f: 3000, q: 2, gain: 0.5, a: 0.001 }); T(0.02, { f: 1800, dur: 0.03, gain: 0.1, type: 'square' }); break;
      case 'shutter': B(0, { dur: 0.04, f: 2500, q: 2, gain: 0.5, a: 0.001 }); B(0.07, { dur: 0.05, f: 1800, q: 2, gain: 0.4, a: 0.001 }); break;
      case 'heartbeat': for (let i = 0; i < 6; i++) { T(i * 0.85, { f: 62, f2: 36, dur: 0.22, gain: 0.8 }); T(i * 0.85 + 0.24, { f: 55, f2: 34, dur: 0.2, gain: 0.5 }); } break;
      case 'phone': for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) { T(r * 1.6 + i * 0.5, { f: 440, dur: 0.38, gain: 0.12, type: 'square', lp: 2500, a: 0.01 }); T(r * 1.6 + i * 0.5, { f: 480, dur: 0.38, gain: 0.12, type: 'square', lp: 2500, a: 0.01 }); } break;
      case 'laugh': for (let i = 0; i < 6; i++) this.vowel(t + i * 0.23, 380 - i * 12, 300 - i * 12, 0.17, 0.2, d, [[900, 6], [1900, 7]], 4); break;
      case 'rattle': for (let i = 0; i < 10; i++) B(i * 0.05, { dur: 0.05, f: 1300 + Math.random() * 400, q: 4, gain: 0.35 }); break;
      case 'scratch': for (let i = 0; i < 8; i++) B(i * 0.09, { dur: 0.08, type: 'highpass', f: 2800, gain: 0.3 }); break;
      case 'drag': B(0, { dur: 2.2, f: 220, q: 1.4, gain: 0.35, a: 0.5, brown: true }); break;
      case 'cassette': B(0, { dur: 0.05, f: 2000, gain: 0.5 }); B(0.2, { dur: 1.8, type: 'highpass', f: 4500, gain: 0.08, a: 0.1 }); T(0.2, { f: 90, dur: 1.8, gain: 0.03, type: 'square', lp: 300 }); break;
      case 'rustle': for (let i = 0; i < 6; i++) B(i * 0.12, { dur: 0.15, f: 3500, q: 0.6, gain: 0.12 }); break;
      case 'gust': B(0, { dur: 4, f: 350, f2: 900, q: 0.7, gain: 0.5, a: 1.5 }); break;
      case 'bird': for (let i = 0; i < 5; i++) T(i * 0.13, { f: 3000 + (i % 2) * 600, f2: 4300, dur: 0.1, gain: 0.05 }); break;
      case 'drip': T(0, { f: 1700, f2: 800, dur: 0.2, gain: 0.1 }); break;
      case 'paper': for (let i = 0; i < 4; i++) B(i * 0.07, { dur: 0.08, f: 5000, q: 0.5, gain: 0.12 }); break;
      case 'clink': T(0, { f: 3400, dur: 0.5, gain: 0.08 }); T(0.04, { f: 4700, dur: 0.4, gain: 0.05 }); break;
      case 'cut': { this.duck.gain.cancelScheduledValues(t); this.duck.gain.setValueAtTime(this.duck.gain.value, t); this.duck.gain.linearRampToValueAtTime(0.0, t + 0.06); break; }
      case 'uncut': { this.duck.gain.cancelScheduledValues(t); this.duck.gain.setValueAtTime(this.duck.gain.value, t); this.duck.gain.linearRampToValueAtTime(1, t + (o.vol ? 0.5 : 2.5)); break; }
      default: break;
    }
  }

  // ------------------------------------------------------------ dialogue
  private async loadManifest() {
    try {
      const r = await fetch('audio/voices/manifest.json', { cache: 'no-store' });
      if (!r.ok) return;
      const m = (await r.json()) as Record<string, string>;
      await Promise.all(Object.entries(m).map(async ([id, file]) => {
        try { const res = await fetch('audio/voices/' + file); const buf = await this.ctx!.decodeAudioData(await res.arrayBuffer()); this.assets.set(id.toLowerCase(), buf); this.assetNames.add(id); } catch { /* skip */ }
      }));
    } catch { /* no recorded voices shipped: fall back to speech synthesis */ }
  }

  async importFiles(files: FileList | File[]): Promise<number> {
    this.init(); let n = 0;
    for (const f of Array.from(files)) {
      try {
        const buf = await this.ctx!.decodeAudioData(await f.arrayBuffer());
        const id = f.name.replace(/\.[^.]+$/, '').toLowerCase(); this.assets.set(id, buf); this.assetNames.add(id); n++;
      } catch { /* not audio */ }
    }
    return n;
  }

  private pickVoice(id: VoiceId): SpeechSynthesisVoice | null {
    const cfg = this.settings.voices[id];
    const all = this.voices.filter((v) => /^en/i.test(v.lang));
    const pool = all.length ? all : this.voices;
    if (!pool.length) return null;
    if (cfg?.uri) { const hit = pool.find((v) => v.voiceURI === cfg.uri) ?? this.voices.find((v) => v.voiceURI === cfg.uri); if (hit) return hit; }
    const def = DEFAULT_VOICE_CFG[id];
    const rank = (v: SpeechSynthesisVoice) => (/natural|neural/i.test(v.name) ? 0 : /online/i.test(v.name) ? 1 : /google/i.test(v.name) ? 2 : 3) + (/en-US|en-GB/i.test(v.lang) ? 0 : 0.5);
    const list = pool.filter((v) => (def.g === 'f' ? FEMALE.test(v.name) && !MALE.test(v.name) : MALE.test(v.name) && !FEMALE.test(v.name))).sort((a, b) => rank(a) - rank(b));
    if (list.length) return list[def.alt % list.length];
    return pool[def.alt % pool.length];
  }

  private fxBed(line: Line, dur: number) {
    const c = this.ctx!, t = c.currentTime + 0.02, d = this.route(1, line.pan ?? 0, undefined, this.sfxBus);
    switch (line.fx) {
      case 'radio': for (let i = 0; i < dur / 0.1; i++) this.burst(t + i * 0.1, { dur: 0.11, f: 1800 + Math.random() * 2500, q: 0.4, gain: 0.04 + Math.random() * 0.07, a: 0.01 }, d); break;
      case 'phone': for (let i = 0; i < dur / 0.2; i++) this.burst(t + i * 0.2, { dur: 0.2, type: 'highpass', f: 3500, gain: 0.025, a: 0.02 }, d); break;
      case 'recording': for (let i = 0; i < dur / 0.15; i++) this.burst(t + i * 0.15, { dur: 0.16, type: 'highpass', f: 3500, gain: 0.04 + Math.random() * 0.05, a: 0.02 }, d); this.tone(t, { f: 60, dur: dur, gain: 0.02, type: 'square', lp: 250 }, d); break;
      case 'mimic': this.burst(t, { dur: Math.min(dur, 3), f: 900, q: 1.2, gain: 0.05, a: 0.4 }, d, (Math.random() - 0.5) * 1.4); this.tone(t, { f: 233, f2: 226, dur: Math.min(dur, 3), gain: 0.012, type: 'sawtooth', lp: 500, a: 0.6 }, d, (Math.random() - 0.5) * 1.6); break;
      case 'whisper': for (let i = 0; i < dur / 0.22; i++) this.burst(t + i * 0.22, { dur: 0.17, f: 2600 + Math.random() * 2200, q: 3, gain: 0.07 + Math.random() * 0.06, a: 0.04 }, d); break;
      default: break;
    }
  }

  speak(line: Line) {
    if (!this.ctx || this.settings.muted || !line.id) return;
    const avail = lineDur(line);
    this.fxBed(line, Math.min(avail, 6));
    const buf = this.assets.get(line.id.toLowerCase());
    if (buf) { this.playBuffer(buf, line); return; }
    this.speakTTS(line, avail);
  }

  private playBuffer(buf: AudioBuffer, line: Line) {
    this.stopSpeech();
    const c = this.ctx!; const s = c.createBufferSource(); s.buffer = buf; this.bufferSource = s;
    let last: AudioNode = s;
    const f = line.fx;
    if (f === 'radio' || f === 'phone' || f === 'recording') { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f === 'radio' ? 1500 : 1900; bp.Q.value = 0.8; last.connect(bp); last = bp; if (f === 'radio') { const ds = this.dist(8); last.connect(ds); last = ds; } }
    if (f === 'far' || f === 'mimic') { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f === 'far' ? 1400 : 3800; last.connect(lp); last = lp; if (f === 'mimic') s.playbackRate.value = 0.97; }
    if (f === 'whisper') { s.playbackRate.value = 0.8; }
    const g = this.route(f === 'far' ? 0.6 : f === 'whisper' ? 0.7 : 1, line.pan ?? 0, undefined, this.voiceBus);
    last.connect(g); s.start(c.currentTime + 0.02);
  }

  private speakTTS(line: Line, avail: number) {
    const ss = window.speechSynthesis; if (!ss) return;
    const id = line.voice, def = DEFAULT_VOICE_CFG[id], cfg = this.settings.voices[id];
    const u = new SpeechSynthesisUtterance(line.text.replace(/\.\.\./g, ', '));
    const v = this.pickVoice(id); if (v) { u.voice = v; u.lang = v.lang; }
    let pitch = cfg?.pitch ?? def.pitch, rate = cfg?.rate ?? def.rate;
    const est = (wordCount(line.text) * 0.37 + 0.35) / rate;
    if (est > avail) rate = Math.min(1.6, rate * (est / avail));
    rate *= line.rate ?? 1;
    let vol = this.settings.voice * this.settings.master;
    if (line.fx === 'mimic') { pitch *= 0.97; rate *= 0.93; vol *= 0.9; }
    if (line.fx === 'far') vol *= 0.55;
    if (line.fx === 'whisper') { vol *= 0.6; pitch = Math.min(pitch, 0.2); rate *= 0.85; }
    if (line.fx === 'radio' || line.fx === 'phone' || line.fx === 'recording') vol *= 0.85;
    u.pitch = Math.max(0.1, Math.min(2, pitch)); u.rate = Math.max(0.5, Math.min(2, rate)); u.volume = Math.max(0, Math.min(1, vol));
    this.stopSpeech();
    this.speechTimer = window.setTimeout(() => {
      this.speechTimer = null;
      try { ss.speak(u); if (this.paused) ss.pause(); } catch { /* */ }
    }, 30);
  }
}
