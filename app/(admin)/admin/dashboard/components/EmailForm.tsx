// app/admin/dashboard/components/EmailForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { Student } from "../types";

interface EmailFormProps {
  subject: string;
  setSubject: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
  label: string;
  students: Student[];
  isBroadcast?: boolean;
  selectedStudent?: Student | null;
  setSelectedStudent?: (student: Student | null) => void;
}

export function EmailForm({
  subject,
  setSubject,
  message,
  setMessage,
  onSend,
  label,
  students,
  isBroadcast = false,
  selectedStudent,
  setSelectedStudent,
}: EmailFormProps) {
  return (
    <div className="space-y-6">
      {!isBroadcast && (
        <div className="space-y-2">
          <Label>Select Student</Label>
          <Select
            onValueChange={(value) => {
              const student = students.find((s) => s.id.toString() === value);
              setSelectedStudent?.(student || null);
            }}
            value={selectedStudent?.id.toString() ?? ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.firstName || ""} {s.lastName || ""} ({s.studentNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject line"
        />
      </div>

      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder={
            isBroadcast ? "Message to all students..." : "Personal message..."
          }
        />
      </div>

      <Button
        onClick={onSend}
        disabled={
          (!isBroadcast && !selectedStudent) ||
          !subject.trim() ||
          !message.trim()
        }
        className="bg-red-600 hover:bg-red-700"
      >
        <Send className="mr-2 h-4 w-4" /> {label}
      </Button>
    </div>
  );
}
