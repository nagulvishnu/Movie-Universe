import { useEffect, useMemo, useRef, useState } from 'react';
import { CREDITS, MOVIE } from '../data/movieConfig';
import type { Progress, Settings } from '../data/playbackProgress';
import { SCENES, SCENE_STARTS } from '../story/screenplay';
import AudioControls from './AudioControls';

function seeded(seed: number) { let s = seed; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function Skyline({ seed, color, base, hmin, hmax, opacity, dur, ruin }: { seed: number; color: string; base: number; hmin: number; hmax: number; opacity: number; dur: number; ruin: number }) {
  const shapes = useMemo(() => {
    const r = seeded(seed), out: string[] = []; let x = -40;
    while (x < 1700) {
      const w = 30 + r() * 70, h = hmin + r() * (hmax - hmin), broken = r() < ruin;
      const y = base - h;
      out.push(broken ? `${x},${base} ${x},${y + 14} ${x + w * 0.35},${y} ${x + w * 0.5},${y + 24} ${x + w * 0.8},${y + 8} ${x + w},${y + 30} ${x + w},${base}` : `${x},${base} ${x},${y} ${x + w},${y} ${x + w},${base}`);
      x += w + r() * 6;
    }
    return out;
  }, [seed, base, hmin, hmax, ruin]);
  return (
    <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, animation: `sway ${dur}s ease-in-out infinite alternate` }}>
      {shapes.map((p, i) => <polygon key={i} points={p} fill={color} />)}
    </svg>
  );
}

function Dust() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, x = c.getContext('2d')!; let raf = 0;
    const P = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random() * 1.8, v: 0.02 + Math.random() * 0.05, a: 0.1 + Math.random() * 0.4 }));
    const loop = () => {
      c.width = c.clientWidth; c.height = c.clientHeight; x.clearRect(0, 0, c.width, c.height);
      for (const p of P) { p.x += p.v * 0.003; p.y -= p.v * 0.0012; if (p.x > 1) p.x = 0; if (p.y < 0) p.y = 1; x.fillStyle = `rgba(255,220,180,${p.a})`; x.beginPath(); x.arc(p.x * c.width, p.y * c.height, p.s, 0, 7); x.fill(); }
      raf = requestAnimationFrame(loop);
    };
    loop(); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

function Figures() {
  return (
    <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs><linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a4a40" /><stop offset="1" stopColor="#0a0b10" /></linearGradient></defs>
      <polygon points="700,545 900,545 1500,700 100,700" fill="url(#road)" />
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${k ? 835 : 790} ${k ? 575 : 579}) scale(${k ? 0.9 : 1})`} fill="#07080c">
          <circle cx="0" cy="-34" r="4.6" /><path d="M-5-30h10l2 17h-14z" /><path d="M-5-13l-3 13h3l3-10 3 10h3l-3-13z" /><path d={k ? 'M-5-28l-6 11 3 2 5-9z' : 'M5-28l6 12-3 2-5-9z'} />
          <rect x={k ? 4 : -9} y="-30" width="5" height="12" rx="2" />
        </g>
      ))}
      <rect x="1180" y="290" width="6" height="6" fill="#ffd9a0" style={{ animation: 'flick 6s infinite' }} />
      <rect x="320" y="330" width="5" height="5" fill="#ff7a50" style={{ animation: 'flick 9s infinite' }} />
    </svg>
  );
}

interface Props { progress: Progress | null; settings: Settings; onSettings: (p: Partial<Settings>) => void; onPlay: () => void; onContinue: () => void }

export default function TitleScreen({ progress, settings, onSettings, onPlay, onContinue }: Props) {
  const [modal, setModal] = useState<null | 'settings' | 'credits' | 'info'>(null);
  const safeIdx = progress ? Math.max(0, Math.min(SCENES.length - 1, progress.index)) : 0;
  const sc = progress ? SCENES[safeIdx] : null;
  const at = progress ? SCENE_STARTS[safeIdx] : 0;
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="title-bg">
        <div style={{ position: 'absolute', left: '62%', top: '55%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,150,.9), rgba(255,160,90,.0) 70%)', filter: 'blur(4px)' }} />
        <Skyline seed={3} color="#3a2f3c" base={560} hmin={80} hmax={260} opacity={0.75} dur={50} ruin={0.35} />
        <Skyline seed={9} color="#1c1722" base={600} hmin={90} hmax={330} opacity={0.95} dur={36} ruin={0.5} />
        <Skyline seed={21} color="#0b0a10" base={640} hmin={60} hmax={400} opacity={1} dur={28} ruin={0.6} />
        <Figures />
        <div className="fog" style={{ bottom: '18%' }} />
        <div className="fog" style={{ bottom: '4%', animationDuration: '52s', animationDirection: 'alternate-reverse' }} />
        <Dust />
      </div>
      <div className="title-ui">
        <div style={{ letterSpacing: '.45em', fontSize: 11, color: '#ffcf8a', marginBottom: 18 }}>{MOVIE.universe}</div>
        <h1 className="serif" style={{ fontSize: 'clamp(40px, 8.2vw, 124px)', lineHeight: 0.95, letterSpacing: '.14em', fontWeight: 700, margin: 0, textShadow: '0 4px 50px rgba(0,0,0,.7)' }}>TWO<br />SURVIVORS</h1>
        <p className="serif" style={{ maxWidth: 560, fontSize: 'clamp(16px, 1.7vw, 24px)', fontStyle: 'italic', margin: '26px 0 18px', color: '#e8dcc6' }}>“{MOVIE.tagline}”</p>
        <div style={{ fontSize: 12, letterSpacing: '.16em', color: 'rgba(255,255,255,.65)', marginBottom: 30 }}>
          {MOVIE.genres.join('  ·  ').toUpperCase()}  ·  ≈ {MOVIE.runtimeMin} MIN
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-main" onClick={onPlay}><svg width="16" height="16" viewBox="0 0 24 24"><path d="M6 3.5v17l14-8.5z" fill="currentColor" /></svg>PLAY MOVIE</button>
          {progress && sc && <button className="btn-sec" onClick={onContinue}>CONTINUE WATCHING <span style={{ opacity: 0.6, marginLeft: 8 }}>ACT {sc.act} · {Math.floor(at / 60)}:{String(Math.floor(at % 60)).padStart(2, '0')}</span></button>}
          <button className="btn-sec" onClick={() => setModal('settings')}>SETTINGS</button>
          <button className="btn-sec" onClick={() => setModal('credits')}>CREDITS</button>
          <button className="btn-sec" onClick={() => setModal('info')}>ABOUT</button>
        </div>
        <p style={{ marginTop: 26, fontSize: 11, letterSpacing: '.14em', color: 'rgba(255,255,255,.4)' }}>Best experienced with headphones, in fullscreen.</p>
      </div>
      {modal && (
        <div className="modal" onClick={() => setModal(null)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="serif" style={{ fontSize: 24, letterSpacing: '.3em', margin: 0 }}>{modal === 'settings' ? 'SETTINGS' : modal === 'credits' ? 'CREDITS' : 'ABOUT THE FILM'}</h2>
              <button className="btn-i" aria-label="Close" onClick={() => setModal(null)}><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
            </div>
            {modal === 'settings' && <AudioControls settings={settings} onChange={onSettings} showExtras />}
            {modal === 'credits' && CREDITS.map((c, i) => (
              <div key={i} className="mb-4">
                {c.role && <div style={{ fontSize: 10, letterSpacing: '.35em', color: '#ffcf8a' }}>{c.role.toUpperCase()}</div>}
                {c.names.map((n) => <div key={n} className="serif" style={{ fontSize: 17 }}>{n}</div>)}
              </div>
            ))}
            {modal === 'info' && (
              <div className="text-sm leading-relaxed text-white/75">
                <p>{MOVIE.synopsis}</p>
                <p className="mt-3 text-white/55">A linear animated film rendered live in your browser. Characters, environments, music and sound effects are generated procedurally.</p>
                <p className="mt-3 text-white/55">Voices use your browser’s speech synthesis as a fallback. Recorded voice acting is <b>not</b> included; to add it, place audio files in <code>public/audio/voice/</code> and list them in <code>manifest.json</code> by dialogue line id.</p>
                <p className="mt-3 text-white/55">Controls: Space play/pause · ←/→ skip 10 s · F fullscreen · C subtitles · M mute.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
