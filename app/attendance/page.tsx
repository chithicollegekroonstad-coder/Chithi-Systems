// app/attendance/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  QrCode,
  CheckCircle,
  Camera,
  Loader2,
  LogOut,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function AttendancePage() {
  const router = useRouter();

  const [userRole, setUserRole] = useState<"STUDENT" | "STAFF" | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Student state
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  // Staff state
  const [clockStatus, setClockStatus] = useState<"in" | "out" | "unknown">("unknown");
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);

  // Fetch user role/session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (data.user) {
          setUserRole(data.user.role);
        } else {
          toast.error("Session expired");
          router.push("/login");
        }
      } catch (err) {
        toast.error("Failed to load session");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [router]);

  // Student QR scanner
  useEffect(() => {
    if (userRole === "STUDENT" && scanning && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) scanner.clear();
    };
  }, [scanning, userRole, scanner]);

  const onScanSuccess = async (decodedText: string) => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
      setScanning(false);
    }

    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeValue: decodedText }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      toast.success("Attendance marked!", {
        description: `${data.className || data.module} - ${data.time}`,
      });

      setAttendanceHistory((prev) => [data, ...prev]);
    } catch (err: any) {
      toast.error("Failed to mark attendance", { description: err.message });
    }
  };

  const onScanError = () => {};

  // Staff clock in/out with separate loading states
  const handleClock = async (type: "in" | "out") => {
    const setLoading = type === "in" ? setClockInLoading : setClockOutLoading;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const endpoint = type === "in" ? "/api/staff/clock-in" : "/api/staff/clock-out";
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await res.json();

          if (res.ok) {
            setClockStatus(type === "in" ? "in" : "out");
            toast.success(data.message);
          } else {
            toast.error(data.error || "Failed");
          }
        } catch (err) {
          toast.error("Network error");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setLoading(false);
      }
    );
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-red-700">
              {userRole === "STAFF" ? "Staff Clock In/Out" : "Attendance Scanner"}
            </h1>
            <p className="text-gray-600 mt-2">
              {userRole === "STAFF"
                ? "Clock in/out at your office (200–300 m radius)"
                : "Scan QR codes to mark class attendance"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {userRole === "STUDENT" ? (
          // ── Student UI (your original) ────────────────────────────────
          <>
            <Card className="mb-8 shadow-2xl border-red-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-6 w-6 text-red-600" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription>Position the QR code in the camera frame</CardDescription>
              </CardHeader>
              <CardContent>
                {!scanning ? (
                  <div className="text-center py-12">
                    <Camera className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <Button
                      onClick={() => setScanning(true)}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Start Scanner
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div id="qr-reader" className="rounded-lg overflow-hidden" />
                    <Button
                      onClick={() => setScanning(false)}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      Stop Scanning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-red-100">
              <CardHeader>
                <CardTitle>Today's Attendance</CardTitle>
                <CardDescription>Classes you've attended today</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                    <p>No attendance marked yet today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendanceHistory.map((record, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-semibold">{record.className || "Class"}</p>
                            <p className="text-sm text-gray-600">{record.module}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{record.time}</p>
                          <p className="text-xs text-gray-500">{record.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : userRole === "STAFF" ? (
          // ── Staff UI (clock in/out) ────────────────────────────────
          <Card className="shadow-2xl border-red-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-6 w-6 text-red-600" />
                Staff Clock In / Out
              </CardTitle>
              <CardDescription>
                Ensure you're at an office. Location is checked for security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-6">
                <p className="text-lg font-medium">
                  Current status:{" "}
                  <span
                    className={
                      clockStatus === "in"
                        ? "text-green-600"
                        : clockStatus === "out"
                        ? "text-orange-600"
                        : "text-gray-500"
                    }
                  >
                    {clockStatus === "in"
                      ? "Clocked In"
                      : clockStatus === "out"
                      ? "Clocked Out"
                      : "Not clocked today"}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleClock("in")}
                  disabled={clockInLoading || clockStatus === "in"}
                >
                  {clockInLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-5 w-5" />
                  )}
                  Clock In
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => handleClock("out")}
                  disabled={clockOutLoading || clockStatus !== "in"}
                >
                  {clockOutLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-5 w-5" />
                  )}
                  Clock Out
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500">
                Location permission required. You must be at a Chithi Holdings office.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-red-600">
              Unauthorized access. Please log in with the correct role.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}