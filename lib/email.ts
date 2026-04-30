// lib/email.ts
import { Resend } from "resend";

function getResendClient(): Resend {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return new Resend(resendApiKey);
}

export async function sendOTPEmail(email: string, code: string) {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: "Chithi FET College <noreply@chithifetcollege.co.za>",
      to: email,
      subject: "Your Registration OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Chithi FET College</h2>
          <h3>Email Verification</h3>
          <p>Your OTP code is:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc2626; font-size: 36px; margin: 0; letter-spacing: 8px;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Chithi FET College Registration System<br>
            This is an automated email, please do not reply.
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export async function sendApprovalEmail(
  email: string,
  studentNumber: string,
  _password: string,
  name: string,
) {
  try {
    const resend = getResendClient();
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const setPasswordUrl = `${baseUrl}/set-password?email=${encodeURIComponent(email)}`;
    const studentLoginUrl = `${baseUrl}/login/student`;

    await resend.emails.send({
      from: "Chithi FET College <noreply@chithifetcollege.co.za>",
      to: email,
      subject: "Application Approved - Complete Account Setup",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Chithi FET College</h2>
          <h3>🎉 Application Approved!</h3>
          <p>Dear ${name},</p>
          <p>Congratulations! Your application has been approved.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Your Account Details:</h4>
            <p><strong>Student Number:</strong> ${studentNumber}</p>
          </div>
          
          <p><strong>Next step (required):</strong> Set your password and biometrics first.</p>
          <p><a href="${setPasswordUrl}" style="color: #dc2626; font-weight: bold;">Complete account setup</a></p>
          
          <p>After setup is complete, you can log in here: <a href="${studentLoginUrl}">Student Login</a></p>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Chithi FET College<br>
            This is an automated email, please do not reply.
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export async function sendRejectionEmail(
  email: string,
  name: string,
  reason?: string,
) {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: "Chithi FET College <noreply@chithifetcollege.co.za>",
      to: email,
      subject: "Application Status Update",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Chithi FET College</h2>
          <h3>Application Status Update</h3>
          <p>Dear ${name},</p>
          <p>Thank you for your interest in Chithi FET College.</p>
          <p>Unfortunately, we are unable to approve your application at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>You may reapply in the future. For questions, please contact our admissions office.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Chithi FET College<br>
            This is an automated email, please do not reply.
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}
