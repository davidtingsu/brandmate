"use client";

import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { findBrandProfile } from "@/lib/sessions/approved-post";
import type { ChatMessage, ChatThread } from "@/lib/types";
import { useCallback, useRef } from "react";

export function useSessionLoader() {
  const {
    activeSessionId,
    copilotThreadId,
    sessionsEnabled,
    loading,
    setThreads,
    setActiveSessionId,
    setCopilotThreadId,
    setSessionsEnabled,
    setLoading,
  } = useChatSessionContext();
  const { setBrandProfile } = useBrandProfile();
  const ensureSessionPromiseRef = useRef<Promise<string | null> | null>(null);
  const ensuredSessionIdRef = useRef<string | null>(null);

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

  const postSession = useCallback(
    async (threadId: string): Promise<string | null> => {
      if (!sessionsEnabled) return null;

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled post",
          copilotThreadId: threadId,
        }),
      });
      if (!res.ok) return null;
      const { thread } = (await res.json()) as { thread: ChatThread };
      setActiveSessionId(thread.id);
      ensuredSessionIdRef.current = thread.id;
      await loadSessions();
      return thread.id;
    },
    [loadSessions, sessionsEnabled, setActiveSessionId]
  );

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (activeSessionId) return activeSessionId;
    if (ensuredSessionIdRef.current) return ensuredSessionIdRef.current;
    if (!sessionsEnabled) return null;

    if (ensureSessionPromiseRef.current) {
      return ensureSessionPromiseRef.current;
    }

    const promise = postSession(copilotThreadId);
    ensureSessionPromiseRef.current = promise;
    try {
      const sessionId = await promise;
      if (sessionId) ensuredSessionIdRef.current = sessionId;
      return sessionId;
    } finally {
      ensureSessionPromiseRef.current = null;
    }
  }, [activeSessionId, copilotThreadId, postSession, sessionsEnabled]);

  const createSession = useCallback(async (): Promise<string | null> => {
    const newCopilotId = crypto.randomUUID();
    setCopilotThreadId(newCopilotId);
    return postSession(newCopilotId);
  }, [postSession, setCopilotThreadId]);

  const loadSession = useCallback(
    async (sessionId: string): Promise<ChatMessage[]> => {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      if (!res.ok) return [];

      const threadRes = await fetch("/api/sessions");
      if (threadRes.ok) {
        const data = await threadRes.json();
        setSessionsEnabled(Boolean(data.enabled));
        setThreads(data.threads ?? []);
        const thread = (data.threads as ChatThread[] | undefined)?.find(
          (t) => t.id === sessionId
        );
        if (thread) {
          setActiveSessionId(thread.id);
          ensuredSessionIdRef.current = thread.id;
          setCopilotThreadId(thread.copilot_thread_id ?? crypto.randomUUID());
        } else {
          setActiveSessionId(sessionId);
          ensuredSessionIdRef.current = sessionId;
        }
      }

      const { messages } = (await res.json()) as { messages: ChatMessage[] };
      const profile = findBrandProfile(messages);
      if (profile) setBrandProfile(profile);
      return messages;
    },
    [
      setActiveSessionId,
      setBrandProfile,
      setCopilotThreadId,
      setSessionsEnabled,
      setThreads,
    ]
  );

  return {
    loading,
    sessionsEnabled,
    loadSessions,
    createSession,
    ensureSession,
    loadSession,
  };
}
