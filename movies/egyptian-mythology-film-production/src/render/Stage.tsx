import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { God } from '../characters/God';
import { clock } from '../film/clock';
import type { CastDef } from '../film/types';

/** A character in a scene: handles entrance/exit windows, travel between `at` and `to`, and facing. */
export function Actor({ def }: { def: CastDef }) {
  const g = useRef<THREE.Group>(null!);
  const A = useMemo(() => new THREE.Vector3(...def.at), [def.at]);
  const B = useMemo(() => new THREE.Vector3(...(def.to ?? def.at)), [def.to, def.at]);
  const heading = useMemo(() => (def.face !== undefined ? def.face : def.to ? Math.atan2(B.x - A.x, B.z - A.z) : 0), [def.face, def.to, A, B]);
  useFrame(() => {
    const p = clock.progress;
    if (!g.current) return;
    g.current.visible = p >= (def.enter ?? 0) && p <= (def.exit ?? 1.001);
    g.current.position.lerpVectors(A, B, def.to ? p : 0);
    g.current.rotation.y = heading;
  });
  return (
    <group ref={g} position={def.at} scale={def.s ?? 1}>
      <God id={def.id} anim={def.anim ?? (def.to ? 'walk' : 'idle')} emote={def.emote} aura={def.aura} tint={def.tint} />
    </group>
  );
}
