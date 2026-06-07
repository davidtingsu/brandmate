"use client";

import type { GalleryThread } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface ChatSessionContextValue {
  threads: GalleryThread[];
  activeSessionId: string | null;
  copilotThreadId: string;
  sessionsEnabled: boolean;
  loading: boolean;
  loadError: string | null;
  sessionsLoadedOnce: boolean;
  setThreads: Dispatch<SetStateAction<GalleryThread[]>>;
  setActiveSessionId: (id: string | null) => void;
  setCopilotThreadId: (id: string) => void;
  setSessionsEnabled: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setLoadError: (error: string | null) => void;
  setSessionsLoadedOnce: (v: boolean) => void;
  persistAttempt: (
    payload: Record<string, unknown>,
    sessionId?: string
  ) => Promise<{ messageId: string } | undefined>;
}

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

function newCopilotThreadId(): string {
  return crypto.randomUUID();
}

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<GalleryThread[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [copilotThreadId, setCopilotThreadId] = useState(newCopilotThreadId);
  const [sessionsEnabled, setSessionsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sessionsLoadedOnce, setSessionsLoadedOnce] = useState(false);

  const persistAttempt = useCallback(
    async (payload: Record<string, unknown>, sessionIdOverride?: string) => {
      const sessionId = sessionIdOverride ?? activeSessionId;
      if (!sessionId) return undefined;
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: null,
          metadata: { type: "post_attempt", ...payload },
        }),
      });
      if (!res.ok) return undefined;
      const data = (await res.json()) as { message?: { id: string } };
      return data.message?.id
        ? { messageId: data.message.id }
        : undefined;
    },
    [activeSessionId]
  );

  const value = useMemo(
    () => ({
      threads,
      activeSessionId,
      copilotThreadId,
      sessionsEnabled,
      loading,
      loadError,
      sessionsLoadedOnce,
      setThreads,
      setActiveSessionId,
      setCopilotThreadId,
      setSessionsEnabled,
      setLoading,
      setLoadError,
      setSessionsLoadedOnce,
      persistAttempt,
    }),
    [
      threads,
      activeSessionId,
      copilotThreadId,
      sessionsEnabled,
      loading,
      loadError,
      sessionsLoadedOnce,
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
