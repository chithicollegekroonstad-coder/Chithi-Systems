// app/admin/dashboard/components/StaffAttendanceTab.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, Download } from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { TabsContent } from "@/components/ui/tabs";
import { Staff, StaffAttendanceRecord } from "../types";

const QR_STORAGE_KEY = "staff_permanent_qr_value";

interface StaffAttendanceTabProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

export function StaffAttendanceTab({ staff, setStaff }: StaffAttendanceTabProps) {
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load permanent QR
  useEffect(() => {
    const saved = localStorage.getItem(QR_STORAGE_KEY);
    if (saved) {
      setQrValue(saved);
    } else {
      const initial = `chithi-staff-clockin-permanent-${crypto.randomUUID()}`;
      localStorage.setItem(QR_STORAGE_KEY, initial);
      setQrValue(initial);
    }
  }, []);

  // Load attendance records from localStorage (mock data)
  useEffect(() => {
    const saved = localStorage.getItem("staffAttendance");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {
        setRecords([]);
      }
    }
  }, []);

  // QR PDF export
  const exportQRToPDF = () => {
    if (!qrValue) return toast.error("No QR code available");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.setFontSize(20);
    doc.text("CHITHI FET COLLEGE - Staff Clock-In", 20, 40);
    doc.setFontSize(14);
    doc.text("Permanent Access Code", 20, 55);
    doc.setFontSize(12);
    doc.text("Staff: Scan this QR code to clock in", 20, 75);

    const qrElement = document.getElementById("staff-qr-permanent");
    if (qrElement) {
      const svg = qrElement.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const qrDataUrl = canvas.toDataURL("image/png");

          doc.addImage(qrDataUrl, "PNG", 20, 90, 170, 170);
          doc.save("staff_clockin_permanent.pdf");
          toast.success("QR exported as PDF");
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      }
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (records.length === 0) {
      toast.error("No records to export");
      return;
    }

    const exportData = records.map(r => ({
      Name: r.firstName || "—",
      Surname: r.lastName || "—",
      Date: r.date,
      "Clock In": r.clockInTime || "—",
      "Clock Out": r.clockOutTime || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Attendance");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "staff_attendance.xlsx");
    toast.success("Exported successfully");
  };

  const filteredRecords = records.filter(r => {
    if (!startDate && !endDate) return true;
    const d = new Date(r.date);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    return d >= start && d <= end;
  });

  return (
    <TabsContent value="staff-attendance">
      <Card>
        <CardHeader>
          <CardTitle>Staff Clock-In & Clock-Out</CardTitle>
        </CardHeader>

        <CardContent className="space-y-10">

          {/* Permanent QR Section */}
          <div className="space-y-5 border-b pb-8">
            <h3 className="text-lg font-semibold">Permanent Staff Clock-In QR</h3>
            <div className="flex flex-col sm:flex-row sm:items-start gap-8">
              <div className="flex-shrink-0">
                {qrValue ? (
                  <div id="staff-qr-permanent" className="p-5 bg-white border rounded-xl shadow">
                    <QRCodeSVG
                      value={qrValue}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="Q"
                    />
                  </div>
                ) : (
                  <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-50 border rounded-xl text-gray-400 text-sm">
                    Loading...
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <Button variant="outline" onClick={() => {
                  const newValue = `chithi-staff-clockin-permanent-${crypto.randomUUID()}`;
                  localStorage.setItem(QR_STORAGE_KEY, newValue);
                  setQrValue(newValue);
                  toast.success("QR regenerated");
                }} className="w-fit">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate QR
                </Button>

                {qrValue && (
                  <Button variant="outline" onClick={exportQRToPDF} className="w-fit">
                    <Download className="mr-2 h-4 w-4" />
                    Export QR as PDF
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Permanent QR code for staff clock-in at CHITHI FET COLLEGE.
            </p>
          </div>

          {/* Filters & Export */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Staff Attendance Register</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <Button onClick={exportToExcel} disabled={filteredRecords.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>

          {/* Attendance Table */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Attendance Records</h3>

            {filteredRecords.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No records found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Surname</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours Worked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map(r => {
                      // Calculate hours worked
                      let hoursWorked = "—";
                      if (r.clockInTime && r.clockOutTime) {
                        const [inH, inM] = r.clockInTime.split(":").map(Number);
                        const [outH, outM] = r.clockOutTime.split(":").map(Number);
                        const hours = outH - inH + (outM - inM) / 60;
                        hoursWorked = hours > 0 ? `${hours.toFixed(1)}h` : "—";
                      }

                      return (
                        <TableRow key={r.id}>
                          <TableCell>{r.firstName || "—"}</TableCell>
                          <TableCell>{r.lastName || "—"}</TableCell>
                          <TableCell>{r.date}</TableCell>
                          <TableCell>{r.clockInTime || "—"}</TableCell>
                          <TableCell>{r.clockOutTime || "—"}</TableCell>
                          <TableCell>{hoursWorked}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </TabsContent>
  );
}
