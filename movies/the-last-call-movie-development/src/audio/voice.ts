import type { CLine, SpeakerId } from "../movie/types";

/**
 * Fallback voice system using browser SpeechSynthesis.
 * This is synthesized speech, NOT recorded voice acting. Each speaker gets a fixed profile
 * (voice choice, pitch, rate) so identities stay consistent for the whole film.
 */
interface Profile {
  gender: "m" | "f";
  /** which voice within the gender group to prefer (distinct per speaker when possible) */
  pick: number;
  pitch: number;
  rate: number;
  vol: number;
}

export const PROFILES: Record<SpeakerId, Profile> = {
  narrator: { gender: "m", pick: 0, pitch: 0.55, rate: 0.82, vol: 1 },
  daniel: { gender: "m", pick: 1, pitch: 0.88, rate: 0.93, vol: 1 },
  sarah: { gender: "f", pick: 0, pitch: 0.92, rate: 1.0, vol: 1 },
  emily: { gender: "f", pick: 1, pitch: 1.22, rate: 0.95, vol: 0.95 },
  victor: { gender: "m", pick: 2, pitch: 0.5, rate: 0.76, vol: 0.95 },
  olivia: { gender: "f", pick: 2, pitch: 1.08, rate: 1.0, vol: 1 },
  caller: { gender: "m", pick: 3, pitch: 1.05, rate: 0.82, vol: 0.55 },
  youngman: { gender: "m", pick: 4, pitch: 1.3, rate: 1.0, vol: 0.9 },
  father: { gender: "m", pick: 0, pitch: 0.4, rate: 0.82, vol: 0.9 },
  mother: { gender: "f", pick: 3, pitch: 0.75, rate: 0.9, vol: 0.9 },
  girl: { gender: "f", pick: 1, pitch: 1.9, rate: 0.95, vol: 0.7 },
  researcher: { gender: "m", pick: 5, pitch: 0.95, rate: 1.0, vol: 1 },
  self: { gender: "m", pick: 1, pitch: 0.7, rate: 0.85, vol: 0.9 },
  boy: { gender: "m", pick: 4, pitch: 1.8, rate: 1.0, vol: 0.75 },
};

const FEMALE = /zira|samantha|susan|hazel|aria|jenny|female|victoria|karen|moira|tessa|fiona|libby|sonia|catherine|linda|heather|allison|ava|emma|natasha|clara|joanna|salli|kimberly|ivy|kendra/i;
const MALE = /david|mark|daniel|alex|guy|george|male|fred|ryan|thomas|james|oliver|rishi|ronan|brian|eric|christopher|matthew|joey|justin|arthur|ralph|liam/i;

let voices: SpeechSynthesisVoice[] = [];
const supported = typeof window !== "undefined" && "speechSynthesis" in window;

function refresh() {
  if (!supported) return;
  voices = window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
  if (!voices.length) voices = window.speechSynthesis.getVoices();
}
if (supported) {
  refresh();
  window.speechSynthesis.addEventListener?.("voiceschanged", refresh);
}

export const speechAvailable = () => supported && (voices.length > 0 || window.speechSynthesis.getVoices().length > 0);
export const voiceCount = () => voices.length;

function pickVoice(p: Profile): SpeechSynthesisVoice | undefined {
  if (!voices.length) refresh();
  const f = voices.filter((v) => FEMALE.test(v.name));
  const m = voices.filter((v) => MALE.test(v.name) && !FEMALE.test(v.name));
  const group = p.gender === "f" ? f : m;
  const pool = group.length ? group : voices;
  return pool[p.pick % Math.max(1, pool.length)];
}

export function speak(line: CLine, volume: number) {
  if (!supported || volume <= 0) return;
  const p = PROFILES[line.w];
  const u = new SpeechSynthesisUtterance(line.text);
  const v = pickVoice(p);
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  }
  let pitch = p.pitch;
  let rate = p.rate;
  let vol = p.vol;
  if (line.fx === "whisper") {
    vol *= 0.45;
    rate *= 0.88;
  }
  if (line.fx === "distort") pitch *= 0.72;
  if (line.fx === "phone") vol *= 0.85;
  if (line.fx === "echo") rate *= 0.9;
  u.pitch = Math.min(2, Math.max(0, pitch));
  u.rate = Math.min(2, Math.max(0.5, rate));
  u.volume = Math.min(1, vol * volume);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function cancelSpeech() {
  if (supported) window.speechSynthesis.cancel();
}
export function pauseSpeech() {
  if (supported) window.speechSynthesis.pause();
}
export function resumeSpeech() {
  if (supported) window.speechSynthesis.resume();
}
