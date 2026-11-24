"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Captions, Info, Loader2, Maximize2, Minimize2, RefreshCw, TriangleAlert, X } from "lucide-react";
import { formatRuntime, movieEntryUrl, type Movie } from "@/lib/movies";
import { recordOpen, recordProgress, useReducedMotionPref } from "@/lib/storage";

// The viewing shell. The movie keeps running as its own independent application inside a same-origin iframe.
// Hub <-> movie communication follows the documented "movie-universe/1" postMessage protocol:
//   movie -> hub : { protocol, type: "ready" | "progress" | "ended", position?, duration? }
//   hub -> movie : { protocol, type: "hello" | "subtitles", ... }
// The hub never assumes the movie reports anything: progress is recorded only when it is actually received.

const PROTOCOL = "movie-universe/1";
const LOAD_TIMEOUT_MS = 30000;

type Phase = "checking" | "loading" | "ready" | "error";

export default function Viewer({ movie }: { movie: Movie }) {
  const reduced = useReducedMotionPref();
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const lastSaved = useRef(0);
  const [phase, setPhase] = useState<Phase>("checking");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [curtain, setCurtain] = useState(!reduced);
  const [info, setInfo] = useState(false);
  const [fs, setFs] = useState(false);
  const [subs, setSubs] = useState("off");
  const [subsOpen, setSubsOpen] = useState(false);

  const src = movieEntryUrl(movie);
  const isVideo = movie.type === "video" && !!movie.video;

  useEffect(() => {
    recordOpen(movie.id);
  }, [movie.id]);

  // Cinematic entrance curtain.
  useEffect(() => {
    if (!curtain) return;
    const t = setTimeout(() => setCurtain(false), 1700);
    return () => clearTimeout(t);
  }, [curtain]);

  // Pre-flight: confirm the hosted entry file exists so a broken deployment never shows a blank iframe.
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("checking");
    setError("");
    if (isVideo) {
      if (movie.video?.format === "hls" && !document.createElement("video").canPlayType("application/vnd.apple.mpegurl")) {
        setError("HLS streams need a browser with native HLS support. Try Safari, or provide an MP4/WebM version.");
        setPhase("error");
      } else setPhase("loading");
      return;
    }
    fetch(src.split("#")[0].split("?")[0], { method: "HEAD", cache: "no-store" })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) {
          setError(`The movie's files could not be found on this deployment (HTTP ${r.status}). The movie may not have been built yet.`);
          setPhase("error");
        } else setPhase("loading");
      })
      .catch(() => {
        if (cancelled) return;
        setError("The movie could not be reached. Check your connection and try again.");
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [src, attempt, isVideo, movie.video?.format]);

  // Load timeout.
  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(() => {
      setError("The movie is taking unusually long to start. It may be very large, or something went wrong.");
      setPhase("error");
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [phase, attempt]);

  const post = useCallback(
    (message: Record<string, unknown>) => {
      frameRef.current?.contentWindow?.postMessage({ protocol: PROTOCOL, ...message }, window.location.origin);
    },
    [],
  );

  // Origin-validated messages from the embedded movie.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return;
      const d = e.data as { protocol?: string; type?: string; position?: number; duration?: number } | null;
      if (!d || d.protocol !== PROTOCOL) return;
      if (d.type === "ready") {
        setPhase("ready");
        post({ type: "hello", movieId: movie.id, subtitles: subs === "off" ? null : subs });
      } else if (movie.progress && d.type === "progress" && typeof d.position === "number" && typeof d.duration === "number") {
        const now = Date.now();
        if (now - lastSaved.current > 2000) {
          lastSaved.current = now;
          recordProgress(movie.id, d.position, d.duration);
        }
      } else if (movie.progress && d.type === "ended") {
        const dur = typeof d.duration === "number" ? d.duration : 1;
        recordProgress(movie.id, dur, dur, true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [movie.id, movie.progress, post, subs]);

  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  const toggleFs = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen();
    } catch {
      /* some browsers (iOS Safari) do not allow element fullscreen: the viewer already fills the screen */
    }
  };

  const retry = () => {
    setPhase("checking");
    setAttempt((a) => a + 1);
  };

  const chooseSubs = (lang: string) => {
    setSubs(lang);
    setSubsOpen(false);
    post({ type: "subtitles", lang: lang === "off" ? null : lang });
  };

  const runtime = formatRuntime(movie.runtime);
  const showFrame = phase === "loading" || phase === "ready";

  return (
    <div ref={stageRef} className="fixed inset-0 z-[60] flex flex-col bg-black" style={{ ["--b1" as string]: movie.theme.primary }}>
      {/* top bar — in fullscreen it slides away and reveals on hover at the top edge */}
      <div className="group/zone absolute inset-x-0 top-0 z-30 h-3 hover:h-auto focus-within:h-auto data-[fs=false]:static data-[fs=false]:h-auto" data-fs={fs}>
        <div className="flex h-[52px] items-center gap-2 border-b border-white/10 bg-[#050714]/95 px-3 backdrop-blur-xl transition-transform duration-300 group-data-[fs=true]/zone:-translate-y-full group-data-[fs=true]/zone:group-hover/zone:translate-y-0 group-data-[fs=true]/zone:group-focus-within/zone:translate-y-0 md:px-5">
          <Link href="/" className="btn-ghost !gap-2 !px-3 !py-2 !text-[11px]" aria-label="Back to Movie Universe">
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Movie Universe</span>
          </Link>
          <h1 className="display min-w-0 flex-1 truncate text-center text-xs font-bold tracking-[0.18em] md:text-sm">{movie.title}</h1>
          <div className="flex items-center gap-1.5">
            {movie.subtitles.length > 0 && (
              <div className="relative">
                <button onClick={() => setSubsOpen((v) => !v)} aria-expanded={subsOpen} aria-label="Subtitles" className="glass grid h-9 w-9 place-items-center rounded-full">
                  <Captions size={16} className={subs !== "off" ? "text-[#f5c46b]" : ""} />
                </button>
                {subsOpen && (
                  <ul className="glass absolute right-0 top-11 z-40 min-w-40 rounded-xl p-1.5 text-sm" role="menu">
                    {[{ lang: "off", label: "Off" }, ...movie.subtitles].map((s) => (
                      <li key={s.lang}>
                        <button role="menuitemradio" aria-checked={subs === s.lang} onClick={() => chooseSubs(s.lang)} className={`w-full rounded-lg px-3 py-2 text-left hover:bg-white/10 ${subs === s.lang ? "text-[#f5c46b]" : ""}`}>
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <button onClick={retry} aria-label="Reload movie" title="Reload movie" className="glass grid h-9 w-9 place-items-center rounded-full">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => setInfo((v) => !v)} aria-pressed={info} aria-label="Movie information" className="glass grid h-9 w-9 place-items-center rounded-full">
              <Info size={16} className={info ? "text-[#f5c46b]" : ""} />
            </button>
            <button onClick={toggleFs} aria-label={fs ? "Exit fullscreen" : "Enter fullscreen"} className="glass grid h-9 w-9 place-items-center rounded-full">
              {fs ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* stage */}
      <div className="relative min-h-0 flex-1 bg-black">
        {showFrame && !isVideo && (
          <iframe
            key={attempt}
            ref={frameRef}
            src={src}
            title={`${movie.title} — movie`}
            className="absolute inset-0 h-full w-full border-0 bg-black"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-popups allow-modals allow-downloads"
            allow="fullscreen; autoplay; gamepad; accelerometer; gyroscope; xr-spatial-tracking; clipboard-write"
            referrerPolicy="same-origin"
            onLoad={() => setPhase((p) => (p === "loading" ? "ready" : p))}
          />
        )}
        {showFrame && isVideo && movie.video && (
          <video
            key={attempt}
            className="absolute inset-0 h-full w-full bg-black"
            src={movie.video.src}
            controls
            playsInline
            autoPlay
            onCanPlay={() => setPhase("ready")}
            onError={() => {
              setError("The video file could not be loaded.");
              setPhase("error");
            }}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              const now = Date.now();
              if (now - lastSaved.current > 2000) {
                lastSaved.current = now;
                recordProgress(movie.id, v.currentTime, v.duration);
              }
            }}
            onEnded={(e) => recordProgress(movie.id, e.currentTarget.duration, e.currentTarget.duration, true)}
          >
            {movie.subtitles
              .filter((s) => s.src)
              .map((s) => (
                <track key={s.lang} kind="subtitles" srcLang={s.lang} label={s.label} src={s.src} default={s.lang === subs} />
              ))}
          </video>
        )}

        {/* loading */}
        <AnimatePresence>
          {(phase === "checking" || phase === "loading") && !curtain && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#02030a]" role="status" aria-live="polite">
              <div className="text-center">
                <div className="relative mx-auto h-24 w-24">
                  <span className="absolute inset-0 rounded-full border-2 border-[#f5c46b]/30" />
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#f5c46b]" />
                  <span className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-b-[var(--b1)] [animation-direction:reverse] [animation-duration:1.6s]" />
                  <Loader2 className="absolute inset-0 m-auto text-white/40" size={20} />
                </div>
                <p className="display mt-6 text-sm tracking-[0.3em]">{movie.title}</p>
                <p className="mt-2 text-xs text-white/50">Opening the world… large 3D movies can take a moment.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* error */}
        {phase === "error" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#02030a] p-6" role="alert">
            <div className="glass max-w-md rounded-3xl p-8 text-center">
              <TriangleAlert className="mx-auto text-[#f5c46b]" size={36} />
              <h2 className="display mt-4 text-lg">This world won&apos;t open</h2>
              <p className="mt-3 text-sm text-white/65">{error}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={retry} className="btn-primary">
                  <RefreshCw size={14} /> Retry
                </button>
                <Link href={`/movie/${movie.id}`} className="btn-ghost">
                  Movie details
                </Link>
                <Link href="/" className="btn-ghost">
                  Back home
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* info panel */}
        <AnimatePresence>
          {info && (
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 240 }} className="glass absolute inset-y-0 right-0 z-20 w-[min(92vw,380px)] overflow-auto rounded-l-3xl p-6" aria-label="Movie information">
              <button onClick={() => setInfo(false)} aria-label="Close information" className="absolute right-4 top-4 text-white/60 hover:text-white">
                <X size={18} />
              </button>
              <h2 className="display pr-8 text-xl font-extrabold">{movie.title}</h2>
              {movie.tagline && <p className="mt-1 text-sm italic text-[#ffe3a6]/80">{movie.tagline}</p>}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {movie.genre.map((g) => (
                  <span key={g} className="chip">
                    {g}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-white/50">{[movie.releaseYear, runtime].filter(Boolean).join(" · ")}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/75">{movie.synopsis}</p>
              <p className="mt-6 text-xs text-white/40">
                {movie.progress ? "This movie reports playback progress to Movie Universe." : "This movie does not report playback progress, so none is shown."}
              </p>
              <Link href={`/movie/${movie.id}`} className="btn-ghost mt-6 w-full justify-center">
                Open details page
              </Link>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* cinematic entrance curtain */}
        <AnimatePresence>
          {curtain && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-[#02030a]"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.4, filter: "blur(12px)", transition: { duration: 0.8 } }}
            >
              <motion.div className="absolute h-[140vmax] w-[140vmax] rounded-full" style={{ background: `radial-gradient(circle, transparent 0%, transparent 8%, ${movie.theme.primary}55 14%, transparent 30%)` }} initial={{ scale: 0.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
              <div className="relative text-center">
                <motion.p initial={{ opacity: 0, letterSpacing: "0.8em" }} animate={{ opacity: 1, letterSpacing: "0.4em" }} transition={{ duration: 1.1 }} className="display text-[11px] text-[#f5c46b]">
                  Entering
                </motion.p>
                <motion.h2 initial={{ opacity: 0, y: 20, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.25, duration: 0.9 }} className="display metal-text mt-3 px-4 text-3xl font-extrabold md:text-6xl">
                  {movie.title}
                </motion.h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
