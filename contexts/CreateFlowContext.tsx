"use client";

import {
  inferStudioStage,
  type StudioFlowStage,
} from "@/lib/create-flow/stages";
import { findLatestPostAttempt } from "@/lib/sessions/approved-post";
import type { ChatMessage, PostAttempt } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface CreateFlowContextValue {
  stage: StudioFlowStage;
  setStage: (stage: StudioFlowStage) => void;
  advanceToPreview: () => void;
  lastAttempt: PostAttempt | null;
  lastWeaveTraceId: string | undefined;
  setLastAttempt: (
    attempt: PostAttempt | null,
    weaveTraceId?: string
  ) => void;
  hydrateFromMessages: (messages: ChatMessage[]) => void;
}

const CreateFlowContext = createContext<CreateFlowContextValue | null>(null);

export function CreateFlowProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<StudioFlowStage>("post");
  const [lastAttempt, setLastAttemptState] = useState<PostAttempt | null>(null);
  const [lastWeaveTraceId, setLastWeaveTraceId] = useState<string | undefined>(
    undefined
  );

  const setLastAttempt = useCallback(
    (attempt: PostAttempt | null, weaveTraceId?: string) => {
      setLastAttemptState(attempt);
      setLastWeaveTraceId(weaveTraceId);
    },
    []
  );

  const advanceToPreview = useCallback(() => setStage("preview"), []);

  const hydrateFromMessages = useCallback((messages: ChatMessage[]) => {
    const latest = findLatestPostAttempt(messages);
    if (latest) {
      setLastAttemptState(latest.attempt);
      setLastWeaveTraceId(latest.weaveTraceId);
    }
    setStage(
      inferStudioStage({
        hasAttempt: Boolean(latest),
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      stage,
      setStage,
      advanceToPreview,
      lastAttempt,
      lastWeaveTraceId,
      setLastAttempt,
      hydrateFromMessages,
    }),
    [
      stage,
      advanceToPreview,
      lastAttempt,
      lastWeaveTraceId,
      setLastAttempt,
      hydrateFromMessages,
    ]
  );

  return (
    <CreateFlowContext.Provider value={value}>
      {children}
    </CreateFlowContext.Provider>
  );
}

export function useCreateFlow() {
  const ctx = useContext(CreateFlowContext);
  if (!ctx) {
    throw new Error("useCreateFlow must be used within CreateFlowProvider");
  }
  return ctx;
}
