"use client";

import { BrandMateRenderMessage } from "@/components/chat/BrandMateRenderMessage";
import { ChipsOnlyInput } from "@/components/create/ChipsOnlyInput";
import { CreateFlowStepper } from "@/components/create/CreateFlowStepper";
import { StageSuggestionsList } from "@/components/create/StageSuggestionsList";
import { CreatePostSkeleton } from "@/components/create/CreatePostSkeleton";
import { GuidedChatMessages } from "@/components/create/GuidedChatMessages";
import { CreateFlowProvider, useCreateFlow } from "@/contexts/CreateFlowContext";
import { PostActionsProvider } from "@/contexts/PostActionsContext";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import { useGenerativeUI } from "@/hooks/useGenerativeUI";
import { usePostActions } from "@/hooks/usePostActions";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { hasApprovedPost } from "@/lib/sessions/approved-post";
import type { StudioFlowStage } from "@/lib/create-flow/stages";
import {
  getEnabledPostChips,
  stageChipsToSuggestions,
} from "@/lib/create-flow/stage-chips";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STAGE_CHAT_LABELS: Record<
  StudioFlowStage,
  { initial: string; placeholder: string }
> = {
  post: {
    initial:
      "Use the form below to generate your post. I can help you refine the draft, explain judge feedback, regenerate, or retry with judge feedback.",
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
  const { stage, lastAttempt } = useCreateFlow();
  const postActions = usePostActions();
  useGenerativeUI({
    isGenerating: Boolean(postActions.generationPreview?.active),
  });

  const labels = STAGE_CHAT_LABELS[stage];
  const suggestions = useMemo(() => {
    if (stage === "post") {
      return getEnabledPostChips(lastAttempt).map((chip) => ({
        title: chip.label,
        message: chip.message,
      }));
    }
    return stageChipsToSuggestions(stage);
  }, [stage, lastAttempt]);
  const Input = stage === "preview" ? ChipsOnlyInput : undefined;

  return (
    <PostActionsProvider value={postActions}>
      <div className="flex min-h-0 flex-1 flex-col">
        <CreateFlowStepper />
        <CopilotChat
          className="brandmate-guided-chat flex min-h-0 flex-1 flex-col"
          Messages={GuidedChatMessages}
          RenderMessage={BrandMateRenderMessage}
          Input={Input}
          RenderSuggestionsList={StageSuggestionsList}
          suggestions={suggestions}
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
  const { hasProfile } = useBrandProfile();
  const { copilotThreadId, sessionsLoadedOnce } = useChatSessionContext();
  const { loadSession, ensureSession, loadSessions } = useSessionLoader();
  const { hydrateFromMessages } = useCreateFlow();
  const [ready, setReady] = useState(false);
  const prevSessionParamRef = useRef<string | null>(null);
  const isReadyRef = useRef(false);

  const handleChatStarted = useCallback(async () => {
    const sessionId = await ensureSession();
    if (sessionId && !sessionParam) {
      router.replace(`/create?session=${sessionId}`, { scroll: false });
    }
  }, [ensureSession, router, sessionParam]);

  useEffect(() => {
    if (!hasProfile) {
      router.replace("/onboard?return=/create");
    }
  }, [hasProfile, router]);

  useEffect(() => {
    const prev = prevSessionParamRef.current;
    const skipHydrate = !prev && sessionParam && isReadyRef.current;
    prevSessionParamRef.current = sessionParam;

    if (skipHydrate) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setReady(false);
      if (!sessionsLoadedOnce) {
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
        isReadyRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    sessionParam,
    loadSession,
    loadSessions,
    sessionsLoadedOnce,
    hydrateFromMessages,
    router,
  ]);

  if (!hasProfile || !ready) {
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
            <p className="text-xs text-slate-500">Post studio</p>
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
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          threadId={copilotThreadId}
          useSingleEndpoint={false}
        >
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
