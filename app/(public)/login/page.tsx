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
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
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

    const result = await signIn("credentials", {
      studentNumber,
      password,
      redirect: false,
    });

    if (result?.ok) {
      toast.success("Login Successful");
      router.push("/attendance");
    } else {
      toast.error("Login Failed", {
        description: result?.error || "Invalid credentials",
      });
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
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stay"
                checked={stayLoggedIn}
                onCheckedChange={setStayLoggedIn}
              />
              <Label htmlFor="stay" className="text-sm cursor-pointer">
                Stay logged in
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Login
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
