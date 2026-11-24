import * as THREE from "three";

const cache = new Map<string, THREE.CanvasTexture>();

function mk(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number], srgb = true) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

// deterministic rng
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function speckle(g: CanvasRenderingContext2D, w: number, h: number, n: number, a: number, seed = 3) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const v = r() > 0.5 ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${r() * a})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

export const T = {
  cloth: () =>
    mk("cloth", 128, 128, (g, w, h) => {
      g.fillStyle = "#ddd";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        g.fillStyle = y % 4 === 0 ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)";
        g.fillRect(0, y, w, 1);
      }
      for (let x = 0; x < w; x += 2) {
        g.fillStyle = x % 4 === 0 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)";
        g.fillRect(x, 0, 1, h);
      }
      speckle(g, w, h, 900, 0.15);
    }, [4, 4]),
  wood: (tone = "#8a5a35", rep: [number, number] = [3, 3]) =>
    mk("wood" + tone + rep.join(), 256, 256, (g, w, h) => {
      g.fillStyle = tone;
      g.fillRect(0, 0, w, h);
      const r = rng(11);
      const planks = 6;
      for (let p = 0; p < planks; p++) {
        const y0 = (p * h) / planks;
        g.fillStyle = `rgba(${r() > 0.5 ? "255,220,170" : "0,0,0"},${0.04 + r() * 0.08})`;
        g.fillRect(0, y0, w, h / planks);
        for (let i = 0; i < 26; i++) {
          g.strokeStyle = `rgba(30,15,5,${0.05 + r() * 0.1})`;
          g.beginPath();
          const yy = y0 + r() * (h / planks);
          g.moveTo(0, yy);
          g.bezierCurveTo(w * 0.3, yy + (r() - 0.5) * 4, w * 0.6, yy + (r() - 0.5) * 4, w, yy + (r() - 0.5) * 3);
          g.stroke();
        }
        g.fillStyle = "rgba(0,0,0,0.5)";
        g.fillRect(0, y0, w, 1.5);
        g.fillRect(r() * w, y0, 1.5, h / planks);
      }
    }, rep),
  plaster: (tone = "#e9dfd0", rep: [number, number] = [3, 3]) =>
    mk("plaster" + tone + rep.join(), 256, 256, (g, w, h) => {
      g.fillStyle = tone;
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 4000, 0.07, 9);
      const r = rng(5);
      for (let i = 0; i < 12; i++) {
        const gr = g.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, 80);
        gr.addColorStop(0, "rgba(0,0,0,0.04)");
        gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, w, h);
      }
    }, rep),
  brick: (tone = "#9c5a45", rep: [number, number] = [4, 3]) =>
    mk("brick" + tone + rep.join(), 256, 256, (g, w, h) => {
      g.fillStyle = "#b9b0a2";
      g.fillRect(0, 0, w, h);
      const r = rng(21);
      const bh = 32;
      const bw = 64;
      for (let y = 0; y < h; y += bh) {
        for (let x = -(y / bh) % 2 * (bw / 2); x < w; x += bw) {
          g.fillStyle = tone;
          g.globalAlpha = 0.75 + r() * 0.25;
          g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
        }
      }
      g.globalAlpha = 1;
      speckle(g, w, h, 3000, 0.12, 4);
    }, rep),
  tile: (a = "#d9dde0", b = "#c8cfd3", rep: [number, number] = [6, 6]) =>
    mk("tile" + a + b + rep.join(), 128, 128, (g, w, h) => {
      for (let y = 0; y < 2; y++)
        for (let x = 0; x < 2; x++) {
          g.fillStyle = (x + y) % 2 ? a : b;
          g.fillRect((x * w) / 2, (y * h) / 2, w / 2, h / 2);
        }
      g.strokeStyle = "rgba(0,0,0,0.18)";
      g.strokeRect(0, 0, w / 2, h / 2);
      g.strokeRect(w / 2, h / 2, w / 2, h / 2);
      g.strokeRect(w / 2, 0, w / 2, h / 2);
      g.strokeRect(0, h / 2, w / 2, h / 2);
      speckle(g, w, h, 300, 0.08);
    }, rep),
  concrete: (tone = "#6d6f72", rep: [number, number] = [4, 4]) =>
    mk("conc" + tone + rep.join(), 256, 256, (g, w, h) => {
      g.fillStyle = tone;
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 6000, 0.12, 6);
      g.strokeStyle = "rgba(0,0,0,0.25)";
      g.lineWidth = 2;
      g.strokeRect(0, 0, w, h);
    }, rep),
  sand: (rep: [number, number] = [12, 12]) =>
    mk("sand", 256, 256, (g, w, h) => {
      g.fillStyle = "#d8c294";
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 9000, 0.18, 8);
      const r = rng(2);
      for (let i = 0; i < 40; i++) {
        g.strokeStyle = "rgba(120,90,50,0.08)";
        g.beginPath();
        const y = r() * h;
        g.moveTo(0, y);
        g.quadraticCurveTo(w / 2, y + (r() - 0.5) * 14, w, y);
        g.stroke();
      }
    }, rep),
  grass: (rep: [number, number] = [8, 8]) =>
    mk("grass", 128, 128, (g, w, h) => {
      g.fillStyle = "#4d6b34";
      g.fillRect(0, 0, w, h);
      const r = rng(8);
      for (let i = 0; i < 1500; i++) {
        g.strokeStyle = `hsl(${85 + r() * 30},${35 + r() * 20}%,${22 + r() * 18}%)`;
        const x = r() * w;
        const y = r() * h;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 4);
        g.stroke();
      }
    }, rep),
  asphalt: (rep: [number, number] = [6, 6]) =>
    mk("asph", 256, 256, (g, w, h) => {
      g.fillStyle = "#2a2c30";
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 9000, 0.2, 12);
    }, rep),
  carpet: (tone = "#6b4a3a") =>
    mk("carpet" + tone, 128, 128, (g, w, h) => {
      g.fillStyle = tone;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(255,230,190,0.35)";
      g.lineWidth = 3;
      g.strokeRect(10, 10, w - 20, h - 20);
      g.strokeRect(24, 24, w - 48, h - 48);
      speckle(g, w, h, 1500, 0.2);
    }, [1, 1]),
  books: () =>
    mk("books", 512, 64, (g, w, h) => {
      const r = rng(77);
      let x = 0;
      while (x < w) {
        const bw = 6 + r() * 12;
        const bh = h * (0.7 + r() * 0.3);
        g.fillStyle = `hsl(${r() * 360},${25 + r() * 40}%,${22 + r() * 30}%)`;
        g.fillRect(x, h - bh, bw, bh);
        g.fillStyle = "rgba(240,220,160,0.55)";
        g.fillRect(x, h - bh + 6 + r() * 10, bw, 2);
        g.fillRect(x, h - 10 - r() * 8, bw, 2);
        g.fillStyle = "rgba(0,0,0,0.3)";
        g.fillRect(x + bw - 1, h - bh, 1, bh);
        x += bw;
      }
    }, [1, 1]),
  sign: (text: string, bg = "#12335e", fg = "#f4f1e6", sub?: string) =>
    mk("sign" + text + bg + (sub || ""), 512, 128, (g, w, h) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = fg;
      g.lineWidth = 4;
      g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = fg;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `700 ${sub ? 52 : 60}px Georgia, serif`;
      g.fillText(text, w / 2, sub ? h * 0.38 : h / 2);
      if (sub) {
        g.font = "400 28px Georgia, serif";
        g.fillText(sub, w / 2, h * 0.76);
      }
    }, [1, 1]),
  paper: () =>
    mk("paper", 256, 340, (g, w, h) => {
      g.fillStyle = "#f4ecd8";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(40,50,90,0.55)";
      g.lineWidth = 2;
      const r = rng(31);
      for (let y = 40; y < h - 20; y += 18) {
        g.beginPath();
        g.moveTo(24, y);
        let x = 24;
        while (x < 24 + (w - 60) * (0.5 + r() * 0.5)) {
          x += 5 + r() * 6;
          g.lineTo(x, y + (r() - 0.5) * 7);
        }
        g.stroke();
      }
      speckle(g, w, h, 500, 0.08);
    }, [1, 1]),
  // tiny stylised "photograph" used for props & wall prints
  photo: (kind: string) =>
    mk("photo" + kind, 256, 192, (g, w, h) => {
      const sky = g.createLinearGradient(0, 0, 0, h);
      const palettes: Record<string, string[]> = {
        sunrise: ["#f6b36b", "#ffd9a0", "#3b6a8a"],
        rain: ["#566a7a", "#8399a6", "#2b343b"],
        light: ["#7fb7d9", "#e9f1f4", "#294a66"],
        child: ["#78b9e3", "#f1e6c6", "#d9bf8a"],
        couple: ["#ffb585", "#ffd8b0", "#c98f70"],
        laugh: ["#8cc3e8", "#f4e2c4", "#e0b98d"],
        street: ["#6f7e8c", "#a5b2bb", "#35393e"],
      };
      const p = palettes[kind] || palettes.light;
      sky.addColorStop(0, p[0]);
      sky.addColorStop(0.55, p[1]);
      sky.addColorStop(0.56, p[2]);
      sky.addColorStop(1, p[2]);
      g.fillStyle = sky;
      g.fillRect(0, 0, w, h);
      if (kind === "sunrise") {
        g.fillStyle = "#fff2c0";
        g.beginPath();
        g.arc(w * 0.5, h * 0.55, 26, Math.PI, 0);
        g.fill();
      }
      if (kind === "light") {
        g.fillStyle = "#f3f3ee";
        g.fillRect(w * 0.45, h * 0.15, 22, h * 0.45);
        g.fillStyle = "#b43c34";
        g.fillRect(w * 0.45, h * 0.28, 22, 12);
        g.fillRect(w * 0.45, h * 0.42, 22, 12);
        g.fillStyle = "#333";
        g.fillRect(w * 0.43, h * 0.12, 26, 9);
      }
      if (kind === "laugh" || kind === "couple") {
        for (const [x, c] of [[0.38, "#3d2a22"], [0.6, "#4a2f26"]] as [number, string][]) {
          g.fillStyle = "#c68e68";
          g.beginPath();
          g.arc(w * x, h * 0.42, 22, 0, 7);
          g.fill();
          g.fillStyle = c;
          g.beginPath();
          g.arc(w * x, h * 0.36, 23, Math.PI, 0);
          g.fill();
          g.fillStyle = x < 0.5 ? "#6b7f8c" : "#e0b14a";
          g.fillRect(w * x - 30, h * 0.58, 60, h * 0.5);
        }
      }
      if (kind === "child") {
        g.fillStyle = "#d44";
        g.beginPath();
        g.arc(w * 0.5, h * 0.62, 12, 0, 7);
        g.fill();
        g.fillRect(w * 0.5 - 6, h * 0.62, 12, 28);
      }
      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.lineWidth = 14;
      g.strokeRect(0, 0, w, h);
    }, [1, 1]),
  noiseBump: () =>
    mk("bump", 128, 128, (g, w, h) => {
      g.fillStyle = "#808080";
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 3000, 0.6, 1);
    }, [3, 3], false),
};

export function disposeTextures() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
