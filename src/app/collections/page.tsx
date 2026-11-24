import type { Metadata } from "next";
import { CollectionBands } from "@/components/ui/Collections";
import { buildCollections } from "@/lib/movies";
import { getMovies } from "@/lib/registry";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  const collections = buildCollections(getMovies());
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-32 pt-32 md:px-12">
      <p className="display text-[11px] tracking-[0.4em] text-[#f5c46b]">Collections</p>
      <h1 className="display mt-2 text-4xl font-extrabold md:text-5xl">Worlds by genre</h1>
      <p className="mt-3 max-w-xl text-sm text-white/55">Generated from real movie metadata. A collection appears the moment a movie with that genre is added.</p>
      <nav aria-label="Jump to collection" className="mt-8 flex flex-wrap gap-2">
        {collections.map((c) => (
          <a key={c.slug} href={`#${c.slug}`} className="chip">
            {c.label}
          </a>
        ))}
      </nav>
      <div className="mt-16">
        {collections.length ? <CollectionBands collections={collections} /> : <p className="glass rounded-3xl p-10 text-center text-white/60">No collections yet — add a movie to movies/.</p>}
      </div>
    </div>
  );
}
