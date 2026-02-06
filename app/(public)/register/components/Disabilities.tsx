// app/register/components/Disabilities.tsx
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "./Section";
import { FormValues } from "./types";

const DISABILITIES = [
  "None",
  "Physical disability",
  "Visual impairment",
  "Hearing impairment",
  "Speech impairment",
  "Learning disability",
  "Neurodevelopmental condition",
  "Chronic health condition",
  "Mental health condition",
  "Other",
];

interface DisabilitiesProps {
  form: UseFormReturn<FormValues>;
}

export default function Disabilities({ form }: DisabilitiesProps) {
  return (
    <Section title="SECTION D: DISABILITIES / SPECIAL NEEDS">
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="disabilityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of Disability / Special Need*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DISABILITIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="disabilityNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (optional)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Section>
  );
}
