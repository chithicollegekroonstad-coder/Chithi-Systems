// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking current user status
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (currentUser?.status === "frozen") {
      toast.error(
        "Your account is frozen. Please re-register or contact admin.",
      );
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentNumber, password }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Login Successful");
        
        if (stayLoggedIn) {
          localStorage.setItem("stayLoggedIn", "true");
        }
        
        router.push("/attendance");
      } else {
        const error = await response.json();
        toast.error("Login Failed", {
          description: error.error || "Invalid credentials",
        });
      }
    } catch (err) {
      toast.error("Login Failed", {
        description: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50 p-6">
      <Card className="w-full max-w-md shadow-2xl border-red-100">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-red-700">
            Login
          </CardTitle>
          <CardDescription>
            Enter your student number and password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentNumber">Student Number (CFC-XXXXXX)</Label>
              <Input
                id="studentNumber"
                placeholder="CFC-123456"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stay"
                checked={stayLoggedIn}
                onCheckedChange={(checked) => {
                  setStayLoggedIn(checked === true);
                }}
              />
              <Label htmlFor="stay" className="text-sm cursor-pointer">
                Stay logged in
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              If your account is frozen, please{" "}
              <Link href="/" className="text-red-600 hover:underline">
                re-register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
