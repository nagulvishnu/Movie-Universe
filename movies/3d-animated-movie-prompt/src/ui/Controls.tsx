import { useEffect, useRef, useState } from "react";
import { audio } from "../audio/engine";
import { player, type Snapshot, type Quality } from "../film/player";
import { TOTAL, CHAPTERS, ACT_MARKS, CREDITS_START } from "../film/script";

const fmt = (s: number) => {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

export function Controls({ snap, theater }: { snap: Snapshot; theater: React.RefObject<HTMLDivElement | null> }) {
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState<null | "settings" | "chapters">(null);
  const [vol, setVol] = useState(audio.vol);
  const [muted, setMuted] = useState(audio.muted);
  const timer = useRef(0);

  const poke = () => {
    setHidden(false);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHidden(true), 3200);
  };
  useEffect(() => {
    const el = theater.current;
    if (!el) return;
    el.addEventListener("mousemove", poke);
    el.addEventListener("pointerdown", poke);
    poke();
    return () => { el.removeEventListener("mousemove", poke); el.removeEventListener("pointerdown", poke); clearTimeout(timer.current); };
  }, [theater]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" && (e.target as HTMLInputElement).type === "range") return;
      if (snap.screen !== "film") return;
      if (e.code === "Space" || e.key === "k") { e.preventDefault(); player.toggle(); }
      else if (e.key === "ArrowRight") player.skip(10);
      else if (e.key === "ArrowLeft") player.skip(-10);
      else if (e.key === "m") { audio.setMuted(!audio.muted); setMuted(audio.muted); }
      else if (e.key === "c") player.setSubs(!snap.subsOn);
      else if (e.key === "f") toggleFs();
      poke();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const toggleFs = () => {
    const el = theater.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  if (snap.screen !== "film" || snap.ended) return null;
  const setV = (k: keyof typeof vol, v: number) => { audio.setVolumes({ [k]: v }); setVol({ ...audio.vol }); };
  const showing = !hidden || !snap.playing || panel;

  return (
    <div className={"controls" + (showing ? "" : " hide")} onClick={(e) => e.stopPropagation()}>
      {panel === "settings" && (
        <div className="panel">
          <h4>Sound</h4>
          {([["master", "Master"], ["music", "Music"], ["sfx", "Effects"], ["voice", "Voices"]] as const).map(([k, l]) => (
            <label key={k}><span>{l}</span><input type="range" min={0} max={1} step={0.01} value={vol[k]} onChange={(e) => setV(k, +e.target.value)} /></label>
          ))}
          <h4>Picture quality</h4>
          <div className="seg">
            {(["low", "med", "high"] as Quality[]).map((q) => (
              <button key={q} className={snap.quality === q ? "on" : ""} onClick={() => player.setQuality(q)}>{q === "low" ? "Low" : q === "med" ? "Balanced" : "High"}</button>
            ))}
          </div>
          <p className="hint">Low: no post-processing, no shadows. Balanced: bloom, depth-of-field. High: sharper shadows & reflections.</p>
        </div>
      )}
      {panel === "chapters" && (
        <div className="panel chapters">
          <h4>Scenes</h4>
          {CHAPTERS.map((c, i) => (
            <button key={i} className={snap.time >= c.start && (i === CHAPTERS.length - 1 || snap.time < CHAPTERS[i + 1].start) ? "cur" : ""} onClick={() => { player.seek(c.start); setPanel(null); }}>
              <span>{c.name}</span><em>{fmt(c.start)}</em>
            </button>
          ))}
        </div>
      )}
      <div className="seek">
        <input type="range" min={0} max={TOTAL} step={0.5} value={snap.time} onChange={(e) => player.seek(+e.target.value)} style={{ ["--p" as string]: `${(snap.time / TOTAL) * 100}%` }} />
        {ACT_MARKS.map((m, i) => <i key={i} className="tick" style={{ left: `${(m.t / TOTAL) * 100}%` }} title={m.name} />)}
        <i className="tick cr" style={{ left: `${(CREDITS_START / TOTAL) * 100}%` }} title="Credits" />
      </div>
      <div className="row">
        <button onClick={() => player.toggle()} title="Play / Pause (space)" className="big">{snap.playing ? "❚❚" : "▶"}</button>
        <button onClick={() => player.skip(-10)} title="Back 10s">⟲10</button>
        <button onClick={() => player.skip(10)} title="Forward 10s">10⟳</button>
        <span className="time">{fmt(snap.time)} / {fmt(TOTAL)}</span>
        <span className="grow" />
        <button onClick={() => { audio.setMuted(!muted); setMuted(!muted); }} title="Mute (m)">{muted || vol.master === 0 ? "🔇" : "🔊"}</button>
        <input className="vol" type="range" min={0} max={1} step={0.01} value={muted ? 0 : vol.master} onChange={(e) => { audio.setMuted(false); setMuted(false); setV("master", +e.target.value); }} />
        <button className={snap.subsOn ? "on" : ""} onClick={() => player.setSubs(!snap.subsOn)} title="Subtitles (c)">CC</button>
        <button className={panel === "chapters" ? "on" : ""} onClick={() => setPanel(panel === "chapters" ? null : "chapters")} title="Scenes">☰</button>
        <button className={panel === "settings" ? "on" : ""} onClick={() => setPanel(panel === "settings" ? null : "settings")} title="Settings">⚙</button>
        <button onClick={toggleFs} title="Fullscreen (f)">⛶</button>
        <button onClick={() => player.toTitle()} title="Exit to title">✕</button>
      </div>
    </div>
  );
}
