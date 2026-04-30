// app/register/components/OtpVerification.tsx
"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { toast } from "sonner";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormValues } from "./types";
import { Loader2 } from "lucide-react";

interface OtpVerificationProps {
  otp: string;
  setOtp: (value: string) => void;
  onVerified: () => void; // Called when OTP is correct → move to step 3
}

export default function OtpVerification({
  otp,
  setOtp,
  onVerified,
}: OtpVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const form = useFormContext<FormValues>();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setIsVerifying(true);

    try {
      const email = form.getValues("email");

      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast.success("Email verified successfully");
      onVerified(); // Move to next step
    } catch (err: any) {
      toast.error("Invalid or expired OTP", {
        description: err.message || "Please try again",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Section title="Email Verification">
      <p className="text-center mb-6">
        Enter the 6-digit code sent to your email
      </p>
      <div className="flex justify-center my-8">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => {
            /* back logic if needed */
          }}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || otp.length !== 6}
          className="bg-red-600 hover:bg-red-700 min-w-35"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Continue"
          )}
        </Button>
      </div>
    </Section>
  );
}
