"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Users } from "lucide-react";

export default function ChooseAccount() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Choose account type
          </h1>
          <p className="text-pretty text-lg text-neutral-600">
            Select whether you are a student or staff member
          </p>
        </div>

        <div className="grid gap-4 pt-4 sm:grid-cols-2 sm:gap-6">
          <Button
            asChild
            size="lg"
            className="h-auto min-h-[4.5rem] rounded-2xl border-2 border-red-100/90 bg-white/80 py-6 text-base font-semibold text-red-700 shadow-sm ring-1 ring-red-50/80 backdrop-blur-sm transition-[transform,box-shadow] hover:scale-[1.02] hover:border-red-200 hover:bg-red-50/80 hover:text-red-800 hover:shadow-md"
          >
            <Link
              href="/login/student"
              className="flex flex-col items-center justify-center gap-2"
            >
              <GraduationCap className="h-8 w-8 text-red-600" aria-hidden />
              <span>Student</span>
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-auto min-h-[4.5rem] rounded-2xl bg-red-600 py-6 text-base font-semibold shadow-md shadow-red-600/25 transition-[transform,box-shadow] hover:scale-[1.02] hover:bg-red-700 hover:shadow-lg sm:shadow-red-600/20"
          >
            <Link
              href="/login/staff"
              className="flex flex-col items-center justify-center gap-2"
            >
              <Users className="h-8 w-8 opacity-95" aria-hidden />
              <span>Staff member</span>
            </Link>
          </Button>
        </div>

        <p className="text-sm text-neutral-500">
          <Link
            href="/"
            className="font-medium text-red-600 underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
