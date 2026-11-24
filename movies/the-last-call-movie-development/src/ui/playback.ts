/** Mutable playback controller shared by the player UI and the R3F timekeeper. */
export const ctl = {
  playing: false,
  t: 0,
  seekTo: null as number | null,
  ended: false,
  onEnd: () => {},
};

export interface Prefs {
  volume: number;
  muted: boolean;
  subs: boolean;
  quality: "low" | "medium" | "high";
}

const K = {
  progress: "lastcall.progress",
  volume: "lastcall.volume",
  muted: "lastcall.muted",
  subs: "lastcall.subs",
  quality: "lastcall.quality",
};

export function loadPrefs(): Prefs {
  const g = (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const q = g(K.quality);
  return {
    volume: g(K.volume) !== null ? Math.min(1, Math.max(0, parseFloat(g(K.volume)!) || 0)) : 0.8,
    muted: g(K.muted) === "1",
    subs: g(K.subs) !== "0",
    quality: q === "low" || q === "high" ? q : "medium",
  };
}

export function savePref(k: keyof typeof K, v: string | number | boolean) {
  try {
    localStorage.setItem(K[k], typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  } catch {
    /* storage unavailable */
  }
}

export function loadProgress(): number {
  try {
    return parseFloat(localStorage.getItem(K.progress) || "0") || 0;
  } catch {
    return 0;
  }
}
