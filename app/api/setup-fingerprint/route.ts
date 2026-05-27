// app/api/setup-fingerprint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { setWebauthnCredentialByUserId } from "@/db/user-biometrics";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

export async function POST(req: NextRequest) {
  try {
    const { email, credential } = await req.json();

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

    const expectedChallenge = req.cookies.get("webauthn_challenge")?.value;
    if (!expectedChallenge) {
      return NextResponse.json(
        {
          error:
            "Missing passkey challenge. Please restart passkey registration.",
        },
        { status: 400 },
      );
    }

    // Verify the WebAuthn registration
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
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

    if (!verification.registrationInfo) {
      return NextResponse.json(
        { error: "Passkey registration info missing" },
        { status: 400 },
      );
    }

    await setWebauthnCredentialByUserId(user.id, {
      credentialID: isoBase64URL.fromBuffer(verification.registrationInfo.credentialID),
      publicKey: Buffer.from(verification.registrationInfo.credentialPublicKey).toString(
        "base64",
      ),
      counter: verification.registrationInfo.counter,
    });

    const res = NextResponse.json({
      success: true,
      message: "Fingerprint / Passkey registered successfully",
    });
    res.cookies.set("webauthn_challenge", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("Setup fingerprint error:", error);
    return NextResponse.json(
      { error: "Failed to register fingerprint" },
      { status: 500 },
    );
  }
}
