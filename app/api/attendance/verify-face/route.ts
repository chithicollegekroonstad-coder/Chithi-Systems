// app/api/attendance/verify-face/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFaceEmbeddingByUserId } from "@/db/user-biometrics";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { qrCodeValue, faceDescriptor } = await req.json();

    if (!qrCodeValue || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { error: "QR code and face descriptor are required" },
        { status: 400 },
      );
    }

    const storedEmbedding = await getFaceEmbeddingByUserId(Number(session.id));

    if (!storedEmbedding?.length) {
      return NextResponse.json(
        {
          error:
            "Face recognition not set up. Add DB columns (see drizzle/add-user-biometric-columns.sql) or complete activation.",
        },
        { status: 400 },
      );
    }

    // Simple Euclidean distance comparison
    const distance = euclideanDistance(
      storedEmbedding,
      faceDescriptor as number[],
    );

    // Threshold: adjust based on your model (face-api.js usually ~0.6 is good match)
    const MATCH_THRESHOLD = 0.55;

    if (distance > MATCH_THRESHOLD) {
      return NextResponse.json(
        { error: "Face does not match. Please try again." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Face verified successfully",
    });
  } catch (error) {
    console.error("Face verification error:", error);
    return NextResponse.json(
      { error: "Face verification failed" },
      { status: 500 },
    );
  }
}

// Helper function
function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}
