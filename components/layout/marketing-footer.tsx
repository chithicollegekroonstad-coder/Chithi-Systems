import Link from "next/link";
import { Lock } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-red-100/80 bg-white/90 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm text-neutral-600">
            © {new Date().getFullYear()} Chithi FET College. All rights reserved.
          </p>
          <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-red-100/90 bg-white/70 px-5 py-4 shadow-sm ring-1 ring-red-50/80 sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs text-neutral-500">
              Built by{" "}
              <a
                href="https://www.gs-bootcamp.org/FeaturedServices"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-600 underline-offset-4 transition-colors hover:text-green-700 hover:underline"
              >
                GS Bootcamp
              </a>
            </p>
            <Link
              href="/admin/login"
              className="group inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white/90 px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:border-red-200 hover:text-red-700"
            >
              <Lock className="h-3.5 w-3.5 text-red-500 transition-colors group-hover:text-red-600" />
              Admin sign-in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
