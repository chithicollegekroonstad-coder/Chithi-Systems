import { PageBackdrop } from "./page-backdrop";
import { MarketingFooter } from "./marketing-footer";
import { MarketingNav } from "./marketing-nav";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <PageBackdrop />
      <MarketingNav />
      <main className="relative z-0 flex w-full flex-1 flex-col">{children}</main>
      <MarketingFooter />
    </div>
  );
}
