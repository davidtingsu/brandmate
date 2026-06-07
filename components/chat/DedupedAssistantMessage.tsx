"use client";

import { dedupeRepeatedContent } from "@/lib/chat/dedupe-content";
import { AssistantMessage } from "@copilotkit/react-ui";
import type { AssistantMessageProps } from "@copilotkit/react-ui";

export function DedupedAssistantMessage(props: AssistantMessageProps) {
  const raw = props.message?.content ?? "";
  const content = typeof raw === "string" ? dedupeRepeatedContent(raw) : raw;

  if (!props.message) {
    return <AssistantMessage {...props} />;
  }

  return (
    <AssistantMessage
      {...props}
      message={{ ...props.message, content }}
    />
  );
}
