"use client";

import { GuidedStepInline } from "@/components/create/GuidedStepInline";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import type { Message } from "@copilotkit/shared";
import {
  useChatContext,
  type MessagesProps,
} from "@copilotkit/react-ui";
import { useEffect, useMemo, useRef } from "react";

function makeInitialMessages(
  initial: string | string[] | undefined
): Message[] {
  if (!initial) return [];

  if (Array.isArray(initial)) {
    return initial.map((message) => ({
      id: message,
      role: "assistant" as const,
      content: message,
    }));
  }

  return [
    {
      id: initial,
      role: "assistant",
      content: initial,
    },
  ];
}

function useScrollToBottom(messages: Message[]) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isUserScrollUpRef = useRef(false);

  const scrollToBottom = () => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      isProgrammaticScrollRef.current = true;
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }

    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      isUserScrollUpRef.current = scrollTop + clientHeight < scrollHeight;
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const mutationObserver = new MutationObserver(() => {
      if (!isUserScrollUpRef.current) {
        scrollToBottom();
      }
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, []);

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    isUserScrollUpRef.current = false;
    scrollToBottom();
  }, [userMessageCount]);

  return { messagesEndRef, messagesContainerRef };
}

export function GuidedChatMessages({
  inProgress,
  children,
  RenderMessage,
  AssistantMessage,
  UserMessage,
  ErrorMessage,
  ImageRenderer,
  onRegenerate,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  messageFeedback,
  markdownTagRenderers,
  chatError,
}: MessagesProps) {
  const { labels, icons } = useChatContext();
  const { messages: visibleMessages, interrupt } = useCopilotChatInternal();
  const initialMessages = useMemo(
    () => makeInitialMessages(labels.initial),
    [labels.initial]
  );
  const messages = [...initialMessages, ...visibleMessages];
  const { messagesContainerRef, messagesEndRef } = useScrollToBottom(messages);

  const LoadingIcon = () => (
    <span data-testid="copilot-loading-cursor">{icons.activityIcon}</span>
  );

  return (
    <div className="copilotKitMessages" ref={messagesContainerRef}>
      <div className="copilotKitMessagesContainer">
        <GuidedStepInline />
        {messages.map((message, index) => {
          const isCurrentMessage = index === messages.length - 1;
          return (
            <RenderMessage
              key={index}
              message={message}
              messages={messages}
              inProgress={inProgress}
              index={index}
              isCurrentMessage={isCurrentMessage}
              AssistantMessage={AssistantMessage}
              UserMessage={UserMessage}
              ImageRenderer={ImageRenderer}
              onRegenerate={onRegenerate}
              onCopy={onCopy}
              onThumbsUp={onThumbsUp}
              onThumbsDown={onThumbsDown}
              messageFeedback={messageFeedback}
              markdownTagRenderers={markdownTagRenderers}
            />
          );
        })}
        {inProgress &&
          (messages[messages.length - 1]?.role === "user" ||
            messages[messages.length - 1]?.role === "tool") && <LoadingIcon />}
        {interrupt}
        {chatError && ErrorMessage && (
          <ErrorMessage error={chatError} isCurrentMessage />
        )}
      </div>
      <footer className="copilotKitMessagesFooter" ref={messagesEndRef}>
        {children}
      </footer>
    </div>
  );
}
