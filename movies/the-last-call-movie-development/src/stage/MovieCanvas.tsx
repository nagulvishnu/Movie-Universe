import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, BrightnessContrast, DepthOfField, EffectComposer, HueSaturation, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { stage, getActor, type Quality } from "../movie/stage";
import { conductor, movie } from "../movie";
import { ctl } from "../ui/playback";
import { Human } from "../characters/Human";
import type { ActorId, EnvId } from "../movie/types";
import { RoadEnv } from "../env/Road";
import { ApartmentEnv } from "../env/Apartment";
import { BedroomEnv, ParkEnv, PoliceEnv } from "../env/Places";
import { ExchangeExtEnv, ExchangeIntEnv, VictorEnv } from "../env/Exchange";
import { ArchiveEnv, ControlEnv, FacilityEnv } from "../env/Underground";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const ENVS: Record<EnvId, () => React.ReactElement | null> = {
  void: () => <color attach="background" args={["#000000"]} />,
  road: RoadEnv,
  apartment: ApartmentEnv,
  police: PoliceEnv,
  park: ParkEnv,
  exchangeExt: ExchangeExtEnv,
  exchangeInt: ExchangeIntEnv,
  victor: VictorEnv,
  archive: ArchiveEnv,
  facility: FacilityEnv,
  control: ControlEnv,
  bedroom: BedroomEnv,
};

/** Colour grading per location so the whole film feels like one look. */
const GRADE: Record<EnvId, { sat: number; hue: number; con: number; bri: number; bloom: number }> = {
  void: { sat: 0, hue: 0, con: 0, bri: 0, bloom: 0.3 },
  road: { sat: -0.05, hue: 0, con: 0.12, bri: -0.02, bloom: 0.9 },
  apartment: { sat: -0.12, hue: 0, con: 0.1, bri: 0.0, bloom: 0.7 },
  police: { sat: -0.35, hue: 0, con: 0.14, bri: 0.02, bloom: 0.5 },
  park: { sat: 0.1, hue: 0.03, con: -0.02, bri: 0.07, bloom: 0.9 },
  exchangeExt: { sat: -0.3, hue: 0, con: 0.15, bri: 0, bloom: 0.8 },
  exchangeInt: { sat: -0.3, hue: -0.02, con: 0.18, bri: 0.0, bloom: 0.7 },
  victor: { sat: -0.05, hue: 0.02, con: 0.1, bri: 0.0, bloom: 0.6 },
  archive: { sat: -0.35, hue: -0.03, con: 0.18, bri: 0.0, bloom: 0.6 },
  facility: { sat: -0.25, hue: 0, con: 0.2, bri: 0, bloom: 1.0 },
  control: { sat: -0.1, hue: 0, con: 0.2, bri: 0.02, bloom: 1.3 },
  bedroom: { sat: -0.1, hue: 0.03, con: 0.15, bri: 0.0, bloom: 0.8 },
};

/** Drives the master clock and the conductor. Runs before everything else each frame. */
function Timekeeper() {
  useFrame((_, dt) => {
    if (ctl.seekTo !== null) {
      ctl.t = ctl.seekTo;
      conductor.seek(ctl.t);
      ctl.seekTo = null;
      ctl.ended = false;
    }
    if (ctl.playing && !ctl.ended) {
      ctl.t = Math.min(ctl.t + Math.min(dt, 0.1), movie.duration);
      if (ctl.t >= movie.duration - 0.001) {
        ctl.ended = true;
        ctl.playing = false;
        ctl.onEnd();
      }
    }
    conductor.tick(ctl.t, ctl.playing);
  }, -3);
  return null;
}

function Cast({ ids }: { ids: ActorId[] }) {
  return (
    <>
      {ids.map((id) => (
        <Human key={id} id={id} />
      ))}
    </>
  );
}

function CameraRig({ dofTarget }: { dofTarget: THREE.Vector3 }) {
  const { camera } = useThree();
  const P = useMemo(() => new THREE.Vector3(), []);
  const Lk = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const sh = stage.shot;
    if (!sh) return;
    const c = sh.cam;
    const t = stage.t;
    const u = clamp((t - sh.start) / sh.dur, 0, 1);
    const e = (u * u * (3 - 2 * u)) * 0.55 + u * 0.45;
    const a = c.p;
    const b = c.p2 ?? c.p;
    let x = a[0] + (b[0] - a[0]) * e;
    let y = a[1] + (b[1] - a[1]) * e;
    let z = a[2] + (b[2] - a[2]) * e;
    if (c.on) {
      const ar = getActor(c.on);
      const cs = Math.cos(ar.yaw);
      const sn = Math.sin(ar.yaw);
      const lx = x;
      const lz = z;
      x = ar.root.x + lx * cs + lz * sn;
      z = ar.root.z - lx * sn + lz * cs;
      y = ar.root.y + y;
    }
    P.set(x, y, z);
    if (c.at) {
      Lk.copy(getActor(c.at).head);
      if (c.atOff) Lk.add(new THREE.Vector3(...c.atOff));
    } else {
      const l1 = c.look ?? [0, 1, 0];
      const l2 = c.look2 ?? l1;
      Lk.set(l1[0] + (l2[0] - l1[0]) * e, l1[1] + (l2[1] - l1[1]) * e, l1[2] + (l2[2] - l1[2]) * e);
    }
    const sk = c.shake ?? 0;
    if (sk > 0) {
      const n1 = Math.sin(t * 1.7) + Math.sin(t * 3.9 + 1) * 0.5 + Math.sin(t * 8.3 + 2) * 0.2;
      const n2 = Math.sin(t * 1.3 + 3) + Math.sin(t * 4.7) * 0.5 + Math.sin(t * 9.1 + 5) * 0.2;
      P.x += n1 * 0.012 * sk;
      P.y += n2 * 0.01 * sk;
      Lk.x += n2 * 0.02 * sk;
      Lk.y += n1 * 0.015 * sk;
    }
    camera.position.copy(P);
    camera.lookAt(Lk);
    if (c.roll || sk) camera.rotateZ((c.roll ?? 0) + Math.sin(t * 1.1) * 0.004 * sk);
    const cam = camera as THREE.PerspectiveCamera;
    const f0 = c.fov ?? 35;
    const fov = f0 + ((c.fov2 ?? f0) - f0) * e;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    dofTarget.copy(Lk);
  });
  return null;
}

/** Hand-held torches (Daniel / Sarah). Constant light count, intensity toggled by state. */
function Torch({ id }: { id: ActorId }) {
  const ref = useRef<THREE.SpotLight>(null!);
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    ref.current.target = target;
  }, [target]);
  useFrame(() => {
    const on = String(stage.st.torch ?? "").includes(id);
    const l = ref.current;
    l.intensity = on ? 90 * (0.94 + 0.06 * Math.sin(stage.t * 23)) : 0;
    if (!on) return;
    const a = getActor(id);
    l.position.copy(a.hand);
    target.position.set(a.hand.x + Math.sin(a.yaw) * 6, a.hand.y - 0.9, a.hand.z + Math.cos(a.yaw) * 6);
    target.updateMatrixWorld();
  });
  return (
    <>
      <spotLight ref={ref} intensity={0} angle={0.42} penumbra={0.7} distance={22} decay={1.6} color="#fff0d0" />
      <primitive object={target} />
    </>
  );
}

function PostFX({ env, q, dofTarget }: { env: EnvId; q: Quality; dofTarget: THREE.Vector3 }) {
  const g = GRADE[env];
  const dof = useRef<{ target: THREE.Vector3 } | null>(null);
  useFrame(() => {
    if (dof.current?.target) dof.current.target.copy(dofTarget);
  });
  if (q === "high")
    return (
      <EffectComposer multisampling={0}>
        <DepthOfField ref={dof as never} target={[0, 1.5, 0]} focalLength={0.05} bokehScale={2.2} height={480} />
        <Bloom intensity={g.bloom} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur />
        <HueSaturation hue={g.hue} saturation={g.sat} />
        <BrightnessContrast brightness={g.bri} contrast={g.con} />
        <Noise opacity={0.07} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    );
  if (q === "medium")
    return (
      <EffectComposer multisampling={0}>
        <Bloom intensity={g.bloom} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur />
        <HueSaturation hue={g.hue} saturation={g.sat} />
        <BrightnessContrast brightness={g.bri} contrast={g.con} />
        <Noise opacity={0.06} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    );
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={g.bloom} luminanceThreshold={0.8} luminanceSmoothing={0.3} />
      <Vignette offset={0.25} darkness={0.7} />
    </EffectComposer>
  );
}

function usePoll<T>(fn: () => T): T {
  const [v, setV] = useState<T>(fn);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const n = fn();
      setV((o) => (Object.is(o, n) ? o : n));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fn]);
  return v;
}

const sceneActors = movie.scenes.map((_, i) => {
  const set = new Set<ActorId>();
  movie.shots.filter((s) => s.sceneIdx === i).forEach((s) => (Object.keys(s.actors) as ActorId[]).forEach((a) => set.add(a)));
  return [...set];
});

const readScene = () => stage.sceneIdx;

function World({ quality }: { quality: Quality }) {
  const sceneIdx = usePoll(readScene);
  const dofTarget = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);
  const sc = movie.scenes[Math.max(0, sceneIdx)];
  const Env = ENVS[sc.env];
  return (
    <>
      <Timekeeper />
      <Env key={sc.id} />
      <Cast key={`cast-${sc.id}`} ids={sceneActors[Math.max(0, sceneIdx)]} />
      <Torch id="daniel" />
      <Torch id="sarah" />
      <CameraRig dofTarget={dofTarget} />
      <PostFX env={sc.env} q={quality} dofTarget={dofTarget} />
    </>
  );
}

function MovieCanvasImpl({ quality }: { quality: Quality }) {
  const dpr = quality === "low" ? 0.75 : quality === "medium" ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
  return (
    <Canvas
      dpr={dpr}
      shadows={quality === "low" ? false : "soft"}
      camera={{ fov: 35, near: 0.05, far: 300, position: [0, 1.6, 5] }}
      gl={{ antialias: quality !== "low", powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <World quality={quality} />
    </Canvas>
  );
}

export const MovieCanvas = memo(MovieCanvasImpl);
