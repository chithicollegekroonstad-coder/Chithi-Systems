// lib/biometric-verify.ts
import {
  getFaceEmbeddingByUserId,
  getWebauthnCredentialByUserId,
  setWebauthnCredentialByUserId,
} from "@/db/user-biometrics";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

function base64UrlToUint8Array(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return new Uint8Array(Buffer.from(base64 + padding, "base64"));
}

const FACE_MATCH_THRESHOLD = 0.55;

export async function verifyFaceBiometric(
  userId: number,
  faceDescriptor: number[],
): Promise<{ success: boolean; error?: string }> {
  const storedEmbedding = await getFaceEmbeddingByUserId(userId);

  if (!storedEmbedding?.length) {
    return {
      success: false,
      error:
        "Face recognition not set up. Complete activation at /set-password first.",
    };
  }

  const distance = euclideanDistance(storedEmbedding, faceDescriptor);

  if (distance > FACE_MATCH_THRESHOLD) {
    return { success: false, error: "Face does not match. Please try again." };
  }

  return { success: true };
}

export async function verifyFingerprintBiometric(
  userId: number,
  credential: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  const storedCred = await getWebauthnCredentialByUserId(userId);

  if (!storedCred?.credentialID) {
    return {
      success: false,
      error: "Fingerprint/Passkey not registered. Please set it up first.",
    };
  }

  const verification = await verifyAuthenticationResponse({
    response: credential as any,
    expectedChallenge: "",
    expectedOrigin:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    expectedRPID: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ).hostname,
    authenticator: {
      credentialID: base64UrlToUint8Array(String(storedCred.credentialID)),
      credentialPublicKey: Buffer.from(
        String(storedCred.publicKey),
        "base64",
      ),
      counter: Number(storedCred.counter || 0),
    },
  });

  if (!verification.verified) {
    return { success: false, error: "Fingerprint verification failed" };
  }

  await setWebauthnCredentialByUserId(userId, {
    ...storedCred,
    counter: verification.authenticationInfo.newCounter,
  });

  return { success: true };
}
