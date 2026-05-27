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
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border border-red-100/90 bg-white/70 p-1.5 shadow-sm ring-1 ring-red-50/80 backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-6">
        <TabsTrigger
          value="applications"
          className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white"
        >
          Applications
        </TabsTrigger>
        <TabsTrigger
          value="classes"
          className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white"
        >
          Classes & QR
        </TabsTrigger>
        <TabsTrigger
          value="attendance"
          className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white"
        >
          Registers
        </TabsTrigger>
        <TabsTrigger
          value="staff-attendance"
          className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white"
        >
          Staff attendance
        </TabsTrigger>
        <TabsTrigger
          value="email"
          className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white"
        >
          Email
        </TabsTrigger>
        <TabsTrigger
          value="graduates"
          className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white"
        >
          Graduates
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
}