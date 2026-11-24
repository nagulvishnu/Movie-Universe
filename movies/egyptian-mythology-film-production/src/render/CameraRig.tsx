import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { evalCamera } from '../camera/director';
import { clock } from '../film/clock';
import { TSCENES } from '../film/timeline';

const tmp = new THREE.Vector3();
export function CameraRig() {
  useFrame(({ camera }) => {
    const sc = TSCENES[clock.sceneIdx]; if (!sc) return;
    const r = evalCamera(sc.def, clock.progress, clock.animT);
    camera.position.set(r.pos[0], r.pos[1], r.pos[2]);
    camera.lookAt(tmp.set(r.look[0], r.look[1], r.look[2]));
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - r.fov) > 0.01) { cam.fov = r.fov; cam.updateProjectionMatrix(); }
  });
  return null;
}
