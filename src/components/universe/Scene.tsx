"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MovieTheme, ParticleKind } from "@/lib/movies";
import { BRAND_THEME, rig, targetFps, type WorldMode } from "./state";

// THE INFINITE CINEMA — a single, lightweight render loop.
// Everything repeated is instanced or point-based, materials are created once, the animation is
// driven by one throttled ticker, and no post-processing library is used (glow is additive shaders).

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ease = (x: number) => x * x * (3 - 2 * x);
const additive = THREE.AdditiveBlending;

// ---------------------------------------------------------------- shaders

const NOISE = /* glsl */ `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}
`;

const STAR_VERT = /* glsl */ `
attribute float aSize; attribute float aSeed; attribute vec3 aColor;
uniform float uTime; uniform float uAct; uniform float uPx;
varying vec3 vCol; varying float vA;
void main(){
  vec4 mv = modelViewMatrix*vec4(position,1.);
  gl_Position = projectionMatrix*mv;
  float tw = .65+.35*sin(uTime*(.5+aSeed*2.)+aSeed*40.);
  float lit = smoothstep(aSeed*.85, aSeed*.85+.2, uAct);
  vA = tw*lit; vCol = aColor;
  gl_PointSize = aSize*uPx*(.8+.4*tw);
}`;
const STAR_FRAG = /* glsl */ `
varying vec3 vCol; varying float vA;
void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.0,d); gl_FragColor=vec4(vCol,a*a*vA); }`;

const NEB_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const NEB_FRAG = /* glsl */ `
uniform float uTime; uniform float uAct; uniform float uOpacity; uniform vec3 uA; uniform vec3 uB; uniform float uSeed;
varying vec2 vUv;
${NOISE}
void main(){
  vec2 p = vUv*3. + uSeed;
  float n = fbm(p + vec2(uTime*.018,0.) + fbm(p*.7 - uTime*.012)*1.6);
  float mask = smoothstep(.0,.55,.5-length(vUv-.5));
  float d = smoothstep(.32,.85,n);
  vec3 col = mix(uA,uB,n);
  gl_FragColor = vec4(col, d*mask*uOpacity*uAct);
}`;

const PORTAL_FRAG = /* glsl */ `
uniform float uTime; uniform float uAct; uniform vec3 uA; uniform vec3 uB; varying vec2 vUv;
void main(){
  vec2 p=vUv*2.-1.; float r=length(p); if(r>1.) discard; float a=atan(p.y,p.x);
  float swirl=sin(a*5.+r*10.-uTime*1.5+sin(r*6.-uTime)*1.5);
  float rings=sin(r*26.-uTime*3.)*.5+.5;
  float core=smoothstep(.0,.9,1.-r);
  vec3 col=mix(uA,uB,swirl*.5+.5)*(.35+.65*rings*(1.-r))+vec3(1.,.9,.78)*pow(core,4.)*.9;
  float edge=smoothstep(1.,.78,r);
  float alpha=edge*(.22+.6*core+.12*(swirl*.5+.5))*uAct;
  gl_FragColor=vec4(col*uAct,alpha);
}`;
const GLOW_FRAG = /* glsl */ `
uniform float uAct; uniform vec3 uA; varying vec2 vUv;
void main(){ float d=length(vUv-.5)*2.; float g=smoothstep(1.,.2,d); gl_FragColor=vec4(uA, g*g*.55*uAct); }`;

const PATH_FRAG = /* glsl */ `
uniform float uTime; uniform float uAct; uniform vec3 uA; uniform vec3 uB; uniform float uOff; varying vec2 vUv;
void main(){
  float f=fract(vUv.x*5.-uTime*.3+uOff);
  float pulse=smoothstep(.0,.08,f)*smoothstep(.5,.08,f);
  vec3 col=mix(uA,uB,fract(vUv.x*2.+uOff));
  gl_FragColor=vec4(col*(.4+pulse*1.6),(.12+pulse*.85)*uAct);
}`;

const PART_VERT = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime; uniform float uOpacity; uniform float uPx; uniform float uSize; uniform vec3 uVel; uniform vec3 uBox;
varying float vA;
void main(){
  vec3 p=(aSeed.xyz-.5)*uBox;
  p+=uVel*uTime*(.6+aSeed.w*.8);
  p=mod(p+uBox*.5,uBox)-uBox*.5;
  p.x+=sin(uTime*.3+aSeed.w*30.)*.35;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=min(uSize*(.5+aSeed.w)*uPx*(26./max(-mv.z,1.)),180.*uPx);
  vA=smoothstep(.0,5.,-mv.z)*(.35+.65*fract(aSeed.w*7.))*uOpacity;
}`;
const PART_FRAG_SRC = /* glsl */ `
uniform vec3 uColor; uniform float uShape; varying float vA;
void main(){
  vec2 c=gl_PointCoord-.5;
  float d=mix(length(c)*2.,max(abs(c.x)*12.,abs(c.y)*2.),uShape);
  float a=1.-smoothstep(.0,1.,d);
  gl_FragColor=vec4(uColor,a*a*vA);
}`;

const FRAME_FRAG = /* glsl */ `
uniform float uTime; uniform float uAct; uniform float uHasTex; uniform sampler2D uTex; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; varying vec2 vUv;
void main(){
  vec2 uv=vUv;
  vec3 col=mix(uB*.35,uA*.9,smoothstep(.0,1.,uv.y));
  float glow=smoothstep(.55,.0,length((uv-vec2(.5,.6))*vec2(1.,1.3))); col+=uC*glow*.55;
  float h=.2+.1*sin(uv.x*13.)+.06*sin(uv.x*37.+1.)+.04*sin(uv.x*71.);
  col=mix(col,vec3(.008,.01,.03),step(uv.y,h));
  if(uHasTex>.5){ col=texture2D(uTex,uv).rgb; }
  col*=.9+.1*sin(uv.y*240.-uTime*3.);
  float sweep=smoothstep(.0,.1,1.-abs(fract(uv.y*.6+uv.x*.35-uTime*.12)*2.-1.)); col+=uC*sweep*.14;
  vec2 e=min(uv,1.-uv); float b=1.-smoothstep(.0,.022,min(e.x,e.y));
  col=mix(col,uC*1.5+.25,b);
  gl_FragColor=vec4(col,(.9+b*.1)*uAct);
}`;

// ---------------------------------------------------------------- helpers

const tmpColor = new THREE.Color();
const dummy = new THREE.Object3D();

function useMovingColor(hex: string) {
  const [colors] = useState(() => ({ target: new THREE.Color(hex), current: new THREE.Color(hex) }));
  useEffect(() => {
    colors.target.set(hex);
  }, [hex, colors]);
  return colors;
}

// ---------------------------------------------------------------- stars

function Stars({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const data = useMemo(() => {
    const r = rng(7);
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color("#ffffff"), new THREE.Color("#9db8ff"), new THREE.Color("#c9a6ff"), new THREE.Color("#ffe2a8")];
    for (let i = 0; i < count; i++) {
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      const rad = 70 + r() * 90;
      pos[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = -Math.abs(rad * Math.cos(ph)) - 10;
      size[i] = 1 + r() * r() * 3.2;
      seed[i] = r();
      const c = palette[Math.floor(r() * palette.length)];
      col.set([c.r, c.g, c.b], i * 3);
    }
    return { pos, size, seed, col };
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uAct: { value: 0 }, uPx: { value: 1 } }), []);

  useFrame(() => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = rig.time;
    m.uniforms.uAct.value = rig.activation;
    m.uniforms.uPx.value = dpr;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[data.size, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[data.seed, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[data.col, 3]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} vertexShader={STAR_VERT} fragmentShader={STAR_FRAG} uniforms={uniforms} transparent depthWrite={false} blending={additive} />
    </points>
  );
}

// ---------------------------------------------------------------- nebula

const NEBULA_SLOTS = [
  { pos: [-18, 6, -70] as const, scale: 90, seed: 1.3, op: 0.55 },
  { pos: [26, -8, -80] as const, scale: 110, seed: 4.1, op: 0.5 },
  { pos: [0, 14, -95] as const, scale: 130, seed: 8.7, op: 0.4 },
];

function Nebula({ count, a, b }: { count: number; a: React.MutableRefObject<THREE.Color>; b: React.MutableRefObject<THREE.Color> }) {
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const uniformSets = useMemo(
    () =>
      NEBULA_SLOTS.map((s) => ({
        uTime: { value: 0 },
        uAct: { value: 0 },
        uOpacity: { value: s.op },
        uA: { value: new THREE.Color() },
        uB: { value: new THREE.Color() },
        uSeed: { value: s.seed },
      })),
    [],
  );
  useFrame(() => {
    mats.current.forEach((m, i) => {
      if (!m) return;
      m.uniforms.uTime.value = rig.time;
      m.uniforms.uAct.value = ease(Math.min(1, Math.max(0, rig.activation * 1.4 - 0.2)));
      (m.uniforms.uA.value as THREE.Color).copy(a.current);
      (m.uniforms.uB.value as THREE.Color).copy(i % 2 ? b.current : a.current).lerp(b.current, 0.4);
    });
  });
  return (
    <group>
      {NEBULA_SLOTS.slice(0, count).map((s, i) => (
        <mesh key={i} position={[s.pos[0], s.pos[1], s.pos[2]]} scale={[s.scale, s.scale * 0.6, 1]}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            vertexShader={NEB_VERT}
            fragmentShader={NEB_FRAG}
            uniforms={uniformSets[i]}
            transparent
            depthWrite={false}
            blending={additive}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- portal

function ArchRing({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const r = rng(21);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * 5.5, Math.sin(a) * 5.5, (r() - 0.5) * 0.6);
      dummy.rotation.set(0, 0, a);
      dummy.scale.set(0.5 + r() * 0.5, 0.55 + (i % 4 === 0 ? 1.1 : r() * 0.5), 0.9 + r() * 0.8);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0a0f2c" metalness={0.92} roughness={0.32} emissive="#16226b" emissiveIntensity={0.35} />
    </instancedMesh>
  );
}

function HoloRing({ radius, tilt, speed, color, opacity }: { radius: number; tilt: [number, number]; speed: number; color: string; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = rig.time * speed;
  });
  return (
    <group rotation={[tilt[0], tilt[1], 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[radius, 0.018, 6, 160]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} blending={additive} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Pathways({ count, a, b }: { count: number; a: React.MutableRefObject<THREE.Color>; b: React.MutableRefObject<THREE.Color> }) {
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const curves = useMemo(() => {
    const r = rng(99);
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const start = new THREE.Vector3(side * (18 + r() * 14), (r() - 0.5) * 18, -34 - r() * 14);
      const mid = new THREE.Vector3(side * (8 + r() * 4), (r() - 0.5) * 8, -16);
      const mid2 = new THREE.Vector3(side * (3 + r() * 2), (r() - 0.5) * 3, -6);
      return new THREE.CatmullRomCurve3([start, mid, mid2, new THREE.Vector3(0, 0, -0.4)]);
    });
  }, [count]);
  const uniformSets = useMemo(
    () =>
      curves.map((_, i) => ({
        uTime: { value: 0 },
        uAct: { value: 0 },
        uOff: { value: i * 0.37 },
        uA: { value: new THREE.Color() },
        uB: { value: new THREE.Color() },
      })),
    [curves],
  );
  useFrame(() => {
    mats.current.forEach((m) => {
      if (!m) return;
      m.uniforms.uTime.value = rig.time;
      m.uniforms.uAct.value = ease(Math.min(1, Math.max(0, rig.activation * 1.5 - 0.4)));
      (m.uniforms.uA.value as THREE.Color).copy(a.current);
      (m.uniforms.uB.value as THREE.Color).copy(b.current);
    });
  });
  return (
    <group>
      {curves.map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[c, 72, 0.035, 5, false]} />
          <shaderMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            vertexShader={NEB_VERT}
            fragmentShader={PATH_FRAG}
            uniforms={uniformSets[i]}
            transparent
            depthWrite={false}
            blending={additive}
          />
        </mesh>
      ))}
    </group>
  );
}

function Portal({ archCount, pathCount }: { archCount: number; pathCount: number }) {
  const discMat = useRef<THREE.ShaderMaterial>(null);
  const glowMat = useRef<THREE.ShaderMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const ringsGroup = useRef<THREE.Group>(null);
  const discUniforms = useMemo(() => ({ uTime: { value: 0 }, uAct: { value: 0 }, uA: { value: new THREE.Color("#2f6bff") }, uB: { value: new THREE.Color("#a63cff") } }), []);
  const glowUniforms = useMemo(() => ({ uAct: { value: 0 }, uA: { value: new THREE.Color("#3a4cff") } }), []);
  const brandA = useRef(new THREE.Color(BRAND_THEME.primary));
  const brandB = useRef(new THREE.Color(BRAND_THEME.secondary));

  useFrame(() => {
    const act = ease(Math.min(1, Math.max(0, rig.activation * 1.25 - 0.25)));
    if (discMat.current) {
      discMat.current.uniforms.uTime.value = rig.time;
      discMat.current.uniforms.uAct.value = act;
    }
    if (glowMat.current) glowMat.current.uniforms.uAct.value = act;
    if (light.current) light.current.intensity = 60 * act;
    if (ringsGroup.current) {
      const s = 0.55 + 0.45 * ease(Math.min(1, rig.activation * 1.1));
      ringsGroup.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <pointLight ref={light} position={[0, 0, 3]} color="#7a9bff" distance={40} decay={2} />
      <group ref={ringsGroup}>
        <ArchRing count={archCount} />
        <mesh position={[0, 0, 0.2]}>
          <torusGeometry args={[4.5, 0.09, 12, 128]} />
          <meshBasicMaterial color="#f5c46b" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <torusGeometry args={[4.0, 0.05, 8, 128]} />
          <meshBasicMaterial color="#6fa0ff" />
        </mesh>
        <HoloRing radius={6.6} tilt={[1.1, 0.2]} speed={0.12} color="#6fa0ff" opacity={0.55} />
        <HoloRing radius={7.8} tilt={[-0.9, 0.5]} speed={-0.09} color="#c27cff" opacity={0.45} />
        <HoloRing radius={9.2} tilt={[0.35, -1.0]} speed={0.07} color="#f5c46b" opacity={0.35} />
      </group>
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[3.95, 72]} />
        <shaderMaterial
          ref={discMat}
          vertexShader={NEB_VERT}
          fragmentShader={PORTAL_FRAG}
          uniforms={discUniforms}
          transparent
          depthWrite={false}
          blending={additive}
        />
      </mesh>
      <mesh position={[0, 0, -1.2]}>
        <planeGeometry args={[18, 18]} />
        <shaderMaterial
          ref={glowMat}
          vertexShader={NEB_VERT}
          fragmentShader={GLOW_FRAG}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          blending={additive}
        />
      </mesh>
      <Pathways count={pathCount} a={brandA} b={brandB} />
    </group>
  );
}

// ---------------------------------------------------------------- floating structures

function Floaters({ shards, monoliths }: { shards: number; monoliths: number }) {
  const shardMesh = useRef<THREE.InstancedMesh>(null);
  const wireMesh = useRef<THREE.InstancedMesh>(null);
  const monoMesh = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const r = rng(1234);
    const s = Array.from({ length: shards }, () => {
      const a = r() * Math.PI * 2;
      const rad = 9 + r() * 20;
      return { x: Math.cos(a) * rad, y: (r() - 0.5) * 16, z: -4 - r() * 34, sc: 0.35 + r() * r() * 1.5, sp: 0.1 + r() * 0.3, ph: r() * 6.28, ax: r() * 3 };
    });
    const m = Array.from({ length: monoliths }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      return { x: side * (14 + r() * 26), y: (r() - 0.5) * 10, z: -20 - r() * 40, h: 5 + r() * 12, w: 0.8 + r() * 1.4, ph: r() * 6.28, ry: r() * 3 };
    });
    return { s, m };
  }, [shards, monoliths]);

  useEffect(() => {
    const mm = monoMesh.current;
    if (!mm) return;
    data.m.forEach((o, i) => {
      dummy.position.set(o.x, o.y, o.z);
      dummy.rotation.set(0.1, o.ry, (o.x > 0 ? -1 : 1) * 0.12);
      dummy.scale.set(o.w, o.h, o.w);
      dummy.updateMatrix();
      mm.setMatrixAt(i, dummy.matrix);
    });
    mm.instanceMatrix.needsUpdate = true;
  }, [data]);

  useFrame(() => {
    const t = rig.time;
    const vis = ease(Math.min(1, Math.max(0, rig.activation * 1.3 - 0.35)));
    const a = shardMesh.current;
    const w = wireMesh.current;
    if (!a || !w) return;
    data.s.forEach((o, i) => {
      dummy.position.set(o.x, o.y + Math.sin(t * o.sp + o.ph) * 0.8, o.z);
      dummy.rotation.set(t * o.sp * 0.8 + o.ax, t * o.sp, o.ph);
      dummy.scale.setScalar(o.sc * vis);
      dummy.updateMatrix();
      a.setMatrixAt(i, dummy.matrix);
      dummy.scale.setScalar(o.sc * 1.12 * vis);
      dummy.updateMatrix();
      w.setMatrixAt(i, dummy.matrix);
    });
    a.instanceMatrix.needsUpdate = true;
    w.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={shardMesh} args={[undefined, undefined, shards]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#0b1236" metalness={0.95} roughness={0.25} emissive="#1b2a8a" emissiveIntensity={0.3} flatShading />
      </instancedMesh>
      <instancedMesh ref={wireMesh} args={[undefined, undefined, shards]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#5f8cff" wireframe transparent opacity={0.4} blending={additive} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={monoMesh} args={[undefined, undefined, monoliths]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#070a22" metalness={0.9} roughness={0.4} emissive="#2a1a6e" emissiveIntensity={0.25} />
      </instancedMesh>
    </group>
  );
}

// ---------------------------------------------------------------- atmospheric particles

type PartCfg = { count: number; size: number; vel: [number, number, number]; shape: number; color: string; opacity: number };
const PARTICLE_CFG: Record<ParticleKind, PartCfg> = {
  motes: { count: 520, size: 1.6, vel: [0.05, 0.18, 0], shape: 0, color: "#9bb8ff", opacity: 0.7 },
  dust: { count: 480, size: 1.4, vel: [0.3, -0.06, 0], shape: 0, color: "#e3cfa6", opacity: 0.65 },
  fog: { count: 26, size: 42, vel: [0.35, 0, 0], shape: 0, color: "#8fb8b0", opacity: 0.1 },
  rain: { count: 720, size: 3.4, vel: [-0.6, -15, 0], shape: 1, color: "#a9c8ff", opacity: 0.5 },
  sand: { count: 620, size: 1.5, vel: [3.4, 0.3, 0], shape: 0, color: "#ffd08a", opacity: 0.7 },
  bokeh: { count: 60, size: 10, vel: [0.12, 0.55, 0], shape: 0, color: "#ffb68a", opacity: 0.32 },
};

function Particles({ kind, role, scale }: { kind: ParticleKind; role: "base" | "theme"; scale: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const cfg = PARTICLE_CFG[kind];
  const count = Math.max(8, Math.round(cfg.count * scale));
  const seeds = useMemo(() => {
    const r = rng(kind.length * 77 + count);
    const a = new Float32Array(count * 4);
    for (let i = 0; i < a.length; i++) a[i] = r();
    return a;
  }, [kind, count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPx: { value: 1 },
      uSize: { value: cfg.size },
      uVel: { value: new THREE.Vector3(...cfg.vel) },
      uBox: { value: new THREE.Vector3(46, 26, 46) },
      uColor: { value: new THREE.Color(cfg.color) },
      uShape: { value: cfg.shape },
    }),
    [cfg],
  );
  useFrame(() => {
    const m = mat.current;
    if (!m) return;
    const act = Math.min(1, rig.activation * 1.2);
    m.uniforms.uTime.value = rig.time;
    m.uniforms.uPx.value = dpr;
    m.uniforms.uOpacity.value = cfg.opacity * act * (role === "theme" ? rig.worldBlend : 1 - 0.65 * rig.worldBlend);
  });
  return (
      <points position={[0, 0, -4]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(count * 3), 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 4]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} vertexShader={PART_VERT} fragmentShader={PART_FRAG_SRC} uniforms={uniforms} transparent depthWrite={false} blending={additive} />
    </points>
  );
}

// ---------------------------------------------------------------- holographic featured frame

function HoloFrame({ theme, poster }: { theme: MovieTheme; poster?: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const a = useMovingColor(theme.primary);
  const b = useMovingColor(theme.secondary);
  const c = useMovingColor(theme.accent);
  const invalidate = useThree((s) => s.invalidate);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 }, uAct: { value: 0 }, uHasTex: { value: 0 }, uTex: { value: null as THREE.Texture | null },
      uA: { value: new THREE.Color(theme.primary) }, uB: { value: new THREE.Color(theme.secondary) }, uC: { value: new THREE.Color(theme.accent) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    let disposed = false;
    let tex: THREE.Texture | null = null;
    uniforms.uHasTex.value = 0;
    if (poster) {
      new THREE.TextureLoader().load(
        poster,
        (t) => {
          if (disposed) return t.dispose();
          t.colorSpace = THREE.NoColorSpace;
          tex = t;
          uniforms.uTex.value = t;
          uniforms.uHasTex.value = 1;
          invalidate();
        },
        undefined,
        () => {},
      );
    }
    return () => {
      disposed = true;
      tex?.dispose();
    };
  }, [poster, uniforms, invalidate]);

  useFrame(() => {
    const m = mat.current;
    const g = mesh.current;
    if (!m || !g) return;
    const show = rig.portalBlend * ease(Math.min(1, Math.max(0, rig.activation * 1.3 - 0.45)));
    a.current.lerp(a.target, 0.08);
    b.current.lerp(b.target, 0.08);
    c.current.lerp(c.target, 0.08);
    (m.uniforms.uA.value as THREE.Color).copy(a.current);
    (m.uniforms.uB.value as THREE.Color).copy(b.current);
    (m.uniforms.uC.value as THREE.Color).copy(c.current);
    m.uniforms.uTime.value = rig.time;
    m.uniforms.uAct.value = show;
    g.visible = show > 0.01;
    g.position.y = Math.sin(rig.time * 0.8) * 0.12;
    g.rotation.y = rig.pointerX * 0.28 + Math.sin(rig.time * 0.4) * 0.08;
    g.rotation.x = -rig.pointerY * 0.12;
    g.scale.setScalar(0.75 + show * 0.25);
  });

  return (
    <mesh ref={mesh} position={[0, 0, 1.2]}>
      <planeGeometry args={[2.5, 3.5]} />
      <shaderMaterial ref={mat} vertexShader={NEB_VERT} fragmentShader={FRAME_FRAG} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

// ---------------------------------------------------------------- rig (camera, mode blending, throttled ticker)

function Rig({
  portal,
  theme,
  nebA,
  nebB,
  onDegrade,
}: {
  portal: React.RefObject<THREE.Group | null>;
  theme: MovieTheme;
  nebA: React.MutableRefObject<THREE.Color>;
  nebB: React.MutableRefObject<THREE.Color>;
  onDegrade: () => void;
}) {
  const { camera, scene, size, invalidate } = useThree();
  const world = useMovingColor(theme.primary);
  const world2 = useMovingColor(theme.secondary);
  const bg = useRef(new THREE.Color("#02030a"));
  const acc = useRef({ t: 0, n: 0, slow: 0 });
  const mode = useRef<WorldMode>("calm");

  useEffect(() => {
    scene.background = bg.current;
    return () => {
      scene.background = null;
    };
  }, [scene]);

  // Throttled ticker: the ONLY thing that drives rendering (frameloop="demand").
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const fps = targetFps();
      if (fps <= 0 || document.hidden) return;
      if (t - last >= 1000 / fps - 3) {
        last = t;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    const kick = () => invalidate();
    document.addEventListener("visibilitychange", kick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", kick);
    };
  }, [invalidate]);

  useEffect(() => {
    invalidate();
  }, [theme, size, invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    if (!rig.reduced) rig.time += dt;
    mode.current = rig.mode;

    // intro activation
    if (rig.reduced) rig.activation = 1;
    else {
      if (rig.activationStart === null) rig.activationStart = performance.now();
      rig.activation = Math.min(1, (performance.now() - rig.activationStart) / (rig.activationDuration * 1000));
    }

    const damp = rig.reduced ? 1 : 1 - Math.exp(-dt * 2.6);
    rig.portalBlend += ((mode.current === "portal" ? 1 : 0) - rig.portalBlend) * damp;
    rig.worldBlend += ((mode.current === "world" ? 1 : 0) - rig.worldBlend) * damp;

    // portal placement (desktop: right of hero copy; mobile: top, scaled to fit)
    const aspect = size.width / size.height;
    const desktop = aspect > 1.2;
    const viewH = 2 * 16 * Math.tan((50 * Math.PI) / 360);
    const viewW = viewH * aspect;
    const s = desktop ? Math.min(1, viewW / 22) : Math.min(0.95, viewW / 2 / 6.6);
    const px = desktop ? Math.min(4.6, viewW * 0.17) : 0;
    const py = desktop ? 0.3 : viewH * 0.22;
    const b = rig.portalBlend;
    const g = portal.current;
    if (g) {
      g.position.set(px * b + 5 * (1 - b), py * b + 1.5 * (1 - b), -34 * (1 - b));
      g.scale.setScalar(s * (0.45 + 0.55 * b) * (0.85 + 0.15 * ease(rig.activation)));
      g.rotation.y = Math.sin(rig.time * 0.15) * 0.12 * (1 - b * 0.5);
    }

    // camera drift: pointer parallax + scroll dolly
    const sc = Math.min(1.2, rig.scroll / rig.vh);
    const tx = rig.pointerX * 1.0 + Math.sin(rig.time * 0.11) * 0.7;
    const ty = rig.pointerY * 0.55 + Math.cos(rig.time * 0.09) * 0.35 + 0.2 - sc * 0.8;
    const tz = 16 - sc * 2.6 * b + (1 - b) * 1.5;
    camera.position.x += (tx - camera.position.x) * damp * 0.6;
    camera.position.y += (ty - camera.position.y) * damp * 0.6;
    camera.position.z += (tz - camera.position.z) * damp * 0.6;
    camera.lookAt(px * 0.15 * b, 0, 0);

    // colour blending: brand ↔ theme
    world.current.lerp(world.target, 0.06);
    world2.current.lerp(world2.target, 0.06);
    const w = rig.worldBlend;
    nebA.current.copy(tmpColor.set(BRAND_THEME.primary)).lerp(world.current, w).multiplyScalar(0.8);
    nebB.current.copy(tmpColor.set(BRAND_THEME.secondary)).lerp(world2.current, w).multiplyScalar(0.8);
    bg.current.set("#02030a").lerp(tmpColor.copy(world2.current).multiplyScalar(0.07), w);

    // adaptive quality (only measured at full speed)
    if (targetFps() >= 55 && delta < 0.5) {
      const a = acc.current;
      a.t += delta;
      a.n++;
      if (a.n >= 90) {
        a.slow = a.t / a.n > 0.027 ? a.slow + 1 : 0;
        a.t = 0;
        a.n = 0;
        if (a.slow >= 2 && !rig.degraded) onDegrade();
      }
    }
    void state;
  }, -1);

  return null;
}

// ---------------------------------------------------------------- composition

function World({ theme, poster, onDegrade }: { theme: MovieTheme; poster?: string; onDegrade: () => void }) {
  const portal = useRef<THREE.Group>(null);
  const nebA = useRef(new THREE.Color(BRAND_THEME.primary));
  const nebB = useRef(new THREE.Color(BRAND_THEME.secondary));
  const m = rig.mobile;
  const low = rig.quality === "low" || rig.degraded;
  const k = m || low ? 0.5 : 1;
  const frameTheme = theme;

  return (
    <>
      <Rig portal={portal} theme={theme} nebA={nebA} nebB={nebB} onDegrade={onDegrade} />
      <ambientLight intensity={0.35} color="#8aa0ff" />
      <directionalLight position={[-8, 10, 8]} intensity={0.9} color="#ffd9a0" />
      <Stars count={m || low ? 900 : 2200} />
      <Nebula count={m || low ? 1 : 3} a={nebA} b={nebB} />
      <Floaters shards={m || low ? 10 : 26} monoliths={m || low ? 4 : 10} />
      <group ref={portal}>
        <Portal archCount={m || low ? 20 : 30} pathCount={m || low ? 3 : 6} />
        {!m && <HoloFrame theme={frameTheme} poster={poster} />}
      </group>
      <Particles kind="motes" role="base" scale={k} />
      <Particles key={theme.particles} kind={theme.particles} role="theme" scale={k} />
    </>
  );
}

export default function Scene({
  theme,
  poster,
  dpr,
  onDegrade,
}: {
  theme: MovieTheme;
  poster?: string;
  dpr: number;
  onDegrade: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      camera={{ position: [0, 0.2, 16], fov: 50, near: 0.1, far: 400 }}
      gl={{ antialias: !rig.mobile, alpha: false, powerPreference: "high-performance", stencil: false }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <World theme={theme} poster={poster} onDegrade={onDegrade} />
    </Canvas>
  );
}
