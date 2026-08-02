CREATE TABLE "prospect_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admission_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"recipient" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"provider" varchar(50) DEFAULT 'resend' NOT NULL,
	"provider_message_id" varchar(255),
	"status" varchar(50) NOT NULL,
	"related_entity_type" varchar(50),
	"related_entity_id" uuid,
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prospect_tokens" ADD CONSTRAINT "prospect_tokens_admission_id_admissions_id_fk" FOREIGN KEY ("admission_id") REFERENCES "public"."admissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prospect_tokens_admission_idx" ON "prospect_tokens" USING btree ("admission_id");--> statement-breakpoint
CREATE INDEX "prospect_tokens_hash_idx" ON "prospect_tokens" USING btree ("token_hash");