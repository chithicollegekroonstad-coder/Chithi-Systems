// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local explicitly (drizzle-kit does not load .env files automatically)
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing in .env.local – cannot run migrations",
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql", // ← use "dialect" instead of "driver" in newer versions
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ← "url" not "connectionString"
  },
  verbose: true,
  strict: true,
});
