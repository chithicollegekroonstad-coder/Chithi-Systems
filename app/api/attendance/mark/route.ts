// app/api/attendance/mark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attendanceRecords, classes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const KROONSTAD_LAT = -27.65;
const KROONSTAD_LNG = 27.2333;
const ALLOWED_RADIUS_METERS = 150; // ~150 m radius — adjust as needed

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { qrCodeValue, latitude, longitude } = body;

    if (!qrCodeValue) {
      return NextResponse.json(
        { error: "QR code value is required" },
        { status: 400 },
      );
    }

    // Require geolocation
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Location access is required to mark attendance" },
        { status: 400 },
      );
    }

    // Check if student is at the Kroonstad campus
    const distance = getDistanceInMeters(
      latitude,
      longitude,
      KROONSTAD_LAT,
      KROONSTAD_LNG,
    );

    if (distance > ALLOWED_RADIUS_METERS) {
      return NextResponse.json(
        {
          error:
            "You must be at the Kroonstad campus (Adami House) to mark attendance",
        },
        { status: 403 },
      );
    }

    // Find class by current QR code
    const classRecord = await db.query.classes.findFirst({
      where: eq(classes.qrCodeValue, qrCodeValue),
    });

    if (!classRecord) {
      return NextResponse.json(
        { error: "Invalid or expired QR code" },
        { status: 404 },
      );
    }

    // Current date
    const now = new Date();
    const date = now.toISOString().split("T")[0];

    // Check if already marked today
    const existing = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.studentId, user.id),
        eq(attendanceRecords.classId, classRecord.id),
        eq(attendanceRecords.date, date),
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already marked attendance for this class today" },
        { status: 409 },
      );
    }

    // Mark attendance
    await db.insert(attendanceRecords).values({
      studentId: user.id,
      classId: classRecord.id,
      date,
      time: now.toTimeString().split(" ")[0].substring(0, 5),
    });

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
      className: classRecord.name,
      module: classRecord.module,
      date,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    return NextResponse.json(
      { error: "Failed to mark attendance" },
      { status: 500 },
    );
  }
}

// Haversine formula to calculate distance in meters
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
