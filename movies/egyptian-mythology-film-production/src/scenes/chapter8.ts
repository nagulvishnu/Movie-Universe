import type { CastDef, GodId, SceneDef } from '../film/types';
import { arc, cam, fx, g, mv, p, pmv } from './helpers';

// Chapter 8 — Ra's Nightly Journey and Apep. Chapter 9 — The Eternal Gods of Egypt. Finale.
const DECK = 0.9; // barque deck height
const crew = (x: number, y: number, z: number): CastDef[] => [
  g('ramRa', x, z, { y: y + DECK, anim: 'idle', aura: '#ffb347', face: Math.PI / 2 }),
  g('thoth', x - 2.2, z, { y: y + DECK, face: Math.PI / 2, anim: 'idle' }),
  g('maat', x - 3.6, z, { y: y + DECK, face: Math.PI / 2 }),
  g('isis', x - 5, z, { y: y + DECK, face: Math.PI / 2, aura: '#ffb347' }),
  g('serqet', x + 2, z, { y: y + DECK, face: Math.PI / 2 }),
  g('set', x + 4.6, z, { y: y + DECK, face: Math.PI / 2, emote: 'stern', aura: '#c93a2a' }),
];

export const chapter8Scenes: SceneDef[] = [
  {
    id: 'c8-1', env: 'nile', variant: 'dusk', music: 'duat', amb: ['nile', 'wind'],
    card: { kicker: 'Chapter VIII', title: "Ra's Nightly Journey and Apep" },
    focus: [0, 4, -12], cam: [cam('push', 24, 3, { az: 0.2 }), cam('rise', 22, 6, { w: 0.8 })],
    cast: [mv(g('atum', 0, -10, { y: 4.4, anim: 'idle', aura: '#ff9a4a' }), 0, -17, 1.4)],
    props: [pmv(p('barque', 0, 3.5, -10, { s: 1.1 }), 0, 0.6, -17), pmv(p('sun', 0, 6, -40, { s: 5 }), 0, 0, -40)],
    fx: [fx('motes', { color: '#ff9a4a', n: 110, area: [20, 8, 14] })],
    hits: [[0.6, 'wing']],
  },
  {
    id: 'c8-2', env: 'duat', variant: 'duat', music: 'duat', amb: ['underworld', 'water'],
    focus: [0, 2.2, -4], cam: [cam('track', 14, 3.2, { pan: -12, az: 0.8 }), cam('orbit', 14, 3, { spin: 0.6, w: 0.7 })],
    cast: [
      g('ramRa', -2, 8, { y: DECK, anim: 'idle', aura: '#ffb347', face: Math.PI / 2 }), g('osiris', 17, 0, { aura: '#3fbf6f', face: -1.2, enter: 0.45 }),
    ],
    props: [pmv(p('barque', -2, 0, 8, { s: 1, a: 1 }), 2, 0, -12), p('gate', 0, 0, -26, { s: 1 })],
    fx: [fx('motes', { color: '#ffd27a', n: 90, area: [12, 6, 8], at: [0, 2, 0] }), fx('embers', { color: '#ff5a2a', n: 100, area: [20, 6, 26] })],
    hits: [[0.2, 'door'], [0.5, 'shimmer']],
  },
  {
    id: 'c8-3', env: 'duat', variant: 'duat', music: 'duat', amb: ['underworld', 'water'],
    focus: [0, 2.6, 0], cam: [cam('orbit', 17, 3.6, { spin: 1.4 }), cam('push', 12, 3, { w: 0.8 })],
    cast: crew(0, 0, 0),
    props: [p('barque', -0.6, 0, 0, { s: 1.2, a: 1 }), p('apep', 0, 1.8, 0, { s: 0.28, a: -1, color: '#d9a441' })],
    fx: [fx('motes', { color: '#ffd27a', n: 100, area: [12, 6, 6], at: [0, 3, 0] }), fx('embers', { color: '#ff5a2a', n: 60, area: [18, 6, 18] })],
    hits: [[0.5, 'chant']],
  },
  {
    id: 'c8-4', env: 'duat', variant: 'fire', music: 'apep', amb: ['underworld', 'fire'],
    focus: [0, 3, -8], cam: [cam('push', 24, 4, { az: 0.35 }), cam('low', 14, 1.4, { w: 1 })],
    props: [p('sandbank', 0, 0, -10, { s: 1.4 }), p('apep', 0, 0.2, -10, { s: 1.4, a: 0.25 }), p('barque', 7, 0, 10, { s: 0.7, a: 1 })],
    fx: [fx('embers', { color: '#ff4a1a', n: 160, area: [26, 8, 26] }), fx('mist', { color: '#7a1a1a', at: [0, 0.8, -6], area: [24, 1, 18] })],
    hits: [[0.4, 'hiss'], [0.8, 'roar']],
  },
  {
    id: 'c8-5', env: 'duat', variant: 'fire', music: 'apep', amb: ['underworld', 'fire', 'storm'],
    focus: [0, 5, -4], cam: [cam('pull', 14, 2.5, { az: 0.35 }), cam('rise', 22, 4, { w: 1.2 })],
    cast: crew(0, 0, 9).map((c) => ({ ...c, s: 0.8 })),
    props: [p('barque', -0.6, 0, 9, { s: 0.96, a: 1 }), p('apep', 0, 0.2, -10, { s: 1.5, a: 0.1, a2: 1, t0: 0.15, t1: 0.7 })],
    fx: [fx('rings', { at: [0, 0.1, -10], color: '#ff4a2a' }), fx('lightning', { at: [-8, 26, -16] }), fx('embers', { color: '#ff4a1a', n: 160, area: [26, 8, 26] })],
    hits: [[0.2, 'thunder'], [0.5, 'roar'], [0.8, 'boom']], flash: [0.2],
  },
  {
    id: 'c8-6', env: 'duat', variant: 'fire', music: 'apep', amb: ['underworld', 'fire', 'battle'],
    focus: [0, 4, 0], cam: [cam('orbit', 17, 3.4, { spin: 1.8 }), cam('low', 12, 1.2, { w: 0.8 })],
    cast: crew(0, 0, 0).map((c) => (c.id === 'isis' || c.id === 'serqet' ? { ...c, anim: 'cast' as const } : c)),
    props: [p('barque', -0.6, 0, 0, { s: 1.2, a: 1 }), p('apep', 0, 0.5, -3.5, { s: 1.3, a: 1 }), p('apep', 0, 1.8, 0, { s: 0.28, a: -1, color: '#d9a441' })],
    fx: [fx('beam', { at: [-5, 3.4, 0], to: [0, 8, -3.5], color: '#ffb347' }), fx('beam', { at: [2, 3.4, 0], to: [0, 7, -3.5], color: '#ffe06a' }), fx('lightning', { at: [6, 24, -6] }), fx('embers', { color: '#ff4a1a', n: 160, area: [20, 8, 20] })],
    hits: [[0.15, 'roar'], [0.4, 'hiss'], [0.65, 'clash'], [0.85, 'roar']],
  },
  {
    id: 'c8-7', env: 'duat', variant: 'fire', music: 'apep', amb: ['underworld', 'fire', 'battle'],
    focus: [0, 4, -2], cam: [cam('push', 16, 3.2, { az: 0.45 }), cam('orbit', 13, 3.6, { spin: -1.2, w: 1 })],
    cast: crew(0, 0, 0).map((c) => (c.id === 'set' ? { ...c, anim: 'strike' as const } : c.id === 'thoth' ? { ...c, anim: 'cast' as const } : c)),
    props: [p('barque', -0.6, 0, 0, { s: 1.2, a: 1 }), pmv(p('apep', 0, 0.5, -3.5, { s: 1.3, a: 1 }), 0, -6, -6), p('eyeofra', 0, 6, 2, { s: 1.2 })],
    fx: [fx('beam', { at: [4.6, 3, 0], to: [0, 6, -4], color: '#ff5a2a' }), fx('burst', { at: [0, 6, -4], color: '#ffe9a8', enter: 0.35, exit: 0.6 }), fx('sparks', { color: '#ffd27a', at: [0, 5, -4], n: 120, area: [4, 4, 4], enter: 0.35, exit: 0.8 })],
    hits: [[0.2, 'whoosh'], [0.35, 'impact'], [0.45, 'solar'], [0.8, 'roar']], flash: [0.36],
  },
  {
    id: 'c8-8', env: 'nile', variant: 'dawn', music: 'dawn', amb: ['nile', 'wind'],
    focus: [0, 4, -12], cam: [cam('rise', 26, 2.2, { az: 0.2 }), cam('pull', 22, 6, { w: 0.8 })],
    cast: [g('khepri', 7, 3, { aura: '#4aa0ff', face: -0.6, anim: 'raise' }), mv(g('ramRa', -8, -6, { y: DECK, face: Math.PI / 2, aura: '#ffb347' }), 2, -6)],
    props: [pmv(p('barque', -8, 0, -6, { s: 0.9, a: 0 }), 2, 0, -6), pmv(p('sun', 0, -2, -50, { s: 5 }), 0, 8, -50), p('scarab', 0, 12, -28, { s: 1.3, a: 0, a2: 1 })],
    fx: [fx('rays', { at: [0, 5, -50], color: '#ffd27a', enter: 0.2 }), fx('motes', { color: '#ffe3a0', n: 140, area: [24, 8, 14] })],
    hits: [[0.3, 'solar'], [0.7, 'shimmer']], flash: [0.5],
  },
];

const ALL_MONTAGE: GodId[] = ['thoth', 'maat', 'hathor', 'sekhmet', 'bastet', 'ptah', 'amun', 'mut', 'khonsu', 'khnum'];
const MONTAGE2: GodId[] = ['sobek', 'neith', 'min', 'taweret', 'bes', 'seshat', 'serqet', 'renenutet', 'nefertum', 'wepwawet', 'sokar', 'anubis'];

export const chapter9Scenes: SceneDef[] = [
  {
    id: 'c9-1', env: 'heliopolis', variant: 'day', music: 'finale', amb: ['wind', 'temple'],
    card: { kicker: 'Chapter IX', title: 'The Eternal Gods of Egypt' },
    focus: [0, 3, 0], cam: [cam('push', 20, 3, { az: 0.2 }), cam('orbit', 14, 3.5, { spin: 0.7, w: 1 })],
    cast: [g('horus', -3, 2, { anim: 'present', aura: '#ffd27a', face: 0.3 }), g('maat', 3, 2, { aura: '#ffffff', face: -0.3 }), g('ra', 0, -5, { aura: '#ffcf5a', anim: 'idle' })],
    props: [p('wingdisk', 0, 9, 0, { s: 2 }), p('obelisk', -10, 0, -8, { s: 1.5 }), p('obelisk', 10, 0, -8, { s: 1.5 })],
    fx: [fx('motes', { color: '#ffe3a0', n: 120, area: [18, 7, 12] })],
  },
  {
    id: 'c9-2', env: 'nile', variant: 'dawn', music: 'finale', amb: ['nile', 'wind'],
    focus: [0, 2, 0], cam: [cam('pull', 10, 2.5, { az: 0.5 }), cam('rise', 22, 4, { w: 1 })],
    cast: [g('osiris', -5, 3, { anim: 'idle', aura: '#3fbf6f', face: 0.5 }), g('khnum', 5, 3, { face: -0.5, aura: '#7fd0a0' })],
    props: [p('moon', -16, 14, -50, { s: 1.2, color: '#ffffff' })],
    fx: [fx('stars', { n: 300 }), fx('motes', { color: '#cfe8ff', n: 80, area: [24, 6, 14] })],
    hits: [[0.5, 'shimmer']],
  },
  {
    id: 'c9-3', env: 'heliopolis', variant: 'day', music: 'thebes', amb: ['wind', 'temple'],
    focus: [0, 2, 0], cam: [cam('track', 14, 3.4, { pan: 16, az: 0.6 })],
    cast: [
      ...[-3, -1, 1, 3].flatMap((x) => [mv(g('deceased', -14 + x, 1.6, { anim: 'walk', face: Math.PI / 2, tint: '#f5f0e0' }), 14 + x, 1.6), mv(g('deceased', -14 + x, -1.6, { anim: 'walk', face: Math.PI / 2, tint: '#f5f0e0' }), 14 + x, -1.6)]),
    ],
    props: [pmv(p('shrine', -14, 3, 0, { s: 0.7 }), 14, 3, 0), p('obelisk', -6, 0, -8, { s: 1.4 }), p('obelisk', 6, 0, -8, { s: 1.4 })],
    fx: [fx('motes', { color: '#ffe3a0', n: 100, area: [28, 7, 10] }), fx('mist', { color: '#ffffff', at: [0, 3, 0], area: [24, 1, 6] })],
    hits: [[0.3, 'bell'], [0.7, 'chant']],
  },
  {
    id: 'c9-4', env: 'heavens', variant: 'dawn', music: 'apep', amb: ['wind', 'cosmic'],
    focus: [0, 3, -6], cam: [cam('push', 26, 3, { az: 0.2 }), cam('orbit', 16, 4, { spin: 0.5, w: 0.8 })],
    cast: [g('maat', 0, 0, { anim: 'raise', aura: '#ffffff' })],
    props: [p('apep', 0, 0, -18, { s: 1.2, a: 0.7, color: '#4a2a6a' }), p('sun', 0, 7, -30, { s: 4 })],
    fx: [fx('rays', { at: [0, 7, -30], color: '#ffd27a' }), fx('motes', { color: '#ffffff', n: 120, area: [14, 7, 10] })],
    hits: [[0.4, 'roar'], [0.7, 'shimmer']],
  },
  {
    id: 'c9-5', env: 'nile', variant: 'day', music: 'heliopolis', amb: ['nile', 'wind'],
    focus: [0, 4, -16], cam: [cam('track', 20, 4, { pan: 22, az: 0.3 })],
    props: [p('obelisk', -12, 0, -10, { s: 1.8 }), p('obelisk', 12, 0, -10, { s: 1.8 }), pmv(p('boat', -14, 0, -4, { s: 1 }), 14, 0, -4), p('wingdisk', 0, 11, -16, { s: 2.2 })],
    fx: [fx('motes', { color: '#ffe3a0', n: 90, area: [30, 8, 14] })],
    hits: [[0.5, 'shimmer']],
  },
  {
    id: 'c9-6', env: 'heliopolis', variant: 'dawn', music: 'finale', amb: ['wind', 'cosmic'],
    focus: [0, 3, 0], cam: [cam('orbit', 30, 6, { spin: 1.6 }), cam('rise', 26, 12, { w: 0.9 })],
    cast: [
      g('ra', 0, -8, { s: 1.5, aura: '#ffcf5a' }),
      g('osiris', -5, -3, { aura: '#3fbf6f' }), g('isis', -2, -3, { aura: '#ffb347' }), g('horus', 2, -3, { aura: '#ffd27a' }), g('set', 5, -3, { aura: '#c93a2a' }),
      ...arc(ALL_MONTAGE, 11, -1.35, 1.35, 'idle'), ...arc(MONTAGE2, 16, -1.4, 1.4, 'idle'),
    ],
    props: [p('sun', 0, 8, -44, { s: 6 })],
    fx: [fx('rays', { at: [0, 8, -44], color: '#ffd27a' }), fx('motes', { color: '#ffe3a0', n: 220, area: [30, 10, 20] })],
    hits: [[0.15, 'shimmer'], [0.6, 'bell']],
  },
  {
    id: 'c9-7', env: 'nile', variant: 'sunrise', music: 'finale', amb: ['nile', 'wind'],
    focus: [0, 5, -20], cam: [cam('rise', 30, 1.5, { az: 0.15 }), cam('pull', 26, 6, { w: 1.2 })],
    props: [pmv(p('sun', 0, 1, -60, { s: 6 }), 0, 16, -60)],
    fx: [fx('rays', { at: [0, 9, -60], color: '#ffd27a' }), fx('motes', { color: '#ffe3a0', n: 160, area: [30, 9, 16] })],
    hits: [[0.4, 'solar']],
  },
];

export const finaleScenes: SceneDef[] = [
  {
    id: 'fin-1', env: 'void', music: 'title', amb: ['cosmic'], title: true, hold: 13, lead: 1.5, tail: 2,
    focus: [0, 3, 0], cam: [cam('push', 32, 4, { fov: 40 })],
    props: [p('wingdisk', 0, 4.5, 0, { s: 1.6 })],
    fx: [fx('motes', { color: '#ffd27a', n: 240, area: [16, 9, 6], size: 0.06 }), fx('stars', { n: 500 })],
    hits: [[0.12, 'gong']],
  },
  {
    id: 'fin-2', env: 'nile', variant: 'night', music: 'credits', amb: ['night', 'nile'], credits: true, hold: 96, lead: 2, tail: 3,
    focus: [0, 4, -16], cam: [cam('rise', 32, 3, { az: 0.2 })],
    fx: [fx('stars', { n: 900 }), fx('motes', { color: '#ffe3a0', n: 70, area: [30, 8, 14] })],
  },
];
