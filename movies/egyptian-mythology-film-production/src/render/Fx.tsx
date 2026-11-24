import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clock, qualityScale } from '../film/clock';
import type { FxDef, V3 } from '../film/types';
import { glowTexture } from './textures';

// GPU-driven particle fields: positions are computed in the vertex shader, so there is no per-particle CPU work.
const vert = /* glsl */ `
  uniform float uTime; uniform vec3 uArea; uniform vec3 uAt; uniform vec3 uVel; uniform float uSize; uniform float uSway; uniform float uAge; uniform float uMode;
  attribute vec3 aRand; varying float vA; varying float vT;
  void main(){
    vec3 p = position; float t = uTime;
    vec3 q;
    if (uMode < 0.5) {
      q = fract(p + 0.5 + uVel * t * (0.4 + aRand.x)) - 0.5;
      q.x += sin(t * (0.3 + aRand.y) + aRand.z * 6.28) * uSway; q.z += cos(t * (0.25 + aRand.x) + aRand.y * 6.28) * uSway;
      q *= uArea;
    } else if (uMode < 1.5) {
      vec3 d = normalize(p + vec3(0.0001));
      float r = uAge * (2.0 + aRand.x * 6.0) * uVel.x;
      q = d * r; q.y -= uAge * uAge * 2.0 * aRand.y;
    } else {
      q = normalize(p + vec3(0.0001)) * uArea.x;
    }
    vec4 mv = modelViewMatrix * vec4(q + uAt, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.65 + 0.35 * sin(t * (1.0 + aRand.x * 3.0) + aRand.z * 20.0);
    float edge = uMode < 0.5 ? smoothstep(0.0, 0.12, fract(p.y + 0.5 + uVel.y * t * (0.4 + aRand.x))) * (1.0 - smoothstep(0.88, 1.0, fract(p.y + 0.5 + uVel.y * t * (0.4 + aRand.x)))) : 1.0;
    vA = tw * (uMode < 0.5 ? max(edge, 0.0) : uMode < 1.5 ? clamp(1.0 - uAge / 2.2, 0.0, 1.0) : tw);
    vT = aRand.x;
    gl_PointSize = uSize * (0.6 + aRand.y * 0.9) * (900.0 / max(0.5, -mv.z));
  }`;
const frag = /* glsl */ `
  uniform vec3 uColor; varying float vA; varying float vT;
  void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uColor * (0.8 + vT * 0.5), a * vA); }`;

function Field({ def, mode }: { def: FxDef; mode: 'motes' | 'embers' | 'sparks' | 'sand' | 'rain' | 'stars' | 'burst' }) {
  const q = qualityScale(clock.quality);
  const count = Math.max(24, Math.floor((def.n ?? 120) * (mode === 'stars' ? Math.max(0.5, q) : q)));
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), rnd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      if (mode === 'stars') { const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 0.95 + 0.02); pos[j] = Math.sin(ph) * Math.cos(th); pos[j + 1] = Math.cos(ph); pos[j + 2] = Math.sin(ph) * Math.sin(th); }
      else if (mode === 'burst' || mode === 'sparks') { pos[j] = Math.random() - 0.5; pos[j + 1] = Math.random() - 0.3; pos[j + 2] = Math.random() - 0.5; }
      else { pos[j] = Math.random() - 0.5; pos[j + 1] = Math.random() - 0.5; pos[j + 2] = Math.random() - 0.5; }
      rnd[j] = Math.random(); rnd[j + 1] = Math.random(); rnd[j + 2] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 3));
    const vel: V3 = mode === 'embers' ? [0, 0.1, 0] : mode === 'sand' ? [0.5, 0.02, 0.08] : mode === 'rain' ? [0.02, -1.4, 0] : mode === 'sparks' ? [1, 0.2, 0] : mode === 'burst' ? [1.4, 0, 0] : [0.01, 0.05, 0.01];
    const m = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uArea: { value: new THREE.Vector3(...(def.area ?? [14, 8, 14])) }, uAt: { value: new THREE.Vector3(...(def.at ?? [0, mode === 'stars' ? 0 : 3, 0])) },
        uVel: { value: new THREE.Vector3(...vel) }, uSize: { value: (def.size ?? (mode === 'sand' ? 0.05 : mode === 'rain' ? 0.025 : mode === 'stars' ? 0.5 : 0.07)) * (def.speed ? 1 : 1) },
        uSway: { value: mode === 'sand' || mode === 'rain' ? 0.0 : 0.04 }, uAge: { value: 0 }, uColor: { value: new THREE.Color(def.color ?? (mode === 'stars' ? '#dfe8ff' : '#ffd27a')) },
        uMode: { value: mode === 'stars' ? 2 : mode === 'burst' || mode === 'sparks' ? 1 : 0 },
      },
    });
    if (mode === 'stars') m.uniforms.uArea.value.set(220, 220, 220);
    return { geo: g, mat: m };
  }, [count, def, mode]);
  const ref = useRef<THREE.Points>(null!);
  const useEnter = mode === 'burst' || mode === 'sparks';
  useFrame(() => {
    mat.uniforms.uTime.value = clock.animT * (def.speed ?? 1);
    if (useEnter) {
      const age = Math.max(0, clock.sceneTime - (def.enter ?? 0) * clock.sceneDur);
      mat.uniforms.uAge.value = mode === 'sparks' ? age % 2.2 : Math.min(age, 2.2);
    }
    if (ref.current) ref.current.visible = inWindow(def);
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const frustum = false;
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={frustum} />;
}

const inWindow = (d: { enter?: number; exit?: number }) => clock.progress >= (d.enter ?? 0) && clock.progress <= (d.exit ?? 1.001);

function Rings({ def }: { def: FxDef }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const col = def.color ?? '#9fe0ff';
  useFrame(() => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const u = ((clock.animT * 0.25 + i / 3) % 1);
      m.scale.setScalar(0.5 + u * 12);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.55;
      m.visible = inWindow(def);
    });
  });
  return (
    <group position={def.at ?? [0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { if (m) refs.current[i] = m; }}>
          <ringGeometry args={[0.92, 1, 64]} />
          <meshBasicMaterial color={col} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

function Beam({ def }: { def: FxDef }) {
  const ref = useRef<THREE.Group>(null!);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...(def.at ?? [0, 0, 0])), b = new THREE.Vector3(...(def.to ?? [0, 10, 0]));
    const dir = b.clone().sub(a);
    return { pos: a.clone().add(b).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), len: dir.length() };
  }, [def]);
  useFrame(() => {
    const t = clock.animT;
    mats.current.forEach((m, i) => { if (m) m.opacity = (i === 0 ? 0.55 : 0.18) * (0.75 + Math.sin(t * 7 + i * 2) * 0.25); });
    if (ref.current) { ref.current.visible = inWindow(def); ref.current.scale.x = ref.current.scale.z = 0.85 + Math.sin(t * 9) * 0.15; }
  });
  const col = def.color ?? '#ffd27a';
  return (
    <group position={pos} quaternion={quat}>
      <group ref={ref}>
        <mesh scale={[1, len, 1]}><cylinderGeometry args={[0.1, 0.1, 1, 10, 1, true]} /><meshBasicMaterial ref={(m) => { if (m) mats.current[0] = m; }} color={col} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>
        <mesh scale={[1, len, 1]}><cylinderGeometry args={[0.35, 0.35, 1, 10, 1, true]} /><meshBasicMaterial ref={(m) => { if (m) mats.current[1] = m; }} color={col} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>
      </group>
    </group>
  );
}

function Lightning({ def }: { def: FxDef }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const state = useRef({ last: -1 });
  const N = 14;
  const base = def.at ?? [0, 24, 0];
  useFrame(() => {
    const t = clock.animT, cyc = Math.floor(t / 2.7), ph = t % 2.7;
    const show = ph < 0.32 && ((ph * 17) | 0) % 3 !== 1;
    refs.current.forEach((m) => { if (m) m.visible = show && inWindow(def); });
    if (show && state.current.last !== cyc) {
      state.current.last = cyc;
      const r = (cyc * 9301 + 49297) % 233280 / 233280;
      let x = base[0] + (r - 0.5) * 6, y = base[1], z = base[2];
      for (let i = 0; i < N; i++) {
        const nx = x + (Math.sin(cyc * 3.1 + i * 12.9) * 1.6), ny = y - base[1] / N, nz = z + Math.cos(cyc * 7.7 + i * 5.1) * 0.8;
        const m = refs.current[i]; if (!m) continue;
        const dx = nx - x, dy = ny - y, dz = nz - z, L = Math.hypot(dx, dy, dz);
        m.position.set((x + nx) / 2, (y + ny) / 2, (z + nz) / 2);
        m.scale.set(0.12, L, 0.12);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
        x = nx; y = ny; z = nz;
      }
    }
  });
  return (
    <group>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) refs.current[i] = m; }} visible={false}>
          <boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="#cfe0ff" fog={false} />
        </mesh>
      ))}
    </group>
  );
}

function Rays({ def }: { def: FxDef }) {
  const ref = useRef<THREE.Sprite>(null!);
  const mat = useMemo(() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d')!; c.translate(128, 128);
    for (let i = 0; i < 24; i++) { c.rotate((Math.PI * 2) / 24); const g = c.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, 'rgba(255,255,255,0.65)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(128, -3 - (i % 3) * 3); c.lineTo(128, 3 + (i % 3) * 3); c.fill(); }
    const tex = new THREE.CanvasTexture(cv);
    return new THREE.SpriteMaterial({ map: tex, color: def.color ?? '#ffd27a', transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  }, [def.color]);
  useFrame(() => { mat.rotation = clock.animT * 0.04; if (ref.current) ref.current.visible = inWindow(def); });
  return <sprite ref={ref} material={mat} position={def.at ?? [0, 8, -20]} scale={[70, 70, 1]} />;
}

function Mist({ def }: { def: FxDef }) {
  const area = def.area ?? [20, 1, 12];
  const mats = useMemo(() => Array.from({ length: Math.round(8 * qualityScale(clock.quality)) + 3 }, (_, i) => ({ i, x: (Math.random() - 0.5) * area[0], z: (Math.random() - 0.5) * area[2], s: 6 + Math.random() * 8 })), [area]);
  const ref = useRef<THREE.Group>(null!);
  const tex = glowTexture();
  useFrame(() => { if (ref.current) { ref.current.position.x = Math.sin(clock.animT * 0.1) * 1.5; ref.current.visible = inWindow(def); } });
  const at = def.at ?? [0, 0.6, 0];
  return (
    <group position={at} ref={ref}>
      {mats.map((m) => <sprite key={m.i} position={[m.x, 0, m.z]} scale={[m.s, m.s * 0.35, 1]}><spriteMaterial map={tex} color={def.color ?? '#ffffff'} transparent opacity={0.22} depthWrite={false} fog={false} /></sprite>)}
    </group>
  );
}

export function FxView({ def }: { def: FxDef }) {
  switch (def.k) {
    case 'rings': return <Rings def={def} />;
    case 'beam': return <Beam def={def} />;
    case 'lightning': return <Lightning def={def} />;
    case 'rays': return <Rays def={def} />;
    case 'mist': return <Mist def={def} />;
    default: return <Field def={def} mode={def.k} />;
  }
}
