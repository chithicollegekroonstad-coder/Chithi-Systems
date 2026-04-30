// app/set-password/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as faceapi from "face-api.js";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Fingerprint,
  ArrowRight,
} from "lucide-react";

type Step = "password" | "face" | "fingerprint";

export default function SetPasswordAndBiometricsPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountRole, setAccountRole] = useState<string>("STUDENT");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [fingerprintSetup, setFingerprintSetup] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");
    if (emailFromUrl && !email) {
      setEmail(emailFromUrl);
    }
  }, [email]);

  useEffect(() => {
    const loadFaceModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Failed to load face models:", error);
        toast.error("Failed to load face recognition models");
      }
    };

    void loadFaceModels();
  }, []);

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraStream(mediaStream);
      setCameraOpen(true);
    } catch {
      toast.error("Unable to access camera");
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraOpen(false);
  };

  const toBase64Url = (input: ArrayBuffer): string => {
    const bytes = new Uint8Array(input);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };

  const credentialToJson = (credential: PublicKeyCredential) => {
    const response = credential.response as AuthenticatorAttestationResponse;
    return {
      id: credential.id,
      rawId: toBase64Url(credential.rawId),
      type: credential.type,
      response: {
        attestationObject: toBase64Url(response.attestationObject),
        clientDataJSON: toBase64Url(response.clientDataJSON),
      },
      clientExtensionResults: credential.getClientExtensionResults(),
    };
  };

  // Password strength checker
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

  // Step 1: Set Password
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
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to set password");
      }

      setAccountRole(data.role || "STUDENT");
      toast.success("Password set successfully!", {
        description: "Now let's set up your biometrics for quick login.",
      });

      // Move to next step
      setStep("face");
    } catch (err: any) {
      toast.error("Failed to set password", {
        description: err.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Face Recognition
  const handleSetupFace = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!modelsLoaded) {
      toast.error("Face models are still loading");
      return;
    }
    if (!videoRef.current || !cameraOpen) {
      toast.error("Open camera first");
      return;
    }

    setLoading(true);

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        throw new Error("No face detected. Please position your face clearly.");
      }

      const res = await fetch("/api/setup-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          faceDescriptor: Array.from(detections.descriptor),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Face setup failed");
      }

      setFaceCaptured(true);
      toast.success("Face captured successfully!", {
        description: "You can now use face recognition to log in.",
      });
      setStep("fingerprint");
      stopCamera();
    } catch (err: any) {
      toast.error("Face setup failed", {
        description: err.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Fingerprint / Passkey via WebAuthn
  const handleSetupFingerprint = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!window.PublicKeyCredential) {
      toast.error("Passkeys are not supported on this device/browser");
      return;
    }

    setLoading(true);

    try {
      const challengeBytes = new Uint8Array(32);
      window.crypto.getRandomValues(challengeBytes);
      const challengeBuffer = challengeBytes.buffer as ArrayBuffer;
      const challenge = toBase64Url(challengeBuffer);

      const userIdBytes = new TextEncoder().encode(email.trim().toLowerCase());
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: challengeBytes,
          rp: {
            name: "Chithi FET College",
            id: window.location.hostname,
          },
          user: {
            id: userIdBytes,
            name: email.trim().toLowerCase(),
            displayName: email.trim().toLowerCase(),
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: {
            userVerification: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Passkey registration was cancelled");
      }

      const res = await fetch("/api/setup-fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          challenge,
          credential: credentialToJson(credential),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register passkey");
      }

      setFingerprintSetup(true);
      toast.success("Fingerprint setup complete!", {
        description: "Your account is now fully activated.",
      });

      const destination =
        accountRole === "STAFF" || accountRole === "ADMIN"
          ? "/login/staff"
          : "/login/student";
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      toast.error("Fingerprint setup failed", {
        description: err.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case "password":
        return (
          <form onSubmit={handleSetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
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

            {!cameraOpen ? (
              <Button
                onClick={startCamera}
                disabled={loading || !modelsLoaded}
                variant="outline"
                className="w-full"
              >
                {!modelsLoaded ? "Loading face models..." : "Open Camera"}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border-2 border-red-200/80 bg-black aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button onClick={stopCamera} disabled={loading} variant="outline" className="w-full">
                  Close Camera
                </Button>
              </div>
            )}

            <Button
              onClick={handleSetupFace}
              disabled={loading || !cameraOpen || !modelsLoaded}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Capturing Face...
                </>
              ) : (
                "Capture My Face"
              )}
            </Button>

            <p className="text-xs text-neutral-500">
              Capture one clear face image in good lighting for best results.
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
                Setup fingerprint
              </h3>
              <p className="mt-2 text-neutral-600">
                Use your phone&apos;s fingerprint scanner to secure your
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
                  Setting up fingerprint...
                </>
              ) : (
                "Register Fingerprint"
              )}
            </Button>

            <p className="text-xs text-neutral-500">
              This registers a passkey using your fingerprint/biometric sensor on
              supported devices.
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

        <CardContent>
          {renderStep()}
          {(faceCaptured || fingerprintSetup) && (
            <p className="mt-4 text-center text-xs text-emerald-700">
              {faceCaptured && "Face setup complete. "}
              {fingerprintSetup && "Passkey setup complete."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
