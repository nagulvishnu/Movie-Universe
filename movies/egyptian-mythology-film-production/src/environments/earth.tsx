import { useMemo } from 'react';
import { P } from '../render/prim';
import { Atmos, Column, Dunes, Flat, Glint, Houses, Lights, Palm, PalmGrove, Pyramids, Reeds, Sky, TIME, Water, type Palette } from './common';
import type { EnvProps } from './types';

// Earthly environments: the Nile valley, Heliopolis, the marshes, battlefields and fields.
const pick = (v: string | undefined, fallback = 'day'): Palette => TIME[v && TIME[v] ? v : fallback];

export function Nile({ variant }: EnvProps) {
  const pal = pick(variant);
  const night = variant === 'night', stormy = variant === 'storm';
  const p2 = stormy ? { ...TIME.storm, top: '#2a2a3a', mid: '#78666a', fogFar: 200 } : pal;
  const sand = night ? '#4a4638' : stormy ? '#7a6a52' : variant === 'dusk' ? '#b8805a' : '#d8b878';
  const grass = night ? '#1c2a22' : stormy ? '#3a4a30' : '#5a8a3e';
  const wA = night ? '#050c18' : variant === 'dusk' ? '#2a2a4a' : stormy ? '#2a3238' : '#1c5a6a';
  const wB = night ? '#142a4a' : variant === 'dusk' ? '#b8603a' : stormy ? '#4a5a62' : '#4a9ab0';
  return (
    <>
      <Atmos color={p2.fog} near={p2.fogNear} far={p2.fogFar} /><Sky pal={p2} /><Lights pal={p2} key2={night ? [8, 18, 8] : [-12, 16, 14]} />
      {/* River to the north, bank in front */}
      <Water a={wA} b={wB} glint={night ? '#9fb8ff' : variant === 'dusk' || variant === 'dawn' || variant === 'sunrise' ? '#ffcf8a' : '#e8f8ff'} fog={p2.fog} near={50} far={p2.fogFar} size={[700, 330]} pos={[0, -152.5]} y={-0.05} gl={0.8} />
      <Dunes color={sand} amp={3} flat={24} size={360} seed={2} pos={[0, 150]} />
      <Flat w={90} d={14} color={grass} pos={[0, 0.02, 0]} y={0.01} rough={1} />
      <Flat w={700} d={80} color={grass} pos={[0, 0, -75]} y={0.02} rough={1} />
      <Houses n={9} z={-66} spread={140} color={night ? '#6a5a48' : '#d4b88a'} />
      <PalmGrove n={16} z0={-60} z1={-80} spread={160} seed={4} />
      <PalmGrove n={6} z0={4} z1={12} spread={34} seed={9} />
      <Pyramids z={-210} color={night ? '#6a6458' : variant === 'dusk' ? '#c8845a' : '#d9bb82'} />
      <Reeds n={90} area={[50, 4]} hole={0} h={3.2} c={[0, -3.6]} seed={8} />
      {variant === 'sunrise' && <Glint p={[0, 20, -240]} c="#ffd890" s={220} o={0.45} />}
    </>
  );
}

export function Heliopolis({ variant }: EnvProps) {
  const pal = pick(variant);
  const night = variant === 'night';
  const stone = night ? '#6a604e' : '#d8b878';
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear} far={pal.fogFar} /><Sky pal={pal} /><Lights pal={pal} />
      <Dunes color={night ? '#4a4638' : '#d8b878'} amp={3.4} flat={34} size={420} seed={6} />
      <Flat w={46} d={46} color={stone} map pos={[0, 0.03, 0]} rough={0.85} />
      {/* Pylon gateway of the sun temple */}
      <group position={[0, 0, -34]}>
        {[1, -1].map((s) => <P key={s} g="box" c="#e0bf8a" p={[s * 12, 9, 0]} s={[10, 18, 6]} r={[0, 0, 0]} rough={0.9} cast />)}
        {[1, -1].map((s) => <P key={'t' + s} g="box" c="#c8a470" p={[s * 12, 18.4, 0]} s={[10.8, 0.8, 6.6]} />)}
        <P g="box" c="#d0aa74" p={[0, 14.5, 0]} s={[14, 4, 5]} />
        <P g="box" c="#2a1a10" p={[0, 6, 2.6]} s={[14, 12, 0.5]} />
        <P g="sphere" c="#ffb020" p={[0, 15, 2.8]} s={[2.2, 2.2, 0.3]} e={1.2} />
        {[1, -1].map((s) => <group key={'f' + s}><P g="cyl" c="#7a5a3a" p={[s * 17.6, 11, 4]} s={[0.35, 22, 0.35]} /><P g="box" c={s > 0 ? '#c0322a' : '#2a6ab0'} p={[s * 17.6, 20, 4.1]} s={[0.1, 3.5, 0.05]} /></group>)}
      </group>
      <Column p={[-18, 0, -18]} h={9} lotus /><Column p={[18, 0, -18]} h={9} lotus /><Column p={[-18, 0, -8]} h={9} /><Column p={[18, 0, -8]} h={9} />
      <PalmGrove n={12} z0={-6} z1={-26} spread={90} seed={11} />
      <Pyramids z={-230} color="#d9bb82" />
    </>
  );
}

export function Marsh({ variant }: EnvProps) {
  const pal = pick(variant, 'night');
  const night = variant === 'night';
  const fogC = night ? '#0a1a22' : variant === 'dusk' ? '#6a4a4a' : variant === 'dawn' ? '#9a8a7a' : '#a8c8b8';
  return (
    <>
      <Atmos color={fogC} near={10} far={night ? 90 : 130} /><Sky pal={pal} /><Lights pal={pal} />
      <Water a={night ? '#04101a' : '#1a4a4a'} b={night ? '#0e2a3a' : '#3a8a7a'} glint={night ? '#bfe8ff' : '#fff0c0'} fog={fogC} near={14} far={110} y={-0.1} gl={0.6} />
      <mesh position={[0, -0.02, 0]} scale={[7.5, 0.35, 7.5]} receiveShadow><sphereGeometry args={[1, 24, 8]} /><meshStandardMaterial color={night ? '#2a3a2a' : '#6a8a4a'} roughness={1} /></mesh>
      <Reeds n={340} area={[70, 50]} hole={7.5} h={5.2} color={night ? '#2a4a2a' : '#5a8a3a'} seed={3} />
      <Reeds n={160} area={[30, 20]} hole={9} h={2.4} color={night ? '#355a30' : '#6a9a44'} seed={7} />
    </>
  );
}

export function Battlefield({ variant }: EnvProps) {
  const pal = variant === 'blood' ? TIME.blood : TIME.storm;
  const rocks = useMemo(() => Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2 + 0.3, r = 44 + ((i * 37) % 17); return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: 12 + ((i * 53) % 18), w: 7 + ((i * 29) % 8) }; }), []);
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear} far={pal.fogFar} /><Sky pal={pal} /><Lights pal={pal} />
      <Dunes color={variant === 'blood' ? '#8a3a22' : '#8a5a3a'} amp={4.2} flat={22} size={360} seed={5} rock />
      {rocks.map((r, i) => <group key={i} position={[r.x, 0, r.z]}><P g="cone" c={variant === 'blood' ? '#4a1a12' : '#4a3226'} p={[0, r.h / 2, 0]} s={[r.w, r.h, r.w * 0.8]} r={[0, i, 0]} rough={1} /></group>)}
      <Glint p={[0, 8, -120]} c={variant === 'blood' ? '#ff3a1a' : '#ff9a62'} s={140} o={0.3} />
    </>
  );
}

export function Fields({ variant }: EnvProps) {
  const pal = pick(variant);
  const dusk = variant === 'dusk';
  const rows = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ z: -12 - i * 7, x: ((i * 17) % 9) - 4 })), []);
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear} far={pal.fogFar} /><Sky pal={pal} /><Lights pal={pal} />
      <Dunes color={dusk ? '#8a8a3a' : '#7aa046'} amp={1.2} flat={30} size={420} seed={7} tile={30} />
      {rows.map((r, i) => <Reeds key={i} n={80} area={[70, 5]} hole={0} h={1.6} color={dusk ? '#c89a3a' : '#d8b844'} seed={i + 1} c={[r.x, r.z]} />)}
      <Reeds n={140} area={[80, 10]} hole={0} h={1.4} color={dusk ? '#c89a3a' : '#d8b844'} seed={21} c={[0, -5]} />
      <Water a="#2a6a7a" b="#5aa0b0" glint="#fff0c0" fog={pal.fog} near={60} far={260} size={[400, 8]} pos={[0, -34]} y={0.04} />
      <PalmGrove n={10} z0={-8} z1={-40} spread={110} seed={13} />
      <Houses n={5} z={-90} spread={120} seed={9} />
      <Pyramids z={-230} />
      <Palm p={[-12, 0, -6]} s={1.1} /><Palm p={[13, 0, -9]} s={1.2} lean={0.2} />
    </>
  );
}
