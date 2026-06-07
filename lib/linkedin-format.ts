import type {
  CarouselSlide,
  CarouselSlideLayout,
  LinkedInPost,
  PostFormat,
  PostImage,
  PostType,
} from "./types";

const VALID_LAYOUTS: CarouselSlideLayout[] = [
  "portrait_cover",
  "portrait_cta",
  "portrait_all",
  "template_content",
  "split_before_after",
];

export function normalizeSlideLayout(
  layout: string | undefined,
  index: number,
  total: number,
  hasPortrait: boolean
): CarouselSlideLayout {
  if (layout && VALID_LAYOUTS.includes(layout as CarouselSlideLayout)) {
    return layout as CarouselSlideLayout;
  }
  if (index === 0 && hasPortrait) return "portrait_cover";
  if (index === total - 1 && hasPortrait) return "portrait_cta";
  if (index % 2 === 1) return "split_before_after";
  return "template_content";
}

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
  slides: Array<{ title: string; body: string; layout?: string }>,
  hasPortrait = false
): CarouselSlide[] {
  const total = slides.length;
  return slides.map((s, index) => ({
    index,
    title: s.title,
    body: s.body,
    layout: normalizeSlideLayout(s.layout, index, total, hasPortrait),
    pngStatus: "pending" as const,
  }));
}
