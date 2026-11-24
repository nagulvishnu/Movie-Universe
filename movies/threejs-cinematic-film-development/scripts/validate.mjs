import { build } from "esbuild";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const entry = [
  "export * from './src/story/screenplay.ts';",
  "export { estimateDur } from './src/story/helpers.ts';",
].join("\n");

const result = await build({
  stdin: { contents: entry, resolveDir: process.cwd(), sourcefile: "validate-entry.ts", loader: "ts" },
  bundle: true, write: false, platform: "node", format: "esm", target: "es2020", logLevel: "silent",
});
const tmp = join(tmpdir(), `validate-two-survivors-${process.pid}.mjs`);
writeFileSync(tmp, result.outputFiles[0].text);
const mod = await import(pathToFileURL(tmp).href);
rmSync(tmp, { force: true });
const { SCENES, SCENE_STARTS, TOTAL_DURATION, estimateDur } = mod;

let failures = 0;
const check = (ok, msg) => { if (!ok) { failures++; console.error("FAIL:", msg); } };

check(SCENES.length > 0, "screenplay has scenes");
let prevEnd = 0;
SCENES.forEach((s, i) => {
  check(Math.abs(SCENE_STARTS[i] - prevEnd) < 1e-6, `${s.id}: contiguous start (${SCENE_STARTS[i]} vs ${prevEnd})`);
  check(s.dur > 0, `${s.id}: duration > 0`);
  const lines = [...(s.dialogue ?? [])].sort((a, b) => a.at - b.at);
  let lineEnd = 0;
  for (const l of lines) {
    const end = l.at + estimateDur(l);
    check(end <= s.dur + 0.05, `${s.id}/${l.id}: dialogue fits in scene (${end.toFixed(2)} > ${s.dur})`);
    check(l.at >= lineEnd - 0.05, `${s.id}/${l.id}: no overlap with previous line (${l.at} < ${lineEnd.toFixed(2)})`);
    lineEnd = Math.max(lineEnd, end);
  }
  for (const shot of s.shots ?? []) check(shot.at <= s.dur + 0.05, `${s.id}: shot at ${shot.at.toFixed(2)} within scene dur ${s.dur}`);
  prevEnd = SCENE_STARTS[i] + s.dur;
});

check(Math.abs(TOTAL_DURATION - prevEnd) < 1e-6, "TOTAL_DURATION matches summed scene durations");
const credits = SCENES.findIndex((s) => s.id === "a_credits");
const post = SCENES.findIndex((s) => s.id === "pc_monitor");
check(credits > 0 && post > credits, "credits precede post-credit scene");

const voiceDir = join(process.cwd(), "public", "audio", "voice");
const manifestPath = join(voiceDir, "manifest.json");
let manifest = {};
if (existsSync(manifestPath)) {
  try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { failures++; console.error("FAIL: voice manifest is not valid JSON"); }
}
for (const [id, file] of Object.entries(manifest)) {
  check(existsSync(join(voiceDir, file)), `recorded voice ${id} -> ${file} exists`);
}
for (const s of SCENES) for (const l of s.dialogue ?? []) {
  const file = l.voiceFile ?? manifest[l.id];
  if (file) check(existsSync(join(voiceDir, file)), `voiceFile ${file} for ${l.id} exists`);
}
const bundled = existsSync(join(process.cwd(), "dist", "index.html"));

console.log(`Scenes: ${SCENES.length}`);
console.log(`Runtime: ${TOTAL_DURATION.toFixed(2)}s (${Math.floor(TOTAL_DURATION / 60)}m ${(TOTAL_DURATION % 60).toFixed(1)}s)`);
console.log(`Recorded voice files declared: ${Object.keys(manifest).length}`);
console.log(`Production bundle present: ${bundled}`);
if (failures) { console.error(`\n${failures} validation failure(s).`); process.exit(1); }
console.log("\nAll timeline / dialogue / audio-manifest checks passed.");
