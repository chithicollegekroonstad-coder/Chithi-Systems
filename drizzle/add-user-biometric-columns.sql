-- Neon SQL Editor fallback (same DDL as drizzle/migrations/0005_biometric_user_columns.sql).
-- Prefer: npm run db:migrate once drizzle.__drizzle_migrations is in sync (see npm run db:migration-hashes).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "face_embedding" jsonb;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "webauthn_credential" jsonb;
