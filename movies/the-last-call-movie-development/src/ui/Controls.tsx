import { movie, fmt } from "../movie";

interface Props {
  visible: boolean;
  playing: boolean;
  t: number;
  volume: number;
  muted: boolean;
  subs: boolean;
  onToggle: () => void;
  onSeek: (t: number) => void;
  onVolume: (v: number) => void;
  onMute: () => void;
  onSubs: () => void;
  onFullscreen: () => void;
  onRestart: () => void;
  onMenu: () => void;
  isFs: boolean;
}

const acts = movie.scenes.filter((s) => ["s01", "a2", "a3", "s17c", "s19a"].includes(s.id));

export function Controls(p: Props) {
  const pct = (p.t / movie.duration) * 100;
  return (
    <div className={`controls ${p.visible ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
      <div
        className="seek"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          p.onSeek(((e.clientX - r.left) / r.width) * movie.duration);
        }}
      >
        <div className="seek-track">
          <div className="seek-fill" style={{ width: `${pct}%` }} />
          {acts.map((s) => (
            <div key={s.id} className="seek-tick" style={{ left: `${(s.start / movie.duration) * 100}%` }} title={s.title} />
          ))}
        </div>
        <div className="seek-knob" style={{ left: `${pct}%` }} />
      </div>
      <div className="ctl-row">
        <button className="ctl-btn" onClick={p.onToggle} aria-label={p.playing ? "Pause" : "Play"}>
          {p.playing ? "❚❚" : "▶"}
        </button>
        <button className="ctl-btn" onClick={p.onRestart} aria-label="Restart" title="Restart movie">
          ⟲
        </button>
        <div className="ctl-time">
          {fmt(p.t)} <span style={{ opacity: 0.5 }}>/ {fmt(movie.duration)}</span>
        </div>
        <div className="ctl-spacer" />
        <button className="ctl-btn" onClick={p.onMute} aria-label="Mute" title="Mute (M)">
          {p.muted || p.volume === 0 ? "🔇" : "🔊"}
        </button>
        <input className="ctl-vol" type="range" min={0} max={1} step={0.02} value={p.muted ? 0 : p.volume} onChange={(e) => p.onVolume(parseFloat(e.target.value))} aria-label="Volume" />
        <button className={`ctl-btn ctl-cc ${p.subs ? "on" : ""}`} onClick={p.onSubs} aria-label="Subtitles" title="Subtitles (C)">
          CC
        </button>
        <button className="ctl-btn" onClick={p.onFullscreen} aria-label="Fullscreen" title="Fullscreen (F)">
          {p.isFs ? "⤢" : "⛶"}
        </button>
        <button className="ctl-btn ctl-text" onClick={p.onMenu}>
          MENU
        </button>
      </div>
    </div>
  );
}
