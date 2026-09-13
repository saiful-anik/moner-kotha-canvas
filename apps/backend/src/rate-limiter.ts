import { DurableObject } from "cloudflare:workers";

export type RateLimitResult = { allowed: boolean; remaining: number };

export function configuredLimit(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 10_000 ? parsed : fallback;
}

export class DailyMessageLimiter extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS quota (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)");
  }

  take(limit: number): RateLimitResult {
    const current = this.ctx.storage.sql.exec<{ count: number }>("SELECT count FROM quota WHERE id = 1").toArray()[0]?.count ?? 0;
    if (current >= limit) return { allowed: false, remaining: 0 };

    this.ctx.storage.sql.exec("INSERT INTO quota (id, count) VALUES (1, 1) ON CONFLICT(id) DO UPDATE SET count = count + 1");
    return { allowed: true, remaining: Math.max(0, limit - current - 1) };
  }
}

const dateFormatter = (timeZone: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const dayKey = (timeZone: string) => dateFormatter(timeZone).format(new Date());

export function secondsUntilNextDay(timeZone: string, now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", timeZoneName: "longOffset" }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const offset = value("timeZoneName").match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!offset) return 86_400;
  const minutes = (Number(offset[2]) * 60 + Number(offset[3])) * (offset[1] === "+" ? 1 : -1);
  const nextMidnight = Date.UTC(Number(value("year")), Number(value("month")) - 1, Number(value("day")) + 1);
  return Math.max(1, Math.ceil((nextMidnight - minutes * 60_000 - now.getTime()) / 1_000));
}

export async function anonymousClientKey(request: Request, timeZone: string, scope: string): Promise<string> {
  const clientIp = request.headers.get("CF-Connecting-IP") ?? "local-development";
  const data = new TextEncoder().encode(`${scope}:${dayKey(timeZone)}:${clientIp}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
