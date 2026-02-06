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
  XCircle,
  Camera,
  Loader2,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function AttendancePage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  useEffect(() => {
    // Initialize QR scanner
    if (scanning && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false,
      );

      html5QrcodeScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanner
    if (scanner) {
      scanner.clear();
      setScanner(null);
      setScanning(false);
    }

    // Mark attendance
    try {
      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeValue: decodedText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark attendance");
      }

      toast.success("Attendance Marked!", {
        description: `${data.attendance.class} - ${data.attendance.module}`,
      });

      // Add to history
      setAttendanceHistory((prev) => [data.attendance, ...prev]);
    } catch (err: any) {
      toast.error("Failed to mark attendance", {
        description: err.message,
      });
    }
  };

  const onScanError = (error: any) => {
    // Silent - scanning errors are normal
  };

  const startScanning = () => {
    setScanning(true);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-red-700">
              Attendance Scanner
            </h1>
            <p className="text-gray-600 mt-2">
              Scan QR codes to mark your class attendance
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

        {/* Scanner Card */}
        <Card className="mb-8 shadow-2xl border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-red-600" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Position the QR code within the camera frame
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!scanning ? (
              <div className="text-center py-12">
                <Camera className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <Button
                  onClick={startScanning}
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
                  onClick={stopScanning}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Stop Scanning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance History */}
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
                <p className="text-sm mt-2">
                  Scan a QR code to mark your attendance
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceHistory.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {record.class}
                        </p>
                        <p className="text-sm text-gray-600">{record.module}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {record.time}
                      </p>
                      <p className="text-xs text-gray-500">{record.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-gradient-to-r from-red-50 to-white border-red-200">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click "Start Scanner" to activate your camera</li>
              <li>Point your camera at the QR code displayed in class</li>
              <li>Wait for the automatic scan (usually takes 1-2 seconds)</li>
              <li>Your attendance will be marked automatically</li>
              <li>You can only mark attendance once per class per day</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
