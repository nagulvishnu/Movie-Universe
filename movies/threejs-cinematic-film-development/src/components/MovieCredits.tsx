import { useLayoutEffect, useRef, useState } from 'react';
import { CREDITS } from '../data/movieConfig';

/** Scrolling end credits. Position is a pure function of scene time, so pause/seek behave correctly. */
export default function MovieCredits({ t, dur }: { t: number; dur: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(1200);
  const [ch, setCh] = useState(800);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    setH(el.offsetHeight); setCh(el.parentElement?.clientHeight ?? 800);
  }, []);
  const p = Math.max(0, Math.min(1, (t - 2) / (dur - 6)));
  const y = ch - (ch + h) * p;
  const fadeIn = Math.min(1, t / 2);
  return (
    <div className="credits" style={{ opacity: fadeIn }}>
      <div className="credits-roll" ref={ref} style={{ transform: `translateY(${y}px)` }}>
        <div className="serif" style={{ fontSize: 'clamp(26px,4vw,64px)', letterSpacing: '.4em', fontWeight: 700 }}>TWO SURVIVORS</div>
        {CREDITS.map((c, i) => (
          <div key={i}>
            {c.role && <div className="role">{c.role.toUpperCase()}</div>}
            {c.names.map((n) => <div className="name" key={n}>{n}</div>)}
          </div>
        ))}
        <div style={{ height: '30vh' }} />
      </div>
    </div>
  );
}
