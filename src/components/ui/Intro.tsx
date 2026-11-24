"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { introStore, prefsStore, setIntroState, setPrefs, useIntroState, useReducedMotionPref } from "@/lib/storage";
import { beginActivation, fastForwardActivation } from "@/components/universe/state";
import { sfx } from "@/lib/audio";

const FULL_MS = 4800;

/**
 * Cinematic entrance. First visit: ~4.8s sequence with an always-visible Skip button.
 * Returning visitors (preference remembered in localStorage) get a fast activation instead.
 */
export default function Intro() {
  const intro = useIntroState();
  const reduced = useReducedMotionPref();
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const finish = useCallback((fast: boolean) => {
    window.clearTimeout(timer.current);
    if (fast) fastForwardActivation();
    setPrefs({ introSeen: true });
    setIntroState("done");
    setPlaying(false);
  }, []);

  // Decide once the visitor's stored preference is available (after hydration).
  useEffect(() => {
    if (intro !== "pending") return;
    const seen = prefsStore.get().introSeen;
    if (reduced || seen) {
      beginActivation(reduced ? 0.01 : 0.9);
      setIntroState("done");
      return;
    }
    beginActivation(FULL_MS / 1000 - 0.3);
    setIntroState("playing");
    setPlaying(true);
    sfx("portal");
    timer.current = window.setTimeout(() => finish(false), FULL_MS);
  }, [intro, reduced, finish]);

  useEffect(() => {
    if (!playing) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish(true);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [playing, finish]);

  // If the page is left mid-intro, never leave the session stuck in "playing".
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      if (introStore.get().state === "playing") setIntroState("done");
    },
    [],
  );

  const words = ["MOVIE", "UNIVERSE"];

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          key="intro"
          className="intro-overlay fixed inset-0 z-[80] flex flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9 } }}
          role="status"
          aria-label="Movie Universe intro"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: [0, 0.8, 0.8, 0], letterSpacing: "0.35em" }}
            transition={{ duration: 2, times: [0, 0.2, 0.75, 1], delay: 0.3 }}
            className="display text-[11px] text-[#9db8ff]"
          >
            Signal detected
          </motion.p>
          <h1 className="display absolute text-[clamp(2rem,8vw,5.5rem)] font-extrabold" aria-label="Movie Universe">
            {words.map((w, wi) => (
              <span key={wi} className="mr-[0.28em] inline-block whitespace-nowrap">
                {w.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    className="metal-text inline-block"
                    initial={{ opacity: 0, y: 30, filter: "blur(14px)", scale: 1.4 }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                    transition={{ delay: 2.0 + (wi * 6 + i) * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.1, duration: 0.8 }}
            className="display absolute mt-36 text-xs tracking-[0.4em] text-[#f5c46b] md:mt-44 md:text-sm"
          >
            One portal. Infinite stories.
          </motion.p>
          <motion.div
            className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-[#9db8ff] to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 0.9, 0] }}
            transition={{ delay: 1.8, duration: 1.4 }}
          />
          <button onClick={() => finish(true)} className="btn-ghost absolute bottom-8 right-6 !py-2.5 md:right-10" aria-label="Skip intro">
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
