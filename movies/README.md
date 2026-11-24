# movies/ — adding a movie to Movie Universe

Every movie is an **independent application** in its own folder. The hub never merges movie engines; it discovers
manifests, builds each project in isolation and hosts the output on the same origin.

```
movies/
  _planned.json            presentation defaults for the launch lineup (titles, genres, themes)
  _template/               copy me (folders starting with "_" or "." are ignored by discovery)
  two-survivors/
    movie.json             REQUIRED manifest
    package.json           the movie's own dependencies + build script
    src/ public/ ...       untouched movie source
```

## Workflow

1. Copy your project to `movies/<id>/` (the folder name **is** the id: lowercase, digits, dashes).
2. Add `movie.json` (start from `_template/movie.json`).
3. `node scripts/movies.mjs list` — refreshes the registry (manifests only) and prints a report.
4. `node scripts/movies.mjs build <id>` — installs (if needed), builds and copies the output to `public/movies/<id>/`.
5. `npm run dev` / `npm run build` — the hub reads `src/generated/movies.registry.json`.

Commands (all sequential, one lock file, no parallel builds):

| Command | What it does |
| --- | --- |
| `node scripts/movies.mjs list` | discovery + report. Reads `movies/*/movie.json`, stats a few files. Never recursive. |
| `node scripts/movies.mjs build [id…] [--force] [--keep-going]` | builds movies one at a time; unchanged movies are skipped via `.movie-cache/` (see cache semantics below). |
| `node scripts/movies.mjs clean <id>` | removes hosted output + cache of one movie. |
| `POST /api/dev/refresh` | dev-only explicit registry refresh. |

`next dev` and `next build` run discovery once at start-up (manifests only). There is **no file watcher** on movie sources.
On Vercel, `vercel.json` runs `node scripts/movies.mjs build && next build`.

## movie.json

Required: `id`, `title`, `synopsis`, `genre` (string array). Everything else has defaults.

| Field | Notes |
| --- | --- |
| `tagline`, `description`, `tags`, `releaseYear`, `runtime` (minutes), `featured`, `order`, `addedAt` (`YYYY-MM-DD`) | optional metadata. Ratings/views are intentionally not supported. |
| `poster`, `backdrop`, `thumbnail` | paths relative to the movie folder. Validated, then copied to `public/movie-art/<id>/`. Without them the portal draws generated art from the theme. |
| `status` | `published` (default) · `draft` (dev only) · `disabled` (hidden, still reported) |
| `type` | `web` (default) · `video` with `video: { "src", "format": "mp4" \| "webm" \| "hls" }` |
| `framework` | free-text label for diagnostics |
| `entry` | route inside the movie, appended to `/movies/<id>/index.html` (e.g. `"#/play"`) |
| `build.adapter` | `vite` · `static` · `cra` · `next-export` · `custom` |
| `build.version` | bump to force a rebuild (see cache semantics). |
| `build.buildCommand`, `installCommand`, `outputDir`, `env`, `spa` | overrides. `spa: true` rewrites unknown sub-paths to the movie's `index.html`. |
| `trailer` | `.mp4/.webm` path/URL (inline player) or any URL (opens in a new tab) |
| `subtitles` | `[{ "lang", "label", "src" }]` — `src` used for `video` type; web movies receive a `subtitles` message |
| `progress` | `{ "enabled": true }` only if the movie really reports playback progress |
| `theme` | `{ primary, secondary, accent, atmosphere: ruins\|forest\|noir\|romance\|egypt\|cosmic, particles: dust\|fog\|rain\|sand\|bokeh\|motes }` — portal presentation only |

## Integration adapters (the contract)

Every build receives these environment variables: `MOVIE_ID`, `MOVIE_BASE_PATH` (`/movies/<id>/`),
`MOVIE_BASE_PATH_NO_SLASH`, `VITE_BASE`, `BASE_PATH`, `NEXT_PUBLIC_BASE_PATH`, `PUBLIC_URL`.

| Adapter | Build | Output | Base-path handling |
| --- | --- | --- | --- |
| `vite` | `npx vite build --base=/movies/<id>/ --outDir dist` | `dist` | automatic via CLI flag — **no change to the movie** |
| `cra` | `npm run build` with `PUBLIC_URL` | `build` | automatic via `PUBLIC_URL` |
| `next-export` | `npx next build` | `out` | the movie's `next.config` must have `output: "export"` and `basePath: process.env.NEXT_PUBLIC_BASE_PATH` (minimal safe change) |
| `static` | none | `public` (or `build.outputDir`) | files are copied as they are; use relative URLs |
| `custom` | `build.buildCommand` | `build.outputDir` | the command reads `MOVIE_BASE_PATH` |

Safety rules enforced by the CLI: output only ever goes to `public/movies/<id>/`; the id is validated; one movie builds
at a time; a lock file prevents parallel runs; after each build `index.html` is scanned for root-absolute URLs
(`/assets/x.js`) that would break under the sub-path and a warning is printed. A failed movie never blocks the hub — it is reported as
“Not built yet” with the reason. Set `MOVIES_STRICT=1` to make build failures fatal.

**Cache semantics** (`.movie-cache/<id>.json`): the cache fingerprint is one stat per small metadata file
(`movie.json`, `package.json`, the lockfile) plus the build config from the manifest — deliberately not a recursive walk of every
source file. A movie is skipped only when those files are unchanged and a cache entry exists. If you change source files without
touching `movie.json`/`package.json`/lockfiles, either bump `build.version` in the movie's `movie.json` (the explicit rebuild marker)
or run `node scripts/movies.mjs build <id> --force`.

The movie is loaded from `/movies/<id>/index.html` (always explicit, so relative asset URLs resolve) inside a same-origin
iframe: `sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-popups allow-modals allow-downloads"`.
`allow-same-origin` is required so movies can use localStorage / IndexedDB; only trusted, repository-owned movies belong here.

## postMessage protocol `movie-universe/1`

Optional. The hub accepts a message only when `event.origin === location.origin` **and** `event.source` is its own iframe.

```
movie → hub   { protocol: "movie-universe/1", type: "ready" }
              { protocol: "movie-universe/1", type: "progress", position: <seconds>, duration: <seconds> }
              { protocol: "movie-universe/1", type: "ended", duration?: <seconds> }
hub → movie   { protocol: "movie-universe/1", type: "hello", movieId, subtitles: <lang|null> }
              { protocol: "movie-universe/1", type: "subtitles", lang: <lang|null> }
```

`progress`/`ended` are stored (localStorage) only when `movie.json` sets `progress.enabled`. `_template/movie-universe-bridge.js`
is a ready-made helper. Movies that send nothing still play; the hub simply shows no progress.

## Vercel notes

* One deployment: hub + `public/movies/*`. Hashed bundles under `/movies/<id>/assets/` are served with `immutable` caching (`next.config.ts`).
* Install dependencies and build happen in `vercel.json`'s `buildCommand`, sequentially. Large movies lengthen the build; check Vercel's current build-time and deployment-size limits and keep media compressed.
* No database, no serverless functions are needed for playback (`/api/health` is the only API route besides the dev-only refresh).
