import { PageBackdrop } from "./page-backdrop";

/**
 * Backdrop + stacking context for app surfaces (admin, attendance, etc.).
 * Does not add marketing nav/footer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <PageBackdrop />
      <div className="relative z-0">{children}</div>
    </div>
  );
}
