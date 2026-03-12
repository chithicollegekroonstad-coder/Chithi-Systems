// app/api/auth/staff-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

// Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Find staff member
    const staff = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
      columns: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isLocked: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!staff || !staff.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Only STAFF and ADMIN can login here
    if (staff.role !== "STAFF" && staff.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (staff.isLocked) {
      return NextResponse.json(
        { error: "Account is locked" },
        { status: 403 },
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, staff.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create session
    await createSession(staff.id.toString());

    return NextResponse.json({
      success: true,
      user: {
        id: staff.id,
        email: staff.email,
        name: `${staff.firstName || ""} ${staff.lastName || ""}`.trim(),
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("Staff login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}