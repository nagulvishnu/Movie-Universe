import type { SceneDef } from '../film/types';
import { cam, fx, g, mv, p, pmv } from './helpers';

// Chapter 4 — The Murder of Osiris. Chapter 5 — The Birth and Childhood of Horus.
export const chapter4Scenes: SceneDef[] = [
  {
    id: 'c4-1', env: 'palace', variant: 'day', music: 'tragedy', amb: ['temple'],
    card: { kicker: 'Chapter IV', title: 'The Murder of Osiris' },
    focus: [0, 2, -2], cam: [cam('push', 17, 3, { az: 0.3 }), cam('orbit', 12, 3, { spin: 0.6, w: 1 })],
    cast: [g('osiris', 0, -2, { aura: '#3fbf6f', anim: 'idle' }), g('isis', 3.2, -1.4, { aura: '#ffb347', face: -0.4 })],
    props: [p('throne', 0, 0, -2.6, { s: 1.05 })],
    fx: [fx('motes', { color: '#ffd98a', n: 90, area: [12, 6, 10] })],
  },
  {
    id: 'c4-2', env: 'fields', variant: 'day', music: 'heliopolis', amb: ['wind', 'nile'],
    focus: [0, 2, 0], cam: [cam('orbit', 14, 3, { spin: -0.8 }), cam('push', 10, 2.6, { w: 0.9 })],
    cast: [
      g('osiris', -1.4, 0, { anim: 'present', aura: '#3fbf6f', face: 0.4 }), g('isis', 2, 0.4, { aura: '#ffb347', face: -0.3 }),
      g('deceased', -5, 3, { anim: 'bow', face: 0.8 }), g('deceased', -4.2, 4.6, { anim: 'bow', face: 0.7 }),
    ],
    fx: [fx('motes', { color: '#f2e08a', n: 100, area: [14, 4, 10] })],
    hits: [[0.5, 'shimmer']],
  },
  {
    id: 'c4-3', env: 'palace', variant: 'dusk', music: 'tragedy', amb: ['temple', 'wind'],
    focus: [0, 2, -2], cam: [cam('push', 16, 2.8, { az: 0.4 }), cam('low', 12, 0.9, { w: 0.9 })],
    cast: [
      g('set', -4.5, 1.2, { anim: 'point', emote: 'angry', aura: '#c93a2a', face: 0.4 }),
      g('nephthys', 4.4, 0.4, { aura: '#8fb8ff', face: -0.4, emote: 'sad' }),
      g('osiris', 0, -6, { aura: '#3fbf6f' }),
    ],
    props: [p('throne', 0, 0, -6.6, { s: 1 })],
    fx: [fx('embers', { color: '#ff5a3a', n: 60, area: [10, 5, 8] })],
    hits: [[0.6, 'thunder']],
  },
  {
    id: 'c4-4', env: 'palace', variant: 'night', music: 'war', amb: ['temple', 'fire'],
    focus: [0, 1.2, 0], cam: [cam('push', 15, 3.2, { az: 0.4 }), cam('low', 9, 0.8, { w: 1 })],
    cast: [
      { ...g('osiris', 0, 0, { y: 0.6, anim: 'rest', s: 0.9 }), exit: 0.6 },
      g('set', -4, 2, { anim: 'point', emote: 'angry', aura: '#c93a2a', face: 0.5 }),
      g('deceased', 4, 2, { anim: 'cheer', face: -0.5, tint: '#4a3a3a' }),
      g('deceased', 5.8, -1, { anim: 'cheer', face: -1, tint: '#4a3a3a' }),
      g('deceased', -5.8, -1, { anim: 'cheer', face: 1, tint: '#4a3a3a' }),
    ],
    props: [p('chest', 0, 0, 0, { s: 1, a: 0, a2: 1, t0: 0.45, t1: 0.6 })],
    fx: [fx('sparks', { color: '#ffa04a', at: [0, 1, 0], n: 80, area: [2, 2, 2], enter: 0.55, exit: 0.8 })],
    hits: [[0.58, 'impact'], [0.7, 'impact'], [0.9, 'splash']],
  },
  {
    id: 'c4-5', env: 'nile', variant: 'night', music: 'tragedy', amb: ['nile', 'night'],
    focus: [0, 1.5, 0], cam: [cam('pan', 18, 3.5, { pan: 12, az: 0.4 })],
    cast: [mv(g('isis', -7, 5, { anim: 'mourn', face: Math.PI / 2, aura: '#ffb347' }), 5, 5)],
    props: [pmv(p('chest', -3, 0.1, -3, { s: 0.8, a: 1 }), 11, 0.1, -12), p('tree', 9, 0, -8, { s: 1.2 })],
    fx: [fx('stars', { n: 600 }), fx('mist', { color: '#7aa0c0', at: [0, 0.5, -4], area: [30, 1, 14] })],
    hits: [[0.4, 'splash']],
  },
  {
    id: 'c4-6', env: 'marsh', variant: 'night', music: 'tragedy', amb: ['night', 'water'],
    focus: [0, 1.5, 0], cam: [cam('orbit', 15, 3, { spin: 0.8 }), cam('push', 11, 2.6, { w: 0.9 })],
    cast: [
      { ...g('set', -4, 1, { anim: 'strike', emote: 'angry', aura: '#c93a2a', face: 0.5 }), exit: 0.45 },
      { ...mv(g('isis', 8, 0, { anim: 'mourn', aura: '#ffb347', enter: 0.4 }), 1.2, 1.5), face: -0.6 },
      { ...mv(g('nephthys', 9, -1.6, { anim: 'mourn', aura: '#8fb8ff', enter: 0.4 }), 3.8, -0.6), face: -0.8 },
    ],
    props: [p('boat', 2.4, 0, -4, { s: 0.7, enter: 0.4 }), p('moon', 8, 14, -24, { s: 3 })],
    fx: [fx('sparks', { color: '#ff7a4a', at: [-4, 1.4, 1], n: 90, area: [6, 3, 6], enter: 0.2, exit: 0.5 }), fx('motes', { color: '#bfe8a0', n: 90, area: [16, 4, 12] })],
    hits: [[0.25, 'impact'], [0.4, 'wing']],
  },
  {
    id: 'c4-7', env: 'temple', variant: 'embalm', music: 'tragedy', amb: ['temple'],
    focus: [0, 1.4, 0], cam: [cam('orbit', 11, 3.6, { spin: 1.2 }), cam('push', 8, 2.6, { w: 0.9 })],
    cast: [
      g('isis', -3, 0, { anim: 'mourn', face: 1.2, aura: '#ffb347' }), g('nephthys', 3, 0, { anim: 'mourn', face: -1.2, aura: '#8fb8ff' }),
      g('anubis', 0, 2.6, { anim: 'cast', face: Math.PI, aura: '#5a5aa0' }), g('thoth', 0, -3.4, { anim: 'present', aura: '#cfe8ff' }),
    ],
    props: [p('bier', 0, 0, 0, { s: 1 })],
    fx: [fx('motes', { color: '#ffcf5a', n: 80, area: [10, 5, 8] })],
    hits: [[0.4, 'chant']],
  },
  {
    id: 'c4-8', env: 'temple', variant: 'glow', music: 'divine', amb: ['temple', 'cosmic'],
    focus: [0, 2, 0], cam: [cam('push', 13, 4, { az: 0.3 }), cam('orbit', 9, 3.4, { spin: 0.8, w: 1 })],
    cast: [
      g('isis', -2.6, 0, { anim: 'raise', face: 1.2, aura: '#ffb347' }), g('nephthys', 3.2, 0, { anim: 'mourn', face: -1.2, aura: '#8fb8ff' }),
    ],
    props: [p('bier', 0, 0, 0, { s: 1 }), p('sun', 0, 3.6, 0, { s: 0.35, a: 0, a2: 1, t0: 0.2, t1: 0.6 })],
    fx: [fx('motes', { color: '#ffe08a', n: 200, area: [6, 5, 6] }), fx('beam', { at: [-2.6, 2, 0], to: [0, 1.4, 0], color: '#ffd27a' })],
    hits: [[0.3, 'shimmer'], [0.55, 'transform']], flash: [0.55],
  },
  {
    id: 'c4-9', env: 'duat', variant: 'calm', music: 'duat', amb: ['underworld', 'cosmic'],
    focus: [0, 2.2, -2], cam: [cam('push', 17, 3, { az: 0.2 }), cam('orbit', 12, 3, { spin: 0.7, w: 1 })],
    cast: [g('osiris', 0, -2, { anim: 'sit', aura: '#3fbf6f' }), g('anubis', -4, 1, { face: 0.5, aura: '#5a5aa0' }), g('isis', 4, 1, { face: -0.5, aura: '#ffb347' })],
    props: [p('throne', 0, 0, -2.6, { s: 1 }), p('djed', -8, 0, -4, { s: 1.2 }), p('djed', 8, 0, -4, { s: 1.2 })],
    fx: [fx('motes', { color: '#6fe08a', n: 140, area: [14, 7, 10] })],
    hits: [[0.4, 'shimmer']],
  },
];

export const chapter5Scenes: SceneDef[] = [
  {
    id: 'c5-1', env: 'marsh', variant: 'night', music: 'marsh', amb: ['night', 'water'],
    card: { kicker: 'Chapter V', title: 'The Birth and Childhood of Horus' },
    focus: [0, 1.8, 0], cam: [cam('push', 15, 3, { az: 0.35 }), cam('orbit', 9, 2.4, { spin: 0.7, w: 1 })],
    cast: [g('isis', 0, 0, { anim: 'carry', aura: '#ffb347' }), g('horusChild', 0.1, 0.9, { aura: '#ffe08a', anim: 'idle', s: 0.5, y: 1.3, enter: 0.3 })],
    props: [p('moon', -8, 14, -26, { s: 3 })],
    fx: [fx('motes', { color: '#d4ff7a', n: 120, area: [14, 4, 10] })],
    hits: [[0.3, 'shimmer']],
  },
  {
    id: 'c5-2', env: 'marsh', variant: 'dusk', music: 'marsh', amb: ['night', 'water'],
    focus: [0, 1.8, 0], cam: [cam('orbit', 14, 3, { spin: -0.9 }), cam('push', 10, 2.6, { w: 0.9 })],
    cast: [
      mv(g('isis', -6, 2, { anim: 'walk', face: 1.2, aura: '#ffb347' }), -1, 1.5), g('deceased', 3.4, 0, { anim: 'present', face: -0.9, tint: '#b07a5a' }),
      g('deceased', -8, -3, { anim: 'cheer', face: 0.4, tint: '#4a3a3a', enter: 0.6 }),
    ],
    props: [p('shrine', 6, 0, -3, { s: 0.5 })],
    fx: [fx('motes', { color: '#ffcf7a', n: 80, area: [14, 4, 10] })],
    hits: [[0.5, 'door']],
  },
  {
    id: 'c5-3', env: 'marsh', variant: 'dusk', music: 'tragedy', amb: ['wind', 'cosmic'],
    focus: [0, 2, 0], cam: [cam('push', 15, 3.4, { az: 0.3 }), cam('rise', 12, 5, { w: 0.9 })],
    cast: [
      g('horusChild', 0, 0, { anim: 'rest', s: 0.5, y: 0.2 }), g('isis', -2.4, 0, { anim: 'mourn', aura: '#ffb347', face: 0.8 }),
      mv(g('thoth', 3, -9, { y: 9, anim: 'float', aura: '#cfe8ff', face: 0.1 }), 3, 2, 0),
    ],
    props: [pmv(p('barque', -3, 10, -14, { s: 0.8 }), 0, 10, -14)],
    fx: [fx('beam', { at: [3, 0, 2], to: [0, 0.5, 0], color: '#cfe8ff', enter: 0.6 }), fx('motes', { color: '#ffd27a', n: 100, area: [12, 6, 8] })],
    hits: [[0.2, 'wing'], [0.6, 'shimmer']],
  },
  {
    id: 'c5-4', env: 'marsh', variant: 'dawn', music: 'dawn', amb: ['water', 'wind'],
    focus: [0, 2, 0], cam: [cam('orbit', 15, 3, { spin: 0.9 }), cam('rise', 13, 5, { w: 1 })],
    cast: [
      g('horusChild', -4.2, 1, { anim: 'idle', s: 0.55, aura: '#ffe08a', face: 0.4 }), g('isis', 0, 0, { aura: '#ffb347' }),
      g('horus', 4.2, 1, { anim: 'raise', aura: '#ffd27a', face: -0.3 }),
    ],
    props: [p('sun', 0, 6, -30, { s: 4 })],
    fx: [fx('motes', { color: '#ffe08a', n: 140, area: [14, 6, 10] })],
    hits: [[0.6, 'solar']],
  },
];
