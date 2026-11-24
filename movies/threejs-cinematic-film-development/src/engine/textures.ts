// Procedural canvas textures (cached). No external assets required.
import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

function rnd(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function make(key: string, size: number, draw: (c: CanvasRenderingContext2D, s: number, r: () => number) => void, grain = 0, seed = 3) {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d')!;
  const r = rnd(seed + key.length * 17);
  draw(c, size, r);
  if (grain > 0) {
    const img = c.getImageData(0, 0, size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * grain;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    c.putImageData(img, 0, 0);
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  cache.set(key, t);
  return t;
}

const fill = (c: CanvasRenderingContext2D, col: string, s: number) => { c.fillStyle = col; c.fillRect(0, 0, s, s); };

export const tex = {
  asphalt(ruined: boolean) {
    return make('asphalt' + ruined, 256, (c, s, r) => {
      fill(c, ruined ? '#3a3b3a' : '#2f3033', s);
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.04})`; c.fillRect(r() * s, r() * s, 2 + r() * 20, 1 + r() * 3); }
      if (ruined) {
        c.strokeStyle = 'rgba(10,10,10,.8)'; c.lineWidth = 1.5;
        for (let i = 0; i < 7; i++) { c.beginPath(); let x = r() * s, y = r() * s; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 50; c.lineTo(x, y); } c.stroke(); }
        for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(${50 + r() * 30},${80 + r() * 40},${30 + r() * 20},.55)`; c.beginPath(); c.arc(r() * s, r() * s, 3 + r() * 14, 0, 7); c.fill(); }
      }
    }, 22);
  },
  facade(ruined: boolean, tint = 0) {
    return make('facade' + ruined + tint, 256, (c, s, r) => {
      const bases = ['#8d8f8c', '#9a9388', '#7d848a', '#a69c8a'];
      fill(c, bases[tint % 4], s);
      for (let cx = 0; cx < 2; cx++) for (let cy = 0; cy < 2; cy++) {
        const x = cx * 128 + 26, y = cy * 128 + 22, w = 76, h = 78;
        c.fillStyle = '#3b3f42'; c.fillRect(x - 4, y - 4, w + 8, h + 8);
        const g = c.createLinearGradient(x, y, x + w, y + h);
        const broken = ruined && r() < 0.45;
        g.addColorStop(0, broken ? '#06090a' : '#6f8fa3'); g.addColorStop(1, broken ? '#0c1112' : '#1d2b36');
        c.fillStyle = g; c.fillRect(x, y, w, h);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + w / 2 - 1.5, y, 3, h); c.fillRect(x, y + h / 2 - 1.5, w, 3);
        if (broken) { c.strokeStyle = 'rgba(200,220,230,.5)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + r() * w, y + r() * h); c.lineTo(x + r() * w, y + r() * h); c.stroke(); } }
      }
      if (ruined) {
        for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(25,28,22,${0.05 + r() * 0.12})`; c.fillRect(r() * s, 0, 2 + r() * 8, 40 + r() * 216); }
        for (let i = 0; i < 10; i++) { c.fillStyle = `rgba(60,90,40,${0.3 + r() * 0.3})`; c.beginPath(); c.arc(r() * s, 150 + r() * 106, 4 + r() * 18, 0, 7); c.fill(); }
      }
    }, 14);
  },
  concrete(dark = false) {
    return make('concrete' + dark, 256, (c, s, r) => {
      fill(c, dark ? '#4b4e4f' : '#8a8c88', s);
      for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${r() * 0.06})`; c.fillRect(r() * s, r() * s, 5 + r() * 40, 5 + r() * 40); }
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.strokeRect(0, 0, s, s);
    }, 20);
  },
  tile(col = '#c9cdc9') {
    return make('tile' + col, 256, (c, s, r) => {
      fill(c, col, s); c.strokeStyle = 'rgba(40,45,45,.55)'; c.lineWidth = 2;
      for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, s); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(s, i * 64); c.stroke(); }
      for (let i = 0; i < 20; i++) { c.fillStyle = `rgba(30,30,20,${r() * 0.12})`; c.fillRect(r() * s, r() * s, 10 + r() * 50, 10 + r() * 50); }
    }, 14);
  },
  wood(col = '#6a4a31') {
    return make('wood' + col, 256, (c, s, r) => {
      fill(c, col, s);
      for (let i = 0; i < 16; i++) { c.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.12})`; c.fillRect(0, i * 16, s, 1.5); }
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,220,170,${r() * 0.07})`; c.fillRect(r() * s, r() * s, 30 + r() * 80, 1); }
    }, 16);
  },
  grass() {
    return make('grass', 256, (c, s, r) => {
      fill(c, '#4a5f31', s);
      for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${60 + r() * 60},${80 + r() * 70},${25 + r() * 30},.5)`; c.fillRect(r() * s, r() * s, 2 + r() * 5, 2 + r() * 8); }
      for (let i = 0; i < 12; i++) { c.fillStyle = `rgba(80,65,40,.3)`; c.beginPath(); c.arc(r() * s, r() * s, 6 + r() * 20, 0, 7); c.fill(); }
    }, 14);
  },
  dirt() {
    return make('dirt', 256, (c, s, r) => {
      fill(c, '#6b5a43', s);
      for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '30,20,10' : '200,180,140'},${r() * 0.15})`; c.fillRect(r() * s, r() * s, 2 + r() * 9, 2 + r() * 6); }
    }, 18);
  },
  rust() {
    return make('rust', 128, (c, s, r) => {
      fill(c, '#6b4a38', s);
      for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${90 + r() * 80},${40 + r() * 40},20,${0.2 + r() * 0.3})`; c.beginPath(); c.arc(r() * s, r() * s, 2 + r() * 12, 0, 7); c.fill(); }
    }, 24);
  },
  metal(col = '#6c7378') {
    return make('metal' + col, 128, (c, s, r) => {
      fill(c, col, s);
      for (let i = 0; i < 20; i++) { c.fillStyle = `rgba(255,255,255,${r() * 0.08})`; c.fillRect(0, r() * s, s, 1 + r() * 3); }
      for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(100,60,30,.25)'; c.beginPath(); c.arc(r() * s, r() * s, 3 + r() * 9, 0, 7); c.fill(); }
    }, 12);
  },
  brick() {
    return make('brick', 256, (c, s, r) => {
      fill(c, '#5a3c33', s);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
        const off = y % 2 ? 16 : 0;
        c.fillStyle = `rgb(${110 + r() * 40},${60 + r() * 25},${50 + r() * 20})`;
        c.fillRect(x * 32 + off + 1, y * 16 + 1, 30, 14);
      }
    }, 10);
  },
  water() {
    return make('water', 256, (c, s, r) => {
      const g = c.createLinearGradient(0, 0, s, s); g.addColorStop(0, '#2c4350'); g.addColorStop(1, '#1d2f3a'); c.fillStyle = g; c.fillRect(0, 0, s, s);
      for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(200,225,240,${r() * 0.12})`; c.fillRect(r() * s, r() * s, 6 + r() * 40, 1 + r() * 2); }
    }, 8);
  },
  carpet(col = '#4a4d55') {
    return make('carpet' + col, 128, (c, s) => { fill(c, col, s); }, 26);
  },
};
