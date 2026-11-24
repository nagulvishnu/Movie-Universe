import { build } from "esbuild";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const result = await build({
  stdin: { contents: "export * from './src/movie/index.ts';", resolveDir: process.cwd(), sourcefile: "validate-entry.ts", loader: "ts" },
  bundle: true, write: false, platform: "node", format: "esm", target: "es2020", logLevel: "silent",
  define: { "import.meta.env.BASE_URL": '"/"' },
});
const tmp = join(tmpdir(), `validate-last-call-${process.pid}.mjs`);
writeFileSync(tmp, result.outputFiles[0].text);
const mod = await import(pathToFileURL(tmp).href);
rmSync(tmp, { force: true });
const { movie } = mod;

let failures = 0;
const check = (ok, msg) => { if (!ok) { failures++; console.error("FAIL:", msg); } };
check(movie.scenes.length > 0, "screenplay has scenes");
check(movie.shots.length > 0 && movie.lines.length > 0, "compiled movie has shots and lines");

let prevEnd = 0;
movie.scenes.forEach((s, i) => {
  check(Math.abs(s.start - prevEnd) < 1e-4, `${s.id}: contiguous start (${s.start.toFixed(2)} vs ${prevEnd.toFixed(2)})`);
  check(s.end > s.start, `${s.id}: positive duration`);
  prevEnd = s.end;
});
check(Math.abs(movie.duration - prevEnd) < 1e-4, "movie.duration matches summed scene durations");
for (const sh of movie.shots) {
  check(sh.end > sh.start, `shot ${sh.idx}: positive duration`);
  for (const l of sh.lines) check(l.start >= sh.start - 1e-6 && l.end <= sh.end + 1e-6, `line ${l.id} contained in shot ${sh.idx}`);
}
const lines = [...movie.lines].sort((a, b) => a.start - b.start);
for (let i = 1; i < lines.length; i++) check(lines[i].start >= lines[i - 1].end - 0.01, `${lines[i].id}: no overlap with previous line`);
for (const c of movie.cues) check(c.t >= 0 && c.t <= movie.duration + 1e-6, `cue at ${c.t} within movie`);

const credits = movie.scenes.findIndex((s) => s.id === "s18");
const post = movie.scenes.findIndex((s) => s.id === "s19a");
check(credits > 0 && post > credits, "credits precede post-credit scene");

const audioDir = join(process.cwd(), "public", "audio");
const manifestPath = join(audioDir, "manifest.json");
let manifest = {};
if (existsSync(manifestPath)) {
  try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { failures++; console.error("FAIL: audio manifest is not valid JSON"); }
}
let declared = 0;
for (const group of Object.values(manifest)) {
  if (!group || typeof group !== "object") continue;
  for (const file of Object.values(group)) {
    declared++;
    check(existsSync(join(audioDir, String(file))), `recorded asset ${file} exists`);
  }
}

console.log(`Scenes: ${movie.scenes.length} | Shots: ${movie.shots.length} | Lines: ${movie.lines.length} | Cues: ${movie.cues.length}`);
console.log(`Runtime: ${movie.duration.toFixed(2)}s (${Math.floor(movie.duration / 60)}m ${(movie.duration % 60).toFixed(1)}s)`);
console.log(`Recorded audio files declared: ${declared}`);
if (failures) { console.error(`\n${failures} validation failure(s).`); process.exit(1); }
console.log("\nAll timeline / dialogue / audio-manifest checks passed.");
