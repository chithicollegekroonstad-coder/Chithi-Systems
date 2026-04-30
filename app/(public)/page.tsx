// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
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
    <>
      <section className="relative flex-1 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 md:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200/90 bg-white/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-red-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-red-500" aria-hidden />
              Admissions & attendance
            </p>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl md:leading-[1.1]">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
                CHITHI FET-COLLEGE
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-neutral-600 sm:text-lg">
              Apply online, track your application, and access classes with a
              streamlined registration and attendance experience.
            </p>

            {isFrozen ? (
              <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-orange-200/90 bg-gradient-to-br from-orange-50/95 to-white p-8 text-left shadow-lg shadow-orange-900/5 ring-1 ring-orange-100/80 sm:p-10">
                <h2 className="text-xl font-semibold text-orange-900 sm:text-2xl">
                  Your account is frozen
                </h2>
                <p className="mt-3 text-neutral-700">
                  Your previous registration is complete. To continue, please
                  re-register.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 w-full rounded-xl bg-red-600 hover:bg-red-700 sm:w-auto"
                >
                  <a href="/register">Re-register now</a>
                </Button>
              </div>
            ) : applicationPending ? (
              <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/95 to-white p-8 text-left shadow-lg shadow-amber-900/5 ring-1 ring-amber-100/80 sm:p-10">
                <h2 className="text-xl font-semibold text-amber-900 sm:text-2xl">
                  Your application is pending
                </h2>
                <p className="mt-3 text-neutral-700">
                  Thank you for applying! We are reviewing your registration.
                </p>
                <p className="mt-4 text-neutral-600">
                  If approved, you will receive your student number (CFC-XXXXXX)
                  via email.
                </p>
              </div>
            ) : (
              <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 min-w-[200px] rounded-xl bg-red-600 px-10 font-semibold shadow-md shadow-red-600/20 transition-[transform,box-shadow] hover:scale-[1.02] hover:bg-red-700 hover:shadow-lg sm:h-14"
                >
                  <Link href="/register" className="inline-flex items-center gap-2">
                    Start application
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-[200px] rounded-xl border-2 border-red-600/90 bg-white/90 text-red-700 shadow-sm backdrop-blur-sm transition-[transform,box-shadow,background-color] hover:scale-[1.02] hover:border-red-700 hover:bg-red-50 hover:text-red-800 sm:h-14"
                >
                  <Link href="/choose-account">Login</Link>
                </Button>
              </div>
            )}
          </div>
      </section>

      <section
        className="border-t border-red-100/80 bg-white/40 px-4 py-16 backdrop-blur-[2px] sm:px-6"
        aria-labelledby="features-heading"
      >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2
                id="features-heading"
                className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
              >
                Built for students & staff
              </h2>
              <p className="mt-3 text-neutral-600">
                Everything you need to register and stay on track.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="group rounded-2xl border border-red-100/90 bg-white/70 p-8 text-center shadow-sm shadow-red-950/5 ring-1 ring-red-50/80 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600/10 text-red-600 ring-1 ring-red-600/15">
                  <QrCode className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  QR attendance
                </h3>
                <p className="mt-2 leading-relaxed text-neutral-600">
                  Scan in class to mark attendance quickly and securely.
                </p>
              </div>
              <div className="group rounded-2xl border border-red-100/90 bg-white/70 p-8 text-center shadow-sm shadow-red-950/5 ring-1 ring-red-50/80 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600/10 text-red-600 ring-1 ring-red-600/15">
                  <ShieldCheck className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Secure registration
                </h3>
                <p className="mt-2 leading-relaxed text-neutral-600">
                  OTP verification and careful review of every application.
                </p>
              </div>
            </div>
          </div>
      </section>
    </>
  );
}
