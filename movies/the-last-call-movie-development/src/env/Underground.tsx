import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { flag, num, stage, str } from "../movie/stage";
import { B, Cable, Dust, FlickerLight, GlowLight, OldPhone, Room, Spot, TextScreen } from "./kit";
import { Monitor } from "./Exchange";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ============================================================ UNDERGROUND ARCHIVE */
export function ArchiveEnv() {
  return (
    <group>
      <color attach="background" args={["#020303"]} />
      <fog attach="fog" args={["#06090a", 3, 22]} />
      <ambientLight intensity={0.3} color="#5a7068" />
      <FlickerLight p={[0, 2.8, 2]} color="#c8f0d8" base={18} flicker={0.7} speed={4} dist={9} />
      <FlickerLight p={[0, 2.8, -3]} color="#c8f0d8" base={14} flicker={0.4} speed={6} dist={8} />
      <Room w={8} d={14} h={3} floor="#1c1e1f" wall="#3a3f3d" ceil="#2a2d2c" floorRough={0.5} />
      {[-1, 1].map((s) =>
        Array.from({ length: 4 }).map((_, i) => (
          <group key={`${s}${i}`} position={[s * 2.7, 0, 3.8 - i * 2.4]}>
            <B p={[0, 1.1, 0]} s={[0.7, 2.2, 1.9]} c="#4a4f50" metal={0.6} rough={0.5} shadow />
            {Array.from({ length: 5 }).map((__, k) => (
              <group key={k}>
                {Array.from({ length: 3 }).map((___, q) => (
                  <B key={q} p={[-s * 0.2, 0.3 + k * 0.42, -0.65 + q * 0.65]} s={[0.4, 0.3, 0.55]} c={["#8a7a5a", "#6a5e44", "#9a8a68"][(i + k + q) % 3]} rough={1} />
                ))}
              </group>
            ))}
          </group>
        )),
      )}
      {/* pipes + trays */}
      {[-1.4, 1.4].map((x) => (
        <B key={x} shape="cyl" p={[x, 2.75, 0]} s={[0.08, 14, 0.08]} c="#5a5f5c" r={[Math.PI / 2, 0, 0]} metal={0.6} />
      ))}
      <B p={[0, 2.85, 0]} s={[0.6, 0.06, 14]} c="#2a2c2c" />
      <Cable pts={[[0, 2.8, 6], [0.3, 2.6, 2], [-0.2, 2.7, -3], [0, 2.7, -6.5]]} r={0.05} />
      {/* terminal desk */}
      <B p={[0, 0.75, -6]} s={[2.8, 0.06, 0.95]} c="#3d3a33" rough={0.5} shadow />
      <B p={[0, 0.37, -6]} s={[2.7, 0.74, 0.85]} c="#26272a" />
      <Monitor p={[0, 1.2, -6.1]} get={() => str("screen")} size={0.17} w={0.62} h={0.46} />
      <Monitor p={[-1.0, 1.05, -6.05]} r={[0, 0.4, 0]} get={() => str("screen2")} size={0.1} />
      <Monitor p={[1.0, 1.05, -6.05]} r={[0, -0.4, 0]} get={() => str("screen3")} size={0.1} color="#ffb060" bg="#100800" />
      <GlowLight p={[0, 1.4, -5.2]} color="#78ffb4" i={1.4} dist={4} when={() => !!str("screen")} />
      {[-0.5, 0.6, 1.0].map((x, i) => (
        <B key={i} p={[x, 0.8, -5.7]} s={[0.26, 0.015, 0.34]} c="#d8d0b0" r={[0, i * 0.5, 0]} rough={1} />
      ))}
      <B p={[0.3, 0.46, -5.0]} s={[0.46, 0.05, 0.46]} c="#1c1c20" />
      <B p={[-3.0, 0.2, -6]} s={[1.0, 0.4, 0.8]} c="#7a6a48" rough={1} />
      <B p={[-3.0, 0.6, -6]} s={[0.9, 0.4, 0.7]} c="#6a5c3c" rough={1} />
      {/* door */}
      <B p={[0, 1.1, 6.95]} s={[1.6, 2.2, 0.1]} c="#2a2f31" metal={0.6} />
      <Dust box={[8, 3, 14]} count={200} a={0.45} color="#c8d8cc" />
    </group>
  );
}

/* ============================================================ SECRET FACILITY CORRIDOR */
const PHONES = 24;
export function FacilityEnv() {
  const body = useRef<THREE.InstancedMesh>(null!);
  const lamp = useRef<THREE.InstancedMesh>(null!);
  const red1 = useRef<THREE.PointLight>(null!);
  const red2 = useRef<THREE.PointLight>(null!);
  const m = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    for (let i = 0; i < PHONES; i++) {
      const side = i % 2 ? 1 : -1;
      const z = 10 - Math.floor(i / 2) * 1.75;
      m.position.set(side * 1.62, 1.45, z);
      m.rotation.set(0, -side * Math.PI / 2, 0);
      m.scale.set(1, 1, 1);
      m.updateMatrix();
      body.current.setMatrixAt(i, m.matrix);
      m.position.set(side * 1.55, 1.58, z);
      m.scale.set(0.5, 0.5, 0.5);
      m.updateMatrix();
      lamp.current.setMatrixAt(i, m.matrix);
      lamp.current.setColorAt(i, col.setRGB(0.05, 0.02, 0.02));
    }
    body.current.instanceMatrix.needsUpdate = true;
    lamp.current.instanceMatrix.needsUpdate = true;
  }, [m, col]);
  useFrame(() => {
    const mode = num("wave", 0);
    const t = stage.t;
    const frac = mode === 1 ? clamp((t - (stage.shot?.start ?? 0)) / 7, 0, 1) : 0;
    for (let i = 0; i < PHONES; i++) {
      const order = (Math.floor(i / 2) + (i % 2) * 0.5) / (PHONES / 2);
      const on = mode === 2 || (mode === 1 && order <= frac);
      const blink = Math.sin(t * 22 + i * 1.9) > -0.2 ? 1 : 0.15;
      if (on) lamp.current.setColorAt(i, col.setRGB(4 * blink, 0.4 * blink, 0.25 * blink));
      else lamp.current.setColorAt(i, col.setRGB(0.05, 0.02, 0.02));
    }
    if (lamp.current.instanceColor) lamp.current.instanceColor.needsUpdate = true;
    const p = 0.5 + 0.5 * Math.sin(t * 2.4);
    red1.current.intensity = 16 * p * (flag("alarm") ? 1 : 0.35);
    red2.current.intensity = 16 * (1 - p) * (flag("alarm") ? 1 : 0.35);
  });
  return (
    <group>
      <color attach="background" args={["#010202"]} />
      <fog attach="fog" args={["#050809", 3, 24]} />
      <ambientLight intensity={0.16} color="#587080" />
      <pointLight ref={red1} position={[0, 3.0, 4]} color="#ff2a18" intensity={6} distance={12} decay={2} />
      <pointLight ref={red2} position={[0, 3.0, -4]} color="#ff2a18" intensity={6} distance={12} decay={2} />
      <FlickerLight p={[0, 3.0, 8]} color="#b8d8e0" base={4} flicker={0.7} speed={5} dist={9} />
      <FlickerLight p={[0, 3.0, 0]} color="#b8d8e0" base={3} flicker={0.3} speed={8} dist={8} />
      <Room w={3.4} d={27} h={3.2} floor="#1b1d1f" wall="#3a4146" ceil="#272b2e" floorRough={0.35} skip={flag("noCeil") ? ["ceil"] : []} />
      {/* wall panels, doors, pipes */}
      {[-1, 1].map((s) =>
        Array.from({ length: 8 }).map((_, i) => (
          <group key={`${s}${i}`}>
            <B p={[s * 1.69, 1.6, 11.5 - i * 3.3]} s={[0.04, 2.6, 0.06]} c="#20252a" />
            {i % 3 === 1 && <B p={[s * 1.66, 1.05, 10 - i * 3.3]} s={[0.06, 2.1, 1.1]} c="#4a5258" metal={0.7} rough={0.45} />}
          </group>
        )),
      )}
      {[-1, 1].map((s) => (
        <group key={s}>
          <B shape="cyl" p={[s * 1.5, 2.9, 0]} s={[0.09, 27, 0.09]} c="#59605f" r={[Math.PI / 2, 0, 0]} metal={0.6} />
          <B shape="cyl" p={[s * 1.55, 0.3, 0]} s={[0.05, 27, 0.05]} c="#101113" r={[Math.PI / 2, 0, 0]} />
          <B p={[s * 1.6, 2.2, 0]} s={[0.1, 0.05, 27]} c="#15171a" />
          <B p={[s * 1.64, 1.75, 0]} s={[0.04, 0.03, 27]} c="#101113" />
        </group>
      ))}
      {[-1, 1].map((s) =>
        Array.from({ length: 6 }).map((_, i) => (
          <Cable key={`${s}${i}`} pts={[[s * 1.62, 1.6, 10 - i * 3.5], [s * 1.5, 2.0, 9.1 - i * 3.5], [s * 1.62, 1.6, 8.25 - i * 3.5]]} r={0.012} c="#0a0a0c" seg={8} />
        )),
      )}
      {/* wall phones (instanced) */}
      <instancedMesh ref={body} args={[undefined, undefined, PHONES]}>
        <boxGeometry args={[0.1, 0.22, 0.18]} />
        <meshStandardMaterial color="#1e1e22" roughness={0.4} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={lamp} args={[undefined, undefined, PHONES]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* far end pedestal + red phone */}
      <B shape="cyl" p={[0, 0.5, -11.4]} s={[0.4, 1.0, 0.4]} c="#2a2e32" metal={0.5} shadow />
      <OldPhone name="red" p={[0, 1.0, -11.4]} color="#a01414" ring={["red", "many"]} lamp display />
      <Spot p={[0, 3.0, -9.4]} to={[0, 1.0, -11.4]} color="#ffd0c0" intensity={50} angle={0.3} penumbra={0.7} dist={8} />
      <B p={[0, 1.6, -12.9]} s={[3, 3.2, 0.1]} c="#14181b" metal={0.5} />
      {flag("tape") &&
        [0.9, 1.35, 1.8].map((y, i) => (
          <B key={i} p={[0, y, 11.8]} s={[3.4, 0.09, 0.01]} c="#f2c500" em="#e0b000" ei={0.5} r={[0, 0, (i - 1) * 0.05]} />
        ))}
      <Dust box={[3.4, 3.1, 27]} count={200} a={0.45} color="#c8d4d8" />
    </group>
  );
}

/* ============================================================ CONTROL ROOM */
function LightGrid({ cols, rows, w, h, p, r = [0, 0, 0] }: { cols: number; rows: number; w: number; h: number; p: [number, number, number]; r?: [number, number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const n = cols * rows;
  const col = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const cx = i % cols;
      const cy = Math.floor(i / cols);
      o.position.set((cx / (cols - 1) - 0.5) * w, (cy / (rows - 1) - 0.5) * h, 0);
      o.scale.set((w / cols) * 0.62, (h / rows) * 0.62, 1);
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
      ref.current.setColorAt(i, col.setRGB(0.05, 0.03, 0.01));
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [n, cols, rows, w, h, col]);
  useFrame(() => {
    const mode = num("lights", 0);
    const t = stage.t;
    const frac = mode === 1 ? clamp((t - (stage.shot?.start ?? 0)) / 4.5, 0, 1) : mode === 2 ? 1 : 0;
    for (let i = 0; i < n; i++) {
      const hs = hash(i);
      if (hs < frac) {
        const b = Math.sin(t * (2 + hs * 9) + hs * 40) > -0.4 ? 1 : 0.25;
        if (hs < 0.08) ref.current.setColorAt(i, col.setRGB(3.5 * b, 0.4 * b, 0.3 * b));
        else ref.current.setColorAt(i, col.setRGB(3 * b, 1.7 * b, 0.35 * b));
      } else ref.current.setColorAt(i, col.setRGB(0.05, 0.03, 0.01));
    }
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} position={p} rotation={r} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function SecMonitor() {
  const { cv, tex } = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 384;
    cv.height = 240;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { cv, tex };
  }, []);
  const last = useRef(-1);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(() => {
    const sec = num("sec", 0);
    const t = stage.t;
    const stepKey = Math.floor(t * 10) + sec * 100000;
    if (stepKey === last.current) return;
    last.current = stepKey;
    const c = cv.getContext("2d")!;
    const local = t - (stage.shot?.start ?? 0);
    c.fillStyle = "#050606";
    c.fillRect(0, 0, 384, 240);
    if (!sec) {
      mat.current.color.setScalar(0.12);
      tex.needsUpdate = true;
      return;
    }
    mat.current.color.setScalar(1.1);
    // facility room
    c.strokeStyle = "#456";
    c.lineWidth = 2;
    c.strokeRect(20, 30, 344, 190);
    c.fillStyle = "#1c2a24";
    c.fillRect(20, 30, 344, 190);
    c.fillStyle = "#42564c";
    c.fillRect(250, 110, 90, 40);
    c.fillStyle = "#a33";
    c.fillRect(290, 100, 14, 10);
    const flickerOff = sec === 2 && Math.sin(local * 14) > 0.2;
    const fig = (x: number, h: number, shade: string, arm: number) => {
      c.fillStyle = shade;
      c.fillRect(x - 9, 215 - h, 18, h * 0.55);
      c.beginPath();
      c.arc(x, 215 - h - 7, 8, 0, 7);
      c.fill();
      c.fillRect(x - 6, 215 - h * 0.45, 5, h * 0.45);
      c.fillRect(x + 1, 215 - h * 0.45, 5, h * 0.45);
      c.fillRect(x + 9, 215 - h + 8 + arm, 18, 4);
    };
    let dx = 60;
    let ex = 40;
    let em = 0;
    if (sec === 1) {
      dx = 60 + local * 22;
      ex = 40 + local * 24;
    } else if (sec === 2) {
      dx = 160;
      ex = 150;
    } else if (sec === 3) {
      dx = 250;
      ex = 200 + Math.sin(local * 4) * 10;
      em = Math.sin(local * 6) * 6;
    } else if (sec === 4) {
      dx = 290;
      ex = 230 - local * 8;
    }
    if (!flickerOff) {
      fig(dx, 78, "#2b2f33", 0);
      fig(ex, 70, "#9aa8a0", em);
    }
    if (sec === 3 || sec === 4) {
      const ring = Math.sin(local * 25) > 0;
      c.fillStyle = ring ? "#f44" : "#411";
      c.fillRect(300, 92, 8, 8);
    }
    // scanlines + noise
    c.fillStyle = "rgba(0,0,0,0.25)";
    for (let y = 0; y < 240; y += 3) c.fillRect(0, y, 384, 1);
    for (let i = 0; i < 260; i++) {
      c.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`;
      c.fillRect(Math.random() * 384, Math.random() * 240, 2, 1);
    }
    if (sec === 4 && local > 5) {
      for (let i = 0; i < 900; i++) {
        c.fillStyle = `rgba(255,255,255,${Math.random()})`;
        c.fillRect(Math.random() * 384, Math.random() * 240, 3, 2);
      }
    }
    c.font = "bold 15px monospace";
    c.fillStyle = "#cfe";
    c.fillText("CAM 04  SUB-LEVEL 3", 12, 20);
    const sc = 21 * 3600 + 48 * 60 + Math.floor(local * 1 + sec * 14);
    c.fillText(`3 YRS AGO  ${String(Math.floor(sc / 3600)).padStart(2, "0")}:${String(Math.floor((sc % 3600) / 60)).padStart(2, "0")}:${String(sc % 60).padStart(2, "0")}`, 150, 232);
    if (Math.floor(t * 2) % 2) {
      c.fillStyle = "#f33";
      c.beginPath();
      c.arc(350, 16, 6, 0, 7);
      c.fill();
    }
    tex.needsUpdate = true;
  });
  return (
    <group position={[-4.9, 1.9, -0.8]} rotation={[0, Math.PI / 2, 0]}>
      <B s={[2.6, 1.7, 0.1]} c="#16181a" />
      <mesh position={[0, 0, 0.056]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshBasicMaterial ref={mat} map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function ControlEnv() {
  return (
    <group>
      <color attach="background" args={["#010203"]} />
      <fog attach="fog" args={["#04070a", 4, 22]} />
      <ambientLight intensity={0.3} color="#5a7690" />
      <FlickerLight p={[0, 3.2, 1]} color="#9ac0e0" base={flag("lowPower") ? 16 : 12} flicker={0.4} speed={5} dist={10} />
      <GlowLight p={[0, 2.0, -3.5]} color="#ffa840" i={14} dist={11} when={() => num("lights", 0) > 0} />
      <GlowLight p={[0, 1.5, 1.5]} color="#ffa840" i={5} dist={9} when={() => num("lights", 0) === 2} />
      <GlowLight p={[-3.8, 1.9, -0.8]} color="#9ad0b0" i={6} dist={6} when={() => num("sec", 0) > 0} />
      <Room w={10} d={9} h={3.4} floor="#17191b" wall="#323a40" ceil="#222628" floorRough={0.35} />
      <LightGrid cols={64} rows={22} w={9.4} h={2.3} p={[0, 2.0, -4.44]} />
      <LightGrid cols={34} rows={7} w={5.4} h={0.5} p={[0, 1.03, -3.04]} r={[-0.9, 0, 0]} />
      {/* big status screens */}
      <B p={[0, 2.4, -4.38]} s={[5.6, 1.3, 0.05]} c="#000" />
      <TextScreen get={() => str("screen")} w={5.4} h={1.15} p={[0, 2.4, -4.34]} size={0.32} color="#ffb860" bg="#0a0600" bright={1.5} flick />
      <B p={[-3.6, 1.1, -4.38]} s={[1.5, 0.7, 0.05]} c="#000" />
      <TextScreen get={() => str("screen2")} w={1.4} h={0.62} p={[-3.6, 1.1, -4.34]} size={0.22} color="#78ffb4" bg="#021008" />
      {/* console */}
      <B p={[0, 0.46, -3.4]} s={[6.2, 0.92, 1.0]} c="#2a2f34" metal={0.4} rough={0.5} shadow />
      <B p={[0, 0.95, -3.4]} s={[6.3, 0.05, 1.1]} c="#1a1d20" metal={0.5} />
      <OldPhone name="red" p={[0, 0.98, -3.15]} color="#a01414" ring={["red", "many"]} lamp display scale={1.15} />
      <Spot p={[0, 3.2, -1.5]} to={[0, 0.98, -3.15]} color="#ffe0d0" intensity={flag("redSpot") ? 70 : 10} angle={0.3} penumbra={0.7} dist={8} />
      <B p={[-2.2, 1.08, -3.3]} s={[0.4, 0.2, 0.3]} c="#555" metal={0.4} />
      <Monitor p={[-2.2, 1.35, -3.3]} get={() => str("screen3")} size={0.1} color="#ffb060" bg="#100800" scale={0.8} />
      <Monitor p={[2.2, 1.25, -3.3]} get={() => str("screen4")} size={0.1} scale={0.9} />
      {/* chairs, tape machines, cabinets */}
      {[-1.4, 1.4].map((x, i) => (
        <group key={i}>
          <B p={[x, 0.46, -2.2]} s={[0.5, 0.06, 0.5]} c="#1b1b20" />
          <B p={[x, 0.85, -1.95]} s={[0.5, 0.7, 0.06]} c="#1b1b20" />
        </group>
      ))}
      {[3.5, 4.4].map((z, i) => (
        <B key={i} p={[4.6, 1.0, z - 4]} s={[0.7, 2.0, 0.8]} c="#394046" metal={0.5} rough={0.5} />
      ))}
      <SecMonitor />
      <Cable pts={[[-4, 3.4, -4], [-2, 3.0, -2], [1, 3.0, -3.4], [3, 2.0, -4.2]]} r={0.05} />
      <Cable pts={[[4, 3.4, 0], [2, 3.0, -1], [0, 2.9, -2.6], [-1, 1.0, -3.2]]} r={0.04} />
      <Dust box={[10, 3.4, 9]} count={170} a={0.4} color="#d0d8e0" />
    </group>
  );
}
