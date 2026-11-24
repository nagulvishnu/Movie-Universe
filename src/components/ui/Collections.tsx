"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clapperboard, Compass, Drama, Heart, Landmark, Search, Skull, Sparkles, Swords, Tag, Zap, type LucideIcon } from "lucide-react";
import type { Collection } from "@/lib/movies";
import { sfx } from "@/lib/audio";
import WorldCard from "./WorldCard";

const ICONS: Record<Collection["icon"], LucideIcon> = { Swords, Compass, Skull, Search, Zap, Heart, Drama, Landmark, Sparkles, Clapperboard, Tag };

/** Compact portal tiles — one per collection that actually has movies. */
export function CollectionTiles({ collections }: { collections: Collection[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {collections.map((c, i) => {
        const Icon = ICONS[c.icon];
        return (
          <motion.li key={c.slug} initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 5) * 0.06 }}>
            <Link
              href={`/explore?genre=${c.slug}`}
              onPointerEnter={() => sfx("hover")}
              onClick={() => sfx("click")}
              className="group relative block aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 p-5 transition duration-500 hover:-translate-y-1.5 hover:border-white/40"
              style={{ background: `radial-gradient(circle at 80% 10%, ${c.from}aa, transparent 55%), linear-gradient(160deg, ${c.to}, #02030a)` }}
            >
              <Icon size={64} className="absolute -right-3 -top-3 opacity-20 transition duration-700 group-hover:rotate-12 group-hover:scale-125" style={{ color: c.from }} />
              <div className="relative flex h-full flex-col justify-end">
                <p className="display text-base font-extrabold md:text-lg">{c.label}</p>
                <p className="mt-1 hidden text-xs text-white/65 md:block">{c.blurb}</p>
                <p className="mt-2 text-[11px] uppercase tracking-widest text-white/60">
                  {c.movies.length} {c.movies.length === 1 ? "movie" : "movies"}
                </p>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** Full-width, visually distinct collection bands. */
export function CollectionBands({ collections }: { collections: Collection[] }) {
  return (
    <div className="space-y-20">
      {collections.map((c) => {
        const Icon = ICONS[c.icon];
        return (
          <section key={c.slug} id={c.slug} className="relative scroll-mt-28">
            <div className="pointer-events-none absolute -inset-x-6 -top-8 bottom-0 -z-10 rounded-[3rem] opacity-40 blur-2xl" style={{ background: `radial-gradient(ellipse at 15% 0%, ${c.from}66, transparent 60%)` }} />
            <div className="mb-8 flex items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15" style={{ background: `linear-gradient(135deg, ${c.from}55, ${c.to})` }}>
                  <Icon size={26} style={{ color: c.from }} />
                </span>
                <div>
                  <h2 className="display text-2xl font-extrabold md:text-3xl">{c.label}</h2>
                  <p className="text-sm text-white/55">{c.blurb}</p>
                </div>
              </div>
              <Link href={`/explore?genre=${c.slug}`} className="chip">
                Filter in Explore
              </Link>
            </div>
            <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
              {c.movies.map((m, i) => (
                <WorldCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
