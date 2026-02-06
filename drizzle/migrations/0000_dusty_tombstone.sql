CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('STUDENT', 'ADMIN', 'SUPERADMIN');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('ACTIVE', 'FROZEN', 'GRADUATED');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"initials" text,
	"surname" text NOT NULL,
	"full_names" text NOT NULL,
	"maiden_surname" text,
	"dob" text NOT NULL,
	"gender" text NOT NULL,
	"home_address" text NOT NULL,
	"current_address" text NOT NULL,
	"cell_number" text NOT NULL,
	"home_tel" text,
	"work_tel" text,
	"email" text NOT NULL,
	"id_number" text NOT NULL,
	"nationality" text,
	"ethnicity" text,
	"home_language" text,
	"preferred_language" text,
	"citizenship" text,
	"passport_number" text,
	"emergency_name" text NOT NULL,
	"emergency_relation" text NOT NULL,
	"emergency_cell" text NOT NULL,
	"emergency_address" text NOT NULL,
	"disability" boolean,
	"disability_type" text,
	"disability_notes" text,
	"last_school" text NOT NULL,
	"highest_grade" text NOT NULL,
	"year_passed" text NOT NULL,
	"previous_school" text,
	"id_copy_url" text NOT NULL,
	"matric_cert_url" text NOT NULL,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	CONSTRAINT "attendance_records_student_id_class_id_date_pk" PRIMARY KEY("student_id","class_id","date")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"module" text NOT NULL,
	"qr_code_value" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "classes_qr_code_value_unique" UNIQUE("qr_code_value")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"id_number" text,
	"cell_number" text,
	"role" "role" DEFAULT 'STUDENT' NOT NULL,
	"status" "student_status" DEFAULT 'ACTIVE' NOT NULL,
	"student_number" text,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp with time zone,
	"lock_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_id_number_unique" UNIQUE("id_number"),
	CONSTRAINT "users_student_number_unique" UNIQUE("student_number")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;