import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

// app/admin/dashboard/components/StealthModeBanner.tsx
export function StealthModeBanner() {
  return (
    <div className="mb-6 bg-black border-2 border-red-600 rounded-lg p-4 text-white shadow-2xl">
      <div className="flex items-center gap-3">
        <Eye className="h-6 w-6 text-red-500 animate-pulse" />
        <div className="flex-1">
          <h3 className="font-bold text-red-500 text-lg">
            🔐 SUPER ADMIN STEALTH MODE
          </h3>
          <p className="text-sm text-gray-300">
            You are viewing as Super Admin. Regular admins cannot see you are
            here. All actions are invisible.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/super-admin")}
          className="border-red-600 text-red-400 hover:bg-red-950 hover:text-red-300"
        >
          Exit Stealth Mode
        </Button>
      </div>
    </div>
  );
}
