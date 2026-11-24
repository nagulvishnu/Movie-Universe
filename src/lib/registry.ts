import "server-only";
import raw from "@/generated/movies.registry.json";
import type { Diagnostic, Movie, Registry } from "@/lib/movies";

const registry = raw as unknown as Registry;
const showDrafts = process.env.NODE_ENV !== "production";

/** Movies visible in the portal. Disabled movies never appear; drafts only appear in development. */
export function getMovies(): Movie[] {
  return registry.movies.filter((m) => m.status !== "disabled" && (showDrafts || m.status !== "draft"));
}

export function getMovie(id: string): Movie | undefined {
  return getMovies().find((m) => m.id === id);
}

export function getDiagnostics(): Diagnostic[] {
  return registry.diagnostics;
}
