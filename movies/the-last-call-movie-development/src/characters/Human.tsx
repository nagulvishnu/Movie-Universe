import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stage, getActor } from "../movie/stage";
import type { ActorId, ArmPose, CLine, Emotion, Pose } from "../movie/types";
import { CAST, FACES, type Face } from "./cast";
import { photoTexture } from "../env/kit";

const L1 = 0.29;
const L2 = 0.27;
const DOWN = new THREE.Vector3(0, -1, 0);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const angDiff = (a: number, b: number) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

// shared geometry (created once, reused by every character)
const G = {
  sphere: new THREE.SphereGeometry(1, 16, 12),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  box: new THREE.BoxGeometry(1, 1, 1),
  caps: new THREE.CapsuleGeometry(0.15, 0.36, 4, 12),
  hemi: new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  cap: new THREE.SphereGeometry(0.115, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
  capRec: new THREE.SphereGeometry(0.115, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.42),
  beard: new THREE.SphereGeometry(0.108, 18, 10, 0, Math.PI * 2, Math.PI * 0.69, Math.PI * 0.31),
};

const POSE: Record<Pose, { hipY: number; hip: number; knee: number; lean: number }> = {
  stand: { hipY: 0.92, hip: 0, knee: 0, lean: 0 },
  walk: { hipY: 0.92, hip: 0, knee: 0, lean: 0.02 },
  run: { hipY: 0.9, hip: 0, knee: 0, lean: 0.2 },
  sit: { hipY: 0.5, hip: -1.5, knee: 1.5, lean: 0 },
  drive: { hipY: 0.5, hip: -1.38, knee: 1.45, lean: -0.04 },
  crouch: { hipY: 0.52, hip: -1.5, knee: 2.3, lean: 0.35 },
  lie: { hipY: 0.92, hip: 0, knee: 0, lean: 0 },
};

const VOW: Record<string, number> = { a: 0.95, e: 0.6, i: 0.45, o: 0.85, u: 0.65, y: 0.4, m: 0, b: 0, p: 0, " ": 0.08 };

interface State {
  smile: number; tilt: number; browY: number; lid: number; open: number; pitch: number; roll: number;
  lean: number; hipY: number; hip: number; knee: number; lie: number; mouth: number; tears: number; asym: number;
  yaw: number; hy: number; hp: number; gx: number; gy: number; lastScene: number; seed: number; tremble: number; lastPhoto: string;
  handL: THREE.Vector3; handR: THREE.Vector3;
}

const tmp = {
  S: new THREE.Vector3(), a: new THREE.Vector3(), pv: new THREE.Vector3(), E: new THREE.Vector3(), H: new THREE.Vector3(),
  d1: new THREE.Vector3(), d2: new THREE.Vector3(), q1: new THREE.Quaternion(), q2: new THREE.Quaternion(), tg: new THREE.Vector3(),
  pole: new THREE.Vector3(),
};

function solveArm(sx: number, target: THREE.Vector3, side: number, upper: THREE.Object3D, fore: THREE.Object3D) {
  const { S, a, pv, E, H, d1, d2, q1, q2, pole } = tmp;
  S.set(side * sx, 0.5, 0);
  a.subVectors(target, S);
  let d = a.length();
  d = clamp(d, 0.09, L1 + L2 - 0.006);
  a.normalize();
  const x = (d * d + L1 * L1 - L2 * L2) / (2 * d);
  const r = Math.sqrt(Math.max(0, L1 * L1 - x * x));
  pole.set(side * 0.75, -1, -0.45);
  pv.copy(pole).addScaledVector(a, -pole.dot(a)).normalize();
  E.copy(S).addScaledVector(a, x).addScaledVector(pv, r);
  H.copy(S).addScaledVector(a, d);
  d1.subVectors(E, S).normalize();
  q1.setFromUnitVectors(DOWN, d1);
  upper.quaternion.copy(q1);
  d2.subVectors(H, E).normalize();
  q2.setFromUnitVectors(DOWN, d2);
  fore.quaternion.copy(q1.clone().invert().multiply(q2));
}

/** Hand targets in spine space (origin = hips, +y up, +z forward, +x = character's left). */
function armTarget(out: THREE.Vector3, side: number, arm: ArmPose, T: number, ph: number, speaking: boolean, seed: number) {
  const s = side;
  switch (arm) {
    case "lap": out.set(s * 0.17, 0.07, 0.3); break;
    case "ear": if (s < 0) out.set(-0.125, 0.69, 0.0); else out.set(0.26, -0.04, 0.03); break;
    case "steer": out.set(s * 0.2, 0.34, 0.5); break;
    case "desk": out.set(s * 0.14, 0.27 + Math.sin(T * 9 + s) * 0.004, 0.4); break;
    case "cover": out.set(s * 0.045, 0.75, 0.13); break;
    case "hold": out.set(s < 0 ? -0.08 : 0.08, 0.4, 0.32); break;
    case "point": if (s < 0) out.set(-0.13, 0.55, 0.5); else out.set(0.26, -0.04, 0.03); break;
    case "think": if (s < 0) out.set(-0.05, 0.68, 0.12); else out.set(0.08, 0.3, 0.2); break;
    case "cross": out.set(-s * 0.1, 0.27, 0.19); break;
    case "brace": out.set(s * 0.2, 0.5, 0.44); break;
    case "run": out.set(s * 0.2, 0.3, Math.sin(ph + (s > 0 ? Math.PI : 0)) * 0.3); break;
    default:
      out.set(s * 0.26, -0.04, 0.03 + (ph ? Math.sin(ph + (s > 0 ? Math.PI : 0)) * 0.24 : 0));
  }
  if (speaking && (arm === "rest" || arm === "lap")) {
    const k = s < 0 ? 1 : 0.5;
    out.x += (s < 0 ? 0.0 : 0.02) + Math.sin(T * 2.3 + seed) * 0.04 * k;
    out.y = 0.2 + k * (0.1 + Math.sin(T * 3.1 + seed) * 0.08) + (arm === "lap" ? -0.05 : 0);
    out.z = 0.28 + k * Math.sin(T * 2.7 + seed * 2) * 0.1;
  }
}

function activeLine(face: ActorId, T: number): CLine | null {
  const sh = stage.shot;
  if (!sh) return null;
  for (const l of sh.lines) if (l.face === face && T >= l.start && T < l.end) return l;
  return null;
}

export function Human({ id }: { id: ActorId }) {
  const c = CAST[id];
  const R = useRef<Record<string, THREE.Object3D | null>>({});
  const reg = (k: string) => (o: THREE.Object3D | null) => {
    R.current[k] = o;
  };
  const S = useRef<State>({
    smile: 0, tilt: 0, browY: 0, lid: 0.1, open: 0, pitch: 0, roll: 0, lean: 0, hipY: 0.92, hip: 0, knee: 0, lie: 0, mouth: 0,
    tears: 0, asym: 0, yaw: 0, hy: 0, hp: 0, gx: 0, gy: 0, lastScene: -1, tremble: 0, lastPhoto: "",
    seed: id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) % 17,
    handL: new THREE.Vector3(0.26, -0.04, 0.03), handR: new THREE.Vector3(-0.26, -0.04, 0.03),
  });

  const m = useMemo(() => {
    const std = (color: string, rough = 0.75, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    return {
      skin: std(c.skin, 0.62), hair: std(c.hair, 0.55), cloth: std(c.top, 0.9), cloth2: std(c.top2, 0.85), pants: std(c.pants, 0.9),
      shoes: std(c.shoes, 0.5), white: std("#e9e4dc", 0.3), iris: std(c.eye, 0.25), lip: std(c.lip, 0.5),
      beard: std(c.beard ?? c.hair, 0.9), dark: new THREE.MeshBasicMaterial({ color: "#150808" }),
      bag: new THREE.MeshBasicMaterial({ color: "#3b2630", transparent: true, opacity: 0.18 + c.bags * 0.22 }),
      wrinkle: new THREE.MeshBasicMaterial({ color: "#5a4034", transparent: true, opacity: 0.4 }),
      tear: new THREE.MeshBasicMaterial({ color: "#bcd8ff", transparent: true, opacity: 0.8 }),
      phone: new THREE.MeshStandardMaterial({ color: "#0b0c10", roughness: 0.3, metalness: 0.6 }),
      screen: new THREE.MeshBasicMaterial({ color: "#7fb5ff" }),
      bake: std("#1b1b1d", 0.4, 0.5),
    };
  }, [id, c]);

  const photoMat = useMemo(() => new THREE.MeshBasicMaterial({ map: photoTexture("siblings"), side: THREE.DoubleSide }), []);

  useFrame((_, dtRaw) => {
    const r = R.current;
    const root = r.root;
    if (!root) return;
    const shot = stage.shot;
    const spec = shot?.actors[id];
    if (!shot || !spec) {
      root.visible = false;
      return;
    }
    root.visible = true;
    root.rotation.order = "YXZ";
    const s = S.current;
    const dt = Math.min(dtRaw, 0.05);
    const T = stage.t;
    const snap = s.lastScene !== shot.sceneIdx;
    s.lastScene = shot.sceneIdx;
    const k = (rate: number) => (snap ? 1 : 1 - Math.exp(-rate * dt));

    // ---- placement ----
    const u = clamp((T - shot.start) / shot.dur, 0, 1);
    const p = spec.p;
    const to = spec.to;
    const px = to ? lerp(p[0], to[0], u) : p[0];
    const py = to ? lerp(p[1], to[1], u) : p[1];
    const pz = to ? lerp(p[2], to[2], u) : p[2];
    let dist = 0;
    let heading = spec.ryTo !== undefined ? lerp(spec.ry, spec.ry + angDiff(spec.ry, spec.ryTo), u) : spec.ry;
    const moving = spec.pose === "walk" || spec.pose === "run";
    if (to) {
      const dx = to[0] - p[0];
      const dz = to[2] - p[2];
      dist = Math.hypot(dx, dz);
      if (dist > 0.3 && moving) heading = Math.atan2(dx, dz);
    }
    s.yaw += angDiff(s.yaw, heading) * k(9);
    const stride = spec.pose === "run" ? 1.15 : 0.75;
    const phase = moving ? (dist > 0.3 ? (u * dist) / stride * Math.PI : (T - shot.start) * 3.4) : 0;
    const amp = spec.pose === "run" ? 0.95 : 0.5;

    // ---- emotion & speech ----
    const line = activeLine(id, T);
    const emo: Emotion = line && line.em !== "neutral" ? line.em : spec.em;
    const f: Face = FACES[emo];
    s.smile += (f.smile - s.smile) * k(5);
    s.tilt += (f.tilt - s.tilt) * k(4);
    s.browY += (f.browY - s.browY) * k(5);
    s.lid += (f.lid - s.lid) * k(5);
    s.open += (f.open - s.open) * k(6);
    s.pitch += (f.pitch - s.pitch) * k(3);
    s.roll += (f.roll - s.roll) * k(3);
    s.tears += (f.tears - s.tears) * k(2);
    s.asym += (f.asym - s.asym) * k(4);
    s.tremble += (f.tremble - s.tremble) * k(2);
    let mTarget = 0;
    if (line) {
      const pr = (T - line.start) / (line.end - line.start);
      const idx = Math.floor(clamp((pr - 0.06) / 0.86, 0, 0.999) * line.text.length);
      const ch = line.text[idx].toLowerCase();
      mTarget = (VOW[ch] ?? (/[.,…?!—-]/.test(ch) ? 0 : 0.3)) * (line.fx === "whisper" ? 0.45 : 0.8);
      mTarget *= 0.75 + 0.25 * Math.sin(T * 17 + s.seed);
    }
    s.mouth += (mTarget - s.mouth) * k(30);

    // ---- pose ----
    const pb = POSE[spec.pose];
    s.hipY += (pb.hipY - s.hipY) * k(7);
    s.hip += (pb.hip - s.hip) * k(7);
    s.knee += (pb.knee - s.knee) * k(7);
    s.lean += (pb.lean + f.lean + c.stoop - s.lean) * k(4);
    s.lie += ((spec.pose === "lie" ? 1 : 0) - s.lie) * k(3);
    const breath = Math.sin(T * 1.7 + s.seed) * (0.6 + s.tremble * 0.7);
    const trem = s.tremble * (Math.sin(T * 37 + s.seed) * 0.5 + Math.sin(T * 53) * 0.5);

    root.position.set(px, py, pz);
    root.rotation.y = s.yaw;
    root.rotation.x = -Math.PI / 2 * s.lie;
    const hips = r.hips!;
    const bob = moving ? Math.abs(Math.cos(phase)) * (spec.pose === "run" ? 0.05 : 0.025) : Math.sin(T * 0.8 + s.seed) * 0.003;
    hips.position.y = s.hipY + bob;
    hips.rotation.y = moving ? Math.sin(phase) * 0.08 : 0;
    const sw = moving ? Math.sin(phase) * amp : 0;
    r.hipL!.rotation.x = s.hip + sw;
    r.hipR!.rotation.x = s.hip - sw;
    r.kneeL!.rotation.x = s.knee + (moving ? (0.1 + Math.max(0, Math.cos(phase))) * amp * 1.2 : 0);
    r.kneeR!.rotation.x = s.knee + (moving ? (0.1 + Math.max(0, -Math.cos(phase))) * amp * 1.2 : 0);

    // ---- look ----
    let lx = 0;
    let lz = 1;
    let ly = 0;
    let hasLook = false;
    const look = spec.look;
    if (look && spec.pose !== "lie") {
      const tg = tmp.tg;
      if (Array.isArray(look)) tg.set(look[0], look[1], look[2]);
      else tg.copy(getActor(look).head);
      const dx = tg.x - px;
      const dz = tg.z - pz;
      lx = dx * Math.cos(s.yaw) - dz * Math.sin(s.yaw);
      lz = dx * Math.sin(s.yaw) + dz * Math.cos(s.yaw);
      ly = tg.y - (py + s.hipY + 0.78 * c.scale);
      hasLook = true;
    }
    const idleY = Math.sin(T * 0.37 + s.seed) * 0.12 + Math.sin(T * 0.91) * 0.04;
    const idleP = Math.sin(T * 0.29 + s.seed * 2) * 0.04;
    let ty = hasLook ? clamp(Math.atan2(lx, lz), -1.3, 1.3) : idleY;
    let tp = hasLook ? clamp(Math.atan2(-ly, Math.hypot(lx, lz)), -0.6, 0.6) : idleP;
    if (moving) {
      ty *= 0.3;
      tp *= 0.3;
    }
    s.hy += (ty - s.hy) * k(5);
    s.hp += (tp - s.hp) * k(5);

    const spine = r.spine!;
    spine.rotation.x = s.lean + breath * 0.008;
    spine.rotation.y = s.hy * 0.22 + (moving ? -Math.sin(phase) * 0.1 : 0);
    spine.rotation.z = trem * 0.01;
    spine.scale.set(1 + breath * 0.008, 1 + breath * 0.01, 1 + breath * 0.02);

    const head = r.head!;
    const speakNod = line ? Math.sin(T * 3.3 + s.seed) * 0.035 + Math.sin(T * 1.7) * 0.02 : 0;
    head.rotation.set(s.hp * 0.8 * (1 - 0.0) + s.pitch + speakNod - s.lean * 0.5 + trem * 0.01, s.hy * 0.78 + trem * 0.01, s.roll + trem * 0.012, "YXZ");

    // eyes
    const eyeYaw = clamp(s.hy * 0.22 + Math.sin(T * 1.3 + s.seed) * 0.03, -0.45, 0.45);
    const eyePit = clamp(s.hp * 0.2, -0.3, 0.3);
    (["eyeL", "eyeR"] as const).forEach((n) => r[n]!.rotation.set(eyePit, eyeYaw, 0));
    const ph1 = (T * 0.31 + s.seed * 0.137) % 1;
    const ph2 = (T * 0.19 + s.seed * 0.291 + 0.5) % 1;
    const blink = ph1 < 0.06 ? Math.sin((ph1 / 0.06) * Math.PI) : ph2 < 0.045 ? Math.sin((ph2 / 0.045) * Math.PI) : 0;
    const cl = clamp(s.lid + blink * (1 - clamp(s.lid, 0, 1)) , -0.8, 1);
    const lidAng = clamp(-0.72 + cl * 2.3, -1.4, 1.58);
    (["lidL", "lidR"] as const).forEach((n) => (r[n]!.rotation.x = lidAng));
    // brows
    const by = 0.168 + s.browY * 0.014;
    r.browL!.position.y = by + s.asym * 0.008;
    r.browR!.position.y = by;
    r.browL!.rotation.z = -s.tilt * 0.45 + s.asym * 0.2;
    r.browR!.rotation.z = s.tilt * 0.45;
    // mouth
    const open = clamp(s.open + s.mouth, 0, 1);
    r.lipL!.rotation.z = s.smile * 0.5 - 0.02;
    r.lipR!.rotation.z = -s.smile * 0.5 + 0.02;
    const mo = r.mouthO!;
    mo.scale.set(0.017 + open * 0.006, open * 0.026, 0.01);
    mo.position.y = -open * 0.012 - 0.001;
    mo.visible = open > 0.04;
    r.lipL!.position.y = open * -0.001;
    // tears
    const tearOn = s.tears > 0.2;
    r.tearL!.visible = tearOn;
    r.tearR!.visible = tearOn;
    if (tearOn) {
      const dr = (T * 0.35) % 1;
      r.tearL!.position.y = 0.105 - dr * 0.06;
      r.tearR!.position.y = 0.105 - ((dr + 0.5) % 1) * 0.06;
    }

    // ---- arms (IK) ----
    let arm: ArmPose = spec.arms ?? (spec.pose === "run" ? "run" : spec.pose === "drive" ? "steer" : spec.pose === "sit" ? "lap" : "rest");
    const hand = spec.hand ?? "none";
    if (!spec.arms) {
      if (hand === "phone" || hand === "handset") arm = "ear";
      else if (hand === "photo" || hand === "folder" || hand === "torch") arm = "hold";
    }
    const speaking = !!line && arm !== "ear";
    const apm = arm === "rest" && moving ? phase : spec.pose === "run" ? phase : 0;
    const kk = k(11);
    (
      [
        [1, tmp.tg, s.handL, "upL", "foreL"],
        [-1, tmp.tg, s.handR, "upR", "foreR"],
      ] as const
    ).forEach(([side, tg, cur, un, fn]) => {
      armTarget(tg, side, arm, T, apm, speaking, s.seed);
      tg.x += trem * 0.004;
      tg.y += trem * 0.004;
      cur.lerp(tg, kk);
      solveArm(c.shoulder, cur, side, r[un]!, r[fn]!);
    });

    const pk = String(stage.st.photo ?? "siblings");
    if (S.current.lastPhoto !== pk) {
      S.current.lastPhoto = pk;
      photoMat.map = photoTexture(pk);
      photoMat.needsUpdate = true;
    }
    // items in the right hand
    r.itPhone!.visible = hand === "phone";
    r.itPhoto!.visible = hand === "photo";
    r.itHandset!.visible = hand === "handset";
    r.itTorch!.visible = hand === "torch";
    r.itFolder!.visible = hand === "folder";

    // ---- publish for camera / props ----
    root.updateMatrixWorld(true);
    const rt = getActor(id);
    rt.root.set(px, py, pz);
    rt.yaw = s.yaw;
    r.head!.getWorldPosition(rt.head);
    rt.head.y += 0.02;
    r.item!.getWorldPosition(rt.hand);
  }, -1);

  const sh = c.shoulder;
  const hairCap = c.hairStyle === "grey" ? G.capRec : G.cap;
  const longHair = c.hairStyle === "long" || c.hairStyle === "mid";
  const limbs = (side: number) => (
    <group key={`arm${side}`} ref={reg(side > 0 ? "upL" : "upR")} position={[side * sh, 0.5, 0]}>
      <mesh geometry={G.cyl} material={m.cloth} position={[0, -0.145, 0]} scale={[0.047, 0.29, 0.047]} castShadow />
      <mesh geometry={G.sphere} material={m.cloth} scale={0.05} position={[0, -0.29, 0]} />
      <group ref={reg(side > 0 ? "foreL" : "foreR")} position={[0, -L1, 0]}>
        <mesh geometry={G.cyl} material={m.cloth} position={[0, -0.135, 0]} scale={[0.041, 0.27, 0.041]} castShadow />
        <mesh geometry={G.sphere} material={m.skin} position={[0, -0.285, 0.005]} scale={[0.038, 0.05, 0.026]} />
        {side < 0 && (
          <group ref={reg("item")} position={[0, -0.29, 0]}>
            <group ref={reg("itPhone")} position={[0.03, -0.03, 0.02]} rotation={[0, 0, 0]}>
              <mesh geometry={G.box} material={m.phone} scale={[0.07, 0.145, 0.012]} />
              <mesh geometry={G.box} material={m.screen} scale={[0.06, 0.125, 0.002]} position={[0, 0, 0.007]} />
              <mesh geometry={G.box} material={m.screen} scale={[0.06, 0.125, 0.002]} position={[0, 0, -0.007]} />
            </group>
            <group ref={reg("itPhoto")} position={[0, -0.04, 0.04]} rotation={[-0.4, 0, 0]}>
              <mesh geometry={G.box} scale={[0.15, 0.11, 0.004]}>
                <meshBasicMaterial color="#e9e2d2" />
              </mesh>
              <mesh position={[0, 0, 0.003]} scale={[0.14, 0.1, 1]} material={photoMat}>
                <planeGeometry args={[1, 1]} />
              </mesh>
            </group>
            <group ref={reg("itHandset")} position={[0.04, -0.06, 0.0]}>
              <mesh geometry={G.cyl} material={m.bake} scale={[0.017, 0.2, 0.017]} />
              <mesh geometry={G.box} material={m.bake} scale={[0.05, 0.05, 0.04]} position={[0, 0.1, 0]} />
              <mesh geometry={G.box} material={m.bake} scale={[0.05, 0.05, 0.04]} position={[0, -0.1, 0]} />
            </group>
            <group ref={reg("itTorch")} position={[0, -0.06, 0.02]}>
              <mesh geometry={G.cyl} material={m.bake} scale={[0.024, 0.2, 0.024]} />
              <mesh geometry={G.cyl} scale={[0.036, 0.04, 0.036]} position={[0, -0.11, 0]}>
                <meshBasicMaterial color="#fff2c8" />
              </mesh>
            </group>
            <group ref={reg("itFolder")} position={[0, -0.05, 0.05]} rotation={[-0.6, 0, 0]}>
              <mesh geometry={G.box} scale={[0.22, 0.015, 0.3]}>
                <meshStandardMaterial color="#b89d6b" roughness={0.9} />
              </mesh>
            </group>
          </group>
        )}
      </group>
    </group>
  );

  return (
    <group ref={reg("root")} scale={c.scale}>
      <group ref={reg("hips")}>
        <mesh geometry={G.sphere} material={m.pants} scale={[0.12 + c.hip, 0.09, 0.105]} position={[0, 0.0, 0]} castShadow />
        {[1, -1].map((side) => (
          <group key={`leg${side}`} ref={reg(side > 0 ? "hipL" : "hipR")} position={[side * c.hip, 0, 0]}>
            <mesh geometry={G.cyl} material={m.pants} position={[0, -0.22, 0]} scale={[0.07, 0.44, 0.07]} castShadow />
            <group ref={reg(side > 0 ? "kneeL" : "kneeR")} position={[0, -0.44, 0]}>
              <mesh geometry={G.cyl} material={m.pants} position={[0, -0.22, 0]} scale={[0.055, 0.44, 0.055]} castShadow />
              <mesh geometry={G.box} material={m.shoes} position={[0, -0.455, 0.06]} scale={[0.09, 0.065, 0.26]} castShadow />
            </group>
          </group>
        ))}
        <group ref={reg("spine")}>
          <mesh geometry={G.caps} material={m.cloth} position={[0, 0.28, 0]} scale={[sh / 0.19, 1, 0.68]} castShadow />
          <mesh geometry={G.box} material={m.cloth2} position={[0, 0.58, 0.02]} scale={[0.09, 0.02, 0.06]} />
          {[1, -1].map((side) => (
            <mesh key={`sh${side}`} geometry={G.sphere} material={m.cloth} position={[side * sh, 0.5, 0]} scale={0.062} />
          ))}
          <mesh geometry={G.cyl} material={m.skin} position={[0, 0.62, 0]} scale={[0.04, 0.1, 0.04]} />
          {limbs(1)}
          {limbs(-1)}
          <group ref={reg("head")} position={[0, 0.64, 0]} scale={c.headScale}>
            <mesh geometry={G.sphere} material={m.skin} position={[0, 0.12, 0]} scale={[0.097, 0.123, 0.106]} castShadow />
            <mesh geometry={G.sphere} material={m.skin} position={[0, 0.04, 0.034]} scale={[0.056, 0.046, 0.05]} />
            {[1, -1].map((side) => (
              <group key={`face${side}`}>
                <mesh geometry={G.sphere} material={m.skin} position={[side * 0.1, 0.12, -0.005]} scale={[0.014, 0.03, 0.02]} />
                <group ref={reg(side > 0 ? "eyeL" : "eyeR")} position={[side * 0.037, 0.135, 0.088]}>
                  <mesh geometry={G.sphere} material={m.white} scale={0.0165} />
                  <mesh geometry={G.sphere} material={m.iris} position={[0, 0, 0.0105]} scale={0.0098} />
                  <mesh geometry={G.sphere} material={m.dark} position={[0, 0, 0.0155]} scale={0.0045} />
                </group>
                <mesh ref={reg(side > 0 ? "lidL" : "lidR")} geometry={G.hemi} material={m.skin} position={[side * 0.037, 0.135, 0.088]} scale={0.0186} />
                <mesh ref={reg(side > 0 ? "browL" : "browR")} geometry={G.box} material={m.hair} position={[side * 0.037, 0.168, 0.094]} scale={[0.046, 0.009 + (c.age > 50 ? 0.004 : 0), 0.012]} />
                <mesh geometry={G.sphere} material={m.bag} position={[side * 0.037, 0.113, 0.086]} scale={[0.02, 0.006, 0.006]} />
                <mesh ref={reg(side > 0 ? "tearL" : "tearR")} geometry={G.sphere} material={m.tear} position={[side * 0.042, 0.1, 0.09]} scale={[0.004, 0.009, 0.004]} visible={false} />
                {c.wrinkles > 0 && <mesh geometry={G.box} material={m.wrinkle} position={[side * 0.03, 0.098, 0.1]} rotation={[0, 0, side * 0.6]} scale={[0.003, 0.03, 0.002]} />}
              </group>
            ))}
            <mesh geometry={G.sphere} material={m.skin} position={[0, 0.098, 0.103]} scale={[0.0135, 0.022, 0.017]} />
            {c.wrinkles > 0 &&
              [0.2, 0.213, 0.226].map((y) => <mesh key={y} geometry={G.box} material={m.wrinkle} position={[0, y, 0.083]} scale={[0.07, 0.002, 0.002]} />)}
            <group position={[0, 0.052, 0.096]}>
              <mesh ref={reg("lipL")} geometry={G.box} material={m.lip} position={[0.0125, 0, 0]} scale={[0.027, 0.0065, 0.008]} />
              <mesh ref={reg("lipR")} geometry={G.box} material={m.lip} position={[-0.0125, 0, 0]} scale={[0.027, 0.0065, 0.008]} />
              <mesh ref={reg("mouthO")} geometry={G.sphere} material={m.dark} position={[0, -0.003, -0.003]} scale={[0.017, 0.01, 0.01]} />
            </group>
            {/* hair */}
            <mesh geometry={hairCap} material={m.hair} position={[0, 0.125, -0.008]} rotation={[-0.55, 0, 0]} scale={c.hairStyle === "short" ? 1.02 : 1.06} castShadow />
            {!longHair && c.hairStyle !== "grey" && <mesh geometry={G.sphere} material={m.hair} position={[0, 0.115, -0.028]} scale={[0.1, 0.108, 0.088]} />}
            {c.hairStyle === "messy" &&
              [[0.04, 0.245, 0.03, 0.04], [-0.05, 0.24, 0.0, 0.045], [0.0, 0.25, -0.04, 0.05], [0.07, 0.22, -0.03, 0.04], [-0.02, 0.255, 0.05, 0.035], [-0.08, 0.2, 0.04, 0.03]].map((q, i) => (
                <mesh key={i} geometry={G.sphere} material={m.hair} position={[q[0], q[1], q[2]]} scale={[q[3], q[3] * 0.8, q[3]]} />
              ))}
            {c.hairStyle === "tied" && (
              <>
                <mesh geometry={G.sphere} material={m.hair} position={[0, 0.1, -0.1]} scale={[0.05, 0.05, 0.05]} />
                <mesh geometry={G.cyl} material={m.hair} position={[0, 0.02, -0.14]} rotation={[0.3, 0, 0]} scale={[0.028, 0.16, 0.028]} />
                {[1, -1].map((s2) => (
                  <mesh key={s2} geometry={G.sphere} material={m.hair} position={[s2 * 0.095, 0.15, 0.0]} scale={[0.022, 0.05, 0.06]} />
                ))}
              </>
            )}
            {longHair && (
              <>
                <mesh geometry={G.sphere} material={m.hair} position={[0, 0.03, -0.06]} scale={[0.115, c.hairStyle === "long" ? 0.2 : 0.15, 0.075]} />
                {[1, -1].map((s2) => (
                  <mesh key={s2} geometry={G.sphere} material={m.hair} position={[s2 * 0.1, c.hairStyle === "long" ? 0.0 : 0.04, -0.02]} scale={[0.025, c.hairStyle === "long" ? 0.15 : 0.1, 0.06]} />
                ))}
              </>
            )}
            {c.hairStyle === "grey" &&
              [1, -1].map((s2) => (
                <mesh key={s2} geometry={G.sphere} material={m.hair} position={[s2 * 0.1, 0.14, -0.02]} scale={[0.022, 0.05, 0.055]} />
              ))}
            {c.hairStyle === "grey" && <mesh geometry={G.sphere} material={m.hair} position={[0, 0.09, -0.07]} scale={[0.1, 0.07, 0.05]} />}
            {c.hairStyle === "short" && <mesh geometry={G.sphere} material={m.hair} position={[0, 0.2, 0.07]} scale={[0.08, 0.03, 0.03]} />}
            {c.beard && (
              <>
                <mesh geometry={G.beard} material={m.beard} position={[0, 0.12, 0.002]} scale={[0.9, 1.12, 0.97]} />
                <mesh geometry={G.box} material={m.beard} position={[0, 0.074, 0.101]} scale={[0.044, 0.008, 0.01]} />
                {[1, -1].map((s2) => (
                  <mesh key={s2} geometry={G.sphere} material={m.beard} position={[s2 * 0.066, 0.07, 0.052]} scale={[0.012, 0.022, 0.024]} />
                ))}
              </>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}
