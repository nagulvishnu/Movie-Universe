import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import ViewerLoader from "@/components/ui/ViewerLoader";
import { STATUS_LABEL } from "@/lib/movies";
import { getDiagnostics, getMovie, getMovies } from "@/lib/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return getMovies().map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const movie = getMovie((await params).id);
  return movie ? { title: `Watch ${movie.title}` } : {};
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const movie = getMovie((await params).id);
  if (!movie) notFound();

  if (movie.status !== "ready") {
    const problems = getDiagnostics().filter((d) => d.folder === movie.id);
    return (
      <main className="grid min-h-screen place-items-center px-6 py-20">
        <div className="glass holo-border max-w-xl rounded-3xl p-8 text-center md:p-10">
          <TriangleAlert className="mx-auto text-[#f5c46b]" size={40} />
          <p className="display mt-5 text-[11px] tracking-[0.4em] text-[#f5c46b]">{STATUS_LABEL[movie.status]}</p>
          <h1 className="display mt-2 text-2xl font-extrabold">{movie.title} can&apos;t be played yet</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">{movie.statusReason}</p>
          {problems.length > 0 && (
            <ul className="mt-4 space-y-1 text-left text-xs text-white/55">
              {problems.map((d, i) => (
                <li key={i}>
                  <span className={d.level === "error" ? "text-red-300" : "text-amber-200"}>{d.level}</span>: {d.message}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/movie/${movie.id}`} className="btn-primary">
              Movie details
            </Link>
            <Link href="/" className="btn-ghost">
              <ArrowLeft size={14} /> Back to Movie Universe
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <ViewerLoader movie={movie} />;
}
