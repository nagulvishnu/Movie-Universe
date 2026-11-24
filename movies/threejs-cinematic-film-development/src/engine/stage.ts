// The Stage owns the WebGL renderer, the two persistent actors, the camera, lights, effects and environment.
// It renders any scene at any time t deterministically (so seeking/skipping never breaks the story state).
import * as THREE from 'three';
import type { ActorId, SceneDef, SpeakerId } from '../story/types';
import type { Sample } from '../story/track';
import { ARIN, MIRA } from '../story/characters';
import { Character } from './character';
import { CinematicCamera, type ActorRef } from './cinematicCamera';
import { EffectsManager } from './effects';
import { EnvironmentManager } from './environmentManager';
import { LightRig } from './lighting';
import { TIME } from './props';
import { audio } from './audio';

export interface SpeakInfo { speaker: SpeakerId; text: string; u: number; style: string }
export type Quality = 'low' | 'balanced' | 'high';

export class Stage {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  cam = new CinematicCamera();
  rig: LightRig; fx: EffectsManager; env: EnvironmentManager;
  actors: Record<ActorId, Character> = { arin: new Character(ARIN), mira: new Character(MIRA) };
  private def: SceneDef | null = null;
  private snapFrames = 2;
  private lastT = 0;
  private w = 1280; private h = 720;
  private quality: Quality = 'balanced';
  private refs: Record<ActorId, ActorRef> = {
    arin: { head: new THREE.Vector3(), pos: new THREE.Vector3(), yaw: 0, scale: 1 },
    mira: { head: new THREE.Vector3(), pos: new THREE.Vector3(), yaw: 0, scale: 1 },
  };
  private visible: Record<ActorId, boolean> = { arin: false, mira: false };
  private focus = new THREE.Vector3(); private v1 = new THREE.Vector3(); private v2 = new THREE.Vector3(); private v3 = new THREE.Vector3();

  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.rig = new LightRig(this.scene, this.renderer);
    this.fx = new EffectsManager(this.scene);
    this.env = new EnvironmentManager(this.scene);
    this.scene.add(this.actors.arin.root, this.actors.mira.root);
    this.setQuality('balanced');
  }

  setQuality(q: Quality) {
    this.quality = q;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    this.renderer.setPixelRatio(q === 'low' ? 0.75 : q === 'balanced' ? Math.min(dpr, 1.25) : Math.min(dpr, 1.75));
    const size = q === 'low' ? 1024 : 2048;
    if (this.rig.sun.shadow.mapSize.x !== size) { this.rig.sun.shadow.mapSize.set(size, size); this.rig.sun.shadow.map?.dispose(); this.rig.sun.shadow.map = null; }
    this.renderer.setSize(this.w, this.h, false);
  }
  get currentQuality() { return this.quality; }

  resize(w: number, h: number) {
    this.w = Math.max(2, w); this.h = Math.max(2, h);
    this.renderer.setSize(this.w, this.h, false);
    this.cam.camera.aspect = this.w / this.h; this.cam.camera.updateProjectionMatrix();
  }

  load(def: SceneDef) {
    this.def = def;
    this.env.set(def.env, def.mode);
    this.rig.set(def.light);
    this.fx.set(def.fx);
    this.cam.colliders = this.env.colliders;
    this.snapFrames = 2; this.lastT = -1;
  }

  private lookTarget(look: unknown, id: ActorId): THREE.Vector3 | null {
    if (!look || look === 'none') return null;
    if (look === 'cam') return this.cam.camera.position;
    if (Array.isArray(look)) return this.v3.set(look[0], look[1], look[2]);
    const other = look as ActorId;
    if (other === id || !this.visible[other]) return null;
    return this.refs[other].head;
  }

  frame(t: number, dt: number, animTime: number, speak: SpeakInfo | null, playing: boolean) {
    const def = this.def; if (!def) return;
    TIME.value = animTime;
    this.env.update(t, def.params, dt);
    const snap = this.snapFrames > 0; if (snap) this.snapFrames--;

    const ids: ActorId[] = ['arin', 'mira'];
    const samples: Partial<Record<ActorId, Sample>> = {};
    for (const id of ids) { const tr = def.actors?.[id]; if (tr) samples[id] = tr.at(t); this.visible[id] = !!tr && (samples[id]?.vis ?? false); }
    for (const id of ids) {
      const ch = this.actors[id], sp = samples[id];
      if (!sp) { ch.root.visible = false; continue; }
      const other: ActorId = id === 'arin' ? 'mira' : 'arin';
      let faceYaw: number | null = null;
      if (sp.faceTo && samples[sp.faceTo]) { const o = samples[sp.faceTo]!; faceYaw = Math.atan2(o.x - sp.x, o.z - sp.z); }
      const look = this.lookTarget(sp.look, id);
      const sk = speak && speak.speaker === id ? speak : null;
      const steps = ch.update({ dt, time: animTime, sample: sp, snap, faceYaw, lookWorld: look ? look.clone() : null, speak: sk ? { text: sk.text, u: sk.u, style: sk.style } : null });
      void other;
      if (steps && playing) {
        const d = ch.root.position.distanceTo(this.cam.camera.position);
        audio.footstep(def.surface ?? 'concrete', Math.max(0.12, Math.min(1, 7 / (d + 5))));
      }
      const r = this.refs[id];
      r.head.copy(ch.headSmooth); r.pos.copy(ch.root.position); r.yaw = ch.root.rotation.y; r.scale = ch.scaleK;
    }

    this.cam.update(def.shots, t, (id) => (this.visible[id] ? this.refs[id] : null), animTime);

    // lightning & thunder
    const flash = this.fx.update(t, this.cam.camera, this.h);
    if (playing && def.fx?.lightning && this.lastT >= 0) {
      for (const s of def.fx.lightning) if (this.lastT < s && t >= s) audio.sfx('thunder', 0.9, 0.25 + ((s * 7.31) % 1) * 1.1);
    }
    this.lastT = t;

    // light focus + flashlight
    const vis = ids.filter((i) => this.visible[i]);
    if (vis.length) { this.focus.set(0, 0, 0); vis.forEach((i) => this.focus.add(this.refs[i].pos)); this.focus.multiplyScalar(1 / vis.length); }
    else { this.cam.camera.getWorldDirection(this.v1); this.focus.copy(this.cam.camera.position).addScaledVector(this.v1, 14); }
    let fl = false;
    if (def.flashlight && this.visible[def.flashlight] && samples[def.flashlight]?.prop === 'flashlight') {
      this.actors[def.flashlight].handBeam(this.v1, this.v2);
      this.rig.spot.position.copy(this.v1); this.rig.spot.target.position.copy(this.v1).addScaledVector(this.v2, 6); fl = true;
    }
    this.rig.apply(Math.min(1, t / Math.max(1, def.dur)), flash, this.focus, this.cam.camera, fl);
    this.renderer.render(this.scene, this.cam.camera);
  }

  dispose() {
    this.env.clear(); this.fx.dispose(); this.rig.dispose();
    this.actors.arin.dispose(); this.actors.mira.dispose();
    this.renderer.dispose(); this.renderer.forceContextLoss();
  }
}
