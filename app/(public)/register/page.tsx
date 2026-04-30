// app/register/page.tsx
"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ProgressBar } from "./components/ProgressBar";
import { RegistrationCard } from "./components/RegistrationCard";
import PersonalDetails from "./components/PersonalDetails";
import OtpVerification from "./components/OtpVerification";
import BiographicalDetails from "./components/BiographicalDetails";
import EmergencyContact from "./components/EmergencyContact";
import Disabilities from "./components/Disabilities";
import SchoolAndSubmit from "./components/SchoolAndSubmit";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Form } from "@/components/ui/form";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const formSchema = z.object({
  idNumber: z.string().length(13, "ID number must be exactly 13 digits"),
  title: z.string().min(1, "Title is required"),
  surname: z.string().min(1, "Surname is required"),
  fullNames: z.string().min(1, "Full names are required"),
  initials: z.string().optional(),
  maidenSurname: z.string().optional(),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  homeAddress: z.string().min(5, "Home address is required"),
  currentAddress: z.string().min(5, "Current address is required"),
  cellNumber: z.string().min(9, "Cell number is required"),
  homeTel: z.string().optional(),
  workTel: z.string().optional(),
  email: z.string().email("Invalid email address"),
  nationality: z.string().optional(),
  ethnicity: z.string().optional(),
  homeLanguage: z.string().optional(),
  preferredLanguage: z.string().optional(),
  citizenship: z.string().optional(),
  passportNumber: z.string().optional(),
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
  lastSchool: z.string().min(1, "Last school attended is required"),
  highestGrade: z.string().min(1, "Highest grade passed is required"),
  yearPassed: z.string().min(4, "Year passed is required (YYYY)"),
  previousSchool: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms & conditions",
  }),
  idCopy: z.any().optional(),
  matricCertificate: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  "Personal",
  "Verify Email",
  "Biographical",
  "Emergency",
  "Disabilities",
  "School & Submit",
];

function RegistrationContent() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      termsAccepted: false,
      disability: false,
    },
    mode: "onChange",
  });

  const router = useRouter();

  const handleFileChange =
    (fieldName: "idCopy" | "matricCertificate") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (!files || files.length === 0) {
        form.setValue(fieldName, undefined);
        form.clearErrors(fieldName);
        return;
      }

      const file = files[0];

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File too large (max 5MB)");
        e.target.value = "";
        form.setError(fieldName, { message: "File too large" });
        return;
      }

      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast.error("Only JPG, PNG, or PDF allowed");
        e.target.value = "";
        form.setError(fieldName, { message: "Invalid file type" });
        return;
      }

      form.setValue(fieldName, files);
      form.clearErrors(fieldName);
    };

  const handleNext = async () => {
    const fields = getFieldsForStep(step);
    const isValid = await form.trigger(fields);

    if (!isValid) {
      toast.error("Please complete all required fields correctly");
      return;
    }

    if (step === 2) {
      if (otp.length !== 6) {
        toast.error("OTP must be 6 digits");
        return;
      }
      toast.success("Email Verified");
    }

    if (step === 4) {
      const hasDisability = form.watch("disability");
      setStep(hasDisability ? 5 : 6);
      return;
    }

    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    const termsValue = form.watch("termsAccepted");
    if (termsValue !== true) {
      toast.error("You must accept the terms & conditions");
      setIsSubmitting(false);
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix all validation errors");
      setIsSubmitting(false);
      return;
    }

    const values = form.getValues();
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        !key.includes("Copy") &&
        !key.includes("Certificate")
      ) {
        formData.append(key, value.toString());
      }
    });

    if (values.idCopy && values.idCopy[0]) {
      formData.append("idCopy", values.idCopy[0]);
    }
    if (values.matricCertificate && values.matricCertificate[0]) {
      formData.append("matricCertificate", values.matricCertificate[0]);
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Registration Submitted!", {
        description: "Check your email for verification code",
      });

      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error("Submission failed", {
        description: err.message || "Please try again or contact support",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (step: number): (keyof FormValues)[] => {
    switch (step) {
      case 1:
        return [
          "idNumber",
          "title",
          "surname",
          "fullNames",
          "dob",
          "gender",
          "homeAddress",
          "currentAddress",
          "cellNumber",
          "email",
        ];
      case 2:
        return [];
      case 3:
        return [];
      case 4:
        return [
          "emergencyName",
          "emergencyRelation",
          "emergencyCell",
          "emergencyAddress",
        ];
      case 5:
        return ["disabilityType"];
      case 6:
        return [
          "lastSchool",
          "highestGrade",
          "yearPassed",
          "termsAccepted",
          "idCopy",
          "matricCertificate",
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <RegistrationCard>
        <ProgressBar steps={steps} currentStep={step} />

        <Form {...form}>
          <form className="space-y-10">
            {step === 1 && (
              <PersonalDetails
                form={form as any}
                onVerified={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <OtpVerification
                otp={otp}
                setOtp={setOtp}
                onVerified={() => setStep(3)}
              />
            )}
            {step === 3 && <BiographicalDetails form={form as any} />}
            {step === 4 && <EmergencyContact form={form as any} />}
            {step === 5 && (
              <Disabilities
                form={form as any}
              />
            )}
            {step === 6 && (
              <SchoolAndSubmit
                form={form as any}
                onFileChange={handleFileChange}
                isSubmitting={isSubmitting}
                onSubmit={handleFinalSubmit}
              />
            )}
          </form>
        </Form>

        {/* Navigation buttons - full width on mobile, flex on larger screens */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between mt-10">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}

          {step !== 1 && step !== 2 && step < steps.length && (
            <Button
              onClick={handleNext}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 sm:ml-auto"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </RegistrationCard>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 py-24 text-neutral-600">
          Loading registration…
        </div>
      }
    >
      <RegistrationContent />
    </Suspense>
  );
}
