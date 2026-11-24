"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Clock, Play, Info } from "lucide-react";
import { formatRuntime, STATUS_LABEL, type Movie } from "@/lib/movies";
import { sfx } from "@/lib/audio";
import { useHistory, useReducedMotionPref } from "@/lib/storage";
import WorldArt from "./WorldArt";
import BookmarkButton from "./BookmarkButton";

// A movie "world": an arch-shaped dimensional gate that tilts in 3D toward the pointer,
// with a rotating holographic border and parallax layers. Touch devices get a static, tap-friendly version.

export default function WorldCard({ movie, index = 0, size = "md" }: { movie: Movie; index?: number; size?: "md" | "lg" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  const history = useHistory();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 16 });
  const sy = useSpring(my, { stiffness: 140, damping: 16 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-13, 13]);
  const rotX = useTransform(sy, [-0.5, 0.5], [11, -11]);
  const artX = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const artY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const glowX = useTransform(sx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(sy, [-0.5, 0.5], ["15%", "85%"]);

  const playable = movie.status === "ready";
  const runtime = formatRuntime(movie.runtime);
  const h = history[movie.id];
  const showProgress = playable && movie.progress && h?.position !== undefined && h?.duration;

  const move = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === "touch") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1100 }}
      className={size === "lg" ? "w-full" : "w-full"}
    >
      <div style={{ animation: reduced ? undefined : `float-y ${6 + (index % 3)}s ease-in-out ${-index * 1.3}s infinite` }}>
        <motion.div
          ref={ref}
          onPointerMove={move}
          onPointerLeave={leave}
          onPointerEnter={() => sfx("hover")}
          style={{ rotateX: reduced ? 0 : rotX, rotateY: reduced ? 0 : rotY, transformStyle: "preserve-3d", ["--b1" as string]: movie.theme.primary, ["--b2" as string]: movie.theme.accent }}
          className="holo-border group relative aspect-[3/4.35] transition-shadow duration-500 [border-radius:160px_160px_26px_26px] hover:shadow-[0_30px_90px_-20px_var(--b1)]"
        >
          <div className="absolute inset-0 overflow-hidden [border-radius:inherit]">
            <motion.div style={{ x: artX, y: artY, scale: 1.18 }} className="absolute inset-0">
              <WorldArt movie={movie} kind="poster" className="h-full w-full" />
            </motion.div>
            <motion.div style={{ left: glowX, top: glowY, background: `radial-gradient(circle, ${movie.theme.accent}55, transparent 60%)` }} className="pointer-events-none absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 opacity-0 mix-blend-screen transition-opacity group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100" style={{ animation: "shimmer 1.6s ease-in-out infinite" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02030a] via-[#02030a]/55 to-transparent" />
          </div>

          <Link href={`/movie/${movie.id}`} aria-label={`${movie.title}: view details`} className="absolute inset-0 z-10 [border-radius:inherit]" onClick={() => sfx("click")} />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 pb-6" style={{ transform: "translateZ(50px)" }}>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {movie.genre.slice(0, 3).map((g) => (
                <span key={g} className="chip !py-0.5 !text-[10px]">
                  {g}
                </span>
              ))}
            </div>
            <h3 className="display text-xl font-extrabold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] md:text-2xl">{movie.title}</h3>
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/70">{movie.synopsis}</p>
            <div className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-wider text-white/55">
              {movie.releaseYear && <span>{movie.releaseYear}</span>}
              {runtime && (
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {runtime}
                </span>
              )}
              {!playable && <span className="rounded-full border border-[#f5c46b]/50 px-2 py-0.5 text-[#f5c46b]">{STATUS_LABEL[movie.status]}</span>}
            </div>
            {showProgress && (
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={Math.round(((h.position ?? 0) / (h.duration ?? 1)) * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-[#f5c46b]" style={{ width: `${Math.min(100, ((h.position ?? 0) / (h.duration ?? 1)) * 100)}%` }} />
              </div>
            )}
          </div>

          <div className="absolute right-4 top-6 z-30" style={{ transform: "translateZ(60px)" }}>
            <BookmarkButton id={movie.id} />
          </div>
          <div className="absolute inset-x-6 -bottom-5 z-30 flex justify-center" style={{ transform: "translateZ(70px)" }}>
            {playable ? (
              <Link href={movie.watchUrl} onClick={() => sfx("portal")} className="btn-primary !px-6 !py-3">
                <Play size={14} fill="currentColor" /> Watch
              </Link>
            ) : (
              <Link href={`/movie/${movie.id}`} className="btn-ghost !bg-[#070b1f]/90 !px-6 !py-3">
                <Info size={14} /> Details
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
