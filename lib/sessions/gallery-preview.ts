import { summarizePostTitle } from "@/lib/sessions/summarize-title";
import type {
  ChatThread,
  GalleryThreadPreview,
  LinkedInPost,
  PostAttempt,
} from "@/lib/types";

const GENERIC_TITLES = new Set(["New chat", "Untitled post", ""]);

export function getFirstPostImage(post: LinkedInPost): string | undefined {
  if (post.format === "carousel" && post.slides?.length) {
    return (
      post.slides.find((slide) => slide.imageUrl)?.imageUrl ??
      post.slides[0]?.imageUrl
    );
  }
  return post.image?.url;
}

export function getPreviewText(post: LinkedInPost, maxLen = 80): string | undefined {
  const source = post.hook?.trim() || post.body?.trim();
  if (!source) return undefined;
  if (source.length <= maxLen) return source;
  const truncated = source.slice(0, maxLen).replace(/\s+\S*$/, "");
  return `${truncated}…`;
}

export function resolveDisplayTitle(
  thread: ChatThread,
  attempt?: PostAttempt
): string {
  if (attempt?.topic) {
    return summarizePostTitle(attempt.topic);
  }
  const title = thread.title?.trim();
  if (title && !GENERIC_TITLES.has(title)) {
    return title;
  }
  return "Untitled post";
}

export function buildThreadGalleryPreview(
  thread: ChatThread,
  attempt?: PostAttempt
): GalleryThreadPreview {
  const post = attempt?.variants?.[0];
  return {
    previewImageUrl: post ? getFirstPostImage(post) : undefined,
    displayTitle: resolveDisplayTitle(thread, attempt),
    previewText: post ? getPreviewText(post) : undefined,
  };
}
