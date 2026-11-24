import type { Cue, Line, SceneDef } from './types';
import { K, Ka, L, PI, S, face } from './types';
import { lookKeys } from './helpers';

// ============================================================ SCENE 12 — THE CREATURE APPEARS
const s12Lines: Line[] = [
  L(1.5, 'lena', 'lena', 'The storm\u2019s getting worse.'),
  L(4.5, 'noah', 'noah', 'Good thing we\u2019re inside.'),
  L(7.0, 'emily', 'emily', 'Do you hear that? Something\u2019s walking around the cabin.', { dur: 4.6 }),
  L(12.5, 'adam', 'adam', 'It\u2019s branches in the wind.'),
  L(16.0, '', 'noah', 'Guys... open the door!', { fx: 'mimic', pan: 0.4, dur: 2.6 }),
  L(19.2, 'noah', 'noah', 'That\u2019s... that\u2019s my voice.', { dur: 2.6 }),
  L(22.2, '', 'noah', 'Guys, please! It\u2019s freezing out here!', { fx: 'mimic', pan: 0.4, dur: 3.2 }),
  L(25.8, 'emily', 'emily', 'Make it stop. Please make it stop.', { dur: 3.2 }),
  L(29.0, 'adam', 'adam', 'Everyone away from the windows.', { dur: 2.8 }),
  L(44.0, 'adam', 'adam', 'Stay behind me.', { dur: 2 }),
  L(47.5, 'lena', 'lena', 'Adam... it\u2019s on the roof.', { dur: 2.6 }),
];
const s12: SceneDef = {
  id: 's12', title: 'The Storm', env: 'cabin', opts: { time: 'storm', rain: 0.85, fog: 0.05 }, dur: 58, fin: 1.0, fout: 0.05,
  amb: { rain: 0.8, wind: 0.5, room: 0.15, drone: 0.3 }, music: 'tension', mvol: 0.4,
  anims: [{ obj: 'door', rot: 'y', keys: [[0, 0], [52, 0], [52.1, 0.14], [52.3, 0], [53.6, 0], [53.7, 0.2], [53.9, 0]] }],
  flashlights: [{ actor: 'adam', from: 41.5 }, { actor: 'lena', from: 42.2 }],
  actors: {
    lena: { char: 'lena', keys: [K(0, -1.5, 0.15, PI / 2, 'sit', { e: 'worry' }), ...lookKeys('lena', 'sit', s12Lines, null).filter((k) => k.t < 30), K(31, -1.5, 0.15, PI / 2, 'sit', { l: [-1.8, 1.4, 3], e: 'fear' }), K(40, -1.5, 0.15, PI / 2, 'walk'), K(42, 0.2, 1.6, 0.3, 'walk', { l: [2.2, 1.4, 3] }), K(46, 0.4, 1.1, 0.2, 'idle', { e: 'fear', l: [0, 3, 0] })] },
    emily: { char: 'emily', keys: [K(0, -1.5, 1.05, PI / 2, 'sit', { e: 'worry', l: 'lena' }), Ka(7, 'sit', { l: [-1.8, 1.4, 3], e: 'fear' }), Ka(16, 'cover', { e: 'fear' }), Ka(25.8, 'cry', { e: 'sad' }), K(40, -1.5, 1.05, PI / 2, 'cry'), K(41.5, -0.6, 0.2, 0.5, 'cover'), K(43, -0.6, 0.2, 0.5, 'cry')] },
    noah: { char: 'noah', keys: [K(0, 0.5, 0.7, 0, 'sit', { e: 'worry', l: 'lena' }), Ka(16, 'sit', { l: [2.2, 1.4, 3], e: 'shock' }), Ka(19.2, 'sit', { l: 'adam', e: 'fear' }), K(40, 0.5, 0.7, 0, 'sit'), K(41.5, 0.7, 0.4, 0, 'idle', { l: [2.2, 1.4, 3], e: 'fear' })] },
    adam: { char: 'adam', keys: [K(0, 1.6, 2.0, 0, 'idle', { l: [2.2, 1.4, 3], e: 'worry' }), Ka(12.5, 'idle', { l: 'emily' }), Ka(16, 'idle', { l: [2.2, 1.4, 3], e: 'fear' }), K(27.5, 1.6, 2.0, 0, 'idle', { l: [2.2, 1.4, 3] }), K(28.8, 2.0, 2.2, 0, 'reach', { l: [2.2, 1.4, 3], e: 'angry' }), K(30.5, 1.7, 1.6, 0, 'idle', { l: [-1.8, 1.4, 3], e: 'fear' }), K(41, 1.7, 1.6, 0, 'idle', { l: [-1.8, 1.4, 3] }), K(43, 1.0, 1.2, 0.3, 'walk', { l: [2.2, 1.4, 3] }), K(44.5, 0.8, 1.2, 0.3, 'idle', { l: [2.2, 1.4, 3], e: 'angry' })] },
    creature: { char: 'creature', keys: [K(0, -2.0, 5.0, PI, 'peer', { v: 0, u: 1 }), K(33, -2.0, 5.0, PI, 'peer', { v: 1, u: 1, e: 'creepy' }), K(36.5, -2.0, 4.5, PI, 'peer', { e: 'creepy' }), K(38.5, -2.0, 4.5, PI, 'peer', { v: 0 })] },
  },
  shots: [
    S(0, 6, [9, 2, 14], [0, 1.6, 0], { to: [8, 2, 12], shake: 0.2 }),
    S(6, 6.5, [3.4, 1.8, 2.4], [-1, 1, 0.5], { to: [2.8, 1.7, 2.0], fov: 46 }),
    S(12.5, 3.5, [1.0, 1.5, 0.6], 'adam', { fov: 32 }), S(16, 6, [0.0, 1.4, 1.5], 'noah', { fov: 34 }),
    S(22, 7, [-0.6, 1.3, 0.2], 'emily', { fov: 34 }), S(29, 4, [0.9, 1.5, 0.7], 'adam', { fov: 34 }),
    S(33, 2.2, [-1.8, 1.1, 2.3], [-1.8, 1.1, 3.2], { fov: 28 }), S(35.2, 1.8, [-1.8, 1.9, 2.5], 'creature', { fov: 26 }),
    S(37, 1.6, [-1.7, 1.95, 3.0], 'creature', { fov: 18 }),
    S(38.6, 3, [0.8, 1.5, 0.5], 'emily', { fov: 38, shake: 0.8 }),
    S(41.6, 7, [3.4, 1.5, 2.4], [0, 1, 0.5], { to: [3.0, 1.5, 2.0], fov: 46, shake: 0.5 }),
    S(48.6, 9.4, [1.0, 1.5, 0.4], [2.2, 1.5, 3], { to: [1.4, 1.5, 0.9], fov: 40, shake: 0.4 }),
  ],
  lines: s12Lines,
  cues: ((): Cue[] => [
    { t: 3, bolt: true, sfx: 'thunder', vol: 0.8 }, { t: 7.8, sfx: 'stepsSlow', pan: -0.6, vol: 0.7 }, { t: 9.5, sfx: 'creak', pan: 0.5 }, { t: 8.6, bolt: true }, { t: 11.5, sfx: 'stepsSlow', pan: 0.7, vol: 0.7 },
    { t: 15, sfx: 'knock', vol: 0.5, pan: 0.5 }, { t: 24, bolt: true, sfx: 'thunder' }, { t: 28.6, sfx: 'click' }, { t: 30.6, light: 'flicker', d: 2.4, then: 'on' },
    { t: 33.1, bolt: true, sfx: 'rattle', pan: -0.5 }, { t: 33.3, sfx: 'scratch', pan: -0.5, vol: 0.8 }, { t: 35.4, bolt: true, sfx: 'sub' }, { t: 36.9, bolt: true, sfx: 'whisper', vol: 0.6, pan: -0.4 }, { t: 38.4, bolt: true, shake: 0.8 },
    { t: 38.4, light: 'flicker', d: 2.2, then: 'off' }, { t: 38.5, sfx: 'stinger' }, { t: 41, music: 'dread', mvol: 0.5 }, { t: 44.5, sfx: 'stepsSlow', pan: 0, vol: 0.7 }, { t: 48, sfx: 'drag', vol: 0.6 },
    { t: 52, sfx: 'bang', shake: 1.0 }, { t: 53.6, sfx: 'bang', shake: 1.2 }, { t: 56, sfx: 'breathHeavy', vol: 0.8 }, { t: 57.5, sfx: 'cut' },
  ])(),
};

// ============================================================ SCENE 13 — THE ATTACK
const s13Lines: Line[] = [
  L(1.2, 'adam', 'adam', 'Get back! Everyone get back from the door!', { dur: 3.8 }),
  L(6.0, 'emily', 'emily', 'Oh God. Oh God, oh God.', { dur: 2.8 }),
  L(9.5, 'lena', 'lena', 'Adam, the window!', { dur: 2 }),
  L(12.5, '', 'noah', 'Adam, help me! It\u2019s got me!', { fx: 'mimic', pan: -0.6, dur: 3 }),
  L(16.2, 'noah', 'noah', 'That\u2019s not me! Adam, that\u2019s not me!', { dur: 3 }),
  L(19.8, 'lena', 'lena', 'Stop it! Stop using his voice!', { dur: 3 }),
  L(26.5, 'adam', 'adam', 'Out! The side window! Go, go!', { dur: 3 }),
  L(30.4, 'noah', 'noah', 'Adam! It\u2019s got my\u2014', { dur: 1.6 }),
  L(35.0, 'lena', 'lena', 'Noah? NOAH!', { dur: 1.8 }),
  L(38.0, '', 'noah', 'ADAM! HELP ME! PLEASE!', { fx: 'far', pan: -0.9, dur: 3 }),
  L(41.5, 'lena', 'lena', 'He\u2019s outside! We have to go back for him!', { dur: 4 }),
  L(46.5, 'adam', 'adam', 'No! Lena, no! It wants us to!', { dur: 3.4 }),
  L(51.0, 'lena', 'lena', 'That\u2019s Noah!', { dur: 1.8 }),
  L(53.5, 'adam', 'adam', 'I know. I know it sounds like him. And I can\u2019t tell.', { dur: 5 }),
  L(59.5, 'emily', 'emily', 'Please. Please, we have to go!', { dur: 3.2 }),
];
const s13: SceneDef = {
  id: 's13', title: 'The Attack', env: 'cabin', opts: { time: 'storm', rain: 0.85, interior: false, fog: 0.05 }, dur: 67, fin: 0.15, fout: 0.8,
  amb: { rain: 0.8, wind: 0.5, drone: 0.4 }, music: 'chase', mvol: 0.55,
  anims: [
    { obj: 'door', rot: 'y', keys: [[0, 0], [1, 0.03], [1.2, 0.0], [22.3, 0], [22.8, 1.45]] },
    { obj: 'glassFront', vis: [[0, true], [5, false]] }, { obj: 'glassLeft', vis: [[0, true], [28, false]] },
  ],
  flashlights: [{ actor: 'adam', from: 0 }, { actor: 'lena', from: 0 }],
  actors: {
    adam: { char: 'adam', keys: [K(0, 1.0, 1.2, 0.4, 'idle', { l: [2.2, 1.4, 3], e: 'fear' }), K(8, 1.0, 1.2, -0.5, 'fear', { l: [-1.8, 1.4, 3] }), K(12, 0.6, 1.0, -0.2, 'idle', { l: 'noah', e: 'fear' }), K(22, 0.6, 1.0, 0.4, 'idle', { l: [2.2, 1.4, 3], e: 'shock' }), K(26.5, 0.4, 0.8, -PI / 2, 'idle', { l: [-4, 1.4, 0.8], e: 'angry' }), K(28.5, -3.3, 0.8, -PI / 2, 'run'), K(31, -3.4, 0.8, -PI / 2, 'idle', { l: 'noah' }), K(32.5, -4.7, 0.8, -PI / 2, 'walk'), K(34, -5.0, 1.6, PI / 2, 'idle', { l: [-1, 1.2, 0.8], e: 'shock' }), Ka(41.5, 'idle', { l: 'lena' }), K(46, -5.0, 1.6, PI / 2, 'idle'), K(47, -5.0, 1.6, PI / 2, 'idle', { e: 'angry' })] },
    lena: { char: 'lena', keys: [K(0, -0.4, 1.0, 0.4, 'fear', { l: [2.2, 1.4, 3], e: 'fear' }), K(9.5, -0.4, 1.0, -0.5, 'fear', { l: [-1.8, 1.4, 3] }), K(26, -0.4, 1.0, -PI / 2, 'idle', { e: 'fear', l: [-4, 1.4, 0.8] }), K(28.8, -3.5, 0.5, -PI / 2, 'run'), K(31, -4.6, 0.7, -PI / 2, 'walk'), K(33, -5.4, 1.0, PI / 2, 'idle', { l: [-1, 1.2, 0.8], e: 'shock' }), K(41, -5.4, 1.0, PI / 2, 'idle', { l: 'adam', e: 'sad' }), K(41.8, -5.4, 1.0, PI / 2, 'walk', { l: [-1, 1.2, 0.8] }), K(43, -4.4, 0.9, PI / 2, 'walk'), K(45.5, -4.6, 1.2, PI / 2, 'idle', { l: 'adam' }), Ka(51, 'cry', { e: 'sad' })] },
    emily: { char: 'emily', keys: [K(0, -1.2, 0.2, 0.5, 'cover', { e: 'fear' }), K(26.8, -1.2, 0.2, -PI / 2, 'cry'), K(29.2, -3.6, 0.1, -PI / 2, 'run', { e: 'fear' }), K(31.5, -5.2, 0.4, -PI / 2, 'walk'), K(33, -6.0, 0.7, PI / 2, 'cover', { e: 'fear' })] },
    noah: { char: 'noah', keys: [K(0, 0.0, 0.2, 0.2, 'fear', { l: [2.2, 1.4, 3], e: 'fear' }), K(16.2, 0.0, 0.2, 0.2, 'fear', { l: 'adam', e: 'fear' }), K(28, 0.0, 0.2, 1.0, 'fear', { l: [2.2, 1.4, 3], e: 'shock' }), K(31.6, 0.4, 0.5, 0.6, 'fear', { v: 1 }), K(31.9, 0.4, 0.5, 0.6, 'fear', { v: 0 })] },
    creature: { char: 'creature', keys: [K(0, -2.0, 5.0, PI, 'peer', { v: 0, u: 1, e: 'creepy' }), K(5.0, -1.4, 4.0, PI, 'peer', { v: 1 }), K(9.5, -1.4, 4.0, PI, 'peer', { v: 0 }), K(22.5, 2.2, 3.8, PI, 'stalk', { v: 1, u: 1 }), K(25, 2.2, 1.9, PI, 'stalk'), K(30, 0.8, 0.8, -PI + 0.5, 'stalk'), K(31.6, 0.8, 0.8, -PI + 0.5, 'reach'), K(33.4, 0.8, 0.8, -PI + 0.5, 'reach', { v: 0 })] },
  },
  shots: [
    S(0, 4, [3.4, 1.6, 2.4], [0, 1, 0.5], { to: [3.1, 1.6, 2.1], fov: 46, shake: 0.5 }), S(4, 4.2, [-0.8, 1.5, 1.8], [-1.8, 1.3, 3], { fov: 40, shake: 1.2 }),
    S(8.2, 4, [0.6, 1.5, 0.3], 'adam', { fov: 36, shake: 1.2 }), S(12.2, 7, [-0.2, 1.5, 1.4], 'noah', { fov: 34, shake: 1.0 }),
    S(19.2, 3.8, [-0.8, 1.5, 0.3], 'lena', { fov: 34, shake: 1.2 }), S(23, 4.5, [0.0, 1.5, -0.5], [2.2, 1.5, 3], { fov: 44, shake: 1.6 }),
    S(27.5, 4, [-1.6, 1.6, 0.4], 'adam', { fov: 40, shake: 1.5 }), S(31.4, 3, [0.5, 1.7, -1.2], 'noah', { fov: 38, shake: 1.4 }),
    S(34.4, 8, [-2.4, 1.5, 0.8], 'lena', { to: [-3.2, 1.55, 0.7], fov: 36, shake: 0.9 }),
    S(42.4, 5, [-2.8, 1.5, 1.6], 'lena', { fov: 32, shake: 0.9 }), S(47.4, 6, [-3.8, 1.5, 0.4], 'adam', { fov: 32, shake: 0.7 }),
    S(53.4, 6, [-3.9, 1.5, 0.8], 'lena', { fov: 30, shake: 0.5 }), S(59.4, 8, [-6.8, 1.3, 3.4], [-3.8, 1.3, 0.8], { to: [-7.5, 1.4, 3.8], fov: 42, shake: 0.8 }),
  ],
  lines: s13Lines,
  cues: [
    { t: 0.2, sfx: 'breathHeavy', vol: 0.6 }, { t: 1, sfx: 'bang', shake: 1 }, { t: 3, bolt: true, sfx: 'thunder' }, { t: 5, sfx: 'glass', shake: 1.2 }, { t: 5, bolt: true }, { t: 7.2, bolt: true, sfx: 'scratch', pan: -0.5 },
    { t: 8.2, sfx: 'crash', pan: 0.5 }, { t: 12.5, bolt: true }, { t: 15, sfx: 'thud', pan: 0.3 }, { t: 17.5, sfx: 'whisper', vol: 0.6 }, { t: 21, bolt: true, sfx: 'thunder' },
    { t: 22.2, sfx: 'wood_break', shake: 2 }, { t: 22.6, sfx: 'bang', shake: 2 }, { t: 22.6, bolt: true }, { t: 24, sfx: 'stepsSlow', vol: 0.8 }, { t: 25.5, sfx: 'crash', shake: 1.2 },
    { t: 27.8, sfx: 'glass', shake: 1 }, { t: 28.4, sfx: 'run', vol: 0.7 }, { t: 31.4, bolt: true, sfx: 'screech' }, { t: 31.7, sfx: 'cut' }, { t: 32.4, sfx: 'uncut', vol: 1 },
    { t: 33, music: 'dread', mvol: 0.4 }, { t: 33.5, amb: { rain: 0.9, wind: 0.6 }, ramp: 1 }, { t: 37.8, sfx: 'riser' }, { t: 40, bolt: true, sfx: 'thunder' }, { t: 51, music: 'tension', mvol: 0.5 },
    { t: 58, bolt: true, sfx: 'thunder' }, { t: 61, sfx: 'run', vol: 0.6 },
  ],
};

// ============================================================ SCENE 14 — TWO NOAHS
const s14Lines: Line[] = [
  L(10.4, 'emily', 'emily', 'I can\u2019t... I can\u2019t breathe.', { dur: 2.6 }),
  L(13.2, 'lena', 'lena', 'Shh. Listen.', { dur: 1.6 }),
  L(14.8, '', 'noah', 'Guys! Help! I\u2019m over here!', { fx: 'far', pan: 0.7, dur: 2.6 }),
  L(18.0, 'emily', 'emily', 'Noah!', { dur: 1.2 }),
  L(19.6, 'adam', 'adam', 'Wait. Emily, don\u2019t.', { dur: 2 }),
  L(22.0, 'fake', 'noah', 'Guys... it\u2019s me.', { dur: 2.2 }),
  L(24.8, 'emily', 'emily', 'Adam, he\u2019s hurt. Look at him.', { dur: 2.8 }),
  L(27.8, 'adam', 'adam', 'Noah. What was the name of the dog we had when we were twelve?', { dur: 5 }),
  L(33.2, 'fake', 'noah', 'You always were easy to fool.', { fx: 'mimic', rate: 0.78, dur: 4 }),
  L(37.4, 'adam', 'adam', 'Run! RUN!', { dur: 1.4 }),
];
const run3 = (x: number, z0: number, z1: number, t1: number) => [K(0, x, z0, PI, 'run'), K(t1, x, z1, PI, 'run')];
const s14: SceneDef = {
  id: 's14', title: 'Two Noahs', env: 'forest', opts: { time: 'storm', rain: 0.5, fog: 0.05 }, dur: 46, fin: 0.3, fout: 0.3,
  amb: { rain: 0.5, wind: 0.5, drone: 0.3 }, music: 'chase', mvol: 0.7,
  actors: {
    adam: { char: 'adam', keys: [...run3(0.4, 44, 2.5, 9.2), K(10, 0.4, 2.5, PI, 'idle', { e: 'fear', l: [0, 1.5, -10] }), Ka(19.6, 'idle', { l: 'fake', e: 'worry' }), Ka(27.8, 'idle', { l: 'fake', e: 'angry' }), Ka(36, 'idle', { l: 'creature', e: 'shock' }), K(37.3, 0.4, 2.5, 0, 'run'), K(46, 0.6, 46, 0, 'run')] },
    lena: { char: 'lena', keys: [...run3(-0.4, 45.5, 4.0, 9.2), K(10, -0.4, 4.0, PI, 'idle', { e: 'fear', l: [0, 1.5, -10] }), Ka(18, 'idle', { l: 'fake' }), Ka(36, 'idle', { l: 'creature', e: 'shock' }), K(37.5, -0.4, 4.0, 0, 'run'), K(46, -0.2, 47, 0, 'run')] },
    emily: { char: 'emily', keys: [...run3(0.1, 47, 6.0, 9.2), K(10, 0.1, 6.0, PI, 'cover', { e: 'fear' }), K(14.5, 0.1, 6.0, PI, 'idle', { l: [4, 1.5, -12], e: 'worry' }), Ka(18, 'idle', { l: 'fake', e: 'sad' }), K(21, 0.1, 6.0, PI, 'walk', { l: 'fake' }), K(23.6, 0.1, 4.1, PI, 'walk'), K(24, 0.1, 4.1, PI, 'idle', { l: 'adam', e: 'worry' }), Ka(33.2, 'idle', { l: 'fake', e: 'shock' }), K(37.6, 0.1, 4.1, 0, 'run'), K(46, 0.2, 48, 0, 'run')] },
    fake: { char: 'noah', keys: [K(0, 4.6, -12, -2.2, 'limp', { v: 0, u: 0.35, e: 'sad' }), K(17.8, 4.6, -12, -2.4, 'limp', { v: 1 }), K(25.6, 0.3, -2.0, PI / 2 + 0.6, 'limp'), K(26.4, 0.3, -2.0, 0, 'idle', { l: 'adam', e: 'sad', u: 0.45 }), K(29, 0.3, -2.0, 0, 'idle', { e: 'smile', u: 0.8 }), K(31.5, 0.3, -2.0, 0, 'idle', { e: 'creepy', u: 1.2 }), K(35.0, 0.3, -2.0, 0, 'idle', { e: 'creepy', u: 2.0 }), K(35.2, 0.3, -2.0, 0, 'idle', { v: 0 })] },
    creature: { char: 'creature', keys: [K(0, 0.3, -2.0, 0, 'stand', { v: 0, u: 1, e: 'creepy' }), K(35.2, 0.3, -2.0, 0, 'stand', { v: 1, u: 1.15, e: 'creepy' }), K(37.4, 0.3, -2.0, 0, 'stand', { u: 1.2 }), K(37.9, 0.3, -2.0, 0, 'sprint', { sp: 1 }), K(41.5, 0.3, 14, 0, 'sprint'), K(46, 0.3, 40, 0, 'sprint')] },
  },
  shots: [
    S(0, 9.2, [1.0, 1.5, 36], 'adam', { to: [1.0, 1.5, 4], fov: 42, shake: 0.7 }), S(9.2, 8.4, [1.2, 1.5, -1.0], 'emily', { to: [1.0, 1.5, -0.4], fov: 38 }),
    S(17.6, 9.4, [0.7, 1.75, 8.5], 'fake', { to: [0.5, 1.7, 7.0], fov: 32 }), S(27, 5.5, [0.9, 1.5, 0.9], 'adam', { fov: 32 }),
    S(32.5, 2.7, [2.4, 1.8, 0.5], 'fake', { fov: 22 }), S(35.2, 3.2, [1.4, 2.5, 0.0], 'creature', { to: [1.2, 2.6, 0.6], fov: 20 }),
    S(38.4, 7.6, [0.4, 1.0, 6.5], 'creature', { to: [0.4, 1.2, 12], fov: 48, shake: 1.6 }),
  ],
  lines: s14Lines,
  cues: [
    { t: 0.3, sfx: 'run' }, { t: 3.5, sfx: 'run', vol: 0.8 }, { t: 6.5, sfx: 'run', vol: 0.8 }, { t: 9.4, sfx: 'breathHeavy', vol: 0.7 }, { t: 9.5, music: 'tension', mvol: 0.5 },
    { t: 17.8, sfx: 'rustle', pan: 0.6 }, { t: 18, sfx: 'riser' }, { t: 31.5, sfx: 'drag', vol: 0.5 }, { t: 33.3, sfx: 'static', vol: 0.4 }, { t: 35.2, bolt: true, sfx: 'thunder' }, { t: 35.2, sfx: 'stinger', shake: 0.6 }, { t: 35.8, bolt: true }, { t: 36.5, bolt: true, sfx: 'breath' },
    { t: 37.6, music: 'chase', mvol: 0.9 }, { t: 37.8, sfx: 'screech', shake: 1 }, { t: 38, sfx: 'run' }, { t: 38.2, sfx: 'sprint', vol: 0.9 }, { t: 45.6, sfx: 'cut' },
  ],
};

// ============================================================ SCENE 15 — THE RANGER STATION
const s15Lines: Line[] = [
  L(1.5, 'lena', 'lena', 'Is the door going to hold?'),
  L(4.5, 'adam', 'adam', 'It has to. Emily, stay away from the window.', { dur: 4 }),
  L(9.0, 'emily', 'emily', 'Noah\u2019s still out there.'),
  L(12.0, 'adam', 'adam', 'That wasn\u2019t Noah.'),
  L(14.5, 'emily', 'emily', 'How do you know? How do you know any of it\u2019s real?', { dur: 5 }),
  L(20.5, 'adam', 'adam', 'There\u2019s a flare gun. Two shells.'),
  L(25.0, '', 'adamMom', 'Adam? Adam, honey, it\u2019s Mom. Please open the door.', { fx: 'mimic', pan: 0.5, dur: 4.8 }),
  L(30.5, 'adam', 'adam', 'My mother is home. She\u2019s safe.'),
  L(34.5, '', 'adamMom', 'You never call me anymore. I just want to hear you say you\u2019re okay.', { fx: 'mimic', pan: -0.5, dur: 6 }),
  L(41.5, 'adam', 'adam', 'Don\u2019t listen to it. Don\u2019t listen.'),
  L(45.5, '', 'lenaBro', 'Lena? It\u2019s Ben. Remember what we promised Dad? Please open the door.', { fx: 'mimic', pan: 0.6, dur: 6 }),
  L(52.0, 'lena', 'lena', 'That\u2019s his voice. That\u2019s exactly his voice.', { dur: 3.6 }),
  L(56.5, '', 'emilyDad', 'Emily, princess. Daddy\u2019s here. Come home with me.', { fx: 'mimic', pan: -0.6, dur: 4.4 }),
  L(61.5, 'emily', 'emily', 'Daddy?', { dur: 1.6 }),
  L(64.0, 'adam', 'adam', 'Em. Your father is in Boston.', { dur: 3 }),
  L(68.0, '', 'noah', 'Em... it\u2019s me. I\u2019m bleeding. The thing took me and I got away. Please.', { fx: 'mimic', pan: 0.3, dur: 6.4 }),
  L(75.0, 'lena', 'lena', 'Emily, no.', { dur: 1.6 }),
  L(77.5, '', 'noah', 'Adam, buddy. Twenty bucks says there\u2019s hot water. Remember?', { fx: 'mimic', pan: -0.3, dur: 5 }),
  L(83.0, 'adam', 'adam', 'It\u2019s using everything we\u2019ve said.', { dur: 3.2 }),
];
const s15: SceneDef = {
  id: 's15', title: 'The Ranger Station', env: 'ranger', opts: { time: 'storm', rain: 0.7, barricade: true, fog: 0.05 }, dur: 104, fin: 0.8, fout: 0.1,
  amb: { rain: 0.7, wind: 0.4, drone: 0.25, room: 0.15 }, music: 'tension', mvol: 0.4,
  anims: [{ obj: 'glass', vis: [[0, true], [87, false]] }],
  burn: { actor: 'creature', from: 91.1, to: 97 },
  actors: {
    adam: { char: 'adam', keys: [K(0, 1.0, 1.2, 0, 'idle', { l: [1.2, 1.5, 2], e: 'fear' }), Ka(9, 'idle', { l: 'emily' }), K(15.5, 1.0, 1.2, 0, 'idle'), K(17, 0.4, -0.9, PI, 'walk', { l: [0.3, 0.85, -1.5] }), K(18.5, 0.4, -0.9, PI, 'reach', { l: [0.3, 0.85, -1.5] }), K(20, 0.4, -0.9, PI, 'hold', { l: [0.3, 0.9, -1.2], e: 'worry' }), K(23, 0.4, -0.9, PI, 'hold'), K(24, 0.7, 0.8, 0, 'walk', { l: [1.2, 1.5, 2] }), K(25.4, 0.8, 1.0, 0, 'hold', { l: [1.2, 1.5, 2], e: 'worry' }), Ka(30.5, 'hold', { l: [1.2, 1.5, 2], e: 'sad' }), Ka(41.5, 'hold', { l: [1.2, 1.5, 2], e: 'angry' }), Ka(52, 'hold', { l: 'lena', e: 'worry' }), K(61, 0.8, 1.0, 0, 'hold'), K(63.4, 0.2, 0.8, 0, 'walk', { l: 'emily', e: 'fear' }), K(64.5, 0.2, 0.8, -0.5, 'hold', { l: 'emily' }), K(82, 0.2, 0.8, -0.5, 'hold'), K(85, 0.0, 0.5, -0.62, 'aim', { l: [-1.2, 1.5, 2], e: 'angry' }), K(95, 0.0, 0.5, -0.62, 'aim', { e: 'shock' }), K(98, 0.0, 0.5, -0.62, 'idle', { l: [-1.2, 1.5, 2.5], e: 'shock' })] },
    lena: { char: 'lena', keys: [K(0, 1.9, -0.4, -PI / 2, 'sit', { l: 'adam', e: 'fear' }), Ka(9, 'sit', { l: 'emily', e: 'worry' }), Ka(45.5, 'sit', { l: [1.2, 1.5, 2], e: 'shock' }), Ka(52, 'cry', { e: 'sad' }), Ka(64, 'sit', { l: 'emily', e: 'fear' }), Ka(75, 'sit', { l: 'emily', e: 'fear' }), Ka(85, 'cover', { e: 'fear' })] },
    emily: { char: 'emily', keys: [K(0, -1.8, -0.6, 0.6, 'cover', { l: [-1.2, 1.5, 2], e: 'fear' }), Ka(9, 'cry', { e: 'sad' }), Ka(14.5, 'cry'), K(56, -1.8, -0.6, 0.6, 'cry', { e: 'sad' }), K(61.4, -1.8, -0.6, 0.6, 'idle', { l: [1.2, 1.5, 2], e: 'shock' }), K(64, 0.3, 0.6, 0.2, 'walk'), K(64.8, 0.3, 0.7, 0.3, 'idle', { l: 'adam', e: 'sad' }), K(68, 0.3, 0.7, 0.3, 'idle', { l: [1.2, 1.5, 2], e: 'shock' }), K(76, 0.3, 0.7, 0.3, 'cry', { e: 'sad' }), K(85, -1.4, -0.6, 0.6, 'cover', { e: 'fear' })] },
    creature: { char: 'creature', keys: [K(0, -1.5, 3.6, PI, 'peer', { v: 0, u: 1 }), K(86.8, -1.5, 3.7, PI, 'peer', { v: 1, e: 'creepy' }), K(91.2, -1.5, 3.7, PI, 'peer', { v: 1 }), K(92.2, -1.5, 3.9, PI, 'sprint'), K(95, -9, 13, PI * 0.4, 'sprint'), K(97.5, -22, 30, PI * 0.4, 'sprint'), K(98, -22, 30, PI * 0.4, 'sprint', { v: 0 })] },
  },
  shots: [
    S(0, 6, [2.2, 1.8, 1.6], [0, 1, -0.5], { to: [1.9, 1.7, 1.3], fov: 48 }), S(6, 6, [0.0, 1.55, 1.7], 'adam', { fov: 34 }),
    S(12, 5, [-0.6, 1.2, 0.5], 'emily', { fov: 34 }), S(17, 8, [-0.8, 1.45, 0.2], [0.3, 0.9, -1.5], { to: [-0.3, 1.45, 0.3], fov: 36 }),
    S(25, 5.5, [0.0, 1.55, 1.8], 'adam', { fov: 32 }), S(30.5, 5, [-0.2, 1.5, 0.2], [1.2, 1.5, 2], { fov: 40 }),
    S(34.5, 7, [0.6, 1.5, 0.0], 'adam', { to: [0.7, 1.5, 0.3], fov: 24 }), S(41.5, 4, [1.9, 1.5, 0.6], 'lena', { fov: 32 }),
    S(45.5, 10, [1.2, 1.6, -1.2], 'lena', { to: [1.3, 1.6, -0.8], fov: 26 }), S(56, 5, [-0.9, 1.4, 0.8], 'emily', { fov: 28 }),
    S(61, 7, [1.2, 1.6, 0.0], [0.2, 1.4, 0.8], { fov: 40 }), S(68, 7, [0.7, 1.5, 0.0], 'emily', { fov: 26 }),
    S(75, 8, [1.5, 1.5, 0.3], 'adam', { to: [1.3, 1.5, 0.6], fov: 26 }), S(83, 4, [-0.6, 1.4, -0.4], 'adam', { fov: 40, shake: 0.2 }),
    S(87, 2.5, [0.3, 1.5, 0.6], [-1.2, 1.4, 2.0], { fov: 36, shake: 1.4 }), S(89.5, 1.7, [0.8, 1.6, 0.5], 'adam', { fov: 28, shake: 0.8 }),
    S(91.2, 4.5, [0.8, 1.5, 1.0], [-1.4, 1.6, 3.2], { fov: 44, shake: 1.8 }), S(95.7, 8.3, [1.2, 1.5, 0.2], 'adam', { fov: 34, shake: 0.2 }),
  ],
  lines: s15Lines,
  cues: ((): Cue[] => [
    { t: 8, bolt: true, sfx: 'thunder' }, { t: 17, sfx: 'wood_break', vol: 0.3 }, { t: 18.8, sfx: 'clink', vol: 0.6 }, { t: 33, bolt: true, sfx: 'thunder', vol: 0.8 }, { t: 24.5, sfx: 'stepsSlow', pan: 0.5, vol: 0.5 },
    { t: 38, sfx: 'knock', pan: 0.5, vol: 0.5 }, { t: 41, sfx: 'drag', pan: -0.4, vol: 0.5 }, { t: 45, music: 'dread', mvol: 0.6 }, { t: 55, sfx: 'rattle', pan: -0.5, vol: 0.5 }, { t: 60, bolt: true, sfx: 'thunder' },
    { t: 66, sfx: 'knock', pan: 0.3, vol: 0.7 }, { t: 73, sfx: 'scratch', pan: 0.3, vol: 0.7 }, { t: 76, music: 'tension', mvol: 0.7 }, { t: 85, bolt: true, sfx: 'thunder' }, { t: 86.8, sfx: 'glass', shake: 1.6 }, { t: 86.8, bolt: true },
    { t: 88, sfx: 'breathHeavy', vol: 0.7 }, { t: 89.6, sfx: 'click' }, { t: 91.1, sfx: 'flare', shake: 2 }, { t: 91.1, bolt: true }, { t: 91.8, sfx: 'scream', shake: 2 }, { t: 92.4, bolt: true },
    { t: 93.2, bolt: true }, { t: 94, music: 'none' }, { t: 95.2, sfx: 'sprint', vol: 0.5 }, { t: 97.5, sfx: 'cut' }, { t: 99.5, sfx: 'uncut', vol: 0 }, { t: 100, amb: { rain: 0.35, wind: 0.2, drone: 0, room: 0.2 }, ramp: 4 },
  ])(),
};

// ============================================================ SCENE 15b — DAWN
const s15b: SceneDef = {
  id: 's15b', title: 'Dawn', env: 'ranger', opts: { time: 'dawn', fog: 0.02 }, dur: 30, fin: 2.0, fout: 1.0,
  amb: { wind: 0.12, room: 0.2 }, music: 'sad', mvol: 0.5,
  cards: [{ t: 1.5, d: 3.5, text: 'DAWN', style: 'time' }],
  anims: [{ obj: 'door', rot: 'y', keys: [[0, 0], [22, 0], [23.2, 1.6]] }],
  actors: {
    adam: { char: 'adam', keys: [K(0, -1.2, 1.5, 0, 'lean', { l: [-1.2, 1.4, 3.5], e: 'tired' }), Ka(4.5, 'lean', { l: 'lena' }), Ka(12.5, 'lean', { l: [-1.2, 1.4, 3.5], e: 'sad' }), Ka(19, 'idle', { l: 'lena', e: 'worry' }), K(22.5, -1.2, 1.5, 0, 'idle', { l: [1.2, 1.4, 3] }), K(24, 0.4, 1.2, 0.2, 'walk', { l: [1.2, 1.4, 3.5] }), K(26, 1.2, 2.6, 0, 'walk'), K(29, 1.2, 5, 0, 'walk')] },
    lena: { char: 'lena', keys: [K(0, 1.9, -0.4, -PI / 2, 'sit', { l: [0, 0.2, 0.6], e: 'tired' }), Ka(2, 'sit', { l: 'adam' }), Ka(15.5, 'sit', { l: [0, 0.2, 0.6], e: 'sad' }), K(22.6, 1.9, -0.4, -PI / 2, 'sit'), K(23.4, 1.7, 0.4, 0.3, 'walk', { e: 'sad' }), K(26, 1.8, 2.8, 0, 'walk'), K(29, 1.8, 5.2, 0, 'walk')] },
    emily: { char: 'emily', keys: [K(0, 1.9, -1.4, -PI / 2, 'sit', { l: [0, 0.2, 0.6], e: 'sad' }), Ka(9, 'sit', { l: 'adam', e: 'sad' }), K(23, 1.9, -1.4, -PI / 2, 'sit'), K(24, 1.4, 0.6, 0.2, 'walk', { e: 'sad' }), K(26.5, 1.6, 3.0, 0, 'walk'), K(29, 1.6, 5.4, 0, 'walk')] },
  },
  shots: [
    S(0, 8, [2.2, 1.7, 1.6], [0, 0.8, -0.3], { to: [1.9, 1.6, 1.3], fov: 48 }), S(8, 8, [-0.4, 1.45, 0.6], 'adam', { to: [-0.6, 1.45, 0.8], fov: 32 }),
    S(16, 6.5, [0.6, 1.2, 0.4], 'lena', { fov: 32 }), S(22.5, 7.5, [-1.6, 1.5, -1.2], [1.2, 1.4, 3.2], { to: [-0.8, 1.5, -0.6], fov: 44 }),
  ],
  lines: [
    L(3.0, 'lena', 'lena', 'Is it gone?', { dur: 2 }), L(5.5, 'adam', 'adam', 'I think so. It\u2019s getting light.', { dur: 3 }),
    L(9.5, 'emily', 'emily', 'Noah\u2019s dead, isn\u2019t he?', { dur: 2.6 }), L(13.0, 'adam', 'adam', 'I don\u2019t know.', { dur: 2 }),
    L(16.0, 'lena', 'lena', 'We just left him.', { dur: 2.4 }), L(19.2, 'adam', 'adam', 'We\u2019re going to get help. We\u2019re going home.', { dur: 4 }),
  ],
  cues: [{ t: 8, sfx: 'bird', pan: 0.5, vol: 0.3 }, { t: 22.8, sfx: 'door_creak' }, { t: 24, sfx: 'steps', vol: 0.5 }],
};

export const act3: SceneDef[] = [s12, s13, s14, s15, s15b];
void face;
