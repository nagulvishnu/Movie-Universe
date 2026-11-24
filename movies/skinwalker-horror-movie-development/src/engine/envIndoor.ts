import * as THREE from 'three';
import type { EnvOpts } from '../movie/types';
import {
  Builder, PAL, addGround, addMountains, addSky, assemble, baseLights, bulb, fogLayer, glassPane, hingedDoor, makeDust, makeRain,
  photoPlane, pointLight, scatterTrees, setInterior, type Env, type Pal,
} from './envCommon';
import { CarRig } from './rig';
import { clockTex, logTex, make, paperTex, photoTex, plankTex, rockTex, shingleTex, sidingTex, type PaperKind, type PhotoKind } from './textures';

const sky = (p: Pal) => new THREE.Vector3(...p.keyPos).normalize();

function winTrim(b: Builder, m: THREE.Material, cx: number, cy: number, cz: number, w: number, h: number, alongX: boolean, th = 0.3, cross = true) {
  const t = 0.07;
  const bx = (sx: number, sy: number, x: number, y: number) => (alongX ? b.box(sx, sy, th, m, cx + x, cy + y, cz, 1, b.group, false) : b.box(th, sy, sx, m, cx, cy + y, cz + x, 1, b.group, false));
  bx(w + 0.14, t, 0, h / 2 + t / 2); bx(w + 0.14, t, 0, -h / 2 - t / 2); bx(t, h, w / 2 + t / 2, 0); bx(t, h, -w / 2 - t / 2, 0);
  if (cross) { bx(w, 0.03, 0, 0); bx(0.03, h, 0, 0); }
}

function chair(b: Builder, m: THREE.Material, x: number, z: number, ry: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; b.group.add(g);
  b.box(0.45, 0.05, 0.45, m, 0, 0.45, 0, 1, g); b.box(0.45, 0.5, 0.05, m, 0, 0.72, -0.2, 1, g);
  for (const sx of [-0.2, 0.2]) for (const sz of [-0.2, 0.2]) b.box(0.04, 0.45, 0.04, m, sx, 0.22, sz, 1, g, false);
  return g;
}

function table(b: Builder, m: THREE.Material, x: number, z: number, w: number, d: number) {
  b.box(w, 0.06, d, m, x, 0.75, z); for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.06, 0.72, 0.06, m, x + sx * (w / 2 - 0.08), 0.36, z + sz * (d / 2 - 0.08), 1, b.group, false);
}

function addCar(b: Builder, env: { cars: CarRig[] }, x: number, z: number, ry: number) {
  const c = new CarRig(false); c.root.position.set(x, 0, z); c.root.rotation.y = ry; b.group.add(c.root); env.cars.push(c);
}

// ------------------------------------------------------------------ CABIN
export function buildCabin(o: EnvOpts): Env {
  const b = new Builder();
  const pal = PAL[o.time ?? 'night'];
  const hl = baseLights(b, pal, true);
  addGround(b, 400, '#262219'); addSky(b, pal, sky(pal)); addMountains(b, pal.mount);
  const logM = b.std(0xffffff, 0.9, logTex()), wood = b.std(0xffffff, 0.85, plankTex('#5b3d24'));
  const roofM = b.std(0xffffff, 0.95, shingleTex(), { side: THREE.DoubleSide }), trim = b.std(0x3a2615, 0.9);
  const stone = b.std(0xffffff, 1, rockTex(), { flatShading: true });
  const H = 2.8;
  b.wall(-4, 3, 4, 3, H, 0.22, logM, [{ c: 6.2, w: 1.0, y0: 0, y1: 2.1 }, { c: 2.2, w: 1.4, y0: 0.9, y1: 2.0 }]);
  b.wall(-4, -3, 4, -3, H, 0.22, logM, [{ c: 6, w: 1.2, y0: 1.0, y1: 2.0 }]);
  b.wall(-4, -3, -4, 3, H, 0.22, logM, [{ c: 3.8, w: 1.4, y0: 0.9, y1: 2.0 }]);
  b.wall(4, -3, 4, 3, H, 0.22, logM, [{ c: 4.8, w: 1.4, y0: 0.9, y1: 2.0 }]);
  winTrim(b, trim, -1.8, 1.45, 3, 1.4, 1.1, true); winTrim(b, trim, 2, 1.5, -3, 1.2, 1.0, true);
  winTrim(b, trim, -4, 1.45, 0.8, 1.4, 1.1, false); winTrim(b, trim, 4, 1.45, 1.8, 1.4, 1.1, false);
  const glass = [glassPane(b, 1.4, 1.1, -1.8, 1.45, 3), glassPane(b, 1.2, 1.0, 2, 1.5, -3), glassPane(b, 1.4, 1.1, -4, 1.45, 0.8, Math.PI / 2), glassPane(b, 1.4, 1.1, 4, 1.45, 1.8, Math.PI / 2)];
  b.box(8.2, 0.1, 6.2, wood, 0, -0.05, 0, 0.6, b.group, false);
  b.box(8.4, 0.1, 6.4, b.std(0xffffff, 0.9, plankTex('#3a2616')), 0, H + 0.05, 0, 0.5, b.group, false);
  const th = Math.atan2(1.5, 3.4), sl = Math.hypot(3.4, 1.5);
  const r1 = b.box(9, 0.14, sl + 0.1, roofM, 0, 3.58, 1.7, 0.5); r1.rotation.x = th;
  const r2 = b.box(9, 0.14, sl + 0.1, roofM, 0, 3.58, -1.7, 0.5); r2.rotation.x = -th;
  for (const sx of [-4.12, 4.12]) {
    const sh = new THREE.Shape(); sh.moveTo(-3.2, 2.8); sh.lineTo(3.2, 2.8); sh.lineTo(0, 4.28); sh.closePath();
    const g = new THREE.ShapeGeometry(sh); b.geos.push(g);
    const m = new THREE.Mesh(g, logM); m.rotation.y = Math.PI / 2; m.position.x = sx; b.group.add(m);
    (logM as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  }
  b.box(1.0, 5.0, 1.4, stone, 4.45, 2.5, -0.5, 0.5);
  b.box(8.6, 0.08, 1.7, b.std(0x4a3320, 0.9, wood.map), 0, 0.04, 3.95, 0.6, b.group, false);
  // fireplace
  b.box(0.7, 1.4, 1.5, stone, 3.55, 0.7, -0.5, 0.5); b.box(0.2, 0.7, 0.9, b.basic(0x050302), 3.2, 0.45, -0.5, 1, b.group, false);
  const fireM = b.basic(0xff7a22); b.box(0.2, 0.25, 0.45, fireM, 3.25, 0.22, -0.5, 1, b.group, false);
  const fire = pointLight(b, 0xff8a3a, 7, 9, 3.1, 0.7, -0.5);
  // beds
  const bedMat = b.std(0x4a5566, 0.95), pill = b.std(0xd0ccc0, 0.9), frame = b.std(0x4a3320, 0.9);
  for (const x of [-3.0, -1.7]) {
    b.box(1.0, 0.3, 2.0, frame, x, 0.15, -1.9); b.box(0.94, 0.16, 1.9, bedMat, x, 0.38, -1.9); b.box(0.5, 0.1, 0.3, pill, x, 0.5, -2.65);
    b.box(0.94, 0.06, 1.1, b.std(x < -2 ? 0x6a3a3a : 0x3a5a4a, 1), x, 0.49, -1.55);
  }
  // couch + table + chairs
  const cg = new THREE.Group(); cg.position.set(-1.6, 0, 0.6); cg.rotation.y = Math.PI / 2; b.group.add(cg);
  const leather = b.std(0x5a3626, 0.8);
  b.box(2.0, 0.42, 0.9, leather, 0, 0.21, 0, 1, cg); b.box(2.0, 0.55, 0.2, leather, 0, 0.7, -0.4, 1, cg);
  b.box(0.2, 0.55, 0.9, leather, -1.0, 0.45, 0, 1, cg); b.box(0.2, 0.55, 0.9, leather, 1.0, 0.45, 0, 1, cg);
  b.mesh(new THREE.CircleGeometry(1.5, 20), b.std(0x5a2a2a, 1), 0.2, 0.012, 0.8).rotation.x = -Math.PI / 2;
  table(b, wood, 1.0, 1.5, 1.6, 0.9);
  const plate = b.std(0xd8d4c8, 0.6); for (const x of [0.6, 1.4]) b.box(0.25, 0.02, 0.25, plate, x, 0.79, 1.5, 1, b.group, false);
  chair(b, wood, 0.5, 2.3, Math.PI); chair(b, wood, 1.5, 2.3, Math.PI); chair(b, wood, 0.5, 0.7, 0); chair(b, wood, 1.5, 0.7, 0);
  // kitchen
  b.box(2.8, 0.9, 0.6, wood, 2.0, 0.45, -2.65); b.box(2.9, 0.05, 0.65, b.std(0x2a2018, 0.6), 2.0, 0.92, -2.65, 1, b.group, false);
  b.box(0.65, 0.04, 0.5, b.std(0x1a1a1a, 0.4), 3.1, 0.96, -2.65, 1, b.group, false);
  const pot = new THREE.CylinderGeometry(0.14, 0.14, 0.16, 12); const potM = b.std(0x777777, 0.4, null, { metalness: 0.6 });
  b.mesh(pot, potM, 3.1, 1.06, -2.65);
  b.box(2.2, 0.04, 0.3, wood, 1.3, 1.9, -2.82, 1, b.group, false);
  for (let i = 0; i < 6; i++) b.mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 8), b.std([0xaa3a2a, 0x3a7a3a, 0xcaa83a][i % 3], 0.7), 0.5 + i * 0.35, 1.99, -2.82);
  const radio = b.box(0.36, 0.2, 0.15, b.std(0x2a2e2a, 0.5), 0.9, 1.05, -2.7); b.box(0.02, 0.5, 0.02, b.std(0x888888, 0.3), 1.04, 1.3, -2.7);
  b.box(0.1, 0.06, 0.01, b.basic(0xff9a3a), 0.82, 1.07, -2.62, 1, b.group, false);
  // stuff lying around
  [[-2.3, 1.9, 0x3a5a3a], [-2.8, 1.4, 0x7a3a2a], [-3.4, 1.0, 0x2a3a5a], [-3.2, 2.2, 0x5a4a2a]].forEach(([x, z, c], i) => b.box(0.5, 0.3 + i * 0.03, 0.35, b.std(c, 0.9), x, 0.15, z));
  // lights
  const lamp = pointLight(b, 0xffd9a0, 12, 14, 0, 2.35, 0.2), lamp2 = pointLight(b, 0xffc890, 4, 7, -3, 2.2, -1.6);
  const envB = { bulbs: [] as Env['bulbs'], cars: [] as CarRig[] };
  bulb(b, 0xffe8c0, 0, 2.55, 0.2, 0.08, envB); bulb(b, 0xffd8a0, -3, 2.45, -1.6, 0.06, envB);
  // exterior props
  b.box(1.2, 0.9, 0.9, b.std(0x5a3a22, 1), 5.4, 0.45, 1.2); b.box(0.7, 0.5, 0.7, b.std(0x4a3320, 1), -5.6, 0.25, 3.2);
  if (!o.noCar) addCar(b, envB, -8.5, 7, -Math.PI / 2);
  if (o.footprints) {
    const fm = b.std(0x1a140d, 1), fg = new THREE.BoxGeometry(0.17, 0.01, 0.46); b.geos.push(fg);
    for (let i = 0; i < 9; i++) {
      const t = i / 8, x = -10.5 + t * 5.6, z = -5 + t * 5.5 + (i % 2 ? 0.28 : -0.28);
      const f = new THREE.Mesh(fg, fm); f.position.set(x, 0.015, z); f.rotation.y = Math.atan2(5.6, 5.5) + (i % 2 ? 0.1 : -0.1); b.group.add(f);
      const toes = new THREE.Mesh(fg, fm); toes.scale.set(1.2, 1, 0.3); toes.position.set(x + Math.sin(f.rotation.y) * 0.3, 0.015, z + Math.cos(f.rotation.y) * 0.3); toes.rotation.y = f.rotation.y; b.group.add(toes);
    }
  }
  const gaps: [number, number, number][] = [[-13, 0.8, 1.8], [13, 1.8, 1.8], [0, -13.5, 1.8], [-9, -9, 1.6], [9, -9, 1.6], [-8, 11, 1.6], [-15, 6, 1.5]];
  scatterTrees(b, {
    count: 430, seed: 19, x: [-55, 55], z: [-55, 60], dead: 0.15,
    keepOut: (x, z) => Math.hypot(x, z) < 10.5 || (Math.abs(x) < 3.2 && z > 0) || gaps.some(([gx, gz, r]) => Math.hypot(x - gx, z - gz) < r),
  });
  const fogUpd = fogLayer(b, pal.fog, o.time === 'day' ? 6 : 24, 60, o.time === 'night' || o.time === 'storm' ? 0.2 : 0.13);
  const dust = makeDust(b, 100, [8, 2.6, 6], [0, 0.2, 0]);
  const ups: ((t: number, dt: number, cam: THREE.Camera) => void)[] = [(t) => fogUpd(t), dust];
  if (o.rain) ups.push(makeRain(b, o.rain));
  const door = hingedDoor(b, 1.0, 2.1, b.std(0x4a3018, 0.8), 1.7, 3, 0, o.doorOpen ?? 0);
  const env = assemble(b, pal, hl, o.fog ?? pal.density, ups, { bulbs: envB.bulbs });
  env.objs.door = door.inner; env.objs.radio = radio; env.fire = fire; env.objs.glassFront = glass[0]; env.objs.glassLeft = glass[2]; env.objs.glassRight = glass[3]; env.objs.glassBack = glass[1];
  setInterior(env, [lamp, lamp2]);
  const od = env.dispose; env.dispose = () => { envB.cars.forEach((c) => c.dispose()); od(); };
  return env;
}

// ------------------------------------------------------------------ HUNTING CABIN
export function buildHunt(o: EnvOpts): Env {
  const b = new Builder();
  const pal = PAL[o.time ?? 'overcast'];
  const hl = baseLights(b, pal, true);
  addGround(b, 400, '#2a2519'); addSky(b, pal, sky(pal)); addMountains(b, pal.mount);
  const logM = b.std(0xa89a8a, 0.95, logTex(), { side: THREE.DoubleSide }), wood = b.std(0xffffff, 0.9, plankTex('#4a3322'));
  const H = 2.4;
  b.wall(-2.5, 2, 2.5, 2, H, 0.2, logM, [{ c: 2.8, w: 0.95, y0: 0, y1: 2.0 }]);
  b.wall(-2.5, -2, 2.5, -2, H, 0.2, logM);
  b.wall(-2.5, -2, -2.5, 2, H, 0.2, logM, [{ c: 2.3, w: 0.9, y0: 0.9, y1: 1.8 }]);
  b.wall(2.5, -2, 2.5, 2, H, 0.2, logM, [{ c: 1.5, w: 0.8, y0: 1.0, y1: 1.8 }]);
  b.box(6, 0.12, 5, b.std(0xffffff, 1, shingleTex(), { side: THREE.DoubleSide }), 0, 2.6, 0, 0.5).rotation.z = 0.06;
  b.box(5.1, 0.1, 4.1, wood, 0, -0.05, 0, 0.6, b.group, false);
  const door = hingedDoor(b, 0.95, 2.0, b.std(0x3a2a1a, 0.9), -0.17, 2, 0, -1.25);
  const old = b.std(0x3a2a1c, 1);
  table(b, old, 0.4, -0.9, 1.5, 0.8);
  // cassette recorder, notebook, lantern, photo
  const rec = b.box(0.24, 0.08, 0.16, b.std(0x222222, 0.5), 0.1, 0.82, -0.9);
  rec.rotation.y = 0.3; const reel = new THREE.CylinderGeometry(0.03, 0.03, 0.01, 10);
  for (const dx of [-0.05, 0.05]) { const r = b.mesh(reel, b.std(0xcccccc, 0.4), 0.1 + dx, 0.87, -0.9); r.rotation.y = 0.3; }
  const nb = b.box(0.17, 0.025, 0.23, b.std(0x4a3320, 0.9), 0.62, 0.79, -0.85); nb.rotation.y = -0.4;
  photoPlane(b, photoTex('hunterBoy'), 0.2, 0.15, 0.2, 0.784, -1.15, 0, 0).rotation.set(-Math.PI / 2, 0, 0.3);
  b.mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 8), b.std(0xcaa050, 0.5, null, { emissive: 0xff9a40, emissiveIntensity: 0.9 }), 0.0, 0.88, -1.1);
  // bunk
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.07, 1.8, 0.07, old, -1.8 + sx * 0.45, 0.9, -1.2 + sz * 0.95, 1, b.group, false);
  b.box(0.95, 0.12, 1.9, b.std(0x3a4044, 1), -1.8, 0.4, -1.2); b.box(0.95, 0.12, 1.9, b.std(0x4a3a30, 1), -1.8, 1.3, -1.2);
  // debris
  [[-0.9, 0.6, 0.4], [-0.3, 0.9, 1.9], [1.2, 0.3, 2.7], [1.6, 1.1, 0.8], [0.4, 1.4, 5.1], [-1.1, -0.3, 4.0]].forEach(([x, z, r]) => { const p = b.box(0.8, 0.05, 0.1, old, x, 0.04, z); p.rotation.y = r; p.rotation.z = 0.1; });
  b.box(0.45, 0.45, 0.05, old, -0.7, 0.2, 0.9).rotation.set(1.2, 0.4, 0.3); chair(b, old, 1.9, 1.3, 2.4).rotation.set(0.6, 2.4, 0);
  b.box(0.5, 0.9, 0.5, b.std(0x1c1c1c, 0.5, null, { metalness: 0.5 }), 2.1, 0.45, -1.6);
  // wall of evidence
  const papers: [PaperKind | PhotoKind, number, number, number][] = [
    ['clipping', -1.9, 1.7, 0.2], ['clipping2', -1.4, 1.5, -0.1], ['drawing', -0.7, 1.65, 0.05], ['misc0', -0.1, 1.9, 0], ['drawing2', 0.4, 1.55, -0.08],
    ['misc1', 1.0, 1.75, 0.15], ['missing', 1.6, 1.55, 0], ['clipping', 2.0, 1.95, -0.2], ['misc2', -1.2, 1.1, 0.1], ['misc3', 0.8, 1.15, -0.1], ['note', 0.0, 1.2, 0.05],
  ];
  papers.forEach(([k, x, y, rz]) => {
    const isPhoto = String(k).startsWith('misc');
    const tex = isPhoto ? photoTex(k as PhotoKind) : paperTex(k as PaperKind);
    photoPlane(b, tex, isPhoto ? 0.34 : 0.3, isPhoto ? 0.26 : 0.38, x, y, -1.88, 0, rz);
  });
  const red = b.basic(0x8a1010);
  [[-1.4, 1.6, 0.4, 1.7, 0.7], [-0.7, 1.7, 1.0, 1.5, 0.5], [0.4, 1.6, 1.6, 1.6, 0.4]].forEach(([x0, y0, x1, y1]) => {
    const L = Math.hypot(x1 - x0, y1 - y0); const s = b.box(L, 0.008, 0.008, red, (x0 + x1) / 2, (y0 + y1) / 2, -1.86, 1, b.group, false); s.rotation.z = Math.atan2(y1 - y0, x1 - x0);
  });
  const lan = pointLight(b, 0xffa458, 5.5, 8, 0, 1.1, -1.0);
  const dust = makeDust(b, 70, [4, 2, 3], [0, 0.4, 0]);
  const gaps: [number, number, number][] = [[-8, 6, 1.5], [8, 5, 1.5], [3, -9, 1.5]];
  scatterTrees(b, { count: 380, seed: 77, x: [-50, 50], z: [-50, 55], keepOut: (x, z) => Math.hypot(x, z) < 5.5 || (Math.abs(x - 0.3) < 1.9 && z > 0 && z < 22) || gaps.some(([gx, gz, r]) => Math.hypot(x - gx, z - gz) < r) });
  const fogUpd = fogLayer(b, pal.fog, 20, 50, 0.13);
  const ups: ((t: number, dt: number, cam: THREE.Camera) => void)[] = [(t) => fogUpd(t), dust];
  if (o.rain) ups.push(makeRain(b, o.rain));
  const env = assemble(b, pal, hl, o.fog ?? pal.density, ups);
  env.objs.door = door.inner; env.objs.notebook = nb; setInterior(env, [lan]);
  return env;
}

// ------------------------------------------------------------------ RANGER STATION
export function buildRanger(o: EnvOpts): Env {
  const b = new Builder();
  const pal = PAL[o.time ?? 'night'];
  const hl = baseLights(b, pal, true);
  addGround(b, 400, '#262219'); addSky(b, pal, sky(pal)); addMountains(b, pal.mount);
  const sid = b.std(0xffffff, 0.9, sidingTex('#5d6e5f')), wood = b.std(0xffffff, 0.85, plankTex('#4a3524')), old = b.std(0x3a2a1c, 1);
  const H = 2.6;
  b.wall(-2.5, 2, 2.5, 2, H, 0.2, sid, [{ c: 3.7, w: 1.0, y0: 0, y1: 2.1 }, { c: 1.3, w: 1.0, y0: 1.0, y1: 2.0 }]);
  b.wall(-2.5, -2, 2.5, -2, H, 0.2, sid);
  b.wall(-2.5, -2, -2.5, 2, H, 0.2, sid, [{ c: 2, w: 0.9, y0: 1.0, y1: 1.9 }]);
  b.wall(2.5, -2, 2.5, 2, H, 0.2, sid, [{ c: 1.5, w: 0.9, y0: 1.0, y1: 1.9 }]);
  b.box(5.8, 0.14, 4.8, b.std(0x3a342e, 1), 0, H + 0.1, 0, 1);
  b.box(5.1, 0.1, 4.1, wood, 0, -0.05, 0, 0.6, b.group, false);
  const glass = glassPane(b, 1.0, 1.0, -1.2, 1.5, 2);
  if (o.windowBroken) glass.visible = false;
  const boards = (x: number, y: number, z: number, w: number, alongX: boolean) => {
    for (let i = 0; i < 4; i++) { const p = alongX ? b.box(w + 0.3, 0.14, 0.05, old, x, y - 0.35 + i * 0.25, z + 0.12) : b.box(0.05, 0.14, w + 0.3, old, x + 0.12 * (x < 0 ? 1 : -1), y - 0.35 + i * 0.25, z); p.rotation.z = alongX ? (i - 1.5) * 0.03 : 0; }
  };
  boards(-2.5, 1.45, 0, 0.9, false); boards(2.5, 1.45, -0.5, 0.9, false);
  const door = hingedDoor(b, 1.0, 2.1, b.std(0x3a3a30, 0.8), 0.7, 2, 0, 0);
  b.box(1.6, 0.06, 0.7, old, 0, 0.78, -1.55); b.box(1.5, 0.75, 0.6, old, 0, 0.38, -1.55);
  const radio = b.box(0.4, 0.22, 0.2, b.std(0x2a2e2a, 0.5), -0.4, 0.92, -1.6);
  radio.rotation.y = 0.2; b.box(0.08, 0.08, 0.02, b.basic(0x40ff70), -0.52, 0.94, -1.5);
  const flareG = b.box(0.22, 0.09, 0.05, b.std(0xc4301a, 0.5), 0.3, 0.84, -1.5); flareG.rotation.y = 0.5;
  b.box(0.12, 0.05, 0.05, b.std(0xc4301a, 0.5), 0.34, 0.8, -1.5);
  b.box(0.7, 1.9, 0.4, old, -2.1, 0.95, -1.7); for (let i = 0; i < 4; i++) b.box(0.6, 0.18, 0.3, b.std(0x5a4a30, 1), -2.1, 0.3 + i * 0.5, -1.65);
  b.box(0.8, 0.3, 1.8, b.std(0x3a4a50, 1), 1.9, 0.28, -1.0);
  photoPlane(b, paperTex('note'), 0.5, 0.65, -1.0, 1.7, -1.89, 0, 0);
  if (o.barricade) {
    const t = b.box(1.5, 0.08, 0.8, old, 1.2, 0.75, 1.35); t.rotation.set(0.0, 0.3, 0);
    b.box(0.9, 1.9, 0.4, old, 0.5, 0.95, 1.45).rotation.z = 0.08; b.box(0.5, 0.5, 0.5, b.std(0x5a4a30, 1), 1.8, 0.25, 1.0);
  }
  const lan = pointLight(b, 0xffa458, 5, 8, 0, 1.4, -0.4);
  b.mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 8), b.std(0xcaa050, 0.5, null, { emissive: 0xff9a40, emissiveIntensity: 0.9 }), 0.0, 0.9, -1.55);
  const dust = makeDust(b, 60, [4, 2, 3], [0, 0.4, 0]);
  const gaps: [number, number, number][] = [[-4, 9, 1.5], [5, 10, 1.5], [-6, -6, 1.4]];
  scatterTrees(b, { count: 430, seed: 5, x: [-50, 50], z: [-50, 55], dead: 0.15, keepOut: (x, z) => Math.hypot(x, z) < 6 || (Math.abs(x - 1) < 2.2 && z > 0 && z < 20) || gaps.some(([gx, gz, r]) => Math.hypot(x - gx, z - gz) < r) });
  const fogUpd = fogLayer(b, pal.fog, 24, 60, 0.2);
  const ups: ((t: number, dt: number, cam: THREE.Camera) => void)[] = [(t) => fogUpd(t), dust];
  if (o.rain) ups.push(makeRain(b, o.rain));
  const env = assemble(b, pal, hl, o.fog ?? pal.density, ups);
  env.objs.door = door.inner; env.objs.glass = glass; env.objs.flare = flareG; setInterior(env, [lan]);
  return env;
}

// ------------------------------------------------------------------ CAVE
const markTex = () => make('marks', 256, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(225,220,205,0.8)'; c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath(); for (let i = 0; i < 90; i++) { const a = i * 0.25, r = 4 + i * 1.1; c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } c.stroke();
  for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(20 + i * 8, 20); c.lineTo(24 + i * 8, 52); c.stroke(); }
  c.beginPath(); c.arc(60, 210, 10, 0, 7); c.moveTo(60, 220); c.lineTo(60, 250); c.moveTo(60, 228); c.lineTo(30, 245); c.moveTo(60, 228); c.lineTo(88, 245); c.stroke();
}, false);

export function buildCave(o: EnvOpts): Env {
  const b = new Builder();
  const pal: Pal = { ...PAL.night, bg: 0x010203, fog: 0x030507, density: 0.06, hemiSky: 0x202838, hemiGround: 0x08080a, hemiI: 0.22, keyI: 0, exposure: 1.25, stars: false, moon: false };
  const hl = baseLights(b, pal); hl.key.castShadow = false;
  const rm = b.std(0xffffff, 1, rockTex(), { flatShading: true });
  const ig = new THREE.IcosahedronGeometry(1, 1); b.geos.push(ig);
  const rocks: [number, number, number, number, number, number][] = []; // x y z sx sy sz
  const rr = (s: number) => { const x = Math.sin(s * 91.7) * 43758.5; return x - Math.floor(x); };
  for (let z = 8, i = 0; z > -12.5; z -= 1.1, i++) {
    rocks.push([-2.7 - rr(i) * 0.6, 1.2, z, 1.1 + rr(i + 3) * 0.5, 1.7, 1.0]); rocks.push([2.7 + rr(i + 7) * 0.6, 1.2, z, 1.1 + rr(i + 9) * 0.5, 1.7, 1.0]);
    rocks.push([(rr(i + 20) - 0.5) * 2.2, 3.1 + rr(i + 5) * 0.4, z, 1.3, 1.1, 1.0]);
  }
  const C = -19;
  for (let i = 0; i < 20; i++) {
    const th = (i / 20) * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(th), Math.cos(th)) - Math.PI / 2) < 0.34 && false) continue;
    const x = Math.cos(th) * 8.0, z = C + Math.sin(th) * 8.0;
    if (z > -13 && Math.abs(x) < 2.6) continue;
    rocks.push([x, 1.2, z, 2.5, 2.4, 2.5]); rocks.push([x, 4.4, z, 2.4, 1.8, 2.4]);
  }
  for (let i = 0; i < 14; i++) rocks.push([Math.cos(i * 2.4) * (i % 4) * 1.2, 4.6, C + Math.sin(i * 2.4) * (i % 4) * 1.2, 2.6, 1.5, 2.6]);
  const inst = new THREE.InstancedMesh(ig, rm, rocks.length); const d = new THREE.Object3D();
  rocks.forEach((r, i) => { d.position.set(r[0], r[1], r[2]); d.scale.set(r[3], r[4], r[5]); d.rotation.set(rr(i) * 3, rr(i + 1) * 6, rr(i + 2) * 3); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); });
  inst.frustumCulled = false; b.group.add(inst);
  const ft = rockTex().clone(); ft.repeat.set(10, 18); ft.needsUpdate = true; b.keep.push(ft);
  const fg = new THREE.PlaneGeometry(14, 40); b.geos.push(fg);
  const floor = new THREE.Mesh(fg, b.std(0x777777, 1, ft)); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -10); floor.receiveShadow = true; b.group.add(floor);
  b.box(14, 0.2, 40, b.std(0x050505), 0, 5.7, -10, 1, b.group, false);
  // belongings
  const mk = (c: number, r = 0.8) => b.std(c, r);
  const cols = [0x6b4a3a, 0x3a5a6b, 0x8a8a3a, 0x7a3a6b, 0x2a2a2a, 0xb0a070, 0x9a3a2a];
  const boxG = new THREE.BoxGeometry(1, 1, 1); b.geos.push(boxG); const sphG = new THREE.SphereGeometry(1, 10, 8); b.geos.push(sphG);
  const torG = new THREE.TorusGeometry(1, 0.2, 6, 14); b.geos.push(torG);
  const place = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0) => {
    const o2 = new THREE.Mesh(g, m); o2.position.set(x, y, z); o2.scale.set(sx, sy, sz); o2.rotation.y = ry; o2.castShadow = true; o2.receiveShadow = true; b.group.add(o2); return o2;
  };
  for (let i = 0; i < 34; i++) {
    const a = rr(i * 3 + 1) * Math.PI * 2, rad = 1.2 + rr(i * 3 + 2) * 4.2;
    let x = Math.cos(a) * rad, z = C + Math.sin(a) * rad; if (i % 5 === 0) { x = (rr(i) - 0.5) * 2.4; z = -3 - rr(i + 4) * 8; }
    const kind = i % 6, ry = rr(i + 9) * 6;
    if (kind === 0) { place(torG, b.std(0xc0b090, 0.3, null, { metalness: 0.8 }), x, 0.02, z, 0.03, 0.03, 0.03).rotation.x = Math.PI / 2; place(boxG, mk(0x1a1a1a), x, 0.02, z, 0.025, 0.01, 0.02); }
    else if (kind === 1 || kind === 2) { place(boxG, mk(0x1d1a18), x, 0.06, z, 0.11, 0.05, 0.28, ry); place(boxG, mk(cols[i % 7]), x, 0.12, z - 0.02, 0.1, 0.07, 0.16, ry); place(boxG, mk(0x1d1a18), x + 0.2, 0.06, z + 0.05, 0.11, 0.05, 0.28, ry + 0.3); }
    else if (kind === 3) { place(sphG, mk(0x8a6a4a, 1), x, 0.12, z, 0.13, 0.15, 0.1, ry); place(sphG, mk(0x8a6a4a, 1), x, 0.3, z, 0.09, 0.09, 0.09); place(sphG, mk(0x6a4a2a, 1), x + 0.07, 0.38, z, 0.03, 0.03, 0.03); place(sphG, mk(0x6a4a2a, 1), x - 0.07, 0.38, z, 0.03, 0.03, 0.03); }
    else if (kind === 4) { place(boxG, mk(cols[i % 7]), x, 0.05, z, 0.1, 0.1, 0.1, ry); place(boxG, mk(cols[(i + 2) % 7]), x + 0.12, 0.05, z + 0.03, 0.1, 0.1, 0.1, ry + 0.4); place(boxG, mk(cols[(i + 4) % 7]), x + 0.06, 0.15, z + 0.02, 0.1, 0.1, 0.1, ry); }
    else { place(boxG, mk(0xcfc8b0), x, 0.006, z, 0.17, 0.006, 0.11, ry); place(boxG, mk(0x3a5a8a), x, 0.011, z, 0.05, 0.003, 0.08, ry); }
  }
  // wall markings + photographs
  const marks = new THREE.MeshBasicMaterial({ map: markTex(), transparent: true, depthWrite: false, opacity: 0.8 }); b.mats.push(marks);
  const mg = new THREE.PlaneGeometry(1.6, 1.6); b.geos.push(mg);
  for (let i = 0; i < 9; i++) {
    const th = 0.7 + i * 0.6; if (Math.sin(th) < -0.78) continue; // keep the back wall clear for the photo board
    const m = new THREE.Mesh(mg, marks); m.position.set(Math.cos(th) * 5.45, 1.6 + (i % 3) * 0.5, C + Math.sin(th) * 5.45); m.rotation.y = Math.atan2(-Math.cos(th), -Math.sin(th)); b.group.add(m);
  }
  const kinds: PhotoKind[] = ['misc0', 'misc1', 'misc2', 'misc3', 'misc4', 'misc5'];
  for (let i = 0; i < 16; i++) {
    const th = 0.5 + i * 0.37; const R = 5.35;
    const px = Math.cos(th) * R, pz = C + Math.sin(th) * R; if (pz < -23.2 && Math.abs(px) < 3.4) continue;
    photoPlane(b, photoTex(kinds[i % 6]), 0.45, 0.34, px, 1.2 + (i % 4) * 0.35, pz, Math.atan2(-Math.cos(th), -Math.sin(th)), (rr(i) - 0.5) * 0.3, 0.25);
  }
  const pk = photoPlane(b, photoTex('four'), 0.62, 0.465, 0, 1.55, -24.3, 0, 0, 0.28);
  pk.visible = o.photos !== 'five';
  if (o.photos === 'five') {
    (['four', 'four2', 'four3', 'four4'] as PhotoKind[]).forEach((k, i) => photoPlane(b, photoTex(k), 0.62, 0.465, -1.55 + i * 0.72, 1.55, -24.3, 0, ((i % 2) - 0.5) * 0.04, 0.3));
    photoPlane(b, photoTex('adam'), 0.62, 0.465, 1.75, 1.5, -24.3, 0, -0.03, 0.55);
  }
  photoPlane(b, photoTex('four'), 0.2, 0.15, -1.6, 0.3, -24.6, 0, 0.1, 0.0).visible = false;
  const dim = pointLight(b, 0x6a84b8, o.photos === 'five' ? 3.2 : 4, 14, 0, 3.2, -18);
  const dust = makeDust(b, 120, [10, 4, 20], [0, 0.5, -12], 0xaab8d0);
  const env = assemble(b, pal, hl, pal.density, [dust]);
  env.objs.photo = pk; setInterior(env, [dim]);
  return env;
}

// ------------------------------------------------------------------ HOME (post-credit)
export function buildHome(o: EnvOpts): Env {
  const b = new Builder();
  const pal: Pal = { ...PAL.night, hemiI: 0.28, keyI: 1.0, keyPos: [-22, 9, 3], fog: 0x05070b, bg: 0x03040a, density: 0.0 };
  const hl = baseLights(b, pal, true);
  hl.key.shadow.camera.left = -8; hl.key.shadow.camera.right = 8; hl.key.shadow.camera.top = 8; hl.key.shadow.camera.bottom = -8;
  const wall = b.std(0x6f6c78, 0.95), wood = b.std(0xffffff, 0.8, plankTex('#4a3626')), W = 2.7;
  // real room shell (x -3..3, z -2.5..2.5); mirrored room continues beyond front wall, z 2.5..7.5
  b.wall(-3, 2.5, 3, 2.5, W, 0.2, wall, [{ c: 2.4, w: 1.7, y0: 0.5, y1: 2.4 }]);
  b.wall(-3, -2.5, 3, -2.5, W, 0.2, wall); b.wall(-3, -2.5, -3, 2.5, W, 0.2, wall, [{ c: 3, w: 1.2, y0: 1.0, y1: 2.1 }]); b.wall(3, -2.5, 3, 2.5, W, 0.2, wall);
  b.box(6.2, 0.1, 5.2, wood, 0, -0.05, 0, 0.6, b.group, false); b.box(6.2, 0.1, 5.2, b.std(0x8a8890, 1), 0, W + 0.05, 0, 0.4, b.group, false);
  const mw = b.std(0x4e5668, 0.95);
  b.wall(-3, 7.5, 3, 7.5, W, 0.2, mw); b.wall(-3, 2.5, -3, 7.5, W, 0.2, mw); b.wall(3, 2.5, 3, 7.5, W, 0.2, mw);
  b.box(6.2, 0.1, 5.2, wood, 0, -0.05, 5, 0.6, b.group, false); b.box(6.2, 0.1, 5.2, b.std(0x6a7082, 1), 0, W + 0.05, 5, 0.4, b.group, false);
  const gold = b.std(0x7a6030, 0.5, null, { metalness: 0.5 });
  const mcx = -0.6; b.box(1.9, 0.1, 0.16, gold, mcx, 2.45, 2.45, 1, b.group, false); b.box(1.9, 0.1, 0.16, gold, mcx, 0.45, 2.45, 1, b.group, false);
  b.box(0.1, 2.0, 0.16, gold, mcx - 0.9, 1.45, 2.45, 1, b.group, false); b.box(0.1, 2.0, 0.16, gold, mcx + 0.9, 1.45, 2.45, 1, b.group, false);
  glassPane(b, 1.7, 1.9, mcx, 1.45, 2.5);
  const curt = b.std(0x3a2a40, 1, null, { side: THREE.DoubleSide });
  b.box(0.06, 1.7, 0.5, curt, -2.88, 1.5, 0.05, 1, b.group, false); b.box(0.06, 1.7, 0.5, curt, -2.88, 1.5, 1.0, 1, b.group, false);
  // furniture (real + mirrored copy)
  const furnish = (flip: boolean) => {
    const zz = (z: number) => (flip ? 5 - z : z);
    const frame = b.std(0x3a2a20, 0.9), bedM = b.std(flip ? 0x3a4258 : 0x4a5a78, 0.95), pill = b.std(0xd0ccd8, 0.9);
    b.box(1.9, 0.35, 2.1, frame, -1.0, 0.175, zz(-1.35)); b.box(1.8, 0.2, 2.0, bedM, -1.0, 0.45, zz(-1.35));
    b.box(0.5, 0.1, 0.3, pill, -1.5, 0.6, zz(-2.2)); b.box(0.5, 0.1, 0.3, pill, -0.5, 0.6, zz(-2.2));
    b.box(1.85, 0.08, 1.2, b.std(0x5a3a4a, 1), -1.0, 0.57, zz(-1.0));
    b.box(0.5, 0.55, 0.45, frame, 0.35, 0.275, zz(-2.15));
    if (!flip) b.box(1.2, 2.2, 0.6, frame, 2.4, 1.1, -1.9);
  };
  furnish(false); furnish(true);
  const phoneScreen = b.basic(0x1a2a3a);
  b.box(0.08, 0.012, 0.15, b.std(0x111111, 0.4), 0.35, 0.57, -2.1); const scr = b.box(0.07, 0.004, 0.13, phoneScreen, 0.35, 0.58, -2.1, 1, b.group, false);
  const ck = new THREE.PlaneGeometry(0.34, 0.17); b.geos.push(ck);
  const clockMat = new THREE.MeshBasicMaterial({ map: clockTex(o.clock ?? '2:13') }); b.mats.push(clockMat);
  const cm = new THREE.Mesh(ck, clockMat); cm.position.set(0.5, 0.7, -2.0); cm.rotation.y = -0.35; b.group.add(cm);
  b.box(0.36, 0.19, 0.06, b.std(0x111111), 0.5, 0.7, -2.05).rotation.y = -0.35;
  const phoneLight = pointLight(b, 0x8fd0ff, 0.6, 3.5, 0.35, 0.8, -2.1);
  const clockLight = pointLight(b, 0xff2a1a, 0.5, 3, 0.5, 0.8, -1.9);
  const mirrorLight = pointLight(b, 0x6a88b8, 11, 10, -0.6, 2.2, 5.0);
  const dust = makeDust(b, 60, [5, 2.4, 4], [0, 0.2, 0], 0xb8c8e8);
  const env = assemble(b, pal, hl, 0.0, [dust]);
  env.objs.phoneScreen = scr; env.objs.phoneLight = phoneLight; env.objs.clockLight = clockLight; env.objs.mirrorLight = mirrorLight;
  setInterior(env, []);
  return env;
}
