import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function StealthModeBanner() {
  return (
    <div className="mb-6 rounded-2xl border border-red-200/90 bg-gradient-to-r from-red-950/90 to-neutral-900 p-4 text-white shadow-lg shadow-red-950/20 ring-1 ring-red-900/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          <Eye className="mt-0.5 h-6 w-6 shrink-0 text-red-400" aria-hidden />
          <div>
            <h3 className="font-semibold text-red-100">
              Super admin stealth mode
            </h3>
            <p className="text-sm text-neutral-300">
              You are viewing as super admin. Regular admins cannot see you are
              here.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.location.href = "/super-admin";
          }}
          className="shrink-0 rounded-xl border-red-400/60 bg-transparent text-red-100 hover:bg-red-950/50 hover:text-white"
        >
          Exit stealth mode
        </Button>
      </div>
    </div>
  );
}
