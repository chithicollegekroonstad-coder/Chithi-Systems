ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "face_embedding" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "webauthn_credential" jsonb;
