import type { SceneDef } from '../film/types';
import { arc, cam, fx, g, mv, p, pmv } from './helpers';

const OG = {
  nun: '#2f6f9f', hh: '#c9a24a', kk: '#4b3a7a', am: '#bcd0e6',
};

// Opening titles and Prologue — Before the World Existed.
export const prologueScenes: SceneDef[] = [
  {
    id: 'ti-1', env: 'void', music: 'title', amb: ['wind', 'cosmic'], title: true, lead: 9, tail: 5,
    focus: [0, 3, 0], cam: [cam('push', 34, 4, { fov: 40 })],
    props: [p('wingdisk', 0, 4.5, 0, { s: 1.6, enter: 0.12 })],
    fx: [fx('motes', { color: '#ffd27a', n: 260, area: [16, 9, 6], size: 0.06 }), fx('stars', { n: 500 })],
    hits: [[0.12, 'gong'], [0.35, 'shimmer']],
  },
  {
    id: 'pr-1', env: 'void', music: 'dark', amb: ['wind'], lead: 3, tail: 2,
    card: { kicker: 'Prologue', title: 'Before the World Existed' },
    focus: [0, 2, 0], cam: [cam('still', 20, 2)],
    fx: [fx('motes', { color: '#223344', n: 40, area: [10, 6, 10], size: 0.04 })],
    hits: [[0.92, 'boom']],
  },
  {
    id: 'pr-2', env: 'nun', variant: 'dark', music: 'nun', amb: ['water', 'cosmic'],
    focus: [0, 3, -6], cam: [cam('push', 30, 5, { az: 0.2 }), cam('orbit', 20, 4, { spin: 0.4, w: 1.4 })],
    fx: [fx('motes', { color: '#4fc3d9', n: 220, area: [28, 10, 28], size: 0.07, speed: 0.4 }), fx('rings', { at: [0, 0.1, -6], color: '#2c7a99' })],
  },
  {
    id: 'pr-3', env: 'nun', variant: 'glow', music: 'nun', amb: ['water', 'cosmic'],
    focus: [0, 4, -10], cam: [cam('pan', 24, 5, { pan: 18, az: 0 })],
    fx: [
      fx('beam', { at: [-14, 0, -14], to: [-14, 18, -14], color: '#ffcf6a' }),
      fx('beam', { at: [0, 0, -18], to: [0, 20, -18], color: '#59d4ee' }),
      fx('beam', { at: [14, 0, -14], to: [14, 18, -14], color: '#e8e8ff' }),
      fx('motes', { color: '#8fe3f5', n: 160, area: [30, 10, 20], size: 0.07 }),
    ],
    hits: [[0.45, 'shimmer'], [0.75, 'shimmer']],
  },
  {
    id: 'pr-4', env: 'mound', variant: 'dawn', music: 'creation', amb: ['water', 'cosmic'],
    focus: [0, 3, 0], cam: [cam('push', 17, 3.5, { az: 0.5 }), cam('orbit', 12, 3, { spin: -0.7, w: 1.2 })],
    cast: [
      g('atum', 0, 0, { y: 1.2, anim: 'raise', aura: '#ffd27a' }),
      g('shu', -2.8, 1.6, { y: 1.2, anim: 'float', enter: 0.62, aura: '#cfe9ff', face: 0.5 }),
      g('tefnut', 2.8, 1.6, { y: 1.2, anim: 'float', enter: 0.62, aura: '#7fd0ff', face: -0.5 }),
    ],
    props: [p('benben', -3.4, 1.2, -2, { s: 1 })],
    fx: [fx('motes', { color: '#ffd27a', n: 160, area: [12, 8, 12] }), fx('burst', { at: [0, 3, 1.5], color: '#ffe9a8', enter: 0.6, exit: 0.8 })],
    hits: [[0.05, 'shimmer'], [0.6, 'transform']],
  },
  {
    id: 'pr-5', env: 'lotus', variant: 'dark', music: 'creation', amb: ['water', 'cosmic'],
    focus: [0, 2.5, 0], cam: [cam('orbit', 18, 4, { spin: 1.4 }), cam('push', 14, 3, { w: 0.8 })],
    cast: [
      ...[0, 1, 2, 3].flatMap((i) => {
        const a = (i / 4) * Math.PI - Math.PI * 0.5;
        const tints = [OG.nun, OG.hh, OG.kk, OG.am];
        const m = arc(['frogGod'], 6.2, a - 0.2, a - 0.2, 'raise', { tint: tints[i], y: 0 });
        const f = arc(['snakeGoddess'], 6.2, a + 0.2, a + 0.2, 'raise', { tint: tints[i], y: 0 });
        return [...m, ...f];
      }),
    ],
    fx: [fx('motes', { color: '#7fe0ff', n: 120, area: [12, 7, 12] }), fx('beam', { at: [0, 0, 0], to: [0, 14, 0], color: '#6fe0ff' })],
    hits: [[0.2, 'chant'], [0.8, 'shimmer']],
  },
  {
    id: 'pr-6', env: 'lotus', variant: 'sunrise', music: 'creation', amb: ['water', 'cosmic'],
    focus: [0, 3, 0], cam: [cam('rise', 16, 6, { az: 0.2 })],
    props: [p('sun', 0, 1.2, 0, { s: 1.1, a: 0, a2: 1, t0: 0.15, t1: 0.7 })],
    fx: [fx('rays', { at: [0, 2, 0], color: '#ffd98a', enter: 0.3 }), fx('motes', { color: '#ffe9a8', n: 200, area: [14, 9, 14] })],
    hits: [[0.3, 'solar']], flash: [0.55],
  },
  {
    id: 'pr-7', env: 'temple', variant: 'memphis', music: 'creation', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('push', 14, 3, { az: 0.35 })],
    cast: [g('ptah', 0, 0, { anim: 'idle', aura: '#d9a441' })],
    props: [p('stela', 5, 0, -2, { s: 1.4, ry: -0.6 }), p('heart', -3, 3.2, 1, { s: 1.2 })],
    fx: [fx('motes', { color: '#ffcf6a', n: 140, area: [10, 6, 8] }), fx('beam', { at: [-3, 3.2, 1], to: [0, 2.2, 0], color: '#ff6a5a', enter: 0.4 })],
    hits: [[0.5, 'chant']],
  },
  {
    id: 'pr-8', env: 'mound', variant: 'sunrise', music: 'dawn', amb: ['water', 'wind'],
    focus: [0, 3, 0], cam: [cam('pull', 14, 3.5, { az: 0.1 })],
    cast: [g('atum', -3.4, 0, { y: 1.2, face: 0.4, aura: '#ffd27a' }), g('ptah', 3.4, 0, { y: 1.2, face: -0.4, aura: '#d9a441' }),
      mv(g('frogGod', 0, -3, { y: 1.2, tint: OG.nun, anim: 'raise' }), 0, -3)],
    props: [pmv(p('sun', 0, 6, -34, { s: 4 }), 0, 12, -34)],
    fx: [fx('motes', { color: '#ffe0a0', n: 220, area: [16, 9, 12] })],
  },
];
