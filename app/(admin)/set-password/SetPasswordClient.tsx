"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Fingerprint,
  ArrowRight,
} from "lucide-react";
import * as faceapi from "face-api.js";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";

type Step = "password" | "face" | "fingerprint";

export default function SetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [fingerprintSetup, setFingerprintSetup] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const identifierMode = useMemo<"email" | "studentNumber" | "either">(() => {
    if (email.trim()) return "email";
    if (studentNumber.trim()) return "studentNumber";
    return "either";
  }, [email, studentNumber]);

  useEffect(() => {
    const initialEmail = searchParams.get("email");
    const initialStudentNumber = searchParams.get("studentNumber");
    if (initialEmail) setEmail(initialEmail);
    if (initialStudentNumber)
      setStudentNumber(initialStudentNumber.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error(err);
        setModelsLoaded(false);
      }
    };
    loadModels();
  }, []);

  const checkPasswordStrength = (pwd: string): "weak" | "medium" | "strong" => {
    if (pwd.length < 8) return "weak";
    if (
      pwd.length >= 12 &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    ) {
      return "strong";
    }
    return "medium";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!email.trim() && !studentNumber.trim()) {
      toast.error("Please enter your email or student number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() ? email.trim().toLowerCase() : undefined,
          studentNumber: studentNumber.trim()
            ? studentNumber.trim().toUpperCase()
            : undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to set password");
      }

      toast.success("Password set successfully!", {
        description: "Now let's set up your biometrics for quick login.",
      });

      // If they only provided student number, try to populate email from API response for biometrics steps
      if (!email.trim() && typeof data.email === "string") {
        setEmail(data.email);
      }

      setStep("face");
    } catch (err: any) {
      toast.error("Failed to set password", {
        description: err.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      toast.error("Camera permission denied or unavailable");
    }
  };

  const handleSetupFace = async () => {
    if (!modelsLoaded) {
      toast.error("Face models not loaded yet. Please try again.");
      return;
    }
    if (!email.trim()) {
      toast.error("Face setup currently requires email. Please enter email.");
      return;
    }
    if (!videoRef.current) {
      toast.error("Camera not ready");
      return;
    }

    setLoading(true);
    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions(),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error("No face detected. Please center your face and try again.");
        return;
      }

      const faceDescriptor = Array.from(detection.descriptor);

      const res = await fetch("/api/setup-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          faceDescriptor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to setup face");

      setFaceCaptured(true);
      toast.success("Face captured successfully!", {
        description: "You can now use face verification for attendance.",
      });
      setStep("fingerprint");
      stopCamera();
    } catch (err: any) {
      toast.error("Face setup failed", {
        description: err?.message || "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupFingerprint = async () => {
    if (!email.trim()) {
      toast.error("Passkey setup currently requires email. Please enter email.");
      return;
    }
    if (!browserSupportsWebAuthn()) {
      toast.error("Passkeys are not supported on this device/browser.");
      return;
    }

    setLoading(true);
    try {
      const optionsRes = await fetch("/api/webauthn/registration-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const optionsData = await optionsRes.json();
      if (!optionsRes.ok) {
        throw new Error(optionsData.error || "Failed to start passkey setup");
      }

      const attResp = await startRegistration(optionsData.options);

      const verifyRes = await fetch("/api/setup-fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          credential: attResp,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Failed to verify passkey");
      }

      setFingerprintSetup(true);
      toast.success("Passkey setup complete!", {
        description: "Your account is now fully activated.",
      });

      router.push("/login/student");
      router.refresh();
    } catch (err: any) {
      toast.error("Passkey setup failed", {
        description: err?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "password":
        return (
          <form onSubmit={handleSetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email (recommended)</Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentNumber">Student Number</Label>
              <Input
                id="studentNumber"
                placeholder="CFC-123456"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value.toUpperCase())}
                disabled={loading}
              />
              <p className="text-xs text-neutral-500">
                Use this if you don&apos;t have email access or you registered
                with a different email.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                minLength={8}
                disabled={loading}
              />
              {password && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  {passwordStrength === "strong" && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">Strong password</span>
                    </>
                  )}
                  {passwordStrength === "medium" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-800">Medium strength</span>
                    </>
                  )}
                  {passwordStrength === "weak" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700">
                        Weak — use 8+ characters
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 font-semibold shadow-md shadow-red-600/20 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting password...
                </>
              ) : (
                <>
                  Continue to Biometrics Setup{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            {identifierMode === "studentNumber" && !email.trim() && (
              <p className="text-xs text-neutral-500 text-center">
                Tip: add your email to enable biometrics setup here.
              </p>
            )}
          </form>
        );

      case "face":
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="h-10 w-10 text-blue-600" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Setup face recognition
              </h3>
              <p className="mt-2 text-neutral-600">
                Position your face in the center of the camera and press
                capture.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-red-200 bg-black/90">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-64 w-full object-cover"
              />
            </div>

            <Button
              onClick={async () => {
                if (!streamRef.current) await startCamera();
                else await handleSetupFace();
              }}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : streamRef.current ? (
                "Capture My Face"
              ) : (
                "Open Camera"
              )}
            </Button>

            <p className="text-xs text-neutral-500">
              This will allow you to verify attendance using facial recognition
              on supported devices.
            </p>
          </div>
        );

      case "fingerprint":
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Fingerprint className="h-10 w-10 text-green-600" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Setup passkey
              </h3>
              <p className="mt-2 text-neutral-600">
                Use your phone&apos;s fingerprint / Face ID to secure your
                account.
              </p>
            </div>

            <Button
              onClick={handleSetupFingerprint}
              disabled={loading}
              className="w-full rounded-xl bg-red-600 font-semibold shadow-md shadow-red-600/20 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up passkey...
                </>
              ) : (
                "Register Passkey"
              )}
            </Button>

            <p className="text-xs text-neutral-500">
              You can skip this step and set it up later from your profile.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
      <Card className="w-full max-w-md rounded-2xl border border-red-100/90 bg-white/85 shadow-lg shadow-red-950/5 ring-1 ring-red-50/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
            Account activation
          </CardTitle>
          <p className="text-sm text-neutral-600">
            Step {step === "password" ? "1" : step === "face" ? "2" : "3"} of 3
          </p>
        </CardHeader>

        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  );
}

