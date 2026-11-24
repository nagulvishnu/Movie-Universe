import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flag, num, stage, str, vis } from "../movie/stage";
import type { RingKind, Vec3 } from "../movie/types";

/* ------------------------------------------------------------------ textures */
const texCache = new Map<string, THREE.CanvasTexture>();

function person(c: CanvasRenderingContext2D, x: number, y: number, s: number, skin: string, hair: string, cloth: string, opts: { long?: boolean; beard?: boolean; grey?: boolean; smile?: boolean } = {}) {
  c.fillStyle = cloth;
  c.beginPath();
  c.ellipse(x, y + s * 1.55, s * 0.95, s * 0.8, 0, Math.PI, 0);
  c.fill();
  if (opts.long) {
    c.fillStyle = hair;
    c.beginPath();
    c.ellipse(x, y + s * 0.45, s * 0.78, s * 1.1, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = skin;
  c.beginPath();
  c.ellipse(x, y, s * 0.55, s * 0.68, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = hair;
  c.beginPath();
  c.ellipse(x, y - s * 0.28, s * 0.6, s * 0.46, 0, Math.PI, 0);
  c.fill();
  if (opts.beard) {
    c.fillStyle = hair;
    c.beginPath();
    c.ellipse(x, y + s * 0.38, s * 0.45, s * 0.28, 0, 0, Math.PI);
    c.fill();
  }
  c.fillStyle = "#1a1210";
  c.fillRect(x - s * 0.25, y - s * 0.05, s * 0.1, s * 0.07);
  c.fillRect(x + s * 0.15, y - s * 0.05, s * 0.1, s * 0.07);
  c.strokeStyle = "#3a1a14";
  c.lineWidth = s * 0.05;
  c.beginPath();
  c.arc(x, y + s * 0.18, s * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
  c.stroke();
}

export function photoTexture(kind: string): THREE.CanvasTexture {
  const hit = texCache.get(kind);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 192;
  const c = cv.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 256, 192);
  g.addColorStop(0, "#9a8a6a");
  g.addColorStop(1, "#5a4d3a");
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 192);
  if (kind === "siblings") {
    c.fillStyle = "#6f8a5a";
    c.fillRect(0, 130, 256, 62);
    person(c, 88, 80, 34, "#c4977a", "#1b1612", "#30343f", { beard: true });
    person(c, 170, 86, 31, "#d9ae92", "#5b3a27", "#4f6d4b", { long: true });
  } else if (kind === "victims") {
    c.fillStyle = "#6a6050";
    c.fillRect(0, 120, 256, 72);
    person(c, 86, 82, 32, "#dca98f", "#2a1a13", "#8a2b32", { long: true });
    person(c, 172, 82, 32, "#c99d80", "#3a2a1a", "#3a4a60");
  } else if (kind === "workers") {
    c.fillStyle = "#555048";
    c.fillRect(0, 126, 256, 66);
    [[40, "#a4a3a0"], [92, "#3a2a1a"], [144, "#6a4a30"], [196, "#a4a3a0"]].forEach(([x, h], i) => person(c, x as number, 84, 21, i % 2 ? "#c99d80" : "#b48f78", h as string, ["#5a4938", "#3a4a60", "#555", "#6a5a40"][i]));
  } else {
    person(c, 128, 84, 40, "#c99d80", "#2a2018", "#4a5060");
  }
  c.fillStyle = "rgba(0,0,0,0.18)";
  for (let i = 0; i < 400; i++) c.fillRect(Math.random() * 256, Math.random() * 192, 1, 1);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(kind, tex);
  return tex;
}

export function windowsTexture(): THREE.CanvasTexture {
  const hit = texCache.get("windows");
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 256;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#0a0c12";
  c.fillRect(0, 0, 128, 256);
  for (let y = 6; y < 250; y += 16)
    for (let x = 6; x < 120; x += 16) {
      const on = Math.random() > 0.6;
      c.fillStyle = on ? (Math.random() > 0.5 ? "#ffd88a" : "#9ec4ff") : "#10131c";
      c.fillRect(x, y, 9, 9);
    }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  texCache.set("windows", tex);
  return tex;
}

/* ------------------------------------------------------------------ primitives */
interface BProps {
  p?: Vec3;
  s?: Vec3;
  c?: string;
  r?: Vec3;
  rough?: number;
  metal?: number;
  em?: string;
  ei?: number;
  shadow?: boolean;
  recv?: boolean;
  shape?: "box" | "cyl" | "sphere";
  opacity?: number;
  children?: ReactNode;
}

const boxG = new THREE.BoxGeometry(1, 1, 1);
const cylG = new THREE.CylinderGeometry(1, 1, 1, 14);
const sphG = new THREE.SphereGeometry(1, 14, 10);

/** Basic material mesh. Cylinder `s` = [radius, height, radius]. */
export function B({ p = [0, 0, 0], s = [1, 1, 1], c = "#888", r, rough = 0.8, metal = 0, em, ei = 1, shadow = false, recv = true, shape = "box", opacity, children }: BProps) {
  return (
    <mesh position={p} scale={s} rotation={r} geometry={shape === "box" ? boxG : shape === "cyl" ? cylG : sphG} castShadow={shadow} receiveShadow={recv}>
      <meshStandardMaterial color={c} roughness={rough} metalness={metal} emissive={em ?? "#000"} emissiveIntensity={em ? ei : 0} transparent={opacity !== undefined} opacity={opacity ?? 1} />
      {children}
    </mesh>
  );
}

interface RoomProps {
  w: number;
  d: number;
  h: number;
  floor?: string;
  wall?: string;
  ceil?: string;
  floorRough?: number;
  skip?: ("n" | "s" | "e" | "w" | "ceil")[];
}

/** Single-sided inward-facing room shell (walls can be seen through from outside). */
export function Room({ w, d, h, floor = "#3a3430", wall = "#6b6862", ceil = "#55524d", floorRough = 0.7, skip = [] }: RoomProps) {
  const mat = (c: string, rough = 0.9) => <meshStandardMaterial color={c} roughness={rough} side={THREE.FrontSide} />;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        {mat(floor, floorRough)}
      </mesh>
      {!skip.includes("ceil") && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
          <planeGeometry args={[w, d]} />
          {mat(ceil)}
        </mesh>
      )}
      {!skip.includes("n") && (
        <mesh position={[0, h / 2, -d / 2]} receiveShadow>
          <planeGeometry args={[w, h]} />
          {mat(wall)}
        </mesh>
      )}
      {!skip.includes("s") && (
        <mesh position={[0, h / 2, d / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
          <planeGeometry args={[w, h]} />
          {mat(wall)}
        </mesh>
      )}
      {!skip.includes("w") && (
        <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[d, h]} />
          {mat(wall)}
        </mesh>
      )}
      {!skip.includes("e") && (
        <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[d, h]} />
          {mat(wall)}
        </mesh>
      )}
    </group>
  );
}

/** Point light with deterministic flicker (driven by stage time, so seek/pause are exact). */
export function FlickerLight({ p, color = "#ffd9a0", base = 1, flicker = 0, speed = 9, dist = 8, decay = 2, thunder = 0, pulse = 0, pulseSpeed = 2 }: { p: Vec3; color?: string; base?: number; flicker?: number; speed?: number; dist?: number; decay?: number; thunder?: number; pulse?: number; pulseSpeed?: number }) {
  const ref = useRef<THREE.PointLight>(null!);
  useFrame(() => {
    const t = stage.t;
    let v = base;
    if (flicker) {
      const n = Math.sin(t * speed) * Math.sin(t * speed * 2.7 + 1.3) * Math.sin(t * speed * 0.37);
      v *= 1 - flicker * Math.max(0, n > 0.45 ? 1 : n * 0.4) * (n > 0.7 ? 1 : 0.5);
    }
    if (pulse) v *= 1 - pulse + pulse * (0.5 + 0.5 * Math.sin(t * pulseSpeed));
    if (thunder) v += thunder * vis("v:thunder", 0.5) * (Math.sin(stage.t * 60) > -0.4 ? 1 : 0.2);
    ref.current.intensity = Math.max(0, v);
  });
  return <pointLight ref={ref} position={p} color={color} distance={dist} decay={decay} intensity={base} />;
}

/* ------------------------------------------------------------------ screens */
interface TSProps {
  get: () => string;
  w: number;
  h: number;
  p?: Vec3;
  r?: Vec3;
  color?: string;
  bg?: string;
  size?: number;
  bright?: number;
  flick?: boolean;
}

/** Canvas-text plane; redraws only when the text changes. Used for phones, monitors, clocks. */
export function TextScreen({ get, w, h, p = [0, 0, 0], r, color = "#8fffd0", bg = "#031008", size = 0.3, bright = 1.4, flick = false }: TSProps) {
  const { cv, tex } = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = Math.max(32, Math.round((512 * h) / w));
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { cv, tex };
  }, [w, h]);
  const last = useRef("\u0000");
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame(() => {
    const text = get();
    if (text !== last.current) {
      last.current = text;
      const c = cv.getContext("2d")!;
      c.fillStyle = bg;
      c.fillRect(0, 0, cv.width, cv.height);
      if (text) {
        const lines = text.split("\n");
        const fs = cv.height * size;
        c.font = `bold ${fs}px "Courier New", monospace`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = color;
        c.shadowColor = color;
        c.shadowBlur = fs * 0.25;
        lines.forEach((ln, i) => c.fillText(ln, cv.width / 2, cv.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.15));
      }
      tex.needsUpdate = true;
    }
    if (flick) mat.current.opacity = 0.85 + 0.15 * Math.sin(stage.t * 47) * Math.sin(stage.t * 13);
    mat.current.color.setScalar(text ? bright : 0.15);
  });
  return (
    <mesh position={p} rotation={r}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial ref={mat} map={tex} toneMapped={false} transparent />
    </mesh>
  );
}

/* ------------------------------------------------------------------ weather */
const rainVert = /* glsl */ `
uniform float uTime; uniform vec3 uArea; uniform float uSpeed; uniform float uSlant; uniform float uLen;
attribute float aEnd; attribute float aSeed;
varying float vA;
void main(){
  vec3 p = position;
  float sp = uSpeed*(0.75+0.5*aSeed);
  p.y = mod(p.y - uTime*sp, uArea.y);
  p.x += (uArea.y - p.y)*uSlant;
  p += vec3(uSlant,1.0,0.0)*uLen*aEnd*(0.6+aSeed);
  vA = 1.0 - aEnd*0.8;
  gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;
const rainFrag = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; varying float vA;
void main(){ gl_FragColor = vec4(uColor, uOpacity*vA); }`;

export function Rain({ count = 1500, area = [26, 14, 36] as Vec3, center = [0, 0, 0] as Vec3, speed = 16, slant = 0.08, opacity = 0.32 }: { count?: number; area?: Vec3; center?: Vec3; speed?: number; slant?: number; opacity?: number }) {
  const q = stage.quality === "low" ? 0.5 : stage.quality === "high" ? 1.3 : 1;
  const n = Math.floor(count * q);
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(n * 6);
    const end = new Float32Array(n * 2);
    const seed = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * area[0];
      const y = Math.random() * area[1];
      const z = (Math.random() - 0.5) * area[2];
      const s = Math.random();
      for (let k = 0; k < 2; k++) {
        pos.set([x, y, z], i * 6 + k * 3);
        end[i * 2 + k] = k;
        seed[i * 2 + k] = s;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: rainVert,
      fragmentShader: rainFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uArea: { value: new THREE.Vector3(...area) },
        uSpeed: { value: speed },
        uSlant: { value: slant },
        uLen: { value: 0.6 },
        uColor: { value: new THREE.Color("#a9bfd8") },
        uOpacity: { value: opacity },
      },
    });
    return { geo, mat };
  }, [n, area, speed, slant, opacity]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  useFrame(() => {
    mat.uniforms.uTime.value = stage.t;
  });
  return <lineSegments geometry={geo} material={mat} position={center} frustumCulled={false} />;
}

const dropVert = /* glsl */ `
uniform float uTime; uniform vec2 uSize; uniform float uPx;
attribute float aSeed; varying float vS;
void main(){
  vec3 p = position;
  float sp = 0.02 + aSeed*aSeed*0.16;
  float y = mod(p.y - uTime*sp*uSize.y*0.5 - sin(uTime*0.7+aSeed*20.0)*0.0, uSize.y);
  p.y = y - uSize.y*0.5;
  p.x += sin(p.y*7.0 + aSeed*30.0)*0.01*aSeed;
  vS = aSeed;
  vec4 mv = modelViewMatrix*vec4(p,1.0);
  gl_PointSize = clamp(uPx*(0.5+aSeed)/(-mv.z), 1.5, 5.0);
  gl_Position = projectionMatrix*mv;
}`;
const dropFrag = /* glsl */ `
uniform vec3 uColor; varying float vS;
void main(){ vec2 c = gl_PointCoord-0.5; float d = length(c*vec2(1.0,0.8)); if(d>0.5) discard;
  float hl = smoothstep(0.5,0.1,length(c-vec2(-0.12,-0.15)));
  gl_FragColor = vec4(uColor + hl*0.6, (0.25+hl*0.5)*(0.5+vS*0.5)); }`;

/** Raindrops sliding down a pane of glass (plane centred on origin, facing +z). */
export function WindowRain({ w, h, p = [0, 0, 0], r, count = 260, px = 30, color = "#9db6d0" }: { w: number; h: number; p?: Vec3; r?: Vec3; count?: number; px?: number; color?: string }) {
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * w, Math.random() * h, 0.004], i * 3);
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: dropVert,
      fragmentShader: dropFrag,
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uSize: { value: new THREE.Vector2(w, h) }, uPx: { value: px * 0.18 }, uColor: { value: new THREE.Color(color) } },
    });
    return { geo, mat };
  }, [w, h, count, px, color]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  useFrame(() => {
    mat.uniforms.uTime.value = stage.t;
  });
  return <points geometry={geo} material={mat} position={p} rotation={r} frustumCulled={false} />;
}

const dustVert = /* glsl */ `
uniform float uTime; uniform vec3 uBox; attribute float aSeed;
void main(){
  vec3 p = position;
  p.x += sin(uTime*0.15+aSeed*40.0)*0.6;
  p.y = mod(p.y + uTime*0.03*(0.3+aSeed), uBox.y);
  p.z += cos(uTime*0.11+aSeed*25.0)*0.6;
  vec4 mv = modelViewMatrix*vec4(p - uBox*vec3(0.5,0.0,0.5),1.0);
  gl_PointSize = clamp((1.0+aSeed*2.0)*9.0/(-mv.z), 1.0, 4.5);
  gl_Position = projectionMatrix*mv;
}`;
const dustFrag = /* glsl */ `
uniform vec3 uColor; uniform float uA;
void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5) discard; gl_FragColor=vec4(uColor,uA*(1.0-d*2.0)); }`;

export function Dust({ box = [8, 3, 8] as Vec3, p = [0, 0, 0] as Vec3, count = 160, color = "#d8c9a8", a = 0.5 }: { box?: Vec3; p?: Vec3; count?: number; color?: string; a?: number }) {
  const n = stage.quality === "low" ? Math.floor(count / 3) : count;
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([Math.random() * box[0], Math.random() * box[1], Math.random() * box[2]], i * 3);
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uBox: { value: new THREE.Vector3(...box) }, uColor: { value: new THREE.Color(color) }, uA: { value: a } },
    });
    return { geo, mat };
  }, [n, box, color, a]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  useFrame(() => {
    mat.uniforms.uTime.value = stage.t;
  });
  return <points geometry={geo} material={mat} position={p} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ telephones */
const isRinging = (kinds: RingKind[]) => kinds.includes(stage.ring as RingKind);

/**
 * The film's central symbol: an old rotary telephone. Shakes and glows when it rings; the handset leaves the cradle
 * when `st.off_<name>` is set (an actor is holding it).
 */
export function OldPhone({ name, p, r = [0, 0, 0], color = "#15151a", ring = ["old"], display, lamp = false, scale = 1 }: { name: string; p: Vec3; r?: Vec3; color?: string; ring?: RingKind[]; display?: boolean; lamp?: boolean; scale?: number }) {
  const g = useRef<THREE.Group>(null!);
  const hs = useRef<THREE.Group>(null!);
  const led = useRef<THREE.MeshBasicMaterial>(null!);
  const bellMat = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(() => {
    const ringing = isRinging(ring);
    const t = stage.t;
    const sh = ringing ? Math.sin(t * 150) * 0.0016 : 0;
    g.current.position.set(p[0] + sh, p[1], p[2] + (ringing ? Math.sin(t * 131) * 0.0012 : 0));
    hs.current.visible = !flag(`off_${name}`);
    hs.current.rotation.z = ringing ? Math.sin(t * 160) * 0.012 : 0;
    const on = ringing ? (Math.sin(t * 24) > 0 ? 1 : 0.35) : 0;
    if (led.current) led.current.color.setRGB(on * 3, on * 0.15, on * 0.1);
    if (bellMat.current) bellMat.current.emissiveIntensity = ringing ? on * 0.8 : 0;
  });
  return (
    <group ref={g} position={p} rotation={r} scale={scale}>
      <B p={[0, 0.03, 0]} s={[0.27, 0.06, 0.21]} c={color} rough={0.25} metal={0.2} shadow />
      <B p={[0, 0.085, 0.01]} s={[0.2, 0.06, 0.15]} c={color} rough={0.25} metal={0.2} shadow />
      <mesh position={[0, 0.098, 0.055]} rotation={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.012, 20]} />
        <meshStandardMaterial ref={bellMat} color="#cfc7b0" roughness={0.35} metalness={0.6} emissive="#ff3020" emissiveIntensity={0} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 1.65 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.037, 0.1 + Math.sin(a) * 0.037 * 0.46 + 0.0, 0.058 + Math.sin(a) * 0.037 * 0.9 * 0.0]} rotation={[-0.5, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.014, 6]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        );
      })}
      <group ref={hs} position={[0, 0.138, 0]}>
        <B p={[0, 0, 0]} s={[0.012, 0.22, 0.012]} c={color} rough={0.2} metal={0.3} r={[0, 0, Math.PI / 2]} shape="cyl" shadow />
        <B p={[-0.11, -0.012, 0]} s={[0.032, 0.03, 0.032]} c={color} rough={0.2} shape="cyl" />
        <B p={[0.11, -0.012, 0]} s={[0.032, 0.03, 0.032]} c={color} rough={0.2} shape="cyl" />
      </group>
      {lamp && (
        <mesh position={[0.1, 0.12, -0.04]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshBasicMaterial ref={led} color="#300" toneMapped={false} />
        </mesh>
      )}
      {display && (
        <TextScreen get={() => str("display")} w={0.13} h={0.04} p={[0, 0.07, 0.108]} r={[-0.15, 0, 0]} size={0.4} color="#ff5a3a" bg="#120404" />
      )}
    </group>
  );
}

/** Smartphone lying flat; vibrates and lights up while a mobile call rings. */
export function Mobile({ p, r = [0, 0, 0], name = "mob", showKey }: { p: Vec3; r?: Vec3; name?: string; showKey?: string }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    g.current.visible = showKey ? flag(showKey) : !flag(`off_${name}`);
    const ringing = stage.ring === "mobile";
    const t = stage.t;
    const buzz = ringing && t % 1.2 < 0.55;
    g.current.position.set(p[0] + (buzz ? Math.sin(t * 120) * 0.003 : 0), p[1], p[2] + (buzz ? Math.cos(t * 97) * 0.003 : 0));
  });
  return (
    <group ref={g} position={p} rotation={r}>
      <B p={[0, 0.004, 0]} s={[0.072, 0.008, 0.15]} c="#0c0d11" rough={0.2} metal={0.5} shadow />
      <TextScreen
        get={() => (stage.ring === "mobile" || flag("phoneOn") ? str("phoneText", "UNKNOWN\nNUMBER") : "")}
        w={0.064}
        h={0.138}
        p={[0, 0.0085, 0]}
        r={[-Math.PI / 2, 0, 0]}
        color="#ffffff"
        bg="#0a1a33"
        size={0.075}
        bright={1.3}
      />
    </group>
  );
}

/** Thick cable along a curve. */
export function Cable({ pts, r = 0.02, c = "#15151a", seg = 24 }: { pts: Vec3[]; r?: number; c?: string; seg?: number }) {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q))), seg, r, 6, false), [pts, r, seg]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={c} roughness={0.6} />
    </mesh>
  );
}

/** Framed photograph on a wall / desk. */
export function Photo({ kind, p, r = [0, 0, 0], s = 0.3 }: { kind: string; p: Vec3; r?: Vec3; s?: number }) {
  const tex = useMemo(() => photoTexture(kind), [kind]);
  return (
    <group position={p} rotation={r}>
      <B s={[s * 1.15, s * 0.88, 0.015]} c="#2a2018" />
      <mesh position={[0, 0, 0.009]}>
        <planeGeometry args={[s, s * 0.75]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  );
}

export function useStageNum(k: string, d = 0) {
  return num(k, d);
}

/** Light that only glows while `when()` is true (phone/monitor spill on faces). Constant light count, no shader recompiles. */
export function GlowLight({ p, color = "#8ab4ff", i = 0.8, dist = 3, when }: { p: Vec3; color?: string; i?: number; dist?: number; when: () => boolean }) {
  const ref = useRef<THREE.PointLight>(null!);
  useFrame(() => {
    ref.current.intensity = when() ? i * (0.9 + 0.1 * Math.sin(stage.t * 31)) : 0;
  });
  return <pointLight ref={ref} position={p} color={color} distance={dist} decay={2} intensity={0} />;
}

/** Night / morning city backdrop painted on a canvas (soft bokeh lights). */
export function cityTexture(kind: "night" | "day" | "storm"): THREE.CanvasTexture {
  const key = `city_${kind}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 320;
  const c = cv.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 0, 320);
  if (kind === "day") {
    g.addColorStop(0, "#9fb0c0");
    g.addColorStop(1, "#d9d3c4");
  } else {
    g.addColorStop(0, "#07090f");
    g.addColorStop(1, "#1a2233");
  }
  c.fillStyle = g;
  c.fillRect(0, 0, 512, 320);
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * 512;
    const w = 24 + Math.random() * 50;
    const h = 80 + Math.random() * 180;
    c.fillStyle = kind === "day" ? "#7d8791" : "#0b0f18";
    c.fillRect(x, 320 - h, w, h);
    if (kind !== "day")
      for (let k = 0; k < 14; k++) {
        c.fillStyle = Math.random() > 0.5 ? "rgba(255,210,130,0.9)" : "rgba(150,190,255,0.8)";
        if (Math.random() > 0.5) c.fillRect(x + Math.random() * w, 320 - Math.random() * h, 3, 3);
      }
  }
  if (kind !== "day") {
    for (let i = 0; i < 60; i++) {
      const rg = c.createRadialGradient(0, 0, 0, 0, 0, 14);
      const col = Math.random() > 0.5 ? "255,190,110" : "120,170,255";
      rg.addColorStop(0, `rgba(${col},0.7)`);
      rg.addColorStop(1, `rgba(${col},0)`);
      c.save();
      c.translate(Math.random() * 512, 160 + Math.random() * 160);
      c.fillStyle = rg;
      c.fillRect(-14, -14, 28, 28);
      c.restore();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tex);
  return tex;
}

/** Spot light with a proper in-scene target. */
export function Spot({ p, to, color = "#fff", intensity = 20, angle = 0.5, penumbra = 0.6, dist = 20, shadow = false }: { p: Vec3; to: Vec3; color?: string; intensity?: number; angle?: number; penumbra?: number; dist?: number; shadow?: boolean }) {
  const ref = useRef<THREE.SpotLight>(null!);
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    target.position.set(...to);
    ref.current.target = target;
  }, [target, to]);
  return (
    <>
      <spotLight ref={ref} position={p} color={color} intensity={intensity} angle={angle} penumbra={penumbra} distance={dist} decay={2} castShadow={shadow} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <primitive object={target} />
    </>
  );
}
