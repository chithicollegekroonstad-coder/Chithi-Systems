CREATE TYPE "public"."attendance_type" AS ENUM('clock_in', 'clock_out');--> statement-breakpoint
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_student_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance_records" ALTER COLUMN "student_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ALTER COLUMN "class_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "staff_id" integer;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "clock_in_time" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "clock_out_time" text;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "type" "attendance_type" DEFAULT 'clock_in' NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" DROP COLUMN "time";--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_staff_date_unique" UNIQUE("staff_id","date");