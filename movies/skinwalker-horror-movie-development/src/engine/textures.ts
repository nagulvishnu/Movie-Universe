import * as THREE from 'three';

// Procedural canvas textures (small sizes for 4GB VRAM laptops). All cached.
const cache = new Map<string, THREE.CanvasTexture>();

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function make(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, repeat = true, srgb = true) {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(cv);
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  cache.set(key, t);
  return t;
}

function speckle(c: CanvasRenderingContext2D, w: number, h: number, r: () => number, n: number, light: string, dark: string, size = 2) {
  for (let i = 0; i < n; i++) {
    c.fillStyle = r() > 0.5 ? light : dark;
    c.globalAlpha = 0.05 + r() * 0.12;
    c.fillRect(r() * w, r() * h, 1 + r() * size, 1 + r() * size);
  }
  c.globalAlpha = 1;
}

export const groundTex = (base = '#2a261f') => make('ground' + base, 256, 256, (c, w, h) => {
  const r = rng(7);
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  speckle(c, w, h, r, 2600, '#6b6150', '#0d0b08', 3);
  for (let i = 0; i < 40; i++) { // leaves / needles
    c.strokeStyle = r() > 0.5 ? '#4a3a22' : '#1c2414'; c.globalAlpha = 0.5; c.lineWidth = 1;
    const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + r() * 10 - 5, y + r() * 10 - 5); c.stroke();
  }
  c.globalAlpha = 1;
});

export const logTex = () => make('log', 256, 256, (c, w, h) => {
  const r = rng(3);
  const rows = 6, rh = h / rows;
  for (let i = 0; i < rows; i++) {
    const g = c.createLinearGradient(0, i * rh, 0, (i + 1) * rh);
    g.addColorStop(0, '#2c1c10'); g.addColorStop(0.35, '#6b4527'); g.addColorStop(0.7, '#5a3820'); g.addColorStop(1, '#22150b');
    c.fillStyle = g; c.fillRect(0, i * rh, w, rh);
    for (let k = 0; k < 14; k++) { c.strokeStyle = 'rgba(20,10,4,0.35)'; c.beginPath(); const y = i * rh + r() * rh; c.moveTo(r() * w, y); c.lineTo(r() * w, y + (r() - 0.5) * 3); c.stroke(); }
  }
});

export const plankTex = (base = '#5b3d24') => make('plank' + base, 256, 256, (c, w, h) => {
  const r = rng(11);
  const n = 8, pw = w / n;
  for (let i = 0; i < n; i++) {
    const l = 0.8 + r() * 0.4;
    c.fillStyle = base; c.fillRect(i * pw, 0, pw, h);
    c.fillStyle = `rgba(${l > 1 ? 255 : 0},${l > 1 ? 220 : 0},${l > 1 ? 160 : 0},${Math.abs(l - 1) * 0.5})`; c.fillRect(i * pw, 0, pw, h);
    c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(i * pw, 0, 2, h);
    for (let k = 0; k < 20; k++) { c.strokeStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); const x = i * pw + r() * pw; c.moveTo(x, r() * h); c.lineTo(x + (r() - 0.5) * 4, r() * h); c.stroke(); }
  }
});

export const rockTex = () => make('rock', 256, 256, (c, w, h) => {
  const r = rng(21);
  c.fillStyle = '#3a3835'; c.fillRect(0, 0, w, h);
  speckle(c, w, h, r, 3000, '#7d7870', '#0c0b0a', 4);
  for (let i = 0; i < 26; i++) { c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1 + r() * 2; c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 40; c.lineTo(x, y); } c.stroke(); }
});

export const asphaltTex = () => make('asphalt', 256, 256, (c, w, h) => {
  const r = rng(5);
  c.fillStyle = '#25272a'; c.fillRect(0, 0, w, h);
  speckle(c, w, h, r, 4000, '#6e7075', '#0a0a0b', 2);
});

export const concreteTex = (base = '#6e6a62') => make('concrete' + base, 256, 256, (c, w, h) => {
  const r = rng(9);
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  speckle(c, w, h, r, 3000, '#aaa49a', '#2a2824', 3);
});

export const sidingTex = (base = '#7a6a52') => make('siding' + base, 256, 256, (c, w, h) => {
  const rows = 10, rh = h / rows;
  for (let i = 0; i < rows; i++) {
    c.fillStyle = base; c.fillRect(0, i * rh, w, rh);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, i * rh + rh - 3, w, 3);
    c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(0, i * rh, w, 2);
  }
  speckle(c, w, h, rng(2), 1500, '#fff', '#000', 3);
});

export const shingleTex = () => make('shingle', 256, 256, (c, w, h) => {
  const r = rng(4);
  c.fillStyle = '#2a2420'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const l = 30 + r() * 25; c.fillStyle = `rgb(${l + 8},${l},${l - 4})`;
    c.fillRect(x * 32 + (y % 2) * 16 - 16, y * 32, 30, 28);
  }
});

export const fogTex = () => make('fog', 128, 128, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
}, false);

export const glowTex = () => make('glow', 128, 128, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.15, 'rgba(255,255,255,0.8)'); g.addColorStop(0.5, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
}, false);

export const moonTex = () => make('moon', 128, 128, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(0.28, 'rgba(235,240,255,1)'); g.addColorStop(0.32, 'rgba(180,200,255,0.35)'); g.addColorStop(1, 'rgba(120,150,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(150,160,185,0.35)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(w / 2 + (i * 7 % 20 - 10), h / 2 + (i * 11 % 20 - 10), 4 + i, 0, 7); c.fill(); }
}, false);

export function signTex(text: string, sub = '', bg = '#1d3b2a', fg = '#e9e2c9') {
  return make('sign' + text + sub + bg, 512, 160, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.strokeStyle = fg; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = fg; c.textAlign = 'center'; c.font = 'bold 64px Georgia, serif';
    c.fillText(text, w / 2, sub ? 80 : 98);
    if (sub) { c.font = '28px Georgia, serif'; c.fillText(sub, w / 2, 125); }
  }, false);
}

export function clockTex(text: string) {
  return make('clock' + text, 256, 128, (c, w, h) => {
    c.fillStyle = '#050000'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ff2a1a'; c.shadowColor = '#ff2a1a'; c.shadowBlur = 18; c.font = 'bold 84px "Courier New", monospace';
    c.textAlign = 'center'; c.fillText(text, w / 2, 94);
  }, false);
}

// ---------- photographs & paper ----------
type Fig = { x: number; h: number; col: string; hat?: string };
function drawFigure(c: CanvasRenderingContext2D, f: Fig, base: number) {
  const hh = f.h, hw = hh * 0.13;
  c.fillStyle = '#1b1612'; c.fillRect(f.x - hw * 0.8, base - hh * 0.46, hw * 0.7, hh * 0.46); c.fillRect(f.x + hw * 0.1, base - hh * 0.46, hw * 0.7, hh * 0.46);
  c.fillStyle = f.col; c.fillRect(f.x - hw * 1.1, base - hh * 0.8, hw * 2.2, hh * 0.38);
  c.fillRect(f.x - hw * 1.6, base - hh * 0.78, hw * 0.5, hh * 0.32); c.fillRect(f.x + hw * 1.1, base - hh * 0.78, hw * 0.5, hh * 0.32);
  c.fillStyle = '#c9a283'; c.beginPath(); c.arc(f.x, base - hh * 0.89, hw * 0.85, 0, 7); c.fill();
  if (f.hat) { c.fillStyle = f.hat; c.fillRect(f.x - hw * 0.9, base - hh * 0.99, hw * 1.8, hh * 0.06); }
}

function photoBase(c: CanvasRenderingContext2D, w: number, h: number, seed: number, cabin: boolean, dusk: boolean) {
  const r = rng(seed);
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, dusk ? '#4b5568' : '#9aa6a8'); g.addColorStop(0.6, dusk ? '#8d7f70' : '#c7c4b4'); g.addColorStop(1, '#3c3a2d');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = '#1e2a20';
  for (let i = 0; i < 16; i++) { const x = r() * w, th = 90 + r() * 80; c.beginPath(); c.moveTo(x - 24, h * 0.72); c.lineTo(x, h * 0.72 - th); c.lineTo(x + 24, h * 0.72); c.fill(); }
  c.fillStyle = '#3a3426'; c.fillRect(0, h * 0.72, w, h * 0.28);
  if (cabin) {
    c.fillStyle = '#4b2f1c'; c.fillRect(w * 0.18, h * 0.42, w * 0.64, h * 0.3);
    c.fillStyle = '#2a1d14'; c.beginPath(); c.moveTo(w * 0.14, h * 0.43); c.lineTo(w * 0.5, h * 0.22); c.lineTo(w * 0.86, h * 0.43); c.fill();
    c.fillStyle = '#e6b86a'; c.fillRect(w * 0.26, h * 0.5, 30, 24); c.fillStyle = '#1a1008'; c.fillRect(w * 0.62, h * 0.5, 26, h * 0.22);
  }
}

function photoFinish(c: CanvasRenderingContext2D, w: number, h: number, seed: number, sepia: number) {
  const r = rng(seed + 99);
  speckle(c, w, h, r, 2500, '#fff', '#000', 2);
  c.fillStyle = `rgba(120,80,30,${sepia})`; c.globalCompositeOperation = 'multiply'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'source-over';
  const v = c.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#e8e2d2'; c.lineWidth = 10; c.strokeRect(0, 0, w, h);
}

export type PhotoKind = 'four' | 'four2' | 'four3' | 'four4' | 'adam' | 'hunterBoy' | 'family' | 'misc0' | 'misc1' | 'misc2' | 'misc3' | 'misc4' | 'misc5';

export function photoTex(kind: PhotoKind) {
  return make('photo' + kind, 320, 240, (c, w, h) => {
    const base = h * 0.9;
    const adam: Fig = { x: 0, h: 150, col: '#55653f' }, lena: Fig = { x: 0, h: 140, col: '#7a2a32' },
      noah: Fig = { x: 0, h: 148, col: '#3f5f8f' }, emily: Fig = { x: 0, h: 138, col: '#d8d0b8' };
    const seeds: Record<string, number> = { four: 1, four2: 2, four3: 3, four4: 4, adam: 5, hunterBoy: 6, family: 7 };
    const sd = seeds[kind] ?? 20 + Number(kind.slice(-1));
    if (kind.startsWith('four')) {
      photoBase(c, w, h, sd, true, kind === 'four3' || kind === 'four4');
      const off = kind === 'four' ? 0 : kind === 'four2' ? 14 : kind === 'four3' ? -10 : 6;
      const xs = [100, 140, 182, 222].map((x, i) => x + off * (i % 2 ? 1 : -1));
      [adam, lena, noah, emily].forEach((f, i) => drawFigure(c, { ...f, x: xs[i], h: f.h + (kind === 'four2' ? -6 : 0) }, base));
      photoFinish(c, w, h, sd, 0.28);
    } else if (kind === 'adam') {
      photoBase(c, w, h, sd, true, true);
      drawFigure(c, { ...adam, x: w * 0.5, h: 170 }, base);
      photoFinish(c, w, h, sd, 0.32);
    } else if (kind === 'hunterBoy') {
      photoBase(c, w, h, sd, false, false);
      drawFigure(c, { x: 130, h: 175, col: '#5a4630', hat: '#d9622b' }, base);
      drawFigure(c, { x: 188, h: 100, col: '#8a3b3b' }, base);
      c.fillStyle = 'rgba(210,205,190,0.16)'; c.fillRect(240, h * 0.12, 6, h * 0.65);
      c.fillRect(231, h * 0.2, 5, 30); c.fillRect(250, h * 0.22, 5, 34);
      c.beginPath(); c.arc(243, h * 0.11, 9, 0, 7); c.fill();
      photoFinish(c, w, h, sd, 0.5);
    } else if (kind === 'family') {
      photoBase(c, w, h, sd, true, false);
      drawFigure(c, { x: 105, h: 168, col: '#6a3d2a' }, base);
      drawFigure(c, { x: 150, h: 156, col: '#4a5d6b' }, base);
      drawFigure(c, { x: 190, h: 98, col: '#8a5a3a' }, base);
      drawFigure(c, { x: 224, h: 112, col: '#9a7a3a' }, base);
      c.fillStyle = 'rgba(205,200,185,0.2)'; c.fillRect(278, h * 0.04, 7, h * 0.7);
      c.fillRect(268, h * 0.14, 5, 40); c.fillRect(290, h * 0.16, 5, 44);
      c.beginPath(); c.ellipse(281.5, h * 0.035, 9, 12, 0, 0, 7); c.fill();
      photoFinish(c, w, h, sd, 0.6);
    } else {
      photoBase(c, w, h, sd, sd % 2 === 0, sd % 3 === 0);
      const r = rng(sd);
      const n = 1 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) drawFigure(c, { x: 90 + i * 60 + r() * 20, h: 130 + r() * 40, col: ['#6b4a3a', '#3a5a6b', '#8a8a3a', '#7a3a6b'][Math.floor(r() * 4)] }, base);
      photoFinish(c, w, h, sd, 0.4);
    }
  }, false);
}

export type PaperKind = 'clipping' | 'clipping2' | 'drawing' | 'drawing2' | 'missing' | 'note';
export function paperTex(kind: PaperKind) {
  return make('paper' + kind, 256, 320, (c, w, h) => {
    const r = rng(kind.length * 13 + kind.charCodeAt(0));
    c.fillStyle = kind === 'missing' ? '#d8d3bc' : '#cfc7a8'; c.fillRect(0, 0, w, h);
    speckle(c, w, h, r, 2000, '#fff', '#5a4a20', 3);
    c.fillStyle = '#1c1a14';
    if (kind.startsWith('clipping')) {
      c.font = 'bold 30px Georgia, serif'; c.textAlign = 'center';
      c.fillText(kind === 'clipping' ? 'THIRD HIKER' : 'SEARCH CALLED', w / 2, 46);
      c.fillText(kind === 'clipping' ? 'VANISHES' : 'OFF AGAIN', w / 2, 80);
      for (let y = 105; y < h - 20; y += 9) c.fillRect(18, y, w - 36 - (r() > 0.85 ? 80 : 0), 3);
      c.fillStyle = '#6a6a62'; c.fillRect(30, 120, 80, 70);
    } else if (kind === 'missing') {
      c.font = 'bold 52px Georgia, serif'; c.textAlign = 'center'; c.fillText('MISSING', w / 2, 62);
      c.fillStyle = '#7a7466'; c.fillRect(60, 85, 136, 130); c.fillStyle = '#4a463e'; c.beginPath(); c.arc(128, 135, 30, 0, 7); c.fill(); c.fillRect(98, 168, 60, 50);
      c.fillStyle = '#1c1a14'; c.font = '20px Georgia'; c.fillText('LAST SEEN BLACKWOOD RD.', w / 2, 245); c.fillText('IF YOU HEAR THEM CALLING...', w / 2, 272);
    } else if (kind.startsWith('drawing')) {
      c.strokeStyle = '#111'; c.lineWidth = 4; c.lineCap = 'round';
      const cx = kind === 'drawing' ? 128 : 100;
      c.beginPath(); c.ellipse(cx, 60, 14, 22, 0.1, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(cx, 82); c.lineTo(cx, 200); c.moveTo(cx - 6, 100); c.quadraticCurveTo(cx - 50, 180, cx - 40, 290); c.moveTo(cx + 6, 100); c.quadraticCurveTo(cx + 55, 180, cx + 48, 290);
      c.moveTo(cx, 200); c.lineTo(cx - 20, 300); c.moveTo(cx, 200); c.lineTo(cx + 22, 300); c.stroke();
      c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(cx - 8 + i * 3, 52); c.lineTo(cx - 6 + i * 3, 70); c.stroke(); }
      c.beginPath(); c.moveTo(cx - 10, 68); c.quadraticCurveTo(cx, 80, cx + 10, 67); c.stroke();
      c.fillStyle = '#111'; for (let i = 0; i < 9; i++) c.fillRect(20 + r() * 200, 210 + r() * 90, 3, 30 + r() * 30);
    } else {
      c.font = '22px "Courier New", monospace'; c.textAlign = 'left';
      ['it knows', 'my brother', 'knows my name', 'DONT ANSWER', '', 'it learns', 'by watching'].forEach((t, i) => c.fillText(t, 20, 50 + i * 34));
    }
    c.strokeStyle = 'rgba(60,40,10,0.5)'; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4);
  }, false);
}

export function disposeTextureCache() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
