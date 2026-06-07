import { OnboardPage } from "@/components/onboard/OnboardPage";
import { Suspense } from "react";

export default function OnboardRoute() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading…
        </main>
      }
    >
      <OnboardPage />
    </Suspense>
  );
}
