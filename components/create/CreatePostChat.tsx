"use client";

import { BrandMateRenderMessage } from "@/components/chat/BrandMateRenderMessage";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import { useDiagramAgent } from "@/hooks/useDiagramAgent";
import { useGenerativeUI } from "@/hooks/useGenerativeUI";
import { usePostActions } from "@/hooks/usePostActions";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function CreatePostChatInner() {
  usePostActions();
  useGenerativeUI();
  useDiagramAgent();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CopilotChat
        className="flex min-h-0 flex-1 flex-col"
        RenderMessage={BrandMateRenderMessage}
        labels={{
          title: "BrandMate Coach",
          initial:
            "Tell me about your brand, ask for a LinkedIn post, or ask me to explain how something works — I'll dispatch a diagram agent for technical concepts.",
        }}
      />
    </div>
  );
}

export function CreatePostChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const { copilotThreadId } = useChatSessionContext();
  const { loadSession, createSession, loadSessions } = useSessionLoader();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setReady(false);
      await loadSessions();

      if (sessionParam) {
        await loadSession(sessionParam);
      } else {
        const sessionId = await createSession();
        if (sessionId) {
          router.replace(`/create?session=${sessionId}`);
          return;
        }
      }

      if (!cancelled) {
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionParam, loadSession, createSession, loadSessions, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading chat…
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
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
            <p className="text-xs text-slate-500">Copilot coaching session</p>
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

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-2 pb-4">
        <CopilotKit runtimeUrl="/api/copilotkit" threadId={copilotThreadId}>
          <CreatePostChatInner />
        </CopilotKit>
      </div>
    </main>
  );
}
