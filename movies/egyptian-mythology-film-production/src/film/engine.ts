import { mixer } from '../audio/mixer';
import { music } from '../audio/music';
import { narrator } from '../audio/narrator';
import { playSfx, setAmbience, stopAmbience } from '../audio/sfx';
import { universe } from '../movie-universe-bridge';
import { prefetchEnv } from '../environments';
import { chapterStarts, lineIndexAt, sceneIndexAt, TLINES, TOTAL_DURATION, TSCENES } from './timeline';
import { clock, type Quality } from './clock';

// The film engine: one master clock drives scenes, narration, music and effects, so everything stays in sync.
const PROGRESS_KEY = 'gae.progress.v1';
const PREFS_KEY = 'gae.prefs.v1';

export interface Prefs { volume: number; muted: boolean; captions: boolean; quality: Quality; voiceURI: string; rate: number; pitch: number }
const DEFAULT_PREFS: Prefs = { volume: 0.8, muted: false, captions: true, quality: 'medium', voiceURI: '', rate: 0.9, pitch: 0.82 };

export interface Snapshot extends Prefs {
  t: number; total: number; playing: boolean; started: boolean; buffering: boolean; ready: boolean; ended: boolean;
  sceneIdx: number; chapter: number; lineIdx: number; speaking: boolean; savedT: number;
}

const load = <T,>(key: string, fallback: T): T => { try { const r = localStorage.getItem(key); return r ? { ...fallback, ...JSON.parse(r) } : fallback; } catch { return fallback; } };

class FilmEngine {
  t = 0;
  private playing = false;
  private started = false;
  private buffering = false;
  private ready = false;
  private ended = false;
  private speaking = false;
  private sceneIdx = -1;
  private lineIdx = -2;
  private spoken = -1;
  private hitIdx = 0;
  private last = 0;
  private lastEmit = 0;
  private lastSave = 0;
  private seekFade = 0;
  private prefs: Prefs = load(PREFS_KEY, DEFAULT_PREFS);
  private savedT = (() => { try { const v = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}').t; return typeof v === 'number' ? v : 0; } catch { return 0; } })();
  private subs = new Set<() => void>();
  private snap!: Snapshot;
  fade = 1;
  flash = 0;

  constructor() {
    clock.quality = this.prefs.quality;
    narrator.configure({ voiceURI: this.prefs.voiceURI, rate: this.prefs.rate, pitch: this.prefs.pitch });
    narrator.setVolume(this.prefs.muted ? 0 : this.prefs.volume);
    if (this.savedT < 5 || this.savedT > TOTAL_DURATION - 20) this.savedT = 0;
    this.sceneIdx = sceneIndexAt(this.savedT);
    this.applyScene(this.sceneIdx, false);
    this.snap = this.makeSnap();
    if (typeof window !== 'undefined') { this.last = performance.now(); requestAnimationFrame(this.frame); }
  }

  // ---- React integration ----
  subscribe = (fn: () => void) => { this.subs.add(fn); return () => { this.subs.delete(fn); }; };
  getSnapshot = () => this.snap;
  private makeSnap(): Snapshot {
    const line = lineIndexAt(this.t);
    return {
      ...this.prefs, t: this.t, total: TOTAL_DURATION, playing: this.playing, started: this.started, buffering: this.buffering, ready: this.ready, ended: this.ended,
      sceneIdx: this.sceneIdx, chapter: TSCENES[this.sceneIdx]?.chapter ?? 0, lineIdx: line, speaking: this.speaking, savedT: this.savedT,
    };
  }
  private emit() { this.snap = this.makeSnap(); this.lastEmit = performance.now(); this.subs.forEach((f) => f()); }

  // ---- Preferences ----
  setPrefs(p: Partial<Prefs>) {
    this.prefs = { ...this.prefs, ...p };
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs)); } catch { /* storage unavailable */ }
    if (p.volume !== undefined || p.muted !== undefined) { mixer.setVolume(this.prefs.volume); mixer.setMuted(this.prefs.muted); narrator.setVolume(this.prefs.muted ? 0 : this.prefs.volume); }
    if (p.voiceURI !== undefined || p.rate !== undefined || p.pitch !== undefined) narrator.configure({ voiceURI: this.prefs.voiceURI, rate: this.prefs.rate, pitch: this.prefs.pitch });
    if (p.quality) clock.quality = p.quality;
    this.emit();
  }
  /** Re-speak the current line (used after changing the voice settings). */
  restartLine() { if (this.playing && this.lineIdx >= 0) { this.t = TLINES[this.lineIdx].start; this.spoken = -1; narrator.cancel(); this.speaking = false; } }

  // ---- Transport ----
  setReady() { if (!this.ready) { this.ready = true; this.emit(); } }
  setBuffering(b: boolean) { if (this.buffering !== b) { this.buffering = b; this.emit(); } }

  async play() {
    if (!this.started) { this.started = true; mixer.init(); mixer.setVolume(this.prefs.volume); mixer.setMuted(this.prefs.muted); music.start(); this.applyScene(this.sceneIdx, true); }
    universe.ready();
    if (this.ended) { this.seek(0); }
    mixer.resume();
    if (this.lineIdx >= 0) { this.t = TLINES[this.lineIdx].start; this.spoken = -1; }
    this.playing = true; this.ended = false; this.last = performance.now(); this.emit();
  }
  pause() {
    if (!this.playing) return;
    this.playing = false; narrator.cancel(); this.speaking = false; mixer.duck(false); mixer.suspend(); this.save(); this.emit();
  }
  toggle() { if (this.playing) this.pause(); else void this.play(); }
  /** Start from the saved position or the beginning. */
  begin(resume: boolean) { if (!resume) { this.t = 0; this.sceneIdx = -1; } else this.t = this.savedT; this.applyScene(sceneIndexAt(this.t), false); void this.play(); }

  seek(t: number) {
    t = Math.max(0, Math.min(TOTAL_DURATION - 0.01, t));
    narrator.cancel(); this.speaking = false; this.spoken = -1;
    this.t = t; this.ended = false;
    const li = lineIndexAt(t); if (li >= 0) this.t = TLINES[li].start;
    this.lineIdx = -2; this.seekFade = performance.now();
    this.applyScene(sceneIndexAt(this.t), false);
    clock.animT += 0; this.save(); this.emit();
  }
  seekChapter(i: number) { this.seek(chapterStarts[i] ?? 0); if (!this.playing) void this.play(); }

  private save() { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify({ t: this.t })); this.savedT = this.t; } catch { /* ignore */ } }

  // ---- Scene handling ----
  private applyScene(idx: number, forceAudio: boolean) {
    const changed = idx !== this.sceneIdx;
    this.sceneIdx = idx;
    const sc = TSCENES[idx]; if (!sc) return;
    clock.sceneDur = sc.dur;
    const prog = (this.t - sc.start) / sc.dur;
    this.hitIdx = (sc.def.hits ?? []).filter(([f]) => f <= prog).length;
    if (changed || forceAudio) {
      music.setCue(sc.def.music, forceAudio);
      setAmbience(sc.def.amb ?? []);
      const nx = TSCENES[idx + 1]; if (nx) prefetchEnv(nx.def.env);
      if (changed) this.emit();
    }
  }

  private frame = (now: number) => {
    requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    if (this.playing && !this.buffering) {
      universe.progress(this.t, TOTAL_DURATION);
      clock.animT += dt;
      let nt = this.t + dt;
      const li = lineIndexAt(this.t);
      if (li >= 0 && this.speaking) { const end = TLINES[li].start + TLINES[li].dur - 0.05; if (nt > end) nt = Math.max(this.t, end); } // hold until the narrator finishes
      this.t = nt;
      if (this.t >= TOTAL_DURATION) { this.finish(); return; }
      const si = sceneIndexAt(this.t);
      if (si !== this.sceneIdx) this.applyScene(si, false);
      const nli = lineIndexAt(this.t);
      if (nli !== this.lineIdx) { this.lineIdx = nli; if (nli >= 0 && nli !== this.spoken) this.speakLine(nli); this.emit(); }
      const sc = TSCENES[this.sceneIdx];
      const hits = sc.def.hits;
      const prog = (this.t - sc.start) / sc.dur;
      while (hits && this.hitIdx < hits.length && prog >= hits[this.hitIdx][0]) { playSfx(hits[this.hitIdx][1]); this.hitIdx++; }
      if (now - this.lastSave > 1500) { this.lastSave = now; this.save(); }
      if (now - this.lastEmit > 250) this.emit();
    }
    this.updateView(now);
  };

  private updateView(now: number) {
    const sc = TSCENES[this.sceneIdx]; if (!sc) return;
    const local = Math.max(0, this.t - sc.start);
    clock.sceneIdx = this.sceneIdx; clock.sceneTime = local; clock.progress = Math.min(1, local / sc.dur); clock.playing = this.playing;
    const left = sc.dur - local;
    const inT = this.sceneIdx === 0 ? 3 : 1.0, outT = sc.def.credits ? 3 : 1.0;
    let f = Math.max(local < inT ? 1 - local / inT : 0, left < outT ? 1 - left / outT : 0);
    const sf = (now - this.seekFade) / 1000; if (sf < 0.6) f = Math.max(f, 1 - sf / 0.6);
    this.fade = f;
    let fl = 0;
    for (const fr of sc.def.flash ?? []) { const d = (clock.progress - fr) * sc.dur; if (d > -0.08 && d < 1) fl = Math.max(fl, d < 0 ? 1 + d / 0.08 : Math.exp(-d * 4.5)); }
    this.flash = fl * 0.85;
  }

  private speakLine(i: number) {
    const line = TLINES[i];
    this.spoken = i; this.speaking = true; mixer.duck(true);
    narrator.speak(line.text, line.tone, () => { if (this.spoken === i) { this.speaking = false; mixer.duck(false); this.emit(); } }, undefined, line.dur * 1000 * 1.7 + 4000);
  }

  private finish() {
    universe.ended();
    this.playing = false; this.ended = true; this.speaking = false; this.t = TOTAL_DURATION; narrator.cancel(); music.stop(); stopAmbience();
    try { localStorage.removeItem(PROGRESS_KEY); this.savedT = 0; } catch { /* ignore */ }
    this.started = false; this.emit();
  }
}

export const engine = new FilmEngine();
