CREATE TYPE "public"."attendance_source" AS ENUM('meet', 'manual');--> statement-breakpoint
CREATE TABLE "meet_presence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"student_profile_id" uuid,
	"participant" text NOT NULL,
	"display_name" text,
	"kind" text NOT NULL,
	"google_user_id" text,
	"joined_at" timestamp with time zone NOT NULL,
	"left_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "google_user_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "google_email" text;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD COLUMN "meet_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD COLUMN "meet_sync_error" text;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "source" "attendance_source" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "minutes_present" integer;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "longest_gap_minutes" integer;--> statement-breakpoint
ALTER TABLE "meet_presence" ADD CONSTRAINT "meet_presence_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meet_presence" ADD CONSTRAINT "meet_presence_student_profile_id_student_profiles_profile_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("profile_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meet_presence_session_idx" ON "meet_presence" USING btree ("session_id");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_google_user_id_unique" UNIQUE("google_user_id");