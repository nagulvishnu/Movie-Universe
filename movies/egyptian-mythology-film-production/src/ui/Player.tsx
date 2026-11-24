import { useCallback, useEffect, useRef, useState } from 'react';
import { engine } from '../film/engine';
import { useFilm } from '../film/useEngine';
import { FilmCanvas } from '../render/FilmCanvas';
import { Controls } from './Controls';
import { Buffering, Captions, Credits, FadeLayer, TitleLayer } from './Overlays';
import { ChapterPanel, SettingsPanel } from './Panels';
import { StartScreen } from './StartScreen';

/** The cinematic film player: 3D canvas, overlays and a streaming-style control bar. */
export function Player() {
  const root = useRef<HTMLDivElement>(null);
  const f = useFilm();
  const [ui, setUi] = useState(true);
  const [panel, setPanel] = useState<'chapters' | 'settings' | null>(null);
  const [full, setFull] = useState(false);
  const hideTimer = useRef(0);

  const wake = useCallback(() => {
    setUi(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setUi(false), 3200);
  }, []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'SELECT') return;
      const s = engine.getSnapshot();
      if (!s.started && e.code !== 'Space') return;
      switch (e.code) {
        case 'Space': e.preventDefault(); if (s.started) engine.toggle(); else if (s.ready) engine.begin(false); break;
        case 'ArrowRight': engine.seek(engine.t + 15); break;
        case 'ArrowLeft': engine.seek(engine.t - 15); break;
        case 'KeyM': engine.setPrefs({ muted: !s.muted }); break;
        case 'KeyC': engine.setPrefs({ captions: !s.captions }); break;
        case 'KeyF': toggleFull(); break;
        case 'Escape': setPanel(null); break;
        default: return;
      }
      wake();
    };
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('fullscreenchange', onFs); window.removeEventListener('keydown', onKey); };
  }, [toggleFull, wake]);

  useEffect(() => { if (!f.playing) { setUi(true); clearTimeout(hideTimer.current); } else wake(); }, [f.playing, wake]);
  // Pause automatically if the tab is hidden so narration and music never run unseen.
  useEffect(() => { const v = () => { if (document.hidden) engine.pause(); }; document.addEventListener('visibilitychange', v); return () => document.removeEventListener('visibilitychange', v); }, []);

  return (
    <div ref={root} className="relative h-screen w-screen select-none overflow-hidden bg-black" style={{ cursor: ui || !f.playing ? 'default' : 'none' }} onMouseMove={wake} onTouchStart={wake}
      onClick={() => { if (panel) setPanel(null); else if (f.started) engine.toggle(); }}>
      <FilmCanvas />
      <FadeLayer />
      <Credits />
      <TitleLayer />
      <Captions />
      <Buffering />
      {f.started && !f.playing && !f.buffering && (
        <div className="pointer-events-none absolute inset-0 z-[22] flex items-center justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/55 text-[#f6dca0] ring-2 ring-[#d9a441]/60 backdrop-blur-sm"><svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div></div>
      )}
      {f.started && <Controls visible={ui || !f.playing || !!panel} fullscreen={full} onFullscreen={toggleFull} onPanel={setPanel} panel={panel} />}
      {panel === 'chapters' && <ChapterPanel onClose={() => setPanel(null)} />}
      {panel === 'settings' && <SettingsPanel onClose={() => setPanel(null)} />}
      <StartScreen />
    </div>
  );
}
