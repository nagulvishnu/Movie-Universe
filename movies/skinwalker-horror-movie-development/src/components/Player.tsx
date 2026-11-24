import { useCallback, useEffect, useRef, useState } from 'react';
import { Engine } from '../engine/engine';
import type { AudioEngine, AudioSettings } from '../engine/audio';
import { saveProgress, saveSettings } from '../engine/settings';
import { CREDITS_START, MOVIE, POST_START, cardsAt, fmt, subtitleAt } from '../movie';
import { universe } from '../movie-universe-bridge';
import type { Card, Line } from '../movie/types';

interface Props { audio: AudioEngine; settings: AudioSettings; setSettings: (s: AudioSettings) => void; startAt: number; onExit: () => void }

const PREFIX: Record<string, string> = { radio: '[Radio] ', phone: '[Phone] ', recording: '[Recording] ', whisper: '(whispering) ' };
const CREDITS: [string, string[]][] = [
  ['CAST', ['ADAM', 'LENA', 'NOAH', 'EMILY', 'THE SHOPKEEPER', 'THE HUNTER', 'THE THING IN THE WOODS']],
  ['A MOVIE UNIVERSE ORIGINAL', ['THE SKINWALKER']],
  ['STORY & DIRECTION', ['Written and staged for real-time 3D']],
  ['CAMERA & LIGHTING', ['Procedural cinematography', 'Handheld simulation', 'Flashlight & storm lighting']],
  ['SOUND', ['Procedural score & sound design', 'Web Audio API', 'Dialogue via recorded files or browser speech synthesis']],
  ['TECHNOLOGY', ['React', 'Three.js', 'Vite', 'TypeScript']],
  ['SPECIAL THANKS', ['Everyone who has ever turned around', 'because someone called their name']],
];

export default function Player({ audio, settings, setSettings, startAt, onExit }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const tRef = useRef(startAt);
  const playingRef = useRef(true);
  const lastMove = useRef(Date.now());
  const fadeRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLDivElement>(null);
  const subsOn = useRef(settings.subtitles);
  const draggingRef = useRef(false);

  const [playing, setPlaying] = useState(true);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(startAt);
  const [sub, setSub] = useState<Line | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [ui, setUi] = useState(true);
  const [full, setFull] = useState(false);
  const [bar, setBar] = useState(0);
  const [sceneId, setSceneId] = useState('');
  const [flash, setFlash] = useState(false);
  subsOn.current = settings.subtitles;

  const seekTo = useCallback((t: number) => {
    tRef.current = Math.max(0, Math.min(MOVIE.total - 0.05, t));
    engineRef.current?.seek(); audio.stopSpeech(); setEnded(false); setTime(tRef.current);
  }, [audio]);

  const setPlay = useCallback((p: boolean) => {
    playingRef.current = p; setPlaying(p);
    if (p) audio.resume(); else audio.suspend();
  }, [audio]);

  useEffect(() => { (window as unknown as { __skin: unknown }).__skin = { seekTo, setPlay, total: MOVIE.total, starts: MOVIE.scenes.map((s) => [s.id, s.start]), step: (t: number) => { tRef.current = t; } }; }, [seekTo, setPlay]);

  // engine + loop
  useEffect(() => {
    const canvas = canvasRef.current!, wrap = wrapRef.current!;
    const engine = new Engine(canvas, MOVIE, audio);
    engine.setQuality(settings.quality);
    engineRef.current = engine; engine.seek();
    universe.ready();
    audio.init(); audio.resume();
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth, h = wrap.clientHeight; engine.resize(w, h); setBar(Math.max(0, (h - w / 2.39) / 2));
    });
    ro.observe(wrap);
    let raf = 0, last = performance.now(), clock = 0, lastUi = 0, lastSave = 0, lastSub = '', lastCards = '', lastScene = '', lastFlash = false;
    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, Math.max(0, (ms - last) / 1000)); last = ms;
      const playingNow = playingRef.current;
      if (playingNow) {
        tRef.current += dt; clock += dt;
        universe.progress(tRef.current, MOVIE.total);
        if (tRef.current >= MOVIE.total - 0.03) {
          universe.ended();
          tRef.current = MOVIE.total - 0.03; playingRef.current = false; setPlaying(false); setEnded(true); audio.reset(); saveProgress(0);
        }
      }
      const t = tRef.current;
      try { engine.step(t, playingNow ? dt : 0, playingNow, clock); } catch (e) { console.error(e); }
      if (fadeRef.current) fadeRef.current.style.opacity = String(engine.fade);
      if (progRef.current) progRef.current.style.width = `${(t / MOVIE.total) * 100}%`;
      const s = subtitleAt(t); const sk = s?.id ?? '';
      if (sk !== lastSub) { lastSub = sk; setSub(s); }
      const cs = cardsAt(t); const ck = cs.map((c) => c.text + c.t).join('|');
      if (ck !== lastCards) { lastCards = ck; setCards(cs); }
      const sid = engine.def?.id ?? '';
      if (sid !== lastScene) { lastScene = sid; setSceneId(sid); }
      const fl = engine.def?.opts?.grade === 'flashback';
      if (fl !== lastFlash) { lastFlash = fl; setFlash(fl); }
      if (creditsRef.current) {
        const c0 = CREDITS_START, p = Math.max(0, t - c0) / 40;
        creditsRef.current.style.transform = `translateY(${100 - p * 190}%)`;
      }
      if (ms - lastUi > 200) { lastUi = ms; setTime(t); if (!draggingRef.current) { /* noop */ } }
      if (playingNow && ms - lastSave > 3000) { lastSave = ms; saveProgress(t); }
      if (Date.now() - lastMove.current > 3200 && playingRef.current) setUi(false);
    };
    raf = requestAnimationFrame(loop);
    const onVis = () => { if (document.hidden && playingRef.current) { playingRef.current = false; setPlaying(false); audio.suspend(); } };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
      saveProgress(tRef.current >= MOVIE.total - 1 ? 0 : tRef.current);
      engine.dispose(); audio.reset(); audio.resume();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // interaction / keyboard / fullscreen
  useEffect(() => {
    const wake = () => { lastMove.current = Date.now(); setUi(true); };
    const key = (e: KeyboardEvent) => {
      wake();
      if (e.code === 'Space') { e.preventDefault(); if (ended) { seekTo(0); setPlay(true); } else setPlay(!playingRef.current); }
      else if (e.key === 'ArrowRight') seekTo(tRef.current + 10);
      else if (e.key === 'ArrowLeft') seekTo(tRef.current - 10);
      else if (e.key.toLowerCase() === 'f') toggleFull();
      else if (e.key.toLowerCase() === 'm') toggleMute();
      else if (e.key.toLowerCase() === 'c') toggleSubs();
      else if (e.key === 'Escape' && !document.fullscreenElement) onExit();
    };
    const fs = () => setFull(!!document.fullscreenElement);
    window.addEventListener('keydown', key); document.addEventListener('fullscreenchange', fs);
    return () => { window.removeEventListener('keydown', key); document.removeEventListener('fullscreenchange', fs); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended, settings]);

  const patch = (p: Partial<AudioSettings>) => {
    const s = { ...settings, ...p }; audio.settings = s; audio.applyVolumes(); setSettings(s); saveSettings(s);
  };
  const toggleMute = () => patch({ muted: !audio.settings.muted });
  const toggleSubs = () => patch({ subtitles: !audio.settings.subtitles });
  const toggleFull = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void wrapRef.current?.requestFullscreen?.(); };

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seekTo(((e.clientX - r.left) / r.width) * MOVIE.total);
  };

  const subText = sub ? (PREFIX[sub.fx ?? ''] ?? '') + sub.text : '';
  const italic = !!sub && (!sub.who || !!sub.fx);
  const inCredits = sceneId === 'credits';

  return (
    <div ref={wrapRef} className={`player ${ui || !playing ? 'ui' : 'noui'}`} style={{ ['--bar' as string]: `${bar}px` }}
      onMouseMove={() => { lastMove.current = Date.now(); setUi(true); }} onTouchStart={() => { lastMove.current = Date.now(); setUi(true); }}
      onDoubleClick={toggleFull}>
      <canvas ref={canvasRef} className={`stage ${flash ? 'flashback' : ''}`} onClick={() => (ended ? undefined : setPlay(!playingRef.current))} />
      <div className="vignette" /><div className="grain" />
      <div ref={fadeRef} className="fade" />
      <div className="letter top" /><div className="letter bottom" />

      {inCredits && (
        <div className="credits"><div ref={creditsRef} className="credits-roll">
          <h1>THE SKINWALKER</h1>
          {CREDITS.map(([h, items]) => (<section key={h}><h3>{h}</h3>{items.map((i) => <p key={i}>{i}</p>)}</section>))}
        </div></div>
      )}

      {cards.filter((c) => c.style !== 'credits').map((c) => (
        <div key={c.text + c.t} className={`card card-${c.style}`} style={{ ['--d' as string]: `${c.d}s` }}>
          <span>{c.text}</span>{c.sub && <small>{c.sub}</small>}
        </div>
      ))}

      {settings.subtitles && subText && <div className={`subs ${italic ? 'italic' : ''}`} style={{ bottom: `calc(var(--bar) + 26px)` }}><span key={sub?.id}>{subText}</span></div>}

      {!playing && !ended && (
        <div className="pause-overlay" onClick={() => setPlay(true)}>
          <div className="pause-box"><div className="pause-title">PAUSED</div><div className="pause-sub">{fmt(time)} / {fmt(MOVIE.total)}</div></div>
        </div>
      )}
      {ended && (
        <div className="end-overlay">
          <h2>THE END</h2><p>Thank you for watching.</p>
          <div className="row"><button className="btn" onClick={() => { seekTo(0); setPlay(true); }}>Watch again</button><button className="btn ghost" onClick={onExit}>Main menu</button></div>
        </div>
      )}
      {inCredits && ui && !ended && <button className="skip" onClick={() => seekTo(POST_START)}>Skip credits ›</button>}

      <div className="controls" style={{ bottom: `calc(var(--bar) + 10px)` }}>
        <div className="scrub" onPointerDown={(e) => { draggingRef.current = true; e.currentTarget.setPointerCapture(e.pointerId); scrub(e); }}
          onPointerMove={(e) => { if (draggingRef.current) scrub(e); }} onPointerUp={() => { draggingRef.current = false; }}>
          <div className="scrub-track"><div ref={progRef} className="scrub-fill" /></div>
        </div>
        <div className="ctl-row">
          <button className="ic" title="Play / Pause (Space)" onClick={() => (ended ? (seekTo(0), setPlay(true)) : setPlay(!playing))}>{playing ? '❚❚' : '▶'}</button>
          <button className="ic" title="Back 10s (←)" onClick={() => seekTo(tRef.current - 10)}>↺10</button>
          <button className="ic" title="Forward 10s (→)" onClick={() => seekTo(tRef.current + 10)}>10↻</button>
          <button className="ic" title="Restart movie" onClick={() => { seekTo(0); setPlay(true); }}>⏮</button>
          <span className="time">{fmt(time)} / {fmt(MOVIE.total)}</span>
          <span className="grow" />
          <button className="ic" title="Mute (M)" onClick={toggleMute}>{settings.muted || settings.master === 0 ? '🔇' : '🔊'}</button>
          <input className="vol" type="range" min={0} max={1} step={0.02} value={settings.muted ? 0 : settings.master} onChange={(e) => patch({ master: Number(e.target.value), muted: false })} />
          <button className={`ic cc ${settings.subtitles ? 'on' : ''}`} title="Subtitles (C)" onClick={toggleSubs}>CC</button>
          <button className="ic" title="Fullscreen (F)" onClick={toggleFull}>{full ? '🗗' : '⛶'}</button>
          <button className="ic" title="Main menu (Esc)" onClick={onExit}>✕</button>
        </div>
      </div>
    </div>
  );
}
