// app/api/setup-face/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { setFaceEmbeddingByUserId } from "@/db/user-biometrics";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, faceDescriptor } = await req.json();

    if (!email || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { error: "Email and valid face descriptor (array) are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      columns: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await setFaceEmbeddingByUserId(user.id, faceDescriptor as number[]);

    return NextResponse.json({
      success: true,
      message: "Face recognition setup completed",
    });
  } catch (error) {
    console.error("Setup face error:", error);
    return NextResponse.json(
      { error: "Failed to save face data" },
      { status: 500 },
    );
  }
}
