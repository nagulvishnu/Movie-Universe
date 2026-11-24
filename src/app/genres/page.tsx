import Link from "next/link";
import type { Metadata } from "next";
import { allGenres, matchesGenreSlug } from "@/lib/movies";
import { getMovies } from "@/lib/registry";

export const metadata: Metadata = { title: "Genres" };

export default function GenresPage() {
  const movies = getMovies();
  const genres = allGenres(movies);
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-32 pt-32 md:px-12">
      <p className="display text-[11px] tracking-[0.4em] text-[#f5c46b]">Genres</p>
      <h1 className="display mt-2 text-4xl font-extrabold md:text-5xl">Every signature in the universe</h1>
      <p className="mt-3 max-w-xl text-sm text-white/55">Every genre tag found in the movie manifests, with the movies that carry it.</p>
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {genres.map((g) => {
          const list = movies.filter((m) => matchesGenreSlug(m, g.slug));
          return (
            <li key={g.slug}>
              <Link href={`/explore?genre=${g.slug}`} className="glass holo-border group block rounded-3xl p-6 transition hover:-translate-y-1.5 hover:bg-white/5">
                <div className="flex items-baseline justify-between">
                  <h2 className="display text-xl font-bold">{g.name}</h2>
                  <span className="text-xs uppercase tracking-widest text-[#f5c46b]">
                    {g.count} {g.count === 1 ? "movie" : "movies"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/55">{list.map((m) => m.title).join(" · ")}</p>
                <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-white/40 transition group-hover:text-[#f5c46b]">Browse →</p>
              </Link>
            </li>
          );
        })}
      </ul>
      {genres.length === 0 && <p className="glass mt-10 rounded-3xl p-10 text-center text-white/60">No genres discovered yet.</p>}
    </div>
  );
}
