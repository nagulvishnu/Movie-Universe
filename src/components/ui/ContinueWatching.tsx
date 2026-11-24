"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Play, X } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { removeFromHistory, useBookmarks, useHistory } from "@/lib/storage";
import { sfx } from "@/lib/audio";
import MiniCard from "./MiniCard";
import WorldArt from "./WorldArt";

function ago(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

export function useWatched(movies: Movie[]) {
  const history = useHistory();
  return useMemo(
    () =>
      movies
        .filter((m) => history[m.id])
        .sort((a, b) => history[b.id].lastOpened - history[a.id].lastOpened),
    [movies, history],
  );
}

/** Progress bars only appear for movies that really reported progress through the postMessage protocol. */
export default function ContinueWatching({ movies, full = false }: { movies: Movie[]; full?: boolean }) {
  const history = useHistory();
  const watched = useWatched(movies.filter((m) => m.status === "ready"));
  const bookmarks = useBookmarks();
  const saved = movies.filter((m) => bookmarks.includes(m.id));

  if (!full && watched.length === 0) return null;

  return (
    <div>
      {watched.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-white/65">
          <p className="display text-lg">Nothing in progress</p>
          <p className="mt-2 text-sm">Movies you open will appear here so you can jump straight back in.</p>
          <Link href="/explore" className="btn-primary mt-6">
            Explore movies
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {watched.map((m) => {
            const h = history[m.id];
            const reliable = m.progress && h.position !== undefined && h.duration;
            return (
              <li key={m.id} className="glass holo-border relative overflow-hidden rounded-2xl" style={{ ["--b1" as string]: m.theme.primary, ["--b2" as string]: m.theme.accent }}>
                <div className="relative h-36">
                  <WorldArt movie={m} kind="backdrop" className="h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02030a] to-transparent" />
                  <button
                    onClick={() => removeFromHistory(m.id)}
                    aria-label={`Remove ${m.title} from continue watching`}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white/70 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="display text-sm font-bold">{m.title}</h3>
                  <p className="mt-1 text-xs text-white/50">
                    Opened {ago(h.lastOpened)}
                    {h.opens > 1 ? ` · ${h.opens} times` : ""}
                    {h.completed ? " · Finished" : ""}
                  </p>
                  {reliable && !h.completed && (
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={Math.round(((h.position ?? 0) / (h.duration ?? 1)) * 100)} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full bg-[#f5c46b]" style={{ width: `${Math.min(100, ((h.position ?? 0) / (h.duration ?? 1)) * 100)}%` }} />
                    </div>
                  )}
                  <Link href={m.watchUrl} onClick={() => sfx("portal")} className="btn-primary mt-4 !px-5 !py-2.5">
                    <Play size={13} fill="currentColor" /> {reliable && !h.completed ? "Resume" : h.completed ? "Watch again" : "Open again"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {full && (
        <section className="mt-16">
          <h2 className="display text-xl">My List</h2>
          {saved.length === 0 ? (
            <p className="mt-3 text-sm text-white/55">Use the bookmark button on any movie to save it here.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {saved.map((m) => (
                <MiniCard key={m.id} movie={m} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
