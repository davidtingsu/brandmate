import { CreatePostChat } from "@/components/create/CreatePostChat";
import { Suspense } from "react";

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading…
        </main>
      }
    >
      <CreatePostChat />
    </Suspense>
  );
}
