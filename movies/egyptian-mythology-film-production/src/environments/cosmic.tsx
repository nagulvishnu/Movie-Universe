import { PropView } from '../render/Props';
import { Atmos, Clouds, Dunes, Glint, Lights, Sky, TIME, Water, type Palette } from './common';
import type { EnvProps } from './types';

// Cosmic environments: the void, Nun, the primeval mound, the lotus of Hermopolis, the cosmos and the heavens.
const NUN_DARK: Palette = { top: '#010508', mid: '#08202c', bottom: '#01070b', sun: '#3a7a80', sunDir: [0, 0.05, -1], sunI: 0.1, fog: '#04141c', fogNear: 20, fogFar: 150, hemiSky: '#2a6a80', hemiGround: '#04141c', hemiI: 0.55, key: '#6ad0e0', keyI: 0.9 };
const NUN_GLOW: Palette = { ...NUN_DARK, top: '#04121a', mid: '#2e6a72', bottom: '#03121a', sun: '#ffd27a', sunI: 0.8, fog: '#0b2c36', fogFar: 190, hemiI: 0.9, keyI: 1.4 };

export function Void(_: EnvProps) {
  return (<><Atmos color="#000000" near={30} far={90} /><hemisphereLight args={['#445577', '#000000', 0.5]} /><directionalLight position={[3, 6, 8]} intensity={0.8} color="#ffe0a0" /></>);
}

export function Nun({ variant }: EnvProps) {
  const pal = variant === 'glow' ? NUN_GLOW : NUN_DARK;
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear} far={pal.fogFar} /><Sky pal={pal} /><Lights pal={pal} shadow={false} />
      <Water a="#020d14" b="#0e3a4a" glint="#6adcf0" fog={pal.fog} near={20} far={170} gl={variant === 'glow' ? 0.9 : 0.5} y={-0.02} />
      {variant === 'glow' && <Glint p={[0, 6, -90]} c="#ffd27a" s={80} o={0.35} />}
    </>
  );
}

export function Mound({ variant }: EnvProps) {
  const pal: Palette = variant === 'sunrise' ? { ...TIME.sunrise, fog: '#9a8068' } : variant === 'dawn' ? { ...TIME.dawn, fog: '#6a5a5a', fogNear: 30 } : NUN_GLOW;
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear} far={pal.fogFar} /><Sky pal={pal} /><Lights pal={pal} />
      <Water a="#0a2a38" b="#2a6a78" glint={variant === 'sunrise' ? '#ffd890' : '#a8e8ff'} fog={pal.fog} near={30} far={200} y={-0.02} />
      <mesh position={[0, 0, 0]} scale={[7.5, 1.2, 7.5]} receiveShadow castShadow><sphereGeometry args={[1, 28, 14]} /><meshStandardMaterial color="#b89a62" roughness={0.95} /></mesh>
      <mesh position={[0, 0.05, 0]} scale={[9.5, 0.4, 9.5]}><sphereGeometry args={[1, 24, 8]} /><meshStandardMaterial color="#8a7448" roughness={1} /></mesh>
    </>
  );
}

export function LotusEnv({ variant }: EnvProps) {
  const sun = variant === 'sunrise';
  const pal: Palette = sun ? { ...TIME.dawn, fog: '#4a5a60', fogNear: 25, fogFar: 200, top: '#22305a' } : NUN_DARK;
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear} far={pal.fogFar} /><Sky pal={pal} /><Lights pal={pal} shadow={false} hemi={sun ? 1 : 1.5} />
      <Water a="#030f18" b="#144a5c" glint={sun ? '#ffd890' : '#7ae0ff'} fog={pal.fog} near={25} far={160} gl={0.8} y={-0.02} />
      <PropView def={{ kind: 'lotus', at: [0, 0, 0], s: 3.4, a: sun ? 0 : 0, a2: sun ? 1 : 0, t0: 0.05, t1: 0.55 }} />
      <PropView def={{ kind: 'flame', at: [-13, 0, -10], s: 1.4 }} />
      <PropView def={{ kind: 'flame', at: [13, 0, -12], s: 1.2 }} />
      <Glint p={[0, 4, 0]} c={sun ? '#ffe08a' : '#6adcf0'} s={sun ? 18 : 10} o={sun ? 0.5 : 0.35} />
    </>
  );
}

export function Cosmos(_: EnvProps) {
  const pal: Palette = { top: '#04061c', mid: '#1a1450', bottom: '#0a0a24', sun: '#8a7aff', sunDir: [0.3, 0.2, -1], sunI: 0.4, fog: '#0a0a2a', fogNear: 60, fogFar: 320, hemiSky: '#6a7ae0', hemiGround: '#2a4a2a', hemiI: 1.0, key: '#cfd8ff', keyI: 2.0 };
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear} far={pal.fogFar} /><Sky pal={pal} /><Lights pal={pal} key2={[-10, 20, 16]} />
      <Dunes color="#44663a" amp={3.2} flat={28} size={400} seed={4} />
      <Glint p={[-60, 40, -120]} c="#5a4acc" s={120} o={0.1} /><Glint p={[70, 55, -140]} c="#2ab0a0" s={100} o={0.08} />
    </>
  );
}

export function Heavens({ variant }: EnvProps) {
  const pal = TIME[variant && TIME[variant] ? variant : 'day'];
  const night = variant === 'night';
  return (
    <>
      <Atmos color={pal.fog} near={pal.fogNear * 0.5} far={pal.fogFar * 0.9} /><Sky pal={pal} /><Lights pal={pal} key2={[-10, 18, 14]} />
      <Clouds n={34} y={-0.9} r={13} c={night ? '#6a78a0' : variant === 'dusk' ? '#ffb090' : '#fff0d8'} o={0.95} seed={3} thick={2.2} />
      <Clouds n={50} y={-9} r={110} c={night ? '#303a60' : variant === 'dusk' ? '#c86a50' : '#ffe8d0'} o={0.85} seed={9} thick={3.4} />
      {!night && <Glint p={[0, 14, -140]} c={pal.sun} s={150} o={0.3} />}
    </>
  );
}
