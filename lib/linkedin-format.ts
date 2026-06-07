import type {
  CarouselSlide,
  LinkedInPost,
  PostFormat,
  PostImage,
  PostType,
} from "./types";

export function formatPostForDisplay(post: LinkedInPost): string {
  const tags = post.hashtags
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join(" ");
  const parts = [post.hook, "", post.body, "", post.cta, "", tags].filter(
    Boolean
  );
  if (post.format === "carousel" && post.slides?.length) {
    const slideText = post.slides
      .map((s) => `Slide ${s.index + 1}: ${s.title}\n${s.body}`)
      .join("\n\n");
    parts.push("", "--- Carousel slides ---", slideText);
  }
  return parts.join("\n");
}

export function computeCharacterCount(parts: {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}): number {
  const tags = parts.hashtags.join(" ");
  return [parts.hook, parts.body, parts.cta, tags].join(" ").length;
}

export function buildLinkedInPost(raw: {
  hook: string;
  body: string;
  cta?: string;
  hashtags?: string[];
  postType: string;
  format?: PostFormat;
  image?: PostImage;
  slides?: CarouselSlide[];
}): LinkedInPost {
  const hashtags = raw.hashtags ?? [];
  const cta = raw.cta ?? "";
  const format = raw.format ?? "text";
  return {
    format,
    hook: raw.hook,
    body: raw.body,
    cta,
    hashtags,
    postType: raw.postType as PostType,
    characterCount: computeCharacterCount({
      hook: raw.hook,
      body: raw.body,
      cta,
      hashtags,
    }),
    image: raw.image,
    slides: raw.slides,
  };
}

export function buildCarouselSlides(
  slides: Array<{ title: string; body: string }>
): CarouselSlide[] {
  return slides.map((s, index) => ({
    index,
    title: s.title,
    body: s.body,
  }));
}
