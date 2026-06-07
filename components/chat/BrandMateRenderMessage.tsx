"use client";

import { dedupeRepeatedContent } from "@/lib/chat/dedupe-content";
import {
  ImageRenderer,
  UserMessage,
  type RenderMessageProps,
} from "@copilotkit/react-ui";
import { DedupedAssistantMessage } from "./DedupedAssistantMessage";

/** Skip back-to-back identical assistant bubbles from connect replay. */
function isDuplicateAssistantBubble(props: RenderMessageProps): boolean {
  if (props.message.role !== "assistant") return false;

  const prev = props.messages[props.index - 1];
  if (prev?.role !== "assistant") return false;

  const current =
    typeof props.message.content === "string"
      ? dedupeRepeatedContent(props.message.content)
      : "";
  const previous =
    typeof prev.content === "string" ? dedupeRepeatedContent(prev.content) : "";

  return current.length > 0 && current === previous;
}

export function BrandMateRenderMessage(props: RenderMessageProps) {
  if (isDuplicateAssistantBubble(props)) return null;

  const {
    message,
    messages,
    inProgress,
    index,
    isCurrentMessage,
    onRegenerate,
    onCopy,
    onThumbsUp,
    onThumbsDown,
    messageFeedback,
    markdownTagRenderers,
  } = props;

  if (message.role === "user") {
    return (
      <UserMessage
        key={index}
        rawData={message}
        data-message-role="user"
        message={message}
        ImageRenderer={ImageRenderer}
      />
    );
  }

  if (message.role === "assistant") {
    return (
      <DedupedAssistantMessage
        key={index}
        data-message-role="assistant"
        subComponent={message.generativeUI?.()}
        rawData={message}
        message={message}
        messages={messages}
        isLoading={inProgress && isCurrentMessage && !message.content}
        isGenerating={inProgress && isCurrentMessage && !!message.content}
        isCurrentMessage={isCurrentMessage}
        onRegenerate={() => onRegenerate?.(message.id)}
        onCopy={onCopy}
        onThumbsUp={onThumbsUp}
        onThumbsDown={onThumbsDown}
        feedback={messageFeedback?.[message.id] ?? null}
        markdownTagRenderers={markdownTagRenderers}
        ImageRenderer={ImageRenderer}
      />
    );
  }

  return null;
}
