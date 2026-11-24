import type { ActorDef, Anim, Key, Line, Look } from './types';
import { K, Ka } from './types';

/** keys that make `me` glance at whoever is speaking */
export const lookKeys = (me: string, anim: Anim, lines: Line[], self: Look = null, delay = 0.25): Key[] =>
  lines.map((l) => Ka(l.t + delay, anim, { l: l.who === me ? self : l.who ? l.who : null }));

type Cast = 'adam' | 'lena' | 'noah' | 'emily';
const SEATS: Record<Cast, { p: [number, number]; a: Anim }> = {
  adam: { p: [0.45, 0.3], a: 'drive' }, lena: { p: [-0.45, 0.3], a: 'sit' }, noah: { p: [0.45, -0.75], a: 'sit' }, emily: { p: [-0.45, -0.75], a: 'sit' },
};
/** a character riding inside the car actor */
export const rider = (who: Cast, keys: Key[] = [], t0 = 0): ActorDef => ({
  char: who, rideOn: 'car',
  keys: [K(t0, SEATS[who].p[0], SEATS[who].p[1], 0, SEATS[who].a, { y: 0.12 }), ...keys],
});
export const seatAnim = (who: Cast) => SEATS[who].a;

/** simple world-space tidbits */
export const carActor = (keys: Key[]): ActorDef => ({ char: 'car', keys });

export const sleepAt = (x: number, z: number, y = 0.5): Key => K(0, x, z, 0, 'sleep', { y, e: 'sleep' });
