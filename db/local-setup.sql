-- Prepares a plain local Postgres database for the Drizzle migrations.
-- Supabase provides the auth schema; locally we only need the table that profiles.id points to.
-- Run once on an empty database, before `npm run db:migrate`. Not for Supabase.

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
