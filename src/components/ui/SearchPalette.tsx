"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search, X } from "lucide-react";
import type { IndexItem } from "@/lib/index-types";
import { searchMovies, type Movie } from "@/lib/movies";
import { sfx } from "@/lib/audio";

export default function SearchPalette({ index }: { index: IndexItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = () => {
      setQ("");
      setActive(0);
      setOpen(true);
    };
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        show();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        show();
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mu:open-search", show);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("mu:open-search", show);
      window.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = useMemo(() => searchMovies(index as unknown as Movie[], q).slice(0, 6) as unknown as IndexItem[], [index, q]);

  const go = (path: string) => {
    sfx("click");
    setOpen(false);
    router.push(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search movies"
            initial={{ y: -20, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -20, scale: 0.97 }}
            className="glass holo-border w-full max-w-xl rounded-3xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (results[active] && q.trim()) go(`/movie/${results[active].id}`);
                else go(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : "/explore");
              }}
              className="flex items-center gap-3 px-2"
            >
              <Search size={18} className="text-[#f5c46b]" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  }
                }}
                placeholder="Search titles, genres, tags, descriptions…"
                aria-label="Search"
                className="w-full bg-transparent py-3 text-base text-white outline-none placeholder:text-white/40"
              />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </form>
            <ul className="mt-2 max-h-[50vh] overflow-auto">
              {results.map((m, i) => (
                <li key={m.id}>
                  <button
                    onClick={() => go(`/movie/${m.id}`)}
                    onPointerEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition ${i === active ? "bg-white/10" : ""}`}
                  >
                    <span className="h-12 w-9 shrink-0 rounded-md border border-white/15" style={{ background: `linear-gradient(160deg, ${m.primary}, ${m.secondary})` }} />
                    <span className="min-w-0 flex-1">
                      <span className="display block truncate text-sm">{m.title}</span>
                      <span className="block truncate text-xs text-white/55">{m.genre.join(" · ")}</span>
                    </span>
                    {i === active && <CornerDownLeft size={14} className="text-white/50" />}
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-white/55">No worlds match “{q}”. Press Enter to search the full catalogue.</li>}
            </ul>
            <div className="flex justify-between border-t border-white/10 px-2 pt-3 text-[11px] text-white/45">
              <span>↑↓ navigate · Enter open · Esc close</span>
              <button onClick={() => go(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : "/explore")} className="hover:text-[#f5c46b]">
                See all results →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
