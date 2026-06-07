"use client";

import { BrandMateRenderMessage } from "@/components/chat/BrandMateRenderMessage";
import { CreateFlowStepper } from "@/components/create/CreateFlowStepper";
import { CreatePostSkeleton } from "@/components/create/CreatePostSkeleton";
import { GuidedChatMessages } from "@/components/create/GuidedChatMessages";
import { CreateFlowProvider, useCreateFlow } from "@/contexts/CreateFlowContext";
import { PostActionsProvider } from "@/contexts/PostActionsContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import { useGenerativeUI } from "@/hooks/useGenerativeUI";
import { usePostActions } from "@/hooks/usePostActions";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { hasApprovedPost } from "@/lib/sessions/approved-post";
import type { CreateFlowStage } from "@/lib/create-flow/stages";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const STAGE_CHAT_LABELS: Record<
  CreateFlowStage,
  { initial: string; placeholder: string }
> = {
  brand: {
    initial:
      "Welcome! Fill in your brand profile below — ask me if you need help with niche, voice, or audience.",
    placeholder: "Ask about your brand setup…",
  },
  post: {
    initial:
      "Use the form below to generate your post. I can help you refine the draft, explain feedback, or retry with lessons.",
    placeholder: "Ask me to help refine your draft…",
  },
  preview: {
    initial:
      "Review your draft below, then click Preview in feed to see it on LinkedIn.",
    placeholder: "Ask about your preview…",
  },
};

function CreatePostChatInner({
  onChatStarted,
}: {
  onChatStarted: () => void | Promise<void>;
}) {
  const { stage } = useCreateFlow();
  const postActions = usePostActions();
  useGenerativeUI();

  const labels = STAGE_CHAT_LABELS[stage];

  return (
    <PostActionsProvider value={postActions}>
      <div className="flex min-h-0 flex-1 flex-col">
        <CreateFlowStepper />
        <CopilotChat
          className="brandmate-guided-chat flex min-h-0 flex-1 flex-col"
          Messages={GuidedChatMessages}
          RenderMessage={BrandMateRenderMessage}
          onSubmitMessage={() => void onChatStarted()}
          instructions={labels.initial}
          labels={{
            title: "BrandMate Coach",
            initial: labels.initial,
            placeholder: labels.placeholder,
          }}
        />
      </div>
    </PostActionsProvider>
  );
}

function CreatePostChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const { copilotThreadId, loading: sessionsLoading } = useChatSessionContext();
  const { loadSession, ensureSession, loadSessions } = useSessionLoader();
  const { hydrateFromMessages } = useCreateFlow();
  const [ready, setReady] = useState(false);

  const handleChatStarted = useCallback(async () => {
    const sessionId = await ensureSession();
    if (sessionId && !sessionParam) {
      router.replace(`/create?session=${sessionId}`, { scroll: false });
    }
  }, [ensureSession, router, sessionParam]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setReady(false);
      if (sessionsLoading) {
        await loadSessions();
      }

      if (sessionParam) {
        const messages = await loadSession(sessionParam);
        if (hasApprovedPost(messages)) {
          router.replace(`/preview/${sessionParam}`);
          return;
        }
        hydrateFromMessages(messages);
      }

      if (!cancelled) {
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    sessionParam,
    loadSession,
    loadSessions,
    sessionsLoading,
    hydrateFromMessages,
    router,
  ]);

  if (!ready) {
    return <CreatePostSkeleton />;
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="shrink-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/brandmate-logo.png"
            alt="BrandMate"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg"
          />
          <div>
            <h1 className="text-sm font-semibold text-slate-900">New post</h1>
            <p className="text-xs text-slate-500">Guided create flow</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm font-medium text-linkedin hover:text-blue-700"
        >
          ← Back to posts
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col px-2 pb-2">
        <CopilotKit runtimeUrl="/api/copilotkit" threadId={copilotThreadId}>
          <CreatePostChatInner onChatStarted={handleChatStarted} />
        </CopilotKit>
      </div>
    </main>
  );
}

export function CreatePostChat() {
  return (
    <CreateFlowProvider>
      <CreatePostChatContent />
    </CreateFlowProvider>
  );
}
