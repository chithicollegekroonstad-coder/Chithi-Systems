"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

export function MarketingNav() {
  const [applicationPending, setApplicationPending] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem("applicationPending") === "true";
    setApplicationPending(pending);
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setIsFrozen(currentUser?.status === "frozen");
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-red-100/80 bg-white/75 backdrop-blur-md supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo.png"
            alt="Chithi FET College Logo"
            width={190}
            height={75}
            priority
            className="h-14 w-auto object-contain sm:h-[4.75rem]"
          />
        </Link>

        {isFrozen ? (
          <Button
            asChild
            size="lg"
            className="rounded-xl bg-red-600 px-7 font-semibold shadow-md shadow-red-600/20 transition-[transform,box-shadow] hover:scale-[1.02] hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 active:scale-[0.98]"
          >
            <Link href="/register" className="inline-flex items-center gap-2">
              Re-register
              <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
            </Link>
          </Button>
        ) : applicationPending ? (
          <div
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/95 to-white px-4 py-2.5 text-sm font-semibold text-amber-900 shadow-sm ring-1 ring-amber-100/80 sm:px-5 sm:py-3"
          >
            <Clock className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <span className="hidden sm:inline">Application pending</span>
            <span className="sm:hidden">Pending</span>
          </div>
        ) : (
          <Button
            asChild
            size="lg"
            className="rounded-xl bg-red-600 px-7 font-semibold shadow-md shadow-red-600/20 transition-[transform,box-shadow] hover:scale-[1.02] hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 active:scale-[0.98]"
          >
            <Link href="/register" className="inline-flex items-center gap-2">
              Apply Now
              <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
