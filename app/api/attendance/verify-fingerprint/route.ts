// app/api/attendance/verify-fingerprint/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getWebauthnCredentialByUserId,
  setWebauthnCredentialByUserId,
} from "@/db/user-biometrics";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { qrCodeValue, credential } = await req.json(); // credential from navigator.credentials.get()

    if (!qrCodeValue || !credential) {
      return NextResponse.json(
        { error: "QR code and credential are required" },
        { status: 400 },
      );
    }

    const expectedChallenge = req.cookies.get("webauthn_challenge")?.value;
    if (!expectedChallenge) {
      return NextResponse.json(
        {
          error:
            "Missing passkey challenge. Call /api/webauthn/authentication-options first.",
        },
        { status: 400 },
      );
    }

    const storedCred = (await getWebauthnCredentialByUserId(
      Number(session.id),
    )) as Record<string, unknown> | null;

    if (!storedCred?.credentialID) {
      return NextResponse.json(
        {
          error: "Fingerprint/Passkey not registered. Please set it up first.",
        },
        { status: 400 },
      );
    }

    const credentialIdBase64Url = storedCred.credentialID;
    const publicKeyBase64 = storedCred.publicKey;
    const counter =
      typeof storedCred.counter === "number" ? storedCred.counter : 0;

    if (typeof credentialIdBase64Url !== "string" || typeof publicKeyBase64 !== "string") {
      return NextResponse.json(
        { error: "Invalid stored passkey data. Please re-register passkey." },
        { status: 400 },
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin:
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      expectedRPID: new URL(
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      ).hostname,
      authenticator: {
        credentialID: isoBase64URL.toBuffer(credentialIdBase64Url),
        credentialPublicKey: Buffer.from(publicKeyBase64, "base64"),
        counter,
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Fingerprint verification failed" },
        { status: 403 },
      );
    }

    await setWebauthnCredentialByUserId(Number(session.id), {
      ...storedCred,
      counter: verification.authenticationInfo.newCounter,
    });

    const res = NextResponse.json({
      success: true,
      message: "Fingerprint verified successfully",
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
    console.error("Fingerprint verification error:", error);
    return NextResponse.json(
      { error: "Fingerprint verification failed" },
      { status: 500 },
    );
  }
}
