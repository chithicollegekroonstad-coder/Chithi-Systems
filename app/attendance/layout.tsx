import { AppShell } from "@/components/layout/app-shell";

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
