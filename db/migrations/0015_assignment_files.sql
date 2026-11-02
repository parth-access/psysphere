ALTER TABLE "assignments" ADD COLUMN "question_file_path" text;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "question_file_name" text;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "question_file_bytes" integer;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "allow_late" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "assignment_attempts" ADD COLUMN "file_path" text;--> statement-breakpoint
ALTER TABLE "assignment_attempts" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "assignment_attempts" ADD COLUMN "file_bytes" integer;--> statement-breakpoint
ALTER TABLE "evaluations" ADD COLUMN "checked_file_path" text;--> statement-breakpoint
ALTER TABLE "evaluations" ADD COLUMN "checked_file_name" text;--> statement-breakpoint
ALTER TABLE "evaluations" ADD COLUMN "checked_file_bytes" integer;