import type { CamSpec, SceneDef, V3 } from '../film/types';

// Camera direction: auto-framed shots around a focus point. Each scene lists one or more shots (cuts) with relative weights.
export interface CamResult { pos: V3; look: V3; fov: number }
const ease = (u: number) => u * u * (3 - 2 * u);

export function evalCamera(def: SceneDef, progress: number, time: number): CamResult {
  const specs = def.cam.length ? def.cam : [{ k: 'still' as const }];
  const total = specs.reduce((a, s) => a + (s.w ?? 1), 0);
  let acc = 0, spec: CamSpec = specs[0] as CamSpec, u = 0;
  for (const s of specs) {
    const w = (s.w ?? 1) / total;
    if (progress <= acc + w + 1e-6) { spec = s as CamSpec; u = Math.min(1, Math.max(0, (progress - acc) / w)); break; }
    acc += w;
    spec = s as CamSpec; u = 1;
  }
  const e = ease(u);
  const f: V3 = [...(spec.focus ?? def.focus ?? [0, 1.6, 0])] as V3;
  const d = spec.d ?? 12, h = spec.h ?? 3;
  let dist = d, hh = h, az = spec.az ?? 0.4;
  const look: V3 = [...f] as V3;
  switch (spec.k) {
    case 'push': dist = d * (1 - 0.38 * e); break;
    case 'pull': dist = d * (0.62 + 0.45 * e); break;
    case 'orbit': az += (spec.spin ?? 1) * u; break;
    case 'rise': hh = h * (0.12 + 0.88 * e); look[1] += e * 1.2; break;
    case 'fall': hh = h * (1 - 0.8 * e); break;
    case 'low': hh = h * (1 - 0.1 * e); dist = d * (1 - 0.18 * e); look[1] += 0.6; break;
    case 'pan': { const s = (e - 0.5) * (spec.pan ?? 10); look[0] += s; break; }
    case 'track': { const s = (e - 0.5) * (spec.pan ?? 10); f[0] += s; look[0] += s; break; }
    default: break;
  }
  const pos: V3 = [f[0] + Math.sin(az) * dist + Math.sin(time * 0.7) * 0.05, Math.max(0.35, f[1] + hh) + Math.sin(time * 0.9 + 1) * 0.04, f[2] + Math.cos(az) * dist + Math.cos(time * 0.6) * 0.05];
  return { pos, look, fov: spec.fov ?? 42 };
}
