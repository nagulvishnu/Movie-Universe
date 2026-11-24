import { useMemo } from "react";
import { flag } from "../movie/stage";
import { B, Dust, FlickerLight, GlowLight, OldPhone, Photo, Room, Spot, TextScreen } from "./kit";

/* ============================================================ POLICE STATION INVESTIGATION ROOM */
export function PoliceEnv() {
  const pins = useMemo(
    () => [
      ["victims", -1.5, 0.45], ["single", -0.6, 0.5], ["workers", 0.35, 0.45], ["siblings", 1.3, 0.4], ["victims", -1.0, -0.35], ["single", 0.1, -0.35], ["workers", 1.0, -0.4],
    ] as [string, number, number][],
    [],
  );
  return (
    <group>
      <color attach="background" args={["#07090d"]} />
      <ambientLight intensity={0.55} color="#7f96b8" />
      <FlickerLight p={[0, 2.7, 0.5]} color="#d8f0ff" base={26} flicker={0.3} speed={7} dist={12} />
      <FlickerLight p={[-1.5, 2.7, -2.0]} color="#d8f0ff" base={22} dist={10} />
      <FlickerLight p={[1.8, 2.7, -2.4]} color="#e0f0ff" base={18} dist={10} />
      <Spot p={[0.6, 2.9, 0.4]} to={[0.6, 0.7, 0.4]} intensity={flag("interview") ? 60 : 20} angle={0.7} penumbra={0.8} dist={8} color="#ecf5ff" shadow />
      <Room w={7} d={7} h={3} floor="#2f3135" wall="#6d7377" ceil="#8b9094" floorRough={0.35} />
      {/* ceiling panels */}
      <B p={[0, 2.97, 0]} s={[1.6, 0.03, 0.4]} c="#fff" em="#dff2ff" ei={2.5} />
      <B p={[-2.2, 2.97, -1.5]} s={[1.6, 0.03, 0.4]} c="#fff" em="#dff2ff" ei={2.2} />
      {/* evidence board */}
      <group position={[0, 1.75, -3.46]}>
        <B s={[4.4, 1.9, 0.05]} c="#6e5130" rough={1} />
        <B p={[0, 0, 0.03]} s={[4.2, 1.7, 0.01]} c="#8b6a42" rough={1} />
        {pins.map(([k, x, y], i) => (
          <Photo key={i} kind={k} p={[x, y, 0.05]} r={[0, 0, ((i * 37) % 9) / 50 - 0.08]} s={0.62} />
        ))}
        {pins.slice(0, 6).map(([, x, y], i) => {
          const n = pins[i + 1];
          const dx = n[1] - x;
          const dy = n[2] - y;
          return <B key={i} p={[(x + n[1]) / 2, (y + n[2]) / 2, 0.07]} s={[Math.hypot(dx, dy), 0.006, 0.004]} c="#b01818" r={[0, 0, Math.atan2(dy, dx)]} />;
        })}
        {[-1.6, -0.2, 1.7].map((x, i) => (
          <B key={i} p={[x, -0.6, 0.05]} s={[0.5, 0.35, 0.005]} c={["#e8e2cf", "#d8d2bd", "#efe9d8"][i]} r={[0, 0, i * 0.04]} rough={1} />
        ))}
        <B p={[0, 0.75, 0.04]} s={[1.4, 0.18, 0.005]} c="#f0e8d0" rough={1} />
        <TextScreen get={() => "2:17 AM  —  EVERY CASE"} w={1.3} h={0.16} p={[0, 0.75, 0.05]} size={0.5} color="#a01818" bg="#f0e8d0" bright={1} />
      </group>
      {/* interview table */}
      <B p={[0.6, 0.74, 0.4]} s={[1.5, 0.05, 0.85]} c="#4a4540" rough={0.5} shadow />
      {[0.0, 1.2].map((x) => [0.1, 0.7].map((z) => <B key={`${x}${z}`} p={[x, 0.37, z]} s={[0.05, 0.74, 0.05]} c="#222" />))}
      <B p={[0.6, 0.77, 0.4]} s={[0.28, 0.012, 0.2]} c="#e4dec9" r={[0, 0.4, 0]} />
      <B p={[0.2, 0.775, 0.55]} s={[0.12, 0.015, 0.2]} c="#c9c3b0" />
      {[
        [0.6, -0.55],
        [0.6, 1.35],
      ].map(([x, z], i) => (
        <group key={i}>
          <B p={[x, 0.46, z]} s={[0.46, 0.06, 0.46]} c="#2a2c30" shadow />
          <B p={[x, 0.8, z + (i ? 0.22 : -0.22) * -1 * -1]} s={[0.46, 0.6, 0.05]} c="#2a2c30" r={[0, 0, 0]} />
        </group>
      ))}
      {/* desks */}
      {[-1.2, 1.4].map((z, i) => (
        <group key={i}>
          <B p={[-2.5, 0.74, z]} s={[1.5, 0.05, 0.8]} c="#555" rough={0.5} shadow />
          <B p={[-2.5, 0.37, z - 0.2]} s={[1.4, 0.74, 0.3]} c="#333" />
          <B p={[-2.6, 1.02, z - 0.2]} s={[0.5, 0.34, 0.03]} c="#111" metal={0.5} />
          <B p={[-2.6, 1.02, z - 0.18]} s={[0.46, 0.3, 0.005]} c="#243a50" em="#4a8ac0" ei={1.3} />
          <B p={[-2.2, 0.775, z + 0.1]} s={[0.3, 0.02, 0.22]} c="#e4dec9" r={[0, 0.3, 0]} />
        </group>
      ))}
      <B p={[-3.3, 0.9, 0.2]} s={[0.5, 1.8, 0.9]} c="#4a4f55" metal={0.4} />
      {/* window w/ blinds on east wall */}
      <group position={[3.46, 1.8, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <B s={[2.2, 1.3, 0.03]} c="#0e1624" em="#2a4a78" ei={0.9} />
        {Array.from({ length: 13 }).map((_, i) => (
          <B key={i} p={[0, 0.58 - i * 0.095, 0.03]} s={[2.2, 0.035, 0.01]} c="#9a9a96" />
        ))}
      </group>
      <GlowLight p={[3.0, 1.8, 0.4]} color="#4a78c0" i={1.5} dist={6} when={() => true} />
      <Dust box={[7, 3, 7]} count={110} a={0.28} color="#c9d7e8" />
    </group>
  );
}

/* ============================================================ SUNNY PARK (FLASHBACK) */
export function ParkEnv() {
  const trees = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + (i % 3) * 0.2;
        const r = 9 + (i % 4) * 2.2;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r - 2, s: 1 + (i % 3) * 0.3 };
      }),
    [],
  );
  return (
    <group>
      <color attach="background" args={["#f1cd92"]} />
      <fog attach="fog" args={["#f1d4a0", 14, 55]} />
      <hemisphereLight args={["#ffe9c4", "#6a7a3a", 0.9]} />
      <directionalLight position={[-6, 5, 6]} intensity={3.4} color="#ffd29a" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0004} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 32]} />
        <meshStandardMaterial color="#6e8a3e" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.5]}>
        <planeGeometry args={[2.2, 40]} />
        <meshStandardMaterial color="#b6a27a" roughness={1} />
      </mesh>
      {/* bench */}
      <B p={[0, 0.43, 0]} s={[1.7, 0.06, 0.46]} c="#6a4a2a" shadow rough={0.8} />
      <B p={[0, 0.78, -0.22]} s={[1.7, 0.42, 0.05]} c="#6a4a2a" shadow />
      {[-0.75, 0.75].map((x) => (
        <B key={x} p={[x, 0.22, 0]} s={[0.05, 0.44, 0.4]} c="#1a1a1a" />
      ))}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <B shape="cyl" p={[0, 1.5, 0]} s={[0.25, 3, 0.25]} c="#4a3220" shadow />
          <B shape="sphere" p={[0, 3.8, 0]} s={[1.9, 1.7, 1.9]} c={i % 2 ? "#4f7a2a" : "#6a8a2e"} shadow rough={1} />
          <B shape="sphere" p={[0.9, 3.2, 0.3]} s={[1.3, 1.1, 1.3]} c="#5a8230" rough={1} />
        </group>
      ))}
      <Dust box={[10, 4, 10]} p={[0, 0, 0]} count={130} color="#fff0c0" a={0.8} />
    </group>
  );
}

/* ============================================================ LITTLE BOY'S BEDROOM (POST-CREDIT) */
export function BedroomEnv() {
  const stars = useMemo(() => Array.from({ length: 28 }).map(() => [(Math.random() - 0.5) * 3.6, 2.58, (Math.random() - 0.5) * 3.6] as [number, number, number]), []);
  return (
    <group>
      <color attach="background" args={["#030409"]} />
      <ambientLight intensity={0.18} color="#2a3a70" />
      <FlickerLight p={[0.9, 0.75, -1.5]} color="#ffb870" base={3.2} dist={5} />
      <pointLight position={[1.8, 1.6, -0.6]} color="#5a80d8" intensity={3} distance={8} decay={2} castShadow shadow-mapSize={[1024, 1024]} />
      <Room w={4} d={4} h={2.6} floor="#5a4a3a" wall="#3a4668" ceil="#2c3550" />
      {/* bed */}
      <B p={[0, 0.25, -1.0]} s={[1.2, 0.3, 1.9]} c="#6a4a2a" shadow />
      <B p={[0, 0.43, -1.0]} s={[1.14, 0.14, 1.84]} c="#d8d8e0" rough={1} />
      <B p={[0, 0.58, -1.65]} s={[0.5, 0.1, 0.35]} c="#fff" rough={1} />
      <B p={[0, 0.58, -0.45]} s={[1.14, 0.22, 0.85]} c="#4a6aa8" rough={1} shadow />
      <B p={[0, 0.8, -1.98]} s={[1.2, 0.8, 0.06]} c="#6a4a2a" />
      {/* nightstand + bedside phone */}
      <B p={[0.95, 0.25, -1.55]} s={[0.4, 0.5, 0.4]} c="#7a5a3a" />
      <OldPhone name="bedside" p={[0.95, 0.5, -1.55]} r={[0, -Math.PI / 2, 0]} color="#8fb0d4" ring={["old"]} lamp scale={0.95} />
      <B shape="sphere" p={[0.95, 0.72, -1.78]} s={[0.07, 0.07, 0.07]} c="#fff0cc" em="#ffb060" ei={3} />
      <GlowLight p={[0.7, 0.8, -1.3]} color="#ff5030" i={1.2} dist={2} when={() => true} />
      {/* window, moon */}
      <B p={[1.98, 1.5, -0.6]} s={[0.04, 1.0, 1.2]} c="#101a38" em="#3a5aa8" ei={0.8} />
      <B shape="sphere" p={[1.95, 1.7, -0.5]} s={[0.12, 0.12, 0.12]} c="#e8f0ff" em="#e8f0ff" ei={2.5} />
      {/* toys + rug */}
      <B p={[-0.2, 0.01, 0.6]} s={[1.6, 0.02, 1.2]} c="#7a3a3a" rough={1} />
      <B p={[-0.6, 0.12, 0.5]} s={[0.24, 0.24, 0.24]} c="#d8b020" />
      <B p={[-0.3, 0.1, 0.8]} s={[0.2, 0.2, 0.2]} c="#c04030" />
      <B shape="sphere" p={[-1.5, 0.2, -1.5]} s={[0.18, 0.2, 0.15]} c="#8a5a30" />
      <B shape="sphere" p={[-1.5, 0.42, -1.5]} s={[0.12, 0.12, 0.12]} c="#8a5a30" />
      <B p={[-1.7, 1.0, 0.8]} s={[0.4, 2.0, 1.0]} c="#4a5a88" />
      {stars.map((p, i) => (
        <B key={i} shape="sphere" p={p} s={[0.025, 0.025, 0.025]} c="#cfe" em="#bfe8c0" ei={2} />
      ))}
      <Dust box={[4, 2.6, 4]} count={60} a={0.25} color="#a0b8ff" />
    </group>
  );
}
