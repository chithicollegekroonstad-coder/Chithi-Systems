// app/api/attendance/verify-fingerprint/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getWebauthnCredentialByUserId,
  setWebauthnCredentialByUserId,
} from "@/db/user-biometrics";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
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

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: "", // You should pass a fresh challenge from client
      expectedOrigin:
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      expectedRPID: new URL(
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      ).hostname,
      credential: {
        id: String(storedCred.credentialID),
        publicKey: Buffer.from(String(storedCred.publicKey), "base64"),
        counter: Number(storedCred.counter || 0),
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

    return NextResponse.json({
      success: true,
      message: "Fingerprint verified successfully",
    });
  } catch (error) {
    console.error("Fingerprint verification error:", error);
    return NextResponse.json(
      { error: "Fingerprint verification failed" },
      { status: 500 },
    );
  }
}
