// app/admin/dashboard/components/TabsNavigation.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsNavigationProps {
  defaultValue: string;
  children: React.ReactNode;
}

export function TabsNavigation({
  defaultValue,
  children,
}: TabsNavigationProps) {
  return (
    <Tabs defaultValue={defaultValue} className="space-y-8">
      <TabsList className="grid w-full grid-cols-6">    {/* ← changed from 5 to 6 */}
        <TabsTrigger value="applications">Applications</TabsTrigger>
        <TabsTrigger value="classes">Classes & QR</TabsTrigger>
        <TabsTrigger value="attendance">Registers & Export</TabsTrigger>
        <TabsTrigger value="staff-attendance">Staff Attendance</TabsTrigger>  {/* ← new */}
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="graduates">Graduates & Freeze</TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
}