import { CreatePostChat } from "@/components/create/CreatePostChat";
import { CreatePostSkeleton } from "@/components/create/CreatePostSkeleton";
import { Suspense } from "react";

export default function CreatePage() {
  return (
    <Suspense fallback={<CreatePostSkeleton />}>
      <CreatePostChat />
    </Suspense>
  );
}
