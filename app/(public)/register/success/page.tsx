// app/register/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function RegistrationSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 4500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-red-100/90 bg-white/80 p-10 text-center shadow-lg shadow-red-950/5 ring-1 ring-red-50/80 backdrop-blur-sm sm:p-12">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-2 ring-emerald-100/80">
          <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
        </div>

        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Application submitted successfully
          </h1>
          <p className="text-pretty text-lg text-neutral-600">
            Thank you for registering! Your application is now under review.
          </p>
          <p className="text-sm text-neutral-500">
            Redirecting to the home page in a few seconds…
          </p>
        </div>

        <Button
          onClick={() => router.push("/")}
          className="rounded-xl bg-red-600 px-8 font-semibold shadow-md shadow-red-600/20 hover:bg-red-700"
        >
          Go to home now
        </Button>
      </div>
    </div>
  );
}
