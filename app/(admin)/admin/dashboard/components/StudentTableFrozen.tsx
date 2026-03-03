// app/admin/dashboard/components/StudentTableFrozen.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Student } from "../types";

interface StudentTableFrozenProps {
  students: Student[];
  selectedStudents: string[];
  setSelectedStudents: React.Dispatch<React.SetStateAction<string[]>>;
  onUnfreeze: (id: string) => void;
}

export function StudentTableFrozen({
  students,
  selectedStudents,
  setSelectedStudents,
  onUnfreeze,
}: StudentTableFrozenProps) {
  const frozenStudents = students.filter((s) => s.status === "frozen" || s.status === "graduated");

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Frozen & Graduated Students</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={selectedStudents.length === frozenStudents.length && frozenStudents.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStudents(frozenStudents.map((s) => s.id.toString()));
                  } else {
                    setSelectedStudents([]);
                  }
                }}
              />
            </TableHead>
            <TableHead>Student Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Frozen At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {frozenStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <Checkbox
                  checked={selectedStudents.includes(student.id.toString())}
                  onCheckedChange={(checked) => {
                    setSelectedStudents((prev) =>
                      checked
                        ? [...prev, student.id.toString()]
                        : prev.filter((id) => id !== student.id.toString()),
                    );
                  }}
                />
              </TableCell>
              <TableCell>{student.studentNumber}</TableCell>
              <TableCell>
                {student.firstName || ""} {student.lastName || ""}
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>
                <Badge variant={student.status === "frozen" ? "secondary" : "destructive"}>
                  {student.status}
                </Badge>
              </TableCell>
              <TableCell>
                {student.frozenAt ? new Date(student.frozenAt).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUnfreeze(student.id.toString())}
                >
                  Unfreeze
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {frozenStudents.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No frozen or graduated students
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
