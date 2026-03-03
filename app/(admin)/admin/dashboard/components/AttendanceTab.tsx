// app/admin/dashboard/components/AttendanceTab.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";


import { TabsContent } from "@/components/ui/tabs";
import { AttendanceRecord, Class } from "../types";

interface AttendanceTabProps {
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  classes: Class[];
}

export function AttendanceTab({
  attendance,
  setAttendance,
  classes,
}: AttendanceTabProps) {
  const [selectedClassForExport, setSelectedClassForExport] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filtered attendance based on date range and class
  const filteredAttendance = attendance
    .filter((record) => {
      if (!startDate && !endDate) return true;

      const recordDate = new Date(record.date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      return recordDate >= start && recordDate <= end;
    })
    .filter(
      (record) =>
        selectedClassForExport === "all" ||
        record.classId === selectedClassForExport,
    );

  // Export to Excel
  const exportToExcel = (period?: string) => {
    if (filteredAttendance.length === 0) {
      toast.error("No attendance records to export");
      return;
    }

    const exportData = filteredAttendance.map((r) => ({
      Class: classes.find((c) => c.id === r.classId)?.name || "All Classes",
      Name: r.name,
      Surname: r.surname,
      Date: r.date,
      Time: r.time,
      "Student Number": r.studentNumber,
      "ID Number": r.idNumber,
      Attended: r.attended ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const filename = period
      ? `${period.charAt(0).toUpperCase() + period.slice(1)}_attendance.xlsx`
      : "custom_attendance.xlsx";

    saveAs(blob, filename);
    toast.success(
      `${period ? period.charAt(0).toUpperCase() + period.slice(1) : "Custom"} register exported`,
    );
  };

  return (
    <TabsContent value="attendance">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Registers & Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <Label>Select Class</Label>
              <Select
                value={selectedClassForExport}
                onValueChange={setSelectedClassForExport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes (N4-N6)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes (N4-N6)</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.module} - {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => exportToExcel("daily")}
              disabled={!filteredAttendance.length}
            >
              <Download className="mr-2 h-4 w-4" /> Daily Register
            </Button>

            <Button
              variant="outline"
              onClick={() => exportToExcel("weekly")}
              disabled={!filteredAttendance.length}
            >
              <Download className="mr-2 h-4 w-4" /> Weekly Register
            </Button>

            <Button
              variant="outline"
              onClick={() => exportToExcel("monthly")}
              disabled={!filteredAttendance.length}
            >
              <Download className="mr-2 h-4 w-4" /> Monthly Register
            </Button>

            <Button
              variant="outline"
              onClick={() => exportToExcel("trimester")}
              disabled={!filteredAttendance.length}
            >
              <Download className="mr-2 h-4 w-4" /> Trimester Register
            </Button>

            <Button
              variant="outline"
              onClick={() => exportToExcel("semester")}
              disabled={!filteredAttendance.length}
            >
              <Download className="mr-2 h-4 w-4" /> Semester Register
            </Button>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Surname</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Student Number</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Attended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {classes.find((c) => c.id === record.classId)?.name ||
                        "All Classes"}
                    </TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.surname}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>{record.studentNumber}</TableCell>
                    <TableCell>{record.idNumber}</TableCell>
                    <TableCell>{record.attended ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}

                {filteredAttendance.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500 py-10"
                    >
                      No attendance records yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
