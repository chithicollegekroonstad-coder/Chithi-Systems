// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Find student by student number
    const user = await prisma.user.findUnique({
      where: { studentNumber: studentNumber.toUpperCase() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Check if student (not admin)
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Check if account is frozen
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
        name: `${user.firstName} ${user.lastName}`,
        studentNumber: user.studentNumber,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
