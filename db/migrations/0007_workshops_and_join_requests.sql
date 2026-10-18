CREATE TYPE "public"."batch_join_mode" AS ENUM('approval', 'open');--> statement-breakpoint
CREATE TYPE "public"."course_track" AS ENUM('standard', 'cuet');--> statement-breakpoint
CREATE TYPE "public"."join_request_status" AS ENUM('pending', 'approved', 'paid', 'enrolled', 'declined', 'cancelled');--> statement-breakpoint
CREATE TABLE "workshop_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"student_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"parent_name" text NOT NULL,
	"parent_phone" text NOT NULL,
	"class_level" "class_level" NOT NULL,
	"attended" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workshop_registrations_workshop_email_unique" UNIQUE("workshop_id","email")
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"class_level" "class_level",
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"capacity" integer,
	"meeting_url" text,
	"google_event_id" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"reminders_sent_at" timestamp with time zone,
	"join_invites_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "join_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"parent_name" text NOT NULL,
	"parent_phone" text NOT NULL,
	"class_level" "class_level" NOT NULL,
	"track" "course_track" NOT NULL,
	"plan_id" text NOT NULL,
	"plan_name" text NOT NULL,
	"amount_inr" integer NOT NULL,
	"batch_id" uuid NOT NULL,
	"workshop_id" uuid,
	"status" "join_request_status" DEFAULT 'pending' NOT NULL,
	"pay_token_hash" text,
	"pay_token_expires_at" timestamp with time zone,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"paid_at" timestamp with time zone,
	"enrolled_at" timestamp with time zone,
	"student_profile_id" uuid,
	"decline_reason" text,
	"provisioning_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "accepting_students" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "join_mode" "batch_join_mode" DEFAULT 'approval' NOT NULL;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_approved_by_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_student_profile_id_profiles_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workshop_registrations_workshop_idx" ON "workshop_registrations" USING btree ("workshop_id");--> statement-breakpoint
CREATE INDEX "workshop_registrations_email_idx" ON "workshop_registrations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "workshops_starts_at_idx" ON "workshops" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "join_requests_status_idx" ON "join_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "join_requests_email_idx" ON "join_requests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "join_requests_batch_idx" ON "join_requests" USING btree ("batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "join_requests_pay_token_hash_unique" ON "join_requests" USING btree ("pay_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "join_requests_razorpay_order_unique" ON "join_requests" USING btree ("razorpay_order_id");