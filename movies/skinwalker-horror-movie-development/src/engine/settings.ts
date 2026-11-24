import type { AudioSettings } from './audio';

const SKEY = 'skinwalker.settings.v1';
const PKEY = 'skinwalker.progress.v1';

export const DEFAULT_SETTINGS: AudioSettings = {
  master: 0.9, music: 0.8, sfx: 0.9, voice: 1, ambience: 0.8, muted: false, subtitles: true, quality: 'medium', voices: {},
};

export function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(SKEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw), voices: { ...(JSON.parse(raw).voices ?? {}) } };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}
export function saveSettings(s: AudioSettings) {
  try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch { /* ignore */ }
}
export function loadProgress(): number {
  try { const v = JSON.parse(localStorage.getItem(PKEY) ?? 'null'); return v && typeof v.t === 'number' ? v.t : 0; } catch { return 0; }
}
export function saveProgress(t: number) {
  try { localStorage.setItem(PKEY, JSON.stringify({ t, at: Date.now() })); } catch { /* ignore */ }
}
