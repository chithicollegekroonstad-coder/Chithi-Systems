// app/admin/dashboard/components/StudentTableActive.tsx
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

interface StudentTableActiveProps {
  students: Student[];
  selectedStudents: string[];
  setSelectedStudents: React.Dispatch<React.SetStateAction<string[]>>;
  onFreeze: (id: string) => void;
}

export function StudentTableActive({
  students,
  selectedStudents,
  setSelectedStudents,
  onFreeze,
}: StudentTableActiveProps) {
  const activeStudents = students.filter((s) => s.status === "active");

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Active Students</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={selectedStudents.length === activeStudents.length && activeStudents.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStudents(activeStudents.map((s) => s.id.toString()));
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
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeStudents.map((student) => (
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
                <Badge variant="default">Active</Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFreeze(student.id.toString())}
                >
                  Freeze Access
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {activeStudents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                No active students
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
