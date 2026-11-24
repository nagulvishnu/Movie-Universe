import { Suspense, useEffect, useRef, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { getEnv } from '../environments';
import { engine } from '../film/engine';
import { TSCENES } from '../film/timeline';
import { CameraRig } from './CameraRig';
import { FxView } from './Fx';
import { PropView } from './Props';
import { Actor } from './Stage';

const useSceneIdx = () => useSyncExternalStore(engine.subscribe, () => engine.getSnapshot().sceneIdx);
const useQuality = () => useSyncExternalStore(engine.subscribe, () => engine.getSnapshot().quality);

/** Rendered while an environment module is still loading: pauses the clock and shows the buffering indicator. */
function BufferGate() {
  useEffect(() => { engine.setBuffering(true); return () => engine.setBuffering(false); }, []);
  return null;
}

function SceneContent({ idx }: { idx: number }) {
  const sc = TSCENES[idx];
  if (!sc) return null;
  const Env = getEnv(sc.def.env);
  return (
    <>
      <Suspense fallback={<BufferGate />}>
        <Env key={`${sc.def.env}:${sc.def.variant ?? ''}`} variant={sc.def.variant} />
      </Suspense>
      <group key={sc.def.id}>
        {sc.def.cast?.map((c, i) => <Actor key={i} def={c} />)}
        {sc.def.props?.map((p, i) => <PropView key={i} def={p} />)}
        {sc.def.fx?.map((f, i) => <FxView key={i} def={f} />)}
      </group>
    </>
  );
}

/** Drops quality automatically if the machine cannot hold a smooth frame rate. */
function PerfGuard() {
  const acc = useRef({ t: 0, n: 0, strikes: 0 });
  useFrame((_, dt) => {
    if (!engine.getSnapshot().playing || engine.getSnapshot().buffering || dt > 0.5) return;
    const a = acc.current; a.t += dt; a.n++;
    if (a.t > 4) {
      const fps = a.n / a.t; a.t = 0; a.n = 0;
      a.strikes = fps < 34 ? a.strikes + 1 : 0;
      if (a.strikes >= 2) { a.strikes = 0; const q = engine.getSnapshot().quality; if (q === 'high') engine.setPrefs({ quality: 'medium' }); else if (q === 'medium') engine.setPrefs({ quality: 'low' }); }
    }
  });
  return null;
}

function ReadyFlag() {
  const done = useRef(0);
  useFrame(() => { if (done.current < 3 && ++done.current === 3) engine.setReady(); });
  return null;
}

export function FilmCanvas() {
  const idx = useSceneIdx();
  const quality = useQuality();
  const post = quality !== 'low';
  return (
    <Canvas
      key={quality}
      dpr={[1, quality === 'high' ? 1.75 : 1.25]}
      shadows={quality === 'high' ? 'soft' : false}
      camera={{ fov: 42, near: 0.1, far: 700, position: [0, 3, 12] }}
      gl={{ antialias: !post || quality === 'high' ? !post : false, powerPreference: 'high-performance', toneMapping: post ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping, stencil: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <CameraRig />
      <SceneContent idx={idx} />
      <PerfGuard /><ReadyFlag />
      {post && (
        <EffectComposer multisampling={quality === 'high' ? 4 : 0} enableNormalPass={false}>
          <Bloom intensity={quality === 'high' ? 0.8 : 0.6} luminanceThreshold={0.85} luminanceSmoothing={0.25} mipmapBlur />
          <Vignette offset={0.28} darkness={0.65} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
