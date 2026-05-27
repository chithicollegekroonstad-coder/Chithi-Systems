// app/api/set-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, studentNumber, password } = await req.json();

    if ((!email && !studentNumber) || !password) {
      return NextResponse.json(
        { error: "Email or student number and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : undefined;
    const normalizedStudentNumber =
      typeof studentNumber === "string"
        ? studentNumber.trim().toUpperCase()
        : undefined;

    // Find user who hasn't set password yet
    const user = await db.query.users.findFirst({
      where: and(
        isNull(users.passwordHash),
        normalizedEmail
          ? eq(users.email, normalizedEmail)
          : eq(users.studentNumber, normalizedStudentNumber!),
      ),
      columns: {
        id: true,
        role: true,
        email: true,
        studentNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "No pending account found with this email, or password already set",
        },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12); // 12 is better than 10

    // Update password
    await db
      .update(users)
      .set({
        passwordHash,
        // Optionally mark account as active if you have such a field
        // isActive: true,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: "Password set successfully",
      userId: user.id,
      role: user.role, // We'll use this later to decide flow
      email: user.email,
      studentNumber: user.studentNumber,
    });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
