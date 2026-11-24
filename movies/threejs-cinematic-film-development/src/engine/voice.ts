// Dialogue voices. Architecture: for each line, (1) a recorded file (line.voiceFile or public/audio/voice/manifest.json entry)
// is used if available, otherwise (2) browser speech synthesis is used as a fallback.
// NOTE: no recorded voice acting is bundled — drop files into public/audio/voice/ and list them in manifest.json.
import type { Line, SpeakerId, SpeechStyle } from '../story/types';
import { audio } from './audio';

interface Profile { pitch: number; rate: number; gender: 'm' | 'f'; slot: number; vol: number }
const PROFILES: Record<SpeakerId, Profile> = {
  arin: { pitch: 0.72, rate: 0.9, gender: 'm', slot: 0, vol: 1 },
  mira: { pitch: 1.08, rate: 0.96, gender: 'f', slot: 0, vol: 1 },
  narrator: { pitch: 0.62, rate: 0.82, gender: 'm', slot: 1, vol: 0.95 },
  scientist: { pitch: 0.95, rate: 1.0, gender: 'm', slot: 2, vol: 0.9 },
  radio: { pitch: 1.2, rate: 0.9, gender: 'm', slot: 3, vol: 0.85 },
  mystery: { pitch: 0.1, rate: 0.62, gender: 'm', slot: 1, vol: 0.7 },
  video: { pitch: 1.25, rate: 1.0, gender: 'f', slot: 1, vol: 0.8 },
};

const MALE = /male|david|mark|daniel|james|george|alex|fred|guy|ryan|thomas|oliver|arthur|richard|rishi|christopher|eric|brian|liam|william/i;
const FEMALE = /female|zira|samantha|hazel|susan|karen|victoria|moira|aria|jenny|libby|sonia|catherine|fiona|tessa|emma|natasha|heera|linda|allison/i;

export { estimateDur } from '../story/helpers';
import { estimateDur } from '../story/helpers';

class VoiceEngine {
  private voices: SpeechSynthesisVoice[] = [];
  private manifest: Record<string, string> = {};
  private current: HTMLAudioElement | null = null;
  private sourceNode: AudioNode | null = null;
  private speechTimer: number | null = null;
  private bed: number | null = null;
  private voicesHandler: (() => void) | null = null;
  private generation = 0;
  supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  enabled = true;

  async init() {
    if (this.supported) {
      const load = () => { this.voices = window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)); };
      load();
      if (!this.voicesHandler) { this.voicesHandler = load; window.speechSynthesis.addEventListener('voiceschanged', load); }
    }
    try {
      const r = await fetch('./audio/voice/manifest.json');
      if (r.ok && (r.headers.get('content-type') ?? '').includes('json')) this.manifest = await r.json();
    } catch { /* no recorded voices supplied */ }
  }

  private pick(p: Profile) {
    const v = this.voices; if (!v.length) return undefined;
    const ms = v.filter((x) => MALE.test(x.name) && !FEMALE.test(x.name)), fs = v.filter((x) => FEMALE.test(x.name));
    const pool = p.gender === 'm' ? (ms.length ? ms : v) : (fs.length ? fs : v);
    return pool[p.slot % pool.length];
  }

  speak(line: Line) {
    this.cancel();
    if (!this.enabled || audio.volumes.muteDialogue) return;
    const style: SpeechStyle = line.style ?? 'normal';
    const file = line.voiceFile ?? this.manifest[line.id];
    if (style === 'radio') this.radioBed(estimateDur(line));
    if (file && audio.ctx) { this.playFile(file, style); return; }
    if (!this.supported) return;
    const p = PROFILES[line.speaker] ?? PROFILES.narrator;
    const u = new SpeechSynthesisUtterance(line.text.replace(/\.\.\./g, '…'));
    const voice = this.pick(p); if (voice) u.voice = voice;
    let pitch = p.pitch, rate = p.rate, vol = p.vol;
    if (style === 'whisper') { vol *= 0.45; rate *= 0.88; pitch *= 0.9; }
    if (style === 'shout') { vol = 1; rate *= 1.12; pitch *= 1.12; }
    if (style === 'distress') { rate *= 1.1; pitch *= 1.1; }
    if (style === 'radio') { rate *= 0.95; }
    u.pitch = Math.min(2, Math.max(0.1, pitch)); u.rate = Math.min(1.6, Math.max(0.5, rate));
    u.volume = Math.min(1, vol);
    const gen = this.generation;
    this.speechTimer = window.setTimeout(() => {
      this.speechTimer = null;
      if (gen !== this.generation || audio.volumes.muteDialogue) return;
      try { window.speechSynthesis.speak(u); } catch { /* ignore */ }
    }, 40);
  }

  private playFile(url: string, style: SpeechStyle) {
    const ctx = audio.ctx!;
    const el = new Audio(url); el.crossOrigin = 'anonymous'; this.current = el;
    let routed = false;
    try {
      const src = ctx.createMediaElementSource(el);
      let node: AudioNode = src;
      if (style === 'radio') {
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 550; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
        src.connect(hp); hp.connect(lp); node = lp;
      }
      node.connect(audio.dialogBus);
      this.sourceNode = src; routed = true;
    } catch { /* fallthrough: play directly so the line is still heard */ }
    if (!routed) el.volume = audio.volumes.muteDialogue ? 0 : audio.volumes.dialogue;
    void el.play().catch(() => undefined);
  }

  private radioBed(dur: number) {
    audio.sfx('radioOn', 0.6);
    if (this.bed) window.clearTimeout(this.bed);
    this.bed = window.setTimeout(() => audio.sfx('static', 0.5), dur * 1000);
  }

  cancel() {
    this.generation++;
    if (this.speechTimer !== null) { window.clearTimeout(this.speechTimer); this.speechTimer = null; }
    if (this.supported) { try { window.speechSynthesis.cancel(); } catch { /* ignore */ } }
    if (this.current) { this.current.pause(); this.current = null; }
    if (this.sourceNode) { try { this.sourceNode.disconnect(); } catch { /* ignore */ } this.sourceNode = null; }
    if (this.bed) { window.clearTimeout(this.bed); this.bed = null; }
  }
  pause() { if (this.supported) window.speechSynthesis.pause(); this.current?.pause(); }
  resume() { if (this.supported) window.speechSynthesis.resume(); void this.current?.play().catch(() => undefined); }
  dispose() {
    this.cancel();
    if (this.supported && this.voicesHandler) window.speechSynthesis.removeEventListener('voiceschanged', this.voicesHandler);
    this.voicesHandler = null;
  }
}

export const voice = new VoiceEngine();
