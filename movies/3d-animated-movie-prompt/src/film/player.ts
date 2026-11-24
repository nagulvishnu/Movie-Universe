import { audio } from "../audio/engine";
import { clock } from "./clock";
import { TIMELINE, TOTAL, POSTER_TB, beatIndexAt } from "./script";
import { universe } from "../movie-universe-bridge";
import type { LineEvent, TimedBeat } from "./types";

export type Quality = "low" | "med" | "high";
export interface Snapshot {
  screen: "title" | "film";
  playing: boolean;
  beatIndex: number;
  time: number;
  ended: boolean;
  subtitle: LineEvent | null;
  subsOn: boolean;
  quality: Quality;
  tb: TimedBeat;
  saved: number;
}

const PKEY = "btlg.progress";
const SKEY = "btlg.settings";

function loadSettings(): { subsOn: boolean; quality: Quality } {
  try { return { subsOn: true, quality: "med", ...JSON.parse(localStorage.getItem(SKEY) || "{}") }; } catch { return { subsOn: true, quality: "med" }; }
}
const loadProgress = () => {
  const v = parseFloat(localStorage.getItem(PKEY) || "0");
  return isFinite(v) && v > 5 && v < TOTAL - 20 ? v : 0;
};

class Player {
  tbRef: { current: TimedBeat } = { current: POSTER_TB };
  private listeners = new Set<() => void>();
  private idx = -1;
  private last = 0;
  private lastSave = 0;
  private lastEmit = 0;
  private raf = 0;
  private titleT = 0;
  snap: Snapshot;

  constructor() {
    const s = loadSettings();
    this.snap = { screen: "title", playing: false, beatIndex: -1, time: 0, ended: false, subtitle: null, subsOn: s.subsOn, quality: s.quality, tb: POSTER_TB, saved: loadProgress() };
  }

  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  getSnapshot = () => this.snap;
  private emit(p: Partial<Snapshot>) {
    this.snap = { ...this.snap, ...p };
    this.listeners.forEach((l) => l());
  }

  /** time used by the renderer. In title mode: ping-pong over the poster shot. */
  getTime = () => {
    if (this.snap.screen === "title") {
      const p = this.titleT % 80;
      return p < 40 ? p : 80 - p;
    }
    return clock.time;
  };

  boot() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (ts: number) => {
      const dt = Math.min(0.1, (ts - this.last) / 1000);
      this.last = ts;
      this.tick(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private tick(dt: number) {
    if (this.snap.screen === "title") {
      this.titleT += dt;
      clock.time = this.titleT;
      return;
    }
    if (!clock.playing) return;
    const prev = clock.time;
    clock.time = Math.min(TOTAL, prev + dt);
    this.advance(prev, clock.time);
    const now = performance.now();
    if (now - this.lastEmit > 250) { this.lastEmit = now; if (clock.playing) universe.progress(clock.time, TOTAL); this.emit({ time: clock.time }); }
    if (now - this.lastSave > 2000) { this.lastSave = now; this.save(); }
    if (clock.time >= TOTAL) this.finish();
  }

  private save() {
    try { localStorage.setItem(PKEY, String(clock.time)); } catch { /* */ }
  }

  private advance(prev: number, t: number) {
    const idx = beatIndexAt(t);
    let prevLocal: number;
    if (idx !== this.idx) {
      this.idx = idx;
      const tb = TIMELINE[idx];
      this.tbRef.current = tb;
      this.applyBeatAudio(tb);
      this.emit({ beatIndex: idx, tb, time: t });
      prevLocal = -1;
    } else prevLocal = prev - TIMELINE[idx].start;
    const tb = TIMELINE[idx];
    const local = t - tb.start;
    for (const [ft, name] of tb.beat.fx ?? []) if (ft > prevLocal && ft <= local) audio.fx(name);
    for (const l of tb.lines) if (l.at > prev && l.at <= t) audio.speech.speak(l.text, l.speaker, l.end - l.at);
    const act = tb.lines.find((l) => t >= l.at && t < l.end) ?? null;
    if (act !== this.snap.subtitle) this.emit({ subtitle: act });
  }

  private applyBeatAudio(tb: TimedBeat) {
    const b = tb.beat;
    if (b.music) audio.setMusic(b.music.v, b.music.vol ?? 0.8);
    audio.setAmbience(b.amb ?? []);
  }

  private jump(t: number) {
    audio.speech.cancel();
    clock.time = Math.max(0, Math.min(TOTAL - 0.01, t));
    this.idx = beatIndexAt(clock.time);
    const tb = TIMELINE[this.idx];
    this.tbRef.current = tb;
    this.applyBeatAudio(tb);
    const act = tb.lines.find((l) => clock.time >= l.at && clock.time < l.end) ?? null;
    this.emit({ beatIndex: this.idx, tb, time: clock.time, subtitle: act, ended: false });
  }

  start(from = 0, paused = false) {
    audio.unlock();
    audio.setMusic("off");
    clock.mode = "film";
    this.emit({ screen: "film", ended: false });
    this.jump(from);
    universe.ready();
    if (paused) this.pauseNow(); else this.play();
  }
  play() {
    audio.unlock();
    if (this.snap.ended) this.jump(0);
    clock.playing = true;
    audio.resume();
    this.emit({ playing: true });
  }
  private pauseNow() {
    clock.playing = false;
    audio.pause();
    this.save();
    this.emit({ playing: false });
  }
  pause() { this.pauseNow(); }
  toggle() { if (clock.playing) this.pauseNow(); else this.play(); }
  seek(t: number) {
    this.jump(t);
    this.save();
  }
  skip(d: number) { this.seek(clock.time + d); }
  private finish() {
    clock.playing = false;
    universe.ended();
    audio.stopAll();
    try { localStorage.removeItem(PKEY); } catch { /* */ }
    this.emit({ playing: false, ended: true, subtitle: null, saved: 0 });
  }
  toTitle() {
    clock.playing = false;
    audio.stopAll();
    this.idx = -1;
    this.tbRef.current = POSTER_TB;
    this.titleT = 0;
    clock.mode = "title";
    this.emit({ screen: "title", playing: false, ended: false, tb: POSTER_TB, beatIndex: -1, subtitle: null, saved: loadProgress() });
    audio.setMusic("piano", 0.5);
    audio.setAmbience(["wind", "sea", "gulls"]);
  }
  enterTitleAudio() {
    audio.unlock();
    audio.setMusic("piano", 0.5);
    audio.setAmbience(["wind", "sea", "gulls"]);
  }
  setSubs(on: boolean) {
    this.persist({ subsOn: on });
    this.emit({ subsOn: on });
  }
  setQuality(q: Quality) {
    this.persist({ quality: q });
    this.emit({ quality: q });
  }
  private persist(p: Partial<{ subsOn: boolean; quality: Quality }>) {
    try { localStorage.setItem(SKEY, JSON.stringify({ subsOn: this.snap.subsOn, quality: this.snap.quality, ...p })); } catch { /* */ }
  }
}

export const player = new Player();
