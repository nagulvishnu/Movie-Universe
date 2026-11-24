import type { Anim, CamSpec, CastDef, FxDef, GodId, PropDef, PropKind, FxKind, V3 } from '../film/types';

type GOpts = Partial<Omit<CastDef, 'id' | 'at'>> & { y?: number };

/** Place a character on the ground at (x,z). */
export const g = (id: GodId, x = 0, z = 0, o: GOpts = {}): CastDef => {
  const { y = 0, ...rest } = o;
  return { ...rest, id, at: [x, y, z] };
};

/** Make a character travel to (x,z) during the scene. */
export const mv = (c: CastDef, x: number, z: number, y?: number): CastDef => ({ ...c, to: [x, y ?? c.at[1], z] });

export const p = (kind: PropKind, x = 0, y = 0, z = 0, o: Partial<Omit<PropDef, 'kind' | 'at'>> = {}): PropDef => ({ ...o, kind, at: [x, y, z] });
export const pmv = (d: PropDef, x: number, y: number, z: number): PropDef => ({ ...d, to: [x, y, z] });

export const fx = (k: FxKind, o: Omit<FxDef, 'k'> = {}): FxDef => ({ ...o, k });

export const cam = (k: CamSpec['k'], d: number, h: number, o: Partial<CamSpec> = {}): CamSpec => ({ ...o, k, d, h });

/** A row of characters facing the camera. */
export const row = (ids: GodId[], gap = 2.4, z = 0, anim?: Anim, o: GOpts = {}): CastDef[] =>
  ids.map((id, i) => g(id, (i - (ids.length - 1) / 2) * gap, z, { anim, ...o }));

/** Characters on an arc, facing the centre. Angles in radians (0 = towards camera). */
export const arc = (ids: GodId[], radius: number, a0: number, a1: number, anim?: Anim, o: GOpts = {}, cz = 0): CastDef[] =>
  ids.map((id, i) => {
    const a = ids.length === 1 ? (a0 + a1) / 2 : a0 + ((a1 - a0) * i) / (ids.length - 1);
    return g(id, Math.sin(a) * radius, cz + Math.cos(a) * radius, { anim, face: a + Math.PI, ...o });
  });

export const V = (x: number, y: number, z: number): V3 => [x, y, z];
