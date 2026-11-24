import * as THREE from "three";
import type { PropName } from "../film/types";
import { T } from "./textures";

export interface PropRig {
  obj: THREE.Group;
  mode: "yaw" | "hand" | "root";
  offset: THREE.Vector3; // offset from hand (root space)
  update?: (phase: number) => void;
}

const std = (color: string, rough = 0.6, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
const add = (g: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, p: [number, number, number] = [0, 0, 0], r: [number, number, number] = [0, 0, 0]) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...p);
  m.rotation.set(...r);
  m.castShadow = true;
  g.add(m);
  return m;
};

export function makeProp(full: PropName): PropRig {
  const g = new THREE.Group();
  let mode: PropRig["mode"] = "yaw";
  const offset = new THREE.Vector3(0, 0, 0.04);
  let update: PropRig["update"];
  const [name, pkey, pflag] = String(full).split(":");
  switch (name) {
    case "umbrellaClosed": {
      add(g, new THREE.CylinderGeometry(0.007, 0.007, 0.8, 8), std("#222", 0.4, 0.6), [0, 0.2, 0]);
      add(g, new THREE.ConeGeometry(0.04, 0.55, 12), std("#1f3a5f", 0.6), [0, 0.35, 0]).scale.set(1, 1, 1);
      add(g, new THREE.TorusGeometry(0.03, 0.007, 8, 16, Math.PI), std("#222", 0.4, 0.6), [0.03, -0.2, 0], [0, 0, Math.PI]);
      g.rotation.z = -0.12;
      offset.set(0, -0.05, 0.05);
      break;
    }
    case "note": {
      add(g, new THREE.PlaneGeometry(0.09, 0.06), new THREE.MeshStandardMaterial({ map: T.paper(), roughness: 0.9, side: THREE.DoubleSide }));
      g.rotation.set(-0.35, Math.PI, 0);
      offset.set(0, 0.06, 0.07);
      break;
    }
    case "bike": {
      mode = "root";
      offset.set(0, 0, 0.12);
      const wheels: THREE.Group[] = [];
      const tire = std("#1b1b1d", 0.8);
      const spoke = std("#b8bcc0", 0.3, 0.8);
      for (const z of [0.58, -0.58]) {
        const w = new THREE.Group();
        w.position.set(0, 0.33, z);
        add(w, new THREE.TorusGeometry(0.33, 0.022, 8, 28), tire, [0, 0, 0], [0, Math.PI / 2, 0]);
        for (let i = 0; i < 6; i++) add(w, new THREE.CylinderGeometry(0.003, 0.003, 0.64, 4), spoke, [0, 0, 0], [(i * Math.PI) / 6, 0, 0]);
        g.add(w);
        wheels.push(w);
      }
      const frame = std("#b23a3a", 0.35, 0.4);
      const bar = (a: [number, number, number], b: [number, number, number]) => {
        const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
        const len = va.distanceTo(vb);
        const m = add(g, new THREE.CylinderGeometry(0.013, 0.013, len, 6), frame, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
        m.lookAt(vb);
        m.rotateX(Math.PI / 2);
      };
      bar([0, 0.33, -0.58], [0, 0.78, -0.12]);
      bar([0, 0.33, -0.58], [0, 0.45, 0.1]);
      bar([0, 0.78, -0.12], [0, 0.82, 0.38]);
      bar([0, 0.45, 0.1], [0, 0.82, 0.38]);
      bar([0, 0.45, 0.1], [0, 0.78, -0.12]);
      bar([0, 0.82, 0.38], [0, 0.33, 0.58]);
      add(g, new THREE.BoxGeometry(0.12, 0.03, 0.22), std("#222"), [0, 0.84, -0.12]);
      add(g, new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), std("#999", 0.3, 0.8), [0, 0.98, 0.4], [0, 0, Math.PI / 2]);
      add(g, new THREE.BoxGeometry(0.2, 0.02, 0.3), std("#333"), [0, 0.7, -0.66]);
      update = (ph) => wheels.forEach((w) => (w.rotation.x = ph * 0.7));
      break;
    }
    case "photoOLD": break;
    case "umbrella": {
      add(g, new THREE.CylinderGeometry(0.006, 0.006, 0.95, 8), std("#222", 0.4, 0.6), [0, 0.3, 0]);
      add(g, new THREE.TorusGeometry(0.03, 0.007, 8, 16, Math.PI), std("#222", 0.4, 0.6), [0.03, -0.17, 0], [0, 0, Math.PI]);
      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.38),
        new THREE.MeshStandardMaterial({ color: "#1f3a5f", roughness: 0.55, side: THREE.DoubleSide })
      );
      canopy.scale.set(1, 0.7, 1);
      canopy.position.y = 0.22;
      canopy.castShadow = true;
      g.add(canopy);
      add(g, new THREE.ConeGeometry(0.012, 0.06, 8), std("#999", 0.3, 0.8), [0, 0.88, 0]);
      offset.set(0, 0, 0.06);
      break;
    }
    case "camera": {
      add(g, new THREE.BoxGeometry(0.14, 0.085, 0.07), std("#1d1d20", 0.45, 0.4));
      add(g, new THREE.BoxGeometry(0.145, 0.03, 0.072), std("#b9b9bd", 0.35, 0.7), [0, 0.03, 0]);
      add(g, new THREE.CylinderGeometry(0.036, 0.04, 0.07, 18), std("#101012", 0.3, 0.3), [0, -0.003, 0.07], [Math.PI / 2, 0, 0]);
      add(g, new THREE.CylinderGeometry(0.028, 0.028, 0.004, 18), new THREE.MeshStandardMaterial({ color: "#2a3b66", roughness: 0.05, metalness: 0.8 }), [0, -0.003, 0.108], [Math.PI / 2, 0, 0]);
      add(g, new THREE.BoxGeometry(0.03, 0.02, 0.03), std("#222"), [-0.04, 0.056, 0]);
      offset.set(0, 0.02, 0.04);
      break;
    }
    case "book": {
      add(g, new THREE.BoxGeometry(0.15, 0.21, 0.025), std("#7a3b2e", 0.7));
      add(g, new THREE.BoxGeometry(0.14, 0.2, 0.02), std("#efe7d2", 0.9), [0.006, 0, 0]);
      mode = "yaw";
      g.rotation.x = -0.3;
      offset.set(0, 0.05, 0.05);
      break;
    }
    case "coffee": {
      add(g, new THREE.CylinderGeometry(0.036, 0.028, 0.09, 16), std("#f4f0ea", 0.5), [0, 0.03, 0]);
      add(g, new THREE.CylinderGeometry(0.038, 0.038, 0.012, 16), std("#e6e0d8", 0.5), [0, 0.08, 0]);
      add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.062, 16), std("#5b3a28", 0.8), [0, 0.03, 0]).scale.setScalar(0.95);
      offset.set(0, 0.01, 0.05);
      break;
    }
    case "letter": {
      const m = new THREE.MeshStandardMaterial({ map: T.paper(), roughness: 0.9, side: THREE.DoubleSide });
      add(g, new THREE.PlaneGeometry(0.2, 0.27), m);
      g.rotation.set(-0.35, Math.PI, 0);
      offset.set(0, 0.12, 0.1);
      break;
    }
    case "photo": {
      const m = new THREE.MeshStandardMaterial({ map: T.photo(pkey || "laugh"), roughness: 0.5, side: THREE.DoubleSide });
      add(g, new THREE.PlaneGeometry(0.16, 0.12), m);
      add(g, new THREE.PlaneGeometry(0.17, 0.13), std("#f4f1ea", 0.9), [0, 0, -0.001]);
      g.rotation.set(-0.3, pflag === "show" ? 0 : Math.PI, 0);
      if (pflag === "show") g.scale.setScalar(1.5);
      offset.set(0, 0.07, pflag === "show" ? 0.12 : 0.08);
      break;
    }
    case "flower": {
      add(g, new THREE.CylinderGeometry(0.003, 0.003, 0.28, 6), std("#3f7a3a"), [0, 0.1, 0]);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const p = add(g, new THREE.SphereGeometry(0.02, 8, 6), std("#f4f1f0", 0.5), [Math.cos(a) * 0.022, 0.245, Math.sin(a) * 0.022]);
        p.scale.set(1, 0.4, 1);
      }
      add(g, new THREE.SphereGeometry(0.013, 8, 6), std("#e8b53a"), [0, 0.25, 0]);
      offset.set(0, 0.0, 0.05);
      break;
    }
    case "bouquet": {
      add(g, new THREE.ConeGeometry(0.06, 0.2, 12, 1, true), new THREE.MeshStandardMaterial({ color: "#e9dcc3", roughness: 0.9, side: THREE.DoubleSide }), [0, 0.0, 0], [Math.PI, 0, 0]);
      const cols = ["#f6e7e4", "#e98aa0", "#f2c45a", "#ffffff", "#d96b86"];
      for (let i = 0; i < 14; i++) {
        const a = i * 2.4;
        const r = 0.015 + (i % 5) * 0.012;
        add(g, new THREE.SphereGeometry(0.03, 8, 6), std(cols[i % cols.length], 0.6), [Math.cos(a) * r * 2, 0.12 + (i % 3) * 0.015, Math.sin(a) * r * 2]);
      }
      offset.set(0, 0, 0.06);
      break;
    }
    case "phone": {
      add(g, new THREE.BoxGeometry(0.07, 0.145, 0.009), std("#1b1d22", 0.3, 0.5));
      add(g, new THREE.PlaneGeometry(0.062, 0.13), new THREE.MeshBasicMaterial({ color: "#9fc4ff" }), [0, 0, 0.0052]);
      mode = "hand";
      offset.set(0, -0.02, 0.03);
      break;
    }
    case "box": {
      const w = std("#8a6140", 0.7);
      add(g, new THREE.BoxGeometry(0.3, 0.14, 0.2), w);
      add(g, new THREE.BoxGeometry(0.31, 0.02, 0.21), std("#6d4a30", 0.7), [0, 0.075, 0]);
      add(g, new THREE.BoxGeometry(0.04, 0.03, 0.01), std("#c9a04a", 0.3, 0.8), [0, 0.06, 0.105]);
      offset.set(0, 0.02, 0.17);
      break;
    }
    case "ringbox": {
      add(g, new THREE.BoxGeometry(0.06, 0.035, 0.06), std("#1f2a44", 0.5));
      add(g, new THREE.TorusGeometry(0.012, 0.0028, 8, 20), std("#e6c35c", 0.2, 1), [0, 0.028, 0], [Math.PI / 2, 0, 0]);
      add(g, new THREE.SphereGeometry(0.006, 10, 8), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.05, metalness: 0.3, emissive: "#9bb7ff", emissiveIntensity: 0.6 }), [0, 0.04, 0]);
      offset.set(0, 0.01, 0.06);
      break;
    }
    case "package": {
      add(g, new THREE.BoxGeometry(0.34, 0.2, 0.26), std("#b58d5a", 0.85));
      add(g, new THREE.BoxGeometry(0.345, 0.03, 0.05), std("#d9c9a3", 0.6), [0, 0.0, 0]);
      add(g, new THREE.PlaneGeometry(0.1, 0.07), new THREE.MeshStandardMaterial({ color: "#f3f3f3" }), [0.07, 0.101, 0.05], [-Math.PI / 2, 0, 0]);
      offset.set(0, 0, 0.22);
      break;
    }
    case "pen": {
      add(g, new THREE.CylinderGeometry(0.004, 0.004, 0.14, 6), std("#223"), [0, 0, 0]);
      g.rotation.x = -0.9;
      offset.set(0, -0.02, 0.05);
      break;
    }
    case "spoon": {
      add(g, new THREE.CylinderGeometry(0.006, 0.006, 0.3, 6), std("#a67c52", 0.7), [0, 0.0, 0]);
      add(g, new THREE.SphereGeometry(0.03, 8, 6), std("#a67c52", 0.7), [0, -0.15, 0]).scale.set(1, 0.4, 1);
      g.rotation.x = 0.5;
      offset.set(0, 0, 0.05);
      break;
    }
    case "bagFood": {
      add(g, new THREE.CylinderGeometry(0.05, 0.04, 0.12, 10), std("#f0d9a0", 0.9), [0, 0.04, 0]);
      add(g, new THREE.SphereGeometry(0.04, 8, 6), std("#d38a2f", 0.7), [0, 0.12, 0]);
      offset.set(0, 0, 0.05);
      break;
    }
  }
  return { obj: g, mode, offset, update };
}

export function disposeObject(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else if (mat) mat.dispose();
  });
}
