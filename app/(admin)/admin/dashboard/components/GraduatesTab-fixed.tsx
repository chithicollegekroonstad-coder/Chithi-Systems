// app/admin/dashboard/components/GraduatesTab.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BulkActions } from "./BulkActions";
import { StudentTableActive } from "./StudentTableActive";
import { StudentTableFrozen } from "./StudentTableFrozen";
import { toast } from "sonner";
import { TabsContent } from "@/components/ui/tabs";
import { Student } from "../types";

interface GraduatesTabProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export function GraduatesTab({ students, setStudents }: GraduatesTabProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [disabilitiesChecked, setDisabilitiesChecked] = useState(false);

  const freezeStudent = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id.toString() === studentId
          ? { ...s, status: "frozen", frozenAt: new Date().toISOString() }
          : s,
      ),
    );
    toast.success("Student frozen — access denied until re-registration");
  };

  const unfreezeStudent = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id.toString() === studentId
          ? {
              ...s,
              status: "active",
              frozenAt: undefined,
              graduatedAt: undefined,
            }
          : s,
      ),
    );
    toast.success("Student unfrozen and reactivated");
  };

  const bulkFreeze = () => {
    setStudents((prev) =>
      prev.map((s) =>
        selectedStudents.includes(s.id.toString())
          ? { ...s, status: "frozen", frozenAt: new Date().toISOString() }
          : s,
      ),
    );
    setSelectedStudents([]);
    toast.success("Selected students frozen");
  };

  const bulkUnfreeze = () => {
    setStudents((prev) =>
      prev.map((s) =>
        selectedStudents.includes(s.id.toString())
          ? { ...s, status: "active", frozenAt: undefined }
          : s,
      ),
    );
    setSelectedStudents([]);
    toast.success("Selected students unfrozen");
  };

  return (
    <TabsContent value="graduates">
      <Card>
        <CardHeader>
          <CardTitle>Graduates & Access Control</CardTitle>
          <CardDescription>
            Freeze/archive graduate profiles — they lose app access until
            re-registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-12">
          {/* Bulk actions */}
          <BulkActions
            selectedCount={selectedStudents.length}
            onBulkFreeze={bulkFreeze}
            onBulkUnfreeze={bulkUnfreeze}
            hasFrozen={students.some((s) => s.status === "frozen")}
          />

          {/* Active students */}
          <StudentTableActive
            students={students}
            selectedStudents={selectedStudents}
            setSelectedStudents={setSelectedStudents}
            onFreeze={freezeStudent}
          />

          {/* Frozen/Graduated */}
          <StudentTableFrozen
            students={students}
            selectedStudents={selectedStudents}
            setSelectedStudents={setSelectedStudents}
            onUnfreeze={unfreezeStudent}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
