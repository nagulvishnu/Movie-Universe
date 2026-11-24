import { bellBurst, hit, tone, noiseNode, env, type Bus } from "./dsp";

type O = Record<string, number | string>;
const n = (o: O, k: string, d: number) => (typeof o[k] === "number" ? (o[k] as number) : d);

/** One-shot procedural sound effects. Every effect is synthesised, nothing is sampled. */
export function playSfx(b: Bus, name: string, o: O = {}) {
  const { ctx } = b;
  const t = ctx.currentTime + 0.02;
  const d = n(o, "d", 2);
  const g = n(o, "g", 1);
  switch (name) {
    case "thunder": {
      hit(b, { t, d: 0.25, f: 4000, type: "highpass", g: 0.5 * g, a: 0.002 });
      for (let i = 0; i < 6; i++)
        hit(b, { t: t + 0.15 + i * 0.35 + Math.random() * 0.3, d: 1.8, f: 160 + Math.random() * 100, f2: 60, type: "lowpass", q: 0.7, g: (0.9 - i * 0.1) * g, a: 0.08, verb: 0.5 });
      tone(b, { t: t + 0.2, f: 48, f2: 28, d: 3, g: 0.6 * g, a: 0.2, verb: 0.4 });
      break;
    }
    case "steps": {
      const pace = n(o, "pace", 0.55);
      const wet = n(o, "wet", 0);
      const cnt = Math.floor(d / pace);
      for (let i = 0; i < cnt; i++) {
        const tt = t + i * pace + (Math.random() - 0.5) * 0.03;
        hit(b, { t: tt, d: 0.09, f: 220 + Math.random() * 80, type: "lowpass", q: 1, g: 0.55 * g, verb: 0.1 });
        hit(b, { t: tt, d: 0.05, f: wet ? 1800 : 3000, type: "bandpass", q: 2, g: (wet ? 0.18 : 0.1) * g });
      }
      break;
    }
    case "door":
    case "doorClose": {
      const close = name === "doorClose";
      hit(b, { t, d: 0.18, f: 140, type: "lowpass", g: 0.9 * g, verb: 0.2 });
      hit(b, { t, d: 0.05, f: 1500, q: 3, g: 0.3 * g });
      if (!close) tone(b, { t: t + 0.02, f: 320, f2: 180, type: "sawtooth", d: 0.9, a: 0.1, g: 0.05 * g, lp: 600 });
      break;
    }
    case "doorCreak":
      tone(b, { t, f: 180, f2: 420, type: "sawtooth", d: n(o, "d", 1.6), a: 0.4, g: 0.07, lp: 900, verb: 0.3 });
      tone(b, { t: t + 0.3, f: 260, f2: 160, type: "sawtooth", d: 1.2, a: 0.3, g: 0.05, lp: 700 });
      break;
    case "lock":
      for (let i = 0; i < 3; i++) hit(b, { t: t + i * 0.12, d: 0.03, f: 3500, q: 6, g: 0.35 });
      hit(b, { t: t + 0.4, d: 0.12, f: 400, type: "lowpass", g: 0.6 });
      break;
    case "keys":
      for (let i = 0; i < 9; i++) hit(b, { t: t + i * 0.07 + Math.random() * 0.04, d: 0.06, f: 4500 + Math.random() * 2500, q: 8, g: 0.12 });
      break;
    case "impact":
      hit(b, { t, d: 1.4, f: 300, f2: 40, type: "lowpass", g: 1 * g, a: 0.002, verb: 0.5 });
      tone(b, { t, f: 90, f2: 28, d: 1.6, g: 0.9 * g, verb: 0.4 });
      break;
    case "boom":
      tone(b, { t, f: 60, f2: 22, d: 3.4, g: 1 * g, a: 0.03, verb: 0.7 });
      hit(b, { t, d: 3, f: 220, f2: 40, type: "lowpass", g: 0.8 * g, verb: 0.6, a: 0.03 });
      hit(b, { t: t + 0.05, d: 2.4, f: 8000, f2: 800, type: "bandpass", g: 0.15 * g, a: 0.01, verb: 0.8 });
      break;
    case "hit":
      hit(b, { t, d: 0.4, f: 500, f2: 80, type: "lowpass", g: 0.8 * g, verb: 0.2 });
      break;
    case "riser": {
      const nd = noiseNode(b, t, d);
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 3;
      f.frequency.setValueAtTime(200, t);
      f.frequency.exponentialRampToValueAtTime(5000, t + d);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(0.5 * g, t + d);
      gn.gain.linearRampToValueAtTime(0, t + d + 0.05);
      nd.connect(f);
      f.connect(gn);
      gn.connect(b.sfx);
      tone(b, { t, f: 55, f2: 220, type: "sawtooth", a: d, d: 0.1, g: 0.25 * g, lp: 600 });
      break;
    }
    case "staticBurst":
    case "radioOn": {
      hit(b, { t, d, f: 2400, q: 0.4, g: 0.4 * g * (name === "radioOn" ? 1.2 : 1), a: 0.01, verb: 0.1 });
      hit(b, { t, d, f: 6000, type: "highpass", g: 0.15 * g, a: 0.01 });
      for (let i = 0; i < Math.floor(d * 8); i++) hit(b, { t: t + Math.random() * d, d: 0.04, f: 900 + Math.random() * 3000, q: 4, g: 0.25 * g });
      break;
    }
    case "whispers": {
      for (let i = 0; i < Math.floor(d * 5); i++) {
        const tt = t + Math.random() * d;
        hit(b, { t: tt, d: 0.35 + Math.random() * 0.3, f: 1800 + Math.random() * 2200, f2: 1200 + Math.random() * 1500, q: 5, g: 0.05 * g, a: 0.12, verb: 0.6 });
      }
      break;
    }
    case "voices": {
      // overlapping murmured voices: formant-like bursts at several pitches
      for (let i = 0; i < Math.floor(d * 7); i++) {
        const tt = t + Math.random() * d;
        const base = [110, 130, 165, 210, 250][Math.floor(Math.random() * 5)];
        tone(b, { t: tt, f: base, f2: base * (0.9 + Math.random() * 0.25), type: "sawtooth", a: 0.12, d: 0.5 + Math.random() * 0.5, g: 0.035 * g, lp: 900 + Math.random() * 700, verb: 0.5 });
        hit(b, { t: tt, d: 0.5, f: 1200 + Math.random() * 1200, q: 6, g: 0.04 * g, a: 0.1, verb: 0.5 });
      }
      break;
    }
    case "glitch":
      for (let i = 0; i < 10; i++) {
        const tt = t + Math.random() * 0.5;
        hit(b, { t: tt, d: 0.03 + Math.random() * 0.05, f: 300 + Math.random() * 5000, q: 6, g: 0.3 * g });
        tone(b, { t: tt, f: 100 + Math.random() * 900, type: "square", d: 0.04, g: 0.07 * g });
      }
      break;
    case "alarm":
      for (let i = 0; i < Math.floor(d / 0.6); i++) {
        tone(b, { t: t + i * 0.6, f: 880, type: "square", a: 0.01, d: 0.25, g: 0.1 * g, lp: 2500 });
        tone(b, { t: t + i * 0.6 + 0.3, f: 660, type: "square", a: 0.01, d: 0.25, g: 0.1 * g, lp: 2500 });
      }
      break;
    case "powerUp":
      tone(b, { t, f: 40, f2: 120, type: "sawtooth", a: 1.6, d: 1.5, g: 0.35 * g, lp: 400, verb: 0.3 });
      tone(b, { t: t + 0.4, f: 200, f2: 1500, type: "sine", a: 1.8, d: 1, g: 0.1 * g });
      hit(b, { t: t + 1.6, d: 0.3, f: 100, type: "lowpass", g: 0.8 * g });
      break;
    case "powerDown":
      tone(b, { t, f: 150, f2: 25, type: "sawtooth", a: 0.02, d: 2.2, g: 0.35 * g, lp: 500, verb: 0.4 });
      hit(b, { t, d: 1, f: 2000, f2: 100, type: "lowpass", g: 0.4 * g });
      break;
    case "switchboard":
      for (let i = 0; i < Math.floor(d * 6); i++) {
        const tt = t + Math.random() * d;
        hit(b, { t: tt, d: 0.025, f: 2500 + Math.random() * 2000, q: 5, g: 0.18 * g });
        hit(b, { t: tt + 0.04, d: 0.05, f: 300, type: "lowpass", g: 0.2 * g });
      }
      break;
    case "spark":
      for (let i = 0; i < 6; i++) hit(b, { t: t + i * 0.03 + Math.random() * 0.03, d: 0.04, f: 5000 + Math.random() * 3000, type: "highpass", g: 0.3 * g });
      break;
    case "screech":
      tone(b, { t, f: 1100, f2: 700, type: "sawtooth", a: 0.05, d: 1.3, g: 0.14 * g, lp: 3000 });
      hit(b, { t, d: 1.3, f: 2200, f2: 1300, q: 2, g: 0.3 * g, a: 0.05 });
      break;
    case "crash":
      hit(b, { t, d: 0.6, f: 4500, type: "highpass", g: 0.9 * g, a: 0.001 });
      hit(b, { t, d: 1.8, f: 400, f2: 40, type: "lowpass", g: 1 * g, a: 0.001, verb: 0.4 });
      tone(b, { t, f: 70, f2: 25, d: 1.5, g: 1 * g });
      break;
    case "heart": {
      const bpm = n(o, "bpm", 70);
      const per = 60 / bpm;
      for (let i = 0; i < Math.floor(d / per); i++) {
        tone(b, { t: t + i * per, f: 62, f2: 38, d: 0.22, g: 0.8 * g });
        tone(b, { t: t + i * per + 0.2, f: 55, f2: 36, d: 0.2, g: 0.5 * g });
      }
      break;
    }
    case "tape":
      hit(b, { t, d: 0.05, f: 800, q: 2, g: 0.4 });
      hit(b, { t: t + 0.1, d: d, f: 5000, type: "highpass", g: 0.03 * g, a: 0.2 });
      break;
    case "typing":
      for (let i = 0; i < Math.floor(d * 9); i++) hit(b, { t: t + i * 0.11 + Math.random() * 0.07, d: 0.03, f: 1800 + Math.random() * 900, q: 3, g: 0.12 * g });
      break;
    case "beep":
      tone(b, { t, f: n(o, "f", 1200), type: "square", d: 0.14, g: 0.1 * g, lp: 3500 });
      break;
    case "pickup":
      hit(b, { t, d: 0.08, f: 500, type: "lowpass", g: 0.5 });
      hit(b, { t: t + 0.08, d: 0.04, f: 2200, q: 4, g: 0.25 });
      break;
    case "hangup":
      hit(b, { t, d: 0.12, f: 300, type: "lowpass", g: 0.7 });
      hit(b, { t: t + 0.01, d: 0.03, f: 2800, q: 4, g: 0.3 });
      tone(b, { t: t + 0.25, f: 425, type: "sine", a: 0.01, d: 1.0, g: 0.08 });
      break;
    case "dialtone":
      tone(b, { t, f: 350, a: 0.05, d: d, g: 0.06 });
      tone(b, { t, f: 440, a: 0.05, d: d, g: 0.06 });
      break;
    case "vibrate": {
      for (let i = 0; i < Math.floor(d / 0.55); i++) {
        const tt = t + i * 0.55;
        tone(b, { t: tt, f: 135, type: "sawtooth", a: 0.01, d: 0.32, g: 0.22 * g, lp: 500 });
        hit(b, { t: tt, d: 0.32, f: 1300, q: 1.5, g: 0.1 * g });
      }
      break;
    }
    case "paper":
      hit(b, { t, d: 0.35, f: 5000, type: "highpass", g: 0.18, a: 0.08 });
      break;
    case "chair":
      hit(b, { t, d: 0.4, f: 300, f2: 150, type: "lowpass", g: 0.4 });
      break;
    case "knock":
      for (let i = 0; i < 3; i++) hit(b, { t: t + i * 0.22, d: 0.07, f: 220, type: "lowpass", q: 2, g: 0.7 * g });
      break;
    case "siren":
      for (let i = 0; i < Math.floor(d / 1.2); i++) tone(b, { t: t + i * 1.2, f: 600, f2: 900, type: "sawtooth", a: 0.5, d: 0.7, g: 0.05 * g, lp: 1800, verb: 0.5 });
      break;
    case "shatter":
      for (let i = 0; i < 14; i++) hit(b, { t: t + Math.random() * 0.4, d: 0.12, f: 3500 + Math.random() * 4000, q: 8, g: 0.2 });
      break;
    case "drip":
      tone(b, { t, f: 1800, f2: 900, d: 0.12, g: 0.15, verb: 0.6 });
      break;
    case "ring-mini":
      bellBurst(b, b.sfx, t, 0.5, 1180, 0.25 * g);
      break;
    case "flicker":
      for (let i = 0; i < 6; i++) hit(b, { t: t + i * 0.07 + Math.random() * 0.05, d: 0.04, f: 120, type: "lowpass", g: 0.5 });
      break;
    case "swell": {
      const gg = ctx.createGain();
      env(gg.gain, t, 0.3 * g, d * 0.6, d * 0.4);
      gg.connect(b.sfx);
      [55, 58.3, 82.4].forEach((f) => {
        const os = ctx.createOscillator();
        os.type = "sawtooth";
        os.frequency.value = f;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 280;
        os.connect(lp);
        lp.connect(gg);
        os.start(t);
        os.stop(t + d + 0.2);
      });
      break;
    }
    default:
      break;
  }
}
