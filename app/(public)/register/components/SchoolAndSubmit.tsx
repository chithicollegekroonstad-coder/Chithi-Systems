// app/register/components/SchoolAndSubmit.tsx
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Section } from "./Section";
import { FormValues } from "./types";


interface SchoolAndSubmitProps {
  form: UseFormReturn<FormValues>;
  onFileChange: (
    field: "idCopy" | "matricCertificate",
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function SchoolAndSubmit({
  form,
  onFileChange,
  isSubmitting,
  onSubmit,
}: SchoolAndSubmitProps) {
  return (
    <Section title="SCHOOL LEAVING DETAILS & FINAL SUBMISSION">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="lastSchool"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last School Attended*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="highestGrade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Highest Grade Passed*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="yearPassed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year Passed*</FormLabel>
              <FormControl>
                <Input placeholder="YYYY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="previousSchool"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Name of Previous School / College</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Uploads */}
        <div className="sm:col-span-2 space-y-6 pt-4">
          <FormField
            control={form.control}
            name="idCopy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Copy (required)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={onFileChange("idCopy")}
                  />
                </FormControl>
                <p className="text-sm text-gray-500 mt-1">
                  Upload clear copy of ID (PDF or image, max 5MB)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="matricCertificate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matric Certificate / Statement (required)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={onFileChange("matricCertificate")}
                  />
                </FormControl>
                <p className="text-sm text-gray-500 mt-1">
                  Upload your matric certificate or latest statement (PDF or
                  image, max 5MB)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="sm:col-span-2 pt-4 flex items-start space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="terms"
                />
              </FormControl>
              <Label htmlFor="terms" className="text-base cursor-pointer">
                I accept the Terms & Conditions*
              </Label>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end mt-8">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !form.formState.isValid}
          className="bg-red-600 hover:bg-red-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </Section>
  );
}
