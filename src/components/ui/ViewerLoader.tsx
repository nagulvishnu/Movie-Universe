"use client";

import dynamic from "next/dynamic";
import type { Movie } from "@/lib/movies";

// The viewing shell is only downloaded when someone actually opens a movie.
const Viewer = dynamic(() => import("./Viewer"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#02030a]" role="status">
      <p className="display text-xs tracking-[0.4em] text-white/60">Opening portal…</p>
    </div>
  ),
});

export default function ViewerLoader({ movie }: { movie: Movie }) {
  return <Viewer movie={movie} />;
}
