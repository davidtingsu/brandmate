"use client";

import type { usePostActions } from "@/hooks/usePostActions";
import { createContext, useContext, type ReactNode } from "react";

export type PostActionsValue = ReturnType<typeof usePostActions>;

const PostActionsContext = createContext<PostActionsValue | null>(null);

export function PostActionsProvider({
  value,
  children,
}: {
  value: PostActionsValue;
  children: ReactNode;
}) {
  return (
    <PostActionsContext.Provider value={value}>
      {children}
    </PostActionsContext.Provider>
  );
}

export function usePostActionsContext() {
  const ctx = useContext(PostActionsContext);
  if (!ctx) {
    throw new Error(
      "usePostActionsContext must be used within PostActionsProvider"
    );
  }
  return ctx;
}
