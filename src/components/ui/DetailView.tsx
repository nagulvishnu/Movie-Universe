"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, ExternalLink, Layers, Play, TriangleAlert } from "lucide-react";
import { formatRuntime, slugify, STATUS_LABEL, type Diagnostic, type Movie } from "@/lib/movies";
import { sfx } from "@/lib/audio";
import { useHistory } from "@/lib/storage";
import { useWorld } from "@/components/universe/UniverseProvider";
import WorldArt from "./WorldArt";
import BookmarkButton from "./BookmarkButton";
import MiniCard from "./MiniCard";

function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(" ");
  let n = 0;
  return (
    <h1 className="display text-[clamp(2.2rem,6vw,5rem)] font-extrabold leading-[1.02]" aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} className="mr-[0.3em] inline-block whitespace-nowrap" aria-hidden>
          {w.split("").map((ch) => (
            <motion.span
              key={n}
              className="metal-text inline-block"
              initial={{ opacity: 0, y: 36, rotateX: -80, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.15 + n++ * 0.035, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}

function isVideoFile(src: string) {
  return /\.(mp4|webm)(\?|$)/i.test(src);
}

export default function DetailView({ movie, related, diagnostics }: { movie: Movie; related: Movie[]; diagnostics: Diagnostic[] }) {
  useWorld("world", movie.theme);
  const history = useHistory();
  const h = history[movie.id];
  const playable = movie.status === "ready";
  const runtime = formatRuntime(movie.runtime);
  const reliable = playable && movie.progress && h?.position !== undefined && h?.duration;
  const problems = diagnostics.filter((d) => d.folder === movie.id);

  return (
    <article style={{ ["--b1" as string]: movie.theme.primary, ["--b2" as string]: movie.theme.accent }}>
      <div className="relative min-h-[88svh] overflow-hidden">
        <div className="absolute inset-0">
          <motion.div initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 0.55 }} transition={{ duration: 1.6, ease: "easeOut" }} className="h-full w-full">
            <WorldArt movie={movie} kind="backdrop" className="h-full w-full" priority />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#02030a] via-[#02030a]/60 to-[#02030a]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02030a] via-[#02030a]/50 to-transparent" />
          <div className="absolute inset-0 mix-blend-screen" style={{ background: `radial-gradient(ellipse at 75% 30%, ${movie.theme.primary}40, transparent 60%)` }} />
        </div>

        <div className="relative mx-auto flex max-w-[1500px] flex-col gap-10 px-5 pb-16 pt-32 md:px-12 lg:flex-row lg:items-end lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -18 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 900 }}
            className="mx-auto w-[min(70vw,300px)] shrink-0 lg:mx-0"
          >
            <div className="holo-border aspect-[3/4.35] [border-radius:150px_150px_24px_24px] shadow-[0_40px_120px_-30px_var(--b1)]">
              <WorldArt movie={movie} kind="poster" className="h-full w-full [border-radius:inherit]" priority />
            </div>
          </motion.div>

          <div className="max-w-3xl">
            <Link href="/explore" onClick={() => sfx("click")} className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#f5c46b]">
              <ArrowLeft size={14} /> Back to Explore
            </Link>
            <div className="mb-4 flex flex-wrap gap-2">
              {movie.genre.map((g) => (
                <Link key={g} href={`/explore?genre=${slugify(g)}`} className="chip">
                  {g}
                </Link>
              ))}
            </div>
            <AnimatedTitle text={movie.title} />
            {movie.tagline && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-4 text-lg italic text-[#ffe3a6]/85">
                {movie.tagline}
              </motion.p>
            )}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65">
                {movie.releaseYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {movie.releaseYear}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> {runtime}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Layers size={14} /> {movie.type === "video" ? `Video (${movie.video?.format})` : "Interactive 3D web movie"}
                </span>
                <span className={playable ? "text-emerald-300" : "text-[#f5c46b]"}>● {STATUS_LABEL[movie.status]}</span>
              </div>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80">{movie.synopsis}</p>
              {movie.description !== movie.synopsis && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">{movie.description}</p>}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {playable ? (
                  <Link href={movie.watchUrl} onClick={() => sfx("portal")} className="btn-primary">
                    <Play size={14} fill="currentColor" /> {reliable && !h?.completed ? "Resume Movie" : "Watch Movie"}
                  </Link>
                ) : (
                  <span className="btn-primary" aria-disabled="true" role="note">
                    <Play size={14} /> {STATUS_LABEL[movie.status]}
                  </span>
                )}
                <BookmarkButton id={movie.id} label />
                {movie.trailer && !isVideoFile(movie.trailer) && (
                  <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <ExternalLink size={14} /> Trailer
                  </a>
                )}
              </div>
              {reliable && !h?.completed && (
                <div className="mt-5 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Watch progress" aria-valuenow={Math.round(((h.position ?? 0) / (h.duration ?? 1)) * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-[#f5c46b]" style={{ width: `${Math.min(100, ((h.position ?? 0) / (h.duration ?? 1)) * 100)}%` }} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-5 pb-32 md:px-12">
        {!playable && (
          <section className="glass mb-16 rounded-3xl p-6 md:p-8" aria-live="polite">
            <div className="flex items-start gap-4">
              <TriangleAlert className="mt-0.5 shrink-0 text-[#f5c46b]" />
              <div className="min-w-0">
                <h2 className="display text-lg">{movie.status === "missing" ? "This movie has not been added yet" : STATUS_LABEL[movie.status]}</h2>
                <p className="mt-2 text-sm text-white/70">{movie.statusReason}</p>
                {problems.length > 0 && (
                  <ul className="mt-4 space-y-1 text-xs text-white/60">
                    {problems.map((d, i) => (
                      <li key={i}>
                        <span className={d.level === "error" ? "text-red-300" : "text-amber-200"}>{d.level}</span>: {d.message}
                      </li>
                    ))}
                  </ul>
                )}
                {movie.status === "missing" && (
                  <p className="mt-4 text-xs text-white/50">
                    Add <code className="rounded bg-white/10 px-1.5 py-0.5">movies/{movie.id}/movie.json</code> next to the project&apos;s <code className="rounded bg-white/10 px-1.5 py-0.5">package.json</code>, then run{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5">node scripts/movies.mjs build {movie.id}</code>. Details in movies/README.md. The artwork above is generated portal art, not footage.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {movie.trailer && isVideoFile(movie.trailer) && (
          <section className="mb-16">
            <h2 className="display mb-5 text-xl">Trailer</h2>
            <video src={movie.trailer} controls preload="none" playsInline poster={movie.artwork.backdrop} className="aspect-video w-full max-w-4xl rounded-3xl border border-white/10 bg-black" />
          </section>
        )}

        {movie.tags.length > 0 && (
          <section className="mb-16">
            <h2 className="display mb-4 text-xl">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {movie.tags.map((t) => (
                <Link key={t} href={`/explore?q=${encodeURIComponent(t)}`} className="chip">
                  #{t}
                </Link>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="display mb-6 text-xl">Related worlds</h2>
            <p className="-mt-4 mb-6 text-xs text-white/45">Matched by shared genres and tags.</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {related.map((m) => (
                <MiniCard key={m.id} movie={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
