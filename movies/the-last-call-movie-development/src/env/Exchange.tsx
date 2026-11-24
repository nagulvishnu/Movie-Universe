import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flag, num, stage, str } from "../movie/stage";
import { B, Cable, Dust, FlickerLight, GlowLight, OldPhone, Photo, Rain, Room, Spot, TextScreen, WindowRain } from "./kit";
import type { Vec3 } from "../movie/types";

const tex = new Map<string, THREE.CanvasTexture>();

function jackTexture() {
  let t = tex.get("jacks");
  if (t) return t;
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 128;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#26282a";
  c.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 16; x++) {
      c.fillStyle = "#050505";
      c.beginPath();
      c.arc(10 + x * 15.5, 12 + y * 14.5, 4, 0, 7);
      c.fill();
      if (Math.random() > 0.9) {
        c.fillStyle = Math.random() > 0.5 ? "#a86a20" : "#7a1a1a";
        c.fillRect(6 + x * 15.5, 20 + y * 14.5, 8, 2);
      }
    }
  t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  tex.set("jacks", t);
  return t;
}

/** Old CRT-style monitor showing canvas text. */
export function Monitor({ p, r = [0, 0, 0], get, color = "#78ffb4", bg = "#021008", w = 0.42, h = 0.3, size = 0.14, broken = false, scale = 1 }: { p: Vec3; r?: Vec3; get: () => string; color?: string; bg?: string; w?: number; h?: number; size?: number; broken?: boolean; scale?: number }) {
  return (
    <group position={p} rotation={r} scale={scale}>
      <B p={[0, 0, -0.1]} s={[w + 0.08, h + 0.08, 0.3]} c="#b8b09a" rough={0.7} shadow />
      <B p={[0, -h / 2 - 0.07, 0]} s={[0.3, 0.06, 0.25]} c="#a8a08a" />
      <TextScreen get={get} w={w} h={h} p={[0, 0, 0.052]} color={color} bg={bg} size={size} flick />
      {broken && <B p={[0.08, 0.04, 0.06]} s={[0.15, 0.01, 0.002]} c="#fff" em="#fff" ei={1} r={[0, 0, 0.6]} />}
    </group>
  );
}

function Switchboard({ p, r = [0, 0, 0] }: { p: Vec3; r?: Vec3 }) {
  const jt = useMemo(() => jackTexture(), []);
  return (
    <group position={p} rotation={r}>
      <B p={[0, 0.74, 0]} s={[1.6, 0.05, 0.8]} c="#3a2c20" rough={0.6} shadow />
      <B p={[0, 0.37, 0.05]} s={[1.5, 0.74, 0.7]} c="#2a2a2a" />
      <B p={[0, 1.2, -0.3]} s={[1.6, 0.9, 0.14]} c="#2e302f" rough={0.6} r={[-0.18, 0, 0]} shadow />
      <mesh position={[0, 1.2, -0.225]} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={[1.5, 0.78]} />
        <meshStandardMaterial map={jt} roughness={0.7} />
      </mesh>
      <B p={[0, 0.78, 0.05]} s={[1.2, 0.012, 0.1]} c="#18181a" />
    </group>
  );
}

/* ============================================================ EXCHANGE — EXTERIOR */
export function ExchangeExtEnv() {
  const l1 = useRef<THREE.PointLight>(null!);
  const l2 = useRef<THREE.PointLight>(null!);
  const boards = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({ x: -5.2 + (i % 4) * 3.47, y: i < 4 ? 2.4 : 5.6 })), []);
  useFrame(() => {
    const on = flag("sirens");
    const ph = Math.sin(stage.t * 9) > 0;
    l1.current.intensity = on ? (ph ? 160 : 5) : 0;
    l2.current.intensity = on ? (ph ? 5 : 160) : 0;
  });
  return (
    <group>
      <color attach="background" args={["#05070b"]} />
      <fog attach="fog" args={["#0b1018", 6, 48]} />
      <ambientLight intensity={0.3} color="#41567a" />
      <directionalLight position={[-6, 14, 10]} intensity={0.5} color="#6d86b8" />
      <FlickerLight p={[3.8, 5.2, 3]} color="#ffbf70" base={80} flicker={0.9} speed={6} dist={20} />
      <FlickerLight p={[0, 12, 6]} color="#8aa8ff" base={0} thunder={500} dist={60} decay={1.2} />
      <pointLight ref={l1} position={[7, 2, 7]} color="#ff2020" intensity={0} distance={28} decay={2} />
      <pointLight ref={l2} position={[4.5, 2, 8]} color="#2050ff" intensity={0} distance={28} decay={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 15]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#101319" roughness={0.16} metalness={0.5} />
      </mesh>
      {/* building */}
      <B p={[0, 4.6, -4]} s={[16, 9.2, 8]} c="#3a2e29" rough={0.95} shadow />
      <B p={[0, 9.4, -4]} s={[16.4, 0.5, 8.4]} c="#26211f" />
      {boards.map((b, i) => (
        <group key={i} position={[b.x, b.y, 0.03]}>
          <B s={[1.5, 1.8, 0.1]} c="#0a0a0c" />
          {[-0.6, -0.2, 0.2, 0.6].map((y, k) => (
            <B key={k} p={[0, y, 0.06]} s={[1.6, 0.34, 0.04]} c="#5b4630" r={[0, 0, (k - 1.5) * 0.05]} rough={1} />
          ))}
        </group>
      ))}
      <B p={[0, 5.0, 0.05]} s={[7, 0.9, 0.1]} c="#1e1d1b" />
      <TextScreen get={() => "HARLOW TELEPHONE EXCHANGE"} w={6.6} h={0.7} p={[0, 5.0, 0.12]} size={0.42} color="#7f6f52" bg="#1e1d1b" bright={0.85} />
      {/* door */}
      <B p={[0, 1.15, 0.04]} s={[2.0, 2.4, 0.12]} c="#141414" />
      <B p={[-0.46, 1.1, 0.12]} s={[0.9, 2.1, 0.06]} c="#2c2f2c" metal={0.5} rough={0.6} />
      <B p={[0.46, 1.1, 0.12]} s={[0.9, 2.1, 0.06]} c="#2c2f2c" metal={0.5} rough={0.6} />
      <B p={[0, 1.1, 0.18]} s={[1.1, 0.07, 0.04]} c="#555" metal={0.9} rough={0.3} />
      <B p={[0, 1.0, 0.2]} s={[0.12, 0.16, 0.06]} c="#b9a24a" metal={0.9} rough={0.3} />
      {flag("tape") &&
        [0.9, 1.35, 1.8].map((y, i) => (
          <B key={i} p={[0, y, 0.55]} s={[3.4, 0.09, 0.01]} c="#f2c500" em="#e0b000" ei={0.6} r={[0, 0, (i - 1) * 0.04]} />
        ))}
      {/* pole + cables */}
      <B shape="cyl" p={[-7.5, 5, 4]} s={[0.14, 10, 0.14]} c="#2a2018" />
      <B p={[-7.5, 9.4, 4]} s={[0.1, 0.1, 2.2]} c="#2a2018" />
      {[-0.7, 0, 0.7].map((dz, i) => (
        <Cable key={i} pts={[[-7.5, 9.4, 4 + dz], [-4, 8.6 - i * 0.1, 2], [-1.5, 8.2, 0.6], [0, 8.0, 0.1]]} r={0.025} />
      ))}
      <B shape="cyl" p={[3.8, 2.6, 3]} s={[0.07, 5.2, 0.07]} c="#1c2026" />
      <B p={[3.8, 5.25, 3]} s={[0.5, 0.1, 0.3]} c="#fff0cc" em="#ffcf80" ei={5} />
      {/* parked police cars (lights only matter when sirens) */}
      {flag("cars") &&
        [
          [7, 7.2, 0.3],
          [4.6, 8.2, -0.2],
        ].map(([x, z, ry], i) => (
          <group key={i} position={[x, 0, z]} rotation={[0, ry, 0]}>
            <B p={[0, 0.5, 0]} s={[1.9, 0.7, 4.3]} c="#e8e8ea" rough={0.3} />
            <B p={[0, 1.05, -0.2]} s={[1.7, 0.5, 2.2]} c="#14161a" rough={0.2} />
            <B p={[-0.4, 1.38, -0.2]} s={[0.4, 0.1, 0.2]} c="#f00" em="#ff2020" ei={4} />
            <B p={[0.4, 1.38, -0.2]} s={[0.4, 0.1, 0.2]} c="#00f" em="#2060ff" ei={4} />
          </group>
        ))}
      <Rain center={[0, 0, 8]} area={[34, 16, 34]} count={1900} />
      <Dust box={[18, 3, 14]} p={[0, 0, 6]} count={60} a={0.18} color="#b8c8e0" />
    </group>
  );
}

/* ============================================================ EXCHANGE — INTERIOR */
export function ExchangeIntEnv() {
  const reelA = useRef<THREE.Mesh>(null!);
  const reelB = useRef<THREE.Mesh>(null!);
  const door = useRef<THREE.Group>(null!);
  const red = useRef<THREE.PointLight>(null!);
  const red2 = useRef<THREE.PointLight>(null!);
  const desks = useMemo(() => {
    const out: { p: Vec3; r: Vec3; i: number }[] = [];
    for (let i = 0; i < 5; i++) {
      out.push({ p: [-3.6, 0, 4.2 - i * 2.2], r: [0, Math.PI / 2, 0], i });
      out.push({ p: [3.6, 0, 4.2 - i * 2.2], r: [0, -Math.PI / 2, 0], i: i + 5 });
    }
    return out;
  }, []);
  useFrame(() => {
    const spin = flag("tape") ? stage.t * 3 : 0;
    reelA.current.rotation.z = spin;
    reelB.current.rotation.z = spin * 1.2;
    door.current.rotation.y = num("doorOpen", 0) * 1.4;
    const p = 0.5 + 0.5 * Math.sin(stage.t * 3);
    red.current.intensity = 14 * p;
    red2.current.intensity = 14 * (1 - p);
  });
  return (
    <group>
      <color attach="background" args={["#030405"]} />
      <fog attach="fog" args={["#0a0d0d", 4, 26]} />
      <ambientLight intensity={0.4} color="#7a8c88" />
      <pointLight ref={red} position={[-5.4, 3.9, -6]} color="#ff2a1a" intensity={10} distance={14} decay={2} />
      <pointLight ref={red2} position={[5.4, 3.9, 2]} color="#ff2a1a" intensity={10} distance={14} decay={2} />
      <FlickerLight p={[0, 4.2, -1]} color="#bfe8d0" base={26} flicker={0.8} speed={5} dist={13} />
      <Spot p={[0.5, 4.4, 1]} to={[0, 0, 0]} color="#a0c0d8" intensity={200} angle={0.35} penumbra={0.9} dist={12} />
      <Room w={12} d={17} h={4.5} floor="#25272a" wall="#4a4f4b" ceil="#33363a" floorRough={0.45} />
      {desks.map((d) => (
        <group key={d.i}>
          <Switchboard p={d.p} r={d.r} />
          <OldPhone name={`ex${d.i}`} p={[d.p[0] + (d.p[0] < 0 ? 0.25 : -0.25), 0.8, d.p[2] + 0.2]} r={[0, d.r[1] + 0.3, 0]} color="#2b2b2a" ring={["many"]} />
          <B p={[d.p[0] + (d.p[0] < 0 ? 0.9 : -0.9), 0.4, d.p[2] + 1.0]} s={[0.5, 0.06, 0.5]} c="#222" />
        </group>
      ))}
      {/* broken monitors */}
      <Monitor p={[-3.2, 1.05, 2.0]} r={[0, Math.PI / 2 - 0.3, 0]} get={() => "NO SIGNAL"} color="#99a" broken />
      <Monitor p={[3.2, 1.05, -0.2]} r={[0, -Math.PI / 2 + 0.2, 0]} get={() => "▒▒▒ ERR ▒▒▒"} color="#f66" bg="#100404" />
      {/* cables from ceiling */}
      {Array.from({ length: 9 }).map((_, i) => (
        <Cable key={i} pts={[[-5 + i * 1.25, 4.5, -7 + (i % 3) * 5], [-4.5 + i * 1.2, 3.3, -6 + (i % 3) * 5], [-3.6 + (i % 2) * 7.2, 1.6, 3 - (i % 5) * 2], [-3.4 + (i % 2) * 6.8, 0.9, 3.4 - (i % 5) * 2]]} r={0.035 + (i % 3) * 0.01} c="#101113" />
      ))}
      <Cable pts={[[-6, 4.2, 7], [-2, 4.0, 3], [2, 4.1, -2], [6, 4.2, -7]]} r={0.07} />
      <Cable pts={[[6, 4.1, 7], [2, 3.9, 2], [-2, 4.0, -3], [-6, 4.1, -7]]} r={0.06} />
      {/* reel-to-reel + tape shelves */}
      <B p={[0, 0.75, -5.6]} s={[1.9, 0.06, 0.9]} c="#3a2c20" shadow />
      <B p={[0, 0.37, -5.6]} s={[1.8, 0.74, 0.8]} c="#222" />
      <B p={[0, 1.0, -5.6]} s={[1.3, 0.45, 0.4]} c="#6a6a64" metal={0.5} rough={0.4} shadow />
      <mesh ref={reelA} position={[-0.3, 1.05, -5.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 10]} />
        <meshStandardMaterial color="#b9b5a4" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh ref={reelB} position={[0.3, 1.05, -5.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 10]} />
        <meshStandardMaterial color="#b9b5a4" metalness={0.7} roughness={0.35} />
      </mesh>
      <Monitor p={[0.9, 1.15, -5.5]} r={[0, -0.4, 0]} get={() => str("monitor")} size={0.11} scale={0.8} />
      <GlowLight p={[0.7, 1.4, -5.0]} color="#78ffb4" i={1.2} dist={3.5} when={() => !!str("monitor")} />
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[-5.7, 0, -4 + i * 1.2]}>
          <B p={[0, 1.1, 0]} s={[0.5, 2.2, 1.0]} c="#2e2f2e" />
          {Array.from({ length: 6 }).map((__, k) => (
            <B key={k} p={[0.27, 0.35 + k * 0.35, 0]} s={[0.04, 0.22, 0.8]} c={["#6a6a58", "#4a4a3e", "#5a4a3a"][k % 3]} />
          ))}
        </group>
      ))}
      {/* employee photos */}
      {[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x, i) => (
        <Photo key={i} kind={i % 2 ? "workers" : "single"} p={[x, 2.1, -8.46]} s={0.55} />
      ))}
      <B p={[0, 2.8, -8.47]} s={[3.4, 0.4, 0.02]} c="#2a2a26" />
      <TextScreen get={() => "OUR PEOPLE — HARLOW EXCHANGE"} w={3.2} h={0.34} p={[0, 2.8, -8.455]} size={0.5} color="#8c7c5c" bg="#2a2a26" bright={0.8} />
      {/* basement door */}
      <B p={[-2.5, 1.2, -8.45]} s={[2.0, 2.5, 0.12]} c="#141416" />
      <group position={[-3.35, 0, -8.35]}>
        <group ref={door}>
          <B p={[0.85, 1.1, 0]} s={[1.7, 2.2, 0.08]} c="#3d4144" metal={0.7} rough={0.5} shadow />
          <TextScreen get={() => "BASEMENT\nAUTHORIZED ONLY"} w={1.1} h={0.35} p={[0.85, 1.6, 0.05]} size={0.28} color="#d8d0b8" bg="#5a1a14" bright={0.9} />
          <B p={[1.5, 1.1, 0.07]} s={[0.1, 0.16, 0.06]} c="#b9a24a" metal={1} rough={0.3} />
        </group>
      </group>
      <B p={[-2.5, 1.1, -8.48]} s={[1.6, 2.1, 0.05]} c="#020202" />
      <Dust box={[12, 4.4, 17]} count={240} a={0.5} color="#cfd8cc" />
    </group>
  );
}

/* ============================================================ VICTOR HALE'S HOUSE */
export function VictorEnv() {
  const hand = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    hand.current.rotation.z = -stage.t * 0.1047;
  });
  return (
    <group>
      <color attach="background" args={["#060504"]} />
      <ambientLight intensity={0.2} color="#6a5a48" />
      <FlickerLight p={[1.6, 1.5, -1.6]} color="#ff9a48" base={4.5} flicker={0.12} speed={3} dist={8} />
      <FlickerLight p={[-1.7, 1.2, 1.2]} color="#ffb870" base={1.6} dist={6} />
      <pointLight position={[0, 1.8, -2.2]} color="#5a7ab8" intensity={1.2} distance={7} decay={2} />
      <Room w={5.4} d={5.4} h={2.7} floor="#3a2a1c" wall="#5e4c3a" ceil="#4a3c2e" floorRough={0.5} skip={["n"]} />
      {/* north wall with window */}
      <B p={[-1.7, 1.35, -2.7]} s={[2.0, 2.7, 0.05]} c="#5e4c3a" />
      <B p={[1.7, 1.35, -2.7]} s={[2.0, 2.7, 0.05]} c="#5e4c3a" />
      <B p={[0, 0.5, -2.7]} s={[1.4, 1.0, 0.05]} c="#5e4c3a" />
      <B p={[0, 2.45, -2.7]} s={[1.4, 0.5, 0.05]} c="#5e4c3a" />
      <B p={[0, 1.7, -3.1]} s={[1.6, 1.0, 0.02]} c="#0e1624" em="#3a5890" ei={0.7} />
      <B p={[0, 1.7, -2.68]} s={[0.04, 1.0, 0.04]} c="#2a1c12" />
      <WindowRain w={1.4} h={1.0} p={[0, 1.7, -2.66]} count={140} px={30} />
      {/* armchair (Victor) */}
      <group position={[1.3, 0, -0.7]} rotation={[0, -Math.PI / 2, 0]}>
        <B p={[0, 0.25, 0]} s={[0.9, 0.5, 0.9]} c="#4a2a22" rough={1} shadow />
        <B p={[0, 0.7, 0.4]} s={[0.9, 0.8, 0.2]} c="#4a2a22" rough={1} shadow />
        <B p={[-0.5, 0.45, 0]} s={[0.15, 0.4, 0.9]} c="#4a2a22" rough={1} />
        <B p={[0.5, 0.45, 0]} s={[0.15, 0.4, 0.9]} c="#4a2a22" rough={1} />
      </group>
      {/* visitor chair + table */}
      <B p={[-0.7, 0.46, -0.3]} s={[0.46, 0.05, 0.46]} c="#6a4a2a" shadow />
      <B p={[-0.93, 0.8, -0.3]} s={[0.05, 0.7, 0.46]} c="#6a4a2a" />
      <B p={[0.3, 0.3, -0.7]} s={[0.6, 0.04, 0.6]} c="#5a3c22" shape="cyl" />
      <B p={[0.3, 0.15, -0.7]} s={[0.05, 0.3, 0.05]} c="#3a2412" />
      <B p={[0.3, 0.37, -0.7]} s={[0.07, 0.09, 0.07]} c="#d8d0c0" shape="cyl" />
      {/* shelves with telephone parts */}
      <B p={[-2.5, 1.2, -0.6]} s={[0.4, 2.4, 2.2]} c="#2e2014" />
      {Array.from({ length: 12 }).map((_, i) => (
        <B key={i} p={[-2.28, 0.35 + Math.floor(i / 4) * 0.7 + 0.1, -1.4 + (i % 4) * 0.55]} s={[0.2, 0.2, 0.3]} c={["#222", "#3a2c20", "#555", "#6a4a2a"][i % 4]} />
      ))}
      <OldPhone name="victor1" p={[-2.3, 0.6, -0.2]} r={[0, Math.PI / 2, 0]} color="#2b2b2a" ring={["none"]} />
      <OldPhone name="victor2" p={[-2.3, 1.3, -1.0]} r={[0, Math.PI / 2, 0]} color="#5a1c1c" ring={["none"]} />
      <OldPhone name="victor3" p={[-2.3, 2.0, -0.4]} r={[0, Math.PI / 2, 0]} color="#1c3a2c" ring={["none"]} />
      {/* wall clock + photo */}
      <group position={[2.67, 1.9, 0.9]} rotation={[0, -Math.PI / 2, 0]}>
        <B shape="cyl" s={[0.22, 0.04, 0.22]} c="#d8d0b8" r={[Math.PI / 2, 0, 0]} />
        <mesh ref={hand} position={[0, 0, 0.03]}>
          <boxGeometry args={[0.01, 0.2, 0.01]} />
          <meshBasicMaterial color="#111" />
        </mesh>
      </group>
      <Photo kind="workers" p={[2.66, 1.4, -1.6]} r={[0, -Math.PI / 2, 0]} s={0.5} />
      <B p={[1.9, 0.7, 1.9]} s={[0.5, 1.4, 0.5]} c="#2a1c12" />
      <B p={[1.9, 1.45, 1.9]} s={[0.4, 0.2, 0.3]} c="#3a3a34" metal={0.4} />
      <B p={[0, 0.01, 0.2]} s={[2.6, 0.02, 2.2]} c="#5a2a2a" rough={1} />
      <Dust box={[5, 2.6, 5]} count={110} a={0.4} color="#ffd9a0" />
    </group>
  );
}
