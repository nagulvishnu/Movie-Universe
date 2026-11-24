import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clock } from '../film/clock';
import type { V3 } from '../film/types';
import { mat, P } from '../render/prim';
import { flagTexture, glowTexture, hieroglyphTexture, sandTexture } from '../render/textures';

// Shared environment building blocks.
export interface Palette { top: string; mid: string; bottom: string; sun: string; sunDir: V3; sunI: number; fog: string; fogNear: number; fogFar: number; hemiSky: string; hemiGround: string; hemiI: number; key: string; keyI: number }

export const TIME: Record<string, Palette> = {
  dawn: { top: '#38477e', mid: '#ff9c62', bottom: '#8a5a48', sun: '#ffb070', sunDir: [0.15, 0.1, -1], sunI: 1.3, fog: '#c88a6a', fogNear: 40, fogFar: 260, hemiSky: '#a8b4e0', hemiGround: '#6a4a3a', hemiI: 0.9, key: '#ffcf9a', keyI: 2.4 },
  day: { top: '#2f72c8', mid: '#a8d0f0', bottom: '#d8c8a0', sun: '#fff2c8', sunDir: [0.3, 0.75, -0.5], sunI: 0.9, fog: '#cfd8d8', fogNear: 60, fogFar: 320, hemiSky: '#cfe4ff', hemiGround: '#a89060', hemiI: 1.1, key: '#fff1d0', keyI: 3.0 },
  dusk: { top: '#26255e', mid: '#ff6a3a', bottom: '#4a2828', sun: '#ff7a3a', sunDir: [-0.1, 0.06, -1], sunI: 1.4, fog: '#a8503a', fogNear: 40, fogFar: 240, hemiSky: '#8a7ab0', hemiGround: '#5a3028', hemiI: 0.8, key: '#ff9a62', keyI: 2.4 },
  night: { top: '#03061a', mid: '#0f1a3c', bottom: '#070a16', sun: '#8fb0ff', sunDir: [0.4, 0.5, -1], sunI: 0.0, fog: '#0a1226', fogNear: 30, fogFar: 200, hemiSky: '#3a4a8a', hemiGround: '#141820', hemiI: 0.7, key: '#9fb8ff', keyI: 1.3 },
  sunrise: { top: '#5864b0', mid: '#ffc272', bottom: '#d08a4a', sun: '#ffd890', sunDir: [0, 0.14, -1], sunI: 1.8, fog: '#e8a870', fogNear: 50, fogFar: 300, hemiSky: '#c8c8f0', hemiGround: '#a07048', hemiI: 1.0, key: '#ffd8a0', keyI: 2.8 },
  storm: { top: '#242028', mid: '#6a4a3a', bottom: '#2e2420', sun: '#ff9a62', sunDir: [0.3, 0.1, -1], sunI: 0.3, fog: '#4a362e', fogNear: 20, fogFar: 150, hemiSky: '#7a6a7a', hemiGround: '#3a2a22', hemiI: 0.8, key: '#ffb080', keyI: 1.6 },
  blood: { top: '#360a0c', mid: '#b83c1c', bottom: '#2a0a08', sun: '#ff4a2a', sunDir: [0.2, 0.12, -1], sunI: 1.4, fog: '#7a2a18', fogNear: 20, fogFar: 140, hemiSky: '#a05a5a', hemiGround: '#3a1210', hemiI: 0.8, key: '#ff7a4a', keyI: 2.2 },
};

const skyVert = `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const skyFrag = `varying vec3 vP; uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBot; uniform vec3 uSun; uniform vec3 uSunDir; uniform float uSunI;
void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(uMid, uTop, pow(h, 0.55)) : mix(uMid, uBot, pow(-h, 0.45));
 float s = max(dot(normalize(vP), normalize(uSunDir)), 0.0); c += uSun * (pow(s, 90.0) * 1.6 + pow(s, 8.0) * 0.45 * uSunI + pow(s, 2.0) * 0.12 * uSunI); gl_FragColor = vec4(c, 1.0); }`;

export function Sky({ pal }: { pal: Palette }) {
  const ref = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color(pal.top) }, uMid: { value: new THREE.Color(pal.mid) }, uBot: { value: new THREE.Color(pal.bottom) }, uSun: { value: new THREE.Color(pal.sun) }, uSunDir: { value: new THREE.Vector3(...pal.sunDir) }, uSunI: { value: pal.sunI } },
  }), [pal]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => ref.current.position.copy(camera.position));
  return <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}><sphereGeometry args={[300, 24, 16]} /></mesh>;
}

export function Atmos({ color, near, far }: { color: string; near: number; far: number }) {
  return (<><color attach="background" args={[color]} /><fog attach="fog" args={[color, near, far]} /></>);
}

export function Lights({ pal, key2 = [-12, 16, 14], shadow = true, hemi = 1, extra }: { pal: Palette; key2?: V3; shadow?: boolean; hemi?: number; extra?: React.ReactNode }) {
  const high = clock.quality === 'high' && shadow;
  return (
    <>
      <hemisphereLight args={[pal.hemiSky, pal.hemiGround, pal.hemiI * hemi]} />
      <directionalLight position={key2} color={pal.key} intensity={pal.keyI} castShadow={high} shadow-mapSize={[1536, 1536]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-12} shadow-camera-near={1} shadow-camera-far={70} shadow-bias={-0.0005} />
      {extra}
    </>
  );
}

// ---- Water ----
const waterVert = `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const waterFrag = `varying vec3 vW; uniform float uT; uniform vec3 uA; uniform vec3 uB; uniform vec3 uG; uniform vec3 uFog; uniform float uNear; uniform float uFar; uniform float uGl;
void main(){ vec2 p = vW.xz; float w = sin(p.x*0.5+uT*0.9)*sin(p.y*0.43+uT*0.7) + 0.5*sin(p.x*1.7-uT*1.3+p.y*0.9) + 0.25*sin(p.x*3.1+p.y*2.7+uT*2.1);
 float g = smoothstep(0.75, 1.3, w); vec3 c = mix(uA, uB, 0.5 + 0.35 * w); c += uG * g * uGl;
 float d = distance(vW, cameraPosition); float f = smoothstep(uNear, uFar, d); gl_FragColor = vec4(mix(c, uFog, f), 1.0); }`;

export function Water({ a = '#0b2a3a', b = '#1d5a70', glint = '#8fe0ff', fog = '#0a1c28', near = 30, far = 220, y = 0, size = [600, 400] as [number, number], pos = [0, 0] as [number, number], gl = 0.6 }: { a?: string; b?: string; glint?: string; fog?: string; near?: number; far?: number; y?: number; size?: [number, number]; pos?: [number, number]; gl?: number }) {
  const material = useMemo(() => new THREE.ShaderMaterial({ vertexShader: waterVert, fragmentShader: waterFrag, uniforms: { uT: { value: 0 }, uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) }, uG: { value: new THREE.Color(glint) }, uFog: { value: new THREE.Color(fog) }, uNear: { value: near }, uFar: { value: far }, uGl: { value: gl } } }), [a, b, glint, fog, near, far, gl]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => { material.uniforms.uT.value = clock.animT; });
  return <mesh material={material} rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], y, pos[1]]}><planeGeometry args={size} /></mesh>;
}

// ---- Terrain ----
export function Dunes({ color = '#d8b878', amp = 2.5, size = 360, flat = 26, y = 0, seed = 1, rock = false, pos = [0, 0] as [number, number], tile = 40 }: { color?: string; amp?: number; size?: number; flat?: number; y?: number; seed?: number; rock?: boolean; pos?: [number, number]; tile?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 110, 110);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const r = Math.hypot(x, z);
      let h = Math.sin(x * 0.05 + seed) * Math.cos(z * 0.04 + seed * 2) + 0.5 * Math.sin(x * 0.13 + z * 0.09 + seed) + 0.25 * Math.sin(z * 0.27 + x * 0.21);
      if (rock) h = Math.abs(h) * 1.6;
      p.setY(i, h * amp * Math.min(1, Math.max(0, (r - flat) / 28)));
    }
    g.computeVertexNormals();
    return g;
  }, [size, amp, flat, seed, rock]);
  useEffect(() => () => geo.dispose(), [geo]);
  const tex = sandTexture();
  const m = useMemo(() => { const t = tex.clone(); t.repeat.set(size / tile, size / tile); t.needsUpdate = true; return mat(color, { map: t, rough: 0.95 }); }, [tex, color, size, tile]);
  return <mesh geometry={geo} material={m} position={[pos[0], y, pos[1]]} receiveShadow />;
}

export function Flat({ w = 400, d = 200, color = '#d8b878', pos = [0, 0, 0] as V3, map = false, y = 0, rough = 0.95, metal = 0 }: { w?: number; d?: number; color?: string; pos?: V3; map?: boolean; y?: number; rough?: number; metal?: number }) {
  const m = useMemo(() => {
    if (!map) return mat(color, { rough, metal });
    const t = flagTexture().clone(); t.repeat.set(w / 8, d / 8); t.needsUpdate = true; return mat(color, { map: t, rough, metal });
  }, [map, color, w, d, rough, metal]);
  return <mesh material={m} rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], pos[1] + y, pos[2]]} receiveShadow><planeGeometry args={[w, d]} /></mesh>;
}

// ---- Architecture ----
export function Column({ p, h = 11, r = 0.9, lotus = true, tint = '#e6c8a0' }: { p: V3; h?: number; r?: number; lotus?: boolean; tint?: string }) {
  const m = useMemo(() => { const t = hieroglyphTexture().clone(); t.repeat.set(3, Math.max(1, h / 4)); t.needsUpdate = true; return mat(tint, { map: t, rough: 0.8 }); }, [h, tint]);
  return (
    <group position={p}>
      <P g="cyl" c="#a8845a" p={[0, 0.3, 0]} s={[r * 1.35, 0.6, r * 1.35]} />
      <P g="cyl" mt={m} p={[0, h / 2 + 0.3, 0]} s={[r, h, r]} cast />
      <P g="cyl" c="#2a6a8a" p={[0, h - 0.5, 0]} s={[r * 1.06, 0.4, r * 1.06]} />
      <P g="cyl" c="#b8392a" p={[0, h - 1.0, 0]} s={[r * 1.04, 0.16, r * 1.04]} />
      {lotus ? <P g="tcone" c="#d8b070" p={[0, h + 0.7, 0]} s={[r * 1.7, 1.4, r * 1.7]} r={[Math.PI, 0, 0]} /> : <P g="box" c="#c8a070" p={[0, h + 0.5, 0]} s={[r * 2.6, 0.9, r * 2.6]} />}
      <P g="box" c="#b89060" p={[0, h + 1.6, 0]} s={[r * 3, 0.5, r * 3]} />
    </group>
  );
}

export function Palm({ p, s = 1, lean = 0 }: { p: V3; s?: number; lean?: number }) {
  return (
    <group position={p} scale={s} rotation={[0, lean * 3, lean * 0.18]}>
      <P g="cyl" c="#7a5a3a" p={[0, 3.2, 0]} s={[0.22, 6.4, 0.22]} r={[0, 0, 0.05]} rough={1} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <group key={i} position={[0.15, 6.3, 0]} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
          <P g="cone" c={i % 2 ? '#3f7a3a' : '#4a8a42'} p={[0, 0.0, 1.5]} s={[0.35, 3.2, 0.06]} r={[Math.PI / 2 + 0.65, 0, 0]} />
        </group>
      ))}
    </group>
  );
}

export function PalmGrove({ seed = 1, n = 12, z0 = -14, z1 = -36, spread = 90 }: { seed?: number; n?: number; z0?: number; z1?: number; spread?: number }) {
  const items = useMemo(() => Array.from({ length: n }, (_, i) => { const r = (k: number) => Math.abs(Math.sin(seed * 91.7 + i * 12.9898 + k * 78.233) * 43758.5453) % 1; return { x: (r(1) - 0.5) * spread, z: z1 + (z0 - z1) * r(2), s: 0.8 + r(3) * 0.7, l: r(4) - 0.5 }; }), [seed, n, z0, z1, spread]);
  return <>{items.map((it, i) => <Palm key={i} p={[it.x, 0, it.z]} s={it.s} lean={it.l} />)}</>;
}

export function Houses({ n = 8, z = -40, spread = 120, seed = 3, color = '#d4b88a' }: { n?: number; z?: number; spread?: number; seed?: number; color?: string }) {
  const items = useMemo(() => Array.from({ length: n }, (_, i) => { const r = (k: number) => Math.abs(Math.sin(seed * 31.7 + i * 12.9898 + k * 78.233) * 43758.5453) % 1; return { x: (r(1) - 0.5) * spread, z: z + (r(2) - 0.5) * 14, w: 5 + r(3) * 5, h: 3.5 + r(4) * 3 }; }), [n, z, spread, seed]);
  return (<>{items.map((h, i) => (
    <group key={i} position={[h.x, 0, h.z]}>
      <P g="box" c={color} p={[0, h.h / 2, 0]} s={[h.w, h.h, h.w * 0.8]} rough={1} />
      <P g="box" c="#b89a6a" p={[0, h.h + 0.15, 0]} s={[h.w * 1.05, 0.3, h.w * 0.85]} />
      <P g="box" c="#3a2a1a" p={[0, 1.2, h.w * 0.4 + 0.02]} s={[1.1, 2.4, 0.05]} />
      <P g="box" c="#2a1a10" p={[h.w * 0.25, h.h * 0.65, h.w * 0.4 + 0.02]} s={[0.7, 0.7, 0.05]} />
    </group>
  ))}</>);
}

export function Pyramids({ z = -190, color = '#d9bb82' }: { z?: number; color?: string }) {
  return (
    <>
      <P g="pyr" c={color} p={[-70, 36, z]} s={[60, 72, 60]} rough={1} />
      <P g="pyr" c={color} p={[30, 30, z - 20]} s={[50, 60, 50]} rough={1} />
      <P g="pyr" c="#cfae78" p={[95, 14, z + 25]} s={[24, 28, 24]} rough={1} />
    </>
  );
}

export function Reeds({ n = 260, area = [60, 40] as [number, number], hole = 6, h = 4.5, color = '#5a8a3a', seed = 5, y = 0, c = [0, 0] as [number, number] }: { n?: number; area?: [number, number]; hole?: number; h?: number; color?: string; seed?: number; y?: number; c?: [number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const grp = useRef<THREE.Group>(null!);
  const count = Math.round(n * (clock.quality === 'low' ? 0.5 : clock.quality === 'medium' ? 0.8 : 1));
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
    let i = 0, tries = 0;
    const r = (k: number, j: number) => Math.abs(Math.sin(seed * 17.1 + j * 12.9898 + k * 78.233) * 43758.5453) % 1;
    while (i < count && tries < count * 8) {
      const x = (r(1, tries) - 0.5) * area[0], z = (r(2, tries) - 0.5) * area[1]; tries++;
      if (Math.hypot(x, z) < hole) continue;
      const hh = h * (0.6 + r(3, tries) * 0.7);
      pos.set(c[0] + x, y + hh / 2, c[1] + z); e.set((r(4, tries) - 0.5) * 0.25, 0, (r(5, tries) - 0.5) * 0.25); q.setFromEuler(e); sc.set(0.07 + r(6, tries) * 0.05, hh, 0.07);
      m.compose(pos, q, sc); ref.current.setMatrixAt(i++, m);
    }
    ref.current.count = i; ref.current.instanceMatrix.needsUpdate = true;
  }, [count, area, hole, h, seed, y, c]);
  useFrame(() => { if (grp.current) grp.current.rotation.z = Math.sin(clock.animT * 0.6) * 0.012; });
  return (
    <group ref={grp}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
        <coneGeometry args={[1, 1, 4]} /><meshStandardMaterial color={color} roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

export function Clouds({ n = 28, y = -3, r = 60, c = '#fff2e0', o = 0.9, seed = 2, thick = 3 }: { n?: number; y?: number; r?: number; c?: string; o?: number; seed?: number; thick?: number }) {
  const items = useMemo(() => Array.from({ length: n }, (_, i) => { const k = (j: number) => Math.abs(Math.sin(seed * 51.7 + i * 12.9898 + j * 78.233) * 43758.5453) % 1; const a = k(1) * Math.PI * 2, rr = Math.sqrt(k(2)) * r; return { x: Math.cos(a) * rr, z: Math.sin(a) * rr, s: 5 + k(3) * 9, h: 0.8 + k(4) * 0.6 }; }), [n, r, seed]);
  const tex = glowTexture();
  return (<>{items.map((it, i) => <sprite key={i} position={[it.x, y + it.h, it.z]} scale={[it.s * 2.4, it.s * thick * 0.4, 1]}><spriteMaterial map={tex} color={c} transparent opacity={o} depthWrite={false} /></sprite>)}</>);
}

export function TorchLight({ p, c = '#ff8a30', i = 16, d = 28 }: { p: V3; c?: string; i?: number; d?: number }) {
  const l = useRef<THREE.PointLight>(null!);
  useFrame(() => { if (l.current) l.current.intensity = i * (0.85 + Math.sin(clock.animT * 11 + p[0]) * 0.08 + Math.sin(clock.animT * 23) * 0.05); });
  return <pointLight ref={l} position={p} color={c} intensity={i} distance={d} decay={1.6} />;
}

export function Glint({ p, c, s, o = 0.6 }: { p: V3; c: string; s: number; o?: number }) {
  const tex = glowTexture();
  return <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={tex} color={c} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></sprite>;
}
