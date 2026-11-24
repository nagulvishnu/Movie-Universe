import type { CastDef, GodId, SceneDef } from '../film/types';
import { arc, cam, fx, g, mv, p, pmv } from './helpers';

// Chapter 3 — The Great Pantheon.
const AUR: Partial<Record<GodId, string>> = {
  thoth: '#cfe8ff', maat: '#ffffff', seshat: '#ffe08a', hathor: '#ffb0d0', sekhmet: '#ff4a3a', bastet: '#ffd27a', ptah: '#d9a441',
  nefertum: '#6fa8ff', amun: '#4a8fff', mut: '#ffd27a', khonsu: '#e8e6ff', khnum: '#7fd0a0', sobek: '#4fbf8f', neith: '#ff6a5a',
  min: '#e8f5a0', taweret: '#9fd0ff', bes: '#ffb347', serqet: '#ffcf5a', renenutet: '#8fe05a', wepwawet: '#cfd8e8', sokar: '#d9a441',
  isis: '#ffb347', nephthys: '#8fb8ff',
};
const star = (id: GodId, x = 0, z = 0, o: Partial<CastDef> = {}): CastDef => g(id, x, z, { aura: AUR[id], ...o });

export const chapter3Scenes: SceneDef[] = [
  {
    id: 'c3-1', env: 'temple', variant: 'sanctum', music: 'pantheon', amb: ['temple'],
    card: { kicker: 'Chapter III', title: 'The Great Pantheon' },
    focus: [0, 2, 0], cam: [cam('push', 18, 3, { az: 0.15 }), cam('pull', 12, 3, { w: 0.6 })],
    cast: (['thoth', 'maat', 'hathor', 'bastet', 'ptah', 'amun', 'mut', 'khonsu', 'sobek', 'isis'] as GodId[]).map((id, i) =>
      mv(star(id, (i - 4.5) * 2.2, -18, { anim: 'walk' }), (i - 4.5) * 2.2, 4)),
    fx: [fx('motes', { color: '#ffd27a', n: 110, area: [20, 8, 18] })],
    hits: [[0.1, 'door'], [0.5, 'step']],
  },
  {
    id: 'c3-2', env: 'temple', variant: 'moon', music: 'pantheon', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('orbit', 11, 2.8, { spin: 0.9 }), cam('push', 8, 2.4, { w: 0.8 })],
    cast: [star('thoth', 0, 0, { anim: 'present' })],
    props: [p('moon', 0, 9, -9, { s: 2.2 }), p('stela', -4.5, 0, -2, { s: 1.1, ry: 0.5 })],
    fx: [fx('motes', { color: '#cfe8ff', n: 100, area: [10, 6, 8] })],
    hits: [[0.4, 'bell']],
  },
  {
    id: 'c3-3', env: 'heavens', variant: 'dawn', music: 'divine', amb: ['cosmic', 'wind'],
    focus: [0, 2.2, 0], cam: [cam('push', 13, 2.6, { az: 0.3 }), cam('orbit', 9, 2.8, { spin: -0.8, w: 1 })],
    cast: [star('maat', 0, 0, { anim: 'raise' })],
    props: [p('feather', 3.2, 3.2, 0.6, { s: 1.4 })],
    fx: [fx('motes', { color: '#ffffff', n: 110, area: [10, 6, 8] })],
    hits: [[0.3, 'wing'], [0.6, 'shimmer']],
  },
  {
    id: 'c3-4', env: 'temple', variant: 'hall', music: 'pantheon', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('orbit', 11, 2.6, { spin: -1 }), cam('push', 8, 2.4, { w: 0.8 })],
    cast: [star('seshat', -1.4, 0, { anim: 'present', face: 0.3 }), star('thoth', 2.6, -1, { face: -0.4 })],
    props: [p('tree', 6, 0, -3, { s: 1.1 }), p('stela', -5, 0, -3, { s: 1, ry: 0.4 })],
    fx: [fx('motes', { color: '#ffe08a', n: 80, area: [10, 6, 8] })],
  },
  {
    id: 'c3-5', env: 'temple', variant: 'sanctum', music: 'pantheon', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('push', 12, 2.8, { az: 0.35 }), cam('orbit', 8, 2.5, { spin: 0.8, w: 1 })],
    cast: [star('hathor', 0, 0, { anim: 'present', emote: 'joy' })],
    props: [p('cow', 5, 0, -1, { s: 0.3, ry: -0.8 })],
    fx: [fx('motes', { color: '#ffd27a', n: 110, area: [10, 6, 8] })],
    hits: [[0.5, 'bell']],
  },
  {
    id: 'c3-6', env: 'temple', variant: 'fire', music: 'war', amb: ['temple', 'fire'],
    focus: [0, 2, 0], cam: [cam('low', 12, 0.8, { az: 0.2 }), cam('orbit', 9, 2.4, { spin: 0.9, w: 1 })],
    cast: [star('sekhmet', 0, 0, { emote: 'stern', anim: 'idle' })],
    fx: [fx('embers', { color: '#ff6a3a', n: 120, area: [10, 7, 8] })],
    hits: [[0.3, 'roar']],
  },
  {
    id: 'c3-7', env: 'nile', variant: 'day', music: 'pantheon', amb: ['nile'],
    focus: [0, 2, 0], cam: [cam('orbit', 12, 2.8, { spin: -0.8 }), cam('push', 9, 2.5, { w: 0.8 })],
    cast: [star('bastet', 0, 0, { anim: 'idle', emote: 'calm' })],
    props: [pmv(p('boat', -10, 0, -7, { s: 1 }), 10, 0, -7)],
    fx: [fx('motes', { color: '#ffe9a8', n: 70, area: [14, 5, 10] })],
  },
  {
    id: 'c3-8', env: 'temple', variant: 'memphis', music: 'pantheon', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('push', 13, 2.8, { az: 0.4 }), cam('orbit', 9, 2.5, { spin: 0.8, w: 1 })],
    cast: [star('ptah', 0, 0, { anim: 'idle' })],
    props: [p('djed', 4, 0, 0, { s: 1 }), p('obelisk', -6, 0, -4, { s: 0.7 })],
    fx: [fx('motes', { color: '#ffcf6a', n: 90, area: [10, 6, 8] })],
  },
  {
    id: 'c3-9', env: 'temple', variant: 'memphis', music: 'pantheon', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('push', 14, 2.8, { az: 0.2 }), cam('orbit', 11, 3, { spin: 0.7, w: 1 })],
    cast: [star('ptah', -3.4, 0, { face: 0.3 }), star('sekhmet', 0, 0.6), star('nefertum', 3.4, 0, { face: -0.3 })],
    props: [p('lotus', 6.5, 0, -2, { s: 0.7, a: 1 })],
    fx: [fx('motes', { color: '#7fb8ff', n: 80, area: [12, 6, 8] })],
  },
  {
    id: 'c3-10', env: 'heliopolis', variant: 'day', music: 'thebes', amb: ['wind', 'temple'],
    focus: [0, 2, 0], cam: [cam('push', 14, 2.6, { az: 0.35 }), cam('orbit', 9, 2.4, { spin: -0.9, w: 1 })],
    cast: [star('amun', 0, 0, { anim: 'present' })],
    props: [p('obelisk', -7, 0, -6, { s: 1.6 }), p('obelisk', 7, 0, -6, { s: 1.6 })],
    fx: [fx('motes', { color: '#7fb0ff', n: 80, area: [12, 6, 8] })],
    hits: [[0.2, 'shimmer']],
  },
  {
    id: 'c3-11', env: 'temple', variant: 'hall', music: 'thebes', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('orbit', 11, 2.8, { spin: 0.9 }), cam('push', 8, 2.4, { w: 0.9 })],
    cast: [star('mut', 0, 0, { anim: 'present' }), star('amun', -5, -2, { face: 0.7 })],
    fx: [fx('motes', { color: '#ffd27a', n: 80, area: [10, 6, 8] })],
  },
  {
    id: 'c3-12', env: 'temple', variant: 'moon', music: 'thebes', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('push', 15, 2.8, { az: 0.2 }), cam('orbit', 11, 3, { spin: -0.7, w: 1 })],
    cast: [star('amun', -3.6, 0, { face: 0.3 }), star('mut', 0, 0), star('khonsu', 3.6, 0, { face: -0.3, anim: 'idle' })],
    props: [p('moon', 4, 9, -9, { s: 1.8 })],
    fx: [fx('motes', { color: '#e8e6ff', n: 80, area: [12, 6, 8] })],
  },
  {
    id: 'c3-13', env: 'nile', variant: 'dawn', music: 'pantheon', amb: ['nile'],
    focus: [0, 1.8, 0], cam: [cam('push', 13, 2.8, { az: 0.5 }), cam('orbit', 9, 2.4, { spin: -0.8, w: 1 })],
    cast: [star('khnum', -1.4, 0, { anim: 'cast', face: 0.5 })],
    props: [p('wheel', 1.6, 0, 0.4, { s: 1.1 })],
    fx: [fx('motes', { color: '#d9b57a', n: 80, area: [10, 5, 8] })],
    hits: [[0.4, 'shimmer']],
  },
  {
    id: 'c3-14', env: 'nile', variant: 'dusk', music: 'pantheon', amb: ['nile'],
    focus: [0, 2, 0], cam: [cam('low', 13, 0.9, { az: 0.35 }), cam('orbit', 9, 2.6, { spin: 0.8, w: 1 })],
    cast: [star('sobek', 0, 0, { anim: 'idle', emote: 'stern' })],
    fx: [fx('motes', { color: '#ffb066', n: 70, area: [12, 5, 8] })],
    hits: [[0.5, 'splash']],
  },
  {
    id: 'c3-15', env: 'heliopolis', variant: 'dusk', music: 'pantheon', amb: ['wind'],
    focus: [0, 2, 0], cam: [cam('orbit', 11, 2.6, { spin: 0.9 }), cam('push', 8, 2.4, { w: 0.9 })],
    cast: [star('neith', 0, 0, { anim: 'idle', emote: 'stern' })],
    props: [p('obelisk', 6, 0, -5, { s: 1.2 })],
    fx: [fx('motes', { color: '#ff9a7a', n: 70, area: [12, 5, 8] })],
  },
  {
    id: 'c3-16', env: 'fields', variant: 'day', music: 'pantheon', amb: ['wind', 'nile'],
    focus: [0, 2, 0], cam: [cam('push', 13, 2.6, { az: 0.4 }), cam('orbit', 9, 2.6, { spin: -0.8, w: 1 })],
    cast: [star('min', 0, 0, { anim: 'idle' })],
    fx: [fx('motes', { color: '#f2e08a', n: 90, area: [14, 4, 10] })],
  },
  {
    id: 'c3-17', env: 'temple', variant: 'hall', music: 'pantheon', amb: ['temple'],
    focus: [0, 1.8, 0], cam: [cam('orbit', 11, 2.4, { spin: 1 }), cam('push', 8, 2, { w: 0.8 })],
    cast: [star('taweret', 0, 0, { anim: 'idle' })],
    fx: [fx('motes', { color: '#9fd0ff', n: 80, area: [10, 5, 8] })],
  },
  {
    id: 'c3-18', env: 'temple', variant: 'hall', music: 'pantheon', amb: ['temple'],
    focus: [0, 1.6, 0], cam: [cam('orbit', 9, 2, { spin: -1 }), cam('push', 7, 1.8, { w: 0.8 })],
    cast: [star('bes', 0, 0, { anim: 'cheer', emote: 'joy', s: 1.1 }), star('taweret', -4.5, -2, { face: 0.6 })],
    fx: [fx('motes', { color: '#ffb347', n: 90, area: [10, 5, 8] })],
    hits: [[0.3, 'bell']],
  },
  {
    id: 'c3-19', env: 'temple', variant: 'embalm', music: 'pantheon', amb: ['temple'],
    focus: [0, 1.8, 0], cam: [cam('orbit', 12, 3, { spin: 1.1 }), cam('push', 9, 2.6, { w: 0.8 })],
    cast: [
      star('isis', -3.2, -3.2, { anim: 'raise', face: 0.8 }), star('nephthys', 3.2, -3.2, { anim: 'raise', face: -0.8 }),
      star('neith', -3.2, 3.2, { anim: 'raise', face: 2.4 }), star('serqet', 3.2, 3.2, { anim: 'raise', face: -2.4 }),
    ],
    props: [p('shrine', 0, 0, 0, { s: 0.8 }), p('canopic', -1.4, 0, 1.2), p('canopic', -0.5, 0, 1.2), p('canopic', 0.5, 0, 1.2), p('canopic', 1.4, 0, 1.2)],
    fx: [fx('motes', { color: '#ffcf5a', n: 80, area: [10, 5, 8] })],
  },
  {
    id: 'c3-20', env: 'fields', variant: 'dusk', music: 'pantheon', amb: ['wind', 'nile'],
    focus: [0, 2, 0], cam: [cam('orbit', 11, 2.6, { spin: 0.9 }), cam('push', 8, 2.4, { w: 0.9 })],
    cast: [star('renenutet', 0, 0, { anim: 'present' })],
    fx: [fx('motes', { color: '#f2c86a', n: 90, area: [14, 4, 10] })],
  },
  {
    id: 'c3-21', env: 'nile', variant: 'night', music: 'duat', amb: ['night', 'nile'],
    focus: [0, 2, 0], cam: [cam('orbit', 14, 3, { spin: 0.9 }), cam('push', 10, 2.6, { w: 0.9 })],
    cast: [star('wepwawet', -3.4, 0, { anim: 'walk', face: 0.6 }), star('sokar', 3.4, 0, { face: -0.6 })],
    props: [pmv(p('boat', -8, 0, -6, { s: 0.9 }), 8, 0, -6)],
    fx: [fx('stars', { n: 600 }), fx('motes', { color: '#cfd8e8', n: 60, area: [12, 5, 8] })],
  },
  {
    id: 'c3-22', env: 'heliopolis', variant: 'dusk', music: 'pantheon', amb: ['wind'],
    focus: [0, 2, 0], cam: [cam('orbit', 24, 5, { spin: 1.4 }), cam('rise', 22, 9, { w: 0.8 })],
    cast: [
      ...arc(['thoth', 'maat', 'hathor', 'sekhmet', 'bastet', 'ptah', 'amun', 'mut'] as GodId[], 8, -1.2, 1.2, 'idle', {}, 0),
      ...arc(['khonsu', 'khnum', 'sobek', 'neith', 'min', 'taweret', 'bes', 'seshat', 'serqet', 'renenutet'] as GodId[], 12, -1.3, 1.3, 'idle', {}, 0),
    ].map((c) => ({ ...c, aura: AUR[c.id] })),
    props: [p('sun', 0, 9, -40, { s: 6 })],
    fx: [fx('motes', { color: '#ffcf8a', n: 140, area: [24, 8, 16] })],
    hits: [[0.2, 'shimmer']],
  },
];

