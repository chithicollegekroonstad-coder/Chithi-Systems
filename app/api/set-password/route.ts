// app/api/set-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email and password (min 8 chars) are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user who has NO password yet
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, normalizedEmail),
        isNull(users.passwordHash), // ← key condition
      ),
      columns: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email, or password already set" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Set password
    await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "Failed to set password — try again" },
      { status: 500 },
    );
  }
}
