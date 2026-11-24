// Per-scene lighting presets + procedural sky dome (gradient, clouds, sun/moon, stars) and the light rig.
import * as THREE from 'three';
import type { LightSpec, V3 } from '../story/types';
import { TIME } from './props';

export interface Preset {
  skyTop: number; skyHorizon: number; skyBottom: number; fog: number; fogD: number;
  sun: number; sunI: number; sunDir: V3; hemiSky: number; hemiGnd: number; hemiI: number; amb: number; ambI: number;
  exposure: number; stars: number; cloud: number; cloudDark: number; sunDisc: number; fill: number;
}

const base: Preset = {
  skyTop: 0x4d8fe0, skyHorizon: 0xbfd9f0, skyBottom: 0x8a8374, fog: 0xc4d6e6, fogD: 0.004,
  sun: 0xfff1d6, sunI: 3, sunDir: [0.5, 0.7, 0.4], hemiSky: 0xbfd9ff, hemiGnd: 0x8a8374, hemiI: 0.9, amb: 0xffffff, ambI: 0.05,
  exposure: 1, stars: 0, cloud: 0.35, cloudDark: 0, sunDisc: 1, fill: 0,
};
const P = (o: Partial<Preset>): Preset => ({ ...base, ...o });

export const PRESETS: Record<string, Preset> = {
  dayAlive: P({}),
  dayWarm: P({ skyTop: 0x5a96d8, skyHorizon: 0xf2dcc0, fog: 0xe8dcc8, sunI: 3.2, sunDir: [0.7, 0.45, 0.3], sun: 0xffe2b0 }),
  dayRuined: P({ skyTop: 0x5f8fa8, skyHorizon: 0xc2cfc4, skyBottom: 0x6e7360, fog: 0xb6c4be, fogD: 0.0065, sun: 0xffe4b0, sunI: 2.5, hemiI: 0.8, cloud: 0.55 }),
  overcast: P({ skyTop: 0x6c7780, skyHorizon: 0xa3acb0, skyBottom: 0x5f635f, fog: 0x9aa3a6, fogD: 0.011, sun: 0xdde4ea, sunI: 0.9, hemiI: 1.0, cloud: 0.95, cloudDark: 0.4, sunDisc: 0 }),
  dusk: P({ skyTop: 0x2f3f6e, skyHorizon: 0xff9a5a, skyBottom: 0x3a2a30, fog: 0xd08a62, fogD: 0.0065, sun: 0xff8a3d, sunI: 2.8, sunDir: [-0.8, 0.16, 0.45], hemiSky: 0xffb084, hemiGnd: 0x3c3040, hemiI: 0.75, cloud: 0.5 }),
  sunrise: P({ skyTop: 0x35527a, skyHorizon: 0xffb27a, skyBottom: 0x6a5a5a, fog: 0xe3b894, fogD: 0.0045, sun: 0xffa860, sunI: 2.4, sunDir: [0.85, 0.1, 0.25], hemiSky: 0xffc9a0, hemiGnd: 0x4b4a50, hemiI: 0.8, cloud: 0.5, exposure: 1.05 }),
  night: P({ fill: 1.1, skyTop: 0x050914, skyHorizon: 0x16213a, skyBottom: 0x07090f, fog: 0x0b1220, fogD: 0.011, sun: 0x8aa6dc, sunI: 0.75, sunDir: [-0.3, 0.6, -0.4], hemiSky: 0x2b3b66, hemiGnd: 0x0e1118, hemiI: 0.6, stars: 1, cloud: 0.15, exposure: 1.15, sunDisc: 0.6 }),
  storm: P({ fill: 2.6, skyTop: 0x161c24, skyHorizon: 0x56626a, skyBottom: 0x2c3236, fog: 0x4a555c, fogD: 0.017, sun: 0x9fb0c0, sunI: 0.6, hemiSky: 0x8a9aa6, hemiGnd: 0x3a4044, hemiI: 1.2, exposure: 1.3, cloud: 1, cloudDark: 0.85, sunDisc: 0 }),
  interiorDark: P({ fill: 2.6, skyTop: 0x050607, skyHorizon: 0x050607, skyBottom: 0x050607, fog: 0x07090a, fogD: 0.03, sunI: 0, hemiSky: 0x4a5560, hemiGnd: 0x1a1c20, hemiI: 0.55, exposure: 1.25, cloud: 0, sunDisc: 0 }),
  interiorDim: P({ fill: 3.2, skyTop: 0x0a0c0e, skyHorizon: 0x0a0c0e, skyBottom: 0x0a0c0e, fog: 0x0e1012, fogD: 0.018, sunI: 0, hemiSky: 0x60666c, hemiGnd: 0x2a2c2e, hemiI: 0.55, exposure: 1.15, cloud: 0, sunDisc: 0 }),
  interiorDay: P({ fill: 1.2, skyTop: 0x4d8fe0, skyHorizon: 0xbfd9f0, fog: 0x3a3d3c, fogD: 0.012, sun: 0xffe7b8, sunI: 2.2, sunDir: [0.4, 0.8, -0.2], hemiSky: 0x8a9aa0, hemiGnd: 0x3a3a36, hemiI: 0.55, exposure: 1.05 }),
  facility: P({ fill: 3.2, skyTop: 0x030706, skyHorizon: 0x030706, skyBottom: 0x030706, fog: 0x06100f, fogD: 0.03, sunI: 0, hemiSky: 0x5a9a8a, hemiGnd: 0x1a2a26, hemiI: 1.1, exposure: 1.3, cloud: 0, sunDisc: 0 }),
  black: P({ skyTop: 0x000000, skyHorizon: 0x000000, skyBottom: 0x000000, fog: 0x000000, fogD: 0.02, sunI: 0, hemiI: 0.04, cloud: 0, sunDisc: 0 }),
};


export function L(p: string, o?: Partial<Preset>, to?: Partial<Preset>): LightSpec { return { p, o, to }; }

const SKY_VS = `varying vec3 vDir;
void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }`;
const SKY_FS = `varying vec3 vDir;
uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sunCol; uniform vec3 sunDir;
uniform float time; uniform float cloud; uniform float cloudDark; uniform float sunDisc; uniform float flash;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.03+7.1; a*=.5; } return v; }
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = h>0. ? mix(hor, top, pow(h, 0.45)) : mix(hor, bot, pow(-h, 0.35));
  vec3 sd3 = normalize(sunDir); float sd = max(dot(d, sd3), 0.);
  col += sunCol * (pow(sd, 6.)*0.22 + pow(sd, 400.)*sunDisc*3.0);
  if (h > 0.0 && cloud > 0.01) {
    vec2 uv = d.xz/(h+0.3)*1.3 + vec2(time*0.012, time*0.005);
    float n = fbm(uv*1.6);
    float cov = smoothstep(0.62 - cloud*0.3, 0.9 - cloud*0.12, n) * smoothstep(0.0, 0.18, h);
    vec3 cc = mix(hor*1.1 + vec3(0.1), top*0.55 + vec3(0.02), cloudDark) + sunCol*pow(sd, 3.)*0.35*(1.-cloudDark);
    col = mix(col, cc, cov*(0.55+0.45*cloud));
    col += vec3(0.55,0.65,0.9)*flash*(0.25 + cov);
  } else { col += vec3(0.5,0.6,0.85)*flash*0.3; }
  gl_FragColor = vec4(col, 1.0);
}`;

export class LightRig {
  sun = new THREE.DirectionalLight(0xffffff, 1);
  hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  amb = new THREE.AmbientLight(0xffffff, 0.05);
  spot = new THREE.SpotLight(0xfff0d0, 0, 26, 0.38, 0.65, 1.6);
  fillL = new THREE.PointLight(0xffe6cc, 0, 9, 1.5);
  dome: THREE.Mesh; stars: THREE.Points;
  private from = PRESETS.dayAlive; private to = PRESETS.dayAlive; private fromO = false;
  private ca = new THREE.Color(); private cb = new THREE.Color();
  private skyU: Record<string, { value: unknown }>;

  constructor(private scene: THREE.Scene, private renderer: THREE.WebGLRenderer) {
    const s = this.sun;
    s.castShadow = true; s.shadow.mapSize.set(2048, 2048);
    const sc = s.shadow.camera; sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26; sc.near = 1; sc.far = 140;
    s.shadow.bias = -0.0004; s.shadow.normalBias = 0.04;
    scene.add(s, s.target, this.hemi, this.amb, this.spot, this.spot.target, this.fillL);
    this.skyU = {
      top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sunCol: { value: new THREE.Color() },
      sunDir: { value: new THREE.Vector3() }, time: TIME, cloud: { value: 0 }, cloudDark: { value: 0 }, sunDisc: { value: 1 }, flash: { value: 0 },
    };
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: this.skyU, side: THREE.BackSide, depthWrite: false, fog: false }));
    this.dome.frustumCulled = false; this.dome.renderOrder = -2;
    const n = 900, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = Math.sqrt(1 - u * u);
      pos[i * 3] = Math.cos(a) * r * 900; pos[i * 3 + 1] = Math.abs(u) * 900 * 0.95 + 20; pos[i * 3 + 2] = Math.sin(a) * r * 900;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 2.2, sizeAttenuation: false, transparent: true, depthWrite: false, fog: false }));
    this.stars.frustumCulled = false; this.stars.renderOrder = -1;
    scene.add(this.dome, this.stars);
    scene.fog = new THREE.FogExp2(0xffffff, 0.005);
  }

  private resolve(name: string, o?: Record<string, unknown>): Preset {
    return { ...(PRESETS[name] ?? PRESETS.dayAlive), ...(o as Partial<Preset>) };
  }
  set(spec: LightSpec) {
    this.from = this.resolve(spec.p, spec.o);
    this.to = spec.to ? this.resolve(spec.p, { ...spec.o, ...spec.to }) : this.from;
    this.fromO = !!spec.to;
  }

  private col(k: keyof Preset, u: number, out: THREE.Color) {
    this.ca.set(this.from[k] as number);
    if (this.fromO) { this.cb.set(this.to[k] as number); this.ca.lerp(this.cb, u); }
    return out.copy(this.ca);
  }
  private num(k: keyof Preset, u: number) { const a = this.from[k] as number; return this.fromO ? a + ((this.to[k] as number) - a) * u : a; }

  apply(u: number, flash: number, focus: THREE.Vector3, cam: THREE.Camera, flashlightOn: boolean) {
    const uu = u * u * (3 - 2 * u);
    const U = this.skyU as Record<string, { value: THREE.Color & THREE.Vector3 & number }>;
    this.col('skyTop', uu, U.top.value); this.col('skyHorizon', uu, U.hor.value); this.col('skyBottom', uu, U.bot.value);
    const sunC = this.col('sun', uu, new THREE.Color());
    U.sunCol.value.copy(sunC);
    const sd = this.fromO ? this.from.sunDir.map((v, i) => v + (this.to.sunDir[i] - v) * uu) : this.from.sunDir;
    const dir = new THREE.Vector3(sd[0], sd[1], sd[2]).normalize();
    (U.sunDir.value as THREE.Vector3).copy(dir);
    (U.cloud as { value: number }).value = this.num('cloud', uu); (U.cloudDark as { value: number }).value = this.num('cloudDark', uu);
    (U.sunDisc as { value: number }).value = this.num('sunDisc', uu); (U.flash as { value: number }).value = flash;
    this.dome.position.copy(cam.position); this.stars.position.copy(cam.position);
    const stars = this.num('stars', uu); this.stars.visible = stars > 0.02; (this.stars.material as THREE.PointsMaterial).opacity = stars;
    const fog = this.scene.fog as THREE.FogExp2;
    this.col('fog', uu, fog.color); fog.density = this.num('fogD', uu) * (1 + flash * 0.2);
    this.sun.color.copy(sunC);
    const sunI = this.num('sunI', uu);
    this.sun.intensity = sunI + flash * 0.4; this.sun.visible = sunI > 0.02;
    this.sun.target.position.copy(focus); this.sun.position.copy(focus).addScaledVector(dir, 70);
    this.col('hemiSky', uu, this.hemi.color); this.col('hemiGnd', uu, this.hemi.groundColor);
    this.hemi.intensity = this.num('hemiI', uu) + flash * 1.1;
    this.col('amb', uu, this.amb.color); this.amb.intensity = this.num('ambI', uu) + flash * 1.6;
    this.renderer.toneMappingExposure = this.num('exposure', uu);
    this.renderer.setClearColor(U.bot.value, 1);
    this.spot.intensity = flashlightOn ? 55 : 0;
    this.fillL.position.copy(cam.position); this.fillL.intensity = this.num('fill', uu) * (1 + flash * 0.3);
  }
  dispose() {
    this.dome.geometry.dispose(); (this.dome.material as THREE.Material).dispose(); this.stars.geometry.dispose(); (this.stars.material as THREE.Material).dispose();
    this.sun.shadow.map?.dispose();
  }
}
