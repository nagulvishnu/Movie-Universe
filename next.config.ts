import type { NextConfig } from "next";

type RegistryMovie = { id: string; build?: { spa?: boolean } };

const config = async (phase: string): Promise<NextConfig> => {
  // Build-time discovery: manifests only (movies/*/movie.json). Cheap, deterministic, never recursive.
  // Skipped in the production *server* phase so a running deployment never touches the filesystem.
  let movies: RegistryMovie[] = [];
  if ((phase === "phase-development-server" || phase === "phase-production-build") && process.env.MOVIE_DISCOVERY !== "0") {
    const { discover } = await import("./scripts/lib/discover.mjs");
    movies = discover().registry.movies as RegistryMovie[];
  }

  const immutable = { key: "Cache-Control", value: "public, max-age=31536000, immutable" };

  return {
    poweredByHeader: false,
    reactStrictMode: true,
    images: { unoptimized: true },
    async rewrites() {
      return {
        // Next does not serve index.html for directories in public/, so map movie roots explicitly.
        beforeFiles: [
          { source: "/movies/:id", destination: "/movies/:id/index.html" },
        ],
        afterFiles: [],
        // Client-routed movies (build.spa: true) fall back to their own index.html for deep links.
        fallback: movies
          .filter((m) => m.build?.spa)
          .map((m) => ({ source: `/movies/${m.id}/:path*`, destination: `/movies/${m.id}/index.html` })),
      };
    },
    async headers() {
      return [
        { source: "/(.*)", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] },
        // Hashed bundles from movie builds (Vite: /assets/*) are safe to cache forever.
        { source: "/movies/:id/assets/:path*", headers: [immutable] },
        { source: "/movie-art/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      ];
    },
  };
};

export default config;
