import { useMemo, useState } from 'react';
import type { Snapshot } from '../engine/director';
import { SCENES, SCENE_STARTS, TOTAL_DURATION } from '../story/screenplay';
import type { Settings } from '../data/playbackProgress';
import AudioControls from './AudioControls';

const I = {
  play: <svg viewBox="0 0 24 24"><path className="f" d="M7 4.5v15l12-7.5z" /></svg>,
  pause: <svg viewBox="0 0 24 24"><path className="f" d="M6 4.5h4v15H6zM14 4.5h4v15h-4z" /></svg>,
  back: <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><text x="8.2" y="15.5" fontSize="7.5" fill="currentColor" stroke="none">10</text></svg>,
  fwd: <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /><text x="8.2" y="15.5" fontSize="7.5" fill="currentColor" stroke="none">10</text></svg>,
  prev: <svg viewBox="0 0 24 24"><path d="M6 5v14" /><path className="f" d="M19 5v14L8 12z" /></svg>,
  next: <svg viewBox="0 0 24 24"><path d="M18 5v14" /><path className="f" d="M5 5v14l11-7z" /></svg>,
  restart: <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.5-5.8" /><path d="M4 4v5h5" /></svg>,
  cc: <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 10.5a2 2 0 1 0 0 3M17 10.5a2 2 0 1 0 0 3" /></svg>,
  vol: <svg viewBox="0 0 24 24"><path className="f" d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /></svg>,
  full: <svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>,
  exit: <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>,
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

interface Props {
  snap: Snapshot; visible: boolean; settings: Settings; onSettings: (p: Partial<Settings>) => void;
  onToggle: () => void; onSkip: (d: number) => void; onPrev: () => void; onNext: () => void; onRestart: () => void;
  onSeek: (frac: number) => void; onFullscreen: () => void; onExit: () => void;
}

export default function CinematicHUD({ snap, visible, settings, onSettings, onToggle, onSkip, onPrev, onNext, onRestart, onSeek, onFullscreen, onExit }: Props) {
  const [vol, setVol] = useState(false);
  const marks = useMemo(() => SCENES.map((s, i) => ({ act: s.act, i })).filter((m, k, a) => k > 0 && m.act !== a[k - 1].act && m.act <= 5).map((m) => SCENE_STARTS[m.i] / TOTAL_DURATION), []);
  const frac = snap.global / snap.total;
  const show = visible || !snap.playing;
  return (
    <>
      <div className={`hud-top ${show ? '' : 'off'}`}>
        <div>
          <div className="serif" style={{ letterSpacing: '.35em', fontSize: 16, fontWeight: 700 }}>TWO SURVIVORS</div>
          <div style={{ fontSize: 11, letterSpacing: '.22em', opacity: 0.6, marginTop: 4 }}>{snap.scene.act <= 5 ? `ACT ${snap.scene.act}  ·  ` : ''}{snap.scene.name.toUpperCase()}</div>
        </div>
        <button className="btn-i" title="Exit movie" aria-label="Exit movie" onClick={onExit}>{I.exit}</button>
      </div>
      <div className={`hud ${show ? '' : 'off'}`} onClick={(e) => e.stopPropagation()}>
        <div className="progress" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onSeek((e.clientX - r.left) / r.width); }}>
          <div className="bar">
            <div className="fill" style={{ width: `${frac * 100}%` }} />
            {marks.map((m, i) => <div key={i} className="mark" style={{ left: `${m * 100}%` }} />)}
            <div className="knob" style={{ left: `${frac * 100}%` }} />
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <button className="btn-i" title="Play / Pause (Space)" aria-label="Play or pause" onClick={onToggle}>{snap.playing ? I.pause : I.play}</button>
          <button className="btn-i" title="Previous scene" aria-label="Previous scene" onClick={onPrev}>{I.prev}</button>
          <button className="btn-i" title="Back 10 seconds (←)" aria-label="Skip backward" onClick={() => onSkip(-10)}>{I.back}</button>
          <button className="btn-i" title="Forward 10 seconds (→)" aria-label="Skip forward" onClick={() => onSkip(10)}>{I.fwd}</button>
          <button className="btn-i" title="Next scene" aria-label="Skip scene" onClick={onNext}>{I.next}</button>
          <span className="ml-3 text-xs tracking-widest text-white/70">{fmt(snap.global)} / {fmt(snap.total)}</span>
          <div className="flex-1" />
          <button className="btn-i" title="Restart movie" aria-label="Restart movie" onClick={onRestart}>{I.restart}</button>
          <button className={`btn-i ${settings.subtitles ? 'active' : ''}`} title="Subtitles (C)" aria-label="Toggle subtitles" onClick={() => onSettings({ subtitles: !settings.subtitles })}>{I.cc}</button>
          <button className={`btn-i ${vol ? 'active' : ''}`} title="Volume" aria-label="Volume settings" onClick={() => setVol(!vol)}>{I.vol}</button>
          <button className="btn-i" title="Fullscreen (F)" aria-label="Fullscreen" onClick={onFullscreen}>{I.full}</button>
        </div>
        {vol && show && (
          <div className="vol-pop" onClick={(e) => e.stopPropagation()}>
            <AudioControls settings={settings} onChange={onSettings} />
          </div>
        )}
      </div>
    </>
  );
}
