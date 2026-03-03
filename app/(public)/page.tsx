// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, QrCode, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [applicationPending, setApplicationPending] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem("applicationPending") === "true";
    setApplicationPending(pending);

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setIsFrozen(currentUser?.status === "frozen");
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center bg-gradient-to-b from-white via-red-50/50 to-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              CHITHI FET-COLLEGE
            </span>
          </h1>

          <div className="flex flex-col space-y-2 absolute bottom-13 right-7">
            <div className="   w-2 h-7 bg-red-600 rounded-full "></div>
            <div className="  w-2 h-2 bg-red-300 rounded-full "></div>

            <Link
              href="/admin/login"
              className="   w-2 h-3 bg-red-200 rounded-full cursor-default "
            ></Link>
          </div>

          {isFrozen ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold text-orange-800 mb-4">
                Your Account is Frozen
              </h2>
              <p className="text-gray-700 text-lg">
                Your previous registration is complete. To continue, please
                re-register.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 bg-red-600 hover:bg-red-700"
              >
                <a href="/register">Re-register Now</a>
              </Button>
            </div>
          ) : applicationPending ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
                Your Application is Pending
              </h2>
              <p className="text-gray-700 text-lg">
                Thank you for applying! We are reviewing your registration.
              </p>
              <p className="text-gray-700 mt-4">
                If approved, you will receive your student number (CFC-XXXXXX)
                via email.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                <Link href="/register">Apply Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/choose-account">Login</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg text-center">
            <QrCode className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold">QR Attendance</h3>
            <p className="mt-2 text-gray-600">
              Scan in class to mark attendance
            </p>
          </div>
          <div className="p-6 border rounded-lg text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold">Secure Registration</h3>
            <p className="mt-2 text-gray-600">
              OTP verification and pending review
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
