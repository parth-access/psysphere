CREATE TABLE "student_id_counters" (
	"year" integer PRIMARY KEY NOT NULL,
	"last_value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admissions" ADD COLUMN "demo_time" varchar(20);--> statement-breakpoint
ALTER TABLE "admissions" ADD COLUMN "meeting_url" text;