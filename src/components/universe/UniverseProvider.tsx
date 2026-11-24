"use client";

import dynamic from "next/dynamic";
import { Component, createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { MovieTheme } from "@/lib/movies";
import { configureAudio, unlockAudio } from "@/lib/audio";
import { usePrefs, useReducedMotionPref } from "@/lib/storage";
import { BRAND_THEME, rig, type WorldMode } from "./state";

// The 3D scene is lazy-loaded (no SSR) so the first paint never waits for three.js.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

type World = { mode: WorldMode; theme: MovieTheme; poster?: string };
const CALM: World = { mode: "calm", theme: BRAND_THEME };

const WorldContext = createContext<(w: World) => void>(() => {});

/** Pages call this to tell the universe which environment to show. */
export function useWorld(mode: WorldMode, theme?: MovieTheme, poster?: string) {
  const setWorld = useContext(WorldContext);
  const p = theme?.primary;
  const s = theme?.secondary;
  const a = theme?.accent;
  const part = theme?.particles;
  const atm = theme?.atmosphere;
  useEffect(() => {
    const t: MovieTheme = p && s && a && part && atm ? { primary: p, secondary: s, accent: a, particles: part, atmosphere: atm } : BRAND_THEME;
    setWorld({ mode, theme: t, poster });
    return () => setWorld(CALM);
  }, [mode, p, s, a, part, atm, poster, setWorld]);
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[movie-universe] 3D scene disabled, using fallback:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function CssUniverse({ theme }: { theme: MovieTheme }) {
  return (
    <div
      className="css-universe absolute inset-0"
      style={{ ["--c1" as string]: theme.primary, ["--c2" as string]: theme.secondary, ["--c3" as string]: theme.accent }}
    >
      <div className="css-universe-stars" />
      <div className="css-universe-portal" />
    </div>
  );
}

function Background({ world }: { world: World }) {
  const prefs = usePrefs();
  const reduced = useReducedMotionPref();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [dprCap, setDprCap] = useState(1.5);

  useEffect(() => {
    rig.reduced = reduced;
    document.documentElement.dataset.rm = reduced ? "1" : "0";
  }, [reduced]);

  useEffect(() => {
    rig.mobile = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
    rig.quality = prefs.quality === "low" ? "low" : "high";
    setDprCap(rig.mobile || prefs.quality === "low" ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    const t = window.setTimeout(() => setWebgl(detectWebGL()), 30);
    return () => window.clearTimeout(t);
  }, [prefs.quality]);

  useEffect(() => {
    rig.mode = world.mode;
  }, [world.mode]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (rig.mobile) return;
      rig.pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      rig.pointerY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      rig.scroll = window.scrollY;
      rig.vh = window.innerHeight;
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const onDegrade = useCallback(() => {
    rig.degraded = true;
    setDegraded(true);
  }, []);

  const fallback = <CssUniverse theme={world.theme} />;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#02030a]" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(61,70,200,0.28),transparent_60%),radial-gradient(ellipse_at_20%_80%,rgba(120,40,160,0.2),transparent_55%)]" />
      {webgl === false ? (
        fallback
      ) : webgl ? (
        <SceneBoundary fallback={fallback}>
          <Scene key={`${prefs.quality}`} theme={world.theme} poster={world.poster} dpr={degraded ? 1 : dprCap} onDegrade={onDegrade} />
        </SceneBoundary>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,3,10,0.7)_100%)]" />
    </div>
  );
}

function AudioController() {
  const prefs = usePrefs();
  const pathname = usePathname();
  const watching = pathname.startsWith("/watch");

  useEffect(() => {
    configureAudio({ enabled: prefs.soundEnabled, volume: prefs.volume, suspended: watching });
  }, [prefs.soundEnabled, prefs.volume, watching]);

  useEffect(() => {
    if (!prefs.soundEnabled) return;
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [prefs.soundEnabled]);

  return null;
}

export default function UniverseProvider({ children }: { children: ReactNode }) {
  const [world, setWorld] = useState<World>(CALM);
  const set = useCallback((w: World) => setWorld(w), []);
  const value = useMemo(() => set, [set]);
  return (
    <WorldContext.Provider value={value}>
      <Background world={world} />
      <AudioController />
      <div className="relative z-10">{children}</div>
    </WorldContext.Provider>
  );
}
