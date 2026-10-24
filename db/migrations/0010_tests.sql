CREATE TYPE "public"."test_exit_reason" AS ENUM('hidden', 'blur', 'fullscreen');--> statement-breakpoint
CREATE TYPE "public"."test_submit_reason" AS ENUM('manual', 'time_up', 'closed');--> statement-breakpoint
CREATE TABLE "test_attempt_exits" (
	"id" uuid PRIMARY KEY NOT NULL,
	"attempt_id" uuid NOT NULL,
	"reason" "test_exit_reason" NOT NULL,
	"left_at" timestamp with time zone DEFAULT now() NOT NULL,
	"returned_at" timestamp with time zone,
	"question_id" uuid
);
--> statement-breakpoint
CREATE TABLE "test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"student_profile_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"submit_reason" "test_submit_reason",
	"question_order" jsonb NOT NULL,
	"option_order" jsonb NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"marked_for_review" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visited" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"exit_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer,
	"wrong_count" integer,
	"score" numeric(7, 2),
	"xp" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_attempts_test_student_unique" UNIQUE("test_id","student_profile_id")
);
--> statement-breakpoint
CREATE TABLE "test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"prompt" text NOT NULL,
	"image_path" text,
	"options" jsonb NOT NULL,
	"correct_option_id" text NOT NULL,
	"explanation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"title" text NOT NULL,
	"instructions" text,
	"opens_at" timestamp with time zone NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"marks_per_correct" numeric(5, 2) DEFAULT '1' NOT NULL,
	"penalty_per_wrong" numeric(5, 2) DEFAULT '0' NOT NULL,
	"xp_per_correct" integer DEFAULT 2 NOT NULL,
	"shuffle" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "tests_window_check" CHECK ("tests"."closes_at" > "tests"."opens_at"),
	CONSTRAINT "tests_duration_check" CHECK ("tests"."duration_minutes" > 0)
);
--> statement-breakpoint
ALTER TABLE "test_attempt_exits" ADD CONSTRAINT "test_attempt_exits_attempt_id_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_student_profile_id_profiles_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "test_attempt_exits_attempt_idx" ON "test_attempt_exits" USING btree ("attempt_id","left_at");--> statement-breakpoint
CREATE INDEX "test_attempts_student_idx" ON "test_attempts" USING btree ("student_profile_id");--> statement-breakpoint
CREATE INDEX "test_questions_test_idx" ON "test_questions" USING btree ("test_id","position");--> statement-breakpoint
CREATE INDEX "tests_batch_idx" ON "tests" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "tests_closes_at_idx" ON "tests" USING btree ("closes_at");