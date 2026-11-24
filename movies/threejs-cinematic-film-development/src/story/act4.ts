// ACT 4 — THE TRUTH THAT ISN'T THE TRUTH (Station 17)
import { track } from './track';
import { close, cover, dur, ecu, fixed, follow, light, orbit, ots, sc, seq, sortShots, two } from './helpers';
import type { SceneDef } from './types';

const P = Math.PI;
const IX = 200;
const INTERIOR = light('interiorDay', { sunI: 0.9, sun: 0xdde4ee, hemiI: 1.0, fill: 2.6, sunDir: [0.35, 0.5, 0.9] });

const ar = seq('a4a', 8.2, [
  ["mira", "That's it. That's Station 17!", { emote: 'happy' }],
  ['arin', 'Mira. Slow down.', { gap: 3.2 }],
  ['mira', 'Hello?! Is anyone there?!', { style: 'shout', gap: 1.2 }],
  ['mira', 'Hello!!', { style: 'shout', gap: 3.5 }],
  ['arin', '...Mira.', { style: 'whisper' }],
]);
const em = seq('a4b', 3.4, [
  ['mira', 'Hello? Is anyone here?', { gap: 2.4 }],
  ['mira', '...Hello?', { gap: 5.6 }],
  ['mira', 'No. No, no, no.', { style: 'distress' }],
  ['mira', "It's not a person. It's an automated broadcast.", { emote: 'cry' }],
  ['mira', 'The same message. Over and over. For five years.'],
  ['arin', 'Mira...', { gap: 1.6 }],
  ['mira', 'I crossed half a country for a recording.', { emote: 'cry' }],
]);
const arch = seq('a4c', 5, [
  ['arin', 'Thousands of recordings. All from the day of the Silence.'],
  ['mira', 'Is there anything in them?', { emote: 'sad', gap: 6 }],
  ['scientist', "The people aren't dead. We don't know where they went. Whatever happened, it happened everywhere.", { style: 'radio', label: 'RECORDING', dur: 9.2, gap: 1.8 }],
  ['arin', 'Not dead.'],
  ['mira', 'Then where are they?'],
  ['arin', "That's the question, isn't it."],
]);
const arg = seq('a4d', 2.5, [
  ['arin', "We should go back to the city. There's nothing here."],
  ['mira', 'Go back to what? Scavenging alone? Waiting for nothing?', { style: 'distress' }],
  ['arin', 'To staying alive.'],
  ['mira', "That's not living. That's just... not dying."],
  ['arin', 'Hope is a luxury, Mira. People who hope get hurt.', { emote: 'angry' }],
  ['mira', 'Who hurt you, Arin?', { gap: 2.4 }],
]);
const conf = seq('a4e', 3, [
  ['arin', "My sister's name was Lena. She was twenty-three.", { gap: 1.2 }],
  ['arin', 'I was kneeling beside a patient when it happened. And then I was kneeling beside no one. My hands were still on his chest.', { gap: 1.6 }],
  ['arin', 'I ran back to the station. Her ambulance was in the road. Door open. Engine cold.', { gap: 1.4 }],
  ['arin', 'Her bracelet was on the seat. The emergency bracelet I made her wear since she was nine.', { gap: 2.2 }],
  ['arin', 'I looked for her for five years. Every city. Every hospital.', { gap: 2 }],
  ['arin', "I don't think she's alive. I stopped believing that a long time ago.", { emote: 'sad', gap: 3.4 }],
  ['mira', "I'm so sorry, Arin.", { gap: 3 }],
  ['mira', "Maybe we can't bring back the people we lost. But that doesn't mean we have to lose everyone else.", { gap: 4 }],
]);
const night = seq('a4f', 3, [
  ['mira', 'Do you think they can see us? Wherever they are.'],
  ['arin', "I don't know.", { gap: 1.6 }],
  ['arin', "Lena used to say the stars were porch lights for people we haven't met yet."],
  ['mira', 'I like that.', { gap: 1.2 }],
]);

export const act4: SceneDef[] = [
  sc({
    id: 'a4_arrive', name: 'Station 17', act: 4, env: 'station', dur: dur(30, ar), music: 'hope', mus: [{ at: ar.at[3] + 2.8, name: 'suspense' }],
    light: light('dayRuined', { fogD: 0.0024, sunDir: [0.4, 0.5, 0.85] }), fx: { dust: 0.2, debris: 0.3, wind: 0.5 }, ambience: { wind: 0.45, birds: 0.1 }, surface: 'gravel', fadeIn: 'slow', fadeOut: 'dip',
    cards: [{ at: 0.8, dur: 5.5, text: 'ACT FOUR', sub: "THE TRUTH THAT ISN'T THE TRUTH", style: 'act' }],
    actors: {
      arin: track([-0.9, 46], P, { emote: 'worried' }).walk([-0.9, 13.5], { speed: 1.35 }).stand(10, { look: [0, 2, 8], emote: 'worried' }),
      mira: track([0.9, 46], P, { emote: 'neutral' }).walk([0.9, 36], { speed: 1.35 }).stand(1.2, { emote: 'happy', look: [0, 6, 0] }).run([0.5, 10.4], { speed: 3.6 }).stand(1.2, { emote: 'happy', look: [0, 2, 8] }).stand(2, { emote: 'worried' }).stand(10, { emote: 'sad', anim: 'lookAround' }),
    },
    shots: sortShots([
      fixed(0, [-34, 44, 96], [-16, 26, 70], [0, 8, 0], undefined, { fov: 46 }),
      follow(8.8, 'mira', [3, 1.6, 7], [4, 1.3, 5], { fov: 34, shake: 0.008 }),
      fixed(14, [4.5, 1.6, 18], [3, 1.6, 15], [0.5, 1.4, 8.5], undefined, { fov: 38 }),
      orbit(ar.at[2] - 0.3, 'mira', 1.7, 0.0, 0.45, { fov: 30 }),
      fixed(ar.at[3] + 1.8, [-8, 2.0, 22], [-6, 2.2, 20], [0, 2.4, 9], undefined, { fov: 42 }),
      two(ar.at[4] - 0.3, 5, 1, { fov: 40 }),
    ]),
    dialogue: ar.lines,
    sfx: [{ at: 1, name: 'gust', vol: 0.5 }, { at: ar.at[3] + 0.5, name: 'gust', vol: 0.6 }],
  }),
  sc({
    id: 'a4_empty', name: 'The Empty Station', act: 4, env: 'station', dur: dur(32, em), music: 'suspense', mus: [{ at: em.at[2], name: 'sorrow' }],
    light: INTERIOR, fx: { dust: 0.9 }, ambience: { room: 0.2, wind: 0.2, electric: 0.2, static: 0.05 }, surface: 'concrete', fadeIn: 'dip', fadeOut: 'dip',
    cards: [{ at: em.at[2] - 0.3, dur: 5, text: 'AUTOMATED EMERGENCY BEACON', sub: 'LOOP 1,826  ·  DAILY 23:47  ·  NO OPERATOR', style: 'terminal' }],
    actors: {
      mira: track([IX - 1, 7], P, { emote: 'worried', look: 'none' }).walk([IX - 0.4, 0.5], { speed: 1.0 }).stand(2.5, { anim: 'lookAround' }).walk([IX, -5.0], { speed: 0.8 }).stand(1.5, { anim: 'work', emote: 'worried' })
        .until(em.at[2] - 0.6, { anim: 'work', emote: 'fear' }).until(em.at[3] + 0.3, { anim: 'idle', emote: 'cry' }).walk([IX, -5.15], { speed: 0.3 }).until(em.at[3] + 2.4, { anim: 'sit', yaw: P, emote: 'sad' }).until(300, { anim: 'sitCry', emote: 'cry' }),
      arin: track([IX - 2.4, 8.4], P, { emote: 'worried' }).stand(4).walk([IX - 1.4, 0], { speed: 1.1 }).walk([IX + 0.9, -3.6], { speed: 0.8 }).until(em.at[3], { yaw: P, look: 'mira', emote: 'sad' }).until(300, { faceTo: 'mira', emote: 'sad' }),
    },
    shots: sortShots([
      fixed(0, [IX + 7, 2.4, 8.2], [IX + 5, 2.2, 7.4], [IX - 1, 1.2, 0], undefined, { fov: 46 }),
      follow(9.5, 'mira', [1.6, 1.3, 3.8], [1.4, 1.3, 3.0], { fov: 36 }),
      fixed(em.at[1] + 1, [IX + 3.5, 1.7, 2], [IX + 2.5, 1.7, -1.5], [IX - 0.4, 1.3, -6.4], undefined, { fov: 36 }),
      close(em.at[2] - 0.2, 'mira', 0.5, { dist2: 0.85, fov: 26 }),
      fixed(em.at[2] + 2.5, [IX - 2.5, 1.5, -3.8], [IX - 2.2, 1.5, -3.9], [IX + 1, 1.6, -8.7], undefined, { fov: 40 }),
      ...cover(
        { ...em, lines: em.lines.slice(3), at: em.at.slice(3) },
        (s, at) => (s === 'mira' ? close(at, 'mira', 0.5) : orbit(at, 'arin', 1.4, 0.0, 0.5, { fov: 28 })), 0.1,
      ),
      two(em.end - 2.4, 3.2, -1, { dist2: 3.8, h: 0.1 }),
    ]),
    dialogue: em.lines,
    sfx: [{ at: 1, name: 'static', vol: 0.12 }, { at: 11, name: 'blip', vol: 0.4 }, { at: em.at[2] - 0.8, name: 'radioTone', vol: 0.5 }, { at: em.at[2] - 0.6, name: 'sting', vol: 0.7 }],
  }),
  sc({
    id: 'a4_archive', name: 'The Archive', act: 4, env: 'station', dur: dur(34, arch), music: 'mystery', mus: [{ at: arch.at[2] + 8, name: 'sorrow' }],
    light: light('interiorDim', { hemiI: 0.6 }), fx: { dust: 1 }, ambience: { hum: 0.2, room: 0.15, electric: 0.1 }, surface: 'concrete', fadeIn: 'dip', fadeOut: 'dip',
    actors: {
      arin: track([IX + 12.2, 0], P / 2, { emote: 'worried' }).walk([IX + 34.6, 0], { speed: 1.2 }).stand(2, { anim: 'reach', yaw: P / 2 }).stand(60, { anim: 'idle', look: [IX + 36, 1.1, 0], emote: 'worried' }),
      mira: track([IX + 11.6, 0], P / 2, { emote: 'sad', look: 'none' }).stand(4).walk([IX + 32.4, 0], { speed: 1.1 }).stand(60, { look: [IX + 36, 1.1, 0], emote: 'sad', yaw: P / 2 }),
    },
    shots: sortShots([
      fixed(0, [IX + 11.2, 1.6, 0], [IX + 12.2, 1.6, 0], [IX + 37, 1.2, 0], undefined, { fov: 26 }),
      follow(8, 'arin', [-3.5, 0.9, 1.0], [-3.2, 1.0, 1.0], { fov: 36 }),
      orbit(15, 'arin', 2.2, 0.0, 1.0, { fov: 30 }),
      fixed(arch.at[2] - 3, [IX + 33.6, 1.6, 1.3], [IX + 34.2, 1.5, 1.0], [IX + 36, 1.0, 0], undefined, { fov: 32 }),
      close(arch.at[2] + 1, 'arin', 0.6, { fov: 26 }),
      close(arch.at[3] - 0.2, 'arin', 0.5, { fov: 28 }),
      ots(arch.at[4] - 0.2, 'arin', 'mira', 1, { fov: 32 }),
      two(arch.at[5] - 0.2, 3.0, 1, { fov: 36, dist2: 3.6 }),
    ]),
    dialogue: arch.lines,
    sfx: [{ at: arch.at[2] - 3.4, name: 'click', vol: 0.7 }, { at: arch.at[2] - 3.2, name: 'tapeStop', vol: 0.15 }, { at: arch.at[2] + 9.55, name: 'static', vol: 0.7 }, { at: arch.at[2] + 9.6, name: 'tapeStop', vol: 0.6 }],
  }),
  sc({
    id: 'a4_argue', name: 'Without Hope', act: 4, env: 'station', dur: dur(30, arg), music: 'tension', mus: [{ at: arg.end - 3, name: 'sorrow' }],
    light: INTERIOR, fx: { dust: 0.9 }, ambience: { room: 0.2, wind: 0.15, electric: 0.15 }, surface: 'concrete', fadeIn: 'dip', fadeOut: 'cut',
    actors: {
      arin: track([IX + 3.6, -1.6], -P / 2, { emote: 'angry', faceTo: 'mira', look: 'mira' }).stand(arg.at[4] - 0.4, {}).stand(2, { emote: 'angry', anim: 'idle' }).until(300, { emote: 'worried' }),
      mira: track([IX - 3.2, -2.6], P / 2, { emote: 'angry', faceTo: 'arin', look: 'arin' }).until(arg.at[3] + 0.5, {}).until(arg.end + 2, { emote: 'sad' }).until(300, {}),
    },
    shots: sortShots([
      two(0, 5.4, 1, { fov: 38 }),
      ...cover(arg, (s, at, i) => (s === 'mira' ? (i % 2 ? close(at, 'mira', 0.45, { shake: 0.005 }) : ots(at, 'arin', 'mira', 1)) : (i % 2 ? close(at, 'arin', 0.45, { shake: 0.005 }) : ots(at, 'mira', 'arin', 1))), 0.1),
    ]),
    dialogue: arg.lines,
  }),
  sc({
    id: 'a4_confess', name: "Arin's Story", act: 4, env: 'station', dur: dur(60, conf), music: 'sorrow',
    light: INTERIOR, fx: { dust: 0.9 }, ambience: { room: 0.15, wind: 0.12 }, surface: 'concrete', fadeIn: 'dip', fadeOut: 'slow',
    actors: {
      arin: track([IX + 5.05, -2.95], -2.1, { anim: 'sit', emote: 'tired', look: 'none', prop: 'none' }).until(conf.at[3] - 0.3, { anim: 'sit', emote: 'sad' }).until(conf.at[3] + 1, { prop: 'bracelet', emote: 'sad', look: 'none' })
        .until(conf.at[5] + 1, {}).until(conf.at[6] + 0.5, { emote: 'cry' }).until(conf.at[7] + 5, { look: 'mira', emote: 'sad' }).until(300, { emote: 'neutral' }),
      mira: track([IX + 0.4, -3.6], -P / 2, { emote: 'sad', look: 'arin', faceTo: 'arin' }).until(conf.at[6] - 0.4, {}).walk([IX + 3.7, -2.8], { speed: 0.6 }).stand(1.4, { yaw: P / 2, faceTo: 'arin' }).until(300, { anim: 'crouch', emote: 'sad', faceTo: 'arin' }),
    },
    shots: sortShots([
      two(0, 4.4, 1, { fov: 36, dist2: 3.8 }),
      close(conf.at[0] - 0.2, 'arin', 0.5, { dist2: 0.9, fov: 28 }),
      orbit(conf.at[1] + 1.5, 'arin', 1.8, 0.0, 0.9, { dist2: 1.5, fov: 30 }),
      ecu(conf.at[2] + 1.5, 'arin', 0.3),
      fixed(conf.at[3] + 1.4, [IX + 4.7, 1.2, -2.2], [IX + 4.8, 1.15, -2.3], [IX + 5.1, 0.95, -3.4], undefined, { fov: 26 }),
      close(conf.at[4] - 0.2, 'arin', 0.4, { dist2: 0.85 }),
      close(conf.at[5] - 0.2, 'arin', -0.4, { dist2: 0.8, fov: 24 }),
      orbit(conf.at[6] - 0.3, 'mira', 1.5, 0.02, 0.4, { dist2: 1.2, fov: 28 }),
      ots(conf.at[7] - 0.3, 'arin', 'mira', 1, { fov: 30, dist2: 0.65 }),
      ecu(conf.at[7] + 5.2, 'mira', 0.25),
      close(conf.end - 2, 'arin', 0.5, { dist2: 0.9 }),
      two(conf.end - 0.6, 3.2, -1, { dist2: 4.4 }),
    ]),
    dialogue: conf.lines,
    sfx: [{ at: conf.at[3] + 0.8, name: 'click', vol: 0.3 }],
  }),
  sc({
    id: 'a4_night', name: 'Beneath the Stars', act: 4, env: 'station', dur: dur(40, night), music: 'emotional', mus: [{ at: night.end - 2, name: 'hope' }],
    light: light('night', { stars: 1, fogD: 0.004 }), fx: { fire: [0, 0, 13], wind: 0.15, dust: 0.1 }, ambience: { crickets: 0.25, wind: 0.12, fire: 0.5 }, surface: 'gravel', fadeIn: 'slow', fadeOut: 'slow',
    actors: {
      arin: track([-1.7, 13.8], P / 2, { anim: 'sit', emote: 'tired', look: [0, 6, 20] }).until(night.at[1], { look: 'mira', faceTo: 'mira' }).until(night.at[2] + 1, { look: [0, 8, 24], emote: 'sad', faceTo: null }).until(night.at[3] - 0.3, { emote: 'smile', look: 'mira' }).until(300, { emote: 'smile' }),
      mira: track([1.7, 13.6], -P / 2, { anim: 'sit', emote: 'sad', look: [0, 10, 24] }).until(night.at[1] - 0.2, { look: 'arin' }).until(night.at[3] - 0.3, { emote: 'neutral' }).until(300, { emote: 'smile', look: 'arin' }),
    },
    shots: sortShots([
      fixed(0, [0, 1.3, 9.6], [0, 1.5, 10.4], [0, 1.4, 15], [0, 2.8, 17], { fov: 42 }),
      two(8, 3.6, 1, { fov: 38, dist2: 3.0 }),
      close(night.at[1] + 0.5, 'arin', 0.7, { fov: 28 }),
      close(night.at[0] + 0.2, 'mira', 0.7, { fov: 28 }),
      orbit(night.at[2] + 0.2, 'arin', 1.3, 0.0, 0.6, { dist2: 1.0, fov: 26 }),
      orbit(night.at[3] + 0.5, 'mira', 1.4, 0.0, 0.5, { fov: 28 }),
      ecu(night.at[3] + 3.8, 'arin', 0.5),
      fixed(night.end + 4, [0, 1.0, 12], [0, 14, 4], [0, 1.6, 16], [0, 22, 30], { fov: 50 }),
    ]),
    dialogue: night.lines,
    sfx: [{ at: 1, name: 'bird', vol: 0.15 }],
  }),
];
