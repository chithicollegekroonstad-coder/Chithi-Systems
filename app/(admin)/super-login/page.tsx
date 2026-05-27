// app/super-login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

export default function SuperLogin() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/super-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }

      toast.success("Access granted");
      router.push("/super-admin");
    } catch (err: any) {
      toast.error(err.message || "Access denied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
      <Card className="w-full max-w-md rounded-2xl border border-red-100/90 bg-white/85 shadow-lg shadow-red-950/5 ring-1 ring-red-50/80 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/10 text-red-600 ring-1 ring-red-600/15">
            <Shield className="h-7 w-7" aria-hidden />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
            Super admin access
          </CardTitle>
          <CardDescription className="text-base text-neutral-600">
            Restricted — authorized personnel only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Secret code</Label>
              <Input
                id="code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 font-semibold shadow-md shadow-red-600/20 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Enter control center"
              )}
            </Button>
          </form>
          <div className="mt-6 rounded-xl border border-amber-200/90 bg-amber-50/80 p-4">
            <p className="text-center text-xs leading-relaxed text-amber-900">
              Unauthorized access attempts may be logged. Use only if you are
              an authorized super administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
