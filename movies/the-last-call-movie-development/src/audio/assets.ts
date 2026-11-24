/**
 * Asset registry for imported audio. Reads public/audio/manifest.json.
 * Only files that actually fetch and decode are ever reported as loaded.
 */
export interface Manifest {
  dialogue: Record<string, string>;
  music: Record<string, string>;
  sfx: Record<string, string>;
}

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL || "/";
let manifest: Manifest = { dialogue: {}, music: {}, sfx: {} };
const buffers = new Map<string, AudioBuffer>();
const failed = new Set<string>();
const pending = new Set<string>();

export async function loadManifest(): Promise<Manifest> {
  try {
    const r = await fetch(`${base}audio/manifest.json`, { cache: "no-cache" });
    const ct = r.headers.get("content-type") || "";
    if (r.ok && ct.includes("json")) {
      const j = await r.json();
      manifest = { dialogue: j.dialogue ?? {}, music: j.music ?? {}, sfx: j.sfx ?? {} };
    }
  } catch {
    /* no manifest: everything falls back to synthesis */
  }
  return manifest;
}

export const hasEntry = (kind: keyof Manifest, key: string) => !!manifest[kind][key];

export async function preloadBuffer(ctx: AudioContext, kind: keyof Manifest, key: string) {
  const file = manifest[kind][key];
  const id = `${kind}:${key}`;
  if (!file || buffers.has(id) || failed.has(id) || pending.has(id)) return;
  pending.add(id);
  try {
    const r = await fetch(`${base}${file}`);
    const ct = r.headers.get("content-type") || "";
    if (!r.ok || ct.includes("text/html")) throw new Error("missing");
    const data = await r.arrayBuffer();
    buffers.set(id, await ctx.decodeAudioData(data));
  } catch {
    failed.add(id);
  } finally {
    pending.delete(id);
  }
}

export const getBuffer = (kind: keyof Manifest, key: string) => buffers.get(`${kind}:${key}`);

export function report() {
  return {
    registered: {
      dialogue: Object.keys(manifest.dialogue).length,
      music: Object.keys(manifest.music).length,
      sfx: Object.keys(manifest.sfx).length,
    },
    decoded: buffers.size,
    failed: failed.size,
  };
}
