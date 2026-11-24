// ACT 1 — THE WORLD THAT DISAPPEARED
import { track } from './track';
import { close, fixed, fixedOn, follow, light, merge, orbit, sc, seq, dur } from './helpers';
import type { SceneDef } from './types';

const morning = seq('a1m', 2.2, [
  ['narrator', 'It was a morning like any other.'],
  ['narrator', 'Eight billion people, all certain that tomorrow would come.'],
]);

const s1147 = seq('a1v', 4.2, [
  ['narrator', 'At 11:47 AM, everything electric simply stopped.'],
  ['narrator', 'Every engine. Every phone. Every light.'],
]);
const s1147b = seq('a1w', 15.5, [['narrator', 'And then... they were gone.', { style: 'narration' }]]);

const silence = seq('a1s', 1.2, [
  ['narrator', 'Millions of people vanished.'],
  ['narrator', 'No explosions. No warning.'],
  ['narrator', 'Only their belongings remained, exactly where they had been left.'],
]);

const ruins = seq('a1r', 8, [
  ['narrator', 'The world did not end with a sound.'],
  ['narrator', 'It simply went quiet.'],
]);

const scav = seq('a1c', 3, [
  ['narrator', 'Arin searched for food. For medicine. For anything that still worked.'],
  ['narrator', 'Mostly, he searched for a sign that he was not the last.', { gap: 1 }],
]);

const camp = seq('a1k', 5, [
  ['narrator', 'Every night, the same photograph.'],
  ['narrator', 'Every night, the same silence.'],
]);

export const act1: SceneDef[] = [
  sc({
    id: 'a1_morning', name: 'The Last Ordinary Morning', act: 1, env: 'city', mode: 'alive', params: {}, dur: 36, music: 'peace',
    light: light('dayWarm'), fx: { dust: 0.1, wind: 0.2 }, ambience: { city: 0.55, birds: 0.35, wind: 0.08 }, surface: 'concrete', fadeIn: 'slow', fadeOut: 'dip',
    cards: [{ at: 0.8, dur: 5.5, text: 'ACT ONE', sub: 'THE WORLD THAT DISAPPEARED', style: 'act' }],
    shots: [
      fixed(0, [0, 38, -142], [0, 24, -104], [0, 4, -30], undefined, { fov: 42 }),
      fixed(8, [0, 1.4, 12], null, [-76, 135, 20], [152, 135, 20], { fov: 40 }),
      fixed(14, [-3, 1.5, 34], [-2, 1.5, 27], [8.8, 1.6, 12], [8.8, 1.6, 4], { fov: 36 }),
      fixed(21, [8, 1.3, -6], [9, 1.4, -9], [21, 1.0, -21], [22, 1.0, -21], { fov: 38 }),
      fixed(28, [0, 3, 10], null, [0, 11, 45], undefined, { fov: 40 }),
    ],
    dialogue: morning.lines,
    sfx: [{ at: 0.2, name: 'bird', vol: 0.5 }, { at: 9, name: 'plane', vol: 0.6 }, { at: 11, name: 'horn', vol: 0.4 }, { at: 28, name: 'train', vol: 0.7 }, { at: 19, name: 'bird', vol: 0.4 }],
  }),
  sc({
    id: 'a1_1146', name: '11:46 AM', act: 1, env: 'city', mode: 'alive', params: { stopAt: 12.5 }, dur: 12, music: 'tension',
    light: light('dayWarm'), fx: { dust: 0.1, wind: 0.2 }, ambience: { city: 0.6, wind: 0.08 }, surface: 'concrete', fadeIn: 'dip', fadeOut: 'cut',
    cards: [{ at: 0.4, dur: 6, text: '11:46 AM', style: 'clock' }],
    shots: [
      fixed(0, [-2, 1.6, -22], [-3, 1.8, -12], [7.2, 5.2, 7.5], undefined, { fov: 36 }),
      fixed(4, [6.5, 0.9, -34], [6.5, 0.9, -22], [2.6, 0.7, -5], undefined, { fov: 40 }),
      fixed(8, [-3, 2.2, 18], [-2, 2.2, 14], [0, 4, 0], undefined, { fov: 38 }),
    ],
    sfx: [{ at: 3, name: 'horn', vol: 0.5 }, { at: 7, name: 'bird', vol: 0.4 }],
  }),
  sc({
    id: 'a1_1147', name: '11:47 AM', act: 1, env: 'city', mode: 'alive', params: { stopAt: 12.5, tOff: 12, vanishAt: 24 }, dur: dur(30, s1147, s1147b), music: 'silence',
    light: light('dayWarm'), fx: { dust: 0.1, wind: 0.15 }, ambience: { wind: 0.1 }, surface: 'concrete', fadeIn: 'cut', fadeOut: 'slow',
    cards: [{ at: 0.2, dur: 5, text: '11:47 AM', style: 'clock' }],
    shots: [
      fixed(0, [0, 1.7, -20], [0, 1.7, -10], [0, 2, 10], undefined, { fov: 40 }),
      fixed(6, [-5, 1.7, 19], [-3, 1.7, 16], [0, 1.5, 8.9], undefined, { fov: 36 }),
      fixed(11, [4, 1.6, 20], [2, 1.6, 17], [0, 1.2, 8.9], undefined, { fov: 34 }),
      fixed(15, [0, 10, -6], [0, 17, -26], [0, 0, 12], undefined, { fov: 46 }),
      fixed(23, [3, 0.8, 20], [3, 0.8, 14], [1, 0.2, 8.9], undefined, { fov: 36 }),
    ],
    dialogue: merge(s1147, s1147b),
    sfx: [{ at: 0.45, name: 'powerDown', vol: 0.9 }, { at: 0.45, name: 'stall', vol: 0.8 }, { at: 1.2, name: 'horn', vol: 0.4 }, { at: 9.4, name: 'vanish', vol: 1 }, { at: 13.2, name: 'sting', vol: 0.6 }],
  }),
  sc({
    id: 'a1_plane', name: 'Aircraft', act: 1, env: 'city', mode: 'alive', params: { tOff: 7, stopAt: 11 }, dur: 10, music: 'suspense',
    light: light('dayWarm'), fx: { wind: 0.15 }, ambience: { wind: 0.1, static: 0.08 }, surface: 'concrete', fadeIn: 'cut', fadeOut: 'cut',
    cards: [{ at: 0.4, dur: 6, text: '11:47 AM', sub: 'EVERYWHERE', style: 'place' }],
    shots: [fixed(0, [0, 1.4, 10], null, [-114, 135, 20], [228, 135, 20], { fov: 38 })],
    dialogue: seq('a1p', 0.8, [
      ['radio', 'Flight twenty-two ninety, Tower. Do you copy?', { style: 'radio', label: 'TOWER' }],
      ['radio', 'Any aircraft, any station... we have lost everything.', { style: 'radio', label: 'TOWER' }],
    ]).lines,
    sfx: [{ at: 0.2, name: 'plane', vol: 0.5 }, { at: 4.4, name: 'powerDown', vol: 0.5 }],
  }),
  sc({
    id: 'a1_highway', name: 'Everywhere', act: 1, env: 'highway', mode: 'alive', params: { stopAt: 4 }, dur: 9, music: 'suspense',
    light: light('dayAlive'), fx: { wind: 0.2 }, ambience: { city: 0.35, wind: 0.1 }, surface: 'concrete', fadeIn: 'cut', fadeOut: 'dip',
    shots: [
      fixed(0, [-2, 1.3, -70], [-2, 1.3, -40], [5, 1, 0], undefined, { fov: 40 }),
      fixed(4.5, [10, 6, -20], [10, 6, -5], [-9, 0.5, 20], undefined, { fov: 40 }),
    ],
    dialogue: seq('a1h', 3.4, [['narrator', 'It happened everywhere. At the same moment.']]).lines,
    sfx: [{ at: 3.2, name: 'powerDown', vol: 0.5 }, { at: 3.2, name: 'stall', vol: 0.6 }, { at: 3.4, name: 'horn', vol: 0.4 }, { at: 5.2, name: 'sting', vol: 0.4 }],
  }),
  sc({
    id: 'a1_silence', name: 'The Day of Silence', act: 1, env: 'city', mode: 'alive', params: { stopAt: 12.5, tOff: 44, vanishAt: 24 }, dur: silence.end + 7, music: 'sorrow',
    light: light('dayWarm', {}, { sunI: 0.7, cloud: 0.9, cloudDark: 0.35, hemiI: 0.6 }), fx: { dust: 0.2, wind: 0.2 }, ambience: { wind: 0.15, birds: 0.15 }, surface: 'concrete', fadeIn: 'slow', fadeOut: 'slow',
    cards: [{ at: silence.end + 0.2, dur: 5.5, text: 'THE DAY OF SILENCE', style: 'title' }],
    shots: [
      fixed(0, [4, 1.6, 22], [4, 1.6, 12], [0.5, 0.3, 8.9], undefined, { fov: 38 }),
      fixed(7, [0, 8, -14], [0, 26, -40], [0, 0, 20], undefined, { fov: 46 }),
    ],
    dialogue: silence.lines,
  }),
  sc({
    id: 'a1_ruins', name: 'Five Years Later', act: 1, env: 'city', mode: 'ruined', dur: dur(34, ruins), music: 'haunting',
    light: light('dayRuined'), fx: { dust: 0.35, debris: 0.6, wind: 0.45 }, ambience: { wind: 0.38, birds: 0.3, creaks: 0.2 }, surface: 'concrete', fadeIn: 'slow', fadeOut: 'dip',
    cards: [{ at: 0.8, dur: 5.5, text: 'FIVE YEARS LATER', style: 'place' }],
    actors: { arin: track([0, -72], 0, { emote: 'tired' }).walk([0, -12], { speed: 1.3 }) },
    shots: [
      fixed(0, [0, 52, -134], [0, 30, -108], [0, 2, -60], undefined, { fov: 42 }),
      follow(9, 'arin', [2.4, 0.6, -9], [2.4, 0.8, -5], { fov: 36, shake: 0.004 }),
      orbit(17, 'arin', 4.2, 0.0, Math.PI * 0.75, { dist2: 3.4, fov: 36 }),
      orbit(24, 'arin', 1.7, 0.0, -1.57, { dist2: 1.35, fov: 30, shake: 0.004 }),
    ],
    dialogue: ruins.lines,
    sfx: [{ at: 1, name: 'gust', vol: 0.6 }, { at: 10, name: 'bird', vol: 0.5 }, { at: 22, name: 'metalHit', vol: 0.25 }],
  }),
  sc({
    id: 'a1_scavenge', name: 'Scavenging', act: 1, env: 'city', mode: 'ruined', dur: dur(26, scav), music: 'haunting',
    light: light('dusk'), fx: { dust: 0.3, debris: 0.4, wind: 0.4 }, ambience: { wind: 0.35, birds: 0.15, creaks: 0.2 }, surface: 'gravel', fadeIn: 'dip', fadeOut: 'dip',
    actors: { arin: track([9.2, -63], 0, { emote: 'tired' }).walk([9.2, -52]).stand(0.8, { yaw: Math.PI / 2 }).stand(6, { anim: 'crouch', yaw: Math.PI / 2 }).stand(2.5, { anim: 'idle', emote: 'neutral' }).stand(6, { emote: 'sad', look: [40, 12, -40] }) },
    shots: [
      fixed(0, [4, 1.5, -66], [4, 1.2, -58], [9, 1, -52], undefined, { fov: 42 }),
      orbit(9, 'arin', 2.4, 0.1, -0.8, { fov: 34 }),
      fixedOn(15, [3, 2.8, -46], [3, 2.6, -49], 'arin', { fov: 40 }),
      orbit(20, 'arin', 1.3, 0.0, 0.5, { fov: 28 }),
    ],
    dialogue: scav.lines,
    sfx: [{ at: 11, name: 'metalHit', vol: 0.4 }, { at: 12, name: 'paper', vol: 0.5 }],
  }),
  sc({
    id: 'a1_camp', name: 'The Photograph', act: 1, env: 'city', mode: 'ruined', dur: 40, music: 'sorrow',
    light: light('night'), fx: { fire: [-4, 0, 22], dust: 0.15, wind: 0.2 }, ambience: { crickets: 0.3, wind: 0.12, fire: 0.55 }, surface: 'concrete', fadeIn: 'slow', fadeOut: 'slow',
    actors: {
      arin: track([-1.0, 12], 0.2, { emote: 'tired' }).walk([-2.9, 23.0]).stand(1.0, { yaw: -2.3 }).stand(4, { anim: 'sitGround', yaw: -2.3 })
        .stand(10, { anim: 'sitGround', prop: 'photo', emote: 'sad', look: 'none' }).stand(3, { prop: 'none', emote: 'tired' }).walk([-4.6, 23.2], { speed: 0.8 }).stand(14, { anim: 'sleep', yaw: Math.PI / 2, emote: 'sleep', y: 0 }),
    },
    shots: [
      fixed(0, [8, 3.5, 38], [8, 3, 31], [-4, 1, 20], undefined, { fov: 44 }),
      orbit(9, 'arin', 2.6, 0.2, -0.9, { fov: 34, lookOff: [0, -0.3, 0] }),
      orbit(17, 'arin', 1.25, 0.1, 0.5, { dist2: 1.0, fov: 28, lookOff: [0, -0.25, 0.05] }),
      close(25, 'arin', -0.5, { h: 0.0 }),
      fixed(31, [3, 2.6, 28], [3, 1.9, 27], [-5.5, 0.2, 23], undefined, { fov: 40 }),
    ],
    dialogue: camp.lines,
    sfx: [{ at: 18, name: 'paper', vol: 0.4 }],
  }),
];
