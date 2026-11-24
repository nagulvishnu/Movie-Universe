import Link from "next/link";
import type { Metadata } from "next";
import { Boxes, Gauge, MessagesSquare, ScanSearch } from "lucide-react";

export const metadata: Metadata = { title: "About" };

const pillars = [
  { icon: ScanSearch, title: "Automatic discovery", text: "Drop a project into movies/ with a movie.json. Discovery reads only those manifests at build time — never your source files — and generates a typed registry." },
  { icon: Boxes, title: "One deployment", text: "Each movie remains an independent app. Hosted builds live in isolated /movies/<id>/ paths on the same origin, so there are no external URLs to manage." },
  { icon: MessagesSquare, title: "Honest playback", text: "Movies play in a sandboxed viewing shell. Progress is shown only when a movie reports it through the documented, origin-validated postMessage protocol." },
  { icon: Gauge, title: "Built for laptops", text: "One throttled render loop, instanced geometry, adaptive resolution, pause-on-hidden, reduced-motion support and a no-WebGL fallback." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-32 pt-32 md:px-12">
      <p className="display text-[11px] tracking-[0.4em] text-[#f5c46b]">About</p>
      <h1 className="display metal-text mt-2 text-4xl font-extrabold md:text-6xl">One portal. Infinite stories.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
        Movie Universe is a cinematic gateway to independently developed animated web movies. You are not browsing a catalogue — you are stepping through gates into different worlds, each one a complete application of its own.
      </p>
      <p className="mt-3 text-white/50">Enter the worlds. Experience the stories.</p>

      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {pillars.map(({ icon: Icon, title, text }) => (
          <li key={title} className="glass holo-border rounded-3xl p-7">
            <Icon className="text-[#f5c46b]" />
            <h2 className="display mt-4 text-lg">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
          </li>
        ))}
      </ul>

      <section className="glass mt-14 rounded-3xl p-8">
        <h2 className="display text-xl">Privacy</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          There is no account and no tracking database. Your watch history, My List and preferences are saved only in this browser&apos;s local storage, and you can clear them at any time by clearing site data. Portal sound is synthesised on your device and only starts after you switch it on.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/explore" className="btn-primary">
          Explore movies
        </Link>
        <Link href="/movies" className="btn-ghost">
          Discovery report
        </Link>
      </div>
    </div>
  );
}
