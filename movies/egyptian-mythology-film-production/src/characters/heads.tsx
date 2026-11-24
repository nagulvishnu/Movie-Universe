import type { Emote } from '../film/types';
import { P } from '../render/prim';
import type { GodDef } from './registry';

// Head modules. Origin = centre of the head, facing +z. Roughly 0.17 radius for human-sized heads.
const Eye = ({ x, y, z, s = 1, iris = '#161008', white = '#f4efe0', kohl = true, ang = 0 }: { x: number; y: number; z: number; s?: number; iris?: string; white?: string; kohl?: boolean; ang?: number }) => (
  <group position={[x, y, z]} rotation={[0, ang, 0]}>
    <P g="sphere" c={white} s={[0.034 * s, 0.021 * s, 0.02 * s]} />
    <P g="sphere" c={iris} p={[0, 0, 0.011 * s]} s={0.013 * s} />
    {kohl && <P g="box" c="#0c0a08" p={[Math.sign(x) * 0.05 * s, -0.004, -0.004]} s={[0.07 * s, 0.009 * s, 0.01]} />}
  </group>
);

const browTilt = (e: Emote) => (e === 'angry' ? 0.38 : e === 'stern' ? 0.18 : e === 'sad' ? -0.3 : e === 'joy' ? -0.06 : 0);
const mouthW = (e: Emote) => (e === 'joy' ? 0.075 : e === 'angry' ? 0.04 : e === 'sad' ? 0.038 : 0.05);

function HumanHead({ def, e, skin, scale = 1, wigOn = true }: { def: GodDef; e: Emote; skin: string; scale?: number; wigOn?: boolean }) {
  const t = browTilt(e);
  const hair = def.hair;
  return (
    <group scale={scale}>
      <P g="sphere" c={skin} s={[0.165, 0.2, 0.175]} cast />
      <P g="sphere" c={skin} p={[0, -0.03, 0.17]} s={[0.022, 0.04, 0.03]} />
      <P g="sphere" c={skin} p={[0.162, 0, 0]} s={[0.02, 0.045, 0.03]} />
      <P g="sphere" c={skin} p={[-0.162, 0, 0]} s={[0.02, 0.045, 0.03]} />
      <Eye x={0.065} y={0.035} z={0.15} /><Eye x={-0.065} y={0.035} z={0.15} />
      <P g="box" c={hair ?? '#1c1c24'} p={[0.065, 0.088 + (e === 'joy' ? 0.012 : 0), 0.15]} r={[0, 0, t]} s={[0.07, 0.014, 0.014]} />
      <P g="box" c={hair ?? '#1c1c24'} p={[-0.065, 0.088 + (e === 'joy' ? 0.012 : 0), 0.15]} r={[0, 0, -t]} s={[0.07, 0.014, 0.014]} />
      <P g="box" c="#7a3a2a" p={[0, -0.095, 0.155]} s={[mouthW(e), e === 'joy' ? 0.016 : 0.01, 0.012]} r={[0, 0, e === 'sad' ? 0 : 0]} />
      {hair && wigOn && def.body !== 'child' && (
        <>
          <P g="hemi" c={hair} p={[0, 0.045, -0.005]} s={[0.185, 0.17, 0.2]} />
          <P g="box" c={hair} p={[0, -0.1, -0.1]} s={[0.22, 0.34, 0.12]} />
          {(def.body === 'female' || def.crown) && <>
            <P g="box" c={hair} p={[0.178, -0.17, 0.02]} s={[0.05, 0.3, 0.11]} />
            <P g="box" c={hair} p={[-0.178, -0.17, 0.02]} s={[0.05, 0.3, 0.11]} />
          </>}
          <P g="box" c={def.accent} p={[0, 0.095, 0.16]} s={[0.17, 0.012, 0.02]} r={[0.5, 0, 0]} />
        </>
      )}
      {def.body === 'child' && <P g="hemi" c={hair ?? '#111'} p={[0, 0.05, -0.01]} s={[0.17, 0.12, 0.18]} />}
      {def.sidelock && <><P g="cyl" c="#17171f" p={[-0.18, -0.08, 0.02]} s={[0.025, 0.2, 0.03]} r={[0, 0, 0.1]} /><P g="sphere" c="#17171f" p={[-0.2, -0.2, 0.02]} s={0.035} /></>}
      {def.beard && <>
        <P g="box" c={def.beard} p={[0, -0.215, 0.14]} s={[0.04, 0.16, 0.04]} r={[-0.12, 0, 0]} />
        <P g="box" c={def.beard} p={[0, -0.28, 0.125]} s={[0.05, 0.03, 0.05]} r={[-0.12, 0, 0]} />
      </>}
    </group>
  );
}

function Falcon({ def, color }: { def: GodDef; color: string }) {
  const hair = def.hair ?? '#1a2a5a';
  return (
    <group>
      <P g="sphere" c={color} s={[0.14, 0.15, 0.16]} cast />
      <P g="cone" c="#e0b020" p={[0, -0.025, 0.2]} s={[0.055, 0.15, 0.055]} r={[Math.PI / 2 + 0.3, 0, 0]} />
      <P g="cone" c="#cfa010" p={[0, -0.085, 0.265]} s={[0.04, 0.07, 0.04]} r={[Math.PI + 0.15, 0, 0]} />
      <P g="box" c="#3a2a10" p={[0, -0.04, 0.255]} s={[0.05, 0.008, 0.1]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="sphere" c="#e8b020" p={[s * 0.085, 0.04, 0.095]} s={0.03} />
          <P g="sphere" c="#0a0806" p={[s * 0.097, 0.04, 0.115]} s={0.014} />
          <P g="box" c="#0c0a08" p={[s * 0.1, -0.025, 0.1]} s={[0.012, 0.09, 0.012]} r={[0.2, 0, s * -0.4]} />
          <P g="box" c="#0c0a08" p={[s * 0.13, 0.04, 0.03]} s={[0.012, 0.012, 0.15]} />
          <P g="box" c={hair} p={[s * 0.17, -0.16, 0.0]} s={[0.05, 0.3, 0.1]} />
        </group>
      ))}
      <P g="hemi" c={hair} p={[0, 0.07, -0.03]} s={[0.15, 0.1, 0.16]} />
      <P g="box" c={hair} p={[0, -0.12, -0.1]} s={[0.22, 0.34, 0.12]} />
    </group>
  );
}

function Jackal({ def, color, wolf }: { def: GodDef; color: string; wolf?: boolean }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.125, 0.14, 0.15]} cast />
      <P g="cone" c={color} p={[0, -0.03, 0.25]} s={[0.075, 0.33, 0.06]} r={[Math.PI / 2, 0, 0]} />
      <P g="sphere" c="#050505" p={[0, -0.02, 0.41]} s={0.032} />
      <P g="box" c={wolf ? '#d8d8e0' : '#2a2a30'} p={[0, -0.055, 0.25]} s={[0.07, 0.008, 0.28]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="cone" c={color} p={[s * 0.07, 0.24, -0.02]} s={[0.055, 0.28, 0.035]} r={[0, 0, s * -0.12]} />
          <P g="cone" c={wolf ? '#bba' : '#3a2a34'} p={[s * 0.07, 0.22, 0.0]} s={[0.03, 0.2, 0.02]} r={[0, 0, s * -0.12]} />
          <P g="sphere" c="#e8b030" p={[s * 0.07, 0.04, 0.115]} s={0.022} />
          <P g="sphere" c="#050505" p={[s * 0.074, 0.04, 0.133]} s={0.012} />
          <P g="box" c="#0c0a08" p={[s * 0.1, 0.045, 0.1]} s={[0.05, 0.008, 0.01]} />
        </group>
      ))}
      <P g="box" c={def.hair ?? '#0c0c10'} p={[0, -0.12, -0.1]} s={[0.2, 0.34, 0.12]} />
      <P g="box" c={def.hair ?? '#0c0c10'} p={[0.15, -0.14, 0.0]} s={[0.04, 0.28, 0.1]} />
      <P g="box" c={def.hair ?? '#0c0c10'} p={[-0.15, -0.14, 0.0]} s={[0.04, 0.28, 0.1]} />
    </group>
  );
}

function Ibis({ def, color }: { def: GodDef; color: string }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.12, 0.14, 0.14]} cast />
      <P g="beak" c="#1c1c24" p={[0, 0.02, 0.1]} s={[0.55, 0.55, 0.62]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="sphere" c="#e8b030" p={[s * 0.075, 0.045, 0.08]} s={0.022} />
          <P g="sphere" c="#050505" p={[s * 0.082, 0.045, 0.097]} s={0.011} />
          <P g="box" c="#0c0a08" p={[s * 0.1, 0.05, 0.06]} s={[0.01, 0.01, 0.1]} />
        </group>
      ))}
      <P g="box" c={def.hair ?? '#17171f'} p={[0, -0.1, -0.09]} s={[0.2, 0.32, 0.11]} />
      <P g="box" c={def.hair ?? '#17171f'} p={[0.135, -0.13, 0.0]} s={[0.04, 0.27, 0.09]} />
      <P g="box" c={def.hair ?? '#17171f'} p={[-0.135, -0.13, 0.0]} s={[0.04, 0.27, 0.09]} />
    </group>
  );
}

function Cat({ def, color, lion, e }: { def: GodDef; color: string; lion?: boolean; e: Emote }) {
  const hair = def.hair ?? '#2a1a10';
  const t = browTilt(e);
  return (
    <group>
      <P g="sphere" c={color} s={[0.165, 0.15, 0.17]} cast />
      <P g="sphere" c={lion ? '#d6ac62' : '#d8b080'} p={[0, -0.05, 0.14]} s={[0.09, 0.07, 0.1]} />
      <P g="sphere" c="#3a1a1a" p={[0, -0.01, 0.235]} s={[0.032, 0.022, 0.02]} />
      <P g="box" c="#2a1010" p={[0, -0.085, 0.215]} s={[0.07 * (e === 'angry' ? 1.4 : 1), 0.008, 0.01]} />
      {e === 'angry' && <><P g="cone" c="#fff" p={[0.025, -0.1, 0.225]} s={[0.008, 0.03, 0.008]} r={[Math.PI, 0, 0]} /><P g="cone" c="#fff" p={[-0.025, -0.1, 0.225]} s={[0.008, 0.03, 0.008]} r={[Math.PI, 0, 0]} /></>}
      {[1, -1].map((s) => (
        <group key={s}>
          {lion ? <P g="sphere" c={color} p={[s * 0.12, 0.15, -0.02]} s={0.05} /> : <P g="cone" c={color} p={[s * 0.1, 0.19, -0.01]} s={[0.06, 0.15, 0.03]} r={[0, 0, s * -0.2]} />}
          <P g="sphere" c="#d8b020" p={[s * 0.07, 0.04, 0.14]} s={[0.026, 0.02, 0.016]} />
          <P g="sphere" c="#050505" p={[s * 0.07, 0.04, 0.153]} s={[0.006, 0.016, 0.008]} />
          <P g="box" c="#0c0a08" p={[s * 0.105, 0.045, 0.13]} s={[0.05, 0.008, 0.01]} />
          <P g="box" c="#1c1008" p={[s * 0.07, 0.085, 0.145]} r={[0, 0, s * t]} s={[0.05, 0.01, 0.01]} />
        </group>
      ))}
      <P g="hemi" c={hair} p={[0, 0.07, -0.02]} s={[0.17, 0.1, 0.18]} />
      <P g="box" c={hair} p={[0, -0.12, -0.11]} s={[0.23, 0.34, 0.12]} />
      <P g="box" c={hair} p={[0.178, -0.17, 0.02]} s={[0.05, 0.3, 0.11]} />
      <P g="box" c={hair} p={[-0.178, -0.17, 0.02]} s={[0.05, 0.3, 0.11]} />
    </group>
  );
}

function Croc({ color, def }: { color: string; def: GodDef }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.135, 0.12, 0.16]} cast />
      <P g="box" c={color} p={[0, -0.03, 0.3]} s={[0.12, 0.05, 0.36]} />
      <P g="box" c="#c9c2a0" p={[0, -0.085, 0.3]} s={[0.1, 0.035, 0.34]} />
      <P g="box" c="#f4efe0" p={[0, -0.062, 0.3]} s={[0.11, 0.006, 0.35]} />
      <P g="sphere" c="#2a3a22" p={[0, 0.0, 0.48]} s={[0.05, 0.03, 0.03]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="sphere" c={color} p={[s * 0.07, 0.085, 0.1]} s={0.035} />
          <P g="sphere" c="#e8c030" p={[s * 0.07, 0.095, 0.12]} s={0.02} />
          <P g="sphere" c="#050505" p={[s * 0.07, 0.097, 0.135]} s={[0.005, 0.016, 0.006]} />
        </group>
      ))}
      <P g="box" c={def.hair ?? '#1a3a2a'} p={[0, -0.12, -0.1]} s={[0.22, 0.34, 0.12]} />
      <P g="box" c={def.hair ?? '#1a3a2a'} p={[0.15, -0.14, 0.0]} s={[0.04, 0.28, 0.1]} />
      <P g="box" c={def.hair ?? '#1a3a2a'} p={[-0.15, -0.14, 0.0]} s={[0.04, 0.28, 0.1]} />
    </group>
  );
}

function Ram({ color, def }: { color: string; def: GodDef }) {
  const horn = '#8a7a56';
  return (
    <group>
      <P g="sphere" c={color} s={[0.135, 0.155, 0.16]} cast />
      <P g="sphere" c={color} p={[0, -0.055, 0.16]} s={[0.085, 0.1, 0.14]} />
      <P g="sphere" c="#3a2a28" p={[0, -0.04, 0.29]} s={[0.04, 0.03, 0.02]} />
      <P g="box" c="#2a1a14" p={[0, -0.11, 0.25]} s={[0.07, 0.008, 0.01]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <group position={[s * 0.1, 0.04, 0.0]} rotation={[0, s * Math.PI / 2, 0]}>
            <P g="arc" c={horn} s={[0.17, 0.17, 0.17]} r={[Math.PI / 2, 0, 0]} />
          </group>
          <P g="cone" c={horn} p={[s * 0.25, 0.04, 0.15]} s={[0.035, 0.1, 0.035]} r={[Math.PI / 2, 0, s * Math.PI / 2 * 0 + 0]} />
          <P g="sphere" c={color} p={[s * 0.15, 0.04, -0.07]} s={[0.05, 0.03, 0.06]} />
          <P g="sphere" c="#d8c040" p={[s * 0.07, 0.05, 0.12]} s={[0.022, 0.016, 0.016]} />
          <P g="sphere" c="#050505" p={[s * 0.072, 0.05, 0.132]} s={[0.006, 0.014, 0.006]} />
        </group>
      ))}
      <P g="box" c={def.hair ?? '#1a2a5a'} p={[0, -0.12, -0.1]} s={[0.2, 0.34, 0.12]} />
    </group>
  );
}

function SetHead({ color, def, e }: { color: string; def: GodDef; e: Emote }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.135, 0.145, 0.15]} cast />
      <P g="snout" c={color} p={[0, 0.01, 0.1]} s={[0.42, 0.42, 0.34]} r={[0.25, 0, 0]} />
      <P g="sphere" c="#2a0a0a" p={[0, -0.12, 0.43]} s={0.03} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="box" c={color} p={[s * 0.085, 0.25, -0.03]} s={[0.075, 0.27, 0.02]} r={[0, 0, s * -0.17]} />
          <P g="box" c="#6a2a1a" p={[s * 0.085, 0.25, -0.01]} s={[0.04, 0.2, 0.01]} r={[0, 0, s * -0.17]} />
          <P g="sphere" c="#ff3a2a" p={[s * 0.07, 0.05, 0.11]} s={0.022} e={0.6} />
          <P g="sphere" c="#050505" p={[s * 0.074, 0.05, 0.128]} s={[0.008, 0.014, 0.008]} />
          <P g="box" c="#0c0a08" p={[s * 0.07, 0.085, 0.12]} r={[0, 0, s * (e === 'angry' ? 0.5 : 0.2)]} s={[0.06, 0.012, 0.01]} />
        </group>
      ))}
      <P g="box" c={def.hair ?? '#5a2a1a'} p={[0, -0.1, -0.1]} s={[0.2, 0.3, 0.1]} />
    </group>
  );
}

function Frog({ color }: { color: string }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.2, 0.1, 0.17]} p={[0, -0.02, 0.02]} cast />
      <P g="box" c="#1a2a2a" p={[0, -0.06, 0.15]} s={[0.26, 0.012, 0.02]} />
      <P g="sphere" c="#c8d8a0" p={[0, -0.09, 0.05]} s={[0.15, 0.04, 0.12]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="sphere" c={color} p={[s * 0.1, 0.08, 0.07]} s={0.05} />
          <P g="sphere" c="#e8d040" p={[s * 0.1, 0.095, 0.105]} s={0.032} />
          <P g="sphere" c="#050505" p={[s * 0.1, 0.098, 0.133]} s={[0.006, 0.02, 0.006]} />
        </group>
      ))}
    </group>
  );
}

function Snake({ color, def }: { color: string; def: GodDef }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.1, 0.085, 0.17]} p={[0, 0, 0.04]} cast />
      <P g="sphere" c={color} p={[0, -0.02, 0.19]} s={[0.07, 0.05, 0.08]} />
      <P g="box" c="#b02a1a" p={[0, -0.055, 0.3]} s={[0.012, 0.006, 0.08]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="sphere" c="#e8d040" p={[s * 0.065, 0.035, 0.12]} s={0.02} />
          <P g="sphere" c="#050505" p={[s * 0.07, 0.036, 0.135]} s={[0.005, 0.014, 0.006]} />
        </group>
      ))}
      <P g="box" c={def.hair ?? '#10202a'} p={[0, -0.12, -0.1]} s={[0.2, 0.34, 0.12]} />
      <P g="box" c={def.hair ?? '#10202a'} p={[0.14, -0.14, 0.0]} s={[0.04, 0.28, 0.1]} />
      <P g="box" c={def.hair ?? '#10202a'} p={[-0.14, -0.14, 0.0]} s={[0.04, 0.28, 0.1]} />
    </group>
  );
}

function Cobra({ color, def }: { color: string; def: GodDef }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.1, 0.1, 0.14]} cast />
      <P g="cyl" c={color} p={[0, -0.02, -0.04]} s={[0.2, 0.02, 0.24]} r={[Math.PI / 2, 0, 0]} />
      <P g="sphere" c="#d8d090" p={[0, -0.06, 0.1]} s={[0.07, 0.03, 0.07]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="sphere" c="#e8d040" p={[s * 0.06, 0.03, 0.1]} s={0.02} />
          <P g="sphere" c="#050505" p={[s * 0.065, 0.032, 0.115]} s={[0.005, 0.014, 0.006]} />
        </group>
      ))}
      <P g="box" c="#b02a1a" p={[0, -0.075, 0.2]} s={[0.012, 0.006, 0.07]} />
      <P g="box" c={def.hair ?? '#1a2a1a'} p={[0, -0.12, -0.12]} s={[0.2, 0.34, 0.1]} />
    </group>
  );
}

function Scarab({ color }: { color: string }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.17, 0.11, 0.2]} p={[0, 0, 0.0]} cast metal={0.5} rough={0.25} />
      <P g="sphere" c="#1a3a6a" s={[0.12, 0.08, 0.1]} p={[0, 0.0, 0.17]} metal={0.4} rough={0.3} />
      <P g="box" c="#0a1a3a" p={[0, 0.1, -0.02]} s={[0.012, 0.01, 0.36]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="cone" c="#0a1a3a" p={[s * 0.05, 0.02, 0.28]} s={[0.025, 0.1, 0.025]} r={[Math.PI / 2, 0, s * 0.4]} />
          <P g="sphere" c="#e8c040" p={[s * 0.08, 0.04, 0.2]} s={0.02} e={0.5} />
          {[0.0, -0.1, -0.2].map((z, i) => <P key={i} g="cyl" c="#0a1a3a" p={[s * 0.17, -0.07, z]} s={[0.012, 0.1, 0.012]} r={[0, 0, s * -0.9]} />)}
        </group>
      ))}
    </group>
  );
}

function Hippo({ color, def }: { color: string; def: GodDef }) {
  return (
    <group>
      <P g="sphere" c={color} s={[0.2, 0.17, 0.2]} cast />
      <P g="sphere" c={color} p={[0, -0.07, 0.17]} s={[0.17, 0.11, 0.18]} />
      <P g="sphere" c="#9aa6c0" p={[0, -0.1, 0.25]} s={[0.12, 0.05, 0.09]} />
      <P g="box" c="#1a1a28" p={[0, -0.12, 0.3]} s={[0.2, 0.012, 0.02]} />
      {[1, -1].map((s) => (
        <group key={s}>
          <P g="sphere" c="#2a2a38" p={[s * 0.06, -0.03, 0.34]} s={0.016} />
          <P g="sphere" c={color} p={[s * 0.09, 0.12, 0.12]} s={0.04} />
          <P g="sphere" c="#e8d8a0" p={[s * 0.09, 0.07, 0.14]} s={0.026} />
          <P g="sphere" c="#050505" p={[s * 0.092, 0.07, 0.162]} s={0.012} />
          <P g="cone" c={color} p={[s * 0.18, 0.15, -0.02]} s={[0.035, 0.07, 0.03]} />
          <P g="cone" c="#f4efe0" p={[s * 0.07, -0.16, 0.28]} s={[0.014, 0.05, 0.014]} r={[Math.PI, 0, 0]} />
        </group>
      ))}
      <P g="box" c={def.hair ?? '#17171f'} p={[0, -0.1, -0.12]} s={[0.26, 0.34, 0.12]} />
    </group>
  );
}

export function Head({ def, emote, skin }: { def: GodDef; emote: Emote; skin: string }) {
  const hc = def.tint === 'skin' ? skin : def.headColor ?? skin;
  switch (def.head) {
    case 'human': return <HumanHead def={def} e={emote} skin={skin} scale={def.body === 'child' ? 1.35 : 1} />;
    case 'falcon': return <Falcon def={def} color={hc} />;
    case 'jackal': return <Jackal def={def} color={hc} />;
    case 'wolf': return <Jackal def={def} color={hc} wolf />;
    case 'ibis': return <Ibis def={def} color={hc} />;
    case 'lion': return <Cat def={def} color={hc} lion e={emote} />;
    case 'cat': return <Cat def={def} color={hc} e={emote} />;
    case 'croc': return <Croc def={def} color={hc} />;
    case 'ram': return <Ram def={def} color={hc} />;
    case 'set': return <SetHead def={def} color={hc} e={emote} />;
    case 'frog': return <Frog color={hc} />;
    case 'snake': return <Snake def={def} color={hc} />;
    case 'cobra': return <Cobra def={def} color={hc} />;
    case 'scarab': return <Scarab color={hc} />;
    case 'hippo': return <Hippo def={def} color={hc} />;
  }
}
