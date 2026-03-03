// app/actions/admin-management.ts
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 1. Create new STAFF account (used by admins and super-admin)
export async function createStaff(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();

  if (!email || !firstName || !lastName) {
    throw new Error("Email, first name, and last name are required");
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw new Error("Email already in use");
  }

  await db.insert(users).values({
    email,
    firstName,
    lastName,
    role: "STAFF",
    isLocked: false,
    // No passwordHash → they can't log in until they set it
  });

  revalidatePath("/super-admin");
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard?message=" + encodeURIComponent("Staff created successfully"));
}

// 2. Lock admin (super-admin only)
export async function lockAdmin(formData: FormData) {
  const adminId = Number(formData.get("adminId"));

  if (!adminId) throw new Error("Admin ID required");

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, adminId));

  if (!target) throw new Error("Admin not found");
  if (target.role === "SUPERADMIN") throw new Error("Cannot lock super admin");

  await db
    .update(users)
    .set({
      isLocked: true,
      lockedAt: new Date(),
      lockReason: "Locked by super admin",
    })
    .where(eq(users.id, adminId));

  revalidatePath("/super-admin");
  redirect("/super-admin?message=" + encodeURIComponent("Admin locked successfully"));
}

// 3. Unlock admin (super-admin only)
export async function unlockAdmin(formData: FormData) {
  const adminId = Number(formData.get("adminId"));

  if (!adminId) throw new Error("Admin ID required");

  await db
    .update(users)
    .set({
      isLocked: false,
      lockedAt: null,
      lockReason: null,
    })
    .where(eq(users.id, adminId));

  revalidatePath("/super-admin");
  redirect("/super-admin?message=" + encodeURIComponent("Admin unlocked successfully"));
}

// 4. Delete admin (super-admin only)
export async function deleteAdmin(formData: FormData) {
  const adminId = Number(formData.get("adminId"));

  if (!adminId) throw new Error("Admin ID required");

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, adminId));

  if (!target) throw new Error("Admin not found");
  if (target.role === "SUPERADMIN")
    throw new Error("Cannot delete super admin");

  await db.delete(users).where(eq(users.id, adminId));

  revalidatePath("/super-admin");
  redirect("/super-admin?message=" + encodeURIComponent("Admin deleted successfully"));
}

// 5. Delete staff (admin or super-admin)
export async function deleteStaff(formData: FormData) {
  const staffId = Number(formData.get("staffId"));

  if (!staffId) throw new Error("Staff ID required");

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, staffId));

  if (!target) throw new Error("Staff not found");
  if (target.role !== "STAFF")
    throw new Error("Can only delete staff accounts");

  await db.delete(users).where(eq(users.id, staffId));

  revalidatePath("/admin/dashboard");
  revalidatePath("/super-admin");
  redirect("/admin/dashboard?message=" + encodeURIComponent("Staff deleted successfully"));
}

// 6. Logout super admin
export async function logoutSuper() {
  const cookieStore = await cookies();
  cookieStore.delete("super_access");
  redirect("/super-login");
}

// 7. Get all staff members (for dashboard)
export async function getStaffMembers() {
  const staff = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isLocked: users.isLocked,
    })
    .from(users)
    .where(eq(users.role, "STAFF"))
    .orderBy(users.createdAt);

  return staff;
}