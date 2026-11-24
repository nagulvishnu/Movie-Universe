import { useEffect, useRef } from 'react';
import { engine } from '../film/engine';
import { clock } from '../film/clock';
import { TLINES, TSCENES } from '../film/timeline';
import { SOURCES } from '../narration';
import { useFilm } from '../film/useEngine';
import { CHAPTERS } from '../film/chapters';

/** Black fades between scenes and white flashes for divine events. Driven by rAF + refs (no React re-renders). */
export function FadeLayer() {
  const black = useRef<HTMLDivElement>(null), white = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let id = 0;
    const loop = () => { id = requestAnimationFrame(loop); if (black.current) black.current.style.opacity = String(engine.fade); if (white.current) white.current.style.opacity = String(engine.flash); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
  return (<>
    <div ref={white} className="pointer-events-none absolute inset-0 z-10 bg-[#fff6dc]" style={{ opacity: 0 }} />
    <div ref={black} className="pointer-events-none absolute inset-0 z-10 bg-black" style={{ opacity: 1 }} />
  </>);
}

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Chapter title cards and the main title. */
export function TitleLayer() {
  const { sceneIdx } = useFilm();
  const def = TSCENES[sceneIdx]?.def;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let id = 0;
    const loop = () => {
      id = requestAnimationFrame(loop);
      const el = ref.current; if (!el) return;
      const t = clock.sceneTime;
      const a = def?.title ? (def.id === 'ti-1' ? smooth(3.5, 6, t) * (1 - smooth(clock.sceneDur - 4, clock.sceneDur - 1.2, t)) : smooth(1, 3, t) * (1 - smooth(clock.sceneDur - 3, clock.sceneDur - 0.8, t)))
        : def?.card ? smooth(1.2, 2.6, t) * (1 - smooth(6.8, 8.6, t)) : 0;
      el.style.opacity = String(a);
      el.style.transform = `translateY(${(1 - a) * 8}px) scale(${1 + (1 - a) * 0.02})`;
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [def]);
  if (!def || (!def.title && !def.card)) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[12] flex items-center justify-center text-center">
      <div ref={ref} style={{ opacity: 0 }} className="px-6">
        {def.title ? (
          <>
            <div className="mb-5 flex items-center justify-center gap-3 text-[#d9a441]"><span className="h-px w-16 bg-[#d9a441]/70" /><span className="text-xl">☥</span><span className="h-px w-16 bg-[#d9a441]/70" /></div>
            <h1 className="title-font text-[clamp(1.8rem,6.2vw,5.2rem)] font-semibold leading-tight tracking-[0.12em] text-[#f6dca0]" style={{ textShadow: '0 0 40px rgba(255,170,40,.55), 0 2px 12px #000' }}>THE GODS<br />OF ANCIENT EGYPT</h1>
            {def.id === 'ti-1' && <p className="mt-6 text-[clamp(.9rem,1.7vw,1.4rem)] italic tracking-wide text-[#e8d4a8]" style={{ textShadow: '0 2px 10px #000' }}>“Before the pharaohs, before the pyramids, the gods shaped the world.”</p>}
          </>
        ) : (
          <>
            <div className="title-font text-[clamp(.75rem,1.3vw,1.05rem)] uppercase tracking-[0.5em] text-[#d9a441]">{def.card!.kicker}</div>
            <div className="mx-auto my-4 h-px w-40 bg-gradient-to-r from-transparent via-[#d9a441] to-transparent" />
            <h2 className="title-font text-[clamp(1.5rem,4.2vw,3.6rem)] font-semibold tracking-[0.08em] text-[#f6e6bd]" style={{ textShadow: '0 0 30px rgba(255,170,40,.4), 0 2px 12px #000' }}>{def.card!.title}</h2>
            {def.card!.sub && <p className="mt-3 text-[clamp(.8rem,1.4vw,1.1rem)] italic text-[#d8c598]">{def.card!.sub}</p>}
          </>
        )}
      </div>
    </div>
  );
}

/** English captions synchronised with the current narration line. */
export function Captions() {
  const { lineIdx, captions, sceneIdx } = useFilm();
  const sc = TSCENES[sceneIdx];
  if (!captions || lineIdx < 0 || sc?.def.title) return null;
  const line = TLINES[lineIdx];
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[84px] z-20 flex justify-center px-4">
      <p key={lineIdx} className="caption max-w-[min(900px,92%)] rounded-md bg-black/60 px-5 py-2.5 text-center text-[clamp(.85rem,1.65vw,1.35rem)] leading-snug text-white" style={{ textShadow: '0 1px 4px #000' }}>{line.text}</p>
    </div>
  );
}

export function Buffering() {
  const { buffering, started, ready } = useFilm();
  if (!(buffering || (started && !ready))) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-black/55 px-8 py-6 backdrop-blur-sm">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9a441]/30 border-t-[#d9a441]" />
        <span className="text-sm tracking-widest text-[#e8d4a8]">LOADING SCENE…</span>
      </div>
    </div>
  );
}

/** Scrolling end credits, positioned by film progress. */
export function Credits() {
  const { sceneIdx } = useFilm();
  const on = !!TSCENES[sceneIdx]?.def.credits;
  const box = useRef<HTMLDivElement>(null), inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!on) return;
    let id = 0;
    const loop = () => {
      id = requestAnimationFrame(loop);
      if (!box.current || !inner.current) return;
      const H = box.current.clientHeight, h = inner.current.scrollHeight;
      const p = Math.min(1, Math.max(0, (clock.sceneTime - 3) / (clock.sceneDur - 8)));
      inner.current.style.transform = `translateY(${H - p * (H + h)}px)`;
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [on]);
  if (!on) return null;
  const H = (t: string) => <h3 className="title-font mt-16 mb-4 text-[clamp(.8rem,1.4vw,1.1rem)] uppercase tracking-[0.4em] text-[#d9a441]">{t}</h3>;
  return (
    <div ref={box} className="pointer-events-none absolute inset-0 z-[12] overflow-hidden bg-black/45">
      <div ref={inner} className="mx-auto max-w-3xl px-6 text-center text-[#eadbb8]" style={{ transform: 'translateY(100vh)' }}>
        <h1 className="title-font text-[clamp(1.6rem,4.5vw,3.6rem)] tracking-[0.12em] text-[#f6dca0]">THE GODS OF ANCIENT EGYPT</h1>
        <p className="mt-3 italic">A narrated mythology film</p>
        {H('The Chapters')}
        {CHAPTERS.filter((c) => c.num).map((c) => <p key={c.key} className="my-1 text-[clamp(.85rem,1.4vw,1.1rem)]"><span className="text-[#d9a441]">{c.num}</span> — {c.title}</p>)}
        {H('Sources Consulted')}
        <p className="mb-4 text-sm italic opacity-80">The narration draws on the following texts and scholarship. Where surviving sources disagree, the film says so.</p>
        {SOURCES.map((s) => <p key={s} className="my-2 text-[clamp(.8rem,1.25vw,1rem)] leading-snug">{s}</p>)}
        {H('A Note on Accuracy')}
        <p className="mx-auto max-w-xl text-sm leading-relaxed opacity-90">Egyptian religion spanned some three thousand years and many regional traditions. No single ancient text tells every myth in full, and several tales survive only in late or Greek-language sources. This film presents the traditions as they are attested and does not claim them to be uniform or universal.</p>
        {H('Production')}
        <p className="my-2">Real-time 3D animation rendered in your browser with Three.js and React Three Fiber.</p>
        <p className="my-2">Original score and sound effects, synthesised live with the Web Audio API.</p>
        <p className="my-2">Narration is spoken by your device’s built-in speech synthesis voice — it is not a recorded human performance.</p>
        {H('')}
        <p className="title-font mb-24 text-[clamp(1rem,2vw,1.6rem)] tracking-[0.2em] text-[#f6dca0]">Thank you for watching</p>
      </div>
    </div>
  );
}
