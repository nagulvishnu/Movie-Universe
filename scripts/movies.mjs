#!/usr/bin/env node
// Movie Universe CLI
//
//   node scripts/movies.mjs discover            Refresh the registry (manifests only, fast)
//   node scripts/movies.mjs list                Print discovery report
//   node scripts/movies.mjs build [id ...]      Build movies SEQUENTIALLY into public/movies/<id>/
//       --force                                 Ignore the build cache
//       --keep-going                            Do not stop at the first failed movie
//   node scripts/movies.mjs clean <id>          Remove hosted output + cache for one movie
//
// Safety rules: one movie at a time, one lock file (no concurrent builds), per-movie cache so
// unchanged movies are skipped, output isolated to public/movies/<id>/ (id is validated).

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { discover, summarize, ROOT, MOVIES_DIR, PUBLIC_MOVIES } from "./lib/discover.mjs";

const CACHE_DIR = path.join(ROOT, ".movie-cache");
const LOCK_FILE = path.join(CACHE_DIR, "build.lock");
/** Small metadata files stat'ed per movie for invalidation (never a recursive source walk). */
const FP_FILES = ["movie.json", "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"];

const log = (m = "") => console.log(m);
const tag = (s) => `[movies] ${s}`;

function printReport(registry) {
  log(tag(`discovered ${registry.movies.length} movie slot(s): ` + JSON.stringify(summarize(registry))));
  for (const m of registry.movies) {
    const mark = { ready: "✔", unbuilt: "◌", missing: "·", invalid: "✘", draft: "~", disabled: "-" }[m.status] || "?";
    log(`  ${mark} ${m.id.padEnd(28)} ${m.status.padEnd(9)} ${m.status === "ready" ? "" : m.statusReason}`);
  }
  for (const d of registry.diagnostics) {
    if (d.level === "error" || d.level === "warning") log(tag(`${d.level.toUpperCase()} ${d.folder}: ${d.message}`));
  }
}

/**
 * Cheap invalidation fingerprint: one stat per small metadata file (the manifest + lockfiles).
 * Deliberately NOT a recursive source-file walk: hashing every file of a large movie project during
 * every build costs CPU and disk on the weakest laptops for little invalidation gain.
 *
 * Cache semantics: a movie is skipped only when movie.json, package.json and the lockfile(s) are
 * unchanged AND a cache file exists. For source edits that do not touch those files, use the
 * explicit mechanism — bump `build.version` in movie.json, or run `node scripts/movies.mjs build <id> --force`.
 */
function fingerprint(dir) {
  const h = crypto.createHash("sha1");
  for (const f of FP_FILES) {
    try {
      const s = fs.statSync(path.join(dir, f));
      h.update(`${f}:${s.size}:${Math.floor(s.mtimeMs)}\n`);
    } catch {
      /* missing file (e.g. no lockfile) is fine */
    }
  }
  return h.digest("hex");
}

function acquireLock() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (fs.existsSync(LOCK_FILE)) {
    const pid = Number(fs.readFileSync(LOCK_FILE, "utf8"));
    let alive = false;
    try {
      process.kill(pid, 0);
      alive = pid !== process.pid;
    } catch {
      alive = false;
    }
    if (alive) {
      console.error(tag(`another movie build is running (pid ${pid}). Refusing to start a parallel build.`));
      process.exit(1);
    }
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid));
  const release = () => {
    try {
      fs.rmSync(LOCK_FILE, { force: true });
    } catch {}
  };
  process.on("exit", release);
  process.on("SIGINT", () => process.exit(130));
  process.on("SIGTERM", () => process.exit(143));
}

function run(cmd, cwd, env) {
  log(tag(`$ ${cmd}   (in ${path.relative(ROOT, cwd) || "."})`));
  const r = spawnSync(cmd, { cwd, shell: true, stdio: "inherit", env: { ...process.env, ...env } });
  if (r.status !== 0) throw new Error(`Command failed (exit ${r.status}): ${cmd}`);
}

function dirSize(dir) {
  let total = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else total += fs.statSync(p).size;
    }
  };
  walk(dir);
  return total;
}

function buildCommandFor(movie) {
  const b = movie.build;
  if (b.buildCommand) return b.buildCommand;
  switch (b.adapter) {
    case "vite":
      // --base makes every asset URL resolve from /movies/<id>/ without touching the movie's own config.
      return `npx vite build --base=${movie.hostPath} --outDir ${b.outputDir}`;
    case "cra":
      return "npm run build";
    case "next-export":
      return "npx next build";
    case "static":
      return null;
    default:
      return "npm run build";
  }
}

function buildOne(movie, force) {
  const dir = path.join(MOVIES_DIR, movie.id);
  const target = path.join(PUBLIC_MOVIES, movie.id);
  const cacheFile = path.join(CACHE_DIR, `${movie.id}.json`);
  const fp = crypto.createHash("sha1").update(fingerprint(dir)).update(JSON.stringify(movie.build)).digest("hex");

  if (!force && fs.existsSync(path.join(target, "index.html")) && fs.existsSync(cacheFile)) {
    try {
      if (JSON.parse(fs.readFileSync(cacheFile, "utf8")).fingerprint === fp) {
        log(tag(`✔ ${movie.id}: unchanged, skipping (cache hit)`));
        return "cached";
      }
    } catch {}
  }

  const started = Date.now();
  log(tag(`▶ building ${movie.id} (adapter: ${movie.build.adapter})`));
  const env = {
    ...movie.build.env,
    MOVIE_ID: movie.id,
    MOVIE_BASE_PATH: movie.hostPath,
    MOVIE_BASE_PATH_NO_SLASH: movie.hostPath.replace(/\/$/, ""),
    VITE_BASE: movie.hostPath,
    BASE_PATH: movie.hostPath.replace(/\/$/, ""),
    NEXT_PUBLIC_BASE_PATH: movie.hostPath.replace(/\/$/, ""),
    PUBLIC_URL: movie.hostPath.replace(/\/$/, ""),
    NODE_ENV: "production",
  };

  if (movie.build.adapter !== "static" && fs.existsSync(path.join(dir, "package.json"))) {
    if (!fs.existsSync(path.join(dir, "node_modules"))) {
      const install =
        movie.build.installCommand ||
        (fs.existsSync(path.join(dir, "package-lock.json")) ? "npm ci --no-audit --no-fund" : "npm install --no-audit --no-fund");
      // NODE_ENV=production would skip devDependencies (vite etc.), so install without it.
      run(install, dir, { ...env, NODE_ENV: "development" });
    }
  }
  const cmd = buildCommandFor(movie);
  if (cmd) run(cmd, dir, env);

  const out = path.resolve(dir, movie.build.outputDir);
  if (!fs.existsSync(path.join(out, "index.html"))) {
    throw new Error(`Build finished but ${path.relative(ROOT, path.join(out, "index.html"))} does not exist. Check build.outputDir in movie.json.`);
  }

  // Isolated output: only ever writes inside public/movies/<id>/ (id is validated by discovery).
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(out, target, { recursive: true });

  const html = fs.readFileSync(path.join(target, "index.html"), "utf8");
  const rootAbs = [...html.matchAll(/(?:src|href)=["'](\/(?!\/)[^"']*)["']/g)].map((m) => m[1]).filter((u) => !u.startsWith(movie.hostPath));
  if (rootAbs.length) {
    log(tag(`⚠ ${movie.id}: index.html references root-absolute URLs that will not resolve under ${movie.hostPath}:`));
    for (const u of rootAbs.slice(0, 5)) log(`     ${u}`);
    log(tag("  Fix: set the build base path (Vite: base './' or --base; CRA: homepage; Next: basePath). See movies/README.md."));
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify({ fingerprint: fp }));
  log(tag(`✔ ${movie.id}: built in ${((Date.now() - started) / 1000).toFixed(1)}s, ${(dirSize(target) / 1048576).toFixed(1)} MB → public/movies/${movie.id}/`));
  return "built";
}

const [, , command = "list", ...rest] = process.argv;
const flags = new Set(rest.filter((a) => a.startsWith("--")));
const ids = rest.filter((a) => !a.startsWith("--"));

if (command === "discover" || command === "list") {
  const { registry } = discover();
  printReport(registry);
} else if (command === "build") {
  const { registry } = discover();
  printReport(registry);
  let candidates = registry.movies.filter((m) => m.type === "web" && (m.status === "unbuilt" || m.status === "ready" || m.status === "draft"));
  if (ids.length) candidates = candidates.filter((m) => ids.includes(m.id));
  candidates = candidates.filter((m) => m.sourcePresent);
  if (candidates.length === 0) {
    log(tag("nothing to build (no movie sources present). The portal will report missing movies gracefully."));
  } else {
    acquireLock();
    const results = [];
    for (const m of candidates) {
      try {
        results.push([m.id, buildOne(m, flags.has("--force"))]);
      } catch (e) {
        console.error(tag(`✘ ${m.id}: ${e.message}`));
        results.push([m.id, "failed"]);
        if (!flags.has("--keep-going")) break;
      }
    }
    const { registry: after } = discover();
    log(tag("summary: " + results.map(([i, r]) => `${i}=${r}`).join(", ")));
    log(tag("registry: " + JSON.stringify(summarize(after))));
    // A failing movie must not make the whole hub undeployable: hub shows a friendly "not built" state.
    if (results.some(([, r]) => r === "failed") && process.env.MOVIES_STRICT === "1") process.exit(1);
  }
} else if (command === "clean") {
  for (const id of ids) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) continue;
    fs.rmSync(path.join(PUBLIC_MOVIES, id), { recursive: true, force: true });
    fs.rmSync(path.join(CACHE_DIR, `${id}.json`), { force: true });
    log(tag(`cleaned ${id}`));
  }
  discover();
} else {
  console.error(tag(`unknown command "${command}". Use: discover | list | build | clean`));
  process.exit(1);
}
