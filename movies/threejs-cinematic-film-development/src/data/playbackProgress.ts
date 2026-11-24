// Lightweight persistence (localStorage): playback progress and viewer preferences.
export interface Settings {
  music: number; dialogue: number; sfx: number;
  muteMusic: boolean; muteDialogue: boolean; muteSfx: boolean;
  subtitles: boolean; quality: 'low' | 'balanced' | 'high';
}
export interface Progress { index: number; t: number; updated: number }

export const defaultSettings: Settings = { music: 0.7, dialogue: 1, sfx: 0.8, muteMusic: false, muteDialogue: false, muteSfx: false, subtitles: true, quality: 'balanced' };

const SK = 'two-survivors:settings:v1', PK = 'two-survivors:progress:v1';

export function loadSettings(): Settings {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SK) ?? '{}') }; } catch { return defaultSettings; }
}
export function saveSettings(s: Settings) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch { /* storage unavailable */ } }
export function loadProgress(): Progress | null {
  try {
    const p = JSON.parse(localStorage.getItem(PK) ?? 'null');
    return p && Number.isInteger(p.index) && p.index >= 0 && Number.isFinite(p.t) && p.t >= 0 ? p : null;
  } catch { return null; }
}
export function saveProgress(p: Progress) { try { localStorage.setItem(PK, JSON.stringify(p)); } catch { /* storage unavailable */ } }
export function clearProgress() { try { localStorage.removeItem(PK); } catch { /* storage unavailable */ } }
