// app/super-admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/super-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Access denied");
      }

      toast.success("Super Admin access granted", {
        description: "Welcome to the control center",
      });

      router.push("/super-admin");
      router.refresh();
    } catch (err: any) {
      toast.error("Access denied", {
        description: err.message || "Invalid secret code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-red-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-red-800 text-white shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-600">
            Super Admin Access
          </CardTitle>
          <CardDescription className="text-gray-400 mt-2">
            Restricted access — Authorized personnel only
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-300">
                Secret Code
              </Label>
              <Input
                id="code"
                type="password"
                placeholder="Enter your secret code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Access Control Center
                </>
              )}
            </Button>
          </form>

          {/* Warning banner */}
          <div className="mt-8 p-4 bg-yellow-950/40 border border-yellow-800/60 rounded-lg">
            <p className="text-xs text-yellow-400 text-center leading-relaxed">
              ⚠️ This area is strictly monitored. Unauthorized access attempts
              are logged and may result in permanent exclusion.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
