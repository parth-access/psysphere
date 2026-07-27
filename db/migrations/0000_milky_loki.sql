CREATE TYPE "public"."admission_status" AS ENUM('LEAD', 'DEMO_BOOKED', 'DEMO_APPROVED', 'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'ENROLLED', 'REJECTED', 'INACTIVE', 'ALUMNI');--> statement-breakpoint
CREATE TYPE "public"."announcement_target" AS ENUM('all', 'batch', 'class_level');--> statement-breakpoint
CREATE TYPE "public"."assignment_attempt_status" AS ENUM('draft', 'submitted', 'resubmitted');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'excused');--> statement-breakpoint
CREATE TYPE "public"."class_level" AS ENUM('class_11', 'class_12');--> statement-breakpoint
CREATE TYPE "public"."class_session_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'normal', 'high');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'teacher', 'student');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role" "role" NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"admission_number" text,
	"enrollment_date" date,
	"guardian_name" text,
	"guardian_email" text,
	"guardian_phone" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_profiles_admission_number_unique" UNIQUE("admission_number")
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"class_level" "class_level" NOT NULL,
	"academic_year" text NOT NULL,
	"schedule" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_profile_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enrollments_student_batch_unique" UNIQUE("student_profile_id","batch_id")
);
--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"title" text NOT NULL,
	"topic_title" text NOT NULL,
	"meeting_url" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "class_session_status" DEFAULT 'scheduled' NOT NULL,
	"teacher_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"student_profile_id" uuid NOT NULL,
	"status" "attendance_status" DEFAULT 'absent' NOT NULL,
	"marked_by" uuid,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_session_student_unique" UNIQUE("session_id","student_profile_id")
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"title" text NOT NULL,
	"instructions" text NOT NULL,
	"published_at" timestamp with time zone,
	"results_published_at" timestamp with time zone,
	"due_at" timestamp with time zone NOT NULL,
	"max_marks" numeric(5, 2) NOT NULL,
	"max_attempts" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "assignments_max_attempts_check" CHECK ("assignments"."max_attempts" > 0)
);
--> statement-breakpoint
CREATE TABLE "assignment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"student_profile_id" uuid NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"status" "assignment_attempt_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignment_attempts_unique_attempt" UNIQUE("assignment_id","student_profile_id","attempt_number")
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_attempt_id" uuid NOT NULL,
	"marks_obtained" numeric(5, 2),
	"teacher_feedback" text,
	"evaluated_by" uuid,
	"evaluated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evaluations_unique_attempt" UNIQUE("assignment_attempt_id")
);
--> statement-breakpoint
CREATE TABLE "admissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_name" text NOT NULL,
	"parent_name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"class" varchar(50) NOT NULL,
	"program" varchar(50) NOT NULL,
	"package" varchar(50),
	"duration" varchar(50),
	"price" integer,
	"preferred_date" varchar(20),
	"preferred_time" varchar(20),
	"notes" text,
	"status" "admission_status" DEFAULT 'LEAD' NOT NULL,
	"assigned_teacher" text,
	"demo_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_profile_id_student_profiles_profile_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_profile_id_student_profiles_profile_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_marked_by_profiles_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_attempts" ADD CONSTRAINT "assignment_attempts_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_attempts" ADD CONSTRAINT "assignment_attempts_student_profile_id_student_profiles_profile_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_assignment_attempt_id_assignment_attempts_id_fk" FOREIGN KEY ("assignment_attempt_id") REFERENCES "public"."assignment_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluated_by_profiles_id_fk" FOREIGN KEY ("evaluated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profiles_role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "student_profiles_admission_idx" ON "student_profiles" USING btree ("admission_number");--> statement-breakpoint
CREATE INDEX "batches_name_idx" ON "batches" USING btree ("name");--> statement-breakpoint
CREATE INDEX "batches_class_level_idx" ON "batches" USING btree ("class_level");--> statement-breakpoint
CREATE INDEX "batches_academic_year_idx" ON "batches" USING btree ("academic_year");--> statement-breakpoint
CREATE INDEX "enrollments_student_idx" ON "enrollments" USING btree ("student_profile_id");--> statement-breakpoint
CREATE INDEX "enrollments_batch_idx" ON "enrollments" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "class_sessions_batch_idx" ON "class_sessions" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "class_sessions_status_idx" ON "class_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "class_sessions_start_idx" ON "class_sessions" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "attendance_session_idx" ON "attendance" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "attendance_student_idx" ON "attendance" USING btree ("student_profile_id");--> statement-breakpoint
CREATE INDEX "assignments_batch_idx" ON "assignments" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "assignments_published_idx" ON "assignments" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "assignments_due_idx" ON "assignments" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "assignments_results_published_idx" ON "assignments" USING btree ("results_published_at");--> statement-breakpoint
CREATE INDEX "assignment_attempts_assignment_idx" ON "assignment_attempts" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "assignment_attempts_student_idx" ON "assignment_attempts" USING btree ("student_profile_id");--> statement-breakpoint
CREATE INDEX "evaluations_attempt_idx" ON "evaluations" USING btree ("assignment_attempt_id");--> statement-breakpoint
CREATE INDEX "evaluations_evaluator_idx" ON "evaluations" USING btree ("evaluated_by");