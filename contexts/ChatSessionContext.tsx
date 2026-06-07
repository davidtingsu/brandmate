"use client";

import type { ChatThread } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ChatSessionContextValue {
  threads: ChatThread[];
  activeSessionId: string | null;
  copilotThreadId: string;
  sessionsEnabled: boolean;
  loading: boolean;
  setThreads: (threads: ChatThread[]) => void;
  setActiveSessionId: (id: string | null) => void;
  setCopilotThreadId: (id: string) => void;
  setSessionsEnabled: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  persistAttempt: (
    payload: Record<string, unknown>,
    sessionId?: string
  ) => Promise<void>;
}

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

function newCopilotThreadId(): string {
  return crypto.randomUUID();
}

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [copilotThreadId, setCopilotThreadId] = useState(newCopilotThreadId);
  const [sessionsEnabled, setSessionsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const persistAttempt = useCallback(
    async (payload: Record<string, unknown>, sessionIdOverride?: string) => {
      const sessionId = sessionIdOverride ?? activeSessionId;
      if (!sessionId || !sessionsEnabled) return;
      await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: null,
          metadata: { type: "post_attempt", ...payload },
        }),
      });
    },
    [activeSessionId, sessionsEnabled]
  );

  const value = useMemo(
    () => ({
      threads,
      activeSessionId,
      copilotThreadId,
      sessionsEnabled,
      loading,
      setThreads,
      setActiveSessionId,
      setCopilotThreadId,
      setSessionsEnabled,
      setLoading,
      persistAttempt,
    }),
    [
      threads,
      activeSessionId,
      copilotThreadId,
      sessionsEnabled,
      loading,
      persistAttempt,
    ]
  );

  return (
    <ChatSessionContext.Provider value={value}>
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSessionContext(): ChatSessionContextValue {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) {
    throw new Error("useChatSessionContext requires ChatSessionProvider");
  }
  return ctx;
}
