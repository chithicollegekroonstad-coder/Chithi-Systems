// app/admin/dashboard/page.tsx
"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "./components/DashboardHeader";
import { StealthModeBanner } from "./components/StealthModeBanner";
import { TabsNavigation } from "./components/TabsNavigation";
import { ApplicationsTab } from "./components/ApplicationsTab";
import { ClassesTab } from "./components/ClassesTab";
import { AttendanceTab } from "./components/AttendanceTab";
import { EmailTab } from "./components/EmailTab";
import { GraduatesTab } from "./components/GraduatesTab";
import StaffManagement from "./components/StaffManagement";
import { StaffAttendanceTab } from "./components/StaffAttendanceTab";
import {
  Application,
  Class,
  AttendanceRecord,
  Student,
  Staff,
} from "./types";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const isStealthMode = searchParams.get("stealth") === "true";

  const [applications, setApplications] = useState<Application[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

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

    const savedStaff = localStorage.getItem("staff");
    if (savedStaff) setStaff(JSON.parse(savedStaff));
  }, []);

  // Save to localStorage
  useEffect(
    () => localStorage.setItem("applications", JSON.stringify(applications)),
    [applications],
  );
  useEffect(
    () => localStorage.setItem("classes", JSON.stringify(classes)),
    [classes],
  );
  useEffect(
    () => localStorage.setItem("attendance", JSON.stringify(attendance)),
    [attendance],
  );
  useEffect(
    () => localStorage.setItem("students", JSON.stringify(students)),
    [students],
  );
  useEffect(
    () => localStorage.setItem("staff", JSON.stringify(staff)),
    [staff],
  );

  // Sync approved students
  useEffect(() => {
    const approved = applications
      .filter((app) => app.status === "approved")
      .map((app) => ({
        id: app.id,
        studentNumber: app.studentNumber,
        email: app.email,
        firstName: app.name,
        lastName: app.surname,
        role: "STUDENT",
        isLocked: false,
        status: "active" as const,
      }));

    setStudents((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const newApproved = approved.filter((a) => !existingIds.has(a.id));
      return [...prev, ...newApproved];
    });
  }, [applications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {isStealthMode && <StealthModeBanner />}
        <DashboardHeader />

        <TabsNavigation defaultValue="applications">
          <ApplicationsTab
            applications={applications}
            setApplications={setApplications}
          />
          <ClassesTab classes={classes} setClasses={setClasses} />
          <AttendanceTab
            attendance={attendance}
            setAttendance={setAttendance}
            classes={classes}
          />
          <EmailTab students={students} />
          <GraduatesTab students={students} setStudents={setStudents} />
          <StaffAttendanceTab
            staff={staff}
            setStaff={setStaff}
          />
          <StaffManagement />
        </TabsNavigation>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
