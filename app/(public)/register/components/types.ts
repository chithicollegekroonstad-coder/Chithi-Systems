// app/register/components/types.ts

import { z } from "zod";

// Copy your full formSchema from page.tsx here
// (this avoids circular imports and keeps everything self-contained)

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const formSchema = z.object({
  // Step 1 - Personal
  idNumber: z.string().length(13, "ID must be exactly 13 digits"),
  title: z.string().min(1, "Title is required"),
  initials: z.string().optional(),
  surname: z.string().min(1, "Surname is required"),
  fullNames: z.string().min(1, "Full names are required"),
  maidenSurname: z.string().optional(),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  homeAddress: z.string().min(5, "Home address is required"),
  currentAddress: z.string().min(5, "Current address is required"),
  cellNumber: z.string().min(9, "Cell number is required"),
  homeTel: z.string().optional(),
  workTel: z.string().optional(),
  email: z.string().email("Invalid email address"),

  // Step 3 - Biographical
  nationality: z.string().optional(),
  ethnicity: z.string().optional(),
  homeLanguage: z.string().optional(),
  preferredLanguage: z.string().optional(),
  citizenship: z.string().optional(),
  passportNumber: z.string().optional(),

  // Step 4 - Emergency
  emergencyName: z.string().min(1, "Emergency contact name is required"),
  emergencyRelation: z.string().min(1, "Relationship is required"),
  emergencyCell: z.string().min(9, "Emergency cell number is required"),
  emergencyAddress: z.string().min(5, "Emergency address is required"),
  disability: z.boolean().optional(),
  disabilityType: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() !== "",
      "Disability type is required if checked",
    ),
  disabilityNotes: z.string().optional(),

  // Step 6 - School & Files
  lastSchool: z.string().min(1, "Last school attended is required"),
  highestGrade: z.string().min(1, "Highest grade passed is required"),
  yearPassed: z.string().min(4, "Year passed is required (YYYY)"),
  previousSchool: z.string().optional(),

  termsAccepted: z.literal(true, {
    message: "You must accept the terms & conditions",
  }),

  idCopy: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "ID copy is required")
    .refine((files) => {
      const file = files[0];
      return (
        file.size <= MAX_FILE_SIZE && ACCEPTED_FILE_TYPES.includes(file.type)
      );
    }, "ID copy must be JPG, PNG or PDF and ≤ 5MB"),

  matricCertificate: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Matric certificate is required")
    .refine((files) => {
      const file = files[0];
      return (
        file.size <= MAX_FILE_SIZE && ACCEPTED_FILE_TYPES.includes(file.type)
      );
    }, "Matric certificate must be JPG, PNG or PDF and ≤ 5MB"),
});

export type FormValues = z.infer<typeof formSchema>;
