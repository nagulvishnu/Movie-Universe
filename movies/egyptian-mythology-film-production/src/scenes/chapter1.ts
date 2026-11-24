import type { SceneDef } from '../film/types';
import { cam, fx, g, mv, p, pmv } from './helpers';

// Chapter 1 — The First Divine Family.
export const chapter1Scenes: SceneDef[] = [
  {
    id: 'c1-1', env: 'heliopolis', variant: 'dawn', music: 'heliopolis', amb: ['wind'],
    card: { kicker: 'Chapter I', title: 'The First Divine Family', sub: 'The Heliopolitan Ennead' },
    focus: [0, 2, 0], cam: [cam('push', 16, 3, { az: 0.45 }), cam('orbit', 11, 3, { spin: -0.6, w: 1.2 })],
    cast: [
      g('atum', 0, 0, { anim: 'raise', aura: '#ffd27a' }),
      g('shu', -2.6, 2.4, { anim: 'float', enter: 0.68, aura: '#cfe9ff', face: 0.5 }),
      g('tefnut', 2.6, 2.4, { anim: 'float', enter: 0.68, aura: '#7fd0ff', face: -0.5 }),
    ],
    props: [p('benben', -5, 0, -3, { s: 1.3 }), p('obelisk', -11, 0, -10, { s: 1.5 }), p('obelisk', 11, 0, -10, { s: 1.5 })],
    fx: [fx('motes', { color: '#ffd27a', n: 120, area: [14, 7, 12] }), fx('burst', { at: [0, 3, 2.4], color: '#ffe9a8', enter: 0.66, exit: 0.85 })],
    hits: [[0.66, 'transform']],
  },
  {
    id: 'c1-2', env: 'nun', variant: 'glow', music: 'divine', amb: ['water', 'cosmic'],
    focus: [0, 2.5, -2], cam: [cam('push', 24, 5, { az: 0.3 }), cam('orbit', 16, 4, { spin: 0.6, w: 1 })],
    cast: [
      g('atum', 0, 6, { anim: 'raise', emote: 'sad', aura: '#ffd27a', face: Math.PI }),
      mv(g('shu', -6, -14, { anim: 'walk', face: 0, aura: '#cfe9ff' }), -2.5, 3),
      mv(g('tefnut', 6, -16, { anim: 'walk', face: 0, aura: '#7fd0ff' }), 2.5, 3),
    ],
    props: [
      pmv(p('eyeofra', 0, 3.5, 4, { s: 0.9, exit: 0.5 }), 0, 3.5, -14),
      pmv(p('eyeofra', 0, 3.5, -14, { s: 0.9, enter: 0.5 }), 0, 3.5, 4),
    ],
    fx: [fx('motes', { color: '#ffd27a', n: 120, area: [20, 8, 24] }), fx('beam', { at: [0, 0, 6], to: [0, 14, 6], color: '#ffd27a' })],
    hits: [[0.2, 'whoosh'], [0.55, 'shimmer']],
  },
  {
    id: 'c1-3', env: 'cosmos', music: 'creation', amb: ['cosmic'],
    focus: [0, 3, 0], cam: [cam('orbit', 20, 5, { spin: 1.2 }), cam('push', 15, 3, { w: 0.8 })],
    cast: [
      g('geb', 0, 0, { y: 0.35, anim: 'rest', aura: '#5dbb63' }),
      g('shu', -9, 5, { anim: 'idle', face: 0.5, aura: '#cfe9ff' }),
      g('tefnut', 9, 5, { anim: 'idle', face: -0.5, aura: '#7fd0ff' }),
    ],
    props: [p('nutarch', 0, 0, 0, { a: 0.05, s: 1 })],
    fx: [fx('motes', { color: '#b9c8ff', n: 140, area: [22, 8, 12] })],
    hits: [[0.4, 'shimmer']],
  },
  {
    id: 'c1-4', env: 'cosmos', music: 'divine', amb: ['cosmic', 'wind'],
    focus: [0, 4.5, 0], cam: [cam('low', 26, 1.2, { az: 0.15 }), cam('rise', 24, 8, { w: 1.4 })],
    cast: [
      g('geb', 0, 0, { y: 0.35, anim: 'rest', aura: '#5dbb63' }),
      g('shu', 0, 0, { y: 0.8, s: 3.6, anim: 'raise', emote: 'stern', aura: '#cfe9ff' }),
    ],
    props: [p('nutarch', 0, 0, 0, { a: 0.1, a2: 1, t0: 0.12, t1: 0.6 })],
    fx: [fx('burst', { at: [0, 5, 0], color: '#ffffff', enter: 0.2, exit: 0.5 }), fx('motes', { color: '#cfd8ff', n: 200, area: [24, 10, 10] })],
    hits: [[0.15, 'impact'], [0.2, 'wing'], [0.6, 'shimmer']], flash: [0.18],
  },
  {
    id: 'c1-5', env: 'cosmos', music: 'creation', amb: ['cosmic'],
    focus: [0, 5, 0], cam: [cam('pan', 26, 4, { pan: 14, az: 0.1 })],
    cast: [g('geb', 0, 0, { y: 0.35, anim: 'rest', aura: '#5dbb63' }), g('shu', 0, 0, { y: 0.8, s: 3.6, anim: 'raise', aura: '#cfe9ff' })],
    props: [
      p('nutarch', 0, 0, 0, { a: 1 }),
      pmv(p('sun', 8, 4, 0, { s: 0.8 }), -9, 6.3, 0),
    ],
    fx: [fx('rays', { at: [-9, 6, 0], color: '#ffcf70', enter: 0.7 }), fx('motes', { color: '#ffd98a', n: 120, area: [20, 8, 6] })],
    hits: [[0.2, 'solar']],
  },
  {
    id: 'c1-6', env: 'heavens', variant: 'night', music: 'divine', amb: ['cosmic', 'wind'],
    focus: [0, 2, 0], cam: [cam('orbit', 13, 3, { spin: 0.9 }), cam('push', 10, 2.4, { w: 0.8 })],
    cast: [
      g('thoth', -2.2, 0, { anim: 'bow', face: 1.3, aura: '#cfe8ff' }),
      g('khonsu', 2.2, 0, { anim: 'point', face: -1.3, aura: '#e8e6ff' }),
      g('nut', 7, -2, { anim: 'mourn', face: -0.5, enter: 0.5 }),
    ],
    props: [p('senet', 0, 0, 0, { s: 1 }), p('moon', 0, 16, -26, { s: 6 })],
    fx: [fx('stars', { n: 800 }), fx('motes', { color: '#cfe8ff', n: 100, area: [10, 5, 8] })],
    hits: [[0.5, 'bell']],
  },
  {
    id: 'c1-7', env: 'heliopolis', variant: 'day', music: 'heliopolis', amb: ['wind'],
    focus: [0, 2, 0], cam: [cam('push', 24, 5, { az: 0.2 }), cam('orbit', 18, 4, { spin: -0.7, w: 1.2 })],
    cast: [
      g('atum', 0, -7, { aura: '#ffd27a' }),
      g('shu', -3, -3.5, { aura: '#cfe9ff' }), g('tefnut', 3, -3.5, { aura: '#7fd0ff' }),
      g('geb', -6.6, 0, { aura: '#5dbb63' }), g('nut', 6.6, 0, { aura: '#4a6fff' }),
      g('osiris', -5.2, 3.6, { aura: '#3fbf6f' }), g('isis', -2.4, 3.6, { aura: '#ffb347' }),
      g('set', 2.4, 3.6, { aura: '#d9503a' }), g('nephthys', 5.2, 3.6, { aura: '#8fb8ff' }),
    ],
    props: [p('obelisk', -13, 0, -12, { s: 1.6 }), p('obelisk', 13, 0, -12, { s: 1.6 })],
    fx: [fx('motes', { color: '#ffe3a0', n: 90, area: [18, 6, 12] })],
    hits: [[0.1, 'bell']],
  },
  {
    id: 'c1-8', env: 'heliopolis', variant: 'dusk', music: 'divine', amb: ['wind'],
    focus: [0, 2, 0], cam: [cam('push', 15, 2.6, { az: 0.3 }), cam('pull', 12, 3, { w: 0.8 })],
    cast: [
      g('osiris', -4.2, 1, { aura: '#3fbf6f', face: 0.3 }), g('isis', -1.4, 1, { aura: '#ffb347', face: 0.1 }),
      g('set', 1.4, 1, { aura: '#d9503a', face: -0.1 }), g('nephthys', 4.2, 1, { aura: '#8fb8ff', face: -0.3 }),
      g('atum', 0, -4, { aura: '#ffd27a' }),
    ],
    props: [p('sun', 0, 7, -34, { s: 5 }), p('obelisk', -10, 0, -9, { s: 1.4 }), p('obelisk', 10, 0, -9, { s: 1.4 })],
    fx: [fx('motes', { color: '#ffb066', n: 90, area: [18, 6, 12] })],
  },
];
