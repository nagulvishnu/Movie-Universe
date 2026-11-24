import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flag, num, stage, str } from "../movie/stage";
import { B, cityTexture, Dust, FlickerLight, GlowLight, Mobile, OldPhone, Photo, Room, TextScreen, WindowRain } from "./kit";

function Backdrop() {
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const night = useMemo(() => cityTexture("night"), []);
  const day = useMemo(() => cityTexture("day"), []);
  const cur = useRef("");
  useFrame(() => {
    const k = flag("day") ? "day" : "night";
    if (cur.current !== k) {
      cur.current = k;
      mat.current.map = k === "day" ? day : night;
      mat.current.needsUpdate = true;
    }
  });
  return (
    <mesh position={[-0.5, 1.6, -3.4]}>
      <planeGeometry args={[4.4, 2.8]} />
      <meshBasicMaterial ref={mat} map={night} toneMapped={false} />
    </mesh>
  );
}

function Corkboard() {
  const papers: [number, number, number, string][] = [
    [-0.3, 0.2, 0.05, "#e8e2cf"], [0.0, 0.18, -0.03, "#d8d2bd"], [0.28, 0.14, 0.04, "#efe9d8"], [-0.15, -0.12, -0.04, "#cfc9b4"], [0.2, -0.13, 0.02, "#e6dfc9"],
  ];
  return (
    <group position={[-2.47, 1.55, -1.5]} rotation={[0, Math.PI / 2, 0]}>
      <B s={[1.2, 0.8, 0.03]} c="#5a4228" rough={1} />
      {papers.map((q, i) => (
        <B key={i} p={[q[0], q[1], 0.02]} s={[0.2, 0.26, 0.004]} c={q[3]} r={[0, 0, q[2]]} rough={1} />
      ))}
      <Photo kind="victims" p={[0.0, -0.18, 0.025]} s={0.2} />
      {[0, 1, 2].map((i) => (
        <B key={i} p={[-0.1 + i * 0.1, 0.02 - i * 0.05, 0.03]} s={[0.5, 0.003, 0.003]} c="#a01818" r={[0, 0, 0.5 - i * 0.6]} />
      ))}
    </group>
  );
}

export function ApartmentEnv() {
  const door = useRef<THREE.Group>(null!);
  const win = useRef<THREE.PointLight>(null!);
  const amb = useRef<THREE.AmbientLight>(null!);
  useFrame(() => {
    const day = flag("day");
    win.current.color.set(day ? "#ffe3b8" : "#4f78c0");
    win.current.intensity = day ? 5 : 1.6;
    amb.current.intensity = day ? 0.7 : 0.22;
    amb.current.color.set(day ? "#c8d0e0" : "#2a3858");
    door.current.rotation.y = -num("doorOpen", 0) * 1.5;
  });
  return (
    <group>
      <color attach="background" args={["#05060a"]} />
      <ambientLight ref={amb} intensity={0.22} color="#2a3858" />
      <pointLight ref={win} position={[-0.5, 1.7, -2.4]} color="#4f78c0" intensity={1.6} distance={9} decay={2} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
      <FlickerLight p={[-0.75, 1.15, -2.2]} color="#ffbf70" base={2.4} dist={6} />
      <FlickerLight p={[0, 2.4, 0.5]} color="#ffe2b0" base={flag("lightsOn") ? 3 : 0} dist={9} />
      <Room w={5} d={6} h={2.7} floor="#4a3626" wall="#5a544c" ceil="#46423d" floorRough={0.55} skip={["n"]} />
      <B p={[-1.95, 1.35, -3]} s={[1.1, 2.7, 0.05]} c="#5a544c" />
      <B p={[1.45, 1.35, -3]} s={[2.1, 2.7, 0.05]} c="#5a544c" />
      <B p={[-0.5, 0.45, -3]} s={[1.8, 0.9, 0.05]} c="#5a544c" />
      <B p={[-0.5, 2.5, -3]} s={[1.8, 0.4, 0.05]} c="#5a544c" />
      <Backdrop />
      <B p={[-0.5, 0.92, -2.97]} s={[1.85, 0.06, 0.08]} c="#1a1a1c" />
      <B p={[-0.5, 2.28, -2.97]} s={[1.85, 0.06, 0.08]} c="#1a1a1c" />
      <B p={[-1.4, 1.6, -2.97]} s={[0.06, 1.4, 0.08]} c="#1a1a1c" />
      <B p={[0.4, 1.6, -2.97]} s={[0.06, 1.4, 0.08]} c="#1a1a1c" />
      <B p={[-0.5, 1.6, -2.97]} s={[0.04, 1.4, 0.05]} c="#1a1a1c" />
      <WindowRain w={1.75} h={1.35} p={[-0.5, 1.6, -2.93]} count={200} px={34} />
      <mesh position={[-0.5, 1.6, -2.935]}>
        <planeGeometry args={[1.7, 1.3]} />
        <meshStandardMaterial color="#9ab" transparent opacity={0.06} roughness={0.05} />
      </mesh>
      {/* desk */}
      <B p={[-1.2, 0.75, -2.5]} s={[1.7, 0.04, 0.72]} c="#3b2a1d" rough={0.5} shadow />
      {[-1.95, -0.45].map((x) => [-2.8, -2.2].map((z) => <B key={`${x}${z}`} p={[x, 0.37, z]} s={[0.05, 0.74, 0.05]} c="#2a1e15" />))}
      <B p={[-0.7, 0.55, -2.5]} s={[0.5, 0.35, 0.6]} c="#33251a" />
      {/* laptop */}
      <B p={[-1.25, 0.78, -2.45]} s={[0.35, 0.015, 0.25]} c="#2a2c30" metal={0.6} rough={0.3} shadow />
      <group position={[-1.25, 0.79, -2.57]} rotation={[-0.25, 0, 0]}>
        <B p={[0, 0.115, 0]} s={[0.35, 0.23, 0.01]} c="#2a2c30" metal={0.6} rough={0.3} />
        <TextScreen get={() => str("laptop")} w={0.32} h={0.2} p={[0, 0.115, 0.007]} size={0.1} color="#cfe8ff" bg="#0a1424" bright={1.3} />
      </group>
      <GlowLight p={[-1.25, 1.0, -2.2]} color="#9ccaff" i={1.2} dist={3} when={() => !!str("laptop")} />
      {/* clutter on desk */}
      <B p={[-1.7, 0.775, -2.45]} s={[0.3, 0.012, 0.22]} c="#d9d4c4" r={[0, 0.2, 0]} />
      <B p={[-1.68, 0.79, -2.43]} s={[0.28, 0.012, 0.2]} c="#c9c3b0" r={[0, -0.1, 0]} />
      <B p={[-1.0, 0.775, -2.15]} s={[0.12, 0.05, 0.12]} c="#6a3b2c" shape="cyl" />
      <Photo kind="siblings" p={[-0.78, 0.86, -2.3]} r={[-0.25, 0.25, 0]} s={0.2} />
      <B shape="cyl" p={[-0.75, 0.82, -2.65]} s={[0.07, 0.12, 0.07]} c="#2a2a2a" />
      <B shape="sphere" p={[-0.75, 1.0, -2.55]} s={[0.07, 0.07, 0.07]} c="#fff0cc" em="#ffcf80" ei={3} />
      {/* chair */}
      <B p={[-1.2, 0.46, -1.65]} s={[0.46, 0.06, 0.46]} c="#1c1c20" rough={0.7} shadow />
      <B p={[-1.2, 0.8, -1.4]} s={[0.46, 0.6, 0.06]} c="#1c1c20" rough={0.7} />
      <B shape="cyl" p={[-1.2, 0.23, -1.65]} s={[0.03, 0.46, 0.03]} c="#333" />
      {/* console + landline */}
      <B p={[2.2, 0.4, -0.6]} s={[0.45, 0.8, 1.0]} c="#2f2218" rough={0.6} shadow />
      <OldPhone name="landline" p={[2.2, 0.8, -0.6]} r={[0, -Math.PI / 2, 0]} color="#17171c" ring={["old"]} lamp />
      <GlowLight p={[1.8, 1.1, -0.6]} color="#ff4a30" i={1.5} dist={2.2} when={() => stage.ring === "old"} />
      {/* bed, nightstand, clock, mobile */}
      <B p={[1.5, 0.25, 1.6]} s={[2.0, 0.5, 1.4]} c="#2a2320" shadow />
      <B p={[1.5, 0.53, 1.6]} s={[1.96, 0.12, 1.34]} c="#8a8a90" rough={1} shadow />
      <B p={[2.28, 0.64, 1.6]} s={[0.38, 0.12, 0.6]} c="#c9c9cf" rough={1} />
      <B p={[1.2, 0.66, 1.6]} s={[1.5, 0.22, 1.38]} c="#3b4458" rough={1} shadow />
      <B p={[2.2, 0.28, 0.7]} s={[0.45, 0.56, 0.5]} c="#2f2218" rough={0.6} />
      <B p={[2.2, 0.6, 0.78]} s={[0.12, 0.07, 0.14]} c="#111" />
      <TextScreen get={() => str("clock")} w={0.1} h={0.05} p={[2.138, 0.6, 0.78]} r={[0, -Math.PI / 2, 0]} color="#ff3030" bg="#120202" size={0.7} bright={2} />
      <GlowLight p={[2.0, 0.7, 0.78]} color="#ff2020" i={0.5} dist={1.6} when={() => !!str("clock")} />
      <Mobile p={[2.2, 0.565, 0.55]} r={[0, 0.6, 0]} />
      <GlowLight p={[2.0, 0.8, 0.6]} color="#8ab4ff" i={1.4} dist={2.5} when={() => stage.ring === "mobile" || flag("phoneOn")} />
      <Mobile p={[-0.55, 0.775, -2.15]} r={[0, 0.5, 0]} showKey="deskmob" />
      <GlowLight p={[-0.55, 1.0, -1.95]} color="#8ab4ff" i={1.2} dist={2.5} when={() => flag("deskmob") && (stage.ring === "mobile" || flag("phoneOn"))} />
      {/* sofa + shelf + rug */}
      <B p={[-2.0, 0.22, 1.3]} s={[0.9, 0.44, 1.9]} c="#3c3a40" rough={1} shadow />
      <B p={[-2.35, 0.65, 1.3]} s={[0.2, 0.7, 1.9]} c="#3c3a40" rough={1} />
      <B p={[-0.4, 0.01, 0.4]} s={[2.4, 0.02, 1.6]} c="#3a2222" rough={1} />
      <B p={[-2.3, 1.0, -0.3]} s={[0.35, 2.0, 1.1]} c="#2b2018" />
      {Array.from({ length: 14 }).map((_, i) => (
        <B key={i} p={[-2.1, 0.35 + Math.floor(i / 5) * 0.42 + 0.14, -0.7 + (i % 5) * 0.18]} s={[0.2, 0.28, 0.12]} c={["#6a2a2a", "#2a4a6a", "#5a5a2a", "#3a3a3a"][i % 4]} />
      ))}
      <Corkboard />
      {/* door */}
      <group position={[-2.25, 0, 2.97]}>
        <group ref={door}>
          <B p={[0.45, 1.05, 0]} s={[0.9, 2.1, 0.05]} c="#3a2b20" rough={0.6} />
        </group>
      </group>
      <B p={[-1.8, 1.05, 2.99]} s={[1.0, 2.15, 0.02]} c="#07070a" />
      <Dust box={[5, 2.6, 6]} p={[0, 0, 0]} count={90} a={0.35} />
    </group>
  );
}
