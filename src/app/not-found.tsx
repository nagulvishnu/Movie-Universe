import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-24 text-center">
      <div className="glass holo-border max-w-lg rounded-3xl p-10">
        <p className="display text-[11px] tracking-[0.4em] text-[#f5c46b]">Error 404</p>
        <h1 className="display metal-text mt-3 text-3xl font-extrabold">This dimension doesn&apos;t exist</h1>
        <p className="mt-4 text-sm text-white/65">The page or movie you were looking for isn&apos;t part of Movie Universe. It may have been removed, or it was never added.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to the portal
          </Link>
          <Link href="/explore" className="btn-ghost">
            Explore movies
          </Link>
        </div>
      </div>
    </main>
  );
}
