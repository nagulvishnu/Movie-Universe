import type { SceneDef, Shot } from './types';
import { K, Ka, L, PI, S, face } from './types';
import { carActor, lookKeys, rider, seatAnim, sleepAt } from './helpers';

const TAG = 'If you hear someone calling your name in the forest, make sure it\u2019s really them.';

// ============================================================ SCENE 1 — OPENING
const s01: SceneDef = {
  id: 's01', title: 'Blackwood Forest', env: 'forest', opts: { time: 'night', fog: 0.05 }, dur: 43, fin: 2.5, fout: 0.05,
  amb: { wind: 0.55, drone: 0.35 }, music: 'dread', mvol: 0.7,
  actors: {
    hunter: {
      char: 'hunter', keys: [
        K(0, 0.9, 60, PI, 'run', { v: 0 }), K(6, 0.9, 60, PI, 'run', { v: 1 }), K(14.2, 0, 20, PI, 'run'),
        K(15, 0, 18.6, PI, 'idle', { e: 'fear', l: [0, 1.7, 46] }),
        K(20, 0, 18.6, PI, 'idle', { l: [0, 1.6, -10], e: 'shock' }),
        K(25.6, 0, 18.6, PI, 'fear', { l: [0, 1.7, 46] }), K(26.4, 0, 18.6, PI), K(31, 0, 18.6, 0, 'fear', { l: 'creature', e: 'fear' }),
      ],
    },
    creature: { char: 'creature', keys: [K(0, 0, 34, PI, 'stand', { v: 0, u: 0.7 }), K(24.8, 0, 34, PI, 'stand', { v: 1, u: 0.7 }), K(36, 0, 34, PI, 'stand', { u: 1.1 })] },
  },
  shots: [
    S(0, 6.2, [3.5, 1.5, 50], [0, 3, 30], { to: [2.8, 1.5, 49], shake: 0.1 }),
    S(6.2, 8, [1.3, 1.5, 44], 'hunter', { to: [1.3, 1.5, 15.5], shake: 0.6, fov: 42 }),
    S(14.2, 11.2, [1.0, 1.55, 15.0], 'hunter', { to: [0.6, 1.6, 16.5], fov: 38 }),
    S(25.4, 5.2, [0.3, 1.66, 17.1], 'hunter', { fov: 24 }),
    S(30.6, 12.4, [0.9, 1.7, 13.2], 'creature', { to: [0.6, 1.75, 14.4], fov: 28 }),
  ],
  lines: [
    L(15.2, '', 'brother', 'Hey... wait for me.', { fx: 'far', dur: 3 }),
    L(19.6, 'hunter', 'hunter', 'Danny...?', { dur: 2 }),
    L(22.2, 'hunter', 'hunter', 'No. You died six years ago.', { dur: 3.4 }),
    L(26.8, '', 'brother', 'Hey... wait for me.', { fx: 'mimic', dur: 3 }),
  ],
  cues: [
    { t: 6.1, sfx: 'run' }, { t: 9.4, sfx: 'run' }, { t: 12.6, sfx: 'run', vol: 0.8 }, { t: 14.6, sfx: 'breathHeavy' }, { t: 17, sfx: 'rustle', pan: 0.6, vol: 0.6 },
    { t: 20, amb: { wind: 0.3 }, ramp: 3 }, { t: 24.6, sfx: 'sub' }, { t: 25, music: 'tension', mvol: 0.8 }, { t: 30, sfx: 'whisper', pan: -0.5, vol: 0.5 },
    { t: 42.4, sfx: 'stinger' }, { t: 42.9, sfx: 'cut' },
  ],
};

const s01b: SceneDef = {
  id: 's01b', title: 'Title', env: 'black', dur: 12, fin: 0, fout: 1.5, amb: { drone: 0.5 }, music: 'drone', mvol: 0.7,
  actors: {}, shots: [S(0, 12, [0, 0, 0], [0, 0, 1])], lines: [],
  cards: [{ t: 1.8, d: 6, text: 'THE SKINWALKER', style: 'title' }, { t: 5.5, d: 5.5, text: TAG, style: 'small' }],
  cues: [{ t: 0.1, sfx: 'uncut', vol: 0 }, { t: 1.8, sfx: 'sub' }, { t: 2.0, sfx: 'whisperLong', vol: 0.4, pan: 0.4 }],
};

// ============================================================ SCENE 2 — THE ROAD TRIP
const s02Lines = [
  L(5.0, 'noah', 'noah', 'Two hours of trees. I\u2019m starting to think they\u2019re following us.'),
  L(10.8, 'lena', 'lena', 'They\u2019re trees, Noah. They don\u2019t follow anybody.'),
  L(15.0, 'adam', 'adam', 'Just a few more kilometres. The cabin\u2019s right at the end of this road.'),
  L(22.2, 'emily', 'emily', 'Adam... you said there\u2019s no phone reception up there, right?'),
  L(27.6, 'adam', 'adam', 'None. That\u2019s the whole point. Four days, no emails, no noise.'),
  L(33.4, 'emily', 'emily', 'That\u2019s the part that worries me, honestly.'),
  L(37.5, 'noah', 'noah', 'Relax, Em. If anything happens, I\u2019ll protect you. With my charm.'),
  L(43.3, 'emily', 'emily', 'Your charm set a tent on fire last summer.'),
  L(48.3, 'noah', 'noah', 'That tent was cursed. Speaking of cursed... Lena, tell them what you found.'),
  L(55.0, 'lena', 'lena', 'It\u2019s probably nothing. But several people have disappeared around Blackwood over the last few years.'),
  L(62.5, 'emily', 'emily', 'Disappeared how?'),
  L(64.6, 'lena', 'lena', 'Hikers. Hunters. They walked into the forest and never walked out.'),
  L(70.4, 'noah', 'noah', 'Skinwalker stuff, right? Something that copies your voice and calls your name. So basically my mom.'),
  L(78.7, 'adam', 'adam', 'It\u2019s a story, Noah. People get lost, people get hurt, and someone invents a monster to explain it.'),
  L(87.5, 'lena', 'lena', 'You don\u2019t believe in anything you can\u2019t measure.'),
  L(92.0, 'adam', 'adam', 'That\u2019s why I\u2019m the one driving.'),
  L(95.7, 'emily', 'emily', 'Can we please talk about something else?'),
  L(99.8, 'adam', 'adam', 'Hey. I\u2019ve got you.'),
  L(102.8, 'lena', 'lena', 'Look. The gas station. Last one for a hundred kilometres.'),
];
const cuN = (t: number, d: number): Shot => S(t, d, [0.05, 1.28, 0.55], 'noah', { to: [0.0, 1.3, 0.4], fov: 34 });
const cuE = (t: number, d: number): Shot => S(t, d, [-0.05, 1.28, 0.55], 'emily', { to: [0.0, 1.3, 0.4], fov: 34 });
const cuA = (t: number, d: number): Shot => S(t, d, [0.1, 1.25, 1.2], 'adam', { to: [0.0, 1.27, 1.05], fov: 34 });
const cuL = (t: number, d: number): Shot => S(t, d, [-0.1, 1.25, 1.2], 'lena', { to: [0.0, 1.27, 1.05], fov: 34 });
const wide = (t: number, d: number): Shot => S(t, d, [0, 1.38, -1.45], [0, 1.15, 1.6], { to: [0, 1.4, -1.0], fov: 52 });

const s02: SceneDef = {
  id: 's02', title: 'The Road', env: 'road', opts: { time: 'dusk' }, dur: 112, fin: 1.2, fout: 1.0,
  amb: { engine: 0.6, wind: 0.12 }, music: 'calm', mvol: 0.7,
  actors: {
    car: carActor([K(0, 0, 0, 0)]),
    adam: rider('adam', lookKeys('adam', 'drive', s02Lines, [0, 1.3, 6])),
    lena: rider('lena', [...lookKeys('lena', 'sit', s02Lines, [0, 1.3, 6]), Ka(87, 'sit', { e: 'smile' }), Ka(99, 'sit', { e: 'smile' })]),
    noah: rider('noah', [...lookKeys('noah', 'sit', s02Lines, [0, 1.3, 6]), Ka(5, 'sit', { e: 'smile' }), Ka(43, 'sit', { e: 'smile' }), Ka(80, 'sit', { e: 'neutral' })]),
    emily: rider('emily', [...lookKeys('emily', 'sit', s02Lines, [-0.5, 1.2, 4]), Ka(15, 'sit', { e: 'worry' }), Ka(62, 'sit', { e: 'fear' }), Ka(90, 'sit', { e: 'worry' }), Ka(100, 'sit', { e: 'neutral' })]),
  },
  shots: [
    S(0, 4.5, [-7, 1.2, -9], 'car', { to: [-6, 1.0, -3], shake: 0.1 }),
    cuN(4.5, 6), cuL(10.5, 4.5), cuA(15, 7), cuE(22, 5.5), wide(27.5, 5.5), cuE(33, 4.5), cuN(37.5, 5.5), cuE(43, 5),
    cuN(48, 7), cuL(55, 7.5), cuE(62.5, 2), cuL(64.5, 6), cuN(70, 8.5),
    wide(78.5, 4), cuA(82.5, 5), S(87.5, 4.5, [1.6, 1.25, 0.6], 'lena', { to: [1.8, 1.3, 0.9], fov: 36 }), cuA(92, 3.5), cuE(95.5, 4), cuA(99.5, 3.2), cuL(102.7, 5),
    S(107.5, 5, [4, 0.8, 9], 'car', { to: [3, 1.0, 5], fov: 38 }),
  ],
  lines: s02Lines,
  cues: [{ t: 80, music: 'calm', mvol: 0.45 }, { t: 100, music: 'dread', mvol: 0.4 }, { t: 108, amb: { engine: 0.35 }, ramp: 4 }],
};

// ============================================================ SCENE 3 — GAS STATION
const s03a: SceneDef = {
  id: 's03a', title: 'Last Stop', env: 'gas', opts: { time: 'dusk' }, dur: 15, fin: 1.0, fout: 0.5,
  amb: { engine: 0.5, wind: 0.15, crickets: 0.25 }, music: 'dread', mvol: 0.35,
  actors: {
    car: carActor([K(0, -45, 12.6, PI / 2), K(5.6, -9, 12.6, PI / 2), K(7.2, -4.5, 11.6, PI / 2 + 0.45), K(9, -2.6, 9.4, PI - 0.2), K(11, -2.5, 7.4, PI)]),
    adam: rider('adam'), lena: rider('lena'), noah: rider('noah'), emily: rider('emily'),
  },
  shots: [
    S(0, 5.6, [-18, 1.8, 26], 'car', { to: [-14, 1.6, 22], shake: 0.1 }),
    S(5.6, 5.2, [4, 0.8, 14], 'car', { to: [3, 0.9, 12], fov: 40 }),
    S(10.8, 4.2, [-6, 1.6, 0], [0, 1.2, 8], { to: [-5.5, 1.6, 1.5] }),
  ],
  lines: [], cues: [{ t: 9.5, amb: { engine: 0 }, ramp: 2 }, { t: 12.2, sfx: 'carDoor' }, { t: 12.9, sfx: 'carDoor' }],
};

const shopLines = [
  L(9.0, 'shop', 'shop', 'Heading into the forest?'),
  L(12.0, 'adam', 'adam', 'The cabin out on the old logging road. Four days, that\u2019s all.'),
  L(17.8, 'shop', 'shop', 'That road hasn\u2019t seen visitors in a long time.'),
  L(22.8, 'shop', 'shop', 'Batteries are by the door. Flashlights, too. Take plenty... you\u2019ll want them before dark.'),
  L(30.0, 'noah', 'noah', 'Is it bears? Because I\u2019ve been training for bears.'),
  L(35.0, 'shop', 'shop', 'Not bears.'),
  L(37.0, 'shop', 'shop', 'Don\u2019t answer anyone who calls your name after dark.', { dur: 4.8 }),
  L(42.0, 'noah', 'noah', 'Ha! Noted. If someone calls my name, I\u2019ll say wrong number.'),
  L(48.5, 'shop', 'shop', 'And if you hear your own voice coming from outside... don\u2019t open the door.', { dur: 6.4 }),
  L(56.0, 'emily', 'emily', 'Your own voice?'),
  L(58.5, 'adam', 'adam', 'Has something happened out there recently?'),
  L(62.2, 'shop', 'shop', 'People disappear here. Sometimes their families hear them calling for help afterward.', { dur: 6.4 }),
  L(69.0, 'lena', 'lena', 'How long has this been happening?'),
  L(72.7, 'shop', 'shop', 'Longer than that cabin has been standing.'),
  L(77.0, 'adam', 'adam', 'Thanks for the warning. We\u2019ll be careful.'),
  L(81.5, 'shop', 'shop', 'Be inside before sunset.'),
  L(85.5, 'noah', 'noah', 'Great guy. Love the energy.'),
];
const cx = (t: number, d: number, p0: [number, number, number], who: string, p1?: [number, number, number], fov = 34): Shot => S(t, d, p0, who, { to: p1, fov });
const s03b: SceneDef = {
  id: 's03b', title: 'The Shopkeeper', env: 'gas', opts: { time: 'dusk' }, dur: 93, fin: 0.8, fout: 0.8,
  amb: { room: 0.4, wind: 0.05 }, music: 'dread', mvol: 0.3,
  anims: [{ obj: 'door', rot: 'y', keys: [[0, 0], [3.4, 0], [4, 1.5], [8.4, 1.5], [9.2, 0], [83.5, 0], [84.2, 1.5], [91, 1.5]] }],
  actors: {
    shop: { char: 'shop', keys: [K(0, 1.5, -6.05, 0, 'idle', { l: [-3, 1.5, -2], e: 'neutral' }), ...lookKeys('shop', 'idle', shopLines, [-1, 1.5, -3], 0.4), Ka(23, 'idle', { l: 'adam', e: 'worry' }), Ka(48, 'idle', { l: 'noah', e: 'neutral' }), Ka(62.2, 'idle', { l: 'adam', e: 'worry' }), Ka(73, 'idle', { l: [4.5, 1.5, -3], e: 'sad' }), Ka(82, 'idle', { l: 'adam', e: 'neutral' })] },
    adam: {
      char: 'adam', keys: [K(0, -3, 6, PI, 'walk', { v: 0 }), K(3.6, -3.0, 1.5, PI, 'walk', { v: 1 }), K(6.6, -3.0, -3.6, PI, 'walk'), K(10.2, 1.2, -4.1, PI, 'idle', { l: 'shop' }),
        ...lookKeys('adam', 'idle', shopLines, 'shop'), Ka(23, 'idle', { l: 'shop', e: 'worry' }), K(83, 1.2, -4.1, PI), K(86.5, -3.0, -3.6, PI + 0.0, 'walk'), K(90, -3.0, 0.5, PI, 'walk')],
    },
    emily: {
      char: 'emily', keys: [K(0, -2.5, 6, PI, 'walk', { v: 0 }), K(4.6, -3.0, 1.5, PI, 'walk', { v: 1 }), K(7.6, -2.0, -3.6, PI, 'walk'), K(10.5, 0.4, -4.1, PI, 'idle', { e: 'worry', l: 'shop' }),
        ...lookKeys('emily', 'idle', shopLines, 'shop'), Ka(56, 'idle', { e: 'fear' }), K(83.5, 0.4, -4.1, PI), K(87, -2.6, -3.6, PI, 'walk'), K(91, -2.8, 0.5, PI, 'walk')],
    },
    noah: {
      char: 'noah', keys: [K(0, -3.5, 6, PI, 'walk', { v: 0 }), K(5, -3.1, 1.5, PI, 'walk', { v: 1 }), K(7, -2.6, -3.7, PI, 'walk'), K(9, -1.2, -5.2, PI, 'idle', { e: 'smile', l: [-1.2, 1.2, -7] }),
        K(24, -1.2, -5.2, PI), K(28, 2.2, -4.1, PI, 'walk'), K(29.5, 2.2, -4.1, PI, 'idle', { e: 'smile', l: 'shop' }), ...lookKeys('noah', 'idle', shopLines, 'shop').filter((k) => k.t > 29),
        Ka(42.3, 'laugh', { e: 'smile' }), Ka(46.5, 'idle', { e: 'neutral' }), Ka(52, 'idle', { e: 'worry' }), K(83.5, 2.2, -4.1, PI), K(86.5, -3.3, -3.5, PI, 'walk'), K(87.5, -3.3, -3.5, PI, 'idle', { l: 'shop', e: 'smile' }), K(90, -3.2, 0.5, PI, 'walk')],
    },
    lena: {
      char: 'lena', keys: [K(0, -3.2, 6, PI, 'walk', { v: 0 }), K(5.4, -3.0, 1.5, PI, 'walk', { v: 1 }), K(7.4, -3.0, -3.4, PI, 'walk'), K(8.8, -3.9, -4.0, 0, 'idle', { l: [-3.9, 1.5, -3.1], e: 'worry' }),
        K(60, -3.9, -4.0, 0, 'idle', { l: [-3.9, 1.5, -3.1] }), K(61.2, -3.9, -4.0, PI / 2, 'idle', { l: 'shop' }), K(66.5, 3.1, -4.1, PI, 'walk'), K(67.5, 3.1, -4.1, PI, 'idle', { l: 'shop', e: 'worry' }), Ka(73, 'idle', { l: 'shop' }), K(84, 3.1, -4.1, PI), K(88, -2.5, -3.5, PI, 'walk'), K(91.5, -2.6, 0.5, PI, 'walk')],
    },
  },
  shots: [
    S(0, 8.6, [-4.3, 2.2, -8.2], [-0.5, 1.2, -3.6], { to: [-3.6, 1.9, -7.6], fov: 45 }),
    cx(8.6, 3.6, [-0.9, 1.55, -3.5], 'shop', [-0.7, 1.55, -3.6]), S(12.2, 5.6, [1.9, 1.7, -3.3], 'shop', { to: [1.8, 1.7, -3.4], fov: 36 }),
    cx(17.8, 12, [1.4, 1.5, -4.6], 'shop', [1.45, 1.5, -4.9], 28), cx(29.8, 6, [1.2, 1.5, -3.6], 'noah', undefined, 36),
    S(36, 6, [3.2, 1.4, -4.3], 'shop', { to: [2.8, 1.45, -4.6], fov: 28 }), cx(42, 5.6, [1.2, 1.5, -3.6], 'noah', undefined, 36),
    S(47.6, 8, [1.0, 1.25, -4.5], 'shop', { to: [1.3, 1.45, -4.85], fov: 28 }), cx(55.6, 3, [-0.6, 1.45, -3.5], 'emily', undefined, 34),
    S(58.6, 3.5, [1.8, 1.7, -3.3], 'shop', { to: [1.9, 1.7, -3.4], fov: 36 }), cx(62, 7, [1.4, 1.5, -4.6], 'shop', [1.5, 1.5, -4.8], 28),
    cx(69, 3.5, [2.6, 1.5, -3.5], 'lena', undefined, 34), cx(72.6, 4.4, [3.0, 1.5, -4.5], 'shop', [2.6, 1.5, -4.7], 28),
    S(77, 4.2, [1.8, 1.7, -3.3], 'shop', { to: [1.9, 1.7, -3.4], fov: 36 }), cx(81.2, 3.2, [1.4, 1.5, -4.6], 'shop', undefined, 28),
    S(84.4, 8.6, [4.2, 1.9, -7.8], [-1, 1.2, -3.6], { to: [3.8, 1.8, -7.2], fov: 42 }),
  ],
  lines: shopLines,
  cues: [
    { t: 3.5, sfx: 'bell' }, { t: 4, sfx: 'door_creak', vol: 0.4 }, { t: 6, sfx: 'steps', vol: 0.5 }, { t: 55, music: 'tension', mvol: 0.35 },
    { t: 84.2, sfx: 'bell' }, { t: 85, sfx: 'steps', vol: 0.5 },
  ],
};

const s03c: SceneDef = {
  id: 's03c', title: 'Watching', env: 'gas', opts: { time: 'dusk' }, dur: 17, fin: 0.6, fout: 1.2,
  amb: { engine: 0.2, wind: 0.1 }, music: 'dread', mvol: 0.45,
  actors: {
    car: carActor([K(0, -2.5, 7.4, PI), K(4, -2.5, 7.4, PI), K(7, -2.5, 10.8, PI * 1.2), K(10, -8, 12.4, PI * 1.5), K(15, -40, 12.4, PI * 1.5)]),
    adam: rider('adam'), lena: rider('lena'), noah: rider('noah'), emily: rider('emily'),
    shop: { char: 'shop', keys: [K(0, 2.2, -4.1, 0, 'idle', { l: 'car', e: 'worry' }), Ka(8, 'idle', { l: 'car', e: 'sad' }), Ka(12, 'idle', { l: [-60, 1.5, 12.4], e: 'neutral' })] },
  },
  shots: [
    S(0, 5, [3.4, 1.5, 1.4], 'shop', { to: [3.0, 1.5, 0.8], fov: 32 }),
    S(5, 6, [9, 1.4, 1.5], [-3, 1.4, 8], { to: [8, 1.5, 2.5], fov: 40 }),
    S(11, 6.5, [3.0, 1.5, 0.9], 'shop', { to: [2.7, 1.52, 0.2], fov: 26 }),
  ],
  lines: [L(7.5, 'shop', 'shop', 'That\u2019s the same road.', { dur: 3 })],
  cues: [{ t: 4.2, amb: { engine: 0.5 }, ramp: 1 }, { t: 12, amb: { engine: 0 }, ramp: 5 }, { t: 12, music: 'tension', mvol: 0.4 }],
};

// ============================================================ SCENE 4 — ARRIVAL
const s04a: SceneDef = {
  id: 's04a', title: 'Arrival', env: 'cabin', opts: { time: 'dusk', noCar: true, fog: 0.014 }, dur: 19, fin: 1.0, fout: 0.6,
  amb: { engine: 0.5, wind: 0.15, crickets: 0.3 }, music: 'calm', mvol: 0.55,
  actors: {
    car: carActor([K(0, 0.5, 62, PI), K(9, 0.5, 18, PI), K(12, -1.5, 11.5, PI + 0.9), K(14.8, -5.5, 8.3, PI + 1.45), K(17, -8.5, 7, PI * 1.5)]),
    adam: rider('adam'), lena: rider('lena'), noah: rider('noah'), emily: rider('emily'),
  },
  shots: [
    S(0, 7, [3.4, 1.0, 36], 'car', { to: [3.0, 1.1, 34], fov: 38 }),
    S(7, 6.4, [-14, 3.6, 24], [-3, 1.5, 6], { to: [-12, 3.2, 20], fov: 44 }),
    S(13.4, 5.6, [-5, 0.8, 2.5], 'car', { to: [-5.5, 0.9, 3.5], fov: 40 }),
  ],
  lines: [], cues: [{ t: 14, amb: { engine: 0 }, ramp: 3 }, { t: 17.6, sfx: 'carDoor' }],
};

const s04b: SceneDef = {
  id: 's04b', title: 'Unloading', env: 'cabin', opts: { time: 'dusk', fog: 0.014 }, dur: 33, fin: 0.6, fout: 0.7,
  amb: { wind: 0.15, crickets: 0.3 }, music: 'calm', mvol: 0.5,
  anims: [{ obj: 'door', rot: 'y', keys: [[0, 0], [25, 0], [26.2, 1.6]] }],
  actors: {
    adam: { char: 'adam', keys: [K(0, -5.4, 7.2, -PI / 2, 'reach'), K(14, -5.4, 7.2, -PI / 2, 'idle', { l: 'noah' }), K(17, -5.4, 7.2, face(-5.4, 7.2, 0, 5), 'walk'), K(22, 1.0, 5.6, face(1, 5.6, 2.2, 4.0), 'walk'), K(24.2, 2.2, 3.8, PI, 'walk'), K(25, 2.2, 3.8, PI, 'idle'), K(27.5, 2.2, 2.4, PI, 'walk'), K(30, 1.9, 1.0, PI, 'walk')] },
    noah: { char: 'noah', keys: [K(0, -5.6, 6.2, -PI / 2, 'hold', { e: 'smile' }), K(11, -5.6, 6.2, -PI / 2, 'idle', { l: 'emily', e: 'smile' }), K(18, -5.2, 6.2, face(-5.2, 6.2, 0.4, 5), 'walk'), K(24, 0.4, 4.0, PI, 'walk'), K(26.5, 1.0, 3.6, PI, 'idle', { l: 'adam' }), K(29.5, 1.5, 2.2, PI, 'walk')] },
    lena: { char: 'lena', keys: [K(0, -4.8, 8.5, 2.42, 'idle', { l: [0, 1.8, 0], e: 'smile' }), K(6, -4.8, 8.5, 2.42, 'idle', { l: 'noah' }), K(17.5, -4.8, 8.5, face(-4.8, 8.5, -1, 5), 'walk', { e: 'smile' }), K(23.5, -1.2, 4.8, PI, 'walk'), K(26.5, 2.8, 3.6, PI, 'idle'), K(29, 2.6, 2.0, PI, 'walk')] },
    emily: { char: 'emily', keys: [K(0, -4.2, 6.8, -PI / 2.5, 'idle', { l: [-14, 1.8, 2], e: 'worry' }), K(15, -4.2, 6.8, -PI / 2.5, 'idle', { l: [-14, 1.8, 2] }), K(18, -4.0, 6.8, face(-4, 6.8, 1.5, 5), 'walk', { l: [-14, 1.8, 2] }), K(24.5, 0.8, 4.2, PI, 'walk', { l: null }), K(27, 1.4, 3.2, PI, 'idle', { l: [-14, 1.8, 2], e: 'worry' }), K(30, 2.0, 2.0, PI, 'walk')] },
  },
  shots: [
    S(0, 6.5, [-3, 1.5, 9.8], [-5.4, 1.3, 7], { to: [-3.4, 1.4, 9.2], fov: 38 }), S(6.5, 5.5, [-2.8, 1.5, 7.8], 'emily', { fov: 32 }),
    S(12, 5, [-1.2, 1.7, 13], [-5, 1.3, 7], { to: [-1.6, 1.6, 12], fov: 40 }),
    S(17, 9, [-3.5, 1.4, 10.8], 'adam', { to: [2.0, 1.5, 9.8], fov: 40, shake: 0.15 }),
    S(26, 7, [5, 1.5, 7], 'adam:1.4', { to: [4.2, 1.6, 6], fov: 38 }),
  ],
  lines: [
    L(1.5, 'lena', 'lena', 'Okay. I take it back. This place is beautiful.'),
    L(6.5, 'noah', 'noah', 'It\u2019s a murder cabin. A very well-decorated murder cabin.'),
    L(12.0, 'emily', 'emily', 'That\u2019s not funny.'), L(14.5, 'noah', 'noah', 'A little funny.'),
    L(17.0, 'adam', 'adam', 'Come on. Let\u2019s get everything inside before it gets dark.'),
    L(23.0, 'noah', 'noah', 'Twenty bucks says there\u2019s no hot water.'), L(27.0, 'adam', 'adam', 'Twenty says there is.'),
  ],
  cues: [{ t: 2, sfx: 'bird', pan: 0.6, vol: 0.5 }, { t: 9, sfx: 'bird', pan: -0.5, vol: 0.4 }, { t: 18, sfx: 'steps', vol: 0.5 }, { t: 24, sfx: 'stepsWood', vol: 0.5 }, { t: 25.2, sfx: 'door_creak' }],
};

const s04cLines = [
  L(2.0, 'emily', 'emily', 'Dinner in ten minutes. Please don\u2019t touch anything.'), L(6.8, 'noah', 'noah', 'I would never.'),
  L(9.0, 'noah', 'noah', '...That was a lie. I touched everything.'),
  L(13.0, 'lena', 'lena', 'Adam, come sit with us. The fire\u2019s fine.'), L(17.5, 'adam', 'adam', 'In a second. I want it burning before it gets cold.'),
  L(23.0, 'lena', 'lena', 'You can relax, you know. We\u2019re on vacation.'), L(27.5, 'adam', 'adam', 'I am relaxed.'),
  L(30.0, 'noah', 'noah', 'He says that before every disaster of his life.'),
  L(36.5, 'emily', 'emily', 'To four days with no phones.'), L(40.5, 'noah', 'noah', 'To bears. May they stay far, far away.'),
  L(45.0, 'adam', 'adam', 'To us.'), L(49.0, 'noah', 'noah', 'Remember when we got lost for six hours when we were twelve?'),
  L(55.0, 'adam', 'adam', 'You got us lost.'), L(57.8, 'noah', 'noah', 'I got us adventure.'),
  L(60.5, 'lena', 'lena', 'That sounds like both of you.'),
  L(67.0, 'adam', 'adam', 'It\u2019s quiet.'), L(69.0, 'lena', 'lena', 'It\u2019s the forest. It\u2019s supposed to be quiet.'),
  L(72.5, 'adam', 'adam', 'Not this quiet.'), L(75.2, 'adam', 'adam', '...Never mind. It\u2019s nothing. Who\u2019s dealing cards?'),
];
const s04c: SceneDef = {
  id: 's04c', title: 'Evening', env: 'cabin', opts: { time: 'dusk', fog: 0.016 }, dur: 82, fin: 0.7, fout: 1.0,
  amb: { room: 0.25, wind: 0.08, crickets: 0.35, fire: 0.7 }, music: 'calm', mvol: 0.5,
  actors: {
    emily: { char: 'emily', keys: [K(0, 2.3, -2.0, PI, 'idle', { e: 'smile' }), K(34, 2.3, -2.0, PI, 'idle'), K(36, 1.5, 0.7, 0, 'walk'), K(36.5, 1.5, 0.7, 0, 'sit', { e: 'smile', l: 'noah' }), Ka(62, 'sit', { e: 'neutral', l: 'adam' }), Ka(66, 'sit', { e: 'worry', l: [-1.8, 1.5, 3] })] },
    noah: { char: 'noah', keys: [K(0, 0.5, 0.7, 0, 'sit', { e: 'smile', l: 'emily' }), ...lookKeys('noah', 'sit', s04cLines.slice(5), 'adam'), Ka(66, 'sit', { e: 'neutral', l: [-1.8, 1.5, 3] })] },
    lena: { char: 'lena', keys: [K(0, -1.5, 0.15, PI / 2, 'sit', { e: 'smile', l: 'adam' }), K(33, -1.5, 0.15, PI / 2, 'sit'), K(34, -1.5, 0.15, PI / 2, 'walk'), K(37, 0.5, 2.3, PI, 'walk'), K(37.6, 0.5, 2.3, PI, 'sit', { e: 'smile', l: 'noah' }), Ka(60, 'sit', { e: 'smile' }), Ka(66, 'sit', { e: 'neutral', l: 'adam' })] },
    adam: { char: 'adam', keys: [K(0, 2.9, -0.5, PI / 2, 'crouch', { l: [3.5, 0.3, -0.5] }), K(19, 2.9, -0.5, PI / 2, 'crouch'), K(20, 2.9, -0.5, PI / 2, 'idle', { l: 'lena', e: 'smile' }), K(32, 2.9, -0.5, PI / 2, 'walk'), K(36.3, 1.5, 2.3, PI, 'walk'), K(37, 1.5, 2.3, PI, 'sit', { l: 'noah', e: 'smile' }), ...lookKeys('adam', 'sit', s04cLines.slice(10), 'noah').filter((k) => k.t < 64), Ka(64, 'sit', { l: [-1.8, 1.5, 3], e: 'worry' }), Ka(67, 'sit', { l: 'lena', e: 'neutral' }), Ka(71, 'sit', { l: [-1.8, 1.5, 3], e: 'worry' }), Ka(75, 'sit', { l: 'noah', e: 'smile' })] },
  },
  shots: [
    S(0, 8, [3.5, 1.9, 2.4], [0, 1.2, -1], { to: [3.0, 1.7, 2.0], fov: 46 }), S(8, 5, [0.9, 1.35, 2.2], 'noah', { fov: 36 }), S(13, 9.5, [0.1, 1.2, 0.9], 'lena', { to: [0.0, 1.25, 1.0], fov: 38 }),
    S(22.5, 12, [1.2, 1.25, 0.6], 'adam', { to: [1.5, 1.3, 0.9], fov: 38 }),
    S(34.5, 10, [-1.0, 1.45, 0.7], [1.0, 1.0, 1.5], { to: [-0.6, 1.4, 0.9], fov: 44 }), S(44.5, 4.5, [0.8, 1.35, 0.4], 'adam', { fov: 34 }),
    S(49, 8, [-0.4, 1.45, 0.9], [1.0, 1.1, 1.5], { fov: 42 }), S(57, 7, [0.9, 1.4, 0.4], 'lena', { fov: 34 }),
    S(64, 8, [0.8, 1.4, 0.8], [-1.8, 1.5, 3.2], { to: [-1.2, 1.45, 1.9], fov: 40 }), S(72, 10, [-0.2, 1.4, 1.9], 'adam', { to: [0.3, 1.4, 1.5], fov: 28 }),
  ],
  lines: s04cLines,
  cues: [
    { t: 33, sfx: 'stepsWood', vol: 0.4 }, { t: 46.8, sfx: 'clink' }, { t: 62, music: 'sad', mvol: 0.35 },
    { t: 63, amb: { crickets: 0, wind: 0, room: 0.2, fire: 0.4 }, ramp: 3 }, { t: 66, music: 'drone', mvol: 0.5 }, { t: 72.5, sfx: 'creak', vol: 0.5 },
  ],
};

// ============================================================ SCENE 5 — THE FIRST NIGHT
const s05Lines = [
  L(20.5, '', 'mom', 'Noah...', { fx: 'mimic', pan: -0.7, dur: 2 }),
  L(23.0, 'noah', 'noah', '...Mom?', { dur: 2 }),
  L(25.5, '', 'mom', 'Please, sweetheart. Come outside.', { fx: 'mimic', pan: -0.7, dur: 3.2 }),
  L(29.5, 'noah', 'noah', 'Mom? What are you doing here? It\u2019s the middle of the night.', { dur: 5.5 }),
  L(36.0, 'emily', 'emily', 'Noah? What\u2019s going on?', { dur: 2.8 }),
  L(38.5, 'adam', 'adam', 'Noah! Hey. Look at me.', { dur: 2.8 }),
  L(41.8, 'noah', 'noah', 'That\u2019s my mom, Adam. She\u2019s outside.', { dur: 3.2 }),
  L(45.3, 'adam', 'adam', 'Your mom lives three hundred kilometres from here.', { dur: 4.2 }),
  L(50.2, 'noah', 'noah', '...I know. I know that.', { dur: 2.8 }),
  L(53.5, '', 'mom', 'Noah... why won\u2019t you help me?', { fx: 'mimic', pan: -0.7, dur: 3.4 }),
];
const s05: SceneDef = {
  id: 's05', title: 'The First Night', env: 'cabin', opts: { time: 'night', interior: false, fog: 0.04 }, dur: 64, fin: 1.5, fout: 0.05,
  amb: { room: 0.3, drone: 0.4 }, music: 'dread', mvol: 0.45,
  cards: [{ t: 1.0, d: 4, text: '2:07 AM', style: 'time' }],
  actors: {
    adam: { char: 'adam', keys: [sleepAt(-3.25, -1.05), K(30, -3.25, -1.05, 0, 'sleep', { y: 0.5 }), K(31, -3.25, -1.95, 0, 'wake', { y: 0.5, e: 'worry', l: 'noah' }), K(33, -3.25, -1.95, 0, 'wake', { y: 0.5 }), K(34.4, -3.25, -0.6, 0.9, 'walk', { y: 0, e: 'fear' }), K(38.2, 2.3, 2.0, -PI / 2, 'run'), K(39, 2.2, 2.2, -PI / 2, 'idle', { l: 'noah', e: 'worry' }), Ka(46, 'idle', { e: 'angry', l: 'noah' })] },
    lena: { char: 'lena', keys: [sleepAt(-2.75, -1.05), K(43, -2.75, -1.05, 0, 'sleep', { y: 0.5 }), K(44, -2.75, -1.95, 0, 'wake', { y: 0.5, e: 'fear', l: 'noah' })] },
    noah: { char: 'noah', keys: [sleepAt(-1.95, -1.05), K(12.6, -1.95, -1.05, 0, 'sleep', { y: 0.5 }), K(14, -1.95, -1.95, 0, 'wake', { y: 0.5, e: 'worry', l: [-4, 1.5, 0.8] }), K(18.5, -1.95, -1.95, 0, 'wake', { y: 0.5 }), K(19.6, -1.95, -0.6, -1.0, 'walk', { y: 0 }), K(24, -3.25, 0.8, -PI / 2, 'walk', { l: [-10, 1.6, 0.8] }), K(24.8, -3.25, 0.8, -PI / 2, 'idle', { e: 'worry' }), K(35, -3.25, 0.8, -PI / 2, 'idle', { e: 'worry' }), K(39.5, 1.5, 2.3, PI / 4, 'walk', { l: [3, 1.4, 4] }), K(40.3, 1.5, 2.3, PI / 2, 'idle', { l: 'adam', e: 'worry' }), Ka(50, 'idle', { e: 'shock', l: [-4, 1.5, 0.8] })] },
    emily: { char: 'emily', keys: [sleepAt(-1.45, -1.05), K(28.5, -1.45, -1.05, 0, 'sleep', { y: 0.5 }), K(29.5, -1.45, -1.95, 0, 'wake', { y: 0.5, e: 'fear', l: 'noah' })] },
    creature: { char: 'creature', keys: [K(0, -13, 0.8, PI / 2, 'stand', { v: 0, u: 0.6 }), K(53, -13, 0.8, PI / 2, 'stand', { v: 1, u: 0.6 }), K(58, -13, 0.8, PI / 2, 'stand', { u: 1.0 })] },
  },
  shots: [
    S(0, 7.5, [10, 2.2, 16], [-1, 1.6, 0], { to: [8.5, 2.0, 13] }),
    S(7.5, 7, [3.4, 1.6, 2.4], [-2.5, 0.7, -1.4], { to: [2.5, 1.5, 1.4], fov: 46 }),
    S(14.5, 5, [-0.8, 1.3, -0.7], 'noah', { fov: 36 }),
    S(19.5, 5.5, [-0.6, 1.6, 1.6], 'noah', { to: [-0.9, 1.55, 1.9], fov: 40 }),
    S(25, 8, [-1.9, 1.6, 0.6], [-9, 1.7, 0.8], { to: [-2.0, 1.6, 0.7], fov: 40 }),
    S(33, 6.5, [-0.8, 1.7, -0.9], 'noah:1.3', { to: [-0.2, 1.7, -0.2], fov: 44, shake: 0.1 }),
    S(39.5, 5.5, [0.4, 1.6, 1.3], [1.8, 1.4, 2.4], { fov: 40 }),
    S(45, 5, [0.9, 1.55, 1.4], 'adam', { fov: 32 }), S(50, 3.3, [0.6, 1.5, 1.9], 'noah', { fov: 30 }),
    S(53.3, 5, [-2.6, 1.55, 0.9], 'creature', { to: [-3.4, 1.6, 0.8], fov: 22 }),
    S(58.3, 6, [-3.6, 1.7, 0.8], 'creature', { fov: 14 }),
  ],
  lines: s05Lines,
  cues: [
    { t: 9, sfx: 'creak', vol: 0.4 }, { t: 11.2, sfx: 'laugh', pan: -0.8, vol: 0.8, lp: 2500 }, { t: 19.8, sfx: 'stepsWood', vol: 0.3 }, { t: 36, music: 'tension', mvol: 0.5 },
    { t: 46.5, sfx: 'riser' }, { t: 53, sfx: 'breath', pan: -0.6, vol: 0.5 }, { t: 56, sfx: 'whisper', pan: -0.6, vol: 0.4 }, { t: 63, sfx: 'stinger' },
  ],
};

export const act1: SceneDef[] = [s01, s01b, s02, s03a, s03b, s03c, s04a, s04b, s04c, s05];
void seatAnim;
