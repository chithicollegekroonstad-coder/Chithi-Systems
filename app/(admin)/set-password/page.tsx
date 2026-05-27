import { Suspense } from "react";
import SetPasswordClient from "./SetPasswordClient";

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-neutral-600">
          Loading…
        </div>
      }
    >
      <SetPasswordClient />
    </Suspense>
  );
}
