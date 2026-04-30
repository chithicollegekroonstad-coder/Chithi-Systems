// app/api/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Email service is not configured (missing RESEND_API_KEY)." },
        { status: 500 },
      );
    }
    const resend = new Resend(resendApiKey);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Clear old OTPs
    await db.delete(otpCodes).where(eq(otpCodes.email, email));

    // Save new OTP
    await db.insert(otpCodes).values({ email, code: otp, expiresAt });

    // Send Email
    const { data, error } = await resend.emails.send({
      from: "Chithi FET College <alettatesfamichael28@gmail.com>",   // ← Your Resend email for testing
      to: email,
      subject: "Your Verification Code - Chithi FET College",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your OTP Code</h2>
          <p style="font-size: 36px; font-weight: bold; color: #dc2626;">${otp}</p>
          <p>This code expires in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ OTP sent to ${email} | Code: ${otp}`);

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully. Check your email." 
    });

  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}