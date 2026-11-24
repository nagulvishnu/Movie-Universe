import type { Metadata } from "next";
import ContinueWatching from "@/components/ui/ContinueWatching";
import { getMovies } from "@/lib/registry";

export const metadata: Metadata = { title: "Continue Watching" };

export default function ContinuePage() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-32 pt-32 md:px-12">
      <p className="display text-[11px] tracking-[0.4em] text-[#f5c46b]">Your journey</p>
      <h1 className="display mt-2 text-4xl font-extrabold md:text-5xl">Continue watching</h1>
      <p className="mt-3 max-w-xl text-sm text-white/55">
        Stored privately in this browser only. Progress bars appear only for movies that genuinely report playback progress.
      </p>
      <div className="mt-10">
        <ContinueWatching movies={getMovies()} full />
      </div>
    </div>
  );
}
