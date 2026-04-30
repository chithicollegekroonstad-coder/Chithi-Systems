// app/attendance/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import * as faceapi from "face-api.js";

export default function StaffAttendancePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userRole, setUserRole] = useState<"STUDENT" | "STAFF" | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Staff flow states
  const [step, setStep] = useState<"idle" | "scanning-qr" | "biometric">(
    "idle",
  );
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanner, setScanner] = useState<any>(null);

  // Load face-api.js models once
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
        toast.success("Face recognition models loaded");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load face recognition models");
      }
    };

    loadModels();
  }, []);

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.user?.role === "STAFF") {
          setUserRole("STAFF");
        } else {
          router.push("/login/staff");
        }
      } catch {
        toast.error("Session error");
        router.push("/login/staff");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [router]);

  // QR Scanner
  const startQrScanner = () => {
    const html5Scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 280, height: 280 } },
      false,
    );

    html5Scanner.render(
      (decodedText: string) => {
        html5Scanner.clear();
        setQrCodeValue(decodedText);
        setStep("biometric");
        toast.success("QR scanned! Now verify your face.");
      },
      () => {},
    );
    setScanner(html5Scanner);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      toast.error("Camera access denied or unavailable");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  // Real Face Capture + Descriptor
  const captureAndVerifyFace = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      toast.error("Models not ready or camera not started");
      return;
    }

    setIsVerifying(true);

    try {
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions(),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast.error("No face detected. Please position your face clearly.");
        setIsVerifying(false);
        return;
      }

      const realDescriptor = Array.from(detections.descriptor); // 128 numbers - real embedding!

      // Send to backend
      const res = await fetch("/api/staff/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeValue,
          biometricType: "face",
          faceDescriptor: realDescriptor,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Verification failed");

      toast.success(data.message || "Successfully clocked in!", {
        description: "Have a great day!",
      });

      // Reset everything
      setStep("idle");
      setQrCodeValue("");
      stopCamera();
    } catch (err: any) {
      toast.error(err.message || "Face verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login/staff");
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Staff{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                clock in
              </span>
            </h1>
            <p className="mt-2 text-neutral-600">
              QR code → face verification → clock in
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="rounded-xl border-red-200 bg-white/80 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <Card className="rounded-2xl border border-red-100/90 bg-white/85 shadow-lg shadow-red-950/5 ring-1 ring-red-50/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Clock In Process</CardTitle>
            <CardDescription>
              Step {step === "idle" ? 1 : step === "scanning-qr" ? 1 : 2} of 2
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {step === "idle" && (
              <div className="text-center py-12">
                <QrCode className="h-24 w-24 mx-auto mb-6 text-red-200" />
                <Button
                  onClick={() => {
                    setStep("scanning-qr");
                    startQrScanner();
                  }}
                  size="lg"
                  className="rounded-xl bg-red-600 font-semibold shadow-md shadow-red-600/20 hover:bg-red-700"
                >
                  Start QR Scanner
                </Button>
              </div>
            )}

            {step === "scanning-qr" && (
              <div>
                <div
                  id="qr-reader"
                  className="rounded-xl overflow-hidden border-2 border-red-200"
                />
                <Button
                  onClick={() => {
                    scanner?.clear();
                    setStep("idle");
                  }}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Cancel
                </Button>
              </div>
            )}

            {step === "biometric" && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium">QR Code Accepted</p>
                  <p className="text-gray-500">
                    Now verify with Face Recognition
                  </p>
                </div>

                {!stream && (
                  <Button onClick={startCamera} className="w-full" size="lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Open Camera for Face Scan
                  </Button>
                )}

                {stream && (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border-2 border-red-300 bg-black aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="flex gap-3">
                      <Button
                        onClick={captureAndVerifyFace}
                        disabled={isVerifying}
                        className="flex-1"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying Face...
                          </>
                        ) : (
                          "Capture Face & Clock In"
                        )}
                      </Button>
                      <Button variant="outline" onClick={stopCamera}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
