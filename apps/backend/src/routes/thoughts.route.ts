import { desc } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { database } from "../db/client.js";
import { thoughts } from "../db/schema.js";
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
    opacity: z.number().int().min(50).max(100),
    accent: accentSchema,
  })
  .strict();

export const thoughtsRouter = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    try {
      const rows = await database(c.env.DATABASE_URL).select().from(thoughts).orderBy(desc(thoughts.createdAt)).limit(200);
      return c.json(successResponse(rows));
    } catch (error) {
      console.error(JSON.stringify({ event: "database_read_failed", error: String(error) }));
      return c.json(errorResponse("The thought wall is temporarily unavailable.", "DATABASE_UNAVAILABLE"), 503);
    }
  })
  .post("/", async (c) => {
    const payload = createThoughtSchema.safeParse(await c.req.json().catch(() => null));
    if (!payload.success) return c.json(errorResponse("Invalid thought submission.", "VALIDATION_ERROR"), 422);

    try {
      const thought = { id: crypto.randomUUID(), ...payload.data };
      await database(c.env.DATABASE_URL).insert(thoughts).values(thought);
      return c.json(successResponse(thought), 201);
    } catch (error) {
      console.error(JSON.stringify({ event: "database_write_failed", error: String(error) }));
      return c.json(errorResponse("Your thought could not be saved right now.", "DATABASE_UNAVAILABLE"), 503);
    }
  });
