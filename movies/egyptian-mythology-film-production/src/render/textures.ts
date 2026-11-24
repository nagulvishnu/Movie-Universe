import * as THREE from 'three';

// Procedurally generated textures (no external assets). Created lazily and cached.
const cache = new Map<string, THREE.Texture>();

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function canvasTex(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat = true): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  cache.set(key, t);
  return t;
}

/** Sandstone panel carved with stylised hieroglyph-like glyphs (ankh, eye, water, bird, feather, sun, was, reed, zigzag). */
export function hieroglyphTexture(): THREE.Texture {
  return canvasTex('hiero', 512, 512, (c) => {
    const r = rng(7);
    c.fillStyle = '#c9a56c'; c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 3500; i++) { c.fillStyle = `rgba(${90 + r() * 60},${60 + r() * 40},${30},${r() * 0.12})`; c.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
    const glyphs: ((x: number, y: number, s: number) => void)[] = [
      (x, y, s) => { c.beginPath(); c.ellipse(x, y - s * 0.3, s * 0.22, s * 0.3, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + s * 0.6); c.moveTo(x - s * 0.3, y + s * 0.2); c.lineTo(x + s * 0.3, y + s * 0.2); c.stroke(); },
      (x, y, s) => { c.beginPath(); c.moveTo(x - s * 0.4, y); c.quadraticCurveTo(x, y - s * 0.4, x + s * 0.4, y); c.quadraticCurveTo(x, y + s * 0.3, x - s * 0.4, y); c.stroke(); c.beginPath(); c.arc(x, y, s * 0.1, 0, 7); c.fill(); c.moveTo(x, y + s * 0.2); c.lineTo(x, y + s * 0.5); c.stroke(); },
      (x, y, s) => { c.beginPath(); for (let i = 0; i < 3; i++) { const yy = y - s * 0.2 + i * s * 0.2; c.moveTo(x - s * 0.4, yy); for (let k = 0; k < 4; k++) c.lineTo(x - s * 0.4 + (k + 0.5) * s * 0.2, yy + (k % 2 ? s * 0.07 : -s * 0.07)); } c.stroke(); },
      (x, y, s) => { c.beginPath(); c.ellipse(x, y, s * 0.3, s * 0.18, -0.3, 0, 7); c.stroke(); c.beginPath(); c.arc(x + s * 0.3, y - s * 0.2, s * 0.1, 0, 7); c.stroke(); c.moveTo(x - s * 0.1, y + s * 0.15); c.lineTo(x - s * 0.1, y + s * 0.5); c.moveTo(x + s * 0.1, y + s * 0.15); c.lineTo(x + s * 0.1, y + s * 0.5); c.stroke(); },
      (x, y, s) => { c.beginPath(); c.ellipse(x, y, s * 0.1, s * 0.4, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x, y - s * 0.4); c.lineTo(x, y + s * 0.5); c.stroke(); },
      (x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.3, 0, 7); c.stroke(); c.beginPath(); c.arc(x, y, s * 0.1, 0, 7); c.fill(); },
      (x, y, s) => { c.beginPath(); c.moveTo(x, y - s * 0.5); c.lineTo(x, y + s * 0.5); c.moveTo(x, y + s * 0.5); c.lineTo(x - s * 0.15, y + s * 0.65); c.moveTo(x, y + s * 0.5); c.lineTo(x + s * 0.15, y + s * 0.65); c.stroke(); c.beginPath(); c.arc(x, y - s * 0.5, s * 0.1, 0, 7); c.fill(); },
      (x, y, s) => { c.beginPath(); c.moveTo(x - s * 0.3, y + s * 0.4); c.lineTo(x, y - s * 0.4); c.lineTo(x + s * 0.3, y + s * 0.4); c.closePath(); c.stroke(); },
    ];
    c.lineWidth = 4; c.lineCap = 'round';
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      const tints = ['#4a2f18', '#4a2f18', '#4a2f18', '#1f6f78', '#8a2a1a'];
      c.strokeStyle = c.fillStyle = tints[Math.floor(r() * tints.length)];
      glyphs[Math.floor(r() * glyphs.length)](32 + col * 64, 36 + row * 64, 40);
    }
    c.strokeStyle = '#3a2512'; c.lineWidth = 3;
    for (let row = 1; row < 8; row++) { c.beginPath(); c.moveTo(0, row * 64); c.lineTo(512, row * 64); c.stroke(); }
  });
}

/** Warm sand speckle. */
export function sandTexture(): THREE.Texture {
  return canvasTex('sand', 256, 256, (c) => {
    const r = rng(11);
    c.fillStyle = '#d8b878'; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { const v = 150 + r() * 80; c.fillStyle = `rgba(${v},${v * 0.8},${v * 0.5},${r() * 0.25})`; c.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); }
  });
}

/** Stone flagstones for temple floors. */
export function flagTexture(): THREE.Texture {
  return canvasTex('flag', 256, 256, (c) => {
    const r = rng(5);
    c.fillStyle = '#9b8767'; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2500; i++) { const v = 100 + r() * 70; c.fillStyle = `rgba(${v},${v * 0.9},${v * 0.7},${r() * 0.2})`; c.fillRect(r() * 256, r() * 256, 2, 2); }
    c.strokeStyle = 'rgba(40,30,20,0.7)'; c.lineWidth = 3;
    c.strokeRect(1, 1, 254, 254); c.beginPath(); c.moveTo(128, 0); c.lineTo(128, 256); c.moveTo(0, 128); c.lineTo(256, 128); c.stroke();
  });
}

/** Soft radial glow used for sprites. */
export function glowTexture(): THREE.Texture {
  return canvasTex('glow', 128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  }, false);
}

/** Night-sky body of Nut: deep blue with golden stars. */
export function starSkinTexture(): THREE.Texture {
  return canvasTex('starskin', 256, 256, (c) => {
    const r = rng(23);
    c.fillStyle = '#1b2a7a'; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      const x = r() * 256, y = r() * 256, s = 2 + r() * 5;
      c.fillStyle = '#ffe9a0'; c.beginPath();
      for (let k = 0; k < 10; k++) { const a = (k * Math.PI) / 5, rr = k % 2 ? s * 0.4 : s; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      c.fill();
    }
  });
}
