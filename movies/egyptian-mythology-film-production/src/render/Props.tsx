import { useMemo, useRef, type MutableRefObject, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clock } from '../film/clock';
import type { PropDef } from '../film/types';
import { glow, mat, P } from './prim';
import { glowTexture, hieroglyphTexture, starSkinTexture } from './textures';

type Val = MutableRefObject<number>;
const GOLD = '#d9a441', BLUE = '#2a5ab0', RED = '#b0382a';
const sm = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
const useVis = (def: PropDef) => (clock.progress >= (def.enter ?? 0) && clock.progress <= (def.exit ?? 1.001));

function Glow({ c = '#ffcf6a', s = 4, o = 0.7, p }: { c?: string; s?: number; o?: number; p?: [number, number, number] }) {
  const tex = glowTexture();
  return <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={tex} color={c} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></sprite>;
}

// ---------- Solar barque ----------
function Barque({ v, def }: { v: Val; def: PropDef }) {
  const night = def.a !== undefined ? def.a > 0.5 : false;
  const oars = useRef<THREE.Group[]>([]);
  useFrame(() => { oars.current.forEach((o, i) => { if (o) o.rotation.z = Math.sin(clock.animT * 1.6 + i * 0.5) * 0.12 * (i % 2 ? 1 : -1) + (i % 2 ? 0.7 : -0.7); }); });
  void v;
  return (
    <group>
      <P g="box" c={GOLD} p={[0, 0.5, 0]} s={[13, 0.8, 2.1]} metal={0.55} rough={0.4} cast />
      <P g="box" c={BLUE} p={[0, 0.78, 1.06]} s={[13, 0.18, 0.05]} />
      <P g="box" c={RED} p={[0, 0.5, 1.06]} s={[13, 0.12, 0.05]} />
      {[1, -1].map((s) => (
        <group key={s} position={[s * 6.5, 0, 0]}>
          <P g="box" c={GOLD} p={[s * 0.6, 1.1, 0]} s={[1.6, 0.35, 1.5]} r={[0, 0, s * -0.55]} metal={0.55} rough={0.4} />
          <P g="box" c={GOLD} p={[s * 1.25, 2.0, 0]} s={[0.9, 0.3, 1.0]} r={[0, 0, s * -1.0]} metal={0.55} rough={0.4} />
          <P g="sphere" c={GOLD} p={[s * 1.55, 2.5, 0]} s={0.35} metal={0.7} />
          <P g="cone" c={'#3a9a6a'} p={[s * 1.55, 2.95, 0]} s={[0.22, 0.6, 0.22]} />
        </group>
      ))}
      <P g="box" c={BLUE} p={[0, 1.6, -0.75]} s={[2.4, 1.4, 0.45]} />
      <P g="box" c={GOLD} p={[0, 2.4, -0.75]} s={[2.6, 0.18, 0.55]} metal={0.7} />
      <P g="sphere" c={night ? '#ff8a40' : '#ffb020'} p={[0, 3.6, -0.75]} s={[0.9, 0.9, 0.15]} e={night ? 0.8 : 1.6} />
      <Glow p={[0, 3.6, -0.6]} s={night ? 4 : 7} o={night ? 0.4 : 0.7} c="#ffb020" />
      {[0, 1, 2, 3, 4, 5].map((i) => [1, -1].map((s) => (
        <group key={`${i}${s}`} position={[-4.5 + i * 1.8, 0.7, s * 1.15]} ref={(g) => { if (g && s === 1) oars.current[i] = g; }}>
          <P g="cyl" c="#8a6a3a" p={[0, -0.7, 0]} s={[0.04, 1.8, 0.04]} r={[0, 0, 0]} />
        </group>
      )))}
    </group>
  );
}

// ---------- Apep (also used for Mehen, with a<0) ----------
function Apep({ v, def }: { v: Val; def: PropDef }) {
  const N = 40;
  const segs = useRef<THREE.Mesh[]>([]);
  const head = useRef<THREE.Group>(null!);
  const jaw = useRef<THREE.Group>(null!);
  const body = def.color ?? '#2a1838';
  useFrame(() => {
    const t = clock.animT, a = v.current;
    const coil = a < 0;
    const rear = Math.max(0, Math.min(1, a));
    for (let i = 0; i < N; i++) {
      const m = segs.current[i]; if (!m) continue;
      const u = i / (N - 1), d = u * 16;
      let x: number, y: number, z: number;
      if (coil) {
        const ang = u * Math.PI * 6 + t * 0.5, R = 3.2 * (1 - u * 0.2);
        x = Math.cos(ang) * R; z = Math.sin(ang) * R; y = u * 5;
      } else {
        const lift = rear * 9 * Math.pow(Math.max(0, 1 - d / 7), 1.35);
        x = d * (0.95 - rear * 0.25) + rear * 1.5 * Math.sin(Math.min(1, d / 7) * Math.PI) * 0;
        z = Math.sin(d * 0.75 - t * 1.8) * (0.8 + u * 1.6) * (0.4 + (1 - rear) * 0.8) - rear * 2.0 * Math.pow(Math.max(0, 1 - d / 7), 2) * 0;
        y = 0.9 + lift + Math.sin(d * 0.9 - t * 2) * 0.12;
      }
      m.position.set(x, y, z);
      const r = (coil ? 0.7 : 1.15) * (1 - u * 0.78) * (u < 0.04 ? 0.9 : 1);
      m.scale.setScalar(Math.max(0.08, r));
      if (i === 0 && head.current) {
        head.current.position.set(x, y + 0.1, z + 0.5);
        head.current.rotation.set(coil ? 0.2 : 0.35 + rear * 0.25, coil ? -t * 0.5 + 1.5 : Math.PI * 0.12 + Math.sin(t * 1.5) * 0.12, 0);
        head.current.scale.setScalar(coil ? 0.75 : 1);
        if (jaw.current) jaw.current.rotation.x = 0.18 + (Math.sin(t * 2.5) * 0.5 + 0.5) * 0.45 * rear;
      }
    }
  });
  return (
    <group>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) segs.current[i] = m; }} geometry={useGeo.sphere} material={mat(i % 5 === 0 ? (def.color ? '#fff2a0' : '#8a2a3a') : body, { rough: 0.45, metal: 0.25, e: def.color ? 0.2 : 0 })} castShadow />
      ))}
      <group ref={head}>
        <P g="sphere" c={body} s={[1.05, 0.85, 1.35]} rough={0.4} metal={0.2} />
        <group ref={jaw}><P g="sphere" c="#8a2a3a" p={[0, -0.55, 0.45]} s={[0.8, 0.28, 1.0]} /><P g="cone" c="#fff4d0" p={[0.35, -0.2, 1.2]} s={[0.06, 0.3, 0.06]} r={[Math.PI, 0, 0]} /><P g="cone" c="#fff4d0" p={[-0.35, -0.2, 1.2]} s={[0.06, 0.3, 0.06]} r={[Math.PI, 0, 0]} /></group>
        {[1, -1].map((s) => <group key={s}><P g="sphere" c={def.color ? '#fff' : '#ff3a1a'} p={[s * 0.55, 0.3, 0.9]} s={0.18} e={2.4} /><P g="sphere" c="#000" p={[s * 0.56, 0.3, 1.05]} s={[0.04, 0.14, 0.04]} /></group>)}
        <Glow p={[0, 0.3, 1]} s={4} o={0.35} c={def.color ? '#ffe28a' : '#ff3a1a'} />
      </group>
    </group>
  );
}
const useGeo = { sphere: new THREE.SphereGeometry(1, 14, 10), cyl: new THREE.CylinderGeometry(1, 0.9, 1, 12) };

// ---------- Ammit ----------
function Ammit({ v, def }: { v: Val; def: PropDef }) {
  const headG = useRef<THREE.Group>(null!), jaw = useRef<THREE.Group>(null!);
  useFrame(() => { const a = v.current; headG.current.position.z = 1.9 + a * 0.9; jaw.current.rotation.x = 0.1 + a * 0.75 + Math.sin(clock.animT * 3) * 0.04; });
  const tawny = '#c4903f', dark = def.color ?? '#7a3a2a';
  return (
    <group>
      <P g="sphere" c={dark} p={[0, 1.5, -1.5]} s={[1.3, 1.25, 1.5]} cast />
      <P g="sphere" c={tawny} p={[0, 1.6, 0.4]} s={[1.0, 1.0, 1.4]} cast />
      <P g="sphere" c="#8a5a2a" p={[0, 2.1, 1.3]} s={[0.9, 0.8, 0.8]} />
      {[[0.55, 0.8], [-0.55, 0.8], [0.6, -1.9], [-0.6, -1.9]].map(([x, z], i) => <P key={i} g="cyl" c={i < 2 ? tawny : dark} p={[x, 0.55, z]} s={[0.26, 1.1, 0.26]} />)}
      <P g="cone" c={dark} p={[0, 1.4, -3.1]} s={[0.25, 1.6, 0.25]} r={[-1.4, 0, 0]} />
      <group ref={headG} position={[0, 2.0, 1.9]}>
        <P g="sphere" c="#5a7a45" s={[0.65, 0.55, 0.85]} cast />
        <P g="box" c="#5a7a45" p={[0, -0.05, 0.9]} s={[0.7, 0.3, 1.3]} />
        <group ref={jaw}><P g="box" c="#c9b88a" p={[0, -0.28, 0.85]} s={[0.62, 0.18, 1.3]} /><P g="box" c="#fff" p={[0, -0.16, 0.85]} s={[0.6, 0.06, 1.25]} /></group>
        {[1, -1].map((s) => <group key={s}><P g="sphere" c="#e8c030" p={[s * 0.38, 0.45, 0.35]} s={0.14} e={1} /><P g="sphere" c="#000" p={[s * 0.38, 0.47, 0.46]} s={[0.03, 0.1, 0.03]} /></group>)}
        <Glow p={[0, 0.2, 1.2]} s={3} o={0.25} c="#ff3a1a" />
      </group>
    </group>
  );
}

// ---------- Scale of Ma'at ----------
function Scale({ v }: { v: Val }) {
  const beam = useRef<THREE.Group>(null!), pL = useRef<THREE.Group>(null!), pR = useRef<THREE.Group>(null!);
  useFrame(() => {
    const a = v.current + Math.sin(clock.animT * 2.2) * 0.012 * (0.5 + Math.abs(v.current) * 2);
    beam.current.rotation.z = a;
    const W = 2.5;
    pL.current.position.set(-W * Math.cos(a), -W * Math.sin(a), 0);
    pR.current.position.set(W * Math.cos(a), W * Math.sin(a), 0);
    pL.current.rotation.z = -a; pR.current.rotation.z = -a;
  });
  return (
    <group>
      <P g="box" c={GOLD} p={[0, 0.2, 0]} s={[1.8, 0.4, 1.2]} metal={0.7} rough={0.35} />
      <P g="cyl" c={GOLD} p={[0, 2.8, 0]} s={[0.14, 5.2, 0.14]} metal={0.7} rough={0.35} />
      <P g="sphere" c={GOLD} p={[0, 5.5, 0]} s={0.28} metal={0.8} />
      <group position={[0, 5.2, 0]}>
        <group ref={beam}>
          <P g="box" c={GOLD} s={[5.6, 0.14, 0.14]} metal={0.8} rough={0.3} />
          <group ref={pL}>
            <P g="cyl" c={GOLD} p={[0, -1.2, 0]} s={[0.012, 2.4, 0.012]} />
            <P g="cyl" c={GOLD} p={[0, -2.4, 0]} s={[0.75, 0.07, 0.75]} metal={0.8} rough={0.3} />
            <P g="sphere" c="#c01a2a" p={[0, -2.1, 0]} s={[0.38, 0.34, 0.3]} e={0.5} rough={0.2} />
            <P g="sphere" c="#c01a2a" p={[0.17, -1.95, 0]} s={0.2} e={0.5} />
          </group>
          <group ref={pR}>
            <P g="cyl" c={GOLD} p={[0, -1.2, 0]} s={[0.012, 2.4, 0.012]} />
            <P g="cyl" c={GOLD} p={[0, -2.4, 0]} s={[0.75, 0.07, 0.75]} metal={0.8} rough={0.3} />
            <P g="sphere" c="#fffaf0" p={[0, -1.85, 0]} s={[0.1, 0.5, 0.015]} e={0.6} />
            <Glow p={[0, -1.9, 0]} s={1.6} o={0.5} c="#fff4c0" />
          </group>
        </group>
      </group>
    </group>
  );
}

// ---------- Chest of Set ----------
function Chest({ v }: { v: Val }) {
  const lid = useRef<THREE.Group>(null!);
  useFrame(() => { lid.current.rotation.x = -(1 - v.current) * 1.15; });
  return (
    <group>
      <P g="box" c="#5a3a1c" p={[0, 0.45, 0]} s={[2.8, 0.9, 1.2]} cast />
      <P g="box" c={GOLD} p={[0, 0.9, 0.6]} s={[2.84, 0.06, 0.06]} metal={0.7} />
      <P g="box" c={GOLD} p={[0, 0.9, -0.6]} s={[2.84, 0.06, 0.06]} metal={0.7} />
      {[-1.3, 0, 1.3].map((x) => <P key={x} g="box" c={GOLD} p={[x, 0.45, 0.61]} s={[0.1, 0.92, 0.04]} metal={0.7} />)}
      <group ref={lid} position={[0, 0.9, -0.6]}>
        <P g="box" c="#6a4222" p={[0, 0.07, 0.6]} s={[2.84, 0.16, 1.28]} cast />
        <P g="box" c={GOLD} p={[0, 0.16, 0.6]} s={[2.4, 0.03, 0.8]} metal={0.7} />
      </group>
    </group>
  );
}

function Sun({ v, def }: { v: Val; def: PropDef }) {
  const g = useRef<THREE.Group>(null!);
  const s = def.s ?? 1;
  useFrame(() => { const k = 0.25 + 0.75 * sm(v.current); g.current.scale.setScalar(k * (1 + Math.sin(clock.animT * 1.3) * 0.015)); });
  return (
    <group ref={g}>
      <P g="sphere" c="#ffcf5a" s={1} e={2.2} emissive="#ffb020" />
      <Glow s={5} o={0.8} c="#ffc040" /><Glow s={12} o={0.4} c="#ff9a30" />
      <Glow s={s > 3 ? 26 : 16} o={0.18} c="#ff7a20" />
    </group>
  );
}

function WingedDisk({ def }: { def: PropDef }) {
  void def;
  const wings = useRef<THREE.Group[]>([]);
  useFrame(() => { wings.current.forEach((g, i) => { if (g) g.rotation.z = (i < 7 ? 1 : -1) * (0.05 + (i % 7) * 0.012 + Math.sin(clock.animT * 1.2) * 0.02); }); });
  return (
    <group>
      <P g="sphere" c="#ffb020" s={[0.9, 0.9, 0.2]} e={1.6} />
      <P g="torus" c={GOLD} s={[0.95, 0.95, 1.4]} metal={0.8} />
      <Glow s={8} o={0.5} c="#ffc040" />
      {[1, -1].map((s) => (
        <group key={s}>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <group key={k} position={[s * 1.0, 0.25 - k * 0.1, 0]} ref={(g) => { if (g) wings.current[(s === 1 ? 0 : 7) + k] = g; }} rotation={[0, 0, s * (Math.PI / 2 + 0.06 * k)]}>
              <P g="box" c={k % 2 ? BLUE : GOLD} p={[0, -(2.6 - k * 0.2) / 2, 0]} s={[0.3, 2.6 - k * 0.2, 0.04]} metal={0.6} rough={0.4} e={0.2} />
            </group>
          ))}
          <P g="sphere" c="#3a9a4a" p={[s * 0.8, -0.8, 0]} s={[0.12, 0.3, 0.1]} e={0.4} />
        </group>
      ))}
    </group>
  );
}

function EyeOfRa() {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => { g.current.scale.setScalar(1 + Math.sin(clock.animT * 2) * 0.04); });
  return (
    <group ref={g}>
      <P g="sphere" c="#f4efe0" s={[1.5, 0.78, 0.3]} e={0.6} />
      <P g="sphere" c="#2a6ab0" p={[0, 0, 0.2]} s={[0.62, 0.62, 0.2]} e={0.7} />
      <P g="sphere" c="#ffcf40" p={[0, 0, 0.3]} s={[0.4, 0.4, 0.12]} e={1.4} />
      <P g="sphere" c="#0a0a0a" p={[0, 0, 0.38]} s={[0.2, 0.2, 0.08]} />
      <group position={[0, 1.05, 0.05]}><P g="arc" c="#10101a" s={[1.55, 0.7, 0.3]} /></group>
      <P g="box" c="#10101a" p={[0.85, -0.9, 0.05]} s={[0.12, 0.7, 0.1]} />
      <group position={[1.1, -1.5, 0.05]}><P g="torus" c="#10101a" s={[0.4, 0.4, 0.4]} /></group>
      <P g="box" c="#10101a" p={[1.55, -0.1, 0.05]} s={[0.9, 0.12, 0.1]} />
      <Glow s={9} o={0.6} c="#ff9a2a" />
    </group>
  );
}

function Scarab() {
  return (
    <group>
      <P g="sphere" c="#1d4a8a" p={[0, 1.2, 0]} s={[1.2, 0.85, 1.7]} metal={0.55} rough={0.25} cast />
      <P g="sphere" c="#2a6aaa" p={[0, 1.3, 1.7]} s={[0.7, 0.5, 0.55]} metal={0.5} rough={0.3} />
      <P g="box" c="#0a1a3a" p={[0, 2.05, -0.1]} s={[0.05, 0.05, 2.6]} />
      {[1, -1].map((s) => (
        <group key={s}>
          {[0.7, 0, -0.8].map((z, i) => <P key={i} g="cyl" c="#0a1a3a" p={[s * 1.1, 0.7, z]} s={[0.07, 1.4, 0.07]} r={[0, 0, s * -0.9]} />)}
          <P g="cone" c="#0a1a3a" p={[s * 0.3, 1.5, 2.1]} s={[0.1, 0.4, 0.1]} r={[Math.PI / 2, 0, s * 0.5]} />
          <P g="cyl" c="#0a1a3a" p={[s * 0.7, 1.9, 2.4]} s={[0.07, 1.4, 0.07]} r={[-1.0, 0, s * 0.35]} />
        </group>
      ))}
      <P g="sphere" c="#ffcf5a" p={[0, 3.1, 3.2]} s={1.4} e={2} />
      <Glow p={[0, 3.1, 3.2]} s={9} o={0.7} c="#ffb030" />
    </group>
  );
}

const obeliskGeo = (() => { const g = new THREE.CylinderGeometry(0.62, 1, 1, 4, 1); g.rotateY(Math.PI / 4); return g; })();
function Obelisk() {
  const hier = hieroglyphTexture();
  const m = mat('#e0b78a', { map: hier, rough: 0.7 });
  return (
    <group>
      <P g="box" c="#b8946a" p={[0, 0.3, 0]} s={[2.6, 0.6, 2.6]} />
      <mesh geometry={obeliskGeo} material={m} position={[0, 5.6, 0]} scale={[1.1, 10, 1.1]} castShadow />
      <P g="pyr" c={GOLD} p={[0, 11.0, 0]} s={[0.78, 1.0, 0.78]} metal={0.9} rough={0.2} e={0.15} />
    </group>
  );
}

function Throne() {
  return (
    <group>
      <P g="box" c={GOLD} p={[0, 0.2, 0.55]} s={[1.9, 0.4, 1.8]} metal={0.55} rough={0.4} cast />
      <P g="box" c={BLUE} p={[0, 0.44, 0.45]} s={[1.5, 0.1, 1.4]} />
      <P g="box" c={GOLD} p={[0, 1.7, -0.25]} s={[1.9, 3.0, 0.3]} metal={0.55} rough={0.4} cast />
      <P g="box" c={BLUE} p={[0, 1.8, -0.08]} s={[1.5, 2.4, 0.06]} />
      {[1, -1].map((s) => <P key={s} g="box" c={GOLD} p={[s * 0.88, 0.85, 0.7]} s={[0.18, 0.9, 1.3]} metal={0.55} rough={0.4} />)}
      <P g="box" c={GOLD} p={[0, 0.12, 1.9]} s={[1.2, 0.24, 0.8]} metal={0.55} />
      <P g="sphere" c="#ffb020" p={[0, 3.35, -0.2]} s={[0.4, 0.4, 0.1]} e={1} />
    </group>
  );
}

function Jars({ v }: { v: Val }) {
  const pool = useRef<THREE.Mesh>(null!);
  useFrame(() => { const k = sm(v.current); pool.current.scale.setScalar(0.2 + k * 11); (pool.current.material as THREE.MeshStandardMaterial).opacity = 0.2 + k * 0.55; });
  return (
    <group>
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}><circleGeometry args={[1, 40]} /><meshStandardMaterial color="#a01818" emissive="#601010" emissiveIntensity={0.7} transparent opacity={0.6} depthWrite={false} roughness={0.2} /></mesh>
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2, r = 1.5 + (i % 3) * 1.1;
        return <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} rotation={[0, 0, (i % 3) * 0.05]}>
          <P g="tcone" c="#a8623a" p={[0, 0.5, 0]} s={[0.34, 1, 0.34]} r={[Math.PI, 0, 0]} cast />
          <P g="torus" c="#8a4a2a" p={[0, 1.02, 0]} s={[0.22, 0.22, 0.4]} r={[Math.PI / 2, 0, 0]} />
        </group>;
      })}
    </group>
  );
}

function Wheel() {
  const w = useRef<THREE.Group>(null!);
  useFrame(() => { w.current.rotation.y = clock.animT * 2.2; });
  return (
    <group>
      <P g="cyl" c="#8a6a4a" p={[0, 0.5, 0]} s={[0.12, 1, 0.12]} />
      <P g="cyl" c="#7a5a3a" p={[0, 0.05, 0]} s={[0.7, 0.1, 0.7]} />
      <group ref={w} position={[0, 1.02, 0]}>
        <P g="cyl" c="#8a6a4a" s={[0.65, 0.07, 0.65]} />
        <P g="cyl" c="#c0794a" p={[0, 0.3, 0]} s={[0.17, 0.5, 0.17]} />
        <P g="sphere" c="#c0794a" p={[0, 0.65, 0]} s={0.16} />
        <P g="cyl" c="#c0794a" p={[0.3, 0.2, 0.1]} s={[0.1, 0.3, 0.1]} /><P g="sphere" c="#c0794a" p={[0.3, 0.42, 0.1]} s={0.1} />
      </group>
      <Glow p={[0, 1.5, 0]} s={3} o={0.35} c="#ffd27a" />
    </group>
  );
}

function NutArch({ v }: { v: Val }) {
  const NS = 18;
  const segs = useRef<THREE.Group[]>([]);
  const limbs = useRef<THREE.Group[]>([]);
  const headG = useRef<THREE.Group>(null!);
  const star = starSkinTexture();
  const skin = mat('#ffffff', { map: star, emissive: '#2a3ca0', e: 0.45, rough: 0.8 });
  useFrame(() => {
    const H = 0.9 + 8.1 * v.current, W = 9.5;
    for (let i = 0; i < NS; i++) {
      const u0 = i / NS, u1 = (i + 1) / NS, um = (u0 + u1) / 2;
      const p = (u: number) => [-W * Math.cos(Math.PI * u), H * Math.sin(Math.PI * u) + 1.1] as const;
      const [x0, y0] = p(u0), [x1, y1] = p(u1);
      const g = segs.current[i]; if (!g) continue;
      const L = Math.hypot(x1 - x0, y1 - y0);
      g.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
      g.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2;
      const th = 0.45 + 0.35 * Math.sin(Math.PI * Math.min(1, Math.abs(um - 0.62) * 2.2 + 0.1));
      g.children[0].scale.set(th, L * 1.06, th * 0.8);
    }
    const [hx, hy] = [-W, 1.1];
    if (headG.current) headG.current.position.set(hx - 0.4, hy + 0.4, 0);
    // arms (to the ground at the head end) and legs (feet end)
    const set = (i: number, x0: number, y0: number, x1: number, y1: number) => {
      const g = limbs.current[i]; if (!g) return;
      g.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.0);
      g.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2;
      g.children[0].scale.set(0.3, Math.hypot(x1 - x0, y1 - y0), 0.3);
    };
    const uA = 0.1, uL = 0.9;
    const ax = -W * Math.cos(Math.PI * uA), ay = H * Math.sin(Math.PI * uA) + 1.1;
    set(0, ax, ay, ax - 1.1, 0.1); set(1, ax, ay, ax - 2.1, 0.1);
    const lx = -W * Math.cos(Math.PI * uL), ly = H * Math.sin(Math.PI * uL) + 1.1;
    set(2, lx, ly, lx + 0.9, 0.1); set(3, lx, ly, lx + 2.0, 0.1);
  });
  return (
    <group>
      {Array.from({ length: NS }).map((_, i) => (
        <group key={i} ref={(g) => { if (g) segs.current[i] = g; }}><mesh geometry={useGeo.cyl} material={skin} /></group>
      ))}
      {[0, 1, 2, 3].map((i) => <group key={i} ref={(g) => { if (g) limbs.current[i] = g; }}><mesh geometry={useGeo.cyl} material={skin} /></group>)}
      <group ref={headG}>
        <P g="sphere" c="#2b3f9a" s={[0.55, 0.62, 0.55]} /><P g="hemi" c="#10102a" p={[0, 0.15, -0.05]} s={[0.6, 0.5, 0.6]} />
        <P g="sphere" c="#b04a3a" p={[0, 0.85, 0]} s={0.28} /><P g="sphere" c={GOLD} p={[0, 0.5, 0.45]} s={[0.4, 0.08, 0.08]} />
      </group>
    </group>
  );
}

function Cow() {
  const star = starSkinTexture();
  const skin = mat('#ffffff', { map: star, emissive: '#2a3ca0', e: 0.4, rough: 0.8 });
  return (
    <group>
      <mesh geometry={GEO_S} material={skin} position={[0, 3.9, 0]} scale={[4.4, 1.6, 1.6]} castShadow />
      <mesh geometry={GEO_S} material={skin} position={[4.2, 4.5, 0]} scale={[1.3, 1.2, 1.0]} />
      <P g="sphere" c="#c9b88a" p={[5.3, 4.2, 0]} s={[0.8, 0.6, 0.65]} />
      {[1.8, -1.8].map((x) => [0.9, -0.9].map((z) => <P key={`${x}${z}`} g="cyl" c="#1f2d86" p={[x * (x > 0 ? 1.1 : 1.1), 1.4, z]} s={[0.38, 2.9, 0.38]} />))}
      {[0.7, -0.7].map((z) => <group key={z}><P g="sphere" c="#e8c030" p={[4.6, 5.0, z * 1.1]} s={0.12} e={1} /><P g="sphere" c="#1f2d86" p={[4.0, 5.3, z * 1.4]} s={[0.3, 0.15, 0.4]} /></group>)}
      <group position={[4.2, 5.4, 0]} rotation={[0, Math.PI / 2, 0]}><P g="arc" c={GOLD} s={[1.2, 1.2, 1.2]} r={[0, 0, Math.PI]} p={[0, 0.5, 0]} metal={0.7} /></group>
      <P g="sphere" c="#ffb020" p={[4.2, 6.1, 0]} s={[0.35, 0.35, 0.1]} e={1.4} />
      <P g="cone" c="#1f2d86" p={[-4.8, 3.3, 0]} s={[0.2, 2.2, 0.2]} r={[0, 0, 0.5]} />
      <Glow p={[0, 3.9, 0]} s={12} o={0.12} c="#6a8aff" />
    </group>
  );
}
const GEO_S = useGeo.sphere;

function HippoProp({ def }: { def: PropDef }) {
  const g = useRef<THREE.Group>(null!);
  const c = def.color ?? '#6a6a7a';
  useFrame(() => { g.current.position.y = Math.sin(clock.animT * 1.8 + (def.at[0] || 0)) * 0.12; g.current.rotation.z = Math.sin(clock.animT * 2.4) * 0.05; });
  return (
    <group ref={g}>
      <P g="sphere" c={c} p={[0, 0.9, 0]} s={[1.8, 1.0, 1.1]} cast />
      <P g="sphere" c={c} p={[1.6, 1.1, 0]} s={[0.9, 0.75, 0.85]} />
      <P g="sphere" c="#9a8a9a" p={[2.35, 0.95, 0]} s={[0.55, 0.45, 0.8]} />
      {[1, -1].map((s) => <group key={s}><P g="sphere" c="#e8d8a0" p={[1.85, 1.65, s * 0.4]} s={0.12} /><P g="sphere" c="#000" p={[1.93, 1.67, s * 0.43]} s={0.06} /><P g="sphere" c={c} p={[1.1, 1.8, s * 0.5]} s={0.18} /><P g="cone" c="#fff" p={[2.55, 0.7, s * 0.45]} s={[0.06, 0.25, 0.06]} r={[Math.PI, 0, 0]} /></group>)}
    </group>
  );
}

function Boat({ def, v, stone }: { def: PropDef; v: Val; stone?: boolean }) {
  const g = useRef<THREE.Group>(null!);
  const c = stone ? '#8a8a90' : def.color ?? '#b8864a';
  useFrame(() => {
    const k = sm(v.current);
    if (stone) { g.current.position.y = -k * 2.4; g.current.rotation.z = k * 0.6; } else { g.current.position.y = Math.sin(clock.animT * 1.4) * 0.05; g.current.rotation.z = Math.sin(clock.animT * 1.1) * 0.03; }
  });
  return (
    <group ref={g}>
      <P g="box" c={c} p={[0, 0.3, 0]} s={[6, 0.6, 1.8]} cast rough={0.9} />
      {[1, -1].map((s) => <P key={s} g="box" c={c} p={[s * 3.1, 0.85, 0]} s={[1.3, 0.3, 1.5]} r={[0, 0, s * -0.7]} />)}
      <P g="box" c={stone ? '#6a6a70' : '#d9a441'} p={[0, 0.62, 0.9]} s={[6, 0.08, 0.05]} />
      {!stone && <><P g="box" c="#d8cfa8" p={[0, 1.0, 0]} s={[1.2, 0.8, 1.0]} /><P g="box" c={GOLD} p={[0, 1.45, 0]} s={[1.4, 0.1, 1.2]} metal={0.6} /></>}
    </group>
  );
}

function Lotus({ v }: { v: Val }) {
  const pet = useRef<THREE.Group[]>([]);
  useFrame(() => { const o = sm(v.current); pet.current.forEach((g, i) => { if (g) g.rotation.x = -(0.15 + (1 - o) * 1.1 - (i >= 8 ? 0.35 : 0)); }); });
  return (
    <group>
      <P g="cyl" c="#3a7a4a" p={[0, 0.5, 0]} s={[0.08, 1, 0.08]} />
      <group position={[0, 1.0, 0]}>
        {Array.from({ length: 14 }).map((_, i) => {
          const ring = i < 8 ? 0 : 1, k = ring ? i - 8 : i, n = ring ? 6 : 8;
          return <group key={i} rotation={[0, (k / n) * Math.PI * 2 + ring * 0.4, 0]}>
            <group ref={(g) => { if (g) pet.current[i] = g; }} position={[0, 0, 0]}>
              <P g="cone" c={ring ? '#7ab0ff' : '#4a86e0'} p={[0, 0.55, 0.28 + ring * 0.0]} s={[0.22, 0.6, 0.06]} e={0.3} />
            </group>
          </group>;
        })}
        <P g="sphere" c="#ffe070" p={[0, 0.15, 0]} s={0.2} e={1.2} />
        <Glow p={[0, 0.3, 0]} s={3} o={0.5} c="#bfe0ff" />
      </group>
    </group>
  );
}

function Canopic() {
  return (
    <group>
      <P g="tcone" c="#e0d4b0" p={[0, 0.4, 0]} s={[0.3, 0.8, 0.3]} r={[Math.PI, 0, 0]} />
      <P g="cyl" c={GOLD} p={[0, 0.8, 0]} s={[0.32, 0.05, 0.32]} metal={0.7} />
      <P g="sphere" c={GOLD} p={[0, 0.98, 0]} s={0.25} metal={0.7} rough={0.3} />
      <P g="box" c="#2a6ab0" p={[0, 0.5, 0.29]} s={[0.12, 0.35, 0.02]} />
    </group>
  );
}

function Senet() {
  return (
    <group>
      {[[-1, -0.4], [1, -0.4], [-1, 0.4], [1, 0.4]].map(([x, z], i) => <P key={i} g="box" c="#6a4a2a" p={[x * 1.1, 0.4, z]} s={[0.12, 0.8, 0.12]} />)}
      <P g="box" c="#8a6a3a" p={[0, 0.82, 0]} s={[2.8, 0.1, 1.1]} />
      {Array.from({ length: 30 }).map((_, i) => <P key={i} g="box" c={(i + Math.floor(i / 10)) % 2 ? '#e0cfa0' : '#4a3a20'} p={[-1.3 + (i % 10) * 0.29, 0.88, -0.3 + Math.floor(i / 10) * 0.3]} s={[0.26, 0.03, 0.26]} />)}
      {[0, 1, 2, 3].map((i) => <P key={i} g="cone" c={i % 2 ? '#d9a441' : '#2a5ab0'} p={[-0.9 + i * 0.5, 1.0, (i % 2) * 0.3 - 0.15]} s={[0.1, 0.22, 0.1]} />)}
    </group>
  );
}

function Stela({ def }: { def: PropDef }) {
  const m = mat('#a58a50', { map: hieroglyphTexture(), emissive: '#7a5a20', e: 0.18, rough: 0.5 });
  void def;
  return (
    <group>
      <mesh geometry={useBox} material={mat('#17171c', { rough: 0.35, metal: 0.2 })} position={[0, 1.6, 0]} scale={[1.9, 3.2, 0.3]} castShadow />
      <mesh geometry={useBox} material={m} position={[0, 1.6, 0.16]} scale={[1.6, 2.9, 0.02]} />
      <Glow p={[0, 1.6, 0.4]} s={4} o={0.15} c="#ffcf6a" />
    </group>
  );
}
const useBox = new THREE.BoxGeometry(1, 1, 1);

function Bier() {
  return (
    <group>
      {[[-1.5, -0.5], [1.5, -0.5], [-1.5, 0.5], [1.5, 0.5]].map(([x, z], i) => <P key={i} g="box" c={GOLD} p={[x * 1.05, 0.35, z]} s={[0.18, 0.7, 0.18]} metal={0.6} />)}
      <P g="box" c={GOLD} p={[0, 0.78, 0]} s={[3.8, 0.16, 1.4]} metal={0.55} rough={0.4} cast />
      <P g="sphere" c="#c9964a" p={[-2.1, 1.2, 0]} s={[0.4, 0.4, 0.4]} /><P g="sphere" c="#d9a441" p={[2.1, 1.2, 0]} s={[0.1, 0.1, 0.1]} />
      <P g="cyl" c="#efe7d2" p={[0, 1.15, 0]} s={[0.36, 2.9, 0.3]} r={[0, 0, Math.PI / 2]} cast />
      {[-1, -0.5, 0, 0.5, 1].map((x) => <P key={x} g="torus" c="#cfc4a4" p={[x, 1.15, 0]} s={[0.36, 0.3, 0.3]} r={[0, Math.PI / 2, 0]} />)}
      <P g="sphere" c={GOLD} p={[1.6, 1.2, 0]} s={[0.3, 0.34, 0.28]} metal={0.8} rough={0.25} e={0.1} />
    </group>
  );
}

function Djed() {
  return (
    <group>
      <P g="box" c="#2a8a6a" p={[0, 0.3, 0]} s={[1.2, 0.6, 0.9]} />
      <P g="cyl" c={GOLD} p={[0, 1.8, 0]} s={[0.22, 2.6, 0.22]} metal={0.6} />
      {[2.4, 2.8, 3.2, 3.6].map((y, i) => <P key={y} g="box" c={i % 2 ? BLUE : RED} p={[0, y, 0]} s={[1.1 - i * 0.1, 0.16, 0.22]} metal={0.4} />)}
    </group>
  );
}

function Shrine({ def }: { def: PropDef }) {
  void def;
  return (
    <group>
      <P g="box" c={GOLD} p={[0, 0.5, 0]} s={[2.6, 1.0, 2.0]} metal={0.65} rough={0.35} cast />
      <P g="box" c={GOLD} p={[0, 1.3, 0]} s={[3.0, 0.3, 2.3]} metal={0.65} rough={0.35} />
      <P g="box" c={BLUE} p={[0, 1.2, 1.02]} s={[2.4, 0.15, 0.05]} />
      {[1, -1].map((s) => <P key={s} g="box" c="#fff4c0" p={[s * 0.5, 0.5, 1.03]} s={[0.9, 0.8, 0.03]} e={0.15} />)}
      <Glow p={[0, 1.6, 0]} s={4} o={0.25} c="#ffcf6a" />
    </group>
  );
}

function Egg() {
  return <group><P g="sphere" c="#fff2c0" p={[0, 1.2, 0]} s={[0.8, 1.05, 0.8]} e={1.1} /><Glow p={[0, 1.2, 0]} s={6} o={0.6} c="#ffd27a" /></group>;
}
function Moon({ def }: { def: PropDef }) {
  return <group><P g="sphere" c={def.color ?? '#e8eeff'} s={1} e={1.1} /><Glow s={4} o={0.5} c="#bcd0ff" /><Glow s={9} o={0.18} c="#8fb0ff" /></group>;
}
function Tree() {
  return (
    <group>
      <P g="cyl" c="#6a4a2a" p={[0, 1.8, 0]} s={[0.35, 3.6, 0.35]} cast />
      {[[0, 4.2, 0, 1.8], [-1.3, 3.8, 0.5, 1.2], [1.3, 3.9, -0.4, 1.3], [0.3, 5.0, 0.6, 1.0]].map(([x, y, z, s], i) => <P key={i} g="sphere" c={i % 2 ? '#3f7a3a' : '#4a8a42'} p={[x, y, z]} s={[s * 1.1, s * 0.8, s * 1.1]} />)}
    </group>
  );
}
function Flame() {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => { g.current.scale.set(1, 1 + Math.sin(clock.animT * 12) * 0.12, 1); });
  return <group><group ref={g}><P g="cone" c="#ff8a20" p={[0, 0.8, 0]} s={[0.4, 1.4, 0.4]} e={2.4} /></group><Glow p={[0, 0.9, 0]} s={4} o={0.5} c="#ff7a20" /></group>;
}
function Table() {
  return <group><P g="cyl" c="#6a4a2a" p={[0, 0.4, 0]} s={[0.1, 0.8, 0.1]} /><P g="cyl" c="#8a6a3a" p={[0, 0.82, 0]} s={[0.8, 0.08, 0.8]} />{[0, 1, 2].map((i) => <P key={i} g="sphere" c="#c9964a" p={[-0.3 + i * 0.3, 0.98, 0]} s={0.13} />)}</group>;
}
function Gate() {
  const fl = useRef<THREE.Group>(null!);
  useFrame(() => { fl.current.scale.y = 1 + Math.sin(clock.animT * 5) * 0.05; });
  const rock = '#2a1a20';
  return (
    <group>
      {[1, -1].map((s) => <P key={s} g="box" c={rock} p={[s * 5.2, 4, 0]} s={[3, 8, 2.4]} rough={0.9} cast />)}
      <P g="box" c={rock} p={[0, 8.4, 0]} s={[13.4, 1.6, 2.4]} rough={0.9} />
      <P g="box" c={'#8a2a1a'} p={[0, 7.6, 1.25]} s={[7.4, 0.2, 0.05]} e={0.8} />
      <group ref={fl}>
        <P g="box" c="#ff6a20" p={[0, 3.5, 0]} s={[7.2, 7, 0.2]} e={1.2} o={0.28} />
      </group>
      <Glow p={[0, 4, 0.5]} s={14} o={0.35} c="#ff5a20" />
      {[1, -1].map((s) => <group key={s} position={[s * 5.2, 8, 1.3]}><P g="sphere" c="#ff3a1a" s={0.3} e={2} /></group>)}
    </group>
  );
}
function SandBank() {
  return <group><P g="sphere" c="#8a6a4a" p={[0, 0, 0]} s={[8, 0.9, 4]} /><P g="sphere" c="#a88060" p={[1.5, 0.2, 0.5]} s={[4, 0.6, 2.5]} /></group>;
}
function Benben() {
  return <group><P g="box" c="#b8946a" p={[0, 0.25, 0]} s={[1.6, 0.5, 1.6]} /><P g="pyr" c={GOLD} p={[0, 1.2, 0]} s={[0.7, 1.4, 0.7]} metal={0.9} rough={0.2} e={0.25} /><Glow p={[0, 1.4, 0]} s={3.5} o={0.35} c="#ffd27a" /></group>;
}
function Ankh() {
  return <group><P g="torus" c={GOLD} p={[0, 1.6, 0]} s={[0.55, 0.7, 0.55]} metal={0.8} e={0.5} /><P g="box" c={GOLD} p={[0, 0.5, 0]} s={[0.22, 1.9, 0.22]} metal={0.8} e={0.5} /><P g="box" c={GOLD} p={[0, 1.0, 0]} s={[1.1, 0.22, 0.22]} metal={0.8} e={0.5} /><Glow p={[0, 1.2, 0]} s={5} o={0.4} c="#ffcf6a" /></group>;
}
function Feather() {
  return <group><P g="sphere" c="#fffaf0" p={[0, 0.9, 0]} s={[0.35, 1.0, 0.05]} e={0.9} /><P g="box" c={GOLD} p={[0, 0.5, 0.02]} s={[0.03, 1.7, 0.03]} metal={0.6} /><Glow p={[0, 0.9, 0]} s={3.5} o={0.4} c="#fff4c0" /></group>;
}
function Heart() {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => { g.current.scale.setScalar(1 + Math.pow(Math.sin(clock.animT * 4), 8) * 0.12); });
  return <group ref={g}><P g="sphere" c="#c01a2a" p={[0, 0, 0]} s={[0.4, 0.45, 0.35]} e={0.9} rough={0.2} /><P g="sphere" c="#c01a2a" p={[0.18, 0.28, 0]} s={0.2} e={0.9} /><Glow s={2.5} o={0.5} c="#ff3a3a" /></group>;
}
function Sarcophagus() {
  return <group><P g="cyl" c={GOLD} p={[0, 0.8, 0]} s={[0.5, 2.6, 0.4]} r={[0, 0, Math.PI / 2]} metal={0.7} rough={0.35} /><P g="sphere" c={GOLD} p={[1.5, 0.85, 0]} s={0.45} metal={0.8} /></group>;
}

export function PropBody({ def, v }: { def: PropDef; v: Val }) {
  switch (def.kind) {
    case 'barque': return <Barque v={v} def={def} />;
    case 'apep': return <Apep v={v} def={def} />;
    case 'ammit': return <Ammit v={v} def={def} />;
    case 'scale': return <Scale v={v} />;
    case 'chest': return <Chest v={v} />;
    case 'sarcophagus': return <Sarcophagus />;
    case 'sun': return <Sun v={v} def={def} />;
    case 'wingdisk': return <WingedDisk def={def} />;
    case 'ankh': return <Ankh />;
    case 'feather': return <Feather />;
    case 'heart': return <Heart />;
    case 'eyeofra': return <EyeOfRa />;
    case 'scarab': return <Scarab />;
    case 'benben': return <Benben />;
    case 'obelisk': return <Obelisk />;
    case 'throne': return <Throne />;
    case 'jars': return <Jars v={v} />;
    case 'wheel': return <Wheel />;
    case 'nutarch': return <NutArch v={v} />;
    case 'cow': return <Cow />;
    case 'hippo': return <HippoProp def={def} />;
    case 'stoneship': return <Boat def={def} v={v} stone />;
    case 'boat': return <Boat def={def} v={v} />;
    case 'lotus': return <Lotus v={v} />;
    case 'canopic': return <Canopic />;
    case 'senet': return <Senet />;
    case 'altar': case 'table': return <Table />;
    case 'stela': return <Stela def={def} />;
    case 'bier': return <Bier />;
    case 'djed': return <Djed />;
    case 'shrine': return <Shrine def={def} />;
    case 'egg': return <Egg />;
    case 'moon': return <Moon def={def} />;
    case 'tree': return <Tree />;
    case 'flame': return <Flame />;
    case 'gate': return <Gate />;
    case 'sandbank': return <SandBank />;
  }
}

/** Animated wrapper: handles travel (`at` → `to`), visibility windows and the a→a2 parameter ramp. */
export function PropView({ def }: { def: PropDef }) {
  const g = useRef<THREE.Group>(null!);
  const v = useRef(def.a ?? 1);
  const A = new THREE.Vector3(...def.at), B = useMemo(() => new THREE.Vector3(...(def.to ?? def.at)), [def.to, def.at]);
  useFrame(() => {
    const p = clock.progress;
    if (!g.current) return;
    g.current.visible = useVis(def);
    g.current.position.lerpVectors(A, B, def.to ? p : 0);
    if (def.a2 !== undefined) {
      const t0 = def.t0 ?? 0, t1 = def.t1 ?? 1;
      v.current = (def.a ?? 0) + (def.a2 - (def.a ?? 0)) * sm((p - t0) / Math.max(0.001, t1 - t0));
    } else v.current = def.a ?? 1;
  });
  void glow;
  return (
    <group ref={g} position={def.at} rotation={[0, def.ry ?? 0, 0]} scale={def.s ?? 1}>
      <PropBody def={def} v={v} />
    </group>
  );
}

export const Wrap = ({ children }: { children?: ReactNode }) => <>{children}</>;
