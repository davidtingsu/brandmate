"use client";

import { ProfileForm } from "@/components/forms/ProfileForm";
import { GeneratePostForm } from "@/components/forms/GeneratePostForm";
import { FormatPickerCard } from "@/components/generative/FormatPickerCard";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useCreateFlow } from "@/contexts/CreateFlowContext";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import type { BrandProfile } from "@/lib/types";
import {
  useCopilotAdditionalInstructions,
  useHumanInTheLoop,
} from "@copilotkit/react-core";
import { useCallback, useMemo } from "react";

const STAGE_INSTRUCTIONS = {
  brand: `You are BrandMate on Step 1 (Brand).
- The user completes their brand profile in the guided panel above. Do not discuss posts yet.
- Do not call collectBrandProfile or createPost. Profile is handled by the panel.
- Keep replies brief if the user asks questions about their brand setup.`,
  post: `You are BrandMate on Step 2 (Create post).
- The user generates posts via the guided panel. Help them refine drafts in chat.
- Use submitHumanFeedback, storeLesson, and retryWithLesson to iterate on the draft.
- Do not call approvePost until the user reaches Step 3 (Preview).
- Do not call collectBrandProfile or collectPostRequest — forms are in the guided panel.`,
  preview: `You are BrandMate on Step 3 (Preview).
- The user reviews their draft and clicks "Preview in feed" in the panel above.
- Encourage them to preview in the LinkedIn feed. Do not start new generation.`,
} as const;

export function useGenerativeUI() {
  const { brandProfile, setBrandProfile } = useBrandProfile();
  const { stage } = useCreateFlow();
  const { sessionsEnabled } = useChatSessionContext();
  const { ensureSession } = useSessionLoader();

  const persistProfile = useCallback(
    async (profile: BrandProfile) => {
      const sessionId = await ensureSession();
      if (!sessionId || !sessionsEnabled) return;
      await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: null,
          metadata: { type: "brand_profile", profile },
        }),
      });
    },
    [ensureSession, sessionsEnabled]
  );

  const instructions = useMemo(
    () => STAGE_INSTRUCTIONS[stage],
    [stage]
  );

  useCopilotAdditionalInstructions({
    instructions,
    available: "enabled",
  });

  useHumanInTheLoop({
    name: "collectBrandProfile",
    description:
      "Fallback: show in-chat form to collect brand profile (primary path is guided panel)",
    parameters: [],
    render: ({ status, respond }) => {
      if (status !== "executing" || !respond) return <></>;
      return (
        <ProfileForm
          compact
          initial={brandProfile}
          onSubmit={async (profile) => {
            setBrandProfile(profile);
            await persistProfile(profile);
            respond(profile);
          }}
        />
      );
    },
  });

  useHumanInTheLoop({
    name: "collectPostRequest",
    description:
      "Fallback: show in-chat form for post request (primary path is guided panel)",
    parameters: [],
    render: ({ status, respond }) => {
      if (status !== "executing" || !respond) return <></>;
      const hasProfile = Boolean(brandProfile.name && brandProfile.niche);
      return (
        <GeneratePostForm
          hasProfile={hasProfile}
          hasHandle={Boolean(brandProfile.handle?.trim())}
          hasProfileImage={Boolean(brandProfile.profileImageUrl)}
          onSubmit={async (values) => {
            respond(values);
          }}
        />
      );
    },
  });

  useHumanInTheLoop({
    name: "pickPostFormat",
    description:
      "Show format picker when the user has not specified text, image, or carousel",
    parameters: [
      {
        name: "topic",
        type: "string",
        description: "Post topic",
        required: false,
      },
    ],
    render: ({ status, respond, args }) => {
      if (status !== "executing" || !respond) return <></>;
      const topic = (args?.topic as string) ?? undefined;
      return (
        <FormatPickerCard
          topic={topic}
          onSelect={(choice) => {
            respond({
              topic,
              format: choice.format,
              includeImage: choice.includeImage,
              slideCount: choice.slideCount,
            });
          }}
        />
      );
    },
  });
}
