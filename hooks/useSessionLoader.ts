"use client";

import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { findBrandProfile } from "@/lib/sessions/approved-post";
import type { ChatMessage, ChatThread } from "@/lib/types";
import { useCallback } from "react";

export function useSessionLoader() {
  const {
    sessionsEnabled,
    loading,
    setThreads,
    setActiveSessionId,
    setCopilotThreadId,
    setSessionsEnabled,
    setLoading,
  } = useChatSessionContext();
  const { setBrandProfile } = useBrandProfile();

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessionsEnabled(Boolean(data.enabled));
      setThreads(data.threads ?? []);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSessionsEnabled, setThreads]);

  const createSession = useCallback(async (): Promise<string | null> => {
    const newCopilotId = crypto.randomUUID();
    setCopilotThreadId(newCopilotId);

    if (!sessionsEnabled) return null;

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled post",
        copilotThreadId: newCopilotId,
      }),
    });
    if (!res.ok) return null;
    const { thread } = (await res.json()) as { thread: ChatThread };
    setActiveSessionId(thread.id);
    await loadSessions();
    return thread.id;
  }, [loadSessions, sessionsEnabled, setActiveSessionId, setCopilotThreadId]);

  const loadSession = useCallback(
    async (sessionId: string): Promise<ChatMessage[]> => {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      if (!res.ok) return [];

      const threadRes = await fetch("/api/sessions");
      if (threadRes.ok) {
        const data = await threadRes.json();
        const thread = (data.threads as ChatThread[] | undefined)?.find(
          (t) => t.id === sessionId
        );
        if (thread) {
          setActiveSessionId(thread.id);
          setCopilotThreadId(thread.copilot_thread_id ?? crypto.randomUUID());
        }
      }

      const { messages } = (await res.json()) as { messages: ChatMessage[] };
      const profile = findBrandProfile(messages);
      if (profile) setBrandProfile(profile);
      return messages;
    },
    [setActiveSessionId, setBrandProfile, setCopilotThreadId]
  );

  return {
    loading,
    sessionsEnabled,
    loadSessions,
    createSession,
    loadSession,
  };
}
