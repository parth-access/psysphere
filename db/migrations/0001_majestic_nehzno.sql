ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_clerk_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "profiles_clerk_idx";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "package" varchar(50);--> statement-breakpoint
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "duration" varchar(50);--> statement-breakpoint
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "price" integer;--> statement-breakpoint
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "preferred_date" varchar(20);--> statement-breakpoint
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "preferred_time" varchar(20);--> statement-breakpoint
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "notes" text;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "clerk_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES auth.users("id") ON DELETE CASCADE;