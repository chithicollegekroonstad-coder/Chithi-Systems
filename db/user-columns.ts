import { users } from "@/db/schema";

/** Columns for `db.select(...)` on `users` (biometrics are not on the Drizzle model). */
export const usersCoreColumns = {
  id: users.id,
  email: users.email,
  passwordHash: users.passwordHash,
  firstName: users.firstName,
  lastName: users.lastName,
  idNumber: users.idNumber,
  cellNumber: users.cellNumber,
  role: users.role,
  status: users.status,
  studentNumber: users.studentNumber,
  isLocked: users.isLocked,
  lockedAt: users.lockedAt,
  lockReason: users.lockReason,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const;
