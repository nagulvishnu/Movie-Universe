import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stage, flag, str } from "../movie/stage";
import { B, FlickerLight, GlowLight, Mobile, Rain, Spot, TextScreen, WindowRain, windowsTexture } from "./kit";

const SPEED = 16;

function Streetlight({ side, z }: { side: number; z: number }) {
  return (
    <group position={[side * 6.2, 0, z]}>
      <B shape="cyl" p={[0, 3.4, 0]} s={[0.07, 7.2, 0.07]} c="#1c2026" />
      <B p={[-side * 0.9, 7.0, 0]} s={[1.8, 0.07, 0.07]} c="#1c2026" />
      <B p={[-side * 1.7, 6.93, 0]} s={[0.7, 0.1, 0.28]} c="#fff0cc" em="#ffcf80" ei={5} />
      <mesh position={[-side * 1.2, -0.375, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 10]} />
        <meshBasicMaterial color="#ff9a40" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Oncoming({ phase, lane }: { phase: number; lane: number }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    const z = -150 + ((stage.t * (SPEED + 14) + phase) % 190);
    g.current.position.z = z;
    g.current.visible = true;
  });
  return (
    <group ref={g} position={[lane, 0, 0]}>
      <B p={[0, 0.05, 0]} s={[1.8, 0.8, 4.2]} c="#10131a" />
      {[-0.65, 0.65].map((x) => (
        <B key={x} shape="sphere" p={[x, 0.2, 2.1]} s={[0.17, 0.12, 0.1]} c="#fff" em="#fff7d6" ei={4} />
      ))}
      <mesh position={[0, 0.2, 2.4]}>
        <planeGeometry args={[3.4, 0.8]} />
        <meshBasicMaterial color="#ffe9b0" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Glass({ p, s, r }: { p: [number, number, number]; s: [number, number]; r?: [number, number, number] }) {
  return (
    <mesh position={p} rotation={r}>
      <planeGeometry args={s} />
      <meshStandardMaterial color="#0d1620" transparent opacity={0.12} roughness={0.5} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export function Car() {
  const wipe = useRef<THREE.Group>(null!);
  const wipe2 = useRef<THREE.Group>(null!);
  const wheels = useRef<THREE.Group[]>([]);
  const mirrorLights = useRef<THREE.Mesh[]>([]);
  const wmat = useMemo(() => windowsTexture(), []);
  void wmat;
  useFrame(() => {
    const t = stage.t;
    const sw = 0.12 + (0.5 + 0.5 * Math.sin(t * 2.6)) * 1.05;
    if (wipe.current) wipe.current.rotation.z = sw;
    if (wipe2.current) wipe2.current.rotation.z = sw;
    wheels.current.forEach((w) => w && (w.rotation.x = -t * SPEED * 3));
    mirrorLights.current.forEach((m, i) => m && (m.position.x = -0.1 + ((t * 0.18 + i * 0.45) % 1) * 0.2 - 0.0));
  });
  return (
    <group>
      {/* body shell */}
      <B p={[0, 0.1, 0.1]} s={[1.9, 0.45, 4.3]} c="#171d29" rough={0.25} metal={0.7} shadow />
      <B p={[0, 0.3, -1.65]} s={[1.84, 0.12, 1.2]} c="#171d29" rough={0.25} metal={0.7} />
      <B p={[0, 0.9, 0.85]} s={[1.74, 0.05, 1.95]} c="#141a25" rough={0.3} metal={0.6} />
      <B p={[0, 0.75, 1.9]} s={[1.84, 0.3, 0.9]} c="#171d29" rough={0.25} metal={0.7} />
      {/* roof + pillars */}
      <B p={[0, 1.38, 0.78]} s={[1.74, 0.06, 1.7]} c="#141a25" rough={0.3} metal={0.6} />
      {[-0.87, 0.87].map((x) => [-0.04, 1.55].map((z) => <B key={`${x}${z}`} p={[x, 0.95, z]} s={[0.06, 0.8, 0.07]} c="#141a25" />))}
      {/* glass */}
      <Glass p={[0, 0.98, -0.44]} s={[1.7, 1.06]} r={[0.8, 0, 0]} />
      <Glass p={[-0.87, 0.98, 0.75]} s={[1.55, 0.7]} r={[0, Math.PI / 2, 0]} />
      <Glass p={[0.87, 0.98, 0.75]} s={[1.55, 0.7]} r={[0, Math.PI / 2, 0]} />
      <Glass p={[0, 1.0, 1.58]} s={[1.6, 0.7]} r={[-0.5, 0, 0]} />
      {/* interior */}
      <B p={[0, 0.52, -0.58]} s={[1.7, 0.22, 0.45]} c="#0e1015" rough={0.6} />
      <B p={[-0.4, 0.42, 0.2]} s={[0.52, 0.12, 0.55]} c="#1d1b1a" rough={0.9} shadow />
      <B p={[-0.4, 0.78, 0.5]} s={[0.52, 0.72, 0.1]} c="#1d1b1a" rough={0.9} r={[-0.12, 0, 0]} shadow />
      <B p={[0.4, 0.42, 0.2]} s={[0.52, 0.12, 0.55]} c="#1d1b1a" rough={0.9} />
      <B p={[0.4, 0.78, 0.5]} s={[0.52, 0.72, 0.1]} c="#1d1b1a" rough={0.9} r={[-0.12, 0, 0]} />
      <B p={[0, 0.42, 1.05]} s={[1.5, 0.12, 0.6]} c="#191716" rough={0.9} />
      <B p={[0, 0.85, 1.35]} s={[1.5, 0.8, 0.1]} c="#191716" rough={0.9} />
      <B p={[0, -0.04, 0.5]} s={[1.6, 0.04, 2.6]} c="#0c0c0e" rough={1} />
      <mesh position={[-0.4, 0.84, -0.32]} rotation={[-0.52, 0, 0]}>
        <torusGeometry args={[0.17, 0.016, 8, 24]} />
        <meshStandardMaterial color="#0b0b0d" roughness={0.5} />
      </mesh>
      <B shape="cyl" p={[-0.4, 0.74, -0.42]} s={[0.03, 0.3, 0.03]} c="#0b0b0d" r={[1.0, 0, 0]} />
      {/* dash lights */}
      <B p={[-0.4, 0.68, -0.52]} s={[0.22, 0.05, 0.01]} c="#68ffd8" em="#40ffcc" ei={2.5} r={[-0.5, 0, 0]} />
      <TextScreen get={() => (flag("radio") ? str("radioText", "FM 98.1") : "")} w={0.2} h={0.07} p={[0.05, 0.64, -0.355]} r={[-0.5, 0, 0]} color="#56ffb4" bg="#03120b" size={0.5} flick />
      <Mobile p={[0.38, 0.625, -0.46]} r={[0.7, 0.2, 0]} />
      {/* rear-view mirror */}
      <B p={[0, 1.24, -0.3]} s={[0.3, 0.075, 0.02]} c="#0d0d10" />
      <mesh position={[0, 1.24, -0.288]}>
        <planeGeometry args={[0.27, 0.055]} />
        <meshBasicMaterial color="#1a2433" />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} ref={(m) => { if (m) mirrorLights.current[i] = m; }} position={[0, 1.24, -0.286]}>
          <planeGeometry args={[0.02, 0.03]} />
          <meshBasicMaterial color="#fff2d0" toneMapped={false} />
        </mesh>
      ))}
      {/* wipers */}
      {[-0.1, -0.75].map((x, i) => (
        <group key={x} position={[x, 0.63, -0.75]} rotation={[0.8, 0, 0]}>
          <group ref={i ? wipe2 : wipe}>
            <B p={[0.3, 0, 0.01]} s={[0.62, 0.014, 0.01]} c="#050505" />
          </group>
        </group>
      ))}
      {/* wheels */}
      {[
        [-0.92, -1.4],
        [0.92, -1.4],
        [-0.92, 1.8],
        [0.92, 1.8],
      ].map(([x, z], i) => (
        <group key={i} position={[x, -0.06, z]}>
          <group ref={(g) => { if (g) wheels.current[i] = g; }}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.34, 0.34, 0.24, 16]} />
              <meshStandardMaterial color="#09090a" roughness={0.9} />
            </mesh>
            <mesh position={[Math.sign(x) * 0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.03, 8]} />
              <meshStandardMaterial color="#8a8f98" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        </group>
      ))}
      {/* head & tail lights */}
      {[-0.68, 0.68].map((x) => (
        <group key={x}>
          <B shape="sphere" p={[x, 0.32, -2.25]} s={[0.16, 0.09, 0.08]} c="#fff" em="#fff6d0" ei={8} />
          <B p={[x, 0.35, 2.3]} s={[0.4, 0.08, 0.04]} c="#a00" em="#ff1010" ei={3.5} />
        </group>
      ))}
      <Spot p={[0, 0.35, -2.3]} to={[0, -0.3, -18]} angle={0.45} penumbra={0.7} intensity={40} dist={36} color="#fff2d8" />
      <GlowLight p={[0.38, 0.8, -0.35]} color="#8ab4ff" i={1.2} dist={2.4} when={() => stage.ring === "mobile" || flag("phoneOn")} />
      <GlowLight p={[0, 0.7, -0.3]} color="#6fd8c0" i={0.2} dist={2} when={() => true} />
      <GlowLight p={[0.05, 0.8, -0.2]} color="#7aff9f" i={0.7} dist={1.6} when={() => flag("radio")} />
    </group>
  );
}

export function RoadEnv() {
  const world = useRef<THREE.Group>(null!);
  const lamps = useRef<THREE.Group>(null!);
  const dashes = useRef<THREE.Group>(null!);
  const blds = useRef<THREE.Group>(null!);
  const passL = useRef<THREE.PointLight>(null!);
  const passR = useRef<THREE.PointLight>(null!);
  const tex = useMemo(() => {
    const t = windowsTexture().clone();
    t.repeat.set(2, 3);
    t.needsUpdate = true;
    return t;
  }, []);
  const buildings = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        side: i % 2 ? 1 : -1,
        z: -150 + Math.floor(i / 2) * 20 + (i % 2) * 7,
        h: 12 + ((i * 37) % 23),
        w: 8 + ((i * 13) % 6),
        x: 14 + ((i * 7) % 5),
      })),
    [],
  );
  useFrame(() => {
    const off = stage.t * SPEED;
    lamps.current.position.z = off % 18;
    dashes.current.position.z = off % 6;
    blds.current.position.z = off % 160;
    passL.current.position.z = ((off + 9) % 18) - 9;
    passR.current.position.z = (off % 18) - 9;
  });
  return (
    <group>
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={["#0a0f1a", 8, 95]} />
      <ambientLight intensity={0.35} color="#4a5f88" />
      <hemisphereLight args={["#2a3a5c", "#0a0a10", 0.3]} />
      <pointLight ref={passL} position={[-5.2, 5.5, 0]} color="#ffb060" intensity={45} distance={20} decay={2} />
      <pointLight ref={passR} position={[5.2, 5.5, 0]} color="#ffb060" intensity={30} distance={18} decay={2} />
      <FlickerLight p={[0, 8, 0]} color="#8aa8ff" base={0} thunder={900} dist={60} decay={1.2} />
      <Car />
      <group ref={world}>
        {/* road + sidewalks */}
        <mesh position={[0, -0.38, -40]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 260]} />
          <meshStandardMaterial color="#12151b" roughness={0.18} metalness={0.55} />
        </mesh>
        <mesh position={[0, -0.3, -40]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 260]} />
          <meshStandardMaterial color="#0c0e12" roughness={0.5} />
        </mesh>
        <group ref={dashes}>
          {Array.from({ length: 44 }).map((_, i) => (
            <B key={i} p={[1.6, -0.37, -240 + i * 6]} s={[0.14, 0.01, 2.6]} c="#d8d8c0" em="#aaa890" ei={0.4} />
          ))}
        </group>
        <group ref={lamps}>
          {Array.from({ length: 10 }).map((_, i) => (
            <group key={i}>
              <Streetlight side={-1} z={-126 + i * 18} />
              <Streetlight side={1} z={-117 + i * 18} />
            </group>
          ))}
        </group>
        <group ref={blds}>
          {buildings.map((b, i) => (
            <mesh key={i} position={[b.side * b.x, b.h / 2 - 0.3, b.z]}>
              <boxGeometry args={[b.w, b.h, 12]} />
              <meshStandardMaterial color="#0e1118" roughness={0.9} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.55} />
            </mesh>
          ))}
        </group>
        <Oncoming phase={0} lane={3.4} />
        <Oncoming phase={90} lane={3.4} />
      </group>
      <Rain center={[0, -0.4, -4]} area={[30, 14, 40]} />
      <WindowRain w={1.7} h={1.05} p={[0, 0.98, -0.43]} r={[0.8, 0, 0]} count={220} px={36} />
      <WindowRain w={1.5} h={0.7} p={[-0.865, 0.98, 0.75]} r={[0, -Math.PI / 2, 0]} count={90} px={30} />
    </group>
  );
}
