// db/schema.ts
import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
  primaryKey,
  unique, // ← added for unique constraints
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["STUDENT", "ADMIN", "SUPERADMIN"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const studentStatusEnum = pgEnum("student_status", [
  "ACTIVE",
  "FROZEN",
  "GRADUATED",
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  idNumber: text("id_number").unique(),
  cellNumber: text("cell_number"),
  role: roleEnum("role").notNull().default("STUDENT"),
  status: studentStatusEnum("status").notNull().default("ACTIVE"),
  studentNumber: text("student_number").unique(),
  isLocked: boolean("is_locked").notNull().default(false),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  lockReason: text("lock_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Add this near the other table definitions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  title: text("title").notNull(),
  initials: text("initials"),
  surname: text("surname").notNull(),
  fullNames: text("full_names").notNull(),
  maidenSurname: text("maiden_surname"),
  dob: text("dob").notNull(),
  gender: text("gender").notNull(),
  homeAddress: text("home_address").notNull(),
  currentAddress: text("current_address").notNull(),
  cellNumber: text("cell_number").notNull(),
  homeTel: text("home_tel"),
  workTel: text("work_tel"),
  email: text("email").notNull(),
  idNumber: text("id_number").notNull(),
  nationality: text("nationality"),
  ethnicity: text("ethnicity"),
  homeLanguage: text("home_language"),
  preferredLanguage: text("preferred_language"),
  citizenship: text("citizenship"),
  passportNumber: text("passport_number"),
  emergencyName: text("emergency_name").notNull(),
  emergencyRelation: text("emergency_relation").notNull(),
  emergencyCell: text("emergency_cell").notNull(),
  emergencyAddress: text("emergency_address").notNull(),
  disability: boolean("disability"),
  disabilityType: text("disability_type"),
  disabilityNotes: text("disability_notes"),
  lastSchool: text("last_school").notNull(),
  highestGrade: text("highest_grade").notNull(),
  yearPassed: text("year_passed").notNull(),
  previousSchool: text("previous_school"),
  idCopyUrl: text("id_copy_url").notNull(),
  matricCertUrl: text("matric_cert_url").notNull(),
  status: applicationStatusEnum("status").notNull().default("PENDING"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  module: text("module").notNull(),
  qrCodeValue: text("qr_code_value").notNull().unique(), // ← current daily code
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Attendance Records (fixed: only one PK + unique constraint)
export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: serial("id").primaryKey(), // ← only PK
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    classId: integer("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    markedAt: timestamp("marked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    date: text("date").notNull(),
    time: text("time").notNull(),
  },
  (table) => ({
    // Enforce one attendance per student/class/day (unique instead of PK)
    uniquePerStudentClassDate: unique(
      "attendance_records_student_class_date_unique",
    ).on(table.studentId, table.classId, table.date),
  }),
);

// OTP Codes
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// One-time password setup tokens
export const passwordSetupTokens = pgTable("password_setup_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  used: boolean("used").notNull().default(false),
});

// Relations
// Relations (use relations() helper — it provides one() and many() internally)
export const usersRelations = relations(users, ({ many, one }) => ({
  attendance: many(attendanceRecords),
  application: one(applications, {
    fields: [users.id],
    references: [applications.userId],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  attendance: many(attendanceRecords),
}));

export const attendanceRecordsRelations = relations(
  attendanceRecords,
  ({ one }) => ({
    student: one(users, {
      fields: [attendanceRecords.studentId],
      references: [users.id],
    }),
    class: one(classes, {
      fields: [attendanceRecords.classId],
      references: [classes.id],
    }),
  }),
);
