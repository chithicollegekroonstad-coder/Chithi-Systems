// app/api/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clear old OTPs for this email
    await db.delete(otpCodes).where(eq(otpCodes.email, email));

    // Store new OTP in database
    await db.insert(otpCodes).values({
      email,
      code: otp,
      expiresAt,
    });

    // Send email with Resend
    try {
      await resend.emails.send({
        from: "noreply@chithicollege.org",
        to: email,
        subject: "Chithi College - Email Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Chithi FET College</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Email Verification</p>
            </div>
            
            <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                Hello,
              </p>
              
              <p style="color: #374151; font-size: 14px; margin: 0 0 30px 0;">
                You requested a verification code for your Chithi College registration. Use the code below to verify your email address.
              </p>
              
              <div style="background: white; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px;">
                  Verification Code
                </p>
                <p style="margin: 15px 0 0 0; font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px;">
                  ${otp}
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 13px; margin: 30px 0 0 0;">
                <strong>Note:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
              </p>
              
              <p style="color: #6b7280; font-size: 13px; margin: 20px 0 0 0;">
                If you didn't request this code, please ignore this email or contact our support team.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                © 2026 Chithi FET College. All rights reserved.<br>
                <a href="https://chithicollege.org" style="color: #dc2626; text-decoration: none;">Visit our website</a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to generate OTP" },
      { status: 500 },
    );
  }
}