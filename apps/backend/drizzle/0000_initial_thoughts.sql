CREATE TYPE "public"."thought_mood" AS ENUM('good', 'bad');
--> statement-breakpoint
CREATE TABLE "thoughts" (
  "id" uuid PRIMARY KEY NOT NULL,
  "text" text NOT NULL,
  "mood" "thought_mood" NOT NULL,
  "x" integer NOT NULL,
  "y" integer NOT NULL,
  "rotation" integer NOT NULL,
  "size" integer NOT NULL,
  "opacity" integer NOT NULL,
  "accent" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
