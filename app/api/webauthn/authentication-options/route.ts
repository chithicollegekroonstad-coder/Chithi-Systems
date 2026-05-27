import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getWebauthnCredentialByUserId } from "@/db/user-biometrics";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

export async function POST(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storedCred = (await getWebauthnCredentialByUserId(
      Number(session.id),
    )) as Record<string, unknown> | null;

    if (!storedCred?.credentialID) {
      return NextResponse.json(
        { error: "No passkey registered for this account" },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const rpID = new URL(appUrl).hostname;

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: [
        {
          id: isoBase64URL.toBuffer(storedCred.credentialID as string),
          type: "public-key",
        },
      ],
      userVerification: "preferred",
    });

    const res = NextResponse.json({ options });
    res.cookies.set("webauthn_challenge", options.challenge, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 5,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("WebAuthn authentication options error:", error);
    return NextResponse.json(
      { error: "Failed to start passkey authentication" },
      { status: 500 },
    );
  }
}

