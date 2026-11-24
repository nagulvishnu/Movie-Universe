import { engine } from '../film/engine';
import { formatTime, TOTAL_DURATION } from '../film/timeline';
import { useFilm } from '../film/useEngine';
import { PlayIcon, ReplayIcon } from './icons';

export function StartScreen() {
  const f = useFilm();
  if (f.started) return null;
  const canResume = f.savedT > 10 && !f.ended;
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 text-center" style={{ background: 'radial-gradient(ellipse at 50% 38%, #3a2208 0%, #120a04 55%, #000 100%)' }}>
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(90deg, transparent 0 78px, rgba(217,164,65,.07) 78px 80px)' }} />
      <div className="relative">
        <div className="mb-5 flex items-center justify-center gap-3 text-[#d9a441]"><span className="h-px w-20 bg-[#d9a441]/60" /><span className="text-2xl">☥</span><span className="h-px w-20 bg-[#d9a441]/60" /></div>
        <h1 className="title-font text-[clamp(2rem,7vw,5.6rem)] font-semibold leading-[1.05] tracking-[0.12em] text-[#f6dca0]" style={{ textShadow: '0 0 50px rgba(255,160,30,.5)' }}>THE GODS<br />OF ANCIENT EGYPT</h1>
        <p className="mx-auto mt-6 max-w-xl text-[clamp(.9rem,1.7vw,1.3rem)] italic text-[#e0cba0]">“Before the pharaohs, before the pyramids, the gods shaped the world.”</p>
        <p className="mt-3 text-xs uppercase tracking-[0.4em] text-white/45">A 3D animated mythology film · {formatTime(TOTAL_DURATION)}</p>
        <div className="mt-10 flex min-h-[64px] flex-col items-center justify-center gap-3 sm:flex-row">
          {f.ready ? (
            <>
              <button onClick={() => engine.begin(false)} className="group flex items-center gap-3 rounded-full bg-gradient-to-b from-[#f2c25a] to-[#b8791f] px-9 py-4 text-lg font-semibold tracking-widest text-black shadow-[0_0_40px_rgba(242,194,90,.35)] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                {f.ended ? <ReplayIcon /> : <PlayIcon size={26} />} {f.ended ? 'WATCH AGAIN' : 'PLAY FILM'}
              </button>
              {canResume && <button onClick={() => engine.begin(true)} className="rounded-full border border-[#d9a441]/60 px-7 py-4 text-sm tracking-widest text-[#f6dca0] transition hover:bg-[#d9a441]/15">RESUME AT {formatTime(f.savedT)}</button>}
            </>
          ) : (
            <div className="flex items-center gap-3 text-[#e8d4a8]"><div className="h-7 w-7 animate-spin rounded-full border-4 border-[#d9a441]/30 border-t-[#d9a441]" /><span className="text-sm tracking-[0.3em]">PREPARING THE FILM…</span></div>
          )}
        </div>
        <p className="mx-auto mt-10 max-w-lg text-xs leading-relaxed text-white/40">Best experienced full-screen with sound on. Narration uses your device’s speech synthesis voice; captions are available throughout. Space: play/pause · ← → : seek · M: mute · C: captions · F: fullscreen</p>
      </div>
    </div>
  );
}
