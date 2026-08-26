import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let database = false;
  if (url && key) {
    try {
      const response = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key }, cache: "no-store", signal: AbortSignal.timeout(3000) });
      database = response.ok;
    } catch { database = false; }
  }
  const status = url && key && database ? "ok" : "degraded";
  logger.info("health.checked", { route: "/api/health", status, durationMs: Date.now() - started });
  return Response.json({ status, checks: { application: true, configuration: Boolean(url && key), database } }, { status: status === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
