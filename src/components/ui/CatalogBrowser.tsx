"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dices, RotateCcw, Search, X } from "lucide-react";
import { buildCollections, matchesGenreSlug, searchMovies, sortMovies, type Movie, type SortKey } from "@/lib/movies";
import { pickRandom } from "@/lib/index-types";
import { useHistory } from "@/lib/storage";
import { sfx } from "@/lib/audio";
import { useWorld } from "@/components/universe/UniverseProvider";
import WorldCard from "./WorldCard";

type StatusFilter = "all" | "playable" | "unavailable";

const SORTS: [SortKey, string][] = [
  ["featured", "Featured first"],
  ["title", "Title A–Z"],
  ["newest", "Release year (newest)"],
  ["recent", "Recently added"],
  ["runtime", "Runtime (longest)"],
  ["watched", "Recently watched"],
];

export default function CatalogBrowser({ movies }: { movies: Movie[] }) {
  useWorld("calm");
  const router = useRouter();
  const sp = useSearchParams();
  const history = useHistory();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [genre, setGenre] = useState(sp.get("genre") ?? "all");
  const [status, setStatus] = useState<StatusFilter>((sp.get("status") as StatusFilter) || "all");
  const [sort, setSort] = useState<SortKey>((sp.get("sort") as SortKey) || "featured");

  // Follow external URL changes (e.g. the global search palette or a collection tile).
  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setGenre(sp.get("genre") ?? "all");
  }, [sp]);

  // Mirror filters into the URL without navigation.
  useEffect(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (genre !== "all") p.set("genre", genre);
    if (status !== "all") p.set("status", status);
    if (sort !== "featured") p.set("sort", sort);
    const s = p.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  }, [q, genre, status, sort]);

  const collections = useMemo(() => buildCollections(movies), [movies]);
  const lastOpened = useMemo(() => Object.fromEntries(Object.entries(history).map(([k, v]) => [k, v.lastOpened])), [history]);

  const results = useMemo(() => {
    let list = searchMovies(movies, q);
    if (genre !== "all") list = list.filter((m) => matchesGenreSlug(m, genre));
    if (status === "playable") list = list.filter((m) => m.status === "ready");
    if (status === "unavailable") list = list.filter((m) => m.status !== "ready");
    // keep relevance order while searching unless the visitor picked a sort
    return q.trim() && sort === "featured" ? list : sortMovies(list, sort, lastOpened);
  }, [movies, q, genre, status, sort, lastOpened]);

  const reset = () => {
    setQ("");
    setGenre("all");
    setStatus("all");
    setSort("featured");
  };
  const dirty = q || genre !== "all" || status !== "all" || sort !== "featured";

  const random = () => {
    const pick = pickRandom(results.length ? results : movies);
    if (!pick) return;
    sfx("portal");
    router.push(`/movie/${pick.id}`);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-32 pt-32 md:px-12">
      <p className="display text-[11px] tracking-[0.4em] text-[#f5c46b]">Explore</p>
      <h1 className="display mt-2 text-4xl font-extrabold md:text-5xl">Find your next world</h1>

      <div className="glass sticky top-[64px] z-30 mt-8 rounded-3xl p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Search movies</span>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#f5c46b]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, genres, tags, descriptions…"
              className="w-full rounded-full border border-white/10 bg-black/30 py-3 pl-11 pr-10 text-sm outline-none placeholder:text-white/35 focus:border-[#f5c46b]/70"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                <X size={15} />
              </button>
            )}
          </label>
          <label className="text-xs text-white/60">
            <span className="sr-only">Availability</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="rounded-full border border-white/10 bg-[#0a0f2c] px-4 py-3 text-sm text-white outline-none focus:border-[#f5c46b]/70">
              <option value="all">All movies</option>
              <option value="playable">Playable now</option>
              <option value="unavailable">Not yet available</option>
            </select>
          </label>
          <label className="text-xs text-white/60">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-full border border-white/10 bg-[#0a0f2c] px-4 py-3 text-sm text-white outline-none focus:border-[#f5c46b]/70">
              {SORTS.map(([k, label]) => (
                <option key={k} value={k}>
                  Sort: {label}
                </option>
              ))}
            </select>
          </label>
          <button onClick={random} className="btn-ghost !px-4 !py-3" aria-label="Random movie">
            <Dices size={15} /> Random
          </button>
          {dirty && (
            <button onClick={reset} className="btn-ghost !px-4 !py-3">
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
          <button data-active={genre === "all"} onClick={() => setGenre("all")} className="chip">
            All genres
          </button>
          {collections.map((c) => (
            <button key={c.slug} data-active={genre === c.slug} onClick={() => setGenre(genre === c.slug ? "all" : c.slug)} className="chip">
              {c.label} · {c.movies.length}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-white/55" aria-live="polite">
        {results.length} {results.length === 1 ? "movie" : "movies"}
        {q.trim() ? ` matching “${q.trim()}”` : ""}
      </p>

      {results.length === 0 ? (
        <div className="glass mt-8 rounded-3xl p-12 text-center">
          <p className="display text-xl">No worlds match</p>
          <p className="mt-2 text-sm text-white/55">Try a different search or clear the filters.</p>
          <button onClick={reset} className="btn-primary mt-6">
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {results.map((m, i) => (
            <WorldCard key={m.id} movie={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
