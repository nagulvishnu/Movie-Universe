import { useCallback, useEffect, useRef, useState } from 'react';
import { Director, type Snapshot } from '../engine/director';
import { audio } from '../engine/audio';
import { INTRO_END_INDEX, SCENE_STARTS, SCENES, TOTAL_DURATION, locate } from '../story/screenplay';
import { clearProgress, saveProgress, type Settings } from '../data/playbackProgress';
import { universe } from '../movie-universe-bridge';
import SubtitleSystem from './SubtitleSystem';
import CinematicHUD from './CinematicHUD';
import MovieCredits from './MovieCredits';

const ASPECT = 2.2;

interface Props { startIndex: number; startTime?: number; settings: Settings; onSettings: (p: Partial<Settings>) => void; onExit: () => void }

export default function MoviePlayer({ startIndex, startTime = 0, settings, onSettings, onExit }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const dirRef = useRef<Director | null>(null);
  const lastSave = useRef(0);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [box, setBox] = useState({ w: 1280, h: 580, l: 0, t: 0 });
  const [hudOn, setHudOn] = useState(true);
  const [endUi, setEndUi] = useState(false);
  const hideTimer = useRef<number>(0);
  const endTimer = useRef<number>(0);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // create the director + canvas
  useEffect(() => {
    const frame = frameRef.current!;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    frame.insertBefore(canvas, frame.firstChild);
      const d = new Director(canvas, (s) => {
      setSnap(s);
      if (s.playing) universe.progress(s.global, s.total);
      const now = performance.now();
      if (now - lastSave.current > 2000 && s.playing) { lastSave.current = now; if (s.scene.overlay === 'credits' || s.scene.act > 5) clearProgress(); else saveProgress({ index: s.index, t: s.t, updated: Date.now() }); }
    }, () => { clearProgress(); universe.ended(); window.clearTimeout(endTimer.current); endTimer.current = window.setTimeout(() => setEndUi(true), 4500); });
    dirRef.current = d;
    (window as unknown as { __director?: Director; __scenes?: { id: string; dur: number }[] }).__director = d;
    (window as unknown as { __scenes?: { id: string; dur: number }[] }).__scenes = SCENES.map((s) => ({ id: s.id, dur: s.dur }));
    d.setFadeElement(fadeRef.current);
    d.setQuality(settingsRef.current.quality);
    const fit = () => {
      const root = rootRef.current!; const W = root.clientWidth, H = root.clientHeight;
      let w = W, h = W / ASPECT; if (h > H) { h = H; w = H * ASPECT; }
      w = Math.floor(w); h = Math.floor(h);
      setBox({ w, h, l: Math.floor((W - w) / 2), t: Math.floor((H - h) / 2) });
      requestAnimationFrame(() => d.resize(w, h));
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(rootRef.current!);
    const idx = Math.max(0, Math.min(SCENES.length - 1, startIndex));
    const sceneDur = SCENES[idx]?.dur ?? 0;
    d.start(idx, Math.max(0, Math.min(startTime, sceneDur - 0.1)));
    universe.ready();
    return () => { window.clearTimeout(endTimer.current); ro.disconnect(); d.dispose(); dirRef.current = null; canvas.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // settings -> audio / quality
  useEffect(() => {
    audio.setVolumes({ music: settings.music, dialogue: settings.dialogue, sfx: settings.sfx, muteMusic: settings.muteMusic, muteDialogue: settings.muteDialogue, muteSfx: settings.muteSfx });
    dirRef.current?.setQuality(settings.quality);
  }, [settings]);

  const poke = useCallback(() => {
    setHudOn(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setHudOn(false), 3200);
  }, []);
  useEffect(() => { poke(); return () => window.clearTimeout(hideTimer.current); }, [poke]);

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen(); else void rootRef.current?.requestFullscreen?.();
  }, []);
  const exit = useCallback(() => { if (document.fullscreenElement) void document.exitFullscreen(); onExit(); }, [onExit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = dirRef.current; if (!d) return;
      if (e.code === 'Space') { e.preventDefault(); d.toggle(); }
      else if (e.code === 'ArrowRight') d.skip(10);
      else if (e.code === 'ArrowLeft') d.skip(-10);
      else if (e.key === 'f' || e.key === 'F') fullscreen();
      else if (e.key === 'c' || e.key === 'C') onSettings({ subtitles: !settingsRef.current.subtitles });
      else if (e.key === 'm' || e.key === 'M') onSettings({ muteMusic: !settingsRef.current.muteMusic, muteSfx: !settingsRef.current.muteSfx, muteDialogue: !settingsRef.current.muteDialogue });
      poke();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, onSettings, poke]);

  const d = dirRef.current;
  const showHud = hudOn || !snap?.playing;
  const credits = snap?.scene.overlay === 'credits';
  const barH = box.t;
  const subBottom = Math.round(box.h * 0.075) + (showHud && barH < 90 ? 64 : 0);
  const isIntro = !!snap && snap.index < INTRO_END_INDEX && snap.t > 2.5 && snap.global > 3;

  return (
    <div ref={rootRef} className={`player ${!showHud && snap?.playing ? 'hide-cursor' : ''}`} onMouseMove={poke} onClick={() => d?.toggle()} onDoubleClick={fullscreen}>
      <div ref={frameRef} style={{ position: 'absolute', left: box.l, top: box.t, width: box.w, height: box.h, overflow: 'hidden', background: '#000' }}>
        <div className="vignette" style={{ inset: 0 }} />
        <div className="grain" style={{ inset: 0 }} />
        {snap?.cards.map(({ key, card }) => (
          <div key={key} className={`card card-${card.style ?? 'place'}`} style={{ ['--d' as string]: `${card.dur}s` }}>
            {card.style === 'terminal' ? (
              <div className="box"><div className="t">{card.text}</div>{card.sub && <div className="s">{card.sub}</div>}</div>
            ) : (
              <><div className="t">{card.text}</div>{card.sub && <div className="s">{card.sub}</div>}</>
            )}
          </div>
        ))}
        {credits && snap && <MovieCredits t={snap.t} dur={snap.scene.dur} />}
        <SubtitleSystem line={snap?.line ?? null} visible={settings.subtitles} bottom={subBottom} />
        <div ref={fadeRef} className="fade" />
      </div>
      {snap && (
        <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          {isIntro && showHud && <button className="skip-btn" onClick={() => d?.gotoScene(INTRO_END_INDEX)}>SKIP INTRO ▸▸</button>}
          <CinematicHUD
            snap={snap} visible={showHud} settings={settings} onSettings={onSettings}
            onToggle={() => d?.toggle()} onSkip={(s) => d?.skip(s)} onPrev={() => d?.prevScene()} onNext={() => d?.nextScene()} onRestart={() => { window.clearTimeout(endTimer.current); setEndUi(false); d?.restart(); }}
            onSeek={(f) => d?.seekGlobal(f * TOTAL_DURATION)} onFullscreen={fullscreen} onExit={exit}
          />
        </div>
      )}
      {snap && !snap.playing && !snap.ended && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-white/40 bg-black/40 px-10 py-5 text-sm tracking-[0.5em] text-white/90">PAUSED</div>
        </div>
      )}
      {endUi && (
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="panel text-center">
            <div className="serif" style={{ fontSize: 34, letterSpacing: '.4em', fontWeight: 700 }}>THE END</div>
            <p className="mt-3 text-xs tracking-[0.25em] text-white/60">THANK YOU FOR WATCHING</p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="btn-main" onClick={() => { window.clearTimeout(endTimer.current); setEndUi(false); d?.restart(); }}>WATCH AGAIN</button>
              <button className="btn-sec" onClick={exit}>RETURN TO TITLE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { SCENE_STARTS, locate };
