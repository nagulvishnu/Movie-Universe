// Narration through the browser's SpeechSynthesis API.
// No recorded voice assets are bundled, so the voice is whatever the viewer's device provides.
type Tone = 'normal' | 'dramatic' | 'soft';

export interface NarratorSettings { voiceURI: string; rate: number; pitch: number }

const PREFERRED = [/natural.*(guy|ryan|davis|christopher|brian|eric|roger|william|thomas)/i, /(guy|ryan|davis|christopher|brian|eric|roger|william|thomas).*natural/i, /google uk english male/i, /daniel/i, /microsoft (david|mark|george|ryan|guy)/i, /alex/i, /male/i];

class Narrator {
  private gen = 0;
  private volume = 0.9;
  settings: NarratorSettings = { voiceURI: '', rate: 0.9, pitch: 0.82 };
  available = typeof window !== 'undefined' && 'speechSynthesis' in window;
  voices: SpeechSynthesisVoice[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    if (!this.available) return;
    const load = () => { this.voices = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)); this.listeners.forEach((l) => l()); };
    load();
    speechSynthesis.addEventListener?.('voiceschanged', load);
  }
  onVoices(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }

  private pick(): SpeechSynthesisVoice | undefined {
    const byUri = this.voices.find((v) => v.voiceURI === this.settings.voiceURI);
    if (byUri) return byUri;
    for (const re of PREFERRED) { const v = this.voices.find((x) => re.test(x.name) && /en-(gb|us|au|ie)/i.test(x.lang)) ?? this.voices.find((x) => re.test(x.name)); if (v) return v; }
    return this.voices.find((v) => /en-gb/i.test(v.lang)) ?? this.voices[0];
  }
  setVolume(v: number) { this.volume = v; }
  configure(s: Partial<NarratorSettings>) { this.settings = { ...this.settings, ...s }; }
  get activeVoice() { return this.pick(); }

  /** Speak one line. `done` is called once when speech ends (or immediately if unavailable). Returns a cancel token id. */
  speak(text: string, tone: Tone, done: () => void, started?: () => void, maxMs = 0): number {
    const id = ++this.gen;
    if (!this.available || this.volume <= 0.001) { setTimeout(() => id === this.gen && done(), 0); return id; }
    try { speechSynthesis.cancel(); } catch { /* ignore */ }
    window.setTimeout(() => {
      if (id !== this.gen) return;
      const u = new SpeechSynthesisUtterance(text);
      const v = this.pick(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
      const s = this.settings;
      u.rate = Math.max(0.5, Math.min(1.4, s.rate * (tone === 'dramatic' ? 1.04 : tone === 'soft' ? 0.93 : 1)));
      u.pitch = Math.max(0.1, Math.min(2, s.pitch * (tone === 'dramatic' ? 0.94 : tone === 'soft' ? 0.97 : 1)));
      u.volume = Math.min(1, this.volume * (tone === 'dramatic' ? 1 : tone === 'soft' ? 0.88 : 0.94));
      let finished = false;
      const fin = () => { if (finished || id !== this.gen) return; finished = true; done(); };
      let began = false;
      u.onstart = () => { began = true; if (id === this.gen) started?.(); };
      u.onend = fin; u.onerror = fin;
      // Watchdogs: if the engine never starts (no voices) or never reports the end, release the film clock.
      window.setTimeout(() => { if (!began) fin(); }, 3000);
      window.setTimeout(fin, maxMs || Math.max(6000, text.split(/\s+/).length * 900));
      speechSynthesis.speak(u);
    }, 60);
    return id;
  }

  cancel() { this.gen++; if (this.available) { try { speechSynthesis.cancel(); } catch { /* ignore */ } } }
}
export const narrator = new Narrator();
