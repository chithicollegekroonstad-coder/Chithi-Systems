// lib/auth.ts
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// ──────────────────────────────────────────────────────────────
// SESSION MANAGEMENT - Simple & Reliable
// ──────────────────────────────────────────────────────────────

export async function createSession(userId: string) {
  // Generate secure token
  const token = randomBytes(32).toString("hex");

  // Store in database (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  // Find session + user data (Drizzle relation query)
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          studentNumber: true,
          isLocked: true,
        },
      },
    },
  });

  // Check if expired
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    return null;
  }

  // Check if user is locked
  if (session.user.isLocked) {
    return null;
  }

  return session.user;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  cookieStore.delete("session_token");
}

// ──────────────────────────────────────────────────────────────
// PASSWORD UTILITIES
// ──────────────────────────────────────────────────────────────

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// ──────────────────────────────────────────────────────────────
// ROLE CHECKS
// ──────────────────────────────────────────────────────────────

export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(role: "STUDENT" | "ADMIN" | "SUPERADMIN") {
  const user = await requireAuth();

  if (role === "SUPERADMIN" && user.role !== "SUPERADMIN") {
    throw new Error("Requires super admin access");
  }

  if (role === "ADMIN" && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    throw new Error("Requires admin access");
  }

  return user;
}

// ──────────────────────────────────────────────────────────────
// USER UTILITIES
// ──────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function findUserByStudentNumber(studentNumber: string) {
  return db.query.users.findFirst({
    where: eq(users.studentNumber, studentNumber),
  });
}

export async function createUser(data: {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role?: "STUDENT" | "ADMIN" | "SUPERADMIN";
  studentNumber?: string;
  idNumber?: string;
  cellNumber?: string;
}) {
  const passwordHash = data.password ? await hashPassword(data.password) : null;

  const [newUser] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || "STUDENT",
      studentNumber: data.studentNumber,
      idNumber: data.idNumber,
      cellNumber: data.cellNumber,
    })
    .returning();

  return newUser;
}
