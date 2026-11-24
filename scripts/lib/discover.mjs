// Movie Universe — build-time discovery.
//
// Scans ONLY: movies/*/movie.json (direct children of movies/), plus a handful of
// cheap fs.stat calls (package.json, built index.html, declared artwork files).
// It never recurses into source trees, never executes movie code and never touches the network.
//
// Output: src/generated/movies.registry.json (deterministic: no timestamps, stable ordering).

import fs from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
export const MOVIES_DIR = path.join(ROOT, "movies");
export const REGISTRY_FILE = path.join(ROOT, "src", "generated", "movies.registry.json");
export const PUBLIC_MOVIES = path.join(ROOT, "public", "movies");
export const PUBLIC_ART = path.join(ROOT, "public", "movie-art");

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ADAPTERS = ["vite", "static", "cra", "next-export", "custom"];
const ATMOSPHERES = ["ruins", "forest", "noir", "romance", "egypt", "cosmic"];
const PARTICLES = ["dust", "fog", "rain", "sand", "bokeh", "motes"];
const STATUSES = ["published", "draft", "disabled"];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const ADAPTER_DEFAULT_OUT = { vite: "dist", static: "public", cra: "build", "next-export": "out", custom: "dist" };

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function exists(file) {
  try {
    fs.statSync(file);
    return true;
  } catch {
    return false;
  }
}

function isDir(file) {
  try {
    return fs.statSync(file).isDirectory();
  } catch {
    return false;
  }
}

/** Resolve a manifest-relative path and make sure it cannot escape the movie directory. */
function safeJoin(base, rel) {
  const resolved = path.resolve(base, rel);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) return null;
  return resolved;
}

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

function strList(v) {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()) : [];
}

/** Validate + normalize a (possibly planned) manifest. Returns { entry, issues }. */
function normalize(folder, raw, planned, dirPath) {
  const issues = [];
  const err = (message) => issues.push({ level: "error", message });
  const warn = (message) => issues.push({ level: "warning", message });

  // Planned data supplies defaults for optional presentation fields only.
  const m = { ...(planned || {}), ...raw };
  if (planned?.theme || raw?.theme) m.theme = { ...(planned?.theme || {}), ...(raw?.theme || {}) };

  const id = str(m.id);
  if (!id) err('Missing required field "id".');
  else if (!ID_RE.test(id)) err(`"id" must be lowercase letters, digits and dashes (got "${id}").`);
  else if (id !== folder) err(`"id" ("${id}") must match the folder name ("${folder}").`);

  const title = str(m.title);
  if (!title) err('Missing required field "title".');
  const synopsis = str(m.synopsis);
  if (!synopsis) err('Missing required field "synopsis".');
  const genre = strList(m.genre);
  if (genre.length === 0) err('Missing required field "genre" (array of strings).');

  const status = m.status === undefined ? "published" : m.status;
  if (!STATUSES.includes(status)) err(`"status" must be one of ${STATUSES.join(", ")}.`);

  const type = m.type === "video" ? "video" : "web";
  let video;
  if (type === "video") {
    const src = str(m.video?.src);
    const format = m.video?.format;
    if (!src) err('type "video" requires video.src.');
    else if (!["mp4", "webm", "hls"].includes(format)) err('video.format must be "mp4", "webm" or "hls".');
    else video = { src, format };
  }

  let releaseYear;
  if (m.releaseYear !== undefined) {
    if (Number.isInteger(m.releaseYear) && m.releaseYear > 1880 && m.releaseYear < 2200) releaseYear = m.releaseYear;
    else warn('"releaseYear" ignored (must be an integer year).');
  }
  let runtime;
  if (m.runtime !== undefined) {
    if (typeof m.runtime === "number" && m.runtime > 0 && m.runtime < 1000) runtime = Math.round(m.runtime);
    else warn('"runtime" ignored (must be minutes as a positive number).');
  }

  // Build configuration (only meaningful for "web" movies).
  const b = m.build && typeof m.build === "object" ? m.build : {};
  const adapter = b.adapter === undefined ? "vite" : b.adapter;
  if (type === "web" && !ADAPTERS.includes(adapter)) err(`build.adapter must be one of ${ADAPTERS.join(", ")}.`);
  const versionStr = b.version === undefined || b.version === null ? "" : String(b.version).trim();
  const build = {
    adapter: ADAPTERS.includes(adapter) ? adapter : "vite",
    version: versionStr || undefined,
    installCommand: str(b.installCommand) || undefined,
    buildCommand: str(b.buildCommand) || undefined,
    outputDir: str(b.outputDir) || ADAPTER_DEFAULT_OUT[ADAPTERS.includes(adapter) ? adapter : "vite"],
    env: b.env && typeof b.env === "object" ? Object.fromEntries(Object.entries(b.env).filter(([, v]) => typeof v === "string")) : {},
    spa: b.spa === true,
  };
  if (type === "web" && adapter === "custom" && !build.buildCommand) err('build.adapter "custom" requires build.buildCommand.');
  if (type === "web" && dirPath) {
    if (!safeJoin(dirPath, build.outputDir)) err("build.outputDir must stay inside the movie folder.");
  }

  // Artwork: paths are relative to the movie folder; discovery only stats them.
  const artwork = {};
  const artSources = {};
  for (const key of ["poster", "backdrop", "thumbnail"]) {
    const rel = str(m[key]);
    if (!rel) continue;
    if (!dirPath) continue;
    const abs = safeJoin(dirPath, rel);
    if (!abs) {
      warn(`"${key}" path escapes the movie folder and was ignored.`);
    } else if (!exists(abs)) {
      warn(`"${key}" file not found: ${rel}`);
    } else {
      artSources[key] = abs;
      artwork[key] = `/movie-art/${folder}/${path.basename(abs)}`;
    }
  }
  if (!artwork.thumbnail && artwork.poster) artwork.thumbnail = artwork.poster;

  const theme = {
    primary: HEX_RE.test(m.theme?.primary || "") ? m.theme.primary : "#4f7cff",
    secondary: HEX_RE.test(m.theme?.secondary || "") ? m.theme.secondary : "#7a3cff",
    accent: HEX_RE.test(m.theme?.accent || "") ? m.theme.accent : "#f5c46b",
    atmosphere: ATMOSPHERES.includes(m.theme?.atmosphere) ? m.theme.atmosphere : "cosmic",
    particles: PARTICLES.includes(m.theme?.particles) ? m.theme.particles : "motes",
  };

  const subtitles = Array.isArray(m.subtitles)
    ? m.subtitles
        .filter((s) => s && typeof s.lang === "string" && typeof s.label === "string")
        .map((s) => ({ lang: s.lang, label: s.label, src: typeof s.src === "string" ? s.src : undefined }))
    : [];

  const entryRaw = str(m.entry) || "";
  const entry = entryRaw.replace(/^\/+/, "");

  const entryObj = {
    id: id || folder,
    title: title || folder,
    tagline: str(m.tagline),
    synopsis,
    description: str(m.description) || synopsis,
    genre,
    releaseYear,
    runtime,
    featured: m.featured === true,
    tags: strList(m.tags),
    order: typeof m.order === "number" ? m.order : 1000,
    addedAt: /^\d{4}-\d{2}-\d{2}/.test(str(m.addedAt)) ? str(m.addedAt) : undefined,
    type,
    framework: str(m.framework) || undefined,
    build: type === "web" ? build : undefined,
    entry,
    hostPath: `/movies/${folder}/`,
    watchUrl: `/watch/${folder}`,
    artwork,
    trailer: str(m.trailer) || undefined,
    subtitles,
    progress: m.progress === true || m.progress?.enabled === true,
    theme,
    video,
    sourcePresent: false,
    status: "invalid",
    statusReason: "",
  };

  return { entry: entryObj, issues, declaredStatus: status, artSources };
}

function copyArt(folder, artSources) {
  for (const abs of Object.values(artSources)) {
    const target = path.join(PUBLIC_ART, folder, path.basename(abs));
    try {
      const a = fs.statSync(abs);
      let same = false;
      if (exists(target)) {
        const t = fs.statSync(target);
        same = t.size === a.size && t.mtimeMs >= a.mtimeMs;
      }
      if (!same) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(abs, target);
      }
    } catch {
      /* reported as a warning by validation; never fatal */
    }
  }
}

function writeIfChanged(file, content) {
  try {
    if (fs.readFileSync(file, "utf8") === content) return false;
  } catch {
    /* new file */
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, file);
  return true;
}

/**
 * Run discovery. Options: { write: boolean (default true), syncArt: boolean (default true) }
 */
export function discover(options = {}) {
  const { write = true, syncArt = true } = options;
  const diagnostics = [];
  const entries = new Map();

  // Planned launch lineup: presentation defaults for movies that are expected but may not be added yet.
  let planned = [];
  const plannedFile = path.join(MOVIES_DIR, "_planned.json");
  if (exists(plannedFile)) {
    try {
      const parsed = readJson(plannedFile);
      planned = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      diagnostics.push({ folder: "_planned.json", level: "error", message: `Cannot parse _planned.json: ${e.message}` });
    }
  }
  const plannedById = new Map(planned.filter((p) => p && typeof p.id === "string").map((p) => [p.id, p]));

  // Direct children of movies/ only. Names starting with "_" or "." are ignored (templates, hidden).
  let folders = [];
  if (isDir(MOVIES_DIR)) {
    folders = fs
      .readdirSync(MOVIES_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith(".") && d.name !== "node_modules")
      .map((d) => d.name)
      .sort();
  } else {
    diagnostics.push({ folder: "movies", level: "warning", message: "movies/ directory not found." });
  }

  for (const folder of folders) {
    const dirPath = path.join(MOVIES_DIR, folder);
    const manifestFile = path.join(dirPath, "movie.json");
    const plan = plannedById.get(folder);
    const fail = (message, rawTitle) => {
      diagnostics.push({ folder, level: "error", message });
      const base = plan ? normalize(folder, { id: folder, title: plan.title, synopsis: plan.synopsis, genre: plan.genre }, plan, dirPath).entry : null;
      const e = base || {
        id: folder, title: rawTitle || folder, tagline: "", synopsis: "", description: "", genre: [], featured: false, tags: [], order: 1000,
        type: "web", entry: "", hostPath: `/movies/${folder}/`, watchUrl: `/watch/${folder}`, artwork: {}, subtitles: [], progress: false,
        theme: { primary: "#4f7cff", secondary: "#7a3cff", accent: "#f5c46b", atmosphere: "cosmic", particles: "motes" }, sourcePresent: true,
      };
      e.status = "invalid";
      e.statusReason = message;
      e.sourcePresent = true;
      entries.set(folder, e);
    };

    if (!exists(manifestFile)) {
      fail("movie.json not found in this folder. Add a manifest (see movies/_template/movie.json).");
      continue;
    }
    let raw;
    try {
      raw = readJson(manifestFile);
    } catch (e) {
      fail(`movie.json is not valid JSON: ${e.message}`);
      continue;
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      fail("movie.json must contain a JSON object.");
      continue;
    }

    const { entry, issues, declaredStatus, artSources } = normalize(folder, raw, plan, dirPath);
    for (const i of issues) diagnostics.push({ folder, id: entry.id, ...i });
    const errors = issues.filter((i) => i.level === "error");

    entry.sourcePresent = true;
    if (errors.length) {
      entry.status = "invalid";
      entry.statusReason = errors.map((e) => e.message).join(" ");
    } else if (declaredStatus === "disabled") {
      entry.status = "disabled";
      entry.statusReason = "Disabled in movie.json (status: disabled).";
    } else if (declaredStatus === "draft") {
      entry.status = "draft";
      entry.statusReason = "Draft: visible only in development.";
    } else if (entry.type === "video") {
      entry.status = "ready";
    } else {
      const hosted = exists(path.join(PUBLIC_MOVIES, folder, "index.html"));
      const hasSource = exists(path.join(dirPath, "package.json")) || entry.build?.adapter === "static";
      if (hosted) {
        entry.status = "ready";
      } else if (hasSource) {
        entry.status = "unbuilt";
        entry.statusReason = "Source found but not built yet. Run: node scripts/movies.mjs build " + folder;
      } else {
        entry.status = "invalid";
        entry.statusReason = "No package.json found in the movie folder, so it cannot be built.";
        diagnostics.push({ folder, id: entry.id, level: "error", message: entry.statusReason });
      }
    }
    if (syncArt && write && errors.length === 0) copyArt(folder, artSources);

    if (entries.has(entry.id) && entry.id !== folder) {
      diagnostics.push({ folder, id: entry.id, level: "error", message: `Duplicate movie id "${entry.id}".` });
    }
    entries.set(folder, entry);
  }

  // Duplicate id validation (ids must equal folder names, so duplicates indicate corrupted manifests).
  const seen = new Map();
  for (const [folder, e] of entries) {
    if (seen.has(e.id) && seen.get(e.id) !== folder) {
      diagnostics.push({ folder, id: e.id, level: "error", message: `Duplicate movie id "${e.id}" (also used by "${seen.get(e.id)}").` });
      e.status = "invalid";
      e.statusReason = `Duplicate movie id "${e.id}".`;
    } else seen.set(e.id, folder);
  }

  // Planned titles with no folder yet: graceful "not added" entries.
  for (const p of planned) {
    if (!p || typeof p.id !== "string" || entries.has(p.id)) continue;
    const { entry } = normalize(p.id, { id: p.id, title: p.title, synopsis: p.synopsis, genre: p.genre }, p, null);
    entry.status = "missing";
    entry.statusReason = `This movie has not been added yet. Create movies/${p.id}/ with a movie.json and its project source.`;
    entry.sourcePresent = false;
    entries.set(p.id, entry);
  }

  const movies = [...entries.values()].sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title, "en") || a.id.localeCompare(b.id),
  );
  diagnostics.sort((a, b) => a.folder.localeCompare(b.folder) || a.level.localeCompare(b.level) || a.message.localeCompare(b.message));

  const registry = { schema: 1, movies, diagnostics };
  let changed = false;
  if (write) changed = writeIfChanged(REGISTRY_FILE, JSON.stringify(registry, null, 2) + "\n");
  return { registry, changed };
}

export function summarize(registry) {
  const counts = {};
  for (const m of registry.movies) counts[m.status] = (counts[m.status] || 0) + 1;
  return counts;
}
