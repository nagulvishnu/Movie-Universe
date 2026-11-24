import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, CircleSlash, FileWarning, Hourglass } from "lucide-react";
import WorldCard from "@/components/ui/WorldCard";
import { STATUS_LABEL, type MovieStatus } from "@/lib/movies";
import { getDiagnostics, getMovies } from "@/lib/registry";

export const metadata: Metadata = { title: "Movies" };

const ICON: Record<MovieStatus, typeof CheckCircle2> = {
  ready: CheckCircle2,
  unbuilt: Hourglass,
  missing: CircleDashed,
  invalid: FileWarning,
  draft: CircleDashed,
  disabled: CircleSlash,
};

export default function MoviesPage() {
  const movies = getMovies();
  const diagnostics = getDiagnostics();
  const live = movies.filter((m) => m.status === "ready");
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-32 pt-32 md:px-12">
      <p className="display text-[11px] tracking-[0.4em] text-[#f5c46b]">Library</p>
      <h1 className="display mt-2 text-4xl font-extrabold md:text-5xl">All movies</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        The complete library as discovered at build time from <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">movies/*/movie.json</code>. Nothing here is guessed: every status below comes from the generated registry.
      </p>

      <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {movies.map((m, i) => (
          <WorldCard key={m.id} movie={m} index={i} />
        ))}
      </div>

      <section className="mt-28" aria-labelledby="report">
        <h2 id="report" className="display text-2xl font-extrabold">
          Discovery report
        </h2>
        <p className="mt-2 text-sm text-white/55">
          {live.length} of {movies.length} movies are playable.
        </p>
        <div className="glass mt-6 overflow-hidden rounded-3xl">
          <ul className="divide-y divide-white/10">
            {movies.map((m) => {
              const Icon = ICON[m.status];
              return (
                <li key={m.id} className="flex flex-wrap items-start gap-4 px-5 py-4 md:px-7">
                  <Icon size={20} className={m.status === "ready" ? "mt-0.5 text-emerald-300" : m.status === "invalid" ? "mt-0.5 text-red-300" : "mt-0.5 text-[#f5c46b]"} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/movie/${m.id}`} className="display text-sm font-bold hover:text-[#f5c46b]">
                      {m.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-white/45">
                      <code>movies/{m.id}/</code> · {m.framework ?? m.build?.adapter ?? m.type}
                    </p>
                    {m.status !== "ready" && <p className="mt-1.5 text-xs text-white/65">{m.statusReason}</p>}
                  </div>
                  <span className="chip">{STATUS_LABEL[m.status]}</span>
                </li>
              );
            })}
          </ul>
        </div>
        {diagnostics.length > 0 && (
          <div className="glass mt-6 rounded-3xl p-6">
            <h3 className="display text-sm">Diagnostics</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-white/65">
              {diagnostics.map((d, i) => (
                <li key={i}>
                  <span className={d.level === "error" ? "text-red-300" : "text-amber-200"}>{d.level}</span> · <code>{d.folder}</code>: {d.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
