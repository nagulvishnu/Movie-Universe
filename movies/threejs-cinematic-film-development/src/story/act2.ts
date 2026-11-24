// ACT 2 — THE STRANGER
import { track } from './track';
import { close, cover, dur, fixed, follow, light, medium, orbit, ots, sc, seq, sortShots, two } from './helpers';
import type { SceneDef } from './types';

const P = Math.PI;

// ---- storage room encounter ----
const m1 = seq('a2a', 6.4, [
  ['mira', "Don't move!", { style: 'shout', gap: 0.9 }],
  ['arin', "Easy. I'm not armed."],
  ['mira', 'Who are you? How did you find this place?', { style: 'distress' }],
  ['arin', 'I heard a radio.'],
  ['mira', "That radio hasn't carried a human voice in five years."],
  ['arin', "Then it's louder than you think. Put the gun down. Please."],
]);
const m2 = seq('a2b', 1.2, [
  ['mira', "...You're real."],
  ['arin', 'Last time I checked.'],
  ['mira', "Five years. I haven't seen another living person in five years."],
  ['arin', 'Neither have I.', { emote: 'sad' }],
  ['arin', 'That radio. What are you doing with it?'],
  ['mira', "Listening. Every night, at exactly 11:47 PM, there's a transmission."],
  ['arin', '11:47.', { gap: 1.2 }],
  ['mira', 'The same minute the world went silent. I know.'],
  ['mira', "It says to come to Station 17. A research station, hundreds of kilometres north."],
  ['arin', "It's a trap. Nobody broadcasts into an empty world for five years unless they want something."],
  ['mira', "Or unless they're waiting for someone to answer."],
]);
const m3 = seq('a2c', 2.6, [
  ['mira', 'Listen.', { gap: 1.8 }],
  ['radio', 'If anyone can hear me... please come to Station 17. We are still here.', { style: 'radio', label: 'TRANSMISSION', gap: 2.6 }],
  ['arin', "That's a human voice.", { emote: 'sad', gap: 1.2 }],
  ['mira', 'I know.'],
  ['arin', "I'd forgotten what one sounded like."],
  ['mira', 'Then come with me. Help me find where it comes from.'],
  ['arin', 'It could still be a trap.', { emote: 'worried' }],
  ['mira', "Then we'll find out together."],
  ['arin', 'I work alone.'],
  ['mira', "Then you've been doing it wrong.", { emote: 'smile' }],
  ['arin', '...We leave at first light.', { gap: 1 }],
]);

const MIRA_AIM = { anim: 'aim' as const, prop: 'gun' as const, faceTo: 'arin' as const, emote: 'fear' as const, look: 'arin' as const };

export const act2: SceneDef[] = [
  sc({
    id: 'a2_arrive', name: 'The Supermarket', act: 2, env: 'city', mode: 'ruined', dur: 26, music: 'suspense',
    light: light('overcast'), fx: { dust: 0.3, debris: 0.5, wind: 0.4 }, ambience: { wind: 0.3, birds: 0.1, creaks: 0.3 }, surface: 'concrete', fadeIn: 'slow', fadeOut: 'dip',
    cards: [{ at: 0.8, dur: 5.5, text: 'ACT TWO', sub: 'THE STRANGER', style: 'act' }],
    actors: { arin: track([0, -1], P, { emote: 'tired' }).walk([0, -19.8]).walk([-9.4, -20.1]).stand(3, { anim: 'lookAround', emote: 'worried', yaw: -P / 2 }) },
    shots: [
      fixed(0, [3, 1.7, -32], [3, 1.7, -30], [0, 1.5, -6], undefined, { fov: 40 }),
      follow(9, 'arin', [3.5, 0.7, 6.5], [3.5, 0.9, 4], { fov: 36, shake: 0.004 }),
      fixed(16, [-2, 1.5, -30], [-3, 1.5, -28], [-10, 1.4, -20.2], undefined, { fov: 40 }),
      orbit(21, 'arin', 1.5, 0.0, 0.7, { fov: 28 }),
    ],
    sfx: [{ at: 1, name: 'gust', vol: 0.5 }, { at: 19, name: 'static', vol: 0.18 }, { at: 23, name: 'radioTune', vol: 0.2 }],
  }),
  sc({
    id: 'a2_inside', name: 'Empty Aisles', act: 2, env: 'supermarket', dur: 28, music: 'suspense',
    light: light('interiorDay'), fx: { dust: 0.9, wind: 0.1 }, ambience: { room: 0.25, wind: 0.1, creaks: 0.3 }, surface: 'tile', fadeIn: 'dip', fadeOut: 'dip',
    actors: { arin: track([0, 13.6], P, { emote: 'worried' }).walk([0, -3], { speed: 1.1 }).stand(3.2, { anim: 'lookAround', look: [0, 1.5, -15] }).walk([0, -13.6], { speed: 1.25, look: [0, 1.5, -15] }) },
    shots: [
      fixed(0, [0, 1.5, -9], [0, 1.5, -11], [0, 1.6, 10], undefined, { fov: 40 }),
      follow(8, 'arin', [1.8, 1.0, 5], [1.8, 1.2, 4], { fov: 36, shake: 0.003 }),
      orbit(15.4, 'arin', 1.5, 0.0, 0.5, { fov: 28 }),
      fixed(19, [2, 1.3, 2], [1.2, 1.3, -2], [0, 1.4, -14.5], undefined, { fov: 40 }),
      orbit(24, 'arin', 3, 0.2, 2.8, { fov: 34 }),
    ],
    sfx: [{ at: 1.5, name: 'dishes', vol: 0.3 }, { at: 11, name: 'metalHit', vol: 0.3 }, { at: 14.5, name: 'radioTune', vol: 0.45 }, { at: 20, name: 'static', vol: 0.3 }],
  }),
  sc({
    id: 'a2_confront', name: 'Neither Trusts the Other', act: 2, env: 'supermarket', dur: dur(14, m1), music: 'tension',
    light: light('interiorDim'), fx: { dust: 0.8 }, ambience: { room: 0.3, electric: 0.12, static: 0.1 }, surface: 'concrete', fadeIn: 'dip', fadeOut: 'cut',
    actors: {
      mira: track([3.5, -27.6], P, { emote: 'determined', prop: 'radio' }).stand(4.2, { anim: 'work' }).stand(0.8, { anim: 'idle', look: [0, 1.5, -15] }).stand(30, MIRA_AIM),
      arin: track([0, -15.4], P, { emote: 'worried' }).stand(1.0).walk([0.8, -23.5], { speed: 1.55 }).stand(30, { anim: 'handsUp', look: 'mira', faceTo: 'mira' }),
    },
    shots: sortShots([
      fixed(0, [-6, 3.0, -17.5], [-5, 2.8, -19], [3, 1.4, -27.5], undefined, { fov: 44 }),
      orbit(3.3, 'mira', 1.5, 0.05, 1.35, { fov: 30 }),
      ots(5.2, 'arin', 'mira', 1, { fov: 32 }),
      ...cover(m1, (s, at, i) => (s === 'mira' ? close(at, 'mira', 0.35, { shake: 0.004 }) : i % 2 ? close(at, 'arin', 0.4) : ots(at, 'arin', 'mira', -1, { fov: 34 })), 0.15).filter((s) => s.at > 6),
    ]),
    dialogue: m1.lines,
    sfx: [{ at: 4.0, name: 'metalHit', vol: 0.6 }, { at: 4.6, name: 'click', vol: 0.8 }, { at: 5.0, name: 'sting', vol: 0.5 }],
  }),
  sc({
    id: 'a2_talk', name: 'Station 17', act: 2, env: 'supermarket', dur: dur(30, m2), music: 'suspense',
    light: light('interiorDim'), fx: { dust: 0.8 }, ambience: { room: 0.3, electric: 0.12, static: 0.08 }, surface: 'concrete', fadeIn: 'cut', fadeOut: 'cut',
    actors: {
      mira: track([3.5, -27.6], P, MIRA_AIM).stand(2.6, { anim: 'aim' }).stand(1.2, { anim: 'idle', prop: 'none', emote: 'worried', look: 'arin', faceTo: 'arin' }).walk([2.9, -27.1], { speed: 0.6 }).stand(60, { anim: 'idle', prop: 'radio', emote: 'neutral', faceTo: 'arin' }),
      arin: track([0.8, -23.5], P, { emote: 'worried', look: 'mira', faceTo: 'mira' }).stand(2.0, { anim: 'handsUp' }).stand(1.5, { anim: 'idle' }).walk([1.3, -24.8], { speed: 0.5 }).stand(60, { anim: 'idle', faceTo: 'mira', emote: 'neutral' }),
    },
    shots: sortShots([
      two(0, 2.8, 1, { fov: 40 }),
      ...cover(m2, (s, at, i) => (s === 'mira' ? (i % 3 === 2 ? ots(at, 'arin', 'mira', 1) : close(at, 'mira', 0.4)) : (i % 3 === 1 ? ots(at, 'mira', 'arin', 1) : close(at, 'arin', 0.4, { shake: 0.003 }))), 0.1),
      two(m2.at[7] - 0.2, 2.6, -1, { dist2: 2.2 }),
      two(m2.at[9] - 0.3, 3.0, 1, { dist2: 2.4, h: 0.0 }),
    ]),
    dialogue: m2.lines,
    sfx: [{ at: 1.0, name: 'click', vol: 0.6 }, { at: 9, name: 'static', vol: 0.15 }],
  }),
  sc({
    id: 'a2_signal', name: 'A Human Voice', act: 2, env: 'supermarket', dur: dur(34, m3), music: 'sorrow',
    light: light('interiorDim'), fx: { dust: 0.8 }, ambience: { room: 0.3, electric: 0.1 }, surface: 'concrete', fadeIn: 'cut', fadeOut: 'dip',
    actors: {
      mira: track([2.9, -27.1], P, { prop: 'radio', faceTo: 'arin', look: 'arin', emote: 'neutral' }).stand(2.2, { anim: 'idle' }).stand(2.5, { anim: 'work', look: 'none' }).stand(9, { anim: 'idle', look: 'arin', emote: 'worried' }).stand(80, { anim: 'idle', emote: 'neutral' }),
      arin: track([1.3, -24.8], P, { emote: 'worried', look: 'mira', faceTo: 'mira' }).stand(5.5, {}).stand(2.0, { yaw: -2.7, faceTo: null, look: 'none', emote: 'sad' }).stand(10.5, { emote: 'sad' }).stand(80, { faceTo: 'mira', look: 'mira', emote: 'tired' }),
    },
    shots: sortShots([
      two(0, 3.0, 1, { fov: 40 }),
      close(m3.at[1] - 0.2, 'arin', 0.35, { dist2: 0.85, fov: 26 }),
      ecu(m3.at[1] + 3.2, 'arin'),
      ...cover(
        { ...m3, lines: m3.lines.slice(2), at: m3.at.slice(2) },
        (s, at, i) => (s === 'mira' ? close(at, 'mira', 0.4) : i % 2 ? close(at, 'arin', 0.4) : ots(at, 'mira', 'arin', 1)), 0.1,
      ),
      two(m3.at[m3.at.length - 1] - 0.5, 3.2, -1, { dist2: 3.6, h: 0.2 }),
    ]),
    dialogue: m3.lines,
    sfx: [{ at: m3.at[1] - 0.8, name: 'radioTune', vol: 0.6 }, { at: m3.at[1] + 4.6, name: 'static', vol: 0.4 }, { at: m3.at[1] + 5.2, name: 'static', vol: 0.2 }],
  }),
  sc({
    id: 'a2_leave', name: 'Into the City', act: 2, env: 'city', mode: 'ruined', dur: 30, music: 'emotional',
    light: light('sunrise', { fogD: 0.006, sunI: 2.0 }), fx: { dust: 0.4, debris: 0.5, wind: 0.35 }, ambience: { wind: 0.3, birds: 0.35 }, surface: 'concrete', fadeIn: 'slow', fadeOut: 'slow',
    actors: {
      arin: track([-10.3, -20.8], P / 2, { emote: 'neutral' }).stand(1.5).walk([-0.8, -20.4]).walk([-0.8, 40], { speed: 1.35 }),
      mira: track([-10.3, -19.4], P / 2, { emote: 'neutral', prop: 'radio' }).stand(1.5).walk([0.8, -20.0]).walk([0.8, 40], { speed: 1.35 }),
    },
    shots: [
      fixed(0, [4, 2.0, -32], [5, 2.5, -33], [-8, 1.4, -20.5], undefined, { fov: 42 }),
      fixed(8, [0, 5, -28], [0, 14, -48], [0, 0.5, 8], [0, 0, 16], { fov: 44 }),
      fixed(17, [-12, 30, -62], [-6, 38, -86], [0, 0, 12], undefined, { fov: 46 }),
    ],
    sfx: [{ at: 0.5, name: 'bird', vol: 0.5 }, { at: 11, name: 'bird', vol: 0.4 }],
  }),
];

function ecu(at: number, subject: 'arin' | 'mira') { return orbit(at, subject, 0.62, 0.02, 0.2, { dist2: 0.55, fov: 22 }); }
void medium;
