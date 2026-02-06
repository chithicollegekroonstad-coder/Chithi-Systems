// app/api/super-login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    const secret = process.env.SUPERADMIN_SECRET?.trim();

    if (!secret) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    if (code.trim() !== secret) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("super_access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (err) {
    console.error("Super login error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
