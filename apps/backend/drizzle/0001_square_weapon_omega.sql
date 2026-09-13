ALTER TABLE "thoughts" ADD COLUMN "width" integer NOT NULL DEFAULT 200;--> statement-breakpoint
ALTER TABLE "thoughts" ADD COLUMN "alignment" text NOT NULL DEFAULT 'left';
