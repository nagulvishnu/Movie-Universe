import { useMemo } from "react";
import * as THREE from "three";
import { B, Cy, Sp, Pl, Glow, Inst, Sea, Palm, useLight, type V3, type InstItem } from "./envKit";
import { T } from "./textures";

// ---------- shared pieces ----------
function Outside() {
  return (
    <group>
      <mesh position={[0, -0.12, -40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 70]} />
        <meshStandardMaterial map={useMemo(() => T.sand([40, 10]), [])} roughness={1} />
      </mesh>
      <Sea y={-0.4} z={-215} />
      <Palm p={[-6, 0, -9]} h={7} lean={0.3} seed={3} />
      <Palm p={[5, 0, -12]} h={8} lean={0.2} seed={5} />
    </group>
  );
}

interface WinDef { x0: number; x1: number; y0: number; y1: number }
function Walls({ x0, x1, z0, z1, h = 3.1, c = "#e8dccb", win, tex, trim = "#f4efe6", floor, floorTex, ceil = "#efe8dc", doorFront }: { x0: number; x1: number; z0: number; z1: number; h?: number; c?: string; win?: WinDef; tex?: THREE.Texture; trim?: string; floor?: string; floorTex?: THREE.Texture; ceil?: string; doorFront?: number }) {
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, t = 0.2;
  return (
    <group>
      <B p={[cx, -0.05, cz]} s={[W + 0.4, 0.1, D + 0.4]} c={floor ?? "#a98a66"} tex={floorTex} rough={0.5} />
      <B p={[cx, h + 0.05, cz]} s={[W + 0.4, 0.1, D + 0.4]} c={ceil} />
      {/* back wall with optional window */}
      {win ? (
        <>
          <B p={[(x0 + win.x0) / 2 - 0.1, h / 2, z0 - t / 2]} s={[win.x0 - x0 + 0.2, h, t]} c={c} tex={tex} />
          <B p={[(x1 + win.x1) / 2 + 0.1, h / 2, z0 - t / 2]} s={[x1 - win.x1 + 0.2, h, t]} c={c} tex={tex} />
          <B p={[(win.x0 + win.x1) / 2, win.y0 / 2, z0 - t / 2]} s={[win.x1 - win.x0, win.y0, t]} c={c} tex={tex} />
          <B p={[(win.x0 + win.x1) / 2, (win.y1 + h) / 2, z0 - t / 2]} s={[win.x1 - win.x0, h - win.y1, t]} c={c} tex={tex} />
          {/* frame */}
          <B p={[(win.x0 + win.x1) / 2, win.y0, z0 + 0.02]} s={[win.x1 - win.x0 + 0.3, 0.07, 0.35]} c={trim} />
          <B p={[(win.x0 + win.x1) / 2, (win.y0 + win.y1) / 2, z0 - 0.05]} s={[0.05, win.y1 - win.y0, 0.06]} c={trim} />
          <B p={[(win.x0 + win.x1) / 2, (win.y0 + win.y1) / 2, z0 - 0.05]} s={[win.x1 - win.x0, 0.05, 0.06]} c={trim} />
          <Pl p={[(win.x0 + win.x1) / 2, (win.y0 + win.y1) / 2, z0 - 0.08]} s={[win.x1 - win.x0, win.y1 - win.y0, 1]} c="#cfe6ff" op={0.06} />
        </>
      ) : (
        <B p={[cx, h / 2, z0 - t / 2]} s={[W + 0.4, h, t]} c={c} tex={tex} />
      )}
      {doorFront === undefined ? (
        <B p={[cx, h / 2, z1 + t / 2]} s={[W + 0.4, h, t]} c={c} tex={tex} />
      ) : (
        <>
          <B p={[(x0 + doorFront - 0.5) / 2 - 0.1, h / 2, z1 + t / 2]} s={[doorFront - 0.5 - x0 + 0.2, h, t]} c={c} tex={tex} />
          <B p={[(x1 + doorFront + 0.5) / 2 + 0.1, h / 2, z1 + t / 2]} s={[x1 - doorFront - 0.5 + 0.2, h, t]} c={c} tex={tex} />
          <B p={[doorFront, (2.2 + h) / 2, z1 + t / 2]} s={[1.0, h - 2.2, t]} c={c} tex={tex} />
        </>
      )}
      {doorFront !== undefined && <B p={[doorFront, 1.05, z1 + 0.08]} s={[0.98, 2.1, 0.06]} c="#6a4a30" />}
      <B p={[x0 - t / 2, h / 2, cz]} s={[t, h, D + 0.4]} c={c} tex={tex} />
      <B p={[x1 + t / 2, h / 2, cz]} s={[t, h, D + 0.4]} c={c} tex={tex} />
      {/* baseboards */}
      <B p={[cx, 0.07, z0 + 0.02]} s={[W, 0.14, 0.04]} c={trim} />
      <B p={[x0 + 0.02, 0.07, cz]} s={[0.04, 0.14, D]} c={trim} />
      <B p={[x1 - 0.02, 0.07, cz]} s={[0.04, 0.14, D]} c={trim} />
    </group>
  );
}

function Pendant({ p, c = "#ffd9a0", light = true, shade = "#2f4a3a" }: { p: V3; c?: string; light?: boolean; shade?: string }) {
  return (
    <group position={p}>
      <Cy p={[0, 0.6, 0]} rt={0.005} rb={0.005} h={1.2} c="#111" seg={4} />
      <Cy p={[0, 0, 0]} rt={0.06} rb={0.24} h={0.22} c={shade} open metal={0.3} rough={0.4} />
      <Glow p={[0, -0.05, 0]} c={c} rad={0.07} i={4} />
      {light && <pointLight position={[0, -0.3, 0]} color={c} intensity={7} distance={7} decay={2} />}
    </group>
  );
}

function Chair({ p, ry = 0, c = "#8a5f3a" }: { p: V3; ry?: number; c?: string }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B p={[0, 0.44, 0.1]} s={[0.44, 0.04, 0.44]} c={c} />
      <B p={[0, 0.72, -0.14]} s={[0.42, 0.4, 0.035]} c={c} />
      {[[-0.19, 0.28], [0.19, 0.28], [-0.19, -0.12], [0.19, -0.12]].map(([x, z], i) => <B key={i} p={[x, 0.21, z]} s={[0.035, 0.42, 0.035]} c={c} />)}
    </group>
  );
}

function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  const leaves = useMemo<InstItem[]>(() => Array.from({ length: 18 }, (_, i) => ({ p: [Math.cos(i * 2.4) * 0.22 * s, 0.5 * s + (i % 6) * 0.1 * s, Math.sin(i * 2.4) * 0.22 * s] as V3, s: [0.26 * s, 0.14 * s, 0.1 * s] as V3, r: [0.3 * i, i * 2.4, 0.5] as V3, c: i % 3 ? "#3f7a3a" : "#5a9a44" })), [s]);
  return (
    <group position={p}>
      <Cy p={[0, 0.2 * s, 0]} rt={0.2 * s} rb={0.14 * s} h={0.4 * s} c="#b8704a" />
      <Inst geo="sphere" items={leaves} c="#3f7a3a" />
    </group>
  );
}

function Frame({ p, ry = 0, s = [0.6, 0.45], k = "laugh" }: { p: V3; ry?: number; s?: [number, number]; k?: string }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B s={[s[0] + 0.06, s[1] + 0.06, 0.03]} c="#2a211a" />
      <Pl p={[0, 0, 0.02]} s={[s[0], s[1], 1]} tex={T.photo(k)} />
    </group>
  );
}

// ---------- books ----------
function shelfBooks(defs: { p: V3; ry: number; w: number; h: number; rows: number }[], seed = 1) {
  let sd = seed;
  const rnd = () => ((sd = (sd * 16807) % 2147483647) - 1) / 2147483646;
  const out: InstItem[] = [];
  const pal = ["#7a2f2a", "#2d4a6a", "#3f6a4a", "#c8a24a", "#6a4a7a", "#a8622e", "#e4dccb", "#2a2f3a", "#8a3a4a", "#4a7a8a"];
  const cos = (a: number) => Math.cos(a), sin = (a: number) => Math.sin(a);
  for (const d of defs) {
    for (let r = 0; r < d.rows; r++) {
      const y0 = 0.12 + r * ((d.h - 0.2) / d.rows);
      let x = -d.w / 2 + 0.06;
      while (x < d.w / 2 - 0.1) {
        if (rnd() < 0.05) { x += 0.12; continue; }
        const bw = 0.03 + rnd() * 0.04;
        const bh = 0.2 + rnd() * 0.12;
        const tilt = rnd() < 0.06 ? 0.25 : 0;
        const lx = x + bw / 2, ly = y0 + bh / 2 + 0.02, lz = 0.0;
        const wx = d.p[0] + lx * cos(d.ry) + lz * sin(d.ry);
        const wz = d.p[2] - lx * sin(d.ry) + lz * cos(d.ry);
        out.push({ p: [wx, d.p[1] + ly, wz], s: [bw, bh, 0.22], r: [0, d.ry, tilt], c: pal[Math.floor(rnd() * pal.length)] });
        x += bw + 0.004 + (tilt ? 0.08 : 0);
      }
    }
  }
  return out;
}
function Shelf({ p, ry = 0, w = 2.2, h = 2.6, rows = 5 }: { p: V3; ry?: number; w?: number; h?: number; rows?: number }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {[-1, 1].map((s) => <B key={s} p={[s * (w / 2 + 0.02), h / 2, 0]} s={[0.04, h, 0.34]} c="#5a3b25" />)}
      <B p={[0, h / 2, -0.15]} s={[w, h, 0.03]} c="#4a301e" />
      {Array.from({ length: rows + 1 }).map((_, i) => <B key={i} p={[0, 0.1 + i * ((h - 0.2) / rows), 0]} s={[w, 0.035, 0.34]} c="#6a4529" />)}
    </group>
  );
}

// ======================================================= BOOKSTORE
export function Bookstore() {
  const L = useLight();
  const wood = useMemo(() => T.wood("#8a5a35", [5, 4]), []);
  const wall = useMemo(() => T.plaster("#e8d6b4", [4, 2]), []);
  const rug = useMemo(() => T.carpet("#7a3f33"), []);
  const defs = useMemo(() => [
    { p: [-4.9, 0, -2.3] as V3, ry: Math.PI / 2, w: 2.2, h: 2.6, rows: 5 }, { p: [-4.9, 0, 0.0] as V3, ry: Math.PI / 2, w: 2.2, h: 2.6, rows: 5 }, { p: [-4.9, 0, 2.3] as V3, ry: Math.PI / 2, w: 2.2, h: 2.6, rows: 5 },
    { p: [4.9, 0, 1.4] as V3, ry: -Math.PI / 2, w: 2.2, h: 2.6, rows: 5 }, { p: [4.9, 0, -0.9] as V3, ry: -Math.PI / 2, w: 2.0, h: 2.6, rows: 5 },
    { p: [-3.0, 0, 3.3] as V3, ry: Math.PI, w: 2.2, h: 2.2, rows: 4 }, { p: [-0.6, 0, 3.3] as V3, ry: Math.PI, w: 2.2, h: 2.2, rows: 4 },
  ], []);
  const books = useMemo(() => shelfBooks(defs, 7), [defs]);
  const fairy = useMemo<InstItem[]>(() => Array.from({ length: 46 }, (_, i) => ({ p: [-4.6 + (i / 45) * 9.2, 2.95 - Math.abs(Math.sin(i * 0.7)) * 0.25, -3.35 + 0.0] as V3, s: [0.07, 0.07, 0.07] as V3 })), []);
  const beams = useMemo<InstItem[]>(() => Array.from({ length: 7 }, (_, i) => ({ p: [-4.5 + i * 1.5, 2.98, 0] as V3, s: [0.2, 0.2, 7.2] as V3 })), []);
  const stack = useMemo<InstItem[]>(() => Array.from({ length: 9 }, (_, i) => ({ p: [1.2 + (i % 2) * 0.03, 0.81 + i * 0.045, 1.9] as V3, s: [0.3 - (i % 3) * 0.03, 0.04, 0.22] as V3, r: [0, i * 0.2, 0] as V3, c: ["#7a2f2a", "#2d4a6a", "#3f6a4a", "#c8a24a"][i % 4] })), []);
  return (
    <group>
      <Outside />
      <Walls x0={-5.2} x1={5.2} z0={-3.6} z1={3.6} win={{ x0: -2.5, x1: 0.7, y0: 0.9, y1: 2.5 }} tex={wall} floorTex={wood} floor="#c79a6a" doorFront={3.2} />
      <Inst geo="box" items={beams} c="#4a3020" />
      <Inst geo="box" items={books} c="#fff" />
      {defs.map((d, i) => <Shelf key={i} {...d} />)}
      {/* door (front wall) */}
      <B p={[3.2, 1.05, 3.5]} s={[0.95, 2.1, 0.06]} c="#3a2a20" />
      <B p={[3.2, 1.3, 3.46]} s={[0.7, 1.4, 0.03]} c="#cfe3f0" op={0.35} />
      {/* counter */}
      <B p={[2.8, 0.5, -1.9]} s={[3.2, 1.0, 0.8]} c="#5a3b25" tex={wood} />
      <B p={[2.8, 1.03, -1.9]} s={[3.4, 0.07, 0.95]} c="#d8c4a4" rough={0.35} />
      <B p={[2.8, 0.5, -3.4]} s={[3.6, 1.0, 0.45]} c="#4a301e" />
      <B p={[2.8, 1.75, -3.45]} s={[3.6, 0.04, 0.35]} c="#5a3b25" />
      <B p={[3.6, 1.28, -1.95]} s={[0.55, 0.45, 0.4]} c="#a8aeb4" metal={0.8} rough={0.3} />
      <B p={[3.6, 1.56, -1.95]} s={[0.5, 0.1, 0.38]} c="#7a8086" metal={0.8} />
      <Cy p={[3.15, 1.2, -1.75]} rt={0.08} rb={0.08} h={0.18} c="#f4f0ea" />
      <Cy p={[2.3, 1.14, -1.8]} rt={0.18} rb={0.18} h={0.14} c="#e8e0d0" />
      <Sp p={[2.3, 1.2, -1.8]} s={[1, 0.8, 1]} rad={0.19} c="#cfe6f0" op={0.25} rough={0.05} />
      {[0, 1, 2].map((i) => <Sp key={i} p={[2.2 + i * 0.1, 1.17, -1.8 + (i % 2) * 0.04]} rad={0.05} c="#d99a4a" />)}
      {[-0.5, 0.2, 0.9].map((x, i) => <Cy key={i} p={[2.8 + x, 1.84, -3.45]} rt={0.05} rb={0.045} h={0.16} c={["#f4f0ea", "#c46a4a", "#f4f0ea"][i]} />)}
      <Pl p={[2.8, 2.35, -3.48]} s={[1.6, 0.75, 1]} tex={T.sign("Today's Brew", "#26302c", "#f1ead8", "Chai · Filter Coffee · Cake")} />
      {[1.5, 2.6, 3.7].map((x) => (
        <group key={x} position={[x, 0, -1.0]}>
          <Cy p={[0, 0.65, 0]} rt={0.17} rb={0.17} h={0.07} c="#6a4a30" />
          <Cy p={[0, 0.32, 0]} rt={0.025} rb={0.025} h={0.65} c="#2a2d33" metal={0.7} />
          <Cy p={[0, 0.02, 0]} rt={0.17} rb={0.17} h={0.03} c="#2a2d33" />
        </group>
      ))}
      <Pendant p={[1.8, 2.2, -1.3]} />
      <Pendant p={[3.4, 2.2, -1.3]} light={false} />
      <Pendant p={[-1.5, 2.1, 0.8]} />
      {/* table + chairs */}
      <Cy p={[-1.5, 0.74, 0.8]} rt={0.52} rb={0.52} h={0.04} c="#a97c50" rough={0.35} />
      <Cy p={[-1.5, 0.37, 0.8]} rt={0.04} rb={0.04} h={0.74} c="#2a2d33" metal={0.6} />
      <Cy p={[-1.5, 0.02, 0.8]} rt={0.3} rb={0.3} h={0.03} c="#2a2d33" />
      <Chair p={[-2.12, 0, 0.8]} ry={Math.PI / 2} />
      <Chair p={[-0.88, 0, 0.8]} ry={-Math.PI / 2} />
      <Pl p={[-1.5, 0.012, 0.8]} s={[3.2, 2.4, 1]} r={[-Math.PI / 2, 0, 0]} tex={rug} />
      <Cy p={[-1.62, 0.8, 0.9]} rt={0.045} rb={0.035} h={0.08} c="#f4f0ea" />
      <Cy p={[-1.35, 0.8, 0.7]} rt={0.045} rb={0.035} h={0.08} c="#f4f0ea" />
      <B p={[-1.5, 0.78, 0.68]} s={[0.2, 0.025, 0.14]} c="#7a2f2a" />
      <Cy p={[-3.4, 0.74, -1.8]} rt={0.4} rb={0.4} h={0.04} c="#a97c50" />
      <Cy p={[-3.4, 0.37, -1.8]} rt={0.035} rb={0.035} h={0.74} c="#2a2d33" />
      <Chair p={[-3.4, 0, -1.2]} ry={Math.PI} c="#6a4a30" />
      <Chair p={[-3.4, 0, -2.4]} ry={0} c="#6a4a30" />
      {/* display table with books */}
      <B p={[1.2, 0.4, 1.9]} s={[1.0, 0.8, 0.7]} c="#6a4529" />
      <Inst geo="box" items={stack} c="#fff" />
      <Plant p={[4.5, 0, -3.1]} s={1.3} />
      <Plant p={[-4.6, 0, 3.0]} s={1.1} />
      <Plant p={[0.9, 0.9, -3.3]} s={0.45} />
      <Inst geo="sphere" items={fairy} c="#fff0c0" em="#ffd890" ei={3} cast={false} />
      {/* cat on the sill */}
      <group position={[-1.5, 0.98, -3.28]}>
        <Sp s={[1.6, 0.8, 0.9]} rad={0.14} c="#cfa070" />
        <Sp p={[0.2, 0.06, 0]} rad={0.08} c="#cfa070" />
        <Cy p={[0.24, 0.16, 0.04]} rt={0.0} rb={0.03} h={0.05} c="#cfa070" seg={4} />
        <Cy p={[0.24, 0.16, -0.04]} rt={0.0} rb={0.03} h={0.05} c="#cfa070" seg={4} />
      </group>
      <Frame p={[4.98, 1.55, 0.2]} ry={-Math.PI / 2} k="sunrise" />
      <Frame p={[-4.98, 1.9, 0.0]} ry={Math.PI / 2} k="street" s={[0.5, 0.38]} />
      {L.win && <pointLight position={[-1, 1.8, -3.0]} color={L.win} intensity={6} distance={9} />}
    </group>
  );
}

// ======================================================= ROOMS
export function Room({ kind, items }: { kind: "ryan" | "ryanModern" | "anya" | "anyaEmpty" | "studio" | "anyaDrawer"; items?: boolean }) {
  const wood = useMemo(() => T.wood(kind.startsWith("ryan") ? "#9a6a42" : "#b89468", [4, 3]), [kind]);
  const wall = useMemo(() => T.plaster(kind.startsWith("ryan") ? "#d9ccb8" : kind === "studio" ? "#d4d4d2" : "#e9e1d8", [4, 2]), [kind]);
  const rug = useMemo(() => T.carpet(kind.startsWith("ryan") ? "#4a5a6a" : "#8a6a5a"), [kind]);
  const whites = useMemo<InstItem[]>(() => Array.from({ length: 30 }, (_, i) => ({ p: [-1.5 - 0.93 + i * 0.0624, 0.775, -2.4] as V3, s: [0.058, 0.026, 0.2] as V3 })), []);
  const blacks = useMemo<InstItem[]>(() => {
    const a: InstItem[] = [];
    for (let i = 0; i < 30; i++) if ([1, 2, 4, 5, 6].includes(i % 7)) a.push({ p: [-1.5 - 0.93 + i * 0.0624 + 0.031, 0.795, -2.44] as V3, s: [0.034, 0.03, 0.12] as V3 });
    return a;
  }, []);
  const photoWall = useMemo(() => ["sunrise", "rain", "light", "child", "couple", "laugh", "street", "sunrise", "light", "rain", "child", "laugh"], []);
  const boxes = kind === "anyaEmpty";
  const isRyan = kind === "ryan" || kind === "ryanModern";
  const isAnya = kind === "anya" || kind === "anyaDrawer";
  return (
    <group>
      <Outside />
      <Walls x0={-4.5} x1={4.5} z0={-3.5} z1={3.5} win={{ x0: -1.0, x1: 1.8, y0: 0.8, y1: 2.5 }} tex={wall} floorTex={wood} floor="#d6b088" doorFront={-3.2} />
      <Pl p={[0, 0.011, 0.6]} s={[3.6, 2.6, 1]} r={[-Math.PI / 2, 0, 0]} tex={rug} />
      {isRyan && (
        <>
          {/* piano */}
          <B p={[-1.5, 0.62, -2.9]} s={[1.75, 1.24, 0.7]} c="#1b1918" rough={0.25} metal={0.2} />
          <B p={[-1.5, 0.7, -2.45]} s={[1.75, 0.06, 0.35]} c="#1b1918" rough={0.25} />
          <B p={[-1.5, 0.35, -2.5]} s={[1.6, 0.7, 0.05]} c="#1b1918" />
          <Inst geo="box" items={whites} c="#f4f0e4" rough={0.3} />
          <Inst geo="box" items={blacks} c="#101010" rough={0.3} />
          <B p={[-1.5, 1.15, -2.55]} s={[0.7, 0.4, 0.02]} c="#f1ead2" r={[-0.2, 0, 0]} />
          <Cy p={[-1.5, 0.46, -1.7]} rt={0.22} rb={0.22} h={0.07} c="#2a2220" rough={0.4} />
          {[[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]].map(([x, z], i) => <Cy key={i} p={[-1.5 + x, 0.22, -1.7 + z]} rt={0.02} rb={0.02} h={0.44} c="#2a2220" seg={6} />)}
          <Frame p={[-1.5, 1.8, -3.22]} k="couple" s={[0.5, 0.38]} />
          <Chair p={[-0.45, 0, -1.7]} ry={-Math.PI / 2} c="#6a4a30" />
          {/* desk + synth */}
          <B p={[2.8, 0.76, -2.9]} s={[1.9, 0.05, 0.8]} c="#caa77a" tex={wood} />
          {[-0.85, 0.85].map((x) => <B key={x} p={[2.8 + x, 0.38, -2.9]} s={[0.06, 0.76, 0.7]} c="#3a2a20" />)}
          <B p={[2.5, 0.83, -2.85]} s={[1.0, 0.07, 0.3]} c="#1a1a1c" />
          <B p={[3.3, 1.05, -3.2]} s={[0.7, 0.42, 0.03]} c="#111" />
          <Pl p={[3.3, 1.05, -3.18]} s={[0.66, 0.38, 1]} c="#b8d2ff" em="#6d96d8" ei={0.9} />
          {[0, 1, 2].map((i) => <B key={i} p={[3.0 + i * 0.12, 0.79, -2.7 + i * 0.03]} s={[0.2, 0.004, 0.28]} c="#f2ecd8" r={[0, 0.2 * i, 0]} />)}
          <Chair p={[2.7, 0, -2.0]} ry={Math.PI} c="#2a2d33" />
          {/* bed */}
          <B p={[3.45, 0.18, 0.4]} s={[2.1, 0.3, 1.5]} c="#4a3426" />
          <B p={[3.4, 0.42, 0.4]} s={[2.0, 0.22, 1.4]} c="#d8dde4" />
          <B p={[3.55, 0.55, 0.4]} s={[1.3, 0.1, 1.42]} c="#5a6e8a" />
          {[0, 1].map((i) => <B key={i} p={[4.1, 0.58, 0.0 + i * 0.7]} s={[0.4, 0.14, 0.55]} c="#f4f0ea" />)}
          <B p={[4.3, 0.75, 0.4]} s={[0.1, 1.2, 1.6]} c="#4a3426" />
          <B p={[3.7, 0.28, -1.1]} s={[0.5, 0.56, 0.45]} c="#5a3b25" />
          <Frame p={[3.7, 0.75, -1.12]} k="laugh" s={[0.2, 0.15]} />
          <Cy p={[3.9, 0.62, -1.1]} rt={0.05} rb={0.09} h={0.14} c="#f1e2c0" em="#ffd080" ei={0.8} />
          <pointLight position={[3.8, 1.0, -0.9]} color="#ffbf80" intensity={3} distance={5} />
          {/* sofa */}
          <B p={[0.4, 0.22, 2.4]} s={[2.1, 0.44, 0.9]} c="#6a7a6a" />
          <B p={[0.4, 0.6, 2.82]} s={[2.1, 0.5, 0.22]} c="#5d6d5d" />
          {[-1, 1].map((s) => <B key={s} p={[0.4 + s * 1.0, 0.4, 2.4]} s={[0.2, 0.6, 0.9]} c="#5d6d5d" />)}
          <B p={[0.4, 0.2, 0.9]} s={[1.0, 0.4, 0.55]} c="#7a5a3a" />
          {items && (
            <group position={[0.4, 0.4, 0.9]}>
              <B p={[-0.25, 0.07, 0]} s={[0.3, 0.14, 0.2]} c="#8a6140" />
              <B p={[-0.25, 0.155, 0]} s={[0.31, 0.02, 0.21]} c="#6d4a30" r={[0, 0, -0.5]} />
              {[0, 1, 2, 3].map((i) => <B key={i} p={[0.0 + i * 0.03, 0.005 + i * 0.004, 0.0 + i * 0.01]} s={[0.22, 0.004, 0.14]} c="#f4efe2" r={[0, 0.15 * i - 0.2, 0]} />)}
              <B p={[0.3, 0.04, -0.05]} s={[0.14, 0.085, 0.07]} c="#1d1d20" r={[0, 0.3, 0]} />
              <Cy p={[0.3, 0.04, 0.0]} rt={0.032} rb={0.035} h={0.06} c="#101012" r={[Math.PI / 2, 0.3, 0]} />
              {["sunrise", "light", "laugh"].map((k, i) => <Pl key={k} p={[-0.1 + i * 0.18, 0.012 + i * 0.002, 0.18]} s={[0.15, 0.11, 1]} r={[-Math.PI / 2, 0, 0.2 * i - 0.2]} tex={T.photo(k)} />)}
            </group>
          )}
          {/* kitchen */}
          <B p={[-2.9, 0.45, 2.3]} s={[2.4, 0.9, 0.7]} c="#d7d3c8" />
          <B p={[-2.9, 0.92, 2.3]} s={[2.5, 0.05, 0.78]} c="#6a6a68" rough={0.3} />
          <B p={[-3.3, 0.96, 2.3]} s={[0.55, 0.03, 0.5]} c="#222" />
          <Cy p={[-3.3, 1.08, 2.3]} rt={0.14} rb={0.14} h={0.22} c="#b8bcc0" metal={0.8} rough={0.3} />
          <B p={[-2.5, 0.97, 2.25]} s={[0.5, 0.025, 0.3]} c="#c8a070" />
          <Sp p={[-2.4, 1.0, 2.25]} rad={0.04} c="#c83a2a" />
          <Sp p={[-2.55, 1.0, 2.3]} rad={0.04} c="#8ab83a" />
          <B p={[-4.1, 0.9, 3.1]} s={[0.8, 1.8, 0.7]} c="#cfd3d6" metal={0.4} rough={0.35} />
          <B p={[-2.9, 1.7, 3.3]} s={[2.0, 0.04, 0.3]} c="#7a5a3a" />
          {[0, 1, 2, 3, 4].map((i) => <Cy key={i} p={[-3.6 + i * 0.35, 1.8, 3.3]} rt={0.05} rb={0.045} h={0.16} c={["#e8a050", "#4a8aa8", "#f4f0ea", "#c46a4a", "#8aa86a"][i]} />)}
          {/* guitar + plants */}
          <group position={[-4.1, 0, -0.8]} rotation={[0, Math.PI / 2, -0.12]}>
            <Sp p={[0, 0.4, 0]} s={[1, 1.2, 0.38]} rad={0.2} c="#b87a3a" rough={0.3} />
            <Sp p={[0, 0.66, 0]} s={[0.8, 0.8, 0.38]} rad={0.15} c="#b87a3a" rough={0.3} />
            <Cy p={[0, 1.0, 0]} rt={0.025} rb={0.03} h={0.7} c="#3a2a20" />
          </group>
          <Plant p={[-4.1, 0, -3.0]} s={1.2} />
          <Plant p={[4.1, 0, 3.0]} s={1.0} />
          {kind === "ryanModern" && (
            <>
              <Frame p={[-0.5, 1.9, -3.4]} k="laugh" s={[0.75, 0.56]} />
              <B p={[-0.5, 0.45, -3.2]} s={[0.4, 0.9, 0.3]} c="#3a2a20" />
              <Frame p={[-0.5, 1.0, -3.0]} k="couple" s={[0.3, 0.22]} />
              <B p={[-0.3, 1.02, -3.05]} s={[0.3, 0.02, 0.2]} c="#f4efe0" />
            </>
          )}
          <Pendant p={[0.5, 2.3, 0.8]} c="#ffcf90" shade="#caa070" />
        </>
      )}
      {(isAnya || boxes) && (
        <>
          {/* bed */}
          <B p={[-3.2, 0.2, -1.6]} s={[1.6, 0.32, 2.1]} c="#a88a68" />
          {!boxes && (
            <>
              <B p={[-3.2, 0.45, -1.6]} s={[1.5, 0.22, 2.0]} c="#f1ede6" />
              <B p={[-3.2, 0.58, -1.3]} s={[1.5, 0.08, 1.4]} c="#9fb2a6" />
              {[-0.4, 0.4].map((x) => <B key={x} p={[-3.2 + x, 0.62, -2.4]} s={[0.55, 0.14, 0.38]} c="#faf7f2" />)}
            </>
          )}
          {boxes && <B p={[-3.2, 0.38, -1.6]} s={[1.5, 0.12, 2.0]} c="#c8c0b4" />}
          {/* desk + drawer */}
          <B p={[2.3, 0.76, -3.0]} s={[1.8, 0.05, 0.75]} c="#e6dccb" />
          <B p={[1.55, 0.38, -3.0]} s={[0.06, 0.76, 0.7]} c="#e6dccb" />
          <B p={[3.05, 0.38, -3.0]} s={[0.5, 0.74, 0.7]} c="#d8cdb8" />
          <B p={[3.05, 0.52, -2.62]} s={[0.46, 0.22, kind === "anyaDrawer" ? 0.45 : 0.05]} c="#cfc3ac" />
          {kind === "anyaDrawer" && (
            <>
              {[0, 1, 2, 3, 4].map((i) => <B key={i} p={[3.05 + (i % 2) * 0.04, 0.63 + i * 0.015, -2.5 + (i % 3) * 0.04]} s={[0.3, 0.01, 0.22]} c="#f2f0ea" r={[0, 0.3 * i, 0]} />)}
              {[0, 1, 2].map((i) => <group key={i} position={[2.55 + i * 0.18, 0.84, -2.85 + (i % 2) * 0.12]}><Cy rt={0.03} rb={0.03} h={0.1} c="#d98a2a" /><Cy p={[0, 0.06, 0]} rt={0.032} rb={0.032} h={0.03} c="#f4f4f0" /></group>)}
              {[0, 1, 2, 3].map((i) => <B key={i} p={[2.0 + i * 0.1, 0.79, -2.9 + (i % 2) * 0.1]} s={[0.26, 0.005, 0.34]} c="#f4f2ec" r={[0, 0.4 * i, 0]} />)}
            </>
          )}
          {!boxes && (
            <>
              <B p={[2.0, 0.83, -3.05]} s={[0.5, 0.02, 0.35]} c="#9aa0a8" metal={0.8} />
              <B p={[2.0, 0.97, -3.2]} s={[0.5, 0.3, 0.015]} c="#b8d0f0" em="#7aa0d8" ei={0.8} r={[-0.1, 0, 0]} />
              <Chair p={[2.1, 0, -2.2]} ry={Math.PI} c="#caa77a" />
              {/* photo wall */}
              <Inst geo="sphere" items={Array.from({ length: 40 }, (_, i) => ({ p: [-1.5 + i * 0.1, 2.75 - Math.abs(Math.sin(i * 0.4)) * 0.2, -3.34] as V3, s: [0.06, 0.06, 0.06] as V3 }))} c="#fff0c0" em="#ffd890" ei={3} cast={false} />
              {photoWall.map((k, i) => <Pl key={i} p={[-4.38, 1.2 + (i % 3) * 0.55, -2.4 + Math.floor(i / 3) * 0.75]} s={[0.5, 0.38, 1]} r={[0, Math.PI / 2, ((i * 37) % 10 - 5) * 0.012]} tex={T.photo(k)} />)}
              {/* tripod */}
              <group position={[-0.2, 0, 2.4]}>
                {[0, 1, 2].map((i) => <Cy key={i} p={[Math.cos(i * 2.1) * 0.18, 0.7, Math.sin(i * 2.1) * 0.18]} rt={0.012} rb={0.012} h={1.4} c="#222" r={[Math.sin(i * 2.1) * 0.25, 0, -Math.cos(i * 2.1) * 0.25]} seg={6} />)}
                <B p={[0, 1.42, 0]} s={[0.14, 0.09, 0.08]} c="#1d1d20" />
              </group>
              <Plant p={[-4.0, 0, 2.8]} s={1.2} />
              <Plant p={[1.9, 0.78, -3.3]} s={0.4} />
              <B p={[4.2, 0.9, 1.0]} s={[0.5, 1.8, 1.4]} c="#d9cdb8" />
              {/* curtains */}
              <B p={[-1.25, 1.65, -3.3]} s={[0.35, 1.9, 0.06]} c="#efe6d8" op={0.9} />
              <B p={[2.05, 1.65, -3.3]} s={[0.35, 1.9, 0.06]} c="#efe6d8" op={0.9} />
              <Pendant p={[0.2, 2.35, 0.2]} c="#ffd9a8" shade="#e8dcc8" />
            </>
          )}
          {boxes && (
            <>
              {[[0.5, 1.2], [1.0, 1.7], [-0.4, 2.0], [1.6, 1.1]].map(([x, z], i) => <B key={i} p={[x, 0.25 + (i % 2) * 0.1, z]} s={[0.7, 0.5 + (i % 2) * 0.2, 0.55]} c="#b88f5c" r={[0, i * 0.4, 0]} />)}
              <B p={[2.4, 0.5, -2.9]} s={[0.35, 0.01, 0.25]} c="#f4efe0" r={[0, 0.2, 0]} />
              {[0, 1, 2, 3].map((i) => <Pl key={i} p={[-4.39, 1.5 + (i % 2) * 0.55, -2.2 + Math.floor(i / 2) * 1.5]} s={[0.55, 0.42, 1]} r={[0, Math.PI / 2, 0]} c="#f1ece4" />)}
            </>
          )}
        </>
      )}
      {kind === "studio" && (
        <>
          <B p={[-0.5, 1.6, -2.6]} s={[3.2, 3.0, 0.03]} c="#eeeeec" />
          <Pl p={[-0.5, 0.01, -1.6]} s={[3.2, 2.0, 1]} r={[-Math.PI / 2, 0, 0]} c="#eeeeec" />
          {[-2.2, 1.2].map((x, i) => (
            <group key={i} position={[x, 0, -1.2]}>
              <Cy p={[0, 0.9, 0]} rt={0.02} rb={0.02} h={1.8} c="#222" seg={6} />
              <B p={[0, 1.9, 0.1]} s={[0.7, 0.7, 0.18]} c="#f6f6f2" em="#fff6e0" ei={2} r={[0.1, i ? -0.5 : 0.5, 0]} />
            </group>
          ))}
          <pointLight position={[-2.2, 2.0, -0.8]} color="#fff0dc" intensity={8} distance={7} />
          {/* work desk + wall of prints */}
          <B p={[3.2, 0.76, 1.2]} s={[0.8, 0.05, 2.2]} c="#d8cdb8" />
          <B p={[3.65, 1.12, 1.2]} s={[0.04, 0.55, 0.9]} c="#111" />
          <Pl p={[3.62, 1.12, 1.2]} s={[0.9, 0.5, 1]} r={[0, -Math.PI / 2, 0]} tex={T.photo("sunrise")} em="#555" ei={0.5} />
          {Array.from({ length: 16 }).map((_, i) => <Pl key={i} p={[-4.38, 0.9 + (i % 4) * 0.6, -2.4 + Math.floor(i / 4) * 1.5]} s={[0.7, 0.5, 1]} r={[0, Math.PI / 2, 0]} tex={T.photo(photoWall[i % photoWall.length])} />)}
          {[0, 1, 2].map((i) => <Pl key={i} p={[3.2, 0.79, 0.6 + i * 0.6]} s={[0.3, 0.22, 1]} r={[-Math.PI / 2, 0, i]} tex={T.photo(photoWall[i + 3])} />)}
          <Cy p={[3.2, 0.82, 1.9]} rt={0.04} rb={0.035} h={0.1} c="#f4f0ea" />
          <Chair p={[2.4, 0, 1.2]} ry={-Math.PI / 2} c="#2a2d33" />
          <Pendant p={[0.4, 2.4, 0.4]} c="#fff0d8" shade="#e8e8e4" />
        </>
      )}
      <pointLight position={[0.3, 2.6, 0.5]} color={isRyan ? "#ffd2a0" : "#ffe8cf"} intensity={isRyan ? 6 : 5} distance={9} />
    </group>
  );
}

// ======================================================= HOSPITAL
export function Hospital({ v = "reception" }: { v?: string }) {
  const tile = useMemo(() => T.tile("#dfe5e8", "#cdd6da", [9, 6]), []);
  const panels = useMemo<InstItem[]>(() => Array.from({ length: 12 }, (_, i) => ({ p: [0, 3.05, 4 - i * 3] as V3, s: [1.0, 0.04, 1.6] as V3 })), []);
  const doors = useMemo<InstItem[]>(() => Array.from({ length: 12 }, (_, i) => ({ p: [i % 2 ? 1.62 : -1.62, 1.05, 2.5 - Math.floor(i / 2) * 5.2] as V3, s: [0.06, 2.1, 1.0] as V3, c: i % 3 === 0 ? "#6d9aae" : "#cfd8dc" })), []);
  const seats = useMemo<InstItem[]>(() => Array.from({ length: 12 }, (_, i) => ({ p: [-3.6 + (i % 6) * 0.55, 0.45, 2.4 + Math.floor(i / 6) * 1.5] as V3, s: [0.5, 0.06, 0.5] as V3, c: i % 2 ? "#3a6a8a" : "#4a7a9a" })), []);
  const slats = useMemo<InstItem[]>(() => Array.from({ length: 22 }, (_, i) => ({ p: [0, 0.8 + i * 0.075, -2.6] as V3, s: [1.6, 0.03, 0.02] as V3, c: "#e8ecee" })), []);
  if (v === "corridor")
    return (
      <group>
        <B p={[0, -0.05, -10]} s={[3.4, 0.1, 40]} tex={tile} c="#e6ecee" rough={0.2} metal={0.1} />
        <B p={[0, 3.15, -10]} s={[3.4, 0.1, 40]} c="#f2f4f4" />
        <B p={[-1.75, 1.55, -10]} s={[0.1, 3.1, 40]} c="#dfe9e6" />
        <B p={[1.75, 1.55, -10]} s={[0.1, 3.1, 40]} c="#dfe9e6" />
        <B p={[-1.68, 0.9, -10]} s={[0.06, 0.06, 40]} c="#9aa8ae" metal={0.6} />
        <B p={[1.68, 0.9, -10]} s={[0.06, 0.06, 40]} c="#9aa8ae" metal={0.6} />
        <B p={[-1.68, 0.5, -10]} s={[0.04, 1.0, 40]} c="#7fa8b8" />
        <B p={[1.68, 0.5, -10]} s={[0.04, 1.0, 40]} c="#7fa8b8" />
        <Inst geo="box" items={panels} c="#f4fbff" em="#e8f4ff" ei={2.0} cast={false} />
        <Inst geo="box" items={doors} c="#fff" />
        <B p={[0, 1.6, -29.8]} s={[3.2, 2.8, 0.1]} c="#fffdf6" em="#fff8e8" ei={2.5} />
        {[-3, -12, -22].map((z) => <pointLight key={z} position={[0, 2.8, z]} color="#e4f0ff" intensity={8} distance={11} />)}
        <pointLight position={[0, 2.6, 3]} color="#e4f0ff" intensity={8} distance={10} />
        {[0, 1].map((i) => <group key={i} position={[-1.5, 0, -6 - i * 9]}><B p={[0, 0.45, 0]} s={[0.4, 0.06, 1.4]} c="#3a6a8a" /><B p={[-0.2, 0.75, 0]} s={[0.04, 0.55, 1.4]} c="#3a6a8a" /></group>)}
        <Pl p={[-1.68, 1.8, -4]} s={[1.1, 0.4, 1]} r={[0, Math.PI / 2, 0]} tex={T.sign("RADIOLOGY  →", "#1f5f8f", "#ffffff")} />
        <Pl p={[1.68, 1.8, -9]} s={[1.1, 0.4, 1]} r={[0, -Math.PI / 2, 0]} tex={T.sign("← OUTPATIENT", "#1f5f8f", "#ffffff")} />
      </group>
    );
  if (v === "consult")
    return (
      <group>
        <Walls x0={-2.6} x1={2.6} z0={-2.7} z1={3.6} win={{ x0: -1.0, x1: 1.0, y0: 0.8, y1: 2.3 }} c="#e6ede9" floor="#d6dde0" floorTex={tile} doorFront={2.2} />
        <Outside />
        <Inst geo="box" items={slats} c="#e8ecee" />
        <B p={[0, 0.74, -0.6]} s={[1.7, 0.05, 0.85]} c="#c9b08a" rough={0.35} />
        <B p={[0, 0.37, -0.6]} s={[1.6, 0.74, 0.8]} c="#d8d4cc" />
        <B p={[0.4, 1.0, -0.75]} s={[0.55, 0.36, 0.03]} c="#111" />
        <Pl p={[0.4, 1.0, -0.73]} s={[0.5, 0.31, 1]} c="#cfe0ff" em="#7a9acc" ei={0.7} />
        <B p={[-0.5, 0.78, -0.4]} s={[0.22, 0.04, 0.3]} c="#f2efe6" />
        <B p={[-0.1, 0.78, -0.3]} s={[0.14, 0.1, 0.12]} c="#e6f0f6" />
        <Chair p={[0, 0, -1.2]} ry={0} c="#2f4a5a" />
        <Chair p={[0, 0, 0.4]} ry={Math.PI} c="#4a7a9a" />
        <B p={[2.55, 1.6, 0.4]} s={[0.04, 0.9, 1.4]} c="#cfd8dc" />
        <Pl p={[2.5, 1.6, 0.4]} s={[1.3, 0.8, 1]} r={[0, -Math.PI / 2, 0]} c="#bcd6ee" em="#b8d8f8" ei={1.1} />
        {[0, 1, 2].map((i) => <B key={i} p={[2.47, 1.6 + (i - 1) * 0.22, 0.2 + i * 0.3]} s={[0.01, 0.1, 0.5]} c="#eef6ff" />)}
        <B p={[-2.4, 1.0, 0.8]} s={[0.4, 2.0, 1.6]} c="#d0c4b0" />
        {[0, 1, 2, 3, 4].map((i) => <B key={i} p={[-2.18, 1.3 + (i % 2) * 0.35, 0.3 + i * 0.25]} s={[0.04, 0.28, 0.14]} c={["#2d4a6a", "#7a2f2a", "#3f6a4a", "#e4dccb", "#2a2f3a"][i]} />)}
        <Frame p={[-1.8, 1.9, -2.66]} k="light" s={[0.5, 0.36]} />
        <pointLight position={[0, 2.7, 0.4]} color="#e4f0ff" intensity={9} distance={9} />
        <B p={[0, 3.05, 0.4]} s={[1.2, 0.04, 1.2]} c="#f4fbff" em="#e8f4ff" ei={2} />
        <Plant p={[-2.1, 0, 3.0]} s={0.9} />
      </group>
    );
  // reception
  return (
    <group>
      <Walls x0={-5} x1={5} z0={-3.5} z1={4.5} win={{ x0: 1.2, x1: 4.6, y0: 0.4, y1: 2.8 }} c="#e4ece9" floor="#d6dde0" floorTex={tile} h={3.2} doorFront={0} />
      <Outside />
      <B p={[-1.2, 0.55, -1.8]} s={[4.0, 1.1, 0.8]} c="#e9eef0" rough={0.3} />
      <B p={[-1.2, 1.12, -1.8]} s={[4.2, 0.06, 0.95]} c="#8fb0bf" rough={0.2} />
      <B p={[-1.2, 0.55, -1.38]} s={[3.9, 0.9, 0.03]} c="#6da0b8" />
      <Pl p={[-1.2, 2.5, -3.38]} s={[3.2, 0.8, 1]} tex={T.sign("RECEPTION", "#1f5f8f", "#ffffff", "Appointments · Reports")} />
      <B p={[-0.2, 1.4, -1.9]} s={[0.5, 0.3, 0.03]} c="#111" r={[-0.2, 0, 0]} />
      <Pl p={[-0.2, 1.4, -1.88]} s={[0.46, 0.26, 1]} c="#cfe0ff" em="#7a9acc" ei={0.6} r={[-0.2, 0, 0]} />
      <Inst geo="box" items={seats} c="#3a6a8a" />
      {Array.from({ length: 12 }).map((_, i) => <B key={i} p={[-3.6 + (i % 6) * 0.55, 0.75, 2.6 + Math.floor(i / 6) * 1.5]} s={[0.5, 0.5, 0.05]} c="#3a6a8a" />)}
      <Inst geo="box" items={panels.map((_p, i) => ({ p: [-3 + (i % 4) * 2.5, 3.14, -2 + Math.floor(i / 4) * 2.4] as V3, s: [1.2, 0.04, 1.2] as V3 }))} c="#f4fbff" em="#e8f4ff" ei={2.2} cast={false} />
      <pointLight position={[-1, 2.8, 0]} color="#e4f0ff" intensity={10} distance={11} />
      <pointLight position={[-1, 2.8, 3]} color="#e4f0ff" intensity={8} distance={10} />
      <Plant p={[-4.5, 0, -2.8]} s={1.4} />
      <Plant p={[4.4, 0, 3.8]} s={1.2} />
      <Cy p={[-4.5, 0.5, 1.0]} rt={0.18} rb={0.18} h={1.0} c="#cfd8dc" />
      <Cy p={[-4.5, 1.15, 1.0]} rt={0.17} rb={0.17} h={0.3} c="#9fd4ff" op={0.6} />
      <Cy p={[3, 2.6, -3.4]} rt={0.3} rb={0.3} h={0.04} r={[Math.PI / 2, 0, 0]} c="#f4f4f0" />
      <Frame p={[-4.9, 1.8, 2.2]} ry={Math.PI / 2} k="sunrise" s={[0.8, 0.55]} />
      <B p={[0, 1.2, 4.4]} s={[2.0, 2.4, 0.08]} c="#bcd6e8" op={0.4} />
    </group>
  );
}

export function VoidEnv() {
  return <group />;
}
