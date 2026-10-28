CREATE TABLE "institute_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"contact_email" text,
	"phone" text,
	"whatsapp_number" text,
	"whatsapp_message" text,
	"hours" text,
	"address" text,
	"default_class_time" text,
	"default_class_minutes" integer,
	"default_batch_seats" integer,
	"alert_email" text,
	"weekly_reports" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	CONSTRAINT "institute_settings_single_row" CHECK ("institute_settings"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "institute_settings" ADD CONSTRAINT "institute_settings_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;