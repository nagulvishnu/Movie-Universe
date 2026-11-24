import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clock } from '../film/clock';
import type { Anim, Emote, GodId } from '../film/types';
import { P } from '../render/prim';
import { Head } from './heads';
import { Crown, Item } from './regalia';
import { GODS, type BodyKind, type GodDef, type ItemKind } from './registry';

// ---------- Pose system ----------
interface Pose { lx: number; lz: number; le: number; rx: number; rz: number; re: number; leg: number; ls: number; y: number; lean: number; hy: number; hx: number; wing: number; lie: number; bob: number }
const BASE: Pose = { lx: 0.04, lz: 0.14, le: -0.28, rx: 0.04, rz: 0.14, re: -0.28, leg: 0, ls: 0, y: 0, lean: 0, hy: 0, hx: 0, wing: 0.05, lie: 0, bob: 0.008 };
const S = Math.sin;

function poseFor(a: Anim, t: number): Pose {
  const p = { ...BASE, lx: BASE.lx + S(t * 1.5) * 0.015, rx: BASE.rx + S(t * 1.5 + 1) * 0.015, hy: S(t * 0.5) * 0.06 };
  switch (a) {
    case 'walk': return { ...p, lx: S(t * 5) * 0.6, rx: -S(t * 5) * 0.6, leg: 0.55, ls: 5, bob: 0.03, lean: 0.04, hy: 0 };
    case 'stride': return { ...p, lx: S(t * 6) * 0.8, rx: -S(t * 6) * 0.8, lz: 0.3, rz: 0.3, leg: 0.7, ls: 6, bob: 0.045, lean: 0.14, hy: 0 };
    case 'raise': return { ...p, lx: -2.7 + S(t * 1.2) * 0.08, rx: -2.7 + S(t * 1.2 + 1) * 0.08, lz: 0.35, rz: 0.35, le: -0.1, re: -0.1, hx: -0.18, wing: 0.9 };
    case 'cheer': return { ...p, lx: -2.6 + S(t * 6) * 0.3, rx: -2.6 + S(t * 6 + 2) * 0.3, lz: 0.4, rz: 0.4, le: -0.2, re: -0.2, bob: 0.06, wing: 0.5 };
    case 'point': return { ...p, rx: -1.55, rz: 0.1, re: -0.05, hy: 0.12 };
    case 'present': return { ...p, rx: -1.05 + S(t * 1.1) * 0.06, rz: 0.55, re: -0.5, lx: -0.5, lz: 0.2, le: -0.9, hy: S(t * 0.6) * 0.12 };
    case 'fight':
    case 'strike': return { ...p, rx: -2.9 + (S(t * 4) + 1) * 1.1, rz: 0.2, re: -0.4, lx: -1.2, lz: 0.35, le: -1.0, lean: 0.22, hx: 0.1, leg: 0.25, ls: 4 };
    case 'mourn': return { ...p, lx: -1.9, rx: -1.9, lz: 0.05, rz: 0.05, le: -2.1, re: -2.1, hx: 0.4, lean: 0.08, wing: 0.8 + S(t * 1.4) * 0.1 };
    case 'pray': return { ...p, lx: -1.15, rx: -1.15, lz: -0.05, rz: -0.05, le: -1.5, re: -1.5, hx: 0.3 };
    case 'cast': return { ...p, lx: -1.45, rx: -1.45, lz: 0.3, rz: 0.3, le: -0.15 + S(t * 3) * 0.05, re: -0.15 + S(t * 3 + 1) * 0.05, wing: 0.85, hx: -0.05 };
    case 'carry': return { ...p, lx: -0.95, rx: -0.95, lz: 0.02, rz: 0.02, le: -1.5, re: -1.5, hx: 0.3 };
    case 'bow': return { ...p, lean: 0.55, hx: 0.3, lx: -0.2, rx: -0.2 };
    case 'sit': return { ...p, y: -0.46, leg: -1.45, lx: -0.55, rx: -0.55, le: -0.8, re: -0.8 };
    case 'kneel': return { ...p, y: -0.42, leg: 0.28, lean: 0.12, lx: -0.5, rx: -0.5, le: -1.0, re: -1.0, hx: 0.3 };
    case 'crouch': return { ...p, y: -0.35, leg: -0.4, lean: 0.35 };
    case 'float': return { ...p, y: 0.35 + S(t * 1.4) * 0.12, lz: 0.55, rz: 0.55, lx: -0.3, rx: -0.3, wing: 0.55 };
    case 'rest': return { ...p, lie: -Math.PI / 2, lx: 0.05, rx: 0.05, lz: 0.1, rz: 0.1, le: -0.2, re: -0.2, hy: 0 };
    default: return p;
  }
}

const HOLD: Record<ItemKind, number> = { ankh: 1, was: 1, staff: 1, crook: 1, flail: 1, spear: 0.85, bow: 1, knife: 0.7, scroll: 0, sistrum: 1, torch: 1, sa: 1 };

// ---------- Body dimensions ----------
interface Dim { hipY: number; shY: number; headY: number; shX: number; legR: number; torsoW: number }
const dims = (b: BodyKind): Dim => {
  switch (b) {
    case 'female': return { hipY: 0.88, shY: 1.4, headY: 1.68, shX: 0.255, legR: 0.07, torsoW: 0.22 };
    case 'dwarf': return { hipY: 0.5, shY: 1.0, headY: 1.3, shX: 0.36, legR: 0.1, torsoW: 0.36 };
    case 'beast': return { hipY: 0.62, shY: 1.3, headY: 1.58, shX: 0.36, legR: 0.12, torsoW: 0.4 };
    case 'child': return { hipY: 0.8, shY: 1.3, headY: 1.6, shX: 0.27, legR: 0.07, torsoW: 0.25 };
    case 'mummy': return { hipY: 0.9, shY: 1.45, headY: 1.72, shX: 0.27, legR: 0.07, torsoW: 0.26 };
    default: return { hipY: 0.88, shY: 1.42, headY: 1.7, shX: 0.3, legR: 0.075, torsoW: 0.27 };
  }
};

function Wing({ side, def, refs }: { side: 1 | -1; def: GodDef; refs: React.MutableRefObject<THREE.Group[]> }) {
  return (
    <group position={[side * 0.2, 1.38, -0.14]} rotation={[0.25, 0, 0]}>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const L = 1.0 - k * 0.085;
        return (
          <group key={k} ref={(g) => { if (g) refs.current[(side === 1 ? 0 : 6) + k] = g; }}>
            <P g="box" c={k % 2 ? def.cloth : def.accent} p={[0, -L / 2, -k * 0.004]} s={[0.15, L, 0.016]} metal={k % 2 ? 0 : 0.5} rough={0.5} />
          </group>
        );
      })}
    </group>
  );
}

export interface GodProps { id: GodId; anim?: Anim; emote?: Emote; aura?: string; tint?: string }

export function God({ id, anim = 'idle', emote = 'calm', aura, tint }: GodProps) {
  const def = GODS[id];
  const D = dims(def.body);
  const skin = tint && def.tint === 'skin' ? tint : def.skin;
  const cloth = tint && def.tint === 'cloth' ? tint : def.cloth;
  const phase = useMemo(() => Math.random() * 20, []);
  const lieRef = useRef<THREE.Group>(null!), bodyRef = useRef<THREE.Group>(null!), headRef = useRef<THREE.Group>(null!);
  const aL = useRef<THREE.Group>(null!), aR = useRef<THREE.Group>(null!), eL = useRef<THREE.Group>(null!), eR = useRef<THREE.Group>(null!);
  const lL = useRef<THREE.Group>(null!), lR = useRef<THREE.Group>(null!), iL = useRef<THREE.Group>(null!), iR = useRef<THREE.Group>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const wings = useRef<THREE.Group[]>([]);
  const cur = useRef<Pose>({ ...BASE });
  const isMummy = def.body === 'mummy';
  const female = def.body === 'female';
  const legH = D.hipY;

  useFrame((_, dt) => {
    const t = clock.animT + phase;
    const tgt = poseFor(anim, t);
    const c = cur.current;
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 7);
    (Object.keys(tgt) as (keyof Pose)[]).forEach((key) => { c[key] += (tgt[key] - c[key]) * k; });
    const bob = Math.abs(S(t * (c.ls || 1.5))) * c.bob * (c.ls ? 1 : 0.5);
    lieRef.current.rotation.x = c.lie;
    bodyRef.current.position.y = c.y + bob;
    bodyRef.current.rotation.x = c.lean;
    headRef.current.rotation.y = c.hy;
    headRef.current.rotation.x = c.hx;
    if (aL.current) {
      aL.current.rotation.set(c.lx, 0, c.lz);
      aR.current.rotation.set(c.rx, 0, -c.rz);
      eL.current.rotation.x = c.le;
      eR.current.rotation.x = c.re;
      if (iL.current) { const h = HOLD[def.l ?? 'ankh']; iL.current.rotation.set(-(c.lx + c.le) * h, 0, -c.lz * h); }
      if (iR.current) { const h = HOLD[def.r ?? 'ankh']; iR.current.rotation.set(-(c.rx + c.re) * h, 0, c.rz * h); }
    }
    if (lL.current) {
      const sw = Math.sin(t * c.ls) * c.leg;
      lL.current.rotation.x = c.ls ? sw : c.leg;
      lR.current.rotation.x = c.ls ? -sw : c.leg;
    }
    wings.current.forEach((g, i) => {
      if (!g) return;
      const kk = i % 6, side = i < 6 ? 1 : -1;
      g.rotation.z = side * (0.08 + c.wing * (0.28 + kk * 0.27) + S(t * 2 + kk) * 0.015 * (1 + c.wing));
    });
    if (auraRef.current) { const s = 1 + S(t * 1.7) * 0.05; auraRef.current.scale.set(0.75 * s, 1.15 * s, 0.6 * s); }
  });

  const gold = def.accent;
  const torsoH = D.shY + 0.06 - D.hipY;
  const showArms = !isMummy;
  const wide = def.body === 'dwarf' ? 1.3 : 1;

  return (
    <group>
      <group ref={lieRef}>
        <group ref={bodyRef}>
          {/* ---- Lower body ---- */}
          {!isMummy && !female && (
            <>
              {[1, -1].map((s) => (
                <group key={s} ref={s === 1 ? lL : lR} position={[s * D.legR * 1.3, D.hipY, 0]}>
                  <P g="cyl" c={skin} p={[0, -legH / 2, 0]} s={[D.legR, legH, D.legR]} cast />
                  <P g="box" c={skin} p={[0, -legH + 0.03, 0.05]} s={[D.legR * 0.95, 0.045, 0.13]} />
                  <P g="cyl" c={gold} p={[0, -legH + 0.1, 0]} s={[D.legR * 1.12, 0.018, D.legR * 1.12]} metal={0.7} />
                </group>
              ))}
              {def.body !== 'beast' && (
                <>
                  <P g="tcone" c={cloth} p={[0, D.hipY - 0.2, 0]} s={[0.34 * wide, 0.5, 0.26 * wide]} cast />
                  <P g="cyl" c={gold} p={[0, D.hipY + 0.03, 0]} s={[0.25 * wide, 0.05, 0.2 * wide]} metal={0.7} rough={0.35} />
                  <P g="box" c={gold} p={[0, D.hipY - 0.26, 0.255 * wide]} s={[0.13, 0.32, 0.02]} metal={0.6} />
                </>
              )}
            </>
          )}
          {female && (
            <>
              <group ref={lL} /><group ref={lR} />
              <P g="tcone" c={cloth} p={[0, 0.64, 0]} s={[0.29, 1.2, 0.2]} cast />
              <P g="cyl" c={gold} p={[0, 0.06, 0]} s={[0.295, 0.025, 0.205]} metal={0.7} />
              <P g="cyl" c={gold} p={[0, 0.98, 0]} s={[0.215, 0.04, 0.155]} metal={0.7} />
              {def.leopard && Array.from({ length: 16 }).map((_, i) => {
                const y = 0.15 + ((i * 0.37) % 1) * 0.95, th = (((i * 37) % 11) - 5) / 6.2, r = 0.29 - 0.087 * ((y - 0.04) / 1.2);
                return <P key={i} g="sphere" c="#3a2410" p={[Math.sin(th) * r, y, Math.cos(th) * r * 0.69]} s={[0.03, 0.03, 0.01]} r={[0, th, 0]} />;
              })}
            </>
          )}
          {isMummy && (
            <>
              <group ref={lL} /><group ref={lR} />
              <P g="tcone" c={cloth} p={[0, 0.52, 0]} s={[0.21, 1.0, 0.17]} cast />
              <P g="tcone" c={cloth} p={[0, 1.2, 0]} s={[0.265, 0.62, 0.19]} r={[Math.PI, 0, 0]} cast />
              {[0.25, 0.5, 0.75, 1.0, 1.2, 1.38].map((y, i) => <P key={i} g="torus" c="#cfc4a4" p={[0, y, 0]} s={[0.22 - (y > 0.95 ? 0 : 0.01), 0.175, 0.3]} r={[Math.PI / 2, 0, 0]} rough={1} />)}
              <P g="cyl" c={skin} p={[0, 0.02, 0.04]} s={[0.12, 0.03, 0.13]} />
            </>
          )}
          {def.body === 'beast' && (
            <>
              <P g="sphere" c={def.skin} p={[0, 1.0, 0.04]} s={[0.46, 0.62, 0.44]} cast />
              <P g="sphere" c="#a8b4cc" p={[0, 0.86, 0.22]} s={[0.34, 0.42, 0.28]} />
              {[1, -1].map((s) => <P key={s} g="sphere" c={def.skin} p={[s * 0.2, 1.2, 0.34]} s={[0.13, 0.17, 0.12]} />)}
              <P g="cone" c="#4a7a50" p={[0, 0.7, -0.5]} s={[0.1, 0.8, 0.1]} r={[-1.3, 0, 0]} />
              <P g="cyl" c={gold} p={[0, 1.4, 0]} s={[0.4, 0.04, 0.34]} metal={0.7} />
            </>
          )}
          {def.body === 'child' && <P g="tcone" c={cloth} p={[0, D.hipY - 0.04, 0]} s={[0.2, 0.2, 0.15]} />}

          {/* ---- Torso ---- */}
          {!isMummy && def.body !== 'beast' && (
            <P g="tcone" c={female ? skin : skin} p={[0, D.hipY + torsoH / 2, 0]} s={[D.torsoW, torsoH, D.torsoW * 0.7]} r={[Math.PI, 0, 0]} cast />
          )}
          {female && [1, -1].map((s) => <P key={s} g="box" c={cloth} p={[s * 0.1, 1.28, 0.09]} s={[0.055, 0.34, 0.035]} r={[0.1, 0, s * -0.15]} />)}
          {/* usekh collar */}
          {def.body !== 'beast' && (
            <>
              <P g="tcone" c={gold} p={[0, D.shY + 0.01, 0.01]} s={[D.torsoW * 1.2, 0.08, D.torsoW * 0.85]} metal={0.75} rough={0.3} />
              <P g="torus" c="#2a6ab0" p={[0, D.shY + 0.0, 0.05]} s={[D.torsoW * 0.98, D.torsoW * 0.7, 0.4]} r={[Math.PI / 2, 0, 0]} />
            </>
          )}
          <P g="cyl" c={skin} p={[0, D.shY + 0.1, 0]} s={[0.06, 0.1, 0.06]} />

          {/* ---- Arms ---- */}
          {showArms && [1, -1].map((s) => {
            const left = s === 1;
            const item = left ? def.l : def.r;
            return (
              <group key={s} ref={left ? aL : aR} position={[s * D.shX, D.shY, 0]}>
                <P g="sphere" c={skin} s={0.065} />
                <P g="cyl" c={skin} p={[0, -0.17, 0]} s={[0.052 * wide, 0.34, 0.052 * wide]} cast />
                <P g="cyl" c={gold} p={[0, -0.1, 0]} s={[0.06 * wide, 0.03, 0.06 * wide]} metal={0.7} />
                <group ref={left ? eL : eR} position={[0, -0.34, 0]}>
                  <P g="cyl" c={skin} p={[0, -0.15, 0]} s={[0.046 * wide, 0.3, 0.046 * wide]} cast />
                  <P g="cyl" c={gold} p={[0, -0.27, 0]} s={[0.052 * wide, 0.025, 0.052 * wide]} metal={0.7} />
                  <P g="sphere" c={skin} p={[0, -0.32, 0.01]} s={0.052} />
                  {item && <group position={[0, -0.32, 0.01]} ref={left ? iL : iR}><Item kind={item} accent={gold} /></group>}
                </group>
              </group>
            );
          })}
          {isMummy && (
            <>
              <P g="sphere" c={skin} p={[0.1, 1.28, 0.2]} s={0.05} /><P g="sphere" c={skin} p={[-0.1, 1.28, 0.2]} s={0.05} />
              <P g="cyl" c={cloth} p={[0.1, 1.3, 0.17]} s={[0.05, 0.25, 0.05]} r={[0.2, 0, 0.9]} /><P g="cyl" c={cloth} p={[-0.1, 1.3, 0.17]} s={[0.05, 0.25, 0.05]} r={[0.2, 0, -0.9]} />
              {def.r === 'was' ? (
                <group position={[0, 0.85, 0.24]}><Item kind="was" accent={gold} /></group>
              ) : def.raised ? (
                <group position={[-0.3, 1.45, 0.05]}>
                  <P g="cyl" c={skin} p={[-0.02, 0.18, 0]} s={[0.05, 0.36, 0.05]} r={[0, 0, 0.1]} /><P g="sphere" c={skin} p={[-0.04, 0.37, 0]} s={0.055} />
                  <group position={[-0.04, 0.36, 0.02]}><Item kind="flail" accent={gold} /></group>
                </group>
              ) : (
                <>
                  <group position={[0.1, 1.05, 0.22]} rotation={[0, 0, -0.35]}><Item kind="crook" accent={gold} /></group>
                  <group position={[-0.1, 1.05, 0.22]} rotation={[0, 0, 0.35]}><Item kind="flail" accent={gold} /></group>
                </>
              )}
              {def.beard === undefined && null}
            </>
          )}

          {/* ---- Wings ---- */}
          {def.wings && (<><Wing side={1} def={def} refs={wings} /><Wing side={-1} def={def} refs={wings} /></>)}

          {/* ---- Head ---- */}
          <group ref={headRef} position={[0, D.headY, 0]}>
            <Head def={def} emote={emote} skin={skin} />
            {def.crown && <Crown kind={def.crown} def={def} />}
            {def.body === 'dwarf' && <DwarfMane />}
          </group>
          {def.body === 'dwarf' && (
            <>
              <P g="cone" c="#8a5a2a" p={[0, 0.5, -0.3]} s={[0.07, 0.6, 0.07]} r={[-0.9, 0, 0]} />
            </>
          )}
        </group>
      </group>
      {aura && <mesh ref={auraRef} position={[0, 1.0, 0]}><sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial color={aura} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>}
    </group>
  );
}

function DwarfMane() {
  return (
    <group>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <P key={i} g="sphere" c="#8a5a2a" p={[Math.sin(a) * 0.2, Math.cos(a) * 0.2, 0.0]} s={0.075} />;
      })}
      <P g="box" c="#c03a2a" p={[0, -0.13, 0.17]} s={[0.04, 0.07, 0.02]} />
      <P g="box" c="#7a4a20" p={[0, -0.22, 0.13]} s={[0.12, 0.1, 0.06]} />
    </group>
  );
}
