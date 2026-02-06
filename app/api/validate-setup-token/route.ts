// app/api/validate-setup-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { passwordSetupTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const setupToken = await db.query.passwordSetupTokens.findFirst({
    where: and(
      eq(passwordSetupTokens.token, token),
      eq(passwordSetupTokens.used, false),
    ),
  });

  if (!setupToken || setupToken.expiresAt < new Date()) {
    return NextResponse.json({
      valid: false,
      error: "Invalid or expired token",
    });
  }

  return NextResponse.json({ valid: true });
}
