CREATE TABLE "google_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text DEFAULT 'google' NOT NULL,
	"account_email" text NOT NULL,
	"access_token" text,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone,
	"scopes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "google_credentials_account_email_unique" UNIQUE("account_email")
);
--> statement-breakpoint
ALTER TABLE "class_sessions" ADD COLUMN "google_event_id" text;