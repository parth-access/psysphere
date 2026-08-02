ALTER TABLE "batches" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_teacher_id_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacher_id_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batches_teacher_id_idx" ON "batches" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "class_sessions_teacher_idx" ON "class_sessions" USING btree ("teacher_id");