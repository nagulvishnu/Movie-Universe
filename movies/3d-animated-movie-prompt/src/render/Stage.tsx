import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise, SMAA, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import type { TimedBeat, CharId } from "../film/types";
import { clock } from "../film/clock";
import { LIGHTS, LightCtx, QualityCtx, Sky, useLight, useQuality, disposeKit, Rain } from "./envKit";
import { Station, Street, Beach, Lighthouse } from "./envOutdoor";
import { Bookstore, Room, Hospital } from "./envIndoor";
import { createHuman } from "./human";
import { getSpec, DEFAULT_OUTFIT } from "./characters";
import { direct, createDirectorOut, type DirectorOut } from "./director";

function EnvSwitch({ tb }: { tb: TimedBeat }) {
  const b = tb.beat;
  switch (b.env) {
    case "station": return <Station />;
    case "street": return <Street v={b.v} />;
    case "beach": return <Beach v={b.v} />;
    case "lighthouse": return <Lighthouse v={b.v} />;
    case "bookstore": return <Bookstore />;
    case "ryanHome": return <Room kind={b.v === "modern" ? "ryanModern" : "ryan"} items={b.v === "box"} />;
    case "anyaHome": return <Room kind={b.v === "empty" ? "anyaEmpty" : b.v === "drawer" ? "anyaDrawer" : "anya"} />;
    case "studio": return <Room kind="studio" />;
    case "hospital": return <Hospital v={b.v} />;
    default: return null;
  }
}

function Lights() {
  const L = useLight();
  const q = useQuality();
  const sun = useRef<THREE.DirectionalLight>(null!);
  useEffect(() => {
    const l = sun.current;
    l.shadow.camera.left = -9; l.shadow.camera.right = 9; l.shadow.camera.top = 9; l.shadow.camera.bottom = -9;
    l.shadow.camera.near = 0.5; l.shadow.camera.far = 60;
    l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03;
    l.shadow.camera.updateProjectionMatrix();
  }, []);
  const sz = q === "high" ? 2048 : 1024;
  const s = L.sun.p;
  const len = Math.hypot(...s);
  const k = 28 / len;
  return (
    <>
      <ambientLight color={L.amb.c} intensity={L.amb.i * (L.interior ? 0.9 : 0.6)} />
      <hemisphereLight args={[L.hemi.s, L.hemi.g, L.hemi.i]} />
      <directionalLight ref={sun} color={L.sun.c} intensity={L.sun.i} position={[s[0] * k, s[1] * k, s[2] * k]} castShadow={q !== "low"} shadow-mapSize={[sz, sz]} />
    </>
  );
}

function HumanView({ id, outfit, out }: { id: CharId; outfit: string; out: DirectorOut }) {
  const spec = useMemo(() => getSpec(id, outfit), [id, outfit]);
  const rig = useMemo(() => createHuman(spec), [spec]);
  useEffect(() => () => rig.dispose(), [rig]);
  useFrame((_, dt) => {
    const s = out.actors[id];
    if (!s) return;
    rig.update(s, dt, clock.time);
  });
  return <primitive object={rig.root} />;
}

function Scene({ tb, tbRef, getTime, dofRef }: { tb: TimedBeat; tbRef: { current: TimedBeat }; getTime: () => number; dofRef: { current: any } }) {
  const { camera } = useThree();
  const out = useMemo(() => createDirectorOut(), []);
  const q = useQuality();
  const L = useLight();
  const shakeV = useRef(new THREE.Vector3());
  const fill = useRef<THREE.DirectionalLight>(null!);
  const fillT = useRef<THREE.Object3D>(null!);
  useEffect(() => { fill.current.target = fillT.current; }, []);
  useFrame(() => {
    const cur = tbRef.current;
    const t = getTime();
    direct(cur, t, out);
    const sh = cur.beat.shake ?? 0.0035;
    const tm = t;
    shakeV.current.set(Math.sin(tm * 1.3) * sh + Math.sin(tm * 3.1) * sh * 0.4, Math.sin(tm * 1.7 + 1) * sh * 0.8, Math.sin(tm * 0.9 + 2) * sh * 0.5);
    camera.position.copy(out.camPos).add(shakeV.current);
    const cam = camera as THREE.PerspectiveCamera;
    cam.lookAt(out.camTarget.x + shakeV.current.y * 0.4, out.camTarget.y + shakeV.current.x * 0.4, out.camTarget.z);
    if (Math.abs(cam.fov - out.fov) > 0.01) { cam.fov = out.fov; cam.updateProjectionMatrix(); }
    fill.current.position.copy(out.camPos).add(new THREE.Vector3(0.6, 0.5, 0));
    fillT.current.position.copy(out.camTarget);
    const d = dofRef.current;
    if (d) {
      d.target = out.camTarget;
      d.bokehScale = cur.beat.dof ?? 2.2;
    }
  }, -1);
  const b = tb.beat;
  const ids = Object.keys(b.actors) as CharId[];
  useEffect(() => () => disposeKit(), [b.env, b.v]);
  return (
    <>
      <color attach="background" args={[L.hor]} />
      <fogExp2 attach="fog" args={[L.fog[0], L.fog[1]]} />
      <Lights />
      <directionalLight ref={fill} color="#ffe6cf" intensity={L.stars > 0.3 || (L.rain && L.sun.i < 1) ? 1.25 : L.interior ? 0.5 : 0.35} />
      <object3D ref={fillT} />
      <Sky />
      <Suspense fallback={null}>
        <EnvSwitch key={`${b.env}:${b.v ?? ""}`} tb={tb} />
      </Suspense>
      {(b.rain ?? 0) > 0 && b.env !== "station" && b.env !== "street" && <Rain count={1800} />}
      {ids.map((id) => (
        <HumanView key={id + (b.actors[id]!.outfit ?? "")} id={id} outfit={b.actors[id]!.outfit ?? DEFAULT_OUTFIT[id]} out={out} />
      ))}
      {q !== "low" && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={L.bloom * 0.75} luminanceThreshold={0.88} luminanceSmoothing={0.25} mipmapBlur />
          <DepthOfField ref={dofRef} focusDistance={0} focalLength={0.05} bokehScale={2} height={q === "high" ? 540 : 360} />
          <Vignette offset={0.28} darkness={0.55} />
          <Noise opacity={0.04} blendFunction={BlendFunction.SOFT_LIGHT} />
          <SMAA />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </>
  );
}

export function Stage({ tb, tbRef, getTime, quality }: { tb: TimedBeat; tbRef: { current: TimedBeat }; getTime: () => number; quality: "low" | "med" | "high" }) {
  const dofRef = useRef<any>(null);
  const L = LIGHTS[tb.beat.light];
  return (
    <Canvas
      key={quality}
      shadows
      dpr={quality === "high" ? [1, 1.75] : quality === "med" ? [1, 1.25] : 1}
      camera={{ fov: 35, near: 0.05, far: 1500, position: [0, 1.6, 5] }}
      gl={{ antialias: quality === "low", powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <QualityCtx.Provider value={quality}>
        <LightCtx.Provider value={L}>
          <Scene tb={tb} tbRef={tbRef} getTime={getTime} dofRef={dofRef} />
        </LightCtx.Provider>
      </QualityCtx.Provider>
    </Canvas>
  );
}
