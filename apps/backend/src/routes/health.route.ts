import { Hono } from "hono";
import { successResponse } from "../utils/response.js";

export const healthRouter = new Hono().get("/", (c) => c.json(successResponse({ service: "moner-kotha-api" })));
