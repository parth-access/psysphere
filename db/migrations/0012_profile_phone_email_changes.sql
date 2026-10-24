CREATE TABLE "email_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"new_email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_changes_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "email_changes" ADD CONSTRAINT "email_changes_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_changes_profile_idx" ON "email_changes" USING btree ("profile_id");--> statement-breakpoint
UPDATE "profiles" p SET "phone" = jr."phone"
FROM (
	SELECT DISTINCT ON ("student_profile_id") "student_profile_id", "phone"
	FROM "join_requests"
	WHERE "student_profile_id" IS NOT NULL
	ORDER BY "student_profile_id", "created_at" DESC
) jr
WHERE jr."student_profile_id" = p."id" AND p."phone" IS NULL;
