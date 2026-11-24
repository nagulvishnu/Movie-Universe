/* eslint-disable @next/next/no-img-element */
import type { Movie } from "@/lib/movies";

// Procedural "portal artwork" used whenever a movie manifest does not provide its own poster/backdrop.
// It is presentation only: it never pretends to be a frame from the movie.

type ArtMovie = Pick<Movie, "theme" | "artwork" | "title" | "id">;

const RUINS: [number, number, number][] = [[0, 40, 120], [40, 30, 190], [70, 46, 140], [116, 28, 230], [144, 40, 110], [184, 34, 200], [218, 40, 150], [258, 42, 100]];
const NOIR: [number, number, number][] = [[0, 36, 170], [36, 28, 240], [64, 40, 150], [104, 30, 270], [134, 44, 200], [178, 32, 160], [210, 38, 250], [248, 52, 190]];

function Dots({ color, n, speed, size = 2 }: { color: string; n: number; speed: number; size?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${(i * 37 + 11) % 95}%`,
            left: 0,
            width: size + (i % 3),
            height: size + (i % 3),
            background: color,
            opacity: 0.25 + (i % 5) * 0.12,
            animation: `dust-drift ${speed + (i % 7) * 2.2}s linear ${-(i * 1.7)}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function Scene({ theme }: { theme: Movie["theme"] }) {
  const { primary: p, secondary: s, accent: a, atmosphere } = theme;
  const gid = `g-${atmosphere}-${p.slice(1)}`;
  return (
    <svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#02030a" />
          <stop offset="0.45" stopColor={s} />
          <stop offset="1" stopColor={p} />
        </linearGradient>
        <radialGradient id={`${gid}-glow`}>
          <stop offset="0" stopColor={a} stopOpacity="0.95" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="300" height="420" fill={`url(#${gid}-sky)`} />
      {atmosphere === "ruins" && (
        <>
          <circle cx="210" cy="200" r="90" fill={`url(#${gid}-glow)`} opacity="0.6" />
          <circle cx="210" cy="200" r="26" fill={a} opacity="0.55" />
          {RUINS.map(([x, w, h], i) => (
            <polygon key={i} fill="#07080d" points={`${x},420 ${x},${420 - h} ${x + w * 0.3},${420 - h + 14} ${x + w * 0.55},${420 - h - 6 + (i % 3) * 8} ${x + w},${420 - h + 26} ${x + w},420`} />
          ))}
          <rect y="395" width="300" height="25" fill="#050508" />
        </>
      )}
      {atmosphere === "forest" && (
        <>
          <circle cx="215" cy="110" r="70" fill={`url(#${gid}-glow)`} opacity="0.5" />
          <circle cx="215" cy="110" r="24" fill="#e8f2ff" />
          {[0, 1, 2].map((row) =>
            Array.from({ length: 9 }, (_, i) => {
              const x = i * 38 - 10 + row * 14;
              const base = 330 + row * 40;
              const h = 120 + ((i * 53 + row * 31) % 60) + row * 20;
              return <polygon key={`${row}-${i}`} fill={row === 0 ? "#0a1b1c" : row === 1 ? "#06100f" : "#030707"} points={`${x},${base} ${x + 22},${base - h} ${x + 44},${base}`} />;
            }),
          )}
        </>
      )}
      {atmosphere === "noir" && (
        <>
          <rect y="300" width="300" height="120" fill={a} opacity="0.12" />
          {NOIR.map(([x, w, h], i) => (
            <g key={i}>
              <rect x={x} y={420 - h} width={w} height={h} fill="#05060e" />
              {Array.from({ length: 14 }, (_, k) => (
                <rect key={k} x={x + 5 + (k % 3) * 11} y={420 - h + 12 + Math.floor(k / 3) * 22} width="5" height="8" fill={(i * 7 + k * 5) % 4 === 0 ? a : "#e7e2b0"} opacity={(i + k) % 3 === 0 ? 0.9 : 0.08} />
              ))}
            </g>
          ))}
          <rect x="0" y="392" width="300" height="28" fill="#020308" />
          <rect x="0" y="392" width="300" height="2" fill={a} opacity="0.7" />
        </>
      )}
      {atmosphere === "romance" && (
        <>
          <circle cx="150" cy="250" r="130" fill={`url(#${gid}-glow)`} opacity="0.8" />
          <circle cx="150" cy="250" r="46" fill="#fff1d6" opacity="0.9" />
          <path d="M0 330 Q80 290 150 320 T300 300 V420 H0Z" fill="#2a0f2a" opacity="0.9" />
          <path d="M0 370 Q100 340 190 365 T300 350 V420 H0Z" fill="#12060f" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={(i * 61) % 300} cy={80 + ((i * 47) % 230)} r={8 + (i % 4) * 7} fill={a} opacity="0.16" />
          ))}
        </>
      )}
      {atmosphere === "egypt" && (
        <>
          <circle cx="150" cy="215" r="120" fill={`url(#${gid}-glow)`} opacity="0.7" />
          <circle cx="150" cy="215" r="48" fill={a === "#3ec6c6" ? "#ffe3a6" : a} opacity="0.95" />
          <polygon fill="#2a1606" points="20,360 120,230 220,360" />
          <polygon fill="#3a1f08" points="150,360 235,255 320,360" />
          <polygon fill="#1a0d03" points="-60,360 20,280 100,360" />
          <path d="M0 360 Q90 340 170 358 T300 345 V420 H0Z" fill="#150a02" />
          {[28, 64, 236, 272].map((x) => (
            <g key={x}>
              <rect x={x - 7} y="250" width="14" height="170" fill="#0c0602" />
              <rect x={x - 12} y="244" width="24" height="10" fill="#0c0602" />
            </g>
          ))}
          <rect x="10" y="236" width="90" height="10" fill="#0c0602" />
          <rect x="200" y="236" width="90" height="10" fill="#0c0602" />
        </>
      )}
      {atmosphere === "cosmic" && (
        <>
          {[110, 80, 52, 26].map((r, i) => (
            <circle key={r} cx="150" cy="200" r={r} fill="none" stroke={i % 2 ? a : p} strokeWidth="2" opacity={0.85 - i * 0.12} />
          ))}
          <circle cx="150" cy="200" r="20" fill={a} opacity="0.9" />
        </>
      )}
      <rect y="220" width="300" height="200" fill={`url(#${gid}-fade)`} />
    </svg>
  );
}

function Atmosphere({ theme }: { theme: Movie["theme"] }) {
  switch (theme.particles) {
    case "rain":
      return <div className="world-rain absolute inset-0" />;
    case "dust":
      return <Dots color="#e3cfa6" n={22} speed={16} />;
    case "sand":
      return <Dots color="#ffd08a" n={26} speed={7} size={2} />;
    case "fog":
      return (
        <>
          <div className="absolute inset-x-0 bottom-[18%] h-24 bg-gradient-to-t from-transparent via-white/15 to-transparent blur-xl" style={{ animation: "dust-drift 26s linear infinite alternate" }} />
          <div className="absolute inset-x-0 bottom-[34%] h-20 bg-gradient-to-t from-transparent via-white/10 to-transparent blur-xl" style={{ animation: "dust-drift 38s linear -9s infinite alternate" }} />
        </>
      );
    case "bokeh":
      return <Dots color={theme.accent} n={10} speed={30} size={10} />;
    default:
      return <Dots color="#9bb8ff" n={14} speed={22} />;
  }
}

export default function WorldArt({
  movie,
  kind = "poster",
  className = "",
  priority = false,
}: {
  movie: ArtMovie;
  kind?: "poster" | "backdrop";
  className?: string;
  priority?: boolean;
}) {
  const src = kind === "backdrop" ? (movie.artwork.backdrop ?? movie.artwork.poster) : (movie.artwork.poster ?? movie.artwork.thumbnail);
  return (
    <div className={`relative overflow-hidden bg-[#02030a] ${className}`}>
      {src ? (
        <img src={src} alt={`${movie.title} artwork`} loading={priority ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <Scene theme={movie.theme} />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <Atmosphere theme={movie.theme} />
          </div>
        </>
      )}
    </div>
  );
}
