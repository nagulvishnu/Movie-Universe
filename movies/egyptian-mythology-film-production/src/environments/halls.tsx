import { useMemo } from 'react';
import { mat, P } from '../render/prim';
import { PropView } from '../render/Props';
import { hieroglyphTexture } from '../render/textures';
import { Atmos, Column, Flat, Glint, Lights, Sky, TIME, TorchLight, type Palette } from './common';
import type { EnvProps } from './types';

// Interior environments: temples, the palace and the Hall of Two Truths.
const mk = (fog: string, hemiSky: string, hemiGround: string, hemiI: number, key: string, keyI: number): Palette => ({ top: '#000', mid: fog, bottom: '#000', sun: '#000', sunDir: [0, 1, 0], sunI: 0, fog, fogNear: 14, fogFar: 85, hemiSky, hemiGround, hemiI, key, keyI });
const HALL: Record<string, { pal: Palette; torch: string; shaft: string; floor: string }> = {
  hall: { pal: mk('#150d07', '#d8b080', '#3a2a18', 1.0, '#ffd09a', 2.2), torch: '#ff9a40', shaft: '#ffe2a0', floor: '#8a7656' },
  sanctum: { pal: mk('#241808', '#ffe0a0', '#5a4220', 1.3, '#fff0c0', 2.8), torch: '#ffc060', shaft: '#fff0b0', floor: '#a88c5a' },
  fire: { pal: mk('#200806', '#d88060', '#401810', 0.9, '#ff9060', 2.2), torch: '#ff4a20', shaft: '#ff8a50', floor: '#7a5a46' },
  embalm: { pal: mk('#08121a', '#70a8b8', '#1a2a30', 0.8, '#a8d8e8', 1.7), torch: '#ffb060', shaft: '#9ad0e0', floor: '#6a6a60' },
  memphis: { pal: mk('#0a0806', '#c8a050', '#2a2010', 0.7, '#ffd890', 1.8), torch: '#ffc050', shaft: '#ffd070', floor: '#4a4234' },
  moon: { pal: mk('#080e1e', '#7a98e0', '#1a2038', 1.0, '#b8c8ff', 1.8), torch: '#9ab0ff', shaft: '#b8c8ff', floor: '#6a6a78' },
  glow: { pal: mk('#10100a', '#fff0c0', '#4a4020', 1.4, '#fff4d0', 2.6), torch: '#ffe090', shaft: '#fff4c0', floor: '#9a8a62' },
};

function Shaft({ p, c, o = 0.07 }: { p: [number, number, number]; c: string; o?: number }) {
  return <mesh position={p}><cylinderGeometry args={[0.6, 4, 26, 18, 1, true]} /><meshBasicMaterial color={c} transparent opacity={o} blending={2} depthWrite={false} side={2} fog={false} /></mesh>;
}

export function Temple({ variant }: EnvProps) {
  const v = HALL[variant && HALL[variant] ? variant : 'hall'];
  const hiero = useMemo(() => { const t = hieroglyphTexture().clone(); t.repeat.set(7, 2.4); t.needsUpdate = true; return t; }, []);
  const wall = mat(variant === 'memphis' ? '#4a4030' : '#d8b888', { map: hiero, rough: 0.85, e: variant === 'memphis' ? 0.35 : 0, emissive: '#7a5a20' });
  const zs = [-22, -14, -6, 2];
  return (
    <>
      <Atmos color={v.pal.fog} near={v.pal.fogNear} far={v.pal.fogFar} /><Lights pal={v.pal} key2={[-8, 16, 14]} />
      <Flat w={90} d={90} color={v.floor} map pos={[0, 0, -10]} rough={0.55} metal={0.1} />
      <P g="box" mt={wall} p={[0, 12, -28]} s={[80, 28, 1]} />
      {[1, -1].map((s) => <P key={s} g="box" mt={wall} p={[s * 30, 12, -8]} s={[1, 28, 70]} />)}
      {zs.flatMap((z) => [-9, 9].map((x) => <Column key={`${x}${z}`} p={[x, 0, z]} h={11} r={0.95} lotus={z % 16 === 0 || x > 0} />))}
      {[-18, -8].flatMap((z) => [-20, 20].map((x) => <Column key={`o${x}${z}`} p={[x, 0, z]} h={11} r={0.95} lotus={false} />))}
      <P g="box" c="#2a1a10" p={[0, 4.5, -27.3]} s={[7, 9, 0.5]} />
      <P g="box" c="#d9a441" p={[0, 9.4, -27.2]} s={[8, 0.5, 0.6]} metal={0.7} />
      {[-6, 6].map((x) => (<group key={x}><PropView def={{ kind: 'flame', at: [x, 0, -24], s: 1.3 }} /><P g="cyl" c="#6a5a3a" p={[x, 0.7, -24]} s={[0.5, 1.4, 0.5]} /></group>))}
      <TorchLight p={[-6, 4, -22]} c={v.torch} i={22} /><TorchLight p={[6, 4, -22]} c={v.torch} i={22} />
      <Shaft p={[-5, 12, -10]} c={v.shaft} /><Shaft p={[6, 12, -4]} c={v.shaft} o={0.05} />
      {variant === 'memphis' && <Glint p={[0, 6, -26]} c="#ffcf6a" s={50} o={0.3} />}
    </>
  );
}

export function Palace({ variant }: EnvProps) {
  const key = variant ?? 'day';
  const sky = TIME[key] ?? TIME.day;
  const night = key === 'night';
  const pal: Palette = { ...sky, hemiI: night ? 0.55 : 1.0 };
  return (
    <>
      <Atmos color={sky.fog} near={40} far={240} /><Sky pal={sky} /><Lights pal={pal} />
      <Flat w={100} d={100} color={night ? '#6a5a44' : '#c8aa78'} map pos={[0, 0, -10]} rough={0.5} />
      <P g="box" c="#e8d0a0" p={[0, 7, -30]} s={[90, 14, 1.2]} />
      {[0, 1, 2, 3, 4].map((i) => <P key={i} g="box" c={['#2a6ab0', '#d9a441', '#b0382a', '#d9a441', '#2a6ab0'][i]} p={[0, 1 + i * 2.6, -29.3]} s={[90, 0.5, 0.2]} metal={i % 2 ? 0.6 : 0} />)}
      {[-26, -14, -3, 8].flatMap((z) => [-11, 11].map((x) => <Column key={`${x}${z}`} p={[x, 0, z]} h={9.5} r={0.85} tint="#f0d8a8" />))}
      <P g="box" c="#a82a2a" p={[0, 0.05, -8]} s={[7, 0.06, 40]} /><P g="box" c="#d9a441" p={[3.7, 0.06, -8]} s={[0.3, 0.07, 40]} /><P g="box" c="#d9a441" p={[-3.7, 0.06, -8]} s={[0.3, 0.07, 40]} />
      {[-14, 14].map((x) => <group key={x}><P g="cyl" c="#6a5a3a" p={[x, 0.8, -12]} s={[0.4, 1.6, 0.4]} /><PropView def={{ kind: 'flame', at: [x, 1.4, -12], s: 0.7 }} /></group>)}
      {night && <><TorchLight p={[-14, 4, -12]} i={30} /><TorchLight p={[14, 4, -12]} i={30} /></>}
    </>
  );
}

// ---- 42 judges ----
const HEADS = ['human', 'falcon', 'jackal', 'lion', 'ibis', 'ram', 'croc', 'cobra'] as const;
function Judge({ i, pos, face }: { i: number; pos: [number, number, number]; face: number }) {
  const k = HEADS[i % HEADS.length];
  const col = ['#a05f38', '#5a3d22', '#16161a', '#c4903f', '#ece6d2', '#cdbf98', '#4a6f45', '#3a7a4a'][i % 8];
  return (
    <group position={pos} rotation={[0, face, 0]} scale={1.15}>
      <P g="tcone" c="#efe7d2" p={[0, 0.7, 0]} s={[0.36, 1.4, 0.3]} />
      <P g="tcone" c="#d9a441" p={[0, 1.38, 0.02]} s={[0.4, 0.1, 0.32]} metal={0.6} />
      <P g="sphere" c={k === 'ibis' ? '#ece6d2' : col} p={[0, 1.65, 0]} s={[0.2, 0.22, 0.22]} />
      {(k === 'falcon' || k === 'ibis') && <P g="cone" c={k === 'ibis' ? '#222' : '#e0b020'} p={[0, 1.6, 0.3]} s={[0.05, 0.22, 0.05]} r={[Math.PI / 2 + 0.3, 0, 0]} />}
      {(k === 'jackal' || k === 'lion' || k === 'ram' || k === 'croc') && <P g="cone" c={col} p={[0, 1.6, 0.3]} s={[0.1, 0.34, 0.08]} r={[Math.PI / 2, 0, 0]} />}
      {k === 'jackal' && [1, -1].map((s) => <P key={s} g="cone" c={col} p={[s * 0.09, 1.95, 0]} s={[0.05, 0.25, 0.03]} />)}
      {k === 'ram' && [1, -1].map((s) => <P key={s} g="torus" c="#8a7a56" p={[s * 0.22, 1.65, 0]} s={[0.12, 0.12, 0.12]} r={[0, Math.PI / 2, 0]} />)}
      {k === 'cobra' && <P g="cyl" c={col} p={[0, 1.7, -0.12]} s={[0.26, 0.03, 0.2]} r={[Math.PI / 2, 0, 0]} />}
      <P g="sphere" c="#fffaf0" p={[0, 2.0 + (k === 'jackal' ? 0.18 : 0), -0.02]} s={[0.05, 0.22, 0.015]} e={0.6} />
    </group>
  );
}

export function Judgement({ variant }: EnvProps) {
  const dark = variant === 'dark';
  const pal: Palette = dark ? mk('#120606', '#a05a50', '#2a0e0a', 0.6, '#ff8a5a', 1.3) : mk('#1c130a', '#ffe0a8', '#5a4020', 1.1, '#fff0c8', 2.2);
  const hiero = useMemo(() => { const t = hieroglyphTexture().clone(); t.repeat.set(9, 2.6); t.needsUpdate = true; return t; }, []);
  const wall = mat(dark ? '#5a3a30' : '#d8b888', { map: hiero, rough: 0.8 });
  const judges = useMemo(() => Array.from({ length: 42 }, (_, i) => {
    const side = i < 21 ? 1 : -1, j = i % 21, tier = Math.floor(j / 7), idx = j % 7;
    return { i, pos: [side * (15.5 + tier * 2.6), tier * 1.0 + 0.0, 8 - idx * 4.2 - (tier % 2) * 1.0] as [number, number, number], face: side * -Math.PI / 2 };
  }), []);
  return (
    <>
      <Atmos color={pal.fog} near={30} far={130} /><Lights pal={pal} key2={[-6, 22, 16]} shadow={false} />
      <Flat w={90} d={120} color={dark ? '#2a1812' : '#3a2c1a'} pos={[0, 0, -20]} rough={0.25} metal={0.5} />
      <P g="box" c="#24407a" p={[0, 0.05, -6]} s={[6, 0.06, 40]} /><P g="box" c="#d9a441" p={[3.1, 0.06, -6]} s={[0.28, 0.07, 40]} metal={0.7} /><P g="box" c="#d9a441" p={[-3.1, 0.06, -6]} s={[0.28, 0.07, 40]} metal={0.7} />
      <P g="box" mt={wall} p={[0, 15, -32]} s={[90, 34, 1.2]} />
      {[1, -1].map((s) => <P key={s} g="box" mt={wall} p={[s * 36, 15, -6]} s={[1.2, 34, 80]} />)}
      {[10, 6, 2, -2, -6, -10, -14, -18].flatMap((z) => [-9, 9].map((x) => <Column key={`${x}${z}`} p={[x, 0, z]} h={17} r={1.15} tint={dark ? '#a07860' : '#e6c8a0'} />))}
      {[1, -1].flatMap((s) => [0, 1, 2].map((t) => <P key={`${s}${t}`} g="box" c={dark ? '#4a3228' : '#9a7a50'} p={[s * (15.5 + t * 2.6), t * 0.5, -6]} s={[2.6, 1 + t, 32]} rough={0.8} />))}
      {judges.map((j) => <Judge key={j.i} i={j.i} pos={[j.pos[0], j.pos[1] + 0.5 + Math.floor((j.i % 21) / 7) * 0.5, j.pos[2]]} face={j.face} />)}
      <P g="box" c="#c8a050" p={[0, 0.4, -22]} s={[16, 0.8, 7]} metal={0.4} />
      <PropView def={{ kind: 'throne', at: [0, 0.8, -21.0], s: 1.6 }} />
      <P g="sphere" c="#ffd27a" p={[0, 18, -31]} s={[4, 4, 0.5]} e={1.6} />
      <Glint p={[0, 18, -30]} c="#ffd27a" s={40} o={0.4} />
      <pointLight position={[0, 9, 0]} color={dark ? '#ff5a3a' : '#ffd890'} intensity={dark ? 25 : 60} distance={45} decay={1.4} />
      <pointLight position={[0, 5, -18]} color="#46ff8a" intensity={dark ? 8 : 22} distance={28} decay={1.5} />
    </>
  );
}
