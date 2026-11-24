import * as THREE from 'three';
import type { ActorDef, EnvKind, Key, Look, SceneDef, V3 } from '../movie/types';
import { talkTime } from '../movie/types';
import type { Env } from './envCommon';
import { buildForest, buildGas, buildRoad } from './envOutdoor';
import { buildCabin, buildCave, buildHome, buildHunt, buildRanger } from './envIndoor';
import { CarRig, Rig, SPECS } from './rig';
import { glowTex } from './textures';
import type { AudioEngine } from './audio';

export interface Movie { scenes: SceneDef[]; total: number }
export type Quality = 'low' | 'medium' | 'high';

// ---------------------------------------------------------------- key sampling
interface Sample { p: [number, number]; y: number; r: number; u: number; a: Key['a']; e: Key['e']; l: Look; v: 0 | 1; sp: number }
const wrapA = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
function num(keys: Key[], t: number, f: 'y' | 'r' | 'u', def: number, angle = false): number {
  let prev: Key | null = null, next: Key | null = null;
  for (const k of keys) { if (k[f] === undefined) continue; if (k.t <= t) prev = k; else { next = k; break; } }
  if (!prev && !next) return def;
  if (!prev) return next![f]!;
  if (!next) return prev[f]!;
  const f01 = (t - prev.t) / Math.max(0.0001, next.t - prev.t);
  const a = prev[f]!, b = next[f]!;
  return angle ? a + wrapA(b - a) * f01 : a + (b - a) * f01;
}
function sample(keys: Key[], t: number): Sample {
  const s: Sample = { p: [0, 0], y: 0, r: 0, u: 0, a: 'idle', e: 'neutral', l: null, v: 1, sp: 1 };
  for (const k of keys) {
    if (k.t > t) break;
    if (k.a) s.a = k.a; if (k.e) s.e = k.e; if (k.l !== undefined) s.l = k.l; if (k.v !== undefined) s.v = k.v; if (k.sp) s.sp = k.sp;
  }
  let prev: Key | null = null, next: Key | null = null;
  for (const k of keys) { if (!k.p) continue; if (k.t <= t) prev = k; else { next = k; break; } }
  if (prev && next) { const f = (t - prev.t) / Math.max(0.0001, next.t - prev.t); s.p = [prev.p![0] + (next.p![0] - prev.p![0]) * f, prev.p![1] + (next.p![1] - prev.p![1]) * f]; }
  else if (prev) s.p = prev.p!; else if (next) s.p = next.p!;
  s.y = num(keys, t, 'y', 0); s.r = num(keys, t, 'r', 0, true); s.u = num(keys, t, 'u', 0);
  return s;
}

class Actor {
  rig?: Rig; car?: CarRig;
  lookV = new THREE.Vector3();
  phase = 0; x = 0; y = 0; z = 0; yaw = 0; first = true;
  constructor(public id: string, public def: ActorDef, lightsOn: boolean) {
    if (def.char === 'car') this.car = new CarRig(lightsOn);
    else { const sp = { ...SPECS[def.char] }; if (def.scale) sp.scale *= def.scale; this.rig = new Rig(id, sp); }
  }
  get root() { return (this.rig?.root ?? this.car!.root); }
  dispose() { this.rig?.dispose(); this.car?.dispose(); }
}

interface Flash { spot: THREE.SpotLight; cone: THREE.Mesh; grp: THREE.Group; actor: string; from: number; to: number; power: number }

const smooth = (x: number) => x * x * (3 - 2 * x);
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const lerp3 = (a: V3, b: V3, t: number, out: THREE.Vector3) => out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);

export class Engine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, 500);
  env: Env | null = null;
  actors = new Map<string, Actor>();
  idx = -1;
  def: SceneDef | null = null;
  fade = 1;
  flashAmt = 0;
  private flashes: Flash[] = [];
  private prevLocal = 0;
  private seekFlag = true;
  private lastT = 0;
  private bg = new THREE.Color();
  private col = new THREE.Color(); private tmpA = new THREE.Vector3(); private tmpB = new THREE.Vector3(); private look = new THREE.Vector3(); private tmpC = new THREE.Vector3();
  private baseHemi = 1; private baseKey = 1; private fireBase = 0;
  private quality: Quality = 'medium';
  private dpr = 1; private ftAvg = 16; private ftCount = 0;
  private width = 1280; private height = 720;
  private burnLight = new THREE.PointLight(0xff7a30, 0, 16, 2);
  private coneGeo: THREE.BufferGeometry; private coneMat: THREE.MeshBasicMaterial;

  constructor(canvas: HTMLCanvasElement, private movie: Movie, private audio: AudioEngine) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor(0x000000);
    this.coneGeo = new THREE.ConeGeometry(2.2, 8, 20, 1, true).rotateX(-Math.PI / 2).translate(0, 0, 4);
    this.coneMat = new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, map: glowTex() });
    this.scene.add(this.camera, this.burnLight);
    this.setQuality('medium');
  }

  setQuality(q: Quality) {
    this.quality = q;
    this.dpr = q === 'low' ? 0.75 : q === 'medium' ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 1.75);
    this.renderer.shadowMap.enabled = q !== 'low';
    this.applySize();
  }
  resize(w: number, h: number) { this.width = Math.max(2, w); this.height = Math.max(2, h); this.applySize(); }
  private applySize() {
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height; this.camera.updateProjectionMatrix();
  }

  seek() { this.seekFlag = true; }

  private makeEnv(kind: EnvKind, def: SceneDef): Env | null {
    const o = def.opts ?? {};
    switch (kind) {
      case 'forest': return buildForest(o); case 'road': return buildRoad(o); case 'gas': return buildGas(o);
      case 'cabin': return buildCabin(o); case 'hunt': return buildHunt(o); case 'cave': return buildCave(o);
      case 'ranger': return buildRanger(o); case 'home': return buildHome(o); default: return null;
    }
  }

  private unload() {
    this.actors.forEach((a) => a.dispose()); this.actors.clear();
    this.flashes.forEach((f) => { f.spot.dispose(); f.grp.removeFromParent(); this.scene.remove(f.spot.target); f.spot.removeFromParent(); });
    this.flashes = [];
    if (this.env) { this.scene.remove(this.env.group); this.env.dispose(); this.env = null; }
  }

  private load(i: number) {
    this.unload();
    this.idx = i;
    const def = this.movie.scenes[i]; this.def = def;
    const env = this.makeEnv(def.env, def);
    this.env = env;
    if (env) {
      this.scene.add(env.group);
      this.scene.background = this.bg.setHex(env.pal.bg).clone();
      this.scene.fog = new THREE.FogExp2(env.pal.fog, env.fogDensity);
      this.renderer.toneMappingExposure = def.opts?.exposure ?? env.pal.exposure;
      this.baseHemi = env.hemi.intensity; this.baseKey = env.key.intensity; this.fireBase = env.fire?.intensity ?? 0;
    } else { this.scene.background = new THREE.Color(0x000000); this.scene.fog = null; }
    const lightsOn = def.opts?.time === 'dusk' || def.opts?.time === 'night' || def.opts?.time === 'storm';
    for (const id in def.actors) {
      const a = new Actor(id, def.actors[id], lightsOn);
      this.actors.set(id, a); this.scene.add(a.root);
    }
    (def.flashlights ?? []).forEach((f) => {
      const spot = new THREE.SpotLight(0xfff0d0, 80 * (f.power ?? 1), 28, 0.42, 0.65, 2);
      const grp = new THREE.Group(); const cone = new THREE.Mesh(this.coneGeo, this.coneMat); grp.add(cone);
      this.scene.add(spot, spot.target, grp);
      this.flashes.push({ spot, cone, grp, actor: f.actor, from: f.from ?? 0, to: f.to ?? 9999, power: f.power ?? 1 });
    });
  }

  private resolveLook(l: Look, out: THREE.Vector3): THREE.Vector3 | null {
    if (!l) return null;
    if (Array.isArray(l)) return out.set(l[0], l[1], l[2]);
    const [id, h] = l.split(':');
    const a = this.actors.get(id); if (!a) return null;
    if (h !== undefined) return out.set(a.x, a.y + Number(h), a.z);
    if (a.rig) return a.rig.headWorld(out);
    return out.set(a.x, a.y + 1, a.z);
  }

  private speakAmp(id: string, local: number): number {
    const d = this.def!;
    for (const l of d.lines) if (l.who === id && local >= l.t + 0.1 && local <= l.t + 0.1 + talkTime(l)) return 0.75 + 0.25 * Math.sin(local * 9);
    return 0;
  }

  private lightMult(def: SceneDef, local: number): number {
    let state = def.opts?.interior === false ? 0 : 1;
    let flick = -1;
    for (const c of def.cues) {
      if (!c.light || c.t > local) continue;
      if (c.light === 'flicker') {
        const d = c.d ?? 2;
        if (local < c.t + d) flick = hash(Math.floor(local * 16)) > 0.42 ? 0.85 + hash(local * 5) * 0.3 : 0.04;
        else state = (c.then ?? 'on') === 'on' ? 1 : 0;
      } else state = c.light === 'on' ? 1 : 0;
    }
    return flick >= 0 ? flick : state;
  }

  /** advance. t = absolute movie time (s). Returns nothing; read this.fade etc. */
  step(t: number, dt: number, playing: boolean, now: number) {
    const mv = this.movie;
    let i = mv.scenes.findIndex((s) => t >= s.start! && t < s.start! + s.dur);
    if (i < 0) i = mv.scenes.length - 1;
    const def0 = mv.scenes[i];
    let local = Math.min(def0.dur, t - def0.start!);
    const changed = i !== this.idx || this.seekFlag;
    if (changed) {
      const natural = i === this.idx + 1 && !this.seekFlag && playing;
      this.load(i);
      this.prevLocal = natural ? -0.001 : local;
      this.audio.stopSpeech();
      if (!natural) this.audio.unduck();
      this.catchUp(local, natural);
      this.prevLocal = local;
      this.seekFlag = false;
      this.actors.forEach((a) => (a.first = true));
    }
    const def = this.def!;
    local = Math.max(0, local);

    // ---- audio events
    if (playing && !changed) this.fireCues(def, this.prevLocal, local);
    this.prevLocal = local;

    // ---- fade
    const fin = def.fin ?? 0.8, fout = def.fout ?? 0.6;
    this.fade = Math.max(fin > 0 ? 1 - Math.min(1, local / fin) : 0, fout > 0 ? Math.max(0, (local - (def.dur - fout)) / fout) : 0);
    this.fade = Math.min(1, Math.max(0, this.fade));

    const env = this.env;
    // ---- actors (hosts first)
    const order = [...this.actors.values()].sort((a, b) => Number(!!a.def.rideOn) - Number(!!b.def.rideOn));
    const dtc = Math.min(dt, 0.1);
    for (const a of order) this.updateActor(a, local, dtc, now);
    for (const a of order) if (a.rig) a.rig.root.updateMatrixWorld(true);

    // ---- env anims / lights
    if (env) {
      for (const an of def.anims ?? []) {
        const o = env.objs[an.obj]; if (!o) continue;
        if (an.keys && an.rot) {
          const ks = an.keys; let v = ks[0][1];
          for (let k = 0; k < ks.length; k++) { if (local >= ks[k][0]) { v = ks[k][1]; if (ks[k + 1] && local < ks[k + 1][0]) v = ks[k][1] + (ks[k + 1][1] - ks[k][1]) * ((local - ks[k][0]) / (ks[k + 1][0] - ks[k][0])); } }
          o.rotation[an.rot] = v;
        }
        if (an.vis) { let v = an.vis[0][1]; for (const [kt, kv] of an.vis) if (local >= kt) v = kv; o.visible = v; }
      }
      const m = this.lightMult(def, local);
      env.interior.forEach((l, k) => (l.intensity = env.interiorBase[k] * m));
      env.bulbs.forEach((bl) => bl.mat.color.copy(bl.base).multiplyScalar(0.12 + 0.88 * m));
      if (env.fire) env.fire.intensity = this.fireBase * (m > 0.5 ? 0.75 + 0.35 * hash(Math.floor(now * 12)) : 0.2);
      // lightning
      let fl = 0;
      for (const c of def.cues) if (c.bolt && local >= c.t && local < c.t + 1.4) { const x = local - c.t; fl += Math.exp(-x * 6) * (0.65 + 0.35 * Math.sin(x * 70)); }
      fl = Math.min(1.4, fl); this.flashAmt = fl;
      env.hemi.intensity = this.baseHemi + fl * 2.6; env.key.intensity = this.baseKey + fl * 3.2;
      (this.scene.background as THREE.Color).setHex(env.pal.bg).lerp(this.col.setHex(0x8899bb), Math.min(1, fl * 0.25));
      env.update(local, dtc, this.camera);
      // home specials
      if (def.env === 'home') {
        const ring = def.cues.some((c) => c.sfx === 'phone' && local >= c.t && local < c.t + (c.d ?? 5));
        const sc = env.objs.phoneScreen as THREE.Mesh | undefined;
        if (sc) (sc.material as THREE.MeshBasicMaterial).color.setHex(ring ? (Math.floor(now * 3) % 2 ? 0xbfe6ff : 0x6aa0c8) : 0x1a2a3a);
        (env.objs.phoneLight as THREE.PointLight).intensity = ring ? 2.2 : 0.5;
      }
    }

    // ---- camera
    this.updateCamera(def, local, now);

    // ---- key light follows focus
    if (env) {
      const dir = this.tmpA.set(...env.pal.keyPos).normalize();
      if (def.env === 'road') dir.set(-0.4, 0.3, 0.9).normalize();
      if (def.env === 'home') dir.set(-0.9, 0.35, 0.1).normalize();
      env.key.target.position.copy(this.look); env.key.position.copy(this.look).addScaledVector(dir, 40);
      env.key.target.updateMatrixWorld();
    }

    // ---- burning creature light
    const bn = def.burn, ba = bn ? this.actors.get(bn.actor) : undefined;
    if (bn && ba && local >= bn.from && local < bn.to && ba.root.visible) {
      this.burnLight.position.set(ba.x, ba.y + 1.6, ba.z); this.burnLight.intensity = 38 * (0.6 + 0.7 * hash(Math.floor(now * 18)));
    } else this.burnLight.intensity = 0;

    // ---- flashlights
    for (const f of this.flashes) {
      const a = this.actors.get(f.actor);
      const on = !!a && a.root.visible && local >= f.from && local < f.to;
      f.spot.visible = on; f.grp.visible = on;
      if (!on || !a) continue;
      const yaw = a.yaw;
      const sway = Math.sin(now * 1.7 + f.from) * 0.12;
      const dirv = this.tmpA.set(Math.sin(yaw + sway), -0.12 + Math.sin(now * 1.3) * 0.05, Math.cos(yaw + sway));
      const origin = this.tmpB.set(a.x, a.y + 1.2 + (a.root.userData.rootY ?? 0), a.z).addScaledVector(dirv, 0.35);
      const stutter = (def.cues.some((c) => c.light === 'flicker' && local >= c.t && local < c.t + (c.d ?? 2)) && hash(Math.floor(now * 14)) < 0.3) ? 0.2 : 1;
      f.spot.position.copy(origin); f.spot.target.position.copy(origin).addScaledVector(dirv, 8); f.spot.target.updateMatrixWorld();
      f.spot.intensity = 80 * f.power * stutter;
      f.grp.position.copy(origin); f.grp.lookAt(f.spot.target.position);
      this.coneMat.opacity = 0.045;
    }

    // adaptive resolution
    this.ftAvg += (Math.min(100, (now - this.lastT) * 1000) - this.ftAvg) * 0.05;
    this.lastT = now; this.ftCount++;
    if (this.ftCount % 90 === 0 && this.quality !== 'low') {
      if (this.ftAvg > 26 && this.dpr > 0.65) { this.dpr = Math.max(0.65, this.dpr - 0.15); this.applySize(); }
      else if (this.ftAvg < 15 && this.dpr < (this.quality === 'high' ? 1.75 : 1.25) && this.dpr < window.devicePixelRatio) { this.dpr = Math.min(this.dpr + 0.1, window.devicePixelRatio); this.applySize(); }
    }
    this.renderer.render(this.scene, this.camera);
  }

  private catchUp(local: number, natural: boolean) {
    const def = this.def!;
    this.audio.setAmb(def.amb ?? {}, natural ? 1.2 : 0.05, true);
    this.audio.setMusic(def.music ?? 'none', def.mvol ?? 1);
    for (const c of def.cues) {
      if (c.t > local) break;
      if (c.amb) this.audio.setAmb(c.amb, 0.01);
      if (c.music) this.audio.setMusic(c.music, c.mvol ?? 1);
    }
  }

  private fireCues(def: SceneDef, from: number, to: number) {
    for (const c of def.cues) {
      if (c.t <= from || c.t > to) continue;
      if (c.sfx) this.audio.sfx(c.sfx, { vol: c.vol, pan: c.pan, lp: c.lp });
      if (c.amb) this.audio.setAmb(c.amb, c.ramp ?? 1.5);
      if (c.music) this.audio.setMusic(c.music, c.mvol ?? 1);
    }
    for (const l of def.lines) if (l.t > from && l.t <= to) this.audio.speak(l);
  }

  private updateActor(a: Actor, local: number, dt: number, now: number) {
    const s = sample(a.def.keys, local);
    let x = s.p[0], z = s.p[1], yaw = s.r, y = s.y;
    if (a.def.rideOn) {
      const h = this.actors.get(a.def.rideOn);
      if (h) { const c = Math.cos(h.yaw), sn = Math.sin(h.yaw); const wx = h.x + x * c + z * sn, wz = h.z - x * sn + z * c; x = wx; z = wz; yaw += h.yaw; y += h.y; }
    }
    const dist = a.first ? 0 : Math.hypot(x - a.x, z - a.z);
    a.x = x; a.y = y; a.z = z; a.yaw = yaw;
    const root = a.root;
    root.visible = s.v === 1;
    root.position.set(x, y, z); root.rotation.y = yaw;
    if (a.car) { a.car.roll(dist); a.first = false; if (a.car.head.intensity > 0) { /* lights on */ } return; }
    const rig = a.rig!;
    const anim = s.a ?? 'idle';
    const cycle = anim === 'run' || anim === 'limp' ? 2.5 : anim === 'sprint' ? 6 : anim === 'stalk' ? 3.2 : 1.4;
    if (anim === 'walk' || anim === 'run' || anim === 'limp' || anim === 'stalk' || anim === 'sprint') a.phase += (dist / cycle) * Math.PI * 2 * s.sp;
    const look = this.resolveLook(s.l, this.tmpC);
    const lookV = look ? a.lookV.copy(look) : null;
    rig.update({ anim, expr: s.e ?? 'neutral', speak: this.speakAmp(a.id, local), look: lookV, u: s.u, t: now, phase: a.phase, snap: a.first, dt });
    root.position.y = y + (root.userData.rootY ?? 0);
    a.first = false;
  }

  private updateCamera(def: SceneDef, local: number, now: number) {
    const shots = def.shots;
    let sh = shots[0];
    for (const s of shots) if (s.t <= local) sh = s;
    const u = Math.min(1, Math.max(0, (local - sh.t) / Math.max(0.01, sh.d)));
    const e = smooth(u);
    const cam = this.camera;
    const p0 = sh.p0;
    // look
    const la = this.resolveLook(sh.l0, this.tmpA) ?? this.tmpA.set(0, 1.4, 0);
    const lookA = this.tmpC.copy(la);
    let lookV = lookA;
    if (sh.l1) { const lb = this.resolveLook(sh.l1, this.tmpB); if (lb) lookV = lookA.lerp(lb, e); }
    this.look.copy(lookV);
    if (sh.p1) lerp3(p0, sh.p1, e, cam.position);
    else { // slow push-in so no frame is ever dead
      cam.position.set(p0[0], p0[1], p0[2]);
      const push = Math.min(0.9, sh.d * 0.07) * u;
      this.tmpB.copy(this.look).sub(cam.position); const L = this.tmpB.length(); if (L > 1) cam.position.addScaledVector(this.tmpB.normalize(), push);
    }
    // shake
    let boost = 0;
    for (const c of def.cues) if (c.shake && local >= c.t && local < c.t + 2.2) boost += c.shake * Math.exp(-(local - c.t) * 3.2);
    const sk = (sh.shake ?? 0) + boost;
    const idle = 0.012;
    const n1 = Math.sin(now * 1.7) + Math.sin(now * 2.9 + 1) * 0.6, n2 = Math.sin(now * 2.3 + 2) + Math.sin(now * 3.7) * 0.6, n3 = Math.sin(now * 1.1 + 4);
    const amp = idle + sk * 0.06, fast = sk > 0.2 ? 1 : 0;
    cam.position.x += n1 * amp + fast * (hash(now * 30) - 0.5) * sk * 0.05;
    cam.position.y += n2 * amp + fast * (hash(now * 31 + 3) - 0.5) * sk * 0.05;
    cam.position.z += n3 * amp * 0.5;
    cam.up.set(0, 1, 0);
    cam.lookAt(this.look);
    cam.rotateZ((sh.roll ?? 0) + n3 * sk * 0.012 + n1 * 0.0015);
    const fov = sh.fov ?? 40;
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld();
  }

  dispose() {
    this.unload(); this.coneGeo.dispose(); this.coneMat.dispose(); this.renderer.dispose();
  }
}
