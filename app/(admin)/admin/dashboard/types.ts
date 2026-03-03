// app/admin/dashboard/types.ts

// ── Core Entity Types ────────────────────────────────────────────────────────

export type UserBase = {
  id: number | string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;              // ← role is here, so Student and Staff inherit it
  isLocked: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Student = UserBase & {
  studentNumber: string;
  status: "active" | "frozen" | "graduated" | "pending";
  frozenAt?: string;
  graduatedAt?: string;
};

export type Staff = UserBase & {
  cellNumber?: string | null;
  idNumber?: string | null;
  // Fields commonly used in UI
  name?: string;      // optional computed
  surname?: string;   // optional computed
};

export type Admin = UserBase & {
  // Admins usually share base fields
  // Extend later if needed
};

// ── Feature-Specific Types ───────────────────────────────────────────────────

export type Application = {
  id: string;
  studentNumber: string;
  name: string;
  surname: string;
  idNumber: string;
  email: string;
  status: "pending" | "approved" | "declined";
  appliedAt: string;
};

export type Class = {
  id: string;
  module: string;
  name: string;
  createdAt: string;
  qrCodeValue: string;
};

export type AttendanceRecord = {
  id: string;
  classId: string;
  studentNumber: string;
  name: string;
  surname: string;
  idNumber: string;
  date: string;
  time: string;
  attended: boolean;
};

// Update this in your types.ts file
// Update this in your types.ts file

export type StaffAttendanceRecord = {
  id: number;  // ← Changed from string
  staffId: number | null;  // ← Changed from string
  date: string;
  clockInTime: string;
  clockOutTime: string | null;
  firstName: string | null;
  lastName: string | null;
};

// ── Server Action Result Types ──────────────────────────────────────────────

export type CreateAdminResult = {
  success: boolean;
  admin?: Admin;
  error?: string;
};

// ── Union type for people ────────────────────────────────────────────────────

export type Person = Student | Staff | Admin;