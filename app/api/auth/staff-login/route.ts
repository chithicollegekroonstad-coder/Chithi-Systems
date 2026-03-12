// app/api/auth/staff-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";


// Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
  stayLoggedIn: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    // Validate input with Zod
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, stayLoggedIn } = parsed.data;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Role check
    if (user.role !== "STAFF") {
      return NextResponse.json({ error: "This login is for staff only" }, { status: 403 });
    }

    // Lock check
    if (user.isLocked) {
      return NextResponse.json({ error: "Account is locked. Contact admin" }, { status: 403 });
    }

    // Password setup check
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Account not set up. Please set a password first" },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie - FIXED: await cookies() first
    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: stayLoggedIn ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 1 day
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      redirect: "/attendance",
    });
  } catch (err) {
    console.error("Staff login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}