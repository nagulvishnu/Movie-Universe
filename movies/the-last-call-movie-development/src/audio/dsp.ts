/** Low-level Web Audio helpers shared by SFX, music and ambience. */
export interface Bus {
  ctx: AudioContext;
  /** current one-shot effect output (replaced on seek) */
  sfx: GainNode;
  music: GainNode;
  amb: GainNode;
  /** reverb send input */
  verb: GainNode;
  noise: AudioBuffer;
}

export const mf = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export function noiseNode(b: Bus, t: number, dur: number, loop = false): AudioBufferSourceNode {
  const s = b.ctx.createBufferSource();
  s.buffer = b.noise;
  s.loop = loop;
  s.start(t, Math.random() * 1.5);
  if (dur > 0) s.stop(t + dur + 0.05);
  return s;
}

export function env(g: AudioParam, t: number, peak: number, a: number, d: number) {
  g.cancelScheduledValues(t);
  g.setValueAtTime(0.0001, t);
  g.linearRampToValueAtTime(Math.max(peak, 0.0002), t + a);
  g.exponentialRampToValueAtTime(0.0001, t + a + d);
}

interface ToneOpts {
  out?: AudioNode;
  t: number;
  f: number;
  f2?: number;
  type?: OscillatorType;
  a?: number;
  d?: number;
  g?: number;
  verb?: number;
  det?: number;
  lp?: number;
}

export function tone(b: Bus, o: ToneOpts) {
  const { ctx } = b;
  const osc = ctx.createOscillator();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.f, o.t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, o.t + (o.a ?? 0.005) + (o.d ?? 0.3));
  if (o.det) osc.detune.value = o.det;
  const g = ctx.createGain();
  env(g.gain, o.t, o.g ?? 0.3, o.a ?? 0.005, o.d ?? 0.3);
  let node: AudioNode = osc;
  if (o.lp) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lp;
    osc.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(o.out ?? b.sfx);
  if (o.verb) {
    const v = ctx.createGain();
    v.gain.value = o.verb;
    g.connect(v);
    v.connect(b.verb);
  }
  osc.start(o.t);
  osc.stop(o.t + (o.a ?? 0.005) + (o.d ?? 0.3) + 0.1);
}

interface HitOpts {
  out?: AudioNode;
  t: number;
  d?: number;
  f?: number;
  f2?: number;
  q?: number;
  type?: BiquadFilterType;
  g?: number;
  a?: number;
  verb?: number;
}

export function hit(b: Bus, o: HitOpts) {
  const { ctx } = b;
  const d = o.d ?? 0.15;
  const n = noiseNode(b, o.t, d + (o.a ?? 0.003));
  const f = ctx.createBiquadFilter();
  f.type = o.type ?? "bandpass";
  f.frequency.setValueAtTime(o.f ?? 1000, o.t);
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, o.t + d);
  f.Q.value = o.q ?? 1;
  const g = ctx.createGain();
  env(g.gain, o.t, o.g ?? 0.3, o.a ?? 0.003, d);
  n.connect(f);
  f.connect(g);
  g.connect(o.out ?? b.sfx);
  if (o.verb) {
    const v = ctx.createGain();
    v.gain.value = o.verb;
    g.connect(v);
    v.connect(b.verb);
  }
}

/** Mechanical telephone bell: inharmonic partials gated at ~24 Hz like a real clapper. */
export function bellBurst(b: Bus, out: AudioNode, t: number, dur: number, f0: number, g: number, verb = 0.25) {
  const { ctx } = b;
  const gate = ctx.createGain();
  const n = 96;
  const curve = new Float32Array(n);
  const cycles = dur * 24;
  for (let i = 0; i < n; i++) {
    const ph = (i / n) * cycles;
    curve[i] = ph % 1 < 0.55 ? 1 : 0.05;
  }
  gate.gain.setValueAtTime(0, t);
  gate.gain.setValueCurveAtTime(curve, t + 0.002, dur - 0.004);
  const master = ctx.createGain();
  env(master.gain, t, g, 0.004, dur);
  master.gain.setValueAtTime(g, t + dur * 0.85);
  master.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05);
  [
    [1, 1],
    [1.504, 0.55],
    [2.76, 0.4],
    [4.1, 0.18],
  ].forEach(([r, a]) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f0 * r;
    const og = ctx.createGain();
    og.gain.value = a;
    o.connect(og);
    og.connect(gate);
    o.start(t);
    o.stop(t + dur + 0.1);
  });
  gate.connect(master);
  master.connect(out);
  const v = ctx.createGain();
  v.gain.value = verb;
  master.connect(v);
  v.connect(b.verb);
}

export function makeImpulse(ctx: AudioContext, secs = 3): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * secs);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  return buf;
}

export function makeNoise(ctx: AudioContext, secs = 4): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * secs);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

export function distortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const c = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  return c;
}
