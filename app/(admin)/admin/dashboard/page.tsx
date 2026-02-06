// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  X,
  Plus,
  Trash2,
  Mail,
  Calendar,
  Download,
  Send,
  Archive,
  Unlock,
  Users,
  Eye,
  AlertTriangle,
} from "lucide-react";

// Types
type Application = {
  id: string;
  studentNumber: string;
  name: string;
  surname: string;
  idNumber: string;
  email: string;
  status: "pending" | "approved" | "declined";
  appliedAt: string;
};

type Class = {
  id: string;
  module: string;
  name: string;
  createdAt: string;
  qrCodeValue: string;
};

type AttendanceRecord = {
  id: string;
  classId: string;
  studentNumber: string;
  name: string;
  surname: string;
  idNumber: string;
  date: string;
  time: string;
  attended: boolean;
};

type Student = {
  id: string;
  studentNumber: string;
  name: string;
  surname: string;
  email: string;
  status: "active" | "frozen" | "graduated" | "pending";
  frozenAt?: string;
  graduatedAt?: string;
};

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const isStealthMode = searchParams.get("stealth") === "true";

  const [applications, setApplications] = useState<Application[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newClassModule, setNewClassModule] = useState("N4");
  const [newClassName, setNewClassName] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [individualEmailStudent, setIndividualEmailStudent] =
    useState<Student | null>(null);
  const [individualSubject, setIndividualSubject] = useState("");
  const [individualMessage, setIndividualMessage] = useState("");
  const [selectedClassForExport, setSelectedClassForExport] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedApps = localStorage.getItem("applications");
    if (savedApps) setApplications(JSON.parse(savedApps));

    const savedClasses = localStorage.getItem("classes");
    if (savedClasses) setClasses(JSON.parse(savedClasses));

    const savedAttendance = localStorage.getItem("attendance");
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

    const savedStudents = localStorage.getItem("students");
    if (savedStudents) setStudents(JSON.parse(savedStudents));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("applications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("classes", JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  // Sync approved students
  useEffect(() => {
    const approved = applications
      .filter((app) => app.status === "approved")
      .map((app) => ({
        id: app.id,
        studentNumber: app.studentNumber,
        name: app.name,
        surname: app.surname,
        email: app.email,
        status: "active" as const,
      }));

    setStudents((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const newApproved = approved.filter((a) => !existingIds.has(a.id));
      return [...prev, ...newApproved];
    });
  }, [applications]);

  // Approve/Decline application
  const handleApplicationAction = (
    id: string,
    action: "approved" | "declined",
  ) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: action } : app)),
    );
    toast.success(`Application ${action}!`);
  };

  // Create class with QR
  const createClass = () => {
    if (!newClassName.trim()) {
      toast.error("Class name required");
      return;
    }

    const qrValue = `cfc-attendance-${Date.now()}-${newClassName.trim()}`;

    const newClass: Class = {
      id: Date.now().toString(),
      module: newClassModule,
      name: newClassName.trim(),
      createdAt: new Date().toISOString(),
      qrCodeValue: qrValue,
    };

    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
    toast.success("Class created with QR code");
  };

  // Delete class
  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setAttendance((prev) => prev.filter((a) => a.classId !== id));
    toast.success("Class deleted");
  };

  // Freeze student
  const freezeStudent = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: "frozen",
              frozenAt: new Date().toISOString(),
            }
          : s,
      ),
    );
    toast.success("Student frozen — access denied until re-registration");
  };

  // ✅ FIXED: Added missing unfreezeStudent function
  const unfreezeStudent = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
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

  // Bulk freeze
  const bulkFreeze = () => {
    setStudents((prev) =>
      prev.map((s) =>
        selectedStudents.includes(s.id)
          ? {
              ...s,
              status: "frozen",
              frozenAt: new Date().toISOString(),
            }
          : s,
      ),
    );
    setSelectedStudents([]);
    toast.success("Selected students frozen");
  };

  // Bulk unfreeze
  const bulkUnfreeze = () => {
    setStudents((prev) =>
      prev.map((s) =>
        selectedStudents.includes(s.id)
          ? {
              ...s,
              status: "active",
              frozenAt: undefined,
            }
          : s,
      ),
    );
    setSelectedStudents([]);
    toast.success("Selected students unfrozen");
  };

  // Export frozen students
  const exportFrozenStudents = () => {
    const frozen = students.filter((s) => s.status === "frozen");

    const data = frozen.map((s) => ({
      "Student Number": s.studentNumber,
      Name: s.name,
      Surname: s.surname,
      Email: s.email,
      "Frozen At": s.frozenAt ? new Date(s.frozenAt).toLocaleString() : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Frozen Students");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "frozen_students.xlsx");
    toast.success("Frozen students list exported");
  };

  // Filtered attendance
  const filteredAttendance = attendance.filter((record) => {
    if (!startDate && !endDate) return true;
    const recordDate = new Date(record.date);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    return recordDate >= start && recordDate <= end;
  });

  // Export to Excel
  const exportToExcel = (classId?: string, period?: string) => {
    let data = filteredAttendance;
    if (classId && classId !== "all")
      data = data.filter((r) => r.classId === classId);

    const exportData = data.map((r) => ({
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
    saveAs(
      blob,
      `${period ? period : "custom"}_attendance${classId && classId !== "all" ? "_" + classId : ""}.xlsx`,
    );
    toast.success(
      `${period ? period.charAt(0).toUpperCase() + period.slice(1) : "Custom"} register exported`,
    );
  };

  // Export QR to PDF (A4)
  const exportQRToPDF = (cls: Class) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(20);
    doc.text(`CFC College - ${cls.module}`, 20, 40);
    doc.setFontSize(16);
    doc.text(cls.name, 20, 55);

    doc.setFontSize(12);
    doc.text("Scan this QR code to mark attendance", 20, 75);

    const qrElement = document.getElementById(`qr-${cls.id}`);
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
          doc.save(`qr_${cls.name.replace(/\s+/g, "_")}.pdf`);
          toast.success("QR exported as PDF");
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    }
  };

  // Broadcast email
  const sendEmailBroadcast = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error("Subject and message required");
      return;
    }
    toast.success("Broadcast sent!", {
      description: "Simulation: Sent to all students",
    });
    setEmailSubject("");
    setEmailMessage("");
  };

  // Individual email
  const sendIndividualEmail = () => {
    if (
      !individualEmailStudent ||
      !individualSubject.trim() ||
      !individualMessage.trim()
    ) {
      toast.error("Select student and fill fields");
      return;
    }
    toast.success(`Email sent to ${individualEmailStudent.email}`, {
      description: "Simulation",
    });
    setIndividualEmailStudent(null);
    setIndividualSubject("");
    setIndividualMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ✅ STEALTH MODE BANNER */}
        {isStealthMode && (
          <div className="mb-6 bg-black border-2 border-red-600 rounded-lg p-4 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-red-500 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-bold text-red-500 text-lg">
                  🔐 SUPER ADMIN STEALTH MODE
                </h3>
                <p className="text-sm text-gray-300">
                  You are viewing as Super Admin. Regular admins cannot see you
                  are here. All actions are invisible.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/super-admin")}
                className="border-red-600 text-red-400 hover:bg-red-950 hover:text-red-300"
              >
                Exit Stealth Mode
              </Button>
            </div>
          </div>
        )}

        <h1 className="text-4xl font-bold text-red-700 mb-8">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="applications" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="classes">Classes & QR</TabsTrigger>
            <TabsTrigger value="attendance">Registers & Export</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="graduates">Graduates & Freeze</TabsTrigger>
          </TabsList>

          {/* Applications */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Surname</TableHead>
                      <TableHead>Student Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.surname}</TableCell>
                        <TableCell>{app.studentNumber}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              app.status === "approved"
                                ? "default"
                                : app.status === "declined"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {app.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleApplicationAction(app.id, "approved")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleApplicationAction(app.id, "declined")
                                }
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes & QR */}
          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>Classes & QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Module</Label>
                      <Select
                        value={newClassModule}
                        onValueChange={setNewClassModule}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N4">N4</SelectItem>
                          <SelectItem value="N5">N5</SelectItem>
                          <SelectItem value="N6">N6</SelectItem>
                          <SelectItem value="Matric Re-write">
                            Matric Re-write
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Class Name</Label>
                      <Input
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="e.g. Mathematics N4 - Group A"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={createClass}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Class (with QR)
                  </Button>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>QR Code</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>{cls.module}</TableCell>
                          <TableCell>{cls.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-2">
                              <div
                                id={`qr-${cls.id}`}
                                className="p-2 bg-white border rounded"
                              >
                                <QRCodeSVG
                                  value={cls.qrCodeValue}
                                  size={128}
                                  bgColor="#ffffff"
                                  fgColor="#000000"
                                  level="Q"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportQRToPDF(cls)}
                              >
                                <Download className="h-4 w-4 mr-1" /> Export PDF
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteClass(cls.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {classes.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-gray-500"
                          >
                            No classes yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registers & Export */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Registers & Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
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

                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToExcel(
                        selectedClassForExport === "all"
                          ? undefined
                          : selectedClassForExport,
                        "daily",
                      )
                    }
                    disabled={!attendance.length}
                  >
                    <Download className="mr-2 h-4 w-4" /> Daily Register
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToExcel(
                        selectedClassForExport === "all"
                          ? undefined
                          : selectedClassForExport,
                        "weekly",
                      )
                    }
                    disabled={!attendance.length}
                  >
                    <Download className="mr-2 h-4 w-4" /> Weekly Register
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToExcel(
                        selectedClassForExport === "all"
                          ? undefined
                          : selectedClassForExport,
                        "monthly",
                      )
                    }
                    disabled={!attendance.length}
                  >
                    <Download className="mr-2 h-4 w-4" /> Monthly Register
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToExcel(
                        selectedClassForExport === "all"
                          ? undefined
                          : selectedClassForExport,
                        "trimester",
                      )
                    }
                    disabled={!attendance.length}
                  >
                    <Download className="mr-2 h-4 w-4" /> Trimester Register
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToExcel(
                        selectedClassForExport === "all"
                          ? undefined
                          : selectedClassForExport,
                        "semester",
                      )
                    }
                    disabled={!attendance.length}
                  >
                    <Download className="mr-2 h-4 w-4" /> Semester Register
                  </Button>
                </div>

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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Students</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="broadcast">
                  <TabsList className="mb-6">
                    <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
                    <TabsTrigger value="individual">Individual</TabsTrigger>
                  </TabsList>

                  <TabsContent value="broadcast">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Subject line"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                          rows={6}
                          placeholder="Message to all students..."
                        />
                      </div>
                      <Button
                        onClick={sendEmailBroadcast}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Send className="mr-2 h-4 w-4" /> Send Broadcast
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="individual">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Select Student</Label>
                        <Select
                          onValueChange={(value) => {
                            const student = students.find(
                              (s) => s.id === value,
                            );
                            setIndividualEmailStudent(student || null);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} {s.surname} ({s.studentNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={individualSubject}
                          onChange={(e) => setIndividualSubject(e.target.value)}
                          placeholder="Subject line"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                          value={individualMessage}
                          onChange={(e) => setIndividualMessage(e.target.value)}
                          rows={6}
                          placeholder="Personal message..."
                        />
                      </div>

                      <Button
                        onClick={sendIndividualEmail}
                        disabled={!individualEmailStudent}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Send className="mr-2 h-4 w-4" /> Send Email
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Graduates & Freeze */}
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={bulkFreeze}
                    disabled={selectedStudents.length === 0}
                  >
                    Bulk Freeze Selected
                  </Button>
                  <Button
                    variant="outline"
                    onClick={bulkUnfreeze}
                    disabled={selectedStudents.length === 0}
                  >
                    Bulk Unfreeze Selected
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportFrozenStudents}
                    disabled={!students.some((s) => s.status === "frozen")}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export Frozen List
                  </Button>
                </div>

                {/* Active students */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Active Students
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Checkbox
                            checked={
                              selectedStudents.length ===
                              students.filter((s) => s.status === "active")
                                .length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStudents(
                                  students
                                    .filter((s) => s.status === "active")
                                    .map((s) => s.id),
                                );
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
                      {students
                        .filter((s) => s.status === "active")
                        .map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedStudents((prev) =>
                                    checked
                                      ? [...prev, student.id]
                                      : prev.filter((id) => id !== student.id),
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell>{student.studentNumber}</TableCell>
                            <TableCell>
                              {student.name} {student.surname}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              <Badge variant="default">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => freezeStudent(student.id)}
                              >
                                Freeze Access
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {students.filter((s) => s.status === "active").length ===
                        0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-gray-500"
                          >
                            No active students
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Frozen/Graduated */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Frozen / Graduated Students
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Checkbox
                            checked={
                              selectedStudents.length ===
                              students.filter(
                                (s) =>
                                  s.status === "frozen" ||
                                  s.status === "graduated",
                              ).length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStudents(
                                  students
                                    .filter(
                                      (s) =>
                                        s.status === "frozen" ||
                                        s.status === "graduated",
                                    )
                                    .map((s) => s.id),
                                );
                              } else {
                                setSelectedStudents([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Student Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Frozen/Graduated At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students
                        .filter(
                          (s) =>
                            s.status === "frozen" || s.status === "graduated",
                        )
                        .map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedStudents((prev) =>
                                    checked
                                      ? [...prev, student.id]
                                      : prev.filter((id) => id !== student.id),
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell>{student.studentNumber}</TableCell>
                            <TableCell>
                              {student.name} {student.surname}
                            </TableCell>
                            <TableCell>
                              {student.frozenAt || student.graduatedAt
                                ? new Date(
                                    student.frozenAt || student.graduatedAt!,
                                  ).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {student.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unfreezeStudent(student.id)}
                              >
                                <Unlock className="h-4 w-4 mr-1" /> Unfreeze /
                                Reactivate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {students.filter(
                        (s) =>
                          s.status === "frozen" || s.status === "graduated",
                      ).length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-gray-500"
                          >
                            No frozen/graduated students yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
