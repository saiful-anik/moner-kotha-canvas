import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const thoughtMood = pgEnum("thought_mood", ["good", "bad"]);

export const thoughts = pgTable("thoughts", {
  id: uuid("id").primaryKey(),
  text: text("text").notNull(),
  mood: thoughtMood("mood").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  rotation: integer("rotation").notNull(),
  size: integer("size").notNull(),
  opacity: integer("opacity").notNull(),
  accent: text("accent").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
