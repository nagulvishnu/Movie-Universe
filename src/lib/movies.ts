// Pure types + helpers for the movie registry. Safe to import from client and server code.
// (The registry itself is only imported by src/lib/registry.ts, so client bundles never carry it.)

export type MovieStatus = "ready" | "unbuilt" | "missing" | "invalid" | "draft" | "disabled";
export type Atmosphere = "ruins" | "forest" | "noir" | "romance" | "egypt" | "cosmic";
export type ParticleKind = "dust" | "fog" | "rain" | "sand" | "bokeh" | "motes";

export type MovieTheme = {
  primary: string;
  secondary: string;
  accent: string;
  atmosphere: Atmosphere;
  particles: ParticleKind;
};

export type Movie = {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  description: string;
  genre: string[];
  releaseYear?: number;
  runtime?: number;
  featured: boolean;
  tags: string[];
  order: number;
  addedAt?: string;
  type: "web" | "video";
  framework?: string;
  build?: { adapter: string; version?: string; outputDir: string; spa?: boolean };
  entry: string;
  hostPath: string;
  watchUrl: string;
  artwork: { poster?: string; backdrop?: string; thumbnail?: string };
  trailer?: string;
  subtitles: { lang: string; label: string; src?: string }[];
  progress: boolean;
  theme: MovieTheme;
  video?: { src: string; format: "mp4" | "webm" | "hls" };
  sourcePresent: boolean;
  status: MovieStatus;
  statusReason: string;
};

export type Diagnostic = { folder: string; id?: string; level: "error" | "warning"; message: string };
export type Registry = { schema: number; movies: Movie[]; diagnostics: Diagnostic[] };

export const isPlayable = (m: Movie) => m.status === "ready";

export const STATUS_LABEL: Record<MovieStatus, string> = {
  ready: "Now playing",
  unbuilt: "Not built yet",
  missing: "Awaiting source",
  invalid: "Needs attention",
  draft: "Draft",
  disabled: "Disabled",
};

/** URL loaded inside the viewing shell. Always an explicit index.html so relative assets resolve. */
export function movieEntryUrl(m: Movie): string {
  if (m.type === "video" && m.video) return m.video.src;
  const base = `${m.hostPath}index.html`;
  const e = m.entry;
  if (!e || e === "index.html") return base;
  if (e.startsWith("#") || e.startsWith("?")) return base + e;
  return `${m.hostPath}${e}`;
}

export function formatRuntime(min?: number): string | null {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------- collections (visual identity only; membership is computed from real metadata) ----------

export type CollectionDef = {
  slug: string;
  label: string;
  match: string[];
  blurb: string;
  from: string;
  to: string;
  icon: "Swords" | "Compass" | "Skull" | "Search" | "Zap" | "Heart" | "Drama" | "Landmark" | "Sparkles" | "Clapperboard" | "Tag";
};

export const COLLECTIONS: CollectionDef[] = [
  { slug: "action", label: "Action", match: ["action"], blurb: "Pulse-driven worlds in motion.", from: "#ff5a3c", to: "#7a1d1d", icon: "Swords" },
  { slug: "adventure", label: "Adventure", match: ["adventure"], blurb: "Journeys beyond the horizon.", from: "#35d3a1", to: "#0c4a5c", icon: "Compass" },
  { slug: "horror", label: "Horror", match: ["horror"], blurb: "Do not look away.", from: "#9b1c31", to: "#14070d", icon: "Skull" },
  { slug: "mystery", label: "Mystery", match: ["mystery"], blurb: "Every answer opens a door.", from: "#7a5cff", to: "#1a1442", icon: "Search" },
  { slug: "thriller", label: "Thriller", match: ["thriller"], blurb: "Tension that never lets go.", from: "#3d7bff", to: "#0b1a3d", icon: "Zap" },
  { slug: "romance", label: "Romance", match: ["romance"], blurb: "Hearts, memory and light.", from: "#ff7a8a", to: "#5c1d46", icon: "Heart" },
  { slug: "drama", label: "Drama", match: ["drama"], blurb: "Human stories, magnified.", from: "#c9a0ff", to: "#2a1d5c", icon: "Drama" },
  { slug: "mythology", label: "Mythology", match: ["mythology", "legend"], blurb: "Gods, kings and ancient fire.", from: "#f2b84b", to: "#5c3a0c", icon: "Landmark" },
  { slug: "fantasy", label: "Fantasy", match: ["fantasy"], blurb: "Realms that should not exist.", from: "#b36bff", to: "#1d1a5c", icon: "Sparkles" },
  { slug: "animated-films", label: "Animated Films", match: ["animat"], blurb: "Drawn, built, imagined.", from: "#4fd8ff", to: "#12305c", icon: "Clapperboard" },
];

const EXTRA_PALETTE = [
  ["#5ec8ff", "#10264a"], ["#e56bff", "#2a1048"], ["#6bffb5", "#0f3a33"], ["#ffc46b", "#4a2a0c"], ["#ff8f6b", "#4a1a14"], ["#8aa0ff", "#161d4a"],
];

export function genreMatches(movie: Movie, keywords: string[]): boolean {
  return movie.genre.some((g) => keywords.some((k) => g.toLowerCase().includes(k)));
}

export type GenreInfo = { name: string; slug: string; count: number };

export function allGenres(movies: Movie[]): GenreInfo[] {
  const map = new Map<string, GenreInfo>();
  for (const m of movies)
    for (const g of m.genre) {
      const slug = slugify(g);
      const cur = map.get(slug);
      if (cur) cur.count++;
      else map.set(slug, { name: g, slug, count: 1 });
    }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export type Collection = CollectionDef & { movies: Movie[] };

/** Collections generated from actual movie metadata. Empty collections are omitted. */
export function buildCollections(movies: Movie[]): Collection[] {
  const result: Collection[] = [];
  const covered = new Set<string>();
  for (const def of COLLECTIONS) {
    const list = movies.filter((m) => genreMatches(m, def.match));
    if (list.length) {
      result.push({ ...def, movies: list });
      for (const m of list) for (const g of m.genre) if (def.match.some((k) => g.toLowerCase().includes(k))) covered.add(slugify(g));
    }
  }
  let i = 0;
  for (const g of allGenres(movies)) {
    if (covered.has(g.slug) || COLLECTIONS.some((c) => c.slug === g.slug)) continue;
    const [from, to] = EXTRA_PALETTE[i++ % EXTRA_PALETTE.length];
    result.push({
      slug: g.slug, label: g.name, match: [g.name.toLowerCase()], blurb: "Worlds sharing this signature.", from, to, icon: "Tag",
      movies: movies.filter((m) => m.genre.some((x) => slugify(x) === g.slug)),
    });
  }
  return result;
}

/** Filter by a genre slug or collection slug. */
export function matchesGenreSlug(movie: Movie, slug: string): boolean {
  const def = COLLECTIONS.find((c) => c.slug === slug);
  if (def && genreMatches(movie, def.match)) return true;
  return movie.genre.some((g) => slugify(g) === slug);
}

// ---------- search / sort / related ----------

export function searchMovies(movies: Movie[], query: string): Movie[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return movies;
  const scored: { m: Movie; score: number }[] = [];
  for (const m of movies) {
    let total = 0;
    let ok = true;
    for (const t of tokens) {
      let s = 0;
      if (m.title.toLowerCase().includes(t)) s += 6;
      if (m.genre.some((g) => g.toLowerCase().includes(t))) s += 4;
      if (m.tags.some((g) => g.toLowerCase().includes(t))) s += 3;
      if (m.tagline.toLowerCase().includes(t)) s += 1;
      if (m.synopsis.toLowerCase().includes(t) || m.description.toLowerCase().includes(t)) s += 1;
      if (s === 0) {
        ok = false;
        break;
      }
      total += s;
    }
    if (ok) scored.push({ m, score: total });
  }
  return scored.sort((a, b) => b.score - a.score || a.m.order - b.m.order).map((x) => x.m);
}

export type SortKey = "featured" | "title" | "newest" | "recent" | "runtime" | "watched";

export function sortMovies(movies: Movie[], key: SortKey, lastOpened: Record<string, number> = {}): Movie[] {
  const list = [...movies];
  switch (key) {
    case "title":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
      return list.sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0) || a.order - b.order);
    case "recent":
      return list.sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? "") || b.order - a.order);
    case "runtime":
      return list.sort((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0) || a.order - b.order);
    case "watched":
      return list.sort((a, b) => (lastOpened[b.id] ?? 0) - (lastOpened[a.id] ?? 0) || a.order - b.order);
    default:
      return list.sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
  }
}

export function relatedMovies(movie: Movie, movies: Movie[], limit = 4): Movie[] {
  const g = new Set(movie.genre.map((x) => x.toLowerCase()));
  const t = new Set(movie.tags.map((x) => x.toLowerCase()));
  return movies
    .filter((m) => m.id !== movie.id)
    .map((m) => ({
      m,
      score: m.genre.filter((x) => g.has(x.toLowerCase())).length * 2 + m.tags.filter((x) => t.has(x.toLowerCase())).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.m.order - b.m.order)
    .slice(0, limit)
    .map((x) => x.m);
}
