import { audio } from "../audio/engine";
import { stage } from "./stage";
import type { CMovie, CShot } from "./types";

/**
 * The conductor turns the single timeline clock into stage state and audio events.
 * Camera, actors, props and subtitles read `stage`; audio is triggered here.
 */
export class Conductor {
  private li = 0;
  private ci = 0;
  private shot: CShot | null = null;

  constructor(private movie: CMovie) {
    stage.movie = movie;
  }

  private findShot(t: number): CShot {
    const s = this.movie.shots;
    let lo = 0;
    let hi = s.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (s[mid].start <= t) lo = mid;
      else hi = mid - 1;
    }
    return s[lo];
  }

  private applyShot(sh: CShot) {
    this.shot = sh;
    stage.shot = sh;
    stage.shotIdx = sh.idx;
    stage.sceneIdx = sh.sceneIdx;
    stage.st = sh.st;
    stage.ring = sh.ring;
    audio.setMusic(sh.music);
    audio.setAmb(sh.amb);
    audio.setRing(sh.ring);
    const ahead = this.movie.lines.filter((l) => l.start > stage.t && l.start < stage.t + 40);
    audio.preload(ahead);
  }

  /** Jump to a time, resetting transient audio. */
  seek(t: number) {
    const m = this.movie;
    t = Math.max(0, Math.min(m.duration - 0.01, t));
    stage.t = t;
    stage.vis = {};
    audio.stopTransient();
    this.li = m.lines.findIndex((l) => l.start >= t);
    if (this.li < 0) this.li = m.lines.length;
    this.ci = m.cues.findIndex((c) => c.t >= t);
    if (this.ci < 0) this.ci = m.cues.length;
    this.applyShot(this.findShot(t));
    this.updateFade();
  }

  private updateFade() {
    const sh = this.shot!;
    const t = stage.t;
    const sc = this.movie.scenes[sh.sceneIdx];
    let f = Math.max(1 - (t - sc.start) / sc.fadeIn, 1 - (sc.end - t) / sc.fadeOut, 0);
    if (sh.fi) f = Math.max(f, 1 - (t - sh.start) / sh.fi);
    if (sh.fo) f = Math.max(f, 1 - (sh.end - t) / sh.fo);
    if (sh.black) f = 1;
    stage.fade = Math.min(1, f);
  }

  /** Advance. Call every frame with the already-updated playback time. */
  tick(t: number, playing: boolean) {
    const m = this.movie;
    stage.t = t;
    stage.playing = playing;
    if (!this.shot || t < this.shot.start || t >= this.shot.end) {
      const next = this.findShot(t);
      if (next !== this.shot) this.applyShot(next);
    }
    if (playing) {
      while (this.ci < m.cues.length && m.cues[this.ci].t <= t) {
        const c = m.cues[this.ci++];
        if (c.n.startsWith("v:")) stage.vis[c.n] = c.t;
        else {
          if (c.n === "thunder") stage.vis["v:thunder"] = c.t;
          if (t - c.t < 0.5) audio.cue(c.n, c.o);
        }
      }
      while (this.li < m.lines.length && m.lines[this.li].start <= t) {
        const l = m.lines[this.li++];
        if (t - l.start < 0.6) audio.line(l);
      }
    }
    this.updateFade();
  }
}
