// app/actions/super-admin.ts
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Create new ADMIN account (super-admin only)
export async function createAdmin(formData: FormData) {
  const emailRaw = formData.get("email")?.toString().trim();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const email = emailRaw?.toLowerCase();

  if (!email || !firstName || !lastName) {
    redirect(
      "/super-admin?error=" +
        encodeURIComponent(
          "Email, first name, and last name are required",
        ),
    );
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
  if (existing.length > 0) {
    redirect(
      "/super-admin?error=" +
        encodeURIComponent("Email already in use"),
    );
  }

  try {
    await db.insert(users).values({
      email,
      firstName,
      lastName,
      role: "ADMIN",
      isLocked: false,
    });
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : "Failed to create admin account";
    console.error("createAdmin insert error:", e);
    redirect("/super-admin?error=" + encodeURIComponent(msg));
  }

  revalidatePath("/super-admin");
  revalidatePath("/admin/dashboard");

  redirect(
    "/super-admin?message=" +
      encodeURIComponent("Admin created successfully"),
  );
}

// Lock admin (super-admin only)
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

// Unlock admin (super-admin only)
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

// Delete admin (super-admin only)
export async function deleteAdmin(formData: FormData) {
  const adminId = Number(formData.get("adminId"));

  if (!adminId) throw new Error("Admin ID required");

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, adminId));

  if (!target) throw new Error("Admin not found");
  if (target.role === "SUPERADMIN") throw new Error("Cannot delete super admin");

  await db.delete(users).where(eq(users.id, adminId));

  revalidatePath("/super-admin");
  redirect("/super-admin?message=" + encodeURIComponent("Admin deleted successfully"));
}

// Logout super admin
export async function logoutSuper() {
  const cookieStore = await cookies();
  cookieStore.delete("super_access");
  redirect("/super-login");
}