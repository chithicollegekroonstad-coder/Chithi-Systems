// app/actions/admin-management.ts
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 1. Create new admin (no password – they set it later)
export async function createAdmin(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();

  if (!email || !firstName || !lastName) {
    return { error: "Email, first name, and last name are required" };
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return { error: "Email already in use" };
  }

  await db.insert(users).values({
    email,
    firstName,
    lastName,
    role: "ADMIN",
    isLocked: false,
    // No passwordHash → they can't log in yet
  });

  revalidatePath("/super-admin");
  return { success: "Admin created successfully" };
}

// 2. Lock admin
export async function lockAdmin(formData: FormData) {
  const adminId = Number(formData.get("adminId"));

  if (!adminId) return { error: "Admin ID required" };

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, adminId));

  if (!target) return { error: "Admin not found" };
  if (target.role === "SUPERADMIN") return { error: "Cannot lock super admin" };

  await db
    .update(users)
    .set({
      isLocked: true,
      lockedAt: new Date(),
      lockReason: "Locked by super admin",
    })
    .where(eq(users.id, adminId));

  revalidatePath("/super-admin");
  return { success: "Admin locked" };
}

// 3. Unlock admin
export async function unlockAdmin(formData: FormData) {
  const adminId = Number(formData.get("adminId"));

  if (!adminId) return { error: "Admin ID required" };

  await db
    .update(users)
    .set({
      isLocked: false,
      lockedAt: null,
      lockReason: null,
    })
    .where(eq(users.id, adminId));

  revalidatePath("/super-admin");
  return { success: "Admin unlocked" };
}

// 4. Delete admin
export async function deleteAdmin(formData: FormData) {
  const adminId = Number(formData.get("adminId"));

  if (!adminId) return { error: "Admin ID required" };

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, adminId));

  if (!target) return { error: "Admin not found" };
  if (target.role === "SUPERADMIN")
    return { error: "Cannot delete super admin" };

  await db.delete(users).where(eq(users.id, adminId));

  revalidatePath("/super-admin");
  return { success: "Admin deleted" };
}

// 5. Logout super admin
export async function logoutSuper() {
  const cookieStore = cookies();
  cookieStore.delete("super_access");
  redirect("/super-login");
}
