"use client";

import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { findBrandProfile } from "@/lib/sessions/approved-post";
import type { ChatMessage, ChatThread, GalleryThread } from "@/lib/types";
import { useCallback, useRef } from "react";

function newCopilotThreadId(): string {
  return crypto.randomUUID();
}

export function useSessionLoader() {
  const {
    activeSessionId,
    copilotThreadId,
    sessionsEnabled,
    loading,
    loadError,
    setThreads,
    setActiveSessionId,
    setCopilotThreadId,
    setSessionsEnabled,
    setLoading,
    setLoadError,
    setSessionsLoadedOnce,
  } = useChatSessionContext();
  const { setBrandProfile } = useBrandProfile();
  const ensureSessionPromiseRef = useRef<Promise<string | null> | null>(null);
  const ensuredSessionIdRef = useRef<string | null>(null);
  const loadSessionsSeqRef = useRef(0);

  const applySessionsResponse = useCallback(
    (data: { enabled?: boolean; threads?: GalleryThread[] }) => {
      setSessionsEnabled(Boolean(data.enabled));
      setThreads((data.threads ?? []) as GalleryThread[]);
      setLoadError(null);
      setSessionsLoadedOnce(true);
    },
    [setLoadError, setSessionsEnabled, setSessionsLoadedOnce, setThreads]
  );

  const loadSessions = useCallback(async (options?: { silent?: boolean }) => {
    const requestId = ++loadSessionsSeqRef.current;
    if (!options?.silent) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/sessions");
      const data = (await res.json()) as {
        enabled?: boolean;
        threads?: GalleryThread[];
        error?: string;
      };

      if (requestId !== loadSessionsSeqRef.current) return;

      if (!res.ok) {
        setLoadError(data.error ?? "Couldn't load saved posts");
        return;
      }

      applySessionsResponse(data);
    } catch {
      if (requestId !== loadSessionsSeqRef.current) return;
      setLoadError("Couldn't load saved posts");
    } finally {
      if (!options?.silent && requestId === loadSessionsSeqRef.current) {
        setLoading(false);
      }
    }
  }, [applySessionsResponse, setLoadError, setLoading]);

  const postSession = useCallback(
    async (threadId: string): Promise<string | null> => {
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
      setThreads((prev) => {
        if (prev.some((t) => t.id === thread.id)) return prev;
        return [thread as GalleryThread, ...prev];
      });
      await loadSessions({ silent: true });
      return thread.id;
    },
    [loadSessions, setActiveSessionId, setThreads]
  );

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (activeSessionId) return activeSessionId;
    if (ensuredSessionIdRef.current) return ensuredSessionIdRef.current;

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
  }, [activeSessionId, copilotThreadId, postSession]);

  const createSession = useCallback(async (): Promise<string | null> => {
    const newCopilotId = newCopilotThreadId();
    setCopilotThreadId(newCopilotId);
    return postSession(newCopilotId);
  }, [postSession, setCopilotThreadId]);

  const startNewDraft = useCallback(() => {
    setActiveSessionId(null);
    ensuredSessionIdRef.current = null;
    ensureSessionPromiseRef.current = null;
    setCopilotThreadId(newCopilotThreadId());
  }, [setActiveSessionId, setCopilotThreadId]);

  const loadSession = useCallback(
    async (sessionId: string): Promise<ChatMessage[]> => {
      const [messagesRes, threadsRes] = await Promise.all([
        fetch(`/api/sessions/${sessionId}/messages`),
        fetch("/api/sessions"),
      ]);
      if (!messagesRes.ok) return [];

      if (threadsRes.ok) {
        const data = (await threadsRes.json()) as {
          enabled?: boolean;
          threads?: GalleryThread[];
        };
        applySessionsResponse(data);
        const thread = (data.threads as ChatThread[] | undefined)?.find(
          (t) => t.id === sessionId
        );
        if (thread) {
          setActiveSessionId(thread.id);
          ensuredSessionIdRef.current = thread.id;
          setCopilotThreadId(thread.copilot_thread_id ?? newCopilotThreadId());
        } else {
          setActiveSessionId(sessionId);
          ensuredSessionIdRef.current = sessionId;
        }
      }

      const { messages } = (await messagesRes.json()) as {
        messages: ChatMessage[];
      };
      const profile = findBrandProfile(messages);
      if (profile) setBrandProfile(profile);
      return messages;
    },
    [
      applySessionsResponse,
      setActiveSessionId,
      setBrandProfile,
      setCopilotThreadId,
    ]
  );

  return {
    loading,
    sessionsEnabled,
    loadError,
    loadSessions,
    createSession,
    ensureSession,
    loadSession,
    startNewDraft,
  };
}
