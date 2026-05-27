// app/api/staff/clock-in/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attendanceRecords } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const OFFICES = [
  {
    lat: -29.8576,
    lng: 31.0218,
    radius: 250,
    name: "Durban - 417 Anton Lembede Str",
  },
  {
    lat: -25.675,
    lng: 28.195,
    radius: 250,
    name: "Pretoria North - 299 Burger Street",
  },
  {
    lat: -29.6,
    lng: 30.3833,
    radius: 250,
    name: "Pietermaritzburg - 16 Arras Str",
  },
  {
    lat: -29.1167,
    lng: 26.2167,
    radius: 250,
    name: "Bloemfontein - 78 Charlotte Maxeke Str",
  },
  {
    lat: -24.7,
    lng: 28.4,
    radius: 250,
    name: "Modimolle - 95 Nelson Mandela Drive",
  },
  {
    lat: -23.9048,
    lng: 29.4534,
    radius: 250,
    name: "Polokwane - 20 Thabo Mbeki Street",
  },
  {
    lat: -26.51,
    lng: 29.19,
    radius: 250,
    name: "Secunda - 2302 Horwood Street",
  },
];

const QR_PREFIX = "chithi-staff-clockin-permanent-";

function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
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

function isWithinAnyOffice(
  lat: number,
  lng: number,
): { ok: boolean; office?: string; distance?: number } {
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
  const session = (await getSession()) as any;
  if (!session || session.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    qrCodeValue,
    latitude,
    longitude,
    biometricType, // "face" or "fingerprint"
    faceDescriptor, // only for face
    credential, // only for fingerprint/WebAuthn
  } = body;

  // 1. Validate QR Code (First Check)
  if (!qrCodeValue || !qrCodeValue.startsWith(QR_PREFIX)) {
    return NextResponse.json(
      { error: "Invalid or unauthorized QR code" },
      { status: 403 },
    );
  }

  // 2. Validate Location
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "Location access is required" },
      { status: 400 },
    );
  }

  const locationCheck = isWithinAnyOffice(latitude, longitude);
  if (!locationCheck.ok) {
    const msg = locationCheck.office
      ? `Not at any office. Closest: ${locationCheck.office} (~${Math.round(locationCheck.distance || 0)}m away)`
      : "No nearby office detected";
    return NextResponse.json(
      { error: "Clock-in not allowed", message: msg },
      { status: 403 },
    );
  }

  // 3. Biometric Verification (Second Check)
  if (
    !biometricType ||
    (biometricType !== "face" && biometricType !== "fingerprint")
  ) {
    return NextResponse.json(
      { error: "Biometric type is required (face or fingerprint)" },
      { status: 400 },
    );
  }

  let verifyEndpoint = "";
  let verifyBody: any = { qrCodeValue };

  if (biometricType === "face") {
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { error: "Face descriptor is required" },
        { status: 400 },
      );
    }
    verifyEndpoint = "/api/attendance/verify-face";
    verifyBody.faceDescriptor = faceDescriptor;
  } else {
    if (!credential) {
      return NextResponse.json(
        { error: "WebAuthn credential is required" },
        { status: 400 },
      );
    }
    verifyEndpoint = "/api/attendance/verify-fingerprint";
    verifyBody.credential = credential;
  }

  // Call the biometric verification endpoint
  const verifyRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${verifyEndpoint}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifyBody),
    },
  );

  if (!verifyRes.ok) {
    const errorData = await verifyRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errorData.error || "Biometric verification failed" },
      { status: verifyRes.status },
    );
  }

  // 4. All checks passed → Record clock-in
  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toTimeString().slice(0, 5);

  // Prevent double clock-in
  const existing = await db.query.attendanceRecords.findFirst({
    where: and(
      eq(attendanceRecords.staffId, session.id),
      eq(attendanceRecords.date, today),
      eq(attendanceRecords.type, "clock_in"),
    ),
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already clocked in today" },
      { status: 409 },
    );
  }

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
    office: locationCheck.office,
  });
}
