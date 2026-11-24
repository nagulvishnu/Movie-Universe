import { createContext, useContext, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { LightName } from "../film/types";
import { clock } from "../film/clock";

export type V3 = [number, number, number];

// ---------- light presets ----------
export interface LightDef {
  top: string;
  hor: string;
  gnd: string;
  sun: { c: string; i: number; p: V3 };
  amb: { c: string; i: number };
  hemi: { s: string; g: string; i: number };
  fog: [string, number];
  exp: number;
  bloom: number;
  sunDir: V3;
  sunC: string;
  stars: number;
  cloud: { cover: number; c: string };
  win: string;
  sea: [string, string];
  rain?: boolean;
  interior?: boolean;
  grade?: string;
}

export const LIGHTS: Record<LightName, LightDef> = {
  stationRain: {
    top: "#0b1220", hor: "#26364a", gnd: "#10151d", sun: { c: "#7f9fd0", i: 0.5, p: [-6, 12, 6] }, amb: { c: "#40506a", i: 1.0 },
    hemi: { s: "#3a4a66", g: "#1a1d24", i: 1.1 }, fog: ["#1b2432", 0.028], exp: 1, bloom: 0.9, sunDir: [0, 0.3, -1], sunC: "#000000", stars: 0,
    cloud: { cover: 0.9, c: "#222c3a" }, win: "#ffcf8a", sea: ["#0a1a2a", "#1d3a52"], rain: true,
  },
  bookWarm: {
    top: "#9cc4e6", hor: "#f2dcc0", gnd: "#d8c8a8", sun: { c: "#ffd7a0", i: 2.1, p: [-5, 6, -6] }, amb: { c: "#ffe2bd", i: 0.5 },
    hemi: { s: "#ffe9cc", g: "#7a5a3e", i: 0.55 }, fog: ["#e8d6bd", 0.004], exp: 1, bloom: 0.45, sunDir: [-0.3, 0.35, -1], sunC: "#ffd9a0", stars: 0,
    cloud: { cover: 0.35, c: "#fff4e4" }, win: "#fff1d6", sea: ["#2b6f8f", "#7fc3d6"], interior: true,
  },
  dayCoast: {
    top: "#4b92d1", hor: "#cfe6f2", gnd: "#d9c9a0", sun: { c: "#fff4de", i: 3.0, p: [8, 14, 4] }, amb: { c: "#cfe4f5", i: 0.55 },
    hemi: { s: "#bcd9f2", g: "#c9b68d", i: 0.7 }, fog: ["#cfe3ee", 0.005], exp: 1, bloom: 0.25, sunDir: [0.4, 0.75, -0.5], sunC: "#fff6e0", stars: 0,
    cloud: { cover: 0.45, c: "#ffffff" }, win: "#eaf5ff", sea: ["#0f6e94", "#5bc0cf"],
  },
  golden: {
    top: "#5a86b8", hor: "#f9c78a", gnd: "#cfa874", sun: { c: "#ffbe73", i: 3.4, p: [-10, 5, -8] }, amb: { c: "#ffd8b0", i: 0.7 },
    hemi: { s: "#ffcf9e", g: "#a07850", i: 0.85 }, fog: ["#f2c79c", 0.007], exp: 1.05, bloom: 0.7, sunDir: [-0.55, 0.16, -0.8], sunC: "#ffb866", stars: 0,
    cloud: { cover: 0.5, c: "#ffd9b0" }, win: "#ffcb90", sea: ["#1f5a7a", "#f0b27a"],
  },
  sunset: {
    top: "#2f3f7a", hor: "#ff9a62", gnd: "#7a5a4a", sun: { c: "#ff9a5a", i: 3.0, p: [-12, 3.5, -10] }, amb: { c: "#ffb890", i: 0.85 },
    hemi: { s: "#e58a74", g: "#5a4a58", i: 1.0 }, fog: ["#e59270", 0.009], exp: 1.05, bloom: 0.9, sunDir: [-0.6, 0.07, -0.8], sunC: "#ff8844", stars: 0.1,
    cloud: { cover: 0.55, c: "#ff9f7a" }, win: "#ff9a62", sea: ["#2a3a6a", "#ff9060"],
  },
  dusk: {
    top: "#141a3a", hor: "#a8607a", gnd: "#2a2230", sun: { c: "#a8a0d8", i: 0.8, p: [8, 8, -6] }, amb: { c: "#6a6a9a", i: 0.9 },
    hemi: { s: "#5a5a8a", g: "#2a2230", i: 1.0 }, fog: ["#4a3a58", 0.012], exp: 1, bloom: 1, sunDir: [-0.5, 0.0, -0.85], sunC: "#ff7a6a", stars: 0.5,
    cloud: { cover: 0.5, c: "#8a5a7a" }, win: "#ffbf80", sea: ["#161a3a", "#7a4a6a"],
  },
  night: {
    top: "#030614", hor: "#0e1a33", gnd: "#0a0f1a", sun: { c: "#8fa8e8", i: 0.9, p: [6, 10, -8] }, amb: { c: "#32406a", i: 0.8 },
    hemi: { s: "#27345a", g: "#10131c", i: 0.9 }, fog: ["#0a1224", 0.012], exp: 1, bloom: 1.1, sunDir: [0.5, 0.5, -0.7], sunC: "#000000", stars: 1,
    cloud: { cover: 0.15, c: "#1a2540" }, win: "#ffc27a", sea: ["#050c1c", "#162848"],
  },
  sunrise: {
    top: "#5d7fb8", hor: "#ffc996", gnd: "#c7a98a", sun: { c: "#ffd2a0", i: 3.2, p: [0, 4.5, -16] }, amb: { c: "#ffe0c8", i: 0.7 },
    hemi: { s: "#ffd8b8", g: "#9a8a8a", i: 0.85 }, fog: ["#f6cfa8", 0.007], exp: 1.05, bloom: 0.85, sunDir: [0, 0.11, -1], sunC: "#ffd7a0", stars: 0,
    cloud: { cover: 0.55, c: "#ffd3b4" }, win: "#ffd7a8", sea: ["#4f7a9c", "#ffc592"],
  },
  hospital: {
    top: "#9fb4c7", hor: "#dfe8ee", gnd: "#b8c0c6", sun: { c: "#e8f0ff", i: 1.1, p: [3, 8, 4] }, amb: { c: "#dfeaf6", i: 0.7 },
    hemi: { s: "#e6f0fa", g: "#aab4bc", i: 0.9 }, fog: ["#d4dee6", 0.002], exp: 1, bloom: 0.15, sunDir: [0.3, 0.5, -1], sunC: "#ffffff", stars: 0,
    cloud: { cover: 0.7, c: "#e8eef2" }, win: "#eef6ff", sea: ["#4a7a94", "#8fb3c4"], interior: true,
  },
  roomDay: {
    top: "#78aedc", hor: "#e4eef2", gnd: "#c8b890", sun: { c: "#fff0d8", i: 2.4, p: [5, 8, -5] }, amb: { c: "#f4ead8", i: 0.65 },
    hemi: { s: "#f1ead8", g: "#8a7660", i: 0.6 }, fog: ["#dfe8ee", 0.003], exp: 1, bloom: 0.3, sunDir: [0.4, 0.55, -0.7], sunC: "#fff3d6", stars: 0,
    cloud: { cover: 0.4, c: "#ffffff" }, win: "#f4f9ff", sea: ["#2b7a9a", "#7fcad6"], interior: true,
  },
  roomWarm: {
    top: "#3a3f66", hor: "#d98a60", gnd: "#4a3a3a", sun: { c: "#ffb27a", i: 1.4, p: [-6, 4, -6] }, amb: { c: "#ffc79a", i: 0.4 },
    hemi: { s: "#ffcfa0", g: "#6a4a3a", i: 0.5 }, fog: ["#a8705a", 0.005], exp: 1, bloom: 0.7, sunDir: [-0.5, 0.1, -0.85], sunC: "#ff8a50", stars: 0.1,
    cloud: { cover: 0.4, c: "#e98a6a" }, win: "#ffa066", sea: ["#2a3a5a", "#d9805a"], interior: true,
  },
  roomNight: {
    top: "#050914", hor: "#101c3a", gnd: "#0a0c14", sun: { c: "#7f95d8", i: 0.7, p: [-3, 7, -6] }, amb: { c: "#303a5e", i: 0.35 },
    hemi: { s: "#24305a", g: "#14121a", i: 0.4 }, fog: ["#0a1020", 0.01], exp: 1, bloom: 0.9, sunDir: [0.5, 0.6, -0.6], sunC: "#000000", stars: 1,
    cloud: { cover: 0.1, c: "#1a2540" }, win: "#2a3a6a", sea: ["#050c1c", "#162848"], interior: true,
  },
  rainDay: {
    top: "#5d6a78", hor: "#9aa7b2", gnd: "#4a5058", sun: { c: "#c8d4e0", i: 0.9, p: [3, 10, 4] }, amb: { c: "#9aa8b8", i: 0.8 },
    hemi: { s: "#aab6c4", g: "#4a4e56", i: 0.9 }, fog: ["#8895a2", 0.016], exp: 1, bloom: 0.25, sunDir: [0, 0.4, -1], sunC: "#000000", stars: 0,
    cloud: { cover: 1, c: "#6a7684" }, win: "#cfdbe6", sea: ["#2a4a5e", "#5a7a8a"], rain: true,
  },
  overcast: {
    top: "#8a9aaa", hor: "#c9d3da", gnd: "#8a8e90", sun: { c: "#e4ecf4", i: 1.2, p: [3, 10, 4] }, amb: { c: "#b8c4d0", i: 0.8 },
    hemi: { s: "#cfd9e2", g: "#7a7e80", i: 0.8 }, fog: ["#c3ced6", 0.006], exp: 1, bloom: 0.2, sunDir: [0, 0.4, -1], sunC: "#000000", stars: 0,
    cloud: { cover: 0.85, c: "#aebac4" }, win: "#dbe6ee", sea: ["#2d5a72", "#6a98aa"],
  },
};

export const LightCtx = createContext<LightDef>(LIGHTS.dayCoast);
export const useLight = () => useContext(LightCtx);
export const QualityCtx = createContext<"low" | "med" | "high">("med");
export const useQuality = () => useContext(QualityCtx);

// ---------- materials ----------
const matCache = new Map<string, THREE.MeshStandardMaterial>();
export interface MO {
  rough?: number;
  metal?: number;
  em?: string;
  ei?: number;
  tex?: THREE.Texture | null;
  op?: number;
  side?: THREE.Side;
}
export function M(c: string, o: MO = {}) {
  const key = [c, o.rough, o.metal, o.em, o.ei, o.tex?.uuid, o.op, o.side].join("|");
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: c,
      roughness: o.rough ?? 0.75,
      metalness: o.metal ?? 0,
      map: o.tex ?? null,
      emissive: o.em ?? "#000000",
      emissiveIntensity: o.ei ?? 1,
      transparent: o.op !== undefined && o.op < 1,
      opacity: o.op ?? 1,
      side: o.side ?? THREE.FrontSide,
    });
    if (o.em) m.toneMapped = false;
    matCache.set(key, m);
  }
  return m;
}
export function disposeKit() {
  matCache.forEach((m) => m.dispose());
  matCache.clear();
}

interface Q extends MO {
  p?: V3;
  s?: V3;
  r?: V3;
  c?: string;
  sh?: boolean;
  children?: ReactNode;
}
export const B = ({ p, s = [1, 1, 1], r, c = "#999", sh = true, children, ...o }: Q) => (
  <mesh position={p} rotation={r} castShadow={sh} receiveShadow>
    <boxGeometry args={s} />
    <primitive object={M(c, o)} attach="material" />
    {children}
  </mesh>
);
export const Cy = ({ p, s = [1, 1, 1], r, c = "#999", rt = 0.5, rb = 0.5, h = 1, seg = 16, open, sh = true, children, ...o }: Q & { rt?: number; rb?: number; h?: number; seg?: number; open?: boolean }) => (
  <mesh position={p} rotation={r} scale={s} castShadow={sh} receiveShadow>
    <cylinderGeometry args={[rt, rb, h, seg, 1, open]} />
    <primitive object={M(c, { ...o, side: open ? THREE.DoubleSide : o.side })} attach="material" />
    {children}
  </mesh>
);
export const Sp = ({ p, s = [1, 1, 1], r, c = "#999", rad = 0.5, sh = true, seg = 16, children, ...o }: Q & { rad?: number; seg?: number }) => (
  <mesh position={p} rotation={r} scale={s} castShadow={sh} receiveShadow>
    <sphereGeometry args={[rad, seg, Math.max(6, seg * 0.7)]} />
    <primitive object={M(c, o)} attach="material" />
    {children}
  </mesh>
);
export const Pl = ({ p, s = [1, 1, 1], r, c = "#999", ...o }: Q) => (
  <mesh position={p} rotation={r} scale={s}>
    <planeGeometry args={[1, 1]} />
    <primitive object={M(c, { side: THREE.DoubleSide, ...o })} attach="material" />
  </mesh>
);
export const Glow = ({ p, c = "#ffd9a0", rad = 0.08, i = 3 }: { p: V3; c?: string; rad?: number; i?: number }) => (
  <mesh position={p}>
    <sphereGeometry args={[rad, 12, 8]} />
    <primitive object={M(c, { em: c, ei: i })} attach="material" />
  </mesh>
);

// ---------- instancing ----------
export interface InstItem {
  p: V3;
  s?: V3;
  r?: V3;
  c?: string;
}
export function Inst({ geo, items, c = "#fff", rough = 0.7, metal = 0, em, ei = 1, tex, cast = true }: { geo: "box" | "sphere" | "cyl" | "cone"; items: InstItem[]; c?: string; rough?: number; metal?: number; em?: string; ei?: number; tex?: THREE.Texture; cast?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const g = useMemo(() => {
    if (geo === "box") return new THREE.BoxGeometry(1, 1, 1);
    if (geo === "sphere") return new THREE.SphereGeometry(0.5, 10, 8);
    if (geo === "cone") return new THREE.ConeGeometry(0.5, 1, 8);
    return new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
  }, [geo]);
  const m = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: rough, metalness: metal, map: tex ?? null, emissive: em ?? "#000", emissiveIntensity: ei }),
    [rough, metal, em, ei, tex]
  );
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(...(it.r ?? [0, 0, 0]));
      o.scale.set(...(it.s ?? [1, 1, 1]));
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
      ref.current.setColorAt(i, col.set(it.c ?? c));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [items, c]);
  useLayoutEffect(() => () => { g.dispose(); m.dispose(); }, [g, m]);
  return <instancedMesh ref={ref} args={[g, m, items.length]} castShadow={cast} receiveShadow frustumCulled={false} />;
}

// ---------- sky ----------
const skyVert = `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const skyFrag = `
varying vec3 vDir;
uniform vec3 uTop, uHor, uGnd, uSunC, uCloudC; uniform vec3 uSunDir; uniform float uTime, uStars, uCover;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.03; a*=.5; } return s; }
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = mix(uHor, uTop, pow(clamp(h,0.,1.), 0.55));
  if (h < 0.) col = mix(uHor, uGnd, clamp(-h*6., 0., 1.));
  float sd = max(dot(d, normalize(uSunDir)), 0.);
  col += uSunC * (pow(sd, 900.)*2.5 + pow(sd, 14.)*0.45 + pow(sd, 3.)*0.2);
  if (uStars > 0.01 && h > 0.) {
    vec3 q = floor(d*260.); float st = step(0.9965, hash(q.xy + q.z*7.3)); col += vec3(st) * uStars * smoothstep(0., .25, h) * (0.6+0.4*hash(q.xz));
  }
  if (h > 0.0) {
    vec2 uv = d.xz/(h+0.22)*1.6 + vec2(uTime*0.012, uTime*0.004);
    float n = fbm(uv); float c = smoothstep(1.0-uCover*0.75-0.08, 1.0-uCover*0.75+0.25, n);
    float lit = 0.55 + 0.9*pow(sd, 2.);
    col = mix(col, uCloudC*lit, c*smoothstep(0., .12, h)*0.9);
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export function Sky() {
  const L = useLight();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uGnd: { value: new THREE.Color() },
          uSunC: { value: new THREE.Color() }, uCloudC: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3() },
          uTime: { value: 0 }, uStars: { value: 0 }, uCover: { value: 0.4 },
        },
      }),
    []
  );
  useLayoutEffect(() => {
    const u = mat.uniforms;
    u.uTop.value.set(L.top); u.uHor.value.set(L.hor); u.uGnd.value.set(L.gnd); u.uSunC.value.set(L.sunC); u.uCloudC.value.set(L.cloud.c);
    u.uSunDir.value.set(...L.sunDir); u.uStars.value = L.stars; u.uCover.value = L.cloud.cover;
  }, [L, mat]);
  useFrame(() => { mat.uniforms.uTime.value = clock.time; });
  useLayoutEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[600, 32, 20]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ---------- sea ----------
const seaVert = `
uniform float uTime; varying vec3 vW; varying vec3 vN;
float wave(vec2 p, float t){ return sin(p.x*0.35+t*0.9)*0.5 + sin(p.y*0.5+t*1.3+p.x*0.2)*0.35 + sin((p.x+p.y)*0.9+t*1.9)*0.15; }
void main(){
  vec3 p = position; vec4 w0 = modelMatrix*vec4(p,1.);
  float amp = 0.18;
  float e = 0.3;
  float h = wave(w0.xz, uTime)*amp;
  float hx = wave(w0.xz+vec2(e,0.), uTime)*amp; float hz = wave(w0.xz+vec2(0.,e), uTime)*amp;
  p.y += h; vN = normalize(vec3(-(hx-h)/e, 1., -(hz-h)/e));
  vec4 w = modelMatrix*vec4(p,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w;
}`;
const seaFrag = `
uniform vec3 uDeep, uShallow, uSunDir, uSunC, uFogC, uSkyC; uniform float uFogD, uTime;
varying vec3 vW; varying vec3 vN;
void main(){
  vec3 V = normalize(cameraPosition - vW); vec3 N = normalize(vN);
  float fr = pow(1. - max(dot(V,N),0.), 3.);
  float dist = length(cameraPosition - vW);
  vec3 col = mix(uDeep, uShallow, clamp(0.35 + 0.5*N.x + 0.3*N.z, 0., 1.)*0.55);
  col = mix(col, uSkyC, clamp(fr*0.85 + 0.12, 0., 1.));
  vec3 H = normalize(normalize(uSunDir) + V);
  float sp = pow(max(dot(N,H),0.), 220.);
  col += uSunC * sp * 2.2;
  float ripple = sin(vW.x*3.1+uTime*1.7)*sin(vW.z*2.3+uTime*1.3);
  col += uSunC * pow(max(dot(N,H),0.), 40.) * 0.18 * (0.6+0.4*ripple);
  float f = 1. - exp(-uFogD*uFogD*dist*dist*0.35);
  col = mix(col, uFogC, clamp(f,0.,1.));
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export function Sea({ y = -0.05, z = -200, size = [1200, 400] }: { y?: number; z?: number; size?: [number, number] }) {
  const L = useLight();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: seaVert, fragmentShader: seaFrag,
        uniforms: {
          uTime: { value: 0 }, uDeep: { value: new THREE.Color() }, uShallow: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3() },
          uSunC: { value: new THREE.Color() }, uFogC: { value: new THREE.Color() }, uSkyC: { value: new THREE.Color() }, uFogD: { value: 0.01 },
        },
      }),
    []
  );
  useLayoutEffect(() => {
    const u = mat.uniforms;
    u.uDeep.value.set(L.sea[0]); u.uShallow.value.set(L.sea[1]); u.uSunDir.value.set(...L.sunDir); u.uSunC.value.set(L.sunC === "#000000" ? "#99aacc" : L.sunC);
    u.uFogC.value.set(L.fog[0]); u.uSkyC.value.set(L.hor); u.uFogD.value = L.fog[1];
  }, [L, mat]);
  useFrame(() => { mat.uniforms.uTime.value = clock.time; });
  useLayoutEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh position={[0, y, z]} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[size[0], size[1], 220, 90]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ---------- rain ----------
export function Rain({ count = 2800, box = [26, 14, 26], speed = 14, wind = 1.2 }: { count?: number; box?: V3; speed?: number; wind?: number }) {
  const { camera } = useThree();
  const q = useQuality();
  const n = q === "low" ? count * 0.5 : count;
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 6);
    const end = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * box[0], y = Math.random() * box[1], z = (Math.random() - 0.5) * box[2];
      pos.set([x, y, z, x, y, z], i * 6);
      end[i * 2] = 0; end[i * 2 + 1] = 1;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(...box) }, uSpeed: { value: speed }, uWind: { value: wind } },
      vertexShader: `attribute float aEnd; uniform float uTime, uSpeed, uWind; uniform vec3 uCam, uBox; varying float vA;
        void main(){ vec3 p = position; p.y = mod(p.y - uTime*uSpeed, uBox.y); p.x += (p.y/uBox.y)*uWind*0.0;
          vec3 c = uCam; vec3 w = p + vec3(floor((c.x - p.x)/uBox.x + 0.5)*uBox.x, 0., floor((c.z - p.z)/uBox.z + 0.5)*uBox.z);
          w.y += c.y - uBox.y*0.5; w.y = c.y - uBox.y*0.5 + p.y;
          float len = 0.55; w += aEnd*vec3(uWind*0.06*len*3., len, 0.0);
          vA = 0.18 + 0.2*(1.-aEnd);
          gl_Position = projectionMatrix*viewMatrix*vec4(w,1.); }`,
      fragmentShader: `varying float vA; void main(){ gl_FragColor = vec4(0.75,0.82,0.95,vA); }`,
    });
    return { geo: g, mat: m };
  }, [n, box, speed, wind]);
  useFrame(() => { mat.uniforms.uTime.value = clock.time; mat.uniforms.uCam.value.copy(camera.position); });
  useLayoutEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <lineSegments geometry={geo} material={mat} frustumCulled={false} renderOrder={5} />;
}

// ---------- wet reflective floor ----------
export function WetFloor({ p, s, color = "#2b2e35", rough = 0.8 }: { p: V3; s: [number, number]; color?: string; rough?: number }) {
  const q = useQuality();
  return (
    <mesh position={p} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={s} />
      {q === "low" ? (
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.3} />
      ) : (
        <MeshReflectorMaterial
          blur={[260, 80]} resolution={q === "high" ? 768 : 512} mixBlur={1} mixStrength={1.4} mirror={0.55} roughness={rough}
          depthScale={0.6} minDepthThreshold={0.4} maxDepthThreshold={1.4} color={color} metalness={0.4}
        />
      )}
    </mesh>
  );
}

// ---------- palm tree ----------
let frondGeo: THREE.BufferGeometry | null = null;
function getFrond() {
  if (frondGeo) return frondGeo;
  const g = new THREE.PlaneGeometry(0.5, 3.2, 3, 8);
  g.translate(0, 1.6, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const x = p.getX(i);
    p.setZ(i, -Math.pow(y / 3.2, 2) * 1.4 + Math.abs(x) * 0.35);
    p.setX(i, x * (1 - (y / 3.2) * 0.85));
  }
  g.computeVertexNormals();
  g.rotateX(-Math.PI / 2);
  frondGeo = g;
  return g;
}
export function Palm({ p, h = 6, lean = 0.2, seed = 1 }: { p: V3; h?: number; lean?: number; seed?: number }) {
  const fr = useMemo(() => getFrond(), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2f5a2a", roughness: 0.7, side: THREE.DoubleSide }), []);
  useLayoutEffect(() => () => mat.dispose(), [mat]);
  const segs = 6;
  return (
    <group position={p} rotation={[0, seed * 2.1, 0]}>
      {Array.from({ length: segs }).map((_, i) => {
        const t = i / segs;
        return <Cy key={i} p={[Math.sin(t * lean * 2) * h * t * 0.5, (h / segs) * (i + 0.5), 0]} rt={0.17 - t * 0.05} rb={0.2 - t * 0.05} h={h / segs + 0.02} c="#7a6248" rough={0.95} seg={8} r={[0, 0, -lean * 0.3 * (1 - t * 0.2)]} />;
      })}
      <group position={[Math.sin(lean * 2) * h * 0.5, h, 0]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} geometry={fr} material={mat} rotation={[0, (i / 10) * Math.PI * 2, 0.0]} position={[0, 0, 0]} castShadow />
        ))}
        <Sp p={[0.12, -0.15, 0]} rad={0.12} c="#6a4a2a" sh={false} />
      </group>
    </group>
  );
}

// ---------- simple extras (background figures) ----------
export function Walker({ a, b, speed = 1.2, t0 = 0, color = "#556", umb, skin = "#b88a6a", loop = true }: { a: V3; b: V3; speed?: number; t0?: number; color?: string; umb?: string; skin?: string; loop?: boolean }) {
  const g = useRef<THREE.Group>(null!);
  const l1 = useRef<THREE.Mesh>(null!);
  const l2 = useRef<THREE.Mesh>(null!);
  const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]);
  useFrame(() => {
    const d = (clock.time * speed + t0 * speed) % (len || 1);
    const u = loop ? d / len : Math.min(1, (clock.time * speed) / len);
    g.current.position.set(a[0] + (b[0] - a[0]) * u, a[1], a[2] + (b[2] - a[2]) * u);
    const ph = (loop ? d : clock.time * speed) * 5;
    l1.current.rotation.x = Math.sin(ph) * 0.5;
    l2.current.rotation.x = -Math.sin(ph) * 0.5;
  });
  return (
    <group ref={g} rotation={[0, yaw, 0]}>
      <mesh ref={l1} position={[0.08, 0.85, 0]}><capsuleGeometry args={[0.05, 0.75, 3, 6]} /><primitive object={M("#2a2d36")} attach="material" /></mesh>
      <mesh ref={l2} position={[-0.08, 0.85, 0]}><capsuleGeometry args={[0.05, 0.75, 3, 6]} /><primitive object={M("#2a2d36")} attach="material" /></mesh>
      <mesh position={[0, 1.2, 0]} castShadow><capsuleGeometry args={[0.17, 0.5, 4, 8]} /><primitive object={M(color)} attach="material" /></mesh>
      <mesh position={[0, 1.72, 0]}><sphereGeometry args={[0.105, 10, 8]} /><primitive object={M(skin)} attach="material" /></mesh>
      <mesh position={[0, 1.76, -0.01]}><sphereGeometry args={[0.11, 10, 8, 0, 6.3, 0, 1.7]} /><primitive object={M("#1a1210")} attach="material" /></mesh>
      {umb && (
        <group position={[0.2, 1.6, 0.1]}>
          <Cy rt={0.01} rb={0.01} h={0.9} c="#222" p={[0, 0.1, 0]} />
          <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.6, 16, 8, 0, 6.3, 0, 0.85]} /><primitive object={M(umb, { side: THREE.DoubleSide })} attach="material" /></mesh>
        </group>
      )}
    </group>
  );
}
