// app/register/components/EmergencyContact.tsx
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Section } from "./Section";
import { FormValues } from "./types";

export default function EmergencyContact({
  form,
}: {
  form: UseFormReturn<FormValues>;
}) {
  const hasDisability = form.watch("disability");

  return (
    <Section title="SECTION C: EMERGENCY CONTACT">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="emergencyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergencyRelation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergencyCell"
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

        <FormField
          control={form.control}
          name="emergencyAddress"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Physical Address*</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sm:col-span-2 pt-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="disabilities"
              checked={hasDisability}
              onCheckedChange={(checked) =>
                form.setValue("disability", !!checked)
              }
            />
            <Label
              htmlFor="disabilities"
              className="text-base font-medium cursor-pointer"
            >
              I have a disability or special learning needs
            </Label>
          </div>
        </div>
      </div>
    </Section>
  );
}
