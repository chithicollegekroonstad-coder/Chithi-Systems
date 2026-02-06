// app/actions/super-admin.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ──────────────────────────────────────────────────────────────
// ADMIN ACCOUNT MANAGEMENT (Super Admin Only)
// ──────────────────────────────────────────────────────────────

export async function createAdmin(formData: FormData) {
  try {
    await requireRole("SUPERADMIN");

    const email = (formData.get("email") as string).toLowerCase().trim();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as "ADMIN" | "SUPERADMIN") || "ADMIN";

    if (!email || !firstName || !lastName || !password) {
      throw new Error("All fields are required");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error("Email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        status: "ACTIVE",
      },
    });

    revalidatePath("/super-admin");
    return { success: true, admin };
  } catch (error: any) {
    console.error("Create admin error:", error);
    return { success: false, error: error.message };
  }
}

export async function lockAdmin(formData: FormData) {
  try {
    await requireRole("SUPERADMIN");
    const adminId = formData.get("adminId") as string;
    const reason = formData.get("reason") as string;

    // Prevent locking other super admins
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin?.role === "SUPERADMIN") {
      throw new Error("Cannot lock super admin accounts");
    }

    await prisma.user.update({
      where: { id: adminId },
      data: {
        isLocked: true,
        lockedAt: new Date(),
        lockReason: reason || "Locked by super admin",
      },
    });

    revalidatePath("/super-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Lock admin error:", error);
    return { success: false, error: error.message };
  }
}

export async function unlockAdmin(formData: FormData) {
  try {
    await requireRole("SUPERADMIN");
    const adminId = formData.get("adminId") as string;

    await prisma.user.update({
      where: { id: adminId },
      data: {
        isLocked: false,
        lockedAt: null,
        lockReason: null,
      },
    });

    revalidatePath("/super-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Unlock admin error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdmin(formData: FormData) {
  try {
    await requireRole("SUPERADMIN");
    const adminId = formData.get("adminId") as string;

    // Prevent deleting other super admins
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin?.role === "SUPERADMIN") {
      throw new Error("Cannot delete super admin accounts");
    }

    await prisma.user.delete({
      where: { id: adminId },
    });

    revalidatePath("/super-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete admin error:", error);
    return { success: false, error: error.message };
  }
}

// ──────────────────────────────────────────────────────────────
// SYSTEM MANAGEMENT
// ──────────────────────────────────────────────────────────────

export async function getSystemStats() {
  try {
    await requireRole("SUPERADMIN");

    const [
      totalStudents,
      activeStudents,
      frozenStudents,
      totalAdmins,
      totalApplications,
      pendingApplications,
      totalClasses,
      todayAttendance,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "STUDENT", status: "FROZEN" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "PENDING" } }),
      prisma.class.count(),
      prisma.attendanceRecord.count({
        where: {
          date: new Date().toISOString().split("T")[0],
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        frozenStudents,
        totalAdmins,
        totalApplications,
        pendingApplications,
        totalClasses,
        todayAttendance,
      },
    };
  } catch (error: any) {
    console.error("Get system stats error:", error);
    return { success: false, error: error.message };
  }
}
