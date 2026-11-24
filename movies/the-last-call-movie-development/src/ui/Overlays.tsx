import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { stage, vis } from "../movie/stage";
import type { CLine, CShot, SpeakerId } from "../movie/types";
import { audio } from "../audio/engine";

const NAMES: Partial<Record<SpeakerId, string>> = {
  daniel: "DANIEL",
  sarah: "SARAH",
  emily: "EMILY",
  victor: "VICTOR",
  olivia: "OLIVIA",
  boy: "BOY",
  narrator: "NARRATOR",
  caller: "CALLER",
  youngman: "YOUNG MAN",
  father: "SARAH'S FATHER",
  mother: "DANIEL'S MOTHER",
  girl: "GIRL",
  researcher: "RESEARCHER",
  self: "VOICE",
};

function creditsLines(): [string, string][] {
  const rep = audio.assetReport();
  const voiceNote =
    rep.registered.dialogue > 0
      ? "Recorded dialogue where supplied · speech synthesis elsewhere"
      : "Browser speech synthesis (fallback) · no recorded voice performances";
  return [
    ["", "THE LAST CALL"],
    ["A MOVIE UNIVERSE FILM", "MOVIE 03"],
    ["", ""],
    ["DANIEL REED", "Animated character"],
    ["SARAH COLLINS", "Animated character"],
    ["EMILY REED", "Animated character"],
    ["VICTOR HALE", "Animated character"],
    ["OLIVIA MARSH", "Animated character"],
    ["THE LITTLE BOY", "Animated character"],
    ["", ""],
    ["VOICES", voiceNote],
    ["MUSIC", "Original generative score · Web Audio synthesis"],
    ["SOUND DESIGN", "Procedural effects · telephone bell motif"],
    ["", ""],
    ["WRITTEN & DIRECTED BY", "Arena"],
    ["3D ANIMATION", "Procedural characters · custom IK rig"],
    ["CINEMATOGRAPHY", "React Three Fiber · Three.js"],
    ["EDITORIAL", "Deterministic timeline engine"],
    ["", ""],
    ["MADE WITH", "React · Vite · TypeScript · Drei · Web Audio API"],
    ["", ""],
    ["", "No monsters were shown in the making of this film."],
    ["", "Please answer responsibly."],
    ["", ""],
    ["", "THE LAST CALL"],
  ];
}

function Card({ shot, wrap }: { shot: CShot; wrap: RefObject<HTMLDivElement | null> }) {
  const c = shot.card!;
  const inner = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => (c.kind === "credits" ? creditsLines() : []), [c.kind]);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const w = wrap.current;
      if (w) {
        const p = Math.min(1, Math.max(0, (stage.t - shot.start) / shot.dur));
        const inT = c.kind === "credits" ? 2 : c.kind === "tag" ? 0.4 : 1.1;
        const outT = c.kind === "credits" ? 3 : c.kind === "tag" ? 0.4 : 1.1;
        const local = p * shot.dur;
        const o = Math.min(1, local / inT, (shot.dur - local) / outT);
        w.style.opacity = String(Math.max(0, o));
        if (c.kind === "credits" && inner.current) {
          const h = inner.current.offsetHeight;
          const vh = w.offsetHeight;
          inner.current.style.transform = `translateY(${vh - p * (h + vh)}px)`;
        }
        if (c.kind === "title") w.style.letterSpacing = `${0.18 + p * 0.06}em`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [shot, c.kind, wrap]);

  return (
    <div ref={wrap as RefObject<HTMLDivElement>} className={`card card-${c.kind}`}>
      {c.kind === "credits" ? (
        <div ref={inner} className="credits-roll">
          {lines.map(([a, b], i) => (
            <div key={i} className="credit-row">
              {a && <div className="credit-role">{a}</div>}
              {b && <div className={a ? "credit-name" : "credit-title"}>{b}</div>}
              {!a && !b && <div style={{ height: "2.2em" }} />}
            </div>
          ))}
        </div>
      ) : c.kind === "tag" ? (
        <div className="phone-insert">
          {c.text.split("\n").map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>
      ) : (
        <>
          <div className="card-main">{c.text}</div>
          {c.sub && <div className="card-sub">{c.sub}</div>}
        </>
      )}
    </div>
  );
}

/** Subtitles, title cards, fades, flashes and glitch — all driven from the stage clock. */
export function Overlays({ subs, shakeTarget }: { subs: boolean; shakeTarget: RefObject<HTMLDivElement | null> }) {
  const [shot, setShot] = useState<CShot | null>(null);
  const [active, setActive] = useState<CLine[]>([]);
  const fade = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const glitch = useRef<HTMLDivElement>(null);
  const thunder = useRef<HTMLDivElement>(null);
  const cardWrap = useRef<HTMLDivElement>(null);
  const idsRef = useRef("");

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const sh = stage.shot;
      setShot((o) => (o === sh ? o : sh));
      const t = stage.t;
      const act = sh ? sh.lines.filter((l) => t >= l.start && t < l.end + 0.15) : [];
      const ids = act.map((l) => l.id).join("|");
      if (ids !== idsRef.current) {
        idsRef.current = ids;
        setActive(act);
      }
      if (fade.current) fade.current.style.opacity = String(stage.fade);
      const f = vis("v:flash", 0.7);
      if (flash.current) flash.current.style.opacity = String(f * 0.9);
      const th = vis("v:thunder", 0.6);
      if (thunder.current) thunder.current.style.opacity = String(th * (Math.sin(t * 70) > -0.3 ? 0.35 : 0.08));
      const g = vis("v:glitch", 0.8);
      if (glitch.current) glitch.current.style.opacity = String(g);
      if (shakeTarget.current) {
        shakeTarget.current.style.transform = g > 0.05 ? `translate(${(Math.random() - 0.5) * 14 * g}px, ${(Math.random() - 0.5) * 6 * g}px)` : "";
        shakeTarget.current.style.filter = g > 0.05 ? `hue-rotate(${Math.random() * 40 * g}deg) contrast(${1 + g * 0.5})` : "";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [shakeTarget]);

  return (
    <>
      <div ref={thunder} className="fx fx-thunder" />
      <div ref={glitch} className="fx fx-glitch" />
      <div ref={fade} className="fx fx-fade" />
      {shot?.card && <Card key={shot.idx} shot={shot} wrap={cardWrap} />}
      <div ref={flash} className="fx fx-flash" />
      {subs && active.length > 0 && (
        <div className="subs">
          {active.slice(-2).map((l) => (
            <div key={l.id} className={`sub sub-${l.fx} ${l.w === "narrator" ? "sub-narr" : ""}`}>
              <span className="sub-who">{l.tag ?? NAMES[l.w] ?? ""}</span>
              <span className="sub-text">{l.text}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
