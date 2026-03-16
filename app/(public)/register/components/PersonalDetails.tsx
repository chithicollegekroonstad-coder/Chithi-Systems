// app/register/components/PersonalDetails.tsx
"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { Section } from "./Section";
import { FormValues } from "./types";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface PersonalDetailsProps {
  form: UseFormReturn<FormValues>;
  onVerified: () => void;
}

export default function PersonalDetails({
  form,
  onVerified,
}: PersonalDetailsProps) {
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const fullNames = form.watch("fullNames");
  const surname = form.watch("surname");

  useEffect(() => {
    const currentInitials = form.getValues("initials");
    if (currentInitials && !/^[A-Z]+$/.test(currentInitials)) {
      return;
    }

    let initials = "";

    if (fullNames) {
      const words = fullNames.trim().split(/\s+/);
      initials += words
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 3);
    }

    if (surname) {
      initials += surname.charAt(0).toUpperCase();
    }

    if (initials) {
      form.setValue("initials", initials, { shouldValidate: true });
    }
  }, [fullNames, surname, form]);

  const handleNextAndSendOtp = async () => {
    setIsSendingOtp(true);

    try {
      const isValid = await form.trigger([
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
      ]);

      if (!isValid) {
        toast.error("Please complete all required personal details correctly");
        return;
      }

      const email = form.getValues("email");

      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      toast.success("OTP sent successfully", {
        description: "Check your email inbox (and spam folder)",
      });

      onVerified();
    } catch (err: any) {
      toast.error("Could not send OTP", {
        description:
          err.message || "Please check your connection and try again",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <Section title="SECTION A: PERSONAL DETAILS (As per ID)">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* ID Number */}
        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identity Number (13 digits)*</FormLabel>
              <FormControl>
                <Input maxLength={13} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Mrs">Mrs</SelectItem>
                  <SelectItem value="Miss">Miss</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
       
        {/* Surname */}
        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surname*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Full Names */}
        <FormField
          control={form.control}
          name="fullNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name(s)*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Thabo Vincent Mokoena" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Initials */}
        <FormField
          control={form.control}
          name="initials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initials (auto-filled)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Auto-filled from names"
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Maiden Surname */}
        <FormField
          control={form.control}
          name="maidenSurname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maiden Surname (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth */}
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth* (dd/mm/yyyy)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="dd/mm/yyyy"
                  inputMode="numeric"
                  pattern="(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/(19|20)\d{2}"
                  maxLength={10}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length === 2 || value.length === 5) {
                      value += "/";
                    }
                    field.onChange(value.slice(0, 10));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Home Address */}
        <FormField
          control={form.control}
          name="homeAddress"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Home Address*</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Current Address */}
        <FormField
          control={form.control}
          name="currentAddress"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Current Address*</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cell Number */}
        <FormField
          control={form.control}
          name="cellNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cell Phone Number*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Home Tel */}
        <FormField
          control={form.control}
          name="homeTel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Home Telephone (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Work Tel */}
        <FormField
          control={form.control}
          name="workTel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Telephone (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Email Address*</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* FIXED: Full-width responsive button */}
      <div className="w-full mt-8">
        <Button
          type="button"
          onClick={handleNextAndSendOtp}
          disabled={isSendingOtp}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isSendingOtp ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Section>
  );
}
