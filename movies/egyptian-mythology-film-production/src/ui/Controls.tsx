import { useCallback, useRef, useState } from 'react';
import { CHAPTERS } from '../film/chapters';
import { engine } from '../film/engine';
import { chapterStarts, formatTime, TOTAL_DURATION } from '../film/timeline';
import { useFilm } from '../film/useEngine';
import { Back15, CCIcon, Fwd15, FullIcon, GearIcon, ListIcon, PauseIcon, PlayIcon, VolIcon } from './icons';

interface Props { visible: boolean; fullscreen: boolean; onFullscreen: () => void; onPanel: (p: 'chapters' | 'settings' | null) => void; panel: string | null }

export function Controls({ visible, fullscreen, onFullscreen, onPanel, panel }: Props) {
  const f = useFilm();
  const bar = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);
  const shown = drag ?? f.t;
  const pct = (shown / TOTAL_DURATION) * 100;

  const timeAt = useCallback((clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * TOTAL_DURATION;
  }, []);
  const chapterAt = (t: number) => { let c = 0; chapterStarts.forEach((s, i) => { if (s <= t) c = i; }); return c; };
  const btn = 'flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-[#f6dca0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d9a441]';

  return (
    <div className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-3 pt-14 transition-opacity duration-300 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={(e) => e.stopPropagation()}>
      {/* Timeline */}
      <div
        ref={bar}
        className="group relative mb-2 flex h-5 cursor-pointer items-center"
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); setDrag(timeAt(e.clientX)); }}
        onPointerMove={(e) => { const t = timeAt(e.clientX); setHover({ x: e.clientX - bar.current!.getBoundingClientRect().left, t }); if (drag !== null) setDrag(t); }}
        onPointerUp={(e) => { if (drag !== null) { engine.seek(timeAt(e.clientX)); setDrag(null); } }}
        onPointerLeave={() => setHover(null)}
        role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={Math.round(TOTAL_DURATION)} aria-valuenow={Math.round(shown)}
      >
        <div className="relative h-1 w-full rounded bg-white/25 transition-all group-hover:h-1.5">
          <div className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-[#b8791f] to-[#f2c25a]" style={{ width: `${pct}%` }} />
          {chapterStarts.slice(1).map((s, i) => <span key={i} className="absolute top-0 h-full w-[2px] bg-black/70" style={{ left: `${(s / TOTAL_DURATION) * 100}%` }} />)}
          <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f6dca0] opacity-0 shadow transition group-hover:opacity-100" style={{ left: `${pct}%` }} />
        </div>
        {hover && (
          <div className="pointer-events-none absolute bottom-6 -translate-x-1/2 whitespace-nowrap rounded bg-black/85 px-2.5 py-1 text-xs text-white" style={{ left: Math.max(60, Math.min(hover.x, (bar.current?.clientWidth ?? 0) - 60)) }}>
            <span className="text-[#f6dca0]">{formatTime(hover.t)}</span> · {CHAPTERS[chapterAt(hover.t)].title}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 text-white">
        <button className={btn} onClick={() => engine.toggle()} aria-label={f.playing ? 'Pause' : 'Play'}>{f.playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}</button>
        <button className={btn} onClick={() => engine.seek(f.t - 15)} aria-label="Back 15 seconds"><Back15 /></button>
        <button className={btn} onClick={() => engine.seek(f.t + 15)} aria-label="Forward 15 seconds"><Fwd15 /></button>
        <div className="group/vol flex items-center">
          <button className={btn} onClick={() => engine.setPrefs({ muted: !f.muted })} aria-label={f.muted ? 'Unmute' : 'Mute'}><VolIcon level={f.muted ? 0 : f.volume} /></button>
          <input type="range" min={0} max={1} step={0.02} value={f.muted ? 0 : f.volume} aria-label="Volume"
            onChange={(e) => engine.setPrefs({ volume: +e.target.value, muted: +e.target.value === 0 })}
            className="vol h-1 w-0 cursor-pointer accent-[#d9a441] opacity-0 transition-all group-hover/vol:w-24 group-hover/vol:opacity-100 focus:w-24 focus:opacity-100" />
        </div>
        <span className="ml-2 select-none text-sm tabular-nums text-white/90">{formatTime(shown)} <span className="text-white/50">/ {formatTime(TOTAL_DURATION)}</span></span>
        <div className="mx-4 hidden min-w-0 flex-1 truncate text-center text-sm tracking-wide text-[#e8d4a8] md:block">
          <span className="text-[#d9a441]">{CHAPTERS[f.chapter].num}</span> {CHAPTERS[f.chapter].num && '—'} {CHAPTERS[f.chapter].title}
        </div>
        <div className="flex-1 md:hidden" />
        <button className={btn} onClick={() => engine.setPrefs({ captions: !f.captions })} aria-label="Toggle subtitles" aria-pressed={f.captions}><CCIcon on={f.captions} /></button>
        <button className={`${btn} ${panel === 'chapters' ? 'bg-white/15' : ''}`} onClick={() => onPanel(panel === 'chapters' ? null : 'chapters')} aria-label="Chapters"><ListIcon /></button>
        <button className={`${btn} ${panel === 'settings' ? 'bg-white/15' : ''}`} onClick={() => onPanel(panel === 'settings' ? null : 'settings')} aria-label="Settings"><GearIcon /></button>
        <button className={btn} onClick={onFullscreen} aria-label="Fullscreen"><FullIcon exit={fullscreen} /></button>
      </div>
    </div>
  );
}
