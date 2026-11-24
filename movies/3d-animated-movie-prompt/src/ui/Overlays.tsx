import { useEffect, useRef } from "react";
import { clock } from "../film/clock";
import { TIMELINE } from "../film/script";
import { player, type Snapshot } from "../film/player";

const CREDITS: [string, string[]][] = [
  ["", ["BEFORE THE LAST GOODBYE"]],
  ["CHARACTERS", ["RYAN  —  a procedural 3D character", "ANYA  —  a procedural 3D character", "DR. MEHRA  —  a procedural 3D character"]],
  ["VOICES", ["Spoken lines are rendered live by your browser's", "speech-synthesis engine (a documented fallback).", "No recorded voice actors were used."]],
  ["ORIGINAL SCORE", ["“Tomorrow” — theme and variations", "synthesised live with the Web Audio API:", "piano · acoustic guitar · strings · orchestral swell"]],
  ["SOUND", ["Rain, trains, ocean, café, hospital, footsteps,", "shutters, doors and paper — all procedural"]],
  ["IMAGE", ["Characters, faces, hands, hair, locations and lighting", "are built from code with Three.js", "No stock footage. No motion-capture. No stills."]],
  ["TECHNOLOGY", ["React · Vite · TypeScript", "Three.js · React Three Fiber · Drei", "Postprocessing · Web Audio API · SpeechSynthesis"]],
  ["LOCATIONS", ["Samudrapuram Railway Station · The Bookstore Café", "The Old Lighthouse · The Beach · City General Hospital"]],
  ["", ["For everyone who ever said goodbye", "and kept the light on."]],
];

export function Overlays({ snap }: { snap: Snapshot }) {
  const fade = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const doc = useRef<HTMLDivElement>(null);
  const cap = useRef<HTMLDivElement>(null);
  const cred = useRef<HTMLDivElement>(null);
  const credBox = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const b = snap.tb.beat;

  useEffect(() => {
    if (snap.screen !== "film") return;
    let raf = 0;
    const loop = () => {
      const tb = player.tbRef.current;
      const bt = tb.beat;
      const t = clock.time;
      const local = t - tb.start;
      const dur = tb.end - tb.start;
      const prev = TIMELINE[tb.index - 1];
      const next = TIMELINE[tb.index + 1];
      const diff = (x: typeof prev, y: typeof prev) => !x || !y || x.beat.env !== y.beat.env || x.beat.v !== y.beat.v || x.beat.light !== y.beat.light;
      const fi = bt.fade === "none" ? 0 : bt.fade === "in" || bt.fade === "both" || diff(prev, tb) ? 1.0 : 0;
      const fo = bt.fade === "none" ? 0 : bt.fade === "out" || bt.fade === "both" || diff(tb, next) ? 0.8 : 0;
      let o = 0;
      if (fi > 0) o = Math.max(o, 1 - local / fi);
      if (fo > 0) o = Math.max(o, 1 - (dur - local) / fo);
      if (fade.current) fade.current.style.opacity = String(Math.max(0, Math.min(1, o)));
      if (card.current && bt.card) {
        const d0 = bt.card.big ? 2.2 : 0.7;
        const a = Math.max(0, Math.min(1, (local - d0) / 1.4, (dur - local) / 1.2));
        card.current.style.opacity = String(a);
        card.current.style.transform = `translateY(${(1 - a) * 8}px) scale(${1 + (1 - a) * 0.01})`;
      }
      if (doc.current && bt.doc) {
        const a = Math.max(0, Math.min(1, (local - 0.4) / 0.8, (dur - local) / 0.8));
        doc.current.style.opacity = String(a);
        doc.current.style.transform = `translateY(${(1 - a) * 14}px) rotate(-1.2deg)`;
      }
      if (cap.current && bt.caption) {
        const a = Math.max(0, Math.min(1, (local - 1.2) / 1, (5.5 - local) / 1));
        cap.current.style.opacity = String(a);
      }
      if (bt.credits && cred.current && credBox.current) {
        const h = credBox.current.offsetHeight;
        const vh = cred.current.offsetHeight;
        const u = Math.max(0, Math.min(1, (local - 1.5) / (dur - 3)));
        credBox.current.style.transform = `translateY(${vh - u * (vh + h)}px)`;
      }
      if (tc.current && bt.tc) {
        const m = /(\d\d):(\d\d):(\d\d)/.exec(bt.tc);
        const base = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
        const s = Math.floor(base + local);
        const pad = (n: number) => String(n).padStart(2, "0");
        tc.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [snap.screen, snap.beatIndex]);

  if (snap.screen !== "film") return null;
  return (
    <>
      {b.look === "flash" && <div className="ov-flash" />}
      {b.look === "rec" && (
        <div className="ov-rec">
          <div className="rec-top"><span className="rec-dot" />REC<span className="rec-tc" ref={tc}>00:00:00</span></div>
          <div className="rec-corner tl" /><div className="rec-corner tr" /><div className="rec-corner bl" /><div className="rec-corner br" />
          <div className="rec-batt">▮▮▮▯ &nbsp; HD</div>
          <div className="rec-scan" />
        </div>
      )}
      {b.caption && <div className="ov-caption" ref={cap}>{b.caption}</div>}
      {b.card && (
        <div className={"ov-card" + (b.card.big ? " big" : "")} ref={card}>
          <div className="card-title">{b.card.title}</div>
          {b.card.sub && <div className="card-sub">{b.card.sub}</div>}
        </div>
      )}
      {b.doc && (
        <div className="ov-doc" ref={doc}>
          {b.doc.map((l, i) => (l ? <div key={i} className={i === 0 ? "doc-h" : ""}>{l}</div> : <div key={i} className="doc-gap" />))}
        </div>
      )}
      {b.credits && (
        <div className="ov-credits" ref={cred}>
          <div ref={credBox} className="credits-box">
            {CREDITS.map(([h, ls], i) => (
              <div key={i} className="credit-block">
                {h && <div className="credit-h">{h}</div>}
                {ls.map((l, j) => <div key={j} className={i === 0 || i === CREDITS.length - 1 ? "credit-big" : "credit-l"}>{l}</div>)}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="ov-fade" ref={fade} />
    </>
  );
}
