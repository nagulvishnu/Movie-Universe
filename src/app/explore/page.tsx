import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogBrowser from "@/components/ui/CatalogBrowser";
import { getMovies } from "@/lib/registry";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="grid min-h-[60vh] place-items-center pt-32 text-white/50">Scanning the multiverse…</div>}>
      <CatalogBrowser movies={getMovies()} />
    </Suspense>
  );
}
