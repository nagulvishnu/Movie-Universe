import * as THREE from 'three';
import type { EnvOpts } from '../movie/types';
import {
  Builder, PAL, addGround, addMountains, addSky, assemble, baseLights, bulb, fogLayer, hingedDoor, makeDust, makeRain,
  photoPlane, pointLight, scatterTrees, setInterior, type Env,
} from './envCommon';
import { asphaltTex, concreteTex, glowTex, paperTex, photoTex, plankTex, rockTex, signTex, sidingTex } from './textures';

const vSky = (p: { keyPos: number[] }) => new THREE.Vector3(p.keyPos[0], p.keyPos[1], p.keyPos[2]).normalize();

// ------------------------------------------------------------------ FOREST
export function buildForest(o: EnvOpts): Env {
  const b = new Builder();
  const pal = PAL[o.time ?? 'night'];
  const hl = baseLights(b, pal);
  addGround(b, 400, '#262219');
  addSky(b, pal, vSky(pal)); addMountains(b, pal.mount);
  const pathM = b.std(0x3d3225, 1);
  const pg = new THREE.PlaneGeometry(2.4, 400); b.geos.push(pg);
  const path = new THREE.Mesh(pg, pathM); path.rotation.x = -Math.PI / 2; path.position.y = 0.02; path.receiveShadow = true; b.group.add(path);
  const gaps: [number, number, number][] = [[-4.5, -20, 1.6], [4.6, -12, 1.6], [-4.8, -38, 1.6], [4.5, 8, 1.6], [-4.6, 14, 1.6], [4.6, -46, 1.6]];
  const cave = o.caveEntrance ? [4, -34] : null;
  scatterTrees(b, {
    count: 420, seed: 41, x: [-55, 55], z: [-75, 75], dead: 0.16,
    keepOut: (x, z) => Math.abs(x) < 2.4 || gaps.some(([gx, gz, r]) => Math.hypot(x - gx, z - gz) < r) || (cave ? Math.hypot(x - cave[0], z - cave[1]) < 6 : false),
  });
  if (cave) {
    const rm = b.std(0xffffff, 1, rockTex(), { flatShading: true });
    const ig = new THREE.IcosahedronGeometry(1, 1); b.geos.push(ig);
    const pts: [number, number, number, number][] = [[-1.9, 0.9, 0, 1.1], [-2.1, 2.2, 0, 1.2], [-1.2, 3.2, 0, 1.1], [0, 3.6, 0, 1.2], [1.3, 3.2, 0, 1.1], [2.1, 2.2, 0, 1.2], [1.9, 0.9, 0, 1.1], [-3, 2, -2.5, 2.4], [3, 2.4, -2.5, 2.6], [0, 4.2, -2.5, 2.4]];
    pts.forEach(([x, y, z, s]) => { const m = b.mesh(ig, rm, cave[0] + x, y, cave[1] + z); m.scale.set(s, s * 0.9, s); m.rotation.set(x, y, z); });
    b.box(3, 3, 0.2, b.basic(0x000000), cave[0], 1.4, cave[1] - 1.2, 1, b.group, false);
  }
  const fogUpd = fogLayer(b, pal.fog, o.time === 'day' ? 6 : 26, 70, o.time === 'night' || o.time === 'storm' ? 0.2 : 0.14);
  const ups: ((t: number, dt: number, cam: THREE.Camera) => void)[] = [(t) => fogUpd(t)];
  if (o.rain) ups.push(makeRain(b, o.rain));
  return assemble(b, pal, hl, o.fog ?? pal.density, ups);
}

// ------------------------------------------------------------------ ROAD (scrolling)
export function buildRoad(o: EnvOpts): Env {
  const b = new Builder();
  const pal = PAL[o.time ?? 'dusk'];
  const hl = baseLights(b, pal);
  hl.key.position.set(-18, 10, 30); hl.key.shadow.camera.left = -8; hl.key.shadow.camera.right = 8;
  addGround(b, 500, '#2b2a1e'); addMountains(b, pal.mount, 190);
  const tex = asphaltTex().clone(); tex.repeat.set(2, 80); tex.needsUpdate = true; b.keep.push(tex);
  const rg = new THREE.PlaneGeometry(7, 500); b.geos.push(rg);
  const road = new THREE.Mesh(rg, b.std(0xffffff, 0.55, tex)); road.rotation.x = -Math.PI / 2; road.position.y = 0.02; road.receiveShadow = true; b.group.add(road);
  const P = 84;
  const scroll = new THREE.Group(); b.group.add(scroll);
  const tile = new THREE.Group();
  const tb = new Builder();
  const trees = scatterTrees(tb, { count: 75, seed: 12, x: [-48, 48], z: [0, P], dead: 0.1, keepOut: (x) => Math.abs(x) < 5.2 });
  b.geos.push(...tb.geos); b.mats.push(...tb.mats);
  tile.add(trees);
  [-P, 0, P].forEach((z) => { const c = tile.clone(); c.position.z = z; scroll.add(c); });
  const dm = b.basic(0xe8dca0); const dashes = new THREE.Group(); scroll.add(dashes);
  const dg = new THREE.BoxGeometry(0.16, 0.02, 3); b.geos.push(dg);
  for (let i = -20; i < 40; i++) { const d = new THREE.Mesh(dg, dm); d.position.set(0, 0.04, i * 6); dashes.add(d); }
  // low sun glow ahead
  const sm = new THREE.SpriteMaterial({ map: glowTex(), color: 0xffa860, fog: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); b.mats.push(sm);
  const sun = new THREE.Sprite(sm); sun.scale.setScalar(120); sun.position.set(-40, 14, 200); b.group.add(sun);
  const fogUpd = fogLayer(b, pal.fog, 10, 60, 0.12);
  const speed = 16;
  return assemble(b, pal, hl, o.fog ?? pal.density, [(t) => { scroll.position.z = -((t * speed) % P); fogUpd(t); }]);
}

// ------------------------------------------------------------------ GAS STATION
export function buildGas(o: EnvOpts): Env {
  const b = new Builder();
  const pal = PAL[o.time ?? 'dusk'];
  const hl = baseLights(b, pal);
  hl.key.shadow.camera.left = -18; hl.key.shadow.camera.right = 18;
  addGround(b, 500, '#30301f'); addSky(b, pal, vSky(pal)); addMountains(b, pal.mount);
  const conc = b.std(0xffffff, 0.9, concreteTex()), siding = b.std(0xffffff, 0.9, sidingTex('#7a6f58'));
  const tex = asphaltTex().clone(); tex.repeat.set(60, 2); tex.needsUpdate = true; b.keep.push(tex);
  const road = b.box(500, 0.04, 7, b.std(0xffffff, 0.6, tex), 0, 0.02, 14, 0.05, b.group, false);
  const dm = b.basic(0xe8dca0); const dg = new THREE.BoxGeometry(2.4, 0.02, 0.15); b.geos.push(dg);
  for (let i = -30; i < 30; i++) { const d = new THREE.Mesh(dg, dm); d.position.set(i * 6, 0.06, 14); b.group.add(d); }
  void road;
  b.box(24, 0.05, 14, conc, 0, 0.025, 3, 0.25, b.group, false);
  // building
  const H = 3.1;
  b.wall(-5, -3, 5, -3, H, 0.25, siding, [{ c: 2, w: 1.0, y0: 0, y1: 2.1 }, { c: 7.2, w: 3.4, y0: 0.9, y1: 2.3 }]);
  b.wall(5, -3, 5, -9, H, 0.25, siding); b.wall(5, -9, -5, -9, H, 0.25, siding); b.wall(-5, -9, -5, -3, H, 0.25, siding);
  b.box(10.8, 0.25, 6.8, b.std(0x2a2a2c, 1), 0, H + 0.12, -6, 1, b.group);
  b.box(10.8, 0.1, 6.6, b.std(0x777066, 0.9), 0, H - 0.05, -6, 0.2, b.group, false); // ceiling
  b.box(9.7, 0.04, 5.7, b.std(0xffffff, 0.8, concreteTex('#8e897d')), 0, 0.03, -6, 0.3, b.group, false);
  const door = hingedDoor(b, 1.0, 2.1, b.std(0x2d3a33, 0.6), -3.5, -3, 0, 0);
  // sign
  const sg = new THREE.PlaneGeometry(5.2, 1.6); b.geos.push(sg);
  const sign = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: signTex('BLACKWOOD', 'GAS · FOOD · LAST STOP'), fog: false })); b.mats.push(sign.material as THREE.Material);
  sign.position.set(0, 4.35, -2.7); b.group.add(sign);
  b.box(0.12, 1.2, 0.12, b.std(0x222222), -2, 3.7, -2.9); b.box(0.12, 1.2, 0.12, b.std(0x222222), 2, 3.7, -2.9);
  // canopy + pumps
  b.box(11, 0.35, 6, b.std(0xb8b4a8, 0.7), 0, 4.3, 3.6, 1);
  b.box(11, 0.1, 6.05, b.std(0x9a2a24, 0.7), 0, 4.1, 3.6, 1, b.group, false);
  for (const x of [-5, 5]) for (const z of [1, 6.2]) b.box(0.25, 4.2, 0.25, b.std(0xc8c4b8, 0.8), x, 2.1, z);
  for (const x of [-2.5, 2.5]) {
    b.box(0.65, 1.5, 0.5, b.std(0xa42a22, 0.6), x, 0.75, 3.6); b.box(0.5, 0.35, 0.04, b.basic(0x9fe0b0), x, 1.2, 3.86, 1, b.group, false);
  }
  const env0 = { bulbs: [] as Env['bulbs'] };
  for (const x of [-2.5, 2.5]) bulb(b, 0xfff4d8, x, 4.1, 3.6, 0.12, env0);
  const canopyL = pointLight(b, 0xfff0d0, o.time === 'day' ? 0 : 30, 20, 0, 3.6, 3.6);
  // shop interior
  const wood = b.std(0xffffff, 0.8, plankTex('#6a4a2e'));
  b.box(4.2, 1.0, 0.8, wood, 1.5, 0.5, -5.2, 1); b.box(4.3, 0.06, 0.9, b.std(0x2a1e14, 0.5), 1.5, 1.03, -5.2, 1, b.group, false);
  b.box(0.4, 0.3, 0.35, b.std(0x333333, 0.5), 2.8, 1.2, -5.2); b.box(0.3, 0.35, 0.3, b.std(0x222222), 0.7, 1.22, -5.3);
  const gm = b.std(0xffffff, 0.7); const gg = new THREE.BoxGeometry(0.3, 0.28, 0.2); b.geos.push(gg);
  const goods = new THREE.InstancedMesh(gg, gm, 150); const c = new THREE.Color(); const d = new THREE.Object3D();
  let n = 0;
  const shelf = (x0: number, z: number, w: number, ry: number) => {
    for (let r = 0; r < 4; r++) {
      b.box(w, 0.04, 0.5, wood, x0, 0.4 + r * 0.55, z, 1, b.group, false);
      for (let i = 0; i < Math.floor(w / 0.34) && n < 150; i++) {
        d.position.set(x0 - w / 2 + 0.2 + i * 0.34, 0.55 + r * 0.55, z + (Math.sin(i * 3 + r) * 0.04)); d.rotation.y = ry; d.updateMatrix(); goods.setMatrixAt(n, d.matrix);
        c.setHSL((i * 0.13 + r * 0.31) % 1, 0.5, 0.35); goods.setColorAt(n, c); n++;
      }
    }
    b.box(w, 2.4, 0.06, wood, x0, 1.2, z - 0.27, 1, b.group, false);
  };
  shelf(0, -8.6, 9.2, 0); shelf(-2.4, -6.5, 3, 0);
  goods.count = n; b.group.add(goods);
  b.box(1.2, 2.0, 0.7, b.std(0x3a3f44, 0.5), -4.5, 1, -4.4); b.box(1.0, 1.7, 0.03, b.basic(0x8ab4c8), -4.15, 1, -4.4, 1, b.group, false);
  const miss = paperTex('missing');
  [[-4.4, 1.7], [-3.9, 1.5], [-2.2, 1.6]].forEach(([x, y], i) => photoPlane(b, miss, 0.4, 0.5, x, y, -3.14, 0, (i - 1) * 0.1));
  photoPlane(b, miss, 0.7, 0.9, 1.0, 1.9, -8.45, 0, 0.03);
  const pA = photoPlane(b, photoTex('hunterBoy'), 0.4, 0.3, 1.25, 1.075, -5.0); pA.rotation.set(-Math.PI / 2, 0, 0.15); pA.visible = false;
  const pB = photoPlane(b, photoTex('family'), 0.4, 0.3, 1.75, 1.08, -5.0); pB.rotation.set(-Math.PI / 2, 0, -0.1); pB.visible = false;
  const lamp1 = pointLight(b, 0xffe3b0, 16, 14, 0.5, 2.7, -5.4), lamp2 = pointLight(b, 0xffd9a0, 9, 10, -2.5, 2.7, -7.2);
  bulb(b, 0xfff0d0, 0.5, 3.0, -5.4, 0.1, env0); bulb(b, 0xffe8c0, -2.5, 3.0, -7.2, 0.1, env0);
  // sparse trees
  scatterTrees(b, { count: 140, seed: 3, x: [-90, 90], z: [-95, 60], keepOut: (x, z) => (Math.abs(x) < 14 && z > -12 && z < 20) || (z > 10 && z < 18) });
  const dust = makeDust(b, 90, [8, 3, 5], [0, 0.5, -6]);
  const env = assemble(b, pal, hl, o.fog ?? pal.density, [dust], { bulbs: env0.bulbs });
  env.objs.door = door.inner; env.objs.canopy = canopyL; env.objs.photoA = pA; env.objs.photoB = pB;
  setInterior(env, [lamp1, lamp2]);
  return env;
}
