// Web Audio graph: music bus + sfx bus -> master (compressor) with a shared synthetic reverb.
class Mixer {
  ctx: AudioContext | null = null;
  master!: GainNode;
  music!: GainNode;
  sfx!: GainNode;
  reverbIn!: GainNode;
  noise!: AudioBuffer;
  private volume = 0.8;
  private muted = false;
  private duckLevel = 1;

  init() {
    if (this.ctx) { void this.ctx.resume(); return; }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.01; comp.release.value = 0.3;
    this.master = ctx.createGain(); this.master.connect(comp); comp.connect(ctx.destination);
    this.music = ctx.createGain(); this.music.gain.value = 0.5; this.music.connect(this.master);
    this.sfx = ctx.createGain(); this.sfx.gain.value = 0.62; this.sfx.connect(this.master);
    // Reverb impulse
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4); }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    this.reverbIn = ctx.createGain(); this.reverbIn.gain.value = 1;
    const wet = ctx.createGain(); wet.gain.value = 0.55;
    this.reverbIn.connect(conv); conv.connect(wet); wet.connect(this.master);
    // Shared noise buffer
    const nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.noise = nb;
    this.apply();
  }

  private apply() {
    if (!this.ctx) return;
    const v = this.muted ? 0 : Math.pow(this.volume, 1.6);
    this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    this.music.gain.setTargetAtTime(0.5 * this.duckLevel, this.ctx.currentTime, 0.4);
  }
  setVolume(v: number) { this.volume = v; this.apply(); }
  setMuted(m: boolean) { this.muted = m; this.apply(); }
  /** Lower the music while the narrator speaks so the voice stays clear. */
  duck(speaking: boolean) { this.duckLevel = speaking ? 0.6 : 1; this.apply(); }
  suspend() { void this.ctx?.suspend(); }
  resume() { void this.ctx?.resume(); }

  noiseSrc(loop = true) { const s = this.ctx!.createBufferSource(); s.buffer = this.noise; s.loop = loop; s.loopStart = Math.random() * 1.5; return s; }
}
export const mixer = new Mixer();
