import type { PostAttempt } from "@/lib/types";

export function isAttemptMediaComplete(attempt: PostAttempt): boolean {
  const post = attempt.variants[0];
  if (!post) return false;

  if (post.format === "carousel") {
    const slides = post.slides ?? [];
    return slides.length > 0 && slides.every((slide) => Boolean(slide.imageUrl));
  }

  if (post.format === "diagram" || post.image) {
    return Boolean(post.image?.url);
  }

  return true;
}
