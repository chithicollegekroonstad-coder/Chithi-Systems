// app/api/staff/clock-in/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attendanceRecords } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// Office locations with 200–300 m radius
const OFFICES = [
  { lat: -29.8576, lng: 31.0218, radius: 250, name: "Durban - 417 Anton Lembede Str" },
  { lat: -25.6750, lng: 28.1950, radius: 250, name: "Pretoria North - 299 Burger Street" },
  { lat: -29.6000, lng: 30.3833, radius: 250, name: "Pietermaritzburg - 16 Arras Str" },
  { lat: -29.1167, lng: 26.2167, radius: 250, name: "Bloemfontein - 78 Charlotte Maxeke Str" },
  { lat: -24.7000, lng: 28.4000, radius: 250, name: "Modimolle - 95 Nelson Mandela Drive" },
  { lat: -23.9048, lng: 29.4534, radius: 250, name: "Polokwane - 20 Thabo Mbeki Street" },
  { lat: -26.5100, lng: 29.1900, radius: 250, name: "Secunda - 2302 Horwood Street" },
];

const QR_PREFIX = "chithi-staff-clockin-permanent-";

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinAnyOffice(lat: number, lng: number): { ok: boolean; office?: string; distance?: number } {
  let closestDistance = Infinity;
  let closestOffice: string | undefined;

  for (const office of OFFICES) {
    const distance = getDistanceInMeters(lat, lng, office.lat, office.lng);
    if (distance <= office.radius) {
      return { ok: true, office: office.name, distance };
    }
    if (distance < closestDistance) {
      closestDistance = distance;
      closestOffice = office.name;
    }
  }

  return { ok: false, office: closestOffice, distance: closestDistance };
}

export async function POST(req: NextRequest) {
  const session = await getSession() as any;
  if (!session || session.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { qrCodeValue, latitude, longitude } = body;

  // Validate QR
  if (!qrCodeValue || !qrCodeValue.startsWith(QR_PREFIX)) {
    return NextResponse.json({ error: "Invalid or unauthorized QR code" }, { status: 403 });
  }

  // Require location
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "Location access is required" }, { status: 400 });
  }

  // Check location
  const locationCheck = isWithinAnyOffice(latitude, longitude);
  if (!locationCheck.ok) {
    const msg = locationCheck.office
      ? `Not at any office. Closest: ${locationCheck.office} (~${Math.round(locationCheck.distance || 0)}m away)`
      : "No nearby office detected";
    return NextResponse.json(
      {
        error: "Clock-in not allowed",
        message: msg,
      },
      { status: 403 }
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toTimeString().slice(0, 5); // HH:mm

  // Prevent double clock-in
  const existing = await db.query.attendanceRecords.findFirst({
    where: and(
      eq(attendanceRecords.staffId, session.id),
      eq(attendanceRecords.date, today),
      eq(attendanceRecords.type, "clock_in")
    ),
  });

  if (existing) {
    return NextResponse.json({ error: "You have already clocked in today" }, { status: 409 });
  }

  // Record clock-in
  await db.insert(attendanceRecords).values({
    staffId: session.id,
    date: today,
    clockInTime: time,
    type: "clock_in",
    markedAt: new Date(),
  });

  return NextResponse.json({
    success: true,
    message: `Clocked in successfully at ${locationCheck.office}`,
    time,
  });
}