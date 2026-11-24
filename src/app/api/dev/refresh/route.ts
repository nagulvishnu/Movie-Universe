// Development-only: explicit registry refresh (manifests only). Disabled in production.
export const dynamic = "force-dynamic";

export async function POST() {
  if (process.env.NODE_ENV === "production") return Response.json({ error: "Not available in production" }, { status: 404 });
  const { discover, summarize } = await import("../../../../../scripts/lib/discover.mjs");
  const { registry, changed } = discover();
  return Response.json({ changed, summary: summarize(registry as { movies: { status: string }[] }), diagnostics: registry.diagnostics });
}
