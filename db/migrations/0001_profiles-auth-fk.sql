-- Custom SQL migration file, put your code below! --
ALTER TABLE "public"."profiles"
DROP CONSTRAINT IF EXISTS "profiles_id_fkey";
--> statement-breakpoint

ALTER TABLE "public"."profiles"
ADD CONSTRAINT "profiles_id_fkey"
FOREIGN KEY ("id")
REFERENCES "auth"."users"("id")
ON DELETE CASCADE;