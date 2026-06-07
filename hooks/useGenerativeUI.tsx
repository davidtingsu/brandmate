"use client";

import { FormatPickerCard } from "@/components/generative/FormatPickerCard";
import type { BrandProfile } from "@/lib/types";
import { useHumanInTheLoop } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";

export function useGenerativeUI(brandProfile: BrandProfile) {
  const hasProfile = Boolean(brandProfile.name && brandProfile.niche);

  useCopilotChatSuggestions(
    {
      available: hasProfile ? "after-first-message" : "before-first-message",
      suggestions: hasProfile
        ? [
            { title: "Write a carousel", message: "Write a carousel post for me" },
            {
              title: "Post with image",
              message: "Write a text post with an image for me",
            },
            { title: "Text post", message: "Write a text-only LinkedIn post" },
          ]
        : [
            {
              title: "Set up my brand",
              message:
                "Help me set up my brand profile — name, niche, audience, and voice",
            },
          ],
    },
    [hasProfile]
  );

  useHumanInTheLoop({
    name: "pickPostFormat",
    description:
      "Ask the user to pick LinkedIn post format when unclear: Text, Post with Image, or Carousel. Call before createPost when format is ambiguous.",
    parameters: [
      {
        name: "topic",
        type: "string",
        description: "Post topic",
        required: true,
      },
    ],
    render: ({ status, args, respond }) => {
      if (status !== "executing" || !respond) return <></>;
      return (
        <FormatPickerCard
          topic={args.topic as string}
          onSelect={(choice) => respond(choice)}
        />
      );
    },
  });
}
