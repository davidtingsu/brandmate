"use client";

import { ProfileForm } from "@/components/forms/ProfileForm";
import { GeneratePostForm } from "@/components/forms/GeneratePostForm";
import { FormatPickerCard } from "@/components/generative/FormatPickerCard";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import { BRANDMATE_COACH_DIAGRAM_DISPATCH } from "@/lib/agents/diagram-explainer-agent";
import type { BrandProfile } from "@/lib/types";
import {
  useCopilotAdditionalInstructions,
  useHumanInTheLoop,
} from "@copilotkit/react-core";
import { useCallback } from "react";

export function useGenerativeUI() {
  const { brandProfile, setBrandProfile } = useBrandProfile();
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

  useCopilotAdditionalInstructions({
    instructions: `You are BrandMate, a LinkedIn personal brand coach.
- Before generating a post, ensure the user has a brand profile. If missing, call collectBrandProfile.
- To start generation, call collectPostRequest to show the structured form in chat, then call createPost with the returned values.
- After generating, help the user refine with submitHumanFeedback, storeLesson, and retryWithLesson.
- When the user is happy, tell them to click "Preview in feed" on the approve card.
- Formats: text, text with image (includeImage true), carousel (format carousel, slideCount 5-10).
- Support handle and profileImageUrl on the brand profile.

${BRANDMATE_COACH_DIAGRAM_DISPATCH}`,
    available: brandProfile.name && brandProfile.niche ? "enabled" : "enabled",
  });

  useHumanInTheLoop({
    name: "collectBrandProfile",
    description:
      "Show an in-chat form to collect the user's LinkedIn brand profile (name, niche, audience, voice, handle, photo)",
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
      "Show an in-chat form to collect post topic, format (text/image/carousel), slide count, and branding toggles",
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
