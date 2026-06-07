"use client";

import { GeneratePostForm } from "@/components/forms/GeneratePostForm";
import { FormatPickerCard } from "@/components/generative/FormatPickerCard";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useCreateFlow } from "@/contexts/CreateFlowContext";
import { deriveGenerateValuesFromAttempt } from "@/lib/create-flow/derive-generate-values";
import {
  useCopilotAdditionalInstructions,
  useCopilotReadable,
  useHumanInTheLoop,
} from "@copilotkit/react-core";
import { useMemo } from "react";

const STAGE_INSTRUCTIONS = {
  post: `You are BrandMate in the post studio (Create post step).
- The user generates posts via the inline form in chat. Help them refine drafts conversationally.
- Chips and free-form chat are both available. Post-step chips: Retry with Judge feedback, Regenerate post, Explain judge score.
- Use retryWithJudgeFeedback when the user wants judge-driven retry; use regeneratePost to replay the same format/post type.
- When the user types revision notes in chat (e.g. "shorten the hook"), always pass them as userFeedback to regeneratePost or retryWithJudgeFeedback.
- Use submitHumanFeedback and storeLesson to capture lessons for future posts.
- Do not call approvePost until the user reaches Preview.
- Do not call collectPostRequest — the form is inline in chat.
- Profile onboarding is complete; do not ask for brand profile setup.
- For carousel posts: never call dispatchDiagramAgent. Carousels use the PNG slide pipeline only.
- For system diagram posts: use dispatchDiagramAgent only when the user chose Post with System Diagram in the inline form.`,
  preview: `You are BrandMate on Preview.
- The user reviews their draft inline and clicks "Preview in feed".
- Chips below the chat are the primary way to ask coaching questions on this step (no free-form text input).
- Encourage them to preview in the LinkedIn feed. Do not start new generation.`,
} as const;

export function useGenerativeUI(options?: { isGenerating?: boolean }) {
  const { brandProfile } = useBrandProfile();
  const { stage, lastAttempt } = useCreateFlow();
  const isGenerating = Boolean(options?.isGenerating);
  const hasExistingDraft = Boolean(lastAttempt?.variants?.length);
  const formInitialValues = useMemo(
    () =>
      lastAttempt ? deriveGenerateValuesFromAttempt(lastAttempt) : undefined,
    [lastAttempt]
  );

  const instructions = useMemo(
    () => STAGE_INSTRUCTIONS[stage],
    [stage]
  );

  useCopilotReadable({
    description: "Current guided create flow step",
    value: stage,
  });

  useCopilotAdditionalInstructions({
    instructions,
    available: "enabled",
  });

  useHumanInTheLoop({
    name: "collectPostRequest",
    description:
      "Fallback: show in-chat form for post request (primary path is inline form)",
    parameters: [],
    render: ({ status, respond }) => {
      if (status !== "executing" || !respond) return <></>;
      const hasProfile = Boolean(brandProfile.name && brandProfile.niche);
      return (
        <GeneratePostForm
          hasProfile={hasProfile}
          hasHandle={Boolean(brandProfile.handle?.trim())}
          hasProfileImage={Boolean(brandProfile.profileImageUrl)}
          initialValues={isGenerating ? undefined : formInitialValues}
          submitDisabled={hasExistingDraft && !isGenerating}
          readOnly={hasExistingDraft && !isGenerating}
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
