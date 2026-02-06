// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { studentNumber, password } = await req.json();

    if (!studentNumber || !password) {
      return NextResponse.json(
        { error: "Student number and password required" },
        { status: 400 },
      );
    }

    const normalizedStudentNumber = studentNumber.trim().toUpperCase();

    // Find student with Drizzle
    const user = await db.query.users.findFirst({
      where: eq(users.studentNumber, normalizedStudentNumber),
      columns: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        studentNumber: true,
        isLocked: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Must be STUDENT (not admin or superadmin)
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Account frozen?
    if (user.status === "FROZEN") {
      return NextResponse.json(
        {
          error: "Your account is frozen. Please contact admin or re-register.",
        },
        { status: 403 },
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create session
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        studentNumber: user.studentNumber,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
