CREATE TYPE "public"."class_recording_status" AS ENUM('processing', 'ready', 'expired', 'deleted', 'failed');--> statement-breakpoint
CREATE TABLE "class_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"drive_file_id" text NOT NULL,
	"file_name" text NOT NULL,
	"bytes" bigint NOT NULL,
	"status" "class_recording_status" DEFAULT 'processing' NOT NULL,
	"available_from" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"checked_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"delete_error" text,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_recordings_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "class_recordings" ADD CONSTRAINT "class_recordings_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_recordings" ADD CONSTRAINT "class_recordings_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_recordings_status_idx" ON "class_recordings" USING btree ("status");