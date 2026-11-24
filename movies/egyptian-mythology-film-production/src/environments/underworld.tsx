import { useMemo } from 'react';
import { P } from '../render/prim';
import { PropView } from '../render/Props';
import { Atmos, Flat, Glint, Lights, TorchLight, Water, type Palette } from './common';
import type { EnvProps } from './types';

// The Duat: river caverns, fiery river, and the calm land of Osiris.
const mk = (fog: string, hemiSky: string, hemiGround: string, hemiI: number, key: string, keyI: number): Palette => ({ top: '#000', mid: fog, bottom: '#000', sun: '#000', sunDir: [0, 1, 0], sunI: 0, fog, fogNear: 18, fogFar: 120, hemiSky, hemiGround, hemiI, key, keyI });

export function Duat({ variant }: EnvProps) {
  const v = variant ?? 'duat';
  const fire = v === 'fire', river = v === 'duat' || v === 'fire', calm = v === 'calm';
  const pal = fire ? mk('#240806', '#d86a40', '#2a0c08', 0.9, '#ff7a40', 2.2) : calm ? mk('#06140e', '#6ad898', '#0a2a1a', 1.0, '#a8ffd0', 1.7) : v === 'path' ? mk('#14080a', '#c87a50', '#2a1410', 0.8, '#ff9a60', 1.7) : mk('#06101a', '#5a8aa8', '#10202a', 0.8, '#9ad0e8', 1.5);
  const rocks = useMemo(() => Array.from({ length: 34 }, (_, i) => { const side = i % 2 ? 1 : -1, r = (k: number) => Math.abs(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1; return { x: side * (22 + r(1) * 30), z: 20 - r(2) * 110, h: 10 + r(3) * 32, w: 6 + r(4) * 9, side }; }), []);
  const glowCol = fire ? '#ff4a1a' : calm ? '#40ff90' : '#ff7a30';
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear} far={pal.fogFar} /><Lights pal={pal} key2={[-8, 18, 14]} shadow={false} />
      {river ? (
        <>
          <Water a={fire ? '#3a0804' : '#04141c'} b={fire ? '#d8480e' : '#0e4a5a'} glint={fire ? '#ffd070' : '#7adcff'} fog={pal.fog} near={20} far={110} size={[34, 400]} pos={[0, -60]} y={0} gl={fire ? 1.2 : 0.7} />
          {[1, -1].map((s) => <Flat key={s} w={80} d={400} color={fire ? '#3a1812' : '#1c1a1c'} pos={[s * (17 + 40), 0.25, -60]} rough={1} />)}
        </>
      ) : (
        <Flat w={200} d={300} color={calm ? '#1a3a2a' : '#2a1c18'} pos={[0, 0, -60]} map rough={0.6} metal={0.15} />
      )}
      {rocks.map((r, i) => <group key={i} position={[r.x, 0, r.z]}><P g="cone" c={fire ? '#3a1410' : calm ? '#12261c' : '#241c20'} p={[0, r.h / 2, 0]} s={[r.w, r.h, r.w * 0.9]} r={[0, i, 0]} rough={1} />{i % 3 === 0 && <Glint p={[-r.side * r.w * 0.5, 2.5, 3]} c={glowCol} s={7} o={0.5} />}</group>)}
      {Array.from({ length: 14 }).map((_, i) => <group key={i} position={[(i % 2 ? 1 : -1) * 18, 0.3, 14 - i * 8]}><P g="cyl" c="#3a2a22" p={[0, 0.9, 0]} s={[0.35, 1.8, 0.35]} /><PropView def={{ kind: 'flame', at: [0, 1.7, 0], s: 0.6 }} /></group>)}
      <TorchLight p={[-12, 6, 4]} c={glowCol} i={fire ? 60 : 28} d={40} /><TorchLight p={[12, 6, -14]} c={glowCol} i={fire ? 60 : 28} d={40} />
      {calm && <Glint p={[0, 8, -20]} c="#46ff8a" s={60} o={0.25} />}
      {fire && <Glint p={[0, 10, -50]} c="#ff3a1a" s={90} o={0.4} />}
    </>
  );
}
