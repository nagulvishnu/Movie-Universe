import { useEffect, useRef, useSyncExternalStore } from "react";
import { Stage } from "./render/Stage";
import { player } from "./film/player";
import { TOTAL } from "./film/script";
import { audio } from "./audio/engine";
import { Overlays } from "./ui/Overlays";
import { Controls } from "./ui/Controls";
import { SPEAKER_LABEL, TIMELINE, CHAPTERS } from "./film/script";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Subtitles({ show }: { show: boolean }) {
  const snap = useSyncExternalStore(player.subscribe, player.getSnapshot);
  const l = snap.subtitle;
  if (!show || !l || snap.screen !== "film") return null;
  const label = l.label ?? SPEAKER_LABEL[l.speaker];
  const cls = "sub sp-" + l.speaker;
  return (
    <div className="subs" key={l.at}>
      <div className={cls}>
        {label && <span className="sub-label">{label}</span>}
        <span className="sub-text">{l.speaker === "W" ? `“${l.text}”` : l.text}</span>
      </div>
    </div>
  );
}

function Title() {
  const snap = useSyncExternalStore(player.subscribe, player.getSnapshot);
  if (snap.screen !== "title") return null;
  return (
    <div className="title-screen" onPointerDown={() => player.enterTitleAudio()}>
      <div className="title-grad" />
      <div className="title-block">
        <div className="eyebrow">AN ORIGINAL ANIMATED ROMANTIC DRAMA</div>
        <h1>BEFORE THE<br />LAST GOODBYE</h1>
        <p className="tagline">“She promised she would never leave.<br />He never knew she had already said goodbye.”</p>
        <div className="btns">
          <button className="primary" onClick={() => player.start(0)}>▶&nbsp; Start the movie</button>
          {snap.saved > 0 && <button onClick={() => player.start(snap.saved)}>↺&nbsp; Continue watching · {fmt(snap.saved)}</button>}
        </div>
        <div className="meta">
          <span>≈ {Math.round(TOTAL / 60)} min</span><span>Romantic drama</span><span>Real-time 3D</span><span>Subtitles</span>
        </div>
        <div className="seg q">
          <span>Picture</span>
          {(["low", "med", "high"] as const).map((q) => (
            <button key={q} className={snap.quality === q ? "on" : ""} onClick={() => player.setQuality(q)}>{q === "low" ? "Light" : q === "med" ? "Balanced" : "High"}</button>
          ))}
        </div>
        <p className="fine">Best in Chrome or Edge with headphones. Voices use your browser’s speech-synthesis engine (a fallback — no recorded voice actors). Music and sound are synthesised live.</p>
      </div>
    </div>
  );
}

function Ended() {
  const snap = useSyncExternalStore(player.subscribe, player.getSnapshot);
  if (!snap.ended) return null;
  return (
    <div className="ended">
      <div className="end-title">THE END</div>
      <div className="btns">
        <button className="primary" onClick={() => player.start(0)}>↺&nbsp; Watch again</button>
        <button onClick={() => player.toTitle()}>Back to title</button>
      </div>
    </div>
  );
}

export default function App() {
  const snap = useSyncExternalStore(player.subscribe, player.getSnapshot);
  const theater = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__btlg = { player, TIMELINE, CHAPTERS };
    player.boot();
    const q = new URLSearchParams(location.search);
    const t = q.get("t");
    if (q.get("q")) player.setQuality(q.get("q") as "low" | "med" | "high");
    if (t !== null) player.start(parseFloat(t), q.get("paused") === "1");
    else audio.speech.cancel();
  }, []);

  const look = snap.tb.beat.look;
  const filter = look === "flash" ? "sepia(0.35) saturate(0.8) contrast(1.05) brightness(1.04)" : look === "rec" ? "saturate(0.8) contrast(1.12) sepia(0.18)" : "none";

  return (
    <div className="theater" ref={theater}>
      <div className={"screen" + (look === "rec" ? " rec" : "")} onClick={() => snap.screen === "film" && player.toggle()}>
        <div className="canvas-wrap" style={{ filter }}>
          <Stage tb={snap.tb} tbRef={player.tbRef} getTime={player.getTime} quality={snap.quality} />
        </div>
        <Overlays snap={snap} />
        <Subtitles show={snap.subsOn} />
        <Title />
        <Ended />
        {snap.screen === "film" && !snap.playing && !snap.ended && <div className="paused-badge">PAUSED</div>}
      </div>
      <Controls snap={snap} theater={theater} />
    </div>
  );
}
