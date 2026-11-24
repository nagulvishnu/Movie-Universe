import type { Key, Line, SceneDef } from './types';
import { K, Ka, L, PI, S, face } from './types';
import { lookKeys, sleepAt } from './helpers';

// ============================================================ SCENE 6 — THE MORNING AFTER
const s06aLines: Line[] = [
  L(1.5, 'noah', 'noah', 'I heard her, Adam. I swear it was my mom.'),
  L(6.8, 'adam', 'adam', 'You were half asleep. Dreams feel real in a new place.'),
  L(12.0, 'noah', 'noah', 'Then why did you hear it too?'),
  L(16.0, 'adam', 'adam', 'I heard something. A bird. A fox, maybe.'),
  L(20.5, 'lena', 'lena', 'Foxes can scream like women. It\u2019s a real thing.'),
  L(25.5, 'emily', 'emily', 'Guys... come look at this.'),
  L(29.0, 'emily', 'emily', 'Those footprints outside the window. They weren\u2019t there yesterday.'),
  L(34.5, 'lena', 'lena', 'Bare feet. In this cold?'),
  L(37.5, 'adam', 'adam', 'Let\u2019s take a look.'),
];
const s06a: SceneDef = {
  id: 's06a', title: 'The Morning After', env: 'cabin', opts: { time: 'day', fog: 0.012 }, dur: 41, fin: 1.4, fout: 0.6,
  amb: { room: 0.2, wind: 0.1, fire: 0.3 }, music: 'sad', mvol: 0.3,
  cards: [{ t: 1.0, d: 3.5, text: 'MORNING', style: 'time' }],
  actors: {
    noah: { char: 'noah', keys: [K(0, 0.5, 0.7, 0, 'sit', { e: 'tired' }), ...lookKeys('noah', 'sit', s06aLines, 'adam').filter((k) => k.t < 25), K(26, 0.5, 0.7, 0, 'walk'), K(30, -2.6, 2.3, PI / 2.2, 'walk'), K(31, -2.6, 2.3, 0.5, 'idle', { l: [-1.8, 1.2, 3.4], e: 'worry' })] },
    adam: { char: 'adam', keys: [K(0, 1.5, 2.3, PI, 'sit', { l: 'noah', e: 'worry' }), ...lookKeys('adam', 'sit', s06aLines, 'noah').filter((k) => k.t < 24), K(26, 1.5, 2.3, PI, 'walk'), K(30, -0.9, 2.3, 0.3, 'walk'), K(31, -0.9, 2.3, 0.1, 'idle', { l: [-1.8, 1.2, 3.4], e: 'worry' })] },
    lena: { char: 'lena', keys: [K(0, 2.3, -2.0, PI, 'idle', { l: 'noah', e: 'worry' }), Ka(20, 'idle', { l: 'adam', e: 'neutral' }), K(26, 2.3, -2.0, PI, 'walk'), K(30.5, -1.3, 1.6, 0.3, 'walk'), K(31.5, -1.3, 1.6, 0.1, 'idle', { l: [-1.8, 1.2, 3.4], e: 'worry' })] },
    emily: { char: 'emily', keys: [K(0, -1.8, 2.3, 0, 'idle', { l: [-1.8, 1.2, 3.8], e: 'worry' }), Ka(25.5, 'idle', { e: 'fear' }), Ka(29, 'idle', { e: 'fear' })] },
  },
  shots: [
    S(0, 8, [3.5, 1.9, 2.4], [0, 1, 0], { to: [3.0, 1.7, 2.0], fov: 46 }),
    S(8, 8, [0.4, 1.35, 2.3], 'noah', { to: [0.7, 1.35, 2.0], fov: 34 }),
    S(16, 9.5, [0.6, 1.45, -0.6], 'lena', { to: [0.9, 1.45, -0.8], fov: 36 }),
    S(25.5, 6, [-0.9, 1.5, 1.0], 'emily', { fov: 32 }),
    S(31.5, 9.5, [0.4, 1.6, 0.4], [-1.8, 1.4, 2.8], { to: [0.0, 1.6, 0.8], fov: 44 }),
  ],
  lines: s06aLines,
  cues: [{ t: 4, sfx: 'bird', pan: -0.6, vol: 0.35 }, { t: 24, sfx: 'steps', vol: 0.4 }],
};

const s06bLines: Line[] = [
  L(1.5, 'lena', 'lena', 'They look human. But look at the size.'),
  L(5.5, 'adam', 'adam', 'That\u2019s almost twice as long as mine.'),
  L(9.5, 'noah', 'noah', 'Okay. That\u2019s a big hiker.'),
  L(12.8, 'emily', 'emily', 'They don\u2019t stop. They come right up to the window, and then they just... end.', { dur: 7 }),
  L(20.5, 'adam', 'adam', 'Somebody\u2019s playing a joke on us. Or somebody lives out here.'),
  L(26.3, 'lena', 'lena', 'Then let\u2019s find out who.'),
  L(29.5, 'adam', 'adam', 'We stay together. Nobody goes anywhere alone.'),
  L(33.5, 'emily', 'emily', 'Adam, I want to go home.'),
  L(37.0, 'adam', 'adam', 'One walk. If we find nothing, we pack up and leave.'),
];
const walkOff = (x: number, z: number, t0: number): Key[] => [K(t0, x, z, face(x, z, -14, -7.5), 'walk'), K(t0 + 7, x - 6.6 + (x % 1), z - 5.3, face(x, z, -14, -7.5), 'walk')];
const s06b: SceneDef = {
  id: 's06b', title: 'Footprints', env: 'cabin', opts: { time: 'day', footprints: true, fog: 0.012 }, dur: 49, fin: 0.6, fout: 1.0,
  amb: { wind: 0.15 }, music: 'dread', mvol: 0.3,
  actors: {
    lena: { char: 'lena', keys: [K(0, -7.4, -2.3, 0.7, 'crouch', { l: [-7.8, 0, -2.0], e: 'worry' }), K(26, -7.4, -2.3, 0.7, 'crouch'), K(26.8, -7.4, -2.3, 0.7, 'idle', { l: [-14, 1.4, -7.5], e: 'angry' }), ...walkOff(-7.4, -2.3, 41)] },
    adam: { char: 'adam', keys: [K(0, -6.5, -1.0, -2.2, 'idle', { l: [-7.5, 0, -2.4], e: 'worry' }), Ka(5.5, 'idle', { l: [-7.8, 0, -2.0] }), Ka(20.5, 'idle', { l: [-14, 1.4, -7.5] }), ...walkOff(-6.4, -1.3, 41.6)] },
    noah: { char: 'noah', keys: [K(0, -8.6, -1.0, 2.2, 'idle', { l: [-7.8, 0, -2.0], e: 'worry' }), Ka(9.5, 'idle', { l: 'adam', e: 'smile' }), Ka(14, 'idle', { l: 'emily', e: 'worry' }), ...walkOff(-8.6, -1.0, 42.2)] },
    emily: { char: 'emily', keys: [K(0, -5.2, 1.2, 0.5, 'idle', { l: [-4.5, 1.4, 0.8], e: 'fear' }), Ka(20.5, 'idle', { l: 'adam', e: 'worry' }), Ka(33.5, 'idle', { l: 'adam', e: 'sad' }), ...walkOff(-5.2, 1.2, 42.8)] },
  },
  shots: [
    S(0, 7, [-8.4, 0.5, -3.4], [-7.4, 0.1, -2.2], { to: [-8.0, 0.45, -3.0], fov: 38 }),
    S(7, 6, [-3.0, 1.6, 2.8], [-7.5, 1.0, -1.6], { to: [-3.4, 1.6, 2.2], fov: 42 }),
    S(13, 7.5, [-6.4, 1.5, 2.6], 'emily', { to: [-6.0, 1.5, 2.4], fov: 32 }),
    S(20.5, 9, [-9.5, 1.5, -3.8], 'adam', { to: [-9.2, 1.5, -3.2], fov: 38 }),
    S(29.5, 11, [-4.5, 1.6, -3.0], 'adam', { to: [-5.0, 1.6, -2.2], fov: 40 }),
    S(41, 8, [-5.5, 1.7, 1.0], [-10, 1.3, -5], { to: [-6.5, 1.8, 0.2], fov: 42, shake: 0.12 }),
  ],
  lines: s06bLines,
  cues: [{ t: 3, sfx: 'rustle', pan: -0.7, vol: 0.3 }, { t: 41, sfx: 'steps' }, { t: 44, music: 'tension', mvol: 0.3 }],
};

// ============================================================ SCENE 7 — THE HUNTING CABIN
const walkTo = (x0: number, z0: number, x1: number, z1: number, t0: number, t1: number, r = PI, e: Key['e'] = 'neutral'): Key[] => [K(t0, x0, z0, r, 'walk', { e }), K(t1, x1, z1, r, 'walk')];
const s07a: SceneDef = {
  id: 's07a', title: 'The Hunting Cabin', env: 'hunt', opts: { time: 'overcast', interior: true, fog: 0.022 }, dur: 18, fin: 0.8, fout: 0.5,
  amb: { wind: 0.3 }, music: 'dread', mvol: 0.35,
  actors: {
    adam: { char: 'adam', keys: [...walkTo(0.0, 17, 0.2, 6.0, 0, 9), K(10, 0.2, 6.0, PI, 'idle', { l: [0.3, 1.5, 2] })] },
    lena: { char: 'lena', keys: [...walkTo(-0.9, 18, -0.8, 6.6, 0, 9), K(10, -0.8, 6.6, PI, 'idle', { l: [0.3, 1.5, 2] })] },
    noah: { char: 'noah', keys: [...walkTo(1.3, 18.5, 1.3, 6.8, 0, 9, PI, 'worry'), K(10, 1.3, 6.8, PI, 'idle', { l: [0.3, 1.5, 2], e: 'shock' }), Ka(14, 'idle', { l: 'emily' })] },
    emily: { char: 'emily', keys: [...walkTo(0.6, 19.5, 0.7, 7.6, 0, 9, PI, 'fear'), K(10, 0.7, 7.6, PI, 'fear', { l: [0.3, 1.5, 2], e: 'fear' })] },
  },
  shots: [S(0, 7, [4, 1.7, 26], [0.3, 1.5, 4], { to: [3.4, 1.7, 24], fov: 30 }), S(7, 11, [-3.0, 1.5, 11], [0.3, 1.4, 2], { to: [-2.0, 1.5, 9.4], fov: 40 })],
  lines: [
    L(2.5, 'noah', 'noah', 'Okay. Haunted hunting cabin. Of course.'),
    L(6.5, 'adam', 'adam', 'Looks like it\u2019s been abandoned for years.'),
    L(10.8, 'emily', 'emily', 'Then why does it look like someone just left?'),
  ],
  cues: [{ t: 0.4, sfx: 'steps', vol: 0.5 }, { t: 6, sfx: 'steps', vol: 0.5 }, { t: 12, sfx: 'creak', vol: 0.4 }],
};

const s07bLines: Line[] = [
  L(1.5, 'emily', 'emily', 'Adam... the walls.'),
  L(4.0, 'lena', 'lena', 'Newspaper clippings. \u201CThird hiker vanishes.\u201D This one\u2019s from nineteen ninety-eight.'),
  L(10.0, 'adam', 'adam', 'Someone was collecting these.'),
  L(13.2, 'noah', 'noah', 'Look at this. Someone drew the same thing over and over. Tall. Thin. Arms down to its knees.', { dur: 8 }),
  L(21.5, 'emily', 'emily', 'Please stop describing it.'),
  L(24.5, 'lena', 'lena', 'There\u2019s a cassette recorder. It\u2019s smashed. And a notebook.'),
  L(30.0, 'lena', 'lena', 'It doesn\u2019t hunt you by following your footsteps. It hunts you by becoming someone you trust.', { dur: 8 }),
  L(39.5, 'noah', 'noah', 'Okay. Not a fan. Zero stars.'),
  L(43.3, 'adam', 'adam', 'The last page is dated three weeks ago.'),
  L(48.0, 'lena', 'lena', 'That\u2019s after the search was called off.'),
  L(52.5, 'noah', 'noah', 'Hey. There\u2019s a photograph. A hunter with a little boy, right outside this cabin.', { dur: 7 }),
  L(60.0, 'lena', 'lena', 'Wait. Look between the trees behind them.'),
  L(64.0, 'noah', 'noah', '...Is that a person?'),
  L(67.0, 'adam', 'adam', 'It\u2019s a shadow. A tree. The film\u2019s old.'),
  L(71.5, 'noah', 'noah', 'You hold onto it. You\u2019re the one with pockets.'),
  L(77.0, 'adam', 'adam', 'Take the notebook. We\u2019re leaving.'),
];
const s07b: SceneDef = {
  id: 's07b', title: 'What They Left Behind', env: 'hunt', opts: { time: 'overcast', interior: true, fog: 0.022 }, dur: 83, fin: 0.6, fout: 0.8,
  amb: { wind: 0.2, room: 0.2 }, music: 'dread', mvol: 0.4,
  actors: {
    adam: { char: 'adam', keys: [K(0, 0.3, 4.2, PI, 'walk', { v: 0 }), K(1.0, 0.3, 4.0, PI, 'walk', { v: 1 }), K(3.4, 0.5, 0.7, PI, 'walk'), K(5, 1.5, -0.1, PI, 'idle', { l: [0.5, 1.5, -1.9], e: 'worry' }), ...lookKeys('adam', 'idle', s07bLines, 'lena').filter((k) => k.t > 9), Ka(24, 'idle', { l: 'lena' }), Ka(43.3, 'hold', { l: [0.6, 0.8, -0.85] }), Ka(46, 'idle', { l: 'lena' }), K(76, 1.5, -0.1, PI, 'idle'), K(78, 0.5, 0.6, 0, 'walk'), K(81, 0.3, 3.5, 0, 'walk')] },
    lena: { char: 'lena', keys: [K(0, -0.8, 4.2, PI, 'walk', { v: 0 }), K(1.8, -0.6, 3.8, PI, 'walk', { v: 1 }), K(4.4, -0.6, 0.3, PI, 'walk'), K(6, -0.6, 0.3, PI, 'idle', { l: [-0.5, 1.6, -1.9], e: 'worry' }), K(22.5, -0.6, 0.3, PI, 'idle'), K(25, 0.8, -0.15, PI, 'walk'), K(26, 0.8, -0.15, PI, 'idle', { l: [0.6, 0.8, -0.85] }), Ka(29.5, 'hold', { l: [0.62, 0.9, -0.85], e: 'worry' }), Ka(38, 'hold', { l: 'noah', e: 'fear' }), Ka(50, 'idle', { l: 'noah', e: 'worry' }), Ka(60, 'idle', { l: [0.2, 0.8, -1.15] }), K(77.5, 0.8, -0.15, PI, 'idle', { l: 'adam' }), K(79, 0.8, 0.6, 0, 'walk'), K(82, 0.7, 3.5, 0, 'walk')] },
    noah: { char: 'noah', keys: [K(0, 1.3, 4.2, PI, 'walk', { v: 0 }), K(2.4, 1.0, 3.8, PI, 'walk', { v: 1 }), K(5.5, -0.9, -1.2, PI, 'walk'), K(7, -0.9, -1.2, PI, 'idle', { l: [-0.9, 1.6, -1.9], e: 'shock' }), Ka(21.5, 'idle', { l: 'emily' }), Ka(39.5, 'idle', { l: 'adam', e: 'worry' }), K(51, -0.9, -1.2, PI, 'idle'), K(52.2, 0.1, -0.15, PI, 'walk'), K(53, 0.1, -0.15, PI, 'idle', { l: [0.2, 0.8, -1.15], e: 'worry' }), Ka(64, 'idle', { l: 'adam', e: 'shock' }), Ka(71, 'idle', { l: 'adam', e: 'worry' }), K(78, 0.1, -0.15, PI, 'idle'), K(79.5, 0.1, 0.8, 0, 'walk'), K(82.5, 0.3, 3.6, 0, 'walk')] },
    emily: { char: 'emily', keys: [K(0, 0.8, 4.2, PI, 'walk', { v: 0 }), K(3, 0.9, 3.8, PI, 'walk', { v: 1 }), K(5.2, 1.6, 1.2, PI, 'fear', { e: 'fear' }), K(9, 1.6, 1.2, PI, 'fear', { l: [0.5, 1.6, -1.9] }), Ka(21.5, 'fear', { l: 'noah' }), Ka(60, 'fear', { l: [0.2, 0.8, -1.15] }), K(79, 1.6, 1.2, PI, 'fear'), K(80.5, 1.0, 2.5, 0, 'walk'), K(83, 0.5, 3.6, 0, 'walk')] },
  },
  shots: [
    S(0, 6, [0.1, 1.5, -1.0], [0.3, 1.4, 2], { to: [0.2, 1.5, -0.6], fov: 44 }),
    S(6, 6, [0.0, 1.5, 0.9], [0, 1.4, -1.9], { to: [0.0, 1.5, 0.2], fov: 44 }),
    S(12, 8.5, [-0.6, 1.5, -0.1], 'noah', { fov: 34 }), S(20.5, 4, [0.4, 1.45, 0.4], 'emily', { fov: 36 }),
    S(24.5, 5.5, [0.5, 1.7, 0.8], [0.6, 0.85, -0.85], { to: [0.55, 1.45, 0.4], fov: 36 }), S(30, 9, [0.9, 1.5, 0.5], 'lena', { to: [0.7, 1.5, 0.3], fov: 30 }),
    S(39, 4.5, [-0.4, 1.5, -0.2], 'noah', { fov: 34 }), S(43.3, 8, [1.0, 1.55, 0.8], [0.4, 1.4, -0.4], { fov: 40 }),
    S(52, 7.5, [0.35, 1.3, -0.05], [0.2, 0.8, -1.15], { to: [0.25, 1.1, -0.3], fov: 30 }), S(59.5, 6, [0.2, 1.5, 0.8], 'lena', { fov: 32 }),
    S(65.5, 6, [-0.7, 1.5, 0.6], 'adam', { fov: 34 }), S(71.5, 6.5, [0.9, 1.5, 0.7], 'noah', { fov: 34 }),
    S(78, 5, [0.0, 1.6, -1.2], [0.3, 1.4, 3], { fov: 44 }),
  ],
  lines: s07bLines,
  cues: [{ t: 0.8, sfx: 'stepsWood', vol: 0.5 }, { t: 24, sfx: 'paper', vol: 0.5 }, { t: 29, music: 'tension', mvol: 0.4 }, { t: 37, sfx: 'sub', vol: 0.6 }, { t: 60.5, sfx: 'creak', vol: 0.5 }, { t: 78, sfx: 'stepsWood', vol: 0.5 }],
};

// ============================================================ SCENE 8 — THE WRONG LENA
const s08Lines: Line[] = [
  L(3.0, 'adam', 'adam', '...it hunts you by becoming someone you trust.', { dur: 4.5, rate: 0.85 }),
  L(9.5, '', 'lena', 'Adam... can you come here?', { fx: 'mimic', pan: 0.4, dur: 3 }),
  L(13.8, 'adam', 'adam', 'Lena?', { dur: 1.6 }),
  L(17.0, '', 'lena', 'Adam?', { fx: 'mimic', pan: 0.4, dur: 1.8 }),
  L(24.0, 'lena', 'lena', 'Mm... Adam? What\u2019s wrong?', { dur: 3 }),
  L(28.0, 'adam', 'adam', 'Nothing. ...Did you say my name just now?', { dur: 4.2 }),
  L(32.5, 'lena', 'lena', 'I was asleep.', { dur: 2 }),
  L(35.0, 'adam', 'adam', 'Right.', { dur: 1.6 }),
];
const s08: SceneDef = {
  id: 's08', title: 'The Wrong Lena', env: 'cabin', opts: { time: 'night', interior: false, fog: 0.04 }, dur: 44, fin: 1.2, fout: 1.5,
  amb: { room: 0.3, fire: 0.5, drone: 0.4 }, music: 'dread', mvol: 0.45,
  cards: [{ t: 0.8, d: 3, text: '11:52 PM', style: 'time' }],
  actors: {
    adam: { char: 'adam', keys: [K(0, -1.5, 1.05, PI / 2, 'sit', { l: [1, 1.0, 1.2], e: 'worry' }), Ka(9.5, 'sit', { l: 'lena', e: 'worry' }), Ka(10.8, 'sit', { l: [2.3, 1.3, -1.8], e: 'fear' }), Ka(13.8, 'sit', { l: 'lena' }), Ka(15, 'sit', { l: [2.3, 1.3, -1.8], e: 'fear' }), Ka(24, 'sit', { l: 'lena', e: 'worry' }), Ka(29, 'sit', { l: [2.3, 1.3, -1.8], e: 'worry' }), Ka(35, 'sit', { l: [2.3, 1.3, -1.8], e: 'fear' })] },
    lena: { char: 'lena', keys: [K(0, -1.5, 0.15, PI / 2, 'sit', { e: 'sleep', l: 'adam' }), K(23.8, -1.5, 0.15, PI / 2, 'sit', { e: 'tired', l: 'adam' }), Ka(28, 'sit', { e: 'worry', l: 'adam' }), Ka(35.5, 'sit', { e: 'worry', l: [2.3, 1.3, -1.8] })] },
    noah: { char: 'noah', keys: [sleepAt(-1.95, -1.05)] }, emily: { char: 'emily', keys: [sleepAt(-1.45, -1.05)] },
    fake: { char: 'lena', keys: [K(0, 2.3, -1.8, -1.01, 'idle', { v: 0, u: 1, e: 'neutral', l: 'adam' }), K(15, 2.3, -1.8, -1.01, 'idle', { v: 1 }), Ka(19, 'idle', { u: 1.15 }), K(24.1, 2.3, -1.8, -1.01, 'idle', { v: 0 })] },
  },
  shots: [
    S(0, 9, [0.4, 1.0, 0.7], [-1.5, 0.95, 0.6], { to: [0.0, 1.0, 0.65], fov: 36 }),
    S(9, 6.5, [-0.2, 1.1, 1.1], 'adam', { fov: 28 }),
    S(15.5, 8.5, [-3.0, 1.35, 1.2], [2.3, 1.2, -1.8], { to: [-2.5, 1.35, 1.1], fov: 36 }),
    S(24, 5, [0.1, 1.0, 0.7], [-1.5, 0.95, 0.6], { fov: 36 }),
    S(29, 15, [-0.5, 1.1, 1.0], 'adam', { to: [-0.8, 1.12, 1.0], fov: 22 }),
  ],
  lines: s08Lines,
  cues: [{ t: 15, sfx: 'creak', pan: 0.5, vol: 0.4 }, { t: 17.5, sfx: 'heartbeat', vol: 0.6 }, { t: 20, sfx: 'whisper', pan: 0.6, vol: 0.4 }, { t: 24, sfx: 'sub', vol: 0.6 }, { t: 36, music: 'drone', mvol: 0.5 }],
};

// ============================================================ SCENE 9 — THE RADIO WARNING
const s09Lines: Line[] = [
  L(1.5, 'noah', 'noah', 'Found something. Emergency radio. Crank-powered. It\u2019s older than my dad.', { dur: 5.4 }),
  L(7.2, 'adam', 'adam', 'If it works, we can call for help. Try the emergency band.', { dur: 5 }),
  L(14.5, 'lena', 'lena', 'Anything?'),
  L(16.5, 'noah', 'noah', 'Static. Static. And more static.'),
  L(20.5, '', 'radio', 'If you\u2019re hearing this, leave the forest before sunset. It has already learned your voices.', { fx: 'radio', dur: 8 }),
  L(29.8, 'emily', 'emily', 'Who is that?'),
  L(32.0, 'adam', 'adam', 'It\u2019s a recording. Has to be.'),
  L(37.5, '', 'adam', 'Open the door. It\u2019s me.', { fx: 'radio', dur: 3 }),
  L(41.0, 'adam', 'adam', 'That\u2019s not... I didn\u2019t say that.'),
  L(44.5, '', 'lena', 'Adam, please. I\u2019m freezing.', { fx: 'radio', dur: 3 }),
  L(48.0, 'lena', 'lena', 'Adam. I\u2019m right here.'),
  L(51.0, 'noah', 'noah', 'It\u2019s using our voices.'),
  L(54.0, 'emily', 'emily', 'Then it\u2019s been listening to us. This whole time.', { dur: 4.6 }),
  L(59.0, 'adam', 'adam', 'Turn it off.'),
  L(61.8, 'noah', 'noah', 'Okay. It\u2019s off.'),
];
const s09: SceneDef = {
  id: 's09', title: 'The Radio', env: 'cabin', opts: { time: 'night', fog: 0.038 }, dur: 74, fin: 1.0, fout: 1.2,
  amb: { room: 0.25, fire: 0.4, drone: 0.2 }, music: 'tension', mvol: 0.25,
  cards: [{ t: 0.8, d: 3, text: 'THE NEXT EVENING', style: 'time' }],
  actors: {
    noah: { char: 'noah', keys: [K(0, 0.9, -2.05, PI, 'reach', { e: 'smile', l: [0.9, 1.1, -2.7] }), Ka(14, 'idle', { l: [0.9, 1.1, -2.7], e: 'neutral' }), Ka(20.5, 'idle', { l: [0.9, 1.1, -2.7], e: 'worry' }), Ka(37.5, 'idle', { l: 'adam', e: 'fear' }), Ka(51, 'idle', { l: 'adam', e: 'fear' }), Ka(59, 'reach', { l: [0.9, 1.1, -2.7], e: 'fear' }), Ka(62, 'idle', { l: [-1.8, 1.5, 3], e: 'worry' })] },
    adam: { char: 'adam', keys: [K(0, 1.9, -2.0, PI, 'idle', { l: [0.9, 1.1, -2.7] }), Ka(20.5, 'idle', { l: [0.9, 1.1, -2.7], e: 'worry' }), Ka(37.5, 'idle', { l: [0.9, 1.1, -2.7], e: 'shock' }), Ka(41, 'idle', { l: 'noah', e: 'fear' }), Ka(48, 'idle', { l: 'lena', e: 'fear' }), Ka(59, 'idle', { l: [0.9, 1.1, -2.7], e: 'angry' }), Ka(63, 'idle', { l: [-1.8, 1.5, 3], e: 'worry' })] },
    lena: { char: 'lena', keys: [K(0, -0.1, -2.0, PI, 'idle', { l: [0.9, 1.1, -2.7], e: 'smile' }), Ka(20.5, 'idle', { e: 'worry' }), K(40, -0.1, -2.0, PI, 'idle', { l: 'adam', e: 'fear' }), K(42.2, 1.9, -1.15, PI, 'walk', { l: 'adam' }), K(43, 1.9, -1.15, PI, 'idle', { l: [0.9, 1.1, -2.7], e: 'fear' }), Ka(47.5, 'idle', { l: 'adam', e: 'worry' }), Ka(59, 'idle', { l: 'noah', e: 'fear' })] },
    emily: { char: 'emily', keys: [K(0, 0.6, -1.2, PI, 'idle', { l: [0.9, 1.1, -2.7], e: 'neutral' }), Ka(20.5, 'idle', { e: 'fear' }), Ka(29.8, 'cover', { e: 'fear' }), Ka(37.5, 'idle', { l: 'adam', e: 'fear' }), Ka(54, 'cry', { e: 'sad' })] },
  },
  shots: [
    S(0, 7, [3.3, 1.7, 2.2], [1, 1, -2], { to: [2.6, 1.6, 1.0], fov: 46 }), S(7, 7.5, [1.0, 1.3, -1.1], [0.9, 1.1, -2.7], { to: [1.0, 1.25, -1.5], fov: 34 }),
    S(14.5, 6, [0.8, 1.5, -0.9], 'lena', { fov: 34 }), S(20.5, 9, [0.9, 1.25, -1.5], [0.9, 1.1, -2.7], { to: [0.9, 1.2, -2.0], fov: 28 }),
    S(29.5, 7.5, [0.2, 1.4, -0.5], 'emily', { fov: 34 }), S(37.2, 6.5, [3.3, 1.5, -2.0], 'adam', { fov: 32 }),
    S(43.7, 6, [3.2, 1.5, -1.6], [1.9, 1.4, -1.6], { to: [3.0, 1.5, -1.5], fov: 38 }), S(50, 9, [0.9, 1.6, -0.2], [0.9, 1.2, -2.0], { to: [0.9, 1.6, -0.6], fov: 48 }),
    S(59, 15, [0.8, 1.6, 0.7], [-1.8, 1.5, 3.2], { to: [-0.2, 1.6, 1.2], fov: 40 }),
  ],
  lines: s09Lines,
  cues: [
    { t: 8, sfx: 'click' }, { t: 12.2, sfx: 'tune' }, { t: 16.8, sfx: 'staticLong', vol: 0.5 }, { t: 19.5, sfx: 'static', vol: 0.8 }, { t: 20.2, amb: { drone: 0.4 }, ramp: 3 },
    { t: 34.5, sfx: 'static', vol: 0.9 }, { t: 36.2, sfx: 'staticLong', vol: 0.4 }, { t: 37, sfx: 'riser' }, { t: 41, sfx: 'sub' }, { t: 44.2, sfx: 'static', vol: 0.6 }, { t: 47.5, sfx: 'heartbeat', vol: 0.7 },
    { t: 59.8, sfx: 'click' }, { t: 60.2, sfx: 'staticLong', vol: 0.3 }, { t: 62.5, sfx: 'cut' }, { t: 66, sfx: 'uncut', vol: 0 }, { t: 66.5, music: 'drone', mvol: 0.4 },
  ],
};

// ============================================================ SCENE 10 — THE RECORDING
const s10Lines: Line[] = [
  L(1.5, 'noah', 'noah', 'I still don\u2019t like that we came back here.'),
  L(6.0, 'adam', 'adam', 'The notebook said he recorded everything. If the tape\u2019s readable, we might learn what we\u2019re dealing with.', { dur: 8.5 }),
  L(14.8, 'noah', 'noah', 'We\u2019re dealing with a prankster with huge feet.'),
  L(20.0, '', 'hunter', 'I saw my brother standing between the trees. But my brother died six years ago.', { fx: 'recording', dur: 7 }),
  L(28.0, '', 'hunter', 'I know what I saw.', { fx: 'recording', dur: 2.8 }),
  L(31.5, '', 'hunter', 'It knows our memories.', { fx: 'recording', dur: 2.6 }),
  L(34.5, '', 'hunter', 'It knows our names.', { fx: 'recording', dur: 2.6 }),
  L(37.5, '', 'hunter', 'It knows what we fear.', { fx: 'recording', dur: 3 }),
  L(42.0, 'noah', 'noah', 'Adam...', { dur: 1.6 }),
  L(46.8, 'noah', 'noah', 'Adam. There\u2019s someone out there.', { dur: 3 }),
  L(50.0, 'noah', 'noah', 'That\u2019s... that\u2019s you.', { dur: 2.6 }),
  L(52.8, '', 'adam', 'Don\u2019t trust him.', { fx: 'mimic', dur: 2.2 }),
  L(55.4, 'adam', 'adam', 'Run.', { dur: 1.4 }),
];
const s10: SceneDef = {
  id: 's10', title: 'The Recording', env: 'hunt', opts: { time: 'dusk', interior: true, fog: 0.028 }, dur: 63, fin: 0.8, fout: 0.8,
  amb: { wind: 0.25, room: 0.2 }, music: 'dread', mvol: 0.4,
  actors: {
    adam: { char: 'adam', keys: [K(0, 0.5, -0.15, PI, 'idle', { l: [0.1, 0.85, -0.9], e: 'worry' }), Ka(14.8, 'idle', { l: 'noah' }), Ka(19.5, 'hold', { l: [0.1, 0.85, -0.9] }), Ka(41, 'idle', { l: 'noah', e: 'fear' }), K(44.5, 0.5, -0.15, PI, 'idle'), K(46, -0.4, 1.2, 0, 'walk', { l: [0.3, 1.5, 11], e: 'fear' }), K(55, -0.4, 1.2, 0, 'idle', { l: [0.3, 1.5, 11], e: 'angry' }), K(56.2, -0.4, 1.2, 0, 'run'), K(58, 2.5, 4.4, 0.8, 'run'), K(62, 7, 11, 0.6, 'run')] },
    noah: { char: 'noah', keys: [K(0, -0.1, -0.15, PI, 'idle', { l: [0.1, 0.85, -0.9], e: 'worry' }), Ka(14.8, 'idle', { l: 'adam', e: 'smile' }), Ka(20, 'idle', { l: [0.1, 0.85, -0.9], e: 'worry' }), Ka(37.5, 'idle', { e: 'fear' }), K(43, -0.1, -0.15, PI, 'idle', { l: [0.3, 1.5, 3] }), K(46, 0.4, 1.4, 0, 'walk', { l: [0.3, 1.5, 11], e: 'worry' }), K(49.8, 0.4, 1.4, 0, 'idle', { e: 'shock', l: [0.3, 1.5, 11] }), Ka(52.5, 'idle', { l: 'adam', e: 'fear' }), K(56.2, 0.4, 1.4, 0, 'run', { l: null }), K(58.2, 3.0, 4.2, 0.9, 'run'), K(62, 8, 10, 0.7, 'run')] },
    fake: { char: 'adam', keys: [K(0, 0.3, 11, PI, 'idle', { v: 0, u: 1, e: 'creepy', l: [0.3, 1.5, 2] }), K(45.5, 0.3, 11, PI, 'stand', { v: 1, u: 1, e: 'creepy' }), K(52, 0.3, 11, PI, 'stand', { e: 'creepy', u: 1.1 })] },
  },
  shots: [
    S(0, 8, [0.2, 1.6, 1.4], [0.2, 1.1, -0.7], { to: [0.4, 1.6, 0.9], fov: 42 }), S(8, 7, [0.6, 1.5, 0.6], 'adam', { fov: 34 }),
    S(15, 5, [-0.9, 1.55, 0.5], 'noah', { fov: 34 }), S(19.5, 12, [0.3, 1.15, -0.2], [0.1, 0.85, -0.9], { to: [0.25, 1.1, -0.3], fov: 28 }),
    S(31.5, 6, [0.8, 1.5, 0.4], 'adam', { fov: 28 }), S(37.5, 5, [-0.6, 1.5, 0.4], 'noah', { fov: 30 }),
    S(42.5, 4.2, [0.2, 1.6, -0.9], [0.3, 1.4, 3], { fov: 44 }), S(46.7, 9, [1.4, 1.55, 0.9], [0.3, 1.5, 11], { to: [1.3, 1.55, 0.7], fov: 24 }),
    S(55.4, 2.2, [0.6, 1.5, 0.6], 'noah', { fov: 32 }), S(57.4, 6, [-1.5, 1.7, 0.5], [2, 1.2, 4], { to: [0.5, 1.8, 2.5], fov: 50, shake: 1.2 }),
  ],
  lines: s10Lines,
  cues: [
    { t: 19.2, sfx: 'cassette' }, { t: 41, sfx: 'click' }, { t: 39.5, music: 'tension', mvol: 0.35 }, { t: 44.2, sfx: 'bang', pan: 0.5 }, { t: 44.4, shake: 0.4 },
    { t: 46.2, sfx: 'riser' }, { t: 52.8, sfx: 'whisper', vol: 0.5 }, { t: 56, music: 'chase', mvol: 0.8 }, { t: 56.3, sfx: 'run' },
  ],
};

// ============================================================ SCENE 11 — THE CAVE
const trail = (x: number, back: number, t1: number): Key[] => [K(0, x, 14 + back, PI, 'walk'), K(31, x, -29 + back * 0.3, PI, 'walk'), K(t1, 2.8 + x * 0.5, -30.5 + back * 0.2, face(2.8, -30.5, 4, -34), 'walk')];
const s11aLines: Line[] = [
  L(2.0, 'lena', 'lena', 'There\u2019s a trail here. Someone\u2019s been walking it, and it isn\u2019t an animal path.', { dur: 6.8 }),
  L(9.2, 'adam', 'adam', 'It leads up toward the ridge.'),
  L(12.8, 'noah', 'noah', 'I vote we go the opposite direction. Toward the car.'),
  L(17.8, 'lena', 'lena', 'If there\u2019s an answer to what\u2019s happening, it\u2019s up there.'),
  L(23.0, 'emily', 'emily', 'Or whatever\u2019s doing this.'),
  L(26.0, 'adam', 'adam', 'Stay close. Nobody falls behind.'),
  L(33.0, 'lena', 'lena', 'Look. A cave.'),
  L(35.8, 'noah', 'noah', 'Of course there\u2019s a cave.'),
];
const s11a: SceneDef = {
  id: 's11a', title: 'The Trail', env: 'forest', opts: { time: 'overcast', caveEntrance: true, fog: 0.028 }, dur: 41, fin: 0.7, fout: 0.8,
  amb: { wind: 0.3 }, music: 'dread', mvol: 0.4,
  actors: {
    lena: { char: 'lena', keys: [...trail(0.2, 0, 36.5), Ka(33, 'idle', { l: [4, 1.5, -34] })] },
    adam: { char: 'adam', keys: [...trail(-0.5, 2.2, 37.2)] },
    noah: { char: 'noah', keys: [...trail(0.7, 4.0, 37.8), Ka(35.8, 'idle', { l: [4, 1.5, -34], e: 'worry' })] },
    emily: { char: 'emily', keys: [...trail(-0.2, 5.8, 38.4), Ka(23, 'walk', { e: 'worry' })] },
  },
  shots: [
    S(0, 10, [1.0, 1.5, 9], 'lena', { to: [1.0, 1.5, 1], fov: 38 }), S(10, 10, [-4.5, 1.5, 0], 'adam', { fov: 36 }),
    S(20, 8, [0.5, 1.7, -8], 'lena', { to: [0.5, 1.7, -17], fov: 36 }), S(28, 13, [-3, 1.6, -25], [4, 1.4, -34], { to: [-2.4, 1.6, -27.5], fov: 42 }),
  ],
  lines: s11aLines,
  cues: [{ t: 0.5, sfx: 'steps', vol: 0.5 }, { t: 10, sfx: 'steps', vol: 0.5 }, { t: 20, sfx: 'steps', vol: 0.5 }, { t: 30, sfx: 'steps', vol: 0.5 }, { t: 33.5, sfx: 'sub' }],
};

const s11bLines: Line[] = [
  L(3.0, 'noah', 'noah', 'Cave. Dark. Totally normal. Love it.'),
  L(7.0, 'emily', 'emily', 'Can we please turn around?'),
  L(10.2, 'adam', 'adam', 'In a minute. Keep your light up.'),
  L(15.5, 'lena', 'lena', 'Wait. Something\u2019s on the ground.'),
  L(19.0, 'lena', 'lena', 'A watch. And shoes... so many shoes.'),
  L(23.5, 'emily', 'emily', 'Those are children\u2019s toys.'),
  L(27.0, 'adam', 'adam', 'Watches. Wallets. Identity cards. These are people\u2019s belongings.', { dur: 4.8 }),
  L(32.0, 'lena', 'lena', 'Driver\u2019s licences. Look at the dates. Some of these are decades old.', { dur: 5.4 }),
  L(38.0, 'noah', 'noah', 'There\u2019s no one here. No bodies. Nothing. Just... their things.', { dur: 5 }),
  L(43.5, 'emily', 'emily', 'Why would anything keep them?'),
  L(47.0, 'adam', 'adam', 'Look at the walls.'),
  L(50.0, 'noah', 'noah', 'Photographs. Dozens of them.'),
  L(53.0, 'lena', 'lena', 'Hikers. Families. Kids.'),
  L(56.5, 'lena', 'lena', 'Adam... come here.'),
  L(59.5, 'lena', 'lena', 'That\u2019s us.'),
  L(62.0, 'emily', 'emily', 'That\u2019s the cabin. That\u2019s our car. We\u2019re wearing what we wore yesterday.', { dur: 6.4 }),
  L(68.5, 'adam', 'adam', 'When was this taken?'),
  L(71.5, 'lena', 'lena', 'Before we got here, Adam. Look at the light. We didn\u2019t arrive until evening. This is morning.', { dur: 7.6 }),
  L(80.0, 'adam', 'adam', 'Somebody\u2019s been watching us since before we arrived.', { dur: 4.4 }),
  L(84.8, 'emily', 'emily', 'Who took it?'),
  L(87.3, 'adam', 'adam', '...I don\u2019t know.'),
];
const s11b: SceneDef = {
  id: 's11b', title: 'The Cave', env: 'cave', opts: { photos: 'discover' }, dur: 93, fin: 0.8, fout: 1.2,
  amb: { cave: 1, drone: 0.35, room: 0.15 }, music: 'drone', mvol: 0.6,
  flashlights: [{ actor: 'lena', power: 1 }, { actor: 'adam', power: 0.9 }],
  actors: {
    lena: { char: 'lena', keys: [K(0, 0.3, 6, PI, 'walk', { e: 'worry' }), K(20, 0.1, -10.5, PI, 'walk'), K(25, 0, -14, PI, 'walk'), K(30, 0.2, -18, PI, 'idle', { l: [0.2, 0, -19.5] }), K(49, 0.2, -18, PI, 'idle'), K(55.5, 0, -23.3, PI, 'walk'), K(57, 0, -23.3, PI, 'idle', { l: [0, 1.55, -24.6], e: 'shock' }), Ka(62, 'idle', { l: [0, 1.55, -24.6] }), Ka(71.5, 'idle', { l: 'adam', e: 'fear' })] },
    adam: { char: 'adam', keys: [K(0, -0.2, 8.2, PI, 'walk', { e: 'worry' }), K(22, -0.3, -9.5, PI, 'walk'), K(27, -0.4, -14.5, PI, 'walk'), K(34, -1.6, -18, PI * 0.8, 'idle', { l: [-1.5, 0.3, -19.5] }), K(47, -1.6, -18, PI, 'idle', { l: [-3.8, 1.4, -19] }), K(56, -1.6, -18, PI, 'walk'), K(60.5, -1.0, -22.5, PI, 'walk', { l: [0, 1.55, -24.6] }), K(61.5, -1.0, -22.5, PI, 'idle', { l: [0, 1.55, -24.6], e: 'shock' }), Ka(71.5, 'idle', { l: 'lena', e: 'fear' }), Ka(80, 'idle', { l: [0, 1.55, -24.6], e: 'angry' })] },
    noah: { char: 'noah', keys: [K(0, 0.5, 9.8, PI, 'walk', { e: 'worry', l: [0, 1.6, 0] }), K(24, 0.3, -8.5, PI, 'walk'), K(29, 0.8, -14.8, PI, 'walk'), K(36, 1.8, -17.6, PI, 'idle', { l: [2.2, 0.2, -19.5], e: 'fear' }), K(50, 1.8, -17.6, PI, 'idle', { l: [-3.5, 1.4, -19] }), K(57, 1.8, -17.6, PI, 'walk'), K(62, 1.6, -21.6, PI, 'walk', { l: [0, 1.55, -24.6] }), K(63, 1.6, -21.6, PI, 'idle', { l: [0, 1.55, -24.6] })] },
    emily: { char: 'emily', keys: [K(0, -0.2, 11.2, PI, 'walk', { e: 'fear' }), K(25, -0.1, -7.8, PI, 'walk'), K(30, 0.3, -14.5, PI, 'walk'), K(37, 0.4, -16.2, PI, 'fear', { l: [0.5, 0.1, -19.5], e: 'fear' }), K(57, 0.4, -16.2, PI, 'fear'), K(63, 0.5, -20.5, PI, 'walk', { l: [0, 1.55, -24.6] }), K(64, 0.5, -20.5, PI, 'fear', { l: [0, 1.55, -24.6] })] },
  },
  shots: [
    S(0, 12, [0, 1.4, -1.5], 'lena', { to: [0, 1.4, -8], fov: 40, shake: 0.12 }), S(12, 12, [0, 1.3, -9.5], 'lena', { to: [0, 1.3, -14], fov: 38 }),
    S(24, 12, [0.3, 1.8, -13], [0, 0.5, -19], { to: [0.8, 1.9, -14.5], fov: 52 }), S(36, 8, [0.9, 1.4, -15.5], 'noah', { fov: 36 }),
    S(44, 6, [-0.4, 1.5, -16.2], 'adam', { fov: 34 }), S(50, 6.4, [0.2, 1.7, -15.5], [0, 1.3, -24.6], { to: [0.2, 1.6, -17.5], fov: 40 }),
    S(56.4, 8, [1.2, 1.6, -19.6], 'lena', { to: [0.9, 1.6, -21.0], fov: 36 }), S(64.5, 4, [-1.8, 1.55, -19.6], 'emily', { fov: 34 }),
    S(68.5, 11.5, [0.3, 1.55, -22.2], [0, 1.55, -24.6], { to: [0.1, 1.55, -23.4], fov: 28 }), S(80, 13, [-0.2, 1.6, -21], 'adam', { to: [-0.5, 1.6, -21.6], fov: 30 }),
  ],
  lines: s11bLines,
  cues: [
    { t: 0.5, sfx: 'steps', vol: 0.5 }, { t: 7, sfx: 'steps', vol: 0.5 }, { t: 14, sfx: 'steps', vol: 0.4 }, { t: 22, sfx: 'steps', vol: 0.4 }, { t: 30, music: 'dread', mvol: 0.5 }, { t: 19, sfx: 'clink', vol: 0.6 },
    { t: 41, sfx: 'drip' }, { t: 56.5, sfx: 'steps', vol: 0.4 }, { t: 59, music: 'tension', mvol: 0.6 }, { t: 59.6, sfx: 'sub' }, { t: 76, sfx: 'whisper', pan: -0.5, vol: 0.35 }, { t: 82, sfx: 'breath', pan: 0.6, vol: 0.4 }, { t: 90, sfx: 'stinger', vol: 0.6 },
  ],
};

export const act2: SceneDef[] = [s06a, s06b, s07a, s07b, s08, s09, s10, s11a, s11b];
