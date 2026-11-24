import type { SceneDef } from '../film/types';
import { cam, fx, g, mv, p, pmv } from './helpers';

// Chapter 6 — The Conflict Between Horus and Set.
export const chapter6Scenes: SceneDef[] = [
  {
    id: 'c6-1', env: 'heliopolis', variant: 'day', music: 'tribunal', amb: ['wind'],
    card: { kicker: 'Chapter VI', title: 'The Conflict Between Horus and Set', sub: 'The Contendings' },
    focus: [0, 2, -1], cam: [cam('push', 20, 3.5, { az: 0.3 }), cam('orbit', 14, 3, { spin: 0.7, w: 1 })],
    cast: [
      g('ra', 0, -7, { anim: 'sit', aura: '#ffcf5a' }),
      g('horus', -2.4, 3, { anim: 'present', face: 0.2, aura: '#ffd27a' }), g('set', 2.4, 3, { anim: 'idle', emote: 'angry', face: -0.2, aura: '#c93a2a' }),
      g('shu', -7, -3, { face: 0.8 }), g('thoth', 7, -3, { face: -0.8, aura: '#cfe8ff' }),
      g('geb', -8, 1, { face: 1.1 }), g('nut', 8, 1, { face: -1.1 }),
    ],
    props: [p('throne', 0, 0, -7.6, { s: 1 }), p('obelisk', -13, 0, -11, { s: 1.4 }), p('obelisk', 13, 0, -11, { s: 1.4 })],
    fx: [fx('motes', { color: '#ffe3a0', n: 80, area: [16, 6, 12] })],
    hits: [[0.4, 'gong']],
  },
  {
    id: 'c6-2', env: 'heliopolis', variant: 'day', music: 'tribunal', amb: ['wind'],
    focus: [0, 2, -1], cam: [cam('orbit', 13, 3, { spin: -0.9 }), cam('push', 9, 2.4, { w: 0.9 })],
    cast: [
      g('ra', 0, -7, { anim: 'sit', aura: '#ffcf5a' }), g('set', 0, 2, { anim: 'raise', emote: 'angry', aura: '#c93a2a' }),
      g('horus', -5, 3, { face: 0.5, emote: 'stern' }), g('thoth', 6.4, -2, { face: -0.8 }), g('isis', -7, 0, { face: 0.9 }),
    ],
    props: [p('throne', 0, 0, -7.6, { s: 1 })],
    fx: [fx('motes', { color: '#ff9a5a', n: 60, area: [14, 5, 10] })],
    hits: [[0.5, 'thunder']],
  },
  {
    id: 'c6-3', env: 'heliopolis', variant: 'dusk', music: 'tribunal', amb: ['wind'],
    focus: [0, 2, -1], cam: [cam('push', 15, 3, { az: 0.25 }), cam('orbit', 11, 3, { spin: 0.7, w: 1 })],
    cast: [
      g('ra', 0, -7, { anim: 'sit', emote: 'sad', aura: '#ffcf5a' }),
      mv(g('hathor', -6, 3, { anim: 'cheer', emote: 'joy', aura: '#ffb0d0' }), -1.4, -1),
      g('neith', 6.4, 0, { anim: 'present', face: -0.8, aura: '#ff6a5a', enter: 0.12 }), g('thoth', -7, -3, { face: 0.8 }),
    ],
    props: [p('throne', 0, 0, -7.6, { s: 1 }), p('stela', 8.6, 0, -4, { s: 0.8, ry: -0.7 })],
    fx: [fx('motes', { color: '#ffb066', n: 70, area: [14, 5, 10] })],
    hits: [[0.8, 'bell']],
  },
  {
    id: 'c6-4', env: 'nile', variant: 'dusk', music: 'marsh', amb: ['nile', 'wind'],
    focus: [0, 1.8, 0], cam: [cam('orbit', 13, 2.8, { spin: 0.9 }), cam('push', 9, 2.4, { w: 0.9 })],
    cast: [
      { ...g('isis', -2.4, 3, { anim: 'mourn', face: 0.7, aura: '#ffb347' }) },
      g('set', 2.6, 3, { anim: 'point', emote: 'angry', face: -0.7, aura: '#c93a2a' }),
    ],
    props: [],
    fx: [fx('burst', { at: [-2.4, 2, 3], color: '#ffcf8a', enter: 0.6, exit: 0.8 }), fx('motes', { color: '#ffb066', n: 70, area: [12, 5, 8] })],
    hits: [[0.6, 'transform'], [0.85, 'roar']],
  },
  {
    id: 'c6-5', env: 'nile', variant: 'storm', music: 'war', amb: ['nile', 'storm', 'battle'],
    focus: [0, 1.2, -5], cam: [cam('low', 15, 1.2, { az: 0.3 }), cam('orbit', 12, 3, { spin: 1, w: 1 })],
    cast: [g('isis', 0, 8, { anim: 'strike', face: Math.PI, aura: '#ffb347', enter: 0.35 })],
    props: [pmv(p('hippo', -3, 0, -6, { s: 1.1, color: '#d9a441' }), -2, 0, -5.6), pmv(p('hippo', 3, 0, -6, { s: 1.1, color: '#a03a2a', ry: Math.PI }), 2, 0, -6.4)],
    fx: [fx('rings', { at: [0, 0.1, -6], color: '#cfe8ff' }), fx('rain', { n: 300, area: [26, 14, 20] }), fx('lightning', { at: [8, 22, -14] })],
    hits: [[0.1, 'splash'], [0.3, 'roar'], [0.55, 'clash'], [0.75, 'roar']], flash: [0.55],
  },
  {
    id: 'c6-6', env: 'battlefield', variant: 'storm', music: 'war', amb: ['storm', 'wind'],
    focus: [0, 1.2, 0], cam: [cam('orbit', 12, 3, { spin: 0.8 }), cam('low', 9, 0.9, { w: 0.9 })],
    cast: [
      g('horus', 0, 0, { y: 0.2, anim: 'rest', aura: '#ffd27a' }), g('set', 2.4, 1, { anim: 'strike', emote: 'angry', face: -0.8, aura: '#c93a2a' }),
      g('hathor', -8, 4, { anim: 'walk', enter: 0.55, face: 1.1, aura: '#ffb0d0' }),
    ],
    fx: [fx('sand', { color: '#c9803a', n: 300, area: [24, 6, 20] }), fx('burst', { at: [0, 1, 0], color: '#ffffff', enter: 0.4, exit: 0.55 })],
    hits: [[0.4, 'impact'], [0.7, 'shimmer']], flash: [0.42],
  },
  {
    id: 'c6-7', env: 'nile', variant: 'day', music: 'war', amb: ['nile', 'battle'],
    focus: [0, 1.5, -5], cam: [cam('orbit', 18, 4, { spin: 0.9 }), cam('push', 12, 3, { w: 1 })],
    props: [
      p('stoneship', -4, 0, -6, { s: 1, a: 0, a2: 1, t0: 0.35, t1: 0.7 }), p('boat', 4, 0, -6, { s: 1, color: '#c9b79a', exit: 0.9 }),
      p('hippo', -4, 0, -3.4, { s: 1.2, color: '#a03a2a', enter: 0.7 }),
    ],
    cast: [g('horus', 4, -6, { y: 0.5, anim: 'idle', aura: '#ffd27a', face: -0.4 }), g('set', -4, -6, { y: 0.8, anim: 'idle', emote: 'angry', exit: 0.65, face: 0.4, aura: '#c93a2a' })],
    fx: [fx('rings', { at: [-4, 0.1, -6], color: '#cfe8ff', enter: 0.4 }), fx('rain', { n: 100, area: [20, 10, 14] })],
    hits: [[0.4, 'splash'], [0.75, 'impact'], [0.78, 'roar']],
  },
  {
    id: 'c6-8', env: 'duat', variant: 'calm', music: 'duat', amb: ['underworld', 'cosmic'],
    focus: [0, 2, -2], cam: [cam('push', 16, 3, { az: 0.3 }), cam('orbit', 12, 3, { spin: -0.7, w: 1 })],
    cast: [
      g('thoth', -3.6, 3, { anim: 'present', aura: '#cfe8ff', face: 0.4 }), g('ra', 4.4, 2, { anim: 'idle', face: -0.5, aura: '#ffcf5a' }),
      g('osiris', 0, -8, { anim: 'sit', s: 1.9, aura: '#3fbf6f', enter: 0.25 }),
    ],
    props: [p('throne', 0, 0, -9.2, { s: 1.9, enter: 0.25 })],
    fx: [fx('motes', { color: '#6fe08a', n: 140, area: [16, 7, 12] })],
    hits: [[0.3, 'chant'], [0.7, 'gong']],
  },
  {
    id: 'c6-9', env: 'heliopolis', variant: 'dawn', music: 'dawn', amb: ['wind'],
    focus: [0, 2.4, 0], cam: [cam('push', 19, 3.5, { az: 0.25 }), cam('rise', 13, 5, { w: 1 })],
    cast: [
      g('horus', 0, 1, { anim: 'raise', aura: '#ffd27a' }), g('isis', -3.8, 1.4, { anim: 'cheer', aura: '#ffb347' }), g('ra', 0, -6, { aura: '#ffcf5a' }),
      g('set', 4.2, 2.6, { anim: 'bow', face: -0.5, emote: 'stern', aura: '#c93a2a' }), g('thoth', -6.5, -2, { face: 0.7 }),
    ],
    props: [p('sun', 0, 7, -34, { s: 5 }), p('obelisk', -12, 0, -10, { s: 1.4 }), p('obelisk', 12, 0, -10, { s: 1.4 })],
    fx: [fx('rays', { at: [0, 7, -34], color: '#ffd27a' }), fx('burst', { at: [0, 4, 1], color: '#ffe9a8', enter: 0.36, exit: 0.6 }), fx('motes', { color: '#ffe3a0', n: 140, area: [16, 7, 12] })],
    hits: [[0.4, 'solar'], [0.9, 'thunder']], flash: [0.4],
  },
  {
    id: 'c6-10', env: 'heliopolis', variant: 'dusk', music: 'divine', amb: ['wind', 'cosmic'],
    focus: [0, 3, 0], cam: [cam('orbit', 15, 3.4, { spin: 1.3 }), cam('pull', 12, 4, { w: 0.8 })],
    cast: [g('horus', -2.2, 0, { anim: 'raise', face: 1.3, aura: '#ffd27a' }), g('set', 2.2, 0, { anim: 'raise', face: -1.3, aura: '#c93a2a' }), g('geb', 0, -6, { aura: '#5dbb63' })],
    props: [p('wingdisk', 0, 8.5, 0, { s: 2 }), p('sun', 0, 7, -34, { s: 5 })],
    fx: [fx('motes', { color: '#ffd27a', n: 120, area: [14, 7, 10] })],
    hits: [[0.5, 'shimmer']],
  },
];
