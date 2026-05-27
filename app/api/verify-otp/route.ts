// app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedCode = code.trim();

    // Find the most recent unverified OTP for this email
    const otpRecord = await db.query.otpCodes.findFirst({
      where: and(
        eq(otpCodes.email, normalizedEmail),
        eq(otpCodes.code, trimmedCode),
        eq(otpCodes.verified, false),
      ),
      orderBy: [sql`${otpCodes.createdAt} desc`],
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 400 },
      );
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "OTP code has expired" },
        { status: 400 },
      );
    }

    // Mark as verified
    await db
      .update(otpCodes)
      .set({ verified: true })
      .where(eq(otpCodes.id, otpRecord.id));

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 },
    );
  }
}
