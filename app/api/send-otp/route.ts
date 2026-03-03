// app/api/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Clear old OTPs for this email
    await db.delete(otpCodes).where(eq(otpCodes.email, email));

    // Store new OTP
    await db.insert(otpCodes).values({
      email,
      code: otp,
      expiresAt,
    });

    // TODO: Uncomment when RESEND_API_KEY is available
    // For now, just log the OTP for development
    console.log(`[DEV] OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP generated successfully",
      otp: otp, // Remove in production
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to generate OTP" },
      { status: 500 },
    );
  }
}