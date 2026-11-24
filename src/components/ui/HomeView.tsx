"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Clock, Compass, Play, TriangleAlert } from "lucide-react";
import { formatRuntime, sortMovies, STATUS_LABEL, type Collection, type Movie } from "@/lib/movies";
import { sfx } from "@/lib/audio";
import { useHistory, useIntroState } from "@/lib/storage";
import { useWorld } from "@/components/universe/UniverseProvider";
import Intro from "./Intro";
import WorldCard from "./WorldCard";
import MiniCard from "./MiniCard";
import ContinueWatching, { useWatched } from "./ContinueWatching";
import { CollectionTiles } from "./Collections";

function SectionTitle({ kicker, title, sub, action }: { kicker: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="display text-[11px] tracking-[0.4em] text-[#f5c46b]">{kicker}</p>
        <h2 className="display mt-2 text-3xl font-extrabold md:text-4xl">{title}</h2>
        {sub && <p className="mt-2 max-w-xl text-sm text-white/55">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Hero({ candidates }: { candidates: Movie[] }) {
  const [idx, setIdx] = useState(0);
  const movie = candidates[idx];
  useWorld("portal", movie?.theme, movie?.artwork.poster);
  const playable = movie?.status === "ready";
  const runtime = formatRuntime(movie?.runtime);
  const words = ["MOVIE", "UNIVERSE"];

  return (
    <section className="relative flex min-h-[100svh] items-center px-5 pb-24 pt-[46svh] md:px-12 md:pt-28" aria-labelledby="hero-title">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="max-w-2xl">
          <p className="display text-[11px] tracking-[0.45em] text-[#9db8ff]">Welcome to the infinite cinema</p>
          <h1 id="hero-title" className="display mt-4 text-[clamp(2.6rem,7.5vw,6rem)] font-extrabold leading-[0.95]" aria-label="Movie Universe">
            {words.map((w, wi) => (
              <span key={wi} className="mr-[0.28em] inline-block whitespace-nowrap">
                {w.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    className="metal-text inline-block"
                    initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.15 + (wi * 6 + i) * 0.045, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
          <p className="display mt-5 text-sm font-semibold tracking-[0.35em] text-[#f5c46b] md:text-base">One portal. Infinite stories.</p>
          <p className="mt-2 text-sm text-white/55">Enter the worlds. Experience the stories.</p>
        </div>

        {movie && (
          <div className="mt-10 max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                transition={{ duration: 0.45 }}
                className="glass holo-border rounded-3xl p-6 md:p-7"
                style={{ ["--b1" as string]: movie.theme.primary, ["--b2" as string]: movie.theme.accent }}
              >
                <p className="display text-[10px] tracking-[0.4em] text-white/50">
                  Featured world · {String(idx + 1).padStart(2, "0")} / {String(candidates.length).padStart(2, "0")}
                </p>
                <h2 className="display mt-2 text-2xl font-extrabold md:text-3xl">{movie.title}</h2>
                {movie.tagline && <p className="mt-1 text-sm italic text-[#ffe3a6]/80">{movie.tagline}</p>}
                <p className="mt-3 text-sm leading-relaxed text-white/75">{movie.synopsis}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {movie.genre.slice(0, 4).map((g) => (
                    <span key={g} className="chip">
                      {g}
                    </span>
                  ))}
                  {movie.releaseYear && <span className="text-xs text-white/50">{movie.releaseYear}</span>}
                  {runtime && (
                    <span className="flex items-center gap-1 text-xs text-white/50">
                      <Clock size={12} /> {runtime}
                    </span>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {playable ? (
                    <Link href={movie.watchUrl} onClick={() => sfx("portal")} className="btn-primary">
                      <Play size={14} fill="currentColor" /> Watch Movie
                    </Link>
                  ) : (
                    <Link href={`/movie/${movie.id}`} onClick={() => sfx("click")} className="btn-primary" aria-disabled="true" title={movie.statusReason}>
                      <Play size={14} /> {STATUS_LABEL[movie.status]}
                    </Link>
                  )}
                  <Link href="/explore" onClick={() => sfx("click")} className="btn-ghost">
                    <Compass size={14} /> Explore Movies
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
            {candidates.length > 1 && (
              <div className="mt-5 flex items-center gap-2" role="tablist" aria-label="Featured movies">
                {candidates.map((c, i) => (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={i === idx}
                    aria-label={`Feature ${c.title}`}
                    onClick={() => {
                      sfx("click");
                      setIdx(i);
                    }}
                    className={`h-1.5 rounded-full transition-all ${i === idx ? "w-10 bg-[#f5c46b]" : "w-4 bg-white/25 hover:bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <a href="#worlds" aria-label="Scroll to movie worlds" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/50 hover:text-[#f5c46b] md:block">
        <ChevronDown />
      </a>
    </section>
  );
}

type Tab = "recent" | "featured" | "watched" | "all";

function Discover({ movies }: { movies: Movie[] }) {
  const [tab, setTab] = useState<Tab>("recent");
  const history = useHistory();
  const watched = useWatched(movies);
  const lastOpened = useMemo(() => Object.fromEntries(Object.entries(history).map(([k, v]) => [k, v.lastOpened])), [history]);

  const lists: Record<Tab, { label: string; items: Movie[]; empty: string }> = {
    recent: { label: "Recently added", items: sortMovies(movies.filter((m) => m.sourcePresent), "recent"), empty: "No movie projects have been added to movies/ yet." },
    featured: { label: "Featured selections", items: sortMovies(movies.filter((m) => m.featured), "featured"), empty: "No featured movies." },
    watched: { label: "Most recently watched", items: watched, empty: "You haven't opened any movies yet." },
    all: { label: "All movies", items: sortMovies(movies, "title", lastOpened), empty: "No movies found." },
  };
  const cur = lists[tab];

  return (
    <div>
      <div role="tablist" aria-label="Discover more" className="mb-8 flex flex-wrap gap-2">
        {(Object.keys(lists) as Tab[]).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            data-active={tab === k}
            onClick={() => {
              sfx("click");
              setTab(k);
            }}
            className="chip !px-4 !py-2"
          >
            {lists[k].label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {cur.items.length === 0 ? (
            <p className="glass rounded-2xl p-8 text-center text-sm text-white/60">{cur.empty}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cur.items.map((m) => (
                <MiniCard key={m.id} movie={m} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function HomeView({ movies, collections }: { movies: Movie[]; collections: Collection[] }) {
  const intro = useIntroState();
  const gated = intro !== "done";

  const candidates = useMemo(() => {
    const rank = (m: Movie) => (m.status === "ready" ? 0 : m.sourcePresent ? 1 : 2) + (m.featured ? 0 : 0.5);
    return [...movies].sort((a, b) => rank(a) - rank(b) || a.order - b.order).slice(0, 6);
  }, [movies]);

  const live = movies.filter((m) => m.status === "ready").length;
  const pending = movies.length - live;
  const showcase = movies.filter((m) => m.featured).length ? movies.filter((m) => m.featured) : movies;

  return (
    <>
      <Intro />
      <div className="intro-gated" data-hidden={gated}>
        <Hero candidates={candidates} />

        {pending > 0 && (
          <div className="mx-auto -mt-8 mb-6 max-w-[1500px] px-5 md:px-12">
            <div className="glass flex flex-wrap items-center gap-4 rounded-2xl px-5 py-4 text-sm">
              <TriangleAlert size={18} className="shrink-0 text-[#f5c46b]" />
              <p className="flex-1 text-white/75">
                <strong className="text-white">{live}</strong> of {movies.length} movies are live. {pending} {pending === 1 ? "is" : "are"} waiting for {pending === 1 ? "its" : "their"} project folder in{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">movies/</code> — they are shown honestly as unavailable until added.
              </p>
              <Link href="/movies" className="chip">
                Discovery report
              </Link>
            </div>
          </div>
        )}

        <section id="worlds" className="mx-auto max-w-[1500px] scroll-mt-24 px-5 py-24 md:px-12">
          <SectionTitle kicker="Dimensions" title="Featured movie worlds" sub="Every movie is its own independent universe. Tilt a gate, step inside." action={<Link href="/explore" className="chip">Explore all</Link>} />
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
            {showcase.map((m, i) => (
              <WorldCard key={m.id} movie={m} index={i} />
            ))}
          </div>
        </section>

        <ContinueSection movies={movies} />

        <section id="collections" className="mx-auto max-w-[1500px] scroll-mt-24 px-5 py-20 md:px-12">
          <SectionTitle kicker="Collections" title="Explore by genre" sub="Generated from the metadata of the movies that actually exist." action={<Link href="/collections" className="chip">All collections</Link>} />
          <CollectionTiles collections={collections} />
        </section>

        <section id="discover" className="mx-auto max-w-[1500px] scroll-mt-24 px-5 py-20 pb-32 md:px-12">
          <SectionTitle kicker="Discover more" title="Keep exploring" />
          <Discover movies={movies} />
        </section>
      </div>
    </>
  );
}

function ContinueSection({ movies }: { movies: Movie[] }) {
  const watched = useWatched(movies.filter((m) => m.status === "ready"));
  if (watched.length === 0) return null;
  return (
    <section id="continue" className="mx-auto max-w-[1500px] scroll-mt-24 px-5 py-16 md:px-12">
      <SectionTitle kicker="Pick up where you left off" title="Continue watching" action={<Link href="/continue" className="chip">See all</Link>} />
      <ContinueWatching movies={movies} />
    </section>
  );
}
