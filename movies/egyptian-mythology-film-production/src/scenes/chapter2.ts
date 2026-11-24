import type { SceneDef } from '../film/types';
import { arc, cam, fx, g, mv, p, pmv, row } from './helpers';

// Chapter 2 — Ra, the King of the Sun.
export const chapter2Scenes: SceneDef[] = [
  {
    id: 'c2-1', env: 'heavens', variant: 'dawn', music: 'solar', amb: ['wind', 'cosmic'],
    card: { kicker: 'Chapter II', title: 'Ra, the King of the Sun' },
    focus: [0, 2.4, 0], cam: [cam('push', 18, 2.5, { az: 0.3 }), cam('orbit', 12, 3, { spin: 0.8, w: 1.2 })],
    cast: [g('ra', 0, 0, { y: 0, anim: 'raise', aura: '#ffcf5a' })],
    props: [p('sun', 0, 5, -16, { s: 5 })],
    fx: [fx('rays', { at: [0, 5, -16], color: '#ffd27a' }), fx('motes', { color: '#ffd98a', n: 160, area: [16, 8, 10] })],
    hits: [[0.1, 'solar']],
  },
  {
    id: 'c2-2', env: 'heavens', variant: 'day', music: 'solar', amb: ['wind'],
    focus: [0, 6, -2], cam: [cam('track', 14, 2.5, { pan: 20, az: 0.5 })],
    cast: [
      mv(g('ra', -14, -2, { y: 6.9, aura: '#ffcf5a', anim: 'idle', face: Math.PI / 2 }), 14, -2),
      mv(g('maat', -15.8, -2, { y: 6.9, face: Math.PI / 2 }), 12.2, -2),
      mv(g('thoth', -12.4, -2, { y: 6.9, face: Math.PI / 2 }), 15.6, -2),
    ],
    props: [pmv(p('barque', -14, 6, -2, { s: 1.2, a: 0 }), 14, 6, -2)],
    fx: [fx('rays', { at: [0, 20, -30], color: '#fff2c0' })],
    hits: [[0.05, 'wing']],
  },
  {
    id: 'c2-3', env: 'heavens', variant: 'dawn', music: 'solar', amb: ['wind'],
    focus: [0, 3, 0], cam: [cam('pan', 22, 3, { pan: 10, az: 0.15 }), cam('rise', 20, 5, { w: 0.8 })],
    cast: [
      g('khepri', -6.5, 2, { aura: '#4aa0ff', face: 0.3 }), g('ra', 0, 2, { aura: '#ffcf5a' }), g('atum', 6.5, 2, { aura: '#ff9a4a', face: -0.3 }),
    ],
    props: [p('scarab', -6.5, 7.5, -4, { s: 1.4, a: 0, a2: 1 }), p('sun', 0, 6, -20, { s: 4 })],
    fx: [fx('rays', { at: [0, 6, -20], color: '#ffc870' }), fx('motes', { color: '#ffd98a', n: 140, area: [20, 8, 10] })],
    hits: [[0.15, 'solar']],
  },
  {
    id: 'c2-4', env: 'heavens', variant: 'day', music: 'thebes', amb: ['wind', 'cosmic'],
    focus: [0, 2.4, 0], cam: [cam('orbit', 13, 3, { spin: 1.2 }), cam('push', 10, 2.5, { w: 1 })],
    cast: [
      { ...mv(g('amun', -5, 0, { face: 1.2, aura: '#4a8fff' }), -1, 0), exit: 0.62 },
      { ...mv(g('ra', 5, 0, { face: -1.2, aura: '#ffcf5a' }), 1, 0), exit: 0.62 },
      g('amunRa', 0, 0, { enter: 0.62, aura: '#ffd27a', anim: 'raise' }),
    ],
    props: [p('sun', 0, 6, -18, { s: 4 })],
    fx: [fx('burst', { at: [0, 2.4, 0], color: '#ffd27a', enter: 0.58, exit: 0.8 }), fx('motes', { color: '#ffd98a', n: 120, area: [14, 7, 8] })],
    hits: [[0.6, 'transform']], flash: [0.6],
  },
  {
    id: 'c2-5', env: 'heavens', variant: 'day', music: 'divine', amb: ['wind', 'cosmic'],
    focus: [0, 3, 0], cam: [cam('push', 20, 3, { az: 0.2 }), cam('orbit', 14, 4, { spin: -0.6, w: 0.9 })],
    cast: row(['hathor', 'sekhmet', 'bastet', 'mut'], 3.4, 2, 'idle', { face: 0 }),
    props: [p('eyeofra', 0, 6.5, -2, { s: 1.6 })],
    fx: [fx('rays', { at: [0, 6.5, -2], color: '#ffb347' }), fx('motes', { color: '#ffd27a', n: 100, area: [16, 8, 8] })],
    hits: [[0.3, 'shimmer']],
  },
  {
    id: 'c2-6', env: 'heavens', variant: 'dusk', music: 'tribunal', amb: ['wind', 'cosmic'],
    focus: [0, 2, -1], cam: [cam('orbit', 17, 4, { spin: 0.8 }), cam('push', 13, 3, { w: 0.9 })],
    cast: [
      g('ra', 0, -4, { y: 0, anim: 'sit', emote: 'sad', aura: '#ffcf5a' }),
      ...arc(['nun', 'shu', 'tefnut', 'geb', 'nut'], 7, -1.1, 1.1, 'present', { emote: 'stern' }, -4).map((c) => ({ ...c, at: [c.at[0], 0, c.at[2] + 5] as [number, number, number] })),
    ],
    props: [p('throne', 0, 0, -4.6, { s: 1 })],
    fx: [fx('motes', { color: '#ffb066', n: 100, area: [14, 6, 10] })],
    hits: [[0.5, 'chant']],
  },
  {
    id: 'c2-7', env: 'battlefield', variant: 'blood', music: 'war', amb: ['storm', 'wind'],
    focus: [0, 2.5, 0], cam: [cam('low', 14, 0.8, { az: 0.2 }), cam('orbit', 11, 2.5, { spin: -1, w: 1.2 })],
    cast: [mv(g('sekhmet', 0, -8, { s: 1.5, anim: 'stride', emote: 'angry', aura: '#ff3a2a' }), 0, 2)],
    fx: [fx('sand', { color: '#ff7a4a', n: 500, area: [30, 8, 24] }), fx('embers', { color: '#ff5a2a', n: 160, area: [20, 8, 20] }), fx('lightning', { at: [-10, 24, -16] })],
    hits: [[0.1, 'roar'], [0.35, 'thunder'], [0.7, 'roar']], flash: [0.35],
  },
  {
    id: 'c2-8', env: 'nile', variant: 'dusk', music: 'divine', amb: ['nile', 'wind'],
    focus: [0, 1.5, 0], cam: [cam('orbit', 16, 4, { spin: 0.7 }), cam('push', 12, 2.6, { w: 1 })],
    cast: [
      g('ra', -6, 3, { anim: 'point', face: 0.7, aura: '#ffcf5a' }),
      { ...mv(g('sekhmet', 3, -2, { anim: 'bow', emote: 'angry', aura: '#ff3a2a' }), 2, 1), exit: 0.72 },
      g('hathor', 2, 1, { enter: 0.72, aura: '#ffb0d0', emote: 'joy' }),
    ],
    props: [p('jars', 2, 0, -2, { a: 0, a2: 1, t0: 0.05, t1: 0.5 })],
    fx: [fx('mist', { color: '#d94a3a', at: [2, 0.6, -2], area: [12, 1, 12] }), fx('motes', { color: '#ff9a7a', n: 80, area: [14, 4, 10] })],
    hits: [[0.15, 'splash'], [0.72, 'shimmer']],
  },
  {
    id: 'c2-9', env: 'heavens', variant: 'dusk', music: 'solar', amb: ['wind', 'cosmic'],
    focus: [0, 5, 0], cam: [cam('pull', 14, 4, { az: 0.3 }), cam('rise', 28, 6, { w: 1.3 })],
    cast: [
      { ...g('ra', 0, 0, { y: 5.6, s: 0.8, anim: 'raise', aura: '#ffcf5a' }), to: [0, 8.1, 0] as [number, number, number] },
      g('thoth', -9, 3, { y: 0, face: 0.6, aura: '#cfe8ff' }),
    ],
    props: [pmv(p('cow', 0, 0, 0, { s: 1 }), 0, 2.5, 0), p('moon', -12, 14, -24, { s: 4 })],
    fx: [fx('stars', { n: 600 }), fx('rays', { at: [0, 8, 0], color: '#ffcf70' }), fx('motes', { color: '#cfd8ff', n: 120, area: [18, 10, 8] })],
    hits: [[0.2, 'wing'], [0.55, 'bell']],
  },
];
