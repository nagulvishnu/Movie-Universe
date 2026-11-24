"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dices, Menu, Orbit, Search, SlidersHorizontal, Volume2, VolumeX, X } from "lucide-react";
import { sfx, unlockAudio } from "@/lib/audio";
import { introStore, setPrefs, useIntroState, usePrefs } from "@/lib/storage";
import { pickRandom, type IndexItem } from "@/lib/index-types";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/movies", label: "Movies" },
  { href: "/genres", label: "Genres" },
  { href: "/collections", label: "Collections" },
  { href: "/continue", label: "Continue Watching" },
  { href: "/about", label: "About" },
];

export function openSearch() {
  window.dispatchEvent(new Event("mu:open-search"));
}

function AtmospherePanel({ onClose }: { onClose: () => void }) {
  const prefs = usePrefs();
  const router = useRouter();
  const toggleSound = () => {
    if (prefs.soundEnabled) setPrefs({ soundEnabled: false });
    else {
      setPrefs({ soundEnabled: true });
      unlockAudio();
      setTimeout(() => sfx("portal"), 80);
    }
  };
  const seg = <K extends "reducedMotion" | "quality">(key: K, options: [string, string][]) => (
    <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => setPrefs({ [key]: v } as never)}
          aria-pressed={prefs[key] === v}
          className={`flex-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${prefs[key] === v ? "bg-[#f5c46b] text-black" : "text-white/70 hover:text-white"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass absolute right-0 top-full z-50 mt-3 w-[min(92vw,320px)] rounded-2xl p-5"
      role="dialog"
      aria-label="Atmosphere settings"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="display text-xs text-[#f5c46b]">Atmosphere</h2>
        <button onClick={onClose} aria-label="Close settings" className="text-white/60 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="space-y-4 text-sm">
        <div>
          <button onClick={toggleSound} aria-pressed={prefs.soundEnabled} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3 hover:border-[#f5c46b]/60">
            <span className="flex items-center gap-2">{prefs.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} Portal sound</span>
            <span className={prefs.soundEnabled ? "text-[#f5c46b]" : "text-white/50"}>{prefs.soundEnabled ? "On" : "Off"}</span>
          </button>
          <label className="mt-3 block text-[11px] uppercase tracking-wider text-white/60">
            Master volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={prefs.volume}
              onChange={(e) => setPrefs({ volume: Number(e.target.value) })}
              className="mt-2 w-full accent-[#f5c46b]"
              aria-label="Master volume"
            />
          </label>
          <p className="mt-1 text-[11px] text-white/45">Audio is silenced automatically while a movie plays.</p>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-white/60">Reduced motion</p>
          {seg("reducedMotion", [["system", "System"], ["on", "On"], ["off", "Off"]])}
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-white/60">3D quality</p>
          {seg("quality", [["auto", "Auto"], ["low", "Low"], ["high", "High"]])}
        </div>
        <button
          onClick={() => {
            setPrefs({ introSeen: false });
            introStore.set(() => ({ state: "pending" }));
            onClose();
            router.push("/");
          }}
          className="w-full rounded-xl border border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-white/80 hover:border-[#f5c46b]/60"
        >
          Replay intro
        </button>
      </div>
    </motion.div>
  );
}

export default function Nav({ index }: { index: IndexItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const intro = useIntroState();
  const prefs = usePrefs();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setOpen(false);
      setPanel(false);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  const watching = pathname.startsWith("/watch");
  if (watching) return null; // the viewing shell has its own minimal chrome

  const gated = pathname === "/" && intro !== "done";
  const random = () => {
    const pick = pickRandom(index);
    if (!pick) return;
    sfx("portal");
    router.push(`/movie/${pick.id}`);
  };
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`intro-gated fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${scrolled || open ? "bg-[#02030a]/70 backdrop-blur-xl" : "bg-gradient-to-b from-[#02030a]/80 to-transparent"}`}
      data-hidden={gated}
    >
      <nav aria-label="Primary" className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link href="/" onClick={() => sfx("click")} className="group flex items-center gap-3" aria-label="Movie Universe home">
          <span className="relative grid h-9 w-9 place-items-center rounded-full border border-[#f5c46b]/60 bg-black/40">
            <Orbit size={18} className="text-[#f5c46b] transition-transform duration-700 group-hover:rotate-180" />
            <span className="absolute inset-0 rounded-full shadow-[0_0_18px_rgba(245,196,107,0.45)]" />
          </span>
          <span className="display text-sm font-extrabold leading-none tracking-[0.22em]">
            Movie<span className="text-[#f5c46b]"> Universe</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-0.5 xl:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onPointerEnter={() => sfx("hover")}
                onClick={() => sfx("click")}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${isActive(l.href) ? "text-[#ffe3a6]" : "text-white/70 hover:text-white"}`}
              >
                {l.label}
                {isActive(l.href) && <motion.span layoutId="nav-glow" className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-[#f5c46b] to-transparent" />}
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative flex items-center gap-1.5">
          <button onClick={openSearch} className="glass flex items-center gap-2 rounded-full px-3.5 py-2 text-xs text-white/80 hover:text-white" aria-label="Search movies (Ctrl+K)">
            <Search size={15} />
            <span className="hidden text-[11px] uppercase tracking-wider md:inline">Search</span>
            <kbd className="hidden rounded border border-white/15 px-1.5 text-[10px] text-white/50 lg:inline">Ctrl K</kbd>
          </button>
          <button onClick={random} className="glass grid h-9 w-9 place-items-center rounded-full text-white/80 hover:text-[#f5c46b]" aria-label="Random movie" title="Random movie">
            <Dices size={16} />
          </button>
          <button
            onClick={() => setPanel((v) => !v)}
            className="glass grid h-9 w-9 place-items-center rounded-full text-white/80 hover:text-[#f5c46b]"
            aria-label="Atmosphere settings"
            aria-expanded={panel}
            title="Sound & motion"
          >
            {prefs.soundEnabled ? <SlidersHorizontal size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={() => setOpen((v) => !v)} className="glass grid h-9 w-9 place-items-center rounded-full xl:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
          <AnimatePresence>{panel && <AtmospherePanel onClose={() => setPanel(false)} />}</AnimatePresence>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/10 xl:hidden">
            <ul className="mx-auto grid max-w-xl gap-1 px-5 py-4">
              {LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={`display block rounded-xl px-4 py-3 text-sm ${isActive(l.href) ? "bg-[#f5c46b]/15 text-[#ffe3a6]" : "text-white/80 active:bg-white/10"}`}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
