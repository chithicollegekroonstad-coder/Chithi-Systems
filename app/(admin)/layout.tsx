import { AppShell } from "@/components/layout/app-shell";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
