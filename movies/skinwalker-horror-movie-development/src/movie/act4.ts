import type { Line, SceneDef } from './types';
import { K, Ka, L, PI, S } from './types';
import { carActor, rider, sleepAt } from './helpers';

// ============================================================ SCENE 16 — ESCAPE
const s16a: SceneDef = {
  id: 's16a', title: 'Sunrise', env: 'forest', opts: { time: 'dawn', fog: 0.02 }, dur: 38, fin: 1.5, fout: 0.8,
  amb: { wind: 0.15 }, music: 'sad', mvol: 0.55,
  actors: {
    adam: { char: 'adam', keys: [K(0, -0.5, -30, 0, 'limp', { e: 'tired' }), K(38, -0.5, 10, 0, 'limp')] },
    lena: { char: 'lena', keys: [K(0, 0.4, -29.4, 0, 'walk', { e: 'sad' }), K(38, 0.4, 10.6, 0, 'walk')] },
    emily: { char: 'emily', keys: [K(0, 0.0, -28.6, 0, 'walk', { e: 'sad' }), K(38, 0.0, 11.4, 0, 'walk')] },
  },
  shots: [
    S(0, 11, [0.2, 1.5, -22], 'adam', { to: [0.2, 1.5, -11], fov: 40, shake: 0.12 }),
    S(11, 12, [-5.5, 1.4, -6], 'lena', { fov: 36 }),
    S(23, 15, [0.0, 1.6, -5], [0, 1.6, 30], { to: [0.0, 1.7, 0], fov: 36 }),
  ],
  lines: [
    L(7.0, 'emily', 'emily', 'Do you hear that?', { dur: 2.2 }), L(10.2, 'lena', 'lena', 'Birds.', { dur: 1.6 }),
    L(13.2, 'emily', 'emily', 'They\u2019re back.', { dur: 1.8 }), L(17.5, 'adam', 'adam', 'The road\u2019s just ahead. Keep walking.', { dur: 3.4 }),
  ],
  cues: [{ t: 0.5, sfx: 'steps', vol: 0.4 }, { t: 6.5, sfx: 'bird', pan: 0.6, vol: 0.5 }, { t: 9, sfx: 'bird', pan: -0.5, vol: 0.5 }, { t: 12, sfx: 'bird', pan: 0.3, vol: 0.5 }, { t: 14, sfx: 'steps', vol: 0.4 }, { t: 26, sfx: 'steps', vol: 0.4 }, { t: 32, sfx: 'bird', pan: -0.3, vol: 0.6 }],
};

const s16bLines: Line[] = [
  L(26.0, 'shop', 'shop', 'How many of you went into the forest?', { dur: 4 }),
  L(31.0, 'adam', 'adam', 'Four.', { dur: 1.6 }),
  L(33.5, 'shop', 'shop', 'How many came back?', { dur: 2.4 }),
  L(36.5, 'adam', 'adam', 'Three.', { dur: 1.8 }),
  L(39.5, 'shop', 'shop', 'Then you left one behind.', { dur: 3.2 }),
  L(43.6, 'lena', 'lena', 'He\u2019s dead. Noah\u2019s\u2014', { dur: 2 }),
  L(46.2, 'shop', 'shop', 'Is he?', { dur: 1.8 }),
];
const s16b: SceneDef = {
  id: 's16b', title: 'The Same Gas Station', env: 'gas', opts: { time: 'dawn' }, dur: 50, fin: 0.8, fout: 0.8,
  amb: { wind: 0.12 }, music: 'sad', mvol: 0.45,
  actors: {
    shop: { char: 'shop', keys: [K(0, -2.0, -1.6, -PI / 2, 'idle', { l: [-30, 1.5, 6], e: 'worry' }), Ka(14, 'idle', { l: [-12, 1.5, 3], e: 'shock' }), Ka(24, 'idle', { l: 'adam', e: 'worry' }), Ka(33.5, 'idle', { l: 'adam', e: 'sad' }), Ka(39.5, 'idle', { l: 'adam', e: 'sad' })] },
    adam: { char: 'adam', keys: [K(0, -42, 5, PI / 2, 'limp', { e: 'tired' }), K(24, -5.0, -0.3, PI / 2, 'limp'), K(25, -5.0, -0.3, PI / 2, 'idle', { l: 'shop', e: 'tired' }), Ka(36.5, 'idle', { e: 'sad' })] },
    lena: { char: 'lena', keys: [K(0, -42.6, 5.8, PI / 2, 'walk', { e: 'sad' }), K(24, -5.7, 0.8, PI / 2, 'walk'), K(25, -5.7, 0.8, PI / 2, 'idle', { l: 'shop', e: 'sad' }), Ka(43.6, 'idle', { l: 'adam', e: 'sad' })] },
    emily: { char: 'emily', keys: [K(0, -43.4, 4.2, PI / 2, 'walk', { e: 'sad' }), K(24, -5.9, -1.2, PI / 2, 'walk'), K(25, -5.9, -1.2, PI / 2, 'idle', { l: 'shop', e: 'sad' })] },
  },
  shots: [
    S(0, 8, [4, 1.4, 9], [-22, 1.3, 6], { to: [3, 1.5, 8], fov: 34 }),
    S(8, 8.5, [-4.4, 1.55, -0.1], 'shop', { to: [-4.0, 1.55, -0.1], fov: 30 }),
    S(16.5, 8, [-0.7, 1.6, -1.4], [-22, 1.4, 4], { to: [-1.0, 1.6, -1.3], fov: 34 }),
    S(24.5, 6.5, [-7.6, 1.6, 1.2], 'shop', { to: [-7.2, 1.6, 0.9], fov: 28 }), S(30.8, 3.4, [-4.2, 1.55, 0.6], 'adam', { fov: 30 }),
    S(33.4, 3.4, [-3.6, 1.55, -0.2], 'shop', { fov: 26 }), S(36.8, 3, [-4.2, 1.55, 0.6], 'adam', { fov: 28 }),
    S(39.4, 4.2, [-3.6, 1.55, -0.2], 'shop', { to: [-3.2, 1.55, -0.2], fov: 24 }), S(43.6, 6.4, [-8.0, 1.6, 2.5], [-3, 1.4, -0.5], { to: [-7.2, 1.6, 2.0], fov: 38 }),
  ],
  lines: s16bLines,
  cues: [{ t: 6, music: 'sad', mvol: 0.4 }, { t: 22, sfx: 'steps', vol: 0.4 }, { t: 39.4, sfx: 'sub', vol: 0.6 }, { t: 40, music: 'drone', mvol: 0.5 }],
};

// ============================================================ SCENE 17 — THE REVEAL
const s17aLines: Line[] = [
  L(1.0, 'adam', 'adam', 'I found this in a hunting cabin, deep in the woods.', { dur: 4.6 }),
  L(6.5, 'shop', 'shop', '...Where did you get this?', { dur: 2.8 }),
  L(10.0, 'adam', 'adam', 'I just told you. Who are they?', { dur: 3 }),
  L(14.0, 'shop', 'shop', 'That cap. That\u2019s Walter Hale. He hunted those woods all his life.', { dur: 5.6 }),
  L(20.2, 'shop', 'shop', 'And the boy beside him is me.', { dur: 3.4 }),
  L(24.6, 'lena', 'lena', 'You were in that forest?', { dur: 2.6 }),
  L(27.6, 'shop', 'shop', 'Thirty years ago, a whole family vanished into those trees.', { dur: 5.4 }),
  L(33.6, 'shop', 'shop', 'Only one person ever came back. A young boy.', { dur: 4.4 }),
  L(38.8, 'adam', 'adam', '...You.', { dur: 1.8 }),
  L(41.0, 'shop', 'shop', 'Me.', { dur: 1.6 }),
  L(43.4, 'shop', 'shop', 'I remember the door. And my father\u2019s voice.', { dur: 5 }),
];
const shopInt = (looks: Parameters<typeof Ka>[2][] = []) => looks;
void shopInt;
const s17a: SceneDef = {
  id: 's17a', title: 'The Photograph', env: 'gas', opts: { time: 'dawn' }, dur: 51, fin: 0.8, fout: 1.0,
  amb: { room: 0.35, wind: 0.04 }, music: 'drone', mvol: 0.5,
  anims: [{ obj: 'photoA', vis: [[0, false], [0.8, true]] }, { obj: 'door', rot: 'y', keys: [[0, 1.5]] }],
  actors: {
    shop: { char: 'shop', keys: [K(0, 1.5, -6.05, 0, 'lean', { l: [1.25, 1.0, -5.0], e: 'neutral' }), Ka(6.5, 'lean', { l: [1.25, 1.0, -5.0], e: 'shock' }), Ka(10, 'idle', { l: 'adam', e: 'shock' }), Ka(14, 'idle', { l: [1.25, 1.0, -5.0], e: 'sad' }), Ka(20.2, 'idle', { l: [1.25, 1.0, -5.0], e: 'sad' }), Ka(24.6, 'idle', { l: 'lena', e: 'sad' }), Ka(27.6, 'idle', { l: [4, 1.5, -2.5], e: 'sad' }), Ka(41, 'idle', { l: 'adam', e: 'tired' })] },
    adam: { char: 'adam', keys: [K(0, 1.2, -4.15, PI, 'idle', { l: 'shop', e: 'tired' }), Ka(1, 'idle', { l: [1.25, 1.0, -5.0] }), Ka(10, 'idle', { l: 'shop', e: 'worry' }), Ka(38.8, 'idle', { l: 'shop', e: 'shock' })] },
    lena: { char: 'lena', keys: [K(0, 0.1, -4.15, PI, 'idle', { l: 'shop', e: 'sad' }), Ka(24.6, 'idle', { l: 'shop', e: 'worry' })] },
    emily: { char: 'emily', keys: [K(0, 3.0, -4.15, PI, 'cover', { e: 'sad' }), Ka(14, 'idle', { l: 'shop', e: 'sad' })] },
  },
  shots: [
    S(0, 6.4, [1.25, 1.75, -4.4], [1.25, 1.06, -5.0], { to: [1.25, 1.6, -4.8], fov: 30 }), S(6.4, 3.8, [1.4, 1.5, -4.6], 'shop', { fov: 28 }),
    S(10.2, 3.8, [2.1, 1.55, -3.6], 'adam', { fov: 32 }), S(14, 6.2, [1.2, 1.5, -4.6], 'shop', { to: [1.35, 1.52, -4.9], fov: 26 }),
    S(20.2, 4.2, [1.25, 1.75, -4.5], [1.25, 1.06, -5.0], { fov: 24 }), S(24.4, 3, [2.4, 1.5, -3.6], 'lena', { fov: 34 }),
    S(27.4, 11, [1.0, 1.5, -4.7], 'shop', { to: [1.3, 1.5, -5.0], fov: 24 }), S(38.6, 2.4, [0.3, 1.55, -3.6], 'adam', { fov: 28 }),
    S(41, 10, [1.2, 1.5, -4.6], 'shop', { to: [1.4, 1.52, -5.1], fov: 20 }),
  ],
  lines: s17aLines,
  cues: [{ t: 0.9, sfx: 'paper', vol: 0.6 }, { t: 6.4, sfx: 'sub', vol: 0.5 }, { t: 33, music: 'dread', mvol: 0.4 }, { t: 43, sfx: 'whisperLong', vol: 0.25, pan: 0.5 }, { t: 47, sfx: 'riser' }],
};

const s17b: SceneDef = {
  id: 's17b', title: 'Thirty Years Ago', env: 'cabin', opts: { time: 'night', grade: 'flashback', fog: 0.04, noCar: true, interior: true }, dur: 25, fin: 0.3, fout: 0.05,
  amb: { room: 0.3, fire: 0.5, drone: 0.4 }, music: 'drone', mvol: 0.6,
  cards: [{ t: 0.5, d: 3, text: 'THIRTY YEARS EARLIER', style: 'time' }],
  anims: [{ obj: 'door', rot: 'y', keys: [[0, 0], [11.5, 0], [12.8, 1.6]] }],
  actors: {
    boy: { char: 'boy', keys: [sleepAt(-1.95, -1.05), K(2.0, -1.95, -1.05, 0, 'sleep', { y: 0.5 }), K(3.2, -1.95, -1.95, 0, 'wake', { y: 0.5, e: 'worry', l: [2.2, 1.4, 3] }), K(6, -1.95, -1.95, 0, 'wake', { y: 0.5 }), K(7.4, -1.95, -0.6, 0.9, 'walk', { y: 0 }), K(11.8, 2.2, 2.5, 0.2, 'walk'), K(12.6, 2.2, 2.5, 0, 'idle', { l: [2.2, 1.5, 5], e: 'worry' }), K(14.3, 2.2, 2.5, 0, 'idle', { e: 'smile' }), Ka(15.2, 'idle', { e: 'shock' }), K(16.2, 2.2, 2.5, 0, 'idle'), K(16.9, 2.2, 2.5, PI, 'fear', { l: 'father', e: 'fear' }), K(19.6, 2.2, 2.5, 0, 'fear', { l: [2.2, 1.6, 5], e: 'fear' })] },
    mother: { char: 'mother', keys: [sleepAt(-3.25, -1.05)] }, sister: { char: 'sister', keys: [sleepAt(-2.75, -1.05)] },
    father: { char: 'father', keys: [K(0, 2.8, -0.5, PI / 2, 'sit', { v: 1, e: 'tired', l: [3.4, 0.5, -0.5] }), K(14.5, 2.8, -0.5, PI / 2, 'sit'), K(15.4, 2.8, -0.5, 0, 'walk', { l: [2.2, 1.2, 2.5] }), K(17.0, 2.2, 1.0, 0, 'idle', { l: [2.2, 1.0, 2.5], e: 'worry' }), Ka(19.6, 'idle', { l: [2.2, 1.5, 5], e: 'fear' })] },
    father2: { char: 'father', keys: [K(0, 2.2, 5.0, PI, 'stand', { v: 0, u: 0.4, e: 'smile' }), K(11.6, 2.2, 5.0, PI, 'stand', { v: 1, u: 0.4 }), K(18, 2.2, 4.9, PI, 'stand', { u: 0.55, e: 'smile' })] },
  },
  shots: [
    S(0, 3.5, [3.4, 1.5, 2.3], [-2, 0.8, -1.2], { to: [3.0, 1.5, 2.0], fov: 46 }), S(3.5, 4, [-0.6, 1.3, -0.6], 'boy', { fov: 34 }),
    S(7.6, 4.2, [0.4, 1.0, 0.8], 'boy', { to: [1.4, 1.0, 1.4], fov: 40 }), S(11.8, 5, [2.2, 1.05, 1.3], [2.2, 1.6, 5.4], { fov: 36 }),
    S(16.5, 3.2, [2.2, 1.25, 4.4], 'boy', { fov: 30 }), S(19.8, 5.2, [7, 1.4, 2.8], [2.2, 1.1, 2.8], { to: [6.4, 1.4, 2.8], fov: 44 }),
  ],
  lines: [
    L(3.2, '', 'father', 'Tommy... open the door, son. It\u2019s cold out here.', { fx: 'mimic', pan: 0.4, dur: 4.6 }),
    L(8.2, 'boy', 'boy', 'Dad?', { dur: 1.6 }), L(10.2, 'boy', 'boy', 'Dad, you\u2019re back early.', { dur: 2.4 }),
    L(14.6, 'father', 'father', 'Tommy. Don\u2019t.', { dur: 1.6 }), L(16.0, 'father2', 'father', 'Tommy.', { fx: 'mimic', dur: 1.4 }),
    L(18.4, 'boy', 'boy', 'Dad?', { dur: 1.6 }),
  ],
  cues: [{ t: 7.5, sfx: 'stepsWood', vol: 0.3 }, { t: 12.2, sfx: 'door_creak' }, { t: 15.2, sfx: 'riser' }, { t: 16.4, sfx: 'heartbeat', vol: 0.8 }, { t: 24, sfx: 'stinger' }, { t: 24.6, sfx: 'cut' }],
};

const s17c: SceneDef = {
  id: 's17c', title: 'Which One Came Back', env: 'gas', opts: { time: 'dawn' }, dur: 58, fin: 1.0, fout: 1.2,
  amb: { room: 0.35, wind: 0.04 }, music: 'drone', mvol: 0.5,
  anims: [{ obj: 'photoB', vis: [[0, false], [20.5, true]] }, { obj: 'photoA', vis: [[0, false]] }, { obj: 'door', rot: 'y', keys: [[0, 1.5]] }],
  actors: {
    shop: { char: 'shop', keys: [K(0, 1.5, -6.05, 0, 'idle', { l: [1.3, 1.0, -5.0], e: 'tired' }), Ka(12.5, 'idle', { l: 'adam', e: 'sad' }), Ka(17, 'idle', { l: [1.3, 1.0, -5.0], e: 'sad' }), Ka(30, 'idle', { l: [1.75, 1.0, -5.0], e: 'sad' }), Ka(34, 'idle', { l: 'lena', e: 'sad' }), Ka(46, 'idle', { l: 'lena', e: 'neutral' })] },
    adam: { char: 'adam', keys: [K(0, 1.2, -4.15, PI, 'idle', { l: 'shop', e: 'worry' }), Ka(20.5, 'idle', { l: [1.75, 1.0, -5.0], e: 'shock' }), Ka(37.5, 'idle', { l: 'shop', e: 'worry' })] },
    lena: { char: 'lena', keys: [K(0, 0.1, -4.15, PI, 'idle', { l: 'shop', e: 'sad' }), Ka(34, 'idle', { l: [1.75, 1.0, -5.0], e: 'shock' }), Ka(45.5, 'idle', { l: 'shop', e: 'worry' })] },
    emily: { char: 'emily', keys: [K(0, 3.0, -4.15, PI, 'cover', { e: 'sad' }), Ka(14, 'idle', { l: 'shop', e: 'sad' })] },
  },
  shots: [
    S(0, 7.5, [1.4, 1.5, -4.6], 'shop', { to: [1.5, 1.52, -4.9], fov: 26 }), S(7.5, 5, [1.4, 1.5, -4.6], 'shop', { fov: 22 }),
    S(12.5, 3.5, [2.0, 1.55, -3.6], 'adam', { fov: 30 }), S(16, 5.5, [1.3, 1.5, -4.6], 'shop', { to: [1.4, 1.5, -4.95], fov: 18 }),
    S(21.6, 8.4, [1.7, 1.7, -4.5], [1.75, 1.06, -5.0], { to: [1.75, 1.45, -4.7], fov: 24 }), S(30, 4.2, [1.2, 1.5, -4.6], 'shop', { fov: 24 }),
    S(34.2, 3.2, [2.4, 1.5, -3.6], 'lena', { fov: 30 }), S(37.4, 8, [1.2, 1.5, -4.6], 'shop', { to: [1.3, 1.52, -4.9], fov: 22 }),
    S(45.5, 3, [2.4, 1.5, -3.6], 'lena', { fov: 30 }), S(48.4, 9.6, [1.0, 1.5, -4.6], 'shop', { to: [1.3, 1.5, -5.1], fov: 17 }),
  ],
  lines: [
    L(2.0, 'shop', 'shop', 'The thing in those woods... it wasn\u2019t always a monster.', { dur: 5 }),
    L(7.8, 'shop', 'shop', 'It learned to become human by watching us.', { dur: 4 }),
    L(12.8, 'adam', 'adam', 'What happened to your family?', { dur: 2.8 }),
    L(16.4, 'shop', 'shop', 'I never found out which one of them came back.', { dur: 5 }),
    L(22.0, 'shop', 'shop', 'My mother. My father. My sister. Me.', { dur: 4.4 }),
    L(27.8, 'shop', 'shop', 'And look behind us. Between the trees.', { dur: 4 }),
    L(34.4, 'lena', 'lena', 'That\u2019s... that\u2019s the thing.', { dur: 2.8 }),
    L(37.8, 'shop', 'shop', 'It was there thirty years ago. It has been watching these woods longer than you\u2019ve been alive.', { dur: 8 }),
    L(46.0, 'lena', 'lena', 'Why do you stay here?', { dur: 2.2 }),
    L(48.8, 'shop', 'shop', 'Someone has to be here... when they come out.', { dur: 4.8 }),
  ],
  cues: [{ t: 21, sfx: 'paper', vol: 0.6 }, { t: 28, sfx: 'sub', vol: 0.6 }, { t: 36, sfx: 'heartbeat', vol: 0.5 }, { t: 49, music: 'tension', mvol: 0.4 }],
};

// ============================================================ SCENE 18 — DEPARTURE
const s18: SceneDef = {
  id: 's18', title: 'Departure', env: 'gas', opts: { time: 'dawn' }, dur: 34, fin: 1.0, fout: 1.2,
  amb: { wind: 0.1, engine: 0 }, music: 'sad', mvol: 0.5,
  actors: {
    car: carActor([K(0, -2.5, 7.4, PI), K(12, -2.5, 7.4, PI), K(15, -2.5, 10.8, PI * 1.2), K(18, -8, 12.4, PI * 1.5), K(28, -50, 12.4, PI * 1.5)]),
    adam: rider('adam'), lena: rider('lena'), emily: rider('emily'),
    shop: { char: 'shop', keys: [K(0, 0.5, -1.2, 0.2, 'idle', { l: 'car', e: 'sad' }), Ka(13, 'idle', { l: 'car', e: 'neutral' }), Ka(20, 'idle', { l: [-50, 1.5, 12.4], e: 'neutral', u: 0.2 }), K(24, 0.5, -1.2, 0.2, 'idle', { u: 0.5 })] },
  },
  shots: [
    S(0, 11, [2.6, 1.5, 4.6], 'shop', { to: [2.4, 1.55, 4.0], fov: 34 }), S(11, 7, [6, 1.2, 3], 'car', { to: [6, 1.3, 5], fov: 38 }),
    S(18, 9, [2.2, 1.55, 1.9], 'shop', { to: [1.5, 1.6, 0.3], fov: 24 }), S(27, 7, [1.7, 1.68, -0.2], 'shop', { fov: 11 }),
  ],
  lines: [
    L(1.5, 'shop', 'shop', 'Take my car. The keys are inside.', { dur: 3.4 }), L(5.0, 'adam', 'adam', 'Thank you. For everything.', { dur: 2.8 }),
    L(8.2, 'shop', 'shop', 'Don\u2019t thank me. Just don\u2019t ever come back.', { dur: 4.2 }), L(13.0, 'lena', 'lena', 'Will it follow us?', { dur: 2.4 }),
    L(16.2, 'shop', 'shop', 'It already knows your names.', { dur: 3 }),
  ],
  cues: [{ t: 12.4, amb: { engine: 0.5 }, ramp: 1 }, { t: 22, amb: { engine: 0 }, ramp: 6 }, { t: 21, music: 'dread', mvol: 0.5 }, { t: 26.5, sfx: 'sub', vol: 0.6 }, { t: 33, sfx: 'cut' }],
};

// ============================================================ SCENE 19 — THE FIFTH PHOTOGRAPH
const s19: SceneDef = {
  id: 's19', title: 'The Fifth Photograph', env: 'cave', opts: { photos: 'five' }, dur: 56, fin: 1.5, fout: 0.05,
  amb: { cave: 1, drone: 0.4 }, music: 'none',
  actors: {},
  shots: [
    S(0, 22, [0, 1.25, 7], [0, 1.4, -24], { to: [0, 1.25, -11], fov: 42 }),
    S(22, 17, [0, 1.4, -12], [0, 1.5, -24.6], { to: [0.9, 1.5, -21.3], fov: 40 }),
    S(39, 17, [1.2, 1.5, -21.8], [1.2, 1.5, -24.4], { to: [1.62, 1.5, -23.4], lto: [1.75, 1.5, -24.4], fov: 28 }),
  ],
  lines: [L(46.0, '', 'creature', 'Next time... bring someone new.', { fx: 'whisper', dur: 4.5 })],
  cues: [{ t: 2, music: 'drone', mvol: 0.5 }, { t: 20, sfx: 'drip' }, { t: 30, sfx: 'whisperLong', vol: 0.25, pan: -0.6 }, { t: 40, music: 'tension', mvol: 0.4 }, { t: 45.8, sfx: 'whisper', vol: 0.9 }, { t: 46.4, sfx: 'whisperLong', vol: 0.4, pan: 0.3 }, { t: 52, sfx: 'breath', vol: 0.5 }, { t: 55.3, sfx: 'stinger' }, { t: 55.9, sfx: 'cut' }],
};

// ============================================================ CREDITS + POST-CREDIT
const credits: SceneDef = {
  id: 'credits', title: 'Credits', env: 'black', dur: 40, fin: 0.5, fout: 0.5, amb: { drone: 0.2 }, music: 'sad', mvol: 0.8,
  actors: {}, shots: [S(0, 40, [0, 0, 0], [0, 0, 1])], lines: [], cues: [{ t: 0.1, sfx: 'uncut', vol: 0 }],
  cards: [{ t: 0, d: 40, text: 'CREDITS', style: 'credits' }],
};

const mirrorLook = [-0.6, 1.45, 2.5] as [number, number, number];
const post: SceneDef = {
  id: 'post', title: 'Post-Credit', env: 'home', opts: { clock: '2:13' }, dur: 42, fin: 0.5, fout: 0.05,
  amb: { room: 0.25, drone: 0.3, wind: 0.05 }, music: 'none',
  cards: [{ t: 0.8, d: 3, text: '2:13 AM', style: 'time' }],
  actors: {
    adam: { char: 'adam', keys: [K(0, -0.5, -0.5, 0, 'sleep', { y: 0.55, e: 'sleep' }), K(6.2, -0.5, -0.5, 0, 'sleep', { y: 0.55 }), K(7.4, -0.5, -1.4, 0, 'wake', { y: 0.55, e: 'worry', l: [0.35, 0.8, -2.1] }), K(9.6, -0.5, -1.4, 0, 'wakePhone', { e: 'worry' }), Ka(14.5, 'wakePhone', { e: 'fear', l: [-0.5, 1.4, 0.5] }), Ka(18.5, 'wakePhone', { l: mirrorLook, e: 'fear' }), Ka(22, 'wake', { e: 'fear', l: mirrorLook })] },
    lena: { char: 'lena', keys: [sleepAt(-1.5, -0.5, 0.55)] },
    adamR: { char: 'adam', keys: [K(0, -0.5, 5.5, PI, 'sleep', { y: 0.55, e: 'sleep' }), K(6.2, -0.5, 5.5, PI, 'sleep', { y: 0.55 }), K(7.4, -0.5, 6.4, PI, 'wake', { y: 0.55, e: 'worry' }), K(9.6, -0.5, 6.4, PI, 'wakePhone', { e: 'worry' }), Ka(14.5, 'wakePhone', { e: 'neutral' }), Ka(17.5, 'wakePhone', { e: 'smile', u: 0.6, l: [-0.5, 1.4, 0] }), Ka(21, 'wake', { e: 'creepy', u: 0.9, l: [-0.5, 1.4, 0] })] },
    lenaR: { char: 'lena', keys: [K(0, -1.5, 5.5, PI, 'sleep', { y: 0.55, e: 'sleep' })] },
  },
  shots: [
    S(0, 5.8, [1.8, 1.7, 2.0], [-1, 0.6, -1.2], { to: [1.5, 1.6, 1.4], fov: 46 }),
    S(5.8, 3.8, [0.8, 0.95, -1.5], [0.35, 0.6, -2.1], { to: [0.7, 0.95, -1.6], fov: 34 }),
    S(9.6, 8.6, [0.8, 1.4, -0.4], 'adam', { to: [0.9, 1.4, -0.6], fov: 30 }),
    S(18.2, 7.5, [-0.3, 1.55, -2.25], mirrorLook, { to: [-0.3, 1.52, -2.0], fov: 24 }),
    S(25.7, 10.3, [-0.4, 1.5, 0.0], 'adamR', { to: [-0.5, 1.45, 1.1], fov: 17 }),
    S(36, 6, [0.4, 1.45, 0.5], 'adam', { fov: 20 }),
  ],
  lines: [
    L(10.4, 'adam', 'adam', 'Hello?', { dur: 1.6 }), L(12.2, 'adam', 'adam', '...Who is this?', { dur: 2.4 }),
    L(15.2, '', 'adam', 'I\u2019m still in the forest.', { fx: 'phone', dur: 3 }),
  ],
  cues: [
    { t: 4.0, sfx: 'phone', d: 5 }, { t: 9.7, sfx: 'click' }, { t: 14.8, sfx: 'sub' }, { t: 15, music: 'drone', mvol: 0.6 }, { t: 18.5, music: 'tension', mvol: 0.5 },
    { t: 26, sfx: 'whisperLong', vol: 0.2, pan: 0.5 }, { t: 41.5, sfx: 'cut' },
  ],
};

const end: SceneDef = {
  id: 'end', title: 'The End', env: 'black', dur: 10, fin: 0, fout: 0.01, amb: {}, music: 'none',
  actors: {}, shots: [S(0, 10, [0, 0, 0], [0, 0, 1])], lines: [],
  cards: [{ t: 1.5, d: 7, text: 'THE FOREST REMEMBERS YOU.', style: 'end' }],
  cues: [{ t: 0.1, sfx: 'uncut', vol: 0 }, { t: 1.6, sfx: 'sub' }, { t: 2.2, sfx: 'whisper', vol: 0.3, pan: -0.5 }],
};

export const act4: SceneDef[] = [s16a, s16b, s17a, s17b, s17c, s18, s19, credits, post, end];
