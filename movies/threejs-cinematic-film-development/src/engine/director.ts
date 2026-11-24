// Director: plays the screenplay timeline. Synchronises scenes, camera, animation, dialogue, music, ambience and transitions.
import { SCENES, SCENE_STARTS, TOTAL_DURATION, locate } from '../story/screenplay';
import type { Card, Line, SceneDef, Transition } from '../story/types';
import { Stage, type Quality, type SpeakInfo } from './stage';
import { audio } from './audio';
import { voice, estimateDur } from './voice';

export interface Snapshot {
  index: number; t: number; global: number; total: number; playing: boolean;
  line: Line | null; lineU: number; cards: { key: string; card: Card }[]; ended: boolean; scene: SceneDef;
}

const FADE: Record<Transition, number> = { cut: 0, dip: 0.45, fade: 0.9, slow: 1.8, flash: 0.5, black: 2.6 };

export class Director {
  stage: Stage;
  private raf = 0;
  private last = 0;
  private idx = 0; private t = 0; private animTime = 0;
  private playing = false; private ended = false;
  private sfxFired = new Set<number>(); private musFired = new Set<number>(); private spoken = new Set<string>();
  private lastSnap = 0; private lastKey = '';
  private fadeEl: HTMLElement | null = null;
  private loaded = false;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, private onSnap: (s: Snapshot) => void, private onEnd: () => void) {
    this.stage = new Stage(canvas);
    this.raf = requestAnimationFrame(this.tick);
  }

  setFadeElement(el: HTMLElement | null) { this.fadeEl = el; }
  setQuality(q: Quality) { this.stage.setQuality(q); }
  resize(w: number, h: number) { this.stage.resize(w, h); }
  get isPlaying() { return this.playing; }
  get sceneIndex() { return this.idx; }

  // ---- transport ----
  start(index = 0, t = 0) {
    audio.init(); void voice.init();
    this.ended = false;
    this.loadScene(index, t, true);
    this.playing = true; audio.resume();
    this.emit(true);
  }
  play() { if (this.ended) return; this.playing = true; audio.resume(); voice.resume(); this.emit(true); }
  pause() { this.playing = false; audio.pause(); voice.pause(); this.emit(true); }
  toggle() { this.playing ? this.pause() : this.play(); }
  seekGlobal(g: number) { const { index, t } = locate(Math.max(0, Math.min(TOTAL_DURATION - 0.05, g))); this.ended = false; this.loadScene(index, t, true); this.emit(true); }
  skip(delta: number) { this.seekGlobal(SCENE_STARTS[this.idx] + this.t + delta); }
  nextScene() { if (this.idx < SCENES.length - 1) { this.loadScene(this.idx + 1, 0, true); this.emit(true); } }
  prevScene() { if (this.t > 3 || this.idx === 0) this.loadScene(this.idx, 0, true); else this.loadScene(this.idx - 1, 0, true); this.emit(true); }
  gotoScene(i: number) { this.loadScene(Math.max(0, Math.min(SCENES.length - 1, i)), 0, true); this.emit(true); }
  restart() { this.ended = false; this.loadScene(0, 0, true); this.playing = true; audio.resume(); this.emit(true); }
  stopAudio() { audio.stopAll(); voice.cancel(); }

  // ---- internals ----
  private loadScene(i: number, t: number, seek: boolean) {
    this.idx = i; this.t = t;
    const s = SCENES[i];
    this.stage.load(s);
    this.sfxFired.clear(); this.musFired.clear(); this.spoken.clear();
    if (seek) {
      s.sfx?.forEach((c, k) => { if (c.at < t) this.sfxFired.add(k); });
      s.dialogue?.forEach((l) => { if (l.at < t - 0.05) this.spoken.add(l.id); });
    }
    let mood = s.music;
    s.mus?.forEach((m, k) => { if (m.at <= t) { mood = m.name; this.musFired.add(k); } });
    audio.setMusic(mood); audio.setAmbience(s.ambience);
    voice.cancel();
    this.loaded = true;
  }

  private tick = (now: number) => {
    if (this.disposed) return;
    const dt = Math.min(0.05, Math.max(0, (now - (this.last || now)) / 1000)); this.last = now;
    if (this.loaded) {
      if (this.playing) { this.animTime += dt; this.advance(dt); }
      this.render(dt);
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private advance(dt: number) {
    const s = SCENES[this.idx], prev = this.t;
    this.t += dt;
    s.sfx?.forEach((c, k) => { if (!this.sfxFired.has(k) && c.at <= this.t && c.at > prev - 0.5) { this.sfxFired.add(k); audio.sfx(c.name, c.vol ?? 1); } });
    s.mus?.forEach((m, k) => { if (!this.musFired.has(k) && m.at <= this.t) { this.musFired.add(k); audio.setMusic(m.name); } });
    s.dialogue?.forEach((l) => { if (!this.spoken.has(l.id) && l.at <= this.t) { this.spoken.add(l.id); if (this.t - l.at < 1.0) voice.speak(l); } });
    if (this.t >= s.dur) {
      if (this.idx >= SCENES.length - 1) { this.t = s.dur; this.playing = false; this.ended = true; this.emit(true); this.onEnd(); return; }
      this.loadScene(this.idx + 1, 0, false);
    }
  }

  private activeLine(s: SceneDef): { line: Line; u: number } | null {
    let best: Line | null = null;
    for (const l of s.dialogue ?? []) if (l.at <= this.t && this.t < l.at + estimateDur(l)) best = l;
    return best ? { line: best, u: (this.t - best.at) / estimateDur(best) } : null;
  }

  private render(dt: number) {
    const s = SCENES[this.idx];
    const al = this.activeLine(s);
    const sp: SpeakInfo | null = al ? { speaker: al.line.speaker, text: al.line.text, u: al.u, style: al.line.style ?? 'normal' } : null;
    this.stage.frame(this.t, this.playing ? dt : 0, this.animTime, sp, this.playing);
    // fade overlay
    const inT = s.fadeIn ?? 'dip', outT = s.fadeOut ?? 'dip', di = FADE[inT], dOut = FADE[outT];
    let a = 0;
    if (di > 0) a = Math.max(a, 1 - this.t / di);
    if (dOut > 0) a = Math.max(a, (this.t - (s.dur - dOut)) / dOut);
    if (s.holdBlack && this.t < s.holdBlack) a = 1;
    a = Math.max(0, Math.min(1, a));
    const white = inT === 'flash' && this.t < di;
    if (this.fadeEl) { this.fadeEl.style.opacity = String(a); this.fadeEl.style.background = white ? '#fff' : '#000'; }
    this.emit(false, al);
  }

  private emit(force: boolean, al?: { line: Line; u: number } | null) {
    const s = SCENES[this.idx];
    const a = al === undefined ? this.activeLine(s) : al;
    const cards = (s.cards ?? []).map((c, k) => ({ key: `${s.id}:${k}`, card: c })).filter((c) => this.t >= c.card.at && this.t < c.card.at + c.card.dur);
    const key = `${s.id}|${a?.line.id ?? ''}|${cards.map((c) => c.key).join(',')}|${this.playing}|${this.ended}`;
    const nowMs = performance.now();
    if (!force && key === this.lastKey && nowMs - this.lastSnap < 90) return;
    this.lastKey = key; this.lastSnap = nowMs;
    this.onSnap({ index: this.idx, t: this.t, global: SCENE_STARTS[this.idx] + this.t, total: TOTAL_DURATION, playing: this.playing, line: a?.line ?? null, lineU: a?.u ?? 0, cards, ended: this.ended, scene: s });
  }

  dispose() {
    this.disposed = true; cancelAnimationFrame(this.raf);
    voice.dispose(); audio.stopAll(); audio.dispose();
    this.stage.dispose();
  }
}
