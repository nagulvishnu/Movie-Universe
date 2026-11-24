import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailView from "@/components/ui/DetailView";
import { relatedMovies } from "@/lib/movies";
import { getDiagnostics, getMovie, getMovies } from "@/lib/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return getMovies().map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const movie = getMovie((await params).id);
  return movie ? { title: movie.title, description: movie.synopsis } : {};
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const movie = getMovie((await params).id);
  if (!movie) notFound();
  return <DetailView movie={movie} related={relatedMovies(movie, getMovies(), 3)} diagnostics={getDiagnostics()} />;
}
