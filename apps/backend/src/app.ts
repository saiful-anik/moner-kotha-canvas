import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { healthRouter } from "./routes/health.route.js";
import { thoughtsRouter } from "./routes/thoughts.route.js";
import { errorResponse } from "./utils/response.js";

export const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", async (c, next) => {
  const allowedOrigins = c.env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
  return cors({ origin: (origin) => allowedOrigins.includes(origin) ? origin : "", allowMethods: ["GET", "POST", "OPTIONS"] })(c, next);
});
app.use("/api/*", bodyLimit({ maxSize: 4 * 1024, onError: (c) => c.json(errorResponse("Request body is too large.", "REQUEST_BODY_TOO_LARGE"), 413) }));
app.route("/api/health", healthRouter);
app.route("/api/thoughts", thoughtsRouter);
app.notFound((c) => c.json(errorResponse("Route not found.", "NOT_FOUND"), 404));
app.onError((error, c) => {
  console.error(JSON.stringify({ event: "unhandled_error", error: String(error) }));
  return c.json(errorResponse("Internal server error.", "INTERNAL_SERVER_ERROR"), 500);
});
