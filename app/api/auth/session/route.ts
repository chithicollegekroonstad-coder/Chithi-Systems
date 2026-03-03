// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  // Await cookies() first!
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const payload = await verifyToken(token); // assuming verifyToken is async
    return NextResponse.json({ user: payload });
  } catch (err) {
    console.error("Session verify error:", err);
    return NextResponse.json({ user: null });
  }
}