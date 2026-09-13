import { desc } from "drizzle-orm";
import { Hono, type Context } from "hono";
import { z } from "zod";
import { database } from "../db/client.js";
import { thoughts } from "../db/schema.js";
import { anonymousClientKey, configuredLimit, secondsUntilNextDay } from "../rate-limiter.js";
import { errorResponse, successResponse } from "../utils/response.js";

const accentSchema = z.enum(["none", "underline", "scribble", "circle", "cross"]);
const createThoughtSchema = z
  .object({
    text: z.string().trim().min(1).max(150),
    mood: z.enum(["good", "bad"]),
    x: z.number().int().min(-100_000).max(100_000),
    y: z.number().int().min(-100_000).max(100_000),
    rotation: z.number().int().min(-10).max(10),
    size: z.number().int().min(14).max(32),
    width: z.number().int().min(100).max(320),
    alignment: z.enum(["left", "center", "right"]),
    opacity: z.number().int().min(50).max(100),
    accent: accentSchema,
  })
  .strict();

const reportError = (event: string, requestId: string | undefined, error: unknown) =>
  console.error(JSON.stringify({ event, requestId, errorType: error instanceof Error ? error.name : typeof error }));

async function takeQuota(c: Context<{ Bindings: Env }>, scope: string, limit: number) {
  const key = await anonymousClientKey(c.req.raw, c.env.RATE_LIMIT_TIME_ZONE, scope);
  const quota = await c.env.DAILY_MESSAGE_LIMITER.getByName(key).take(limit);
  c.header("RateLimit-Limit", String(limit));
  c.header("RateLimit-Remaining", String(quota.remaining));
  if (!quota.allowed) c.header("Retry-After", String(secondsUntilNextDay(c.env.RATE_LIMIT_TIME_ZONE)));
  return quota;
}

export const thoughtsRouter = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    try {
      const quota = await takeQuota(c, "thought-read", configuredLimit(c.env.READ_RATE_LIMIT_PER_DAY, 200));
      if (!quota.allowed) return c.json(errorResponse("Too many requests. Please try again later.", "RATE_LIMITED"), 429);
    } catch (error) {
      reportError("read_rate_limit_failed", c.res.headers.get("X-Request-Id") ?? undefined, error);
      return c.json(errorResponse("The thought wall is temporarily unavailable.", "SERVICE_UNAVAILABLE"), 503);
    }
    try {
      const rows = await database(c.env.DATABASE_URL).select().from(thoughts).orderBy(desc(thoughts.createdAt)).limit(200);
      return c.json(successResponse(rows));
    } catch (error) {
      reportError("database_read_failed", c.res.headers.get("X-Request-Id") ?? undefined, error);
      return c.json(errorResponse("The thought wall is temporarily unavailable.", "DATABASE_UNAVAILABLE"), 503);
    }
  })
  .post("/", async (c) => {
    if (!c.req.header("Content-Type")?.toLowerCase().startsWith("application/json")) {
      return c.json(errorResponse("Content-Type must be application/json.", "UNSUPPORTED_MEDIA_TYPE"), 415);
    }
    const payload = createThoughtSchema.safeParse(await c.req.json().catch(() => null));
    if (!payload.success) return c.json(errorResponse("Invalid thought submission.", "VALIDATION_ERROR"), 422);

    try {
      const quota = await takeQuota(c, "thought-write", configuredLimit(c.env.WRITE_RATE_LIMIT_PER_DAY, 10));
      if (!quota.allowed) {
        return c.json(errorResponse("Too many submissions. Please try again later.", "RATE_LIMITED"), 429);
      }
    } catch (error) {
      reportError("write_rate_limit_failed", c.res.headers.get("X-Request-Id") ?? undefined, error);
      return c.json(errorResponse("Posting is temporarily unavailable.", "RATE_LIMIT_UNAVAILABLE"), 503);
    }

    try {
      const thought = { id: crypto.randomUUID(), ...payload.data };
      await database(c.env.DATABASE_URL).insert(thoughts).values(thought);
      return c.json(successResponse(thought), 201);
    } catch (error) {
      reportError("database_write_failed", c.res.headers.get("X-Request-Id") ?? undefined, error);
      return c.json(errorResponse("Your thought could not be saved right now.", "DATABASE_UNAVAILABLE"), 503);
    }
  });
