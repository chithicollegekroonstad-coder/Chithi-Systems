/**
 * Optional columns `face_embedding` and `webauthn_credential` on `users`
 * (see drizzle/migrations/0005_biometric_user_columns.sql). They are not on
 * the Drizzle `users` model so INSERTs stay compatible with older DBs.
 */
import { db } from "@/db";
import { sql } from "drizzle-orm";

function isMissingBiometricColumn(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.message.includes("face_embedding") ||
      err.message.includes("webauthn_credential")) &&
    err.message.includes("does not exist")
  );
}

export async function getFaceEmbeddingByUserId(
  userId: number,
): Promise<number[] | null> {
  try {
    const result = await db.execute<{ face_embedding: unknown }>(
      sql`SELECT face_embedding FROM "users" WHERE id = ${userId} LIMIT 1`,
    );
    const raw = result.rows[0]?.face_embedding;
    if (raw == null) return null;
    if (Array.isArray(raw)) return raw as number[];
    if (typeof raw === "string") return JSON.parse(raw) as number[];
    return raw as number[];
  } catch (e) {
    if (isMissingBiometricColumn(e)) return null;
    throw e;
  }
}

export async function setFaceEmbeddingByUserId(
  userId: number,
  embedding: number[],
): Promise<void> {
  await db.execute(
    sql`UPDATE "users" SET face_embedding = ${JSON.stringify(embedding)}::jsonb WHERE id = ${userId}`,
  );
}

export async function getWebauthnCredentialByUserId(
  userId: number,
): Promise<Record<string, unknown> | null> {
  try {
    const result = await db.execute<{ webauthn_credential: unknown }>(
      sql`SELECT webauthn_credential FROM "users" WHERE id = ${userId} LIMIT 1`,
    );
    const raw = result.rows[0]?.webauthn_credential;
    if (raw == null) return null;
    if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
    if (typeof raw === "string") return JSON.parse(raw) as Record<string, unknown>;
    return null;
  } catch (e) {
    if (isMissingBiometricColumn(e)) return null;
    throw e;
  }
}

export async function setWebauthnCredentialByUserId(
  userId: number,
  credential: Record<string, unknown>,
): Promise<void> {
  await db.execute(
    sql`UPDATE "users" SET webauthn_credential = ${JSON.stringify(credential)}::jsonb WHERE id = ${userId}`,
  );
}
