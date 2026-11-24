"use client";

import { useSyncExternalStore } from "react";

// Tiny persistent stores backed by localStorage (no backend, no database).

type Store<T> = {
  get: () => T;
  set: (update: (prev: T) => T) => void;
  subscribe: (cb: () => void) => () => void;
  server: () => T;
};

function createStore<T extends object>(key: string, initial: T, persist = true): Store<T> {
  let cache: T = initial;
  let loaded = !persist;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        cache = Array.isArray(initial) ? (parsed as T) : { ...initial, ...parsed };
      }
    } catch {
      /* corrupted or blocked storage: keep defaults */
    }
  };

  if (persist && typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key !== key) return;
      loaded = false;
      cache = initial;
      load();
      emit();
    });
  }

  return {
    get() {
      load();
      return cache;
    },
    set(update) {
      load();
      cache = update(cache);
      if (persist) {
        try {
          window.localStorage.setItem(key, JSON.stringify(cache));
        } catch {
          /* quota / private mode: state stays in memory */
        }
      }
      emit();
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    server: () => initial,
  };
}

function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.server);
}

// ---------- preferences ----------

export type Prefs = {
  introSeen: boolean;
  soundEnabled: boolean;
  volume: number;
  reducedMotion: "system" | "on" | "off";
  quality: "auto" | "low" | "high";
};

export const prefsStore = createStore<Prefs>("mu:prefs:v1", {
  introSeen: false,
  soundEnabled: false,
  volume: 0.35,
  reducedMotion: "system",
  quality: "auto",
});
export const usePrefs = () => useStore(prefsStore);
export const setPrefs = (patch: Partial<Prefs>) => prefsStore.set((p) => ({ ...p, ...patch }));

// ---------- watch history ----------

export type HistoryEntry = {
  lastOpened: number;
  opens: number;
  /** Only present when the movie genuinely reported playback progress through the postMessage protocol. */
  position?: number;
  duration?: number;
  completed?: boolean;
};
export type History = Record<string, HistoryEntry>;

export const historyStore = createStore<History>("mu:history:v1", {});
export const useHistory = () => useStore(historyStore);

export function recordOpen(id: string) {
  historyStore.set((h) => ({
    ...h,
    [id]: { ...h[id], lastOpened: Date.now(), opens: (h[id]?.opens ?? 0) + 1 },
  }));
}

export function recordProgress(id: string, position: number, duration: number, completed = false) {
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return;
  historyStore.set((h) => ({
    ...h,
    [id]: {
      ...h[id],
      lastOpened: h[id]?.lastOpened ?? Date.now(),
      opens: h[id]?.opens ?? 1,
      position,
      duration,
      completed: completed || position / duration > 0.98,
    },
  }));
}

export function removeFromHistory(id: string) {
  historyStore.set((h) => {
    const next = { ...h };
    delete next[id];
    return next;
  });
}

// ---------- bookmarks ----------

export const bookmarkStore = createStore<{ ids: string[] }>("mu:bookmarks:v1", { ids: [] });
export const useBookmarks = () => useStore(bookmarkStore).ids;
export const toggleBookmark = (id: string) =>
  bookmarkStore.set((b) => ({ ids: b.ids.includes(id) ? b.ids.filter((x) => x !== id) : [...b.ids, id] }));

// ---------- session-only intro state ----------

export type IntroState = "pending" | "playing" | "done";
export const introStore = createStore<{ state: IntroState }>("mu:intro", { state: "pending" }, false);
export const useIntroState = () => useStore(introStore).state;
export const setIntroState = (state: IntroState) => introStore.set(() => ({ state }));

// ---------- motion preference ----------

const mq = () => (typeof window === "undefined" ? null : window.matchMedia("(prefers-reduced-motion: reduce)"));

function useSystemReduced(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = mq();
      m?.addEventListener("change", cb);
      return () => m?.removeEventListener("change", cb);
    },
    () => mq()?.matches ?? false,
    () => false,
  );
}

export function useReducedMotionPref(): boolean {
  const prefs = usePrefs();
  const system = useSystemReduced();
  return prefs.reducedMotion === "on" || (prefs.reducedMotion === "system" && system);
}
