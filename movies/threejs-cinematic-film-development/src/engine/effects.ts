// Reusable environmental effects: rain, dust, wind-blown debris, embers/sparks, fire, lightning.
import * as THREE from 'three';
import type { FxSpec, V3 } from '../story/types';
import { TIME, WIND } from './props';

const PVS = `uniform vec3 uBox; uniform vec3 uCam; uniform float uTime; uniform vec3 uVel; uniform float uSize; uniform float uAlpha; uniform float uSwirl; uniform float uScale;
attribute vec3 aSeed; varying float vA; varying vec3 vC;
void main(){
  vec3 p = aSeed*uBox + uVel*uTime*(0.6+aSeed.x*0.8);
  p.x += sin(uTime*0.7+aSeed.y*20.)*uSwirl; p.z += cos(uTime*0.6+aSeed.z*20.)*uSwirl; p.y += sin(uTime*0.5+aSeed.x*30.)*uSwirl*0.5;
  p = mod(p - uCam + uBox*0.5, uBox) - uBox*0.5;
  vec4 mv = viewMatrix * vec4(uCam + p, 1.0);
  gl_Position = projectionMatrix*mv;
  float d = length(p);
  gl_PointSize = clamp(uSize*uScale/max(0.1,-mv.z)*(0.5+aSeed.z), 1.0, 40.0);
  vA = uAlpha*(1.0-smoothstep(0.35,0.5, d/length(uBox)))*smoothstep(0.3,1.2,d);
  vC = vec3(0.7+aSeed.y*0.3);
}`;
const PFS = `uniform vec3 uColor; varying float vA; varying vec3 vC;
void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(uColor*vC, vA*(1.0-d*2.0)); }`;

const EVS = `uniform vec3 uOrigin; uniform float uTime; uniform float uSize; uniform float uSpread; uniform float uRise; uniform float uRate; uniform float uScale; uniform float uAlpha;
attribute vec3 aSeed; varying float vA;
void main(){
  float life = fract(uTime*uRate*(0.5+aSeed.x)+aSeed.y);
  vec3 p = uOrigin + vec3((aSeed.x-0.5)*uSpread,0.0,(aSeed.z-0.5)*uSpread) + vec3(sin(life*6.0+aSeed.x*20.0)*0.25*uSpread + (aSeed.z-0.5)*life*uRise*0.8, life*uRise*(0.5+aSeed.z), cos(life*5.0+aSeed.z*20.0)*0.25*uSpread);
  vec4 mv = viewMatrix*vec4(p,1.0);
  gl_Position = projectionMatrix*mv;
  gl_PointSize = clamp(uSize*uScale/max(0.1,-mv.z)*(1.0-life*0.6), 1.0, 30.0);
  vA = uAlpha*(1.0-life)*(0.6+0.4*sin(uTime*30.0+aSeed.x*90.0));
}`;
const EFS = `uniform vec3 uColor; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(uColor, vA*(1.0-d*2.0)); }`;

const RVS = `uniform vec3 uBox; uniform vec3 uCam; uniform float uTime; uniform vec3 uVel; uniform float uAlpha; attribute vec3 aSeed; attribute float aEnd; varying float vA;
void main(){
  vec3 p = aSeed*uBox + uVel*uTime*(0.85+aSeed.x*0.3);
  p = mod(p - uCam + uBox*0.5, uBox) - uBox*0.5;
  vec3 w = uCam + p - normalize(uVel)*0.8*aEnd;
  gl_Position = projectionMatrix*viewMatrix*vec4(w,1.0);
  vA = uAlpha*(0.35+0.65*aSeed.y)*(1.0-aEnd*0.7);
}`;
const RFS = `varying float vA; void main(){ gl_FragColor = vec4(0.72,0.8,0.88, vA); }`;

function seeds(n: number) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < a.length; i++) a[i] = Math.random();
  return a;
}

class Particles {
  points: THREE.Points; u: Record<string, { value: unknown }>;
  constructor(n: number, box: V3, color: number, size: number, swirl: number, additive = false) {
    const g = new THREE.BufferGeometry(); const s = seeds(n);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(s, 3));
    this.u = {
      uBox: { value: new THREE.Vector3(...box) }, uCam: { value: new THREE.Vector3() }, uTime: TIME, uVel: { value: new THREE.Vector3() },
      uSize: { value: size }, uAlpha: { value: 0 }, uSwirl: { value: swirl }, uScale: { value: 800 }, uColor: { value: new THREE.Color(color) },
    };
    this.points = new THREE.Points(g, new THREE.ShaderMaterial({ vertexShader: PVS, fragmentShader: PFS, uniforms: this.u, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
    this.points.frustumCulled = false; this.points.visible = false;
  }
  set(cam: THREE.Vector3, alpha: number, vel: V3, scale: number) {
    this.points.visible = alpha > 0.005;
    (this.u.uCam.value as THREE.Vector3).copy(cam); this.u.uAlpha.value = alpha; (this.u.uVel.value as THREE.Vector3).set(...vel); this.u.uScale.value = scale;
  }
}

class Emitter {
  points: THREE.Points; u: Record<string, { value: unknown }>;
  constructor(n: number, color: number, size: number, spread: number, rise: number, rate: number) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seeds(n), 3));
    this.u = { uOrigin: { value: new THREE.Vector3() }, uTime: TIME, uSize: { value: size }, uSpread: { value: spread }, uRise: { value: rise }, uRate: { value: rate }, uScale: { value: 800 }, uAlpha: { value: 1 }, uColor: { value: new THREE.Color(color) } };
    this.points = new THREE.Points(g, new THREE.ShaderMaterial({ vertexShader: EVS, fragmentShader: EFS, uniforms: this.u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.points.frustumCulled = false; this.points.visible = false;
  }
}

export function flashLevel(times: number[] | undefined, t: number) {
  if (!times) return 0;
  let f = 0;
  for (const s of times) {
    const d = t - s;
    if (d < 0 || d > 1.4) continue;
    let v = 0;
    if (d < 0.07) v = 1; else if (d < 0.13) v = 0.15; else if (d < 0.26) v = 0.9; else v = 0.5 * Math.exp(-(d - 0.26) * 4.5);
    f = Math.max(f, v);
  }
  return f;
}

export class EffectsManager {
  group = new THREE.Group();
  private rain: THREE.LineSegments; private rainU: Record<string, { value: unknown }>;
  private dust = new Particles(520, [26, 14, 26], 0xd8d2c0, 0.028, 0.5);
  private debris = new Particles(70, [40, 16, 40], 0x9a8a66, 0.11, 1.4);
  private embers = new Emitter(70, 0xff8a30, 0.05, 0.35, 2.6, 0.5);
  private sparks = new Emitter(60, 0xffe6a0, 0.04, 0.2, 1.6, 1.8);
  private fireGroup = new THREE.Group();
  private flames: THREE.Mesh[] = [];
  fireLight = new THREE.PointLight(0xff8a3a, 0, 14, 1.8);
  private fx: FxSpec = {};

  constructor(scene: THREE.Scene) {
    const n = 2600, g = new THREE.BufferGeometry(), s = seeds(n), sd = new Float32Array(n * 6), en = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) { for (let k = 0; k < 2; k++) { sd[i * 6 + k * 3] = s[i * 3]; sd[i * 6 + k * 3 + 1] = s[i * 3 + 1]; sd[i * 6 + k * 3 + 2] = s[i * 3 + 2]; en[i * 2 + k] = k; } }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 3)); g.setAttribute('aEnd', new THREE.BufferAttribute(en, 1));
    this.rainU = { uBox: { value: new THREE.Vector3(34, 26, 34) }, uCam: { value: new THREE.Vector3() }, uTime: TIME, uVel: { value: new THREE.Vector3(-3, -24, -1) }, uAlpha: { value: 0 } };
    this.rain = new THREE.LineSegments(g, new THREE.ShaderMaterial({ vertexShader: RVS, fragmentShader: RFS, uniforms: this.rainU, transparent: true, depthWrite: false }));
    this.rain.frustumCulled = false; this.rain.visible = false;
    const fm = new THREE.MeshBasicMaterial({ color: 0xff9a3a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.16 - i * 0.03, 0.55 - i * 0.1, 7), i ? new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }) : fm); c.position.y = 0.3; this.flames.push(c); this.fireGroup.add(c); }
    this.fireGroup.visible = false; this.fireGroup.add(this.fireLight); this.fireLight.position.y = 0.7;
    this.group.add(this.rain, this.dust.points, this.debris.points, this.embers.points, this.sparks.points, this.fireGroup);
    scene.add(this.group);
  }
  set(fx: FxSpec | undefined) { this.fx = fx ?? {}; }

  /** returns lightning flash level */
  update(t: number, cam: THREE.PerspectiveCamera, height: number) {
    const fx = this.fx, wind = fx.wind ?? 0.3;
    WIND.value = wind;
    const scale = (height * 0.5) / Math.tan((cam.fov * Math.PI) / 360);
    const w = wind;
    const rain = fx.rain ?? 0;
    this.rain.visible = rain > 0.01; this.rainU.uAlpha.value = rain * 0.55; (this.rainU.uCam.value as THREE.Vector3).copy(cam.position);
    (this.rainU.uVel.value as THREE.Vector3).set(-2 - w * 10, -24, -1 - w * 3);
    this.dust.set(cam.position, (fx.dust ?? 0) * 0.5, [0.06 + w * 0.5, 0.02, 0.04 + w * 0.2], scale);
    this.debris.set(cam.position, (fx.debris ?? 0) * 0.9, [1 + w * 7, 0.2, 0.5 + w * 3], scale);
    const e = fx.embers, sp = fx.sparks, fr = fx.fire;
    this.embers.points.visible = !!(e ?? fr);
    if (e || fr) { (this.embers.u.uOrigin.value as THREE.Vector3).set(...((e ?? fr) as V3)); this.embers.u.uScale.value = scale; }
    this.sparks.points.visible = !!sp;
    if (sp) { (this.sparks.u.uOrigin.value as THREE.Vector3).set(...sp); this.sparks.u.uScale.value = scale; }
    this.fireGroup.visible = !!fr;
    if (fr) {
      this.fireGroup.position.set(fr[0], fr[1], fr[2]);
      const fl = 0.85 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29.3) * 0.08 + Math.sin(t * 7.1) * 0.06;
      this.flames.forEach((c, i) => { c.scale.set(1 + Math.sin(t * 13 + i) * 0.1, fl * (1.1 - i * 0.15), 1 + Math.cos(t * 11 + i) * 0.1); c.rotation.y = t * 2 + i; });
      this.fireLight.intensity = 14 * fl;
    } else this.fireLight.intensity = 0;
    return flashLevel(fx.lightning, t);
  }
  dispose() {
    this.group.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); if (m.material) (m.material as THREE.Material).dispose(); });
  }
}
