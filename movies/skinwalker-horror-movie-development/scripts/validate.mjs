import { build } from "esbuild";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const result = await build({
  stdin: { contents: "export * from './src/movie/index.ts'; export { lineDur } from './src/movie/types.ts';", resolveDir: process.cwd(), sourcefile: "validate-entry.ts", loader: "ts" },
  bundle: true, write: false, platform: "node", format: "esm", target: "es2020", logLevel: "silent",
});
const tmp = join(tmpdir(), `validate-skinwalker-${process.pid}.mjs`);
writeFileSync(tmp, result.outputFiles[0].text);
const mod = await import(pathToFileURL(tmp).href);
rmSync(tmp, { force: true });
const { MOVIE, lineDur } = mod;
const scenes = MOVIE.scenes;

let failures = 0;
let shortOverlaps = 0;
const check = (ok, msg) => { if (!ok) { failures++; console.error("FAIL:", msg); } };
check(scenes.length > 0, "screenplay has scenes");

let prevEnd = 0;
scenes.forEach((s, i) => {
  check(Math.abs(s.start - prevEnd) < 1e-6, `${s.id}: contiguous start (${s.start} vs ${prevEnd})`);
  check(s.dur > 0, `${s.id}: duration > 0`);
  const lines = [...s.lines].sort((a, b) => a.t - b.t);
  let lineEnd = 0;
  for (const l of lines) {
    const end = l.t + lineDur(l);
    check(end <= s.dur + 0.05, `${s.id}/${l.id}: dialogue fits in scene (${end.toFixed(2)} > ${s.dur})`);
    check(l.t >= lineEnd - 1.0, `${s.id}/${l.id}: overlap with previous line exceeds 1s (${l.t} < ${lineEnd.toFixed(2)})`);
    if (l.t < lineEnd - 0.05) shortOverlaps++;
    lineEnd = Math.max(lineEnd, end);
  }
  for (const card of s.cards ?? []) check(card.t + card.d <= s.dur + 0.05, `${s.id}: card fits in scene`);
  for (const cue of s.cues ?? []) check(cue.t <= s.dur + 0.05, `${s.id}: cue at ${cue.t} within scene`);
  prevEnd = s.start + s.dur;
});
check(Math.abs(MOVIE.total - prevEnd) < 1e-6, "MOVIE.total matches summed scene durations");
const credits = scenes.findIndex((s) => s.id === "credits");
const post = scenes.findIndex((s) => s.id === "post");
check(credits > 0 && post > credits, "credits precede post-credit scene");

const voiceDir = join(process.cwd(), "public", "audio", "voices");
const manifestPath = join(voiceDir, "manifest.json");
let manifest = {};
if (existsSync(manifestPath)) {
  try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { failures++; console.error("FAIL: voice manifest is not valid JSON"); }
}
for (const [id, file] of Object.entries(manifest)) check(existsSync(join(voiceDir, file)), `recorded voice ${id} -> ${file} exists`);

console.log(`Scenes: ${scenes.length}`);
console.log(`Runtime: ${MOVIE.total.toFixed(2)}s (${Math.floor(MOVIE.total / 60)}m ${(MOVIE.total % 60).toFixed(1)}s)`);
console.log(`Recorded voice files declared: ${Object.keys(manifest).length}`);
console.log(`Intentional short dialogue overlaps (<1s): ${shortOverlaps}`);
if (failures) { console.error(`\n${failures} validation failure(s).`); process.exit(1); }
console.log("\nAll timeline / dialogue / audio-manifest checks passed.");
