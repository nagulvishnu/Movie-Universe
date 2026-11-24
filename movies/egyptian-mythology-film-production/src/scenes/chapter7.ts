import type { SceneDef } from '../film/types';
import { cam, fx, g, mv, p, pmv } from './helpers';

// Chapter 7 — The Kingdom of the Dead.
export const chapter7Scenes: SceneDef[] = [
  {
    id: 'c7-1', env: 'nile', variant: 'dusk', music: 'duat', amb: ['nile', 'wind'],
    card: { kicker: 'Chapter VII', title: 'The Kingdom of the Dead' },
    focus: [0, 2, 0], cam: [cam('orbit', 15, 3, { spin: 0.8 }), cam('push', 11, 2.6, { w: 1 })],
    cast: [g('anubis', 3, 1, { aura: '#5a5aa0', face: -0.5 }), g('isis', -3.4, 1.2, { anim: 'mourn', aura: '#ffb347', face: 0.5 }), g('nephthys', -5.6, 0, { anim: 'mourn', aura: '#8fb8ff', face: 0.6 })],
    props: [p('bier', 0, 0, 0, { s: 1 })],
    fx: [fx('motes', { color: '#ffd27a', n: 90, area: [4, 8, 3], at: [0, 2, 0], speed: 0.8 }), fx('motes', { color: '#ffb066', n: 70, area: [14, 5, 10] })],
    hits: [[0.4, 'shimmer']],
  },
  {
    id: 'c7-2', env: 'temple', variant: 'embalm', music: 'duat', amb: ['temple', 'fire'],
    focus: [0, 1.6, 0], cam: [cam('orbit', 11, 3.6, { spin: -1.1 }), cam('push', 8, 2.6, { w: 0.9 })],
    cast: [g('anubis', 0, 2.4, { anim: 'cast', face: Math.PI, aura: '#5a5aa0' }), g('deceased', -4, -2, { anim: 'pray', face: 0.8 }), g('deceased', 4, -2, { anim: 'pray', face: -0.8 })],
    props: [p('bier', 0, 0, 0, { s: 1 }), p('canopic', -5.4, 0, 1.4), p('canopic', -4.6, 0, 1.4), p('canopic', 4.6, 0, 1.4), p('canopic', 5.4, 0, 1.4)],
    fx: [fx('motes', { color: '#ffcf5a', n: 70, area: [10, 5, 8] })],
    hits: [[0.5, 'chant']],
  },
  {
    id: 'c7-3', env: 'temple', variant: 'memphis', music: 'pantheon', amb: ['temple'],
    focus: [0, 2, 0], cam: [cam('pan', 12, 2.8, { pan: 10, az: 0.2 }), cam('push', 9, 2.5, { w: 0.8 })],
    cast: [g('thoth', 0, 0, { anim: 'present', aura: '#cfe8ff' })],
    props: [p('stela', -5, 0, -2, { s: 1.4, ry: 0.5 }), p('stela', 5, 0, -2, { s: 1.4, ry: -0.5 })],
    fx: [fx('motes', { color: '#ffcf6a', n: 110, area: [12, 6, 8] })],
  },
  {
    id: 'c7-4', env: 'duat', variant: 'path', music: 'duat', amb: ['underworld'],
    focus: [0, 2, -6], cam: [cam('track', 12, 3, { pan: -10, az: 0.25 })],
    cast: [mv(g('anubis', 0, -2, { anim: 'walk', face: 0, aura: '#5a5aa0' }), 0, -16), mv(g('deceased', 0, 3, { anim: 'walk', face: 0 }), 0, -12)],
    props: [p('gate', 0, 0, -6, { s: 1 }), p('gate', 0, 0, -18, { s: 1 }), p('gate', 0, 0, -30, { s: 1 })],
    fx: [fx('embers', { color: '#ff5a2a', n: 100, area: [16, 6, 30], at: [0, 0, -12] })],
    hits: [[0.2, 'door'], [0.55, 'door']],
  },
  {
    id: 'c7-5', env: 'judgement', variant: 'gold', music: 'judgement', amb: ['temple', 'cosmic'],
    focus: [0, 3, -4], cam: [cam('push', 20, 4, { az: 0 }), cam('rise', 12, 3.4, { w: 0.9 })],
    cast: [g('deceased', 0, 5, { anim: 'raise', face: Math.PI }), g('osiris', 0, -20, { y: 0.8, anim: 'sit', s: 1.6, aura: '#3fbf6f' })],
    fx: [fx('rays', { at: [0, 18, -4], color: '#ffe3a0' }), fx('motes', { color: '#ffd27a', n: 160, area: [18, 10, 20] })],
    hits: [[0.2, 'gong'], [0.5, 'chant']],
  },
  {
    id: 'c7-6', env: 'judgement', variant: 'gold', music: 'judgement', amb: ['temple', 'cosmic'],
    focus: [0, 3, 0], cam: [cam('orbit', 15, 4, { spin: -0.9 }), cam('push', 10, 3, { w: 1 })],
    cast: [
      g('anubis', -3.2, 1, { anim: 'present', face: 0.5, aura: '#5a5aa0' }), g('thoth', 4, 0.8, { anim: 'present', face: -0.6, aura: '#cfe8ff' }),
      g('maat', 0, -4, { aura: '#ffffff' }), g('osiris', 0, -20, { y: 0.8, anim: 'sit', s: 1.6, aura: '#3fbf6f' }),
    ],
    props: [p('scale', 0, 0, 0, { a: 0.35, a2: 0, t0: 0.15, t1: 0.7 }), p('ammit', -6.2, 0, 4, { s: 0.9, a: 0, color: '#7a3a2a', ry: 2.14 })],
    fx: [fx('motes', { color: '#ffd27a', n: 120, area: [14, 8, 14] })],
    hits: [[0.2, 'bell'], [0.7, 'gong']],
  },
  {
    id: 'c7-7', env: 'fields', variant: 'day', music: 'dawn', amb: ['wind', 'nile'],
    focus: [0, 2, -2], cam: [cam('pan', 16, 3, { pan: 8, az: 0.3 }), cam('rise', 14, 5, { w: 0.9 })],
    cast: [mv(g('horus', -2.4, 4, { anim: 'walk', aura: '#ffd27a', face: 0 }), -2.4, -6), mv(g('deceased', 1, 5.4, { anim: 'walk', face: 0 }), 1, -5)],
    fx: [fx('motes', { color: '#f2e08a', n: 140, area: [20, 5, 14] })],
    hits: [[0.3, 'shimmer']],
  },
  {
    id: 'c7-7b', env: 'judgement', variant: 'dark', music: 'war', amb: ['underworld', 'temple'],
    focus: [0, 2, 0], cam: [cam('low', 12, 1, { az: 0.3 }), cam('push', 8, 2.4, { w: 1 })],
    cast: [g('anubis', -3.4, 1, { anim: 'point', aura: '#5a5aa0', face: 0.5 }), g('thoth', 4, -1, { face: -0.6, aura: '#cfe8ff' })],
    props: [p('scale', 0, 0, 0, { a: 0.5 }), pmv(p('ammit', -7, 0, 4.5, { s: 1.1, a: 0, a2: 1, t0: 0.4, t1: 0.7, color: '#7a3a2a', ry: 2.1 }), -3, 0, 1.8)],
    fx: [fx('embers', { color: '#ff3a2a', n: 100, area: [12, 6, 10] })],
    hits: [[0.2, 'roar'], [0.6, 'impact'], [0.65, 'roar']], flash: [0.62],
  },
  {
    id: 'c7-8', env: 'fields', variant: 'dusk', music: 'finale', amb: ['wind', 'nile'],
    focus: [0, 1.6, 0], cam: [cam('pull', 10, 2.6, { az: 0.35 }), cam('orbit', 14, 3, { spin: 0.7, w: 0.9 })],
    cast: [g('deceased', -3, 0, { anim: 'idle', face: 0.5 }), g('deceased', 0, 1.5, { anim: 'bow', face: 0 }), g('deceased', 3.2, 0, { anim: 'bow', face: -0.4 })],
    props: [p('sun', 0, 5, -34, { s: 5 })],
    fx: [fx('motes', { color: '#f2c86a', n: 120, area: [20, 5, 12] })],
  },
];
