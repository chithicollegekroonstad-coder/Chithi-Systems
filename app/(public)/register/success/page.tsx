// app/register/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RegistrationSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 4500); // 4.5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50 p-6">
      <div className="text-center max-w-2xl mx-auto space-y-8">
        <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Application Submitted Successfully!
        </h1>

        <p className="text-xl text-gray-600">
          Thank you for registering! Your application is now under review.
        </p>

        <p className="text-lg text-gray-500">
          Redirecting to home page in a few seconds...
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 text-white px-8"
          >
            Go to Home Now
          </Button>
        </div>
      </div>
    </div>
  );
}
