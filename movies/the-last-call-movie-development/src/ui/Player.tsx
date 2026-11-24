import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "../audio/engine";
import { MovieCanvas } from "../stage/MovieCanvas";
import { stage } from "../movie/stage";
import { movie } from "../movie";
import { universe } from "../movie-universe-bridge";
import { Controls } from "./Controls";
import { Overlays } from "./Overlays";
import { ctl, savePref, type Prefs } from "./playback";

interface Props {
  startAt: number;
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
  onExit: () => void;
}

export function Player({ startAt, prefs, setPrefs, onExit }: Props) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(startAt);
  const [shown, setShown] = useState(true);
  const [ended, setEnded] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  stage.quality = prefs.quality;

  // boot playback
  useEffect(() => {
    let alive = true;
    audio.setVolume(prefsRef.current.volume);
    audio.setMuted(prefsRef.current.muted);
      ctl.onEnd = () => {
        universe.ended();
        setEnded(true);
        setPlaying(false);
        savePref("progress", 0);
        audio.stopAll();
      };
    (async () => {
      await audio.init();
      if (!alive) return;
      ctl.ended = false;
      ctl.t = startAt;
      ctl.seekTo = startAt;
      ctl.playing = true;
      setPlaying(true);
      universe.ready();
    })();
    return () => {
      alive = false;
      savePref("progress", ctl.ended ? 0 : ctl.t);
      ctl.playing = false;
      audio.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI clock + progress save
  useEffect(() => {
    const a = window.setInterval(() => setT(ctl.t), 200);
    const b = window.setInterval(() => {
      if (ctl.playing) {
        universe.progress(ctl.t, movie.duration);
        savePref("progress", ctl.t > movie.duration - 8 ? 0 : ctl.t);
      }
    }, 2000);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, []);

  const poke = useCallback(() => {
    setShown(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShown(false), 2800);
  }, []);
  useEffect(() => {
    poke();
    return () => window.clearTimeout(hideTimer.current);
  }, [poke]);

  const pause = useCallback(() => {
    ctl.playing = false;
    audio.pause();
    setPlaying(false);
  }, []);
  const resume = useCallback(async () => {
    await audio.resume();
    ctl.playing = true;
    setPlaying(true);
    poke();
  }, [poke]);
  const restart = useCallback(async () => {
    await audio.resume();
    ctl.ended = false;
    ctl.seekTo = 0;
    ctl.playing = true;
    setEnded(false);
    setPlaying(true);
  }, []);
  const toggle = useCallback(() => {
    if (ctl.ended) void restart();
    else if (ctl.playing) pause();
    else void resume();
  }, [pause, resume, restart]);
  const seek = useCallback((x: number) => {
    ctl.seekTo = Math.max(0, Math.min(movie.duration - 0.1, x));
    setT(x);
    ctl.ended = false;
    setEnded(false);
  }, []);
  const setVolume = (v: number) => {
    setPrefs({ ...prefs, volume: v });
    audio.setVolume(v);
    savePref("volume", v);
  };
  const toggleMute = () => {
    const m = !prefs.muted;
    setPrefs({ ...prefs, muted: m });
    audio.setMuted(m);
    savePref("muted", m);
  };
  const toggleSubs = () => {
    setPrefs({ ...prefs, subs: !prefs.subs });
    savePref("subs", !prefs.subs);
  };
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void wrap.current?.requestFullscreen?.();
  };

  const handlersRef = useRef({ toggle, toggleMute, fullscreen, toggleSubs, seek, poke });
  handlersRef.current = { toggle, toggleMute, fullscreen, toggleSubs, seek, poke };
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    const onKey = (e: KeyboardEvent) => {
      const h = handlersRef.current;
      h.poke();
      if (e.code === "Space") {
        e.preventDefault();
        h.toggle();
      } else if (e.key === "m" || e.key === "M") h.toggleMute();
      else if (e.key === "f" || e.key === "F") h.fullscreen();
      else if (e.key === "c" || e.key === "C") h.toggleSubs();
      else if (e.key === "ArrowRight") h.seek(ctl.t + 10);
      else if (e.key === "ArrowLeft") h.seek(ctl.t - 10);
    };
    const onHide = () => {
      if (document.hidden && ctl.playing) pause();
    };
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return (
    <div ref={wrap} className={`player ${shown || !playing ? "" : "idle"}`} onMouseMove={poke} onTouchStart={poke} onClick={toggle}>
      <div className="frame" ref={frame}>
        <MovieCanvas quality={prefs.quality} />
        <Overlays subs={prefs.subs} shakeTarget={frame} />
      </div>
      {!playing && !ended && (
        <div className="paused-badge">
          <div className="paused-title">PAUSED</div>
          <div className="paused-sub">Press space or click to resume</div>
        </div>
      )}
      {ended && (
        <div className="end-panel" onClick={(e) => e.stopPropagation()}>
          <div className="end-title">THE LAST CALL</div>
          <div className="end-sub">Thank you for watching.</div>
          <div className="end-actions">
            <button className="btn" onClick={() => void restart()}>
              WATCH AGAIN
            </button>
            <button className="btn ghost" onClick={onExit}>
              MAIN MENU
            </button>
          </div>
        </div>
      )}
      <Controls
        visible={shown || !playing}
        playing={playing}
        t={t}
        volume={prefs.volume}
        muted={prefs.muted}
        subs={prefs.subs}
        isFs={isFs}
        onToggle={toggle}
        onSeek={seek}
        onVolume={setVolume}
        onMute={toggleMute}
        onSubs={toggleSubs}
        onFullscreen={fullscreen}
        onRestart={() => void restart()}
        onMenu={onExit}
      />
    </div>
  );
}
