import { useEffect, useState } from "react";
import { audio } from "../audio/engine";
import { loadManifest } from "../audio/assets";
import { speechAvailable, voiceCount } from "../audio/voice";
import { fmt, movie } from "../movie";
import { savePref, type Prefs } from "./playback";

interface Props {
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
  progress: number;
  onPlay: (from: number) => void;
}

function Phone() {
  return (
    <svg className="poster-phone" viewBox="0 0 400 300" aria-hidden>
      <defs>
        <radialGradient id="glow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#ff2a1a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff2a1a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a30" />
          <stop offset="100%" stopColor="#050506" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="190" rx="200" ry="130" fill="url(#glow)" />
      <path d="M60 230 Q60 150 130 130 L270 130 Q340 150 340 230 Z" fill="url(#body)" stroke="#444" strokeWidth="1.5" />
      <ellipse cx="200" cy="168" rx="52" ry="22" fill="#0b0b0d" stroke="#555" />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 1.7 + 0.35;
        return <circle key={i} cx={200 + Math.cos(a) * 36} cy={168 + Math.sin(a) * 14} r="4" fill="#000" stroke="#777" strokeWidth="0.7" />;
      })}
      <path d="M95 118 Q200 78 305 118" fill="none" stroke="#0c0c0e" strokeWidth="26" strokeLinecap="round" />
      <path d="M95 118 Q200 78 305 118" fill="none" stroke="#3a3a42" strokeWidth="2" strokeLinecap="round" transform="translate(0,-9)" />
      <rect x="70" y="106" width="46" height="34" rx="14" fill="#0c0c0e" stroke="#444" />
      <rect x="284" y="106" width="46" height="34" rx="14" fill="#0c0c0e" stroke="#444" />
      <circle cx="318" cy="205" r="5" fill="#ff3a22" className="poster-led" />
    </svg>
  );
}

export function TitleScreen({ prefs, setPrefs, progress, onPlay }: Props) {
  const [open, setOpen] = useState(false);
  const [rep, setRep] = useState(audio.assetReport());
  const [voices, setVoices] = useState(voiceCount());
  const hasProgress = progress > 5 && progress < movie.duration - 10;

  useEffect(() => {
    void loadManifest().then(() => setRep(audio.assetReport()));
    const id = window.setInterval(() => setVoices(voiceCount()), 800);
    return () => window.clearInterval(id);
  }, []);

  const start = async (from: number) => {
    // must run inside the click so the browser lets audio start
    audio.setVolume(prefs.volume);
    audio.setMuted(prefs.muted);
    await audio.init();
    onPlay(from);
  };

  const minutes = Math.round(movie.duration / 60);

  return (
    <div className="title-screen">
      <div className="poster-bg" />
      <div className="poster-rain" />
      <Phone />
      <div className="poster-vignette" />
      <div className="title-content">
        <div className="title-eyebrow">A MOVIE UNIVERSE FILM &nbsp;·&nbsp; MOVIE 03</div>
        <h1 className="title-main">THE LAST CALL</h1>
        <p className="title-tag">“The dead are calling. And tomorrow, someone else will answer.”</p>
        <div className="title-meta">
          Psychological Thriller &nbsp;/&nbsp; Mystery &nbsp;/&nbsp; Crime &nbsp;/&nbsp; Supernatural Drama &nbsp;·&nbsp; Runtime {fmt(movie.duration)} (~{minutes} min) &nbsp;·&nbsp; 3D Animated
        </div>
        <div className="title-actions">
          {hasProgress ? (
            <>
              <button className="btn primary" onClick={() => void start(progress)}>
                ▶ RESUME MOVIE <span className="btn-sub">{fmt(progress)}</span>
              </button>
              <button className="btn" onClick={() => void start(0)}>
                ⟲ RESTART MOVIE
              </button>
            </>
          ) : (
            <button className="btn primary" onClick={() => void start(0)}>
              ▶ PLAY MOVIE
            </button>
          )}
          <button className="btn ghost" onClick={() => setOpen((o) => !o)}>
            ⚙ SETTINGS
          </button>
        </div>
        {open && (
          <div className="settings">
            <div className="set-row">
              <label>Volume</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={prefs.volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setPrefs({ ...prefs, volume: v });
                  audio.setVolume(v);
                  savePref("volume", v);
                }}
              />
              <span>{Math.round(prefs.volume * 100)}%</span>
            </div>
            <div className="set-row">
              <label>Mute</label>
              <input
                type="checkbox"
                checked={prefs.muted}
                onChange={(e) => {
                  setPrefs({ ...prefs, muted: e.target.checked });
                  savePref("muted", e.target.checked);
                }}
              />
            </div>
            <div className="set-row">
              <label>Subtitles</label>
              <input
                type="checkbox"
                checked={prefs.subs}
                onChange={(e) => {
                  setPrefs({ ...prefs, subs: e.target.checked });
                  savePref("subs", e.target.checked);
                }}
              />
            </div>
            <div className="set-row">
              <label>Graphics</label>
              <select
                value={prefs.quality}
                onChange={(e) => {
                  const q = e.target.value as Prefs["quality"];
                  setPrefs({ ...prefs, quality: q });
                  savePref("quality", q);
                }}
              >
                <option value="low">Low (fastest)</option>
                <option value="medium">Medium (recommended)</option>
                <option value="high">High (depth of field)</option>
              </select>
            </div>
            <div className="set-note">
              <b>Voice audio:</b>{" "}
              {rep.registered.dialogue > 0
                ? `${rep.registered.dialogue} recorded dialogue file(s) registered in manifest.json — they are decoded when playback reaches them; any line without a file falls back to speech synthesis.`
                : "No recorded dialogue files are installed. Dialogue is spoken with your browser's SpeechSynthesis voices (a fallback, not professional voice acting)."}{" "}
              {speechAvailable() ? `${voices} browser voice(s) detected.` : "No browser speech voices detected — dialogue will be subtitle-only."}
              <br />
              <b>Music &amp; effects:</b> {rep.registered.music + rep.registered.sfx > 0 ? `${rep.registered.music} music / ${rep.registered.sfx} sfx files registered.` : "original procedural score and sound effects (no imported files)."}
            </div>
          </div>
        )}
        <div className="title-foot">Best experienced in a dark room with headphones. Space = pause · M = mute · C = subtitles · F = fullscreen · ←/→ = ±10s</div>
      </div>
    </div>
  );
}
