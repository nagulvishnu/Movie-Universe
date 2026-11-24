// Movie Universe: the portal is local-first — no database required.
// Health reports application availability only; there is no external dependency to check.

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true });
}
