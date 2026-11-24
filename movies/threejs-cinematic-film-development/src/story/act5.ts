// ACT 5 — SOMEONE IS LISTENING, credits and the post-credit scene
import { track } from './track';
import { close, cover, dur, ecu, fixed, light, orbit, ots, sc, seq, sortShots, two } from './helpers';
import type { SceneDef } from './types';

const P = Math.PI;
const IX = 200;
const SUNRISE_IN = light('sunrise', { sunDir: [0.35, 0.2, 0.9], sunI: 3.4, fogD: 0.002, hemiI: 0.9, fill: 1.6, exposure: 1.05 }, { sunDir: [0.3, 0.28, 0.9], sunI: 3.8 });

const rep = seq('a5a', 3, [
  ['arin', 'Does it work?'],
  ['mira', "It will. Long range, full power. If anything's out there, it will hear us."],
  ['arin', 'And if nothing is?'],
  ['mira', "Then we'll have said hello to the sky."],
]);
const tx = seq('a5b', 3, [['mira', 'This is Mira. We are two survivors. We are alive. If anybody can hear us, please respond.', { dur: 8.5, emote: 'determined' }]]);
const T_LETSGO = 35;
const tx2 = seq('a5b2', T_LETSGO, [['arin', "Let's go. We have a long way to travel.", { emote: 'smile' }]]);
const T_RADIO = 41.4;
const tx3 = seq('a5b3', T_RADIO, [['radio', 'Hello? Can you hear me?', { style: 'radio', label: 'RADIO', dur: 3 }]]);
const resp = seq('a5c', 2.2, [
  ['radio', "We've been searching for you.", { style: 'radio', label: 'RADIO', gap: 6.5 }],
  ['radio', 'There are more of us than you think.', { style: 'radio', label: 'RADIO', gap: 3 }],
]);

export const act5: SceneDef[] = [
  sc({
    id: 'a5_repair', name: 'First Light', act: 5, env: 'station', dur: dur(30, rep), music: 'hope',
    light: SUNRISE_IN, fx: { dust: 0.9 }, ambience: { room: 0.15, wind: 0.15, electric: 0.2, birds: 0.25 }, surface: 'concrete', fadeIn: 'slow', fadeOut: 'dip',
    cards: [{ at: 0.8, dur: 5.5, text: 'ACT FIVE', sub: 'SOMEONE IS LISTENING', style: 'act' }],
    actors: {
      mira: track([IX - 0.6, -6.05], P, { anim: 'work', emote: 'determined', look: 'none' }).until(rep.at[1] + 1, { anim: 'work' }).until(rep.at[3] - 0.5, { anim: 'idle', look: 'arin', emote: 'determined' }).until(300, { emote: 'smile' }),
      arin: track([IX + 4, 2], P, { emote: 'neutral' }).walk([IX + 1.6, -5.3], { speed: 1.1 }).until(300, { yaw: P, faceTo: 'mira', look: 'mira', emote: 'neutral' }),
    },
    shots: sortShots([
      fixed(0, [IX - 6, 2.2, 8], [IX - 4, 2.0, 6.5], [IX, 1.0, -4], undefined, { fov: 42 }),
      orbit(5.4, 'mira', 1.5, 0.05, 1.3, { dist2: 1.2, fov: 28 }),
      ecu(8.5, 'mira', 0.9),
      ...cover(rep, (s, at, i) => (s === 'mira' ? close(at, 'mira', 0.5) : i % 2 ? close(at, 'arin', 0.5) : ots(at, 'mira', 'arin', 1)), 0.1).filter((s) => s.at > 9),
      two(rep.end - 0.5, 3.4, -1, { dist2: 4 }),
    ]),
    dialogue: rep.lines,
    sfx: [{ at: 0.6, name: 'bird', vol: 0.5 }, { at: 2, name: 'click', vol: 0.4 }, { at: 5, name: 'zap', vol: 0.2 }, { at: 7, name: 'powerUp', vol: 0.4 }],
  }),
  sc({
    id: 'a5_transmit', name: 'This Is Mira', act: 5, env: 'station', dur: 52, music: 'sorrow', mus: [{ at: T_RADIO - 0.6, name: 'silence' }],
    light: SUNRISE_IN, fx: { dust: 0.9 }, ambience: { room: 0.12, wind: 0.12, electric: 0.18, static: 0.14, birds: 0.2 }, surface: 'concrete', fadeIn: 'dip', fadeOut: 'cut',
    actors: {
      mira: track([IX - 0.1, -5.45], P, { anim: 'idle', prop: 'mic', emote: 'determined', look: 'none' }).until(21, { emote: 'worried' }).until(31, { emote: 'sad' }).until(T_RADIO + 1, { emote: 'sad' }).until(T_RADIO + 3, { emote: 'surprised', anim: 'idle' }).until(300, { emote: 'surprised' }),
      arin: track([IX + 1.6, -4.7], P, { emote: 'neutral', faceTo: 'mira', look: 'mira' }).until(T_LETSGO - 0.5, { emote: 'worried', look: 'none' }).until(T_LETSGO + 0.4, { look: 'mira', emote: 'smile' }).walk([IX + 3.3, -1.2], { speed: 0.9, look: 'none', emote: 'neutral' }).until(T_RADIO + 0.4, { anim: 'idle', yaw: -P / 2 }).until(300, { yaw: P, faceTo: 'mira', look: 'mira', emote: 'surprised' }),
    },
    shots: sortShots([
      two(0, 3.6, 1, { fov: 40 }),
      close(tx.at[0] - 0.3, 'mira', 0.55, { dist2: 0.9, fov: 26 }),
      ots(tx.at[0] + 4.5, 'arin', 'mira', 1, { fov: 32 }),
      fixed(14.5, [IX + 2.6, 1.4, -4.2], [IX + 2.5, 1.4, -4.4], [IX - 1.4, 1.1, -6.5], undefined, { fov: 30 }),
      ecu(20, 'mira', 0.7),
      close(26, 'arin', 0.5, { fov: 28 }),
      ecu(30, 'mira', 0.5),
      close(T_LETSGO - 0.3, 'arin', 0.4, { fov: 28 }),
      two(T_LETSGO + 3, 4.6, -1, { fov: 40 }),
      fixed(T_RADIO - 0.5, [IX + 1.0, 1.6, -3.3], [IX + 0.8, 1.6, -3.7], [IX - 1.4, 1.15, -6.5], undefined, { fov: 28 }),
      close(T_RADIO + 1.2, 'mira', 0.5, { fov: 26 }),
      orbit(T_RADIO + 3.5, 'arin', 1.4, 0.0, 0.5, { fov: 28 }),
    ]),
    dialogue: [...tx.lines, ...tx2.lines, ...tx3.lines],
    sfx: [{ at: tx.at[0] - 0.7, name: 'click', vol: 0.6 }, { at: tx.at[0] + 8.7, name: 'static', vol: 0.3 }, { at: 11, name: 'static', vol: 0.12 }, { at: 21, name: 'static', vol: 0.12 }, { at: 30.5, name: 'static', vol: 0.12 }, { at: T_RADIO - 2, name: 'radioTune', vol: 0.7 }, { at: T_RADIO - 0.3, name: 'static', vol: 0.5 }],
  }),
  sc({
    id: 'a5_response', name: 'More of Us Than You Think', act: 5, env: 'station', dur: dur(32, resp), music: 'hope', mus: [{ at: resp.at[1] + 0.8, name: 'emotional' }, { at: resp.end + 2, name: 'hope' }],
    light: SUNRISE_IN, fx: { dust: 0.9 }, ambience: { room: 0.1, static: 0.18, birds: 0.3, electric: 0.15 }, surface: 'concrete', fadeIn: 'cut', fadeOut: 'slow',
    actors: {
      mira: track([IX - 0.1, -5.45], P, { anim: 'idle', prop: 'mic', emote: 'surprised', look: 'none' }).until(resp.at[0] + 1.2, { emote: 'surprised' }).until(resp.at[0] + 2.5, { anim: 'idle', prop: 'none', emote: 'sad' }).walk([IX, -5.15], { speed: 0.4 }).until(resp.at[0] + 5, { anim: 'sit', yaw: P, emote: 'sad' }).until(300, { anim: 'sitCry', emote: 'cry' }),
      arin: track([IX + 1.6, -4.7], P, { emote: 'surprised', faceTo: 'mira', look: 'mira' }).until(resp.at[0] + 3.5, {}).walk([IX - 1.0, -4.8], { speed: 0.5, look: 'mira', emote: 'sad' }).stand(1.2, { yaw: P / 2, faceTo: 'mira' }).until(resp.at[1] - 0.3, { anim: 'sitGround', yaw: P, faceTo: 'mira', emote: 'sad' }).until(resp.at[1] + 2.5, { emote: 'surprised', look: 'mira' }).until(300, { emote: 'smile' }),
    },
    shots: sortShots([
      close(0, 'mira', 0.45, { fov: 26 }),
      orbit(resp.at[0] + 1.8, 'arin', 1.4, 0.0, 0.5, { fov: 28 }),
      ecu(resp.at[0] + 3.4, 'mira', 0.3),
      two(resp.at[0] + 6, 3.0, 1, { fov: 36 }),
      close(resp.at[1] - 0.4, 'arin', 0.6, { fov: 28 }),
      close(resp.at[1] + 1.8, 'mira', 0.6, { fov: 28 }),
      two(resp.at[1] + 4.6, 3.2, -1, { fov: 38, dist2: 4.4 }),
    ]),
    dialogue: resp.lines,
    sfx: [{ at: resp.at[0] - 0.4, name: 'static', vol: 0.5 }, { at: resp.at[1] - 0.5, name: 'static', vol: 0.5 }, { at: resp.at[1] + 0.8, name: 'riser', vol: 0.5 }],
  }),
  sc({
    id: 'a5_pullaway', name: 'Sunrise', act: 5, env: 'station', dur: 34, music: 'hope',
    light: light('sunrise', { sunDir: [0.1, 0.12, 0.95], sunI: 3.4, fogD: 0.0016, hemiI: 0.85 }, { sunDir: [0.1, 0.32, 0.95], fogD: 0.0011 }), fx: { dust: 0.25, wind: 0.3, debris: 0.2 }, ambience: { wind: 0.3, birds: 0.5 }, surface: 'gravel', fadeIn: 'slow', fadeOut: 'black',
    actors: {
      arin: track([-0.6, 11.6], 0, { emote: 'smile' }).walk([-0.7, 14.2], { speed: 0.9 }).stand(60, { yaw: 0, emote: 'smile', look: [0, 6, 120] }),
      mira: track([0.8, 11.3], 0, { emote: 'smile' }).walk([0.7, 14.3], { speed: 0.9 }).stand(60, { yaw: 0, emote: 'smile', look: [0, 6, 120] }),
    },
    shots: [fixed(0, [0, 3.0, 11.0], [0, 74, -55], [0, 1.5, 16], [0, -12, 70], { fov: 40, shake: 0.002 })],
    sfx: [{ at: 1, name: 'bird', vol: 0.6 }, { at: 6, name: 'bird', vol: 0.5 }, { at: 14, name: 'bird', vol: 0.5 }, { at: 22, name: 'gust', vol: 0.4 }],
  }),
  sc({
    id: 'a_credits', name: 'Credits', act: 5, env: 'station', dur: 62, music: 'credits', overlay: 'credits',
    light: light('sunrise', { sunDir: [0.5, 0.22, 0.8], sunI: 2.8, fogD: 0.0022 }, { sunDir: [0.5, 0.45, 0.7] }), fx: { dust: 0.2, wind: 0.3 }, ambience: { wind: 0.2, birds: 0.35 }, surface: 'gravel', fadeIn: 'slow', fadeOut: 'black',
    shots: [fixed(0, [70, 34, 76], [-40, 46, 66], [0, 6, 0], [0, 8, 12], { fov: 44 })],
  }),
  sc({
    id: 'pc_monitor', name: 'Post-Credit Scene', act: 6, env: 'monitor', dur: 50, music: 'mystery', holdBlack: 3,
    light: light('black', { hemiI: 0.2, hemiSky: 0x203a2c, exposure: 1.2 }), fx: { dust: 0.7 }, ambience: { hum: 0.12, room: 0.15 }, surface: 'concrete', fadeIn: 'black', fadeOut: 'black',
    cards: [{ at: 39.5, dur: 9, text: 'TWO SURVIVORS', sub: 'THE END', style: 'end' }],
    shots: [fixed(0, [0, 1.7, 4.2], [0, 2.0, -2.2], [0, 2.4, -8.3], undefined, { fov: 40 })],
    dialogue: seq('pc', 31.4, [['mystery', 'They found each other.', { style: 'whisper', dur: 3.2 }]]).lines,
    sfx: [{ at: 3.6, name: 'powerUp', vol: 0.5 }, { at: 8.5, name: 'blip', vol: 0.3 }, { at: 11, name: 'blip', vol: 0.3 }, { at: 17.2, name: 'beep', vol: 0.8 }, { at: 17.3, name: 'sting', vol: 0.5 }, { at: 24.6, name: 'beep', vol: 0.8 }, { at: 28.3, name: 'powerDown', vol: 0.8 }, { at: 30.6, name: 'whisperBreath', vol: 0.8 }],
  }),
];
