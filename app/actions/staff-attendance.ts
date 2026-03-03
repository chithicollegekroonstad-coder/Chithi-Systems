// app/actions/staff-attendance.ts
"use server";

import { db } from "@/db";
import { attendanceRecords, users } from "@/db/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

// Get all staff attendance records (for admin)
export async function getStaffAttendance() {
  const records = await db
    .select({
      id: attendanceRecords.id,
      staffId: attendanceRecords.staffId,
      date: attendanceRecords.date,
      clockInTime: attendanceRecords.clockInTime,
      clockOutTime: attendanceRecords.clockOutTime,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(attendanceRecords)
    .leftJoin(users, eq(attendanceRecords.staffId, users.id))
    .where(sql`${attendanceRecords.staffId} IS NOT NULL`)
    .orderBy(desc(attendanceRecords.date), desc(attendanceRecords.clockInTime));

  return records;
}

// Clock in a staff member
export async function clockInStaff(staffId: string) {
  const session = await getSession() as any;
  if (!session || !["ADMIN", "SUPERADMIN", "STAFF"].includes(session.role)) {
    throw new Error("Unauthorized");
  }

  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toTimeString().slice(0, 5);

  // Check if already clocked in today
  const existing = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.staffId, parseInt(staffId)),
        eq(attendanceRecords.date, today),
      ),
    )
    .limit(1);

  if (existing.length > 0 && existing[0].clockInTime) {
    throw new Error("Already clocked in today");
  }

  await db.insert(attendanceRecords).values({
    staffId: parseInt(staffId),
    date: today,
    clockInTime: time,
    clockOutTime: null,
  });

  revalidatePath("/admin/dashboard");
  return { success: true, time };
}

// Clock out a staff member
export async function clockOutStaff(staffId: string) {
  const session = await getSession() as any;
  if (!session || !["ADMIN", "SUPERADMIN", "STAFF"].includes(session.role)) {
    throw new Error("Unauthorized");
  }

  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toTimeString().slice(0, 5);

  const record = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.staffId, parseInt(staffId)),
        eq(attendanceRecords.date, today),
        isNull(attendanceRecords.clockOutTime),
      ),
    )
    .limit(1);

  if (!record || record.length === 0) {
    throw new Error("No active clock-in found today");
  }

  await db
    .update(attendanceRecords)
    .set({ clockOutTime: time })
    .where(eq(attendanceRecords.id, record[0].id));

  revalidatePath("/admin/dashboard");
  return { success: true, time };
}