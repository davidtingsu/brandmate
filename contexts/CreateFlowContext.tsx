"use client";

import {
  inferStudioStage,
  type StudioFlowStage,
} from "@/lib/create-flow/stages";
import {
  findAllPostAttempts,
  type PostAttemptRecord,
} from "@/lib/sessions/approved-post";
import type { ChatMessage, PostAttempt } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface CreateFlowContextValue {
  stage: StudioFlowStage;
  setStage: (stage: StudioFlowStage) => void;
  advanceToPreview: () => void;
  lastAttempt: PostAttempt | null;
  lastWeaveTraceId: string | undefined;
  attemptHistory: PostAttemptRecord[];
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
  const [attemptHistory, setAttemptHistory] = useState<PostAttemptRecord[]>([]);
  const lastAttemptRef = useRef<PostAttempt | null>(null);
  const lastWeaveTraceIdRef = useRef<string | undefined>(undefined);

  const setLastAttempt = useCallback(
    (attempt: PostAttempt | null, weaveTraceId?: string) => {
      const previous = lastAttemptRef.current;
      if (
        attempt &&
        previous &&
        attempt.attemptNumber > previous.attemptNumber
      ) {
        setAttemptHistory((history) => {
          if (
            history.some(
              (record) => record.attempt.attemptNumber === previous.attemptNumber
            )
          ) {
            return history;
          }
          return [
            ...history,
            {
              attempt: previous,
              weaveTraceId:
                lastWeaveTraceIdRef.current ?? previous.weaveTraceId,
            },
          ];
        });
      }
      lastAttemptRef.current = attempt;
      lastWeaveTraceIdRef.current = weaveTraceId;
      setLastAttemptState(attempt);
      setLastWeaveTraceId(weaveTraceId);
    },
    []
  );

  const advanceToPreview = useCallback(() => setStage("preview"), []);

  const hydrateFromMessages = useCallback((messages: ChatMessage[]) => {
    const all = findAllPostAttempts(messages);
    const latest = all.at(-1) ?? null;
    if (latest) {
      lastAttemptRef.current = latest.attempt;
      lastWeaveTraceIdRef.current = latest.weaveTraceId;
      setLastAttemptState(latest.attempt);
      setLastWeaveTraceId(latest.weaveTraceId);
      setAttemptHistory(all.slice(0, -1));
    } else {
      lastAttemptRef.current = null;
      lastWeaveTraceIdRef.current = undefined;
      setLastAttemptState(null);
      setLastWeaveTraceId(undefined);
      setAttemptHistory([]);
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
      attemptHistory,
      setLastAttempt,
      hydrateFromMessages,
    }),
    [
      stage,
      advanceToPreview,
      lastAttempt,
      lastWeaveTraceId,
      attemptHistory,
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
