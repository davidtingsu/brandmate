"use client";

import { BrandHeader } from "@/components/BrandHeader";
import { BrandMateRenderMessage } from "@/components/chat/BrandMateRenderMessage";
import { ChatSessionSidebar } from "@/components/chat/ChatSessionSidebar";
import { GenerativeCardReplay } from "@/components/generative/GenerativeCardReplay";
import {
  ChatSessionProvider,
  useChatSessionContext,
} from "@/contexts/ChatSessionContext";
import { useGenerativeUI } from "@/hooks/useGenerativeUI";
import { usePostActions } from "@/hooks/usePostActions";
import type { BrandProfile, ChatMessage, ChatThread } from "@/lib/types";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_PROFILE: BrandProfile = {
  name: "",
  niche: "",
  audience: "",
  voice: "",
};

function BrandMateChatInner({
  brandProfile,
  setBrandProfile,
  restoredMetadata,
  copilotThreadId,
  onNewChat,
  onSelectThread,
}: {
  brandProfile: BrandProfile;
  setBrandProfile: React.Dispatch<React.SetStateAction<BrandProfile>>;
  restoredMetadata: Record<string, unknown>[];
  copilotThreadId: string;
  onNewChat: () => void;
  onSelectThread: (thread: ChatThread) => void;
}) {
  usePostActions(brandProfile, setBrandProfile);
  useGenerativeUI(brandProfile);

  return (
    <main className="flex min-h-screen flex-col">
      <BrandHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <ChatSessionSidebar
          onNewChat={onNewChat}
          onSelectThread={onSelectThread}
        />
        <div className="flex min-w-0 flex-1 flex-col px-4 py-6">
          {restoredMetadata.length > 0 && (
            <div className="mb-4 space-y-2">
              {restoredMetadata.map((meta, i) => (
                <GenerativeCardReplay
                  key={i}
                  metadata={meta}
                  brandProfile={brandProfile}
                />
              ))}
            </div>
          )}
          <CopilotChat
            key={copilotThreadId}
            className="min-h-[calc(100vh-10rem)] rounded-xl border border-slate-200 bg-white shadow-sm"
            RenderMessage={BrandMateRenderMessage}
            labels={{
              title: "BrandMate Coach",
              initial:
                "Hi! I'm your LinkedIn brand coach. Tell me about yourself — name, niche, audience, and voice — then ask me to write a post. I'll learn from your feedback and improve each draft.",
              placeholder:
                "e.g. Write a carousel about my transition from engineer to founder",
            }}
            instructions={`You are BrandMate, a LinkedIn personal brand coach. Help users grow their personal brand.

Workflow:
1. If no brand profile, ask for name, niche, audience, voice — then call setBrandProfile.
2. When user wants a post, call createPost with their topic and format.
3. If format unclear, call pickPostFormat (HITL) before createPost.
4. When user gives feedback (too generic, on brand, etc.), call submitHumanFeedback then offer to storeLesson.
5. When user says "retry", call retryWithLesson with the same topic.
6. When user wants to copy, call copyPost.

Formats:
- text: caption only
- text + image: "Post with Image" (includeImage=true)
- carousel: multi-slide post (slideCount 5-10)

Post types: story, insight, lesson, milestone, hot_take.
Be concise and encouraging. Everything renders as cards in chat.`}
          />
        </div>
      </div>
    </main>
  );
}

function BrandMateChat() {
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(DEFAULT_PROFILE);
  const [restoredMetadata, setRestoredMetadata] = useState<
    Record<string, unknown>[]
  >([]);

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

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleNewChat = useCallback(async () => {
    const newCopilotId = crypto.randomUUID();
    setCopilotThreadId(newCopilotId);
    setRestoredMetadata([]);
    setActiveSessionId(null);

    if (sessionsEnabled) {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New chat",
          copilotThreadId: newCopilotId,
        }),
      });
      if (res.ok) {
        const { thread } = await res.json();
        setActiveSessionId(thread.id);
        await loadSessions();
      }
    }
  }, [
    loadSessions,
    sessionsEnabled,
    setActiveSessionId,
    setCopilotThreadId,
  ]);

  const handleSelectThread = useCallback(
    async (thread: ChatThread) => {
      setActiveSessionId(thread.id);
      setCopilotThreadId(thread.copilot_thread_id ?? crypto.randomUUID());
      setRestoredMetadata([]);

      const res = await fetch(`/api/sessions/${thread.id}/messages`);
      if (!res.ok) return;
      const { messages } = (await res.json()) as { messages: ChatMessage[] };
      const meta = messages
        .filter((m) => m.metadata?.type === "post_attempt")
        .map((m) => m.metadata);
      setRestoredMetadata(meta);

      const profileMeta = messages.find(
        (m) => m.metadata?.type === "brand_profile"
      );
      if (profileMeta?.metadata?.profile) {
        setBrandProfile(profileMeta.metadata.profile as BrandProfile);
      }
    },
    [setActiveSessionId, setCopilotThreadId]
  );

  const initializedRef = useRef(false);
  useEffect(() => {
    if (loading || initializedRef.current) return;
    if (sessionsEnabled && !activeSessionId) {
      initializedRef.current = true;
      void handleNewChat();
    } else if (!sessionsEnabled) {
      initializedRef.current = true;
    }
  }, [loading, sessionsEnabled, activeSessionId, handleNewChat]);

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="default"
      useSingleEndpoint={false}
      threadId={copilotThreadId}
    >
      <BrandMateChatInner
        brandProfile={brandProfile}
        setBrandProfile={setBrandProfile}
        restoredMetadata={restoredMetadata}
        copilotThreadId={copilotThreadId}
        onNewChat={() => void handleNewChat()}
        onSelectThread={(t) => void handleSelectThread(t)}
      />
    </CopilotKit>
  );
}

export default function BrandMateApp() {
  return (
    <ChatSessionProvider>
      <BrandMateChat />
    </ChatSessionProvider>
  );
}
