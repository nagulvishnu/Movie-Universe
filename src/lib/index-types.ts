import type { Movie } from "@/lib/movies";

/** Light projection of the registry that is shipped to every page (search palette, random pick). */
export type IndexItem = Pick<Movie, "id" | "title" | "tagline" | "synopsis" | "description" | "genre" | "tags" | "status"> & {
  primary: string;
  secondary: string;
};

export function pickRandom<T extends { id: string; status: string }>(index: T[], excludeId?: string): T | null {
  const playable = index.filter((m) => m.status === "ready" && m.id !== excludeId);
  const pool = playable.length ? playable : index.filter((m) => m.id !== excludeId);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
