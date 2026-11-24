"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { formatRuntime, STATUS_LABEL, type Movie } from "@/lib/movies";
import { sfx } from "@/lib/audio";
import WorldArt from "./WorldArt";
import BookmarkButton from "./BookmarkButton";

/** Compact landscape movie tile used in lists, tabs and related rows. */
export default function MiniCard({ movie, note, progress }: { movie: Movie; note?: string; progress?: number }) {
  const runtime = formatRuntime(movie.runtime);
  const playable = movie.status === "ready";
  return (
    <div className="glass holo-border group relative flex gap-4 rounded-2xl p-3 transition hover:-translate-y-1 hover:bg-white/5" style={{ ["--b1" as string]: movie.theme.primary, ["--b2" as string]: movie.theme.accent }}>
      <Link href={`/movie/${movie.id}`} onPointerEnter={() => sfx("hover")} onClick={() => sfx("click")} className="absolute inset-0 z-10 rounded-2xl" aria-label={`${movie.title}: view details`} />
      <WorldArt movie={movie} className="h-28 w-20 shrink-0 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="display truncate text-sm font-bold">{movie.title}</h3>
          <p className="mt-1 truncate text-[11px] uppercase tracking-wider text-white/50">{movie.genre.slice(0, 3).join(" · ")}</p>
          <p className="mt-1.5 text-[11px] text-white/45">
            {[movie.releaseYear, runtime, note, !playable ? STATUS_LABEL[movie.status] : null].filter(Boolean).join(" · ")}
          </p>
        </div>
        {progress !== undefined && (
          <div className="h-1 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-[#f5c46b]" style={{ width: `${Math.min(100, progress * 100)}%` }} />
          </div>
        )}
      </div>
      <div className="relative z-20 flex flex-col items-end justify-between">
        <BookmarkButton id={movie.id} />
        {playable && (
          <Link href={movie.watchUrl} onClick={() => sfx("portal")} aria-label={`Watch ${movie.title}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#f5c46b] text-black transition hover:scale-110">
            <Play size={14} fill="currentColor" />
          </Link>
        )}
      </div>
    </div>
  );
}
