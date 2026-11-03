import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Without a URL, postgres-js quietly connects to a local database named after the OS user and
// fails with "database <user> does not exist". Fail on first use with the real reason instead,
// so pages that catch database errors (and `next build`) still work without one.
const missing = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get() {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in your Supabase connection string.");
  },
});

export const db = connectionString
  // Disable prefetch as it is not supported for "Transaction" pool mode.
  // A paused serverless function can wake up holding dead connections, so they're closed when idle and checked sooner.
  ? drizzle(postgres(connectionString, { prepare: false, idle_timeout: 20, connect_timeout: 10, keep_alive: 10 }), { schema })
  : missing;
