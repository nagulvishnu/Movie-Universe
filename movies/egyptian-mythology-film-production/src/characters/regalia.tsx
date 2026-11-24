import { P } from '../render/prim';
import type { CrownKind, GodDef, ItemKind } from './registry';

// Crowns, headdresses and held regalia. Crowns sit at the top of the head (origin = head centre).
const WHITE = '#f4f1e4', RED = '#c0322a', GOLD = '#e0b030', GLOW = '#ffb020';

const Uraeus = ({ p = [0, 0.26, 0.15] as [number, number, number], s = 1 }: { p?: [number, number, number]; s?: number }) => (
  <group position={p} scale={s}>
    <P g="sphere" c={GOLD} s={[0.03, 0.045, 0.025]} metal={0.7} rough={0.3} />
    <P g="sphere" c={GOLD} p={[0, 0.045, 0.01]} s={[0.04, 0.03, 0.02]} metal={0.7} rough={0.3} />
    <P g="sphere" c={GLOW} p={[0, 0.06, 0.03]} s={0.014} e={0.8} />
  </group>
);

const Hedjet = ({ y = 0.2, s = 1 }: { y?: number; s?: number }) => (
  <group position={[0, y, -0.01]} scale={s}>
    <P g="tcone" c={WHITE} p={[0, 0.2, 0]} s={[0.1, 0.4, 0.09]} r={[Math.PI, 0, 0]} />
    <P g="sphere" c={WHITE} p={[0, 0.42, 0]} s={[0.085, 0.07, 0.08]} />
  </group>
);
const Deshret = ({ y = 0.2, s = 1 }: { y?: number; s?: number }) => (
  <group position={[0, y, -0.02]} scale={s}>
    <P g="tcone" c={RED} p={[0, 0.12, 0]} s={[0.15, 0.24, 0.13]} />
    <P g="box" c={RED} p={[0, 0.3, -0.07]} s={[0.1, 0.22, 0.05]} />
    <P g="cyl" c="#a02a20" p={[0, 0.35, 0.09]} s={[0.008, 0.28, 0.008]} r={[-0.15, 0, 0]} />
    <P g="torus" c="#a02a20" p={[0, 0.25, 0.1]} s={0.02} />
  </group>
);

const Plume = ({ x, c, h = 0.55 }: { x: number; c: string; h?: number }) => (
  <group position={[x, 0.22, 0]}>
    <P g="sphere" c={c} p={[0, h / 2, 0]} s={[0.035, h / 2, 0.012]} />
    <P g="box" c={GOLD} p={[0, h * 0.35, 0.012]} s={[0.01, h * 0.55, 0.004]} />
  </group>
);

export function Crown({ kind, def }: { kind: CrownKind; def: GodDef }) {
  const a = def.accent;
  switch (kind) {
    case 'sun':
      return (<group><P g="sphere" c={GLOW} p={[0, 0.4, 0]} s={[0.2, 0.2, 0.05]} e={1.4} /><P g="torus" c={GOLD} p={[0, 0.4, 0.02]} s={[0.2, 0.2, 0.3]} metal={0.8} rough={0.3} /><Uraeus p={[0, 0.22, 0.15]} /></group>);
    case 'white': return <Hedjet />;
    case 'red': return <Deshret />;
    case 'pschent': return (<group><Deshret /><Hedjet y={0.43} s={0.78} /><Uraeus p={[0, 0.2, 0.14]} /></group>);
    case 'atef':
      return (
        <group>
          <Hedjet y={0.16} s={0.9} />
          <Plume x={0.12} c="#e8e0c8" h={0.6} /><Plume x={-0.12} c="#e8e0c8" h={0.6} />
          {[1, -1].map((s) => <group key={s} position={[s * 0.12, 0.2, 0]} rotation={[0, s * Math.PI / 2, 0]}><P g="arc" c="#d8c890" s={0.1} r={[Math.PI / 2, 0, 0]} /></group>)}
          <P g="sphere" c={GLOW} p={[0, 0.72, 0]} s={0.04} e={1.2} />
          <Uraeus p={[0, 0.2, 0.15]} />
        </group>
      );
    case 'plumes':
      return (<group><P g="cyl" c={GOLD} p={[0, 0.2, 0]} s={[0.16, 0.025, 0.14]} metal={0.7} rough={0.3} /><Plume x={0.06} c={a === '#9fd0ff' ? '#9fd0ff' : '#2a4ab0'} /><Plume x={-0.06} c="#b02a2a" /></group>);
    case 'amunra':
      return (<group><P g="cyl" c={GOLD} p={[0, 0.2, 0]} s={[0.16, 0.025, 0.14]} metal={0.7} /><Plume x={0.06} c="#2a4ab0" h={0.62} /><Plume x={-0.06} c="#2a4ab0" h={0.62} /><P g="sphere" c={GLOW} p={[0, 0.34, 0.1]} s={[0.1, 0.1, 0.03]} e={1.4} /></group>);
    case 'feather':
      return (<group><P g="torus" c={GOLD} p={[0, 0.09, 0]} s={[0.17, 0.2, 0.17]} r={[Math.PI / 2, 0, 0]} /><P g="sphere" c="#fffaf0" p={[0, 0.33, -0.02]} s={[0.05, 0.16, 0.012]} /><P g="box" c={GOLD} p={[0, 0.3, -0.01]} s={[0.006, 0.28, 0.004]} /></group>);
    case 'ostrich':
      return (<group><P g="torus" c={GOLD} p={[0, 0.09, 0]} s={[0.17, 0.2, 0.17]} r={[Math.PI / 2, 0, 0]} /><P g="sphere" c="#f0ecd8" p={[0, 0.4, -0.02]} s={[0.05, 0.22, 0.012]} /></group>);
    case 'throne':
      return (<group><P g="box" c="#e0b030" p={[0, 0.25, 0]} s={[0.12, 0.07, 0.1]} metal={0.6} /><P g="box" c="#3a6ae0" p={[0, 0.34, -0.04]} s={[0.12, 0.14, 0.03]} /><P g="box" c="#e0b030" p={[0, 0.21, 0.06]} s={[0.03, 0.06, 0.05]} /></group>);
    case 'house':
      return (<group><P g="box" c="#e0b030" p={[0, 0.24, 0]} s={[0.15, 0.05, 0.1]} metal={0.6} /><P g="box" c="#f4f1e4" p={[0, 0.31, 0]} s={[0.13, 0.09, 0.08]} /><P g="box" c="#3a6ae0" p={[0, 0.37, 0]} s={[0.14, 0.02, 0.09]} /></group>);
    case 'hathor':
      return (<group><group position={[0, 0.12, 0]}><P g="arc" c={GOLD} s={[0.3, 0.3, 0.3]} r={[0, 0, Math.PI]} p={[0, 0.3, 0]} metal={0.7} rough={0.3} /></group><P g="sphere" c={GLOW} p={[0, 0.42, 0]} s={[0.12, 0.12, 0.04]} e={1.3} /><Uraeus p={[0, 0.2, 0.15]} /></group>);
    case 'moon':
      return (<group><P g="arc" c="#e8ecff" p={[0, 0.28, 0]} s={[0.15, 0.15, 0.15]} r={[0, 0, Math.PI]} e={0.5} /><P g="sphere" c="#f4f8ff" p={[0, 0.33, 0]} s={[0.1, 0.1, 0.03]} e={1.2} /></group>);
    case 'lotus':
      return (<group position={[0, 0.2, 0]}>{[0, 1, 2, 3, 4].map((i) => <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}><P g="cone" c="#3a7ae0" p={[0, 0.12, 0.05]} s={[0.04, 0.16, 0.015]} r={[0.45, 0, 0]} e={0.25} /></group>)}<P g="sphere" c="#ffe070" p={[0, 0.07, 0]} s={0.03} e={0.8} /></group>);
    case 'vulture':
      return (
        <group>
          <P g="hemi" c="#2a6ab0" p={[0, 0.06, -0.01]} s={[0.19, 0.15, 0.2]} />
          {[1, -1].map((s) => <group key={s}><P g="box" c="#2a6ab0" p={[s * 0.19, -0.13, 0.0]} s={[0.035, 0.34, 0.14]} r={[0, 0, s * -0.08]} /><P g="box" c={GOLD} p={[s * 0.195, -0.13, 0.0]} s={[0.012, 0.3, 0.04]} /></group>)}
          <P g="cone" c={GOLD} p={[0, 0.15, 0.18]} s={[0.03, 0.09, 0.03]} r={[Math.PI / 2 + 0.2, 0, 0]} />
          <P g="sphere" c={GOLD} p={[0, 0.17, 0.15]} s={0.04} />
          <Deshret y={0.18} s={0.9} /><Hedjet y={0.38} s={0.65} />
        </group>
      );
    case 'scorpion':
      return (
        <group position={[0, 0.2, 0]}>
          <P g="sphere" c="#d9b44a" p={[0, 0.04, 0]} s={[0.06, 0.035, 0.1]} metal={0.5} />
          {[0, 1, 2, 3].map((i) => <P key={i} g="sphere" c="#d9b44a" p={[0, 0.07 + i * 0.045, -0.1 - i * 0.015 + (i > 2 ? 0.05 : 0)]} s={0.026 - i * 0.002} metal={0.5} />)}
          <P g="cone" c="#4a2a10" p={[0, 0.24, -0.08]} s={[0.012, 0.05, 0.012]} r={[2.4, 0, 0]} />
          {[1, -1].map((s) => <P key={s} g="sphere" c="#d9b44a" p={[s * 0.05, 0.04, 0.12]} s={[0.025, 0.015, 0.04]} />)}
        </group>
      );
    case 'star':
      return (
        <group>
          <P g="torus" c={GOLD} p={[0, 0.09, 0]} s={[0.17, 0.2, 0.17]} r={[Math.PI / 2, 0, 0]} />
          <group position={[0, 0.34, 0.02]}>{[0, 1, 2, 3, 4, 5, 6].map((i) => <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}><P g="box" c={i % 2 ? '#ffffff' : GOLD} p={[0, 0.07, 0]} s={[0.025, 0.14, 0.012]} e={0.4} /></group>)}</group>
          <group position={[0, 0.4, 0.02]}><P g="arc" c={GOLD} s={[0.13, 0.13, 0.13]} /></group>
        </group>
      );
    case 'skullcap': return <P g="hemi" c="#2f5ab0" p={[0, 0.03, -0.005]} s={[0.178, 0.16, 0.19]} />;
    case 'water': return (<group><P g="sphere" c="#b04a3a" p={[0, 0.3, 0]} s={[0.1, 0.09, 0.1]} /><P g="cyl" c="#b04a3a" p={[0, 0.2, 0]} s={[0.04, 0.05, 0.04]} /><P g="torus" c="#d9a441" p={[0, 0.23, 0]} s={[0.07, 0.07, 0.07]} r={[Math.PI / 2, 0, 0]} /></group>);
    case 'goose':
      return (
        <group position={[0, 0.22, 0]}>
          <P g="sphere" c="#f0e8d4" p={[0, 0.05, 0]} s={[0.07, 0.06, 0.12]} />
          <P g="cyl" c="#f0e8d4" p={[0, 0.14, 0.1]} s={[0.025, 0.1, 0.025]} r={[0.4, 0, 0]} />
          <P g="sphere" c="#f0e8d4" p={[0, 0.2, 0.14]} s={0.03} />
          <P g="cone" c="#e87a20" p={[0, 0.2, 0.19]} s={[0.014, 0.05, 0.014]} r={[Math.PI / 2, 0, 0]} />
        </group>
      );
    case 'khepri': return <P g="sphere" c="#1a3a6a" p={[0, 0.17, 0.0]} s={0.02} />;
  }
}

// ---- Held items. Origin at the hand; items point up (+y). ----
export function Item({ kind, accent }: { kind: ItemKind; accent: string }) {
  switch (kind) {
    case 'ankh':
      return (<group position={[0, 0.1, 0.03]}><P g="torus" c={GOLD} p={[0, 0.14, 0]} s={[0.05, 0.065, 0.05]} metal={0.8} rough={0.3} /><P g="box" c={GOLD} p={[0, -0.02, 0]} s={[0.022, 0.2, 0.022]} metal={0.8} /><P g="box" c={GOLD} p={[0, 0.06, 0]} s={[0.12, 0.022, 0.022]} metal={0.8} /></group>);
    case 'was':
      return (<group position={[0, 0.0, 0.03]}><P g="cyl" c={GOLD} p={[0, 0.3, 0]} s={[0.014, 0.8, 0.014]} metal={0.7} /><P g="box" c="#2a8a6a" p={[0, 0.74, 0.02]} s={[0.04, 0.06, 0.06]} /><P g="cone" c={GOLD} p={[0.012, -0.12, 0]} s={[0.012, 0.1, 0.012]} r={[0, 0, 0.3]} /><P g="cone" c={GOLD} p={[-0.012, -0.12, 0]} s={[0.012, 0.1, 0.012]} r={[0, 0, -0.3]} /></group>);
    case 'staff':
      return (<group position={[0, 0, 0.03]}><P g="cyl" c="#c9a05a" p={[0, 0.3, 0]} s={[0.014, 0.75, 0.014]} /><P g="sphere" c={GOLD} p={[0, 0.7, 0]} s={0.03} metal={0.7} /></group>);
    case 'crook':
      return (<group position={[0, 0, 0.03]}><P g="cyl" c={GOLD} p={[0, 0.25, 0]} s={[0.014, 0.6, 0.014]} metal={0.7} /><group position={[0.04, 0.58, 0]}><P g="arc" c={GOLD} s={0.05} r={[0, 0, Math.PI * 0.7]} /></group></group>);
    case 'flail':
      return (<group position={[0, 0, 0.03]}><P g="cyl" c={GOLD} p={[0, 0.1, 0]} s={[0.014, 0.25, 0.014]} metal={0.7} />{[-0.03, 0, 0.03].map((x, i) => <group key={i}><P g="cyl" c="#e8e0c8" p={[x * 1.4, 0.36, 0]} s={[0.006, 0.16, 0.006]} r={[0, 0, x * 4]} /><P g="sphere" c={i === 1 ? '#3a6ae0' : '#c0322a'} p={[x * 2.2, 0.46, 0]} s={0.014} /></group>)}</group>);
    case 'spear':
      return (<group position={[0, 0, 0.03]}><P g="cyl" c="#7a5a30" p={[0, 0.2, 0]} s={[0.014, 1.0, 0.014]} /><P g="cone" c="#cfd4e0" p={[0, 0.78, 0]} s={[0.03, 0.16, 0.012]} metal={0.9} rough={0.2} /></group>);
    case 'bow':
      return (<group position={[0, 0.1, 0.05]} rotation={[0, 0, 0]}><group rotation={[0, 0, -Math.PI / 2]}><P g="arc" c="#7a5a30" s={[0.34, 0.2, 0.34]} /></group><P g="cyl" c="#e8e0c8" p={[0, 0, 0]} s={[0.003, 0.34, 0.003]} /></group>);
    case 'knife':
      return (<group position={[0, 0.05, 0.03]}><P g="box" c="#5a3a1a" p={[0, 0, 0]} s={[0.024, 0.1, 0.024]} /><P g="box" c="#d0d4e0" p={[0, 0.17, 0]} s={[0.026, 0.28, 0.008]} metal={0.9} rough={0.25} /></group>);
    case 'scroll':
      return (<group position={[0, 0.05, 0.05]} rotation={[0, 0, Math.PI / 2]}><P g="cyl" c="#efe3bc" s={[0.035, 0.14, 0.035]} /><P g="cyl" c="#d8c898" p={[0, 0, 0]} s={[0.032, 0.15, 0.032]} /></group>);
    case 'sistrum':
      return (<group position={[0, 0.02, 0.03]}><P g="cyl" c={GOLD} p={[0, 0.06, 0]} s={[0.014, 0.16, 0.014]} metal={0.7} /><P g="torus" c={GOLD} p={[0, 0.24, 0]} s={[0.055, 0.075, 0.03]} metal={0.7} /><P g="cyl" c="#c0a030" p={[0, 0.25, 0]} s={[0.003, 0.08, 0.003]} r={[0, 0, Math.PI / 2]} /></group>);
    case 'torch':
      return (<group position={[0, 0, 0.03]}><P g="cyl" c="#7a5a30" p={[0, 0.2, 0]} s={[0.018, 0.5, 0.018]} /><P g="cone" c="#ff9a20" p={[0, 0.58, 0]} s={[0.05, 0.16, 0.05]} e={2} /></group>);
    case 'sa':
      return (<group position={[0, 0.05, 0.04]}><P g="torus" c={accent} s={[0.045, 0.06, 0.03]} /><P g="box" c={accent} p={[0, -0.09, 0]} s={[0.02, 0.1, 0.02]} /></group>);
  }
}
