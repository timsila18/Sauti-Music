import "server-only";

type Level = "info" | "warn" | "error";
const allowed = new Set(["route", "operation", "status", "durationMs", "code"]);

function write(level: Level, event: string, context: Record<string, unknown> = {}) {
  const safe = Object.fromEntries(Object.entries(context).filter(([key]) => allowed.has(key)));
  const record = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...safe });
  if (level === "error") console.error(record); else if (level === "warn") console.warn(record); else console.info(record);
}
export const logger = {
  info: (event: string, context?: Record<string, unknown>) => write("info", event, context),
  warn: (event: string, context?: Record<string, unknown>) => write("warn", event, context),
  error: (event: string, context?: Record<string, unknown>) => write("error", event, context),
};
