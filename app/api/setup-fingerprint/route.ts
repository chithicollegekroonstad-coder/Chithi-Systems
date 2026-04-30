// app/api/setup-fingerprint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { setWebauthnCredentialByUserId } from "@/db/user-biometrics";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyRegistrationResponse } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  try {
    const { email, credential, challenge } = await req.json();

    if (!email || !credential) {
      return NextResponse.json(
        { error: "Email and credential are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      columns: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the WebAuthn registration
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin:
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      expectedRPID: new URL(
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      ).hostname,
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Failed to verify passkey" },
        { status: 400 },
      );
    }

    await setWebauthnCredentialByUserId(user.id, {
      credentialID: verification.registrationInfo?.credential.id,
      publicKey: Buffer.from(
        verification.registrationInfo?.credential.publicKey,
      ).toString("base64"),
      counter: verification.registrationInfo?.credential.counter,
    });

    return NextResponse.json({
      success: true,
      message: "Fingerprint / Passkey registered successfully",
    });
  } catch (error) {
    console.error("Setup fingerprint error:", error);
    return NextResponse.json(
      { error: "Failed to register fingerprint" },
      { status: 500 },
    );
  }
}
