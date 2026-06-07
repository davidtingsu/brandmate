import { CreatePostChat } from "@/components/create/CreatePostChat";
import { BrandMateProviders } from "@/components/providers/BrandMateProviders";
import { Suspense } from "react";

export default function CreatePage() {
  return (
    <BrandMateProviders>
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
            Loading…
          </main>
        }
      >
        <CreatePostChat />
      </Suspense>
    </BrandMateProviders>
  );
}
