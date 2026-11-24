import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { B, Cy, Sp, Pl, Glow, Inst, Sea, WetFloor, Palm, Walker, Rain, useLight, useQuality, type V3, type InstItem } from "./envKit";
import { T } from "./textures";
import { clock } from "../film/clock";

// roof-edge rain drips (anchored, not camera-relative)
function Drips({ p, w = 36, h = 3.8 }: { p: V3; w?: number; h?: number }) {
  const { geo, mat } = useMemo(() => {
    const n = 420;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 6);
    const end = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * w, y = Math.random() * h, z = (Math.random() - 0.5) * 0.15;
      pos.set([x, y, z, x, y, z], i * 6);
      end[i * 2] = 0; end[i * 2 + 1] = 1;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uH: { value: h } },
      vertexShader: `attribute float aEnd; uniform float uTime,uH; void main(){ vec3 p=position; p.y=mod(p.y-uTime*(5.+fract(p.x*13.)*3.),uH); p.y+=aEnd*0.35; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
      fragmentShader: `void main(){ gl_FragColor=vec4(0.85,0.9,1.,0.5); }`,
    });
    return { geo: g, mat: m };
  }, [w, h]);
  useFrame(() => { mat.uniforms.uTime.value = clock.time; });
  useLayoutEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <lineSegments position={p} geometry={geo} material={mat} frustumCulled={false} />;
}

function Lamp({ p, c = "#ffd9a0", light = false, h = 3.6 }: { p: V3; c?: string; light?: boolean; h?: number }) {
  return (
    <group position={p}>
      <Cy p={[0, h / 2, 0]} rt={0.05} rb={0.07} h={h} c="#23262c" metal={0.6} rough={0.5} seg={8} />
      <B p={[0.25, h, 0]} s={[0.7, 0.06, 0.12]} c="#23262c" />
      <B p={[0.45, h - 0.07, 0]} s={[0.3, 0.07, 0.2]} c={c} em={c} ei={4} />
      {light && <pointLight position={[0.45, h - 0.4, 0]} color={c} intensity={9} distance={11} decay={2} />}
    </group>
  );
}

function Train({ z = -8.6, speed = 5 }: { z?: number; speed?: number }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => { g.current.position.x = 120 - ((clock.time * speed) % 330); });
  return (
    <group ref={g} position={[0, 0, z]}>
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i} position={[i * 3.7, 1.7, 0]}>
          <B s={[3.55, 2.6, 2.5]} c="#2f4f86" rough={0.4} metal={0.3} />
          <B p={[0, -0.9, 0]} s={[3.56, 0.7, 2.52]} c="#d9d9d4" rough={0.5} />
          <B p={[0, 0.35, 0]} s={[3.2, 0.75, 2.54]} c="#ffe2a0" em="#ffd890" ei={1.6} />
          <B p={[0, 1.35, 0]} s={[3.5, 0.18, 2.3]} c="#cfd3d6" />
          <B p={[0, -1.45, 0]} s={[3.2, 0.4, 2.0]} c="#1c1e22" />
        </group>
      ))}
      <B p={[-1.9, 1.7, 0]} s={[0.3, 2.4, 2.3]} c="#26436f" />
      <pointLight position={[-2.6, 1.8, 0]} color="#fff2c8" intensity={20} distance={25} />
    </group>
  );
}

// ======================================================= STATION
export function Station() {
  const conc = useMemo(() => T.concrete("#6f7276", [14, 2]), []);
  const plaster = useMemo(() => T.plaster("#d8c7a2", [8, 1]), []);
  const sleepers = useMemo<InstItem[]>(() => Array.from({ length: 110 }, (_, i) => ({ p: [-40 + i * 0.75, -0.9, -5.0] as V3, s: [0.22, 0.1, 2.3] as V3 })), []);
  const sleepers2 = useMemo<InstItem[]>(() => Array.from({ length: 110 }, (_, i) => ({ p: [-40 + i * 0.75, -0.9, -8.6] as V3, s: [0.22, 0.1, 2.3] as V3 })), []);
  const cols = useMemo<InstItem[]>(() => Array.from({ length: 9 }, (_, i) => ({ p: [-20 + i * 5, 2.0, -2.35] as V3, s: [0.28, 4, 0.28] as V3 })), []);
  const cols2 = useMemo<InstItem[]>(() => Array.from({ length: 9 }, (_, i) => ({ p: [-20 + i * 5, 2.0, -11.5] as V3, s: [0.28, 4, 0.28] as V3 })), []);
  const strips = useMemo<InstItem[]>(() => Array.from({ length: 9 }, (_, i) => ({ p: [-20 + i * 5, 3.88, 0.4] as V3, s: [1.8, 0.05, 0.22] as V3 })), []);
  return (
    <group>
      <Sea y={-1.2} z={-250} />
      <B p={[0, -0.3, 0.5]} s={[46, 0.6, 6.6]} tex={conc} c="#8a8d92" />
      <WetFloor p={[0, 0.004, 0.5]} s={[46, 6.6]} color="#363a42" />
      <B p={[0, 0.006, -2.4]} s={[46, 0.012, 0.3]} c="#d8b52e" />
      <B p={[0, -0.3, -13.5]} s={[46, 0.6, 6]} tex={conc} c="#707378" />
      <B p={[0, -1.1, -7]} s={[70, 0.4, 7]} c="#4a4540" rough={1} />
      {[-4.3, -5.75, -7.9, -9.35].map((z) => <B key={z} p={[0, -0.82, z]} s={[70, 0.1, 0.08]} c="#8a8f95" metal={0.8} rough={0.35} />)}
      <Inst geo="box" items={sleepers} c="#3b2f28" />
      <Inst geo="box" items={sleepers2} c="#3b2f28" />
      {/* canopy */}
      <B p={[0, 4.0, 0.9]} s={[46, 0.18, 6.8]} c="#364050" metal={0.4} rough={0.5} />
      <B p={[0, 3.75, -2.5]} s={[46, 0.5, 0.12]} c="#2c3441" />
      <Inst geo="cyl" items={cols} c="#2a303a" metal={0.5} />
      <B p={[0, 4.0, -11]} s={[46, 0.18, 5]} c="#364050" />
      <Inst geo="cyl" items={cols2} c="#2a303a" metal={0.5} />
      <Inst geo="box" items={strips} c="#fff4d8" em="#fff0cc" ei={2.4} cast={false} />
      <Drips p={[0, 0, -2.62]} />
      <Drips p={[0, 0, -11.2]} />
      {/* building */}
      <B p={[0, 2.6, 4.4]} s={[46, 5.2, 0.6]} tex={plaster} c="#e6d6b0" />
      <B p={[0, 0.7, 4.08]} s={[46, 1.4, 0.12]} c="#6f2f2c" rough={0.7} />
      <B p={[0, 4.1, 4.1]} s={[46, 0.35, 0.5]} c="#6f2f2c" />
      {[-14, -6, 6, 14].map((x) => (
        <group key={x} position={[x, 0, 4.06]}>
          <B p={[0, 1.55, 0]} s={[1.9, 1.3, 0.08]} c="#ffcf8a" em="#ffc880" ei={0.6} />
          <B p={[0, 1.55, -0.03]} s={[2.0, 0.08, 0.1]} c="#2b2018" />
          <B p={[0, 2.25, -0.03]} s={[2.0, 0.08, 0.1]} c="#2b2018" />
          <B p={[0, 1.0, -0.06]} s={[2.1, 0.12, 0.3]} c="#3a2a20" />
        </group>
      ))}
      <B p={[0, 1.4, 4.05]} s={[2.4, 2.8, 0.12]} c="#3a2a20" />
      <B p={[0, 1.4, 4.0]} s={[2.1, 2.5, 0.08]} c="#ffd9a0" em="#ffc680" ei={0.4} />
      <Pl p={[8, 3.1, 3.7]} s={[3.2, 0.8, 1]} tex={T.sign("SAMUDRAPURAM", "#14365f", "#f6f1e0", "Platform 2")} rough={0.5} />
      <Pl p={[-9, 3.1, -1.38]} s={[3.2, 0.8, 1]} side={THREE.FrontSide} tex={T.sign("SAMUDRAPURAM", "#14365f", "#f6f1e0", "Platform 2")} rough={0.5} />
      <Pl p={[-9, 3.1, -1.42]} s={[3.2, 0.8, 1]} r={[0, Math.PI, 0]} side={THREE.FrontSide} tex={T.sign("SAMUDRAPURAM", "#14365f", "#f6f1e0", "Platform 2")} rough={0.5} />
      <Cy p={[-11, 3.0, 3.75]} rt={0.4} rb={0.4} h={0.1} r={[Math.PI / 2, 0, 0]} c="#f3efe3" em="#ffffff" ei={0.4} />
      <B p={[-11, 3.0, 3.69]} s={[0.04, 0.3, 0.02]} c="#111" />
      <B p={[-10.9, 3.0, 3.69]} s={[0.25, 0.04, 0.02]} c="#111" />
      {[-3, 3, 10].map((x, i) => <Pl key={x} p={[x * 1.3 - 2, 2.0, 3.74]} s={[0.9, 0.68, 1]} tex={T.photo(["sunrise", "street", "light"][i])} />)}
      {/* vending machine */}
      <B p={[-17, 1.0, 3.5]} s={[1.0, 2.0, 0.8]} c="#2c5aa0" />
      <B p={[-17, 1.2, 3.09]} s={[0.8, 1.2, 0.04]} c="#bfe4ff" em="#9fd4ff" ei={1.4} />
      {/* bench (faces -z) */}
      <group position={[-1.2, 0, 2.3]}>
        {[-0.1, 0.0, 0.1, 0.2].map((dz, i) => <B key={i} p={[0, 0.46, dz - 0.13]} s={[1.8, 0.04, 0.09]} c="#7a5436" />)}
        {[0, 1, 2].map((i) => <B key={i} p={[0, 0.7 + i * 0.1, 0.32]} s={[1.8, 0.07, 0.03]} c="#7a5436" />)}
        {[-0.8, 0.8].map((x) => <B key={x} p={[x, 0.22, 0.05]} s={[0.06, 0.44, 0.6]} c="#1f2329" metal={0.5} />)}
        {[-0.8, 0.8].map((x) => <B key={x} p={[x, 0.65, 0.33]} s={[0.06, 0.5, 0.05]} c="#1f2329" metal={0.5} />)}
      </group>
      <B p={[-10, 0.45, 2.7]} s={[1.8, 0.05, 0.5]} c="#7a5436" />
      <B p={[-10, 0.2, 2.7]} s={[1.7, 0.4, 0.1]} c="#222" />
      <Cy p={[5.5, 0.45, 3.4]} rt={0.28} rb={0.24} h={0.9} c="#2f6a4c" />
      {/* lamps */}
      <Lamp p={[-8, 0, 0.2]} light h={3.6} />
      <Lamp p={[2, 0, 0.2]} light h={3.6} />
      <Lamp p={[12, 0, 0.2]} h={3.6} />
      <Lamp p={[-18, 0, 0.2]} h={3.6} />
      <Lamp p={[8, 0, -12.5]} h={3.6} />
      <Lamp p={[-6, 0, -12.5]} h={3.6} />
      <Train />
      {/* travellers */}
      <Walker a={[-22, 0, 3.0]} b={[22, 0, 3.0]} speed={1.1} t0={4} color="#8a3a3a" umb="#273b64" />
      <Walker a={[22, 0, 2.7]} b={[-22, 0, 2.7]} speed={1.3} t0={12} color="#3a6a5a" umb="#6a2a44" />
      <Walker a={[-22, 0, -1.6]} b={[22, 0, -1.6]} speed={1.0} t0={20} color="#cba94a" umb="#222" />
      <Walker a={[14, 0, 1.5]} b={[14.01, 0, 1.5]} speed={0.01} color="#4a4a6a" umb="#7a2a2a" />
      <Walker a={[15.2, 0, 1.2]} b={[15.21, 0, 1.2]} speed={0.01} color="#5a7a5a" umb="#33557a" />
      <Walker a={[-30, 0, -13]} b={[30, 0, -13]} speed={1.2} t0={3} color="#444a5a" umb="#333" />
    </group>
  );
}

// ======================================================= STREET
function Shop({ p, w = 5, h = 4.5, c = "#e8d4a8", awn = "#b23a3a", sign, lit = true, flip = false }: { p: V3; w?: number; h?: number; c?: string; awn?: string; sign?: string; lit?: boolean; flip?: boolean }) {
  const d = flip ? -1 : 1;
  const pl = useMemo(() => T.plaster(c, [2, 2]), [c]);
  return (
    <group position={p}>
      <B p={[0, h / 2, 0]} s={[w, h, 3]} tex={pl} c={c} />
      <B p={[0, 1.4, -1.52 * d]} s={[w * 0.72, 1.7, 0.05]} c="#ffd8a0" em={lit ? "#ffc47a" : "#667788"} ei={lit ? 1.1 : 0.15} />
      <B p={[w * 0.28, 1.1, -1.55 * d]} s={[0.9, 2.2, 0.08]} c="#3b2a1f" />
      <B p={[0, 2.7, -1.9 * d]} s={[w * 0.95, 0.07, 1.2]} c={awn} r={[0.3 * d, 0, 0]} />
      <B p={[0, 3.35, -1.57 * d]} s={[w * 0.8, 0.5, 0.06]} c="#f3ead4" />
      {sign && <Pl p={[0, 3.35, -1.61 * d]} s={[w * 0.78, 0.46, 1]} r={[0, flip ? Math.PI : 0, 0]} tex={T.sign(sign, "#f3ead4", "#5a2a20")} />}
      {[-1, 1].map((s) => <B key={s} p={[s * w * 0.33, h - 1.0, -1.52 * d]} s={[0.8, 1.0, 0.05]} c="#8fb0c8" em="#7a96ad" ei={lit ? 0.5 : 0.1} />)}
      <B p={[0, h + 0.1, 0]} s={[w + 0.2, 0.25, 3.2]} c="#8a6a52" />
    </group>
  );
}

function Stall({ p, awn, fruit }: { p: V3; awn: string; fruit: string[] }) {
  const items = useMemo<InstItem[]>(() => {
    const a: InstItem[] = [];
    for (let i = 0; i < 40; i++) a.push({ p: [-0.9 + (i % 10) * 0.2, 0.98 + Math.floor(i / 10) * 0.07, -0.18 + (Math.floor(i / 10) % 2) * 0.3], s: [0.17, 0.17, 0.17], c: fruit[i % fruit.length] });
    return a;
  }, [fruit]);
  return (
    <group position={p}>
      {[-1.2, 1.2].flatMap((x) => [-0.7, 0.7].map((z) => <Cy key={x + "" + z} p={[x, 1.1, z]} rt={0.03} rb={0.03} h={2.2} c="#6a4a2a" seg={6} />))}
      <B p={[0, 2.3, 0]} s={[2.8, 0.05, 1.8]} c={awn} r={[0.12, 0, 0]} />
      <B p={[0, 0.45, 0]} s={[2.2, 0.9, 0.9]} c="#7a5a3a" />
      <B p={[0, 0.9, 0]} s={[2.3, 0.06, 1.0]} c="#c9a878" />
      <Inst geo="sphere" items={items} c="#fff" />
      <Glow p={[0, 2.1, 0.5]} c="#ffd9a0" rad={0.07} />
      <pointLight position={[0, 2.0, 0.5]} color="#ffcf90" intensity={3.5} distance={6} />
    </group>
  );
}

export function Street({ v = "dry" }: { v?: string }) {
  const L = useLight();
  const q = useQuality();
  const rain = v === "rain";
  const conc = useMemo(() => T.concrete("#8a8a86", [10, 1.5]), []);
  const asph = useMemo(() => T.asphalt([16, 3]), []);
  const flags = useMemo<InstItem[]>(() => {
    const a: InstItem[] = [];
    const cols = ["#e24a4a", "#f2c14a", "#3a8fd0", "#4ab86a", "#e87aa8"];
    for (let i = 0; i < 70; i++) {
      const x = -17.5 + i * 0.5;
      a.push({ p: [x, 4.2 - Math.sin(((i % 14) / 14) * Math.PI) * 0.45, 1.0], s: [0.3, 0.38, 0.02], r: [0, 0, Math.PI / 4], c: cols[i % cols.length] });
    }
    return a;
  }, []);
  const shopsA: [string, string, string][] = [["#e7d3a6", "#b23a3a", "CAFE SEA BREEZE"], ["#cfe3d4", "#2f7a6a", "FRESH JUICE"], ["#f0c9a0", "#c46a2a", "BOOKS & MAPS"], ["#d8d0e8", "#6a4a9a", "TAILORS"], ["#f3e3b0", "#3a6aa8", "PHARMACY"], ["#e0b8a8", "#8a3a3a", "SWEETS"]];
  const night = L.stars > 0.3 || rain;
  return (
    <group>
      <Sea y={-0.6} z={-300} />
      <B p={[0, -0.3, 1.0]} s={[60, 0.6, 5.2]} tex={conc} c="#a4a49e" />
      <B p={[0, -0.45, -5.3]} s={[60, 0.3, 7.4]} tex={asph} c="#9a9ea4" />
      <B p={[0, -0.28, -1.65]} s={[60, 0.3, 0.3]} c="#b4b4ae" />
      {[...Array(10)].map((_, i) => <B key={i} p={[-18 + i * 4, -0.31, -5.2]} s={[1.6, 0.01, 0.16]} c="#e8e4d4" sh={false} />)}
      {rain && <WetFloor p={[0, 0.004, 1.0]} s={[60, 5.2]} color="#3a3d44" />}
      {rain && <WetFloor p={[0, -0.298, -5.3]} s={[60, 7.4]} color="#2a2c32" />}
      {shopsA.map((s, i) => v !== "hosp" && <Shop key={i} p={[-13.5 + i * 5.4, 0, 5.3]} c={s[0]} awn={s[1]} sign={s[2]} lit={night || v === "market"} />)}
      {v === "hosp" && (
        <group position={[0, 0, 5.5]}>
          <B p={[0, 4.0, 0]} s={[22, 8, 3]} c="#e9eef2" />
          <B p={[0, 2.0, -1.52]} s={[7, 4, 0.06]} c="#a8cbe0" em="#8fb4cc" ei={0.5} rough={0.1} metal={0.6} />
          <B p={[0, 3.6, -3.2]} s={[8, 0.2, 3.6]} c="#d6dde2" />
          {[-5, 5].map((x) => <B key={x} p={[x, 1.8, -3.2]} s={[0.25, 3.6, 0.25]} c="#c8d0d6" />)}
          <Pl p={[0, 5.5, -1.56]} s={[7.5, 1.1, 1]} tex={T.sign("CITY GENERAL HOSPITAL", "#ffffff", "#1f5f8f")} />
          <B p={[-9, 5.5, -1.55]} s={[1.2, 0.35, 0.05]} c="#d33" em="#d33" ei={0.6} />
          <B p={[-9, 5.5, -1.55]} s={[0.35, 1.2, 0.05]} c="#d33" em="#d33" ei={0.6} />
          {[-8, 8].flatMap((x) => [3, 5.5].map((y) => <B key={x + "" + y} p={[x, y, -1.52]} s={[2, 1.3, 0.05]} c="#b8d2e4" rough={0.1} metal={0.5} />))}
        </group>
      )}
      <Shop p={[-12, 0, -12.5]} c="#ead9b3" awn="#b23a3a" flip lit={night} w={6} sign="HOTEL SAGAR" />
      <Shop p={[-5, 0, -12.5]} c="#c9dcd0" awn="#2f7a6a" flip lit={night} w={6} sign="STATIONERS" />
      <Shop p={[2, 0, -12.5]} c="#e8c9a8" awn="#c46a2a" flip lit={night} w={6} sign="BAKERY" />
      <Shop p={[9, 0, -12.5]} c="#d4d0ea" awn="#6a4a9a" flip lit={night} w={6} sign="RADIO HOUSE" />
      {[-14, -4, 7, 16].map((x, i) => <Palm key={x} p={[x, 0, -1.2]} h={6 + (i % 2)} lean={0.2 + i * 0.05} seed={i + 1} />)}
      {[-8, 3, 13].map((x) => <Lamp key={x} p={[x, 0, -1.3]} h={4.4} light={Math.abs(x) < 6} c={night ? "#ffd9a0" : "#fff4d6"} />)}
      {/* bunting */}
      <Inst geo="box" items={flags} c="#fff" cast={false} />
      {/* tuk-tuk */}
      <group position={[8, 0, -4.2]} rotation={[0, 0.2, 0]}>
        <B p={[0, 0.7, 0]} s={[1.3, 0.7, 2.2]} c="#e6b422" rough={0.4} />
        <B p={[0, 1.4, 0.1]} s={[1.28, 0.06, 1.7]} c="#222" />
        {[-0.6, 0.6].map((x) => <B key={x} p={[x, 1.1, 0.1]} s={[0.04, 0.7, 0.04]} c="#222" />)}
        {[[-0.55, 0.9], [0.55, 0.9], [0, -0.9]].map(([x, z], i) => <Cy key={i} p={[x, 0.2, z]} rt={0.2} rb={0.2} h={0.12} r={[0, 0, Math.PI / 2]} c="#151515" />)}
      </group>
      {v === "market" && (
        <>
          <Stall p={[-6, 0, 2.9]} awn="#d9423a" fruit={["#e8a020", "#d84030", "#8ab83a", "#e06a20"]} />
          <Stall p={[-1.5, 0, 3.0]} awn="#2f8a6a" fruit={["#f0c030", "#e9e0c0", "#9ac83a", "#d84030"]} />
          <Stall p={[4, 0, 2.9]} awn="#e0a02a" fruit={["#c83a5a", "#e87a30", "#b0c83a", "#7a3a8a"]} />
          <Stall p={[9, 0, 3.0]} awn="#3a6ab0" fruit={["#e8d070", "#d85030", "#6aa83a", "#f0f0e0"]} />
          <Stall p={[-4, 0, -0.9]} awn="#b84a8a" fruit={["#e8a020", "#f0c030", "#d84030", "#8ab83a"]} />
          <Stall p={[6.5, 0, -0.9]} awn="#d9823a" fruit={["#d84030", "#c8a030", "#a0c83a", "#e0e0d0"]} />
        </>
      )}
      {rain && <Rain />}
      {q !== "low" && !rain && <Walker a={[-20, 0, 2.2]} b={[20, 0, 2.2]} speed={1.0} t0={3} color="#9a5a3a" />}
      {!rain && <Walker a={[20, 0, 0.2]} b={[-20, 0, 0.2]} speed={1.2} t0={9} color="#3a6a8a" />}
      {rain && <Walker a={[-20, 0, 2.6]} b={[20, 0, 2.6]} speed={1.1} t0={7} color="#8a4a4a" umb="#2a4a6a" />}
      {v === "hosp" && (
        <>
          <Walker a={[-14, 0, 1.6]} b={[14, 0, 1.6]} speed={0.55} t0={6} color="#d9a04a" skin="#b98a6a" />
          <Walker a={[-14.6, 0, 1.6]} b={[13.4, 0, 1.6]} speed={0.55} t0={6} color="#4a6aa0" skin="#c49470" />
        </>
      )}
    </group>
  );
}

// ======================================================= BEACH
export function Beach({ v }: { v?: string }) {
  const sand = useMemo(() => T.sand([30, 14]), []);
  const L = useLight();
  const night = L.stars > 0.6;
  const rocks = useMemo<InstItem[]>(() => Array.from({ length: 16 }, (_, i) => ({ p: [14 + (i % 5) * 1.3 + Math.sin(i) * 0.6, 0.2 + (i % 3) * 0.1, -9 + Math.floor(i / 5) * 1.2], s: [1.2 + (i % 3) * 0.5, 0.8 + (i % 4) * 0.2, 1 + (i % 2) * 0.5], r: [0.3 * i, i, 0], c: "#5c5a58" })), []);
  const grass = useMemo<InstItem[]>(() => Array.from({ length: 160 }, (_, i) => ({ p: [-30 + (i * 37.3) % 60, 0.25, 11 + ((i * 13.7) % 5)], s: [0.06, 0.6 + (i % 5) * 0.12, 0.06], r: [0.2 * Math.sin(i), 0, 0.3 * Math.cos(i)], c: "#8a9a4a" })), []);
  const foam = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    const k = (Math.sin(clock.time * 0.55) + 1) / 2;
    foam.current.position.z = -13.2 + k * 1.3;
    (foam.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - k * 0.6);
  });
  return (
    <group>
      <Sea y={-0.12} z={-250} />
      <mesh position={[0, -0.02, 14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 56, 1, 1]} />
        <meshStandardMaterial map={sand} roughness={1} />
      </mesh>
      <mesh position={[0, -0.01, -9.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 8]} />
        <meshStandardMaterial color="#b09f7c" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh ref={foam} position={[0, 0.0, -13]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 0.5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* driftwood log seat */}
      <Cy p={[0, 0.24, -1.6]} rt={0.24} rb={0.28} h={4.2} r={[0, 0, Math.PI / 2]} c="#8a7a6a" rough={1} />
      <Cy p={[-1.9, 0.3, -1.6]} rt={0.1} rb={0.2} h={0.5} c="#7a6a5a" rough={1} />
      {v === "photos" && (
        <>
          <mesh position={[0.55, 0.5, -1.45]} rotation={[-1.2, 0.2, 0]}><planeGeometry args={[0.22, 0.17]} /><meshStandardMaterial map={T.photo("laugh")} /></mesh>
          <mesh position={[0.85, 0.5, -1.5]} rotation={[-1.2, -0.15, 0]}><planeGeometry args={[0.22, 0.17]} /><meshStandardMaterial map={T.photo("light")} /></mesh>
        </>
      )}
      <Inst geo="sphere" items={rocks} c="#5c5a58" />
      <Inst geo="box" items={grass} c="#8a9a4a" cast={false} />
      {[-24, -12, 18, 26, 35].map((x, i) => <Palm key={x} p={[x, 0, 15 + (i % 2) * 2]} h={7 + (i % 3)} lean={0.25} seed={i + 2} />)}
      {/* fishing boat */}
      <group position={[-9, 0.3, -8]} rotation={[0.05, 0.4, 0.1]}>
        <Sp s={[3.4, 0.6, 1.1]} c="#2f5aa0" rough={0.5} />
        <B p={[0, 0.35, 0]} s={[5.2, 0.12, 0.9]} c="#e6dccb" />
        <Cy p={[0.4, 1.1, 0]} rt={0.05} rb={0.05} h={2.2} c="#6a4a2a" />
      </group>
      {/* distant headland lighthouse */}
      <group position={[-70, 0, -120]}>
        <Sp p={[0, 1, 0]} s={[28, 9, 20]} c="#3c4636" rough={1} />
        <Cy p={[0, 14, 0]} rt={1.3} rb={2.2} h={14} c="#f1efe8" />
        <Cy p={[0, 21.6, 0]} rt={1.5} rb={1.5} h={1.3} c="#ffdf9a" em="#ffcf80" ei={night ? 4 : 1.2} />
        <Cy p={[0, 23.0, 0]} rt={0.1} rb={1.9} h={1.6} c="#8a2a24" />
      </group>
      {night && (
        <>
          {[-3.5, 3.2, 5.4].map((x, i) => (
            <group key={x} position={[x, 0, -0.5 + i * 0.8]}>
              <Cy p={[0, 0.12, 0]} rt={0.09} rb={0.09} h={0.24} c="#fff0c8" em="#ffcf80" ei={2.5} />
              <pointLight position={[0, 0.3, 0]} color="#ffbf70" intensity={1.8} distance={5} />
            </group>
          ))}
        </>
      )}
    </group>
  );
}

// ======================================================= LIGHTHOUSE
export function Lighthouse({ v = "day" }: { v?: string }) {
  const L = useLight();
  const grass = useMemo(() => T.grass([10, 10]), []);
  const night = L.stars > 0.4 || L.sun.i < 1.5;
  const beam = useRef<THREE.Group>(null!);
  useFrame(() => { beam.current.rotation.y = clock.time * 0.6; });
  const stripes = [0, 1, 2, 3, 4, 5];
  const posts = useMemo<InstItem[]>(() => Array.from({ length: 22 }, (_, i) => {
    const a = Math.PI * (0.12 + (i / 21) * 0.76);
    return { p: [Math.cos(a) * 9.5, 0.55, -Math.sin(a) * 9.5] as V3, s: [0.07, 1.1, 0.07] as V3 };
  }), []);
  const flowers = useMemo<InstItem[]>(() => Array.from({ length: 90 }, (_, i) => {
    const a = i * 2.39;
    const r = 2 + ((i * 7.1) % 6.5);
    return { p: [Math.cos(a) * r - 1, 0.22, Math.sin(a) * r - 1] as V3, s: [0.06, 0.05, 0.06] as V3, c: ["#f6e9ef", "#f2c9d9", "#f6d65a", "#ffffff"][i % 4] };
  }), []);
  const bulbs = useMemo<InstItem[]>(() => {
    const a: InstItem[] = [];
    for (let k = 0; k < 3; k++)
      for (let i = 0; i < 24; i++) {
        const t = i / 23;
        a.push({ p: [-5.5 + t * 11, 3.1 - Math.sin(t * Math.PI) * 0.55 + k * 0.0, -6.5 + k * 0.0 + k * 3 * 0] as V3, s: [0.1, 0.1, 0.1] });
      }
    return a;
  }, []);
  const photos = ["sunrise", "rain", "light", "child", "couple", "laugh", "street"];
  return (
    <group>
      <Sea y={-28} z={-250} size={[1500, 500]} />
      {/* cliff top */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 48]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>
      <Cy p={[0, -8, 0]} rt={15} rb={22} h={16.2} c="#6a5f52" rough={1} seg={32} />
      <Cy p={[0, -0.15, 0]} rt={15.1} rb={15.1} h={0.2} c="#4f6a37" rough={1} seg={32} />
      {/* path */}
      {Array.from({ length: 10 }).map((_, i) => <Cy key={i} p={[4.6 - i * 0.55, 0.0, -3.4 + i * 0.28]} rt={0.35} rb={0.35} h={0.05} c="#a9a398" seg={8} rough={1} />)}
      {/* tower */}
      <group position={[7, 0, -4.5]}>
        <Cy p={[0, 0.3, 0]} rt={2.6} rb={2.8} h={0.6} c="#8a8a86" />
        {stripes.map((i) => <Cy key={i} p={[0, 0.6 + i * 1.9 + 0.95, 0]} rt={2.0 - (i + 1) * 0.12} rb={2.0 - i * 0.12} h={1.9} c={i % 2 === 0 ? "#f1efe8" : "#b3352e"} rough={0.7} seg={28} />)}
        <Cy p={[0, 12.2, 0]} rt={2.0} rb={1.35} h={0.4} c="#2b2d33" seg={28} />
        <Cy p={[0, 12.55, 0]} rt={1.95} rb={1.95} h={0.08} c="#2b2d33" seg={28} />
        <Cy p={[0, 13.0, 0]} rt={1.1} rb={1.1} h={0.9} c="#ffdc92" em="#ffc66a" ei={night ? 5 : 1.4} seg={20} op={0.9} />
        <Cy p={[0, 13.8, 0]} rt={0.05} rb={1.35} h={0.9} c="#8a2a24" seg={20} />
        <B p={[-1.95, 1.0, 0.2]} s={[0.2, 1.9, 1.0]} c="#4a3426" />
        <group position={[0, 13, 0]} ref={beam}>
          <mesh position={[14, 0, 0]} rotation={[0, 0, -Math.PI / 2]} visible={night}>
            <coneGeometry args={[2.2, 28, 14, 1, true]} />
            <meshBasicMaterial color="#ffe0a0" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
      {/* railing + flowers + bench */}
      <Inst geo="box" items={posts} c="#d8d4c8" />
      <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[9.5, 0.025, 6, 40, Math.PI * 0.76]} />
        <meshStandardMaterial color="#d8d4c8" roughness={0.6} />
      </mesh>
      <Inst geo="sphere" items={flowers} c="#fff" cast={false} />
      <group position={[-1.3, 0, -5.2]}>
        {[0, 0.12, 0.24].map((dz) => <B key={dz} p={[0, 0.46, dz - 0.12]} s={[1.7, 0.05, 0.1]} c="#8a5f3a" />)}
        <B p={[0, 0.75, 0.2]} s={[1.7, 0.4, 0.05]} c="#8a5f3a" />
        {[-0.75, 0.75].map((x) => <B key={x} p={[x, 0.22, 0]} s={[0.07, 0.44, 0.5]} c="#2a2d33" />)}
      </group>
      {v === "proposal" && (
        <>
          <Inst geo="sphere" items={bulbs} c="#fff0c0" em="#ffd890" ei={3} cast={false} />
          {[-5.5, 5.5].map((x) => <Cy key={x} p={[x, 1.6, -6.5]} rt={0.04} rb={0.05} h={3.2} c="#4a3a2a" seg={6} />)}
          {photos.map((k, i) => <Pl key={i} p={[-4.2 + i * 1.4, 2.35 - Math.sin((i / 6) * Math.PI) * 0.4, -6.45]} s={[0.55, 0.42, 1]} r={[0, 0, (i % 2 ? 1 : -1) * 0.06]} tex={T.photo(k)} />)}
          <pointLight position={[0, 2.6, -5.5]} color="#ffd29a" intensity={14} distance={9} />
          {Array.from({ length: 14 }).map((_, i) => (
            <group key={i} position={[Math.cos(i * 0.45 + 3.6) * 2.4, 0, Math.sin(i * 0.45 + 3.6) * 2.4 - 2.6]}>
              <Cy p={[0, 0.1, 0]} rt={0.06} rb={0.06} h={0.2} c="#f6e8c8" em="#ffc070" ei={2.5} seg={8} />
              <pointLight position={[0, 0.3, 0]} color="#ffb060" intensity={0.5} distance={2} />
            </group>
          ))}
          <B p={[0, 0.4, -4.4]} s={[0.7, 0.8, 0.7]} c="#6a4a30" />
          {[0, 1, 2, 3, 4].map((i) => <Sp key={i} p={[-0.2 + i * 0.1, 0.95 + (i % 2) * 0.07, -4.4]} rad={0.08} c={["#f6e0e6", "#f06a8a", "#fff3c0", "#ffffff", "#e0507a"][i]} />)}
        </>
      )}
    </group>
  );
}
