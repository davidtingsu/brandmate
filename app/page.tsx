"use client";

import { usePostActions } from "@/hooks/usePostActions";
import { CopilotChat } from "@copilotkit/react-ui";

export default function HomePage() {
  usePostActions();

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">BrandMate</h1>
        <p className="text-sm text-slate-600">
          Your LinkedIn brand coach that learns from every draft
        </p>
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <CopilotChat
          className="min-h-[calc(100vh-8rem)] rounded-xl border border-slate-200 bg-white shadow-sm"
          labels={{
            title: "BrandMate Coach",
            initial:
              "Hi! I'm your LinkedIn brand coach. Tell me about yourself — name, niche, audience, and voice — then ask me to write a post. I'll learn from your feedback and improve each draft.",
            placeholder: "e.g. Write a post about my transition from engineer to founder",
          }}
          instructions={`You are BrandMate, a LinkedIn personal brand coach. Help users grow their personal brand.

Workflow:
1. If no brand profile, ask for name, niche, audience, voice — then call setBrandProfile.
2. When user wants a post, call createPost with their topic.
3. When user gives feedback (too generic, on brand, etc.), call submitHumanFeedback then offer to storeLesson.
4. When user says "retry", call retryWithLesson with the same topic.
5. When user wants to copy, call copyPost.

Post types: story, insight, lesson, milestone, hot_take.
Be concise and encouraging. Everything renders as cards in chat.`}
        />
      </div>
    </main>
  );
}
